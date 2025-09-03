import { Colors } from '../theme';

// Course Data Structure
// This file contains all course content in a structured format
// Easy to maintain and update

export const levels = [
  {
    id: 1,
    title: 'Level 1 - CyberPup Scout 🐾',
    subtitle: 'CyberPup Scout 🐾',
    description: 'Establish a strong baseline of cyber hygiene in the least time possible.',
    headerMessage: 'Start your cyber security journey with essential protections',
    whyItMatters: 'Building strong cyber security habits starts with the fundamentals. These basic protections will defend you against the most common threats and create a solid foundation for more advanced security practices.',
    whatYoullLearn: 'You\'ll learn password security, device protection, data backup, scam awareness, and privacy management to earn your CyberPup Scout badge.',
    icon: '🐾',
    color: Colors.accent,
    areas: [
      {
        id: '1-0',
        title: 'Welcome to CyberPup',
        description: 'Get started with your cybersecurity journey and understand how CyberPup works.',
        checks: [
          {
            id: '1-0-1',
            title: 'CyberPup Introduction',
            description: 'Learn about CyberPup and how it will help protect your digital life.',
            duration: '5 min',
            tasks: 1,
          }
        ],
        badge: 'CyberPup Scout'
      },
      {
        id: '1-1',
        title: 'Protect Your Accounts',
        description: 'Master password security and protect your accounts with multi-factor authentication.',
        checks: [
          {
            id: '1-1-1',
            title: 'Create Strong Passwords',
            description: 'Learn to create secure, memorable passwords that protect your accounts.',
      duration: '8 min',
            tasks: 4,
          },
          {
            id: '1-1-2',
            title: 'Secure Your Most Important Accounts',
            description: 'Secure your most important accounts first - banking and email.',
            duration: '6 min',
            tasks: 2,
          },
          {
            id: '1-1-3',
            title: 'Set Up a Password Manager',
            description: 'Simplify your security with a password manager.',
      duration: '10 min',
            tasks: 3,
          },
          {
            id: '1-1-4',
            title: 'Add Extra Protection to Your Accounts',
            description: 'Add an extra layer of protection to your accounts.',
      duration: '8 min',
            tasks: 3,
          },
          {
            id: '1-1-5',
            title: 'Check if Your Data Was Compromised',
            description: 'Find out if your information has been compromised.',
            duration: '5 min',
            tasks: 2,
          }
        ],
        badge: 'Password Pro'
      },
      {
        id: '1-2',
        title: 'Secure Your Devices',
        description: 'Protect your devices and secure your digital environment.',
        checks: [
    {
      id: '1-2-1',
            title: 'Lock Your Device Automatically',
            description: 'Secure your device with proper lock settings.',
            duration: '5 min',
            tasks: 2,
    },
    {
      id: '1-2-2',
            title: 'Protect Your Device if Lost',
            description: 'Protect your data if your device is lost or stolen.',
            duration: '6 min',
            tasks: 2,
    },
    {
      id: '1-2-3',
            title: 'Keep Your Device Updated',
            description: 'Keep your devices secure with regular updates.',
            duration: '5 min',
            tasks: 2,
    },
    {
      id: '1-2-4',
            title: 'Manage Your Wireless Connections',
            description: 'Manage wireless connections safely.',
            duration: '4 min',
            tasks: 2,
    },
    {
      id: '1-2-5',
            title: 'Stay Safe When Charging',
            description: 'Protect your device from juice jacking attacks.',
            duration: '3 min',
            tasks: 1,
          }
        ],
        badge: 'Device Defender'
      },
      {
        id: '1-3',
        title: 'Keep Your Data Safe',
        description: 'Keep your data safe with proper backup strategies.',
        checks: [
    {
      id: '1-3-1',
            title: 'Back Up Your Data to the Cloud',
            description: 'Automatically backup your important data to the cloud.',
            duration: '8 min',
            tasks: 2,
    },
    {
      id: '1-3-2',
            title: 'Create Local Backups',
            description: 'Create local backups for additional protection.',
            duration: '6 min',
            tasks: 2,
          }
        ],
        badge: 'Data Guardian'
      },
      {
        id: '1-4',
        title: 'Avoid Scams & Fraud',
        description: 'Learn to identify and avoid common scams and phishing attempts.',
        checks: [
    {
      id: '1-4-1',
            title: 'Spot Scams Before They Happen',
            description: 'Learn the red flags that indicate a scam.',
            duration: '8 min',
            tasks: 2,
    },
    {
      id: '1-4-2',
            title: 'Report Scams to Help Others',
            description: 'Know how to report scams to help protect others.',
            duration: '5 min',
            tasks: 2,
          }
        ],
        badge: 'Scam Spotter'
      },
      {
        id: '1-5',
        title: 'Protect Your Privacy',
        description: 'Protect your privacy and manage your digital footprint.',
        checks: [
          {
            id: '1-5-1',
            title: 'Be Smart About What You Share',
            description: 'Be mindful of what you share online.',
            duration: '6 min',
            tasks: 2,
          },
          {
            id: '1-5-2',
            title: 'Control Who Sees Your Information',
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
    title: 'Level 2 - CyberPup Watchdog 👁️',
    subtitle: 'CyberPup Watchdog 👁️',
    description: 'Advanced security practices for comprehensive protection. (COMING SOON)',
    headerMessage: 'Build advanced cyber security skills and knowledge',
    whyItMatters: 'Intermediate security practices help you protect against more sophisticated threats and secure your digital life more comprehensively.',
    whatYoullLearn: 'You\'ll learn advanced security techniques, network protection, privacy tools, and threat detection to earn your CyberPup Watchdog badge.',
    icon: '👁️',
    color: '#27ae60',
    areas: [
      {
        id: '2-1',
        title: 'Advanced Security',
        description: 'Coming soon with advanced security practices.',
        checks: [
          {
            id: '2-1-1',
            title: 'Coming Soon!',
            description: 'Advanced security content is being developed.',
            duration: 'TBD',
            tasks: 0,
          }
        ],
        badge: 'Advanced Security'
      }
    ]
  },
  {
    id: 3,
    title: 'Level 3 - CyberPup Guardian 🛡️',
    subtitle: 'CyberPup Guardian 🛡️',
    description: 'Expert-level cyber security health check and monitoring. (COMING SOON)',
    headerMessage: 'Master advanced cyber security and become a security expert',
    whyItMatters: 'Advanced security practices help you protect against sophisticated threats and secure your entire digital ecosystem.',
    whatYoullLearn: 'You\'ll learn expert security techniques, threat hunting, advanced privacy, and security monitoring to earn your CyberPup Guardian badge.',
    icon: '🛡️',
    color: '#e74c3c',
    areas: [
      {
        id: '3-1',
        title: 'Expert Security',
        description: 'Coming soon with expert-level security practices.',
        checks: [
          {
            id: '3-1-1',
            title: 'Coming Soon!',
            description: 'Expert security content is being developed.',
            duration: 'TBD',
            tasks: 0,
          }
        ],
        badge: 'Expert Security'
      }
    ]
  }
];

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