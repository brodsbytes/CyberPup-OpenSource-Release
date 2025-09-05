// Validation Engine for Interactive Validation Flows (Pattern C)
// Handles real-time validation, scoring, and progress tracking

import { CopywritingService } from './copywritingService';

export class ValidationEngine {
  /**
   * Create a new validation flow
   * @param {string} flowId - Unique identifier for the flow
   * @param {Array} steps - Array of validation steps
   * @param {Object} config - Flow configuration
   */
  constructor(flowId, steps, config = {}) {
    this.flowId = flowId;
    this.steps = steps;
    this.config = {
      enableScoring: true,
      enableTiming: true,
      enableRetries: true,
      maxRetries: 3,
      passingScore: 70,
      ...config
    };
    
    this.currentStep = 0;
    this.stepResults = {};
    this.startTime = Date.now();
    this.score = 0;
  }

  /**
   * Process a step completion
   * @param {string} stepId - Step identifier
   * @param {Object} result - Step result data
   * @returns {Object} Processing result with feedback
   */
  processStepResult(stepId, result) {
    const step = this.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step ${stepId} not found in flow`);
    }

    // Record timing
    const stepTime = Date.now() - (this.stepResults[stepId]?.startTime || Date.now());
    
    // Validate result based on step type
    const validation = this.validateStepResult(step, result);
    
    // Calculate step score
    const stepScore = this.calculateStepScore(step, result, validation);
    
    // Store step result
    this.stepResults[stepId] = {
      ...result,
      validation,
      score: stepScore,
      timeSpent: stepTime,
      timestamp: new Date().toISOString(),
      attempts: (this.stepResults[stepId]?.attempts || 0) + 1
    };

    // Update overall score
    this.updateOverallScore();

    // Generate feedback
    const feedback = this.generateStepFeedback(step, validation, stepScore);

    // For breach checks, don't auto-advance even if valid - let user review results
    const shouldAdvance = step.type === 'email-breach-check' ? 
      (validation.isValid && result.userConfirmed) : 
      (validation.isValid || !this.config.enableRetries);

    return {
      isValid: validation.isValid,
      score: stepScore,
      feedback,
      canRetry: validation.canRetry && this.stepResults[stepId].attempts < this.config.maxRetries,
      shouldAdvance: shouldAdvance
    };
  }

  /**
   * Validate a step result based on step configuration
   * @param {Object} step - Step configuration
   * @param {Object} result - User's result
   * @returns {Object} Validation result
   */
  validateStepResult(step, result) {
    switch (step.type) {
      case 'email-breach-check':
        return this.validateEmailBreachCheck(step, result);
      
      case 'phishing-identification':
        return this.validatePhishingIdentification(step, result);
      
      case 'password-strength':
        return this.validatePasswordStrength(step, result);
      
      case 'multiple-choice':
        return this.validateMultipleChoice(step, result);
      
      case 'binary-choice':
        return this.validateBinaryChoice(step, result);
      
      default:
        return { isValid: true, canRetry: false, details: {} };
    }
  }

  /**
   * Validate email breach check step
   * @param {Object} step - Step configuration
   * @param {Object} result - Result containing email and breach data
   * @returns {Object} Validation result
   */
  validateEmailBreachCheck(step, result) {
    console.log('🔍 Validating email breach check:', { email: result.email, hasBreachResult: !!result.breachResult });
    
    const { email, breachResult } = result;
    
    // Check if email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      console.log('❌ Invalid email format:', email);
      return {
        isValid: false,
        canRetry: true,
        details: { error: 'invalid_email', message: 'Please enter a valid email address' }
      };
    }

    // Check if breach check was completed
    if (!breachResult) {
      console.log('❌ No breach result provided');
      return {
        isValid: false,
        canRetry: true,
        details: { error: 'no_check_performed', message: 'Please complete the breach check' }
      };
    }

    console.log('✅ Breach check validation passed:', { 
      email, 
      breachCount: breachResult.breachCount, 
      isBreached: breachResult.isBreached 
    });

    return {
      isValid: true,
      canRetry: false,
      details: { 
        breachCount: breachResult.breachCount || 0,
        hasBreaches: breachResult.isBreached || false,
        breachResult: breachResult // Include the full result for debugging
      }
    };
  }

  /**
   * Validate phishing identification step
   * @param {Object} step - Step configuration
   * @param {Object} result - Result containing user's choice
   * @returns {Object} Validation result
   */
  validatePhishingIdentification(step, result) {
    const { userChoice, correctAnswer } = result;
    const isCorrect = userChoice === correctAnswer;
    
    return {
      isValid: true, // Always valid as this is educational
      canRetry: !isCorrect && step.allowRetry,
      details: {
        isCorrect,
        userChoice,
        correctAnswer,
        explanation: step.explanation || ''
      }
    };
  }

  /**
   * Validate password strength step
   * @param {Object} step - Step configuration
   * @param {Object} result - Result containing password analysis
   * @returns {Object} Validation result
   */
  validatePasswordStrength(step, result) {
    const { password, strength } = result;
    const minStrength = step.minStrength || 3;
    
    return {
      isValid: strength >= minStrength,
      canRetry: true,
      details: {
        strength,
        minStrength,
        requirements: this.getPasswordRequirements(password)
      }
    };
  }

  /**
   * Validate multiple choice step
   * @param {Object} step - Step configuration
   * @param {Object} result - Result containing selected choices
   * @returns {Object} Validation result
   */
  validateMultipleChoice(step, result) {
    const { selectedChoices, correctChoices } = result;
    const correctCount = selectedChoices.filter(choice => 
      correctChoices.includes(choice)
    ).length;
    
    const incorrectCount = selectedChoices.filter(choice => 
      !correctChoices.includes(choice)
    ).length;

    const accuracy = correctChoices.length > 0 ? 
      (correctCount - incorrectCount) / correctChoices.length : 0;

    return {
      isValid: accuracy >= (step.passingAccuracy || 0.7),
      canRetry: accuracy < (step.passingAccuracy || 0.7),
      details: {
        correctCount,
        incorrectCount,
        accuracy,
        selectedChoices,
        correctChoices
      }
    };
  }

  /**
   * Validate binary choice step (e.g., legitimate vs phishing)
   * @param {Object} step - Step configuration
   * @param {Object} result - Result containing user's choice
   * @returns {Object} Validation result
   */
  validateBinaryChoice(step, result) {
    const { choice, correctChoice } = result;
    const isCorrect = choice === correctChoice;
    
    return {
      isValid: true, // Educational, always advance
      canRetry: false,
      details: {
        isCorrect,
        choice,
        correctChoice,
        confidence: result.confidence || null
      }
    };
  }

  /**
   * Calculate score for a completed step
   * @param {Object} step - Step configuration
   * @param {Object} result - Step result
   * @param {Object} validation - Validation result
   * @returns {number} Step score (0-100)
   */
  calculateStepScore(step, result, validation) {
    if (!this.config.enableScoring) return 0;

    let baseScore = validation.isValid ? 100 : 0;
    
    // Apply step-specific scoring
    switch (step.type) {
      case 'phishing-identification':
        return this.calculatePhishingScore(step, result, validation);
      
      case 'multiple-choice':
        return this.calculateMultipleChoiceScore(step, result, validation);
      
      case 'email-breach-check':
        return validation.isValid ? 100 : 0; // Full credit for completion
      
      default:
        return baseScore;
    }
  }

  /**
   * Calculate score for phishing identification
   * @param {Object} step - Step configuration
   * @param {Object} result - Step result
   * @param {Object} validation - Validation result
   * @returns {number} Score (0-100)
   */
  calculatePhishingScore(step, result, validation) {
    const { isCorrect } = validation.details;
    const attempts = this.stepResults[step.id]?.attempts || 1;
    
    if (isCorrect) {
      // Reduce score for multiple attempts
      return Math.max(50, 100 - ((attempts - 1) * 25));
    } else {
      // Partial credit for attempting
      return 25;
    }
  }

  /**
   * Calculate score for multiple choice questions
   * @param {Object} step - Step configuration
   * @param {Object} result - Step result
   * @param {Object} validation - Validation result
   * @returns {number} Score (0-100)
   */
  calculateMultipleChoiceScore(step, result, validation) {
    const { accuracy } = validation.details;
    return Math.max(0, Math.round(accuracy * 100));
  }

  /**
   * Update overall flow score
   */
  updateOverallScore() {
    if (!this.config.enableScoring) return;

    const completedSteps = Object.values(this.stepResults);
    if (completedSteps.length === 0) {
      this.score = 0;
      return;
    }

    const totalScore = completedSteps.reduce((sum, result) => sum + result.score, 0);
    this.score = Math.round(totalScore / completedSteps.length);
  }

  /**
   * Generate feedback for a completed step
   * @param {Object} step - Step configuration
   * @param {Object} validation - Validation result
   * @param {number} stepScore - Step score
   * @returns {Object} Feedback object
   */
  generateStepFeedback(step, validation, stepScore) {
    const feedback = {
      type: validation.isValid ? 'success' : 'error',
      title: '',
      message: '',
      icon: validation.isValid ? 'checkmark-circle' : 'alert-circle',
      color: validation.isValid ? 'success' : 'warning'
    };

    switch (step.type) {
      case 'email-breach-check':
        if (validation.isValid) {
          if (validation.details.hasBreaches) {
            feedback.title = CopywritingService.getValidationFeedback('breachCheck', 'breachesFound') || `⚠️ ${validation.details.breachCount} Breach${validation.details.breachCount > 1 ? 'es' : ''} Found`;
            feedback.message = `Your email was found in ${validation.details.breachCount} data breach${validation.details.breachCount > 1 ? 'es' : ''}. Review the affected services and take action to secure your accounts.`;
            feedback.type = 'warning';
            feedback.color = 'warning';
            feedback.icon = 'warning';
          } else {
            feedback.title = CopywritingService.getValidationFeedback('breachCheck', 'noBreaches') || '✅ No Breaches Found';
            feedback.message = 'Great news! Your email was not found in any known data breaches. Your accounts appear to be secure.';
            feedback.type = 'success';
            feedback.color = 'success';
            feedback.icon = 'checkmark-circle';
          }
        } else {
          feedback.title = CopywritingService.getValidationFeedback('breachCheck', 'error') || 'Check Required';
          feedback.message = validation.details.message;
        }
        break;

      case 'phishing-identification':
        const { isCorrect, explanation } = validation.details;
        feedback.title = isCorrect ? 
          CopywritingService.getValidationFeedback('scamRecognition', 'correct') || 'Correct!' : 
          CopywritingService.getValidationFeedback('scamRecognition', 'incorrect') || 'Not quite right';
        feedback.message = explanation;
        feedback.type = isCorrect ? 'success' : 'info';
        feedback.color = isCorrect ? 'success' : 'accent';
        break;

      case 'multiple-choice':
        const { accuracy } = validation.details;
        feedback.title = validation.isValid ? 'Well done!' : 'Review needed';
        feedback.message = `You got ${Math.round(accuracy * 100)}% correct.`;
        break;

      default:
        feedback.title = validation.isValid ? 'Complete' : 'Try again';
        feedback.message = validation.details.message || '';
    }

    return feedback;
  }

  /**
   * Check if flow is complete
   * @returns {boolean} True if all steps are completed
   */
  isFlowComplete() {
    return this.steps.every(step => 
      this.stepResults[step.id] && this.stepResults[step.id].validation.isValid
    );
  }

  /**
   * Get flow completion summary
   * @returns {Object} Summary of flow completion
   */
  getFlowSummary() {
    const completedSteps = Object.keys(this.stepResults).length;
    const totalSteps = this.steps.length;
    const timeSpent = Date.now() - this.startTime;
    
    return {
      flowId: this.flowId,
      completedSteps,
      totalSteps,
      completionRate: totalSteps > 0 ? completedSteps / totalSteps : 0,
      score: this.score,
      timeSpent,
      isComplete: this.isFlowComplete(),
      isPassing: this.score >= this.config.passingScore,
      stepResults: this.stepResults
    };
  }

  /**
   * Get password requirements analysis
   * @param {string} password - Password to analyze
   * @returns {Object} Requirements analysis
   */
  getPasswordRequirements(password) {
    return {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noPersonalInfo: true // Would need additional context to validate
    };
  }

  /**
   * Reset flow to start over
   */
  resetFlow() {
    this.currentStep = 0;
    this.stepResults = {};
    this.startTime = Date.now();
    this.score = 0;
  }
}
