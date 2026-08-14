@echo off
setlocal
cd /d "%~dp0"
if not exist "package.json" (
    echo No package.json found. This launcher only starts projects with an npm dev script.
    exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
    echo npm is required to run this project's dev script.
    exit /b 1
)
node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts.dev ? 0 : 1)" >nul 2>nul
if errorlevel 1 (
    echo package.json has no scripts.dev entry. Start the project with its stack-specific command.
    exit /b 1
)
if not exist ".altool\" mkdir ".altool"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p = Start-Process -FilePath 'cmd.exe' -ArgumentList '/d','/c','npm run dev' -WorkingDirectory (Get-Location).Path -PassThru -NoNewWindow; Set-Content -LiteralPath '.altool\dev-server.pid' -Value $p.Id -Encoding ascii; Wait-Process -Id $p.Id"
if errorlevel 1 exit /b 1
