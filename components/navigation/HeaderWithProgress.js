import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive } from '../../theme';
import { getNextScreenName, getCompletionNavigation } from '../../utils/completionMessages';

const HeaderWithProgress = ({ 
  checkId, 
  onExit, 
  onNext, 
  isCompleted, 
  progress, 
  navigation 
}) => {
  const handleNext = () => {
    if (isCompleted && onNext) {
      onNext();
    } else if (isCompleted) {
      const completionNav = getCompletionNavigation(checkId);
      if (completionNav.type === 'area_completion') {
        navigation.navigate(completionNav.target, completionNav.params);
      } else {
        navigation.navigate(completionNav.target);
      }
    }
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.menuButton}
        onPress={onExit}
        activeOpacity={0.8}
      >
        <Ionicons name="close" size={Responsive.iconSizes.large} color={Colors.textPrimary} />
      </TouchableOpacity>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${Math.min(progress || 0, 100)}%` }
            ]} 
          />
        </View>
      </View>
      
      {/* Next Arrow - Only visible when completed */}
      {isCompleted && (
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-forward" size={Responsive.iconSizes.large} color={Colors.accent} />
        </TouchableOpacity>
      )}
      
      {/* Spacer for when next button is not visible */}
      {!isCompleted && <View style={styles.headerSpacer} />}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuButton: {
    width: Responsive.iconSizes.large + Responsive.spacing.sm,
    height: Responsive.iconSizes.large + Responsive.spacing.sm,
    borderRadius: (Responsive.iconSizes.large + Responsive.spacing.sm) / 2,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: Responsive.spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  nextButton: {
    width: Responsive.iconSizes.large + Responsive.spacing.sm,
    height: Responsive.iconSizes.large + Responsive.spacing.sm,
    borderRadius: (Responsive.iconSizes.large + Responsive.spacing.sm) / 2,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: Responsive.iconSizes.large + Responsive.spacing.sm,
  },
});

export default HeaderWithProgress;
