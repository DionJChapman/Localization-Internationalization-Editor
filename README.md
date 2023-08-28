# i18n-l10n-editor

![Logo](https://raw.githubusercontent.com/DionJChapman/Localization-Internationalization-Editor/master/images/logo-large.png)

i18n-l10n-editor is a Visual Studio Code extension to easily edit your i18n and l10n translations files. This extensions is built on the work by Thibault Vanderseypen, Innwin and Isaudon.

## Usage

i18n-l10n-editor can be used in two ways :

- Click the **i18n/l10n Editor** Button on the status bar. This will search for any l10n.yaml file and then open the translations from these files. You do not have to set <ins>i18n-l10n-editor.workspaceFolders</ins> for this to work. But you should set a list of supported folders in <ins>i18n-l10n-editor.supportedFolders</ins> so the editor can search for translation files in your project.
  
  <img alt="Open with Statusbar" src="https://github.com/DionJChapman/Localization-Internationalization-Editor/blob/master/images/statusbar-open.gif?raw=true" width="60%">

- Right click on a folder that contains translations, such as **i18n** or **l10n** and select **i18n/l10n Editor** from the context menu.
  
  <img alt="Open with Context Menu" src="https://github.com/DionJChapman/Localization-Internationalization-Editor/blob/master/images/context-menu-open.gif?raw=true" width="60%">

- In any **.dart** file select any text including the quotes the from the light bulb on the left choose **Add text to i18n/l10n Editor**. This show some dialog boxed to confirm vales and then add the values to the translations.
  
  <img alt="Add select text to the editor" src="https://github.com/DionJChapman/Localization-Internationalization-Editor/blob/master/images/text-select-open.gif?raw=true" width="60%">

## Buttons

<img alt="Save Translations" src="https://github.com/DionJChapman/Localization-Internationalization-Editor/blob/master/images/save.png?raw=true" width="80">

- This will save all opened translations.
  
<img alt="Add Key" src="https://github.com/DionJChapman/Localization-Internationalization-Editor/blob/master/images/add.png?raw=true" width="80">

- This will add a new key to the selected folder, or all folders.

<img alt="New Translation" src="https://github.com/DionJChapman/Localization-Internationalization-Editor/blob/master/images/new.png?raw=true" width="80">

- This will create a new translation file. if <ins>i18n-l10n-editor.autoTranslateNewLanguage</ins> is enabled the it will translate the new file from the default translation file. This will save all translations before creating the new file.
  
<img alt="Tree View" src="https://github.com/DionJChapman/Localization-Internationalization-Editor/blob/master/images/table.png?raw=true" width="40"><img alt="Table View" src="https://github.com/DionJChapman/Localization-Internationalization-Editor/blob/master/images/tree.png?raw=true" width="40">

- Switch between table and tree views.

<img alt="Copy Key" src="https://github.com/DionJChapman/Localization-Internationalization-Editor/blob/master/images/copy-key.png?raw=true" width="40">

- This will copy the selected key to other translation folders. If the key doesn't exist in the folder then it will add it and set it to the default translation text. If the key does exist and is empty, it will not overwrite it.

<img alt="Translate All" src="https://github.com/DionJChapman/Localization-Internationalization-Editor/blob/master/images/translate-all.png?raw=true" width="40">

- This will translate the default translation text to all translations within the folder.

<img alt="Translation Only selected Translation" src="https://github.com/DionJChapman/Localization-Internationalization-Editor/blob/master/images/translate-only.png?raw=true" width="40">

- This will translate the default language to the select language.
  
<img alt="Copy default translation" src="https://github.com/DionJChapman/Localization-Internationalization-Editor/blob/master/images/copy-all.png?raw=true" width="40">

- This will copy the default translation text to all translations within the folder without translating the text. This is good to copy your descriptions across.

**NOTE** for translations to work your require *i18n-l10n-editor.translationService*, *i18n-l10n-editor.translationServiceApiKey* and *i18n-l10n-editor.translationServiceApiRegion* to be set. Currently we only support the following translations services Microsoft Translation, Google Translation and Amazon Translation. See Language Documentation for a list of supported language codes for each service.

## l10n.yaml file

These are typical settings for the **l10n.yaml** file used to configure Internationalisation. This is the proffered setup.

``` language="text"
arb-dir: lib/l10n
template-arb-file: app_en.arb
output-localization-file: app_localizations.dart
untranslated-messages-file: missing.log
nullable-getter: false
```

You can also use the **pubspec.yaml** file to configure Internationalisation.

``` language="text"
flutter_intl:
  enabled: true
  arb-dir: lib/l10n/arb
  template-arb-file: app_en.arb
  output-localization-file: app_localizations.dart
  untranslated-messages-file: missing.log
  nullable-getter: false
```

## Settings

To access the settings click Code -> Settings on a Mac or File Preference on Windows. In the setting click Extensions and the scroll down to **Localization Internationalization Editor**

- **i18n-l10n-editor.forceKeyUPPERCASE**
  - Forces the keys to UPPERCASE (deprecated). If true this will force the keys to UPPERCASE. The default value is *false*
    - `i18n-l10n-editor.forceKeyUPPERCASE: false`
- **i18n-l10n-editor.keyCaseStyle**
  - This sets how to write keys to the files valid methods are **no change**, *camelCase*, *Capalize*, *lowercase*, *UPPERCASE*. Both camelCase and Capalize requires spaces when typing the key. The default value is *no change*.
    - `i18n-l10n-editor.keyCaseStyle: "no change"`
- **i18n-l10n-editor.sortKeyTogether**
  - Sort files and the editor so that key and @key will be kept together. The default value is true.
    - `i18n-l10n-editor.sortKeyTogether: true`
- **i18n-l10n-editor.autoTranslateNewLanguage**
  - This will auto translate any new translations files added to the editor. It requires the translations to be added. The default value is *false*.
    - `i18n-l10n-editor.autoTranslateNewLanguage: false`
- **i18n-l10n-editor.defaultLanguage**
  - Used when no default language is specified in translation files otherwise the first file found is used. The default vale is *en*.
    - `i18n-l10n-editor.defaultLanguage: "en"`
- **i18n-l10n-editor.translationService**
  - Specified which translation service to use (Only Microsoft translator is currently available). The default value is blank.
    - `i18n-l10n-editor.translationService: ""`
- **i18n-l10n-editor.translationServiceApiKey**
  - Api key used by the translation service. Copy this from the Key Generation page. The default value is blank.
    - `i18n-l10n-editor.translationServiceApiKey: ""`
- **i18n-l10n-editor.translationServiceApiRegion**
  - Api region used by the translation service. Copy this from the Key Generation page. The default value is blank.
    - `i18n-l10n-editor.translationServiceApiRegion: ""`
- **18n-l10n-editor.jsonSpace**
  - A String or Number that's used to insert white space into the output JSON. The default value is *2*.
    - `18n-l10n-editor.jsonSpace: 2`
- **i18n-l10n-editor.keySeparator**
  - String to separate keys, or false if no separator is preferred. The default value is "*.*".
  - `i18n-l10n-editor.keySeparator: "."`
- **i18n-l10n-editor.lineEnding**
  - String used to signify the end of a line. The default value is *\\n*.
    - `i18n-l10n-editor.lineEnding: "\\n"`
- **i18n-l10n-editor.supportedFolders**
  - An array of folder names that's used to open the extension through the right click (restart required after changing the value). The default values are *l10n* and *l18n*.
    - `i18n-l10n-editor.supportedFolders: ["l10n","i18n"]`
- **i18n-l10n-editor.supportedExtensions**
  - An array of file extension to check when loading the editor. If no file exists then the first one is used by default (restart required after changing the value). The default values are *arb* and *json*.
    - `i18n-l10n-editor.supportedExtensions: ["arb","json"]`
- **i18n-l10n-editor.workspaceFolders**
  - An array of objects to specify which folders are used to manage your translations (deprecated). This is only used if the editor can not find any translation folders. The default value is blank.
    - `i18n-l10n-editor.workspaceFolders: []`
- **i18n-l10n-editor.substitutionText**
  - A String to replace text when highlighting text in a Dart editor. To have this work you should place the following in your build methods `final l10n = AppLocalizations.of(context);` This will allow the editor to place `l10n.exampleKey` in your files.
    - `i18n-l10n-editor.substitutionText: "l10n"`
  
``` language="dart"
  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    return Builder(...
```

## Language Documentation

- [Microsoft Translation Languages](https://www.microsoft.com/en-us/translator/business/translator-api/)
- [Google Translations Languages](https://cloud.google.com/translate/docs/languages)
- [Amazon Translations Languages](https://docs.aws.amazon.com/translate/latest/dg/what-is-languages.html)
- [Amazon Translation Regions](https://docs.aws.amazon.com/general/latest/gr/translate-service.html)
  
## Future Development

As I now have this editor work the way I wanted it to, I will be slowing down on changes. You are welcome to submit feature request to my [GitHub](https://github.com/DionJChapman/Localization-Internationalization-Editor/issues/new/choose)

- Add translations services for **Google Translate** and **Amazon Translate**

## Commercial Usage

**i18n/l10n Editor** is free for non-commercial usage. If you wish to use it for commercial purposes then I would appreciate a donation of $US5/user [PayPal.Me](https://paypal.me/puggsincyberspace?country.x=AU&locale.x=en_AU) or [Buy Me a Coffee](https://bmc.link/nativebit). This extension can save you hours doing translations manual and a small donation would be welcomed.

## Author

Previous authors include Thibault Vanderseypen, Innwin and Isaudon
