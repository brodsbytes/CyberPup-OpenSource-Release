import { Colors } from '../theme';

// Course Data Structure
// This file contains all course content in a structured format
// Easy to maintain and update

export const levels = [
  {
    id: 1,
    title: 'Level 1 - Beginner',
    subtitle: 'Cyber Pup Scout 🐾',
    description: 'Establish a strong baseline of cyber hygiene in the least time possible.',
    headerMessage: 'Start your cyber security journey with essential protections',
    whyItMatters: 'Building strong cyber security habits starts with the fundamentals. These basic protections will defend you against the most common threats and create a solid foundation for more advanced security practices.',
    whatYoullLearn: 'You\'ll learn password security, device protection, data backup, scam awareness, and privacy management to earn your Cyber Pup Scout badge.',
    icon: '🐾',
    color: Colors.accent,
    areas: [
    {
      id: '1-1',
        title: 'Password Security & Authentication',
        description: 'Master password security and protect your accounts with multi-factor authentication.',
        checks: [
          {
            id: '1-1-1',
            title: 'Creating Strong Passwords & Passphrases',
            description: 'Learn to create secure, memorable passwords that protect your accounts.',
      duration: '8 min',
            tasks: 4,
          },
          {
            id: '1-1-2',
            title: 'Prioritising High-Value Accounts',
            description: 'Secure your most important accounts first - banking and email.',
            duration: '6 min',
            tasks: 2,
          },
          {
            id: '1-1-3',
            title: 'Using a Password Manager',
            description: 'Simplify your security with a password manager.',
      duration: '10 min',
            tasks: 3,
          },
          {
            id: '1-1-4',
            title: 'Setting Up MFA (2FA)',
            description: 'Add an extra layer of protection to your accounts.',
      duration: '8 min',
            tasks: 3,
          },
          {
            id: '1-1-5',
            title: 'Checking if My Data Was Breached',
            description: 'Find out if your information has been compromised.',
            duration: '5 min',
            tasks: 2,
          }
        ],
        badge: 'Password Pro'
      },
      {
        id: '1-2',
        title: 'Device & Network Security',
        description: 'Protect your devices and secure your digital environment.',
        checks: [
    {
      id: '1-2-1',
            title: 'Screen Lock & Auto-Lock',
            description: 'Secure your device with proper lock settings.',
            duration: '5 min',
            tasks: 2,
    },
    {
      id: '1-2-2',
            title: 'Enable Remote Lock & Wipe',
            description: 'Protect your data if your device is lost or stolen.',
            duration: '6 min',
            tasks: 2,
    },
    {
      id: '1-2-3',
            title: 'Updating Devices & Apps',
            description: 'Keep your devices secure with regular updates.',
            duration: '5 min',
            tasks: 2,
    },
    {
      id: '1-2-4',
            title: 'Bluetooth & Auto-Wi-Fi',
            description: 'Manage wireless connections safely.',
            duration: '4 min',
            tasks: 2,
    },
    {
      id: '1-2-5',
            title: 'Avoid Public Charging Stations',
            description: 'Protect your device from juice jacking attacks.',
            duration: '3 min',
            tasks: 1,
          }
        ],
        badge: 'Device Defender'
      },
      {
        id: '1-3',
        title: 'Data Protection & Backups',
        description: 'Keep your data safe with proper backup strategies.',
        checks: [
    {
      id: '1-3-1',
            title: 'Setting Up Cloud Backup',
            description: 'Automatically backup your important data to the cloud.',
            duration: '8 min',
            tasks: 2,
    },
    {
      id: '1-3-2',
            title: 'Local Backup Option',
            description: 'Create local backups for additional protection.',
            duration: '6 min',
            tasks: 2,
          }
        ],
        badge: 'Data Guardian'
      },
      {
        id: '1-4',
        title: 'Phishing & Scam Awareness',
        description: 'Learn to identify and avoid common scams and phishing attempts.',
        checks: [
    {
      id: '1-4-1',
            title: 'Recognising Scam Tactics',
            description: 'Learn the red flags that indicate a scam.',
            duration: '8 min',
            tasks: 2,
    },
    {
      id: '1-4-2',
            title: 'Reporting Scams',
            description: 'Know how to report scams to help protect others.',
            duration: '5 min',
            tasks: 2,
          }
        ],
        badge: 'Scam Spotter'
      },
      {
        id: '1-5',
        title: 'Online Privacy & Social Media',
        description: 'Protect your privacy and manage your digital footprint.',
        checks: [
          {
            id: '1-5-1',
            title: 'Think Before You Share',
            description: 'Be mindful of what you share online.',
            duration: '6 min',
            tasks: 2,
          },
          {
            id: '1-5-2',
            title: 'Privacy Settings Review',
            description: 'Configure your social media privacy settings.',
            duration: '8 min',
            tasks: 2,
          }
        ],
        badge: 'Privacy Guardian'
      }
    ]
  },
  {
    id: 2,
    title: 'Level 2 - Intermediate',
    subtitle: 'Cyber Pup Guardian 🛡️',
    description: 'Advanced security practices for comprehensive protection.',
    headerMessage: 'Build advanced cyber security skills and knowledge',
    whyItMatters: 'Intermediate security practices help you protect against more sophisticated threats and secure your digital life more comprehensively.',
    whatYoullLearn: 'You\'ll learn advanced security techniques, network protection, privacy tools, and threat detection to earn your Cyber Pup Guardian badge.',
    icon: '🛡️',
    color: '#27ae60',
    areas: []
  },
  {
    id: 3,
    title: 'Level 3 - Advanced',
    subtitle: 'Cyber Pup Master 🎯',
    description: 'Expert-level cyber security health check and monitoring.',
    headerMessage: 'Master advanced cyber security and become a security expert',
    whyItMatters: 'Advanced security practices help you protect against sophisticated threats and secure your entire digital ecosystem.',
    whatYoullLearn: 'You\'ll learn expert security techniques, threat hunting, advanced privacy, and security monitoring to earn your Cyber Pup Master badge.',
    icon: '🎯',
    color: '#e74c3c',
    areas: []
  }
];

