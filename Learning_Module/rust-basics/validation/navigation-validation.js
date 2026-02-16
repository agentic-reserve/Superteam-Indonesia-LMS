#!/usr/bin/env node

/**
 * Navigation Validation Script for Rust Basics Learning Module
 * 
 * This script validates:
 * - Property 9: Lesson Navigation Completeness
 * 
 * Validates Requirements: 9.4
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
 * Get all lesson directories in order
 */
function getLessonDirectories() {
  const lessonPattern = /^\d{2}-[a-z-]+$/;
  
  try {
    const dirs = fs.readdirSync(MODULE_ROOT, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .filter(name => lessonPattern.test(name))
      .sort(); // Sort to ensure proper order
    
    return dirs;
  } catch (error) {
    console.error(`${colors.red}Error reading module directory: ${error.message}${colors.reset}`);
    return [];
  }
}

/**
 * Extract navigation links from lesson content
 * Returns object with previous, next, and moduleHome links
 * Supports both English and Indonesian keywords
 */
function extractNavigationLinks(content) {
  const links = {
    previous: null,
    next: null,
    moduleHome: null,
  };
  
  const lines = content.split('\n');
  
  for (const line of lines) {
    // Match **Previous** or **Sebelumnya**: [text](link)
    const prevMatch = line.match(/\*\*(Previous|Sebelumnya)\*\*:\s*\[([^\]]+)\]\(([^)]+)\)/);
    if (prevMatch) {
      links.previous = {
        text: prevMatch[2],
        link: prevMatch[3],
      };
    }
    
    // Match **Next** or **Selanjutnya**: [text](link)
    const nextMatch = line.match(/\*\*(Next|Selanjutnya)\*\*:\s*\[([^\]]+)\]\(([^)]+)\)/);
    if (nextMatch) {
      links.next = {
        text: nextMatch[2],
        link: nextMatch[3],
      };
    }
    
    // Match **Module Home** or **Beranda Modul**: [text](link)
    const homeMatch = line.match(/\*\*(Module Home|Beranda Modul)\*\*:\s*\[([^\]]+)\]\(([^)]+)\)/);
    if (homeMatch) {
      links.moduleHome = {
        text: homeMatch[2],
        link: homeMatch[3],
      };
    }
  }
  
  return links;
}

/**
 * Validate that a link points to the expected lesson
 */
