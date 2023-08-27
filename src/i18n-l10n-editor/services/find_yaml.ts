import * as vscode from 'vscode';
import * as yaml from 'yaml';
import * as fs from 'fs';
import * as os from 'os';

import { capalize } from '../shared/capalize';
import { promises } from 'dns';
import { IJEFolder } from '../models/ije-folder';
import { IJEConfiguration } from '../ije-configuration';
import { url } from 'inspector';

export async function findYAML(path): Promise<IJEFolder[]> {
    const yamlFileName = 'l10n.yaml';
    let folders: IJEFolder[] = [];
    let pathSeparator = '/';

    if (path === null) {
        path = vscode.workspace.workspaceFolders[0].uri.path;
    }

    if (path.indexOf('\\') !== -1) {
        pathSeparator = '\\';
    }

    let filePath = path;
    if (filePath.split(pathSeparator).length > 2) {
        let split = filePath.split(pathSeparator);
        filePath = `${split[split.length - 1]}`;
    }

    // try to find an l10n.yaml on the workspace path for configuration
    let yamlFiles = await vscode.workspace.findFiles(`${path}${pathSeparator}**${pathSeparator}${yamlFileName}`);

    // try to find a l10n.yaml in the project for configuration
    if (yamlFiles.length === 0) {
        yamlFiles = await vscode.workspace.findFiles(`**${pathSeparator}${yamlFileName}`);
    }

    // try to see if there is a pubspec.yaml for configuration
    if (yamlFiles.length === 0) {
        yamlFiles = await vscode.workspace.findFiles(`**${pathSeparator}pubspec.yaml`);
    }

    // forget about it then
    if (yamlFiles.length === 0) {
        return folders;
    }

    const existingExtensions = IJEConfiguration.SUPPORTED_EXTENSIONS;

    for (let y in yamlFiles) {
        let _name: string;
        let _path: string;
        let _folder: string;
        let _arb: string;
        let _files: string[] = [];

        const yamlFile = yamlFiles[y];

        let yamlPath: string = yamlFile.toString();

        if (yamlPath.indexOf(`${pathSeparator}.`) !== -1) {
            continue;
        }

        if (yamlPath.split(pathSeparator).length > 2) {
            let split = yamlPath.split(pathSeparator);
            yamlPath = `${split[split.length - 2]}`;

            _name = `${capalize(split[split.length - 3]).trim()}${pathSeparator}${capalize(split[split.length - 2]).trim()}`;
            _folder = split[split.length - 2];
        }

        //let s = .toString();
        //if (s.startsWith(`file:${pathSeparator}${pathSeparator}`)) {
        //    s = s.substring(7);
        //}

        let f = fs.readFileSync(yamlFile.fsPath);
        if (f && f.length > 0) {
            let lines = f.toString().split('\n');
            for (let l in lines) {
                let c = lines[l].split(':');
                if (c[0].trim() === 'arb-dir') {
                    _path = c[1].trim();
                } else if (c[0].trim() === 'template-arb-file') {
                    _arb = c[1].trim();
                }
            }
        }
        if (!_path || _path.length === 0) {
            vscode.window.showErrorMessage(`No setting for arb-dir, using default value 'lib/l10n'. File update: ${yamlPath}`);
            _path = 'lib/l10n';
            fs.appendFileSync(yamlFile.fsPath, '\narb-dir: lib/l10n\n');
        }
        if (!_arb || _arb.length === 0) {
            vscode.window.showErrorMessage(`No setting for template-arb-file, using default value 'app_${IJEConfiguration.DEFAULT_LANGUAGE}.arb'. Please update: ${yamlPath}`);
            _arb = `app_${IJEConfiguration.DEFAULT_LANGUAGE}.arb`;
            fs.appendFileSync(yamlFile.fsPath, `\ntemplate-arb-file: ${_arb}\n`);
        }

        if (_path.startsWith(_folder)) {
            _path = _path.substring(_folder.length + 1);
        }
        _name = `${_name} (${_path})`;

        let _arbPath: string = '';
        _files = [];

        const defaultLanguage = IJEConfiguration.DEFAULT_LANGUAGE;

        for (let e in existingExtensions) {
            let ext = existingExtensions[e];
            if (_arbPath.length === 0) {
                let arbFiles = await vscode.workspace.findFiles(`**${pathSeparator}${yamlPath}${pathSeparator}${_path}${pathSeparator}*.${ext}`);

                if (arbFiles.length === 0) {
                    arbFiles = await vscode.workspace.findFiles(`**${pathSeparator}${_path}${pathSeparator}*.${ext}`);
                }

                if (arbFiles.length > 0) {
                    for (let a in arbFiles) {
                        let _file = arbFiles[a].toString();
                        if (_file.indexOf('.history') === -1 && _files.indexOf('node_modules') === -1) {
                            if (_file.lastIndexOf(pathSeparator) !== -1) {
                                _arbPath = _file.substring(7, _file.lastIndexOf(pathSeparator));
                                let _n = _file.substring(_file.lastIndexOf(pathSeparator) + 1);
                                _files.push(_n.replace(`.${ext}`, ''));
                                if (_arb === '' && _n.indexOf(defaultLanguage) !== -1) {
                                    _arb = _n;
                                }
                            }
                        }
                    }
                }
            } else {
                _path = _arbPath;
            }
        }

        let add = true;
        folders.forEach(f => {
            if (f.path === _path) {
                add = false;
            }
        });
        if (add && _arb !== '') {
            if (os.platform() === 'win32') {
                _path = _path.substring(1);
                _path = _path.replace('%3A', ':');
            }

            folders.push({ name: _name, path: _path, arb: _arb, folder: _folder, languages: _files });
        }
    }

    const supportedFolders = IJEConfiguration.SUPPORTED_FOLDERS;
    const defaultLanguage = IJEConfiguration.DEFAULT_LANGUAGE;

    for (let f in supportedFolders) {
        let folder = supportedFolders[f];
        let _name = '',
            _path = '',
            _arb = '',
            _folder = '',
            _files = [];
        for (let e in existingExtensions) {
            let ext = existingExtensions[e];
            let arbFiles = await vscode.workspace.findFiles(`**${pathSeparator}${folder}${pathSeparator}*.${ext}`);

            if (arbFiles.length > 0) {
                for (let a in arbFiles) {
                    let _file = arbFiles[a].toString();
                    if (_file.indexOf('.history') === -1 && _file.indexOf('node_modules') === -1) {
                        if (_file.lastIndexOf(pathSeparator) !== -1) {
                            _path = _file.substring(7, _file.lastIndexOf(pathSeparator));
                            _name = _file.substring(_file.lastIndexOf(pathSeparator) + 1);
                            if (_arb === '') {
                                _arb = _name;
                            }
                            if (_name.indexOf(defaultLanguage) !== -1) {
                                _arb = _name;
                            }
                            _files.push(_name.replace(`.${ext}`, ''));
                        }
                    }
                }
                let split = _path.split('/');
                let i = split.length - 1;
                if (split[i].toLocaleLowerCase() === 'lib' || split[i].toLocaleLowerCase() === 'src') {
                    --i;
                }
                if (split[i].toLocaleLowerCase() === folder) {
                    --i;
                }
                if (i === 0) {
                    _name = `${capalize(split[i]).trim()} (${folder})`;
                } else {
                    _name = `${capalize(split[i - 1]).trim()}/${capalize(split[i]).trim()} (${folder})`;
                }
                _folder = split[split.length - 2];
            }
        }
        let add = true;
        folders.forEach(f => {
            if (f.path === _path) {
                add = false;
            }
        });
        if (add && _arb !== '') {
            if (os.platform() === 'win32') {
                _path = _path.substring(1);
                _path = _path.replace('%3A', ':');
            }

            folders.push({ name: _name, path: _path, arb: _arb, folder: _folder, languages: _files });
        }
    }

    return folders;
}

