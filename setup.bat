@echo off
setlocal

set "ALTOOL_DIR=%~dp0"
if "%ALTOOL_DIR:~-1%"=="\" set "ALTOOL_DIR=%ALTOOL_DIR:~0,-1%"
set "NONINTERACTIVE="
if not "%~1"=="" set "NONINTERACTIVE=1"

if not exist "%ALTOOL_DIR%\altool\scripts\check.py" (
    echo   [ERROR] Altool gate missing: %ALTOOL_DIR%\altool\scripts\check.py
    goto :failed
)
if not exist "%ALTOOL_DIR%\templates\codex\skills\altool\SKILL.md" (
    echo   [ERROR] Bundled Altool skill missing: %ALTOOL_DIR%\templates\codex\skills\altool\SKILL.md
    goto :failed
)
set "PYTHON_CMD="
if not exist "%ALTOOL_DIR%\project-starter.html" goto :starter_missing
if not exist "%ALTOOL_DIR%\altool\scripts\project-starter.js" goto :starter_missing
if defined VIRTUAL_ENV call :try_python python
if not defined PYTHON_CMD call :try_python py -3
if not defined PYTHON_CMD call :try_python python3
if not defined PYTHON_CMD call :try_python python
if not defined PYTHON_CMD (
    echo   [ERROR] Python 3 is required, and altool\scripts\check.py --help must run successfully.
    goto :failed
)

%PYTHON_CMD% "%ALTOOL_DIR%\altool\scripts\standards.py" validate --root "%ALTOOL_DIR%"
if errorlevel 1 (
    echo Source validation failed; see the error above. Restore damaged product files.
    echo YAML support is bundled. No pip installation is needed; restore the complete Altool package.
    goto :failed
)

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

%PYTHON_CMD% -c "import pathlib,sys; raise SystemExit(pathlib.Path(sys.argv[1]).resolve() == pathlib.Path(sys.argv[2]).resolve())" "%PROJECT_DIR%" "%ALTOOL_DIR%"
if errorlevel 1 (
    echo   [ERROR] Installation target must differ from the Altool source directory.
    goto :failed
)

echo   Target: %PROJECT_DIR%
echo   Python: %PYTHON_CMD%
echo.
echo   Copying files...

:: Altool engine (steps + templates + rules)
if exist "%PROJECT_DIR%\altool\" (
    rmdir /s /q "%PROJECT_DIR%\altool"
    if errorlevel 1 goto :copy_failed
)
%PYTHON_CMD% "%ALTOOL_DIR%\altool\scripts\distribution.py" "%ALTOOL_DIR%\altool" "%PROJECT_DIR%\altool"
if errorlevel 1 goto :copy_failed
echo   [OK] altool\ (engine)

:: AGENTS.md (Codex project instructions)
if exist "%ALTOOL_DIR%\AGENTS.md" (
    if not exist "%PROJECT_DIR%\AGENTS.md" (
        copy /y "%ALTOOL_DIR%\AGENTS.md" "%PROJECT_DIR%\AGENTS.md" > nul
        if errorlevel 1 goto :copy_failed
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
            if exist "%PROJECT_DIR%\.agents\skills\%%~nxs\" (
                rmdir /s /q "%PROJECT_DIR%\.agents\skills\%%~nxs"
                if errorlevel 1 goto :copy_failed
            )
            %PYTHON_CMD% "%ALTOOL_DIR%\altool\scripts\distribution.py" "%%s" "%PROJECT_DIR%\.agents\skills\%%~nxs"
            if errorlevel 1 goto :copy_failed
            echo   [OK] Codex local skill: %%~nxs
        )
    )
) else (
    echo   [WARN] Codex skill templates missing: templates\codex\skills
)

:: designs/
if not exist "%PROJECT_DIR%\designs\" mkdir "%PROJECT_DIR%\designs"
if not exist "%PROJECT_DIR%\designs\claude-design\" mkdir "%PROJECT_DIR%\designs\claude-design"
echo   [OK] designs\claude-design\ (Claude design HTML folder)
%PYTHON_CMD% "%ALTOOL_DIR%\altool\scripts\standards.py" install --source "%ALTOOL_DIR%" --root "%PROJECT_DIR%"
if errorlevel 1 goto :copy_failed

:: prd/
if not exist "%PROJECT_DIR%\prd\" mkdir "%PROJECT_DIR%\prd"
echo   [OK] prd\ (folder)

:: Windows launchers
for %%f in (start.bat end.bat) do (
    if exist "%ALTOOL_DIR%\%%f" (
        copy /y "%ALTOOL_DIR%\%%f" "%PROJECT_DIR%\%%f" > nul
        if errorlevel 1 goto :copy_failed
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
exit /b 0

:try_python
%* -c "import sys; raise SystemExit(sys.version_info.major != 3)" >nul 2>nul
if errorlevel 1 exit /b 0
%* "%ALTOOL_DIR%\altool\scripts\check.py" --help >nul 2>nul
if errorlevel 1 exit /b 0
set "PYTHON_CMD=%*"
exit /b 0

:copy_failed
echo   [ERROR] Managed directory replacement failed. Installation stopped.
goto :failed

:starter_missing
echo   [ERROR] Project Starter source missing. Restore the complete Altool package.

:failed
if not defined NONINTERACTIVE pause
exit /b 1
