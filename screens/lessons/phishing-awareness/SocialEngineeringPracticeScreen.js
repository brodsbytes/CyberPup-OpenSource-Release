import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const SocialEngineeringPracticeScreen = ({ navigation, route }) => {
  const { category } = route.params;
  const [showCelebration, setShowCelebration] = useState(false);
  const [scaleValue] = useState(new Animated.Value(0));

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const progress = await AsyncStorage.getItem('social_engineering_progress');
      if (progress === 'completed') {
        // Don't auto-show celebration, only on completion
      }
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('social_engineering_progress', 'completed');
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
      title="Social Engineering Tactics"
      subtitle="Practice: Social Engineering Defense"
      onNext={handleComplete}
      nextButtonText="Complete Lesson"
      showProgress={true}
      progressData={{
        text: `Step ${5} of ${5}`,
        percentage: (5 / 5) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Practice: Social Engineering Defense</Text>
        <Text style={lessonStyles.sectionText}>
          Role-play different social engineering scenarios and practice your responses. This helps you develop the right mindset and responses for real situations.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Your Action Plan</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>1. Be aware of common social engineering tactics</Text>
          <Text style={lessonStyles.bulletPoint}>2. Always verify identities independently</Text>
          <Text style={lessonStyles.bulletPoint}>3. Question unusual requests or scenarios</Text>
          <Text style={lessonStyles.bulletPoint}>4. Trust your instincts when something feels wrong</Text>
          <Text style={lessonStyles.bulletPoint}>5. Report suspicious attempts to help others</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Success Checklist</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>✅ Understand social engineering techniques</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Know how to protect against manipulation</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Can identify common attack scenarios</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Trust instincts and question suspicious requests</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Will report social engineering attempts</Text>
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
            <Text style={lessonStyles.celebrationEmoji}>🧠</Text>
            <Text style={lessonStyles.celebrationTitle}>Brilliant Work!</Text>
            <Text style={lessonStyles.celebrationText}>
              You've learned how to recognize and defend against social engineering attacks. Your psychological security skills will help you avoid manipulation and protect your information!
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

export default SocialEngineeringPracticeScreen;
