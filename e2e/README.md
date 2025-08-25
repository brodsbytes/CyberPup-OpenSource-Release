# CyberPup E2E Testing with Detox

This directory contains comprehensive end-to-end tests for the CyberPup app using Detox.

## 🎯 Overview

The E2E test suite covers:
- **Complete Level 1 flow** through all 15 cybersecurity checks
- **Device audit functionality** with different device configurations
- **All UI patterns** (Pattern A, B, C, Wizard, Timeline, Checklist variants)
- **Multi-device scenarios** (single device, multiple devices, cross-platform)
- **Progress persistence** and navigation flows
- **Error handling** and edge cases

## 📁 File Structure

```
e2e/
├── config.json              # Jest configuration for Detox
├── init.js                   # Detox initialization
├── helpers/
│   ├── deviceSetup.js        # Device configuration helpers
│   └── checkFlowHelper.js    # Check completion helpers
├── tests/
│   ├── level1-complete-flow.test.js  # Main Level 1 flow tests
│   └── device-audit.test.js          # Device audit tests
├── screenshots/              # Test screenshots
├── README.md                # This file
└── MOBILE_TESTING_GUIDE.md  # Mobile viewport testing guide
```

## 🚀 Quick Start

### Prerequisites
- Node.js and npm installed
- Expo CLI: `npm install -g expo-cli`
- Puppeteer: `npm install --save-dev puppeteer`

### Running Tests

```bash
# 🎯 QUICK TEST - iPhone viewport (most common)
npm run test:e2e:level1:iphone

# 📱 MOBILE TESTING - Different device sizes
npm run test:e2e:level1:android     # Android viewport
npm run test:e2e:level1:small       # iPhone SE viewport
npm run test:e2e:level1:tablet      # iPad viewport

# 🔄 INTERACTIVE TESTING - Browser-based tests
npm run test:e2e:interactive:iphone
npm run test:e2e:interactive:android

# 🧪 BASIC TESTING - Simple test runner
npm run test:e2e:custom

# 📱 MOBILE TESTING GUIDE
# See: e2e/MOBILE_TESTING_GUIDE.md for detailed mobile testing instructions
```

### Quick Commands Reference

| Command | Description | Viewport |
|---------|-------------|----------|
| `npm run test:e2e:level1:iphone` | **Recommended** - iPhone testing | 375x812 |
| `npm run test:e2e:level1:android` | Android phone testing | 360x800 |
| `npm run test:e2e:level1:small` | Small device testing | 320x568 |
| `npm run test:e2e:level1:tablet` | Tablet testing | 768x1024 |

### What Each Test Does
- **Opens browser** with mobile viewport
- **Starts Expo server** automatically
- **Navigates through app** screens
- **Takes screenshots** for verification
- **Tests interactions** and navigation
- **Cleans up** automatically when done

## 🧪 Test Configurations

### Device Configurations

The test suite includes 7 different device configurations:

#### Single Device Configurations
- **SINGLE_IPHONE**: iPhone 15 Pro
- **SINGLE_ANDROID**: Samsung Galaxy S24
- **SINGLE_MAC**: MacBook Air M3
- **SINGLE_WINDOWS**: Windows 11 Pro

#### Multi-Device Configurations
- **MULTI_MOBILE**: iPhone + Android
- **MULTI_PLATFORM**: iPhone + Mac
- **COMPLEX_SETUP**: iPhone + Android + Mac + Windows

### Check Patterns Tested

The test suite covers all 6 UI patterns in your Level 1 implementation:

1. **Pattern A Enhanced** (3 checks): Strong Passwords, Public Charging, Sharing Awareness
2. **Pattern B** (4 checks): Password Managers, MFA Setup, Screen Lock, Cloud Backup
3. **Pattern C** (2 checks): Breach Check, Scam Recognition
4. **Wizard Variant** (3 checks): Remote Lock, Device Updates, Bluetooth/WiFi
5. **Timeline Variant** (2 checks): High Value Accounts, Privacy Settings
6. **Checklist Variant** (2 checks): Local Backup, Scam Reporting

## 📋 Test Coverage

### Level 1 Complete Flow Tests
- ✅ Complete navigation through all 15 Level 1 checks
- ✅ Proper completion of each check pattern
- ✅ Progress persistence between screens
- ✅ Device-specific content verification
- ✅ Navigation flow validation
- ✅ Completion celebrations and transitions

### Device Audit Tests
- ✅ Single device setup (iOS, Android, Mac, Windows)
- ✅ Multi-device setup (mobile, cross-platform, complex)
- ✅ Device addition and removal
- ✅ Device-specific content display
- ✅ Collapsible device sections
- ✅ Audit completion flow

