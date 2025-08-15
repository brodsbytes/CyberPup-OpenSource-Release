import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive } from '../theme';
import { getAllChecks, getAreasByLevel } from '../data/courseData';
import BottomNavigation from '../components/BottomNavigation';
import { SCREEN_NAMES } from '../constants';

const InsightsScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Filter search results when search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      performSearch(searchQuery.trim());
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  }, [searchQuery]);

  const performSearch = (query) => {
    const allChecks = getAllChecks();
    const results = [];

    // Search through checks
    allChecks.forEach(check => {
      const matchesTitle = check.title.toLowerCase().includes(query.toLowerCase());
      const matchesLevel = check.levelTitle.toLowerCase().includes(query.toLowerCase());
      
      if (matchesTitle || matchesLevel) {
        const levelInfo = getLevelInfo(check.levelId);
        results.push({
          type: 'check',
          id: check.id,
          title: check.title,
          levelId: check.levelId,
          levelTitle: check.levelTitle,
          levelIcon: levelInfo.icon,
          levelColor: levelInfo.color,
        });
      }
    });

    // Search through levels
    const levelIds = [...new Set(allChecks.map(c => c.levelId))];
    levelIds.forEach(levelId => {
      const levelInfo = getLevelInfo(levelId);
      const matchesLevel = levelInfo.title.toLowerCase().includes(query.toLowerCase());
      
      if (matchesLevel) {
        const levelChecks = allChecks.filter(c => c.levelId === levelId);
        results.push({
          type: 'level',
          id: `level-${levelId}`,
          title: levelInfo.title,
          levelId: levelId,
          levelIcon: levelInfo.icon,
          levelColor: levelInfo.color,
          checkCount: levelChecks.length,
        });
      }
    });

    // Remove duplicates and sort (levels first, then checks)
    const uniqueResults = results.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );
    
    const sortedResults = uniqueResults.sort((a, b) => {
      if (a.type === 'level' && b.type === 'check') return -1;
      if (a.type === 'check' && b.type === 'level') return 1;
      return a.title.localeCompare(b.title);
    });

    setSearchResults(sortedResults);
  };

  const getLevelInfo = (levelId) => {
    const levels = [
      { id: 1, icon: '🐾', color: '#3498db', title: 'CyberPup Scout' },
      { id: 2, icon: '👁️', color: '#e74c3c', title: 'CyberPup Watchdog' },
      { id: 3, icon: '🛡', color: '#f39c12', title: 'CyberPup Guardian' },
    ];
    return levels.find(level => level.id === levelId) || { icon: '📚', color: Colors.accent, title: 'Unknown Level' };
  };

  const renderSearchResult = ({ item }) => {
    if (item.type === 'level') {
      return (
        <TouchableOpacity
          style={styles.searchResultCard}
          onPress={() => {
            navigation.navigate('ModuleListScreen', {
              category: {
                id: item.levelId,
                title: item.title,
                icon: item.levelIcon,
                color: item.levelColor,
              }
            });
            setSearchQuery('');
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.searchResultIcon, { backgroundColor: item.levelColor }]}>
            <Text style={styles.searchResultIconText}>{item.levelIcon}</Text>
          </View>
          <View style={styles.searchResultContent}>
            <Text style={styles.searchResultTitle}>{item.title}</Text>
            <Text style={styles.searchResultSubtitle}>{item.checkCount} checks</Text>
          </View>
          <Text style={styles.searchResultType}>Level</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          style={styles.searchResultCard}
          onPress={() => {
            const levelInfo = getLevelInfo(item.levelId);
            // Map check id to its screen
            const checkRoutes = {
              '1-0-1': SCREEN_NAMES.INITIAL_WELCOME,
              '1-1-1': SCREEN_NAMES.CHECK_1_1_STRONG_PASSWORDS,
              '1-1-2': SCREEN_NAMES.CHECK_1_2_HIGH_VALUE_ACCOUNTS,
              '1-1-3': SCREEN_NAMES.CHECK_1_3_PASSWORD_MANAGERS,
              '1-1-4': SCREEN_NAMES.CHECK_1_4_MFA_SETUP,
              '1-1-5': SCREEN_NAMES.CHECK_1_5_BREACH_CHECK,
              '1-2-1': SCREEN_NAMES.CHECK_1_2_1_SCREEN_LOCK,
              // TODO: Add more check screens as they are created
            };
            
            const routeName = checkRoutes[item.id] || SCREEN_NAMES.WELCOME;
            navigation.navigate(routeName, { 
              level: {
                id: item.levelId,
                title: item.levelTitle,
                icon: item.levelIcon,
                color: item.levelColor,
              }
            });
            setSearchQuery('');
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.searchResultIcon, { backgroundColor: item.levelColor }]}>
            <Text style={styles.searchResultIconText}>{item.levelIcon}</Text>
          </View>
          <View style={styles.searchResultContent}>
            <Text style={styles.searchResultTitle}>{item.title}</Text>
            <Text style={styles.searchResultSubtitle}>{item.levelTitle}</Text>
          </View>
          <Text style={styles.searchResultType}>Check</Text>
        </TouchableOpacity>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Insights</Text>
          <Text style={styles.headerSubtitle}>Search and discover security tips, areas, and levels</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={Colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for security tips, areas, or levels..."
              placeholderTextColor={Colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Search Results */}
        {isSearching && (
          <View style={styles.searchResultsContainer}>
            <Text style={styles.searchResultsTitle}>
              {searchResults.length > 0 ? `Found ${searchResults.length} result${searchResults.length === 1 ? '' : 's'}` : 'No results found'}
            </Text>
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.searchResultsList}
            />
          </View>
        )}

        {/* Placeholder content for future insights features */}
        {!isSearching && (
          <View style={styles.placeholderContainer}>
            <View style={styles.placeholderIcon}>
              <Ionicons name="bulb-outline" size={48} color={Colors.textSecondary} />
            </View>
            <Text style={styles.placeholderTitle}>Security Insights Coming Soon</Text>
            <Text style={styles.placeholderSubtitle}>
              Use the search bar above to find specific security checks and levels. 
              More insights and recommendations will be available here soon.
            </Text>
          </View>
        )}

        {/* Bottom spacing for tab navigation */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab="insights"
        onTabPress={(screen) => {
          console.log('InsightsScreen - Tab pressed:', screen);
          if (screen === 'Welcome') {
            navigation.navigate(SCREEN_NAMES.WELCOME);
          } else if (screen === 'ProfileScreen') {
            navigation.navigate(SCREEN_NAMES.PROFILE);
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
  scrollView: {
    flex: 1,
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
    marginBottom: Responsive.spacing.lg,
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
  searchInput: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    flex: 1,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  searchResultsContainer: {
    flex: 1,
    paddingHorizontal: Responsive.padding.screen,
    marginBottom: Responsive.spacing.lg,
  },
  searchResultsTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    marginBottom: Responsive.spacing.md,
  },
  searchResultsList: {
    paddingBottom: Responsive.spacing.lg,
  },
  searchResultCard: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.card,
    marginBottom: Responsive.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },
  searchResultIcon: {
    width: Responsive.iconSizes.xlarge,
    height: Responsive.iconSizes.xlarge,
    borderRadius: Responsive.iconSizes.xlarge / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Responsive.spacing.sm,
  },
  searchResultIconText: {
    fontSize: Typography.sizes.md,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  searchResultSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  searchResultType: {
    fontSize: Typography.sizes.sm,
    color: Colors.accent,
    fontWeight: Typography.weights.semibold,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    paddingHorizontal: Responsive.spacing.sm,
    paddingVertical: Responsive.spacing.xs,
    borderRadius: Responsive.borderRadius.medium,
  },
  placeholderContainer: {
    paddingHorizontal: Responsive.padding.screen,
    alignItems: 'center',
    paddingVertical: Responsive.spacing.xxl,
  },
  placeholderIcon: {
    marginBottom: Responsive.spacing.lg,
    opacity: 0.6,
  },
  placeholderTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.4,
    maxWidth: 300,
  },
  bottomSpacing: {
    height: Responsive.iconSizes.xlarge,
  },
});

export default InsightsScreen;
