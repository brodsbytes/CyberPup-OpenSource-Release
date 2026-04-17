/**
 * Centralized user-facing text content
 * 
 * This file contains all user-facing text
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
          "Use unique passwords for each account to prevent domino effects",
          "Try passphrases: 4+ random words are both secure and memorable",
          "Avoid personal information that others could guess or find online"
        ]
      },
      checklist: {
        createStrong: {
          title: "Create Strong Passphrases",
          description: "Build 12+ character passwords using memorable phrases or random words",
          tips: [
            "Example: 'Coffee#Bicycle&Mountain4' is both strong and memorable",
            "Use 4+ random words with symbols between them",
            "Longer beats complex - 'my dog loves tennis balls!' is stronger than 'P@ssw0rd1'",
            "Avoid common phrases or song lyrics that others might guess"
          ],
          steps: [
            "Choose 3-4 random, unrelated words (like 'purple', 'keyboard', 'sandwich')",
            "Add numbers and symbols between words (like 'Purple7Keyboard&Sandwich!')",
            "Test length: count characters to ensure 12+ total",
            "Verify uniqueness: confirm this exact password isn't used anywhere else",
            "Practice typing it 3 times to ensure you can remember it"
          ]
        },
        avoidWeak: {
          title: "Avoid Weak Password Patterns",
          description: "Stay away from easily guessable passwords and personal information",
          tips: [
            "Never use birthdays, names, addresses, or phone numbers",
            "Avoid common patterns like '123456' or 'qwerty'",
            "Don't use single words found in dictionaries",
            "Reject passwords with obvious substitutions like 'P@ssword'"
          ],
          steps: [
            "Check existing passwords for personal information (name, birthday, pet names)",
            "Look for sequential patterns (123456, abcdef, qwerty)",
            "Identify dictionary words or common phrases in current passwords",
            "Replace any weak passwords immediately with strong passphrases",
            "Test new passwords: ask yourself 'could someone who knows me guess this?'"
          ]
        },
        uniqueEverywhere: {
          title: "Use Unique Passwords Everywhere",
          description: "Every account gets its own password - no exceptions",
          tips: [
            "If one account is breached, unique passwords keep others safe",
            "Password managers make unique passwords effortless to manage",
            "Even similar accounts (work email vs personal email) need different passwords",
            "This single habit prevents 81% of security breaches"
          ],
          steps: [
            "List your most important accounts (email, banking, social media, work)",
            "Check each account for password reuse by comparing them mentally",
            "Identify any shared passwords and mark accounts for updating",
            "Create new unique passphrases for accounts sharing passwords",
            "Verify uniqueness: write down the first 3 characters of each new password to confirm no duplicates"
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
          "Your email account is the 'master key' - secure it first",
          "Banking accounts need the strongest protection available",
          "Cloud storage accounts often contain your entire digital life",
          "Work accounts can affect both personal and professional security"
        ]
      },
      deviceActions: {
        identifyAccounts: {
          title: "Identify Your High-Value Accounts",
          description: "Make a list of accounts that could cause serious problems if compromised",
          steps: [
            "Write down your primary email address (this controls everything else)",
            "List all banking and credit card accounts you access online",
            "Add cloud storage accounts (Google Drive, iCloud, Dropbox, OneDrive)",
            "Include work email and any business accounts you manage",
            "Add social media accounts with large followings or sensitive content",
            "Verify each account: ask 'would losing this cause major problems?'"
          ],
          tips: [
            "Your email account can reset passwords for all other accounts",
            "Financial accounts pose immediate monetary risk if compromised",
            "Cloud accounts often contain personal photos, documents, and backups",
            "Work accounts can affect your employment and colleagues' security"
          ]
        },
        enableEmailMFA: {
          title: "Secure Your Email Account First",
          description: "Enable two-factor authentication on your primary email account",
          steps: [
            "Open your email provider (Gmail, Outlook, Yahoo, etc.) in a web browser",
            "Go to Account Settings → Security (or search 'two-factor authentication')",
            "Click 'Set up 2-step verification' or similar option",
            "Choose authenticator app method (better than SMS)",
            "Download Google Authenticator, Microsoft Authenticator, or Authy app",
            "Scan the QR code with your authenticator app",
            "Enter the 6-digit code to confirm setup",
            "Download and save backup codes in a secure location",
            "Test by logging out and logging back in"
          ],
          tips: [
            "Email 2FA protects all accounts since most use email for password recovery",
            "Authenticator apps are more secure than SMS text messages",
            "Save backup codes in a password manager or secure physical location",
            "If you only secure one account, make it your email"
          ]
        },
        enableBankingMFA: {
          title: "Secure Banking and Financial Accounts",
          description: "Add two-factor authentication to all accounts that handle your money",
          steps: [
            "Log into your bank's website or mobile app",
            "Look for 'Security Settings', 'Account Security', or 'Two-Factor Authentication'",
            "Enable 2FA using your bank's preferred method (SMS, app, or calls)",
            "Test the setup by logging out and back in",
            "Repeat for credit cards, investment accounts, and payment services (PayPal, Venmo)",
            "Enable account alerts for logins and transactions over $50",
            "Set up low-balance alerts to catch unauthorized transfers quickly"
          ],
          tips: [
            "Banks often use SMS 2FA - it's better than no 2FA at all",
            "Enable email AND text alerts for maximum monitoring",
            "Check account activity weekly, even if you get alerts",
            "Report suspicious activity immediately to your bank's fraud line"
          ]
        },
        secureRecovery: {
          title: "Set Up Secure Account Recovery",
          description: "Ensure you can recover accounts safely if locked out",
          steps: [
            "Review recovery email addresses for each high-value account",
            "Use a separate, secure email for recovery (not your daily email)",
            "Update phone numbers and remove old, unused numbers",
            "Set up security questions with answers only you would know",
            "Download backup codes for accounts that provide them",
            "Store all recovery information in a password manager or secure location",
            "Test recovery process: try 'forgot password' to see what information is required"
          ],
          tips: [
            "Use nonsensical but memorable answers to security questions ('favorite pet' = 'BlueCoffee42')",
            "A dedicated recovery email adds an extra layer of security",
            "Backup codes are like master keys - store them very securely",
            "Update recovery info whenever you change phone numbers or emails"
          ]
        }
      }
    },
    '1-1-3': { // Password Managers
      title: "Password Managers",
      description: "Let technology handle your passwords securely",
      tips: {
        title: "🔐 Password Manager Tips",
        items: [
          "Built-in options: Most devices have password managers already installed",
          "Choose reputable apps with zero-knowledge encryption",
          "Your master password is the key to everything - make it unbreakable",
          "Enable sync and biometric unlock for seamless security"
        ]
      },
      deviceActions: {
        chooseManager: {
          title: "Choose Your Password Manager",
          description: "Select and install a trusted password manager that fits your devices",
          steps: [
            "Check if your device has a built-in password manager (iCloud Keychain, Google Password Manager)",
            "For built-in managers: Go to Settings → Passwords → turn on AutoFill",
            "For third-party apps: Choose from Bitwarden (free), 1Password, or Dashlane",
            "Download your chosen app from the official app store (Apple App Store or Google Play)",
            "Open the app and create an account using your secure email address",
            "Verify your email address through the confirmation link"
          ],
          tips: [
            "Built-in managers are secure and convenient for single-platform users",
            "Bitwarden is open-source and offers excellent free features",
            "Premium managers offer advanced features like security monitoring",
            "Never download password managers from unknown websites"
          ]
        },
        deviceSpecificRecommendations: {
          title: "Expert Recommendations for Your Devices",
          description: "Based on your device ecosystem, here are the best password manager options:",
          scenarios: {
            appleOnly: {
              title: "Apple Ecosystem (iPhone + Mac)",
              recommendation: "Apple Passwords (Built-in)",
              explanation: "Since you only use Apple devices, the built-in iCloud Keychain with the Passwords app is your best option. It's seamlessly integrated, free, and provides end-to-end encryption across all your Apple devices.",
              setupSteps: [
                "Go to Settings → Passwords on your iPhone/iPad",
                "Turn on 'AutoFill Passwords'",
                "On Mac: System Preferences → Apple ID → iCloud → Keychain",
                "Enable 'Keychain' sync across devices"
              ],
              pros: ["Free", "Native integration", "Automatic sync", "Biometric unlock"],
              alternatives: ["1Password (premium features)"]
            },
            androidOnly: {
              title: "Android Device",
              recommendation: "Google Password Manager (Built-in)",
              explanation: "For Android users, Google's built-in password manager is the most convenient option. It automatically saves and fills passwords across your Google account and Chrome browser.",
              setupSteps: [
                "Open Settings on your Android device",
                "Search for 'Password manager' or scroll to find it",
                "Tap 'Password manager' to access Google Password Manager",
                "Turn on 'Offer to save passwords' in Chrome settings"
              ],
              pros: ["Free", "Automatic sync", "Chrome integration", "Google account integration"],
              alternatives: ["Bitwarden (cross-platform option)"]
            },
            mixedDevices: {
              title: "Mixed Device Ecosystem",
              recommendation: "Bitwarden (Free Cross-Platform)",
              explanation: "Since you use multiple device types, Bitwarden is the best free option that works seamlessly across iPhone, Android, Windows, and Mac. It's open-source, secure, and offers unlimited password storage.",
              setupSteps: [
                "Download Bitwarden from your device's app store",
                "Create a free account with a strong master password",
                "Install browser extensions for easy access",
                "Enable biometric unlock on mobile devices"
              ],
              pros: ["Free", "Cross-platform", "Open-source", "Unlimited passwords", "Strong security"],
              alternatives: ["1Password (premium)", "Proton Pass (privacy-focused)"]
            }
          }
        },
        createMasterPassword: {
          title: "Create an Unbreakable Master Password",
          description: "Set up the one password that protects all your others",
          steps: [
            "Create a passphrase using 4-6 random words (like 'Coffee Mountain Bicycle Purple 47')",
            "Make it at least 16 characters long with numbers and symbols",
            "Practice typing it 5 times to ensure you can remember it",
            "Write it down on paper and store it securely (delete digital copies)",
            "Set up account recovery options (backup email, security questions)",
            "Test your master password by logging out and back in"
          ],
          tips: [
            "This is the ONLY password you'll need to remember - make it count",
            "Use a method: song lyrics, book quotes, or random word combinations",
            "Never use personal information (names, birthdays, addresses)",
            "Consider a physical backup stored in a safe place"
          ]
        },
        importPasswords: {
          title: "Import and Generate New Passwords",
          description: "Move your existing passwords and create new strong ones",
          steps: [
            "Import existing passwords: look for 'Import' or 'Add passwords' in settings",
            "Upload from browser (Chrome: Settings → Passwords → Export)",
            "Add your most important accounts manually if import doesn't work",
            "Generate new strong passwords for each account (use the 'Generate' button)",
            "Update weak passwords: let the app identify and replace weak ones",
            "Verify all critical accounts are saved and working"
          ],
          tips: [
            "Start with your most important accounts (email, banking, work)",
            "Use the password generator for maximum strength",
            "Update passwords one at a time to avoid lockouts",
            "Test each new password immediately after saving"
          ]
        },
        enableBiometrics: {
          title: "Set Up Quick and Secure Access",
          description: "Enable biometric unlock and auto-fill for seamless security",
          steps: [
            "Enable biometric unlock: go to app Settings → Security → Enable Face ID/Touch ID/Fingerprint",
            "Test biometric unlock by closing and reopening the app",
            "Turn on auto-fill: Settings → AutoFill → Enable for this app",
            "Test auto-fill by visiting a website and logging in",
            "Enable sync across devices if you use multiple devices",
            "Set up the mobile app if you started on desktop (or vice versa)"
          ],
          tips: [
            "Biometrics are convenient and secure for quick access",
            "Auto-fill makes using strong passwords effortless",
            "Sync keeps your passwords updated across all devices",
            "Keep the app updated for the latest security features"
          ]
        }
      }
    },
    '1-1-4': { // MFA Setup
      title: "Multi-Factor Authentication",
      description: "Add an extra layer of security to your accounts",
      tips: {
        title: "🔒 MFA Setup Tips",
        items: [
          "MFA blocks 99% of automated attacks even with stolen passwords",
          "Authenticator apps are more secure than SMS codes",
          "Start with email and banking accounts first",
          "Always save backup codes in a secure location"
        ]
      },
      deviceActions: {
        setupAuthenticator: {
          title: "Set Up Authenticator App",
          description: "Install and configure an authenticator app for secure 2FA codes",
          steps: [
            "Download Google Authenticator, Microsoft Authenticator, or Authy from your app store",
            "Open the authenticator app and tap 'Add account' or '+' button",
            "Choose 'Scan QR code' when setting up 2FA on websites",
            "Test by setting up 2FA on a less critical account first (like Reddit or Discord)",
            "Verify the 6-digit codes work by logging out and back in",
            "Enable app backup/sync if available (Authy auto-syncs, others may need setup)"
          ],
          tips: [
            "Google Authenticator is simple but doesn't sync across devices",
            "Microsoft Authenticator syncs with your Microsoft account",
            "Authy automatically syncs across devices and has backup features",
            "Test each setup immediately to ensure codes work"
          ]
        },
        enableEmailMFA: {
          title: "Secure Your Email with MFA",
          description: "Enable two-factor authentication on your primary email account",
          steps: [
            "Log into your email (Gmail, Outlook, Yahoo, etc.) on a computer",
            "Go to Account Settings → Security (search for '2-step verification')",
            "Click 'Turn on 2-step verification' or similar",
            "Choose 'Authenticator app' method (not SMS)",
            "Open your authenticator app and scan the QR code shown",
            "Enter the 6-digit code to confirm setup",
            "Download and securely save the backup codes provided",
            "Test by logging out and back in using your phone for the code"
          ],
          tips: [
            "Email is the master key - secure this first above all others",
            "Use authenticator apps instead of SMS to prevent SIM swapping",
            "Print backup codes and store them in a safe place",
            "Set up 2FA on your recovery email address too"
          ]
        },
        enableBankingMFA: {
          title: "Secure Your Financial Accounts",
          description: "Add MFA to all accounts that handle your money",
          steps: [
            "Log into your bank's website or app",
            "Look for 'Security Settings', 'Two-Factor Authentication', or 'Additional Security'",
            "Enable the strongest option available (app > SMS > calls)",
            "If only SMS is available, enable it (better than nothing)",
            "Test the setup by logging out and back in",
            "Repeat for credit cards, investment accounts, and payment apps (PayPal, Venmo)",
            "Enable account alerts for all login attempts and transactions"
          ],
          tips: [
            "Banks often use SMS 2FA - accept this as it's still much better than passwords alone",
            "Enable both login alerts and transaction notifications",
            "Some banks offer hardware tokens - these are the most secure option",
            "Report any unrecognized login alerts immediately"
          ]
        },
        enableCriticalMFA: {
          title: "Secure All Critical Accounts",
          description: "Enable MFA on cloud storage, social media, and work accounts",
          steps: [
            "Cloud storage: Enable 2FA on Google Drive, iCloud, Dropbox, OneDrive",
            "Social media: Enable 2FA on Facebook, Instagram, Twitter, LinkedIn",
            "Work accounts: Enable 2FA on work email, Microsoft 365, Google Workspace",
            "Shopping: Enable 2FA on Amazon, PayPal, and frequent shopping sites",
            "For each account: use authenticator app method when available",
            "Save backup codes for each account in your password manager"
          ],
          tips: [
            "Prioritize accounts that store personal data or have many contacts",
            "Social media accounts are often targeted for scamming your contacts",
            "Work accounts protect both personal and company information",
            "Some services offer backup methods - enable multiple when available"
          ]
        }
      }
    },
    '1-1-5': { // Breach Check
      title: "Breach Check",
      description: "Find out if your accounts have been compromised",
      tips: {
        title: "🔍 Breach Check Tips",
        items: [
          "Check all email addresses you've ever used for online accounts",
          "Breaches can happen to any company - even major ones like Facebook and LinkedIn",
          "If found in a breach, change that password immediately everywhere you used it",
          "Set up ongoing monitoring to catch future breaches automatically"
        ]
      },
      checklist: {
        breachCheck: {
          title: "Check Your Email for Data Breaches",
          description: "Use the built-in checker to see if your email was found in any known data breaches",
          tips: [
            "Data breaches expose usernames, passwords, and personal information",
            "Major companies get breached regularly - this isn't your fault",
            "Even if no breaches are found today, check again every few months",
            "Use all email addresses you've ever used for online accounts"
          ],
          steps: [
            "Enter your primary email address in the checker above",
            "Review any breaches found and note the dates",
            "If breaches are found, don't panic - you can fix this",
            "Repeat for any other email addresses you use",
            "Make a note of which accounts might be affected"
          ]
        },
        passwordUpdate: {
          title: "Update Compromised Passwords",
          description: "Change passwords for any accounts that may have been affected by breaches",
          tips: [
            "If your email was in a breach, assume that password was stolen",
            "Change the password everywhere you used that same password",
            "Use this as an opportunity to create strong, unique passwords",
            "Focus on your most important accounts first (banking, email, work)"
          ],
          steps: [
            "List all accounts that used the same password as breached accounts",
            "Start with the most critical accounts (banking, primary email)",
            "Create new, strong, unique passwords for each account",
            "Use your password manager to generate and store new passwords",
            "Test each new password by logging out and back in",
            "Enable 2FA on any account that supports it while you're updating"
          ]
        }
      }
    },
    '1-2-1': { // Screen Lock
      title: "Screen Lock",
      description: "Keep your device secure when you're not using it",
      tips: {
        title: "🔐 Screen Lock Best Practices",
        items: [
          "A stolen unlocked phone gives thieves access to everything",
          "Auto-lock should activate within 30 seconds to 1 minute",
          "Biometric unlock (fingerprint/face) is both secure and convenient",
          "Avoid simple patterns that others can see you enter"
        ]
      },
      deviceActions: {
        enableScreenLock: {
          title: "Set Up Screen Lock",
          description: "Configure a secure lock method to protect your device when not in use",
          steps: [
            "Open your device Settings app",
            "Look for 'Security', 'Lock Screen', or 'Face ID & Passcode' (iOS)",
            "Choose your lock method: PIN (6+ digits), Password, Pattern, or Biometric",
            "For PINs: avoid obvious numbers (123456, birthdays, repeated digits)",
            "For passwords: use something memorable but not easily guessed",
            "Test your lock by turning off the screen and unlocking it"
          ],
          tips: [
            "Biometric locks (fingerprint/face) are convenient and secure",
            "A 6-digit PIN is much more secure than 4 digits",
            "Pattern locks can be seen through screen smudges - clean your screen",
            "Don't use personal information (birthdates, addresses) for lock codes"
          ]
        },
        configureAutoLock: {
          title: "Set Up Auto-Lock Timer",
          description: "Make your device lock automatically after a short period of inactivity",
          steps: [
            "In Settings, find 'Display', 'Screen timeout', or 'Auto-Lock'",
            "Set the timer to 30 seconds or 1 minute (maximum security)",
            "If using for work, 2-3 minutes may be acceptable for productivity",
            "Test by leaving your device idle and confirming it locks automatically",
            "Adjust if needed - balance security with your usage patterns"
          ],
          tips: [
            "Shorter auto-lock times mean better security",
            "If you forget to lock manually, auto-lock is your safety net",
            "Battery life impact is minimal with modern devices",
            "Consider longer timeouts only if you're in a secure, private location"
          ]
        }
      }
    },
    '1-2-2': { // Remote Lock
      title: "Remote Lock",
      description: "Protect your device even when it's lost or stolen",
      tips: {
        title: "📱 Remote Lock Tips",
        items: [
          "Lost devices can be locked and wiped remotely to protect your data",
          "Enable location services for Find My Device to work properly",
          "Test the remote lock feature before you need it",
          "Remote wipe is the nuclear option - use only if device recovery is impossible"
        ]
      },
      deviceActions: {
        enableFindMyDevice: {
          title: "Enable Find My Device",
          description: "Set up device tracking and remote lock capabilities",
          steps: [
            "Open Settings and sign in to your device account (Apple ID, Google Account)",
            "Find 'Find My' (iOS) or 'Security' then 'Find My Device' (Android)",
            "Turn on Find My Device/Find My iPhone",
            "Enable 'Send Last Location' to help find your device when battery is low",
            "Test by visiting icloud.com/find or android.com/find from another device",
            "Verify your device appears on the map and you can make it play a sound"
          ],
          tips: [
            "You need to be signed in to your Apple ID or Google Account for this to work",
            "Location services must be enabled for Find My Device to function",
            "The feature works even when your device is offline (with some limitations)",
            "Practice using the web interface before you actually lose your device"
          ]
        },
        testRemoteLock: {
          title: "Test Remote Lock and Locate",
          description: "Verify that you can remotely control your device if it's lost",
          steps: [
            "Visit icloud.com/find (iOS) or android.com/find (Android) on a computer",
            "Sign in with the same account used on your device",
            "Select your device from the list of devices",
            "Try 'Play Sound' to make your device ring loudly",
            "Test 'Lost Mode' or 'Lock' to remotely lock your device",
            "Unlock your device normally to confirm the lock worked",
            "Note down these website addresses for future emergencies"
          ],
          tips: [
            "Practice this when you're calm, not when you're panicking about a lost device",
            "Save the find device websites in your browser bookmarks",
            "The play sound feature works even when your device is on silent",
            "Remote lock can display a custom message with your contact information"
          ]
        },
        setupRemoteWipe: {
          title: "Understand Remote Wipe Options",
          description: "Learn when and how to remotely erase your device as a last resort",
          steps: [
            "In your Find My Device web interface, locate the 'Erase' or 'Remote Wipe' option",
            "Read the warnings carefully - this permanently deletes everything",
            "Understand this should only be used if device recovery is impossible",
            "Ensure you have recent backups before considering remote wipe",
            "Know that remote wipe may prevent future location tracking",
            "Consider this option only for devices with extremely sensitive data"
          ],
          tips: [
            "Remote wipe is irreversible - use only as an absolute last resort",
            "If you wipe your device, you won't be able to track its location anymore",
            "Make sure your data is backed up before you ever need this feature",
            "Sometimes just locking the device is sufficient protection"
          ]
        }
      }
    },
    '1-2-3': { // Device Updates
      title: "Device Updates",
      description: "Keep your device secure with the latest updates",
      tips: {
        title: "🔄 Update Security Tips",
        items: [
          "Updates fix security vulnerabilities that criminals actively exploit",
          "Enable automatic updates so you're protected without thinking about it",
          "Restart your device after major updates to ensure they take effect",
          "Don't delay security updates - criminals move fast to exploit known flaws"
        ]
      },
      deviceActions: {
        enableAutoUpdates: {
          title: "Enable Automatic System Updates",
          description: "Set your device to automatically install critical security updates",
          steps: [
            "Open Settings and look for 'System Update', 'Software Update', or 'Windows Update'",
            "Turn on 'Automatic Updates' or 'Download and Install Automatically'",
            "For iOS: Settings → General → Software Update → Automatic Updates → On",
            "For Android: Settings → System → System Update → Auto-download over Wi-Fi",
            "For Windows: Settings → Update & Security → Windows Update → Advanced Options",
            "Restart your device to check for and install any pending updates"
          ],
          tips: [
            "Automatic updates happen overnight when your device is charging",
            "You can still choose when to restart for updates that require it",
            "Security updates are usually small and install quickly",
            "Keep your device plugged in and connected to Wi-Fi for automatic updates"
          ]
        },
        enableAppUpdates: {
          title: "Enable Automatic App Updates",
          description: "Keep all your apps updated with the latest security patches",
          steps: [
            "Open your device's app store (App Store, Google Play Store)",
            "Go to Settings or your profile menu",
            "Find 'Auto-update apps' or 'Automatic Downloads'",
            "Enable auto-updates over Wi-Fi (to avoid data charges)",
            "For iOS: App Store → Profile → Auto-Downloads → App Updates",
            "For Android: Play Store → Settings → Auto-update apps → Over Wi-Fi only",
            "Check for any pending app updates and install them now"
          ],
          tips: [
            "Apps with security vulnerabilities are constantly being fixed",
            "Auto-updates over Wi-Fi only prevents surprise data charges",
            "Critical apps like browsers and messaging apps should always be current",
            "You can still manually review updates if you prefer"
          ]
        },
        updateNow: {
          title: "Install Current Updates",
          description: "Check for and install any pending updates right away",
          steps: [
            "Go to Settings → System Update (or Software Update)",
            "Tap 'Check for Updates' and wait for the scan to complete",
            "If updates are found, tap 'Download and Install'",
            "Keep your device plugged in during the update process",
            "Allow the device to restart if prompted",
            "After restart, check the app store for app updates and install them",
            "Verify your device is now running the latest available version"
          ],
          tips: [
            "Updates can take 15-30 minutes depending on size",
            "Don't interrupt the update process once it starts",
            "Make sure you have enough battery (50%+) or keep plugged in",
            "Some updates require multiple restarts - this is normal"
          ]
        }
      }
    },
    '1-2-4': { // Bluetooth & Wi-Fi
      title: "Bluetooth & Wi-Fi",
      description: "Secure your wireless connections",
      tips: {
        title: "📶 Wireless Security Tips",
        items: [
          "Bluetooth can be exploited by nearby attackers to access your device",
          "Auto-join Wi-Fi can connect you to malicious networks with familiar names",
          "Old saved Wi-Fi networks can be spoofed to trick your device",
          "Public Wi-Fi should be used cautiously for non-sensitive activities only"
        ]
      },
      deviceActions: {
        secureBluetoothSettings: {
          title: "Secure Bluetooth Settings",
          description: "Configure Bluetooth to minimize security risks while maintaining functionality",
          steps: [
            "Open Settings and go to Bluetooth",
            "Turn off Bluetooth when you're not actively using it",
            "If you must leave it on, make your device 'non-discoverable' or 'hidden'",
            "Review paired devices and remove any you don't recognize or no longer use",
            "For devices you keep: ensure they require pairing confirmation for connections",
            "Never accept pairing requests from unknown devices",
            "Consider turning off Bluetooth in high-risk areas (airports, conferences)"
          ],
          tips: [
            "Modern Bluetooth is much more secure than older versions",
            "Paired devices like headphones and watches are generally safe",
            "The biggest risk is in public places with many unknown devices nearby",
            "Turn Bluetooth off at night to save battery and reduce attack window"
          ]
        },
        configureWiFiSecurity: {
          title: "Configure Safe Wi-Fi Settings",
          description: "Set up Wi-Fi to avoid automatically connecting to potentially dangerous networks",
          steps: [
            "Open Settings → Wi-Fi",
            "Turn off 'Auto-Join' or 'Connect to suggested networks'",
            "Turn off 'Ask to join networks' to prevent constant prompts",
            "Review your saved networks and forget any you don't recognize",
            "For networks you keep: ensure they require a password (not 'Open')",
            "Prioritize your home and work networks over public ones",
            "Check that 'Private Address' or 'Use random MAC' is enabled"
          ],
          tips: [
            "Auto-join can connect you to malicious networks with familiar names",
            "Criminals create fake networks named 'Free WiFi' or 'Airport WiFi'",
            "Random MAC addresses help protect your privacy on public networks",
            "Only connect to public Wi-Fi manually when you actually need it"
          ]
        },
        publicWiFiSafety: {
          title: "Use Public Wi-Fi Safely",
          description: "Learn how to minimize risks when using public wireless networks",
          steps: [
            "Only connect to official public Wi-Fi (ask staff for the correct network name)",
            "Look for networks that require a password or terms acceptance",
            "Avoid networks with names like 'Free WiFi' or 'Public' without clear ownership",
            "Never do banking, shopping, or sensitive work on public Wi-Fi",
            "If you must access sensitive sites, use your phone's hotspot instead",
            "Log out of important accounts when done, don't just close browser tabs",
            "Forget the public network when leaving to prevent auto-reconnection"
          ],
          tips: [
            "Cellular data is almost always more secure than public Wi-Fi",
            "Coffee shops, hotels, and airports are common targets for Wi-Fi attacks",
            "If a network asks you to download something to connect, it's probably malicious",
            "Use websites with HTTPS (green lock icon) whenever possible on public Wi-Fi"
          ]
        }
      }
    },
    '1-2-5': { // Public Charging
      title: "Public Charging",
      description: "Charge safely without risking your data",
      tips: {
        title: "⚡ Safe Charging Tips",
        items: [
          "Juice jacking attacks can steal data or install malware through USB ports",
          "Public USB ports in airports and hotels are high-risk targets",
          "Your own charger and cable is always the safest option",
          "Power outlets are safe - only USB data connections pose risks"
        ]
      },
      checklist: {
        avoidUSBPorts: {
          title: "Avoid Public USB Charging Ports",
          description: "Stay away from USB ports in public places that could steal your data",
          tips: [
            "USB ports can transfer data as well as power, creating security risks",
            "Criminals sometimes install malware in public charging stations",
            "Airports, hotels, conferences, and malls are common targets",
            "Even if the port looks official, it could be compromised"
          ],
          steps: [
            "Look for regular power outlets instead of USB ports when available",
            "Avoid charging stations with only USB ports",
            "Never use USB ports in unknown or suspicious locations",
            "If you see a USB port asking to 'trust this computer', decline",
            "Be especially cautious in high-traffic public areas"
          ]
        },
        useOwnEquipment: {
          title: "Bring Your Own Charging Equipment",
          description: "Use your personal charger and cable to eliminate most risks",
          tips: [
            "Your own equipment that you control is always safest",
            "Wall adapters (power outlets) only provide power, no data connection",
            "Keep a portable battery pack for emergencies",
            "Your own cable prevents any tampering or data interception"
          ],
          steps: [
            "Pack your charging cable and wall adapter when traveling",
            "Use power outlets with your own wall adapter whenever possible",
            "Consider investing in a portable battery pack for backup power",
            "If staying overnight, bring a charging cable for your hotel room",
            "Keep a car charger if you travel by car frequently"
          ]
        },
        emergencyOptions: {
          title: "Safe Emergency Charging Options",
          description: "Learn safe alternatives when you must charge in public without your equipment",
          tips: [
            "USB data blockers prevent data transfer while allowing charging",
            "Charge-only cables don't have data wires inside",
            "Some devices have charging-only modes you can enable",
            "Turning off your device while charging provides extra protection"
          ],
          steps: [
            "If you must use public USB: turn off your device completely first",
            "Look for 'charge-only' USB cables at electronics stores",
            "Consider buying a USB data blocker (small adapter that blocks data)",
            "If your device prompts to 'trust this computer', always select 'Don't trust'",
            "Monitor your device for any unusual behavior after public charging"
          ]
        }
      }
    },
    '1-3-1': { // Cloud Backup
      title: "Cloud Backup",
      description: "Keep your important files safe in the cloud",
      tips: {
        title: "☁️ Cloud Backup Tips",
        items: [
          "Cloud backup protects against device loss, theft, and hardware failure",
          "Most devices come with built-in cloud backup that's easy to enable",
          "Automatic backup ensures you never lose recent photos and documents",
          "Cloud backup also syncs your data across multiple devices"
        ]
      },
      deviceActions: {
        enableDeviceBackup: {
          title: "Enable Device Cloud Backup",
          description: "Turn on your device's built-in backup to protect photos, apps, and settings",
          steps: [
            "Open Settings and sign in to your device account (Apple ID or Google Account)",
            "For iOS: Settings → [Your Name] → iCloud → iCloud Backup → Turn On",
            "For Android: Settings → Google → Backup → Turn on 'Backup by Google One'",
            "Ensure you're connected to Wi-Fi and allow the initial backup to complete",
            "For iOS: also enable backup for Photos, Contacts, Calendar, and important apps",
            "For Android: select what to backup (App data, Call history, Device settings, etc.)",
            "Check that backup happens automatically - test by making changes and verifying sync"
          ],
          tips: [
            "Initial backup may take several hours depending on data amount",
            "Backups usually happen automatically when charging overnight on Wi-Fi",
            "Free storage limits: 5GB (iCloud) or 15GB (Google) - upgrade if needed",
            "This backup includes app data, device settings, and purchased content"
          ]
        },
        setupCloudStorage: {
          title: "Set Up Cloud Storage for Files",
          description: "Configure cloud storage for documents, photos, and important files",
          steps: [
            "Choose your cloud service: iCloud Drive, Google Drive, OneDrive, or Dropbox",
            "Download the app or access through Settings if built-in",
            "Sign up for an account and verify your email",
            "Enable automatic photo backup from your camera roll",
            "Set up automatic sync for Desktop and Documents folders (computers)",
            "Upload important existing files manually to ensure they're backed up",
            "Test by taking a photo and confirming it appears in cloud storage"
          ],
          tips: [
            "Most services offer 5-15GB free, which covers photos and documents",
            "Photo backup can use significant storage - consider compression options",
            "Enable 'Upload on Wi-Fi only' to avoid data charges",
            "Organize files in folders to make them easier to find later"
          ]
        },
        testBackupRestore: {
          title: "Test Your Backup and Restore Process",
          description: "Verify that your backups work and you know how to restore data if needed",
          steps: [
            "Create a test file or take a test photo",
            "Verify it appears in your cloud storage within a few minutes",
            "Try downloading/accessing the file from another device or web browser",
            "Test restoring a deleted file from the cloud storage trash/recycle bin",
            "Practice the device restore process: know how to restore from cloud backup",
            "Document the steps or bookmark the restore instructions for future reference",
            "Check backup frequency: ensure new files are backed up regularly"
          ],
          tips: [
            "Don't wait until you need it to learn how backup restore works",
            "Most cloud services have a 'recently deleted' folder for accidental deletions",
            "Device restore typically happens during initial setup of a new device",
            "Keep your cloud account password and recovery information secure"
          ]
        }
      }
    },
    '1-3-2': { // Local Backup
      title: "Local Backup",
      description: "Create local copies of your important data",
      tips: {
        title: "💾 Local Backup Tips",
        items: [
          "Local backups protect against cloud service outages and account lockouts",
          "External drives are cheap insurance against losing irreplaceable photos and documents",
          "Follow the 3-2-1 rule: 3 copies total, 2 different storage types, 1 offsite",
          "Regular backup schedules prevent losing months of recent work"
        ]
      },
      checklist: {
        getExternalStorage: {
          title: "Get External Backup Storage",
          description: "Acquire external storage devices for creating local backups",
          tips: [
            "USB drives are cheap and portable for small amounts of important data",
            "External hard drives offer large capacity for comprehensive backups",
            "Consider two drives: one for regular use, one for long-term storage",
            "Brand-name drives from Western Digital, Seagate, or SanDisk are reliable"
          ],
          steps: [
            "Assess how much storage you need (photos, documents, music, etc.)",
            "Buy an external drive with at least double your current data size",
            "For most people: 1TB external drive covers photos, documents, and more",
            "Consider getting two smaller drives instead of one large one",
            "Test the drive by copying some files to ensure it works",
            "Label the drives clearly (e.g., 'Backup 2024', 'Photos Archive')"
          ]
        },
        createBackupSchedule: {
          title: "Set Up Regular Backup Schedule",
          description: "Establish a routine for backing up your data to external storage",
          tips: [
            "Weekly backups prevent losing more than a week's worth of work",
            "Monthly full backups plus weekly incremental backups work well",
            "Mark backup days on your calendar until it becomes a habit",
            "Keep backup drives in a different location when not in use"
          ],
          steps: [
            "Pick a regular day/time for backups (e.g., Sunday evenings)",
            "Connect your external drive and copy important folders",
            "Start with: Documents, Desktop, Photos, Downloads, and any work folders",
            "For computers: use built-in backup tools (Time Machine, File History)",
            "For phones: manually copy photos and videos to the drive",
            "Create a checklist of what to backup so you don't forget anything",
            "Test restore by copying a file back from the backup drive"
          ]
        },
        protectBackups: {
          title: "Protect and Store Backups Safely",
          description: "Keep your backup drives secure and in good condition",
          tips: [
            "Store backup drives away from your main devices (fire, theft protection)",
            "Keep drives in a cool, dry place away from magnets and heat",
            "Consider a fireproof safe or safety deposit box for critical backups",
            "Rotate between multiple drives to prevent single point of failure"
          ],
          steps: [
            "Store backup drives in a different room or building when possible",
            "Keep drives in protective cases or static-free bags",
            "Label drives with contents and backup date",
            "Test old backups annually to ensure they still work",
            "Replace backup drives every 3-5 years as they age",
            "Consider making copies of irreplaceable data (family photos) on multiple drives"
          ]
        }
      }
    },
    '1-4-1': { // Scam Recognition
      title: "Scam Recognition",
      description: "Learn to spot and avoid scams",
      tips: {
        title: "🚫 Scam Detection Tips",
        items: [
          "Scammers use urgency, fear, and excitement to bypass your logical thinking",
          "Legitimate companies never ask for passwords or codes over email or phone",
          "If it sounds too good to be true (free money, prizes), it's always a scam",
          "When in doubt, hang up, close the email, and contact the company directly"
        ]
      },
      checklist: {
        recognizeRedFlags: {
          title: "Practice Recognizing Scam Red Flags",
          description: "Learn to identify the common warning signs that indicate a scam",
          tips: [
            "Urgency: 'Act now or lose this opportunity forever!'",
            "Fear: 'Your account will be closed unless you verify immediately!'",
            "Authority: 'This is the IRS/FBI/Microsoft calling...'",
            "Secrecy: 'Don't tell anyone about this opportunity'"
          ],
          steps: [
            "Practice with the interactive scenarios above",
            "Look for urgent language designed to make you panic",
            "Notice requests for personal information (passwords, Social Security numbers)",
            "Identify poor grammar, spelling, or formatting in messages",
            "Recognize offers that seem too good to be true",
            "Watch for requests to pay via gift cards, wire transfers, or cryptocurrency"
          ]
        },
        verifyBeforeActing: {
          title: "Always Verify Before Taking Action",
          description: "Develop the habit of independently confirming suspicious requests",
          tips: [
            "Never use contact information provided in a suspicious message",
            "Look up official phone numbers or websites yourself",
            "Real companies won't mind if you hang up and call them back",
            "Take time to think - scammers rely on quick, emotional decisions"
          ],
          steps: [
            "If you get a suspicious call, hang up and call the official number",
            "If you get a suspicious email, don't click links - go to the website directly",
            "Ask a trusted friend or family member for their opinion",
            "Search online for 'Is this a scam?' with details about what you received",
            "Contact the real company through their official customer service",
            "Remember: it's always better to be cautious than sorry"
          ]
        }
      }
    },
    '1-4-2': { // Scam Reporting
      title: "Scam Reporting",
      description: "Help protect others by reporting scams",
      tips: {
        title: "📢 Reporting Tips",
        items: [
          "Reporting scams helps authorities track patterns and protect others",
          "Take screenshots before deleting scam messages - they're valuable evidence",
          "Most countries have national fraud reporting hotlines and websites",
          "Report even if you didn't fall for it - your report might save someone else"
        ]
      },
      checklist: {
        collectEvidence: {
          title: "Collect and Document Scam Evidence",
          description: "Gather information about the scam to help authorities investigate",
          tips: [
            "Screenshots capture information that might disappear",
            "Phone numbers, email addresses, and website URLs are crucial evidence",
            "Note the date, time, and method of contact",
            "Keep records even if you didn't lose money - it helps build cases"
          ],
          steps: [
            "Take screenshots of scam emails, texts, or websites before closing them",
            "Write down phone numbers that called you, even if they seem fake",
            "Save the original email message in a folder called 'Scam Evidence'",
            "Note what information the scammer was asking for",
            "Record any money amounts mentioned or requested",
            "Write down how the scammer wanted you to pay (gift cards, wire transfer, etc.)"
          ]
        },
        reportToAuthorities: {
          title: "Report to Appropriate Authorities",
          description: "Submit scam reports to help law enforcement and protect others",
          tips: [
            "In the US: Report to FTC (reportfraud.ftc.gov) and FBI (ic3.gov)",
            "In Australia: Report to ACCC Scamwatch (scamwatch.gov.au)",
            "In UK: Report to Action Fraud (actionfraud.police.uk)",
            "For international scams: Report to both local and international authorities"
          ],
          steps: [
            "Visit your country's main fraud reporting website",
            "Fill out the online form with all the evidence you collected",
            "Include screenshots as attachments if the form allows",
            "Report phone scams to your phone carrier's spam reporting number",
            "Report email scams by forwarding them to your email provider's abuse address",
            "Keep a copy of your report confirmation number for your records"
          ]
        },
        warnOthers: {
          title: "Warn Family and Friends",
          description: "Share information about scams to help protect people you care about",
          tips: [
            "Older adults are often targeted by specific types of scams",
            "Share specific details about what to watch for",
            "Don't shame anyone who has fallen for scams - it can happen to anyone",
            "Focus on prevention rather than criticism"
          ],
          steps: [
            "Tell family members about the specific scam you encountered",
            "Share the warning signs and red flags you learned to recognize",
            "Post warnings on social media (without sharing personal details)",
            "Forward scam alerts from authorities to people who might be targeted",
            "Talk to older relatives about common scams targeting seniors",
            "Remind everyone that real companies never ask for passwords over phone/email"
          ]
        }
      }
    },
    '1-5-1': { // Sharing Awareness
      title: "Sharing Awareness",
      description: "Be mindful of what you share online",
      tips: {
        title: "🤐 Smart Sharing Tips",
        items: [
          "Personal information you share can be used to guess security questions",
          "Location posts can tell criminals when you're away from home",
          "Photos contain hidden data (metadata) that can reveal your location",
          "Social media posts are often used for social engineering attacks"
        ]
      },
      checklist: {
        reviewPersonalInfo: {
          title: "Review What Personal Information You Share",
          description: "Identify and reduce personal information that could be used against you",
          tips: [
            "Your mother's maiden name, pet names, and birthdate are common security questions",
            "Full birthdates, addresses, and phone numbers enable identity theft",
            "Employer information can be used for targeted attacks",
            "Family member names and relationships help scammers impersonate you"
          ],
          steps: [
            "Review your social media profiles for personal information",
            "Remove or limit visibility of birthdate, address, phone number",
            "Check what information is visible in your 'About' sections",
            "Look through old posts for personal details you may have shared",
            "Consider using initials instead of full names for family members",
            "Remove or limit school, workplace, and location information"
          ]
        },
        manageLocationSharing: {
          title: "Control Location and Check-in Sharing",
          description: "Prevent broadcasting your location and travel patterns",
          tips: [
            "Location posts reveal when you're away from home",
            "Regular patterns (gym, work, school) can be tracked by stalkers",
            "Vacation posts in real-time advertise an empty house",
            "Tagged locations in photos reveal your routine and habits"
          ],
          steps: [
            "Turn off automatic location tagging in camera settings",
            "Disable location sharing in social media apps",
            "Avoid checking in to locations in real-time",
            "Post vacation photos after you return home",
            "Review and remove location tags from existing posts",
            "Be cautious about sharing flight information or travel plans"
          ]
        },
        practiceSmartSharing: {
          title: "Develop Smart Sharing Habits",
          description: "Build habits that protect your privacy while staying social",
          tips: [
            "Think: 'Would I be comfortable if a stranger knew this?'",
            "Consider how information could be misused before posting",
            "Remember that privacy settings can change - don't rely on them completely",
            "What you share reflects on friends and family too"
          ],
          steps: [
            "Pause before posting and ask 'Who could this information help?'",
            "Avoid sharing financial information, even indirectly (expensive purchases)",
            "Don't post about security measures (new security system, house keys)",
            "Limit sharing of children's information and photos",
            "Avoid posting when you're emotional or upset",
            "Consider private messaging instead of public posts for personal news"
          ]
        }
      }
    },
    '1-5-2': { // Privacy Settings
      title: "Privacy Settings",
      description: "Take control of your digital privacy",
      tips: {
        title: "🔒 Privacy Control Tips",
        items: [
          "Default privacy settings are usually set to share maximum data",
          "Companies change privacy settings without notice - review them regularly",
          "App permissions often ask for more access than actually needed",
          "Third-party apps can access your data through social media connections"
        ]
      },
      checklist: {
        reviewSocialMedia: {
          title: "Review Social Media Privacy Settings",
          description: "Audit and tighten privacy controls on your social media accounts",
          tips: [
            "Default settings are usually designed to share widely, not protect privacy",
            "Privacy settings can change when platforms update - check them regularly",
            "Different types of content can have different privacy settings",
            "Friends-of-friends settings can expose you to hundreds of strangers"
          ],
          steps: [
            "Go to Privacy Settings on Facebook, Instagram, Twitter, LinkedIn, TikTok",
            "Set posts to 'Friends only' or 'Private' instead of 'Public'",
            "Turn off 'Allow search engines to link to your profile'",
            "Disable 'Suggest your profile to people who may know you'",
            "Review who can contact you and send friend requests",
            "Turn off location sharing and check-in features",
            "Limit who can see your friends list and tagged photos"
          ]
        },
        manageAppPermissions: {
          title: "Audit and Limit App Permissions",
          description: "Review what data your apps can access and revoke unnecessary permissions",
          tips: [
            "Many apps request far more permissions than they actually need",
            "Location tracking happens in the background even when apps aren't open",
            "Camera and microphone access could potentially be misused",
            "Contact access lets apps see all your friends' and family's information"
          ],
          steps: [
            "Go to Settings → Privacy (iOS) or Settings → Apps & notifications → App permissions (Android)",
            "Review location access: set to 'While Using App' instead of 'Always' where possible",
            "Check camera and microphone permissions - remove access for apps that don't need it",
            "Review contact access - social media and shopping apps usually don't need this",
            "Look at notification permissions and turn off for apps that spam you",
            "Remove permissions for apps you no longer use regularly"
          ]
        },
        controlDataCollection: {
          title: "Limit Data Collection and Tracking",
          description: "Reduce how much companies can track and profile your online activity",
          tips: [
            "Ad tracking builds profiles of your interests and behavior",
            "Web browsers track your activity across different websites",
            "Email tracking tells companies when and how often you read emails",
            "Smart devices often collect more data than you realize"
          ],
          steps: [
            "Turn on 'Ask App Not to Track' (iOS) or 'Opt out of Ads Personalization' (Android)",
            "In browser settings, enable 'Do Not Track' and third-party cookie blocking",
            "Turn off ad personalization in Google Account settings",
            "Disable Siri/Google Assistant voice recording and data sharing",
            "Review smart home device privacy settings (Alexa, Google Home, etc.)",
            "Use private/incognito browsing mode for sensitive searches"
          ]
        }
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
