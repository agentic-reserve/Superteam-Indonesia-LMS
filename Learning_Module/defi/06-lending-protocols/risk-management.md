# Risk Management

Kamino Finance employs a comprehensive risk management framework to protect users and maintain protocol solvency. This guide covers oracle systems, liquidation mechanics, and risk assessment tools.

## Table of Contents

- [Overview](#overview)
- [Oracle Systems](#oracle-systems)
- [LST Oracles](#lst-oracles)
- [Liquidation Mechanics](#liquidation-mechanics)
- [Auto-Deleverage](#auto-deleverage)
- [Risk Assessment](#risk-assessment)
- [Risk Dashboard](#risk-dashboard)
- [Best Practices](#best-practices)

---

## Overview

Kamino's risk framework includes:

- **Multi-Price Oracles**: Aggregated price feeds
- **LST-Specific Oracles**: Depeg protection
- **Dynamic Liquidations**: Efficient liquidator incentives
- **Auto-Deleverage**: Automatic risk reduction
- **Daily Caps**: Borrow/supply limits
- **Insurance Fund**: Bad debt coverage

---

## Oracle Systems

### Multi-Price Oracle

Kamino aggregates multiple price sources for accuracy and security.

**Sources**:
- Pyth Network (primary)
- Chainlink (secondary)
- TWAP (Time-Weighted Average Price)
- EWMA (Exponentially Weighted Moving Average)

**How It Works**:
```
Final Price = Median(Pyth, Chainlink, TWAP, EWMA)
```

**Benefits**:
- Manipulation resistant
- Redundancy (if one fails)
- Smoothed prices (reduces volatility)
- Self-healing properties

### Price Bands

For stablecoins, Kamino uses price bands:

```
USDC Price Band: $0.95 - $1.05
```

**If price outside band**:
- Triggers safety mechanisms
- Limits new borrows
- Protects protocol

### TWAP/EWMA Protection

**TWAP** (Time-Weighted Average):
```
TWAP = Average price over time period
```

**EWMA** (Exponentially Weighted):
```
EWMA = Recent prices weighted more heavily
```

**Use Case**: Prevents flash loan price manipulation

**Example**:
```
Spot Price: $100 (manipulated)
TWAP: $95 (actual average)
EWMA: $96 (recent average)
Used Price: $95 (median of all sources)
```

---

## LST Oracles

### The Depeg Problem

LSTs can temporarily depeg from their underlying asset:

```
Normal: 1 mSOL = 1 SOL
Depegged: 1 mSOL = 0.95 SOL (market price)
```

**Risk**: Using market price could trigger unnecessary liquidations

### Stake Rate Pricing

Kamino uses **theoretical price** based on stake rate:

```
LST Price = Underlying Price × Stake Rate
```

**Example**:
```
SOL Price: $200
mSOL Stake Rate: 1.05 (1 mSOL = 1.05 SOL)
mSOL Oracle Price: $200 × 1.05 = $210

Even if market price is $190 (depegged)
```

### Why This Works

**Assumption**: Arbitrage will restore peg

**Logic**:
1. mSOL depegs to $190 (should be $210)
2. Arbitrageurs buy cheap mSOL
3. Redeem for SOL at stake rate
4. Profit: $210 - $190 = $20
5. Peg restored through arbitrage

**Protection**: Prevents panic liquidations during temporary depegs

### Supported LSTs

- mSOL (Marinade)
- JitoSOL (Jito)
- bSOL (BlazeStake)
- INF (Infinity)

---

## Liquidation Mechanics

### When Liquidation Occurs

```
Current LTV ≥ Liquidation Threshold
```

**Example**:
```
Max LTV: 75%
Liquidation Threshold: 80%
Current LTV: 81%
Result: Liquidation triggered
```

### Dynamic Liquidation Bonus

Liquidation bonus adjusts based on position size:

**Small Positions**: 2% bonus
**Medium Positions**: 5% bonus
**Large Positions**: 10% bonus

**Why Dynamic?**:
- Incentivizes efficient liquidators
- Reduces impact on borrowers
- Improves capital efficiency

### Partial Liquidations

Kamino liquidates only enough to restore health:

```
// Before
Collateral: $10,000
Debt: $8,100
LTV: 81% (above 80% threshold)

// After Partial Liquidation
Collateral: $9,500
Debt: $7,600
LTV: 80% (at threshold)

// Only $500 collateral liquidated (not entire position)
```

### Liquidation Process

1. **Detection**: Bot detects unhealthy position
2. **Repayment**: Liquidator repays debt
3. **Collateral**: Liquidator receives collateral + bonus
4. **Partial**: Only enough to restore health
5. **User**: Keeps remaining position

### Example

```typescript
// Position before liquidation
Collateral: 50 mSOL ($10,000)
Debt: 40 SOL ($8,100)
LTV: 81%
Health Factor: 0.99

// Liquidator action
Repays: 5 SOL ($1,012.50)
Receives: 5.25 mSOL ($1,062.50)
Bonus: $50 (5%)

// Position after liquidation
Collateral: 44.75 mSOL ($8,937.50)
Debt: 35 SOL ($7,087.50)
LTV: 79.3%
Health Factor: 1.01
```

---

## Auto-Deleverage

### What is Auto-Deleverage?

Automatic reduction of leverage when position becomes risky.

**Trigger Conditions**:
- Health factor < 1.05
- Rapid price movement
- High volatility

**Action**:
- Automatically sells collateral
- Repays debt
- Reduces leverage
- Prevents liquidation

### How It Works

```typescript
// Position at risk
Health Factor: 1.03
Leverage: 5x

// Auto-deleverage triggers
Sells: 20% of collateral
Repays: Corresponding debt
New Leverage: 4x
New Health Factor: 1.15
```

### Benefits

✅ **Prevents Liquidation**: Acts before liquidation threshold
✅ **Saves Fees**: Avoids liquidation bonus
✅ **Automatic**: No user action needed
✅ **Configurable**: Can be enabled/disabled

### Configuration

```typescript
await multiply.setAutoDeleverage({
  position: positionPublicKey,
  enabled: true,
  triggerHealthFactor: 1.05,
  targetHealthFactor: 1.15,
});
```

---

## Risk Assessment

### Position Risk Metrics

**1. Health Factor**:
```
Health Factor = (Collateral × Liq Threshold) / Debt
```
- \> 1.5: Very Safe
- 1.2-1.5: Safe
- 1.1-1.2: Caution
- 1.0-1.1: Danger
- < 1.0: Liquidation

**2. LTV Ratio**:
```
LTV = Debt / Collateral
```
- < 50%: Very Safe
- 50-70%: Safe
- 70-80%: Moderate Risk
- 80-90%: High Risk
- \> 90%: Extreme Risk

**3. Liquidation Distance**:
```
Distance = (Current Price - Liquidation Price) / Current Price
```
- \> 30%: Very Safe
- 20-30%: Safe
- 10-20%: Moderate Risk
- 5-10%: High Risk
- < 5%: Extreme Risk

### Market Risk Factors

**Volatility**:
- High volatility = higher liquidation risk
- Monitor VIX or similar metrics
- Reduce leverage during volatility

**Liquidity**:
- Low liquidity = harder to exit
- Check DEX liquidity depth
- Avoid illiquid assets

**Correlation**:
- Correlated assets = safer for eMode
- Uncorrelated = higher risk
- Monitor correlation metrics

### Protocol Risk

**Smart Contract Risk**:
- Audited by Certora, Offside Labs
- Bug bounty program
- Time-tested code

**Oracle Risk**:
- Multi-source oracles
- TWAP/EWMA protection
- Price band safeguards

**Liquidity Risk**:
- Interest rate adjustments
- Utilization monitoring
- Reserve requirements

---

## Risk Dashboard

### Accessing the Dashboard

Visit: [risk.kamino.finance](https://risk.kamino.finance/)

### Key Metrics

**1. Reserve Health**:
- Utilization rate
- Available liquidity
- Borrow/supply APY

**2. Oracle Status**:
- Price sources
- Last update time
- Deviation metrics

**3. Liquidation Queue**:
- At-risk positions
- Total liquidation value
- Average health factor

**4. Protocol Metrics**:
- Total Value Locked (TVL)
- Total Borrowed
- Insurance Fund size
- Bad debt (if any)

### Using the Dashboard

```typescript
// Example: Monitoring your position
1. Connect wallet
2. View "My Positions"
3. Check health factor
4. Review liquidation price
5. Monitor Net APY
6. Set alerts
```

### Alerts

Set alerts for:
- Health factor < 1.2
- Price approaching liquidation
- Net APY turns negative
- High volatility events

---

## Best Practices

### Risk Management Checklist

✅ **Before Opening Position**:
- [ ] Check current market volatility
- [ ] Verify oracle prices
- [ ] Calculate liquidation price
- [ ] Ensure positive Net APY
- [ ] Have exit strategy

✅ **While Position Open**:
- [ ] Monitor health factor daily
- [ ] Check Net APY weekly
- [ ] Review liquidation distance
- [ ] Keep extra capital ready
- [ ] Set price alerts

✅ **Risk Mitigation**:
- [ ] Start with low leverage
- [ ] Diversify across assets
- [ ] Use stop-loss strategies
- [ ] Enable auto-deleverage
- [ ] Maintain buffer capital

### Position Sizing

**Conservative Portfolio**:
```
Total Capital: $10,000
Per Position: $2,000 (20%)
Max Leverage: 3x
Risk per Position: 6% of portfolio
```

**Aggressive Portfolio**:
```
Total Capital: $10,000
Per Position: $5,000 (50%)
Max Leverage: 5x
Risk per Position: 25% of portfolio
```

### Emergency Procedures

**If Health Factor < 1.1**:
1. Add collateral immediately
2. Or reduce leverage
3. Or close position
4. Don't wait for liquidation

**If Net APY Negative**:
1. Review borrow rates
2. Consider closing
3. Or reduce leverage
4. Monitor for improvement

**If Market Crash**:
1. Reduce leverage across all positions
2. Add collateral to risky positions
3. Close highest-risk positions
4. Wait for stability

---

## Summary

Kamino's risk framework provides:

✅ **Robust Oracles**: Multi-source, manipulation-resistant
✅ **LST Protection**: Depeg-resistant pricing
✅ **Dynamic Liquidations**: Efficient and fair
✅ **Auto-Deleverage**: Automatic risk reduction
✅ **Transparency**: Live risk dashboard
✅ **Insurance**: Bad debt coverage

**Key Takeaways**:
- Monitor health factor regularly
- Use risk dashboard for insights
- Enable auto-deleverage for safety
- Understand liquidation mechanics
- Maintain appropriate position sizing

---

## Next Steps

- Explore [Liquidity Vaults](./liquidity-vaults.md) for kTokens
- Try the [Risk Management Exercise](../exercises/kamino-lending.md)
- Monitor positions on [Risk Dashboard](https://risk.kamino.finance/)
- Review [Kamino Audits](https://docs.kamino.finance/kamino-lend/audits)

---

**Source**: [Kamino Finance Documentation](https://docs.kamino.finance/)
**Last Updated**: February 17, 2026
