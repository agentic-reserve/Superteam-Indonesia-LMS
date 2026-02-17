# Multiply Vaults

Multiply Vaults enable one-click leveraged yield strategies on Kamino Finance. Use flash loans to amplify exposure to yield-bearing assets like LSTs and JLP, with up to 10x leverage on correlated assets.

## Table of Contents

- [Overview](#overview)
- [How Multiply Works](#how-multiply-works)
- [Supported Strategies](#supported-strategies)
- [Opening Positions](#opening-positions)
- [Managing Positions](#managing-positions)
- [Unwinding Positions](#unwinding-positions)
- [Risk Management](#risk-management)
- [Net APY Calculation](#net-apy-calculation)
- [Examples](#examples)
- [Best Practices](#best-practices)

---

## Overview

Multiply Vaults allow you to leverage exposure to yield-bearing assets without manual looping.

### What is Leveraged Yield?

**Standard Staking**:
```
Deposit: 10 SOL
Stake: 10 mSOL
Yield: 7% APY on 10 SOL = 0.7 SOL/year
```

**Leveraged Staking (5x)**:
```
Deposit: 10 SOL
Leverage: 5x
Exposure: 50 mSOL
Yield: 7% APY on 50 SOL = 3.5 SOL/year
Borrow Cost: 4% APR on 40 SOL = 1.6 SOL/year
Net Yield: 1.9 SOL/year (19% Net APY)
```

### Key Features

- **One-Click**: Open leveraged positions instantly
- **Flash Loans**: No manual looping required
- **High Leverage**: Up to 10x on correlated assets
- **Auto-Management**: Automated position monitoring
- **Flexible**: Adjust leverage anytime

### How It's Different

| Feature | Manual Looping | Multiply Vaults |
|---------|---------------|-----------------|
| **Setup** | Multiple transactions | One click |
| **Leverage** | Limited by gas | Up to 10x |
| **Management** | Manual monitoring | Automated |
| **Unwinding** | Complex | One click |
| **Gas Costs** | High (many txs) | Low (single tx) |

---

## How Multiply Works

### The Mechanism

1. **Flash Loan**: Borrow assets instantly (no collateral)
2. **Swap**: Convert to target asset
3. **Supply**: Deposit as collateral
4. **Borrow**: Take loan against collateral
5. **Repay**: Repay flash loan
6. **Result**: Leveraged position

### Visual Flow

```
User Deposits 10 SOL
    ↓
Flash Loan 40 SOL (from Kamino)
    ↓
Total: 50 SOL
    ↓
Swap 50 SOL → 50 mSOL
    ↓
Supply 50 mSOL as collateral
    ↓
Borrow 40 SOL (against mSOL)
    ↓
Repay Flash Loan 40 SOL
    ↓
Result: 50 mSOL exposure with 10 SOL capital (5x leverage)
```

### Why Flash Loans?

- **No Capital Required**: Borrow without collateral
- **Atomic**: All happens in one transaction
- **Efficient**: No manual looping
- **Safe**: Reverts if any step fails

---

## Supported Strategies

### 1. SOL Multiply

Leverage exposure to liquid staking tokens (LSTs).

**Assets**:
- mSOL (Marinade)
- JitoSOL (Jito)
- bSOL (BlazeStake)
- INF (Infinity)

**Max Leverage**: Up to 10x (with eMode)

**Use Case**: Amplify staking rewards

**Example**:
```
Deposit: 10 SOL
Leverage: 5x
Exposure: 50 mSOL
Staking APY: 7%
Borrow APR: 4%
Net APY: ~15%
```

### 2. JLP Multiply

Leverage exposure to Jupiter LP token (market making).

**Asset**: JLP (Jupiter Perpetuals LP)

**Max Leverage**: Up to 5x

**Use Case**: Amplify trading fees + funding rates

**Example**:
```
Deposit: $10,000
Leverage: 3x
Exposure: $30,000 JLP
JLP APY: 50%
Borrow APR: 8%
Net APY: ~120%
```

### 3. kToken Multiply

Leverage CLMM liquidity positions.

**Assets**: Various kTokens (SOL-USDC, etc.)

**Max Leverage**: Varies by pair

**Use Case**: Amplify LP fees

---

## Opening Positions

### Step-by-Step

1. **Choose Strategy**: Select SOL or JLP Multiply
2. **Select Asset**: Pick LST (mSOL, JitoSOL, etc.)
3. **Set Leverage**: Choose leverage multiplier (1-10x)
4. **Review Metrics**:
   - Net APY
   - Liquidation price
   - Position value
5. **Confirm**: Execute transaction

### Leverage Selection

**Conservative (2-3x)**:
- Lower risk
- Safer liquidation price
- Lower returns

**Moderate (4-6x)**:
- Balanced risk/reward
- Reasonable liquidation buffer
- Good returns

**Aggressive (7-10x)**:
- High risk
- Close liquidation price
- Maximum returns

### Example: Opening SOL Multiply

```typescript
// Using Kamino SDK
import { KaminoMultiply } from '@kamino-finance/multiply-sdk';

const multiply = new KaminoMultiply(connection);

// Open 5x mSOL position
const position = await multiply.openPosition({
  owner: userPublicKey,
  depositAmount: 10_000_000_000, // 10 SOL
  targetAsset: 'mSOL',
  leverage: 5,
  slippage: 0.01, // 1%
});

console.log('Position opened:', position.publicKey);
console.log('Exposure:', position.exposure); // ~50 mSOL
console.log('Debt:', position.debt); // ~40 SOL
console.log('Net APY:', position.netApy); // e.g., 15%
```

---

## Managing Positions

### Key Metrics

**Net APY**:
```
Net APY = (Yield APY × Leverage) - (Borrow APR × (Leverage - 1))
```

**Example**:
```
Yield APY: 7%
Borrow APR: 4%
Leverage: 5x

Net APY = (7% × 5) - (4% × 4) = 35% - 16% = 19%
```

**LTV Ratio**:
```
LTV = Debt Value / Collateral Value
```

**Liquidation Price**:
```
Liquidation Price = Entry Price × (1 - (Liquidation Threshold - LTV) / Leverage)
```

### Monitoring

**Dashboard Metrics**:
- Current Net APY
- Position value
- Debt value
- LTV ratio
- Liquidation price
- Health factor

**Alerts**:
- Set price alerts
- Monitor health factor
- Track Net APY changes

### Adjusting Leverage

**Increase Leverage**:
```typescript
await multiply.increaseLeverage({
  position: positionPublicKey,
  newLeverage: 7, // Increase from 5x to 7x
});
```

**Decrease Leverage**:
```typescript
await multiply.decreaseLeverage({
  position: positionPublicKey,
  newLeverage: 3, // Decrease from 5x to 3x
});
```

**Add Collateral**:
```typescript
await multiply.addCollateral({
  position: positionPublicKey,
  amount: 5_000_000_000, // Add 5 SOL
});
```

---

## Unwinding Positions

### Full Unwind

Close entire position and receive proceeds.

```typescript
await multiply.closePosition({
  position: positionPublicKey,
  slippage: 0.01,
});
```

**Process**:
1. Sell collateral
2. Repay debt
3. Return remaining to user

### Partial Unwind

Reduce position size while keeping it open.

```typescript
await multiply.partialUnwind({
  position: positionPublicKey,
  percentage: 50, // Unwind 50% of position
});
```

### SOL vs JLP Unwinding

**SOL Multiply**:
- Swap mSOL → SOL
- Repay SOL debt
- Return remaining SOL

**JLP Multiply**:
- Redeem JLP → USDC/SOL
- Repay debt
- Return remaining assets

### Example: Closing Position

```typescript
// Get position details
const position = await multiply.getPosition(positionPublicKey);
console.log('Current Value:', position.value);
console.log('Debt:', position.debt);
console.log('Profit/Loss:', position.pnl);

// Close position
const tx = await multiply.closePosition({
  position: positionPublicKey,
  slippage: 0.01,
});

console.log('Position closed');
console.log('Received:', tx.amountReceived);
console.log('PnL:', tx.pnl);
```

---

## Risk Management

### Liquidation Risk

**When Liquidation Occurs**:
```
Current LTV ≥ Liquidation Threshold
```

**Example**:
```
Entry: mSOL = $200
Leverage: 5x
Liquidation Threshold: 93%
Liquidation Price: mSOL = $172 (-14%)
```

### Managing Risk

**1. Choose Appropriate Leverage**:
- Higher leverage = closer liquidation price
- Lower leverage = safer position

**2. Monitor Health Factor**:
```
Health Factor = (Collateral × Liq Threshold) / Debt
```
- > 1.2: Safe
- 1.1-1.2: Caution
- < 1.1: Danger

**3. Set Stop-Loss**:
- Define maximum acceptable loss
- Close position if reached
- Automate with bots

**4. Diversify**:
- Don't put all capital in one position
- Use different strategies
- Spread across assets

### Risk Scenarios

**Scenario 1: Price Drop**:
```
Entry: mSOL = $200
Current: mSOL = $180 (-10%)
Leverage: 5x
Position Loss: -50%
Action: Add collateral or reduce leverage
```

**Scenario 2: Rate Change**:
```
Initial Net APY: 15%
Borrow APR increases: 4% → 8%
New Net APY: 7%
Action: Consider closing if not profitable
```

**Scenario 3: Depeg**:
```
mSOL depegs from SOL
mSOL/SOL: 1.0 → 0.95
Leverage: 5x
Impact: Significant loss
Action: Close position immediately
```

---

## Net APY Calculation

### Formula

```
Net APY = (Yield APY × Leverage) - (Borrow APR × (Leverage - 1)) - Fees
```

### Components

**Yield APY**:
- Staking rewards (for LSTs)
- Trading fees + funding (for JLP)
- LP fees (for kTokens)

**Borrow APR**:
- Interest on borrowed assets
- Varies with utilization

**Fees**:
- Swap fees (entry/exit)
- Protocol fees
- Gas costs

### Example Calculations

**Conservative (3x)**:
```
Yield APY: 7%
Borrow APR: 4%
Leverage: 3x

Net APY = (7% × 3) - (4% × 2) = 21% - 8% = 13%
```

**Moderate (5x)**:
```
Yield APY: 7%
Borrow APR: 4%
Leverage: 5x

Net APY = (7% × 5) - (4% × 4) = 35% - 16% = 19%
```

**Aggressive (10x)**:
```
Yield APY: 7%
Borrow APR: 4%
Leverage: 10x

Net APY = (7% × 10) - (4% × 9) = 70% - 36% = 34%
```

### When Net APY is Negative

If Borrow APR > Yield APY:
```
Yield APY: 5%
Borrow APR: 8%
Leverage: 5x

Net APY = (5% × 5) - (8% × 4) = 25% - 32% = -7%
```

**Action**: Close position or reduce leverage

---

## Examples

### Example 1: Conservative mSOL Position

```typescript
// Setup
Deposit: 10 SOL ($2000)
Asset: mSOL
Leverage: 3x
Staking APY: 7%
Borrow APR: 4%

// Position
Collateral: 30 mSOL ($6000)
Debt: 20 SOL ($4000)
LTV: 66.7%
Liquidation Price: $133 (-33%)

// Returns
Staking Yield: 7% × $6000 = $420/year
Borrow Cost: 4% × $4000 = $160/year
Net Yield: $260/year
Net APY: 13%

// Risk: Low (liquidation at -33%)
```

### Example 2: Aggressive JLP Position

```typescript
// Setup
Deposit: $10,000
Asset: JLP
Leverage: 5x
JLP APY: 50%
Borrow APR: 8%

// Position
Collateral: $50,000 JLP
Debt: $40,000
LTV: 80%
Liquidation Price: -16% from entry

// Returns
JLP Yield: 50% × $50,000 = $25,000/year
Borrow Cost: 8% × $40,000 = $3,200/year
Net Yield: $21,800/year
Net APY: 218%

// Risk: High (liquidation at -16%)
```

### Example 3: Adjusting Position

```typescript
// Initial Position
Deposit: 10 SOL
Leverage: 5x
mSOL Price: $200
Liquidation: $172

// mSOL drops to $180
Current LTV: 78%
Health Factor: 1.19
Status: ⚠️ At risk

// Action: Add 5 SOL collateral
New Collateral: 57.5 mSOL
New LTV: 69.6%
New Health Factor: 1.34
New Liquidation: $154
Status: ✅ Safe
```

---

## Best Practices

### Opening Positions

✅ **Do**:
- Start with lower leverage (2-3x)
- Understand liquidation price
- Check Net APY is positive
- Have exit strategy
- Monitor market conditions

❌ **Don't**:
- Max out leverage immediately
- Ignore liquidation risk
- Open during high volatility
- Use all your capital
- Forget about borrow costs

### Managing Positions

✅ **Do**:
- Check position daily
- Set price alerts
- Monitor Net APY
- Adjust leverage as needed
- Keep extra capital ready

❌ **Don't**:
- Ignore health factor
- Let positions run unmonitored
- Panic during small dips
- Over-leverage
- Forget about rate changes

### Closing Positions

✅ **Do**:
- Close if Net APY turns negative
- Take profits at targets
- Close during high volatility
- Consider partial unwinds
- Account for slippage

❌ **Don't**:
- Hold losing positions hoping for recovery
- Close during liquidation cascade
- Ignore exit costs
- Wait until liquidation
- Forget about taxes

---

## Summary

Multiply Vaults offer:

✅ **One-Click Leverage**: Easy position management
✅ **High Capital Efficiency**: Up to 10x leverage
✅ **Automated**: Flash loan-based execution
✅ **Flexible**: Adjust anytime
✅ **Transparent**: Clear metrics and risks

**Key Takeaways**:
- Leverage amplifies both gains and losses
- Net APY must be positive to profit
- Monitor health factor to avoid liquidation
- Start conservative, increase gradually
- Have exit strategy before entering

**Risk Warning**: Leveraged positions can be liquidated quickly during market volatility. Only use capital you can afford to lose.

---

## Next Steps

- Study [Risk Management](./risk-management.md) for advanced strategies
- Learn about [Liquidity Vaults](./liquidity-vaults.md) for kTokens
- Try the [Multiply Exercise](../exercises/multiply-strategy.md)
- Monitor positions on [Kamino App](https://app.kamino.finance/)

---

**Source**: [Kamino Finance Documentation](https://docs.kamino.finance/)
**Last Updated**: February 17, 2026
