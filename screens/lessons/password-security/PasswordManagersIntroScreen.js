import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const PasswordManagersIntroScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('PasswordManagersBenefitsScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Password Managers"
      subtitle="Why Use a Password Manager?"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${1} of ${5}`,
        percentage: (1 / 5) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Why Use a Password Manager?</Text>
        <Text style={lessonStyles.sectionText}>
          Password managers securely store all your passwords in one place, generate strong passwords for you, and automatically fill them in when you visit websites. This eliminates the need to remember dozens of complex passwords and ensures each account has a unique, strong password.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Key Benefits</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Generate strong, unique passwords for each account</Text>
          <Text style={lessonStyles.bulletPoint}>• Automatically fill passwords when you visit websites</Text>
          <Text style={lessonStyles.bulletPoint}>• Store passwords securely with encryption</Text>
          <Text style={lessonStyles.bulletPoint}>• Sync across all your devices</Text>
          <Text style={lessonStyles.bulletPoint}>• Never forget a password again</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default PasswordManagersIntroScreen;
