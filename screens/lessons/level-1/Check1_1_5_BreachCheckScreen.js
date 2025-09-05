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
  Animated,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Responsive, CommonStyles } from '../../../theme';
import { BreachCheckService } from '../../../utils/breachCheckService';
import InteractiveValidationFlow from '../../../components/validation-steps/InteractiveValidationFlow';
import BreachCheckStep from '../../../components/validation-steps/BreachCheckStep';
import CompletionPopup from '../../../components/gamification/CompletionPopup';
import HeaderWithProgress from '../../../components/navigation/HeaderWithProgress';
import { getCompletionMessage, getNextScreenName, getCompletionNavigation } from '../../../utils/completionMessages';
import { CopywritingService } from '../../../utils/copywritingService';
import ExitModal from '../../../components/common/ExitModal';
import ReferencesSection from '../../../components/ui/ReferencesSection';
import { getReferencesForCheck } from '../../../data/references';

const Check1_5_BreachCheckScreen = ({ navigation, route }) => {

  
  const [checklistItems, setChecklistItems] = useState([
    {
      id: 1,
      text: 'Checked my email on breach checker',
      completed: false,
      action: null,
    },
    {
      id: 2,
      text: 'Changed any leaked passwords',
      completed: false,
      action: null,
    },
  ]);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [showExitModal, setShowExitModal] = useState(false);
  
  // Breach check specific state
  const [email, setEmail] = useState('');
  const [isCheckingBreach, setIsCheckingBreach] = useState(false);
  const [breachResult, setBreachResult] = useState(null);
  const [showBreachModal, setShowBreachModal] = useState(false);
  
  // Pattern C - Interactive flow state (always enabled)
  const [useInteractiveFlow, setUseInteractiveFlow] = useState(true);
  const [flowCompleted, setFlowCompleted] = useState(false);
  


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
      const progressData = await AsyncStorage.getItem('check_1-1-5_progress');
      const completedData = await AsyncStorage.getItem('check_1-1-5_completed');
      console.log('📥 Loading progress for Check 1.1.5:', { progressData: !!progressData, completedData });
      
      if (progressData) {
        const data = JSON.parse(progressData);
        setChecklistItems(data.checklistItems || checklistItems);
        setIsCompleted(data.isCompleted || false);
        setEmail(data.email || '');
        setBreachResult(data.breachResult || null);
        setFlowCompleted(data.flowCompleted || false);
        console.log('📊 Loaded progress data:', { isCompleted: data.isCompleted, checklistItems: data.checklistItems?.length });
      }
      
      // Also check the completion status directly
      if (completedData === 'completed') {
        console.log('✅ Check 1.1.5 is marked as completed in storage');
        setIsCompleted(true);
        setFlowCompleted(true);
        // Don't automatically show completion popup when loading progress
        // Only show it when the user actually completes the check
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
        email,
        breachResult,
        flowCompleted,
        completedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('check_1-1-5_progress', JSON.stringify(progressData));
      
      if (completionStatus) {
        await AsyncStorage.setItem('check_1-1-5_completed', 'completed');
        console.log('✅ Check 1.1.5 marked as completed');
      } else {
        await AsyncStorage.removeItem('check_1-1-5_completed');
        console.log('❌ Check 1.1.5 completion removed');
      }
    } catch (error) {
      console.log('Error saving progress:', error);
    }
  };

  const toggleChecklistItem = async (id) => {
    const updatedItems = checklistItems.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklistItems(updatedItems);

    // Animate the checkbox
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();

    // Check if all items are completed
    const allCompleted = updatedItems.every(item => item.completed);
    console.log(`📋 All items completed: ${allCompleted}, current isCompleted: ${isCompleted}`);
    
    if (allCompleted && !isCompleted) {
      console.log('🎯 Marking check as completed!');
      // Update state and save progress with the new completion status
      const newIsCompleted = true;
      setIsCompleted(newIsCompleted);
      
      // Save progress with the updated completion status
      await saveProgress(updatedItems, newIsCompleted);
      celebrateCompletion();
    } else {
      console.log('💾 Saving partial progress');
      // Save progress for partial completion
      await saveProgress(updatedItems, isCompleted);
    }
  };

  const celebrateCompletion = async () => {
    console.log('🎉 Celebrating completion of Check 1.1.5');
    // Ensure completion is saved before showing alert
    await saveProgress(checklistItems, true);
    
    // Always show CompletionPopup first, let user click "Continue" to go to AreaCompletionScreen
    setShowCompletionPopup(true);
  };

  const checkBreach = async () => {
    if (!email || !BreachCheckService.validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsCheckingBreach(true);
    
    try {
      // First try the detailed analytics API for rich data
      const analyticsResult = await BreachCheckService.getBreachAnalytics(email);
      
      let result;
      if (analyticsResult.hasAnalytics && analyticsResult.exposedBreaches) {
        // Use enhanced analytics data
        const exposedBreaches = analyticsResult.exposedBreaches.breaches_details || [];
        
        // Transform detailed breach data for Check 1.5 UI
        const formattedBreaches = exposedBreaches.map(breach => {
          // Parse the date from xposed_date field
          let formattedDate = 'Unknown';
          if (breach.xposed_date) {
            if (breach.xposed_date.length === 4) {
              formattedDate = breach.xposed_date;
            } else {
              const date = new Date(breach.xposed_date);
              if (!isNaN(date.getTime())) {
                formattedDate = date.toLocaleDateString();
              } else {
                formattedDate = breach.xposed_date;
              }
            }
          }

          // Format record count from xposed_records
          let formattedRecords = 'Unknown';
          if (breach.xposed_records && typeof breach.xposed_records === 'number') {
            if (breach.xposed_records >= 1000000) {
              formattedRecords = `${(breach.xposed_records / 1000000).toFixed(1)}M`;
            } else if (breach.xposed_records >= 1000) {
              formattedRecords = `${(breach.xposed_records / 1000).toFixed(0)}K`;
            } else {
              formattedRecords = breach.xposed_records.toLocaleString();
            }
          }

          return {
            name: breach.breach || breach.breachID || 'Unknown',
            date: formattedDate,
            records: formattedRecords,
            dataTypes: breach.xposed_data ? breach.xposed_data.split(';').map(type => type.trim()) : ['Email addresses'],
            industry: breach.industry || 'Unknown'
          };
        });

        const breachCount = formattedBreaches.length;
        result = {
          isBreached: breachCount > 0,
          breaches: formattedBreaches,
          breachCount: breachCount,
          message: breachCount > 0 
            ? `Your email was found in ${breachCount} data breach${breachCount > 1 ? 'es' : ''}. We recommend changing your passwords immediately.`
            : 'Good news! Your email was not found in any known data breaches.',
          severity: breachCount > 5 ? 'high' : breachCount > 2 ? 'medium' : 'low',
          checkedAt: new Date().toISOString()
        };
      } else {
        // Fallback to basic API
        const apiResult = await BreachCheckService.checkEmailBreach(email);
        const formattedResult = BreachCheckService.formatBreachResult(apiResult);
        
        // Transform basic breach names to objects for UI compatibility
        const formattedBreaches = Array.isArray(apiResult.breaches) 
          ? apiResult.breaches.map(breachName => ({
              name: breachName,
              date: 'Unknown',
              records: 'Unknown',
              dataTypes: ['Email addresses'],
              industry: 'Unknown'
            }))
          : [];
        
        result = {
          isBreached: apiResult.isBreached,
          breaches: formattedBreaches,
          breachCount: apiResult.breachCount || 0,
          message: apiResult.message,
          severity: formattedResult.severity,
          recommendations: formattedResult.recommendations,
          checkedAt: apiResult.checkedAt
        };
      }
      
      setBreachResult(result);
      setShowBreachModal(true);
      
      // Auto-complete the first checklist item
      if (!checklistItems[0].completed) {
        const updatedItems = checklistItems.map(item =>
          item.id === 1 ? { ...item, completed: true } : item
        );
        setChecklistItems(updatedItems);
        console.log('🔍 Auto-completing first checklist item after breach check');
        await saveProgress(updatedItems, isCompleted);
      }
      
    } catch (error) {
      console.log('Breach check error:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setIsCheckingBreach(false);
    }
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
      id: 'breach-check',
      type: 'email-breach-check',
      title: 'Check for Data Breaches',
      description: 'Enter your email to see if it appears in known data breaches',
      component: BreachCheckStep,
      allowSkip: false
    }
  ];

  const handleFlowComplete = async (flowSummary) => {
    console.log('🎯 Interactive flow completed:', flowSummary);
    
    setFlowCompleted(true);
    
    // Auto-complete the first checklist item
    const updatedItems = checklistItems.map(item =>
      item.id === 1 ? { ...item, completed: true } : item
    );
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
    
    if (stepId === 'breach-check') {
      console.log('🔍 Breach check step completed, validation result:', {
        isValid: validationResult.isValid,
        feedback: validationResult.feedback,
        hasBreachResult: !!validationResult.feedback?.breachResult
      });
      
      if (validationResult.isValid) {
        console.log('✅ Breach check validation passed');
      } else {
        console.log('❌ Breach check validation failed:', validationResult.feedback);
      }
    }
  };

  const renderChecklistItem = (item) => (
    <Animated.View
      key={item.id}
      style={[
        styles.checklistItem,
        item.completed && styles.checklistItemCompleted,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <TouchableOpacity
        style={styles.checklistRow}
        onPress={() => toggleChecklistItem(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, item.completed && styles.checkboxCompleted]}>
          {item.completed && (
            <Ionicons name="checkmark" size={Responsive.iconSizes.small} color={Colors.textPrimary} />
          )}
        </View>
        <Text style={[styles.checklistText, item.completed && styles.checklistTextCompleted]}>
          {item.text}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

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
        checkId="1-1-5"
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

      {/* Breach Result Modal */}
      <Modal
        visible={showBreachModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBreachModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.breachModalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowBreachModal(false)}
            >
              <Ionicons name="close" size={Responsive.iconSizes.large} color={Colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.breachResultHeader}>
                          <Ionicons 
              name={breachResult?.isBreached ? "warning" : "checkmark-circle"} 
              size={Responsive.iconSizes.xxlarge} 
              color={breachResult?.isBreached ? Colors.warning : Colors.accent} 
            />
              <Text style={styles.breachResultTitle}>
                {breachResult?.isBreached ? 'Breach Found' : 'No Breaches Found'}
              </Text>
            </View>

            <Text style={styles.breachResultMessage}>
              {breachResult?.message}
            </Text>

            {breachResult?.isBreached && breachResult.breaches.length > 0 && (
              <View style={styles.breachesList}>
                <Text style={styles.breachesTitle}>Affected Services:</Text>
                {breachResult.breaches.map((breach, index) => (
                  <View key={index} style={styles.breachItem}>
                    <Text style={styles.breachName}>{breach.name}</Text>
                    <Text style={styles.breachDate}>Date: {breach.date}</Text>
                    {breach.records && breach.records !== 'Unknown' && (
                      <Text style={styles.breachRecords}>Records: {breach.records}</Text>
                    )}
                    {breach.industry && breach.industry !== 'Unknown' && (
                      <Text style={styles.breachIndustry}>Industry: {breach.industry}</Text>
                    )}
                    {breach.dataTypes && breach.dataTypes.length > 0 && (
                      <Text style={styles.breachData}>
                        Data: {Array.isArray(breach.dataTypes) ? breach.dataTypes.join(', ') : breach.dataTypes}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            <View style={styles.breachModalButtons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  if (breachResult?.isBreached) {
                    setShowBreachModal(false);
                    navigation.navigate('GuideDetailScreen', { id: 'guide-7' });
                  } else {
                    setShowBreachModal(false);
                  }
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>
                  {breachResult?.isBreached ? 'Show Me How' : 'Got It'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>



      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Title and Description */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Check if Your Data Was Compromised</Text>
            <Text style={styles.description}>
              Find out if your information has been compromised in data breaches and take action to protect your accounts.
            </Text>
          </View>
          

          
          {/* Interactive Flow */}
          {!flowCompleted ? (
            <View style={styles.interactiveFlowContainer}>
              <InteractiveValidationFlow
                flowId="breach-check-1-5"
                steps={interactiveFlowSteps}
                onComplete={handleFlowComplete}
                onStepComplete={handleStepComplete}
                navigation={navigation}
                config={{
                  enableScoring: true,
                  enableTiming: true,
                  passingScore: 100
                }}
              />
            </View>
          ) : (
            <View style={styles.completedFlowContent}>
              {/* Show summary of completed flow */}
              <View style={styles.completedSummary}>
                <Ionicons name="checkmark-circle" size={Responsive.iconSizes.xxlarge} color={Colors.success} />
                <Text style={styles.completedTitle}>Breach Check Complete!</Text>
                <Text style={styles.completedDescription}>
                  You've successfully completed the interactive breach check. Your email has been verified and you're now better protected.
                </Text>
                
                {/* Tool link card */}
                <TouchableOpacity
                  style={styles.toolCard}
                  onPress={() => {
                    console.log('🔗 Navigating to tool-2 (additional email checking)');
                    navigation.navigate('ToolDetailScreen', { id: 'tool-2' });
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="mail" size={Responsive.iconSizes.medium} color={Colors.accent} />
                  <View style={styles.toolCardContent}>
                    <Text style={styles.toolCardTitle}>Check More Emails</Text>
                    <Text style={styles.toolCardDescription}>
                      You can check your other email addresses anytime in the Insights tab
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={Responsive.iconSizes.medium} color={Colors.accent} />
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {/* References Section */}
          <ReferencesSection references={getReferencesForCheck('1-1-5')} />
          
          {/* Completion Status */}
          <CompletionPopup
            isVisible={showCompletionPopup}
            title={getCompletionMessage('1-1-5').title}
            description={getCompletionMessage('1-1-5').description}
            nextScreenName={getNextScreenName('1-1-5')}
            navigation={navigation}
            onClose={() => setShowCompletionPopup(false)}
            variant="modal"
            checkId="1-1-5"
            onContinue={() => {
              // Use the new navigation logic for area completion
              const completionNav = getCompletionNavigation('1-1-5');
              if (completionNav.type === 'area_completion') {
                navigation.navigate(completionNav.target, completionNav.params);
              } else {
                navigation.navigate(completionNav.target);
              }
            }}
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
  breachCheckerSection: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.xlarge,
    padding: Responsive.padding.card,
    marginBottom: Responsive.spacing.lg,
  },
  breachCheckerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  breachCheckerSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Responsive.spacing.md,
  },
  emailInputContainer: {
    flexDirection: 'row',
    marginBottom: Responsive.spacing.md,
  },
  emailInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Responsive.borderRadius.medium,
    paddingHorizontal: Responsive.spacing.md,
    paddingVertical: Responsive.padding.button,
    color: Colors.textPrimary,
    fontSize: Typography.sizes.md,
    marginRight: Responsive.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: Responsive.inputHeight.medium,
  },
  checkButton: {
    backgroundColor: Colors.accent,
    borderRadius: Responsive.borderRadius.medium,
    paddingHorizontal: Responsive.spacing.lg,
    paddingVertical: Responsive.padding.button,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: Responsive.spacing.xxl,
    minHeight: Responsive.buttonHeight.medium,
  },
  checkButtonDisabled: {
    backgroundColor: Colors.border,
  },
  checkButtonText: {
    color: Colors.textPrimary,
    fontWeight: Typography.weights.semibold,
    fontSize: Typography.sizes.md,
  },
  breachResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Responsive.spacing.sm,
    borderRadius: Responsive.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  breachResultText: {
    flex: 1,
    marginLeft: Responsive.spacing.sm,
    fontSize: Typography.sizes.sm,
    color: Colors.textPrimary,
    lineHeight: Typography.sizes.sm * 1.3,
  },
  checklistSection: {
    marginBottom: Responsive.spacing.lg,
  },
  checklistTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  checklistSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Responsive.spacing.md,
  },
  checklistItem: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.card,
    marginBottom: Responsive.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checklistItemCompleted: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentSoft,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: Responsive.iconSizes.large,
    height: Responsive.iconSizes.large,
    borderRadius: Responsive.iconSizes.large / 2,
    borderWidth: 2,
    borderColor: Colors.accent,
    marginRight: Responsive.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: Colors.accent,
  },
  checklistText: {
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: Typography.sizes.md * 1.4,
  },
  checklistTextCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
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
  breachModalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.xxlarge,
    padding: Responsive.padding.modal,
    marginHorizontal: Responsive.padding.screen,
    maxHeight: '80%',
    width: Responsive.modal.width,
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
    zIndex: 1,
  },
  // Breach Result Modal Styles
  breachResultHeader: {
    alignItems: 'center',
    marginBottom: Responsive.spacing.md,
    marginTop: Responsive.spacing.lg,
  },
  breachResultTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: Responsive.spacing.sm,
    textAlign: 'center',
  },
  breachResultMessage: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.4,
    marginBottom: Responsive.spacing.lg,
  },
  breachesList: {
    marginBottom: Responsive.spacing.lg,
  },
  breachesTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  breachItem: {
    backgroundColor: Colors.background,
    borderRadius: Responsive.borderRadius.medium,
    padding: Responsive.spacing.sm,
    marginBottom: Responsive.spacing.sm,
  },
  breachName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  breachDate: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  breachRecords: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  breachIndustry: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  breachData: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Responsive.spacing.xs,
  },
  breachModalButtons: {
    marginTop: Responsive.spacing.lg,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    borderRadius: Responsive.borderRadius.large,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    alignItems: 'center',
    minHeight: Responsive.buttonHeight.medium,
  },
  primaryButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  
  // Interactive Flow Styles
  interactiveFlowContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.xlarge,
    padding: Responsive.padding.card,
    marginBottom: Responsive.spacing.lg,
    minHeight: 400,
  },
  completedFlowContent: {
    marginBottom: Responsive.spacing.lg,
  },
  completedSummary: {
    backgroundColor: Colors.successSoft,
    borderRadius: Responsive.borderRadius.xlarge,
    padding: Responsive.padding.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  completedTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: Responsive.spacing.sm,
    marginBottom: Responsive.spacing.sm,
    textAlign: 'center',
  },
  completedDescription: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.4,
    marginBottom: Responsive.spacing.lg,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentSoft,
    borderRadius: Responsive.borderRadius.medium,
    padding: Responsive.spacing.md,
    borderWidth: 1,
    borderColor: Colors.accent,
    gap: Responsive.spacing.sm,
  },
  toolCardContent: {
    flex: 1,
  },
  toolCardTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  toolCardDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.sm * 1.3,
  },

});

export default Check1_5_BreachCheckScreen;
