# 🔍 CyberPup Debugging Guide

**Last Updated**: September 5, 2025

## Overview

This guide provides comprehensive debugging tools and techniques for troubleshooting CyberPup during development and testing phases. The debugging system includes structured logging, filtered logcat commands, and real-time monitoring capabilities.

## 🚀 Quick Start

### 1. Basic Debug Commands

```bash
# Show only CyberPup app logs
npm run debug:app-logs

# Show only errors
npm run debug:errors

# Follow logs in real-time
npm run debug:follow

# Save logs to file
npm run debug:save
```

### 2. Available Debug Scripts

| Command | Description |
|---------|-------------|
| `npm run debug:logs` | Show help for all debug commands |
| `npm run debug:app-logs` | Show only CyberPup app logs |
| `npm run debug:expo-logs` | Show only Expo Go logs |
| `npm run debug:errors` | Show only error logs |
| `npm run debug:warnings` | Show only warning logs |
| `npm run debug:follow` | Follow logs in real-time |
| `npm run debug:save` | Save logs to timestamped file |
| `npm run debug:clear` | Clear device logs |
| `npm run debug:performance` | Show performance-related logs |
| `npm run debug:network` | Show network-related logs |
| `npm run debug:storage` | Show storage-related logs |
| `npm run debug:navigation` | Show navigation-related logs |

## 📱 Device Setup

### Prerequisites

1. **Android Device/Emulator**: Connect your Android device via USB or start an emulator
2. **ADB**: Ensure Android Debug Bridge is installed and working
3. **Expo Go**: Install Expo Go app on your device

### Verify Connection

```bash
# Check if device is connected
adb devices

# Should show something like:
# List of devices attached
# emulator-5554   device
```

## 🔧 Advanced Debugging

### 1. Structured Logging

The app now uses a centralized logging system with categories and levels:

```javascript
import { cyberPupLogger, LOG_CATEGORIES } from './utils/logger';

// Log levels: error, warn, info, debug, trace
// Categories: navigation, storage, api, validation, gamification, security, performance, ui, general

cyberPupLogger.error(LOG_CATEGORIES.STORAGE, 'Failed to save data', { error: error.message });
cyberPupLogger.info(LOG_CATEGORIES.NAVIGATION, 'User navigated to screen', { screen: 'WelcomeScreen' });
cyberPupLogger.debug(LOG_CATEGORIES.API, 'API request started', { url: '/api/breach-check' });
```

### 2. Log Categories

| Category | Description | Use Cases |
|----------|-------------|-----------|
| `navigation` | Screen transitions, routing | Navigation issues, deep linking |
| `storage` | AsyncStorage operations | Data persistence problems |
| `api` | Network requests, API calls | API failures, network issues |
| `validation` | Form validation, user input | Validation logic debugging |
| `gamification` | Badges, scores, progress | Gamification system issues |
| `security` | Security features, alerts | Security-related debugging |
| `performance` | Performance metrics, timing | Performance optimization |
| `ui` | UI interactions, animations | UI/UX debugging |
| `general` | General app events | General debugging |

### 3. Log Levels

| Level | Description | When to Use |
|-------|-------------|-------------|
| `error` | Critical errors that break functionality | Crashes, API failures, storage errors |
| `warn` | Warnings that don't break functionality | Deprecated features, fallbacks |
| `info` | Important app events | User actions, state changes |
| `debug` | Detailed debugging information | Function calls, data flow |
| `trace` | Most verbose logging | Variable values, detailed execution |

## 🎯 Common Debugging Scenarios

### 1. App Crashes

```bash
# Check for crash logs
npm run debug:errors

# Look for patterns like:
# E/AndroidRuntime: FATAL EXCEPTION
# E/ReactNativeJS: TypeError: Cannot read property
```

### 2. Navigation Issues

```bash
# Monitor navigation events
npm run debug:navigation

# Look for:
# [NAVIGATION] User navigated to screen
# [NAVIGATION] Navigation state changed
```

### 3. Storage Problems

```bash
# Monitor storage operations
npm run debug:storage

# Look for:
# [STORAGE] Failed to save data
# [STORAGE] AsyncStorage operation completed
```

### 4. Network/API Issues

```bash
# Monitor network activity
npm run debug:network

# Look for:
# [API] Request failed
# [API] Response received
```

### 5. Performance Issues

```bash
# Monitor performance
npm run debug:performance

# Look for:
# Performance metrics
# Memory usage
# CPU usage
```

## 📊 Log Analysis

### 1. Real-time Monitoring

```bash
# Follow logs in real-time while testing
npm run debug:follow

# In another terminal, run your app
npm start
```

### 2. Save Logs for Analysis

```bash
# Save logs to file for later analysis
npm run debug:save

# This creates a file like: cyberpup_logs_20250905_143022.txt
```

### 3. Filter Specific Issues

```bash
# Only show errors from CyberPup
adb logcat | grep -E "(E/|ERROR)" | grep "CyberPup"

# Only show warnings
adb logcat | grep -E "(W/|WARN)" | grep "CyberPup"

# Show logs with specific text
adb logcat | grep "breach check"
```

## 🛠️ Troubleshooting

### Common Issues

1. **No logs appearing**
   - Ensure device is connected: `adb devices`
   - Check if app is running on device
   - Try clearing logs: `npm run debug:clear`

2. **Too many logs**
   - Use specific filters: `npm run debug:errors`
   - Use category-specific commands: `npm run debug:storage`

3. **Logs not saving**
   - Check file permissions in project directory
   - Ensure sufficient disk space

4. **Performance impact**
   - Logging is automatically disabled in production builds
   - Use appropriate log levels (avoid `trace` in production)

### Debug Script Issues

If debug scripts don't work:

```bash
# Make script executable
chmod +x scripts/debug-logs.sh

# Test script directly
./scripts/debug-logs.sh help

# Check ADB installation
which adb
adb version
```

## 📝 Best Practices

### 1. Logging Guidelines

- **Use appropriate levels**: Don't log everything as `error`
- **Include context**: Add relevant data to log entries
- **Be descriptive**: Use clear, actionable log messages
- **Avoid sensitive data**: Don't log passwords, tokens, or personal info

### 2. Debugging Workflow

1. **Reproduce the issue** while monitoring logs
2. **Use specific filters** to narrow down the problem
3. **Save logs** for detailed analysis
4. **Add targeted logging** to problematic areas
5. **Test fixes** while monitoring logs

### 3. Performance Considerations

- Logging has minimal performance impact in development
- Production builds automatically disable verbose logging
- Use `debug` and `trace` levels sparingly
- Consider using `info` level for important events

## 🔗 Related Documentation

- [Development Workflow](./DEVELOPMENT_WORKFLOW.md)
- [Architecture Reference](../architecture/ARCHITECTURE_REFERENCE.md)
- [E2E Testing Status](../../E2E_TESTING_STATUS.md)

## 📞 Support

If you encounter issues with the debugging system:

1. Check this guide first
2. Verify device connection and ADB setup
3. Try the troubleshooting steps above
4. Check the project's issue tracker
5. Contact the development team

---

**Happy Debugging! 🐛➡️✅**
