# Change Log

All notable changes to the "i18n-l10n-editor"  and "i18n-arb-editor" extension will be documented in this file.

## [3.0.8]

- Added new setting i18n-l10n-editor.keyCaseStyle, this will replace i18n-l10n-editor.forceKeyUPPERCASE
- Added new setting i18n-l10n-editor.autoTranslateNewLanguage to Auto Translate when adding new languages
  - Auto Translate may not work with text that contains {value}, but you can use manual translation for these.
- Added new setting i18n-l10n-editor.translationServiceApiRegion for the Micrsoft Translation API
  - Copy this from the same page you your API Key
- Code refactoring and clean upp

## [3.0.6]

- Updated tree view to lock keys in position
- Updated translation as per table view
  
## [3.0.5]

- Fixed issues with translation service due to changes in the Microsoft Translation APIs
  - Now only does a single translation at a time
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
- Temporary files kept when translation is not saved.
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

## [1.0.0]

Release Date 13/01/2021

- Release by Innwin

## [Unreleased]

- Initial release
