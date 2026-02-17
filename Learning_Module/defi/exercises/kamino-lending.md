# Exercise: Kamino Lending Integration

Build a lending dashboard that displays user positions, calculates health factors, and provides risk alerts.

## Difficulty: Intermediate

## Estimated Time: 2-3 hours

## What You'll Build

Imagine you're building a personal finance tracker, but for DeFi lending. Just like a banking app shows your account balance and warns you about low funds, you'll create a dashboard that:
- Shows how much you've deposited (collateral) and borrowed (debt)
- Calculates your "financial health score" (health factor)
- Alerts you before you're at risk of losing your collateral (liquidation)

Think of it as a smart assistant that constantly monitors your lending position and taps you on the shoulder when things need attention.

## Learning Objectives

- Integrate Kamino SDK (connect to the lending protocol)
- Fetch user lending positions (read blockchain data)
- Calculate risk metrics (understand liquidation math)
- Display position health (build intuitive UI)
- Implement alert system (proactive risk management)

---

## Prerequisites

- Completed [Kamino Lend](../06-lending-protocols/kamino-lend.md)
- Understanding of [Risk Management](../06-lending-protocols/risk-management.md)
- TypeScript/JavaScript knowledge
- React basics (for UI)

---

## Exercise Overview

Build a dashboard that:
1. Connects to user wallet
2. Fetches Kamino lending positions
3. Displays collateral and debt
4. Calculates health metrics
5. Shows liquidation prices
6. Provides risk alerts

---

## Part 1: Setup (30 minutes)

### Install Dependencies

Think of these as the tools you need before starting construction:

```bash
npm install @kamino-finance/klend-sdk @solana/web3.js @solana/wallet-adapter-react
```

**What each package does**:
- `@kamino-finance/klend-sdk`: Your toolkit for talking to Kamino (like an API client)
- `@solana/web3.js`: The foundation for Solana blockchain interactions
- `@solana/wallet-adapter-react`: Handles wallet connections (like OAuth for crypto)

### Initialize SDK

This is like opening a connection to your bank's API:

```typescript
// src/lib/kamino.ts
import { KaminoMarket } from '@kamino-finance/klend-sdk';
import { Connection, PublicKey } from '@solana/web3.js';

// RPC endpoint: Your gateway to the Solana blockchain (like a database connection string)
const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com';

// Market address: The specific Kamino lending pool we're connecting to
const KAMINO_MARKET = new PublicKey('7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF');

export async function initializeKamino() {
  // Create connection to Solana blockchain
  const connection = new Connection(RPC_ENDPOINT);
  
  // Load the Kamino market data (like loading a database schema)
  const market = await KaminoMarket.load(connection, KAMINO_MARKET);
  
  return { connection, market };
}
```

**💡 Analogy**: Think of this like connecting to a bank's API. The `connection` is your internet connection, and the `market` is the specific bank branch you're accessing.

---

## Part 2: Fetch User Position (45 minutes)

### Understanding the Data Structure

Before we code, let's understand what we're fetching:

**Real-world analogy**: Imagine checking your bank account. You want to see:
- **Collateral** = Your savings account (what you deposited)
- **Debt** = Your loan balance (what you borrowed)
- **LTV** = How much you've borrowed vs. what you have (loan-to-value ratio)
- **Health Factor** = Your credit score (how safe your position is)

### Get Obligation Data

An "obligation" is Kamino's term for your lending position - think of it as your account statement.

```typescript
// src/lib/position.ts
import { PublicKey } from '@solana/web3.js';
import { KaminoMarket } from '@kamino-finance/klend-sdk';

export interface UserPosition {
  collateralValue: number;
  borrowedValue: number;
  ltv: number;
  healthFactor: number;
  liquidationThreshold: number;
  collaterals: CollateralInfo[];
  debts: DebtInfo[];
}

export interface CollateralInfo {
  asset: string;
  amount: number;
  value: number;
  apy: number;
}

export interface DebtInfo {
  asset: string;
  amount: number;
  value: number;
  apr: number;
}

export async function getUserPosition(
  market: KaminoMarket,
  userPublicKey: PublicKey
): Promise<UserPosition | null> {
  try {
    // Get user's obligation account
    const obligation = await market.getObligation(userPublicKey);
    
    if (!obligation) {
      return null;
    }

    // Parse collaterals
    const collaterals: CollateralInfo[] = obligation.deposits.map(deposit => ({
      asset: deposit.reserveName,
      amount: deposit.amount,
      value: deposit.marketValue,
      apy: deposit.supplyApy,
    }));

    // Parse debts
    const debts: DebtInfo[] = obligation.borrows.map(borrow => ({
      asset: borrow.reserveName,
      amount: borrow.amount,
      value: borrow.marketValue,
      apr: borrow.borrowApr,
    }));

    // Calculate metrics
    const collateralValue = collaterals.reduce((sum, c) => sum + c.value, 0);
    const borrowedValue = debts.reduce((sum, d) => sum + d.value, 0);
    const ltv = borrowedValue / collateralValue;
    const healthFactor = (collateralValue * obligation.liquidationThreshold) / borrowedValue;

    return {
      collateralValue,
      borrowedValue,
      ltv,
      healthFactor,
      liquidationThreshold: obligation.liquidationThreshold,
      collaterals,
      debts,
    };
  } catch (error) {
    console.error('Error fetching position:', error);
    return null;
  }
}
```

