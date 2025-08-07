import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const SocialMediaPracticeScreen = ({ navigation, route }) => {
  const { category } = route.params;
  const [showCelebration, setShowCelebration] = useState(false);
  const [scaleValue] = useState(new Animated.Value(0));

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const progress = await AsyncStorage.getItem('social_media_privacy_progress');
      if (progress === 'completed') {
        // Don't auto-show celebration, only on completion
      }
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('social_media_privacy_progress', 'completed');
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
      title="Social Media Privacy Settings"
      subtitle="Practice: Privacy Configuration"
      onNext={handleComplete}
      nextButtonText="Complete Lesson"
      showProgress={true}
      progressData={{
        text: `Step ${4} of ${4}`,
        percentage: (4 / 4) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Practice: Privacy Configuration</Text>
        <Text style={lessonStyles.sectionText}>
          Review all your social media accounts and configure privacy settings. Create a checklist for each platform and ensure your personal information is protected.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Your Action Plan</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>1. Review all social media accounts</Text>
          <Text style={lessonStyles.bulletPoint}>2. Configure privacy settings</Text>
          <Text style={lessonStyles.bulletPoint}>3. Set profiles to private</Text>
          <Text style={lessonStyles.bulletPoint}>4. Remove sensitive information</Text>
          <Text style={lessonStyles.bulletPoint}>5. Review and adjust regularly</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Success Checklist</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>✅ All profiles set to private</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Privacy settings configured</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Sensitive information removed</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Data sharing limited</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Regular reviews scheduled</Text>
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
            <Text style={lessonStyles.celebrationEmoji}>🔒</Text>
            <Text style={lessonStyles.celebrationTitle}>Privacy Protection Expert!</Text>
            <Text style={lessonStyles.celebrationText}>
              You've learned how to protect your privacy on social media platforms. Your privacy settings will help control your personal information and keep you safe online!
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

export default SocialMediaPracticeScreen;
