# Keypair Management

Learn how to create, restore, and verify keypairs on Solana. Keypairs are essential for signing transactions and proving ownership of accounts.

## Table of Contents

- [Creating Keypairs](#creating-keypairs)
- [Restoring from Bytes](#restoring-from-bytes)
- [Restoring from Base58](#restoring-from-base58)
- [Verifying Keypairs](#verifying-keypairs)
- [Validating Public Keys](#validating-public-keys)
- [Best Practices](#best-practices)

---

## Creating Keypairs

To send transactions on Solana, you need a keypair to sign them. If you're connecting to a wallet application (like Phantom or Solflare), the wallet manages the keypair for you. However, for backend services or testing, you'll need to generate keypairs programmatically.

### Generating New Keypairs


**Solana Kit (Modern)**:
```typescript
import { generateKeyPairSigner } from "@solana/kit";

const signer = await generateKeyPairSigner();
console.log("address:", signer.address);
```

**Legacy Web3.js**:
```typescript
import { Keypair } from "@solana/web3.js";

const keypair = Keypair.generate();
console.log("address:", keypair.publicKey.toBase58());
```

**Rust**:
```rust
use solana_sdk::{signature::Keypair, signer::Signer};

fn main() {
    let keypair = Keypair::new();
    let address = keypair.pubkey();
    println!("address: {address}");
}
```

**Python**:
```python
from solders.keypair import Keypair

keypair = Keypair()
print(f"address: {keypair.pubkey()}")
print(f"secret: {keypair.secret()}")
```

### When to Generate Keypairs

✅ **Generate keypairs for**:
- Backend services
- Testing and development
- Automated bots
- Program deployment

❌ **Don't generate for**:
- User wallets (use wallet adapters)
- Production user accounts (security risk)
- Long-term storage without encryption

---

## Restoring from Bytes

If you have an existing secret key as a byte array, you can restore your keypair from it.

### From Byte Array

**Solana Kit**:
```typescript
import { createKeyPairSignerFromBytes } from "@solana/kit";

const keypairBytes = new Uint8Array([
  174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
  222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
  15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
  121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135
]);

const signer = await createKeyPairSignerFromBytes(keypairBytes);
console.log(signer.address);
```

**Legacy Web3.js**:
```typescript
import { Keypair } from "@solana/web3.js";

const keypairBytes = Uint8Array.from([
  174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
  222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
  15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
  121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135
]);

const keypair = Keypair.fromSecretKey(keypairBytes);
console.log(keypair.publicKey.toString());
```

**Rust**:
```rust
use anyhow::Result;
use solana_sdk::{signature::Keypair, signer::Signer};

fn main() -> Result<()> {
    let keypair_bytes = [
        174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
        222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
        15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
        121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135,
    ];
    
    let keypair = Keypair::try_from(&keypair_bytes[..])?;
    println!("{}", keypair.pubkey());
    
    Ok(())
}
```

### Byte Array Format

The byte array contains:
- **64 bytes total** (for Ed25519)
- **First 32 bytes**: Private key
- **Last 32 bytes**: Public key

⚠️ **Security Warning**: Never expose private key bytes in production code or commit them to version control.

---

## Restoring from Base58

Base58 encoding is a common format for representing keypairs as strings.

### From Base58 String

**Solana Kit**:
```typescript
import {
  createKeyPairFromBytes,
  createSignerFromKeyPair,
  getBase58Encoder
} from "@solana/kit";

const keypairBase58 = "5MaiiCavjCmn9Hs1o3eznqDEhRwxo7pXiAYez7keQUviUkauRiTMD8DrESdrNjN8zd9mTmVhRvBJeg5vhyvgrAhG";

const keypair = await createKeyPairFromBytes(
  getBase58Encoder().encode(keypairBase58)
);
const signer = await createSignerFromKeyPair(keypair);

console.log(signer.address);
```

**Legacy Web3.js**:
```typescript
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

const keypairBase58 = "5MaiiCavjCmn9Hs1o3eznqDEhRwxo7pXiAYez7keQUviUkauRiTMD8DrESdrNjN8zd9mTmVhRvBJeg5vhyvgrAhG";

const keypairBytes = bs58.decode(keypairBase58);
const keypair = Keypair.fromSecretKey(keypairBytes);

console.log(keypair.publicKey.toBase58());
```

**Rust**:
```rust
use anyhow::Result;
use solana_sdk::{signature::Keypair, signer::Signer};

fn main() -> Result<()> {
    let keypair_base58 = "4UzFMkVbk1q6ApxvDS8inUxg4cMBxCQRVXRx5msqQyktbi1QkJkt574Jda6BjZThSJi54CHfVoLFdVFX8XFn233L";
    
    let keypair = Keypair::from_base58_string(keypair_base58);
    println!("{:?}", keypair.pubkey());
    
    Ok(())
}
```

**Python**:
```python
from solders.keypair import Keypair

def main():
    keypair_bytes = bytes([
        174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
        222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
        15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
        121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135
    ])
    
    signer = Keypair.from_bytes(keypair_bytes)
    print(signer.pubkey())

if __name__ == "__main__":
    main()
```

### Base58 Use Cases

Base58 is commonly used for:
- Solana CLI keypair files
- Configuration files
- Environment variables
- Human-readable key representation

---

## Verifying Keypairs

You can verify if a secret key matches a given public key:

**Solana Kit**:
```typescript
import { createKeyPairSignerFromBytes, address } from "@solana/kit";

const publicKey = address("24PNhTaNtomHhoy3fTRaMhAFCRj4uHqhZEEoWrKDbR5p");

const keypairBytes = new Uint8Array([
  174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
  222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
  15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
  121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135
]);

const signer = await createKeyPairSignerFromBytes(keypairBytes);
console.log(signer.address === publicKey); // true or false
```

**Legacy Web3.js**:
```typescript
import { Keypair, PublicKey } from "@solana/web3.js";

const publicKey = new PublicKey("24PNhTaNtomHhoy3fTRaMhAFCRj4uHqhZEEoWrKDbR5p");

const keypair = Keypair.fromSecretKey(
  Uint8Array.from([
    174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
    222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
    15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
    121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135
  ])
);

console.log(keypair.publicKey.toBase58() === publicKey.toBase58());
```

**Rust**:
```rust
use anyhow::Result;
use solana_sdk::{pubkey, signature::Keypair, signer::Signer};

fn main() -> Result<()> {
    let keypair_bytes = [
        174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
        222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
        15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
        121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135,
    ];
    
    let public_key = pubkey!("24PNhTaNtomHhoy3fTRaMhAFCRj4uHqhZEEoWrKDbR5p");
    let keypair = Keypair::try_from(&keypair_bytes[..])?;
    
    println!("{}", keypair.pubkey().eq(&public_key));
    
    Ok(())
}
```

**Python**:
```python
from solders.keypair import Keypair
from solders.pubkey import Pubkey

def main():
    public_key = Pubkey.from_string("24PNhTaNtomHhoy3fTRaMhAFCRj4uHqhZEEoWrKDbR5p")
    
    keypair_bytes = bytes([
        174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
        222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
        15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
        121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135
    ])
    
    signer = Keypair.from_bytes(keypair_bytes)
    print(signer.pubkey() == public_key)

if __name__ == "__main__":
    main()
```

### Why Verify Keypairs?

- Ensure correct key restoration
- Validate configuration files
- Debug key management issues
- Confirm key ownership

---

## Validating Public Keys

Not all public keys are valid for user control. Some addresses (like Program Derived Addresses) don't have corresponding private keys.

### Checking if Key is On Curve

**Legacy Web3.js**:
```typescript
import { PublicKey } from "@solana/web3.js";

// On curve address (can be controlled by a user)
const key = new PublicKey("5oNDL3swdJJF1g9DzJiZ4ynHXgszjAEpUkxVYejchzrY");
console.log(PublicKey.isOnCurve(key.toBytes())); // true

// Off curve address (PDA - cannot be controlled by a user)
const offCurveAddress = new PublicKey("4BJXYkfvg37zEmBbsacZjeQDpTNx91KppxFJxRqrz48e");
console.log(PublicKey.isOnCurve(offCurveAddress.toBytes())); // false
```

**Rust**:
```rust
use anyhow::Result;
use solana_sdk::pubkey;

fn main() -> Result<()> {
    // On curve address
    let on_curve_public_key = pubkey!("5oNDL3swdJJF1g9DzJiZ4ynHXgszjAEpUkxVYejchzrY");
    println!("is on curve: {}", on_curve_public_key.is_on_curve());
    
    // Off curve address (PDA)
    let off_curve_public_key = pubkey!("4BJXYkfvg37zEmBbsacZjeQDpTNx91KppxFJxRqrz48e");
    println!("is off curve: {}", off_curve_public_key.is_on_curve());
    
    Ok(())
}
```

**Python**:
```python
from solders.pubkey import Pubkey

def main():
    # On curve address
    key = Pubkey.from_string("5oNDL3swdJJF1g9DzJiZ4ynHXgszjAEpUkxVYejchzrY")
    print(key.is_on_curve())
    
    # Off curve address
    off_curve_address = Pubkey.from_string("4BJXYkfvg37zEmBbsacZjeQDpTNx91KppxFJxRqrz48e")
    print(off_curve_address.is_on_curve())

if __name__ == "__main__":
    main()
```

### On Curve vs Off Curve

**On Curve** (can have private key):
- Regular user wallets
- Token accounts owned by users
- Any account controlled by a keypair

**Off Curve** (no private key):
- Program Derived Addresses (PDAs)
- System-owned accounts
- Program-controlled accounts

---

## Best Practices

### Security

✅ **Do**:
- Store private keys encrypted
- Use environment variables for keys
- Never commit keys to version control
- Use hardware wallets for production
- Implement key rotation policies

❌ **Don't**:
- Hardcode private keys in source code
- Share private keys via insecure channels
- Store keys in plain text files
- Use the same key across environments
- Log private keys

### Key Storage

**Development**:
```bash
# Use Solana CLI keypair files
solana-keygen new --outfile ~/.config/solana/id.json
```

**Production**:
- Use AWS Secrets Manager
- Use HashiCorp Vault
- Use Azure Key Vault
- Use hardware security modules (HSMs)

### Key Rotation

Implement regular key rotation:

```typescript
// Example key rotation
async function rotateKeypair(oldKeypair: Keypair) {
  // 1. Generate new keypair
  const newKeypair = Keypair.generate();
  
  // 2. Transfer assets to new keypair
  await transferAssets(oldKeypair, newKeypair);
  
  // 3. Update configuration
  await updateConfig(newKeypair);
  
  // 4. Securely delete old keypair
  secureDelete(oldKeypair);
  
  return newKeypair;
}
```

---

## Summary

Key takeaways:

✅ **Keypair Generation**: Use appropriate methods for your use case
✅ **Restoration**: Support multiple formats (bytes, base58, mnemonics)
✅ **Verification**: Always verify keypairs match expected public keys
✅ **Validation**: Check if public keys are on curve when needed
✅ **Security**: Never expose private keys, use secure storage

---

## Next Steps

- Learn about [Mnemonics](./mnemonics.md) for user-friendly key management
- Explore [Message Signing](./message-signing.md) for authentication
- Try [Vanity Addresses](./vanity-addresses.md) for custom addresses

---

**Source**: [Solana Cookbook](https://solana.com/developers/cookbook/wallets/)
**Last Updated**: February 17, 2026
