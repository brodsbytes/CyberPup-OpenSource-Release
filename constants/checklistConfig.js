/**
 * Checklist Configuration
 * 
 * This file contains configuration options for different checklist screens
 * to enable consistent sequential expansion behavior across the app.
 */

export const CHECKLIST_CONFIGS = {
  // Check 1.1.1 - Strong Passwords (InteractiveChecklist - A Enhanced)
  '1-1-1': {
    enableSequentialExpansion: true,
    expansionOrder: 'original',
    autoExpandFirst: true
  },
  
  // Check 1.2.5 - Public Charging (InteractiveChecklist - A Enhanced)
  '1-2-5': {
    enableSequentialExpansion: true,
    expansionOrder: 'original',
    autoExpandFirst: true
  },
  
  // Check 1.3.2 - Local Backup (InteractiveChecklist - A Enhanced)
  '1-3-2': {
    enableSequentialExpansion: true,
    expansionOrder: 'original',
    autoExpandFirst: true
  },
  
  // Check 1.4.2 - Scam Reporting (InteractiveChecklist - A Enhanced)
  '1-4-2': {
    enableSequentialExpansion: true,
    expansionOrder: 'original',
    autoExpandFirst: true
  },
  
  // Check 1.5.1 - Sharing Awareness (InteractiveChecklist - A Enhanced)
  '1-5-1': {
    enableSequentialExpansion: true,
    expansionOrder: 'original',
    autoExpandFirst: true
  },
  
  // Check 1.1.2 - High Value Accounts (uses TimelineDashboard, not InteractiveChecklist)
  '1-1-2': {
    enableSequentialExpansion: false, // Not applicable for TimelineDashboard
    expansionOrder: 'original'
  },
  
  // Check 1.2.1 - Screen Lock (uses WizardFlow, not InteractiveChecklist)
  '1-2-1': {
    enableSequentialExpansion: false, // Not applicable for WizardFlow
    expansionOrder: 'original'
  },
  
  // Check 1.4.1 - Scam Recognition (uses InteractiveValidationFlow, not InteractiveChecklist)
  '1-4-1': {
    enableSequentialExpansion: false, // Not applicable for InteractiveValidationFlow
    expansionOrder: 'original'
  },
  
  
  // Default configuration for any checklist screen
  'default': {
    enableSequentialExpansion: false,
    expansionOrder: 'original',
    autoExpandFirst: false
  }
};

/**
 * Get configuration for a specific check ID
 * @param {string} checkId - The check ID (e.g., '1-1-1')
 * @returns {Object} Configuration object
 */
export const getChecklistConfig = (checkId) => {
  return CHECKLIST_CONFIGS[checkId] || CHECKLIST_CONFIGS['default'];
};

/**
 * Get configuration for enhanced variant (backward compatibility)
 * @returns {Object} Configuration object for enhanced variant
 */
export const getEnhancedConfig = () => {
  return {
    enableSequentialExpansion: true,
    expansionOrder: 'original',
    autoExpandFirst: true
  };
};
