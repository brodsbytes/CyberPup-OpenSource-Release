import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const MobileSecurityPracticeScreen = ({ navigation, route }) => {
  const { category } = route.params;
  const [showCelebration, setShowCelebration] = useState(false);
  const [scaleValue] = useState(new Animated.Value(0));

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const progress = await AsyncStorage.getItem('mobile_device_progress');
      if (progress === 'completed') {
        // Don't auto-show celebration, only on completion
      }
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('mobile_device_progress', 'completed');
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
      title="Mobile Device Security"
      subtitle="Practice: Mobile Security Setup"
      onNext={handleComplete}
      nextButtonText="Complete Lesson"
      showProgress={true}
      progressData={{
        text: `Step ${3} of ${3}`,
        percentage: (3 / 3) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Practice: Mobile Security Setup</Text>
        <Text style={lessonStyles.sectionText}>
          Review your mobile device security settings and implement the security measures we discussed. Create a checklist for securing all your mobile devices.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Your Action Plan</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>1. Enable device encryption</Text>
          <Text style={lessonStyles.bulletPoint}>2. Set up strong passcode/biometric lock</Text>
          <Text style={lessonStyles.bulletPoint}>3. Enable Find My Device feature</Text>
          <Text style={lessonStyles.bulletPoint}>4. Update device and apps</Text>
          <Text style={lessonStyles.bulletPoint}>5. Review app permissions</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Success Checklist</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>✅ Device encryption enabled</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Strong passcode/biometric lock set</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Find My Device enabled</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Device and apps updated</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Safe app practices followed</Text>
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
            <Text style={lessonStyles.celebrationEmoji}>📱</Text>
            <Text style={lessonStyles.celebrationTitle}>Mobile Security Master!</Text>
            <Text style={lessonStyles.celebrationText}>
              You've learned how to secure your mobile devices and protect your personal information. Your mobile security skills will keep your smartphone and tablet safe!
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

export default MobileSecurityPracticeScreen;
