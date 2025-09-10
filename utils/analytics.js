/**
 * PostHog Analytics Service - Provider-based approach
 * Privacy-first analytics implementation with user consent and anonymization
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { cyberPupLogger, LOG_CATEGORIES } from './logger';

// Storage keys
const STORAGE_KEYS = {
  ANALYTICS_CONSENT: 'analytics_consent',
  ANALYTICS_USER_ID: 'analytics_user_id',
  ANALYTICS_OPT_OUT: 'analytics_opt_out',
};

// Event categories for organization
export const ANALYTICS_EVENTS = {
  // User Engagement
  SCREEN_VIEW: 'screen_view',
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  TIME_ON_SCREEN: 'time_on_screen',
  
  // Feature Usage
  SECURITY_CHECK_STARTED: 'security_check_started',
  SECURITY_CHECK_COMPLETED: 'security_check_completed',
  SECURITY_CHECK_SKIPPED: 'security_check_skipped',
  TOOL_OPENED: 'tool_opened',
  GUIDE_VIEWED: 'guide_viewed',
  BREACH_CHECK_PERFORMED: 'breach_check_performed',
  
  // Learning Progress
  LESSON_STARTED: 'lesson_started',
  LESSON_COMPLETED: 'lesson_completed',
  LESSON_SKIPPED: 'lesson_skipped',
  QUIZ_ATTEMPTED: 'quiz_attempted',
  QUIZ_COMPLETED: 'quiz_completed',
  
  // Performance
  APP_CRASH: 'app_crash',
  LOAD_TIME: 'load_time',
  ERROR_OCCURRED: 'error_occurred',
  
  // Privacy & Consent
  ANALYTICS_CONSENT_GIVEN: 'analytics_consent_given',
  ANALYTICS_CONSENT_DENIED: 'analytics_consent_denied',
  ANALYTICS_OPT_OUT: 'analytics_opt_out',
};

class AnalyticsService {
  constructor() {
    this.isInitialized = false;
    this.isEnabled = false;
    this.anonymousUserId = null;
    this.sessionStartTime = null;
    this.screenStartTime = null;
    this.currentScreen = null;
    this.posthog = null;
  }

  /**
   * Set PostHog instance from provider
   */
  setPostHogInstance(posthogInstance) {
    this.posthog = posthogInstance;
    cyberPupLogger.info(LOG_CATEGORIES.GENERAL, 'PostHog instance set from provider');
  }

  /**
   * Initialize analytics with user consent
   */
  async initialize() {
    try {
      cyberPupLogger.info(LOG_CATEGORIES.GENERAL, 'Starting PostHog analytics initialization...');

      // Check if user has opted out
      const hasOptedOut = await this.hasUserOptedOut();
      if (hasOptedOut) {
        cyberPupLogger.info(LOG_CATEGORIES.GENERAL, 'Analytics disabled - user opted out');
        return;
      }

      // Check consent status
      const consentStatus = await this.getConsentStatus();
      cyberPupLogger.info(LOG_CATEGORIES.GENERAL, `Consent status: ${consentStatus || 'not set'}`);
      
      if (consentStatus === 'denied') {
        cyberPupLogger.info(LOG_CATEGORIES.GENERAL, 'Analytics disabled - user denied consent');
        return;
      }

      if (consentStatus !== 'granted') {
        cyberPupLogger.info(LOG_CATEGORIES.GENERAL, 'Analytics initialization skipped - consent not granted yet');
        return;
      }

      // Generate anonymous user ID
      this.anonymousUserId = await this.getOrCreateAnonymousUserId();
      cyberPupLogger.info(LOG_CATEGORIES.GENERAL, `Generated user ID: ${this.anonymousUserId}`);

      // Identify user with PostHog if available
      if (this.posthog) {
        this.posthog.identify(this.anonymousUserId, {
          platform: Platform.OS,
          app_version: '1.0.0',
          anonymous: true,
          consent_given: true,
        });
        cyberPupLogger.info(LOG_CATEGORIES.GENERAL, 'PostHog.identify completed');
      }

      this.isInitialized = true;
      this.isEnabled = true;
      
      cyberPupLogger.info(LOG_CATEGORIES.GENERAL, '✅ PostHog analytics initialized successfully');
      
    } catch (error) {
      cyberPupLogger.error(LOG_CATEGORIES.GENERAL, 'Failed to initialize PostHog analytics', {
        error: error.message,
        stack: error.stack
      });
      this.isInitialized = false;
      this.isEnabled = false;
    }
  }

  /**
   * Track an event
   */
  trackEvent(eventName, eventProperties = {}) {
    cyberPupLogger.info(LOG_CATEGORIES.GENERAL, `Attempting to track event: ${eventName}`, {
      isEnabled: this.isEnabled,
      isInitialized: this.isInitialized,
      anonymousUserId: this.anonymousUserId
    });

    if (!this.isEnabled || !this.isInitialized) {
      cyberPupLogger.warn(LOG_CATEGORIES.GENERAL, `Event tracking skipped: ${eventName}`, {
        reason: !this.isEnabled ? 'Analytics disabled' : 'Analytics not initialized'
      });
      return;
    }

    if (!this.posthog) {
      cyberPupLogger.warn(LOG_CATEGORIES.GENERAL, `Event tracking skipped: ${eventName}`, {
        reason: 'PostHog instance not available'
      });
      return;
    }

    try {
      // Add common properties
      const enrichedProperties = {
        ...eventProperties,
        anonymous_user_id: this.anonymousUserId,
        platform: Platform.OS,
        timestamp: new Date().toISOString(),
      };

      this.posthog.capture(eventName, enrichedProperties);
      cyberPupLogger.info(LOG_CATEGORIES.GENERAL, `✅ Analytics event tracked: ${eventName}`, eventProperties);

      // Force flush to ensure event is sent
      setTimeout(() => {
        this.flush().catch(err => {
          cyberPupLogger.warn(LOG_CATEGORIES.GENERAL, 'Failed to flush analytics events', { error: err.message });
        });
      }, 1000);

    } catch (error) {
      cyberPupLogger.error(LOG_CATEGORIES.GENERAL, `Failed to track event: ${eventName}`, {
        error: error.message,
        eventProperties
      });
    }
  }

  /**
   * Flush events to PostHog
   */
  async flush() {
    if (!this.isEnabled || !this.isInitialized || !this.posthog) {
      cyberPupLogger.warn(LOG_CATEGORIES.GENERAL, 'Cannot flush - analytics not enabled or initialized');
      return;
    }

    try {
      await this.posthog.flush();
      cyberPupLogger.info(LOG_CATEGORIES.GENERAL, '🚀 Analytics events flushed to PostHog');
    } catch (error) {
      cyberPupLogger.error(LOG_CATEGORIES.GENERAL, 'Failed to flush analytics events', {
        error: error.message
      });
    }
  }

  /**
   * Set user consent
   */
  async setConsent(granted) {
    try {
      const consentValue = granted ? 'granted' : 'denied';
      await AsyncStorage.setItem(STORAGE_KEYS.ANALYTICS_CONSENT, consentValue);
      
      // If consent is granted, clear any previous opt-out
      if (granted) {
        await AsyncStorage.removeItem(STORAGE_KEYS.ANALYTICS_OPT_OUT);
        cyberPupLogger.info(LOG_CATEGORIES.GENERAL, 'Analytics consent granted - cleared opt-out flag');
      }
      
      cyberPupLogger.info(LOG_CATEGORIES.GENERAL, `Analytics consent ${granted ? 'granted' : 'denied'}`);
      
      if (granted) {
        // Initialize analytics after consent is given
        await this.initialize();
        this.trackEvent(ANALYTICS_EVENTS.ANALYTICS_CONSENT_GIVEN, {
          consent_timestamp: new Date().toISOString(),
        });
      } else {
        this.isEnabled = false;
        this.trackEvent(ANALYTICS_EVENTS.ANALYTICS_CONSENT_DENIED, {
          consent_timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      cyberPupLogger.error(LOG_CATEGORIES.GENERAL, 'Failed to set analytics consent', {
        error: error.message
      });
    }
  }

  /**
   * Get consent status
   */
  async getConsentStatus() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ANALYTICS_CONSENT);
    } catch (error) {
      cyberPupLogger.error(LOG_CATEGORIES.GENERAL, 'Failed to get consent status', {
        error: error.message
      });
      return null;
    }
  }

  /**
   * Check if user has opted out
   */
  async hasUserOptedOut() {
    try {
      const optOut = await AsyncStorage.getItem(STORAGE_KEYS.ANALYTICS_OPT_OUT);
      return optOut === 'true';
    } catch (error) {
      cyberPupLogger.error(LOG_CATEGORIES.GENERAL, 'Failed to check opt-out status', {
        error: error.message
      });
      return false;
    }
  }

  /**
   * Opt out of analytics
   */
  async optOut() {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ANALYTICS_OPT_OUT, 'true');
      this.isEnabled = false;
      
      cyberPupLogger.info(LOG_CATEGORIES.GENERAL, 'User opted out of analytics');
      this.trackEvent(ANALYTICS_EVENTS.ANALYTICS_OPT_OUT, {
        opt_out_timestamp: new Date().toISOString(),
      });
    } catch (error) {
      cyberPupLogger.error(LOG_CATEGORIES.GENERAL, 'Failed to opt out of analytics', {
        error: error.message
      });
    }
  }

  /**
   * Generate or retrieve anonymous user ID
   */
  async getOrCreateAnonymousUserId() {
    try {
      let userId = await AsyncStorage.getItem(STORAGE_KEYS.ANALYTICS_USER_ID);
      
      if (!userId) {
        // Generate a new anonymous ID
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        userId = `anon_${timestamp}_${random}`;
        
        await AsyncStorage.setItem(STORAGE_KEYS.ANALYTICS_USER_ID, userId);
        cyberPupLogger.info(LOG_CATEGORIES.GENERAL, `Generated new anonymous user ID: ${userId}`);
      }
      
      return userId;
    } catch (error) {
      cyberPupLogger.error(LOG_CATEGORIES.GENERAL, 'Failed to get or create anonymous user ID', {
        error: error.message
      });
      // Fallback to a simple ID
      return `anon_${Date.now()}_fallback`;
    }
  }

}

