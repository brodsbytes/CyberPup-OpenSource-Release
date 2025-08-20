// Interactive Validation Flow Component (Pattern C)
// Provides real-time interactive experiences with validation and feedback

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Alert
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive } from '../theme';
import { ValidationEngine } from '../utils/validationEngine';

const InteractiveValidationFlow = ({ 
  flowId, 
  steps, 
  onComplete, 
  onStepComplete,
  config = {},
  navigation // Add navigation prop
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationEngine] = useState(() => new ValidationEngine(flowId, steps, config));
  const [stepFeedback, setStepFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const feedbackAnim = useRef(new Animated.Value(0)).current;
  const stepAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: (currentStep / steps.length) * 100,
      duration: 300,
      useNativeDriver: false
    }).start();
  }, [currentStep]);

  const handleStepSubmit = async (stepResult) => {
    if (isProcessing) return;

    setIsProcessing(true);
    const currentStepData = steps[currentStep];

    try {
      // Add haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Process result through validation engine
      const validationResult = validationEngine.processStepResult(
        currentStepData.id, 
        stepResult
      );

      // Show feedback
      setStepFeedback(validationResult.feedback);
      setShowFeedback(true);

      // Animate feedback appearance
      Animated.sequence([
        Animated.timing(feedbackAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.delay(2000),
        Animated.timing(feedbackAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        })
      ]).start(() => {
        setShowFeedback(false);
        setStepFeedback(null);
      });

      // Call step complete callback
      if (onStepComplete) {
        onStepComplete(currentStepData.id, validationResult);
      }

      // Advance to next step or complete flow
      if (validationResult.shouldAdvance) {
        if (currentStep < steps.length - 1) {
          setTimeout(() => advanceToNextStep(), 1500);
        } else {
          setTimeout(() => completeFlow(), 1500);
        }
      }

    } catch (error) {
      console.error('Error processing step:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const advanceToNextStep = () => {
    // Animate step transition
    Animated.sequence([
      Animated.timing(stepAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(stepAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      })
    ]).start();

    setCurrentStep(currentStep + 1);
  };

  const completeFlow = () => {
    const summary = validationEngine.getFlowSummary();
    
    // Add celebration haptic
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    if (onComplete) {
      onComplete(summary);
    }
  };

  const handleRetry = () => {
    setStepFeedback(null);
    setShowFeedback(false);
    // Reset any step-specific state as needed
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      advanceToNextStep();
    } else {
      completeFlow();
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    if (!step) return null;

    const StepComponent = step.component;
    if (!StepComponent) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Step component not found</Text>
        </View>
      );
    }

    return (
      <Animated.View 
        style={[
          styles.stepContainer,
          { transform: [{ scale: stepAnim }] }
        ]}
      >
        <StepComponent
          step={step}
          onSubmit={handleStepSubmit}
          onRetry={handleRetry}
          isProcessing={isProcessing}
          stepNumber={currentStep + 1}
          totalSteps={steps.length}
          navigation={navigation}
        />
      </Animated.View>
    );
  };

  const renderFeedback = () => {
    if (!showFeedback || !stepFeedback) return null;

    return (
      <Animated.View 
        style={[
          styles.feedbackContainer,
          styles[`feedback${stepFeedback.type.charAt(0).toUpperCase() + stepFeedback.type.slice(1)}`],
          { opacity: feedbackAnim }
        ]}
      >
        <Ionicons 
          name={stepFeedback.icon} 
          size={Responsive.iconSizes.large} 
          color={Colors[stepFeedback.color]} 
        />
        <View style={styles.feedbackContent}>
          <Text style={styles.feedbackTitle}>{stepFeedback.title}</Text>
          <Text style={styles.feedbackMessage}>{stepFeedback.message}</Text>
        </View>
      </Animated.View>
    );
  };

  const renderProgressBar = () => {
    // Don't show progress bar for single-step flows
    if (steps.length <= 1) {
      return null;
    }
    
    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarTrack}>
          <Animated.View 
            style={[
              styles.progressBarFill,
              { 
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp'
                })
              }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep + 1} of {steps.length}
        </Text>
      </View>
    );
  };

  const renderFlowNavigation = () => (
    <View style={styles.navigationContainer}>
      {currentStep > 0 && (
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => setCurrentStep(currentStep - 1)}
          disabled={isProcessing}
        >
          <Ionicons name="chevron-back" size={Responsive.iconSizes.medium} color={Colors.accent} />
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.navSpacer} />
      
      {steps[currentStep]?.allowSkip && (
        <TouchableOpacity
          style={[styles.navButton, styles.skipButton]}
          onPress={handleSkip}
          disabled={isProcessing}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
          <Ionicons name="chevron-forward" size={Responsive.iconSizes.medium} color={Colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );

  if (steps.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No steps configured for this flow</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderProgressBar()}
      {renderStepContent()}
      {renderFeedback()}
      {renderFlowNavigation()}
      
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.processingText}>Processing...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressBarContainer: {
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.md,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: Responsive.spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  progressText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: Responsive.padding.screen,
  },
  feedbackContainer: {
    position: 'absolute',
    top: '50%',
    left: Responsive.padding.screen,
    right: Responsive.padding.screen,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Responsive.padding.card,
    borderRadius: Responsive.borderRadius.large,
    marginTop: -50, // Center vertically
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  feedbackSuccess: {
    backgroundColor: Colors.successSoft,
    borderColor: Colors.success,
    borderWidth: 1,
  },
  feedbackError: {
    backgroundColor: Colors.warningSoft,
    borderColor: Colors.warning,
    borderWidth: 1,
  },
  feedbackInfo: {
    backgroundColor: Colors.accentSoft,
    borderColor: Colors.accent,
    borderWidth: 1,
  },
  feedbackContent: {
    flex: 1,
    marginLeft: Responsive.spacing.sm,
  },
  feedbackTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  feedbackMessage: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.sm * 1.4,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Responsive.spacing.sm,
    paddingHorizontal: Responsive.spacing.md,
  },
  navButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.accent,
    marginLeft: Responsive.spacing.xs,
  },
  skipButton: {
    opacity: 0.7,
  },
  skipButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginRight: Responsive.spacing.xs,
  },
  navSpacer: {
    flex: 1,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    marginTop: Responsive.spacing.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Responsive.padding.screen,
  },
  errorText: {
    fontSize: Typography.sizes.md,
    color: Colors.warning,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Responsive.padding.screen,
  },
  emptyText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default InteractiveValidationFlow;
