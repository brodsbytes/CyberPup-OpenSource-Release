import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Responsive, CommonStyles } from '../../../theme';
import InteractiveValidationFlow from '../../../components/InteractiveValidationFlow';
import ScamRecognitionStep from '../../../components/validation-steps/ScamRecognitionStep';
import CompletionPopup from '../../../components/CompletionPopup';
import { getCompletionMessage, getNextScreenName } from '../../../utils/completionMessages';

const Check1_4_1_ScamRecognitionScreen = ({ navigation, route }) => {
  const [checklistItems, setChecklistItems] = useState([
    {
      id: 1,
      text: 'Completed interactive scam recognition training',
      completed: false,
      action: null,
    },
    {
      id: 2,
      text: 'Can identify common phishing tactics',
      completed: false,
      action: null,
    },
  ]);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  
  // Pattern C - Interactive flow state
  const [useInteractiveFlow, setUseInteractiveFlow] = useState(true);
  const [flowCompleted, setFlowCompleted] = useState(false);
  const [flowScore, setFlowScore] = useState(0);

  useEffect(() => {
    loadProgress();
  }, []);

  // Add focus listener to refresh progress when returning to this screen
  useFocusEffect(
    React.useCallback(() => {
      loadProgress();
    }, [])
  );

  const loadProgress = async () => {
    try {
      const progressData = await AsyncStorage.getItem('check_1-4-1_progress');
      const completedData = await AsyncStorage.getItem('check_1-4-1_completed');
      console.log('📥 Loading progress for Check 1.4.1:', { progressData: !!progressData, completedData });
      
      if (progressData) {
        const data = JSON.parse(progressData);
        setChecklistItems(data.checklistItems || checklistItems);
        setIsCompleted(data.isCompleted || false);
        setFlowCompleted(data.flowCompleted || false);
        setFlowScore(data.flowScore || 0);
        console.log('📊 Loaded progress data:', { isCompleted: data.isCompleted, flowCompleted: data.flowCompleted });
      }
      
      // Also check the completion status directly
      if (completedData === 'completed') {
        console.log('✅ Check 1.4.1 is marked as completed in storage');
        setIsCompleted(true);
        setShowCompletionPopup(true);
        setFlowCompleted(true);
      }
      
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  };

  const saveProgress = async (customChecklistItems = null, customIsCompleted = null) => {
    try {
      const itemsToSave = customChecklistItems || checklistItems;
      const completionStatus = customIsCompleted !== null ? customIsCompleted : isCompleted;
      
      const progressData = {
        checklistItems: itemsToSave,
        isCompleted: completionStatus,
        flowCompleted,
        flowScore,
        completedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('check_1-4-1_progress', JSON.stringify(progressData));
      
      if (completionStatus) {
        await AsyncStorage.setItem('check_1-4-1_completed', 'completed');
        console.log('✅ Check 1.4.1 marked as completed');
      } else {
        await AsyncStorage.removeItem('check_1-4-1_completed');
        console.log('❌ Check 1.4.1 completion removed');
      }
    } catch (error) {
      console.log('Error saving progress:', error);
    }
  };

  const celebrateCompletion = async () => {
    console.log('🎉 Celebrating completion of Check 1.4.1');
    // Ensure completion is saved before showing alert
    await saveProgress(checklistItems, true);
    
    Alert.alert(
      '🎉 Check Complete!',
      `Excellent work! You scored ${flowScore}% on scam recognition. You're now better equipped to identify and avoid phishing attempts.`,
      [
        {
          text: 'Continue to Next Check',
          onPress: async () => {
            console.log('🚀 Navigating to next check');
            // Navigate to the next check in sequence
            navigation.navigate('Check1_5_BreachCheckScreen');
          },
        },
        {
          text: 'Go Back',
          style: 'cancel',
          onPress: async () => {
            console.log('🏠 Navigating back to Welcome');
            navigation.navigate('Welcome');
          },
        },
      ]
    );
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

  // Pattern C - Interactive Flow Configuration
  const interactiveFlowSteps = [
    {
      id: 'scam-recognition',
      type: 'phishing-identification',
      title: 'Identify Scams and Phishing',
      description: 'Practice identifying legitimate emails vs. scams and phishing attempts',
      component: ScamRecognitionStep,
      allowSkip: false
    }
  ];

  const handleFlowComplete = async (flowSummary) => {
    console.log('🎯 Interactive flow completed:', flowSummary);
    
    setFlowCompleted(true);
    setFlowScore(flowSummary.score || 0);
    
    // Auto-complete the checklist items
    const updatedItems = checklistItems.map(item => ({
      ...item,
      completed: true
    }));
    setChecklistItems(updatedItems);
    
    // Mark the check as completed
    const newIsCompleted = true;
    setIsCompleted(newIsCompleted);
    
    // Save progress
    await saveProgress(updatedItems, newIsCompleted);
    
    // Show completion celebration
    celebrateCompletion();
  };

  const handleStepComplete = (stepId, validationResult) => {
    console.log('📋 Step completed:', stepId, validationResult);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={handleExit}
          activeOpacity={0.8}
        >
          <Ionicons name="menu" size={Responsive.iconSizes.large} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check 1.4.1</Text>
        <View style={styles.headerSpacer} />
      </View>

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
              <Text style={styles.characterText}>😢</Text>
            </View>

            <Text style={styles.modalTitle}>Wait, don't go!</Text>

            <Text style={styles.modalMessage}>
              You're doing well! If you quit now, you'll lose your progress for this lesson.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.keepLearningButton}
                onPress={handleKeepLearning}
                activeOpacity={0.8}
              >
                <Text style={styles.keepLearningButtonText}>Keep learning</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.exitLessonButton}
                onPress={handleExitLesson}
                activeOpacity={0.8}
              >
                <Text style={styles.exitLessonButtonText}>Exit lesson</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Title and Description */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Scam Recognition Training</Text>
            <Text style={styles.description}>
              Learn to identify common scams and phishing attempts through interactive scenarios.
            </Text>
          </View>
          
          {/* Interactive Flow Toggle */}
          <TouchableOpacity
            style={styles.flowToggle}
            onPress={() => setUseInteractiveFlow(!useInteractiveFlow)}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={useInteractiveFlow ? "school" : "list"} 
              size={Responsive.iconSizes.medium} 
              color={Colors.accent} 
            />
            <Text style={styles.flowToggleText}>
              {useInteractiveFlow ? 'Interactive Training' : 'Traditional Mode'}
            </Text>
            <Ionicons 
              name="swap-horizontal" 
              size={Responsive.iconSizes.small} 
              color={Colors.accent} 
            />
          </TouchableOpacity>
          
          {/* Interactive Flow or Traditional Content */}
          {useInteractiveFlow && !flowCompleted ? (
            <View style={styles.interactiveFlowContainer}>
              <InteractiveValidationFlow
                flowId="scam-recognition-1-4-1"
                steps={interactiveFlowSteps}
                onComplete={handleFlowComplete}
                onStepComplete={handleStepComplete}
                config={{
                  enableScoring: true,
                  enableTiming: true,
                  passingScore: 70
                }}
              />
            </View>
          ) : (
            <View style={styles.traditionalContent}>
              {/* Learn More Section */}
              <TouchableOpacity
                style={styles.learnMoreButton}
                onPress={() => setShowLearnMore(!showLearnMore)}
                activeOpacity={0.8}
              >
                <Text style={styles.learnMoreText}>Why learn scam recognition?</Text>
                <Ionicons
                  name={showLearnMore ? 'chevron-up' : 'chevron-down'}
                  size={Responsive.iconSizes.medium}
                  color={Colors.accent}
                />
              </TouchableOpacity>

              {showLearnMore && (
                <View style={styles.learnMoreContent}>
                  <Text style={styles.learnMoreTitle}>Common Scam Tactics</Text>
                  <Text style={styles.learnMoreBody}>
                    • Creating urgency with threats or time limits{'\n'}
                    • Impersonating trusted organizations{'\n'}
                    • Requesting personal information via email{'\n'}
                    • Using suspicious links and attachments{'\n'}
                    • Poor grammar and spelling errors{'\n'}
                    • Promising unrealistic rewards or prizes
                  </Text>
                </View>
              )}

              {/* Tips Section */}
              <View style={styles.tipsSection}>
                <Text style={styles.tipsTitle}>🛡️ Protection Tips</Text>
                <View style={styles.tipItem}>
                  <Ionicons name="eye" size={Responsive.iconSizes.medium} color={Colors.accent} />
                  <Text style={styles.tipText}>Always verify the sender's email address carefully</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="link" size={Responsive.iconSizes.medium} color={Colors.accent} />
                  <Text style={styles.tipText}>Hover over links to see the real destination</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="call" size={Responsive.iconSizes.medium} color={Colors.accent} />
                  <Text style={styles.tipText}>Contact organizations directly to verify suspicious messages</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="time" size={Responsive.iconSizes.medium} color={Colors.accent} />
                  <Text style={styles.tipText}>Take time to think - scammers use urgency as a pressure tactic</Text>
                </View>
              </View>
            </View>
          )}
          
          {/* Completion Status */}
          <CompletionPopup
          isVisible={showCompletionPopup}
          title={getCompletionMessage('1-4-1').title}
          description={getCompletionMessage('1-4-1').description}
          nextScreenName={getNextScreenName('1-4-1')}
          navigation={navigation}
          variant="modal"
            onClose={() => setShowCompletionPopup(false)}
          />
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
    marginBottom: Responsive.spacing.sm,
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
    backgroundColor: Colors.accentSoft,
    borderRadius: Responsive.borderRadius.xlarge,
    padding: Responsive.padding.modal,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
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
    backgroundColor: Colors.accent,
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    minWidth: Responsive.spacing.xxl * 7,
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
  
  // Interactive Flow Styles
  flowToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentSoft,
    borderRadius: Responsive.borderRadius.medium,
    paddingVertical: Responsive.spacing.sm,
    paddingHorizontal: Responsive.spacing.md,
    marginBottom: Responsive.spacing.lg,
    gap: Responsive.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  flowToggleText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.accent,
  },
  interactiveFlowContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.xlarge,
    padding: Responsive.padding.card,
    marginBottom: Responsive.spacing.lg,
    minHeight: 500,
  },
  traditionalContent: {
    // Container for traditional content
  },
});

export default Check1_4_1_ScamRecognitionScreen;
