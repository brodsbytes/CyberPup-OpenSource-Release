import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const HomeNetworkMonitoringScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('HomeNetworkPracticeScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Home Network Security"
      subtitle="Network Monitoring & Management"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${4} of ${5}`,
        percentage: (4 / 5) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Network Monitoring & Management</Text>
        <Text style={lessonStyles.sectionText}>
          Regularly check your router's admin panel to see which devices are connected to your network. Remove any unknown devices and consider setting up a guest network for visitors.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Monitoring Your Network</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Check connected devices regularly</Text>
          <Text style={lessonStyles.bulletPoint}>• Remove unknown devices</Text>
          <Text style={lessonStyles.bulletPoint}>• Monitor network activity</Text>
          <Text style={lessonStyles.bulletPoint}>• Set up device alerts</Text>
          <Text style={lessonStyles.bulletPoint}>• Review router logs</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Guest Network Setup</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Create separate guest network</Text>
          <Text style={lessonStyles.bulletPoint}>• Use different password</Text>
          <Text style={lessonStyles.bulletPoint}>• Limit access to main network</Text>
          <Text style={lessonStyles.bulletPoint}>• Set time limits if possible</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default HomeNetworkMonitoringScreen;
