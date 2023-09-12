import axios, { AxiosError, AxiosResponse, AxiosResponseTransformer } from 'axios';
import * as vscode from 'vscode';
import * as Translate from '@google-cloud/translate';

import { IJEConfiguration } from '../../ije-configuration';
import { IJETranslation } from './ije-translation';
import { IJEDataTranslation } from '../../models/ije-data-translation';
import { IJEManager } from '../../ije-manager';

export class IJEGoogleTranslator implements IJETranslation {
    results: { [language: string]: string };
    _manager: IJEManager;
    async translate(text: string, translation: IJEDataTranslation, language: string, languages: string[]): Promise<{ [language: string]: string }> {
        const apiKey = IJEConfiguration.TRANSLATION_SERVICE_GOOGLE_KEY || IJEConfiguration.TRANSLATION_SERVICE_API_KEY;
        if (apiKey && apiKey.length === 0) {
            vscode.window.showErrorMessage('Your Google API Key is blank. please update setting i18nJsonEditor.translationServiceApiKey');

            return { [language]: text };
        }

        const apiRegion = IJEConfiguration.TRANSLATION_SERVICE_GOOGLE_REGION || IJEConfiguration.TRANSLATION_SERVICE_API_REGION;
        if (apiRegion && apiRegion.length === 0) {
            vscode.window.showErrorMessage('Your Google API Region is blank. please update setting i18nJsonEditor.translationServiceApiRegion');

            return { [language]: text };
        }

        const endpoint = 'https://translate.googleapis.com';

        let _languages = [];

        if (text === undefined || text.length === 0) {
            return { [language]: text };
        }

        // we only need the language and not the file name
        let split = language.split('_');
        if (split.length === 2 && split[0].length === 2) {
            language = split[0];
        } else if (split.length === 2) {
            language = split[1];
        } else if (split.length === 3) {
            language = split[1];
        }

        for (let l = 0; l < languages.length; ++l) {
            let lang = languages[l];
            let split = lang.split('_');
            if (split.length === 2 && split[0].length === 2) {
                lang = split[0];
            } else if (split.length === 2) {
                lang = split[1];
            } else if (split.length === 3) {
                lang = split[1];
            }
            if (language !== languages[l]) {
                _languages.push(lang);
            }
        }

        // need to save the {text} so we can put them back afterwards
        const _substitutes: string[] = [];
        let place = 0;
        while (true) {
            if (text.indexOf('}', place) > text.indexOf('{', place)) {
                _substitutes.push(text.substring(text.indexOf('{', place), text.indexOf('}', place) + 1));
                place = text.indexOf('}', place) + 1;
            } else {
                break;
            }
        }

        await _languages.forEach(async lang => {
            try {
                const translate = new Translate.v2.Translate();
                translate.key = apiKey;
                translate.projectId = apiRegion;

                const options = {
                    to: lang.split('/')[0].replace('_', '-'),
                    from: language.split('/')[0].replace('_', '-'),
                    model: 'base'
                };

                let [translations] = await translate.translate(text, options);

                languages
                    .filter(l => l !== language)
                    .forEach(l => {
                        if (l.endsWith(lang) || l.endsWith(lang.replace('_', '-').split('-')[0]) || l.startsWith(lang) || l.startsWith(lang.replace('_', '-').split('-')[0])) {
                            let _text = translations;
                            place = 0;
                            _substitutes.forEach(s => {
                                if (_text.indexOf('}', place) > _text.indexOf('{', place)) {
                                    _text = _text.substring(0, _text.indexOf('{', place)) + s + _text.substring(_text.indexOf('}', place) + 1);
                                    place = _text.indexOf('}', place) + 1;
                                }
                            });
                            translation.languages[l] = _text;
                            this._manager.refreshDataTable();
                        }
                    });

                return this.results;
            } catch (e) {
                let err = e as AxiosError;
                let r = err.response as AxiosResponse;
                vscode.window.showErrorMessage(`${e.toString()}\n${r !== undefined ? r.data : ''}\nlangage ${lang} - ${text}`);
            }
        });
    }
}
