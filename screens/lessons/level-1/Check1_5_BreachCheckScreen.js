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
  const [scaleAnim] = useState(new Animated.Value(1));
  const [showExitModal, setShowExitModal] = useState(false);
  
  // Breach check specific state
  const [email, setEmail] = useState('');
  const [isCheckingBreach, setIsCheckingBreach] = useState(false);
  const [breachResult, setBreachResult] = useState(null);
  const [showBreachModal, setShowBreachModal] = useState(false);
  
  // Password manager guidance state
  const [selectedPasswordManager, setSelectedPasswordManager] = useState('');
  const [showGuidanceModal, setShowGuidanceModal] = useState(false);

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
        console.log('📊 Loaded progress data:', { isCompleted: data.isCompleted, checklistItems: data.checklistItems?.length });
      }
      
      // Also check the completion status directly
      if (completedData === 'completed') {
        console.log('✅ Check 1.1.5 is marked as completed in storage');
        setIsCompleted(true);
      }
      
      // Load password manager data from Check 1.3
      const pmProgressData = await AsyncStorage.getItem('check_1-1-3_progress');
      if (pmProgressData) {
        const pmData = JSON.parse(pmProgressData);
        setSelectedPasswordManager(pmData.selectedPasswordManager || '');
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
    
    Alert.alert(
      '🎉 Check Complete!',
      'Great job! You\'ve checked for data breaches and secured any compromised accounts. This is a crucial step in protecting your digital identity.',
      [
        {
          text: 'Continue to Next Area',
          onPress: async () => {
            console.log('🚀 Navigating to Check 1.2.1');
            // Navigate to the next area (Secure Your Devices)
            navigation.navigate('Check1_2_1_ScreenLockScreen');
          },
        },
        {
          text: 'Go Back',
          style: 'cancel',
          onPress: async () => {
            console.log('🏠 Navigating back to Welcome');
            // Force refresh of WelcomeScreen progress
            navigation.navigate('Welcome');
          },
        },
      ]
    );
  };

  const checkBreach = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsCheckingBreach(true);
    
    try {
      // Simulate API call to breach checker
      // In a real app, this would call a service like HaveIBeenPwned API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate different results based on email
      const isBreached = email.includes('test') || email.includes('demo');
      const result = {
        isBreached,
        breaches: isBreached ? [
          { name: 'Test Breach 2023', date: '2023-06-15', severity: 'Medium' },
          { name: 'Demo Data Leak 2022', date: '2022-11-03', severity: 'Low' }
        ] : [],
        message: isBreached 
          ? 'Your email was found in 2 data breaches. We recommend changing your passwords immediately.'
          : 'Good news! Your email was not found in any known data breaches.'
      };
      
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
      Alert.alert('Error', 'Unable to check for breaches. Please try again.');
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

  // Password manager guidance functions
  const getPasswordManagerGuidance = () => {
    const guidance = {
      '1password': {
        title: '1Password Password Change Guide',
        steps: [
          'Open 1Password and go to the affected website',
          'Click the 1Password extension icon in your browser',
          'Select "Generate Password" to create a strong passphrase',
          'Use the generated password to update your account',
          '1Password will automatically save the new password',
          'Repeat for all affected accounts from the breach'
        ],
        tips: [
          'Use 1Password\'s "Watchtower" feature to monitor for breaches',
          'Enable 2FA on all accounts after changing passwords',
          'Consider using passphrases for better security'
        ]
      },
      'bitwarden': {
        title: 'Bitwarden Password Change Guide',
        steps: [
          'Open Bitwarden and navigate to the affected website',
          'Click the Bitwarden extension icon in your browser',
          'Use the password generator to create a strong passphrase',
          'Update your account with the new password',
          'Bitwarden will prompt to save the updated credentials',
          'Repeat for all affected accounts from the breach'
        ],
        tips: [
          'Use Bitwarden\'s "Security Report" to check for weak passwords',
          'Enable 2FA on all accounts after changing passwords',
          'Consider using passphrases for better security'
        ]
      },
      'lastpass': {
        title: 'LastPass Password Change Guide',
        steps: [
          'Open LastPass and go to the affected website',
          'Click the LastPass extension icon in your browser',
          'Use the password generator to create a strong passphrase',
          'Update your account with the new password',
          'LastPass will automatically save the new credentials',
          'Repeat for all affected accounts from the breach'
        ],
        tips: [
          'Use LastPass\'s "Security Challenge" to identify weak passwords',
          'Enable 2FA on all accounts after changing passwords',
          'Consider using passphrases for better security'
        ]
      },
      'dashlane': {
        title: 'Dashlane Password Change Guide',
        steps: [
          'Open Dashlane and navigate to the affected website',
          'Click the Dashlane extension icon in your browser',
          'Use the password generator to create a strong passphrase',
          'Update your account with the new password',
          'Dashlane will prompt to save the updated credentials',
          'Repeat for all affected accounts from the breach'
        ],
        tips: [
          'Use Dashlane\'s "Password Health" feature to monitor security',
          'Enable 2FA on all accounts after changing passwords',
          'Consider using passphrases for better security'
        ]
      },
      'nordpass': {
        title: 'NordPass Password Change Guide',
        steps: [
          'Open NordPass and go to the affected website',
          'Click the NordPass extension icon in your browser',
          'Use the password generator to create a strong passphrase',
          'Update your account with the new password',
          'NordPass will automatically save the new credentials',
          'Repeat for all affected accounts from the breach'
        ],
        tips: [
          'Use NordPass\'s "Password Health" feature to check security',
          'Enable 2FA on all accounts after changing passwords',
          'Consider using passphrases for better security'
        ]
      },
      'keeper': {
        title: 'Keeper Password Change Guide',
        steps: [
          'Open Keeper and navigate to the affected website',
          'Click the Keeper extension icon in your browser',
          'Use the password generator to create a strong passphrase',
          'Update your account with the new password',
          'Keeper will prompt to save the updated credentials',
          'Repeat for all affected accounts from the breach'
        ],
        tips: [
          'Use Keeper\'s "Security Audit" feature to identify weak passwords',
          'Enable 2FA on all accounts after changing passwords',
          'Consider using passphrases for better security'
        ]
      },
      'roboform': {
        title: 'RoboForm Password Change Guide',
        steps: [
          'Open RoboForm and go to the affected website',
          'Click the RoboForm extension icon in your browser',
          'Use the password generator to create a strong passphrase',
          'Update your account with the new password',
          'RoboForm will automatically save the new credentials',
          'Repeat for all affected accounts from the breach'
        ],
        tips: [
          'Use RoboForm\'s "Security Center" to monitor password strength',
          'Enable 2FA on all accounts after changing passwords',
          'Consider using passphrases for better security'
        ]
      }
    };
    
    return guidance[selectedPasswordManager] || {
      title: 'General Password Change Guide',
      steps: [
        'Open your password manager and go to the affected website',
        'Use your password manager\'s generator to create a strong passphrase',
        'Update your account with the new password',
        'Save the new credentials in your password manager',
        'Repeat for all affected accounts from the breach'
      ],
      tips: [
        'Use your password manager\'s security features to monitor for weak passwords',
        'Enable 2FA on all accounts after changing passwords',
        'Consider using passphrases for better security'
      ]
    };
  };

  const handleShowGuidance = () => {
    setShowBreachModal(false);
    setShowGuidanceModal(true);
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
        <Text style={styles.headerTitle}>Check 1.5</Text>
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
            {/* Close Button */}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowExitModal(false)}
            >
              <Ionicons name="close" size={Responsive.iconSizes.large} color={Colors.textPrimary} />
            </TouchableOpacity>

            {/* Sad Character */}
            <View style={styles.modalCharacter}>
              <Text style={styles.characterText}>😢</Text>
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>Wait, don't go!</Text>

            {/* Message */}
            <Text style={styles.modalMessage}>
              You're doing well! If you quit now, you'll lose your progress for this lesson.
            </Text>

            {/* Action Buttons */}
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
                    <Text style={styles.breachDate}>{breach.date}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.breachModalButtons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  if (breachResult?.isBreached) {
                    handleShowGuidance();
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

      {/* Password Manager Guidance Modal */}
      <Modal
        visible={showGuidanceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGuidanceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.guidanceModalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowGuidanceModal(false)}
            >
              <Ionicons name="close" size={Responsive.iconSizes.large} color={Colors.textPrimary} />
            </TouchableOpacity>

            <ScrollView style={styles.guidanceScrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.guidanceHeader}>
                <Ionicons name="shield-checkmark" size={Responsive.iconSizes.xxlarge} color={Colors.accent} />
                <Text style={styles.guidanceTitle}>
                  {getPasswordManagerGuidance().title}
                </Text>
              </View>

              <Text style={styles.guidanceMessage}>
                Don't worry! Changing passwords after a breach is a normal part of digital security. 
                This process will take some time, but your password manager will make it much easier. 
                Here's how to update your passwords securely:
              </Text>

              <View style={styles.stepsSection}>
                <Text style={styles.stepsTitle}>Step-by-Step Instructions:</Text>
                {getPasswordManagerGuidance().steps.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.tipsSection}>
                <Text style={styles.tipsTitle}>💡 Security Tips:</Text>
                {getPasswordManagerGuidance().tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={Responsive.iconSizes.small} color={Colors.accent} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.encouragementSection}>
                <Text style={styles.encouragementTitle}>You've Got This! 💪</Text>
                <Text style={styles.encouragementText}>
                  Changing passwords after a breach is one of the most important security steps you can take. 
                  Your password manager will handle the complexity, so you can focus on staying secure. 
                  Take your time and be thorough - your future self will thank you!
                </Text>
              </View>
            </ScrollView>

            <View style={styles.guidanceModalButtons}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  setShowGuidanceModal(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>I'll Start Changing My Passwords</Text>
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

          {/* Learn More Section */}
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={() => setShowLearnMore(!showLearnMore)}
            activeOpacity={0.8}
          >
            <Text style={styles.learnMoreText}>Why check for data breaches?</Text>
            <Ionicons
              name={showLearnMore ? 'chevron-up' : 'chevron-down'}
              size={Responsive.iconSizes.medium}
              color={Colors.accent}
            />
          </TouchableOpacity>

          {showLearnMore && (
            <View style={styles.learnMoreContent}>
              <Text style={styles.learnMoreTitle}>Data Breach Risks</Text>
              <Text style={styles.learnMoreBody}>
                • Stolen passwords can be used to access your accounts{'\n'}
                • Personal information can be used for identity theft{'\n'}
                • Breached data is often sold on the dark web{'\n'}
                • Early detection helps minimize damage{'\n'}
                • Regular checks help you stay ahead of threats
              </Text>
            </View>
          )}

          {/* Breach Checker Section */}
          <View style={styles.breachCheckerSection}>
            <Text style={styles.breachCheckerTitle}>Check Your Email</Text>
            <Text style={styles.breachCheckerSubtitle}>
              Enter your email address to check if it appears in known data breaches
            </Text>
            
            <View style={styles.emailInputContainer}>
              <TextInput
                style={styles.emailInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email address"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[
                  styles.checkButton,
                  (!email || isCheckingBreach) && styles.checkButtonDisabled
                ]}
                onPress={checkBreach}
                disabled={!email || isCheckingBreach}
                activeOpacity={0.8}
              >
                {isCheckingBreach ? (
                  <ActivityIndicator size="small" color={Colors.textPrimary} />
                ) : (
                  <Text style={styles.checkButtonText}>Check</Text>
                )}
              </TouchableOpacity>
            </View>

            {breachResult && (
              <View style={[
                styles.breachResultCard,
                { backgroundColor: breachResult.isBreached ? Colors.warningSoft : Colors.accentSoft }
              ]}>
                <Ionicons 
                  name={breachResult.isBreached ? "warning" : "checkmark-circle"} 
                  size={Responsive.iconSizes.large} 
                  color={breachResult.isBreached ? Colors.warning : Colors.accent} 
                />
                <Text style={styles.breachResultText}>
                  {breachResult.message}
                </Text>
              </View>
            )}
          </View>

          {/* Checklist Section */}
          <View style={styles.checklistSection}>
            <Text style={styles.checklistTitle}>Breach Response Checklist</Text>
            <Text style={styles.checklistSubtitle}>
              Complete these steps to secure any compromised accounts
            </Text>
            
            {checklistItems.map(renderChecklistItem)}
          </View>

          {/* Tips Section */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>💡 Security Tips</Text>
            <View style={styles.tipItem}>
              <Ionicons name="shield-checkmark" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Check for breaches regularly, especially after major incidents</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="key" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Use unique passwords for each account to limit damage</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="notifications" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Enable breach notifications on your password manager</Text>
            </View>
          </View>

          {/* Completion Status */}
          {isCompleted && (
            <View style={styles.completionCard}>
              <Ionicons name="checkmark-circle" size={Responsive.iconSizes.xxlarge} color={Colors.accent} />
              <Text style={styles.completionTitle}>Check Complete!</Text>
              <Text style={styles.completionText}>
                You've successfully checked for data breaches and secured any compromised accounts. Great job protecting your digital identity!
              </Text>
              
              <TouchableOpacity
                style={styles.continueButton}
                onPress={async () => {
                  console.log('🔘 Continue button pressed in completion card');
                  // Ensure completion is saved before navigating
                  await saveProgress(checklistItems, true);
                  navigation.navigate('Check1_2_1_ScreenLockScreen');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.continueButtonText}>Continue to Next Area</Text>
                <Ionicons name="arrow-forward" size={Responsive.iconSizes.medium} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          )}
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
  // Guidance Modal Styles
  guidanceModalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.xxlarge,
    marginHorizontal: Responsive.padding.screen,
    maxHeight: '90%',
    width: Responsive.modal.width,
  },
  guidanceScrollView: {
    maxHeight: '80%',
  },
  guidanceHeader: {
    alignItems: 'center',
    marginTop: Responsive.spacing.lg,
    marginBottom: Responsive.spacing.md,
    paddingHorizontal: Responsive.padding.modal,
  },
  guidanceTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: Responsive.spacing.sm,
  },
  guidanceMessage: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.4,
    marginBottom: Responsive.spacing.lg,
    paddingHorizontal: Responsive.padding.modal,
  },
  stepsSection: {
    marginBottom: Responsive.spacing.lg,
    paddingHorizontal: Responsive.padding.modal,
  },
  stepsTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Responsive.spacing.sm,
    gap: Responsive.spacing.sm,
  },
  stepNumber: {
    width: Responsive.iconSizes.large,
    height: Responsive.iconSizes.large,
    borderRadius: Responsive.iconSizes.large / 2,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  stepText: {
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    lineHeight: Typography.sizes.md * 1.4,
    flex: 1,
  },
  tipsSection: {
    marginBottom: Responsive.spacing.lg,
    paddingHorizontal: Responsive.padding.modal,
  },
  tipsTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  encouragementSection: {
    backgroundColor: Colors.accentSoft,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.card,
    marginHorizontal: Responsive.padding.modal,
    marginBottom: Responsive.spacing.lg,
  },
  encouragementTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  encouragementText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * 1.4,
  },
  guidanceModalButtons: {
    paddingHorizontal: Responsive.padding.modal,
    paddingBottom: Responsive.padding.modal,
  },
});

export default Check1_5_BreachCheckScreen;
