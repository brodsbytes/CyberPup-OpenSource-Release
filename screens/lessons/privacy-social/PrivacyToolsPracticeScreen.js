import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const PrivacyToolsPracticeScreen = ({ navigation, route }) => {
  const { category } = route.params;
  const [showCelebration, setShowCelebration] = useState(false);
  const [scaleValue] = useState(new Animated.Value(0));

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const progress = await AsyncStorage.getItem('privacy_tools_progress');
      if (progress === 'completed') {
        // Don't auto-show celebration, only on completion
      }
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('privacy_tools_progress', 'completed');
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
      title="Privacy-Focused Tools"
      subtitle="Practice: Implementing Privacy Tools"
      onNext={handleComplete}
      nextButtonText="Complete Lesson"
      showProgress={true}
      progressData={{
        text: `Step ${4} of ${4}`,
        percentage: (4 / 4) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Practice: Implementing Privacy Tools</Text>
        <Text style={lessonStyles.sectionText}>
          Start implementing privacy-focused tools in your daily digital life. Choose the tools that work best for your needs and gradually replace less secure alternatives.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Your Action Plan</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>1. Switch to a privacy-focused browser</Text>
          <Text style={lessonStyles.bulletPoint}>2. Change your default search engine</Text>
          <Text style={lessonStyles.bulletPoint}>3. Install encrypted messaging apps</Text>
          <Text style={lessonStyles.bulletPoint}>4. Consider a VPN service</Text>
          <Text style={lessonStyles.bulletPoint}>5. Explore privacy-focused email options</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Success Checklist</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>✅ Privacy-focused browser installed</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Private search engine set as default</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Encrypted messaging app installed</Text>
          <Text style={lessonStyles.bulletPoint}>✅ VPN service considered/installed</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Privacy tools integrated into routine</Text>
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
            <Text style={lessonStyles.celebrationEmoji}>🛡️</Text>
            <Text style={lessonStyles.celebrationTitle}>Privacy Tools Expert!</Text>
            <Text style={lessonStyles.celebrationText}>
              You've learned about privacy-focused tools and how to implement them. Your privacy toolkit will help protect your data and communications online!
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

export default PrivacyToolsPracticeScreen;
