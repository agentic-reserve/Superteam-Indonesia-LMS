# Confidential Transfers and Private Payments

Confidential transfers enable privacy-preserving token operations on Solana using ZK Compression. This section covers building private payment systems, token airdrops, and understanding the trade-offs between privacy, performance, and cost.

## Overview

Confidential transfers combine zero-knowledge proofs with compressed accounts to create privacy-preserving payment systems. By leveraging ZK Compression, you can distribute tokens to millions of recipients at a fraction of the cost of traditional SPL tokens while maintaining privacy.

## What You'll Learn

- **Private token airdrops**: Distribute tokens efficiently with minimal rent costs
- **Confidential payment swaps**: Build private payment systems
- **Privacy/performance trade-offs**: Understand the costs and benefits
- **Production deployment**: Best practices for real-world applications

## Prerequisites

Before starting this section, you should understand:

- [Compression Basics](../01-compression-basics/) - Compressed accounts and tokens
- [ZK Proofs](../02-zk-proofs/) - Zero-knowledge proof concepts
- [Light Protocol](../03-light-protocol/) - Protocol architecture and nullifiers
- Token operations (SPL tokens, minting, transfers)

## Cost Comparison

ZK Compression dramatically reduces the cost of token distribution:

| Operation | SPL Token | Compressed Token | Savings |
|:----------|:----------|:-----------------|:--------|
| Token Account Creation | ~2,000,000 lamports | **5,000 lamports** | **400x** |
| Mint Account | 1,500 lamports | **10 lamports** | **150x** |

### Real-World Impact

For a 10,000 recipient airdrop:

- **SPL Tokens**: ~20 SOL in rent costs
- **Compressed Tokens**: ~0.05 SOL in rent costs
- **Savings**: ~19.95 SOL (99.75% reduction)

## Token Airdrops with ZK Compression

### Simple Airdrop (< 10,000 Recipients)

For small to medium airdrops, use a single-script approach:

```typescript
import { createRpc } from "@lightprotocol/stateless.js";
import { LightTokenProgram, getTokenPoolInfos, selectTokenPoolInfo } from "@lightprotocol/compressed-token";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { ComputeBudgetProgram, PublicKey } from "@solana/web3.js";

// Setup connection
const connection = createRpc(RPC_ENDPOINT, COMPRESSION_ENDPOINT, PROVER_ENDPOINT);

// Define recipients and amounts
const recipients = [
    new PublicKey("recipient1..."),
    new PublicKey("recipient2..."),
    new PublicKey("recipient3..."),
];

const amounts = [
    bn(1_000_000_000), // 1 token
    bn(2_000_000_000), // 2 tokens
    bn(3_000_000_000), // 3 tokens
];

// Get compression infrastructure
const stateTreeInfos = await connection.getStateTreeInfos();
const treeInfo = selectStateTreeInfo(stateTreeInfos);

const tokenPoolInfos = await getTokenPoolInfos(connection, mint);
const tokenPoolInfo = selectTokenPoolInfo(tokenPoolInfos);

// Create source token account
const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
);

// Build compression instruction
const instructions = [
    ComputeBudgetProgram.setComputeUnitLimit({ 
        units: 120_000 * recipients.length 
    }),
    await LightTokenProgram.compress({
        payer: payer.publicKey,
        owner: payer.publicKey,
        source: sourceTokenAccount.address,
        toAddress: recipients,
        amount: amounts,
        mint,
        tokenPoolInfo,
        outputStateTreeInfo: treeInfo,
    })
];

// Sign and send transaction
const tx = buildAndSignTx(instructions, payer, blockhash, []);
const txId = await sendAndConfirmTx(connection, tx);

console.log(`Airdrop completed: ${txId}`);
```

### Large-Scale Airdrop (10,000+ Recipients)

For large airdrops, use batched instructions with retry logic:

**1. Create Instruction Batches**

