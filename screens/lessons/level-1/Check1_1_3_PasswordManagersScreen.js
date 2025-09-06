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
      // Use the new smart deduplication method to prevent device duplicates
      const allDevices = await DeviceCapabilities.getUserDevicesWithCurrentDevice();
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
    const settingsGuide = SettingsGuide.createGuidance('passwords', device);
    const recommendedApps = settingsGuide.getRecommendedApps('password-manager');

    // Get copywriting content for device actions
    const copywritingContent = CopywritingService.getCheckContent('1-1-3');
    const deviceActionsContent = copywritingContent.deviceActions || {};

    // Get device-specific recommendations
    const userDevices = await DeviceCapabilities.getUserDevices();
    const recommendations = SettingsGuide.getPasswordManagerRecommendations(userDevices);

    const actions = [
      {
        id: `${device.id}-choose-manager`,
        title: deviceActionsContent.chooseManager?.title || 'Choose Your Password Manager',
        description: deviceActionsContent.chooseManager?.description || 'Select and install a trusted password manager that fits your devices',
        completed: false,
        steps: recommendations.primary.setupSteps || deviceActionsContent.chooseManager?.steps || [
          'Check if your device has a built-in password manager (iCloud Keychain, Google Password Manager)',
          'For built-in managers: Go to Settings → Passwords → turn on AutoFill',
          'For third-party apps: Choose from Bitwarden (free), 1Password, or Dashlane',
          'Download your chosen app from the official app store (Apple App Store or Google Play)',
          'Open the app and create an account using your secure email address',
          'Verify your email address through the confirmation link'
        ],
        tips: deviceActionsContent.chooseManager?.tips || [
          'Built-in managers are secure and convenient for single-platform users',
          'Bitwarden is open-source and offers excellent free features',
          'Premium managers offer advanced features like security monitoring',
          'Never download password managers from unknown websites'
        ],
        deepLink: platform === 'android' ? 'android-password-manager' : settingsGuide.deepLink.url,
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
        id: `${device.id}-create-master-password`,
        title: deviceActionsContent.createMasterPassword?.title || 'Create an Unbreakable Master Password',
        description: deviceActionsContent.createMasterPassword?.description || 'Set up the one password that protects all your others',
        completed: false,
        steps: deviceActionsContent.createMasterPassword?.steps || [
          'Create a passphrase using 4-6 random words (like "Coffee Mountain Bicycle Purple 47")',
          'Make it at least 16 characters long with numbers and symbols',
          'Practice typing it 5 times to ensure you can remember it',
          'Write it down on paper and store it securely (delete digital copies)',
          'Set up account recovery options (backup email, security questions)',
          'Test your master password by logging out and back in'
        ],
        tips: deviceActionsContent.createMasterPassword?.tips || [
          'This is the ONLY password you\'ll need to remember - make it count',
          'Use a method: song lyrics, book quotes, or random word combinations',
          'Never use personal information (names, birthdays, addresses)',
          'Consider a physical backup stored in a safe place'
        ],
        verification: 'manual',
        priority: 'critical'
      },
      {
        id: `${device.id}-import-passwords`,
        title: deviceActionsContent.importPasswords?.title || 'Import and Generate New Passwords',
        description: deviceActionsContent.importPasswords?.description || 'Move your existing passwords and create new strong ones',
        completed: false,
        steps: deviceActionsContent.importPasswords?.steps || [
          'Import existing passwords: look for "Import" or "Add passwords" in settings',
          'Upload from browser (Chrome: Settings → Passwords → Export)',
          'Add your most important accounts manually if import doesn\'t work',
          'Generate new strong passwords for each account (use the "Generate" button)',
          'Update weak passwords: let the app identify and replace weak ones',
          'Verify all critical accounts are saved and working'
        ],
        tips: deviceActionsContent.importPasswords?.tips || [
          'Start with your most important accounts (email, banking, work)',
          'Use the password generator for maximum strength',
          'Update passwords one at a time to avoid lockouts',
          'Test each new password immediately after saving'
        ],
        verification: 'manual',
        priority: 'high'
      },
      {
        id: `${device.id}-enable-biometrics`,
        title: deviceActionsContent.enableBiometrics?.title || 'Set Up Quick and Secure Access',
        description: deviceActionsContent.enableBiometrics?.description || 'Enable biometric unlock and auto-fill for seamless security',
        completed: false,
        steps: deviceActionsContent.enableBiometrics?.steps || [
          'Enable biometric unlock: go to app Settings → Security → Enable Face ID/Touch ID/Fingerprint',
          'Test biometric unlock by closing and reopening the app',
          'Turn on auto-fill: Settings → AutoFill → Enable for this app',
          'Test auto-fill by visiting a website and logging in',
          'Enable sync across devices if you use multiple devices',
          'Set up the mobile app if you started on desktop (or vice versa)'
        ],
        tips: deviceActionsContent.enableBiometrics?.tips || [
          'Biometrics are convenient and secure for quick access',
          'Auto-fill makes using strong passwords effortless',
          'Sync keeps your passwords updated across all devices',
          'Keep the app updated for the latest security features'
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
    console.log('🎉 Celebrating completion of Check 1.1.3');
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

  const renderDeviceSpecificRecommendations = () => {
    try {
      const recommendations = SettingsGuide.getPasswordManagerRecommendations(userDevices);
      
      return (
        <View style={styles.recommendationCard}>
          <View style={styles.primaryRecommendation}>
            <View style={styles.recommendationHeader}>
              <Ionicons 
                name={recommendations.primary.type === 'built-in' ? 'shield-checkmark' : 'star'} 
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

  // Get copywriting content for rendering
  const copywritingContent = CopywritingService.getCheckContent('1-1-3');

  return (
    <View style={styles.rootContainer}>
      {/* ✅ STANDARDIZED: Exit Modal using common component - positioned at root level */}
      <ExitModal
        visible={showExitModal}
        onClose={() => setShowExitModal(false)}
        onKeepLearning={handleKeepLearning}
        onExit={handleExitLesson}
        icon="😢"
        title="Wait, don't go!"
        message="You're making great progress on securing your passwords. Don't lose momentum now!"
      />
      
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Title and Description */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{copywritingContent.title || 'Set Up Password Managers'}</Text>
            <Text style={styles.description}>
              {copywritingContent.description || 'Configure secure password managers on all your devices. This creates strong, unique passwords and makes login easier and safer.'}
            </Text>
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
                Password managers automatically generate strong, unique passwords for every account and store them securely in one encrypted vault. They seamlessly auto-fill your passwords on websites and apps, sync across all your devices, and protect you from password reuse attacks. Many also monitor for compromised passwords and alert you when it's time to change them.
              </Text>
            </View>
          )}

          {/* Device-Specific Recommendations */}
          {userDevices.length > 0 && (
            <View style={styles.recommendationsSection}>
              <Text style={styles.recommendationsTitle}>🎯 Expert Recommendations for Your Devices</Text>
              <Text style={styles.recommendationsSubtitle}>
                Based on your device ecosystem, here's what security experts recommend:
              </Text>
              {renderDeviceSpecificRecommendations()}
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

export default Check1_3_PasswordManagersScreen;