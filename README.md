# ember-css-modules-reporter [![Build Status](https://travis-ci.org/dfreeman/ember-css-modules-reporter.svg?branch=master)](https://travis-ci.org/dfreeman/ember-css-modules-reporter)

This [ember-css-modules](https://github.com/salsify/ember-css-modules) plugin adds a reporter to the PostCSS build pipeline. This reporter will log any warnings or errors that are produced whenever a file is built or rebuilt, and it will also generate lint tests to ensure in CI that you don't have any stray warnings.

## Usage

This plugin is valuable when paired with another like [ember-css-modules-stylelint](https://github.com/dfreeman/ember-css-modules-stylelint), Together, they can provide a developer experience similar to that of e.g. ember-cli-eslint, providing warnings on rebuild and generating lint tests to flag failures.

<img src="https://user-images.githubusercontent.com/108688/27017203-b6ef4420-4ef4-11e7-88c8-34101713ab6d.png" width="371">

## Configuration

If you wish, you can disable the logging and/or the lint tests by passing a `reporter` hash with appropriate flags in your `cssModules` configuration.

```js
// ember-cli-build.js
new EmberApp(defaults, {
  cssModules: {
    reporter: {
      logMessages: false, // defaults to true
      generateTests: false // defaults to true
    }
  }
});
```
