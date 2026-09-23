@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 > nul
cd /d "%~dp0"
set "PID_FILE=.altool\dev-server.pid"
set "PORT=%~1"
if not defined PORT set "PORT=3000"
echo(%PORT%| findstr /r /x "[0-9][0-9]*" >nul
if errorlevel 1 (
    echo Invalid port: %PORT%
    exit /b 1
)

if not exist "%PID_FILE%" (
    echo No Altool-managed development server PID was found. Nothing was stopped.
    echo Listeners on port %PORT% ^(information only^):
    netstat -aon | findstr LISTENING | findstr ":%PORT% "
    exit /b 1
)

set /p "SERVER_PID=" < "%PID_FILE%"
echo(!SERVER_PID!| findstr /r /x "[0-9][0-9]*" >nul
if errorlevel 1 (
    echo Invalid Altool PID file. Nothing was stopped: %PID_FILE%
    exit /b 1
)

tasklist /fi "PID eq !SERVER_PID!" | findstr /r /c:"[ ]!SERVER_PID![ ]" >nul
if errorlevel 1 (
    del "%PID_FILE%" >nul 2>nul
    echo The recorded process !SERVER_PID! is no longer running. Removed the stale PID file.
    exit /b 0
)

echo Stopping Altool-managed development server ^(PID !SERVER_PID!^)...
taskkill /pid !SERVER_PID! /t /f >nul
if errorlevel 1 (
    echo Failed to stop PID !SERVER_PID!. The PID file was preserved.
    exit /b 1
)
del "%PID_FILE%" >nul 2>nul
echo Done.
