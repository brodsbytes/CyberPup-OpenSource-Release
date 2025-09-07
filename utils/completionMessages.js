import { SCREEN_NAMES } from '../constants';

// Completion messages for each check
const completionMessages = {
  '1-1-1': {
    title: 'Strong Passwords Complete!',
    description: 'You\'ve mastered the art of creating and managing strong passwords. Your accounts are now much more secure!'
  },
  '1-1-2': {
    title: 'High-Value Accounts Protected!',
    description: 'Excellent work securing your most important accounts. You\'ve taken a crucial step in protecting your digital life!'
  },
  '1-2-1': {
    title: 'Screen Lock Security Complete!',
    description: 'Your devices are now protected with proper screen locks. No unauthorized access to your personal information!'
  },
  '1-2-2': {
    title: 'Remote Lock Setup Complete!',
    description: 'You can now remotely lock your devices if they\'re lost or stolen. Your data stays safe even when you\'re not around!'
  },
  '1-2-3': {
    title: 'Device Updates Complete!',
    description: 'Your devices are now set to receive important security updates automatically. Stay protected against the latest threats!'
  },
  '1-2-4': {
    title: 'Bluetooth & WiFi Security Complete!',
    description: 'You\'ve secured your wireless connections and protected yourself from potential attacks. Smart connectivity habits!'
  },
  '1-2-5': {
    title: 'Public Charging Security Complete!',
    description: 'You\'re now protected against juice jacking attacks. Charge safely anywhere without risking your data!'
  },
  '1-3-1': {
    title: 'Cloud Backup Setup Complete!',
    description: 'Your important data is now safely backed up to the cloud. Never lose your precious files again!'
  },
  '1-3-2': {
    title: 'Local Backup Setup Complete!',
    description: 'You have a reliable local backup system in place. Your data is protected with the 3-2-1 backup strategy!'
  },
  '1-1-3': {
    title: 'Password Manager Setup Complete!',
    description: 'You\'re now using a password manager to generate and store strong, unique passwords. Security made simple!'
  },
  '1-4-1': {
    title: 'Scam Recognition Complete!',
    description: 'You\'ve sharpened your scam detection skills. You can now spot and avoid fraudulent attempts with confidence!'
  },
  '1-4-2': {
    title: 'Scam Reporting Complete!',
    description: 'You know how to report scams and help protect others. Your knowledge could save someone from financial loss!'
  },
  '1-1-4': {
    title: 'MFA Setup Complete!',
    description: 'Multi-factor authentication is now protecting your accounts. Even if someone gets your password, they can\'t access your accounts!'
  },
  '1-5-1': {
    title: 'Sharing Awareness Complete!',
    description: 'You\'ve developed smart sharing habits to protect your privacy. Your personal information stays private!'
  },
  '1-5-2': {
    title: 'Privacy Settings Complete!',
    description: 'You\'ve taken control of your digital privacy across all platforms. Your personal information is now properly protected!'
  },
  '1-1-5': {
    title: 'Breach Check Complete!',
    description: 'You\'ve checked your accounts for potential breaches and know how to respond if your data is compromised!'
  }
};

// Next screen navigation mapping
const nextScreenMapping = {
  // Area 1-1: Account Security (1-1-1 → 1-1-2 → 1-1-3 → 1-1-4 → 1-1-5)
  '1-1-1': SCREEN_NAMES.CHECK_1_1_2_HIGH_VALUE_ACCOUNTS,
  '1-1-2': SCREEN_NAMES.CHECK_1_1_3_PASSWORD_MANAGERS,
  '1-1-3': SCREEN_NAMES.CHECK_1_1_4_MFA_SETUP,
  '1-1-4': SCREEN_NAMES.CHECK_1_1_5_BREACH_CHECK,
  
  // Area 1-2: Device Security (1-2-1 → 1-2-2 → 1-2-3 → 1-2-4 → 1-2-5)
  '1-2-1': SCREEN_NAMES.CHECK_1_2_2_REMOTE_LOCK,
  '1-2-2': SCREEN_NAMES.CHECK_1_2_3_DEVICE_UPDATES,
  '1-2-3': SCREEN_NAMES.CHECK_1_2_4_BLUETOOTH_WIFI,
  '1-2-4': SCREEN_NAMES.CHECK_1_2_5_PUBLIC_CHARGING,
  
  // Area 1-3: Data Protection (1-3-1 → 1-3-2)
  '1-3-1': SCREEN_NAMES.CHECK_1_3_2_LOCAL_BACKUP,
  
  // Area 1-4: Scam Defense (1-4-1 → 1-4-2)
  '1-4-1': SCREEN_NAMES.CHECK_1_4_2_SCAM_REPORTING,
  
  // Area 1-5: Privacy Protection (1-5-1 → 1-5-2)
  '1-5-1': SCREEN_NAMES.CHECK_1_5_2_PRIVACY_SETTINGS,
  
  // Area completion transitions (last check in each area → first check of next area)
  '1-1-5': SCREEN_NAMES.CHECK_1_2_1_SCREEN_LOCK, // Area 1-1 complete → start Area 1-2
  '1-2-5': SCREEN_NAMES.CHECK_1_3_1_CLOUD_BACKUP, // Area 1-2 complete → start Area 1-3
  '1-3-2': SCREEN_NAMES.CHECK_1_4_1_SCAM_RECOGNITION, // Area 1-3 complete → start Area 1-4
  '1-4-2': SCREEN_NAMES.CHECK_1_5_1_SHARING_AWARENESS, // Area 1-4 complete → start Area 1-5
  '1-5-2': SCREEN_NAMES.LEVEL_COMPLETION // All Level 1 areas complete → level completion screen
};

