import AsyncStorage from '@react-native-async-storage/async-storage';

// Badge types
export const BADGE_TYPES = {
  AREA: 'area',
  LEVEL: 'level',
  SPECIAL: 'special'
};

// Badge definitions
export const BADGES = {
  // Area badges (earned when completing all checks in an area)
  '1-1': {
    id: '1-1',
    type: BADGE_TYPES.AREA,
    name: 'Password Pro',
    description: 'Mastered password security and authentication',
    icon: '🔐',
    color: '#5BA3F0',
    unlockedAt: null
  },
  '1-2': {
    id: '1-2',
    type: BADGE_TYPES.AREA,
    name: 'Device Defender',
    description: 'Secured your devices and network',
    icon: '🛡️',
    color: '#27ae60',
    unlockedAt: null
  },
  '1-3': {
    id: '1-3',
    type: BADGE_TYPES.AREA,
    name: 'Data Guardian',
    description: 'Protected your data with proper backups',
    icon: '💾',
    color: '#9b59b6',
    unlockedAt: null
  },
  '1-4': {
    id: '1-4',
    type: BADGE_TYPES.AREA,
    name: 'Scam Spotter',
    description: 'Learned to identify and avoid scams',
    icon: '🎣',
    color: '#e74c3c',
    unlockedAt: null
  },
  '1-5': {
    id: '1-5',
    type: BADGE_TYPES.AREA,
    name: 'Privacy Guardian',
    description: 'Protected your online privacy',
    icon: '🔒',
    color: '#f39c12',
    unlockedAt: null
  },
  
  // Level badges (earned when completing all areas in a level)
  'level-1': {
    id: 'level-1',
    type: BADGE_TYPES.LEVEL,
    name: 'CyberPup Scout',
    description: 'Completed Level 1 - CyberPup Scout 🐾',
    icon: '🐾',
    color: '#5BA3F0',
    unlockedAt: null
  },
  // Level 2 and 3 badges are disabled until their content is implemented
  // 'level-2': {
  //   id: 'level-2',
  //   type: BADGE_TYPES.LEVEL,
  //   name: 'CyberPup Watchdog',
  //   description: 'Completed Level 2 - CyberPup Watchdog 👁️',
  //   icon: '👁️',
  //   color: '#27ae60',
  //   unlockedAt: null
  // },
  // 'level-3': {
  //   id: 'level-3',
  //   type: BADGE_TYPES.LEVEL,
  //   name: 'CyberPup Guardian',
  //   description: 'Completed Level 3 - CyberPup Guardian 🛡️',
  //   icon: '🛡️',
  //   color: '#e74c3c',
  //   unlockedAt: null
  // },
  
  // Special badges (earned for specific achievements)
  'first-check': {
    id: 'first-check',
    type: BADGE_TYPES.SPECIAL,
    name: 'First Steps',
    description: 'Completed your first security check',
    icon: '🌟',
    color: '#f39c12',
    unlockedAt: null
  },
  'breach-checker': {
    id: 'breach-checker',
    type: BADGE_TYPES.SPECIAL,
    name: 'Breach Detective',
    description: 'Checked for data breaches',
    icon: '🔍',
    color: '#e74c3c',
    unlockedAt: null
  },
  'password-manager': {
    id: 'password-manager',
    type: BADGE_TYPES.SPECIAL,
    name: 'Password Manager Pro',
    description: 'Set up a password manager',
    icon: '🗝️',
    color: '#9b59b6',
    unlockedAt: null
  }
};

// Storage keys
const BADGES_STORAGE_KEY = 'user_badges';
const BADGES_HISTORY_KEY = 'badges_earned_history';

// Get all badges
export const getAllBadges = () => {
  return Object.values(BADGES);
};

// Get badges by type
export const getBadgesByType = (type) => {
  return Object.values(BADGES).filter(badge => badge.type === type);
};

// Get a specific badge
export const getBadge = (badgeId) => {
  return BADGES[badgeId];
};

// Load user's earned badges from storage
export const loadUserBadges = async () => {
  try {
    const badgesData = await AsyncStorage.getItem(BADGES_STORAGE_KEY);
    if (badgesData) {
      const userBadges = JSON.parse(badgesData);
      // Merge with badge definitions and add unlockedAt timestamps
      return Object.keys(BADGES).map(badgeId => ({
        ...BADGES[badgeId],
        unlockedAt: userBadges[badgeId]?.unlockedAt || null,
        isEarned: !!userBadges[badgeId]?.unlockedAt
      }));
    }
    return Object.keys(BADGES).map(badgeId => ({
      ...BADGES[badgeId],
      unlockedAt: null,
      isEarned: false
    }));
  } catch (error) {
    console.log('Error loading user badges:', error);
    return Object.keys(BADGES).map(badgeId => ({
      ...BADGES[badgeId],
      unlockedAt: null,
      isEarned: false
    }));
  }
};

