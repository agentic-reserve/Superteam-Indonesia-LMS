# Fuzzing with Trident Framework

## Overview

Fuzzing is an automated testing technique that generates random inputs to discover bugs, edge cases, and vulnerabilities. The Trident framework brings property-based testing and fuzzing to Solana programs, helping you find issues that traditional tests might miss.

## Learning Objectives

- Understand fuzzing and property-based testing concepts
- Set up Trident for Solana program testing
- Write fuzz test harnesses and invariants
- Analyze coverage and reproduce bugs
- Integrate fuzzing into your development workflow

## What is Fuzzing?

Fuzzing automatically generates test inputs to explore program behavior across a wide range of scenarios. Instead of writing individual test cases, you define properties that should always hold true, and the fuzzer tries to find inputs that violate those properties.

### Traditional Testing vs Fuzzing

**Traditional Unit Test:**
```rust
#[test]
fn test_deposit() {
    let mut vault = Vault { balance: 100 };
    deposit(&mut vault, 50).unwrap();
    assert_eq!(vault.balance, 150);
}
```

**Fuzz Test:**
```rust
#[test]
fn fuzz_deposit_never_decreases_balance(
    initial_balance: u64,
    deposit_amount: u64,
) {
    let mut vault = Vault { balance: initial_balance };
    let old_balance = vault.balance;
    
    if deposit(&mut vault, deposit_amount).is_ok() {
        // Property: successful deposit never decreases balance
        assert!(vault.balance >= old_balance);
    }
}
```

The fuzzer will try thousands of combinations of `initial_balance` and `deposit_amount` to find violations.

## Trident Framework

Trident is a fuzzing framework specifically designed for Solana programs built with Anchor. It provides:

- **Fuzz test harnesses** for Anchor programs
- **Invariant testing** to verify properties across sequences of operations
- **Coverage analysis** to measure test effectiveness
- **Automatic bug reproduction** with minimal failing examples

### Installation

```bash
cargo install trident-cli
```

### Initialize Trident in Your Project

```bash
cd your-anchor-project
trident init
```

This creates a `trident-tests` directory with:
- `fuzz_tests/` - Fuzz test harnesses
- `poc_tests/` - Proof-of-concept exploit tests

## Writing Fuzz Tests

### Basic Fuzz Test Structure

```rust
use trident_client::fuzzing::*;

#[derive(Arbitrary, Debug)]
pub struct FuzzData {
    pub amount: u64,
    pub user_id: u8,
}

pub struct MyFuzzTest;

impl FuzzTestExecutor<FuzzData> for MyFuzzTest {
    fn ixs_to_execute(
        &self,
        data: FuzzData,
    ) -> Result<Vec<Instruction>, FuzzingError> {
        // Generate instructions based on fuzz data
        let ix = your_program::instruction::deposit(
            data.amount,
            data.user_id,
        );
        Ok(vec![ix])
    }
}
```

### Defining Invariants

Invariants are properties that should always hold true:

```rust
impl FuzzTestExecutor<FuzzData> for MyFuzzTest {
    fn check_invariants(
        &self,
        client: &mut impl FuzzClient,
    ) -> Result<(), FuzzingError> {
        // Load program state
        let vault = client.get_account::<Vault>(&vault_pubkey)?;
        let total_deposits = client.get_account::<TotalDeposits>(&deposits_pubkey)?;
        
        // Invariant: vault balance equals sum of all deposits
        assert_eq!(
            vault.balance,
            total_deposits.sum,
            "Vault balance mismatch!"
        );
        
        Ok(())
    }
}
```

## Real-World Example: percolator Fuzzing

The percolator project uses extensive property-based testing with Kani (a formal verification tool similar to fuzzing). Here are patterns you can apply with Trident:

### Example 1: Conservation Invariant

From percolator audit:

```rust
// Property: Total value is conserved across all operations
// Proof: proof_gap3_conservation_trade_entry_neq_oracle

impl FuzzTestExecutor<TradeData> for TradeFuzzTest {
    fn check_invariants(
        &self,
        client: &mut impl FuzzClient,
    ) -> Result<(), FuzzingError> {
        let engine = client.get_account::<RiskEngine>(&engine_pubkey)?;
        
        // Conservation: vault + liabilities = capital + insurance + slack
        let total_value = engine.vault + engine.total_liabilities;
        let total_backing = engine.total_capital 
            + engine.insurance_fund 
            + engine.rounding_slack;
        
        assert!(
            total_value.abs_diff(total_backing) <= MAX_SLACK,
            "Conservation violated! value={}, backing={}",
            total_value,
            total_backing
        );
        
        Ok(())
    }
}
```

