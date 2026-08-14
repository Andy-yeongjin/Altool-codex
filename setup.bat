@echo off
setlocal

set "ALTOOL_DIR=%~dp0"
if "%ALTOOL_DIR:~-1%"=="\" set "ALTOOL_DIR=%ALTOOL_DIR:~0,-1%"
set "NONINTERACTIVE="

if not "%~1"=="" (
    set "PROJECT_DIR=%~1"
    set "NONINTERACTIVE=1"
    goto :proceed
)

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

:: AGENTS.md (Codex project instructions)
if exist "%ALTOOL_DIR%\AGENTS.md" (
    if not exist "%PROJECT_DIR%\AGENTS.md" (
        copy /y "%ALTOOL_DIR%\AGENTS.md" "%PROJECT_DIR%\AGENTS.md" > nul
        echo   [OK] AGENTS.md
    ) else (
        echo   [KEEP] AGENTS.md already exists
    )
)

:: Codex repo-local skills
if not exist "%PROJECT_DIR%\.agents\skills\" mkdir "%PROJECT_DIR%\.agents\skills"
if exist "%ALTOOL_DIR%\templates\codex\skills\" (
    for /d %%s in ("%ALTOOL_DIR%\templates\codex\skills\*") do (
        if exist "%%s\SKILL.md" (
            xcopy /e /i /y "%%s" "%PROJECT_DIR%\.agents\skills\%%~nxs" > nul
            echo   [OK] Codex local skill: %%~nxs
        )
    )
) else (
    echo   [WARN] Codex skill templates missing: templates\codex\skills
)

:: constitution.md
if exist "%ALTOOL_DIR%\constitution.md" (
    if not exist "%PROJECT_DIR%\constitution.md" (
        copy /y "%ALTOOL_DIR%\constitution.md" "%PROJECT_DIR%\constitution.md" > nul
        echo   [OK] constitution.md
    ) else (
        echo   [KEEP] constitution.md already exists
    )
)

:: Warn when the preserved project constitution is incompatible with this engine.
if not exist "%ALTOOL_DIR%\constitution.md" (
    echo   [WARN] Engine constitution missing - version check skipped
    goto :constitution_version_done
)
set "ENGINE_CONSTITUTION_VERSION="
set "ENGINE_CONSTITUTION_MAJOR="
set "PROJECT_CONSTITUTION_VERSION="
set "PROJECT_CONSTITUTION_MAJOR="
for /f "tokens=2 delims=:" %%v in ('findstr /b /c:"**Version**:" "%ALTOOL_DIR%\constitution.md" 2^>nul') do for /f "tokens=1" %%w in ("%%v") do set "ENGINE_CONSTITUTION_VERSION=%%w"
for /f "tokens=1 delims=." %%m in ("%ENGINE_CONSTITUTION_VERSION%") do set "ENGINE_CONSTITUTION_MAJOR=%%m"
for /f "tokens=2 delims=:" %%v in ('findstr /b /c:"**Version**:" "%PROJECT_DIR%\constitution.md" 2^>nul') do for /f "tokens=1" %%w in ("%%v") do set "PROJECT_CONSTITUTION_VERSION=%%w"
for /f "tokens=1 delims=." %%m in ("%PROJECT_CONSTITUTION_VERSION%") do set "PROJECT_CONSTITUTION_MAJOR=%%m"
if not defined PROJECT_CONSTITUTION_VERSION (
    echo   [WARN] constitution.md has no Version marker - engine expects major %ENGINE_CONSTITUTION_MAJOR%.x
) else if not "%PROJECT_CONSTITUTION_MAJOR%"=="%ENGINE_CONSTITUTION_MAJOR%" (
    echo   [WARN] constitution.md is v%PROJECT_CONSTITUTION_VERSION% - engine expects major %ENGINE_CONSTITUTION_MAJOR%.x; review before running $altool
) else (
    echo   [OK] constitution.md version compatible: v%PROJECT_CONSTITUTION_VERSION%
)
:constitution_version_done

:: designs/
if not exist "%PROJECT_DIR%\designs\" mkdir "%PROJECT_DIR%\designs"
if not exist "%PROJECT_DIR%\designs\claude-design\" mkdir "%PROJECT_DIR%\designs\claude-design"
echo   [OK] designs\claude-design\ (Claude design HTML folder)
for %%f in (design.md) do (
    if exist "%ALTOOL_DIR%\designs\%%f" (
        if not exist "%PROJECT_DIR%\designs\%%f" (
            copy /y "%ALTOOL_DIR%\designs\%%f" "%PROJECT_DIR%\designs\%%f" > nul
            echo   [OK] designs\%%f
        ) else (
            echo   [KEEP] designs\%%f already exists
        )
    )
)

:: prd/
if not exist "%PROJECT_DIR%\prd\" mkdir "%PROJECT_DIR%\prd"
echo   [OK] prd\ (folder)

:: Windows launchers
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
        echo # Python
        echo __pycache__/
        echo.
        echo # OS
        echo .DS_Store
        echo Thumbs.db
        echo.
        echo # Env / secrets
        echo .env
        echo .env*.local
        echo.
        echo # Local DB
        echo *.db
        echo *.db-journal
        echo.
        echo # Codex repo-local skills
        echo !.agents/
        echo.
        echo # Local browser/test artifacts
        echo .playwright-mcp/
    ) > "%PROJECT_DIR%\.gitignore"
    echo   [OK] .gitignore created
) else (
    echo   [SKIP] .gitignore exists - add ".altool/" manually if needed
)

echo.
echo =============================================
echo   Done!
echo =============================================
echo.
echo   1. Open Codex
echo   2. Open folder: %PROJECT_DIR%
echo   3. Restart Codex or open a new chat if the skill does not appear
echo   4. Type:  $altool setup
echo.
if not defined NONINTERACTIVE pause
