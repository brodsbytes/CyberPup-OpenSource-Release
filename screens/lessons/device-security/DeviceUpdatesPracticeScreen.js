import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const DeviceUpdatesPracticeScreen = ({ navigation, route }) => {
  const { category } = route.params;
  const [showCelebration, setShowCelebration] = useState(false);
  const [scaleValue] = useState(new Animated.Value(0));

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const progress = await AsyncStorage.getItem('device_updates_progress');
      if (progress === 'completed') {
        // Don't auto-show celebration, only on completion
      }
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('device_updates_progress', 'completed');
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
      title="Device Updates & Patches"
      subtitle="Practice: Update Management"
      onNext={handleComplete}
      nextButtonText="Complete Lesson"
      showProgress={true}
      progressData={{
        text: `Step ${3} of ${3}`,
        percentage: (3 / 3) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Practice: Update Management</Text>
        <Text style={lessonStyles.sectionText}>
          Review your devices and create an update schedule. Check which devices have automatic updates enabled and which ones need manual checking.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Your Action Plan</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>1. Enable automatic updates on all devices</Text>
          <Text style={lessonStyles.bulletPoint}>2. Set a weekly reminder to check for updates</Text>
          <Text style={lessonStyles.bulletPoint}>3. Install updates promptly when available</Text>
          <Text style={lessonStyles.bulletPoint}>4. Keep a list of all your devices</Text>
          <Text style={lessonStyles.bulletPoint}>5. Don't ignore update notifications</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Success Checklist</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>✅ Understand why updates are important</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Know which devices need updates</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Can enable automatic updates</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Will check for updates regularly</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Install updates promptly</Text>
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
            <Text style={lessonStyles.celebrationEmoji}>🔄</Text>
            <Text style={lessonStyles.celebrationTitle}>Update Master!</Text>
            <Text style={lessonStyles.celebrationText}>
              You've learned how to keep your devices updated and secure. Your update management skills will protect you from vulnerabilities and keep your devices running smoothly!
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

export default DeviceUpdatesPracticeScreen;
