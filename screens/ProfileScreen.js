import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import BottomNavigation from '../components/BottomNavigation';
import { Colors } from '../theme';

const ProfileScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Coming Soon</Text>
        <Text style={styles.description}>
          Your learning progress and settings will be available here.
        </Text>
      </View>
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab="profile"
        onTabPress={(screen) => {
          if (screen === 'Welcome') {
            navigation.navigate('Welcome');
          } else if (screen === 'Category') {
            navigation.navigate('CategoryScreen');
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.accent,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ProfileScreen;
