# QuickJump

VS Code のテキストエディタで、**表示中の文字へキーボードでカーソルを移動する**拡張機能です。

## 使い方

1. `Ctrl+;` を押して検索を開始します。
2. 移動したい文字列を入力します。既定のタイマー検索では、**入力が0.5秒止まる**か `Enter` を押すと検索が確定します。
3. 候補が複数ある場合は、移動先に表示された目印の文字を入力します。候補が1つなら自動で移動します。

`Esc` で中止、`Backspace` で入力を戻せます。検索対象は、分割表示しているエディタを含む**画面に表示中の行**です。

## 設定

VS Code の `settings.json` で変更できます。設定を省略した場合は既定値が使われます。

| 設定 | 既定値 | 内容 |
| --- | --- | --- |
| `quickJump.jumpMode` | `timer` | `Ctrl+;` で使う検索方式。 `timer`（時間待ち）、`oneCharacter`（1文字）、`twoCharacters`（2文字） |
| `quickJump.timerDelay` | `0.5` | タイマー検索の待ち時間（秒、0.1〜10） |
| `quickJump.matchMode` | `wordStart` | `wordStart`（単語の先頭のみ）、`anywhere`（文字列の途中も検索） |

例えば、文字列の途中も検索する場合は次のように設定します。

```json
{
  "quickJump.matchMode": "anywhere"
}
```

## インストール

リポジトリのルートで実行します。

```sh
npm install
npm run package
code --install-extension ./quickjump-1.2.0.vsix --force
```
