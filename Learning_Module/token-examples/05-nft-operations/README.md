# NFT Operations

Learn how to create NFT collections, mint NFTs as part of collections, and verify collection membership.

## Overview

This example demonstrates advanced NFT operations including creating collections, minting NFTs that belong to collections, and verifying NFTs as collection members. Collections allow you to group related NFTs together with verified membership.

## Learning Objectives

By completing this example, you will learn how to:

- Create NFT collections with collection metadata
- Mint NFTs as part of a collection
- Verify NFTs as collection members
- Use PDA authorities for program-controlled minting
- Work with Metaplex collection standards
- Understand collection size tracking

## Prerequisites

- Completed [NFT Minter](../04-nft-minter/) example
- Understanding of NFTs and Master Editions
- Knowledge of PDAs and signing with PDAs
- Familiarity with Metaplex Token Metadata Program

---

## Collection Fundamentals

### What is an NFT Collection?

An NFT collection is a special NFT that serves as a parent for other NFTs. Collections provide:

- **Grouping:** Related NFTs belong to the same collection
- **Verification:** Provable membership in the collection
- **Discovery:** Easier to find and display related NFTs
- **Branding:** Shared identity across NFTs

### Collection vs Regular NFT

| Feature | Collection NFT | Regular NFT |
|---------|---------------|-------------|
| Purpose | Parent/container | Individual item |
| collection_details | Set (with size) | None |
| collection field | None | Set (with collection key) |
| verified | N/A | true/false |

### Collection Workflow

```text
1. Create Collection NFT
   ↓
2. Mint NFTs with collection reference
   ↓
3. Verify NFTs as collection members
   ↓
4. Collection size automatically increments
```

---

## Program Setup

This example clones the Metaplex Token Metadata program from mainnet for testing:

```toml
# Anchor.toml
[test.validator]
url = "https://api.mainnet-beta.solana.com"

[[test.validator.clone]]
address = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
```

This allows us to perform CPIs to create Metadata Accounts, Master Edition Accounts, and verify NFTs.

---

## Implementation

### Program Structure

```rust
use anchor_lang::prelude::*;

declare_id!("3EMcczaGi9ivdLxvvFwRbGYeEUEHpGwabXegARw4jLxa");

pub mod contexts;
pub use contexts::*;

#[program]
pub mod mint_nft {
    use super::*;

    pub fn create_collection(ctx: Context<CreateCollection>) -> Result<()> {
        ctx.accounts.create_collection(&ctx.bumps)
    }

    pub fn mint_nft(ctx: Context<MintNFT>) -> Result<()> {
        ctx.accounts.mint_nft(&ctx.bumps)
    }

    pub fn verify_collection(ctx: Context<VerifyCollectionMint>) -> Result<()> {
        ctx.accounts.verify_collection(&ctx.bumps)
    }
}
```

---

## 1. Create Collection

### Accounts Structure

```rust
#[derive(Accounts)]
pub struct CreateCollection<'info> {
    #[account(mut)]
    user: Signer<'info>,
    
    #[account(
        init,
        payer = user,
        mint::decimals = 0,
        mint::authority = mint_authority,
        mint::freeze_authority = mint_authority,
    )]
    mint: Account<'info, Mint>,
    
    /// PDA authority for signing
    #[account(
        seeds = [b"authority"],
        bump,
    )]
    pub mint_authority: UncheckedAccount<'info>,
    
    #[account(mut)]
    /// CHECK: Initialized by metaplex program
    metadata: UncheckedAccount<'info>,
    
    #[account(mut)]
    /// CHECK: Initialized by metaplex program
    master_edition: UncheckedAccount<'info>,
    
    #[account(
        init,
        payer = user,
        associated_token::mint = mint,
        associated_token::authority = user
    )]
    destination: Account<'info, TokenAccount>,
    
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    associated_token_program: Program<'info, AssociatedToken>,
    token_metadata_program: Program<'info, Metadata>,
}
```

### Key Points

**1. PDA Mint Authority:**
```rust
#[account(
    seeds = [b"authority"],
    bump,
)]
pub mint_authority: UncheckedAccount<'info>,
```
- Program-controlled authority
- Can sign CPIs using `invoke_signed`
- Enables automated collection management

**2. Unchecked Accounts:**
```rust
metadata: UncheckedAccount<'info>,
master_edition: UncheckedAccount<'info>,
```
- Not yet initialized
- Will be created by Metaplex program
- Using `Account<'info, MetadataAccount>` would fail

