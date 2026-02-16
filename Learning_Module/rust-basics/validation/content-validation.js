#!/usr/bin/env node

/**
 * Content Validation Script for Rust Basics Learning Module
 * 
 * This script validates:
 * - Property 3: Parallel Markdown Structure
 * - Property 4: Language Navigation Links
 * - Property 5: Required Lesson Sections
 * 
 * Validates Requirements: 2.2, 2.5, 4.1, 4.2, 4.3, 4.5, 4.6, 4.7
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
 * Extract markdown heading structure from content
 * Returns array of objects with level and text
 */
function extractHeadingStructure(content) {
  const headings = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    // Match markdown headings (# through ######)
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      headings.push({ level, text });
    }
  }
  
  return headings;
}

/**
 * Get all bilingual file pairs in the module
 */
function getBilingualFilePairs() {
  const pairs = [];
  
  // Get all directories recursively
  const allDirs = getAllDirectories(MODULE_ROOT);
  
  // Filter out validation and node_modules directories
  const relevantDirs = allDirs.filter(dir => 
    !dir.includes('node_modules') && 
    !dir.includes('validation') &&
    !dir.includes('.git') &&
    !dir.includes('starter') &&
    !dir.includes('solution')
  );
  
  // Add module root
  relevantDirs.unshift('.');
  
  for (const dirPath of relevantDirs) {
    const fullPath = path.join(MODULE_ROOT, dirPath);
    const files = getFiles(fullPath);
    
    if (files.includes('README.md') && files.includes('README_ID.md')) {
      pairs.push({
        directory: dirPath || 'root',
        englishFile: path.join(fullPath, 'README.md'),
        indonesianFile: path.join(fullPath, 'README_ID.md'),
      });
    }
  }
  
  return pairs;
}

/**
 * Get all lesson README files (both languages)
 */
function getLessonFiles() {
  const lessonFiles = [];
  const lessonPattern = /^\d{2}-[a-z-]+$/;
  
  const dirs = fs.readdirSync(MODULE_ROOT, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => lessonPattern.test(name));
  
  for (const dir of dirs) {
    const dirPath = path.join(MODULE_ROOT, dir);
    const files = getFiles(dirPath);
    
    if (files.includes('README.md')) {
      lessonFiles.push({
        path: path.join(dirPath, 'README.md'),
        language: 'en',
        lesson: dir,
      });
    }
    
    if (files.includes('README_ID.md')) {
      lessonFiles.push({
        path: path.join(dirPath, 'README_ID.md'),
        language: 'id',
        lesson: dir,
      });
    }
  }
  
  return lessonFiles;
}

// ============================================================================
// Property 3: Parallel Markdown Structure
// ============================================================================

/**
 * Property 3: Parallel Markdown Structure
 * 
 * For any pair of bilingual lesson files (README.md and README_ID.md), 
 * both files should have the same markdown heading structure (same heading 
 * levels and same number of headings at each level).
 * 
 * Validates: Requirements 2.2
 */
function validateParallelMarkdownStructure() {
  console.log(`\n${colors.cyan}=== Property 3: Parallel Markdown Structure ===${colors.reset}`);
  console.log('Validates: Requirements 2.2\n');
  
  const pairs = getBilingualFilePairs();
  console.log(`Checking ${pairs.length} bilingual file pairs for parallel structure`);
  
  const violations = [];
  
  // Property-based test: For each pair, check heading structure matches
  const property = fc.property(
    fc.constantFrom(...pairs),
    (pair) => {
      const enContent = readFile(pair.englishFile);
      const idContent = readFile(pair.indonesianFile);
      
      if (!enContent || !idContent) {
        return true; // Skip if files can't be read
      }
      
      const enHeadings = extractHeadingStructure(enContent);
      const idHeadings = extractHeadingStructure(idContent);
      
      // Check if heading counts match
      if (enHeadings.length !== idHeadings.length) {
        violations.push({
          directory: pair.directory,
          issue: 'heading count mismatch',
          enCount: enHeadings.length,
          idCount: idHeadings.length,
        });
        console.log(`  ${colors.red}✗${colors.reset} ${pair.directory}: Heading count mismatch (EN: ${enHeadings.length}, ID: ${idHeadings.length})`);
        return false;
      }
      
      // Check if heading levels match at each position
      for (let i = 0; i < enHeadings.length; i++) {
        if (enHeadings[i].level !== idHeadings[i].level) {
          violations.push({
            directory: pair.directory,
            issue: 'heading level mismatch',
            position: i,
            enLevel: enHeadings[i].level,
            idLevel: idHeadings[i].level,
            enText: enHeadings[i].text,
            idText: idHeadings[i].text,
          });
          console.log(`  ${colors.red}✗${colors.reset} ${pair.directory}: Heading level mismatch at position ${i}`);
          console.log(`    EN (level ${enHeadings[i].level}): ${enHeadings[i].text}`);
          console.log(`    ID (level ${idHeadings[i].level}): ${idHeadings[i].text}`);
          return false;
        }
      }
      
      return true;
    }
  );
  
  try {
    fc.assert(property, { 
      numRuns: Math.max(100, pairs.length),
      verbose: false 
    });
    console.log(`${colors.green}✓ Property 3 PASSED: All bilingual pairs have parallel markdown structure${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Property 3 FAILED: ${violations.length} pairs have structural mismatches${colors.reset}`);
    return false;
  }
}

