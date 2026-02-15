# Perpetual Futures

## Overview

Perpetual futures (perps) are derivative contracts that allow traders to speculate on asset prices with leverage, without an expiration date. Unlike traditional futures, perpetuals use a funding rate mechanism to keep prices anchored to the spot market. This lesson covers perpetual contract mechanics, funding rates, margin requirements, and real-world implementations like Percolator.

**Difficulty:** Advanced  
**Estimated Time:** 4-6 hours

## Learning Objectives

After completing this lesson, you will be able to:

- Understand perpetual contracts vs. traditional futures
- Implement funding rate mechanisms
- Design margin and liquidation systems
- Integrate oracle price feeds
- Build production-grade perpetual exchanges

## Prerequisites

- Completed [Token Economics](../01-token-economics/README.md) and [AMM Basics](../02-amm-basics/README.md)
- Strong understanding of financial derivatives
- Familiarity with leverage and margin trading
- Knowledge of Anchor framework and Solana programs

## Perpetual Contracts Explained

### Traditional Futures vs. Perpetuals

**Traditional Futures:**
- Fixed expiration date
- Settlement at expiry
- Basis (price difference from spot) converges to zero at expiry

**Perpetual Futures:**
- No expiration date
- Continuous trading
- Funding rate mechanism keeps price near spot

### Key Components

1. **Position**: Long (bullish) or short (bearish) exposure
2. **Leverage**: Multiply exposure (e.g., 10x leverage = 10x gains/losses)
3. **Margin**: Collateral backing the position
4. **Funding Rate**: Periodic payment between longs and shorts
5. **Mark Price**: Fair price used for liquidations (oracle-based)
6. **Liquidation**: Forced position closure when margin insufficient

## Funding Rate Mechanism

### Purpose

Funding rates incentivize price convergence to spot:
- When perp > spot: Longs pay shorts (incentive to short)
- When perp < spot: Shorts pay longs (incentive to long)

### Calculation

```rust
// Funding rate formula
// funding_rate = (perp_price - spot_price) / spot_price * k

pub fn calculate_funding_rate(
    perp_price: u64,
    spot_price: u64,
    k_bps: i64,  // Funding coefficient in basis points
) -> i64 {
    let price_diff = (perp_price as i128) - (spot_price as i128);
    let funding_bps = (price_diff * k_bps as i128) / (spot_price as i128);
    funding_bps as i64
}
```

### Funding Payment

```rust
pub fn calculate_funding_payment(
    position_size: i128,  // Positive for long, negative for short
    funding_rate_bps: i64,
    price: u64,
) -> i128 {
    // Notional value
    let notional = (position_size.abs() as u128)
        .checked_mul(price as u128)
        .unwrap()
        .checked_div(1_000_000)  // Price scaled by 1e6
        .unwrap() as i128;
    
    // Funding payment (positive = pay, negative = receive)
    let payment = (notional as i128)
        .checked_mul(funding_rate_bps as i128)
        .unwrap()
        .checked_div(10_000)
        .unwrap();
    
    // Longs pay when funding positive, shorts pay when negative
    if position_size > 0 {
        payment
    } else {
        -payment
    }
}
```

### Percolator's Funding Implementation

Percolator uses an event-segmented accrual model for O(1) funding updates:

```rust
// From percolator spec.md Section 7.1.1
#[account]
pub struct FundingState {
    /// Global funding index (cumulative)
    pub funding_index: i128,
    /// Last funding update slot
    pub last_funding_slot: u64,
    /// Funding rate for current interval (bps per slot)
    pub funding_rate_bps_per_slot: i64,
}

pub fn accrue_funding(
    funding_state: &mut FundingState,
    current_slot: u64,
    price_sample: u64,
) -> Result<()> {
    let dt = current_slot.saturating_sub(funding_state.last_funding_slot);
    
    // ΔF = price * rate * dt / 10_000
    let delta_f = (price_sample as i128)
        .checked_mul(funding_state.funding_rate_bps_per_slot as i128)
        .unwrap()
        .checked_mul(dt as i128)
        .unwrap()
        .checked_div(10_000)
        .unwrap();
    
    funding_state.funding_index = funding_state
        .funding_index
        .checked_add(delta_f)
        .unwrap();
    
    funding_state.last_funding_slot = current_slot;
    
    Ok(())
}

pub fn settle_funding_for_account(
    account: &mut TradingAccount,
    funding_state: &FundingState,
) -> Result<()> {
    let delta_f = funding_state.funding_index - account.funding_snapshot;
    
    // funding_payment = position * ΔF / 1e6
    let funding_payment = (account.position_size as i128)
        .checked_mul(delta_f)
        .unwrap()
        .checked_div(1_000_000)
        .unwrap();
    
    // Deduct from PnL
    account.realized_pnl = account
        .realized_pnl
        .checked_sub(funding_payment)
        .unwrap();
    
    account.funding_snapshot = funding_state.funding_index;
    
    Ok(())
}
```

**Key Property:** Anti-retroactivity - funding rate changes only apply to future intervals, preventing manipulation.

## Margin and Leverage

### Margin Types

**Initial Margin (IM):** Required to open a position
```
IM = Notional * IM_Ratio
```

**Maintenance Margin (MM):** Minimum to keep position open
```
MM = Notional * MM_Ratio
```

Typical ratios:
- 10x leverage: IM = 10%, MM = 5%
- 20x leverage: IM = 5%, MM = 2.5%

### Margin Calculation

```rust
#[account]
pub struct TradingAccount {
    pub owner: Pubkey,
    pub capital: u128,           // Protected principal
    pub realized_pnl: i128,      // Realized profit/loss
    pub position_size: i128,     // Base units (+ long, - short)
    pub entry_price: u64,        // Last settlement price
    pub funding_snapshot: i128,  // Funding index snapshot
}

pub fn calculate_margin_equity(
    account: &TradingAccount,
    mark_price: u64,
    haircut_ratio: (u128, u128),  // (numerator, denominator)
) -> u128 {
    // Mark-to-market PnL
    let mark_pnl = calculate_mark_pnl(
        account.position_size,
        account.entry_price,
        mark_price,
    );
    
    // Effective positive PnL (haircutted if system stressed)
    let effective_pnl = if account.realized_pnl > 0 {
        let (h_num, h_den) = haircut_ratio;
        ((account.realized_pnl as u128)
            .checked_mul(h_num)
            .unwrap()
            .checked_div(h_den)
            .unwrap()) as i128
    } else {
        account.realized_pnl
    };
    
    // Equity = capital + realized_pnl + mark_pnl
    let equity = (account.capital as i128)
        .checked_add(effective_pnl)
        .unwrap()
        .checked_add(mark_pnl)
        .unwrap();
    
    equity.max(0) as u128
}

pub fn calculate_mark_pnl(
    position_size: i128,
    entry_price: u64,
    mark_price: u64,
) -> i128 {
    if position_size == 0 {
        return 0;
    }
    
    let price_diff = (mark_price as i128) - (entry_price as i128);
    
    // PnL = position * (mark_price - entry_price) / 1e6
    (position_size as i128)
        .checked_mul(price_diff)
        .unwrap()
        .checked_div(1_000_000)
        .unwrap()
}

pub fn check_margin_requirements(
    account: &TradingAccount,
    mark_price: u64,
    haircut_ratio: (u128, u128),
    maintenance_bps: u16,
    initial_bps: u16,
    is_risk_increasing: bool,
) -> Result<()> {
    let equity = calculate_margin_equity(account, mark_price, haircut_ratio);
    
    let notional = (account.position_size.abs() as u128)
        .checked_mul(mark_price as u128)
        .unwrap()
        .checked_div(1_000_000)
        .unwrap();
    
    let mm_required = notional
        .checked_mul(maintenance_bps as u128)
        .unwrap()
        .checked_div(10_000)
        .unwrap();
    
    let im_required = notional
        .checked_mul(initial_bps as u128)
        .unwrap()
        .checked_div(10_000)
        .unwrap();
    
    // Always check maintenance margin
    require!(equity > mm_required, ErrorCode::InsufficientMargin);
    
    // Check initial margin for risk-increasing trades
    if is_risk_increasing {
        require!(equity >= im_required, ErrorCode::InsufficientInitialMargin);
    }
    
    Ok(())
}
```

