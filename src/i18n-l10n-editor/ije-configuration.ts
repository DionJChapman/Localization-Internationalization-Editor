import * as vscode from 'vscode';
import * as fs from 'fs';
import * as _path from 'path';

import { IJEFolder } from './models/ije-folder';
import { TranslationServiceEnum } from './services/ije-translation-service';

export class IJEConfiguration {
    static get FORCE_KEY_UPPERCASE(): boolean {
        const value = vscode.workspace.getConfiguration().get<boolean>('i18n-l10n-editor.forceKeyUPPERCASE');
        return value !== undefined ? value : true;
    }

    static get KEY_CASE_STYLE(): string {
        const value = vscode.workspace.getConfiguration().get<string>('i18n-l10n-editor.keyCaseStyle');
        return value !== undefined ? value : 'camelCase';
    }

    static get KEY_AUTO_TRANSLATE(): boolean {
        const value = vscode.workspace.getConfiguration().get<boolean>('i18n-l10n-editor.autoTranslateNewLanguage');
        return value !== undefined ? value : true;
    }

    static get SORT_KEY_TOGETHER(): boolean {
        const value = vscode.workspace.getConfiguration().get<boolean>('i18n-l10n-editor.sortKeyTogether');
        return value !== undefined ? value : true;
    }

    static get JSON_SPACE(): string | number {
        const value = vscode.workspace.getConfiguration().get<string | number>('i18n-l10n-editor.jsonSpace');
        return value !== undefined ? value : 4;
    }

    static get KEY_SEPARATOR(): string | false {
        const value = vscode.workspace.getConfiguration().get<string | boolean>('i18n-l10n-editor.keySeparator');
        return value !== undefined && value !== true ? value : '.';
    }

    static get LINE_ENDING(): string {
        const value = vscode.workspace.getConfiguration().get<string>('i18n-l10n-editor.lineEnding');
        return value !== undefined ? value : '\n';
    }

    static get SUPPORTED_YAML_FILES(): string[] {
        const value = vscode.workspace.getConfiguration().get<string[]>('i18n-l10n-editor.supportedYamlFiles');
        return value !== undefined ? value : ["i18n.yaml", "l10n.yaml", "r13n.yaml", "pubspec.yaml"];
    }
    static get SUPPORTED_FOLDERS(): string[] {
        const value = vscode.workspace.getConfiguration().get<string[]>('i18n-l10n-editor.supportedFolders');
        return value !== undefined ? value : ['l10n', 'i18n'];
    }
    static get SUPPORTED_EXTENSIONS(): string[] {
        const value = vscode.workspace.getConfiguration().get<string[]>('i18n-l10n-editor.supportedExtensions');
        return value !== undefined ? value : ['arb', 'json'];
    }
    static get TRANSLATION_SERVICE(): TranslationServiceEnum {
        const value = vscode.workspace.getConfiguration().get<TranslationServiceEnum>('i18n-l10n-editor.translationService');
        return value !== undefined ? value : null;
    }

    static get TRANSLATION_SERVICE_API_KEY(): string {
        const value = vscode.workspace.getConfiguration().get<string>('i18n-l10n-editor.translationServiceApiKey');
        return value !== undefined ? value : null;
    }

    static get TRANSLATION_SERVICE_API_SECRET(): string {
        const value = vscode.workspace.getConfiguration().get<string>('i18n-l10n-editor.translationServiceApiSecret');
        return value !== undefined ? value : null;
    }

    static get TRANSLATION_SERVICE_API_REGION(): string {
        const value = vscode.workspace.getConfiguration().get<string>('i18n-l10n-editor.translationServiceApiRegion');
        return value !== undefined ? value : null;
    }

