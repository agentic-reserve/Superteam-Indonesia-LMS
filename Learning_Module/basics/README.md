# Solana Basics

Welcome to the Solana Basics module! This section covers the fundamental concepts you need to understand before building on Solana. Whether you're new to blockchain development or coming from another ecosystem, these lessons will give you a solid foundation.

## Learning Objectives

By completing this module, you will:

- Understand Solana's account model and how it differs from other blockchains
- Learn how to structure and deploy Solana programs
- Master transaction creation, signing, and submission
- Work with SPL tokens (Solana's token standard)
- Understand Program Derived Addresses (PDAs) and their use cases
- Build practical skills through hands-on exercises

## Prerequisites

Before starting this module, ensure you have:

- Basic programming knowledge (Rust or TypeScript recommended)
- Completed the [Setup Guide](../setup/README.md)
- Familiarity with blockchain concepts (accounts, transactions, signatures)

**New to Rust?** We recommend completing the [Rust Basics](../rust-basics/README.md) module first. Rust is the primary language for Solana programs, and understanding concepts like ownership, borrowing, and error handling will make learning Solana development much easier.

## Module Structure

This module is organized progressively, with each section building on previous concepts:

### 1. [Accounts and Programs](./01-accounts-and-programs/README.md)
**Estimated Time:** 2-3 hours

Learn about Solana's account model, program structure, and how data is stored on-chain. This is the foundation for everything else in Solana development.

**Topics covered:**
- Account structure and ownership
- Program accounts vs data accounts
- Rent and account lifecycle
- Basic program architecture

### 2. [Transactions](./02-transactions/README.md)
**Estimated Time:** 1-2 hours

Understand how transactions work on Solana, including structure, signing, and submission to the network.

**Topics covered:**
- Transaction anatomy
- Instruction format
- Signing and verification
- Transaction fees and compute units
- Recent blockhash requirements

### 3. [Tokens](./03-tokens/README.md)
**Estimated Time:** 2-3 hours

Master the SPL Token standard, including creating, minting, and transferring tokens on Solana.

**Topics covered:**
- SPL Token program overview
- Token mints and token accounts
- Creating and minting tokens
- Token transfers and approvals
- Token metadata and extensions

### 4. [Program Derived Addresses (PDAs)](./04-pdas/README.md)
**Estimated Time:** 2-3 hours

Learn about PDAs, a powerful Solana primitive for deterministic address generation and program-controlled accounts.

**Topics covered:**
- PDA derivation and seeds
- Cross-Program Invocations (CPI)
- PDA signing authority
- Common PDA patterns

### 5. [Anchor Framework](./05-anchor-framework/README.md)
**Estimated Time:** 3-4 hours

Master the Anchor framework, the most popular tool for building Solana programs with high-level abstractions and built-in security.

**Topics covered:**
- Anchor architecture and benefits
- Account constraints and validation
- Cross-Program Invocations with Anchor
- Testing and IDL generation
- Deployment and upgrades

### 6. [RPC API Reference](./06-rpc-api-reference/README.md)
**Estimated Time:** 1-2 hours (reference material)

Comprehensive reference for Solana's JSON-RPC API for querying blockchain data and submitting transactions.

**Topics covered:**
- RPC request/response format
- Common RPC methods (getAccountInfo, sendTransaction, etc.)
- Commitment levels and finality
- Error handling and rate limiting
- WebSocket subscriptions for real-time updates

### 7. [Wallet Utilities](./07-wallet-utilities/README.md)
**Estimated Time:** 6-8 hours

Master essential wallet operations including keypair management, mnemonics, message signing, and React wallet integration.

**Topics covered:**
- Keypair generation and restoration (bytes, base58)
- Mnemonic phrases (BIP39/BIP44 HD wallets)
- Message signing and verification
- Vanity address generation
- React wallet adapter integration

### 8. [Exercises](./exercises/README.md)
**Estimated Time:** 4-6 hours

Apply what you've learned through practical coding exercises with validation criteria and solution references.

## Learning Path

We recommend following the sections in order, as each builds on concepts from previous sections:

```
Setup → Accounts & Programs → Transactions → Tokens → PDAs → Anchor Framework → RPC API → Wallet Utilities → Exercises
```

However, if you're already familiar with certain concepts, feel free to skip ahead or use this as a reference.

## Getting Help

If you get stuck:

1. Review the [Troubleshooting Guide](../setup/troubleshooting.md)
2. Check the [Glossary](../GLOSSARY.md) for term definitions
3. Refer to the [Source Repositories](../SOURCES.md) for deeper dives
4. Join the Solana developer community on Discord

## Cross-References and Related Topics

### Prerequisites
- **Setup**: Complete the [Setup Guide](../setup/README.md) before starting this module
- **Programming**: Basic knowledge of Rust or TypeScript recommended

### Related Topics
- **Security**: Apply [Security Best Practices](../security/README.md) to your programs from the start
- **Testing**: Learn [Fuzzing with Trident](../security/03-fuzzing-with-trident/README.md) for comprehensive testing

### Advanced Alternatives
- **DeFi**: Build on basics with [Token Economics](../defi/01-token-economics/README.md) and [AMM Basics](../defi/02-amm-basics/README.md)
- **Privacy**: Explore [ZK Compression](../privacy/01-compression-basics/README.md) for rent-free tokens
- **Mobile**: Integrate with [Mobile Wallet Adapter](../mobile/01-wallet-adapter/README.md) for mobile apps

### Integration Examples
- **Full-Stack dApp**: See how basics combine in [Full-Stack dApp Project](../integration/full-stack-dapp/README.md)
- **Mobile Payments**: Apply token knowledge in [Mobile Payment System](../integration/mobile-payment-system/README.md)

## Next Steps

After completing this module, you can:

- Explore [Advanced Topics](../advanced/README.md) for Ephemeral Rollups and Session Keys
- Learn [Security](../security/README.md) best practices
- Dive into [Mobile Development](../mobile/README.md) on Solana
- Build [DeFi](../defi/README.md) protocols
- Create [AI Agents](../ai-agents/README.md) on Solana
- Explore [DePIN](../depin/README.md) and IoT integration
- Study [Privacy](../privacy/README.md) and zero-knowledge techniques

## Additional Resources

- [Solana Core Reference Guide](./solana-core-reference.md) - Quick reference to concise Solana core documentation (LLM-optimized)
- [Solana Cookbook](https://solanacookbook.com/) - Practical code examples and recipes for common Solana development patterns
- [Solana Documentation](https://docs.solana.com/) - Official comprehensive documentation covering all Solana concepts and APIs
- [Anchor Framework Documentation](https://www.anchor-lang.com/) - Complete guide to building Solana programs with the Anchor framework
- [SPL Token Documentation](https://spl.solana.com/token) - Detailed documentation for the SPL Token program and token standards

---

**Ready to start?** Head to [Accounts and Programs](./01-accounts-and-programs/README.md) to begin your Solana journey!
