import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const DataSharingUnderstandingScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('DataSharingPracticeScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Data Sharing Awareness"
      subtitle="How to Minimize Data Sharing"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${2} of ${3}`,
        percentage: (2 / 3) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>How to Minimize Data Sharing</Text>
        <Text style={lessonStyles.sectionText}>
          Read privacy policies, adjust app permissions, use privacy-focused browsers, and be selective about what information you provide to online services.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Privacy Protection Steps</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Read privacy policies before using services</Text>
          <Text style={lessonStyles.bulletPoint}>• Adjust app permissions on your devices</Text>
          <Text style={lessonStyles.bulletPoint}>• Use privacy-focused browsers and search engines</Text>
          <Text style={lessonStyles.bulletPoint}>• Be selective about what information you share</Text>
          <Text style={lessonStyles.bulletPoint}>• Use VPN services for additional privacy</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>App Permission Checklist</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>✅ Only grant necessary permissions</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Disable location when not needed</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Limit camera and microphone access</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Review permissions regularly</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Remove unused apps</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default DataSharingUnderstandingScreen;
