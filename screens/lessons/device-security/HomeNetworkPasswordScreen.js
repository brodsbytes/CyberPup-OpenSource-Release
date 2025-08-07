import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const HomeNetworkPasswordScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('HomeNetworkMonitoringScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Home Network Security"
      subtitle="Strong Wi-Fi Passwords"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${3} of ${5}`,
        percentage: (3 / 5) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Strong Wi-Fi Passwords</Text>
        <Text style={lessonStyles.sectionText}>
          Create a strong Wi-Fi password that's at least 12 characters long with a mix of letters, numbers, and symbols. Avoid personal information and use a password manager to store it securely.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Wi-Fi Password Requirements</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• At least 12 characters long</Text>
          <Text style={lessonStyles.bulletPoint}>• Mix of uppercase and lowercase letters</Text>
          <Text style={lessonStyles.bulletPoint}>• Include numbers and symbols</Text>
          <Text style={lessonStyles.bulletPoint}>• Avoid personal information</Text>
          <Text style={lessonStyles.bulletPoint}>• Use a password manager</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Password Examples</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Good: K9#mN2$pL8@vX5!</Text>
          <Text style={lessonStyles.bulletPoint}>• Good: Blue-Sky-2024-Secure!</Text>
          <Text style={lessonStyles.bulletPoint}>• Avoid: password123</Text>
          <Text style={lessonStyles.bulletPoint}>• Avoid: myname2024</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default HomeNetworkPasswordScreen;
