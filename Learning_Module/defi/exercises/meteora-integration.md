# Meteora DLMM Integration Exercises

Hands-on exercises for integrating Meteora's Dynamic Liquidity Market Maker into your applications.

## Prerequisites

- Complete [AMM Basics](../02-amm-basics/README.md)
- Read [Meteora DLMM Guide](../02-amm-basics/meteora-dlmm.md)
- Node.js and TypeScript installed
- Solana CLI configured
- Devnet SOL for testing

## Exercise 1: Pool Information Dashboard

**Difficulty**: Beginner
**Time**: 30-45 minutes

### Objective

Create a simple dashboard that displays information about Meteora DLMM pools.

### Tasks

1. **Setup Project**

```bash
mkdir meteora-dashboard
cd meteora-dashboard
npm init -y
npm install @meteora-ag/dlmm @solana/web3.js
npm install --save-dev typescript @types/node
```

2. **Fetch Pool Data**

Create `src/poolInfo.ts`:

```typescript
import { DLMM } from "@meteora-ag/dlmm";
import { Connection, PublicKey } from "@solana/web3.js";

async function getPoolInfo() {
  const connection = new Connection("https://api.devnet.solana.com");
  
  // Use a devnet pool address
  const poolAddress = new PublicKey("YOUR_POOL_ADDRESS");
  
  const dlmm = await DLMM.create(connection, poolAddress);
  const poolInfo = await dlmm.getPoolInfo();
  
  console.log("=== Pool Information ===");
  console.log("Active Bin ID:", poolInfo.activeBinId);
  console.log("Current Price:", poolInfo.currentPrice);
  console.log("Total Liquidity:", poolInfo.totalLiquidity);
  console.log("24h Volume:", poolInfo.volume24h);
  console.log("24h Fees:", poolInfo.fees24h);
}

getPoolInfo().catch(console.error);
```

3. **Display Multiple Pools**

Extend to show multiple pools:

```typescript
async function displayMultiplePools() {
  const pools = [
    "POOL_ADDRESS_1",
    "POOL_ADDRESS_2",
    "POOL_ADDRESS_3",
  ];
  
  for (const poolAddr of pools) {
    const poolAddress = new PublicKey(poolAddr);
    const dlmm = await DLMM.create(connection, poolAddress);
    const info = await dlmm.getPoolInfo();
    
    console.log(`\n${info.name}:`);
    console.log(`  Price: $${info.currentPrice.toFixed(4)}`);
    console.log(`  TVL: $${info.totalLiquidity.toLocaleString()}`);
    console.log(`  APY: ${info.apy.toFixed(2)}%`);
  }
}
```

### Challenge

Add real-time price updates using WebSocket connections.

---

## Exercise 2: Swap Quote Calculator

**Difficulty**: Beginner
**Time**: 45-60 minutes

### Objective

Build a tool that calculates swap quotes with different parameters.

### Tasks

1. **Basic Quote Calculator**

```typescript
async function calculateSwapQuote(
  poolAddress: PublicKey,
  inputAmount: number,
  swapYtoX: boolean
) {
  const dlmm = await DLMM.create(connection, poolAddress);
  
  const quote = await dlmm.getSwapQuote(inputAmount, swapYtoX);
  
  console.log("=== Swap Quote ===");
  console.log("Input Amount:", quote.inputAmount);
  console.log("Output Amount:", quote.outputAmount);
  console.log("Fee:", quote.fee);
  console.log("Price Impact:", `${(quote.priceImpact * 100).toFixed(4)}%`);
  console.log("Minimum Output (1% slippage):", quote.outputAmount * 0.99);
  
  return quote;
}
```

2. **Compare Multiple Amounts**

```typescript
async function compareSwapSizes() {
  const amounts = [
    1_000_000,      // 1 SOL
    10_000_000,     // 10 SOL
    100_000_000,    // 100 SOL
    1_000_000_000,  // 1000 SOL
  ];
  
  console.log("=== Price Impact Analysis ===");
  
  for (const amount of amounts) {
    const quote = await calculateSwapQuote(poolAddress, amount, false);
    console.log(`${amount / 1_000_000} SOL: ${(quote.priceImpact * 100).toFixed(4)}% impact`);
  }
}
```

3. **Slippage Calculator**

```typescript
function calculateSlippageOptions(quote: SwapQuote) {
  const slippages = [0.1, 0.5, 1.0, 2.0, 5.0]; // Percentages
  
  console.log("\n=== Slippage Options ===");
  slippages.forEach(slippage => {
    const minOutput = quote.outputAmount * (1 - slippage / 100);
    console.log(`${slippage}%: Minimum ${minOutput.toLocaleString()}`);
  });
}
```

### Challenge

Create a CLI tool that accepts user input for swap parameters.

---

## Exercise 3: Liquidity Position Manager

**Difficulty**: Intermediate
**Time**: 1-2 hours

