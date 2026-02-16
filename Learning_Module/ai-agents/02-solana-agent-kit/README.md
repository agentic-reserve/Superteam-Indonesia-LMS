# Solana Agent Kit

## Introduction

The Solana Agent Kit is an open-source toolkit that enables AI agents to perform 60+ Solana blockchain operations autonomously. It provides a comprehensive set of tools for token operations, NFT management, DeFi interactions, and more, making it easy to build powerful blockchain-enabled AI agents.

Whether you're building a trading bot, portfolio manager, NFT creator, or any other blockchain agent, the Solana Agent Kit provides the building blocks you need.

## What Can You Build?

With the Solana Agent Kit, you can create agents that:

- **Trade tokens** on Jupiter, Raydium, Orca, and other DEXs
- **Launch new tokens** on Pump.fun or deploy custom SPL tokens
- **Mint and manage NFTs** using Metaplex or 3.Land
- **Interact with DeFi protocols** like Drift, Meteora, and Adrena
- **Stake SOL** on various platforms for yield
- **Send compressed airdrops** using ZK compression
- **Bridge tokens** across chains with Wormhole and deBridge
- **Execute Solana Blinks** for gaming and other applications
- **Manage portfolios** with automated rebalancing
- **Monitor prices** and execute conditional trades

## Architecture Overview

The Solana Agent Kit uses a plugin-based architecture:

```
SolanaAgentKit (Core)
├── TokenPlugin      # Token operations
├── NFTPlugin        # NFT operations
├── DefiPlugin       # DeFi protocols
├── MiscPlugin       # Utilities
└── BlinksPlugin     # Solana Blinks
```

### Core Components

1. **SolanaAgentKit Class**: Main interface for agent operations
2. **Plugins**: Modular functionality for different domains
3. **Wallet Interface**: Secure transaction signing
4. **AI Framework Adapters**: Integration with LangChain, Vercel AI SDK, OpenAI

## Installation

### Core Package

```bash
npm install solana-agent-kit
```

### Plugins

Install the plugins you need:

```bash
# Install all plugins
npm install @solana-agent-kit/plugin-token \
            @solana-agent-kit/plugin-nft \
            @solana-agent-kit/plugin-defi \
            @solana-agent-kit/plugin-misc \
            @solana-agent-kit/plugin-blinks

# Or install selectively based on your needs
npm install @solana-agent-kit/plugin-token  # For token operations
npm install @solana-agent-kit/plugin-defi   # For DeFi protocols
```

## Quick Start

### Basic Setup

```typescript
import { 
  SolanaAgentKit, 
  createVercelAITools, 
  KeypairWallet 
} from "solana-agent-kit";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

// Import plugins
import TokenPlugin from "@solana-agent-kit/plugin-token";
import NFTPlugin from "@solana-agent-kit/plugin-nft";
import DefiPlugin from "@solana-agent-kit/plugin-defi";
import MiscPlugin from "@solana-agent-kit/plugin-misc";

// Create wallet from private key
const keypair = Keypair.fromSecretKey(
  bs58.decode(process.env.SOLANA_PRIVATE_KEY)
);
const wallet = new KeypairWallet(keypair);

// Initialize agent with plugins
const agent = new SolanaAgentKit(
  wallet,
  process.env.RPC_URL,
  {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  }
)
  .use(TokenPlugin)
  .use(NFTPlugin)
  .use(DefiPlugin)
  .use(MiscPlugin);

// Create tools for AI frameworks
const tools = createVercelAITools(agent, agent.actions);
```

### Environment Variables

Create a `.env` file:

```env
SOLANA_PRIVATE_KEY=your_base58_private_key
RPC_URL=https://api.mainnet-beta.solana.com
OPENAI_API_KEY=your_openai_key  # Optional, for AI features
```

## Token Operations

### Deploy a New Token

```typescript
// Deploy SPL token
const result = await agent.methods.deployToken(
  "My AI Token",           // name
  "https://...",           // metadata URI
  "MAI",                   // symbol
  9,                       // decimals
  {
    mintAuthority: null,   // null = deployer
    freezeAuthority: null,
    updateAuthority: undefined,
    isMutable: false
  },
  1000000                  // initial supply
);

console.log("Token Mint:", result.mint.toString());
```

### Deploy Token2022

Token2022 includes advanced features like transfer fees and confidential transfers:

```typescript
const result = await agent.methods.deployToken2022(
  "My Token 2022",
  "https://...",
  "MT22",
  9,
  {
    mintAuthority: null,
    freezeAuthority: null,
    updateAuthority: undefined,
    isMutable: false
  },
  1000000
);
```

