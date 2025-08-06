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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const InitialAuditScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [firstName, setFirstName] = useState('');
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
      color: '#4a90e2',
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
    if (currentStep === 0 && !firstName.trim()) {
      Alert.alert('Please enter your first name');
      return;
    }
    
    if (currentStep <= auditQuestions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateRecommendation = () => {
    const categoryScores = {};
    
    console.log('Calculating recommendation with answers:', answers);
    
    // Calculate scores for each category
    auditQuestions.forEach(question => {
      const answer = answers[question.id];
      console.log(`Question ${question.id}: ${answer}, Category: ${question.category}, Weight: ${question.weight}`);
      if (answer === false) { // Only count "No" answers as areas needing improvement
        if (!categoryScores[question.category]) {
          categoryScores[question.category] = 0;
        }
        categoryScores[question.category] += question.weight;
      }
    });

    console.log('Category scores:', categoryScores);

    // Find category with highest score (most areas needing improvement)
    let recommendedCategory = 'password_security'; // Default
    let highestScore = 0;

    Object.entries(categoryScores).forEach(([category, score]) => {
      if (score > highestScore) {
        highestScore = score;
        recommendedCategory = category;
      }
    });

    console.log('Recommended category:', recommendedCategory, 'with score:', highestScore);
    return categoryRecommendations[recommendedCategory];
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Save audit data
      const auditData = {
        firstName: firstName.trim(),
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

  const renderNameStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Welcome to CyberPup!</Text>
      <Text style={styles.stepDescription}>
        Let's start with a quick security assessment to personalize your learning experience.
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>What's your first name?</Text>
        <TextInput
          style={styles.textInput}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter your first name"
          placeholderTextColor="#a0aec0"
          autoFocus
          autoCapitalize="words"
        />
      </View>
    </View>
  );

  const renderQuestionStep = () => {
    const question = auditQuestions[currentStep - 1];
    const currentAnswer = answers[question.id];

    return (
      <View style={styles.stepContainer}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(currentStep / auditQuestions.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep} of {auditQuestions.length}
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
    console.log('Recommendation calculated:', recommendation);
    console.log('Current step:', currentStep);
    console.log('Answers:', answers);
    
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
      <StatusBar barStyle="light-content" backgroundColor="#1a365d" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Security Assessment</Text>
        {currentStep > 0 && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.replace('Welcome')}
            activeOpacity={0.8}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {console.log('Rendering step:', currentStep, 'Questions length:', auditQuestions.length)}
          {currentStep === 0 && renderNameStep()}
          {currentStep > 0 && currentStep <= auditQuestions.length && renderQuestionStep()}
          {currentStep > auditQuestions.length && renderRecommendationStep()}
        </View>
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.nextButton,
            isSubmitting && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {isSubmitting ? 'Saving...' : 
             currentStep === 0 ? 'Start Assessment' :
             currentStep <= auditQuestions.length ? 'Next' : 'Get Started'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a365d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2d5a87',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#a0aec0',
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
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#a0aec0',
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
    color: '#ffffff',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#2d5a87',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#4a90e2',
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2d5a87',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4a90e2',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#a0aec0',
    textAlign: 'center',
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
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
    backgroundColor: '#2d5a87',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  answerButtonSelected: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  answerButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  answerButtonTextSelected: {
    color: '#ffffff',
  },
  recommendationCard: {
    backgroundColor: '#2d5a87',
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
    color: '#ffffff',
    marginBottom: 8,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#a0aec0',
    lineHeight: 20,
  },
  recommendationNote: {
    fontSize: 14,
    color: '#a0aec0',
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
    borderTopColor: '#2d5a87',
    backgroundColor: '#1a365d',
  },
  backButton: {
    backgroundColor: '#2d5a87',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  nextButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#4a5568',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default InitialAuditScreen; 