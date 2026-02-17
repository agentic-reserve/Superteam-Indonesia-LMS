# Verifiable Randomness (VRF)

## Overview

Verifiable Random Functions (VRF) provide secure, unpredictable, and verifiable randomness onchain. MagicBlock's VRF ensures that random outcomes in decentralized applications are fair, transparent, and tamper-proof, making it essential for gaming, NFTs, lotteries, and any application requiring trustless randomness.

**Estimated Time:** 2-3 hours

## Learning Objectives

After completing this lesson, you will be able to:

- Explain why verifiable randomness is critical
- Understand how VRF works technically
- Request randomness in Solana programs
- Consume and use random values
- Implement fair gaming mechanics
- Apply VRF security best practices

## Prerequisites

- Completed [Basics](../../basics/README.md) module
- Understanding of [Anchor Framework](../../basics/05-anchor-framework/README.md)
- Familiarity with [PDAs](../../basics/04-pdas/README.md)
- Basic cryptography concepts

## Why Verifiable Randomness?

### The Problem with Onchain Randomness

**Naive Approaches (INSECURE)**:

```rust
// ❌ BAD: Using block data
let random = clock.slot % 100; // Predictable!

// ❌ BAD: Using account data
let random = account.key().to_bytes()[0]; // Manipulable!

// ❌ BAD: Using timestamp
let random = clock.unix_timestamp % 100; // Predictable!
```

**Why These Fail**:
- **Predictable**: Validators/users can predict values
- **Manipulable**: Attackers can influence outcomes
- **Not Fair**: No guarantee of randomness
- **Exploitable**: Can be gamed for profit

### The VRF Solution

**Verifiable Random Functions provide**:
- **Unpredictable**: Cannot be predicted before generation
- **Verifiable**: Anyone can verify randomness is legitimate
- **Tamper-Proof**: Cannot be manipulated
- **Fair**: Cryptographically secure randomness

## How VRF Works

### Technical Overview

```
1. Request Randomness
   ↓
2. VRF Oracle Generates Random Value
   ↓
3. Oracle Provides Proof
   ↓
4. Onchain Verification
   ↓
5. Use Random Value
```

### VRF Components

1. **Request**: Program requests random value
2. **Oracle**: Off-chain service generates randomness
3. **Proof**: Cryptographic proof of randomness
4. **Verification**: Onchain proof verification
5. **Consumption**: Program uses verified random value

### Security Guarantees

- **Unpredictability**: Random value unknown until revealed
- **Verifiability**: Proof can be verified onchain
- **Uniqueness**: Each request gets unique randomness
- **Fairness**: No party can bias the outcome

## Requesting Randomness

### Basic VRF Request

```rust
use anchor_lang::prelude::*;
use magicblock_vrf::cpi::accounts::RequestRandomness;
use magicblock_vrf::cpi::request_randomness;
use magicblock_vrf::program::MagicblockVrf;
use magicblock_vrf::RandomnessRequest;

declare_id!("YourProgramID");

#[program]
pub mod vrf_example {
    use super::*;

    /// Request random value
    pub fn request_random(ctx: Context<RequestRandom>) -> Result<()> {
        // Create CPI context for VRF request
        let cpi_program = ctx.accounts.vrf_program.to_account_info();
        let cpi_accounts = RequestRandomness {
            request: ctx.accounts.randomness_request.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        // Request randomness
        request_randomness(cpi_ctx)?;

        msg!("Randomness requested");
        Ok(())
    }

    /// Consume random value (called after VRF fulfills)
    pub fn consume_random(
        ctx: Context<ConsumeRandom>,
    ) -> Result<()> {
        let randomness_request = &ctx.accounts.randomness_request;

        // Check if randomness is fulfilled
        require!(
            randomness_request.is_fulfilled,
            ErrorCode::RandomnessNotFulfilled
        );

        // Get the random value
        let random_value = randomness_request.random_value;

        msg!("Random value: {}", random_value);

        // Use the random value
        // Example: Generate number between 1-100
        let result = (random_value % 100) + 1;
        msg!("Result (1-100): {}", result);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct RequestRandom<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + RandomnessRequest::LEN
    )]
    pub randomness_request: Account<'info, RandomnessRequest>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub vrf_program: Program<'info, MagicblockVrf>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ConsumeRandom<'info> {
    pub randomness_request: Account<'info, RandomnessRequest>,
    pub authority: Signer<'info>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Randomness not yet fulfilled")]
    RandomnessNotFulfilled,
}
```

