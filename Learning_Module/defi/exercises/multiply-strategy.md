# Exercise: Multiply Strategy Calculator

Build a calculator that helps users evaluate leveraged yield strategies, calculate Net APY, and assess risk before opening Multiply positions.

## Difficulty: Advanced

## Estimated Time: 2-3 hours

## Learning Objectives

- Calculate Net APY for leveraged positions
- Determine optimal leverage ratios
- Assess liquidation risk
- Compare different strategies
- Build decision-making tools

---

## Prerequisites

- Completed [Multiply Vaults](../06-lending-protocols/multiply-vaults.md)
- Understanding of [Risk Management](../06-lending-protocols/risk-management.md)
- Completed [Kamino Lending Exercise](./kamino-lending.md)
- Advanced TypeScript knowledge

---

## Exercise Overview

Build a calculator that:
1. Accepts user inputs (deposit, leverage, asset)
2. Fetches current APY/APR rates
3. Calculates Net APY
4. Determines liquidation price
5. Compares multiple strategies
6. Provides recommendations

---

## Part 1: Net APY Calculator (45 minutes)

### Core Calculation Logic

```typescript
// src/lib/multiply-calculator.ts
export interface MultiplyInput {
  depositAmount: number;
  leverage: number;
  asset: 'mSOL' | 'JitoSOL' | 'bSOL' | 'JLP';
  yieldApy: number;
  borrowApr: number;
  currentPrice: number;
}

export interface MultiplyOutput {
  exposure: number;
  debt: number;
  netApy: number;
  annualYield: number;
  annualCost: number;
  netAnnualReturn: number;
  liquidationPrice: number;
  liquidationDistance: number;
  ltv: number;
  healthFactor: number;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
}

export function calculateMultiply(input: MultiplyInput): MultiplyOutput {
  const { depositAmount, leverage, yieldApy, borrowApr, currentPrice } = input;

  // Calculate position values
  const exposure = depositAmount * leverage;
  const debt = depositAmount * (leverage - 1);

  // Calculate returns
  const annualYield = exposure * (yieldApy / 100);
  const annualCost = debt * (borrowApr / 100);
  const netAnnualReturn = annualYield - annualCost;
  const netApy = (netAnnualReturn / depositAmount) * 100;

  // Calculate risk metrics
  const liquidationThreshold = getLiquidationThreshold(input.asset);
  const ltv = debt / exposure;
  const healthFactor = (exposure * liquidationThreshold) / debt;
  
  // Calculate liquidation price
  const liquidationPrice = currentPrice * (1 - (liquidationThreshold - ltv) / leverage);
  const liquidationDistance = ((currentPrice - liquidationPrice) / currentPrice) * 100;

  // Determine risk level
  const riskLevel = determineRiskLevel(healthFactor, liquidationDistance);

  return {
    exposure,
    debt,
    netApy,
    annualYield,
    annualCost,
    netAnnualReturn,
    liquidationPrice,
    liquidationDistance,
    ltv,
    healthFactor,
    riskLevel,
  };
}

function getLiquidationThreshold(asset: string): number {
  // Simplified - use actual values from Kamino
  const thresholds: Record<string, number> = {
    'mSOL': 0.93,
    'JitoSOL': 0.93,
    'bSOL': 0.93,
    'JLP': 0.90,
  };
  return thresholds[asset] || 0.80;
}

function determineRiskLevel(
  healthFactor: number,
  liquidationDistance: number
): 'low' | 'medium' | 'high' | 'extreme' {
  if (healthFactor > 1.5 && liquidationDistance > 30) return 'low';
  if (healthFactor > 1.2 && liquidationDistance > 20) return 'medium';
  if (healthFactor > 1.05 && liquidationDistance > 10) return 'high';
  return 'extreme';
}
```

---

## Part 2: Optimal Leverage Finder (45 minutes)

### Find Best Leverage Ratio

