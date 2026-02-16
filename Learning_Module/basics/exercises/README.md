# Basics Exercises

## Overview

These hands-on exercises will help you practice the fundamental concepts covered in the Basics module. Each exercise includes clear objectives, validation criteria, hints, and solution references.

**Estimated Time:** 4-6 hours total

## Prerequisites

- Completed all lessons in the Basics module
- Development environment set up (see [Setup Guide](../../setup/README.md))
- Basic understanding of Rust or TypeScript

## Exercise Structure

Each exercise includes:
- **Objective**: What you'll build
- **Difficulty**: Beginner, Intermediate, or Advanced
- **Estimated Time**: How long it should take
- **Requirements**: Specific functionality to implement
- **Validation Criteria**: How to verify your solution works
- **Hints**: Tips to help you along the way
- **Solution Reference**: Link to example solution

## Exercises

### Exercise 1: Hello Solana Program

**Difficulty:** Beginner  
**Estimated Time:** 30-45 minutes  
**Topics:** Accounts, Programs, Transactions

#### Objective

Create a simple Solana program that stores a greeting message in an account and allows users to update it.

#### Requirements

1. Create a program that:
   - Accepts an "initialize" instruction to create a greeting account
   - Accepts an "update" instruction to change the greeting
   - Stores the greeting in an account owned by your program

2. Create a client that:
   - Initializes a greeting account
   - Updates the greeting
   - Reads and displays the current greeting

#### Validation Criteria

- [ ] Program compiles without errors
- [ ] Initialize instruction creates account successfully
- [ ] Update instruction modifies the greeting
- [ ] Client can read the greeting from the account
- [ ] Proper error handling for invalid operations

#### Hints

- Use `borsh` for serialization/deserialization
- Remember to check account ownership
- Calculate rent-exempt minimum for account size
- Use `msg!()` macro for logging in Rust

#### Solution Reference

See `solutions/01-hello-solana/` for a complete implementation.

---

### Exercise 2: Counter Program

**Difficulty:** Beginner  
**Estimated Time:** 45-60 minutes  
**Topics:** Accounts, State Management, Transactions

#### Objective

Build a counter program that allows users to increment, decrement, and reset a counter value.

#### Requirements

1. Program functionality:
   - Initialize a counter account (starting at 0)
   - Increment counter by 1
   - Decrement counter by 1
   - Reset counter to 0
   - Prevent counter from going below 0

2. Client functionality:
   - Create counter account
   - Call all counter operations
   - Display current counter value

#### Validation Criteria

- [ ] Counter initializes to 0
- [ ] Increment increases counter correctly
- [ ] Decrement decreases counter correctly
- [ ] Counter cannot go below 0
- [ ] Reset returns counter to 0
- [ ] Multiple users can have separate counters

#### Hints

- Store counter value as `u64`
- Use checked arithmetic to prevent underflow
- Each user should have their own counter account
- Consider using PDAs for deterministic counter addresses

#### Solution Reference

See `solutions/02-counter-program/` for a complete implementation.

---

### Exercise 3: Token Faucet

**Difficulty:** Intermediate  
**Estimated Time:** 1-2 hours  
**Topics:** SPL Tokens, Token Accounts, Minting

#### Objective

Create a token faucet that distributes a fixed amount of tokens to users who request them.

#### Requirements

1. Program functionality:
   - Create a new SPL token
   - Mint tokens to a faucet-controlled account
   - Distribute tokens to requesting users
   - Limit: 100 tokens per user per day
   - Track user claims to enforce limits

2. Client functionality:
   - Initialize the faucet
   - Request tokens from faucet
   - Check user's token balance
   - Display remaining claimable amount

#### Validation Criteria

- [ ] Token mint created successfully
- [ ] Faucet can distribute tokens
- [ ] Users receive correct amount (100 tokens)
- [ ] Daily limit enforced per user
- [ ] Token accounts created automatically if needed
- [ ] Proper error messages for exceeded limits

#### Hints

- Use PDAs to track user claims
- Store last claim timestamp in user's claim account
- Use `Clock` sysvar to get current timestamp
- Consider using Associated Token Accounts

#### Solution Reference

See `solutions/03-token-faucet/` for a complete implementation.

---

### Exercise 4: Simple Escrow

**Difficulty:** Intermediate  
**Estimated Time:** 2-3 hours  
**Topics:** PDAs, Token Transfers, CPI

#### Objective

Build an escrow program that holds tokens until both parties agree to exchange.

#### Requirements

1. Program functionality:
   - Initialize escrow with Party A's tokens
   - Party B can accept and complete the exchange
   - Party A can cancel before acceptance
   - Use PDA to hold escrowed tokens
   - Transfer tokens atomically on completion

2. Client functionality:
   - Create escrow as Party A
   - Accept escrow as Party B
   - Cancel escrow as Party A
   - Query escrow status

#### Validation Criteria

- [ ] Escrow account created with correct data
- [ ] Tokens transferred to escrow PDA
- [ ] Only Party B can accept escrow
- [ ] Only Party A can cancel escrow
- [ ] Tokens transferred correctly on completion
- [ ] Tokens returned correctly on cancellation
- [ ] Escrow account closed after completion/cancellation

#### Hints

- Use PDA for escrow account
- Store both parties' addresses in escrow data
- Use `invoke_signed` for token transfers from PDA
- Remember to close accounts to recover rent

#### Solution Reference

See `solutions/04-simple-escrow/` for a complete implementation.

---

