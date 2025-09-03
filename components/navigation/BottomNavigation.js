import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { TAB_NAVIGATION } from '../../constants';
import { 
  responsiveIconSizes, 
  responsivePadding, 
  responsiveTypography,
  responsiveButtonHeight,
} from '../../utils/responsive';

const BottomNavigation = ({ activeTab, onTabPress, animationProgress }) => {
  const tabs = TAB_NAVIGATION.TABS;
  const insets = useSafeAreaInsets();
  
  // Animation values
  const tabAnimationValue = useSharedValue(0);
  const containerWidth = 300; // Match maxWidth from styles
  const tabWidth = containerWidth / tabs.length;
  
  // Update animation value when activeTab changes
  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (activeIndex >= 0) {
      tabAnimationValue.value = withSpring(activeIndex, {
        damping: 15, // Reduced from 20
        stiffness: 300, // Increased from 200 for faster response
      });
    }
  }, [activeTab]);

  // Use external animation progress if provided (from swipe gestures)
  const effectiveAnimationValue = animationProgress || tabAnimationValue;

  // Create animated tab component
  const AnimatedTabButton = ({ tab, index }) => {
    const isActive = activeTab === tab.id;
    
    const tabIconStyle = useAnimatedStyle(() => {
      const progress = interpolate(
        effectiveAnimationValue.value,
        [index - 0.5, index, index + 0.5],
        [0, 1, 0],
        'clamp'
      );
      
      return {
        transform: [
          {
            scale: interpolate(progress, [0, 1], [1, 1.02]), // Reduced scale effect
          },
        ],
      };
    });

    const tabTextStyle = useAnimatedStyle(() => {
      const progress = interpolate(
        effectiveAnimationValue.value,
        [index - 0.5, index, index + 0.5],
        [0, 1, 0],
        'clamp'
      );
      
      return {
        transform: [
          {
            scale: interpolate(progress, [0, 1], [1, 1.02]), // Reduced scale effect
          },
        ],
      };
    });

    return (
      <TouchableOpacity
        key={tab.id}
        style={styles.tab}
        onPress={() => onTabPress(tab.screen)}
        activeOpacity={0.7}
      >
        <Animated.View style={tabIconStyle}>
          <Ionicons
            name={isActive ? tab.iconActive : tab.icon}
            size={responsiveIconSizes.large}
            color={isActive ? Colors.accent : Colors.textSecondary}
          />
        </Animated.View>
        <Animated.Text style={[styles.tabText, tabTextStyle]}>
          {tab.title}
        </Animated.Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, responsivePadding.screen) }]}>
      <View style={styles.tabContainer}>
        {/* Tab buttons */}
        {tabs.map((tab, index) => (
          <AnimatedTabButton key={tab.id} tab={tab} index={index} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: responsivePadding.screen * 0.5,
    position: 'relative',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 300, // Limit width to keep buttons centered
    alignSelf: 'center',
    width: '100%',
    position: 'relative',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsivePadding.screen * 0.3,
    minHeight: responsiveButtonHeight.small,
    maxWidth: 100, // Ensure buttons don't get too wide
    zIndex: 2, // Ensure tabs are above background elements
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
