describe('CyberPup App', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should have welcome screen with progress', async () => {
    // Check for circular progress element (should be visible on welcome screen)
    await expect(element(by.text('Loading...')).or(by.text('%'))).toBeVisible();
  });

  it('should have bottom navigation', async () => {
    // Check for bottom navigation tabs
    await expect(element(by.text('Home')).or(by.text('Insights')).or(by.text('Profile'))).toBeVisible();
  });

  it('should have gamification elements', async () => {
    // Check for gamification bar elements
    await expect(element(by.text('View All Categories')).or(by.text('View Roadmap'))).toBeVisible();
  });
});
