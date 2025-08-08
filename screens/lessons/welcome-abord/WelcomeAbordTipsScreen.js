import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const WelcomeAbordTipsScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    // End of intro module → back to module list
    navigation.navigate('ModuleListScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Welcome Aboard"
      subtitle="Tips for Success"
      onNext={handleNext}
      nextButtonText="Finish"
      showProgress={true}
      progressData={{
        text: `Step ${2} of ${2}`,
        percentage: (2 / 2) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>How to Get the Most Out of CyberPup</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Spend 5–10 minutes a day on one module</Text>
          <Text style={lessonStyles.bulletPoint}>• Apply at least one practical action after each lesson</Text>
          <Text style={lessonStyles.bulletPoint}>• Revisit topics and track your secure score improving</Text>
          <Text style={lessonStyles.bulletPoint}>• Ask yourself: “What can I secure today?”</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What This App Is Designed To Do</Text>
        <Text style={lessonStyles.sectionText}>
          Provide clear, actionable guidance—no jargon required. You will learn essentials across passwords,
          phishing, device security, privacy, and finances, with simple checklists and practice activities.
        </Text>
      </View>
    </BaseLessonScreen>
  );
};

export default WelcomeAbordTipsScreen;


