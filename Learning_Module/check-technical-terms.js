#!/usr/bin/env node

/**
 * Technical Term Checker
 * 
 * Scans all markdown files in the Learning_Module to identify technical terms
 * that should either be defined inline or reference the glossary.
 * 
 * Requirements 11.5, 11.6
 */

const fs = require('fs');
const path = require('path');

// Load glossary terms from GLOSSARY.md
function loadGlossaryTerms(glossaryPath) {
  const content = fs.readFileSync(glossaryPath, 'utf-8');
  const terms = new Set();
  
  // Extract terms from glossary (look for **Term** patterns)
  const termRegex = /\*\*([^*]+)\*\*/g;
  let match;
  while ((match = termRegex.exec(content)) !== null) {
    const term = match[1].trim();
    // Remove parenthetical translations
    const cleanTerm = term.replace(/\s*\([^)]+\)/, '');
    terms.add(cleanTerm.toLowerCase());
  }
  
  return terms;
}

// Technical terms that should be defined or referenced
const TECHNICAL_TERMS = [
  // Solana core concepts
  'account', 'program', 'transaction', 'instruction', 'signer',
  'lamport', 'sol', 'rent', 'rent-exempt', 'slot', 'epoch',
  'pda', 'program derived address', 'cpi', 'cross-program invocation',
  'bpf', 'berkeley packet filter', 'spl', 'solana program library',
  'anchor', 'anchor framework', 'borsh', 'blockhash', 'commitment level',
  
  // Tokens
  'spl token', 'token account', 'mint', 'associated token account', 'ata',
  'token program', 'token-2022', 'token extensions',
  
  // DeFi
  'amm', 'automated market maker', 'liquidity pool', 'slippage',
  'perpetual', 'perpetual futures', 'funding rate', 'margin', 'leverage',
  'liquidation', 'mark price', 'oracle', 'chainlink', 'pyth',
  'initial margin', 'maintenance margin', 'adl', 'auto-deleveraging',
  
  // Privacy & ZK
  'zero-knowledge proof', 'zk proof', 'zk compression', 'merkle tree',
  'validity proof', 'nullifier', 'light protocol', 'compressed account',
  'state tree', 'address tree', 'groth16', 'snark',
  
  // Mobile
  'wallet adapter', 'mobile wallet adapter', 'mwa', 'solana pay',
  'react native', 'expo', 'deep link',
  
  // AI Agents
  'ai agent', 'llm', 'language model', 'react pattern', 'tool calling',
  'mcp', 'model context protocol', 'langgraph', 'solana agent kit',
  
  // DePIN
  'depin', 'iot', 'internet of things', 'lorawan', 'raspberry pi',
  'data anchoring', 'sensor', 'hardware wallet',
  
  // Security
  'fuzzing', 'trident', 'poc', 'proof of concept', 'vulnerability',
  'overflow', 'underflow', 'reentrancy', 'signer check',
  'post-quantum', 'winternitz', 'hash-based signature', 'liboqs',
  
  // Development
  'devnet', 'testnet', 'mainnet', 'rpc', 'websocket', 'faucet',
  'keypair', 'public key', 'private key', 'signature',
];

// Find all markdown files
function findMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and hidden directories
      if (!file.startsWith('.') && file !== 'node_modules') {
        findMarkdownFiles(filePath, fileList);
      }
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Check if a term is defined inline or references glossary
function checkTermDefinition(content, term, filePath) {
  const issues = [];
  
  // Create regex to find the term (case-insensitive, word boundaries)
  const termRegex = new RegExp(`\\b${term}\\b`, 'gi');
  const matches = content.match(termRegex);
  
  if (!matches) return issues;
  
  // Check if term is defined inline (has a definition nearby)
  const definitionPatterns = [
    new RegExp(`${term}[^.]*?is\\s+(?:a|an|the)`, 'i'),
    new RegExp(`${term}[^.]*?refers\\s+to`, 'i'),
    new RegExp(`${term}[^.]*?means`, 'i'),
    new RegExp(`\\*\\*${term}\\*\\*[^:]*:`, 'i'),
  ];
  
  const hasInlineDefinition = definitionPatterns.some(pattern => 
    pattern.test(content)
  );
  
  // Check if glossary is referenced
  const hasGlossaryReference = /glossary|glosarium/i.test(content);
  
  // If term appears but no definition or glossary reference
  if (!hasInlineDefinition && !hasGlossaryReference) {
    issues.push({
      file: filePath,
      term: term,
      occurrences: matches.length,
      suggestion: 'Add inline definition or reference to glossary'
    });
  }
  
  return issues;
}

