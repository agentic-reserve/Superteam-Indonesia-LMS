# Token Economics

## Overview

Token economics (tokenomics) is the study of how tokens function within an ecosystem. This lesson covers economic models, supply mechanics, distribution strategies, and incentive design for tokens on Solana. Understanding tokenomics is essential for designing sustainable DeFi protocols and applications.

**Difficulty:** Beginner  
**Estimated Time:** 2-3 hours

## Learning Objectives

After completing this lesson, you will be able to:

- Design token supply models (fixed, inflationary, deflationary)
- Implement vesting and distribution mechanisms
- Understand token utility and value accrual
- Create incentive structures for DeFi protocols
- Analyze tokenomics of existing projects

## Prerequisites

- Completed [SPL Tokens](../../basics/03-tokens/README.md)
- Understanding of basic economics (supply/demand, incentives)
- Familiarity with DeFi concepts

## Token Supply Models

### Fixed Supply

Tokens with a maximum cap that cannot be exceeded.

**Characteristics:**
- Deflationary pressure as demand increases
- Scarcity creates value
- No ongoing inflation

**Example: Bitcoin-style Cap**

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, MintTo};

#[program]
pub mod fixed_supply_token {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, max_supply: u64) -> Result<()> {
        let token_config = &mut ctx.accounts.token_config;
        token_config.max_supply = max_supply;
        token_config.current_supply = 0;
        token_config.mint = ctx.accounts.mint.key();
        Ok(())
    }

    pub fn mint_tokens(ctx: Context<MintTokens>, amount: u64) -> Result<()> {
        let token_config = &mut ctx.accounts.token_config;
        
        // Check supply cap
        require!(
            token_config.current_supply + amount <= token_config.max_supply,
            ErrorCode::MaxSupplyExceeded
        );
        
        // Mint tokens
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, amount)?;
        
        token_config.current_supply += amount;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + TokenConfig::LEN
    )]
    pub token_config: Account<'info, TokenConfig>,
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintTokens<'info> {
    #[account(mut)]
    pub token_config: Account<'info, TokenConfig>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    /// CHECK: Token account to mint to
    #[account(mut)]
    pub token_account: AccountInfo<'info>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct TokenConfig {
    pub max_supply: u64,
    pub current_supply: u64,
    pub mint: Pubkey,
}

impl TokenConfig {
    pub const LEN: usize = 8 + 8 + 32;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Maximum supply exceeded")]
    MaxSupplyExceeded,
}
```

### Inflationary Supply

Tokens that increase in supply over time through continuous minting.

**Characteristics:**
- Rewards for staking or participation
- Dilution of existing holders
- Can fund ongoing development

**Example: Staking Rewards**

```rust
#[program]
pub mod inflationary_token {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        annual_inflation_bps: u16,  // Basis points (100 = 1%)
    ) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.annual_inflation_bps = annual_inflation_bps;
        config.last_inflation_slot = Clock::get()?.slot;
        config.total_staked = 0;
        Ok(())
    }

    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        let config = &mut ctx.accounts.config;
        let stake_account = &mut ctx.accounts.stake_account;
        
        // Transfer tokens to stake vault
        let cpi_accounts = token::Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.stake_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;
        
        // Update stake account
        stake_account.amount += amount;
        stake_account.last_claim_slot = Clock::get()?.slot;
        config.total_staked += amount;
        
        Ok(())
    }

    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let config = &ctx.accounts.config;
        let stake_account = &mut ctx.accounts.stake_account;
        let clock = Clock::get()?;
        
        // Calculate rewards based on time staked
        let slots_elapsed = clock.slot - stake_account.last_claim_slot;
        let slots_per_year = 2 * 365 * 24 * 60 * 60; // ~2 slots/sec
        
        let rewards = (stake_account.amount as u128)
            .checked_mul(config.annual_inflation_bps as u128)
            .unwrap()
            .checked_mul(slots_elapsed as u128)
            .unwrap()
            .checked_div(10_000)
            .unwrap()
            .checked_div(slots_per_year)
            .unwrap() as u64;
        
        // Mint rewards
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, rewards)?;
        
        stake_account.last_claim_slot = clock.slot;
        
        Ok(())
    }
}