    static get TRANSLATION_SERVICE_AMAZON_KEY(): string {
        const value = vscode.workspace.getConfiguration().get<string>('i18n-l10n-editor.translationServiceAmazon');
        return value !== undefined && value.length === 3 ? value[0] : null;
    }
    static get TRANSLATION_SERVICE_AMAZON_SECRET(): string {
        const value = vscode.workspace.getConfiguration().get<string>('i18n-l10n-editor.translationServiceAmazon');
        return value !== undefined && value.length === 3 ? value[1] : null;
    }
    static get TRANSLATION_SERVICE_AMAZON_REGION(): string {
        const value = vscode.workspace.getConfiguration().get<string>('i18n-l10n-editor.translationServiceAmazon');
        return value !== undefined && value.length === 3 ? value[2] : null;
    }

    static get TRANSLATION_SERVICE_GOOGLE_KEY(): string {
        const value = vscode.workspace.getConfiguration().get<string>('i18n-l10n-editor.translationServiceGoogle');
        return value !== undefined && value.length === 3 ? value[0] : null;
    }
    static get TRANSLATION_SERVICE_GOOGLE_SECRET(): string {
        const value = vscode.workspace.getConfiguration().get<string>('i18n-l10n-editor.translationServiceGoogle');
        return value !== undefined && value.length === 3 ? value[1] : null;
    }
    static get TRANSLATION_SERVICE_GOOGLE_REGION(): string {
        const value = vscode.workspace.getConfiguration().get<string>('i18n-l10n-editor.translationServiceGoogle');
        return value !== undefined && value.length === 3 ? value[2] : null;
    }

    static get TRANSLATION_SERVICE_MICROSOFT_KEY(): string {
        const value = vscode.workspace.getConfiguration().get<string>('i18n-l10n-editor.translationServiceMicrosoft');
        return value !== undefined && value.length === 3 ? value[0] : null;
    }
    static get TRANSLATION_SERVICE_MICROSOFT_SECRET(): string {
        const value = vscode.workspace.getConfiguration().get<string>('i18n-l10n-editor.translationServiceMicrosoft');
        return value !== undefined && value.length === 3 ? value[1] : null;
    }
    static get TRANSLATION_SERVICE_MICROSOFT_REGION(): string {
        const value = vscode.workspace.getConfiguration().get<string>('i18n-l10n-editor.translationServiceMicrosoft');
        return value !== undefined && value.length === 3 ? value[2] : null;
    }

    static get DEFAULT_LANGUAGE(): string {
        const value = vscode.workspace.getConfiguration().get<string>('i18n-l10n-editor.defaultLanguage');
        return value !== undefined ? value : "en";
    }

    static get SUBSTITUTION_TEXT(): string {
        const value = vscode.workspace.getConfiguration().get<string>('i18n-l10n-editor.substitutionText');
        return value !== undefined ? value : "l10n";
    }

    static arbFolders: IJEFolder[] = [];

    static get WORKSPACE_FOLDERS(): IJEFolder[] {
        const _folders: IJEFolder[] = [];

        let folders;
        if (this.arbFolders && this.arbFolders.length !== 0) {
            folders = this.arbFolders;

            folders.forEach(d => {
                var path = vscode.Uri.file(d.path).fsPath;
                if (fs.existsSync(path)) {
                    _folders.push({ name: d.name, path: path, arb: d.arb, folder: d.folder, languages: d.languages});
                } else if (fs.existsSync(d.path)) {
                    _folders.push({ name: d.name, path: d.path, arb: d.arb, folder: d.folder, languages: d.languages});
                }
            });
        } else {
            folders = vscode.workspace.getConfiguration().get<IJEFolder[]>('i18n-l10n-editor.workspaceFolders');
            let workspaceFolder: vscode.WorkspaceFolder | undefined = vscode.workspace.workspaceFolders[0];

            folders.forEach(d => {
                var path = vscode.Uri.file(_path.join(workspaceFolder.uri.fsPath, d.path)).fsPath;
                if (fs.existsSync(path)) {
                    _folders.push({ name: d.name, path: path, arb: d.arb, folder: d.folder, languages: d.languages});
                }
            });
        }

        return _folders !== undefined ? _folders : [];
    }
}

