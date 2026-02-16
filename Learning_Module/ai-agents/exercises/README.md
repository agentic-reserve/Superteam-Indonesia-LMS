# AI Agents Exercises

## Overview

These hands-on exercises will help you practice building AI agents for Solana. Each exercise builds on concepts from the lessons and provides practical experience with the Solana Agent Kit, MCP integration, and LangGraph.

Work through these exercises in order, as they increase in complexity and build upon previous concepts.

## Prerequisites

Before starting these exercises, ensure you have:

- Completed the [Agent Basics](../01-agent-basics/README.md) lesson
- Installed the Solana Agent Kit
- Set up a development wallet with devnet SOL
- Basic understanding of TypeScript or Python
- Node.js 16+ or Python 3.9+ installed

## Setup

### Environment Configuration

Create a `.env` file in your exercise directory:

```env
# Solana Configuration
SOLANA_PRIVATE_KEY=your_devnet_private_key
RPC_URL=https://api.devnet.solana.com

# AI API Keys (optional, for advanced exercises)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### Install Dependencies

```bash
# For TypeScript exercises
npm install solana-agent-kit @solana/web3.js

# For Python exercises
pip install solana-agent-kit solana langchain
```

## Exercise 1: Simple Balance Checker Agent

**Difficulty**: Beginner  
**Estimated Time**: 30-45 minutes

### Objective

Build a basic agent that can check wallet balances and respond to natural language queries.

### Requirements

1. Create an agent that accepts text input
2. Parse user intent (check balance for SOL or SPL tokens)
3. Use Solana Agent Kit to fetch balances
4. Return formatted responses

### Validation Criteria

- Agent correctly identifies balance check requests
- Returns accurate balance information
- Handles invalid token addresses gracefully
- Provides clear error messages

### Starter Code

```typescript
import { SolanaAgentKit, KeypairWallet } from "solana-agent-kit";
import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

// TODO: Initialize agent
const keypair = Keypair.fromSecretKey(
  bs58.decode(process.env.SOLANA_PRIVATE_KEY!)
);
const wallet = new KeypairWallet(keypair);
const agent = new SolanaAgentKit(wallet, process.env.RPC_URL!);

async function handleBalanceQuery(userInput: string): Promise<string> {
  // TODO: Parse user input
  // TODO: Determine if checking SOL or SPL token
  // TODO: Fetch balance using agent.methods.getBalance()
  // TODO: Format and return response
  
  return "Balance check not implemented";
}

// Test your agent
handleBalanceQuery("What's my SOL balance?").then(console.log);
handleBalanceQuery("Check my USDC balance").then(console.log);
```

### Hints

- Use string matching or regex to identify balance queries
- For SOL balance, call `getBalance()` without parameters
- For SPL tokens, you'll need the token mint address
- Format numbers with appropriate decimal places

### Solution Reference

See `solutions/exercise-1-balance-checker.ts` for a complete implementation.

---

## Exercise 2: Token Swap Agent

**Difficulty**: Intermediate  
**Estimated Time**: 1-2 hours

### Objective

Build an agent that can execute token swaps based on natural language commands.

### Requirements

1. Parse swap commands (e.g., "Swap 1 SOL for USDC")
2. Extract token symbols and amounts
3. Validate sufficient balance before swapping
4. Execute swap using Jupiter aggregator
5. Confirm transaction and report results

### Validation Criteria

- Correctly parses swap commands with various formats
- Validates balance before attempting swap
- Handles slippage parameter (default to 3%)
- Returns transaction signature on success
- Provides clear error messages for failures

### Starter Code

```typescript
import TokenPlugin from "@solana-agent-kit/plugin-token";

const agent = new SolanaAgentKit(wallet, rpcUrl).use(TokenPlugin);

interface SwapParams {
  inputToken: string;
  outputToken: string;
  amount: number;
  slippage?: number;
}

