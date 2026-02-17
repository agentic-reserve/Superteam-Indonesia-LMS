# Kamino Lend (K-Lend)

Kamino Lend is the core lending and borrowing protocol of Kamino Finance, featuring a unified liquidity market design with advanced features like Elevation Mode, kTokens as collateral, and sophisticated risk management.

## Table of Contents

- [Overview](#overview)
- [Core Concepts](#core-concepts)
- [Unified Liquidity Market](#unified-liquidity-market)
- [Elevation Mode (eMode)](#elevation-mode-emode)
- [kTokens as Collateral](#ktokens-as-collateral)
- [Asset Tiers](#asset-tiers)
- [Borrow Factors](#borrow-factors)
- [Protected Collateral](#protected-collateral)
- [Interest Rate Model](#interest-rate-model)
- [Supplying Assets](#supplying-assets)
- [Borrowing Assets](#borrowing-assets)
- [Position Management](#position-management)
- [Liquidations](#liquidations)
- [Fees](#fees)
- [SDK Integration](#sdk-integration)
- [Best Practices](#best-practices)

---

## Overview

Kamino Lend is a peer-to-pool lending protocol where:
- **Lenders** supply assets to earn interest
- **Borrowers** take loans against collateral
- **Liquidators** maintain protocol solvency

**Key Features**:
- Unified Liquidity Market (single pool design)
- Elevation Mode for high leverage
- kTokens (CLMM LP positions) as collateral
- Poly-linear interest rate curves
- Comprehensive risk management

**Why K-Lend?**
- Largest lending protocol on Solana
- Capital efficient (higher leverage options)
- Innovative collateral types (kTokens)
- Robust risk framework
- Production-tested at scale

---

## Core Concepts

### Overcollateralized Lending

All loans on K-Lend are overcollateralized:

```
Collateral Value > Loan Value
```

**Example**:
- Deposit: $150 of SOL
- Borrow: $100 of USDC
- Collateralization Ratio: 150%

### Loan-to-Value (LTV) Ratio

Maximum borrowing capacity relative to collateral:

```
LTV = (Loan Value / Collateral Value) × 100%
```

**Example**:
- Collateral: $1000 SOL
- Max LTV: 75%
- Max Borrow: $750

### Liquidation Threshold

The LTV at which liquidation occurs:

```
Liquidation Threshold > Max LTV
```

**Example**:
- Max LTV: 75%
- Liquidation Threshold: 80%
- Safety Buffer: 5%

---

## Unified Liquidity Market

K-Lend uses a **single pool design** where all assets share liquidity.

### How It Works

**Traditional Isolated Markets**:
```
SOL Pool → SOL Borrowers
USDC Pool → USDC Borrowers
```

**Unified Market**:
```
All Assets → Shared Liquidity Pool → All Borrowers
```

### Benefits

1. **Capital Efficiency**: Assets can be borrowed against any collateral
2. **Better Rates**: Deeper liquidity improves interest rates
3. **Flexibility**: Users can mix and match assets
4. **Simplicity**: Single market to understand

### Example

```typescript
// User can supply SOL and borrow USDC
Supply: 10 SOL
Borrow: 5000 USDC

// Or supply USDC and borrow SOL
Supply: 10000 USDC
Borrow: 50 SOL

// Or mix multiple assets
Supply: 5 SOL + 5000 USDC
Borrow: 2 SOL + 2000 USDC
```

---

## Elevation Mode (eMode)

Elevation Mode enables **higher leverage for correlated assets**.

### What is eMode?

eMode groups correlated assets together with relaxed risk parameters:

**Standard Mode**:
- SOL collateral → Borrow USDC
- Max LTV: 75%
- Max Leverage: ~4x

**Elevation Mode (SOL/LST)**:
- SOL collateral → Borrow mSOL
- Max LTV: 90%
- Max Leverage: ~10x

### eMode Categories

**1. SOL/LST Group**:
- Assets: SOL, mSOL, JitoSOL, bSOL, INF
- Max LTV: 90%
- Liquidation Threshold: 93%
- Use Case: Leveraged staking

**2. Stablecoin Group**:
- Assets: USDC, USDT, UXD, USDH
- Max LTV: 90%
- Liquidation Threshold: 95%
- Use Case: Stable-to-stable leverage

**3. JLP Group**:
- Assets: JLP, SOL, USDC
- Max LTV: 85%
- Liquidation Threshold: 90%
- Use Case: Leveraged market making

### When to Use eMode

✅ **Use eMode when**:
- Borrowing correlated assets
- Seeking maximum leverage
- Assets move together (low depeg risk)
- You understand the risks

❌ **Avoid eMode when**:
- Borrowing uncorrelated assets
- New to lending protocols
- Uncertain about liquidation risk
- Market is highly volatile

### eMode Example

```typescript
// Without eMode
Collateral: 10 SOL ($2000)
Max Borrow (75% LTV): $1500 USDC
Leverage: ~4x

// With eMode (SOL/LST)
Collateral: 10 SOL ($2000)
Max Borrow (90% LTV): 9 mSOL ($1800)
Leverage: ~10x

// Result: Higher capital efficiency for correlated assets
```

---

## kTokens as Collateral

K-Lend accepts **kTokens** (Kamino CLMM LP positions) as collateral.

### What are kTokens?

kTokens are fungible representations of concentrated liquidity positions:

```
CLMM Position → kToken → Collateral
```

**Benefits**:
- Earn LP fees while using as collateral
- Fungible (can be transferred/traded)
- Auto-compounding
- Capital efficient

### How It Works

1. **Provide Liquidity**: Deposit to Kamino Liquidity Vault
2. **Receive kTokens**: Get fungible LP tokens
3. **Use as Collateral**: Supply kTokens to K-Lend
4. **Borrow**: Take loans against kToken value
5. **Earn**: Continue earning LP fees + lending yield

### Example

```typescript
// Step 1: Provide liquidity
Deposit: 1 SOL + 200 USDC
Receive: 1000 kSOL-USDC tokens

// Step 2: Use as collateral
Supply to K-Lend: 1000 kSOL-USDC
Collateral Value: $400 (LP position value)

// Step 3: Borrow
Max Borrow (75% LTV): $300 USDC

// Result: Earning LP fees + lending yield + borrowed capital
```

### kToken Advantages

1. **Double Yield**: LP fees + lending interest
2. **Capital Efficiency**: Use productive assets as collateral
3. **Flexibility**: Withdraw anytime (if not borrowed against)
4. **Composability**: Use in multiple DeFi protocols

---

## Asset Tiers

K-Lend categorizes assets into tiers based on risk:

### Tier 1: General Assets

**Characteristics**:
- Can be used as collateral
- Can be borrowed
- Full functionality

**Examples**: SOL, USDC, mSOL, JitoSOL

**Use Case**: Standard lending/borrowing

### Tier 2: Isolated Collateral

**Characteristics**:
- Can ONLY be used as collateral
- Cannot be borrowed
- Isolated from other positions

**Examples**: Newer LSTs, volatile tokens

**Use Case**: Collateral-only assets

### Tier 3: Isolated Debt

**Characteristics**:
- Can ONLY be borrowed
- Cannot be used as collateral
- Isolated from other positions

**Examples**: Highly volatile or low-liquidity tokens

**Use Case**: Borrow-only assets

### Cross vs Isolated Mode

**Cross Mode**:
- All positions share collateral
- More capital efficient
- Higher risk (one bad position affects all)

**Isolated Mode**:
- Each position is separate
- Lower capital efficiency
- Lower risk (positions don't affect each other)

### Example

```typescript
// Cross Mode
Collateral: 10 SOL + 5000 USDC
Borrow: 3 SOL + 2000 USDC
// All collateral backs all debt

// Isolated Mode
Position 1:
  Collateral: 10 SOL
  Borrow: 3 SOL
  
Position 2:
  Collateral: 5000 USDC
  Borrow: 2000 USDC
// Positions are independent
```

---

## Borrow Factors

Borrow Factors adjust borrowing capacity based on asset risk.

### How Borrow Factors Work

```
Effective Borrow Capacity = Collateral Value × LTV / Borrow Factor
```

**Example**:
- Collateral: $1000 SOL
- LTV: 75%
- USDC Borrow Factor: 1.0
- BONK Borrow Factor: 2.0

```
Max Borrow USDC: $1000 × 0.75 / 1.0 = $750
Max Borrow BONK: $1000 × 0.75 / 2.0 = $375
```

### Why Borrow Factors?

1. **Risk Adjustment**: Higher risk assets have higher factors
2. **Liquidity Protection**: Limits exposure to illiquid assets
3. **Volatility Management**: Reduces risk from volatile assets
4. **Protocol Safety**: Maintains overall system health

### Common Borrow Factors

| Asset | Borrow Factor | Reasoning |
|-------|--------------|-----------|
| USDC | 1.0 | Stable, liquid |
| SOL | 1.0 | Highly liquid |
| mSOL | 1.1 | LST, slightly less liquid |
| BONK | 2.0 | Volatile, meme token |
| Low-cap | 3.0+ | High risk, low liquidity |

---

## Protected Collateral

Protected Collateral prevents specific collateral from being liquidated.

### How It Works

1. **Mark as Protected**: Designate collateral as protected
2. **Liquidation**: Other collateral liquidated first
3. **Last Resort**: Protected collateral only liquidated if necessary

### Use Cases

✅ **Protect**:
- Long-term holdings (SOL you don't want to sell)
- Tax-sensitive positions
- Sentimental assets

❌ **Don't Protect**:
- Your only collateral
- Highly volatile assets
- Assets you're willing to lose

### Example

```typescript
// Position
Collateral: 10 SOL (protected) + 5000 USDC
Borrow: 6000 USDC

// Liquidation Scenario
// 1. USDC collateral liquidated first
// 2. SOL only liquidated if USDC insufficient
// 3. Protects your SOL holdings
```

---

## Interest Rate Model

K-Lend uses a **poly-linear interest rate curve** with 11 points.

### How It Works

Interest rates adjust based on **utilization**:

```
Utilization = Total Borrowed / Total Supplied
```

**Low Utilization** (0-50%):
- Low borrow rates
- Encourages borrowing

**Medium Utilization** (50-80%):
- Moderate rates
- Balanced market

**High Utilization** (80-100%):
- High borrow rates
- Encourages repayment and new supply

### Example Curve

```
Utilization | Borrow APR | Supply APY
0%          | 2%         | 0%
25%         | 4%         | 1%
50%         | 8%         | 4%
75%         | 15%        | 11.25%
90%         | 30%        | 27%
100%        | 50%        | 50%
```

### Why Poly-linear?

1. **Responsive**: Quickly adjusts to market conditions
2. **Efficient**: Better capital utilization
3. **Stable**: Smooth rate transitions
4. **Predictable**: Clear rate expectations

---

## Supplying Assets

### How to Supply

1. **Connect Wallet**: Connect to Kamino app
2. **Select Asset**: Choose asset to supply
3. **Enter Amount**: Specify supply amount
4. **Confirm**: Approve transaction
5. **Earn**: Start earning interest immediately

### Supply APY

Your earnings depend on:
- **Utilization**: Higher utilization = higher APY
- **Borrow Demand**: More borrowers = more interest
- **Asset Type**: Different assets have different rates

### Example

```typescript
// Supply 1000 USDC
Supply Amount: 1000 USDC
Current APY: 5%
Annual Earnings: 50 USDC

// After 1 month
Interest Earned: ~4.17 USDC
New Balance: 1004.17 USDC
```

### Withdrawal

You can withdraw anytime if:
- ✅ Sufficient liquidity available
- ✅ Not being used as collateral
- ✅ No outstanding borrows against it

---

## Borrowing Assets

### How to Borrow

1. **Supply Collateral**: Deposit assets first
2. **Select Borrow Asset**: Choose what to borrow
3. **Enter Amount**: Stay below max LTV
4. **Confirm**: Approve transaction
5. **Manage**: Monitor position health

### Borrow Capacity

```
Max Borrow = Collateral Value × LTV / Borrow Factor
```

**Example**:
```typescript
Collateral: 10 SOL ($2000)
LTV: 75%
Borrow Factor (USDC): 1.0

Max Borrow: $2000 × 0.75 / 1.0 = $1500 USDC
```

### Position Health

Monitor your position using:

**LTV Ratio**:
```
Current LTV = Borrowed Value / Collateral Value
```

**Health Factor**:
```
Health Factor = (Collateral × Liquidation Threshold) / Borrowed Value
```

- Health Factor > 1.0: Safe
- Health Factor = 1.0: At liquidation threshold
- Health Factor < 1.0: Being liquidated

### Example

```typescript
// Safe Position
Collateral: $2000 SOL
Borrowed: $1000 USDC
LTV: 50%
Health Factor: 1.6
Status: ✅ Safe

// Risky Position
Collateral: $2000 SOL
Borrowed: $1600 USDC
LTV: 80%
Health Factor: 1.0
Status: ⚠️ At risk

// Liquidation
Collateral: $2000 SOL
Borrowed: $1700 USDC
LTV: 85%
Health Factor: 0.94
Status: ❌ Being liquidated
```

---

## Position Management

### Monitoring

**Key Metrics**:
- Current LTV
- Health Factor
- Liquidation Price
- Net APY (for Multiply positions)

**Tools**:
- Kamino App dashboard
- Risk Dashboard (risk.kamino.finance)
- Price alerts
- Position notifications

### Adjusting Positions

**Increase Safety**:
- Add more collateral
- Repay some debt
- Switch to lower LTV assets

**Increase Leverage**:
- Borrow more (if LTV allows)
- Use eMode for correlated assets
- Loop positions

### Example Management

```typescript
// Initial Position
Collateral: 10 SOL ($2000)
Borrowed: $1200 USDC
LTV: 60%
Health Factor: 1.33

// SOL price drops to $180
Collateral Value: $1800
LTV: 66.7%
Health Factor: 1.2
Action: ⚠️ Consider adding collateral

// Add 2 SOL collateral
New Collateral: 12 SOL ($2160)
LTV: 55.6%
Health Factor: 1.44
Status: ✅ Safe again
```

---

## Liquidations

### When Liquidation Occurs

Liquidation triggers when:
```
Current LTV ≥ Liquidation Threshold
```

**Example**:
- Max LTV: 75%
- Liquidation Threshold: 80%
- Current LTV: 81%
- Result: Liquidation starts

### Liquidation Process

1. **Trigger**: Position exceeds liquidation threshold
2. **Liquidator**: Bot/user repays debt
3. **Collateral Sale**: Liquidator receives collateral + bonus
4. **Partial**: Only enough collateral to restore health

### Liquidation Bonus

Liquidators receive a bonus (typically 2-10%):

```
Liquidator Receives = Debt Repaid × (1 + Liquidation Bonus)
```

**Example**:
```typescript
Debt Repaid: $1000
Liquidation Bonus: 5%
Collateral Received: $1050 worth
Liquidator Profit: $50
```

### Avoiding Liquidation

✅ **Best Practices**:
- Maintain LTV below 70% of max
- Set price alerts
- Monitor health factor daily
- Add collateral proactively
- Use stop-loss strategies

❌ **Avoid**:
- Maxing out LTV
- Ignoring position health
- Borrowing volatile assets
- Using all capital as collateral

---

## Fees

### Supply Fees

- **Deposit**: Free
- **Withdrawal**: Free (if liquidity available)
- **Interest**: Earned automatically

### Borrow Fees

- **Origination**: Typically 0%
- **Interest**: Variable based on utilization
- **Repayment**: Free

### Liquidation Fees

- **Liquidation Bonus**: 2-10% (paid by borrower)
- **Protocol Fee**: Small percentage of liquidation

---

## SDK Integration

### Installation

```bash
npm install @kamino-finance/klend-sdk
```

### Basic Usage

```typescript
import { KaminoMarket } from '@kamino-finance/klend-sdk';
import { Connection, PublicKey } from '@solana/web3.js';

// Initialize
const connection = new Connection('https://api.mainnet-beta.solana.com');
const market = await KaminoMarket.load(
  connection,
  new PublicKey('MARKET_ADDRESS')
);

// Get reserve data
const reserve = market.getReserve('SOL');
console.log('Supply APY:', reserve.supplyApy);
console.log('Borrow APR:', reserve.borrowApr);
console.log('Utilization:', reserve.utilization);

// Supply assets
const supplyTx = await market.supply({
  owner: userPublicKey,
  reserve: 'SOL',
  amount: 1_000_000_000, // 1 SOL (in lamports)
});

// Borrow assets
const borrowTx = await market.borrow({
  owner: userPublicKey,
  reserve: 'USDC',
  amount: 500_000_000, // 500 USDC (in smallest unit)
});

// Get user position
const obligation = await market.getObligation(userPublicKey);
console.log('Collateral Value:', obligation.collateralValue);
console.log('Borrowed Value:', obligation.borrowedValue);
console.log('LTV:', obligation.ltv);
console.log('Health Factor:', obligation.healthFactor);
```

### Advanced: eMode

```typescript
// Enable eMode for SOL/LST
const eModeTx = await market.setElevationGroup({
  owner: userPublicKey,
  elevationGroup: 1, // SOL/LST group
});

// Borrow with eMode
const borrowTx = await market.borrow({
  owner: userPublicKey,
  reserve: 'mSOL',
  amount: 9_000_000_000, // 9 mSOL (90% LTV)
});
```

### Monitoring Positions

```typescript
// Check position health
async function monitorPosition(userPublicKey: PublicKey) {
  const obligation = await market.getObligation(userPublicKey);
  
  if (obligation.healthFactor < 1.1) {
    console.warn('⚠️ Position at risk!');
    console.log('Health Factor:', obligation.healthFactor);
    console.log('Liquidation Price:', obligation.liquidationPrice);
    
    // Alert user or take action
    await addCollateral(userPublicKey);
  }
}

// Run monitoring every minute
setInterval(() => monitorPosition(userPublicKey), 60000);
```

---

## Best Practices

### For Lenders

✅ **Do**:
- Diversify across multiple assets
- Monitor utilization rates
- Understand withdrawal liquidity
- Consider opportunity cost

❌ **Don't**:
- Supply all capital to one asset
- Ignore market conditions
- Expect fixed returns
- Forget about smart contract risk

### For Borrowers

✅ **Do**:
- Maintain healthy LTV (< 70% of max)
- Set price alerts
- Monitor position daily
- Have repayment plan
- Use eMode for correlated assets

❌ **Don't**:
- Max out LTV
- Borrow without monitoring
- Ignore liquidation risk
- Use borrowed funds for speculation
- Forget about interest accumulation

### Risk Management

1. **Start Small**: Test with small amounts first
2. **Understand Liquidation**: Know your liquidation price
3. **Monitor Health**: Check health factor regularly
4. **Set Alerts**: Use price and health factor alerts
5. **Have Buffer**: Keep extra collateral ready
6. **Diversify**: Don't put all eggs in one basket

---

## Summary

Kamino Lend offers:

✅ **Capital Efficiency**: Unified market + eMode
✅ **Innovation**: kTokens as collateral
✅ **Flexibility**: Multiple asset tiers
✅ **Safety**: Comprehensive risk management
✅ **Scale**: Largest lending protocol on Solana

**Key Takeaways**:
- Overcollateralized lending protects lenders
- eMode enables higher leverage for correlated assets
- kTokens allow earning while using as collateral
- Asset tiers manage risk
- Borrow factors adjust for asset risk
- Monitor health factor to avoid liquidation

---

## Next Steps

- Learn about [Multiply Vaults](./multiply-vaults.md) for leveraged yield
- Study [Risk Management](./risk-management.md) framework
- Explore [Liquidity Vaults](./liquidity-vaults.md) for kTokens
- Try the [Lending Exercise](../exercises/kamino-lending.md)

---

**Source**: [Kamino Finance Documentation](https://docs.kamino.finance/)
**Last Updated**: February 17, 2026
