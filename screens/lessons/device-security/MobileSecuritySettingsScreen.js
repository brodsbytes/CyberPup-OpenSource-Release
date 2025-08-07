import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const MobileSecuritySettingsScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('MobileSecurityPracticeScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Mobile Device Security"
      subtitle="Security Settings & Best Practices"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${2} of ${3}`,
        percentage: (2 / 3) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Security Settings & Best Practices</Text>
        <Text style={lessonStyles.sectionText}>
          Enable device encryption, use strong passcodes or biometric authentication, keep your device updated, and only install apps from official app stores.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Essential Security Settings</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>✅ Enable device encryption</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Use strong passcode/biometric lock</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Enable Find My Device/Find My iPhone</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Keep device updated</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Enable automatic app updates</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Safe App Practices</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Only install from official app stores</Text>
          <Text style={lessonStyles.bulletPoint}>• Read app reviews and permissions</Text>
          <Text style={lessonStyles.bulletPoint}>• Don't jailbreak or root your device</Text>
          <Text style={lessonStyles.bulletPoint}>• Remove unused apps regularly</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Public Wi-Fi Safety</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Use VPN when on public Wi-Fi</Text>
          <Text style={lessonStyles.bulletPoint}>• Avoid banking on public networks</Text>
          <Text style={lessonStyles.bulletPoint}>• Turn off Wi-Fi when not needed</Text>
          <Text style={lessonStyles.bulletPoint}>• Use mobile data for sensitive activities</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default MobileSecuritySettingsScreen;
