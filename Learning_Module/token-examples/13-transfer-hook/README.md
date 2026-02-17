# Transfer Hook (Token-2022)

Learn how to implement custom logic that executes automatically on every token transfer.

## Overview

Transfer Hook extension allows you to run custom program logic before or after token transfers - enabling features like whitelists, blacklists, transfer limits, and complex compliance rules.

## Learning Objectives

- Implement transfer hook programs
- Register hooks with mints
- Execute custom transfer logic
- Build compliance systems
- Create transfer restrictions

## Prerequisites

- Completed [Token-2022 Basics](../11-token-2022-basics/)
- Understanding of CPIs
- Knowledge of PDAs

---

## Transfer Hook Fundamentals

### How It Works

```text
User initiates transfer
↓
Token program calls hook program
↓
Hook program executes custom logic
↓
If successful, transfer completes
If fails, transfer reverts
```

### Use Cases

1. **Whitelist/Blacklist:** Restrict transfers
2. **Transfer Limits:** Daily/per-transaction caps
3. **Compliance:** KYC/AML checks
4. **Royalties:** Automatic royalty payments
5. **Analytics:** Track transfer patterns

---

## Implementation

### Hook Program Interface

```rust
#[interface]
pub trait TransferHook {
    fn execute(
        ctx: Context<Execute>,
        amount: u64,
    ) -> Result<()>;
}
```

### Example: Whitelist Hook

```rust
#[program]
pub mod transfer_hook {
    use super::*;

    pub fn initialize_extra_account_meta_list(
        ctx: Context<InitializeExtraAccountMetaList>,
    ) -> Result<()> {
        // Define extra accounts needed by hook
        let extra_account_metas = vec![
            ExtraAccountMeta::new_with_seeds(
                &[Seed::Literal {
                    bytes: b"whitelist".to_vec(),
                }],
                false,
                true,
            )?,
        ];

        // Store extra account metas
        ctx.accounts.extra_account_meta_list.init(extra_account_metas)?;
        Ok(())
    }

    pub fn execute(ctx: Context<Execute>, amount: u64) -> Result<()> {
        // Check if sender is whitelisted
        require!(
            ctx.accounts.sender_whitelist.is_whitelisted,
            ErrorCode::SenderNotWhitelisted
        );

        // Check if recipient is whitelisted
        require!(
            ctx.accounts.recipient_whitelist.is_whitelisted,
            ErrorCode::RecipientNotWhitelisted
        );

        msg!("Transfer approved: {} tokens", amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Execute<'info> {
    pub source: InterfaceAccount<'info, TokenAccount>,
    pub mint: InterfaceAccount<'info, Mint>,
    pub destination: InterfaceAccount<'info, TokenAccount>,
    pub authority: Signer<'info>,
    
    #[account(
        seeds = [b"whitelist", source.owner.as_ref()],
        bump
    )]
    pub sender_whitelist: Account<'info, WhitelistEntry>,
    
    #[account(
        seeds = [b"whitelist", destination.owner.as_ref()],
        bump
    )]
    pub recipient_whitelist: Account<'info, WhitelistEntry>,
}

#[account]
pub struct WhitelistEntry {
    pub is_whitelisted: bool,
    pub added_at: i64,
}
```

### Register Hook with Mint

```rust
pub fn create_mint_with_hook(
    ctx: Context<CreateMintWithHook>,
    hook_program_id: Pubkey,
) -> Result<()> {
    // Initialize mint with transfer hook extension
    let ix = initialize_transfer_hook(
        &ctx.accounts.token_program.key(),
        &ctx.accounts.mint.key(),
        &ctx.accounts.authority.key(),
        Some(hook_program_id),
    )?;

    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.authority.to_account_info(),
        ],
    )?;

    Ok(())
}
```

---

## Common Hook Patterns

### 1. Transfer Counter

```rust
pub fn execute(ctx: Context<Execute>, amount: u64) -> Result<()> {
    let counter = &mut ctx.accounts.transfer_counter;
    counter.total_transfers += 1;
    counter.total_volume += amount;
    Ok(())
}
```

### 2. Daily Limit

```rust
pub fn execute(ctx: Context<Execute>, amount: u64) -> Result<()> {
    let limit = &mut ctx.accounts.daily_limit;
    let clock = Clock::get()?;
    
    // Reset if new day
    if clock.unix_timestamp - limit.last_reset > 86400 {
        limit.amount_today = 0;
        limit.last_reset = clock.unix_timestamp;
    }
    
    // Check limit
    require!(
        limit.amount_today + amount <= limit.daily_cap,
        ErrorCode::DailyLimitExceeded
    );
    
    limit.amount_today += amount;
    Ok(())
}
```

### 3. Royalty Payment

```rust
pub fn execute(ctx: Context<Execute>, amount: u64) -> Result<()> {
    let royalty = amount * 5 / 100; // 5% royalty
    
    // Transfer royalty to creator
    transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.destination.to_account_info(),
                to: ctx.accounts.creator_account.to_account_info(),
                authority: ctx.accounts.destination_authority.to_account_info(),
            },
        ),
        royalty,
    )?;
    
    Ok(())
}
```

---

## Testing

```typescript
describe("Transfer Hook", () => {
  it("Create mint with hook", async () => {
    await program.methods
      .createMintWithHook(hookProgramId)
      .accounts({
        mint: mint.publicKey,
        authority: authority.publicKey,
      })
      .rpc();
  });

  it("Transfer with hook execution", async () => {
    // Hook will be called automatically
    await transfer(
      connection,
      payer,
      sourceAccount,
      destinationAccount,
      owner,
      100 * 10**9,
      [],
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
  });

  it("Transfer fails if not whitelisted", async () => {
    try {
      await transfer(/* ... */);
      assert.fail("Should have failed");
    } catch (error) {
      assert.include(error.message, "SenderNotWhitelisted");
    }
  });
});
```

---

## Best Practices

1. **Gas Efficiency:** Keep hook logic minimal
2. **Error Handling:** Clear error messages
3. **Testing:** Test all edge cases
4. **Documentation:** Document hook behavior
5. **Upgradability:** Plan for hook updates

---

## Next Steps

- Learn about [Metadata Pointer](../14-metadata-pointer/)
- Explore [Permanent Delegate](../16-permanent-delegate/)
- Study [Additional Extensions](../18-additional-extensions/)

---

**Source:** Adapted from [Solana Program Examples](https://github.com/solana-developers/program-examples)
