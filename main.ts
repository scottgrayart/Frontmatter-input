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
		const cbRadioName = cbDivIdGen('cbrn');

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

			const processCbList = async (container: HTMLElement, def: any, tagPre: String) => {
				const listContainer = container.createEl('ul', { cls: 'contains-task-list has-list-bullet' });
				const rdName = def.type === 'radio' ? cbRadioName.next().value : null;
				let fm: any = {};
				if (!currentFile) return;
				await this.app.fileManager.processFrontMatter(currentFile, fmData => { fm = fmData });
				for (let item of def.boxes) {
					for (let property in item) {
						const li = listContainer.createEl('li', { cls: 'task-list-item' });
						const cb = li.createEl("input", {
								type: def.type ? def.type : 'checkbox',
								cls:'task-list-item-checkbox'
							});
						if (cb.type === 'radio') cb.name = rdName!;
						let cbTag = '';
						// set tag attribute
						if (item[property] && item[property].tag) {
							cbTag = item[property] && item[property].tag
										? `${tagPre}${item[property].tag}` : '';
							const cbTagRegx = new RegExp(`^${cbTag}.*`);
							cb.setAttribute('_tag', cbTag);
							cb.checked = (fm && fm.tags && fm.tags.some((tag: any) => cbTagRegx.test(tag)));
						}
						li.appendText(property);
						if (item[property] && item[property].boxes)
							await processCbList(li, item[property], cbTag + '/');
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
				if (['checkbox', 'radio'].includes(event.target.type)) {
					const cb = event.target;
					if (!cb.checked) { // Clear the child boxs
						const li = cb.closest('li');
						const cbs = li.querySelectorAll('input[type=checkbox], input[type=radio]');
						cbs.forEach((box: any) => {
							if (box !== cb) box.checked = false;
						});
					} else { // checked checkbox - set parent boxes
						let parentCb = getParentCb(cb);
						while (parentCb && !parentCb.checked) {
							parentCb.checked = true;
							parentCb = getParentCb(parentCb)
						}
					}
					if (cb.type === 'radio') {
						// for radio buttons, uncheck sibling boxes
						const ul = cb.closest('ul');
						const cbs = ul.querySelectorAll('input[type=radio][name="' + cb.name + '"]');
						cbs.forEach((box: any) => {
							if (box !== cb) {
								box.checked = false;
								const childIputs = box.closest('li').querySelectorAll('input[type=checkbox], input[type=radio]');
								childIputs.forEach((childBox: any) => {
									if (childBox !== cb) childBox.checked = false;
								});
							}
						});
					}
					if (currentFile) {
						// Clear all input tags from front matter
						await this.app.fileManager.processFrontMatter(currentFile, fmData => {
							const div = cb.closest('div.el-ul');
							const inputs:string[] = Array.from(div.querySelectorAll('input[type=checkbox], input[type=radio]'));
							const allTags:string[] = inputs.reduce((tags: string[], input: any) => {;
								tags.push(input.getAttribute('_tag'));
								return tags;
							}, []);
							fmData.tags = fmData.tags.filter((tag: any) => !allTags.includes(tag));
						});

						// Now set tags based on checked boxes
						await this.app.fileManager.processFrontMatter(currentFile, fmData => {
							const div = cb.closest('div.el-ul');
							const inputs:string[] = Array.from(div.querySelectorAll('input[type=checkbox]:checked, input[type=radio]:checked'));
							const checkedTags:string[] = inputs.reduce((tags: string[], input: any) => {;
								tags.push(input.getAttribute('_tag'));
								return tags;
							}, []);
							checkedTags.reverse().forEach(tag => {
								if (!fmData.tags.some((t: any) => new RegExp(`^${tag}.*`).test(t))) {
									fmData.tags.push(tag);
								}
							});
						});
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
				await processCbList(boxContainer,def, '');
				boxContainer.onchange = cbListen;
			} catch(e) {
				console.trace(e.message)
			} // decide what to do here
		});
	}
	onunload() {

	}
}

