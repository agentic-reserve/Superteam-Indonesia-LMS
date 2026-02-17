# Private Ephemeral Rollups (PERs)

## Overview

Private Ephemeral Rollups (PERs) combine the high performance of Ephemeral Rollups with privacy-preserving execution using Trusted Execution Environments (TEE). Built on Intel TDX technology, PERs enable confidential computation on Solana while maintaining performance and compliance requirements.

**Estimated Time:** 1-2 hours

## Learning Objectives

After completing this lesson, you will be able to:

- Understand privacy-preserving execution with TEE
- Explain how Intel TDX provides confidentiality
- Implement access control for private state
- Build compliance-aware applications
- Use Private SPL Token API
- Apply privacy best practices

## Prerequisites

- Completed [Ephemeral Rollups](../01-ephemeral-rollups/README.md)
- Understanding of [Privacy Concepts](../../privacy/README.md)
- Familiarity with compliance requirements
- Basic cryptography knowledge

## Why Private Rollups?

### The Privacy Problem

**Traditional Blockchain**:
- All transactions are public
- All state is visible
- No confidentiality guarantees
- Compliance challenges

**Use Cases Requiring Privacy**:
- Private payments
- Confidential trading
- Healthcare data
- Financial records
- Compliance-required applications

### The PER Solution

**Private Ephemeral Rollups provide**:
- **Confidential Execution**: Computation in TEE
- **Data Privacy**: Encrypted state
- **Access Control**: Fine-grained permissions
- **Compliance**: Regulatory framework support
- **Performance**: High-speed execution

## How PERs Work

### Architecture

```
┌─────────────────────────────────────┐
│     Intel TDX (Trusted Domain)      │
│  ┌───────────────────────────────┐  │
│  │   Private Ephemeral Rollup    │  │
│  │                               │  │
│  │  • Encrypted State            │  │
│  │  • Confidential Execution     │  │
│  │  • Access Control             │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
           ↓ Commitments
┌─────────────────────────────────────┐
│         Solana Base Layer           │
│  (Public commitments, no plaintext) │
└─────────────────────────────────────┘
```

### Key Components

1. **Intel TDX**: Hardware-based TEE
2. **Encrypted State**: All data encrypted in TEE
3. **Access Control**: Permission management
4. **Attestation**: Proof of TEE execution
5. **Commitments**: Periodic state anchoring

### Privacy Guarantees

- **Confidentiality**: Data encrypted at rest and in transit
- **Integrity**: TEE ensures correct execution
- **Attestation**: Verifiable TEE environment
- **Isolation**: Protected from host system

## Intel TDX Integration

### What is Intel TDX?

**Intel Trust Domain Extensions (TDX)**:
- Hardware-based TEE
- CPU-level isolation
- Memory encryption
- Attestation support

**Security Properties**:
- Protected from OS/hypervisor
- Encrypted memory
- Secure key management
- Remote attestation

### Attestation

```rust
use anchor_lang::prelude::*;

#[program]
pub mod private_program {
    use super::*;

    /// Verify TEE attestation
    pub fn verify_attestation(
        ctx: Context<VerifyAttestation>,
        attestation_data: Vec<u8>,
    ) -> Result<()> {
        // Verify Intel TDX attestation
        let is_valid = verify_tdx_attestation(&attestation_data)?;

        require!(is_valid, ErrorCode::InvalidAttestation);

        msg!("TEE attestation verified");
        Ok(())
    }
}

fn verify_tdx_attestation(data: &[u8]) -> Result<bool> {
    // Verify attestation quote
    // Check measurements
    // Validate signature
    Ok(true) // Simplified
}
```

## Access Control

### Permission Model

