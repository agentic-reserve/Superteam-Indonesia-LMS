# Token-2022 Basics

Learn about the Token-2022 program (Token Extensions) and its powerful new features for advanced token functionality.

## Overview

Token-2022 is the next generation SPL Token program with built-in extensions for transfer fees, confidential transfers, metadata, and more - all without requiring custom programs.

## Learning Objectives

- Understand Token-2022 vs SPL Token
- Create Token-2022 mints
- Enable token extensions
- Migrate from SPL Token
- Choose appropriate extensions

## Prerequisites

- Completed [Create Token](../01-create-token/)
- Understanding of SPL Token program
- Basic knowledge of token operations

---

## Token-2022 Fundamentals

### What is Token-2022?

Token-2022 (Token Extensions Program) is a new token program that includes:

- **Built-in Extensions:** Transfer fees, hooks, metadata, etc.
- **Backward Compatible:** Works with existing tools
- **More Efficient:** Reduced program complexity
- **Future-Proof:** Extensible architecture

### Program IDs

```rust
// SPL Token (Original)
pub const TOKEN_PROGRAM_ID: Pubkey = pubkey!("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

// Token-2022 (Extensions)
pub const TOKEN_2022_PROGRAM_ID: Pubkey = pubkey!("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
```

---

## Available Extensions

| Extension | Purpose |
|-----------|---------|
| Transfer Fee | Charge fees on transfers |
| Transfer Hook | Custom logic on transfers |
| Metadata Pointer | On-chain metadata |
| Confidential Transfers | Privacy features |
| Permanent Delegate | Compliance/recovery |
| Interest Bearing | Yield-bearing tokens |
| Non-Transferable | Soulbound tokens |
| Default Account State | Frozen by default |
| CPI Guard | Prevent CPI exploits |
| Immutable Owner | Prevent ownership changes |
| Memo Required | Require transfer memos |
| Mint Close Authority | Close mint accounts |

---

## Implementation

### Create Basic Token-2022 Mint

```rust
use anchor_spl::token_2022::{Token2022, mint_to, MintTo};

#[derive(Accounts)]
pub struct CreateToken2022<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 9,
        mint::authority = payer.key(),
        mint::token_program = token_program, // Specify Token-2022
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
}
```

### Key Differences from SPL Token

**1. Program Specification:**
```rust
// SPL Token
pub token_program: Program<'info, Token>,

// Token-2022
pub token_program: Program<'info, Token2022>,
mint::token_program = token_program,
```

**2. Interface Accounts:**
```rust
// More flexible account types
pub mint: InterfaceAccount<'info, Mint>,
pub token_account: InterfaceAccount<'info, TokenAccount>,
```

---

## Creating Mint with Extensions

### Using Native Rust

```rust
use spl_token_2022::{
    extension::{ExtensionType, StateWithExtensionsMut},
    state::Mint,
};

// Calculate space needed
let space = ExtensionType::try_calculate_account_len::<Mint>(&[
    ExtensionType::TransferFeeConfig,
    ExtensionType::MetadataPointer,
])?;

// Create account with extensions
let rent = Rent::get()?;
let lamports = rent.minimum_balance(space);

create_account(
    CpiContext::new(/* ... */),
    lamports,
    space as u64,
    &TOKEN_2022_PROGRAM_ID,
)?;

// Initialize extensions
// (Extension-specific initialization)

// Initialize mint
initialize_mint2(
    CpiContext::new(/* ... */),
    decimals,
    mint_authority,
    freeze_authority,
)?;
```

### Using Anchor

```rust
#[account(
    init,
    payer = payer,
    mint::decimals = 9,
    mint::authority = payer,
    mint::token_program = token_program,
    extensions::transfer_fee_config::TransferFeeConfig {
        transfer_fee_config_authority: payer.key(),
        withdraw_withheld_authority: payer.key(),
        transfer_fee_basis_points: 100, // 1%
        maximum_fee: 1_000_000,
    },
)]
pub mint: InterfaceAccount<'info, Mint>,
```

---

## Migration from SPL Token

### Compatibility

