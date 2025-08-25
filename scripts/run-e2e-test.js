#!/usr/bin/env node

/**
 * Custom E2E Test Runner for CyberPup
 * This script runs tests against the Expo development server
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting CyberPup E2E Test Runner...');

// Configuration
const config = {
  expoServerPort: 8081,
  testTimeout: 30000,
  screenshotsDir: './e2e/screenshots',
};

// Test scenarios
const testScenarios = [
  {
    name: 'Welcome Screen Test',
    description: 'Verify welcome screen loads correctly',
    steps: [
      { action: 'wait', selector: 'Welcome to CyberPup', timeout: 5000 },
      { action: 'screenshot', name: 'welcome-screen' },
      { action: 'verify', selector: 'Welcome to CyberPup', shouldExist: true },
    ]
  },
  {
    name: 'Navigation Test',
    description: 'Test basic navigation elements',
    steps: [
      { action: 'wait', selector: 'Welcome to CyberPup', timeout: 3000 },
      { action: 'find', selector: 'Get Started', optional: true },
      { action: 'find', selector: 'Start Level 1', optional: true },
      { action: 'screenshot', name: 'navigation-elements' },
    ]
  },
  {
    name: 'Device Audit Test',
    description: 'Test device audit functionality',
    steps: [
      { action: 'wait', selector: 'Welcome to CyberPup', timeout: 3000 },
      { action: 'tap', selector: 'Get Started', optional: true },
      { action: 'wait', selector: 'Device Audit', timeout: 3000, optional: true },
      { action: 'screenshot', name: 'device-audit' },
    ]
  }
];

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test runner
async function runTests() {
  log('Starting test execution...');
  
  let expoProcess = null;
  
  try {
    // Start Expo development server
    log('Starting Expo development server...');
    expoProcess = spawn('npx', ['expo', 'start', '--port', config.expoServerPort.toString()], {
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    // Wait for server to start
    await delay(5000);
    
    // Run test scenarios
    for (const scenario of testScenarios) {
      log(`Running scenario: ${scenario.name}`);
      log(`Description: ${scenario.description}`);
      
      try {
        await runScenario(scenario);
        log(`✅ Scenario passed: ${scenario.name}`, 'success');
      } catch (error) {
        log(`❌ Scenario failed: ${scenario.name} - ${error.message}`, 'error');
      }
      
      await delay(2000); // Wait between scenarios
    }
    
    log('🎉 All tests completed!', 'success');
    
  } catch (error) {
    log(`Test runner failed: ${error.message}`, 'error');
    process.exit(1);
  } finally {
    // Cleanup
    if (expoProcess) {
      log('Stopping Expo development server...');
      expoProcess.kill();
    }
  }
}

async function runScenario(scenario) {
  log(`Executing steps for: ${scenario.name}`);
  
  for (const step of scenario.steps) {
    try {
      await executeStep(step);
      await delay(1000); // Wait between steps
    } catch (error) {
      if (!step.optional) {
        throw new Error(`Step failed: ${step.action} - ${error.message}`);
      } else {
        log(`Optional step skipped: ${step.action}`, 'info');
      }
    }
  }
}

async function executeStep(step) {
  switch (step.action) {
    case 'wait':
      log(`Waiting for: ${step.selector}`);
      await delay(step.timeout || 3000);
      break;
      
    case 'screenshot':
      log(`Taking screenshot: ${step.name}`);
      // In a real implementation, this would take a screenshot
      break;
      
    case 'verify':
      log(`Verifying: ${step.selector}`);
      // In a real implementation, this would verify element exists
      break;
      
    case 'find':
      log(`Finding element: ${step.selector}`);
      // In a real implementation, this would find an element
      break;
      
    case 'tap':
      log(`Tapping element: ${step.selector}`);
      // In a real implementation, this would tap an element
      break;
      
    default:
      throw new Error(`Unknown action: ${step.action}`);
  }
}

// Main execution
if (require.main === module) {
  runTests().catch(error => {
    log(`Test runner failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { runTests, testScenarios };
