import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme';
import { Ionicons } from '@expo/vector-icons';

const BottomNavigation = ({ activeTab, onTabPress }) => {
  const tabs = [
    {
      id: 'home',
      title: 'Home',
      icon: 'home',
      screen: 'Welcome'
    },
    {
      id: 'learn',
      title: 'Learn',
      icon: 'book-outline',
      screen: 'Category'
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: 'person-outline',
      screen: 'Profile'
    }
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => onTabPress(tab.screen)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? tab.icon.replace('-outline', '') : tab.icon}
              size={24}
              color={isActive ? Colors.accent : Colors.textSecondary}
            />
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: 20,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.accent,
    fontWeight: '600',
  },
});

export default BottomNavigation;
