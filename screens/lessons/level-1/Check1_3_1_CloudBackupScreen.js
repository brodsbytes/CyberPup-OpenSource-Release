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

/**
 * Check1_3_1_CloudBackupScreen - Pattern B Implementation
 * 
 * Cloud backup setup with mobile verification workflows and desktop recommendations.
 * Applies proven Pattern B architecture:
 * - User-controlled advancement
 * - Device-specific content delivery
 * - Mobile verification workflows to check backup status
 * - Native services + reputable third-party options
 * - Proper progress persistence
 */
const Check1_3_1_CloudBackupScreen = ({ navigation, route }) => {
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
          icon: getDeviceIcon(currentDevice)
        });
      }

      setUserDevices(allDevices);

      // Create device-specific actions for cloud backup setup
      const actions = {};
      for (const device of allDevices) {
        actions[device.id] = await createCloudBackupActions(device);
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
        'current-device': await createCloudBackupActions(fallbackDevice)
      });
    }
  };

  const createCloudBackupActions = async (device) => {
    const platform = device.platform || device.tier2;
    const isMobile = device.type === 'mobile' || platform === 'ios' || platform === 'android';
    const settingsGuide = SettingsGuide.createGuidance('backup', device);

    const actions = [];

    if (isMobile) {
      // Mobile devices get verification workflows
      if (platform === 'ios') {
        actions.push({
          id: `${device.id}-icloud-check`,
          title: 'Check iCloud Backup Status',
          description: 'Verify that iCloud backup is enabled and working',
          completed: false,
          steps: [
            'Open Settings',
            'Tap your name at the top',
            'Tap "iCloud"',
            'Tap "iCloud Backup"',
            'Check that "iCloud Backup" is turned on',
            'Check the "Last Backup" date is recent'
          ],
          deepLink: 'App-Prefs:CASTLE',
          verification: 'verification_workflow',
          priority: 'high'
        });
        
        actions.push({
          id: `${device.id}-icloud-enable`,
          title: 'Enable iCloud Backup',
          description: 'Turn on automatic iCloud backup if not enabled',
          completed: false,
          steps: [
            'In iCloud Backup settings',
            'Turn on "iCloud Backup" if disabled',
            'Tap "Back Up Now" to start initial backup',
            'Ensure you have enough iCloud storage',
            'Consider upgrading iCloud storage if needed'
          ],
          deepLink: 'App-Prefs:CASTLE',
          verification: 'manual',
          priority: 'high'
        });
      } else if (platform === 'android') {
        actions.push({
          id: `${device.id}-google-check`,
          title: 'Check Google Backup Status',
          description: 'Verify that Google backup is enabled and working',
          completed: false,
          steps: [
            'Open Settings',
            'Tap "Google" or search for "Backup"',
            'Tap "Backup"',
            'Check that "Back up to Google Drive" is on',
            'Review what data is being backed up',
            'Check the last backup date'
          ],
          deepLink: 'android.settings.SYNC_SETTINGS',
          verification: 'verification_workflow',
          priority: 'high'
        });
        
        actions.push({
          id: `${device.id}-google-enable`,
          title: 'Enable Google Backup',
          description: 'Turn on automatic Google Drive backup if not enabled',
          completed: false,
          steps: [
            'In Google Backup settings',
            'Turn on "Back up to Google Drive" if disabled',
            'Select data to back up (Apps, Call history, etc.)',
            'Tap "Back up now" to start initial backup',
            'Ensure you have enough Google Drive storage'
          ],
          deepLink: 'android.settings.SYNC_SETTINGS',
          verification: 'manual',
          priority: 'high'
        });
      }
      
      // Third-party option for mobile
      actions.push({
        id: `${device.id}-third-party`,
        title: 'Consider Additional Backup Service',
        description: 'Set up a reputable third-party backup service for extra protection',
        completed: false,
        steps: [
          'Research reputable backup services (Dropbox, OneDrive, pCloud)',
          'Install your chosen backup app',
          'Sign up for an account',
          'Configure automatic photo and document backup',
          'Verify backup is working correctly'
        ],
        verification: 'manual',
        priority: 'medium',
        thirdPartyOptions: getThirdPartyBackupOptions(platform)
      });
      
    } else {
      // Desktop devices get recommendations only
      if (platform === 'windows') {
        actions.push({
          id: `${device.id}-onedrive`,
          title: 'Set Up OneDrive Sync',
          description: 'Enable OneDrive for automatic cloud backup of documents',
          completed: false,
          steps: [
            'Press Windows key + I to open Settings',
            'Click "Accounts" then "Backup"',
            'Sign in to your Microsoft account',
            'Turn on "Sync settings" and "Folder backup"',
            'Choose folders to sync (Desktop, Documents, Pictures)',
            'Verify sync is working'
          ],
          verification: 'manual',
          priority: 'high'
        });
        
        actions.push({
          id: `${device.id}-file-history`,
          title: 'Enable File History',
          description: 'Set up Windows File History for local backup',
          completed: false,
          steps: [
            'Connect an external drive',
            'Open File History in Control Panel',
            'Click "Turn on" File History',
            'Select backup location (external drive)',
            'Configure backup frequency',
            'Run first backup'
          ],
          verification: 'manual',
          priority: 'medium'
        });
      } else if (platform === 'macos') {
        actions.push({
          id: `${device.id}-time-machine`,
          title: 'Set Up Time Machine',
          description: 'Enable macOS Time Machine for complete system backup',
          completed: false,
          steps: [
            'Connect an external drive or network storage',
            'Open System Preferences > Time Machine',
            'Click "Select Backup Disk"',
            'Choose your backup destination',
            'Turn on Time Machine',
            'Wait for initial backup to complete'
          ],
          verification: 'manual',
          priority: 'high'
        });
        
        actions.push({
          id: `${device.id}-icloud-drive`,
          title: 'Enable iCloud Drive',
          description: 'Turn on iCloud Drive for document and desktop sync',
          completed: false,
          steps: [
            'Open System Preferences > Apple ID',
            'Click "iCloud" in the sidebar',
            'Check "iCloud Drive"',
            'Click "Options" next to iCloud Drive',
            'Enable "Desktop & Documents Folders"',
            'Monitor sync status'
          ],
          verification: 'manual',
          priority: 'high'
        });
      }
      
      // Third-party option for desktop
      actions.push({
        id: `${device.id}-third-party`,
        title: 'Consider Professional Backup Solution',
        description: 'Set up a comprehensive backup service for complete protection',
        completed: false,
        steps: [
          'Research professional backup services (Backblaze, Carbonite, Acronis)',
          'Choose a service that meets your needs',
          'Download and install the backup software',
          'Configure backup settings and schedules',
          'Perform initial backup',
          'Test restore functionality'
        ],
        verification: 'manual',
        priority: 'medium',
        thirdPartyOptions: getThirdPartyBackupOptions(platform)
      });
    }

    return actions;
  };

  const getThirdPartyBackupOptions = (platform) => {
    const options = {
      ios: [
        { name: 'Dropbox', description: 'Popular cloud storage with automatic photo backup' },
        { name: 'Google Drive', description: 'Additional Google storage beyond device backup' },
        { name: 'OneDrive', description: 'Microsoft cloud storage with Office integration' }
      ],
      android: [
        { name: 'Dropbox', description: 'Popular cloud storage with automatic photo backup' },
        { name: 'OneDrive', description: 'Microsoft cloud storage with Office integration' },
        { name: 'pCloud', description: 'Secure European cloud storage provider' }
      ],
      windows: [
        { name: 'Backblaze', description: 'Unlimited computer backup for $6/month' },
        { name: 'Carbonite', description: 'Personal and business backup solutions' },
        { name: 'Acronis True Image', description: 'Complete cyber protection with backup' }
      ],
      macos: [
        { name: 'Backblaze', description: 'Unlimited Mac backup for $6/month' },
        { name: 'Arq', description: 'Encrypted backup to your own cloud storage' },
        { name: 'Super Duper!', description: 'Disk cloning and backup for Mac' }
      ]
    };
    
    return options[platform] || [];
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
      const progressData = await AsyncStorage.getItem('check_1-3-1_progress');
      const completedData = await AsyncStorage.getItem('check_1-3-1_completed');
      
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
      
      await AsyncStorage.setItem('check_1-3-1_progress', JSON.stringify(progressData));
      
      if (isCompleted) {
        await AsyncStorage.setItem('check_1-3-1_completed', 'completed');
      } else {
        await AsyncStorage.removeItem('check_1-3-1_completed');
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
          
          await AsyncStorage.setItem('check_1-3-1_progress', JSON.stringify(progressData));
          await AsyncStorage.setItem('check_1-3-1_completed', 'completed');
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
    console.log('🎉 Celebrating completion of Check 1.3.1');
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
        checkId="1-3-1"
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
              <Text style={styles.characterText}>☁️</Text>
            </View>

            <Text style={styles.modalTitle}>Wait, don't go!</Text>
            <Text style={styles.modalMessage}>
              You're about to protect your precious data and memories with cloud backup. Don't let a device failure erase years of photos and documents!
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Title and Description */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Set Up Cloud Backup</Text>
            <Text style={styles.description}>
              Protect your important data, photos, and documents with reliable cloud backup solutions. Never lose your digital life to device failure or theft.
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
            <Text style={styles.learnMoreText}>Why is cloud backup important?</Text>
            <Ionicons
              name={showLearnMore ? 'chevron-up' : 'chevron-down'}
              size={Responsive.iconSizes.medium}
              color={Colors.accent}
            />
          </TouchableOpacity>

          {showLearnMore && (
            <View style={styles.learnMoreContent}>
              <Text style={styles.learnMoreTitle}>Cloud Backup Benefits</Text>
              <Text style={styles.learnMoreBody}>
                Cloud backup is like having a safety deposit box in the sky that automatically protects your most precious digital memories and important documents. Imagine losing your phone with years of family photos, or your laptop crashing with all your work projects - without cloud backup, those memories and files could be gone forever. Cloud backup works silently in the background, constantly saving copies of your data to secure servers around the world. It's like having a personal assistant who never forgets to make copies of everything important. When disaster strikes - whether it's a stolen phone, a flooded laptop, or even ransomware that locks your files - you can restore everything in minutes, not months. Plus, you can access your files from any device, anywhere, making your digital life truly portable. It's the difference between losing everything and having a complete digital safety net.
              </Text>
            </View>
          )}

          {/* Device-Specific Sections */}
          <View style={styles.devicesSection}>
            <Text style={styles.devicesSectionTitle}>Cloud Backup Setup by Device</Text>
            <Text style={styles.devicesSectionSubtitle}>
              Configure automatic cloud backup on each device. Mobile devices support verification workflows, desktop devices get comprehensive recommendations.
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
                  name="cloud-upload" 
                  size={Responsive.iconSizes.xxlarge} 
                  color={Colors.textSecondary} 
                />
                <Text style={styles.noDevicesTitle}>No Devices Found</Text>
                <Text style={styles.noDevicesText}>
                  Add your devices in the Profile tab to get personalized backup setup recommendations.
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
            <Text style={styles.tipsTitle}>☁️ Backup Best Practices</Text>
            <View style={styles.tipItem}>
              <Ionicons name="repeat" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Follow the 3-2-1 rule: 3 copies, 2 different media, 1 offsite</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="time" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Enable automatic backup to keep data current</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Test restore functionality periodically</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="lock-closed" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Choose services with strong encryption</Text>
            </View>
          </View>

          {/* Completion Status */}
          <CompletionPopup
          isVisible={showCompletionPopup}
          title={getCompletionMessage('1-3-1').title}
          description={getCompletionMessage('1-3-1').description}
          nextScreenName={getNextScreenName('1-3-1')}
          navigation={navigation}
          onContinue={() => {
            setIsCompleted(false);
            navigation.navigate(getNextScreenName('1-3-1'));
          }}
          variant="modal"
            onClose={() => setShowCompletionPopup(false)}
            checkId="1-3-1"
          />
          {/* References Section */}
          <ReferencesSection references={getReferencesForCheck('1-3-1')} />

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

export default Check1_3_1_CloudBackupScreen;
