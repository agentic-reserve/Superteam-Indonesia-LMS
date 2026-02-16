# LangGraph Multi-Agent Systems

## Introduction

LangGraph is a low-level orchestration framework for building stateful, multi-agent systems. It provides the infrastructure needed to create sophisticated AI agents that can handle complex workflows, maintain state across interactions, and coordinate multiple specialized agents.

This lesson covers how to use LangGraph to build production-ready multi-agent systems for Solana, enabling advanced use cases like portfolio management, automated trading strategies, and complex DeFi operations.

## What is LangGraph?

LangGraph is a framework for building agent systems with:

- **Stateful Workflows**: Agents that remember context across interactions
- **Multi-Agent Coordination**: Multiple specialized agents working together
- **Durable Execution**: Agents that persist through failures and resume automatically
- **Human-in-the-Loop**: Seamless integration of human oversight
- **Comprehensive Memory**: Both short-term and long-term memory management

### Why LangGraph for Solana Agents?

Building Solana agents with LangGraph provides:

1. **Specialization**: Different agents for trading, NFTs, DeFi, etc.
2. **Reliability**: Automatic recovery from network failures
3. **Scalability**: Handle complex multi-step workflows
4. **Observability**: Deep visibility into agent behavior
5. **Production-Ready**: Built for real-world deployment

## Core Concepts

### StateGraph

The foundation of LangGraph is the StateGraph, which defines:

- **Nodes**: Individual agents or processing steps
- **Edges**: Connections between nodes (workflow paths)
- **State**: Shared data that flows through the graph

```python
from langgraph.graph import StateGraph, START
from typing_extensions import TypedDict

class State(TypedDict):
    messages: list
    user_intent: str
    action_result: dict

graph = StateGraph(State)
```

### Nodes

Nodes are functions that process state:

```python
def trading_agent(state: State) -> dict:
    """Specialized agent for trading operations"""
    intent = state["user_intent"]
    
    if "swap" in intent.lower():
        result = execute_swap(intent)
        return {"action_result": result}
    
    return {"action_result": {"error": "Unknown trading action"}}

graph.add_node("trading_agent", trading_agent)
```

### Edges

Edges define workflow paths:

```python
# Simple edge: always go from A to B
graph.add_edge("node_a", "node_b")

# Conditional edge: route based on state
def route_by_intent(state: State) -> str:
    intent = state["user_intent"]
    
    if "trade" in intent:
        return "trading_agent"
    elif "nft" in intent:
        return "nft_agent"
    else:
        return "general_agent"

graph.add_conditional_edges(
    "router",
    route_by_intent,
    {
        "trading_agent": "trading_agent",
        "nft_agent": "nft_agent",
        "general_agent": "general_agent",
    }
)
```

## Building a Multi-Agent System

### Architecture Pattern

```
User Input
    ↓
Manager Agent (Router)
    ↓
    ├─→ Trading Agent → Execute Trade
    ├─→ NFT Agent → Mint NFT
    ├─→ DeFi Agent → Stake/Lend
    └─→ Query Agent → Get Data
    ↓
Response to User
```

### Example: Solana Multi-Agent System

