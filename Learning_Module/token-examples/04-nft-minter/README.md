# NFT Minter

Learn how to create Non-Fungible Tokens (NFTs) on Solana with Master Edition to ensure uniqueness.

## Overview

NFTs on Solana are SPL Tokens with 0 decimals and a supply of 1. This example demonstrates how to mint NFTs and disable further minting using Metaplex Master Edition, ensuring true uniqueness.

## Learning Objectives

By completing this example, you will learn how to:

- Create NFTs with 0 decimals
- Mint exactly one token to the creator
- Use Metaplex Master Edition to disable minting
- Understand the difference between NFTs and fungible tokens
- Implement NFT minting in Anchor

## Prerequisites

- Completed [Create Token](../01-create-token/) example
- Completed [SPL Token Minter](../02-spl-token-minter/) example
- Understanding of token mints and metadata
- Familiarity with Metaplex Token Metadata Program

---

## NFT Fundamentals

### What Makes an NFT?

An NFT on Solana is defined by:

1. **0 Decimals:** Cannot be divided into fractional amounts
2. **Supply of 1:** Only one token exists
3. **Disabled Minting:** No more tokens can be minted

```text
Fungible Token:  9 decimals, unlimited supply
NFT:             0 decimals, supply of 1, minting disabled
```

### The Minting Problem

When you mint SPL Tokens, you can typically continue minting new tokens, increasing the supply. For NFTs, we need to ensure only ONE token can ever exist.

**Solution:** Disable minting by removing or delegating the Mint Authority.

---

## Disabling Minting: Two Approaches

### Approach 1: Set Mint Authority to Null

```rust
// Permanently disable minting
set_authority(
    ctx.accounts.token_program.to_account_info(),
    ctx.accounts.mint_account.to_account_info(),
    None, // Set to null
    AuthorityType::MintTokens,
    ctx.accounts.mint_authority.to_account_info(),
)?;
```

**Pros:** Simple, permanent, irreversible
**Cons:** No additional metadata or features

### Approach 2: Use Master Edition (Recommended)

```rust
// Delegate mint authority to Master Edition account
create_master_edition_v3(
    CpiContext::new(/* ... */),
    None, // Max supply
)?;
```

**Pros:** 
- Adds edition metadata
- Enables print editions (limited copies)
- Standard approach in Solana ecosystem
- Reversible if needed

**Cons:** Slightly more complex

> **This example uses Master Edition** - the standard approach for NFTs on Solana.

---

## Implementation

### Program Code

```rust
use {
    anchor_lang::prelude::*,
    anchor_spl::{
        associated_token::AssociatedToken,
        metadata::{
            create_master_edition_v3, 
            create_metadata_accounts_v3,
            mpl_token_metadata::types::DataV2, 
            CreateMasterEditionV3, 
            CreateMetadataAccountsV3,
            Metadata,
        },
        token::{mint_to, Mint, MintTo, Token, TokenAccount},
    },
};

declare_id!("52quezNUzc1Ej6Jh6L4bvtxPW8j6TEFHuLVAWiFvdnsc");

#[program]
pub mod nft_minter {
    use super::*;

    pub fn mint_nft(
        ctx: Context<CreateToken>,
        nft_name: String,
        nft_symbol: String,
        nft_uri: String,
    ) -> Result<()> {
        // Step 1: Mint exactly 1 token
        msg!("Minting Token");
        mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.mint_account.to_account_info(),
                    to: ctx.accounts.associated_token_account.to_account_info(),
                    authority: ctx.accounts.payer.to_account_info(),
                },
            ),
            1, // Mint exactly 1 token
        )?;

        // Step 2: Create metadata account
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
                name: nft_name,
                symbol: nft_symbol,
                uri: nft_uri,
                seller_fee_basis_points: 0,
                creators: None,
                collection: None,
                uses: None,
            },
            false, // Is mutable
            true,  // Update authority is signer
            None,  // Collection details
        )?;

        // Step 3: Create Master Edition (disables minting)
        msg!("Creating master edition account");
        create_master_edition_v3(
            CpiContext::new(
                ctx.accounts.token_metadata_program.to_account_info(),
                CreateMasterEditionV3 {
                    edition: ctx.accounts.edition_account.to_account_info(),
                    mint: ctx.accounts.mint_account.to_account_info(),
                    update_authority: ctx.accounts.payer.to_account_info(),
                    mint_authority: ctx.accounts.payer.to_account_info(),
                    payer: ctx.accounts.payer.to_account_info(),
                    metadata: ctx.accounts.metadata_account.to_account_info(),
                    token_program: ctx.accounts.token_program.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
            ),
            None, // Max supply (None = unlimited print editions)
        )?;

        msg!("NFT minted successfully.");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateToken<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

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

    /// Master Edition account derived from mint
    #[account(
        mut,
        seeds = [
            b"metadata", 
            token_metadata_program.key().as_ref(), 
            mint_account.key().as_ref(), 
            b"edition"
        ],
        bump,
        seeds::program = token_metadata_program.key(),
    )]
    pub edition_account: UncheckedAccount<'info>,

    /// Create new mint account with 0 decimals (NFT)
    #[account(
        init,
        payer = payer,
        mint::decimals = 0,
        mint::authority = payer.key(),
        mint::freeze_authority = payer.key(),
    )]
    pub mint_account: Account<'info, Mint>,

    /// Associated token account to hold the NFT
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint_account,
        associated_token::authority = payer,
    )]
    pub associated_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
```

