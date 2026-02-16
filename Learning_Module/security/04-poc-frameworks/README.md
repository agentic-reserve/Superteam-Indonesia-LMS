# Proof-of-Concept Frameworks and Security Research

## Overview

Building proof-of-concept (POC) exploits is an essential skill for security researchers and auditors. This lesson covers how to develop POC frameworks, create CTF challenges, and conduct responsible security research on Solana programs.

## Learning Objectives

- Build proof-of-concept exploits for vulnerabilities
- Create CTF (Capture The Flag) challenges
- Develop security research tools and frameworks
- Practice responsible disclosure
- Document security findings effectively

## Why Build POCs?

Proof-of-concept exploits serve multiple purposes:

1. **Validate vulnerabilities** - Prove that a theoretical issue is actually exploitable
2. **Demonstrate impact** - Show the real-world consequences of a vulnerability
3. **Aid remediation** - Help developers understand and fix the issue
4. **Education** - Teach others about security through hands-on examples
5. **CTF challenges** - Create learning opportunities for the community

## POC Development Workflow

### 1. Vulnerability Analysis

Before building a POC, thoroughly understand the vulnerability:

```rust
// Example: Missing signer check vulnerability
#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,
    // MISSING: Signer check on owner!
    pub owner: AccountInfo<'info>,
}

pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    // Anyone can call this!
    ctx.accounts.vault.balance -= amount;
    Ok(())
}
```

**Vulnerability:** No signer check allows anyone to withdraw from any vault.

### 2. Exploit Development

Build a minimal exploit that demonstrates the issue:

```rust
// POC: Exploit missing signer check
#[test]
fn test_exploit_missing_signer() {
    let mut context = setup_test_context();
    
    // Victim's vault
    let victim_vault = create_vault(&mut context, victim_keypair);
    deposit(&mut context, &victim_vault, 1000);
    
    // Attacker (different keypair)
    let attacker = Keypair::new();
    
    // Exploit: Attacker can withdraw from victim's vault!
    let result = withdraw(
        &mut context,
        &victim_vault,
        &attacker, // Attacker's key, not victim's!
        500,
    );
    
    assert!(result.is_ok(), "Exploit failed");
    assert_eq!(get_balance(&victim_vault), 500, "Funds stolen!");
}
```

### 3. Impact Demonstration

Show the real-world consequences:

```rust
#[test]
fn test_exploit_impact() {
    // Setup: Multiple users with funds
    let users = setup_multiple_users(10);
    for user in &users {
        deposit(&mut context, &user.vault, 10_000);
    }
    
    // Exploit: Attacker drains all vaults
    let attacker = Keypair::new();
    let mut total_stolen = 0;
    
    for user in &users {
        let balance = get_balance(&user.vault);
        withdraw(&mut context, &user.vault, &attacker, balance).unwrap();
        total_stolen += balance;
    }
    
    println!("Total stolen: {} SOL", total_stolen / LAMPORTS_PER_SOL);
    assert_eq!(total_stolen, 100_000, "All funds drained");
}
```

## POC Framework Structure

### Basic Framework Template

```rust
// poc_framework/src/lib.rs

pub mod exploit;
pub mod setup;
pub mod utils;

use anchor_lang::prelude::*;
use solana_program_test::*;
use solana_sdk::{signature::Keypair, signer::Signer};

pub struct PocContext {
    pub banks_client: BanksClient,
    pub payer: Keypair,
    pub recent_blockhash: Hash,
}

impl PocContext {
    pub async fn new() -> Self {
        let program_test = ProgramTest::new(
            "vulnerable_program",
            vulnerable_program::id(),
            processor!(vulnerable_program::entry),
        );
        
        let (banks_client, payer, recent_blockhash) = 
            program_test.start().await;
        
        Self {
            banks_client,
            payer,
            recent_blockhash,
        }
    }
    
    pub async fn airdrop(&mut self, pubkey: &Pubkey, lamports: u64) {
        // Helper to fund accounts
    }
    
    pub async fn send_transaction(
        &mut self,
        instructions: &[Instruction],
        signers: &[&Keypair],
    ) -> Result<()> {
        // Helper to send transactions
    }
}
```

### Exploit Module

