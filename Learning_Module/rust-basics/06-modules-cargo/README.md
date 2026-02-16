# Modules and Cargo

## Overview

As Rust projects grow, organizing code becomes essential. Rust's module system allows you to split code into logical units, control visibility, and manage namespaces. Cargo, Rust's build system and package manager, handles compilation, dependencies, testing, and more. Together, they provide a robust foundation for building and maintaining large-scale projects.

In Solana development, understanding modules and Cargo is crucial. Solana programs are organized into modules, use Cargo for dependency management, and rely on specific Cargo features for on-chain deployment. The Anchor framework further leverages Rust's module system to provide a clean, organized structure for your programs.

**Estimated Time:** 2-3 hours

## Learning Objectives

By completing this lesson, you will be able to:

- Organize code using Rust's module system
- Control visibility with `pub` and privacy rules
- Use `use` statements to bring items into scope
- Structure projects with multiple files and directories
- Understand Cargo's project structure and conventions
- Manage dependencies in Cargo.toml
- Use Cargo features and workspaces
- Apply module organization to Solana programs
- Understand Anchor's module structure

## Prerequisites

- Completion of [Lesson 05: Traits and Generics](../05-traits-generics/README.md)
- Understanding of structs, enums, and functions
- Familiarity with basic Rust syntax

## The Module System

Rust's module system helps you organize code into logical units and control which parts are public or private.

### Defining Modules

```rust
// Define a module
mod front_of_house {
    mod hosting {
        fn add_to_waitlist() {}
        fn seat_at_table() {}
    }
    
    mod serving {
        fn take_order() {}
        fn serve_order() {}
        fn take_payment() {}
    }
}
```

**Key points:**
- Modules are defined with `mod`
- Modules can be nested
- By default, everything is private

### Module Paths

Access items in modules using paths:

```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

pub fn eat_at_restaurant() {
    // Absolute path
    crate::front_of_house::hosting::add_to_waitlist();
    
    // Relative path
    front_of_house::hosting::add_to_waitlist();
}
```

**Path types:**
- **Absolute path**: Starts with `crate` (the crate root)
- **Relative path**: Starts from the current module

### Privacy Rules

```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
        
        fn private_function() {} // Private by default
    }
    
    mod serving { // Private module
        fn take_order() {}
    }
}

pub fn eat_at_restaurant() {
    front_of_house::hosting::add_to_waitlist(); // OK
    // front_of_house::hosting::private_function(); // Error: private
    // front_of_house::serving::take_order(); // Error: private module
}
```

**Privacy rules:**
- Items are private by default
- Use `pub` to make items public
- Child modules can access private items in parent modules
- Parent modules cannot access private items in child modules

### The `use` Keyword

Bring items into scope with `use`:

```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
}
```

### Idiomatic `use` Patterns

```rust
// For functions: bring parent module into scope
use std::collections::HashMap;

fn main() {
    let mut map = HashMap::new();
    map.insert(1, 2);
}

// For structs, enums, etc.: bring the item itself
use std::collections::HashMap;

fn main() {
    let mut map = HashMap::new();
}

// Handling name conflicts with `as`
use std::fmt::Result;
use std::io::Result as IoResult;

fn function1() -> Result { /* ... */ }
fn function2() -> IoResult<()> { /* ... */ }
```

### Re-exporting with `pub use`

```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

// Re-export hosting so external code can use it
pub use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
}
```

**Benefits:**
- Simplifies external API
- Hides internal organization
- Provides convenient access paths

### Using External Packages

```rust
// Add to Cargo.toml:
// [dependencies]
// rand = "0.8.5"

use rand::Rng;

fn main() {
    let secret_number = rand::thread_rng().gen_range(1..=100);
    println!("Secret number: {}", secret_number);
}
```

### Nested Paths

```rust
// Instead of:
use std::cmp::Ordering;
use std::io;

// Use nested paths:
use std::{cmp::Ordering, io};

// For items from the same module:
use std::io;
use std::io::Write;

// Can be written as:
use std::io::{self, Write};
```

### The Glob Operator

