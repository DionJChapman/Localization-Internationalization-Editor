# Change Log

All notable changes to the "i18n-l10n-editor" extension will be documented in this file.

## [3.3.6]

Release Date: 12/09/2023

- Fixed issues with default language files for language folder structures
- Fixed issues with single language translations
- Fixed issues with Amazon and Google translations for language folder structures
- Aligned Tree View with the Table View for language folder structures
- Fixed addition issues with Tree View
- Refactored code
  
## [3.3.5]

Release Date: 05/09/2023

- Added the ability to work with language based folder structures
  - Fixed issues with file loader
  - Fixed issues with table rendering
  - Fixed issues with automatic translations
  - Fixed issues with saving
- Refactored and cleaned up code

## [3.3.2]

Release Date: 01/09/2023

- Added version number to status bar
- Added Amazon and Google translation services
- Added Translation specific settings
- Updated Documentation

## [3.2.6]

Release Date: 30/08/2023

- Removed the code to add default settings to config files when missing. It will still use default settings but will no longer save them.

## [3.2.5]

Release Date: 30/08/2023

- Added new setting to list possible **YAML** files to look for configuration data
  - Examples are *l10n.yaml*, *i18n.yaml*, *r13n.yaml* and *pubspec.yaml*
- Added code to search a list of possible config files
- Updated Documentation

## [3.2.3]

Release Date: 29/08/2023

- Fixed issue where a character was being removed before {value} arguments when translating
  - **Note** the translation services may still add and remove spaces as it sees fit

## [3.2.2]

Release Date: 28/08/2023

- Added new setting **i18n-l10n-editor.substitutionText** with the default value of *l10n* to replace text in Dart files. Make this blank if you don't want to use it. Example *l10n.exampleKey* or *l10n.exampleKey(placeholder)*
- Added code substitution to dart files when highlighting text to create translations
- Removed the catch-all event trigger for better performance
- Update documentation for this feature
  
## [3.2.0]

Release Date: 28/08/2023

- Added code to read the **pubspec.yaml** file for configuration if it can't find a **l10n.yaml** file
- Fixed issues where it wasn't rendering a field for each language when adding a new key
- Fixed issue where it wasn't using the **i18n-l10n-editor.defaultLanguage** setting if it could't find a default language
- Added changes to the editor title when working with multiple folders individually
- Updated documentation for changes
  
## [3.1.7]

Release Date: 25/08/2023

- Added *l10n.yaml documentation and fixed layout
  
## [3.1.5]

- Minor documentation update
  
## [3.1.4]

- Changed **i18n-l10n-editor.sortKeyTogether** to default value of true
- Added default values for **arb-dir** and **template-arb-file** if missing from l10n.yaml
- Added base translations for when you use sub-languages for **flutter gen-l10n** compliance
  - Example when using zh-Hans it will also create zh arb file
- Removed the folder selector for each line as it was confusing and changing the folder can create issues
- Fixed a few UI issues with Tree View
- Fixed issues with 2 Context Menu items in some setups
- Fixed issue where it wouldn't copy across to blank translation fields

## [3.1.3]

Release Date: 08/08/2023

- Fixed Mac issue from Windows Context Menu changes
- Added Code to check sub-directories for files

## [3.1.2]

Release Date: 08/08/2023

- Fixed issues with Windows paths
- Fixed issues with Context Menu start for Windows

## [3.1.1]

Release Date 02/08/2023

- Fixed issues in documentation

## [3.1.0] (l18n/l10n Editor)

Release Date 29/07/2023

- Updated Readme and documentation

## [3.0.14]

- Added copy down to tree view
- Changed tree view to include changes done to table view
- Fixed issues with translation to betted handle sub languages
- Fixed issues with translation to better handle multiple default translations
- Added the ability to copy any Key to the other folders and translations
- Fixed issue with tree view not showing correct translation files for a selected key

## [3.0.12]

- Update saving to better deal with possible corrupted translations
- Fixed issues when dealing with multiple translation folders, different translation file types and different translations per folder
  - Opening the editor from the project folders list context menu will only show those translations in the folder
- Fixed issues with auto translation with multiple folders
- Fixed issues when adding new translations with multiple folders
  - If a folder is selected in the top left then the new translation will only be added to that, or it will be add to all folders
- Added a new copy across for default translations, this is good for description fields
- Updated editor to keep the headings in a vertical position
- Added i18n-l10n-editor.defaultLanguage to settings for non l10n.yaml based translations