```rust
// poc_framework/src/exploit.rs

use super::*;

pub struct Exploit {
    pub attacker: Keypair,
    pub target_vault: Pubkey,
}

impl Exploit {
    pub fn new(target_vault: Pubkey) -> Self {
        Self {
            attacker: Keypair::new(),
            target_vault,
        }
    }
    
    pub async fn execute(&self, ctx: &mut PocContext) -> Result<u64> {
        // 1. Setup attacker account
        ctx.airdrop(&self.attacker.pubkey(), LAMPORTS_PER_SOL).await?;
        
        // 2. Get target balance
        let target_balance = ctx.get_account_balance(&self.target_vault).await?;
        
        // 3. Execute exploit
        let ix = vulnerable_program::instruction::withdraw(
            self.target_vault,
            self.attacker.pubkey(),
            target_balance,
        );
        
        ctx.send_transaction(&[ix], &[&self.attacker]).await?;
        
        // 4. Verify success
        let stolen = ctx.get_account_balance(&self.attacker.pubkey()).await?;
        
        Ok(stolen)
    }
}
```

## Real-World Example: percolator Security Tests

The percolator project includes extensive security testing. Here are patterns you can adapt:

### Example 1: Adversarial Matcher Testing

From percolator audit (Gap 2):

```rust
// Test adversarial matcher that returns invalid data
struct OverfillMatcher;

impl Matcher for OverfillMatcher {
    fn match_order(&self, request: &OrderRequest) -> MatchResult {
        // Malicious: Return exec_size > requested size
        MatchResult {
            exec_size: request.size + 1, // Overfill!
            exec_price: request.oracle_price,
            flags: MatchFlags::VALID,
        }
    }
}

#[test]
fn test_rejects_overfill_matcher() {
    let mut engine = setup_engine();
    let matcher = OverfillMatcher;
    
    let result = engine.execute_trade(
        user_idx,
        lp_idx,
        order_request,
        &matcher,
    );
    
    // Should reject malicious matcher
    assert!(result.is_err());
    assert_eq!(result.unwrap_err(), RiskError::InvalidMatcherOutput);
}
```

### Example 2: Boundary Condition Testing

From percolator audit (Gap 4):

```rust
// Test extreme values that might cause overflow
#[test]
fn test_extreme_values_no_panic() {
    let test_cases = vec![
        (1, 1),                           // Minimum values
        (1_000_000, 1_000_000),          // Medium values
        (MAX_ORACLE_PRICE, MAX_POSITION_ABS), // Maximum values
    ];
    
    for (price, size) in test_cases {
        let result = std::panic::catch_unwind(|| {
            execute_trade_at_price(price, size)
        });
        
        assert!(
            result.is_ok(),
            "Panic at price={}, size={}",
            price,
            size
        );
    }
}
```

### Example 3: State Mutation Testing

From percolator audit (Gap 1):

```rust
// Test that failed operations don't mutate state
#[test]
fn test_error_path_no_mutation() {
    let mut engine = setup_engine();
    let snapshot = engine.clone();
    
    // Try operation that should fail
    let result = engine.touch_account(invalid_idx);
    
    assert!(result.is_err(), "Operation should fail");
    
    // Verify state unchanged
    assert_eq!(
        engine, snapshot,
        "Failed operation mutated state!"
    );
}
```

## CTF Challenge Development

### Challenge Structure

```rust
// ctf_challenge/src/lib.rs

#[program]
pub mod ctf_challenge {
    use super::*;
    
    // Intentionally vulnerable function
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.owner = ctx.accounts.owner.key();
        vault.balance = 0;
        Ok(())
    }
    
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        // TODO: Add vulnerability here
        Ok(())
    }
    
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        // TODO: Add vulnerability here
        Ok(())
    }
}

// Challenge: Find and exploit the vulnerability!
```

### Challenge Documentation

```markdown
# CTF Challenge: Vault Heist

## Objective
Drain all funds from the vault without being the owner.

## Setup
1. Deploy the vulnerable program
2. Initialize a vault with 1000 SOL
3. Your goal: Steal the funds

## Hints
- Look at the account validation
- Check the signer requirements
- Consider what accounts you can pass

## Solution
[Hidden until challenge is solved]
```

## Security Research Tools

### 1. Account Inspector

```rust
pub struct AccountInspector;

impl AccountInspector {
    pub fn analyze(account: &AccountInfo) -> AccountAnalysis {
        AccountAnalysis {
            owner: *account.owner,
            lamports: account.lamports(),
            data_len: account.data_len(),
            is_signer: account.is_signer,
            is_writable: account.is_writable,
            executable: account.executable,
        }
    }
    
    pub fn find_vulnerabilities(accounts: &[AccountInfo]) -> Vec<Vulnerability> {
        let mut vulns = vec![];
        
        for account in accounts {
            if account.is_writable && !account.is_signer {
                vulns.push(Vulnerability::WritableWithoutSigner);
            }
            
            if account.owner == &system_program::ID && account.data_len() > 0 {
                vulns.push(Vulnerability::SystemAccountWithData);
            }
        }
        
        vulns
    }
}
```

