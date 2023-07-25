import * as vscode from 'vscode';
import * as yaml from 'yaml';
import * as fs from 'fs';

import { capalize } from '../shared/capalize';
import { promises } from 'dns';
import { IJEFolder } from '../models/ije-folder';
import { IJEConfiguration } from '../ije-configuration';

export async function findYAML(path): Promise<IJEFolder[]> {
    const yamlFileName = 'l10n.yaml';
    let folders: IJEFolder[] = [];

    if (path === null) {
        path = vscode.workspace.workspaceFolders[0].uri.fsPath;
    }

    let filePath = path;
    if (filePath.split('/').length > 2) {
        let split = filePath.split('/');
        filePath = `${split[split.length - 1]}`;
    }

    let yamlFiles = await vscode.workspace.findFiles(`${path}/**/${yamlFileName}`);

    if (yamlFiles.length === 0) {
        yamlFiles = await vscode.workspace.findFiles(`**/${yamlFileName}`);
    }

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

        if (yamlPath.split('/').length > 2) {
            let split = yamlPath.split('/');
            yamlPath = `${split[split.length - 2]}`;

            _name = `${capalize(split[split.length - 3]).trim()}/${capalize(split[split.length - 2]).trim()}`;
            _folder = split[split.length - 2];
        }

        let s = yamlFile.toString();
        if (s.startsWith('file://')) {
            s = s.substring(7);
        }

        let f = fs.readFileSync(s);
        let lines = f.toString().split("\n");
        for (let l in lines) {
            let c = lines[l].split(":");
            if (c[0] === 'arb-dir') {
                _path = c[1].trim();
            } else if (c[0] === 'template-arb-file') {
                _arb = c[1].trim();
            }
        }
        if (_arb === '') {
            _arb = "app_en.arb";
        }
        
        if (_path.startsWith(_folder)) {
            _path = _path.substring(_folder.length + 1);
        }
        _name = `${_name} (${_path})`;

        let _arbPath: string = '';
        _files = [];

        for (let e in existingExtensions) {
            let ext = existingExtensions[e];
            if (_arbPath.length === 0) {
                let arbFiles = await vscode.workspace.findFiles(`**/${yamlPath}/${_path}/*.${ext}`);

                if (arbFiles.length === 0) {
                    arbFiles = await vscode.workspace.findFiles(`**/${_path}/*.${ext}`);
                }

                if (arbFiles.length > 0) {
                    for (let a in arbFiles) {
                        let _file = arbFiles[a].toString();
                        if (_file.indexOf('.history') === -1 && _files.indexOf('node_modules') === -1) {
                            if (_file.lastIndexOf('/') !== -1) {
                                _arbPath = _file.substring(7, _file.lastIndexOf('/'));
                                let _n = _file.substring(_file.lastIndexOf('/') + 1);
                                _files.push(_n.replace(`.${ext}`, ""));
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
        if (add) {
            folders.push({ name: _name, path: _path, arb: _arb, folder: _folder, languages: _files});
        }

    }

    /* filter(f => {
            f.path === _path;
        }).*/

    // lets see if we can find any other translations
    const supportedFolders = IJEConfiguration.SUPPORTED_FOLDERS;
    const defaultLanguage = IJEConfiguration.DEFAULT_LANGUAGE;

    for (let f in supportedFolders) {
        let folder = supportedFolders[f];
        let _name = "", _path = "", _arb = "", _folder = "", _files = [];
        for (let e in existingExtensions) {
            let ext = existingExtensions[e];
            let arbFiles = await vscode.workspace.findFiles(`**/${folder}/*.${ext}`);

            if (arbFiles.length > 0) {
                for (let a in arbFiles) {
                    let _file = arbFiles[a].toString();
                    if (_file.indexOf('.history') === -1 && _file.indexOf('node_modules') === -1) {
                        if (_file.lastIndexOf('/') !== -1) {
                            _path = _file.substring(7, _file.lastIndexOf('/'));
                            _name = _file.substring(_file.lastIndexOf('/') + 1);
                            if (_arb === "") {
                                _arb = _name;
                            }
                            if (_name.indexOf(defaultLanguage) !== -1) {
                                _arb = _name;
                            }
                            _files.push(_name.replace(`.${ext}`, ""));                            
                        }
                    }
                }
                let split = _path.split("/");
                let i = split.length - 1;
                if (split[i].toLocaleLowerCase() === "lib" || split[i].toLocaleLowerCase() === "src") {
                    --i;
                }
                if (split[i].toLocaleLowerCase() === folder) {
                    --i;
                }
                _name = `${capalize(split[i - 1]).trim()}/${capalize(split[i]).trim()} (${folder})`;
                _folder = split[split.length - 2];    
            }
        }
        let add = true;
        folders.forEach(f => {
            if (f.path === _path) {
                add = false;
            }
        });
        if (add) {
            folders.push({ name: _name, path: _path, arb: _arb, folder: _folder, languages: _files });
        }
    }


    return folders;
}