#[account]
pub struct InflationConfig {
    pub annual_inflation_bps: u16,
    pub last_inflation_slot: u64,
    pub total_staked: u64,
}

#[account]
pub struct StakeAccount {
    pub owner: Pubkey,
    pub amount: u64,
    pub last_claim_slot: u64,
}
```

### Deflationary Supply

Tokens that decrease in supply through burning mechanisms.

**Characteristics:**
- Increasing scarcity over time
- Value accrual through supply reduction
- Often combined with transaction fees

**Example: Burn on Transfer**

```rust
#[program]
pub mod deflationary_token {
    use super::*;

    pub fn transfer_with_burn(
        ctx: Context<TransferWithBurn>,
        amount: u64,
        burn_bps: u16,  // Basis points to burn (100 = 1%)
    ) -> Result<()> {
        // Calculate burn amount
        let burn_amount = (amount as u128)
            .checked_mul(burn_bps as u128)
            .unwrap()
            .checked_div(10_000)
            .unwrap() as u64;
        
        let transfer_amount = amount - burn_amount;
        
        // Transfer tokens
        let cpi_accounts = token::Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, transfer_amount)?;
        
        // Burn tokens
        let burn_accounts = token::Burn {
            mint: ctx.accounts.mint.to_account_info(),
            from: ctx.accounts.from.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let burn_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            burn_accounts
        );
        token::burn(burn_ctx, burn_amount)?;
        
        Ok(())
    }
}
```

## Token Distribution

### Vesting Schedules

Time-locked token distribution to prevent immediate selling.

**Linear Vesting Example:**

```rust
#[program]
pub mod token_vesting {
    use super::*;

    pub fn create_vesting_schedule(
        ctx: Context<CreateVestingSchedule>,
        total_amount: u64,
        start_time: i64,
        end_time: i64,
    ) -> Result<()> {
        let vesting = &mut ctx.accounts.vesting_account;
        vesting.beneficiary = ctx.accounts.beneficiary.key();
        vesting.total_amount = total_amount;
        vesting.released_amount = 0;
        vesting.start_time = start_time;
        vesting.end_time = end_time;
        vesting.token_account = ctx.accounts.token_account.key();
        
        Ok(())
    }

    pub fn release_vested_tokens(ctx: Context<ReleaseVestedTokens>) -> Result<()> {
        let vesting = &mut ctx.accounts.vesting_account;
        let clock = Clock::get()?;
        
        // Calculate vested amount
        let vested_amount = if clock.unix_timestamp >= vesting.end_time {
            vesting.total_amount
        } else if clock.unix_timestamp <= vesting.start_time {
            0
        } else {
            let elapsed = clock.unix_timestamp - vesting.start_time;
            let duration = vesting.end_time - vesting.start_time;
            (vesting.total_amount as u128)
                .checked_mul(elapsed as u128)
                .unwrap()
                .checked_div(duration as u128)
                .unwrap() as u64
        };
        
        let releasable = vested_amount - vesting.released_amount;
        require!(releasable > 0, ErrorCode::NoTokensToRelease);
        
        // Transfer vested tokens
        let cpi_accounts = token::Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.beneficiary_token_account.to_account_info(),
            authority: ctx.accounts.vault_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, releasable)?;
        
        vesting.released_amount += releasable;
        
        Ok(())
    }
}

