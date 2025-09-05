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
import { CopywritingService } from '../../../utils/copywritingService';

import InteractiveChecklist from '../../../components/validation-steps/InteractiveChecklist';
import CompletionPopup from '../../../components/gamification/CompletionPopup';
import HeaderWithProgress from '../../../components/navigation/HeaderWithProgress';
import ReferencesSection from '../../../components/ui/ReferencesSection';
import { getReferencesForCheck } from '../../../data/references';

const Check1_1_1_StrongPasswordsEnhancedScreen = ({ navigation, route }) => {
  // ✅ PRESERVE: Standard state management
  const [checklistItems, setChecklistItems] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLearnMore, setShowLearnMore] = useState(false);

  // ✅ CRITICAL: Proper error handling for initialization
  const initializeChecklistContent = async () => {
    try {
      setIsLoading(true);
      
      // Get copywriting content for this check
      const copywritingContent = CopywritingService.getCheckContent('1-1-1');
      const checklistContent = copywritingContent.checklist || {};
      
      const enhancedPasswordItems = [
        {
          id: 'create-strong',
          title: checklistContent.createStrong?.title || 'Create Strong Passphrases',
          description: checklistContent.createStrong?.description || 'Build 12+ character passwords using memorable phrases or random words',
          completed: false,
          priority: 'critical',
          category: 'password-creation',
          tips: checklistContent.createStrong?.tips || [
            'Example: "Coffee#Bicycle&Mountain4" is both strong and memorable',
            'Use 4+ random words with symbols between them',
            'Longer beats complex - "my dog loves tennis balls!" is stronger than "P@ssw0rd1"',
            'Avoid common phrases or song lyrics that others might guess'
          ],
          steps: checklistContent.createStrong?.steps || [
            'Choose 3-4 random, unrelated words (like "purple", "keyboard", "sandwich")',
            'Add numbers and symbols between words (like "Purple7Keyboard&Sandwich!")',
            'Test length: count characters to ensure 12+ total',
            'Verify uniqueness: confirm this exact password isn\'t used anywhere else',
            'Practice typing it 3 times to ensure you can remember it'
          ]
        },
        {
          id: 'avoid-weak',
          title: checklistContent.avoidWeak?.title || 'Avoid Weak Password Patterns',
          description: checklistContent.avoidWeak?.description || 'Stay away from easily guessable passwords and personal information',
          completed: false,
          priority: 'high',
          category: 'password-security',
          tips: checklistContent.avoidWeak?.tips || [
            'Never use birthdays, names, addresses, or phone numbers',
            'Avoid common patterns like "123456" or "qwerty"',
            'Don\'t use single words found in dictionaries',
            'Reject passwords with obvious substitutions like "P@ssword"'
          ],
          steps: checklistContent.avoidWeak?.steps || [
            'Check existing passwords for personal information (name, birthday, pet names)',
            'Look for sequential patterns (123456, abcdef, qwerty)',
            'Identify dictionary words or common phrases in current passwords',
            'Replace any weak passwords immediately with strong passphrases',
            'Test new passwords: ask yourself "could someone who knows me guess this?"'
          ]
        },
        {
          id: 'unique-everywhere',
          title: checklistContent.uniqueEverywhere?.title || 'Use Unique Passwords Everywhere',
          description: checklistContent.uniqueEverywhere?.description || 'Every account gets its own password - no exceptions',
          completed: false,
          priority: 'critical',
          category: 'password-security',
          tips: checklistContent.uniqueEverywhere?.tips || [
            'If one account is breached, unique passwords keep others safe',
            'Password managers make unique passwords effortless to manage',
            'Even similar accounts (work email vs personal email) need different passwords',
            'This single habit prevents 81% of security breaches'
          ],
          steps: checklistContent.uniqueEverywhere?.steps || [
            'List your most important accounts (email, banking, social media, work)',
            'Check each account for password reuse by comparing them mentally',
            'Identify any shared passwords and mark accounts for updating',
            'Create new unique passphrases for accounts sharing passwords',
            'Verify uniqueness: write down the first 3 characters of each new password to confirm no duplicates'
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

  // Get copywriting content for rendering
  const copywritingContent = CopywritingService.getCheckContent('1-1-1');

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
            <Text style={styles.title}>{copywritingContent.title || 'Strong Passwords'}</Text>
            <Text style={styles.description}>
              {copywritingContent.description || 'Master the art of creating and managing strong passwords. This checklist will help you build bulletproof password habits that protect all your accounts.'}
            </Text>
          </View>

          {/* Learn More Section */}
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={() => setShowLearnMore(!showLearnMore)}
            activeOpacity={0.8}
          >
            <Text style={styles.learnMoreText}>Why are strong passwords important?</Text>
            <Ionicons
              name={showLearnMore ? 'chevron-up' : 'chevron-down'}
              size={Responsive.iconSizes.medium}
              color={Colors.accent}
            />
          </TouchableOpacity>

          {showLearnMore && (
            <View style={styles.learnMoreContent}>
              <Text style={styles.learnMoreTitle}>Password Security Benefits</Text>
              <Text style={styles.learnMoreBody}>
                Strong passwords are your first line of defense in the digital world. Think of them as the locks on your house - weak locks make it easy for burglars to break in, while strong locks keep your valuables safe. When you use simple passwords like "123456" or "password," you're essentially leaving your digital doors wide open. Hackers use automated tools that can try thousands of password combinations in seconds, and weak passwords are cracked almost instantly. A strong password, on the other hand, is like having a high-security lock that would take years to break. This protects everything from your bank accounts and social media to your work email and personal photos. Plus, strong passwords prevent "credential stuffing" attacks, where hackers use stolen passwords from one site to break into your other accounts. It's a small effort that provides massive protection for your entire digital life.
              </Text>
            </View>
          )}
          
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

          {/* Security Best Practices */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>🔑 Strong Password Best Practices</Text>
            <View style={styles.tipItem}>
              <Ionicons name="resize" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Use 12+ characters - longer passwords are exponentially stronger</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="shuffle" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Mix uppercase, lowercase, numbers, and special characters</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="finger-print" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Make each password unique - never reuse across accounts</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="shield-checkmark" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Use a password manager to generate and store passwords securely</Text>
            </View>
          </View>
          
          {/* References Section */}
          <ReferencesSection references={getReferencesForCheck('1-1-1')} />
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

export default Check1_1_1_StrongPasswordsEnhancedScreen;
