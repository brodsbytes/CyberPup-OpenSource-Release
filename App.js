import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from './theme';
import WelcomeScreen from './screens/WelcomeScreen';
import CategoryScreen from './screens/CategoryScreen';
import ModuleListScreen from './screens/ModuleListScreen';

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

import InitialAuditScreen from './screens/InitialAuditScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.accent} />
      <Text style={styles.loadingText}>Loading CyberPup...</Text>
    </View>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('InitialAudit');

  useEffect(() => {
    checkAuditStatus();
  }, []);

  const checkAuditStatus = async () => {
    try {
      const auditCompleted = await AsyncStorage.getItem('audit_completed');
      if (auditCompleted === 'true') {
        setInitialRoute('Welcome');
      }
    } catch (error) {
      console.log('Error checking audit status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="InitialAudit" component={InitialAuditScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="CategoryScreen" component={CategoryScreen} />

        <Stack.Screen name="ModuleListScreen" component={ModuleListScreen} />
        {/* Welcome Aboard category screens */}
        {/* Level 1 Check screens */}
        <Stack.Screen name="Check1_1_StrongPasswordsScreen" component={Check1_1_StrongPasswordsScreen} />
        <Stack.Screen name="Check1_2_HighValueAccountsScreen" component={Check1_2_HighValueAccountsScreen} />
        <Stack.Screen name="Check1_3_PasswordManagersScreen" component={Check1_3_PasswordManagersScreen} />
        <Stack.Screen name="Check1_4_MFASetupScreen" component={Check1_4_MFASetupScreen} />
        <Stack.Screen name="Check1_5_BreachCheckScreen" component={Check1_5_BreachCheckScreen} />
        <Stack.Screen name="Check1_2_1_ScreenLockScreen" component={Check1_2_1_ScreenLockScreen} />
        <Stack.Screen name="PhishingPracticeScreen" component={PhishingPracticeScreen} />
        
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    color: Colors.textPrimary,
    fontSize: 16,
    marginTop: 16,
  },
});
