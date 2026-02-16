# Modul dan Cargo

## Gambaran Umum

Seiring pertumbuhan proyek Rust, mengorganisir kode menjadi penting. Sistem modul Rust memungkinkan Anda membagi kode menjadi unit logis, mengontrol visibilitas, dan mengelola namespace. Cargo, sistem build dan package manager Rust, menangani kompilasi, dependensi, testing, dan lainnya. Bersama-sama, mereka menyediakan fondasi yang robust untuk membangun dan memelihara proyek skala besar.

Dalam pengembangan Solana, memahami modul dan Cargo sangat penting. Program Solana diorganisir ke dalam modul, menggunakan Cargo untuk manajemen dependensi, dan bergantung pada fitur Cargo tertentu untuk deployment on-chain. Framework Anchor lebih lanjut memanfaatkan sistem modul Rust untuk menyediakan struktur yang bersih dan terorganisir untuk program Anda.

**Estimasi Waktu:** 2-3 jam

## Tujuan Pembelajaran

Setelah menyelesaikan pelajaran ini, Anda akan dapat:

- Mengorganisir kode menggunakan sistem modul Rust
- Mengontrol visibilitas dengan `pub` dan aturan privasi
- Menggunakan statement `use` untuk membawa item ke dalam scope
- Menyusun proyek dengan beberapa file dan direktori
- Memahami struktur proyek Cargo dan konvensinya
- Mengelola dependensi dalam Cargo.toml
- Menggunakan fitur Cargo dan workspace
- Menerapkan organisasi modul pada program Solana
- Memahami struktur modul Anchor

## Prasyarat

- Penyelesaian [Pelajaran 05: Trait dan Generic](../05-traits-generics/README_ID.md)
- Pemahaman tentang struct, enum, dan fungsi
- Keakraban dengan sintaks dasar Rust

## Sistem Modul

Sistem modul Rust membantu Anda mengorganisir kode ke dalam unit logis dan mengontrol bagian mana yang publik atau privat.

### Mendefinisikan Modul

```rust
// Definisikan modul
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

**Poin penting:**
- Modul didefinisikan dengan `mod`
- Modul dapat bersarang
- Secara default, semuanya privat

### Path Modul

Akses item dalam modul menggunakan path:

```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

pub fn eat_at_restaurant() {
    // Path absolut
    crate::front_of_house::hosting::add_to_waitlist();
    
    // Path relatif
    front_of_house::hosting::add_to_waitlist();
}
```

**Tipe path:**
- **Path absolut**: Dimulai dengan `crate` (root crate)
- **Path relatif**: Dimulai dari modul saat ini

### Aturan Privasi

```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
        
        fn private_function() {} // Privat secara default
    }
    
    mod serving { // Modul privat
        fn take_order() {}
    }
}

pub fn eat_at_restaurant() {
    front_of_house::hosting::add_to_waitlist(); // OK
    // front_of_house::hosting::private_function(); // Error: privat
    // front_of_house::serving::take_order(); // Error: modul privat
}
```

**Aturan privasi:**
- Item privat secara default
- Gunakan `pub` untuk membuat item publik
- Modul anak dapat mengakses item privat di modul parent
- Modul parent tidak dapat mengakses item privat di modul anak

### Keyword `use`

Bawa item ke dalam scope dengan `use`:

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

### Pola `use` Idiomatis

```rust
// Untuk fungsi: bawa modul parent ke dalam scope
use std::collections::HashMap;

fn main() {
    let mut map = HashMap::new();
    map.insert(1, 2);
}

// Untuk struct, enum, dll.: bawa item itu sendiri
use std::collections::HashMap;

fn main() {
    let mut map = HashMap::new();
}

// Menangani konflik nama dengan `as`
use std::fmt::Result;
use std::io::Result as IoResult;

fn function1() -> Result { /* ... */ }
fn function2() -> IoResult<()> { /* ... */ }
```

### Re-export dengan `pub use`

```rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

// Re-export hosting agar kode eksternal dapat menggunakannya
pub use crate::front_of_house::hosting;

pub fn eat_at_restaurant() {
    hosting::add_to_waitlist();
}
```

**Manfaat:**
- Menyederhanakan API eksternal
- Menyembunyikan organisasi internal
- Menyediakan path akses yang nyaman

### Menggunakan Package Eksternal

```rust
// Tambahkan ke Cargo.toml:
// [dependencies]
// rand = "0.8.5"

use rand::Rng;

fn main() {
    let secret_number = rand::thread_rng().gen_range(1..=100);
    println!("Secret number: {}", secret_number);
}
```

### Path Bersarang

```rust
// Daripada:
use std::cmp::Ordering;
use std::io;

// Gunakan path bersarang:
use std::{cmp::Ordering, io};

// Untuk item dari modul yang sama:
use std::io;
use std::io::Write;

