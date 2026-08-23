# Hand Gesture Effects - Windows automatic setup
# This script installs Git/Python if missing, gets the latest project files,
# starts the local server, and opens the app in your browser.

$ErrorActionPreference = "Stop"
$branch = "claude/hand-gesture-effects-glik5u"
$repoUrl = "https://github.com/pa314960-prog/kaken1web.git"
$projectDir = Join-Path $HOME "Desktop\kaken1web"

function Test-Command($name) {
    return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

Write-Host "=== Hand Gesture Effects: 自動セットアップ ===" -ForegroundColor Cyan

if (-not (Test-Command "winget")) {
    Write-Host "winget が見つかりません。Windows Update を最新にするか、Microsoft Store から「アプリ インストーラー」を入れてから再実行してください。" -ForegroundColor Red
    exit 1
}

if (-not (Test-Command "git")) {
    Write-Host "Gitが見つからないのでインストールします..." -ForegroundColor Yellow
    winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
} else {
    Write-Host "Git: OK" -ForegroundColor Green
}

if (-not (Test-Command "python")) {
    Write-Host "Pythonが見つからないのでインストールします..." -ForegroundColor Yellow
    winget install --id Python.Python.3.12 -e --source winget --accept-package-agreements --accept-source-agreements
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
} else {
    Write-Host "Python: OK" -ForegroundColor Green
}

if (-not (Test-Command "git") -or -not (Test-Command "python")) {
    Write-Host "GitまたはPythonのインストール直後でPATHが反映されていません。PowerShellを一度閉じて、もう一度このスクリプトを実行してください。" -ForegroundColor Yellow
    exit 1
}

if (Test-Path $projectDir) {
    Write-Host "既存のプロジェクトを更新します..." -ForegroundColor Cyan
    Push-Location $projectDir
    git pull origin $branch
    Pop-Location
} else {
    Write-Host "プロジェクトを取得します..." -ForegroundColor Cyan
    $desktopDir = Join-Path $HOME "Desktop"
    if (-not (Test-Path $desktopDir)) { New-Item -ItemType Directory -Path $desktopDir | Out-Null }
    Push-Location $desktopDir
    git clone -b $branch $repoUrl
    Pop-Location
}

Write-Host "ローカルサーバーを起動します..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectDir'; python -m http.server 8000"

Start-Sleep -Seconds 2
Start-Process "http://localhost:8000"

Write-Host ""
Write-Host "起動しました。開いたブラウザで「カメラを開始」を押し、カメラ許可を選んでください。" -ForegroundColor Green
Write-Host "サーバーを止めたいときは、新しく開いたPowerShellウィンドウで Ctrl+C を押してください。" -ForegroundColor Green
