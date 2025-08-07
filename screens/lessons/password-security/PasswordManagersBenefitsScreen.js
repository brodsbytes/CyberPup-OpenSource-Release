import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const PasswordManagersBenefitsScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('PasswordManagersOptionsScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Password Managers"
      subtitle="Popular Password Manager Options"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${2} of ${5}`,
        percentage: (2 / 5) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Popular Password Manager Options</Text>
        <Text style={lessonStyles.sectionText}>
          Some popular options include LastPass, 1Password, Bitwarden, and Dashlane. Most offer free versions with basic features and premium versions with advanced security features like secure sharing and emergency access.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Top Recommendations</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Bitwarden</Text> - Free, open-source, feature-rich</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>1Password</Text> - Premium, excellent security features</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>LastPass</Text> - Popular, good free tier</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Dashlane</Text> - User-friendly, VPN included</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What to Look For</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Strong encryption (AES-256)</Text>
          <Text style={lessonStyles.bulletPoint}>• Two-factor authentication support</Text>
          <Text style={lessonStyles.bulletPoint}>• Cross-platform compatibility</Text>
          <Text style={lessonStyles.bulletPoint}>• Regular security audits</Text>
          <Text style={lessonStyles.bulletPoint}>• Good customer support</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default PasswordManagersBenefitsScreen;
