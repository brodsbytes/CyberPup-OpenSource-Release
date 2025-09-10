import React, { useState, useEffect } from 'react';
import { trackCheckScreenView, trackCheckProgress, trackCheckCompletion } from '../../../utils/checkAnalytics';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
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
import { AppStorage } from '../../../utils/storage';
import CompletionPopup from '../../../components/gamification/CompletionPopup';
import { getCompletionMessage, getNextScreenName } from '../../../utils/completionMessages';
import { CopywritingService } from '../../../utils/copywritingService';
import { getChecklistConfig } from '../../../constants/checklistConfig';
import HeaderWithProgress from '../../../components/navigation/HeaderWithProgress';
import ExitModal from '../../../components/common/ExitModal';

import InteractiveChecklist from '../../../components/validation-steps/InteractiveChecklist';

const Check1_5_1_SharingAwarenessScreen = ({ navigation, route }) => {
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
      
      const sharingAwarenessItems = [
        {
          id: 'check-social-media-privacy',
          title: 'Check Your Social Media Privacy Settings',
          description: 'Review and secure your social media accounts to control who sees your information',
          completed: false,
          priority: 'critical',
          category: 'action',
          tips: [
            'Set your accounts to private when possible',
            'Review who can see your posts and personal information',
            'Remove your home address, phone number, and full birth date from profiles',
            'Be careful with location tagging in posts and photos'
          ],
          steps: [
            'Open each social media app (Facebook, Instagram, Twitter, etc.)',
            'Go to Settings > Privacy or Account Settings',
            'Set your account to "Private" if available',
            'Remove personal information like address, phone, and full birth date from your profile',
            'Check who can see your posts and limit to "Friends Only"'
          ]
        },
        {
          id: 'turn-off-location-sharing',
          title: 'Turn Off Location Sharing',
          description: 'Stop sharing your location in real-time to protect your privacy and safety',
          completed: false,
          priority: 'high',
          category: 'action',
          tips: [
            'Turn off location services when not needed',
            'Avoid sharing your location in social media posts',
            'Don\'t post about being away from home or on vacation',
            'Review which apps have access to your location'
          ],
          steps: [
            'Go to your phone\'s Settings > Privacy > Location Services',
            'Turn off location sharing for social media apps',
            'In each social media app, turn off location tagging for posts',
            'Avoid posting "check-ins" or location updates',
            'Don\'t post about travel plans or being away from home'
          ]
        },
        {
          id: 'remove-personal-info',
          title: 'Remove Personal Information from Posts',
          description: 'Clean up your social media posts to remove sensitive personal information',
          completed: false,
          priority: 'high',
          category: 'action',
          tips: [
            'Remove posts that show your home address or license plates',
            'Delete posts with your phone number or email address',
            'Remove photos that show your workplace or work documents',
            'Be careful about sharing family member information'
          ],
          steps: [
            'Go through your recent social media posts',
            'Delete any posts that show your home address, license plate, or phone number',
            'Remove photos that show your workplace or work-related documents',
            'Ask family members before posting photos or information about them',
            'Think twice before posting anything that reveals your daily routine'
          ]
        }
      ];

      setChecklistItems(sharingAwarenessItems);
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
      const progressKey = `check_1-5-1_progress`;
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
      const progressKey = `check_1-5-1_progress`;
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
    // Track check screen view
    trackCheckScreenView('1-5-1', 'Sharing Awareness', 1, 'privacy');

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
    // Track check completion
    trackCheckCompletion('1-5-1', 'Sharing Awareness', 1, 'privacy');

    console.log('🎉 Celebrating completion of Check 1.5.1');
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
        checkId="1-5-1"
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
                name="eye-off" 
                size={Responsive.iconSizes.xxlarge} 
                color={Colors.accent} 
              />
            </View>
            <Text style={styles.title}>Sharing Awareness</Text>
            <Text style={styles.description}>
              Learn to share safely online and protect your privacy. This guide will show you simple steps to control what information you share and who can see it.
            </Text>
          </View>

          {/* Learn More Section */}
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={() => setShowLearnMore(!showLearnMore)}
            activeOpacity={0.8}
          >
            <Text style={styles.learnMoreText}>Why is sharing awareness important?</Text>
            <Ionicons
              name={showLearnMore ? 'chevron-up' : 'chevron-down'}
              size={Responsive.iconSizes.medium}
              color={Colors.accent}
            />
          </TouchableOpacity>

          {showLearnMore && (
            <View style={styles.learnMoreContent}>
              <Text style={styles.learnMoreTitle}>Privacy Protection Benefits</Text>
              <Text style={styles.learnMoreBody}>
                In our connected world, every piece of information you share online becomes part of your permanent digital footprint. That innocent photo of your new car with the license plate visible, or the check-in at your favorite restaurant, might seem harmless, but it's giving strangers a detailed map of your life. Criminals use this information to build profiles for identity theft, social engineering attacks, or even physical stalking. When you share your location, you're telling the world exactly where you are and aren't - perfect for burglars planning a break-in. Personal details about your family, job, or daily routines can be used to craft convincing phishing emails or phone scams. It's like leaving your diary open in a public place - you never know who might be reading it or how they'll use that information. By being mindful about what you share, you're not just protecting yourself, but also your family and friends who might be mentioned in your posts.
              </Text>
            </View>
          )}
          
          {/* ✅ REFINED: Simple sharing awareness checklist */}
          {!isLoading && checklistItems.length > 0 ? (
            <InteractiveChecklist
              checklistItems={checklistItems}
              onActionComplete={handleChecklistItemComplete}
              variant="enhanced"
              checkId="1-5-1"
              navigation={navigation}
              customHeaderTitle="Let's Learn Smart Sharing"
              {...getChecklistConfig('1-5-1')}
            />
          ) : (
            <View style={styles.fallbackContainer}>
              <Text style={styles.fallbackTitle}>Setting Up Privacy Awareness</Text>
              <Text style={styles.fallbackText}>
                We're preparing your sharing awareness checklist.
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
            <Text style={styles.tipsTitle}>👁️ Sharing Awareness Best Practices</Text>
            <View style={styles.tipItem}>
              <Ionicons name="location-off" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Avoid sharing your location in real-time on social media</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="people" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Be cautious about sharing personal details about family members</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="briefcase" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Never share work-related information or company details</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="calendar" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Avoid posting about travel plans or being away from home</Text>
            </View>
          </View>

          {/* References Section */}
          <ReferencesSection references={getReferencesForCheck('1-5-1')} />

        </View>
      </ScrollView>

      {/* ✅ STANDARDIZED: Exit Modal using common component */}
      <ExitModal
        visible={showExitModal}
        onClose={() => setShowExitModal(false)}
        onKeepLearning={handleKeepLearning}
        onExit={handleExitLesson}
        icon="🤐"
        title="Wait, don't go!"
        message="You're developing smart sharing habits to protect your privacy. Don't let oversharing put you at risk!"
      />
      
      {/* ✅ STANDARD: Completion card */}
          <CompletionPopup
          isVisible={showCompletionPopup}
          title={getCompletionMessage('1-5-1').title}
          description={getCompletionMessage('1-5-1').description}
          nextScreenName={getNextScreenName('1-5-1')}
          navigation={navigation}
          onContinue={() => {
            setIsCompleted(false);
            navigation.navigate(getNextScreenName('1-5-1'));
          }}
          variant="modal"
            onClose={() => setShowCompletionPopup(false)}
            checkId="1-5-1"
            animationType="confetti"
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

export default Check1_5_1_SharingAwarenessScreen;
