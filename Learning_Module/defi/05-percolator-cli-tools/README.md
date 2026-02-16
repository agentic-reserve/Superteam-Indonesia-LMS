# Percolator CLI Tools

Command-line interface for interacting with the Percolator perpetuals protocol on Solana. This guide covers installation, configuration, and practical usage of the percolator-cli toolset for DeFi development.

## Overview

The percolator-cli provides a comprehensive set of commands for managing perpetual futures markets on Solana. It enables developers to:

- Initialize and manage perpetual futures markets
- Create and manage user trading accounts
- Execute trades with various pricing strategies
- Run keeper operations for market maintenance
- Monitor market state and risk parameters
- Test custom matcher programs

**Important:** This tool is for educational purposes only. The code has not been audited and should not be used in production with real funds.

## Prerequisites

Before using percolator-cli, ensure you have:

- Node.js 20 or higher
- pnpm package manager
- Solana CLI tools installed
- Basic understanding of [Perpetual Futures](../03-perpetual-futures/README.md) concepts
- Familiarity with [Token Operations](../../basics/03-tokens/README.md)

## Installation

### From Source

```bash
# Clone the repository
git clone https://github.com/aeyakovenko/percolator-cli
cd percolator-cli

# Install dependencies
pnpm install

# Build the CLI
pnpm build
```

### Verify Installation

```bash
# Run the CLI to see available commands
node dist/index.js --help
```

## Configuration

### Config File Setup

Create a configuration file at `~/.config/percolator-cli.json`:

```json
{
  "rpcUrl": "https://api.devnet.solana.com",
  "programId": "2SSnp35m7FQ7cRLNKGdW5UzjYFF6RBUNq7d3m5mqNByp",
  "walletPath": "~/.config/solana/id.json"
}
```

**Configuration Options:**

- `rpcUrl`: Solana RPC endpoint (devnet, testnet, or mainnet-beta)
- `programId`: Percolator program public key
- `walletPath`: Path to your Solana keypair file

### Command-Line Flags

Override config file settings with flags:

```bash
--rpc <url>          # Solana RPC endpoint
--program <pubkey>   # Percolator program ID
--wallet <path>      # Path to keypair file
--json               # Output in JSON format
--simulate           # Simulate transaction without sending
```

## Core Concepts

### Market Structure

A percolator market consists of:

- **Slab**: The main market account storing all state
- **Mint**: The collateral token (e.g., wrapped SOL)
- **Vault**: Token account holding all collateral
- **Oracle**: Price feed (Pyth or Chainlink)
- **Users**: Trading accounts with positions and collateral
- **LPs**: Liquidity providers that accept trades

### Account Types

**User Accounts**: Individual traders with collateral and positions
- Identified by index (0-255)
- Derived as PDA from slab + index
- Hold collateral and position data

**LP Accounts**: Liquidity providers that quote prices
- Also identified by index (0-255)
- Can use custom matcher programs for pricing
- Provide liquidity for trades

## Getting Started: Devnet Test Market

A live test market is available on devnet for learning and experimentation.

### Market Details

```
Program:        2SSnp35m7FQ7cRLNKGdW5UzjYFF6RBUNq7d3m5mqNByp
Slab:           A7wQtRT9DhFqYho8wTVqQCDc7kYPTUXGPATiyVbZKVFs
Mint:           So11111111111111111111111111111111111111112 (Wrapped SOL)
Oracle:         99B2bTijsU6f1GCT73HmdR7HCFFjGMBcPZY6jZ96ynrR (Chainlink SOL/USD)
Type:           INVERTED (price = 1/SOL in USD terms)

LP 0 (Passive Matcher - 50bps spread):
  Index:        0
  Matcher:      4HcGCsyjAqnFua5ccuXyt8KRRQzKFbGTJkVChpS7Yfzy
  Collateral:   ~15 SOL

LP 4 (vAMM Matcher - tighter spreads):
  Index:        4
  Collateral:   5 SOL
  Config:       5bps fee + 10bps base spread + impact pricing
```

