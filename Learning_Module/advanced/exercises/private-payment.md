# Exercise: Private Payment System

## Objective

Build a confidential payment system using Private Ephemeral Rollups (PERs) that enables private transfers with access control and compliance features.

## Difficulty

**Advanced**

## Estimated Time

3-4 hours

## Prerequisites

- Completed [Private Rollups](../04-private-rollups/README.md) guide
- Understanding of TEE concepts
- Knowledge of access control patterns
- Advanced Anchor proficiency

## Requirements

Build a private payment system that supports:

1. **Private accounts** with encrypted balances
2. **Confidential transfers** (no public transaction details)
3. **Access control** (view permissions)
4. **Compliance** (audit trail for authorized parties)
5. **Balance verification** (only owner can see)

### Account Structures

```rust
#[account]
pub struct PrivateAccount {
    pub owner: Pubkey,
    pub encrypted_balance: Vec<u8>,
    pub authorized_viewers: Vec<Pubkey>,
    pub compliance_officer: Option<Pubkey>,
    pub is_active: bool,
}

#[account]
pub struct TransferRecord {
    pub from: Pubkey,
    pub to: Pubkey,
    pub encrypted_amount: Vec<u8>,
    pub timestamp: i64,
    pub compliance_approved: bool,
}

#[account]
pub struct ComplianceLog {
    pub account: Pubkey,
    pub action: String,
    pub actor: Pubkey,
    pub timestamp: i64,
}
```

### Required Instructions

1. `initialize_private_account` - Create private account
2. `private_transfer` - Execute confidential transfer
3. `grant_view_access` - Allow viewing balance
4. `revoke_view_access` - Remove viewing permission
5. `get_balance` - View balance (with permission check)
6. `audit_account` - Compliance officer access

## Validation Criteria

Your solution must:

- ✅ Create private accounts with encryption
- ✅ Execute confidential transfers
- ✅ Enforce access control
- ✅ Maintain audit trail
- ✅ Verify TEE execution
- ✅ Handle compliance requirements
- ✅ Protect sensitive data
- ✅ Include comprehensive tests

## Test Scenarios

### Test 1: Private Account Creation
```typescript
it("Creates private account with encryption", async () => {
  await program.methods
    .initializePrivateAccount()
    .accounts({
      privateAccount: accountPDA,
      owner: owner.publicKey,
    })
    .signers([owner])
    .rpc();
  
  const account = await program.account.privateAccount.fetch(accountPDA);
  assert.equal(account.owner.toBase58(), owner.publicKey.toBase58());
  assert.equal(account.isActive, true);
  // Balance should be encrypted
  assert(account.encryptedBalance.length > 0);
});
```

### Test 2: Confidential Transfer
```typescript
it("Executes private transfer", async () => {
  const amount = 1000;
  
  // Get initial balances (only owners can see)
  const fromBalanceBefore = await getBalance(fromAccount, fromOwner);
  const toBalanceBefore = await getBalance(toAccount, toOwner);
  
  // Execute private transfer
  await program.methods
    .privateTransfer(new anchor.BN(amount))
    .accounts({
      fromAccount: fromAccountPDA,
      toAccount: toAccountPDA,
      sender: fromOwner.publicKey,
    })
    .signers([fromOwner])
    .rpc();
  
  // Verify balances changed (only owners can verify)
  const fromBalanceAfter = await getBalance(fromAccount, fromOwner);
  const toBalanceAfter = await getBalance(toAccount, toOwner);
  
  assert.equal(fromBalanceAfter, fromBalanceBefore - amount);
  assert.equal(toBalanceAfter, toBalanceBefore + amount);
  
  // Public cannot see transaction details!
  // Transfer amount is encrypted on-chain
});
```

### Test 3: Access Control
```typescript
it("Enforces view permissions", async () => {
  // Owner can view balance
  const balance = await program.methods
    .getBalance()
    .accounts({
      privateAccount: accountPDA,
      viewer: owner.publicKey,
    })
    .signers([owner])
    .rpc();
  
  assert(balance !== null);
  
  // Unauthorized user cannot view
  const unauthorized = anchor.web3.Keypair.generate();
  try {
    await program.methods
      .getBalance()
      .accounts({
        privateAccount: accountPDA,
        viewer: unauthorized.publicKey,
      })
      .signers([unauthorized])
      .rpc();
    assert.fail("Should have thrown error");
  } catch (error) {
    assert(error.message.includes("Access denied"));
  }
});
```

