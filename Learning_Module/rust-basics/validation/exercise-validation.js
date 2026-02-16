#!/usr/bin/env node

/**
 * Exercise Validation Script for Rust Basics Learning Module
 * 
 * This script validates:
 * - Property 6: Exercise Bilingual Instructions
 * - Property 7: Exercise Lesson References
 * - Property 8: Exercise Validation Criteria
 * 
 * Validates Requirements: 5.2, 5.3, 5.4
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fc from 'fast-check';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Module root directory
const MODULE_ROOT = path.resolve(__dirname, '..');
const EXERCISES_DIR = path.join(MODULE_ROOT, 'exercises');

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
 * Read file content
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`${colors.red}Error reading file ${filePath}: ${error.message}${colors.reset}`);
    return null;
  }
}

/**
 * Get all exercise directories
 */
function getExerciseDirectories() {
  const exerciseDirs = [];
  
  if (!fs.existsSync(EXERCISES_DIR)) {
    console.error(`${colors.red}Exercises directory not found: ${EXERCISES_DIR}${colors.reset}`);
    return exerciseDirs;
  }
  
  const dirs = getDirectories(EXERCISES_DIR);
  
  // Filter for numbered exercise directories (e.g., 01-variables-functions)
  const exercisePattern = /^\d{2}-[a-z-]+$/;
  
  for (const dir of dirs) {
    if (exercisePattern.test(dir)) {
      exerciseDirs.push({
        name: dir,
        path: path.join(EXERCISES_DIR, dir),
      });
    }
  }
  
  return exerciseDirs;
}

/**
 * Get all exercise README files (both languages)
 */
function getExerciseReadmeFiles() {
  const readmeFiles = [];
  const exerciseDirs = getExerciseDirectories();
  
  for (const exercise of exerciseDirs) {
    const files = getFiles(exercise.path);
    
    if (files.includes('README.md')) {
      readmeFiles.push({
        path: path.join(exercise.path, 'README.md'),
        exercise: exercise.name,
        language: 'en',
      });
    }
    
    if (files.includes('README_ID.md')) {
      readmeFiles.push({
        path: path.join(exercise.path, 'README_ID.md'),
        exercise: exercise.name,
        language: 'id',
      });
    }
  }
  
  return readmeFiles;
}

// ============================================================================
// Property 6: Exercise Bilingual Instructions
// ============================================================================

/**
 * Property 6: Exercise Bilingual Instructions
 * 
 * For any exercise directory in the rust-basics module, both README.md 
 * and README_ID.md files should exist.
 * 
 * Validates: Requirements 5.2
 */
function validateExerciseBilingualInstructions() {
  console.log(`\n${colors.cyan}=== Property 6: Exercise Bilingual Instructions ===${colors.reset}`);
  console.log('Validates: Requirements 5.2\n');
  
  const exerciseDirs = getExerciseDirectories();
  
  if (exerciseDirs.length === 0) {
    console.log(`${colors.yellow}⚠ No exercise directories found${colors.reset}`);
    return true;
  }
  
  console.log(`Checking ${exerciseDirs.length} exercise directories for bilingual instructions`);
  
  const violations = [];
  
  // Property-based test: For each exercise directory, check both README files exist
  const property = fc.property(
    fc.constantFrom(...exerciseDirs),
    (exercise) => {
      const files = getFiles(exercise.path);
      
      const hasReadme = files.includes('README.md');
      const hasReadmeId = files.includes('README_ID.md');
      
      let isValid = true;
      
      if (!hasReadme) {
        violations.push({
          exercise: exercise.name,
          missing: 'README.md',
        });
        console.log(`  ${colors.red}✗${colors.reset} ${exercise.name}: Missing README.md`);
        isValid = false;
      }
      
      if (!hasReadmeId) {
        violations.push({
          exercise: exercise.name,
          missing: 'README_ID.md',
        });
        console.log(`  ${colors.red}✗${colors.reset} ${exercise.name}: Missing README_ID.md`);
        isValid = false;
      }
      
      return isValid;
    }
  );
  
  try {
    fc.assert(property, { 
      numRuns: Math.max(100, exerciseDirs.length),
      verbose: false 
    });
    console.log(`${colors.green}✓ Property 6 PASSED: All exercises have bilingual instructions${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Property 6 FAILED: ${violations.length} exercises missing bilingual files${colors.reset}`);
    return false;
  }
}

