# Token Fundraiser

Learn how to implement token sales, ICOs, and fundraising mechanisms with vesting.

## Overview

This example demonstrates creating a token fundraiser with configurable pricing, caps, and vesting schedules - essential for launching new tokens and managing token distribution.

## Learning Objectives

- Implement token sale mechanics
- Handle multiple pricing tiers
- Create vesting schedules
- Manage fundraiser caps and limits
- Build ICO/IDO platforms

## Prerequisites

- Completed [PDA Mint Authority](../06-pda-mint-authority/)
- Understanding of token economics
- Knowledge of time-based logic

---

## Fundraiser Fundamentals

### Components

1. **Sale Parameters:** Price, caps, duration
2. **Vesting Schedule:** Lock periods, release rates
3. **Participant Tracking:** Contributions, allocations
4. **Token Distribution:** Immediate + vested

### Fundraiser Flow

```text
1. Initialize: Set parameters (price, cap, duration)
2. Contribute: Users send SOL, receive tokens
3. Claim: Users claim vested tokens over time
4. Finalize: Close fundraiser, distribute remaining
```

---

## Implementation

### State Structure

```rust
#[account]
pub struct Fundraiser {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub price_per_token: u64,      // In lamports
    pub hard_cap: u64,              // Max tokens to sell
    pub soft_cap: u64,              // Min for success
    pub total_sold: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub vesting_duration: i64,
    pub bump: u8,
}

#[account]
pub struct Participant {
    pub fundraiser: Pubkey,
    pub user: Pubkey,
    pub total_contribution: u64,
    pub tokens_purchased: u64,
    pub tokens_claimed: u64,
    pub last_claim_time: i64,
}
```

### Initialize Fundraiser

```rust
pub fn initialize_fundraiser(
    ctx: Context<InitializeFundraiser>,
    price_per_token: u64,
    hard_cap: u64,
    soft_cap: u64,
    start_time: i64,
    end_time: i64,
    vesting_duration: i64,
) -> Result<()> {
    let fundraiser = &mut ctx.accounts.fundraiser;
    fundraiser.authority = ctx.accounts.authority.key();
    fundraiser.token_mint = ctx.accounts.token_mint.key();
    fundraiser.price_per_token = price_per_token;
    fundraiser.hard_cap = hard_cap;
    fundraiser.soft_cap = soft_cap;
    fundraiser.total_sold = 0;
    fundraiser.start_time = start_time;
    fundraiser.end_time = end_time;
    fundraiser.vesting_duration = vesting_duration;
    fundraiser.bump = ctx.bumps.fundraiser;
    Ok(())
}
```

### Contribute (Buy Tokens)

```rust
pub fn contribute(
    ctx: Context<Contribute>,
    sol_amount: u64,
) -> Result<()> {
    let fundraiser = &mut ctx.accounts.fundraiser;
    let participant = &mut ctx.accounts.participant;
    let clock = Clock::get()?;
    
    // Validate timing
    require!(
        clock.unix_timestamp >= fundraiser.start_time,
        ErrorCode::SaleNotStarted
    );
    require!(
        clock.unix_timestamp <= fundraiser.end_time,
        ErrorCode::SaleEnded
    );
    
    // Calculate tokens
    let tokens_to_buy = sol_amount
        .checked_mul(10u64.pow(9))
        .unwrap()
        .checked_div(fundraiser.price_per_token)
        .unwrap();
    
    // Check cap
    require!(
        fundraiser.total_sold + tokens_to_buy <= fundraiser.hard_cap,
        ErrorCode::HardCapReached
    );
    
    // Transfer SOL
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.fundraiser_vault.to_account_info(),
            },
        ),
        sol_amount,
    )?;
    
    // Update state
    fundraiser.total_sold += tokens_to_buy;
    participant.total_contribution += sol_amount;
    participant.tokens_purchased += tokens_to_buy;
    participant.last_claim_time = clock.unix_timestamp;
    
    Ok(())
}
```

### Claim Vested Tokens

