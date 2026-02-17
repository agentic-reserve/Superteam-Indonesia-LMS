# PDA Mint Authority

Learn how to use Program Derived Addresses (PDAs) as mint authorities for program-controlled token operations.

## Overview

This example demonstrates using a PDA as both the mint account address and the mint authority. This pattern enables programs to control token minting without requiring external signers, essential for automated token distribution and DeFi protocols.

## Learning Objectives

- Use PDAs as mint authorities
- Sign CPIs with PDA seeds
- Implement program-controlled minting
- Understand the difference between user and PDA authorities
- Create self-custodial token programs

## Prerequisites

- Completed [SPL Token Minter](../02-spl-token-minter/) example
- Understanding of PDAs and seeds
- Knowledge of `invoke_signed` for CPI signing

---

## PDA Authority Fundamentals

### Why Use PDA Authorities?

**User Authority (Previous Examples):**
```rust
mint::authority = payer.key(), // User controls minting
```
- Requires user signature for every mint
- Manual control
- Not suitable for automated systems

**PDA Authority (This Example):**
```rust
mint::authority = mint_account.key(), // Program controls minting
```
- Program can mint without user intervention
- Automated token distribution
- Essential for DeFi protocols

### Use Cases

1. **Staking Rewards:** Automatically mint rewards
2. **Vesting:** Release tokens on schedule
3. **Liquidity Mining:** Distribute tokens based on activity
4. **Gaming:** Mint in-game currency
5. **Governance:** Automated token distribution

---

## Implementation

### Program Structure

```rust
use anchor_lang::prelude::*;
use instructions::*;
pub mod instructions;

declare_id!("3LFrPHqwk5jMrmiz48BFj6NV2k4NjobgTe1jChzx3JGD");

#[program]
pub mod token_minter {
    use super::*;

    pub fn create_token(
        ctx: Context<CreateToken>,
        token_name: String,
        token_symbol: String,
        token_uri: String,
    ) -> Result<()> {
        create::create_token(ctx, token_name, token_symbol, token_uri)
    }

    pub fn mint_token(ctx: Context<MintToken>, amount: u64) -> Result<()> {
        mint::mint_token(ctx, amount)
    }
}
```

---

## Create Token with PDA Authority

### Accounts Structure

```rust
#[derive(Accounts)]
pub struct CreateToken<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Mint account using PDA as both address and authority
    #[account(
        init,
        seeds = [b"mint"],
        bump,
        payer = payer,
        mint::decimals = 9,
        mint::authority = mint_account.key(), // PDA is authority
        mint::freeze_authority = mint_account.key(),
    )]
    pub mint_account: Account<'info, Mint>,

    /// Metadata account
    #[account(
        mut,
        seeds = [
            b"metadata", 
            token_metadata_program.key().as_ref(), 
            mint_account.key().as_ref()
        ],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub metadata_account: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
```

### Key Concept: Self-Referential PDA

```rust
#[account(
    init,
    seeds = [b"mint"],
    bump,
    mint::authority = mint_account.key(), // PDA is its own authority!
)]
pub mint_account: Account<'info, Mint>,
```

**This means:**
- The mint account address is derived from seeds `[b"mint"]`
- The mint authority is set to the mint account's own address
- Only the program can sign for this PDA

### Implementation

```rust
pub fn create_token(
    ctx: Context<CreateToken>,
    token_name: String,
    token_symbol: String,
    token_uri: String,
) -> Result<()> {
    msg!("Creating metadata account");

    // PDA signer seeds
    let signer_seeds: &[&[&[u8]]] = &[&[
        b"mint", 
        &[ctx.bumps.mint_account]
    ]];

    // CPI signed by PDA
    create_metadata_accounts_v3(
        CpiContext::new(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata_account.to_account_info(),
                mint: ctx.accounts.mint_account.to_account_info(),
                mint_authority: ctx.accounts.mint_account.to_account_info(), // PDA signs
                update_authority: ctx.accounts.mint_account.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        )
        .with_signer(signer_seeds), // Provide PDA seeds for signing
        DataV2 {
            name: token_name,
            symbol: token_symbol,
            uri: token_uri,
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        },
        false,
        true,
        None,
    )?;

    msg!("Token created successfully.");
    Ok(())
}
```

---

## Mint with PDA Authority

### Accounts Structure

```rust
#[derive(Accounts)]
pub struct MintToken<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    pub recipient: SystemAccount<'info>,

    /// PDA mint account
    #[account(
        mut,
        seeds = [b"mint"],
        bump,
    )]
    pub mint_account: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint_account,
        associated_token::authority = recipient,
    )]
    pub associated_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
```

### Implementation

```rust
pub fn mint_token(ctx: Context<MintToken>, amount: u64) -> Result<()> {
    msg!("Minting tokens to associated token account...");
    msg!("Mint: {}", &ctx.accounts.mint_account.key());
    msg!("Token Address: {}", &ctx.accounts.associated_token_account.key());

    // PDA signer seeds
    let signer_seeds: &[&[&[u8]]] = &[&[
        b"mint", 
        &[ctx.bumps.mint_account]
    ]];

    // Mint tokens using PDA authority
    mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint_account.to_account_info(),
                to: ctx.accounts.associated_token_account.to_account_info(),
                authority: ctx.accounts.mint_account.to_account_info(), // PDA signs
            },
        )
        .with_signer(signer_seeds), // Provide PDA seeds
        amount * 10u64.pow(ctx.accounts.mint_account.decimals as u32),
    )?;

    msg!("Token minted successfully.");
    Ok(())
}
```