#[account]
pub struct VestingAccount {
    pub beneficiary: Pubkey,
    pub total_amount: u64,
    pub released_amount: u64,
    pub start_time: i64,
    pub end_time: i64,
    pub token_account: Pubkey,
}
```

### Cliff Vesting

No tokens released until a specific date, then linear vesting begins.

```rust
pub fn calculate_vested_with_cliff(
    total_amount: u64,
    start_time: i64,
    cliff_time: i64,
    end_time: i64,
    current_time: i64,
) -> u64 {
    if current_time < cliff_time {
        return 0;
    }
    
    if current_time >= end_time {
        return total_amount;
    }
    
    let elapsed = current_time - cliff_time;
    let duration = end_time - cliff_time;
    
    (total_amount as u128)
        .checked_mul(elapsed as u128)
        .unwrap()
        .checked_div(duration as u128)
        .unwrap() as u64
}
```

## Token Utility

### Governance Tokens

Tokens that grant voting rights in protocol decisions.

**Key Features:**
- Voting power proportional to holdings
- Proposal creation and voting
- Time-locked voting for security

### Utility Tokens

Tokens required to use protocol features.

**Examples:**
- Gas tokens (like SOL)
- Access tokens (staking for premium features)
- Discount tokens (fee reductions)

### Reward Tokens

Tokens distributed as incentives for participation.

**Examples:**
- Liquidity mining rewards
- Staking rewards
- Referral bonuses

## Value Accrual Mechanisms

### Fee Distribution

Protocol fees distributed to token holders.

```rust
#[program]
pub mod fee_distribution {
    use super::*;

    pub fn distribute_fees(ctx: Context<DistributeFees>, fee_amount: u64) -> Result<()> {
        let config = &ctx.accounts.config;
        let staker = &ctx.accounts.staker;
        
        // Calculate share based on stake
        let share = (fee_amount as u128)
            .checked_mul(staker.staked_amount as u128)
            .unwrap()
            .checked_div(config.total_staked as u128)
            .unwrap() as u64;
        
        // Transfer fee share
        let cpi_accounts = token::Transfer {
            from: ctx.accounts.fee_vault.to_account_info(),
            to: ctx.accounts.staker_token_account.to_account_info(),
            authority: ctx.accounts.vault_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, share)?;
        
        Ok(())
    }
}
```

### Buyback and Burn

Protocol uses revenue to buy tokens and burn them.

```rust
pub fn buyback_and_burn(
    ctx: Context<BuybackAndBurn>,
    usdc_amount: u64,
) -> Result<()> {
    // 1. Swap USDC for protocol token (via AMM)
    // 2. Burn acquired tokens
    
    let burn_accounts = token::Burn {
        mint: ctx.accounts.mint.to_account_info(),
        from: ctx.accounts.token_account.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
    };
    let burn_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        burn_accounts
    );
    token::burn(burn_ctx, acquired_tokens)?;
    
    Ok(())
}
```

## Incentive Design

### Liquidity Mining

Reward users for providing liquidity.

**Key Considerations:**
- Emission schedule (front-loaded vs. linear)
- Lock-up periods
- Impermanent loss compensation

### Staking Rewards

Reward users for locking tokens.

**Design Patterns:**
- Fixed APY vs. variable rewards
- Lock-up duration bonuses
- Compound staking

### Referral Programs

Reward users for bringing new participants.

```rust
#[program]
pub mod referral_program {
    use super::*;

    pub fn register_referral(
        ctx: Context<RegisterReferral>,
        referrer: Pubkey,
    ) -> Result<()> {
        let referral = &mut ctx.accounts.referral_account;
        referral.referee = ctx.accounts.user.key();
        referral.referrer = referrer;
        referral.rewards_claimed = 0;
        Ok(())
    }

    pub fn claim_referral_reward(
        ctx: Context<ClaimReferralReward>,
        referee_volume: u64,
        reward_bps: u16,
    ) -> Result<()> {
        let reward = (referee_volume as u128)
            .checked_mul(reward_bps as u128)
            .unwrap()
            .checked_div(10_000)
            .unwrap() as u64;
        
        // Mint reward tokens
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.referrer_token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, reward)?;
        