```rust
// Bring all public items into scope
use std::collections::*;

fn main() {
    let mut map = HashMap::new();
    let mut set = HashSet::new();
}
```

**Warning:** Use sparingly, as it makes it unclear which names are in scope.

## Separating Modules into Files

As projects grow, split modules into separate files.

### Single File Module

```rust
// src/lib.rs
mod front_of_house;

pub use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
}

// src/front_of_house.rs
pub mod hosting {
    pub fn add_to_waitlist() {}
}
```

### Module Directory Structure

```rust
// src/lib.rs
mod front_of_house;

pub use crate::front_of_house::hosting;

// src/front_of_house.rs
pub mod hosting;
pub mod serving;

// src/front_of_house/hosting.rs
pub fn add_to_waitlist() {}
pub fn seat_at_table() {}

// src/front_of_house/serving.rs
pub fn take_order() {}
pub fn serve_order() {}
```

**Module file structure:**
- `mod name;` tells Rust to load the module from another file
- Look for `src/name.rs` or `src/name/mod.rs`
- Submodules go in `src/name/submodule.rs`

## Cargo: Rust's Build System

Cargo is Rust's build system and package manager, handling compilation, dependencies, testing, and more.

### Cargo Project Structure

```
my_project/
├── Cargo.toml          # Package metadata and dependencies
├── Cargo.lock          # Exact dependency versions (auto-generated)
├── src/
│   ├── main.rs         # Binary crate entry point
│   ├── lib.rs          # Library crate entry point
│   └── bin/            # Additional binaries
│       └── another.rs
├── tests/              # Integration tests
│   └── integration_test.rs
├── benches/            # Benchmarks
│   └── benchmark.rs
└── examples/           # Example programs
    └── example.rs
```

### Cargo.toml

The manifest file defines your package:

```toml
[package]
name = "my_project"
version = "0.1.0"
edition = "2021"
authors = ["Your Name <you@example.com>"]
description = "A sample Rust project"
license = "MIT"

[dependencies]
serde = { version = "1.0", features = ["derive"] }
tokio = { version = "1", features = ["full"] }
rand = "0.8"

[dev-dependencies]
criterion = "0.5"

[build-dependencies]
cc = "1.0"

[features]
default = ["feature1"]
feature1 = []
feature2 = ["dep:optional-dep"]

[profile.release]
opt-level = 3
lto = true
```

**Key sections:**
- `[package]`: Package metadata
- `[dependencies]`: Runtime dependencies
- `[dev-dependencies]`: Development and test dependencies
- `[build-dependencies]`: Build script dependencies
- `[features]`: Optional features
- `[profile.*]`: Compilation profiles

### Common Cargo Commands

```bash
# Create new project
cargo new my_project
cargo new --lib my_library

# Build project
cargo build              # Debug build
cargo build --release    # Optimized build

# Run project
cargo run
cargo run --release

# Check code (faster than build)
cargo check

# Run tests
cargo test
cargo test test_name     # Run specific test
cargo test -- --nocapture # Show println! output

# Generate documentation
cargo doc
cargo doc --open         # Open in browser

# Update dependencies
cargo update

# Clean build artifacts
cargo clean

# Format code
cargo fmt

# Lint code
cargo clippy
```

### Dependency Specification

```toml
[dependencies]
# Crates.io version
serde = "1.0"

# Specific version
serde = "=1.0.100"

# Version range
serde = ">=1.0, <2.0"

# Git repository
my_lib = { git = "https://github.com/user/repo" }

# Git with branch/tag/commit
my_lib = { git = "https://github.com/user/repo", branch = "main" }
my_lib = { git = "https://github.com/user/repo", tag = "v1.0" }
my_lib = { git = "https://github.com/user/repo", rev = "abc123" }

# Local path
my_lib = { path = "../my_lib" }

# With features
serde = { version = "1.0", features = ["derive"] }

# Optional dependency
optional_dep = { version = "1.0", optional = true }
```

### Cargo Features

Features allow conditional compilation:

```toml
[features]
default = ["std"]
std = []
serde_support = ["dep:serde"]

[dependencies]
serde = { version = "1.0", optional = true }
```

