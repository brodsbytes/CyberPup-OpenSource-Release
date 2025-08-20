import { Linking, Platform, Alert } from 'react-native';
import { DeviceCapabilities } from './deviceCapabilities';

/**
 * SettingsGuide - Deep Link Management Utility
 * 
 * Handles platform-specific deep links with proper fallbacks.
 * Applies Phase 1 lessons: user-controlled navigation, proper error handling,
 * and contextual guidance based on device capabilities.
 */
export class SettingsGuide {
  /**
   * Attempt to open device settings using deep links
   * @param {string} settingsPath - The settings path or URL
   * @param {Object} fallbackOptions - Fallback options if deep link fails
   * @returns {Promise<Object>} Result of the operation
   */
  static async openSettings(settingsPath, fallbackOptions = {}) {
    const result = {
      success: false,
      method: null,
      error: null,
      needsManualGuidance: false
    };

    // Check if deep links are supported on this platform
    if (!DeviceCapabilities.supportsDeepLinks()) {
      result.needsManualGuidance = true;
      result.method = 'manual';
      return result;
    }

    try {
      // Check if the URL can be opened
      const canOpen = await Linking.canOpenURL(settingsPath);
      
      if (canOpen) {
        await Linking.openURL(settingsPath);
        result.success = true;
        result.method = 'deeplink';
        return result;
      } else {
        // Deep link not supported, fall back to manual
        result.needsManualGuidance = true;
        result.method = 'manual';
        result.error = 'Deep link not supported on this device';
        return result;
      }
    } catch (error) {
      console.log('Deep link failed:', error);
      result.needsManualGuidance = true;
      result.method = 'manual';
      result.error = error.message;
      return result;
    }
  }

  /**
   * Get platform-specific settings URLs
   * @param {string} settingType - Type of setting (e.g., 'security', 'privacy', 'notifications')
   * @param {string} platform - Target platform (defaults to current platform)
   * @returns {Object} Settings URL information
   */
  static getSettingsUrl(settingType, platform = Platform.OS) {
    const settingsMap = {
      ios: {
        security: 'App-Prefs:PASSCODE',
        privacy: 'App-Prefs:Privacy',
        notifications: 'App-Prefs:NOTIFICATIONS_ID',
        general: 'App-Prefs:General',
        wifi: 'App-Prefs:WIFI',
        bluetooth: 'App-Prefs:Bluetooth',
        icloud: 'App-Prefs:CASTLE',
        faceid: 'App-Prefs:PASSCODE',
        touchid: 'App-Prefs:PASSCODE',
        backup: 'App-Prefs:CASTLE',
        passwords: 'App-Prefs:PASSWORDS',
        safari: 'App-Prefs:SAFARI'
      },
      android: {
        security: 'android.settings.SECURITY_SETTINGS',
        privacy: 'android.settings.PRIVACY_SETTINGS',
        notifications: 'android.settings.APP_NOTIFICATION_SETTINGS',
        general: 'android.settings.SETTINGS',
        wifi: 'android.settings.WIFI_SETTINGS',
        bluetooth: 'android.settings.BLUETOOTH_SETTINGS',
        backup: 'android.settings.SYNC_SETTINGS',
        biometric: 'android.settings.FINGERPRINT_ENROLL',
        apps: 'android.settings.APPLICATION_SETTINGS',
        accounts: 'android.settings.SYNC_SETTINGS',
        location: 'android.settings.LOCATION_SOURCE_SETTINGS'
      }
    };

    const url = settingsMap[platform]?.[settingType];
    
    return {
      url,
      supported: !!url,
      platform,
      settingType
    };
  }

  /**
   * Open app store for downloading recommended apps
   * @param {string} appIdentifier - App store identifier
   * @param {string} appName - Human-readable app name
   * @param {string} platform - Target platform
   * @returns {Promise<Object>} Result of the operation
   */
  static async openAppStore(appIdentifier, appName, platform = Platform.OS) {
    const result = {
      success: false,
      method: 'appstore',
      error: null,
      appName
    };

    try {
      let storeUrl;
      
      if (platform === 'ios') {
        // Handle both app ID and full URL formats
        if (appIdentifier.startsWith('http')) {
          storeUrl = appIdentifier;
        } else {
          storeUrl = `itms-apps://itunes.apple.com/app/${appIdentifier}`;
        }
      } else if (platform === 'android') {
        // Handle both package name and full URL formats
        if (appIdentifier.startsWith('http') || appIdentifier.startsWith('market://')) {
          storeUrl = appIdentifier;
        } else {
          storeUrl = `market://details?id=${appIdentifier}`;
        }
      } else {
        // For web platforms, try to use the identifier as a URL
        storeUrl = appIdentifier.startsWith('http') ? appIdentifier : `https://${appIdentifier}`;
      }

      const canOpen = await Linking.canOpenURL(storeUrl);
      
      if (canOpen) {
        await Linking.openURL(storeUrl);
        result.success = true;
        return result;
      } else {
        throw new Error('Cannot open app store URL');
      }
    } catch (error) {
      console.log('App store open failed:', error);
      result.error = error.message;
      
      // Show fallback alert with manual instructions
      Alert.alert(
        'Open App Store',
        `Please search for "${appName}" in your device's app store to download it.`,
        [{ text: 'OK' }]
      );
      
      return result;
    }
  }

