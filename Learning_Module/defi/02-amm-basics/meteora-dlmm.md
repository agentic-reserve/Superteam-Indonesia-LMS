# Meteora DLMM: Advanced AMM Implementation

Learn about Meteora's Dynamic Liquidity Market Maker (DLMM), a production AMM protocol that demonstrates advanced concepts beyond basic constant product formulas.

## Overview

Meteora is a comprehensive DeFi protocol on Solana that provides multiple AMM implementations. This guide focuses on DLMM (Dynamic Liquidity Market Maker), which introduces concentrated liquidity and dynamic fees to improve capital efficiency.

## What is Meteora DLMM?

DLMM is Meteora's flagship AMM product that provides:

- **Concentrated Liquidity**: Focus liquidity in specific price ranges
- **Dynamic Fees**: Fees adjust based on market volatility
- **Bin-Based Liquidity**: Discrete price points for precise control
- **Real-Time Adjustments**: Automatic parameter optimization

### Key Advantages Over Basic AMMs

**Traditional AMM (x * y = k)**:
- Liquidity spread across entire price curve
- Fixed fee structure
- Capital inefficiency
- Simple but limited

**Meteora DLMM**:
- Liquidity concentrated where needed
- Dynamic fee adjustment
- Higher capital efficiency
- Complex but powerful

## DLMM Concepts

### 1. Bins (Price Points)

Instead of a continuous curve, DLMM uses discrete "bins" at specific price points.

```
Price Range: $90 - $110
Bin Size: $1

Bins:
├── Bin 90: $90.00 - $91.00
├── Bin 91: $91.00 - $92.00
├── ...
├── Bin 100: $100.00 - $101.00  ← Active bin
├── ...
└── Bin 110: $110.00 - $111.00
```

**Benefits**:
- Precise liquidity placement
- Clear price boundaries
- Efficient capital usage
- Predictable behavior

### 2. Concentrated Liquidity

Liquidity providers can choose specific price ranges:

```typescript
// Example: Provide liquidity only between $95-$105
const minBin = 95;
const maxBin = 105;

// This concentrates capital where it's most useful
// vs spreading it from $0 to infinity
```

**Capital Efficiency**:
- Traditional AMM: 100% capital, 10% utilized
- DLMM: 100% capital, 80%+ utilized

### 3. Dynamic Fees

Fees adjust based on market conditions:

```
Low Volatility:  0.01% - 0.1%  (encourage trading)
Medium Volatility: 0.1% - 0.5%   (balanced)
High Volatility:  0.5% - 2.0%   (protect LPs)
```

**Fee Calculation**:
```typescript
baseFee = 0.1%  // Base trading fee
volatilityFee = calculateVolatility() * 0.5%
totalFee = baseFee + volatilityFee
```

### 4. Liquidity Distribution Strategies

**Uniform Distribution**:
```
Each bin gets equal liquidity
├── Bin 95: 10 SOL
├── Bin 96: 10 SOL
├── Bin 97: 10 SOL
└── ...
```

**Spot Concentrated**:
```
More liquidity near current price
├── Bin 98: 5 SOL
├── Bin 99: 15 SOL
├── Bin 100: 30 SOL  ← Current price
├── Bin 101: 15 SOL
└── Bin 102: 5 SOL
```

**Curve Distribution**:
```
Liquidity follows a curve (normal, exponential, etc.)
```

## DLMM Formulas

### Bin Price Calculation

```
binPrice = basePrice * (1 + binStep)^binId

Where:
- basePrice: Starting price
- binStep: Price increment per bin (e.g., 0.01 = 1%)
- binId: Bin identifier
```

**Example**:
```
basePrice = $100
binStep = 0.01 (1%)
binId = 5

binPrice = $100 * (1.01)^5 = $105.10
```

### Swap Amount Calculation

When swapping through multiple bins:

```typescript
function calculateSwapAmount(
  amountIn: number,
  bins: Bin[]
): number {
  let amountOut = 0;
  let remaining = amountIn;
  
  for (const bin of bins) {
    if (remaining === 0) break;
    
    // Amount this bin can handle
    const binCapacity = bin.liquidity;
    const binAmount = Math.min(remaining, binCapacity);
    
    // Calculate output for this bin
    const binOutput = binAmount * bin.price * (1 - bin.fee);
    
    amountOut += binOutput;
    remaining -= binAmount;
  }
  
  return amountOut;
}
```

### Fee Distribution

```
totalFees = swapAmount * feeRate

Distribution:
├── LPs: 85% (to liquidity providers)
├── Protocol: 10% (to Meteora treasury)
└── MET Stakers: 5% (to token stakers)
```

## TypeScript SDK Integration

### Installation

```bash
npm install @meteora-ag/dlmm
```

### Basic Usage

```typescript
import { DLMM } from "@meteora-ag/dlmm";
import { Connection, PublicKey } from "@solana/web3.js";

// Initialize connection
const connection = new Connection("https://api.mainnet-beta.solana.com");

// Create DLMM instance
const poolAddress = new PublicKey("POOL_ADDRESS");
const dlmm = await DLMM.create(connection, poolAddress);

// Get pool information
const poolInfo = await dlmm.getPoolInfo();
console.log("Active Bin:", poolInfo.activeBinId);
console.log("Current Price:", poolInfo.currentPrice);
```

### Swap Tokens

```typescript
// Get swap quote
const inputAmount = 1_000_000; // 1 SOL (in lamports)
const swapYtoX = false; // false = swap X to Y, true = swap Y to X

const quote = await dlmm.getSwapQuote(inputAmount, swapYtoX);

console.log("Input:", quote.inputAmount);
console.log("Output:", quote.outputAmount);
console.log("Fee:", quote.fee);
console.log("Price Impact:", quote.priceImpact);

// Execute swap
const swapTx = await dlmm.swap({
  inputAmount,
  minOutputAmount: quote.outputAmount * 0.99, // 1% slippage
  swapYtoX,
});

const signature = await connection.sendTransaction(swapTx);
await connection.confirmTransaction(signature);
```

### Add Liquidity

```typescript
// Define liquidity position
const minBinId = 100; // Lower price bound
const maxBinId = 110; // Upper price bound
const amountX = 10_000_000; // 10 SOL
const amountY = 1000_000_000; // 1000 USDC

// Create position
const addLiquidityTx = await dlmm.addLiquidity({
  minBinId,
  maxBinId,
  amountX,
  amountY,
  strategy: "Uniform", // or "SpotConcentrated", "Curve"
});

const signature = await connection.sendTransaction(addLiquidityTx);
await connection.confirmTransaction(signature);
```

### Remove Liquidity

```typescript
// Get user positions
const positions = await dlmm.getUserPositions(userPublicKey);

// Remove liquidity from a position
const removeLiquidityTx = await dlmm.removeLiquidity({
  positionId: positions[0].id,
  binIds: [100, 101, 102], // Specific bins to remove from
  liquidityAmounts: [50, 50, 50], // Percentage to remove from each
});

const signature = await connection.sendTransaction(removeLiquidityTx);
await connection.confirmTransaction(signature);
```

### Claim Fees

```typescript
// Claim accumulated fees
const claimFeesTx = await dlmm.claimFees({
  positionId: positions[0].id,
});

const signature = await connection.sendTransaction(claimFeesTx);
await connection.confirmTransaction(signature);
```

## API Integration

Meteora provides REST APIs for querying pool data.

### Get All DLMM Pairs

```typescript
const response = await fetch(
  "https://dlmm-api.meteora.ag/pair/all"
);
const pairs = await response.json();

console.log("Total Pairs:", pairs.length);
pairs.forEach(pair => {
  console.log(`${pair.name}: ${pair.address}`);
});
```

### Get Pair Information

