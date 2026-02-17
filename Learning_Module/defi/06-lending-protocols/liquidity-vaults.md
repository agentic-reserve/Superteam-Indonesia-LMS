# Liquidity Vaults

Kamino Liquidity Vaults provide automated concentrated liquidity management for Solana DEXs. Deposit assets, receive kTokens, and use them as collateral in K-Lend while continuing to earn LP fees.

## Overview

Liquidity Vaults automate CLMM (Concentrated Liquidity Market Maker) strategies, making it easy to provide liquidity and earn fees without active management.

### Key Features

- **Automated Rebalancing**: Strategies adjust positions automatically
- **kTokens**: Fungible LP position tokens
- **Auto-Compounding**: Fees reinvested automatically
- **Collateral**: Use kTokens in K-Lend
- **One-Click**: Easy deposit/withdrawal

---

## What are kTokens?

kTokens are fungible representations of CLMM liquidity positions.

### Traditional CLMM

```
Deposit: 1 SOL + 200 USDC
Receive: NFT (non-fungible position)
Problem: Can't easily use as collateral
```

### Kamino kTokens

```
Deposit: 1 SOL + 200 USDC
Receive: 1000 kSOL-USDC tokens (fungible)
Benefit: Can use as collateral, transfer, trade
```

### kToken Benefits

✅ **Fungible**: Can be transferred and traded
✅ **Composable**: Use in other DeFi protocols
✅ **Collateral**: Supply to K-Lend for borrowing
✅ **Auto-Compound**: Fees reinvested automatically
✅ **Simplified**: No manual position management

---

## How Liquidity Vaults Work

### 1. Deposit Assets

```typescript
// Deposit to SOL-USDC vault
Deposit: 1 SOL + 200 USDC
Vault Strategy: Concentrated around current price
Receive: 1000 kSOL-USDC tokens
```

### 2. Earn Fees

```
Trading Volume: $1M/day
Your Share: 0.1%
Daily Fees: ~$100
APY: ~30-50% (varies by pair)
```

### 3. Auto-Rebalancing

```
Price moves outside range
  ↓
Vault automatically rebalances
  ↓
Maintains optimal position
  ↓
Continues earning fees
```

### 4. Use as Collateral

```
Supply kTokens to K-Lend
  ↓
Borrow against kToken value
  ↓
Still earning LP fees
  ↓
Double yield: LP fees + lending interest
```

---

## Supported Vaults

### Major Pairs

**SOL-USDC**:
- High volume
- Tight spreads
- 30-50% APY

**mSOL-SOL**:
- Correlated pair
- Lower IL risk
- 15-25% APY

**USDC-USDT**:
- Stable pair
- Very low IL risk
- 10-20% APY

### Volatile Pairs

**BONK-SOL**:
- High volatility
- Higher fees
- 50-100% APY
- Higher IL risk

---

## Using kTokens as Collateral

### The Strategy

1. **Provide Liquidity**: Deposit to vault
2. **Receive kTokens**: Get fungible LP tokens
3. **Supply to K-Lend**: Use as collateral
4. **Borrow**: Take loans against kToken value
5. **Earn**: LP fees + lending yield

### Example

```typescript
// Step 1: Provide liquidity
Deposit: 10 SOL + 2000 USDC ($4000 total)
Receive: 4000 kSOL-USDC tokens
LP APY: 40%

// Step 2: Use as collateral
Supply to K-Lend: 4000 kSOL-USDC
Collateral Value: $4000
Max LTV: 75%

// Step 3: Borrow
Borrow: $3000 USDC
Borrow APR: 5%

// Step 4: Calculate returns
LP Fees: 40% × $4000 = $1600/year
Borrow Cost: 5% × $3000 = $150/year
Net Yield: $1450/year
Net APY: 36.25% on original $4000
Plus: $3000 borrowed capital to deploy elsewhere
```

### Risks

⚠️ **Impermanent Loss**: Price divergence reduces value
⚠️ **Liquidation**: If kToken value drops
⚠️ **Smart Contract**: Protocol risk
⚠️ **Volatility**: Affects both LP and collateral value

