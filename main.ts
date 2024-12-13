import { parse, parseDate } from 'chrono-node';
import { App, getFrontMatterInfo, MarkdownView, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';

// Remember to rename these classes and interfaces!

interface EasyTimelineSettings {
	useRegex: boolean,
	reference: string;
}

const DEFAULT_SETTINGS: EasyTimelineSettings = {
	useRegex: false,
	reference: 'created'
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
	async getReference(file: TFile): Promise<Date | null> {
		let regex: RegExp | null = null;

		// Check if regex is valid
		if (this.settings.useRegex) {
			try {
				regex = new RegExp(this.settings.reference);
			} catch (e) {
				new Notice("Invalid Regex", 2000);
				return null;
			}
		}

		// Default to file creation date. Note: It can easily change due to external causes like syncing
		let ref = new Date(file.stat.ctime);

		// Process frontmatter to find reference
		await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
			let refProp = null;

			// Parse date using the reference or default value. Note: we are using the file created date as the reference which we would hope to not use.
			const parseDateValue = (value: string) => parseDate(value, ref);

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

				if (!found) console.log('No matching property');
				else if (!refProp) console.log('Invalid reference');
			} else {
				// Check for a direct reference property
				if (frontmatter[this.settings.reference]) {
					refProp = parseDateValue(frontmatter[this.settings.reference]);
				} else {
					console.log('No matching property');
				}
			}

			// Use the found reference or fallback to file creation date
			if (refProp) ref = refProp;
			else console.log('Using file created timestamp');
		});

		return ref;
	}

	async onload() {
		await this.loadSettings();

		// Logs all the dates that is in the active markdown file
		this.addCommand({
			id: 'get-dates',
			name: 'Get Dates',
			callback: async () => {
				// get active file and check if it is markdown.
				const file = this.app.workspace.getActiveFile();
				if (!file || file.extension != 'md')
					return;

				// Get reference
				const reference = await this.getReference(file);
				if (!reference)
					return;

				// Read content in file
				const content = await this.app.vault.read(file);

				// Get dates in file from natural language
				const parsedResult = parse(content, reference);

				// Print output
				if (parsedResult.length == 0) {
					console.log("No dates in markdown file.");
				}
				let out = "Dates in markdown file:";
				for (const result of parsedResult) {
					out += "\n - " + result.date().toString();
				}
				console.log(out);
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new EasyTimelineSettingTab(this.app, this));

		const language = 'timeline';
		this.registerMarkdownCodeBlockProcessor(language, async (source, el, ctx) => {
			// Get active file
			const file = this.app.workspace.getActiveFile();
			if (!file) return;  // Exit if no file

			// Read file content
			const text = await this.app.vault.read(file);

			// Get front matter end position
			let { contentStart } = getFrontMatterInfo(text);

			// Define and remove source block
			const sourceBlock = "```" + language + "\n" + source + "\n```";
			const content = text.slice(contentStart).replace(sourceBlock, '');

			// Get reference
			const reference = await this.getReference(file);
			if (!reference)
				return;

			const timeline = content
				.split('\n') // Split content into lines and process dates for each lines
				.map(line => { // Process dates for each lines into objects with the line
					return {
						text: line.trim(),
						dates: parse(line, reference).map(value => value.date())
					};
				})
				.filter(value => value.dates.length != 0) // Don't include lines with no valid dates
				.sort(value => -value.dates[0].valueOf()) // Sort decending by the first date mentioned

			// Render timeline

			// Create heading
			el.createEl('h1', { text: "Timeline" });
			for (const { text, dates } of timeline) {
				// Create date heading using the first date mentioned
				el.createEl('h2', { text: dates[0].toLocaleString() });
				el.createEl('p', { text: text });
			}
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
	}
}
