import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive } from '../../theme';
import BottomNavigation from '../../components/navigation/BottomNavigation';
import SegmentedControl from '../../components/insights/SegmentedControl';
import LearnTab from './LearnTab';
import ToolsTab from './ToolsTab';
import { SCREEN_NAMES } from '../../constants';

const InsightsScreen = ({ navigation }) => {
  const [tab, setTab] = useState(0); // 0 = Learn, 1 = Tools
  const [query, setQuery] = useState('');

  const segments = ['Learn', 'Tools'];

  const handleTabChange = (index) => {
    setTab(index);
  };

  const handleTabPress = (screen) => {
    console.log('InsightsScreen - Tab pressed:', screen);
    if (screen === 'Welcome') {
      navigation.navigate(SCREEN_NAMES.WELCOME);
    } else if (screen === 'ProfileScreen') {
      navigation.navigate(SCREEN_NAMES.PROFILE);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Sticky Header */}
      <View style={styles.stickyHeader}>
        {/* Page Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Security Insights</Text>
          <Text style={styles.headerSubtitle}>
            Tools, guides, and alerts to keep you protected
          </Text>
        </View>

        {/* Segmented Control */}
        <SegmentedControl
          segments={segments}
          value={tab}
          onChange={handleTabChange}
        />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons 
              name="search" 
              size={Responsive.iconSizes.small} 
              color={Colors.textSecondary} 
              style={styles.searchIcon} 
            />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search guides, tools, and topics..."
              placeholderTextColor={Colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {tab === 0 ? (
          <LearnTab query={query} navigation={navigation} />
        ) : (
          <ToolsTab query={query} navigation={navigation} />
        )}
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab="insights"
        onTabPress={handleTabPress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  stickyHeader: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  header: {
    paddingHorizontal: Responsive.padding.screen,
    paddingTop: Responsive.spacing.lg,
    paddingBottom: Responsive.spacing.md,
  },
  headerTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * 1.4,
  },
  searchContainer: {
    paddingHorizontal: Responsive.padding.screen,
    paddingBottom: Responsive.spacing.md,
  },
  searchBar: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    paddingHorizontal: Responsive.spacing.md,
    paddingVertical: Responsive.padding.button,
    borderWidth: 1,
    borderColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: Responsive.buttonHeight.medium,
  },
  searchIcon: {
    marginRight: Responsive.spacing.sm,
  },
  searchInput: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    flex: 1,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  tabContent: {
    flex: 1,
  },
});

export default InsightsScreen;
