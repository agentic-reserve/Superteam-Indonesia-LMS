# Post-Quantum Cryptography on Solana

## Overview

Quantum computers pose a significant threat to current cryptographic systems. This lesson covers post-quantum cryptography (PQC), quantum-resistant algorithms, and how to implement them on Solana to future-proof your applications.

## Learning Objectives

- Understand the quantum computing threat to blockchain security
- Learn about hash-based signature schemes (WOTS+)
- Implement Winternitz one-time signatures
- Integrate liboqs for quantum-resistant algorithms
- Evaluate performance trade-offs of PQC schemes
- Build quantum-resistant Solana programs

## The Quantum Threat

### Why Current Cryptography is Vulnerable

Modern blockchain systems rely on cryptographic primitives that quantum computers can break:

**Vulnerable:**
- **Ed25519 signatures** - Broken by Shor's algorithm
- **ECDSA** - Broken by Shor's algorithm
- **RSA** - Broken by Shor's algorithm

**Resistant:**
- **Hash functions** (SHA-256, Keccak) - Weakened but not broken by Grover's algorithm
- **Symmetric encryption** (AES) - Requires larger key sizes but remains secure

### Threat Timeline

- **Current:** Quantum computers exist but are not yet powerful enough
- **5-10 years:** Quantum computers may break current cryptography
- **"Harvest now, decrypt later":** Attackers can store encrypted data today and decrypt it when quantum computers become available

### Impact on Blockchain

If quantum computers break Ed25519:
- **Private keys compromised** - Attackers can sign transactions
- **Funds stolen** - All wallets become vulnerable
- **Network security** - Validator keys compromised

## Post-Quantum Cryptography Solutions

### 1. Hash-Based Signatures

Hash-based signatures rely only on the security of hash functions, which are quantum-resistant.

**Advantages:**
- Proven security based on hash function properties
- Well-understood cryptographic foundations
- Quantum-resistant

**Disadvantages:**
- Larger signature sizes
- One-time use (WOTS) or limited use (XMSS)
- Higher computational cost

### 2. Lattice-Based Cryptography

Based on hard problems in lattice mathematics.

**Examples:**
- **CRYSTALS-Dilithium** - NIST standard for signatures
- **CRYSTALS-Kyber** - NIST standard for key encapsulation

### 3. Code-Based Cryptography

Based on error-correcting codes.

**Example:**
- **Classic McEliece** - NIST standard for key encapsulation

## Winternitz One-Time Signatures (WOTS+)

WOTS+ is a hash-based signature scheme that provides quantum resistance.

### How WOTS+ Works

**Key Generation:**
1. Generate random private key (array of random values)
2. Hash each private key element multiple times
3. Public key is the final hash of each element

**Signing:**
1. Hash the message
2. Split hash into chunks
3. For each chunk, reveal some private key elements
4. Signature is the partially revealed private key

**Verification:**
1. Hash the signature elements the remaining times
2. Compare with public key

### Security Properties

- **Preimage resistance:** 224-256 bits (quantum-resistant)
- **Collision resistance:** 112-128 bits (quantum-resistant)
- **One-time use:** Each key pair can only sign ONE message safely

### WOTS+ Implementation

From solana-post-quantum/hashsigs-rs:

```rust
// Key generation
pub fn wots_keygen() -> (WotsPrivateKey, WotsPublicKey) {
    let mut private_key = WotsPrivateKey::new();
    
    // Generate random private key elements
    for i in 0..WOTS_LEN {
        private_key.elements[i] = random_bytes(HASH_SIZE);
    }
    
    // Compute public key by hashing each element W times
    let mut public_key = WotsPublicKey::new();
    for i in 0..WOTS_LEN {
        public_key.elements[i] = hash_chain(
            &private_key.elements[i],
            WOTS_W
        );
    }
    
    (private_key, public_key)
}

// Signing
pub fn wots_sign(
    message: &[u8],
    private_key: &WotsPrivateKey,
) -> WotsSignature {
    let message_hash = keccak256(message);
    let chunks = split_into_chunks(&message_hash, WOTS_W);
    
    let mut signature = WotsSignature::new();
    for (i, chunk) in chunks.iter().enumerate() {
        // Hash private key element 'chunk' times
        signature.elements[i] = hash_chain(
            &private_key.elements[i],
            *chunk as usize
        );
    }
    
    signature
}

// Verification
pub fn wots_verify(
    message: &[u8],
    signature: &WotsSignature,
    public_key: &WotsPublicKey,
) -> bool {
    let message_hash = keccak256(message);
    let chunks = split_into_chunks(&message_hash, WOTS_W);
    
    for (i, chunk) in chunks.iter().enumerate() {
        // Hash signature element remaining times
        let computed = hash_chain(
            &signature.elements[i],
            WOTS_W - (*chunk as usize)
        );
        
        if computed != public_key.elements[i] {
            return false;
        }
    }
    
    true
}

fn hash_chain(input: &[u8], iterations: usize) -> [u8; HASH_SIZE] {
    let mut result = *input;
    for _ in 0..iterations {
        result = keccak256(&result);
    }
    result
}
```

