# Create an SPL Token

Learn how to create SPL Tokens on Solana with metadata including token name, symbol, and icon.

## Overview

All tokens on Solana - including Non-Fungible Tokens (NFTs) - are SPL Tokens that follow the SPL Token standard (similar to ERC-20 on Ethereum). This example demonstrates the fundamental process of creating a new token mint with associated metadata.

## Learning Objectives

By completing this example, you will learn how to:

- Understand the SPL Token standard and mint accounts
- Create a new token mint with custom decimals
- Add metadata (name, symbol, URI) using Metaplex Token Metadata Program
- Implement token creation in both Anchor and Native Rust
- Test token creation with TypeScript

## Prerequisites

- Basic understanding of Solana accounts and programs
- Familiarity with Rust programming
- Knowledge of TypeScript for testing
- Anchor framework installed (for Anchor version)

## Token Fundamentals

### Decimals

SPL Tokens use decimals to represent fractional amounts:

```text
Default SPL Tokens  :   9 decimals
NFTs                :   0 decimals
```

**How Decimals Work:**
```text
Consider token JOE with 9 decimals:
1 JOE = quantity * 10^(-9) = 1 * 10^(-9) = 0.000000001
```

### Mint Account Structure

A Mint account describes information about a token:

```typescript
{
    isInitialized: boolean,
    supply: u64,              // Current supply of tokens
    decimals: u8,             // Number of decimal places
    mintAuthority: Pubkey,    // Account authorized to mint new tokens
    freezeAuthority: Pubkey,  // Account authorized to freeze tokens
}
```

### Metadata Account

Token metadata (name, symbol, image) is stored separately in a Metadata Account:

```typescript
{
    title: string,
    symbol: string,
    uri: string,              // URI to hosted image/metadata JSON
}
```

> **Note:** Metaplex is the standard for SPL Token metadata on Solana. Learn more at [Metaplex Token Metadata Program](https://docs.metaplex.com/).

## Implementation Steps

Creating an SPL Token involves three main steps:

1. **Create an account for the Mint** - Allocate space and rent
2. **Initialize the Mint Account** - Set decimals and authorities
3. **Create metadata account** - Add token name, symbol, and URI

---

## Anchor Implementation

### Program Code

The Anchor program simplifies token creation with built-in macros and CPIs:

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

declare_id!("GwvQ53QTu1xz3XXYfG5m5jEqwhMBvVBudPS8TUuFYnhT");

#[program]
pub mod create_token {
    use super::*;

    pub fn create_token_mint(
        ctx: Context<CreateTokenMint>,
        _token_decimals: u8,
        token_name: String,
        token_symbol: String,
        token_uri: String,
    ) -> Result<()> {
        msg!("Creating metadata account...");
        msg!("Metadata account address: {}", &ctx.accounts.metadata_account.key());

        // Cross Program Invocation (CPI) to Token Metadata Program
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

        msg!("Token mint created successfully.");
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(_token_decimals: u8)]
pub struct CreateTokenMint<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Metadata account derived from mint address
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
    
    /// Create new mint account with specified decimals
    #[account(
        init,
        payer = payer,
        mint::decimals = _token_decimals,
        mint::authority = payer.key(),
    )]
    pub mint_account: Account<'info, Mint>,

    pub token_metadata_program: Program<'info, Metadata>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
