# Transfer Tokens

Learn how to transfer SPL Tokens between wallets using Associated Token Accounts.

## Overview

Token transfers on Solana are conducted between Associated Token Accounts (ATAs), not directly between wallet addresses. This example demonstrates how to safely transfer tokens from one user to another using the SPL Token Program.

## Learning Objectives

By completing this example, you will learn how to:

- Transfer tokens between Associated Token Accounts
- Handle recipient ATA creation automatically
- Validate token account ownership
- Implement transfers with proper decimal handling
- Use the SPL Token Program's transfer instruction

## Prerequisites

- Completed [Create Token](../01-create-token/) example
- Completed [SPL Token Minter](../02-spl-token-minter/) example
- Understanding of Associated Token Accounts
- Basic knowledge of token authorities

---

## Token Transfer Fundamentals

### How Transfers Work

Unlike native SOL transfers that go directly between wallet addresses, SPL Token transfers require:

1. **Source ATA:** The sender's Associated Token Account for the specific token
2. **Destination ATA:** The recipient's Associated Token Account for the same token
3. **Authority:** The owner of the source ATA must sign the transaction

```text
Sender Wallet → Sender ATA → Recipient ATA → Recipient Wallet
     (signs)      (from)         (to)         (receives)
```

### Key Differences from SOL Transfers

| Aspect | SOL Transfer | Token Transfer |
|--------|-------------|----------------|
| From | Wallet address | Associated Token Account |
| To | Wallet address | Associated Token Account |
| Authority | Wallet owner | Token account owner |
| Account Creation | Automatic | Must create ATA first |

---

## Implementation

This example builds on the previous examples by adding transfer functionality.

### Program Structure

```text
transfer-tokens/
├── src/
│   ├── lib.rs              # Program entry point
│   └── instructions/
│       ├── mod.rs          # Module exports
│       ├── create.rs       # Token creation
│       ├── mint.rs         # Token minting
│       └── transfer.rs     # Token transfer
```

---

## Anchor Implementation

### Main Program (lib.rs)

```rust
use anchor_lang::prelude::*;

pub mod instructions;
use instructions::*;

declare_id!("nHi9DdNjuupjQ3c8AJU9sChB5gLbZvTLsJQouY4hU67");

#[program]
pub mod transfer_tokens {
    use super::*;

    pub fn create_token(
        ctx: Context<CreateToken>,
        token_title: String,
        token_symbol: String,
        token_uri: String,
    ) -> Result<()> {
        create::create_token(ctx, token_title, token_symbol, token_uri)
    }

    pub fn mint_token(ctx: Context<MintToken>, amount: u64) -> Result<()> {
        mint::mint_token(ctx, amount)
    }

    pub fn transfer_tokens(ctx: Context<TransferTokens>, amount: u64) -> Result<()> {
        transfer::transfer_tokens(ctx, amount)
    }
}
```

### Transfer Instruction (transfer.rs)

```rust
use {
    anchor_lang::prelude::*,
    anchor_spl::{
        associated_token::AssociatedToken,
        token::{transfer, Mint, Token, TokenAccount, Transfer},
    },
};

#[derive(Accounts)]
pub struct TransferTokens<'info> {
    /// Sender must sign the transaction
    #[account(mut)]
    pub sender: Signer<'info>,
    
    /// Recipient wallet (doesn't need to sign)
    pub recipient: SystemAccount<'info>,

    #[account(mut)]
    pub mint_account: Account<'info, Mint>,
    
    /// Sender's token account - must be owned by sender
    #[account(
        mut,
        associated_token::mint = mint_account,
        associated_token::authority = sender,
    )]
    pub sender_token_account: Account<'info, TokenAccount>,
    
    /// Recipient's token account - created if needed
    #[account(
        init_if_needed,
        payer = sender,
        associated_token::mint = mint_account,
        associated_token::authority = recipient,
    )]
    pub recipient_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn transfer_tokens(ctx: Context<TransferTokens>, amount: u64) -> Result<()> {
    msg!("Transferring tokens...");
    msg!("Mint: {}", &ctx.accounts.mint_account.to_account_info().key());
    msg!("From Token Address: {}", &ctx.accounts.sender_token_account.key());
    msg!("To Token Address: {}", &ctx.accounts.recipient_token_account.key());

    // Calculate amount with decimals
    let amount_with_decimals = amount * 10u64.pow(ctx.accounts.mint_account.decimals as u32);

    // Invoke the transfer instruction on the token program
    transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.sender_token_account.to_account_info(),
                to: ctx.accounts.recipient_token_account.to_account_info(),
                authority: ctx.accounts.sender.to_account_info(),
            },
        ),
        amount_with_decimals,
    )?;

    msg!("Tokens transferred successfully.");
    Ok(())
}
```

