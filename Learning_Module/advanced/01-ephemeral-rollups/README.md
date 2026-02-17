# Ephemeral Rollups

## Overview

Ephemeral Rollups (ERs) are a novel scaling solution that enables real-time, high-performance execution for Solana applications. By temporarily delegating account state to specialized execution environments, ERs achieve sub-100ms latency while maintaining Solana's security guarantees.

**Estimated Time:** 4-5 hours

## Learning Objectives

After completing this lesson, you will be able to:

- Explain how Ephemeral Rollups work
- Understand the delegation lifecycle
- Build ER-enabled Solana programs
- Deploy and test programs with ERs
- Implement Magic Actions for automated base-layer operations
- Identify use cases for Ephemeral Rollups

## Prerequisites

- Completed [Basics](../../basics/README.md) module
- Understanding of [Anchor Framework](../../basics/05-anchor-framework/README.md)
- Familiarity with [Transactions](../../basics/02-transactions/README.md)
- Knowledge of [PDAs](../../basics/04-pdas/README.md)

## What Are Ephemeral Rollups?

### The Problem

Traditional blockchain applications face inherent latency constraints:
- Solana base layer: ~400ms block time
- Transaction confirmation: 1-2 seconds
- Real-time applications need: <100ms latency

This makes certain application categories impractical:
- Real-time multiplayer games
- High-frequency trading
- Instant social interactions
- Live collaborative applications

### The Solution

Ephemeral Rollups provide temporary, high-speed execution environments:

1. **Delegate** account state to an ER
2. **Execute** transactions at high speed (sub-100ms)
3. **Commit** state updates periodically to base layer
4. **Undelegate** when done, returning to base layer

**Key Benefits**:
- Sub-100ms transaction latency
- Maintains Solana security model
- Automatic state synchronization
- Seamless integration with existing programs

## Core Concepts

### Delegation

**Delegation** is the process of temporarily moving an account to an Ephemeral Rollup for high-speed execution.

```rust
// Delegate account to ER
pub fn delegate_account(
    ctx: Context<DelegateAccount>,
) -> Result<()> {
    // Account is now in ER
    // High-speed execution enabled
    Ok(())
}
```

**What happens during delegation**:
- Account ownership transferred to ER
- State snapshot taken
- High-speed execution begins
- Base layer account marked as delegated

### Commitment

**Commitment** is the periodic synchronization of ER state back to the Solana base layer.

**Commitment Strategies**:
- **Time-based**: Every N seconds
- **Action-based**: After specific operations
- **Manual**: Triggered by program logic

```rust
// Commit state to base layer
pub fn commit_state(
    ctx: Context<CommitState>,
) -> Result<()> {
    // State synchronized to Solana
    // Data availability ensured
    Ok(())
}
```

**Why commitment matters**:
- Ensures data availability
- Provides checkpoints
- Enables recovery
- Maintains security guarantees

### Undelegation

**Undelegation** returns the account to the Solana base layer with final state.

```rust
// Undelegate account from ER
pub fn undelegate_account(
    ctx: Context<UndelegateAccount>,
) -> Result<()> {
    // Final state committed
    // Account returned to base layer
    // Normal Solana execution resumes
    Ok(())
}
```

**Undelegation process**:
1. Final state commitment
2. Account ownership returned
3. ER session closed
4. Base layer execution resumes

## Magic Router

The **Magic Router** is MagicBlock's intelligent transaction routing system that automatically directs transactions to the appropriate execution environment.

### How It Works

```
User Transaction
      ↓
Magic Router
      ↓
   Decision
   /      \
  ER      Base Layer
(fast)    (standard)
```

**Routing Logic**:
- Checks if account is delegated
- Routes to ER if delegated
- Routes to base layer if not
- Handles cross-environment calls

### Benefits

1. **Transparent**: Users don't need to know about ERs
2. **Automatic**: No manual routing required
3. **Efficient**: Optimal execution path chosen
4. **Seamless**: Works with existing wallets

## Building ER-Enabled Programs

### Basic Counter Example

Let's build a simple counter that can be delegated to an ER:

```rust
use anchor_lang::prelude::*;

declare_id!("YourProgramID");

#[program]
pub mod er_counter {
    use super::*;

    // Initialize counter
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        counter.authority = ctx.accounts.authority.key();
        Ok(())
    }

    // Increment counter (works in ER or base layer)
    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = counter.count.checked_add(1)
            .ok_or(ErrorCode::Overflow)?;
        msg!("Counter: {}", counter.count);
        Ok(())
    }

    // Delegate to ER
    pub fn delegate(ctx: Context<Delegate>) -> Result<()> {
        msg!("Account delegated to Ephemeral Rollup");
        // MagicBlock handles delegation
        Ok(())
    }

    // Undelegate from ER
    pub fn undelegate(ctx: Context<Undelegate>) -> Result<()> {
        msg!("Account undelegated from Ephemeral Rollup");
        // MagicBlock handles undelegation
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Counter::INIT_SPACE
    )]
    pub counter: Account<'info, Counter>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(
        mut,
        has_one = authority
    )]
    pub counter: Account<'info, Counter>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct Delegate<'info> {
    #[account(
        mut,
        has_one = authority
    )]
    pub counter: Account<'info, Counter>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct Undelegate<'info> {
    #[account(
        mut,
        has_one = authority
    )]
    pub counter: Account<'info, Counter>,
    
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Counter {
    pub count: u64,
    pub authority: Pubkey,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Counter overflow")]
    Overflow,
}
```

