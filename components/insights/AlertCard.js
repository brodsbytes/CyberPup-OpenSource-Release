import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Responsive, CommonStyles } from '../../theme';

const AlertCard = ({ title, summary, tag, onPress }) => {
  const getTagColor = (tag) => {
    switch (tag) {
      case 'NEW THREAT':
        return Colors.error;
      case 'BREACH':
        return Colors.warning;
      case 'VULNERABILITY':
        return Colors.orange;
      case 'SCAM':
        return Colors.red;
      default:
        return Colors.error;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.border, { backgroundColor: getTagColor(tag) }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <View style={[styles.tag, { backgroundColor: getTagColor(tag) }]}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        </View>
        <Text style={styles.summary} numberOfLines={3}>
          {summary}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    ...CommonStyles.premiumCard,
    marginRight: Responsive.spacing.lg,
    width: 300,
    flexDirection: 'row',
    marginVertical: 0,
  },
  border: {
    width: 6,
    borderTopLeftRadius: Responsive.borderRadius.xlarge,
    borderBottomLeftRadius: Responsive.borderRadius.xlarge,
  },
  content: {
    flex: 1,
    padding: Responsive.padding.card * 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Responsive.spacing.md,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Responsive.spacing.md,
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
  summary: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * 1.6,
  },
});

export default AlertCard;
