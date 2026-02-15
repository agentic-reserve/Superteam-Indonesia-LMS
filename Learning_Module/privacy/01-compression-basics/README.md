# ZK Compression Basics

## Introduction

ZK Compression is a protocol that allows you to create rent-free accounts and tokens on Solana without sacrificing performance, security, or composability. This lesson covers the fundamentals of how compression works and why it's valuable for Solana developers.

## What is ZK Compression?

ZK Compression uses zero-knowledge proofs to compress Solana state, storing account data as calldata on the ledger instead of in expensive on-chain account space. This eliminates the need for rent-exemption while maintaining Solana's security guarantees.

### Key Benefits

- **Rent-free accounts**: Create accounts without paying upfront rent (~2M lamports saved per token account)
- **L1 performance**: Execution happens on-chain on Solana
- **Full composability**: Works with existing programs and accounts
- **Scalability**: Ideal for token distributions, airdrops, and high-volume applications

## How ZK Compression Works

<function_calls>
<invoke name="fsAppend">
<parameter name="path">Learning_Module/privacy/01-compression-basics/README.mdigh-Level System Overview

The ZK Compression system consists of six main components:

1. **Storage of Compressed State**
   - Compressed accounts store state as calldata on Solana's ledger
   - This maintains Solana's security and removes the need for rent-exemption per account

2. **Accessing Compressed State**
   - Transactions specify which state they access (read/write)
   - State is included in the transaction payload

3. **State Validation**
   - Solana programs invoke the Light System Program to update compressed state
   - The protocol validates the state (validity of existing state, sum checks, ownership checks)
   - The protocol enforces a schema: Classic Accounts → Compressed Accounts

4. **State Updates**
   - New state is recorded as a log on the Solana ledger with each transaction

5. **RPC Nodes (Photon)**
   - Photon RPC nodes index the state changes
   - Make compressed account state available to clients via the ZK Compression RPC API
   - Built by Helius Labs

6. **Forester Nodes**
   - Keeper nodes that interact with the Account Compression Program
   - Empty queues and rollover state trees
   - Clients and custom programs don't interact with Forester nodes directly

## Compressed Account Model

Compressed accounts are similar to regular Solana accounts but with key differences that enable rent-free storage.

### Compressed Account Structure

A compressed account includes the core Solana account fields plus additional fields for indexing:

```rust
pub struct CompressedAccount {
    pub address: Option<[u8; 32]>,            // Optional persistent identifier
    pub data: Option<CompressedAccountData>,  // Account data
    pub hash: [u8; 32],                       // Unique account hash
    pub lamports: u64,                        // Account balance
    pub owner: Pubkey,                        // Program that owns this account
}
```

### Key Differences from Regular Accounts

1. **Identified by Hash**: Each compressed account can be identified by its hash
2. **Hash Changes on Write**: Every write to a compressed account changes its hash
3. **Optional Address**: An address can be set as a permanent unique ID
4. **Stored in Merkle Trees**: All compressed accounts are stored in sparse state trees
5. **Only Root Hash On-Chain**: Only the tree's state root is stored in on-chain account space

### Address and Hash

- **Hash**: Every compressed account has a unique hash that changes when data changes
- **Address**: Optional 32-byte persistent identifier (like a PublicKey)
  - Use addresses when state must be unique (NFTs, certain PDAs)
  - Skip addresses for fungible state (tokens) to save computational overhead

### Address Derivation

Compressed account addresses are derived similar to PDAs:

**TypeScript Example:**
```typescript
const seed = deriveAddressSeedV2([customSeed, signer.publicKey.toBytes()]);
const address = deriveAddressV2(seed, addressTree, new web3.PublicKey(programId));
```

**Rust Example:**
```rust
let (address, _) = derive_address(
    &[b"custom_seed", keypair.pubkey().as_ref()],
    &address_tree_info.tree,
    &your_program::ID,
);
```

### Data Field

The data field contains the compressed account's program state:

```rust
pub struct CompressedAccountData {
    pub discriminator: [u8; 8],  // Type identifier for account data
    pub data: Vec<u8>,           // Serialized program state
    pub data_hash: [u8; 32],     // Hash of the data field
}
```

