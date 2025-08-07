@echo off
setlocal enabledelayedexpansion

echo ===============================================
echo FPS Device Fingerprint - Install and Run
echo ===============================================

REM Check if .venv exists and activate it
if exist ".venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call .venv\Scripts\activate.bat
    echo Virtual environment activated.
) else (
    echo ERROR: Virtual environment not found at .venv\Scripts\activate.bat
    echo Please create a virtual environment first with: python -m venv .venv
    pause
    exit /b 1
)

REM Check if Python is available in the virtual environment
python --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ERROR: Python is not available in the virtual environment
    pause
    exit /b 1
)

REM Find the wheel file
set WHEEL_FILE=
for %%f in (dist\*.whl) do set WHEEL_FILE=%%f

if "%WHEEL_FILE%"=="" (
    echo ERROR: No wheel file found in dist\ directory
    echo Please run build_wheel.bat first to build the wheel package
    pause
    exit /b 1
)

echo Found wheel file: %WHEEL_FILE%
echo.

REM Skip dependency installation since we're using existing .venv
echo Using existing virtual environment dependencies...
echo Skipping requirements.txt installation...
echo.

REM Always reinstall to ensure latest version
echo Installing/Updating wheel package...
pip install --upgrade --force-reinstall "%WHEEL_FILE%"
if !errorlevel! neq 0 (
    echo ERROR: Failed to install wheel package
    pause
    exit /b 1
)
echo Installation completed successfully!
echo.

REM Run the application using the console script entry point
echo Running the application via fps-fingerprint command...
echo.
fps-fingerprint

echo.
echo Application finished.
pause
