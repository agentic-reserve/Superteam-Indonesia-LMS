# Zero-Knowledge Proofs on Solana

Zero-knowledge proofs (ZK proofs) are cryptographic protocols that allow one party to prove to another that a statement is true without revealing any information beyond the validity of the statement itself. On Solana, ZK proofs enable privacy-preserving applications and efficient state compression.

## Overview

This section covers the fundamental concepts of zero-knowledge proofs and how they're implemented on Solana through the Light Protocol and ZK Compression.

## What You'll Learn

- **Groth16 proof system**: Fast verification with small proof sizes
- **Merkle tree structures**: Efficient state storage and verification
- **Nullifiers**: Prevent double-spending without revealing transaction details
- **Proof generation and verification**: How proofs are created and validated on-chain

## Prerequisites

Before starting this section, you should understand:

- [Compression Basics](../01-compression-basics/) - Compressed accounts and Merkle trees
- Basic cryptography concepts (hashing, digital signatures)
- Solana program development (Rust or Anchor)

## Core Concepts

### What is a Zero-Knowledge Proof?

A zero-knowledge proof allows you to prove knowledge of information without revealing the information itself. For example:

- Prove you have enough balance to make a payment without revealing your balance
- Prove you're over 18 without revealing your birthdate
- Prove you own an NFT without revealing which one

### ZK Proofs on Solana

Solana uses zero-knowledge proofs for two main purposes:

1. **State Compression**: Verify that compressed accounts exist in Merkle trees
2. **Privacy**: Enable confidential transactions and private state

## Groth16 Proof System

Groth16 is a pairing-based zk-SNARK (Zero-Knowledge Succinct Non-Interactive Argument of Knowledge) that provides:

- **Small Proof Size**: Constant 128 bytes regardless of statement complexity
- **Fast Verification**: ~200,000 compute units on Solana
- **Non-Interactive**: No back-and-forth communication required

### Why Groth16?

Groth16 is the practical choice for Solana because:

- Proof size fits within transaction limits
- Verification is fast enough for on-chain execution
- Well-studied and battle-tested cryptography
- Supported by mature tooling (circom, snarkjs)

### Groth16 Verification Example

```rust
use groth16_solana::{Groth16Verifier, G1, FromBytes, ToBytes};

// Prepare public inputs
let mut public_inputs_vec = Vec::new();
for input in PUBLIC_INPUTS.chunks(32) {
    public_inputs_vec.push(input);
}

// Parse proof components
let proof_a: G1 = <G1 as FromBytes>::read(
    &*[&change_endianness(&PROOF[0..64])[..], &[0u8][..]].concat()
).unwrap();

let mut proof_a_neg = [0u8; 65];
<G1 as ToBytes>::write(&proof_a.neg(), &mut proof_a_neg[..]).unwrap();

let proof_a = change_endianness(&proof_a_neg[..64]).try_into().unwrap();
let proof_b = PROOF[64..192].try_into().unwrap();
let proof_c = PROOF[192..256].try_into().unwrap();

// Verify the proof
let mut verifier = Groth16Verifier::new(
    &proof_a,
    &proof_b,
    &proof_c,
    public_inputs_vec.as_slice(),
    &VERIFYING_KEY,
).unwrap();

verifier.verify().unwrap();
```

## Merkle Trees for State Verification

Merkle trees are the foundation of ZK Compression's state verification system.

### Merkle Tree Structure

```
                    Root Hash (on-chain)
                   /                    \
              Node 4                    Node 5
             /      \                  /      \
         Node 0    Node 1          Node 2    Node 3
         /    \    /    \          /    \    /    \
      Leaf0 Leaf1 Leaf2 Leaf3  Leaf4 Leaf5 Leaf6 Leaf7
```

**Key Properties:**

- Each leaf contains a compressed account hash
- Parent nodes are hashes of their children
- Only the root hash is stored on-chain
- Proof path consists of sibling hashes from leaf to root

### Merkle Proof Verification

To verify a leaf exists in the tree:

1. Start with the leaf hash
2. Hash with sibling at each level
3. Continue up the tree to the root
4. Compare calculated root with on-chain root

**Visual Example:**

```
Verifying Leaf 1:

Step 1: Hash(Leaf 1, Leaf 0) = Node 0
Step 2: Hash(Node 0, Node 1) = Node 4  
Step 3: Hash(Node 4, Node 5) = Root

Proof Path: [Leaf 0, Node 1, Node 5]
```

### Batched Proofs with ZK

Instead of including all sibling hashes (832 bytes for height 26), ZK Compression batches multiple Merkle proofs into a single 128-byte ZK proof:

```
┌─────────────────────────────────────────┐
│  Multiple Merkle Proofs (832 bytes each)│
│  ├─ Account 1 proof                     │
│  ├─ Account 2 proof                     │
│  └─ Account N proof                     │
└─────────────────────────────────────────┘
              ↓
    ┌──────────────────┐
    │  ZK Proof Circuit │
    └──────────────────┘
              ↓
    ┌──────────────────┐
    │  128-byte Proof  │
    └──────────────────┘
```

## Nullifiers

Nullifiers are deterministically derived hashes that ensure an action can only be performed once, without revealing the action or user.

### What are Nullifiers?

A nullifier is a cryptographic commitment that:

- Is derived deterministically from private inputs
- Cannot be linked back to the original inputs
- Can only be created once (double-spend prevention)
- Is publicly verifiable

### Use Cases

- **Private Payments**: Prevent double-spending without revealing amounts
- **Anonymous Voting**: Ensure one vote per person without revealing identity
- **Claim Systems**: Allow one-time claims without tracking users
- **Access Control**: Grant one-time access without revealing credentials

### Nullifier Implementation on Solana

On Solana, nullifiers can be implemented two ways:

**1. Regular PDA Nullifiers (Expensive)**

```rust
// Cost: 890,880 lamports per nullifier
let (nullifier_pda, bump) = Pubkey::find_program_address(
    &[b"nullifier", nullifier_hash.as_ref()],
    &program_id
);
```

**2. Compressed PDA Nullifiers (Efficient)**

```rust
// Cost: 15,000 lamports per nullifier
use light_nullifier_program::sdk::create_nullifier_ix;

let ix = create_nullifier_ix(&mut rpc, payer.pubkey(), id).await?;
```

**Cost Comparison:**

| Storage Type | Cost per Nullifier |
|:-------------|:-------------------|
| Regular PDA  | 890,880 lamports   |
| Compressed PDA | 15,000 lamports  |

### Nullifier Creation Flow

```
┌──────────────────┐
│  Private Inputs  │
│  (secret data)   │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Hash Function   │
│  (deterministic) │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Nullifier Hash  │
│  (public)        │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│  Create PDA      │
│  (on-chain)      │
└──────────────────┘
```

### Nullifier Program Example

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
        // let public_inputs = [...nullifiers, ...your_other_inputs];
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

#[derive(Accounts)]
pub struct CreateNullifierAccounts<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
}
```

### Checking if Nullifier Exists

**TypeScript:**

```typescript
import { deriveNullifierAddress } from "@lightprotocol/nullifier-program";
import { bn } from "@lightprotocol/stateless.js";

const address = deriveNullifierAddress(id);
const account = await rpc.getCompressedAccount(bn(address.toBytes()));
const exists = account !== null;

if (exists) {
    console.log("Nullifier already used - double spend attempt!");
}
```

**Rust:**

```rust
use light_nullifier_program::sdk::fetch_proof;

let proof_result = fetch_proof(&mut rpc, &id).await;

