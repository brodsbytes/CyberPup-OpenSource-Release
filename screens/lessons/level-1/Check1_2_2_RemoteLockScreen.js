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
import ReferencesSection from '../../../components/ui/ReferencesSection';
import { getReferencesForCheck } from '../../../data/references';
import { SCREEN_NAMES } from '../../../constants';
import { DeviceCapabilities } from '../../../utils/deviceCapabilities';
import { SettingsGuide } from '../../../utils/settingsGuide';
import { AppStorage } from '../../../utils/storage';

import WizardFlow from '../../../components/validation-steps/WizardFlow';
import CompletionPopup from '../../../components/gamification/CompletionPopup';
import { getCompletionMessage, getNextScreenName } from '../../../utils/completionMessages';
import { CopywritingService } from '../../../utils/copywritingService';
import HeaderWithProgress from '../../../components/navigation/HeaderWithProgress';
import ExitModal from '../../../components/common/ExitModal';

const Check1_2_2_RemoteLockScreen = ({ navigation, route }) => {
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
        setShowCompletionPopup(true);
        celebrateCompletion();
      }

      // Save progress
      await saveProgress();
    } catch (error) {
      console.error('Error handling action complete:', error);
    }
  };

  const celebrateCompletion = () => {
    console.log('🎉 Celebrating completion of Check 1.2.2');
    setShowCompletionPopup(true);
  };

  // Calculate progress for the header
  const getProgress = () => {
    const totalActions = Object.values(deviceActions).flat().length;
    const completedActions = Object.values(deviceActions).flat().filter(action => action.completed).length;
    return totalActions > 0 ? (completedActions / totalActions) * 100 : 0;
  };

  // Get copywriting content for rendering
  const copywritingContent = CopywritingService.getCheckContent('1-2-2');

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

  // ✅ FIXED: Reset completion state properly when screen loads
  useFocusEffect(
    React.useCallback(() => {
      const initializeScreen = async () => {
        // First initialize device content
        await initializeDeviceContent();
        
        // Then load progress but reset completion state
        try {
          const progressKey = `check_1-2-2_progress`;
          const progressData = await AsyncStorage.getItem(progressKey);
          
          if (progressData) {
            const progress = JSON.parse(progressData);
            // Reset all actions to not completed
            const resetActions = {};
            Object.keys(progress.deviceActions || {}).forEach(deviceId => {
              resetActions[deviceId] = (progress.deviceActions[deviceId] || []).map(action => ({
                ...action,
                completed: false
              }));
            });
            
            setDeviceActions(resetActions);
            setDeviceCompletionStatus({}); // Reset completion status
            setIsCompleted(false); // Reset completion state
            setShowCompletionPopup(false); // Reset popup
          }
        } catch (error) {
          console.error('Error loading progress:', error);
        }
      };
      
      initializeScreen();
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
      
      {/* ✅ UPDATED: Header with progress bar */}
      <HeaderWithProgress
        checkId="1-2-2"
        onExit={handleExit}
        isCompleted={isCompleted}
        progress={getProgress()}
        navigation={navigation}
      />
      
      {/* 🎨 REVISED: WizardFlow with device cards instead of device selector */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Title and Description */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{copywritingContent.title || 'Remote Lock & Wipe Setup'}</Text>
            <Text style={styles.description}>
              {copywritingContent.description || 'Configure remote security features on all your devices. This allows you to locate, lock, or wipe your device if it\'s lost or stolen.'}
            </Text>
          </View>

          {/* Learn More Section */}
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={() => setShowLearnMore(!showLearnMore)}
            activeOpacity={0.8}
          >
            <Text style={styles.learnMoreText}>Why is remote lock important?</Text>
            <Ionicons
              name={showLearnMore ? 'chevron-up' : 'chevron-down'}
              size={Responsive.iconSizes.medium}
              color={Colors.accent}
            />
          </TouchableOpacity>

          {showLearnMore && (
            <View style={styles.learnMoreContent}>
              <Text style={styles.learnMoreTitle}>Remote Security Benefits</Text>
              <Text style={styles.learnMoreBody}>
                Remote lock gives you peace of mind when your device goes missing. Whether it's lost in a taxi, stolen from your bag, or left behind at a coffee shop, you can instantly lock your device from anywhere in the world. This prevents strangers from accessing your personal photos, banking apps, work emails, and private messages. Plus, you can display a custom message with your contact information, making it easier for honest people to return your device. It's like having a digital security guard that works 24/7, even when you're not around.
              </Text>
            </View>
          )}
          
          {/* Device Wizard Cards */}
          {userDevices.length > 0 && Object.keys(deviceActions).length > 0 ? (
            <WizardFlow
              userDevices={userDevices}
              deviceActions={deviceActions}
              onActionComplete={handleActionComplete}
              variant="wizard"
              checkId="1-2-2"
              navigation={navigation}
              showProgressHeader={false}
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

          {/* Security Best Practices */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>🔒 Remote Lock Best Practices</Text>
            <View style={styles.tipItem}>
              <Ionicons name="location" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Enable location services for device tracking</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="notifications" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Set up notifications for device location changes</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="shield-checkmark" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Test remote lock functionality regularly</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="trash" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Use remote wipe as a last resort for sensitive data</Text>
            </View>
          </View>

          {/* References Section */}
          <ReferencesSection references={getReferencesForCheck('1-2-2')} />

        </View>
      </ScrollView>
      
      {/* ✅ PRESERVE: Exact same completion card */}
          <CompletionPopup
          isVisible={showCompletionPopup}
          title={getCompletionMessage('1-2-2').title}
          description={getCompletionMessage('1-2-2').description}
          nextScreenName={getNextScreenName('1-2-2')}
          navigation={navigation}
          onContinue={() => {
            setIsCompleted(false);
            navigation.navigate(getNextScreenName('1-2-2'));
          }}
          variant="modal"
            onClose={() => setShowCompletionPopup(false)}
            checkId="1-2-2"
            animationType="confetti"
          />

      {/* ✅ STANDARDIZED: Exit Modal using common component */}
      <ExitModal
        visible={showExitModal}
        onClose={() => setShowExitModal(false)}
        onKeepLearning={handleKeepLearning}
        onExit={handleExitLesson}
        icon="🔒"
        title="Secure your devices!"
        message="Remote security features are essential for protecting your data if your device is lost or stolen!"
      />


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
};

export default Check1_2_2_RemoteLockScreen;
