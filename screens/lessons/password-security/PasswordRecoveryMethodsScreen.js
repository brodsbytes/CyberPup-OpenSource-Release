import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const PasswordRecoveryMethodsScreen = ({ navigation, route }) => {
  const { category } = route.params;
  const [showCelebration, setShowCelebration] = useState(false);
  const [scaleValue] = useState(new Animated.Value(0));

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const progress = await AsyncStorage.getItem('password_recovery_progress');
      if (progress === 'completed') {
        // Don't auto-show celebration, only on completion
      }
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('password_recovery_progress', 'completed');
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
      title="Password Recovery"
      subtitle="What to Do If You Forget a Password"
      onNext={handleComplete}
      nextButtonText="Complete Lesson"
      showProgress={true}
      progressData={{
        text: `Step ${2} of ${2}`,
        percentage: (2 / 2) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What to Do If You Forget a Password</Text>
        <Text style={lessonStyles.sectionText}>
          Don't panic! Use your recovery email or backup authentication method. If you can't recover access, contact the service's support. Never share your recovery information with anyone, and be wary of fake recovery emails.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Recovery Steps</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>1. Try your recovery email first</Text>
          <Text style={lessonStyles.bulletPoint}>2. Use backup authentication methods (2FA codes, security keys)</Text>
          <Text style={lessonStyles.bulletPoint}>3. Check for recovery codes you may have saved</Text>
          <Text style={lessonStyles.bulletPoint}>4. Contact official support if other methods fail</Text>
          <Text style={lessonStyles.bulletPoint}>5. Never share recovery information with anyone</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Security Checklist</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>✅ Recovery email is different from main email</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Security questions are not easily guessable</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Backup authentication methods are enabled</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Recovery codes are stored securely</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Recovery information is kept updated</Text>
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
            <Text style={lessonStyles.celebrationEmoji}>🔑</Text>
            <Text style={lessonStyles.celebrationTitle}>Great Job!</Text>
            <Text style={lessonStyles.celebrationText}>
              You've learned how to set up secure password recovery methods. Your accounts are now protected with proper recovery options that won't compromise your security!
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

export default PasswordRecoveryMethodsScreen;
