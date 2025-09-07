import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Colors, Typography, Responsive, CommonStyles, CheckVariants } from '../../theme';
import ProgressiveActionCard from '../../components/ui/ProgressiveActionCard';
import { CopywritingService } from '../../utils/copywritingService';

const InteractiveChecklist = ({ 
  userDevices, 
  deviceActions, 
  onActionComplete, 
  onStatusChange,
  variant = 'checklist',
  checkId,
  navigation,
  checklistItems = [],
  // 🔧 NEW: Configuration options for sequential expansion
  enableSequentialExpansion = false,
  expansionOrder = 'original', // 'original', 'priority', 'custom'
  // 🔧 NEW: Custom header text support
  customHeaderTitle = 'Security Checklist'
}) => {
  // ✅ PRESERVE: All existing state management
  const [checklistProgress, setChecklistProgress] = useState(0);
  const [completedItems, setCompletedItems] = useState(0);
  
  // 🎨 NEW: Checklist-specific state
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('priority'); // priority, device, status
  
  // 🔧 NEW: Sequential expansion state for enhanced variant
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [hasInitializedExpansion, setHasInitializedExpansion] = useState(false);
  
  // Calculate progress
  const calculateProgress = () => {
    if (checklistItems.length === 0) return 0;
    
    const completed = checklistItems.filter(item => item.completed).length;
    return (completed / checklistItems.length) * 100;
  };
  
  // Get categories from checklist items
  const getCategories = () => {
    const categories = new Set();
    checklistItems.forEach(item => {
      if (item.category) {
        categories.add(item.category);
      }
    });
    
    return [
      { id: 'all', name: 'All Items' },
      ...Array.from(categories).map(category => ({
        id: category,
        name: category.charAt(0).toUpperCase() + category.slice(1)
      }))
    ];
  };
  
  // Get filtered items
  const getFilteredItems = () => {
    let filtered = [...checklistItems];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }
    
    // Filter by completion status
    if (!showCompleted) {
      filtered = filtered.filter(item => !item.completed);
    }
    
    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'device':
          return a.device.localeCompare(b.device);
        case 'status':
          return a.completed ? 1 : -1;
        default:
          return 0;
      }
    });
    
    return filtered;
  };
  
  // Handle checklist item completion
  const handleChecklistItemComplete = async (itemId, completed) => {
    // Haptic feedback
    if (Haptics?.impactAsync) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Call parent handler if provided
    if (onActionComplete) {
      await onActionComplete(itemId, completed);
    }
  };
  
  // Update progress when checklist items change
  useEffect(() => {
    const progress = calculateProgress();
    setChecklistProgress(progress);
    setCompletedItems(checklistItems.filter(item => item.completed).length);
  }, [checklistItems]);
  
  // 🔧 NEW: Robust sequential expansion logic
  const getNextItemToExpand = (updatedItems = null) => {
    const itemsToCheck = updatedItems || checklistItems;
    if (!itemsToCheck || itemsToCheck.length === 0) return null;
    
    // Determine which items to consider based on expansion order
    let itemsToConsider = [...itemsToCheck];
    
    if (expansionOrder === 'priority') {
      // Sort by priority: critical > high > medium > low
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      itemsToConsider.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
    }
    // For 'original' order, use the items as they are
    
    // Find the first incomplete item in the determined order
    for (let i = 0; i < itemsToConsider.length; i++) {
      if (!itemsToConsider[i].completed) {
        return itemsToConsider[i].id;
      }
    }
    
    // If all items are completed, return null
    return null;
  };
  
  // Auto-expand first incomplete item when sequential expansion is enabled
  useEffect(() => {
    const shouldEnableExpansion = enableSequentialExpansion || variant === 'enhanced';
    
    if (shouldEnableExpansion && checklistItems.length > 0 && !hasInitializedExpansion) {
      const nextItemId = getNextItemToExpand();
      if (nextItemId) {
        setExpandedItemId(nextItemId);
        setHasInitializedExpansion(true);
      }
    }
  }, [checklistItems, variant, hasInitializedExpansion, enableSequentialExpansion, expansionOrder]);
  
  const totalItems = checklistItems.length;
  const filteredItems = getFilteredItems();
  const categories = getCategories();
  
  if (checklistItems.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="shield-checkmark" size={Responsive.iconSizes.xxlarge} color={CheckVariants.checklist.accent} />
        <Text style={styles.emptyStateTitle}>No Actions Required</Text>
        <Text style={styles.emptyStateText}>
          All security settings are already configured for your devices.
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.checklistContainer}>
      {/* Checklist Header */}
      <View style={[styles.checklistHeader, styles[variant]]}>
        {/* Progress Overview */}
        <View style={styles.progressOverview}>
          <Text style={styles.progressTitle}>{customHeaderTitle}</Text>
          <Text style={styles.progressSubtitle}>
            {completedItems} of {totalItems} items completed
          </Text>
        </View>
        
        {/* Animated Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarTrack}>
            <Animated.View 
              style={[
                styles.progressBarFill,
                { width: `${checklistProgress}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressPercentage}>{Math.round(checklistProgress)}%</Text>
        </View>
      </View>
      
      {/* Category Filter - Only show for non-enhanced variants */}
      {variant !== 'enhanced' && (
        <View style={[styles.categoryFilter, styles[variant]]}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((category) => (
              <CategoryChip
                key={category.id}
                category={category}
                isSelected={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
                variant={variant}
              />
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* Search & Sort - Only show for non-enhanced variants */}
      {variant !== 'enhanced' && (
        <View style={[styles.searchAndSort, styles[variant]]}>
          {/* Search Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search checklist items..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Sort and Filter Options */}
          <View style={styles.sortOptions}>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'priority' && styles.sortButtonActive]}
              onPress={() => setSortBy('priority')}
            >
              <Text style={styles.sortButtonText}>Priority</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'device' && styles.sortButtonActive]}
              onPress={() => setSortBy('device')}
            >
              <Text style={styles.sortButtonText}>Device</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'status' && styles.sortButtonActive]}
              onPress={() => setSortBy('status')}
            >
              <Text style={styles.sortButtonText}>Status</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.toggleButton, showCompleted && styles.toggleButtonActive]}
              onPress={() => setShowCompleted(!showCompleted)}
            >
              <Ionicons 
                name={showCompleted ? "eye" : "eye-off"} 
                size={16} 
                color={showCompleted ? CheckVariants.checklist.accent : Colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Enhanced variant: Show only sort options with padding */}
      {variant === 'enhanced' && (
        <View style={[styles.searchAndSort, styles[variant]]}>
          {/* Sort and Filter Options */}
          <View style={styles.sortOptions}>
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'priority' && styles.sortButtonActive]}
              onPress={() => setSortBy('priority')}
            >
              <Text style={styles.sortButtonText}>Priority</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'device' && styles.sortButtonActive]}
              onPress={() => setSortBy('device')}
            >
              <Text style={styles.sortButtonText}>Device</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.sortButton, sortBy === 'status' && styles.sortButtonActive]}
              onPress={() => setSortBy('status')}
            >
              <Text style={styles.sortButtonText}>Status</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.toggleButton, showCompleted && styles.toggleButtonActive]}
              onPress={() => setShowCompleted(!showCompleted)}
            >
              <Ionicons 
                name={showCompleted ? "eye" : "eye-off"} 
                size={16} 
                color={showCompleted ? CheckVariants.checklist.accent : Colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Checklist Items */}
      <ScrollView style={styles.checklistItems} showsVerticalScrollIndicator={false}>
        {filteredItems.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            onComplete={handleChecklistItemComplete}
            variant={variant}
            expandedItemId={expandedItemId}
            onExpandedChange={setExpandedItemId}
            checklistItems={checklistItems}
            enableSequentialExpansion={enableSequentialExpansion || variant === 'enhanced'}
            expansionOrder={expansionOrder}
            getNextItemToExpand={getNextItemToExpand}
          />
        ))}
        
        {filteredItems.length === 0 && (
          <EmptyState
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            variant={variant}
          />
        )}
      </ScrollView>
      
      {/* Progress Celebration - Removed duplicate modal */}
    </View>
  );
};

