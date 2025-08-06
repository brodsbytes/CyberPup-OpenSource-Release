import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const LessonScreen = ({ navigation, route }) => {
  const { module, category } = route.params || {};
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [moduleCompleted, setModuleCompleted] = useState(false);

  // Sample step data - in a real app, this would come from an API or database
  const getStepsForModule = (moduleId) => {
    const stepsData = {
      '1-1': [ // Creating Strong Passwords
        {
          id: '1-1-1',
          title: 'Understanding Password Strength',
          content: 'A strong password is your first line of defense against cyber attacks. It should be at least 12 characters long and include a mix of uppercase letters, lowercase letters, numbers, and special characters. Avoid using personal information like your name, birthday, or common words that can be easily guessed.',
          type: 'instruction',
        },
        {
          id: '1-1-2',
          title: 'Password Creation Techniques',
          content: 'Try using a passphrase instead of a single word. For example, "My favorite color is blue!" becomes "MfciB!2024". You can also use the first letter of each word in a memorable sentence. Another technique is to use a combination of random words with numbers and symbols.',
          type: 'instruction',
        },
        {
          id: '1-1-3',
          title: 'Practice: Create a Strong Password',
          content: 'Now it\'s your turn! Create a strong password using the techniques you just learned. Remember: at least 12 characters, mix of character types, and avoid personal information. Write it down temporarily to practice the technique.',
          type: 'exercise',
        },
        {
          id: '1-1-4',
          title: 'Password Security Checklist',
          content: 'Before you finish, let\'s review: ✓ Your password is at least 12 characters long ✓ It includes uppercase and lowercase letters ✓ It includes numbers and special characters ✓ It doesn\'t contain personal information ✓ It\'s not a common word or phrase',
          type: 'checklist',
        },
      ],
      '1-2': [ // Password Managers
        {
          id: '1-2-1',
          title: 'Why Use a Password Manager?',
          content: 'Password managers securely store all your passwords in one place, generate strong passwords for you, and automatically fill them in when you visit websites. This eliminates the need to remember dozens of complex passwords and ensures each account has a unique, strong password.',
          type: 'instruction',
        },
        {
          id: '1-2-2',
          title: 'Popular Password Manager Options',
          content: 'Some popular options include LastPass, 1Password, Bitwarden, and Dashlane. Most offer free versions with basic features and premium versions with advanced security features like secure sharing and emergency access.',
          type: 'instruction',
        },
        {
          id: '1-2-3',
          title: 'Setting Up Your First Password Manager',
          content: 'Download your chosen password manager, create a master password (make this one extra strong!), and start by adding your most important accounts like email and banking. Take your time to explore the features and settings.',
          type: 'instruction',
        },
        {
          id: '1-2-4',
          title: 'Security Best Practices',
          content: 'Never share your master password, enable two-factor authentication on your password manager account, and regularly backup your password database. Consider using a passphrase for your master password instead of a single word.',
          type: 'instruction',
        },
        {
          id: '1-2-5',
          title: 'Practice: Set Up Password Manager',
          content: 'Choose a password manager and begin the setup process. Create a strong master password and add at least one account. This hands-on practice will help you become comfortable with using a password manager.',
          type: 'exercise',
        },
      ],
      // Add more step data for other modules as needed
    };

    return stepsData[moduleId] || [
      {
        id: 'default-1',
        title: 'Step Content Coming Soon',
        content: 'This step content is being prepared. Check back soon for interactive learning materials.',
        type: 'instruction',
      },
    ];
  };

  const steps = getStepsForModule(module?.id);
  const currentStep = steps[currentStepIndex];

  // Load completed steps from storage on component mount
  useEffect(() => {
    loadCompletedSteps();
  }, []);

  // Save completed steps to storage whenever they change
  useEffect(() => {
    saveCompletedSteps();
  }, [completedSteps]);

  const loadCompletedSteps = async () => {
    try {
      const stored = await AsyncStorage.getItem(`module_${module?.id}_completed_steps`);
      if (stored) {
        setCompletedSteps(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Error loading completed steps:', error);
    }
  };

  const saveCompletedSteps = async () => {
    try {
      await AsyncStorage.setItem(`module_${module?.id}_completed_steps`, JSON.stringify(completedSteps));
    } catch (error) {
      console.log('Error saving completed steps:', error);
    }
  };

  const markModuleAsCompleted = async () => {
    try {
      await AsyncStorage.setItem(`module_${module?.id}_completed`, 'true');
      setModuleCompleted(true);
    } catch (error) {
      console.log('Error marking module as completed:', error);
    }
  };

  const handleStepComplete = () => {
    const stepId = currentStep.id;
    if (!completedSteps.includes(stepId)) {
      const newCompletedSteps = [...completedSteps, stepId];
      setCompletedSteps(newCompletedSteps);
      
      // Check if this was the final step
      if (currentStepIndex === steps.length - 1) {
        markModuleAsCompleted();
        Alert.alert(
          'Module Completed!',
          'Congratulations! You have completed this module.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Final step - go back to module list
      navigation.goBack();
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const isStepCompleted = (stepId) => completedSteps.includes(stepId);
  const isCurrentStepCompleted = isStepCompleted(currentStep?.id);

  const renderStepContent = () => {
    switch (currentStep?.type) {
      case 'exercise':
        return (
          <View style={styles.exerciseContainer}>
            <Text style={styles.exerciseTitle}>Practice Exercise</Text>
            <Text style={styles.exerciseContent}>{currentStep.content}</Text>
            <View style={styles.exerciseNote}>
              <Text style={styles.exerciseNoteText}>
                💡 Take your time with this exercise. Learning by doing is the best way to master these concepts.
              </Text>
            </View>
          </View>
        );
      case 'checklist':
        return (
          <View style={styles.checklistContainer}>
            <Text style={styles.checklistTitle}>Review Checklist</Text>
            <Text style={styles.checklistContent}>{currentStep.content}</Text>
            <View style={styles.checklistNote}>
              <Text style={styles.checklistNoteText}>
                ✅ Review each item carefully before marking this step as complete.
              </Text>
            </View>
          </View>
        );
      default:
        return (
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionContent}>{currentStep?.content}</Text>
          </View>
        );
    }
  };

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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{module?.title || 'Lesson'}</Text>
          <Text style={styles.headerSubtitle}>
            Step {currentStepIndex + 1} of {steps.length}
          </Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentStepIndex + 1) / steps.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(((currentStepIndex + 1) / steps.length) * 100)}% Complete
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Step Title */}
          <Text style={styles.stepTitle}>{currentStep?.title}</Text>
          
          {/* Step Content */}
          {renderStepContent()}

          {/* Step Completion */}
          <View style={styles.completionSection}>
            <TouchableOpacity
              style={[
                styles.completionButton,
                isCurrentStepCompleted && styles.completionButtonCompleted
              ]}
              onPress={handleStepComplete}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.completionButtonText,
                isCurrentStepCompleted && styles.completionButtonTextCompleted
              ]}>
                {isCurrentStepCompleted ? '✓ Step Completed' : 'Mark Step as Complete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.prevButton,
            currentStepIndex === 0 && styles.disabledButton
          ]}
          onPress={handlePreviousStep}
          disabled={currentStepIndex === 0}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.navButtonText,
            currentStepIndex === 0 && styles.disabledButtonText
          ]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            !isCurrentStepCompleted && styles.disabledButton
          ]}
          onPress={handleNextStep}
          disabled={!isCurrentStepCompleted}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.navButtonText,
            !isCurrentStepCompleted && styles.disabledButtonText
          ]}>
            {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#a0aec0',
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#2d5a87',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#1a365d',
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
    fontWeight: '600',
    color: '#4a90e2',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 24,
    lineHeight: 32,
  },
  instructionContainer: {
    backgroundColor: '#2d5a87',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  instructionContent: {
    fontSize: 16,
    color: '#e2e8f0',
    lineHeight: 24,
  },
  exerciseContainer: {
    backgroundColor: '#2d5a87',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  exerciseTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  exerciseContent: {
    fontSize: 16,
    color: '#e2e8f0',
    lineHeight: 24,
    marginBottom: 16,
  },
  exerciseNote: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
  },
  exerciseNoteText: {
    fontSize: 14,
    color: '#a0aec0',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  checklistContainer: {
    backgroundColor: '#2d5a87',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  checklistTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  checklistContent: {
    fontSize: 16,
    color: '#e2e8f0',
    lineHeight: 24,
    marginBottom: 16,
  },
  checklistNote: {
    backgroundColor: 'rgba(56, 161, 105, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#38a169',
  },
  checklistNoteText: {
    fontSize: 14,
    color: '#a0aec0',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  completionSection: {
    marginTop: 16,
  },
  completionButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4a90e2',
  },
  completionButtonCompleted: {
    backgroundColor: '#38a169',
    borderColor: '#38a169',
  },
  completionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  completionButtonTextCompleted: {
    color: '#ffffff',
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
  navButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  prevButton: {
    backgroundColor: '#2d5a87',
  },
  disabledButton: {
    backgroundColor: '#4a5568',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  disabledButtonText: {
    color: '#a0aec0',
  },
});

export default LessonScreen; 