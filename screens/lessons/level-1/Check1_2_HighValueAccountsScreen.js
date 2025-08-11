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
import { Colors } from '../../../theme';

const Check1_2_HighValueAccountsScreen = ({ navigation, route }) => {

  
  const [checklistItems, setChecklistItems] = useState([
    {
      id: 1,
      text: 'My bank accounts have MFA enabled',
      completed: false,
      helpText: 'Check your banking app or website for Two-Factor Authentication settings',
    },
    {
      id: 2,
      text: 'My primary email has MFA & a strong passphrase',
      completed: false,
      helpText: 'Enable 2FA in your email provider\'s security settings',
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
      const progressData = await AsyncStorage.getItem('check_1-1-2_progress');
      if (progressData) {
        const data = JSON.parse(progressData);
        setChecklistItems(data.checklistItems || checklistItems);
        setIsCompleted(data.isCompleted || false);
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
      await AsyncStorage.setItem('check_1-1-2_progress', JSON.stringify(progressData));
      
      if (completionStatus) {
        await AsyncStorage.setItem('check_1-1-2_completed', 'completed');
      } else {
        await AsyncStorage.removeItem('check_1-1-2_completed');
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
      const newIsCompleted = true;
      setIsCompleted(newIsCompleted);
      
      // Save progress with the updated completion status immediately
      await saveProgress(updatedItems, newIsCompleted);
      celebrateCompletion();
    } else {
      // Save progress for partial completion
      await saveProgress(updatedItems, isCompleted);
    }
  };

  const celebrateCompletion = () => {
    // Progress is already saved in toggleChecklistItem, so we don't need to save again
    
    Alert.alert(
      '🎉 Check Complete!',
      'Excellent! You\'ve secured your most important accounts. Banking and email are the keys to everything else.',
      [
        {
          text: 'Continue to Next Check',
          onPress: () => {
            // Navigate to the next check (Check 1.3 - Password Managers)
            navigation.navigate('Check1_3_PasswordManagersScreen');
          },
        },
        {
          text: 'Go Back',
          style: 'cancel',
          onPress: () => {
            // Progress is already saved, just navigate back
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
        'How to Check MFA Status\n\n' +
        item.helpText + '\n\n' + 
        'To verify MFA is enabled:\n' +
        '1. Open your account settings\n' +
        '2. Look for "Two-Factor Authentication" or "2FA"\n' +
        '3. Check if it\'s turned ON\n' +
        '4. If not enabled, follow the setup instructions\n\n' +
        'Once you\'ve verified MFA is enabled, tap the checkbox to mark this complete.'
      );
    } else {
      Alert.alert(
        'How to Check MFA Status',
        item.helpText + '\n\n' + 
        'To verify MFA is enabled:\n' +
        '1. Open your account settings\n' +
        '2. Look for "Two-Factor Authentication" or "2FA"\n' +
        '3. Check if it\'s turned ON\n' +
        '4. If not enabled, follow the setup instructions\n\n' +
        'Once you\'ve verified MFA is enabled, tap the checkbox to mark this complete.',
        [
          { text: 'Got it', style: 'default' },
        ]
      );
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
              <Ionicons name="checkmark" size={16} color={Colors.textPrimary} />
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
          <Ionicons name="help-circle-outline" size={16} color={Colors.accent} />
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
          <Ionicons name="menu" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check 1.2</Text>
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Title and Description */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Prioritising High-Value Accounts</Text>
            <Text style={styles.description}>
              Banking & email are the keys to everything else. Let's secure your most important accounts first.
            </Text>
          </View>

          {/* Learn More Section */}
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={() => setShowLearnMore(!showLearnMore)}
            activeOpacity={0.8}
          >
            <Text style={styles.learnMoreText}>Why prioritize these accounts?</Text>
            <Ionicons
              name={showLearnMore ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={Colors.accent}
            />
          </TouchableOpacity>

          {showLearnMore && (
            <View style={styles.learnMoreContent}>
              <Text style={styles.learnMoreTitle}>High-Value Account Protection</Text>
              <Text style={styles.learnMoreBody}>
                • Banking accounts control your money and financial identity{'\n'}
                • Email accounts are used to reset passwords for other services{'\n'}
                • Compromised email can lead to account takeovers{'\n'}
                • These accounts need the strongest security measures
              </Text>
            </View>
          )}

          {/* Checklist Section */}
          <View style={styles.checklistSection}>
            <Text style={styles.checklistTitle}>High-Value Account Security</Text>
            <Text style={styles.checklistSubtitle}>
              Verify that your most critical accounts are properly secured
            </Text>
            
            {checklistItems.map(renderChecklistItem)}
          </View>



          {/* Tips Section */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>💡 Security Tips</Text>
            <View style={styles.tipItem}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.accent} />
              <Text style={styles.tipText}>Use authenticator apps instead of SMS when possible</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="key" size={20} color={Colors.accent} />
              <Text style={styles.tipText}>Store backup codes in a secure password manager</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="notifications" size={20} color={Colors.accent} />
              <Text style={styles.tipText}>Enable security alerts for suspicious activity</Text>
            </View>
          </View>

          {/* Completion Status */}
          {isCompleted && (
            <View style={styles.completionCard}>
              <Ionicons name="checkmark-circle" size={48} color={Colors.accent} />
              <Text style={styles.completionTitle}>Check Complete!</Text>
              <Text style={styles.completionText}>
                Your high-value accounts are now properly secured with MFA.
              </Text>
              
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => {
                  // Progress is already saved, just navigate
                  navigation.navigate('Check1_3_PasswordManagersScreen');
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
  checkboxContainer: {
    marginRight: 12,
    padding: 4, // Increase touch target
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.accent,
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
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.accent,
    minHeight: 44, // Ensure minimum touch target size
  },
  helpButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.accent,
    marginLeft: 6,
  },
  tipsSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
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

export default Check1_2_HighValueAccountsScreen;
