import * as vscode from 'vscode';
import * as _path from 'path';

import { IJEEditorProvider } from './i18n-l10n-editor/providers/ije-editor-provider';
import { IJEConfiguration } from './i18n-l10n-editor/ije-configuration';
import { IJEFolder } from './i18n-l10n-editor/models/ije-folder';
import { findYAML } from './i18n-l10n-editor/services/find_yaml';

export async function activate(context: vscode.ExtensionContext) {
    const { activeTextEditor } = vscode.window;

    let myStatusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    myStatusBarItem.command = 'i18n-l10n-editor';
    myStatusBarItem.text = `$(globe) i18n/l10n Editor`;
    myStatusBarItem.show();

    context.subscriptions.push(await IJEEditorProvider.register(context));

    IJEConfiguration.arbFolders = await findYAML(vscode.workspace.workspaceFolders[0].uri.fsPath);
}

