import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const SafeLinkPracticeScreen = ({ navigation, route }) => {
  const { category } = route.params;
  const [showCelebration, setShowCelebration] = useState(false);
  const [scaleValue] = useState(new Animated.Value(0));

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const progress = await AsyncStorage.getItem('safe_link_progress');
      if (progress === 'completed') {
        // Don't auto-show celebration, only on completion
      }
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('safe_link_progress', 'completed');
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
      title="Safe Link Practices"
      subtitle="Practice: Link Safety"
      onNext={handleComplete}
      nextButtonText="Complete Lesson"
      showProgress={true}
      progressData={{
        text: `Step ${3} of ${3}`,
        percentage: (3 / 3) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Practice: Link Safety</Text>
        <Text style={lessonStyles.sectionText}>
          Review different types of links and practice identifying safe vs. unsafe ones. Look for the red flags we discussed and develop good habits for link verification.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Your Action Plan</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>1. Always hover over links before clicking</Text>
          <Text style={lessonStyles.bulletPoint}>2. Check for HTTPS and correct domain names</Text>
          <Text style={lessonStyles.bulletPoint}>3. Be suspicious of shortened URLs</Text>
          <Text style={lessonStyles.bulletPoint}>4. Type URLs directly when in doubt</Text>
          <Text style={lessonStyles.bulletPoint}>5. Use link scanning tools for extra safety</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Success Checklist</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>✅ Can identify safe vs. unsafe links</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Know how to verify URLs properly</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Understand HTTPS and domain verification</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Will use safe browsing practices</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Know when to avoid clicking links</Text>
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
            <Text style={lessonStyles.celebrationEmoji}>🔗</Text>
            <Text style={lessonStyles.celebrationTitle}>Link Safety Master!</Text>
            <Text style={lessonStyles.celebrationText}>
              You've learned how to verify links safely and avoid malicious websites. Your link safety skills will protect you from phishing attacks and malware!
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

export default SafeLinkPracticeScreen;
