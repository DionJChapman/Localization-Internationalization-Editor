import axios, { AxiosError, AxiosResponse, AxiosResponseTransformer } from 'axios';
import * as vscode from 'vscode';
import * as aws4 from 'aws4';

import { IJEConfiguration } from '../../ije-configuration';
import { IJETranslation } from './ije-translation';
import { IJEDataTranslation } from '../../models/ije-data-translation';
import { IJEManager } from '../../ije-manager';

export class IJEAmazonTranslator implements IJETranslation {
    results: { [language: string]: string };
    _manager: IJEManager;
    async translate(text: string, translation: IJEDataTranslation, language: string, languages: string[]): Promise<{ [language: string]: string }> {
        const apiKey = IJEConfiguration.TRANSLATION_SERVICE_AMAZON_KEY || IJEConfiguration.TRANSLATION_SERVICE_API_KEY;
        if (apiKey && apiKey.length === 0) {
            vscode.window.showErrorMessage('Your Amazon API Key is blank. please update setting i18nJsonEditor.translationServiceApiKey');

            return { [language]: text };
        }

        const apiSecret = IJEConfiguration.TRANSLATION_SERVICE_AMAZON_SECRET || IJEConfiguration.TRANSLATION_SERVICE_API_SECRET;
        if (apiSecret && apiSecret.length === 0) {
            vscode.window.showErrorMessage('Your Amazon API Secret is blank. please update setting i18nJsonEditor.translationServiceApiKey');

            return { [language]: text };
        }

        const apiRegion = IJEConfiguration.TRANSLATION_SERVICE_AMAZON_REGION || IJEConfiguration.TRANSLATION_SERVICE_API_REGION;
        if (apiRegion && apiRegion.length === 0) {
            vscode.window.showErrorMessage('Your Amazon API Region is blank. please update setting i18nJsonEditor.translationServiceApiRegion');

            return { [language]: text };
        }

        const host = `translate.${apiRegion}.amazonaws.com`;

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
                const contentType = 'application/x-amz-json-1.1';
                const serviceTarget = 'AWSShineFrontendService_20170701.TranslateText';
                const body = `{"Text": "${text}","SourceLanguageCode": "${language.replace('_', '-')}","TargetLanguageCode": "${lang.replace('_', '-')}"}`;
                const options = {
                    "host": host,
                    "path": "/",
                    "method": "POST",
                    "headers": {
                        "content-type": contentType
                    },
                    "body": body
                };

                const authentication = aws4.sign(options, {accessKeyId: apiKey, secretAccessKey: apiSecret});

                var response = await axios({
                    baseURL: `https://${host}/`,
                    method: 'post',
                    headers: {
                        'Content-type': contentType,
                        'X-Amz-Target': serviceTarget,
                        'X-Amz-Date': authentication.headers["X-Amz-Date"],
                        Authorization: authentication.headers.Authorization
                    },
                    data: body,
                    responseType: 'json'
                });

                const data = response.data;

                if (data === undefined) {
                    return { [language]: text };
                }

                languages
                    .filter(l => l !== language)
                    .forEach(l => {
                        if (l.endsWith(data.TargetLanguageCode) || l.endsWith(data.TargetLanguageCode.split(""))) {
                            let _text = data.TranslatedText;
                            if (_text) {
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
