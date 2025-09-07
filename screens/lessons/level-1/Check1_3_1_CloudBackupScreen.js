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
import { CopywritingService } from '../../../utils/copywritingService';
import HeaderWithProgress from '../../../components/navigation/HeaderWithProgress';
import ExitModal from '../../../components/common/ExitModal';

/**
 * Check1_3_1_CloudBackupScreen - Pattern B Implementation
 * 
 * Enhanced cloud backup setup with device-specific recommendations
 * and guided backup configuration flows. Applies Phase 1 lessons:
 * - User-controlled advancement
 * - Contextual actions based on device capabilities
 * - Device-specific content delivery
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
      // Use the new smart deduplication method to prevent device duplicates
      const allDevices = await DeviceCapabilities.getUserDevicesWithCurrentDevice();
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
    const settingsGuide = SettingsGuide.createGuidance('backup', device);
    const recommendedApps = settingsGuide.getRecommendedApps('cloud-backup');

    // Get copywriting content for device actions
    const copywritingContent = CopywritingService.getCheckContent('1-3-1');
    const deviceActionsContent = copywritingContent.deviceActions || {};

    // Get device-specific recommendations
    const userDevices = await DeviceCapabilities.getUserDevices();
    const recommendations = SettingsGuide.getCloudBackupRecommendations(userDevices);

    const actions = [
      {
        id: `${device.id}-choose-backup-solution`,
        title: deviceActionsContent.chooseBackupSolution?.title || 'Choose Your Backup Solution',
        description: deviceActionsContent.chooseBackupSolution?.description || 'Select and configure a reliable backup solution that fits your devices',
        completed: false,
        steps: recommendations.primary.setupSteps || deviceActionsContent.chooseBackupSolution?.steps || [
          'Check if your device has built-in backup (iCloud, Google Drive, OneDrive)',
          'For built-in solutions: Go to Settings → Backup and enable automatic backup',
          'For third-party apps: Choose from Dropbox, OneDrive, or Google Drive',
          'Download your chosen backup app from the official app store',
          'Sign in with your account and enable automatic backup',
          'Verify backup is working by checking recent backup dates'
        ],
        tips: deviceActionsContent.chooseBackupSolution?.tips || [
          'Built-in solutions are often the most reliable and integrated',
          'OneDrive works great across all platforms (Windows, Mac, iOS, Android)',
          'Google Drive offers generous free storage (15GB)',
          'Always enable automatic backup to avoid data loss'
        ],
        deepLink: platform === 'android' ? 'android.settings.SYNC_SETTINGS' : settingsGuide.deepLink.url,
        verification: 'manual',
        priority: 'critical',
        apps: recommendedApps,
        // Add device-specific recommendation data
        recommendation: {
          primary: recommendations.primary,
          alternatives: recommendations.alternatives
        }
      },
      {
        id: `${device.id}-configure-automatic-backup`,
        title: deviceActionsContent.configureAutomaticBackup?.title || 'Set Up Automatic Backup',
        description: deviceActionsContent.configureAutomaticBackup?.description || 'Enable automatic backup to protect your data without thinking about it',
        completed: false,
        steps: deviceActionsContent.configureAutomaticBackup?.steps || [
          'Open your backup app or device settings',
          'Find "Automatic Backup" or "Auto Backup" settings',
          'Turn on automatic backup for photos and videos',
          'Enable backup for important documents and files',
          'Set backup to occur when connected to Wi-Fi',
          'Test backup by taking a photo and checking it appears in backup'
        ],
        tips: deviceActionsContent.configureAutomaticBackup?.tips || [
          'Automatic backup only works when connected to Wi-Fi to save data',
          'Set backup to occur during off-peak hours to avoid slowing down your device',
          'Regularly check backup status to ensure it\'s working properly',
          'Consider upgrading storage if you frequently run out of space'
        ],
        verification: 'manual',
        priority: 'critical'
      },
      {
        id: `${device.id}-verify-backup-integrity`,
        title: deviceActionsContent.verifyBackupIntegrity?.title || 'Verify Backup is Working',
        description: deviceActionsContent.verifyBackupIntegrity?.description || 'Test your backup to ensure your data is safely stored and can be restored',
        completed: false,
        steps: deviceActionsContent.verifyBackupIntegrity?.steps || [
          'Check backup status in your backup app or device settings',
          'Look for "Last Backup" date and ensure it\'s recent (within 24 hours)',
          'Verify that photos, contacts, and important files are being backed up',
          'Test restore by downloading a backed-up photo to a different device',
          'Check available storage space in your backup service',
          'Set up backup notifications to stay informed of backup status'
        ],
        tips: deviceActionsContent.verifyBackupIntegrity?.tips || [
          'Backup should occur automatically at least once per day',
          'If backup hasn\'t occurred recently, check your internet connection',
          'Test restore functionality periodically to ensure it works when needed',
          'Keep backup apps updated for the latest security features'
        ],
        verification: 'manual',
        priority: 'high'
      },
      {
        id: `${device.id}-setup-additional-protection`,
        title: deviceActionsContent.setupAdditionalProtection?.title || 'Add Extra Protection',
        description: deviceActionsContent.setupAdditionalProtection?.description || 'Set up additional backup layers for maximum data protection',
        completed: false,
        steps: deviceActionsContent.setupAdditionalProtection?.steps || [
          'Consider a second backup service for critical files (3-2-1 rule)',
          'Set up local backup on external drive or computer if available',
          'Enable backup for app data and settings',
          'Configure backup for contacts, calendar, and notes',
          'Set up family sharing if using a paid backup service',
          'Review and clean up old backups to manage storage costs'
        ],
        tips: deviceActionsContent.setupAdditionalProtection?.tips || [
          'The 3-2-1 rule: 3 copies, 2 different media types, 1 offsite',
          'Local backup provides fastest restore times',
          'Multiple backup services protect against service outages',
          'Regular cleanup prevents unnecessary storage costs'
        ],
        verification: 'manual',
        priority: 'medium'
      }
    ];

    return actions;
  };

  const renderDeviceSpecificRecommendations = () => {
    try {
      const recommendations = SettingsGuide.getCloudBackupRecommendations(userDevices);
      
      return (
        <View style={styles.recommendationCard}>
          <View style={styles.primaryRecommendation}>
            <View style={styles.recommendationHeader}>
              <Ionicons 
                name={recommendations.primary.type === 'built-in' ? 'cloud-done' : 'cloud-upload'} 
                size={Responsive.iconSizes.medium} 
                color={Colors.accent} 
              />
              <Text style={styles.recommendationTitle}>
                {recommendations.primary.name}
              </Text>
              <View style={[
                styles.recommendationBadge, 
                { backgroundColor: recommendations.primary.type === 'built-in' ? Colors.success : Colors.accent }
              ]}>
                <Text style={styles.recommendationBadgeText}>
                  {recommendations.primary.type === 'built-in' ? 'Built-in' : 
                   recommendations.primary.type === 'free' ? 'Free' : 'Premium'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.recommendationDescription}>
              {recommendations.primary.whyRecommended}
            </Text>
            
            <View style={styles.prosConsContainer}>
              <View style={styles.prosSection}>
                <Text style={styles.prosConsTitle}>✅ Benefits:</Text>
                {recommendations.primary.pros.map((pro, index) => (
                  <Text key={index} style={styles.prosConsItem}>• {pro}</Text>
                ))}
              </View>
              
              {recommendations.primary.cons && recommendations.primary.cons.length > 0 && (
                <View style={styles.consSection}>
                  <Text style={styles.prosConsTitle}>⚠️ Considerations:</Text>
                  {recommendations.primary.cons.map((con, index) => (
                    <Text key={index} style={styles.prosConsItem}>• {con}</Text>
                  ))}
                </View>
              )}
            </View>
          </View>
          
          {recommendations.alternatives && recommendations.alternatives.length > 0 && (
            <View style={styles.alternativesSection}>
              <Text style={styles.alternativesTitle}>Other Options:</Text>
              {recommendations.alternatives.map((alt, index) => (
                <View key={index} style={styles.alternativeItem}>
                  <Text style={styles.alternativeName}>{alt.name}</Text>
                  <Text style={styles.alternativeDescription}>{alt.description}</Text>
                  <Text style={styles.alternativeReason}>{alt.whyConsider}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      );
    } catch (error) {
      console.log('Error rendering recommendations:', error);
      return null;
    }
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

  // Get copywriting content for rendering
  const copywritingContent = CopywritingService.getCheckContent('1-3-1');

  return (
    <View style={styles.rootContainer}>
      {/* ✅ STANDARDIZED: Exit Modal using common component - positioned at root level */}
      <ExitModal
        visible={showExitModal}
        onClose={() => setShowExitModal(false)}
        onKeepLearning={handleKeepLearning}
        onExit={handleExitLesson}
        icon="☁️"
        title="Wait, don't go!"
        message="You're about to protect your precious data and memories with cloud backup. Don't let a device failure erase years of photos and documents!"
      />
      
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Title and Description */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{copywritingContent.title || 'Set Up Cloud Backup'}</Text>
            <Text style={styles.description}>
              {copywritingContent.description || 'Protect your important data, photos, and documents with reliable cloud backup solutions. Never lose your digital life to device failure or theft.'}
            </Text>
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

          {/* Device-Specific Recommendations */}
          {userDevices.length > 0 && (
            <View style={styles.recommendationsSection}>
              <Text style={styles.recommendationsTitle}>🎯 Expert Recommendations for Your Devices</Text>
              <Text style={styles.recommendationsSubtitle}>
                Based on your device ecosystem, here's what backup experts recommend:
              </Text>
              {renderDeviceSpecificRecommendations()}
            </View>
          )}

          {/* Device-Specific Sections */}
          <View style={styles.devicesSection}>
            <Text style={styles.devicesSectionTitle}>Cloud Backup Setup by Device</Text>
            <Text style={styles.devicesSectionSubtitle}>
              Configure cloud backup on each of your devices for complete protection
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
            animationType="confetti"
          />
          {/* References Section */}
          <ReferencesSection references={getReferencesForCheck('1-3-1')} />

        </View>
      </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
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
  recommendationsSection: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.card,
    marginBottom: Responsive.spacing.lg,
  },
  recommendationsTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  recommendationsSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Responsive.spacing.md,
    lineHeight: Typography.sizes.sm * 1.4,
  },
  recommendationCard: {
    backgroundColor: Colors.background,
    borderRadius: Responsive.borderRadius.medium,
    padding: Responsive.padding.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  primaryRecommendation: {
    marginBottom: Responsive.spacing.md,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.spacing.sm,
  },
  recommendationTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginLeft: Responsive.spacing.sm,
    flex: 1,
  },
  recommendationBadge: {
    paddingHorizontal: Responsive.spacing.sm,
    paddingVertical: Responsive.spacing.xs,
    borderRadius: Responsive.borderRadius.small,
  },
  recommendationBadgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  recommendationDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.sm * 1.4,
    marginBottom: Responsive.spacing.md,
  },
  prosConsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  prosSection: {
    flex: 1,
    marginRight: Responsive.spacing.sm,
  },
  consSection: {
    flex: 1,
    marginLeft: Responsive.spacing.sm,
  },
  prosConsTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  prosConsItem: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.xs * 1.3,
    marginBottom: Responsive.spacing.xs,
  },
  alternativesSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Responsive.spacing.md,
  },
  alternativesTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  alternativeItem: {
    marginBottom: Responsive.spacing.sm,
  },
  alternativeName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  alternativeDescription: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: Responsive.spacing.xs,
  },
  alternativeReason: {
    fontSize: Typography.sizes.xs,
    color: Colors.accent,
    fontStyle: 'italic',
    marginTop: Responsive.spacing.xs,
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

export default Check1_3_1_CloudBackupScreen;
