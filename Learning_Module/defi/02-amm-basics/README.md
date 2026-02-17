# Automated Market Maker (AMM) Basics

## Overview

Automated Market Makers (AMMs) are the foundation of decentralized exchanges on Solana. Unlike traditional order book exchanges, AMMs use mathematical formulas to price assets and enable permissionless trading. This lesson covers the constant product formula, liquidity provision, and implementing basic AMM logic.

**Difficulty:** Intermediate  
**Estimated Time:** 3-4 hours

## Learning Objectives

After completing this lesson, you will be able to:

- Understand the constant product formula (x * y = k)
- Calculate swap prices and slippage
- Implement liquidity pool operations
- Design LP token mechanics
- Handle impermanent loss considerations

## Prerequisites

- Completed [Token Economics](../01-token-economics/README.md)
- Understanding of [SPL Tokens](../../basics/03-tokens/README.md)
- Basic calculus and algebra knowledge
- Familiarity with Anchor framework

## The Constant Product Formula

### Core Concept

The most common AMM formula is the constant product market maker:

```
x * y = k
```

Where:
- `x` = reserve of token A
- `y` = reserve of token B
- `k` = constant product

**Key Property:** The product of reserves remains constant after swaps (minus fees).

### Price Discovery

The price of token A in terms of token B is:

```
price_A = y / x
price_B = x / y
```

As traders buy token A, `x` decreases and `y` increases, making token A more expensive.

### Swap Calculation

When swapping `Δx` of token A for token B:

```
(x + Δx) * (y - Δy) = k
```

Solving for `Δy`:

```
Δy = y - (k / (x + Δx))
Δy = y - (x * y) / (x + Δx)
Δy = (y * Δx) / (x + Δx)
```

## Implementing a Basic AMM

### Pool State

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint};

#[account]
pub struct LiquidityPool {
    /// Token A mint
    pub token_a_mint: Pubkey,
    /// Token B mint
    pub token_b_mint: Pubkey,
    /// Token A reserve account
    pub token_a_account: Pubkey,
    /// Token B reserve account
    pub token_b_account: Pubkey,
    /// LP token mint
    pub lp_token_mint: Pubkey,
    /// Fee in basis points (30 = 0.3%)
    pub fee_bps: u16,
    /// Pool authority bump
    pub bump: u8,
}

impl LiquidityPool {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 32 + 32 + 2 + 1;
}
```

### Initialize Pool

```rust
#[program]
pub mod simple_amm {
    use super::*;

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        fee_bps: u16,
    ) -> Result<()> {
        require!(fee_bps <= 10000, ErrorCode::InvalidFee);
        
        let pool = &mut ctx.accounts.pool;
        pool.token_a_mint = ctx.accounts.token_a_mint.key();
        pool.token_b_mint = ctx.accounts.token_b_mint.key();
        pool.token_a_account = ctx.accounts.token_a_account.key();
        pool.token_b_account = ctx.accounts.token_b_account.key();
        pool.lp_token_mint = ctx.accounts.lp_token_mint.key();
        pool.fee_bps = fee_bps;
        pool.bump = *ctx.bumps.get("pool_authority").unwrap();
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = payer,
        space = LiquidityPool::LEN
    )]
    pub pool: Account<'info, LiquidityPool>,
    
    pub token_a_mint: Account<'info, Mint>,
    pub token_b_mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = payer,
        token::mint = token_a_mint,
        token::authority = pool_authority,
    )]
    pub token_a_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = payer,
        token::mint = token_b_mint,
        token::authority = pool_authority,
    )]
    pub token_b_account: Account<'info, TokenAccount>,
    
    #[account(
        init,
        payer = payer,
        mint::decimals = 9,
        mint::authority = pool_authority,
    )]
    pub lp_token_mint: Account<'info, Mint>,
    
    /// CHECK: PDA authority
    #[account(
        seeds = [b"pool_authority", pool.key().as_ref()],
        bump
    )]
    pub pool_authority: AccountInfo<'info>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
