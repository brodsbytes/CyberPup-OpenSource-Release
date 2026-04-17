import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import WelcomeScreen from './screens/WelcomeScreen';
import InsightsScreen from './screens/InsightsScreen';
import LoadingScreen from './components/ui/LoadingScreen';
import { GuideDetailScreen, ToolDetailScreen, AlertDetailScreen } from './screens/Insights';

import { APP_CONSTANTS, SCREEN_NAMES, ERROR_MESSAGES } from './constants';
import { AppStorage } from './utils/storage';
import { cyberPupLogger, LOG_CATEGORIES } from './utils/logger';

import {
  // Level 1 Check screens
  Check1_1_StrongPasswordsScreen,
  Check1_2_HighValueAccountsScreen,
  Check1_1_3_PasswordManagersScreen,
  Check1_1_4_MFASetupScreen,
  Check1_4_1_ScamRecognitionScreen,
  Check1_1_5_BreachCheckScreen,
  Check1_2_1_ScreenLockScreen,
  Check1_3_1_CloudBackupScreen,
  // Reusable components
  PhishingPracticeScreen,
  
  // 🎯 Phase 4 Wizard Variant Screens
  Check1_2_2_RemoteLockScreen,
  Check1_2_3_DeviceUpdatesScreen,
  Check1_2_4_BluetoothWifiScreen,
  
  // 🎯 Phase 4 Timeline Variant Screens
  Check1_5_2_PrivacySettingsScreen,
  
  // 🎯 Phase 4 Checklist Variant Screens
  Check1_3_2_LocalBackupScreen,
  Check1_4_2_ScamReportingScreen,
  
  // 🎯 Phase 4 Pattern A Enhanced Screens
  Check1_2_5_PublicChargingScreen,
  Check1_5_1_SharingAwarenessScreen,
} from './screens/lessons';

import InitialWelcomeScreen from './screens/InitialWelcomeScreen';
import DeviceAuditScreen from './screens/DeviceAuditScreen';
import ProfileScreen from './screens/ProfileScreen';
import { SecurityAlertsService } from './utils/securityAlerts';
import { BackgroundAlertsService } from './utils/backgroundAlerts';
import AreaCompletionScreen from './components/gamification/AreaCompletionScreen';
import LevelCompletionScreen from './components/gamification/LevelCompletionScreen';
import MainTabsScreen from './components/navigation/MainTabsScreen';
import { analyticsService, trackEvent, trackScreenView, trackPerformance, trackError } from './utils/analytics';
import { PostHogProvider } from 'posthog-react-native';
import PostHogInitializer from './components/common/PostHogInitializer';
import ErrorBoundary from './components/common/ErrorBoundary';


const Stack = createNativeStackNavigator();