```typescript
// Process recipients in chunks
const maxRecipientsPerInstruction = 5;
const maxInstructionsPerTransaction = 3;

async function createAirdropInstructions({
    amount,
    recipients,
    payer,
    sourceTokenAccount,
    mint,
    stateTreeInfos,
    tokenPoolInfos,
}): Promise<InstructionBatch[]> {
    const instructionBatches: InstructionBatch[] = [];
    const amountBn = bn(amount.toString());

    for (let i = 0; i < recipients.length; i += maxRecipientsPerInstruction * maxInstructionsPerTransaction) {
        const instructions: TransactionInstruction[] = [];

        // Add compute budget
        instructions.push(
            ComputeBudgetProgram.setComputeUnitLimit({ units: 500_000 }),
            ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 20_000 })
        );

        // Select infrastructure
        const treeInfo = selectStateTreeInfo(stateTreeInfos);
        const tokenPoolInfo = selectTokenPoolInfo(tokenPoolInfos);

        // Create compression instructions for batch
        for (let j = 0; j < maxInstructionsPerTransaction; j++) {
            const startIdx = i + j * maxRecipientsPerInstruction;
            const recipientBatch = recipients.slice(startIdx, startIdx + maxRecipientsPerInstruction);

            if (recipientBatch.length === 0) break;

            const compressIx = await LightTokenProgram.compress({
                payer,
                owner: payer,
                source: sourceTokenAccount,
                toAddress: recipientBatch,
                amount: recipientBatch.map(() => amountBn),
                mint,
                tokenPoolInfo,
                outputStateTreeInfo: treeInfo,
            });

            instructions.push(compressIx);
        }

        instructionBatches.push(instructions);
    }

    return instructionBatches;
}
```

**2. Execute with Retry Logic**

```typescript
async function* signAndSendAirdropBatches(
    batches: InstructionBatch[],
    payer: Keypair,
    connection: Rpc,
    maxRetries = 3
): AsyncGenerator<BatchResult> {
    const statusMap = new Array(batches.length).fill(0); // 0 = pending

    // Get address lookup table
    const lookupTableAddress = new PublicKey("9NYFyEqPkyXUhkerbGHXUXkvb4qpzeEdHuGpgbgpH1NJ");
    const lookupTableAccount = (await connection.getAddressLookupTable(lookupTableAddress)).value!;

    while (statusMap.includes(0)) {
        const sends = statusMap.map(async (status, index) => {
            if (status !== 0) return;

            let retries = 0;
            while (retries < maxRetries && statusMap[index] === 0) {
                try {
                    const { blockhash } = await connection.getLatestBlockhash();
                    
                    const tx = new VersionedTransaction(
                        new TransactionMessage({
                            payerKey: payer.publicKey,
                            recentBlockhash: blockhash,
                            instructions: batches[index],
                        }).compileToV0Message([lookupTableAccount])
                    );
                    
                    tx.sign([payer]);

                    const confirmedSig = await sendAndConfirmTx(connection, tx, {
                        skipPreflight: true,
                        commitment: "confirmed",
                    });

                    if (confirmedSig) {
                        statusMap[index] = 1; // Mark as confirmed
                        return { type: "success", index, signature: confirmedSig };
                    }
                } catch (e) {
                    retries++;
                    if (retries >= maxRetries) {
                        statusMap[index] = -1; // Mark as error
                        return { type: "error", index, error: (e as Error).message };
                    }
                }
            }
        });

        const results = await Promise.all(sends);
        for (const result of results) {
            if (result) yield result;
        }
    }
}
```

**3. Main Airdrop Execution**

```typescript
// Create mint and mint supply
const { mint } = await createMint(connection, payer, payer.publicKey, 9);
const ata = await getOrCreateAssociatedTokenAccount(connection, payer, mint, payer.publicKey);
await mintTo(connection, payer, mint, ata.address, payer.publicKey, 10e9 * LAMPORTS_PER_SOL);

// Get compression infrastructure
const stateTreeInfos = await connection.getStateTreeInfos();
const tokenPoolInfos = await getTokenPoolInfos(connection, mint);

// Create instruction batches
const instructionBatches = await createAirdropInstructions({
    amount: 1e6,
    recipients,
    payer: payer.publicKey,
    sourceTokenAccount: ata.address,
    mint,
    stateTreeInfos,
    tokenPoolInfos,
});

// Execute batched airdrop
for await (const result of signAndSendAirdropBatches(instructionBatches, payer, connection)) {
    if (result.type === "success") {
        console.log(`Batch ${result.index} confirmed: ${result.signature}`);
    } else {
        console.log(`Batch ${result.index} failed: ${result.error}`);
    }
}
```