---

## Part 3: Calculate Risk Metrics (30 minutes)

### Understanding Risk Levels

Let's use a traffic light analogy:
- 🟢 **Green (Safe)**: Health factor > 1.5 - You're in great shape
- 🟡 **Yellow (Caution)**: Health factor 1.2-1.5 - Pay attention
- 🟠 **Orange (Danger)**: Health factor 1.05-1.2 - Take action soon
- 🔴 **Red (Critical)**: Health factor < 1.05 - Immediate action needed!

### Liquidation Price Calculator

**What is liquidation?** Think of it like a margin call in traditional finance. If your collateral value drops too much relative to your debt, the protocol automatically sells some collateral to repay the loan. This protects lenders but costs you money.

```typescript
// src/lib/risk.ts
export interface RiskMetrics {
  healthFactor: number;
  riskLevel: 'safe' | 'caution' | 'danger' | 'critical';
  liquidationPrice: number;
  liquidationDistance: number;
  recommendedAction: string;
}

export function calculateRiskMetrics(
  position: UserPosition,
  currentPrice: number
): RiskMetrics {
  const { healthFactor, ltv, liquidationThreshold } = position;

  // Determine risk level
  let riskLevel: RiskMetrics['riskLevel'];
  let recommendedAction: string;

  if (healthFactor > 1.5) {
    riskLevel = 'safe';
    recommendedAction = 'Position is healthy. Continue monitoring.';
  } else if (healthFactor > 1.2) {
    riskLevel = 'caution';
    recommendedAction = 'Consider adding collateral to improve health factor.';
  } else if (healthFactor > 1.05) {
    riskLevel = 'danger';
    recommendedAction = 'Add collateral immediately or reduce debt.';
  } else {
    riskLevel = 'critical';
    recommendedAction = 'URGENT: Position at risk of liquidation!';
  }

  // Calculate liquidation price
  // This is the price at which your position would be liquidated
  // Formula: How much can the price drop before you're in trouble?
  const liquidationPrice = currentPrice * (1 - (liquidationThreshold - ltv));

  // Calculate distance to liquidation (as a percentage)
  // Example: If current price is $200 and liquidation is $160, distance is 20%
  const liquidationDistance = ((currentPrice - liquidationPrice) / currentPrice) * 100;

  return {
    healthFactor,
    riskLevel,
    liquidationPrice,
    liquidationDistance,
    recommendedAction,
  };
}
```

---

## Part 4: Build Dashboard UI (45 minutes)

### Design Philosophy

Good dashboards answer three questions at a glance:
1. **What's my status?** (Overview metrics)
2. **Am I in danger?** (Risk alerts)
3. **What are the details?** (Collateral and debt breakdown)

### Position Dashboard Component

This component is like a car dashboard - it shows you speed (position value), fuel (health factor), and warning lights (alerts).