### Key Concepts

**1. Account Ownership Validation:**
```rust
#[account(
    mut,
    associated_token::mint = mint_account,
    associated_token::authority = sender,
)]
pub sender_token_account: Account<'info, TokenAccount>,
```
- Validates the sender owns the source token account
- Ensures the token account is for the correct mint
- Prevents unauthorized transfers

**2. Automatic Recipient ATA Creation:**
```rust
#[account(
    init_if_needed,
    payer = sender,
    associated_token::mint = mint_account,
    associated_token::authority = recipient,
)]
pub recipient_token_account: Account<'info, TokenAccount>,
```
- Creates recipient's ATA if it doesn't exist
- Sender pays for the account creation
- Prevents transaction failures

**3. Transfer CPI:**
```rust
transfer(
    CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.sender_token_account.to_account_info(),
            to: ctx.accounts.recipient_token_account.to_account_info(),
            authority: ctx.accounts.sender.to_account_info(),
        },
    ),
    amount_with_decimals,
)?;
```
- Calls SPL Token Program's transfer instruction
- Authority must be the owner of the source account
- Amount is in raw token units (adjusted for decimals)

---

## Testing

### TypeScript Test Example

```typescript
import * as anchor from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Keypair } from "@solana/web3.js";
import { BN } from "bn.js";
import type { TransferTokens } from "../target/types/transfer_tokens";

describe("Transfer Tokens", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;
  const program = anchor.workspace.TransferTokens as anchor.Program<TransferTokens>;

  const metadata = {
    name: "Solana Gold",
    symbol: "GOLDSOL",
    uri: "https://raw.githubusercontent.com/solana-developers/program-examples/new-examples/tokens/tokens/.assets/spl-token.json",
  };

  const mintKeypair = new Keypair();
  const recipient = new Keypair();

  // Derive ATAs for sender and recipient
  const senderTokenAddress = getAssociatedTokenAddressSync(
    mintKeypair.publicKey,
    payer.publicKey
  );

  const recipientTokenAddress = getAssociatedTokenAddressSync(
    mintKeypair.publicKey,
    recipient.publicKey
  );

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

  it("Mint tokens!", async () => {
    const amount = new BN(100);

    const transactionSignature = await program.methods
      .mintToken(amount)
      .accounts({
        mintAuthority: payer.publicKey,
        recipient: payer.publicKey,
        mintAccount: mintKeypair.publicKey,
        associatedTokenAccount: senderTokenAddress,
      })
      .rpc();

    console.log("Success!");
    console.log(`   Associated Token Account: ${senderTokenAddress}`);
    console.log(`   Transaction Signature: ${transactionSignature}`);
  });

  it("Transfer tokens!", async () => {
    const amount = new BN(50);

    const transactionSignature = await program.methods
      .transferTokens(amount)
      .accounts({
        sender: payer.publicKey,
        recipient: recipient.publicKey,
        mintAccount: mintKeypair.publicKey,
        senderTokenAccount: senderTokenAddress,
        recipientTokenAccount: recipientTokenAddress,
      })
      .rpc();

    console.log("Success!");
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
  transfer
} from "@solana/spl-token";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

async function transferTokens(
  connection: Connection,
  mintAddress: PublicKey,
  senderKeypair: Keypair,
  recipientAddress: PublicKey,
  amount: number,
  decimals: number
) {
  // Get sender's ATA
  const senderAta = await getAssociatedTokenAddress(
    mintAddress,
    senderKeypair.publicKey
  );

  // Get recipient's ATA
  const recipientAta = await getAssociatedTokenAddress(
    mintAddress,
    recipientAddress
  );

  // Check if recipient ATA exists
  const recipientAccountInfo = await connection.getAccountInfo(recipientAta);
  
  const transaction = new Transaction();

  // Create recipient ATA if it doesn't exist
  if (!recipientAccountInfo) {
    const createAtaIx = createAssociatedTokenAccountInstruction(
      senderKeypair.publicKey, // payer
      recipientAta,             // ata
      recipientAddress,         // owner
      mintAddress               // mint
    );
    transaction.add(createAtaIx);
  }

  // Transfer tokens
  const amountWithDecimals = amount * 10 ** decimals;
  
  await transfer(
    connection,
    senderKeypair,
    senderAta,
    recipientAta,
    senderKeypair,
    amountWithDecimals
  );

  console.log(`Transferred ${amount} tokens to ${recipientAddress.toBase58()}`);
}
```

### Using Anchor Client

