import * as vscode from 'vscode';
import * as fs from 'fs';
import * as _path from 'path';

import { IJEFolder } from './models/ije-folder';
import { TranslationServiceEnum } from './services/ije-translation-service';

export class IJEConfiguration {
    static get FORCE_KEY_UPPERCASE(): boolean {
        const value = vscode.workspace.getConfiguration().get<boolean>('i18nJsonEditor.forceKeyUPPERCASE');
        return value !== undefined ? value : true;
    }

    static get SORT_KEY_TOGETHER(): boolean {
        const value = vscode.workspace.getConfiguration().get<boolean>('i18nJsonEditor.sortKeyTogether');
        return value !== undefined ? value : true;
    }

    static get JSON_SPACE(): string | number {
        const value = vscode.workspace.getConfiguration().get<string | number>('i18nJsonEditor.jsonSpace');
        return value !== undefined ? value : 4;
    }

    static get KEY_SEPARATOR(): string | false {
        const value = vscode.workspace.getConfiguration().get<string | boolean>('i18nJsonEditor.keySeparator');
        return value !== undefined && value !== true ? value : '.';
    }

    static get LINE_ENDING(): string {
        const value = vscode.workspace.getConfiguration().get<string>('i18nJsonEditor.lineEnding');
        return value !== undefined ? value : '\n';
    }

    static get SUPPORTED_FOLDERS(): string[] {
        const value = vscode.workspace.getConfiguration().get<string[]>('i18nJsonEditor.supportedFolders');
        return value !== undefined ? value : ['l10n', 'i18n'];
    }
    static get SUPPORTED_EXTENSIONS(): string[] {
        const value = vscode.workspace.getConfiguration().get<string[]>('i18nJsonEditor.supportedExtensions');
        return value !== undefined ? value : ['arb', 'json'];
    }
    static get TRANSLATION_SERVICE(): TranslationServiceEnum {
        const value = vscode.workspace.getConfiguration().get<TranslationServiceEnum>('i18nJsonEditor.translationService');
        return value !== undefined ? value : null;
    }

    static get TRANSLATION_SERVICE_API_KEY(): string {
        const value = vscode.workspace.getConfiguration().get<string>('i18nJsonEditor.translationServiceApiKey');
        return value !== undefined ? value : null;
    }

    static arbFolders: IJEFolder[] = [];

    static get WORKSPACE_FOLDERS(): IJEFolder[] {
        const _folders: IJEFolder[] = [];

        let folders;
        if (this.arbFolders.length !== 0) {
            folders = this.arbFolders;

            folders.forEach(d => {
                var path = vscode.Uri.file(d.path).fsPath;
                if (fs.existsSync(path)) {
                    _folders.push({ name: d.name, path: path, arb: d.arb });
                }
            });
        } else {
            folders = vscode.workspace.getConfiguration().get<IJEFolder[]>('i18nJsonEditor.workspaceFolders');
            let workspaceFolder: vscode.WorkspaceFolder | undefined = vscode.workspace.workspaceFolders[0];

            folders.forEach(d => {
                var path = vscode.Uri.file(_path.join(workspaceFolder.uri.fsPath, d.path)).fsPath;
                if (fs.existsSync(path)) {
                    _folders.push({ name: d.name, path: path, arb: d.arb });
                }
            });
        }

        return _folders !== undefined ? _folders : [];
    }
}

