import * as vscode from 'vscode';
import * as _path from 'path';

import { IJEEditorProvider } from './i18n-l10n-editor/providers/ije-editor-provider';
import { IJEConfiguration } from './i18n-l10n-editor/ije-configuration';
import { findYAML } from './i18n-l10n-editor/services/find_yaml';
import { LocalizationActionProvider } from './i18n-l10n-editor/providers/localizationActionProvider';
import { InputBoxCommand } from './i18n-l10n-editor/commands/inputBoxCommand';
import { CommandParameters } from './i18n-l10n-editor/commands/commandParameters';
import { EditFilesCommand } from './i18n-l10n-editor/commands/editFilesCommand';
import { EditFilesParameters } from './i18n-l10n-editor/commands/editFilesParameters';
import { setEditFilesParameters } from './i18n-l10n-editor/commands/setEditFilesParameters';
import { applySaveAndRunFlutterPubGet } from './i18n-l10n-editor/applySaveAndRunFlutterPubGet';

export async function activate(context: vscode.ExtensionContext) {
    const { activeTextEditor } = vscode.window;

    if (vscode.workspace.workspaceFolders !== undefined) {
        let myStatusBarItem: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        const version = vscode.extensions.getExtension("NativeBit.i18n-l10n-editor");
        myStatusBarItem.command = 'i18n-l10n-editor';
        myStatusBarItem.text = `$(globe) i18n/l10n Editor ${version}`;
        myStatusBarItem.show();

        context.subscriptions.push(await IJEEditorProvider.register(context));

        context.subscriptions.push(
            vscode.languages.registerCodeActionsProvider('dart', new LocalizationActionProvider(), {
                providedCodeActionKinds: LocalizationActionProvider.providedCodeActionKinds
            })
        );

        context.subscriptions.push(
            vscode.commands.registerCommand(InputBoxCommand.commandName, async (...args: CommandParameters[]): Promise<void> => {
                const editFilesParameters = await setEditFilesParameters(args[0]);
                await vscode.commands.executeCommand(EditFilesCommand.commandName, editFilesParameters);
            })
        );

        context.subscriptions.push(
            vscode.commands.registerCommand(EditFilesCommand.commandName, async (...args: EditFilesParameters[]): Promise<void> => applySaveAndRunFlutterPubGet(args[0]))
        );

        IJEConfiguration.arbFolders = await findYAML(vscode.workspace.workspaceFolders[0].uri.path);
    }
}

