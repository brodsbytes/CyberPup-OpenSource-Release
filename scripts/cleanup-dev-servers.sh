#!/bin/bash

# Cleanup script for development servers
# Kills any running npm, expo, or node development processes

echo "🧹 Cleaning up development servers..."

# Kill npm start processes
echo "Stopping npm start processes..."
pkill -f "npm start" 2>/dev/null || echo "No npm start processes found"

# Kill expo start processes
echo "Stopping expo start processes..."
pkill -f "expo start" 2>/dev/null || echo "No expo start processes found"

# Kill node expo processes
echo "Stopping node expo processes..."
pkill -f "node.*expo" 2>/dev/null || echo "No node expo processes found"

# Kill jest-worker processes (TypeScript/JS workers)
echo "Stopping jest-worker processes..."
pkill -f "jest-worker" 2>/dev/null || echo "No jest-worker processes found"

# Kill any remaining node processes in the project directory
echo "Stopping any remaining node processes in project..."
pkill -f "node.*CyberPup" 2>/dev/null || echo "No project node processes found"

# Check if any processes are still running
echo "Checking for remaining processes..."
REMAINING=$(ps aux | grep -E "(expo|npm.*start|node.*expo)" | grep -v grep | wc -l)

if [ "$REMAINING" -eq 0 ]; then
    echo "✅ All development servers cleaned up successfully!"
else
    echo "⚠️  $REMAINING processes may still be running"
    ps aux | grep -E "(expo|npm.*start|node.*expo)" | grep -v grep
fi

echo "🧹 Cleanup complete!"