  /**
   * Get manual instructions for settings navigation
   * @param {string} settingType - Type of setting
   * @param {string} platform - Target platform
   * @returns {Object} Manual instruction steps
   */
  static getManualInstructions(settingType, platform = Platform.OS) {
    const instructionsMap = {
      ios: {
        security: {
          title: 'Security & Passcode Settings',
          steps: [
            'Open the Settings app',
            'Tap "Face ID & Passcode" (or "Touch ID & Passcode")',
            'Enter your current passcode if prompted',
            'Configure your security settings'
          ],
          icon: 'lock-closed'
        },
        backup: {
          title: 'iCloud Backup Settings',
          steps: [
            'Open the Settings app',
            'Tap your name at the top',
            'Tap "iCloud"',
            'Tap "iCloud Backup"',
            'Turn on "iCloud Backup"'
          ],
          icon: 'cloud'
        },
        passwords: {
          title: 'Password Settings',
          steps: [
            'Open the Settings app',
            'Tap "Passwords"',
            'Authenticate with Face ID, Touch ID, or passcode',
            'Manage your saved passwords'
          ],
          icon: 'key'
        }
      },
      android: {
        security: {
          title: 'Security Settings',
          steps: [
            'Open the Settings app',
            'Tap "Security" or "Security & Privacy"',
            'Configure your security options',
            'Set up screen lock if needed'
          ],
          icon: 'shield'
        },
        backup: {
          title: 'Backup Settings',
          steps: [
            'Open the Settings app',
            'Tap "Google" or "Accounts"',
            'Tap "Backup"',
            'Turn on "Back up to Google Drive"',
            'Configure backup settings'
          ],
          icon: 'cloud-upload'
        },
        biometric: {
          title: 'Biometric Settings',
          steps: [
            'Open the Settings app',
            'Tap "Security" or "Biometrics"',
            'Tap "Fingerprint" or "Face unlock"',
            'Follow setup instructions'
          ],
          icon: 'finger-print'
        }
      },
      windows: {
        security: {
          title: 'Windows Security Settings',
          steps: [
            'Press Windows key + I to open Settings',
            'Click "Accounts"',
            'Click "Sign-in options"',
            'Set up Windows Hello or PIN'
          ],
          icon: 'desktop'
        },
        backup: {
          title: 'Windows Backup Settings',
          steps: [
            'Press Windows key + I to open Settings',
            'Click "Update & Security"',
            'Click "Backup"',
            'Set up File History or OneDrive sync'
          ],
          icon: 'save'
        }
      },
      macos: {
        security: {
          title: 'macOS Security Settings',
          steps: [
            'Click the Apple menu',
            'Choose "System Preferences"',
            'Click "Security & Privacy"',
            'Configure security settings'
          ],
          icon: 'laptop'
        },
        backup: {
          title: 'macOS Backup Settings',
          steps: [
            'Click the Apple menu',
            'Choose "System Preferences"',
            'Click "Apple ID"',
            'Turn on iCloud Drive and Desktop & Documents sync'
          ],
          icon: 'cloud-done'
        }
      }
    };

    const instructions = instructionsMap[platform]?.[settingType];
    
    return {
      ...instructions,
      platform,
      settingType,
      available: !!instructions
    };
  }

