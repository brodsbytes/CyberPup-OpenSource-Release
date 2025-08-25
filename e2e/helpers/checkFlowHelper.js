/**
 * Check Flow Helper for CyberPup E2E Tests
 * Handles navigation and completion of different check patterns
 */

import { SCREEN_NAMES } from '../../constants';

// Level 1 check flow order
export const LEVEL_1_CHECK_FLOW = [
  '1-1-1', // Strong Passwords (Pattern A Enhanced)
  '1-1-2', // High Value Accounts (Timeline Variant)
  '1-1-3', // Password Managers (Pattern B)
  '1-1-4', // MFA Setup (Pattern B)
  '1-1-5', // Breach Check (Pattern C)
  '1-2-1', // Screen Lock (Pattern B)
  '1-2-2', // Remote Lock (Wizard Variant)
  '1-2-3', // Device Updates (Wizard Variant)
  '1-2-4', // Bluetooth/WiFi (Wizard Variant)
  '1-2-5', // Public Charging (Pattern A Enhanced)
  '1-3-1', // Cloud Backup (Pattern B)
  '1-3-2', // Local Backup (Checklist Variant)
  '1-4-1', // Scam Recognition (Pattern C)
  '1-4-2', // Scam Reporting (Checklist Variant)
  '1-5-1', // Sharing Awareness (Pattern A Enhanced)
  '1-5-2', // Privacy Settings (Timeline Variant)
];

// Check pattern types
export const CHECK_PATTERNS = {
  '1-1-1': 'pattern-a-enhanced', // Strong Passwords
  '1-1-2': 'timeline-variant',   // High Value Accounts
  '1-1-3': 'pattern-b',          // Password Managers
  '1-1-4': 'pattern-b',          // MFA Setup
  '1-1-5': 'pattern-c',          // Breach Check
  '1-2-1': 'pattern-b',          // Screen Lock
  '1-2-2': 'wizard-variant',     // Remote Lock
  '1-2-3': 'wizard-variant',     // Device Updates
  '1-2-4': 'wizard-variant',     // Bluetooth/WiFi
  '1-2-5': 'pattern-a-enhanced', // Public Charging
  '1-3-1': 'pattern-b',          // Cloud Backup
  '1-3-2': 'checklist-variant',  // Local Backup
  '1-4-1': 'pattern-c',          // Scam Recognition
  '1-4-2': 'checklist-variant',  // Scam Reporting
  '1-5-1': 'pattern-a-enhanced', // Sharing Awareness
  '1-5-2': 'timeline-variant',   // Privacy Settings
};

// Screen name mapping
export const CHECK_SCREEN_MAPPING = {
  '1-1-1': SCREEN_NAMES.CHECK_1_1_1_STRONG_PASSWORDS,
  '1-1-2': SCREEN_NAMES.CHECK_1_1_2_HIGH_VALUE_ACCOUNTS,
  '1-1-3': SCREEN_NAMES.CHECK_1_1_3_PASSWORD_MANAGERS,
  '1-1-4': SCREEN_NAMES.CHECK_1_1_4_MFA_SETUP,
  '1-1-5': SCREEN_NAMES.CHECK_1_1_5_BREACH_CHECK,
  '1-2-1': SCREEN_NAMES.CHECK_1_2_1_SCREEN_LOCK,
  '1-2-2': SCREEN_NAMES.CHECK_1_2_2_REMOTE_LOCK,
  '1-2-3': SCREEN_NAMES.CHECK_1_2_3_DEVICE_UPDATES,
  '1-2-4': SCREEN_NAMES.CHECK_1_2_4_BLUETOOTH_WIFI,
  '1-2-5': SCREEN_NAMES.CHECK_1_2_5_PUBLIC_CHARGING,
  '1-3-1': SCREEN_NAMES.CHECK_1_3_1_CLOUD_BACKUP,
  '1-3-2': SCREEN_NAMES.CHECK_1_3_2_LOCAL_BACKUP,
  '1-4-1': SCREEN_NAMES.CHECK_1_4_1_SCAM_RECOGNITION,
  '1-4-2': SCREEN_NAMES.CHECK_1_4_2_SCAM_REPORTING,
  '1-5-1': SCREEN_NAMES.CHECK_1_5_1_SHARING_AWARENESS,
  '1-5-2': SCREEN_NAMES.CHECK_1_5_2_PRIVACY_SETTINGS,
};

