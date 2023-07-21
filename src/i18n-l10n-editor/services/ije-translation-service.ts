import { IJEConfiguration } from '../ije-configuration';
import { IJEManager } from '../ije-manager';
import { IJEDataTranslation } from '../models/ije-data-translation';
import { IJEMicrosoftTranslator } from './translations/ije-microsoft-translator';
import { IJETranslation } from './translations/ije-translation';

export abstract class IJETranslationService {
    static _manager: IJEManager;
    public static async translate(translation: IJEDataTranslation, language: string, languages: string[]) {
        const translationService = IJEConfiguration.TRANSLATION_SERVICE;

        if (!translationService || !IJEConfiguration.TRANSLATION_SERVICE_API_KEY) {
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
    }
}

export enum TranslationServiceEnum {
    MicrosoftTranslator = 'MicrosoftTranslator'
}

