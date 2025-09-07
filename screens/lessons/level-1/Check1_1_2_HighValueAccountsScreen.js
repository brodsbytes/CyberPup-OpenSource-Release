import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Colors, Typography, Responsive, CommonStyles } from '../../../theme';
import ReferencesSection from '../../../components/ui/ReferencesSection';
import { getReferencesForCheck } from '../../../data/references';
import { SCREEN_NAMES } from '../../../constants';
import { DeviceCapabilities } from '../../../utils/deviceCapabilities';
import { SettingsGuide } from '../../../utils/settingsGuide';
import { AppStorage } from '../../../utils/storage';
import { getCompletionMessage, getNextScreenName } from '../../../utils/completionMessages';
import { CopywritingService } from '../../../utils/copywritingService';

import TimelineDashboard from '../../../components/ui/TimelineDashboard';
import CompletionPopup from '../../../components/gamification/CompletionPopup';
import HeaderWithProgress from '../../../components/navigation/HeaderWithProgress';
import ExitModal from '../../../components/common/ExitModal';

const Check1_1_2_HighValueAccountsScreen = ({ navigation, route }) => {
  // ✅ PRESERVE: Exact same state management as Check 1.4
  const [userDevices, setUserDevices] = useState([]);
  const [deviceActions, setDeviceActions] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [deviceCompletionStatus, setDeviceCompletionStatus] = useState({});
  const [showExitModal, setShowExitModal] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);

  // ✅ PRESERVE: Exact same initialization logic with smart deduplication
  const initializeDeviceContent = async () => {
    try {
      // Use the new smart deduplication method to prevent device duplicates
      const allDevices = await DeviceCapabilities.getUserDevicesWithCurrentDevice();
      setUserDevices(allDevices);

      // Only create new actions if we don't have existing progress
      // Check if we have any device actions loaded from progress
      const hasExistingProgress = Object.keys(deviceActions).length > 0;
      if (!hasExistingProgress) {
        const actions = {};
        for (const device of allDevices) {
          actions[device.id] = await createHighValueAccountActions(device);
        }
        setDeviceActions(actions);
      }
    } catch (error) {
      console.error('Error initializing device content:', error);
      
      // Fallback: Create basic device actions for current device
      try {
        const currentDevice = DeviceCapabilities.getCurrentDevice();
        const fallbackDevice = {
          id: 'current-device',
          name: currentDevice.type || 'Your Device',
          type: currentDevice.platform === 'ios' || currentDevice.platform === 'android' ? 'mobile' : 'computer',
          platform: currentDevice.platform || 'unknown',
          autoDetected: true,
          supportsDeepLinks: false
        };
        
        setUserDevices([fallbackDevice]);
        
        // Only create new actions if we don't have existing progress
        const hasExistingProgress = Object.keys(deviceActions).length > 0;
        if (!hasExistingProgress) {
          setDeviceActions({
            'current-device': await createHighValueAccountActions(fallbackDevice)
          });
        }
      } catch (fallbackError) {
        console.error('Fallback device initialization failed:', fallbackError);
        // Final fallback: empty state
        setUserDevices([]);
        setDeviceActions({});
      }
    }
  };

  // ✅ UPDATED: Progress management with unified view support
  const loadProgress = async () => {
    try {
      const progressKey = `check_1-1-2_progress`;
      const progressData = await AsyncStorage.getItem(progressKey);
      
      if (progressData) {
        const progress = JSON.parse(progressData);
        
        // Check if this is old progress data (before unified view implementation)
        if (!progress.version || progress.version < 2) {
          console.log('🔄 Clearing old progress data for unified view implementation');
          await AsyncStorage.removeItem(progressKey);
          return; // Don't load old data
        }
        
        setDeviceActions(progress.deviceActions || {});
        setDeviceCompletionStatus(progress.deviceCompletionStatus || {});
        setIsCompleted(progress.isCompleted || false);
        
        // Show completion popup when returning to a completed check
        if (progress.isCompleted) {
          setShowCompletionPopup(true);
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveProgress = async () => {
    try {
      const progressKey = `check_1-1-2_progress`;
      const progressData = {
        version: 2, // Version 2 includes unified view support
        deviceActions,
        deviceCompletionStatus,
        isCompleted,
        lastUpdated: new Date().toISOString(),
      };
      await AsyncStorage.setItem(progressKey, JSON.stringify(progressData));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // ✅ PRESERVE: Standard focus effect
  useFocusEffect(
    React.useCallback(() => {
      const initializeScreen = async () => {
        await loadProgress();
        await initializeDeviceContent();
      };
      initializeScreen();
    }, [])
  );

  // ✅ PRESERVE: Save progress when actions change
  useEffect(() => {
    saveProgress();
  }, [deviceActions, deviceCompletionStatus, isCompleted]);

  // ✅ UPDATED: Action completion handler for unified view
  const handleActionComplete = async (deviceId, actionId, completed) => {
    try {
      setDeviceActions(prev => {
        const newActions = { ...prev };
        
        // For unified view, mark the action as completed for ALL devices
        // since the content is the same across all devices
        
        // Extract the action name from the actionId (remove device prefix)
        // Pattern: {deviceId}-{actionName} or {deviceId}-device-{actionName}
        const dashIndex = actionId.indexOf('-');
        let actionName = actionId.substring(dashIndex + 1);
        // Remove "device-" prefix if it exists
        if (actionName.startsWith('device-')) {
          actionName = actionName.substring(7); // Remove "device-" (7 characters)
        }
        
        for (const device of userDevices) {
          if (newActions[device.id]) {
            newActions[device.id] = newActions[device.id].map(action => {
              // Match by action name (without device prefix) instead of exact ID
              const deviceDashIndex = action.id.indexOf('-');
              let deviceActionName = action.id.substring(deviceDashIndex + 1);
              // Remove "device-" prefix if it exists
              if (deviceActionName.startsWith('device-')) {
                deviceActionName = deviceActionName.substring(7); // Remove "device-" (7 characters)
              }
              return deviceActionName === actionName ? { ...action, completed } : action;
            });
          }
        }
        
        // Check if all actions for any device are completed (they're all the same)
        const firstDeviceActions = newActions[userDevices[0]?.id] || [];
        const allCompleted = firstDeviceActions.every(action => action.completed);
        
        if (allCompleted) {
          // Mark all devices as completed
          const newCompletionStatus = {};
          userDevices.forEach(device => {
            newCompletionStatus[device.id] = true;
          });
          setDeviceCompletionStatus(newCompletionStatus);
        }

        // Check if all devices are completed
        const allDevicesCompleted = userDevices.every(device => {
          const deviceActions = newActions[device.id] || [];
          return deviceActions.every(action => action.completed);
        });

        // Completion check logging removed for production

        if (allDevicesCompleted && !isCompleted) {
          setIsCompleted(true);
          setShowCompletionPopup(true);
          celebrateCompletion();
        }
        
        return newActions;
      });
    } catch (error) {
      console.error('Error handling action completion:', error);
    }
  };

  // Calculate progress for the header
  const getProgress = () => {
    // For unified view, only count actions from the first device since they're all the same
    const firstDevice = userDevices[0];
    if (!firstDevice) return 0;
    
    const deviceActionsList = deviceActions[firstDevice.id] || [];
    const totalActions = deviceActionsList.length;
    const completedActions = deviceActionsList.filter(action => action.completed).length;
    
    // If completed, ensure progress shows 100%
    if (isCompleted) {
      return 100;
    }
    
    return totalActions > 0 ? (completedActions / totalActions) * 100 : 0;
  };

  // ✅ PRESERVE: Dynamic exit handler matching Check 1.4 pattern
  const handleExit = () => {
    setShowExitModal(true);
  };

  const handleKeepLearning = () => {
    setShowExitModal(false);
  };

  const handleExitLesson = () => {
    setShowExitModal(false);
    navigation.navigate('Welcome');
  };

  // ✅ PRESERVE: Completion celebration
  const celebrateCompletion = () => {
    console.log('🎉 Check 1.1.2 High-Value Accounts completed!');
    setShowCompletionPopup(true);
  };

  // Get copywriting content for rendering
  const copywritingContent = CopywritingService.getCheckContent('1-1-2');



  // Helper function to get device icon
  const getDeviceIcon = (device) => {
    const platform = device.platform || device.tier2;
    const type = device.type;
    
    if (type === 'mobile') {
      return platform === 'ios' ? 'phone-portrait' : 'phone-portrait';
    } else if (type === 'computer') {
      return platform === 'macos' ? 'laptop' : 'desktop';
    }
    
    return 'desktop';
  };

  // ✅ CRITICAL: Avoid variable name conflicts
  const createHighValueAccountActions = async (device) => {
    const deviceActionsList = [];
    const platform = device.platform || device.tier2;
    const type = device.type;

    // Get copywriting content for device actions
    const copywritingContent = CopywritingService.getCheckContent('1-1-2');
    const deviceActionsContent = copywritingContent.deviceActions || {};
    
    // Ensure all content is properly formatted as strings
    const safeGetString = (obj, key, fallback = '') => {
      const value = obj?.[key];
      if (typeof value === 'string') return value;
      if (typeof value === 'object' && value !== null) {
        console.warn(`Expected string for ${key}, got object:`, value);
        return fallback;
      }
      return fallback;
    };

    // Universal high-value account actions (not device-specific)
    deviceActionsList.push(
      {
        id: `${device.id}-identify-accounts`,
        title: safeGetString(deviceActionsContent.identifyAccounts, 'title', 'Identify Your High-Value Accounts'),
        description: safeGetString(deviceActionsContent.identifyAccounts, 'description', 'Make a list of accounts that could cause serious problems if compromised'),
        completed: false,
        steps: Array.isArray(deviceActionsContent.identifyAccounts?.steps) ? deviceActionsContent.identifyAccounts.steps : [
          'Write down your primary email address (this controls everything else)',
          'List all banking and credit card accounts you access online',
          'Add cloud storage accounts (Google Drive, iCloud, Dropbox, OneDrive)',
          'Include work email and any business accounts you manage',
          '(Optional) Add social media accounts',
          'Verify each account: ask "would losing this cause major problems?"'
        ],
        tips: Array.isArray(deviceActionsContent.identifyAccounts?.tips) ? deviceActionsContent.identifyAccounts.tips : [
          'Your email account can reset passwords for all other accounts',
          'Financial accounts pose immediate monetary risk if compromised',
          'Cloud accounts often contain personal photos, documents, and backups',
          'Work accounts can affect your employment and colleagues\' security'
        ]
      },
      {
        id: `${device.id}-enable-email-mfa`,
        title: safeGetString(deviceActionsContent.enableEmailMFA, 'title', 'Secure Your Email Account First'),
        description: safeGetString(deviceActionsContent.enableEmailMFA, 'description', 'Enable two-factor authentication on your primary email account'),
        completed: false,
        steps: Array.isArray(deviceActionsContent.enableEmailMFA?.steps) ? deviceActionsContent.enableEmailMFA.steps : [
          'Open your email provider (Gmail, Outlook, Yahoo, etc.) in a web browser',
          'Go to Account Settings → Security (or search "two-factor authentication")',
          'Click "Set up 2-step verification" or similar option',
          'Choose authenticator app method (better than SMS)',
          'Download Google Authenticator, Microsoft Authenticator, or Authy app',
          'Scan the QR code with your authenticator app',
          'Enter the 6-digit code to confirm setup',
          'Download and save backup codes in a secure location',
          'Test by logging out and logging back in'
        ],
        tips: Array.isArray(deviceActionsContent.enableEmailMFA?.tips) ? deviceActionsContent.enableEmailMFA.tips : [
          'Email 2FA protects all accounts since most use email for password recovery',
          'Authenticator apps are more secure than SMS text messages',
          'Save backup codes in a password manager or secure physical location',
          'If you only secure one account, make it your email'
        ]
      },
      {
        id: `${device.id}-enable-banking-mfa`,
        title: safeGetString(deviceActionsContent.enableBankingMFA, 'title', 'Secure Banking and Financial Accounts'),
        description: safeGetString(deviceActionsContent.enableBankingMFA, 'description', 'Add two-factor authentication to all accounts that handle your money'),
        completed: false,
        steps: Array.isArray(deviceActionsContent.enableBankingMFA?.steps) ? deviceActionsContent.enableBankingMFA.steps : [
          'Log into your bank\'s website or mobile app',
          'Look for "Security Settings", "Account Security", or "Two-Factor Authentication"',
          'Enable 2FA using your bank\'s preferred method (SMS, app, or calls)',
          'Test the setup by logging out and back in',
          'Repeat for credit cards, investment accounts, and payment services (PayPal, Venmo)',
          'Enable alerts for account logins',
        ],
        tips: Array.isArray(deviceActionsContent.enableBankingMFA?.tips) ? deviceActionsContent.enableBankingMFA.tips : [
          'Banks often use SMS 2FA - it\'s better than no 2FA at all',
          'Enable email AND text alerts for maximum monitoring',
          'Check account activity weekly, even if you get alerts',
          'Report suspicious activity immediately to your bank\'s fraud line'
        ]
      },
      {
        id: `${device.id}-secure-recovery`,
        title: safeGetString(deviceActionsContent.secureRecovery, 'title', 'Set Up Secure Account Recovery'),
        description: safeGetString(deviceActionsContent.secureRecovery, 'description', 'Ensure you can recover accounts safely if locked out'),
        completed: false,
        steps: Array.isArray(deviceActionsContent.secureRecovery?.steps) ? deviceActionsContent.secureRecovery.steps : [
          'Review recovery email addresses for each high-value account',
          'Use a separate, secure email for recovery (not your daily email)',
          'Update phone numbers and remove old, unused numbers',
          'Set up security questions with answers only you would know',
          'Download backup codes for accounts that provide them',
          'Store all recovery information in a password manager or secure location',
          'Test recovery process: try "forgot password" to see what information is required'
        ],
        tips: Array.isArray(deviceActionsContent.secureRecovery?.tips) ? deviceActionsContent.secureRecovery.tips : [
          'Use nonsensical but memorable answers to security questions ("favorite pet" = "BlueCoffee42")',
          'A dedicated recovery email adds an extra layer of security',
          'Backup codes are like master keys - store them very securely',
          'Update recovery info whenever you change phone numbers or emails'
        ]
      }
    );

    return deviceActionsList;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* ✅ UPDATED: Header with progress bar */}
      <HeaderWithProgress
        checkId="1-1-2"
        onExit={handleExit}
        isCompleted={isCompleted}
        progress={getProgress()}
        navigation={navigation}
      />
      
      {/* ✅ STANDARDIZED: Exit Modal using common component */}
      <ExitModal
        visible={showExitModal}
        onClose={() => setShowExitModal(false)}
        onKeepLearning={handleKeepLearning}
        onExit={handleExitLesson}
        icon="🏦"
        title="Wait, don't go!"
        message="You're securing your most important accounts with advanced protection. Don't leave your banking and email vulnerable!"
      />
      
      {/* 🎨 REVISED: TimelineDashboard with account security timeline */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
          {/* Title and Description */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{copywritingContent.title || 'High-Value Account Security'}</Text>
        <Text style={styles.description}>
              {copywritingContent.description || 'Secure your most important accounts with advanced protection. Follow this timeline to build comprehensive security for your banking, email, and critical accounts.'}
        </Text>
      </View>

      {/* Learn More Section */}
      <TouchableOpacity
        style={styles.learnMoreButton}
        onPress={() => setShowLearnMore(!showLearnMore)}
        activeOpacity={0.8}
      >
        <Text style={styles.learnMoreText}>Why are high-value accounts important?</Text>
        <Ionicons
          name={showLearnMore ? 'chevron-up' : 'chevron-down'}
          size={Responsive.iconSizes.medium}
          color={Colors.accent}
        />
      </TouchableOpacity>

      {showLearnMore && (
        <View style={styles.learnMoreContent}>
          <Text style={styles.learnMoreTitle}>High-Value Account Protection Benefits</Text>
          <Text style={styles.learnMoreBody}>
            High-value accounts are like the crown jewels of your digital life - they contain your most sensitive information and provide access to everything else. Your email account, for example, is often the key to resetting passwords for all your other accounts. If a hacker gets into your email, they can potentially access your bank accounts, social media, and even your work systems. Your cloud storage might contain years of personal photos, important documents, and private conversations. And your financial accounts? Well, those are literally your money. By securing these high-value accounts with extra protection like two-factor authentication and strong passwords, you're building a fortress around your most important digital assets. It's like having a security guard specifically for your most valuable possessions - the extra effort is worth it because the stakes are so high.
          </Text>
        </View>
      )}

          {/* Account Security Timeline */}
          {userDevices.length > 0 && Object.keys(deviceActions).length > 0 ? (
            <TimelineDashboard
              userDevices={userDevices}
              deviceActions={deviceActions}
              onActionComplete={handleActionComplete}
              variant="timeline"
              checkId="1-1-2"
              navigation={navigation}
              showUnifiedView={true}
              showProgressHeader={false}
            />
          ) : (
            <View style={styles.fallbackContainer}>
              <Text style={styles.fallbackTitle}>Setting Up Account Security</Text>
              <Text style={styles.fallbackText}>
                We're preparing personalized account security recommendations for your high-value accounts.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={initializeDeviceContent}
              >
                <Text style={styles.retryButtonText}>Retry Setup</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Security Best Practices */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>🛡️ High-Value Account Best Practices</Text>
            <View style={styles.tipItem}>
              <Ionicons name="shield-checkmark" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Enable two-factor authentication on all critical accounts</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="key" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Use unique, strong passwords for each high-value account</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="notifications" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Enable security alerts and login notifications</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="refresh" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Regularly review account activity and access logs</Text>
            </View>
          </View>

          {/* References Section */}
          <ReferencesSection references={getReferencesForCheck('1-1-2')} />

        </View>
      </ScrollView>
      
      {/* Completion Status */}
      <CompletionPopup
        isVisible={showCompletionPopup}
        title={getCompletionMessage('1-1-2').title}
        description={getCompletionMessage('1-1-2').description}
        nextScreenName={getNextScreenName('1-1-2')}
        navigation={navigation}
        onClose={() => setShowCompletionPopup(false)}
        variant="modal"
        checkId="1-1-2"
        animationType="confetti"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.padding.button,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuButton: {
    width: Responsive.iconSizes.xlarge,
    height: Responsive.iconSizes.xlarge,
    borderRadius: Responsive.iconSizes.xlarge / 2,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  headerSpacer: {
    width: Responsive.iconSizes.xlarge,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Responsive.padding.screen,
  },
  titleSection: {
    marginBottom: Responsive.spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
    lineHeight: Typography.sizes.xxl * 1.3,
  },
  description: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * 1.5,
    marginBottom: Responsive.spacing.lg,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Responsive.padding.screen,
  },
  fallbackTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
    textAlign: 'center',
  },
  fallbackText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.5,
    marginBottom: Responsive.spacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    borderRadius: Responsive.borderRadius.medium,
  },
  retryButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Responsive.padding.button,
    marginBottom: Responsive.spacing.md,
  },
  learnMoreText: {
    fontSize: Typography.sizes.md,
    color: Colors.accent,
    fontWeight: Typography.weights.semibold,
  },
  learnMoreContent: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.card,
    marginBottom: Responsive.spacing.lg,
  },
  learnMoreTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  learnMoreBody: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.sm * 1.4,
  },
  tipsSection: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.card,
    marginBottom: Responsive.spacing.lg,
  },
  tipsTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.spacing.sm,
  },
  tipText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginLeft: Responsive.spacing.sm,
    flex: 1,
    lineHeight: Typography.sizes.sm * 1.4,
  },
});

export default Check1_1_2_HighValueAccountsScreen;
