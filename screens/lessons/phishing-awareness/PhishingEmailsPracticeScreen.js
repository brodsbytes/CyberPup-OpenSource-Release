import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const PhishingEmailsPracticeScreen = ({ navigation, route }) => {
  const { category } = route.params;
  const [showCelebration, setShowCelebration] = useState(false);
  const [scaleValue] = useState(new Animated.Value(0));

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const progress = await AsyncStorage.getItem('phishing_emails_progress');
      if (progress === 'completed') {
        // Don't auto-show celebration, only on completion
      }
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('phishing_emails_progress', 'completed');
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
      title="Identifying Phishing Emails"
      subtitle="Practice: Spot the Phish"
      onNext={handleComplete}
      nextButtonText="Complete Lesson"
      showProgress={true}
      progressData={{
        text: `Step ${4} of ${4}`,
        percentage: (4 / 4) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Practice: Spot the Phish</Text>
        <Text style={lessonStyles.sectionText}>
          Review these example emails and identify which ones are phishing attempts. Look for the red flags we discussed: urgency, poor grammar, suspicious links, and requests for personal information.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Your Action Plan</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>1. Review emails in your inbox for red flags</Text>
          <Text style={lessonStyles.bulletPoint}>2. Check sender addresses carefully</Text>
          <Text style={lessonStyles.bulletPoint}>3. Look for urgent language and threats</Text>
          <Text style={lessonStyles.bulletPoint}>4. Verify suspicious requests independently</Text>
          <Text style={lessonStyles.bulletPoint}>5. Report phishing attempts to help others</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Success Checklist</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>✅ Can identify common phishing red flags</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Know how to analyze sender addresses</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Understand safe verification methods</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Trust instincts when something feels wrong</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Will report suspicious emails</Text>
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
            <Text style={lessonStyles.celebrationEmoji}>🎣</Text>
            <Text style={lessonStyles.celebrationTitle}>Excellent Work!</Text>
            <Text style={lessonStyles.celebrationText}>
              You've learned how to identify phishing emails and protect yourself from these common attacks. Your email security skills will help you avoid scams and protect your personal information!
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

export default PhishingEmailsPracticeScreen;
