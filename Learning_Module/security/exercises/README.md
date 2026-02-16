# Security Exercises

## Overview

These hands-on exercises help you practice security concepts covered in the Security topic area. Each exercise includes objectives, validation criteria, hints, and solution references.

## Exercise Categories

- **Vulnerability Detection** - Find security issues in code
- **Safe Math Implementation** - Write overflow-resistant code
- **Fuzzing Practice** - Use property-based testing
- **Exploit Development** - Build proof-of-concept exploits
- **Post-Quantum Crypto** - Implement quantum-resistant schemes

## Exercises

### Exercise 1: Vulnerability Hunt

**Difficulty:** Beginner
**Topic:** Common Vulnerabilities
**Estimated Time:** 45 minutes

**Objective:**
Review a vulnerable Solana program and identify all security issues.

**Scenario:**
You've been hired to audit a simple vault program. The program allows users to deposit and withdraw SOL, but it contains several critical vulnerabilities.

**Tasks:**
1. Identify all security vulnerabilities in the provided code
2. Classify each vulnerability by severity (Critical/High/Medium/Low)
3. Explain the potential impact of each vulnerability
4. Suggest fixes for each issue

**Validation Criteria:**
- [ ] Found all critical vulnerabilities (missing signer checks, overflow issues)
- [ ] Correctly classified vulnerability severity
- [ ] Provided clear explanations of impact
- [ ] Suggested appropriate fixes

**Hints:**
- Check all account validation
- Look for missing signer requirements
- Examine arithmetic operations
- Consider PDA seed construction
- Review error handling

**Solution Reference:** [solutions/exercise-01-vulnerability-hunt.md](solutions/exercise-01-vulnerability-hunt.md)

---

### Exercise 2: Safe Math Refactoring

**Difficulty:** Beginner
**Topic:** Safe Math
**Estimated Time:** 30 minutes

**Objective:**
Refactor a program to use checked arithmetic operations throughout.

**Scenario:**
A DeFi protocol uses unchecked arithmetic in several critical functions. Your task is to refactor the code to use safe math patterns.

**Tasks:**
1. Replace all unchecked arithmetic with checked operations
2. Add appropriate error handling
3. Implement safe type casting
4. Add bounds checking where necessary
5. Write tests for overflow/underflow cases

**Validation Criteria:**
- [ ] All arithmetic operations use checked methods
- [ ] Proper error handling for overflow/underflow
- [ ] Safe casting between numeric types
- [ ] Tests cover edge cases (0, MAX, MIN)
- [ ] No panics in release mode

**Hints:**
- Use `checked_add`, `checked_sub`, `checked_mul`, `checked_div`
- Consider using wider types for intermediate calculations
- Test at type boundaries
- Don't forget about casting operations

**Solution Reference:** [solutions/exercise-02-safe-math.md](solutions/exercise-02-safe-math.md)

---

### Exercise 3: Fuzz Test Development

**Difficulty:** Intermediate
**Topic:** Fuzzing with Trident
**Estimated Time:** 60 minutes

**Objective:**
Write comprehensive fuzz tests for a token program using Trident.

**Scenario:**
You're testing a custom token program. Write fuzz tests to verify critical invariants hold across all possible inputs.

**Tasks:**
1. Set up Trident in the project
2. Write fuzz tests for deposit/withdraw operations
3. Implement invariant checks (conservation, bounds, consistency)
4. Test with extreme values
5. Achieve >80% code coverage

**Validation Criteria:**
- [ ] Fuzz tests execute successfully
- [ ] Conservation invariant verified
- [ ] Bounds checking implemented
- [ ] Extreme values tested
- [ ] Coverage >80%

**Hints:**
- Start with simple invariants
- Use custom generators for realistic inputs
- Test sequences of operations
- Check state consistency after each operation
- Monitor coverage to find untested paths

**Solution Reference:** [solutions/exercise-03-fuzzing.md](solutions/exercise-03-fuzzing.md)

---

### Exercise 4: Exploit Development

**Difficulty:** Intermediate
**Topic:** POC Frameworks
**Estimated Time:** 60 minutes

**Objective:**
Build a proof-of-concept exploit for a missing signer check vulnerability.

**Scenario:**
A vault program has a critical vulnerability: the withdraw function doesn't verify that the vault owner signed the transaction. Build a POC that demonstrates the exploit.

