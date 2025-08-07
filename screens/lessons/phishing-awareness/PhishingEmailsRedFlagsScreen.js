import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const PhishingEmailsRedFlagsScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('PhishingEmailsHeadersScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Identifying Phishing Emails"
      subtitle="Analyzing Email Headers"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${2} of ${4}`,
        percentage: (2 / 4) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Analyzing Email Headers</Text>
        <Text style={lessonStyles.sectionText}>
          Check the sender's email address carefully. Phishing emails often use addresses that look similar to legitimate ones but have slight differences. Hover over links to see the actual destination URL before clicking.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Suspicious Sender Patterns</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Slight misspellings:</Text> support@microsft.com (should be microsoft)</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Extra characters:</Text> support@microsoft-secure.com</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Different domains:</Text> support@microsoft.support.com</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Random strings:</Text> support@microsoft-verify-123.com</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Red Flags to Watch For</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Urgent language ("Act now!" "Your account will be suspended")</Text>
          <Text style={lessonStyles.bulletPoint}>• Poor grammar and spelling errors</Text>
          <Text style={lessonStyles.bulletPoint}>• Requests for personal information</Text>
          <Text style={lessonStyles.bulletPoint}>• Threats or pressure tactics</Text>
          <Text style={lessonStyles.bulletPoint}>• Unusual sender addresses</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default PhishingEmailsRedFlagsScreen;
