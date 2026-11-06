# QuickJump

QuickJump は、**画面に表示されている文字へ、キーボードだけでカーソルを移動する** VS Code 拡張機能です。

検索文字を入力すると移動候補に目印が表示されるので、目的の目印を入力して移動します。分割表示している別のエディタにも移動できます。

## 使い方

| 検索方法 | 既定のキー | 動作 |
| --- | --- | --- |
| 1文字検索 | `Ctrl+;` | 1文字入力して候補を表示 |
| 2文字検索 | `Ctrl+Alt+;` | 2文字入力して候補を表示 |
| タイマー検索 | `Ctrl+Shift+;` | 好きな長さの文字列で検索 |

1. テキストエディタにカーソルを置き、上記のキーで検索を開始します。
2. 移動したい場所の文字を入力します。
3. 候補が複数ある場合は、その場所に表示された目印の文字を入力します。
4. カーソルが目的の位置へ移動します。候補が1つだけなら、自動で移動します。

候補がない場合は、そのまま終了します。検索は現在表示されているエディタの行が対象で、ファイル全体やプロジェクト全体は検索しません。

### タイマー検索

タイマー検索では、文字数を決めずに検索できます。

1. `Ctrl+Shift+;` で開始し、検索したい文字列を入力します。
2. **最後の入力から0.5秒**（既定値）経つと検索を確定し、候補の目印を表示します。
3. 目印を入力して移動します。`Enter` を押すと待たずに確定できます。

文字を追加するたびに待ち時間がリセットされます。入力中は、現在の検索文字列と一致件数がステータスバーに表示されます。待ち時間は `quickJump.timerDelay` で変更できます。

### 入力の取り消し

- `Esc`：検索を中止します。
- `Backspace`：入力した検索文字や目印を1文字戻します。目印の入力前まで戻すと、検索文字の入力に戻れます。

## 検索範囲と一致条件

既定では**単語の先頭**だけが候補になります。単語の途中も対象にしたい場合は、`quickJump.matchMode` を `anywhere` に変更してください。

例えば `getUserName` の `U` や `N` などにも移動したい場合は、`anywhere` が便利です。大文字と小文字は既定では区別しません。

複数のエディタを分割表示している場合も検索できます。ただし対象は**表示中の行**のみです。横スクロールで隠れている文字が候補に含まれる場合があります。

通常のテキストエディタ向けの機能です。VS Code 内蔵のリッチ Markdown Editor や Markdown Preview では使用できません。

## 設定

VS Code の `settings.json` に記述します。例えば、単語の途中も検索し、タイマーの待ち時間を0.7秒にする場合は次のように設定します。

```json
{
  "quickJump.matchMode": "anywhere",
  "quickJump.timerDelay": 0.7
}
```

| 設定 | 既定値 | 説明 |
| --- | --- | --- |
| `quickJump.matchMode` | `wordStart` | `wordStart` は単語先頭、`anywhere` は途中も一致 |
| `quickJump.timerDelay` | `0.5` | タイマー検索の待ち時間（秒）。0.1〜10 |
| `quickJump.caseSensitive` | `false` | `true` で大文字・小文字を区別 |
| `quickJump.hintCharacters` | `asdfghjkl` | 移動先の目印に使う文字 |
| `quickJump.revealMode` | `keep` | `keep` は表示位置をできるだけ維持、`position` は位置を指定 |
| `quickJump.revealPosition` | `25` | `position` のときの表示位置（0が上、50が中央、100が下） |

目印の色は `workbench.colorCustomizations` の `quickJump.hintBackground`（背景色）と `quickJump.hintForeground`（文字色）で変更できます。

キーの割り当ては VS Code のキーボードショートカット画面、または `keybindings.json` から変更できます。

## インストール

### VS Code の拡張機能画面から

拡張機能画面で **QuickJump - Visible Text Navigation** を検索してインストールします。拡張機能 ID は `takashit16833.quickjump` です。

### このリポジトリから

リポジトリのルートで次を実行すると、VSIX ファイルを作成してインストールできます。

```sh
npm install
npm run package
code --install-extension --force quickjump-1.1.0.vsix
```

VS Code の「拡張機能」→「…」→「VSIX からのインストール」からも導入できます。

## 不具合・要望

[GitHub Issues](https://github.com/takashit16833/QuickJump/issues) に登録してください。

ライセンス：[MIT](LICENSE)