/**
 * Complete a Pattern A Enhanced check (checklist-based)
 * @param {object} device - Detox device instance
 * @param {string} checkId - Check identifier
 */
export async function completePatternAEnhanced(device, checkId) {
  console.log(`Completing Pattern A Enhanced check: ${checkId}`);
  
  // Wait for screen to load
  await device.waitForElementByLabelText('Check Complete!').toBeVisible();
  
  // Find and complete all checklist items
  const checklistItems = await device.findElementsByLabelText(/^[A-Z].*$/);
  
  for (const item of checklistItems) {
    if (await item.isDisplayed()) {
      await item.tap();
      await device.wait(1000); // Wait for animation
    }
  }
  
  // Click "Complete Check" button
  await device.tapByLabelText('Complete Check');
  
  // Wait for completion popup
  await device.waitForElementByLabelText('Check Complete!').toBeVisible();
  
  // Click "Continue" to go to next check
  await device.tapByLabelText('Continue');
}

/**
 * Complete a Timeline Variant check
 * @param {object} device - Detox device instance
 * @param {string} checkId - Check identifier
 */
export async function completeTimelineVariant(device, checkId) {
  console.log(`Completing Timeline Variant check: ${checkId}`);
  
  // Wait for screen to load
  await device.waitForElementByLabelText('Timeline').toBeVisible();
  
  // Complete timeline milestones
  const milestones = await device.findElementsByLabelText(/Milestone \d+/);
  
  for (const milestone of milestones) {
    if (await milestone.isDisplayed()) {
      await milestone.tap();
      await device.wait(1000); // Wait for animation
    }
  }
  
  // Click "Continue" button
  await device.tapByLabelText('Continue');
  
  // Wait for completion popup
  await device.waitForElementByLabelText('Check Complete!').toBeVisible();
  
  // Click "Continue" to go to next check
  await device.tapByLabelText('Continue');
}

/**
 * Complete a Pattern B check (progressive action cards)
 * @param {object} device - Detox device instance
 * @param {string} checkId - Check identifier
 */
export async function completePatternB(device, checkId) {
  console.log(`Completing Pattern B check: ${checkId}`);
  
  // Wait for screen to load
  await device.waitForElementByLabelText('Action Cards').toBeVisible();
  
  // Complete all action cards
  const actionCards = await device.findElementsByLabelText(/Action Card \d+/);
  
  for (const card of actionCards) {
    if (await card.isDisplayed()) {
      // Tap the card to expand
      await card.tap();
      await device.wait(1000);
      
      // Complete the action (usually "I did it" button)
      const completeButton = await device.findElementByLabelText('I did it');
      if (await completeButton.isDisplayed()) {
        await completeButton.tap();
        await device.wait(1000);
      }
    }
  }
  
  // Click "Complete Task" button
  await device.tapByLabelText('Complete Task');
  
  // Wait for completion popup
  await device.waitForElementByLabelText('Check Complete!').toBeVisible();
  
  // Click "Continue" to go to next check
  await device.tapByLabelText('Continue');
}

/**
 * Complete a Wizard Variant check
 * @param {object} device - Detox device instance
 * @param {string} checkId - Check identifier
 */
export async function completeWizardVariant(device, checkId) {
  console.log(`Completing Wizard Variant check: ${checkId}`);
  
  // Wait for screen to load
  await device.waitForElementByLabelText('Wizard').toBeVisible();
  
  // Complete wizard steps
  let stepNumber = 1;
  let continueButton = await device.findElementByLabelText('Continue');
  
  while (await continueButton.isDisplayed()) {
    // Complete current step
    await device.wait(1000);
    
    // Look for step completion actions
    const stepActions = await device.findElementsByLabelText(/Step \d+ Action/);
    for (const action of stepActions) {
      if (await action.isDisplayed()) {
        await action.tap();
        await device.wait(500);
      }
    }
    
    // Click continue to next step
    await continueButton.tap();
    await device.wait(1000);
    
    // Check if we're on the final step
    const completeButton = await device.findElementByLabelText('Complete Task!');
    if (await completeButton.isDisplayed()) {
      await completeButton.tap();
      break;
    }
    
    stepNumber++;
  }
  
  // Wait for completion popup
  await device.waitForElementByLabelText('Check Complete!').toBeVisible();
  
  // Click "Continue" to go to next check
  await device.tapByLabelText('Continue');
}

