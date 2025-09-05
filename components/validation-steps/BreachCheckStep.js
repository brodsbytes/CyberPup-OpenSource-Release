// Breach Check Validation Step Component
// Interactive step for email breach checking with real-time validation

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive } from '../../theme';
import { CopywritingService } from '../../utils/copywritingService';
import { BreachCheckService } from '../../utils/breachCheckService';

const BreachCheckStep = ({ 
  step, 
  onSubmit, 
  isProcessing, 
  stepNumber, 
  totalSteps,
  navigation // Add navigation prop to enable routing
}) => {
  const [email, setEmail] = useState('');
  const [isCheckingBreach, setIsCheckingBreach] = useState(false);
  const [breachResult, setBreachResult] = useState(null);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    // Clear error when email changes
    if (emailError && email) {
      setEmailError('');
    }
  }, [email]);

  const validateEmail = (emailText) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailText.trim());
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    // Real-time validation feedback
    if (text.length > 0 && !validateEmail(text)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const performBreachCheck = async () => {
    if (!email.trim()) {
      setEmailError('Email address is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsCheckingBreach(true);
    setEmailError('');

    try {
      // Try detailed analytics first, fallback to basic check
      const analyticsResult = await BreachCheckService.getBreachAnalytics(email);
      
      let result;
      if (analyticsResult.hasAnalytics && analyticsResult.exposedBreaches) {
        // Enhanced analytics data available
        const exposedBreaches = analyticsResult.exposedBreaches.breaches_details || [];
        
        const formattedBreaches = exposedBreaches.map(breach => {
          // Parse date
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

          // Format record count
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
      
      // Don't auto-submit - let user review the results first
      console.log('🔍 Breach check completed, showing results to user:', {
        email: email.trim(),
        isBreached: result.isBreached,
        breachCount: result.breachCount
      });
      
    } catch (error) {
      console.error('Breach check error:', error);
      Alert.alert('Error', error.message || CopywritingService.getErrorMessage('breachCheck', 'error'));
    } finally {
      setIsCheckingBreach(false);
    }
  };

  const handleTryAgain = () => {
    setBreachResult(null);
    setEmail('');
    setEmailError('');
  };

  const renderBreachResults = () => {
    if (!breachResult) return null;

    return (
      <View style={[
        styles.resultContainer,
        { backgroundColor: breachResult.isBreached ? Colors.warningSoft : Colors.successSoft }
      ]}>
        <View style={styles.resultHeader}>
          <Ionicons 
            name={breachResult.isBreached ? "warning" : "shield-checkmark"} 
            size={Responsive.iconSizes.xlarge} 
            color={breachResult.isBreached ? Colors.warning : Colors.success} 
          />
          <Text style={styles.resultTitle}>
            {breachResult.isBreached ? CopywritingService.getValidationFeedback('breachCheck', 'breachesFound') : CopywritingService.getValidationFeedback('breachCheck', 'noBreaches')}
          </Text>
        </View>

        <Text style={styles.resultMessage}>
          {breachResult.message}
        </Text>

        {breachResult.isBreached && breachResult.breaches.length > 0 && (
          <View style={styles.breachesList}>
            <Text style={styles.breachesTitle}>Affected Services:</Text>
            <ScrollView style={styles.breachesScrollView} showsVerticalScrollIndicator={false}>
              {breachResult.breaches.map((breach, index) => (
                <View key={index} style={styles.breachItem}>
                  <Text style={styles.breachName}>{breach.name}</Text>
                  <Text style={styles.breachDetails}>
                    Date: {breach.date} • Records: {breach.records}
                  </Text>
                  {breach.dataTypes && breach.dataTypes.length > 0 && (
                    <Text style={styles.breachData}>
                      Data: {Array.isArray(breach.dataTypes) ? breach.dataTypes.join(', ') : breach.dataTypes}
                    </Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.resultActions}>
          {breachResult.isBreached && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                console.log('🔗 Navigating to breach response guide (guide-7)');
                if (navigation) {
                  navigation.navigate('GuideDetailScreen', { id: 'guide-7' });
                } else {
                  Alert.alert(
                    'Security Guide', 
                    'Please navigate to the Insights tab to access the breach response guide.',
                    [{ text: 'OK' }]
                  );
                }
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="shield-checkmark" size={Responsive.iconSizes.medium} color={Colors.textPrimary} />
              <Text style={styles.actionButtonText}>Secure My Accounts</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.continueStepButton}
            onPress={() => {
              console.log('✅ User confirmed breach check completion');
              onSubmit({
                email: email.trim(),
                breachResult: breachResult,
                timestamp: new Date().toISOString(),
                userConfirmed: true
              });
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.continueStepButtonText}>
              {breachResult.isBreached ? "I've Changed My Passwords" : "Continue"}
            </Text>
            <Ionicons name="arrow-forward" size={Responsive.iconSizes.medium} color={Colors.textPrimary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.tryAgainButton}
            onPress={handleTryAgain}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={Responsive.iconSizes.medium} color={Colors.accent} />
            <Text style={styles.tryAgainButtonText}>{CopywritingService.getValidationFeedback('breachCheck', 'checkEmail')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepDescription}>{step.description}</Text>
      </View>

      {!breachResult ? (
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Enter your email address</Text>
          <Text style={styles.inputSubtitle}>
            We'll check if your email appears in known data breaches
          </Text>
          
          <View style={styles.inputContainer}>
            <Ionicons 
              name="mail" 
              size={Responsive.iconSizes.medium} 
              color={emailError ? Colors.warning : Colors.textSecondary} 
              style={styles.inputIcon}
            />
            <TextInput
              style={[
                styles.emailInput,
                emailError && styles.emailInputError
              ]}
              value={email}
              onChangeText={handleEmailChange}
              placeholder="your.email@example.com"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isCheckingBreach}
            />
          </View>

          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.checkButton,
              (!email.trim() || emailError || isCheckingBreach) && styles.checkButtonDisabled
            ]}
            onPress={performBreachCheck}
            disabled={!email.trim() || emailError || isCheckingBreach}
            activeOpacity={0.8}
          >
            {isCheckingBreach ? (
              <>
                <ActivityIndicator size="small" color={Colors.textPrimary} />
                <Text style={styles.checkButtonText}>Checking...</Text>
              </>
            ) : (
              <>
                <Ionicons name="search" size={Responsive.iconSizes.medium} color={Colors.textPrimary} />
                <Text style={styles.checkButtonText}>Check for Breaches</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.privacyNotice}>
            <Ionicons name="shield-checkmark" size={Responsive.iconSizes.small} color={Colors.accent} />
            <Text style={styles.privacyText}>
              Your email is securely checked against breach databases and not stored
            </Text>
          </View>
        </View>
      ) : (
        renderBreachResults()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: Responsive.spacing.lg,
  },
  stepHeader: {
    marginBottom: Responsive.spacing.xl,
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
  inputSection: {
    flex: 1,
  },
  inputLabel: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  inputSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Responsive.spacing.lg,
    lineHeight: Typography.sizes.sm * 1.4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Responsive.spacing.sm,
  },
  inputIcon: {
    marginLeft: Responsive.spacing.md,
  },
  emailInput: {
    flex: 1,
    paddingHorizontal: Responsive.spacing.md,
    paddingVertical: Responsive.padding.button,
    color: Colors.textPrimary,
    fontSize: Typography.sizes.md,
    minHeight: Responsive.inputHeight.medium,
  },
  emailInputError: {
    borderColor: Colors.warning,
  },
  errorText: {
    fontSize: Typography.sizes.sm,
    color: Colors.warning,
    marginBottom: Responsive.spacing.md,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: Responsive.borderRadius.medium,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    marginBottom: Responsive.spacing.lg,
    gap: Responsive.spacing.sm,
    minHeight: Responsive.buttonHeight.medium,
  },
  checkButtonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.6,
  },
  checkButtonText: {
    color: Colors.textPrimary,
    fontWeight: Typography.weights.semibold,
    fontSize: Typography.sizes.md,
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentSoft,
    borderRadius: Responsive.borderRadius.medium,
    padding: Responsive.spacing.md,
    gap: Responsive.spacing.sm,
  },
  privacyText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.sm * 1.3,
  },
  resultContainer: {
    flex: 1,
    borderRadius: Responsive.borderRadius.xlarge,
    padding: Responsive.padding.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: Responsive.spacing.md,
  },
  resultTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: Responsive.spacing.sm,
    textAlign: 'center',
  },
  resultMessage: {
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
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
  breachesScrollView: {
    maxHeight: 200,
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
  breachDetails: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Responsive.spacing.xs,
  },
  breachData: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  tryAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.medium,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.accent,
    gap: Responsive.spacing.sm,
    minHeight: Responsive.buttonHeight.medium,
  },
  tryAgainButtonText: {
    color: Colors.accent,
    fontWeight: Typography.weights.semibold,
    fontSize: Typography.sizes.md,
  },
  resultActions: {
    gap: Responsive.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.warning,
    borderRadius: Responsive.borderRadius.medium,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    gap: Responsive.spacing.sm,
    minHeight: Responsive.buttonHeight.medium,
  },
  actionButtonText: {
    color: Colors.textPrimary,
    fontWeight: Typography.weights.semibold,
    fontSize: Typography.sizes.md,
  },
  continueStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: Responsive.borderRadius.medium,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    gap: Responsive.spacing.sm,
    minHeight: Responsive.buttonHeight.medium,
  },
  continueStepButtonText: {
    color: Colors.textPrimary,
    fontWeight: Typography.weights.semibold,
    fontSize: Typography.sizes.md,
  },
});

export default BreachCheckStep;
