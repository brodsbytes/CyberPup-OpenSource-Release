/**
 * CyberPup Debug Logger
 * 
 * Centralized logging utility for debugging during development and testing.
 * Provides structured logging with filtering, file output, and remote debugging capabilities.
 */

import { logger as RNLogger } from 'react-native-logs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Log levels
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn', 
  INFO: 'info',
  DEBUG: 'debug',
  TRACE: 'trace'
};

// Log categories for filtering
export const LOG_CATEGORIES = {
  NAVIGATION: 'navigation',
  STORAGE: 'storage',
  API: 'api',
  VALIDATION: 'validation',
  GAMIFICATION: 'gamification',
  SECURITY: 'security',
  PERFORMANCE: 'performance',
  UI: 'ui',
  GENERAL: 'general'
};

// Configuration
const LOG_CONFIG = {
  severity: __DEV__ ? 'debug' : 'warn', // Only show warnings/errors in production
  transport: __DEV__ ? console.log : console.log, // Always use console.log, but severity controls what shows
  transportOptions: {
    colors: {
      info: 'blue',
      warn: 'yellow',
      error: 'red',
      debug: 'green',
      trace: 'gray'
    }
  },
  async: true,
  dateFormat: 'time',
  printLevel: true,
  printDate: true,
  enabled: true
};

// Create logger instance
const logger = RNLogger.createLogger(LOG_CONFIG);

// Log storage for debugging
const LOG_STORAGE_KEY = 'cyberpup_debug_logs';
const MAX_STORED_LOGS = 1000; // Keep last 1000 log entries

/**
 * Enhanced logger with category filtering and storage
 */
export class CyberPupLogger {
  constructor() {
    this.enabledCategories = new Set(Object.values(LOG_CATEGORIES));
    this.logHistory = [];
    this.isEnabled = true;
  }

  /**
   * Enable/disable specific log categories
   * @param {Array<string>} categories - Categories to enable
   */
  enableCategories(categories) {
    this.enabledCategories = new Set(categories);
  }

  /**
   * Enable/disable all logging
   * @param {boolean} enabled - Whether logging is enabled
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  /**
   * Log an error message
   * @param {string} category - Log category
   * @param {string} message - Log message
   * @param {Object} data - Additional data to log
   */
  error(category, message, data = null) {
    this._log(LOG_LEVELS.ERROR, category, message, data);
  }

  /**
   * Log a warning message
   * @param {string} category - Log category
   * @param {string} message - Log message
   * @param {Object} data - Additional data to log
   */
  warn(category, message, data = null) {
    this._log(LOG_LEVELS.WARN, category, message, data);
  }

  /**
   * Log an info message
   * @param {string} category - Log category
   * @param {string} message - Log message
   * @param {Object} data - Additional data to log
   */
  info(category, message, data = null) {
    this._log(LOG_LEVELS.INFO, category, message, data);
  }

  /**
   * Log a debug message
   * @param {string} category - Log category
   * @param {string} message - Log message
   * @param {Object} data - Additional data to log
   */
  debug(category, message, data = null) {
    this._log(LOG_LEVELS.DEBUG, category, message, data);
  }

  /**
   * Log a trace message (most verbose)
   * @param {string} category - Log category
   * @param {string} message - Log message
   * @param {Object} data - Additional data to log
   */
  trace(category, message, data = null) {
    this._log(LOG_LEVELS.TRACE, category, message, data);
  }

  /**
   * Internal logging method
   * @private
   */
  _log(level, category, message, data) {
    if (!this.isEnabled || !this.enabledCategories.has(category)) {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data,
      platform: Platform.OS,
      version: '1.0.0' // You can get this from app.json
    };

    // Add to history
    this.logHistory.push(logEntry);
    if (this.logHistory.length > MAX_STORED_LOGS) {
      this.logHistory.shift(); // Remove oldest entry
    }

    // Use react-native-logs for console output
    const formattedMessage = `[${category.toUpperCase()}] ${message}`;
    
    switch (level) {
      case LOG_LEVELS.ERROR:
        logger.error(formattedMessage, data);
        break;
      case LOG_LEVELS.WARN:
        logger.warn(formattedMessage, data);
        break;
      case LOG_LEVELS.INFO:
        logger.info(formattedMessage, data);
        break;
      case LOG_LEVELS.DEBUG:
        logger.debug(formattedMessage, data);
        break;
      case LOG_LEVELS.TRACE:
        logger.trace(formattedMessage, data);
        break;
    }

    // Store in AsyncStorage for persistence
    this._storeLogs();
  }

  /**
   * Store logs in AsyncStorage
   * @private
   */
  async _storeLogs() {
    try {
      await AsyncStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(this.logHistory));
    } catch (error) {
      // Don't log this error to avoid infinite loops
      console.error('Failed to store debug logs:', error);
    }
  }

  /**
   * Load logs from AsyncStorage
   */
  async loadStoredLogs() {
    try {
      const stored = await AsyncStorage.getItem(LOG_STORAGE_KEY);
      if (stored) {
        this.logHistory = JSON.parse(stored);
      }
    } catch (error) {
      this.error(LOG_CATEGORIES.STORAGE, 'Failed to load stored logs', error);
    }
  }

  /**
   * Get recent logs
   * @param {number} count - Number of recent logs to return
   * @param {string} category - Filter by category (optional)
   * @param {string} level - Filter by level (optional)
   */
  getRecentLogs(count = 50, category = null, level = null) {
    let filtered = this.logHistory;

    if (category) {
      filtered = filtered.filter(log => log.category === category);
    }

    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }

    return filtered.slice(-count);
  }

  /**
   * Clear all stored logs
   */
  async clearLogs() {
    this.logHistory = [];
    try {
      await AsyncStorage.removeItem(LOG_STORAGE_KEY);
    } catch (error) {
      this.error(LOG_CATEGORIES.STORAGE, 'Failed to clear stored logs', error);
    }
  }

  /**
   * Export logs as JSON string
   */
  exportLogs() {
    return JSON.stringify(this.logHistory, null, 2);
  }

  /**
   * Get log statistics
   */
  getLogStats() {
    const stats = {
      total: this.logHistory.length,
      byLevel: {},
      byCategory: {},
      timeRange: null
    };

    if (this.logHistory.length > 0) {
      stats.timeRange = {
        first: this.logHistory[0].timestamp,
        last: this.logHistory[this.logHistory.length - 1].timestamp
      };
    }

    this.logHistory.forEach(log => {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
    });

    return stats;
  }
}

// Create singleton instance
export const cyberPupLogger = new CyberPupLogger();

// Initialize logger on app start
cyberPupLogger.loadStoredLogs();

// Convenience functions for quick logging
export const logError = (category, message, data) => cyberPupLogger.error(category, message, data);
export const logWarn = (category, message, data) => cyberPupLogger.warn(category, message, data);
export const logInfo = (category, message, data) => cyberPupLogger.info(category, message, data);
export const logDebug = (category, message, data) => cyberPupLogger.debug(category, message, data);
export const logTrace = (category, message, data) => cyberPupLogger.trace(category, message, data);

// Export the main logger instance
export default cyberPupLogger;
