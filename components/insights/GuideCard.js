import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive, CommonStyles } from '../../theme';

const GuideCard = ({ tag, level, title, excerpt, readMinutes, onPress }) => {
  const getTagColor = (tag) => {
    switch (tag) {
      case 'GUIDE':
        return Colors.accent; // Blue for guides
      case 'PLAYBOOK':
        return Colors.purple; // Purple for playbooks (more premium)
      default:
        return Colors.accent;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner':
        return Colors.success; // Green for beginner (safe/accessible)
      case 'Essential':
        return Colors.orange; // Orange for essential (important/urgent)
      default:
        return Colors.accent;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.badges}>
          <View style={[styles.tag, { backgroundColor: getTagColor(tag) }]}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
          <View style={[styles.level, { backgroundColor: getLevelColor(level) }]}>
            <Text style={styles.levelText}>{level}</Text>
          </View>
        </View>
        <View style={styles.readTime}>
          <Ionicons name="time-outline" size={Responsive.iconSizes.small} color={Colors.textSecondary} />
          <Text style={styles.readTimeText}>{readMinutes} min read</Text>
        </View>
      </View>
      
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      
      <Text style={styles.excerpt} numberOfLines={3}>
        {excerpt}
      </Text>
      
      <View style={styles.footer}>
        <View style={styles.arrowContainer}>
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
  badges: {
    flexDirection: 'row',
    gap: Responsive.spacing.xs,
  },
  tag: {
    paddingHorizontal: Responsive.spacing.sm,
    paddingVertical: Responsive.spacing.xs,
    borderRadius: Responsive.borderRadius.small,
  },
  tagText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  level: {
    paddingHorizontal: Responsive.spacing.sm,
    paddingVertical: Responsive.spacing.xs,
    borderRadius: Responsive.borderRadius.small,
  },
  levelText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  readTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Responsive.spacing.xs,
  },
  readTimeText: {
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
  excerpt: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * 1.6,
    marginBottom: Responsive.spacing.lg,
  },
  footer: {
    alignItems: 'flex-end',
  },
  arrowContainer: {
    width: Responsive.iconSizes.medium,
    height: Responsive.iconSizes.medium,
    borderRadius: Responsive.iconSizes.medium / 2,
    backgroundColor: Colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GuideCard;
