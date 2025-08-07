import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const IdentityTheftResponseScreen = ({ navigation, route }) => {
  const { category } = route.params;
  const [showCelebration, setShowCelebration] = useState(false);
  const [scaleValue] = useState(new Animated.Value(0));

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const progress = await AsyncStorage.getItem('identity_theft_response_progress');
      if (progress === 'completed') {
        // Don't auto-show celebration, only on completion
      }
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('identity_theft_response_progress', 'completed');
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
      title="Identity Theft Response"
      subtitle="Response Steps and Resources"
      onNext={handleComplete}
      nextButtonText="Complete Lesson"
      showProgress={true}
      progressData={{
        text: `Step ${2} of ${2}`,
        percentage: (2 / 2) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Response Steps and Resources</Text>
        <Text style={lessonStyles.sectionText}>
          Act quickly if you discover identity theft. Report it immediately, contact credit bureaus, and take steps to prevent further damage. Keep detailed records of all communications.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Immediate Steps to Take</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>1. <Text style={lessonStyles.bold}>Report to FTC:</Text> File a report at IdentityTheft.gov</Text>
          <Text style={lessonStyles.bulletPoint}>2. <Text style={lessonStyles.bold}>Contact credit bureaus:</Text> Place fraud alerts</Text>
          <Text style={lessonStyles.bulletPoint}>3. <Text style={lessonStyles.bold}>Contact creditors:</Text> Report fraudulent accounts</Text>
          <Text style={lessonStyles.bulletPoint}>4. <Text style={lessonStyles.bold}>File police report:</Text> Get official documentation</Text>
          <Text style={lessonStyles.bulletPoint}>5. <Text style={lessonStyles.bold}>Monitor accounts:</Text> Watch for additional fraud</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Important Resources</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>IdentityTheft.gov:</Text> Official FTC website</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Credit Bureaus:</Text> Equifax, Experian, TransUnion</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Local Police:</Text> File official report</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Your Bank:</Text> Report fraudulent charges</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Prevention Checklist</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>✅ Keep detailed records of all communications</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Follow up with all contacts in writing</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Monitor credit reports regularly</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Consider credit freeze for protection</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Stay vigilant for future fraud attempts</Text>
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
            <Text style={lessonStyles.celebrationTitle}>Identity Protection Master!</Text>
            <Text style={lessonStyles.celebrationText}>
              You've learned how to respond to identity theft and protect yourself from fraud. Your identity protection knowledge will help you act quickly if needed!
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

export default IdentityTheftResponseScreen;
