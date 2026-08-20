import * as vscode from 'vscode';

export interface QuickJumpStatusBar extends vscode.Disposable {
  show(text: string): void;
  hide(): void;
}

export const createQuickJumpStatusBar = (): QuickJumpStatusBar => {
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  item.name = 'QuickJump';
  item.tooltip = 'QuickJump is waiting for input';

  return {
    show: (text: string) => {
      item.text = text;
      item.show();
    },
    hide: () => item.hide(),
    dispose: () => item.dispose(),
  };
};
