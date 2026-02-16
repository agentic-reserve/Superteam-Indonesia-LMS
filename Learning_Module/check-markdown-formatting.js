#!/usr/bin/env node

/**
 * Markdown Formatting Consistency Checker
 * 
 * This script validates markdown files for consistent formatting:
 * - Heading hierarchy (no skipped levels)
 * - Code block syntax (proper language tags and fencing)
 * - List formatting (consistent indentation and markers)
 * 
 * Requirements: 11.1, 11.2, 11.3
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

class MarkdownChecker {
  constructor() {
    this.issues = [];
    this.filesChecked = 0;
    this.filesWithIssues = 0;
  }

  /**
   * Check heading hierarchy - no skipped levels (e.g., # -> ###)
   */
  checkHeadingHierarchy(content, filePath) {
    const lines = content.split('\n');
    let previousLevel = 0;
    const headingIssues = [];

    lines.forEach((line, index) => {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const title = headingMatch[2];

        // Check for skipped levels
        if (previousLevel > 0 && level > previousLevel + 1) {
          headingIssues.push({
            line: index + 1,
            issue: `Heading level skipped from ${previousLevel} to ${level}`,
            content: line.trim(),
          });
        }

        // Check for space after # symbols
        if (!line.match(/^#{1,6}\s+/)) {
          headingIssues.push({
            line: index + 1,
            issue: 'Missing space after # symbols',
            content: line.trim(),
          });
        }

        previousLevel = level;
      }
    });

    if (headingIssues.length > 0) {
      this.issues.push({
        file: filePath,
        category: 'Heading Hierarchy',
        issues: headingIssues,
      });
    }
  }

  /**
   * Check code block formatting
   */
  checkCodeBlocks(content, filePath) {
    const lines = content.split('\n');
    const codeBlockIssues = [];
    let inCodeBlock = false;
    let codeBlockStart = -1;
    let hasLanguageTag = false;

    lines.forEach((line, index) => {
      // Check for code block fences
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          // Starting a code block
          inCodeBlock = true;
          codeBlockStart = index + 1;
          
          // Check if language tag is present
          const languageTag = line.trim().substring(3).trim();
          hasLanguageTag = languageTag.length > 0;

          // Warn about missing language tags (not an error, but good practice)
          if (!hasLanguageTag) {
            codeBlockIssues.push({
              line: index + 1,
              issue: 'Code block without language tag (consider adding for syntax highlighting)',
              content: line.trim(),
              severity: 'warning',
            });
          }
        } else {
          // Ending a code block
          inCodeBlock = false;
          
          // Check for proper closing (should be just ```)
          if (line.trim() !== '```') {
            codeBlockIssues.push({
              line: index + 1,
              issue: 'Code block closing fence should be just ```',
              content: line.trim(),
              severity: 'error',
            });
          }
        }
      }
    });

    // Check if code block was never closed
    if (inCodeBlock) {
      codeBlockIssues.push({
        line: codeBlockStart,
        issue: 'Code block opened but never closed',
        content: '(end of file)',
        severity: 'error',
      });
    }

    if (codeBlockIssues.length > 0) {
      this.issues.push({
        file: filePath,
        category: 'Code Blocks',
        issues: codeBlockIssues,
      });
    }
  }

  /**
   * Check list formatting consistency
   */
  checkListFormatting(content, filePath) {
    const lines = content.split('\n');
    const listIssues = [];
    let inList = false;
    let listType = null; // 'unordered' or 'ordered'
    let previousIndent = 0;

    lines.forEach((line, index) => {
      // Skip code blocks
      if (line.trim().startsWith('```')) {
        return;
      }

      // Check for list items
      const unorderedMatch = line.match(/^(\s*)([-*+])\s+(.+)/);
      const orderedMatch = line.match(/^(\s*)(\d+\.)\s+(.+)/);

      if (unorderedMatch || orderedMatch) {
        const match = unorderedMatch || orderedMatch;
        const indent = match[1].length;
        const marker = match[2];
        const content = match[3];

        // Check indentation (should be multiples of 2 or 4)
        if (indent % 2 !== 0) {
          listIssues.push({
            line: index + 1,
            issue: 'List indentation should be multiples of 2 spaces',
            content: line.trim(),
            severity: 'warning',
          });
        }

        // Check for space after marker
        if (!line.match(/^(\s*)([-*+]|\d+\.)\s+/)) {
          listIssues.push({
            line: index + 1,
            issue: 'Missing space after list marker',
            content: line.trim(),
            severity: 'error',
          });
        }

        // Track list type consistency
        if (!inList) {
          inList = true;
          listType = unorderedMatch ? 'unordered' : 'ordered';
          previousIndent = indent;
        } else {
          // Check for consistent markers in unordered lists at same level
          if (listType === 'unordered' && indent === previousIndent) {
            const currentMarker = unorderedMatch ? unorderedMatch[2] : null;
            // Note: We allow different markers, but could enforce consistency
          }
        }

        previousIndent = indent;
      } else if (line.trim() === '') {
        // Empty line ends the list
        inList = false;
        listType = null;
        previousIndent = 0;
      } else if (inList && !line.match(/^\s*$/)) {
        // Non-list content ends the list
        inList = false;
        listType = null;
        previousIndent = 0;
      }
    });

    if (listIssues.length > 0) {
      this.issues.push({
        file: filePath,
        category: 'List Formatting',
        issues: listIssues,
      });
    }
  }

  /**
   * Check a single markdown file
   */
  checkFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      this.filesChecked++;

      const issuesBefore = this.issues.length;

      this.checkHeadingHierarchy(content, filePath);
      this.checkCodeBlocks(content, filePath);
      this.checkListFormatting(content, filePath);

      if (this.issues.length > issuesBefore) {
        this.filesWithIssues++;
      }
    } catch (error) {
      console.error(`${colors.red}Error reading file ${filePath}: ${error.message}${colors.reset}`);
    }
  }

  /**
   * Recursively find all markdown files
   */
  findMarkdownFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Skip node_modules and hidden directories
        if (!file.startsWith('.') && file !== 'node_modules') {
          this.findMarkdownFiles(filePath, fileList);
        }
      } else if (file.endsWith('.md')) {
        fileList.push(filePath);
      }
    });

    return fileList;
  }

  /**
   * Generate report
   */
  generateReport() {
    console.log(`\n${colors.cyan}=== Markdown Formatting Check Report ===${colors.reset}\n`);
    console.log(`Files checked: ${this.filesChecked}`);
    console.log(`Files with issues: ${this.filesWithIssues}`);
    console.log(`Total issues found: ${this.issues.reduce((sum, file) => sum + file.issues.length, 0)}\n`);

    if (this.issues.length === 0) {
      console.log(`${colors.green}✓ All markdown files have consistent formatting!${colors.reset}\n`);
      return true;
    }

    // Group issues by category
    const byCategory = {
      'Heading Hierarchy': [],
      'Code Blocks': [],
      'List Formatting': [],
    };

    this.issues.forEach(fileIssue => {
      if (!byCategory[fileIssue.category]) {
        byCategory[fileIssue.category] = [];
      }
      byCategory[fileIssue.category].push(fileIssue);
    });

    // Print issues by category
    Object.keys(byCategory).forEach(category => {
      const categoryIssues = byCategory[category];
      if (categoryIssues.length === 0) return;

      console.log(`${colors.yellow}${category} Issues:${colors.reset}`);
      console.log(`${'='.repeat(50)}\n`);

      categoryIssues.forEach(fileIssue => {
        console.log(`${colors.blue}File: ${fileIssue.file}${colors.reset}`);
        
        fileIssue.issues.forEach(issue => {
          const severity = issue.severity === 'error' ? colors.red : colors.yellow;
          const severityLabel = issue.severity === 'error' ? 'ERROR' : 'WARNING';
          
          console.log(`  ${severity}[${severityLabel}]${colors.reset} Line ${issue.line}: ${issue.issue}`);
          console.log(`    ${colors.cyan}${issue.content}${colors.reset}`);
        });
        
        console.log('');
      });
    });

    return false;
  }

  /**
   * Run the checker
   */
  run(directory) {
    console.log(`${colors.cyan}Checking markdown files in: ${directory}${colors.reset}\n`);

    const markdownFiles = this.findMarkdownFiles(directory);
    console.log(`Found ${markdownFiles.length} markdown files\n`);

    markdownFiles.forEach(file => {
      this.checkFile(file);
    });

    return this.generateReport();
  }
}

// Main execution
if (require.main === module) {
  const targetDir = process.argv[2] || '.';
  const checker = new MarkdownChecker();
  const success = checker.run(targetDir);
  
  process.exit(success ? 0 : 1);
}

module.exports = MarkdownChecker;
