import { module, test } from 'qunit';

module('Unit | generated lint tests');

test('the lint test module is generated', function(assert) {
  // More detailed tests take place in node land; this is just ensuring the tests make it into the build
  window.require('dummy/tests/css-warnings-0.lint-test');
  assert.ok(true, 'the module was successfully imported');
});
