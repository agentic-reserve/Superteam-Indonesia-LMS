# Safe Math and Overflow Protection

## Overview

Arithmetic overflow and underflow are among the most common vulnerabilities in smart contracts. This lesson covers safe math patterns, checked arithmetic operations, and techniques to prevent numeric errors in Solana programs.

## Learning Objectives

- Understand overflow and underflow vulnerabilities
- Use Rust's checked arithmetic operations
- Implement saturating and wrapping arithmetic appropriately
- Apply safe casting between numeric types
- Design overflow-resistant algorithms

## Why Safe Math Matters

### The Problem

In most programming languages, integer arithmetic can silently overflow or underflow:

```rust
let x: u8 = 255;
let y = x + 1; // Wraps to 0 in release mode!
```

In financial applications, this can lead to:
- Balance manipulation
- Incorrect fee calculations
- Broken invariants
- Loss of funds

### Real-World Impact

From the percolator audit:
> "If the `checked_mul` in the haircut calculation overflows on account N, accounts 0..N-1 have already been modified but the operation returns an error."

This demonstrates how overflow can break atomicity and leave the system in an inconsistent state.

## Rust Arithmetic Operations

### 1. Unchecked Operations (Default)

**Debug mode:** Panics on overflow
**Release mode:** Wraps silently

```rust
// DANGEROUS in release builds
let balance = balance + amount;
let total = price * quantity;
```

**When to use:** Never in production smart contracts!

### 2. Checked Operations

Returns `Option<T>` - `None` on overflow.

```rust
// SAFE: Returns None on overflow
let new_balance = balance.checked_add(amount)?;
let total = price.checked_mul(quantity)
    .ok_or(ErrorCode::Overflow)?;
```

**When to use:** Financial calculations, state updates, any critical arithmetic.

### 3. Saturating Operations

Clamps to min/max instead of wrapping.

```rust
// Saturates at u64::MAX instead of wrapping
let capped_value = value.saturating_add(increment);

// Saturates at 0 instead of wrapping
let non_negative = balance.saturating_sub(amount);
```

**When to use:** UI calculations, non-critical bounds, rate limiting.

### 4. Wrapping Operations

Explicitly wraps on overflow (same as default in release).

```rust
// Explicitly wraps
let hash = hash.wrapping_mul(31).wrapping_add(byte as u64);
```

**When to use:** Hash functions, checksums, intentional modular arithmetic.

### 5. Overflowing Operations

Returns tuple with result and overflow flag.

```rust
let (result, overflowed) = a.overflowing_add(b);
if overflowed {
    return Err(ErrorCode::Overflow);
}
```

**When to use:** When you need to handle overflow specially.

## Safe Math Patterns

### Pattern 1: Checked Arithmetic with Error Handling

```rust
use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    Overflow,
    Underflow,
}

pub fn safe_deposit(vault: &mut Vault, amount: u64) -> Result<()> {
    vault.balance = vault.balance
        .checked_add(amount)
        .ok_or(ErrorCode::Overflow)?;
    Ok(())
}

pub fn safe_withdraw(vault: &mut Vault, amount: u64) -> Result<()> {
    vault.balance = vault.balance
        .checked_sub(amount)
        .ok_or(ErrorCode::Underflow)?;
    Ok(())
}
```

### Pattern 2: Safe Multiplication with Division

When multiplying then dividing, use wider types to prevent intermediate overflow:

```rust
// VULNERABLE: Intermediate overflow
fn calculate_fee(amount: u64, fee_bps: u64) -> Result<u64> {
    let fee = amount.checked_mul(fee_bps)? / 10000; // Can overflow!
    Ok(fee)
}

// SAFE: Use u128 for intermediate calculation
fn calculate_fee_safe(amount: u64, fee_bps: u64) -> Result<u64> {
    let amount_wide = amount as u128;
    let fee_bps_wide = fee_bps as u128;
    let fee_wide = amount_wide
        .checked_mul(fee_bps_wide)
        .ok_or(ErrorCode::Overflow)?
        / 10000;
    
    // Safe downcast with check
    u64::try_from(fee_wide)
        .map_err(|_| ErrorCode::Overflow.into())
}
```