### Risk-Increasing Trades

From Percolator spec (Section 9.1.1):

A trade is risk-increasing when:
1. Position magnitude increases: `|new_pos| > |old_pos|`
2. Position flips sign: long → short or short → long

```rust
pub fn is_risk_increasing(old_pos: i128, new_pos: i128) -> bool {
    // Magnitude increase
    if new_pos.abs() > old_pos.abs() {
        return true;
    }
    
    // Position flip (crosses zero)
    if (old_pos > 0 && new_pos < 0) || (old_pos < 0 && new_pos > 0) {
        return true;
    }
    
    false
}
```

## Liquidation Mechanics

### Liquidation Trigger

An account is liquidatable when:
```
Equity ≤ Maintenance Margin
```

### Liquidation Process

```rust
pub fn liquidate_position(
    ctx: Context<Liquidate>,
    oracle_price: u64,
) -> Result<()> {
    let account = &mut ctx.accounts.trading_account;
    let config = &ctx.accounts.config;
    
    // Settle to oracle price
    settle_mark_to_oracle(account, oracle_price)?;
    settle_funding(account, &ctx.accounts.funding_state)?;
    
    // Check if liquidatable
    let equity = calculate_margin_equity(
        account,
        oracle_price,
        get_haircut_ratio(&ctx.accounts.global_state),
    );
    
    let notional = (account.position_size.abs() as u128)
        .checked_mul(oracle_price as u128)
        .unwrap()
        .checked_div(1_000_000)
        .unwrap();
    
    let mm_required = notional
        .checked_mul(config.maintenance_bps as u128)
        .unwrap()
        .checked_div(10_000)
        .unwrap();
    
    require!(equity <= mm_required, ErrorCode::NotLiquidatable);
    
    // Close position at oracle price
    let pnl = calculate_mark_pnl(
        account.position_size,
        account.entry_price,
        oracle_price,
    );
    
    account.realized_pnl = account.realized_pnl.checked_add(pnl).unwrap();
    account.position_size = 0;
    account.entry_price = oracle_price;
    
    // Charge liquidation fee
    let liquidation_fee = notional
        .checked_mul(config.liquidation_fee_bps as u128)
        .unwrap()
        .checked_div(10_000)
        .unwrap();
    
    account.capital = account
        .capital
        .checked_sub(liquidation_fee)
        .unwrap_or(0);
    
    // Pay liquidator
    let liquidator_reward = liquidation_fee / 2;
    // Transfer liquidator_reward to liquidator...
    
    // Settle losses
    settle_losses(account, &mut ctx.accounts.global_state)?;
    
    Ok(())
}
```

### Percolator's Liquidation Approach

Percolator uses oracle-based liquidation with no global ADL scans:

- Liquidations happen at oracle price
- Losses are socialized via haircut ratio `h`
- No forced closure of profitable positions (ADL)
- System remains live regardless of open interest

## Oracle Integration

### Chainlink Integration

```rust
use chainlink_solana as chainlink;

pub fn get_chainlink_price(
    oracle_account: &AccountInfo,
) -> Result<u64> {
    let round = chainlink::latest_round_data(
        oracle_account.clone(),
    )?;
    
    // Chainlink returns i128, convert to u64 (scaled by 1e6)
    let price = round.answer;
    require!(price > 0, ErrorCode::InvalidOraclePrice);
    
    // Scale to 1e6 if needed
    let price_e6 = (price as u64)
        .checked_mul(1_000_000)
        .unwrap()
        .checked_div(100_000_000)  // Chainlink uses 8 decimals
        .unwrap();
    
    Ok(price_e6)
}
```

### Pyth Integration

