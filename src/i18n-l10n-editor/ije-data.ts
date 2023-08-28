import * as vscode from 'vscode';
import * as fs from 'fs';
import * as _path from 'path';

import { IJEConfiguration } from './ije-configuration';
import { IJEDataRenderService } from './services/ije-data-render-service';
import { IJEDataTranslation } from './models/ije-data-translation';
import { IJEDataTranslationError } from './models/ije-data-translation';
import { IJETranslationService } from './services/ije-translation-service';
import { IJEManager } from './ije-manager';
import { IJEPage } from './models/ije-page';
import { IJESort } from './models/ije-sort';
import { IJEView, IJEViewType } from './models/ije-view';
import { showInputBox } from './services/inputBox/showInputBox';
import { camelize } from './shared/camelize';
import { capalize } from './shared/capalize';
import { nochange } from './shared/nochange';
import { findYAML } from './services/find_yaml';
import { IJELangs } from './models/ije-langs';

export class IJEData {
    private _currentID = 1;

    private _languages: string[] = [];
    private _translations: IJEDataTranslation[] = [];

    private _searchPattern: string = '';
    static _filteredFolder: string = '*';

    private _view: IJEView;
    private _page: IJEPage;
    private _sort: IJESort;

    constructor(private _manager: IJEManager) {
        this._loadFiles();
        this._defaultValues();
    }

    private _defaultValues() {
        this._view = {
            type: IJEViewType.TABLE,
            selectionId: 1
        };

        this._sort = {
            column: 'KEY',
            ascending: true
        };

        this._page = {
            pageSize: 10,
            pageNumber: 1
        };
    }

    /**
     * Actions from the view
     */
    add() {
        const translation = this._createFactoryIJEDataTranslation();
        this._insert(translation);
        this._view.selectionId = translation.id;
        this._view.selectionFolder = translation.folder;
        this._manager.refreshDataTable();
    }

    addKey(key: string, text: string) {
        const folders = IJEConfiguration.WORKSPACE_FOLDERS;
        folders.forEach(f => {
            let translation = this._getKey(key);
            if (!translation) {
                translation = this._createFactoryIJEDataTranslation();
                translation.key = key;
                this._insert(translation);
            }

            let arb = f.arb;
            if (arb.lastIndexOf('.') !== -1) {
                arb = arb.substring(0, arb.lastIndexOf('.'));
            }

            // translation.languages = { [arb]: text };
            if (key.startsWith('@') && !key.startsWith('@@')) {
                //const t = this._get(translation.id);
                this._languages.forEach(l => {
                    // if (l !== arb) {
                    translation.languages[l] = text;

                    // }
                });
            } else {
                let lang: string = '';
                translation.languages[arb] = text;
                this._languages.forEach(l => {
                    if (l !== arb) {
                        lang += `,${l}`;
                    }
                });
                if (lang !== '') {
                    lang = lang.substring(1);
                }
                if (IJEConfiguration.KEY_AUTO_TRANSLATE) {
                    this.translate(translation.id, arb, lang);
                }
            }

            this._manager.refreshDataTable();
        });
    }

    changeFolder(id: number, value: string) {
        const translation = this._get(id);
        translation.folder = value;
        this._validate(translation, true);
        this._manager.updateTranslation(translation);
        return translation;
    }

    filterFolder(value: string) {
        IJEData._filteredFolder = value;
        this._manager.refreshDataTable();
    }

    mark(id: number) {
        const translation = this._get(id);
        if (translation) {
            this._view.selectionId = translation.id;
            this._view.selectionFolder = translation.folder;
        }
    }

    navigate(page: number) {
        this._page.pageNumber = page;
        this._manager.refreshDataTable();
    }

    pageSize(pageSize: number) {
        if (pageSize > 0 && pageSize % 10 === 0) {
            this._page.pageSize = pageSize;
            this._manager.refreshDataTable();
        }
    }

