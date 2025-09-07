import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Responsive, CommonStyles } from '../../../theme';
import ReferencesSection from '../../../components/ui/ReferencesSection';
import { getReferencesForCheck } from '../../../data/references';
import { DeviceCapabilities } from '../../../utils/deviceCapabilities';
import CollapsibleDeviceSection from '../../../components/forms/CollapsibleDeviceSection';
import { SettingsGuide } from '../../../utils/settingsGuide';
import * as Haptics from 'expo-haptics';
import CompletionPopup from '../../../components/gamification/CompletionPopup';
import { getCompletionMessage, getNextScreenName } from '../../../utils/completionMessages';
import { CopywritingService } from '../../../utils/copywritingService';
import HeaderWithProgress from '../../../components/navigation/HeaderWithProgress';
import ExitModal from '../../../components/common/ExitModal';

/**
 * Check1_4_MFASetupScreen - Pattern B Implementation
 * 
 * Multi-Factor Authentication setup with both authenticator apps
 * and platform biometrics. Applies proven Pattern B architecture:
 * - User-controlled advancement
 * - Device-specific content delivery
 * - Both discrete authenticator apps AND platform biometrics
 * - Proper progress persistence
 */
const Check1_4_MFASetupScreen = ({ navigation, route }) => {
  // Core state
  const [userDevices, setUserDevices] = useState([]);
  const [deviceActions, setDeviceActions] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);

  // Track completion per device
  const [deviceCompletionStatus, setDeviceCompletionStatus] = useState({});

  useEffect(() => {
    initializeDeviceContent();
    loadProgress();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadProgress();
      // Reset completion state when screen comes into focus
      // This ensures the completion popup doesn't stay visible after navigation
      setIsCompleted(false);
    }, [])
  );

  const initializeDeviceContent = async () => {
    try {
      // Use the new smart deduplication method to prevent device duplicates
      const allDevices = await DeviceCapabilities.getUserDevicesWithCurrentDevice();
      setUserDevices(allDevices);

      // Create device-specific actions for MFA setup
      const actions = {};
      for (const device of allDevices) {
        actions[device.id] = await createMFAActions(device);
      }
      setDeviceActions(actions);

    } catch (error) {
      console.error('Error initializing device content:', error);
      // Fallback to current device only
      const currentDevice = DeviceCapabilities.getCurrentDevice();
      const fallbackDevice = {
        id: 'current-device',
        name: currentDevice.type,
        platform: currentDevice.platform,
        autoDetected: true,
        supportsDeepLinks: currentDevice.supportsDeepLinks
      };
      setUserDevices([fallbackDevice]);
      setDeviceActions({
        'current-device': await createMFAActions(fallbackDevice)
      });
    }
  };

  const createMFAActions = async (device) => {
    const platform = device.platform || device.tier2;
    const settingsGuide = SettingsGuide.createGuidance('security', device);
    const authenticatorApps = SettingsGuide.getRecommendedApps('authenticator', platform);

    // Get copywriting content for device actions
    const copywritingContent = CopywritingService.getCheckContent('1-1-4');
    const deviceActionsContent = copywritingContent.deviceActions || {};

    const actions = [
      {
        id: `${device.id}-setup-authenticator`,
        title: deviceActionsContent.setupAuthenticator?.title || 'Set Up Authenticator App',
        description: deviceActionsContent.setupAuthenticator?.description || 'Install and configure an authenticator app for secure 2FA codes',
        completed: false,
        steps: deviceActionsContent.setupAuthenticator?.steps || [
          'Download Google Authenticator, Microsoft Authenticator, or Authy from your app store',
          'Open the authenticator app and tap "Add account" or "+" button',
          'Choose "Scan QR code" when setting up 2FA on websites',
          'Test by setting up 2FA on a less critical account first (like Reddit or Discord)',
          'Verify the 6-digit codes work by logging out and back in',
          'Enable app backup/sync if available (Authy auto-syncs, others may need setup)'
        ],
        tips: deviceActionsContent.setupAuthenticator?.tips || [
          'Google Authenticator is simple but doesn\'t sync across devices',
          'Microsoft Authenticator syncs with your Microsoft account',
          'Authy automatically syncs across devices and has backup features',
          'Test each setup immediately to ensure codes work'
        ],
        deepLink: authenticatorApps.length > 0 ? authenticatorApps[0].url : null,
        verification: 'manual',
        priority: 'critical',
        apps: authenticatorApps
      },
      {
        id: `${device.id}-enable-email-mfa`,
        title: deviceActionsContent.enableEmailMFA?.title || 'Secure Your Email with MFA',
        description: deviceActionsContent.enableEmailMFA?.description || 'Enable two-factor authentication on your primary email account',
        completed: false,
        steps: deviceActionsContent.enableEmailMFA?.steps || [
          'Log into your email (Gmail, Outlook, Yahoo, etc.) on a computer',
          'Go to Account Settings → Security (search for "2-step verification")',
          'Click "Turn on 2-step verification" or similar',
          'Choose "Authenticator app" method (not SMS)',
          'Open your authenticator app and scan the QR code shown',
          'Enter the 6-digit code to confirm setup',
          'Download and securely save the backup codes provided',
          'Test by logging out and back in using your phone for the code'
        ],
        tips: deviceActionsContent.enableEmailMFA?.tips || [
          'Email is the master key - secure this first above all others',
          'Use authenticator apps instead of SMS to prevent SIM swapping',
          'Print backup codes and store them in a safe place',
          'Set up 2FA on your recovery email address too'
        ],
        verification: 'manual',
        priority: 'critical'
      },
      {
        id: `${device.id}-enable-banking-mfa`,
        title: deviceActionsContent.enableBankingMFA?.title || 'Secure Your Financial Accounts',
        description: deviceActionsContent.enableBankingMFA?.description || 'Add MFA to all accounts that handle your money',
        completed: false,
        steps: deviceActionsContent.enableBankingMFA?.steps || [
          'Log into your bank\'s website or app',
          'Look for "Security Settings", "Two-Factor Authentication", or "Additional Security"',
          'Enable the strongest option available (app > SMS > calls)',
          'If only SMS is available, enable it (better than nothing)',
          'Test the setup by logging out and back in',
          'Repeat for credit cards, investment accounts, and payment apps (PayPal, Venmo)',
          'Enable account alerts for all login attempts and transactions'
        ],
        tips: deviceActionsContent.enableBankingMFA?.tips || [
          'Banks often use SMS 2FA - accept this as it\'s still much better than passwords alone',
          'Enable both login alerts and transaction notifications',
          'Some banks offer hardware tokens - these are the most secure option',
          'Report any unrecognized login alerts immediately'
        ],
        verification: 'manual',
        priority: 'critical'
      },
      {
        id: `${device.id}-enable-critical-mfa`,
        title: deviceActionsContent.enableCriticalMFA?.title || 'Secure All Critical Accounts',
        description: deviceActionsContent.enableCriticalMFA?.description || 'Enable MFA on cloud storage, social media, and work accounts',
        completed: false,
        steps: deviceActionsContent.enableCriticalMFA?.steps || [
          'Cloud storage: Enable 2FA on Google Drive, iCloud, Dropbox, OneDrive',
          'Social media: Enable 2FA on Facebook, Instagram, Twitter, LinkedIn',
          'Work accounts: Enable 2FA on work email, Microsoft 365, Google Workspace',
          'Shopping: Enable 2FA on Amazon, PayPal, and frequent shopping sites',
          'For each account: use authenticator app method when available',
          'Save backup codes for each account in your password manager'
        ],
        tips: deviceActionsContent.enableCriticalMFA?.tips || [
          'Prioritize accounts that store personal data or have many contacts',
          'Social media accounts are often targeted for scamming your contacts',
          'Work accounts protect both personal and company information',
          'Some services offer backup methods - enable multiple when available'
        ],
        verification: 'manual',
        priority: 'high'
      }
    ];

    return actions;
  };

  const getDeviceIcon = (device) => {
    const iconMap = {
      'iPhone': 'phone-portrait',
      'iPad': 'tablet-portrait',
      'Android Phone': 'phone-portrait',
      'Android Tablet': 'tablet-portrait',
      'MacBook': 'laptop',
      'iMac': 'desktop',
      'Windows': 'laptop',
      'Computer': 'desktop',
    };
    return iconMap[device.type] || 'phone-portrait';
  };

  const loadProgress = async () => {
    try {
      const progressData = await AsyncStorage.getItem('check_1-1-4_progress');
      const completedData = await AsyncStorage.getItem('check_1-1-4_completed');
      
      if (progressData) {
        const data = JSON.parse(progressData);
        setIsCompleted(data.isCompleted || false);
        setDeviceCompletionStatus(data.deviceCompletionStatus || {});
        
        // Restore action completion states
        if (data.deviceActions) {
          setDeviceActions(prev => {
            const updated = { ...prev };
            Object.keys(data.deviceActions).forEach(deviceId => {
              if (updated[deviceId]) {
                updated[deviceId] = updated[deviceId].map(action => {
                  const savedAction = data.deviceActions[deviceId].find(a => a.id === action.id);
                  return savedAction ? { ...action, completed: savedAction.completed } : action;
                });
              }
            });
            return updated;
          });
        }
      }
      
      if (completedData === 'completed') {
        setIsCompleted(true);
        // Don't automatically show completion popup when loading progress
        // Only show it when the user actually completes the check
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveProgress = async () => {
    try {
      const progressData = {
        isCompleted,
        deviceCompletionStatus,
        deviceActions,
        completedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('check_1-1-4_progress', JSON.stringify(progressData));
      
      if (isCompleted) {
        await AsyncStorage.setItem('check_1-1-4_completed', 'completed');
      } else {
        await AsyncStorage.removeItem('check_1-1-4_completed');
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleActionComplete = async (deviceId, actionId, completed) => {
    // Update action completion status
    const updatedDeviceActions = { ...deviceActions };
    if (updatedDeviceActions[deviceId]) {
      updatedDeviceActions[deviceId] = updatedDeviceActions[deviceId].map(action =>
        action.id === actionId ? { ...action, completed } : action
      );
    }
    setDeviceActions(updatedDeviceActions);

    // Check if all actions for this device are completed
    const deviceCompleted = updatedDeviceActions[deviceId]?.every(action => action.completed) || false;
    
    // Update device completion status
    const updatedDeviceCompletionStatus = {
      ...deviceCompletionStatus,
      [deviceId]: deviceCompleted
    };
    setDeviceCompletionStatus(updatedDeviceCompletionStatus);

    // Check if all devices are completed
    const allDevicesCompleted = userDevices.every(device => {
      return updatedDeviceCompletionStatus[device.id] === true;
    });

    if (allDevicesCompleted && !isCompleted) {
      setIsCompleted(true);
        setShowCompletionPopup(true);
      if (Haptics?.impactAsync) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
      
      // Save progress immediately with the new completion status
      setTimeout(async () => {
        try {
          const progressData = {
            isCompleted: true,
            deviceCompletionStatus: updatedDeviceCompletionStatus,
            deviceActions: updatedDeviceActions,
            completedAt: new Date().toISOString(),
          };
          
          await AsyncStorage.setItem('check_1-1-4_progress', JSON.stringify(progressData));
          await AsyncStorage.setItem('check_1-1-4_completed', 'completed');
        } catch (error) {
          console.error('Error saving completion progress:', error);
        }
      }, 50);
      
      celebrateCompletion();
    } else {
      // Save progress for partial completion
      setTimeout(saveProgress, 100);
    }
  };

  const celebrateCompletion = () => {
    console.log('🎉 Celebrating completion of Check 1.1.4');
    setShowCompletionPopup(true);
  };

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

  const getOverallProgress = () => {
    const totalActions = Object.values(deviceActions).flat().length;
    const completedActions = Object.values(deviceActions).flat().filter(action => action.completed).length;
    return totalActions > 0 ? (completedActions / totalActions) * 100 : 0;
  };

  // Calculate progress for the header
  const getProgress = () => {
    const totalActions = Object.values(deviceActions).flat().length;
    const completedActions = Object.values(deviceActions).flat().filter(action => action.completed).length;
    return totalActions > 0 ? (completedActions / totalActions) * 100 : 0;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* ✅ UPDATED: Header with progress bar */}
      <HeaderWithProgress
        checkId="1-1-4"
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
        icon="🔐"
        title="Wait, don't go!"
        message="You're about to supercharge your account security with multi-factor authentication. Don't miss this critical protection!"
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Title and Description */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Set Up Multi-Factor Authentication</Text>
            <Text style={styles.description}>
              Add an extra layer of security to your accounts with both authenticator apps and biometric verification. This makes your accounts nearly impossible to hack.
            </Text>
            
            {/* Progress Indicator */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Setup Progress</Text>
                <Text style={styles.progressPercentage}>{Math.round(getOverallProgress())}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${getOverallProgress()}%` }
                  ]} 
                />
              </View>
            </View>
          </View>

          {/* Learn More Section */}
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={() => setShowLearnMore(!showLearnMore)}
            activeOpacity={0.8}
          >
            <Text style={styles.learnMoreText}>Why use multi-factor authentication?</Text>
            <Ionicons
              name={showLearnMore ? 'chevron-up' : 'chevron-down'}
              size={Responsive.iconSizes.medium}
              color={Colors.accent}
            />
          </TouchableOpacity>

          {showLearnMore && (
            <View style={styles.learnMoreContent}>
              <Text style={styles.learnMoreTitle}>Multi-Factor Authentication Benefits</Text>
              <Text style={styles.learnMoreBody}>
                Multi-factor authentication blocks 99.9% of automated attacks and protects your accounts even if passwords are compromised. It works seamlessly with banking, email, and social media platforms, providing quick access through biometric verification while giving you peace of mind that your accounts are secure. Many security frameworks now require MFA as a standard protection measure.
              </Text>
            </View>
          )}

          {/* Device-Specific Sections */}
          <View style={styles.devicesSection}>
            <Text style={styles.devicesSectionTitle}>MFA Setup by Device</Text>
            <Text style={styles.devicesSectionSubtitle}>
              Set up both authenticator apps and biometric authentication on each device for complete protection
            </Text>

            {userDevices.length > 0 ? (
              userDevices.map((device) => (
                <CollapsibleDeviceSection
                  key={device.id}
                  device={device}
                  actions={deviceActions[device.id] || []}
                  defaultExpanded={device.autoDetected || userDevices.length === 1}
                  onActionComplete={handleActionComplete}
                  style={styles.deviceSection}
                  variant="pattern-b"
                />
              ))
            ) : (
              <View style={styles.noDevicesContainer}>
                <Ionicons 
                  name="shield-checkmark" 
                  size={Responsive.iconSizes.xxlarge} 
                  color={Colors.textSecondary} 
                />
                <Text style={styles.noDevicesTitle}>No Devices Found</Text>
                <Text style={styles.noDevicesText}>
                  Add your devices in the Profile tab to get personalized MFA setup recommendations.
                </Text>
                <TouchableOpacity
                  style={styles.addDevicesButton}
                  onPress={() => navigation.navigate('Profile')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addDevicesButtonText}>Add Devices</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Security Tips */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>🔐 MFA Best Practices</Text>
            <View style={styles.tipItem}>
              <Ionicons name="apps" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Use authenticator apps instead of SMS when possible</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="finger-print" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Enable biometric unlock for quick daily access</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="shield-checkmark" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Enable MFA on all important accounts (banking, email, social)</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="copy" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Save backup codes in a secure location</Text>
            </View>
          </View>

          {/* Completion Status */}
          <CompletionPopup
          isVisible={showCompletionPopup}
          title={getCompletionMessage('1-1-4').title}
          description={getCompletionMessage('1-1-4').description}
          nextScreenName={getNextScreenName('1-1-4')}
          navigation={navigation}
                      onContinue={() => {
              setIsCompleted(false);
              navigation.navigate(getNextScreenName('1-1-4'));
            }}
          variant="modal"
            onClose={() => setShowCompletionPopup(false)}
            checkId="1-1-4"
            animationType="confetti"
          />
          {/* References Section */}
          <ReferencesSection references={getReferencesForCheck('1-1-4')} />

        </View>
      </ScrollView>
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
  progressSection: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.card,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Responsive.spacing.sm,
  },
  progressTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  progressPercentage: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.accent,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.overlayLight,
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 3,
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
  devicesSection: {
    marginBottom: Responsive.spacing.lg,
  },
  devicesSectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  devicesSectionSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Responsive.spacing.lg,
    lineHeight: Typography.sizes.sm * 1.4,
  },
  deviceSection: {
    marginBottom: Responsive.spacing.md,
  },
  noDevicesContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.modal,
    alignItems: 'center',
  },
  noDevicesTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginTop: Responsive.spacing.md,
    marginBottom: Responsive.spacing.sm,
  },
  noDevicesText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.4,
    marginBottom: Responsive.spacing.lg,
  },
  addDevicesButton: {
    backgroundColor: Colors.accent,
    borderRadius: Responsive.borderRadius.medium,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    minHeight: Responsive.buttonHeight.medium,
  },
  addDevicesButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
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
  completionCard: {
    backgroundColor: Colors.successSoft,
    borderRadius: Responsive.borderRadius.xlarge,
    padding: Responsive.padding.modal,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  completionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: Responsive.spacing.sm,
    marginBottom: Responsive.spacing.sm,
  },
  completionText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.4,
    marginBottom: Responsive.spacing.lg,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    borderRadius: Responsive.borderRadius.medium,
    gap: Responsive.spacing.sm,
    minHeight: Responsive.buttonHeight.medium,
  },
  continueButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },

});

export default Check1_4_MFASetupScreen;