        Ok(())
    }
}
```

## Real-World Examples

### Percolator Insurance Fund

The Percolator protocol uses an insurance fund to absorb losses and maintain solvency.

**Key Features:**
- Trading fees accrue to insurance fund
- Insurance fund is senior to all profit claims
- Provides buffer against undercollateralization

**Source:** [percolator/percolator](../../../percolator/percolator/)
- `spec.md` - Insurance fund mechanics (Section 2.2, 3.1)
- Risk engine uses insurance as senior claim: `Residual = max(0, V - C_tot - I)`

### Token Supply Management

Real-world token programs implement various supply controls:

```typescript
// Example from percolator-cli: Token operations
// Source: percolator/percolator-cli/src/commands/deposit.ts

async function deposit(
  connection: Connection,
  payer: Keypair,
  slabPubkey: PublicKey,
  userIdx: number,
  amount: number
) {
  // Get user's token account
  const userTokenAccount = await getAssociatedTokenAddress(
    mint,
    payer.publicKey
  );
  
  // Transfer tokens to vault
  const ix = createDepositInstruction({
    slab: slabPubkey,
    userAccount: userPda,
    userTokenAccount,
    vault: vaultPubkey,
    tokenProgram: TOKEN_PROGRAM_ID,
    user: payer.publicKey,
  }, {
    userIdx,
    amount: new BN(amount),
  });
  
  const tx = new Transaction().add(ix);
  await sendAndConfirmTransaction(connection, tx, [payer]);
}
```

## Tokenomics Analysis Framework

When evaluating a token's economics, consider:

1. **Supply Mechanics**
   - Total supply (fixed or variable)
   - Emission schedule
   - Burn mechanisms

2. **Distribution**
   - Initial allocation (team, investors, community)
   - Vesting schedules
   - Fair launch vs. pre-mine

3. **Utility**
   - What does the token do?
   - Is it necessary for the protocol?
   - Can it be replaced?

4. **Value Accrual**
   - How does value flow to token holders?
   - Fee distribution mechanisms
   - Buyback programs

5. **Incentives**
   - What behaviors are rewarded?
   - Are incentives sustainable?
   - Alignment with protocol goals

## Best Practices

1. **Sustainable Emissions** - Don't over-inflate supply
2. **Clear Utility** - Token should have real use case
3. **Fair Distribution** - Avoid excessive team/insider allocation
4. **Transparent Vesting** - Clearly communicate unlock schedules
5. **Value Accrual** - Design mechanisms for token value capture
6. **Aligned Incentives** - Reward behaviors that benefit protocol
7. **Security First** - Audit tokenomics for exploits

## Common Pitfalls

1. **Hyperinflation** - Excessive emissions devalue token
2. **No Utility** - Token has no real purpose
3. **Unfair Launch** - Insiders dump on retail
4. **Ponzi Mechanics** - Unsustainable reward structures
5. **Centralized Control** - Team can manipulate supply
6. **No Value Capture** - Token doesn't benefit from protocol success

## Exercises

1. Design a tokenomics model for a lending protocol
2. Implement a vesting contract with cliff
3. Create a staking rewards calculator
4. Build a fee distribution mechanism
5. Analyze tokenomics of existing Solana projects

## Source Attribution

This content is based on educational materials from:

- **Percolator**: [percolator/percolator](../../../percolator/percolator/)
  - `spec.md` - Insurance fund and capital mechanics
  - `README.md` - Risk engine economic model
- **Percolator CLI**: [percolator/percolator-cli](../../../percolator/percolator-cli/)
  - Token deposit and withdrawal patterns
  - Collateral management examples
- **SPL Token Program**: https://spl.solana.com/token
- **Solana Basics**: [Tokens](../../basics/03-tokens/README.md)

## Next Steps

- [AMM Basics](../02-amm-basics/README.md) - Learn automated market makers
- [Perpetual Futures](../03-perpetual-futures/README.md) - Advanced DeFi products
- [Security](../../security/README.md) - Secure your tokenomics implementation

## Additional Resources

- [Token Economics 101](https://www.coindesk.com/learn/what-is-tokenomics/)
- [Designing Token Economics](https://medium.com/@arjunblj/designing-token-economics-8a8d0b2b3a3d)
- [Solana Token Extensions](https://spl.solana.com/token-2022/extensions)