// Save user's earned badges to storage
export const saveUserBadges = async (userBadges) => {
  try {
    // Convert to storage format (only store earned badges with timestamps)
    const badgesToStore = {};
    userBadges.forEach(badge => {
      if (badge.isEarned && badge.unlockedAt) {
        badgesToStore[badge.id] = {
          unlockedAt: badge.unlockedAt
        };
      }
    });
    
    await AsyncStorage.setItem(BADGES_STORAGE_KEY, JSON.stringify(badgesToStore));
  } catch (error) {
    console.log('Error saving user badges:', error);
  }
};

// Unlock a badge
export const unlockBadge = async (badgeId) => {
  try {
    const userBadges = await loadUserBadges();
    const badgeIndex = userBadges.findIndex(badge => badge.id === badgeId);
    
    if (badgeIndex !== -1 && !userBadges[badgeIndex].isEarned) {
      const now = new Date().toISOString();
      userBadges[badgeIndex].unlockedAt = now;
      userBadges[badgeIndex].isEarned = true;
      
      await saveUserBadges(userBadges);
      
      // Add to history
      await addToBadgeHistory(badgeId, now);
      
      return userBadges[badgeIndex];
    }
    
    return null;
  } catch (error) {
    console.log('Error unlocking badge:', error);
    return null;
  }
};

// Check if a badge is earned
export const isBadgeEarned = async (badgeId) => {
  try {
    const userBadges = await loadUserBadges();
    const badge = userBadges.find(badge => badge.id === badgeId);
    return badge ? badge.isEarned : false;
  } catch (error) {
    console.log('Error checking badge status:', error);
    return false;
  }
};

// Get earned badges count
export const getEarnedBadgesCount = async () => {
  try {
    const userBadges = await loadUserBadges();
    return userBadges.filter(badge => badge.isEarned).length;
  } catch (error) {
    console.log('Error getting earned badges count:', error);
    return 0;
  }
};

// Get badges earned by type
export const getEarnedBadgesByType = async (type) => {
  try {
    const userBadges = await loadUserBadges();
    return userBadges.filter(badge => badge.type === type && badge.isEarned);
  } catch (error) {
    console.log('Error getting earned badges by type:', error);
    return [];
  }
};

