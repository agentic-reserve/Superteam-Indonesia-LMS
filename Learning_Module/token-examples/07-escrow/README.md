# Token Escrow

Learn how to implement secure token escrow for atomic swaps and trustless trading.

## Overview

Token escrow enables two parties to exchange tokens securely without trusting each other or a third party. This example demonstrates the classic escrow pattern used in DEXs, NFT marketplaces, and P2P trading platforms.

## Learning Objectives

- Implement secure token escrow
- Create atomic swap mechanisms
- Use PDAs for escrow accounts
- Handle cancellations and refunds
- Understand trustless trading patterns

## Prerequisites

- Completed [Transfer Tokens](../03-transfer-tokens/)
- Completed [PDA Mint Authority](../06-pda-mint-authority/)
- Understanding of token accounts and PDAs

---

## Escrow Fundamentals

### The Problem

**Without Escrow:**
```text
Alice sends tokens → Bob receives → Bob doesn't send back
❌ Alice loses tokens, no recourse
```

**With Escrow:**
```text
Alice deposits → Escrow holds → Bob deposits → Atomic swap
✅ Both get tokens or both get refunds
```

### Escrow Flow

```text
1. Initialize: Alice creates escrow, deposits Token A
2. Exchange: Bob deposits Token B, receives Token A
3. Complete: Alice receives Token B
   OR
3. Cancel: Alice cancels, gets Token A back
```

---

## Implementation

### State Structure

```rust
#[account]
pub struct EscrowState {
    pub initializer: Pubkey,
    pub initializer_token_account: Pubkey,
    pub initializer_amount: u64,
    pub taker_token_account: Pubkey,
    pub taker_amount: u64,
    pub bump: u8,
}
```

### Initialize Escrow

```rust
pub fn initialize(
    ctx: Context<Initialize>,
    initializer_amount: u64,
    taker_amount: u64,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow_state;
    escrow.initializer = ctx.accounts.initializer.key();
    escrow.initializer_token_account = ctx.accounts.initializer_token_account.key();
    escrow.initializer_amount = initializer_amount;
    escrow.taker_token_account = ctx.accounts.taker_token_account.key();
    escrow.taker_amount = taker_amount;
    escrow.bump = ctx.bumps.escrow_state;

    // Transfer tokens to escrow
    transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.initializer_token_account.to_account_info(),
                to: ctx.accounts.escrow_token_account.to_account_info(),
                authority: ctx.accounts.initializer.to_account_info(),
            },
        ),
        initializer_amount,
    )?;

    Ok(())
}
```

### Exchange (Complete Escrow)

```rust
pub fn exchange(ctx: Context<Exchange>) -> Result<()> {
    let escrow = &ctx.accounts.escrow_state;
    
    // Transfer taker's tokens to initializer
    transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.taker_token_account.to_account_info(),
                to: ctx.accounts.initializer_receive_account.to_account_info(),
                authority: ctx.accounts.taker.to_account_info(),
            },
        ),
        escrow.taker_amount,
    )?;

    // Transfer escrowed tokens to taker
    let seeds = &[
        b"escrow",
        escrow.initializer.as_ref(),
        &[escrow.bump],
    ];
    let signer_seeds = &[&seeds[..]];

    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.taker_receive_account.to_account_info(),
                authority: ctx.accounts.escrow_state.to_account_info(),
            },
            signer_seeds,
        ),
        escrow.initializer_amount,
    )?;

    Ok(())
}
```

### Cancel Escrow

```rust
pub fn cancel(ctx: Context<Cancel>) -> Result<()> {
    let escrow = &ctx.accounts.escrow_state;
    
    // Return tokens to initializer
    let seeds = &[
        b"escrow",
        escrow.initializer.as_ref(),
        &[escrow.bump],
    ];
    let signer_seeds = &[&seeds[..]];

    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.initializer_token_account.to_account_info(),
                authority: ctx.accounts.escrow_state.to_account_info(),
            },
            signer_seeds,
        ),
        escrow.initializer_amount,
    )?;

    Ok(())
}
```

---

## Security Considerations

### 1. Authority Validation

```rust
#[account(
    constraint = initializer.key() == escrow_state.initializer @ ErrorCode::Unauthorized
)]
pub initializer: Signer<'info>,
```

### 2. Amount Verification

```rust
require!(
    taker_token_account.amount >= escrow.taker_amount,
    ErrorCode::InsufficientFunds
);
```

### 3. Account Ownership

```rust
#[account(
    constraint = initializer_token_account.owner == initializer.key()
)]
pub initializer_token_account: Account<'info, TokenAccount>,
```

---

## Testing

```typescript
describe("Escrow", () => {
  it("Initialize escrow", async () => {
    await program.methods
      .initialize(
        new anchor.BN(100 * 10**9), // 100 tokens
        new anchor.BN(50 * 10**9)   // 50 tokens
      )
      .accounts({
        initializer: alice.publicKey,
        initializerTokenAccount: aliceTokenA,
        escrowTokenAccount: escrowTokenAccount,
      })
      .signers([alice])
      .rpc();
  });

  it("Complete exchange", async () => {
    await program.methods
      .exchange()
      .accounts({
        taker: bob.publicKey,
        takerTokenAccount: bobTokenB,
        initializerReceiveAccount: aliceTokenB,
        takerReceiveAccount: bobTokenA,
      })
      .signers([bob])
      .rpc();
  });
});
```

---

## Use Cases

1. **P2P Trading:** Direct token swaps
2. **NFT Marketplaces:** Secure NFT sales
3. **OTC Deals:** Large token exchanges
4. **Cross-chain Bridges:** Atomic swaps
5. **Vesting:** Time-locked releases

---

## Best Practices

1. **Validate All Accounts:** Check ownership and amounts
2. **Use PDAs:** For escrow authority
3. **Emit Events:** Log all state changes
4. **Handle Edge Cases:** Empty accounts, zero amounts
5. **Test Thoroughly:** All paths (init, exchange, cancel)

---

## Next Steps

- Learn about [Token Swap](../08-token-swap/) for AMM mechanics
- Explore [Token Fundraiser](../09-token-fundraiser/) for ICO patterns
- Study Token-2022 extensions for advanced features

---

**Source:** Adapted from [Solana Program Examples](https://github.com/solana-developers/program-examples)
