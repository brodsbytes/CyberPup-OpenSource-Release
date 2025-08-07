import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const SocialMediaProfileScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('SocialMediaPracticeScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Social Media Privacy Settings"
      subtitle="Profile Information Management"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${3} of ${4}`,
        percentage: (3 / 4) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Profile Information Management</Text>
        <Text style={lessonStyles.sectionText}>
          Be careful about what personal information you share on social media. Avoid posting sensitive details like your full address, phone number, or financial information.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Information to Keep Private</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Full home address</Text>
          <Text style={lessonStyles.bulletPoint}>• Phone number</Text>
          <Text style={lessonStyles.bulletPoint}>• Financial information</Text>
          <Text style={lessonStyles.bulletPoint}>• Social Security number</Text>
          <Text style={lessonStyles.bulletPoint}>• Birth date (full)</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Safe Sharing Practices</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Use a nickname instead of full name</Text>
          <Text style={lessonStyles.bulletPoint}>• Don't share location in real-time</Text>
          <Text style={lessonStyles.bulletPoint}>• Be careful with photos and videos</Text>
          <Text style={lessonStyles.bulletPoint}>• Think before posting personal details</Text>
          <Text style={lessonStyles.bulletPoint}>• Review posts before sharing</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default SocialMediaProfileScreen;
