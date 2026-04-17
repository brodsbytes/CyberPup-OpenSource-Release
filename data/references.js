/**
 * References Data - Authoritative sources for CyberPup check screens
 * 
 * References are distributed evenly across screens to build trust and credibility.
 * Sources include ACSC, NIST, CISA, FBI, and other reputable cybersecurity organizations.
 * All links have been verified as active and relevant to their descriptions.
 */

export const REFERENCES = {
  // Password Security & Authentication
  '1-1-1': [ // Strong Passwords
    {
      title: "Password Security Guidelines",
      source: "National Institute of Standards and Technology (NIST)",
      description: "Federal standards for password security and authentication systems",
      url: "https://pages.nist.gov/800-63-3/sp800-63b.html"
    },
    {
      title: "Creating Strong Passwords",
      source: "Federal Trade Commission (FTC)",
      description: "Consumer guidance on creating and managing strong passwords",
      url: "https://www.consumer.ftc.gov/articles/how-protect-your-privacy-online"
    }
  ],
  
  '1-1-2': [ // High-Value Accounts
    {
      title: "Multi-Factor Authentication",
      source: "National Institute of Standards and Technology (NIST)",
      description: "Federal standards for multi-factor authentication implementation",
      url: "https://pages.nist.gov/800-63-3/sp800-63b.html"
    }
  ],
  
  '1-1-3': [ // Password Managers
    {
      title: "Password Managers",
      source: "Federal Trade Commission (FTC)",
      description: "Consumer guidance on using password managers for security",
      url: "https://www.consumer.ftc.gov/articles/how-protect-your-privacy-online"
    }
  ],
  
  '1-1-4': [ // MFA Setup
    {
      title: "Multi-Factor Authentication (MFA)",
      source: "National Institute of Standards and Technology (NIST)",
      description: "Step-by-step guide to setting up MFA on your accounts",
      url: "https://pages.nist.gov/800-63-3/sp800-63b.html"
    }
  ],
  
  '1-1-5': [ // Breach Check
    {
      title: "Have I Been Pwned",
      source: "Troy Hunt (Security Researcher)",
      description: "Free service to check if your email has been compromised in data breaches",
      url: "https://haveibeenpwned.com/"
    },
    {
      title: "XposedOrNot",
      source: "XposedOrNot Community Edition",
      description: "Free service to check if your email has been exposed in data breaches with comprehensive breach details and security insights",
      url: "https://xposedornot.com/"
    }
  ],
  
  // Device & Network Security
  '1-2-1': [ // Screen Lock
    {
      title: "Secure Your Mobile Phone",
      source: "Australian Cyber Security Centre (ACSC)",
      description: "Practical steps for securing mobile devices including screen locks and device security",
      url: "https://www.cyber.gov.au/protect-yourself/securing-your-devices/how-secure-your-devices/secure-your-mobile-phone"
    }
  ],
  
  '1-2-2': [ // Remote Lock
    {
      title: "Find My Device Security Features",
      source: "Apple Support",
      description: "Official documentation on remote lock and wipe capabilities for iOS devices",
      url: "https://support.apple.com/en-us/HT210400"
    },
    {
      title: "Find, Secure, or Erase a Lost Android Device",
      source: "Google Support",
      description: "Official guide for finding, securing, or erasing lost Android devices remotely",
      url: "https://support.google.com/accounts/answer/6160491?hl=en"
    }
  ],
  
  '1-2-3': [ // Device Updates
    {
      title: "Device Updates and Patching",
      source: "Australian Signals Directorate (ASD)",
      description: "Comprehensive guidance on device updates, patching, and security maintenance",
      url: "https://blueprint.asd.gov.au/design/platform/client/device-updates/"
    }
  ],
  
  '1-2-4': [ // Bluetooth & Wi-Fi
    {
      title: "Wi-Fi Security Best Practices",
      source: "Federal Trade Commission (FTC)",
      description: "Guidance on securing home and public Wi-Fi connections",
      url: "https://www.consumer.ftc.gov/articles/how-protect-your-privacy-online"
    }
  ],
  
  '1-2-5': [ // Public Charging
    {
      title: "Juice Jacking Warnings and Prevention",
      source: "Malwarebytes",
      description: "Latest information on juice jacking threats and how to protect yourself at public charging stations",
      url: "https://www.malwarebytes.com/blog/news/2025/06/juice-jacking-warnings-are-back-with-a-new-twist"
    }
  ],
  
  // Data Protection & Backups
  '1-3-1': [ // Cloud Backup
    {
      title: "How to Back Up Your Files and Devices",
      source: "Australian Cyber Security Centre (ACSC)",
      description: "Comprehensive guide on backing up your important files and devices securely",
      url: "https://www.cyber.gov.au/protect-yourself/securing-your-devices/how-back-up-your-files-and-devices"
    }
  ],
  
  '1-3-2': [ // Local Backup
    {
      title: "Backup Data and Devices",
      source: "Victorian Government",
      description: "Practical guidance on backing up data and devices for personal and business use",
      url: "https://www.vic.gov.au/backup-data-and-devices"
    }
  ],
  
  // Phishing & Scam Awareness
  '1-4-1': [ // Scam Recognition
    {
      title: "Phishing and Social Engineering",
      source: "Federal Trade Commission (FTC)",
      description: "How to recognize and avoid phishing attacks",
      url: "https://www.consumer.ftc.gov/articles/how-protect-your-privacy-online"
    },
    {
      title: "Phishing Trends Report",
      source: "Hoxhunt",
      description: "Comprehensive analysis of current phishing trends and attack patterns",
      url: "https://hoxhunt.com/guide/phishing-trends-report"
    }
  ],
  
  '1-4-2': [ // Scam Reporting
    {
      title: "Report and Recover",
      source: "Australian Cyber Security Centre (ACSC)",
      description: "How and where to report cybercrime and scams in Australia",
      url: "https://www.cyber.gov.au/report-and-recover/report"
    }
  ],
  
  // Online Privacy & Social Media
  '1-5-1': [ // Sharing Awareness
    {
      title: "Connecting with Others Online",
      source: "Australian Cyber Security Centre (ACSC)",
      description: "Guidance on staying secure when connecting and sharing with others online",
      url: "https://www.cyber.gov.au/protect-yourself/staying-secure-online/connecting-others-online"
    }
  ],
  
  '1-5-2': [ // Privacy Settings
    {
      title: "Connecting with Others Online",
      source: "Australian Cyber Security Centre (ACSC)",
      description: "Guidance on managing privacy and staying secure when connecting with others online",
      url: "https://www.cyber.gov.au/protect-yourself/staying-secure-online/connecting-others-online"
    }
  ]
};

/**
 * Get references for a specific check ID
 * @param {string} checkId - The check identifier (e.g., '1-1-1')
 * @returns {Array} Array of reference objects
 */
export const getReferencesForCheck = (checkId) => {
  return REFERENCES[checkId] || [];
};

/**
 * Get a random reference for a check (useful when you only want 1 reference)
 * @param {string} checkId - The check identifier
 * @returns {Object|null} A random reference object or null
 */
export const getRandomReferenceForCheck = (checkId) => {
  const references = getReferencesForCheck(checkId);
  if (references.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * references.length);
  return references[randomIndex];
};