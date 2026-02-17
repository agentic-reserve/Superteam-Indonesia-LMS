# Exercise: Dice Game with VRF

## Objective

Create a fair dice game using Verifiable Random Functions (VRF) to ensure provably random outcomes that cannot be predicted or manipulated.

## Difficulty

**Intermediate**

## Estimated Time

2-3 hours

## Prerequisites

- Completed [Verifiable Randomness](../03-verifiable-randomness/README.md) guide
- Understanding of VRF concepts
- Basic game logic knowledge
- Anchor framework proficiency

## Requirements

Your dice game must:

1. **Accept bets** from players
2. **Request VRF** for random dice roll
3. **Determine outcome** based on random value
4. **Pay winners** automatically
5. **Track statistics** (wins, losses, total bets)

### Game Rules

- Player bets an amount
- Dice rolls 1-6 (using VRF)
- Win condition: Roll >= 4 (pays 2x)
- Loss condition: Roll < 4 (loses bet)

### Account Structure

```rust
#[account]
pub struct Game {
    pub player: Pubkey,
    pub bet_amount: u64,
    pub dice_result: u8,
    pub won: bool,
    pub payout: u64,
    pub state: GameState,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum GameState {
    WaitingForRoll,
    WaitingForResult,
    Finished,
}
```

### Required Instructions

1. `initialize_game` - Create game with bet
2. `roll_dice` - Request VRF randomness
3. `reveal_result` - Consume VRF and determine outcome
4. `claim_payout` - Transfer winnings to player
5. `get_stats` - View player statistics

## Validation Criteria

Your solution must:

- ✅ Accept and validate bets
- ✅ Request VRF correctly
- ✅ Wait for VRF fulfillment
- ✅ Calculate dice result (1-6) properly
- ✅ Determine win/loss correctly
- ✅ Pay winners accurately
- ✅ Track game statistics
- ✅ Handle all error cases
- ✅ Include comprehensive tests

## Test Scenarios

### Test 1: Complete Game Flow
```typescript
it("Plays complete game", async () => {
  const betAmount = new anchor.BN(1000000); // 0.001 SOL
  
  // Initialize game
  await program.methods
    .initializeGame(betAmount)
    .accounts({...})
    .rpc();
  
  // Roll dice
  await program.methods
    .rollDice()
    .accounts({...})
    .rpc();
  
  // Wait for VRF
  await waitForVRF(randomnessRequest);
  
  // Reveal result
  await program.methods
    .revealResult()
    .accounts({...})
    .rpc();
  
  // Check result
  const game = await program.account.game.fetch(gameAccount);
  assert(game.diceResult >= 1 && game.diceResult <= 6);
  assert.equal(game.state, GameState.Finished);
});
```

### Test 2: Win Scenario
```typescript
it("Handles winning roll", async () => {
  // Play game
  // ... (initialize, roll, wait for VRF)
  
  // Reveal result
  await program.methods.revealResult()...
  
  const game = await program.account.game.fetch(...);
  
  if (game.diceResult >= 4) {
    assert.equal(game.won, true);
    assert.equal(game.payout, game.betAmount * 2);
  }
});
```

### Test 3: Loss Scenario
```typescript
it("Handles losing roll", async () => {
  // Play game
  // ... (initialize, roll, wait for VRF)
  
  // Reveal result
  await program.methods.revealResult()...
  
  const game = await program.account.game.fetch(...);
  
  if (game.diceResult < 4) {
    assert.equal(game.won, false);
    assert.equal(game.payout, 0);
  }
});
```

### Test 4: Multiple Games
```typescript
it("Plays multiple games and tracks stats", async () => {
  const games = 10;
  let wins = 0;
  let losses = 0;
  
  for (let i = 0; i < games; i++) {
    // Play game
    const result = await playGame();
    
    if (result.won) wins++;
    else losses++;
  }
  
  console.log(`Wins: ${wins}, Losses: ${losses}`);
  
  // Verify statistics
  const stats = await program.account.playerStats.fetch(...);
  assert.equal(stats.totalGames, games);
  assert.equal(stats.wins, wins);
  assert.equal(stats.losses, losses);
});
```

### Test 5: Error Handling
```typescript
it("Prevents revealing before VRF fulfillment", async () => {
  // Initialize and roll
  await program.methods.initializeGame(...)...
  await program.methods.rollDice()...
  
  // Try to reveal immediately (should fail)
  try {
    await program.methods.revealResult()...
    assert.fail("Should have thrown error");
  } catch (error) {
    assert(error.message.includes("Randomness not fulfilled"));
  }
});
```

## Hints

