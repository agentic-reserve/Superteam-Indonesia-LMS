# Beginner Curriculum

Welcome to the beginner level! This curriculum introduces you to fundamental Solana concepts and prepares you for building your first blockchain applications.

## Overview

The beginner curriculum focuses on core Solana concepts that every developer needs to understand. You'll learn about accounts, programs, transactions, tokens, and program-derived addresses (PDAs). Each section builds on previous concepts, so we recommend following the sequence below.

**Total Estimated Time**: 25-36 hours (40-56 hours if including optional Rust Basics)  
**Prerequisites**: Basic programming knowledge (any language)  
**Outcome**: Ability to create simple Solana programs and interact with the blockchain

## Learning Sequence

### Phase 0: Rust Fundamentals (Optional but Recommended, 15-20 hours)

If you're new to Rust or need a refresher, start with the Rust Basics module:

#### [Rust Basics for Solana Development](../../rust-basics/README.md) (15-20 hours)

**Why Learn Rust First?**
Solana programs are written in Rust, and understanding Rust's core concepts—especially ownership, borrowing, and type safety—is crucial for building secure and efficient blockchain applications.

**Key Concepts**:
- Variables, data types, and functions
- Ownership, borrowing, and lifetimes
- Structs, enums, and pattern matching
- Error handling with Result and Option
- Traits and generics
- Modules and Cargo

**Learning Objectives**:
- Master Rust fundamentals needed for Solana development
- Understand ownership and borrowing patterns
- Handle errors effectively using Rust idioms
- Apply Rust concepts to Solana-specific patterns

**Estimated Time**: 15-20 hours

**Checkpoint**: You should be comfortable reading and writing Rust code, understand ownership rules, and be able to work with Result and Option types.

**Note**: If you're already comfortable with Rust, you can skip this phase and proceed directly to Phase 1.

---

### Phase 1: Environment Setup (2-3 hours)

Before diving into Solana concepts, set up your development environment:

1. **[Solana CLI Setup](../../setup/solana-cli.md)** (45 min)
   - Install Solana CLI tools
   - Configure network settings
   - Create and fund a devnet wallet

2. **[Rust and Anchor Setup](../../setup/rust-anchor.md)** (60 min)
   - Install Rust toolchain
   - Set up Anchor framework
   - Initialize your first project

3. **[TypeScript and Node.js Setup](../../setup/typescript-node.md)** (45 min)
   - Install Node.js and package managers
   - Set up web3.js and Anchor client libraries
   - Configure your development environment

**Checkpoint**: You should be able to run `solana --version`, `anchor --version`, and `node --version` successfully.

---

### Phase 2: Accounts and Programs (5-7 hours)

Learn the fundamental building blocks of Solana applications.

#### [01 - Accounts and Programs](../../basics/01-accounts-and-programs/README.md) (5-7 hours)

**Key Concepts**:
- Solana's account model and how it differs from other blockchains
- Program structure and execution
- Account ownership and data storage
- Rent and account lifecycle

**Learning Objectives**:
- Understand how Solana stores data in accounts
- Learn the relationship between programs and accounts
- Create basic programs that read and write account data
- Manage account rent and storage

**Exercises**:
- Create a simple program that stores data
- Read account data from the blockchain
- Understand account ownership rules

**Estimated Time**: 5-7 hours

**Checkpoint**: You should understand the difference between program accounts and data accounts, and be able to explain how rent works.

---

### Phase 3: Transactions (4-5 hours)

Master the mechanics of how operations are executed on Solana.

#### [02 - Transactions](../../basics/02-transactions/README.md) (4-5 hours)

**Key Concepts**:
- Transaction structure and anatomy
- Instructions and instruction data
- Transaction signing and verification
- Transaction fees and compute units

**Learning Objectives**:
- Build and submit transactions to the network
- Understand instruction ordering and atomicity
- Handle transaction errors and retries
- Optimize transaction costs

**Exercises**:
- Build a multi-instruction transaction
- Sign transactions with multiple signers
- Handle transaction confirmation

**Estimated Time**: 4-5 hours

**Checkpoint**: You should be able to construct, sign, and submit transactions programmatically, and understand why transactions might fail.

---

### Phase 4: Tokens (4-6 hours)

Learn about Solana's token standard and how to work with fungible tokens.

#### [03 - Tokens](../../basics/03-tokens/README.md) (4-6 hours)

**Key Concepts**:
- SPL Token program and token standard
- Token mints and token accounts
- Token creation, minting, and transfers
- Token metadata and extensions

**Learning Objectives**:
- Create new token types (mints)
- Mint tokens to accounts
- Transfer tokens between accounts
- Query token balances and metadata

**Exercises**:
- Create your own token
- Mint tokens to multiple accounts
- Implement token transfer functionality

**Estimated Time**: 4-6 hours

**Checkpoint**: You should be able to create a token, mint supply, and transfer tokens between accounts.

---

### Phase 5: Program Derived Addresses (5-7 hours)

Understand PDAs, one of Solana's most powerful features for program design.

