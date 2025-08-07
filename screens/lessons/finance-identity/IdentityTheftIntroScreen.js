import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const IdentityTheftIntroScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('IdentityTheftResponseScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Identity Theft Response"
      subtitle="What to Do If Your Identity is Stolen"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${1} of ${2}`,
        percentage: (1 / 2) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What to Do If Your Identity is Stolen</Text>
        <Text style={lessonStyles.sectionText}>
          Identity theft can be devastating, but knowing how to respond quickly can minimize the damage. Learn the steps to take if you become a victim of identity theft.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Signs of Identity Theft</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Unauthorized charges on your accounts</Text>
          <Text style={lessonStyles.bulletPoint}>• New accounts opened in your name</Text>
          <Text style={lessonStyles.bulletPoint}>• Bills for services you didn't use</Text>
          <Text style={lessonStyles.bulletPoint}>• Collection calls for unknown debts</Text>
          <Text style={lessonStyles.bulletPoint}>• Denied credit applications</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What You'll Learn</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Immediate steps to take after discovery</Text>
          <Text style={lessonStyles.bulletPoint}>• How to report identity theft</Text>
          <Text style={lessonStyles.bulletPoint}>• Contacting credit bureaus and creditors</Text>
          <Text style={lessonStyles.bulletPoint}>• Preventing further damage</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default IdentityTheftIntroScreen;
