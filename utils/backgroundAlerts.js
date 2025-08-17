// Background task for fetching security alerts
import * as BackgroundFetch from 'expo-background-fetch';
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
    
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.log('❌ Background fetch failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const BackgroundAlertsService = {
  // Register background fetch
  async registerBackgroundFetch() {
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
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
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
      console.log('✅ Background fetch unregistered');
    } catch (error) {
      console.log('❌ Background fetch unregistration failed:', error);
    }
  },

  // Check if background fetch is available
  async isAvailable() {
    return await BackgroundFetch.getStatusAsync();
  }
};
