import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const PrivacyToolsIntroScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('PrivacyToolsBrowsersScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Privacy-Focused Tools"
      subtitle="Discover Privacy-Enhancing Tools"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${1} of ${4}`,
        percentage: (1 / 4) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Discover Privacy-Enhancing Tools</Text>
        <Text style={lessonStyles.sectionText}>
          Learn about tools and services designed to protect your privacy online. From privacy-focused browsers to encrypted messaging apps, discover alternatives that prioritize your data security.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Why Privacy Tools Matter</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Reduce tracking and data collection</Text>
          <Text style={lessonStyles.bulletPoint}>• Encrypt your communications</Text>
          <Text style={lessonStyles.bulletPoint}>• Protect against surveillance</Text>
          <Text style={lessonStyles.bulletPoint}>• Give you more control over your data</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What You'll Learn</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Privacy-focused browsers and search engines</Text>
          <Text style={lessonStyles.bulletPoint}>• Encrypted messaging and email</Text>
          <Text style={lessonStyles.bulletPoint}>• VPN services and their benefits</Text>
          <Text style={lessonStyles.bulletPoint}>• Password managers and security tools</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default PrivacyToolsIntroScreen;