```rust
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct PrivateAccount {
    /// Owner of the private data
    pub owner: Pubkey,

    /// Authorized viewers
    #[max_len(10)]
    pub authorized_viewers: Vec<Pubkey>,

    /// Authorized editors
    #[max_len(5)]
    pub authorized_editors: Vec<Pubkey>,

    /// Encrypted data
    #[max_len(1000)]
    pub encrypted_data: Vec<u8>,

    /// Access policy
    pub policy: AccessPolicy,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct AccessPolicy {
    /// Require multi-sig for edits
    pub require_multisig: bool,

    /// Minimum signatures required
    pub min_signatures: u8,

    /// Allow public read
    pub public_read: bool,

    /// Expiry timestamp
    pub expires_at: i64,
}

#[program]
pub mod private_access {
    use super::*;

    /// Grant view access
    pub fn grant_view_access(
        ctx: Context<GrantAccess>,
        viewer: Pubkey,
    ) -> Result<()> {
        let account = &mut ctx.accounts.private_account;

        require!(
            account.owner == ctx.accounts.authority.key(),
            ErrorCode::Unauthorized
        );

        require!(
            !account.authorized_viewers.contains(&viewer),
            ErrorCode::AlreadyAuthorized
        );

        account.authorized_viewers.push(viewer);

        msg!("View access granted to: {}", viewer);
        Ok(())
    }

    /// Revoke access
    pub fn revoke_access(
        ctx: Context<RevokeAccess>,
        user: Pubkey,
    ) -> Result<()> {
        let account = &mut ctx.accounts.private_account;

        require!(
            account.owner == ctx.accounts.authority.key(),
            ErrorCode::Unauthorized
        );

        // Remove from viewers
        account.authorized_viewers.retain(|&x| x != user);

        // Remove from editors
        account.authorized_editors.retain(|&x| x != user);

        msg!("Access revoked for: {}", user);
        Ok(())
    }

    /// Read private data (with access check)
    pub fn read_private_data(
        ctx: Context<ReadPrivateData>,
    ) -> Result<Vec<u8>> {
        let account = &ctx.accounts.private_account;
        let reader = ctx.accounts.reader.key();

        // Check access
        let has_access = account.owner == reader
            || account.authorized_viewers.contains(&reader)
            || account.policy.public_read;

        require!(has_access, ErrorCode::AccessDenied);

        // Check expiry
        let clock = Clock::get()?;
        require!(
            clock.unix_timestamp < account.policy.expires_at,
            ErrorCode::AccessExpired
        );

        // Return decrypted data (in TEE)
        Ok(account.encrypted_data.clone())
    }
}

#[derive(Accounts)]
pub struct GrantAccess<'info> {
    #[account(mut, has_one = owner)]
    pub private_account: Account<'info, PrivateAccount>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ReadPrivateData<'info> {
    pub private_account: Account<'info, PrivateAccount>,
    pub reader: Signer<'info>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized access")]
    Unauthorized,

    #[msg("Already authorized")]
    AlreadyAuthorized,

    #[msg("Access denied")]
    AccessDenied,

    #[msg("Access expired")]
    AccessExpired,

    #[msg("Invalid attestation")]
    InvalidAttestation,
}
```

## Private Payments Example

```rust
use anchor_lang::prelude::*;

declare_id!("PrivatePaymentProgramID");

#[program]
pub mod private_payment {
    use super::*;

    /// Initialize private payment account
    pub fn initialize_private_account(
        ctx: Context<InitializePrivateAccount>,
    ) -> Result<()> {
        let account = &mut ctx.accounts.private_account;
        account.owner = ctx.accounts.owner.key();
        account.balance = 0;
        account.encrypted = true;

        msg!("Private account initialized");
        Ok(())
    }

    /// Private transfer (executed in TEE)
    pub fn private_transfer(
        ctx: Context<PrivateTransfer>,
        amount: u64,
    ) -> Result<()> {
        let from = &mut ctx.accounts.from_account;
        let to = &mut ctx.accounts.to_account;

        // Verify sender authorization
        require!(
            from.owner == ctx.accounts.sender.key(),
            ErrorCode::Unauthorized
        );

        // Check balance (in TEE, encrypted)
        require!(
            from.balance >= amount,
            ErrorCode::InsufficientBalance
        );

        // Execute transfer (confidential)
        from.balance -= amount;
        to.balance += amount;

        // No public transaction details!
        msg!("Private transfer completed");

        Ok(())
    }

    /// Get balance (only owner can see)
    pub fn get_balance(
        ctx: Context<GetBalance>,
    ) -> Result<u64> {
        let account = &ctx.accounts.private_account;

        require!(
            account.owner == ctx.accounts.owner.key(),
            ErrorCode::Unauthorized
        );

        // Return decrypted balance (in TEE)
        Ok(account.balance)
    }
}

#[derive(Accounts)]
pub struct InitializePrivateAccount<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + PrivateAccount::INIT_SPACE
    )]
    pub private_account: Account<'info, PrivateAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PrivateTransfer<'info> {
    #[account(mut, has_one = owner)]
    pub from_account: Account<'info, PrivateAccount>,

    #[account(mut)]
    pub to_account: Account<'info, PrivateAccount>,

    pub sender: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetBalance<'info> {
    pub private_account: Account<'info, PrivateAccount>,
    pub owner: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct PrivateAccount {
    pub owner: Pubkey,
    pub balance: u64,
    pub encrypted: bool,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized")]
    Unauthorized,

    #[msg("Insufficient balance")]
    InsufficientBalance,
}
```

## Compliance Framework

### Regulatory Support

**PERs enable compliance with**:
- GDPR (data privacy)
- HIPAA (healthcare)
- SOC 2 (security controls)
- Financial regulations

### Compliance Features

```rust
#[account]
#[derive(InitSpace)]
pub struct ComplianceAccount {
    /// Data classification
    pub classification: DataClassification,

    /// Retention policy
    pub retention_days: u32,

    /// Audit log enabled
    pub audit_enabled: bool,

    /// Compliance jurisdiction
    #[max_len(2)]
    pub jurisdiction: String,

    /// Data protection officer
    pub dpo: Option<Pubkey>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub enum DataClassification {
    Public,
    Internal,
    Confidential,
    Restricted,
}

pub fn enforce_compliance(
    account: &ComplianceAccount,
    operation: &str,
) -> Result<()> {
    // Check data classification
    match account.classification {
        DataClassification::Restricted => {
            // Require additional authorization
            require_additional_auth()?;
        }
        _ => {}
    }

    // Log for audit
    if account.audit_enabled {
        log_audit_event(operation)?;
    }

    // Check retention policy
    enforce_retention_policy(account)?;

    Ok(())
}
```