```typescript
// src/components/PositionDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getUserPosition, UserPosition } from '../lib/position';
import { calculateRiskMetrics, RiskMetrics } from '../lib/risk';
import { initializeKamino } from '../lib/kamino';

export function PositionDashboard() {
  const { publicKey } = useWallet();
  const [position, setPosition] = useState<UserPosition | null>(null);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey) {
      loadPosition();
    }
  }, [publicKey]);

  async function loadPosition() {
    if (!publicKey) return;

    setLoading(true);
    try {
      const { market } = await initializeKamino();
      const userPosition = await getUserPosition(market, publicKey);
      
      if (userPosition) {
        setPosition(userPosition);
        
        // Get current SOL price (simplified - use real oracle in production)
        // TODO: Replace with actual price feed from Pyth or Switchboard
        const currentPrice = 200; // Placeholder: $200 per SOL
        const metrics = calculateRiskMetrics(userPosition, currentPrice);
        setRiskMetrics(metrics);
      }
    } catch (error) {
      console.error('Error loading position:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!publicKey) {
    return <div>Please connect your wallet</div>;
  }

  if (loading) {
    return <div>Loading position...</div>;
  }

  if (!position) {
    return <div>No lending position found</div>;
  }

  return (
    <div className="dashboard">
      <h2>Your Kamino Position</h2>
      
      {/* Overview */}
      <div className="overview">
        <div className="metric">
          <label>Collateral Value</label>
          <value>${position.collateralValue.toFixed(2)}</value>
        </div>
        <div className="metric">
          <label>Borrowed Value</label>
          <value>${position.borrowedValue.toFixed(2)}</value>
        </div>
        <div className="metric">
          <label>LTV Ratio</label>
          <value>{(position.ltv * 100).toFixed(2)}%</value>
        </div>
        <div className="metric">
          <label>Health Factor</label>
          <value className={getHealthColor(position.healthFactor)}>
            {position.healthFactor.toFixed(2)}
          </value>
        </div>
      </div>

      {/* Risk Alert */}
      {riskMetrics && (
        <div className={`alert alert-${riskMetrics.riskLevel}`}>
          <h3>Risk Level: {riskMetrics.riskLevel.toUpperCase()}</h3>
          <p>{riskMetrics.recommendedAction}</p>
          <p>Liquidation Price: ${riskMetrics.liquidationPrice.toFixed(2)}</p>
          <p>Distance: {riskMetrics.liquidationDistance.toFixed(2)}%</p>
        </div>
      )}

      {/* Collateral Details */}
      <div className="collaterals">
        <h3>Collateral</h3>
        {position.collaterals.map((col, i) => (
          <div key={i} className="asset-row">
            <span>{col.asset}</span>
            <span>{col.amount.toFixed(4)}</span>
            <span>${col.value.toFixed(2)}</span>
            <span>{col.apy.toFixed(2)}% APY</span>
          </div>
        ))}
      </div>

      {/* Debt Details */}
      <div className="debts">
        <h3>Borrowed</h3>
        {position.debts.map((debt, i) => (
          <div key={i} className="asset-row">
            <span>{debt.asset}</span>
            <span>{debt.amount.toFixed(4)}</span>
            <span>${debt.value.toFixed(2)}</span>
            <span>{debt.apr.toFixed(2)}% APR</span>
          </div>
        ))}
      </div>

      <button onClick={loadPosition}>Refresh</button>
    </div>
  );
}

function getHealthColor(healthFactor: number): string {
  if (healthFactor > 1.5) return 'text-green';
  if (healthFactor > 1.2) return 'text-yellow';
  if (healthFactor > 1.05) return 'text-orange';
  return 'text-red';
}
```

---

## Part 5: Add Alert System (30 minutes)

### Alert Philosophy

Good alerts are like a good friend:
- They warn you early (not when it's too late)
- They're specific (tell you exactly what's wrong)
- They suggest action (not just complain)

### Price Alert Monitor

Think of this as your personal risk assistant that constantly checks if you're in danger.

```typescript
// src/lib/alerts.ts
export interface Alert {
  type: 'info' | 'warning' | 'danger';
  message: string;
  timestamp: number;
}

export function checkAlerts(
  position: UserPosition,
  riskMetrics: RiskMetrics
): Alert[] {
  const alerts: Alert[] = [];

  // Health factor alerts
  // Critical: Like your car's check engine light - stop and fix NOW
  if (riskMetrics.healthFactor < 1.05) {
    alerts.push({
      type: 'danger',
      message: 'CRITICAL: Health factor below 1.05! Add collateral immediately.',
      timestamp: Date.now(),
    });
  } 
  // Warning: Like low fuel - you should refill soon
  else if (riskMetrics.healthFactor < 1.2) {
    alerts.push({
      type: 'warning',
      message: 'WARNING: Health factor below 1.2. Consider adding collateral.',
      timestamp: Date.now(),
    });
  }

  // LTV alerts
  // High LTV means you've borrowed a lot relative to your collateral
  if (position.ltv > 0.75) {
    alerts.push({
      type: 'warning',
      message: 'High LTV ratio. Reduce debt or add collateral.',
      timestamp: Date.now(),
    });
  }

  // Liquidation distance alerts
  // This is like "you're 10% away from the cliff edge"
  if (riskMetrics.liquidationDistance < 10) {
    alerts.push({
      type: 'danger',
      message: `Price is within ${riskMetrics.liquidationDistance.toFixed(1)}% of liquidation!`,
      timestamp: Date.now(),
    });
  }

  return alerts;
}
```

---

## Bonus Challenges

### Challenge 1: Real-Time Monitoring
Add WebSocket price feeds and update health factor in real-time.

**Why this matters**: Prices change every second. Real-time updates help you react faster to market movements.

**Hint**: Use Pyth Network's WebSocket API for live price feeds.

