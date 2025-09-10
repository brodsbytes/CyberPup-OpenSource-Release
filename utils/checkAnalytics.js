/**
 * Simple Check Analytics Helper
 * Provides basic progress tracking for security check screens
 * Works with existing completion storage without requiring specific component knowledge
 */

import { trackEvent } from './analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check progress states
export const CHECK_STATES = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress', 
  COMPLETED: 'completed'
};

/**
 * Track check screen view
 */
export const trackCheckScreenView = (checkId, checkName, level = 1, category = 'general') => {
  trackEvent('check_screen_viewed', {
    check_id: checkId,
    check_name: checkName,
    level: level,
    category: category,
    timestamp: new Date().toISOString()
  });
};

/**
 * Track check progress change
 * This works with the existing completion storage system
 */
export const trackCheckProgress = async (checkId, checkName, level = 1, category = 'general') => {
  try {
    // Check current completion status from existing storage
    const completionKey = `check_${checkId}_completed`;
    const isCompleted = await AsyncStorage.getItem(completionKey);
    
    // Determine current state
    let currentState = CHECK_STATES.NOT_STARTED;
    if (isCompleted === 'completed') {
      currentState = CHECK_STATES.COMPLETED;
    } else {
      // Check if there's any progress data
      const progressKey = `check_${checkId}_progress`;
      const progressData = await AsyncStorage.getItem(progressKey);
      if (progressData) {
        currentState = CHECK_STATES.IN_PROGRESS;
      }
    }
    
    // Track the progress state
    trackEvent('check_progress_updated', {
      check_id: checkId,
      check_name: checkName,
      level: level,
      category: category,
      progress_state: currentState,
      timestamp: new Date().toISOString()
    });
    
    return currentState;
  } catch (error) {
    console.error('Error tracking check progress:', error);
    return CHECK_STATES.NOT_STARTED;
  }
};

/**
 * Track check completion
 * This is called when a check is marked as completed
 */
export const trackCheckCompletion = (checkId, checkName, level = 1, category = 'general') => {
  trackEvent('check_completed', {
    check_id: checkId,
    check_name: checkName,
    level: level,
    category: category,
    completion_timestamp: new Date().toISOString()
  });
};

/**
 * Get check analytics data for a specific check
 */
export const getCheckAnalyticsData = async (checkId) => {
  try {
    const completionKey = `check_${checkId}_completed`;
    const progressKey = `check_${checkId}_progress`;
    
    const [isCompleted, progressData] = await AsyncStorage.multiGet([completionKey, progressKey]);
    
    return {
      isCompleted: isCompleted[1] === 'completed',
      hasProgress: !!progressData[1],
      progressData: progressData[1] ? JSON.parse(progressData[1]) : null
    };
  } catch (error) {
    console.error('Error getting check analytics data:', error);
    return {
      isCompleted: false,
      hasProgress: false,
      progressData: null
    };
  }
};
