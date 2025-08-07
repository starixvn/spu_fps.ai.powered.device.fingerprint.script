@echo off
echo =========================================
echo    FPS AI - Cài đặt Playwright
echo =========================================
echo.

echo [1/3] Cài đặt Playwright Python package...
pip install playwright==1.40.0

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Lỗi cài đặt Playwright package
    pause
    exit /b 1
)

echo [2/3] Cài đặt Playwright browsers...
playwright install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Lỗi cài đặt Playwright browsers
    pause
    exit /b 1
)

echo [3/3] Cài đặt dependencies cho browsers...
playwright install-deps

if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ Một số dependencies có thể chưa được cài đặt đầy đủ
    echo Playwright vẫn có thể hoạt động bình thường
)

echo.
echo ✅ Cài đặt Playwright hoàn tất!
echo.
echo Playwright đã sẵn sàng sử dụng với các browsers:
echo   - Chromium (tương đương Chrome)
echo   - Firefox  
echo   - WebKit (tương đương Safari)
echo   - Microsoft Edge
echo.
echo Ưu điểm của Playwright:
echo   ✓ Nhanh hơn Selenium 2-3 lần
echo   ✓ Ít bị phát hiện automation hơn
echo   ✓ Hỗ trợ modern web apps tốt hơn
echo   ✓ Auto-wait cho elements
echo   ✓ Network interception
echo   ✓ Screenshot và video recording
echo.
pause