---

## Vault Strategies

### Concentrated Strategy

**Range**: Tight around current price
**Rebalancing**: Frequent
**Fees**: Higher (more active)
**IL Risk**: Higher

**Best for**: Stable pairs, high volume

### Wide Strategy

**Range**: Broader price range
**Rebalancing**: Less frequent
**Fees**: Lower (less active)
**IL Risk**: Lower

**Best for**: Volatile pairs, lower volume

### Pegged Strategy

**Range**: Very tight (for stables)
**Rebalancing**: Rare
**Fees**: Moderate
**IL Risk**: Very low

**Best for**: Stablecoin pairs

---

## SDK Integration

### Depositing to Vault

```typescript
import { KaminoVault } from '@kamino-finance/vault-sdk';

const vault = new KaminoVault(connection);

// Deposit to SOL-USDC vault
const depositTx = await vault.deposit({
  owner: userPublicKey,
  vaultAddress: SOL_USDC_VAULT,
  amountA: 1_000_000_000, // 1 SOL
  amountB: 200_000_000, // 200 USDC
  slippage: 0.01,
});

console.log('Received kTokens:', depositTx.kTokensReceived);
```

### Using kTokens as Collateral

```typescript
import { KaminoMarket } from '@kamino-finance/klend-sdk';

const market = new KaminoMarket(connection);

// Supply kTokens to K-Lend
const supplyTx = await market.supply({
  owner: userPublicKey,
  reserve: 'kSOL-USDC',
  amount: 4000_000_000, // 4000 kTokens
});

// Borrow against kTokens
const borrowTx = await market.borrow({
  owner: userPublicKey,
  reserve: 'USDC',
  amount: 3000_000_000, // 3000 USDC
});
```

### Withdrawing from Vault

```typescript
// Withdraw from vault
const withdrawTx = await vault.withdraw({
  owner: userPublicKey,
  vaultAddress: SOL_USDC_VAULT,
  kTokenAmount: 4000_000_000, // 4000 kTokens
  slippage: 0.01,
});

console.log('Received SOL:', withdrawTx.amountA);
console.log('Received USDC:', withdrawTx.amountB);
```

---

## Best Practices

### Choosing Vaults

✅ **Consider**:
- Trading volume (higher = more fees)
- Volatility (affects IL)
- Your risk tolerance
- Correlation of assets

❌ **Avoid**:
- Low volume pairs
- Highly volatile pairs (unless experienced)
- Pairs with one-sided movement
- Unaudited vaults

### Position Management

✅ **Do**:
- Monitor IL regularly
- Check vault performance
- Rebalance if needed
- Understand the strategy

❌ **Don't**:
- Set and forget
- Ignore IL
- Over-leverage kTokens
- Use all capital in one vault

### Using as Collateral

✅ **Do**:
- Maintain safe LTV (< 60%)
- Monitor both LP and collateral value
- Have exit strategy
- Understand double risk (IL + liquidation)

❌ **Don't**:
- Max out LTV
- Ignore IL impact on collateral
- Forget about liquidation risk
- Use volatile pairs as collateral

---

## Summary

Liquidity Vaults offer:

✅ **Automated Management**: No manual rebalancing
✅ **Fungible Positions**: kTokens are transferable
✅ **Composability**: Use as collateral
✅ **Auto-Compounding**: Fees reinvested
✅ **Capital Efficiency**: Earn while borrowing

**Key Takeaways**:
- kTokens represent CLMM positions
- Can be used as collateral in K-Lend
- Earn LP fees + lending yield
- Monitor IL and liquidation risk
- Choose appropriate vault strategy

---

## Next Steps

- Try the [Kamino Lending Exercise](../exercises/kamino-lending.md)
- Explore [Multiply Strategies](./multiply-vaults.md) with kTokens
- Monitor vaults on [Kamino App](https://app.kamino.finance/)
- Review [Risk Management](./risk-management.md) for kToken collateral

---

**Source**: [Kamino Finance Documentation](https://docs.kamino.finance/)
**Last Updated**: February 17, 2026
