# Example Programs Integration Plan

**Source**: `solana-example-program/program-examples/basics/`  
**Strategy**: Integrate into existing lessons  
**Date**: 2025

---

## Integration Mapping

### Lesson 1: Accounts and Programs

**Target**: `Learning_Module/basics/01-accounts-and-programs/README.md`

**Examples to Integrate**:

1. **hello-solana** - First Solana program
   - Location: Add to "Program Architecture" section
   - Purpose: Show simplest possible program
   - Implementations: Anchor, Native, Pinocchio

2. **account-data** - Working with account data
   - Location: Add to "Working with Accounts" section
   - Purpose: Reading and writing account data
   - Implementations: Anchor, Native, Pinocchio

3. **checking-accounts** - Account validation
   - Location: Add to "Account Validation" section
   - Purpose: Security checks and validation patterns
   - Implementations: Anchor, Native, Pinocchio

4. **counter** - Create and increment counters
   - Location: Enhance existing counter example
   - Purpose: Complete working example
   - Implementations: Anchor, Native, Pinocchio, MPL-Stack

5. **create-account** - System account creation
   - Location: Add to "Creating Accounts" section
   - Purpose: Show both CPI and direct methods
   - Implementations: Anchor, Native, Pinocchio

6. **close-account** - Closing accounts
   - Location: Add new "Closing Accounts" section
   - Purpose: Rent recovery and cleanup
   - Implementations: Anchor, Native, Pinocchio

7. **rent** - Rent management
   - Location: Enhance "Account Rent" section
   - Purpose: Rent calculation and exemption
   - Implementations: Anchor, Native, Pinocchio

8. **realloc** - Account reallocation
   - Location: Add to "Advanced Patterns" section
   - Purpose: Dynamic account sizing
   - Implementations: Anchor, Native, Pinocchio

9. **processing-instructions** - Instruction handling
   - Location: Add to "Instruction Processing" section
   - Purpose: Routing and handling multiple instructions
   - Implementations: Anchor, Native, Pinocchio

---

### Lesson 2: Transactions

**Target**: `Learning_Module/basics/02-transactions/README.md`

**Examples to Integrate**:

1. **transfer-sol** - SOL transfers
   - Location: Enhance existing transfer example
   - Purpose: Complete transfer implementation
   - Implementations: Anchor, Native, Pinocchio

---

### Lesson 4: PDAs

**Target**: `Learning_Module/basics/04-pdas/README.md`

**Examples to Integrate**:

1. **program-derived-addresses** - PDA examples
   - Location: Add to "PDA Derivation" section
   - Purpose: Complete PDA implementation
   - Implementations: Anchor, Native, Pinocchio

2. **pda-rent-payer** - PDA rent patterns
   - Location: Add to "Common PDA Patterns" section
   - Purpose: Using PDAs to pay rent
   - Implementations: Anchor, Native, Pinocchio

3. **cross-program-invocation** - CPI examples
   - Location: Enhance "Cross-Program Invocations" section
   - Purpose: Complete CPI implementation
   - Implementations: Anchor, Native

4. **favorites** - User favorites storage
   - Location: Add to "Real-World Example" section
   - Purpose: Practical PDA usage
   - Implementations: Anchor, Native, Pinocchio

---

### Lesson 5: Anchor Framework

**Target**: `Learning_Module/basics/05-anchor-framework/README.md`

**Examples to Integrate**:

1. **repository-layout** - Project structure
   - Location: Add to "Getting Started" section
   - Purpose: Standard Anchor project layout
   - Implementations: Anchor, Native

---

## Integration Format

For each example, we'll add:

### 1. Overview Section
```markdown
## Example: [Name]

**Source**: [Link to example in repository]  
**Implementations**: Anchor | Native | Pinocchio

[Brief description of what the example demonstrates]
```

### 2. Code Tabs (Multiple Implementations)
```markdown
### Anchor Implementation

[Anchor code with explanations]

### Native Implementation

[Native Rust code with explanations]

### Pinocchio Implementation (Optional)

[Pinocchio code with explanations]
```

### 3. Key Takeaways
```markdown
**Key Concepts Demonstrated**:
- Concept 1
- Concept 2
- Concept 3

**Best Practices**:
- Practice 1
- Practice 2
```

### 4. Try It Yourself
```markdown
**Try It Yourself**:
1. Clone the repository
2. Navigate to the example
3. Run the tests
4. Modify and experiment

```bash
git clone https://github.com/solana-developers/program-examples
cd program-examples/basics/[example-name]/anchor
anchor test
```
```

---

## Implementation Priority

### Phase 1: High-Value Examples (Immediate)
1. **counter** - Enhance existing example in Lesson 1
2. **create-account** - Add to Lesson 1
3. **transfer-sol** - Enhance existing example in Lesson 2
4. **program-derived-addresses** - Add to Lesson 4
5. **cross-program-invocation** - Enhance existing CPI section in Lesson 4

### Phase 2: Core Concepts (Next)
6. **hello-solana** - Add to Lesson 1 intro
7. **account-data** - Add to Lesson 1
8. **checking-accounts** - Add to Lesson 1
9. **processing-instructions** - Add to Lesson 1
10. **pda-rent-payer** - Add to Lesson 4

### Phase 3: Advanced Patterns (Later)
11. **close-account** - Add to Lesson 1
12. **rent** - Enhance Lesson 1
13. **realloc** - Add to Lesson 1
14. **favorites** - Add to Lesson 4
15. **repository-layout** - Add to Lesson 5

---

## Benefits

### 1. Multiple Implementation Styles
- **Anchor**: Modern, high-level framework
- **Native**: Low-level, full control
- **Pinocchio**: Alternative framework perspective

### 2. Complete Working Examples
- Full program code
- Test files
- Client interaction code
- Deployment scripts

### 3. Hands-On Learning
- Clone and run immediately
- Modify and experiment
- See real-world patterns

### 4. Progressive Complexity
- Start with hello-solana
- Build to complex patterns
- Multiple approaches shown

---

## Source Attribution

All examples sourced from:
- **Repository**: https://github.com/solana-developers/program-examples
- **Path**: `program-examples/basics/`
- **License**: Apache 2.0 (verify in repository)
- **Maintainer**: Solana Foundation

---

## Next Steps

1. Start with Phase 1 high-value examples
2. Add code with clear explanations
3. Include "Try It Yourself" sections
4. Link to full source code
5. Add to exercises for practice

---

*This integration will significantly enhance the Learning Module with production-ready, tested example code from the official Solana program examples repository.*

