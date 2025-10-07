import { App, Editor, MarkdownView,
	Modal, Notice, parseYaml, Plugin,
	PluginSettingTab, Setting, TFile
} from 'obsidian';

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
		this.registerMarkdownCodeBlockProcessor('checkboxs', async (source, el, ctx) => {
			try {
				const def = parseYaml(source);
				console.log('def'); console.log(def);
				const currentFile: TFile = this.app.workspace.getActiveFile();
				let currentFm = null;
				await this.app.fileManager.processFrontMatter(currentFile, fm => { currentFm = fm });
				console.log(currentFm)
				el.createEl('h2', { text: def.title });
				const boxContainer = el.createDiv({ cls: 'el-ul' });
				const listContainer = boxContainer.createEl('ul', { cls: 'contains-task-list has-list-bullet' });
				for (let item of def.boxesp) {
					for (let property in item) {
						const li = listContainer.createEl('li', { cls: 'task-list-item' });
						const cb = li.createEl("input", { type: "checkbox", cls:'task-list-item-checkbox' });
						cb.setAttribute('_tag', property);
						li.appendText(property);
						cb.checked = currentFm.tags.includes(property);
						cb.onchange = async () => {
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
						};
					}
				}
			} finally {
				console.log('All good!')
			} // decide what to do here
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
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
