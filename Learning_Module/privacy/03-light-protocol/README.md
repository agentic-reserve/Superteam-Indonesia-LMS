# Light Protocol: Privacy-Preserving Transactions on Solana

Light Protocol is the core implementation of ZK Compression on Solana, providing the infrastructure for rent-free accounts, compressed tokens, and privacy-preserving transactions.

## Overview

Light Protocol enables developers to build scalable, privacy-preserving applications on Solana by combining zero-knowledge proofs with state compression. The protocol maintains Solana's security guarantees while dramatically reducing costs and enabling new privacy features.

## What You'll Learn

- **Light Protocol architecture**: Core components and how they interact
- **Nullifier patterns**: Prevent double-spending in privacy-preserving systems
- **Compressed PDA operations**: Create and manage rent-free program-derived addresses
- **Transaction lifecycle**: How compressed account transactions are processed
- **Program integration**: Build programs that use compressed accounts

## Prerequisites

Before starting this section, you should understand:

- [Compression Basics](../01-compression-basics/) - Compressed accounts and Merkle trees
- [ZK Proofs](../02-zk-proofs/) - Zero-knowledge proof concepts
- Solana program development (Rust or Anchor)
- Cross-program invocations (CPIs)

## Light Protocol Architecture

### Core Components

Light Protocol consists of several key components that work together:

```
┌─────────────────────────────────────────────────────────┐
│                  Light Protocol Stack                    │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  Application Layer                                       │
│  ├─ Your Program (Anchor/Native)                        │
│  └─ Client SDK (@lightprotocol/stateless.js)            │
└──────────────────────────────────────────────────────────┘
                        ↓ CPI
┌──────────────────────────────────────────────────────────┐
│  Protocol Layer                                          │
│  ├─ Light System Program (state validation)             │
│  ├─ Light Token Program (token operations)              │
│  └─ Account Compression Program (Merkle trees)          │
└──────────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────────┐
│  Infrastructure Layer                                    │
│  ├─ Photon RPC (indexer)                                │
│  ├─ Forester Nodes (tree management)                    │
│  └─ Prover Service (proof generation)                   │
└──────────────────────────────────────────────────────────┘
```

### Light System Program

The Light System Program is the core of the protocol:

- **State Validation**: Verifies validity proofs for compressed accounts
- **Ownership Checks**: Ensures only authorized programs can modify accounts
- **Sum Checks**: Validates lamport balances remain consistent
- **Nullification**: Prevents double-spending by nullifying old account hashes
- **State Updates**: Appends new account hashes to Merkle trees

**Program Address**: `SySTEM1eSU2p4BGQfQpimFEWWSC1XDFeun3Nqzz3rT7`

### Light Token Program

The Light Token Program provides rent-free token operations:

- **Mint Accounts**: Create token mints with embedded metadata
- **Token Accounts**: Manage token balances with automatic compression
- **Transfers**: Execute token transfers with minimal compute units
- **Compression**: Automatically compress/decompress tokens based on activity

**Program Address**: `cTokenmWW8bLPjZEBAUgYy3zKxQZW6VKi7bqNFEVv3m`

### Account Compression Program

Manages Merkle tree state:

- **State Trees**: Store compressed account hashes
- **Address Trees**: Store unique addresses for compressed accounts
- **Queue Management**: Handle pending state updates
- **Tree Rollovers**: Create new trees when current ones fill up

**Program Address**: `compr6CUsB5m2jS4Y3831ztGSTnDpnKJTKS95d64XVq`

## Light Token Standard

Light Protocol introduces a high-performance token standard that reduces account creation costs by 200x while being more compute-efficient than SPL on hot paths.

### Mint Accounts

Light mints uniquely represent a token on Solana:

```rust
pub struct CompressedMint {
    pub base: BaseMint,                      // SPL-compatible fields
    pub metadata: CompressedMintMetadata,    // Program state
    pub reserved: [u8; 49],                  // T22 compatibility
    pub account_type: u8,                    // Discriminator
    pub compression: CompressionInfo,        // Compression config
    pub extensions: Option<Vec<ExtensionStruct>>,
}
```

