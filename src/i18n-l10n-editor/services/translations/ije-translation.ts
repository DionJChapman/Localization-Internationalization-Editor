import { IJEManager } from "../../ije-manager";
import { IJEDataTranslation } from "../../models/ije-data-translation";

export interface IJETranslation {
    translate(text: string, translation: IJEDataTranslation, language: string, languages: string[]): Promise<{ [language: string]: string }>;
    results: { [language: string]: string } ;
    _manager: IJEManager;
}
