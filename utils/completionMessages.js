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
  '1-1-1': SCREEN_NAMES.CHECK_1_1_2_HIGH_VALUE_ACCOUNTS,
  '1-1-2': SCREEN_NAMES.CHECK_1_2_1_SCREEN_LOCK,
  '1-2-1': SCREEN_NAMES.CHECK_1_2_2_REMOTE_LOCK,
  '1-2-2': SCREEN_NAMES.CHECK_1_2_3_DEVICE_UPDATES,
  '1-2-3': SCREEN_NAMES.CHECK_1_2_4_BLUETOOTH_WIFI,
  '1-2-4': SCREEN_NAMES.CHECK_1_2_5_PUBLIC_CHARGING,
  '1-2-5': SCREEN_NAMES.CHECK_1_3_1_CLOUD_BACKUP,
  '1-3-1': SCREEN_NAMES.CHECK_1_3_2_LOCAL_BACKUP,
  '1-3-2': SCREEN_NAMES.CHECK_1_1_3_PASSWORD_MANAGERS,
  '1-1-3': SCREEN_NAMES.CHECK_1_1_4_MFA_SETUP,
  '1-1-4': SCREEN_NAMES.CHECK_1_1_5_BREACH_CHECK,
  '1-4-1': SCREEN_NAMES.CHECK_1_4_2_SCAM_REPORTING,
  '1-4-2': SCREEN_NAMES.CHECK_1_5_1_SHARING_AWARENESS,
  '1-5-1': SCREEN_NAMES.CHECK_1_5_2_PRIVACY_SETTINGS,
  '1-5-2': SCREEN_NAMES.CHECK_1_1_5_BREACH_CHECK,
  '1-1-5': SCREEN_NAMES.WELCOME // Last check goes back to welcome
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
