# Agent Basics

## Introduction

AI agents are autonomous software systems that can perceive their environment, make decisions, and take actions to achieve specific goals. When combined with blockchain capabilities, AI agents can execute transactions, manage assets, and interact with decentralized protocols on behalf of users.

This lesson covers the foundational concepts needed to build effective AI agents for Solana, including architecture patterns, decision-making frameworks, and safety considerations.

## What is an AI Agent?

An AI agent is a system that:

1. **Perceives**: Receives input from users or monitors blockchain state
2. **Reasons**: Uses AI models (like GPT-4, Claude) to understand intent and plan actions
3. **Acts**: Executes blockchain operations through tools and APIs
4. **Learns**: Adapts behavior based on outcomes and feedback

### Agent vs. Traditional Application

| Traditional App | AI Agent |
|----------------|----------|
| Fixed logic and workflows | Dynamic decision-making |
| Explicit user commands | Natural language understanding |
| Predefined actions | Autonomous action selection |
| No learning | Learns from interactions |

## Agent Architecture Patterns

### 1. Single-Agent Architecture

The simplest pattern where one agent handles all tasks:

```
User Input → AI Model → Tool Selection → Blockchain Action → Response
```

**Use Cases:**
- Simple trading bots
- Token transfer assistants
- Price monitoring agents

**Pros:**
- Simple to implement
- Easy to debug
- Low latency

**Cons:**
- Limited scalability
- No specialization
- Single point of failure

### 2. Multi-Agent Architecture

Multiple specialized agents work together:

```
User Input → Manager Agent → Routes to:
                            ├── Trading Agent
                            ├── NFT Agent
                            └── DeFi Agent
```

**Use Cases:**
- Complex portfolio management
- Multi-protocol interactions
- Enterprise-grade systems

**Pros:**
- Specialized expertise
- Parallel processing
- Better error isolation

**Cons:**
- More complex coordination
- Higher latency
- Requires orchestration

### 3. ReAct (Reasoning + Acting) Pattern

Agent alternates between reasoning and acting:

```
1. Thought: "I need to check the price"
2. Action: Call price API
3. Observation: "Price is $100"
4. Thought: "Price is good, I should buy"
5. Action: Execute swap
6. Observation: "Swap successful"
7. Final Answer: "Bought 10 tokens at $100"
```

**Benefits:**
- Transparent decision-making
- Self-correcting behavior
- Easier to debug

## Core Components

### 1. Language Model (LLM)

The "brain" of the agent that understands natural language and makes decisions.

**Popular Options:**
- **OpenAI GPT-4**: Strong reasoning, good for complex tasks
- **Anthropic Claude**: Excellent for safety-critical operations
- **Open-source models**: Llama, Mistral for self-hosted solutions

**Key Considerations:**
- Context window size (how much information the model can process)
- Response latency (speed of decision-making)
- Cost per request
- Safety and alignment

### 2. Tools and Actions

Functions the agent can call to interact with Solana:

```typescript
// Example tool definition
const tools = [
  {
    name: "transfer_tokens",
    description: "Transfer SPL tokens to another wallet",
    parameters: {
      recipient: "string",
      amount: "number",
      mint: "string"
    }
  },
  {
    name: "get_balance",
    description: "Check wallet balance for a token",
    parameters: {
      mint: "string"
    }
  }
];
```

**Tool Design Principles:**
- Clear, descriptive names
- Detailed descriptions for the AI
- Type-safe parameters
- Error handling
- Idempotency where possible

### 3. Memory and State

Agents need to remember context across interactions:

**Short-term Memory:**
- Current conversation history
- Recent actions taken
- Temporary state

**Long-term Memory:**
- User preferences
- Historical transactions
- Learned patterns

**Implementation Options:**
- In-memory (simple, not persistent)
- Database (PostgreSQL, Redis)
- Vector stores (for semantic search)

### 4. Wallet Management

Secure handling of private keys and transaction signing:

```typescript
// Server-side wallet (for autonomous agents)
const wallet = new KeypairWallet(keypair);

// Browser wallet adapter (for user-controlled agents)
const wallet = useWallet(); // From @solana/wallet-adapter-react
```

