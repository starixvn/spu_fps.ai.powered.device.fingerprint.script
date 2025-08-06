@echo off
:: Script chạy test case dễ dàng
:: Sử dụng: run_tests.bat [options]

echo ========================================
echo    FPS Test Runner - Easy Mode
echo ========================================

cd /d "%~dp0"

:: Kiểm tra virtual environment
if not exist .venv (
    echo Error: Virtual environment not found! Please run setup_env.bat first
    pause
    exit /b 1
)

:: Activate virtual environment
call .venv\Scripts\activate.bat

:: Các tùy chọn chạy test
if "%1"=="" (
    echo Select test option:
    echo 1. Run all tests
    echo 2. Run login tests only
    echo 3. Run specific browser tests
    echo 4. Run with detailed report
    echo 5. Run smoke tests
    echo 6. Run single test file
    echo 7. Run with live output
    echo.
    set /p choice="Enter your choice (1-7): "
) else (
    set choice=%1
)

if "%choice%"=="1" (
    echo Running all tests...
    pytest src/tests/ -v --tb=short
) else if "%choice%"=="2" (
    echo Running login tests only...
    pytest src/tests/ -m login -v --tb=short
) else if "%choice%"=="3" (
    echo Select browser:
    echo 1. Chrome only
    echo 2. Firefox only  
    echo 3. Edge only
    echo 4. All browsers
    set /p browser="Enter browser choice (1-4): "
    if "!browser!"=="1" pytest src/tests/ -k "chrome" -v --tb=short
    if "!browser!"=="2" pytest src/tests/ -k "firefox" -v --tb=short
    if "!browser!"=="3" pytest src/tests/ -k "edge" -v --tb=short
    if "!browser!"=="4" pytest src/tests/ -v --tb=short
) else if "%choice%"=="4" (
    echo Running with detailed HTML report...
    pytest src/tests/ -v --tb=long --html=reports/test_report.html --self-contained-html
    echo Report saved to: reports/test_report.html
) else if "%choice%"=="5" (
    echo Running smoke tests...
    pytest src/tests/ -m smoke -v --tb=short
) else if "%choice%"=="6" (
    echo Available test files:
    echo 1. test_login.py
    echo 2. test_user_agent.py
    echo 3. All files in login/
    echo 4. All files in fingerprint/
    set /p file="Enter file choice (1-4): "
    if "!file!"=="1" pytest src/tests/login/test_login.py -v --tb=short
    if "!file!"=="2" pytest src/tests/fingerprint/test_user_agent.py -v --tb=short
    if "!file!"=="3" pytest src/tests/login/ -v --tb=short
    if "!file!"=="4" pytest src/tests/fingerprint/ -v --tb=short
) else if "%choice%"=="7" (
    echo Running with live output...
    pytest src/tests/ -v -s --tb=short
) else (
    echo Invalid choice!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Test execution completed!
echo ========================================
pause
