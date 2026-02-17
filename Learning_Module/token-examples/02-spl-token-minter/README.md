# SPL Token Minter

Learn how to mint SPL Tokens to user wallets using Associated Token Accounts (ATAs).

## Overview

Minting SPL Tokens is conceptually straightforward, but requires understanding how Solana tracks token balances. This example demonstrates how to create tokens and mint them to users through Associated Token Accounts.

## Learning Objectives

By completing this example, you will learn how to:

- Understand Associated Token Accounts (ATAs)
- Create and initialize ATAs for recipients
- Mint tokens to user wallets
- Handle decimal adjustments when minting
- Implement minting in both Anchor and Native Rust

## Prerequisites

- Completed [Create Token](../01-create-token/) example
- Understanding of SPL Token mints
- Basic knowledge of Program Derived Addresses (PDAs)

---

## Understanding Associated Token Accounts

### The Problem

Every Solana account tracks its SOL balance by default, but how can accounts track balances of thousands of different SPL Tokens?

**Answer:** They can't. Instead, we use separate accounts called Associated Token Accounts (ATAs).

### What are ATAs?

Associated Token Accounts are specialized accounts that:

- Track a specific wallet's balance of a specific token
- Are derived deterministically from the wallet address and mint address
- Act as simple counters pointing to a Mint and a Wallet

### Example Flow

If you create the JOE token and want to track someone's balance:

```text
1. Create the JOE token (mint)
2. Create an Associated Token Account for the user's wallet
   - This ATA is specific to: JOE token + User's wallet
3. Mint or transfer JOE tokens to their ATA
```

### ATA Address Derivation

```typescript
// ATAs are PDAs derived from:
const ata = findProgramAddress(
  [
    walletAddress,
    TOKEN_PROGRAM_ID,
    mintAddress
  ],
  ASSOCIATED_TOKEN_PROGRAM_ID
);
```

---

## Implementation

This example builds on the Create Token example by adding minting functionality.

### Program Structure

```text
spl-token-minter/
├── src/
│   ├── lib.rs              # Program entry point
│   └── instructions/
│       ├── mod.rs          # Module exports
│       ├── create.rs       # Token creation logic
│       └── mint.rs         # Token minting logic
```

---

## Anchor Implementation

### Main Program (lib.rs)

```rust
use anchor_lang::prelude::*;

pub mod instructions;
use instructions::*;

declare_id!("3of89Z9jwek9zrFgpCWc9jZvQvitpVMxpZNsrAD2vQUD");

#[program]
pub mod spl_token_minter {
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

### Create Token Instruction (create.rs)

```rust
use {
    anchor_lang::prelude::*,
    anchor_spl::{
        metadata::{
            create_metadata_accounts_v3, 
            mpl_token_metadata::types::DataV2,
            CreateMetadataAccountsV3, 
            Metadata,
        },
        token::{Mint, Token},
    },
};

#[derive(Accounts)]
pub struct CreateToken<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 9,
        mint::authority = payer.key(),
        mint::freeze_authority = payer.key(),
    )]
    pub mint_account: Account<'info, Mint>,
    
    /// Metadata account derived from mint
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

pub fn create_token(
    ctx: Context<CreateToken>,
    token_name: String,
    token_symbol: String,
    token_uri: String,
) -> Result<()> {
    msg!("Creating metadata account");

    create_metadata_accounts_v3(
        CpiContext::new(
            ctx.accounts.token_metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata_account.to_account_info(),
                mint: ctx.accounts.mint_account.to_account_info(),
                mint_authority: ctx.accounts.payer.to_account_info(),
                update_authority: ctx.accounts.payer.to_account_info(),
                payer: ctx.accounts.payer.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        ),
        DataV2 {
            name: token_name,
            symbol: token_symbol,
            uri: token_uri,
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        },
        false, // Is mutable
        true,  // Update authority is signer
        None,  // Collection details
    )?;

    msg!("Token created successfully.");
    Ok(())
}
```

### Mint Token Instruction (mint.rs)

```rust
use {
    anchor_lang::prelude::*,
    anchor_spl::{
        associated_token::AssociatedToken,
        token::{mint_to, Mint, MintTo, Token, TokenAccount},
    },
};

