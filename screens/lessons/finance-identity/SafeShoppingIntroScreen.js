import React from 'react';
import { View, Text } from 'react-native';
import BaseLessonScreen from '../BaseLessonScreen';
import { lessonStyles } from '../lessonStyles';

const SafeShoppingIntroScreen = ({ navigation, route }) => {
  const { category } = route.params;

  const handleNext = () => {
    navigation.navigate('SafeShoppingPracticesScreen', { category });
  };

  return (
    <BaseLessonScreen
      navigation={navigation}
      route={route}
      title="Safe Online Shopping"
      subtitle="Protecting Your Financial Information"
      onNext={handleNext}
      nextButtonText="Continue"
      showProgress={true}
      progressData={{
        text: `Step ${1} of ${2}`,
        percentage: (1 / 2) * 100
      }}
    >
      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Protecting Your Financial Information</Text>
        <Text style={lessonStyles.sectionText}>
          Online shopping is convenient but requires careful attention to security. Learn how to shop safely online, protect your payment information, and avoid common shopping scams.
        </Text>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>Why Shopping Security Matters</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• Payment information is valuable to thieves</Text>
          <Text style={lessonStyles.bulletPoint}>• Fake websites can steal your data</Text>
          <Text style={lessonStyles.bulletPoint}>• Scam products can waste your money</Text>
          <Text style={lessonStyles.bulletPoint}>• Identity theft often starts with shopping fraud</Text>
        </View>
      </View>

      <View style={lessonStyles.section}>
        <Text style={lessonStyles.sectionTitle}>What You'll Learn</Text>
        <View style={lessonStyles.bulletList}>
          <Text style={lessonStyles.bulletPoint}>• How to identify secure shopping websites</Text>
          <Text style={lessonStyles.bulletPoint}>• Safe payment methods and practices</Text>
          <Text style={lessonStyles.bulletPoint}>• Avoiding common shopping scams</Text>
          <Text style={lessonStyles.bulletPoint}>• Protecting your payment information</Text>
        </View>
      </View>
    </BaseLessonScreen>
  );
};

export default SafeShoppingIntroScreen;
