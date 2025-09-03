import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../theme';
import Animated, { useSharedValue, useDerivedValue } from 'react-native-reanimated';

import TabContainer from './SwipeableTabContainer';
import BottomNavigation from './BottomNavigation';
import WelcomeScreen from '../../screens/WelcomeScreen';
import InsightsScreen from '../../screens/InsightsScreen';
import ProfileScreen from '../../screens/ProfileScreen';
import { SCREEN_NAMES, TAB_NAVIGATION } from '../../constants';

/**
 * MainTabsScreen - Container for swipeable main tabs
 * 
 * This component wraps the three main screens (Home, Insights, Profile) 
 * with swipe navigation while maintaining the existing navigation structure
 * for all other screens in the app.
 */
const MainTabsScreen = ({ navigation, route }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const animationProgress = useSharedValue(0);
  
  // Map tab indices to screen names and IDs
  const tabs = [
    { 
      component: WelcomeScreen, 
      screenName: SCREEN_NAMES.WELCOME,
      id: 'home',
      title: 'Home'
    },
    { 
      component: InsightsScreen, 
      screenName: SCREEN_NAMES.INSIGHTS,
      id: 'insights',
      title: 'Insights'
    },
    { 
      component: ProfileScreen, 
      screenName: SCREEN_NAMES.PROFILE,
      id: 'profile',
      title: 'Profile'
    }
  ];

  // Handle initial route based on navigation params
  useEffect(() => {
    if (route?.params?.initialTab) {
      const tabIndex = tabs.findIndex(tab => tab.screenName === route.params.initialTab);
      if (tabIndex >= 0) {
        setActiveTabIndex(tabIndex);
      }
    }
  }, [route?.params?.initialTab]);

  // Update animation progress when tab changes
  useEffect(() => {
    animationProgress.value = activeTabIndex;
  }, [activeTabIndex]);

  // Handle tab index change from swipe
  const handleTabIndexChange = (newIndex) => {
    setActiveTabIndex(newIndex);
    
    // Optional: Update navigation state for deep linking
    // This ensures the URL/state reflects the current tab
    const targetScreen = tabs[newIndex].screenName;
    navigation.setParams({ currentTab: targetScreen });
  };

  // Handle bottom navigation tab press
  const handleBottomNavPress = (screenName) => {
    // Find the tab index for this screen
    const tabIndex = tabs.findIndex(tab => tab.screenName === screenName);
    
    if (tabIndex >= 0) {
      setActiveTabIndex(tabIndex);
    } else {
      // Handle navigation to non-main tab screens
      navigation.navigate(screenName);
    }
  };

  // Create screen components with proper navigation props
  const createScreenComponent = (TabComponent, index) => {
    const isActive = index === activeTabIndex;
    const tabInfo = tabs[index];
    
    return (
      <TabComponent
        key={`tab-${index}`}
        navigation={navigation}
        route={route}
        // Pass additional props that screens might expect
        activeTab={tabInfo.id}
        isTabActive={isActive}
        // For consistency with existing screen props
        onTabPress={handleBottomNavPress}
      />
    );
  };

  // Derived animated value for bottom navigation
  const bottomNavAnimationProgress = useDerivedValue(() => {
    return animationProgress.value;
  });

  return (
    <View style={[styles.container, { backgroundColor: Colors.surface }]}>
      {/* Main content area with tab container */}
      <View style={[styles.contentContainer, { backgroundColor: Colors.surface }]}>
        <TabContainer
          activeIndex={activeTabIndex}
          onIndexChange={handleTabIndexChange}
        >
          {tabs.map((tab, index) => 
            createScreenComponent(tab.component, index)
          )}
        </TabContainer>
      </View>

      {/* Bottom Navigation with animation sync */}
      <BottomNavigation
        activeTab={tabs[activeTabIndex].id}
        onTabPress={handleBottomNavPress}
        animationProgress={bottomNavAnimationProgress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
});

export default MainTabsScreen;
