# Confidential Transfers (Token-2022)

Learn how to implement privacy-preserving token transfers using zero-knowledge proofs.

## Overview

Confidential Transfers extension enables private token transfers where amounts and balances are hidden using zero-knowledge proofs.

## Learning Objectives

- Understand confidential transfer mechanics
- Implement private transfers
- Configure confidential accounts
- Balance privacy and compliance

## Prerequisites

- Completed [Token-2022 Basics](../11-token-2022-basics/)
- Understanding of zero-knowledge proofs (basic)

---

## How It Works

```text
Public Transfer:
Alice → 100 tokens → Bob (visible to all)

Confidential Transfer:
Alice → ??? tokens → Bob (amounts hidden)
```

### Key Features

- **Hidden Amounts:** Transfer amounts encrypted
- **Hidden Balances:** Account balances encrypted
- **Auditable:** Optional audit keys for compliance
- **ZK Proofs:** Cryptographic validity proofs

---

## Implementation

### Enable Confidential Transfers

```rust
#[account(
    init,
    payer = payer,
    mint::decimals = 9,
    mint::authority = payer,
    mint::token_program = token_program,
    extensions::confidential_transfer::ConfidentialTransferMint {
        authority: payer.key(),
        auto_approve_new_accounts: true,
        auditor_elgamal_pubkey: None,
    },
)]
pub mint: InterfaceAccount<'info, Mint>,
```

### Configure Account for Confidential Transfers

```rust
pub fn configure_confidential_account(
    ctx: Context<ConfigureConfidential>,
) -> Result<()> {
    // Generate encryption keys
    // Configure account for confidential transfers
    Ok(())
}
```

---

## Use Cases

1. **Private Payments:** Hide transaction amounts
2. **Payroll:** Confidential salary payments
3. **Trading:** Private order books
4. **Compliance:** Auditable privacy

---

## Best Practices

1. **Key Management:** Secure encryption keys
2. **Audit Trail:** Consider audit keys
3. **Performance:** ZK proofs are compute-intensive
4. **User Education:** Explain privacy features

---

**Source:** Adapted from [Solana Program Examples](https://github.com/solana-developers/program-examples)
