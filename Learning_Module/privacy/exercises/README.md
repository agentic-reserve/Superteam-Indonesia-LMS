# Privacy and Zero-Knowledge Exercises

This section contains hands-on exercises to practice privacy and zero-knowledge concepts on Solana using Light Protocol and ZK Compression.

## Overview

These exercises progress from basic compressed token operations to advanced privacy-preserving applications. Each exercise includes objectives, validation criteria, hints, and solution references.

## Prerequisites

Before starting these exercises, ensure you have:

- Completed the [Compression Basics](../01-compression-basics/), [ZK Proofs](../02-zk-proofs/), and [Light Protocol](../03-light-protocol/) sections
- Set up your development environment with Light Protocol tools
- Basic understanding of Solana program development

## Setup Instructions

### Install Dependencies

```bash
# Install Light CLI
npm install -g @lightprotocol/zk-compression-cli

# Install project dependencies
npm install @lightprotocol/stateless.js @lightprotocol/compressed-token @solana/web3.js
```

### Start Local Test Validator

```bash
# Start test validator with Light Protocol
light test-validator

# In another terminal, check validator is running
solana cluster-version
```

### Load Wallet

```bash
# Generate a new keypair if needed
solana-keygen new -o ~/.config/solana/id.json

# Airdrop SOL for testing
solana airdrop 2
```

## Exercise List

### Exercise 1: Create and Mint Compressed Tokens

**Difficulty**: Beginner  
**Estimated Time**: 30 minutes

**Objectives**:
- Create a compressed token mint
- Mint compressed tokens to a recipient
- Verify the compressed token balance

**Validation Criteria**:
- Mint account is created successfully
- Tokens are minted to the recipient address
- Balance can be queried using `getCompressedTokenAccountsByOwner`

**Hints**:
- Use `createMint()` from `@lightprotocol/compressed-token`
- Use `mintTo()` to mint tokens to a recipient
- Connect to local test validator with `createRpc()`

