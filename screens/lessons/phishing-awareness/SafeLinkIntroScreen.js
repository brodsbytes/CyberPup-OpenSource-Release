import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const SafeLinkIntroScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('SafeLinkVerificationScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Safe Link Practices"
      subtitle="Verifying Links and URLs"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${1} of ${3}`,
        percentage: (1 / 3) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Verifying Links and URLs</Text>
        <Text style={lessonStyles.sectionText}>
          Always hover over links to see the actual destination URL before clicking. Look for HTTPS, check the domain name carefully, and be suspicious of shortened URLs. When in doubt, type the URL directly into your browser.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Why Link Safety Matters</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Malicious links can install malware</Text>
          <Text style={lessonStyles.bulletPoint}>• Phishing sites steal login credentials</Text>
          <Text style={lessonStyles.bulletPoint}>• Scam sites trick you into giving money</Text>
          <Text style={lessonStyles.bulletPoint}>• One click can compromise your security</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default SafeLinkIntroScreen;
