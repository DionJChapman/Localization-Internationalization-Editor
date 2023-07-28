import * as vscode from 'vscode';
import { EditFilesParameters } from './commands/editFilesParameters';
import { IJEManager } from './ije-manager';
//import { getChangesForArbFiles } from '../getChangesForArbFiles';
//import { runFlutterPubGet } from './runFlutterPubGet';

export async function applySaveAndRunFlutterPubGet(editFilesParameters: EditFilesParameters): Promise<void> {
    const { workspace } = vscode;

    if (!IJEManager.manager) {
        vscode.commands.executeCommand('i18n-l10n-editor');
    }

    const manager: IJEManager = IJEManager.manager;

    if (manager) {
        let file = editFilesParameters.uri.path;
        if (file.lastIndexOf('/') !== -1) {
            file = file.substring(file.lastIndexOf('/') + 1);
            if (editFilesParameters.description !== "") {
                manager.addKey(`@${editFilesParameters.keyValue.key}.description`, editFilesParameters.description);
            } else {
                manager.addKey(`@${editFilesParameters.keyValue.key}.description`, `Added from file ${file}`);
            }
        }
        if (editFilesParameters.placeholders) {
            let value = editFilesParameters.keyValue.value;
            editFilesParameters.placeholders.forEach(p => {
                if (value.toLocaleLowerCase().indexOf("$" + p.name.toLocaleLowerCase()) !== -1) {
                    value = value.substring(0, value.toLocaleLowerCase().indexOf("$" + p.name.toLocaleLowerCase())) + 
                    "{" + p.name + "}" +
                    value.substring(value.toLocaleLowerCase().indexOf("$" + p.name.toLocaleLowerCase()) + ("$" + p.name).length);
                    //value = value.replace("$" + p.name, "{" + p.name + "}");
                } else if (value.toLocaleLowerCase().indexOf("${" + p.name.toLocaleLowerCase() + "}") !== -1) {
                    value = value.substring(0, value.toLocaleLowerCase().indexOf("${" + p.name.toLocaleLowerCase() + 
                    "}")) + "{" + p.name + "}" +
                    value.substring(value.toLocaleLowerCase().indexOf("${" + p.name.toLocaleLowerCase() + "}") + ("${" + p.name + "}").length);
                    //value = value.replace("${" + p.name + "}", "{" + p.name + "}");
                }
                manager.addKey(`@${editFilesParameters.keyValue.key}.placeholders.${p.name}.type`, p.type);
                manager.addKey(`@${editFilesParameters.keyValue.key}.placeholders.${p.name}.example`, p.name);  
            });
            manager.addKey(editFilesParameters.keyValue.key, value);
        } else {
            manager.addKey(editFilesParameters.keyValue.key, editFilesParameters.keyValue.value);
        }

        //const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        //sleep(250);

        IJEManager.manager.search(editFilesParameters.keyValue.key);
    }
}

