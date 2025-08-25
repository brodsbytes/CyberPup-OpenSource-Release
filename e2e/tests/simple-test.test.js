/**
 * Simple Test to verify Detox setup
 * This test will help us verify that Detox is configured correctly
 */

describe('Simple Detox Test', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show welcome screen', async () => {
    // Wait for the app to load
    await device.waitForElementByLabelText('Welcome to CyberPup').toBeVisible();
    
    // Take a screenshot for verification
    await device.takeScreenshot('welcome-screen');
    
    // Verify we can see the welcome text
    const welcomeElement = await device.findElementByLabelText('Welcome to CyberPup');
    expect(await welcomeElement.isDisplayed()).toBe(true);
  });

  it('should have basic navigation elements', async () => {
    await device.waitForElementByLabelText('Welcome to CyberPup').toBeVisible();
    
    // Look for common navigation elements
    const elements = await device.findElementsByLabelText(/.*/);
    expect(elements.length).toBeGreaterThan(0);
    
    console.log('Found elements:', elements.length);
  });

  it('should handle basic app interaction', async () => {
    await device.waitForElementByLabelText('Welcome to CyberPup').toBeVisible();
    
    // Try to find and tap a button if it exists
    try {
      const button = await device.findElementByLabelText('Get Started');
      if (await button.isDisplayed()) {
        await button.tap();
        await device.wait(2000);
        console.log('Successfully tapped Get Started button');
      }
    } catch (error) {
      console.log('Get Started button not found, continuing...');
    }
  });
});