---

## Key Concepts

### 1. PDA Signing

```rust
let signer_seeds: &[&[&[u8]]] = &[&[
    b"mint",                    // Seed
    &[ctx.bumps.mint_account]   // Bump
]];

CpiContext::new(/* ... */)
    .with_signer(signer_seeds)  // Enable PDA signing
```

### 2. Self-Custodial Pattern

```text
Traditional:
User → Signs → Mint Instruction

PDA Authority:
Program → Derives PDA → Signs → Mint Instruction
```

### 3. Security Considerations

**Access Control:**
```rust
#[account(mut)]
pub payer: Signer<'info>, // Anyone can call

// Add constraints for restricted access:
#[account(
    mut,
    constraint = payer.key() == AUTHORIZED_MINTER @ ErrorCode::Unauthorized
)]
pub payer: Signer<'info>,
```

---

## Testing

```typescript
import * as anchor from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

describe("PDA Mint Authority", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.TokenMinter;

  // Derive PDA mint address
  const [mintPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint")],
    program.programId
  );

  it("Create token with PDA authority", async () => {
    await program.methods
      .createToken("Test Token", "TEST", "https://example.com/metadata.json")
      .accounts({
        payer: provider.wallet.publicKey,
        mintAccount: mintPDA,
      })
      .rpc();

    console.log("Token created with PDA authority:", mintPDA.toBase58());
  });

  it("Mint tokens using PDA", async () => {
    const recipient = provider.wallet.publicKey;
    const ata = getAssociatedTokenAddressSync(mintPDA, recipient);

    await program.methods
      .mintToken(new anchor.BN(100))
      .accounts({
        payer: provider.wallet.publicKey,
        recipient: recipient,
        mintAccount: mintPDA,
        associatedTokenAccount: ata,
      })
      .rpc();

    console.log("Tokens minted to:", ata.toBase58());
  });
});
```

---

## Common Issues and Solutions

### Issue 1: Invalid Seeds

**Error:** "Seeds constraint violation"

**Solution:** Ensure seeds match exactly:
```rust
seeds = [b"mint"], // Must match derivation
```

### Issue 2: Missing Signer Seeds

**Error:** "Missing required signature"

**Solution:** Always use `.with_signer()` for PDA CPIs:
```rust
CpiContext::new(/* ... */).with_signer(signer_seeds)
```

### Issue 3: Wrong Bump

**Error:** "Invalid bump"

**Solution:** Use `ctx.bumps` provided by Anchor:
```rust
&[ctx.bumps.mint_account] // Correct
&[bump] // Wrong - don't hardcode
```

---

## Advanced Patterns

### Multiple PDA Authorities

```rust
#[account(
    seeds = [b"mint", user.key().as_ref()],
    bump,
)]
pub mint_account: Account<'info, Mint>,
```
- User-specific mints
- Isolated token economies

### Conditional Minting

```rust
pub fn mint_token(ctx: Context<MintToken>, amount: u64) -> Result<()> {
    let clock = Clock::get()?;
    require!(
        clock.unix_timestamp >= VESTING_START,
        ErrorCode::VestingNotStarted
    );
    
    // Mint tokens
    Ok(())
}
```

### Rate-Limited Minting

```rust
#[account(
    init_if_needed,
    payer = payer,
    space = 8 + 8 + 8,
    seeds = [b"rate_limit", recipient.key().as_ref()],
    bump
)]
pub rate_limit: Account<'info, RateLimit>,

#[account]
pub struct RateLimit {
    pub last_mint: i64,
    pub amount_minted: u64,
}
```

---

## Comparison: User vs PDA Authority

| Feature | User Authority | PDA Authority |
|---------|---------------|---------------|
| Control | User | Program |
| Signing | User keypair | PDA seeds |
| Automation | Manual | Automatic |
| Use Case | Simple tokens | DeFi, gaming |
| Security | User responsibility | Program logic |

---

## Best Practices

1. **Use Descriptive Seeds:** `[b"mint", b"rewards"]` better than `[b"m"]`
2. **Add Access Control:** Restrict who can trigger minting
3. **Validate Amounts:** Check mint limits and caps
4. **Emit Events:** Log minting operations
5. **Test Thoroughly:** Verify PDA derivation and signing

---

## Next Steps

- Learn about [Escrow](../07-escrow/) for secure token trading
- Explore [Token Swap](../08-token-swap/) for AMM mechanics
- Study [Token Fundraiser](../09-token-fundraiser/) for ICO patterns

---

## Additional Resources

- [Anchor PDA Guide](https://book.anchor-lang.com/anchor_in_depth/PDAs.html)
- [Solana Cookbook - PDAs](https://solanacookbook.com/core-concepts/pdas.html)
- [CPI Signing](https://book.anchor-lang.com/anchor_in_depth/CPIs.html#cpi-with-pda-signer)

---

**Source:** Adapted from [Solana Program Examples](https://github.com/solana-developers/program-examples)
