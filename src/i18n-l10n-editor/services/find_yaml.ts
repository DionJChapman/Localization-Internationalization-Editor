import * as vscode from 'vscode';
import * as yaml from 'yaml';
import * as fs from 'fs';

import { IJEConfigARB } from '../models/ije-config-arb';
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

    let existingExtensions = IJEConfiguration.SUPPORTED_EXTENSIONS;

    for (let y in yamlFiles) {
        let _name: string;
        let _path: string;
        let _arb: string;

        const yamlFile = yamlFiles[y];

        let yamlPath: string = yamlFile.toString();

        if (yamlPath.split('/').length > 2) {
            let split = yamlPath.split('/');
            yamlPath = `${split[split.length - 2]}`;

            _name = `${capalize(split[split.length - 3]).trim()}/${capalize(split[split.length - 2]).trim()}`;
        }
        //     // if (yamlPath.lastIndexOf('/') > 0) {
        //     //   yamlPath = yamlPath.substring(yamlPath.lastIndexOf('/') + 1);
        //     // }

        let s = yamlFile.toString();
        if (s.startsWith('file://')) {
            s = s.substring(7);
        }

        let f = fs.readFileSync(s);
        let lines = f.toString().split("\n");
        for (let l in lines) {
            let c = lines[l].split(":");
            if (c[0] == 'arb-dir') {
                _path = c[1].trim();
            } else if (c[0] == 'template-arb-file') {
                _arb = c[1].trim();
            }
        }
        if (_arb === '') {
            _arb = "app_en.arb";
        }

        // const parsedConfiguration = yaml.parseDocument(f.toString());
        // const arbDir = parsedConfiguration.get('arb-dir') as string;
        // const templateArbFileName = (parsedConfiguration.get('template-arb-file') as string | undefined) ?? 'app_en.arb';

        // _path = arbDir;
        // _arb = templateArbFileName;

        let _arbPath: string = '';

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
                        if (_file.indexOf('.history') === -1) {
                            if (_file.lastIndexOf('/') !== -1) {
                                _arbPath = _file.substring(7, _file.lastIndexOf('/'));
                                break;
                            }
                        }
                    }
                }
            } else {
                _path = _arbPath;
            }
        }

        folders.push({ name: _name, path: _path, arb: _arb });
    }

    return folders;
}

