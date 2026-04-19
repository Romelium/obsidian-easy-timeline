import { parseDate, strict } from 'chrono-node';
import { App, debounce, Editor, getFrontMatterInfo, MarkdownRenderChild, MarkdownView, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import { renderTimeline, TimelineData } from 'src/renderTimeline';
import { extractVariedMetadata, extractInlineMetadata } from 'utils';

interface EasyTimelineSettings {
	useRegex: boolean,
	reference: string;
	sort: 'asc' | 'desc',
	singleLine: boolean,
	defaultReferenceType: 'ctime' | 'mtime',
}

const DEFAULT_SETTINGS: EasyTimelineSettings = {
	useRegex: false,
	reference: 'created',
	sort: 'asc',
	singleLine: false,
	defaultReferenceType: 'ctime',
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
			const file = this.app.vault.getAbstractFileByPath(sourcePath);
			if (!(file instanceof TFile)) return;

			const render = async (currentText?: string) => {
				const sectionInfo = ctx.getSectionInfo(el);
				const text = currentText ?? sectionInfo?.text ?? await this.app.vault.cachedRead(file);

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
						const sourceBlockRegex = new RegExp("(`{3,}|~{3,})" + language + "(?:[ \\t]*)\\r?\\n" + (source ? escapedSource + "(?:[ \\t]*)\\r?\\n" : "") + "\\1", "g");
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
				const reference = metadataReference ?? (await this.findReference(file));

				// Get timeline object representation
				const timeline = contentToParse
					.split(this.settings.singleLine ? /\r?\n/ : /(?:\r?\n){2,}/) // Split content into lines and process dates for each lines
					.map(line => {
						return {
							details: line.trim(),
							date: parseDate(line, reference)
						};
					})
					.filter(value => value.date != null) as TimelineData; // Don't include lines with no valid dates

				// Render timeline
				const timelineEl = renderTimeline(timeline, sort as "asc" | "desc");
				el.empty();
				el.appendChild(timelineEl);
			};

			await render();

			const renderChild = new TimelineRenderChild(el, this, sourcePath, render);
			ctx.addChild(renderChild);
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
