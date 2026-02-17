# Solana Core Documentation Reference

## Overview

This guide references the comprehensive Solana core documentation available in `solana-llms-resources/solana-full-llms.txt`. This resource provides a concise, LLM-optimized overview of Solana's fundamental concepts and serves as an excellent complement to the detailed Learning Module content.

## When to Use Each Resource

### Use the Learning Module When:
- You're learning Solana for the first time
- You want detailed explanations with context
- You need real-world program examples
- You prefer structured, progressive learning
- You want hands-on exercises
- You're building production applications

### Use solana-full-llms.txt When:
- You need a quick reference
- You want a concise overview of all basics
- You're using AI-assisted learning tools
- You prefer single-document references
- You need alternative explanations
- You want LLM-optimized content

## Content Mapping

This table shows how the solana-full-llms.txt content maps to Learning Module sections:

| Topic | solana-full-llms.txt | Learning Module Section | Notes |
|-------|---------------------|------------------------|-------|
| **Accounts** | Core Concepts → Accounts | [01-accounts-and-programs](./01-accounts-and-programs/README.md) | Module includes counter program example |
| **Transactions** | Core Concepts → Transactions | [02-transactions](./02-transactions/README.md) | Module includes transfer-sol example |
| **Programs** | Core Concepts → Programs | [01-accounts-and-programs](./01-accounts-and-programs/README.md) | Module covers Anchor framework |
| **PDAs** | Core Concepts → PDAs | [04-pdas](./04-pdas/README.md) | Module has comprehensive PDA patterns |
| **CPIs** | Core Concepts → CPIs | [04-pdas](./04-pdas/README.md) | Covered in PDAs and transaction examples |
| **Fees** | Core Concepts → Fees | [02-transactions](./02-transactions/README.md) | Module includes compute unit optimization |
| **RPC API** | RPC API Reference | [06-rpc-api-reference](./06-rpc-api-reference/README.md) | Module has comprehensive API reference |
| **Tokens** | Token Program | [03-tokens](./03-tokens/README.md) | Module has dedicated tokens section |
| **Examples** | Cookbook Examples | Throughout all sections | Module examples are more comprehensive |

## Key Differences

### Code Examples

**solana-full-llms.txt provides**:
- Kit (modern) examples
- Legacy Web3.js examples
- Basic Rust examples
- Concise, focused code

**Learning Module provides**:
- Kit (modern) examples
- Legacy Web3.js examples
- Anchor framework examples
- Native Rust examples
- Complete program implementations
- Test suites
- Links to GitHub repositories

### Depth of Coverage

**solana-full-llms.txt**:
- Concise explanations (736 lines total)
- Core concepts overview
- Quick reference format
- LLM-optimized structure

**Learning Module**:
- Detailed explanations (2000+ lines per section)
- Real-world examples
- Best practices and pitfalls
- Hands-on exercises
- Cross-references
- Source attribution

## Recommended Learning Path

### For Beginners

1. **Start with Learning Module**
   - Read [Accounts and Programs](./01-accounts-and-programs/README.md)
   - Complete the counter program example
   - Move through sections progressively

2. **Use solana-full-llms.txt for**
   - Quick reviews
   - Alternative explanations
   - Concise reference

### For Experienced Developers

1. **Start with solana-full-llms.txt**
   - Get quick overview of Solana concepts
   - Identify areas needing deeper understanding

2. **Dive into Learning Module for**
   - Detailed explanations of specific topics
   - Production-ready code examples
   - Best practices and security considerations

### For AI-Assisted Learning

1. **Use solana-full-llms.txt with AI tools**
   - LLM-optimized format
   - Concise context for AI assistants
   - Quick reference for code generation

2. **Validate with Learning Module**
   - Verify AI-generated code against examples
   - Check best practices
   - Review security considerations

## Content Highlights from solana-full-llms.txt

### Core Concepts Covered

1. **Accounts**
   - Account structure (lamports, data, owner, executable)
   - Account types (program, data, system)
   - Rent and account lifecycle
   - Code examples in Kit, Legacy, and Rust

2. **Transactions**
   - Transaction structure (signatures, message)
   - Message components (header, account keys, blockhash, instructions)
   - Transaction lifecycle
   - SOL transfer examples

