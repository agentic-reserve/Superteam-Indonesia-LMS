# Common Vulnerabilities in Solana Programs

## Overview

This lesson covers common security vulnerabilities found in real Solana programs through security audits and formal verification. Understanding these vulnerabilities is the first step toward writing secure smart contracts.

## Learning Objectives

- Identify common vulnerability patterns in Solana programs
- Understand attack vectors and exploitation techniques
- Learn prevention strategies and secure coding patterns
- Analyze real audit findings from production systems

## Common Vulnerability Categories

### 1. Account Validation Failures

**Description:** Insufficient validation of account ownership, type, or state can allow attackers to pass malicious accounts to your program.

**Common Issues:**
- Missing owner checks
- Missing signer checks
- Incorrect PDA validation
- Type confusion between account types

**Example Vulnerability:**
```rust
// VULNERABLE: No owner check
pub fn process_instruction(
    accounts: &[AccountInfo],
    data: &[u8],
) -> ProgramResult {
    let account = &accounts[0];
    // Attacker can pass any account!
    let mut account_data = account.try_borrow_mut_data()?;
    // ... modify data
}
```

**Secure Pattern:**
```rust
// SECURE: Verify owner
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: &[u8],
) -> ProgramResult {
    let account = &accounts[0];
    
    // Verify account is owned by this program
    if account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    let mut account_data = account.try_borrow_mut_data()?;
    // ... safely modify data
}
```

### 2. Arithmetic Overflow and Underflow

**Description:** Unchecked arithmetic operations can overflow or underflow, leading to incorrect calculations and potential exploits.

**Common Issues:**
- Using `+`, `-`, `*`, `/` operators without checks
- Casting between numeric types without validation
- Accumulating values without bounds checking

**Example Vulnerability:**
```rust
// VULNERABLE: Unchecked addition
pub fn deposit(account: &mut Account, amount: u64) {
    account.balance = account.balance + amount; // Can overflow!
}
```

**Secure Pattern:**
```rust
// SECURE: Checked arithmetic
pub fn deposit(account: &mut Account, amount: u64) -> Result<()> {
    account.balance = account.balance
        .checked_add(amount)
        .ok_or(ErrorCode::Overflow)?;
    Ok(())
}
```

### 3. Missing Signer Checks

**Description:** Failing to verify that required accounts have signed the transaction allows unauthorized operations.

**Example Vulnerability:**
```rust
// VULNERABLE: No signer check
pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    // Anyone can call this!
    ctx.accounts.vault.balance -= amount;
    Ok(())
}
```

**Secure Pattern:**
```rust
// SECURE: Require signer
#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut, has_one = owner)]
    pub vault: Account<'info, Vault>,
    pub owner: Signer<'info>, // Must sign transaction
}

pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    ctx.accounts.vault.balance -= amount;
    Ok(())
}
```

### 4. PDA Seed Collision

**Description:** Improperly constructed PDA seeds can allow attackers to create accounts that collide with legitimate PDAs.

**Example Vulnerability:**
```rust
// VULNERABLE: User-controlled seed
let (pda, bump) = Pubkey::find_program_address(
    &[user_input.as_bytes()], // Attacker controls this!
    program_id
);
```

**Secure Pattern:**
```rust
// SECURE: Fixed prefix + validated data
let (pda, bump) = Pubkey::find_program_address(
    &[
        b"vault",           // Fixed prefix
        owner.key().as_ref(), // Validated pubkey
        &[vault_id],        // Bounded integer
    ],
    program_id
);
```

### 5. Reentrancy Vulnerabilities

**Description:** While less common in Solana than Ethereum, reentrancy can still occur through CPI (Cross-Program Invocation) calls.

**Prevention Strategies:**
- Update state before making CPI calls
- Use checks-effects-interactions pattern
- Implement reentrancy guards when necessary

**Secure Pattern:**
```rust
pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    // 1. Checks
    require!(ctx.accounts.vault.balance >= amount, ErrorCode::InsufficientFunds);
    
    // 2. Effects (update state FIRST)
    ctx.accounts.vault.balance -= amount;
    
    // 3. Interactions (external calls LAST)
    transfer_tokens(&ctx.accounts, amount)?;
    
    Ok(())
}
```

### 6. Type Confusion

**Description:** Treating one account type as another can lead to memory corruption and exploits.

**Example Vulnerability:**
```rust
// VULNERABLE: No discriminator check
let account_data = account.try_borrow_data()?;
let vault = Vault::try_from_slice(&account_data)?; // Could be wrong type!
```

**Secure Pattern (Anchor):**
```rust
// SECURE: Anchor checks discriminator automatically
#[derive(Accounts)]
pub struct UseVault<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>, // Type-safe!
}
```

## Real-World Audit Findings

