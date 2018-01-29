'use strict';

const fs = require('fs');
const path = require('path');
const Plugin = require('broccoli-plugin');

module.exports = class LintTests extends Plugin {
  constructor(options) {
    super([]);
    this.index = options.index;
    this.reporterPlugin = options.reporterPlugin;
    this.project = options.project;
  }

  build() {
    let messages = this.reporterPlugin.messages;
    let tests = Array.from(messages.keys(), (file) => {
      let fileMessages = messages.get(file);
      let issues = fileMessages.map(message => `${message.line}:${message.column} - ${message.text.replace(/'/g, '\\\'')}`);
      return {
        name: file,
        passed: !fileMessages.length,
        errorMessage: `Expected ${file} not to have any warnings or errors\\n\\n${issues}`
      };
    });

    let testPath = path.join(this.outputPath, `css-warnings-${this.index}.lint-test.js`);
    let content = this.project.generateTestFile(`CSS`, tests);
    fs.writeFileSync(testPath, content, 'utf-8');
  }
}