## [3.0.11]

- Fixed issues when entering keys by hand
  - camelCase and Capalize will only work when you use spaces in the key, otherwise it reverts to no change
  
## [3.0.10]

- Added the ability to select text (must include quotes) in .dart file to add to translations
  - You will need to open the i18n/l10n Editor first and then click on the tab after you add the text
  - Use the context globe to select 'Add text to i18n/l10n Editor'
  - It will auto translate of enabled and follows the case style setting
  
## [3.0.8]

- Added new setting i18n-l10n-editor.keyCaseStyle, this will replace i18n-l10n-editor.forceKeyUPPERCASE
- Added new setting i18n-l10n-editor.autoTranslateNewLanguage to Auto Translate when adding new languages
  - Auto Translate may not work with text that contains {value}, but you can use manual translation for these.
- Added new setting i18n-l10n-editor.translationServiceApiRegion for the Microsoft Translation API
  - Copy this from the same page you your API Key
- Code refactoring and clean upp

## [3.0.6]

- Updated tree view to lock keys in position
- Updated translation as per table view
  
## [3.0.5]

- Fixed issues with translation service due to changes in the Microsoft Translation APIs
  - Now only does a single translation at a time
  - Available languages <https://learn.microsoft.com/en-us/azure/ai-services/translator/language-support>
- Change the default translation button to green to indicate that it will be translated to all languages
- Increased the width of the text fields, now scrolls horizontally
- Moved the default language to the start
- Added auto save when adding a new language
- Updated changelog documentation

## [3.0.4]

- Added the ability to add new language files from the editor

## [3.0.3]

- Added sorting for key and @key pairs
- Added indenting for @keys
  
## [3.0.2]

- Fixed issues with finding Workspace l10n folders
- Fixed issue with opening editor from Status Bar
  
## [3.0.0]

- New Version
- Update Developer Details
- Updated Name
- Updated Menu Items

## [2.1.4]

- Added a linefeed at end of files.
- Added the use of temporary .tmp files when saving.
- Added check on .tmp files for minimum size of 10 characters. An i18n format would be 12 and an l10n format would be 20.
- Temporary files kept when translation isn't saved.
- Removed code that could result in files of '{}'.

## [2.1.3]

- Added file content sorting to keep key and @key pairs together.
- Added setting i18n-l10n-editor.sortKeyTogether to control file content sorting.
- Updated documentation.

## [2.1.1]

- Added the ability to load files with different file extensions as per documentation at:
  - <https://docs.flutter.dev/accessibility-and-localeization/internationalization>
- Added setting i18n-l10n-editor.supportedExtensions to specify the file extensions to use.
- Updated default values for setting i18n-l10n-editor.supportedFolders as per documentation above.

## [2.1.0] (i18n json editor)

Release Date 26/07/2022

- Last know release by Thibault Vanderseypen
- Added setting i18n-l10n-editor.keySeparator
- Added translation service feature
- Refactored code
- Update font
- Updated documentation

## [2.0.4]

Release Date 5/10/2021

- Release by Thibault Vanderseypen
- Fixed Escape quotes in html value="" attributes
- Remove BOM if necessary

## [2.0.3]

Release Date 29/06/2021

- Release by Thibault Vanderseypen

## [2.0.2]

Release Date 16/06/2021

- Release by Thibault Vanderseypen

## [2.0.1]

Release Date 16/06/2021

- Release by Thibault Vanderseypen

## [1.1.2]

- Release by Thibault Vanderseypen
- Added force key to UPPERCASE
- Added setting i18n-l10n-editor.forceKeyUPPERCASE
- i18n arb editor branched from here

## [1.1.1]

- Release by Thibault Vanderseypen

## [1.0.0]

- Release by Thibault Vanderseypen

## [1.3.0] (i18n arb editor)

Release Date 23/02/2023

- Last know release by Innwin

## [1.2.0]

Release Date 2/12/2021

- Release by Innwin
- Removed checking for i18n and l10n when checking resource folder

## [1.1.0]

Release Date 19/11/2021

- Release by Innwin
- Added intl_zh_HK.arb and intl_zh_TW to demo folder

## [1.0.1]

Release Date 14/01/2021

- Release by Innwin
- Added code for a description.json file for i18n translations (*depreciated*)
- Update readme documentation

## [1.0.0 ]

Release Date 13/01/2021

- Release by Innwin