```rust
use pyth_solana_receiver_sdk::price_update::{PriceUpdateV2, get_feed_id_from_hex};

pub fn get_pyth_price(
    price_update: &PriceUpdateV2,
    feed_id: &[u8; 32],
) -> Result<u64> {
    let price = price_update.get_price_no_older_than(
        &Clock::get()?,
        60,  // Max age in seconds
        feed_id,
    )?;
    
    let price_e6 = if price.exponent >= 0 {
        (price.price as u64)
            .checked_mul(10u64.pow(price.exponent as u32))
            .unwrap()
            .checked_mul(1_000_000)
            .unwrap()
    } else {
        (price.price as u64)
            .checked_mul(1_000_000)
            .unwrap()
            .checked_div(10u64.pow((-price.exponent) as u32))
            .unwrap()
    };
    
    Ok(price_e6)
}
```

## Trading Operations

### Execute Trade

```rust
pub fn execute_trade(
    ctx: Context<ExecuteTrade>,
    size: i128,  // Positive = buy, negative = sell
    oracle_price: u64,
) -> Result<()> {
    let user = &mut ctx.accounts.user_account;
    let lp = &mut ctx.accounts.lp_account;
    let config = &ctx.accounts.config;
    
    // Settle both accounts to oracle
    settle_to_oracle(user, oracle_price)?;
    settle_to_oracle(lp, oracle_price)?;
    settle_funding(user, &ctx.accounts.funding_state)?;
    settle_funding(lp, &ctx.accounts.funding_state)?;
    
    // Check if risk-increasing for user
    let old_pos = user.position_size;
    let new_pos = old_pos.checked_add(size).unwrap();
    let risk_increasing = is_risk_increasing(old_pos, new_pos);
    
    // Calculate trade PnL (zero-sum before fees)
    let trade_pnl = calculate_mark_pnl(size, user.entry_price, oracle_price);
    
    // Apply position changes
    user.position_size = new_pos;
    user.realized_pnl = user.realized_pnl.checked_add(trade_pnl).unwrap();
    user.entry_price = oracle_price;
    
    lp.position_size = lp.position_size.checked_sub(size).unwrap();
    lp.realized_pnl = lp.realized_pnl.checked_sub(trade_pnl).unwrap();
    lp.entry_price = oracle_price;
    
    // Charge trading fee
    let notional = (size.abs() as u128)
        .checked_mul(oracle_price as u128)
        .unwrap()
        .checked_div(1_000_000)
        .unwrap();
    
    let fee = notional
        .checked_mul(config.trading_fee_bps as u128)
        .unwrap()
        .checked_div(10_000)
        .unwrap();
    
    user.capital = user.capital.checked_sub(fee).unwrap();
    ctx.accounts.insurance_fund.balance = ctx.accounts
        .insurance_fund
        .balance
        .checked_add(fee)
        .unwrap();
    
    // Check margin requirements
    check_margin_requirements(
        user,
        oracle_price,
        get_haircut_ratio(&ctx.accounts.global_state),
        config.maintenance_bps,
        config.initial_bps,
        risk_increasing,
    )?;
    
    Ok(())
}

fn settle_to_oracle(
    account: &mut TradingAccount,
    oracle_price: u64,
) -> Result<()> {
    let mark_pnl = calculate_mark_pnl(
        account.position_size,
        account.entry_price,
        oracle_price,
    );
    
    account.realized_pnl = account.realized_pnl.checked_add(mark_pnl).unwrap();
    account.entry_price = oracle_price;
    
    Ok(())
}
```

## Real-World Example: Percolator

Percolator is a production-grade perpetual futures risk engine with formal verification.

### Core Innovation: Withdrawal-Window Model

Instead of Auto-Deleveraging (ADL), Percolator uses a global haircut ratio:

```
h = min(Residual, PNL_pos_tot) / PNL_pos_tot

where:
  Residual = max(0, Vault - Capital_tot - Insurance)
  PNL_pos_tot = sum of all positive PnL
```

**Key Properties:**
- Principal (capital) is senior and protected
- Profits are junior claims, haircutted by `h` when system stressed
- No forced closure of profitable positions
- System self-heals as losses are realized

### Percolator Architecture