async function parseSwapCommand(userInput: string): Promise<SwapParams | null> {
  // TODO: Parse user input to extract swap parameters
  // Examples:
  // "Swap 1 SOL for USDC"
  // "Trade 10 USDC to SOL"
  // "Exchange 0.5 SOL for BONK with 5% slippage"
  
  return null;
}

async function executeSwap(params: SwapParams): Promise<string> {
  // TODO: Validate balance
  // TODO: Get token mint addresses
  // TODO: Execute swap using agent.methods.trade()
  // TODO: Return formatted result
  
  return "Swap not implemented";
}

// Test your agent
const testCommands = [
  "Swap 1 SOL for USDC",
  "Trade 10 USDC to SOL",
  "Exchange 0.5 SOL for BONK with 5% slippage"
];

for (const cmd of testCommands) {
  const params = await parseSwapCommand(cmd);
  if (params) {
    const result = await executeSwap(params);
    console.log(result);
  }
}
```

### Hints

- Use a token registry to map symbols to mint addresses
- Check balance before attempting swap
- Default slippage to 300 basis points (3%)
- Wait for transaction confirmation
- Handle common errors (insufficient balance, slippage exceeded)

### Solution Reference

See `solutions/exercise-2-swap-agent.ts` for a complete implementation.

---

## Exercise 3: NFT Minting Agent

**Difficulty**: Intermediate  
**Estimated Time**: 1.5-2 hours

### Objective

Create an agent that can mint NFTs with AI-generated metadata.

### Requirements

1. Accept NFT creation requests with name and description
2. Generate or accept image URL
3. Create metadata JSON
4. Upload metadata to Arweave or IPFS
5. Mint NFT using Metaplex
6. Return NFT mint address

### Validation Criteria

- Creates valid NFT metadata
- Successfully uploads metadata
- Mints NFT on devnet
- Returns NFT mint address
- Handles errors gracefully

### Starter Code

```typescript
import NFTPlugin from "@solana-agent-kit/plugin-nft";

const agent = new SolanaAgentKit(wallet, rpcUrl).use(NFTPlugin);

interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

async function createNFTMetadata(
  name: string,
  description: string,
  imageUrl: string
): Promise<NFTMetadata> {
  // TODO: Create metadata object
  // TODO: Add attributes if desired
  
  return {
    name,
    symbol: "AGNFT",
    description,
    image: imageUrl,
  };
}

async function uploadMetadata(metadata: NFTMetadata): Promise<string> {
  // TODO: Upload to Arweave or IPFS
  // For this exercise, you can use a mock URL
  
  return "https://arweave.net/mock-metadata-uri";
}

async function mintNFT(
  name: string,
  description: string,
  imageUrl: string
): Promise<string> {
  // TODO: Create metadata
  // TODO: Upload metadata
  // TODO: Mint NFT using agent.methods.mintNFT()
  // TODO: Return mint address
  
  return "NFT minting not implemented";
}

// Test your agent
mintNFT(
  "My AI Agent NFT",
  "An NFT created by an AI agent",
  "https://example.com/image.png"
).then(console.log);
```

### Hints

- Use Metaplex metadata standard
- For testing, you can use placeholder image URLs
- Consider using Arweave for permanent storage
- Set royalty to 5% (500 basis points)
- Test on devnet first

### Solution Reference

See `solutions/exercise-3-nft-minting.ts` for a complete implementation.

---

## Exercise 4: Portfolio Manager Agent

**Difficulty**: Advanced  
**Estimated Time**: 2-3 hours

### Objective

Build an agent that monitors a portfolio and suggests rebalancing actions.

### Requirements

1. Fetch all token holdings in wallet
2. Calculate current allocation percentages
3. Compare against target allocation
4. Suggest rebalancing trades if needed
5. Execute rebalancing with user confirmation

### Validation Criteria

- Accurately calculates current portfolio allocation
- Identifies when rebalancing is needed (>5% deviation)
- Suggests optimal trades to reach target allocation
- Executes trades in correct order
- Handles partial fills and errors

### Starter Code

```typescript
import TokenPlugin from "@solana-agent-kit/plugin-token";