### Example 2: Margin Safety

From percolator audit (Gap 1):

```rust
// Property: Failed operations don't mutate state
// Proof: proof_gap1_touch_account_err_no_mutation

impl FuzzTestExecutor<AccountData> for MarginFuzzTest {
    fn ixs_to_execute(
        &self,
        data: AccountData,
    ) -> Result<Vec<Instruction>, FuzzingError> {
        // Try to execute operation that might fail
        let ix = your_program::instruction::touch_account(
            data.account_idx,
        );
        Ok(vec![ix])
    }
    
    fn check_invariants(
        &self,
        client: &mut impl FuzzClient,
    ) -> Result<(), FuzzingError> {
        let account = client.get_account::<Account>(&account_pubkey)?;
        
        // If operation failed, state should be unchanged
        if client.last_tx_failed() {
            assert_eq!(
                account,
                self.snapshot_before_tx,
                "Failed operation mutated state!"
            );
        }
        
        Ok(())
    }
}
```

### Example 3: Overflow Safety

From percolator audit (Gap 4):

```rust
// Property: No panics at extreme values
// Proof: proof_gap4_trade_extreme_price_no_panic

#[derive(Arbitrary, Debug)]
pub struct ExtremeFuzzData {
    #[arbitrary(with = extreme_price_strategy)]
    pub price: u64,
    #[arbitrary(with = extreme_size_strategy)]
    pub size: i128,
}

fn extreme_price_strategy() -> impl Strategy<Value = u64> {
    prop_oneof![
        Just(1),
        Just(1_000_000),
        Just(MAX_ORACLE_PRICE),
    ]
}

fn extreme_size_strategy() -> impl Strategy<Value = i128> {
    prop_oneof![
        Just(1),
        Just(MAX_POSITION_ABS / 2),
        Just(MAX_POSITION_ABS),
        Just(-MAX_POSITION_ABS),
    ]
}

impl FuzzTestExecutor<ExtremeFuzzData> for OverflowFuzzTest {
    fn ixs_to_execute(
        &self,
        data: ExtremeFuzzData,
    ) -> Result<Vec<Instruction>, FuzzingError> {
        // Should never panic, even with extreme values
        let ix = your_program::instruction::execute_trade(
            data.price,
            data.size,
        );
        Ok(vec![ix])
    }
}
```

## Advanced Fuzzing Techniques

### 1. Stateful Fuzzing

Test sequences of operations:

```rust
#[derive(Arbitrary, Debug)]
pub enum FuzzInstruction {
    Deposit { amount: u64 },
    Withdraw { amount: u64 },
    Trade { size: i64, price: u64 },
    Liquidate { account_id: u8 },
}

impl FuzzTestExecutor<Vec<FuzzInstruction>> for StatefulFuzzTest {
    fn ixs_to_execute(
        &self,
        data: Vec<FuzzInstruction>,
    ) -> Result<Vec<Instruction>, FuzzingError> {
        let mut instructions = vec![];
        
        for fuzz_ix in data {
            match fuzz_ix {
                FuzzInstruction::Deposit { amount } => {
                    instructions.push(deposit_ix(amount));
                }
                FuzzInstruction::Withdraw { amount } => {
                    instructions.push(withdraw_ix(amount));
                }
                // ... handle other instructions
            }
        }
        
        Ok(instructions)
    }
}
```

### 2. Custom Generators

Control the distribution of test inputs:

```rust
#[derive(Debug)]
pub struct SmartFuzzData {
    pub amount: u64,
    pub percentage: u16, // 0-10000 basis points
}

impl Arbitrary for SmartFuzzData {
    fn arbitrary(u: &mut Unstructured<'_>) -> Result<Self> {
        Ok(SmartFuzzData {
            // Bias toward realistic amounts
            amount: u.int_in_range(1..=1_000_000)?,
            // Ensure percentage is valid
            percentage: u.int_in_range(0..=10000)?,
        })
    }
}
```

### 3. Differential Fuzzing

