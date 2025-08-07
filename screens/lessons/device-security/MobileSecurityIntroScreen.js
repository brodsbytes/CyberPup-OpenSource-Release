import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const MobileSecurityIntroScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('MobileSecuritySettingsScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Mobile Device Security"
      subtitle="Protecting Your Smartphone & Tablet"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${1} of ${3}`,
        percentage: (1 / 3) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Protecting Your Smartphone & Tablet</Text>
        <Text style={lessonStyles.sectionText}>
          Mobile devices contain sensitive personal information and are often used for banking, shopping, and communication. Learn how to secure your smartphone and tablet from threats.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Mobile Security Threats</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Malicious apps and malware</Text>
          <Text style={lessonStyles.bulletPoint}>• Unauthorized access to data</Text>
          <Text style={lessonStyles.bulletPoint}>• Network attacks on public Wi-Fi</Text>
          <Text style={lessonStyles.bulletPoint}>• Physical theft and loss</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What You'll Learn</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• How to secure your mobile device</Text>
          <Text style={lessonStyles.bulletPoint}>• Safe app installation practices</Text>
          <Text style={lessonStyles.bulletPoint}>• Protecting against theft and loss</Text>
          <Text style={lessonStyles.bulletPoint}>• Safe public Wi-Fi usage</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default MobileSecurityIntroScreen;