// Dapat ditulis sebagai:
use std::io::{self, Write};
```

### Operator Glob

```rust
// Bawa semua item publik ke dalam scope
use std::collections::*;

fn main() {
    let mut map = HashMap::new();
    let mut set = HashSet::new();
}
```

**Peringatan:** Gunakan dengan hemat, karena membuat tidak jelas nama mana yang ada dalam scope.

## Memisahkan Modul ke File

Seiring pertumbuhan proyek, pisahkan modul ke file terpisah.

### Modul File Tunggal

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

### Struktur Direktori Modul

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

**Struktur file modul:**
- `mod name;` memberitahu Rust untuk memuat modul dari file lain
- Cari `src/name.rs` atau `src/name/mod.rs`
- Submodul masuk ke `src/name/submodule.rs`

## Cargo: Sistem Build Rust

Cargo adalah sistem build dan package manager Rust, menangani kompilasi, dependensi, testing, dan lainnya.

### Struktur Proyek Cargo

```
my_project/
├── Cargo.toml          # Metadata package dan dependensi
├── Cargo.lock          # Versi dependensi eksak (auto-generated)
├── src/
│   ├── main.rs         # Entry point binary crate
│   ├── lib.rs          # Entry point library crate
│   └── bin/            # Binary tambahan
│       └── another.rs
├── tests/              # Integration test
│   └── integration_test.rs
├── benches/            # Benchmark
│   └── benchmark.rs
└── examples/           # Program contoh
    └── example.rs
```

### Cargo.toml

File manifest mendefinisikan package Anda:

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

**Bagian kunci:**
- `[package]`: Metadata package
- `[dependencies]`: Dependensi runtime
- `[dev-dependencies]`: Dependensi development dan test
- `[build-dependencies]`: Dependensi build script
- `[features]`: Fitur opsional
- `[profile.*]`: Profil kompilasi

### Perintah Cargo Umum

```bash
# Buat proyek baru
cargo new my_project
cargo new --lib my_library

# Build proyek
cargo build              # Debug build
cargo build --release    # Optimized build

# Jalankan proyek
cargo run
cargo run --release

# Cek kode (lebih cepat dari build)
cargo check

# Jalankan test
cargo test
cargo test test_name     # Jalankan test tertentu
cargo test -- --nocapture # Tampilkan output println!

# Generate dokumentasi
cargo doc
cargo doc --open         # Buka di browser

# Update dependensi
cargo update

# Bersihkan build artifact
cargo clean

# Format kode
cargo fmt

# Lint kode
cargo clippy
```

### Spesifikasi Dependensi

```toml
[dependencies]
# Versi Crates.io
serde = "1.0"

# Versi spesifik
serde = "=1.0.100"

# Range versi
serde = ">=1.0, <2.0"

# Repository Git
my_lib = { git = "https://github.com/user/repo" }

# Git dengan branch/tag/commit
my_lib = { git = "https://github.com/user/repo", branch = "main" }
my_lib = { git = "https://github.com/user/repo", tag = "v1.0" }
my_lib = { git = "https://github.com/user/repo", rev = "abc123" }

# Path lokal
my_lib = { path = "../my_lib" }

# Dengan fitur
serde = { version = "1.0", features = ["derive"] }

# Dependensi opsional
optional_dep = { version = "1.0", optional = true }
```

### Fitur Cargo

Fitur memungkinkan kompilasi kondisional:

```toml
[features]
default = ["std"]
std = []
serde_support = ["dep:serde"]

[dependencies]
serde = { version = "1.0", optional = true }
```

```rust
// Gunakan fitur dalam kode
#[cfg(feature = "serde_support")]
use serde::{Serialize, Deserialize};

#[cfg_attr(feature = "serde_support", derive(Serialize, Deserialize))]
pub struct MyStruct {
    pub field: i32,
}
```

```bash
# Build dengan fitur tertentu
cargo build --features serde_support
cargo build --no-default-features
cargo build --all-features
```

### Workspace Cargo

Workspace mengelola beberapa package terkait:

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

**Manfaat:**
- Cargo.lock bersama
- Direktori target bersama
- Dependensi bersama
- Build semua package bersama

## Konteks Solana

Memahami modul dan Cargo sangat penting untuk pengembangan program Solana.

### Struktur Program Solana

```
my_solana_program/
├── Cargo.toml
├── src/
│   ├── lib.rs              # Entry point program
│   ├── instruction.rs      # Definisi instruksi
│   ├── processor.rs        # Pemrosesan instruksi
│   ├── state.rs            # Struktur state account
│   └── error.rs            # Error kustom
└── tests/
    └── integration.rs
