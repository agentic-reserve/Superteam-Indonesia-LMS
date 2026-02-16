# Model Context Protocol (MCP) Integration

## Introduction

The Model Context Protocol (MCP) is a standardized interface for connecting AI models to external tools and data sources. For Solana development, MCP enables AI assistants like Claude to interact with the blockchain through a well-defined protocol, making blockchain operations accessible through natural language.

This lesson covers how to use and build MCP servers for Solana, enabling seamless integration between AI models and blockchain functionality.

## What is MCP?

MCP provides a standard way for AI models to:

- **Discover available tools**: AI models can query what blockchain operations are available
- **Understand tool schemas**: Each tool has a clear definition of inputs and outputs
- **Execute operations**: AI models can call tools with validated parameters
- **Handle responses**: Structured responses enable the AI to understand results

### MCP Architecture

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│   Claude    │ ◄─MCP──►│ MCP Server  │ ◄──────►│   Solana     │
│  (AI Model) │         │  (Tools)    │         │  Blockchain  │
└─────────────┘         └─────────────┘         └──────────────┘
```

**Components:**
- **Client**: AI model (Claude, GPT-4, etc.)
- **Server**: Implements MCP protocol and provides tools
- **Tools**: Individual blockchain operations (transfer, swap, etc.)

## Solana MCP Server

The Solana Agent Kit provides an MCP server that exposes blockchain operations to AI models.

### Features

- 60+ Solana operations accessible through MCP
- Standardized tool definitions
- Type-safe parameter validation
- Integration with Claude Desktop
- Support for custom tool development

### Available Tools

The Solana MCP server provides tools for:

- **Wallet Operations**: Get address, check balance
- **Token Operations**: Deploy, transfer, swap tokens
- **NFT Operations**: Mint, manage NFTs
- **DeFi Operations**: Stake, lend, trade
- **Price Data**: Fetch prices from Pyth, CoinGecko
- **Domain Services**: Resolve SNS domains
- **Network Info**: Get TPS, request devnet funds

## Installation

### Option 1: Install from npm (Recommended)

```bash
# Install globally
npm install -g solana-mcp

# Or install locally
npm install solana-mcp
```

### Option 2: Quick Install Script

```bash
# Download and run installation script
curl -fsSL https://raw.githubusercontent.com/sendaifun/solana-mcp/main/scripts/install.sh -o solana-mcp-install.sh

chmod +x solana-mcp-install.sh && ./solana-mcp-install.sh --backup
```

This interactive script will:
- Set up Node.js if needed
- Configure your Solana credentials
- Set up Claude Desktop integration

### Option 3: Build from Source

```bash
git clone https://github.com/sendaifun/solana-mcp
cd solana-mcp
pnpm install
pnpm run build
```

## Configuration

### Environment Setup

Create a `.env` file with your credentials:

```env
# Required
SOLANA_PRIVATE_KEY=your_base58_private_key
RPC_URL=https://api.mainnet-beta.solana.com