```

### Key Concepts

**1. Account Validation with Seeds:**
```rust
#[account(
    mut,
    seeds = [b"metadata", token_metadata_program.key().as_ref(), mint_account.key().as_ref()],
    bump,
    seeds::program = token_metadata_program.key(),
)]
```
- Derives the metadata account address using PDAs
- Ensures the correct metadata account is used

**2. Mint Initialization:**
```rust
#[account(
    init,
    payer = payer,
    mint::decimals = _token_decimals,
    mint::authority = payer.key(),
)]
```
- `init` creates and initializes the mint account
- `mint::decimals` sets token precision
- `mint::authority` sets who can mint new tokens

**3. Cross-Program Invocation (CPI):**
```rust
create_metadata_accounts_v3(
    CpiContext::new(/* ... */),
    DataV2 { /* metadata */ },
    false, // is_mutable
    true,  // update_authority_is_signer
    None,  // collection_details
)
```
- Calls Metaplex Token Metadata Program
- Creates metadata account with token information

---

## Native Rust Implementation

The native implementation provides more control but requires manual account management:

```rust
use {
    borsh::{BorshDeserialize, BorshSerialize},
    mpl_token_metadata::instruction as mpl_instruction,
    solana_program::{
        account_info::{next_account_info, AccountInfo},
        entrypoint,
        entrypoint::ProgramResult,
        msg,
        program::invoke,
        program_pack::Pack,
        pubkey::Pubkey,
        rent::Rent,
        system_instruction,
        sysvar::Sysvar,
    },
    spl_token::{instruction as token_instruction, state::Mint},
};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct CreateTokenArgs {
    pub token_title: String,
    pub token_symbol: String,
    pub token_uri: String,
    pub token_decimals: u8,
}

entrypoint!(process_instruction);

fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let args = CreateTokenArgs::try_from_slice(instruction_data)?;

    let accounts_iter = &mut accounts.iter();
    let mint_account = next_account_info(accounts_iter)?;
    let mint_authority = next_account_info(accounts_iter)?;
    let metadata_account = next_account_info(accounts_iter)?;
    let payer = next_account_info(accounts_iter)?;
    let rent = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;
    let token_program = next_account_info(accounts_iter)?;
    let token_metadata_program = next_account_info(accounts_iter)?;

    // Step 1: Create the account for the Mint
    msg!("Creating mint account...");
    invoke(
        &system_instruction::create_account(
            payer.key,
            mint_account.key,
            (Rent::get()?).minimum_balance(Mint::LEN),
            Mint::LEN as u64,
            token_program.key,
        ),
        &[mint_account.clone(), payer.clone(), system_program.clone()],
    )?;

    // Step 2: Initialize the Mint account
    msg!("Initializing mint account...");
    invoke(
        &token_instruction::initialize_mint(
            token_program.key,
            mint_account.key,
            mint_authority.key,
            Some(mint_authority.key),
            args.token_decimals,
        )?,
        &[mint_account.clone(), mint_authority.clone(), rent.clone()],
    )?;

    // Step 3: Create metadata account
    msg!("Creating metadata account...");
    invoke(
        &mpl_instruction::create_metadata_accounts_v3(
            *token_metadata_program.key,
            *metadata_account.key,
            *mint_account.key,
            *mint_authority.key,
            *payer.key,
            *mint_authority.key,
            args.token_title,
            args.token_symbol,
            args.token_uri,
            None,
            0,
            true,
            false,
            None,
            None,
            None,
        ),
        &[
            metadata_account.clone(),
            mint_account.clone(),
            mint_authority.clone(),
            payer.clone(),
        ],
    )?;

    msg!("Token mint created successfully.");
    Ok(())
}
```

### Key Differences from Anchor

1. **Manual Account Parsing:** Use `next_account_info()` to iterate through accounts
2. **Explicit Account Creation:** Call `system_instruction::create_account()` manually
3. **Manual Initialization:** Call `token_instruction::initialize_mint()` explicitly
4. **More Verbose:** Requires more boilerplate code

---

## Testing

### TypeScript Test Example

```typescript
import * as anchor from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import type { CreateToken } from '../target/types/create_token';