Compare two implementations:

```rust
impl FuzzTestExecutor<FuzzData> for DifferentialFuzzTest {
    fn check_invariants(
        &self,
        client: &mut impl FuzzClient,
    ) -> Result<(), FuzzingError> {
        let result_v1 = calculate_fee_v1(amount, rate);
        let result_v2 = calculate_fee_v2(amount, rate);
        
        assert_eq!(
            result_v1,
            result_v2,
            "Implementation mismatch!"
        );
        
        Ok(())
    }
}
```

## Running Fuzz Tests

### Basic Fuzzing

```bash
# Run fuzz tests
trident fuzz run fuzz_0

# Run with more iterations
trident fuzz run fuzz_0 --iterations 10000

# Run with specific seed for reproduction
trident fuzz run fuzz_0 --seed 0x1234567890abcdef
```

### Coverage Analysis

```bash
# Generate coverage report
trident fuzz run-with-coverage fuzz_0

# View coverage in browser
trident fuzz coverage-report
```

### Reproducing Bugs

When a fuzz test finds a bug, Trident saves the failing input:

```bash
# Reproduce the exact failure
trident fuzz reproduce fuzz_0 crash-0x1234567890abcdef
```

## Integration with CI/CD

Add fuzzing to your CI pipeline:

```yaml
# .github/workflows/fuzz.yml
name: Fuzz Tests

on: [push, pull_request]

jobs:
  fuzz:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      - name: Install Trident
        run: cargo install trident-cli
      - name: Run fuzz tests
        run: |
          cd your-program
          trident fuzz run-all --iterations 1000
```

## Best Practices

1. **Start with simple invariants** and add complexity gradually
2. **Test one property per fuzz test** for clear failure messages
3. **Use custom generators** to focus on realistic inputs
4. **Run fuzzing continuously** in CI/CD
5. **Reproduce and fix** all found issues before deploying
6. **Combine with unit tests** - fuzzing finds edge cases, unit tests document expected behavior
7. **Monitor coverage** to ensure all code paths are tested
8. **Save interesting test cases** as regression tests

## Common Invariants to Test

- **Conservation:** Total value in = total value out
- **Monotonicity:** Certain values only increase or only decrease
- **Bounds:** Values stay within expected ranges
- **Consistency:** Related values maintain relationships
- **Idempotency:** Repeating operations has no additional effect
- **Reversibility:** Operations can be undone
- **Authorization:** Only authorized users can perform actions

## Debugging Fuzz Failures

When a fuzz test fails:

1. **Reproduce the failure** with the saved seed
2. **Minimize the input** to find the simplest failing case
3. **Add logging** to understand the failure path
4. **Write a unit test** for the specific case
5. **Fix the bug** and verify with both unit and fuzz tests
6. **Add regression test** to prevent reintroduction

## Exercises

1. **Basic Fuzzing:** Write a fuzz test for a simple vault program
2. **Invariant Testing:** Implement conservation invariants for a token program
3. **Bug Hunt:** Use fuzzing to find bugs in a provided vulnerable program
4. **Stateful Fuzzing:** Test a complex DeFi protocol with sequences of operations
5. **Coverage Analysis:** Achieve 90%+ coverage on a program using fuzzing

## Additional Resources

- [Trident Documentation](https://ackee.xyz/trident/docs/latest/) - Official documentation for the Trident fuzzing framework
- [Property-Based Testing Guide](https://hypothesis.works/articles/what-is-property-based-testing/) - Introduction to property-based testing concepts and techniques
- [Fuzzing Best Practices](https://google.github.io/fuzzing/docs/best-practices/) - Google's guide to effective fuzzing strategies
- [Kani Rust Verifier](https://model-checking.github.io/kani/) - Formal verification tool as an alternative approach to finding bugs

## Source Attribution

This content is inspired by formal verification patterns from:
- **Repository:** percolator/percolator
- **File:** `audit.md` (151 Kani proofs)
- **URL:** [percolator audit documentation](../../percolator/percolator/audit.md)

Key proof patterns referenced:
- Conservation proofs (Gap 3)
- Error-path mutation safety (Gap 1)
- Overflow safety (Gap 4)
- Trust boundary validation (Gap 2)

---

**Next:** Learn about [POC Frameworks](../04-poc-frameworks/) for security research and exploit development.
