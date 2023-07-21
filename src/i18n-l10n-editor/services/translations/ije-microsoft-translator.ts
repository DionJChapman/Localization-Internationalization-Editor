import axios, { AxiosError, AxiosResponse, AxiosResponseTransformer } from 'axios';
import * as vscode from 'vscode';

import { IJEConfiguration } from '../../ije-configuration';
import { IJETranslation } from './ije-translation';
import { IJEDataTranslation } from '../../models/ije-data-translation';
import { IJEManager } from '../../ije-manager';

export class IJEMicrosoftTranslator implements IJETranslation {
    results: { [language: string]: string };
    _manager: IJEManager;
    async translate(text: string, translation: IJEDataTranslation, language: string, languages: string[]): Promise<{ [language: string]: string }> {
        const endpoint = 'https://api.cognitive.microsofttranslator.com/';

        let _languages = [];

        // we only need the language and not the file name
        let split = language.split("_");
        if (split.length === 2 && split[0].length === 2) {
            language = split[0];
            // if (split[1].length === 2) {
            //     language += `_${split[1].toLocaleLowerCase()}`;
            // }
        } else if (split.length === 2) {
            language = split[1];
        } else if (split.length === 3) {
            language = split[1];
            // if (split[2].length === 2) {
            //     language += `_${split[2].toLocaleLowerCase()}`;
            // }
        }
        
        for (let l = 0; l < languages.length; ++l) {
            let lang = languages[l];
            let split = lang.split("_");
            if (split.length === 2 && split[0].length === 2) {
                lang = split[0];
                // if (split[1].length === 2) {
                //     lang += `_${split[1].toLocaleUpperCase()}`;
                // }
            } else if (split.length === 2) {
                lang = split[1];
            } else if (split.length === 3) {
                lang = split[1];
                // if (split[2].length === 2) {
                //     lang += `_${split[2].toLocaleUpperCase()}`;
                // }
            }
            if (language !== languages[l]) {
                _languages.push(lang);
            }
        }


        const apiKey = IJEConfiguration.TRANSLATION_SERVICE_API_KEY;
        if (apiKey.length === 0) {
            vscode.window.showErrorMessage("Your Microsoft API is blank. please update setting i18nJsonEditor.translationServiceApiKey");

            return { [language]: text };
        }

        _languages.forEach(async lang => {
            try {
                var response = await axios({
                    baseURL: endpoint + `/translate`,
                    //url: '/translate?api-version=3.0&from=en&to=fr',
                    method: 'post',
                    headers: {
                        'Ocp-Apim-Subscription-Key': '4ee49f8bbe114a9aa255ceb16ba4c4fa',
                        'Ocp-Apim-Subscription-Region': "australiaeast",
                        'Content-type': 'application/json'
                    },
                    params: {
                        'api-version': '3.0',
                        from: language,
                        to: lang
                    },
                    data: [
                        {
                            Text: text
                        }
                    ],
                    responseType: 'json'
                });
    
                const data = response.data;
    
                if (data.length === 0) {
                    return { [language]: text };
                }
    
                this.results = Object.assign(
                    {},
                    ...languages
                        .filter(l => l !== language)
                        .map(l => ({
                            [l]: data[0].translations.filter(t => {
                                let to = t.to;
                                if (to.indexOf("_") !== -1) {
                                    to = t.to.substring(0,t.to.indexOf("_"));
                                }
                                if (to.indexOf("-") !== -1) {
                                    to = t.to.substring(0,t.to.indexOf("-"));
                                }
                                if (l.indexOf(to) !== -1) {
                                    return t.text as string;
                                }
                            })
                        }))
                );

                languages
                .filter(l => l !== language)
                .forEach(l => {
                    if (this.results[l]) {
                        let r = this.results[l][0];
                        if (r) {
                            translation.languages[l] = r['text'];
                        }
                    }
                });

                this._manager.refreshDataTable();

                return this.results;
            } catch (e) {
                let err = e as AxiosError;
                let r = err.response as AxiosResponse;
                vscode.window.showErrorMessage(`${e.toString()}\n${r.data}\nlangage ${lang}`);
            }    
        });
    }
}
