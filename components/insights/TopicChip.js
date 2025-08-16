import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Responsive } from '../../theme';

const TopicChip = ({ label, selected, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.containerSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Responsive.borderRadius.xlarge,
    paddingHorizontal: Responsive.spacing.lg,
    paddingVertical: Responsive.padding.button * 1.2,
    marginRight: Responsive.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: Responsive.buttonHeight.large,
    justifyContent: 'center',
  },
  containerSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  label: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
  },
  labelSelected: {
    color: Colors.textPrimary,
    fontWeight: Typography.weights.semibold,
  },
});

export default TopicChip;