### Step-by-Step Tutorial

#### 1. Get Devnet SOL

```bash
solana airdrop 2 --url devnet
```

#### 2. Wrap SOL for Collateral

The market uses wrapped SOL as collateral:

```bash
# Create wrapped SOL account and wrap 1 SOL
spl-token wrap 1 --url devnet
```

#### 3. Initialize Your User Account

```bash
# Initialize user account (costs 0.001 SOL fee)
percolator-cli init-user --slab A7wQtRT9DhFqYho8wTVqQCDc7kYPTUXGPATiyVbZKVFs
```

This creates a new user account and returns your user index.

#### 4. Deposit Collateral

```bash
# Deposit 0.05 SOL (50000000 lamports in 9 decimal format)
percolator-cli deposit \
  --slab A7wQtRT9DhFqYho8wTVqQCDc7kYPTUXGPATiyVbZKVFs \
  --user-idx <your-idx> \
  --amount 50000000
```

#### 5. Check Best Prices

Before trading, scan available LPs for the best prices:

```bash
percolator-cli best-price \
  --slab A7wQtRT9DhFqYho8wTVqQCDc7kYPTUXGPATiyVbZKVFs \
  --oracle 99B2bTijsU6f1GCT73HmdR7HCFFjGMBcPZY6jZ96ynrR
```

This shows:
- All LPs with their bid/ask quotes
- Best buy price (lowest ask)
- Best sell price (highest bid)
- Effective spread

#### 6. Execute a Trade

**Important:** Run a keeper crank first to ensure fresh market data:

```bash
# Step 1: Run keeper crank
percolator-cli keeper-crank \
  --slab A7wQtRT9DhFqYho8wTVqQCDc7kYPTUXGPATiyVbZKVFs \
  --oracle 99B2bTijsU6f1GCT73HmdR7HCFFjGMBcPZY6jZ96ynrR

# Step 2: Trade via the 50bps matcher (long 1000 units)
percolator-cli trade-cpi \
  --slab A7wQtRT9DhFqYho8wTVqQCDc7kYPTUXGPATiyVbZKVFs \
  --user-idx <your-idx> \
  --lp-idx 0 \
  --size 1000 \
  --matcher-program 4HcGCsyjAqnFua5ccuXyt8KRRQzKFbGTJkVChpS7Yfzy \
  --matcher-ctx 5n3jT6iy9TK3XNMQarC1sK26zS8ofjLG3dvE9iDEFYhK \
  --oracle 99B2bTijsU6f1GCT73HmdR7HCFFjGMBcPZY6jZ96ynrR
```

**Trade Size Convention:**
- Positive size = long (buy)
- Negative size = short (sell)
- Size is in contract units (not USD or SOL)

## Command Reference

### Market Operations

#### Initialize Market

```bash
percolator-cli init-market \
  --slab <pubkey> \
  --mint <pubkey> \
  --vault <pubkey> \
  --pyth-index <pubkey> \
  --pyth-collateral <pubkey>
```

Creates a new perpetual futures market with specified parameters.

#### View Market State

```bash
# View complete slab state
percolator-cli slab:get --slab <pubkey>

# View slab header only
percolator-cli slab:header --slab <pubkey>

# View market configuration
percolator-cli slab:config --slab <pubkey>

# View nonce (for keeper operations)
percolator-cli slab:nonce --slab <pubkey>
```

### User Operations

#### Initialize User Account

```bash
percolator-cli init-user --slab <pubkey>
```

Creates a new user trading account. Returns the assigned user index.

#### Deposit Collateral

```bash
percolator-cli deposit \
  --slab <pubkey> \
  --user-idx <n> \
  --amount <lamports>
```

Deposits collateral tokens into your trading account. Amount is in lamports (9 decimals for SOL).

#### Withdraw Collateral