#### [04 - PDAs (Program Derived Addresses)](../../basics/04-pdas/README.md) (5-7 hours)

**Key Concepts**:
- What PDAs are and why they're important
- PDA derivation and seeds
- Cross-Program Invocations (CPI) with PDAs
- Common PDA patterns and use cases

**Learning Objectives**:
- Derive PDAs deterministically
- Use PDAs for program-controlled accounts
- Implement common PDA patterns
- Understand PDA security considerations

**Exercises**:
- Derive PDAs with different seed combinations
- Create a program that uses PDAs for state management
- Implement a PDA-based escrow pattern

**Estimated Time**: 5-7 hours

**Checkpoint**: You should understand how PDAs enable programs to "sign" for accounts and be able to implement basic PDA patterns.

---

### Phase 6: Anchor Framework (3-4 hours)

Learn to use Anchor, the most popular framework for building Solana programs efficiently.

#### [05 - Anchor Framework](../../basics/05-anchor-framework/README.md) (3-4 hours)

**Key Concepts**:
- Anchor architecture and benefits
- Account constraints and validation
- Cross-Program Invocations with Anchor
- Testing and IDL generation
- Deployment and upgrades

**Learning Objectives**:
- Build programs using Anchor's declarative syntax
- Use account constraints for automatic validation
- Write tests using Anchor's testing framework
- Deploy and upgrade Anchor programs

**Exercises**:
- Convert a native Solana program to Anchor
- Build a task manager with Anchor
- Write comprehensive tests for Anchor programs

**Estimated Time**: 3-4 hours

**Checkpoint**: You should be able to build Solana programs using Anchor and understand how it simplifies development.

---

### Phase 7: Practice and Integration (2-4 hours)

Apply what you've learned through comprehensive exercises.

#### [Basics Exercises](../../basics/exercises/README.md) (2-4 hours)

Complete hands-on exercises that integrate concepts from all beginner topics:

- Build a simple counter program
- Create a token-based voting system
- Implement a basic escrow program
- Build a simple on-chain registry

**Estimated Time**: 2-4 hours

**Checkpoint**: You should be able to build simple but complete Solana programs that combine accounts, transactions, tokens, PDAs, and Anchor.

---

## Concept Progression

Each section builds on previous knowledge:

```
(Optional) Rust Basics
    ↓
Environment Setup
    ↓
Accounts & Programs (foundation)
    ↓
Transactions (how to interact)
    ↓
Tokens (standard functionality)
    ↓
PDAs (advanced patterns)
    ↓
Anchor Framework (modern development)
    ↓
Integrated Exercises
```

## Time Estimates by Section

| Section | Estimated Time | Cumulative Time |
|---------|---------------|-----------------|
| Rust Basics (Optional) | 15-20 hours | 15-20 hours |
| Environment Setup | 2-3 hours | 17-23 hours (or 2-3 hours) |
| Accounts and Programs | 5-7 hours | 22-30 hours (or 7-10 hours) |
| Transactions | 4-5 hours | 26-35 hours (or 11-15 hours) |
| Tokens | 4-6 hours | 30-41 hours (or 15-21 hours) |
| PDAs | 5-7 hours | 35-48 hours (or 20-28 hours) |
| Anchor Framework | 3-4 hours | 38-52 hours (or 23-32 hours) |
| Practice Exercises | 2-4 hours | 40-56 hours (or 25-36 hours) |

*Note: Times in parentheses show cumulative time if skipping the optional Rust Basics module.*

## Learning Tips

1. **Follow the sequence**: Each section assumes knowledge from previous sections
2. **Complete exercises**: Hands-on practice is essential for understanding
3. **Experiment**: Try modifying examples to see what happens
4. **Use devnet**: Always test on devnet before moving to mainnet
5. **Ask questions**: Use the troubleshooting guide when stuck
6. **Build projects**: Apply concepts by building small projects

## Prerequisites Check

Before starting, ensure you have:

- [ ] Basic programming experience (any language)
- [ ] Familiarity with command-line interfaces
- [ ] Understanding of basic data structures (arrays, objects)
- [ ] Willingness to learn Rust syntax (we'll guide you)

## What's Next?

After completing the beginner curriculum, you can:

1. **Continue to Intermediate**: Move to [intermediate curriculum](../intermediate/README.md) for security, mobile, or DePIN topics
2. **Specialize**: Choose a [learning path](../learning-paths/) based on your interests
3. **Build Projects**: Apply your knowledge to real-world projects
4. **Explore Advanced Topics**: Dive into [advanced curriculum](../advanced/README.md) for DeFi, AI agents, or privacy

## Additional Resources

- **[Glossary](../../GLOSSARY.md)**: Reference for Solana terminology
- **[Troubleshooting](../../setup/troubleshooting.md)**: Solutions to common issues
- **[Source Repositories](../../SOURCES.md)**: Original learning materials

---

*Remember: Learning blockchain development takes time. Be patient with yourself, complete the exercises, and don't hesitate to revisit concepts as needed.*
