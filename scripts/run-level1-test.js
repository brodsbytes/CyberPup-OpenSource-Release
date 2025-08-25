#!/usr/bin/env node

/**
 * Level 1 Flow Test Runner for CyberPup
 * This script tests the complete Level 1 cybersecurity check flow
 */

const { spawn } = require('child_process');
const puppeteer = require('puppeteer');

console.log('🚀 Starting Level 1 Flow Test Runner...');

// Configuration
const config = {
  expoServerPort: 8081,
  testTimeout: 30000,
  screenshotsDir: './e2e/screenshots',
  browserTimeout: 15000,
  // Mobile viewport configurations
  viewports: {
    iphone: { width: 375, height: 812 }, // iPhone 12/13/14
    android: { width: 360, height: 800 }, // Common Android size
    tablet: { width: 768, height: 1024 }, // iPad
    small: { width: 320, height: 568 }, // iPhone SE
  }
};

// Level 1 Test Flow
const level1TestFlow = [
  {
    name: 'App Launch',
    description: 'Launch app and verify welcome screen',
    steps: [
      { action: 'navigate', url: 'http://localhost:8081' },
      { action: 'wait', timeout: 5000 },
      { action: 'screenshot', name: '01-app-launch' },
      { action: 'verify', selector: 'body', shouldExist: true },
    ]
  },
  {
    name: 'Welcome Screen',
    description: 'Verify welcome screen elements',
    steps: [
      { action: 'wait', timeout: 3000 },
      { action: 'screenshot', name: '02-welcome-screen' },
      { action: 'find', selector: 'button', optional: true },
      { action: 'find', selector: 'a', optional: true },
      { action: 'find', selector: '[role="button"]', optional: true },
    ]
  },
  {
    name: 'Start Level 1',
    description: 'Navigate to Level 1 checks',
    steps: [
      { action: 'click', selector: 'button', optional: true },
      { action: 'wait', timeout: 3000 },
      { action: 'screenshot', name: '03-after-start' },
    ]
  },
  {
    name: 'Device Audit',
    description: 'Test device audit functionality',
    steps: [
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', name: '04-device-audit' },
      { action: 'find', selector: 'input', optional: true },
      { action: 'find', selector: 'select', optional: true },
    ]
  },
  {
    name: 'Level 1 Progress',
    description: 'Check Level 1 progress display',
    steps: [
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', name: '05-level1-progress' },
      { action: 'find', selector: '[data-testid]', optional: true },
      { action: 'find', selector: '.progress', optional: true },
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
async function runLevel1Tests(deviceType = 'iphone') {
  log(`Starting Level 1 test execution for ${deviceType}...`);
  
  let expoProcess = null;
  let browser = null;
  let page = null;
  
  try {
    // Start Expo development server
    log('Starting Expo development server...');
    expoProcess = spawn('npx', ['expo', 'start', '--web', '--port', config.expoServerPort.toString()], {
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    // Wait for server to start
    await delay(10000);
    
    // Launch browser
    log('Launching browser...');
    browser = await puppeteer.launch({ 
      headless: false, // Set to true for headless mode
      defaultViewport: config.viewports[deviceType] || config.viewports.iphone
    });
    
    page = await browser.newPage();
    
    // Set mobile viewport
    const viewport = config.viewports[deviceType] || config.viewports.iphone;
    await page.setViewport(viewport);
    
    // Set user agent to mobile
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1');
    
    // Enable console logging
    page.on('console', msg => log(`Browser: ${msg.text()}`, 'info'));
    
    log(`Using viewport: ${viewport.width}x${viewport.height} for ${deviceType}`);
    
    // Run Level 1 test flow
    for (const scenario of level1TestFlow) {
      log(`Running scenario: ${scenario.name}`);
      log(`Description: ${scenario.description}`);
      
      try {
        await runScenario(page, scenario, deviceType);
        log(`✅ Scenario passed: ${scenario.name}`, 'success');
      } catch (error) {
        log(`❌ Scenario failed: ${scenario.name} - ${error.message}`, 'error');
      }
      
      await delay(3000); // Wait between scenarios
    }
    
    log('🎉 Level 1 test flow completed!', 'success');
    
  } catch (error) {
    log(`Level 1 test runner failed: ${error.message}`, 'error');
    process.exit(1);
  } finally {
    // Cleanup
    if (page) {
      await page.close();
    }
    if (browser) {
      await browser.close();
    }
    if (expoProcess) {
      log('Stopping Expo development server...');
      expoProcess.kill();
    }
  }
}

async function runScenario(page, scenario, deviceType) {
  log(`Executing steps for: ${scenario.name}`);
  
  for (const step of scenario.steps) {
    try {
      await executeStep(page, step, deviceType);
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

async function executeStep(page, step, deviceType) {
  switch (step.action) {
    case 'navigate':
      log(`Navigating to: ${step.url}`);
      await page.goto(step.url, { waitUntil: 'networkidle0', timeout: config.browserTimeout });
      break;
      
    case 'wait':
      if (step.selector) {
        log(`Waiting for element: ${step.selector}`);
        await page.waitForSelector(step.selector, { timeout: step.timeout || config.browserTimeout });
      } else {
        log(`Waiting for ${step.timeout}ms`);
        await delay(step.timeout);
      }
      break;
      
    case 'screenshot':
      log(`Taking screenshot: ${step.name}`);
      await page.screenshot({ 
        path: `${config.screenshotsDir}/${deviceType}-${step.name}.png`,
        fullPage: true 
      });
      break;
      
    case 'verify':
      log(`Verifying: ${step.selector}`);
      if (step.shouldExist) {
        const element = await page.$(step.selector);
        if (!element) {
          throw new Error(`Element not found: ${step.selector}`);
        }
      }
      if (step.shouldContain) {
        const text = await page.$eval(step.selector, el => el.textContent);
        if (!text.includes(step.shouldContain)) {
          throw new Error(`Element does not contain "${step.shouldContain}": ${text}`);
        }
      }
      break;
      
    case 'click':
      log(`Clicking element: ${step.selector}`);
      await page.click(step.selector);
      break;
      
    case 'find':
      log(`Finding element: ${step.selector}`);
      const element = await page.$(step.selector);
      if (element) {
        log(`Found element: ${step.selector}`, 'success');
      } else if (!step.optional) {
        throw new Error(`Element not found: ${step.selector}`);
      }
      break;
      
    default:
      throw new Error(`Unknown action: ${step.action}`);
  }
}

// Main execution
if (require.main === module) {
  // Get device type from command line argument or default to iphone
  const deviceType = process.argv[2] || 'iphone';
  
  if (!config.viewports[deviceType]) {
    console.log(`❌ Unknown device type: ${deviceType}`);
    console.log(`Available device types: ${Object.keys(config.viewports).join(', ')}`);
    process.exit(1);
  }
  
  runLevel1Tests(deviceType).catch(error => {
    log(`Level 1 test runner failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { runLevel1Tests, level1TestFlow, config };