### Client-Side Integration

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ErCounter } from "../target/types/er_counter";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.ErCounter as Program<ErCounter>;
  const counter = anchor.web3.Keypair.generate();

  // 1. Initialize counter
  await program.methods
    .initialize()
    .accounts({
      counter: counter.publicKey,
      authority: provider.wallet.publicKey,
    })
    .signers([counter])
    .rpc();

  console.log("Counter initialized");

  // 2. Delegate to ER
  await program.methods
    .delegate()
    .accounts({
      counter: counter.publicKey,
      authority: provider.wallet.publicKey,
    })
    .rpc();

  console.log("Counter delegated to ER");

  // 3. Increment (now in ER - sub-100ms latency!)
  for (let i = 0; i < 100; i++) {
    await program.methods
      .increment()
      .accounts({
        counter: counter.publicKey,
        authority: provider.wallet.publicKey,
      })
      .rpc();
  }

  console.log("Incremented 100 times in ER");

  // 4. Undelegate from ER
  await program.methods
    .undelegate()
    .accounts({
      counter: counter.publicKey,
      authority: provider.wallet.publicKey,
    })
    .rpc();

  console.log("Counter undelegated from ER");

  // 5. Fetch final count
  const counterAccount = await program.account.counter.fetch(
    counter.publicKey
  );
  console.log("Final count:", counterAccount.count.toString());
}

main();
```

## Magic Actions

**Magic Actions** enable programs to automatically execute base-layer operations while accounts are delegated to ERs.

### Use Cases

1. **Periodic Commitments**: Auto-commit state every N seconds
2. **Conditional Actions**: Trigger base-layer calls on events
3. **Cross-Program Calls**: Interact with base-layer programs
4. **State Synchronization**: Keep multiple accounts in sync

### Example: Auto-Commit

```rust
use anchor_lang::prelude::*;

#[program]
pub mod auto_commit_counter {
    use super::*;

    pub fn increment_with_auto_commit(
        ctx: Context<Increment>,
    ) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = counter.count.checked_add(1)?;
        
        // Magic Action: Commit every 100 increments
        if counter.count % 100 == 0 {
            // Trigger base-layer commitment
            msg!("Auto-committing state at count: {}", counter.count);
        }
        
        Ok(())
    }
}
```

## Local Development

### Setup

1. **Install MagicBlock CLI**:
```bash
npm install -g @magicblock-labs/cli
```

2. **Start Local ER**:
```bash
magicblock-engine start
```

3. **Configure Anchor**:
```toml
# Anchor.toml
[provider]
cluster = "localnet"
wallet = "~/.config/solana/id.json"

[programs.localnet]
er_counter = "YourProgramID"

