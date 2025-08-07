import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const SafeShoppingPracticesScreen = ({ navigation, route }) => {
  const { category } = route.params;
  const [showCelebration, setShowCelebration] = useState(false);
  const [scaleValue] = useState(new Animated.Value(0));

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const progress = await AsyncStorage.getItem('safe_shopping_progress');
      if (progress === 'completed') {
        // Don't auto-show celebration, only on completion
      }
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('safe_shopping_progress', 'completed');
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
      title="Safe Online Shopping"
      subtitle="Secure Shopping Practices"
      onNext={handleComplete}
      nextButtonText="Complete Lesson"
      showProgress={true}
      progressData={{
        text: `Step ${2} of ${2}`,
        percentage: (2 / 2) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Secure Shopping Practices</Text>
        <Text style={lessonStyles.sectionText}>
          Always shop on secure websites, use safe payment methods, and be cautious of deals that seem too good to be true. Protect your payment information and monitor your accounts.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Safe Shopping Checklist</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>✅ Shop on secure websites (HTTPS)</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Use credit cards or secure payment methods</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Avoid deals that seem too good to be true</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Check seller reviews and ratings</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Monitor your accounts after purchases</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Common Shopping Scams</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Fake websites:</Text> Sites that look like legitimate stores</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Counterfeit products:</Text> Fake or low-quality items</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Phishing emails:</Text> Fake order confirmations</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Overpayment scams:</Text> Buyers sending too much money</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Red Flags to Watch For</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Prices that are too good to be true</Text>
          <Text style={lessonStyles.bulletPoint}>• Requests for unusual payment methods</Text>
          <Text style={lessonStyles.bulletPoint}>• Poor website design or spelling errors</Text>
          <Text style={lessonStyles.bulletPoint}>• No contact information or customer service</Text>
          <Text style={lessonStyles.bulletPoint}>• Pressure to act quickly</Text>
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
            <Text style={lessonStyles.celebrationEmoji}>🛒</Text>
            <Text style={lessonStyles.celebrationTitle}>Safe Shopping Expert!</Text>
            <Text style={lessonStyles.celebrationText}>
              You've learned how to shop safely online and protect your payment information. Your shopping security skills will help you avoid scams and protect your finances!
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

export default SafeShoppingPracticesScreen;