### Transfer Tokens

```typescript
import { PublicKey } from "@solana/web3.js";

const signature = await agent.methods.transfer(
  new PublicKey("recipient-address"),
  100,                                    // amount
  new PublicKey("token-mint-address")    // optional, SOL if omitted
);

console.log("Transfer signature:", signature);
```

### Swap Tokens

```typescript
// Swap using Jupiter aggregator
const signature = await agent.methods.trade(
  new PublicKey("output-token-mint"),
  100,                                    // amount to swap
  new PublicKey("input-token-mint"),
  300                                     // slippage in basis points (3%)
);
```

### Check Balance

```typescript
const balance = await agent.methods.getBalance(
  new PublicKey("token-mint-address")
);

console.log("Balance:", balance);
```

## NFT Operations

### Create NFT Collection

```typescript
const collection = await agent.methods.deployCollection({
  name: "My NFT Collection",
  uri: "https://arweave.net/metadata.json",
  royaltyBasisPoints: 500,  // 5% royalty
  creators: [
    {
      address: wallet.publicKey.toString(),
      percentage: 100,
    },
  ],
});

console.log("Collection:", collection);
```

### Mint NFT

```typescript
const nft = await agent.methods.mintNFT(
  collectionMint,
  {
    name: "My NFT #1",
    uri: "https://arweave.net/nft-metadata.json",
    sellerFeeBasisPoints: 500,
  }
);
```

### Create NFT on 3.Land

3.Land automatically lists NFTs for sale:

```typescript
const createItemOptions = {
  itemName: "Cool NFT",
  sellerFee: 500,           // 5%
  itemAmount: 100,          // total supply
  itemSymbol: "COOL",
  itemDescription: "A cool NFT",
  traits: [
    { trait_type: "Background", value: "Blue" },
    { trait_type: "Rarity", value: "Rare" },
  ],
  price: 100000000,         // 0.1 SOL
  mainImageUrl: "https://...",
};

const result = await agent.methods.create3LandSingle(
  {},
  collectionAccount,
  createItemOptions,
  false,                    // mainnet
  false,                    // no liquidity pool
  1000000                   // priority fee
);
```

## DeFi Operations

### Stake SOL

```typescript
// Stake with Jupiter
const signature = await agent.methods.stakeWithJup(
  1  // amount in SOL
);

// Stake with Solayer
const signature = await agent.methods.stakeWithSolayer(
  1  // amount in SOL
);
```

### Lend Assets

```typescript
// Lend USDC on Lulo
const signature = await agent.methods.lendAssets(
  100  // amount of USDC
);
```

### Drift Protocol Integration

Drift is a decentralized perpetuals and spot trading protocol.

#### Create Drift Account

```typescript
const result = await agent.methods.createDriftUserAccount(
  100,      // initial deposit amount
  "USDC"    // token to deposit
);
```

#### Deposit to Drift

```typescript
const { txSig } = await agent.methods.depositToDriftUserAccount(
  100,      // amount
  "USDC"    // token symbol
);
```

#### Open Perpetual Trade

```typescript
const signature = await agent.methods.driftPerpTrade({
  amount: 500,
  symbol: "SOL",
  action: "long",      // or "short"
  type: "limit",       // or "market"
  price: 180           // limit price
});
```

#### Create Drift Vault

```typescript
const signature = await agent.methods.createDriftVault({
  name: "my-vault",
  marketName: "USDC-SPOT",
  redeemPeriod: 1,           // days
  maxTokens: 100000,
  minDepositAmount: 5,
  managementFee: 1,          // 1%
  profitShare: 10,           // 10%
  hurdleRate: 5,             // 5%
  permissioned: false        // public vault
});
```

### Adrena Perpetuals

```typescript
// Open long position
const signature = await agent.methods.openPerpTradeLong({
  price: 300,                                              // max price
  collateralAmount: 10,                                    // collateral
  collateralMint: new PublicKey("jitoSOL-mint"),
  leverage: 50000,                                         // 5x
  tradeMint: new PublicKey("jitoSOL-mint"),
  slippage: 0.3,                                           // 0.3%
});

// Close position
const signature = await agent.methods.closePerpTradeLong({
  price: 200,
  tradeMint: new PublicKey("jitoSOL-mint"),
});
```

## Compressed Airdrops

Send airdrops efficiently using ZK compression:

