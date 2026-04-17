import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive } from '../../theme';

/**
 * ReferencesSection - Non-intrusive references component for check screens
 * 
 * Displays 1-2 authoritative references per screen to build trust and credibility.
 * References are distributed evenly across screens from research sources.
 */
const ReferencesSection = ({ references = [], style, variant = 'default' }) => {
  const handleReferencePress = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening reference URL:', error);
    }
  };

  if (!references || references.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Ionicons 
          name="library-outline" 
          size={Responsive.iconSizes.small} 
          color={Colors.muted} 
        />
        <Text style={styles.headerText}>Sources & References</Text>
      </View>
      
      <View style={styles.referencesList}>
        {references.map((reference, index) => (
          <TouchableOpacity
            key={index}
            style={styles.referenceItem}
            onPress={() => reference.url && handleReferencePress(reference.url)}
            activeOpacity={reference.url ? 0.7 : 1}
          >
            <View style={styles.referenceContent}>
              <Text style={styles.referenceTitle}>
                {reference.title}
              </Text>
              <Text style={styles.referenceSource}>
                {reference.source}
              </Text>
              {reference.description && (
                <Text style={styles.referenceDescription}>
                  {reference.description}
                </Text>
              )}
            </View>
            {reference.url && (
              <Ionicons 
                name="open-outline" 
                size={Responsive.iconSizes.small} 
                color={Colors.accent} 
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Responsive.spacing.lg,
    paddingTop: Responsive.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.spacing.sm,
  },
  headerText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.muted,
    marginLeft: Responsive.spacing.xs,
  },
  referencesList: {
    gap: Responsive.spacing.sm,
  },
  referenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Responsive.spacing.xs,
  },
  referenceContent: {
    flex: 1,
    marginRight: Responsive.spacing.sm,
  },
  referenceTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.sm * 1.3,
  },
  referenceSource: {
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
    fontStyle: 'italic',
    marginTop: 2,
  },
  referenceDescription: {
    fontSize: Typography.sizes.xs,
    color: Colors.muted,
    lineHeight: Typography.sizes.xs * 1.4,
    marginTop: 2,
  },
});

export default ReferencesSection;
