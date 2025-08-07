import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const PrivacyToolsCommunicationScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('PrivacyToolsPracticeScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Privacy-Focused Tools"
      subtitle="Encrypted Communication Tools"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${3} of ${4}`,
        percentage: (3 / 4) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Encrypted Communication Tools</Text>
        <Text style={lessonStyles.sectionText}>
          Use encrypted messaging apps and email services to protect your communications. These tools ensure that only you and your intended recipients can read your messages.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Encrypted Messaging Apps</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Signal:</Text> End-to-end encryption, open source</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>WhatsApp:</Text> End-to-end encryption (owned by Meta)</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Telegram:</Text> Optional end-to-end encryption</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Wickr:</Text> Self-destructing messages</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Privacy-Focused Email Services</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>ProtonMail:</Text> End-to-end encrypted email</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Tutanota:</Text> Encrypted email and calendar</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Mailfence:</Text> Privacy-focused email service</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Posteo:</Text> German privacy-focused email</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>VPN Services</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>NordVPN:</Text> Popular, good security features</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>ExpressVPN:</Text> Fast, reliable service</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>ProtonVPN:</Text> Free tier available</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Mullvad:</Text> Privacy-focused, no logging</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default PrivacyToolsCommunicationScreen;
