const test = require('node:test');
const assert = require('node:assert/strict');

const { findMatchOffsets } = require('../out/core/match');
const {
  assignHints,
  filterHints,
  hintWidthForCount,
  isValidHintPrefix,
  normalizeHintCharacters,
} = require('../out/core/hints');
const { orderCandidates } = require('../out/core/order');

const separators = "`~!@#$%^&*()-=+[{]}\\|;:'\",.<>/?";

test('wordStart does not split camelCase or snake_case', () => {
  const options = { mode: 'wordStart', caseSensitive: false, wordSeparators: separators };
  assert.deepEqual(findMatchOffsets('getUserName get_user_name', 'g', options), [0, 12]);
  assert.deepEqual(findMatchOffsets('getUserName', 'u', options), []);
  assert.deepEqual(findMatchOffsets('foo_bar', 'b', options), []);
});

test('wordStart splits punctuation-separated words', () => {
  const options = { mode: 'wordStart', caseSensitive: false, wordSeparators: separators };
  assert.deepEqual(findMatchOffsets('some-value object.method', 'v', options), [5]);
  assert.deepEqual(findMatchOffsets('some-value object.method', 'm', options), [18]);
});

test('anywhere returns overlapping matches', () => {
  const options = { mode: 'anywhere', caseSensitive: true, wordSeparators: separators };
  assert.deepEqual(findMatchOffsets('aaaa', 'aa', options), [0, 1, 2]);
});

test('case sensitivity is configurable', () => {
  assert.deepEqual(findMatchOffsets('User user', 'u', {
    mode: 'wordStart', caseSensitive: false, wordSeparators: separators,
  }), [0, 5]);
  assert.deepEqual(findMatchOffsets('User user', 'u', {
    mode: 'wordStart', caseSensitive: true, wordSeparators: separators,
  }), [5]);
});

test('hint alphabet is unique and falls back when too small', () => {
  assert.deepEqual(normalizeHintCharacters('aassdd', 'asdf'), ['a', 's', 'd']);
  assert.deepEqual(normalizeHintCharacters('a', 'asdf'), ['a', 's', 'd', 'f']);
});

test('hint width chooses the shortest fixed width', () => {
  assert.equal(hintWidthForCount(9, 9), 1);
  assert.equal(hintWidthForCount(10, 9), 2);
  assert.equal(hintWidthForCount(81, 9), 2);
  assert.equal(hintWidthForCount(82, 9), 3);
});

test('hints are deterministic and prefix-filterable', () => {
  const candidates = Array.from({ length: 10 }, (_, index) => index);
  const hints = assignHints(candidates, ['a', 's', 'd']);
  assert.equal(hints[0].hint, 'aaa');
  assert.equal(hints[1].hint, 'aas');
  assert.equal(hints[9].hint, 'saa');
  assert.deepEqual(filterHints(hints, 'aa').map(({ candidate }) => candidate), [0, 1, 2]);
  assert.equal(isValidHintPrefix(hints, 'x'), false);
  assert.equal(isValidHintPrefix(hints, 'as'), true);
});

test('active editor and cursor-near candidates are prioritized', () => {
  const candidates = [
    { editorIndex: 1, viewColumn: 2, line: 1, character: 0, cursorLine: 1, cursorCharacter: 0, activeEditor: false },
    { editorIndex: 0, viewColumn: 1, line: 20, character: 0, cursorLine: 10, cursorCharacter: 0, activeEditor: true },
    { editorIndex: 0, viewColumn: 1, line: 11, character: 0, cursorLine: 10, cursorCharacter: 0, activeEditor: true },
  ];
  const ordered = orderCandidates(candidates);
  assert.deepEqual(ordered.map(({ editorIndex, line }) => [editorIndex, line]), [[0, 11], [0, 20], [1, 1]]);
});
