import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../theme';

const { width } = Dimensions.get('window');

const InitialAuditScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const auditQuestions = [
    {
      id: 'password_manager',
      question: 'Do you use a password manager?',
      category: 'password_security',
      weight: 3,
    },
    {
      id: 'strong_passwords',
      question: 'Do you use strong, unique passwords for each account?',
      category: 'password_security',
      weight: 2,
    },
    {
      id: 'two_factor',
      question: 'Do you have two-factor authentication enabled on important accounts?',
      category: 'password_security',
      weight: 2,
    },
    {
      id: 'phishing_awareness',
      question: 'Do you know how to identify phishing emails?',
      category: 'phishing_awareness',
      weight: 2,
    },
    {
      id: 'device_updates',
      question: 'Do you keep your devices and software updated?',
      category: 'device_security',
      weight: 2,
    },
    {
      id: 'social_media_privacy',
      question: 'Do you regularly review your social media privacy settings?',
      category: 'privacy_social',
      weight: 1,
    },
    {
      id: 'financial_security',
      question: 'Do you monitor your financial accounts for suspicious activity?',
      category: 'financial_security',
      weight: 2,
    },
  ];

  const categoryRecommendations = {
    password_security: {
      id: 1,
      title: 'Password Security & Authentication',
      icon: '🔐',
      color: Colors.accent,
      description: 'Start here to master password security and protect your accounts.',
    },
    phishing_awareness: {
      id: 2,
      title: 'Phishing & Scam Awareness',
      icon: '🎣',
      color: '#e74c3c',
      description: 'Learn to spot and avoid phishing attempts and scams.',
    },
    device_security: {
      id: 3,
      title: 'Device & Network Security',
      icon: '🛡️',
      color: '#27ae60',
      description: 'Secure your devices and home network from threats.',
    },
    privacy_social: {
      id: 4,
      title: 'Online Privacy & Social Media',
      icon: '🔒',
      color: '#9b59b6',
      description: 'Protect your privacy and manage your digital footprint.',
    },
    financial_security: {
      id: 5,
      title: 'Secure Finances & Identity Protection',
      icon: '💰',
      color: '#f39c12',
      description: 'Safeguard your financial information and prevent identity theft.',
    },
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (currentStep === 0) {
      // Welcome step -> Assessment intro
      setCurrentStep(1);
    } else if (currentStep === 1) {
      // Assessment intro -> First question
      setCurrentStep(2);
    } else if (currentStep > 1 && currentStep <= auditQuestions.length + 1) {
      // Questions -> Next question or recommendation
      setCurrentStep(currentStep + 1);
    } else if (currentStep === auditQuestions.length + 2) {
      // Recommendation step -> Submit and go to welcome
      handleSubmit();
    }
  };

  const canProceed = () => {
    if (currentStep === 0 || currentStep === 1 || currentStep === auditQuestions.length + 2) {
      // Welcome, intro, and recommendation steps can always proceed
      return true;
    } else if (currentStep > 1 && currentStep <= auditQuestions.length + 1) {
      // Question steps - check if current question has been answered
      const question = auditQuestions[currentStep - 2];
      return answers[question.id] !== undefined;
    }
    return true;
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateRecommendation = () => {
    const categoryScores = {};
    

    
    // Calculate scores for each category
    auditQuestions.forEach(question => {
      const answer = answers[question.id];
      
      if (answer === false) { // Only count "No" answers as areas needing improvement
        if (!categoryScores[question.category]) {
          categoryScores[question.category] = 0;
        }
        categoryScores[question.category] += question.weight;
      }
    });

    

    // Find category with highest score (most areas needing improvement)
    let recommendedCategory = 'password_security'; // Default
    let highestScore = 0;

    Object.entries(categoryScores).forEach(([category, score]) => {
      if (score > highestScore) {
        highestScore = score;
        recommendedCategory = category;
      }
    });

    
    return categoryRecommendations[recommendedCategory];
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Save audit data
      const auditData = {
        answers,
        completedAt: new Date().toISOString(),
        recommendedCategory: calculateRecommendation(),
      };
      
      await AsyncStorage.setItem('user_audit_data', JSON.stringify(auditData));
      await AsyncStorage.setItem('audit_completed', 'true');
      
      // Navigate to welcome screen
      navigation.replace('Welcome');
    } catch (error) {
      console.log('Error saving audit data:', error);
      Alert.alert('Error', 'Failed to save your responses. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    try {
      // Save that the audit was skipped
      await AsyncStorage.setItem('audit_completed', 'true');
      await AsyncStorage.setItem('audit_skipped', 'true');
      
      // Navigate to welcome screen
      navigation.replace('Welcome');
    } catch (error) {
      console.log('Error saving skip status:', error);
      // Still navigate even if save fails
      navigation.replace('Welcome');
    }
  };

  const renderWelcomeStep = () => (
    <View style={styles.stepContainer}>
      {/* Cyber Dog Mascot */}
      <View style={styles.mascotContainer}>
        <View style={styles.mascotWrapper}>
          <Image
            source={require('../assets/images/cyberpup-mascot.png')}
            style={styles.mascotImage}
            resizeMode="contain"
          />
        </View>
      </View>
      
      <Text style={styles.stepTitle}>Hey there, I'm CyberPup!</Text>
      <Text style={styles.stepDescription}>
        I'm your personal Cybersecurity coach. I'll be with you along this journey to help you become more secure.
      </Text>
    </View>
  );

  const renderAssessmentIntroStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Ready to Begin?</Text>
      <Text style={styles.stepDescription}>
        Let's start with a few quick questions so we know how to prioritize your Cybersecurity health check.
      </Text>
    </View>
  );

  const renderQuestionStep = () => {
    const question = auditQuestions[currentStep - 2]; // Adjust for the new intermediate step
    const currentAnswer = answers[question.id];

    return (
      <View style={styles.stepContainer}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStep - 1) / auditQuestions.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep - 1} of {auditQuestions.length}
          </Text>
        </View>

        <Text style={styles.questionTitle}>{question.question}</Text>
        
        <View style={styles.answerButtons}>
          <TouchableOpacity
            style={[
              styles.answerButton,
              currentAnswer === true && styles.answerButtonSelected
            ]}
            onPress={() => handleAnswer(question.id, true)}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.answerButtonText,
              currentAnswer === true && styles.answerButtonTextSelected
            ]}>
              Yes
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.answerButton,
              currentAnswer === false && styles.answerButtonSelected
            ]}
            onPress={() => handleAnswer(question.id, false)}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.answerButtonText,
              currentAnswer === false && styles.answerButtonTextSelected
            ]}>
              No
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderRecommendationStep = () => {
    const recommendation = calculateRecommendation();
    
    
    return (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Your Personalized Recommendation</Text>
        <Text style={styles.stepDescription}>
          Based on your responses, we recommend starting with:
        </Text>
        
        <View style={styles.recommendationCard}>
          <View style={[styles.recommendationIcon, { backgroundColor: recommendation.color }]}>
            <Text style={styles.recommendationIconText}>{recommendation.icon}</Text>
          </View>
          <View style={styles.recommendationContent}>
            <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
            <Text style={styles.recommendationDescription}>
              {recommendation.description}
            </Text>
          </View>
        </View>
        
        <Text style={styles.recommendationNote}>
          Don't worry - you can explore all categories and learn at your own pace!
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}></Text>
        {currentStep > 0 && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.8}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
    
          {currentStep === 0 && renderWelcomeStep()}
          {currentStep === 1 && renderAssessmentIntroStep()}
          {currentStep > 1 && currentStep <= auditQuestions.length + 1 && renderQuestionStep()}
          {currentStep === auditQuestions.length + 2 && renderRecommendationStep()}
        </View>
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.fullWidthFooter}>
        <TouchableOpacity
          style={[
            styles.fullWidthButton,
            (isSubmitting || !canProceed()) && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={isSubmitting || !canProceed()}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {isSubmitting ? 'Saving...' : 
             currentStep === 0 ? 'Start Assessment' :
             currentStep === auditQuestions.length + 2 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  stepContainer: {
    minHeight: 400,
    justifyContent: 'center',
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  mascotWrapper: {
    width: 266,
    height: 266,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotImage: {
    width: 266,
    height: 266,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.track,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 32,
  },
  answerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  answerButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  answerButtonSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  answerButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  answerButtonTextSelected: {
    color: Colors.textPrimary,
  },
  recommendationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  recommendationIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recommendationIconText: {
    fontSize: 24,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  recommendationDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  recommendationNote: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  fullWidthFooter: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  backButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  nextButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  fullWidthButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  nextButtonDisabled: {
    backgroundColor: Colors.track,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});

export default InitialAuditScreen; 