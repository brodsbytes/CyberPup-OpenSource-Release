// Enhanced Progress Manager for Interactive Validation Flows
// Handles progress tracking, persistence, and analytics for Pattern C flows

import AsyncStorage from '@react-native-async-storage/async-storage';

export class ProgressManager {
  /**
   * Save validation flow progress
   * @param {string} flowId - Unique flow identifier
   * @param {Object} progressData - Flow progress data
   * @returns {Promise<boolean>} Success status
   */
  static async saveFlowProgress(flowId, progressData) {
    try {
      const key = `flow_progress_${flowId}`;
      const dataToSave = {
        ...progressData,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(dataToSave));
      console.log(`📊 Flow progress saved: ${flowId}`);
      return true;
    } catch (error) {
      console.error('Error saving flow progress:', error);
      return false;
    }
  }

  /**
   * Load validation flow progress
   * @param {string} flowId - Unique flow identifier
   * @returns {Promise<Object|null>} Flow progress data or null
   */
  static async loadFlowProgress(flowId) {
    try {
      const key = `flow_progress_${flowId}`;
      const progressData = await AsyncStorage.getItem(key);
      
      if (progressData) {
        const data = JSON.parse(progressData);
        console.log(`📥 Flow progress loaded: ${flowId}`);
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Error loading flow progress:', error);
      return null;
    }
  }

  /**
   * Mark flow as completed
   * @param {string} flowId - Unique flow identifier
   * @param {Object} completionData - Completion statistics
   * @returns {Promise<boolean>} Success status
   */
  static async markFlowCompleted(flowId, completionData) {
    try {
      const completionKey = `flow_completed_${flowId}`;
      const completionRecord = {
        flowId,
        completedAt: new Date().toISOString(),
        score: completionData.score || 0,
        timeSpent: completionData.timeSpent || 0,
        attempts: completionData.attempts || 1,
        perfectScore: completionData.score === 100,
        ...completionData
      };
      
      await AsyncStorage.setItem(completionKey, JSON.stringify(completionRecord));
      
      // Also save to overall progress
      await this.updateOverallProgress(flowId, completionRecord);
      
      console.log(`✅ Flow marked as completed: ${flowId}`);
      return true;
    } catch (error) {
      console.error('Error marking flow as completed:', error);
      return false;
    }
  }

  /**
   * Check if flow is completed
   * @param {string} flowId - Unique flow identifier
   * @returns {Promise<boolean>} Completion status
   */
  static async isFlowCompleted(flowId) {
    try {
      const completionKey = `flow_completed_${flowId}`;
      const completionData = await AsyncStorage.getItem(completionKey);
      return completionData !== null;
    } catch (error) {
      console.error('Error checking flow completion:', error);
      return false;
    }
  }

  /**
   * Get flow completion details
   * @param {string} flowId - Unique flow identifier
   * @returns {Promise<Object|null>} Completion details or null
   */
  static async getFlowCompletion(flowId) {
    try {
      const completionKey = `flow_completed_${flowId}`;
      const completionData = await AsyncStorage.getItem(completionKey);
      
      if (completionData) {
        return JSON.parse(completionData);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting flow completion:', error);
      return null;
    }
  }

  /**
   * Update overall user progress
   * @param {string} flowId - Flow identifier
   * @param {Object} completionRecord - Completion data
   * @returns {Promise<boolean>} Success status
   */
  static async updateOverallProgress(flowId, completionRecord) {
    try {
      // Get existing overall progress
      let overallProgress = await this.getOverallProgress();
      
      // Initialize if doesn't exist
      if (!overallProgress) {
        overallProgress = {
          completedFlows: {},
          totalScore: 0,
          averageScore: 0,
          totalTimeSpent: 0,
          totalFlows: 0,
          lastUpdated: new Date().toISOString()
        };
      }

      // Update with new completion
      overallProgress.completedFlows[flowId] = completionRecord;
      
      // Recalculate statistics
      const completedFlowsArray = Object.values(overallProgress.completedFlows);
      overallProgress.totalFlows = completedFlowsArray.length;
      overallProgress.totalScore = completedFlowsArray.reduce((sum, flow) => sum + (flow.score || 0), 0);
      overallProgress.averageScore = overallProgress.totalFlows > 0 ? 
        Math.round(overallProgress.totalScore / overallProgress.totalFlows) : 0;
      overallProgress.totalTimeSpent = completedFlowsArray.reduce((sum, flow) => sum + (flow.timeSpent || 0), 0);
      overallProgress.lastUpdated = new Date().toISOString();

      // Save updated progress
      await AsyncStorage.setItem('user_flow_progress', JSON.stringify(overallProgress));
      
      console.log(`📈 Overall progress updated: ${overallProgress.totalFlows} flows completed`);
      return true;
    } catch (error) {
      console.error('Error updating overall progress:', error);
      return false;
    }
  }

  /**
   * Get overall user progress across all flows
   * @returns {Promise<Object|null>} Overall progress or null
   */
  static async getOverallProgress() {
    try {
      const progressData = await AsyncStorage.getItem('user_flow_progress');
      
      if (progressData) {
        return JSON.parse(progressData);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting overall progress:', error);
      return null;
    }
  }

  /**
   * Get user's best scores for all flows
   * @returns {Promise<Object>} Flow ID to best score mapping
   */
  static async getBestScores() {
    try {
      const overallProgress = await this.getOverallProgress();
      
      if (!overallProgress || !overallProgress.completedFlows) {
        return {};
      }

      const bestScores = {};
      Object.entries(overallProgress.completedFlows).forEach(([flowId, completion]) => {
        bestScores[flowId] = completion.score || 0;
      });

      return bestScores;
    } catch (error) {
      console.error('Error getting best scores:', error);
      return {};
    }
  }

  /**
   * Get completion statistics for analytics
   * @returns {Promise<Object>} Analytics data
   */
  static async getAnalytics() {
    try {
      const overallProgress = await this.getOverallProgress();
      
      if (!overallProgress || !overallProgress.completedFlows) {
        return {
          totalFlows: 0,
          averageScore: 0,
          totalTimeSpent: 0,
          perfectScores: 0,
          completionRate: 0
        };
      }

      const completedFlows = Object.values(overallProgress.completedFlows);
      const perfectScores = completedFlows.filter(flow => flow.perfectScore).length;
      
      return {
        totalFlows: completedFlows.length,
        averageScore: overallProgress.averageScore,
        totalTimeSpent: overallProgress.totalTimeSpent,
        perfectScores,
        completionRate: completedFlows.length > 0 ? 100 : 0, // Could be calculated against total available flows
        lastActivity: overallProgress.lastUpdated
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {};
    }
  }

  /**
   * Reset progress for a specific flow (for retries)
   * @param {string} flowId - Flow identifier
   * @returns {Promise<boolean>} Success status
   */
  static async resetFlowProgress(flowId) {
    try {
      const progressKey = `flow_progress_${flowId}`;
      const completionKey = `flow_completed_${flowId}`;
      
      await AsyncStorage.removeItem(progressKey);
      await AsyncStorage.removeItem(completionKey);
      
      // Update overall progress
      const overallProgress = await this.getOverallProgress();
      if (overallProgress && overallProgress.completedFlows) {
        delete overallProgress.completedFlows[flowId];
        await AsyncStorage.setItem('user_flow_progress', JSON.stringify(overallProgress));
      }
      
      console.log(`🔄 Flow progress reset: ${flowId}`);
      return true;
    } catch (error) {
      console.error('Error resetting flow progress:', error);
      return false;
    }
  }

  /**
   * Export all progress data for backup/sync
   * @returns {Promise<Object>} All progress data
   */
  static async exportProgressData() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const flowKeys = keys.filter(key => 
        key.startsWith('flow_progress_') || 
        key.startsWith('flow_completed_') ||
        key === 'user_flow_progress'
      );
      
      const progressData = {};
      for (const key of flowKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          progressData[key] = JSON.parse(data);
        }
      }
      
      return {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        data: progressData
      };
    } catch (error) {
      console.error('Error exporting progress data:', error);
      return null;
    }
  }

  /**
   * Import progress data from backup
   * @param {Object} exportedData - Previously exported data
   * @returns {Promise<boolean>} Success status
   */
  static async importProgressData(exportedData) {
    try {
      if (!exportedData || !exportedData.data) {
        throw new Error('Invalid exported data format');
      }

      // Clear existing flow progress
      const keys = await AsyncStorage.getAllKeys();
      const flowKeys = keys.filter(key => 
        key.startsWith('flow_progress_') || 
        key.startsWith('flow_completed_') ||
        key === 'user_flow_progress'
      );
      
      for (const key of flowKeys) {
        await AsyncStorage.removeItem(key);
      }

      // Import new data
      for (const [key, data] of Object.entries(exportedData.data)) {
        await AsyncStorage.setItem(key, JSON.stringify(data));
      }

      console.log('📥 Progress data imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing progress data:', error);
      return false;
    }
  }

  /**
   * Clean up old or corrupted progress data
   * @returns {Promise<boolean>} Success status
   */
  static async cleanupProgressData() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const flowKeys = keys.filter(key => 
        key.startsWith('flow_progress_') || 
        key.startsWith('flow_completed_')
      );
      
      let cleanedCount = 0;
      
      for (const key of flowKeys) {
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            // Check if data is valid (has required fields)
            if (!parsed.lastUpdated && !parsed.completedAt) {
              await AsyncStorage.removeItem(key);
              cleanedCount++;
            }
          }
        } catch (parseError) {
          // Remove corrupted data
          await AsyncStorage.removeItem(key);
          cleanedCount++;
        }
      }
      
      console.log(`🧹 Cleaned up ${cleanedCount} corrupted progress entries`);
      return true;
    } catch (error) {
      console.error('Error cleaning up progress data:', error);
      return false;
    }
  }
}