**Cost Comparison:**

| Account Type | Light Token | SPL Token |
|:-------------|:------------|:----------|
| Mint Account | 0.00001 SOL | 0.0015 SOL |

### Token Accounts

Light token accounts hold token balances:

```rust
pub struct Token {
    pub mint: Pubkey,
    pub owner: Pubkey,
    pub amount: u64,
    pub delegate: Option<Pubkey>,
    pub state: u8,
    pub is_native: Option<u64>,
    pub delegated_amount: u64,
    pub close_authority: Option<Pubkey>,
    pub extensions: Option<Vec<ExtensionStruct>>,
}
```

**Cost Comparison:**

| Account Type | Light Token | SPL Token |
|:-------------|:------------|:----------|
| Token Account | ~0.00001 SOL | ~0.002 SOL |

**Performance Comparison:**

| Operation | Light Token | SPL Token |
|:----------|:------------|:----------|
| ATA Creation | 4,348 CU | 14,194 CU |
| Transfer | 312 CU | 4,645 CU |
| Transfer (rent-free) | 1,885 CU | 4,645 CU |

### Associated Token Accounts

Light ATAs follow the same pattern as SPL ATAs:

```rust
let seeds = [
    owner.as_ref(),          // Wallet address (32 bytes)
    program_id.as_ref(),     // Light Token Program ID (32 bytes)
    mint.as_ref(),           // Mint address (32 bytes)
    bump.as_ref(),           // Bump seed (1 byte)
];
```

### Automatic Compression

Light token accounts automatically compress/decompress based on activity:

- **Active accounts**: Stored as regular Solana accounts (fast access)
- **Inactive accounts**: Automatically compressed (rent-free storage)
- **Seamless transitions**: No user intervention required

## Transaction Lifecycle

Understanding how transactions with compressed accounts are processed is crucial for building with Light Protocol.

### Reading Compressed Accounts

**Client-Side Reading:**

```typescript
// 1. Fetch compressed account from indexer
const compressedAccount = await rpc.getCompressedAccount(
  bn(address.toBytes())
);

// 2. Deserialize account data
const accountData = coder.types.decode(
  "AccountType",
  compressedAccount.data.data
);
```

**On-Chain Reading:**

```rust
// 1. Fetch compressed account from indexer (client-side)
let compressed_account = rpc
    .get_compressed_account(address, None)
    .await?
    .value
    .unwrap();

// 2. Get validity proof using account hash
let proof = rpc
    .get_validity_proof(vec![compressed_account.hash], vec![], None)
    .await?
    .value;

// 3. Pass proof to on-chain program in instruction data
```

### Writing to Compressed Accounts

Writing follows this pattern:

```
(state, validityProof) -> state transition -> state'
```

**Steps:**

1. **Fetch Current State**: Get compressed account data from RPC
2. **Get Validity Proof**: Prove the account exists in the state tree
3. **Prepare Instruction**: Include current and new state plus proof
4. **Execute Transaction**: Program validates and updates state

**Example:**

```typescript
// 1. Fetch compressed account
const account = await rpc.getCompressedAccount(bn(address.toBytes()));

// 2. Get validity proof
const proof = await rpc.getValidityProof([bn(account.hash)]);

// 3. Prepare instruction with:
// - address: persistent identifier
// - owner: program ID
// - data: current account data
// - data': updated account data
// - proof: validity proof

// 4. Submit transaction
const tx = await program.methods
  .updateAccount(newData)
  .accounts({ /* ... */ })
  .remainingAccounts(proof.accounts)
  .rpc();
```

### On-Chain Execution Flow

When a program writes to compressed accounts:

```
┌─────────────────────────────────────────────────────────┐
│  1. Your Program Invokes Light System Program (CPI)     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  2. Light System Program Validates                       │
│     ├─ Run sum checks (lamports balance)                │
│     ├─ Verify ownership                                 │
│     └─ Verify validity proof                            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  3. Nullify Old State                                    │
│     └─ Mark old account hash as spent                   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  4. Append New State                                     │
│     ├─ Add new account hash to Merkle tree              │
│     └─ Update tree root                                 │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  5. Emit State to Ledger                                 │
│     └─ Log new compressed account state                 │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  6. Photon RPC Indexes State                             │
│     └─ Make new state available to clients              │
└─────────────────────────────────────────────────────────┘
```

## Nullifier Patterns

Nullifiers are essential for preventing double-spending in privacy-preserving systems.

### Compressed PDA Nullifiers

Light Protocol provides efficient nullifier creation using compressed PDAs:

```rust
use anchor_lang::prelude::*;
use nullifier_creation::{create_nullifiers, NullifierInstructionData};

#[program]
pub mod zk_nullifier {
    use super::*;

    pub fn create_nullifier<'info>(
        ctx: Context<'_, '_, '_, 'info, CreateNullifierAccounts<'info>>,
        data: NullifierInstructionData,
        nullifiers: Vec<[u8; 32]>,
    ) -> Result<()> {
        // 1. Verify your ZK proof here
        // Use nullifiers as public inputs
        // Groth16Verifier::new(...).verify()?;

        // 2. Create the nullifier PDAs
        create_nullifiers(
            &nullifiers,
            data,
            ctx.accounts.signer.as_ref(),
            ctx.remaining_accounts,
        )
    }
}
```

### Nullifier Derivation

Nullifiers are derived from seeds:

```rust
// Derive compressed account address from seeds
let address = derive_address(
    &[b"nullifier", id.as_ref()],
    &address_tree,
    &program_id,
);

// If address already exists, nullifier is spent
```

### Checking Nullifier Status

**TypeScript:**

```typescript
import { deriveNullifierAddress } from "@lightprotocol/nullifier-program";
import { bn } from "@lightprotocol/stateless.js";

const address = deriveNullifierAddress(id);
const account = await rpc.getCompressedAccount(bn(address.toBytes()));

if (account !== null) {
    throw new Error("Nullifier already used - double spend attempt!");
}
```

**Rust:**

```rust
use light_nullifier_program::sdk::fetch_proof;

match fetch_proof(&mut rpc, &id).await {
    Ok(_) => return Err(Error::NullifierAlreadyUsed),
    Err(_) => {
        // Nullifier available, proceed with transaction
    }
}
```

## Compressed PDA Operations

Compressed PDAs work similarly to regular PDAs but with rent-free storage.

### Creating Compressed PDAs

```rust
use light_sdk::compressed_account::CompressedAccount;

// Define your account structure
#[derive(BorshSerialize, BorshDeserialize)]
pub struct MyAccount {
    pub owner: Pubkey,
    pub data: u64,
}

// Create compressed PDA
let account = MyAccount {
    owner: ctx.accounts.signer.key(),
    data: 42,
};

// Derive address
let (address, _) = derive_address(
    &[b"my_account", owner.as_ref()],
    &address_tree,
    &program_id,
);

// Create the compressed account
create_compressed_account(
    &ctx,
    address,
    &account,
)?;
```

### Updating Compressed PDAs

```rust
// 1. Fetch current account (client-side)
let account = rpc.get_compressed_account(address).await?;

// 2. Get validity proof (client-side)
let proof = rpc.get_validity_proof(vec![account.hash]).await?;

// 3. Update account (on-chain)
let mut account_data = deserialize(&account.data)?;
account_data.data = new_value;

update_compressed_account(
    &ctx,
    address,
    &account_data,
    proof,
)?;
```

### Closing Compressed PDAs

```rust
// Close compressed account and reclaim lamports
close_compressed_account(
    &ctx,
    address,
    proof,
)?;
```

