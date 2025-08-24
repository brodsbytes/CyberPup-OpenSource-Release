import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeScreen from './screens/WelcomeScreen';
import InsightsScreen from './screens/InsightsScreen';
import LoadingScreen from './components/LoadingScreen';
import { GuideDetailScreen, ToolDetailScreen, AlertDetailScreen } from './screens/Insights';

import { APP_CONSTANTS, SCREEN_NAMES, ERROR_MESSAGES } from './constants';
import { AppStorage } from './utils/storage';

import {
  // Level 1 Check screens
  Check1_1_StrongPasswordsScreen,
  Check1_2_HighValueAccountsScreen,
  Check1_3_PasswordManagersScreen,
  Check1_4_MFASetupScreen,
  Check1_4_1_ScamRecognitionScreen,
  Check1_5_BreachCheckScreen,
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

const Stack = createNativeStackNavigator();



export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState(APP_CONSTANTS.NAVIGATION.INITIAL_ROUTES.AUDIT);

  useEffect(() => {
    checkAuditStatus();
  }, []);

  useEffect(() => {
    // Register background fetch for security alerts (only on native platforms)
    try {
      BackgroundAlertsService.registerBackgroundFetch();
    } catch (error) {
      console.log('Background fetch not available on this platform:', error.message);
    }
    
    return () => {
      // Cleanup on app unmount
      try {
        BackgroundAlertsService.unregisterBackgroundFetch();
      } catch (error) {
        console.log('Background fetch cleanup not available on this platform:', error.message);
      }
    };
  }, []);

  const checkAuditStatus = async () => {
    try {
      const welcomeCompleted = await AsyncStorage.getItem('welcome_completed');
      
      if (welcomeCompleted === 'true') {
        setInitialRoute(APP_CONSTANTS.NAVIGATION.INITIAL_ROUTES.WELCOME);
      } else {
        setInitialRoute(SCREEN_NAMES.INITIAL_WELCOME);
      }
    } catch (error) {
      console.log(ERROR_MESSAGES.AUDIT_STATUS_ERROR, error);
      // Fallback to initial welcome screen if there's an error
      setInitialRoute(SCREEN_NAMES.INITIAL_WELCOME);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading CyberPup..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name={SCREEN_NAMES.INITIAL_WELCOME} component={InitialWelcomeScreen} />
        <Stack.Screen name={SCREEN_NAMES.DEVICE_AUDIT} component={DeviceAuditScreen} />
        <Stack.Screen name={SCREEN_NAMES.WELCOME} component={WelcomeScreen} />
        <Stack.Screen name={SCREEN_NAMES.INSIGHTS} component={InsightsScreen} />
        
        {/* Insights detail screens */}
        <Stack.Screen name={SCREEN_NAMES.GUIDE_DETAIL} component={GuideDetailScreen} />
        <Stack.Screen name={SCREEN_NAMES.TOOL_DETAIL} component={ToolDetailScreen} />
        <Stack.Screen name={SCREEN_NAMES.ALERT_DETAIL} component={AlertDetailScreen} />
        
        {/* Level 1 Check screens */}
        <Stack.Screen name={SCREEN_NAMES.CHECK_1_1_STRONG_PASSWORDS} component={Check1_1_StrongPasswordsScreen} />
        <Stack.Screen name={SCREEN_NAMES.CHECK_1_2_HIGH_VALUE_ACCOUNTS} component={Check1_2_HighValueAccountsScreen} />
        <Stack.Screen name={SCREEN_NAMES.CHECK_1_3_PASSWORD_MANAGERS} component={Check1_3_PasswordManagersScreen} />
        <Stack.Screen name={SCREEN_NAMES.CHECK_1_4_MFA_SETUP} component={Check1_4_MFASetupScreen} />
        <Stack.Screen name={SCREEN_NAMES.CHECK_1_4_1_SCAM_RECOGNITION} component={Check1_4_1_ScamRecognitionScreen} />
        <Stack.Screen name={SCREEN_NAMES.CHECK_1_5_BREACH_CHECK} component={Check1_5_BreachCheckScreen} />
        <Stack.Screen name={SCREEN_NAMES.CHECK_1_2_1_SCREEN_LOCK} component={Check1_2_1_ScreenLockScreen} />
        <Stack.Screen name={SCREEN_NAMES.CHECK_1_3_1_CLOUD_BACKUP} component={Check1_3_1_CloudBackupScreen} />
        <Stack.Screen name={SCREEN_NAMES.PHISHING_PRACTICE} component={PhishingPracticeScreen} />
        
        {/* 🎯 Phase 4 Wizard Variant Screens */}
        <Stack.Screen name={SCREEN_NAMES.CHECK_1_2_2_REMOTE_LOCK} component={Check1_2_2_RemoteLockScreen} />
        <Stack.Screen name={SCREEN_NAMES.CHECK_1_2_3_DEVICE_UPDATES} component={Check1_2_3_DeviceUpdatesScreen} />
        <Stack.Screen name={SCREEN_NAMES.CHECK_1_2_4_BLUETOOTH_WIFI} component={Check1_2_4_BluetoothWifiScreen} />
        
        {/* 🎯 Phase 4 Timeline Variant Screens */}
        <Stack.Screen name={SCREEN_NAMES.CHECK_1_5_2_PRIVACY_SETTINGS} component={Check1_5_2_PrivacySettingsScreen} />
        
        {/* 🎯 Phase 4 Checklist Variant Screens */}
        <Stack.Screen name={SCREEN_NAMES.CHECK_1_3_2_LOCAL_BACKUP} component={Check1_3_2_LocalBackupScreen} />
        <Stack.Screen name={SCREEN_NAMES.CHECK_1_4_2_SCAM_REPORTING} component={Check1_4_2_ScamReportingScreen} />
        
        {/* 🎯 Phase 4 Pattern A Enhanced Screens */}
        <Stack.Screen name={SCREEN_NAMES.CHECK_1_2_5_PUBLIC_CHARGING} component={Check1_2_5_PublicChargingScreen} />
        <Stack.Screen name={SCREEN_NAMES.CHECK_1_5_1_SHARING_AWARENESS} component={Check1_5_1_SharingAwarenessScreen} />
        
        <Stack.Screen name={SCREEN_NAMES.PROFILE} component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


