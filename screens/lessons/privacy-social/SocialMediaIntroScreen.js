import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const SocialMediaIntroScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('SocialMediaSettingsScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Social Media Privacy Settings"
      subtitle="Protecting Your Online Privacy"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${1} of ${4}`,
        percentage: (1 / 4) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Protecting Your Online Privacy</Text>
        <Text style={lessonStyles.sectionText}>
          Social media platforms collect and share your personal information. Learn how to configure privacy settings to control what information is visible to others and what data is collected about you.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Why Privacy Settings Matter</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Control who sees your information</Text>
          <Text style={lessonStyles.bulletPoint}>• Limit data collection and tracking</Text>
          <Text style={lessonStyles.bulletPoint}>• Protect against identity theft</Text>
          <Text style={lessonStyles.bulletPoint}>• Prevent unwanted contact</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What You'll Learn</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• How to configure privacy settings</Text>
          <Text style={lessonStyles.bulletPoint}>• Controlling profile visibility</Text>
          <Text style={lessonStyles.bulletPoint}>• Managing data sharing</Text>
          <Text style={lessonStyles.bulletPoint}>• Protecting personal information</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default SocialMediaIntroScreen;
