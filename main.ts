import { App, Editor, FileManager, MarkdownView,
	Modal, Notice, parseYaml, Plugin,
	PluginSettingTab, Setting, TFile
} from 'obsidian';

interface PlayWithCheckboxsSettings {
	mySetting: string;
	size: number;
}

const DEFAULT_SETTINGS: PlayWithCheckboxsSettings = {
	mySetting: 'default',
	size: 1234
}

function* cbDivIdGen(prefix: string): IterableIterator<string> {
    let i = 0;
	while (true) {
		let result = prefix + '-' + (++i).toString().padStart(5, '0');
		yield result;
	}
}
export default class PlayWithCheckboxs extends Plugin {
	settings: PlayWithCheckboxsSettings;

	async onload() {
		await this.loadSettings();

		const cbDivId = cbDivIdGen('cbid');

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Greet', (_evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('Lets Play!');
		});

		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// process code blocks with the label 'checkboxs'
		this.registerMarkdownCodeBlockProcessor('checkboxs', async (source, el, ctx) => {
			const currentFile: TFile | null = this.app.workspace.getActiveFile();
			let currentFm: any = null;

			const processCbList = (container: HTMLElement, boxes: Array<any>, fm: any, tagPre: String) => {
				const listContainer = container.createEl('ul', { cls: 'contains-task-list has-list-bullet' });
				for (let item of boxes) {
					for (let property in item) {
						const li = listContainer.createEl('li', { cls: 'task-list-item' });
						const cb = li.createEl("input", { type: "checkbox", cls:'task-list-item-checkbox' });
						const cbTag = `${tagPre}${item[property].tag}`;
						const cbTagRegx = new RegExp(cbTag + '.*');
						cb.setAttribute('_tag', cbTag);
						li.appendText(property);
						cb.checked = (fm !== null && fm.tags.some((tag: any) => cbTagRegx.test(tag)));
						if (item[property].boxes)
							processCbList(li, item[property].boxes, fm, cbTag + '/');
					}
				}
			}
			const getParentCb = (cb: any) => {
				let result = null;
				try {
					result = cb.closest('ul').closest('li').children[0];
				} finally {
					return result;
				}
			}
			const cbListen = async (event: any) => {
				if (event.target.type === 'checkbox') {
					const cb = event.target;
					if (!cb.checked) { // Clear the child boxs
						const li = cb.closest('li');
						const cbs = li.querySelectorAll('input[type=checkbox]');
						cbs.forEach((box: any) => {
							if (box !== cb) box.checked = false;
						});
					} else { // check
						let parentCb = getParentCb(cb);
						while (parentCb && !parentCb.checked) {
							parentCb.checked = true;
							parentCb = getParentCb(parentCb)
						}
					}
					// clear tags for cb and children
					const cbTag = event.target.getAttribute('_tag');
					const cbTagRegx = new RegExp(cbTag + '.*');
					let filteredTags = currentFm.tags.filter((tag:any) => !cbTagRegx.test(tag));
					console.log(currentFm.tags)
					console.log(filteredTags)
					if (currentFile) {
						await this.app.fileManager.processFrontMatter(currentFile, fm => {
							if (cb.checked) {
								console.log('checked', cbTag, filteredTags)
								filteredTags.push(cbTag);
							} else {
								const parentCb = getParentCb(cb);
								console.log('unchecked', parentCb.getAttribute('_tag'), filteredTags)
								if (parentCb) filteredTags = [parentCb.getAttribute('_tag'), ...filteredTags];
							}
							fm.tags = filteredTags;
							console.log(fm);
						})
					}
				}
			}
			try {
				const def = parseYaml(source);
				const boxContainer = el.createDiv({ cls: 'el-ul' });
				boxContainer.id = cbDivId.next().value;
				if (currentFile) {
					await this.app.fileManager.processFrontMatter(currentFile, fm => { currentFm = fm });
					processCbList(boxContainer,def.boxes, currentFm, '');
				}
				boxContainer.onchange = cbListen;
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