```rust
// Use features in code
#[cfg(feature = "serde_support")]
use serde::{Serialize, Deserialize};

#[cfg_attr(feature = "serde_support", derive(Serialize, Deserialize))]
pub struct MyStruct {
    pub field: i32,
}
```

```bash
# Build with specific features
cargo build --features serde_support
cargo build --no-default-features
cargo build --all-features
```

### Cargo Workspaces

Workspaces manage multiple related packages:

```toml
# Workspace root Cargo.toml
[workspace]
members = [
    "package1",
    "package2",
    "package3",
]

[workspace.dependencies]
serde = "1.0"
```

```toml
# package1/Cargo.toml
[package]
name = "package1"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = { workspace = true }
package2 = { path = "../package2" }
```

**Benefits:**
- Shared Cargo.lock
- Shared target directory
- Shared dependencies
- Build all packages together

## Solana Context

Understanding modules and Cargo is essential for Solana program development.

### Solana Program Structure

```
my_solana_program/
├── Cargo.toml
├── src/
│   ├── lib.rs              # Program entry point
│   ├── instruction.rs      # Instruction definitions
│   ├── processor.rs        # Instruction processing
│   ├── state.rs            # Account state structures
│   └── error.rs            # Custom errors
└── tests/
    └── integration.rs
```

### Solana Program Cargo.toml

```toml
[package]
name = "my_solana_program"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]

[dependencies]
solana-program = "1.17"
borsh = "0.10"
thiserror = "1.0"

[dev-dependencies]
solana-program-test = "1.17"
solana-sdk = "1.17"

[features]
no-entrypoint = []
```

**Key points:**
- `crate-type = ["cdylib", "lib"]`: Build as dynamic library for on-chain deployment
- `solana-program`: Core Solana program library
- `no-entrypoint` feature: For testing and library usage

### Solana Program Module Organization

```rust
// src/lib.rs
pub mod instruction;
pub mod processor;
pub mod state;
pub mod error;

use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    processor::process(program_id, accounts, instruction_data)
}

// src/instruction.rs
use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum MyInstruction {
    Initialize { amount: u64 },
    Transfer { amount: u64 },
}

// src/state.rs
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct MyAccount {
    pub owner: Pubkey,
    pub balance: u64,
}

// src/error.rs
use solana_program::program_error::ProgramError;
use thiserror::Error;

#[derive(Error, Debug, Copy, Clone)]
pub enum MyError {
    #[error("Insufficient funds")]
    InsufficientFunds,
}

impl From<MyError> for ProgramError {
    fn from(e: MyError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
```

### Anchor Program Structure

Anchor provides a more organized structure:

```
my_anchor_program/
├── Cargo.toml
├── programs/
│   └── my_program/
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs
│           ├── instructions/
│           │   ├── mod.rs
│           │   ├── initialize.rs
│           │   └── transfer.rs
│           └── state/
│               ├── mod.rs
│               └── account.rs
└── tests/
    └── my_program.ts
```

```rust
// programs/my_program/src/lib.rs
use anchor_lang::prelude::*;

declare_id!("YourProgramIDHere111111111111111111111111111");

pub mod instructions;
pub mod state;

use instructions::*;

#[program]
pub mod my_program {
    use super::*;
    
    pub fn initialize(ctx: Context<Initialize>, amount: u64) -> Result<()> {
        instructions::initialize::handler(ctx, amount)
    }
    
    pub fn transfer(ctx: Context<Transfer>, amount: u64) -> Result<()> {
        instructions::transfer::handler(ctx, amount)
    }
}

// programs/my_program/src/instructions/mod.rs
pub mod initialize;
pub mod transfer;

pub use initialize::*;
pub use transfer::*;

// programs/my_program/src/instructions/initialize.rs
use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 32 + 8)]
    pub account: Account<'info, MyAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>, amount: u64) -> Result<()> {
    let account = &mut ctx.accounts.account;
    account.owner = ctx.accounts.user.key();
    account.balance = amount;
    Ok(())
}

// programs/my_program/src/state/mod.rs
pub mod account;
pub use account::*;

// programs/my_program/src/state/account.rs
use anchor_lang::prelude::*;

#[account]
pub struct MyAccount {
    pub owner: Pubkey,
    pub balance: u64,
}
```

