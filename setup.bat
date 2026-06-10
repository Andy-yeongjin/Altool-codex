@echo off
setlocal

set "ALTOOL_DIR=%~dp0"
if "%ALTOOL_DIR:~-1%"=="\" set "ALTOOL_DIR=%ALTOOL_DIR:~0,-1%"

echo.
echo =============================================
echo   Altool Project Setup
echo =============================================
echo.

:: Windows folder picker dialog (VBScript)
set "TMPVBS=%TEMP%\altool_picker.vbs"
echo Set oShell = CreateObject("Shell.Application") > "%TMPVBS%"
echo Set oFolder = oShell.BrowseForFolder(0, "Select your project folder", 0) >> "%TMPVBS%"
echo If Not oFolder Is Nothing Then >> "%TMPVBS%"
echo     WScript.Echo oFolder.Self.Path >> "%TMPVBS%"
echo End If >> "%TMPVBS%"
for /f "delims=" %%i in ('cscript //nologo "%TMPVBS%"') do set "PROJECT_DIR=%%i"
del "%TMPVBS%" 2>nul

if not defined PROJECT_DIR goto :manual
if "%PROJECT_DIR%"=="" goto :manual
goto :proceed

:manual
echo.
echo   [!] Folder picker failed. Please type the project folder path.
echo   [!] Example: C:\Users\YourName\Desktop\my-project
echo.
set /p PROJECT_DIR="  Folder path: "

if not defined PROJECT_DIR (
    echo Cancelled.
    pause
    exit /b 0
)
if "%PROJECT_DIR%"=="" (
    echo Cancelled.
    pause
    exit /b 0
)

:proceed

echo   Target: %PROJECT_DIR%
echo.
echo   Copying files...

:: Altool engine (steps + templates + rules)
xcopy /e /i /y "%ALTOOL_DIR%\altool" "%PROJECT_DIR%\altool" > nul
echo   [OK] altool\ (engine)

:: CLAUDE.md
if exist "%ALTOOL_DIR%\templates\CLAUDE.md" (
    copy /y "%ALTOOL_DIR%\templates\CLAUDE.md" "%PROJECT_DIR%\CLAUDE.md" > nul
    echo   [OK] CLAUDE.md
)

:: .claude/commands/al.md
if not exist "%PROJECT_DIR%\.claude\commands\" mkdir "%PROJECT_DIR%\.claude\commands"
if exist "%ALTOOL_DIR%\templates\.claude\commands\al.md" (
    copy /y "%ALTOOL_DIR%\templates\.claude\commands\al.md" "%PROJECT_DIR%\.claude\commands\al.md" > nul
    echo   [OK] .claude\commands\al.md
)

:: constitution.md
if exist "%ALTOOL_DIR%\constitution.md" (
    copy /y "%ALTOOL_DIR%\constitution.md" "%PROJECT_DIR%\constitution.md" > nul
    echo   [OK] constitution.md
)

:: designs/
if not exist "%PROJECT_DIR%\designs\" mkdir "%PROJECT_DIR%\designs"
for %%f in (design.md design-tokens.css design-constitution.md) do (
    if exist "%ALTOOL_DIR%\designs\%%f" (
        copy /y "%ALTOOL_DIR%\designs\%%f" "%PROJECT_DIR%\designs\%%f" > nul
        echo   [OK] designs\%%f
    )
)

:: prd/
if not exist "%PROJECT_DIR%\prd\" mkdir "%PROJECT_DIR%\prd"
echo   [OK] prd\ (folder)

:: start.bat / end.bat
for %%f in (start.bat end.bat) do (
    if exist "%ALTOOL_DIR%\%%f" (
        copy /y "%ALTOOL_DIR%\%%f" "%PROJECT_DIR%\%%f" > nul
        echo   [OK] %%f
    )
)

:: .gitignore (only create when missing - never overwrite)
if not exist "%PROJECT_DIR%\.gitignore" (
    (
        echo # Altool state
        echo .altool/
        echo.
        echo # Node
        echo node_modules/
        echo .next/
        echo.
        echo # Env / secrets
        echo .env
        echo .env*.local
        echo.
        echo # Local DB
        echo *.db
        echo *.db-journal
        echo.
        echo # Playwright MCP
        echo .playwright-mcp/
    ) > "%PROJECT_DIR%\.gitignore"
    echo   [OK] .gitignore (created)
) else (
    echo   [SKIP] .gitignore exists - add ".altool/" manually if needed
)

echo.
echo =============================================
echo   Done!
echo =============================================
echo.
echo   1. Open Claude Code (or Claude Desktop Code tab)
echo   2. Open folder: %PROJECT_DIR%
echo   3. Type:  /al setup
echo.
pause
