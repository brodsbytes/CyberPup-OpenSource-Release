# Native E2E Testing with Maestro

This document describes the comprehensive end-to-end testing setup for CyberPup using Maestro, a modern mobile testing framework that works seamlessly with Expo apps.

## 🎯 Current Status (Updated: September 4, 2025)

### ✅ COMPLETED
- **Android emulator setup**: CyberPup_Test_Emulator is configured and functional
- **APK build system**: Successfully built CyberPup APK (1h 22m build time)
- **App installation**: CyberPup app installed and launches on emulator
- **Infrastructure**: All automation scripts and documentation in place
- **Maestro installation**: Maestro is installed and can connect to emulator

### ⚠️ TEMPORARILY DISABLED
- **Maestro test scripts**: Tests are disabled (`maestro-tests-DISABLED`) due to configuration issues
- **Test execution**: Scripts need refinement before full testing can resume

### 🎯 Overview

CyberPup now uses **Maestro** for native e2e testing instead of web-based testing with Puppeteer. This allows us to catch iOS and Android-specific issues that don't appear in web testing, such as:

- **Error codes** and native API failures
- **Animation glitches** and performance issues
- **App crashes** and memory issues
- **Platform-specific UI behaviors**
- **Device-specific functionality**

## 🚨 IMPORTANT: Tests Currently Disabled

**The Maestro test scripts are currently disabled** (`maestro-tests-DISABLED`) to prevent accidental execution. The tests need configuration updates before they can be safely run.

### Why Disabled
- App selectors need refinement for current CyberPup UI
- Test assertions may need updates for current app state
- Some tests may reference outdated elements

### To Re-enable Testing
1. Rename `maestro-tests-DISABLED` back to `maestro-tests`
2. Review and update test configurations
3. Test individual scripts before running full suite
4. Update app selectors and assertions as needed

## 🚀 Quick Start

### Prerequisites
- Maestro installed (already done)
- Android SDK and emulator setup (automated)
- Java 17+ installed
- **Note**: Tests are currently disabled - see above

### Automated Testing (Recommended)
```bash
# Full automation - starts emulator, loads app, runs tests
npm run test:automated:smoke      # Quick smoke test
npm run test:automated:complete   # Full Level 1 test suite

# Emulator management
npm run emulator:start            # Start emulator
npm run emulator:stop             # Stop emulator
npm run emulator:restart          # Restart emulator
npm run emulator:status           # Check emulator status
```

### Manual Testing (Legacy)
```bash
# Quick smoke test (requires manual app loading)
npm run test:e2e:smoke

# Full Level 1 flow test
npm run test:e2e:complete

# All tests
npm run test:e2e:all

# Platform-specific tests
npm run test:e2e:ios
npm run test:e2e:android

# Category-specific tests
npm run test:e2e:password
npm run test:e2e:device
```

## 🖥️ Android Emulator Setup

### Automated Setup
The emulator setup is fully automated and includes:
- Android SDK command-line tools installation
- Android 34 system image with Google APIs
- Pixel 7 emulator configuration
- Expo Go installation
- Storage optimization

### Emulator Configuration
- **Name**: `CyberPup_Test_Emulator`
- **API Level**: Android 34
- **Architecture**: x86_64
- **RAM**: 2048MB
- **Graphics**: Software rendering (SwiftShader)

### Test Outputs and Debugging
Test results and debugging artifacts are automatically saved to:
```
test-results/
├── screenshots/          # Test screenshots
├── logs/                # Test logs
└── [test-name]-[timestamp]/  # Individual test artifacts
    ├── screenshots/     # Maestro screenshots
    ├── logs/           # Maestro logs
    └── hierarchy.xml   # UI hierarchy dumps
```

## 📁 Test Structure

### Test Files
All Maestro tests are located in `maestro-tests/`:

| File | Description | Coverage |
|------|-------------|----------|
| `01-welcome-flow.yaml` | App launch and welcome screen | Initial navigation |
| `02-device-audit-flow.yaml` | Device setup and configuration | Device management |
| `03-password-security-flow.yaml` | Password security checks (1-1-1 to 1-1-5) | Account protection |
| `04-device-security-flow.yaml` | Device security checks (1-2-1 to 1-2-5) | Device protection |
| `05-data-protection-flow.yaml` | Data backup checks (1-3-1 to 1-3-2) | Data safety |
| `06-scam-awareness-flow.yaml` | Scam awareness checks (1-4-1 to 1-4-2) | Fraud prevention |
| `07-privacy-protection-flow.yaml` | Privacy checks (1-5-1 to 1-5-2) | Privacy management |
| `08-complete-level1-flow.yaml` | Full Level 1 journey | End-to-end flow |

### Test Categories

#### 🔐 Password Security (5 checks)
- **1-1-1**: Create Strong Passwords
- **1-1-2**: Secure Your Most Important Accounts
- **1-1-3**: Set Up a Password Manager
- **1-1-4**: Add Extra Protection to Your Accounts
- **1-1-5**: Check if Your Data Was Compromised

#### 📱 Device Security (5 checks)
- **1-2-1**: Lock Your Device Automatically
- **1-2-2**: Protect Your Device if Lost
- **1-2-3**: Keep Your Device Updated
- **1-2-4**: Manage Your Wireless Connections
- **1-2-5**: Stay Safe When Charging