### Test 4: Grant/Revoke Access
```typescript
it("Manages view permissions", async () => {
  const viewer = anchor.web3.Keypair.generate();
  
  // Grant access
  await program.methods
    .grantViewAccess(viewer.publicKey)
    .accounts({
      privateAccount: accountPDA,
      owner: owner.publicKey,
    })
    .signers([owner])
    .rpc();
  
  // Viewer can now see balance
  const balance = await program.methods
    .getBalance()
    .accounts({
      privateAccount: accountPDA,
      viewer: viewer.publicKey,
    })
    .signers([viewer])
    .rpc();
  
  assert(balance !== null);
  
  // Revoke access
  await program.methods
    .revokeViewAccess(viewer.publicKey)
    .accounts({
      privateAccount: accountPDA,
      owner: owner.publicKey,
    })
    .signers([owner])
    .rpc();
  
  // Viewer can no longer see balance
  try {
    await program.methods
      .getBalance()
      .accounts({
        privateAccount: accountPDA,
        viewer: viewer.publicKey,
      })
      .signers([viewer])
      .rpc();
    assert.fail("Should have thrown error");
  } catch (error) {
    assert(error.message.includes("Access denied"));
  }
});
```

### Test 5: Compliance Audit
```typescript
it("Allows compliance officer access", async () => {
  const complianceOfficer = anchor.web3.Keypair.generate();
  
  // Set compliance officer
  await program.methods
    .setComplianceOfficer(complianceOfficer.publicKey)
    .accounts({
      privateAccount: accountPDA,
      owner: owner.publicKey,
    })
    .signers([owner])
    .rpc();
  
  // Compliance officer can audit
  const auditData = await program.methods
    .auditAccount()
    .accounts({
      privateAccount: accountPDA,
      complianceOfficer: complianceOfficer.publicKey,
    })
    .signers([complianceOfficer])
    .rpc();
  
  // Audit log created
  const logs = await program.account.complianceLog.all();
  assert(logs.length > 0);
  assert.equal(logs[0].account.action, "audit");
});
```

## Hints

### Hint 1: Encryption in TEE
Encrypt sensitive data:
```rust
pub fn encrypt_balance(balance: u64) -> Result<Vec<u8>> {
    // In TEE, use hardware encryption
    // Simplified for example
    let encrypted = balance.to_le_bytes().to_vec();
    Ok(encrypted)
}

pub fn decrypt_balance(encrypted: &[u8]) -> Result<u64> {
    // In TEE, use hardware decryption
    let bytes: [u8; 8] = encrypted.try_into()
        .map_err(|_| ErrorCode::DecryptionFailed)?;
    Ok(u64::from_le_bytes(bytes))
}
```

### Hint 2: Access Control Check
```rust
pub fn check_view_access(
    account: &PrivateAccount,
    viewer: &Pubkey,
) -> Result<()> {
    // Owner always has access
    if account.owner == *viewer {
        return Ok(());
    }
    
    // Check authorized viewers
    if account.authorized_viewers.contains(viewer) {
        return Ok(());
    }
    
    // Check compliance officer
    if let Some(officer) = account.compliance_officer {
        if officer == *viewer {
            return Ok(());
        }
    }
    
    Err(ErrorCode::AccessDenied.into())
}
```

### Hint 3: Private Transfer
```rust
pub fn private_transfer(
    ctx: Context<PrivateTransfer>,
    amount: u64,
) -> Result<()> {
    let from = &mut ctx.accounts.from_account;
    let to = &mut ctx.accounts.to_account;
    
    // Decrypt balances (in TEE)
    let from_balance = decrypt_balance(&from.encrypted_balance)?;
    let to_balance = decrypt_balance(&to.encrypted_balance)?;
    
    // Verify sufficient balance
    require!(
        from_balance >= amount,
        ErrorCode::InsufficientBalance
    );
    
    // Update balances
    let new_from_balance = from_balance - amount;
    let new_to_balance = to_balance + amount;
    
    // Re-encrypt balances
    from.encrypted_balance = encrypt_balance(new_from_balance)?;
    to.encrypted_balance = encrypt_balance(new_to_balance)?;
    
    // Log for compliance (encrypted)
    log_transfer(from.key(), to.key(), amount)?;
    
    msg!("Private transfer completed");
    Ok(())
}
```

