import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const PrivacyToolsBrowsersScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('PrivacyToolsCommunicationScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Privacy-Focused Tools"
      subtitle="Privacy-Focused Browsers & Search"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${2} of ${4}`,
        percentage: (2 / 4) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Privacy-Focused Browsers & Search</Text>
        <Text style={lessonStyles.sectionText}>
          Switch to browsers and search engines that prioritize your privacy. These tools block trackers, don't store your search history, and provide more secure browsing experiences.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Recommended Privacy Browsers</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Firefox:</Text> Built-in privacy features, customizable</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Brave:</Text> Built-in ad and tracker blocking</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Tor Browser:</Text> Maximum privacy and anonymity</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Safari:</Text> Good privacy features on Apple devices</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Privacy-Focused Search Engines</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>DuckDuckGo:</Text> No tracking, no personalization</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Startpage:</Text> Google results without tracking</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Qwant:</Text> European privacy-focused search</Text>
          <Text style={lessonStyles.bulletPoint}>• <Text style={lessonStyles.bold}>Searx:</Text> Meta search engine with privacy</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default PrivacyToolsBrowsersScreen;
