# Transfer Fees (Token-2022)

Learn how to implement automatic transfer fees for revenue generation and token economics.

## Overview

The Transfer Fee extension allows tokens to automatically charge fees on every transfer - perfect for creating sustainable revenue models, burn mechanisms, or treasury funding.

## Learning Objectives

- Configure transfer fee parameters
- Collect and withdraw fees
- Update fee configuration
- Handle fee calculations
- Build revenue-generating tokens

## Prerequisites

- Completed [Token-2022 Basics](../11-token-2022-basics/)
- Understanding of token transfers
- Knowledge of basis points

---

## Transfer Fee Fundamentals

### How It Works

```text
User transfers 100 tokens
↓
Fee calculated: 100 * 1% = 1 token
↓
Recipient receives: 99 tokens
Fee withheld: 1 token (in recipient's account)
↓
Authority withdraws fees periodically
```

### Fee Configuration

```rust
pub struct TransferFeeConfig {
    pub transfer_fee_config_authority: Pubkey,
    pub withdraw_withheld_authority: Pubkey,
    pub transfer_fee_basis_points: u16,  // 100 = 1%
    pub maximum_fee: u64,
}
```

---

## Implementation

### Create Mint with Transfer Fee

```rust
use anchor_spl::token_2022::{
    spl_token_2022::extension::transfer_fee::TransferFeeConfig,
    Token2022,
};

#[derive(Accounts)]
pub struct CreateMintWithFee<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 9,
        mint::authority = payer,
        mint::token_program = token_program,
        extensions::transfer_fee_config::TransferFeeConfig {
            transfer_fee_config_authority: payer.key(),
            withdraw_withheld_authority: payer.key(),
            transfer_fee_basis_points: 100,  // 1%
            maximum_fee: 10_000_000_000,     // 10 tokens max
        },
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    pub token_program: Program<'info, Token2022>,
    pub system_program: Program<'info, System>,
}
```

### Transfer with Fee

```rust
pub fn transfer_with_fee(
    ctx: Context<TransferWithFee>,
    amount: u64,
) -> Result<()> {
    // Transfer automatically deducts fee
    transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.from.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.to.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        ),
        amount,
        ctx.accounts.mint.decimals,
    )?;

    msg!("Transfer completed with automatic fee deduction");
    Ok(())
}
```

### Withdraw Withheld Fees

```rust
use anchor_spl::token_2022::spl_token_2022::instruction::withdraw_withheld_tokens_from_accounts;

pub fn withdraw_fees(ctx: Context<WithdrawFees>) -> Result<()> {
    // Withdraw fees from token accounts
    let ix = withdraw_withheld_tokens_from_accounts(
        &ctx.accounts.token_program.key(),
        &ctx.accounts.mint.key(),
        &ctx.accounts.destination.key(),
        &ctx.accounts.withdraw_authority.key(),
        &[],
        &[
            &ctx.accounts.source_account_1.key(),
            &ctx.accounts.source_account_2.key(),
        ],
    )?;

    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.destination.to_account_info(),
            ctx.accounts.withdraw_authority.to_account_info(),
            ctx.accounts.source_account_1.to_account_info(),
            ctx.accounts.source_account_2.to_account_info(),
        ],
    )?;

    msg!("Fees withdrawn successfully");
    Ok(())
}
```

### Update Fee Configuration

```rust
pub fn update_transfer_fee(
    ctx: Context<UpdateTransferFee>,
    new_fee_basis_points: u16,
    new_maximum_fee: u64,
) -> Result<()> {
    let ix = set_transfer_fee(
        &ctx.accounts.token_program.key(),
        &ctx.accounts.mint.key(),
        &ctx.accounts.transfer_fee_config_authority.key(),
        &[],
        new_fee_basis_points,
        new_maximum_fee,
    )?;

    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.transfer_fee_config_authority.to_account_info(),
        ],
    )?;

    msg!("Transfer fee updated: {}bps, max: {}", new_fee_basis_points, new_maximum_fee);
    Ok(())
}
```

---

## Fee Calculation

### Basis Points

```text
Basis Points (bps) = Percentage * 100

Examples:
1% = 100 bps
0.5% = 50 bps
0.1% = 10 bps
10% = 1000 bps
```

### Fee Formula

```rust
// Calculate fee
let fee = (amount * fee_basis_points) / 10000;
let fee = fee.min(maximum_fee);

// Amount received
let received = amount - fee;
```

### Example Calculations

```text
Transfer: 1000 tokens
Fee: 1% (100 bps)
Max: 50 tokens

Calculated fee: 1000 * 100 / 10000 = 10 tokens
Actual fee: min(10, 50) = 10 tokens
Received: 1000 - 10 = 990 tokens
```