```typescript
import { PublicKey } from "@solana/web3.js";

// Estimate cost
const cost = getAirdropCostEstimate(
  1000,      // number of recipients
  30_000     // priority fee in lamports
);

console.log("Estimated cost:", cost);

// Send airdrop
const signature = await agent.methods.sendCompressedAirdrop(
  new PublicKey("token-mint"),
  42,                                    // amount per recipient
  9,                                     // decimals
  [
    new PublicKey("recipient1"),
    new PublicKey("recipient2"),
    // ... more recipients
  ],
  30_000                                 // priority fee
);
```

## Cross-Chain Bridging

### Wormhole Bridge

```typescript
// Bridge tokens using Wormhole
const result = await agent.methods.bridgeWithWormhole(
  sourceChain,
  targetChain,
  amount,
  tokenAddress
);
```

### deBridge DLN

```typescript
// 1. Check supported chains
const chains = await agent.methods.getDebridgeSupportedChains();

// 2. Create bridge order
const orderInput = {
  srcChainId: "7565164",                                   // Solana
  srcChainTokenIn: "11111111111111111111111111111111",    // SOL
  srcChainTokenInAmount: "1000000000",                    // 1 SOL
  dstChainId: "1",                                         // Ethereum
  dstChainTokenOut: "0x0000000000000000000000000000000000000000",
  dstChainTokenOutRecipient: "0x..."                      // ETH address
};

const order = await agent.methods.createDebridgeOrder(orderInput);

// 3. Execute bridge
const signature = await agent.methods.executeDebridgeOrder(order.tx.data);

// 4. Check status
const status = await agent.methods.checkDebridgeTransactionStatus(signature);
```

## Price Feeds and Market Data

### Pyth Price Feeds

```typescript
// Get price feed ID
const feedID = await agent.methods.fetchPythPriceFeedID("SOL");

// Fetch current price
const price = await agent.methods.fetchPythPrice(feedID);
console.log("SOL/USD:", price);
```

### CoinGecko Integration

Requires CoinGecko Pro API key:

```typescript
// Get token prices
const prices = await agent.methods.getTokenPriceData([
  "So11111111111111111111111111111111111111112",  // SOL
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"   // USDC
]);

// Get trending tokens
const trending = await agent.methods.getTrendingTokens();

// Get top gainers
const gainers = await agent.methods.getTopGainers("24h", "all");

// Get token info
const info = await agent.methods.getTokenInfo("token-address");
```

## AI Framework Integration

### LangChain

```typescript
import { createLangchainTools } from "solana-agent-kit";

const tools = createLangchainTools(agent, agent.actions);

// Use with LangChain agent
import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createReactAgent } from "langchain/agents";

const llm = new ChatOpenAI({ temperature: 0 });
const executor = await createReactAgent({
  llm,
  tools,
  prompt: systemPrompt,
});
```

### Vercel AI SDK

```typescript
import { createVercelAITools } from "solana-agent-kit";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

const tools = createVercelAITools(agent, agent.actions);

const result = await generateText({
  model: openai("gpt-4"),
  tools,
  prompt: "Swap 1 SOL for USDC",
});
```

### OpenAI Agents SDK

```typescript
import { createOpenAITools } from "solana-agent-kit";

const tools = createOpenAITools(agent, agent.actions);

// Use with OpenAI function calling
```

## Plugin System

### Available Plugins

1. **TokenPlugin** (`@solana-agent-kit/plugin-token`)
   - Token deployment and transfers
   - Jupiter swaps
   - Pump.fun launches
   - Token bridging

2. **NFTPlugin** (`@solana-agent-kit/plugin-nft`)
   - Metaplex NFT operations
   - 3.Land integration
   - Collection management

3. **DefiPlugin** (`@solana-agent-kit/plugin-defi`)
   - Drift perpetuals and vaults
   - Adrena trading
   - Raydium, Orca, Meteora
   - Staking protocols

4. **MiscPlugin** (`@solana-agent-kit/plugin-misc`)
   - CoinGecko data
   - Pyth price feeds
   - Domain registration (SNS, Alldomains)
   - Compressed airdrops

5. **BlinksPlugin** (`@solana-agent-kit/plugin-blinks`)
   - Arcade games
   - Lulo lending
   - Staking blinks

### Using Plugins Selectively

```typescript
// Only use token and DeFi plugins
const agent = new SolanaAgentKit(wallet, rpcUrl, config)
  .use(TokenPlugin)
  .use(DefiPlugin);

// Access methods
await agent.methods.trade(...);
await agent.methods.stakeWithJup(...);
```

## Wallet Management

### Server-Side Wallet

For autonomous agents:

```typescript
import { Keypair } from "@solana/web3.js";
import { KeypairWallet } from "solana-agent-kit";
import bs58 from "bs58";

const keypair = Keypair.fromSecretKey(
  bs58.decode(process.env.SOLANA_PRIVATE_KEY)
);
const wallet = new KeypairWallet(keypair);
```

### Browser Wallet Adapter

For user-controlled agents:

```typescript
import { useWallet } from "@solana/wallet-adapter-react";

function MyComponent() {
  const wallet = useWallet();
  
  const agent = new SolanaAgentKit(
    wallet,
    process.env.NEXT_PUBLIC_RPC_URL,
    config
  );
  
  // Agent uses connected wallet for signing
}
```

## Error Handling

```typescript
try {
  const result = await agent.methods.trade(
    outputMint,
    amount,
    inputMint,
    slippage
  );
  console.log("Success:", result);
} catch (error) {
  if (error.message.includes("insufficient")) {
    console.error("Insufficient balance");
  } else if (error.message.includes("slippage")) {
    console.error("Slippage exceeded, try increasing tolerance");
  } else {
    console.error("Transaction failed:", error.message);
  }
}
```

## Best Practices

1. **Use Environment Variables**: Never hardcode private keys
2. **Test on Devnet**: Always test on devnet before mainnet
3. **Handle Errors**: Implement comprehensive error handling
4. **Set Reasonable Slippage**: 1-5% for most trades
5. **Monitor Gas Fees**: Check priority fees during high congestion
6. **Validate Inputs**: Always validate addresses and amounts
7. **Use Rate Limiting**: Prevent excessive API calls
8. **Log Transactions**: Keep audit logs of all operations
9. **Implement Confirmations**: Wait for transaction confirmation
10. **Stay Updated**: Keep the kit and plugins updated

## Security Considerations

- **Private Key Security**: Use secure key management (environment variables, vaults)
- **Transaction Limits**: Implement spending limits for autonomous agents
- **Approval Workflows**: Require human approval for large transactions
- **Input Validation**: Validate all user inputs and addresses
- **Audit Logging**: Log all agent actions for review
- **Network Selection**: Use appropriate network (devnet/mainnet)
- **Slippage Protection**: Set reasonable slippage limits
- **Scam Detection**: Validate token addresses against known scams

## Examples

The Solana Agent Kit includes numerous examples:

- **Market Making Agent**: Automated market making on Solana DEXs
- **Discord Bot**: Discord bot with blockchain capabilities
- **Telegram Bot**: Telegram bot for Solana operations
- **Next.js Integration**: Full-stack web application
- **LangGraph Multi-Agent**: Complex multi-agent system
- **Embedded Wallets**: Integration with Turnkey, Privy, Crossmint

See the [examples directory](https://github.com/sendaifun/solana-agent-kit/tree/main/examples) for complete implementations.

## Troubleshooting

### Common Issues

**"Insufficient balance"**
- Check wallet has enough SOL for transaction fees
- Verify token balance is sufficient

**"Transaction timeout"**
- Increase RPC timeout settings
- Try a different RPC endpoint
- Increase priority fee during congestion

**"Slippage exceeded"**
- Increase slippage tolerance
- Try again when market is less volatile
- Use limit orders instead of market orders

**"Invalid address"**
- Verify address is a valid base58 string
- Check address is for the correct network (mainnet/devnet)

## Additional Resources

- [Official Documentation](https://docs.sendai.fun)
- [GitHub Repository](https://github.com/sendaifun/solana-agent-kit)
- [Example Projects](https://github.com/sendaifun/solana-agent-kit/tree/main/examples)
- [Contributing Guide](https://github.com/sendaifun/solana-agent-kit/blob/main/CONTRIBUTING.md)
- [Migration Guide (V1 to V2)](https://github.com/sendaifun/solana-agent-kit/blob/main/MIGRATING.md)

## Source Attribution

This content is extracted and curated from:
- **Repository**: [github.com/sendaifun/solana-agent-kit](https://github.com/sendaifun/solana-agent-kit)
- **Main README**: `solana-agent-kit/README.md`
- **Documentation**: `solana-agent-kit/docs/`
- **Examples**: `solana-agent-kit/examples/`

## Next Steps

- [MCP Integration](../03-mcp-integration/README.md) - Learn about Model Context Protocol
- [LangGraph](../04-langgraph/README.md) - Build multi-agent systems
- [Exercises](../exercises/README.md) - Practice with hands-on exercises

---

**Estimated Time:** 4-5 hours

Ready to integrate with Claude? Continue to [MCP Integration](../03-mcp-integration/README.md).