// Category Chip Component
const CategoryChip = ({ category, isSelected, onPress, variant }) => {
  return (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        isSelected && styles.categoryChipActive,
        styles[variant]
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.categoryChipText,
        isSelected && styles.categoryChipTextActive
      ]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

// Checklist Item Component
const ChecklistItem = ({ 
  item, 
  onComplete, 
  variant, 
  expandedItemId, 
  onExpandedChange, 
  checklistItems,
  enableSequentialExpansion,
  expansionOrder,
  getNextItemToExpand
}) => {
  const [animationValue] = useState(new Animated.Value(1));
  
  // 🔧 NEW: Determine if this item should be expanded
  const isExpanded = enableSequentialExpansion ? expandedItemId === item.id : false;
  
  const handleToggle = async () => {
    // Haptic feedback
    if (Haptics?.impactAsync) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Animate checkbox
    Animated.sequence([
      Animated.timing(animationValue, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(animationValue, { toValue: 1, duration: 100, useNativeDriver: true })
    ]).start();
    
    const newCompleted = !item.completed;
    onComplete(item.id, newCompleted);
    
    // 🔧 NEW: Handle sequential expansion
    if (enableSequentialExpansion && newCompleted && onExpandedChange) {
      // Simulate the updated state to find the next item to expand
      const updatedItems = checklistItems.map(i => 
        i.id === item.id ? { ...i, completed: newCompleted } : i
      );
      
      setTimeout(() => {
        const nextItemId = getNextItemToExpand(updatedItems);
        onExpandedChange(nextItemId);
      }, 500); // Small delay to show completion animation
    }
  };
  
  const handleExpandToggle = () => {
    if (enableSequentialExpansion && onExpandedChange) {
      onExpandedChange(isExpanded ? null : item.id);
    }
  };
  
  return (
    <Animated.View 
      style={[
        styles.checklistItem,
        styles[variant],
        item.completed && styles.checklistItemCompleted,
        { transform: [{ scale: animationValue }] }
      ]}
    >
      {/* Item Header */}
      <TouchableOpacity
        style={styles.itemHeader}
        onPress={handleExpandToggle}
        activeOpacity={0.8}
      >
        {/* Checkbox */}
        <TouchableOpacity
          style={[
            styles.checkbox,
            item.completed && styles.checkboxCompleted
          ]}
          onPress={handleToggle}
        >
          {item.completed && (
            <Ionicons name="checkmark" size={16} color={Colors.textPrimary} />
          )}
        </TouchableOpacity>
        
        {/* Item Info */}
        <View style={styles.itemInfo}>
          <Text style={[
            styles.itemTitle,
            item.completed && styles.itemTitleCompleted
          ]}>
            {item.title}
          </Text>
          <Text style={styles.itemDescription}>{item.description}</Text>
        </View>
        
        {/* Priority Badge */}
        <PriorityBadge priority={item.priority} variant={variant} />
        
        {/* Expand/Collapse */}
        <Ionicons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={Colors.textSecondary} 
        />
      </TouchableOpacity>
      
      {/* Expanded Content */}
      {isExpanded && (
        <Animated.View style={styles.itemContent}>
          {/* Action Steps */}
          {item.steps && (
            <View style={styles.actionSteps}>
              <Text style={styles.stepsTitle}>{CopywritingService.getValidationFeedback('interactiveChecklist', 'stepsTitle')}</Text>
              {item.steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <Text style={styles.stepNumber}>{index + 1}.</Text>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Action Buttons - Only show deep link button if available */}
          {item.deepLink && (
            <View style={styles.itemActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeepLink(item.deepLink)}
              >
                <Ionicons name="open-outline" size={16} color={CheckVariants.checklist.accent} />
                <Text style={styles.actionButtonText}>{CopywritingService.getValidationFeedback('interactiveChecklist', 'openSettings')}</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Tips */}
          {item.tips && (
            <View style={styles.itemTips}>
              <Text style={styles.tipsTitle}>{CopywritingService.getValidationFeedback('interactiveChecklist', 'tipsTitle')}</Text>
              {item.tips.map((tip, index) => (
                <Text key={index} style={styles.tipText}>• {tip}</Text>
              ))}
            </View>
          )}
        </Animated.View>
      )}
    </Animated.View>
  );
};

// Priority Badge Component
const PriorityBadge = ({ priority, variant }) => {
  const getPriorityColor = () => {
    switch (priority) {
      case 'critical':
        return Colors.error;
      case 'high':
        return Colors.warning;
      case 'medium':
        return Colors.accent;
      case 'low':
        return Colors.textSecondary;
      default:
        return Colors.textSecondary;
    }
  };
  
  return (
    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() }]}>
      <Text style={styles.priorityBadgeText}>
        {priority?.charAt(0).toUpperCase() || 'M'}
      </Text>
    </View>
  );
};

// Progress Celebration Component - Removed duplicate modal

// Empty State Component
const EmptyState = ({ searchQuery, selectedCategory, variant }) => {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="search" size={Responsive.iconSizes.xxlarge} color={Colors.textSecondary} />
      <Text style={styles.emptyStateTitle}>No Items Found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery 
          ? `No items match "${searchQuery}"`
          : `No items in "${selectedCategory}" category`
        }
      </Text>
    </View>
  );
};

