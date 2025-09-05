# CyberPup Maestro E2E Tests

This directory contains comprehensive end-to-end tests for the CyberPup app using Maestro, a modern mobile testing framework that works seamlessly with Expo apps.

## 🎯 Overview

The Maestro test suite covers:
- **Complete Level 1 flow** through all 15 cybersecurity checks
- **Device audit functionality** with different device configurations
- **All security categories** (Password, Device, Data, Scam, Privacy)
- **Navigation flows** and progress tracking
- **Cross-platform testing** on both iOS and Android

## 📁 Test Files

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

## 🚀 Quick Start

### Prerequisites
- Maestro installed (already done)
- Expo Go app installed on your device
- Device connected via USB or on same network

### Running Tests

```bash
# Run all tests
maestro test maestro-tests/

# Run specific test
maestro test maestro-tests/01-welcome-flow.yaml

# Run with device selection
maestro test maestro-tests/ --device-id YOUR_DEVICE_ID

# Run with iOS simulator
maestro test maestro-tests/ --device-id "iPhone 15"

# Run with Android emulator
maestro test maestro-tests/ --device-id "Pixel_7_API_34"
```

### Test Commands

```bash
# Quick smoke test
maestro test maestro-tests/01-welcome-flow.yaml

# Full Level 1 flow test
maestro test maestro-tests/08-complete-level1-flow.yaml

# All password security tests
maestro test maestro-tests/03-password-security-flow.yaml

# All device security tests
maestro test maestro-tests/04-device-security-flow.yaml
```

## 📱 Device Setup

### iOS Testing
1. Install Expo Go from App Store
2. Connect iPhone via USB or ensure same WiFi network
3. Run: `maestro test maestro-tests/ --device-id "iPhone 15"`

### Android Testing
1. Install Expo Go from Play Store
2. Enable Developer Options and USB Debugging
3. Connect device via USB
4. Run: `maestro test maestro-tests/ --device-id "YOUR_DEVICE_ID"`

### Finding Device IDs
```bash
# List available devices
maestro device list

# List iOS simulators
xcrun simctl list devices

# List Android devices
adb devices
```

## 🧪 Test Structure

Each test file follows this pattern:
1. **Launch App** - Start the Expo Go app
2. **Navigate** - Move through the app screens
3. **Assert** - Verify UI elements are visible
4. **Interact** - Tap buttons, input text, etc.
5. **Verify** - Check expected outcomes

## 🔧 Configuration

### App ID
All tests use `host.exp.Exponent` as the app ID, which is the standard Expo Go app identifier.

### Test Data
- Email for breach check: `test@example.com`
- Device types: iPhone, Android, Mac, Windows
- All tests use realistic but safe test data

## 📊 Test Coverage

### Level 1 Security Categories
- ✅ **Password Security** (5 checks): Strong passwords, high-value accounts, password manager, MFA, breach check
- ✅ **Device Security** (5 checks): Screen lock, remote lock, updates, wireless, charging safety
- ✅ **Data Protection** (2 checks): Cloud backup, local backup
- ✅ **Scam Awareness** (2 checks): Scam recognition, scam reporting
- ✅ **Privacy Protection** (2 checks): Sharing awareness, privacy settings

### Test Scenarios
- ✅ App launch and welcome flow
- ✅ Device audit and configuration
- ✅ Individual check completion
- ✅ Progress tracking
- ✅ Navigation between screens
- ✅ Error handling and edge cases

## 🚨 Troubleshooting

### Common Issues

#### App Not Found
```bash
# Make sure Expo Go is installed and running
# Check app ID in test files
# Verify device connection
```

#### Element Not Found
```bash
# Check element text matches exactly
# Verify app is on correct screen
# Add wait times for slow loading
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
maestro test maestro-tests/ --verbose

# Run single test with debug
maestro test maestro-tests/01-welcome-flow.yaml --debug
```

## 🔄 Continuous Testing

### Local Development
```bash
# Run tests after code changes
maestro test maestro-tests/01-welcome-flow.yaml

# Run full suite before commits
maestro test maestro-tests/
```

### Test Maintenance
- Update element selectors when UI changes
- Add new tests for new features
- Remove obsolete tests
- Keep test data current

## 📚 Resources

- [Maestro Documentation](https://maestro.mobile.dev/)
- [Expo Go App](https://expo.dev/client)
- [React Native Testing](https://reactnative.dev/docs/testing)
- [CyberPup Development Guide](../docs/development/)

## 🤝 Contributing

When adding new tests:
1. Follow the existing test structure
2. Use descriptive test names
3. Include proper assertions
4. Test both positive and negative scenarios
5. Update this README with new test information

---

**Happy Testing! 🐾**
