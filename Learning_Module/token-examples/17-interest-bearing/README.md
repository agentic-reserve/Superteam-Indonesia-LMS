# Interest Bearing Tokens (Token-2022)

Learn how to create tokens that automatically accrue interest over time.

## Overview

Interest Bearing extension allows tokens to earn interest automatically, with the rate stored on-chain and interest calculated based on time elapsed.

## Learning Objectives

- Implement interest-bearing tokens
- Calculate accrued interest
- Update interest rates
- Build yield-generating assets

## Prerequisites

- Completed [Token-2022 Basics](../11-token-2022-basics/)
- Understanding of compound interest

---

## Implementation

### Create Interest-Bearing Mint

```rust
#[account(
    init,
    payer = payer,
    mint::decimals = 9,
    mint::authority = payer,
    mint::token_program = token_program,
    extensions::interest_bearing_mint::InterestBearingConfig {
        rate_authority: payer.key(),
        rate: 500, // 5% APY (basis points)
    },
)]
pub mint: InterfaceAccount<'info, Mint>,
```

### Calculate Interest

```rust
pub fn get_accrued_interest(
    balance: u64,
    rate_bps: i16,
    time_elapsed: i64,
) -> u64 {
    // Interest = balance * rate * time / (10000 * seconds_per_year)
    let interest = (balance as i128)
        .checked_mul(rate_bps as i128)
        .unwrap()
        .checked_mul(time_elapsed as i128)
        .unwrap()
        .checked_div(10000 * 31536000)
        .unwrap();
    
    interest as u64
}
```

### Update Interest Rate

```rust
pub fn update_rate(
    ctx: Context<UpdateRate>,
    new_rate: i16,
) -> Result<()> {
    let ix = update_rate_interest_bearing_mint(
        &ctx.accounts.token_program.key(),
        &ctx.accounts.mint.key(),
        &ctx.accounts.rate_authority.key(),
        &[],
        new_rate,
    )?;

    invoke(&ix, &[/* accounts */])?;
    Ok(())
}
```

---

## Use Cases

1. **Savings Accounts:** Yield-bearing deposits
2. **Staking Rewards:** Automatic reward accrual
3. **Bonds:** Interest-bearing securities
4. **DeFi:** Lending protocol receipts

---

## Best Practices

1. **Rate Management:** Reasonable rates
2. **Compounding:** Consider frequency
3. **Display:** Show accrued interest to users
4. **Governance:** Rate updates via DAO

---

**Source:** Adapted from [Solana Program Examples](https://github.com/solana-developers/program-examples)