```typescript
// src/lib/optimize.ts
export interface OptimizationResult {
  optimalLeverage: number;
  maxNetApy: number;
  safetyScore: number;
  recommendation: string;
}

export function findOptimalLeverage(
  input: Omit<MultiplyInput, 'leverage'>,
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
): OptimizationResult {
  const results: Array<{ leverage: number; netApy: number; risk: number }> = [];

  // Test leverage from 1x to 10x
  for (let leverage = 1; leverage <= 10; leverage += 0.5) {
    const output = calculateMultiply({ ...input, leverage });
    
    // Calculate risk score (0-100, lower is safer)
    const riskScore = calculateRiskScore(output);
    
    // Only consider if Net APY is positive
    if (output.netApy > 0) {
      results.push({
        leverage,
        netApy: output.netApy,
        risk: riskScore,
      });
    }
  }

  // Filter by risk tolerance
  const maxRisk = getMaxRisk(riskTolerance);
  const safeResults = results.filter(r => r.risk <= maxRisk);

  if (safeResults.length === 0) {
    return {
      optimalLeverage: 1,
      maxNetApy: 0,
      safetyScore: 100,
      recommendation: 'No safe leverage found. Consider not using Multiply.',
    };
  }

  // Find leverage with highest Net APY within risk tolerance
  const optimal = safeResults.reduce((best, current) =>
    current.netApy > best.netApy ? current : best
  );

  return {
    optimalLeverage: optimal.leverage,
    maxNetApy: optimal.netApy,
    safetyScore: 100 - optimal.risk,
    recommendation: getRecommendation(optimal.leverage, optimal.netApy, optimal.risk),
  };
}

function calculateRiskScore(output: MultiplyOutput): number {
  // Combine multiple risk factors
  const healthScore = Math.max(0, 100 - (output.healthFactor - 1) * 100);
  const distanceScore = Math.max(0, 100 - output.liquidationDistance);
  const ltvScore = output.ltv * 100;

  return (healthScore + distanceScore + ltvScore) / 3;
}

function getMaxRisk(tolerance: string): number {
  const limits = {
    conservative: 30,
    moderate: 50,
    aggressive: 70,
  };
  return limits[tolerance as keyof typeof limits] || 30;
}

function getRecommendation(leverage: number, netApy: number, risk: number): string {
  if (leverage <= 3) {
    return `Conservative ${leverage}x leverage provides ${netApy.toFixed(1)}% Net APY with low risk.`;
  } else if (leverage <= 6) {
    return `Moderate ${leverage}x leverage offers ${netApy.toFixed(1)}% Net APY with balanced risk.`;
  } else {
    return `Aggressive ${leverage}x leverage yields ${netApy.toFixed(1)}% Net APY but carries high risk.`;
  }
}
```

---

## Part 3: Strategy Comparison (30 minutes)

### Compare Multiple Strategies

```typescript
// src/lib/compare.ts
export interface StrategyComparison {
  strategies: StrategyResult[];
  bestForYield: StrategyResult;
  bestForSafety: StrategyResult;
  bestBalanced: StrategyResult;
}

export interface StrategyResult {
  name: string;
  asset: string;
  leverage: number;
  netApy: number;
  riskLevel: string;
  liquidationDistance: number;
  score: number;
}

export function compareStrategies(
  depositAmount: number,
  strategies: Array<{ asset: string; yieldApy: number; borrowApr: number; price: number }>
): StrategyComparison {
  const results: StrategyResult[] = [];

  strategies.forEach(strategy => {
    // Test multiple leverage levels
    for (let leverage = 2; leverage <= 10; leverage += 2) {
      const output = calculateMultiply({
        depositAmount,
        leverage,
        asset: strategy.asset as any,
        yieldApy: strategy.yieldApy,
        borrowApr: strategy.borrowApr,
        currentPrice: strategy.price,
      });

      if (output.netApy > 0) {
        // Calculate overall score (balance of yield and safety)
        const yieldScore = output.netApy;
        const safetyScore = output.liquidationDistance;
        const score = (yieldScore + safetyScore) / 2;

        results.push({
          name: `${strategy.asset} ${leverage}x`,
          asset: strategy.asset,
          leverage,
          netApy: output.netApy,
          riskLevel: output.riskLevel,
          liquidationDistance: output.liquidationDistance,
          score,
        });
      }
    }
  });

  // Find best strategies
  const bestForYield = results.reduce((best, current) =>
    current.netApy > best.netApy ? current : best
  );

  const bestForSafety = results.reduce((best, current) =>
    current.liquidationDistance > best.liquidationDistance ? current : best
  );

  const bestBalanced = results.reduce((best, current) =>
    current.score > best.score ? current : best
  );

  return {
    strategies: results.sort((a, b) => b.score - a.score),
    bestForYield,
    bestForSafety,
    bestBalanced,
  };
}
```

---

## Part 4: Interactive Calculator UI (45 minutes)

