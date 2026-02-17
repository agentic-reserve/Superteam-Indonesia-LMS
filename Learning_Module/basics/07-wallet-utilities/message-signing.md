# Message Signing

Learn how to sign messages with keypairs and verify signatures. Message signing is essential for authentication, proof of ownership, and secure communication.

## Why Sign Messages?

- **Authentication**: Prove you own a private key without revealing it
- **Authorization**: Grant permissions with signed messages
- **Data Integrity**: Ensure messages haven't been tampered with
- **Non-repudiation**: Prove a message came from a specific sender

## Signing Messages

**Solana Kit**:
```typescript
import {
  generateKeyPair,
  signBytes,
  verifySignature,
  getUtf8Encoder,
  getBase58Decoder
} from "@solana/kit";

const keys = await generateKeyPair();
const message = getUtf8Encoder().encode("Hello, World!");

// Sign the message
const signedBytes = await signBytes(keys.privateKey, message);
const decoded = getBase58Decoder().decode(signedBytes);

console.log("Signature:", decoded);

// Verify the signature
const verified = await verifySignature(keys.publicKey, signedBytes, message);
console.log("Verified:", verified);
```

**Legacy Web3.js with TweetNaCl**:
```typescript
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";

const keypair = Keypair.fromSecretKey(
  Uint8Array.from([
    174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
    222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
    15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
    121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135
  ])
);

const message = "The quick brown fox jumps over the lazy dog";
const messageBytes = naclUtil.decodeUTF8(message);

// Sign
const signature = nacl.sign.detached(messageBytes, keypair.secretKey);

// Verify
const result = nacl.sign.detached.verify(
  messageBytes,
  signature,
  keypair.publicKey.toBytes()
);

console.log("Verified:", result);
```

**Rust**:
```rust
use solana_sdk::{signature::Keypair, signer::Signer};

fn main() {
    let keypair_bytes = [
        174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
        222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
        15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
        121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135,
    ];
    
    let keypair = Keypair::try_from(&keypair_bytes[..]).unwrap();
    let message = "The quick brown fox jumps over the lazy dog";
    
    // Sign
    let signature = keypair.sign_message(message.as_bytes());
    
    // Verify
    let is_valid = signature.verify(&keypair.pubkey().to_bytes(), message.as_bytes());
    println!("Verified: {:?}", is_valid);
}
```

**Python**:
```python
from solders.keypair import Keypair
import nacl.signing
import nacl.encoding

def main():
    # Create a keypair
    keypair = Keypair()
    message = b"Hello, Solana!"
    
    # Sign the message
    signature = keypair.sign_message(message)
    print(f"Message: {message}")
    print(f"Signature: {signature}")
    print(f"Public Key: {keypair.pubkey()}")
    
    # Verify the signature
    try:
        verify_key = nacl.signing.VerifyKey(keypair.pubkey().__bytes__())
        verify_key.verify(message, signature.__bytes__())
        print("Signature is valid: True")
    except Exception as e:
        print(f"Signature is valid: False - {e}")

if __name__ == "__main__":
    main()
```

## Common Use Cases

### 1. Authentication

```typescript
// Server-side authentication
async function authenticateUser(publicKey: string, message: string, signature: Uint8Array) {
  const pubKey = new PublicKey(publicKey);
  const messageBytes = new TextEncoder().encode(message);
  
  const isValid = nacl.sign.detached.verify(
    messageBytes,
    signature,
    pubKey.toBytes()
  );
  
  if (isValid) {
    // User authenticated
    return { authenticated: true, publicKey };
  }
  
  return { authenticated: false };
}
```

### 2. Proof of Ownership

```typescript
// Prove you own an NFT
async function proveNFTOwnership(nftMint: PublicKey, ownerKeypair: Keypair) {
  const message = `I own NFT ${nftMint.toBase58()} at ${Date.now()}`;
  const messageBytes = new TextEncoder().encode(message);
  const signature = nacl.sign.detached(messageBytes, ownerKeypair.secretKey);
  
  return {
    message,
    signature: Buffer.from(signature).toString('base64'),
    publicKey: ownerKeypair.publicKey.toBase58()
  };
}
```

### 3. Signed API Requests

```typescript
// Sign API requests for verification
async function signedAPIRequest(endpoint: string, data: any, keypair: Keypair) {
  const timestamp = Date.now();
  const payload = JSON.stringify({ ...data, timestamp });
  const messageBytes = new TextEncoder().encode(payload);
  const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
  
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': Buffer.from(signature).toString('base64'),
      'X-Public-Key': keypair.publicKey.toBase58(),
      'X-Timestamp': timestamp.toString()
    },
    body: payload
  });
}
```

## Security Considerations

### Message Format

✅ **Include**:
- Timestamp (prevent replay attacks)
- Nonce (ensure uniqueness)
- Context (what the signature is for)
- Domain (prevent cross-site attacks)

```typescript
const message = {
  action: "login",
  timestamp: Date.now(),
  nonce: generateNonce(),
  domain: "myapp.com"
};
```

### Verification

✅ **Always verify**:
- Signature is valid
- Message hasn't expired
- Nonce hasn't been used
- Public key is expected

```typescript
function verifySignedMessage(
  message: SignedMessage,
  expectedPublicKey: PublicKey,
  maxAge: number = 60000 // 1 minute
): boolean {
  // Check timestamp
  if (Date.now() - message.timestamp > maxAge) {
    return false;
  }
  
  // Check nonce (implement nonce tracking)
  if (isNonceUsed(message.nonce)) {
    return false;
  }
  
  // Verify signature
  const isValid = verifySignature(
    expectedPublicKey,
    message.signature,
    message.data
  );
  
  if (isValid) {
    markNonceAsUsed(message.nonce);
  }
  
  return isValid;
}
```

## Best Practices

✅ **Do**:
- Include timestamps in signed messages
- Use nonces to prevent replay attacks
- Verify signatures on the server side
- Use HTTPS for transmitting signatures
- Implement rate limiting

❌ **Don't**:
- Sign arbitrary user input without validation
- Reuse signatures
- Trust client-side verification alone
- Store signatures without encryption
- Sign sensitive data directly

---

## Summary

- Message signing proves ownership without revealing private keys
- Use for authentication, authorization, and data integrity
- Always include timestamps and nonces
- Verify signatures server-side
- Follow security best practices

---

## Next Steps

- Try [Vanity Addresses](./vanity-addresses.md)
- Learn [React Wallet Integration](./react-wallet-integration.md)
- Explore [Keypair Management](./keypair-management.md)

---

**Source**: [Solana Cookbook](https://solana.com/developers/cookbook/wallets/)
**Last Updated**: February 17, 2026
