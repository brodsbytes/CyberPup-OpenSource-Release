import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const PasswordManagersPracticeScreen = ({ navigation, route }) => {
  const { category } = route.params;
  const [showCelebration, setShowCelebration] = useState(false);
  const [scaleValue] = useState(new Animated.Value(0));

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const progress = await AsyncStorage.getItem('password_managers_progress');
      if (progress === 'completed') {
        // Don't auto-show celebration, only on completion
      }
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('password_managers_progress', 'completed');
      setShowCelebration(true);
      
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.log('Error saving progress:', error);
    }
  };

  const handleCelebrationClose = () => {
    setShowCelebration(false);
    navigation.navigate('ModuleListScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Password Managers"
      subtitle="Practice: Set Up Password Manager"
      onNext={handleComplete}
      nextButtonText="Complete Lesson"
      showProgress={true}
      progressData={{
        text: `Step ${5} of ${5}`,
        percentage: (5 / 5) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Practice: Set Up Password Manager</Text>
        <Text style={lessonStyles.sectionText}>
          Choose a password manager and begin the setup process. Create a strong master password and add at least one account. This hands-on practice will help you become comfortable with using a password manager.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Your Action Plan</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>1. Research and choose a password manager</Text>
          <Text style={lessonStyles.bulletPoint}>2. Download and install the software</Text>
          <Text style={lessonStyles.bulletPoint}>3. Create a strong master password</Text>
          <Text style={lessonStyles.bulletPoint}>4. Add your first account (email or banking)</Text>
          <Text style={lessonStyles.bulletPoint}>5. Test the auto-fill feature</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Success Checklist</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>✅ Password manager installed and configured</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Strong master password created</Text>
          <Text style={lessonStyles.bulletPoint}>✅ At least one account added</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Two-factor authentication enabled</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Auto-fill feature tested</Text>
        </View>
      </View>

      {/* Celebration Modal */}
      <Modal
        visible={showCelebration}
        transparent={true}
        animationType="fade"
      >
        <View style={lessonStyles.modalOverlay}>
          <Animated.View 
            style={[
              lessonStyles.celebrationModal,
              { transform: [{ scale: scaleValue }] }
            ]}
          >
            <Text style={lessonStyles.celebrationEmoji}>🎉</Text>
            <Text style={lessonStyles.celebrationTitle}>Congratulations!</Text>
            <Text style={lessonStyles.celebrationText}>
              You've completed the Password Managers lesson. You now know how to set up and use a password manager to keep your accounts secure!
            </Text>
            <TouchableOpacity
              style={lessonStyles.celebrationButton}
              onPress={handleCelebrationClose}
              activeOpacity={0.8}
            >
              <Text style={lessonStyles.celebrationButtonText}>Continue Learning</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </BaseLessonScreen>
  );
};

export default PasswordManagersPracticeScreen;
