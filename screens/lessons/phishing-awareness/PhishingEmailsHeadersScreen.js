import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const PhishingEmailsHeadersScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('PhishingEmailsPracticeScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Identifying Phishing Emails"
      subtitle="Verifying Legitimate Requests"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${3} of ${4}`,
        percentage: (3 / 4) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Verifying Legitimate Requests</Text>
        <Text style={lessonStyles.sectionText}>
          If you receive an email from a company asking for information, contact them directly using their official website or phone number. Never use contact information provided in a suspicious email.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Safe Verification Steps</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>1. Don't click links in suspicious emails</Text>
          <Text style={lessonStyles.bulletPoint}>2. Go directly to the company's official website</Text>
          <Text style={lessonStyles.bulletPoint}>3. Use the contact information from their official site</Text>
          <Text style={lessonStyles.bulletPoint}>4. Call their official customer service number</Text>
          <Text style={lessonStyles.bulletPoint}>5. Ask if the email request is legitimate</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What Legitimate Companies Never Do</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Ask for your password via email</Text>
          <Text style={lessonStyles.bulletPoint}>• Request sensitive information by email</Text>
          <Text style={lessonStyles.bulletPoint}>• Create extreme urgency or panic</Text>
          <Text style={lessonStyles.bulletPoint}>• Use threatening language</Text>
          <Text style={lessonStyles.bulletPoint}>• Ask you to click suspicious links</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Trust Your Instincts</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• If something feels wrong, it probably is</Text>
          <Text style={lessonStyles.bulletPoint}>• When in doubt, don't click</Text>
          <Text style={lessonStyles.bulletPoint}>• It's better to be cautious than sorry</Text>
          <Text style={lessonStyles.bulletPoint}>• Report suspicious emails to help others</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default PhishingEmailsHeadersScreen;
