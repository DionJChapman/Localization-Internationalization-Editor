import { IJEConfiguration } from '../ije-configuration';
import { IJEDataTranslation } from '../models/ije-data-translation';
import { IJEPage } from '../models/ije-page';
import { IJESort } from '../models/ije-sort';

export class IJEDataRenderService {
    static renderPagination(translations: IJEDataTranslation[], page: IJEPage, withPageSizeSelector: boolean = true) {
        let render = '<div class="container-fluid" style="margin: 0px; padding: 0px;">';
        render += '<div class="row" style="margin: 0px; padding: 0px;">';
        render += '<div class="col-4">';
        render += '<div class="mt-3">';
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

    private static _getTableHeader(column: string, position, sort: IJESort) {
        let style = position >= 0 ? `position: sticky; left: ${position}px; z-index: 1000;` : '';
        return `<th class="text-center" style="background: #1f1f1f; cursor: pointer; ${style}" onclick="sort('${column}',${sort.column === column ? !sort.ascending : true})">
           ${column}             
           ${sort.column === column ? (sort.ascending ? '<i class="icon-up-open"></i>' : '<i class="icon-down-open"></i>') : ''}
            
        </th>`;
    }

    static renderTable(translations: IJEDataTranslation[], languages: string[], page: IJEPage, sort: IJESort, showFolder: boolean = true, hasTranslateService = false) {
        let render = '<table class="table table-borderless" style="margin-left: -10px; margin-top: 80px;" >';
        render += '<tr>';
        render += '<th style="background: #1f1f1f; position: sticky; left: 0px; z-index: 1000; width: 100px; maxWidth: 100px; margin: 0px; padding: 0px;"> </th>';
        const folders = IJEConfiguration.WORKSPACE_FOLDERS;
        if (showFolder && folders.length > 1) {
            render += this._getTableHeader('FOLDER', -1, sort);
        }
        render += this._getTableHeader('KEY', 100, sort);

        let _defaultARB = 'app_en';
        folders.forEach(d => {
            _defaultARB = d.arb;
        });

        if (_defaultARB.indexOf('.') !== -1) {
            _defaultARB = _defaultARB.substring(0, _defaultARB.indexOf('.'));
        }

        languages.sort((a, b) => {
            if (a === _defaultARB) {
                return -1;
            }
            if (b === _defaultARB) {
                return 0;
            }
            return a > b ? 1 : -1;
        });

        languages.forEach((language: string) => {
            if (language === _defaultARB) {
                render += `${this._getTableHeader(language, 425, sort)}`;
            } else {
                render += `${this._getTableHeader(language, -1, sort)}`;
            }
        });
        render += '</tr>';

        translations.forEach(t => {
            render += '<tr style="background: #CC21D2; padding: 0px; margin: 0px; left: 0px">';
            render +=
                `<td style="background: #1f1f1f; width: 100px; maxWidth: 100px; white-space: nowrap; position: sticky; left: 0px; z-index: 1000; margin: 0px; padding: 0px;">` +
                `<button type="button" class="btn" style="width: 100px; maxWidth: 100px;" onclick="remove(${t.id})"><i class="error-vscode icon-trash-empty"></i></button></td>`;

            if (showFolder && folders.length > 1) {
                render += `<td style="background: #1f1f1f;"><select id="select-folder-${t.id}" class="form-control" onchange="updateFolder(this,${t.id})">`;

                folders.forEach(d => {
                    render += `<option value='${d.path.replace(/"/g, '&quot;')}' ${d.path === t.folder ? 'selected' : ''}>${d.folder}</option>`;
                });

                render += ' </select></td>';
            }

            let indent = 0;
            let width = 301;
            if (sort.column === 'KEY' && !t.key.startsWith('@@') && t.key.startsWith('@')) {
                let i = t.key.length - t.key.replace(/\./g, '').length;
                for (let j = 0; j < i; ++j) {
                    indent += 10;
                    width -= 10;
                }
            }

            render += `<td style="background: #1f1f1f; white-space: nowrap; position: sticky; left: 100px; z-index: 1000;">
                    <input id="input-key-${t.id}" class="form-control ${
                t.valid ? '' : 'is-invalid'
            }" style="width: ${width}px; margin-left: ${indent}px" type="text" placeholder="Key..." value="${t.key.replace(/"/g, '&quot;')}" onfocus="mark(${
                t.id
            })" onchange="updateInput(this,${t.id});" />
                    <div id="input-key-${t.id}-feedback" class="invalid-feedback error-vscode">${t.error}</div>
                </td>
            `;

            languages.forEach((language: string) => {
                render += `<td style="background: #1f1f1f; ${language === _defaultARB ? 'position: sticky; left: 425px; z-index: 1000;' : ''}">`;
                if (hasTranslateService) {
                    render += `<div class="input-group" style="minWith: 330px; width: 330px; white-space: nowrap;">`;
                }
                render += `<input class="form-control" style="minWith: 270px; width: 270px; white-space: nowrap;" type="text" placeholder="Translation..." onfocus="mark(${t.id})" onchange="updateInput(this,${t.id},'${language}');" `;
                if (t.languages[language]) {
                    render += `value="${t.languages[language].replace(/\n/g, '\\n').replace(/"/g, '&quot;')}" `;
                }
                render += '/>';
                if (hasTranslateService) {
                    const style = language === _defaultARB ? 'style="background: green; white-space: nowrap;"' : 'style="white-space: nowrap;"';
                    render +=
                        `<div class="input-group-append" ${style}>` +
                        `<button type="button" class="btn btn-vscode" ${style} onclick="translateInput(this,${t.id}, '${_defaultARB}', '${
                            _defaultARB === language ? languages.join(',') : language
                        }');"><i class="icon-language"></i></button>
                        </div>`;
                    render += '</div>';
                }
                render += '</td>';
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
        languages: string[],
        page: IJEPage,
        sort: IJESort,
        showFolder: boolean = true,
        hasTranslateService = false
    ) {
        let render = '<div class="container-fluid">';
        render += '<div class="row">';
        render += '<div class="col-4">';
        render += '<div style="word-wrap: break-word;" class="list-group">';
        translations.forEach(t => {
            let indent = 10;
            //let width = 400;
            if (sort.column === 'KEY' && !t.key.startsWith('@@') && t.key.startsWith('@')) {
                let i = t.key.length - t.key.replace(/\./g, '').length;
                for (let j = 0; j < i; ++j) {
                    indent += 10;
                    //width -= 10;
                }
            }
            render += `<a href="#" id="select-key-${t.id}" onclick="select(${
                t.id
            })" style="padding-left: ${indent}px" class="btn-vscode-secondary list-group-item list-group-item-action ${
                selectTranslation && selectTranslation.id === t.id ? 'active' : ''
            }">${t.key === '' ? '&nbsp;' : t.key}</a>`;
        });
        render += '</div>';
        render += this.renderPagination(translations, page, false);
        render += '</div>';

        render += '<div class="col-7">';

        if (selectTranslation) {
            const folders = IJEConfiguration.WORKSPACE_FOLDERS;
            if (showFolder && folders.length > 1) {
                render += ` 
                  <div class="form-group">
                    <label>Directory</label>
                    <div class="row">
                      <div class="col-12">
                        <select id="select-folder-${selectTranslation.id}" class="form-control" onchange="updateFolder(this,${selectTranslation.id})">`;

                folders.forEach(d => {
                    render += `<option value='${d.path}' ${d.path === selectTranslation.folder ? 'selected' : ''}>${d.name}</option>`;
                });
                render += `
                        </select>               
                      </div>
                    </div>
                  </div>`;
            }

            render += `
                <div class="form-group">
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
            languages.forEach((language: string) => {
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
                    render += `</div>
                                    <div class="col-2">
                                        <button type="button" class="btn btn-vscode" onclick="translateInput(this,${selectTranslation.id}, '${language}');"><i class="icon-language"></i></button>
                                    </div>
                                </div>
                            `;
                }
            });
        }

        render += '</div>';
        render += '</div>';
        render += '</div>';
        return render;
    }
}