/**
 * Get completion message for a specific check
 * @param {string} checkId - The check identifier (e.g., '1-1-1', '1-2-1')
 * @returns {Object} Object containing title and description
 */
export const getCompletionMessage = (checkId) => {
  return completionMessages[checkId] || {
    title: 'Check Complete!',
    description: 'Great job completing this security check!'
  };
};

/**
 * Get the next screen name for a specific check
 * @param {string} checkId - The check identifier (e.g., '1-1-1', '1-2-1')
 * @returns {string} The next screen name to navigate to
 */
export const getNextScreenName = (checkId) => {
  return nextScreenMapping[checkId] || SCREEN_NAMES.WELCOME;
};

/**
 * Get all completion messages
 * @returns {Object} All completion messages
 */
export const getAllCompletionMessages = () => {
  return completionMessages;
};

/**
 * Get all next screen mappings
 * @returns {Object} All next screen mappings
 */
export const getAllNextScreenMappings = () => {
  return nextScreenMapping;
};

/**
 * Check if a check is the last check in its area
 * @param {string} checkId - The check identifier (e.g., '1-1-1', '1-2-1')
 * @returns {boolean} True if this is the last check in the area
 */
export const isLastCheckInArea = (checkId) => {
  // Define the last check in each area
  const lastChecksInAreas = {
    '1-1': '1-1-5', // Account Security - ends with breach check
    '1-2': '1-2-5', // Device Security - ends with public charging
    '1-3': '1-3-2', // Data Protection - ends with local backup
    '1-4': '1-4-2', // Scam Defense - ends with scam reporting
    '1-5': '1-5-2', // Privacy Protection - ends with privacy settings
  };
  
  // Extract area ID from check ID (e.g., '1-1-1' -> '1-1')
  const areaId = checkId.substring(0, 3);
  const lastCheckInArea = lastChecksInAreas[areaId];
  
  return checkId === lastCheckInArea;
};

/**
 * Get the area ID for a given check
 * @param {string} checkId - The check identifier (e.g., '1-1-1', '1-2-1')
 * @returns {string} The area ID (e.g., '1-1', '1-2')
 */
export const getAreaIdFromCheckId = (checkId) => {
  // Extract area ID from check ID (e.g., '1-1-1' -> '1-1')
  return checkId.substring(0, 3);
};

/**
 * Get the next area ID after completing an area
 * @param {string} areaId - The completed area ID (e.g., '1-1', '1-2')
 * @returns {string|null} The next area ID or null if no next area
 */
export const getNextAreaId = (areaId) => {
  const areaSequence = ['1-1', '1-2', '1-3', '1-4', '1-5'];
  const currentIndex = areaSequence.indexOf(areaId);
  
  if (currentIndex === -1 || currentIndex === areaSequence.length - 1) {
    return null; // No next area
  }
  
  return areaSequence[currentIndex + 1];
};

/**
 * Check if this is the last check in the entire level
 * @param {string} checkId - The check identifier
 * @returns {boolean} True if this is the last check in the level
 */
export const isLastCheckInLevel = (checkId) => {
  // For now, we only have Level 1, so check if it's the last check (1-5-2)
  return checkId === '1-5-2';
};

/**
 * Determine if navigation should go to AreaCompletionScreen, LevelCompletionScreen, or next check
 * @param {string} checkId - The completed check ID
 * @returns {Object} Navigation info with type and target
 */
export const getCompletionNavigation = (checkId) => {
  if (isLastCheckInLevel(checkId)) {
    // This is the last check in the level, show level completion screen
    const levelId = parseInt(checkId.split('-')[0]);
    return {
      type: 'level_completion',
      target: SCREEN_NAMES.LEVEL_COMPLETION,
      params: { completedLevelId: levelId }
    };
  } else if (isLastCheckInArea(checkId)) {
    // This is the last check in the area, show area completion screen
    const areaId = getAreaIdFromCheckId(checkId);
    return {
      type: 'area_completion',
      target: SCREEN_NAMES.AREA_COMPLETION,
      params: { completedAreaId: areaId }
    };
  } else {
    // This is not the last check, go to next check
    return {
      type: 'next_check',
      target: getNextScreenName(checkId),
      params: {}
    };
  }
};