```

### Cargo.toml Program Solana

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

**Poin penting:**
- `crate-type = ["cdylib", "lib"]`: Build sebagai dynamic library untuk deployment on-chain
- `solana-program`: Library program Solana inti
- Fitur `no-entrypoint`: Untuk testing dan penggunaan library

### Organisasi Modul Program Solana

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

### Struktur Program Anchor

Anchor menyediakan struktur yang lebih terorganisir:

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

### Workspace Anchor

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

## Best Practice

1. **Organisir kode secara logis ke dalam modul**:
   ```rust
   // Struktur baik
   mod database {
       pub mod connection;
       pub mod queries;
   }
   
   mod api {
       pub mod handlers;
       pub mod middleware;
   }
   ```

2. **Gunakan `pub use` untuk membuat API yang bersih**:
   ```rust
   // Organisasi internal
   mod internal {
       pub mod complex_module {
           pub fn useful_function() {}
       }
   }
   
   // API publik yang bersih
   pub use internal::complex_module::useful_function;
   ```

3. **Jaga Cargo.toml tetap terorganisir**:
   ```toml
   [dependencies]
   # Kelompokkan dependensi terkait
   # Dependensi inti
   serde = { version = "1.0", features = ["derive"] }
   
   # Async runtime
   tokio = { version = "1", features = ["full"] }
   
   # Dependensi Solana
   solana-program = "1.17"
   anchor-lang = "0.29"
   ```

4. **Gunakan fitur untuk fungsionalitas opsional**:
   ```toml
   [features]
   default = []
   advanced = ["dep:advanced-lib"]
   ```

5. **Dalam program Solana, pisahkan concern**:
   ```rust
   // Pemisahan yang jelas
   mod instruction;  // Definisi instruksi
   mod processor;    // Logika bisnis
   mod state;        // Struktur data
   mod error;        // Tipe error
   ```

6. **Gunakan workspace untuk proyek multi-program**:
   ```toml
   [workspace]
   members = [
       "programs/program1",
       "programs/program2",
       "shared-lib",
   ]
   ```

## Kesalahan Umum

1. **Lupa membuat modul publik**:
   ```rust
   // Buruk: modul privat
   mod my_module {
       pub fn my_function() {}
   }
   
   // Baik: modul publik
   pub mod my_module {
       pub fn my_function() {}
   }
   ```

2. **Tidak menggunakan `pub use` untuk kenyamanan**:
   ```rust
   // Buruk: pengguna harus tahu struktur internal
   pub mod internal {
       pub mod nested {
           pub fn useful() {}
       }
   }
   
   // Baik: sediakan akses yang nyaman
   pub use internal::nested::useful;
   ```

3. **Terlalu banyak menggunakan glob import**:
   ```rust
   // Buruk: tidak jelas apa yang ada dalam scope
   use std::collections::*;
   
   // Baik: import eksplisit
   use std::collections::{HashMap, HashSet};
   ```

4. **Tidak menentukan versi dependensi**:
   ```toml
   # Buruk: bisa rusak dengan update
   [dependencies]
   serde = "*"
   
   # Baik: tentukan versi
   [dependencies]
   serde = "1.0"
   ```

5. **Tipe crate salah untuk program Solana**:
   ```toml
   # Buruk: tidak akan build untuk deployment on-chain
   [lib]
   crate-type = ["lib"]
   
   # Baik: termasuk cdylib untuk BPF
   [lib]
   crate-type = ["cdylib", "lib"]
   ```

## Langkah Selanjutnya

Anda sekarang memahami sistem modul Rust dan sistem build Cargo, alat penting untuk mengorganisir dan mengelola proyek Rust. Selanjutnya, Anda akan mempelajari cara menerapkan semua konsep Rust yang telah Anda pelajari secara khusus untuk pengembangan program Solana, menjembatani kesenjangan antara pengetahuan Rust umum dan pola khusus Solana.

Lanjutkan ke [Pelajaran 07: Rust untuk Solana](../07-rust-for-solana/README_ID.md) untuk melihat bagaimana semuanya bersatu dalam pengembangan Solana.

## Atribusi Sumber

Konten dalam pelajaran ini didasarkan pada:

- [The Rust Programming Language Book](https://doc.rust-lang.org/book/) - Bab 7 (Managing Growing Projects with Packages, Crates, and Modules)
- [The Cargo Book](https://doc.rust-lang.org/cargo/)
- [Dokumentasi Solana Program Library](https://docs.solana.com/developing/on-chain-programs/overview)
- [Dokumentasi Anchor Framework](https://www.anchor-lang.com/)
- Materi referensi Rust komprehensif dalam [rust-full-llms.txt](../../../solana-llms-resources/rust-full-llms.txt)

---

**Sebelumnya**: [Trait dan Generic](../05-traits-generics/README_ID.md)  
**Selanjutnya**: [Rust untuk Solana](../07-rust-for-solana/README_ID.md)  
**Beranda Modul**: [Rust Basics](../README_ID.md)

**Bahasa:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
