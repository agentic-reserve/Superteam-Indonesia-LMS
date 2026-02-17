# Token Swap

Learn how to implement a simple Automated Market Maker (AMM) for token swaps.

## Overview

This example demonstrates a basic constant product AMM (x * y = k) for swapping tokens. Understanding this pattern is essential for building DEXs and liquidity protocols.

## Learning Objectives

- Implement constant product formula
- Create liquidity pools
- Handle token swaps
- Calculate swap amounts with fees
- Understand AMM mechanics

## Prerequisites

- Completed [Transfer Tokens](../03-transfer-tokens/)
- Completed [Escrow](../07-escrow/)
- Understanding of AMM concepts

---

## AMM Fundamentals

### Constant Product Formula

```text
x * y = k

Where:
x = Token A reserves
y = Token B reserves
k = Constant product
```

### Swap Calculation

```text
Input: 100 Token A
Reserves: 1000 A, 2000 B
k = 1000 * 2000 = 2,000,000

New A = 1000 + 100 = 1100
New B = 2,000,000 / 1100 = 1818.18
Output = 2000 - 1818.18 = 181.82 Token B
```

---

## Implementation

### Pool State

```rust
#[account]
pub struct LiquidityPool {
    pub token_a_account: Pubkey,
    pub token_b_account: Pubkey,
    pub fee_numerator: u64,
    pub fee_denominator: u64,
    pub bump: u8,
}
```

### Initialize Pool

```rust
pub fn initialize_pool(
    ctx: Context<InitializePool>,
    fee_numerator: u64,
    fee_denominator: u64,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    pool.token_a_account = ctx.accounts.token_a_account.key();
    pool.token_b_account = ctx.accounts.token_b_account.key();
    pool.fee_numerator = fee_numerator;
    pool.fee_denominator = fee_denominator;
    pool.bump = ctx.bumps.pool;
    Ok(())
}
```

### Swap Tokens

```rust
pub fn swap(
    ctx: Context<Swap>,
    amount_in: u64,
    minimum_amount_out: u64,
) -> Result<()> {
    let pool = &ctx.accounts.pool;
    
    // Get reserves
    let reserve_in = ctx.accounts.pool_token_in.amount;
    let reserve_out = ctx.accounts.pool_token_out.amount;
    
    // Calculate output with fee
    let amount_in_with_fee = amount_in
        .checked_mul(pool.fee_denominator - pool.fee_numerator)
        .unwrap()
        .checked_div(pool.fee_denominator)
        .unwrap();
    
    let amount_out = reserve_out
        .checked_mul(amount_in_with_fee)
        .unwrap()
        .checked_div(reserve_in + amount_in_with_fee)
        .unwrap();
    
    require!(
        amount_out >= minimum_amount_out,
        ErrorCode::SlippageExceeded
    );
    
    // Transfer tokens in
    transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_in.to_account_info(),
                to: ctx.accounts.pool_token_in.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        amount_in,
    )?;
    
    // Transfer tokens out
    let seeds = &[b"pool", &[pool.bump]];
    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.pool_token_out.to_account_info(),
                to: ctx.accounts.user_token_out.to_account_info(),
                authority: ctx.accounts.pool.to_account_info(),
            },
            &[&seeds[..]],
        ),
        amount_out,
    )?;
    
    Ok(())
}
```

---

## Key Concepts

### 1. Slippage Protection

```rust
require!(
    amount_out >= minimum_amount_out,
    ErrorCode::SlippageExceeded
);
```

### 2. Fee Calculation

```rust
// 0.3% fee example
fee_numerator = 3
fee_denominator = 1000

amount_with_fee = amount * (1000 - 3) / 1000
```

### 3. Price Impact

```text
Large trades → Higher price impact
Small trades → Lower price impact
```

---

## Testing

```typescript
it("Swap tokens", async () => {
  const amountIn = new anchor.BN(100 * 10**9);
  const minAmountOut = new anchor.BN(90 * 10**9);
  
  await program.methods
    .swap(amountIn, minAmountOut)
    .accounts({
      user: user.publicKey,
      userTokenIn: userTokenA,
      userTokenOut: userTokenB,
      poolTokenIn: poolTokenA,
      poolTokenOut: poolTokenB,
    })
    .rpc();
});
```

---

## Best Practices

1. **Slippage Protection:** Always set minimum output
2. **Fee Validation:** Reasonable fee ranges
3. **Overflow Protection:** Use checked math
4. **Reserve Validation:** Prevent zero reserves
5. **Reentrancy Guards:** Protect against attacks

---

**Source:** Adapted from [Solana Program Examples](https://github.com/solana-developers/program-examples)
