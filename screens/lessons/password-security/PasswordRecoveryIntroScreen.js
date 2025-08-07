import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const PasswordRecoveryIntroScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('PasswordRecoveryMethodsScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Password Recovery"
      subtitle="Secure Password Recovery Methods"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${1} of ${2}`,
        percentage: (1 / 2) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Secure Password Recovery Methods</Text>
        <Text style={lessonStyles.sectionText}>
          When setting up password recovery, use a dedicated recovery email that's different from your main email. Avoid using security questions that can be easily researched online. Consider using recovery codes or backup authentication methods.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Why Secure Recovery Matters</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Recovery methods can be exploited by attackers</Text>
          <Text style={lessonStyles.bulletPoint}>• Weak recovery options undermine strong passwords</Text>
          <Text style={lessonStyles.bulletPoint}>• Recovery accounts need the same security as main accounts</Text>
          <Text style={lessonStyles.bulletPoint}>• Backup methods prevent permanent account loss</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Key Principles</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Use a dedicated recovery email address</Text>
          <Text style={lessonStyles.bulletPoint}>• Avoid easily guessable security questions</Text>
          <Text style={lessonStyles.bulletPoint}>• Enable backup authentication methods</Text>
          <Text style={lessonStyles.bulletPoint}>• Keep recovery information secure and updated</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default PasswordRecoveryIntroScreen;
