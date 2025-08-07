import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const AntivirusPracticeScreen = ({ navigation, route }) => {
  const { category } = route.params;
  const [showCelebration, setShowCelebration] = useState(false);
  const [scaleValue] = useState(new Animated.Value(0));

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const progress = await AsyncStorage.getItem('antivirus_firewalls_progress');
      if (progress === 'completed') {
        // Don't auto-show celebration, only on completion
      }
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('antivirus_firewalls_progress', 'completed');
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
      title="Antivirus & Firewalls"
      subtitle="Practice: Security Software Setup"
      onNext={handleComplete}
      nextButtonText="Complete Lesson"
      showProgress={true}
      progressData={{
        text: `Step ${4} of ${4}`,
        percentage: (4 / 4) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Practice: Security Software Setup</Text>
        <Text style={lessonStyles.sectionText}>
          Review your current security software setup and ensure all devices have proper protection. Configure your antivirus and firewall settings according to best practices.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Your Action Plan</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>1. Install/update antivirus software</Text>
          <Text style={lessonStyles.bulletPoint}>2. Enable real-time protection</Text>
          <Text style={lessonStyles.bulletPoint}>3. Configure automatic scans</Text>
          <Text style={lessonStyles.bulletPoint}>4. Enable firewall protection</Text>
          <Text style={lessonStyles.bulletPoint}>5. Set up automatic updates</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Success Checklist</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>✅ Antivirus software installed and updated</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Real-time protection enabled</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Automatic scans configured</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Firewall enabled and configured</Text>
          <Text style={lessonStyles.bulletPoint}>✅ All devices protected</Text>
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
            <Text style={lessonStyles.celebrationTitle}>Security Software Expert!</Text>
            <Text style={lessonStyles.celebrationText}>
              You've learned how to choose and configure antivirus software and firewalls. Your devices are now protected with multiple layers of security!
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

export default AntivirusPracticeScreen;