**Solution Reference**: [solana-privacy/docs-v2/quickstart.mdx](https://github.com/Lightprotocol/light-protocol/blob/main/docs-v2/quickstart.mdx)

**Starter Code**:

```typescript
import { createRpc } from "@lightprotocol/stateless.js";
import { createMint, mintTo } from "@lightprotocol/compressed-token";
import { Keypair } from "@solana/web3.js";

const payer = Keypair.fromSecretKey(/* your secret key */);
const connection = createRpc("http://localhost:8899", "http://localhost:8784", "http://localhost:3001");

async function exercise1() {
    // TODO: Create a compressed mint
    
    // TODO: Mint compressed tokens to a recipient
    
    // TODO: Verify the balance
}

exercise1();
```

---

### Exercise 2: Transfer Compressed Tokens

**Difficulty**: Beginner  
**Estimated Time**: 30 minutes

**Objectives**:
- Transfer compressed tokens between accounts
- Verify sender and recipient balances after transfer
- Understand the transfer instruction structure

**Validation Criteria**:
- Tokens are successfully transferred from sender to recipient
- Sender balance decreases by transfer amount
- Recipient balance increases by transfer amount

**Hints**:
- Use `LightTokenProgram.transfer()` for transfers
- Get validity proofs using `getValidityProof()`
- Check balances with `getCompressedTokenAccountsByOwner()`

**Solution Reference**: [solana-privacy/examples-zk-compression/compressed-token-cookbook](https://github.com/Lightprotocol/examples-zk-compression)

**Starter Code**:

```typescript
import { LightTokenProgram } from "@lightprotocol/compressed-token";
import { bn } from "@lightprotocol/stateless.js";

async function exercise2() {
    // TODO: Get sender's compressed token accounts
    
    // TODO: Create transfer instruction
    
    // TODO: Sign and send transaction
    
    // TODO: Verify balances
}

exercise2();
```

---

### Exercise 3: Implement a Simple Nullifier Program

**Difficulty**: Intermediate  
**Estimated Time**: 1 hour

**Objectives**:
- Create a program that uses nullifiers to prevent double-spending
- Implement nullifier creation and verification
- Test the program with multiple attempts to use the same nullifier

**Validation Criteria**:
- Nullifier can be created successfully
- Attempting to create the same nullifier twice fails
- Program correctly prevents double-spending

**Hints**:
- Use `create_nullifiers()` from the nullifier program SDK
- Derive nullifier addresses from unique identifiers
- Check if nullifier exists before creating

**Solution Reference**: [solana-privacy/nullifier-program](https://github.com/Lightprotocol/nullifier-program)

**Starter Code**:

```rust
use anchor_lang::prelude::*;
use nullifier_creation::{create_nullifiers, NullifierInstructionData};

#[program]
pub mod simple_nullifier {
    use super::*;

    pub fn create_nullifier<'info>(
        ctx: Context<'_, '_, '_, 'info, CreateNullifierAccounts<'info>>,
        data: NullifierInstructionData,
        nullifiers: Vec<[u8; 32]>,
    ) -> Result<()> {
        // TODO: Verify ZK proof (optional for this exercise)
        
        // TODO: Create nullifiers
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateNullifierAccounts<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
}
```

---

### Exercise 4: Build a Simple Airdrop System

**Difficulty**: Intermediate  
**Estimated Time**: 1.5 hours

**Objectives**:
- Create a compressed token mint
- Distribute tokens to multiple recipients in a single transaction
- Verify all recipients received their tokens

**Validation Criteria**:
- Mint is created with sufficient supply
- All recipients receive the correct amount of tokens
- Transaction completes successfully with proper compute budget

**Hints**:
- Use `LightTokenProgram.compress()` for distribution
- Set appropriate compute unit limits (120k CU per recipient)
- Use `selectStateTreeInfo()` and `selectTokenPoolInfo()` for infrastructure

**Solution Reference**: [solana-privacy/docs-v2/compressed-tokens/advanced-guides/airdrop.mdx](https://github.com/Lightprotocol/light-protocol/blob/main/docs-v2/compressed-tokens/advanced-guides/airdrop.mdx)

**Starter Code**:

```typescript
import { LightTokenProgram, getTokenPoolInfos, selectTokenPoolInfo } from "@lightprotocol/compressed-token";
import { selectStateTreeInfo } from "@lightprotocol/stateless.js";
import { ComputeBudgetProgram } from "@solana/web3.js";

async function exercise4() {
    const recipients = [
        // TODO: Add recipient addresses
    ];
    
    const amounts = [
        // TODO: Add amounts for each recipient
    ];
    
    // TODO: Get compression infrastructure
    
    // TODO: Build compression instruction
    
    // TODO: Execute transaction
}

exercise4();
```

---

### Exercise 5: Create a Compressed PDA Counter

**Difficulty**: Intermediate  
**Estimated Time**: 1.5 hours

**Objectives**:
- Create a compressed PDA account to store a counter
- Implement increment and decrement operations
- Verify state updates are correctly reflected

**Validation Criteria**:
- Counter account is created with initial value
- Increment operation increases counter value
- Decrement operation decreases counter value
- State is correctly compressed and verified

**Hints**:
- Use `light_sdk` for compressed account operations
- Derive addresses using `derive_address()`
- Include validity proofs for state updates

**Solution Reference**: [solana-privacy/program-examples/counter](https://github.com/Lightprotocol/program-examples/tree/main/counter)

**Starter Code**:

```rust
use light_sdk::prelude::*;

#[light_account]
#[derive(Clone, Debug)]
pub struct Counter {
    pub authority: Pubkey,
    pub count: u64,
}

#[light_program]
pub mod compressed_counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        // TODO: Create compressed counter account
        
        Ok(())
    }

    pub fn increment(ctx: Context<Update>) -> Result<()> {
        // TODO: Increment counter
        
        Ok(())
    }

    pub fn decrement(ctx: Context<Update>) -> Result<()> {
        // TODO: Decrement counter
        
        Ok(())
    }
}
```

---

### Exercise 6: Implement a Private Payment System

**Difficulty**: Advanced  
**Estimated Time**: 2-3 hours

**Objectives**:
- Create a payment system using nullifiers for privacy
- Implement deposit and withdrawal functions
- Ensure payments cannot be double-spent

**Validation Criteria**:
- Users can deposit tokens privately
- Users can withdraw tokens using nullifiers
- Double-spending is prevented
- Privacy is maintained (no link between deposits and withdrawals)

**Hints**:
- Use nullifiers to track spent deposits
- Derive nullifiers from private claim codes
- Verify Merkle proofs for deposit validity

**Solution Reference**: [solana-privacy/program-examples/zk](https://github.com/Lightprotocol/program-examples/tree/main/zk)

**Starter Code**:

```rust
use light_sdk::prelude::*;
use nullifier_creation::{create_nullifiers, NullifierInstructionData};

#[light_account]
pub struct PrivatePool {
    pub mint: Pubkey,
    pub total_deposits: u64,
}

#[light_program]
pub mod private_payment {
    use super::*;

    pub fn deposit(
        ctx: Context<Deposit>,
        amount: u64,
    ) -> Result<()> {
        // TODO: Accept deposit and create commitment
        
        Ok(())
    }

    pub fn withdraw<'info>(
        ctx: Context<'_, '_, '_, 'info, Withdraw<'info>>,
        nullifier: [u8; 32],
        amount: u64,
        proof: Vec<u8>,
    ) -> Result<()> {
        // TODO: Verify proof
        
        // TODO: Create nullifier to prevent double-spend
        
        // TODO: Transfer tokens to recipient
        
        Ok(())
    }
}
```

---

### Exercise 7: Build a Batched Airdrop System

**Difficulty**: Advanced  
**Estimated Time**: 2-3 hours

**Objectives**:
- Implement batched instruction creation for large airdrops
- Add retry logic for failed transactions
- Monitor and log airdrop progress

**Validation Criteria**:
- System can handle 1000+ recipients
- Failed batches are retried automatically
- Progress is logged and trackable
- All recipients receive tokens or failures are reported

**Hints**:
- Process recipients in chunks (5 per instruction, 3 instructions per transaction)
- Use address lookup tables to reduce transaction size
- Implement exponential backoff for retries

**Solution Reference**: [example-token-distribution/optimized-airdrop](https://github.com/Lightprotocol/example-token-distribution/tree/main/src/optimized-airdrop)

**Starter Code**:

```typescript
async function createAirdropInstructions(params) {
    // TODO: Process recipients in chunks
    
    // TODO: Create batched compression instructions
    
    // TODO: Return instruction batches
}

async function* signAndSendAirdropBatches(batches, payer, connection) {
    // TODO: Implement retry logic
    
    // TODO: Track batch status
    
    // TODO: Yield results
}

async function exercise7() {
    // TODO: Create mint and mint supply
    
    // TODO: Create instruction batches
    
    // TODO: Execute batched airdrop
}

exercise7();
```

---

### Exercise 8: Optimize Compute Unit Usage

**Difficulty**: Advanced  
**Estimated Time**: 2 hours

**Objectives**:
- Measure compute unit usage for compressed operations
- Optimize operations to reduce CU consumption
- Compare V1 and V2 tree performance

**Validation Criteria**:
- CU usage is measured accurately
- Optimizations reduce CU consumption by at least 20%
- V2 trees show significant improvement over V1

**Hints**:
- Use `ComputeBudgetProgram.setComputeUnitLimit()` to measure usage
- Batch operations to amortize proof verification costs
- Use V2 trees with `prove_by_index` optimization

**Solution Reference**: [solana-privacy/docs-v2/learn/core-concepts/considerations.mdx](https://github.com/Lightprotocol/light-protocol/blob/main/docs-v2/learn/core-concepts/considerations.mdx)

**Starter Code**:

```typescript
async function measureComputeUnits(operation: () => Promise<string>) {
    // TODO: Execute operation and measure CU usage
    
    // TODO: Parse transaction logs for CU consumption
    
    // TODO: Return CU usage
}

async function exercise8() {
    // TODO: Measure baseline operation
    
    // TODO: Implement optimizations
    
    // TODO: Measure optimized operation
    
    // TODO: Compare results
}

exercise8();
```

---

## Additional Resources

### Documentation

- [ZK Compression Docs](https://www.zkcompression.com/) - Official documentation
- [Light Protocol GitHub](https://github.com/Lightprotocol/light-protocol) - Source code
- [Program Examples](https://github.com/Lightprotocol/program-examples) - Reference implementations

### Example Projects

- [Counter Example](https://github.com/Lightprotocol/program-examples/tree/main/counter) - Full compressed account lifecycle
- [Nullifier Example](https://github.com/Lightprotocol/program-examples/tree/main/zk/nullifier) - Nullifier patterns
- [Token Distribution](https://github.com/Lightprotocol/example-token-distribution) - Airdrop implementations

### Tools

- [Light CLI](https://www.npmjs.com/package/@lightprotocol/zk-compression-cli) - Command-line tools
- [Photon Indexer](https://github.com/helius-labs/photon) - RPC indexer
- [Airship](https://airship.helius.dev/) - Web-based airdrop tool

### Community

- [Light Protocol Discord](https://discord.gg/7cJ8BhAXhu) - Developer support
- [Twitter/X](https://x.com/lightprotocol) - Updates and announcements

## Troubleshooting

### Common Issues

**Issue**: "Blockhash not found"
- **Solution**: Ensure test validator is running and use fresh blockhashes

**Issue**: "Insufficient compute units"
- **Solution**: Increase compute unit limit based on operation complexity

**Issue**: "Invalid proof"
- **Solution**: Verify proof generation and ensure account state is current

**Issue**: "Nullifier already exists"
- **Solution**: This is expected behavior - nullifier prevents double-spending

### Getting Help

If you encounter issues:

1. Check the [troubleshooting guide](https://www.zkcompression.com/developers/troubleshooting)
2. Search existing issues on [GitHub](https://github.com/Lightprotocol/light-protocol/issues)
3. Ask in the [Discord community](https://discord.gg/7cJ8BhAXhu)
4. Review the [program examples](https://github.com/Lightprotocol/program-examples)

## Next Steps

After completing these exercises:

1. Build your own privacy-preserving application
2. Contribute to the Light Protocol ecosystem
3. Explore advanced ZK concepts and circuits
4. Join the community and share your projects

---

**Source Attribution**: Exercise concepts and starter code derived from:
- [solana-privacy/program-examples](https://github.com/Lightprotocol/program-examples)
- [solana-privacy/docs-v2](https://github.com/Lightprotocol/light-protocol/tree/main/docs-v2)
- [example-token-distribution](https://github.com/Lightprotocol/example-token-distribution)
- [solana-privacy/nullifier-program](https://github.com/Lightprotocol/nullifier-program)
