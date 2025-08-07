import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const MFASetupScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('MFAPracticeScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Multi-Factor Authentication"
      subtitle="Setting Up 2FA on Your Accounts"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${2} of ${3}`,
        percentage: (2 / 3) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Setting Up 2FA on Your Accounts</Text>
        <Text style={lessonStyles.sectionText}>
          Start with your most important accounts like email, banking, and social media. Most services offer SMS codes, authenticator apps, or security keys. Authenticator apps like Google Authenticator or Authy are generally more secure than SMS.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Priority Accounts to Secure</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Email accounts (Gmail, Outlook, etc.)</Text>
          <Text style={lessonStyles.bulletPoint}>• Banking and financial accounts</Text>
          <Text style={lessonStyles.bulletPoint}>• Social media accounts</Text>
          <Text style={lessonStyles.bulletPoint}>• Cloud storage (Google Drive, Dropbox)</Text>
          <Text style={lessonStyles.bulletPoint}>• Password manager account</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Setup Process</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>1. Go to account security settings</Text>
          <Text style={lessonStyles.bulletPoint}>2. Enable two-factor authentication</Text>
          <Text style={lessonStyles.bulletPoint}>3. Choose your preferred method</Text>
          <Text style={lessonStyles.bulletPoint}>4. Follow the setup instructions</Text>
          <Text style={lessonStyles.bulletPoint}>5. Test the authentication</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Recommended Authenticator Apps</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Google Authenticator</Text> - Simple and reliable</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Authy</Text> - Cloud backup and multi-device</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Microsoft Authenticator</Text> - Good for Microsoft accounts</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>1Password</Text> - Built into password manager</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default MFASetupScreen;
