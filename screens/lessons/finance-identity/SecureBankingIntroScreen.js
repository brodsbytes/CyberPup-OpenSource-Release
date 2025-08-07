import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const SecureBankingIntroScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('SecureBankingPracticesScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Secure Online Banking"
      subtitle="Protecting Your Financial Accounts"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${1} of ${3}`,
        percentage: (1 / 3) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Protecting Your Financial Accounts</Text>
        <Text style={lessonStyles.sectionText}>
          Online banking is convenient but requires extra security measures. Learn how to bank safely online, protect your financial information, and avoid common banking scams.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Why Banking Security Matters</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Financial accounts contain sensitive information</Text>
          <Text style={lessonStyles.bulletPoint}>• Banking fraud can have serious consequences</Text>
          <Text style={lessonStyles.bulletPoint}>• Recovery from fraud can be difficult</Text>
          <Text style={lessonStyles.bulletPoint}>• Identity theft often starts with financial data</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What You'll Learn</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Secure online banking practices</Text>
          <Text style={lessonStyles.bulletPoint}>• How to spot banking scams</Text>
          <Text style={lessonStyles.bulletPoint}>• Protecting financial information</Text>
          <Text style={lessonStyles.bulletPoint}>• Monitoring account activity</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default SecureBankingIntroScreen;
