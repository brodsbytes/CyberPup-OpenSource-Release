import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const DigitalFootprintIntroScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('DigitalFootprintAssessmentScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Digital Footprint Management"
      subtitle="Understanding Your Online Presence"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${1} of ${3}`,
        percentage: (1 / 3) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Understanding Your Online Presence</Text>
        <Text style={lessonStyles.sectionText}>
          Your digital footprint is the trail of information you leave online. Learn how to assess, manage, and control what information about you is available on the internet.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What is a Digital Footprint?</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Information you post online</Text>
          <Text style={lessonStyles.bulletPoint}>• Data collected by websites and apps</Text>
          <Text style={lessonStyles.bulletPoint}>• Information others post about you</Text>
          <Text style={lessonStyles.bulletPoint}>• Your online activity and behavior</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Why It Matters</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Employers check online presence</Text>
          <Text style={lessonStyles.bulletPoint}>• Identity thieves use public information</Text>
          <Text style={lessonStyles.bulletPoint}>• Personal reputation can be affected</Text>
          <Text style={lessonStyles.bulletPoint}>• Privacy and security implications</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default DigitalFootprintIntroScreen;
