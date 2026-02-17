# Permanent Delegate (Token-2022)

Learn how to implement permanent delegation for compliance, recovery, and regulatory requirements.

## Overview

Permanent Delegate extension allows designating an authority that can always transfer tokens from any account - essential for compliance, account recovery, and regulatory requirements.

## Learning Objectives

- Implement permanent delegation
- Handle compliance scenarios
- Build recovery mechanisms
- Balance control and decentralization

## Prerequisites

- Completed [Token-2022 Basics](../11-token-2022-basics/)
- Completed [External Delegate](../10-external-delegate/)

---

## Implementation

### Create Mint with Permanent Delegate

```rust
#[account(
    init,
    payer = payer,
    mint::decimals = 9,
    mint::authority = payer,
    mint::token_program = token_program,
    extensions::permanent_delegate::PermanentDelegate {
        delegate: compliance_authority.key(),
    },
)]
pub mint: InterfaceAccount<'info, Mint>,
```

### Transfer as Permanent Delegate

```rust
pub fn transfer_as_permanent_delegate(
    ctx: Context<PermanentDelegateTransfer>,
    amount: u64,
) -> Result<()> {
    // Permanent delegate can transfer from any account
    transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.from.to_account_info(),
                to: ctx.accounts.to.to_account_info(),
                authority: ctx.accounts.permanent_delegate.to_account_info(),
            },
        ),
        amount,
    )?;
    Ok(())
}
```

---

## Use Cases

1. **Compliance:** Freeze/seize assets
2. **Recovery:** Recover lost accounts
3. **Regulation:** Meet legal requirements
4. **Stablecoins:** Regulatory compliance

---

## Security Considerations

1. **Centralization Risk:** Permanent delegate has full control
2. **Key Security:** Protect delegate keys
3. **Transparency:** Disclose to users
4. **Governance:** Consider DAO control

---

**Source:** Adapted from [Solana Program Examples](https://github.com/solana-developers/program-examples)
