import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const DeviceUpdatesIntroScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('DeviceUpdatesImportanceScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Device Updates & Patches"
      subtitle="Why Updates Matter"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${1} of ${3}`,
        percentage: (1 / 3) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Why Updates Matter</Text>
        <Text style={lessonStyles.sectionText}>
          Software updates and security patches fix vulnerabilities that hackers can exploit. Keeping your devices updated is one of the most important steps you can take to protect yourself from cyber attacks.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What Updates Do</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Fix security vulnerabilities and bugs</Text>
          <Text style={lessonStyles.bulletPoint}>• Add new security features</Text>
          <Text style={lessonStyles.bulletPoint}>• Improve device performance</Text>
          <Text style={lessonStyles.bulletPoint}>• Protect against new threats</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What You'll Learn</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• How to enable automatic updates</Text>
          <Text style={lessonStyles.bulletPoint}>• Which devices need regular updates</Text>
          <Text style={lessonStyles.bulletPoint}>• How to check for available updates</Text>
          <Text style={lessonStyles.bulletPoint}>• Best practices for update management</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default DeviceUpdatesIntroScreen;
