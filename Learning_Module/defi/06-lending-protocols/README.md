# Lending Protocols

Welcome to the Lending Protocols section! This module covers decentralized lending and borrowing on Solana, with a focus on Kamino Finance - the largest lending protocol on Solana.

## Learning Objectives

By completing this section, you will:

- Understand overcollateralized lending mechanics
- Learn how to supply assets and earn yield
- Master borrowing against collateral
- Calculate and manage liquidation risk
- Use leveraged yield strategies (Multiply)
- Apply comprehensive risk management frameworks
- Integrate lending protocols into your dApps

## Prerequisites

Before starting this section, ensure you have:

- Completed [Token Economics](../01-token-economics/README.md)
- Understanding of [AMM Basics](../02-amm-basics/README.md)
- Familiarity with DeFi concepts (collateral, liquidity, yield)
- Basic knowledge of risk management

## What is Decentralized Lending?

Decentralized lending protocols enable users to:

1. **Supply Assets**: Deposit tokens to earn interest
2. **Borrow Assets**: Take loans against collateral
3. **Earn Yield**: Generate passive income from supplied assets
4. **Leverage Positions**: Amplify exposure to yield-bearing assets

### Centralized vs Decentralized Lending

| Feature | Centralized (CeFi) | Decentralized (DeFi) |
|---------|-------------------|---------------------|
| **Custody** | Platform holds assets | User maintains control |
| **Transparency** | Opaque operations | Fully transparent onchain |
| **Access** | KYC required | Permissionless |
| **Risk** | Counterparty risk | Smart contract risk |
| **Rates** | Platform-determined | Market-driven |
| **Collateral** | May be undercollateralized | Overcollateralized |

### Key Concepts

**Overcollateralization**:
- Borrowers must deposit collateral worth more than the loan
- Example: Deposit $150 of SOL to borrow $100 of USDC
- Protects lenders from default risk

**Loan-to-Value (LTV) Ratio**:
- Maximum borrowing capacity relative to collateral value
- Example: 75% LTV means you can borrow up to $75 per $100 collateral
- Lower LTV = safer position, less liquidation risk

**Liquidation**:
- Automatic sale of collateral when position becomes risky
- Triggered when debt value approaches collateral value
- Liquidators repay debt and receive collateral + bonus

**Interest Rates**:
- Supply APY: Interest earned by lenders
- Borrow APR: Interest paid by borrowers
- Rates adjust based on utilization (supply/demand)

## Why Lending Protocols Matter

### For Lenders (Suppliers)
- **Passive Income**: Earn yield on idle assets
- **Flexibility**: Withdraw anytime (if liquidity available)
- **Transparency**: See exactly where your assets go
- **Composability**: Use receipt tokens in other protocols

### For Borrowers
- **Leverage**: Amplify exposure without selling assets
- **Liquidity**: Access capital without liquidating positions
- **Tax Efficiency**: Borrowing isn't a taxable event
- **Hedging**: Short assets or manage risk

### For DeFi Ecosystem
- **Capital Efficiency**: Unlock idle capital
- **Liquidity**: Provide liquidity for other protocols
- **Innovation**: Enable new financial products
- **Yield Generation**: Create sustainable returns

## Kamino Finance Overview

Kamino Finance is the largest borrowing and lending protocol on Solana, offering:

### Core Products

1. **Kamino Lend (K-Lend)**
   - Peer-to-pool lending protocol
   - Unified Liquidity Market design
   - Advanced features: eMode, kTokens, asset tiers
   - Sophisticated risk management

2. **Multiply Vaults**
   - One-click leveraged yield strategies
   - Up to 10x leverage on correlated assets
   - Flash loan-based position management
   - Automated risk monitoring

3. **Liquidity Vaults**
   - Automated concentrated liquidity strategies
   - kTokens (fungible LP positions)
   - Auto-compounding
   - Can be used as collateral

### Key Innovations

**Elevation Mode (eMode)**:
- Higher leverage for correlated assets
- Example: 90% LTV for SOL/LST pairs (10x leverage)
- Customized risk parameters per asset group

**kTokens as Collateral**:
- Use CLMM LP positions as collateral
- Fungible representation of liquidity positions
- Enables leveraged liquidity provision

**Poly-linear Interest Curves**:
- 11-point interest rate curve
- More responsive to market conditions
- Better capital efficiency

**Comprehensive Risk Framework**:
- Multi-price oracle system
- LST-specific oracles (depeg protection)
- Dynamic liquidation bonuses
- Auto-deleverage mechanism

## Module Structure

### 1. [Kamino Lend](./kamino-lend.md)
**Estimated Time:** 3-4 hours

Deep dive into Kamino's lending protocol, covering core features and mechanics.

