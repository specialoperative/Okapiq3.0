#!/bin/bash

# Okapiq Startup Script
# This script launches the complete Okapiq application stack

set -e

echo "🚀 Starting Okapiq - Bloomberg for Small Businesses"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is required but not installed"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is required but not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is required but not installed"
        exit 1
    fi
    
    # Check PostgreSQL (optional)
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL not found - using SQLite for development"
    fi
    
    print_success "Dependencies check completed"
}

# Setup Python virtual environment
setup_python_env() {
    print_status "Setting up Python environment..."
    
    if [ ! -d "backend/venv" ]; then
        print_status "Creating Python virtual environment..."
        cd backend
        python3 -m venv venv
        cd ..
    fi
    
    print_status "Activating virtual environment and installing dependencies..."
    cd backend
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements-core.txt
    cd ..
    
    print_success "Python environment setup completed"
}

# Setup Node.js dependencies
setup_node_env() {
    print_status "Setting up Node.js environment..."
    
    cd frontend
    if [ ! -d "node_modules" ]; then
        print_status "Installing Node.js dependencies..."
        npm install
    else
        print_status "Node.js dependencies already installed"
    fi
    cd ..
    
    print_success "Node.js environment setup completed"
}

# Create environment files
setup_env_files() {
    print_status "Setting up environment files..."
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
# Database (using SQLite for development)
DATABASE_URL=sqlite:///./okapiq.db

# Redis
REDIS_URL=redis://localhost:6379

# API Keys (add your actual keys)
YELP_API_KEY=your_yelp_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
CENSUS_API_KEY=your_census_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

# JWT
SECRET_KEY=your-secret-key-change-this-in-production

# App Settings
DEBUG=True
EOF
        print_success "Created backend/.env file"
    fi
    
    # Frontend .env.local
    if [ ! -f "frontend/.env.local" ]; then
        cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Okapiq
EOF
        print_success "Created frontend/.env.local file"
    fi
}

# Start backend server
start_backend() {
    print_status "Starting backend server..."
    
    cd backend
    source venv/bin/activate
    
    # Check if database exists, create if not
    if [ ! -f "okapiq.db" ]; then
        print_status "Initializing database..."
        python -c "
from app.core.database import engine, Base
Base.metadata.create_all(bind=engine)
print('Database initialized successfully')
"
    fi
    
    # Start the server
    print_status "Starting FastAPI server on http://localhost:8000"
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
    BACKEND_PID=$!
    cd ..
    
    print_success "Backend server started (PID: $BACKEND_PID)"
}

# Start frontend server
start_frontend() {
    print_status "Starting frontend server..."
    
    cd frontend
    print_status "Starting Next.js server on http://localhost:3000"
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    print_success "Frontend server started (PID: $FRONTEND_PID)"
}

# Run market analysis demo
run_demo() {
    print_status "Running market analysis demo..."
    
    cd backend
    source venv/bin/activate
    python algorithms/market_analyzer.py
    cd ..
    
    print_success "Demo completed"
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Check backend
    if curl -s http://localhost:8000/health > /dev/null; then
        print_success "Backend is healthy"
    else
        print_error "Backend health check failed"
    fi
    
    # Check frontend
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Frontend is healthy"
    else
        print_error "Frontend health check failed"
    fi
}

# Display startup information
show_startup_info() {
    echo ""
    echo "🎉 Okapiq is now running!"
    echo "=================================================="
    echo ""
    echo "📊 Backend API:     http://localhost:8000"
    echo "📖 API Docs:        http://localhost:8000/docs"
    echo "🌐 Frontend:        http://localhost:3000"
    echo "📈 Health Check:    http://localhost:8000/health"
    echo ""
    echo "🔑 EtA Launch Hub Code: ETALAUNCH100"
    echo "📧 Support:         support@okapiq.com"
    echo ""
    echo "📚 Quick Start:"
    echo "   1. Open http://localhost:3000 in your browser"
    echo "   2. Try scanning a market (e.g., 'San Francisco')"
    echo "   3. Explore the three-product ecosystem"
    echo "   4. Check out the API documentation"
    echo ""
    echo "🛑 To stop the servers, press Ctrl+C"
    echo ""
}

# Cleanup function
cleanup() {
    print_status "Shutting down servers..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        print_success "Backend server stopped"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        print_success "Frontend server stopped"
    fi
    
    print_success "All servers stopped"
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup SIGINT

# Main execution
main() {
    echo "Starting Okapiq application stack..."
    echo ""
    
    # Check dependencies
    check_dependencies
    
    # Setup environments
    setup_python_env
    setup_node_env
    setup_env_files
    
    # Start servers
    start_backend
    sleep 3  # Give backend time to start
    
    start_frontend
    sleep 3  # Give frontend time to start
    
    # Run demo
    run_demo
    
    # Health check
    sleep 2
    health_check
    
    # Show startup information
    show_startup_info
    
    # Keep script running
    wait
}

# Run main function
main "$@" 