// Create singleton instance
export const analyticsService = new AnalyticsService();

// Convenience functions for easy use
export const trackEvent = (eventName, properties) => {
  analyticsService.trackEvent(eventName, properties);
};

export const trackScreenView = (screenName, properties = {}) => {
  analyticsService.trackEvent(ANALYTICS_EVENTS.SCREEN_VIEW, {
    screen_name: screenName,
    ...properties
  });
};

export const trackSecurityCheck = (checkId, action, properties = {}) => {
  const eventName = action === 'started' ? ANALYTICS_EVENTS.SECURITY_CHECK_STARTED : ANALYTICS_EVENTS.SECURITY_CHECK_COMPLETED;
  analyticsService.trackEvent(eventName, {
    check_id: checkId,
    action,
    ...properties
  });
};

export const trackLessonProgress = (lessonId, action, properties = {}) => {
  const eventName = action === 'started' ? ANALYTICS_EVENTS.LESSON_STARTED : ANALYTICS_EVENTS.LESSON_COMPLETED;
  analyticsService.trackEvent(eventName, {
    lesson_id: lessonId,
    action,
    ...properties
  });
};

export const trackPerformance = (metricName, value, properties = {}) => {
  analyticsService.trackEvent(ANALYTICS_EVENTS.LOAD_TIME, {
    metric_name: metricName,
    metric_value: value,
    ...properties
  });
};

export const trackError = (error, properties = {}) => {
  analyticsService.trackEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
    error_type: error.name || 'Unknown',
    error_message: error.message || 'Unknown error',
    error_code: error.code || null,
    ...properties
  });
};

export const trackToolUsage = (toolName, action, properties = {}) => {
  analyticsService.trackEvent(ANALYTICS_EVENTS.TOOL_OPENED, {
    tool_name: toolName,
    action,
    ...properties
  });
};

export const trackGuideView = (guideTitle, properties = {}) => {
  analyticsService.trackEvent(ANALYTICS_EVENTS.GUIDE_VIEWED, {
    guide_title: guideTitle,
    ...properties
  });
};

export const trackBadgeEarned = (badgeName, properties = {}) => {
  analyticsService.trackEvent('badge_earned', {
    badge_name: badgeName,
    ...properties
  });
};

export default analyticsService;
