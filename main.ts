import { parse, parseDate } from 'chrono-node';
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

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

				// default reference will be file created date. Note: it can easily change to external causes like syncing
				let reference = new Date(file.stat.ctime)
				// if there is a valid 'created' property in file, use that instead
				await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
					// We are also using chronos for parsing 'created' property for convinence and its versatility. the Note: we are using the file created date as the reference which we would hope to not use.
					const createdProperty = parseDate(frontmatter["created"], reference)
					// Check if valid date
					if (createdProperty)
						reference = createdProperty;
				})

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
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			// console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => {
			// console.log('setInterval'), 5 * 60 * 1000)
		}));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
