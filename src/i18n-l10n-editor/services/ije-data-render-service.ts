import * as vscode from 'vscode';
import { IJEConfiguration } from '../ije-configuration';
import { IJEData } from '../ije-data';
import { IJEDataTranslation } from '../models/ije-data-translation';
import { IJEFolder } from '../models/ije-folder';
import { IJEPage } from '../models/ije-page';
import { IJESort } from '../models/ije-sort';

export class IJEDataRenderService {
    static renderPagination(translations: IJEDataTranslation[], page: IJEPage, withPageSizeSelector: boolean = true) {
        let render = '<div class="container-fluid" style="margin: 0px; padding: 0px; background: var(--vscode-sideBar-background);">';
        render += '<div class="row" style="margin: 0px; padding: 0px;">';
        render += '<div class="col-4">';
        render += '<div class="mt-3" style="position: sticky; left: 20px; z-index: 1100;">';
        if (page.count === 0) {
            render += '0 ';
        } else {
            var firstEl = (page.pageNumber - 1) * page.pageSize + 1;
            render += `${firstEl}-${firstEl + (translations.length - 1)} `;
        }
        render += `of ${page.count}`;
        render += '</div>';
        render += '</div>';
        render += '<div class="col-8">';
        render += '<div class="float-right">';
        render += '<div class="form-inline">';
        if (withPageSizeSelector) {
            render += '<select class="form-control form-control-sm mr-4" style="height: 32px;" onchange="pageSize(this)">';
            [10, 20, 50, 100, 200, 500, 1000].forEach(i => {
                render += `<option value="${i}" ${i === page.pageSize ? 'selected="selected"' : ''}>${i}</option>`;
            });
            render += ' </select>';
        }
        render += '<nav class="mt-3">';
        render += '<ul class="pagination justify-content-center">';
        render += `<li class="page-item ${page.pageNumber <= 1 ? 'disabled' : ''}"><a class="page-link" href="#" onclick="navigate(1)">|<</a></li>`;
        render += `<li class="page-item ${page.pageNumber - 1 < 1 ? 'disabled' : ''}"><a class="page-link" href="#" onclick="navigate(${page.pageNumber - 1})"><</a></li>`;
        render += `<li class="page-item ${page.pageNumber + 1 > page.totalPages ? 'disabled' : ''}"><a class="page-link" href="#" onclick="navigate(${
            page.pageNumber + 1
        })">></a></li>`;
        render += `<li class="page-item ${page.pageNumber >= page.totalPages ? 'disabled' : ''}"><a class="page-link" href="#" onclick="navigate(${page.totalPages})">>|</a></li>`;
        render += '</ul>';
        render += '</nav>';
        render += '</div>';
        render += '</div>';
        render += '</div>';
        render += '</div>';
        render += '</div>';

        return render;
    }

    private static _getTableHeader(column: string, position, width, sort: IJESort) {
        let style =
            position >= 0
                ? `position: sticky; left: ${position}px; top: 80px; z-index: 1200; width: ${width}px; maxWidth: ${width}px; background: var(--vscode-editor-background);`
                : width >= 0
                ? 'position: sticky; top: 80px; z-index: 1100; width: ${width}px; maxWidth: ${width}px; background: var(--vscode-editor-background);'
                : '';
        return (
            `<th class="text-center" style="background: var(--vscode-editor-background); cursor: pointer; ${style}" onclick="sort('${column}',${sort.column === column ? !sort.ascending : true})">` +
            `${column}${sort.column === column ? (sort.ascending ? '<i class="icon-up-open"></i>' : '<i class="icon-down-open"></i>') : ''}
            
        </th>`
        );
    }