```typescript
const pairAddress = "PAIR_ADDRESS";
const response = await fetch(
  `https://dlmm-api.meteora.ag/pair/${pairAddress}`
);
const pairInfo = await response.json();

console.log("Liquidity:", pairInfo.liquidity);
console.log("Volume 24h:", pairInfo.volume24h);
console.log("Fees 24h:", pairInfo.fees24h);
console.log("APY:", pairInfo.apy);
```

### Get User Positions

```typescript
const userAddress = "USER_ADDRESS";
const response = await fetch(
  `https://dlmm-api.meteora.ag/position/${userAddress}`
);
const positions = await response.json();

positions.forEach(position => {
  console.log("Position:", position.id);
  console.log("Value:", position.value);
  console.log("Unclaimed Fees:", position.unclaimedFees);
});
```

## Comparison: Basic AMM vs DLMM

### Capital Efficiency

**Basic AMM (Uniswap V2 style)**:
```
Price Range: $0 - ∞
Liquidity: Spread across entire range
Utilization: ~10-20%

Example:
$10,000 liquidity
$1,500 actively used
85% idle capital
```

**DLMM**:
```
Price Range: $95 - $105 (chosen)
Liquidity: Concentrated in range
Utilization: ~80-90%

Example:
$10,000 liquidity
$8,500 actively used
15% idle capital
```

### Fee Generation

**Basic AMM**:
```
Fixed fee: 0.3%
Volume: $100,000/day
Fees: $300/day
Your share (1%): $3/day
```

**DLMM**:
```
Dynamic fee: 0.1% - 1.0%
Volume: $100,000/day
Fees: $500/day (higher due to better pricing)
Your share (1% concentrated): $15/day
```

### Impermanent Loss

**Basic AMM**:
```
Price moves 10%
IL: ~0.5%
Spread across all prices
```

**DLMM**:
```
Price moves 10%
IL: ~0.3% (if within range)
IL: ~2% (if outside range)
Concentrated exposure
```

## Advanced Strategies

### 1. Range Orders

Act like a limit order:

```typescript
// Sell SOL at $110
const sellOrder = await dlmm.addLiquidity({
  minBinId: 110,
  maxBinId: 111,
  amountX: 10_000_000, // 10 SOL
  amountY: 0,
  strategy: "Uniform",
});

// When price hits $110, SOL converts to USDC
```

### 2. Market Making

Provide liquidity around current price:

```typescript
const currentBin = await dlmm.getActiveBinId();

// Tight range around current price
const marketMaking = await dlmm.addLiquidity({
  minBinId: currentBin - 5,
  maxBinId: currentBin + 5,
  amountX: 5_000_000,
  amountY: 500_000_000,
  strategy: "SpotConcentrated",
});
```

### 3. Yield Farming

Combine with farming rewards:

```typescript
// Add liquidity to farming pool
const farmingPosition = await dlmm.addLiquidityWithFarming({
  minBinId: 95,
  maxBinId: 105,
  amountX: 10_000_000,
  amountY: 1000_000_000,
  farmId: "FARM_ID",
});

// Earn trading fees + farming rewards
```

## Best Practices

### 1. Choose Appropriate Range

```typescript
// Too wide: Capital inefficiency
const tooWide = { minBin: 50, maxBin: 150 }; // ❌

// Too narrow: High IL risk
const tooNarrow = { minBin: 99, maxBin: 101 }; // ❌

// Balanced: Good efficiency, manageable risk
const balanced = { minBin: 95, maxBin: 105 }; // ✅
```

### 2. Monitor Positions

```typescript
// Check if price is still in range
const activeBin = await dlmm.getActiveBinId();
const position = await dlmm.getPosition(positionId);

