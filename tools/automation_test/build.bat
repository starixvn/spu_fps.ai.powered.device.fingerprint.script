@echo off
setlocal enabledelayedexpansion

echo ===============================================
echo FPS AI Device Fingerprint - Build Script
echo ===============================================
echo.

echo Select build type:
echo 1. Directory build (faster startup, multiple files)
echo 2. One-file build (slower startup, single executable)
echo 3. Install PyInstaller only
echo 4. Clean build directories
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="3" goto install_only
if "%choice%"=="4" goto clean_only

REM Clean previous builds
echo Cleaning previous builds...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
echo.

REM Install PyInstaller if not already installed
echo Installing/updating PyInstaller...
pip install pyinstaller>=6.3.0
echo.

if "%choice%"=="1" (
    echo Building directory version...
    pyinstaller fps-fingerprint.spec --clean --noconfirm
    
    if exist dist\fps-fingerprint\fps-fingerprint.exe (
        echo.
        echo ✓ Directory build completed successfully!
        echo Location: dist\fps-fingerprint\
        echo Executable: fps-fingerprint.exe
        echo.
        echo To run:
        echo cd dist\fps-fingerprint
        echo fps-fingerprint.exe chrome headless
    ) else (
        echo ✗ Directory build failed!
    )
) else if "%choice%"=="2" (
    echo Building one-file version...
    pyinstaller fps-fingerprint-onefile.spec --clean --noconfirm
    
    if exist dist\fps-fingerprint-onefile.exe (
        echo.
        echo ✓ One-file build completed successfully!
        echo Location: dist\fps-fingerprint-onefile.exe
        echo.
        echo To run:
        echo dist\fps-fingerprint-onefile.exe chrome headless
    ) else (
        echo ✗ One-file build failed!
    )
) else (
    echo Invalid choice. Please run the script again.
    goto end
)

goto end

:install_only
echo Installing PyInstaller...
pip install pyinstaller>=6.3.0
echo PyInstaller installed successfully!
goto end

:clean_only
echo Cleaning build directories...
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
echo Build directories cleaned!
goto end

:end
echo.
echo Build script completed.
pause