// Helper functions
const handleDeepLink = (deepLink) => {
  // Implementation for handling deep links
  console.log('Deep link:', deepLink);
};

const handleLearnMore = (item) => {
  // Implementation for learn more functionality
  console.log('Learn more about:', item.title);
};

const styles = {
  checklistContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  checklistHeader: {
    paddingVertical: Responsive.spacing.lg,
    paddingHorizontal: Responsive.padding.screen,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressOverview: {
    alignItems: 'center',
    marginBottom: Responsive.spacing.md,
  },
  progressTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  progressSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  progressBarContainer: {
    alignItems: 'center',
  },
  progressBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: Responsive.spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: CheckVariants.checklist.accent,
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: CheckVariants.checklist.accent,
  },
  categoryFilter: {
    paddingVertical: Responsive.spacing.md,
    paddingHorizontal: Responsive.padding.screen,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryScroll: {
    paddingHorizontal: Responsive.spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: Responsive.spacing.md,
    paddingVertical: Responsive.padding.button,
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.medium,
    marginRight: Responsive.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: CheckVariants.checklist.accent,
    borderColor: CheckVariants.checklist.accent,
  },
  categoryChipText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.textPrimary,
  },
  searchAndSort: {
    paddingVertical: Responsive.spacing.md,
    paddingHorizontal: Responsive.padding.screen,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.medium,
    paddingHorizontal: Responsive.spacing.md,
    marginBottom: Responsive.spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.sm,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
  },
  sortOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortButton: {
    paddingHorizontal: Responsive.spacing.md,
    paddingVertical: Responsive.padding.button,
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortButtonActive: {
    backgroundColor: CheckVariants.checklist.accent,
    borderColor: CheckVariants.checklist.accent,
  },
  sortButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
  },
  toggleButton: {
    padding: Responsive.spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleButtonActive: {
    backgroundColor: CheckVariants.checklist.accent,
    borderColor: CheckVariants.checklist.accent,
  },
  checklistItems: {
    flex: 1,
    paddingHorizontal: Responsive.padding.screen,
  },
  checklistItem: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    marginBottom: Responsive.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checklistItemCompleted: {
    opacity: 0.7,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Responsive.padding.card,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: CheckVariants.checklist.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Responsive.spacing.md,
  },
  checkboxCompleted: {
    backgroundColor: CheckVariants.checklist.accent,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  itemTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  itemDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  priorityBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Responsive.spacing.sm,
  },
  priorityBadgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  itemContent: {
    paddingHorizontal: Responsive.padding.card,
    paddingBottom: Responsive.padding.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionSteps: {
    marginBottom: Responsive.spacing.md,
  },
  stepsTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: Responsive.spacing.sm,
  },
  stepNumber: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: CheckVariants.checklist.accent,
    marginRight: Responsive.spacing.sm,
    minWidth: 20,
  },
  stepText: {
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: Typography.sizes.md * 1.4,
  },
  itemActions: {
    flexDirection: 'row',
    gap: Responsive.spacing.sm,
    marginBottom: Responsive.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.medium,
    borderWidth: 1,
    borderColor: CheckVariants.checklist.accent,
  },
  actionButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: CheckVariants.checklist.accent,
    marginLeft: Responsive.spacing.xs,
  },
  itemTips: {
    paddingTop: Responsive.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tipsTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  tipText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.sm * 1.4,
    marginBottom: Responsive.spacing.xs,
  },
  // Celebration styles removed - duplicate modal eliminated
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Responsive.padding.screen,
  },
  emptyStateTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: Responsive.spacing.md,
    marginBottom: Responsive.spacing.sm,
  },
  emptyStateText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.5,
  },
};

export default InteractiveChecklist;
