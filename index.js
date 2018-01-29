/* eslint-env node */
'use strict';

const Plugin = require('ember-css-modules/lib/plugin');
const MergeTrees = require('broccoli-merge-trees');
const postcss = require('postcss');
const LintTests = require('./lib/lint-tests');
const formatter = require('./lib/formatter');

module.exports = {
  name: 'ember-css-modules-reporter',

  createCssModulesPlugin(parent) {
    let plugin = new ReporterPlugin(parent, this.app);
    this._getPluginInstances().push(plugin);
    return plugin;
  },

  lintTree(type) {
    // This is a little fragile, we need to pick some tree type to return lint tests for,
    // and lintTree('tests') runs after all the app and addon styles have been processed
    if (type !== 'tests') { return; }

    let trees = this._getPluginInstances()
      .filter((plugin) => plugin.generateTests)
      .map((plugin, index) => new LintTests({
        index,
        reporterPlugin: plugin,
        project: this.project
      }));

    return new MergeTrees(trees);
  },

  _getPluginInstances() {
    if (!this.project._cssModulesReporters) {
      this.project._cssModulesReporters = [];
    }

    return this.project._cssModulesReporters;
  }
};

class ReporterPlugin extends Plugin {
  constructor(parent, app) {
    super(parent);
    this.app = app;
    this.isEnabled = false;
    this.generateTests = true;
    this.logMessages = true;
    this.messages = new Map();
  }

  config(env, baseConfig) {
    this.isEnabled = this._shouldBeEnabled(env);
    if (!this.isEnabled) { return; }

    this.addPostcssPlugin(baseConfig, 'after', this._makeReporter());

    const reporterConfig = baseConfig.reporter;
    if (reporterConfig) {
      this.generateTests = reporterConfig.generateTests !== false;
      this.logMessages = reporterConfig.logMessages !== false;
    }
  }

  buildStart() {
    this.messages = new Map();
  }

  buildEnd() {
    const output = formatter(this.messages);
    if (output && this.logMessages) {
      this.parent.ui.writeLine(output);
    }
  }

  _makeReporter() {
    return postcss.plugin('ember-css-modules-reporter', () => (css, result) => {
      const input = css.source.input;
      const relativePath = input.file.replace(input.rootPath, '').substring(1);
      this.messages.set(relativePath, result.messages);
    });
  }

  _shouldBeEnabled() {
    if (this.isForApp()) {
      return !!this.app.hinting;
    } else {
      return this.parent.isDevelopingAddon() && this.parent.hintingEnabled();
    }
  }
}