const agent = new SolanaAgentKit(wallet, rpcUrl).use(TokenPlugin);

interface TokenHolding {
  mint: string;
  symbol: string;
  balance: number;
  valueUSD: number;
}

interface TargetAllocation {
  [symbol: string]: number; // Percentage (0-1)
}

async function getPortfolioHoldings(): Promise<TokenHolding[]> {
  // TODO: Fetch all token accounts
  // TODO: Get balances for each token
  // TODO: Fetch prices from CoinGecko or Pyth
  // TODO: Calculate USD values
  
  return [];
}

function calculateAllocation(holdings: TokenHolding[]): Record<string, number> {
  // TODO: Calculate total portfolio value
  // TODO: Calculate percentage for each token
  
  return {};
}

function suggestRebalancing(
  current: Record<string, number>,
  target: TargetAllocation
): Array<{ action: "buy" | "sell"; token: string; amount: number }> {
  // TODO: Compare current vs target
  // TODO: Calculate required trades
  // TODO: Optimize trade order
  
  return [];
}

async function executeRebalancing(
  trades: Array<{ action: "buy" | "sell"; token: string; amount: number }>
): Promise<void> {
  // TODO: Execute each trade
  // TODO: Handle errors and retries
  // TODO: Confirm all trades completed
}

// Test your agent
const targetAllocation: TargetAllocation = {
  SOL: 0.5,
  USDC: 0.3,
  BONK: 0.2,
};

const holdings = await getPortfolioHoldings();
const current = calculateAllocation(holdings);
const trades = suggestRebalancing(current, targetAllocation);

console.log("Suggested trades:", trades);

// Execute with confirmation
if (confirm("Execute rebalancing?")) {
  await executeRebalancing(trades);
}
```

### Hints

- Use CoinGecko API for token prices
- Consider transaction fees in calculations
- Implement a threshold (e.g., 5%) before rebalancing
- Execute sells before buys to ensure sufficient funds
- Add slippage tolerance for each trade

### Solution Reference

See `solutions/exercise-4-portfolio-manager.ts` for a complete implementation.

---

## Exercise 5: Multi-Agent System with LangGraph

**Difficulty**: Advanced  
**Estimated Time**: 3-4 hours

### Objective

Build a multi-agent system using LangGraph with specialized agents for different tasks.

### Requirements

1. Create a manager agent that routes requests
2. Implement specialized agents:
   - Trading agent (swaps)
   - Query agent (balances, prices)
   - DeFi agent (staking, lending)
3. Use LangGraph StateGraph for orchestration
4. Implement error handling and retries
5. Add logging and observability

### Validation Criteria

- Manager correctly routes to appropriate agent
- Each specialized agent handles its domain
- State flows correctly through the graph
- Errors are handled gracefully
- System logs all operations

### Starter Code

```typescript
import { StateGraph, START, END } from "@langchain/langgraph";
import { SolanaAgentKit } from "solana-agent-kit";
import TokenPlugin from "@solana-agent-kit/plugin-token";
import DefiPlugin from "@solana-agent-kit/plugin-defi";

interface AgentState {
  messages: string[];
  userInput: string;
  intent: string;
  result?: any;
  error?: string;
}

const agent = new SolanaAgentKit(wallet, rpcUrl)
  .use(TokenPlugin)
  .use(DefiPlugin);

// TODO: Implement manager agent
const managerAgent = async (state: AgentState) => {
  // Analyze user input and determine intent
  return { intent: "unknown" };
};

// TODO: Implement trading agent
const tradingAgent = async (state: AgentState) => {
  // Handle swap operations
  return { result: null };
};

// TODO: Implement query agent
const queryAgent = async (state: AgentState) => {
  // Handle balance and price queries
  return { result: null };
};

// TODO: Implement DeFi agent
const defiAgent = async (state: AgentState) => {
  // Handle staking and lending
  return { result: null };
};

