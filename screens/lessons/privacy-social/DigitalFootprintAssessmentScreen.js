import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const DigitalFootprintAssessmentScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('DigitalFootprintPracticeScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Digital Footprint Management"
      subtitle="Assessing Your Digital Footprint"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${2} of ${3}`,
        percentage: (2 / 3) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Assessing Your Digital Footprint</Text>
        <Text style={lessonStyles.sectionText}>
          Search for yourself online to see what information is publicly available. Check social media profiles, review websites, and other online sources to understand your current digital footprint.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>How to Search for Yourself</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Google your name in quotes</Text>
          <Text style={lessonStyles.bulletPoint}>• Search with your city/state</Text>
          <Text style={lessonStyles.bulletPoint}>• Check social media platforms</Text>
          <Text style={lessonStyles.bulletPoint}>• Look at review websites</Text>
          <Text style={lessonStyles.bulletPoint}>• Check professional networks</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What to Look For</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Personal information (address, phone)</Text>
          <Text style={lessonStyles.bulletPoint}>• Photos and videos</Text>
          <Text style={lessonStyles.bulletPoint}>• Social media posts</Text>
          <Text style={lessonStyles.bulletPoint}>• Professional information</Text>
          <Text style={lessonStyles.bulletPoint}>• Reviews or mentions by others</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default DigitalFootprintAssessmentScreen;
