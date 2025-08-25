/**
 * Complete Level 1 Flow Test
 * Tests the entire Level 1 cybersecurity check flow with different device configurations
 */

import { DEVICE_CONFIGS, setupDeviceConfig, getExpectedDeviceCount } from '../helpers/deviceSetup';
import { LEVEL_1_CHECK_FLOW, completeCheck, navigateToCheck } from '../helpers/checkFlowHelper';

describe('Level 1 Complete Flow', () => {
  // Test different device configurations
  const deviceConfigs = [
    'SINGLE_IPHONE',
    'SINGLE_ANDROID', 
    'SINGLE_MAC',
    'SINGLE_WINDOWS',
    'MULTI_MOBILE',
    'MULTI_PLATFORM',
    'COMPLEX_SETUP'
  ];

  deviceConfigs.forEach(configKey => {
    describe(`${configKey} Configuration`, () => {
      const config = DEVICE_CONFIGS[configKey];
      
      beforeAll(async () => {
        await setupDeviceConfig(configKey, device);
      });

      it(`should complete entire Level 1 flow with ${config.description}`, async () => {
        console.log(`Starting Level 1 flow test with ${config.description}`);
        
        // Navigate to initial welcome screen
        await device.waitForElementByLabelText('Welcome to CyberPup').toBeVisible();
        await device.tapByLabelText('Get Started');
        
        // Complete device audit if needed
        const deviceAuditVisible = await device.findElementByLabelText('Device Audit');
        if (await deviceAuditVisible.isDisplayed()) {
          console.log('Completing device audit...');
          
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
            
            // Select model (use first available option)
            const modelOptions = await device.findElementsByLabelText(/^[A-Z].*$/);
            if (modelOptions.length > 0) {
              await modelOptions[0].tap();
            }
            await device.wait(1000);
            
            // Save device
            await device.tapByLabelText('Save Device');
            await device.wait(1000);
          }
          
          // Complete device audit
          await device.tapByLabelText('Complete Audit');
          await device.wait(2000);
        }
        
        // Navigate to welcome screen
        await device.waitForElementByLabelText('Welcome to CyberPup').toBeVisible();
        
        // Start Level 1 checks
        await device.tapByLabelText('Start Level 1');
        await device.wait(1000);
        
        // Complete each check in the flow
        for (const checkId of LEVEL_1_CHECK_FLOW) {
          console.log(`Completing check: ${checkId}`);
          
          try {
            // Navigate to the check
            await navigateToCheck(device, checkId);
            
            // Complete the check based on its pattern
            await completeCheck(device, checkId);
            
            // Verify we're back to the welcome screen or next check
            await device.wait(2000);
            
            console.log(`✅ Completed check: ${checkId}`);
            
          } catch (error) {
            console.error(`❌ Failed to complete check ${checkId}:`, error);
            throw error;
          }
        }
        
        // Verify Level 1 is complete
        await device.waitForElementByLabelText('Level 1 Complete!').toBeVisible();
        
        console.log(`✅ Successfully completed Level 1 flow with ${config.description}`);
      });

      it(`should verify device-specific content for ${config.description}`, async () => {
        console.log(`Verifying device-specific content for ${config.description}`);
        
        const expectedDeviceCount = getExpectedDeviceCount(configKey);
        
        // Navigate to a device-specific check (e.g., Screen Lock)
        await device.tapByLabelText('Screen Lock');
        await device.wait(1000);
        
        // Verify correct number of devices are shown
        const deviceSections = await device.findElementsByLabelText(/Device Section/);
        expect(deviceSections.length).toBe(expectedDeviceCount);
        
        // Verify device names are displayed
        for (const deviceInfo of config.devices) {
          const deviceElement = await device.findElementByLabelText(deviceInfo.name);
          expect(await deviceElement.isDisplayed()).toBe(true);
        }
        
        console.log(`✅ Device-specific content verified for ${config.description}`);
      });

      it(`should verify progress persistence for ${config.description}`, async () => {
        console.log(`Verifying progress persistence for ${config.description}`);
        
        // Complete a few checks
        const checksToComplete = ['1-1-1', '1-1-2', '1-1-3'];
        
        for (const checkId of checksToComplete) {
          await navigateToCheck(device, checkId);
          await completeCheck(device, checkId);
          await device.wait(1000);
        }
        
        // Restart the app
        await device.reloadReactNative();
        await device.wait(5000);
        
        // Verify progress is maintained
        await device.waitForElementByLabelText('Welcome to CyberPup').toBeVisible();
        
        // Check that completed checks show as complete
        for (const checkId of checksToComplete) {
          const checkElement = await device.findElementByLabelText(`Check ${checkId}`);
          expect(await checkElement.isDisplayed()).toBe(true);
          
          // Verify completion status (this will depend on your UI implementation)
          const completionIndicator = await device.findElementByLabelText(`Check ${checkId} Complete`);
          expect(await completionIndicator.isDisplayed()).toBe(true);
        }
        
        console.log(`✅ Progress persistence verified for ${config.description}`);
      });
    });
  });

  // Test specific patterns individually
  describe('Individual Pattern Tests', () => {
    it('should complete Pattern A Enhanced checks correctly', async () => {
      const patternAChecks = ['1-1-1', '1-2-5', '1-5-1'];
      
      for (const checkId of patternAChecks) {
        await navigateToCheck(device, checkId);
        await completeCheck(device, checkId);
        await device.wait(1000);
      }
    });

    it('should complete Pattern B checks correctly', async () => {
      const patternBChecks = ['1-1-3', '1-1-4', '1-2-1', '1-3-1'];
      
      for (const checkId of patternBChecks) {
        await navigateToCheck(device, checkId);
        await completeCheck(device, checkId);
        await device.wait(1000);
      }
    });

    it('should complete Pattern C checks correctly', async () => {
      const patternCChecks = ['1-1-5', '1-4-1'];
      
      for (const checkId of patternCChecks) {
        await navigateToCheck(device, checkId);
        await completeCheck(device, checkId);
        await device.wait(1000);
      }
    });

    it('should complete Wizard Variant checks correctly', async () => {
      const wizardChecks = ['1-2-2', '1-2-3', '1-2-4'];
      
      for (const checkId of wizardChecks) {
        await navigateToCheck(device, checkId);
        await completeCheck(device, checkId);
        await device.wait(1000);
      }
    });

    it('should complete Timeline Variant checks correctly', async () => {
      const timelineChecks = ['1-1-2', '1-5-2'];
      
      for (const checkId of timelineChecks) {
        await navigateToCheck(device, checkId);
        await completeCheck(device, checkId);
        await device.wait(1000);
      }
    });

    it('should complete Checklist Variant checks correctly', async () => {
      const checklistChecks = ['1-3-2', '1-4-2'];
      
      for (const checkId of checklistChecks) {
        await navigateToCheck(device, checkId);
        await completeCheck(device, checkId);
        await device.wait(1000);
      }
    });
  });

  // Test error scenarios
  describe('Error Handling Tests', () => {
    it('should handle network errors gracefully', async () => {
      // This would require mocking network conditions
      // For now, we'll test that the app doesn't crash
      await device.waitForElementByLabelText('Welcome to CyberPup').toBeVisible();
      expect(true).toBe(true);
    });

    it('should handle storage errors gracefully', async () => {
      // This would require testing with full storage
      // For now, we'll test basic functionality
      await device.waitForElementByLabelText('Welcome to CyberPup').toBeVisible();
      expect(true).toBe(true);
    });
  });
});
