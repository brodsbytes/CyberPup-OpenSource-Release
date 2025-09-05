// Scam Recognition Validation Step Component
// Interactive step for phishing email identification with scoring

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive } from '../../theme';
import { CopywritingService } from '../../utils/copywritingService';

const ScamRecognitionStep = ({ 
  step, 
  onSubmit, 
  isProcessing, 
  stepNumber, 
  totalSteps 
}) => {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [userChoices, setUserChoices] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [scenarioComplete, setScenarioComplete] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  // Phishing scenarios database
  const scenarios = [
    {
      id: 'scenario-1',
      type: 'phishing',
      from: 'security@paypal-verify.com',
      subject: 'Urgent: Your Account Will Be Suspended',
      preview: 'We detected suspicious activity on your account...',
      body: `Dear Valued Customer,

We have detected suspicious activity on your PayPal account and need you to verify your identity immediately to prevent account suspension.

Click here to verify your account: http://paypal-security-verify.com/login

If you do not verify within 24 hours, your account will be permanently suspended and you will lose access to your funds.

Thank you for your immediate attention to this matter.

PayPal Security Team`,
      redFlags: [
        'Suspicious domain (paypal-verify.com instead of paypal.com)',
        'Urgent threats and time pressure',
        'Generic greeting ("Dear Valued Customer")',
        'Threatening consequences',
        'Suspicious URL that doesn\'t match PayPal'
      ],
      explanation: 'This is a classic phishing email. PayPal would never threaten to suspend your account via email or ask you to click suspicious links. Always go directly to the official website.'
    },
    {
      id: 'scenario-2',
      type: 'legitimate',
      from: 'noreply@github.com',
      subject: 'Sign in to GitHub',
      preview: 'Someone just used your password to try to sign in...',
      body: `Hi there,

Someone just used your password to try to sign in to your GitHub account from a new device.

Device: Chrome on macOS
Location: San Francisco, CA, US
Time: Today at 2:14 PM PST

If this was you, you can safely ignore this email.

If this wasn't you, please secure your account:
• Change your password immediately
• Enable two-factor authentication
• Review recent activity on your account

GitHub Security Team`,
      legitimateSignals: [
        'From official GitHub domain (github.com)',
        'No suspicious links or attachments',
        'Provides helpful security information',
        'Doesn\'t request immediate action or threaten consequences',
        'Gives specific details (device, location, time)'
      ],
      explanation: 'This is a legitimate security notification from GitHub. It provides helpful information about account activity without pressuring you to click suspicious links.'
    },
    {
      id: 'scenario-3',
      type: 'phishing',
      from: 'support@amazon-customer-service.net',
      subject: 'Your Order #AMZ-8847293 Could Not Be Delivered',
      preview: 'There was an issue with your recent order...',
      body: `Dear Amazon Customer,

Your recent order #AMZ-8847293 for iPhone 15 Pro Max could not be delivered due to an incorrect shipping address.

Order Total: $1,199.99
Delivery Address: [Your address will be shown here]

To update your shipping information and complete delivery, please log in to your account:

>> UPDATE SHIPPING INFO NOW <<

Please note: If you do not update your information within 48 hours, your order will be cancelled and you will be charged a restocking fee of $299.99.

Best regards,
Amazon Customer Service`,
      redFlags: [
        'Suspicious domain (amazon-customer-service.net vs amazon.com)',
        'Creates urgency with time pressure and fees',
        'Generic greeting without actual name',
        'Mentions expensive item you may not have ordered',
        'Threatens unexpected charges'
      ],
      explanation: 'This is a phishing scam designed to steal your Amazon credentials. Amazon communicates through your account dashboard, not suspicious emails demanding immediate action.'
    }
  ];

  const currentScenarioData = scenarios[currentScenario];

  const handleChoice = async (choice) => {
    const isCorrect = choice === currentScenarioData.type;
    
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Store user choice
    const newChoices = {
      ...userChoices,
      [currentScenarioData.id]: {
        userChoice: choice,
        correctAnswer: currentScenarioData.type,
        isCorrect,
        timestamp: new Date().toISOString()
      }
    };
    setUserChoices(newChoices);
    setShowFeedback(true);
    setScenarioComplete(true);
  };

  const handleContinue = () => {
    if (currentScenario < scenarios.length - 1) {
      // Move to next scenario
      setCurrentScenario(currentScenario + 1);
      setShowFeedback(false);
      setScenarioComplete(false);
    } else {
      // All scenarios complete, submit final result
      submitFinalResult(userChoices);
    }
  };

  const submitFinalResult = (allChoices) => {
    const totalScenarios = scenarios.length;
    const correctAnswers = Object.values(allChoices).filter(choice => choice.isCorrect).length;
    const accuracy = correctAnswers / totalScenarios;
    const score = Math.round(accuracy * 100);

    onSubmit({
      userChoices: allChoices,
      totalScenarios,
      correctAnswers,
      accuracy,
      score,
      scenarios
    });
  };

  const renderEmailPreview = () => (
    <View style={styles.emailContainer}>
      <View style={styles.emailHeader}>
        <Text style={styles.emailFrom}>From: {currentScenarioData.from}</Text>
        <Text style={styles.emailSubject}>Subject: {currentScenarioData.subject}</Text>
      </View>
      
      <View style={styles.emailBody}>
        <Text style={styles.emailContent}>{currentScenarioData.body}</Text>
      </View>
    </View>
  );

  const renderChoiceButtons = () => {
    if (scenarioComplete) return null;

    return (
      <View style={styles.choiceContainer}>
        <Text style={styles.choicePrompt}>Is this email legitimate or a scam?</Text>
        
        <View style={styles.choiceButtons}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[styles.choiceButton, styles.legitimateButton]}
              onPress={() => handleChoice('legitimate')}
              activeOpacity={0.8}
              disabled={isProcessing}
            >
              <Ionicons name="checkmark-circle" size={Responsive.iconSizes.medium} color={Colors.textPrimary} />
              <Text style={styles.choiceButtonText}>Legitimate</Text>
            </TouchableOpacity>
          </Animated.View>
          
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[styles.choiceButton, styles.scamButton]}
              onPress={() => handleChoice('phishing')}
              activeOpacity={0.8}
              disabled={isProcessing}
            >
              <Ionicons name="warning" size={Responsive.iconSizes.medium} color={Colors.textPrimary} />
              <Text style={styles.choiceButtonText}>Scam/Phishing</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  };

  const renderFeedback = () => {
    if (!showFeedback) return null;

    const userChoice = userChoices[currentScenarioData.id];
    const isCorrect = userChoice.isCorrect;

    return (
      <View style={[
        styles.feedbackContainer,
        isCorrect ? styles.correctFeedback : styles.incorrectFeedback
      ]}>
        <View style={styles.feedbackHeader}>
          <Ionicons 
            name={isCorrect ? "checkmark-circle" : "close-circle"} 
            size={Responsive.iconSizes.xlarge} 
            color={isCorrect ? Colors.success : Colors.warning} 
          />
          <Text style={styles.feedbackTitle}>
            {isCorrect ? CopywritingService.getValidationFeedback('scamRecognition', 'correct') : CopywritingService.getValidationFeedback('scamRecognition', 'incorrect')}
          </Text>
        </View>

        <Text style={styles.feedbackExplanation}>
          {currentScenarioData.explanation}
        </Text>

        {currentScenarioData.type === 'phishing' && (
          <View style={styles.redFlagsContainer}>
            <Text style={styles.redFlagsTitle}>{CopywritingService.getValidationFeedback('scamRecognition', 'redFlags')}</Text>
            {currentScenarioData.redFlags.map((flag, index) => (
              <Text key={index} style={styles.redFlagItem}>• {flag}</Text>
            ))}
          </View>
        )}

        {currentScenarioData.type === 'legitimate' && (
          <View style={styles.legitimateSignalsContainer}>
            <Text style={styles.legitimateSignalsTitle}>{CopywritingService.getValidationFeedback('scamRecognition', 'legitimateSignals')}</Text>
            {currentScenarioData.legitimateSignals.map((signal, index) => (
              <Text key={index} style={styles.legitimateSignalItem}>• {signal}</Text>
            ))}
          </View>
        )}

        {currentScenario < scenarios.length - 1 && (
          <Text style={styles.nextScenarioText}>
            {CopywritingService.getValidationFeedback('scamRecognition', 'nextScenario')}
          </Text>
        )}

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>{CopywritingService.getValidationFeedback('scamRecognition', 'continue')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderProgress = () => (
    <View style={styles.progressContainer}>
      <Text style={styles.progressText}>
        Scenario {currentScenario + 1} of {scenarios.length}
      </Text>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${((currentScenario + 1) / scenarios.length) * 100}%` }
          ]} 
        />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepDescription}>{step.description}</Text>
      </View>

      {renderProgress()}
      {renderEmailPreview()}
      {renderChoiceButtons()}
      {renderFeedback()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: Responsive.spacing.lg,
  },
  stepHeader: {
    marginBottom: Responsive.spacing.xl,
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.5,
  },
  progressContainer: {
    marginBottom: Responsive.spacing.lg,
  },
  progressText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Responsive.spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  emailContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.medium,
    marginBottom: Responsive.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  emailHeader: {
    backgroundColor: Colors.background,
    padding: Responsive.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  emailFrom: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Responsive.spacing.xs,
  },
  emailSubject: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  emailBody: {
    padding: Responsive.spacing.md,
  },
  emailContent: {
    fontSize: Typography.sizes.sm,
    color: Colors.textPrimary,
    lineHeight: Typography.sizes.sm * 1.5,
  },
  choiceContainer: {
    marginBottom: Responsive.spacing.lg,
  },
  choicePrompt: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Responsive.spacing.md,
  },
  choiceButtons: {
    flexDirection: 'row',
    gap: Responsive.spacing.md,
  },
  choiceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.md,
    borderRadius: Responsive.borderRadius.medium,
    gap: Responsive.spacing.sm,
    minHeight: Responsive.buttonHeight.medium,
  },
  legitimateButton: {
    backgroundColor: Colors.success,
  },
  scamButton: {
    backgroundColor: Colors.warning,
  },
  choiceButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  feedbackContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.card,
    borderWidth: 1,
  },
  correctFeedback: {
    borderColor: Colors.success,
    backgroundColor: Colors.successSoft,
  },
  incorrectFeedback: {
    borderColor: Colors.warning,
    backgroundColor: Colors.warningSoft,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.spacing.md,
    gap: Responsive.spacing.sm,
  },
  feedbackTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  feedbackExplanation: {
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    lineHeight: Typography.sizes.md * 1.4,
    marginBottom: Responsive.spacing.md,
  },
  redFlagsContainer: {
    marginBottom: Responsive.spacing.md,
  },
  redFlagsTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.warning,
    marginBottom: Responsive.spacing.sm,
  },
  redFlagItem: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Responsive.spacing.xs,
    paddingLeft: Responsive.spacing.sm,
  },
  legitimateSignalsContainer: {
    marginBottom: Responsive.spacing.md,
  },
  legitimateSignalsTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.success,
    marginBottom: Responsive.spacing.sm,
  },
  legitimateSignalItem: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Responsive.spacing.xs,
    paddingLeft: Responsive.spacing.sm,
  },
  nextScenarioText: {
    fontSize: Typography.sizes.sm,
    color: Colors.accent,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  continueButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    borderRadius: Responsive.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Responsive.spacing.md,
  },
  continueButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
});

export default ScamRecognitionStep;
