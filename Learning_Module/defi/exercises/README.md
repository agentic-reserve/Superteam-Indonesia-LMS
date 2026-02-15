# DeFi Exercises

## Overview

These hands-on exercises will help you master DeFi concepts on Solana. Each exercise builds on the previous lessons and provides practical experience with token economics, AMMs, perpetual futures, and risk engines.

## Exercise Structure

Each exercise includes:
- **Objectives**: What you'll learn
- **Difficulty**: Beginner, Intermediate, or Advanced
- **Estimated Time**: How long it should take
- **Prerequisites**: Required knowledge
- **Validation Criteria**: How to verify your solution
- **Hints**: Guidance if you get stuck
- **Solution Reference**: Where to find example implementations

## Exercises

### Exercise 1: Token Vesting Contract

**Difficulty:** Beginner  
**Estimated Time:** 2-3 hours

**Objectives:**
- Implement linear vesting schedule
- Handle time-based token releases
- Secure vesting logic against exploits

**Requirements:**
1. Create a vesting program that locks tokens for a beneficiary
2. Implement linear vesting over a specified duration
3. Allow beneficiary to claim vested tokens
4. Prevent early withdrawal of unvested tokens
5. Support multiple vesting schedules per beneficiary

**Validation Criteria:**
- Tokens cannot be claimed before vesting starts
- Correct amount is vested at any point in time
- All tokens are claimable after vesting period ends
- Only beneficiary can claim tokens
- Vesting schedule cannot be modified after creation

**Hints:**
- Use `Clock::get()?.unix_timestamp` for time
- Store vesting start and end times
- Calculate vested amount: `(total * elapsed) / duration`
- Use PDAs for vesting account authority

**Solution Reference:**
- See [Token Economics](../01-token-economics/README.md) - Vesting section
- Example: `Learning_Module/defi/01-token-economics/README.md` (VestingAccount implementation)

---

### Exercise 2: Simple Token Swap

**Difficulty:** Beginner  
**Estimated Time:** 2-3 hours

**Objectives:**
- Build a basic token swap program
- Implement fixed-rate swaps
- Handle token transfers securely

**Requirements:**
1. Create a swap program that exchanges token A for token B at a fixed rate
2. Initialize swap pool with exchange rate
3. Allow users to swap in both directions
4. Charge a small fee (e.g., 0.3%)
5. Ensure atomic swaps (all-or-nothing)

**Validation Criteria:**
- Correct exchange rate applied
- Fees properly collected
- Token balances update correctly
- No tokens lost or created
- Slippage protection works

**Hints:**
- Use `token::transfer` for token movements
- Calculate output: `output = input * rate * (1 - fee)`
- Require minimum output amount for slippage protection
- Use PDAs for pool authority

**Solution Reference:**
- See [AMM Basics](../02-amm-basics/README.md) - Swap section
- Percolator CLI deposit/withdraw patterns: `percolator/percolator-cli/src/commands/`

---

### Exercise 3: Constant Product AMM

**Difficulty:** Intermediate  
**Estimated Time:** 4-6 hours

**Objectives:**
- Implement constant product formula (x * y = k)
- Build liquidity pool with LP tokens
- Handle add/remove liquidity operations

**Requirements:**
1. Create an AMM pool using constant product formula
2. Implement `add_liquidity` - mint LP tokens proportionally
3. Implement `remove_liquidity` - burn LP tokens, return assets
4. Implement `swap` - exchange tokens using x*y=k formula
5. Charge trading fees (e.g., 0.3%)
6. Distribute fees to LP token holders

**Validation Criteria:**
- Product k remains constant (minus fees)
- LP tokens represent proportional pool ownership
- Swaps calculate correct output amounts
- Fees accrue to liquidity providers
- No arbitrage opportunities due to rounding

**Hints:**
- Initial LP tokens: `sqrt(amount_a * amount_b)`
- Swap output: `Δy = (y * Δx) / (x + Δx)`
- Apply fee before swap calculation
- Use 128-bit math to prevent overflow

**Solution Reference:**
- See [AMM Basics](../02-amm-basics/README.md) - Complete AMM implementation
- Uniswap V2 core: https://github.com/Uniswap/v2-core

---

### Exercise 4: Margin Trading System

**Difficulty:** Intermediate  
**Estimated Time:** 4-6 hours

**Objectives:**
- Build a leveraged trading system
- Implement margin requirements
- Handle liquidations

**Requirements:**
1. Create a margin trading program with collateral accounts
2. Allow users to open leveraged positions (e.g., 5x)
3. Track unrealized PnL based on oracle price
4. Implement maintenance margin checks (e.g., 20%)
5. Allow liquidations when margin falls below threshold
6. Reward liquidators with a fee

