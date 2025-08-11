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
import { Colors } from '../../../theme';

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
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
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
    // Progress is already saved in toggleChecklistItem, so we don't need to save again
    
    Alert.alert(
      '🎉 Check Complete!',
      'Great job! You\'ve mastered strong password creation. This is a crucial step in protecting your accounts.',
      [
        {
          text: 'Continue to Next Check',
          onPress: async () => {
            // Progress is already saved, just navigate
            navigation.navigate('Check1_2_HighValueAccountsScreen');
          },
        },
        {
          text: 'Go Back',
          style: 'cancel',
          onPress: async () => {
            // Progress is already saved, just navigate back
            navigation.navigate('Welcome');
          },
        },
      ]
    );
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
            <Ionicons name="checkmark" size={16} color={Colors.textPrimary} />
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
          <Ionicons name="arrow-forward" size={16} color={Colors.accent} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  const renderIntro = () => (
    <ScrollView style={styles.introScrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.introContainer}>
        <View style={styles.introHeader}>
          <View style={[styles.introIcon, { backgroundColor: Colors.accent }]}>
            <Ionicons name="shield-checkmark" size={48} color={Colors.textPrimary} />
          </View>
          <Text style={styles.introTitle}>Level 1: Password Security & Authentication</Text>
          <Text style={styles.introSubtitle}>Cyber Pup Scout 🐾</Text>
        </View>

        <View style={styles.introSection}>
          <Text style={styles.introSectionTitle}>Why This Matters</Text>
          <Text style={styles.introSectionText}>
            Weak or reused passwords are the leading cause of account breaches. By mastering strong password creation, you'll establish a solid foundation for your digital security.
          </Text>
        </View>

        <View style={styles.introSection}>
          <Text style={styles.introSectionTitle}>What You'll Learn</Text>
          <Text style={styles.introSectionText}>
            • Create strong, unique passwords for all accounts{'\n'}
            • Use passphrases for maximum security{'\n'}
            • Avoid common password mistakes{'\n'}
            • Set up proper password practices
          </Text>
        </View>

        <View style={styles.introSection}>
          <Text style={styles.introSectionTitle}>Time Commitment</Text>
          <Text style={styles.introSectionText}>
            Complete all checks in approximately 15-20 minutes
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
          <Text style={styles.title}>Creating Strong Passwords & Passphrases</Text>
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
            size={20}
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
          <Ionicons name="settings-outline" size={20} color={Colors.accent} />
          <Text style={styles.settingsButtonText}>Open Device Settings</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.accent} />
        </TouchableOpacity>



        {/* Completion Status */}
        {isCompleted && (
          <View style={styles.completionCard}>
            <Ionicons name="checkmark-circle" size={48} color={Colors.accent} />
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
              <Ionicons name="arrow-forward" size={20} color={Colors.textPrimary} />
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
          <Ionicons name="menu" size={24} color={Colors.textPrimary} />
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
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  introScrollView: {
    flex: 1,
  },
  introContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  introHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  introIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 32,
  },
  introSubtitle: {
    fontSize: 18,
    color: Colors.accent,
    fontWeight: '600',
  },
  introSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  introSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  introSectionText: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  getStartedButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  getStartedButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 16,
  },
  learnMoreText: {
    fontSize: 16,
    color: Colors.accent,
    fontWeight: '600',
  },
  learnMoreContent: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  learnMoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  learnMoreBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  checklistSection: {
    marginBottom: 24,
  },
  checklistTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  checklistSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  checklistItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.accent,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: Colors.accent,
  },
  checklistText: {
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: 22,
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
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginRight: 8,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.accent,
    flex: 1,
    marginLeft: 12,
  },
  completionCard: {
    backgroundColor: Colors.accentSoft,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  completionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  completionText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
    minWidth: 300,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCharacter: {
    marginBottom: 16,
  },
  characterText: {
    fontSize: 48,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButtons: {
    width: '100%',
    gap: 12,
  },
  keepLearningButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  keepLearningButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  exitLessonButton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  exitLessonButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.accent,
  },
});

export default Check1_1_StrongPasswordsScreen;