match proof_result {
    Ok(_) => println!("Nullifier already exists"),
    Err(_) => println!("Nullifier available"),
}
```

## Cryptographic Flow Diagrams

### State Compression Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Transaction Flow                      │
└─────────────────────────────────────────────────────────┘

1. Client Prepares Transaction
   ┌──────────────────┐
   │  Compressed      │
   │  Account Data    │
   └────────┬─────────┘
            │
            ↓
   ┌──────────────────┐
   │  Request Proof   │
   │  from RPC        │
   └────────┬─────────┘
            │
            ↓

2. RPC Generates Proof
   ┌──────────────────┐
   │  Fetch Account   │
   │  from Merkle Tree│
   └────────┬─────────┘
            │
            ↓
   ┌──────────────────┐
   │  Generate        │
   │  Merkle Proof    │
   └────────┬─────────┘
            │
            ↓
   ┌──────────────────┐
   │  Create ZK Proof │
   │  (128 bytes)     │
   └────────┬─────────┘
            │
            ↓

3. On-Chain Verification
   ┌──────────────────┐
   │  Submit TX with  │
   │  Proof + Data    │
   └────────┬─────────┘
            │
            ↓
   ┌──────────────────┐
   │  Light System    │
   │  Program         │
   └────────┬─────────┘
            │
            ↓
   ┌──────────────────┐
   │  Verify Proof    │
   │  Against Root    │
   └────────┬─────────┘
            │
            ↓
   ┌──────────────────┐
   │  Update State    │
   │  (new root)      │
   └──────────────────┘
```

### Private Payment Flow

```
┌─────────────────────────────────────────────────────────┐
│              Private Payment with Nullifiers             │
└─────────────────────────────────────────────────────────┘

Sender Side:
   ┌──────────────────┐
   │  Private Balance │
   │  (secret)        │
   └────────┬─────────┘
            │
            ↓
   ┌──────────────────┐
   │  Generate        │
   │  Nullifier       │
   └────────┬─────────┘
            │
            ↓
   ┌──────────────────┐
   │  Create ZK Proof │
   │  (balance ≥ amt) │
   └────────┬─────────┘
            │
            ↓

On-Chain Verification:
   ┌──────────────────┐
   │  Verify Proof    │
   └────────┬─────────┘
            │
            ↓
   ┌──────────────────┐
   │  Check Nullifier │
   │  Not Used        │
   └────────┬─────────┘
            │
            ↓
   ┌──────────────────┐
   │  Create Nullifier│
   │  PDA             │
   └────────┬─────────┘
            │
            ↓
   ┌──────────────────┐
   │  Transfer Funds  │
   │  (encrypted)     │
   └──────────────────┘
```

## Proof Generation Workflow

### Circuit Design

1. **Define Constraints**: Specify what needs to be proven
2. **Write Circuit**: Implement in circom or similar language
3. **Generate Keys**: Create proving and verifying keys
4. **Deploy Verifier**: Deploy verifying key on-chain

### Proof Generation

1. **Prepare Inputs**: Gather public and private inputs
2. **Generate Witness**: Compute intermediate values
3. **Create Proof**: Run proving algorithm
4. **Submit Transaction**: Include proof in transaction

### Example Circuit Structure

```circom
template CompressedAccountProof() {
    // Private inputs (not revealed)
    signal input accountData;
    signal input merkleProof[26];
    
    // Public inputs (revealed)
    signal input merkleRoot;
    signal input accountHash;
    
    // Constraints
    // 1. Verify account hash is correct
    component hasher = Poseidon(1);
    hasher.inputs[0] <== accountData;
    hasher.out === accountHash;
    
    // 2. Verify Merkle proof
    component merkleVerifier = MerkleTreeVerifier(26);
    merkleVerifier.leaf <== accountHash;
    merkleVerifier.proof <== merkleProof;
    merkleVerifier.root === merkleRoot;
}
```

## Performance Considerations

### Proof Size Comparison

| Proof Type | Size | Verification Cost |
|:-----------|:-----|:------------------|
| Merkle Proof (height 26) | 832 bytes | ~50k CU |
| Groth16 ZK Proof | 128 bytes | ~200k CU |
| Batched ZK Proof (8 accounts) | 128 bytes | ~200k CU |

### Optimization Strategies

1. **Batch Operations**: Verify multiple accounts in one proof
2. **Use V2 Trees**: Leverage `prove_by_index` optimization
3. **Minimize Public Inputs**: Fewer inputs = faster verification
4. **Reuse Circuits**: Deploy circuits once, use many times