## Confidential Payment Swaps

The cp-swap-reference demonstrates a rent-free AMM implementation using Light tokens:

### Key Features

- **Drop-in SDK**: Minimal code changes from existing AMM implementations
- **No Extra CU Overhead**: Efficient hot path operations
- **No UX Difference**: Seamless user experience
- **Rent Sponsorship**: Protocol sponsors rent-exemption for users

### Rent-Free AMM Components

The SDK sponsors rent-exemption for:

- Pool state accounts
- Token vault accounts
- LP mint accounts
- User associated token accounts (ATAs)

### Implementation Example

```rust
use light_token_program::prelude::*;

#[program]
pub mod rentfree_amm {
    use super::*;

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        initial_amount_a: u64,
        initial_amount_b: u64,
    ) -> Result<()> {
        // Pool state is automatically compressed
        let pool = &mut ctx.accounts.pool;
        pool.token_a_mint = ctx.accounts.token_a_mint.key();
        pool.token_b_mint = ctx.accounts.token_b_mint.key();
        pool.reserve_a = initial_amount_a;
        pool.reserve_b = initial_amount_b;
        
        Ok(())
    }

    pub fn swap(
        ctx: Context<Swap>,
        amount_in: u64,
        minimum_amount_out: u64,
    ) -> Result<()> {
        // Swap logic with compressed tokens
        // No rent costs for user ATAs
        
        Ok(())
    }
}
```

### Performance Comparison

| Operation | Light Token | SPL Token |
|:----------|:------------|:----------|
| ATA Creation | 4,348 CU | 14,194 CU |
| Transfer | 312 CU | 4,645 CU |
| Transfer (rent-free) | 1,885 CU | 4,645 CU |

## Private Token Airdrops

Private airdrops combine compressed tokens with nullifiers for privacy:

### Basic Private Airdrop

```typescript
import { deriveNullifierAddress } from "@lightprotocol/nullifier-program";

// 1. Generate claim codes (off-chain)
const claimCodes = recipients.map(() => Keypair.generate());

// 2. Derive nullifiers from claim codes
const nullifiers = claimCodes.map(code => 
    deriveNullifierAddress(code.publicKey.toBytes())
);

// 3. Distribute compressed tokens to nullifier addresses
const compressIx = await LightTokenProgram.compress({
    payer: payer.publicKey,
    owner: payer.publicKey,
    source: sourceTokenAccount.address,
    toAddress: nullifiers,
    amount: amounts,
    mint,
    tokenPoolInfo,
    outputStateTreeInfo: treeInfo,
});

// 4. Recipients claim with their claim codes
// The claim code proves ownership without revealing identity
```

### Merkle Distributor Pattern

For advanced airdrops with vesting and clawback:

```rust
use light_sdk::prelude::*;

#[light_account]
pub struct MerkleDistributor {
    pub root: [u8; 32],
    pub mint: Pubkey,
    pub total_amount: u64,
    pub claimed_amount: u64,
}

pub fn claim(
    ctx: Context<Claim>,
    index: u64,
    amount: u64,
    proof: Vec<[u8; 32]>,
) -> Result<()> {
    // Verify Merkle proof
    let leaf = hash_leaf(index, ctx.accounts.claimant.key(), amount);
    require!(verify_proof(proof, ctx.accounts.distributor.root, leaf), ErrorCode::InvalidProof);

    // Create nullifier to prevent double claims
    let nullifier = derive_nullifier(index, ctx.accounts.claimant.key());
    create_nullifier(&ctx, nullifier)?;

    // Transfer compressed tokens
    transfer_compressed_tokens(&ctx, amount)?;

    Ok(())
}
```

## Privacy/Performance Trade-offs

### Transaction Size Considerations

Solana's transaction size limit is 1,232 bytes. ZK Compression increases transaction size:

- **Validity Proof**: 128 bytes (constant per transaction)
- **Account Data**: Must send account data on-chain
- **Practical Limit**: ~1 KB of account data per transaction

