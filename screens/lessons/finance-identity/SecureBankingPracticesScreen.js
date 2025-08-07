import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const SecureBankingPracticesScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('SecureBankingPracticeScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Secure Online Banking"
      subtitle="Safe Banking Practices"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${2} of ${3}`,
        percentage: (2 / 3) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Safe Banking Practices</Text>
        <Text style={lessonStyles.sectionText}>
          Always use secure networks, enable two-factor authentication, monitor your accounts regularly, and never share banking credentials with anyone.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Secure Banking Checklist</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>✅ Use secure, private networks only</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Enable two-factor authentication</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Use strong, unique passwords</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Monitor accounts regularly</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Log out after each session</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Common Banking Scams</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Phishing emails:</Text> Fake bank emails asking for information</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Fake websites:</Text> Sites that look like your bank</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Phone scams:</Text> Callers pretending to be from your bank</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Text scams:</Text> SMS messages with suspicious links</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Red Flags to Watch For</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Requests for account numbers or passwords</Text>
          <Text style={lessonStyles.bulletPoint}>• Urgent language or threats</Text>
          <Text style={lessonStyles.bulletPoint}>• Suspicious links or attachments</Text>
          <Text style={lessonStyles.bulletPoint}>• Unusual account activity</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default SecureBankingPracticesScreen;
