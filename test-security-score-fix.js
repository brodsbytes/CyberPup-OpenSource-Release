// Test script to verify security score calculation fix
import { getAllChecks, levels } from './data/courseData.js';

console.log('🔍 Testing Security Score Calculation Fix\n');

// Test getAllChecks function
const allChecks = getAllChecks();
console.log(`Total checks (excluding placeholder): ${allChecks.length}`);

// Count checks by level
const checksByLevel = {};
allChecks.forEach(check => {
  if (!checksByLevel[check.levelId]) {
    checksByLevel[check.levelId] = 0;
  }
  checksByLevel[check.levelId]++;
});

console.log('\n📊 Checks by Level:');
Object.keys(checksByLevel).forEach(levelId => {
  console.log(`  Level ${levelId}: ${checksByLevel[levelId]} checks`);
});

// Count total checks including placeholders for comparison
let totalWithPlaceholders = 0;
levels.forEach(level => {
  level.areas.forEach(area => {
    totalWithPlaceholders += area.checks.length;
  });
});

console.log(`\n📈 Total checks including placeholders: ${totalWithPlaceholders}`);
console.log(`📉 Placeholder checks excluded: ${totalWithPlaceholders - allChecks.length}`);

// Expected calculation
const expectedLevel1Checks = 16; // 1 welcome + 5 + 5 + 2 + 2 + 2 = 17, but welcome is separate
console.log(`\n✅ Expected Level 1 checks: ${expectedLevel1Checks}`);
console.log(`🎯 If all Level 1 checks are completed, security score should be: 100%`);

console.log('\n🔧 Fix Summary:');
console.log('- Modified getAllChecks() to filter out "Coming Soon!" placeholder checks');
console.log('- Updated ScoreBreakdownModal to exclude placeholders from progress calculation');
console.log('- Updated WelcomeScreen category totals and progress calculations');
console.log('- This should fix the 89% security score issue when all Level 1 checks are completed');
