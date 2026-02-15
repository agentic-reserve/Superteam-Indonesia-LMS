# Risk Engines

## Overview

Risk engines are the critical safety systems that prevent insolvency in DeFi protocols. They manage collateral, handle liquidations, and ensure the system can always honor withdrawals. This lesson covers production-grade risk management patterns, focusing on Percolator's formally verified approach to perpetual futures risk.

**Difficulty:** Advanced  
**Estimated Time:** 4-6 hours

## Learning Objectives

After completing this lesson, you will be able to:

- Design solvency-preserving risk systems
- Implement principal protection mechanisms
- Build global haircut ratio systems
- Handle undercollateralization gracefully
- Prove conservation properties

## Prerequisites

- Completed [Perpetual Futures](../03-perpetual-futures/README.md)
- Understanding of financial risk management
- Familiarity with formal verification concepts
- Strong Rust and Anchor knowledge

## Risk Engine Goals

### Security Properties

A production risk engine MUST provide:

1. **Principal Protection**: One account's insolvency cannot reduce another's protected capital
2. **Conservation**: System cannot create withdrawable claims exceeding vault balance
3. **Oracle Manipulation Safety**: Short-lived price distortions cannot be immediately withdrawn
4. **Liveness**: System remains operational without manual intervention
5. **No Zombie Poisoning**: Abandoned accounts cannot indefinitely collapse the system

### Traditional Approach: Auto-Deleveraging (ADL)

**How ADL Works:**
1. Liquidate underwater positions
2. Insurance fund absorbs losses
3. If insurance depleted → force-close profitable positions (ADL)

