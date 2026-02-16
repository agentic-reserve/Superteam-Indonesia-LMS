# Secure DeFi Protocol Resources

## DeFi Fundamentals

### AMM Theory
- [Uniswap V2 Whitepaper](https://uniswap.org/whitepaper.pdf) - Foundational constant product AMM design
- [Automated Market Makers Explained](https://www.paradigm.xyz/2021/04/understanding-automated-market-makers-part-1-price-impact) - Deep dive into AMM mechanics
- [Impermanent Loss Calculator](https://dailydefi.org/tools/impermanent-loss-calculator/) - Understanding IL

### Token Economics
- [Token Economics 101](https://www.coindesk.com/learn/what-is-tokenomics-and-why-is-it-important/) - Introduction to tokenomics
- [Liquidity Mining](https://finematics.com/liquidity-mining-explained/) - Incentive mechanisms

## Related Learning Module Content

### DeFi Topics
- [Token Economics](../../defi/01-token-economics/README.md) - Token design and incentives
- [AMM Basics](../../defi/02-amm-basics/README.md) - Automated market maker fundamentals
- [Perpetual Futures](../../defi/03-perpetual-futures/README.md) - Advanced DeFi concepts from Percolator
- [Risk Engines](../../defi/04-risk-engines/README.md) - Risk management patterns

### Security Topics
- [Common Vulnerabilities](../../security/01-common-vulnerabilities/README.md) - DeFi-specific vulnerabilities
- [Safe Math](../../security/02-safe-math/README.md) - Overflow protection
- [Fuzzing with Trident](../../security/03-fuzzing-with-trident/README.md) - Property-based testing
- [POC Frameworks](../../security/04-poc-frameworks/README.md) - Exploit development

### Basics
- [Tokens](../../basics/03-tokens/README.md) - SPL Token program
- [PDAs](../../basics/04-pdas/README.md) - Program Derived Addresses

### Privacy
- [Confidential Transfers](../../privacy/04-confidential-transfers/README.md) - Private swaps

## Security Resources

### Vulnerability Databases
- [Sealevel Attacks](https://github.com/coral-xyz/sealevel-attacks) - Solana-specific attack vectors
- [DeFi Hack Analysis](https://github.com/SunWeb3Sec/DeFiHackLabs) - Real-world DeFi exploits
- [Rekt News](https://rekt.news/) - DeFi incident reports

### Security Tools
- [Trident Fuzzer](https://github.com/Ackee-Blockchain/trident) - Solana program fuzzing framework
- [Soteria](https://github.com/Auditware/Soteria) - Static analysis for Solana programs
- [Anchor Security](https://www.anchor-lang.com/docs/security) - Anchor security best practices

### Audit Reports
- [Solana Audit Database](https://github.com/0xNazgul/Solana-Audits) - Collection of audit reports
- [Neodyme Audits](https://neodyme.io/en/audits/) - Professional Solana audits
- [OtterSec Audits](https://osec.io/audits) - Security audit examples

## Production DeFi Protocols

### Solana DEXs
- [Raydium](https://raydium.io/) - Leading Solana AMM
  - [Raydium SDK](https://github.com/raydium-io/raydium-sdk) - Integration examples
- [Orca](https://www.orca.so/) - User-friendly AMM with concentrated liquidity
  - [Whirlpools](https://github.com/orca-so/whirlpools) - Concentrated liquidity implementation
- [Jupiter](https://jup.ag/) - Aggregator routing through multiple DEXs

### Reference Implementations
- **Percolator**: Advanced perpetual futures protocol
  - Location: `percolator/percolator/` (workspace root)
  - Key concepts: Risk engines, margin systems, liquidation
- [Serum DEX](https://github.com/project-serum/serum-dex) - Order book DEX (archived but educational)

## Mathematical Resources

### Constant Product Formula
- [x * y = k Explained](https://medium.com/bollinger-investment-group/constant-function-market-makers-defis-zero-to-one-innovation-968f77022159) - Mathematical foundation
- [Price Impact Calculation](https://docs.uniswap.org/contracts/v2/concepts/advanced-topics/pricing) - Understanding price slippage

### Precision and Rounding
- [Fixed-Point Arithmetic](https://en.wikipedia.org/wiki/Fixed-point_arithmetic) - Handling decimals in integers
- [Rounding Modes](https://docs.oracle.com/javase/8/docs/api/java/math/RoundingMode.html) - Different rounding strategies

## Testing Resources

### Property-Based Testing
- [Hypothesis Documentation](https://hypothesis.readthedocs.io/) - Python PBT framework (concepts apply to Rust)
- [QuickCheck](https://github.com/BurntSushi/quickcheck) - Rust PBT library
- [Trident Tutorial](https://ackee.xyz/trident/docs/latest/) - Solana-specific fuzzing

### Test Strategies
- [Testing Smart Contracts](https://blog.trailofbits.com/2018/04/06/how-to-prepare-for-a-security-audit/) - Audit preparation
- [Invariant Testing](https://www.nascent.xyz/idea/youre-writing-down-the-specs-wrong) - Property-based testing for DeFi

## Economic Attack Vectors

### Flash Loans
- [Flash Loans Explained](https://www.coindesk.com/learn/what-are-flash-loans/) - Attack mechanism
- [Flash Loan Attack Examples](https://github.com/OffcierCia/DeFi-Developer-Road-Map#flash-loans-attacks) - Real incidents

### MEV (Maximal Extractable Value)
- [MEV on Solana](https://www.jito.wtf/blog/mev-on-solana/) - Solana-specific MEV
- [Sandwich Attacks](https://www.paradigm.xyz/2020/08/ethereum-is-a-dark-forest) - Front-running strategies

### Price Manipulation
- [Oracle Manipulation](https://samczsun.com/so-you-want-to-use-a-price-oracle/) - Price feed attacks
- [TWAP Oracles](https://docs.uniswap.org/contracts/v2/concepts/core-concepts/oracles) - Time-weighted prices

## Development Tools

### Solana Development
- [Anchor Framework](https://www.anchor-lang.com/) - Solana development framework
- [SPL Token Program](https://spl.solana.com/token) - Token standard
- [Solana Program Library](https://github.com/solana-labs/solana-program-library) - Standard programs

### Testing Tools
- [Bankrun](https://kevinheavey.github.io/solana-bankrun/) - Fast local testing
- [Solana Test Validator](https://docs.solana.com/developing/test-validator) - Local blockchain

### Monitoring Tools
- [Solana Beach](https://solanabeach.io/) - Block explorer
- [Solscan](https://solscan.io/) - Transaction analysis
- [Dune Analytics](https://dune.com/browse/dashboards?q=solana) - On-chain analytics

## Community Resources

### Forums and Discussion
- [Solana Stack Exchange](https://solana.stackexchange.com/questions/tagged/defi) - DeFi Q&A
- [Anchor Discord](https://discord.gg/anchor) - Development support
- [DeFi Security Discord](https://discord.gg/defisecurity) - Security discussions

### Educational Content
- [Solana Cookbook - DeFi](https://solanacookbook.com/gaming/intro.html) - Code examples
- [Figment Learn](https://learn.figment.io/protocols/solana) - Tutorials
- [Solana Bytes](https://www.youtube.com/playlist?list=PLilwLeBwGuK6NsYMPP_BlVkeQgff0NwvU) - Video tutorials

## Advanced Topics

### Concentrated Liquidity
- [Uniswap V3 Whitepaper](https://uniswap.org/whitepaper-v3.pdf) - Concentrated liquidity design
- [Orca Whirlpools](https://orca-so.gitbook.io/orca-developer-portal/whirlpools/overview) - Solana implementation

### Cross-Program Composability
- [CPI Best Practices](https://docs.solana.com/developing/programming-model/calling-between-programs) - Cross-program invocations
- [Program Composability](https://www.anchor-lang.com/docs/cross-program-invocations) - Anchor CPI patterns

### Governance
- [SPL Governance](https://github.com/solana-labs/solana-program-library/tree/master/governance) - On-chain governance
- [Realms](https://realms.today/) - DAO tooling

## Risk Management

### Risk Assessment
- [DeFi Risk Framework](https://www.defisafety.com/app) - Protocol risk scoring
- [Risk Management in DeFi](https://arxiv.org/abs/2101.08778) - Academic paper

### Insurance
- [DeFi Insurance Protocols](https://defillama.com/protocols/Insurance) - Coverage options
- [Risk Mitigation Strategies](https://blog.openzeppelin.com/defi-risk-mitigation/) - Best practices

## Regulatory Considerations

### Compliance
- [DeFi Regulation Overview](https://www.coindesk.com/policy/2021/08/06/defi-regulation-what-you-need-to-know/) - Legal landscape
- [Securities Law](https://www.sec.gov/news/statement/crenshaw-defi-20211109) - US regulatory perspective

## Next Steps

After completing this project:

1. **Build a Frontend**: Create swap UI (see [Full-Stack dApp](../full-stack-dapp/README.md))
2. **Add Advanced Features**: Concentrated liquidity, multiple fee tiers, governance
3. **Professional Audit**: Engage security auditors before mainnet
4. **Explore Other Protocols**: Study [Perpetual Futures](../../defi/03-perpetual-futures/README.md)

## Contributing

Found a helpful resource? Suggestions for improving security are especially welcome!

---

**⚠️ Security Notice**: DeFi protocols handle real value. Always prioritize security, test exhaustively, and get professional audits before mainnet deployment.

**Last Updated**: Based on Solana 1.18.x, Anchor 0.29.x, and current DeFi best practices
