import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const DataSharingIntroScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('DataSharingUnderstandingScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Data Sharing Awareness"
      subtitle="Understanding What You're Sharing"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${1} of ${3}`,
        percentage: (1 / 3) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Understanding What You're Sharing</Text>
        <Text style={lessonStyles.sectionText}>
          Every time you use apps, websites, or online services, you're sharing data about yourself. Learn what data is being collected, how it's used, and how to minimize unnecessary sharing.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Types of Data Being Collected</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Personal information (name, email, phone)</Text>
          <Text style={lessonStyles.bulletPoint}>• Location data and GPS coordinates</Text>
          <Text style={lessonStyles.bulletPoint}>• Browsing history and search queries</Text>
          <Text style={lessonStyles.bulletPoint}>• Device information and identifiers</Text>
          <Text style={lessonStyles.bulletPoint}>• Usage patterns and behavior</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Why Data Collection Happens</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• To provide personalized services</Text>
          <Text style={lessonStyles.bulletPoint}>• For advertising and marketing</Text>
          <Text style={lessonStyles.bulletPoint}>• To improve products and services</Text>
          <Text style={lessonStyles.bulletPoint}>• For security and fraud prevention</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default DataSharingIntroScreen;
