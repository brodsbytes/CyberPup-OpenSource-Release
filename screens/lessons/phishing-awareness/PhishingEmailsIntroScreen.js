import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const PhishingEmailsIntroScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('PhishingEmailsRedFlagsScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Identifying Phishing Emails"
      subtitle="Common Phishing Red Flags"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${1} of ${4}`,
        percentage: (1 / 4) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Common Phishing Red Flags</Text>
        <Text style={lessonStyles.sectionText}>
          Look for urgent language, poor grammar, suspicious sender addresses, and requests for personal information. Phishing emails often create a sense of urgency to pressure you into acting quickly without thinking.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Why Phishing is Dangerous</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Phishing is the most common cyber attack method</Text>
          <Text style={lessonStyles.bulletPoint}>• Attackers impersonate trusted organizations</Text>
          <Text style={lessonStyles.bulletPoint}>• They steal passwords, personal info, and money</Text>
          <Text style={lessonStyles.bulletPoint}>• Even tech-savvy people can fall victim</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What You'll Learn</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Spot common phishing red flags</Text>
          <Text style={lessonStyles.bulletPoint}>• Analyze email headers and sender addresses</Text>
          <Text style={lessonStyles.bulletPoint}>• Verify legitimate requests safely</Text>
          <Text style={lessonStyles.bulletPoint}>• Practice identifying phishing attempts</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default PhishingEmailsIntroScreen;
