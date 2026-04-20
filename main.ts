import { parse, strict } from 'chrono-node';
import { App, Component, debounce, Editor, getFrontMatterInfo, MarkdownRenderChild, MarkdownView, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import { renderTimeline, TimelineData } from 'src/renderTimeline';
import { extractInlineMetadata, extractVariedMetadata } from 'utils';

interface EasyTimelineSettings {
	useRegex: boolean,
	reference: string;
	sort: 'asc' | 'desc',
	singleLine: boolean,
	defaultReferenceType: 'ctime' | 'mtime',
	preserveTimezones: boolean,
	sortRelativeTimezone: boolean,
}

const DEFAULT_SETTINGS: EasyTimelineSettings = {
	useRegex: false,
	reference: 'created',
	sort: 'asc',
	singleLine: false,
	defaultReferenceType: 'ctime',
	preserveTimezones: false,
	sortRelativeTimezone: false,
}

export default class EasyTimelinePlugin extends Plugin {
	settings: EasyTimelineSettings;
	activeBlocks: Map<string, Set<TimelineRenderChild>> = new Map();

	/**
	* Retrieves the reference date for a file, using a regex pattern or a frontmatter property.
	* Defaults to the file's creation date if no valid reference is found.
	* 
	* @param file - The file to process.
	* @returns A Promise resolving to the reference date or a null for invalid regex in settings
	*/
	async findReference(file: TFile): Promise<Date> {
		// Default to file creation date or last modified date based on settings. Note: It can easily change due to external causes like syncing
		let ref = new Date(this.settings.defaultReferenceType === 'mtime' ? file.stat.mtime : file.stat.ctime);

		let regex: RegExp | null = null;
		// Check if regex is valid
		if (this.settings.useRegex) {
			try {
				regex = new RegExp(this.settings.reference);
			} catch (e) {
				return ref;
			}
		}

		// Process frontmatter to find reference
		const cache = this.app.metadataCache.getFileCache(file);
		const frontmatter = cache?.frontmatter;

		if (frontmatter) {
			let refProp = null;

			// Parse date using the reference or default value. 
			const parseDateValue = (value: string) => strict.parseDate(value, ref);

			if (regex) {
				let found = false;

				// Search for matching key with regex
				for (const [key, value] of Object.entries(frontmatter)) {
					if (regex.test(key)) {
						found = true;
						if (typeof value === 'string') {
							refProp = parseDateValue(value);
						}
						break;
					}
				}

				if (found && !refProp) console.log('Invalid reference');
			} else {
				// Check for a direct reference property
				if (frontmatter[this.settings.reference]) {
					if (typeof frontmatter[this.settings.reference] === 'string') {
						refProp = parseDateValue(frontmatter[this.settings.reference]);
					}
				}
			}

			// Use the found reference or fallback to file creation date
			if (refProp) ref = refProp;
		}

		return ref;
	}

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new EasyTimelineSettingTab(this.app, this));

		const language = 'timeline';
		this.registerMarkdownCodeBlockProcessor(language, async (source, el, ctx) => {
			const sourcePath = ctx.sourcePath;
			let file = this.app.vault.getAbstractFileByPath(sourcePath);
			if (!(file instanceof TFile)) return;

			let actualFile = file;
			const embedNode = el.closest('.internal-embed, .markdown-embed');
			if (embedNode) {
				const src = embedNode.getAttribute('src');
				if (src) {
					const linkpath = src.split('#')[0];
					if (linkpath) {
						const targetFile = this.app.metadataCache.getFirstLinkpathDest(linkpath, sourcePath);
						if (targetFile) {
							actualFile = targetFile;
						}
					}
				}
			}

			const renderChild = new TimelineRenderChild(el, this, actualFile.path, async () => {});
			ctx.addChild(renderChild);

			let markdownComponent = new Component();
			renderChild.addChild(markdownComponent);

			const render = async (currentText?: string) => {
				const sectionInfo = ctx.getSectionInfo(el);
				const text = currentText ?? sectionInfo?.text ?? await this.app.vault.cachedRead(actualFile);

				let languageLineMetadata: Record<string, string> = {};
				if (sectionInfo) {
					const lines = text.split(/\r?\n/);
					const languageLine = lines[sectionInfo.lineStart];
					if (languageLine) {
						const langRegex = /([a-zA-Z0-9_-]+)\s*[:=]\s*(?:"([^"]+)"|'([^']+)'|([^\s]+))/g;
						let match;
						while ((match = langRegex.exec(languageLine)) !== null) {
							const key = match[1].toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
							const value = match[2] || match[3] || match[4];
							languageLineMetadata[key] = value;
						}
					}
				}

				// Determine if source block is only metadata
				const isSourceMetadataOnly = source.trim() === '' || source.split(/\r?\n/).every(line => {
					const trimmed = line.trim();
					return trimmed === '' || /^(?:\[?(?:sort|reference)\s*::?\s*([^\[\]]+)\]?|(?:sort|reference)\s*:\s*(.+))$/i.test(trimmed);
				});

				let contentToParse = "";
				if (!isSourceMetadataOnly) {
					contentToParse = source.split(/\r?\n/).filter(line => {
						const trimmed = line.trim();
						return !/^(?:\[?(?:sort|reference)\s*::?\s*([^\[\]]+)\]?|(?:sort|reference)\s*:\s*(.+))$/i.test(trimmed);
					}).join('\n');
				} else {
					if (sectionInfo) {
						const lines = text.split(/\r?\n/);
						// Verify sectionInfo is still valid before splicing (prevents errors when typing above the block)
						const blockLines = lines.slice(sectionInfo.lineStart, sectionInfo.lineEnd + 1).join('\n');
						const expectedStart = new RegExp(`^(\`{3,}|~{3,})${language}`, 'm');
						if (!expectedStart.test(blockLines)) {
							return; // Stale sectionInfo, wait for Obsidian to trigger a native re-render
						}
						lines.splice(sectionInfo.lineStart, sectionInfo.lineEnd - sectionInfo.lineStart + 1);
						const textWithoutBlock = lines.join('\n');
						const { contentStart } = getFrontMatterInfo(textWithoutBlock);
						contentToParse = textWithoutBlock.slice(contentStart);
					} else {
						const { contentStart } = getFrontMatterInfo(text);
						const normalizedSource = source.replace(/\r\n/g, '\n');
						const escapedSource = normalizedSource.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\n/g, '(?:[ \\t]*)\\r?\\n');
						const sourceBlockRegex = new RegExp("(`{3,}|~{3,})" + language + "(?:.*)\\r?\\n" + (source ? escapedSource + "(?:[ \\t]*)\\r?\\n" : "") + "\\1", "g");
						contentToParse = text.slice(contentStart).replace(sourceBlockRegex, '');
					}

					// Remove any other timeline blocks to prevent recursion
					const allTimelineBlocksRegex = new RegExp("(`{3,}|~{3,})" + language + "(?:[ \\t].*)?\\r?\\n(?:[\\s\\S]*?(?:\\r?\\n))?\\1", "g");
					contentToParse = contentToParse.replace(allTimelineBlocksRegex, '');
				}

				// Extract inline metadata from contentToParse
				const inlineMetadataContent = extractInlineMetadata(contentToParse);
				
				// Remove inline [sort:: ...] and [reference:: ...] from contentToParse
				contentToParse = contentToParse.replace(/\[(?:sort|reference)\s*::?\s*[^\[\]]+\]/gi, '');

				// Get and process all metadata from source block
				const variedMetadata = extractVariedMetadata(source);
				const inlineMetadataSource = extractInlineMetadata(source);
				
				const metadata = { 
					...inlineMetadataContent, 
					...variedMetadata, 
					...inlineMetadataSource, 
					...languageLineMetadata 
				};

				const metadataReference = metadata.reference ? strict.parseDate(metadata.reference) : null;
				const metadataSortRaw = metadata.sort?.toLowerCase();
				const metadataSort = metadataSortRaw ? { ascending: 'asc', descending: 'desc' }[metadataSortRaw] || metadataSortRaw : null;
				const sort = ((metadataSort === 'asc' || metadataSort === 'desc') ? metadataSort : this.settings.sort);

				// find reference date in content
				const reference = metadataReference ?? (await this.findReference(actualFile));

				// Define common timezones so Chrono understands abbreviations
				const tzMap: Record<string, number> = {
					// North America
					NST: -210, NDT: -150,
					AST: -240, ADT: -180,
					EST: -300, EDT: -240,
					CST: -360, CDT: -300,
					MST: -420, MDT: -360,
					PST: -480, PDT: -420,
					AKST: -540, AKDT: -480,
					HST: -600, HDT: -540,
					HAST: -600, HADT: -540,
					// South America
					ART: -180,
					BOT: -240,
					BRT: -180, BRST: -120,
					CLT: -240, CLST: -180,
					COT: -300,
					ECT: -300,
					PET: -300,
					UYT: -180, UYST: -120,
					VET: -240,
					// Europe
					WET: 0, WEST: 60,
					CET: 60, CEST: 120,
					EET: 120, EEST: 180,
					BST: 60,
					MSK: 180,
					TRT: 180,
					// Africa
					WAT: 60,
					CAT: 120,
					EAT: 180,
					SAST: 120,
					// Asia
					IRST: 210, IRDT: 270,
					GST: 240,
					AFT: 270,
					PKT: 300,
					IST: 330,
					NPT: 345,
					BTT: 360,
					MMT: 390,
					ICT: 420,
					WIB: 420,
					WITA: 480,
					SGT: 480,
					HKT: 480,
					PHT: 480,
					MYT: 480,
					JST: 540, KST: 540,
					WIT: 540,
					// Australia
					AWST: 480, AWDT: 540,
					ACWST: 525,
					ACST: 570, ACDT: 630,
					AEST: 600, AEDT: 660,
					LHST: 630, LHDT: 660,
					// New Zealand & Pacific
					NZST: 720, NZDT: 780,
					CHAST: 765, CHADT: 825,
					FJT: 720, FJST: 780,
					PGT: 600,
					SBT: 660,
					SST: -660,
					CHUT: 600,
					// Universal
					GMT: 0, UTC: 0, Z: 0
				};

				// Get timeline object representation
				const timeline = contentToParse
					.split(this.settings.singleLine ? /\r?\n/ : /(?:\r?\n){2,}/) // Split content into lines and process dates for each lines
					.map(line => {
						const parseOptions = (this.settings.preserveTimezones || this.settings.sortRelativeTimezone) ? { timezones: tzMap } : undefined;
						const parsedResults = parse(line, reference, parseOptions);
						if (parsedResults.length === 0) return null;
						const result = parsedResults[0];
						
						const jsDate = result.date();
						let displayDate = jsDate;
						let sortDate = jsDate;
						
						if (this.settings.preserveTimezones || this.settings.sortRelativeTimezone) {
							const year = result.start.get('year') ?? jsDate.getFullYear();
							const month = result.start.get('month') ? result.start.get('month')! - 1 : jsDate.getMonth();
							const day = result.start.get('day') ?? jsDate.getDate();
							const hour = result.start.get('hour') ?? jsDate.getHours();
							const minute = result.start.get('minute') ?? jsDate.getMinutes();
							const second = result.start.get('second') ?? jsDate.getSeconds();
							const localDate = new Date(year, month, day, hour, minute, second);
							
							if (this.settings.preserveTimezones) {
								displayDate = localDate;
							}
							if (this.settings.sortRelativeTimezone) {
								sortDate = localDate;
							}
						}

						return {
							details: line.trim(),
							date: jsDate,
							displayDate: displayDate,
							sortDate: sortDate,
							hasTime: result.start.isCertain('hour') || result.start.isCertain('minute') || result.start.isCertain('second'),
							dateText: result.text
						};
					})
					.filter(value => value != null) as TimelineData; // Don't include lines with no valid dates

				markdownComponent.unload();
				renderChild.removeChild(markdownComponent);
				markdownComponent = new Component();
				renderChild.addChild(markdownComponent);

				// Render timeline
				const timelineEl = await renderTimeline(timeline, sort as "asc" | "desc", this.settings.sortRelativeTimezone, actualFile.path, markdownComponent);
				el.empty();
				el.appendChild(timelineEl);
			};
			renderChild.renderFn = render;

			await render();
		});

		const debouncedEditorChange = debounce((editor: Editor, info: MarkdownView | any) => {
			if (info?.file) {
				const blocks = this.activeBlocks.get(info.file.path);
				if (blocks) {
					const currentText = editor.getValue();
					for (const block of blocks) {
						block.renderFn(currentText);
					}
				}
			}
		}, 300, true);

		this.registerEvent(this.app.workspace.on('editor-change', debouncedEditorChange));

		this.registerEvent(this.app.metadataCache.on('changed', (file, data, cache) => {
			const blocks = this.activeBlocks.get(file.path);
			if (blocks) {
				for (const block of blocks) {
					block.renderFn(data);
				}
			}
		}));

		this.registerEvent(this.app.vault.on('rename', (file, oldPath) => {
			const blocks = this.activeBlocks.get(oldPath);
			if (blocks) {
				this.activeBlocks.set(file.path, blocks);
				this.activeBlocks.delete(oldPath);
				for (const block of blocks) {
					block.sourcePath = file.path;
				}
			}
		}));

		this.registerEvent(this.app.vault.on('delete', (file) => {
			this.activeBlocks.delete(file.path);
		}));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		for (const blocks of this.activeBlocks.values()) {
			for (const block of blocks) {
				block.renderFn();
			}
		}
	}
}

