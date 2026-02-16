# Full-Stack dApp Integration Project

## Overview

This integration project guides you through building a complete decentralized application (dApp) on Solana, from smart contract development to client-side integration and mobile wallet support. You'll create a task management dApp that demonstrates core Solana concepts while following security best practices.

## Project Description

**Task Manager dApp**: A decentralized task management application where users can create, update, and complete tasks stored on the Solana blockchain. Each task is owned by a user account and includes metadata like title, description, status, and timestamps.

## Learning Objectives

By completing this project, you will:

- Design and implement a complete Solana program using Anchor framework
- Build a TypeScript client to interact with your on-chain program
- Integrate mobile wallet adapters for transaction signing
- Apply security best practices throughout the development process
- Implement comprehensive testing strategies
- Deploy and interact with your dApp on devnet

## Topics Integrated

This project combines knowledge from multiple learning areas:

### Basics (Primary)
- **Accounts and Programs**: [../../basics/01-accounts-and-programs/README.md](../../basics/01-accounts-and-programs/README.md)
- **Transactions**: [../../basics/02-transactions/README.md](../../basics/02-transactions/README.md)
- **PDAs**: [../../basics/04-pdas/README.md](../../basics/04-pdas/README.md)

### Security (Secondary)
- **Common Vulnerabilities**: [../../security/01-common-vulnerabilities/README.md](../../security/01-common-vulnerabilities/README.md)
- **Safe Math**: [../../security/02-safe-math/README.md](../../security/02-safe-math/README.md)

### Mobile (Secondary)
- **Wallet Adapter**: [../../mobile/01-wallet-adapter/README.md](../../mobile/01-wallet-adapter/README.md)

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Web Interface   │  │  Mobile App      │                │
│  │  (React/Next.js) │  │  (React Native)  │                │
│  └────────┬─────────┘  └────────┬─────────┘                │
│           │                      │                           │
│           └──────────┬───────────┘                           │
│                      │                                       │
│           ┌──────────▼──────────┐                           │
│           │  Wallet Adapter     │                           │
│           │  (Transaction Sign) │                           │
│           └──────────┬──────────┘                           │
└──────────────────────┼──────────────────────────────────────┘
                       │
                       │ RPC Calls
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Solana Network                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           Task Manager Program (On-Chain)              │ │
│  │                                                        │ │
│  │  Instructions:                                         │ │
│  │  • initialize_user                                     │ │
│  │  • create_task                                         │ │
│  │  • update_task                                         │ │
│  │  • complete_task                                       │ │
│  │  • delete_task                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  Account Structure                      │ │
│  │                                                        │ │
│  │  • UserAccount (PDA)                                   │ │
│  │  • TaskAccount (PDA)                                   │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Data Models

