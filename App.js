import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeScreen from './screens/WelcomeScreen';
import CategoryScreen from './screens/CategoryScreen';
import ModuleListScreen from './screens/ModuleListScreen';
import InsightsScreen from './screens/InsightsScreen';
import LoadingScreen from './components/LoadingScreen';
import { GuideDetailScreen, ToolDetailScreen } from './screens/Insights';

import { APP_CONSTANTS, SCREEN_NAMES, ERROR_MESSAGES } from './constants';
import { AppStorage } from './utils/storage';

import {
  // Level 1 Check screens
  Check1_1_StrongPasswordsScreen,
  Check1_2_HighValueAccountsScreen,
  Check1_3_PasswordManagersScreen,
  Check1_4_MFASetupScreen,
  Check1_5_BreachCheckScreen,
  Check1_2_1_ScreenLockScreen,
  // Reusable components
  PhishingPracticeScreen,
} from './screens/lessons';

import InitialWelcomeScreen from './screens/InitialWelcomeScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();



export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState(APP_CONSTANTS.NAVIGATION.INITIAL_ROUTES.AUDIT);

  useEffect(() => {
    checkAuditStatus();
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
        <Stack.Screen name={SCREEN_NAMES.WELCOME} component={WelcomeScreen} />
        <Stack.Screen name={SCREEN_NAMES.CATEGORY} component={CategoryScreen} />
        <Stack.Screen name={SCREEN_NAMES.MODULE_LIST} component={ModuleListScreen} />
        <Stack.Screen name={SCREEN_NAMES.INSIGHTS} component={InsightsScreen} />
        
        {/* Insights detail screens */}
        <Stack.Screen name={SCREEN_NAMES.GUIDE_DETAIL} component={GuideDetailScreen} />
        <Stack.Screen name={SCREEN_NAMES.TOOL_DETAIL} component={ToolDetailScreen} />
        
        {/* Level 1 Check screens */}
        <Stack.Screen name={SCREEN_NAMES.CHECK_1_1_STRONG_PASSWORDS} component={Check1_1_StrongPasswordsScreen} />
        <Stack.Screen name={SCREEN_NAMES.CHECK_1_2_HIGH_VALUE_ACCOUNTS} component={Check1_2_HighValueAccountsScreen} />
        <Stack.Screen name={SCREEN_NAMES.CHECK_1_3_PASSWORD_MANAGERS} component={Check1_3_PasswordManagersScreen} />
        <Stack.Screen name={SCREEN_NAMES.CHECK_1_4_MFA_SETUP} component={Check1_4_MFASetupScreen} />
        <Stack.Screen name={SCREEN_NAMES.CHECK_1_5_BREACH_CHECK} component={Check1_5_BreachCheckScreen} />
        <Stack.Screen name={SCREEN_NAMES.CHECK_1_2_1_SCREEN_LOCK} component={Check1_2_1_ScreenLockScreen} />
        <Stack.Screen name={SCREEN_NAMES.PHISHING_PRACTICE} component={PhishingPracticeScreen} />
        
        <Stack.Screen name={SCREEN_NAMES.PROFILE} component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


