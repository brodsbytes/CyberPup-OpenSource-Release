import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const ReportingScamsMethodsScreen = ({ navigation, route }) => {
  const { category } = route.params;
  const [showCelebration, setShowCelebration] = useState(false);
  const [scaleValue] = useState(new Animated.Value(0));

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const progress = await AsyncStorage.getItem('reporting_scams_progress');
      if (progress === 'completed') {
        // Don't auto-show celebration, only on completion
      }
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('reporting_scams_progress', 'completed');
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
      title="Reporting Scams"
      subtitle="Reporting Methods and Resources"
      onNext={handleComplete}
      nextButtonText="Complete Lesson"
      showProgress={true}
      progressData={{
        text: `Step ${2} of ${2}`,
        percentage: (2 / 2) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Reporting Methods and Resources</Text>
        <Text style={lessonStyles.sectionText}>
          Report phishing emails to the company being impersonated, report scams to the FTC, and report cybercrime to the FBI's IC3. Always preserve evidence and include relevant details in your reports.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Where to Report</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Phishing emails:</Text> Forward to the company being impersonated</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>General scams:</Text> FTC Complaint Assistant</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Cybercrime:</Text> FBI's Internet Crime Complaint Center (IC3)</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Identity theft:</Text> IdentityTheft.gov</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What to Include in Reports</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Screenshots or copies of suspicious messages</Text>
          <Text style={lessonStyles.bulletPoint}>• Email headers and sender information</Text>
          <Text style={lessonStyles.bulletPoint}>• Dates and times of incidents</Text>
          <Text style={lessonStyles.bulletPoint}>• Any financial losses or damages</Text>
          <Text style={lessonStyles.bulletPoint}>• Contact information for follow-up</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Success Checklist</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>✅ Know where to report different types of scams</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Understand what information to include</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Can preserve evidence properly</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Will report suspicious activity</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Help protect others from scams</Text>
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
            <Text style={lessonStyles.celebrationEmoji}>🚨</Text>
            <Text style={lessonStyles.celebrationTitle}>Scam Fighter!</Text>
            <Text style={lessonStyles.celebrationText}>
              You've learned how to report scams and suspicious activity effectively. Your reporting will help protect others and contribute to fighting cybercrime!
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

export default ReportingScamsMethodsScreen;
