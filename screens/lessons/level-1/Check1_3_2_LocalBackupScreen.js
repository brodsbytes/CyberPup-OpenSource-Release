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
import { SCREEN_NAMES } from '../../../constants';
import { DeviceCapabilities } from '../../../utils/deviceCapabilities';
import { SettingsGuide } from '../../../utils/settingsGuide';
import { AppStorage } from '../../../utils/storage';
import CompletionPopup from '../../../components/CompletionPopup';
import { getCompletionMessage, getNextScreenName } from '../../../utils/completionMessages';
import HeaderWithProgress from '../../../components/HeaderWithProgress';

import InteractiveChecklist from '../../../components/InteractiveChecklist';

const Check1_3_2_LocalBackupScreen = ({ navigation, route }) => {
  // ✅ PRESERVE: Exact same state management as Check 1.4
  const [userDevices, setUserDevices] = useState([]);
  const [deviceActions, setDeviceActions] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [deviceCompletionStatus, setDeviceCompletionStatus] = useState({});
  const [showExitModal, setShowExitModal] = useState(false);

  // 🎨 NEW: Checklist-specific state
  const [checklistItems, setChecklistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ PRESERVE: Exact same initialization logic
  const initializeDeviceContent = async () => {
    try {
      setIsLoading(true);
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
        actions[device.id] = await createLocalBackupActions(device);
      }
      setDeviceActions(actions);

      // 🎨 NEW: Convert device actions to checklist items
      const checklistItemsFromActions = convertActionsToChecklistItems(actions, allDevices);
      setChecklistItems(checklistItemsFromActions);
      
      console.log('Debug: userDevices.length:', allDevices.length);
      console.log('Debug: checklistItems.length:', checklistItemsFromActions.length);
      console.log('Debug: checklistItems:', checklistItemsFromActions);
      console.log('Debug: All devices:', allDevices);
      console.log('Debug: All actions:', actions);
      
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
        
        console.log('Debug: Fallback - userDevices.length:', 1);
        console.log('Debug: Fallback - checklistItems.length:', fallbackChecklistItems.length);
        console.log('Debug: Fallback - checklistItems:', fallbackChecklistItems);
        
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
        
        console.log('Debug: Generic - userDevices.length:', 1);
        console.log('Debug: Generic - checklistItems.length:', genericChecklistItems.length);
        console.log('Debug: Generic - checklistItems:', genericChecklistItems);
        
        setIsLoading(false);
      }
    }
  };

  // 🎨 NEW: Convert device actions to checklist items format
  const convertActionsToChecklistItems = (actions, devices) => {
    const checklistItems = [];
    
    console.log('Debug: Converting actions to checklist items');
    console.log('Debug: Actions:', actions);
    console.log('Debug: Devices:', devices);
    
    devices.forEach(device => {
      const deviceActions = actions[device.id] || [];
      console.log(`Debug: Device ${device.id} has ${deviceActions.length} actions:`, deviceActions);
      
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
    
    console.log('Debug: Final checklist items:', checklistItems);
    return checklistItems;
  };

  // ✅ PRESERVE: Exact same progress management
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

  // 🎨 NEW: Clear any existing progress to start fresh
  useEffect(() => {
    const clearProgress = async () => {
      try {
        await AsyncStorage.removeItem('check_1-3-2_progress');
        console.log('Debug: Cleared existing progress');
      } catch (error) {
        console.error('Error clearing progress:', error);
      }
    };
    clearProgress();
  }, []);

  // ✅ PRESERVE: Save progress when actions change
  useEffect(() => {
    saveProgress();
  }, [deviceActions, deviceCompletionStatus, isCompleted, checklistItems]);

  // ✅ PRESERVE: Action completion handler
  const handleActionComplete = async (deviceId, actionId, completed) => {
    try {
      console.log('Debug: handleActionComplete called with:', deviceId, actionId, completed);
      // Update device actions
      setDeviceActions(prev => {
        const newActions = { ...prev };
        if (newActions[deviceId]) {
          newActions[deviceId] = newActions[deviceId].map(action => 
            action.id === actionId ? { ...action, completed } : action
          );
        }
        return newActions;
      });

      // 🎨 NEW: Update checklist items
      setChecklistItems(prev => 
        prev.map(item => 
          item.deviceId === deviceId && item.actionId === actionId 
            ? { ...item, completed } 
            : item
        )
      );

      // Check if all actions for this device are completed
      const deviceActions = deviceActions[deviceId] || [];
      const allCompleted = deviceActions.every(action => action.completed);
      
      if (allCompleted) {
        setDeviceCompletionStatus(prev => ({
          ...prev,
          [deviceId]: true
        }));
      }

      // Check if all devices are completed
      const allDevicesCompleted = userDevices.every(device => 
        deviceCompletionStatus[device.id] || 
        (deviceActions[device.id] && deviceActions[device.id].every(action => action.completed))
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
      console.log('Debug: handleChecklistItemComplete called with:', itemId, completed);
      
      // Find the item to get device and action IDs
      const item = checklistItems.find(item => item.id === itemId);
      console.log('Debug: Found item:', item);
      if (item) {
        console.log('Debug: Calling handleActionComplete with:', item.deviceId, item.actionId, completed);
        await handleActionComplete(item.deviceId, item.actionId, completed);
      } else {
        console.error('Debug: Item not found for ID:', itemId);
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
    // The completion popup will be shown automatically when isCompleted is true
    // No need to call it as a function
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

  // ✅ CRITICAL: Avoid variable name conflicts
  const createLocalBackupActions = async (device) => {
    const deviceActionsList = [];
    const platform = device.platform || device.tier2;
    const type = device.type;

    console.log('Debug: createLocalBackupActions called with device:', device);
    console.log('Debug: platform:', platform, 'type:', type);

    // Add fallback for unknown platform or web
    if (platform === 'unknown' || !platform || platform === 'web') {
      deviceActionsList.push(
        {
          id: 'generic-backup-setup',
          title: 'Set Up Local Backup',
          description: 'Configure local backup solutions for your device to protect your data.',
          completed: false,
          priority: 'high',
          category: 'backup',
          steps: [
            'Identify important files and folders on your device',
            'Connect an external storage device (USB drive, external hard drive)',
            'Copy important files to the external storage',
            'Set up automatic backup if available',
            'Test the backup by accessing files from external storage'
          ],
          tips: [
            'Focus on irreplaceable files like photos, documents, and personal data',
            'Keep multiple backup copies for critical data',
            'Store backups in a different physical location for disaster recovery',
            'Backup regularly, especially before major updates'
          ]
        },
        {
          id: 'generic-backup-verification',
          title: 'Verify Backup Integrity',
          description: 'Ensure your backup was created successfully and files are accessible.',
          completed: false,
          priority: 'medium',
          category: 'verification',
          steps: [
            'Open a few files from your backup to verify they work',
            'Check that all important folders were copied',
            'Verify backup size is reasonable for your data',
            'Test accessing backup from a different device if possible',
            'Set a reminder to backup regularly'
          ],
          tips: [
            'Regular backups should be done weekly or monthly',
            'Keep multiple backup versions for safety',
            'Test restore process periodically',
            'Document your backup process for future reference'
          ]
        }
      );
      return deviceActionsList;
    }

    console.log('Debug: Checking device type:', type);
    if (type === 'mobile' || type === 'Mobile') {
      console.log('Debug: Device is mobile, checking platform:', platform);
      if (platform === 'ios') {
        deviceActionsList.push(
          {
            id: 'ios-itunes-backup',
            title: 'Set Up iTunes Backup',
            description: 'Configure iTunes to create local backups of your iPhone.',
            completed: false,
            priority: 'high',
            category: 'backup',
            steps: [
              'Connect your iPhone to your computer',
              'Open iTunes (or Finder on macOS Catalina+)',
              'Select your device from the sidebar',
              'Check "Automatically backup when this iPhone is connected"',
              'Click "Back Up Now" to create your first backup'
            ],
            tips: [
              'Keep your computer connected to power during backups',
              'Backups may take 30-60 minutes for the first time',
              'Ensure you have enough free space on your computer'
            ]
          },
          {
            id: 'ios-encrypted-backup',
            title: 'Enable Encrypted Backups',
            description: 'Protect your backup data with encryption.',
            completed: false,
            priority: 'medium',
            category: 'security',
            steps: [
              'In iTunes/Finder, select your device',
              'Check "Encrypt local backup"',
              'Set a strong password for the backup',
              'Write down the password in a secure location',
              'Click "Back Up Now" to create encrypted backup'
            ],
            tips: [
              'Encrypted backups include passwords and health data',
              'Don\'t forget your backup password - it cannot be recovered',
              'Use a password manager to store the backup password'
            ]
          },
          {
            id: 'ios-backup-verification',
            title: 'Verify Backup Integrity',
            description: 'Ensure your backup was created successfully.',
            completed: false,
            priority: 'medium',
            category: 'verification',
            steps: [
              'Check the backup date in iTunes/Finder',
              'Verify the backup size is reasonable',
              'Test restoring a few photos or contacts',
              'Note the backup location on your computer',
              'Set a reminder to backup regularly'
            ],
            tips: [
              'Regular backups should be done weekly',
              'Keep multiple backup versions for safety',
              'Test restore process periodically'
            ]
          }
        );
      } else if (platform === 'android') {
        console.log('Debug: Platform is Android, adding Android actions');
        deviceActionsList.push(
          {
            id: 'android-adb-backup',
            title: 'Set Up ADB Backup',
            description: 'Use Android Debug Bridge to create local backups.',
            completed: false,
            priority: 'high',
            category: 'backup',
            steps: [
              'Enable Developer Options on your Android device',
              'Enable USB Debugging in Developer Options',
              'Connect device to computer via USB',
              'Install ADB on your computer',
              'Run backup command: adb backup -apk -shared -all'
            ],
            tips: [
              'ADB backup requires technical knowledge',
              'Backup files are stored on your computer',
              'Keep backup files in a secure location'
            ]
          },
          {
            id: 'android-manual-backup',
            title: 'Manual File Backup',
            description: 'Manually copy important files to your computer.',
            completed: false,
            priority: 'medium',
            category: 'backup',
            steps: [
              'Connect your Android device to computer',
              'Enable file transfer mode on device',
              'Navigate to device storage on computer',
              'Copy important folders (Photos, Documents, etc.)',
              'Verify files copied successfully'
            ],
            tips: [
              'Focus on irreplaceable files first',
              'Create organized folder structure on computer',
              'Backup photos and videos regularly'
            ]
          },
          {
            id: 'android-backup-apps',
            title: 'Backup App Data',
            description: 'Use backup apps to protect app data and settings.',
            completed: false,
            priority: 'medium',
            category: 'apps',
            steps: [
              'Install a backup app (e.g., Titanium Backup)',
              'Grant necessary permissions to backup app',
              'Select apps to backup',
              'Configure backup schedule',
              'Test restore process with a non-critical app'
            ],
            tips: [
              'Some apps require root access for full backup',
              'Backup app data before factory reset',
              'Store backup files on external storage'
            ]
          }
        );
      }
    } else if (type === 'computer' || type === 'Computer') {
      console.log('Debug: Device is computer, checking platform:', platform);
      if (platform === 'macos') {
        deviceActionsList.push(
          {
            id: 'macos-time-machine',
            title: 'Set Up Time Machine',
            description: 'Configure Time Machine for automatic local backups.',
            completed: false,
            priority: 'high',
            category: 'backup',
            steps: [
              'Connect external hard drive to your Mac',
              'Open System Preferences',
              'Click Time Machine',
              'Click "Select Backup Disk"',
              'Choose your external drive and click "Use Disk"'
            ],
            tips: [
              'Use a drive at least 2x the size of your data',
              'Keep Time Machine drive connected regularly',
              'Time Machine creates hourly backups automatically'
            ]
          },
          {
            id: 'macos-manual-backup',
            title: 'Manual File Backup',
            description: 'Create manual backups of important files.',
            completed: false,
            priority: 'medium',
            category: 'backup',
            steps: [
              'Identify important files and folders',
              'Create backup folder on external drive',
              'Copy Documents, Pictures, and other important folders',
              'Use rsync or cp command for efficient copying',
              'Verify backup integrity'
            ],
            tips: [
              'Focus on user-created content first',
              'Use rsync for incremental backups',
              'Create multiple backup copies for critical data'
            ]
          },
          {
            id: 'macos-system-backup',
            title: 'Create System Image',
            description: 'Create a complete system backup using Disk Utility.',
            completed: false,
            priority: 'low',
            category: 'system',
            steps: [
              'Open Disk Utility from Applications > Utilities',
              'Select your Mac\'s drive from the sidebar',
              'Click "New Image" from the toolbar',
              'Choose "DVD/CD Master" format',
              'Save the image to external drive'
            ],
            tips: [
              'System images are very large',
              'Use for complete system recovery',
              'Store system images securely'
            ]
          }
        );
      } else if (platform === 'windows') {
        console.log('Debug: Platform is Windows, adding Windows actions');
        deviceActionsList.push(
          {
            id: 'windows-file-history',
            title: 'Set Up File History',
            description: 'Configure Windows File History for automatic backups.',
            completed: false,
            priority: 'high',
            category: 'backup',
            steps: [
              'Connect external drive to your PC',
              'Open Settings > Update & Security',
              'Click Backup in the left sidebar',
              'Click "Add a drive" under File History',
              'Select your external drive'
            ],
            tips: [
              'File History backs up user files automatically',
              'Keep external drive connected for regular backups',
              'Configure backup frequency in advanced settings'
            ]
          },
          {
            id: 'windows-system-restore',
            title: 'Create System Restore Point',
            description: 'Set up System Restore for system recovery.',
            completed: false,
            priority: 'medium',
            category: 'system',
            steps: [
              'Open System Properties (Win + Pause/Break)',
              'Click "System Protection" tab',
              'Click "Create" to make a restore point',
              'Enter a description for the restore point',
              'Click "Create" to finish'
            ],
            tips: [
              'Create restore points before major changes',
              'System Restore doesn\'t affect personal files',
              'Keep multiple restore points for safety'
            ]
          },
          {
            id: 'windows-manual-backup',
            title: 'Manual File Backup',
            description: 'Manually copy important files to external storage.',
            completed: false,
            priority: 'medium',
            category: 'backup',
            steps: [
              'Connect external drive to your PC',
              'Open File Explorer',
              'Navigate to important folders (Documents, Pictures, etc.)',
              'Copy folders to external drive',
              'Verify files copied successfully'
            ],
            tips: [
              'Focus on user files and documents',
              'Create organized folder structure',
              'Backup regularly, especially before updates'
            ]
          }
        );
      } else if (platform === 'web') {
        console.log('Debug: Platform is Web, adding Web actions');
        deviceActionsList.push(
          {
            id: 'web-browser-backup',
            title: 'Browser Data Backup',
            description: 'Backup your browser bookmarks, passwords, and settings.',
            completed: false,
            priority: 'high',
            category: 'backup',
            steps: [
              'Export bookmarks from your browser',
              'Export saved passwords (if using browser password manager)',
              'Export browser settings and extensions',
              'Save exported files to a secure location',
              'Consider using a dedicated password manager'
            ],
            tips: [
              'Use browser sync features for automatic backup',
              'Export data regularly before browser updates',
              'Store backup files in cloud storage for safety',
              'Consider switching to dedicated password managers'
            ]
          },
          {
            id: 'web-file-backup',
            title: 'Local File Backup',
            description: 'Backup important files from your computer.',
            completed: false,
            priority: 'medium',
            category: 'backup',
            steps: [
              'Identify important files and folders',
              'Connect external storage device',
              'Copy important files to external storage',
              'Verify files copied successfully',
              'Set up regular backup schedule'
            ],
            tips: [
              'Focus on irreplaceable files first',
              'Use cloud storage as additional backup',
              'Keep multiple backup copies',
              'Test restore process periodically'
            ]
          }
        );
      }
    }

    console.log('Debug: Final deviceActionsList length:', deviceActionsList.length);
    console.log('Debug: Final deviceActionsList:', deviceActionsList);
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
              <Text style={styles.characterText}>💾</Text>
            </View>

            <Text style={styles.modalTitle}>Wait, don't go!</Text>
            <Text style={styles.modalMessage}>
              You're creating local backups to protect your data from ransomware and device failure. Don't risk losing your precious files!
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.keepLearningButton}
                onPress={handleKeepLearning}
                activeOpacity={0.8}
              >
                <Text style={styles.keepLearningButtonText}>Keep going</Text>
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
      
      {/* 🎨 REVISED: InteractiveChecklist with backup tasks */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
          {/* Title and Description */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Local Backup Setup</Text>
        <Text style={styles.description}>
              Create local backups of your important data. This checklist will guide you through setting up backup solutions for all your devices to protect against data loss.
        </Text>
      </View>

          {/* Backup Checklist */}
          {isLoading ? (
            <View style={styles.fallbackContainer}>
              <Text style={styles.fallbackTitle}>Loading Backup Solutions...</Text>
              <Text style={styles.fallbackText}>
                We're preparing personalized backup recommendations for your devices.
              </Text>
            </View>
          ) : userDevices.length > 0 && checklistItems.length > 0 ? (
            <InteractiveChecklist
              userDevices={userDevices}
              deviceActions={deviceActions}
              onActionComplete={handleChecklistItemComplete}
              variant="checklist"
              checkId="1-3-2"
              navigation={navigation}
              checklistItems={checklistItems}
            />
          ) : (
            <View style={styles.fallbackContainer}>
              <Text style={styles.fallbackTitle}>Setting Up Backup Solutions</Text>
              <Text style={styles.fallbackText}>
                We're preparing personalized backup recommendations for your devices.
              </Text>
              <Text style={styles.debugText}>
                Debug: userDevices={userDevices.length}, checklistItems={checklistItems.length}
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={initializeDeviceContent}
              >
                <Text style={styles.retryButtonText}>Retry Setup</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* ✅ PRESERVE: Exact same completion card */}
          <CompletionPopup
          isVisible={showCompletionPopup}
          title={getCompletionMessage('1-3-2').title}
          description={getCompletionMessage('1-3-2').description}
          nextScreenName={getNextScreenName('1-3-2')}
          navigation={navigation}
          onContinue={() => {
            setIsCompleted(false);
            navigation.navigate(getNextScreenName('1-3-2'));
          }}
          variant="modal"
            onClose={() => setShowCompletionPopup(false)}
            checkId="1-3-2"
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
  debugText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Responsive.spacing.sm,
    fontFamily: 'monospace',
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
  
});

export default Check1_3_2_LocalBackupScreen;