## Solana Winternitz Vault

The Solana Winternitz Vault demonstrates a practical quantum-resistant application.

### Architecture

```
┌─────────────────────────────────────┐
│     Winternitz Vault Program        │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Open Vault                 │  │
│  │   - Generate WOTS+ keypair   │  │
│  │   - Create PDA from pubkey   │  │
│  │   - Store lamports           │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Split Vault                │  │
│  │   - Verify WOTS+ signature   │  │
│  │   - Split funds to 2 vaults  │  │
│  │   - Close original vault     │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Close Vault                │  │
│  │   - Verify WOTS+ signature   │  │
│  │   - Refund all lamports      │  │
│  │   - Close vault account      │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### Key Features

**Quantum Resistance:**
- Uses WOTS+ signatures instead of Ed25519
- 224-bit preimage resistance (truncated Keccak256)
- 256-bit collision resistance for PDA seeds

**One-Time Use Pattern:**
- Each vault can only be spent once
- Splitting creates two new vaults
- Maintains unbroken chain of quantum-resistant signatures

**Solana Optimization:**
- Truncated hashes to fit compute limits
- Efficient PDA validation
- Minimal instruction data

### Usage Example

```rust
// 1. Open a new vault
let (private_key, public_key) = wots_keygen();
let vault_pda = derive_vault_pda(&public_key);

open_vault(
    &vault_pda,
    &public_key,
    initial_lamports,
)?;

// 2. Split vault (spend funds)
let split_account = Keypair::new();
let refund_account = Keypair::new();

let message = create_split_message(
    split_amount,
    &split_account.pubkey(),
    &refund_account.pubkey(),
);

let signature = wots_sign(&message, &private_key);

split_vault(
    &vault_pda,
    &signature,
    &public_key,
    split_amount,
    &split_account,
    &refund_account,
)?;

// 3. Open new vaults with split funds
// (Maintains quantum-resistant chain)
```

### Security Considerations

**Critical:**
- **Never reuse keys** - Each signature reveals ~50% of private key
- **Always create new vaults** - Split/close operations must open new vaults
- **Protect update authority** - Use quantum-resistant keys for program upgrades

**Limitations:**
- Larger transaction sizes due to signature size
- Higher compute units for verification
- More complex key management

## liboqs Integration

liboqs provides a comprehensive library of quantum-resistant algorithms.

### Supported Algorithms

**Key Encapsulation Mechanisms (KEMs):**
- CRYSTALS-Kyber (NIST standard)
- Classic McEliece
- BIKE
- HQC
- FrodoKEM

**Signature Schemes:**
- CRYSTALS-Dilithium (NIST standard)
- Falcon
- SPHINCS+
- MAYO

### Using liboqs in Rust

From solana-post-quantum/liboqs-rust:

```rust
use oqs::*;

// Key encapsulation example
fn kem_example() -> Result<()> {
    let kem = kem::Kem::new(kem::Algorithm::Kyber512)?;
    
    // Generate keypair
    let (public_key, secret_key) = kem.keypair()?;
    
    // Encapsulate (create shared secret)
    let (ciphertext, shared_secret_sender) = kem.encapsulate(&public_key)?;
    
    // Decapsulate (recover shared secret)
    let shared_secret_receiver = kem.decapsulate(&secret_key, &ciphertext)?;
    
    assert_eq!(shared_secret_sender, shared_secret_receiver);
    Ok(())
}

// Signature example
fn sig_example() -> Result<()> {
    let sig = sig::Sig::new(sig::Algorithm::Dilithium2)?;
    
    // Generate keypair
    let (public_key, secret_key) = sig.keypair()?;
    
    // Sign message
    let message = b"Hello, quantum world!";
    let signature = sig.sign(message, &secret_key)?;
    
    // Verify signature
    sig.verify(message, &signature, &public_key)?;
    
    Ok(())
}
```

### Hybrid Cryptography

Combine classical and post-quantum algorithms for defense-in-depth:

```rust
// Hybrid signature: Ed25519 + Dilithium
pub struct HybridSignature {
    ed25519_sig: [u8; 64],
    dilithium_sig: Vec<u8>,
}

pub fn hybrid_sign(
    message: &[u8],
    ed25519_key: &Keypair,
    dilithium_key: &DilithiumSecretKey,
) -> HybridSignature {
    let ed25519_sig = ed25519_key.sign(message);
    let dilithium_sig = dilithium_sign(message, dilithium_key);
    
    HybridSignature {
        ed25519_sig: ed25519_sig.to_bytes(),
        dilithium_sig,
    }
}