// ============================================================================
// Property 7: Exercise Lesson References
// ============================================================================

/**
 * Property 7: Exercise Lesson References
 * 
 * For any exercise README file, the document should contain at least one 
 * reference (link or mention) to a lesson directory in the rust-basics module.
 * 
 * Validates: Requirements 5.4
 */
function validateExerciseLessonReferences() {
  console.log(`\n${colors.cyan}=== Property 7: Exercise Lesson References ===${colors.reset}`);
  console.log('Validates: Requirements 5.4\n');
  
  const readmeFiles = getExerciseReadmeFiles();
  
  if (readmeFiles.length === 0) {
    console.log(`${colors.yellow}⚠ No exercise README files found${colors.reset}`);
    return true;
  }
  
  console.log(`Checking ${readmeFiles.length} exercise README files for lesson references`);
  
  // Pattern to match lesson directory references
  // Matches: ../../01-fundamentals/, ../01-fundamentals/, 01-fundamentals, etc.
  const lessonPattern = /\d{2}-[a-z-]+/;
  
  // Also look for explicit lesson links in markdown
  const lessonLinkPattern = /\[.*?\]\(.*?\/\d{2}-[a-z-]+.*?\)/;
  
  const violations = [];
  
  // Property-based test: For each exercise README, check for lesson references
  const property = fc.property(
    fc.constantFrom(...readmeFiles),
    (readme) => {
      const content = readFile(readme.path);
      
      if (!content) {
        return true; // Skip if file can't be read
      }
      
      // Check for lesson directory references
      const hasLessonReference = lessonPattern.test(content);
      const hasLessonLink = lessonLinkPattern.test(content);
      
      const isValid = hasLessonReference || hasLessonLink;
      
      if (!isValid) {
        violations.push({
          exercise: readme.exercise,
          language: readme.language,
          file: path.basename(readme.path),
        });
        console.log(`  ${colors.red}✗${colors.reset} ${readme.exercise} (${readme.language}): No lesson references found`);
      }
      
      return isValid;
    }
  );
  
  try {
    fc.assert(property, { 
      numRuns: Math.max(100, readmeFiles.length),
      verbose: false 
    });
    console.log(`${colors.green}✓ Property 7 PASSED: All exercises reference related lessons${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Property 7 FAILED: ${violations.length} exercises missing lesson references${colors.reset}`);
    return false;
  }
}

// ============================================================================
// Property 8: Exercise Validation Criteria
// ============================================================================

/**
 * Property 8: Exercise Validation Criteria
 * 
 * For any exercise README file, the document should contain a section 
 * describing validation criteria, expected outputs, or success conditions.
 * 
 * Validates: Requirements 5.3
 */
function validateExerciseValidationCriteria() {
  console.log(`\n${colors.cyan}=== Property 8: Exercise Validation Criteria ===${colors.reset}`);
  console.log('Validates: Requirements 5.3\n');
  
  const readmeFiles = getExerciseReadmeFiles();
  
  if (readmeFiles.length === 0) {
    console.log(`${colors.yellow}⚠ No exercise README files found${colors.reset}`);
    return true;
  }
  
  console.log(`Checking ${readmeFiles.length} exercise README files for validation criteria`);
  
  // Patterns to detect validation criteria sections
  const validationSectionPatterns = [
    /^##\s+(Validation Criteria|Kriteria Validasi)/im,
    /^##\s+(Success Criteria|Kriteria Keberhasilan)/im,
    /^##\s+(Expected Output|Output yang Diharapkan)/im,
    /^##\s+(Requirements|Persyaratan)/im,
  ];
  
  // Keywords that indicate validation criteria in content
  const validationKeywords = [
    /validation criteria/i,
    /kriteria validasi/i,
    /your solution is correct when/i,
    /solusi anda benar jika/i,
    /expected output/i,
    /output yang diharapkan/i,
    /should produce/i,
    /harus menghasilkan/i,
    /✅/,  // Checkmark often used for validation criteria
    /✓/,   // Alternative checkmark
  ];
  
  const violations = [];
  
  // Property-based test: For each exercise README, check for validation criteria
  const property = fc.property(
    fc.constantFrom(...readmeFiles),
    (readme) => {
      const content = readFile(readme.path);
      
      if (!content) {
        return true; // Skip if file can't be read
      }
      
      // Check for validation section headings
      const hasValidationSection = validationSectionPatterns.some(pattern => 
        pattern.test(content)
      );
      
      // Check for validation keywords in content
      const hasValidationKeywords = validationKeywords.some(pattern => 
        pattern.test(content)
      );
      
      const isValid = hasValidationSection || hasValidationKeywords;
      
      if (!isValid) {
        violations.push({
          exercise: readme.exercise,
          language: readme.language,
          file: path.basename(readme.path),
        });
        console.log(`  ${colors.red}✗${colors.reset} ${readme.exercise} (${readme.language}): No validation criteria found`);
        console.log(`    Expected: "Validation Criteria" section or validation keywords`);
      }
      
      return isValid;
    }
  );
  
  try {
    fc.assert(property, { 
      numRuns: Math.max(100, readmeFiles.length),
      verbose: false 
    });
    console.log(`${colors.green}✓ Property 8 PASSED: All exercises have validation criteria${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Property 8 FAILED: ${violations.length} exercises missing validation criteria${colors.reset}`);
    return false;
  }
}

