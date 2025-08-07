import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const PasswordManagersSetupScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('PasswordManagersPracticeScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Password Managers"
      subtitle="Security Best Practices"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${4} of ${5}`,
        percentage: (4 / 5) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Security Best Practices</Text>
        <Text style={lessonStyles.sectionText}>
          Never share your master password, enable two-factor authentication on your password manager account, and regularly backup your password database. Consider using a passphrase for your master password instead of a single word.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Essential Security Steps</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Never share your master password with anyone</Text>
          <Text style={lessonStyles.bulletPoint}>• Enable two-factor authentication on your password manager</Text>
          <Text style={lessonStyles.bulletPoint}>• Use a strong passphrase for your master password</Text>
          <Text style={lessonStyles.bulletPoint}>• Regularly backup your password database</Text>
          <Text style={lessonStyles.bulletPoint}>• Keep your password manager updated</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Master Password Tips</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Use a passphrase instead of a single word</Text>
          <Text style={lessonStyles.bulletPoint}>• Make it at least 20 characters long</Text>
          <Text style={lessonStyles.bulletPoint}>• Include numbers, symbols, and mixed case</Text>
          <Text style={lessonStyles.bulletPoint}>• Make it memorable but not predictable</Text>
          <Text style={lessonStyles.bulletPoint}>• Write it down and store it securely</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default PasswordManagersSetupScreen;