[[test.validator.clone]]
address = "MagicBlockERAddress"
```

4. **Run Tests**:
```bash
anchor test
```

### Testing Strategy

```typescript
describe("ER Counter Tests", () => {
  it("Initializes counter", async () => {
    // Test initialization
  });

  it("Delegates to ER", async () => {
    // Test delegation
  });

  it("Increments in ER (fast)", async () => {
    const start = Date.now();
    
    // Increment 100 times
    for (let i = 0; i < 100; i++) {
      await program.methods.increment()...
    }
    
    const duration = Date.now() - start;
    console.log(`100 increments in ${duration}ms`);
    // Should be much faster than base layer
  });

  it("Undelegates from ER", async () => {
    // Test undelegation
  });
});
```

## Performance Comparison

### Base Layer vs Ephemeral Rollup

| Metric | Base Layer | Ephemeral Rollup |
|--------|-----------|------------------|
| **Latency** | 400ms+ | <100ms |
| **Throughput** | ~3,000 TPS | 10,000+ TPS |
| **Cost** | Standard fees | Reduced fees |
| **Finality** | 1-2 seconds | Instant (ER) |
| **Security** | Full Solana | Full Solana* |

*Security maintained through periodic commitments

### Real-World Example

**Gaming Scenario**: 1000 player actions per second

**Base Layer**:
- Latency: 400ms per action
- User experience: Laggy, unplayable
- Cost: High transaction fees

**Ephemeral Rollup**:
- Latency: 50ms per action
- User experience: Smooth, real-time
- Cost: Reduced fees

## Use Cases

### 1. Real-Time Gaming

**Perfect for**:
- Multiplayer games
- Turn-based games with fast turns
- Real-time strategy games
- Card games

**Example**: Chess game with instant moves
```rust
pub fn make_move(
    ctx: Context<MakeMove>,
    from: Square,
    to: Square,
) -> Result<()> {
    // Validate and execute move
    // In ER: <50ms latency
    // Players see instant feedback
    Ok(())
}
```

### 2. High-Frequency Trading

**Perfect for**:
- Order book updates
- Trade execution
- Price feeds
- Liquidations

**Example**: DEX order placement
```rust
pub fn place_order(
    ctx: Context<PlaceOrder>,
    price: u64,
    amount: u64,
) -> Result<()> {
    // Place order instantly
    // In ER: <100ms execution
    // Competitive advantage
    Ok(())
}
```

### 3. Social Applications

**Perfect for**:
- Instant messaging
- Social feeds
- Reactions and likes
- Comments

**Example**: Social post
```rust
pub fn create_post(
    ctx: Context<CreatePost>,
    content: String,
) -> Result<()> {
    // Post appears instantly
    // In ER: <50ms
    // Smooth UX
    Ok(())
}
```

### 4. Collaborative Applications

**Perfect for**:
- Shared documents
- Whiteboards
- Live editing
- Real-time collaboration

## Best Practices

### 1. Design for Delegation

```rust
// ✅ Good: Stateless operations
pub fn increment(ctx: Context<Increment>) -> Result<()> {
    ctx.accounts.counter.count += 1;
    Ok(())
}

// ❌ Bad: External dependencies
pub fn increment_with_oracle(ctx: Context<Increment>) -> Result<()> {
    let price = fetch_oracle_price()?; // May not work in ER
    ctx.accounts.counter.count += 1;
    Ok(())
}
```

### 2. Handle Commitment Failures

```rust
pub fn critical_operation(ctx: Context<Operation>) -> Result<()> {
    // Perform operation
    do_something()?;
    
    // Ensure commitment
    if is_critical() {
        commit_immediately()?;
    }
    
    Ok(())
}
```

### 3. Optimize for ER Performance

```rust
// ✅ Good: Batch operations
pub fn batch_increment(
    ctx: Context<Increment>,
    amount: u64,
) -> Result<()> {
    ctx.accounts.counter.count += amount;
    Ok(())
}

// ❌ Bad: Individual operations
// (requires multiple transactions)
```

### 4. Test Both Environments

```typescript
describe("Cross-Environment Tests", () => {
  it("Works on base layer", async () => {
    // Test without delegation
  });

  it("Works in ER", async () => {
    // Delegate first
    await delegate();
    // Then test
  });

  it("Handles delegation transitions", async () => {
    // Test delegate → operate → undelegate
  });
});
```

## Common Pitfalls

1. **Forgetting to Undelegate**: Always undelegate when done
2. **Assuming Instant Finality**: ER is fast but not instant on base layer
3. **Ignoring Commitment Strategy**: Plan your commitment frequency
4. **Not Testing Locally**: Use local ER for development
5. **Over-Delegating**: Not all accounts need ER

## Troubleshooting

### Issue: Delegation Fails

**Symptoms**: Transaction fails when delegating

**Solutions**:
- Check account ownership
- Verify ER is running
- Ensure sufficient SOL for fees
- Check program permissions

### Issue: State Not Committing

**Symptoms**: ER state not appearing on base layer

**Solutions**:
- Check commitment configuration
- Verify ER connectivity
- Ensure commitment transactions succeed
- Review Magic Actions setup

### Issue: Performance Not Improved

**Symptoms**: ER not faster than base layer

**Solutions**:
- Verify account is actually delegated
- Check ER node performance
- Review transaction routing
- Optimize program logic

## Next Steps

Now that you understand Ephemeral Rollups, continue to:

- [Session Keys](../02-session-keys/README.md) - Wallet-less user experience
- [Verifiable Randomness](../03-verifiable-randomness/README.md) - Onchain randomness
- [Exercises](../exercises/README.md) - Practice building with ERs

## Additional Resources

- [MagicBlock ER Documentation](https://docs.magicblock.gg/pages/ephemeral-rollups-ers/) - Official ER docs
- [Ephemeral Rollups Whitepaper](https://arxiv.org/abs/2311.02650) - Academic paper
- [MagicBlock GitHub](https://github.com/magicblock-labs) - Example programs
- [MagicBlock Discord](https://discord.gg/magicblock) - Community support

## Source Attribution

This content is based on educational materials from:

- **MagicBlock Documentation**: https://docs.magicblock.gg/
- **Ephemeral Rollups Whitepaper**: https://arxiv.org/abs/2311.02650
- **MagicBlock Labs**: https://magicblock.gg/

---

**Last Updated**: February 17, 2026