describe('Create Tokens', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;
  const program = anchor.workspace.CreateToken as anchor.Program<CreateToken>;

  const metadata = {
    name: 'Solana Gold',
    symbol: 'GOLDSOL',
    uri: 'https://raw.githubusercontent.com/solana-developers/program-examples/new-examples/tokens/tokens/.assets/spl-token.json',
  };

  it('Create an SPL Token!', async () => {
    // Generate new keypair for mint account
    const mintKeypair = new Keypair();

    // SPL Token default = 9 decimals
    const transactionSignature = await program.methods
      .createTokenMint(9, metadata.name, metadata.symbol, metadata.uri)
      .accounts({
        payer: payer.publicKey,
        mintAccount: mintKeypair.publicKey,
      })
      .signers([mintKeypair])
      .rpc();

    console.log('Success!');
    console.log(`   Mint Address: ${mintKeypair.publicKey}`);
    console.log(`   Transaction Signature: ${transactionSignature}`);
  });

  it('Create an NFT!', async () => {
    // Generate new keypair for mint account
    const mintKeypair = new Keypair();

    // NFT default = 0 decimals
    const transactionSignature = await program.methods
      .createTokenMint(0, metadata.name, metadata.symbol, metadata.uri)
      .accounts({
        payer: payer.publicKey,
        mintAccount: mintKeypair.publicKey,
      })
      .signers([mintKeypair])
      .rpc();

    console.log('Success!');
    console.log(`   Mint Address: ${mintKeypair.publicKey}`);
    console.log(`   Transaction Signature: ${transactionSignature}`);
  });
});
```

### Running Tests

```bash
# Anchor version
cd anchor
anchor test

# Native version
cd native
pnpm install
pnpm test
```

---

## Deployment

### Build and Deploy (Anchor)

```bash
# Build the program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Update program ID in lib.rs and Anchor.toml
# Then rebuild and redeploy
```

### Build and Deploy (Native)

```bash
# Build the program
cd native/program
cargo build-sbf

# Deploy to devnet
solana program deploy target/deploy/create_token.so --url devnet
```

---

## Common Issues and Solutions

### Issue 1: Metadata Account Already Exists

**Error:** "Account already in use"

**Solution:** The metadata account is derived deterministically. If you're reusing a mint keypair, the metadata account already exists. Generate a new mint keypair.

### Issue 2: Insufficient Funds

**Error:** "Insufficient funds for transaction"

**Solution:** Ensure your wallet has enough SOL for:
- Mint account rent (~0.00144 SOL)
- Metadata account rent (~0.0053 SOL)
- Transaction fees

```bash
# Airdrop SOL on devnet
solana airdrop 2 --url devnet
```

### Issue 3: Invalid Metadata URI

**Error:** Metadata doesn't display correctly

**Solution:** Ensure your URI points to valid JSON following Metaplex standards:

```json
{
  "name": "Solana Gold",
  "symbol": "GOLDSOL",
  "description": "A golden token on Solana",
  "image": "https://example.com/image.png"
}
```

---

## Best Practices

1. **Use PDAs for Metadata:** Always derive metadata accounts using the standard seeds
2. **Validate Decimals:** Use 9 decimals for fungible tokens, 0 for NFTs
3. **Host Metadata Properly:** Use IPFS or Arweave for permanent metadata storage
4. **Set Authorities Carefully:** Consider who should control minting and freezing
5. **Test Thoroughly:** Test on devnet before deploying to mainnet

---

## Next Steps

- Learn about [SPL Token Minter](../02-spl-token-minter/) to mint tokens to users
- Explore [Transfer Tokens](../03-transfer-tokens/) to move tokens between accounts
- Study [NFT Minter](../04-nft-minter/) to create unique NFTs

---

## Additional Resources

- [SPL Token Program Documentation](https://spl.solana.com/token)
- [Metaplex Token Metadata](https://docs.metaplex.com/programs/token-metadata/)
- [Solana Cookbook - Tokens](https://solanacookbook.com/references/token.html)
- [Anchor Book](https://book.anchor-lang.com/)

---

**Source:** Adapted from [Solana Program Examples](https://github.com/solana-developers/program-examples)