## Private SPL Token API

### Private Token Operations

```typescript
import { PrivateSPLToken } from "@magicblock/private-spl";

// Initialize private token account
const privateTokenAccount = await PrivateSPLToken.initialize({
  owner: wallet.publicKey,
  mint: tokenMint,
  encrypted: true,
});

// Private transfer (no public transaction details)
await PrivateSPLToken.transfer({
  from: privateTokenAccount,
  to: recipientAccount,
  amount: 1000,
  // Transfer details encrypted in TEE
});

// Get balance (only owner can see)
const balance = await PrivateSPLToken.getBalance({
  account: privateTokenAccount,
  owner: wallet,
});

console.log("Private balance:", balance);
```

## Use Cases

### 1. Private Payments

**Perfect for**:
- Confidential transactions
- Salary payments
- Private donations
- Anonymous transfers

### 2. Confidential Trading

**Perfect for**:
- Dark pools
- Private order books
- Institutional trading
- MEV protection

### 3. Healthcare

**Perfect for**:
- Patient records
- Medical data
- HIPAA compliance
- Research data

### 4. Financial Services

**Perfect for**:
- Private banking
- Wealth management
- Compliance reporting
- Audit trails

## Best Practices

### 1. Access Control

```rust
// ✅ Good: Fine-grained permissions
pub struct AccessControl {
    pub owner: Pubkey,
    pub viewers: Vec<Pubkey>,
    pub editors: Vec<Pubkey>,
    pub policy: AccessPolicy,
}

// ❌ Bad: All or nothing
pub struct AccessControl {
    pub owner: Pubkey,
    pub is_public: bool,
}
```

### 2. Attestation Verification

```rust
// ✅ Good: Always verify TEE
require!(verify_attestation(&data)?, ErrorCode::InvalidTEE);

// ❌ Bad: Trust without verification
// Assume TEE is valid
```

### 3. Data Encryption

```rust
// ✅ Good: Encrypt sensitive data
let encrypted = encrypt_in_tee(&sensitive_data)?;

// ❌ Bad: Store plaintext
account.data = sensitive_data; // Visible!
```

### 4. Compliance Logging

```rust
// ✅ Good: Audit trail
log_compliance_event("data_access", user, timestamp)?;

// ❌ Bad: No audit trail
// No record of access
```

## Security Considerations

### TEE Security Model

**What TEE Protects**:
- ✅ Data confidentiality
- ✅ Execution integrity
- ✅ Memory isolation
- ✅ Key protection

**What TEE Doesn't Protect**:
- ❌ Side-channel attacks (partially)
- ❌ Physical attacks
- ❌ Social engineering
- ❌ Application logic bugs

### Privacy vs Performance

**Trade-offs**:
- Encryption overhead
- Attestation costs
- Access control checks
- Compliance logging

**Optimization**:
- Batch operations
- Efficient encryption
- Caching strategies
- Lazy verification

## Common Pitfalls

1. **Assuming Perfect Privacy**: TEE has limitations
2. **Ignoring Compliance**: Regulatory requirements matter
3. **Poor Access Control**: Too permissive or restrictive
4. **No Audit Trail**: Compliance requires logging
5. **Plaintext Leakage**: Accidentally exposing data

## Troubleshooting

### Issue: Attestation Fails

**Solutions**:
- Verify TEE environment
- Check attestation data
- Update TEE firmware
- Review security settings

### Issue: Access Denied

**Solutions**:
- Check permissions
- Verify authorization
- Review access policy
- Check expiry times

### Issue: Performance Issues

**Solutions**:
- Optimize encryption
- Batch operations
- Cache frequently accessed data
- Review access patterns

## Next Steps

Now that you understand Private Rollups, continue to:

- [Exercises](../exercises/README.md) - Practice with PERs
- [Privacy Module](../../privacy/README.md) - Compare with ZK proofs
- [Integration Projects](../../integration/README.md) - Build complete apps

## Additional Resources

- [MagicBlock PER Documentation](https://docs.magicblock.gg/pages/private-ephemeral-rollups-pers/) - Official PER docs
- [Intel TDX](https://www.intel.com/content/www/us/en/developer/tools/trust-domain-extensions/overview.html) - TEE technology
- [Compliance Framework](https://docs.magicblock.gg/pages/private-ephemeral-rollups-pers/introduction/compliance-framework) - Regulatory support

## Source Attribution

This content is based on educational materials from:

- **MagicBlock Documentation**: https://docs.magicblock.gg/
- **Intel TDX Documentation**: https://www.intel.com/tdx
- **MagicBlock Labs**: https://magicblock.gg/

---

**Last Updated**: February 17, 2026