```bash
percolator-cli withdraw \
  --slab <pubkey> \
  --user-idx <n> \
  --amount <lamports>
```

Withdraws collateral from your account. Only available if you have no open positions or sufficient excess margin.

#### Trade Without CPI

```bash
percolator-cli trade-nocpi \
  --slab <pubkey> \
  --user-idx <n> \
  --lp-idx <n> \
  --size <i128> \
  --oracle <pubkey>
```

Executes a trade directly without using a matcher program. The LP must accept the trade based on its internal logic.

#### Close Account

```bash
percolator-cli close-account \
  --slab <pubkey> \
  --idx <n>
```

Closes a user account and recovers rent. Account must have zero balance and no open positions.

### LP Operations

#### Initialize LP Account

```bash
percolator-cli init-lp --slab <pubkey>
```

Creates a new liquidity provider account. Returns the assigned LP index.

#### Trade With CPI (Matcher)

```bash
percolator-cli trade-cpi \
  --slab <pubkey> \
  --user-idx <n> \
  --lp-idx <n> \
  --size <i128> \
  --matcher-program <pubkey> \
  --matcher-ctx <pubkey> \
  --oracle <pubkey>
```

Executes a trade using a custom matcher program via Cross-Program Invocation (CPI). The matcher determines the execution price.

### Keeper Operations

#### Keeper Crank

```bash
percolator-cli keeper-crank \
  --slab <pubkey> \
  --oracle <pubkey>
```

Runs the keeper crank which:
- Updates funding rates
- Updates mark prices
- Processes liquidations automatically
- Sweeps through all accounts

**Important:** Risk-increasing trades require a recent keeper crank (within last 200 slots / ~80 seconds).

### Admin Operations

#### Update Admin

```bash
percolator-cli update-admin \
  --slab <pubkey> \
  --new-admin <pubkey>
```

Transfers admin authority to a new address.

#### Set Risk Threshold

```bash
percolator-cli set-risk-threshold \
  --slab <pubkey> \
  --threshold-bps <n>
```

Updates the risk threshold parameter (in basis points).

#### Top Up Insurance Fund

```bash
percolator-cli topup-insurance \
  --slab <pubkey> \
  --amount <lamports>
```

Adds funds to the insurance fund for covering liquidation losses.

#### Update Market Configuration

```bash
percolator-cli update-config \
  --slab <pubkey> \
  --funding-horizon-slots <n> \
  --funding-k-bps <n> \
  --funding-scale-notional-e6 <n> \
  --funding-max-premium-bps <n> \
  --funding-max-bps-per-slot <n> \
  --thresh-floor <n> \
  --thresh-risk-bps <n> \
  --thresh-update-interval-slots <n> \
  --thresh-step-bps <n> \
  --thresh-alpha-bps <n> \
  --thresh-min <n> \
  --thresh-max <n> \
  --thresh-min-step <n>
```

Updates funding rate and threshold parameters.

### Oracle Authority (Testing)

The oracle authority feature allows the admin to push prices directly for testing scenarios.

#### Set Oracle Authority

```bash
# Enable oracle authority
percolator-cli set-oracle-authority \
  --slab <pubkey> \
  --authority <pubkey>

# Disable oracle authority (revert to Chainlink)
percolator-cli set-oracle-authority \
  --slab <pubkey> \
  --authority 11111111111111111111111111111111
```

#### Push Oracle Price

```bash
# Push price in USD (e.g., 143.50 for $143.50)
percolator-cli push-oracle-price \
  --slab <pubkey> \
  --price <usd>
```

**Security Notes:**
- Only admin can set oracle authority
- Only designated authority can push prices
- Zero price (0) is rejected
- Useful for testing flash crashes and stress scenarios

## Advanced Features

### Custom Matcher Programs

Matchers are programs that determine trade pricing. You can create custom matchers with different pricing strategies.

#### Matcher Interface

