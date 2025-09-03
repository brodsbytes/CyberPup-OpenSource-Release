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
import { SCREEN_NAMES } from '../../../constants';
import { AppStorage } from '../../../utils/storage';
import CompletionPopup from '../../../components/gamification/CompletionPopup';
import { getCompletionMessage, getNextScreenName, getCompletionNavigation } from '../../../utils/completionMessages';

import InteractiveChecklist from '../../../components/validation-steps/InteractiveChecklist';
import HeaderWithProgress from '../../../components/navigation/HeaderWithProgress';

const Check1_4_2_ScamReportingScreen = ({ navigation, route }) => {
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
      
      const scamReportingItems = [
        {
          id: 'recognize-scam-types',
          title: 'Recognize Common Scam Types',
          description: 'Learn to identify different types of scams and fraud',
          completed: false,
          priority: 'critical',
          category: 'awareness',
          tips: [
            'Phishing emails try to steal login credentials',
            'Tech support scams claim your device is infected',
            'Romance scams build fake relationships for money',
            'Investment scams promise unrealistic returns'
          ],
          steps: [
            'Research common scam types online',
            'Learn the red flags for each scam type',
            'Understand how scammers operate',
            'Recognize urgency and pressure tactics'
          ]
        },
        {
          id: 'document-evidence',
          title: 'Document Scam Evidence',
          description: 'Collect and preserve evidence when you encounter a scam',
          completed: false,
          priority: 'high',
          category: 'evidence',
          tips: [
            'Take screenshots of suspicious messages',
            'Save email headers and phone numbers',
            'Record dates and times of contact',
            'Keep copies of any documents or links'
          ],
          steps: [
            'Take screenshots of all suspicious communications',
            'Save email headers and sender information',
            'Record phone numbers and call times',
            'Document any money or information shared'
          ]
        },
        {
          id: 'report-to-authorities',
          title: 'Report to Authorities',
          description: 'Report scams to appropriate government agencies',
          completed: false,
          priority: 'critical',
          category: 'reporting',
          tips: [
            'Report to FTC at ReportFraud.ftc.gov',
            'Contact your state attorney general',
            'Report to FBI Internet Crime Complaint Center',
            'Contact local law enforcement if money was lost'
          ],
          steps: [
            'Visit ReportFraud.ftc.gov to file a complaint',
            'Contact your state attorney general\'s office',
            'File a report with IC3 if it involves the internet',
            'Contact local police if you lost money'
          ]
        },
        {
          id: 'report-to-platforms',
          title: 'Report to Platforms',
          description: 'Report scams to the platforms where they occurred',
          completed: false,
          priority: 'high',
          category: 'reporting',
          tips: [
            'Report phishing emails to your email provider',
            'Report social media scams to the platform',
            'Report fake websites to hosting providers',
            'Report phone scams to your carrier'
          ],
          steps: [
            'Report phishing emails to your email provider',
            'Use platform reporting tools for social media scams',
            'Report fake websites to hosting companies',
            'Contact your phone carrier about scam calls'
          ]
        },
        {
          id: 'protect-accounts',
          title: 'Protect Your Accounts',
          description: 'Secure your accounts after encountering a scam',
          completed: false,
          priority: 'critical',
          category: 'protection',
          tips: [
            'Change passwords for any compromised accounts',
            'Enable two-factor authentication',
            'Monitor accounts for suspicious activity',
            'Contact banks if financial information was shared'
          ],
          steps: [
            'Change passwords for any affected accounts',
            'Enable 2FA on all important accounts',
            'Monitor bank and credit card statements',
            'Contact financial institutions if needed'
          ]
        },
        {
          id: 'warn-others',
          title: 'Warn Others',
          description: 'Help protect others by sharing scam information',
          completed: false,
          priority: 'medium',
          category: 'community',
          tips: [
            'Share scam details with family and friends',
            'Post warnings on social media (without personal details)',
            'Report to community groups and forums',
            'Help educate others about scam prevention'
          ],
          steps: [
            'Warn family and friends about the scam',
            'Share general scam information on social media',
            'Report to local community groups',
            'Help others learn to recognize similar scams'
          ]
        },
        {
          id: 'learn-prevention',
          title: 'Learn Prevention Strategies',
          description: 'Educate yourself on preventing future scams',
          completed: false,
          priority: 'high',
          category: 'education',
          tips: [
            'Never share personal information with strangers',
            'Be skeptical of urgent requests for money',
            'Verify information through official sources',
            'Trust your instincts - if it seems too good to be true, it probably is'
          ],
          steps: [
            'Research scam prevention strategies',
            'Learn to verify information independently',
            'Practice healthy skepticism online',
            'Stay updated on new scam tactics'
          ]
        },
        {
          id: 'support-victims',
          title: 'Support Scam Victims',
          description: 'Learn how to help others who have been scammed',
          completed: false,
          priority: 'medium',
          category: 'support',
          tips: [
            'Be supportive and non-judgmental',
            'Help them report the scam',
            'Assist with account security measures',
            'Encourage them to seek professional help if needed'
          ],
          steps: [
            'Learn how to support scam victims emotionally',
            'Help them document and report the scam',
            'Assist with securing their accounts',
            'Know when to recommend professional help'
          ]
        }
      ];

      setChecklistItems(scamReportingItems);
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
      const progressKey = `check_1-4-2_progress`;
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
      const progressKey = `check_1-4-2_progress`;
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
    console.log('🎉 Celebrating completion of Check 1.4.2');
    // Always show CompletionPopup first, let user click "Continue" to go to AreaCompletionScreen
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
        checkId="1-4-2"
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
                name="shield-checkmark" 
                size={Responsive.iconSizes.xxlarge} 
                color={Colors.accent} 
              />
            </View>
            <Text style={styles.title}>Scam Reporting</Text>
            <Text style={styles.description}>
              Learn how to report scams and fraud to protect yourself and others. This guide will teach you the proper channels and procedures for reporting cybercrime.
            </Text>
          </View>
          
          {/* ✅ CRITICAL: Conditional rendering with fallback */}
          {!isLoading && checklistItems.length > 0 ? (
            <InteractiveChecklist
              checklistItems={checklistItems}
              onActionComplete={handleChecklistItemComplete}
              variant="checklist"
              checkId="1-4-2"
              navigation={navigation}
            />
          ) : (
            <View style={styles.fallbackContainer}>
              <Text style={styles.fallbackTitle}>Setting Up Scam Reporting</Text>
              <Text style={styles.fallbackText}>
                We're preparing your personalized scam reporting checklist.
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
              <Text style={styles.characterText}>🚨</Text>
            </View>

            <Text style={styles.modalTitle}>Wait, don't go!</Text>
            <Text style={styles.modalMessage}>
              You're learning how to report scams and protect others from fraud. Your knowledge could save someone from financial loss!
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
          title={getCompletionMessage('1-4-2').title}
          description={getCompletionMessage('1-4-2').description}
          nextScreenName={getNextScreenName('1-4-2')}
          navigation={navigation}
          onContinue={() => {
            setIsCompleted(false);
            navigation.navigate(getNextScreenName('1-4-2'));
          }}
          variant="modal"
            onClose={() => setShowCompletionPopup(false)}
            checkId="1-4-2"
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

export default Check1_4_2_ScamReportingScreen;