# Optional
OPENAI_API_KEY=your_openai_key
```

**Security Note**: Never commit your `.env` file to version control!

### Claude Desktop Integration

To use the MCP server with Claude Desktop:

1. **Locate the configuration file**:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. **Add the MCP server configuration**:

If installed via npm:
```json
{
  "mcpServers": {
    "solana-mcp": {
      "command": "npx",
      "args": ["solana-mcp"],
      "env": {
        "RPC_URL": "https://api.mainnet-beta.solana.com",
        "SOLANA_PRIVATE_KEY": "your_private_key_here",
        "OPENAI_API_KEY": "your_openai_key"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

If built from source:
```json
{
  "mcpServers": {
    "solana-mcp": {
      "command": "node",
      "args": ["/path/to/solana-mcp/build/index.js"],
      "env": {
        "RPC_URL": "https://api.mainnet-beta.solana.com",
        "SOLANA_PRIVATE_KEY": "your_private_key_here"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

3. **Restart Claude Desktop** for changes to take effect

### Configuration Options

- **command**: How to run the MCP server
- **args**: Arguments passed to the command
- **env**: Environment variables (credentials, API keys)
- **disabled**: Set to `true` to temporarily disable
- **autoApprove**: List of tools that don't require confirmation

## Using MCP with Claude

Once configured, you can interact with Solana through natural language:

### Example Conversations

**Check Balance:**
```
You: What's my SOL balance?
Claude: Let me check your balance...
[Uses GET_BALANCE tool]
Your current SOL balance is 5.23 SOL.
```

**Transfer Tokens:**
```
You: Send 1 SOL to ABC123...
Claude: I'll transfer 1 SOL to ABC123...
[Uses TRANSFER tool]
Transfer complete! Transaction signature: xyz789...
```

**Swap Tokens:**
```
You: Swap 10 USDC for SOL
Claude: I'll execute a swap of 10 USDC for SOL...
[Uses TRADE tool]
Swap successful! You received 0.05 SOL.
Transaction: abc456...
```

**Deploy Token:**
```
You: Create a new token called "MyToken" with symbol "MTK"
Claude: I'll deploy a new SPL token...
[Uses DEPLOY_TOKEN tool]
Token deployed successfully!
Mint address: DEF789...
```

## MCP Tool Definitions

Each MCP tool has a structured definition:

### Example: Transfer Tool

```typescript
{
  name: "TRANSFER",
  description: "Transfer SOL or SPL tokens to another wallet",
  inputSchema: {
    type: "object",
    properties: {
      to: {
        type: "string",
        description: "Recipient wallet address (base58)"
      },
      amount: {
        type: "number",
        description: "Amount to transfer"
      },
      mint: {
        type: "string",
        description: "Token mint address (optional, SOL if omitted)"
      }
    },
    required: ["to", "amount"]
  }
}
```

### Tool Schema Components

- **name**: Unique identifier for the tool
- **description**: What the tool does (helps AI understand when to use it)
- **inputSchema**: JSON Schema defining required and optional parameters
- **properties**: Individual parameter definitions with types and descriptions
- **required**: List of mandatory parameters

## Building Custom MCP Servers

You can create custom MCP servers for specialized functionality:

### Basic MCP Server Structure

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Create server
const server = new Server(
  {
    name: "my-solana-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "my_custom_tool",
        description: "Does something custom",
        inputSchema: {
          type: "object",
          properties: {
            param1: {
              type: "string",
              description: "First parameter",
            },
          },
          required: ["param1"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "my_custom_tool") {
    // Implement tool logic
    const result = await doSomething(args.param1);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Custom Tool Example: Price Alert

```typescript
// Tool definition
{
  name: "SET_PRICE_ALERT",
  description: "Set an alert when a token reaches a target price",
  inputSchema: {
    type: "object",
    properties: {
      mint: {
        type: "string",
        description: "Token mint address"
      },
      targetPrice: {
        type: "number",
        description: "Target price in USD"
      },
      condition: {
        type: "string",
        enum: ["above", "below"],
        description: "Alert when price goes above or below target"
      }
    },
    required: ["mint", "targetPrice", "condition"]
  }
}

// Tool implementation
async function setPriceAlert(mint, targetPrice, condition) {
  // Store alert in database
  await db.alerts.insert({
    mint,
    targetPrice,
    condition,
    createdAt: new Date(),
    triggered: false
  });
  
  // Start monitoring (in background)
  monitorPrice(mint, targetPrice, condition);
  
  return {
    success: true,
    message: `Alert set for ${mint} when price ${condition} $${targetPrice}`
  };
}
```

## Advanced MCP Features

### Resource Management

MCP supports resources (files, data) that tools can access:

```typescript
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "solana://wallet/balance",
        name: "Wallet Balance",
        description: "Current wallet balance",
        mimeType: "application/json",
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  
  if (uri === "solana://wallet/balance") {
    const balance = await getBalance();
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(balance),
        },
      ],
    };
  }
});
```

### Prompts

MCP servers can provide pre-defined prompts:

```typescript
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "analyze_wallet",
        description: "Analyze wallet holdings and suggest optimizations",
        arguments: [
          {
            name: "wallet",
            description: "Wallet address to analyze",
            required: true,
          },
        ],
      },
    ],
  };
});
```

## Security Best Practices

### 1. Credential Management

```typescript
// ❌ Don't hardcode credentials
const privateKey = "abc123...";

// ✅ Use environment variables
const privateKey = process.env.SOLANA_PRIVATE_KEY;

// ✅ Validate credentials exist
if (!privateKey) {
  throw new Error("SOLANA_PRIVATE_KEY not set");
}
```

### 2. Input Validation

```typescript
function validateAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

// Validate before using
if (!validateAddress(args.recipient)) {
  throw new Error("Invalid recipient address");
}
```

### 3. Transaction Limits

```typescript
const MAX_TRANSFER_AMOUNT = 10; // SOL

