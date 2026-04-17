// Device Capabilities Detection System
// Provides platform and device-specific capability detection for CyberPup checks

import { Platform, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class DeviceCapabilities {
  /**
   * Get user's registered devices from storage
   * @returns {Promise<Array>} Array of user devices
   */
  static async getUserDevices() {
    try {
      const savedDevices = await AsyncStorage.getItem('user_devices');
      if (savedDevices) {
        try {
          return JSON.parse(savedDevices);
        } catch (parseError) {
          console.log('Error parsing user devices JSON:', parseError);
          return [];
        }
      }
      return [];
    } catch (error) {
      console.log('Error loading user devices:', error);
      return [];
    }
  }

  /**
   * Get user devices with smart deduplication to prevent current device duplicates
   * @returns {Promise<Array>} Array of user devices with current device included if not already present
   */
  static async getUserDevicesWithCurrentDevice() {
    try {
      const devices = await this.getUserDevices();
      const currentDevice = this.getCurrentDevice();
      
      
      // Smart deduplication logic
      const hasCurrentDevice = devices.some(device => {
        // For mobile devices, check if it's the same type (Android Phone, iPhone, etc.)
        if (currentDevice.platform === 'ios' || currentDevice.platform === 'android') {
          const isMobileDevice = device.type === 'mobile';
          const isSameDeviceName = device.name === currentDevice.type;
          
          // If device has platform field, check it matches
          if (device.platform) {
            return device.platform === currentDevice.platform && isMobileDevice && isSameDeviceName;
          }
          
          // If device doesn't have platform field (from DeviceAuditScreen), 
          // just check name and type match
          return isMobileDevice && isSameDeviceName;
        }
        
        // For computers, check platform and type
        if (device.platform) {
          return device.platform === currentDevice.platform && device.type === 'computer';
        }
        return device.type === 'computer' && device.name === currentDevice.type;
      });
      
      // Ensure all devices have the supportsDeepLinks property
      let allDevices = devices.map(device => ({
        ...device,
        supportsDeepLinks: device.supportsDeepLinks ?? true // Default to true if not set
      }));
      
      if (!hasCurrentDevice) {
        // Add current device if not already present
        allDevices.unshift({
          id: 'current-device',
          name: currentDevice.type,
          type: currentDevice.platform === 'ios' || currentDevice.platform === 'android' ? 'mobile' : 'computer',
          platform: currentDevice.platform,
          tier2: currentDevice.platform,
          autoDetected: true,
          supportsDeepLinks: currentDevice.supportsDeepLinks,
          icon: this.getDeviceIcon(currentDevice)
        });
      }
      return allDevices;
    } catch (error) {
      console.log('Error getting user devices with current device:', error);
      return [];
    }
  }

  /**
   * Detect current device platform and capabilities
   * @returns {Object} Current device information
   */
  static getCurrentDevice() {
    const { width, height } = Dimensions.get('window');
    const isTablet = Math.min(width, height) >= 768;
    
    let deviceInfo = {
      platform: Platform.OS,
      isTablet,
      screenWidth: width,
      screenHeight: height,
      version: Platform.Version
    };

    if (Platform.OS === 'ios') {
      deviceInfo.type = isTablet ? 'iPad' : 'iPhone';
      deviceInfo.supportsDeepLinks = true;
      deviceInfo.settingsUrl = 'App-Prefs:';
    } else if (Platform.OS === 'android') {
      deviceInfo.type = isTablet ? 'Android Tablet' : 'Android Phone';
      deviceInfo.supportsDeepLinks = true;
      deviceInfo.settingsUrl = 'android.settings';
    } else {
      deviceInfo.type = 'Computer';
      deviceInfo.supportsDeepLinks = false;
      deviceInfo.settingsUrl = null;
    }

    return deviceInfo;
  }

  /**
   * Get appropriate icon for a device
   * @param {Object} device - Device information
   * @returns {string} Icon name
   */
  static getDeviceIcon(device) {
    const platform = device.platform || device.tier2;
    const type = device.type;
    
    if (type === 'mobile') {
      return platform === 'ios' ? 'phone-portrait' : 'phone-portrait';
    } else if (type === 'computer') {
      return platform === 'macos' ? 'laptop' : 'desktop';
    }
    
    return 'desktop';
  }

  /**
   * Get device-specific content matrix for checks
   * @returns {Object} Device content configuration
   */
  static getDeviceContentMatrix() {
    return {
      'screen-lock': {
        ios: {
          deepLink: 'App-Prefs:PASSCODE',
          steps: [
            'Open Settings',
            'Tap Face ID & Passcode (or Touch ID & Passcode)',
            'Set Auto-Lock to 1 minute or less'
          ],
          verification: 'screenshot',
          priority: 'high'
        },
        android: {
          deepLink: 'android.settings.SECURITY_SETTINGS',
          steps: [
            'Open Settings',
            'Tap Security & Privacy',
            'Tap Screen Lock',
            'Choose PIN, Password, Pattern, or Biometric'
          ],
          verification: 'screenshot',
          priority: 'high'
        },
        windows: {
          deepLink: null,
          steps: [
            'Open Settings',
            'Go to Accounts',
            'Click Sign-in options',
            'Set up Windows Hello or PIN'
          ],
          verification: 'manual',
          priority: 'medium'
        },
        macos: {
          deepLink: null,
          steps: [
            'Open System Preferences',
            'Click Security & Privacy',
            'Set require password time to "immediately"'
          ],
          verification: 'manual',
          priority: 'medium'
        }
      },
      'password-manager': {
        ios: {
          deepLink: 'itms-apps://itunes.apple.com/app/id1136318669', // 1Password example
          apps: [
            { name: '1Password', url: 'itms-apps://itunes.apple.com/app/id1136318669' },
            { name: 'Bitwarden', url: 'itms-apps://itunes.apple.com/app/id1137397744' },
            { name: 'LastPass', url: 'itms-apps://itunes.apple.com/app/id324613447' }
          ],
          steps: [
            'Download a password manager app',
            'Create an account and master password',
            'Enable biometric unlock',
            'Import existing passwords'
          ],
          verification: 'app_installed',
          priority: 'high'
        },
        android: {
          deepLink: 'market://details?id=com.onepassword.android',
          apps: [
            { name: '1Password', url: 'market://details?id=com.onepassword.android' },
            { name: 'Bitwarden', url: 'market://details?id=com.x8bit.bitwarden' },
            { name: 'LastPass', url: 'market://details?id=com.lastpass.lpandroid' }
          ],
          steps: [
            'Download a password manager app',
            'Create an account and master password',
            'Enable fingerprint unlock',
            'Import existing passwords'
          ],
          verification: 'app_installed',
          priority: 'high'
        },
        windows: {
          deepLink: null,
          apps: [
            { name: '1Password', url: 'https://1password.com/downloads/' },
            { name: 'Bitwarden', url: 'https://bitwarden.com/download/' },
            { name: 'LastPass', url: 'https://www.lastpass.com/download' }
          ],
          steps: [
            'Visit password manager website',
            'Download and install the application',
            'Create an account and master password',
            'Install browser extension'
          ],
          verification: 'manual',
          priority: 'medium'
        },
        macos: {
          deepLink: null,
          apps: [
            { name: '1Password', url: 'https://1password.com/downloads/' },
            { name: 'Bitwarden', url: 'https://bitwarden.com/download/' },
            { name: 'Keychain (Built-in)', url: null }
          ],
          steps: [
            'Download password manager or use Keychain',
            'Create an account and master password',
            'Enable Touch ID unlock (if available)',
            'Import existing passwords'
          ],
          verification: 'manual',
          priority: 'medium'
        }
      },
      'mfa-setup': {
        universal: {
          authenticatorApps: [
            { name: 'Google Authenticator', ios: 'itms-apps://itunes.apple.com/app/id388497605', android: 'market://details?id=com.google.android.apps.authenticator2' },
            { name: 'Microsoft Authenticator', ios: 'itms-apps://itunes.apple.com/app/id983156458', android: 'market://details?id=com.azure.authenticator' },
            { name: 'Authy', ios: 'itms-apps://itunes.apple.com/app/id494168017', android: 'market://details?id=com.authy.authy' }
          ],
          steps: [
            'Download an authenticator app',
            'Enable 2FA on important accounts',
            'Scan QR codes or enter setup keys',
            'Save backup codes safely'
          ],
          verification: 'manual',
          priority: 'high'
        }
      },
      'cloud-backup': {
        ios: {
          deepLink: 'App-Prefs:CASTLE',
          service: 'iCloud',
          steps: [
            'Open Settings',
            'Tap your name at the top',
            'Tap iCloud',
            'Enable iCloud Backup',
            'Check available storage space'
          ],
          verification: 'settings_check',
          priority: 'high'
        },
        android: {
          deepLink: 'android.settings.SYNC_SETTINGS',
          service: 'Google Backup',
          steps: [
            'Open Settings',
            'Tap Google',
            'Tap Backup',
            'Turn on "Back up to Google Drive"',
            'Check backup frequency settings'
          ],
          verification: 'settings_check',
          priority: 'high'
        },
        windows: {
          deepLink: null,
          service: 'OneDrive',
          steps: [
            'Open OneDrive settings',
            'Enable folder backup',
            'Choose folders to sync',
            'Check available storage space'
          ],
          verification: 'manual',
          priority: 'medium'
        },
        macos: {
          deepLink: null,
          service: 'iCloud Drive',
          steps: [
            'Open System Preferences',
            'Click Apple ID',
            'Enable iCloud Drive',
            'Choose folders to sync',
            'Enable Desktop & Documents sync'
          ],
          verification: 'manual',
          priority: 'medium'
        }
      }
    };
  }

  /**
   * Get device-specific content for a check
   * @param {string} checkType - Type of check (e.g., 'screen-lock', 'password-manager')
   * @param {string} platform - Platform (ios, android, windows, macos)
   * @returns {Object|null} Device-specific content or null if not available
   */
  static getDeviceContent(checkType, platform) {
    const matrix = this.getDeviceContentMatrix();
    return matrix[checkType]?.[platform] || null;
  }

  /**
   * Check if current device supports deep links for settings
   * @returns {boolean} True if deep links are supported
   */
  static supportsDeepLinks() {
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }

  /**
   * Get platform-specific app store URL
   * @param {string} appId - App identifier
   * @param {string} platform - Target platform
   * @returns {string|null} App store URL or null
   */
  static getAppStoreUrl(appId, platform = Platform.OS) {
    const appStoreUrls = {
      ios: `itms-apps://itunes.apple.com/app/${appId}`,
      android: `market://details?id=${appId}`
    };
    return appStoreUrls[platform] || null;
  }

  /**
   * Get device capability for a specific feature
   * @param {string} feature - Feature to check (e.g., 'biometric', 'nfc', 'camera')
   * @returns {Object} Capability information
   */
  static getDeviceCapability(feature) {
    const currentDevice = this.getCurrentDevice();
    
    const capabilities = {
      biometric: {
        supported: Platform.OS === 'ios' || Platform.OS === 'android',
        methods: Platform.OS === 'ios' ? ['Face ID', 'Touch ID'] : ['Fingerprint', 'Face Unlock'],
        settingsPath: Platform.OS === 'ios' ? 'App-Prefs:PASSCODE' : 'android.settings.SECURITY_SETTINGS'
      },
      camera: {
        supported: Platform.OS === 'ios' || Platform.OS === 'android',
        features: ['QR Code Scanning', 'Photo Capture'],
        permissions: ['camera']
      },
      notifications: {
        supported: true,
        settingsPath: Platform.OS === 'ios' ? 'App-Prefs:NOTIFICATIONS_ID' : 'android.settings.APP_NOTIFICATION_SETTINGS'
      }
    };

    return capabilities[feature] || { supported: false };
  }

  /**
   * Determine the best interaction pattern for a device combination
   * @param {Array} userDevices - User's registered devices
   * @param {string} checkType - Type of check
   * @returns {string} Recommended pattern ('A', 'B', or 'C')
   */
  static getRecommendedPattern(userDevices, checkType) {
    if (!userDevices || userDevices.length === 0) {
      return 'A'; // Default to traditional checklist
    }

    const hasHighCapabilityDevices = userDevices.some(device => 
      device.tier2 === 'apple' || device.tier2 === 'android'
    );

    const hasMultipleDevices = userDevices.length > 1;

    // Pattern C for interactive features (breach checking, scam recognition)
    if (['breach-check', 'scam-recognition'].includes(checkType)) {
      return 'C';
    }

    // Pattern B for device-specific actions
    if (hasHighCapabilityDevices && ['screen-lock', 'password-manager', 'mfa-setup', 'cloud-backup'].includes(checkType)) {
      return 'B';
    }

    // Pattern A for simple checklists
    return 'A';
  }
}