  /**
   * Get recommended apps for a specific platform and purpose
   * @param {string} purpose - Purpose (e.g., 'password-manager', 'authenticator')
   * @param {string} platform - Target platform
   * @returns {Array} Array of recommended apps
   */
  static getRecommendedApps(purpose, platform = Platform.OS) {
    const appsMap = {
      'password-manager': {
        ios: [
          {
            name: '1Password',
            identifier: 'id1136318669',
            url: 'itms-apps://itunes.apple.com/app/id1136318669',
            description: 'Complete password management solution',
            rating: 4.8
          },
          {
            name: 'Bitwarden',
            identifier: 'id1137397744',
            url: 'itms-apps://itunes.apple.com/app/id1137397744',
            description: 'Open-source password manager',
            rating: 4.7
          },
          {
            name: 'LastPass',
            identifier: 'id324613447',
            url: 'itms-apps://itunes.apple.com/app/id324613447',
            description: 'Popular password manager',
            rating: 4.5
          }
        ],
        android: [
          {
            name: '1Password',
            identifier: 'com.onepassword.android',
            url: 'market://details?id=com.onepassword.android',
            description: 'Complete password management solution',
            rating: 4.6
          },
          {
            name: 'Bitwarden',
            identifier: 'com.x8bit.bitwarden',
            url: 'market://details?id=com.x8bit.bitwarden',
            description: 'Open-source password manager',
            rating: 4.5
          },
          {
            name: 'LastPass',
            identifier: 'com.lastpass.lpandroid',
            url: 'market://details?id=com.lastpass.lpandroid',
            description: 'Popular password manager',
            rating: 4.3
          }
        ]
      },
      'authenticator': {
        ios: [
          {
            name: 'Google Authenticator',
            identifier: 'id388497605',
            url: 'itms-apps://itunes.apple.com/app/id388497605',
            description: 'Simple 2FA authenticator',
            rating: 4.4
          },
          {
            name: 'Microsoft Authenticator',
            identifier: 'id983156458',
            url: 'itms-apps://itunes.apple.com/app/id983156458',
            description: 'Microsoft\'s authenticator app',
            rating: 4.6
          },
          {
            name: 'Authy',
            identifier: 'id494168017',
            url: 'itms-apps://itunes.apple.com/app/id494168017',
            description: 'Advanced 2FA with cloud sync',
            rating: 4.7
          }
        ],
        android: [
          {
            name: 'Google Authenticator',
            identifier: 'com.google.android.apps.authenticator2',
            url: 'market://details?id=com.google.android.apps.authenticator2',
            description: 'Simple 2FA authenticator',
            rating: 4.2
          },
          {
            name: 'Microsoft Authenticator',
            identifier: 'com.azure.authenticator',
            url: 'market://details?id=com.azure.authenticator',
            description: 'Microsoft\'s authenticator app',
            rating: 4.5
          },
          {
            name: 'Authy',
            identifier: 'com.authy.authy',
            url: 'market://details?id=com.authy.authy',
            description: 'Advanced 2FA with cloud sync',
            rating: 4.6
          }
        ]
      }
    };

    return appsMap[purpose]?.[platform] || [];
  }

  /**
   * Create a comprehensive settings guidance object
   * @param {string} checkType - Type of security check
   * @param {Object} device - Device information
   * @returns {Object} Complete guidance information
   */
  static createGuidance(checkType, device) {
    const platform = device.platform || device.tier2;
    const settingsUrl = this.getSettingsUrl(checkType, platform);
    const manualInstructions = this.getManualInstructions(checkType, platform);
    const deviceContent = DeviceCapabilities.getDeviceContent(checkType, platform);

    return {
      checkType,
      device,
      platform,
      deepLink: {
        url: settingsUrl.url,
        supported: settingsUrl.supported && DeviceCapabilities.supportsDeepLinks()
      },
      manual: {
        instructions: manualInstructions,
        available: manualInstructions.available
      },
      deviceSpecific: deviceContent,
      openSettings: (fallbackOptions) => this.openSettings(settingsUrl.url, fallbackOptions),
      openAppStore: (appId, appName) => this.openAppStore(appId, appName, platform),
      getRecommendedApps: (purpose) => this.getRecommendedApps(purpose, platform)
    };
  }

  /**
   * Validate if a deep link URL is properly formatted
   * @param {string} url - URL to validate
   * @param {string} platform - Platform to validate for
   * @returns {Object} Validation result
   */
  static validateDeepLink(url, platform = Platform.OS) {
    if (!url) {
      return { valid: false, reason: 'URL is empty' };
    }

    const validPrefixes = {
      ios: ['App-Prefs:', 'prefs:', 'settings:', 'itms-apps://'],
      android: ['android.settings.', 'market://'],
      web: ['http://', 'https://']
    };

    const prefixes = validPrefixes[platform] || validPrefixes.web;
    const hasValidPrefix = prefixes.some(prefix => url.startsWith(prefix));

    return {
      valid: hasValidPrefix,
      reason: hasValidPrefix ? 'Valid URL format' : `Invalid prefix for ${platform}`,
      suggestedPrefixes: prefixes
    };
  }
}

export default SettingsGuide;
