import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PasswordQuizScreen = ({ navigation, route }) => {
  const { category } = route.params || {};
  const [quizAnswers, setQuizAnswers] = useState({
    question1: null,
    question2: null,
  });

  const quizQuestions = [
    {
      id: 1,
      question: 'What is the minimum recommended length for a strong password?',
      options: ['8 characters', '12 characters', '6 characters', '16 characters'],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: 'Which of these is the strongest password approach?',
      options: ['Using your pet\'s name', 'A random mix of letters and numbers', 'A memorable passphrase with variations', 'Your birthday with symbols'],
      correctAnswer: 2,
    },
  ];

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const savedProgress = await AsyncStorage.getItem('strong_passwords_progress');
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setQuizAnswers(progress.quizAnswers || quizAnswers);
      }
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  };

  const saveProgress = async () => {
    try {
      const existingProgress = await AsyncStorage.getItem('strong_passwords_progress');
      const progress = existingProgress ? JSON.parse(existingProgress) : {};
      
      const updatedProgress = {
        ...progress,
        quizAnswers,
        completedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('strong_passwords_progress', JSON.stringify(updatedProgress));
    } catch (error) {
      console.log('Error saving progress:', error);
    }
  };

  const selectQuizAnswer = (questionId, answerIndex) => {
    setQuizAnswers(prev => ({
      ...prev,
      [`question${questionId}`]: answerIndex,
    }));
    saveProgress();
  };

  const handleNext = () => {
    navigation.navigate('PasswordPracticeScreen', { category });
  };

  const answeredCount = Object.values(quizAnswers).filter(answer => answer !== null).length;
  const totalQuestions = quizQuestions.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a365d" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quick Quiz</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Quiz</Text>
            <Text style={styles.sectionSubtitle}>Test your knowledge:</Text>
            
            {quizQuestions.map((question, index) => (
              <View key={question.id} style={styles.quizQuestion}>
                <Text style={styles.quizQuestionText}>{question.question}</Text>
                
                {question.options.map((option, optionIndex) => (
                  <TouchableOpacity
                    key={optionIndex}
                    style={[
                      styles.quizOption,
                      quizAnswers[`question${question.id}`] === optionIndex && styles.quizOptionSelected
                    ]}
                    onPress={() => selectQuizAnswer(question.id, optionIndex)}
                    activeOpacity={0.8}
                  >
                    <Text style={[
                      styles.quizOptionText,
                      quizAnswers[`question${question.id}`] === optionIndex && styles.quizOptionTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Progress and Next Button */}
      <View style={styles.footer}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {answeredCount} of {totalQuestions} questions answered
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(answeredCount / totalQuestions) * 100}%` }
              ]} 
            />
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>Continue to Practice</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2d5a87',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2d5a87',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#2d5a87',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#a0aec0',
    marginBottom: 16,
    lineHeight: 20,
  },
  quizQuestion: {
    marginBottom: 20,
  },
  quizQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
    lineHeight: 22,
  },
  quizOption: {
    backgroundColor: '#4a5568',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  quizOptionSelected: {
    backgroundColor: '#4a90e2',
    borderColor: '#4a90e2',
  },
  quizOptionText: {
    fontSize: 16,
    color: '#e2e8f0',
  },
  quizOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#2d5a87',
    backgroundColor: '#1a365d',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#a0aec0',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#2d5a87',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4a90e2',
    borderRadius: 3,
  },
  nextButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default PasswordQuizScreen; 