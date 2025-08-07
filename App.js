import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import WelcomeScreen from './screens/WelcomeScreen';
import CategoryScreen from './screens/CategoryScreen';
import CategoryIntroScreen from './screens/CategoryIntroScreen';
import ModuleListScreen from './screens/ModuleListScreen';

import {
  // Password Security screens
  PasswordIntroScreen,
  PasswordChecklistScreen,
  PasswordQuizScreen,
  PasswordPracticeScreen,
  PasswordManagersIntroScreen,
  PasswordManagersBenefitsScreen,
  PasswordManagersOptionsScreen,
  PasswordManagersSetupScreen,
  PasswordManagersPracticeScreen,
  MFATutorialScreen,
  MFASetupScreen,
  MFAPracticeScreen,
  PasswordRecoveryIntroScreen,
  PasswordRecoveryMethodsScreen,
  // Phishing Awareness screens
  PhishingEmailsIntroScreen,
  PhishingEmailsRedFlagsScreen,
  PhishingEmailsHeadersScreen,
  PhishingEmailsPracticeScreen,
  SocialEngineeringIntroScreen,
  SocialEngineeringTechniquesScreen,
  SocialEngineeringProtectionScreen,
  SocialEngineeringExamplesScreen,
  SocialEngineeringPracticeScreen,
  SafeLinkIntroScreen,
  SafeLinkVerificationScreen,
  SafeLinkPracticeScreen,
  ReportingScamsIntroScreen,
  ReportingScamsMethodsScreen,
  // Device Security screens
  DeviceUpdatesIntroScreen,
  DeviceUpdatesImportanceScreen,
  DeviceUpdatesPracticeScreen,
  HomeNetworkIntroScreen,
  HomeNetworkRouterScreen,
  HomeNetworkPasswordScreen,
  HomeNetworkMonitoringScreen,
  HomeNetworkPracticeScreen,
  AntivirusIntroScreen,
  AntivirusSelectionScreen,
  AntivirusConfigurationScreen,
  AntivirusPracticeScreen,
  MobileSecurityIntroScreen,
  MobileSecuritySettingsScreen,
  MobileSecurityPracticeScreen,
  // Privacy & Social screens
  SocialMediaIntroScreen,
  SocialMediaSettingsScreen,
  SocialMediaProfileScreen,
  SocialMediaPracticeScreen,
  DigitalFootprintIntroScreen,
  DigitalFootprintAssessmentScreen,
  DigitalFootprintPracticeScreen,
  DataSharingIntroScreen,
  DataSharingUnderstandingScreen,
  DataSharingPracticeScreen,
  PrivacyToolsIntroScreen,
  PrivacyToolsBrowsersScreen,
  PrivacyToolsCommunicationScreen,
  PrivacyToolsPracticeScreen,
  // Finance & Identity screens
  SecureBankingIntroScreen,
  SecureBankingPracticesScreen,
  SecureBankingPracticeScreen,
  CreditMonitoringIntroScreen,
  CreditMonitoringSetupScreen,
  SafeShoppingIntroScreen,
  SafeShoppingPracticesScreen,
  IdentityTheftIntroScreen,
  IdentityTheftResponseScreen,
} from './screens/lessons';
import InitialAuditScreen from './screens/InitialAuditScreen';
import DictionaryScreen from './screens/DictionaryScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4a90e2" />
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
        <Stack.Screen name="CategoryIntroScreen" component={CategoryIntroScreen} />
        <Stack.Screen name="ModuleListScreen" component={ModuleListScreen} />

        <Stack.Screen name="PasswordIntroScreen" component={PasswordIntroScreen} />
        <Stack.Screen name="PasswordChecklistScreen" component={PasswordChecklistScreen} />
        <Stack.Screen name="PasswordQuizScreen" component={PasswordQuizScreen} />
        <Stack.Screen name="PasswordPracticeScreen" component={PasswordPracticeScreen} />
        <Stack.Screen name="PasswordManagersIntroScreen" component={PasswordManagersIntroScreen} />
        <Stack.Screen name="PasswordManagersBenefitsScreen" component={PasswordManagersBenefitsScreen} />
        <Stack.Screen name="PasswordManagersOptionsScreen" component={PasswordManagersOptionsScreen} />
        <Stack.Screen name="PasswordManagersSetupScreen" component={PasswordManagersSetupScreen} />
        <Stack.Screen name="PasswordManagersPracticeScreen" component={PasswordManagersPracticeScreen} />
        <Stack.Screen name="MFATutorialScreen" component={MFATutorialScreen} />
        <Stack.Screen name="MFASetupScreen" component={MFASetupScreen} />
        <Stack.Screen name="MFAPracticeScreen" component={MFAPracticeScreen} />
        <Stack.Screen name="PasswordRecoveryIntroScreen" component={PasswordRecoveryIntroScreen} />
        <Stack.Screen name="PasswordRecoveryMethodsScreen" component={PasswordRecoveryMethodsScreen} />
        
        {/* Phishing Awareness screens */}
        <Stack.Screen name="PhishingEmailsIntroScreen" component={PhishingEmailsIntroScreen} />
        <Stack.Screen name="PhishingEmailsRedFlagsScreen" component={PhishingEmailsRedFlagsScreen} />
        <Stack.Screen name="PhishingEmailsHeadersScreen" component={PhishingEmailsHeadersScreen} />
        <Stack.Screen name="PhishingEmailsPracticeScreen" component={PhishingEmailsPracticeScreen} />
        <Stack.Screen name="SocialEngineeringIntroScreen" component={SocialEngineeringIntroScreen} />
        <Stack.Screen name="SocialEngineeringTechniquesScreen" component={SocialEngineeringTechniquesScreen} />
        <Stack.Screen name="SocialEngineeringProtectionScreen" component={SocialEngineeringProtectionScreen} />
        <Stack.Screen name="SocialEngineeringExamplesScreen" component={SocialEngineeringExamplesScreen} />
        <Stack.Screen name="SocialEngineeringPracticeScreen" component={SocialEngineeringPracticeScreen} />
        <Stack.Screen name="SafeLinkIntroScreen" component={SafeLinkIntroScreen} />
        <Stack.Screen name="SafeLinkVerificationScreen" component={SafeLinkVerificationScreen} />
        <Stack.Screen name="SafeLinkPracticeScreen" component={SafeLinkPracticeScreen} />
        <Stack.Screen name="ReportingScamsIntroScreen" component={ReportingScamsIntroScreen} />
        <Stack.Screen name="ReportingScamsMethodsScreen" component={ReportingScamsMethodsScreen} />
        
        {/* Device Security screens */}
        <Stack.Screen name="DeviceUpdatesIntroScreen" component={DeviceUpdatesIntroScreen} />
        <Stack.Screen name="DeviceUpdatesImportanceScreen" component={DeviceUpdatesImportanceScreen} />
        <Stack.Screen name="DeviceUpdatesPracticeScreen" component={DeviceUpdatesPracticeScreen} />
        <Stack.Screen name="HomeNetworkIntroScreen" component={HomeNetworkIntroScreen} />
        <Stack.Screen name="HomeNetworkRouterScreen" component={HomeNetworkRouterScreen} />
        <Stack.Screen name="HomeNetworkPasswordScreen" component={HomeNetworkPasswordScreen} />
        <Stack.Screen name="HomeNetworkMonitoringScreen" component={HomeNetworkMonitoringScreen} />
        <Stack.Screen name="HomeNetworkPracticeScreen" component={HomeNetworkPracticeScreen} />
        <Stack.Screen name="AntivirusIntroScreen" component={AntivirusIntroScreen} />
        <Stack.Screen name="AntivirusSelectionScreen" component={AntivirusSelectionScreen} />
        <Stack.Screen name="AntivirusConfigurationScreen" component={AntivirusConfigurationScreen} />
        <Stack.Screen name="AntivirusPracticeScreen" component={AntivirusPracticeScreen} />
        <Stack.Screen name="MobileSecurityIntroScreen" component={MobileSecurityIntroScreen} />
        <Stack.Screen name="MobileSecuritySettingsScreen" component={MobileSecuritySettingsScreen} />
        <Stack.Screen name="MobileSecurityPracticeScreen" component={MobileSecurityPracticeScreen} />
        
        {/* Privacy & Social screens */}
        <Stack.Screen name="SocialMediaIntroScreen" component={SocialMediaIntroScreen} />
        <Stack.Screen name="SocialMediaSettingsScreen" component={SocialMediaSettingsScreen} />
        <Stack.Screen name="SocialMediaProfileScreen" component={SocialMediaProfileScreen} />
        <Stack.Screen name="SocialMediaPracticeScreen" component={SocialMediaPracticeScreen} />
        <Stack.Screen name="DigitalFootprintIntroScreen" component={DigitalFootprintIntroScreen} />
        <Stack.Screen name="DigitalFootprintAssessmentScreen" component={DigitalFootprintAssessmentScreen} />
        <Stack.Screen name="DigitalFootprintPracticeScreen" component={DigitalFootprintPracticeScreen} />
        <Stack.Screen name="DataSharingIntroScreen" component={DataSharingIntroScreen} />
        <Stack.Screen name="DataSharingUnderstandingScreen" component={DataSharingUnderstandingScreen} />
        <Stack.Screen name="DataSharingPracticeScreen" component={DataSharingPracticeScreen} />
        <Stack.Screen name="PrivacyToolsIntroScreen" component={PrivacyToolsIntroScreen} />
        <Stack.Screen name="PrivacyToolsBrowsersScreen" component={PrivacyToolsBrowsersScreen} />
        <Stack.Screen name="PrivacyToolsCommunicationScreen" component={PrivacyToolsCommunicationScreen} />
        <Stack.Screen name="PrivacyToolsPracticeScreen" component={PrivacyToolsPracticeScreen} />
        
        {/* Finance & Identity screens */}
        <Stack.Screen name="SecureBankingIntroScreen" component={SecureBankingIntroScreen} />
        <Stack.Screen name="SecureBankingPracticesScreen" component={SecureBankingPracticesScreen} />
        <Stack.Screen name="SecureBankingPracticeScreen" component={SecureBankingPracticeScreen} />
        <Stack.Screen name="CreditMonitoringIntroScreen" component={CreditMonitoringIntroScreen} />
        <Stack.Screen name="CreditMonitoringSetupScreen" component={CreditMonitoringSetupScreen} />
        <Stack.Screen name="SafeShoppingIntroScreen" component={SafeShoppingIntroScreen} />
        <Stack.Screen name="SafeShoppingPracticesScreen" component={SafeShoppingPracticesScreen} />
        <Stack.Screen name="IdentityTheftIntroScreen" component={IdentityTheftIntroScreen} />
        <Stack.Screen name="IdentityTheftResponseScreen" component={IdentityTheftResponseScreen} />
        
        <Stack.Screen name="DictionaryScreen" component={DictionaryScreen} />
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
    backgroundColor: '#1a365d',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 16,
  },
});