```python
from langgraph.graph import StateGraph, START, END
from typing_extensions import TypedDict
from solana_agent_kit import SolanaAgentKit

class AgentState(TypedDict):
    messages: list
    user_input: str
    intent: str
    action: str
    result: dict
    error: str | None

# Initialize Solana Agent Kit
agent_kit = SolanaAgentKit(wallet, rpc_url, config)

# Manager Agent - Routes to specialized agents
def manager_agent(state: AgentState) -> dict:
    """Analyzes user input and routes to appropriate agent"""
    user_input = state["user_input"]
    
    # Use LLM to determine intent
    intent = analyze_intent(user_input)
    
    if "swap" in intent or "trade" in intent:
        return {"intent": "trading", "action": "route_to_trading"}
    elif "nft" in intent or "mint" in intent:
        return {"intent": "nft", "action": "route_to_nft"}
    elif "stake" in intent or "lend" in intent:
        return {"intent": "defi", "action": "route_to_defi"}
    else:
        return {"intent": "query", "action": "route_to_query"}

# Trading Agent - Handles swaps and trades
def trading_agent(state: AgentState) -> dict:
    """Executes trading operations"""
    try:
        user_input = state["user_input"]
        
        # Parse trading parameters
        params = parse_trade_params(user_input)
        
        # Execute swap
        result = agent_kit.methods.trade(
            params["output_mint"],
            params["amount"],
            params["input_mint"],
            params.get("slippage", 300)
        )
        
        return {
            "result": {
                "success": True,
                "signature": result,
                "message": f"Swap executed successfully"
            }
        }
    except Exception as e:
        return {"error": str(e)}

# NFT Agent - Handles NFT operations
def nft_agent(state: AgentState) -> dict:
    """Executes NFT operations"""
    try:
        user_input = state["user_input"]
        
        # Parse NFT parameters
        params = parse_nft_params(user_input)
        
        # Mint NFT
        result = agent_kit.methods.mintNFT(
            params["collection"],
            params["metadata"]
        )
        
        return {
            "result": {
                "success": True,
                "nft": result,
                "message": "NFT minted successfully"
            }
        }
    except Exception as e:
        return {"error": str(e)}

# DeFi Agent - Handles staking and lending
def defi_agent(state: AgentState) -> dict:
    """Executes DeFi operations"""
    try:
        user_input = state["user_input"]
        
        if "stake" in user_input.lower():
            amount = parse_amount(user_input)
            result = agent_kit.methods.stakeWithJup(amount)
            message = f"Staked {amount} SOL successfully"
        elif "lend" in user_input.lower():
            amount = parse_amount(user_input)
            result = agent_kit.methods.lendAssets(amount)
            message = f"Lent {amount} USDC successfully"
        else:
            raise ValueError("Unknown DeFi operation")
        
        return {
            "result": {
                "success": True,
                "signature": result,
                "message": message
            }
        }
    except Exception as e:
        return {"error": str(e)}

# Query Agent - Handles read operations
def query_agent(state: AgentState) -> dict:
    """Handles balance checks and data queries"""
    try:
        user_input = state["user_input"]
        
        if "balance" in user_input.lower():
            balance = agent_kit.methods.getBalance()
            return {
                "result": {
                    "success": True,
                    "balance": balance,
                    "message": f"Your balance is {balance} SOL"
                }
            }
        elif "price" in user_input.lower():
            token = parse_token(user_input)
            price = agent_kit.methods.fetchPythPrice(token)
            return {
                "result": {
                    "success": True,
                    "price": price,
                    "message": f"Price of {token}: ${price}"
                }
            }
        else:
            raise ValueError("Unknown query")
    except Exception as e:
        return {"error": str(e)}

# Build the graph
graph = StateGraph(AgentState)

# Add nodes
graph.add_node("manager", manager_agent)
graph.add_node("trading", trading_agent)
graph.add_node("nft", nft_agent)
graph.add_node("defi", defi_agent)
graph.add_node("query", query_agent)

# Add edges
graph.add_edge(START, "manager")

# Conditional routing from manager
def route_from_manager(state: AgentState) -> str:
    return state["intent"]

graph.add_conditional_edges(
    "manager",
    route_from_manager,
    {
        "trading": "trading",
        "nft": "nft",
        "defi": "defi",
        "query": "query",
    }
)

# All agents return to END
graph.add_edge("trading", END)
graph.add_edge("nft", END)
graph.add_edge("defi", END)
graph.add_edge("query", END)

# Compile the graph
app = graph.compile()

# Use the agent system
result = app.invoke({
    "user_input": "Swap 1 SOL for USDC",
    "messages": [],
})

print(result["result"])
```

## TypeScript Implementation

LangGraph also supports TypeScript for JavaScript/Node.js environments:

```typescript
import { StateGraph, START, END } from "@langchain/langgraph";
import { SolanaAgentKit } from "solana-agent-kit";

interface AgentState {
  messages: string[];
  userInput: string;
  intent: string;
  result?: any;
  error?: string;
}

// Initialize agent kit
const agentKit = new SolanaAgentKit(wallet, rpcUrl, config);

// Define nodes
const managerAgent = async (state: AgentState) => {
  const intent = await analyzeIntent(state.userInput);
  return { intent };
};

const tradingAgent = async (state: AgentState) => {
  try {
    const params = parseTradeParams(state.userInput);
    const result = await agentKit.methods.trade(
      params.outputMint,
      params.amount,
      params.inputMint,
      params.slippage
    );
    return { result: { success: true, signature: result } };
  } catch (error) {
    return { error: error.message };
  }
};

// Build graph
const graph = new StateGraph<AgentState>({
  channels: {
    messages: { value: (x, y) => x.concat(y) },
    userInput: { value: (x, y) => y ?? x },
    intent: { value: (x, y) => y ?? x },
    result: { value: (x, y) => y ?? x },
    error: { value: (x, y) => y ?? x },
  },
});

// Add nodes
graph.addNode("manager", managerAgent);
graph.addNode("trading", tradingAgent);

// Add edges
graph.addEdge(START, "manager");
graph.addConditionalEdges("manager", (state) => state.intent, {
  trading: "trading",
});
graph.addEdge("trading", END);

// Compile and run
const app = graph.compile();
const result = await app.invoke({
  userInput: "Swap 1 SOL for USDC",
  messages: [],
});
```