    static renderTable(translations: IJEDataTranslation[], languages: string[], page: IJEPage, sort: IJESort, showFolder: boolean = true, hasTranslateService = false) {
        let render = '<table class="table table-borderless" style="margin-left: -10px; margin-top: 70px;" >';
        render += '<tr>';
        render += '<th style="background: var(--vscode-editor-background); position: sticky; left: 0px; top: 80px; z-index: 1200; width: 40px; maxWidth: 40px; margin: 0px; padding: 0px;">&nbsp;</th>';

        const folders = IJEConfiguration.WORKSPACE_FOLDERS;

        if (showFolder && folders.length > 1 && IJEData._filteredFolder === '*') {
            render += this._getTableHeader('FOLDER', -1, 300, sort);
        }
        render += this._getTableHeader('KEY', 40, 438, sort);

        const defaultLanguage = IJEConfiguration.DEFAULT_LANGUAGE;
        let _defaultARB = '';
        let included: string[] = [];
        const langStr = languages.join(',');
        folders.forEach(d => {
            if (IJEData._filteredFolder !== '*') {
                if (d.path === IJEData._filteredFolder && d.arb.indexOf(defaultLanguage) >= 0 && langStr.indexOf(d.arb.split('.')[0]) >= 0) {
                    _defaultARB = d.arb;
                    included = d.languages;
                }
            } else if (_defaultARB === '' && d.arb.indexOf('/') >= 0 && d.arb.startsWith(defaultLanguage)) {
                _defaultARB = d.arb.split('/')[0];
            } else if (_defaultARB === '' && d.arb.indexOf('/') === -1 && d.arb.indexOf(defaultLanguage) !== -1 && langStr.indexOf(d.arb.split('.')[0]) >= 0) {
                _defaultARB = d.arb;
            }
        });

        if (_defaultARB.lastIndexOf('.') !== -1) {
            _defaultARB = _defaultARB.substring(0, _defaultARB.lastIndexOf('.'));
        }
        if (_defaultARB === '') {
            _defaultARB = defaultLanguage;
        }

        languages.sort((a, b) => {
            if (a.indexOf('/') >= 0 || b.indexOf('/') >= 0) {
                const aSplit = a.split('/');
                const bSplit = b.split('/');
                if (aSplit[1] === bSplit[1]) {
                    if (aSplit[0] === _defaultARB || aSplit[0].startsWith(_defaultARB)) {
                        return -1;
                    }
                    if (bSplit[0] === _defaultARB || bSplit[0].startsWith(_defaultARB)) {
                        return 0;
                    }
                    return aSplit[0] > bSplit[0] ? 1 : -1;
                } else {
                    return aSplit[1] > bSplit[1] ? 1 : -1;
                }
            } else {
                if (a === _defaultARB || a.startsWith(_defaultARB)) {
                    return -1;
                }
                if (b === _defaultARB || b.startsWith(_defaultARB)) {
                    return 0;
                }
                return a > b ? 1 : -1;
            }
        });

        languages.forEach((language: string) => {
            if (included.length === 0 || included.includes(language)) {
                if (language === _defaultARB) {
                    render += `${this._getTableHeader(language, 490, 400, sort)}`;
                } else {
                    render += `${this._getTableHeader(language, -1, 400, sort)}`;
                }
            }
        });
        render += '</tr>';

        translations.forEach(t => {
            let selected = '';
            let selectedLanguages: string[] = [];
            render += '<tr style="padding: 0px; margin: 0px; left: 0px">';
            render +=
                `<td style="background: var(--vscode-editor-background); width: 40px; maxWidth: 40px; white-space: nowrap; position: sticky; left: 0px; z-index: 1000; margin: 0px; padding: 0px;">` +
                `<button type="button" class="btn" style="width: 40px; maxWidth: 40px; padding-top: 20px;" onclick="remove(${t.id})"><i class="error-vscode icon-trash-empty"></i></button></td>`;

            if (showFolder && folders.length > 1 && IJEData._filteredFolder === '*') {
                render += `<td style="background: var(--vscode-editor-background); width: 300px; white-space: nowrap;"><div class="input-group-append" style="background: var(--vscode-editor-background); width: 300px; white-space: nowrap;">`;

                folders.forEach(d => {
                    if (included.length === 0 || included.includes(d.arb.split('.')[0])) {
                        let l = d.folder;
                        let f = t.folder;
                        if (l && f.indexOf(l) >= 0 && f.indexOf('/', f.indexOf(l) + l.length + 2) >= 0) {
                            f = f.substring(0, f.indexOf('/', f.indexOf(l) + l.length + 2));
                        }

                        if (d.path === f) {
                            selectedLanguages = d.languages;
                            selected = `${d.folder}/${d.arb}`;
                            render += `<input id="select-folder-${t.id}" class="form-control" style="width: 300px;" value="${d.name}" onClick="blur();"/>`;
                        }
                    }
                });

                render += '</div></td>';
            }

            let indent = 0;
            let width = 430;
            if (sort.column === 'KEY' && !t.key.startsWith('@@') && t.key.startsWith('@')) {
                let i = t.key.length - t.key.replace(/\./g, '').length;
                for (let j = 0; j < i; ++j) {
                    if (indent === 0) {
                        indent += 10;
                    }
                    indent += 10;
                }
            }

            render +=
                `<td style="background: var(--vscode-editor-background); white-space: nowrap; position: sticky; left: 40px; z-index: 1000; maxWidth: ${width}px;">` +
                `<div class="input-group-append" style="width: ${width}px; maxWidth: ${width}px; background: var(--vscode-editor-background); white-space: nowrap;"><input id="input-key-${
                    t.id
                }" class="form-control ${t.valid ? '' : 'is-invalid'}" style="width: ${width - 40}px; maxWidth: ${
                    width - 40
                }px;  margin-left: ${indent}px" type="text" placeholder="Key..." value="${t.key.replace(/"/g, '&quot;')}" onfocus="mark(${t.id})" onchange="updateInput(this,${
                    t.id
                });" />` +
                `<div id="input-key-${t.id}-feedback" class="invalid-feedback error-vscode">${t.error}</div>`;

            if (showFolder && folders.length > 1 && IJEData._filteredFolder === '*' && !t.key.startsWith('@@')) {
                render += `<button type="button" class="btn btn-vscode" style="background: #5C9CFF; width: 40px; maxWidth: 40px; padding-left: 8px; border-radius: 0px 5px 5px 0px;" onclick="copyFolder(${t.id}, '${t.folder}')"><i class="icon-copy-folders"></i></button>`;
            }

            render += `</div></td>`;

            let defaultARB = _defaultARB;
            languages.forEach((language: string) => {
                let showIt = false;
                let showBlank = false;
                if (included.includes(language) || t.key === '') {
                    showIt = true;
                    showBlank = false;
                } else if (included.length === 0) {
                    for (let f in folders) {
                        let fol = folders[f];
                        if (selected === '') {
                            showIt = true;
                            break;
                        } else if (selected === `${fol.folder}/${fol.arb}` && fol.languages.includes(language)) {
                            showIt = true;
                            break;
                        } else {
                            showBlank = true;
                        }
                    }
                }
                if (defaultARB === '') {
                    defaultARB = _defaultARB;
                }
                defaultARB = defaultARB.split('/')[0];
                if (showIt || t.languages[language] !== undefined) {
                    render += `<td style="background: var(--vscode-editor-background); ${
                        language === defaultARB || language.startsWith(defaultARB)
                            ? `position: sticky; left: 490px; z-index: 1000; maxWidth: 400px; width: 400px;`
                            : ' maxWidth: 400px; width: 400px;'
                    }">`;
                    if (hasTranslateService) {
                        render += `<div class="input-group" style="minWith: 400px; width: 400px; white-space: nowrap;">`;
                    }
                    render += `<input class="form-control" style="minWith: 240px; width: 240px; white-space: nowrap;" type="text" placeholder="Translation..." onfocus="mark(${t.id})" onchange="updateInput(this,${t.id},'${language}');" `;
                    if (t.languages[language]) {
                        render += `value="${t.languages[language].replace(/\n/g, '\\n').replace(/"/g, '&quot;')}" `;
                    }
                    render += '/>';
                    if (hasTranslateService) {
                        const style =
                            language === defaultARB || language.startsWith(defaultARB) || language.endsWith(`_${defaultARB}`)
                                ? 'style="background: green; white-space: nowrap;"'
                                : 'style="white-space: nowrap;"';
                        if (!t.key.startsWith('@@')) {
                            let from = language.indexOf('/') >= 0 ? `${defaultARB.split('/')[0]}/${language.split('/')[1]}` : defaultARB;
                            let to =
                                from !== language
                                    ? language
                                    : selectedLanguages.length === 0
                                    ? languages.filter(l => l.indexOf('/') === -1 || (from.indexOf('/') >= 0 && l.endsWith(from.split('/')[1]))).join(',')
                                    : selectedLanguages.join(',');
                            if (to.indexOf('_') > 0 && from.indexOf('_') === -1 && !from.startsWith(to.split('_')[0])) {
                                from = to.split('_')[0] + '_' + from;
                            }
                            render +=
                                `<div class="input-group-append">` +
                                `<button type="button" class="btn btn-vscode" ${style} onclick="translateInput(this,${t.id}, '${from}','${to}');"><i class="icon-language"></i></button></div>`;
                            if (language === defaultARB || language.startsWith(defaultARB) || language.endsWith(`_${defaultARB}`)) {
                                render +=
                                    `<div class="input-group-append">` +
                                    `<button type="button" class="btn btn-vscode" style="background: #BBFFBB90; white-space: nowrap;" onclick="copyInput(this,
                                            ${t.id}, '${from}', '${to}');"><i class="icon-right-open"></i></button></div>`;
                            }
                        }
                        render += '</div>';
                    }
                    render += '</td>';
                } else if (showBlank) {
                    render += `<td style="background: var(--vscode-editor-background); ${
                        language === defaultARB || language.startsWith(defaultARB) || language.endsWith(`_${defaultARB}`)
                            ? `position: sticky; left: 490px; z-index: 1000; maxWidth: 400px; width: 400px;`
                            : ' maxWidth: 400px; width: 400px;'
                    }"><div class="input-group" style="minWith: 400px; width: 400px; white-space: nowrap;">&nbsp;</div></td>`;
                }
            });

            render += '</tr>';
        });
        render += '</table>';

        render += this.renderPagination(translations, page);

        return render;
    }

