import { App, Editor, MarkdownView, Modal, Notice, parseYaml, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface PlayWithCheckboxsSettings {
	mySetting: string;
	size: number;
}

const DEFAULT_SETTINGS: PlayWithCheckboxsSettings = {
	mySetting: 'default',
	size: 1234
}

export default class PlayWithCheckboxs extends Plugin {
	settings: PlayWithCheckboxsSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Greet', (_evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('Lets Play!');
		});

		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// process code blocks with the label 'checkboxs'
		this.registerMarkdownCodeBlockProcessor('checkboxs', (source, el, ctx) => {
			const def = parseYaml(source);
			console.log(def);
			el.createEl('h2', { text: def.title });
			const boxContainer = el.createDiv({ id: def.includes, cls: 'el-ul' });
			const listContainer = boxContainer.createEl('ul', { cls: 'contains-task-list has-list-bullet' });
			for (let item of def.boxes.list) {
				for (let property in item) {
					const li = listContainer.createEl('li', { cls: 'task-list-item' });
					const cb = li.createEl("input", { type: "checkbox", cls:'task-list-item-checkbox' });
					cb.setAttribute('_tag', property);
					li.appendText(property);
					cb.onchange = async () => {
						const currentFile: TFile | null = this.app.workspace.getActiveFile();
						console.log(currentFile);
						const tag = cb.getAttribute('_tag');
						if (currentFile) {
							await this.app.fileManager.processFrontMatter(currentFile, fm => {
								console.log(fm)
								if (fm.tags) {
									if (!fm.tags.includes(tag))
										fm.tags.push(tag)
									else
										fm.tags = fm.tags.filter(val => val !== tag);
								}
								console.log(fm)
							});
						}
						console.log(currentFile.frontmatter)
						// let tags = dv.current().file.frontmatter.tags;
						// if (cb.checked) {
						// 	if (!tags.includes(item)) tags.push(item);
						// } else {
						// 	tags = tags.filter(v => v !== item);
						// }
						// // Write back to front‑matter
						// console.log(tags)
						// console.log(dv.current().file)
						// await dv.app.fileManager.processFrontMatter(dv.current().file,
						// 	fm => {
						// 	debugger
						// 		fm['tags'] = tags;
						// 		console.log(fm)
						// 	}
						// );
						// debugger
						// await dv.io.load(dv.current().file.path); // forces a reload of the file cont
						// console.log(dv.current().file.frontmatter)
					};
							}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });
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

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: PlayWithCheckboxs;

	constructor(app: App, plugin: PlayWithCheckboxs) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

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
