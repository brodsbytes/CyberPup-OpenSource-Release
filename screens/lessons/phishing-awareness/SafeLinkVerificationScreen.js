import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const SafeLinkVerificationScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('SafeLinkPracticeScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Safe Link Practices"
      subtitle="How to Verify Links Safely"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${2} of ${3}`,
        percentage: (2 / 3) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>How to Verify Links Safely</Text>
        <Text style={lessonStyles.sectionText}>
          Check for HTTPS, examine the domain name carefully, and be wary of shortened URLs. Use link scanning tools and when in doubt, type the URL directly into your browser instead of clicking.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Safe Link Checklist</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>✅ URL starts with HTTPS (not HTTP)</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Domain name is correct and familiar</Text>
          <Text style={lessonStyles.bulletPoint}>✅ No suspicious characters or misspellings</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Not a shortened URL (bit.ly, tinyurl, etc.)</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Source is trustworthy</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>When to Be Extra Cautious</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Links in unsolicited emails</Text>
          <Text style={lessonStyles.bulletPoint}>• Links promising prizes or money</Text>
          <Text style={lessonStyles.bulletPoint}>• Links from unknown sources</Text>
          <Text style={lessonStyles.bulletPoint}>• Links creating urgency or panic</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default SafeLinkVerificationScreen;