### Hint 1: VRF Integration
Request randomness properly:
```rust
use magicblock_vrf::cpi::accounts::RequestRandomness;
use magicblock_vrf::cpi::request_randomness;

pub fn roll_dice(ctx: Context<RollDice>) -> Result<()> {
    let cpi_program = ctx.accounts.vrf_program.to_account_info();
    let cpi_accounts = RequestRandomness {
        request: ctx.accounts.randomness_request.to_account_info(),
        authority: ctx.accounts.player.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    
    request_randomness(cpi_ctx)?;
    
    ctx.accounts.game.state = GameState::WaitingForResult;
    Ok(())
}
```

### Hint 2: Dice Calculation
Convert random value to dice result (1-6):
```rust
pub fn reveal_result(ctx: Context<RevealResult>) -> Result<()> {
    let randomness = &ctx.accounts.randomness_request;
    
    require!(
        randomness.is_fulfilled,
        ErrorCode::RandomnessNotFulfilled
    );
    
    // Get dice result (1-6)
    let dice_result = (randomness.random_value % 6) + 1;
    
    ctx.accounts.game.dice_result = dice_result as u8;
    
    // Determine outcome
    let won = dice_result >= 4;
    ctx.accounts.game.won = won;
    
    if won {
        ctx.accounts.game.payout = ctx.accounts.game.bet_amount * 2;
    }
    
    Ok(())
}
```

### Hint 3: Waiting for VRF
Poll for VRF fulfillment:
```typescript
async function waitForVRF(
  requestPubkey: PublicKey,
  maxAttempts: number = 30
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const request = await program.account.randomnessRequest.fetch(
        requestPubkey
      );
      
      if (request.isFulfilled) {
        return;
      }
    } catch (error) {
      // Account might not exist yet
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error("VRF timeout");
}
```

### Hint 4: Statistics Tracking
Track player statistics:
```rust
#[account]
pub struct PlayerStats {
    pub player: Pubkey,
    pub total_games: u64,
    pub wins: u64,
    pub losses: u64,
    pub total_bet: u64,
    pub total_payout: u64,
}

pub fn update_stats(
    stats: &mut PlayerStats,
    game: &Game,
) -> Result<()> {
    stats.total_games += 1;
    stats.total_bet += game.bet_amount;
    
    if game.won {
        stats.wins += 1;
        stats.total_payout += game.payout;
    } else {
        stats.losses += 1;
    }
    
    Ok(())
}
```

## Bonus Challenges

### Challenge 1: Multiple Dice
Roll multiple dice and sum results:
```rust
pub fn roll_multiple_dice(
    ctx: Context<RollDice>,
    num_dice: u8,
) -> Result<()> {
    // Roll N dice, sum results
}
```

### Challenge 2: Custom Win Conditions
Allow players to choose win condition:
```rust
pub enum WinCondition {
    GreaterThan(u8),
    LessThan(u8),
    Equals(u8),
    Even,
    Odd,
}
```

### Challenge 3: Progressive Jackpot
Implement a jackpot that grows with each game:
```rust
#[account]
pub struct Jackpot {
    pub amount: u64,
    pub last_winner: Option<Pubkey>,
    pub trigger_number: u8, // Win jackpot on this roll
}
```

### Challenge 4: Multiplayer Mode
Allow multiple players to bet on same roll:
```rust
#[account]
pub struct MultiplayerGame {
    pub players: Vec<Pubkey>,
    pub bets: Vec<u64>,
    pub predictions: Vec<u8>,
}
```

## Solution Outline

```rust
use anchor_lang::prelude::*;
use magicblock_vrf::program::MagicblockVrf;
use magicblock_vrf::RandomnessRequest;

declare_id!("DiceGameProgramID");

#[program]
pub mod dice_game {
    use super::*;

    pub fn initialize_game(
        ctx: Context<InitializeGame>,
        bet_amount: u64,
    ) -> Result<()> {
        // Initialize game
    }

    pub fn roll_dice(ctx: Context<RollDice>) -> Result<()> {
        // Request VRF
    }

    pub fn reveal_result(ctx: Context<RevealResult>) -> Result<()> {
        // Consume VRF and determine outcome
    }

    pub fn claim_payout(ctx: Context<ClaimPayout>) -> Result<()> {
        // Transfer winnings
    }
}

#[derive(Accounts)]
pub struct InitializeGame<'info> {
    // Define accounts
}

#[account]
#[derive(InitSpace)]
pub struct Game {
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
- [ ] VRF integration working
- [ ] Dice calculation correct (1-6)
- [ ] Win/loss logic accurate
- [ ] Payout calculation correct
- [ ] Statistics tracking implemented
- [ ] All tests passing
- [ ] Error handling comprehensive
- [ ] Code documented
- [ ] Bonus challenges attempted (optional)

## Next Steps

After completing this exercise:

1. Try the [Session Keys exercise](./session-keys-integration.md)
2. Implement bonus challenges
3. Build other games with VRF (slots, lottery, etc.)
4. Explore combining VRF with ERs for real-time gaming

---

**Good luck!** Build a fair and fun dice game!

**Last Updated**: February 17, 2026