// ============================================================================
// Property 4: Language Navigation Links
// ============================================================================

/**
 * Property 4: Language Navigation Links
 * 
 * For any bilingual document pair in the rust-basics module, each document 
 * should contain a navigation link to its counterpart in the other language.
 * 
 * Validates: Requirements 2.5
 */
function validateLanguageNavigationLinks() {
  console.log(`\n${colors.cyan}=== Property 4: Language Navigation Links ===${colors.reset}`);
  console.log('Validates: Requirements 2.5\n');
  
  const pairs = getBilingualFilePairs();
  console.log(`Checking ${pairs.length} bilingual file pairs for language navigation links`);
  
  const violations = [];
  
  // Property-based test: For each pair, check navigation links exist
  const property = fc.property(
    fc.constantFrom(...pairs),
    (pair) => {
      const enContent = readFile(pair.englishFile);
      const idContent = readFile(pair.indonesianFile);
      
      if (!enContent || !idContent) {
        return true; // Skip if files can't be read
      }
      
      // Check if English file links to Indonesian file
      const enHasLink = enContent.includes('README_ID.md');
      
      // Check if Indonesian file links to English file
      const idHasLink = idContent.includes('README.md') && 
                        (idContent.includes('[English]') || 
                         idContent.includes('[Inggris]') ||
                         idContent.includes('**Language:**'));
      
      let isValid = true;
      
      if (!enHasLink) {
        violations.push({
          directory: pair.directory,
          file: 'README.md',
          issue: 'missing link to README_ID.md',
        });
        console.log(`  ${colors.red}✗${colors.reset} ${pair.directory}/README.md: Missing link to README_ID.md`);
        isValid = false;
      }
      
      if (!idHasLink) {
        violations.push({
          directory: pair.directory,
          file: 'README_ID.md',
          issue: 'missing link to README.md',
        });
        console.log(`  ${colors.red}✗${colors.reset} ${pair.directory}/README_ID.md: Missing link to README.md`);
        isValid = false;
      }
      
      return isValid;
    }
  );
  
  try {
    fc.assert(property, { 
      numRuns: Math.max(100, pairs.length),
      verbose: false 
    });
    console.log(`${colors.green}✓ Property 4 PASSED: All bilingual pairs have language navigation links${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Property 4 FAILED: ${violations.length} files missing language navigation links${colors.reset}`);
    return false;
  }
}

// ============================================================================
// Property 5: Required Lesson Sections
// ============================================================================

/**
 * Property 5: Required Lesson Sections
 * 
 * For any lesson README file in the rust-basics module, the document should 
 * contain all required section headings: "Overview", "Learning Objectives", 
 * "Prerequisites", either "Common Mistakes" or "Best Practices", "Next Steps", 
 * and "Source Attribution".
 * 
 * Validates: Requirements 4.1, 4.2, 4.3, 4.5, 4.6, 4.7
 */