### Objective

Build a tool to manage liquidity positions on Meteora DLMM.

### Tasks

1. **Position Creator**

```typescript
async function createPosition(
  poolAddress: PublicKey,
  minBinId: number,
  maxBinId: number,
  amountX: number,
  amountY: number
) {
  const dlmm = await DLMM.create(connection, poolAddress);
  
  console.log("Creating position...");
  console.log(`Range: Bin ${minBinId} to ${maxBinId}`);
  console.log(`Amount X: ${amountX}`);
  console.log(`Amount Y: ${amountY}`);
  
  const tx = await dlmm.addLiquidity({
    minBinId,
    maxBinId,
    amountX,
    amountY,
    strategy: "Uniform",
  });
  
  const signature = await connection.sendTransaction(tx);
  await connection.confirmTransaction(signature);
  
  console.log("Position created!");
  console.log("Signature:", signature);
  
  return signature;
}
```

2. **Position Monitor**

```typescript
async function monitorPosition(positionId: string) {
  const position = await dlmm.getPosition(positionId);
  const activeBin = await dlmm.getActiveBinId();
  
  console.log("=== Position Status ===");
  console.log("Position ID:", positionId);
  console.log("Range:", `${position.minBin} - ${position.maxBin}`);
  console.log("Active Bin:", activeBin);
  
  // Check if in range
  const inRange = activeBin >= position.minBin && activeBin <= position.maxBin;
  console.log("In Range:", inRange ? "✅ Yes" : "❌ No");
  
  // Calculate position value
  const value = await dlmm.getPositionValue(positionId);
  console.log("Current Value:", value);
  
  // Check unclaimed fees
  const fees = await dlmm.getUnclaimedFees(positionId);
  console.log("Unclaimed Fees:", fees);
  
  return { position, inRange, value, fees };
}
```

3. **Auto-Rebalancer**

```typescript
async function autoRebalance(
  positionId: string,
  threshold: number = 10 // bins
) {
  const { position, inRange, activeBin } = await monitorPosition(positionId);
  
  if (!inRange) {
    console.log("Position out of range! Rebalancing...");
    
    // Remove old position
    await dlmm.removeLiquidity({ positionId });
    
    // Create new position centered on current price
    const newMinBin = activeBin - 5;
    const newMaxBin = activeBin + 5;
    
    await createPosition(
      poolAddress,
      newMinBin,
      newMaxBin,
      position.amountX,
      position.amountY
    );
    
    console.log("Rebalanced successfully!");
  } else {
    console.log("Position still in range, no rebalancing needed.");
  }
}
```

### Challenge

Implement automated fee claiming and reinvestment.

---

## Exercise 4: Trading Bot

**Difficulty**: Advanced
**Time**: 2-3 hours

### Objective

Create a simple trading bot that executes swaps based on price conditions.

### Tasks

1. **Price Monitor**

```typescript
class PriceMonitor {
  private dlmm: DLMM;
  private targetPrice: number;
  private callback: (price: number) => void;
  
  constructor(dlmm: DLMM, targetPrice: number, callback: (price: number) => void) {
    this.dlmm = dlmm;
    this.targetPrice = targetPrice;
    this.callback = callback;
  }
  
  async start() {
    setInterval(async () => {
      const poolInfo = await this.dlmm.getPoolInfo();
      const currentPrice = poolInfo.currentPrice;
      
      console.log(`Current Price: $${currentPrice.toFixed(4)}`);
      
      if (currentPrice >= this.targetPrice) {
        this.callback(currentPrice);
      }
    }, 5000); // Check every 5 seconds
  }
}
```

2. **Swap Executor**

```typescript
async function executeSwap(
  poolAddress: PublicKey,
  inputAmount: number,
  swapYtoX: boolean,
  maxSlippage: number = 0.01
) {
  const dlmm = await DLMM.create(connection, poolAddress);
  
  // Get quote
  const quote = await dlmm.getSwapQuote(inputAmount, swapYtoX);
  
  // Check price impact
  if (quote.priceImpact > maxSlippage) {
    console.log("Price impact too high, aborting swap");
    return null;
  }
  
  // Calculate minimum output
  const minOutput = quote.outputAmount * (1 - maxSlippage);
  
  // Execute swap
  const tx = await dlmm.swap({
    inputAmount,
    minOutputAmount: minOutput,
    swapYtoX,
  });
  
  const signature = await connection.sendTransaction(tx);
  await connection.confirmTransaction(signature);
  
  console.log("Swap executed!");
  console.log("Signature:", signature);
  
  return signature;
}
```

3. **Simple Trading Strategy**

