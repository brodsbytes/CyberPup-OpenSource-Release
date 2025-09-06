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
   * Open Android Password Manager with fallback options
   * @param {Object} device - Device information
   * @returns {Promise<Object>} Result of the operation
   */
  static async openAndroidPasswordManager(device) {
    const result = {
      success: false,
      method: null,
      error: null,
      needsManualGuidance: false
    };

    // Try multiple approaches for Android Password Manager
    const approaches = [
      // Try direct settings deep link
      'android.settings.SECURITY_SETTINGS',
      // Try general settings as fallback
      'android.settings.SETTINGS',
      // Try web interface as final fallback
      'https://passwords.google.com/'
    ];

    for (let i = 0; i < approaches.length; i++) {
      const approach = approaches[i];
      
      try {
        console.log(`🔗 Trying approach ${i + 1}: ${approach}`);
        
        if (approach.startsWith('http')) {
          // Web interface approach
          const canOpen = await Linking.canOpenURL(approach);
          if (canOpen) {
            await Linking.openURL(approach);
            result.success = true;
            result.method = 'web';
            console.log('✅ Opened Google Password Manager via web');
            return result;
          }
        } else {
          // Android settings approach
          const canOpen = await Linking.canOpenURL(approach);
          if (canOpen) {
            await Linking.openURL(approach);
            result.success = true;
            result.method = 'deeplink';
            console.log(`✅ Opened Android settings via deep link: ${approach}`);
            return result;
          }
        }
      } catch (error) {
        console.log(`❌ Approach ${i + 1} failed:`, error.message);
        if (i === approaches.length - 1) {
          result.error = error.message;
        }
      }
    }

    // All approaches failed
    result.needsManualGuidance = true;
    result.method = 'manual';
    result.error = 'All deep link approaches failed';
    return result;
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
        location: 'android.settings.LOCATION_SOURCE_SETTINGS',
        passwords: 'android.settings.SECURITY_SETTINGS'
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
        },
        passwords: {
          title: 'Password Manager Settings',
          steps: [
            'Open the Settings app',
            'Search for "Password manager" or scroll to find it',
            'Tap "Password manager"',
            'Manage your saved passwords and passkeys'
          ],
          icon: 'key'
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
   * Get device-specific password manager recommendations based on user's device ecosystem
   * @param {Array} userDevices - Array of user's devices
   * @returns {Object} Tailored recommendations with explanations
   */
  static getPasswordManagerRecommendations(userDevices) {
    const devicePlatforms = userDevices.map(device => device.platform || device.tier2);
    const hasApple = devicePlatforms.includes('ios') || devicePlatforms.includes('macos');
    const hasAndroid = devicePlatforms.includes('android');
    const hasWindows = devicePlatforms.includes('windows');
    const hasMixedPlatforms = new Set(devicePlatforms).size > 1;

    // Determine recommendation strategy
    if (hasApple && !hasAndroid && !hasWindows) {
      // Pure Apple ecosystem
      return {
        primary: {
          name: 'Apple Passwords (Built-in)',
          type: 'built-in',
          platforms: ['ios', 'macos'],
          description: 'iCloud Keychain with Passwords app',
          whyRecommended: 'Seamlessly integrated across all your Apple devices with end-to-end encryption. No additional apps needed.',
          setupSteps: [
            'Go to Settings → Passwords on your iPhone/iPad',
            'Turn on "AutoFill Passwords"',
            'On Mac: System Preferences → Apple ID → iCloud → Keychain',
            'Enable "Keychain" sync across devices'
          ],
          pros: ['Free', 'Native integration', 'Automatic sync', 'Biometric unlock'],
          cons: ['Apple devices only', 'Limited sharing options']
        },
        alternatives: [
          {
            name: '1Password',
            type: 'premium',
            description: 'Best premium option for Apple users',
            whyConsider: 'Advanced features like secure sharing and family plans'
          }
        ]
      };
    } else if (hasAndroid && !hasApple && !hasWindows) {
      // Pure Android ecosystem
      return {
        primary: {
          name: 'Google Password Manager (Built-in)',
          type: 'built-in',
          platforms: ['android'],
          description: 'Google\'s integrated password manager',
          whyRecommended: 'Built into Android and Chrome, automatically saves and fills passwords across your Google account.',
          setupSteps: [
            'Open Settings on your Android device',
            'Search for "Password manager" or scroll to find it',
            'Tap "Password manager" to access Google Password Manager',
            'Turn on "Offer to save passwords" in Chrome settings'
          ],
          pros: ['Free', 'Automatic sync', 'Chrome integration', 'Google account integration'],
          cons: ['Google ecosystem only', 'Limited advanced features']
        },
        alternatives: [
          {
            name: 'Bitwarden',
            type: 'free',
            description: 'Best free cross-platform option',
            whyConsider: 'Open-source, unlimited passwords, works everywhere'
          }
        ]
      };
    } else if (hasMixedPlatforms) {
      // Mixed device ecosystem - recommend cross-platform solution
      return {
        primary: {
          name: 'Bitwarden',
          type: 'free',
          platforms: ['ios', 'android', 'windows', 'macos', 'web'],
          description: 'Open-source password manager',
          whyRecommended: 'Works seamlessly across all your devices (iPhone, Android, Windows, Mac) with unlimited free storage and strong security.',
          setupSteps: [
            'Download Bitwarden from your device\'s app store',
            'Create a free account with a strong master password',
            'Install browser extensions for easy access',
            'Enable biometric unlock on mobile devices'
          ],
          pros: ['Free', 'Cross-platform', 'Open-source', 'Unlimited passwords', 'Strong security'],
          cons: ['Requires account setup', 'Free version has some limitations']
        },
        alternatives: [
          {
            name: '1Password',
            type: 'premium',
            description: 'Premium cross-platform solution',
            whyConsider: 'Advanced features, excellent UX, family sharing'
          },
          {
            name: 'Proton Pass',
            type: 'free',
            description: 'Privacy-focused alternative',
            whyConsider: 'From Proton team, strong privacy focus, free tier available'
          }
        ]
      };
    } else {
      // Fallback for unknown scenarios
      return {
        primary: {
          name: 'Bitwarden',
          type: 'free',
          platforms: ['ios', 'android', 'windows', 'macos', 'web'],
          description: 'Open-source password manager',
          whyRecommended: 'The most versatile and secure free option that works on any device you might use.',
          setupSteps: [
            'Download Bitwarden from your device\'s app store',
            'Create a free account with a strong master password',
            'Install browser extensions for easy access',
            'Enable biometric unlock on mobile devices'
          ],
          pros: ['Free', 'Cross-platform', 'Open-source', 'Unlimited passwords', 'Strong security'],
          cons: ['Requires account setup', 'Free version has some limitations']
        },
        alternatives: []
      };
    }
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
            rating: 4.8,
            type: 'premium'
          },
          {
            name: 'Bitwarden',
            identifier: 'id1137397744',
            url: 'itms-apps://itunes.apple.com/app/id1137397744',
            description: 'Open-source password manager',
            rating: 4.7,
            type: 'free'
          },
          {
            name: 'Proton Pass',
            identifier: 'id6443490629',
            url: 'itms-apps://itunes.apple.com/app/id6443490629',
            description: 'Privacy-focused password manager',
            rating: 4.6,
            type: 'free'
          }
        ],
        android: [
          {
            name: '1Password',
            identifier: 'com.onepassword.android',
            url: 'market://details?id=com.onepassword.android',
            description: 'Complete password management solution',
            rating: 4.6,
            type: 'premium'
          },
          {
            name: 'Bitwarden',
            identifier: 'com.x8bit.bitwarden',
            url: 'market://details?id=com.x8bit.bitwarden',
            description: 'Open-source password manager',
            rating: 4.5,
            type: 'free'
          },
          {
            name: 'Proton Pass',
            identifier: 'proton.android.pass',
            url: 'market://details?id=proton.android.pass',
            description: 'Privacy-focused password manager',
            rating: 4.4,
            type: 'free'
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
