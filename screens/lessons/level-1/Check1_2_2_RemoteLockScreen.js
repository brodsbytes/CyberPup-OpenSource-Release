import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Colors, Typography, Responsive, CommonStyles } from '../../../theme';
import { SCREEN_NAMES } from '../../../constants';
import { DeviceCapabilities } from '../../../utils/deviceCapabilities';
import { SettingsGuide } from '../../../utils/settingsGuide';
import { AppStorage } from '../../../utils/storage';

import WizardFlow from '../../../components/WizardFlow';

const Check1_2_2_RemoteLockScreen = ({ navigation, route }) => {
  // ✅ PRESERVE: Exact same state management as Check 1.4
  const [userDevices, setUserDevices] = useState([]);
  const [deviceActions, setDeviceActions] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
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

      // Create device-specific actions using SettingsGuide
      const actions = {};
      for (const device of allDevices) {
        actions[device.id] = await createRemoteLockActions(device);
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
        setDeviceActions({
          'current-device': await createRemoteLockActions(fallbackDevice)
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
      const progressKey = `check_1-2-2_progress`;
      const progressData = await AsyncStorage.getItem(progressKey);
      
      if (progressData) {
        const progress = JSON.parse(progressData);
        setDeviceActions(progress.deviceActions || {});
        setDeviceCompletionStatus(progress.deviceCompletionStatus || {});
        setIsCompleted(progress.isCompleted || false);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      // Fallback: continue with empty state
    }
  };

  const saveProgress = async () => {
    try {
      const progressKey = `check_1-2-2_progress`;
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

  const handleActionComplete = async (deviceId, actionId, completed) => {
    try {
      // Update device actions
      const updatedActions = { ...deviceActions };
      if (updatedActions[deviceId]) {
        const actionIndex = updatedActions[deviceId].findIndex(action => action.id === actionId);
        if (actionIndex !== -1) {
          updatedActions[deviceId][actionIndex].completed = completed;
          setDeviceActions(updatedActions);
        }
      }

      // Update device completion status
      const updatedCompletionStatus = { ...deviceCompletionStatus };
      const deviceActionsList = updatedActions[deviceId] || [];
      const allCompleted = deviceActionsList.every(action => action.completed);
      updatedCompletionStatus[deviceId] = allCompleted;
      setDeviceCompletionStatus(updatedCompletionStatus);

      // Check if all devices are completed
      const allDevicesCompleted = userDevices.every(device => 
        updatedCompletionStatus[device.id]
      );

      if (allDevicesCompleted && !isCompleted) {
        setIsCompleted(true);
        celebrateCompletion();
      }

      // Save progress
      await saveProgress();
    } catch (error) {
      console.error('Error handling action complete:', error);
    }
  };

  const celebrateCompletion = () => {
    Alert.alert(
      '🎉 Remote Lock & Wipe Setup Complete!',
      'Your devices are now protected with remote security features.',
      [
        {
          text: 'Continue to Next Check',
          onPress: () => navigation.navigate('Check1_2_3_DeviceUpdatesScreen'),
        },
        {
          text: 'Go Back',
          style: 'cancel',
          onPress: () => navigation.navigate('Welcome'),
        },
      ]
    );
  };

  const handleExit = () => {
    setShowExitModal(true);
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    navigation.navigate(SCREEN_NAMES.CATEGORY);
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  // ✅ PRESERVE: Exact same useFocusEffect pattern
  useFocusEffect(
    React.useCallback(() => {
      loadProgress();
      initializeDeviceContent();
    }, [])
  );

  // ✅ PRESERVE: Exact same useEffect for progress saving
  useEffect(() => {
    if (userDevices.length > 0) {
      saveProgress();
    }
  }, [deviceActions, deviceCompletionStatus, isCompleted]);

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
        <Text style={styles.headerTitle}>Check 1.2.2</Text>
        <View style={styles.headerSpacer} />
      </View>
      
      {/* 🎨 REVISED: WizardFlow with device cards instead of device selector */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Title and Description */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Remote Lock & Wipe Setup</Text>
            <Text style={styles.description}>
              Configure remote security features on all your devices. This allows you to locate, lock, or wipe your device if it's lost or stolen.
            </Text>
          </View>
          
          {/* Device Wizard Cards */}
          {userDevices.length > 0 && Object.keys(deviceActions).length > 0 ? (
            <WizardFlow
              userDevices={userDevices}
              deviceActions={deviceActions}
              onActionComplete={handleActionComplete}
              variant="wizard"
              checkId="1-2-2"
              navigation={navigation}
            />
          ) : (
            <View style={styles.noDevicesContainer}>
              <Ionicons 
                name="shield-checkmark" 
                size={Responsive.iconSizes.xxlarge} 
                color={Colors.textSecondary} 
              />
              <Text style={styles.noDevicesTitle}>Setting Up Remote Security</Text>
              <Text style={styles.noDevicesText}>
                We're preparing personalized remote security recommendations for your devices. This may take a moment.
              </Text>
              <TouchableOpacity
                style={styles.addDevicesButton}
                onPress={() => {
                  // Retry initialization
                  initializeDeviceContent();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.addDevicesButtonText}>Retry Setup</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* ✅ PRESERVE: Exact same completion card */}
      {isCompleted && (
        <View style={styles.completionCard}>
          <View style={styles.completionContent}>
            <Ionicons 
              name="checkmark-circle" 
              size={Responsive.iconSizes.xxlarge} 
              color={Colors.success} 
            />
            <Text style={styles.completionTitle}>Setup Complete! 🎉</Text>
            <Text style={styles.completionText}>
              Your devices are now protected with remote security features.
            </Text>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => navigation.navigate('Welcome')}
            >
              <Text style={styles.continueButtonText}>Continue to Next Check</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Exit Modal */}
      <Modal
        visible={showExitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelExit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Exit Setup?</Text>
            <Text style={styles.modalText}>
              Your progress will be saved. You can continue later from where you left off.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={handleCancelExit}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={handleConfirmExit}
              >
                <Text style={styles.modalButtonPrimaryText}>Exit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


    </SafeAreaView>
  );
};

// Helper function to create remote lock actions
const createRemoteLockActions = async (device) => {
  const platform = device.platform || device.tier2;
  const settingsGuide = SettingsGuide.createGuidance('remote-lock', device);
  
  const actions = [
    {
      id: `${device.id}-find-my-device`,
      title: 'Enable Find My Device',
      description: 'Turn on location tracking and remote access features',
      completed: false,
      steps: [
        'Open device settings',
        'Navigate to security or privacy settings',
        'Enable "Find My Device" or similar feature',
        'Verify location services are enabled'
      ],
      deepLink: SettingsGuide.getSettingsUrl('security', device.platform)?.url || null,
      priority: 'critical'
    },
    {
      id: `${device.id}-remote-lock`,
      title: 'Enable Remote Lock',
      description: 'Allow remote locking of your device if lost',
      completed: false,
      steps: [
        'Open device settings',
        'Go to security settings',
        'Enable remote lock functionality',
        'Test remote lock feature'
      ],
      deepLink: SettingsGuide.getSettingsUrl('security', device.platform)?.url || null,
      priority: 'critical'
    },
    {
      id: `${device.id}-remote-wipe`,
      title: 'Enable Remote Wipe',
      description: 'Allow remote data erasure if device is stolen',
      completed: false,
      steps: [
        'Open device settings',
        'Navigate to security settings',
        'Enable remote wipe functionality',
        'Understand the implications of remote wipe'
      ],
      deepLink: SettingsGuide.getSettingsUrl('security', device.platform)?.url || null,
      priority: 'high'
    }
  ];
  
  return actions;
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

const styles = {
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
  completionCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  completionContent: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.xlarge,
    padding: Responsive.padding.modal,
    marginHorizontal: Responsive.padding.screen,
    alignItems: 'center',
    maxWidth: 400,
  },
  completionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: Responsive.spacing.md,
    marginBottom: Responsive.spacing.sm,
  },
  completionText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.5,
    marginBottom: Responsive.spacing.lg,
  },
  continueButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    borderRadius: Responsive.borderRadius.medium,
    minHeight: Responsive.buttonHeight.medium,
  },
  continueButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.xlarge,
    padding: Responsive.padding.modal,
    marginHorizontal: Responsive.padding.screen,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  modalText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * 1.5,
    marginBottom: Responsive.spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Responsive.spacing.sm,
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.md,
    borderRadius: Responsive.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
    minHeight: Responsive.buttonHeight.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.md,
    borderRadius: Responsive.borderRadius.medium,
    backgroundColor: Colors.accent,
    minHeight: Responsive.buttonHeight.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
  },
  noDevicesContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.modal,
    alignItems: 'center',
    marginTop: Responsive.spacing.lg,
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
};

export default Check1_2_2_RemoteLockScreen;