### Compute Unit Usage

ZK Compression uses more compute units:

| Component | Compute Units |
|:----------|:--------------|
| Validity proof verification | ~100,000 CU |
| System operations (Poseidon hashing) | ~100,000 CU |
| Per compressed account read/write | ~6,000 CU |
| **Typical compressed token transfer** | **~292,000 CU** |

**Transaction Limits:**

- Per-transaction limit: 1,400,000 CU
- Per-block write lock limit (per state tree): 12,000,000 CU
- Global per-block limit: 48,000,000 CU

### State Cost per Transaction

Each write operation incurs additional costs:

| Type | Lamports | Notes |
|:-----|:---------|:------|
| Solana base fee | 5,000 | Per signature |
| Write new compressed account | ~300 | Per leaf (default depth 26) |
| Nullify old compressed account | 5,000 | Per transaction |
| Create addresses | 5,000 | Per transaction |

### When to Use Compressed Accounts

**Good Use Cases:**

- Token airdrops and distributions
- User account creation (one-time setup)
- Infrequently updated accounts
- Accounts with < 1 KB of data
- Applications with many users

**Not Recommended:**

- Frequently updated accounts (>1000x writes)
- Shared liquidity pools (high-frequency updates)
- Large data storage (>1 KB per transaction)
- Real-time trading systems

### Optimization Strategies

1. **Batch Operations**: Group multiple operations in one transaction
2. **Use V2 Trees**: Leverage `prove_by_index` optimization (70% CU reduction)
3. **Minimize Data Size**: Keep account data under 1 KB
4. **Address Lookup Tables**: Reduce transaction size
5. **Dynamic Priority Fees**: Adjust fees based on network congestion

## Production Deployment Best Practices

### Environment Configuration

```typescript
// Production RPC endpoints
const RPC_ENDPOINT = "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY";
const COMPRESSION_ENDPOINT = "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY";
const PROVER_ENDPOINT = "https://prover-mainnet.helius.dev";

const connection = createRpc(RPC_ENDPOINT, COMPRESSION_ENDPOINT, PROVER_ENDPOINT);
```

### Error Handling

```typescript
try {
    const txId = await sendAndConfirmTx(connection, tx);
    console.log(`Success: ${txId}`);
} catch (error) {
    if (error.message.includes("blockhash not found")) {
        // Retry with fresh blockhash
        const { blockhash } = await connection.getLatestBlockhash();
        // Rebuild and retry transaction
    } else if (error.message.includes("insufficient funds")) {
        // Handle insufficient balance
        console.error("Insufficient funds for transaction");
    } else {
        // Log and handle other errors
        console.error("Transaction failed:", error);
    }
}
```

### Monitoring and Logging

```typescript
// Track airdrop progress
let successCount = 0;
let failureCount = 0;

for await (const result of signAndSendAirdropBatches(batches, payer, connection)) {
    if (result.type === "success") {
        successCount++;
        console.log(`✓ Batch ${result.index}: ${result.signature}`);
    } else {
        failureCount++;
        console.error(`✗ Batch ${result.index}: ${result.error}`);
    }
    
    // Log progress
    const total = batches.length;
    const completed = successCount + failureCount;
    console.log(`Progress: ${completed}/${total} (${(completed/total*100).toFixed(1)}%)`);
}

console.log(`\nAirdrop Complete:`);
console.log(`  Success: ${successCount}`);
console.log(`  Failed: ${failureCount}`);
```

### Rate Limiting

```typescript
// Implement rate limiting for large airdrops
const BATCH_DELAY_MS = 100; // Delay between batches

for (let i = 0; i < batches.length; i++) {
    await processBatch(batches[i]);
    
    if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
    }
}
```

### Wallet Integration

Compressed tokens are supported by major wallets:

- **Phantom**: Full support for compressed tokens
- **Backpack**: Full support for compressed tokens
- **Custom Wallets**: Use `@lightprotocol/stateless.js` for integration

```typescript
// Check if wallet supports compressed tokens
const tokenAccounts = await connection.getCompressedTokenAccountsByOwner(
    walletPublicKey,
    { mint }
);

if (tokenAccounts.items.length > 0) {
    console.log("Wallet has compressed tokens");
    // Display compressed token balance
}
```

