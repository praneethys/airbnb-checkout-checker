#!/bin/bash

# Airbnb Checkout Checker - One-Click Setup Script
# This script will install everything needed to run the application

set -e

# Colors for pretty output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "\n${BLUE}==>${NC} ${1}"
}

print_success() {
    echo -e "${GREEN}✓${NC} ${1}"
}

print_warning() {
    echo -e "${YELLOW}!${NC} ${1}"
}

print_error() {
    echo -e "${RED}✗${NC} ${1}"
}

# Header
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║       Airbnb Checkout Checker - Setup Script              ║"
echo "║       Photo-based property inspection tool                ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Detect OS
OS="unknown"
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    OS="windows"
fi

print_step "Detected operating system: $OS"

# Check for Homebrew (macOS) or apt (Linux)
install_package_manager_deps() {
    if [[ "$OS" == "macos" ]]; then
        if ! command -v brew &> /dev/null; then
            print_step "Installing Homebrew (package manager for macOS)..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            print_success "Homebrew installed"
        else
            print_success "Homebrew already installed"
        fi
    fi
}

# Check and install Python
install_python() {
    print_step "Checking Python installation..."

    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1,2)
        MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
        MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)

        if [[ $MAJOR -ge 3 ]] && [[ $MINOR -ge 11 ]]; then
            print_success "Python $PYTHON_VERSION found (required: 3.11+)"
            return
        fi
    fi

    print_warning "Python 3.11+ not found. Installing..."

    if [[ "$OS" == "macos" ]]; then
        brew install python@3.12
    elif [[ "$OS" == "linux" ]]; then
        sudo apt update
        sudo apt install -y python3.12 python3.12-venv python3-pip
    else
        print_error "Please install Python 3.11+ manually from https://python.org"
        exit 1
    fi

    print_success "Python installed"
}

# Check and install Node.js
install_node() {
    print_step "Checking Node.js installation..."

    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ $NODE_VERSION -ge 18 ]]; then
            print_success "Node.js v$(node --version | cut -d'v' -f2) found (required: 18+)"
            return
        fi
    fi

    print_warning "Node.js 18+ not found. Installing..."

    if [[ "$OS" == "macos" ]]; then
        brew install node
    elif [[ "$OS" == "linux" ]]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt install -y nodejs
    else
        print_error "Please install Node.js 18+ manually from https://nodejs.org"
        exit 1
    fi

    print_success "Node.js installed"
}

# Check and install Poetry
install_poetry() {
    print_step "Checking Poetry installation..."

    if command -v poetry &> /dev/null; then
        print_success "Poetry already installed"
        return
    fi

    print_warning "Poetry not found. Installing..."
    curl -sSL https://install.python-poetry.org | python3 -

    # Add to PATH for this session
    export PATH="$HOME/.local/bin:$PATH"

    print_success "Poetry installed"
}

# Check and install Ollama
install_ollama() {
    print_step "Checking Ollama installation..."

    if command -v ollama &> /dev/null; then
        print_success "Ollama already installed"
    else
        print_warning "Ollama not found. Installing..."

        if [[ "$OS" == "macos" ]]; then
            brew install ollama
        elif [[ "$OS" == "linux" ]]; then
            curl -fsSL https://ollama.com/install.sh | sh
        else
            print_error "Please install Ollama manually from https://ollama.com"
            exit 1
        fi

        print_success "Ollama installed"
    fi

    # Start Ollama service
    print_step "Starting Ollama service..."

    if [[ "$OS" == "macos" ]]; then
        # Check if Ollama is running
        if ! pgrep -x "ollama" > /dev/null; then
            ollama serve &>/dev/null &
            sleep 3
        fi
    elif [[ "$OS" == "linux" ]]; then
        if ! systemctl is-active --quiet ollama; then
            sudo systemctl start ollama || ollama serve &>/dev/null &
            sleep 3
        fi
    fi

    print_success "Ollama service running"

    # Download the vision model
    print_step "Downloading LLaVA vision model (this may take a few minutes)..."
    ollama pull llava
    print_success "LLaVA model ready"
}

# Setup backend
setup_backend() {
    print_step "Setting up backend..."

    cd backend

    # Install dependencies
    poetry install --no-interaction

    # Create .env if it doesn't exist
    if [[ ! -f .env ]]; then
        cp .env.example .env
        print_success "Created .env configuration file"
    else
        print_success ".env file already exists"
    fi

    cd ..
    print_success "Backend setup complete"
}

# Setup frontend
setup_frontend() {
    print_step "Setting up frontend..."

    cd frontend
    npm install
    cd ..

    print_success "Frontend setup complete"
}

# Main setup flow
main() {
    # Store the script's directory
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    cd "$SCRIPT_DIR"

    install_package_manager_deps
    install_python
    install_node
    install_poetry
    install_ollama
    setup_backend
    setup_frontend

    echo ""
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                  Setup Complete! 🎉                       ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo ""
    echo "To start the application, run:"
    echo ""
    echo -e "    ${GREEN}./run.sh${NC}"
    echo ""
    echo "Then open your browser to:"
    echo ""
    echo -e "    ${BLUE}http://localhost:5173${NC}"
    echo ""
    echo "For API documentation:"
    echo ""
    echo -e "    ${BLUE}http://localhost:8000/docs${NC}"
    echo ""
}

main