## Program Integration

### Using Light SDK

The Light SDK provides macros and utilities for building programs with compressed accounts:

```rust
use light_sdk::prelude::*;

#[light_account]
#[derive(Clone, Debug)]
pub struct MyCompressedAccount {
    pub owner: Pubkey,
    pub balance: u64,
    pub data: Vec<u8>,
}

#[light_program]
pub mod my_program {
    use super::*;

    pub fn create_account(
        ctx: Context<CreateAccount>,
        data: Vec<u8>,
    ) -> Result<()> {
        let account = MyCompressedAccount {
            owner: ctx.accounts.signer.key(),
            balance: 0,
            data,
        };
        
        create_compressed_account(&ctx, &account)?;
        Ok(())
    }
}
```

### Cross-Program Invocations

Invoke Light System Program from your program:

```rust
use light_system_program::invoke::invoke_light_system_program;

// Prepare CPI accounts
let cpi_accounts = InvokeLightSystemProgram {
    signer: ctx.accounts.signer.to_account_info(),
    light_system_program: ctx.accounts.light_system_program.to_account_info(),
    // ... other accounts
};

// Invoke Light System Program
invoke_light_system_program(
    cpi_accounts,
    instruction_data,
)?;
```

## RPC API Methods

Light Protocol extends Solana's RPC API with compressed account methods:

| Solana RPC | Light Protocol RPC |
|:-----------|:-------------------|
| getAccountInfo | getCompressedAccount |
| getBalance | getCompressedBalance |
| getTokenAccountsByOwner | getCompressedTokenAccountsByOwner |
| getProgramAccounts | getCompressedAccountsByOwner |

### Example RPC Calls

```typescript
import { createRpc } from "@lightprotocol/stateless.js";

const rpc = createRpc(RPC_ENDPOINT, COMPRESSION_ENDPOINT, PROVER_ENDPOINT);

// Get compressed account
const account = await rpc.getCompressedAccount(bn(address.toBytes()));

// Get compressed balance
const balance = await rpc.getCompressedBalance(owner);

// Get compressed token accounts
const tokenAccounts = await rpc.getCompressedTokenAccountsByOwner(
    owner,
    { mint }
);

// Get validity proof
const proof = await rpc.getValidityProof([accountHash]);
```

## Infrastructure Components

### Photon RPC Indexer

Photon is the canonical ZK Compression indexer:

- Indexes Light Protocol programs
- Reconstructs compressed account state from ledger
- Provides ZK Compression RPC API
- Built and maintained by Helius Labs

