# Rust and Anchor Framework Setup Guide

This guide covers the installation and configuration of Rust programming language and the Anchor framework for building Solana programs with modern development patterns.

## Prerequisites

- Solana CLI installed and configured (see [Solana CLI Setup](solana-cli.md))
- Basic command-line familiarity

## Version Requirements

- **Rust**: 1.75.0 or later (stable channel)
- **Anchor CLI**: 0.30.0 or later
- **Solana CLI**: 1.18.0 or later

## Part 1: Rust Installation

### Linux and macOS

Install Rust using rustup (the official Rust installer):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

During installation, select option 1 (default installation).

After installation completes, configure your current shell:

```bash
source $HOME/.cargo/env
```

### Windows

For Windows users with WSL2, follow the Linux instructions above.

For native Windows installation:
1. Download rustup-init.exe from https://rustup.rs
2. Run the installer and follow the prompts
3. Restart your terminal after installation

### Verify Rust Installation

```bash
rustc --version
```

Expected output:
```
rustc 1.75.0 (or later)
```

Check cargo (Rust's package manager):

```bash
cargo --version
```

Expected output:
```
cargo 1.75.0 (or later)
```

### Configure Rust for Solana

Add the BPF (Berkeley Packet Filter) target for Solana program compilation:

```bash
rustup target add bpf-unknown-unknown
```

For newer Solana versions, also add the SBF target:

```bash
rustup target add sbf-solana-solana
```

## Part 2: Anchor Framework Installation

Anchor is a framework for Solana program development that provides:
- High-level abstractions for common patterns
- Automatic serialization/deserialization
- Built-in security checks
- Testing utilities
- IDL (Interface Definition Language) generation

### Install Anchor CLI

#### Using Anchor Version Manager (AVM) - Recommended

Install AVM (Anchor Version Manager):

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
```

Use AVM to install the latest Anchor version:

```bash
avm install latest
avm use latest
```

#### Direct Installation (Alternative)

Install Anchor directly via cargo:

```bash
cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.0 anchor-cli --locked
```

### Verify Anchor Installation

```bash
anchor --version
```

Expected output:
```
anchor-cli 0.30.0
```

### Install Additional Dependencies

#### Linux

```bash
sudo apt-get update
sudo apt-get install -y pkg-config build-essential libudev-dev libssl-dev
```

#### macOS

```bash
brew install pkg-config openssl
```

## Part 3: Project Initialization

### Create Your First Anchor Project

Initialize a new Anchor project:

```bash
anchor init my-first-program
cd my-first-program
```

This creates a project structure:

```
my-first-program/
├── Anchor.toml           # Anchor configuration
├── Cargo.toml            # Rust workspace configuration
├── package.json          # Node.js dependencies for tests
├── programs/             # Solana programs directory
│   └── my-first-program/
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs    # Main program code
├── tests/                # TypeScript tests
│   └── my-first-program.ts
└── migrations/           # Deployment scripts
    └── deploy.ts
```

### Understanding the Project Structure

**Anchor.toml**: Configuration file specifying:
- Program IDs
- Network clusters
- Test configuration

**programs/**: Contains your Solana programs written in Rust

**tests/**: TypeScript integration tests using Anchor's testing framework

**migrations/**: Deployment scripts for different networks

### Build Your Program

Compile the program:

```bash
anchor build
```

This compiles your Rust program to BPF bytecode. The first build may take several minutes.

Expected output:
```
Compiling my-first-program v0.1.0
Finished release [optimized] target(s) in X.XXs
```

### Get Your Program ID

After building, get your program's address:

```bash
anchor keys list
```

Expected output:
```
my_first_program: <PROGRAM_ID>
```

### Update Program ID in Code

Copy the program ID and update it in two places:

1. **Anchor.toml**:
```toml
[programs.localnet]
my_first_program = "<PROGRAM_ID>"
```

2. **programs/my-first-program/src/lib.rs**:
```rust
declare_id!("<PROGRAM_ID>");
```

### Run Tests

Start a local validator in a separate terminal:

```bash
solana-test-validator
```

In your project terminal, run tests:

```bash
anchor test --skip-local-validator
```

Expected output:
```
  my-first-program
    ✔ Is initialized! (XXXms)

  1 passing (XXXms)
```

## Example: Hello World Program

Here's a minimal Anchor program (programs/my-first-program/src/lib.rs):

```rust
use anchor_lang::prelude::*;

declare_id!("YOUR_PROGRAM_ID_HERE");

#[program]
pub mod my_first_program {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Hello, Solana!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
```

Build and deploy:

```bash
# Build the program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

## Common Anchor Commands

```bash
# Initialize new project
anchor init <project-name>

# Build program
anchor build

# Run tests
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Start local validator and run tests
anchor localnet

# Clean build artifacts
anchor clean

# Upgrade program
anchor upgrade <program-id> --program-keypair <keypair-path>
```

## Configuration Tips

### Anchor.toml Configuration

```toml
[features]
seeds = false
skip-lint = false

[programs.localnet]
my_first_program = "YOUR_PROGRAM_ID"

[programs.devnet]
my_first_program = "YOUR_PROGRAM_ID"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "Localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```

### Cargo.toml for Solana Programs

```toml
[package]
name = "my-first-program"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]
name = "my_first_program"

[dependencies]
anchor-lang = "0.30.0"

[dev-dependencies]
anchor-lang = { version = "0.30.0", features = ["init-if-needed"] }
```

## Troubleshooting

### Build Errors

**Error**: "failed to get `anchor-lang` as a dependency"
- **Solution**: Check your internet connection and try `cargo clean` then `anchor build`

**Error**: "linker `rust-lld` not found"
- **Solution**: Reinstall Rust: `rustup self update && rustup update`

### Deployment Issues

**Error**: "Insufficient funds"
- **Solution**: Ensure your wallet has enough SOL: `solana airdrop 2`

**Error**: "Program already deployed"
- **Solution**: Use `anchor upgrade` instead of `anchor deploy`

### Version Conflicts

If you encounter version mismatches:

```bash
# Update Anchor
avm update

# Update Rust
rustup update

# Update Solana CLI
solana-install update
```

## Best Practices

1. **Use AVM**: Manage multiple Anchor versions for different projects
2. **Pin versions**: Specify exact versions in Cargo.toml for reproducibility
3. **Test locally first**: Use `solana-test-validator` before deploying to devnet
4. **Version control**: Commit Anchor.toml and Cargo.lock to git
5. **Security audits**: Use `anchor verify` to check deployed programs match source code

## Verification Checklist

After completing this setup:

- [ ] `rustc --version` shows Rust 1.75.0 or later
- [ ] `cargo --version` works correctly
- [ ] `anchor --version` shows Anchor 0.30.0 or later
- [ ] `anchor init test-project` creates a new project successfully
- [ ] `anchor build` compiles without errors
- [ ] `anchor test` passes all tests

## Next Steps

With Rust and Anchor configured:

1. **Learn Anchor basics**: Study the example program structure
2. **Explore Anchor documentation**: Visit https://www.anchor-lang.com
3. **Build programs**: Start with [Basics](../basics/README.md) tutorials
4. **Set up client tools**: Install [TypeScript and Node.js](typescript-node.md) for testing

## Additional Resources

- Anchor Documentation: https://www.anchor-lang.com
- Anchor GitHub: https://github.com/coral-xyz/anchor
- Anchor Examples: https://github.com/coral-xyz/anchor/tree/master/examples
- Solana Cookbook: https://solanacookbook.com
- Rust Book: https://doc.rust-lang.org/book/

---

**Source**: Adapted from Anchor framework documentation at https://www.anchor-lang.com/docs/installation
