# Rust Basics Module - Validation Scripts

This directory contains validation scripts for the Rust Basics Learning Module. These scripts use property-based testing to ensure the module structure and content meet all requirements.

## Quick Start

```bash
# Install dependencies
npm install

# Run all validations
npm run validate:all

# Or run individual validations
npm run validate:structure  # Check directory structure and naming
npm run validate:content    # Check markdown structure and sections
npm run validate:exercises  # Check exercise structure
npm run validate:links      # Check navigation links
```

## Installation

Install dependencies:

```bash
npm install
```

## Running Validations

### Structure Validation

Validates directory structure, naming conventions, and bilingual file pairs:

```bash
npm run validate:structure
```

This script checks:
- **Property 1: Lesson Directory Naming Convention** - All lesson directories follow the pattern `\d{2}-[a-z-]+`
- **Property 2: Bilingual File Pairs** - Every README.md has a corresponding README_ID.md and vice versa

### Content Validation

Validates markdown structure, language navigation links, and required sections:

```bash
npm run validate:content
```

This script checks:
- **Property 3: Parallel Markdown Structure** - Bilingual file pairs have matching heading structures
- **Property 4: Language Navigation Links** - Each document links to its counterpart in the other language
- **Property 5: Required Lesson Sections** - All lessons contain required sections (Overview, Learning Objectives, Prerequisites, Best Practices/Common Mistakes, Next Steps, Source Attribution)

### Exercise Validation

Validates exercise structure, bilingual instructions, lesson references, and validation criteria:

```bash
npm run validate:exercises
```

This script checks:
- **Property 6: Exercise Bilingual Instructions** - All exercises have both README.md and README_ID.md
- **Property 7: Exercise Lesson References** - Each exercise references at least one lesson
- **Property 8: Exercise Validation Criteria** - Each exercise contains validation criteria or expected outputs

### Navigation Validation

Validates lesson navigation completeness and consistency:

```bash
npm run validate:navigation
# or
npm run validate:links
```

This script checks:
- **Property 9: Lesson Navigation Completeness** - All lessons (except first and last) have both previous and next navigation links
- **Navigation Consistency** - Navigation links are bidirectional and consistent across lessons

### Run All Validations

```bash
npm run validate:all
```

## Property-Based Testing

All validation scripts use property-based testing with a minimum of 100 iterations per test. This ensures that properties hold across all possible inputs, not just specific test cases.

The scripts are configured to run `Math.max(100, dataSize)` iterations, meaning:
- If there are fewer than 100 items to test, it will still run 100 iterations
- If there are more than 100 items, it will test all of them

This configuration ensures comprehensive validation while maintaining reasonable execution time.

### What is Property-Based Testing?

Property-based testing verifies that certain properties (invariants) hold true for all valid inputs. Instead of testing specific examples, it generates many random test cases to verify universal properties.

For example:
- **Unit Test**: "The directory `01-fundamentals` follows naming convention"
- **Property Test**: "ALL lesson directories follow naming convention" (tested with 100+ examples)

## Validation Properties

### Property 1: Lesson Directory Naming Convention

**Validates: Requirements 1.4**

For any lesson directory in the rust-basics module, the directory name should match the pattern `\d{2}-[a-z-]+` (two digits, hyphen, lowercase words separated by hyphens).

Examples:
- ✓ `01-fundamentals`
- ✓ `02-ownership-borrowing`
- ✗ `1-fundamentals` (missing leading zero)
- ✗ `01-Fundamentals` (uppercase letters)
- ✗ `01_fundamentals` (underscore instead of hyphen)

### Property 2: Bilingual File Pairs

**Validates: Requirements 2.1**

For any directory in the rust-basics module, if a README.md file exists, then a README_ID.md file must also exist in the same directory, and vice versa.

This ensures all content is available in both English and Bahasa Indonesia.

### Property 3: Parallel Markdown Structure

**Validates: Requirements 2.2**

For any pair of bilingual lesson files (README.md and README_ID.md), both files should have the same markdown heading structure (same heading levels and same number of headings at each level).

This ensures that the content structure is consistent across languages, making it easier to maintain and navigate.

### Property 4: Language Navigation Links

**Validates: Requirements 2.5**

For any bilingual document pair in the rust-basics module, each document should contain a navigation link to its counterpart in the other language.

Examples:
- English files should link to README_ID.md
- Indonesian files should link to README.md
- Typically formatted as: `**Language:** [English](README.md) | [Bahasa Indonesia](README_ID.md)`

### Property 5: Required Lesson Sections

**Validates: Requirements 4.1, 4.2, 4.3, 4.5, 4.6, 4.7**

For any lesson README file in the rust-basics module, the document should contain all required section headings:
- **Overview** - Brief description of the lesson topic
- **Learning Objectives** - Specific, measurable outcomes
- **Prerequisites** - Required prior knowledge
- **Best Practices** OR **Common Mistakes** - Practical guidance (at least one required)
- **Next Steps** - Navigation to related content
- **Source Attribution** - References to official documentation