    render() {
        let render = '';
        let translations = this._getDisplayedTranslations();
        switch (this._view.type) {
            case IJEViewType.LIST:
                render += IJEDataRenderService.renderList(
                    translations,
                    this._get(this._view.selectionId),
                    this._view.selectionFolder,
                    this._languages,
                    this._page,
                    this._sort,
                    this._manager.isWorkspace,
                    !!IJEConfiguration.TRANSLATION_SERVICE && !!IJEConfiguration.TRANSLATION_SERVICE_API_KEY
                );
                break;
            case IJEViewType.TABLE:
                render += IJEDataRenderService.renderTable(
                    translations,
                    this._languages,
                    this._page,
                    this._sort,
                    this._manager.isWorkspace,
                    !!IJEConfiguration.TRANSLATION_SERVICE && !!IJEConfiguration.TRANSLATION_SERVICE_API_KEY
                );
                break;
        }

        return render;
    }

    remove(id: number) {
        const index = this._getIndex(id);
        if (index > -1) {
            this._validateImpacted(this._get(id));
            this._translations.splice(index, 1);

            this._manager.refreshDataTable();
        }
    }

    copyFolder(id: number, folderPath: string) {
        const translation = this._get(id);
        const folders = IJEConfiguration.WORKSPACE_FOLDERS;

        let defaultARB = '';

        folders
            .filter(f => f.path === folderPath)
            .forEach(f => {
                if (f.path === folderPath) {
                    defaultARB = f.arb.split('.')[0];
                    return;
                }
            });

        const value = translation.languages[defaultARB];

        if (value !== undefined) {
            folders.forEach(f => {
                if (
                    this._translations.filter(t => {
                        t.key === translation.key && t.folder === f.path;
                    }).length === 0
                ) {
                    const translate = this._createFactoryIJEDataTranslation();
                    translate.key = translation.key;
                    translate.folder = f.path;
                    f.languages.forEach(l => {
                        translate.languages[l] = translation.languages[defaultARB];
                    });
                    translate.valid = true;

                    this._translations.push(translate);
                } else {
                    this._translations
                        .filter(t => {
                            t.key = translation.key;
                        })
                        .forEach(t => {
                            Object.entries(t.languages).forEach(l => {
                                const [language, a] = l;
                                if (t.languages[language] === undefined) {
                                    t.languages[language] = value;
                                }
                            });
                        });
                }
            });
        }

        this.save();

        this._languages = [];
        this._translations = [];

        this._loadFiles();

        this._manager.refreshDataTable();
    }

    async lang() {
        const existingFolders = IJEConfiguration.WORKSPACE_FOLDERS;

        this.save();

        let _lang: string = await showInputBox('Language Code', 'en-us');
        let oldLang = '';

        const langs: IJELangs[] = [];

        if (_lang && _lang.length > 0) {
            _lang = _lang.replace('-', '_');
            let split = _lang.split('_');
            if (split.length > 1) {
                for (let s = 0; s < split.length; ++s) {
                    split[s] = split[s].toLocaleLowerCase();
                }
                split[split.length - 1] = split[split.length - 1].substring(0, 1).toLocaleUpperCase() + split[split.length - 1].substring(1);
                _lang = split.join('_');
            }
            let lang = _lang;
            existingFolders.forEach(async f => {
                if (IJEData._filteredFolder === '*' || f.path === IJEData._filteredFolder) {
                    let _src = `${f.path}/${f.arb}`;
                    oldLang = f.arb.split('.')[0];

                    let _dest = '';
                    let _base = '';
                    if (f.arb.split('_').length === 1) {
                        lang = _lang;
                        _dest = `${f.path}/${_lang}.${f.arb.split('.')[f.arb.split('.').length - 1]}`;
                        _base = `${f.path}/${_lang.split('_')[0]}.${f.arb.split('.')[f.arb.split('.').length - 1]}`;
                    } else {
                        lang = `${f.arb.split('_')[0]}_${_lang}`;
                        _dest = `${f.path}/${f.arb.split('_')[0]}_${_lang}.${f.arb.split('.')[f.arb.split('.').length - 1]}`;
                        _base = `${f.path}/${f.arb.split('_')[0]}_${_lang.split('_')[0]}.${f.arb.split('.')[f.arb.split('.').length - 1]}`;
                    }

                    if (fs.existsSync(_base) || _lang === _lang.split('_')[0]) {
                        _base = '';
                    } else {
                        langs.push({ from: oldLang, to: `${f.arb.split('_')[0]}_${_lang.split('_')[0]}` });
                    }

                    if (_src !== '//' && f.arb !== '') {
                        let s: string = fs.readFileSync(vscode.Uri.file(_src).fsPath).toString();
                        let split = s.split('\n');
                        for (let p = 0; p < split.length; ++p) {
                            if (split[p].indexOf('@@locale') !== -1 || split[p].indexOf('@@local') !== -1) {
                                const l = split[p].split(':');
                                if (oldLang === '' && l.length === 2 && l[1].lastIndexOf('"') > l[1].indexOf('"')) {
                                    oldLang = l[1].substring(l[1].indexOf('"') + 1, l[1].lastIndexOf('"'));
                                }
                                split[p] = `    "@@locale": "${_lang}",`;
                                break;
                            }
                        }
                        fs.writeFileSync(vscode.Uri.file(_dest).fsPath, split.join('\n'));
                        if (_base !== '') {
                            for (let p = 0; p < split.length; ++p) {
                                if (split[p].indexOf('@@locale') !== -1 || split[p].indexOf('@@local') !== -1) {
                                    const l = split[p].split(':');
                                    if (oldLang === '' && l.length === 2 && l[1].lastIndexOf('"') > l[1].indexOf('"')) {
                                        oldLang = l[1].substring(l[1].indexOf('"') + 1, l[1].lastIndexOf('"'));
                                    }
                                    split[p] = `    "@@locale": "${_lang.split('_')[0]}",`;
                                    break;
                                }
                            }
                            fs.writeFileSync(vscode.Uri.file(_base).fsPath, split.join('\n'));
                        }

                        let add = true;
                        langs.forEach(l => {
                            if (oldLang === l.from && lang === l.to) {
                                add = false;
                                return;
                            }
                        });
                        if (add) {
                            langs.push({ from: oldLang, to: lang });
                        }
                    }
                }
            });

            IJEConfiguration.arbFolders = await findYAML(vscode.workspace.workspaceFolders[0].uri.fsPath);

            this._languages = [];
            this._translations = [];

            this._loadFiles();

            this._manager.refreshDataTable();

            if (IJEConfiguration.KEY_AUTO_TRANSLATE) {
                langs.forEach(l => {
                    this.autoTranslate(l.from, l.to);
                });
            }
        }
    }