### Challenge 2: Historical Data
Track position history and display charts of LTV and health factor over time.

**Why this matters**: Seeing trends helps you understand if your position is getting safer or riskier over time.

**Hint**: Store snapshots in local storage or a database, then use a charting library like Chart.js.

### Challenge 3: Notifications
Implement browser notifications when health factor drops below threshold.

**Why this matters**: You can't watch the dashboard 24/7. Notifications alert you even when the tab is closed.

**Hint**: Use the Browser Notifications API with permission requests.

### Challenge 4: Multi-Position Support
Support users with multiple lending positions across different markets.

**Why this matters**: Advanced users often have multiple positions for diversification.

**Hint**: Fetch all user obligations and display them in a list or tabs.

---

## Common Pitfalls & Troubleshooting

### Issue 1: "Cannot read property of undefined"
**Cause**: Trying to access position data before it loads.
**Solution**: Always check if data exists before using it (`if (position) { ... }`).

### Issue 2: Health factor calculation returns NaN
**Cause**: Division by zero when borrowed value is 0.
**Solution**: Add a check: `if (borrowedValue === 0) return Infinity;`

### Issue 3: Prices seem wrong
**Cause**: Using stale or incorrect price feeds.
**Solution**: Implement proper oracle integration (Pyth/Switchboard) instead of hardcoded prices.

### Issue 4: Wallet won't connect
**Cause**: Missing wallet adapter configuration.
**Solution**: Ensure you've wrapped your app with `WalletProvider` and included all necessary adapters.

---

## Real-World Example Walkthrough

Let's walk through a complete scenario to see how everything works together:

### Scenario: Alice's Lending Position

**Alice's situation**:
- Deposited: 50 SOL as collateral (worth $10,000 at $200/SOL)
- Borrowed: $6,000 USDC
- Current LTV: 60%
- Health Factor: 1.33

**What the dashboard shows**:
```
Collateral Value: $10,000
Borrowed Value: $6,000
LTV: 60%
Health Factor: 1.33 🟢
Risk Level: SAFE
```

**What happens if SOL drops to $180?**
- New collateral value: $9,000
- LTV increases to: 66.7%
- Health factor drops to: 1.2
- Dashboard shows: 🟡 CAUTION - Consider adding collateral

**What Alice should do**:
1. Add 5 more SOL as collateral, OR
2. Repay $1,000 USDC to reduce debt, OR
3. Monitor closely and be ready to act if price drops further

This is exactly what your dashboard will help users understand and manage!

---

## Testing Checklist

- [ ] Wallet connection works
- [ ] Position data loads correctly
- [ ] Health factor calculates accurately
- [ ] Risk levels display properly
- [ ] Alerts trigger at correct thresholds
- [ ] Liquidation price is accurate
- [ ] UI updates on refresh
- [ ] Error handling works

---

## Solution Hints

<details>
<summary>Hint 1: Fetching Reserves</summary>

```typescript
// Get all reserves with current rates
const reserves = market.getReserves();
reserves.forEach(reserve => {
  console.log(`${reserve.symbol}: ${reserve.supplyApy}% APY`);
});
```
</details>

<details>
<summary>Hint 2: Price Feeds</summary>

```typescript
// Use Pyth or Switchboard for real prices
import { PythHttpClient } from '@pythnetwork/client';

const pythClient = new PythHttpClient(connection, pythProgramId);
const priceData = await pythClient.getData();
const solPrice = priceData.productPrice.get('SOL/USD')?.price;
```
</details>

<details>
<summary>Hint 3: Monitoring Loop</summary>

```typescript
// Check position every minute
setInterval(async () => {
  const position = await getUserPosition(market, publicKey);
  const alerts = checkAlerts(position, riskMetrics);
  
  if (alerts.length > 0) {
    // Send notifications
    alerts.forEach(alert => notifyUser(alert));
  }
}, 60000);
```
</details>

---

## Expected Output

Your dashboard should display:

```
Your Kamino Position
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Collateral Value: $10,000.00
Borrowed Value: $6,000.00
LTV Ratio: 60.00%
Health Factor: 1.33 ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Risk Level: SAFE
Position is healthy. Continue monitoring.
Liquidation Price: $160.00
Distance: 20.00%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Collateral:
SOL     50.0000    $10,000.00    5.2% APY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Borrowed:
USDC    6000.0000  $6,000.00     4.5% APR
```

---

## Next Steps

- Complete [Multiply Strategy Exercise](./multiply-strategy.md)
- Add supply/borrow functionality
- Implement position management (add collateral, repay debt)
- Build mobile version

---

**Difficulty**: Intermediate
**Time**: 2-3 hours
**Skills**: SDK integration, risk calculation, UI development