3. **Programs**
   - Program architecture
   - System Program functions
   - Loader programs (v1-v4)
   - Program deployment

4. **PDAs (Program Derived Addresses)**
   - PDA derivation process
   - Canonical bump seeds
   - Security considerations
   - Code examples

5. **CPIs (Cross Program Invocations)**
   - CPI without PDA signers
   - CPI with PDA signers
   - Stack depth limits
   - Anchor examples

6. **Transaction Fees**
   - Base fee (5000 lamports per signature)
   - Priority fees (optional)
   - Compute unit limits
   - Fee optimization

### RPC API Methods

The resource includes examples for:
- `getAccountInfo` - Query account data
- `getBalance` - Check lamport balance
- `sendTransaction` - Submit transactions
- `getLatestBlockhash` - Get recent blockhash
- `simulateTransaction` - Test before sending
- `getSignatureStatuses` - Check transaction status
- `getProgramAccounts` - Query program accounts
- `getTokenAccountsByOwner` - Query token accounts
- `requestAirdrop` - Get devnet/testnet SOL

### Network Clusters

Quick reference for RPC endpoints:
- Mainnet-beta: `https://api.mainnet-beta.solana.com`
- Devnet: `https://api.devnet.solana.com`
- Testnet: `https://api.testnet.solana.com`
- Localhost: `http://localhost:8899`

## How to Access solana-full-llms.txt

The resource is located at:
```
solana-llms-resources/solana-full-llms.txt
```

You can:
1. Read it directly for quick reference
2. Use it with AI tools for assisted learning
3. Search for specific topics
4. Copy code examples for experimentation

## Complementary Resources

### Official Documentation
- [Solana Documentation](https://docs.solana.com/) - Official comprehensive docs
- [Solana Cookbook](https://solanacookbook.com/) - Practical recipes
- [Anchor Framework](https://www.anchor-lang.com/) - Anchor documentation

### Learning Module Sections
- [Accounts and Programs](./01-accounts-and-programs/README.md) - Detailed account model
- [Transactions](./02-transactions/README.md) - Transaction deep dive
- [Tokens](./03-tokens/README.md) - SPL Token standard
- [PDAs](./04-pdas/README.md) - Program Derived Addresses
- [Anchor Framework](./05-anchor-framework/README.md) - Anchor development
- [RPC API Reference](./06-rpc-api-reference/README.md) - Complete API reference

### Program Examples
- [Solana Program Examples](https://github.com/solana-developers/program-examples) - Official examples
- [Counter Program](https://github.com/solana-developers/program-examples/tree/main/basics/counter)
- [Transfer SOL](https://github.com/solana-developers/program-examples/tree/main/basics/transfer-sol)
- [Create Account](https://github.com/solana-developers/program-examples/tree/main/basics/create-account)

## Best Practices for Using Both Resources

### 1. Start with Overview
- Read solana-full-llms.txt for quick overview
- Identify topics you need to understand deeply
- Dive into Learning Module for those topics

### 2. Use for Different Purposes
- **Quick Reference**: solana-full-llms.txt
- **Deep Learning**: Learning Module
- **Code Examples**: Both (Learning Module has more)
- **AI Assistance**: solana-full-llms.txt

### 3. Cross-Reference
- Use solana-full-llms.txt for concise explanations
- Verify understanding with Learning Module examples
- Practice with Learning Module exercises

### 4. Keep Both Handy
- Bookmark solana-full-llms.txt for quick lookups
- Use Learning Module as primary learning resource
- Reference both when building projects

## Feedback and Contributions

If you find gaps or have suggestions:
- Learning Module improvements: See [SOURCES.md](../SOURCES.md)
- solana-full-llms.txt updates: Check the original source

## Conclusion

The solana-full-llms.txt resource and the Learning Module serve complementary purposes:

- **solana-full-llms.txt**: Concise, LLM-optimized quick reference
- **Learning Module**: Comprehensive, structured learning curriculum

Use both resources together for the most effective learning experience. Start with the overview in solana-full-llms.txt, then dive deep with the Learning Module for topics you need to master.

---

**Resource Location**: `solana-llms-resources/solana-full-llms.txt`
**Learning Module**: `Learning_Module/basics/`
**Last Updated**: February 17, 2026
