import { App, Editor, FileManager, MarkdownView,
	Modal, Notice, parseYaml, Plugin,
	PluginSettingTab, Setting, TFile
} from 'obsidian';

export default class FrontmatterInput extends Plugin {
	async onload() {
		function* elementIdGen(prefix: string): IterableIterator<string> {
			let i = 0;
			while (true) {
				let result = prefix + '-' + (++i).toString().padStart(5, '0');
				yield result;
			}
		}
		const fmiDivId = elementIdGen('fmiDivid');
		const fmiRadioName = elementIdGen('fmiRadioName');

		// process code blocks with the label 'frontmatterinput'
		this.registerMarkdownCodeBlockProcessor('frontmatterinput', async (source, el, ctx) => {
			const currentFile: TFile | null = this.app.workspace.getActiveFile();

			const processInputList = async (container: HTMLElement, def: any, tagPre: String, hide: String = '') => {
				const orientationCls = def['orientation'] && def.orientation === 'horizontal'
									 ? 'horizontal-list' : '';
				const listContainer = container.createEl('ul', { cls: `${orientationCls} contains-task-list has-list-bullet` });
				listContainer.style.display = `${hide}`;
				const rdName = def.type === 'radio' ? fmiRadioName.next().value : null;
				let fm: any = {};
				if (!currentFile) return;
				await this.app.fileManager.processFrontMatter(currentFile, fmData => {
					fm = fmData ? fmData : {};
					if (!fm.tags) fm.tags = [];
				});
				for (let item of def.btns) {
					for (let property in item) {
						const li = listContainer.createEl('li', { cls: 'task-list-item' });
						// create checkbox or radio button, default to checkbox
						const btn = li.createEl("input", {
								type: def.type ? def.type : 'checkbox',
								cls:'task-list-item-checkbox'
							});
						if (btn.type === 'radio') btn.name = rdName!;
						let btnTag = '';
						// set tag attribute
						if (item[property] && item[property].tag) {
							btnTag = item[property] && item[property].tag
								  ? `${tagPre}${item[property].tag}` : '';
							const btnTagRegx = new RegExp(`^${btnTag}.*`);
							btn.setAttribute('_tag', btnTag);
							btn.checked = (fm && fm.tags && fm.tags.some((tag: any) => btnTagRegx.test(tag)));
						}
						li.appendText(property);
						if (item[property] && item[property].btns)
							await processInputList(li, item[property], btnTag + '/', btn.checked ? '' : 'none');
					}
				}
			}
			const getParentBtn = (btn: any) => {
				let result = null;
				try {
					result = btn.closest('ul').closest('li').children[0];
				} finally {
					return result;
				}
			}
			const clearSiblingInputs = (input: any) => {
				const ul = input.closest('ul');
				const inputs = ul.querySelectorAll(`input[type=radio][name="${input.name}"]`);
				inputs.forEach((btn: any) => {
					if (btn !== input) {
						btn.checked = false;
						const childIputs = btn.closest('li').querySelectorAll('input[type=checkbox], input[type=radio]');
						childIputs.forEach((childBtn: any) => {
							if (childBtn !== input) childBtn.checked = false;
						});
						const ul = btn.closest('li').querySelector('ul');
						if (ul) ul.style.display = 'none';
					}
				});
			}
			const btnListen = async (event: any) => {
				if (['checkbox', 'radio'].includes(event.target.type)) {
					const btn = event.target;
					if (!btn.checked) { // Clear the child boxs
						const li = btn.closest('li');
						const cbs = li.querySelectorAll('input[type=checkbox], input[type=radio]');
						cbs.forEach((box: any) => {
							if (box !== btn) box.checked = false;
						});
						const ul = btn.closest('li').querySelector('ul');
						if (ul) ul.style.display = 'none';
					} else { // checked checkbox - set parent btns
						let parentBtn = getParentBtn(btn);
						while (parentBtn && !parentBtn.checked) {
							parentBtn.checked = true;
							if (parentBtn.type === 'radio') {
								clearSiblingInputs(parentBtn);
							}
							parentBtn = getParentBtn(parentBtn)
						}
						const ul = btn.closest('li').querySelector('ul');
						if (ul) ul.style.display = '';
					}
					if (btn.type === 'radio') {
						// for radio buttons, uncheck sibling btns and children
						clearSiblingInputs(btn);
					}
					if (currentFile) {
						// Clear all input tags from front matter
						await this.app.fileManager.processFrontMatter(currentFile, fmData => {
							const div = btn.closest('div.el-ul');
							const inputs:string[] = Array.from(div.querySelectorAll('input[type=checkbox], input[type=radio]'));
							const allTags:string[] = inputs.reduce((tags: string[], input: any) => {;
								tags.push(input.getAttribute('_tag'));
								return tags;
							}, []);
							fmData.tags = fmData.tags.filter((tag: any) => !allTags.includes(tag));
						});

						// Now set tags based on checked btns
						await this.app.fileManager.processFrontMatter(currentFile, fmData => {
							const div = btn.closest('div.el-ul');
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
			let def: any = null;
			try {
				def = parseYaml(source);
				if (!def || !def.btns) {
					el.createEl('div', { cls: 'fmi-plugin-error', text: 'No btns defined' });
					return;
				}
			} catch(e) {
				el.createEl('div', {cls: 'fmi-plugin-error'}).innerHTML = 'YAML Parse Error<p>'
				+ source.replace(/\n/g, '<br>') + '<br>' + e.message.replaceAll('\n','<br>');
				//, { text: 'YAML Parse Error<p>' + e.message });
				return;
			}
			try {
				const fmiContainer = el.createDiv({ cls: 'el-ul' });
				fmiContainer.id = fmiDivId.next().value;
				await processInputList(fmiContainer, def, def.root ? def.root + '/' : '');
				fmiContainer.onchange = btnListen;
			} catch(e) {
				console.trace(e.message)
			}
		});
	}
	onunload() {

	}
}

