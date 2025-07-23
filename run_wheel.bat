@echo off
setlocal enabledelayedexpansion

echo ===============================================
echo FPS Device Fingerprint - Quick Runner
echo ===============================================

REM Find the wheel file
set WHEEL_FILE=
for %%f in (dist\*.whl) do set WHEEL_FILE=%%f

if "%WHEEL_FILE%"=="" (
    echo ERROR: No wheel file found in dist\ directory
    echo Building wheel first...
    python setup.py bdist_wheel
    if !errorlevel! neq 0 (
        echo ERROR: Failed to build wheel
        pause
        exit /b 1
    )
    for %%f in (dist\*.whl) do set WHEEL_FILE=%%f
)

echo Found wheel file: %WHEEL_FILE%
echo.

REM Always reinstall to ensure latest version
echo Installing/Updating wheel...
pip install --upgrade --force-reinstall "%WHEEL_FILE%"
if !errorlevel! neq 0 (
    echo ERROR: Failed to install wheel
    pause
    exit /b 1
)
echo Installation completed!
echo.

REM Run the application with provided arguments
if "%1"=="" (
    echo Running with default settings...
    fps-fingerprint chrome
) else (
    echo Running with arguments: %*
    fps-fingerprint %*
)

echo.
echo Application finished.
pause