**Security Best Practices:**
- Never hardcode private keys
- Use environment variables or secure vaults
- Implement spending limits
- Require approval for large transactions
- Use separate wallets for testing

## Decision-Making Framework

### 1. Intent Recognition

Understanding what the user wants:

```
User: "Buy 10 SOL worth of USDC"

Agent Analysis:
- Action: Token swap
- Input token: SOL
- Output token: USDC
- Amount: 10 SOL
- Slippage: Not specified (use default)
```

### 2. Planning

Breaking down complex tasks into steps:

```
Goal: "Stake my SOL for the best yield"

Plan:
1. Check current SOL balance
2. Research staking options (Jupiter, Marinade, etc.)
3. Compare APYs
4. Select best option
5. Execute stake transaction
6. Confirm success
```

### 3. Execution

Carrying out the plan with error handling:

```typescript
async function executeWithRetry(action, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await action();
      return result;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(1000 * Math.pow(2, i)); // Exponential backoff
    }
  }
}
```

### 4. Verification

Confirming the action succeeded:

```typescript
// Wait for transaction confirmation
const signature = await agent.methods.transfer(...);
await connection.confirmTransaction(signature, 'confirmed');

// Verify balance changed
const newBalance = await agent.methods.getBalance(mint);
assert(newBalance === expectedBalance);
```

## Prompt Engineering for Agents

Effective prompts guide agent behavior:

### System Prompt Template

```
You are a Solana blockchain assistant. You help users interact with the Solana blockchain safely and efficiently.

Capabilities:
- Check token balances
- Transfer tokens
- Swap tokens on Jupiter
- Stake SOL
- Mint NFTs

Safety Rules:
1. Always confirm transaction details before execution
2. Warn users about high slippage (>5%)
3. Never execute transactions above 10 SOL without explicit confirmation
4. Explain risks for DeFi operations

Response Format:
- Be concise and clear
- Show transaction details before execution
- Provide transaction signatures after success
- Explain errors in simple terms
```

### Few-Shot Examples

Provide examples of good behavior:

```
User: "Send 1 SOL to ABC123..."
Agent: "I'll transfer 1 SOL to ABC123...
Details:
- Amount: 1 SOL
- Recipient: ABC123...
- Estimated fee: 0.000005 SOL
Confirm? (yes/no)"

User: "yes"
Agent: "Transfer complete! Signature: xyz789..."
```

## Error Handling and Recovery

Agents must handle failures gracefully:

### Common Errors

1. **Insufficient Balance**
```typescript
if (balance < amount) {
  return "Insufficient balance. You have {balance} but need {amount}";
}
```

2. **Network Errors**
```typescript
try {
  await sendTransaction();
} catch (error) {
  if (error.message.includes('timeout')) {
    return "Network timeout. Please try again.";
  }
}
```

3. **Slippage Exceeded**
```typescript
try {
  await swap();
} catch (error) {
  if (error.message.includes('slippage')) {
    return "Price moved too much. Try increasing slippage tolerance.";
  }
}
```

### Recovery Strategies

- **Retry with backoff**: For transient network errors
- **Alternative paths**: Try different DEXs if one fails
- **User notification**: Inform user and ask for guidance
- **Graceful degradation**: Provide partial results if possible

## Safety and Security

### Transaction Validation

Always validate before executing:

```typescript
function validateTransaction(tx) {
  // Check amount is reasonable
  if (tx.amount > MAX_AMOUNT) {
    throw new Error("Amount exceeds safety limit");
  }
  
  // Verify recipient address
  if (!isValidPublicKey(tx.recipient)) {
    throw new Error("Invalid recipient address");
  }
  
  // Check for suspicious patterns
  if (isKnownScamAddress(tx.recipient)) {
    throw new Error("Warning: Recipient flagged as suspicious");
  }
}
```

### Rate Limiting

Prevent abuse and excessive costs:

```typescript
const rateLimiter = {
  transactions: 0,
  resetTime: Date.now() + 3600000, // 1 hour
  
  checkLimit() {
    if (Date.now() > this.resetTime) {
      this.transactions = 0;
      this.resetTime = Date.now() + 3600000;
    }
    
    if (this.transactions >= 100) {
      throw new Error("Rate limit exceeded. Try again later.");
    }
    
    this.transactions++;
  }
};
```

