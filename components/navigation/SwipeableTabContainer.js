import React from 'react';
import { View } from 'react-native';
import { Colors } from '../../theme';

/**
 * TabContainer - Simple tab container that renders only the active tab
 * 
 * Features:
 * - Clean tab switching without layout conflicts
 * - No unnecessary rendering of hidden tabs
 * - Simple and performant
 */
const TabContainer = ({ 
  children, 
  activeIndex, 
  onIndexChange
}) => {
  // No animation needed since we're only showing one tab at a time

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: Colors.surface,
    }}>
      {/* Only render the active tab to prevent layout issues */}
      <View style={{ flex: 1 }}>
        {children[activeIndex]}
      </View>
    </View>
  );
};

export default TabContainer;