function validateRequiredLessonSections() {
  console.log(`\n${colors.cyan}=== Property 5: Required Lesson Sections ===${colors.reset}`);
  console.log('Validates: Requirements 4.1, 4.2, 4.3, 4.5, 4.6, 4.7\n');
  
  const lessonFiles = getLessonFiles();
  console.log(`Checking ${lessonFiles.length} lesson files for required sections`);
  
  // Required sections (case-insensitive matching)
  const requiredSections = [
    { name: 'Overview', pattern: /^##\s+(Overview|Ringkasan|Ikhtisar|Gambaran Umum)/i },
    { name: 'Learning Objectives', pattern: /^##\s+(Learning Objectives|Tujuan Pembelajaran|Objektif Pembelajaran)/i },
    { name: 'Prerequisites', pattern: /^##\s+(Prerequisites|Prasyarat|Persyaratan)/i },
    { name: 'Next Steps', pattern: /^##\s+(Next Steps|Langkah Selanjutnya|Langkah Berikutnya)/i },
    { name: 'Source Attribution', pattern: /^##\s+(Source Attribution|Atribusi Sumber|Sumber Referensi)/i },
  ];
  
  // At least one of these should be present
  const optionalSections = [
    { name: 'Best Practices', pattern: /^##\s+(Best Practices?|Praktik Terbaik|Praktik yang Baik|Best Practice)/i },
    { name: 'Common Mistakes', pattern: /^##\s+(Common Mistakes|Kesalahan Umum|Kesalahan yang Sering Terjadi)/i },
  ];
  
  const violations = [];
  
  // Property-based test: For each lesson file, check required sections
  const property = fc.property(
    fc.constantFrom(...lessonFiles),
    (lessonFile) => {
      const content = readFile(lessonFile.path);
      
      if (!content) {
        return true; // Skip if file can't be read
      }
      
      const lines = content.split('\n');
      let isValid = true;
      
      // Check each required section
      for (const section of requiredSections) {
        const found = lines.some(line => section.pattern.test(line));
        
        if (!found) {
          violations.push({
            file: lessonFile.path,
            lesson: lessonFile.lesson,
            language: lessonFile.language,
            missingSection: section.name,
          });
          console.log(`  ${colors.red}✗${colors.reset} ${lessonFile.lesson} (${lessonFile.language}): Missing "${section.name}" section`);
          isValid = false;
        }
      }
      
      // Check that at least one optional section is present
      const hasOptionalSection = optionalSections.some(section =>
        lines.some(line => section.pattern.test(line))
      );
      
      if (!hasOptionalSection) {
        violations.push({
          file: lessonFile.path,
          lesson: lessonFile.lesson,
          language: lessonFile.language,
          missingSection: 'Best Practices OR Common Mistakes',
        });
        console.log(`  ${colors.red}✗${colors.reset} ${lessonFile.lesson} (${lessonFile.language}): Missing "Best Practices" or "Common Mistakes" section`);
        isValid = false;
      }
      
      return isValid;
    }
  );
  
  try {
    fc.assert(property, { 
      numRuns: Math.max(100, lessonFiles.length),
      verbose: false 
    });
    console.log(`${colors.green}✓ Property 5 PASSED: All lesson files have required sections${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Property 5 FAILED: ${violations.length} lesson files missing required sections${colors.reset}`);
    return false;
  }
}

// ============================================================================
// Main Execution
// ============================================================================

function main() {
  console.log(`${colors.blue}╔════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║  Rust Basics Module - Content Validation                      ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`\nModule Path: ${MODULE_ROOT}`);
  console.log(`Property-Based Testing: Minimum 100 iterations per test\n`);
  
  const results = {
    property3: validateParallelMarkdownStructure(),
    property4: validateLanguageNavigationLinks(),
    property5: validateRequiredLessonSections(),
  };
  
  // Summary
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}Summary${colors.reset}\n`);
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  console.log(`Property 3 (Parallel Structure): ${results.property3 ? colors.green + 'PASSED' : colors.red + 'FAILED'}${colors.reset}`);
  console.log(`Property 4 (Language Links): ${results.property4 ? colors.green + 'PASSED' : colors.red + 'FAILED'}${colors.reset}`);
  console.log(`Property 5 (Required Sections): ${results.property5 ? colors.green + 'PASSED' : colors.red + 'FAILED'}${colors.reset}`);
  
  console.log(`\n${passed}/${total} checks passed`);
  
  if (passed === total) {
    console.log(`\n${colors.green}✓ All content validations passed!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}✗ Some validations failed. Please review the output above.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run validation
main();