```rust
// Simplified from percolator spec

#[account]
pub struct GlobalState {
    pub vault_balance: u128,
    pub capital_total: u128,
    pub pnl_positive_total: u128,
    pub insurance_fund: u128,
}

pub fn get_haircut_ratio(state: &GlobalState) -> (u128, u128) {
    let residual = state
        .vault_balance
        .saturating_sub(state.capital_total)
        .saturating_sub(state.insurance_fund);
    
    if state.pnl_positive_total == 0 {
        return (1, 1);  // h = 1
    }
    
    let h_num = residual.min(state.pnl_positive_total);
    let h_den = state.pnl_positive_total;
    
    (h_num, h_den)
}
```

### Percolator CLI Usage

```bash
# Initialize user account
percolator-cli init-user --slab <slab-pubkey>

# Deposit collateral
percolator-cli deposit \
  --slab <slab-pubkey> \
  --user-idx <idx> \
  --amount 50000000

# Execute trade (long 1000 units)
percolator-cli trade-cpi \
  --slab <slab-pubkey> \
  --user-idx <user-idx> \
  --lp-idx 0 \
  --size 1000 \
  --matcher-program <matcher-program> \
  --matcher-ctx <matcher-ctx> \
  --oracle <oracle-pubkey>

# Run keeper crank (updates funding, liquidations)
percolator-cli keeper-crank \
  --slab <slab-pubkey> \
  --oracle <oracle-pubkey>
```

**Source:** [percolator/percolator-cli](../../../percolator/percolator-cli/)

## Best Practices

1. **Oracle Security** - Use multiple oracles, TWAP for manipulation resistance
2. **Margin Buffers** - Set MM < IM to prevent instant liquidation
3. **Funding Caps** - Limit maximum funding rate to prevent manipulation
4. **Liquidation Incentives** - Reward liquidators adequately
5. **Insurance Fund** - Maintain buffer for extreme events
6. **Circuit Breakers** - Pause trading during oracle failures
7. **Formal Verification** - Prove conservation and solvency properties

## Common Pitfalls

1. **Oracle Manipulation** - Flash loan attacks on price feeds
2. **Cascading Liquidations** - Liquidations trigger more liquidations
3. **Funding Rate Manipulation** - Attackers game funding mechanism
4. **Insufficient Insurance** - System becomes insolvent
5. **Reentrancy** - Multiple calls drain positions
6. **Rounding Errors** - Precision loss in PnL calculations
7. **ADL Complexity** - Global scans don't scale

## Exercises

1. Implement a basic perpetual futures contract
2. Add funding rate mechanism
3. Build liquidation logic with oracle integration
4. Create a keeper bot for cranking
5. Implement Percolator's haircut ratio system

## Source Attribution

This content is based on educational materials from:

- **Percolator**: [percolator/percolator](../../../percolator/percolator/)
  - `README.md` - Core concepts and withdrawal-window model
  - `spec.md` - Complete technical specification (Sections 7, 9, 10)
  - Funding rate implementation (Section 7.1)
  - Margin requirements (Section 9.1)
  - Liquidation mechanics (Section 9.2-9.3)
- **Percolator CLI**: [percolator/percolator-cli](../../../percolator/percolator-cli/)
  - `README.md` - Trading operations and CLI usage
  - Market setup and configuration examples
- **Percolator Match**: [percolator/percolator-match](../../../percolator/percolator-match/)
  - `README.md` - Passive LP matcher implementation
- **Tarun Chitra**: "Autodeleveraging: Impossibilities and Optimization", arXiv:2512.01112, 2025

## Next Steps

- [Risk Engines](../04-risk-engines/README.md) - Deep dive into risk management
- [Security](../../security/README.md) - Secure your perpetual exchange
- [Exercises](../exercises/README.md) - Build a complete perp system

## Additional Resources

- [Perpetual Protocol Whitepaper](https://perp.com/)
- [dYdX Documentation](https://docs.dydx.exchange/)
- [Drift Protocol](https://docs.drift.trade/)
- [Percolator GitHub](https://github.com/aeyakovenko/percolator)
