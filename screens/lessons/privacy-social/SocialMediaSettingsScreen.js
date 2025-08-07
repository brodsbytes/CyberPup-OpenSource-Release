import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const SocialMediaSettingsScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('SocialMediaProfileScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Social Media Privacy Settings"
      subtitle="Configuring Privacy Settings"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${2} of ${4}`,
        percentage: (2 / 4) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Configuring Privacy Settings</Text>
        <Text style={lessonStyles.sectionText}>
          Review and adjust privacy settings on all your social media accounts. Set profiles to private, control who can see your posts, and limit data sharing with third parties.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Key Privacy Settings</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Profile Privacy:</Text> Set to private/friends only</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Post Visibility:</Text> Control who sees your content</Text>
          <Text style={lessonStyles.bold}>• <Text style={lessonStyles.bold}>Data Sharing:</Text> Limit third-party access</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Location Services:</Text> Disable when not needed</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Platform-Specific Settings</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Facebook:</Text> Privacy Checkup, App permissions</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Instagram:</Text> Private account, Story privacy</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Twitter:</Text> Protected tweets, Data sharing</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>LinkedIn:</Text> Profile visibility, Connection settings</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default SocialMediaSettingsScreen;