**Topics covered:**
- Unified Liquidity Market
- Elevation Mode (eMode)
- kTokens as collateral
- Asset Tiers (Isolated/General)
- Borrow Factors
- Protected Collateral
- Supplying and borrowing walkthrough
- SDK integration examples

### 2. [Multiply Vaults](./multiply-vaults.md)
**Estimated Time:** 2-3 hours

Learn how to use leveraged yield strategies with Multiply vaults.

**Topics covered:**
- What is leveraged yield
- How Multiply works (flash loans)
- Opening and managing positions
- Risk management
- Unwinding positions
- SOL vs JLP Multiply strategies

### 3. [Risk Management](./risk-management.md)
**Estimated Time:** 2-3 hours

Master the comprehensive risk framework used by Kamino.

**Topics covered:**
- Oracle systems (multi-price, TWAP/EWMA)
- LST oracle pricing
- Liquidation mechanics
- Auto-deleverage mechanism
- Risk assessment framework
- Live risk dashboard

### 4. [Liquidity Vaults](./liquidity-vaults.md)
**Estimated Time:** 1-2 hours

Understand automated liquidity strategies and kTokens.

**Topics covered:**
- Automated CLMM strategies
- kTokens explained
- Using kTokens as collateral
- Auto-compounding
- Integration examples

## Learning Path

We recommend following the sections in order:

```
Kamino Lend → Multiply Vaults → Risk Management → Liquidity Vaults → Exercises
```

However, you can focus on specific topics based on your needs:
- **Lenders**: Focus on Kamino Lend + Risk Management
- **Yield Farmers**: Focus on Multiply Vaults + Risk Management
- **Developers**: Cover all sections for full integration knowledge

## Real-World Use Cases

### Passive Income
- Supply USDC to earn stable yield
- Supply SOL to earn variable yield
- Diversify across multiple assets

### Leveraged Staking
- Use Multiply to leverage LST exposure
- Example: 5x leverage on JitoSOL
- Amplify staking rewards

### Leveraged Market Making
- Use Multiply with JLP (Jupiter LP token)
- Leverage exposure to trading fees
- Manage risk with dynamic monitoring

### Capital Efficiency
- Borrow against SOL to buy more SOL
- Loop positions for maximum leverage
- Use kTokens as collateral while earning LP fees

### Risk Management
- Hedge positions by borrowing
- Manage liquidation risk
- Use risk dashboard for monitoring

## Getting Help

If you get stuck:

1. Review the [Kamino Documentation](https://docs.kamino.finance/)
2. Check the [Risk Dashboard](https://risk.kamino.finance/)
3. Join the [Kamino Discord](https://discord.gg/kamino)
4. Refer to the [Glossary](../../GLOSSARY.md) for term definitions

## Cross-References

### Prerequisites
- **Token Economics**: Understand [Token Standards](../01-token-economics/README.md)
- **AMM Basics**: Review [Liquidity Provision](../02-amm-basics/README.md)

### Related Topics
- **Risk Engines**: Compare with [Percolator Risk](../04-risk-engines/README.md)
- **Security**: Review [Safe Math](../../security/02-safe-math/README.md)
- **Advanced**: Explore [Ephemeral Rollups](../../advanced/01-ephemeral-rollups/README.md) for high-frequency trading

### Integration Projects
- Build a lending dashboard
- Create a risk monitoring tool
- Implement automated position management

## Additional Resources

- [Kamino Documentation](https://docs.kamino.finance/) - Official comprehensive documentation
- [Kamino Litepaper](https://docs.kamino.finance/kamino-lend/litepaper) - Technical overview and design
- [Risk Dashboard](https://risk.kamino.finance/) - Live risk analytics and monitoring
- [Kamino App](https://app.kamino.finance/) - Production application
- [Kamino GitHub](https://github.com/Kamino-Finance) - Open-source repositories
- [Audits](https://docs.kamino.finance/kamino-lend/audits) - Security audit reports (Certora, Offside Labs)

## Key Metrics

**Kamino Finance Stats** (as of February 2026):
- Largest lending protocol on Solana by TVL
- Billions in total value locked
- Thousands of active users
- Multiple security audits completed
- Proven track record since launch

## Next Steps

After completing this section, you can:

- Build lending/borrowing integrations
- Create leveraged yield strategies
- Implement risk management systems
- Develop DeFi dashboards
- Contribute to the Kamino ecosystem

---

**Ready to start?** Head to [Kamino Lend](./kamino-lend.md) to learn about the core lending protocol!

---

## Source Attribution

This section is based on educational materials and documentation from:

- **Kamino Finance Documentation**: https://docs.kamino.finance/
- **Kamino Litepaper**: Technical design and architecture
- **Kamino Risk Dashboard**: https://risk.kamino.finance/

All content is used for educational purposes with proper attribution to the Kamino Finance team.

**Last Updated**: February 17, 2026