**Validation Criteria:**
- Positions cannot exceed maximum leverage
- Margin requirements enforced on open/increase
- Liquidations trigger at correct threshold
- Liquidator receives reward
- No positions can go negative equity

**Hints:**
- Equity = collateral + unrealized_pnl
- Margin ratio = equity / position_value
- Liquidate when margin_ratio < maintenance_margin
- Use Pyth or Chainlink for price feeds

**Solution Reference:**
- See [Perpetual Futures](../03-perpetual-futures/README.md) - Margin section
- Percolator margin checks: `percolator/percolator/spec.md` Section 9

---

### Exercise 5: Funding Rate Mechanism

**Difficulty:** Advanced  
**Estimated Time:** 4-6 hours

**Objectives:**
- Implement perpetual futures funding rates
- Build time-based payment system
- Prevent funding rate manipulation

**Requirements:**
1. Create a funding rate system for perpetual contracts
2. Calculate funding rate based on price difference
3. Accrue funding payments over time
4. Settle funding when accounts are touched
5. Implement anti-retroactivity (rate changes don't apply to past)
6. Cap maximum funding rate

**Validation Criteria:**
- Funding rate reflects perp vs spot price difference
- Longs pay shorts when perp > spot (and vice versa)
- Funding accrues correctly over time
- Rate changes only affect future periods
- Maximum rate cap enforced

**Hints:**
- Store global funding index (cumulative)
- Per-account snapshot of last settled index
- Payment = position * (current_index - snapshot)
- Use event-segmented accrual for O(1) updates

**Solution Reference:**
- See [Perpetual Futures](../03-perpetual-futures/README.md) - Funding section
- Percolator funding: `percolator/percolator/spec.md` Section 7.1

---

### Exercise 6: Haircut Ratio System

**Difficulty:** Advanced  
**Estimated Time:** 6-8 hours

**Objectives:**
- Implement global haircut ratio for solvency
- Build principal protection mechanism
- Handle undercollateralization gracefully

**Requirements:**
1. Create a risk engine with senior/junior claims
2. Implement global haircut ratio: `h = min(Residual, PNL_pos) / PNL_pos`
3. Protect capital (senior claim) from other accounts' losses
4. Haircut profits (junior claim) when system stressed
5. Implement warmup for profit conversion
6. Build keeper crank for non-interactive progress

**Validation Criteria:**
- Capital is always fully backed
- Profits are haircutted proportionally when h < 1
- One account's loss doesn't reduce another's capital
- Warmup prevents immediate profit withdrawal
- Conservation: withdrawable ≤ vault balance
- Keeper crank makes progress on abandoned accounts

**Hints:**
- Residual = vault - capital_total - insurance
- Effective_PnL = floor(PnL * h_num / h_den)
- Warmup: slope = profit / warmup_period
- Crank touches accounts in batches

**Solution Reference:**
- See [Risk Engines](../04-risk-engines/README.md) - Complete implementation
- Percolator spec: `percolator/percolator/spec.md` Sections 3, 5, 6, 10
- Percolator stress tests: `percolator/percolator-cli/scripts/stress-*.ts`

---

### Exercise 7: Oracle Integration

**Difficulty:** Intermediate  
**Estimated Time:** 3-4 hours

**Objectives:**
- Integrate Pyth and Chainlink oracles
- Implement price feed validation
- Handle oracle failures gracefully

**Requirements:**
1. Create a program that reads Pyth price feeds
2. Add support for Chainlink price feeds
3. Validate price freshness (max age)
4. Implement fallback oracle logic
5. Add circuit breaker for extreme price moves

**Validation Criteria:**
- Prices are read correctly from both oracle types
- Stale prices are rejected
- Fallback oracle used when primary fails
- Circuit breaker triggers on >10% price move
- No division by zero or overflow errors

**Hints:**
- Pyth: Use `PriceUpdateV2` account
- Chainlink: Use `latest_round_data`
- Check timestamp against `Clock::get()?`
- Store last price for circuit breaker comparison

**Solution Reference:**
- See [Perpetual Futures](../03-perpetual-futures/README.md) - Oracle section
- Percolator oracle handling: `percolator/percolator-cli/README.md` Oracle Authority section

---

### Exercise 8: Liquidation Bot

**Difficulty:** Advanced  
**Estimated Time:** 4-6 hours

**Objectives:**
- Build an automated liquidation bot
- Monitor accounts for liquidation opportunities
- Execute liquidations profitably

**Requirements:**
1. Create a TypeScript bot that monitors trading accounts
2. Calculate margin ratios for all accounts
3. Identify liquidatable accounts (margin < maintenance)
4. Execute liquidation transactions
5. Track profitability (liquidation rewards vs gas costs)
6. Handle transaction failures gracefully

**Validation Criteria:**
- Bot correctly identifies liquidatable accounts
- Liquidations execute successfully
- Bot is profitable (rewards > costs)
- No false positives (liquidating healthy accounts)
- Handles RPC errors and retries

**Hints:**
- Poll accounts every 5-10 seconds
- Use `getProgramAccounts` with filters
- Calculate equity and margin ratio
- Submit liquidation transaction when margin < threshold
- Use priority fees for faster execution

**Solution Reference:**
- See [Risk Engines](../04-risk-engines/README.md) - Liquidation section
- Percolator keeper crank: `percolator/percolator-cli/src/commands/keeper-crank.ts`

---

### Exercise 9: Fee Distribution System

**Difficulty:** Intermediate  
**Estimated Time:** 3-4 hours

**Objectives:**
- Implement fee collection and distribution
- Build staking rewards mechanism
- Handle proportional payouts

**Requirements:**
1. Create a fee collection system for protocol revenue
2. Allow users to stake tokens to earn fees
3. Distribute fees proportionally to stakers
4. Implement claim mechanism for accrued fees
5. Support compounding (auto-restaking)

**Validation Criteria:**
- Fees are collected correctly from operations
- Distribution is proportional to stake
- Users can claim their share
- No fees lost due to rounding
- Compounding increases future rewards

**Hints:**
- Track total fees collected
- Store per-user stake amount
- User share = user_stake / total_stake
- Use checkpoint system for efficient distribution

**Solution Reference:**
- See [Token Economics](../01-token-economics/README.md) - Fee Distribution section
- Percolator insurance fund: `percolator/percolator/spec.md` Section 8

---

### Exercise 10: Multi-Asset Pool

**Difficulty:** Advanced  
**Estimated Time:** 6-8 hours

**Objectives:**
- Build a pool with 3+ assets
- Implement weighted constant product formula
- Handle complex swaps

**Requirements:**
1. Create a pool supporting 3+ tokens
2. Implement weighted constant product: `Π(x_i^w_i) = k`
3. Allow swaps between any two tokens in the pool
4. Support weighted liquidity provision
5. Calculate spot prices for all pairs

**Validation Criteria:**
- Invariant k remains constant
- Swaps work between all token pairs
- Weights sum to 100%
- LP tokens represent proportional ownership
- No arbitrage due to rounding

**Hints:**
- Use fixed-point math for weights
- Spot price: `p_i/p_j = (x_j/w_j) / (x_i/w_i)`
- Swap output: `Δy = y * (1 - (x/(x+Δx))^(w_x/w_y))`
- Validate weights sum to 10000 (100%)

**Solution Reference:**
- See [AMM Basics](../02-amm-basics/README.md) - Multi-Asset section
- Balancer whitepaper: https://balancer.fi/whitepaper.pdf

---

## Testing Your Solutions

### Unit Tests

Write unit tests for each function:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_vesting_calculation() {
        let total = 1000;
        let start = 0;
        let end = 100;
        let current = 50;
        
        let vested = calculate_vested(total, start, end, current);
        assert_eq!(vested, 500);
    }
}
```

### Integration Tests

Test complete workflows:

```typescript
describe("AMM Pool", () => {
  it("should swap tokens correctly", async () => {
    // Add liquidity
    await addLiquidity(100, 100);
    
    // Swap
    const output = await swap(10);
    
    // Verify output
    expect(output).to.be.closeTo(9, 0.1);
  });
});
```

### Property-Based Tests

Test invariants hold across many inputs:

```rust
#[test]
fn test_conservation_property() {
    // For any valid swap, vault balance should not decrease
    for _ in 0..1000 {
        let amount_in = rand::random::<u64>() % 1000;
        let vault_before = get_vault_balance();
        
        swap(amount_in);
        
        let vault_after = get_vault_balance();
        assert!(vault_after >= vault_before);
    }
}
```

## Submission Guidelines

For each exercise, submit:

1. **Source Code**: Complete program implementation
2. **Tests**: Unit and integration tests
3. **Documentation**: README explaining your approach
4. **Deployment**: Devnet deployment instructions

## Getting Help

If you're stuck:

1. Review the relevant lesson material
2. Check the solution references
3. Look at the hints provided
4. Study the source code from Percolator and other projects
5. Ask in the Solana Discord or Stack Exchange

## Next Steps

After completing these exercises:

- Build a complete DeFi protocol combining multiple concepts
- Audit existing DeFi protocols for vulnerabilities
- Contribute to open-source DeFi projects
- Explore [Integration Projects](../../integration/README.md)

## Additional Resources

- [Anchor Testing Guide](https://book.anchor-lang.com/anchor_in_depth/testing.html)
- [Solana Cookbook - Testing](https://solanacookbook.com/references/programs.html#how-to-test-programs)
- [Percolator Test Suite](https://github.com/aeyakovenko/percolator/tree/main/tests)
- [DeFi Security Best Practices](../../security/README.md)