---

## Key Concepts

### 1. NFT Mint Configuration

```rust
#[account(
    init,
    payer = payer,
    mint::decimals = 0,              // NFTs have 0 decimals
    mint::authority = payer.key(),
    mint::freeze_authority = payer.key(),
)]
pub mint_account: Account<'info, Mint>,
```

- `decimals = 0` makes the token indivisible
- Mint authority will be delegated to Master Edition
- Freeze authority allows freezing the NFT if needed

### 2. Master Edition Account

```rust
#[account(
    mut,
    seeds = [
        b"metadata", 
        token_metadata_program.key().as_ref(), 
        mint_account.key().as_ref(), 
        b"edition"
    ],
    bump,
    seeds::program = token_metadata_program.key(),
)]
pub edition_account: UncheckedAccount<'info>,
```

- Derived using standard Metaplex seeds
- Stores edition information
- Becomes the new mint authority

### 3. Minting Process

```text
1. Mint 1 token → Associated Token Account
2. Create metadata → Name, symbol, URI
3. Create Master Edition → Disable minting
```

### 4. Master Edition Effects

When you create a Master Edition:

- **Mint Authority** is delegated to the Master Edition account
- **Supply** is locked at 1 for the original
- **Print Editions** can be created (if max_supply allows)
- **Irreversible** - cannot mint more originals

---

## Testing

### TypeScript Test

```typescript
import * as anchor from '@coral-xyz/anchor';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { Keypair } from '@solana/web3.js';
import type { NftMinter } from '../target/types/nft_minter';

describe('NFT Minter', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;
  const program = anchor.workspace.NftMinter as anchor.Program<NftMinter>;

  const metadata = {
    name: 'Homer NFT',
    symbol: 'HOMR',
    uri: 'https://raw.githubusercontent.com/solana-developers/program-examples/new-examples/tokens/tokens/.assets/nft.json',
  };

  it('Create an NFT!', async () => {
    // Generate keypair for mint account
    const mintKeypair = new Keypair();

    // Derive ATA for the NFT
    const associatedTokenAccountAddress = getAssociatedTokenAddressSync(
      mintKeypair.publicKey, 
      payer.publicKey
    );

    const transactionSignature = await program.methods
      .mintNft(metadata.name, metadata.symbol, metadata.uri)
      .accounts({
        payer: payer.publicKey,
        mintAccount: mintKeypair.publicKey,
        associatedTokenAccount: associatedTokenAccountAddress,
      })
      .signers([mintKeypair])
      .rpc({ skipPreflight: true });

    console.log('Success!');
    console.log(`   Mint Address: ${mintKeypair.publicKey}`);
    console.log(`   Transaction Signature: ${transactionSignature}`);
  });
});
```

### Running Tests

```bash
anchor test
```

---

