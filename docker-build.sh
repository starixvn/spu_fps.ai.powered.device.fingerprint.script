#!/bin/bash
# Build script for different environments

echo "🐳 FPS Docker Build Script"
echo "=========================="

# Function to build specific environment
build_env() {
    local env=$1
    local port=$2
    
    echo "🔨 Building $env environment (Port: $port)..."
    
    case $env in
        "development")
            docker build --target development -t fps-fingerprint:dev .
            echo "✅ Development image built: fps-fingerprint:dev"
            ;;
        "local")
            docker build --target local -t fps-fingerprint:local .
            echo "✅ Local image built: fps-fingerprint:local"
            ;;
        "production")
            docker build --target production -t fps-fingerprint:prod .
            echo "✅ Production image built: fps-fingerprint:prod"
            ;;
        *)
            echo "❌ Unknown environment: $env"
            echo "Available environments: development, local, production"
            exit 1
            ;;
    esac
}

# Function to run specific environment
run_env() {
    local env=$1
    
    echo "🚀 Running $env environment..."
    
    case $env in
        "development")
            docker-compose -f docker-compose.dev.yml up -d
            echo "✅ Development running on http://localhost:3000"
            ;;
        "local")
            docker-compose -f docker-compose.local.yml up -d
            echo "✅ Local running on http://localhost:5000"
            ;;
        "production")
            docker-compose up -d
            echo "✅ Production running on http://localhost:5000"
            ;;
        *)
            echo "❌ Unknown environment: $env"
            exit 1
            ;;
    esac
}

# Main script logic
case "$1" in
    "build")
        if [ -z "$2" ]; then
            echo "Building all environments..."
            build_env "development" "3000"
            build_env "local" "5000"
            build_env "production" "5000"
        else
            case "$2" in
                "dev"|"development")
                    build_env "development" "3000"
                    ;;
                "local")
                    build_env "local" "5000"
                    ;;
                "prod"|"production")
                    build_env "production" "5000"
                    ;;
                *)
                    echo "❌ Unknown environment: $2"
                    echo "Available: dev/development, local, prod/production"
                    exit 1
                    ;;
            esac
        fi
        ;;
    "run")
        if [ -z "$2" ]; then
            echo "❌ Please specify environment to run"
            echo "Usage: $0 run [dev|local|prod]"
            exit 1
        fi
        
        case "$2" in
            "dev"|"development")
                run_env "development"
                ;;
            "local")
                run_env "local"
                ;;
            "prod"|"production")
                run_env "production"
                ;;
            *)
                echo "❌ Unknown environment: $2"
                echo "Available: dev/development, local, prod/production"
                exit 1
                ;;
        esac
        ;;
    "stop")
        echo "🛑 Stopping all environments..."
        docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
        docker-compose -f docker-compose.local.yml down 2>/dev/null || true
        docker-compose down 2>/dev/null || true
        echo "✅ All environments stopped"
        ;;
    "logs")
        if [ -z "$2" ]; then
            echo "❌ Please specify environment for logs"
            echo "Usage: $0 logs [dev|local|prod]"
            exit 1
        fi
        
        case "$2" in
            "dev"|"development")
                docker-compose -f docker-compose.dev.yml logs -f fps-app
                ;;
            "local")
                docker-compose -f docker-compose.local.yml logs -f fps-app
                ;;
            "prod"|"production")
                docker-compose logs -f fps-app
                ;;
            *)
                echo "❌ Unknown environment: $2"
                exit 1
                ;;
        esac
        ;;
    *)
        echo "FPS Docker Management Script"
        echo ""
        echo "Usage: $0 [command] [environment]"
        echo ""
        echo "Commands:"
        echo "  build [env]     - Build Docker image(s)"
        echo "  run <env>       - Run environment with Docker Compose"
        echo "  stop            - Stop all running environments"
        echo "  logs <env>      - Show logs for specific environment"
        echo ""
        echo "Environments:"
        echo "  dev/development - Port 3000 (Development)"
        echo "  local          - Port 5000 (Local)"
        echo "  prod/production - Port 5000 (Production)"
        echo ""
        echo "Examples:"
        echo "  $0 build                    # Build all environments"
        echo "  $0 build dev                # Build development only"
        echo "  $0 run dev                  # Run development (port 3000)"
        echo "  $0 run local                # Run local (port 5000)"
        echo "  $0 run prod                 # Run production (port 5000)"
        echo "  $0 logs dev                 # Show development logs"
        echo "  $0 stop                     # Stop all environments"
        ;;
esac
