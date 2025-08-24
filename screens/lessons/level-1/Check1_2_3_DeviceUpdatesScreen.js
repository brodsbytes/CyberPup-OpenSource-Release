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
import * as Haptics from 'expo-haptics';

import { Colors, Typography, Responsive, CommonStyles } from '../../../theme';
import { SCREEN_NAMES } from '../../../constants';
import { DeviceCapabilities } from '../../../utils/deviceCapabilities';
import { SettingsGuide } from '../../../utils/settingsGuide';
import { AppStorage } from '../../../utils/storage';

import WizardFlow from '../../../components/WizardFlow';
import CompletionPopup from '../../../components/CompletionPopup';
import { getCompletionMessage, getNextScreenName } from '../../../utils/completionMessages';

const Check1_2_3_DeviceUpdatesScreen = ({ navigation, route }) => {
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
      
      // Always ensure we have at least the current device
      if (allDevices.length === 0) {
        const currentDeviceInfo = {
          id: 'current-device',
          name: currentDevice.type || 'Your Device',
          type: currentDevice.platform === 'ios' || currentDevice.platform === 'android' ? 'mobile' : 'computer',
          platform: currentDevice.platform,
          tier2: currentDevice.platform,
          autoDetected: true,
          supportsDeepLinks: currentDevice.supportsDeepLinks,
          icon: getDeviceIcon(currentDevice)
        };
        allDevices = [currentDeviceInfo];
      } else {
        // Check if current device is already in the list
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
      }

      setUserDevices(allDevices);

      // Create device-specific actions using SettingsGuide
      const actions = {};
      for (const device of allDevices) {
        const deviceActions = await createDeviceUpdateActions(device);
        actions[device.id] = deviceActions;
      }
      setDeviceActions(actions);
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
        const fallbackActions = await createDeviceUpdateActions(fallbackDevice);
        setDeviceActions({
          'current-device': fallbackActions
        });
      } catch (fallbackError) {
        console.error('Fallback device initialization failed:', fallbackError);
        // Final fallback: empty state
        setUserDevices([]);
        setDeviceActions({});
      }
    }
  };

  // ✅ PRESERVE: Exact same progress management
  const loadProgress = async () => {
    try {
      const progressKey = `check_1-2-3_progress`;
      const progressData = await AsyncStorage.getItem(progressKey);
      
      if (progressData) {
        const progress = JSON.parse(progressData);
        setDeviceActions(progress.deviceActions || {});
        setDeviceCompletionStatus(progress.deviceCompletionStatus || {});
        setIsCompleted(progress.isCompleted || false);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveProgress = async () => {
    try {
      const progressKey = `check_1-2-3_progress`;
      const progressData = {
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
      loadProgress();
      initializeDeviceContent();
      // Reset completion state when screen comes into focus
      // This ensures the completion popup doesn't stay visible after navigation
      setIsCompleted(false);
      setShowCompletionPopup(false);
    }, [])
  );

  // ✅ PRESERVE: Save progress when actions change
  useEffect(() => {
    saveProgress();
  }, [deviceActions, deviceCompletionStatus, isCompleted]);

  // ✅ PRESERVE: Action completion handler
  const handleActionComplete = async (deviceId, actionId, completed) => {
    try {
      setDeviceActions(prev => {
        const newActions = { ...prev };
        if (newActions[deviceId]) {
          newActions[deviceId] = newActions[deviceId].map(action => 
            action.id === actionId ? { ...action, completed } : action
          );
        }
        
        // Check if all actions for this device are completed
        const currentDeviceActions = newActions[deviceId] || [];
        const allCompleted = currentDeviceActions.every(action => action.completed);
        
        if (allCompleted) {
          setDeviceCompletionStatus(prevStatus => ({
            ...prevStatus,
            [deviceId]: true
          }));
        }

        // Check if all devices are completed
        const allDevicesCompleted = userDevices.every(device => {
          const deviceActions = newActions[device.id] || [];
          return deviceActions.every(action => action.completed);
        });

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
    // The completion popup will be shown automatically when isCompleted is true
    // No need to call it as a function
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
  const createDeviceUpdateActions = async (device) => {
    const deviceActionsList = [];
    const platform = device.platform || device.tier2;
    let type = device.type;
    
    // Fallback type detection if not set
    if (!type) {
      if (platform === 'ios' || platform === 'android') {
        type = 'mobile';
      } else if (platform === 'macos' || platform === 'windows') {
        type = 'computer';
      } else {
        type = 'computer'; // Default fallback
      }
    }

    if (type === 'mobile') {
      if (platform === 'ios') {
        deviceActionsList.push(
          {
            id: 'ios-updates-check',
            title: 'Check for iOS Updates',
            description: 'Ensure your iPhone is running the latest iOS version with security patches.',
            completed: false,
            deepLink: 'App-Prefs:General&path=Software_Update',
            steps: [
              'Open Settings app',
              'Tap General',
              'Tap Software Update',
              'If an update is available, tap Download and Install',
              'Follow the on-screen instructions'
            ],
            tips: [
              'Keep your device connected to Wi-Fi during updates',
              'Updates may take 15-30 minutes to complete',
              'Your device will restart during the update process'
            ]
          },
          {
            id: 'ios-auto-updates',
            title: 'Enable Automatic Updates',
            description: 'Configure your iPhone to automatically install security updates.',
            completed: false,
            deepLink: 'App-Prefs:General&path=Software_Update',
            steps: [
              'Open Settings app',
              'Tap General',
              'Tap Software Update',
              'Tap Automatic Updates',
              'Toggle on "Download iOS updates"',
              'Toggle on "Install iOS updates"'
            ],
            tips: [
              'Automatic updates install overnight when connected to Wi-Fi',
              'Your device must be charging for automatic installation',
              'You\'ll receive a notification before updates install'
            ]
          }
        );
      } else if (platform === 'android') {
        deviceActionsList.push(
          {
            id: 'android-updates-check',
            title: 'Check for Android Updates',
            description: 'Ensure your Android device is running the latest security patch.',
            completed: false,
            deepLink: 'android-app://com.android.settings/.system.SystemUpdateActivity',
            steps: [
              'Open Settings app',
              'Scroll down and tap System',
              'Tap Advanced',
              'Tap System update',
              'Tap Check for update',
              'If an update is available, tap Download'
            ],
            tips: [
              'Update availability depends on your device manufacturer',
              'Some updates may require manual installation',
              'Keep your device connected to Wi-Fi during updates'
            ]
          },
          {
            id: 'android-auto-updates',
            title: 'Enable Auto-Download Updates',
            description: 'Configure your Android device to automatically download updates.',
            completed: false,
            deepLink: 'android-app://com.android.settings/.system.SystemUpdateActivity',
            steps: [
              'Open Settings app',
              'Scroll down and tap System',
              'Tap Advanced',
              'Tap System update',
              'Tap the three-dot menu',
              'Tap Auto-download over Wi-Fi'
            ],
            tips: [
              'Updates will only download over Wi-Fi to save data',
              'You\'ll still need to manually install updates',
              'This setting helps ensure you don\'t miss critical updates'
            ]
          }
        );
      }
    } else if (type === 'computer') {
      if (platform === 'macos') {
        deviceActionsList.push(
          {
            id: 'macos-updates-check',
            title: 'Check for macOS Updates',
            description: 'Ensure your Mac is running the latest macOS version with security patches.',
            completed: false,
            deepLink: 'x-apple.systempreferences:com.apple.preferences.softwareupdate',
            steps: [
              'Click the Apple menu in the top-left corner',
              'Select System Preferences',
              'Click Software Update',
              'If updates are available, click Update Now',
              'Follow the on-screen instructions'
            ],
            tips: [
              'Updates may take 30-60 minutes to complete',
              'Your Mac will restart during major updates',
              'Keep your Mac connected to power during updates'
            ]
          },
          {
            id: 'macos-auto-updates',
            title: 'Enable Automatic Updates',
            description: 'Configure your Mac to automatically install security updates.',
            completed: false,
            deepLink: 'x-apple.systempreferences:com.apple.preferences.softwareupdate',
            steps: [
              'Click the Apple menu in the top-left corner',
              'Select System Preferences',
              'Click Software Update',
              'Click Advanced',
              'Check "Automatically keep my Mac up to date"',
              'Click OK'
            ],
            tips: [
              'Automatic updates install when your Mac is not in use',
              'You\'ll receive a notification before updates install',
              'Critical security updates install immediately'
            ]
          }
        );
      } else if (platform === 'windows') {
        deviceActionsList.push(
          {
            id: 'windows-updates-check',
            title: 'Check for Windows Updates',
            description: 'Ensure your Windows PC is running the latest security updates.',
            completed: false,
            deepLink: 'ms-settings:windowsupdate',
            steps: [
              'Press Windows key + I to open Settings',
              'Click Update & Security',
              'Click Windows Update',
              'Click Check for updates',
              'If updates are available, click Download'
            ],
            tips: [
              'Updates may take 30-60 minutes to complete',
              'Your PC will restart during major updates',
              'Save your work before installing updates'
            ]
          },
          {
            id: 'windows-auto-updates',
            title: 'Configure Automatic Updates',
            description: 'Configure Windows to automatically install security updates.',
            completed: false,
            deepLink: 'ms-settings:windowsupdate',
            steps: [
              'Press Windows key + I to open Settings',
              'Click Update & Security',
              'Click Windows Update',
              'Click Advanced options',
              'Under "Choose how updates are installed"',
              'Select "Automatic (recommended)"'
            ],
            tips: [
              'Automatic updates install when your PC is not in use',
              'You can set active hours to prevent restarts during work',
              'Critical security updates install immediately'
            ]
          }
        );
      }
    }
    
    // Fallback for unknown platforms or if no actions were created
    if (deviceActionsList.length === 0) {
      deviceActionsList.push(
        {
          id: 'fallback-updates-check',
          title: 'Check for System Updates',
          description: 'Ensure your device is running the latest version with security patches.',
          completed: false,
          deepLink: null,
          steps: [
            'Open your device settings',
            'Look for "Software Update" or "System Update"',
            'Check if any updates are available',
            'Install any available updates'
          ],
          tips: [
            'Keep your device connected to Wi-Fi during updates',
            'Updates may take time to complete',
            'Your device may restart during the update process'
          ]
        },
        {
          id: 'fallback-auto-updates',
          title: 'Enable Automatic Updates',
          description: 'Configure your device to automatically install security updates.',
          completed: false,
          deepLink: null,
          steps: [
            'Open your device settings',
            'Find update or software settings',
            'Enable automatic updates if available',
            'Set to install security updates automatically'
          ],
          tips: [
            'Automatic updates help keep you protected',
            'Updates install when your device is not in use',
            'You may receive notifications before updates install'
          ]
        }
      );
    }

    return deviceActionsList;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* ✅ FIXED: Consistent header matching Check 1.2.1 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={handleExit}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="menu" 
            size={Responsive.iconSizes.large} 
            color={Colors.textPrimary} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check 1.2.3</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      {/* ✅ PRESERVE: Dynamic Exit Modal matching Check 1.4 pattern */}
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
              <Text style={styles.characterText}>🔄</Text>
            </View>

            <Text style={styles.modalTitle}>Wait, don't go!</Text>
            <Text style={styles.modalMessage}>
              You're learning how to keep your devices secure with automatic updates. Don't miss this critical protection against security vulnerabilities!
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.keepLearningButton}
                onPress={handleKeepLearning}
                activeOpacity={0.8}
              >
                <Text style={styles.keepLearningButtonText}>Keep learning</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.exitLessonButton}
                onPress={handleExitLesson}
                activeOpacity={0.8}
              >
                <Text style={styles.exitLessonButtonText}>Exit lesson</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* 🎨 REVISED: WizardFlow with device cards instead of device selector */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
          {/* Title and Description */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Device Updates Setup</Text>
        <Text style={styles.description}>
              Configure automatic security updates on all your devices. This ensures you're protected against the latest threats and vulnerabilities.
        </Text>
      </View>

          {/* Device Wizard Cards */}
          {userDevices.length > 0 && Object.keys(deviceActions).length > 0 ? (
            <WizardFlow
              userDevices={userDevices}
              deviceActions={deviceActions}
              onActionComplete={handleActionComplete}
              variant="wizard"
              checkId="1-2-3"
              navigation={navigation}
            />
          ) : (
            <View style={styles.fallbackContainer}>
              <Text style={styles.fallbackTitle}>Setting Up Device Updates</Text>
              <Text style={styles.fallbackText}>
                We're preparing personalized update recommendations for your devices.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={initializeDeviceContent}
              >
                <Text style={styles.retryButtonText}>Retry Setup</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Completion Status */}
          <CompletionPopup
          isVisible={showCompletionPopup}
          title={getCompletionMessage('1-2-3').title}
          description={getCompletionMessage('1-2-3').description}
          nextScreenName={getNextScreenName('1-2-3')}
          navigation={navigation}
          onContinue={() => {
            setIsCompleted(false);
            navigation.navigate(getNextScreenName('1-2-3'));
          }}
          variant="modal"
            onClose={() => setShowCompletionPopup(false)}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.screen,
    margin: Responsive.padding.screen,
    alignItems: 'center',
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: Responsive.spacing.md,
    right: Responsive.spacing.md,
    zIndex: 1,
  },
  modalCharacter: {
    marginBottom: Responsive.spacing.md,
  },
  characterText: {
    fontSize: 48,
  },
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.5,
    marginBottom: Responsive.spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Responsive.spacing.md,
  },
  keepLearningButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    borderRadius: Responsive.borderRadius.medium,
  },
  keepLearningButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
  },
  exitLessonButton: {
    backgroundColor: Colors.surface,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    borderRadius: Responsive.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exitLessonButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
  },
  completionCard: {
    backgroundColor: Colors.successSoft,
    borderRadius: Responsive.borderRadius.xlarge,
    padding: Responsive.padding.modal,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.success,
    marginTop: Responsive.spacing.lg,
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

export default Check1_2_3_DeviceUpdatesScreen;