### Individual Pattern Tests
- ✅ Pattern A Enhanced completion
- ✅ Pattern B completion
- ✅ Pattern C completion
- ✅ Wizard Variant completion
- ✅ Timeline Variant completion
- ✅ Checklist Variant completion

### Error Handling Tests
- ✅ Network error handling
- ✅ Storage error handling
- ✅ Graceful degradation

## 🔧 Configuration

### Detox Configuration (`.detoxrc.js`)
```javascript
module.exports = {
  testRunner: {
    args: {
      '$0': 'jest',
      config: 'e2e/jest.config.js'
    },
    jest: {
      setupTimeout: 120000
    }
  },
  apps: {
    'expo.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/CyberPup.app',
      build: 'expo start --dev-client',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15',
        os: '17.0',
      },
    },
  },
  configurations: {
    'expo.debug': {
      device: 'simulator',
      app: 'expo.debug',
    },
  },
};
```

### Jest Configuration (`e2e/jest.config.js`)
```javascript
module.exports = {
  setupFilesAfterEnv: ["./init.js"],
  testEnvironment: "node",
  testRunner: "jest-circus/runner",
  testTimeout: 120000,
  reporters: ["detox/runners/jest/streamlineReporter"],
  verbose: true,
  testMatch: ["**/*.test.js"],
  testPathIgnorePatterns: ["node_modules"],
};
```

## 🎯 Test Scenarios

### Complete Level 1 Flow
1. **Device Audit**: Set up device configuration
2. **Welcome Screen**: Navigate to Level 1
3. **Check Progression**: Complete all 15 checks in order
4. **Pattern Handling**: Handle each UI pattern correctly
5. **Progress Tracking**: Verify progress persistence
6. **Completion**: Verify Level 1 completion

### Device-Specific Testing
1. **Single Device**: Test with one device type
2. **Multi-Device**: Test with multiple devices
3. **Cross-Platform**: Test with different platforms
4. **Content Verification**: Verify device-specific content
5. **Action Completion**: Complete device-specific actions

### Error Scenarios
1. **Network Issues**: Handle network failures
2. **Storage Issues**: Handle storage problems
3. **Navigation Issues**: Handle navigation errors
4. **Device Detection**: Handle device detection failures

## 🚨 Troubleshooting

### Common Issues

#### Tests Fail to Start
```bash
# Clean up and rebuild
npm run cleanup
npm run test:e2e:level1:iphone
```

#### Element Not Found
- Check accessibility labels in your components
- Verify element IDs and test IDs
- Use `device.takeScreenshot()` for debugging

#### Timeout Issues
- Increase timeout in `e2e/config.json`
- Add more wait time between actions
- Check for slow animations or loading states

#### Platform-Specific Issues
- Test on both iOS and Android
- Check platform-specific element selectors
- Verify platform-specific functionality

### Debugging Tips

1. **Take Screenshots**: Use `device.takeScreenshot()` to debug UI issues
2. **Console Logs**: Check console output for detailed test progress
3. **Element Inspection**: Use Detox Inspector for element debugging
4. **Step-by-Step**: Run individual test cases to isolate issues

## 📊 Test Results

### Expected Test Results
- **Total Tests**: ~50+ test cases
- **Coverage**: 100% of Level 1 checks
- **Patterns**: All 6 UI patterns covered
- **Devices**: 7 device configurations tested
- **Duration**: ~10-15 minutes for full suite

### Success Criteria
- ✅ All Level 1 checks complete successfully
- ✅ Device-specific content displays correctly
- ✅ Progress persists between app sessions
- ✅ Navigation flows work smoothly
- ✅ Error scenarios handled gracefully
- ✅ All UI patterns function correctly

## 🔄 Continuous Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run iPhone tests
        run: npm run test:e2e:level1:iphone
      - name: Run Android tests
        run: npm run test:e2e:level1:android
      - name: Run Small device tests
        run: npm run test:e2e:level1:small
```

## 📚 Additional Resources

- [Detox Documentation](https://wix.github.io/Detox/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing](https://reactnative.dev/docs/testing)
- [CyberPup Development Guide](../docs/development/DEVELOPMENT_WORKFLOW.md)
- [Mobile Testing Guide](./MOBILE_TESTING_GUIDE.md)

## 🤝 Contributing

When adding new tests:
1. Follow the existing test structure
2. Add appropriate device configurations
3. Include error handling scenarios
4. Update this README with new test information
5. Ensure tests pass on both iOS and Android

---

**Happy Testing! 🐾**
