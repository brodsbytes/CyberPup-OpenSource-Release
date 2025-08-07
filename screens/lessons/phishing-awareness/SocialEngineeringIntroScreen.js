import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const SocialEngineeringIntroScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('SocialEngineeringTechniquesScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Social Engineering Tactics"
      subtitle="Understanding Social Engineering"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${1} of ${5}`,
        percentage: (1 / 5) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Understanding Social Engineering</Text>
        <Text style={lessonStyles.sectionText}>
          Social engineering manipulates human psychology to gain access to information or systems. Attackers exploit trust, authority, urgency, and human nature to trick people into revealing sensitive information.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Why Social Engineering Works</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Exploits human psychology and emotions</Text>
          <Text style={lessonStyles.bulletPoint}>• Bypasses technical security measures</Text>
          <Text style={lessonStyles.bulletPoint}>• Uses trust and authority to manipulate</Text>
          <Text style={lessonStyles.bulletPoint}>• Creates urgency to prevent thinking</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What You'll Learn</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Common social engineering techniques</Text>
          <Text style={lessonStyles.bulletPoint}>• How to protect against manipulation</Text>
          <Text style={lessonStyles.bulletPoint}>• Real-world examples and case studies</Text>
          <Text style={lessonStyles.bulletPoint}>• Developing a security mindset</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default SocialEngineeringIntroScreen;
