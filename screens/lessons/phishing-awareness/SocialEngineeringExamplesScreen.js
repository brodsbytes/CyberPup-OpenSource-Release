import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const SocialEngineeringExamplesScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('SocialEngineeringPracticeScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Social Engineering Tactics"
      subtitle="Real-World Examples"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${4} of ${5}`,
        percentage: (4 / 5) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Real-World Examples</Text>
        <Text style={lessonStyles.sectionText}>
          Learn from real social engineering attacks. These examples show how attackers use psychological manipulation to bypass technical security measures. Understanding these tactics helps you recognize and avoid them.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Common Attack Scenarios</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Tech Support Scam:</Text> Caller claims to be from Microsoft/Apple</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>CEO Fraud:</Text> Impersonating company executives</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Romance Scams:</Text> Building fake relationships online</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Vishing:</Text> Voice phishing over phone calls</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default SocialEngineeringExamplesScreen;