**Tasks:**
1. Analyze the vulnerable code
2. Build a POC framework
3. Implement the exploit
4. Demonstrate impact (drain multiple vaults)
5. Write a vulnerability report

**Validation Criteria:**
- [ ] POC successfully exploits the vulnerability
- [ ] Demonstrates stealing funds from victim's vault
- [ ] Shows impact across multiple accounts
- [ ] Includes clear vulnerability report
- [ ] Code is well-documented

**Hints:**
- Use `solana-program-test` for testing
- Create victim and attacker accounts
- Show before/after balances
- Keep POC minimal and focused
- Document each step clearly

**Solution Reference:** [solutions/exercise-04-exploit-poc.md](solutions/exercise-04-exploit-poc.md)

---

### Exercise 5: CTF Challenge Design

**Difficulty:** Advanced
**Topic:** POC Frameworks
**Estimated Time:** 90 minutes

**Objective:**
Design a CTF challenge with multiple vulnerabilities of varying difficulty.

**Scenario:**
Create a "Vault Heist" CTF challenge where participants must find and exploit multiple vulnerabilities to drain a vault.

**Tasks:**
1. Design a program with 3-4 vulnerabilities
2. Create challenge documentation
3. Write a solution guide
4. Implement automated validation
5. Test with beta solvers

**Validation Criteria:**
- [ ] Multiple vulnerabilities of varying difficulty
- [ ] Clear challenge objectives
- [ ] Comprehensive documentation
- [ ] Working solution
- [ ] Automated validation

**Hints:**
- Layer vulnerabilities (easy to hard)
- Provide progressive hints
- Make it educational, not frustrating
- Test with others before releasing
- Document learning objectives

**Solution Reference:** [solutions/exercise-05-ctf-challenge.md](solutions/exercise-05-ctf-challenge.md)

---

### Exercise 6: WOTS+ Implementation

**Difficulty:** Advanced
**Topic:** Post-Quantum Cryptography
**Estimated Time:** 120 minutes

**Objective:**
Implement a basic Winternitz One-Time Signature scheme.

**Scenario:**
Build a simplified WOTS+ implementation to understand quantum-resistant signatures.

**Tasks:**
1. Implement key generation
2. Implement signing algorithm
3. Implement verification algorithm
4. Write comprehensive tests
5. Measure performance

**Validation Criteria:**
- [ ] Key generation produces valid keypairs
- [ ] Signatures verify correctly
- [ ] Invalid signatures are rejected
- [ ] Tests cover edge cases
- [ ] Performance benchmarks included

**Hints:**
- Start with a simple hash function (SHA-256)
- Use small parameters for testing (W=4)
- Test with known vectors
- Verify security properties
- Document the algorithm clearly

**Solution Reference:** [solutions/exercise-06-wots-implementation.md](solutions/exercise-06-wots-implementation.md)

---

### Exercise 7: Quantum-Resistant Vault

**Difficulty:** Advanced
**Topic:** Post-Quantum Cryptography
**Estimated Time:** 120 minutes

**Objective:**
Build a quantum-resistant vault program using WOTS+ signatures.

**Scenario:**
Implement a Solana program that uses WOTS+ instead of Ed25519 for authorization.

**Tasks:**
1. Design the vault architecture
2. Implement WOTS+ verification on-chain
3. Handle one-time key constraints
4. Implement vault splitting for key rotation
5. Optimize for Solana compute limits

**Validation Criteria:**
- [ ] Vault creation works correctly
- [ ] WOTS+ verification succeeds for valid signatures
- [ ] Invalid signatures are rejected
- [ ] Vault splitting maintains security
- [ ] Stays within compute unit limits

**Hints:**
- Use truncated hashes to save compute
- Implement efficient PDA validation
- Test compute unit usage
- Handle edge cases (empty vault, max size)
- Document security assumptions

**Solution Reference:** [solutions/exercise-07-quantum-vault.md](solutions/exercise-07-quantum-vault.md)

---

### Exercise 8: Security Audit Simulation

**Difficulty:** Advanced
**Topic:** All Topics
**Estimated Time:** 180 minutes

**Objective:**
Conduct a comprehensive security audit of a DeFi protocol.

**Scenario:**
You've been hired to audit a lending protocol. Perform a thorough security review and deliver a professional audit report.