## Dice Game Example

Complete example of a dice game using VRF:

```rust
use anchor_lang::prelude::*;
use magicblock_vrf::cpi::accounts::RequestRandomness;
use magicblock_vrf::cpi::request_randomness;
use magicblock_vrf::program::MagicblockVrf;
use magicblock_vrf::RandomnessRequest;

declare_id!("DiceGameProgramID");

#[program]
pub mod dice_game {
    use super::*;

    /// Initialize game
    pub fn initialize_game(
        ctx: Context<InitializeGame>,
        bet_amount: u64,
    ) -> Result<()> {
        let game = &mut ctx.accounts.game;
        game.player = ctx.accounts.player.key();
        game.bet_amount = bet_amount;
        game.state = GameState::WaitingForRoll;

        msg!("Game initialized with bet: {} lamports", bet_amount);
        Ok(())
    }

    /// Roll dice (request randomness)
    pub fn roll_dice(ctx: Context<RollDice>) -> Result<()> {
        let game = &mut ctx.accounts.game;

        require!(
            game.state == GameState::WaitingForRoll,
            ErrorCode::InvalidGameState
        );

        // Request randomness via CPI
        let cpi_program = ctx.accounts.vrf_program.to_account_info();
        let cpi_accounts = RequestRandomness {
            request: ctx.accounts.randomness_request.to_account_info(),
            authority: ctx.accounts.player.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        request_randomness(cpi_ctx)?;

        game.state = GameState::WaitingForResult;
        msg!("Dice rolled, waiting for result...");

        Ok(())
    }

    /// Reveal result (consume randomness)
    pub fn reveal_result(ctx: Context<RevealResult>) -> Result<()> {
        let game = &mut ctx.accounts.game;
        let randomness_request = &ctx.accounts.randomness_request;

        require!(
            game.state == GameState::WaitingForResult,
            ErrorCode::InvalidGameState
        );

        require!(
            randomness_request.is_fulfilled,
            ErrorCode::RandomnessNotFulfilled
        );

        // Get dice result (1-6)
        let dice_result = (randomness_request.random_value % 6) + 1;
        game.dice_result = dice_result as u8;

        // Determine win/loss (example: win if roll >= 4)
        let won = dice_result >= 4;
        game.won = won;

        if won {
            // Player wins 2x bet
            let payout = game.bet_amount * 2;
            game.payout = payout;
            msg!("Player won! Dice: {}, Payout: {}", dice_result, payout);
        } else {
            game.payout = 0;
            msg!("Player lost. Dice: {}", dice_result);
        }

        game.state = GameState::Finished;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeGame<'info> {
    #[account(
        init,
        payer = player,
        space = 8 + Game::INIT_SPACE
    )]
    pub game: Account<'info, Game>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RollDice<'info> {
    #[account(
        mut,
        has_one = player
    )]
    pub game: Account<'info, Game>,

    #[account(
        init,
        payer = player,
        space = 8 + RandomnessRequest::LEN
    )]
    pub randomness_request: Account<'info, RandomnessRequest>,

    #[account(mut)]
    pub player: Signer<'info>,

    pub vrf_program: Program<'info, MagicblockVrf>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevealResult<'info> {
    #[account(
        mut,
        has_one = player
    )]
    pub game: Account<'info, Game>,

    pub randomness_request: Account<'info, RandomnessRequest>,

    pub player: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Game {
    pub player: Pubkey,
    pub bet_amount: u64,
    pub dice_result: u8,
    pub won: bool,
    pub payout: u64,
    pub state: GameState,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum GameState {
    WaitingForRoll,
    WaitingForResult,
    Finished,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid game state")]
    InvalidGameState,

    #[msg("Randomness not yet fulfilled")]
    RandomnessNotFulfilled,
}
```

