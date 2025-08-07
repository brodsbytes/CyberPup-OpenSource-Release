import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const ReportingScamsIntroScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('ReportingScamsMethodsScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Reporting Scams"
      subtitle="How to Report Suspicious Activity"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${1} of ${2}`,
        percentage: (1 / 2) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>How to Report Suspicious Activity</Text>
        <Text style={lessonStyles.sectionText}>
          Reporting scams and suspicious activity helps protect others and can help authorities track down cybercriminals. Learn where and how to report different types of scams effectively.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Why Reporting Matters</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Helps protect others from the same scam</Text>
          <Text style={lessonStyles.bulletPoint}>• Assists law enforcement in tracking criminals</Text>
          <Text style={lessonStyles.bulletPoint}>• Helps companies improve their security</Text>
          <Text style={lessonStyles.bulletPoint}>• Contributes to cybersecurity awareness</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What You'll Learn</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Where to report different types of scams</Text>
          <Text style={lessonStyles.bulletPoint}>• What information to include in reports</Text>
          <Text style={lessonStyles.bulletPoint}>• How to preserve evidence</Text>
          <Text style={lessonStyles.bulletPoint}>• Protecting yourself while reporting</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default ReportingScamsIntroScreen;
