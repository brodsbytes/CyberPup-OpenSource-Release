/**
 * Device Audit Test
 * Tests the device audit functionality with different device configurations
 */

import { DEVICE_CONFIGS, getExpectedDeviceCount } from '../helpers/deviceSetup';

describe('Device Audit', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Single Device Configurations', () => {
    it('should complete device audit with single iPhone', async () => {
      await testDeviceAudit('SINGLE_IPHONE');
    });

    it('should complete device audit with single Android', async () => {
      await testDeviceAudit('SINGLE_ANDROID');
    });

    it('should complete device audit with single Mac', async () => {
      await testDeviceAudit('SINGLE_MAC');
    });

    it('should complete device audit with single Windows', async () => {
      await testDeviceAudit('SINGLE_WINDOWS');
    });
  });

  describe('Multi-Device Configurations', () => {
    it('should complete device audit with multiple mobile devices', async () => {
      await testDeviceAudit('MULTI_MOBILE');
    });

    it('should complete device audit with multiple platforms', async () => {
      await testDeviceAudit('MULTI_PLATFORM');
    });

    it('should complete device audit with complex setup', async () => {
      await testDeviceAudit('COMPLEX_SETUP');
    });
  });

  describe('Device Audit Flow', () => {
    it('should handle device addition correctly', async () => {
      await device.waitForElementByLabelText('Welcome to CyberPup').toBeVisible();
      await device.tapByLabelText('Get Started');
      
      // Verify device audit screen
      await device.waitForElementByLabelText('Device Audit').toBeVisible();
      
      // Add a device
      await device.tapByLabelText('Add Device');
      await device.wait(1000);
      
      // Select mobile device
      await device.tapByLabelText('Mobile Device');
      await device.wait(1000);
      
      // Select iOS
      await device.tapByLabelText('Apple (iPhone, iPad)');
      await device.wait(1000);
      
      // Select iPhone model
      const iphoneModels = await device.findElementsByLabelText(/iPhone/);
      if (iphoneModels.length > 0) {
        await iphoneModels[0].tap();
      }
      await device.wait(1000);
      
      // Save device
      await device.tapByLabelText('Save Device');
      await device.wait(1000);
      
      // Verify device was added
      const deviceElement = await device.findElementByLabelText(/iPhone/);
      expect(await deviceElement.isDisplayed()).toBe(true);
    });

    it('should handle device removal correctly', async () => {
      await device.waitForElementByLabelText('Welcome to CyberPup').toBeVisible();
      await device.tapByLabelText('Get Started');
      
      // Add a device first
      await device.tapByLabelText('Add Device');
      await device.wait(1000);
      await device.tapByLabelText('Mobile Device');
      await device.wait(1000);
      await device.tapByLabelText('Apple (iPhone, iPad)');
      await device.wait(1000);
      
      const iphoneModels = await device.findElementsByLabelText(/iPhone/);
      if (iphoneModels.length > 0) {
        await iphoneModels[0].tap();
      }
      await device.wait(1000);
      await device.tapByLabelText('Save Device');
      await device.wait(1000);
      
      // Remove the device
      const deviceElement = await device.findElementByLabelText(/iPhone/);
      await deviceElement.longPress();
      await device.wait(1000);
      
      // Confirm removal
      await device.tapByLabelText('Remove Device');
      await device.wait(1000);
      
      // Verify device was removed
      const removedDevice = await device.findElementByLabelText(/iPhone/);
      expect(await removedDevice.isDisplayed()).toBe(false);
    });

    it('should complete audit and proceed to main app', async () => {
      await device.waitForElementByLabelText('Welcome to CyberPup').toBeVisible();
      await device.tapByLabelText('Get Started');
      
      // Add at least one device
      await device.tapByLabelText('Add Device');
      await device.wait(1000);
      await device.tapByLabelText('Mobile Device');
      await device.wait(1000);
      await device.tapByLabelText('Apple (iPhone, iPad)');
      await device.wait(1000);
      
      const iphoneModels = await device.findElementsByLabelText(/iPhone/);
      if (iphoneModels.length > 0) {
        await iphoneModels[0].tap();
      }
      await device.wait(1000);
      await device.tapByLabelText('Save Device');
      await device.wait(1000);
      
      // Complete audit
      await device.tapByLabelText('Complete Audit');
      await device.wait(2000);
      
      // Verify we're on the main welcome screen
      await device.waitForElementByLabelText('Welcome to CyberPup').toBeVisible();
      
      // Verify we can start Level 1
      const startButton = await device.findElementByLabelText('Start Level 1');
      expect(await startButton.isDisplayed()).toBe(true);
    });
  });

  describe('Device-Specific Content', () => {
    it('should show correct content for iOS devices', async () => {
      await setupDeviceConfig('SINGLE_IPHONE', device);
      
      // Navigate to a device-specific check
      await device.tapByLabelText('Screen Lock');
      await device.wait(1000);
      
      // Verify iOS-specific content
      const iosContent = await device.findElementByLabelText(/iOS|iPhone|Apple/);
      expect(await iosContent.isDisplayed()).toBe(true);
    });

    it('should show correct content for Android devices', async () => {
      await setupDeviceConfig('SINGLE_ANDROID', device);
      
      // Navigate to a device-specific check
      await device.tapByLabelText('Screen Lock');
      await device.wait(1000);
      
      // Verify Android-specific content
      const androidContent = await device.findElementByLabelText(/Android|Samsung|Google/);
      expect(await androidContent.isDisplayed()).toBe(true);
    });

    it('should show correct content for macOS devices', async () => {
      await setupDeviceConfig('SINGLE_MAC', device);
      
      // Navigate to a device-specific check
      await device.tapByLabelText('Screen Lock');
      await device.wait(1000);
      
      // Verify macOS-specific content
      const macContent = await device.findElementByLabelText(/macOS|Mac|Apple/);
      expect(await macContent.isDisplayed()).toBe(true);
    });

    it('should show correct content for Windows devices', async () => {
      await setupDeviceConfig('SINGLE_WINDOWS', device);
      
      // Navigate to a device-specific check
      await device.tapByLabelText('Screen Lock');
      await device.wait(1000);
      
      // Verify Windows-specific content
      const windowsContent = await device.findElementByLabelText(/Windows|PC/);
      expect(await windowsContent.isDisplayed()).toBe(true);
    });
  });

  describe('Multi-Device Content', () => {
    it('should show content for all devices in multi-device setup', async () => {
      await setupDeviceConfig('MULTI_PLATFORM', device);
      
      // Navigate to a device-specific check
      await device.tapByLabelText('Screen Lock');
      await device.wait(1000);
      
      // Verify both iPhone and Mac content are shown
      const iphoneContent = await device.findElementByLabelText(/iPhone/);
      const macContent = await device.findElementByLabelText(/Mac/);
      
      expect(await iphoneContent.isDisplayed()).toBe(true);
      expect(await macContent.isDisplayed()).toBe(true);
    });

    it('should handle device-specific actions correctly', async () => {
      await setupDeviceConfig('MULTI_MOBILE', device);
      
      // Navigate to a device-specific check
      await device.tapByLabelText('Screen Lock');
      await device.wait(1000);
      
      // Verify device sections are collapsible
      const deviceSections = await device.findElementsByLabelText(/Device Section/);
      expect(deviceSections.length).toBe(2); // iPhone + Android
      
      // Test collapsing/expanding device sections
      for (const section of deviceSections) {
        await section.tap();
        await device.wait(500);
      }
    });
  });
});