#[derive(Accounts)]
pub struct MintToken<'info> {
    #[account(mut)]
    pub mint_authority: Signer<'info>,

    pub recipient: SystemAccount<'info>,
    
    #[account(mut)]
    pub mint_account: Account<'info, Mint>,
    
    /// Associated Token Account for recipient
    /// Created automatically if it doesn't exist
    #[account(
        init_if_needed,
        payer = mint_authority,
        associated_token::mint = mint_account,
        associated_token::authority = recipient,
    )]
    pub associated_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn mint_token(ctx: Context<MintToken>, amount: u64) -> Result<()> {
    msg!("Minting tokens to associated token account...");
    msg!("Mint: {}", &ctx.accounts.mint_account.key());
    msg!("Token Address: {}", &ctx.accounts.associated_token_account.key());

    // Calculate amount with decimals
    let amount_with_decimals = amount * 10u64.pow(ctx.accounts.mint_account.decimals as u32);

    // Invoke the mint_to instruction on the token program
    mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint_account.to_account_info(),
                to: ctx.accounts.associated_token_account.to_account_info(),
                authority: ctx.accounts.mint_authority.to_account_info(),
            },
        ),
        amount_with_decimals,
    )?;

    msg!("Token minted successfully.");
    Ok(())
}
```

### Key Concepts

**1. Automatic ATA Creation:**
```rust
#[account(
    init_if_needed,
    payer = mint_authority,
    associated_token::mint = mint_account,
    associated_token::authority = recipient,
)]
```
- `init_if_needed` creates the ATA if it doesn't exist
- `associated_token::mint` links to the token mint
- `associated_token::authority` sets the owner

**2. Decimal Adjustment:**
```rust
let amount_with_decimals = amount * 10u64.pow(ctx.accounts.mint_account.decimals as u32);
```
- Converts human-readable amount to raw token units
- Example: 100 tokens with 9 decimals = 100_000_000_000 raw units

**3. Mint Authority:**
```rust
#[account(mut)]
pub mint_authority: Signer<'info>,
```
- Only the mint authority can mint new tokens
- Must be a signer of the transaction

---

## Testing

### TypeScript Test Example

```typescript
import * as anchor from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Keypair } from "@solana/web3.js";
import { BN } from "bn.js";
import type { SplTokenMinter } from "../target/types/spl_token_minter";

describe("SPL Token Minter", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;
  const program = anchor.workspace.SplTokenMinter as anchor.Program<SplTokenMinter>;

  const metadata = {
    name: "Solana Gold",
    symbol: "GOLDSOL",
    uri: "https://raw.githubusercontent.com/solana-developers/program-examples/new-examples/tokens/tokens/.assets/spl-token.json",
  };

  const mintKeypair = new Keypair();

  it("Create an SPL Token!", async () => {
    const transactionSignature = await program.methods
      .createToken(metadata.name, metadata.symbol, metadata.uri)
      .accounts({
        payer: payer.publicKey,
        mintAccount: mintKeypair.publicKey,
      })
      .signers([mintKeypair])
      .rpc();

    console.log("Success!");
    console.log(`   Mint Address: ${mintKeypair.publicKey}`);
    console.log(`   Transaction Signature: ${transactionSignature}`);
  });

  it("Mint some tokens to your wallet!", async () => {
    // Derive the ATA address for the mint and payer
    const associatedTokenAccountAddress = getAssociatedTokenAddressSync(
      mintKeypair.publicKey,
      payer.publicKey
    );

    // Amount of tokens to mint (will be adjusted for decimals)
    const amount = new BN(100);

    // Mint tokens to the ATA
    const transactionSignature = await program.methods
      .mintToken(amount)
      .accounts({
        mintAuthority: payer.publicKey,
        recipient: payer.publicKey,
        mintAccount: mintKeypair.publicKey,
        associatedTokenAccount: associatedTokenAccountAddress,
      })
      .rpc();

    console.log("Success!");
    console.log(`   Associated Token Account: ${associatedTokenAccountAddress}`);
    console.log(`   Transaction Signature: ${transactionSignature}`);
  });
});
```

### Running Tests

```bash
# Install dependencies
pnpm install

# Run tests
anchor test
```

---

## Client Integration

### Using @solana/spl-token

```typescript
import { 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  mintTo 
} from "@solana/spl-token";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

