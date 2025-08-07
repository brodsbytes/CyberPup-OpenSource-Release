import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const MFAPracticeScreen = ({ navigation, route }) => {
  const { category } = route.params;
  const [showCelebration, setShowCelebration] = useState(false);
  const [scaleValue] = useState(new Animated.Value(0));

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const progress = await AsyncStorage.getItem('mfa_progress');
      if (progress === 'completed') {
        // Don't auto-show celebration, only on completion
      }
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('mfa_progress', 'completed');
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
      title="Multi-Factor Authentication"
      subtitle="Practice: Enable 2FA"
      onNext={handleComplete}
      nextButtonText="Complete Lesson"
      showProgress={true}
      progressData={{
        text: `Step ${3} of ${3}`,
        percentage: (3 / 3) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Practice: Enable 2FA</Text>
        <Text style={lessonStyles.sectionText}>
          Choose one of your important accounts and enable two-factor authentication. Follow the setup process and test that it works correctly. This hands-on experience will help you understand the process.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Your Action Plan</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>1. Choose an important account (email, banking, etc.)</Text>
          <Text style={lessonStyles.bulletPoint}>2. Download an authenticator app</Text>
          <Text style={lessonStyles.bulletPoint}>3. Go to account security settings</Text>
          <Text style={lessonStyles.bulletPoint}>4. Enable two-factor authentication</Text>
          <Text style={lessonStyles.bulletPoint}>5. Test the login process</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Success Checklist</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>✅ Authenticator app installed</Text>
          <Text style={lessonStyles.bulletPoint}>✅ 2FA enabled on at least one account</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Setup process completed successfully</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Login tested with 2FA</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Backup codes saved securely</Text>
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
            <Text style={lessonStyles.celebrationEmoji}>🔐</Text>
            <Text style={lessonStyles.celebrationTitle}>Excellent Work!</Text>
            <Text style={lessonStyles.celebrationText}>
              You've successfully set up multi-factor authentication! Your accounts are now much more secure with this additional layer of protection.
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

export default MFAPracticeScreen;