### Pattern 3: Bounded Accumulation

When accumulating values, check bounds:

```rust
pub fn accumulate_fees(
    state: &mut State,
    fee: u64,
    max_fees: u64
) -> Result<()> {
    let new_total = state.total_fees
        .checked_add(fee)
        .ok_or(ErrorCode::Overflow)?;
    
    require!(
        new_total <= max_fees,
        ErrorCode::ExceedsMaxFees
    );
    
    state.total_fees = new_total;
    Ok(())
}
```

### Pattern 4: Safe Casting

Always validate when casting between types:

```rust
// VULNERABLE: Truncation
let amount_u64 = amount_u128 as u64; // Silently truncates!

// SAFE: Checked conversion
let amount_u64 = u64::try_from(amount_u128)
    .map_err(|_| ErrorCode::Overflow)?;

// SAFE: With explicit bounds check
fn safe_cast_u128_to_u64(value: u128) -> Result<u64> {
    if value > u64::MAX as u128 {
        return Err(ErrorCode::Overflow.into());
    }
    Ok(value as u64)
}
```

### Pattern 5: Percentage Calculations

```rust
// Calculate percentage safely
fn calculate_percentage(
    amount: u64,
    percentage: u64, // In basis points (1/10000)
) -> Result<u64> {
    require!(percentage <= 10000, ErrorCode::InvalidPercentage);
    
    let amount_wide = amount as u128;
    let result = (amount_wide * percentage as u128) / 10000;
    
    u64::try_from(result)
        .map_err(|_| ErrorCode::Overflow.into())
}
```

## Real-World Examples from percolator

### Example 1: Fee Calculation with Overflow Protection

From percolator audit (Gap 4):

```rust
// Proof: proof_gap4_trade_extreme_price_no_panic
// Verifies: Trade at oracle ∈ {1, 10^6, MAX_ORACLE_PRICE} — no panic

pub fn calculate_maintenance_fee(
    capital: u64,
    fee_per_slot: u64,
    slots_elapsed: u64,
) -> Result<u64> {
    // Use checked multiplication to prevent overflow
    let fee = fee_per_slot
        .checked_mul(slots_elapsed)
        .ok_or(ErrorCode::Overflow)?;
    
    // Ensure fee doesn't exceed capital
    Ok(fee.min(capital))
}
```

### Example 2: Position Size Limits

From percolator audit (Gap 4):

```rust
// Proof: proof_gap4_trade_extreme_size_no_panic
// Verifies: Trade at size ∈ {1, MAX_POSITION_ABS/2, MAX_POSITION_ABS} — no panic

pub fn update_position(
    account: &mut Account,
    size_delta: i128,
) -> Result<()> {
    let new_size = account.position_size
        .checked_add(size_delta)
        .ok_or(ErrorCode::Overflow)?;
    
    // Enforce position limits
    require!(
        new_size.abs() <= MAX_POSITION_ABS,
        ErrorCode::PositionTooLarge
    );
    
    account.position_size = new_size;
    Ok(())
}
```

### Example 3: Haircut Calculation with Bounds

From percolator audit (Gap 2):

```rust
// Proof: proof_gap2_execute_trade_err_preserves_inv
// Verifies: execute_trade Err (bad matcher) still preserves canonical_inv

pub fn apply_haircut(
    pnl: u128,
    total_pnl: u128,
    loss_to_socialize: u128,
) -> Result<u128> {
    // Prevent division by zero
    if total_pnl == 0 {
        return Ok(0);
    }
    
    // Use checked multiplication to prevent overflow
    let numerator = loss_to_socialize
        .checked_mul(pnl)
        .ok_or(ErrorCode::Overflow)?;
    
    let haircut = numerator / total_pnl;
    
    // Haircut cannot exceed original PnL
    Ok(haircut.min(pnl))
}
```

## Common Pitfalls

### Pitfall 1: Forgetting to Check Intermediate Results