// Main function
function main() {
  const rootDir = __dirname;
  const glossaryPath = path.join(rootDir, 'GLOSSARY.md');
  
  console.log('Loading glossary terms...');
  const glossaryTerms = loadGlossaryTerms(glossaryPath);
  console.log(`Found ${glossaryTerms.size} terms in glossary\n`);
  
  console.log('Scanning markdown files...');
  const markdownFiles = findMarkdownFiles(rootDir);
  console.log(`Found ${markdownFiles.length} markdown files\n`);
  
  const allIssues = [];
  const missingGlossaryTerms = new Set();
  
  // Check each file
  markdownFiles.forEach(filePath => {
    // Skip the glossary itself and generated reports
    if (filePath.includes('GLOSSARY.md') || 
        filePath.includes('_REPORT.md') ||
        filePath.includes('check-')) {
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(rootDir, filePath);
    
    // Check for technical terms
    TECHNICAL_TERMS.forEach(term => {
      const termLower = term.toLowerCase();
      const termRegex = new RegExp(`\\b${term}\\b`, 'i');
      
      if (termRegex.test(content)) {
        // Check if term is in glossary
        if (!glossaryTerms.has(termLower)) {
          missingGlossaryTerms.add(term);
        }
        
        // Check if term is properly defined/referenced
        const issues = checkTermDefinition(content, term, relativePath);
        allIssues.push(...issues);
      }
    });
  });
  
  // Generate report
  console.log('='.repeat(80));
  console.log('TECHNICAL TERM DEFINITION REVIEW');
  console.log('='.repeat(80));
  console.log();
  
  // Report missing glossary terms
  if (missingGlossaryTerms.size > 0) {
    console.log('MISSING FROM GLOSSARY:');
    console.log('-'.repeat(80));
    Array.from(missingGlossaryTerms).sort().forEach(term => {
      console.log(`  - ${term}`);
    });
    console.log();
  }
  
  // Report files with undefined terms
  if (allIssues.length > 0) {
    console.log('FILES WITH UNDEFINED TERMS:');
    console.log('-'.repeat(80));
    
    // Group by file
    const issuesByFile = {};
    allIssues.forEach(issue => {
      if (!issuesByFile[issue.file]) {
        issuesByFile[issue.file] = [];
      }
      issuesByFile[issue.file].push(issue);
    });
    
    Object.keys(issuesByFile).sort().forEach(file => {
      console.log(`\n${file}:`);
      issuesByFile[file].forEach(issue => {
        console.log(`  - "${issue.term}" (${issue.occurrences} occurrences)`);
        console.log(`    ${issue.suggestion}`);
      });
    });
    console.log();
  }
  
  // Group issues by file
  const issuesByFile = {};
  allIssues.forEach(issue => {
    if (!issuesByFile[issue.file]) {
      issuesByFile[issue.file] = [];
    }
    issuesByFile[issue.file].push(issue);
  });
  
  // Summary
  console.log('='.repeat(80));
  console.log('SUMMARY:');
  console.log(`  Files scanned: ${markdownFiles.length}`);
  console.log(`  Terms in glossary: ${glossaryTerms.size}`);
  console.log(`  Missing from glossary: ${missingGlossaryTerms.size}`);
  console.log(`  Files with issues: ${Object.keys(issuesByFile).length}`);
  console.log('='.repeat(80));
  
  // Save report
  const reportPath = path.join(rootDir, 'TECHNICAL_TERMS_REPORT.md');
  let report = '# Technical Terms Review Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  report += `- Files scanned: ${markdownFiles.length}\n`;
  report += `- Terms in glossary: ${glossaryTerms.size}\n`;
  report += `- Missing from glossary: ${missingGlossaryTerms.size}\n`;
  report += `- Files with issues: ${Object.keys(issuesByFile || {}).length}\n\n`;
  
  if (missingGlossaryTerms.size > 0) {
    report += `## Terms Missing from Glossary\n\n`;
    Array.from(missingGlossaryTerms).sort().forEach(term => {
      report += `- ${term}\n`;
    });
    report += '\n';
  }
  
  fs.writeFileSync(reportPath, report);
  console.log(`\nReport saved to: ${reportPath}`);
}

main();