**Tasks:**
1. Review all program code
2. Identify vulnerabilities
3. Assess severity and impact
4. Build POCs for critical issues
5. Write comprehensive audit report
6. Suggest remediation strategies

**Validation Criteria:**
- [ ] All critical vulnerabilities found
- [ ] Severity correctly assessed
- [ ] POCs demonstrate exploitability
- [ ] Professional audit report
- [ ] Clear remediation guidance

**Hints:**
- Use a systematic approach
- Check all common vulnerability patterns
- Test with fuzzing
- Build POCs for high-severity issues
- Follow responsible disclosure practices

**Solution Reference:** [solutions/exercise-08-audit-simulation.md](solutions/exercise-08-audit-simulation.md)

---

### Exercise 9: Invariant Testing

**Difficulty:** Intermediate
**Topic:** Fuzzing with Trident
**Estimated Time:** 90 minutes

**Objective:**
Write property-based tests that verify critical invariants in a DeFi protocol.

**Scenario:**
A perpetual futures protocol must maintain several invariants. Write tests to verify these properties hold across all operations.

**Tasks:**
1. Identify critical invariants (conservation, margin safety, etc.)
2. Write property tests for each invariant
3. Test with sequences of operations
4. Find and fix any violations
5. Document all invariants

**Validation Criteria:**
- [ ] All critical invariants identified
- [ ] Property tests implemented
- [ ] Tests pass with 1000+ iterations
- [ ] Violations found and fixed
- [ ] Invariants documented

**Hints:**
- Start with conservation (value in = value out)
- Test margin requirements
- Verify bounds on all values
- Test state consistency
- Use stateful fuzzing for sequences

**Solution Reference:** [solutions/exercise-09-invariant-testing.md](solutions/exercise-09-invariant-testing.md)

---

### Exercise 10: Hybrid Cryptography

**Difficulty:** Advanced
**Topic:** Post-Quantum Cryptography
**Estimated Time:** 90 minutes

**Objective:**
Implement a hybrid signature scheme combining Ed25519 and Dilithium.

**Scenario:**
Build a transition system that uses both classical and post-quantum signatures for defense-in-depth.

**Tasks:**
1. Integrate liboqs for Dilithium
2. Implement hybrid signing
3. Implement hybrid verification
4. Handle backward compatibility
5. Measure performance impact

**Validation Criteria:**
- [ ] Hybrid signatures work correctly
- [ ] Both signatures must be valid
- [ ] Backward compatible with Ed25519-only
- [ ] Performance benchmarks included
- [ ] Migration path documented

**Hints:**
- Sign the same message with both schemes
- Verify both signatures independently
- Consider signature size impact
- Test compute unit usage
- Plan migration strategy

**Solution Reference:** [solutions/exercise-10-hybrid-crypto.md](solutions/exercise-10-hybrid-crypto.md)

---

## Exercise Progression

### Beginner Path
1. Exercise 1: Vulnerability Hunt
2. Exercise 2: Safe Math Refactoring
3. Exercise 3: Fuzz Test Development

### Intermediate Path
4. Exercise 4: Exploit Development
5. Exercise 9: Invariant Testing
6. Exercise 5: CTF Challenge Design

### Advanced Path
7. Exercise 6: WOTS+ Implementation
8. Exercise 7: Quantum-Resistant Vault
9. Exercise 10: Hybrid Cryptography
10. Exercise 8: Security Audit Simulation

## Validation and Feedback

After completing each exercise:

1. **Self-Assessment:** Review the validation criteria
2. **Code Review:** Compare your solution with the reference
3. **Testing:** Ensure all tests pass
4. **Documentation:** Write clear explanations
5. **Reflection:** Document what you learned

## Additional Practice

- **Bug Bounties:** Participate in Immunefi programs
- **CTF Competitions:** Join Solana security CTFs
- **Open Source Audits:** Review public Solana programs
- **Community:** Share findings and learn from others

## Getting Help

- Review the relevant topic lessons
- Check the solution references
- Ask in Solana security forums
- Join security-focused Discord channels

## Source Attribution

Exercise patterns inspired by:
- **percolator audit findings** - Real-world vulnerability examples
- **percolator-prog proofs** - Authorization and validation patterns
- **solana-post-quantum** - Quantum-resistant implementations

---

**Ready to start?** Begin with [Exercise 1: Vulnerability Hunt](exercise-01-vulnerability-hunt.md)
