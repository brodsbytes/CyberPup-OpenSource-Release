import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONSTANTS, ERROR_MESSAGES } from '../constants';

// Storage utility functions
export const StorageUtils = {
  // Get item from storage with error handling
  async getItem(key) {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`${ERROR_MESSAGES.STORAGE_ERROR}: ${key}`, error);
      return null;
    }
  },

  // Set item in storage with error handling
  async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`${ERROR_MESSAGES.STORAGE_ERROR}: ${key}`, error);
      return false;
    }
  },

  // Remove item from storage with error handling
  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`${ERROR_MESSAGES.STORAGE_ERROR}: ${key}`, error);
      return false;
    }
  },

  // Get boolean value from storage
  async getBoolean(key) {
    const value = await this.getItem(key);
    return value === 'true';
  },

  // Set boolean value in storage
  async setBoolean(key, value) {
    return await this.setItem(key, value.toString());
  },

  // Get JSON object from storage
  async getObject(key) {
    try {
      const value = await this.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error parsing JSON for key: ${key}`, error);
      return null;
    }
  },

  // Set JSON object in storage
  async setObject(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      return await this.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error stringifying JSON for key: ${key}`, error);
      return false;
    }
  },

  // Clear all storage
  async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage', error);
      return false;
    }
  },
};

// Specific storage functions for the app
export const AppStorage = {
  // Audit status
  async getAuditCompleted() {
    return await StorageUtils.getBoolean(APP_CONSTANTS.STORAGE_KEYS.AUDIT_COMPLETED);
  },

  async setAuditCompleted(completed) {
    return await StorageUtils.setBoolean(APP_CONSTANTS.STORAGE_KEYS.AUDIT_COMPLETED, completed);
  },

  // User progress
  async getUserProgress() {
    return await StorageUtils.getObject(APP_CONSTANTS.STORAGE_KEYS.USER_PROGRESS);
  },

  async setUserProgress(progress) {
    return await StorageUtils.setObject(APP_CONSTANTS.STORAGE_KEYS.USER_PROGRESS, progress);
  },

  // Completed checks
  async getCompletedChecks() {
    return await StorageUtils.getObject(APP_CONSTANTS.STORAGE_KEYS.COMPLETED_CHECKS);
  },

  async setCompletedChecks(checks) {
    return await StorageUtils.setObject(APP_CONSTANTS.STORAGE_KEYS.COMPLETED_CHECKS, checks);
  },
};
