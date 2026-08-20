const test = require('node:test');
const assert = require('node:assert/strict');
const manifest = require('../package.json');

const inputBindings = manifest.contributes.keybindings.filter(
  ({ command }) => command === 'quickJump.input',
);
const inputTexts = new Set(inputBindings.map(({ args }) => args.text));

test('default hint characters are capturable without overriding VS Code type', () => {
  for (const character of manifest.contributes.configuration.properties[
    'quickJump.hintCharacters'
  ].default) {
    assert.equal(inputTexts.has(character), true, `missing input binding for ${character}`);
  }
  assert.equal(
    manifest.contributes.keybindings.some(({ command }) => command === 'type'),
    false,
  );
});

test('cancel and backspace are active only during QuickJump', () => {
  const byCommand = (command) =>
    manifest.contributes.keybindings.find((binding) => binding.command === command);
  assert.match(byCommand('quickJump.cancel').when, /quickJump\.active/);
  assert.match(byCommand('quickJump.backspace').when, /quickJump\.active/);
});

test('two-character jump uses a layout-friendly default shortcut', () => {
  const binding = manifest.contributes.keybindings.find(
    ({ command }) => command === 'quickJump.jumpTwoCharacters',
  );
  assert.equal(binding.key, 'ctrl+alt+;');
});

test('hint colors are contributed for theme customization', () => {
  const colorIds = new Set(manifest.contributes.colors.map(({ id }) => id));
  assert.equal(colorIds.has('quickJump.hintBackground'), true);
  assert.equal(colorIds.has('quickJump.hintForeground'), true);
});

test('reveal position settings support a 0 to 100 percentage', () => {
  const properties = manifest.contributes.configuration.properties;
  assert.deepEqual(properties['quickJump.revealMode'].enum, ['keep', 'position']);
  assert.equal(properties['quickJump.revealMode'].default, 'keep');
  assert.equal(properties['quickJump.revealPosition'].minimum, 0);
  assert.equal(properties['quickJump.revealPosition'].maximum, 100);
  assert.equal(properties['quickJump.revealPosition'].default, 25);
  assert.equal(properties['quickJump.reveal'], undefined);
});

test('manifest is ready for local VSIX packaging', () => {
  assert.equal(manifest.publisher, 'takashit16833');
  assert.equal(manifest.version, '1.0.0');
  assert.match(manifest.scripts.package, /npm run check/);
  assert.match(manifest.scripts.package, /vsce package/);
  assert.equal(manifest.devDependencies['@vscode/vsce'], '^3.9.2');
});

test('manifest includes Marketplace presentation and support metadata', () => {
  assert.equal(manifest.displayName, 'QuickJump - Visible Text Navigation');
  assert.equal(manifest.license, 'MIT');
  assert.equal(manifest.icon, 'images/icon.png');
  assert.equal(manifest.icon.endsWith('.svg'), false);
  assert.equal(manifest.galleryBanner.color, '#07182C');
  assert.equal(manifest.galleryBanner.theme, 'dark');
  assert.ok(manifest.keywords.length > 0 && manifest.keywords.length <= 30);
  assert.equal(manifest.homepage, 'https://github.com/takashit16833/QuickJump#readme');
  assert.equal(manifest.bugs.url, 'https://github.com/takashit16833/QuickJump/issues');
  assert.equal(manifest.repository.url, 'https://github.com/takashit16833/QuickJump.git');
});
