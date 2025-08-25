#!/usr/bin/env node

/**
 * Interactive E2E Test Runner for CyberPup
 * This script runs tests against the Expo development server in browser mode
 */

const { spawn } = require('child_process');
const puppeteer = require('puppeteer');

console.log('🚀 Starting Interactive CyberPup E2E Test Runner...');

// Configuration
const config = {
  expoServerPort: 8081,
  testTimeout: 30000,
  screenshotsDir: './e2e/screenshots',
  browserTimeout: 10000,
  // Mobile viewport configurations
  viewports: {
    iphone: { width: 375, height: 812 }, // iPhone 12/13/14
    android: { width: 360, height: 800 }, // Common Android size
    tablet: { width: 768, height: 1024 }, // iPad
    small: { width: 320, height: 568 }, // iPhone SE
  }
};

// Test scenarios for Level 1 flow
const level1TestScenarios = [
  {
    name: 'App Launch Test',
    description: 'Verify app launches and shows welcome screen',
    steps: [
      { action: 'navigate', url: 'http://localhost:8081' },
      { action: 'wait', selector: 'h1', timeout: 5000 },
      { action: 'screenshot', name: 'app-launch' },
      { action: 'verify', selector: 'h1', shouldContain: 'CyberPup' },
    ]
  },
  {
    name: 'Welcome Screen Test',
    description: 'Test welcome screen elements',
    steps: [
      { action: 'wait', selector: 'button', timeout: 3000 },
      { action: 'screenshot', name: 'welcome-screen' },
      { action: 'verify', selector: 'button', shouldExist: true },
    ]
  },
  {
    name: 'Navigation Test',
    description: 'Test basic navigation',
    steps: [
      { action: 'click', selector: 'button:contains("Get Started")', optional: true },
      { action: 'wait', timeout: 2000 },
      { action: 'screenshot', name: 'after-get-started' },
    ]
  },
  {
    name: 'Device Audit Test',
    description: 'Test device audit functionality',
    steps: [
      { action: 'wait', selector: 'h2', timeout: 3000, optional: true },
      { action: 'screenshot', name: 'device-audit-screen' },
      { action: 'verify', selector: 'h2', shouldContain: 'Device', optional: true },
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
async function runInteractiveTests(deviceType = 'iphone') {
  log(`Starting interactive test execution for ${deviceType}...`);
  
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
    await delay(8000);
    
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
    
    log(`Using viewport: ${viewport.width}x${viewport.height} for ${deviceType}`);
    
    // Run test scenarios
    for (const scenario of level1TestScenarios) {
      log(`Running scenario: ${scenario.name}`);
      log(`Description: ${scenario.description}`);
      
      try {
        await runScenario(page, scenario, deviceType);
        log(`✅ Scenario passed: ${scenario.name}`, 'success');
      } catch (error) {
        log(`❌ Scenario failed: ${scenario.name} - ${error.message}`, 'error');
      }
      
      await delay(2000); // Wait between scenarios
    }
    
    log('🎉 All interactive tests completed!', 'success');
    
  } catch (error) {
    log(`Interactive test runner failed: ${error.message}`, 'error');
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
      if (step.selector.includes(':contains(')) {
        // Handle text-based selectors
        const text = step.selector.match(/:contains\("([^"]+)"\)/)[1];
        await page.click(`text=${text}`);
      } else {
        await page.click(step.selector);
      }
      break;
      
    case 'find':
      log(`Finding element: ${step.selector}`);
      const element = await page.$(step.selector);
      if (!element && !step.optional) {
        throw new Error(`Element not found: ${step.selector}`);
      }
      break;
      
    default:
      throw new Error(`Unknown action: ${step.action}`);
  }
}

// Main execution
if (require.main === module) {
  // Check if puppeteer is installed
  try {
    require('puppeteer');
  } catch (error) {
    console.log('❌ Puppeteer not found. Installing...');
    const { execSync } = require('child_process');
    execSync('npm install --save-dev puppeteer', { stdio: 'inherit' });
  }
  
  // Get device type from command line argument or default to iphone
  const deviceType = process.argv[2] || 'iphone';
  
  if (!config.viewports[deviceType]) {
    console.log(`❌ Unknown device type: ${deviceType}`);
    console.log(`Available device types: ${Object.keys(config.viewports).join(', ')}`);
    process.exit(1);
  }
  
  runInteractiveTests(deviceType).catch(error => {
    log(`Interactive test runner failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { runInteractiveTests, level1TestScenarios, config };
