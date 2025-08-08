@echo off
echo FPS Project Migration Tool
echo ==========================
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js and try again
    pause
    exit /b 1
)

REM Check if TypeScript is available
npx tsc --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing TypeScript...
    npm install -g typescript
)

echo Available migration options:
echo.
echo 1. Check project structure
echo 2. Run migration (dry run)
echo 3. Run full migration
echo 4. Clean unused files only
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo Checking project structure...
    npx ts-node tools/migration/check-structure.ts
) else if "%choice%"=="2" (
    echo.
    echo Running migration preview...
    npx ts-node tools/migration/migrate.ts --dry-run --verbose
) else if "%choice%"=="3" (
    echo.
    echo WARNING: This will make actual changes to your project!
    set /p confirm="Are you sure? (y/N): "
    if /i "!confirm!"=="y" (
        echo Running full migration...
        npx ts-node tools/migration/migrate.ts --verbose
    ) else (
        echo Migration cancelled.
    )
) else if "%choice%"=="4" (
    echo.
    echo Cleaning unused files...
    if exist "README_NEW.md" del "README_NEW.md"
    if exist "report.md" del "report.md"
    if exist "test_results_report_README_report.md" del "test_results_report_README_report.md"
    if exist ".vs" rmdir /s /q ".vs"
    echo Done cleaning basic files.
) else if "%choice%"=="5" (
    echo Goodbye!
    exit /b 0
) else (
    echo Invalid choice. Please try again.
)

echo.
pause
