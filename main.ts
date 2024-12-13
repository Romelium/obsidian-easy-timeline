import { parse, parseDate } from 'chrono-node';
import { App, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	useRegex: boolean,
	reference: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	useRegex: false,
	reference: 'created'
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
				let regex: RegExp | null = null;
				if (this.settings.useRegex) {
					try {
						regex = new RegExp(this.settings.reference);
					} catch (e) {
						new Notice("Easy Timeline: Invalid Regex", 2000)
						return;
					}
				}

				// get active file and check if it is markdown.
				const file = this.app.workspace.getActiveFile();
				if (!file || file.extension != 'md')
					return;


				// default reference will be file created date. Note: it can easily change to external causes like syncing
				let reference = new Date(file.stat.ctime)

				// if there is a valid reference property in file, use that instead
				await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
					let referenceProperty = null;

					// We are also using chronos for parsing reference property for convinence and its versatility. the Note: we are using the file created date as the reference which we would hope to not use.
					const parseProperty = (value: string) => parseDate(value, reference);

					if (regex) {
						let found = false;

						// Iterate over the frontmatter to find a matching key based on the regex
						for (const [key, value] of Object.entries(frontmatter)) {
							if (regex.test(key)) {
								found = true;

								// Parse the value if it's a string
								if (typeof value === 'string') {
									referenceProperty = parseProperty(value);
								}
								break;
							}
						}

						if (!found) {
							console.log('No matching property found')
						} else if (!referenceProperty) {
							console.log('Found matching property but not it is valid')
						}
					} else {
						if (frontmatter[this.settings.reference]) {
							referenceProperty = parseProperty(frontmatter[this.settings.reference]);
						} else {
							console.log('No matching property found')
						}
					}

					// Validate the parsed date
					if (referenceProperty) {
						reference = referenceProperty;
					} else {
						console.log('Defaulting to file created timestamp')
					}
				});

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
