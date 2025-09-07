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
import CompletionPopup from '../../../components/gamification/CompletionPopup';
import { getCompletionMessage, getNextScreenName, getCompletionNavigation } from '../../../utils/completionMessages';
import { CopywritingService } from '../../../utils/copywritingService';
import { getChecklistConfig } from '../../../constants/checklistConfig';
import HeaderWithProgress from '../../../components/navigation/HeaderWithProgress';
import ExitModal from '../../../components/common/ExitModal';

import InteractiveChecklist from '../../../components/validation-steps/InteractiveChecklist';

const Check1_3_2_LocalBackupScreen = ({ navigation, route }) => {
  // ✅ PRESERVE: Exact same state management as Check 1.4
  const [userDevices, setUserDevices] = useState([]);
  const [deviceActions, setDeviceActions] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [deviceCompletionStatus, setDeviceCompletionStatus] = useState({});
  const [showExitModal, setShowExitModal] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);

  // 🎨 NEW: Checklist-specific state
  const [checklistItems, setChecklistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ PRESERVE: Exact same initialization logic
  const initializeDeviceContent = async () => {
    try {
      setIsLoading(true);
      // Use the new smart deduplication method to prevent device duplicates
      const allDevices = await DeviceCapabilities.getUserDevicesWithCurrentDevice();
      setUserDevices(allDevices);

      // Create device-specific actions using SettingsGuide
      const actions = {};
      for (const device of allDevices) {
        actions[device.id] = await createLocalBackupActions(device);
      }
      setDeviceActions(actions);

      // 🎨 NEW: Convert device actions to checklist items
      const checklistItemsFromActions = convertActionsToChecklistItems(actions, allDevices);
      setChecklistItems(checklistItemsFromActions);
      
      // Debug logs removed for cleaner console
      
      setIsLoading(false);
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
        const fallbackActions = {
          'current-device': await createLocalBackupActions(fallbackDevice)
        };
        setDeviceActions(fallbackActions);
        
        // Convert fallback actions to checklist items
        const fallbackChecklistItems = convertActionsToChecklistItems(fallbackActions, [fallbackDevice]);
        setChecklistItems(fallbackChecklistItems);
        
        // Debug logs removed for cleaner console
        
        setIsLoading(false);
      } catch (fallbackError) {
        console.error('Fallback device initialization failed:', fallbackError);
        // Final fallback: create generic checklist items
        const genericDevice = {
          id: 'generic-device',
          name: 'Your Device',
          type: 'mobile',
          platform: 'unknown',
          autoDetected: true,
          supportsDeepLinks: false
        };
        
        setUserDevices([genericDevice]);
        const genericActions = {
          'generic-device': await createLocalBackupActions(genericDevice)
        };
        setDeviceActions(genericActions);
        
        const genericChecklistItems = convertActionsToChecklistItems(genericActions, [genericDevice]);
        setChecklistItems(genericChecklistItems);
        
        // Debug logs removed for cleaner console
        
        setIsLoading(false);
      }
    }
  };

  // 🎨 NEW: Convert device actions to checklist items format
  const convertActionsToChecklistItems = (actions, devices) => {
    const checklistItems = [];
    
    devices.forEach(device => {
      const deviceActions = actions[device.id] || [];
      
      deviceActions.forEach(action => {
        checklistItems.push({
          id: `${device.id}-${action.id}`,
          title: action.title,
          description: action.description,
          completed: action.completed || false,
          priority: action.priority || 'medium',
          category: action.category || 'backup',
          device: device.name,
          steps: action.steps || [],
          tips: action.tips || [],
          deepLink: action.deepLink,
          deviceId: device.id,
          actionId: action.id
        });
      });
    });
    
    return checklistItems;
  };

  // ✅ FIXED: Progress management
  const loadProgress = async () => {
    try {
      const progressKey = `check_1-3-2_progress`;
      const progressData = await AsyncStorage.getItem(progressKey);
      
      if (progressData) {
        const progress = JSON.parse(progressData);
        setDeviceActions(progress.deviceActions || {});
        setDeviceCompletionStatus(progress.deviceCompletionStatus || {});
        setIsCompleted(progress.isCompleted || false);
        
        // 🎨 NEW: Load checklist items progress
        if (progress.checklistItems) {
          setChecklistItems(progress.checklistItems);
        }
        
        // Set loading to false if we have progress data
        setIsLoading(false);
        
        // Don't automatically show completion popup when returning to a completed check
        // Let the user navigate using the header arrow or complete the check again
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveProgress = async () => {
    try {
      const progressKey = `check_1-3-2_progress`;
      const progressData = {
        deviceActions,
        deviceCompletionStatus,
        isCompleted,
        checklistItems, // 🎨 NEW: Save checklist items
        lastUpdated: new Date().toISOString(),
      };
      await AsyncStorage.setItem(progressKey, JSON.stringify(progressData));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // ✅ FIXED: Standard focus effect
  useFocusEffect(
    React.useCallback(() => {
      const initializeScreen = async () => {
        // First load progress to preserve existing state
        await loadProgress();
        
        // Then initialize device content only if no progress exists
        const progressKey = `check_1-3-2_progress`;
        const progressData = await AsyncStorage.getItem(progressKey);
        
        if (!progressData) {
          await initializeDeviceContent();
        }
      };
      
      initializeScreen();
    }, [])
  );

  // ✅ FIXED: Save progress and check completion when actions change
  useEffect(() => {
    if (Object.keys(deviceActions).length > 0) {
      saveProgress();
      
      // Check if all devices are completed
      const allDevicesCompleted = Object.keys(deviceActions).every(deviceId => {
        const deviceActionsList = deviceActions[deviceId] || [];
        return deviceActionsList.length > 0 && deviceActionsList.every(action => action.completed);
      });
      
      if (allDevicesCompleted && !isCompleted) {
        setIsCompleted(true);
        // Don't show CompletionPopup here - let celebrateCompletion handle it
        celebrateCompletion();
      }
    }
  }, [deviceActions, deviceCompletionStatus, isCompleted, checklistItems]);

  // ✅ FIXED: Action completion handler
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

      // 🎨 NEW: Update checklist items
      setChecklistItems(prev => 
        prev.map(item => 
          item.deviceId === deviceId && item.actionId === actionId 
            ? { ...item, completed } 
            : item
        )
      );

      // Update device completion status
      const updatedCompletionStatus = { ...deviceCompletionStatus };
      const deviceActionsList = updatedActions[deviceId] || [];
      const allCompleted = deviceActionsList.every(action => action.completed);
      updatedCompletionStatus[deviceId] = allCompleted;
      setDeviceCompletionStatus(updatedCompletionStatus);

      // Check if all devices are completed using updated state
      const allDevicesCompleted = userDevices.every(device => 
        updatedCompletionStatus[device.id] || 
        (updatedActions[device.id] && updatedActions[device.id].every(action => action.completed))
      );

      if (allDevicesCompleted && !isCompleted) {
        setIsCompleted(true);
        setShowCompletionPopup(true);
        celebrateCompletion();
      }
    } catch (error) {
      console.error('Error handling action completion:', error);
    }
  };

  // 🎨 NEW: Checklist-specific completion handler
  const handleChecklistItemComplete = async (itemId, completed) => {
    try {
      // Find the item to get device and action IDs
      const item = checklistItems.find(item => item.id === itemId);
      if (item) {
        await handleActionComplete(item.deviceId, item.actionId, completed);
      } else {
        console.error('Item not found for ID:', itemId);
      }
    } catch (error) {
      console.error('Error handling checklist item completion:', error);
    }
  };

  // Calculate progress for the header
  const getProgress = () => {
    if (checklistItems.length === 0) return 0;
    const completedItems = checklistItems.filter(item => item.completed).length;
    return (completedItems / checklistItems.length) * 100;
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
    console.log('🎉 Celebrating completion of Check 1.3.2');
    // Always show CompletionPopup first, let user click "Continue" to go to AreaCompletionScreen
    setShowCompletionPopup(true);
  };

  // Helper function to get device icon
  const getDeviceIcon = (device) => {
    const platform = device.platform || device.tier2;
    const type = device.type;
    
    if (type === 'mobile' || type === 'Mobile') {
      return platform === 'ios' ? 'phone-portrait' : 'phone-portrait';
    } else if (type === 'computer' || type === 'Computer') {
      return platform === 'macos' ? 'laptop' : 'desktop';
    }
    
    return 'desktop';
  };

  // ✅ REFINED: Simple, actionable local backup actions for non-technical users
  const createLocalBackupActions = async (device) => {
    const deviceActionsList = [];
    const platform = device.platform || device.tier2;
    const type = device.type;

    // Add fallback for unknown platform or web
    if (platform === 'unknown' || !platform || platform === 'web') {
      deviceActionsList.push(
        {
          id: 'generic-backup-setup',
          title: 'Set Up Simple File Backup',
          description: 'Create a backup of your important files using external storage.',
          completed: false,
          priority: 'high',
          category: 'backup',
          steps: [
            'Connect a USB drive or external hard drive to your computer',
            'Open your Documents, Pictures, and Downloads folders',
            'Copy your important files to the external drive',
            'Create a "Backup" folder on the external drive to stay organized',
            'Test by opening a few files from the backup to make sure they work'
          ],
          tips: [
            'Focus on irreplaceable files like photos, documents, and personal data',
            'Backup your files at least once a month',
            'Keep the external drive in a safe place away from your computer',
            'Consider making a second backup copy for extra safety'
          ]
        }
      );
      return deviceActionsList;
    }

    if (type === 'mobile' || type === 'Mobile') {
      if (platform === 'ios') {
        deviceActionsList.push(
          {
            id: 'ios-simple-backup',
            title: 'Backup iPhone to Computer',
            description: 'Create a simple backup of your iPhone using your computer.',
            completed: false,
            priority: 'high',
            category: 'backup',
            steps: [
              'Connect your iPhone to your computer with the charging cable',
              'Open iTunes (or Finder on Mac)',
              'Click on your iPhone when it appears',
              'Click "Back Up Now" button',
              'Wait for the backup to complete (may take 10-30 minutes)'
            ],
            tips: [
              'Keep your computer connected to power during backups',
              'Make sure you have enough free space on your computer',
              'Do this backup at least once a month',
              'The backup includes your photos, contacts, and app data'
            ]
          }
        );
      } else if (platform === 'android') {
        deviceActionsList.push(
          {
            id: 'android-simple-backup',
            title: 'Backup Android Photos and Files',
            description: 'Copy your important photos and files to your computer.',
            completed: false,
            priority: 'high',
            category: 'backup',
            steps: [
              'Connect your Android phone to your computer with a USB cable',
              'On your phone, tap "File Transfer" or "MTP" when prompted',
              'On your computer, open your phone\'s folder',
              'Copy your Photos, Documents, and Downloads folders to your computer',
              'Create a "Phone Backup" folder on your computer to stay organized'
            ],
            tips: [
              'Focus on photos and videos first - these are usually the most important',
              'Do this backup at least once a month',
              'Keep your phone connected until the copy is complete',
              'Check that the files copied correctly by opening a few photos'
            ]
          }
        );
      }
    } else if (type === 'computer' || type === 'Computer') {
      if (platform === 'macos') {
        deviceActionsList.push(
          {
            id: 'macos-simple-backup',
            title: 'Set Up Time Machine Backup',
            description: 'Use Time Machine to automatically backup your Mac.',
            completed: false,
            priority: 'high',
            category: 'backup',
            steps: [
              'Connect an external hard drive to your Mac',
              'Open System Preferences (or System Settings on newer Macs)',
              'Click "Time Machine"',
              'Click "Select Backup Disk"',
              'Choose your external drive and click "Use Disk"'
            ],
            tips: [
              'Use a drive that\'s at least twice the size of your Mac\'s storage',
              'Keep the external drive connected for automatic backups',
              'Time Machine will backup your files automatically every hour',
              'You can restore individual files or your entire system if needed'
            ]
          }
        );
      } else if (platform === 'windows') {
        deviceActionsList.push(
          {
            id: 'windows-simple-backup',
            title: 'Set Up File History Backup',
            description: 'Use Windows File History to automatically backup your files.',
            completed: false,
            priority: 'high',
            category: 'backup',
            steps: [
              'Connect an external drive to your PC',
              'Open Settings (Windows key + I)',
              'Go to Update & Security > Backup',
              'Click "Add a drive" under File History',
              'Select your external drive'
            ],
            tips: [
              'File History will automatically backup your Documents, Pictures, and other folders',
              'Keep the external drive connected for regular backups',
              'You can restore previous versions of files if they get deleted or changed',
              'Check the backup is working by looking for recent backup dates'
            ]
          }
        );
      }
    }

    return deviceActionsList;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* ✅ UPDATED: Header with progress bar */}
      <HeaderWithProgress
        checkId="1-3-2"
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
        icon="💾"
        title="Wait, don't go!"
        message="You're creating local backups to protect your data from ransomware and device failure. Don't risk losing your precious files!"
      />
      
      {/* 🎨 REVISED: InteractiveChecklist with backup tasks */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
          {/* Title and Description */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Local Backup Setup</Text>
            <Text style={styles.description}>
              Create simple backups of your important files using external storage. This guide will show you the easiest way to backup your data without technical complexity.
            </Text>
          </View>

      {/* Learn More Section */}
      <TouchableOpacity
        style={styles.learnMoreButton}
        onPress={() => setShowLearnMore(!showLearnMore)}
        activeOpacity={0.8}
      >
        <Text style={styles.learnMoreText}>Why is local backup important?</Text>
        <Ionicons
          name={showLearnMore ? 'chevron-up' : 'chevron-down'}
          size={Responsive.iconSizes.medium}
          color={Colors.accent}
        />
      </TouchableOpacity>

      {showLearnMore && (
        <View style={styles.learnMoreContent}>
          <Text style={styles.learnMoreTitle}>Local Backup Benefits</Text>
          <Text style={styles.learnMoreBody}>
            Local backup is like having a safety deposit box in your own home. While cloud backup is great for convenience, local backup gives you complete control over your data and works even when the internet is down. Imagine your computer crashes right before an important presentation, or your phone gets stolen with all your vacation photos. With local backup, you can restore everything in minutes, not hours or days. It's also perfect for sensitive files you don't want stored online, like personal documents or work projects. Plus, local backup is often faster than downloading from the cloud, and you don't need to worry about monthly subscription fees or internet speed. It's your personal insurance policy against digital disasters.
          </Text>
        </View>
      )}

          {/* ✅ REFINED: Simple backup checklist */}
          {!isLoading && checklistItems.length > 0 ? (
            <InteractiveChecklist
              checklistItems={checklistItems}
              onActionComplete={handleChecklistItemComplete}
              variant="enhanced"
              checkId="1-3-2"
              navigation={navigation}
              customHeaderTitle="Let's Set Up Local Backup"
              {...getChecklistConfig('1-3-2')}
            />
          ) : (
            <View style={styles.fallbackContainer}>
              <Text style={styles.fallbackTitle}>Setting Up Local Backup</Text>
              <Text style={styles.fallbackText}>
                We're preparing simple backup solutions for your devices.
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
            <Text style={styles.tipsTitle}>💾 Local Backup Best Practices</Text>
            <View style={styles.tipItem}>
              <Ionicons name="refresh" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Back up important files regularly, at least weekly</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="shield-checkmark" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Use multiple backup locations for critical data</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Test your backups regularly to ensure they work</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="lock-closed" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Encrypt sensitive backup files for extra security</Text>
            </View>
          </View>

          {/* References Section */}
          <ReferencesSection references={getReferencesForCheck('1-3-2')} />

        </View>
      </ScrollView>
      
      {/* ✅ PRESERVE: Exact same completion card */}
          <CompletionPopup
            isVisible={showCompletionPopup}
            title={getCompletionMessage('1-3-2').title}
            description={getCompletionMessage('1-3-2').description}
            nextScreenName={getNextScreenName('1-3-2')}
            navigation={navigation}
            onClose={() => setShowCompletionPopup(false)}
            variant="modal"
            checkId="1-3-2"
            animationType="confetti"
            onContinue={() => {
              setShowCompletionPopup(false);
              setIsCompleted(false);
              // Use the new navigation logic for area completion
              const completionNav = getCompletionNavigation('1-3-2');
              if (completionNav.type === 'area_completion') {
                navigation.navigate(completionNav.target, completionNav.params);
              } else {
                navigation.navigate(completionNav.target);
              }
            }}
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

export default Check1_3_2_LocalBackupScreen;