### Implementation

```rust
impl<'info> CreateCollection<'info> {
    pub fn create_collection(&mut self, bumps: &CreateCollectionBumps) -> Result<()> {
        let seeds = &[
            &b"authority"[..], 
            &[bumps.mint_authority]
        ];
        let signer_seeds = &[&seeds[..]];

        // Step 1: Mint 1 token to destination
        let cpi_ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            MintTo {
                mint: self.mint.to_account_info(),
                to: self.destination.to_account_info(),
                authority: self.mint_authority.to_account_info(),
            },
            signer_seeds
        );
        mint_to(cpi_ctx, 1)?;
        msg!("Collection NFT minted!");

        // Step 2: Create metadata account
        let creator = vec![
            Creator {
                address: self.mint_authority.key(),
                verified: true,
                share: 100,
            },
        ];
        
        let metadata_account = CreateMetadataAccountV3Cpi::new(
            &self.token_metadata_program.to_account_info(), 
            CreateMetadataAccountV3CpiAccounts {
                metadata: &self.metadata.to_account_info(),
                mint: &self.mint.to_account_info(),
                mint_authority: &self.mint_authority.to_account_info(),
                payer: &self.user.to_account_info(),
                update_authority: (&self.mint_authority.to_account_info(), true),
                system_program: &self.system_program.to_account_info(),
                rent: None,
            },
            CreateMetadataAccountV3InstructionArgs {
                data: DataV2 {
                    name: "DummyCollection".to_owned(),
                    symbol: "DC".to_owned(),
                    uri: "".to_owned(),
                    seller_fee_basis_points: 0,
                    creators: Some(creator),
                    collection: None, // No parent collection
                    uses: None,
                },
                is_mutable: true,
                collection_details: Some(
                    CollectionDetails::V1 { size: 0 } // This makes it a collection
                )
            }
        );
        metadata_account.invoke_signed(signer_seeds)?;
        msg!("Metadata Account created!");

        // Step 3: Create master edition
        let master_edition_account = CreateMasterEditionV3Cpi::new(
            &self.token_metadata_program.to_account_info(),
            CreateMasterEditionV3CpiAccounts {
                edition: &self.master_edition.to_account_info(),
                update_authority: &self.mint_authority.to_account_info(),
                mint_authority: &self.mint_authority.to_account_info(),
                mint: &self.mint.to_account_info(),
                payer: &self.user.to_account_info(),
                metadata: &self.metadata.to_account_info(),
                token_program: &self.token_program.to_account_info(),
                system_program: &self.system_program.to_account_info(),
                rent: None,
            },
            CreateMasterEditionV3InstructionArgs {
                max_supply: Some(0),
            }
        );
        master_edition_account.invoke_signed(signer_seeds)?;
        msg!("Master Edition Account created");
        
        Ok(())
    }
}
```

---

## 2. Mint NFT (Collection Member)

### Accounts Structure

```rust
#[derive(Accounts)]
pub struct MintNFT<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        init,
        payer = owner,
        mint::decimals = 0,
        mint::authority = mint_authority,
        mint::freeze_authority = mint_authority,
    )]
    pub mint: Account<'info, Mint>,
    
    #[account(
        init,
        payer = owner,
        associated_token::mint = mint,
        associated_token::authority = owner
    )]
    pub destination: Account<'info, TokenAccount>,
    
    #[account(mut)]
    /// CHECK: Initialized by metaplex program
    pub metadata: UncheckedAccount<'info>,
    
    #[account(mut)]
    /// CHECK: Initialized by metaplex program
    pub master_edition: UncheckedAccount<'info>,
    
    #[account(
        seeds = [b"authority"],
        bump,
    )]
    pub mint_authority: UncheckedAccount<'info>,
    
    #[account(mut)]
    pub collection_mint: Account<'info, Mint>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_metadata_program: Program<'info, Metadata>,
}
```

### Implementation