A matcher program must implement:

1. **Init instruction** (tag `0x02`): Initialize context with LP PDA
2. **Match instruction** (tag `0x00`): Called during `trade-cpi`

#### Security Requirements

**CRITICAL:** The matcher program MUST verify the LP PDA is a signer. The percolator program signs the LP PDA via `invoke_signed` during CPI. If your matcher accepts unsigned calls, attackers can bypass LP authorization.

```rust
// Match instruction - MUST verify LP PDA signature
let lp_pda = &accounts[0];

// Verify LP PDA is a signer (signed by percolator via CPI)
if !lp_pda.is_signer {
    return Err(ProgramError::MissingRequiredSignature);
}
```

#### Matcher Context Layout

The unified matcher context (version 3) uses this layout:

```
Offset  Size  Field                    Description
0       8     magic                    0x5045_5243_4d41_5443 ("PERCMATC")
8       4     version                  3
12      1     kind                     0=Passive, 1=vAMM
13      3     _pad0
16      32    lp_pda                   LP PDA for signature verification
48      4     trading_fee_bps          Fee on fills
52      4     base_spread_bps          Minimum spread
56      4     max_total_bps            Cap on total cost
60      4     impact_k_bps             Impact multiplier
64      16    liquidity_notional_e6    Quoting depth (u128)
80      16    max_fill_abs             Max fill per trade (u128)
96      16    inventory_base           LP inventory state (i128)
112     8     last_oracle_price_e6     Last oracle price
120     8     last_exec_price_e6       Last execution price
128     16    max_inventory_abs        Inventory limit (u128)
144     112   _reserved
```

### Inverted Markets

Inverted markets use `1/price` internally. This is useful for markets like SOL/USD where:

- Collateral is denominated in SOL
- Users take long/short USD positions
- Going long = long USD (profit if SOL drops)
- Going short = short USD (profit if SOL rises)

The devnet test market is inverted, allowing you to practice with this market type.

## Scripts and Automation

The percolator-cli includes several scripts for automation and testing:

### Market Setup

```bash
# Setup a new devnet market with funded LP and insurance
npx tsx scripts/setup-devnet-market.ts
```

### Bots

```bash
# Crank bot - runs continuous keeper cranks (every 5 seconds)
npx tsx scripts/crank-bot.ts

# Random traders bot - simulates market activity
npx tsx scripts/random-traders.ts
```

### Market Analysis

```bash
# Dump full market state to state.json
npx tsx scripts/dump-state.ts

# Dump comprehensive market state to market.json
npx tsx scripts/dump-market.ts

# Check liquidation risk for all accounts
npx tsx scripts/check-liquidation.ts

# Check funding rate status
npx tsx scripts/check-funding.ts

# Display market risk parameters
npx tsx scripts/check-params.ts
```

### User Tools

```bash
# Find user account index by owner pubkey
npx tsx scripts/find-user.ts <slab_pubkey>
npx tsx scripts/find-user.ts <slab_pubkey> <owner_pubkey>
```

### Stress Testing

```bash
# Haircut-ratio system stress test
npx tsx scripts/stress-haircut-system.ts

# Worst-case stress test
npx tsx scripts/stress-worst-case.ts

# Oracle authority stress test
npx tsx scripts/oracle-authority-stress.ts

# Pen-test oracle - comprehensive security testing
npx tsx scripts/pentest-oracle.ts

# Protocol invariant tests
npx tsx scripts/test-price-profit.ts
npx tsx scripts/test-threshold-increase.ts
npx tsx scripts/test-lp-profit-realize.ts
npx tsx scripts/test-profit-withdrawal.ts
```

## Testing

### Unit Tests

```bash
# Run unit tests
pnpm test
```

### Integration Tests

```bash
# Run devnet integration tests
./test-vectors.sh

# Run live trading test with PnL validation
npx tsx tests/t21-live-trading.ts 3           # 3 minutes, normal market
npx tsx tests/t21-live-trading.ts 3 --inverted # 3 minutes, inverted market
```

