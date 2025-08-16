import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Animated,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Responsive, CommonStyles } from '../../../theme';

const Check1_3_PasswordManagersScreen = ({ navigation, route }) => {

  
  const [checklistItems, setChecklistItems] = useState([
    {
      id: 1,
      text: 'I installed a password manager',
      completed: false,
      helpText: 'Download a password manager from your device\'s app store (1Password, Bitwarden, LastPass, or Dashlane)',
    },
    {
      id: 2,
      text: 'I stored 3+ logins in it',
      completed: false,
      helpText: 'Add at least 3 important account logins to your password manager',
    },
    {
      id: 3,
      text: 'I enabled biometrics for access',
      completed: false,
      helpText: 'Enable fingerprint/face recognition in your password manager settings',
    },
  ]);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [showExitModal, setShowExitModal] = useState(false);
  
  // Password manager selection state
  const [selectedPasswordManager, setSelectedPasswordManager] = useState('');
  const [showPasswordManagerModal, setShowPasswordManagerModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Password manager options with OS-based recommendations
  const passwordManagers = [
    { label: 'Select a password manager...', value: '' },
    { label: '1Password', value: '1password', recommended: Platform.OS === 'ios' || Platform.OS === 'macos' },
    { label: 'Bitwarden', value: 'bitwarden', recommended: true }, // Cross-platform, free tier
    { label: 'LastPass', value: 'lastpass', recommended: false },
    { label: 'Dashlane', value: 'dashlane', recommended: Platform.OS === 'android' },
    { label: 'NordPass', value: 'nordpass', recommended: false },
    { label: 'Keeper', value: 'keeper', recommended: false },
    { label: 'RoboForm', value: 'roboform', recommended: false },
  ];

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
      const progressData = await AsyncStorage.getItem('check_1-1-3_progress');
      const completedData = await AsyncStorage.getItem('check_1-1-3_completed');
      console.log('📥 Loading progress for Check 1.1.3:', { progressData: !!progressData, completedData });
      
      if (progressData) {
        const data = JSON.parse(progressData);
        setChecklistItems(data.checklistItems || checklistItems);
        setIsCompleted(data.isCompleted || false);
        setSelectedPasswordManager(data.selectedPasswordManager || '');
        console.log('📊 Loaded progress data:', { isCompleted: data.isCompleted, checklistItems: data.checklistItems?.length });
      }
      
      // Also check the completion status directly
      if (completedData === 'completed') {
        console.log('✅ Check 1.1.3 is marked as completed in storage');
        setIsCompleted(true);
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
        selectedPasswordManager,
        completedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('check_1-1-3_progress', JSON.stringify(progressData));
      
      if (completionStatus) {
        await AsyncStorage.setItem('check_1-1-3_completed', 'completed');
        console.log('✅ Check 1.1.3 marked as completed');
      } else {
        await AsyncStorage.removeItem('check_1-1-3_completed');
        console.log('❌ Check 1.1.3 completion removed');
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
    console.log('🎉 Celebrating completion of Check 1.1.3');
    // Ensure completion is saved before showing alert
    await saveProgress(checklistItems, true);
    
    Alert.alert(
      '🎉 Password Manager Setup Complete!',
      'Excellent! You\'ve set up a password manager. This will make managing your passwords much easier and more secure.',
      [
        {
          text: 'Continue to Next Check',
          onPress: async () => {
            console.log('🚀 Navigating to Check 1.4');
            // Navigate to the next check (Check 1.4 - MFA Setup)
            navigation.navigate('Check1_4_MFASetupScreen');
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

  const showHelp = (item) => {
    console.log('Help button pressed for item:', item.id);
    
    // For web platform, we might need to handle alerts differently
    if (Platform.OS === 'web') {
      // Use window.alert for web or create a custom modal
      window.alert(
        'Password Manager Setup Guide\n\n' +
        item.helpText + '\n\n' + 
        'Step-by-step instructions:\n' +
        '1. Follow the guidance above\n' +
        '2. Complete the action in your password manager\n' +
        '3. Verify the setup is working\n' +
        '4. Tap the checkbox to mark this complete\n\n' +
        'Once you\'ve completed this step, tap the checkbox to mark it complete.'
      );
    } else {
      Alert.alert(
        'Password Manager Setup Guide',
        item.helpText + '\n\n' + 
        'Step-by-step instructions:\n' +
        '1. Follow the guidance above\n' +
        '2. Complete the action in your password manager\n' +
        '3. Verify the setup is working\n' +
        '4. Tap the checkbox to mark this complete\n\n' +
        'Once you\'ve completed this step, tap the checkbox to mark it complete.',
        [
          { text: 'Got it', style: 'default' },
        ]
      );
    }
  };

  const handlePasswordManagerChange = async (value) => {
    setSelectedPasswordManager(value);
    await saveProgress();
  };

  const getRecommendedManagers = () => {
    return passwordManagers.filter(pm => pm.recommended && pm.value !== '');
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

  const renderChecklistItem = (item) => (
    <Animated.View
      key={item.id}
      style={[
        styles.checklistItem,
        item.completed && styles.checklistItemCompleted,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <View style={styles.checklistRow}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => toggleChecklistItem(item.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, item.completed && styles.checkboxCompleted]}>
            {item.completed && (
              <Ionicons name="checkmark" size={Responsive.iconSizes.small} color={Colors.textPrimary} />
            )}
          </View>
        </TouchableOpacity>
        <Text style={[styles.checklistText, item.completed && styles.checklistTextCompleted]}>
          {item.text}
        </Text>
      </View>
      
      {!item.completed && (
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => {
            console.log('Help button pressed for item:', item.id);
            showHelp(item);
          }}
          activeOpacity={0.6}
        >
                      <Ionicons name="help-circle-outline" size={Responsive.iconSizes.small} color={Colors.accent} />
          <Text style={styles.helpButtonText}>Learn how to check</Text>
        </TouchableOpacity>
      )}
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
        <Text style={styles.headerTitle}>Check 1.3</Text>
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Title and Description */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Set Up a Password Manager</Text>
            <Text style={styles.description}>
              Password managers are the best way to create, store, and use strong, unique passwords for all your accounts.
            </Text>
          </View>

          {/* Password Manager Selection Section */}
          <View style={styles.passwordManagerSection}>
            <Text style={styles.passwordManagerTitle}>Choose Your Password Manager</Text>
            <Text style={styles.passwordManagerSubtitle}>
              Select the password manager you're using or plan to use
            </Text>
            
            {/* OS-based recommendations */}
            <View style={styles.recommendationsSection}>
              <Text style={styles.recommendationsTitle}>💡 Recommended for your device:</Text>
              <View style={styles.recommendationsList}>
                {getRecommendedManagers().map((pm, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Ionicons name="star" size={Responsive.iconSizes.small} color={Colors.accent} />
                    <Text style={styles.recommendationText}>{pm.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Password Manager Dropdown */}
            <View style={styles.dropdownContainer}>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowDropdown(!showDropdown)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.dropdownButtonText,
                  !selectedPasswordManager && styles.dropdownButtonTextPlaceholder
                ]}>
                  {selectedPasswordManager 
                    ? passwordManagers.find(pm => pm.value === selectedPasswordManager)?.label 
                    : 'Select a password manager...'
                  }
                </Text>
                <Ionicons 
                  name={showDropdown ? 'chevron-up' : 'chevron-down'} 
                  size={Responsive.iconSizes.medium} 
                  color={Colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            {selectedPasswordManager && (
              <View style={styles.selectedManagerInfo}>
                <Ionicons name="checkmark-circle" size={Responsive.iconSizes.medium} color={Colors.accent} />
                <Text style={styles.selectedManagerText}>
                  Great choice! {passwordManagers.find(pm => pm.value === selectedPasswordManager)?.label} is a solid password manager.
                </Text>
              </View>
            )}
          </View>

          {/* Learn More Section */}
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={() => setShowLearnMore(!showLearnMore)}
            activeOpacity={0.8}
          >
            <Text style={styles.learnMoreText}>Why use a password manager?</Text>
            <Ionicons
              name={showLearnMore ? 'chevron-up' : 'chevron-down'}
              size={Responsive.iconSizes.medium}
              color={Colors.accent}
            />
          </TouchableOpacity>

          {showLearnMore && (
            <View style={styles.learnMoreContent}>
              <Text style={styles.learnMoreTitle}>Password Manager Benefits</Text>
              <Text style={styles.learnMoreBody}>
                • Generate strong, unique passwords automatically{'\n'}
                • Store all passwords securely in one place{'\n'}
                • Auto-fill passwords on websites and apps{'\n'}
                • Sync across all your devices{'\n'}
                • Protect against password reuse attacks
              </Text>
            </View>
          )}

          {/* Checklist Section */}
          <View style={styles.checklistSection}>
            <Text style={styles.checklistTitle}>Password Manager Setup</Text>
            <Text style={styles.checklistSubtitle}>
              Follow these steps to set up your password manager
            </Text>
            
            {checklistItems.map(renderChecklistItem)}
          </View>

          {/* Tips Section */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>💡 Security Tips</Text>
            <View style={styles.tipItem}>
              <Ionicons name="shield-checkmark" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Choose a password manager with zero-knowledge encryption</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="key" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Use a strong master password you can remember</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="cloud" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Enable cloud sync to access passwords on all devices</Text>
            </View>
          </View>

          {/* Completion Status */}
          {isCompleted && (
            <View style={styles.completionCard}>
              <Ionicons name="checkmark-circle" size={Responsive.iconSizes.xxlarge} color={Colors.accent} />
              <Text style={styles.completionTitle}>Check Complete!</Text>
              <Text style={styles.completionText}>
                You've successfully set up your password manager. This will make managing passwords much easier!
              </Text>
              
              <TouchableOpacity
                style={styles.continueButton}
                onPress={async () => {
                  console.log('🔘 Continue button pressed in completion card');
                  // Ensure completion is saved before navigating
                  await saveProgress(checklistItems, true);
                  navigation.navigate('Check1_4_MFASetupScreen');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.continueButtonText}>Continue to Next Check</Text>
                <Ionicons name="arrow-forward" size={Responsive.iconSizes.medium} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Password Manager Selection Modal */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.dropdownModalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownModalContent}>
            {passwordManagers.map((pm, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dropdownModalOption,
                  selectedPasswordManager === pm.value && styles.dropdownModalOptionSelected
                ]}
                onPress={() => {
                  handlePasswordManagerChange(pm.value);
                  setShowDropdown(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.dropdownModalOptionText,
                  selectedPasswordManager === pm.value && styles.dropdownModalOptionTextSelected
                ]}>
                  {pm.label}
                </Text>
                {selectedPasswordManager === pm.value && (
                  <Ionicons name="checkmark" size={20} color={Colors.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  checkboxContainer: {
    marginRight: Responsive.spacing.sm,
    padding: Responsive.spacing.xs, // Increase touch target
  },
  checkbox: {
    width: Responsive.iconSizes.large,
    height: Responsive.iconSizes.large,
    borderRadius: Responsive.iconSizes.large / 2,
    borderWidth: 2,
    borderColor: Colors.accent,
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
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.medium,
    paddingVertical: Responsive.spacing.sm,
    paddingHorizontal: Responsive.spacing.sm,
    marginTop: Responsive.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.accent,
    minHeight: Responsive.buttonHeight.medium, // Ensure minimum touch target size
  },
  helpButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.accent,
    marginLeft: Responsive.spacing.xs,
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
  // Password Manager Selection Styles
  passwordManagerSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  passwordManagerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  passwordManagerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  recommendationsSection: {
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  recommendationsList: {
    gap: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  dropdownContainer: {
    marginBottom: 12,
  },
  dropdownButton: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
  },
  dropdownButtonTextPlaceholder: {
    color: Colors.textSecondary,
  },
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModalContent: {
    backgroundColor: Colors.dropdownBackground,
    borderRadius: 12,
    padding: 8,
    marginHorizontal: 40,
    maxWidth: 300,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  dropdownModalOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    marginVertical: 2,
  },
  dropdownModalOptionSelected: {
    backgroundColor: Colors.accentSoft,
  },
  dropdownModalOptionText: {
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
  },
  dropdownModalOptionTextSelected: {
    color: Colors.accent,
    fontWeight: '600',
  },
  selectedManagerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentSoft,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  selectedManagerText: {
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
  },
});

export default Check1_3_PasswordManagersScreen;
