import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const HomeNetworkPracticeScreen = ({ navigation, route }) => {
  const { category } = route.params;
  const [showCelebration, setShowCelebration] = useState(false);
  const [scaleValue] = useState(new Animated.Value(0));

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const progress = await AsyncStorage.getItem('home_network_progress');
      if (progress === 'completed') {
        // Don't auto-show celebration, only on completion
      }
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('home_network_progress', 'completed');
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
      title="Home Network Security"
      subtitle="Practice: Network Security"
      onNext={handleComplete}
      nextButtonText="Complete Lesson"
      showProgress={true}
      progressData={{
        text: `Step ${5} of ${5}`,
        percentage: (5 / 5) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Practice: Network Security</Text>
        <Text style={lessonStyles.sectionText}>
          Review your current network setup and implement the security measures we discussed. Create a checklist for securing your router and monitoring your network.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Your Action Plan</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>1. Access your router's admin panel</Text>
          <Text style={lessonStyles.bulletPoint}>2. Change default admin password</Text>
          <Text style={lessonStyles.bulletPoint}>3. Set up strong Wi-Fi password</Text>
          <Text style={lessonStyles.bulletPoint}>4. Enable WPA3/WPA2 encryption</Text>
          <Text style={lessonStyles.bulletPoint}>5. Set up guest network</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Success Checklist</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>✅ Router admin password changed</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Strong Wi-Fi password set</Text>
          <Text style={lessonStyles.bulletPoint}>✅ WPA3/WPA2 encryption enabled</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Guest network configured</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Network monitoring setup</Text>
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
            <Text style={lessonStyles.celebrationEmoji}>🏠</Text>
            <Text style={lessonStyles.celebrationTitle}>Network Security Expert!</Text>
            <Text style={lessonStyles.celebrationText}>
              You've learned how to secure your home network and protect all your connected devices. Your network security skills will keep your digital life safe!
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

export default HomeNetworkPracticeScreen;
