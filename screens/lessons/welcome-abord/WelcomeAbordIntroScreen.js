import React from 'react';
import { View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const WelcomeAbordIntroScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = async () => {
    try {
      // mark first step as completed so progress reflects movement through module
      const steps = ['6-1-1'];
      await AsyncStorage.setItem('module_6-1_completed_steps', JSON.stringify(steps));
    } catch (e) {}
    navigation.navigate('WelcomeAbordTipsScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Welcome Aboard"
      subtitle="Start Here"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${1} of ${2}`,
        percentage: (1 / 2) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Welcome to CyberPup</Text>
        <Text style={lessonStyles.sectionText}>
          CyberPup is your guided companion for building practical cybersecurity habits. This short
          welcome module explains what the app covers and how to navigate to get the most value in the shortest time.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What You'll Learn</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• How categories and modules are organized</Text>
          <Text style={lessonStyles.bulletPoint}>• How your progress and secure score work</Text>
          <Text style={lessonStyles.bulletPoint}>• Where to find practical, step-by-step actions</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default WelcomeAbordIntroScreen;


