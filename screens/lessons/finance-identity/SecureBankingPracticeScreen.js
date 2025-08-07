import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const SecureBankingPracticeScreen = ({ navigation, route }) => {
  const { category } = route.params;
  const [showCelebration, setShowCelebration] = useState(false);
  const [scaleValue] = useState(new Animated.Value(0));

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const progress = await AsyncStorage.getItem('secure_banking_progress');
      if (progress === 'completed') {
        // Don't auto-show celebration, only on completion
      }
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('secure_banking_progress', 'completed');
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
      title="Secure Online Banking"
      subtitle="Practice: Banking Security Setup"
      onNext={handleComplete}
      nextButtonText="Complete Lesson"
      showProgress={true}
      progressData={{
        text: `Step ${3} of ${3}`,
        percentage: (3 / 3) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Practice: Banking Security Setup</Text>
        <Text style={lessonStyles.sectionText}>
          Review your current banking security practices and implement the security measures we discussed. Create a checklist for secure online banking.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Your Action Plan</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>1. Enable two-factor authentication on all accounts</Text>
          <Text style={lessonStyles.bulletPoint}>2. Set up account monitoring alerts</Text>
          <Text style={lessonStyles.bulletPoint}>3. Review and update passwords</Text>
          <Text style={lessonStyles.bulletPoint}>4. Bookmark official banking websites</Text>
          <Text style={lessonStyles.bulletPoint}>5. Set up regular account reviews</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Success Checklist</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>✅ Two-factor authentication enabled</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Account monitoring alerts set up</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Strong passwords implemented</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Official banking sites bookmarked</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Regular monitoring schedule established</Text>
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
            <Text style={lessonStyles.celebrationEmoji}>🏦</Text>
            <Text style={lessonStyles.celebrationTitle}>Banking Security Expert!</Text>
            <Text style={lessonStyles.celebrationText}>
              You've learned how to bank securely online and protect your financial accounts. Your banking security skills will keep your money and information safe!
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

export default SecureBankingPracticeScreen;
