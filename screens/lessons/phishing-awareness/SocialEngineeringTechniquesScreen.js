import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const SocialEngineeringTechniquesScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('SocialEngineeringProtectionScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Social Engineering Tactics"
      subtitle="Common Social Engineering Techniques"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${2} of ${5}`,
        percentage: (2 / 5) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Common Social Engineering Techniques</Text>
        <Text style={lessonStyles.sectionText}>
          Pretexting creates a false scenario to gain information. Baiting uses physical media to spread malware. Quid pro quo offers a service in exchange for information. Tailgating follows authorized personnel into restricted areas.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Technique Breakdown</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Pretexting:</Text> Creating fake scenarios to gain trust</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Baiting:</Text> Using physical media to spread malware</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Quid Pro Quo:</Text> Offering services for information</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Tailgating:</Text> Following authorized personnel</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default SocialEngineeringTechniquesScreen;