// Legacy support - keeping old structure for smooth transition
// TODO: Remove this after all components are updated
export const categories = levels;

export const getLevelById = (id) => {
  return levels.find(level => level.id === id);
};

export const getAreasByLevel = (levelId) => {
  const level = getLevelById(levelId);
  return level ? level.areas : [];
};

export const getChecksByArea = (areaId) => {
  for (const level of levels) {
    for (const area of level.areas) {
      if (area.id === areaId) {
        return area.checks;
      }
    }
  }
  return [];
};

export const getAllChecks = () => {
  const allChecks = [];
  levels.forEach(level => {
    level.areas.forEach(area => {
      area.checks.forEach(check => {
        allChecks.push({
          ...check,
          levelId: level.id,
          levelTitle: level.title,
          areaId: area.id,
          areaTitle: area.title,
          areaBadge: area.badge,
          levelIcon: level.icon,
          levelColor: level.color
        });
      });
    });
  });
  return allChecks;
};

// Legacy functions for backward compatibility
// TODO: Remove these after all components are updated
export const getCategoryById = getLevelById;
export const getModulesByCategory = getAreasByLevel;
export const getLessonsByModule = getChecksByArea;
export const getAllModules = getAllChecks;
export const getAllLessons = getAllChecks;

export const searchContent = (query) => {
  const results = [];
  const searchTerm = query.toLowerCase();
  
  levels.forEach(level => {
    level.areas.forEach(area => {
      area.checks.forEach(check => {
        if (
          check.title.toLowerCase().includes(searchTerm) ||
          check.description.toLowerCase().includes(searchTerm) ||
          area.title.toLowerCase().includes(searchTerm) ||
          level.title.toLowerCase().includes(searchTerm)
        ) {
          results.push({
            id: check.id,
            title: check.title,
            categoryId: level.id,
            categoryName: level.title,
            categoryIcon: level.icon,
            categoryColor: level.color,
            type: 'check'
          });
        }
      });
    });
  });
  
  return results;
}; 