### Build Calculator Component

```typescript
// src/components/MultiplyCalculator.tsx
import React, { useState, useEffect } from 'react';
import { calculateMultiply, MultiplyInput, MultiplyOutput } from '../lib/multiply-calculator';
import { findOptimalLeverage, OptimizationResult } from '../lib/optimize';

export function MultiplyCalculator() {
  const [input, setInput] = useState<MultiplyInput>({
    depositAmount: 10000,
    leverage: 5,
    asset: 'mSOL',
    yieldApy: 7,
    borrowApr: 4,
    currentPrice: 200,
  });

  const [output, setOutput] = useState<MultiplyOutput | null>(null);
  const [optimal, setOptimal] = useState<OptimizationResult | null>(null);
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');

  useEffect(() => {
    calculate();
  }, [input]);

  function calculate() {
    const result = calculateMultiply(input);
    setOutput(result);

    const optimalResult = findOptimalLeverage(
      {
        depositAmount: input.depositAmount,
        asset: input.asset,
        yieldApy: input.yieldApy,
        borrowApr: input.borrowApr,
        currentPrice: input.currentPrice,
      },
      riskTolerance
    );
    setOptimal(optimalResult);
  }

  return (
    <div className="calculator">
      <h2>Multiply Strategy Calculator</h2>

      {/* Inputs */}
      <div className="inputs">
        <div className="input-group">
          <label>Deposit Amount ($)</label>
          <input
            type="number"
            value={input.depositAmount}
            onChange={e => setInput({ ...input, depositAmount: Number(e.target.value) })}
          />
        </div>

        <div className="input-group">
          <label>Asset</label>
          <select
            value={input.asset}
            onChange={e => setInput({ ...input, asset: e.target.value as any })}
          >
            <option value="mSOL">mSOL</option>
            <option value="JitoSOL">JitoSOL</option>
            <option value="bSOL">bSOL</option>
            <option value="JLP">JLP</option>
          </select>
        </div>

        <div className="input-group">
          <label>Leverage (1-10x)</label>
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={input.leverage}
            onChange={e => setInput({ ...input, leverage: Number(e.target.value) })}
          />
          <span>{input.leverage}x</span>
        </div>

        <div className="input-group">
          <label>Yield APY (%)</label>
          <input
            type="number"
            step="0.1"
            value={input.yieldApy}
            onChange={e => setInput({ ...input, yieldApy: Number(e.target.value) })}
          />
        </div>

        <div className="input-group">
          <label>Borrow APR (%)</label>
          <input
            type="number"
            step="0.1"
            value={input.borrowApr}
            onChange={e => setInput({ ...input, borrowApr: Number(e.target.value) })}
          />
        </div>

        <div className="input-group">
          <label>Current Price ($)</label>
          <input
            type="number"
            value={input.currentPrice}
            onChange={e => setInput({ ...input, currentPrice: Number(e.target.value) })}
          />
        </div>

        <div className="input-group">
          <label>Risk Tolerance</label>
          <select
            value={riskTolerance}
            onChange={e => setRiskTolerance(e.target.value as any)}
          >
            <option value="conservative">Conservative</option>
            <option value="moderate">Moderate</option>
            <option value="aggressive">Aggressive</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {output && (
        <div className="results">
          <h3>Position Details</h3>
          <div className="metrics">
            <div className="metric">
              <label>Exposure</label>
              <value>${output.exposure.toLocaleString()}</value>
            </div>
            <div className="metric">
              <label>Debt</label>
              <value>${output.debt.toLocaleString()}</value>
            </div>
            <div className="metric">
              <label>Net APY</label>
              <value className={output.netApy > 0 ? 'positive' : 'negative'}>
                {output.netApy.toFixed(2)}%
              </value>
            </div>
            <div className="metric">
              <label>Annual Return</label>
              <value>${output.netAnnualReturn.toLocaleString()}</value>
            </div>
          </div>

          <h3>Risk Metrics</h3>
          <div className="metrics">
            <div className="metric">
              <label>Health Factor</label>
              <value className={getRiskColor(output.healthFactor)}>
                {output.healthFactor.toFixed(2)}
              </value>
            </div>
            <div className="metric">
              <label>LTV</label>
              <value>{(output.ltv * 100).toFixed(2)}%</value>
            </div>
            <div className="metric">
              <label>Liquidation Price</label>
              <value>${output.liquidationPrice.toFixed(2)}</value>
            </div>
            <div className="metric">
              <label>Liquidation Distance</label>
              <value>{output.liquidationDistance.toFixed(2)}%</value>
            </div>
          </div>

          <div className={`risk-alert risk-${output.riskLevel}`}>
            Risk Level: {output.riskLevel.toUpperCase()}
          </div>
        </div>
      )}

      {/* Optimization */}
      {optimal && (
        <div className="optimization">
          <h3>Optimal Strategy</h3>
          <p><strong>Recommended Leverage:</strong> {optimal.optimalLeverage}x</p>
          <p><strong>Expected Net APY:</strong> {optimal.maxNetApy.toFixed(2)}%</p>
          <p><strong>Safety Score:</strong> {optimal.safetyScore.toFixed(0)}/100</p>
          <p className="recommendation">{optimal.recommendation}</p>
        </div>
      )}
    </div>
  );
}

function getRiskColor(healthFactor: number): string {
  if (healthFactor > 1.5) return 'text-green';
  if (healthFactor > 1.2) return 'text-yellow';
  if (healthFactor > 1.05) return 'text-orange';
  return 'text-red';
}
```