The validation supports both English and Indonesian section names.

### Property 6: Exercise Bilingual Instructions

**Validates: Requirements 5.2**

For any exercise directory in the rust-basics module, both README.md and README_ID.md files should exist.

This ensures all exercise instructions are available in both English and Bahasa Indonesia.

### Property 7: Exercise Lesson References

**Validates: Requirements 5.4**

For any exercise README file, the document should contain at least one reference (link or mention) to a lesson directory in the rust-basics module.

This ensures learners can easily find the relevant lesson content that covers the concepts needed for the exercise.

Examples:
- ✓ `[Lesson 01: Fundamentals](../../01-fundamentals/README.md)`
- ✓ `covered in 02-ownership-borrowing`
- ✗ No lesson references found

### Property 8: Exercise Validation Criteria

**Validates: Requirements 5.3**

For any exercise README file, the document should contain a section describing validation criteria, expected outputs, or success conditions.

This ensures learners know how to verify their solution is correct.

Examples of valid validation indicators:
- A "Validation Criteria" section
- An "Expected Output" section
- Text like "Your solution is correct when..."
- Checkmarks (✅ or ✓) listing success conditions

### Property 9: Lesson Navigation Completeness

**Validates: Requirements 9.4**

For any lesson (except the first and last), the lesson README should contain navigation links to both the previous and next lessons.

This ensures learners can easily navigate through the module in a logical sequence.

Required navigation elements:
- **Previous** link (or **Sebelumnya** in Indonesian) - Points to the previous lesson
- **Next** link (or **Selanjutnya** in Indonesian) - Points to the next lesson
- **Module Home** link (or **Beranda Modul** in Indonesian) - Points back to the module home

Examples:
```markdown
**Previous**: [Fundamentals](../01-fundamentals/README.md)  
**Next**: [Structs and Enums](../03-structs-enums/README.md)  
**Module Home**: [Rust Basics](../README.md)
```

The validation also checks for consistency - if lesson A links to lesson B as "next", then lesson B should link to lesson A as "previous".

## Exit Codes

- `0`: All validations passed
- `1`: One or more validations failed

## CI/CD Integration

These scripts can be integrated into CI/CD pipelines to automatically validate content changes.

### GitHub Actions

Example workflow file (`.github/workflows/validate-rust-basics.yml`):

```yaml
name: Validate Rust Basics Module

on:
  push:
    paths:
      - 'Learning_Module/rust-basics/**'
  pull_request:
    paths:
      - 'Learning_Module/rust-basics/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install validation dependencies
        run: cd Learning_Module/rust-basics/validation && npm install
      
      - name: Run all validations
        run: cd Learning_Module/rust-basics/validation && npm run validate:all
```

### GitLab CI

Example `.gitlab-ci.yml` configuration:

```yaml
validate-rust-basics:
  stage: test
  image: node:18
  only:
    changes:
      - Learning_Module/rust-basics/**
  script:
    - cd Learning_Module/rust-basics/validation
    - npm install
    - npm run validate:all
```

### Pre-commit Hook

Example pre-commit hook (`.git/hooks/pre-commit`):

```bash
#!/bin/bash

# Check if rust-basics files were modified
if git diff --cached --name-only | grep -q "Learning_Module/rust-basics/"; then
  echo "Running Rust Basics validation..."
  cd Learning_Module/rust-basics/validation
  npm install --silent
  npm run validate:all
  
  if [ $? -ne 0 ]; then
    echo "Validation failed. Please fix the issues before committing."
    exit 1
  fi
fi
```

### Running Individual Validations

You can run individual validation scripts for faster feedback during development:

```bash
# Quick structure check
npm run validate:structure

# Check content quality
npm run validate:content

# Verify exercises
npm run validate:exercises

# Check navigation links
npm run validate:links
# or
npm run validate:navigation
```

## Troubleshooting

### "Module not found" errors

Make sure you've installed dependencies:
```bash
npm install
```

### Validation failures

Review the output carefully. The script will show:
- Which property failed
- Specific examples that violated the property
- Expected vs actual values

Fix the issues and run the validation again.

## Adding New Validations

To add new validation properties:

1. Create a new validation function following the pattern:
   ```javascript
   function validateNewProperty() {
     console.log('=== Property N: Description ===');
     const property = fc.property(
       fc.constantFrom(...testData),
       (input) => {
         // Test logic here
         return isValid;
       }
     );
     fc.assert(property, { numRuns: 100 });
   }
   ```

2. Add the validation to the `main()` function
3. Update this README with the new property description

## References

- [fast-check documentation](https://github.com/dubzzz/fast-check)
- [Property-Based Testing Guide](https://hypothesis.works/articles/what-is-property-based-testing/)