// Add badge to history
export const addToBadgeHistory = async (badgeId, unlockedAt) => {
  try {
    const historyData = await AsyncStorage.getItem(BADGES_HISTORY_KEY);
    const history = historyData ? JSON.parse(historyData) : [];
    
    history.push({
      badgeId,
      unlockedAt,
      timestamp: new Date().toISOString()
    });
    
    await AsyncStorage.setItem(BADGES_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.log('Error adding to badge history:', error);
  }
};

// Get badge history
export const getBadgeHistory = async () => {
  try {
    const historyData = await AsyncStorage.getItem(BADGES_HISTORY_KEY);
    return historyData ? JSON.parse(historyData) : [];
  } catch (error) {
    console.log('Error getting badge history:', error);
    return [];
  }
};

// Check if area is completed and unlock area badge
export const checkAndUnlockAreaBadge = async (areaId) => {
  try {
    // Check if all checks in the area are completed
    const areaChecks = await getAreaChecks(areaId);
    const allCompleted = areaChecks.every(check => check.isCompleted);
    
    if (allCompleted) {
      const badgeId = areaId; // Area ID matches badge ID
      const badge = await unlockBadge(badgeId);
      return badge;
    }
    
    return null;
  } catch (error) {
    console.log('Error checking area badge:', error);
    return null;
  }
};

// Check if level is completed and unlock level badge
export const checkAndUnlockLevelBadge = async (levelId) => {
  try {
    // Check if all areas in the level are completed
    const levelAreas = await getLevelAreas(levelId);
    
    // If no areas are defined for a level, it cannot be completed
    if (levelAreas.length === 0) {
      return null;
    }
    
    const allCompleted = levelAreas.every(area => area.isCompleted);
    
    if (allCompleted) {
      const badgeId = `level-${levelId}`;
      const badge = await unlockBadge(badgeId);
      return badge;
    }
    
    return null;
  } catch (error) {
    console.log('Error checking level badge:', error);
    return null;
  }
};

// Helper function to get area checks
const getAreaChecks = async (areaId) => {
  try {
    // Define the checks for each area based on courseData.js
    const areaChecks = {
      '1-1': ['1-1-1', '1-1-2', '1-1-3', '1-1-4', '1-1-5'],
      '1-2': ['1-2-1', '1-2-2', '1-2-3', '1-2-4', '1-2-5'],
      '1-3': ['1-3-1', '1-3-2'],
      '1-4': ['1-4-1', '1-4-2'],
      '1-5': ['1-5-1', '1-5-2'],
    };
    
    const checkIds = areaChecks[areaId] || [];
    const checks = [];
    
    for (const checkId of checkIds) {
      // Use the correct key format that matches the progress management system
      const completed = await AsyncStorage.getItem(`check_${checkId}_completed`);
      checks.push({
        id: checkId,
        isCompleted: completed === 'completed'
      });
    }
    
    return checks;
  } catch (error) {
    console.log('Error getting area checks:', error);
    return [];
  }
};

// Helper function to get level areas
const getLevelAreas = async (levelId) => {
  try {
    // Define the areas for each level based on courseData.js
    const levelAreas = {
      '1': ['1-1', '1-2', '1-3', '1-4', '1-5'],
      // Levels 2 and 3 are disabled until their content is implemented
      // '2': [], // Level 2 areas not yet defined
      // '3': [], // Level 3 areas not yet defined
    };
    
    const areaIds = levelAreas[levelId] || [];
    
    // If no areas are defined for a level, it cannot be completed
    if (areaIds.length === 0) {
      return [];
    }
    
    const areas = [];
    
    for (const areaId of areaIds) {
      const checks = await getAreaChecks(areaId);
      const isCompleted = checks.length > 0 && checks.every(check => check.isCompleted);
      areas.push({
        id: areaId,
        isCompleted
      });
    }
    
    return areas;
  } catch (error) {
    console.log('Error getting level areas:', error);
    return [];
  }
};

// Check for badge unlocks when completing a check
export const checkForBadgeUnlocks = async (checkId) => {
  try {
    const unlockedBadges = [];
    
    // Check for first check badge
    if (checkId === '1-1-1') {
      const firstCheckBadge = await unlockBadge('first-check');
      if (firstCheckBadge) {
        unlockedBadges.push(firstCheckBadge);
      }
    }
    
    // Check for breach checker badge
    if (checkId === '1-1-5') {
      const breachBadge = await unlockBadge('breach-checker');
      if (breachBadge) {
        unlockedBadges.push(breachBadge);
      }
    }
    
    // Check for password manager badge
    if (checkId === '1-1-3') {
      const passwordManagerBadge = await unlockBadge('password-manager');
      if (passwordManagerBadge) {
        unlockedBadges.push(passwordManagerBadge);
      }
    }
    
    // Check for area badges
    const areaId = checkId.split('-').slice(0, 2).join('-');
    const areaBadge = await checkAndUnlockAreaBadge(areaId);
    if (areaBadge) {
      unlockedBadges.push(areaBadge);
    }
    
    // Check for level badges
    const levelId = checkId.split('-')[0];
    const levelBadge = await checkAndUnlockLevelBadge(levelId);
    if (levelBadge) {
      unlockedBadges.push(levelBadge);
    }
    
    return unlockedBadges;
  } catch (error) {
    console.log('Error checking for badge unlocks:', error);
    return [];
  }
};

// Clear all badges (for testing/reset)
export const clearAllBadges = async () => {
  try {
    await AsyncStorage.removeItem(BADGES_STORAGE_KEY);
    await AsyncStorage.removeItem(BADGES_HISTORY_KEY);
  } catch (error) {
    console.log('Error clearing badges:', error);
  }
};

// Refresh badges and check for new unlocks
export const refreshBadges = async () => {
  try {
    const unlockedBadges = [];
    
    // Check all area badges
    const areaIds = ['1-1', '1-2', '1-3', '1-4', '1-5'];
    for (const areaId of areaIds) {
      const areaBadge = await checkAndUnlockAreaBadge(areaId);
      if (areaBadge) {
        unlockedBadges.push(areaBadge);
      }
    }
    
    // Check level badges (only level 1 is enabled for now)
    const levelIds = ['1']; // Levels 2 and 3 are disabled until content is implemented
    for (const levelId of levelIds) {
      const levelBadge = await checkAndUnlockLevelBadge(levelId);
      if (levelBadge) {
        unlockedBadges.push(levelBadge);
      }
    }
    
    // Check special badges based on completed checks
    const specialCheckIds = ['1-1-1', '1-1-3', '1-1-5'];
    for (const checkId of specialCheckIds) {
      const completed = await AsyncStorage.getItem(`check_${checkId}_completed`);
      if (completed === 'completed') {
        let badgeId = null;
        if (checkId === '1-1-1') badgeId = 'first-check';
        else if (checkId === '1-1-3') badgeId = 'password-manager';
        else if (checkId === '1-1-5') badgeId = 'breach-checker';
        
        if (badgeId) {
          const badge = await unlockBadge(badgeId);
          if (badge) {
            unlockedBadges.push(badge);
          }
        }
      }
    }
    
    return unlockedBadges;
  } catch (error) {
    console.log('Error refreshing badges:', error);
    return [];
  }
};
