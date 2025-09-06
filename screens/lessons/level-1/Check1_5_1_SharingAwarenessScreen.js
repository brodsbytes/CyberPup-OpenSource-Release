import React, { useState, useEffect } from 'react';
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
          id: 'oversharing-risks',
          title: 'Understand Oversharing Risks',
          description: 'Learn how sharing too much information can put you at risk',
          completed: false,
          priority: 'critical',
          category: 'awareness',
          tips: [
            'Oversharing can lead to identity theft',
            'Personal information can be used for social engineering',
            'Location sharing can reveal your daily routines',
            'Financial information should never be shared publicly'
          ],
          steps: [
            'Research common oversharing risks online',
            'Understand how personal data is used by attackers',
            'Learn about social engineering techniques',
            'Recognize the value of your personal information'
          ]
        },
        {
          id: 'social-media-privacy',
          title: 'Review Social Media Privacy',
          description: 'Audit your social media accounts for privacy settings',
          completed: false,
          priority: 'high',
          category: 'social-media',
          tips: [
            'Set all accounts to private when possible',
            'Review who can see your posts and information',
            'Limit personal information in your profiles',
            'Be careful with location tagging and check-ins'
          ],
          steps: [
            'Go through each social media platform',
            'Check privacy settings and audience controls',
            'Remove or hide personal information from profiles',
            'Review and clean up old posts and photos'
          ]
        },
        {
          id: 'location-sharing',
          title: 'Control Location Sharing',
          description: 'Manage how and when you share your location',
          completed: false,
          priority: 'high',
          category: 'location-privacy',
          tips: [
            'Turn off location services when not needed',
            'Be careful with location tagging in posts',
            'Avoid sharing real-time location updates',
            'Review apps that have location access'
          ],
          steps: [
            'Check device location settings',
            'Review app permissions for location access',
            'Turn off location sharing in social media',
            'Use location services only when necessary'
          ]
        },
        {
          id: 'personal-information-protection',
          title: 'Protect Personal Information',
          description: 'Keep sensitive personal information private',
          completed: false,
          priority: 'critical',
          category: 'personal-data',
          tips: [
            'Never share full birth dates publicly',
            'Avoid posting home addresses or phone numbers',
            'Be careful with family member information',
            'Don\'t share financial information or documents'
          ],
          steps: [
            'Audit your online presence for personal info',
            'Remove or hide sensitive information',
            'Use privacy settings to limit access',
            'Think before posting any personal details'
          ]
        },
        {
          id: 'work-information-security',
          title: 'Secure Work Information',
          description: 'Protect work-related information and avoid oversharing',
          completed: false,
          priority: 'high',
          category: 'work-privacy',
          tips: [
            'Don\'t share work schedules or travel plans',
            'Avoid posting about work projects or clients',
            'Be careful with work-related photos or documents',
            'Use separate accounts for work and personal use'
          ],
          steps: [
            'Review work-related social media posts',
            'Remove or secure work information',
            'Set up separate work and personal accounts',
            'Be mindful of what you share about work'
          ]
        },
        {
          id: 'family-privacy',
          title: 'Protect Family Privacy',
          description: 'Safeguard information about family members',
          completed: false,
          priority: 'high',
          category: 'family-privacy',
          tips: [
            'Get permission before sharing family photos',
            'Be careful with children\'s information',
            'Avoid sharing family schedules or routines',
            'Protect family member contact information'
          ],
          steps: [
            'Ask family members about sharing preferences',
            'Review and secure family-related posts',
            'Use privacy settings for family content',
            'Be selective about what family information to share'
          ]
        },
        {
          id: 'digital-footprint-audit',
          title: 'Audit Your Digital Footprint',
          description: 'Review and clean up your online presence',
          completed: false,
          priority: 'medium',
          category: 'digital-presence',
          tips: [
            'Search for yourself online regularly',
            'Remove or secure old accounts and posts',
            'Check what information is publicly available',
            'Monitor your digital reputation'
          ],
          steps: [
            'Search your name on multiple search engines',
            'Review and clean up old social media accounts',
            'Remove or secure outdated information',
            'Set up alerts for mentions of your name'
          ]
        },
        {
          id: 'sharing-habits',
          title: 'Develop Smart Sharing Habits',
          description: 'Build healthy habits for online sharing',
          completed: false,
          priority: 'medium',
          category: 'habits',
          tips: [
            'Think before you post - consider the consequences',
            'Use the 24-hour rule for emotional posts',
            'Ask yourself who might see this information',
            'Consider the long-term impact of your posts'
          ],
          steps: [
            'Create a personal sharing policy',
            'Practice the 24-hour rule for important posts',
            'Review posts before publishing',
            'Regularly audit your sharing habits'
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
              Develop smart sharing habits to protect your privacy. Learn to share safely without putting yourself, your family, or your work at risk.
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
          
          {/* ✅ CRITICAL: Conditional rendering with fallback */}
          {!isLoading && checklistItems.length > 0 ? (
            <InteractiveChecklist
              checklistItems={checklistItems}
              onActionComplete={handleChecklistItemComplete}
              variant="enhanced"
              checkId="1-5-1"
              navigation={navigation}
            />
          ) : (
            <View style={styles.fallbackContainer}>
              <Text style={styles.fallbackTitle}>Setting Up Privacy Awareness</Text>
              <Text style={styles.fallbackText}>
                We're preparing your personalized sharing awareness checklist.
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
