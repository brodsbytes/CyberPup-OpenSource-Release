#!/usr/bin/env node

/**
 * Import Dependency Map Generator
 * 
 * This script generates a comprehensive map of all imports in the CyberPup codebase
 * to ensure safe restructuring without breaking dependencies.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

function findJavaScriptFiles(dir) {
  const files = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other non-source directories
        if (!['node_modules', '.git', '.expo', 'e2e', 'docs'].includes(item)) {
          scanDirectory(fullPath);
        }
      } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
        files.push(fullPath);
      }
    }
  }
  
  scanDirectory(dir);
  return files;
}

function extractImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const importRegex = /import\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g;
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      // Skip node modules and built-in imports
      if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
        continue;
      }
      
      imports.push(importPath);
    }
    
    return imports;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return [];
  }
}

function resolveImportPath(importPath, filePath) {
  if (importPath.startsWith('.')) {
    const dir = path.dirname(filePath);
    const resolvedPath = path.resolve(dir, importPath);
    
    // Try different extensions
    const extensions = ['.js', '.jsx', '.ts', '.tsx'];
    for (const ext of extensions) {
      const fullPath = resolvedPath + ext;
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
    
    // Check if it's a directory with index file
    for (const ext of extensions) {
      const indexPath = path.join(resolvedPath, 'index' + ext);
      if (fs.existsSync(indexPath)) {
        return indexPath;
      }
    }
    
    return null;
  }
  
  return null;
}

function generateImportMap() {
  logHeader('CyberPup Import Dependency Map Generator');
  
  const projectRoot = process.cwd();
  const jsFiles = findJavaScriptFiles(projectRoot);
  
  log(`Found ${jsFiles.length} JavaScript files`, 'green');
  
  const importMap = {};
  const unresolvedImports = [];
  const circularImports = [];
  
  // First pass: collect all imports
  for (const file of jsFiles) {
    const relativePath = path.relative(projectRoot, file);
    const imports = extractImports(file);
    
    importMap[relativePath] = {
      imports: imports,
      resolvedImports: [],
      importedBy: []
    };
  }
  
  // Second pass: resolve imports and build dependency graph
  for (const [filePath, fileData] of Object.entries(importMap)) {
    const fullPath = path.join(projectRoot, filePath);
    
    for (const importPath of fileData.imports) {
      const resolvedPath = resolveImportPath(importPath, fullPath);
      
      if (resolvedPath) {
        const relativeResolvedPath = path.relative(projectRoot, resolvedPath);
        fileData.resolvedImports.push(relativeResolvedPath);
        
        // Add to importedBy list
        if (importMap[relativeResolvedPath]) {
          importMap[relativeResolvedPath].importedBy.push(filePath);
        }
      } else {
        unresolvedImports.push({
          file: filePath,
          import: importPath
        });
      }
    }
  }
  
  // Generate report
  logSection('Import Statistics');
  log(`Total files: ${Object.keys(importMap).length}`, 'bright');
  
  const totalImports = Object.values(importMap).reduce((sum, file) => sum + file.imports.length, 0);
  const totalResolved = Object.values(importMap).reduce((sum, file) => sum + file.resolvedImports.length, 0);
  
  log(`Total imports: ${totalImports}`, 'blue');
  log(`Resolved imports: ${totalResolved}`, 'green');
  log(`Unresolved imports: ${unresolvedImports.length}`, 'red');
  
  // Show unresolved imports
  if (unresolvedImports.length > 0) {
    logSection('Unresolved Imports (Need Attention)');
    unresolvedImports.forEach(({ file, import: importPath }) => {
      log(`❌ ${file} → ${importPath}`, 'red');
    });
  }
  
  // Show most imported files
  logSection('Most Imported Files (High Impact)');
  const importCounts = Object.entries(importMap)
    .map(([file, data]) => ({ file, count: data.importedBy.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  importCounts.forEach(({ file, count }) => {
    log(`📥 ${file} (imported by ${count} files)`, 'yellow');
  });
  
  // Show files with most dependencies
  logSection('Files with Most Dependencies (High Risk)');
  const dependencyCounts = Object.entries(importMap)
    .map(([file, data]) => ({ file, count: data.resolvedImports.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  dependencyCounts.forEach(({ file, count }) => {
    log(`📤 ${file} (imports ${count} files)`, 'yellow');
  });
  
  // Generate detailed map file
  const outputPath = path.join(projectRoot, 'import-dependency-map.json');
  fs.writeFileSync(outputPath, JSON.stringify(importMap, null, 2));
  
  logSection('Output Generated');
  log(`Detailed import map saved to: ${outputPath}`, 'green');
  log('Use this file to plan safe restructuring!', 'bright');
  
  return {
    importMap,
    unresolvedImports,
    stats: {
      totalFiles: Object.keys(importMap).length,
      totalImports,
      totalResolved,
      unresolvedCount: unresolvedImports.length
    }
  };
}

function main() {
  try {
    const result = generateImportMap();
    
    logSection('Summary');
    if (result.unresolvedImports.length === 0) {
      log('✅ All imports resolved successfully!', 'green');
    } else {
      log(`⚠️  ${result.unresolvedImports.length} unresolved imports need attention`, 'yellow');
    }
    
    log('\nNext steps:', 'bright');
    log('1. Review unresolved imports (if any)', 'blue');
    log('2. Use import map to plan restructuring', 'blue');
    log('3. Test changes incrementally', 'blue');
    
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
  generateImportMap,
  findJavaScriptFiles,
  extractImports
};

