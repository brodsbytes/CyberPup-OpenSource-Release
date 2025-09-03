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
import InteractiveValidationFlow from '../../../components/validation-steps/InteractiveValidationFlow';
import ScamRecognitionStep from '../../../components/validation-steps/ScamRecognitionStep';
import CompletionPopup from '../../../components/gamification/CompletionPopup';
import HeaderWithProgress from '../../../components/navigation/HeaderWithProgress';
import { getCompletionMessage, getNextScreenName } from '../../../utils/completionMessages';
import ExitModal from '../../../components/common/ExitModal';

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
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  
  // Interactive flow state
  const [flowCompleted, setFlowCompleted] = useState(false);
  const [flowScore, setFlowScore] = useState(0);
  const [userChoices, setUserChoices] = useState({});

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
        setFlowCompleted(true);
        // Show completion popup when returning to completed check
        setShowCompletionPopup(true);
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
    
    // Show completion popup instead of celebration alert
    setShowCompletionPopup(true);
  };

  const handleStepComplete = (stepId, validationResult) => {
    console.log('📋 Step completed:', stepId, validationResult);
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
        checkId="1-4-1"
        onExit={handleExit}
        isCompleted={isCompleted}
        progress={getProgress()}
        navigation={navigation}
      />

      {/* ✅ STANDARDIZED: Exit Modal using common component */}
      <ExitModal
        visible={showExitModal}
        onClose={() => setShowExitModal(false)}
        onKeepLearning={handleKeepLearning}
        onExit={handleExitLesson}
        icon="😢"
        title="Wait, don't go!"
        message="You're doing well! If you quit now, you'll lose your progress for this lesson."
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Title and Description */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Scam Recognition Training</Text>
            <Text style={styles.description}>
              Learn to identify common scams and phishing attempts through interactive scenarios.
            </Text>
          </View>
          
          {/* Interactive Flow */}
          {!flowCompleted ? (
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
            <View style={styles.completedContainer}>
              <Text style={styles.completedTitle}>Training Complete! 🎉</Text>
              <Text style={styles.completedScore}>Your Score: {flowScore}%</Text>
              <Text style={styles.completedMessage}>
                Great job completing the scam recognition training! You can review your results or retake the training to improve your score.
              </Text>
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={() => {
                  setFlowCompleted(false);
                  setFlowScore(0);
                  setUserChoices({});
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.retakeButtonText}>Retake Training</Text>
              </TouchableOpacity>
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
          checkId="1-4-1"
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
  // Interactive Flow Styles
  interactiveFlowContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.xlarge,
    padding: Responsive.padding.card,
    marginBottom: Responsive.spacing.lg,
    minHeight: 500,
  },
  completedContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.xlarge,
    padding: Responsive.padding.card,
    marginBottom: Responsive.spacing.lg,
    alignItems: 'center',
    minHeight: 300,
  },
  completedTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.md,
    textAlign: 'center',
  },
  completedScore: {
    fontSize: Typography.sizes.lg,
    color: Colors.accent,
    fontWeight: Typography.weights.semibold,
    marginBottom: Responsive.spacing.md,
  },
  completedMessage: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.5,
    marginBottom: Responsive.spacing.lg,
  },
  retakeButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    borderRadius: Responsive.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Responsive.buttonHeight.medium,
  },
  retakeButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
});

export default Check1_4_1_ScamRecognitionScreen;
