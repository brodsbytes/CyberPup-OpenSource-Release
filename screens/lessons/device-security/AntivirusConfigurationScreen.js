import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const AntivirusConfigurationScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('AntivirusPracticeScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Antivirus & Firewalls"
      subtitle="Configuration & Best Practices"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${3} of ${4}`,
        percentage: (3 / 4) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Configuration & Best Practices</Text>
        <Text style={lessonStyles.sectionText}>
          Configure your antivirus software properly and enable your firewall. Set up automatic scans, keep definitions updated, and don't disable security features unless absolutely necessary.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Antivirus Configuration</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>✅ Enable real-time protection</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Set up automatic scans</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Enable automatic updates</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Configure quarantine settings</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Enable web protection</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Firewall Settings</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Enable Windows Firewall (Windows)</Text>
          <Text style={lessonStyles.bulletPoint}>• Enable macOS Firewall (Mac)</Text>
          <Text style={lessonStyles.bulletPoint}>• Configure app permissions</Text>
          <Text style={lessonStyles.bulletPoint}>• Block suspicious connections</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default AntivirusConfigurationScreen;
