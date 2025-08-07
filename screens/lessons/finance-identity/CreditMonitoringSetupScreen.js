import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const CreditMonitoringSetupScreen = ({ navigation, route }) => {
  const { category } = route.params;
  const [showCelebration, setShowCelebration] = useState(false);
  const [scaleValue] = useState(new Animated.Value(0));

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const progress = await AsyncStorage.getItem('credit_monitoring_progress');
      if (progress === 'completed') {
        // Don't auto-show celebration, only on completion
      }
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('credit_monitoring_progress', 'completed');
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
      title="Credit Monitoring"
      subtitle="Setting Up Credit Monitoring"
      onNext={handleComplete}
      nextButtonText="Complete Lesson"
      showProgress={true}
      progressData={{
        text: `Step ${2} of ${2}`,
        percentage: (2 / 2) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Setting Up Credit Monitoring</Text>
        <Text style={lessonStyles.sectionText}>
          Set up credit monitoring services and learn how to regularly check your credit reports. Understand what to look for and how to respond to suspicious activity.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Free Credit Monitoring Options</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>AnnualCreditReport.com:</Text> Free yearly reports from all three bureaus</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Credit Karma:</Text> Free credit score and monitoring</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Credit Sesame:</Text> Free credit monitoring service</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Bank/Credit Union:</Text> Many offer free credit monitoring</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What to Monitor</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• New accounts opened in your name</Text>
          <Text style={lessonStyles.bulletPoint}>• Credit inquiries you didn't authorize</Text>
          <Text style={lessonStyles.bulletPoint}>• Changes in your credit score</Text>
          <Text style={lessonStyles.bulletPoint}>• Late payments or collections</Text>
          <Text style={lessonStyles.bulletPoint}>• Personal information changes</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Success Checklist</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>✅ Credit monitoring service set up</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Free credit reports requested</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Monitoring alerts enabled</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Regular review schedule established</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Know how to report suspicious activity</Text>
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
            <Text style={lessonStyles.celebrationEmoji}>📊</Text>
            <Text style={lessonStyles.celebrationTitle}>Credit Monitoring Pro!</Text>
            <Text style={lessonStyles.celebrationText}>
              You've learned how to set up credit monitoring and protect your credit score. Your credit monitoring skills will help you detect fraud early and maintain financial health!
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

export default CreditMonitoringSetupScreen;
