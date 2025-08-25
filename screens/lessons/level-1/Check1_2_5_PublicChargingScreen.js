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
import { AppStorage } from '../../../utils/storage';

import InteractiveChecklist from '../../../components/InteractiveChecklist';
import CompletionPopup from '../../../components/CompletionPopup';
import HeaderWithProgress from '../../../components/HeaderWithProgress';
import { getCompletionMessage, getNextScreenName } from '../../../utils/completionMessages';

const Check1_2_5_PublicChargingScreen = ({ navigation, route }) => {
  // ✅ PRESERVE: Standard state management
  const [checklistItems, setChecklistItems] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ CRITICAL: Proper error handling for initialization
  const initializeChecklistContent = async () => {
    try {
      setIsLoading(true);
      
      const publicChargingItems = [
        {
          id: 'juice-jacking-awareness',
          title: 'Understand Juice Jacking',
          description: 'Learn about the risks of public USB charging stations',
          completed: false,
          priority: 'critical',
          category: 'awareness',
          tips: [
            'Juice jacking can steal your data or install malware',
            'Public USB ports can be compromised by hackers',
            'Your device can be infected just by plugging in',
            'This attack is becoming more common in public places'
          ],
          steps: [
            'Research juice jacking attacks online',
            'Understand how data can be stolen via USB',
            'Learn about recent juice jacking incidents',
            'Recognize the signs of compromised charging stations'
          ]
        },
        {
          id: 'bring-own-charger',
          title: 'Bring Your Own Charger',
          description: 'Always carry your own USB cable and wall adapter',
          completed: false,
          priority: 'high',
          category: 'prevention',
          tips: [
            'Use your own USB cable, not public ones',
            'Carry a portable power bank for emergencies',
            'Use wall outlets instead of USB ports when possible',
            'Keep a spare charger in your bag or car'
          ],
          steps: [
            'Purchase a reliable USB cable',
            'Buy a portable power bank',
            'Pack your charger in your daily bag',
            'Test your charger before leaving home'
          ]
        },
        {
          id: 'use-wall-outlets',
          title: 'Prefer Wall Outlets',
          description: 'Use AC power outlets instead of USB ports when available',
          completed: false,
          priority: 'high',
          category: 'prevention',
          tips: [
            'Wall outlets are much safer than USB ports',
            'AC power cannot transmit data or malware',
            'Look for standard electrical outlets in public spaces',
            'Airports and cafes often have wall outlets available'
          ],
          steps: [
            'Locate wall outlets in public spaces',
            'Use your own AC adapter',
            'Avoid USB charging stations entirely',
            'Plan charging stops at locations with wall outlets'
          ]
        },
        {
          id: 'data-transfer-disabled',
          title: 'Disable Data Transfer',
          description: 'Configure your device to only charge, not transfer data',
          completed: false,
          priority: 'medium',
          category: 'device-settings',
          tips: [
            'Set your device to "Charge Only" mode',
            'Disable USB debugging on Android devices',
            'Use "Trust This Computer" sparingly',
            'Keep your device locked when charging'
          ],
          steps: [
            'Check your device\'s USB connection settings',
            'Set default USB behavior to "Charge Only"',
            'Disable USB debugging in developer options',
            'Test the setting with a trusted computer'
          ]
        },
        {
          id: 'recognize-suspicious-stations',
          title: 'Spot Suspicious Stations',
          description: 'Learn to identify potentially compromised charging stations',
          completed: false,
          priority: 'medium',
          category: 'awareness',
          tips: [
            'Look for signs of tampering or modification',
            'Avoid stations with unusual branding or placement',
            'Be suspicious of free charging offers',
            'Check for security cameras or monitoring devices'
          ],
          steps: [
            'Learn what normal charging stations look like',
            'Inspect USB ports for physical tampering',
            'Avoid stations in isolated or unusual locations',
            'Trust your instincts - if it seems suspicious, avoid it'
          ]
        },
        {
          id: 'emergency-charging-plan',
          title: 'Emergency Charging Plan',
          description: 'Have a backup plan for when you need to charge urgently',
          completed: false,
          priority: 'medium',
          category: 'preparation',
          tips: [
            'Carry a portable power bank at all times',
            'Know safe charging locations in your area',
            'Have a trusted friend or family member\'s charger',
            'Consider wireless charging as a safer alternative'
          ],
          steps: [
            'Purchase a high-capacity power bank',
            'Map out safe charging locations',
            'Establish emergency charging contacts',
            'Practice your emergency charging routine'
          ]
        },
        {
          id: 'device-security-updates',
          title: 'Keep Device Updated',
          description: 'Ensure your device has the latest security patches',
          completed: false,
          priority: 'high',
          category: 'device-security',
          tips: [
            'Regular updates patch security vulnerabilities',
            'Enable automatic updates when possible',
            'Check for updates before traveling',
            'Keep apps updated as well'
          ],
          steps: [
            'Check for system updates on your device',
            'Enable automatic security updates',
            'Update all apps to latest versions',
            'Set up update notifications'
          ]
        },
        {
          id: 'monitor-device-activity',
          title: 'Monitor Device Activity',
          description: 'Watch for unusual activity after using public charging',
          completed: false,
          priority: 'medium',
          category: 'monitoring',
          tips: [
            'Check for unknown apps or files',
            'Monitor battery usage and performance',
            'Watch for unusual network activity',
            'Check device settings for unauthorized changes'
          ],
          steps: [
            'Review recently installed apps',
            'Check device storage for unknown files',
            'Monitor battery and performance metrics',
            'Run a security scan if suspicious'
          ]
        }
      ];

      setChecklistItems(publicChargingItems);
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing checklist content:', error);
      setIsLoading(false);
      // Continue with empty state
    }
  };

  // ✅ CRITICAL: Proper AsyncStorage usage
  const loadProgress = async () => {
    try {
      const progressKey = `check_1-2-5_progress`;
      const progressData = await AsyncStorage.getItem(progressKey);
      
      if (progressData) {
        const progress = JSON.parse(progressData);
        setChecklistItems(progress.checklistItems || []);
        setIsCompleted(progress.isCompleted || false);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      // Continue with empty state
    }
  };

  const saveProgress = async () => {
    try {
      const progressKey = `check_1-2-5_progress`;
      const progressData = {
        checklistItems,
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
      initializeChecklistContent();
      // Reset completion state when screen comes into focus
      // This ensures the completion popup doesn't stay visible after navigation
      setIsCompleted(false);
      setShowCompletionPopup(false);
    }, [])
  );

  // ✅ CRITICAL: Save progress when checklist items change
  useEffect(() => {
    if (checklistItems.length > 0) {
      saveProgress();
      
      // Check if all items are completed
      const allCompleted = checklistItems.every(item => item.completed);
      if (allCompleted && !isCompleted) {
        setIsCompleted(true);
        setShowCompletionPopup(true);
        celebrateCompletion();
      }
    }
  }, [checklistItems]);

  // ✅ CRITICAL: Handle checklist item completion
  const handleChecklistItemComplete = async (itemId, completed) => {
    setChecklistItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, completed } : item
      )
    );
  };

  // ✅ STANDARD: Dynamic exit handler
  const handleExit = () => {
    setShowExitModal(true);
  };

  const handleKeepLearning = () => {
    setShowExitModal(false);
  };

  const handleExitLesson = () => {
    setShowExitModal(false);
    navigation.navigate(SCREEN_NAMES.WELCOME);
  };

  // ✅ STANDARD: Completion celebration
  const celebrateCompletion = () => {
    // The completion popup will be shown automatically when isCompleted is true
    // No need to call it as a function
  };

  // Calculate progress for the header
  const getProgress = () => {
    if (checklistItems.length === 0) return 0;
    const completedItems = checklistItems.filter(item => item.completed).length;
    return (completedItems / checklistItems.length) * 100;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* ✅ UPDATED: Header with progress bar */}
      <HeaderWithProgress
        checkId="1-2-5"
        onExit={handleExit}
        isCompleted={isCompleted}
        progress={getProgress()}
        navigation={navigation}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Title and Description */}
          <View style={styles.titleSection}>
            <View style={styles.titleIconContainer}>
              <Ionicons 
                name="battery-charging" 
                size={Responsive.iconSizes.xxlarge} 
                color={Colors.accent} 
              />
            </View>
            <Text style={styles.title}>Public Charging Safety</Text>
            <Text style={styles.description}>
              Learn to protect yourself from juice jacking attacks when charging in public places. This guide will teach you safe charging practices to keep your data secure.
            </Text>
          </View>
          
          {/* ✅ CRITICAL: Conditional rendering with fallback */}
          {!isLoading && checklistItems.length > 0 ? (
            <InteractiveChecklist
              checklistItems={checklistItems}
              onActionComplete={handleChecklistItemComplete}
              variant="enhanced"
              checkId="1-2-5"
              navigation={navigation}
            />
          ) : (
            <View style={styles.fallbackContainer}>
              <Text style={styles.fallbackTitle}>Setting Up Charging Security</Text>
              <Text style={styles.fallbackText}>
                We're preparing your personalized public charging safety checklist.
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={initializeChecklistContent}
              >
                <Text style={styles.retryButtonText}>Retry Setup</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ✅ STANDARD: Dynamic exit modal */}
      <Modal visible={showExitModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowExitModal(false)}
            >
              <Ionicons name="close" size={Responsive.iconSizes.large} color={Colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.modalCharacter}>
              <Text style={styles.characterText}>🔌</Text>
            </View>

            <Text style={styles.modalTitle}>Wait, don't go!</Text>
            <Text style={styles.modalMessage}>
              You're learning to protect yourself from juice jacking attacks. This knowledge will keep you safe when charging in public!
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
      
      {/* ✅ STANDARD: Completion card */}
          <CompletionPopup
          isVisible={showCompletionPopup}
          title={getCompletionMessage('1-2-5').title}
          description={getCompletionMessage('1-2-5').description}
          nextScreenName={getNextScreenName('1-2-5')}
          navigation={navigation}
          onContinue={() => {
            setIsCompleted(false);
            navigation.navigate(getNextScreenName('1-2-5'));
          }}
          variant="modal"
            onClose={() => setShowCompletionPopup(false)}
            checkId="1-2-5"
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
    alignItems: 'center',
  },
  titleIconContainer: {
    marginBottom: Responsive.spacing.md,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
    lineHeight: Typography.sizes.xxl * 1.3,
    textAlign: 'center',
  },
  description: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * 1.5,
    marginBottom: Responsive.spacing.lg,
    textAlign: 'center',
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Responsive.spacing.xl,
  },
  fallbackTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
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
    minHeight: Responsive.buttonHeight.medium,
  },
  retryButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
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
    margin: Responsive.spacing.lg,
    width: '90%',
    maxWidth: 400,
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: Responsive.spacing.md,
    right: Responsive.spacing.md,
    zIndex: 1,
  },
  modalCharacter: {
    alignItems: 'center',
    marginBottom: Responsive.spacing.md,
  },
  characterText: {
    fontSize: Typography.sizes.xxl,
  },
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Responsive.spacing.sm,
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
    gap: Responsive.spacing.sm,
  },
  keepLearningButton: {
    flex: 1,
    backgroundColor: Colors.accent,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.md,
    borderRadius: Responsive.borderRadius.medium,
    alignItems: 'center',
    minHeight: Responsive.buttonHeight.medium,
  },
  keepLearningButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  exitLessonButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.md,
    borderRadius: Responsive.borderRadius.medium,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: Responsive.buttonHeight.medium,
  },
  exitLessonButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
  },
  completionCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Responsive.padding.screen,
  },
  completionContent: {
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: Responsive.spacing.sm,
    marginBottom: Responsive.spacing.sm,
    textAlign: 'center',
  },
  completionDescription: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.5,
    marginBottom: Responsive.spacing.lg,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    borderRadius: Responsive.borderRadius.medium,
    minHeight: Responsive.buttonHeight.medium,
  },
  continueButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginRight: Responsive.spacing.sm,
  },
});

export default Check1_2_5_PublicChargingScreen;
