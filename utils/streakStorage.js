import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STREAK_STORAGE_KEY = 'user_streak_data';
const LAST_ACTIVITY_KEY = 'last_activity_date';

// Streak milestones for achievements
export const STREAK_MILESTONES = {
  3: { title: 'Getting Started', description: '3 day streak' },
  7: { title: 'Week Warrior', description: '7 day streak' },
  14: { title: 'Fortnight Fighter', description: '14 day streak' },
  30: { title: 'Monthly Master', description: '30 day streak' },
  60: { title: 'Dedicated Defender', description: '60 day streak' },
  100: { title: 'Century Champion', description: '100 day streak' },
  365: { title: 'Yearly Guardian', description: '365 day streak' }
};

// Get current streak data
export const getCurrentStreak = async () => {
  try {
    const streakData = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
    if (streakData) {
      return JSON.parse(streakData);
    }
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalDays: 0,
      lastActivityDate: null,
      streakHistory: []
    };
  } catch (error) {
    console.log('Error getting streak data:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalDays: 0,
      lastActivityDate: null,
      streakHistory: []
    };
  }
};

// Update streak when user completes an activity
export const updateStreak = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const currentStreakData = await getCurrentStreak();
    
    let { currentStreak, longestStreak, totalDays, lastActivityDate, streakHistory } = currentStreakData;
    
    // If this is the first activity or a new day
    if (!lastActivityDate || lastActivityDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // Check if user was active yesterday (maintain streak)
      if (lastActivityDate === yesterdayStr) {
        currentStreak += 1;
      } else if (lastActivityDate !== today) {
        // Streak broken, start new streak
        if (currentStreak > 0) {
          // Add to history before resetting
          streakHistory.push({
            streak: currentStreak,
            endDate: lastActivityDate,
            startDate: getStreakStartDate(lastActivityDate, currentStreak)
          });
        }
        currentStreak = 1;
      }
      
      // Update longest streak if current is longer
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
      
      // Increment total days if this is a new day
      if (lastActivityDate !== today) {
        totalDays += 1;
      }
      
      lastActivityDate = today;
    }
    
    const updatedStreakData = {
      currentStreak,
      longestStreak,
      totalDays,
      lastActivityDate,
      streakHistory
    };
    
    await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(updatedStreakData));
    return updatedStreakData;
  } catch (error) {
    console.log('Error updating streak:', error);
    return null;
  }
};

// Get streak start date (helper function)
const getStreakStartDate = (endDate, streakLength) => {
  const end = new Date(endDate);
  end.setDate(end.getDate() - streakLength + 1);
  return end.toISOString().split('T')[0];
};

// Get next milestone
export const getNextMilestone = (currentStreak) => {
  const milestones = Object.keys(STREAK_MILESTONES).map(Number).sort((a, b) => a - b);
  
  for (const milestone of milestones) {
    if (currentStreak < milestone) {
      return {
        days: milestone,
        ...STREAK_MILESTONES[milestone],
        daysRemaining: milestone - currentStreak
      };
    }
  }
  
  return null; // All milestones achieved
};

// Get streak statistics
export const getStreakStats = async () => {
  try {
    const streakData = await getCurrentStreak();
    const nextMilestone = getNextMilestone(streakData.currentStreak);
    
    return {
      ...streakData,
      nextMilestone,
      isOnFire: streakData.currentStreak >= 7, // "On fire" for 7+ days
      streakPercentage: nextMilestone ? (streakData.currentStreak / nextMilestone.days) * 100 : 100
    };
  } catch (error) {
    console.log('Error getting streak stats:', error);
    return null;
  }
};

// Reset streak (for testing)
export const resetStreak = async () => {
  try {
    await AsyncStorage.removeItem(STREAK_STORAGE_KEY);
    return true;
  } catch (error) {
    console.log('Error resetting streak:', error);
    return false;
  }
};

// Get streak emoji based on current streak
export const getStreakEmoji = (currentStreak) => {
  if (currentStreak === 0) return '🔥';
  if (currentStreak < 3) return '🔥';
  if (currentStreak < 7) return '🔥';
  if (currentStreak < 14) return '🔥';
  if (currentStreak < 30) return '🔥';
  if (currentStreak < 60) return '🔥';
  if (currentStreak < 100) return '🔥';
  return '🔥'; // All high streaks get the same emoji
};

// Check if streak should be updated (called when user completes a check)
export const checkAndUpdateStreak = async () => {
  try {
    const updatedStreak = await updateStreak();
    if (updatedStreak) {
      // Check if user reached a new milestone
      const milestones = Object.keys(STREAK_MILESTONES).map(Number);
      const reachedMilestone = milestones.includes(updatedStreak.currentStreak);
      
      return {
        streakData: updatedStreak,
        reachedMilestone,
        milestoneInfo: reachedMilestone ? STREAK_MILESTONES[updatedStreak.currentStreak] : null
      };
    }
    return null;
  } catch (error) {
    console.log('Error checking and updating streak:', error);
    return null;
  }
};
