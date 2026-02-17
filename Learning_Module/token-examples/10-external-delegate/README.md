# External Delegate

Learn how to implement token delegation for third-party spending and advanced permission systems.

## Overview

Token delegation allows an account to authorize another account to spend tokens on their behalf - essential for DeFi protocols, automated trading, and complex permission systems.

## Learning Objectives

- Implement token delegation
- Create spending limits
- Handle delegated transfers
- Revoke delegations
- Build permission systems

## Prerequisites

- Completed [Transfer Tokens](../03-transfer-tokens/)
- Understanding of token authorities
- Knowledge of approval patterns

---

## Delegation Fundamentals

### What is Delegation?

**Without Delegation:**
```text
User → Signs every transaction → Protocol executes
```

**With Delegation:**
```text
User → Approves once → Delegate can spend (within limits)
```

### Use Cases

1. **DEX Trading:** Automated order execution
2. **Lending:** Collateral management
3. **Staking:** Reward distribution
4. **Gaming:** In-game transactions
5. **Subscriptions:** Recurring payments

---

## Implementation

### Delegate Tokens

```rust
pub fn approve_delegate(
    ctx: Context<ApproveDelegate>,
    amount: u64,
) -> Result<()> {
    // Approve delegate to spend tokens
    approve(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Approve {
                to: ctx.accounts.token_account.to_account_info(),
                delegate: ctx.accounts.delegate.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        ),
        amount,
    )?;
    
    msg!("Delegate approved for {} tokens", amount);
    Ok(())
}
```

### Transfer as Delegate

```rust
pub fn transfer_as_delegate(
    ctx: Context<TransferAsDelegate>,
    amount: u64,
) -> Result<()> {
    // Delegate transfers tokens
    transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.from_account.to_account_info(),
                to: ctx.accounts.to_account.to_account_info(),
                authority: ctx.accounts.delegate.to_account_info(), // Delegate signs
            },
        ),
        amount,
    )?;
    
    Ok(())
}
```

### Revoke Delegation

```rust
pub fn revoke_delegate(ctx: Context<RevokeDelegate>) -> Result<()> {
    // Revoke delegate authority
    revoke(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Revoke {
                source: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.owner.to_account_info(),
            },
        ),
    )?;
    
    msg!("Delegate revoked");
    Ok(())
}
```

---

## Account Structures

### Approve Delegate

```rust
#[derive(Accounts)]
pub struct ApproveDelegate<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        mut,
        constraint = token_account.owner == owner.key()
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    /// CHECK: Delegate account
    pub delegate: UncheckedAccount<'info>,
    
    pub token_program: Program<'info, Token>,
}
```

### Transfer as Delegate

```rust
#[derive(Accounts)]
pub struct TransferAsDelegate<'info> {
    #[account(mut)]
    pub delegate: Signer<'info>,
    
    #[account(
        mut,
        constraint = from_account.delegate == COption::Some(delegate.key())
    )]
    pub from_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub to_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}
```

---

## Key Concepts

### 1. Delegation Limits

```rust
// Check delegated amount
require!(
    from_account.delegated_amount >= amount,
    ErrorCode::InsufficientDelegation
);
```

### 2. Delegate Validation

```rust
require!(
    from_account.delegate == COption::Some(delegate.key()),
    ErrorCode::InvalidDelegate
);
```

### 3. Automatic Revocation

```text
Delegation is automatically revoked when:
- Delegated amount is fully spent
- Owner explicitly revokes
- Account is closed
```

---

## Testing

```typescript
describe("External Delegate", () => {
  it("Approve delegate", async () => {
    await program.methods
      .approveDelegate(new anchor.BN(100 * 10**9))
      .accounts({
        owner: owner.publicKey,
        tokenAccount: ownerTokenAccount,
        delegate: delegate.publicKey,
      })
      .signers([owner])
      .rpc();
  });

  it("Transfer as delegate", async () => {
    await program.methods
      .transferAsDelegate(new anchor.BN(50 * 10**9))
      .accounts({
        delegate: delegate.publicKey,
        fromAccount: ownerTokenAccount,
        toAccount: recipientTokenAccount,
      })
      .signers([delegate])
      .rpc();
  });

  it("Revoke delegate", async () => {
    await program.methods
      .revokeDelegate()
      .accounts({
        owner: owner.publicKey,
        tokenAccount: ownerTokenAccount,
      })
      .signers([owner])
      .rpc();
  });
});
```

---

## Advanced Patterns

### Time-Limited Delegation

```rust
#[account]
pub struct TimedDelegation {
    pub delegate: Pubkey,
    pub amount: u64,
    pub expiry: i64,
}

pub fn transfer_with_expiry(ctx: Context<TransferWithExpiry>) -> Result<()> {
    let clock = Clock::get()?;
    require!(
        clock.unix_timestamp <= ctx.accounts.delegation.expiry,
        ErrorCode::DelegationExpired
    );
    // Transfer logic
    Ok(())
}
```

### Multi-Delegate System

```rust
#[account]
pub struct MultiDelegate {
    pub delegates: Vec<DelegateEntry>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct DelegateEntry {
    pub delegate: Pubkey,
    pub amount: u64,
    pub permissions: u8,
}
```

---

## Security Considerations

1. **Validate Delegate:** Always check delegate authority
2. **Limit Amounts:** Set reasonable delegation limits
3. **Time Limits:** Consider expiry times
4. **Revocation:** Provide easy revocation
5. **Audit Trails:** Log all delegated actions

---

## Best Practices

1. **Minimal Delegation:** Only delegate what's needed
2. **Regular Audits:** Check active delegations
3. **Clear Permissions:** Document what delegates can do
4. **Emergency Revoke:** Quick revocation mechanism
5. **User Education:** Explain delegation risks

---

## Next Steps

- Learn about [Token-2022 Basics](../11-token-2022-basics/)
- Explore [Permanent Delegate](../16-permanent-delegate/) extension
- Study [CPI Guard](../18-additional-extensions/) for security

---

**Source:** Adapted from [Solana Program Examples](https://github.com/solana-developers/program-examples)