- **discriminator**: Identifies the data type (similar to Anchor's 8-byte discriminator)
- **data**: Stores the account's current state as arbitrary bytes
  - No fixed maximum size like Solana's 10 MB limit
  - Practical limit is ~1 KB per account due to transaction size constraints
- **data_hash**: Fixed-size hash used for Merkle tree verification

## Merkle Trees and Validity Proofs

ZK Compression uses Merkle trees to efficiently store and verify millions of compressed accounts.

### State Trees

State trees are binary Merkle trees that store compressed account hashes:

1. **Merkle Tree Structure**: Hashes adjacent leaves repeatedly into a single root hash
2. **Merkle Root Hash**: Only the root hash is stored on-chain to secure all compressed state
3. **Leaf Hash Structure**: Each leaf contains a compressed account hash with:
   - `data_hash`: Fingerprint of the account data
   - `state_hash`: Ensures global uniqueness (includes tree pubkey and leaf index)
   - `owner_hashed`: Program that owns the account
   - `lamports`: Account balance

### Validity Proofs

Validity proofs verify that a compressed account exists in state trees:

- **Constant Size**: 128-byte proof size regardless of tree height
- **Groth16 ZK-SNARK**: Uses well-known pairing-based zero-knowledge proof system
- **Batched Proofs**: Multiple Merkle proofs batched into a single ZK proof

**Proof Size Comparison:**

| Accounts Verified | Proof Components      | Size      |
|:------------------|:----------------------|:----------|
| 1                 | 1 merkle proof        | 832 bytes |
| 1                 | 1 merkle + 1 ZK proof | 128 bytes |
| 8                 | 8 merkle + 1 ZK proof | 128 bytes |

### State Tree Versions

- **V1 state trees**: Always require the full 128-byte ZK proof
- **V2 batched state trees**: Can use `prove_by_index` optimization (1 byte instead of 128 bytes)
  - Optimizes compute unit consumption by up to 70%
  - Currently on Devnet

### Address Trees

Address trees store addresses that serve as persistent identifiers:

- Store derived addresses in an indexed structure
- Ensure address uniqueness within the tree
- Only root hash stored on-chain
- **V1**: Height 26 (~67 million addresses)
- **V2**: Height 40 (~1 trillion addresses)

## Compressed Tokens

Compressed token accounts store token balance, owner, and other information like SPL tokens:

```rust
pub struct TokenData {
    pub mint: Pubkey,
    pub owner: Pubkey,
    pub amount: u64,
    pub delegate: Option<Pubkey>,
    pub state: u8,
    pub tlv: Option<Vec<u8>>,  // Token extensions (unimplemented)
}
```

### Cost Comparison

| Creation          | Solana              | Compressed         |
|:------------------|:--------------------|:-------------------|
| **Token Account** | ~2,000,000 lamports | **5,000** lamports |

### Key Features

1. Compressed token accounts are rent-free
2. Any SPL or light-token can be compressed/decompressed at will
3. Supported by leading wallets (Phantom, Backpack)
4. Ideal for token distribution and airdrops

## Recommended Use Cases

### Token Distribution

Distribute tokens without paying upfront rent per recipient:

- **Airdrops**: Distribute millions of tokens with minimal rent costs
- **Rewards**: Issue rewards to large user bases efficiently
- **Payments**: Build payment systems with low transaction costs

### Rent-Free Storage

Compress existing SPL token accounts to save rent costs:

- **User Onboarding**: Create accounts for new users without rent burden
- **DeFi Protocols**: Build rent-free AMMs and lending protocols
- **Gaming**: Manage millions of in-game assets efficiently

## Quick Start Example

Here's a minimal example of minting compressed tokens:

```typescript
import { createRpc } from "@lightprotocol/stateless.js";
import { createMint, mintTo } from "@lightprotocol/compressed-token";
import { Keypair } from "@solana/web3.js";

// Load wallet and connect to network
const payer = Keypair.fromSecretKey(/* your secret key */);
const connection = createRpc(RPC_ENDPOINT, COMPRESSION_ENDPOINT, PROVER_ENDPOINT);

// Create SPL mint with compression support
const { mint, transactionSignature } = await createMint(
  connection,
  payer,
  payer.publicKey,  // mintAuthority
  9                 // decimals
);

// Mint compressed tokens
const mintAmount = 1000000000;
const mintToTxId = await mintTo(
  connection,
  payer,
  mint,
  payer.publicKey,  // recipient
  payer,            // mintAuthority
  mintAmount
);

// Verify balance
const tokenAccounts = await connection.getCompressedTokenAccountsByOwner(
  payer.publicKey,
  { mint }
);
```

## Performance Considerations

### Advantages

- **Rent Savings**: Eliminate upfront rent costs for accounts
- **Scalability**: Store millions of accounts efficiently
- **Composability**: Works with existing Solana programs
- **Security**: Maintains Solana's L1 security guarantees

### Trade-offs

- **Transaction Size**: Practical data limit of ~1 KB per account
- **Proof Generation**: Requires RPC support for validity proofs
- **Indexing**: Depends on Photon RPC nodes for state access
- **Compute Units**: V1 trees use more CUs than V2 trees

## Development Tools

### TypeScript/JavaScript

- `@lightprotocol/stateless.js` - Client SDK for compressed accounts
- `@lightprotocol/compressed-token` - Compressed token operations

### Rust

- `light-sdk` - Core SDK for on-chain programs
- `light-client` - Rust client for compressed accounts
- `light-program-test` - Testing framework

### CLI Tools

- `@lightprotocol/zk-compression-cli` - Command-line tools
- Photon Indexer - RPC indexer for compressed state

## Next Steps

1. **Learn about ZK Proofs**: Understand the cryptographic foundations in [02. ZK Proofs](../02-zk-proofs/)
2. **Explore Light Protocol**: Dive into the protocol implementation in [03. Light Protocol](../03-light-protocol/)
3. **Build Confidential Transfers**: Create private payment systems in [04. Confidential Transfers](../04-confidential-transfers/)
4. **Practice with Exercises**: Work through hands-on examples in [Exercises](../exercises/)

## Resources

### Documentation

- [ZK Compression Docs](https://www.zkcompression.com/) - Official documentation
- [Compressed Account Model](https://www.zkcompression.com/learn/core-concepts/compressed-account-model) - Detailed account structure
- [Merkle Trees and Validity Proofs](https://www.zkcompression.com/learn/core-concepts/merkle-trees-validity-proofs) - Proof system details

### Examples

- [Program Examples](https://github.com/Lightprotocol/program-examples) - Reference implementations
- [Example Node.js Client](https://github.com/Lightprotocol/example-nodejs-client) - Client examples
- [Example Web Client](https://github.com/Lightprotocol/example-web-client) - Web integration

### Community

- [Light Protocol Discord](https://discord.gg/7cJ8BhAXhu) - Developer support
- [Twitter/X](https://x.com/lightprotocol) - Updates and announcements

---

**Source Attribution**: Content extracted and curated from:
- [solana-privacy/docs-v2/learn/core-concepts.mdx](https://github.com/Lightprotocol/light-protocol/blob/main/docs-v2/learn/core-concepts.mdx)
- [solana-privacy/docs-v2/learn/core-concepts/compressed-account-model.mdx](https://github.com/Lightprotocol/light-protocol/blob/main/docs-v2/learn/core-concepts/compressed-account-model.mdx)
- [solana-privacy/docs-v2/learn/core-concepts/merkle-trees-validity-proofs.mdx](https://github.com/Lightprotocol/light-protocol/blob/main/docs-v2/learn/core-concepts/merkle-trees-validity-proofs.mdx)
- [solana-privacy/docs-v2/compressed-tokens/overview.mdx](https://github.com/Lightprotocol/light-protocol/blob/main/docs-v2/compressed-tokens/overview.mdx)
- [solana-privacy/docs-v2/quickstart.mdx](https://github.com/Lightprotocol/light-protocol/blob/main/docs-v2/quickstart.mdx)