**Problems:**
- Requires global scans (doesn't scale)
- Forcibly closes positions without consent
- Complex recovery procedures
- Can block system if OI > 0

## Percolator's Withdrawal-Window Model

### Core Innovation

Instead of ADL, treat profit as a junior claim on a shared balance sheet.

**Two Claim Classes:**

1. **Senior: Capital (Principal)**
   - Fully withdrawable
   - Protected from other accounts' losses
   - Backed 1:1 by vault

2. **Junior: Profit (PnL)**
   - IOU backed by system residual
   - Must mature through warmup before withdrawal
   - Haircutted when system stressed

### The Global Haircut Ratio `h`

```rust
// From percolator spec Section 3

pub fn calculate_haircut_ratio(
    vault_balance: u128,
    capital_total: u128,
    insurance_fund: u128,
    pnl_positive_total: u128,
) -> (u128, u128) {
    // Residual = backing available for junior profits
    let residual = vault_balance
        .saturating_sub(capital_total)
        .saturating_sub(insurance_fund);
    
    if pnl_positive_total == 0 {
        return (1, 1);  // h = 1 (fully backed)
    }
    
    // h = min(Residual, PNL_pos_tot) / PNL_pos_tot
    let h_num = residual.min(pnl_positive_total);
    let h_den = pnl_positive_total;
    
    (h_num, h_den)
}
```

**Properties:**
- `h = 1`: System fully backed (all profits withdrawable)
- `h < 1`: System stressed (profits haircutted proportionally)
- `h = 0`: No backing for profits (only capital withdrawable)

### Effective Equity Calculation

```rust
pub fn calculate_effective_equity(
    capital: u128,
    realized_pnl: i128,
    mark_pnl: i128,
    haircut_ratio: (u128, u128),
) -> u128 {
    let (h_num, h_den) = haircut_ratio;
    
    // Haircut positive PnL
    let effective_pnl = if realized_pnl > 0 {
        if h_den == 0 {
            realized_pnl
        } else {
            ((realized_pnl as u128)
                .checked_mul(h_num)
                .unwrap()
                .checked_div(h_den)
                .unwrap()) as i128
        }
    } else {
        realized_pnl
    };
    
    // Equity = capital + effective_pnl + mark_pnl
    let equity = (capital as i128)
        .checked_add(effective_pnl)
        .unwrap()
        .checked_add(mark_pnl)
        .unwrap();
    
    equity.max(0) as u128
}
```

## Warmup: Time-Gated Profit Conversion

### Purpose

Prevents oracle manipulation: profits from short-lived price distortions cannot be immediately withdrawn as capital.

### Mechanism

```rust
#[account]
pub struct WarmupState {
    /// Warmup start slot
    pub warmup_started_at: u64,
    /// Slope: quote units per slot
    pub warmup_slope: u128,
}

pub fn calculate_warmable_amount(
    warmup: &WarmupState,
    available_profit: u128,
    current_slot: u64,
    warmup_period_slots: u64,
) -> u128 {
    if warmup_period_slots == 0 {
        return available_profit;  // Instant warmup
    }
    
    let elapsed = current_slot.saturating_sub(warmup.warmup_started_at);
    let cap = warmup.slope.checked_mul(elapsed as u128).unwrap();
    
    available_profit.min(cap)
}

pub fn update_warmup_slope(
    warmup: &mut WarmupState,
    available_profit: u128,
    warmup_period_slots: u64,
    current_slot: u64,
) {
    if available_profit == 0 {
        warmup.warmup_slope = 0;
    } else if warmup_period_slots > 0 {
        warmup.warmup_slope = available_profit
            .checked_div(warmup_period_slots as u128)
            .unwrap()
            .max(1);
    } else {
        warmup.warmup_slope = available_profit;
    }
    
    warmup.warmup_started_at = current_slot;
}
```

### Profit Conversion

```rust
pub fn convert_profit_to_capital(
    account: &mut TradingAccount,
    warmup: &mut WarmupState,
    haircut_ratio: (u128, u128),
    current_slot: u64,
    warmup_period_slots: u64,
) -> Result<()> {
    let available_profit = account.realized_pnl.max(0) as u128;
    
    let warmable = calculate_warmable_amount(
        warmup,
        available_profit,
        current_slot,
        warmup_period_slots,
    );
    
    if warmable == 0 {
        return Ok(());
    }
    
    // Apply haircut to conversion
    let (h_num, h_den) = haircut_ratio;
    let converted = if h_den == 0 {
        warmable
    } else {
        warmable
            .checked_mul(h_num)
            .unwrap()
            .checked_div(h_den)
            .unwrap()
    };
    
    // Reduce junior profit claim
    account.realized_pnl = account
        .realized_pnl
        .checked_sub(warmable as i128)
        .unwrap();
    
    // Increase protected capital
    account.capital = account.capital.checked_add(converted).unwrap();
    
    // Advance warmup
    warmup.warmup_started_at = current_slot;
    update_warmup_slope(
        warmup,
        account.realized_pnl.max(0) as u128,
        warmup_period_slots,
        current_slot,
    );
    
    Ok(())
}
```

## Loss Settlement

### Immediate Loss Payment

Losses are paid from capital immediately (no warmup):

```rust
pub fn settle_losses(
    account: &mut TradingAccount,
    global_state: &mut GlobalState,
) -> Result<()> {
    if account.realized_pnl >= 0 {
        return Ok(());  // No losses
    }
    
    let loss = (-account.realized_pnl) as u128;
    let payment = loss.min(account.capital);
    
    // Pay from capital
    account.capital = account.capital.checked_sub(payment).unwrap();
    global_state.capital_total = global_state
        .capital_total
        .checked_sub(payment)
        .unwrap();
    
    // Reduce loss
    account.realized_pnl = account
        .realized_pnl
        .checked_add(payment as i128)
        .unwrap();
    
    // Write off unpayable loss
    if account.realized_pnl < 0 {
        account.realized_pnl = 0;
        // Loss is now represented by Residual < PNL_pos_tot
        // which causes h < 1 (haircut on all profits)
    }
    
    Ok(())
}
```

**Key Property:** Losses never directly reduce another account's capital. Instead, they reduce `Residual`, which haircuts all junior profits proportionally.

## Aggregate Maintenance

### O(1) Global State

```rust
#[account]
pub struct GlobalState {
    /// Vault token balance
    pub vault_balance: u128,
    /// Sum of all capital
    pub capital_total: u128,
    /// Sum of all positive PnL
    pub pnl_positive_total: u128,
    /// Insurance fund balance
    pub insurance_fund: u128,
}

// Helper: Update capital aggregate
pub fn set_capital(
    account: &mut TradingAccount,
    global_state: &mut GlobalState,
    new_capital: u128,
) {
    let delta = (new_capital as i128) - (account.capital as i128);
    
    global_state.capital_total = if delta >= 0 {
        global_state
            .capital_total
            .checked_add(delta as u128)
            .unwrap()
    } else {
        global_state
            .capital_total
            .checked_sub((-delta) as u128)
            .unwrap()
    };
    
    account.capital = new_capital;
}

// Helper: Update PnL aggregate
pub fn set_pnl(
    account: &mut TradingAccount,
    global_state: &mut GlobalState,
    new_pnl: i128,
) {
    let old_pos = account.realized_pnl.max(0) as u128;
    let new_pos = new_pnl.max(0) as u128;
    
    let delta = (new_pos as i128) - (old_pos as i128);
    
    global_state.pnl_positive_total = if delta >= 0 {
        global_state
            .pnl_positive_total
            .checked_add(delta as u128)
            .unwrap()
    } else {
        global_state
            .pnl_positive_total
            .checked_sub((-delta) as u128)
            .unwrap()
    };
    
    account.realized_pnl = new_pnl;
}
```

## Fee Management

### Trading Fees (Senior)

Trading fees go to insurance fund (senior claim):

```rust
pub fn charge_trading_fee(
    account: &mut TradingAccount,
    global_state: &mut GlobalState,
    notional: u128,
    fee_bps: u16,
) -> Result<()> {
    // Use ceiling division to prevent micro-trade evasion
    let fee = notional
        .checked_mul(fee_bps as u128)
        .unwrap()
        .checked_add(9999)
        .unwrap()
        .checked_div(10000)
        .unwrap();
    
    require!(fee <= account.capital, ErrorCode::InsufficientCapital);
    
    // Deduct from capital
    set_capital(account, global_state, account.capital - fee);
    
    // Credit insurance
    global_state.insurance_fund = global_state
        .insurance_fund
        .checked_add(fee)
        .unwrap();
    
    Ok(())
}
```

### Maintenance Fees (Can Create Debt)

```rust
#[account]
pub struct TradingAccount {
    // ... other fields
    pub fee_credits: i128,  // Can go negative (debt)
    pub last_fee_slot: u64,
}

pub fn accrue_maintenance_fees(
    account: &mut TradingAccount,
    current_slot: u64,
    fee_per_slot: u64,
) {
    let slots_elapsed = current_slot.saturating_sub(account.last_fee_slot);
    let fees_due = (slots_elapsed as u128)
        .checked_mul(fee_per_slot as u128)
        .unwrap() as i128;
    
    account.fee_credits = account.fee_credits.checked_sub(fees_due).unwrap();
    account.last_fee_slot = current_slot;
}

pub fn sweep_fee_debt(
    account: &mut TradingAccount,
    global_state: &mut GlobalState,
) -> Result<()> {
    let debt = (-account.fee_credits).max(0) as u128;
    
    if debt == 0 {
        return Ok(());
    }
    
    let payment = debt.min(account.capital);
    
    // Pay from capital
    set_capital(account, global_state, account.capital - payment);
    
    // Credit insurance
    global_state.insurance_fund = global_state
        .insurance_fund
        .checked_add(payment)
        .unwrap();
    
    // Reduce debt
    account.fee_credits = account.fee_credits.checked_add(payment as i128).unwrap();
    
    Ok(())
}

// Fee debt reduces margin equity
pub fn calculate_equity_with_fee_debt(
    account: &TradingAccount,
    mark_price: u64,
    haircut_ratio: (u128, u128),
) -> u128 {
    let base_equity = calculate_effective_equity(
        account.capital,
        account.realized_pnl,
        calculate_mark_pnl(account.position_size, account.entry_price, mark_price),
        haircut_ratio,
    );
    
    let fee_debt = (-account.fee_credits).max(0) as u128;
    
    base_equity.saturating_sub(fee_debt)
}
```

## Keeper Crank: Non-Interactive Progress

### Purpose

Prevents "zombie poisoning": abandoned accounts with positive PnL cannot indefinitely collapse `h` for everyone.

### Implementation

```rust
pub fn keeper_crank(
    ctx: Context<KeeperCrank>,
    oracle_price: u64,
) -> Result<()> {
    let global_state = &mut ctx.accounts.global_state;
    let funding_state = &mut ctx.accounts.funding_state;
    let current_slot = Clock::get()?.slot;
    
    // 1. Accrue global funding
    accrue_funding(funding_state, current_slot, oracle_price)?;
    
    // 2. Touch a window of accounts (budgeted work)
    let accounts_to_touch = 10;  // Budget per crank
    
    for i in 0..accounts_to_touch {
        let account_idx = (global_state.last_crank_cursor + i) % global_state.total_accounts;
        
        if let Some(account) = get_account_at_index(account_idx) {
            // Settle funding
            settle_funding_for_account(&mut account, funding_state)?;
            
            // Settle mark to oracle
            settle_mark_to_oracle(&mut account, oracle_price)?;
            
            // Accrue maintenance fees
            accrue_maintenance_fees(&mut account, current_slot, global_state.fee_per_slot);
            
            // Settle losses
            settle_losses(&mut account, global_state)?;
            
            // Convert warmable profits
            convert_profit_to_capital(
                &mut account,
                &mut account.warmup,
                calculate_haircut_ratio(
                    global_state.vault_balance,
                    global_state.capital_total,
                    global_state.insurance_fund,
                    global_state.pnl_positive_total,
                ),
                current_slot,
                global_state.warmup_period_slots,
            )?;
            
            // Sweep fee debt
            sweep_fee_debt(&mut account, global_state)?;
            
            // Check if liquidatable
            if is_liquidatable(&account, oracle_price, global_state) {
                liquidate_position(&mut account, global_state, oracle_price)?;
            }
        }
    }
    
    global_state.last_crank_cursor = (global_state.last_crank_cursor + accounts_to_touch)
        % global_state.total_accounts;
    
    Ok(())
}
```

**Key Property:** Crank makes progress on warmup conversion without requiring account owners to call user ops. This prevents abandoned accounts from permanently pinning `PNL_pos_tot` high.

## Conservation Proof

### Invariant

```
Withdrawable Value ≤ Vault Balance
```

### Proof Sketch

1. **Capital is senior:**
   ```
   Σ Capital_i = Capital_tot ≤ Vault
   ```

2. **Insurance is senior:**
   ```
   Capital_tot + Insurance ≤ Vault
   ```

3. **Profits are junior and haircutted:**
   ```
   Σ Effective_PnL_i ≤ h_num ≤ Residual
   where Residual = Vault - Capital_tot - Insurance
   ```

4. **Total withdrawable:**
   ```
   Σ (Capital_i + Effective_PnL_i) ≤ Capital_tot + Residual
                                    = Vault - Insurance
                                    ≤ Vault
   ```

**Rounding slack:** At most `K` units where `K` = number of accounts with positive PnL (due to floor division).

## Formal Verification

Percolator uses Kani for formal verification:

```bash
# Run Kani proofs
cargo kani

# Proofs cover:
# - Conservation (withdrawable ≤ vault)
# - Principal protection (no cross-account capital loss)
# - Isolation (account operations don't affect others)
# - No teleportation (value can't appear from nowhere)
```

**145 proofs** covering all critical invariants.

## Real-World Stress Testing

### Haircut System Test

```typescript
// From percolator-cli/scripts/stress-haircut-system.ts

async function stressHaircutSystem() {
  // 1. Create accounts with capital
  const user1 = await initUser(100_000_000);  // 0.1 SOL
  const user2 = await initUser(100_000_000);
  
  // 2. User1 goes long, User2 (LP) goes short
  await trade(user1, 10_000, lp);  // Long 10k units
  
  // 3. Price moves in User1's favor
  await pushOraclePrice(200);  // 2x price increase
  
  // 4. User2 becomes insolvent
  // Loss exceeds capital → write off
  
  // 5. Check haircut ratio
  const h = await getHaircutRatio();
  assert(h < 1, "System should be stressed");
  
  // 6. User1 tries to withdraw profit
  const warmable = await getWarmableAmount(user1);
  const converted = warmable * h;  // Haircutted
  
  // 7. Verify conservation
  const totalWithdrawable = await getTotalWithdrawable();
  const vaultBalance = await getVaultBalance();
  assert(totalWithdrawable <= vaultBalance, "Conservation violated");
}
```

### Worst-Case Scenario

```typescript
// Gap risk: price gaps beyond liquidation threshold

async function stressWorstCase() {
  // 1. Setup: User with 10x leverage
  await deposit(user, 10_000_000);
  await trade(user, 100_000, lp);  // 10x leverage
  
  // 2. Price gaps 15% (beyond 10% liquidation threshold)
  await pushOraclePrice(price * 1.15);
  
  // 3. Liquidation happens but loss > capital
  await keeperCrank();
  
  // 4. Insurance fund absorbs excess loss
  const insuranceBefore = await getInsuranceFund();
  await settleAccount(user);
  const insuranceAfter = await getInsuranceFund();
  
  assert(insuranceBefore > insuranceAfter, "Insurance should absorb loss");
  
  // 5. If insurance depleted, haircut ratio drops
  if (insuranceAfter == 0) {
    const h = await getHaircutRatio();
    assert(h < 1, "Haircut should apply");
  }
}
```

## Best Practices

1. **Maintain Insurance Buffer** - Size insurance fund for 99th percentile losses
2. **Conservative Margin Ratios** - MM < IM with sufficient buffer
3. **Frequent Cranks** - Run keeper bot continuously
4. **Oracle Redundancy** - Use multiple price feeds
5. **Formal Verification** - Prove critical invariants
6. **Stress Testing** - Test extreme scenarios
7. **Circuit Breakers** - Pause on oracle failures

## Common Pitfalls

1. **Insufficient Insurance** - System becomes insolvent
2. **No Warmup** - Oracle manipulation exploits
3. **Global Scans** - ADL doesn't scale
4. **Zombie Accounts** - Abandoned positions poison system
5. **Fee Bypass** - Crank-driven conversions skip fees
6. **Retroactive Funding** - Rate changes applied to past
7. **Rounding Exploits** - Precision loss creates value

## Exercises

1. Implement the haircut ratio system
2. Add warmup profit conversion
3. Build a keeper crank bot
4. Write conservation property tests
5. Stress test with extreme scenarios

## Source Attribution

This content is based on educational materials from:

- **Percolator**: [percolator/percolator](../../../percolator/percolator/)
  - `README.md` - Core concepts and motivation
  - `spec.md` - Complete technical specification
    - Section 3: Haircut ratio and solvency
    - Section 5-6: Warmup mechanism
    - Section 10: Keeper crank operations
  - `audit.md` - Security considerations
- **Percolator CLI**: [percolator/percolator-cli](../../../percolator/percolator-cli/)
  - `scripts/stress-haircut-system.ts` - Stress testing examples
  - `scripts/stress-worst-case.ts` - Extreme scenario testing
- **Tarun Chitra**: "Autodeleveraging: Impossibilities and Optimization", arXiv:2512.01112, 2025

## Next Steps

- [Security](../../security/README.md) - Audit your risk engine
- [Exercises](../exercises/README.md) - Build a complete risk system
- [Integration](../../integration/README.md) - Combine with other protocols

## Additional Resources

- [Kani Rust Verifier](https://model-checking.github.io/kani/)
- [Formal Methods in DeFi](https://arxiv.org/abs/2008.04248)
- [Risk Management in Crypto](https://www.risk.net/derivatives/7654321/risk-management-in-crypto-derivatives)
- [Percolator GitHub](https://github.com/aeyakovenko/percolator)
