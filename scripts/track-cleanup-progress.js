#!/usr/bin/env node

/**
 * CyberPup Codebase Cleanup Progress Tracker
 * 
 * This script helps track progress on the codebase cleanup implementation plan.
 * It reads the implementation plan document and provides status updates.
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log('\n' + '='.repeat(60));
  log(message, 'bright');
  console.log('='.repeat(60));
}

function logSection(message) {
  console.log('\n' + '-'.repeat(40));
  log(message, 'cyan');
  console.log('-'.repeat(40));
}

function logTask(task, status) {
  const statusIcon = status === 'COMPLETED' ? '✅' : status === 'IN_PROGRESS' ? '🔄' : '⏳';
  const statusColor = status === 'COMPLETED' ? 'green' : status === 'IN_PROGRESS' ? 'yellow' : 'red';
  
  log(`${statusIcon} ${task}`, statusColor);
}

function calculateProgress(phase) {
  const tasks = phase.tasks || [];
  const completed = tasks.filter(task => task.status === 'COMPLETED').length;
  const total = tasks.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { completed, total, percentage };
}

function displayPhaseProgress(phaseName, phase) {
  logSection(`Phase ${phaseName}: ${phase.title}`);
  
  const progress = calculateProgress(phase);
  log(`Progress: ${progress.completed}/${progress.total} tasks completed (${progress.percentage}%)`, 'bright');
  
  if (phase.tasks) {
    phase.tasks.forEach(task => {
      logTask(task.name, task.status);
      if (task.notes) {
        log(`   ${task.notes}`, 'blue');
      }
    });
  }
  
  if (phase.notes) {
    log(`\nNotes: ${phase.notes}`, 'yellow');
  }
}

function displayOverallProgress(phases) {
  logHeader('CyberPup Codebase Cleanup - Overall Progress');
  
  let totalTasks = 0;
  let totalCompleted = 0;
  
  phases.forEach((phase, index) => {
    const progress = calculateProgress(phase);
    totalTasks += progress.total;
    totalCompleted += progress.completed;
    
    displayPhaseProgress(index + 1, phase);
  });
  
  const overallPercentage = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
  
  logSection('Overall Summary');
  log(`Total Tasks: ${totalTasks}`, 'bright');
  log(`Completed: ${totalCompleted}`, 'green');
  log(`Remaining: ${totalTasks - totalCompleted}`, 'yellow');
  log(`Overall Progress: ${overallPercentage}%`, 'bright');
  
  if (overallPercentage === 100) {
    log('\n🎉 All cleanup tasks completed!', 'green');
  } else if (overallPercentage >= 75) {
    log('\n🚀 Great progress! Almost there!', 'yellow');
  } else if (overallPercentage >= 50) {
    log('\n📈 Good progress! Keep going!', 'yellow');
  } else {
    log('\n💪 Let\'s get started!', 'blue');
  }
}

function displayNextSteps(phases) {
  logSection('Next Steps');
  
  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    const progress = calculateProgress(phase);
    
    if (progress.percentage < 100) {
      log(`Phase ${i + 1}: ${phase.title}`, 'bright');
      
      const pendingTasks = phase.tasks?.filter(task => task.status !== 'COMPLETED') || [];
      if (pendingTasks.length > 0) {
        log('Pending tasks:', 'yellow');
        pendingTasks.slice(0, 3).forEach(task => {
          log(`  • ${task.name}`, 'red');
        });
        if (pendingTasks.length > 3) {
          log(`  ... and ${pendingTasks.length - 3} more`, 'blue');
        }
      }
      
      break; // Only show next incomplete phase
    }
  }
}

function displayQuickCommands() {
  logSection('Quick Commands');
  log('To update task status, edit the implementation plan file:', 'blue');
  log('  docs/active/development/CODEBASE_CLEANUP_IMPLEMENTATION_PLAN.md', 'cyan');
  
  log('\nCommon cleanup commands:', 'blue');
  log('  npm run cleanup          # Clean up dev servers', 'cyan');
  log('  npm run test:e2e         # Run E2E tests', 'cyan');
  log('  npm run test:e2e:level1  # Run Level 1 tests', 'cyan');
}

function main() {
  try {
    logHeader('CyberPup Codebase Cleanup Progress Tracker');
    
    // Define phases based on the implementation plan
    const phases = [
      {
        title: 'Safe Cleanup (Week 1) - LOW RISK',
        tasks: [
          { name: 'Remove Legacy Functions', status: 'COMPLETED', notes: 'data/courseData.js lines 246-294' },
          { name: 'Remove TODO Comments', status: 'COMPLETED', notes: 'screens/WelcomeScreen.js line 312' },
          { name: 'Clean WelcomeScreen Imports', status: 'COMPLETED', notes: 'Remove unused useRef import' },
          { name: 'Audit Lesson Screen Imports', status: 'COMPLETED', notes: 'Check all lesson screens' },
          { name: 'Remove Commented Code', status: 'COMPLETED', notes: 'Various screens and components' },
          { name: 'Fix Starter Test', status: 'COMPLETED', notes: 'e2e/starter.test.js' },
          { name: 'Fix Device Audit Test', status: 'COMPLETED', notes: 'e2e/tests/device-audit.test.js' }
        ]
      },
      {
        title: 'Documentation Reorganization (Week 2) - LOW RISK',
        tasks: [
          { name: 'Create New Docs Structure', status: 'COMPLETED', notes: 'Restructure /docs folder' },
          { name: 'Move Completed Docs', status: 'COMPLETED', notes: 'Archive completed implementation plans' },
          { name: 'Update Main README', status: 'COMPLETED', notes: 'docs/README.md' }
        ]
      },
      {
        title: 'Code Structure Improvements (Week 3-4) - MEDIUM RISK',
        tasks: [
          { name: 'Generate Import Map', status: 'COMPLETED', notes: 'Create script to map all imports' },
          { name: 'Plan Component Moves', status: 'COMPLETED', notes: 'Create detailed reorganization plan' },
          { name: 'Execute Component Moves', status: 'PENDING', notes: 'Move components to new structure' }
        ]
      },
      {
        title: 'Testing & Validation (Week 5) - LOW RISK',
        tasks: [
          { name: 'Run Full E2E Suite', status: 'PENDING', notes: 'Execute all E2E tests' },
          { name: 'Test Navigation Flows', status: 'PENDING', notes: 'Test all screen navigation' },
          { name: 'Performance Measurement', status: 'PENDING', notes: 'Measure bundle size and build times' }
        ]
      }
    ];
    
    displayOverallProgress(phases);
    displayNextSteps(phases);
    displayQuickCommands();
    
    log('\n' + '='.repeat(60));
    log('For detailed information, see: docs/active/development/CODEBASE_CLEANUP_IMPLEMENTATION_PLAN.md', 'blue');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  displayOverallProgress,
  displayNextSteps,
  calculateProgress
};