    static renderList(
        translations: IJEDataTranslation[],
        selectTranslation: IJEDataTranslation,
        selectFolder: string,
        languages: string[],
        page: IJEPage,
        sort: IJESort,
        showFolder: boolean = true,
        hasTranslateService = false
    ) {
        const folders = IJEConfiguration.WORKSPACE_FOLDERS;

        const defaultLanguage = IJEConfiguration.DEFAULT_LANGUAGE;
        let _defaultARB = '';
        let included: string[] = [];
        const langStr = languages.join(',');
        folders.forEach(d => {
            if (IJEData._filteredFolder !== '*') {
                if (d.path === IJEData._filteredFolder && d.arb.indexOf(defaultLanguage) >= 0) {
                    _defaultARB = d.arb;
                    included = d.languages;
                }
            } else if (_defaultARB === '' && d.arb.indexOf('/') >= 0 && d.arb.startsWith(defaultLanguage) && langStr.indexOf(d.arb.split('.')[0]) >= 0) {
                _defaultARB = d.arb.split('/')[0];
            } else if (_defaultARB === '' && d.arb.indexOf('/') === -1 && d.arb.indexOf(defaultLanguage) !== -1 && langStr.indexOf(d.arb.split('.')[0]) >= 0) {
                _defaultARB = d.arb;
            }
        });

        if (_defaultARB.lastIndexOf('.') !== -1) {;
            _defaultARB = _defaultARB.substring(0, _defaultARB.lastIndexOf('.'));
        }
        if (_defaultARB === '') {
            _defaultARB = defaultLanguage;
        }

        languages.sort((a, b) => {
            if (a.indexOf('/') >= 0 || b.indexOf('/') >= 0) {
                const aSplit = a.split('/');
                const bSplit = b.split('/');
                if (aSplit[1] === bSplit[1]) {
                    if (aSplit[0] === _defaultARB || aSplit[0].startsWith(_defaultARB)) {
                        return -1;
                    }
                    if (bSplit[0] === _defaultARB || bSplit[0].startsWith(_defaultARB)) {
                        return 0;
                    }
                    return aSplit[0] > bSplit[0] ? 1 : -1;
                } else {
                    return aSplit[1] > bSplit[1] ? 1 : -1;
                }
            } else {
                if (a === _defaultARB || a.startsWith(_defaultARB)) {
                    return -1;
                }
                if (b === _defaultARB || b.startsWith(_defaultARB)) {
                    return 0;
                }
                return a > b ? 1 : -1;
            }
        });

        let render = '<div class="container-fluid">';
        render += '<div class="row">';
        render += '<div class="col-4" style="position: fixed; top: 95px; z-index: 1000; width: 490px; max-width: 490px;">';
        render += '<div style="word-wrap: break-word;" class="list-group">';

        let selected = '';
        let selectedLanguages: string[] = [];
        let key = '';
        translations.forEach(t => {
            let indent = 10;
            key = t.key;
            if (sort.column === 'KEY' && !t.key.startsWith('@@') && t.key.startsWith('@')) {
                let i = t.key.length - t.key.replace(/\./g, '').length;
                for (let j = 0; j < i; ++j) {
                    indent += 10;
                }
            }

            render += `<a href="#" id="select-key-${t.id}" onclick="select(${
                t.id
            })" style="padding-left: ${indent}px; height: 35px" class="btn-vscode-secondary list-group-item list-group-item-action ${
                selectTranslation && selectTranslation.id === t.id ? 'active' : ''
            }">${t.key === '' ? '&nbsp;' : t.key}</a>`;
        });
        render += '</div>';
        render += this.renderPagination(translations, page, false);
        render += '</div>';

        render += '<div class="col-7" style="left: 500px">';

        if (selectTranslation) {
            if (showFolder && folders.length > 1) {
                render += `<div class="form-group">
                    <label>Directory</label>
                    <div class="row">
                    <div class="col-12">
                        <select id="select-folder-${selectTranslation.id}" class="form-control" onchange="updateFolder(this,${selectTranslation.id})">`;

                folders.forEach(d => {
                    if (included.length === 0 || included.includes(d.arb.split('.')[0])) {
                        if (d.path === selectFolder) {
                            selectedLanguages = d.languages;
                            selected = `${d.folder}/${d.arb}`;
                            return;
                        }
                    }
                    render += `<option value='${d.path}' ${d.path === selectTranslation.folder ? 'selected' : ''}>${d.name}</option>`;
                });
                render += '</select></div></div></div>';
            }

            render += `<div class="form-group">
                    <label>Key</label>
                    <div class="row">
                        <div class="col-10">
                            <input id="input-key-${selectTranslation.id}" class="form-control ${
                selectTranslation.valid ? '' : 'is-invalid'
            }" type="text" placeholder="Key..." value="${selectTranslation.key}" onchange="updateInput(this,${selectTranslation.id});" />
                            <div id="input-key-${selectTranslation.id}-feedback" class="invalid-feedback error-vscode">${selectTranslation.error}</div>
                        </div>                 
                        <div class="col-2">
                            <button type="button" class="btn" onclick="remove(${selectTranslation.id})"><i class=" error-vscode icon-trash-empty"></i></button>
                        </div>
                    </div>
                </div>`;
            let defaultARB = _defaultARB;
            languages.forEach((language: string) => {
                let showIt = false;
                if (included.includes(language)) {
                    showIt = true;
                } else if (included.length === 0) {
                    for (let f in folders) {
                        let fol = folders[f];
                        if (!selectFolder || fol.path === selectFolder) {
                            if (selected === '') {
                                showIt = true;
                                break;
                            } else if (selected === `${fol.folder}/${fol.arb}` && fol.languages.includes(language)) {
                                showIt = true;
                                break;
                            }
                        }
                    }
                }
                if (showIt) {
                    render += `<label>${language}</label>`;
                    if (hasTranslateService) {
                        render += `<div class="row">
                                    <div class="col-10">`;
                    }
                    render += `<textarea class="form-control mb-2" rows="6" placeholder="Translation..." onchange="updateInput(this,${selectTranslation.id},'${language}');">`;
                    if (selectTranslation.languages[language]) {
                        render += selectTranslation.languages[language];
                    }
                    render += '</textarea>';
                    if (hasTranslateService) {
                        const style =
                            language === defaultARB || language.startsWith(defaultARB) || language.endsWith(`_${defaultARB}`)
                                ? 'style="background: green; white-space: nowrap;"'
                                : 'style="white-space: nowrap;"';
                        if (!selectTranslation.key.startsWith('@@')) {
                            let from = language.indexOf('/') >= 0 ? `${defaultARB.split('/')[0]}/${language.split('/')[1]}` : defaultARB;
                            let to =
                                from !== language
                                    ? language
                                    : selectedLanguages.length === 0
                                    ? languages.filter(l => l.indexOf('/') === -1 || (from.indexOf('/') >= 0 && l.endsWith(from.split('/')[1]))).join(',')
                                    : selectedLanguages.join(',');
                            if (to.indexOf('_') > 0 && from.indexOf('_') === -1 && !from.startsWith(to.split('_')[0])) {
                                from = to.split('_')[0] + '_' + from;
                            }
                            render += `</div>
                            <div class="col-2">
                                <button type="button" class="btn btn-vscode" ${style} onclick="translateInput(this, ${selectTranslation.id},'${from}', '${to}');"><i class="icon-language"></i></button>`;
                            if (language === defaultARB || language.startsWith(defaultARB) || language.endsWith(`_${defaultARB}`)) {
                                render += `<button type="button" class="btn btn-vscode" style="background: #BBFFBB90; white-space: nowrap;" onclick="copyInput(this,
                                ${selectTranslation.id}, '${from}', '${to}');"><i class="icon-down-open"></i></button>`;
                            }
                        }
                        render += '</div>';
                    }
                    render += '</div>';
                }
            });
        }

        render += '</div>';
        render += '</div>';
        render += '</div>';
        return render;
    }
}

