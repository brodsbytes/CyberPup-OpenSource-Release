import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const AntivirusIntroScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('AntivirusSelectionScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Antivirus & Firewalls"
      subtitle="Choosing Security Software"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${1} of ${4}`,
        percentage: (1 / 4) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Choosing Security Software</Text>
        <Text style={lessonStyles.sectionText}>
          Antivirus software and firewalls are essential layers of protection for your devices. Learn how to choose the right security software for your needs and configure it properly.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Why Security Software Matters</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Detects and removes malware</Text>
          <Text style={lessonStyles.bulletPoint}>• Blocks malicious websites</Text>
          <Text style={lessonStyles.bulletPoint}>• Protects against phishing</Text>
          <Text style={lessonStyles.bulletPoint}>• Monitors system activity</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What You'll Learn</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• How to choose antivirus software</Text>
          <Text style={lessonStyles.bulletPoint}>• Configuring firewalls properly</Text>
          <Text style={lessonStyles.bulletPoint}>• Free vs. paid security options</Text>
          <Text style={lessonStyles.bulletPoint}>• Best practices for security software</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default AntivirusIntroScreen;
