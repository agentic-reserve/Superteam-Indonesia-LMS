# Mnemonics

Mnemonics (also called seed phrases) provide a user-friendly way to backup and restore keypairs using a list of readable words instead of raw bytes.

## Generating Mnemonics

**TypeScript**:
```typescript
import * as bip39 from "bip39";

const mnemonic = bip39.generateMnemonic();
console.log(mnemonic);
// Output: "pill tomorrow foster begin walnut borrow virtual kick shift mutual shoe scatter"
```

**Rust**:
```rust
use bip39::{Language, Mnemonic, MnemonicType};

fn main() {
    let mnemonic = Mnemonic::new(MnemonicType::Words12, Language::English);
    let phrase = mnemonic.phrase();
    println!("phrase: {}", phrase);
}
```

## Restoring from BIP39 Mnemonics

BIP39 is the standard format used by most wallets.

**Solana Kit**:
```typescript
import { createKeyPairSignerFromPrivateKeyBytes } from "@solana/kit";
import * as bip39 from "bip39";

const mnemonic = "pill tomorrow foster begin walnut borrow virtual kick shift mutual shoe scatter";
const seed = bip39.mnemonicToSeedSync(mnemonic, "");

// Extract first 32 bytes for private key
const privateKeyBytes = seed.subarray(0, 32);
const signer = await createKeyPairSignerFromPrivateKeyBytes(
  new Uint8Array(privateKeyBytes)
);

console.log(signer.address);
```

**Legacy Web3.js**:
```typescript
import { Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";

const mnemonic = "pill tomorrow foster begin walnut borrow virtual kick shift mutual shoe scatter";
const seed = bip39.mnemonicToSeedSync(mnemonic, "");
const keypair = Keypair.fromSeed(seed.subarray(0, 32));

console.log(keypair.publicKey.toBase58());
```

**Rust**:
```rust
use bip39::{Language, Mnemonic, Seed};
use solana_sdk::{signature::keypair_from_seed, signer::Signer};

fn main() {
    let phrase = "pill tomorrow foster begin walnut borrow virtual kick shift mutual shoe scatter";
    let mnemonic = Mnemonic::from_phrase(phrase, Language::English).unwrap();
    let seed = Seed::new(&mnemonic, "");
    let keypair = keypair_from_seed(seed.as_bytes()).unwrap();
    
    println!("recovered address {:?}", keypair.pubkey());
}
```

## Restoring from BIP44 Mnemonics (HD Wallets)

BIP44 enables hierarchical deterministic (HD) wallets where multiple keypairs are derived from a single mnemonic.

**Solana Kit**:
```typescript
import { HDKey } from "micro-ed25519-hdkey";
import * as bip39 from "bip39";
import { createKeyPairSignerFromPrivateKeyBytes } from "@solana/kit";

const mnemonic = "neither lonely flavor argue grass remind eye tag avocado spot unusual intact";
const seed = bip39.mnemonicToSeedSync(mnemonic);
const hd = HDKey.fromMasterSeed(seed.toString("hex"));

// Derive multiple accounts
for (let i = 0; i < 10; i++) {
  const path = `m/44'/501'/${i}'/0'`;
  const child = hd.derive(path);
  const signer = await createKeyPairSignerFromPrivateKeyBytes(
    new Uint8Array(child.privateKey)
  );
  
  console.log(`${path} => ${signer.address}`);
}
```

**Legacy Web3.js**:
```typescript
import { Keypair } from "@solana/web3.js";
import { HDKey } from "micro-ed25519-hdkey";
import * as bip39 from "bip39";

const mnemonic = "neither lonely flavor argue grass remind eye tag avocado spot unusual intact";
const seed = bip39.mnemonicToSeedSync(mnemonic, "");
const hd = HDKey.fromMasterSeed(seed.toString("hex"));

for (let i = 0; i < 10; i++) {
  const path = `m/44'/501'/${i}'/0'`;
  const keypair = Keypair.fromSeed(hd.derive(path).privateKey);
  console.log(`${path} => ${keypair.publicKey.toBase58()}`);
}
```

## BIP44 Derivation Path

Solana uses the following BIP44 path structure:

```
m / purpose' / coin_type' / account' / change'
```

- **purpose**: Always `44'` (BIP44)
- **coin_type**: `501'` (Solana's registered coin type)
- **account**: Account index (0, 1, 2, ...)
- **change**: Always `0'` for Solana

**Example paths**:
- First account: `m/44'/501'/0'/0'`
- Second account: `m/44'/501'/1'/0'`
- Third account: `m/44'/501'/2'/0'`

## Mnemonic Security

### Best Practices

✅ **Do**:
- Store mnemonics offline (paper, metal)
- Use 24-word mnemonics for maximum security
- Never share mnemonics
- Test recovery before storing funds
- Use BIP39 passphrase for additional security

❌ **Don't**:
- Store mnemonics digitally (photos, cloud)
- Share mnemonics via messaging apps
- Use weak or predictable phrases
- Store with funds information
- Reuse mnemonics across wallets

### Mnemonic Strength

| Words | Entropy | Security Level |
|-------|---------|----------------|
| 12 | 128 bits | Good |
| 15 | 160 bits | Better |
| 18 | 192 bits | Better |
| 21 | 224 bits | Best |
| 24 | 256 bits | Best |

## Use Cases

**User Wallets**:
- Easy backup and recovery
- Human-readable format
- Compatible with hardware wallets

**HD Wallets**:
- Multiple accounts from one mnemonic
- Deterministic key generation
- Simplified backup

**Multi-Signature**:
- Each signer has their own mnemonic
- Distributed key management
- Enhanced security

---

## Summary

- Mnemonics provide user-friendly key backup
- BIP39 is the standard format (12-24 words)
- BIP44 enables HD wallets (multiple accounts)
- Always store mnemonics securely offline
- Test recovery before using in production

---

## Next Steps

- Learn about [Message Signing](./message-signing.md)
- Explore [Vanity Addresses](./vanity-addresses.md)
- Try [React Wallet Integration](./react-wallet-integration.md)

---

**Source**: [Solana Cookbook](https://solana.com/developers/cookbook/wallets/)
**Last Updated**: February 17, 2026