### Exercise 5: Multi-Signature Wallet

**Difficulty:** Advanced  
**Estimated Time:** 3-4 hours  
**Topics:** PDAs, Multiple Signers, State Management

#### Objective

Create a multi-signature wallet that requires M-of-N signatures to execute transactions.

#### Requirements

1. Program functionality:
   - Initialize wallet with N owners and M threshold
   - Propose transactions
   - Approve transactions (requires M approvals)
   - Execute approved transactions
   - Track approval status

2. Client functionality:
   - Create multi-sig wallet
   - Propose SOL transfer
   - Approve as different owners
   - Execute when threshold reached
   - Query wallet and transaction status

#### Validation Criteria

- [ ] Wallet created with correct owners and threshold
- [ ] Only owners can propose transactions
- [ ] Only owners can approve transactions
- [ ] Each owner can approve only once per transaction
- [ ] Transaction executes only when threshold reached
- [ ] Proper error handling for invalid operations

#### Hints

- Use PDAs for wallet and transaction accounts
- Store approval bitmap or array in transaction account
- Validate signer is an owner before allowing operations
- Use sequence numbers for transaction IDs

#### Solution Reference

See `solutions/05-multisig-wallet/` for a complete implementation.

---

### Exercise 6: NFT Minter

**Difficulty:** Advanced  
**Estimated Time:** 2-3 hours  
**Topics:** Tokens, Metadata, Metaplex

#### Objective

Build an NFT minting program that creates unique tokens with metadata.

#### Requirements

1. Program functionality:
   - Create NFT collection
   - Mint individual NFTs
   - Set NFT metadata (name, symbol, URI)
   - Enforce maximum supply
   - Track minted count

2. Client functionality:
   - Initialize collection
   - Mint NFT to user
   - Upload metadata to Arweave/IPFS
   - Display NFT information

#### Validation Criteria

- [ ] Collection created with metadata
- [ ] NFTs minted with unique addresses
- [ ] Metadata correctly associated with NFTs
- [ ] Maximum supply enforced
- [ ] NFTs are non-fungible (supply = 1, decimals = 0)
- [ ] Proper royalty configuration

#### Hints

- Use Metaplex Token Metadata program
- NFTs have 0 decimals and supply of 1
- Store collection metadata on-chain or via URI
- Consider using Metaplex SDK for easier implementation

#### Solution Reference

See `solutions/06-nft-minter/` for a complete implementation.

---

## Testing Your Solutions

### Unit Tests

Each exercise should include unit tests:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use solana_program_test::*;
    use solana_sdk::{signature::Signer, transaction::Transaction};

    #[tokio::test]
    async fn test_initialize() {
        let program_id = Pubkey::new_unique();
        let (mut banks_client, payer, recent_blockhash) = ProgramTest::new(
            "my_program",
            program_id,
            processor!(process_instruction),
        )
        .start()
        .await;

        // Your test logic here
    }
}
```

### Integration Tests

Test your program with a local validator:

```bash
# Start local validator
solana-test-validator

# Deploy your program
solana program deploy target/deploy/my_program.so

# Run your client tests
npm test
```

## Submission Guidelines

For each exercise:

1. **Code Quality**
   - Clean, readable code
   - Proper error handling
   - Comments explaining complex logic
   - Follows Rust/TypeScript best practices

2. **Documentation**
   - README explaining your approach
   - Instructions to build and run
   - Any assumptions or design decisions

3. **Testing**
   - Unit tests for core functionality
   - Integration tests with local validator
   - Test coverage for edge cases

## Getting Help

If you're stuck:

1. Review the relevant lesson material
2. Check the hints provided
3. Look at the solution reference (but try on your own first!)
4. Ask in the Solana developer community

## Additional Challenges

Once you've completed the exercises, try these extensions:

### Challenge 1: Add Features
- Add admin controls to the token faucet
- Implement time-locked escrow
- Add transaction history to multi-sig wallet

### Challenge 2: Optimize
- Reduce compute units used
- Minimize account space
- Batch operations where possible

### Challenge 3: Security
- Add comprehensive input validation
- Implement access controls
- Handle all edge cases

## Next Steps

After completing these exercises, you're ready to:

- Explore [Security](../../security/README.md) best practices
- Build [DeFi](../../defi/README.md) applications
- Create [Mobile](../../mobile/README.md) dApps
- Develop [AI Agents](../../ai-agents/README.md)

## Source Attribution

These exercises are inspired by:

- **Solana Cookbook Examples**: https://solanacookbook.com/ - Practical code examples for common Solana development patterns
- **Anchor Examples**: https://github.com/coral-xyz/anchor/tree/master/examples - Official Anchor framework example programs
- **Solana Program Library**: https://github.com/solana-labs/solana-program-library - Reference implementations of SPL programs
- **Percolator**: [percolator/percolator](../../../percolator/percolator/)
  - Advanced account management patterns
  - Production-grade error handling
- **Solana Agent Kit**: [solana-agent-kit/solana-agent-kit](../../../solana-agent-kit/solana-agent-kit/)
  - Token and NFT interaction examples
  - Client-side implementation patterns

## Resources

- [Solana Playground](https://beta.solpg.io/) - Browser-based IDE for writing and testing Solana programs
- [Anchor Book](https://book.anchor-lang.com/) - Comprehensive guide to the Anchor framework
- [Solana Stack Exchange](https://solana.stackexchange.com/) - Q&A community for technical questions
- [Solana Discord](https://discord.gg/solana) - Real-time developer community and support
