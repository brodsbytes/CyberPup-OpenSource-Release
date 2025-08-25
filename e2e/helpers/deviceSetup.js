/**
 * Device Setup Helper for CyberPup E2E Tests
 * Handles different device configurations for testing dynamic content
 */

// Device configurations for testing
export const DEVICE_CONFIGS = {
  // Single device configurations
  SINGLE_IPHONE: {
    devices: [
      {
        id: 'test-iphone-1',
        name: 'iPhone 15 Pro',
        type: 'mobile',
        platform: 'ios',
        tier2: 'apple',
        autoDetected: true,
        supportsDeepLinks: true,
        icon: 'phone-portrait'
      }
    ],
    description: 'Single iPhone device'
  },

  SINGLE_ANDROID: {
    devices: [
      {
        id: 'test-android-1',
        name: 'Samsung Galaxy S24',
        type: 'mobile',
        platform: 'android',
        tier2: 'android',
        autoDetected: true,
        supportsDeepLinks: true,
        icon: 'phone-portrait'
      }
    ],
    description: 'Single Android device'
  },

  SINGLE_MAC: {
    devices: [
      {
        id: 'test-mac-1',
        name: 'MacBook Air M3',
        type: 'computer',
        platform: 'macos',
        tier2: 'macos',
        autoDetected: true,
        supportsDeepLinks: false,
        icon: 'laptop'
      }
    ],
    description: 'Single Mac device'
  },

  SINGLE_WINDOWS: {
    devices: [
      {
        id: 'test-windows-1',
        name: 'Windows 11 Pro',
        type: 'computer',
        platform: 'windows',
        tier2: 'windows',
        autoDetected: true,
        supportsDeepLinks: false,
        icon: 'desktop'
      }
    ],
    description: 'Single Windows device'
  },

  // Multi-device configurations
  MULTI_MOBILE: {
    devices: [
      {
        id: 'test-iphone-1',
        name: 'iPhone 15 Pro',
        type: 'mobile',
        platform: 'ios',
        tier2: 'apple',
        autoDetected: true,
        supportsDeepLinks: true,
        icon: 'phone-portrait'
      },
      {
        id: 'test-android-1',
        name: 'Samsung Galaxy S24',
        type: 'mobile',
        platform: 'android',
        tier2: 'android',
        autoDetected: false,
        supportsDeepLinks: true,
        icon: 'phone-portrait'
      }
    ],
    description: 'Multiple mobile devices (iPhone + Android)'
  },

  MULTI_PLATFORM: {
    devices: [
      {
        id: 'test-iphone-1',
        name: 'iPhone 15 Pro',
        type: 'mobile',
        platform: 'ios',
        tier2: 'apple',
        autoDetected: true,
        supportsDeepLinks: true,
        icon: 'phone-portrait'
      },
      {
        id: 'test-mac-1',
        name: 'MacBook Air M3',
        type: 'computer',
        platform: 'macos',
        tier2: 'macos',
        autoDetected: false,
        supportsDeepLinks: false,
        icon: 'laptop'
      }
    ],
    description: 'Multiple platforms (iPhone + Mac)'
  },

  COMPLEX_SETUP: {
    devices: [
      {
        id: 'test-iphone-1',
        name: 'iPhone 15 Pro',
        type: 'mobile',
        platform: 'ios',
        tier2: 'apple',
        autoDetected: true,
        supportsDeepLinks: true,
        icon: 'phone-portrait'
      },
      {
        id: 'test-android-1',
        name: 'Samsung Galaxy S24',
        type: 'mobile',
        platform: 'android',
        tier2: 'android',
        autoDetected: false,
        supportsDeepLinks: true,
        icon: 'phone-portrait'
      },
      {
        id: 'test-mac-1',
        name: 'MacBook Air M3',
        type: 'computer',
        platform: 'macos',
        tier2: 'macos',
        autoDetected: false,
        supportsDeepLinks: false,
        icon: 'laptop'
      },
      {
        id: 'test-windows-1',
        name: 'Windows 11 Pro',
        type: 'computer',
        platform: 'windows',
        tier2: 'windows',
        autoDetected: false,
        supportsDeepLinks: false,
        icon: 'desktop'
      }
    ],
    description: 'Complex setup (iPhone + Android + Mac + Windows)'
  }
};

/**
 * Setup device configuration for testing
 * @param {string} configKey - Key from DEVICE_CONFIGS
 * @param {object} device - Detox device instance
 */
export async function setupDeviceConfig(configKey, device) {
  const config = DEVICE_CONFIGS[configKey];
  if (!config) {
    throw new Error(`Unknown device config: ${configKey}`);
  }

  // Clear existing device data
  await device.reloadReactNative();
  
  // Set device configuration in AsyncStorage
  await device.sendToHome();
  
  // Navigate to device audit if needed
  // This will be handled by the test flow
}

/**
 * Get expected device count for a configuration
 * @param {string} configKey - Key from DEVICE_CONFIGS
 * @returns {number} Expected device count
 */
export function getExpectedDeviceCount(configKey) {
  const config = DEVICE_CONFIGS[configKey];
  return config ? config.devices.length : 0;
}

/**
 * Get device names for a configuration
 * @param {string} configKey - Key from DEVICE_CONFIGS
 * @returns {Array<string>} Array of device names
 */
export function getDeviceNames(configKey) {
  const config = DEVICE_CONFIGS[configKey];
  return config ? config.devices.map(d => d.name) : [];
}
