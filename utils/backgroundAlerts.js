// Background task for fetching security alerts
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { SecurityAlertsService } from './securityAlerts';

const BACKGROUND_FETCH_TASK = 'security-alerts-background-fetch';

// Define the background task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    console.log('🔄 Background: Fetching security alerts...');
    
    // Fetch fresh alerts in the background
    const alerts = await SecurityAlertsService.getSecurityAlerts('US', true);
    console.log(`✅ Background: Fetched ${alerts.length} alerts`);
    
    return BackgroundTask.BackgroundTaskResult.NewData;
  } catch (error) {
    console.log('❌ Background fetch failed:', error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export const BackgroundAlertsService = {
  // Register background fetch
  async registerBackgroundFetch() {
    try {
      // Check if background tasks are available
      const status = await BackgroundTask.getStatusAsync();
      if (status !== BackgroundTask.BackgroundTaskStatus.Available) {
        console.log('⚠️ Background tasks not available on this platform');
        return;
      }

      await BackgroundTask.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 6 * 60 * 60, // 6 hours
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log('✅ Background fetch registered');
    } catch (error) {
      console.log('❌ Background fetch registration failed:', error);
    }
  },

  // Unregister background fetch
  async unregisterBackgroundFetch() {
    try {
      await BackgroundTask.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
      console.log('✅ Background fetch unregistered');
    } catch (error) {
      console.log('❌ Background fetch unregistration failed:', error);
    }
  },

  // Check if background fetch is available
  async isAvailable() {
    try {
      const status = await BackgroundTask.getStatusAsync();
      return status === BackgroundTask.BackgroundTaskStatus.Available;
    } catch (error) {
      console.log('❌ Error checking background task availability:', error);
      return false;
    }
  }
};
