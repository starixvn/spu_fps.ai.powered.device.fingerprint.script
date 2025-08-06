@echo off
echo Starting FPS API Server...
echo.

cd /d "d:\Projects\SPU\fps.ai.powered.device.fingerprint\api\di\src"

echo Building TypeScript...
call npm run build

if %ERRORLEVEL% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo Starting server on port 3000...
echo Demo page: http://localhost:3000/demo.html
echo API endpoints:
echo   GET  http://localhost:3000/api/fingerprint
echo   POST http://localhost:3000/api/fingerprint  
echo   GET  http://localhost:3000/api/script
echo   GET  http://localhost:3000/health
echo.

call npm start