/**
 * Helper function to test device audit with a specific configuration
 * @param {string} configKey - Device configuration key
 */
async function testDeviceAudit(configKey) {
  const config = DEVICE_CONFIGS[configKey];
  const expectedDeviceCount = getExpectedDeviceCount(configKey);
  
  console.log(`Testing device audit with ${config.description}`);
  
  await device.waitForElementByLabelText('Welcome to CyberPup').toBeVisible();
  await device.tapByLabelText('Get Started');
  
  // Add devices based on configuration
  for (const deviceInfo of config.devices) {
    await device.tapByLabelText('Add Device');
    await device.wait(1000);
    
    // Select device type
    if (deviceInfo.type === 'mobile') {
      await device.tapByLabelText('Mobile Device');
    } else {
      await device.tapByLabelText('Computer');
    }
    await device.wait(1000);
    
    // Select platform
    if (deviceInfo.platform === 'ios') {
      await device.tapByLabelText('Apple (iPhone, iPad)');
    } else if (deviceInfo.platform === 'android') {
      await device.tapByLabelText('Android (Samsung, Pixel, etc)');
    } else if (deviceInfo.platform === 'macos') {
      await device.tapByLabelText('macOS (MacBook, iMac, etc)');
    } else if (deviceInfo.platform === 'windows') {
      await device.tapByLabelText('Windows (HP, Dell, Lenovo, etc)');
    }
    await device.wait(1000);
    
    // Select model
    const modelOptions = await device.findElementsByLabelText(/^[A-Z].*$/);
    if (modelOptions.length > 0) {
      await modelOptions[0].tap();
    }
    await device.wait(1000);
    
    // Save device
    await device.tapByLabelText('Save Device');
    await device.wait(1000);
  }
  
  // Verify correct number of devices
  const deviceElements = await device.findElementsByLabelText(/Device/);
  expect(deviceElements.length).toBe(expectedDeviceCount);
  
  // Complete audit
  await device.tapByLabelText('Complete Audit');
  await device.wait(2000);
  
  // Verify we're on the main screen
  await device.waitForElementByLabelText('Welcome to CyberPup').toBeVisible();
  
  console.log(`✅ Device audit completed successfully with ${config.description}`);
}