```typescript
import * as anchor from "@coral-xyz/anchor";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

async function transferWithAnchor(
  program: anchor.Program,
  sender: anchor.Wallet,
  recipient: PublicKey,
  mintAddress: PublicKey,
  amount: number
) {
  const senderAta = getAssociatedTokenAddressSync(
    mintAddress,
    sender.publicKey
  );

  const recipientAta = getAssociatedTokenAddressSync(
    mintAddress,
    recipient
  );

  await program.methods
    .transferTokens(new anchor.BN(amount))
    .accounts({
      sender: sender.publicKey,
      recipient: recipient,
      mintAccount: mintAddress,
      senderTokenAccount: senderAta,
      recipientTokenAccount: recipientAta,
    })
    .rpc();
}
```

---

## Common Issues and Solutions

### Issue 1: Insufficient Balance

**Error:** "Insufficient funds"

**Solution:** Check sender's token balance before transfer:

```rust
require!(
    ctx.accounts.sender_token_account.amount >= amount_with_decimals,
    ErrorCode::InsufficientBalance
);
```

### Issue 2: Wrong Authority

**Error:** "Invalid authority"

**Solution:** Ensure the sender is the owner of the source token account:

```rust
#[account(
    mut,
    associated_token::mint = mint_account,
    associated_token::authority = sender, // Must match signer
)]
pub sender_token_account: Account<'info, TokenAccount>,
```

### Issue 3: Frozen Account

**Error:** "Account is frozen"

**Solution:** Check if the token account is frozen:

```rust
require!(
    ctx.accounts.sender_token_account.is_frozen() == false,
    ErrorCode::AccountFrozen
);
```

### Issue 4: Recipient ATA Doesn't Exist

**Error:** "Account not found"

**Solution:** Use `init_if_needed` or create the ATA before transfer:

```rust
#[account(
    init_if_needed,
    payer = sender,
    associated_token::mint = mint_account,
    associated_token::authority = recipient,
)]
```

---

## Best Practices

1. **Always Validate Ownership:** Ensure sender owns the source account
2. **Use init_if_needed:** Automatically create recipient ATAs
3. **Check Balances:** Validate sufficient balance before transfer
4. **Handle Decimals:** Always adjust amounts for token decimals
5. **Provide Clear Errors:** Return descriptive error messages
6. **Consider Fees:** Sender pays for recipient ATA creation (~0.00203 SOL)

---

## Advanced Topics

### Transfer with Delegate

```rust
pub fn transfer_with_delegate(
    ctx: Context<TransferWithDelegate>, 
    amount: u64
) -> Result<()> {
    // Delegate can transfer on behalf of owner
    transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.source.to_account_info(),
                to: ctx.accounts.destination.to_account_info(),
                authority: ctx.accounts.delegate.to_account_info(), // Delegate, not owner
            },
        ),
        amount,
    )?;
    Ok(())
}
```

### Batch Transfers

```rust
pub fn batch_transfer(
    ctx: Context<BatchTransfer>,
    recipients: Vec<Pubkey>,
    amounts: Vec<u64>
) -> Result<()> {
    require!(recipients.len() == amounts.len(), ErrorCode::LengthMismatch);
    
    for (recipient, amount) in recipients.iter().zip(amounts.iter()) {
        // Transfer to each recipient
    }
    
    Ok(())
}
```

### Transfer with Memo

```rust
use spl_memo::build_memo;

pub fn transfer_with_memo(
    ctx: Context<TransferWithMemo>,
    amount: u64,
    memo: String
) -> Result<()> {
    // Transfer tokens
    transfer(/* ... */)?;
    
    // Add memo
    let memo_ix = build_memo(memo.as_bytes(), &[]);
    anchor_lang::solana_program::program::invoke(
        &memo_ix,
        &[],
    )?;
    
    Ok(())
}
```

---

## Security Considerations

1. **Authority Validation:** Always verify the signer is authorized
2. **Account Ownership:** Check token account ownership
3. **Frozen Accounts:** Handle frozen token accounts gracefully
4. **Amount Validation:** Prevent overflow and underflow
5. **Reentrancy:** Token transfers are not vulnerable to reentrancy

---

## Next Steps

- Learn about [NFT Minter](../04-nft-minter/) to create unique tokens
- Explore [NFT Operations](../05-nft-operations/) for advanced NFT management
- Study [PDA Mint Authority](../06-pda-mint-authority/) for program-controlled tokens

---

## Additional Resources

- [SPL Token Program Documentation](https://spl.solana.com/token)
- [Token Transfer Guide](https://solanacookbook.com/references/token.html#how-to-transfer-tokens)
- [Anchor Book - CPIs](https://book.anchor-lang.com/anchor_in_depth/CPIs.html)
- [Associated Token Accounts](https://spl.solana.com/associated-token-account)

---

**Source:** Adapted from [Solana Program Examples](https://github.com/solana-developers/program-examples)
