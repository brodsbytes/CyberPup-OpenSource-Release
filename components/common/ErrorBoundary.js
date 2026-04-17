/**
 * Error Boundary Component
 * Catches JavaScript errors and tracks them via analytics
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive } from '../../theme';
import { trackError } from '../../utils/analytics';
import { cyberPupLogger, LOG_CATEGORIES } from '../../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state to show error UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Enhanced error tracking for native module crashes
    const errorContext = {
      error_boundary: true,
      component_stack: errorInfo.componentStack,
      screen_name: this.props.screenName || 'unknown',
      error_info: JSON.stringify(errorInfo, null, 2).slice(0, 500), // Limit size
      error_type: error.name || 'Unknown',
      is_native_module_error: error.message?.includes('TurboModule') || 
                             error.message?.includes('RCT') ||
                             error.message?.includes('native') ||
                             false
    };

    // Track error in analytics with enhanced context
    try {
      trackError(error, errorContext);
    } catch (analyticsError) {
      // If analytics fails, at least log it
      console.log('Failed to track error in analytics:', analyticsError);
    }

    // Store error details for display
    this.setState({
      error,
      errorInfo
    });

    // Log to cyberPupLogger for debugging
    cyberPupLogger.error(LOG_CATEGORIES.GENERAL, 'ErrorBoundary caught an error', { 
      error: error.message, 
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      isNativeModuleError: errorContext.is_native_module_error
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Ionicons name="warning-outline" size={48} color={Colors.error} />
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            An unexpected error occurred. The error has been reported automatically.
          </Text>
          
          {__DEV__ && this.state.error && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Info (Dev Mode):</Text>
              <Text style={styles.debugText}>
                {this.state.error.toString()}
              </Text>
            </View>
          )}
          
          <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Responsive.padding.screen,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: Responsive.spacing.lg,
    marginBottom: Responsive.spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Responsive.spacing.xl,
  },
  retryButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Responsive.spacing.xl,
    paddingVertical: Responsive.spacing.md,
    borderRadius: Responsive.borderRadius.lg,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
  },
  debugContainer: {
    backgroundColor: Colors.surface,
    padding: Responsive.spacing.md,
    borderRadius: Responsive.borderRadius.md,
    marginBottom: Responsive.spacing.lg,
    maxWidth: '100%',
  },
  debugTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  debugText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
});

export default ErrorBoundary;
