#!/usr/bin/env node

/**
 * Structure Validation Script for Rust Basics Learning Module
 * 
 * This script validates:
 * - Property 1: Lesson Directory Naming Convention
 * - Property 2: Bilingual File Pairs
 * 
 * Validates Requirements: 1.4, 2.1
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fc from 'fast-check';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Module root directory
const MODULE_ROOT = path.resolve(__dirname, '..');

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Get all directories in a given path
 */
function getDirectories(dirPath) {
  try {
    return fs.readdirSync(dirPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
  } catch (error) {
    console.error(`${colors.red}Error reading directory ${dirPath}: ${error.message}${colors.reset}`);
    return [];
  }
}

/**
 * Get all files in a directory
 */
function getFiles(dirPath) {
  try {
    return fs.readdirSync(dirPath, { withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => dirent.name);
  } catch (error) {
    console.error(`${colors.red}Error reading directory ${dirPath}: ${error.message}${colors.reset}`);
    return [];
  }
}

/**
 * Recursively get all directories in a path
 */
function getAllDirectories(dirPath, basePath = dirPath) {
  const dirs = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(basePath, fullPath);
      dirs.push(relativePath);
      dirs.push(...getAllDirectories(fullPath, basePath));
    }
  }
  
  return dirs;
}

/**
 * Check if a file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

// ============================================================================
// Property 1: Lesson Directory Naming Convention
// ============================================================================

/**
 * Property 1: Lesson Directory Naming Convention
 * 
 * For any lesson directory in the rust-basics module, the directory name 
 * should match the pattern \d{2}-[a-z-]+ (two digits, hyphen, lowercase 
 * words separated by hyphens).
 * 
 * Validates: Requirements 1.4
 */
function validateLessonDirectoryNaming() {
  console.log(`\n${colors.cyan}=== Property 1: Lesson Directory Naming Convention ===${colors.reset}`);
  console.log('Validates: Requirements 1.4\n');
  
  const lessonPattern = /^\d{2}-[a-z-]+$/;
  const excludeDirs = ['exercises', 'validation', '.git', 'node_modules'];
  
  // Get all directories in module root
  const allDirs = getDirectories(MODULE_ROOT);
  const lessonDirs = allDirs.filter(dir => !excludeDirs.includes(dir));
  
  console.log(`Found ${lessonDirs.length} potential lesson directories to validate`);
  
  // Property-based test: All lesson directories should match naming pattern
  const property = fc.property(
    fc.constantFrom(...lessonDirs),
    (dirName) => {
      const matches = lessonPattern.test(dirName);
      if (!matches) {
        console.log(`  ${colors.red}✗${colors.reset} Invalid directory name: ${dirName}`);
        console.log(`    Expected pattern: \\d{2}-[a-z-]+ (e.g., "01-fundamentals")`);
      }
      return matches;
    }
  );
  
  try {
    fc.assert(property, { 
      numRuns: Math.max(100, lessonDirs.length),
      verbose: false 
    });
    console.log(`${colors.green}✓ Property 1 PASSED: All lesson directories follow naming convention${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Property 1 FAILED: Some directories don't follow naming convention${colors.reset}`);
    return false;
  }
}

// ============================================================================
// Property 2: Bilingual File Pairs
// ============================================================================

/**
 * Property 2: Bilingual File Pairs
 * 
 * For any lesson directory in the rust-basics module, if a README.md file 
 * exists, then a README_ID.md file must also exist in the same directory, 
 * and vice versa.
 * 
 * Validates: Requirements 2.1
 */
function validateBilingualFilePairs() {
  console.log(`\n${colors.cyan}=== Property 2: Bilingual File Pairs ===${colors.reset}`);
  console.log('Validates: Requirements 2.1\n');
  
  // Get all directories recursively
  const allDirs = getAllDirectories(MODULE_ROOT);
  
  // Filter out validation and node_modules directories
  const relevantDirs = allDirs.filter(dir => 
    !dir.includes('node_modules') && 
    !dir.includes('validation') &&
    !dir.includes('.git')
  );
  
  // Add module root
  relevantDirs.unshift('.');
  
  console.log(`Checking ${relevantDirs.length} directories for bilingual file pairs`);
  
  const violations = [];
  
  // Property-based test: For each directory, check bilingual pairs
  const property = fc.property(
    fc.constantFrom(...relevantDirs),
    (dirPath) => {
      const fullPath = path.join(MODULE_ROOT, dirPath);
      const files = getFiles(fullPath);
      
      const hasReadme = files.includes('README.md');
      const hasReadmeId = files.includes('README_ID.md');
      
      // Both should exist or both should not exist
      const isValid = hasReadme === hasReadmeId;
      
      if (!isValid) {
        const missing = hasReadme ? 'README_ID.md' : 'README.md';
        const existing = hasReadme ? 'README.md' : 'README_ID.md';
        violations.push({
          directory: dirPath || 'root',
          missing,
          existing
        });
        console.log(`  ${colors.red}✗${colors.reset} ${dirPath || 'root'}: Found ${existing} but missing ${missing}`);
      }
      
      return isValid;
    }
  );
  
  try {
    fc.assert(property, { 
      numRuns: Math.max(100, relevantDirs.length),
      verbose: false 
    });
    console.log(`${colors.green}✓ Property 2 PASSED: All directories have matching bilingual file pairs${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Property 2 FAILED: ${violations.length} directories missing bilingual pairs${colors.reset}`);
    return false;
  }
}

// ============================================================================
// Additional Structure Checks
// ============================================================================

/**
 * Validate basic module structure exists
 */
function validateBasicStructure() {
  console.log(`\n${colors.cyan}=== Basic Structure Validation ===${colors.reset}\n`);
  
  const checks = [
    { path: MODULE_ROOT, name: 'Module root directory' },
    { path: path.join(MODULE_ROOT, 'README.md'), name: 'Main README.md' },
    { path: path.join(MODULE_ROOT, 'README_ID.md'), name: 'Main README_ID.md' },
    { path: path.join(MODULE_ROOT, 'exercises'), name: 'Exercises directory' },
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    const exists = fs.existsSync(check.path);
    if (exists) {
      console.log(`${colors.green}✓${colors.reset} ${check.name} exists`);
    } else {
      console.log(`${colors.red}✗${colors.reset} ${check.name} missing`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

// ============================================================================
// Main Execution
// ============================================================================

function main() {
  console.log(`${colors.blue}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║  Rust Basics Module - Structure Validation                    ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`\nModule Path: ${MODULE_ROOT}`);
  console.log(`Property-Based Testing: Minimum 100 iterations per test\n`);
  
  const results = {
    basicStructure: validateBasicStructure(),
    property1: validateLessonDirectoryNaming(),
    property2: validateBilingualFilePairs(),
  };
  
  // Summary
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}Summary${colors.reset}\n`);
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  console.log(`Basic Structure: ${results.basicStructure ? colors.green + 'PASSED' : colors.red + 'FAILED'}${colors.reset}`);
  console.log(`Property 1 (Naming): ${results.property1 ? colors.green + 'PASSED' : colors.red + 'FAILED'}${colors.reset}`);
  console.log(`Property 2 (Bilingual): ${results.property2 ? colors.green + 'PASSED' : colors.red + 'FAILED'}${colors.reset}`);
  
  console.log(`\n${passed}/${total} checks passed`);
  
  if (passed === total) {
    console.log(`\n${colors.green}✓ All structure validations passed!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}✗ Some validations failed. Please review the output above.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run validation
main();
