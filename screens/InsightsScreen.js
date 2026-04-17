import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive } from '../theme';

import SegmentedControl from '../components/insights/SegmentedControl';
import LearnTabContent from './Insights/LearnTabContent';
import ToolsTabContent from './Insights/ToolsTabContent';
import { SCREEN_NAMES } from '../constants';
import StickyGamificationBar from '../components/gamification/StickyGamificationBar';
import StreakDetailsModal from './StreakDetailsScreen';
import BadgesModal from './BadgesScreen';
import CatalogueModal from '../components/navigation/CatalogueModal';
import { trackEvent, trackScreenView, trackToolUsage, trackGuideView } from '../utils/analytics';
import { cyberPupLogger, LOG_CATEGORIES } from '../utils/logger';

const InsightsScreen = ({ navigation }) => {
  const [tab, setTab] = useState(0); // 0 = Learn, 1 = Tools
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showStreakDetails, setShowStreakDetails] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showCatalogue, setShowCatalogue] = useState(false);

  const segments = ['Learn', 'Tools'];

  useEffect(() => {
    cyberPupLogger.debug(LOG_CATEGORIES.NAVIGATION, 'InsightsScreen: Component mounted');
    
    // Track screen view
    trackScreenView('insights_screen', {
      tab: tab === 0 ? 'learn' : 'tools'
    });
  }, []);

  useEffect(() => {
    cyberPupLogger.debug(LOG_CATEGORIES.NAVIGATION, `InsightsScreen: Tab changed to ${tab === 0 ? 'Learn' : 'Tools'}`);
    
    // Track tab changes
    trackEvent('insights_tab_changed', {
      tab_name: tab === 0 ? 'learn' : 'tools',
      previous_tab: tab === 0 ? 'tools' : 'learn'
    });
  }, [tab]);

  const handleTabChange = (index) => {
    setTab(index);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Small delay to show refresh indicator
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleTabPress = (screen) => {
    cyberPupLogger.debug(LOG_CATEGORIES.NAVIGATION, 'InsightsScreen - Tab pressed', { screen });
    if (screen === 'Welcome') {
      navigation.navigate(SCREEN_NAMES.WELCOME);
    } else if (screen === 'ProfileScreen') {
      navigation.navigate(SCREEN_NAMES.PROFILE);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Sticky Gamification Bar */}
      <StickyGamificationBar
        onMascotPress={() => setShowCatalogue(true)}
        onStreakPress={() => setShowStreakDetails(true)}
        onBadgesPress={() => setShowBadges(true)}
      />
      
      {/* Sticky Header */}
      <View style={styles.stickyHeader}>
        {/* Page Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Security Insights</Text>
          <Text style={styles.headerSubtitle}>
            Tools, guides and alerts to keep you protected
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

      {/* Single ScrollView for both tabs - Modern mobile app approach */}
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.accent]}
            tintColor={Colors.accent}
          />
        }
      >
        {tab === 0 ? (
          <LearnTabContent 
            query={query} 
            navigation={navigation}
          />
        ) : (
          <ToolsTabContent 
            query={query} 
            navigation={navigation}
          />
        )}
      </ScrollView>



      {/* Modal Components */}
      <StreakDetailsModal
        visible={showStreakDetails}
        onClose={() => setShowStreakDetails(false)}
      />
      
      <BadgesModal
        visible={showBadges}
        onClose={() => setShowBadges(false)}
      />

      <CatalogueModal
        visible={showCatalogue}
        onClose={() => setShowCatalogue(false)}
        navigation={navigation}
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
    paddingTop: Responsive.spacing.md,
    paddingBottom: Responsive.spacing.md,
  },
  headerTitle: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.lg * 1.5,
  },
  searchContainer: {
    paddingHorizontal: Responsive.padding.screen,
    paddingBottom: Responsive.spacing.md,
    marginTop: Responsive.spacing.xs,
  },
  searchBar: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.xlarge,
    paddingHorizontal: Responsive.spacing.lg,
    paddingVertical: Responsive.padding.button * 1.5,
    borderWidth: 1,
    borderColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: Responsive.buttonHeight.large,
  },
  searchIcon: {
    marginRight: Responsive.spacing.md,
  },
  searchInput: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    flex: 1,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
});

export default InsightsScreen;
