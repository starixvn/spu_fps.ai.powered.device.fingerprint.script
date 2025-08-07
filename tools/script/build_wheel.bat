@echo off
setlocal enabledelayedexpansion

echo ===============================================
echo FPS Device Fingerprint - Build Wheel
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

REM Clean previous builds
if exist "build\" (
    echo Cleaning previous build directory...
    rmdir /s /q "build\"
)

if exist "dist\" (
    echo Cleaning previous dist directory...
    rmdir /s /q "dist\"
)

if exist "*.egg-info\" (
    echo Cleaning egg-info directory...
    for /d %%d in (*.egg-info) do rmdir /s /q "%%d"
)

echo.
echo Building wheel package...
python setup.py bdist_wheel

if !errorlevel! neq 0 (
    echo ERROR: Failed to build wheel package
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
echo Wheel file created in dist\ directory:
for %%f in (dist\*.whl) do echo   - %%f

echo.
echo You can now run install_and_run.bat to install and run the application
pause