/**
 * Complete a Checklist Variant check
 * @param {object} device - Detox device instance
 * @param {string} checkId - Check identifier
 */
export async function completeChecklistVariant(device, checkId) {
  console.log(`Completing Checklist Variant check: ${checkId}`);
  
  // Wait for screen to load
  await device.waitForElementByLabelText('Checklist').toBeVisible();
  
  // Complete all checklist items
  const checklistItems = await device.findElementsByLabelText(/Checklist Item \d+/);
  
  for (const item of checklistItems) {
    if (await item.isDisplayed()) {
      await item.tap();
      await device.wait(500);
    }
  }
  
  // Click "Complete Check" button
  await device.tapByLabelText('Complete Check');
  
  // Wait for completion popup
  await device.waitForElementByLabelText('Check Complete!').toBeVisible();
  
  // Click "Continue" to go to next check
  await device.tapByLabelText('Continue');
}

/**
 * Complete a Pattern C check (interactive validation flow)
 * @param {object} device - Detox device instance
 * @param {string} checkId - Check identifier
 */
export async function completePatternC(device, checkId) {
  console.log(`Completing Pattern C check: ${checkId}`);
  
  // Wait for screen to load
  await device.waitForElementByLabelText('Interactive Validation').toBeVisible();
  
  // Complete validation steps
  const validationSteps = await device.findElementsByLabelText(/Validation Step \d+/);
  
  for (const step of validationSteps) {
    if (await step.isDisplayed()) {
      // Complete the validation step
      await step.tap();
      await device.wait(1000);
      
      // Look for validation input or selection
      const input = await device.findElementByLabelText('Validation Input');
      if (await input.isDisplayed()) {
        await input.typeText('test@example.com');
        await device.wait(500);
      }
      
      // Click continue
      const continueButton = await device.findElementByLabelText('Continue');
      if (await continueButton.isDisplayed()) {
        await continueButton.tap();
        await device.wait(1000);
      }
    }
  }
  
  // Wait for completion popup
  await device.waitForElementByLabelText('Check Complete!').toBeVisible();
  
  // Click "Continue" to go to next check
  await device.tapByLabelText('Continue');
}

/**
 * Complete a specific check based on its pattern
 * @param {object} device - Detox device instance
 * @param {string} checkId - Check identifier
 */
export async function completeCheck(device, checkId) {
  const pattern = CHECK_PATTERNS[checkId];
  
  switch (pattern) {
    case 'pattern-a-enhanced':
      await completePatternAEnhanced(device, checkId);
      break;
    case 'timeline-variant':
      await completeTimelineVariant(device, checkId);
      break;
    case 'pattern-b':
      await completePatternB(device, checkId);
      break;
    case 'wizard-variant':
      await completeWizardVariant(device, checkId);
      break;
    case 'checklist-variant':
      await completeChecklistVariant(device, checkId);
      break;
    case 'pattern-c':
      await completePatternC(device, checkId);
      break;
    default:
      throw new Error(`Unknown pattern for check ${checkId}: ${pattern}`);
  }
}

/**
 * Navigate to a specific check screen
 * @param {object} device - Detox device instance
 * @param {string} checkId - Check identifier
 */
export async function navigateToCheck(device, checkId) {
  const screenName = CHECK_SCREEN_MAPPING[checkId];
  if (!screenName) {
    throw new Error(`Unknown check ID: ${checkId}`);
  }
  
  console.log(`Navigating to check: ${checkId} (${screenName})`);
  
  // Navigate to the check screen
  // This will be handled by the app's navigation system
  // We'll wait for the screen to load
  await device.waitForElementByLabelText(`Check ${checkId}`).toBeVisible();
}