### Anchor Workspace

```toml
# Anchor.toml
[workspace]
members = ["programs/*"]

[programs.localnet]
my_program = "YourProgramIDHere111111111111111111111111111"

[provider]
cluster = "localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```

## Best Practices

1. **Organize code logically into modules**:
   ```rust
   // Good structure
   mod database {
       pub mod connection;
       pub mod queries;
   }
   
   mod api {
       pub mod handlers;
       pub mod middleware;
   }
   ```

2. **Use `pub use` to create clean APIs**:
   ```rust
   // Internal organization
   mod internal {
       pub mod complex_module {
           pub fn useful_function() {}
       }
   }
   
   // Clean public API
   pub use internal::complex_module::useful_function;
   ```

3. **Keep Cargo.toml organized**:
   ```toml
   [dependencies]
   # Group related dependencies
   # Core dependencies
   serde = { version = "1.0", features = ["derive"] }
   
   # Async runtime
   tokio = { version = "1", features = ["full"] }
   
   # Solana dependencies
   solana-program = "1.17"
   anchor-lang = "0.29"
   ```

4. **Use features for optional functionality**:
   ```toml
   [features]
   default = []
   advanced = ["dep:advanced-lib"]
   ```

5. **In Solana programs, separate concerns**:
   ```rust
   // Clear separation
   mod instruction;  // Instruction definitions
   mod processor;    // Business logic
   mod state;        // Data structures
   mod error;        // Error types
   ```

6. **Use workspaces for multi-program projects**:
   ```toml
   [workspace]
   members = [
       "programs/program1",
       "programs/program2",
       "shared-lib",
   ]
   ```

## Common Mistakes

1. **Forgetting to make modules public**:
   ```rust
   // Bad: module is private
   mod my_module {
       pub fn my_function() {}
   }
   
   // Good: module is public
   pub mod my_module {
       pub fn my_function() {}
   }
   ```

2. **Not using `pub use` for convenience**:
   ```rust
   // Bad: users must know internal structure
   pub mod internal {
       pub mod nested {
           pub fn useful() {}
       }
   }
   
   // Good: provide convenient access
   pub use internal::nested::useful;
   ```

3. **Overusing glob imports**:
   ```rust
   // Bad: unclear what's in scope
   use std::collections::*;
   
   // Good: explicit imports
   use std::collections::{HashMap, HashSet};
   ```

4. **Not specifying dependency versions**:
   ```toml
   # Bad: can break with updates
   [dependencies]
   serde = "*"
   
   # Good: specify version
   [dependencies]
   serde = "1.0"
   ```

5. **Incorrect crate type for Solana programs**:
   ```toml
   # Bad: won't build for on-chain deployment
   [lib]
   crate-type = ["lib"]
   
   # Good: includes cdylib for BPF
   [lib]
   crate-type = ["cdylib", "lib"]
   ```

## Next Steps

You now understand Rust's module system and Cargo build system, essential tools for organizing and managing Rust projects. Next, you'll learn how to apply all the Rust concepts you've learned specifically to Solana program development, bridging the gap between general Rust knowledge and Solana-specific patterns.

Continue to [Lesson 07: Rust for Solana](../07-rust-for-solana/README.md) to see how everything comes together in Solana development.

## Source Attribution

Content in this lesson is based on:

- [The Rust Programming Language Book](https://doc.rust-lang.org/book/) - Chapter 7 (Managing Growing Projects with Packages, Crates, and Modules)
- [The Cargo Book](https://doc.rust-lang.org/cargo/)
- [Solana Program Library Documentation](https://docs.solana.com/developing/on-chain-programs/overview)
- [Anchor Framework Documentation](https://www.anchor-lang.com/)
- Comprehensive Rust reference materials in [rust-full-llms.txt](../../../solana-llms-resources/rust-full-llms.txt)

---

**Previous**: [Traits and Generics](../05-traits-generics/README.md)  
**Next**: [Rust for Solana](../07-rust-for-solana/README.md)  
**Module Home**: [Rust Basics](../README.md)

**Language:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