if (activeBin < position.minBin || activeBin > position.maxBin) {
  console.warn("Position out of range!");
  // Consider rebalancing
}
```

### 3. Rebalance Regularly

```typescript
// Automated rebalancing
async function rebalanceIfNeeded() {
  const position = await dlmm.getPosition(positionId);
  const activeBin = await dlmm.getActiveBinId();
  
  // If price moved significantly
  if (Math.abs(activeBin - position.centerBin) > 10) {
    // Remove old position
    await dlmm.removeLiquidity({ positionId });
    
    // Add new position centered on current price
    await dlmm.addLiquidity({
      minBinId: activeBin - 5,
      maxBinId: activeBin + 5,
      // ... amounts
    });
  }
}
```

### 4. Calculate Returns

```typescript
// Track position performance
const initialValue = position.amountX * priceX + position.amountY * priceY;
const currentValue = await dlmm.getPositionValue(positionId);
const fees = await dlmm.getUnclaimedFees(positionId);

const totalReturn = (currentValue + fees - initialValue) / initialValue;
const apy = totalReturn * (365 / daysHeld);

console.log(`APY: ${(apy * 100).toFixed(2)}%`);
```

## Common Pitfalls

### 1. Ignoring Impermanent Loss

```typescript
// ❌ Bad: Ignoring IL in volatile pairs
await dlmm.addLiquidity({
  pair: "SOL/MEME", // Highly volatile
  minBinId: 90,
  maxBinId: 110,
  // Wide range = high IL exposure
});

// ✅ Good: Narrow range or stable pairs
await dlmm.addLiquidity({
  pair: "USDC/USDT", // Stable
  minBinId: 99,
  maxBinId: 101,
  // Tight range, low IL
});
```

### 2. Setting Wrong Slippage

```typescript
// ❌ Bad: Too tight slippage
const quote = await dlmm.getSwapQuote(amount, false);
const minOut = quote.outputAmount * 0.999; // 0.1% slippage
// May fail in volatile markets

// ✅ Good: Reasonable slippage
const minOut = quote.outputAmount * 0.99; // 1% slippage
// Balances protection and execution
```

### 3. Not Claiming Fees

```typescript
// ❌ Bad: Letting fees accumulate
// Fees sit idle, not compounding

// ✅ Good: Regular fee claims and reinvestment
setInterval(async () => {
  const fees = await dlmm.getUnclaimedFees(positionId);
  if (fees > threshold) {
    await dlmm.claimFees({ positionId });
    await dlmm.addLiquidity({ /* reinvest fees */ });
  }
}, 24 * 60 * 60 * 1000); // Daily
```

## Resources

### Official Documentation
- **Meteora Docs**: https://docs.meteora.ag
- **DLMM Overview**: https://docs.meteora.ag/overview/products/dlmm/what-is-dlmm.md
- **Developer Guide**: https://docs.meteora.ag/developer-guide/guides/dlmm/overview.md

### SDK and APIs
- **TypeScript SDK**: https://www.npmjs.com/package/@meteora-ag/dlmm
- **API Reference**: https://docs.meteora.ag/api-reference/dlmm/overview.md
- **GitHub**: https://github.com/MeteoraAg

### Community
- **Discord**: https://discord.com/invite/meteora
- **Telegram**: https://t.me/meteora_dev
- **Twitter**: @MeteoraAG

### Tools
- **Meteora App**: https://app.meteora.ag
- **Analytics**: https://app.meteora.ag/analytics
- **Pool Creator**: https://app.meteora.ag/pools/create

## Exercises

Practice DLMM integration in [exercises/meteora-integration.md](../exercises/meteora-integration.md)

## Next Steps

After understanding DLMM:

1. **Explore Other Products**: Learn about DAMM, Dynamic Vaults, and DBC
2. **Build a Project**: Create a liquidity management dashboard
3. **Advanced Strategies**: Implement automated rebalancing
4. **Integration**: Add DLMM to your dApp

---

**Source**: Adapted from Meteora documentation at https://docs.meteora.ag

**Note**: Meteora is a production DeFi protocol. Always test on devnet first and understand the risks before providing liquidity on mainnet.

Ready to practice? Continue to [Meteora Integration Exercise](../exercises/meteora-integration.md)!