---

## Bonus Challenges

### Challenge 1: Historical Simulation
Simulate strategy performance using historical price data.

### Challenge 2: Monte Carlo Analysis
Run Monte Carlo simulations to estimate probability of liquidation.

### Challenge 3: Multi-Asset Portfolio
Calculate optimal allocation across multiple Multiply strategies.

### Challenge 4: Auto-Rebalancing
Suggest when to adjust leverage based on market conditions.

---

## Testing Scenarios

Test your calculator with these scenarios:

### Scenario 1: Conservative mSOL
```
Deposit: $10,000
Asset: mSOL
Leverage: 3x
Yield APY: 7%
Borrow APR: 4%
Price: $200

Expected Net APY: ~13%
Risk Level: Low
```

### Scenario 2: Aggressive JLP
```
Deposit: $10,000
Asset: JLP
Leverage: 5x
Yield APY: 50%
Borrow APR: 8%
Price: $1

Expected Net APY: ~218%
Risk Level: High
```

### Scenario 3: Negative Net APY
```
Deposit: $10,000
Asset: mSOL
Leverage: 5x
Yield APY: 5%
Borrow APR: 8%
Price: $200

Expected Net APY: Negative
Recommendation: Don't open position
```

---

## Expected Output

Your calculator should display:

```
Multiply Strategy Calculator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Position Details:
Exposure: $50,000
Debt: $40,000
Net APY: 19.00%
Annual Return: $1,900

Risk Metrics:
Health Factor: 1.16 ⚠️
LTV: 80.00%
Liquidation Price: $172.00
Liquidation Distance: 14.00%

Risk Level: HIGH

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Optimal Strategy:
Recommended Leverage: 3.5x
Expected Net APY: 16.50%
Safety Score: 75/100

Moderate 3.5x leverage offers 16.5% Net APY 
with balanced risk.
```

---

## Solution Hints

<details>
<summary>Hint 1: Fetching Live Rates</summary>

```typescript
// Fetch current APY/APR from Kamino
const reserve = await market.getReserve('mSOL');
const yieldApy = reserve.supplyApy;
const borrowApr = reserve.borrowApr;
```
</details>

<details>
<summary>Hint 2: Price Simulation</summary>

```typescript
// Simulate price changes
function simulatePriceChange(currentPrice: number, changePercent: number) {
  const newPrice = currentPrice * (1 + changePercent / 100);
  const newOutput = calculateMultiply({ ...input, currentPrice: newPrice });
  return newOutput;
}
```
</details>

<details>
<summary>Hint 3: Break-Even Analysis</summary>

```typescript
// Find break-even borrow rate
function findBreakEvenRate(input: MultiplyInput): number {
  // Net APY = 0 when:
  // (Yield APY × Leverage) = (Borrow APR × (Leverage - 1))
  // Borrow APR = (Yield APY × Leverage) / (Leverage - 1)
  
  return (input.yieldApy * input.leverage) / (input.leverage - 1);
}
```
</details>

---

## Next Steps

- Integrate with live Kamino data
- Add historical performance charts
- Build position tracking
- Implement automated alerts
- Create mobile version

---

**Difficulty**: Advanced
**Time**: 2-3 hours
**Skills**: Financial calculations, optimization, risk assessment
