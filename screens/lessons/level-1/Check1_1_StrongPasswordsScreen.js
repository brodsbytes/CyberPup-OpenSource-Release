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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Responsive, CommonStyles } from '../../../theme';
import { checkForBadgeUnlocks } from '../../../utils/badgeStorage';
import BadgeEarnedModal from '../../../components/BadgeEarnedModal';

const Check1_1_StrongPasswordsScreen = ({ navigation, route }) => {

  
  const [showIntro, setShowIntro] = useState(true);
  const [checklistItems, setChecklistItems] = useState([
    {
      id: 1,
      text: 'My passwords are 12+ characters',
      completed: false,
      action: null,
    },
    {
      id: 2,
      text: 'I use unique passwords on each account',
      completed: false,
      action: null,
    },
    {
      id: 3,
      text: 'I avoid personal info like names & birthdays',
      completed: false,
      action: null,
    },
    {
      id: 4,
      text: 'I use a passphrase of 4+ random words for important accounts',
      completed: false,
      action: null,
    },
  ]);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [showExitModal, setShowExitModal] = useState(false);
  
  // Badge state
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState([]);

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
      const progressData = await AsyncStorage.getItem('check_1-1-1_progress');
      if (progressData) {
        const data = JSON.parse(progressData);
        setChecklistItems(data.checklistItems || checklistItems);
        setIsCompleted(data.isCompleted || false);
        setShowIntro(false); // Skip intro if already started
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
        completedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('check_1-1-1_progress', JSON.stringify(progressData));
      
      // Always save completion status when isCompleted is true
      if (completionStatus) {
        await AsyncStorage.setItem('check_1-1-1_completed', 'completed');
      } else {
        // Remove completion status if not completed
        await AsyncStorage.removeItem('check_1-1-1_completed');
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
    if (allCompleted && !isCompleted) {
      // Update state and save progress with the new completion status
      const newIsCompleted = true;
      setIsCompleted(newIsCompleted);
      
      // Save progress with the updated completion status
      await saveProgress(updatedItems, newIsCompleted);
      celebrateCompletion();
    } else {
      // Save progress for partial completion
      await saveProgress(updatedItems, isCompleted);
    }
  };

  const celebrateCompletion = async () => {
    // Check for badge unlocks
    const unlockedBadges = await checkForBadgeUnlocks('1-1-1');
    
    if (unlockedBadges.length > 0) {
      setEarnedBadges(unlockedBadges);
      setShowBadgeModal(true);
    } else {
      // Show regular completion alert if no badges earned
      Alert.alert(
        '🎉 Check Complete!',
        'Great job! You\'ve mastered strong password creation. This is a crucial step in protecting your accounts.',
        [
          {
            text: 'Continue to Next Check',
            onPress: async () => {
              navigation.navigate('Check1_2_HighValueAccountsScreen');
            },
          },
          {
            text: 'Go Back',
            style: 'cancel',
            onPress: async () => {
              navigation.navigate('Welcome');
            },
          },
        ]
      );
    }
  };

  const openSettings = () => {
    Alert.alert(
      'Open Settings',
      'This will open your device settings where you can configure password requirements.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            Linking.openSettings().catch(() => {
              Alert.alert('Error', 'Unable to open settings');
            });
          },
        },
      ]
    );
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
      <TouchableOpacity
        style={styles.checklistRow}
        onPress={() => toggleChecklistItem(item.id)}
        activeOpacity={0.7}
        disabled={item.action} // Disable if it has an action button
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
      
      {item.action && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={item.action}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>I did it</Text>
          <Ionicons name="arrow-forward" size={Responsive.iconSizes.small} color={Colors.accent} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  const renderIntro = () => (
    <ScrollView style={styles.introScrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.introContainer}>
        <View style={styles.introHeader}>
          <View style={[styles.introIcon, { backgroundColor: Colors.accent }]}>
            <Ionicons name="shield-checkmark" size={Responsive.iconSizes.xxlarge} color={Colors.textPrimary} />
          </View>
          <Text style={styles.introTitle}>Area 1: Protect Your Accounts</Text>
          <Text style={styles.introSubtitle}>Cyber Pup Scout 🐾</Text>
        </View>

        <View style={styles.introSection}>
          <Text style={styles.introSectionTitle}>Why This Matters</Text>
          <Text style={styles.introSectionText}>
            Your accounts are the gateway to your digital life. Weak passwords, missing security features, and compromised accounts put everything at risk. This area covers the essential protections every account needs.
          </Text>
        </View>

        <View style={styles.introSection}>
          <Text style={styles.introSectionTitle}>What You'll Learn</Text>
          <Text style={styles.introSectionText}>
            • Create strong, unique passwords for all accounts{'\n'}
            • Secure your most important accounts first{'\n'}
            • Set up a password manager for convenience{'\n'}
            • Add multi-factor authentication for extra protection{'\n'}
            • Check if your accounts have been compromised
          </Text>
        </View>

        <View style={styles.introSection}>
          <Text style={styles.introSectionTitle}>Time Commitment</Text>
          <Text style={styles.introSectionText}>
            Complete all 5 checks in approximately 30-40 minutes
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.getStartedButton, { backgroundColor: Colors.accent }]}
          onPress={() => setShowIntro(false)}
          activeOpacity={0.8}
        >
          <Text style={styles.getStartedButtonText}>Start First Check</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderCheckContent = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Title and Description */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Create Strong Passwords</Text>
          <Text style={styles.description}>
            Weak or reused passwords cause most hacks. Let's make sure your passwords are strong and secure.
          </Text>
        </View>

        {/* Learn More Section */}
        <TouchableOpacity
          style={styles.learnMoreButton}
          onPress={() => setShowLearnMore(!showLearnMore)}
          activeOpacity={0.8}
        >
          <Text style={styles.learnMoreText}>Learn more about password security</Text>
          <Ionicons
            name={showLearnMore ? 'chevron-up' : 'chevron-down'}
            size={Responsive.iconSizes.medium}
            color={Colors.accent}
          />
        </TouchableOpacity>

        {showLearnMore && (
          <View style={styles.learnMoreContent}>
            <Text style={styles.learnMoreTitle}>Why Strong Passwords Matter</Text>
            <Text style={styles.learnMoreBody}>
              • Passwords under 12 characters can be cracked in minutes{'\n'}
              • Reusing passwords means one breach affects all your accounts{'\n'}
              • Personal information makes passwords easier to guess{'\n'}
              • Passphrases are easier to remember and harder to crack
            </Text>
          </View>
        )}

        {/* Checklist Section */}
        <View style={styles.checklistSection}>
          <Text style={styles.checklistTitle}>Your Password Security Checklist</Text>
          <Text style={styles.checklistSubtitle}>
            Check off each item as you verify your password security
          </Text>
          
          {checklistItems.map(renderChecklistItem)}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={openSettings}
          activeOpacity={0.8}
        >
                      <Ionicons name="settings-outline" size={Responsive.iconSizes.medium} color={Colors.accent} />
          <Text style={styles.settingsButtonText}>Open Device Settings</Text>
                      <Ionicons name="arrow-forward" size={Responsive.iconSizes.small} color={Colors.accent} />
        </TouchableOpacity>



        {/* Completion Status */}
        {isCompleted && (
          <View style={styles.completionCard}>
            <Ionicons name="checkmark-circle" size={Responsive.iconSizes.xxlarge} color={Colors.accent} />
            <Text style={styles.completionTitle}>Check Complete!</Text>
            <Text style={styles.completionText}>
              You've successfully verified your password security practices.
            </Text>
            
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => {
                // Progress is already saved, just navigate
                navigation.navigate('Check1_2_HighValueAccountsScreen');
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
        <Text style={styles.headerTitle}>
          {showIntro ? 'Level 1 Intro' : 'Check 1.1'}
        </Text>
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

      {/* Badge Earned Modal */}
      {earnedBadges.length > 0 && (
        <BadgeEarnedModal
          visible={showBadgeModal}
          badge={earnedBadges[0]} // Show first badge, could be enhanced to show multiple
          onClose={() => {
            setShowBadgeModal(false);
            setEarnedBadges([]);
            // Show regular completion alert after badge modal
            Alert.alert(
              '🎉 Check Complete!',
              'Great job! You\'ve mastered strong password creation. This is a crucial step in protecting your accounts.',
              [
                {
                  text: 'Continue to Next Check',
                  onPress: async () => {
                    navigation.navigate('Check1_2_HighValueAccountsScreen');
                  },
                },
                {
                  text: 'Go Back',
                  style: 'cancel',
                  onPress: async () => {
                    navigation.navigate('Welcome');
                  },
                },
              ]
            );
          }}
          onContinue={() => {
            setShowBadgeModal(false);
            setEarnedBadges([]);
            navigation.navigate('Check1_2_HighValueAccountsScreen');
          }}
        />
      )}

      {showIntro ? renderIntro() : renderCheckContent()}
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
  introScrollView: {
    flex: 1,
  },
  introContainer: {
    padding: Responsive.padding.screen,
    paddingBottom: Responsive.spacing.xl,
  },
  introHeader: {
    alignItems: 'center',
    marginBottom: Responsive.spacing.xl,
  },
  introIcon: {
    width: Responsive.iconSizes.xxlarge * 1.7,
    height: Responsive.iconSizes.xxlarge * 1.7,
    borderRadius: Responsive.iconSizes.xxlarge * 0.85,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Responsive.spacing.md,
  },
  introTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Responsive.spacing.sm,
    lineHeight: Typography.sizes.xxl * 1.3,
  },
  introSubtitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.accent,
    fontWeight: Typography.weights.semibold,
  },
  introSection: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.xlarge,
    padding: Responsive.padding.card,
    marginBottom: Responsive.spacing.lg,
  },
  introSectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  introSectionText: {
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    lineHeight: Typography.sizes.md * 1.5,
  },
  getStartedButton: {
    paddingHorizontal: Responsive.spacing.lg,
    paddingVertical: Responsive.padding.button,
    borderRadius: Responsive.borderRadius.large,
    alignItems: 'center',
    marginTop: Responsive.spacing.lg,
    minHeight: Responsive.buttonHeight.medium,
  },
  getStartedButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: Responsive.borderRadius.medium,
    paddingVertical: Responsive.spacing.sm,
    paddingHorizontal: Responsive.spacing.md,
    marginTop: Responsive.spacing.sm,
    minHeight: Responsive.buttonHeight.small,
  },
  actionButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginRight: Responsive.spacing.sm,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.card,
    marginBottom: Responsive.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingsButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.accent,
    flex: 1,
    marginLeft: Responsive.spacing.sm,
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
});

export default Check1_1_StrongPasswordsScreen;