if (args.amount > MAX_TRANSFER_AMOUNT) {
  throw new Error(
    `Amount exceeds maximum allowed (${MAX_TRANSFER_AMOUNT} SOL)`
  );
}
```

### 4. Audit Logging

```typescript
function logToolCall(toolName: string, args: any, result: any) {
  console.log({
    timestamp: new Date().toISOString(),
    tool: toolName,
    arguments: args,
    result: result,
  });
}
```

## Testing MCP Servers

### Manual Testing

Use the MCP Inspector tool:

```bash
npx @modelcontextprotocol/inspector node build/index.js
```

This opens a web interface to test your MCP server.

### Automated Testing

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

describe("MCP Server", () => {
  let client: Client;

  beforeAll(async () => {
    // Connect to server
    client = new Client({
      name: "test-client",
      version: "1.0.0",
    });
    
    await client.connect(transport);
  });

  it("should list tools", async () => {
    const response = await client.request(
      { method: "tools/list" },
      ListToolsResultSchema
    );
    
    expect(response.tools).toHaveLength(10);
  });

  it("should execute transfer", async () => {
    const response = await client.request({
      method: "tools/call",
      params: {
        name: "TRANSFER",
        arguments: {
          to: "recipient-address",
          amount: 1,
        },
      },
    });
    
    expect(response.content[0].text).toContain("signature");
  });
});
```

## Troubleshooting

### Common Issues

**"MCP server not found"**
- Verify the server is installed correctly
- Check the `command` and `args` in configuration
- Ensure the path is correct for source builds

**"Authentication failed"**
- Verify `SOLANA_PRIVATE_KEY` is set correctly
- Check the private key is in base58 format
- Ensure environment variables are loaded

**"Tool execution failed"**
- Check RPC endpoint is accessible
- Verify wallet has sufficient balance
- Review error messages in Claude Desktop logs

**"Connection timeout"**
- Check network connectivity
- Try a different RPC endpoint
- Increase timeout settings

### Debug Mode

Enable debug logging:

```json
{
  "mcpServers": {
    "solana-mcp": {
      "command": "node",
      "args": ["build/index.js"],
      "env": {
        "DEBUG": "true",
        "LOG_LEVEL": "debug"
      }
    }
  }
}
```

## Integration with Other Clients

MCP is not limited to Claude Desktop. You can integrate with:

### Cursor IDE

Add to Cursor settings:

```json
{
  "mcp": {
    "servers": {
      "solana": {
        "command": "npx",
        "args": ["solana-mcp"]
      }
    }
  }
}
```

### Cline

Configure in Cline settings to enable Solana operations in your IDE.

### Custom Clients

Build your own MCP client:

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

const client = new Client({
  name: "my-client",
  version: "1.0.0",
});

await client.connect(transport);

// List available tools
const tools = await client.request({ method: "tools/list" });

// Call a tool
const result = await client.request({
  method: "tools/call",
  params: {
    name: "GET_BALANCE",
    arguments: {},
  },
});
```

## Best Practices

1. **Clear Tool Descriptions**: Write detailed descriptions so AI understands when to use each tool
2. **Validate Inputs**: Always validate parameters before execution
3. **Handle Errors Gracefully**: Return clear error messages
4. **Log Operations**: Maintain audit logs of all tool calls
5. **Set Limits**: Implement rate limiting and spending limits
6. **Test Thoroughly**: Test all tools before deployment
7. **Document Tools**: Provide examples of tool usage
8. **Version Your Server**: Use semantic versioning for updates
9. **Monitor Usage**: Track tool usage and errors
10. **Keep Updated**: Update dependencies regularly

## Additional Resources

- [MCP Specification](https://modelcontextprotocol.io)
- [Solana MCP Server Repository](https://github.com/sendaifun/solana-mcp)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Claude Desktop Documentation](https://claude.ai/docs)

## Source Attribution

This content is extracted and curated from:
- **Repository**: [github.com/sendaifun/solana-mcp](https://github.com/sendaifun/solana-mcp)
- **Main README**: `solana-mcp/README.md`
- **MCP SDK Documentation**: Model Context Protocol specification

## Next Steps

- [LangGraph](../04-langgraph/README.md) - Build multi-agent systems
- [Exercises](../exercises/README.md) - Practice MCP integration
- [Agent Basics](../01-agent-basics/README.md) - Review agent fundamentals

---

**Estimated Time:** 2-3 hours

Ready to build multi-agent systems? Continue to [LangGraph](../04-langgraph/README.md).
