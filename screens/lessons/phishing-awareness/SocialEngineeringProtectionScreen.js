import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const SocialEngineeringProtectionScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('SocialEngineeringExamplesScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Social Engineering Tactics"
      subtitle="Protecting Against Social Engineering"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${3} of ${5}`,
        percentage: (3 / 5) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Protecting Against Social Engineering</Text>
        <Text style={lessonStyles.sectionText}>
          Always verify identities independently, be suspicious of urgent requests, and never share sensitive information without proper verification. Trust your instincts - if something feels wrong, it probably is.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Defense Strategies</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Verify identities through official channels</Text>
          <Text style={lessonStyles.bulletPoint}>• Be suspicious of urgent requests</Text>
          <Text style={lessonStyles.bulletPoint}>• Never share sensitive information without verification</Text>
          <Text style={lessonStyles.bulletPoint}>• Trust your instincts and gut feelings</Text>
          <Text style={lessonStyles.bulletPoint}>• Question unusual requests or scenarios</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default SocialEngineeringProtectionScreen;
