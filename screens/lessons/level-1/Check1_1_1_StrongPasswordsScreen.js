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
import { getCompletionMessage, getNextScreenName, getCompletionNavigation } from '../../../utils/completionMessages';

import InteractiveChecklist from '../../../components/validation-steps/InteractiveChecklist';
import CompletionPopup from '../../../components/gamification/CompletionPopup';
import HeaderWithProgress from '../../../components/navigation/HeaderWithProgress';

const Check1_1_1_StrongPasswordsEnhancedScreen = ({ navigation, route }) => {
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
      
      const enhancedPasswordItems = [
        {
          id: 'password-length',
          title: 'Use 12+ Characters',
          description: 'Create passwords with at least 12 characters for better security',
          completed: false,
          priority: 'high',
          category: 'password-strength',
          tips: [
            'Longer passwords are exponentially harder to crack',
            'Aim for 12-16 characters minimum',
            'Consider using passphrases for easier memorization'
          ],
          steps: [
            'Count your current password length',
            'Add more characters if under 12',
            'Consider using a memorable phrase'
          ]
        },
        {
          id: 'password-complexity',
          title: 'Include Mixed Characters',
          description: 'Use uppercase, lowercase, numbers, and special characters',
          completed: false,
          priority: 'high',
          category: 'password-strength',
          tips: [
            'Mix uppercase and lowercase letters',
            'Include numbers (0-9)',
            'Add special characters (!@#$%^&*)',
            'Avoid predictable patterns'
          ],
          steps: [
            'Check if your password has uppercase letters',
            'Check if your password has lowercase letters', 
            'Check if your password has numbers',
            'Check if your password has special characters'
          ]
        },
        {
          id: 'password-uniqueness',
          title: 'Unique for Each Account',
          description: 'Never reuse passwords across different accounts',
          completed: false,
          priority: 'critical',
          category: 'password-security',
          tips: [
            'Each account should have a completely different password',
            'If one account is compromised, others remain safe',
            'Consider using a password manager to generate unique passwords'
          ],
          steps: [
            'List all your important accounts',
            'Verify each has a unique password',
            'Change any reused passwords immediately'
          ]
        },
        {
          id: 'password-avoidance',
          title: 'Avoid Common Patterns',
          description: 'Don\'t use personal information or common patterns',
          completed: false,
          priority: 'medium',
          category: 'password-security',
          tips: [
            'Avoid birthdays, names, or addresses',
            'Don\'t use sequential numbers (123456)',
            'Avoid keyboard patterns (qwerty)',
            'Don\'t use common words or phrases'
          ],
          steps: [
            'Check if your password contains personal info',
            'Avoid common sequences and patterns',
            'Use random or pseudo-random combinations'
          ]
        },
        {
          id: 'password-storage',
          title: 'Secure Password Storage',
          description: 'Store passwords securely, not in plain text files',
          completed: false,
          priority: 'high',
          category: 'password-management',
          tips: [
            'Use a reputable password manager',
            'Never store passwords in text files or notes',
            'Avoid writing passwords on paper',
            'Enable two-factor authentication where possible'
          ],
          steps: [
            'Choose a password manager (Bitwarden, 1Password, etc.)',
            'Import your existing passwords',
            'Generate new strong passwords for each account',
            'Enable 2FA on your password manager'
          ]
        },
        {
          id: 'password-rotation',
          title: 'Regular Password Updates',
          description: 'Update passwords regularly, especially for critical accounts',
          completed: false,
          priority: 'medium',
          category: 'password-management',
          tips: [
            'Update banking and email passwords every 3-6 months',
            'Change passwords immediately after security incidents',
            'Use password managers to track when passwords were last changed',
            'Consider using passphrases for easier updates'
          ],
          steps: [
            'Identify your most critical accounts (banking, email)',
            'Set reminders for password updates',
            'Update passwords for accounts over 6 months old',
            'Enable security notifications where available'
          ]
        }
      ];

      setChecklistItems(enhancedPasswordItems);
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
      const progressKey = `check_1-1-1-enhanced_progress`;
      const progressData = await AsyncStorage.getItem(progressKey);
      
      if (progressData) {
        const progress = JSON.parse(progressData);
        setChecklistItems(progress.checklistItems || []);
        setIsCompleted(progress.isCompleted || false);
        // Don't automatically show completion popup when loading progress
        // Only show it when the user actually completes the check
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      // Continue with empty state
    }
  };

  const saveProgress = async () => {
    try {
      const progressKey = `check_1-1-1-enhanced_progress`;
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
    console.log('🎉 Check 1.1.1 Enhanced completed!');
    setShowCompletionPopup(true);
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
        checkId="1-1-1"
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
                name="key" 
                size={Responsive.iconSizes.xxlarge} 
                color={Colors.accent} 
              />
            </View>
            <Text style={styles.title}>Strong Passwords</Text>
            <Text style={styles.description}>
              Master the art of creating and managing strong passwords. This checklist will help you build bulletproof password habits that protect all your accounts.
            </Text>
          </View>
          
          {/* ✅ CRITICAL: Conditional rendering with fallback */}
          {!isLoading && checklistItems.length > 0 ? (
            <InteractiveChecklist
              checklistItems={checklistItems}
              onActionComplete={handleChecklistItemComplete}
              variant="enhanced"
              checkId="1-1-1-enhanced"
              navigation={navigation}
            />
          ) : (
            <View style={styles.fallbackContainer}>
              <Text style={styles.fallbackTitle}>Setting Up Password Security</Text>
              <Text style={styles.fallbackText}>
                We're preparing your personalized password security checklist.
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
              <Text style={styles.characterText}>🔑</Text>
            </View>

            <Text style={styles.modalTitle}>Wait, don't go!</Text>
            <Text style={styles.modalMessage}>
              You're mastering password security with advanced techniques. Strong passwords are your first line of defense against hackers!
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
      
      {/* Completion Status */}
      <CompletionPopup
        isVisible={showCompletionPopup}
        title={getCompletionMessage('1-1-1').title}
        description={getCompletionMessage('1-1-1').description}
        nextScreenName={getNextScreenName('1-1-1')}
        navigation={navigation}
        onClose={() => setShowCompletionPopup(false)}
        variant="modal"
        checkId="1-1-1"
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
});

export default Check1_1_1_StrongPasswordsEnhancedScreen;