## Advanced Features

### Checkpointing and Persistence

LangGraph can save state between runs:

```python
from langgraph.checkpoint.sqlite import SqliteSaver

# Create checkpointer
checkpointer = SqliteSaver.from_conn_string("agent_state.db")

# Compile with checkpointing
app = graph.compile(checkpointer=checkpointer)

# Run with thread ID for persistence
config = {"configurable": {"thread_id": "user_123"}}
result = app.invoke(state, config)

# Resume later with same thread ID
result = app.invoke(new_state, config)
```

### Human-in-the-Loop

Add approval steps for critical operations:

```python
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph import StateGraph

def trading_agent_with_approval(state: AgentState) -> dict:
    """Trading agent that requires approval for large trades"""
    params = parse_trade_params(state["user_input"])
    
    if params["amount"] > 10:  # Large trade
        return {
            "action": "request_approval",
            "pending_trade": params
        }
    else:
        # Execute small trades automatically
        result = execute_trade(params)
        return {"result": result}

# Add interrupt for approval
graph.add_node("trading", trading_agent_with_approval)

# Compile with interrupts
app = graph.compile(
    checkpointer=checkpointer,
    interrupt_before=["trading"]  # Pause before trading
)

# First invocation - pauses at trading node
result = app.invoke(state, config)

# User approves
if user_approves():
    # Resume execution
    result = app.invoke(None, config)
```

### Memory Management

Implement both short-term and long-term memory:

```python
class AgentMemory:
    def __init__(self):
        self.short_term = []  # Recent interactions
        self.long_term = {}   # User preferences, history
    
    def add_interaction(self, user_input, result):
        self.short_term.append({
            "input": user_input,
            "result": result,
            "timestamp": datetime.now()
        })
        
        # Keep only last 10 interactions
        if len(self.short_term) > 10:
            self.short_term.pop(0)
    
    def save_preference(self, key, value):
        self.long_term[key] = value
    
    def get_context(self):
        return {
            "recent": self.short_term,
            "preferences": self.long_term
        }

memory = AgentMemory()

def manager_with_memory(state: AgentState) -> dict:
    # Use memory for context
    context = memory.get_context()
    
    # Analyze with context
    intent = analyze_with_context(state["user_input"], context)
    
    # Save interaction
    memory.add_interaction(state["user_input"], intent)
    
    return {"intent": intent}
```

### Error Handling and Retry

Implement robust error handling:

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10)
)
def trading_agent_with_retry(state: AgentState) -> dict:
    """Trading agent with automatic retry on failure"""
    try:
        params = parse_trade_params(state["user_input"])
        result = agent_kit.methods.trade(
            params["output_mint"],
            params["amount"],
            params["input_mint"],
            params["slippage"]
        )
        return {"result": {"success": True, "signature": result}}
    except NetworkError as e:
        # Retry on network errors
        raise
    except InsufficientBalanceError as e:
        # Don't retry on balance errors
        return {"error": "Insufficient balance"}
    except Exception as e:
        return {"error": str(e)}
```

## Debugging and Observability

### LangSmith Integration

LangGraph integrates with LangSmith for debugging:

```python
import os

# Set LangSmith API key
os.environ["LANGCHAIN_API_KEY"] = "your_api_key"
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = "solana-agents"

# Run agent - traces automatically sent to LangSmith
result = app.invoke(state)
```

LangSmith provides:
- Execution traces
- State transitions
- Performance metrics
- Error tracking

### Visualization

Visualize your graph:

```python
from IPython.display import Image, display

# Generate graph visualization
display(Image(app.get_graph().draw_mermaid_png()))
```

### Logging

Add comprehensive logging:

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def trading_agent(state: AgentState) -> dict:
    logger.info(f"Trading agent invoked with: {state['user_input']}")
    
    try:
        result = execute_trade(state)
        logger.info(f"Trade successful: {result}")
        return {"result": result}
    except Exception as e:
        logger.error(f"Trade failed: {e}")
        return {"error": str(e)}
```

