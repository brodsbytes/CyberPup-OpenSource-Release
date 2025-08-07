import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const AntivirusSelectionScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('AntivirusConfigurationScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Antivirus & Firewalls"
      subtitle="Selecting the Right Software"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${2} of ${4}`,
        percentage: (2 / 4) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Selecting the Right Software</Text>
        <Text style={lessonStyles.sectionText}>
          Choose antivirus software from reputable companies with good reviews. Consider both free and paid options, and ensure the software is compatible with your operating system.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Recommended Antivirus Options</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Free:</Text> Windows Defender, Avast, AVG</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Paid:</Text> Norton, McAfee, Bitdefender</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Built-in:</Text> Windows Defender (Windows), XProtect (Mac)</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Mobile:</Text> Lookout, Avast Mobile Security</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What to Look For</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Real-time protection</Text>
          <Text style={lessonStyles.bulletPoint}>• Regular updates</Text>
          <Text style={lessonStyles.bulletPoint}>• Good detection rates</Text>
          <Text style={lessonStyles.bulletPoint}>• Low system impact</Text>
          <Text style={lessonStyles.bulletPoint}>• User-friendly interface</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default AntivirusSelectionScreen;