```rust
impl<'info> MintNFT<'info> {
    pub fn mint_nft(&mut self, bumps: &MintNFTBumps) -> Result<()> {
        let seeds = &[
            &b"authority"[..], 
            &[bumps.mint_authority]
        ];
        let signer_seeds = &[&seeds[..]];

        // Step 1: Mint 1 token
        let cpi_ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            MintTo {
                mint: self.mint.to_account_info(),
                to: self.destination.to_account_info(),
                authority: self.mint_authority.to_account_info(),
            },
            signer_seeds
        );
        mint_to(cpi_ctx, 1)?;
        msg!("NFT minted!");

        // Step 2: Create metadata with collection reference
        let creator = vec![
            Creator {
                address: self.mint_authority.key(),
                verified: true,
                share: 100,
            },
        ];

        let metadata_account = CreateMetadataAccountV3Cpi::new(
            &self.token_metadata_program.to_account_info(),
            CreateMetadataAccountV3CpiAccounts {
                metadata: &self.metadata.to_account_info(),
                mint: &self.mint.to_account_info(),
                mint_authority: &self.mint_authority.to_account_info(),
                payer: &self.owner.to_account_info(),
                update_authority: (&self.mint_authority.to_account_info(), true),
                system_program: &self.system_program.to_account_info(),
                rent: None,
            }, 
            CreateMetadataAccountV3InstructionArgs {
                data: DataV2 {
                    name: "Mint Test".to_string(),
                    symbol: "YAY".to_string(),
                    uri: "".to_string(),
                    seller_fee_basis_points: 0,
                    creators: Some(creator),
                    collection: Some(Collection {
                        verified: false, // Will be true after verification
                        key: self.collection_mint.key(),
                    }),
                    uses: None
                },
                is_mutable: true,
                collection_details: None, // Not a collection itself
            }
        );
        metadata_account.invoke_signed(signer_seeds)?;

        // Step 3: Create master edition
        let master_edition_account = CreateMasterEditionV3Cpi::new(
            &self.token_metadata_program.to_account_info(),
            CreateMasterEditionV3CpiAccounts {
                edition: &self.master_edition.to_account_info(),
                update_authority: &self.mint_authority.to_account_info(),
                mint_authority: &self.mint_authority.to_account_info(),
                mint: &self.mint.to_account_info(),
                payer: &self.owner.to_account_info(),
                metadata: &self.metadata.to_account_info(),
                token_program: &self.token_program.to_account_info(),
                system_program: &self.system_program.to_account_info(),
                rent: None,
            },
            CreateMasterEditionV3InstructionArgs {
                max_supply: Some(0),
            }
        );
        master_edition_account.invoke_signed(signer_seeds)?;

        Ok(())
    }
}
```

### Key Difference: Collection Field

**Collection NFT:**
```rust
collection: None,
collection_details: Some(CollectionDetails::V1 { size: 0 })
```

**Regular NFT:**
```rust
collection: Some(Collection {
    verified: false,
    key: collection_mint_key,
}),
collection_details: None
```

---

## 3. Verify Collection Membership

### Accounts Structure

```rust
#[derive(Accounts)]
pub struct VerifyCollectionMint<'info> {
    pub authority: Signer<'info>,
    
    #[account(mut)]
    pub metadata: Account<'info, MetadataAccount>,
    
    pub mint: Account<'info, Mint>,
    
    #[account(
        seeds = [b"authority"],
        bump,
    )]
    pub mint_authority: UncheckedAccount<'info>,
    
    pub collection_mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub collection_metadata: Account<'info, MetadataAccount>,
    
    pub collection_master_edition: Account<'info, MasterEditionAccount>,
    
    pub system_program: Program<'info, System>,
    
    #[account(address = INSTRUCTIONS_ID)]
    /// CHECK: Sysvar instruction account
    pub sysvar_instruction: UncheckedAccount<'info>,
    
    pub token_metadata_program: Program<'info, Metadata>,
}
```

### Key Points

**1. Initialized Accounts:**
```rust
pub metadata: Account<'info, MetadataAccount>,
pub collection_metadata: Account<'info, MetadataAccount>,
```
- Now using typed accounts (not UncheckedAccount)
- Accounts already exist from previous steps

**2. Mutable Accounts:**
- `metadata` - verified field will be set to true
- `collection_metadata` - size will be incremented

### Implementation

```rust
impl<'info> VerifyCollectionMint<'info> {
    pub fn verify_collection(&mut self, bumps: &VerifyCollectionMintBumps) -> Result<()> {
        let seeds = &[
            &b"authority"[..], 
            &[bumps.mint_authority]
        ];
        let signer_seeds = &[&seeds[..]];

        let verify_collection = VerifyCollectionV1Cpi::new(
            &self.token_metadata_program.to_account_info(),
            VerifyCollectionV1CpiAccounts {
                authority: &self.mint_authority.to_account_info(),
                delegate_record: None,
                metadata: &self.metadata.to_account_info(),
                collection_mint: &self.collection_mint.to_account_info(),
                collection_metadata: Some(&self.collection_metadata.to_account_info()),
                collection_master_edition: Some(&self.collection_master_edition.to_account_info()),
                system_program: &self.system_program.to_account_info(),
                sysvar_instructions: &self.sysvar_instruction.to_account_info(),
            }
        );
        verify_collection.invoke_signed(signer_seeds)?;

        msg!("Collection Verified!");
        Ok(())
    }
}
```