async function mintTokensToUser(
  connection: Connection,
  mintAddress: PublicKey,
  recipientAddress: PublicKey,
  mintAuthority: Keypair,
  amount: number
) {
  // Get or create ATA
  const ata = await getAssociatedTokenAddress(
    mintAddress,
    recipientAddress
  );

  // Check if ATA exists
  const accountInfo = await connection.getAccountInfo(ata);
  
  if (!accountInfo) {
    // Create ATA if it doesn't exist
    const createAtaIx = createAssociatedTokenAccountInstruction(
      mintAuthority.publicKey, // payer
      ata,                      // ata address
      recipientAddress,         // owner
      mintAddress               // mint
    );
    
    const tx = new Transaction().add(createAtaIx);
    await connection.sendTransaction(tx, [mintAuthority]);
  }

  // Mint tokens
  await mintTo(
    connection,
    mintAuthority,
    mintAddress,
    ata,
    mintAuthority,
    amount * 10 ** 9 // Adjust for decimals
  );
}
```

---

## Common Issues and Solutions

### Issue 1: ATA Already Exists

**Error:** "Account already initialized"

**Solution:** Use `init_if_needed` instead of `init` in Anchor, or check if the account exists before creating it in client code.

### Issue 2: Insufficient Authority

**Error:** "Mint authority mismatch"

**Solution:** Ensure the signer is the mint authority set during token creation.

```rust
// Check mint authority
require!(
    ctx.accounts.mint_account.mint_authority == COption::Some(ctx.accounts.mint_authority.key()),
    ErrorCode::InvalidMintAuthority
);
```

### Issue 3: Decimal Confusion

**Problem:** Minting 100 tokens but user receives 0.0000001

**Solution:** Always multiply by 10^decimals:

```rust
// Correct
let amount = 100 * 10u64.pow(9); // 100_000_000_000

// Incorrect
let amount = 100; // Only 0.0000001 tokens
```

### Issue 4: Insufficient Rent

**Error:** "Insufficient funds for rent"

**Solution:** Ensure the payer has enough SOL for ATA rent (~0.00203 SOL):

```bash
solana airdrop 2 --url devnet
```

---

## Best Practices

1. **Use init_if_needed:** Prevents errors when ATA already exists
2. **Validate Authority:** Always check mint authority before minting
3. **Handle Decimals Properly:** Use the mint's decimal value for calculations
4. **Check Balances:** Verify sufficient SOL for rent before operations
5. **Batch Operations:** Create multiple ATAs in a single transaction when possible

---

## Advanced Topics

### Minting to Multiple Recipients

```rust
pub fn mint_to_multiple(
    ctx: Context<MintToMultiple>, 
    recipients: Vec<Pubkey>,
    amounts: Vec<u64>
) -> Result<()> {
    require!(recipients.len() == amounts.len(), ErrorCode::LengthMismatch);
    
    for (recipient, amount) in recipients.iter().zip(amounts.iter()) {
        // Derive ATA for each recipient
        // Mint tokens
    }
    
    Ok(())
}
```

### Capped Supply

```rust
pub fn mint_token(ctx: Context<MintToken>, amount: u64) -> Result<()> {
    let max_supply = 1_000_000 * 10u64.pow(9);
    let current_supply = ctx.accounts.mint_account.supply;
    
    require!(
        current_supply + amount <= max_supply,
        ErrorCode::MaxSupplyReached
    );
    
    // Mint tokens
    Ok(())
}
```

---

## Next Steps

- Learn about [Transfer Tokens](../03-transfer-tokens/) to move tokens between accounts
- Explore [NFT Minter](../04-nft-minter/) to create unique NFTs with limited supply
- Study [PDA Mint Authority](../06-pda-mint-authority/) for program-controlled minting

---

## Additional Resources

- [SPL Token Program Documentation](https://spl.solana.com/token)
- [Associated Token Account Program](https://spl.solana.com/associated-token-account)
- [Anchor Book - Token Program](https://book.anchor-lang.com/anchor_in_depth/CPIs.html)
- [Solana Cookbook - ATAs](https://solanacookbook.com/references/accounts.html#associated-token-account)

---

**Source:** Adapted from [Solana Program Examples](https://github.com/solana-developers/program-examples)