Token-2022 is **not** backward compatible at the account level:
- SPL Token accounts cannot use Token-2022 program
- Token-2022 accounts cannot use SPL Token program
- Must create new mints/accounts

### Migration Strategy

```text
1. Create new Token-2022 mint
2. Airdrop/distribute new tokens
3. Allow users to swap old for new
4. Gradually phase out old token
```

### Swap Program Example

```rust
pub fn swap_tokens(ctx: Context<SwapTokens>, amount: u64) -> Result<()> {
    // Burn old SPL tokens
    burn(
        CpiContext::new(
            ctx.accounts.spl_token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.old_mint.to_account_info(),
                from: ctx.accounts.old_token_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            },
        ),
        amount,
    )?;

    // Mint new Token-2022 tokens
    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_2022_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.new_mint.to_account_info(),
                to: ctx.accounts.new_token_account.to_account_info(),
                authority: ctx.accounts.mint_authority.to_account_info(),
            },
            signer_seeds,
        ),
        amount,
    )?;

    Ok(())
}
```

---

## Testing

```typescript
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

describe("Token-2022 Basics", () => {
  it("Create Token-2022 mint", async () => {
    const mint = Keypair.generate();

    await program.methods
      .createToken2022()
      .accounts({
        payer: payer.publicKey,
        mint: mint.publicKey,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .signers([mint])
      .rpc();

    console.log("Token-2022 mint created:", mint.publicKey.toBase58());
  });
});
```

---

## Choosing Extensions

### Decision Matrix

| Need | Extension |
|------|-----------|
| Revenue from transfers | Transfer Fee |
| Custom transfer logic | Transfer Hook |
| On-chain metadata | Metadata Pointer |
| Privacy | Confidential Transfers |
| Compliance/recovery | Permanent Delegate |
| Yield generation | Interest Bearing |
| Non-tradeable | Non-Transferable |
| Security | CPI Guard |

### Multiple Extensions

```rust
// Combine multiple extensions
let extensions = vec![
    ExtensionType::TransferFeeConfig,
    ExtensionType::MetadataPointer,
    ExtensionType::PermanentDelegate,
];
```

---

## Common Issues

### Issue 1: Wrong Program ID

**Error:** "Invalid program ID"

**Solution:** Use TOKEN_2022_PROGRAM_ID:
```rust
pub token_program: Program<'info, Token2022>,
```

### Issue 2: Insufficient Space

**Error:** "Account data too small"

**Solution:** Calculate space with extensions:
```rust
let space = ExtensionType::try_calculate_account_len::<Mint>(&extensions)?;
```

### Issue 3: Extension Initialization Order

**Error:** "Invalid extension initialization"

**Solution:** Initialize extensions before mint:
```text
1. Create account with space
2. Initialize extensions
3. Initialize mint
```

---

## Best Practices

1. **Choose Wisely:** Only enable needed extensions
2. **Test Thoroughly:** Extensions add complexity
3. **Document Extensions:** Clear documentation for users
4. **Plan Migration:** Strategy for existing tokens
5. **Monitor Adoption:** Track ecosystem support

---

## Comparison: SPL Token vs Token-2022

| Feature | SPL Token | Token-2022 |
|---------|-----------|------------|
| Transfer Fees | Custom program | Built-in |
| Metadata | External (Metaplex) | Built-in option |
| Privacy | No | Confidential transfers |
| Hooks | No | Transfer hooks |
| Compliance | Custom | Permanent delegate |
| Maturity | Stable | Growing |
| Ecosystem | Full support | Increasing |

---

## Next Steps

- Learn about [Transfer Fees](../12-transfer-fees/) for revenue models
- Explore [Transfer Hook](../13-transfer-hook/) for custom logic
- Study [Metadata Pointer](../14-metadata-pointer/) for on-chain metadata

---

## Additional Resources

- [Token-2022 Documentation](https://spl.solana.com/token-2022)
- [Extension Guide](https://spl.solana.com/token-2022/extensions)
- [Migration Guide](https://spl.solana.com/token-2022/migration)

---

**Source:** Adapted from [Solana Program Examples](https://github.com/solana-developers/program-examples)
