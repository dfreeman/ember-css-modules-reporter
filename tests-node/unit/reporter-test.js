'use strict';

const QUnit = require('qunitjs'), test = QUnit.test, testModule = QUnit.module;
const addonPrototype = require('../../index');
const postcss = require('postcss');
const sinon = require('sinon');
const chalk = require('chalk');

testModule('Unit | reporter');

test('message collection', function(assert) {
  let parent = { hinting: true };
  let addon = Object.create(addonPrototype);
  let plugin = addon.createCssModulesPlugin(parent);
  let config = {};

  plugin.config('development', config);

  return postcss(config.plugins.before.concat(makeWarner('boom!')).concat(config.plugins.after))
    .process('.my-class {}', { from: '/file' })
    .then(() => {
      assert.equal(plugin.messages.size, 1);
      assert.propEqual(Array.from(plugin.messages.entries()), [
        ['file', [{ type: 'warning', text: 'boom!', plugin: 'warner' }]]
      ]);
    });
});

test('message logging', function(assert) {
  let parent = { hinting: true, ui: { writeLine: sinon.spy() } };
  let addon = Object.create(addonPrototype);
  let plugin = addon.createCssModulesPlugin(parent);

  plugin.config('development', {});
  plugin.messages = new Map([
    ['file.css', [
      { type: 'warning', text: 'uh oh', plugin: 'warner', line: 1, column: 30 },
      { type: 'error', text: 'kaboom', plugin: 'errorer', line: 12, column: 1 }
    ]],
  ]);

  plugin.buildEnd();

  let output = chalk.stripColor(parent.ui.writeLine.lastCall.args[0]);
  assert.equal(output, [
    '',
    'file.css',
    '  1:30  warning  uh oh   warner',
    '  12:1   error    kaboom  errorer',
    '',
    '2 problems (1 error and 1 warning)'
  ].join('\n'));
});

function makeWarner(warning) {
  return postcss.plugin('warner', () => (css, result) => {
    result.warn(warning);
  });
}