### Audit Logging

Track all agent actions:

```typescript
function logAction(action, details) {
  const log = {
    timestamp: new Date().toISOString(),
    action: action,
    details: details,
    user: getCurrentUser(),
    result: 'pending'
  };
  
  database.insert('audit_log', log);
}
```

## Testing Strategies

### Unit Tests

Test individual components:

```typescript
describe('Agent Tools', () => {
  it('should calculate correct swap amount', () => {
    const result = calculateSwapAmount(100, 0.05);
    expect(result).toBe(95); // 5% slippage
  });
});
```

### Integration Tests

Test agent with real blockchain (devnet):

```typescript
describe('Agent Integration', () => {
  it('should execute swap on devnet', async () => {
    const agent = createTestAgent();
    const result = await agent.methods.trade(
      outputMint,
      amount,
      inputMint
    );
    expect(result).toHaveProperty('signature');
  });
});
```

### Simulation Testing

Test without spending real funds:

```typescript
// Use a simulated connection
const connection = new Connection('http://localhost:8899');
// Test agent behavior without real transactions
```

## Best Practices

1. **Start Simple**: Begin with basic operations before adding complexity
2. **Test Thoroughly**: Use devnet extensively before mainnet
3. **Log Everything**: Maintain detailed logs for debugging
4. **Fail Safely**: Default to asking for confirmation when uncertain
5. **Monitor Continuously**: Track agent behavior in production
6. **Update Regularly**: Keep dependencies and models current
7. **Document Behavior**: Clearly document what your agent can do
8. **Implement Limits**: Set spending and rate limits
9. **User Control**: Allow users to override agent decisions
10. **Privacy First**: Don't log sensitive information

## Common Pitfalls

❌ **Don't:**
- Execute large transactions without confirmation
- Ignore error messages
- Use production keys in development
- Skip input validation
- Assume transactions always succeed

✅ **Do:**
- Validate all inputs
- Implement proper error handling
- Use separate dev/prod environments
- Test edge cases
- Monitor agent behavior

## Example: Simple Trading Agent

Here's a basic agent structure:

```typescript
class SimpleTradingAgent {
  constructor(wallet, rpcUrl) {
    this.agent = new SolanaAgentKit(wallet, rpcUrl);
  }
  
  async handleUserMessage(message) {
    // 1. Parse intent
    const intent = await this.parseIntent(message);
    
    // 2. Validate action
    if (!this.isValidAction(intent)) {
      return "I can't do that. Please try something else.";
    }
    
    // 3. Execute with safety checks
    try {
      const result = await this.executeAction(intent);
      return `Success! Transaction: ${result.signature}`;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
  
  async parseIntent(message) {
    // Use LLM to understand user intent
    // Return structured action
  }
  
  isValidAction(intent) {
    // Validate against safety rules
    return intent.amount < this.maxAmount;
  }
  
  async executeAction(intent) {
    // Execute blockchain operation
    return await this.agent.methods[intent.action](...intent.params);
  }
}
```

## Next Steps

Now that you understand agent basics, continue to:

- [Solana Agent Kit](../02-solana-agent-kit/README.md) - Learn the comprehensive toolkit
- [MCP Integration](../03-mcp-integration/README.md) - Standardized AI-blockchain interfaces
- [LangGraph](../04-langgraph/README.md) - Build multi-agent systems

## Additional Resources

- [LangChain Agent Documentation](https://docs.langchain.com/docs/use-cases/agents)
- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [Anthropic Claude Tool Use](https://docs.anthropic.com/claude/docs/tool-use)
- [ReAct Paper](https://arxiv.org/abs/2210.03629)

## Source Attribution

This content is curated from:
- Solana Agent Kit repository: [github.com/sendaifun/solana-agent-kit](https://github.com/sendaifun/solana-agent-kit)
- LangChain documentation and examples
- Industry best practices for AI agent development

---

**Estimated Time:** 2-3 hours

Ready to build with the Solana Agent Kit? Continue to [Solana Agent Kit](../02-solana-agent-kit/README.md).
