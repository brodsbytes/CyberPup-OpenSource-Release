import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const HomeNetworkIntroScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('HomeNetworkRouterScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Home Network Security"
      subtitle="Securing Your Wi-Fi Network"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${1} of ${5}`,
        percentage: (1 / 5) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Securing Your Wi-Fi Network</Text>
        <Text style={lessonStyles.sectionText}>
          Your home Wi-Fi network is the gateway to all your connected devices. Securing it properly protects your personal information, prevents unauthorized access, and keeps your devices safe from cyber threats.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Why Network Security Matters</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Protects all connected devices</Text>
          <Text style={lessonStyles.bulletPoint}>• Prevents unauthorized access</Text>
          <Text style={lessonStyles.bulletPoint}>• Keeps personal data secure</Text>
          <Text style={lessonStyles.bulletPoint}>• Prevents bandwidth theft</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What You'll Learn</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• How to secure your router</Text>
          <Text style={lessonStyles.bulletPoint}>• Setting up strong Wi-Fi passwords</Text>
          <Text style={lessonStyles.bulletPoint}>• Network monitoring and management</Text>
          <Text style={lessonStyles.bulletPoint}>• Guest network setup</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default HomeNetworkIntroScreen;
