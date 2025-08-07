import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const PasswordManagersOptionsScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('PasswordManagersSetupScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Password Managers"
      subtitle="Setting Up Your First Password Manager"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${3} of ${5}`,
        percentage: (3 / 5) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Setting Up Your First Password Manager</Text>
        <Text style={lessonStyles.sectionText}>
          Download your chosen password manager, create a master password (make this one extra strong!), and start by adding your most important accounts like email and banking. Take your time to explore the features and settings.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Setup Steps</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>1. Download and install your chosen password manager</Text>
          <Text style={lessonStyles.bulletPoint}>2. Create a strong master password (use a passphrase)</Text>
          <Text style={lessonStyles.bulletPoint}>3. Enable two-factor authentication</Text>
          <Text style={lessonStyles.bulletPoint}>4. Start with your most important accounts</Text>
          <Text style={lessonStyles.bulletPoint}>5. Explore the features and settings</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Important Tips</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Your master password is the key to everything - make it strong!</Text>
          <Text style={lessonStyles.bulletPoint}>• Start with email and banking accounts first</Text>
          <Text style={lessonStyles.bulletPoint}>• Don't rush - take time to understand the features</Text>
          <Text style={lessonStyles.bulletPoint}>• Set up automatic backups if available</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default PasswordManagersOptionsScreen;
