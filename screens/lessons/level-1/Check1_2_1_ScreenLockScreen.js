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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Responsive, CommonStyles } from '../../../theme';

const Check1_2_1_ScreenLockScreen = ({ navigation, route }) => {

  
  const [checklistItems, setChecklistItems] = useState([
    {
      id: 1,
      text: 'My phone auto-locks after inactivity',
      completed: false,
      action: 'openScreenLockSettings',
    },
    {
      id: 2,
      text: 'I use a strong PIN/passphrase',
      completed: false,
      action: 'openSecuritySettings',
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
      const progressData = await AsyncStorage.getItem('check_1-2-1_progress');
      if (progressData) {
        const data = JSON.parse(progressData);
        setChecklistItems(data.checklistItems || checklistItems);
        setIsCompleted(data.isCompleted || false);
      }
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  };

  const saveProgress = async () => {
    try {
      const progressData = {
        checklistItems,
        isCompleted,
        completedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('check_1-2-1_progress', JSON.stringify(progressData));
      
      if (isCompleted) {
        await AsyncStorage.setItem('check_1-2-1_completed', 'completed');
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
      setIsCompleted(true);
      celebrateCompletion();
    }

    await saveProgress();
  };

  const celebrateCompletion = () => {
    Alert.alert(
      '🎉 Check Complete!',
      'Excellent! You\'ve secured your device with proper screen lock settings. This is the first line of defense for your device.',
      [
        {
          text: 'Continue to Next Check',
          onPress: () => {
            // Navigate to the next check (Check 1.2.2)
            navigation.navigate('Check1_2_2_RemoteLockScreen');
          },
        },
        {
          text: 'Go Back',
          style: 'cancel',
          onPress: () => {
            // Force refresh of WelcomeScreen progress
            navigation.navigate('Welcome');
          },
        },
      ]
    );
  };

  const openScreenLockSettings = () => {
    Alert.alert(
      'Set Auto-Lock',
      'To set your phone to auto-lock:\n\n1. Open Settings > Display & Brightness\n2. Tap "Auto-Lock"\n3. Choose a short time (30 seconds or 1 minute)\n4. This ensures your phone locks quickly when not in use',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'I\'ve Done This',
          onPress: () => {
            toggleChecklistItem(1);
          },
        },
      ]
    );
  };

  const openSecuritySettings = () => {
    Alert.alert(
      'Set Strong PIN/Passphrase',
      'To set a strong PIN or passphrase:\n\n1. Open Settings > Face ID & Passcode (iOS) or Security (Android)\n2. Tap "Change Passcode" or "Screen Lock"\n3. Choose a 6-digit PIN or custom passphrase\n4. Avoid common patterns like 123456 or your birthday',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'I\'ve Done This',
          onPress: () => {
            toggleChecklistItem(2);
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
      
      {item.action && !item.completed && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (item.action === 'openScreenLockSettings') {
              openScreenLockSettings();
            } else if (item.action === 'openSecuritySettings') {
              openSecuritySettings();
            }
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>I did it</Text>
                      <Ionicons name="arrow-forward" size={Responsive.iconSizes.small} color={Colors.accent} />
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
        <Text style={styles.headerTitle}>Check 1.2.1</Text>
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
            <Text style={styles.title}>Screen Lock & Auto-Lock</Text>
            <Text style={styles.description}>
              Secure your device with proper lock settings to protect your data if your device is lost or stolen.
            </Text>
          </View>

          {/* Learn More Section */}
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={() => setShowLearnMore(!showLearnMore)}
            activeOpacity={0.8}
          >
            <Text style={styles.learnMoreText}>Why are screen locks important?</Text>
            <Ionicons
              name={showLearnMore ? 'chevron-up' : 'chevron-down'}
              size={Responsive.iconSizes.medium}
              color={Colors.accent}
            />
          </TouchableOpacity>

          {showLearnMore && (
            <View style={styles.learnMoreContent}>
              <Text style={styles.learnMoreTitle}>Device Security Benefits</Text>
              <Text style={styles.learnMoreBody}>
                • Prevents unauthorized access if device is lost or stolen{'\n'}
                • Protects personal photos, messages, and financial apps{'\n'}
                • Required for many workplace and banking apps{'\n'}
                • Auto-lock ensures device secures itself quickly{'\n'}
                • Strong PINs are harder to guess than simple patterns
              </Text>
            </View>
          )}

          {/* Checklist Section */}
          <View style={styles.checklistSection}>
            <Text style={styles.checklistTitle}>Screen Lock Setup</Text>
            <Text style={styles.checklistSubtitle}>
              Configure your device to lock automatically and use a strong passcode
            </Text>
            
            {checklistItems.map(renderChecklistItem)}
          </View>

          {/* Tips Section */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>💡 Security Tips</Text>
            <View style={styles.tipItem}>
              <Ionicons name="shield-checkmark" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Set auto-lock to 30 seconds or 1 minute for maximum security</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="key" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Use a 6-digit PIN or longer passphrase instead of simple patterns</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="finger-print" size={Responsive.iconSizes.medium} color={Colors.accent} />
              <Text style={styles.tipText}>Enable biometric authentication (fingerprint/face ID) for convenience</Text>
            </View>
          </View>

          {/* Completion Status */}
          {isCompleted && (
            <View style={styles.completionCard}>
              <Ionicons name="checkmark-circle" size={Responsive.iconSizes.xxlarge} color={Colors.accent} />
              <Text style={styles.completionTitle}>Check Complete!</Text>
              <Text style={styles.completionText}>
                You've successfully secured your device with proper screen lock settings. This is the foundation of device security!
              </Text>
              
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => {
                  navigation.navigate('Check1_2_2_RemoteLockScreen');
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
    minHeight: Responsive.buttonHeight.medium,
  },
  actionButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginRight: Responsive.spacing.sm,
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
});

export default Check1_2_1_ScreenLockScreen;