### Hint 4: Compliance Logging
```rust
pub fn log_compliance_event(
    account: Pubkey,
    action: String,
    actor: Pubkey,
) -> Result<()> {
    let clock = Clock::get()?;
    
    // Create compliance log entry
    let log = ComplianceLog {
        account,
        action,
        actor,
        timestamp: clock.unix_timestamp,
    };
    
    // Store in compliance database (in TEE)
    store_compliance_log(log)?;
    
    Ok(())
}
```

## Bonus Challenges

### Challenge 1: Multi-Signature Transfers
Require multiple approvals for large transfers:
```rust
#[account]
pub struct MultiSigTransfer {
    pub from: Pubkey,
    pub to: Pubkey,
    pub amount: u64,
    pub approvers: Vec<Pubkey>,
    pub signatures: Vec<Pubkey>,
    pub threshold: u8,
}
```

### Challenge 2: Transaction Limits
Implement daily/monthly transfer limits:
```rust
#[account]
pub struct TransferLimits {
    pub daily_limit: u64,
    pub monthly_limit: u64,
    pub daily_used: u64,
    pub monthly_used: u64,
    pub last_reset: i64,
}
```

### Challenge 3: Scheduled Transfers
Allow scheduling future transfers:
```rust
#[account]
pub struct ScheduledTransfer {
    pub from: Pubkey,
    pub to: Pubkey,
    pub amount: u64,
    pub execute_at: i64,
    pub is_executed: bool,
}
```

### Challenge 4: Privacy Pools
Implement mixing for enhanced privacy:
```rust
#[account]
pub struct PrivacyPool {
    pub total_deposits: u64,
    pub participants: Vec<Pubkey>,
    pub encrypted_balances: Vec<Vec<u8>>,
}
```

## Solution Outline

```rust
use anchor_lang::prelude::*;

declare_id!("PrivatePaymentProgramID");

#[program]
pub mod private_payment {
    use super::*;

    pub fn initialize_private_account(
        ctx: Context<InitializePrivateAccount>,
    ) -> Result<()> {
        // Initialize with encryption
    }

    pub fn private_transfer(
        ctx: Context<PrivateTransfer>,
        amount: u64,
    ) -> Result<()> {
        // Execute confidential transfer
    }

    pub fn grant_view_access(
        ctx: Context<GrantViewAccess>,
        viewer: Pubkey,
    ) -> Result<()> {
        // Grant viewing permission
    }

    pub fn get_balance(
        ctx: Context<GetBalance>,
    ) -> Result<u64> {
        // Return balance (with access check)
    }
}

#[derive(Accounts)]
pub struct InitializePrivateAccount<'info> {
    // Define accounts
}

#[account]
#[derive(InitSpace)]
pub struct PrivateAccount {
    // Define structure
}

#[error_code]
pub enum ErrorCode {
    // Define errors
}
```

## Submission Checklist

Before submitting, ensure:

- [ ] Private accounts implemented
- [ ] Encryption working
- [ ] Transfers are confidential
- [ ] Access control enforced
- [ ] Compliance logging implemented
- [ ] All tests passing
- [ ] Security reviewed
- [ ] Documentation complete
- [ ] Bonus challenges attempted (optional)

## Security Considerations

- Ensure TEE attestation
- Validate all access checks
- Protect encryption keys
- Audit all compliance logs
- Test edge cases thoroughly
- Review for side channels

## Next Steps

After completing this exercise:

1. Review all advanced topics
2. Build a complete application combining all concepts
3. Explore production deployment
4. Study additional privacy techniques

---

**Good luck!** Build a secure and private payment system!

**Last Updated**: February 17, 2026