## Security Considerations

### Proof Verification

Always verify proofs on-chain:

```rust
// Verify validity proof before state updates
let proof_result = verify_validity_proof(&ctx, &proof)?;
require!(proof_result.is_valid, ErrorCode::InvalidProof);
```

### Nullifier Management

Ensure nullifiers are unique and checked:

```rust
// Check nullifier doesn't exist
let nullifier_address = derive_nullifier_address(&id);
let account = get_compressed_account(&nullifier_address)?;
require!(account.is_none(), ErrorCode::NullifierAlreadyUsed);

// Create nullifier
create_nullifier(&ctx, &id)?;
```

### Access Control

Implement proper authorization:

```rust
// Verify signer authority
require!(ctx.accounts.signer.key() == expected_authority, ErrorCode::Unauthorized);

// Verify token ownership
require!(token_account.owner == ctx.accounts.signer.key(), ErrorCode::NotOwner);
```

## Real-World Examples

### Helius Airship

[Airship by Helius Labs](https://airship.helius.dev/) enables airdrops to up to 200,000 recipients using ZK Compression.

**Features:**

- Web-based interface
- CSV upload for recipients
- Automatic batching and retry logic
- Real-time progress tracking
- Cost estimation

### Token Distribution Flows

[Example Token Distribution](https://github.com/Lightprotocol/example-token-distribution) provides reference implementations for:

- Simple airdrops
- Batched airdrops with retry logic
- Reward distribution systems
- Payment flows

## Next Steps

1. **Practice with Exercises**: Work through confidential transfer examples in [Exercises](../exercises/)
2. **Explore Examples**: Study the [example-token-distribution](https://github.com/Lightprotocol/example-token-distribution) repository
3. **Build Your Application**: Start with a simple airdrop and scale up
4. **Join the Community**: Get support in the [Light Protocol Discord](https://discord.gg/7cJ8BhAXhu)

## Resources

### Documentation

- [Airdrop Guide](https://www.zkcompression.com/compressed-tokens/advanced-guides/airdrop) - Complete airdrop tutorial
- [Token Distribution Examples](https://github.com/Lightprotocol/example-token-distribution) - Reference implementations
- [CP Swap Reference](https://github.com/Lightprotocol/cp-swap-reference) - Rent-free AMM example

### Tools

- [Airship by Helius](https://airship.helius.dev/) - Web-based airdrop tool
- [Light CLI](https://www.npmjs.com/package/@lightprotocol/zk-compression-cli) - Command-line tools
- [Compressed Token SDK](https://www.npmjs.com/package/@lightprotocol/compressed-token) - TypeScript SDK

### Examples

- [Simple Airdrop](https://github.com/Lightprotocol/example-token-distribution/blob/main/src/simple-airdrop/simple-airdrop.ts) - Basic airdrop script
- [Batched Airdrop](https://github.com/Lightprotocol/example-token-distribution/tree/main/src/optimized-airdrop) - Large-scale airdrop
- [Merkle Distributor](https://github.com/Lightprotocol/distributor) - Advanced airdrop with vesting

### Community

- [Light Protocol Discord](https://discord.gg/7cJ8BhAXhu) - Developer support
- [Twitter/X](https://x.com/lightprotocol) - Updates and announcements
- [GitHub](https://github.com/Lightprotocol) - Source code and issues

---

**Source Attribution**: Content extracted and curated from:
- [solana-privacy/docs-v2/compressed-tokens/advanced-guides/airdrop.mdx](https://github.com/Lightprotocol/light-protocol/blob/main/docs-v2/compressed-tokens/advanced-guides/airdrop.mdx)
- [solana-privacy/cp-swap-reference/README.md](https://github.com/Lightprotocol/cp-swap-reference)
- [solana-privacy/docs-v2/learn/core-concepts/considerations.mdx](https://github.com/Lightprotocol/light-protocol/blob/main/docs-v2/learn/core-concepts/considerations.mdx)
- [example-token-distribution](https://github.com/Lightprotocol/example-token-distribution)