function validateLinkTarget(link, expectedLesson) {
  if (!link) return false;
  
  // Extract lesson directory from link (e.g., "../02-ownership-borrowing/README.md" -> "02-ownership-borrowing")
  const match = link.match(/\.\.\/(\d{2}-[a-z-]+)\//);
  if (!match) return false;
  
  return match[1] === expectedLesson;
}

// ============================================================================
// Property 9: Lesson Navigation Completeness
// ============================================================================

/**
 * Property 9: Lesson Navigation Completeness
 * 
 * For any lesson (except the first and last), the lesson README should 
 * contain navigation links to both the previous and next lessons.
 * 
 * Validates: Requirements 9.4
 */
function validateLessonNavigationCompleteness() {
  console.log(`\n${colors.cyan}=== Property 9: Lesson Navigation Completeness ===${colors.reset}`);
  console.log('Validates: Requirements 9.4\n');
  
  const lessonDirs = getLessonDirectories();
  
  if (lessonDirs.length === 0) {
    console.log(`${colors.yellow}⚠ No lesson directories found${colors.reset}`);
    return true;
  }
  
  console.log(`Found ${lessonDirs.length} lesson directories to validate`);
  console.log(`Lessons: ${lessonDirs.join(', ')}\n`);
  
  const violations = [];
  
  // Create test cases for each lesson with its expected navigation
  const testCases = lessonDirs.map((lesson, index) => ({
    lesson,
    index,
    isFirst: index === 0,
    isLast: index === lessonDirs.length - 1,
    expectedPrevious: index > 0 ? lessonDirs[index - 1] : null,
    expectedNext: index < lessonDirs.length - 1 ? lessonDirs[index + 1] : null,
  }));
  
  // Property-based test: For each lesson, check navigation completeness
  const property = fc.property(
    fc.constantFrom(...testCases),
    (testCase) => {
      const { lesson, isFirst, isLast, expectedPrevious, expectedNext } = testCase;
      
      // Read both English and Indonesian versions
      const enPath = path.join(MODULE_ROOT, lesson, 'README.md');
      const idPath = path.join(MODULE_ROOT, lesson, 'README_ID.md');
      
      const enContent = readFile(enPath);
      const idContent = readFile(idPath);
      
      if (!enContent || !idContent) {
        console.log(`  ${colors.yellow}⚠${colors.reset} ${lesson}: Could not read files, skipping`);
        return true; // Skip if files can't be read
      }
      
      let isValid = true;
      
      // Validate English version
      const enLinks = extractNavigationLinks(enContent);
      
      // Check Previous link (all lessons should have it, even first one links to module home)
      if (!enLinks.previous) {
        violations.push({
          lesson,
          language: 'en',
          issue: 'missing Previous link',
        });
        console.log(`  ${colors.red}✗${colors.reset} ${lesson} (EN): Missing **Previous** link`);
        isValid = false;
      } else if (!isFirst && expectedPrevious) {
        // For non-first lessons, validate the link points to the correct previous lesson
        if (!validateLinkTarget(enLinks.previous.link, expectedPrevious)) {
          violations.push({
            lesson,
            language: 'en',
            issue: 'incorrect Previous link',
            expected: expectedPrevious,
            actual: enLinks.previous.link,
          });
          console.log(`  ${colors.red}✗${colors.reset} ${lesson} (EN): Previous link should point to ${expectedPrevious}`);
          console.log(`    Found: ${enLinks.previous.link}`);
          isValid = false;
        }
      }
      
      // Check Next link (all lessons except last should have it)
      if (!isLast) {
        if (!enLinks.next) {
          violations.push({
            lesson,
            language: 'en',
            issue: 'missing Next link',
          });
          console.log(`  ${colors.red}✗${colors.reset} ${lesson} (EN): Missing **Next** link`);
          isValid = false;
        } else if (expectedNext && !validateLinkTarget(enLinks.next.link, expectedNext)) {
          violations.push({
            lesson,
            language: 'en',
            issue: 'incorrect Next link',
            expected: expectedNext,
            actual: enLinks.next.link,
          });
          console.log(`  ${colors.red}✗${colors.reset} ${lesson} (EN): Next link should point to ${expectedNext}`);
          console.log(`    Found: ${enLinks.next.link}`);
          isValid = false;
        }
      }
      
      // Check Module Home link (all lessons should have it)
      if (!enLinks.moduleHome) {
        violations.push({
          lesson,
          language: 'en',
          issue: 'missing Module Home link',
        });
        console.log(`  ${colors.red}✗${colors.reset} ${lesson} (EN): Missing **Module Home** link`);
        isValid = false;
      }
      
      // Validate Indonesian version
      const idLinks = extractNavigationLinks(idContent);
      
      // Check Previous link
      if (!idLinks.previous) {
        violations.push({
          lesson,
          language: 'id',
          issue: 'missing Previous link',
        });
        console.log(`  ${colors.red}✗${colors.reset} ${lesson} (ID): Missing **Previous** link`);
        isValid = false;
      } else if (!isFirst && expectedPrevious) {
        if (!validateLinkTarget(idLinks.previous.link, expectedPrevious)) {
          violations.push({
            lesson,
            language: 'id',
            issue: 'incorrect Previous link',
            expected: expectedPrevious,
            actual: idLinks.previous.link,
          });
          console.log(`  ${colors.red}✗${colors.reset} ${lesson} (ID): Previous link should point to ${expectedPrevious}`);
          console.log(`    Found: ${idLinks.previous.link}`);
          isValid = false;
        }
      }
      
      // Check Next link
      if (!isLast) {
        if (!idLinks.next) {
          violations.push({
            lesson,
            language: 'id',
            issue: 'missing Next link',
          });
          console.log(`  ${colors.red}✗${colors.reset} ${lesson} (ID): Missing **Next** link`);
          isValid = false;
        } else if (expectedNext && !validateLinkTarget(idLinks.next.link, expectedNext)) {
          violations.push({
            lesson,
            language: 'id',
            issue: 'incorrect Next link',
            expected: expectedNext,
            actual: idLinks.next.link,
          });
          console.log(`  ${colors.red}✗${colors.reset} ${lesson} (ID): Next link should point to ${expectedNext}`);
          console.log(`    Found: ${idLinks.next.link}`);
          isValid = false;
        }
      }
      
      // Check Module Home link
      if (!idLinks.moduleHome) {
        violations.push({
          lesson,
          language: 'id',
          issue: 'missing Module Home link',
        });
        console.log(`  ${colors.red}✗${colors.reset} ${lesson} (ID): Missing **Module Home** link`);
        isValid = false;
      }
      
      return isValid;
    }
  );
  
  try {
    fc.assert(property, { 
      numRuns: Math.max(100, testCases.length),
      verbose: false 
    });
    console.log(`${colors.green}✓ Property 9 PASSED: All lessons have complete navigation links${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Property 9 FAILED: ${violations.length} navigation issues found${colors.reset}`);
    return false;
  }
}

// ============================================================================
// Additional Navigation Checks
// ============================================================================

/**
 * Validate navigation link consistency
 * Ensures that if lesson A links to lesson B as "next", then lesson B links to lesson A as "previous"
 */
function validateNavigationConsistency() {
  console.log(`\n${colors.cyan}=== Navigation Consistency Check ===${colors.reset}\n`);
  
  const lessonDirs = getLessonDirectories();
  const inconsistencies = [];
  
  for (let i = 0; i < lessonDirs.length - 1; i++) {
    const currentLesson = lessonDirs[i];
    const nextLesson = lessonDirs[i + 1];
    
    const currentPath = path.join(MODULE_ROOT, currentLesson, 'README.md');
    const nextPath = path.join(MODULE_ROOT, nextLesson, 'README.md');
    
    const currentContent = readFile(currentPath);
    const nextContent = readFile(nextPath);
    
    if (!currentContent || !nextContent) continue;
    
    const currentLinks = extractNavigationLinks(currentContent);
    const nextLinks = extractNavigationLinks(nextContent);
    
    // Check if current lesson's "next" points to next lesson
    if (currentLinks.next && !validateLinkTarget(currentLinks.next.link, nextLesson)) {
      inconsistencies.push({
        lesson: currentLesson,
        issue: `Next link doesn't point to ${nextLesson}`,
        actual: currentLinks.next.link,
      });
      console.log(`${colors.red}✗${colors.reset} ${currentLesson}: Next link inconsistency`);
    }
    
    // Check if next lesson's "previous" points to current lesson
    if (nextLinks.previous && !validateLinkTarget(nextLinks.previous.link, currentLesson)) {
      inconsistencies.push({
        lesson: nextLesson,
        issue: `Previous link doesn't point to ${currentLesson}`,
        actual: nextLinks.previous.link,
      });
      console.log(`${colors.red}✗${colors.reset} ${nextLesson}: Previous link inconsistency`);
    }
  }
  
  if (inconsistencies.length === 0) {
    console.log(`${colors.green}✓${colors.reset} Navigation links are consistent across all lessons`);
    return true;
  } else {
    console.log(`${colors.red}✗${colors.reset} Found ${inconsistencies.length} navigation inconsistencies`);
    return false;
  }
}

// ============================================================================
// Main Execution
// ============================================================================

function main() {
  console.log(`${colors.blue}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║  Rust Basics Module - Navigation Validation                   ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`\nModule Path: ${MODULE_ROOT}`);
  console.log(`Property-Based Testing: Minimum 100 iterations per test\n`);
  
  const results = {
    property9: validateLessonNavigationCompleteness(),
    consistency: validateNavigationConsistency(),
  };
  
  // Summary
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}Summary${colors.reset}\n`);
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  console.log(`Property 9 (Navigation Completeness): ${results.property9 ? colors.green + 'PASSED' : colors.red + 'FAILED'}${colors.reset}`);
  console.log(`Navigation Consistency: ${results.consistency ? colors.green + 'PASSED' : colors.red + 'FAILED'}${colors.reset}`);
  
  console.log(`\n${passed}/${total} checks passed`);
  
  if (passed === total) {
    console.log(`\n${colors.green}✓ All navigation validations passed!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}✗ Some validations failed. Please review the output above.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run validation
main();
