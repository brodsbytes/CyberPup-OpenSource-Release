/**
 * Copywriting Data - Centralized user-facing text content
 * 
 * This file contains all user-facing text rewritten to match the desired tone:
 * - Trustworthy & Professional
 * - Friendly & Approachable  
 * - Action-First
 * - Non-Technical
 * - Gamified & Motivational
 * - Mobile-Friendly
 */

export const COPYWRITING = {
  // Validation Components
  validation: {
    scamRecognition: {
      correct: "Spot on! 🎯",
      incorrect: "Not quite, but you're learning! 💡",
      redFlags: "🚩 Warning Signs:",
      legitimateSignals: "✅ Trust Indicators:",
      nextScenario: "Ready for the next challenge?",
      continue: "Keep Going"
    },
    breachCheck: {
      breachesFound: "⚠️ Breach Alert",
      noBreaches: "🛡️ All Clear!",
      error: "Oops! Something went wrong",
      tryAgain: "Try Again",
      checkEmail: "Check Your Email"
    },
    interactiveChecklist: {
      stepsTitle: "Let's get this done:",
      learnMore: "Learn More",
      openSettings: "Open Settings",
      tipsTitle: "💡 Pro Tips:"
    }
  },

  // Completion & Gamification
  completion: {
    areaCompletion: {
      accountSecurity: {
        title: "Account Security Mastered! 🛡️",
        subtitle: "Your accounts are now fortress-strong!",
        message: "You've built a rock-solid foundation with strong passwords, password managers, and multi-factor authentication. Your digital life is now much more secure!"
      },
      deviceSecurity: {
        title: "Device Security Complete! 📱",
        subtitle: "Your devices are locked down tight!",
        message: "From screen locks to remote wiping, you've secured every aspect of your devices. Your personal information stays private, even if your device is lost or stolen."
      },
      dataProtection: {
        title: "Data Protection Achieved! 💾",
        subtitle: "Your data is safe and backed up!",
        message: "With both cloud and local backups in place, your important files are protected against any disaster. You've implemented the gold standard of data protection!"
      },
      scamDefense: {
        title: "Scam Defense Complete! 🚫",
        subtitle: "You can spot scams from a mile away!",
        message: "Your scam detection skills are now razor-sharp. You can identify and avoid fraudulent attempts, and you know how to help others stay safe too."
      },
      privacyProtection: {
        title: "Privacy Protection Mastered! 🔒",
        subtitle: "Your privacy is now under your control!",
        message: "You've taken control of your digital footprint and configured your privacy settings across all platforms. Your personal information stays private!"
      }
    },
    popup: {
      continueButton: "Continue to Next Check"
    }
  },

  // Navigation & UI
  navigation: {
    catalogueModal: {
      comingSoon: "Coming Soon! 🚀"
    },
    categoryDetail: {
      checksCompleted: "checks completed",
      progress: "Progress"
    }
  },

  // Check Screen Content
  checks: {
    '1-1-1': { // Strong Passwords
      title: "Strong Passwords",
      description: "Create passwords that are both secure and memorable",
      tips: {
        title: "🔐 Password Power Tips",
        items: [
          "Aim for 12+ characters - longer is always stronger",
          "Mix letters, numbers, and symbols for maximum security",
          "Use a memorable phrase instead of random characters",
          "Never reuse passwords across different accounts"
        ]
      },
      checklist: {
        length: {
          title: "Use 12+ Characters",
          description: "Create passwords with at least 12 characters for better security",
          tips: [
            "Longer passwords are exponentially harder to crack",
            "Aim for 12-16 characters minimum",
            "Consider using passphrases for easier memorization"
          ],
          steps: [
            "Count your current password length",
            "Add more characters if under 12",
            "Consider using a memorable phrase"
          ]
        },
        complexity: {
          title: "Mix Character Types",
          description: "Include uppercase, lowercase, numbers, and symbols",
          tips: [
            "Use at least one of each character type",
            "Avoid predictable patterns like 'Password123'",
            "Substitute letters with numbers and symbols"
          ],
          steps: [
            "Check if your password has uppercase letters",
            "Verify it includes numbers and symbols",
            "Avoid common substitutions like @ for a"
          ]
        }
      }
    },
    '1-1-2': { // High-Value Accounts
      title: "High-Value Accounts",
      description: "Protect your most important accounts with extra security",
      tips: {
        title: "🛡️ Account Protection Tips",
        items: [
          "Identify accounts with sensitive personal or financial data",
          "Use the strongest passwords for these accounts",
          "Enable multi-factor authentication wherever possible",
          "Monitor these accounts regularly for suspicious activity"
        ]
      }
    },
    '1-1-3': { // Password Managers
      title: "Password Managers",
      description: "Let technology handle your passwords securely",
      tips: {
        title: "🔐 Password Manager Tips",
        items: [
          "Choose a password manager with zero-knowledge encryption",
          "Use a strong, memorable master password",
          "Enable sync to access passwords on all devices",
          "Enable biometric unlock where available"
        ]
      }
    },
    '1-1-4': { // MFA Setup
      title: "Multi-Factor Authentication",
      description: "Add an extra layer of security to your accounts",
      tips: {
        title: "🔒 MFA Setup Tips",
        items: [
          "Enable MFA on all accounts that support it",
          "Use authenticator apps instead of SMS when possible",
          "Keep backup codes in a safe place",
          "Test your MFA setup to ensure it works"
        ]
      }
    },
    '1-1-5': { // Breach Check
      title: "Breach Check",
      description: "Find out if your accounts have been compromised",
      tips: {
        title: "🔍 Breach Check Tips",
        items: [
          "Check your email address for known breaches",
          "Review which services were affected",
          "Change passwords for compromised accounts immediately",
          "Enable MFA on previously breached accounts"
        ]
      }
    },
    '1-2-1': { // Screen Lock
      title: "Screen Lock",
      description: "Keep your device secure when you're not using it",
      tips: {
        title: "🔐 Screen Lock Best Practices",
        items: [
          "Set auto-lock to 30 seconds or 1 minute for maximum security",
          "Use at least a 6-digit PIN or strong password",
          "Enable biometric unlock for convenience and security",
          "Avoid simple patterns that can be easily observed"
        ]
      }
    },
    '1-2-2': { // Remote Lock
      title: "Remote Lock",
      description: "Protect your device even when it's lost or stolen",
      tips: {
        title: "📱 Remote Lock Tips",
        items: [
          "Enable Find My Device on all your devices",
          "Test remote lock functionality to ensure it works",
          "Keep your device location services enabled",
          "Know how to remotely wipe your device if needed"
        ]
      }
    },
    '1-2-3': { // Device Updates
      title: "Device Updates",
      description: "Keep your device secure with the latest updates",
      tips: {
        title: "🔄 Update Security Tips",
        items: [
          "Enable automatic updates for your operating system",
          "Update apps regularly through your app store",
          "Restart your device after major updates",
          "Check for updates manually if auto-update is disabled"
        ]
      }
    },
    '1-2-4': { // Bluetooth & Wi-Fi
      title: "Bluetooth & Wi-Fi",
      description: "Secure your wireless connections",
      tips: {
        title: "📶 Wireless Security Tips",
        items: [
          "Turn off Bluetooth when not in use",
          "Avoid connecting to public Wi-Fi for sensitive activities",
          "Use a VPN when connecting to public networks",
          "Forget public Wi-Fi networks after use"
        ]
      }
    },
    '1-2-5': { // Public Charging
      title: "Public Charging",
      description: "Charge safely without risking your data",
      tips: {
        title: "⚡ Safe Charging Tips",
        items: [
          "Bring your own charger and cable when possible",
          "Use AC power outlets instead of USB ports",
          "Never trust public USB charging stations",
          "Consider using a USB data blocker for extra protection"
        ]
      }
    },
    '1-3-1': { // Cloud Backup
      title: "Cloud Backup",
      description: "Keep your important files safe in the cloud",
      tips: {
        title: "☁️ Cloud Backup Tips",
        items: [
          "Choose a reputable cloud storage provider",
          "Enable automatic backup for important folders",
          "Use strong passwords and MFA for cloud accounts",
          "Regularly test your backup restoration process"
        ]
      }
    },
    '1-3-2': { // Local Backup
      title: "Local Backup",
      description: "Create local copies of your important data",
      tips: {
        title: "💾 Local Backup Tips",
        items: [
          "Use the 3-2-1 backup rule: 3 copies, 2 different media, 1 offsite",
          "Back up your data regularly, not just once",
          "Test your backup restoration process",
          "Keep backups in a safe, separate location"
        ]
      }
    },
    '1-4-1': { // Scam Recognition
      title: "Scam Recognition",
      description: "Learn to spot and avoid scams",
      tips: {
        title: "🚫 Scam Detection Tips",
        items: [
          "Be suspicious of urgent requests for money or information",
          "Verify requests through official channels",
          "Look for spelling and grammar errors in messages",
          "Never click links in suspicious emails or messages"
        ]
      }
    },
    '1-4-2': { // Scam Reporting
      title: "Scam Reporting",
      description: "Help protect others by reporting scams",
      tips: {
        title: "📢 Reporting Tips",
        items: [
          "Report scams to the appropriate authorities",
          "Save evidence like screenshots and emails",
          "Warn others about the scam you encountered",
          "Report fake websites and social media accounts"
        ]
      }
    },
    '1-5-1': { // Sharing Awareness
      title: "Sharing Awareness",
      description: "Be mindful of what you share online",
      tips: {
        title: "🤐 Smart Sharing Tips",
        items: [
          "Think before you post - once it's online, it's there forever",
          "Avoid sharing personal information like addresses and phone numbers",
          "Be careful with location sharing and check-ins",
          "Review your privacy settings regularly"
        ]
      }
    },
    '1-5-2': { // Privacy Settings
      title: "Privacy Settings",
      description: "Take control of your digital privacy",
      tips: {
        title: "🔒 Privacy Control Tips",
        items: [
          "Review and adjust privacy settings on all platforms",
          "Limit who can see your posts and personal information",
          "Turn off location tracking when not needed",
          "Regularly audit your connected apps and permissions"
        ]
      }
    }
  }
};

/**
 * Get copywriting content for a specific check ID
 * @param {string} checkId - The check identifier (e.g., '1-1-1')
 * @returns {Object} Copywriting content object
 */
export const getCopywritingForCheck = (checkId) => {
  return COPYWRITING.checks[checkId] || {};
};

/**
 * Get validation copywriting content
 * @param {string} component - The validation component (e.g., 'scamRecognition')
 * @returns {Object} Validation copywriting content
 */
export const getValidationCopywriting = (component) => {
  return COPYWRITING.validation[component] || {};
};

/**
 * Get completion copywriting content
 * @param {string} type - The completion type (e.g., 'areaCompletion')
 * @returns {Object} Completion copywriting content
 */
export const getCompletionCopywriting = (type) => {
  return COPYWRITING.completion[type] || {};
};

/**
 * Get navigation copywriting content
 * @param {string} component - The navigation component (e.g., 'catalogueModal')
 * @returns {Object} Navigation copywriting content
 */
export const getNavigationCopywriting = (component) => {
  return COPYWRITING.navigation[component] || {};
};