```rust
pub fn claim_tokens(ctx: Context<ClaimTokens>) -> Result<()> {
    let fundraiser = &ctx.accounts.fundraiser;
    let participant = &mut ctx.accounts.participant;
    let clock = Clock::get()?;
    
    // Calculate vested amount
    let time_elapsed = clock.unix_timestamp - participant.last_claim_time;
    let vesting_progress = time_elapsed
        .checked_mul(10000)
        .unwrap()
        .checked_div(fundraiser.vesting_duration)
        .unwrap()
        .min(10000);
    
    let claimable = participant.tokens_purchased
        .checked_mul(vesting_progress as u64)
        .unwrap()
        .checked_div(10000)
        .unwrap()
        .checked_sub(participant.tokens_claimed)
        .unwrap();
    
    require!(claimable > 0, ErrorCode::NothingToClaim);
    
    // Mint tokens
    let seeds = &[b"fundraiser", &[fundraiser.bump]];
    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.token_mint.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.fundraiser.to_account_info(),
            },
            &[&seeds[..]],
        ),
        claimable,
    )?;
    
    participant.tokens_claimed += claimable;
    participant.last_claim_time = clock.unix_timestamp;
    
    Ok(())
}
```

---

## Key Features

### 1. Time-Based Validation

```rust
let clock = Clock::get()?;
require!(
    clock.unix_timestamp >= start_time && clock.unix_timestamp <= end_time,
    ErrorCode::InvalidTiming
);
```

### 2. Vesting Calculation

```rust
// Linear vesting
vesting_progress = (current_time - start_time) / total_duration
claimable = total_purchased * vesting_progress - already_claimed
```

### 3. Cap Management

```rust
require!(
    total_sold + new_purchase <= hard_cap,
    ErrorCode::HardCapReached
);
```

---

## Testing

```typescript
describe("Token Fundraiser", () => {
  it("Initialize fundraiser", async () => {
    await program.methods
      .initializeFundraiser(
        new anchor.BN(0.001 * LAMPORTS_PER_SOL), // 0.001 SOL per token
        new anchor.BN(1_000_000 * 10**9),         // 1M tokens hard cap
        new anchor.BN(100_000 * 10**9),           // 100K soft cap
        new anchor.BN(Date.now() / 1000),         // Start now
        new anchor.BN(Date.now() / 1000 + 86400), // End in 24h
        new anchor.BN(2592000)                    // 30 day vesting
      )
      .rpc();
  });

  it("Contribute to fundraiser", async () => {
    await program.methods
      .contribute(new anchor.BN(1 * LAMPORTS_PER_SOL))
      .rpc();
  });

  it("Claim vested tokens", async () => {
    // Wait for vesting period
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    await program.methods
      .claimTokens()
      .rpc();
  });
});
```

---

## Advanced Features

### Tiered Pricing

```rust
pub fn get_price_for_tier(total_sold: u64) -> u64 {
    match total_sold {
        0..=100_000 => 1_000_000,      // 0.001 SOL
        100_001..=500_000 => 1_500_000, // 0.0015 SOL
        _ => 2_000_000,                 // 0.002 SOL
    }
}
```

### Whitelist

```rust
#[account(
    seeds = [b"whitelist", user.key().as_ref()],
    bump
)]
pub whitelist_entry: Account<'info, WhitelistEntry>,
```

### Refunds (If Soft Cap Not Met)

```rust
pub fn refund(ctx: Context<Refund>) -> Result<()> {
    let fundraiser = &ctx.accounts.fundraiser;
    let participant = &ctx.accounts.participant;
    
    require!(
        fundraiser.total_sold < fundraiser.soft_cap,
        ErrorCode::SoftCapReached
    );
    
    // Return SOL to participant
    Ok(())
}
```

---

## Best Practices

1. **Validate Timing:** Check start/end times
2. **Cap Management:** Enforce hard/soft caps
3. **Vesting Logic:** Test thoroughly
4. **Overflow Protection:** Use checked math
5. **Emergency Controls:** Admin pause/cancel

---

## Next Steps

- Learn about [Token-2022 Basics](../11-token-2022-basics/)
- Explore [Transfer Fees](../12-transfer-fees/) for revenue models
- Study [Interest Bearing](../17-interest-bearing/) tokens

---

**Source:** Adapted from [Solana Program Examples](https://github.com/solana-developers/program-examples)
