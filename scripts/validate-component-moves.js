#!/usr/bin/env node

/**
 * Component Move Validation Script
 * 
 * This script helps validate that component moves are successful by:
 * 1. Checking that all import paths are correct
 * 2. Testing that the app bundles successfully
 * 3. Running basic E2E tests
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Component Move Validation Script');
console.log('====================================\n');

// Function to check if a file exists
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Function to check import paths in a file
function checkImportPaths(filePath, expectedPrefix) {
  if (!fileExists(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const importLines = content.match(/import.*from\s+['"]([^'"]+)['"]/g) || [];
  
  let hasIssues = false;
  
  importLines.forEach(line => {
    const match = line.match(/from\s+['"]([^'"]+)['"]/);
    if (match) {
      const importPath = match[1];
      
      // Check if it's a relative import that should be updated
      // Special case: imports from root components directory are OK
      if (importPath.startsWith('../') && !importPath.startsWith(expectedPrefix)) {
        // Allow imports from root components directory (../ComponentName)
        const isRootComponentImport = /^\.\.\/[A-Z][a-zA-Z]*\.js?$/.test(importPath) || 
                                    importPath === '../ProgressiveActionCard' ||
                                    importPath === '../WizardFlow' ||
                                    importPath === '../TimelineDashboard';
        if (!isRootComponentImport) {
          console.log(`⚠️  Potential import path issue in ${filePath}:`);
          console.log(`   ${line.trim()}`);
          console.log(`   Expected to start with: ${expectedPrefix}`);
          hasIssues = true;
        }
      }
    }
  });
  
  return !hasIssues;
}

// Function to test app bundling
function testAppBundling() {
  console.log('\n🧪 Testing app bundling...');
  
  try {
    // Kill any existing expo processes
    execSync('pkill -f "expo start" || true', { stdio: 'pipe' });
    
    // Start expo in background
    const expoProcess = execSync('npm start', { 
      stdio: 'pipe',
      timeout: 30000 // 30 second timeout
    });
    
    // Wait a bit for server to start
    execSync('sleep 10', { stdio: 'pipe' });
    
    // Test if server is responding
    const response = execSync('curl -s http://localhost:8081 | head -5', { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    if (response.includes('<!DOCTYPE html>')) {
      console.log('✅ App bundling successful');
      return true;
    } else {
      console.log('❌ App bundling failed');
      return false;
    }
    
  } catch (error) {
    console.log('❌ App bundling failed:', error.message);
    return false;
  }
}

// Function to run E2E tests
function runE2ETests() {
  console.log('\n🧪 Running E2E tests...');
  
  try {
    const result = execSync('npm run test:e2e:custom', { 
      stdio: 'pipe',
      encoding: 'utf8',
      timeout: 60000 // 60 second timeout
    });
    
    if (result.includes('✅ All tests completed!')) {
      console.log('✅ E2E tests passed');
      return true;
    } else {
      console.log('❌ E2E tests failed');
      return false;
    }
    
  } catch (error) {
    console.log('❌ E2E tests failed:', error.message);
    return false;
  }
}

// Main validation function
function validateComponentMoves() {
  console.log('📋 Checking moved components...\n');
  
  const movedComponents = [
    {
      file: 'components/ui/LoadingScreen.js',
      expectedPrefix: '../../'
    },
    {
      file: 'components/ui/CircularProgress.js',
      expectedPrefix: '../../'
    },
    {
      file: 'components/ui/Badge.js',
      expectedPrefix: '../../'
    },
    {
      file: 'components/ui/ProgressiveActionCard.js',
      expectedPrefix: '../../'
    },
    {
      file: 'components/gamification/BadgeEarnedModal.js',
      expectedPrefix: '../../'
    },
    {
      file: 'components/gamification/GamificationIcons.js',
      expectedPrefix: '../../'
    },
    {
      file: 'components/gamification/StickyGamificationBar.js',
      expectedPrefix: '../../'
    },
    {
      file: 'components/gamification/ScoreBreakdownModal.js',
      expectedPrefix: '../../'
    },
    {
      file: 'components/navigation/CatalogueModal.js',
      expectedPrefix: '../../'
    },
    {
      file: 'components/navigation/CategoryDetailModal.js',
      expectedPrefix: '../../'
    },
    {
      file: 'components/forms/CollapsibleDeviceSection.js',
      expectedPrefix: '../../'
    },
    {
      file: 'components/validation-steps/InteractiveChecklist.js',
      expectedPrefix: '../../'
    },
    {
      file: 'components/progress/FlowProgressSummary.js',
      expectedPrefix: '../../'
    },
    {
      file: 'components/validation-steps/InteractiveValidationFlow.js',
      expectedPrefix: '../../'
    },
    {
      file: 'components/navigation/BottomNavigation.js',
      expectedPrefix: '../../'
    },
    {
      file: 'components/navigation/HeaderWithProgress.js',
      expectedPrefix: '../../'
    },
    {
      file: 'components/gamification/CompletionPopup.js',
      expectedPrefix: '../../'
    },
    {
      file: 'components/ui/TimelineDashboard.js',
      expectedPrefix: '../../'
    },
    {
      file: 'components/validation-steps/WizardFlow.js',
      expectedPrefix: '../../'
    }
  ];
  
  let allImportPathsValid = true;
  
  movedComponents.forEach(component => {
    console.log(`🔍 Checking ${component.file}...`);
    const isValid = checkImportPaths(component.file, component.expectedPrefix);
    if (isValid) {
      console.log(`✅ ${component.file} - Import paths OK\n`);
    } else {
      console.log(`❌ ${component.file} - Import path issues found\n`);
      allImportPathsValid = false;
    }
  });
  
  if (!allImportPathsValid) {
    console.log('❌ Import path validation failed. Please fix the issues above.');
    return false;
  }
  
  console.log('✅ All import paths validated successfully!\n');
  
  // Test app bundling
  const bundlingSuccess = testAppBundling();
  
  if (!bundlingSuccess) {
    console.log('❌ App bundling failed. Please check for import path issues.');
    return false;
  }
  
  // Run E2E tests
  const e2eSuccess = runE2ETests();
  
  if (!e2eSuccess) {
    console.log('❌ E2E tests failed. Please check for functionality issues.');
    return false;
  }
  
  console.log('\n🎉 All validations passed! Component moves are successful.');
  return true;
}

// Run validation
if (require.main === module) {
  validateComponentMoves();
}

module.exports = { validateComponentMoves };