## NFT Metadata Standard

### JSON Metadata Structure

Your NFT URI should point to JSON following this structure:

```json
{
  "name": "Homer NFT",
  "symbol": "HOMR",
  "description": "A unique Homer Simpson NFT",
  "image": "https://arweave.net/[image-hash]",
  "attributes": [
    {
      "trait_type": "Background",
      "value": "Blue"
    },
    {
      "trait_type": "Character",
      "value": "Homer"
    }
  ],
  "properties": {
    "files": [
      {
        "uri": "https://arweave.net/[image-hash]",
        "type": "image/png"
      }
    ],
    "category": "image"
  }
}
```

### Best Practices for Metadata

1. **Use Permanent Storage:** IPFS or Arweave for images and metadata
2. **Include Attributes:** Traits make NFTs more valuable and searchable
3. **High-Quality Images:** Use appropriate resolution and format
4. **Verify JSON:** Ensure valid JSON structure
5. **Follow Standards:** Use Metaplex metadata standards

---

## Common Issues and Solutions

### Issue 1: Mint Authority Already Delegated

**Error:** "Mint authority mismatch"

**Solution:** Ensure you haven't already created a Master Edition for this mint.

### Issue 2: Insufficient Rent

**Error:** "Insufficient funds"

**Solution:** Master Edition requires additional rent (~0.014 SOL):

```bash
solana airdrop 2 --url devnet
```

### Issue 3: Invalid Metadata URI

**Problem:** NFT doesn't display in wallets

**Solution:** Ensure URI is accessible and returns valid JSON:

```bash
curl https://your-metadata-uri.json
```

### Issue 4: Wrong Decimals

**Error:** "Invalid decimals for NFT"

**Solution:** NFTs must have 0 decimals:

```rust
mint::decimals = 0, // Must be 0 for NFTs
```

---

## Advanced Topics

### Limited Edition NFTs

Create a limited series of print editions:

```rust
create_master_edition_v3(
    CpiContext::new(/* ... */),
    Some(100), // Max 100 print editions
)?;
```

### NFT Collections

Group NFTs into collections:

```rust
DataV2 {
    name: nft_name,
    symbol: nft_symbol,
    uri: nft_uri,
    seller_fee_basis_points: 500, // 5% royalty
    creators: Some(vec![Creator {
        address: creator_address,
        verified: true,
        share: 100,
    }]),
    collection: Some(Collection {
        verified: false,
        key: collection_mint,
    }),
    uses: None,
}
```

### Verified Creators

```rust
// After minting, verify the creator
sign_metadata(
    CpiContext::new(/* ... */),
)?;
```

---

## Comparison: Fungible vs NFT

| Feature | Fungible Token | NFT |
|---------|---------------|-----|
| Decimals | 9 (typical) | 0 |
| Supply | Unlimited or capped | 1 |
| Mint Authority | Active | Delegated to Master Edition |
| Divisible | Yes | No |
| Unique | No | Yes |
| Use Case | Currency, utility | Art, collectibles, identity |

---

## Best Practices

1. **Always Use Master Edition:** Standard approach for NFTs
2. **Verify Metadata:** Test URI accessibility before minting
3. **Set Royalties:** Configure seller_fee_basis_points for secondary sales
4. **Use Collections:** Group related NFTs together
5. **Permanent Storage:** Use Arweave or IPFS for images
6. **Test on Devnet:** Always test before mainnet deployment

---

## Next Steps

- Learn about [NFT Operations](../05-nft-operations/) for advanced NFT management
- Explore [PDA Mint Authority](../06-pda-mint-authority/) for program-controlled NFTs
- Study [Escrow](../07-escrow/) for NFT trading mechanisms

---

## Additional Resources

- [Metaplex Documentation](https://docs.metaplex.com/)
- [NFT Standard](https://docs.metaplex.com/programs/token-metadata/token-standard)
- [Master Edition Guide](https://docs.metaplex.com/programs/token-metadata/accounts#master-edition)
- [Solana Cookbook - NFTs](https://solanacookbook.com/references/nfts.html)

---

**Source:** Adapted from [Solana Program Examples](https://github.com/solana-developers/program-examples)
