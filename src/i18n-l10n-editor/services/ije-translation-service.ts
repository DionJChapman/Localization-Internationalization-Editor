import { IJEConfiguration } from '../ije-configuration';
import { IJEManager } from '../ije-manager';
import { IJEDataTranslation } from '../models/ije-data-translation';
import { IJEMicrosoftTranslator } from './translations/ije-microsoft-translator';
import { IJETranslation } from './translations/ije-translation';

export abstract class IJETranslationService {
    static _manager: IJEManager;
    public static async translate(translation: IJEDataTranslation, language: string, languages: string[]) {
        const tranlsationService = IJEConfiguration.TRANSLATION_SERVICE;

        if (!tranlsationService || !IJEConfiguration.TRANSLATION_SERVICE_API_KEY) {
            return;
        }
        let service: IJETranslation;
        if (IJEConfiguration.TRANSLATION_SERVICE === TranslationServiceEnum.MicrosoftTranslator) {
            service = new IJEMicrosoftTranslator();
            service._manager = this._manager;
        }
        if (!service) {
            return;
        }
        let data = await service.translate(translation.languages[language], translation, language, languages);
        if (!data) {
            const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
            sleep(1000);
            data = service.results;
        }
        if (data) {
            languages
                .filter(l => l !== language)
                .forEach(l => {
                    if (data[l]) {
                        translation.languages[l] = data[l];
                    }
                });
        }
    }
}

export enum TranslationServiceEnum {
    MicrosoftTranslator = 'MicrosoftTranslator'
}

