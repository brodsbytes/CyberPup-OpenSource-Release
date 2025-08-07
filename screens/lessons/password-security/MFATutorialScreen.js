import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const MFATutorialScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('MFASetupScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Multi-Factor Authentication"
      subtitle="What is Multi-Factor Authentication?"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${1} of ${3}`,
        percentage: (1 / 3) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What is Multi-Factor Authentication?</Text>
        <Text style={lessonStyles.sectionText}>
          Multi-factor authentication (MFA) adds an extra layer of security by requiring something you know (password) plus something you have (phone, security key) or something you are (fingerprint, face scan). This makes it much harder for attackers to access your accounts.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>How MFA Works</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Step 1: Enter your password (something you know)</Text>
          <Text style={lessonStyles.bulletPoint}>• Step 2: Provide a second factor (something you have/are)</Text>
          <Text style={lessonStyles.bulletPoint}>• Step 3: Access granted only with both factors</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Types of Second Factors</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>SMS Codes</Text> - Text messages to your phone</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Authenticator Apps</Text> - Time-based codes (more secure)</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Security Keys</Text> - Physical devices (most secure)</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Biometrics</Text> - Fingerprint or face recognition</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default MFATutorialScreen;
