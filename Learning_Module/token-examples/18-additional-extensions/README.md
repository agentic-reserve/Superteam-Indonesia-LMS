# Additional Token-2022 Extensions

Learn about additional Token-2022 extensions: CPI Guard, Default Account State, Immutable Owner, Non-Transferable, Memo Required, and more.

## Overview

Token-2022 includes many specialized extensions for specific use cases. This guide covers the remaining extensions not detailed in previous sections.

## Extensions Covered

1. **CPI Guard** - Prevent CPI exploits
2. **Default Account State** - Accounts frozen by default
3. **Immutable Owner** - Prevent ownership changes
4. **Non-Transferable** - Soulbound tokens
5. **Memo Required** - Require transfer memos
6. **Mint Close Authority** - Close mint accounts
7. **Group/Member** - Token groups

---

## 1. CPI Guard

### Purpose
Prevents programs from performing CPIs with user's token accounts without explicit approval.

### Implementation
```rust
#[account(
    init,
    payer = payer,
    associated_token::mint = mint,
    associated_token::authority = owner,
    extensions::cpi_guard::CpiGuard {
        lock_cpi: true,
    },
)]
pub token_account: InterfaceAccount<'info, TokenAccount>,
```

### Use Cases
- Security against malicious programs
- User protection
- Explicit approval requirements

---

## 2. Default Account State

### Purpose
New token accounts are frozen by default, requiring explicit activation.

### Implementation
```rust
#[account(
    init,
    payer = payer,
    mint::decimals = 9,
    mint::authority = payer,
    mint::token_program = token_program,
    extensions::default_account_state::DefaultAccountState {
        state: AccountState::Frozen,
    },
)]
pub mint: InterfaceAccount<'info, Mint>,
```

### Use Cases
- KYC/AML compliance
- Whitelist enforcement
- Controlled distribution

---

## 3. Immutable Owner

### Purpose
Prevents changing the owner of a token account.

### Implementation
```rust
#[account(
    init,
    payer = payer,
    associated_token::mint = mint,
    associated_token::authority = owner,
    extensions::immutable_owner::ImmutableOwner {},
)]
pub token_account: InterfaceAccount<'info, TokenAccount>,
```

### Use Cases
- Security enhancement
- Prevent ownership exploits
- Permanent associations

---

## 4. Non-Transferable

### Purpose
Creates soulbound tokens that cannot be transferred.

### Implementation
```rust
#[account(
    init,
    payer = payer,
    mint::decimals = 0,
    mint::authority = payer,
    mint::token_program = token_program,
    extensions::non_transferable::NonTransferable {},
)]
pub mint: InterfaceAccount<'info, Mint>,
```

### Use Cases
- Identity tokens
- Credentials/certificates
- Reputation systems
- Achievement badges

---

## 5. Memo Required

### Purpose
Requires a memo for every transfer.

### Implementation
```rust
#[account(
    init,
    payer = payer,
    associated_token::mint = mint,
    associated_token::authority = owner,
    extensions::memo_transfer::MemoTransfer {
        require_incoming_transfer_memos: true,
    },
)]
pub token_account: InterfaceAccount<'info, TokenAccount>,
```

### Use Cases
- Compliance tracking
- Transaction labeling
- Audit trails

---

## 6. Mint Close Authority

### Purpose
Allows closing mint accounts to reclaim rent.

### Implementation
```rust
#[account(
    init,
    payer = payer,
    mint::decimals = 9,
    mint::authority = payer,
    mint::token_program = token_program,
    extensions::mint_close_authority::MintCloseAuthority {
        close_authority: payer.key(),
    },
)]
pub mint: InterfaceAccount<'info, Mint>,
```

### Use Cases
- Temporary tokens
- Test tokens
- Rent reclamation

---

## 7. Group and Member

### Purpose
Create token groups with member tokens.

### Implementation
```rust
// Group mint
#[account(
    init,
    payer = payer,
    mint::decimals = 0,
    mint::authority = payer,
    mint::token_program = token_program,
    extensions::group_pointer::GroupPointer {
        authority: payer.key(),
        group_address: group_mint.key(),
    },
)]
pub group_mint: InterfaceAccount<'info, Mint>,

// Member mint
#[account(
    init,
    payer = payer,
    mint::decimals = 0,
    mint::authority = payer,
    mint::token_program = token_program,
    extensions::group_member_pointer::GroupMemberPointer {
        authority: payer.key(),
        member_address: member_mint.key(),
    },
)]
pub member_mint: InterfaceAccount<'info, Mint>,
```

### Use Cases
- NFT collections
- Token families
- Hierarchical tokens

---

## Combining Extensions

### Multiple Extensions Example

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
        transfer_fee_basis_points: 100,
        maximum_fee: 10_000_000_000,
    },
    extensions::permanent_delegate::PermanentDelegate {
        delegate: compliance_authority.key(),
    },
    extensions::metadata_pointer::MetadataPointer {
        authority: payer.key(),
        metadata_address: mint.key(),
    },
)]
pub mint: InterfaceAccount<'info, Mint>,
```

---

## Extension Compatibility

| Extension | Compatible With |
|-----------|----------------|
| Transfer Fee | Most extensions |
| Transfer Hook | Most extensions |
| Confidential | Limited compatibility |
| Non-Transferable | Cannot combine with transfer-related |
| CPI Guard | All extensions |

---

## Best Practices

1. **Choose Wisely:** Only enable needed extensions
2. **Test Combinations:** Verify extension interactions
3. **Document:** Clearly document enabled extensions
4. **User Communication:** Explain extension effects
5. **Governance:** Consider DAO control

---

## Comparison Matrix

| Extension | Use Case | Complexity | Gas Cost |
|-----------|----------|------------|----------|
| CPI Guard | Security | Low | Low |
| Default State | Compliance | Medium | Medium |
| Immutable Owner | Security | Low | Low |
| Non-Transferable | Identity | Low | Low |
| Memo Required | Compliance | Low | Low |
| Mint Close | Rent | Low | Low |
| Group/Member | Collections | High | High |

---

## Next Steps

- Review all Token-2022 extensions
- Plan your token's extension needs
- Test extension combinations
- Deploy to mainnet

---

## Additional Resources

- [Token-2022 Extensions Guide](https://spl.solana.com/token-2022/extensions)
- [Extension Examples](https://github.com/solana-labs/solana-program-library/tree/master/token/program-2022/src/extension)
- [Token-2022 Migration](https://spl.solana.com/token-2022/migration)

---

**Source:** Adapted from [Solana Program Examples](https://github.com/solana-developers/program-examples)
