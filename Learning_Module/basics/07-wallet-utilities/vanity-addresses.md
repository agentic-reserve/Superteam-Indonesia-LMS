# Vanity Addresses

A vanity address is a Solana public key that begins with specific characters you choose. Vanity addresses are useful for branding, memorability, and visual identification.

## What are Vanity Addresses?

**Regular Address**:
```
7EqQdEULxWcraVx3mXKFjc84LhCkMGZCkRuDpvcMwJeK
```

**Vanity Address** (starts with "hi"):
```
hi5ZLudLEpMhHqF8cYvXqhXqXqXqXqXqXqXqXqXqXqXq
```

## Generating Vanity Addresses

### Using Solana CLI

The easiest way to generate a vanity address is with the Solana CLI:

```bash
# Generate address starting with "hi"
solana-keygen grind --starts-with hi:1

# Generate address starting with "sol"
solana-keygen grind --starts-with sol:1

# Generate address ending with "end"
solana-keygen grind --ends-with end:1

# Generate address with both prefix and suffix
solana-keygen grind --starts-with hi:1 --ends-with end:1
```

### Output

```bash
$ solana-keygen grind --starts-with hi:1

Searching for a vanity address...
Wrote keypair to hi5ZLudLEpMhHqF8cYvXqhXqXqXqXqXqXqXqXqXqXq.json
```

The generated keypair is saved to a JSON file that you can use with the Solana CLI or import into your application.

## Performance Considerations

### Generation Time

The more characters you specify, the exponentially longer it takes:

| Characters | Approximate Time | Difficulty |
|------------|------------------|------------|
| 1 | < 1 second | Instant |
| 2 | < 1 second | Very Easy |
| 3 | ~1 second | Easy |
| 4 | ~30 seconds | Moderate |
| 5 | ~15 minutes | Hard |
| 6 | ~8 hours | Very Hard |
| 7 | ~2 weeks | Extremely Hard |
| 8+ | Months+ | Impractical |

**Why?** Each additional character multiplies the search space by ~58 (base58 alphabet).

### Optimization

**Use multiple threads**:
```bash
# Use 8 CPU threads
solana-keygen grind --starts-with sol:1 --num-threads 8
```

**Case sensitivity**:
```bash
# Case-insensitive (faster)
solana-keygen grind --starts-with SOL:1 --ignore-case
```

## Programmatic Generation

### TypeScript Example

```typescript
import { Keypair } from "@solana/web3.js";

function generateVanityAddress(prefix: string): Keypair {
  let keypair: Keypair;
  let attempts = 0;
  
  do {
    keypair = Keypair.generate();
    attempts++;
    
    if (attempts % 10000 === 0) {
      console.log(`Attempts: ${attempts}`);
    }
  } while (!keypair.publicKey.toBase58().startsWith(prefix));
  
  console.log(`Found after ${attempts} attempts`);
  return keypair;
}

// Usage
const vanityKeypair = generateVanityAddress("hi");
console.log("Vanity address:", vanityKeypair.publicKey.toBase58());
```

### Rust Example

```rust
use solana_sdk::{signature::Keypair, signer::Signer};

fn generate_vanity_address(prefix: &str) -> Keypair {
    let mut attempts = 0;
    
    loop {
        let keypair = Keypair::new();
        attempts += 1;
        
        if attempts % 10000 == 0 {
            println!("Attempts: {}", attempts);
        }
        
        let pubkey_str = keypair.pubkey().to_string();
        if pubkey_str.starts_with(prefix) {
            println!("Found after {} attempts", attempts);
            return keypair;
        }
    }
}

fn main() {
    let vanity_keypair = generate_vanity_address("hi");
    println!("Vanity address: {}", vanity_keypair.pubkey());
}
```

## Use Cases

### Branding

```
Company: Acme Corp
Vanity: AcmeXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Memorability

```
Personal wallet: bob1XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Visual Identification

```
Treasury: treasuryXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
Rewards: rewardsXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Program Addresses

```
Token program: TokenXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Security Considerations

### Vanity Addresses are Safe

✅ Vanity addresses are just as secure as regular addresses
✅ The private key is still randomly generated
✅ Only the public key is filtered

### Risks

⚠️ **Phishing**: Attackers might create similar vanity addresses
⚠️ **Computation**: Generating long vanity addresses requires significant resources
⚠️ **False Security**: Users might trust addresses based on prefix alone

### Best Practices

✅ **Do**:
- Use vanity addresses for official accounts
- Verify full address, not just prefix
- Document your vanity addresses publicly
- Use reasonable prefix lengths (2-4 characters)

❌ **Don't**:
- Trust addresses based on prefix alone
- Generate extremely long vanity addresses (6+ chars)
- Use vanity generation services (security risk)
- Share private keys from vanity generation

## Advanced Options

### Multiple Prefixes

```bash
# Try multiple prefixes (first match wins)
solana-keygen grind --starts-with hi:1 --starts-with sol:1
```

### Suffix Matching

```bash
# Address ending with "end"
solana-keygen grind --ends-with end:1
```

### Combined Matching

```bash
# Both prefix and suffix
solana-keygen grind --starts-with hi:1 --ends-with end:1
```

### Output to Specific File

```bash
# Save to custom location
solana-keygen grind --starts-with sol:1 --outfile ~/my-vanity-key.json
```

## Vanity Address Services

⚠️ **Warning**: Using third-party vanity address generation services is risky because they have access to your private key during generation.

**Safer alternatives**:
- Generate locally with Solana CLI
- Use open-source tools you can audit
- Run generation on air-gapped machines
- Generate and immediately transfer funds

## Example: Complete Workflow

```bash
# 1. Generate vanity address
solana-keygen grind --starts-with myapp:1 --outfile myapp-wallet.json

# 2. Check the address
solana-keygen pubkey myapp-wallet.json

# 3. Set as default wallet
solana config set --keypair myapp-wallet.json

# 4. Fund the wallet
solana airdrop 1 myapp-wallet.json

# 5. Verify balance
solana balance
```

---

## Summary

- Vanity addresses start with specific characters
- Generation time increases exponentially with length
- Use Solana CLI for easy generation
- Vanity addresses are as secure as regular addresses
- Useful for branding and memorability
- Keep prefix length reasonable (2-4 characters)

---

## Next Steps

- Learn [React Wallet Integration](./react-wallet-integration.md)
- Explore [Keypair Management](./keypair-management.md)
- Try [Message Signing](./message-signing.md)

---

**Source**: [Solana Cookbook](https://solana.com/developers/cookbook/wallets/)
**Last Updated**: February 17, 2026