**UserAccount** (PDA derived from user's wallet):
- `authority`: Pubkey - Owner of the account
- `task_count`: u32 - Number of tasks created
- `bump`: u8 - PDA bump seed

**TaskAccount** (PDA derived from user + task_id):
- `authority`: Pubkey - Task owner
- `task_id`: u32 - Unique task identifier
- `title`: String - Task title (max 100 chars)
- `description`: String - Task description (max 500 chars)
- `status`: Enum - NotStarted, InProgress, Completed
- `created_at`: i64 - Unix timestamp
- `updated_at`: i64 - Unix timestamp
- `bump`: u8 - PDA bump seed

## Prerequisites

### Required Knowledge

Before starting this project, you should be familiar with:

1. **Solana Fundamentals**:
   - Account model and ownership
   - Transaction structure and signing
   - Program Derived Addresses (PDAs)
   - Rent and account lifecycle

2. **Anchor Framework**:
   - Program structure and macros
   - Account validation
   - Instruction handlers
   - Testing with Anchor

3. **TypeScript/JavaScript**:
   - Async/await patterns
   - Web3.js or @solana/web3.js
   - React basics (for UI)

4. **Security Awareness**:
   - Signer authorization checks
   - Account validation
   - Integer overflow protection

### Required Setup

Ensure you have completed the following setup guides:

- [Solana CLI Setup](../../setup/solana-cli.md)
- [Rust and Anchor Setup](../../setup/rust-anchor.md)
- [TypeScript and Node.js Setup](../../setup/typescript-node.md)
- [Mobile Environment Setup](../../setup/mobile-environment.md) (optional, for mobile integration)

### Software Versions

- Solana CLI: 1.18.0 or higher
- Anchor: 0.29.0 or higher
- Node.js: 18.0.0 or higher
- Rust: 1.75.0 or higher

## Project Structure

```
full-stack-dapp/
├── README.md                    # This file
├── architecture.md              # Detailed architecture and design decisions
├── prerequisites.md             # Detailed prerequisites and setup
├── implementation-guide.md      # Step-by-step implementation
├── testing-guide.md             # Testing strategies and examples
├── deployment.md                # Deployment instructions
├── extensions.md                # Suggested enhancements
└── resources.md                 # Additional resources and references
```

## Implementation Phases

### Phase 1: On-Chain Program Development
**Estimated Time**: 3-4 hours

1. Initialize Anchor project
2. Define account structures
3. Implement program instructions
4. Add security checks and validations
5. Write program tests

**Key Files**: `programs/task-manager/src/lib.rs`

### Phase 2: Client SDK Development
**Estimated Time**: 2-3 hours

1. Set up TypeScript project
2. Create program client wrapper
3. Implement instruction builders
4. Add transaction helpers
5. Write client tests

**Key Files**: `client/src/task-manager-client.ts`

### Phase 3: Web Interface
**Estimated Time**: 2-3 hours

1. Set up React/Next.js project
2. Integrate wallet adapter
3. Build UI components
4. Connect to program client
5. Handle transaction states

**Key Files**: `app/src/components/`, `app/src/pages/`

### Phase 4: Mobile Integration (Optional)
**Estimated Time**: 2-3 hours

1. Set up React Native project
2. Integrate mobile wallet adapter
3. Adapt UI for mobile
4. Test on mobile devices

**Key Files**: `mobile/src/`

## Getting Started

1. **Read the Architecture**: Review [architecture.md](architecture.md) to understand the system design
2. **Check Prerequisites**: Ensure you meet all requirements in [prerequisites.md](prerequisites.md)
3. **Follow Implementation Guide**: Work through [implementation-guide.md](implementation-guide.md) step-by-step
4. **Test Your Code**: Use [testing-guide.md](testing-guide.md) to validate your implementation
5. **Deploy**: Follow [deployment.md](deployment.md) to deploy to devnet
6. **Extend**: Try enhancements from [extensions.md](extensions.md)

## Expected Outcomes

After completing this project, you will have:

- ✅ A working Solana program deployed on devnet
- ✅ A TypeScript client library for interacting with your program
- ✅ A web interface for managing tasks
- ✅ Comprehensive test coverage
- ✅ Understanding of full-stack Solana development
- ✅ Experience with security best practices
- ✅ (Optional) Mobile app integration

## Common Challenges

### Challenge 1: PDA Derivation
**Issue**: Incorrect PDA seeds leading to account not found errors

**Solution**: Ensure consistent seed derivation between program and client. Review [PDAs documentation](../../basics/04-pdas/README.md).

### Challenge 2: Transaction Size Limits
**Issue**: Transactions failing due to size constraints

**Solution**: Break large operations into multiple transactions or use account compression techniques.

### Challenge 3: Wallet Connection
**Issue**: Wallet adapter not connecting properly

**Solution**: Check wallet adapter configuration and ensure correct network selection (devnet vs mainnet).

## Next Steps

After completing this project:

1. **Explore Advanced Topics**: Try the [Secure DeFi Protocol](../secure-defi-protocol/README.md) project
2. **Add Features**: Implement the extensions suggested in [extensions.md](extensions.md)
3. **Deploy to Mainnet**: Follow production deployment best practices
4. **Build Your Own**: Apply these patterns to your own dApp ideas

## Resources

See [resources.md](resources.md) for additional learning materials, code examples, and community resources.

---

**Ready to build?** Start with [architecture.md](architecture.md) to understand the system design, then proceed to [implementation-guide.md](implementation-guide.md) to begin coding!
