# Wallet Utilities

Welcome to the Wallet Utilities section! This module covers essential wallet operations including keypair generation, restoration, signing, and wallet integration with React applications.

## Learning Objectives

By completing this section, you will:

- Generate and manage keypairs
- Restore keypairs from various formats (bytes, base58, mnemonics)
- Verify keypairs and public keys
- Sign and verify messages
- Generate vanity addresses
- Connect wallets to React applications

## Prerequisites

Before starting this section, ensure you have:

- Completed [Accounts and Programs](../01-accounts-and-programs/README.md)
- Basic understanding of public/private key cryptography
- TypeScript or Rust knowledge
- Node.js installed (for JavaScript examples)

## Module Structure

### 1. [Keypair Management](./keypair-management.md)
**Estimated Time:** 1-2 hours

Learn how to create, restore, and verify keypairs across multiple formats.

**Topics covered:**
- Creating new keypairs
- Restoring from bytes and base58
- Verifying keypairs
- Validating public keys

### 2. [Mnemonics](./mnemonics.md)
**Estimated Time:** 1-2 hours

Master mnemonic phrases for user-friendly key management.

**Topics covered:**
- Generating mnemonics
- BIP39 format restoration
- BIP44 format restoration
- HD wallet derivation

### 3. [Message Signing](./message-signing.md)
**Estimated Time:** 1 hour

Understand how to sign and verify messages with keypairs.

**Topics covered:**
- Signing messages
- Verifying signatures
- Use cases for message signing

### 4. [Vanity Addresses](./vanity-addresses.md)
**Estimated Time:** 30 minutes

Create custom addresses with specific prefixes.

**Topics covered:**
- What are vanity addresses
- Using Solana CLI
- Performance considerations

### 5. [React Wallet Integration](./react-wallet-integration.md)
**Estimated Time:** 2-3 hours

Connect your React applications to Solana wallets.

**Topics covered:**
- Wallet adapter setup
- Provider configuration
- Wallet connection UI
- Transaction signing

## Quick Reference

### Common Operations

**Generate Keypair**:
```typescript
import { generateKeyPairSigner } from "@solana/kit";
const signer = await generateKeyPairSigner();
```

**Restore from Mnemonic**:
```typescript
import * as bip39 from "bip39";
const seed = bip39.mnemonicToSeedSync(mnemonic, "");
```

**Sign Message**:
```typescript
import { signBytes } from "@solana/kit";
const signature = await signBytes(privateKey, message);
```

## Learning Path

We recommend following the sections in order:

```
Keypair Management → Mnemonics → Message Signing → Vanity Addresses → React Integration
```

## Additional Resources

- [Solana Cookbook - Wallets](https://solana.com/developers/cookbook/wallets/)
- [Wallet Adapter Documentation](https://github.com/anza-xyz/wallet-adapter)
- [BIP39 Specification](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [BIP44 Specification](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)

## Next Steps

After completing this section, you can:

- Build wallet management tools
- Integrate wallets into dApps
- Implement secure key storage
- Create HD wallet applications

---

**Ready to start?** Head to [Keypair Management](./keypair-management.md) to begin!

---

**Source Attribution**: Content adapted from [Solana Cookbook](https://solana.com/developers/cookbook/wallets/)

**Last Updated**: February 17, 2026