pub fn hybrid_verify(
    message: &[u8],
    signature: &HybridSignature,
    ed25519_pk: &Pubkey,
    dilithium_pk: &DilithiumPublicKey,
) -> bool {
    // Both signatures must be valid
    let ed25519_valid = ed25519_verify(
        message,
        &signature.ed25519_sig,
        ed25519_pk,
    );
    
    let dilithium_valid = dilithium_verify(
        message,
        &signature.dilithium_sig,
        dilithium_pk,
    );
    
    ed25519_valid && dilithium_valid
}
```

## Performance Comparison

### Signature Sizes

| Scheme | Public Key | Signature | Security Level |
|--------|-----------|-----------|----------------|
| Ed25519 | 32 bytes | 64 bytes | Classical |
| WOTS+ | ~2 KB | ~2 KB | Quantum-resistant |
| Dilithium2 | 1,312 bytes | 2,420 bytes | Quantum-resistant |
| Falcon-512 | 897 bytes | 666 bytes | Quantum-resistant |
| SPHINCS+-128s | 32 bytes | 7,856 bytes | Quantum-resistant |

### Verification Time

| Scheme | Verification Time | Compute Units (est.) |
|--------|------------------|---------------------|
| Ed25519 | ~50 μs | ~2,000 CU |
| WOTS+ | ~500 μs | ~20,000 CU |
| Dilithium2 | ~200 μs | ~8,000 CU |
| Falcon-512 | ~150 μs | ~6,000 CU |

### Trade-offs

**WOTS+ (Hash-based):**
- ✅ Simple, well-understood
- ✅ Minimal assumptions (hash security only)
- ❌ One-time use
- ❌ Large signatures

**Dilithium (Lattice-based):**
- ✅ Reusable keys
- ✅ NIST standard
- ✅ Reasonable performance
- ❌ Larger than classical
- ❌ Complex mathematics

**Falcon (Lattice-based):**
- ✅ Smaller signatures than Dilithium
- ✅ Fast verification
- ❌ Complex implementation
- ❌ Floating-point operations

## Migration Strategy

### Phase 1: Preparation (Now)
1. Audit current cryptographic dependencies
2. Identify quantum-vulnerable components
3. Research suitable PQC alternatives
4. Test PQC implementations on devnet

### Phase 2: Hybrid Deployment
1. Deploy hybrid classical + PQC systems
2. Maintain backward compatibility
3. Monitor performance impact
4. Gather real-world data

### Phase 3: Full Migration
1. Transition to PQC-only systems
2. Deprecate classical cryptography
3. Update all client software
4. Educate users on new key management

## Best Practices

1. **Use hybrid cryptography** during transition period
2. **Never reuse WOTS+ keys** - Implement strict key lifecycle management
3. **Plan for larger transactions** - PQC signatures are bigger
4. **Budget more compute units** - PQC verification is more expensive
5. **Test thoroughly** - PQC implementations are newer and more complex
6. **Monitor NIST standards** - Stay updated on recommended algorithms
7. **Prepare migration plans** - Don't wait for quantum computers to exist

## Exercises

1. **WOTS+ Implementation:** Implement a basic WOTS+ signature scheme
2. **Vault Creation:** Build a quantum-resistant vault using WOTS+
3. **Performance Testing:** Benchmark different PQC algorithms on Solana
4. **Hybrid System:** Implement a hybrid Ed25519 + Dilithium signature scheme
5. **Migration Plan:** Design a migration strategy for an existing protocol

## Additional Resources

- [NIST Post-Quantum Cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography) - NIST's standardization project for post-quantum cryptographic algorithms
- [Open Quantum Safe Project](https://openquantumsafe.org/) - Open-source implementations of quantum-resistant cryptographic algorithms
- [PQC Security Considerations](https://nvlpubs.nist.gov/nistpubs/ir/2016/NIST.IR.8105.pdf) - NIST report on security considerations for post-quantum cryptography
- [Quantum Threat Timeline](https://globalriskinstitute.org/publications/quantum-threat-timeline/) - Analysis of when quantum computers may threaten current cryptography

## Source Attribution

This content is derived from:

**WOTS+ Implementation:**
- **Repository:** solana-post-quantum/hashsigs-rs
- **File:** `README.md`, `src/`
- **URL:** [hashsigs-rs documentation](../../solana-post-quantum/hashsigs-rs/README.md)

**Winternitz Vault:**
- **Repository:** solana-post-quantum/solana-winternitz-vault
- **File:** `Readme.md`, `src/`
- **URL:** [winternitz-vault documentation](../../solana-post-quantum/solana-winternitz-vault/Readme.md)

**liboqs Integration:**
- **Repository:** solana-post-quantum/liboqs-rust
- **File:** `README.md`
- **URL:** [liboqs-rust documentation](../../solana-post-quantum/liboqs-rust/README.md)

---

**Next:** Practice your security skills with [Security Exercises](../exercises/).