**GitHub**: [helius-labs/photon](https://github.com/helius-labs/photon)

### Forester Nodes

Keeper nodes that maintain Merkle trees:

- Empty state queues
- Rollover full trees
- Maintain tree health
- Run automatically in the background

**Note**: Clients and programs don't interact with Forester nodes directly.

### Prover Service

Generates zero-knowledge proofs:

- Creates validity proofs for compressed accounts
- Batches multiple Merkle proofs into single ZK proof
- Runs locally for development
- Provided by RPC for production

## Development Workflow

### Local Development Setup

```bash
# Install Light CLI
npm install -g @lightprotocol/zk-compression-cli

# Start local test validator with Light Protocol
light test-validator

# In another terminal, start your development
anchor build
anchor test
```

### Testing with Light Program Test

```rust
use light_program_test::test_env::setup_test_programs_with_accounts;

#[tokio::test]
async fn test_compressed_account() {
    let (mut context, env) = setup_test_programs_with_accounts(None).await;
    
    // Your test code here
    let account = create_compressed_account(&mut context, &env).await?;
    
    assert!(account.is_some());
}
```

### Deploying to Devnet/Mainnet

```bash
# Build your program
anchor build

# Deploy to devnet
solana program deploy \
    --url devnet \
    --program-id your-program-keypair.json \
    target/deploy/your_program.so

# Configure RPC endpoints
const rpc = createRpc(
    "https://devnet.helius-rpc.com/?api-key=YOUR_KEY",
    "https://devnet.helius-rpc.com/?api-key=YOUR_KEY",
    "https://prover-devnet.helius.dev"
);
```

## Best Practices

### Account Design

1. **Use Addresses Sparingly**: Only create addresses when uniqueness is required
2. **Batch Operations**: Group multiple account updates in single transactions
3. **Minimize Data Size**: Keep account data under 1 KB for optimal performance
4. **Plan for Compression**: Design accounts to work well when compressed

### Proof Management

1. **Cache Proofs**: Reuse validity proofs when possible
2. **Batch Verifications**: Verify multiple accounts in one proof
3. **Handle Proof Failures**: Implement retry logic for proof generation
4. **Monitor Proof Costs**: Track compute units used for verification

### Error Handling

```rust
use light_sdk::error::LightError;

match create_compressed_account(&ctx, &account) {
    Ok(_) => Ok(()),
    Err(LightError::InvalidProof) => {
        // Handle invalid proof
        Err(Error::ProofVerificationFailed)
    }
    Err(LightError::AccountAlreadyExists) => {
        // Handle duplicate account
        Err(Error::AccountExists)
    }
    Err(e) => Err(e.into()),
}
```

## Security Considerations

### Proof Verification

- Always verify proofs on-chain before state updates
- Validate all public inputs match expected values
- Check proof freshness to prevent replay attacks

### Nullifier Management

- Ensure nullifiers are globally unique
- Verify nullifiers haven't been used before creating
- Use deterministic derivation for consistency

### Access Control

- Implement proper ownership checks
- Validate signer authority for operations
- Use program-derived addresses for security

## Next Steps

1. **Build Confidential Transfers**: Create private payment systems in [04. Confidential Transfers](../04-confidential-transfers/)
2. **Practice with Exercises**: Work through Light Protocol examples in [Exercises](../exercises/)
3. **Explore Program Examples**: Study reference implementations on [GitHub](https://github.com/Lightprotocol/program-examples)

## Resources

### Documentation

- [Light Protocol Docs](https://www.zkcompression.com/) - Official documentation
- [Light SDK Docs](https://docs.rs/light-sdk) - Rust SDK reference
- [Stateless.js Docs](https://lightprotocol.github.io/light-protocol/stateless.js/) - TypeScript SDK

### Examples

- [Program Examples](https://github.com/Lightprotocol/program-examples) - Reference implementations
- [Counter Example](https://github.com/Lightprotocol/program-examples/tree/main/counter) - Full lifecycle demo
- [Nullifier Example](https://github.com/Lightprotocol/program-examples/tree/main/zk/nullifier) - Nullifier patterns

### Tools

- [Light CLI](https://www.npmjs.com/package/@lightprotocol/zk-compression-cli) - Command-line tools
- [Photon Indexer](https://github.com/helius-labs/photon) - RPC indexer
- [Light Program Test](https://docs.rs/light-program-test) - Testing framework

### Community

- [Light Protocol Discord](https://discord.gg/7cJ8BhAXhu) - Developer support
- [Twitter/X](https://x.com/lightprotocol) - Updates and announcements
- [GitHub](https://github.com/Lightprotocol) - Source code and issues

---

**Source Attribution**: Content extracted and curated from:
- [solana-privacy/light-protocol/README.md](https://github.com/Lightprotocol/light-protocol)
- [solana-privacy/docs-v2/learn/light-token-standard.mdx](https://github.com/Lightprotocol/light-protocol/blob/main/docs-v2/learn/light-token-standard.mdx)
- [solana-privacy/docs-v2/learn/core-concepts/transaction-lifecycle.mdx](https://github.com/Lightprotocol/light-protocol/blob/main/docs-v2/learn/core-concepts/transaction-lifecycle.mdx)
- [solana-privacy/nullifier-program/README.md](https://github.com/Lightprotocol/nullifier-program)
