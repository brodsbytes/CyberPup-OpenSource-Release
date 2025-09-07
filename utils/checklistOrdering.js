/**
 * Checklist Ordering Utility
 * 
 * This utility provides automated ordering logic for checklist items
 * to ensure proper sequential expansion in InteractiveChecklist components.
 */

/**
 * Determines the optimal order for checklist items based on priority and logical flow
 * @param {Array} items - Array of checklist items
 * @returns {Array} - Reordered array of items
 */
export const getOptimalChecklistOrder = (items) => {
  if (!items || items.length === 0) return items;
  
  // Create a copy to avoid mutating the original
  const itemsCopy = [...items];
  
  // Define priority order (higher number = higher priority)
  const priorityOrder = {
    'critical': 4,
    'high': 3,
    'medium': 2,
    'low': 1
  };
  
  // Define category order for logical flow
  const categoryOrder = {
    'awareness': 1,      // Learn first
    'password-creation': 2, // Create passwords
    'password-security': 3, // Secure passwords
    'prevention': 4,     // Prevent issues
    'social-media': 5,   // Social media specific
    'backup': 6,         // Backup related
    'reporting': 7       // Reporting (usually last)
  };
  
  // Sort items by priority first, then by category, then by original order
  itemsCopy.sort((a, b) => {
    // First, sort by priority (critical > high > medium > low)
    const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then, sort by category for logical flow
    const categoryDiff = (categoryOrder[a.category] || 999) - (categoryOrder[b.category] || 999);
    if (categoryDiff !== 0) return categoryDiff;
    
    // Finally, maintain original order for items with same priority and category
    return 0;
  });
  
  return itemsCopy;
};

/**
 * Analyzes checklist items and suggests the optimal order
 * @param {Array} items - Array of checklist items
 * @returns {Object} - Analysis result with suggested order
 */
export const analyzeChecklistOrder = (items) => {
  if (!items || items.length === 0) {
    return { currentOrder: [], suggestedOrder: [], needsReordering: false };
  }
  
  const currentOrder = items.map(item => ({
    id: item.id,
    title: item.title,
    priority: item.priority,
    category: item.category
  }));
  
  const suggestedOrder = getOptimalChecklistOrder(items).map(item => ({
    id: item.id,
    title: item.title,
    priority: item.priority,
    category: item.category
  }));
  
  // Check if reordering is needed
  const needsReordering = JSON.stringify(currentOrder) !== JSON.stringify(suggestedOrder);
  
  return {
    currentOrder,
    suggestedOrder,
    needsReordering,
    reorderingReason: needsReordering ? 
      'Items should be reordered for optimal learning flow (priority + category)' : 
      'Items are already in optimal order'
  };
};

/**
 * Gets the recommended configuration for a specific check ID
 * @param {string} checkId - The check ID (e.g., '1-1-1')
 * @param {Array} items - Array of checklist items (optional, for analysis)
 * @returns {Object} - Configuration object
 */
export const getRecommendedConfig = (checkId, items = null) => {
  const baseConfig = {
    enableSequentialExpansion: true,
    expansionOrder: 'original',
    autoExpandFirst: true
  };
  
  // If items are provided, analyze and suggest optimal order
  if (items) {
    const analysis = analyzeChecklistOrder(items);
    return {
      ...baseConfig,
      analysis,
      recommendedOrder: analysis.suggestedOrder.map(item => item.id)
    };
  }
  
  return baseConfig;
};

/**
 * Validates that checklist items are in the correct order
 * @param {Array} items - Array of checklist items
 * @returns {Object} - Validation result
 */
export const validateChecklistOrder = (items) => {
  const analysis = analyzeChecklistOrder(items);
  
  return {
    isValid: !analysis.needsReordering,
    message: analysis.reorderingReason,
    currentOrder: analysis.currentOrder,
    suggestedOrder: analysis.suggestedOrder
  };
};
