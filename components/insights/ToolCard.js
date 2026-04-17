import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive, CommonStyles } from '../../theme';

const ToolCard = ({ tag, etaLabel, title, description, onPress }) => {
  const getTagColor = (tag) => {
    switch (tag) {
      case 'CHECKER':
        return Colors.accent;
      case 'LOOKUP':
        return Colors.green;
      case 'WIZARD':
        return Colors.purple;
      default:
        return Colors.accent;
    }
  };

  const getTagIcon = (tag) => {
    switch (tag) {
      case 'CHECKER':
        return 'checkmark-circle-outline';
      case 'LOOKUP':
        return 'search-outline';
      case 'WIZARD':
        return 'sparkles-outline'; // Changed from 'magic-outline' to valid Ionicons icon
      default:
        return 'construct-outline';
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.tagContainer}>
          <View style={[styles.tag, { backgroundColor: getTagColor(tag) }]}>
            <Ionicons 
              name={getTagIcon(tag)} 
              size={Responsive.iconSizes.small} 
              color={Colors.textPrimary} 
            />
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        </View>
        <View style={styles.etaContainer}>
          <Ionicons name="time-outline" size={Responsive.iconSizes.small} color={Colors.textSecondary} />
          <Text style={styles.etaText}>{etaLabel}</Text>
        </View>
      </View>
      
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      
      <Text style={styles.description} numberOfLines={3}>
        {description}
      </Text>
      
      <View style={styles.footer}>
        <View style={styles.ctaContainer}>
          <Text style={styles.ctaText}>Try Tool</Text>
          <Ionicons name="arrow-forward" size={Responsive.iconSizes.small} color={Colors.accent} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    ...CommonStyles.premiumCard,
    marginBottom: Responsive.spacing.lg,
    marginHorizontal: Responsive.padding.screen,
    marginVertical: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Responsive.spacing.md,
  },
  tagContainer: {
    flex: 1,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Responsive.spacing.sm,
    paddingVertical: Responsive.spacing.xs,
    borderRadius: Responsive.borderRadius.small,
    alignSelf: 'flex-start',
    gap: Responsive.spacing.xs,
  },
  tagText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Responsive.spacing.xs,
  },
  etaText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.md,
    lineHeight: Typography.sizes.lg * 1.4,
  },
  description: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * 1.6,
    marginBottom: Responsive.spacing.lg,
  },
  footer: {
    alignItems: 'flex-end',
  },
  ctaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentSoft,
    paddingHorizontal: Responsive.spacing.md,
    paddingVertical: Responsive.padding.button,
    borderRadius: Responsive.borderRadius.medium,
    gap: Responsive.spacing.xs,
  },
  ctaText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.accent,
  },
});

export default ToolCard;
