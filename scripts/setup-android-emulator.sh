#!/bin/bash

# Android Emulator Setup and Management Script
# This script handles starting/stopping emulators and preparing them for testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
EMULATOR_NAME="CyberPup_Test_Emulator"
EMULATOR_PORT="5554"
EXPO_GO_PACKAGE="host.exp.exponent"
WAIT_TIMEOUT=300 # 5 minutes

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

# Function to check if emulator is running
is_emulator_running() {
    adb devices | grep -q "$EMULATOR_PORT.*device"
}

# Function to wait for emulator to be ready
wait_for_emulator() {
    print_status "Waiting for emulator to be ready..."
    local timeout=$WAIT_TIMEOUT
    local elapsed=0
    
    while [ $elapsed -lt $timeout ]; do
        if adb shell getprop sys.boot_completed 2>/dev/null | grep -q "1"; then
            print_success "Emulator is ready!"
            return 0
        fi
        sleep 5
        elapsed=$((elapsed + 5))
        print_status "Still waiting... (${elapsed}s/${timeout}s)"
    done
    
    print_error "Emulator failed to start within ${timeout} seconds"
    return 1
}

# Function to install Expo Go
install_expo_go() {
    print_status "Installing Expo Go on emulator..."
    
    # Check if Expo Go is already installed
    if adb shell pm list packages | grep -q "$EXPO_GO_PACKAGE"; then
        print_success "Expo Go is already installed"
        return 0
    fi
    
    # Download and install Expo Go APK
    local expo_go_apk="/tmp/expo-go.apk"
    if [ ! -f "$expo_go_apk" ]; then
        print_status "Downloading Expo Go APK..."
        wget -q "https://d1ahtucjixef4r.cloudfront.net/Exponent-2.28.9.apk" -O "$expo_go_apk"
    fi
    
    adb install "$expo_go_apk"
    print_success "Expo Go installed successfully"
}

# Function to start emulator
start_emulator() {
    print_status "Starting Android emulator: $EMULATOR_NAME"
    
    # Kill any existing emulator instances
    pkill -f "emulator.*$EMULATOR_NAME" || true
    
    # Start emulator in background
    emulator -avd "$EMULATOR_NAME" -no-audio -no-window -gpu swiftshader_indirect &
    local emulator_pid=$!
    
    # Wait for emulator to be ready
    if wait_for_emulator; then
        print_success "Emulator started successfully (PID: $emulator_pid)"
        
        # Install Expo Go
        install_expo_go
        
        return 0
    else
        print_error "Failed to start emulator"
        kill $emulator_pid 2>/dev/null || true
        return 1
    fi
}

# Function to stop emulator
stop_emulator() {
    print_status "Stopping Android emulator..."
    
    # Kill emulator process
    pkill -f "emulator.*$EMULATOR_NAME" || true
    
    # Wait a moment for cleanup
    sleep 2
    
    print_success "Emulator stopped"
}

# Function to reset emulator
reset_emulator() {
    print_status "Resetting emulator..."
    stop_emulator
    sleep 3
    start_emulator
}

# Function to check emulator status
check_status() {
    if is_emulator_running; then
        print_success "Emulator is running"
        adb devices
    else
        print_warning "Emulator is not running"
    fi
}

# Main script logic
case "${1:-start}" in
    "start")
        if is_emulator_running; then
            print_warning "Emulator is already running"
        else
            start_emulator
        fi
        ;;
    "stop")
        stop_emulator
        ;;
    "restart")
        reset_emulator
        ;;
    "status")
        check_status
        ;;
    "install-expo")
        if is_emulator_running; then
            install_expo_go
        else
            print_error "Emulator is not running. Start it first with: $0 start"
            exit 1
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|install-expo}"
        echo ""
        echo "Commands:"
        echo "  start       - Start the Android emulator and install Expo Go"
        echo "  stop        - Stop the Android emulator"
        echo "  restart     - Restart the Android emulator"
        echo "  status      - Check emulator status"
        echo "  install-expo - Install Expo Go on running emulator"
        exit 1
        ;;
esac