export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState(APP_CONSTANTS.NAVIGATION.INITIAL_ROUTES.AUDIT);

  useEffect(() => {
    const appStartTime = Date.now();
    cyberPupLogger.info(LOG_CATEGORIES.GENERAL, 'App starting up', { timestamp: new Date().toISOString() });
    
    // Initialize analytics (will check consent first)
    analyticsService.initialize().catch(error => {
      cyberPupLogger.warn(LOG_CATEGORIES.GENERAL, 'Analytics initialization failed', { error: error.message });
      trackError(error, { context: 'analytics_initialization' });
    });
    
    checkAuditStatus();
    
    // Track app startup performance
    setTimeout(() => {
      const startupTime = Date.now() - appStartTime;
      trackPerformance('app_startup_time', startupTime, {
        platform: Platform.OS,
        app_version: '1.0.0'
      });
    }, 1000);
  }, []);

  useEffect(() => {
    // Register background fetch for security alerts (only on native platforms)
    try {
      BackgroundAlertsService.registerBackgroundFetch();
      cyberPupLogger.info(LOG_CATEGORIES.SECURITY, 'Background fetch registered successfully');
    } catch (error) {
      cyberPupLogger.warn(LOG_CATEGORIES.SECURITY, 'Background fetch not available on this platform', { error: error.message });
    }
    
    return () => {
      // Cleanup on app unmount
      try {
        BackgroundAlertsService.unregisterBackgroundFetch();
        cyberPupLogger.info(LOG_CATEGORIES.SECURITY, 'Background fetch unregistered successfully');
      } catch (error) {
        cyberPupLogger.warn(LOG_CATEGORIES.SECURITY, 'Background fetch cleanup not available on this platform', { error: error.message });
      }
    };
  }, []);

  const checkAuditStatus = async () => {
    try {
      cyberPupLogger.debug(LOG_CATEGORIES.STORAGE, 'Checking audit status from storage');
      const welcomeCompleted = await AsyncStorage.getItem('welcome_completed');
      
      if (welcomeCompleted === 'true') {
        cyberPupLogger.info(LOG_CATEGORIES.NAVIGATION, 'Welcome completed, navigating to main app');
        setInitialRoute(APP_CONSTANTS.NAVIGATION.INITIAL_ROUTES.WELCOME);
      } else {
        cyberPupLogger.info(LOG_CATEGORIES.NAVIGATION, 'Welcome not completed, showing initial welcome screen');
        setInitialRoute(SCREEN_NAMES.INITIAL_WELCOME);
      }
    } catch (error) {
      cyberPupLogger.error(LOG_CATEGORIES.STORAGE, 'Failed to check audit status', { error: error.message, stack: error.stack });
      // Fallback to initial welcome screen if there's an error
      setInitialRoute(SCREEN_NAMES.INITIAL_WELCOME);
    } finally {
      setIsLoading(false);
      cyberPupLogger.debug(LOG_CATEGORIES.GENERAL, 'App loading completed');
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading CyberPup..." />;
  }

  const handleNavigationStateChange = (state) => {
    // Track screen views for analytics
    try {
      const route = state?.routes[state.index];
      if (route?.name) {
        trackScreenView(route.name, {
          previous_screen: state?.routes[state.index - 1]?.name || null,
        });
      }
    } catch (error) {
      cyberPupLogger.warn(LOG_CATEGORIES.NAVIGATION, 'Failed to track screen view', { error: error.message });
    }
  };

  const posthogApiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;

  if (!posthogApiKey) {
    cyberPupLogger.warn(LOG_CATEGORIES.GENERAL, 'PostHog API key is not set. Analytics provider will be disabled.');
  }

  const posthogOptions = {
        host: 'https://app.posthog.com',
        debug: __DEV__,
        capture_pageview: false,
        capture_screen_views: false,
        disable_session_recording: true,
        ip: false,
        flush_at: 1,
        flush_interval: 5000,
        disable_automatic_navigation_tracking: true,
      };

  if (!posthogApiKey) {
    return (
      <ErrorBoundary screenName="app_root">
        <SafeAreaProvider>
          <NavigationContainer onStateChange={handleNavigationStateChange}>
            <Stack.Navigator
              initialRouteName={initialRoute}
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name={SCREEN_NAMES.INITIAL_WELCOME} component={InitialWelcomeScreen} />
              <Stack.Screen name={SCREEN_NAMES.DEVICE_AUDIT} component={DeviceAuditScreen} />
              <Stack.Screen name="MainTabs" component={MainTabsScreen} />
              <Stack.Screen
                name={SCREEN_NAMES.WELCOME}
                component={MainTabsScreen}
                initialParams={{ initialTab: SCREEN_NAMES.WELCOME }}
              />
              <Stack.Screen
                name={SCREEN_NAMES.INSIGHTS}
                component={MainTabsScreen}
                initialParams={{ initialTab: SCREEN_NAMES.INSIGHTS }}
              />
              <Stack.Screen
                name={SCREEN_NAMES.PROFILE}
                component={MainTabsScreen}
                initialParams={{ initialTab: SCREEN_NAMES.PROFILE }}
              />
              <Stack.Screen name={SCREEN_NAMES.GUIDE_DETAIL} component={GuideDetailScreen} />
              <Stack.Screen name={SCREEN_NAMES.TOOL_DETAIL} component={ToolDetailScreen} />
              <Stack.Screen name={SCREEN_NAMES.ALERT_DETAIL} component={AlertDetailScreen} />
              <Stack.Screen name={SCREEN_NAMES.AREA_COMPLETION} component={AreaCompletionScreen} />
              <Stack.Screen name={SCREEN_NAMES.LEVEL_COMPLETION} component={LevelCompletionScreen} />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_1_1_STRONG_PASSWORDS}
                component={Check1_1_StrongPasswordsScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_1_2_HIGH_VALUE_ACCOUNTS}
                component={Check1_2_HighValueAccountsScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_1_3_PASSWORD_MANAGERS}
                component={Check1_1_3_PasswordManagersScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_1_4_MFA_SETUP}
                component={Check1_1_4_MFASetupScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_4_1_SCAM_RECOGNITION}
                component={Check1_4_1_ScamRecognitionScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_1_5_BREACH_CHECK}
                component={Check1_1_5_BreachCheckScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_2_1_SCREEN_LOCK}
                component={Check1_2_1_ScreenLockScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_3_1_CLOUD_BACKUP}
                component={Check1_3_1_CloudBackupScreen}
              />
              <Stack.Screen name={SCREEN_NAMES.PHISHING_PRACTICE} component={PhishingPracticeScreen} />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_2_2_REMOTE_LOCK}
                component={Check1_2_2_RemoteLockScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_2_3_DEVICE_UPDATES}
                component={Check1_2_3_DeviceUpdatesScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_2_4_BLUETOOTH_WIFI}
                component={Check1_2_4_BluetoothWifiScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_5_2_PRIVACY_SETTINGS}
                component={Check1_5_2_PrivacySettingsScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_3_2_LOCAL_BACKUP}
                component={Check1_3_2_LocalBackupScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_4_2_SCAM_REPORTING}
                component={Check1_4_2_ScamReportingScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_2_5_PUBLIC_CHARGING}
                component={Check1_2_5_PublicChargingScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_5_1_SHARING_AWARENESS}
                component={Check1_5_1_SharingAwarenessScreen}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </ErrorBoundary>
    );
  }

  return (
    <PostHogProvider
      apiKey={posthogApiKey}
      options={posthogOptions}
    >
      <PostHogInitializer />
      <ErrorBoundary screenName="app_root">
        <SafeAreaProvider>
          <NavigationContainer onStateChange={handleNavigationStateChange}>
            <Stack.Navigator
              initialRouteName={initialRoute}
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name={SCREEN_NAMES.INITIAL_WELCOME} component={InitialWelcomeScreen} />
              <Stack.Screen name={SCREEN_NAMES.DEVICE_AUDIT} component={DeviceAuditScreen} />
              <Stack.Screen name="MainTabs" component={MainTabsScreen} />
              <Stack.Screen
                name={SCREEN_NAMES.WELCOME}
                component={MainTabsScreen}
                initialParams={{ initialTab: SCREEN_NAMES.WELCOME }}
              />
              <Stack.Screen
                name={SCREEN_NAMES.INSIGHTS}
                component={MainTabsScreen}
                initialParams={{ initialTab: SCREEN_NAMES.INSIGHTS }}
              />
              <Stack.Screen
                name={SCREEN_NAMES.PROFILE}
                component={MainTabsScreen}
                initialParams={{ initialTab: SCREEN_NAMES.PROFILE }}
              />
              <Stack.Screen name={SCREEN_NAMES.GUIDE_DETAIL} component={GuideDetailScreen} />
              <Stack.Screen name={SCREEN_NAMES.TOOL_DETAIL} component={ToolDetailScreen} />
              <Stack.Screen name={SCREEN_NAMES.ALERT_DETAIL} component={AlertDetailScreen} />
              <Stack.Screen name={SCREEN_NAMES.AREA_COMPLETION} component={AreaCompletionScreen} />
              <Stack.Screen name={SCREEN_NAMES.LEVEL_COMPLETION} component={LevelCompletionScreen} />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_1_1_STRONG_PASSWORDS}
                component={Check1_1_StrongPasswordsScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_1_2_HIGH_VALUE_ACCOUNTS}
                component={Check1_2_HighValueAccountsScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_1_3_PASSWORD_MANAGERS}
                component={Check1_1_3_PasswordManagersScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_1_4_MFA_SETUP}
                component={Check1_1_4_MFASetupScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_4_1_SCAM_RECOGNITION}
                component={Check1_4_1_ScamRecognitionScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_1_5_BREACH_CHECK}
                component={Check1_1_5_BreachCheckScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_2_1_SCREEN_LOCK}
                component={Check1_2_1_ScreenLockScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_3_1_CLOUD_BACKUP}
                component={Check1_3_1_CloudBackupScreen}
              />
              <Stack.Screen name={SCREEN_NAMES.PHISHING_PRACTICE} component={PhishingPracticeScreen} />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_2_2_REMOTE_LOCK}
                component={Check1_2_2_RemoteLockScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_2_3_DEVICE_UPDATES}
                component={Check1_2_3_DeviceUpdatesScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_2_4_BLUETOOTH_WIFI}
                component={Check1_2_4_BluetoothWifiScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_5_2_PRIVACY_SETTINGS}
                component={Check1_5_2_PrivacySettingsScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_3_2_LOCAL_BACKUP}
                component={Check1_3_2_LocalBackupScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_4_2_SCAM_REPORTING}
                component={Check1_4_2_ScamReportingScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_2_5_PUBLIC_CHARGING}
                component={Check1_2_5_PublicChargingScreen}
              />
              <Stack.Screen
                name={SCREEN_NAMES.CHECK_1_5_1_SHARING_AWARENESS}
                component={Check1_5_1_SharingAwarenessScreen}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </ErrorBoundary>
    </PostHogProvider>
  );
}


