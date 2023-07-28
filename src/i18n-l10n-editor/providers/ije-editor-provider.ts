import * as vscode from 'vscode';
import * as _path from 'path';

import { IJEConfiguration } from '../ije-configuration';
import { IJEManager } from '../ije-manager';

export class IJEEditorProvider {
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        vscode.commands.executeCommand('setContext', 'ext:supportedFolders', IJEConfiguration.SUPPORTED_FOLDERS);

        return vscode.commands.registerCommand('i18n-l10n-editor', (uri: vscode.Uri) => {
            const panel = vscode.window.createWebviewPanel('i18n-l10n-editor', 'i18n/l10n Editor', vscode.ViewColumn.One, {
                retainContextWhenHidden: true,
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(_path.join(context.extensionPath, 'media'))]
            });

            new IJEManager(context, panel, uri ? uri.fsPath : null);
        });
    }

    constructor(private readonly _context: vscode.ExtensionContext) {}
}