### Client-Side Integration

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { DiceGame } from "../target/types/dice_game";

async function playDiceGame() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.DiceGame as Program<DiceGame>;
  const player = provider.wallet as anchor.Wallet;

  // Generate keypairs
  const game = anchor.web3.Keypair.generate();
  const randomnessRequest = anchor.web3.Keypair.generate();

  // 1. Initialize game
  const betAmount = new anchor.BN(1000000); // 0.001 SOL
  await program.methods
    .initializeGame(betAmount)
    .accounts({
      game: game.publicKey,
      player: player.publicKey,
    })
    .signers([game])
    .rpc();

  console.log("Game initialized");

  // 2. Roll dice (request randomness)
  await program.methods
    .rollDice()
    .accounts({
      game: game.publicKey,
      randomnessRequest: randomnessRequest.publicKey,
      player: player.publicKey,
      vrfProgram: VRF_PROGRAM_ID,
    })
    .signers([randomnessRequest])
    .rpc();

  console.log("Dice rolled, waiting for VRF...");

  // 3. Wait for VRF fulfillment (poll or use websocket)
  await waitForVRFFulfillment(randomnessRequest.publicKey);

  // 4. Reveal result
  await program.methods
    .revealResult()
    .accounts({
      game: game.publicKey,
      randomnessRequest: randomnessRequest.publicKey,
      player: player.publicKey,
    })
    .rpc();

  // 5. Fetch game result
  const gameAccount = await program.account.game.fetch(game.publicKey);
  console.log("Dice result:", gameAccount.diceResult);
  console.log("Won:", gameAccount.won);
  console.log("Payout:", gameAccount.payout.toString());
}

async function waitForVRFFulfillment(
  requestPubkey: anchor.web3.PublicKey
): Promise<void> {
  const maxAttempts = 30;
  const delayMs = 1000;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const request = await program.account.randomnessRequest.fetch(
        requestPubkey
      );

      if (request.isFulfilled) {
        console.log("VRF fulfilled!");
        return;
      }
    } catch (error) {
      // Account might not exist yet
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error("VRF fulfillment timeout");
}
```

## NFT Minting with Random Traits

```rust
use anchor_lang::prelude::*;

#[program]
pub mod random_nft {
    use super::*;

    pub fn mint_with_random_traits(
        ctx: Context<MintNFT>,
    ) -> Result<()> {
        let randomness = &ctx.accounts.randomness_request;

        require!(
            randomness.is_fulfilled,
            ErrorCode::RandomnessNotFulfilled
        );

        let random_value = randomness.random_value;

        // Generate random traits
        let rarity = determine_rarity(random_value);
        let background = (random_value % 10) as u8;
        let character = ((random_value / 10) % 20) as u8;
        let accessory = ((random_value / 200) % 15) as u8;

        let nft = &mut ctx.accounts.nft;
        nft.rarity = rarity;
        nft.background = background;
        nft.character = character;
        nft.accessory = accessory;

        msg!("NFT minted with traits:");
        msg!("  Rarity: {:?}", rarity);
        msg!("  Background: {}", background);
        msg!("  Character: {}", character);
        msg!("  Accessory: {}", accessory);

        Ok(())
    }
}

