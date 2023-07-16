import * as vscode from 'vscode';
import * as _path from 'path';

import { IJEEditorProvider } from './i18n-l10n-editor/providers/ije-editor-provider';
import { IJEConfiguration } from './i18n-l10n-editor/ije-configuration';

export function activate(context: vscode.ExtensionContext) {
    if (IJEConfiguration.WORKSPACE_FOLDERS) {
        let myStatusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10);
        myStatusBarItem.command = 'i18n-l10n-editor';
        myStatusBarItem.text = `$(globe)$(whole-word) i18n/l10n Editor`;
        myStatusBarItem.show();
    }

    context.subscriptions.push(IJEEditorProvider.register(context));
}
