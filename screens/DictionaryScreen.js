import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import BottomNavigation from '../components/BottomNavigation';

const DictionaryScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Dictionary</Text>
        <Text style={styles.subtitle}>Coming Soon</Text>
        <Text style={styles.description}>
          Cybersecurity terms and definitions will be available here.
        </Text>
      </View>
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab="dictionary"
        onTabPress={(screen) => {
          if (screen === 'Welcome') {
            navigation.navigate('Welcome');
          } else if (screen === 'Category') {
            navigation.navigate('CategoryScreen');
          } else if (screen === 'Profile') {
            navigation.navigate('ProfileScreen');
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    color: '#1a365d',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#4a90e2',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default DictionaryScreen;
