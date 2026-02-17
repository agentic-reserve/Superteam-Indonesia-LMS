# Metadata Pointer (Token-2022)

Learn how to store token metadata directly on-chain using the Metadata Pointer extension.

## Overview

Metadata Pointer extension allows storing token metadata directly in the mint account, eliminating the need for external metadata accounts like Metaplex.

## Learning Objectives

- Store on-chain metadata
- Update metadata fields
- Compare with Metaplex metadata
- Implement metadata standards

## Prerequisites

- Completed [Token-2022 Basics](../11-token-2022-basics/)
- Understanding of token metadata

---

## Implementation

### Create Mint with Metadata

```rust
#[account(
    init,
    payer = payer,
    mint::decimals = 9,
    mint::authority = payer,
    mint::token_program = token_program,
    extensions::metadata_pointer::MetadataPointer {
        authority: payer.key(),
        metadata_address: mint.key(),
    },
)]
pub mint: InterfaceAccount<'info, Mint>,
```

### Initialize Metadata

```rust
pub fn initialize_metadata(
    ctx: Context<InitializeMetadata>,
    name: String,
    symbol: String,
    uri: String,
) -> Result<()> {
    let ix = initialize_metadata(
        &ctx.accounts.token_program.key(),
        &ctx.accounts.mint.key(),
        &ctx.accounts.update_authority.key(),
        &ctx.accounts.mint.key(),
        &ctx.accounts.update_authority.key(),
        name,
        symbol,
        uri,
    )?;

    invoke(&ix, &[/* accounts */])?;
    Ok(())
}
```

---

## Best Practices

1. **On-Chain Storage:** Consider costs
2. **Update Authority:** Secure properly
3. **URI Standards:** Follow conventions
4. **Immutability:** Consider making immutable

---

**Source:** Adapted from [Solana Program Examples](https://github.com/solana-developers/program-examples)
