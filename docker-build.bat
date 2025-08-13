@echo off
setlocal enabledelayedexpansion

echo 🐳 FPS Docker Build Script (Windows)
echo ====================================

if "%1"=="" goto help

if "%1"=="build" goto build
if "%1"=="run" goto run
if "%1"=="stop" goto stop
if "%1"=="logs" goto logs
goto help

:build
if "%2"=="" (
    echo Building all environments...
    call :build_env development 3000
    call :build_env local 5000
    call :build_env production 5000
    goto end
)

if "%2"=="dev" goto build_dev
if "%2"=="development" goto build_dev
if "%2"=="local" goto build_local
if "%2"=="prod" goto build_prod
if "%2"=="production" goto build_prod
echo ❌ Unknown environment: %2
goto help

:build_dev
call :build_env development 3000
goto end

:build_local
call :build_env local 5000
goto end

:build_prod
call :build_env production 5000
goto end

:build_env
echo 🔨 Building %1 environment (Port: %2)...
docker build --target %1 -t fps-fingerprint:%1 .
if errorlevel 1 (
    echo ❌ Failed to build %1 environment
    exit /b 1
)
echo ✅ %1 image built: fps-fingerprint:%1
goto :eof

:run
if "%2"=="" (
    echo ❌ Please specify environment to run
    echo Usage: %0 run [dev^|local^|prod]
    goto end
)

if "%2"=="dev" goto run_dev
if "%2"=="development" goto run_dev
if "%2"=="local" goto run_local
if "%2"=="prod" goto run_prod
if "%2"=="production" goto run_prod
echo ❌ Unknown environment: %2
goto help

:run_dev
echo 🚀 Running development environment...
docker-compose -f docker-compose.dev.yml up -d
if errorlevel 1 (
    echo ❌ Failed to start development environment
    goto end
)
echo ✅ Development running on http://localhost:3000
goto end

:run_local
echo 🚀 Running local environment...
docker-compose -f docker-compose.local.yml up -d
if errorlevel 1 (
    echo ❌ Failed to start local environment
    goto end
)
echo ✅ Local running on http://localhost:5000
goto end

:run_prod
echo 🚀 Running production environment...
docker-compose up -d
if errorlevel 1 (
    echo ❌ Failed to start production environment
    goto end
)
echo ✅ Production running on http://localhost:5000
goto end

:stop
echo 🛑 Stopping all environments...
docker-compose -f docker-compose.dev.yml down 2>nul
docker-compose -f docker-compose.local.yml down 2>nul
docker-compose down 2>nul
echo ✅ All environments stopped
goto end

:logs
if "%2"=="" (
    echo ❌ Please specify environment for logs
    echo Usage: %0 logs [dev^|local^|prod]
    goto end
)

if "%2"=="dev" goto logs_dev
if "%2"=="development" goto logs_dev
if "%2"=="local" goto logs_local
if "%2"=="prod" goto logs_prod
if "%2"=="production" goto logs_prod
echo ❌ Unknown environment: %2
goto help

:logs_dev
docker-compose -f docker-compose.dev.yml logs -f fps-app
goto end

:logs_local
docker-compose -f docker-compose.local.yml logs -f fps-app
goto end

:logs_prod
docker-compose logs -f fps-app
goto end

:help
echo FPS Docker Management Script (Windows)
echo.
echo Usage: %0 [command] [environment]
echo.
echo Commands:
echo   build [env]     - Build Docker image(s)
echo   run ^<env^>       - Run environment with Docker Compose
echo   stop            - Stop all running environments
echo   logs ^<env^>      - Show logs for specific environment
echo.
echo Environments:
echo   dev/development - Port 3000 (Development)
echo   local          - Port 5000 (Local)
echo   prod/production - Port 5000 (Production)
echo.
echo Examples:
echo   %0 build                    # Build all environments
echo   %0 build dev                # Build development only
echo   %0 run dev                  # Run development (port 3000)
echo   %0 run local                # Run local (port 5000)
echo   %0 run prod                 # Run production (port 5000)
echo   %0 logs dev                 # Show development logs
echo   %0 stop                     # Stop all environments

:end