---

## Account Structures

### Withdraw Fees Context

```rust
#[derive(Accounts)]
pub struct WithdrawFees<'info> {
    #[account(mut)]
    pub withdraw_authority: Signer<'info>,

    #[account(
        mut,
        constraint = mint.withdraw_withheld_authority == COption::Some(withdraw_authority.key())
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(mut)]
    pub destination: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub source_account_1: InterfaceAccount<'info, TokenAccount>,

    #[account(mut)]
    pub source_account_2: InterfaceAccount<'info, TokenAccount>,

    pub token_program: Program<'info, Token2022>,
}
```

---

## Testing

```typescript
import { TOKEN_2022_PROGRAM_ID, getTransferFeeAmount } from "@solana/spl-token";

describe("Transfer Fees", () => {
  it("Create mint with transfer fee", async () => {
    await program.methods
      .createMintWithFee()
      .accounts({
        payer: payer.publicKey,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
      })
      .rpc();
  });

  it("Transfer with automatic fee", async () => {
    const amount = 1000 * 10**9;
    
    await program.methods
      .transferWithFee(new anchor.BN(amount))
      .accounts({
        from: senderTokenAccount,
        to: recipientTokenAccount,
        authority: sender.publicKey,
      })
      .signers([sender])
      .rpc();

    // Check withheld fees
    const accountInfo = await getAccount(
      connection,
      recipientTokenAccount,
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
    
    console.log("Withheld fees:", accountInfo.withheldAmount);
  });

  it("Withdraw fees", async () => {
    await program.methods
      .withdrawFees()
      .accounts({
        withdrawAuthority: authority.publicKey,
        mint: mint.publicKey,
        destination: feeCollectionAccount,
        sourceAccount1: account1,
        sourceAccount2: account2,
      })
      .signers([authority])
      .rpc();
  });
});
```

---

## Use Cases

### 1. Revenue Generation

```rust
// 0.3% fee to treasury
transfer_fee_basis_points: 30,
maximum_fee: u64::MAX,
```

### 2. Burn Mechanism

```rust
// Withdraw to burn address
pub destination: InterfaceAccount<'info, TokenAccount>, // Burn account
```

### 3. Staking Rewards

```rust
// Collect fees for staker rewards
withdraw_withheld_authority: staking_pool_pda,
```

### 4. Dynamic Fees

```rust
pub fn update_fee_based_on_volume(ctx: Context<UpdateFee>) -> Result<()> {
    let volume = get_24h_volume()?;
    let new_fee = if volume > 1_000_000 {
        50  // 0.5% for high volume
    } else {
        100 // 1% for low volume
    };
    // Update fee
    Ok(())
}
```

---

## Best Practices

1. **Reasonable Fees:** Keep fees competitive (0.1-1%)
2. **Maximum Cap:** Set reasonable maximum_fee
3. **Regular Withdrawals:** Don't let fees accumulate
4. **Transparent:** Clearly communicate fee structure
5. **Governance:** Consider DAO control of fees

---

## Common Issues

### Issue 1: Fees Not Collected

**Problem:** Fees withheld but not withdrawn

**Solution:** Call withdraw_withheld_tokens_from_accounts regularly

### Issue 2: Maximum Fee Too Low

**Problem:** Large transfers hit max fee

**Solution:** Set appropriate maximum_fee:
```rust
maximum_fee: 1_000_000_000_000, // 1000 tokens
```

### Issue 3: Authority Mismatch

**Error:** "Invalid withdraw authority"

**Solution:** Verify authority matches configuration:
```rust
constraint = mint.withdraw_withheld_authority == COption::Some(authority.key())
```

---

## Advanced Features

### Harvest All Fees

```rust
pub fn harvest_all_fees(ctx: Context<HarvestFees>) -> Result<()> {
    // Get all token accounts for this mint
    let accounts = get_all_token_accounts(&ctx.accounts.mint.key())?;
    
    // Withdraw from all accounts
    for account in accounts {
        withdraw_fees_from_account(&account)?;
    }
    
    Ok(())
}
```

### Fee Analytics

```rust
#[account]
pub struct FeeStats {
    pub total_fees_collected: u64,
    pub total_transfers: u64,
    pub last_collection: i64,
}
```

---

## Next Steps

- Learn about [Transfer Hook](../13-transfer-hook/) for custom logic
- Explore [Interest Bearing](../17-interest-bearing/) tokens
- Study [Permanent Delegate](../16-permanent-delegate/) for compliance

---

**Source:** Adapted from [Solana Program Examples](https://github.com/solana-developers/program-examples)
