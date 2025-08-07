import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const CreditMonitoringIntroScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('CreditMonitoringSetupScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Credit Monitoring"
      subtitle="Protecting Your Credit Score"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${1} of ${2}`,
        percentage: (1 / 2) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Protecting Your Credit Score</Text>
        <Text style={lessonStyles.sectionText}>
          Regular credit monitoring helps you detect fraud early and maintain a healthy credit score. Learn how to set up credit monitoring and understand what to look for in your credit reports.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Why Credit Monitoring Matters</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Early detection of identity theft</Text>
          <Text style={lessonStyles.bulletPoint}>• Protection against fraudulent accounts</Text>
          <Text style={lessonStyles.bulletPoint}>• Monitoring credit score changes</Text>
          <Text style={lessonStyles.bulletPoint}>• Ensuring accurate credit information</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What You'll Learn</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• How to set up credit monitoring</Text>
          <Text style={lessonStyles.bulletPoint}>• Understanding credit reports</Text>
          <Text style={lessonStyles.bulletPoint}>• Free vs. paid monitoring services</Text>
          <Text style={lessonStyles.bulletPoint}>• Responding to suspicious activity</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default CreditMonitoringIntroScreen;