### Case Study 1: Stale Haircut After Trade (HIGH)

**Source:** percolator audit (Finding G)

**Issue:** After a trade, the loser's negative PnL hadn't been settled yet, causing the haircut ratio calculation to use inflated capital totals. This resulted in systematic value destruction.

**Impact:** Winner's profit conversion was haircutted to zero, destroying value.

**Fix:** Implement two-pass settlement:
1. Settle losses first (realize negative PnL from capital)
2. Then settle warmup using correct haircut ratio

**Lesson:** Always ensure state is consistent before performing calculations that depend on multiple related values.

### Case Study 2: Fee Debt Traps Accounts (MEDIUM)

**Source:** percolator audit (Finding C)

**Issue:** Accounts with negative `fee_credits` could never call `close_account`. Capital was gradually consumed to pay fees, but any remainder was uncollectable.

**Impact:** Accounts became permanently trapped with uncollectable funds.

**Fix:** `close_account` now forgives remaining fee debt after paying what it can from capital.

**Lesson:** Always provide escape hatches for edge cases, especially when dealing with debt or negative balances.

### Case Study 3: ADL Overflow Atomicity Bug (MEDIUM-HIGH)

**Source:** percolator audit (2026-01-18)

**Issue:** In the Auto-Deleveraging (ADL) function, if a `checked_mul` overflowed on account N, accounts 0..N-1 had already been modified but the operation returned an error.

**Impact:** Partial state modification violated atomicity, leaving some accounts haircutted while others weren't.

**Fix Options:**
- Pre-validate all calculations before applying any changes
- Use wider arithmetic (u256) to avoid overflow
- Enforce bounds on input values

**Lesson:** Operations that modify multiple accounts must be atomic - either all succeed or none do.

### Case Study 4: Matcher Trust Boundary

**Source:** percolator audit (Gap 2)

**Issue:** External matcher programs could return invalid data (overfill, zero price, excessive price).

**Impact:** Could violate protocol invariants if not validated.

**Fix:** Added comprehensive validation:
- Reject `exec_size > requested_size`
- Reject `price == 0`
- Reject `price > MAX_ORACLE_PRICE`
- Verify all matcher outputs before using them

**Lesson:** Never trust external program outputs - validate everything at the trust boundary.

## Vulnerability Detection Techniques

### 1. Manual Code Review
- Check all arithmetic operations for overflow/underflow
- Verify all account ownership and signer checks
- Trace data flow from user input to state changes
- Look for missing validation at trust boundaries

### 2. Automated Tools
- **Anchor's built-in checks:** Automatic discriminator and ownership validation
- **Soteria:** Static analysis tool for Solana programs
- **Sec3:** Automated security scanner

### 3. Fuzzing and Property Testing
- Use Trident framework for property-based testing
- Generate random inputs to find edge cases
- Test invariants across all possible states

### 4. Formal Verification
- Use Kani for mathematical proofs of correctness
- Prove properties hold for all possible inputs
- Verify critical invariants are maintained

## Prevention Checklist

Before deploying a Solana program, verify:

- [ ] All accounts have owner checks
- [ ] All privileged operations require signers
- [ ] All arithmetic uses checked operations
- [ ] PDAs use proper seed construction
- [ ] Account discriminators are checked
- [ ] External program outputs are validated
- [ ] State updates happen before external calls
- [ ] Error paths don't leave partial state changes
- [ ] Integer casts are validated
- [ ] Array accesses are bounds-checked

## Exercises

1. **Vulnerability Hunt:** Review the provided vulnerable program and identify all security issues
2. **Exploit Development:** Write a proof-of-concept exploit for a missing signer check
3. **Secure Refactoring:** Fix all vulnerabilities in a sample program
4. **Audit Report:** Conduct a security review and write findings

## Additional Resources

- [Solana Security Best Practices](https://docs.solana.com/developing/programming-model/security) - Official Solana security guidelines covering common vulnerabilities
- [Anchor Security Guidelines](https://www.anchor-lang.com/docs/security) - Security features and checks built into the Anchor framework
- [Neodyme Security Blog](https://blog.neodyme.io/) - Detailed writeups of Solana security research and real-world exploits
- [Soteria Static Analyzer](https://github.com/blocksecteam/soteria) - Automated static analysis tool for detecting vulnerabilities in Solana programs

## Source Attribution

This content is derived from:
- **Repository:** percolator/percolator
- **File:** `audit.md`
- **URL:** [percolator audit documentation](../../percolator/percolator/audit.md)

Additional examples from:
- **Repository:** percolator/percolator-prog
- **File:** `audit.md`
- **URL:** [percolator-prog audit documentation](../../percolator/percolator-prog/audit.md)

---

**Next:** Learn about [Safe Math](../02-safe-math/) patterns to prevent arithmetic vulnerabilities.