    async autoTranslate(oldLang: string, lang: string) {
        const existingFolders = IJEConfiguration.WORKSPACE_FOLDERS;

        const values: string[] = [];

        if (oldLang.lastIndexOf('_') > oldLang.indexOf('_') && oldLang.indexOf('_') !== -1) {
            oldLang = oldLang.substring(0, oldLang.lastIndexOf('_'));
        }

        if (lang.length > 0) {
            existingFolders.forEach(f => {
                let ext = f.arb.split('.')[f.arb.split('.').length - 1];
                let _src = `${f.path}/${lang}.${ext}`;
                if (fs.existsSync(vscode.Uri.file(_src).fsPath)) {
                    let s: string = fs.readFileSync(vscode.Uri.file(_src).fsPath).toString();
                    let split = s.split('\n');
                    for (let p = 0; p < split.length; ++p) {
                        const part = split[p].trim();
                        if (!part.startsWith('"@') && !part.startsWith('{') && !part.startsWith('}')) {
                            const l = part.split(':');
                            if (l.length === 2 && l[0].lastIndexOf('"') > l[0].indexOf('"')) {
                                const key = l[0].substring(l[0].indexOf('"') + 1, l[0].lastIndexOf('"'));
                                if (key.toLocaleLowerCase() !== 'description' && key.toLocaleLowerCase() !== 'type') {
                                    const translate = this._getKey(key);
                                    if (translate && oldLang !== '') {
                                        this.translate(translate.id, oldLang, lang);
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    save() {
        var f = null;
        var saved = true;
        var msg = 'Translation files saved';
        let existingFolders = [];
        if (this._manager.folderPath) {
            existingFolders.push(this._manager.folderPath);
        } else {
            existingFolders = IJEConfiguration.WORKSPACE_FOLDERS.map(d => d.path);
        }

        let existingExtensions = IJEConfiguration.SUPPORTED_EXTENSIONS;

        let folders: { [key: string]: IJEDataTranslation[] } = this._translations.reduce((r, a) => {
            r[a.folder] = r[a.folder] || [];
            r[a.folder].push(a);
            return r;
        }, {});

        // TODO revisit this to pass in the different sort code and no duplicate it
        if (!IJEConfiguration.SORT_KEY_TOGETHER) {
            Object.entries(folders).forEach(entry => {
                const [key, value] = entry;
                this._languages.forEach(language => {
                    let o = {};
                    value
                        .filter(translation => translation.valid)
                        .sort((a, b) => (a.key > b.key ? 1 : -1))
                        .forEach(translation => {
                            if (translation.languages[language]) {
                                this._transformKeysValues(translation.key, translation.languages[language], o);
                            }
                        });

                    var json = JSON.stringify(o, null, IJEConfiguration.JSON_SPACE);
                    json = json.replace(/\n/g, IJEConfiguration.LINE_ENDING);
                    if (json !== '{}') {
                        existingExtensions.forEach((ext: string) => {
                            var s = vscode.Uri.file(_path.join(key, language + '.' + ext)).fsPath;
                            if (fs.existsSync(s)) {
                                f = s;
                                return;
                            }
                        });
                        if (f === null) {
                            f = vscode.Uri.file(_path.join(key, language + '.' + existingExtensions[0])).fsPath;
                        }
                        fs.writeFileSync(f + '.tmp', json + '\n');
                        const stats = fs.statSync(f + '.tmp');
                        if (stats.size >= (json + '\n').length) {
                            fs.copyFileSync(f + '.tmp', f);
                            fs.unlinkSync(f + '.tmp');
                            saved = true;
                        } else {
                            vscode.window.showErrorMessage(
                                'Error saving translation "' + f + ' file ' + stats.size + ' is less than ' + (json + '\n').length + '. Temporary files kept..'
                            );
                            saved = false;
                        }
                    }
                });
            });
        } else {
            Object.entries(folders).forEach(entry => {
                const [key, value] = entry;
                this._languages.forEach(language => {
                    let o = {};

                    value
                        .filter(translation => translation.valid)
                        .sort((a, b) => {
                            if (a.key === '@@locale' || a.key === '@@local') {
                                return -1;
                            }
                            if (b.key === '@@locale' || b.key === '@@local') {
                                return 1;
                            }
                            const compared = String(a.key.replace('@', '')).localeCompare(b.key.replace('@', ''));
                            if (compared === 0) {
                                if (a.key.startsWith('@')) {
                                    return 1;
                                }
                                if (b.key.startsWith('@')) {
                                    return -1;
                                }
                            }

                            return compared;
                        })
                        .forEach(translation => {
                            if (translation.languages[language]) {
                                this._transformKeysValues(translation.key, translation.languages[language], o);
                            }
                        });

                    var json = JSON.stringify(o, null, IJEConfiguration.JSON_SPACE);
                    json = json.replace(/\n/g, IJEConfiguration.LINE_ENDING);
                    if (json !== '{}') {
                        existingExtensions.forEach((ext: string) => {
                            var s = vscode.Uri.file(_path.join(key, language + '.' + ext)).fsPath;
                            if (fs.existsSync(s)) {
                                f = s;
                                return;
                            }
                        });
                        if (f === null) {
                            f = vscode.Uri.file(_path.join(key, language + '.' + existingExtensions[0])).fsPath;
                        }
                        fs.writeFileSync(f + '.tmp', json + '\n');
                        const stats = fs.statSync(f + '.tmp');
                        if (stats.size >= (json + '\n').length) {
                            fs.copyFileSync(f + '.tmp', f);
                            fs.unlinkSync(f + '.tmp');
                            saved = true;
                        } else {
                            vscode.window.showErrorMessage(
                                'Error saving translation "' + f + ' file ' + stats.size + ' is less than ' + (json + '\n').length + '. Temporary files kept..'
                            );
                            saved = false;
                        }
                    }
                });
            });
        }
        if (saved) {
            vscode.window.showInformationMessage(msg);
        }

        this._languages = [];
        this._translations = [];

        this._loadFiles();

        this._manager.refreshDataTable();
    }

    search(value: string) {
        this._searchPattern = value;
        this._manager.refreshDataTable();
    }

    select(id: number) {
        const translation = this._get(id);
        if (translation) {
            this._view.selectionId = translation.id;
            this._view.selectionFolder = translation.folder;

            this._manager.refreshDataTable();
        }
    }
    sort(column: string, ascending: boolean, firstPage: boolean = false) {
        this._sort.ascending = this._sort.column !== column ? true : ascending;
        this._sort.column = column;

        if (firstPage) {
            this.navigate(1);
        } else {
            this._manager.refreshDataTable();
        }
    }

    switchView(view: IJEViewType) {
        this._view.type = view;
        this._manager.refreshDataTable();
    }

    async translate(id: number, from: string = '', to: string = '') {
        const translation = this._get(id);
        if (translation && from) {
            const service = IJETranslationService;
            service._manager = this._manager;
            await service.translate(translation, from, to.split(','));
            this._manager.refreshDataTable();
        }
    }

    async copy(id: number, from: string = '', to: string = '') {
        const translation = this._get(id);
        if (translation && from) {
            const languages = to.split(',');

            languages
                .filter(l => l !== from)
                .forEach(l => {
                    if (translation.languages[from]) {
                        translation.languages[l] = translation.languages[from];
                    }
                });
            this._manager.refreshDataTable();
        }
    }

    update(id: number, value: string, language: string = ''): IJEDataTranslation {
        const translation = this._get(id);
        if (translation) {
            this._view.selectionId = translation.id;
            this._view.selectionFolder = translation.folder;
            if (language) {
                translation.languages[language] = value.replace(/\\n/g, '\n');
                this._validate(translation);
            } else {
                let newKey = value;
                if (IJEConfiguration.FORCE_KEY_UPPERCASE) {
                    newKey = value.toLocaleUpperCase();
                } else if (IJEConfiguration.KEY_CASE_STYLE) {
                    switch (IJEConfiguration.KEY_CASE_STYLE) {
                        case 'no change':
                            newKey = nochange(value);
                            break;
                        case 'camelCase':
                            if (newKey.indexOf(' ') !== -1) {
                                newKey = camelize(value);
                            } else {
                                newKey = nochange(value);
                            }
                            break;
                        case 'Capalize':
                            if (newKey.indexOf(' ') !== -1) {
                                newKey = capalize(value).replace(/[ ]/g, '');
                            } else {
                                newKey = nochange(value);
                            }
                            break;
                        case 'lowercase':
                            newKey = value.toLocaleLowerCase();
                            break;
                        case 'UPPERCASE':
                            newKey = value.toLocaleUpperCase();
                            break;
                    }
                    if (newKey.startsWith('@') && !newKey.startsWith('@@')) {
                        let temp = newKey;
                        if (temp.indexOf('.') !== -1) {
                            temp = temp.substring(1, temp.indexOf('.'));
                            let translation = this._getKey(temp);
                            if (translation && translation.key.toLocaleLowerCase() === temp.toLocaleLowerCase()) {
                                newKey = newKey.replace(temp, translation.key);
                            }
                        }
                    }
                }

                const oldKey = translation.key;

                translation.key = newKey;

                if (oldKey !== newKey) {
                    this._validateImpacted(translation, oldKey);
                }
                this._validate(translation, true);
                this._manager.updateTranslation(translation);
            }
        }

        return translation;
    }

    /**
     * Create the hierarchy based on the key
     */
    private _transformKeysValues(key: string, value: string, o = {}) {
        let separator = IJEConfiguration.KEY_SEPARATOR ? key.indexOf(IJEConfiguration.KEY_SEPARATOR) : -1;
        if (separator > 0) {
            const _key = key.substring(0, separator);
            if (!o[_key]) {
                o[_key] = {};
            }
            this._transformKeysValues(key.substring(separator + 1), value, o[_key]);
        } else if (!o[key] && typeof o !== 'string') {
            o[key] = value;
        }
    }

    /**
     *  Load methods
     */
    private _loadFiles() {
        if (!this._manager.isWorkspace) {
            this._loadFolder(this._manager.folderPath);
        } else {
            const directories = IJEConfiguration.WORKSPACE_FOLDERS;
            directories.forEach(d => {
                this._loadFolder(d.path);
            });
        }
    }

    private _loadFolder(folderPath: string) {
        const files = fs.readdirSync(folderPath);

        files.forEach((path: string) => {
            if (fs.lstatSync(`${folderPath}/${path}`).isDirectory()) {
                this._loadFolder(`${folderPath}/${path}`);
            }
        });

        let existingExtensions = IJEConfiguration.SUPPORTED_EXTENSIONS;

        existingExtensions = existingExtensions;

        const translate: any = {};
        const keys: string[] = [];

        existingExtensions.forEach((ext: string) => {
            files
                .filter(f => f.endsWith('.' + ext))
                .forEach((file: string) => {
                    var language = file.split('.')[0];
                    if (this._languages.indexOf(language) === -1) {
                        this._languages.push(language);
                    }

                    try {
                        let rawData = fs.readFileSync(_path.join(folderPath, file));
                        let jsonData = this._stripBOM(rawData.toString());
                        let content = JSON.parse(jsonData);

                        let keysValues = this._getKeysValues(content);

                        for (let key in keysValues) {
                            if (keys.indexOf(key) === -1) {
                                keys.push(key);
                            }
                        }
                        translate[language] = keysValues;
                    } catch (e) {
                        translate[language] = {};
                    }
                });
        });

        keys.forEach((key: string) => {
            const languages: any = {};
            this._languages.forEach((language: string) => {
                if (translate[language] !== undefined) {
                    const value = translate[language][key];
                    languages[language] = value ? value : '';
                }
            });

            const t = this._createFactoryIJEDataTranslation();
            t.folder = folderPath;
            t.key = key;
            t.languages = languages;
            this._insert(t);
        });
    }

    /**
     * For each values get the unique key with hierarchy separate by a separator
     */
    private _getKeysValues(obj: any, _key = '') {
        let kv: any = {};
        for (let key in obj) {
            if (typeof obj[key] !== 'string') {
                kv = { ...kv, ...this._getKeysValues(obj[key], _key + key + (IJEConfiguration.KEY_SEPARATOR || '')) };
            } else {
                kv[_key + key] = obj[key];
            }
        }
        return kv;
    }

    /**
     * Get all translation displayed on the view based on the active filters and paging options
     */
    private _getDisplayedTranslations(): IJEDataTranslation[] {
        var o = this._translations;
        if (IJEData._filteredFolder !== '*') {
            o = o.filter(t => t.folder === IJEData._filteredFolder);
        }

        o = o
            .filter(t => {
                let match = false;
                var regex = new RegExp(`${this._searchPattern}`, 'gmi');
                match = t.key === '' || regex.test(t.key);
                if (!match) {
                    this._languages.forEach(language => {
                        var content = t.languages[language] ? t.languages[language] : '';
                        if (!match) {
                            match = regex.test(content);
                        }
                    });
                }
                return match;
            })
            .sort((a, b) => {
                let _a: string, _b: string;
                if (this._view.type === IJEViewType.LIST || this._sort.column === 'KEY') {
                    _a = a.key.toLowerCase();
                    _b = b.key.toLowerCase();
                    if (this._sort.column === 'KEY') {
                        if (IJEConfiguration.SORT_KEY_TOGETHER) {
                            if (this._sort.ascending) {
                                if (_a === '@@locale' || _a === '@@local') {
                                    return -1;
                                }
                                if (_b === '@@locale' || _b === '@@local') {
                                    return 1;
                                }
                                const compared = String(_a.replace('@', '')).localeCompare(_b.replace('@', ''));
                                if (compared === 0) {
                                    if (_a.startsWith('@')) {
                                        return 1;
                                    }
                                    if (_b.startsWith('@')) {
                                        return -1;
                                    }
                                }

                                return compared;
                            } else {
                                if (_b === '@@locale' || _b === '@@local') {
                                    return -1;
                                }
                                if (_a === '@@locale' || _a === '@@local') {
                                    return 1;
                                }
                                if (_a.indexOf('.') !== -1) {
                                    _a = _a.substring(0, _a.indexOf('.'));
                                }
                                if (_b.indexOf('.') !== -1) {
                                    _b = _b.substring(0, _b.indexOf('.'));
                                }
                                let compared = String(_b.replace('@', '')).localeCompare(_a.replace('@', ''));
                                if (compared === 0) {
                                    _a = a.key.toLowerCase();
                                    _b = b.key.toLowerCase();
                                    compared = String(_a.replace('@', '')).localeCompare(_b.replace('@', ''));
                                    if (compared === 0) {
                                        if (_a.startsWith('@')) {
                                            return 1;
                                        }
                                        if (_a.startsWith('@')) {
                                            return -1;
                                        }
                                    }
                                }

                                return compared;
                            }
                        }
                    }
                } else if (this._sort.column === 'FOLDER') {
                    _a = a.folder + a.key.toLowerCase();
                    _b = b.folder + b.key.toLowerCase();
                } else {
                    _a = a.languages[this._sort.column] ? a.languages[this._sort.column].toLowerCase() : '';
                    _b = b.languages[this._sort.column] ? b.languages[this._sort.column].toLowerCase() : '';
                }
                return ((this._view.type === IJEViewType.LIST ? true : this._sort.ascending) ? _a > _b : _a < _b) ? 1 : -1;
            });

        this._page.count = o.length;
        this._page.pageSize = this._view.type === IJEViewType.LIST ? 15 : this._page.pageSize;
        this._page.totalPages = Math.ceil(this._page.count / this._page.pageSize);

        if (this._page.pageNumber < 1) {
            this._page.pageNumber = 1;
        }

        if (this._page.pageNumber > this._page.totalPages) {
            this._page.pageNumber = this._page.totalPages;
        }

        return o.slice((this._page.pageNumber - 1) * this._page.pageSize, this._page.pageNumber * this._page.pageSize);
    }

    /**
     * Validations
     */
    private _validateImpacted(translation: IJEDataTranslation, key: string = undefined) {
        if (key === '') {
            return;
        }

        const impacted = this._validatePath(translation, false, key);

        impacted.forEach(i => {
            if (key === undefined || (!this._comparePath(this._split(translation.key), this._split(i.key)) && this._validatePath(i, true).length === 0)) {
                i.valid = true;
                i.error = '';
                this._manager.updateTranslation(i);
            }
        });
    }

    private _validate(translation: IJEDataTranslation, keyChanged: boolean = false) {
        var t = this._validatePath(translation);
        if (translation.key === '') {
            translation.valid = false;
            translation.error = IJEDataTranslationError.KEY_NOT_EMPTY;
        } else if (keyChanged) {
            let separator = IJEConfiguration.KEY_SEPARATOR ? this.escapeRegExp(IJEConfiguration.KEY_SEPARATOR) : false;
            //does not start or end with the separator or two consecutive separators
            if (separator && new RegExp(`^${separator}|${separator}{2,}|${separator}$`).test(translation.key)) {
                translation.valid = false;
                translation.error = IJEDataTranslationError.INVALID_KEY;
            } else if (this._validatePath(translation).length > 0) {
                translation.valid = false;
                translation.error = IJEDataTranslationError.DUPLICATE_PATH;
            } else {
                translation.valid = true;
                translation.error = '';
            }
        }
    }

    private _validatePath(translation: IJEDataTranslation, valid: boolean = true, key: string = undefined) {
        const splitKey = this._split(key !== undefined ? key : translation.key);

        return this._translations.filter(t => {
            if (translation.id === t.id || translation.folder !== t.folder || t.valid !== valid) {
                return false;
            }
            return this._comparePath(splitKey, t.key.split('.'));
        });
    }

    private _comparePath(a: string[], b: string[]) {
        const _a = a.length >= b.length ? b : a;
        const _b = a.length < b.length ? b : a;
        return _a.every((v: string, i: number) => v === _b[i]);
    }

    /**
     * Factories
     */
    private _createFactoryIJEDataTranslation(): IJEDataTranslation {
        return {
            id: this._currentID++,
            folder: !this._manager.isWorkspace ? this._manager.folderPath : IJEData._filteredFolder !== '*' ? IJEData._filteredFolder : IJEConfiguration.WORKSPACE_FOLDERS[0].path,
            valid: true,
            error: '',
            key: '',
            languages: {}
        };
    }

    /**
     * Helpers
     */
    private escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    private _get(id: number): IJEDataTranslation {
        return this._translations.find(t => t.id === id);
    }

    private _getIndex(id: number): number {
        return this._translations.findIndex(t => t.id === id);
    }

    private _getKey(key: string): IJEDataTranslation {
        return this._translations.find(t => t.key.toLocaleLowerCase() === key.toLocaleLowerCase());
    }

    private _insert(translation: IJEDataTranslation) {
        this._translations.push(translation);
    }

    private _split(key: string) {
        if (IJEConfiguration.KEY_SEPARATOR) {
            return key.split(IJEConfiguration.KEY_SEPARATOR);
        }
        return [key];
    }

    private _stripBOM(content: string): string {
        if (!content.startsWith('\uFEFF')) {
            return content;
        }

        return content.replace('\uFEFF', '');
    }

    _sizeOf(array: { [language: string]: String }) {
        let n = 0;

        Object.entries(array).forEach(a => {
            ++n;
        });

        return n;
    }
}

