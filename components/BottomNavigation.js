import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { TAB_NAVIGATION } from '../constants';

const BottomNavigation = ({ activeTab, onTabPress }) => {
  const tabs = TAB_NAVIGATION.TABS;

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
    paddingBottom: Spacing.lg + Spacing.sm,
    paddingTop: Spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  tabText: {
    fontSize: 12,
    marginTop: Spacing.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.accent,
    fontWeight: '600',
  },
});

export default BottomNavigation;