## Common Workflows

### Workflow 1: Create and Fund a User Account

```bash
# 1. Get devnet SOL
solana airdrop 2 --url devnet

# 2. Wrap SOL
spl-token wrap 1 --url devnet

# 3. Initialize user
percolator-cli init-user --slab <slab-pubkey>

# 4. Deposit collateral
percolator-cli deposit --slab <slab-pubkey> --user-idx <idx> --amount 100000000
```

### Workflow 2: Execute a Trade

```bash
# 1. Check best prices
percolator-cli best-price --slab <slab-pubkey> --oracle <oracle-pubkey>

# 2. Run keeper crank
percolator-cli keeper-crank --slab <slab-pubkey> --oracle <oracle-pubkey>

# 3. Execute trade
percolator-cli trade-cpi \
  --slab <slab-pubkey> \
  --user-idx <idx> \
  --lp-idx 0 \
  --size 1000 \
  --matcher-program <matcher-pubkey> \
  --matcher-ctx <ctx-pubkey> \
  --oracle <oracle-pubkey>
```

### Workflow 3: Monitor Market State

```bash
# 1. View market configuration
percolator-cli slab:config --slab <slab-pubkey>

# 2. Check liquidation risks
npx tsx scripts/check-liquidation.ts

# 3. Check funding rates
npx tsx scripts/check-funding.ts

# 4. Dump full state
npx tsx scripts/dump-state.ts
```

## Troubleshooting

### Common Issues

**Issue: "Recent keeper crank required"**
- Solution: Run `keeper-crank` command before executing trades
- The crank must be within last 200 slots (~80 seconds)

**Issue: "Insufficient collateral"**
- Solution: Deposit more collateral or reduce position size
- Check margin requirements with `slab:config`

**Issue: "Transaction simulation failed"**
- Solution: Use `--simulate` flag to test without sending
- Check account balances and permissions

**Issue: "Invalid oracle price"**
- Solution: Verify oracle pubkey is correct
- Check if oracle authority is set and has recent price

### Debug Mode

Use the `--json` flag for detailed output:

```bash
percolator-cli slab:get --slab <pubkey> --json
```

## Best Practices

1. **Always run keeper crank before trading** to ensure fresh market data
2. **Start with small positions** when learning on devnet
3. **Monitor margin levels** to avoid liquidation
4. **Use simulation mode** (`--simulate`) to test transactions
5. **Check best prices** before executing trades
6. **Keep config file secure** - it contains wallet path
7. **Use devnet for learning** - never test with real funds

## Security Considerations

- **Educational Use Only**: This code has not been audited
- **No Production Use**: Do not use with real funds
- **Matcher Security**: Custom matchers must verify LP PDA signatures
- **Oracle Authority**: Only use for testing, not production
- **Private Keys**: Keep wallet keypairs secure and never share

## Next Steps

After mastering percolator-cli:

- Study the [Risk Engines](../04-risk-engines/README.md) section for deeper understanding
- Explore [Perpetual Futures](../03-perpetual-futures/README.md) concepts
- Build custom matcher programs with different pricing strategies
- Integrate percolator into your own DeFi applications
- Review [Security](../../security/README.md) best practices for DeFi

## Additional Resources

- [Percolator GitHub Repository](https://github.com/aeyakovenko/percolator-cli)
- [Percolator Program](https://github.com/aeyakovenko/percolator-prog)
- [Percolator Match](https://github.com/aeyakovenko/percolator-match)
- [Solana CLI Documentation](https://docs.solana.com/cli)

---

**Source Attribution:**  
This documentation is curated from [percolator-cli](https://github.com/aeyakovenko/percolator-cli) repository.  
Original README: [percolator-cli/README.md](https://github.com/aeyakovenko/percolator-cli/blob/main/README.md)

**License:** Apache 2.0
