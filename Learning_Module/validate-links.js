#!/usr/bin/env node

/**
 * Link Validation Script for Solana Learning Module
 * 
 * This script validates all internal markdown links in the Learning Module
 * to ensure they resolve to valid files and sections.
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

// Statistics
const stats = {
  filesScanned: 0,
  linksChecked: 0,
  brokenLinks: 0,
  validLinks: 0,
  warnings: 0,
};

// Store broken links for reporting
const brokenLinks = [];
const warnings = [];

/**
 * Get all markdown files recursively
 */
function getMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and hidden directories
      if (!file.startsWith('.') && file !== 'node_modules') {
        getMarkdownFiles(filePath, fileList);
      }
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Extract markdown links from content
 * Matches [text](link) and [text](link#anchor)
 */
function extractLinks(content) {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const links = [];
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    const text = match[1];
    const url = match[2];
    
    // Only process internal links (not http/https)
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      links.push({
        text,
        url,
        position: match.index,
      });
    }
  }
  
  return links;
}

/**
 * Extract headings from markdown content
 */
function extractHeadings(content) {
  const headingRegex = /^#{1,6}\s+(.+)$/gm;
  const headings = [];
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    const heading = match[1].trim();
    // Convert heading to anchor format (lowercase, replace spaces with hyphens, remove special chars)
    const anchor = heading
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    headings.push(anchor);
  }
  
  return headings;
}

/**
 * Validate a single link
 */
function validateLink(sourceFile, link) {
  stats.linksChecked++;
  
  const { url, text } = link;
  
  // Split URL into path and anchor
  const [linkPath, anchor] = url.split('#');
  
  // Resolve the target file path
  const sourceDir = path.dirname(sourceFile);
  let targetPath;
  
  if (linkPath === '') {
    // Same-file anchor link
    targetPath = sourceFile;
  } else {
    targetPath = path.resolve(sourceDir, linkPath);
  }
  
  // Check if target file exists
  if (!fs.existsSync(targetPath)) {
    stats.brokenLinks++;
    brokenLinks.push({
      source: sourceFile,
      link: url,
      text,
      reason: 'File not found',
    });
    return false;
  }
  
  // If there's an anchor, validate it exists in the target file
  if (anchor) {
    const targetContent = fs.readFileSync(targetPath, 'utf-8');
    const headings = extractHeadings(targetContent);
    
    if (!headings.includes(anchor)) {
      stats.warnings++;
      warnings.push({
        source: sourceFile,
        link: url,
        text,
        reason: `Anchor '#${anchor}' not found in target file`,
      });
      return false;
    }
  }
  
  stats.validLinks++;
  return true;
}

/**
 * Validate all links in a file
 */
function validateFile(filePath) {
  stats.filesScanned++;
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const links = extractLinks(content);
  
  links.forEach(link => {
    validateLink(filePath, link);
  });
}

/**
 * Print results
 */
function printResults() {
  console.log('\n' + '='.repeat(80));
  console.log(`${colors.cyan}Link Validation Results${colors.reset}`);
  console.log('='.repeat(80));
  
  console.log(`\n${colors.blue}Statistics:${colors.reset}`);
  console.log(`  Files scanned:    ${stats.filesScanned}`);
  console.log(`  Links checked:    ${stats.linksChecked}`);
  console.log(`  ${colors.green}Valid links:      ${stats.validLinks}${colors.reset}`);
  console.log(`  ${colors.red}Broken links:     ${stats.brokenLinks}${colors.reset}`);
  console.log(`  ${colors.yellow}Warnings:         ${stats.warnings}${colors.reset}`);
  
  if (brokenLinks.length > 0) {
    console.log(`\n${colors.red}Broken Links:${colors.reset}`);
    brokenLinks.forEach((item, index) => {
      console.log(`\n${index + 1}. ${colors.red}${item.reason}${colors.reset}`);
      console.log(`   Source: ${item.source}`);
      console.log(`   Link:   [${item.text}](${item.link})`);
    });
  }
  
  if (warnings.length > 0) {
    console.log(`\n${colors.yellow}Warnings (Missing Anchors):${colors.reset}`);
    warnings.forEach((item, index) => {
      console.log(`\n${index + 1}. ${colors.yellow}${item.reason}${colors.reset}`);
      console.log(`   Source: ${item.source}`);
      console.log(`   Link:   [${item.text}](${item.link})`);
    });
  }
  
  console.log('\n' + '='.repeat(80));
  
  if (stats.brokenLinks === 0 && stats.warnings === 0) {
    console.log(`${colors.green}✓ All links are valid!${colors.reset}\n`);
    return 0;
  } else {
    console.log(`${colors.red}✗ Found ${stats.brokenLinks} broken links and ${stats.warnings} warnings${colors.reset}\n`);
    return 1;
  }
}

/**
 * Main execution
 */
function main() {
  console.log(`${colors.cyan}Validating internal links in Solana Learning Module...${colors.reset}\n`);
  
  const moduleDir = __dirname;
  const markdownFiles = getMarkdownFiles(moduleDir);
  
  console.log(`Found ${markdownFiles.length} markdown files\n`);
  
  markdownFiles.forEach(file => {
    const relativePath = path.relative(moduleDir, file);
    process.stdout.write(`Checking ${relativePath}...`);
    validateFile(file);
    process.stdout.write(` ${colors.green}✓${colors.reset}\n`);
  });
  
  const exitCode = printResults();
  process.exit(exitCode);
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { validateLink, extractLinks, extractHeadings };