```rust
// WRONG: Only checks final result
let result = a.checked_add(b)? + c; // Second add is unchecked!

// RIGHT: Check all operations
let temp = a.checked_add(b)?;
let result = temp.checked_add(c)?;
```

### Pitfall 2: Using Saturating Math for Financial Calculations

```rust
// WRONG: Silently caps at max
vault.balance = vault.balance.saturating_add(deposit);

// RIGHT: Fail explicitly on overflow
vault.balance = vault.balance
    .checked_add(deposit)
    .ok_or(ErrorCode::Overflow)?;
```

### Pitfall 3: Mixing Signed and Unsigned Arithmetic

```rust
// WRONG: Can underflow unexpectedly
let balance: u64 = 100;
let delta: i64 = -200;
let new_balance = (balance as i64 + delta) as u64; // Wraps!

// RIGHT: Check sign and use appropriate operation
let new_balance = if delta >= 0 {
    balance.checked_add(delta as u64)?
} else {
    balance.checked_sub((-delta) as u64)?
};
```

## Testing Safe Math

### Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_deposit_overflow() {
        let mut vault = Vault {
            balance: u64::MAX - 100,
        };
        
        // Should succeed
        assert!(safe_deposit(&mut vault, 50).is_ok());
        
        // Should fail with overflow
        assert!(safe_deposit(&mut vault, 100).is_err());
    }

    #[test]
    fn test_withdraw_underflow() {
        let mut vault = Vault { balance: 100 };
        
        // Should succeed
        assert!(safe_withdraw(&mut vault, 50).is_ok());
        
        // Should fail with underflow
        assert!(safe_withdraw(&mut vault, 100).is_err());
    }
}
```

### Property-Based Tests

```rust
#[cfg(test)]
mod property_tests {
    use proptest::prelude::*;

    proptest! {
        #[test]
        fn deposit_never_decreases_balance(
            initial_balance in 0u64..u64::MAX/2,
            deposit in 0u64..u64::MAX/2,
        ) {
            let mut vault = Vault { balance: initial_balance };
            if safe_deposit(&mut vault, deposit).is_ok() {
                assert!(vault.balance >= initial_balance);
            }
        }
    }
}
```

## Best Practices Summary

1. **Always use checked arithmetic** for financial calculations
2. **Use wider types** for intermediate calculations
3. **Validate casts** between numeric types
4. **Test edge cases** at type boundaries (0, MAX, MIN)
5. **Document overflow behavior** in function comments
6. **Use saturating math** only for non-critical calculations
7. **Fail explicitly** rather than silently capping values
8. **Check all operations** in a chain, not just the final result

## Exercises

1. **Fix Vulnerable Code:** Identify and fix overflow vulnerabilities in provided examples
2. **Implement Safe Calculator:** Build a calculator module with all safe operations
3. **Property Testing:** Write property tests for arithmetic invariants
4. **Audit Challenge:** Review a DeFi protocol for arithmetic vulnerabilities

## Additional Resources

- [Rust Overflow Documentation](https://doc.rust-lang.org/book/ch03-02-data-types.html#integer-overflow) - Official Rust documentation on integer overflow behavior and handling
- [Anchor Error Handling](https://www.anchor-lang.com/docs/errors) - Guide to error handling and custom errors in Anchor programs
- [Checked Arithmetic in Rust](https://doc.rust-lang.org/std/primitive.u64.html#method.checked_add) - Standard library documentation for checked arithmetic operations

## Source Attribution

This content is derived from:
- **Repository:** percolator/percolator
- **File:** `audit.md` (Gap 4: Overflow / Never-Panic at Extreme Values)
- **URL:** [percolator audit documentation](../../percolator/percolator/audit.md)

Examples demonstrate patterns from 151 passing Kani proofs including:
- `proof_gap4_trade_extreme_price_no_panic`
- `proof_gap4_trade_extreme_size_no_panic`
- `proof_gap4_margin_extreme_values_no_panic`

---

**Next:** Learn about [Fuzzing with Trident](../03-fuzzing-with-trident/) to automatically discover arithmetic bugs.
