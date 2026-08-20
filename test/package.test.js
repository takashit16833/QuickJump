const test = require('node:test');
const assert = require('node:assert/strict');
const manifest = require('../package.json');

const inputBindings = manifest.contributes.keybindings.filter(({ command }) => command === 'quickJump.input');
const inputTexts = new Set(inputBindings.map(({ args }) => args.text));

test('default hint characters are capturable without overriding VS Code type', () => {
  for (const character of manifest.contributes.configuration.properties['quickJump.hintCharacters'].default) {
    assert.equal(inputTexts.has(character), true, `missing input binding for ${character}`);
  }
  assert.equal(manifest.contributes.keybindings.some(({ command }) => command === 'type'), false);
});

test('cancel and backspace are active only during QuickJump', () => {
  const byCommand = (command) => manifest.contributes.keybindings.find((binding) => binding.command === command);
  assert.match(byCommand('quickJump.cancel').when, /quickJump\.active/);
  assert.match(byCommand('quickJump.backspace').when, /quickJump\.active/);
});
