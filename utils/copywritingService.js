/**
 * Copywriting Service - Utilities for managing and applying copywriting content
 * 
 * This service provides helper functions to easily access and apply
 * the centralized copywriting content throughout the app.
 */

import { 
  getCopywritingForCheck, 
  getValidationCopywriting, 
  getCompletionCopywriting, 
  getNavigationCopywriting 
} from '../data/copywriting';

export class CopywritingService {
  
  /**
   * Get all copywriting content for a specific check
   * @param {string} checkId - The check identifier
   * @returns {Object} Complete copywriting content for the check
   */
  static getCheckContent(checkId) {
    return getCopywritingForCheck(checkId);
  }

  /**
   * Get checklist items with copywriting content
   * @param {string} checkId - The check identifier
   * @returns {Array} Array of checklist items with copywriting content
   */
  static getChecklistItems(checkId) {
    const content = getCopywritingForCheck(checkId);
    return content.checklist ? Object.values(content.checklist) : [];
  }

  /**
   * Get tips content for a specific check
   * @param {string} checkId - The check identifier
   * @returns {Object} Tips content object
   */
  static getTipsContent(checkId) {
    const content = getCopywritingForCheck(checkId);
    return content.tips || {};
  }

  /**
   * Get validation feedback text
   * @param {string} component - The validation component
   * @param {string} type - The feedback type (e.g., 'correct', 'incorrect')
   * @returns {string} Feedback text
   */
  static getValidationFeedback(component, type) {
    const content = getValidationCopywriting(component);
    return content[type] || '';
  }

  /**
   * Get completion message content
   * @param {string} areaId - The area identifier (e.g., '1-1', '1-2')
   * @returns {Object} Completion message content
   */
  static getAreaCompletionMessage(areaId) {
    const content = getCompletionCopywriting('areaCompletion');
    return content[areaId] || {
      title: 'Area Complete! 🎉',
      subtitle: 'Excellent work!',
      message: 'You\'ve successfully completed this security area. Your digital life is now more secure!'
    };
  }

  /**
   * Get navigation text content
   * @param {string} component - The navigation component
   * @param {string} key - The specific text key
   * @returns {string} Navigation text
   */
  static getNavigationText(component, key) {
    const content = getNavigationCopywriting(component);
    return content[key] || '';
  }

  /**
   * Get button text with copywriting
   * @param {string} context - The context (e.g., 'completion', 'validation')
   * @param {string} buttonType - The button type (e.g., 'continue', 'tryAgain')
   * @returns {string} Button text
   */
  static getButtonText(context, buttonType) {
    switch (context) {
      case 'completion':
        const completionContent = getCompletionCopywriting('popup');
        return completionContent[buttonType] || 'Continue';
      
      case 'validation':
        const validationContent = getValidationCopywriting('scamRecognition');
        return validationContent[buttonType] || 'Continue';
      
      default:
        return 'Continue';
    }
  }

  /**
   * Get error message with copywriting
   * @param {string} context - The error context
   * @param {string} errorType - The error type
   * @returns {string} Error message
   */
  static getErrorMessage(context, errorType) {
    switch (context) {
      case 'breachCheck':
        const breachContent = getValidationCopywriting('breachCheck');
        return breachContent[errorType] || 'Something went wrong. Please try again.';
      
      default:
        return 'Something went wrong. Please try again.';
    }
  }

  /**
   * Get tips array for a specific check
   * @param {string} checkId - The check identifier
   * @returns {Array} Array of tip strings
   */
  static getTipsArray(checkId) {
    const tipsContent = this.getTipsContent(checkId);
    return tipsContent.items || [];
  }

  /**
   * Get steps array for a specific checklist item
   * @param {string} checkId - The check identifier
   * @param {string} itemKey - The checklist item key
   * @returns {Array} Array of step strings
   */
  static getStepsArray(checkId, itemKey) {
    const content = getCopywritingForCheck(checkId);
    const item = content.checklist?.[itemKey];
    return item?.steps || [];
  }

  /**
   * Get item tips array for a specific checklist item
   * @param {string} checkId - The check identifier
   * @param {string} itemKey - The checklist item key
   * @returns {Array} Array of item tip strings
   */
  static getItemTipsArray(checkId, itemKey) {
    const content = getCopywritingForCheck(checkId);
    const item = content.checklist?.[itemKey];
    return item?.tips || [];
  }

  /**
   * Check if copywriting content exists for a check
   * @param {string} checkId - The check identifier
   * @returns {boolean} True if content exists
   */
  static hasContent(checkId) {
    const content = getCopywritingForCheck(checkId);
    return Object.keys(content).length > 0;
  }

  /**
   * Get all available check IDs with copywriting content
   * @returns {Array} Array of check IDs
   */
  static getAvailableCheckIds() {
    // This would need to be imported from the copywriting data
    return [
      '1-1-1', '1-1-2', '1-1-3', '1-1-4', '1-1-5',
      '1-2-1', '1-2-2', '1-2-3', '1-2-4', '1-2-5',
      '1-3-1', '1-3-2', '1-4-1', '1-4-2', '1-5-1', '1-5-2'
    ];
  }
}
