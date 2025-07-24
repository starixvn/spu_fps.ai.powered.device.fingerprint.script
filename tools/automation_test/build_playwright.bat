@echo off
echo =========================================
echo    FPS AI - Build Playwright Executable
echo =========================================
echo.

echo [1/5] Installing Playwright...
pip install playwright==1.40.0
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install Playwright
    pause
    exit /b 1
)

echo [2/5] Installing Playwright browsers...
playwright install
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ Playwright browsers may not be fully installed
    echo This might affect runtime, but build can continue
)

echo [3/5] Installing other dependencies...
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install requirements
    pause
    exit /b 1
)

echo [4/5] Installing PyInstaller...
pip install pyinstaller
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install PyInstaller
    pause
    exit /b 1
)

echo [5/5] Building executable...
pyinstaller fps-playwright-onefile.spec
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo.
echo ✅ Build completed successfully!
echo.
echo Output: dist\fps-playwright-onefile.exe
echo.
echo Notes:
echo - Executable includes Playwright libraries
echo - First run may be slower as it extracts files
echo - Browsers are downloaded separately at runtime
echo - For best performance, run "playwright install" on target machine
echo.
pause
