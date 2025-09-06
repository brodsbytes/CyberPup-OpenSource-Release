#!/bin/bash

# CyberPup Debug Logging Scripts
# Provides filtered logcat commands for Android debugging

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# CyberPup app package name
APP_PACKAGE="com.anonymous.CyberPup"
EXPO_PACKAGE="host.exp.exponent"

# Function to print colored output
print_color() {
    echo -e "${2}${1}${NC}"
}

# Function to check if device is connected
check_device() {
    if ! adb devices | grep -q "device$"; then
        print_color "❌ No Android device connected. Please connect your device or start an emulator." $RED
        exit 1
    fi
}

# Function to show help
show_help() {
    print_color "🔍 CyberPup Debug Logging Scripts" $CYAN
    echo ""
    print_color "Usage: $0 [command]" $YELLOW
    echo ""
    print_color "Available commands:" $BLUE
    echo "  app-logs          - Show only CyberPup app logs"
    echo "  expo-logs         - Show only Expo Go logs"
    echo "  errors            - Show only error logs from both apps"
    echo "  warnings          - Show only warning logs from both apps"
    echo "  all-logs          - Show all logs from both apps"
    echo "  clear-logs        - Clear device logs"
    echo "  save-logs         - Save logs to file"
    echo "  follow-logs       - Follow logs in real-time (CyberPup only)"
    echo "  performance       - Show performance-related logs"
    echo "  network           - Show network-related logs"
    echo "  storage           - Show storage-related logs"
    echo "  navigation        - Show navigation-related logs"
    echo "  help              - Show this help message"
    echo ""
    print_color "Examples:" $GREEN
    echo "  $0 app-logs"
    echo "  $0 errors"
    echo "  $0 follow-logs"
    echo "  $0 save-logs"
}

# Function to show CyberPup app logs only
show_app_logs() {
    print_color "📱 Showing CyberPup app logs..." $CYAN
    adb logcat | grep -E "($APP_PACKAGE|CyberPup|cyberpup)"
}

# Function to show Expo Go logs only
show_expo_logs() {
    print_color "📱 Showing Expo Go logs..." $CYAN
    adb logcat | grep -E "($EXPO_PACKAGE|Expo|expo)"
}

# Function to show error logs
show_errors() {
    print_color "❌ Showing error logs..." $RED
    adb logcat | grep -E "(E/|ERROR|Error|error)" | grep -E "($APP_PACKAGE|$EXPO_PACKAGE|CyberPup|Expo)"
}

# Function to show warning logs
show_warnings() {
    print_color "⚠️  Showing warning logs..." $YELLOW
    adb logcat | grep -E "(W/|WARN|Warning|warning)" | grep -E "($APP_PACKAGE|$EXPO_PACKAGE|CyberPup|Expo)"
}

# Function to show all logs from both apps
show_all_logs() {
    print_color "📋 Showing all logs from CyberPup and Expo..." $BLUE
    adb logcat | grep -E "($APP_PACKAGE|$EXPO_PACKAGE|CyberPup|Expo|cyberpup|expo)"
}

# Function to clear device logs
clear_logs() {
    print_color "🧹 Clearing device logs..." $PURPLE
    adb logcat -c
    print_color "✅ Logs cleared!" $GREEN
}

# Function to save logs to file
save_logs() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local filename="cyberpup_logs_${timestamp}.txt"
    
    print_color "💾 Saving logs to $filename..." $PURPLE
    print_color "Press Ctrl+C to stop logging and save the file" $YELLOW
    
    adb logcat | grep -E "($APP_PACKAGE|$EXPO_PACKAGE|CyberPup|Expo|cyberpup|expo)" > "$filename"
    
    print_color "✅ Logs saved to $filename" $GREEN
}

# Function to follow logs in real-time (CyberPup only)
follow_logs() {
    print_color "👀 Following CyberPup logs in real-time..." $CYAN
    print_color "Press Ctrl+C to stop" $YELLOW
    adb logcat | grep -E "($APP_PACKAGE|CyberPup|cyberpup)"
}

# Function to show performance logs
show_performance() {
    print_color "⚡ Showing performance-related logs..." $GREEN
    adb logcat | grep -E "(Performance|performance|FPS|fps|Memory|memory|CPU|cpu|GPU|gpu)" | grep -E "($APP_PACKAGE|$EXPO_PACKAGE|CyberPup|Expo)"
}

# Function to show network logs
show_network() {
    print_color "🌐 Showing network-related logs..." $BLUE
    adb logcat | grep -E "(Network|network|HTTP|http|API|api|Request|request|Response|response)" | grep -E "($APP_PACKAGE|$EXPO_PACKAGE|CyberPup|Expo)"
}

# Function to show storage logs
show_storage() {
    print_color "💾 Showing storage-related logs..." $PURPLE
    adb logcat | grep -E "(Storage|storage|AsyncStorage|AsyncStorage|Database|database|SQLite|sqlite)" | grep -E "($APP_PACKAGE|$EXPO_PACKAGE|CyberPup|Expo)"
}

# Function to show navigation logs
show_navigation() {
    print_color "🧭 Showing navigation-related logs..." $CYAN
    adb logcat | grep -E "(Navigation|navigation|Route|route|Screen|screen|Stack|stack)" | grep -E "($APP_PACKAGE|$EXPO_PACKAGE|CyberPup|Expo)"
}

# Main script logic
case "$1" in
    "app-logs")
        check_device
        show_app_logs
        ;;
    "expo-logs")
        check_device
        show_expo_logs
        ;;
    "errors")
        check_device
        show_errors
        ;;
    "warnings")
        check_device
        show_warnings
        ;;
    "all-logs")
        check_device
        show_all_logs
        ;;
    "clear-logs")
        check_device
        clear_logs
        ;;
    "save-logs")
        check_device
        save_logs
        ;;
    "follow-logs")
        check_device
        follow_logs
        ;;
    "performance")
        check_device
        show_performance
        ;;
    "network")
        check_device
        show_network
        ;;
    "storage")
        check_device
        show_storage
        ;;
    "navigation")
        check_device
        show_navigation
        ;;
    "help"|"-h"|"--help"|"")
        show_help
        ;;
    *)
        print_color "❌ Unknown command: $1" $RED
        echo ""
        show_help
        exit 1
        ;;
esac