---

## Testing

### TypeScript Test Example

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import { MintNft } from "../target/types/mint_nft";

describe("NFT Operations", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.MintNft as Program<MintNft>;

  const collectionMint = Keypair.generate();
  const nftMint = Keypair.generate();

  it("Create Collection", async () => {
    await program.methods
      .createCollection()
      .accounts({
        user: provider.wallet.publicKey,
        mint: collectionMint.publicKey,
      })
      .signers([collectionMint])
      .rpc();

    console.log("Collection created:", collectionMint.publicKey.toBase58());
  });

  it("Mint NFT", async () => {
    await program.methods
      .mintNft()
      .accounts({
        owner: provider.wallet.publicKey,
        mint: nftMint.publicKey,
        collectionMint: collectionMint.publicKey,
      })
      .signers([nftMint])
      .rpc();

    console.log("NFT minted:", nftMint.publicKey.toBase58());
  });

  it("Verify Collection", async () => {
    await program.methods
      .verifyCollection()
      .accounts({
        authority: provider.wallet.publicKey,
        mint: nftMint.publicKey,
        collectionMint: collectionMint.publicKey,
      })
      .rpc();

    console.log("NFT verified as collection member");
  });
});
```

---

## Common Issues and Solutions

### Issue 1: Account Already Initialized

**Error:** "Account already initialized"

**Solution:** Use correct account types - `UncheckedAccount` for uninitialized, `Account<'info, T>` for initialized.

### Issue 2: Invalid Collection Authority

**Error:** "Invalid authority"

**Solution:** Ensure the collection authority (PDA) signs the verification CPI.

### Issue 3: Collection Size Not Updating

**Problem:** Collection size stays at 0

**Solution:** Ensure collection_metadata is mutable and verification completes successfully.

### Issue 4: Verified Field Still False

**Problem:** NFT shows verified: false

**Solution:** Call verify_collection instruction after minting the NFT.

---

## Best Practices

1. **Use PDA Authorities:** Enables program-controlled operations
2. **Verify After Minting:** Always verify NFTs as collection members
3. **Track Collection Size:** Monitor collection_details for accurate counts
4. **Restrict Verification:** Add constraints to control who can verify
5. **Test Thoroughly:** Test all three operations together

---

## Advanced Topics

### Unverify Collection

```rust
pub fn unverify_collection(ctx: Context<UnverifyCollection>) -> Result<()> {
    let unverify = UnverifyCollectionV1Cpi::new(
        &ctx.accounts.token_metadata_program.to_account_info(),
        UnverifyCollectionV1CpiAccounts {
            authority: &ctx.accounts.authority.to_account_info(),
            metadata: &ctx.accounts.metadata.to_account_info(),
            collection_mint: &ctx.accounts.collection_mint.to_account_info(),
            // ...
        }
    );
    unverify.invoke()?;
    Ok(())
}
```

### Set and Verify Collection

Combine minting and verification in one transaction:

```rust
pub fn mint_and_verify(ctx: Context<MintAndVerify>) -> Result<()> {
    // Mint NFT
    ctx.accounts.mint_nft(&ctx.bumps)?;
    
    // Verify immediately
    ctx.accounts.verify_collection(&ctx.bumps)?;
    
    Ok(())
}
```

---

## Next Steps

- Learn about [PDA Mint Authority](../06-pda-mint-authority/) for more PDA patterns
- Explore [Escrow](../07-escrow/) for NFT trading
- Study [Token Swap](../08-token-swap/) for liquidity mechanisms

---

## Additional Resources

- [Metaplex Collections](https://docs.metaplex.com/programs/token-metadata/certified-collections)
- [Verify Collection Guide](https://docs.metaplex.com/programs/token-metadata/instructions#verify-a-collection-item)
- [Collection Standards](https://docs.metaplex.com/programs/token-metadata/accounts#collection)

---

**Source:** Adapted from [Solana Program Examples](https://github.com/solana-developers/program-examples)
