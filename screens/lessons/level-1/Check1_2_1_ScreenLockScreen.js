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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Responsive, CommonStyles } from '../../../theme';
import { DeviceCapabilities } from '../../../utils/deviceCapabilities';
import CollapsibleDeviceSection from '../../../components/forms/CollapsibleDeviceSection';
import { SettingsGuide } from '../../../utils/settingsGuide';
import * as Haptics from 'expo-haptics';
import CompletionPopup from '../../../components/gamification/CompletionPopup';
import { getCompletionMessage, getNextScreenName } from '../../../utils/completionMessages';
import HeaderWithProgress from '../../../components/navigation/HeaderWithProgress';

/**
 * Check1_2_1_ScreenLockScreen - Pattern B Implementation
 * 
 * Enhanced screen lock setup with device-specific deep links and guided
 * security configuration. Applies Phase 1 lessons:
 * - User-controlled verification flows
 * - Platform-specific deep links with fallbacks
 * - Contextual security recommendations
 * - Proper progress persistence
 */
const Check1_2_1_ScreenLockScreen = ({ navigation, route }) => {
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
      setShowCompletionPopup(false);
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
          settingsUrl: currentDevice.settingsUrl,
          icon: getDeviceIcon(currentDevice)
        });
      }

      setUserDevices(allDevices);

      // Create device-specific actions for screen lock setup
      const actions = {};
      for (const device of allDevices) {
        actions[device.id] = await createScreenLockActions(device);
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
        supportsDeepLinks: currentDevice.supportsDeepLinks,
        settingsUrl: currentDevice.settingsUrl
      };
      setUserDevices([fallbackDevice]);
      setDeviceActions({
        'current-device': await createScreenLockActions(fallbackDevice)
      });
    }
  };

  const createScreenLockActions = async (device) => {
    const platform = device.platform || device.tier2;
    const settingsGuide = SettingsGuide.createGuidance('security', device);
    const deviceContent = DeviceCapabilities.getDeviceContent('screen-lock', platform);

    const actions = [
      {
        id: `${device.id}-enable-lock`,
        title: 'Enable Screen Lock',
        description: 'Set up a secure screen lock (PIN, password, pattern, or biometric)',
        completed: false,
        steps: deviceContent?.steps || [
          'Open Settings',
          'Navigate to Security settings',
          'Set up screen lock method',
          'Choose a strong PIN or password'
        ],
        deepLink: deviceContent?.deepLink || settingsGuide.deepLink.url,
        verification: 'settings_check',
        priority: 'high'
      },
      {
        id: `${device.id}-auto-lock`,
        title: 'Configure Auto-Lock Timer',
        description: 'Set device to lock automatically after a short period of inactivity',
        completed: false,
        steps: platform === 'ios' ? [
          'Open Settings',
          'Tap Face ID & Passcode (or Touch ID & Passcode)',
          'Tap Auto-Lock',
          'Select "30 seconds" or "1 minute"'
        ] : platform === 'android' ? [
          'Open Settings',
          'Tap Security & Privacy',
          'Tap Screen Lock',
          'Set Auto-lock to 30 seconds or 1 minute'
        ] : [
          'Open Settings or System Preferences',
          'Navigate to security settings',
          'Find sleep/lock timer settings',
          'Set to lock after 1-5 minutes of inactivity'
        ],
        deepLink: deviceContent?.deepLink,
        verification: 'settings_check',
        priority: 'high'
      }
    ];

    // Add biometric setup if supported
    const biometricCapability = DeviceCapabilities.getDeviceCapability('biometric');
    if (biometricCapability.supported) {
      actions.push({
        id: `${device.id}-biometric`,
        title: `Set Up ${platform === 'ios' ? 'Face ID/Touch ID' : 'Biometric Unlock'}`,
        description: 'Enable biometric authentication for quick and secure access',
        completed: false,
        steps: platform === 'ios' ? [
          'Open Settings',
          'Tap Face ID & Passcode (or Touch ID & Passcode)',
          'Set up Face ID or Touch ID',
          'Test the biometric authentication'
        ] : platform === 'android' ? [
          'Open Settings',
          'Tap Security & Privacy',
          'Tap Fingerprint or Face unlock',
          'Follow the setup instructions'
        ] : [
          'Open security settings',
          'Look for biometric options',
          'Set up available biometric authentication',
          'Test the setup'
        ],
        deepLink: biometricCapability.settingsPath,
        verification: 'manual',
        priority: 'medium'
      });
    }

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
      const progressData = await AsyncStorage.getItem('check_1-2-1_progress');
      const completedData = await AsyncStorage.getItem('check_1-2-1_completed');
      
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
      
      await AsyncStorage.setItem('check_1-2-1_progress', JSON.stringify(progressData));
      
      if (isCompleted) {
        await AsyncStorage.setItem('check_1-2-1_completed', 'completed');
      } else {
        await AsyncStorage.removeItem('check_1-2-1_completed');
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
          
          await AsyncStorage.setItem('check_1-2-1_progress', JSON.stringify(progressData));
          await AsyncStorage.setItem('check_1-2-1_completed', 'completed');
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

  const getSecurityLevel = () => {
    const progress = getOverallProgress();
    if (progress === 100) return { level: 'Excellent', color: Colors.success, icon: 'shield-checkmark' };
    if (progress >= 50) return { level: 'Good', color: Colors.warning, icon: 'shield' };
    return { level: 'Needs Improvement', color: Colors.error, icon: 'shield-outline' };
  };

  const securityLevel = getSecurityLevel();

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
        checkId="1-2-1"
        onExit={handleExit}
        isCompleted={isCompleted}
        progress={getProgress()}
        navigation={navigation}
      />

      {/* Exit Modal */}
      <Modal
        visible={showExitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowExitModal(false)}
            >
              <Ionicons name="close" size={Responsive.iconSizes.large} color={Colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.modalCharacter}>
              <Text style={styles.characterText}>🔐</Text>
            </View>

            <Text style={styles.modalTitle}>Secure your devices!</Text>
            <Text style={styles.modalMessage}>
              Screen locks are your first line of defense. Don't leave your devices vulnerable!
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.keepLearningButton}
                onPress={handleKeepLearning}
                activeOpacity={0.8}
              >
                <Text style={styles.keepLearningButtonText}>Continue setup</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.exitLessonButton}
                onPress={handleExitLesson}
                activeOpacity={0.8}
              >
                <Text style={styles.exitLessonButtonText}>Exit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Title and Description */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Configure Screen Locks</Text>
            <Text style={styles.description}>
              Set up secure screen locks on all your devices to prevent unauthorized access. This is your first line of defense if a device is lost or stolen.
            </Text>
            
            {/* Security Level Indicator */}
            <View style={styles.securitySection}>
              <View style={styles.securityHeader}>
                <Ionicons 
                  name={securityLevel.icon} 
                  size={Responsive.iconSizes.large} 
                  color={securityLevel.color} 
                />
                <Text style={[styles.securityTitle, { color: securityLevel.color }]}>
                  Security Level: {securityLevel.level}
                </Text>
              </View>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${getOverallProgress()}%`, backgroundColor: securityLevel.color }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{Math.round(getOverallProgress())}%</Text>
              </View>
            </View>
          </View>

          {/* Learn More Section */}
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={() => setShowLearnMore(!showLearnMore)}
            activeOpacity={0.8}
          >
            <Text style={styles.learnMoreText}>Why are screen locks important?</Text>
            <Ionicons
              name={showLearnMore ? 'chevron-up' : 'chevron-down'}
              size={Responsive.iconSizes.medium}
              color={Colors.accent}
            />
          </TouchableOpacity>

          {showLearnMore && (
            <View style={styles.learnMoreContent}>
              <Text style={styles.learnMoreTitle}>Screen Lock Security Benefits</Text>
              <Text style={styles.learnMoreBody}>
                • Prevents unauthorized access to your device{'\n'}
                • Protects your personal data and accounts{'\n'}
                • Required for banking and secure apps{'\n'}
                • Enables remote wipe if device is stolen{'\n'}
                • Prevents shoulder surfing attacks{'\n'}
                • Keeps your digital life private
              </Text>
            </View>
          )}

          {/* Device-Specific Sections */}
          <View style={styles.devicesSection}>
            <Text style={styles.devicesSectionTitle}>Screen Lock Setup by Device</Text>
            <Text style={styles.devicesSectionSubtitle}>
              Configure secure screen locks on each of your devices
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
                  Add your devices in the Profile tab to get personalized security guidance.
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

          {/* Security Best Practices */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>🔐 Screen Lock Best Practices</Text>
            <View style={styles.tipItem}>
              <Ionicons name="timer" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Set auto-lock to 30 seconds or 1 minute for maximum security</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="key" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Use at least a 6-digit PIN or strong password</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="finger-print" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Enable biometric unlock for convenience and security</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="eye-off" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Avoid simple patterns that can be easily observed</Text>
            </View>
          </View>

          {/* Completion Status */}
          <CompletionPopup
          isVisible={showCompletionPopup}
          title={getCompletionMessage('1-2-1').title}
          description={getCompletionMessage('1-2-1').description}
          nextScreenName={getNextScreenName('1-2-1')}
          navigation={navigation}
          onContinue={() => {
            setIsCompleted(false);
            navigation.navigate(getNextScreenName('1-2-1'));
          }}
          variant="modal"
            onClose={() => setShowCompletionPopup(false)}
            checkId="1-2-1"
          />
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
  securitySection: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.card,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.spacing.md,
  },
  securityTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginLeft: Responsive.spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Responsive.spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.overlayLight,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.xxlarge,
    padding: Responsive.padding.modal,
    marginHorizontal: Responsive.padding.screen,
    alignItems: 'center',
    position: 'relative',
    minWidth: Responsive.modal.width,
  },
  modalCloseButton: {
    position: 'absolute',
    top: Responsive.padding.button,
    right: Responsive.padding.button,
    width: Responsive.iconSizes.xlarge,
    height: Responsive.iconSizes.xlarge,
    borderRadius: Responsive.iconSizes.xlarge / 2,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCharacter: {
    marginBottom: Responsive.spacing.md,
  },
  characterText: {
    fontSize: Responsive.iconSizes.xxlarge,
  },
  modalTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Responsive.spacing.sm,
  },
  modalMessage: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.4,
    marginBottom: Responsive.spacing.lg,
  },
  modalButtons: {
    width: '100%',
    gap: Responsive.spacing.sm,
  },
  keepLearningButton: {
    backgroundColor: Colors.accent,
    borderRadius: Responsive.borderRadius.large,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    alignItems: 'center',
    minHeight: Responsive.buttonHeight.medium,
  },
  keepLearningButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  exitLessonButton: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
    minHeight: Responsive.buttonHeight.medium,
  },
  exitLessonButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.accent,
  },
});

export default Check1_2_1_ScreenLockScreen;