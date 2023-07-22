import * as vscode from 'vscode';
import { CommandParameters } from './commandParameters';

export class InputBoxCommand implements vscode.Command {
  public static readonly commandName = 'i18n-l10n-editor.inputBox';

  constructor(args: CommandParameters[]) {
  this.title = 'Add text to i18n/l10n Editor';
    this.command = InputBoxCommand.commandName;
    this.arguments = args;
  }

  readonly title: string;

  readonly command: string;

  readonly tooltip?: string;

  readonly arguments?: CommandParameters[];
}
