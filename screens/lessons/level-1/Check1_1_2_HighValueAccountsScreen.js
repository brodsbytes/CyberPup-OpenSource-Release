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

  // ✅ PRESERVE: Exact same initialization logic
  const initializeDeviceContent = async () => {
    try {
      const devices = await DeviceCapabilities.getUserDevices();
      const currentDevice = DeviceCapabilities.getCurrentDevice();
      
      let allDevices = [...devices];
      const hasCurrentDevice = devices.some(d => 
        d.platform === currentDevice.platform && d.type === currentDevice.type
      );
      
      if (!hasCurrentDevice) {
        allDevices.unshift({
          id: 'current-device',
          name: currentDevice.type,
          type: currentDevice.platform === 'ios' || currentDevice.platform === 'android' ? 'mobile' : 'computer',
          platform: currentDevice.platform,
          tier2: currentDevice.platform,
          autoDetected: true,
          supportsDeepLinks: currentDevice.supportsDeepLinks,
          icon: getDeviceIcon(currentDevice)
        });
      }

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

    // Universal high-value account actions (not device-specific)
    deviceActionsList.push(
      {
        id: `${device.id}-identify-high-value-accounts`,
        title: 'Identify High-Value Accounts',
        description: 'List your most important accounts that need extra protection.',
        completed: false,
        steps: [
          'Banking and financial accounts',
          'Email accounts (especially recovery emails)',
          'Social media accounts',
          'Cloud storage accounts',
          'Work or business accounts'
        ],
        tips: [
          'Focus on accounts that could cause financial loss',
          'Include accounts that control access to other services',
          'Consider accounts with sensitive personal information'
        ]
      },
      {
        id: `${device.id}-enable-2fa-banking`,
        title: 'Enable 2FA on Banking Accounts',
        description: 'Add two-factor authentication to all your financial accounts.',
        completed: false,
        steps: [
          'Log into your banking app or website',
          'Navigate to Security or Account Settings',
          'Look for "Two-Factor Authentication" or "2FA"',
          'Enable SMS, app-based, or hardware key authentication',
          'Test the setup with a small transaction'
        ],
        tips: [
          'Use app-based 2FA (like Google Authenticator) when possible',
          'Keep backup codes in a secure location',
          'Consider using a hardware security key for maximum protection'
        ]
      },
      {
        id: `${device.id}-enable-2fa-email`,
        title: 'Enable 2FA on Email Accounts',
        description: 'Secure your email accounts with two-factor authentication.',
        completed: false,
        steps: [
          'Log into your email provider (Gmail, Outlook, etc.)',
          'Go to Account Settings or Security',
          'Find "Two-Step Verification" or "2FA"',
          'Enable authentication method of your choice',
          'Verify setup with a test login'
        ],
        tips: [
          'Email accounts are often used for password recovery',
          'Secure these first before other accounts',
          'Use app-based 2FA instead of SMS when possible'
        ]
      },
      {
        id: `${device.id}-review-recovery-options`,
        title: 'Review Recovery Options',
        description: 'Set up secure recovery methods for your high-value accounts.',
        completed: false,
        steps: [
          'Check recovery email addresses',
          'Verify phone numbers for SMS recovery',
          'Set up security questions with unique answers',
          'Download backup codes if available',
          'Store recovery information securely'
        ],
        tips: [
          'Use different recovery emails for different accounts',
          'Don\'t use easily guessable security questions',
          'Keep backup codes in a password manager or secure location'
        ]
      },
      {
        id: `${device.id}-monitor-account-activity`,
        title: 'Set Up Account Monitoring',
        description: 'Enable notifications for suspicious account activity.',
        completed: false,
        steps: [
          'Enable login notifications',
          'Set up transaction alerts',
          'Review recent account activity',
          'Enable suspicious activity alerts',
          'Check for unrecognized devices'
        ],
        tips: [
          'Review account activity regularly',
          'Report suspicious activity immediately',
          'Keep contact information updated for alerts'
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
            <Text style={styles.title}>High-Value Account Security</Text>
        <Text style={styles.description}>
              Secure your most important accounts with advanced protection. Follow this timeline to build comprehensive security for your banking, email, and critical accounts.
        </Text>
        

      </View>

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


});

export default Check1_1_2_HighValueAccountsScreen;
