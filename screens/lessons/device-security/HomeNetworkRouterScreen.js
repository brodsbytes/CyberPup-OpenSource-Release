import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const HomeNetworkRouterScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('HomeNetworkPasswordScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Home Network Security"
      subtitle="Router Security Settings"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${2} of ${5}`,
        percentage: (2 / 5) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Router Security Settings</Text>
        <Text style={lessonStyles.sectionText}>
          Access your router's admin panel and change default settings. Use WPA3 encryption if available, disable WPS, and change the default admin password to something strong and unique.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Router Security Checklist</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>✅ Change default admin password</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Use WPA3 or WPA2 encryption</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Disable WPS (Wi-Fi Protected Setup)</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Change default network name (SSID)</Text>
          <Text style={lessonStyles.bulletPoint}>✅ Enable firewall features</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Accessing Router Settings</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Connect to your Wi-Fi network</Text>
          <Text style={lessonStyles.bulletPoint}>• Open browser and go to router IP (usually 192.168.1.1)</Text>
          <Text style={lessonStyles.bulletPoint}>• Log in with admin credentials</Text>
          <Text style={lessonStyles.bulletPoint}>• Look for Security or Wireless settings</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default HomeNetworkRouterScreen;