// TODO: Build the graph
const graph = new StateGraph<AgentState>({
  channels: {
    messages: { value: (x, y) => x.concat(y) },
    userInput: { value: (x, y) => y ?? x },
    intent: { value: (x, y) => y ?? x },
    result: { value: (x, y) => y ?? x },
    error: { value: (x, y) => y ?? x },
  },
});

// TODO: Add nodes
// TODO: Add edges
// TODO: Compile graph

// Test your multi-agent system
const testInputs = [
  "What's my SOL balance?",
  "Swap 1 SOL for USDC",
  "Stake 2 SOL",
  "What's the price of SOL?",
];

for (const input of testInputs) {
  const result = await app.invoke({
    userInput: input,
    messages: [],
  });
  console.log(`Input: ${input}`);
  console.log(`Result:`, result.result);
}
```

### Hints

- Use string matching or LLM for intent classification
- Implement conditional routing based on intent
- Add error nodes for handling failures
- Use checkpointing for state persistence
- Add logging at each node

### Solution Reference

See `solutions/exercise-5-multi-agent.ts` for a complete implementation.

---

## Bonus Exercises

### Exercise 6: MCP Server Development

**Objective**: Build a custom MCP server with specialized tools.

**Requirements**:
- Create an MCP server with 3-5 custom tools
- Implement proper input validation
- Add error handling
- Test with Claude Desktop

**Estimated Time**: 2-3 hours

### Exercise 7: Automated Trading Bot

**Objective**: Build a bot that executes a simple trading strategy.

**Requirements**:
- Implement a moving average crossover strategy
- Monitor prices continuously
- Execute trades automatically
- Log all decisions and trades

**Estimated Time**: 3-4 hours

### Exercise 8: NFT Collection Manager

**Objective**: Create an agent that manages an entire NFT collection.

**Requirements**:
- Create collection
- Mint multiple NFTs
- List NFTs for sale
- Track sales and royalties

**Estimated Time**: 2-3 hours

## Testing Your Solutions

### Unit Testing

```typescript
import { describe, it, expect } from "vitest";

describe("Balance Checker Agent", () => {
  it("should parse balance queries", () => {
    const input = "What's my SOL balance?";
    const result = parseBalanceQuery(input);
    expect(result.token).toBe("SOL");
  });

  it("should fetch SOL balance", async () => {
    const balance = await agent.methods.getBalance();
    expect(balance).toBeGreaterThanOrEqual(0);
  });
});
```

### Integration Testing

Test on devnet before mainnet:

```typescript
// Use devnet for testing
const RPC_URL = "https://api.devnet.solana.com";

// Request devnet SOL
await agent.methods.requestFunds();

// Test your agent operations
```

## Troubleshooting

### Common Issues

**"Insufficient balance"**
- Request devnet SOL using `agent.methods.requestFunds()`
- Check you're using the correct network

**"Transaction timeout"**
- Increase timeout in RPC connection
- Try a different RPC endpoint

**"Invalid address"**
- Verify addresses are valid base58 strings
- Check you're using correct network addresses

**"Module not found"**
- Ensure all dependencies are installed
- Check import paths are correct

## Submission Guidelines

For each exercise:

1. Complete the implementation
2. Test thoroughly on devnet
3. Document any challenges faced
4. Note any improvements or extensions made

## Additional Resources

- [Solana Agent Kit Documentation](https://docs.sendai.fun)
- [LangGraph Examples](https://github.com/langchain-ai/langgraph/tree/main/examples)
- [Solana Web3.js Guide](https://solana-labs.github.io/solana-web3.js/)
- [Metaplex Documentation](https://docs.metaplex.com/)

## Next Steps

After completing these exercises:

- Build your own custom agent for a specific use case
- Explore integration with other Solana protocols
- Contribute to the Solana Agent Kit
- Share your agent with the community

---

**Total Estimated Time**: 8-15 hours (depending on exercises completed)

Good luck building your AI agents! 🤖
