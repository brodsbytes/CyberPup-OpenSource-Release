import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { TAB_NAVIGATION } from '../constants';
import { 
  responsiveIconSizes, 
  responsivePadding, 
  responsiveTypography,
  responsiveButtonHeight,
  isSmallScreen 
} from '../utils/responsive';

const BottomNavigation = ({ activeTab, onTabPress }) => {
  const tabs = TAB_NAVIGATION.TABS;

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
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
                size={responsiveIconSizes.medium}
                color={isActive ? Colors.accent : Colors.textSecondary}
              />
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: isSmallScreen ? responsivePadding.screen * 0.5 : responsivePadding.screen,
    paddingTop: responsivePadding.screen * 0.5,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 300, // Limit width to keep buttons centered
    alignSelf: 'center',
    width: '100%',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsivePadding.screen * 0.3,
    minHeight: responsiveButtonHeight.small,
    maxWidth: 100, // Ensure buttons don't get too wide
  },
  tabText: {
    fontSize: responsiveTypography.sizes.xs,
    marginTop: responsivePadding.screen * 0.2,
    color: Colors.textSecondary,
    fontWeight: responsiveTypography.weights.medium,
  },
  activeTabText: {
    color: Colors.accent,
    fontWeight: responsiveTypography.weights.semibold,
  },
});

export default BottomNavigation;
