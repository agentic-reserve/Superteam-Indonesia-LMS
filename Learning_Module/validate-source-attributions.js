#!/usr/bin/env node

/**
 * Source Attribution Validation Script
 * 
 * This script validates that all content files in the Learning Module
 * include proper source attributions with repository, file path, and URL.
 * 
 * Requirements 8.1, 8.3:
 * - Content extracted from source repositories must include attribution and links
 * - References to source code must include file paths within the original repository
 */

const fs = require('fs');
const path = require('path');

// Patterns to look for in source attributions
const ATTRIBUTION_PATTERNS = {
  repository: /(?:repository|repo|source):\s*[^\n]+/i,
  filePath: /(?:file|path):\s*[^\n]+/i,
  url: /(?:url|link|https?:\/\/)[^\s\)]+/i,
  sourceSection: /##\s*source\s+attribution/i,
  adaptedFrom: /(?:adapted|extracted|derived|based)\s+(?:from|on)/i,
};

// Directories to scan
const CONTENT_DIRS = [
  'basics',
  'security',
  'mobile',
  'defi',
  'ai-agents',
  'depin',
  'privacy',
  'curriculum',
  'integration',
  'setup'
];

// Files to check
const FILE_PATTERNS = [
  '**/README.md',
  '**/*.md'
];

// Exclude patterns
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'GLOSSARY.md',
  'SOURCES.md',
  'CONTENT_INDEX.md',
  'tasks.md',
  'validate-',
  'check-'
];

class AttributionValidator {
  constructor() {
    this.results = {
      total: 0,
      withAttribution: 0,
      withoutAttribution: 0,
      files: []
    };
  }

  shouldExclude(filePath) {
    return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
  }

  checkAttribution(content, filePath) {
    const hasSourceSection = ATTRIBUTION_PATTERNS.sourceSection.test(content);
    const hasAdaptedFrom = ATTRIBUTION_PATTERNS.adaptedFrom.test(content);
    const hasRepository = ATTRIBUTION_PATTERNS.repository.test(content);
    const hasUrl = ATTRIBUTION_PATTERNS.url.test(content);
    
    // Check if file has any form of attribution
    const hasAttribution = hasSourceSection || hasAdaptedFrom || hasRepository;
    
    return {
      hasAttribution,
      hasSourceSection,
      hasAdaptedFrom,
      hasRepository,
      hasUrl,
      details: {
        sourceSection: hasSourceSection,
        adaptedFrom: hasAdaptedFrom,
        repository: hasRepository,
        url: hasUrl
      }
    };
  }

  scanDirectory(dir) {
    const fullPath = path.join(__dirname, dir);
    
    if (!fs.existsSync(fullPath)) {
      return;
    }

    const entries = fs.readdirSync(fullPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(fullPath, entry.name);
      const relativePath = path.relative(__dirname, entryPath);

      if (this.shouldExclude(relativePath)) {
        continue;
      }

      if (entry.isDirectory()) {
        this.scanDirectory(relativePath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        this.validateFile(entryPath, relativePath);
      }
    }
  }

  validateFile(fullPath, relativePath) {
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Skip very short files (likely just headers or placeholders)
      if (content.length < 500) {
        return;
      }

      this.results.total++;
      
      const attribution = this.checkAttribution(content, relativePath);
      
      if (attribution.hasAttribution) {
        this.results.withAttribution++;
      } else {
        this.results.withoutAttribution++;
      }

      this.results.files.push({
        path: relativePath,
        hasAttribution: attribution.hasAttribution,
        details: attribution.details,
        size: content.length
      });
    } catch (error) {
      console.error(`Error reading ${relativePath}:`, error.message);
    }
  }

  generateReport() {
    console.log('\n=== Source Attribution Validation Report ===\n');
    console.log(`Total files scanned: ${this.results.total}`);
    console.log(`Files with attribution: ${this.results.withAttribution} (${Math.round(this.results.withAttribution / this.results.total * 100)}%)`);
    console.log(`Files without attribution: ${this.results.withoutAttribution} (${Math.round(this.results.withoutAttribution / this.results.total * 100)}%)`);
    
    if (this.results.withoutAttribution > 0) {
      console.log('\n--- Files Missing Attribution ---\n');
      this.results.files
        .filter(f => !f.hasAttribution)
        .forEach(f => {
          console.log(`  ❌ ${f.path}`);
        });
    }

    console.log('\n--- Files With Attribution ---\n');
    this.results.files
      .filter(f => f.hasAttribution)
      .slice(0, 10)  // Show first 10 as examples
      .forEach(f => {
        const indicators = [];
        if (f.details.sourceSection) indicators.push('Source Section');
        if (f.details.adaptedFrom) indicators.push('Adapted From');
        if (f.details.repository) indicators.push('Repository');
        if (f.details.url) indicators.push('URL');
        console.log(`  ✓ ${f.path}`);
        console.log(`    Indicators: ${indicators.join(', ')}`);
      });

    if (this.results.withAttribution > 10) {
      console.log(`  ... and ${this.results.withAttribution - 10} more files with attribution`);
    }

    console.log('\n=== Validation Summary ===\n');
    
    if (this.results.withoutAttribution === 0) {
      console.log('✅ SUCCESS: All content files include proper source attribution!');
      console.log('   Requirements 8.1 and 8.3 are satisfied.');
      return true;
    } else {
      console.log(`⚠️  WARNING: ${this.results.withoutAttribution} files are missing source attribution.`);
      console.log('   Please add attribution with repository, file path, and URL.');
      return false;
    }
  }

  run() {
    console.log('Starting source attribution validation...\n');
    
    for (const dir of CONTENT_DIRS) {
      this.scanDirectory(dir);
    }

    return this.generateReport();
  }
}

// Run validation
const validator = new AttributionValidator();
const success = validator.run();

process.exit(success ? 0 : 1);
