import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const DeviceUpdatesImportanceScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('DeviceUpdatesPracticeScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Device Updates & Patches"
      subtitle="Update Best Practices"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${2} of ${3}`,
        percentage: (2 / 3) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Update Best Practices</Text>
        <Text style={lessonStyles.sectionText}>
          Enable automatic updates whenever possible, check for updates regularly, and install them promptly. Don't ignore update notifications - they're there to protect you.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Devices That Need Updates</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Computers (Windows, Mac, Linux)</Text>
          <Text style={lessonStyles.bulletPoint}>• Smartphones and tablets</Text>
          <Text style={lessonStyles.bulletPoint}>• Web browsers (Chrome, Firefox, Safari)</Text>
          <Text style={lessonStyles.bulletPoint}>• Apps and software programs</Text>
          <Text style={lessonStyles.bulletPoint}>• Smart home devices</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Update Checklist</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>✅ Enable automatic updates</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Check for updates weekly</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Install updates promptly</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Keep all devices updated</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Don't ignore update notifications</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default DeviceUpdatesImportanceScreen;
