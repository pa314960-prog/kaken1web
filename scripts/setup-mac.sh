#!/bin/bash
# Hand Gesture Effects - Mac automatic setup
# This script gets the latest project files, starts the local server,
# and opens the app in your browser.

set -e

BRANCH="claude/hand-gesture-effects-glik5u"
REPO_URL="https://github.com/pa314960-prog/kaken1web.git"
PROJECT_DIR="$HOME/Desktop/kaken1web"

echo "=== Hand Gesture Effects: 自動セットアップ ==="

if ! command -v git >/dev/null 2>&1; then
  echo "Gitが見つかりません。初回実行時は「コマンドラインデベロッパツール」のインストールを促すポップアップが自動的に出るはずです。"
  echo "ポップアップの「インストール」を押して完了するまで待ってから、このスクリプトをもう一度実行してください。"
  git --version >/dev/null 2>&1 || true
  exit 1
fi
echo "Git: OK"

if ! command -v python3 >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    echo "Python3が見つからないのでHomebrewでインストールします..."
    brew install python
  else
    echo "Python3もHomebrewも見つかりません。https://www.python.org/downloads/ からインストールしてから、このスクリプトをもう一度実行してください。"
    exit 1
  fi
else
  echo "Python3: OK"
fi

if [ -d "$PROJECT_DIR/.git" ]; then
  echo "既存のプロジェクトを更新します..."
  cd "$PROJECT_DIR"
  git pull origin "$BRANCH"
else
  echo "プロジェクトを取得します..."
  mkdir -p "$HOME/Desktop"
  cd "$HOME/Desktop"
  git clone -b "$BRANCH" "$REPO_URL"
  cd "$PROJECT_DIR"
fi

echo "ローカルサーバーを起動します..."
osascript -e "tell application \"Terminal\" to do script \"cd '$PROJECT_DIR' && python3 -m http.server 8000\""

sleep 2
open "http://localhost:8000"

echo ""
echo "起動しました。開いたブラウザで「カメラを開始」を押し、カメラ許可を選んでください。"
echo "サーバーを止めたいときは、新しく開いたターミナルウィンドウで Control+C を押してください。"