### 2. Transaction Simulator

```rust
pub struct TransactionSimulator {
    context: PocContext,
}

impl TransactionSimulator {
    pub async fn simulate_attack(
        &mut self,
        attack_vector: AttackVector,
    ) -> SimulationResult {
        let initial_state = self.snapshot_state().await;
        
        match attack_vector {
            AttackVector::MissingSigner => {
                self.test_missing_signer().await
            }
            AttackVector::Overflow => {
                self.test_overflow().await
            }
            AttackVector::Reentrancy => {
                self.test_reentrancy().await
            }
        }
        
        let final_state = self.snapshot_state().await;
        
        SimulationResult {
            initial_state,
            final_state,
            success: self.check_exploit_success(),
        }
    }
}
```

### 3. Vulnerability Scanner

```rust
pub struct VulnerabilityScanner;

impl VulnerabilityScanner {
    pub fn scan_program(program_id: &Pubkey) -> ScanReport {
        let mut report = ScanReport::new();
        
        // Check for common patterns
        report.check_signer_requirements();
        report.check_overflow_protection();
        report.check_pda_validation();
        report.check_account_ownership();
        
        report
    }
}
```

## Responsible Disclosure

### Disclosure Process

1. **Discover vulnerability** - Document the issue thoroughly
2. **Assess severity** - Determine impact and exploitability
3. **Contact developers** - Reach out privately with details
4. **Allow time to fix** - Give reasonable time (typically 90 days)
5. **Coordinate disclosure** - Agree on public disclosure timing
6. **Publish findings** - Share with community after fix is deployed

### Disclosure Template

```markdown
# Security Vulnerability Report

## Summary
Brief description of the vulnerability

## Severity
Critical / High / Medium / Low

## Affected Versions
List affected program versions

## Description
Detailed explanation of the vulnerability

## Proof of Concept
```rust
// Minimal POC code
```

## Impact
What an attacker can achieve

## Remediation
Recommended fix

## Timeline
- Discovery: YYYY-MM-DD
- Disclosure: YYYY-MM-DD
- Fix deployed: YYYY-MM-DD
```

## Best Practices

1. **Always test on devnet/testnet** - Never exploit mainnet programs
2. **Document everything** - Keep detailed notes of your research
3. **Minimize POC code** - Show the simplest possible exploit
4. **Respect disclosure timelines** - Give developers time to fix
5. **Focus on education** - Help others learn from findings
6. **Follow responsible disclosure** - Protect users while informing developers
7. **Verify fixes** - Test that patches actually resolve the issue

## Exercises

1. **Build a POC:** Create an exploit for a provided vulnerable program
2. **CTF Challenge:** Design a security challenge with multiple vulnerabilities
3. **Scanner Tool:** Build a tool to detect common vulnerability patterns
4. **Disclosure Practice:** Write a professional vulnerability report
5. **Fix Verification:** Test that a patch properly fixes a vulnerability

## Additional Resources

- [Immunefi Bug Bounty Platform](https://immunefi.com/) - Leading bug bounty platform for Web3 projects with active Solana programs
- [Solana Security Workshop](https://github.com/coral-xyz/sealevel-attacks) - Collection of common Solana attack vectors and exploits for learning
- [Neodyme Security Blog](https://blog.neodyme.io/) - Security research articles and vulnerability disclosures from professional auditors
- [Responsible Disclosure Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Vulnerability_Disclosure_Cheat_Sheet.html) - OWASP guidelines for ethically reporting security vulnerabilities

## Source Attribution

This content is inspired by security testing patterns from:
- **Repository:** percolator/percolator
- **File:** `audit.md` (Adversarial matcher tests, Gap 2)
- **URL:** [percolator audit documentation](../../percolator/percolator/audit.md)

Additional patterns from:
- **Repository:** percolator/percolator-prog
- **File:** `audit.md` (Authorization and validation proofs)
- **URL:** [percolator-prog audit documentation](../../percolator/percolator-prog/audit.md)

---

**Next:** Learn about [Post-Quantum Cryptography](../05-post-quantum-crypto/) to prepare for future security threats.