## Production Deployment

### Scaling Considerations

1. **Stateless Nodes**: Design nodes to be stateless where possible
2. **Database Checkpointing**: Use PostgreSQL for production checkpointing
3. **Rate Limiting**: Implement rate limits per user/thread
4. **Monitoring**: Track agent performance and errors
5. **Caching**: Cache frequently accessed data (prices, balances)

### Example Production Setup

```python
from langgraph.checkpoint.postgres import PostgresSaver
import redis

# Production checkpointer
checkpointer = PostgresSaver.from_conn_string(
    os.environ["DATABASE_URL"]
)

# Redis for caching
cache = redis.Redis(
    host=os.environ["REDIS_HOST"],
    port=6379,
    decode_responses=True
)

def cached_price_fetch(token: str) -> float:
    # Check cache first
    cached = cache.get(f"price:{token}")
    if cached:
        return float(cached)
    
    # Fetch from API
    price = agent_kit.methods.fetchPythPrice(token)
    
    # Cache for 60 seconds
    cache.setex(f"price:{token}", 60, str(price))
    
    return price

# Compile for production
app = graph.compile(
    checkpointer=checkpointer,
    interrupt_before=["trading"],  # Require approval
)
```

## Best Practices

1. **Specialize Agents**: Create focused agents for specific domains
2. **Use Checkpointing**: Enable state persistence for reliability
3. **Implement Approvals**: Require human approval for high-value operations
4. **Add Logging**: Comprehensive logging for debugging
5. **Handle Errors**: Graceful error handling with retries
6. **Test Thoroughly**: Test all paths through the graph
7. **Monitor Performance**: Track execution time and success rates
8. **Version Control**: Version your graph definitions
9. **Document Flows**: Document the purpose of each node and edge
10. **Use LangSmith**: Leverage LangSmith for observability

## Example Use Cases

### Portfolio Rebalancing Agent

```python
def portfolio_manager(state: AgentState) -> dict:
    """Analyzes portfolio and rebalances if needed"""
    # Get current holdings
    holdings = get_portfolio_holdings()
    
    # Analyze allocation
    target_allocation = {"SOL": 0.5, "USDC": 0.3, "BTC": 0.2}
    current_allocation = calculate_allocation(holdings)
    
    # Determine rebalancing trades
    trades = calculate_rebalancing_trades(
        current_allocation,
        target_allocation
    )
    
    if trades:
        return {
            "action": "rebalance",
            "trades": trades
        }
    else:
        return {
            "result": {"message": "Portfolio is balanced"}
        }
```

### Automated Trading Strategy

```python
def strategy_agent(state: AgentState) -> dict:
    """Executes trading strategy based on market conditions"""
    # Fetch market data
    price = fetch_current_price("SOL")
    sma_20 = calculate_sma(20)
    sma_50 = calculate_sma(50)
    
    # Simple moving average crossover strategy
    if sma_20 > sma_50 and not state.get("position"):
        # Buy signal
        return {
            "action": "buy",
            "amount": calculate_position_size()
        }
    elif sma_20 < sma_50 and state.get("position"):
        # Sell signal
        return {
            "action": "sell",
            "amount": state["position"]
        }
    else:
        return {"action": "hold"}
```

## Additional Resources

- [LangGraph Documentation](https://docs.langchain.com/oss/python/langgraph/overview)
- [LangGraph Python Repository](https://github.com/langchain-ai/langgraph)
- [LangGraph JS Repository](https://github.com/langchain-ai/langgraphjs)
- [LangSmith](https://www.langchain.com/langsmith)
- [LangChain Academy](https://academy.langchain.com/courses/intro-to-langgraph)

## Source Attribution

This content is extracted and curated from:
- **Repository**: [github.com/langchain-ai/langgraph](https://github.com/langchain-ai/langgraph)
- **Main README**: `langgraph/README.md`
- **Documentation**: LangGraph official documentation
- **Examples**: Solana Agent Kit LangGraph examples

## Next Steps

- [Exercises](../exercises/README.md) - Build your own multi-agent system
- [Agent Basics](../01-agent-basics/README.md) - Review fundamentals
- [Integration Projects](../../integration/README.md) - Build complete applications

---

**Estimated Time:** 3-4 hours

Ready to practice? Continue to [Exercises](../exercises/README.md).