#### 💾 Data Protection (2 checks)
- **1-3-1**: Back Up Your Data to the Cloud
- **1-3-2**: Create Local Backups

#### 🎣 Scam Awareness (2 checks)
- **1-4-1**: Spot Scams Before They Happen
- **1-4-2**: Report Scams to Help Others

#### 🔒 Privacy Protection (2 checks)
- **1-5-1**: Be Smart About What You Share
- **1-5-2**: Control Who Sees Your Information

## 📱 Device Setup

### iOS Testing
1. Install Expo Go from App Store
2. Connect iPhone via USB or ensure same WiFi network
3. Run: `npm run test:e2e:ios`

### Android Testing
1. Install Expo Go from Play Store
2. Enable Developer Options and USB Debugging
3. Connect device via USB
4. Run: `npm run test:e2e:android`

### Finding Device IDs
```bash
# List available devices
maestro device list

# List iOS simulators
xcrun simctl list devices

# List Android devices
adb devices
```

## 🧪 Test Development

### Writing New Tests

Maestro tests are written in YAML format. Here's the basic structure:

```yaml
appId: host.exp.Exponent
---
# Test description
- launchApp
- assertVisible: "Element Text"
- tapOn: "Button Text"
- inputText: "test@example.com"
- assertVisible: "Expected Result"
```

### Test Commands

| Command | Description | Example |
|---------|-------------|---------|
| `launchApp` | Launch the app | `- launchApp` |
| `assertVisible` | Check element is visible | `- assertVisible: "Welcome"` |
| `tapOn` | Tap on element | `- tapOn: "Get Started"` |
| `inputText` | Enter text | `- inputText: "test@example.com"` |
| `assertNotVisible` | Check element is hidden | `- assertNotVisible: "Loading"` |
| `scroll` | Scroll in direction | `- scroll` |
| `waitForAnimationToEnd` | Wait for animations | `- waitForAnimationToEnd` |

### Best Practices

1. **Use descriptive test names** that explain what's being tested
2. **Include proper assertions** to verify expected outcomes
3. **Test both positive and negative scenarios**
4. **Use realistic test data** that won't cause issues
5. **Add wait times** for slow operations
6. **Group related tests** in logical test files

## 🔧 Configuration

### App ID
All tests use `host.exp.Exponent` as the app ID, which is the standard Expo Go app identifier.

### Test Data
- Email for breach check: `test@example.com`
- Device types: iPhone, Android, Mac, Windows
- All tests use realistic but safe test data

### Timeouts
- Default test timeout: 5 minutes per test
- Individual command timeout: 30 seconds
- Animation wait time: 2 seconds between tests

## 🚨 Troubleshooting

### Common Issues

#### App Not Found
```bash
# Make sure Expo Go is installed and running
# Check app ID in test files
# Verify device connection
maestro device list
```

#### Element Not Found
```bash
# Check element text matches exactly
# Verify app is on correct screen
# Add wait times for slow loading
- waitForAnimationToEnd
- assertVisible: "Element Text"
```

#### Test Timeout
```bash
# Increase timeout in test files
# Check device performance
# Verify network connectivity
```

### Debug Mode
```bash
# Run with verbose output
maestro test maestro-tests/01-welcome-flow.yaml --verbose

# Run single test with debug
maestro test maestro-tests/01-welcome-flow.yaml --debug
```

## 🔄 Continuous Testing

### Local Development Workflow
1. **Make code changes**
2. **Run smoke test**: `npm run test:e2e:smoke`
3. **Run relevant category test**: `npm run test:e2e:password`
4. **Run full suite before commits**: `npm run test:e2e:all`

### Test Maintenance
- Update element selectors when UI changes
- Add new tests for new features
- Remove obsolete tests
- Keep test data current

## 📊 Test Results

### Expected Coverage
- **Total Tests**: 8 test files
- **Coverage**: 100% of Level 1 checks
- **Categories**: All 5 security categories covered
- **Duration**: ~15-20 minutes for full suite

### Success Criteria
- ✅ All Level 1 checks complete successfully
- ✅ Device-specific content displays correctly
- ✅ Progress persists between app sessions
- ✅ Navigation flows work smoothly
- ✅ Error scenarios handled gracefully
- ✅ All UI patterns function correctly

## 🆚 Migration from Old Testing

### What Was Removed
- ❌ **Detox** configuration and tests
- ❌ **Puppeteer** web-based testing
- ❌ **Jest** test configuration
- ❌ **Old e2e directory** with web tests
- ❌ **Redundant test scripts**

### What Was Added
- ✅ **Maestro** native testing framework
- ✅ **Comprehensive test suite** for all Level 1 checks
- ✅ **Platform-specific testing** (iOS/Android)
- ✅ **Simplified test runner** with npm scripts
- ✅ **Better error detection** for native issues

## 📚 Resources

- [Maestro Documentation](https://maestro.mobile.dev/)
- [Expo Go App](https://expo.dev/client)
- [React Native Testing](https://reactnative.dev/docs/testing)
- [CyberPup Development Guide](./DEVELOPMENT_WORKFLOW.md)

## 🤝 Contributing

When adding new tests:
1. Follow the existing test structure
2. Use descriptive test names
3. Include proper assertions
4. Test both positive and negative scenarios
5. Update this documentation with new test information

---

**Happy Testing! 🐾**
