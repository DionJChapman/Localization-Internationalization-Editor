import * as vscode from "vscode";
import * as _path from "path";

import { IJEManager } from "./ije-manager";
import { IJEConfiguration } from "./ije-configuration";

export class IJEEditorProvider {
  private static readonly viewType = "i18n-l10n-editor.editor";

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    vscode.commands.executeCommand('setContext', 'ext:supportedFolders',IJEConfiguration.SUPPORTED_FOLDERS);

    return vscode.commands.registerCommand("i18n-l10n-editor", (uri: vscode.Uri) => {
      const panel = vscode.window.createWebviewPanel("i18n-l10n-editor", "i18n-l10n-editor", vscode.ViewColumn.One, {
        retainContextWhenHidden: true,
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(_path.join(context.extensionPath, "media"))],
      });

      const manager = new IJEManager(context, panel, uri ? uri.fsPath : null);
    });
  }

  constructor(private readonly _context: vscode.ExtensionContext) {}
}