class EasyTimelineSettingTab extends PluginSettingTab {
	plugin: EasyTimelinePlugin;

	constructor(app: App, plugin: EasyTimelinePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// Setting for 'Use Regex'
		new Setting(containerEl)
			.setName('Use Regex')
			.setDesc('If enabled, the reference setting will use regex to pick which property to use as the reference for dates based on the first regex match.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.useRegex)
				.onChange(async (value) => {
					this.plugin.settings.useRegex = value;
					await this.plugin.saveSettings();
				})
			);

		// Setting for 'Reference'
		new Setting(containerEl)
			.setName('Reference')
			.setDesc('Specify the property name or regex to find which property to use as the reference for dates, if available.')
			.addText(text => text
				.setPlaceholder('Enter tag (no hashtag #) or regex')
				.setValue(this.plugin.settings.reference)
				.onChange(async (value) => {
					this.plugin.settings.reference = value;
					await this.plugin.saveSettings();
				})
			);

		// Setting for 'Default Reference Date'
		new Setting(containerEl)
			.setName('Default Reference Date')
			.setDesc('The file date to use as the default reference if no property is found.')
			.addDropdown(toggle => toggle.addOptions({ ctime: 'Creation Date', mtime: 'Last Modified Date' })
				.setValue(this.plugin.settings.defaultReferenceType)
				.onChange(async (value) => {
					this.plugin.settings.defaultReferenceType = value as 'ctime' | 'mtime';
					await this.plugin.saveSettings();
				})
			);

		// Setting for 'Sorting'
		new Setting(containerEl)
			.setName('Sorting')
			.setDesc('The sorting to be used if not specified in source block')
			.addDropdown(toggle => toggle.addOptions({ asc: 'Ascending', desc: 'Descending' })
				.setValue(this.plugin.settings.sort)
				.onChange(async (value) => {
					this.plugin.settings.sort = value as 'asc' | 'desc';
					await this.plugin.saveSettings();
				})
			);

		// Setting for 'Use single line'
		new Setting(containerEl)
			.setName('Use single line')
			.setDesc('If sections are separated by single lines instead of double lines')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.singleLine)
				.onChange(async (value) => {
					this.plugin.settings.singleLine = value;
					await this.plugin.saveSettings();
				})
			);

		// Setting for 'Preserve Timezones'
		new Setting(containerEl)
			.setName('Preserve Timezones')
			.setDesc('If enabled, the timeline will display the exact date and time written in the text, respecting timezones like (EST) or (JST). By default, it sorts events by their absolute global time.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.preserveTimezones)
				.onChange(async (value) => {
					this.plugin.settings.preserveTimezones = value;
					await this.plugin.saveSettings();
				})
			);

		// Setting for 'Sort Relative to Timezone'
		new Setting(containerEl)
			.setName('Sort Relative to Timezone')
			.setDesc('If enabled, the timeline will sort events by their local time (ignoring timezone differences) instead of their absolute global time.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.sortRelativeTimezone)
				.onChange(async (value) => {
					this.plugin.settings.sortRelativeTimezone = value;
					await this.plugin.saveSettings();
				})
			);
	}
}

class TimelineRenderChild extends MarkdownRenderChild {
	constructor(
		containerEl: HTMLElement,
		private plugin: EasyTimelinePlugin,
		public sourcePath: string,
		public renderFn: (text?: string) => Promise<void>
	) {
		super(containerEl);
	}

	onload() {
		let blocks = this.plugin.activeBlocks.get(this.sourcePath);
		if (!blocks) {
			blocks = new Set();
			this.plugin.activeBlocks.set(this.sourcePath, blocks);
		}
		blocks.add(this);
	}

	onunload() {
		const blocks = this.plugin.activeBlocks.get(this.sourcePath);
		if (blocks) {
			blocks.delete(this);
			if (blocks.size === 0) {
				this.plugin.activeBlocks.delete(this.sourcePath);
			}
		}
	}
}