// ============================================================================
// Additional Exercise Structure Checks
// ============================================================================

/**
 * Validate basic exercise structure
 */
function validateBasicExerciseStructure() {
  console.log(`\n${colors.cyan}=== Basic Exercise Structure Validation ===${colors.reset}\n`);
  
  const exerciseDirs = getExerciseDirectories();
  
  if (exerciseDirs.length === 0) {
    console.log(`${colors.yellow}⚠ No exercise directories found${colors.reset}`);
    return true;
  }
  
  let allPassed = true;
  
  console.log(`Checking ${exerciseDirs.length} exercises for starter and solution directories`);
  
  for (const exercise of exerciseDirs) {
    const starterPath = path.join(exercise.path, 'starter');
    const solutionPath = path.join(exercise.path, 'solution');
    
    const hasStarter = fs.existsSync(starterPath);
    const hasSolution = fs.existsSync(solutionPath);
    
    if (hasStarter && hasSolution) {
      console.log(`${colors.green}✓${colors.reset} ${exercise.name}: Has starter and solution directories`);
    } else {
      if (!hasStarter) {
        console.log(`${colors.yellow}⚠${colors.reset} ${exercise.name}: Missing starter directory`);
      }
      if (!hasSolution) {
        console.log(`${colors.yellow}⚠${colors.reset} ${exercise.name}: Missing solution directory`);
      }
      // Note: This is a warning, not a failure
    }
  }
  
  return allPassed;
}

// ============================================================================
// Main Execution
// ============================================================================

function main() {
  console.log(`${colors.blue}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║  Rust Basics Module - Exercise Validation                     ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`\nModule Path: ${MODULE_ROOT}`);
  console.log(`Exercises Path: ${EXERCISES_DIR}`);
  console.log(`Property-Based Testing: Minimum 100 iterations per test\n`);
  
  // Check if exercises directory exists
  if (!fs.existsSync(EXERCISES_DIR)) {
    console.log(`${colors.red}✗ Exercises directory not found: ${EXERCISES_DIR}${colors.reset}\n`);
    process.exit(1);
  }
  
  const results = {
    basicStructure: validateBasicExerciseStructure(),
    property6: validateExerciseBilingualInstructions(),
    property7: validateExerciseLessonReferences(),
    property8: validateExerciseValidationCriteria(),
  };
  
  // Summary
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}Summary${colors.reset}\n`);
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  console.log(`Basic Structure: ${results.basicStructure ? colors.green + 'PASSED' : colors.red + 'FAILED'}${colors.reset}`);
  console.log(`Property 6 (Bilingual Instructions): ${results.property6 ? colors.green + 'PASSED' : colors.red + 'FAILED'}${colors.reset}`);
  console.log(`Property 7 (Lesson References): ${results.property7 ? colors.green + 'PASSED' : colors.red + 'FAILED'}${colors.reset}`);
  console.log(`Property 8 (Validation Criteria): ${results.property8 ? colors.green + 'PASSED' : colors.red + 'FAILED'}${colors.reset}`);
  
  console.log(`\n${passed}/${total} checks passed`);
  
  if (passed === total) {
    console.log(`\n${colors.green}✓ All exercise validations passed!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}✗ Some validations failed. Please review the output above.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run validation
main();
