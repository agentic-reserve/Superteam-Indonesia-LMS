# Exercise: ER Counter

## Objective

Build a counter program that can be delegated to an Ephemeral Rollup for high-speed increments, demonstrating the performance benefits of ERs.

## Difficulty

**Beginner**

## Estimated Time

1-2 hours

## Prerequisites

- Completed [Ephemeral Rollups](../01-ephemeral-rollups/README.md) guide
- Basic Anchor knowledge
- Understanding of delegation lifecycle

## Requirements

Your counter program must:

1. **Initialize** a counter account
2. **Delegate** the counter to an ER
3. **Increment** the counter (works in both ER and base layer)
4. **Undelegate** the counter from ER
5. **Track** total increments and delegation status

### Account Structure

```rust
#[account]
pub struct Counter {
    pub authority: Pubkey,
    pub count: u64,
    pub is_delegated: bool,
    pub total_increments: u64,
}
```

### Required Instructions

1. `initialize` - Create counter
2. `delegate` - Delegate to ER
3. `increment` - Increment counter
4. `undelegate` - Return to base layer
5. `reset` - Reset counter (only when not delegated)

## Validation Criteria

Your solution must:

- ✅ Initialize counter correctly
- ✅ Delegate/undelegate successfully
- ✅ Increment in both ER and base layer
- ✅ Track delegation status
- ✅ Prevent reset while delegated
- ✅ Handle errors appropriately
- ✅ Include comprehensive tests

## Test Scenarios

### Test 1: Basic Operations
```typescript
it("Initializes, increments, and reads counter", async () => {
  // Initialize
  await program.methods.initialize()...
  
  // Increment
  await program.methods.increment()...
  
  // Verify count
  const counter = await program.account.counter.fetch(...);
  assert.equal(counter.count, 1);
});
```

### Test 2: Delegation Lifecycle
```typescript
it("Delegates, increments in ER, and undelegates", async () => {
  // Delegate
  await program.methods.delegate()...
  
  // Verify delegated
  let counter = await program.account.counter.fetch(...);
  assert.equal(counter.isDelegated, true);
  
  // Increment 100 times (fast in ER!)
  for (let i = 0; i < 100; i++) {
    await program.methods.increment()...
  }
  
  // Undelegate
  await program.methods.undelegate()...
  
  // Verify final count
  counter = await program.account.counter.fetch(...);
  assert.equal(counter.count, 100);
  assert.equal(counter.isDelegated, false);
});
```

### Test 3: Performance Comparison
```typescript
it("Demonstrates ER performance benefit", async () => {
  // Measure base layer performance
  const baseStart = Date.now();
  for (let i = 0; i < 50; i++) {
    await program.methods.increment()...
  }
  const baseDuration = Date.now() - baseStart;
  
  // Delegate to ER
  await program.methods.delegate()...
  
  // Measure ER performance
  const erStart = Date.now();
  for (let i = 0; i < 50; i++) {
    await program.methods.increment()...
  }
  const erDuration = Date.now() - erStart;
  
  console.log(`Base layer: ${baseDuration}ms`);
  console.log(`ER: ${erDuration}ms`);
  console.log(`Speedup: ${(baseDuration / erDuration).toFixed(2)}x`);
  
  // ER should be significantly faster
  assert(erDuration < baseDuration);
});
```

### Test 4: Error Handling
```typescript
it("Prevents reset while delegated", async () => {
  // Delegate
  await program.methods.delegate()...
  
  // Try to reset (should fail)
  try {
    await program.methods.reset()...
    assert.fail("Should have thrown error");
  } catch (error) {
    assert(error.message.includes("Cannot reset while delegated"));
  }
});
```

## Hints

### Hint 1: Delegation Status
Track delegation status in your account:
```rust
#[account(mut)]
pub struct Counter {
    pub is_delegated: bool,
    // ... other fields
}

pub fn delegate(ctx: Context<Delegate>) -> Result<()> {
    ctx.accounts.counter.is_delegated = true;
    Ok(())
}
```

### Hint 2: Increment Logic
The increment function should work in both environments:
```rust
pub fn increment(ctx: Context<Increment>) -> Result<()> {
    let counter = &mut ctx.accounts.counter;
    counter.count = counter.count.checked_add(1)?;
    counter.total_increments += 1;
    Ok(())
}
```

### Hint 3: Reset Protection
Prevent reset while delegated:
```rust
pub fn reset(ctx: Context<Reset>) -> Result<()> {
    let counter = &mut ctx.accounts.counter;
    
    require!(
        !counter.is_delegated,
        ErrorCode::CannotResetWhileDelegated
    );
    
    counter.count = 0;
    Ok(())
}
```

### Hint 4: Testing with ER
Start MagicBlock engine before testing:
```bash
# Terminal 1
solana-test-validator

# Terminal 2
magicblock-engine start

# Terminal 3
anchor test
```

## Bonus Challenges

### Challenge 1: Batch Increment
Add a `batch_increment` instruction that increments by N:
```rust
pub fn batch_increment(
    ctx: Context<Increment>,
    amount: u64,
) -> Result<()> {
    // Increment by amount
}
```

### Challenge 2: Auto-Commit
Implement auto-commit every 100 increments:
```rust
pub fn increment(ctx: Context<Increment>) -> Result<()> {
    // Increment
    // If count % 100 == 0, trigger commit
}
```

### Challenge 3: Multiple Counters
Support multiple counters per authority using PDAs:
```rust
#[derive(Accounts)]
#[instruction(counter_id: u8)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Counter::INIT_SPACE,
        seeds = [b"counter", authority.key().as_ref(), &[counter_id]],
        bump
    )]
    pub counter: Account<'info, Counter>,
    // ...
}
```

### Challenge 4: Statistics
Track min/max increment rates and delegation time:
```rust
#[account]
pub struct Counter {
    // ... existing fields
    pub max_increment_rate: u64,
    pub total_delegation_time: i64,
    pub delegation_count: u32,
}
```

## Solution Outline

```rust
use anchor_lang::prelude::*;

declare_id!("YourProgramID");

#[program]
pub mod er_counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        // Initialize counter
    }

    pub fn delegate(ctx: Context<Delegate>) -> Result<()> {
        // Delegate to ER
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        // Increment counter
    }

    pub fn undelegate(ctx: Context<Undelegate>) -> Result<()> {
        // Undelegate from ER
    }

    pub fn reset(ctx: Context<Reset>) -> Result<()> {
        // Reset counter (only if not delegated)
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    // Define accounts
}

#[derive(Accounts)]
pub struct Increment<'info> {
    // Define accounts
}

#[account]
#[derive(InitSpace)]
pub struct Counter {
    // Define structure
}

#[error_code]
pub enum ErrorCode {
    // Define errors
}
```

## Submission Checklist

Before submitting, ensure:

- [ ] All instructions implemented
- [ ] Delegation status tracked
- [ ] Error handling included
- [ ] All tests passing
- [ ] Performance test included
- [ ] Code documented
- [ ] Bonus challenges attempted (optional)

## Next Steps

After completing this exercise:

1. Review the [Session Keys exercise](./session-keys-integration.md)
2. Try the bonus challenges
3. Experiment with different ER configurations
4. Build a more complex application using ERs

---

**Good luck!** Remember to test thoroughly and ask for help if needed.

**Last Updated**: February 17, 2026
