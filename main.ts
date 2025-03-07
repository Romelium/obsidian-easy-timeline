import { parse, parseDate, strict } from 'chrono-node';
import { App, getFrontMatterInfo, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import { renderTimeline, TimelineData } from 'src/renderTimeline';
import { extractVariedMetadata } from 'utils';

interface EasyTimelineSettings {
	useRegex: boolean,
	reference: string;
	sort: 'asc' | 'desc',
	singleLine: boolean,
}

const DEFAULT_SETTINGS: EasyTimelineSettings = {
	useRegex: false,
	reference: 'created',
	sort: 'asc',
	singleLine: false,
}

export default class EasyTimelinePlugin extends Plugin {
	settings: EasyTimelineSettings;

	/**
	* Retrieves the reference date for a file, using a regex pattern or a frontmatter property.
	* Defaults to the file's creation date if no valid reference is found.
	* 
	* @param file - The file to process.
	* @returns A Promise resolving to the reference date or a null for invalid regex in settings
	*/
	async findReference(file: TFile): Promise<Date> {
		// Default to file creation date. Note: It can easily change due to external causes like syncing
		let ref = new Date(file.stat.ctime);

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
		await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
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

				// if (!found) console.log('No matching property');
				if (found && !refProp) console.log('Invalid reference');
			} else {
				// Check for a direct reference property
				if (frontmatter[this.settings.reference]) {
					refProp = parseDateValue(frontmatter[this.settings.reference]);
				} else {
					// console.log('No matching property');
				}
			}

			// Use the found reference or fallback to file creation date
			if (refProp) ref = refProp;
			// else console.log('Using file created timestamp');
		});

		return ref;
	}

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new EasyTimelineSettingTab(this.app, this));

		const language = 'timeline';
		this.registerMarkdownCodeBlockProcessor(language, async (source, el, ctx) => {
			// Get active file
			const file = this.app.workspace.getActiveFile();
			if (!file) return;  // Exit if no file

			// Read file content
			const text = await this.app.vault.read(file);

			// Get and process all metadata from source block
			const metadata = extractVariedMetadata(source);
			const metadataReference = metadata.reference ? strict.parseDate(metadata.reference) : null;
			const metadataSort = metadata.sort ? { ascending: 'asc', descending: 'desc' }[metadata.sort.toLowerCase()] || metadata.sort : null;
			const sort = ((metadataSort === 'asc' || metadataSort === 'desc') ? metadataSort : this.settings.sort);

			// Remove frontmatter and source block from file content
			let { contentStart } = getFrontMatterInfo(text);
			const sourceBlock = "```" + language + "\n" + source + "\n```";
			const content = source.length != 0 && Object.keys(metadata).length === 0 ? source : text;

			// find reference date in content
			const reference = metadataReference ?? (await this.findReference(file));

			// Get timeline object representation
			const timeline = content.slice(contentStart).replace(sourceBlock, '')
				.split(this.settings.singleLine ? '\n' : '\n\n') // Split content into lines and process dates for each lines
				.map(line => {
					return {
						details: line.trim(),
						date: parseDate(line, reference)
					};
				})
				.filter(value => value.date != null) as TimelineData // Don't include lines with no valid dates

			// Render timeline
			const timelineEl = renderTimeline(timeline, sort as "asc" | "desc",);
			el.replaceWith(timelineEl)
		});
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

		// Setting for 'Sorting'
		new Setting(containerEl)
			.setName('Sorting')
			.setDesc('The sorting to be used if not specified in source block')
			.addDropdown(toggle => toggle.addOptions({ asc: 'Ascending', desc: ' Descending' })
				.setValue(this.plugin.settings.sort)
				.onChange(async (value) => {
					this.plugin.settings.sort = value as 'asc' | 'desc';
					await this.plugin.saveSettings();
				})
			);

		// Setting for 'Use single line'
		new Setting(containerEl)
			.setName('Use single line')
			.setDesc('If sections are seperated by single lines instead of double lines')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.singleLine)
				.onChange(async (value) => {
					this.plugin.settings.singleLine = value;
					await this.plugin.saveSettings();
				})
			);
	}
}
