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
  Alert,
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
import HeaderWithProgress from '../../../components/navigation/HeaderWithProgress';
import ExitModal from '../../../components/common/ExitModal';

/**
 * Check1_3_PasswordManagersScreen - Pattern B Implementation
 * 
 * Enhanced password manager setup with device-specific recommendations
 * and guided app installation flows. Applies Phase 1 lessons:
 * - User-controlled advancement
 * - Contextual actions based on device capabilities
 * - Device-specific content delivery
 * - Proper progress persistence
 */
const Check1_3_PasswordManagersScreen = ({ navigation, route }) => {
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
      // Get user's registered devices
      const devices = await DeviceCapabilities.getUserDevices();
      const currentDevice = DeviceCapabilities.getCurrentDevice();
      
      // Add current device if not already in the list
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

      // Create device-specific actions for password manager setup
      const actions = {};
      for (const device of allDevices) {
        actions[device.id] = await createPasswordManagerActions(device);
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
        'current-device': await createPasswordManagerActions(fallbackDevice)
      });
    }
  };

  const createPasswordManagerActions = async (device) => {
    const platform = device.platform || device.tier2;
    const settingsGuide = SettingsGuide.createGuidance('password-manager', device);
    const recommendedApps = settingsGuide.getRecommendedApps('password-manager');

    const actions = [
      {
        id: `${device.id}-install`,
        title: 'Install Password Manager App',
        description: 'Download a secure password manager from your device\'s app store',
        completed: false,
        steps: [
          'Open your device\'s app store',
          'Search for a password manager app',
          'Install your chosen password manager',
          'Create an account with the app'
        ],
        deepLink: recommendedApps.length > 0 ? recommendedApps[0].url : null,
        verification: 'app_installed',
        priority: 'high',
        apps: recommendedApps
      },
      {
        id: `${device.id}-setup`,
        title: 'Complete Initial Setup',
        description: 'Set up your master password and security settings',
        completed: false,
        steps: [
          'Open your password manager app',
          'Create a strong master password',
          'Complete the security setup wizard',
          'Import existing passwords if available'
        ],
        verification: 'manual',
        priority: 'high'
      },
      {
        id: `${device.id}-biometric`,
        title: 'Enable Biometric Unlock',
        description: 'Set up fingerprint or face recognition for quick access',
        completed: false,
        steps: platform === 'ios' ? [
          'Open your password manager app',
          'Go to Settings or Security',
          'Enable Face ID or Touch ID',
          'Test the biometric unlock'
        ] : platform === 'android' ? [
          'Open your password manager app',
          'Go to Settings or Security',
          'Enable Fingerprint or Face unlock',
          'Test the biometric unlock'
        ] : [
          'Open your password manager app',
          'Go to Settings or Security',
          'Enable biometric unlock if available',
          'Test the unlock method'
        ],
        verification: 'manual',
        priority: 'medium'
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
      const progressData = await AsyncStorage.getItem('check_1-1-3_progress');
      const completedData = await AsyncStorage.getItem('check_1-1-3_completed');
      
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
      
      await AsyncStorage.setItem('check_1-1-3_progress', JSON.stringify(progressData));
      
      if (isCompleted) {
        await AsyncStorage.setItem('check_1-1-3_completed', 'completed');
      } else {
        await AsyncStorage.removeItem('check_1-1-3_completed');
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
          
          await AsyncStorage.setItem('check_1-1-3_progress', JSON.stringify(progressData));
          await AsyncStorage.setItem('check_1-1-3_completed', 'completed');
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
    // The completion popup will be shown automatically when isCompleted is true
    // No need to call it as a function
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
        checkId="1-1-3"
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
        icon="😢"
        title="Wait, don't go!"
        message="You're making great progress on securing your passwords. Don't lose momentum now!"
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Title and Description */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Set Up Password Managers</Text>
            <Text style={styles.description}>
              Configure secure password managers on all your devices. This creates strong, unique passwords and makes login easier and safer.
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
            <Text style={styles.learnMoreText}>Why use password managers?</Text>
            <Ionicons
              name={showLearnMore ? 'chevron-up' : 'chevron-down'}
              size={Responsive.iconSizes.medium}
              color={Colors.accent}
            />
          </TouchableOpacity>

          {showLearnMore && (
            <View style={styles.learnMoreContent}>
              <Text style={styles.learnMoreTitle}>Password Manager Benefits</Text>
              <Text style={styles.learnMoreBody}>
                • Generate strong, unique passwords automatically{'\n'}
                • Store all passwords securely in one place{'\n'}
                • Auto-fill passwords on websites and apps{'\n'}
                • Sync across all your devices{'\n'}
                • Protect against password reuse attacks{'\n'}
                • Alert you to compromised passwords
              </Text>
            </View>
          )}

          {/* Device-Specific Sections */}
          <View style={styles.devicesSection}>
            <Text style={styles.devicesSectionTitle}>Password Manager Setup by Device</Text>
            <Text style={styles.devicesSectionSubtitle}>
              Configure password managers on each of your devices for complete protection
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
                  name="phone-portrait" 
                  size={Responsive.iconSizes.xxlarge} 
                  color={Colors.textSecondary} 
                />
                <Text style={styles.noDevicesTitle}>No Devices Found</Text>
                <Text style={styles.noDevicesText}>
                  Add your devices in the Profile tab to get personalized security recommendations.
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
            <Text style={styles.tipsTitle}>🔐 Security Best Practices</Text>
            <View style={styles.tipItem}>
              <Ionicons name="shield-checkmark" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Choose a password manager with zero-knowledge encryption</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="key" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Use a strong, memorable master password</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="sync" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Enable sync to access passwords on all devices</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="finger-print" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Enable biometric unlock where available</Text>
            </View>
          </View>

          {/* Completion Status */}
          <CompletionPopup
          isVisible={showCompletionPopup}
          title={getCompletionMessage('1-1-3').title}
          description={getCompletionMessage('1-1-3').description}
          nextScreenName={getNextScreenName('1-1-3')}
          navigation={navigation}
                      onContinue={() => {
              setIsCompleted(false);
              navigation.navigate(getNextScreenName('1-1-3'));
            }}
          variant="modal"
            onClose={() => setShowCompletionPopup(false)}
            checkId="1-1-3"
          />
          {/* References Section */}
          <ReferencesSection references={getReferencesForCheck('1-1-3')} />

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

export default Check1_3_PasswordManagersScreen;