## Security Considerations

### Trusted Setup

Groth16 requires a trusted setup ceremony:

- Generates proving and verifying keys
- Must be performed securely to prevent forgery
- Light Protocol uses audited, publicly verified setups

### Common Pitfalls

1. **Weak Randomness**: Use cryptographically secure random number generators
2. **Input Validation**: Always validate public inputs on-chain
3. **Nullifier Collisions**: Ensure nullifiers are globally unique
4. **Proof Replay**: Include transaction-specific data in proofs

## Development Tools

### Circuit Development

- **circom**: Circuit compiler for zk-SNARKs
- **snarkjs**: JavaScript library for proof generation
- **circomlib**: Library of common circuits

### Solana Integration

- **groth16-solana**: Rust crate for on-chain verification
- **light-sdk**: SDK for compressed accounts with ZK proofs
- **@lightprotocol/stateless.js**: TypeScript client for proof generation

## Real-World Examples

### ZK Identity Verification

Prove identity attributes without revealing personal information:

```rust
// Circuit proves: age >= 18 AND country == "US"
// Without revealing actual age or full identity
pub fn verify_identity(
    proof: &[u8],
    public_inputs: &[u8],
) -> Result<()> {
    // Verify proof on-chain
    Groth16Verifier::new(proof, public_inputs, &VERIFYING_KEY)?.verify()
}
```

### Private Token Transfers

Transfer tokens without revealing amounts:

```typescript
// Generate proof that: balance >= amount
const proof = await generateTransferProof({
    balance: privateBalance,  // secret
    amount: transferAmount,   // secret
    nullifier: oldNullifier,  // secret
});

// Submit transaction with proof
await submitPrivateTransfer(proof, newNullifier);
```

## Next Steps

1. **Explore Light Protocol**: Learn how ZK proofs are integrated in [03. Light Protocol](../03-light-protocol/)
2. **Build Confidential Transfers**: Create private payment systems in [04. Confidential Transfers](../04-confidential-transfers/)
3. **Practice with Exercises**: Work through ZK proof examples in [Exercises](../exercises/)

## Resources

### Documentation

- [Groth16 Solana Docs](https://docs.rs/groth16-solana) - On-chain verification library
- [ZK Compression Docs](https://www.zkcompression.com/zk/overview) - ZK primitives guide
- [Nullifier Program](https://github.com/Lightprotocol/nullifier-program) - Reference implementation

### Learning Resources

- [Zero-Knowledge Proofs: An Introduction](https://www.helius.dev/blog/zero-knowledge-proofs-an-introduction-to-the-fundamentals) - Fundamentals
- [ZK Proofs on Solana](https://www.helius.dev/blog/zero-knowledge-proofs-its-applications-on-solana) - Solana-specific applications

### Examples

- [ZK Nullifier Example](https://github.com/Lightprotocol/program-examples/tree/main/zk/nullifier) - Simple nullifier program
- [ZK Identity Example](https://github.com/Lightprotocol/program-examples/tree/main/zk/zk-id) - Identity verification with ZK
- [Program Examples](https://github.com/Lightprotocol/program-examples) - Full collection

### Community

- [Light Protocol Discord](https://discord.gg/7cJ8BhAXhu) - Developer support
- [Twitter/X](https://x.com/lightprotocol) - Updates and announcements

---

**Source Attribution**: Content extracted and curated from:
- [solana-privacy/docs-v2/zk/overview.mdx](https://github.com/Lightprotocol/light-protocol/blob/main/docs-v2/zk/overview.mdx)
- [solana-privacy/docs-v2/learn/core-concepts/merkle-trees-validity-proofs.mdx](https://github.com/Lightprotocol/light-protocol/blob/main/docs-v2/learn/core-concepts/merkle-trees-validity-proofs.mdx)
- [solana-privacy/nullifier-program/README.md](https://github.com/Lightprotocol/nullifier-program)
- [Helius ZK Proofs Blog](https://www.helius.dev/blog/zero-knowledge-proofs-an-introduction-to-the-fundamentals)