```typescript
async function runTradingBot() {
  const buyPrice = 100;  // Buy when price drops to $100
  const sellPrice = 110; // Sell when price rises to $110
  
  let position: "cash" | "token" = "cash";
  
  const monitor = new PriceMonitor(
    dlmm,
    position === "cash" ? buyPrice : sellPrice,
    async (price) => {
      if (position === "cash" && price <= buyPrice) {
        console.log(`Buying at $${price}`);
        await executeSwap(poolAddress, 1_000_000, false, 0.01);
        position = "token";
      } else if (position === "token" && price >= sellPrice) {
        console.log(`Selling at $${price}`);
        await executeSwap(poolAddress, 1_000_000, true, 0.01);
        position = "cash";
      }
    }
  );
  
  await monitor.start();
}
```

### Challenge

Add risk management, stop-loss, and take-profit features.

---

## Exercise 5: Analytics Dashboard

**Difficulty**: Advanced
**Time**: 3-4 hours

### Objective

Build a comprehensive analytics dashboard for Meteora pools.

### Tasks

1. **Historical Data Fetcher**

```typescript
async function fetchHistoricalData(
  poolAddress: string,
  days: number = 30
) {
  const response = await fetch(
    `https://dlmm-api.meteora.ag/pair/${poolAddress}/volume?days=${days}`
  );
  const data = await response.json();
  
  return data;
}
```

2. **Performance Calculator**

```typescript
interface PoolMetrics {
  apy: number;
  volume24h: number;
  fees24h: number;
  tvl: number;
  priceChange24h: number;
}

async function calculatePoolMetrics(
  poolAddress: string
): Promise<PoolMetrics> {
  const response = await fetch(
    `https://dlmm-api.meteora.ag/pair/${poolAddress}`
  );
  const data = await response.json();
  
  return {
    apy: data.apy,
    volume24h: data.volume24h,
    fees24h: data.fees24h,
    tvl: data.liquidity,
    priceChange24h: data.priceChange24h,
  };
}
```

3. **Comparison Tool**

```typescript
async function comparePoolsPerformance(
  poolAddresses: string[]
) {
  console.log("=== Pool Performance Comparison ===\n");
  
  for (const address of poolAddresses) {
    const metrics = await calculatePoolMetrics(address);
    
    console.log(`Pool: ${address}`);
    console.log(`  APY: ${metrics.apy.toFixed(2)}%`);
    console.log(`  24h Volume: $${metrics.volume24h.toLocaleString()}`);
    console.log(`  24h Fees: $${metrics.fees24h.toLocaleString()}`);
    console.log(`  TVL: $${metrics.tvl.toLocaleString()}`);
    console.log(`  24h Change: ${metrics.priceChange24h.toFixed(2)}%`);
    console.log();
  }
}
```

### Challenge

Create a web interface using React or Next.js to display the analytics.

---

## Bonus Exercise: Full DApp Integration

**Difficulty**: Expert
**Time**: 5-8 hours

### Objective

Build a complete dApp that integrates Meteora DLMM with a user interface.

### Features to Implement

1. **Wallet Connection**
   - Connect Phantom/Solflare
   - Display user balance
   - Show user positions

2. **Swap Interface**
   - Token selection
   - Amount input
   - Quote display
   - Slippage settings
   - Execute swap

3. **Liquidity Management**
   - Add liquidity form
   - Position list
   - Remove liquidity
   - Claim fees

4. **Analytics**
   - Pool statistics
   - Price charts
   - Volume graphs
   - APY calculator

### Tech Stack

- **Frontend**: React + TypeScript
- **Wallet**: @solana/wallet-adapter-react
- **Meteora**: @meteora-ag/dlmm
- **Charts**: recharts or chart.js
- **Styling**: Tailwind CSS

### Getting Started

```bash
npx create-react-app meteora-dapp --template typescript
cd meteora-dapp
npm install @solana/wallet-adapter-react @solana/wallet-adapter-wallets
npm install @meteora-ag/dlmm @solana/web3.js
npm install recharts tailwindcss
```

---

## Testing Checklist

Before deploying to mainnet:

- [ ] Test all functions on devnet
- [ ] Handle all error cases
- [ ] Implement proper slippage protection
- [ ] Add transaction confirmation
- [ ] Test with different wallet providers
- [ ] Verify gas estimation
- [ ] Test edge cases (zero amounts, max amounts)
- [ ] Add loading states
- [ ] Implement retry logic
- [ ] Add proper logging

## Resources

- **Meteora Docs**: https://docs.meteora.ag
- **TypeScript SDK**: https://www.npmjs.com/package/@meteora-ag/dlmm
- **API Docs**: https://docs.meteora.ag/api-reference/dlmm/overview.md
- **Discord**: https://discord.com/invite/meteora

## Submission

Share your completed exercises:
1. Push code to GitHub
2. Share in Solana Discord
3. Tweet with #SolanaDev #Meteora
4. Get feedback from community

---

**Note**: Always test on devnet first. Never use mainnet funds for learning exercises.

Ready to build more? Explore [other DeFi protocols](../README.md) or move to [Perpetual Futures](../03-perpetual-futures/README.md)!
