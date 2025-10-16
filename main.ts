import { App, Editor, FileManager, MarkdownView,
	Modal, Notice, parseYaml, Plugin,
	PluginSettingTab, Setting, TFile
} from 'obsidian';

function* cbDivIdGen(prefix: string): IterableIterator<string> {
    let i = 0;
	while (true) {
		let result = prefix + '-' + (++i).toString().padStart(5, '0');
		yield result;
	}
}
export default class PlayWithCheckboxs extends Plugin {
	async onload() {
		const cbDivId = cbDivIdGen('cbid');

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Greet', (_evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('Lets Play!');
		});

		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		let currentFm: any = null; // This is common to all codeblocks

		// process code blocks with the label 'checkboxs'
		this.registerMarkdownCodeBlockProcessor('checkboxs', async (source, el, ctx) => {
			const currentFile: TFile | null = this.app.workspace.getActiveFile();

			const processCbList = (container: HTMLElement, boxes: Array<any>, fm: any, tagPre: String) => {
				const listContainer = container.createEl('ul', { cls: 'contains-task-list has-list-bullet' });
				for (let item of boxes) {
					for (let property in item) {
						const li = listContainer.createEl('li', { cls: 'task-list-item' });
						const cb = li.createEl("input", { type: "checkbox", cls:'task-list-item-checkbox' });
						let cbTag = '';
						// set tag attribute
						if (item[property] && item[property].tag) {
							cbTag = item[property] && item[property].tag
										? `${tagPre}${item[property].tag}` : '';
							const cbTagRegx = new RegExp(cbTag + '.*');
							cb.setAttribute('_tag', cbTag);
							cb.checked = (fm && fm.tags && fm.tags.some((tag: any) => cbTagRegx.test(tag)));
						}
						li.appendText(property);
						if (item[property] && item[property].boxes)
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
					let filteredTags = currentFm && currentFm.tags
									 ? currentFm.tags.filter((tag:any) => !cbTagRegx.test(tag))
									 : [];
					if (currentFile) {
						await this.app.fileManager.processFrontMatter(currentFile, fm => {
							if (cb.checked) {
								if (!filteredTags.includes(cbTag))
									filteredTags.push(cbTag);
							} else {
								const parentCb = getParentCb(cb);
								if (parentCb) {
									filteredTags = [parentCb.getAttribute('_tag'), ...filteredTags];
								}
							}
							fm.tags = filteredTags;
							currentFm.tags = fm.tags;
						})
					}
				}
			}
			try {
				const def = parseYaml(source);
				if (!def || !def.boxes) {
					el.createEl('div', { text: 'No boxes defined' });
					return;
				}
				const boxContainer = el.createDiv({ cls: 'el-ul' });
				boxContainer.id = cbDivId.next().value;
				if (currentFile) {
					await this.app.fileManager.processFrontMatter(currentFile, fm => { currentFm = fm });
					processCbList(boxContainer,def.boxes, currentFm, '');
				}
				boxContainer.onchange = cbListen;
			} catch(e) {
				console.trace(e.message)
			} // decide what to do here
		});
	}
	onunload() {

	}
}