```

### Add Liquidity

```rust
pub fn add_liquidity(
    ctx: Context<AddLiquidity>,
    amount_a: u64,
    amount_b: u64,
    min_lp_tokens: u64,
) -> Result<()> {
    let pool = &ctx.accounts.pool;
    
    // Get current reserves
    let reserve_a = ctx.accounts.pool_token_a.amount;
    let reserve_b = ctx.accounts.pool_token_b.amount;
    
    // Calculate LP tokens to mint
    let lp_supply = ctx.accounts.lp_token_mint.supply;
    
    let lp_tokens = if lp_supply == 0 {
        // Initial liquidity: geometric mean
        ((amount_a as u128)
            .checked_mul(amount_b as u128)
            .unwrap() as f64)
            .sqrt() as u64
    } else {
        // Proportional to existing pool
        let lp_from_a = (amount_a as u128)
            .checked_mul(lp_supply as u128)
            .unwrap()
            .checked_div(reserve_a as u128)
            .unwrap() as u64;
        
        let lp_from_b = (amount_b as u128)
            .checked_mul(lp_supply as u128)
            .unwrap()
            .checked_div(reserve_b as u128)
            .unwrap() as u64;
        
        // Use minimum to maintain ratio
        std::cmp::min(lp_from_a, lp_from_b)
    };
    
    require!(lp_tokens >= min_lp_tokens, ErrorCode::SlippageExceeded);
    
    // Transfer token A
    let cpi_accounts = token::Transfer {
        from: ctx.accounts.user_token_a.to_account_info(),
        to: ctx.accounts.pool_token_a.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, amount_a)?;
    
    // Transfer token B
    let cpi_accounts = token::Transfer {
        from: ctx.accounts.user_token_b.to_account_info(),
        to: ctx.accounts.pool_token_b.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts
    );
    token::transfer(cpi_ctx, amount_b)?;
    
    // Mint LP tokens
    let seeds = &[
        b"pool_authority",
        pool.key().as_ref(),
        &[pool.bump],
    ];
    let signer = &[&seeds[..]];
    
    let cpi_accounts = token::MintTo {
        mint: ctx.accounts.lp_token_mint.to_account_info(),
        to: ctx.accounts.user_lp_token.to_account_info(),
        authority: ctx.accounts.pool_authority.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer
    );
    token::mint_to(cpi_ctx, lp_tokens)?;
    
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
    
    // Determine swap direction
    let (reserve_in, reserve_out) = if ctx.accounts.user_token_in.mint == pool.token_a_mint {
        (
            ctx.accounts.pool_token_a.amount,
            ctx.accounts.pool_token_b.amount,
        )
    } else {
        (
            ctx.accounts.pool_token_b.amount,
            ctx.accounts.pool_token_a.amount,
        )
    };
    
    // Calculate output amount with fee
    let amount_in_with_fee = (amount_in as u128)
        .checked_mul((10000 - pool.fee_bps) as u128)
        .unwrap()
        .checked_div(10000)
        .unwrap() as u64;
    
    // Constant product formula: (x + Δx) * (y - Δy) = k
    // Δy = (y * Δx) / (x + Δx)
    let amount_out = (reserve_out as u128)
        .checked_mul(amount_in_with_fee as u128)
        .unwrap()
        .checked_div(
            (reserve_in as u128)
                .checked_add(amount_in_with_fee as u128)
                .unwrap()
        )
        .unwrap() as u64;
    
    require!(amount_out >= minimum_amount_out, ErrorCode::SlippageExceeded);
    
    // Transfer input tokens to pool
    let cpi_accounts = token::Transfer {
        from: ctx.accounts.user_token_in.to_account_info(),
        to: ctx.accounts.pool_token_in.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, amount_in)?;
    
    // Transfer output tokens from pool
    let seeds = &[
        b"pool_authority",
        pool.key().as_ref(),
        &[pool.bump],
    ];
    let signer = &[&seeds[..]];
    
    let cpi_accounts = token::Transfer {
        from: ctx.accounts.pool_token_out.to_account_info(),
        to: ctx.accounts.user_token_out.to_account_info(),
        authority: ctx.accounts.pool_authority.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer
    );
    token::transfer(cpi_ctx, amount_out)?;
    
    Ok(())
}
```

### Remove Liquidity

```rust
pub fn remove_liquidity(
    ctx: Context<RemoveLiquidity>,
    lp_token_amount: u64,
    min_amount_a: u64,
    min_amount_b: u64,
) -> Result<()> {
    let pool = &ctx.accounts.pool;
    
    // Calculate proportional amounts
    let lp_supply = ctx.accounts.lp_token_mint.supply;
    let reserve_a = ctx.accounts.pool_token_a.amount;
    let reserve_b = ctx.accounts.pool_token_b.amount;
    
    let amount_a = (reserve_a as u128)
        .checked_mul(lp_token_amount as u128)
        .unwrap()
        .checked_div(lp_supply as u128)
        .unwrap() as u64;
    
    let amount_b = (reserve_b as u128)
        .checked_mul(lp_token_amount as u128)
        .unwrap()
        .checked_div(lp_supply as u128)
        .unwrap() as u64;
    
    require!(amount_a >= min_amount_a, ErrorCode::SlippageExceeded);
    require!(amount_b >= min_amount_b, ErrorCode::SlippageExceeded);
    
    // Burn LP tokens
    let cpi_accounts = token::Burn {
        mint: ctx.accounts.lp_token_mint.to_account_info(),
        from: ctx.accounts.user_lp_token.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::burn(cpi_ctx, lp_token_amount)?;
    
    // Transfer tokens back to user
    let seeds = &[
        b"pool_authority",
        pool.key().as_ref(),
        &[pool.bump],
    ];
    let signer = &[&seeds[..]];
    
    // Transfer token A
    let cpi_accounts = token::Transfer {
        from: ctx.accounts.pool_token_a.to_account_info(),
        to: ctx.accounts.user_token_a.to_account_info(),
        authority: ctx.accounts.pool_authority.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer
    );
    token::transfer(cpi_ctx, amount_a)?;
    
    // Transfer token B
    let cpi_accounts = token::Transfer {
        from: ctx.accounts.pool_token_b.to_account_info(),
        to: ctx.accounts.user_token_b.to_account_info(),
        authority: ctx.accounts.pool_authority.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer
    );
    token::transfer(cpi_ctx, amount_b)?;
    
    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid fee percentage")]
    InvalidFee,
    #[msg("Slippage tolerance exceeded")]
    SlippageExceeded,
}
```

## Price Impact and Slippage

### Price Impact

The change in price caused by a trade:

```rust
pub fn calculate_price_impact(
    amount_in: u64,
    reserve_in: u64,
    reserve_out: u64,
) -> f64 {
    let price_before = reserve_out as f64 / reserve_in as f64;
    
    let new_reserve_in = reserve_in + amount_in;
    let amount_out = (reserve_out as u128)
        .checked_mul(amount_in as u128)
        .unwrap()
        .checked_div(new_reserve_in as u128)
        .unwrap() as u64;
    
    let new_reserve_out = reserve_out - amount_out;
    let price_after = new_reserve_out as f64 / new_reserve_in as f64;
    
    ((price_after - price_before) / price_before) * 100.0
}
```

### Slippage Protection

Always use minimum output amounts:

```typescript
// Calculate expected output
const expectedOutput = calculateSwapOutput(amountIn, reserveIn, reserveOut);

// Apply slippage tolerance (e.g., 1%)
const slippageTolerance = 0.01;
const minimumOutput = expectedOutput * (1 - slippageTolerance);

// Execute swap with protection
await program.methods
  .swap(amountIn, minimumOutput)
  .accounts({...})
  .rpc();
```

## Impermanent Loss

### Concept

Impermanent loss occurs when the price ratio of pooled assets changes compared to when they were deposited.

### Calculation

```rust
pub fn calculate_impermanent_loss(
    initial_price_ratio: f64,
    current_price_ratio: f64,
) -> f64 {
    let price_change = current_price_ratio / initial_price_ratio;
    let sqrt_price_change = price_change.sqrt();
    
    let pool_value = 2.0 * sqrt_price_change / (1.0 + price_change);
    let hold_value = 1.0;
    
    (pool_value / hold_value - 1.0) * 100.0
}
```

### Example

If you provide liquidity with 1 ETH and 100 USDC (1 ETH = 100 USDC):

- Price doubles to 1 ETH = 200 USDC
- Your pool share is now worth ~1.414 ETH and ~141.4 USDC
- If you had held: 1 ETH and 100 USDC = 300 USDC value
- Pool value: ~282.8 USDC
- Impermanent loss: ~5.7%

## Advanced AMM Concepts

### Concentrated Liquidity

Provide liquidity in specific price ranges (like Uniswap V3):

```rust
#[account]
pub struct ConcentratedPosition {
    pub owner: Pubkey,
    pub lower_tick: i32,
    pub upper_tick: i32,
    pub liquidity: u128,
}
```

### Stable Swap Curve

Optimized for assets with similar values (stablecoins):

```
A * n^n * Σx_i + D = A * D * n^n + D^(n+1) / (n^n * Πx_i)
```

Where:
- `A` = amplification coefficient
- `n` = number of tokens
- `D` = invariant

### Multi-Asset Pools

Pools with more than two tokens (like Balancer):

```rust
#[account]
pub struct MultiAssetPool {
    pub tokens: Vec<Pubkey>,
    pub weights: Vec<u64>,  // Basis points (sum = 10000)
    pub reserves: Vec<u64>,
}
```

## Fee Structures

### Trading Fees

Typical fee ranges:
- 0.05% - Stable pairs
- 0.3% - Standard pairs
- 1.0% - Exotic pairs

### Fee Distribution

```rust
pub fn collect_fees(
    ctx: Context<CollectFees>,
) -> Result<()> {
    let pool = &ctx.accounts.pool;
    let lp_position = &ctx.accounts.lp_position;
    
    // Calculate accrued fees
    let total_fees = ctx.accounts.fee_account.amount;
    let lp_supply = ctx.accounts.lp_token_mint.supply;
    
    let user_fees = (total_fees as u128)
        .checked_mul(lp_position.lp_tokens as u128)
        .unwrap()
        .checked_div(lp_supply as u128)
        .unwrap() as u64;
    
    // Transfer fees to user
    let seeds = &[
        b"pool_authority",
        pool.key().as_ref(),
        &[pool.bump],
    ];
    let signer = &[&seeds[..]];
    
    let cpi_accounts = token::Transfer {
        from: ctx.accounts.fee_account.to_account_info(),
        to: ctx.accounts.user_token_account.to_account_info(),
        authority: ctx.accounts.pool_authority.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
        signer
    );
    token::transfer(cpi_ctx, user_fees)?;
    
    Ok(())
}
```

## Client-Side Integration

### TypeScript SDK Example

```typescript
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

class AMMClient {
  constructor(
    private program: Program,
    private poolAddress: PublicKey
  ) {}

  async getPoolState() {
    const pool = await this.program.account.liquidityPool.fetch(
      this.poolAddress
    );
    
    const tokenAAccount = await this.program.provider.connection.getTokenAccountBalance(
      pool.tokenAAccount
    );
    const tokenBAccount = await this.program.provider.connection.getTokenAccountBalance(
      pool.tokenBAccount
    );
    
    return {
      reserveA: tokenAAccount.value.amount,
      reserveB: tokenBAccount.value.amount,
      feeBps: pool.feeBps,
    };
  }

  calculateSwapOutput(
    amountIn: number,
    reserveIn: number,
    reserveOut: number,
    feeBps: number
  ): number {
    const amountInWithFee = amountIn * (10000 - feeBps) / 10000;
    return (reserveOut * amountInWithFee) / (reserveIn + amountInWithFee);
  }

  async swap(
    amountIn: number,
    minimumAmountOut: number,
    userTokenIn: PublicKey,
    userTokenOut: PublicKey
  ) {
    const pool = await this.program.account.liquidityPool.fetch(
      this.poolAddress
    );
    
    await this.program.methods
      .swap(amountIn, minimumAmountOut)
      .accounts({
        pool: this.poolAddress,
        userTokenIn,
        userTokenOut,
        poolTokenIn: pool.tokenAAccount,
        poolTokenOut: pool.tokenBAccount,
        poolAuthority: this.getPoolAuthority(),
        user: this.program.provider.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
  }

  private getPoolAuthority(): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('pool_authority'), this.poolAddress.toBuffer()],
      this.program.programId
    );
    return pda;
  }
}
```

## Best Practices

1. **Slippage Protection** - Always set minimum output amounts
2. **Price Oracles** - Use TWAP for manipulation resistance
3. **Reentrancy Guards** - Prevent reentrancy attacks
4. **Overflow Protection** - Use checked math operations
5. **Fee Validation** - Ensure fees are reasonable
6. **LP Token Security** - Protect LP token minting logic
7. **Emergency Pause** - Implement circuit breakers

## Common Pitfalls

1. **No Slippage Protection** - Users get sandwiched
2. **Integer Overflow** - Math operations overflow
3. **Rounding Errors** - Precision loss in calculations
4. **Flash Loan Attacks** - Price manipulation
5. **Reentrancy** - Multiple calls drain pool
6. **Unbalanced Liquidity** - Poor initial ratios

## Real-World Examples

### Raydium AMM

Raydium is a leading AMM on Solana with:
- Concentrated liquidity
- Multiple fee tiers
- Integration with Serum order books

### Orca Whirlpools

Orca's concentrated liquidity AMM features:
- Tick-based pricing
- Range orders
- Capital efficiency

### Meteora DLMM ⭐ NEW

Meteora's Dynamic Liquidity Market Maker represents the next evolution of AMMs on Solana:

**Key Features**:
- **Bin-Based Liquidity**: Discrete price points for precise control
- **Dynamic Fees**: Fees adjust based on market volatility
- **Multiple Strategies**: Uniform, spot-concentrated, and curve distributions
- **Capital Efficiency**: 80-90% utilization vs 10-20% in basic AMMs

**Why Learn Meteora**:
- Production protocol with significant TVL
- Advanced AMM concepts beyond basic x*y=k
- Comprehensive SDK and API support
- Real-world integration examples

**Deep Dive**: See [Meteora DLMM Guide](meteora-dlmm.md) for:
- Detailed DLMM concepts
- TypeScript SDK integration
- API usage examples
- Liquidity strategies
- Best practices

**Practice**: Complete [Meteora Integration Exercises](../exercises/meteora-integration.md)

## Exercises

1. Implement a simple constant product AMM
2. Add concentrated liquidity support
3. Create a stable swap curve implementation
4. Build a multi-asset pool
5. Implement fee collection and distribution
6. **Integrate Meteora DLMM** ⭐ NEW - See [exercises](../exercises/meteora-integration.md)

## Source Attribution

This content is based on educational materials from:

- **Uniswap V2 Whitepaper**: Constant product formula
- **Curve Finance**: Stable swap mathematics
- **Solana Program Library**: Token program patterns
- **Anchor Framework**: Program structure examples

## Next Steps

- [Perpetual Futures](../03-perpetual-futures/README.md) - Advanced DeFi products
- [Risk Engines](../04-risk-engines/README.md) - Risk management systems
- [Security](../../security/README.md) - Secure your AMM implementation

## Additional Resources

- [Uniswap V2 Core](https://github.com/Uniswap/v2-core)
- [Curve StableSwap Paper](https://curve.fi/files/stableswap-paper.pdf)
- [Balancer Whitepaper](https://balancer.fi/whitepaper.pdf)
- [Raydium Documentation](https://docs.raydium.io/)