fn determine_rarity(random_value: u64) -> Rarity {
    let roll = random_value % 100;

    if roll < 1 {
        Rarity::Legendary // 1%
    } else if roll < 6 {
        Rarity::Epic // 5%
    } else if roll < 21 {
        Rarity::Rare // 15%
    } else if roll < 51 {
        Rarity::Uncommon // 30%
    } else {
        Rarity::Common // 49%
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub enum Rarity {
    Common,
    Uncommon,
    Rare,
    Epic,
    Legendary,
}
```

## Best Practices

### 1. Always Verify Fulfillment

```rust
// ✅ Good: Check fulfillment
require!(
    randomness_request.is_fulfilled,
    ErrorCode::RandomnessNotFulfilled
);

// ❌ Bad: Assume fulfillment
let random = randomness_request.random_value; // May be 0!
```

### 2. Use Appropriate Ranges

```rust
// ✅ Good: Proper modulo for range
let dice = (random_value % 6) + 1; // 1-6

// ❌ Bad: Biased distribution
let dice = (random_value % 7); // 0-6, wrong range
```

### 3. Handle VRF Delays

```typescript
// ✅ Good: Poll with timeout
await waitForVRFFulfillment(request, 30000);

// ❌ Bad: Assume instant
const result = await getResult(); // May fail
```

### 4. Secure State Transitions

```rust
// ✅ Good: State machine
pub enum GameState {
    WaitingForRoll,
    WaitingForResult,
    Finished,
}

// ❌ Bad: No state tracking
// Can call reveal before roll completes
```

## Use Cases

### 1. Gaming

**Perfect for**:
- Dice games
- Loot drops
- Card shuffling
- Random encounters
- Procedural generation

### 2. NFTs

**Perfect for**:
- Random trait assignment
- Fair minting
- Rarity distribution
- Mystery boxes

### 3. Lotteries

**Perfect for**:
- Winner selection
- Prize distribution
- Raffle systems
- Giveaways

### 4. DeFi

**Perfect for**:
- Random liquidation order
- Fair token distribution
- Randomized rewards
- Selection mechanisms

## Security Considerations

### VRF Security Model

**What VRF Protects Against**:
- ✅ Prediction attacks
- ✅ Manipulation attempts
- ✅ Bias introduction
- ✅ Replay attacks

**What VRF Doesn't Protect Against**:
- ❌ Program logic bugs
- ❌ Improper range handling
- ❌ State management issues
- ❌ Economic exploits

### Audit Checklist

- [ ] Randomness fulfillment verified
- [ ] State transitions secured
- [ ] Range calculations correct
- [ ] No bias in distribution
- [ ] Timeout handling implemented
- [ ] Economic incentives aligned

## Common Pitfalls

1. **Not Checking Fulfillment**: Using unfulfilled randomness
2. **Biased Ranges**: Improper modulo operations
3. **No Timeout Handling**: Waiting forever for VRF
4. **State Confusion**: Allowing operations out of order
5. **Economic Exploits**: Not considering game theory

## Troubleshooting

### Issue: Randomness Not Fulfilled

**Solutions**:
- Wait longer (VRF takes time)
- Check VRF oracle status
- Verify request was successful
- Implement polling mechanism

### Issue: Biased Results

**Solutions**:
- Review modulo operations
- Check range calculations
- Test distribution statistically
- Use proper random ranges

### Issue: VRF Request Fails

**Solutions**:
- Check SOL balance for fees
- Verify VRF program ID
- Ensure proper CPI setup
- Review account permissions

## Next Steps

Now that you understand Verifiable Randomness, continue to:

- [Private Rollups](../04-private-rollups/README.md) - Privacy with TEE
- [Exercises](../exercises/README.md) - Practice with VRF

## Additional Resources

- [MagicBlock VRF Documentation](https://docs.magicblock.gg/pages/verifiable-randomness-functions-vrfs/) - Official VRF docs
- [VRF Security](https://docs.magicblock.gg/pages/verifiable-randomness-functions-vrfs/introduction/security) - Security details
- [VRF Best Practices](https://docs.magicblock.gg/pages/verifiable-randomness-functions-vrfs/how-to-guide/best-practices) - Implementation guidelines

## Source Attribution

This content is based on educational materials from:

- **MagicBlock Documentation**: https://docs.magicblock.gg/
- **MagicBlock Labs**: https://magicblock.gg/

---

**Last Updated**: February 17, 2026
