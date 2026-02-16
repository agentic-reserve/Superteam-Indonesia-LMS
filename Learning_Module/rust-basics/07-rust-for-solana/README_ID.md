# Rust untuk Solana

## Gambaran Umum

Anda telah mempelajari dasar-dasar Rust—ownership, struct, enum, error handling, trait, generic, dan modul. Sekarang saatnya melihat bagaimana semua konsep ini bersatu dalam pengembangan program Solana. Pelajaran ini menjembatani pengetahuan Rust umum dengan pola-pola spesifik Solana, menunjukkan cara membaca dan menulis program Solana dengan percaya diri.

Program Solana ditulis dalam Rust dan dikompilasi ke bytecode BPF (Berkeley Packet Filter) untuk eksekusi on-chain. Memahami bagaimana konsep Rust dipetakan ke model pemrograman Solana sangat penting untuk membangun aplikasi blockchain yang aman dan efisien. Baik Anda menggunakan Solana native atau framework Anchor, fundamental Rust yang telah Anda pelajari membentuk fondasi dari semua yang akan Anda bangun.

**Estimasi Waktu:** 3-4 jam

## Tujuan Pembelajaran

Setelah menyelesaikan pelajaran ini, Anda akan dapat:

- Memahami model akun Solana dan bagaimana hubungannya dengan ownership Rust
- Membaca dan menulis entry point program Solana
- Bekerja dengan data akun menggunakan struct Rust dan serialisasi
- Menerapkan pola error handling dalam program Solana
- Menggunakan trait untuk validasi dan serialisasi akun
- Mengorganisir program Solana menggunakan modul Rust
- Memahami pola Rust framework Anchor
- Bertransisi dari dasar Rust ke pengembangan Solana
- Mengidentifikasi langkah selanjutnya dalam perjalanan belajar Solana Anda

## Prasyarat

- Penyelesaian semua pelajaran sebelumnya (01-06)
- Pemahaman tentang fundamental Rust, ownership, struct, enum, error handling, trait, generic, dan modul
- Keakraban dengan konsep blockchain dasar (direkomendasikan)

## Model Akun Solana

Arsitektur Solana secara fundamental berbeda dari Ethereum. Alih-alih smart contract dengan state internal, Solana menggunakan model akun di mana data dan kode dipisahkan.

### Akun di Solana

```rust
use solana_program::account_info::AccountInfo;

pub struct AccountInfo<'a> {
    pub key: &'a Pubkey,              // Public key akun
    pub is_signer: bool,              // Apakah akun ini signer?
    pub is_writable: bool,            // Apakah akun ini dapat dimodifikasi?
    pub lamports: Rc<RefCell<&'a mut u64>>, // Saldo akun
    pub data: Rc<RefCell<&'a mut [u8]>>,    // Data akun
    pub owner: &'a Pubkey,            // Program yang memiliki akun ini
    pub executable: bool,             // Apakah akun ini executable?
    pub rent_epoch: Epoch,            // Epoch pengumpulan rent berikutnya
}
```

**Konsep kunci:**
- **Akun** menyimpan data dan SOL (lamport)
- **Program** (smart contract) adalah akun yang ditandai sebagai executable
- **Akun data** dimiliki oleh program dan menyimpan state program
- **Ownership** menentukan program mana yang dapat memodifikasi akun

### Ownership dan Borrowing di Solana

Ingat aturan ownership Rust? Mereka sangat penting di Solana:

```rust
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    pubkey::Pubkey,
};

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    
    // Pinjam referensi akun
    let account = next_account_info(accounts_iter)?;
    
    // Pinjam data akun secara mutable
    let mut data = account.try_borrow_mut_data()?;
    
    // Modifikasi data
    data[0] = 42;
    
    // data secara otomatis di-drop di sini, melepaskan pinjaman
    Ok(())
}
```

**Ownership di Solana:**
- Akun dipinjam, bukan dimiliki, oleh program Anda
- Gunakan `try_borrow_data()` untuk akses immutable
- Gunakan `try_borrow_mut_data()` untuk akses mutable
- Pinjaman harus dilepaskan sebelum fungsi return
- Beberapa pinjaman immutable OK, tetapi hanya satu pinjaman mutable

## Entry Point Program

Setiap program Solana memiliki entry point yang memproses instruksi.

### Entry Point Solana Native

```rust
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
};

// Deklarasikan entry point
entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,        // Program ID (address)
    accounts: &[AccountInfo],   // Akun yang terlibat
    instruction_data: &[u8],    // Data instruksi
) -> ProgramResult {
    msg!("Hello from Solana!");
    Ok(())
}
```

**Signature entry point:**
- `program_id`: Alamat program Anda
- `accounts`: Slice dari referensi akun
- `instruction_data`: Byte mentah yang berisi parameter instruksi
- Mengembalikan `ProgramResult` (alias untuk `Result<(), ProgramError>`)

### Memproses Instruksi

```rust
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program_error::ProgramError,
    pubkey::Pubkey,
    msg,
};

// Definisikan enum instruksi
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum MyInstruction {
    Initialize { amount: u64 },
    Transfer { amount: u64 },
    Close,
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Deserialize instruksi
    let instruction = MyInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;
    
    // Route ke handler
    match instruction {
        MyInstruction::Initialize { amount } => {
            msg!("Instruction: Initialize");
            process_initialize(program_id, accounts, amount)
        }
        MyInstruction::Transfer { amount } => {
            msg!("Instruction: Transfer");
            process_transfer(program_id, accounts, amount)
        }
        MyInstruction::Close => {
            msg!("Instruction: Close");
            process_close(program_id, accounts)
        }
    }
}

fn process_initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    // Implementasi
    Ok(())
}

fn process_transfer(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    // Implementasi
    Ok(())
}

fn process_close(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    // Implementasi
    Ok(())
}
```

## Data Akun dan Serialisasi

Solana menggunakan Borsh untuk serialisasi data akun yang efisien.

### Mendefinisikan State Akun

```rust
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct TokenAccount {
    pub is_initialized: bool,
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub balance: u64,
}

impl TokenAccount {
    pub const LEN: usize = 1 + 32 + 32 + 8; // bool + Pubkey + Pubkey + u64
}
```

### Membaca Data Akun

```rust
use solana_program::{
    account_info::AccountInfo,
    program_error::ProgramError,
};

fn get_token_account(account: &AccountInfo) -> Result<TokenAccount, ProgramError> {
    let data = account.try_borrow_data()?;
    let account_data = TokenAccount::try_from_slice(&data)
        .map_err(|_| ProgramError::InvalidAccountData)?;
    Ok(account_data)
}
```

### Menulis Data Akun

```rust
use solana_program::{
    account_info::AccountInfo,
    program_error::ProgramError,
};

fn save_token_account(
    account: &AccountInfo,
    token_account: &TokenAccount,
) -> ProgramResult {
    let mut data = account.try_borrow_mut_data()?;
    token_account.serialize(&mut &mut data[..])?;
    Ok(())
}
```

### Contoh Lengkap: Inisialisasi Akun

```rust
fn process_initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    initial_balance: u64,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    
    let token_account = next_account_info(accounts_iter)?;
    let mint_account = next_account_info(accounts_iter)?;
    let owner_account = next_account_info(accounts_iter)?;
    
    // Validasi owner adalah signer
    if !owner_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Validasi akun dimiliki oleh program
    if token_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Periksa akun belum diinisialisasi
    let mut data = token_account.try_borrow_mut_data()?;
    if data[0] != 0 {
        return Err(ProgramError::AccountAlreadyInitialized);
    }
    
    // Buat dan simpan data akun
    let account_data = TokenAccount {
        is_initialized: true,
        owner: *owner_account.key,
        mint: *mint_account.key,
        balance: initial_balance,
    };
    
    account_data.serialize(&mut &mut data[..])?;
    
    msg!("Token account initialized");
    Ok(())
}
```

## Error Handling di Solana

Error handling yang tepat sangat penting untuk keamanan dan debugging.

### Menggunakan ProgramError

```rust
use solana_program::program_error::ProgramError;

fn validate_account(account: &AccountInfo, expected_owner: &Pubkey) -> ProgramResult {
    if account.owner != expected_owner {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    if !account.is_writable {
        return Err(ProgramError::InvalidAccountData);
    }
    
    if !account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    Ok(())
}
```

### Custom Error

```rust
use solana_program::program_error::ProgramError;
use thiserror::Error;

#[derive(Error, Debug, Copy, Clone)]
pub enum TokenError {
    #[error("Insufficient funds for transfer")]
    InsufficientFunds,
    
    #[error("Account is not initialized")]
    NotInitialized,
    
    #[error("Account is already initialized")]
    AlreadyInitialized,
    
    #[error("Invalid mint account")]
    InvalidMint,
}

impl From<TokenError> for ProgramError {
    fn from(e: TokenError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

// Penggunaan
fn transfer_tokens(from: &mut TokenAccount, to: &mut TokenAccount, amount: u64) -> ProgramResult {
    if !from.is_initialized || !to.is_initialized {
        return Err(TokenError::NotInitialized.into());
    }
    
    if from.balance < amount {
        return Err(TokenError::InsufficientFunds.into());
    }
    
    from.balance -= amount;
    to.balance += amount;
    
    Ok(())
}
```

## Trait dalam Program Solana

Trait memungkinkan penggunaan ulang kode dan abstraksi dalam program Solana.

### Trait Serialisasi Borsh

```rust
use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct MyData {
    pub value: u64,
    pub owner: Pubkey,
}

// Secara otomatis mengimplementasikan:
// - BorshSerialize::serialize()
// - BorshDeserialize::deserialize()
// - BorshDeserialize::try_from_slice()
```

### Custom Trait untuk Validasi

```rust
trait Validate {
    fn validate(&self) -> ProgramResult;
}

impl Validate for TokenAccount {
    fn validate(&self) -> ProgramResult {
        if !self.is_initialized {
            return Err(TokenError::NotInitialized.into());
        }
        
        if self.balance > 1_000_000_000 {
            return Err(ProgramError::InvalidAccountData);
        }
        
        Ok(())
    }
}

// Penggunaan
fn process_transfer(account: &TokenAccount) -> ProgramResult {
    account.validate()?;
    // Lanjutkan pemrosesan
    Ok(())
}
```

## Framework Anchor

Anchor adalah framework yang membuat pengembangan Solana lebih ergonomis dengan memanfaatkan sistem tipe Rust dan macro.

### Struktur Program Anchor

```rust
use anchor_lang::prelude::*;

declare_id!("YourProgramIDHere111111111111111111111111111");

#[program]
pub mod my_program {
    use super::*;
    
    pub fn initialize(ctx: Context<Initialize>, amount: u64) -> Result<()> {
        let account = &mut ctx.accounts.token_account;
        account.owner = ctx.accounts.owner.key();
        account.balance = amount;
        account.is_initialized = true;
        msg!("Initialized with balance: {}", amount);
        Ok(())
    }
    
    pub fn transfer(ctx: Context<Transfer>, amount: u64) -> Result<()> {
        let from = &mut ctx.accounts.from;
        let to = &mut ctx.accounts.to;
        
        require!(from.balance >= amount, ErrorCode::InsufficientFunds);
        
        from.balance -= amount;
        to.balance += amount;
        
        msg!("Transferred {} tokens", amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + TokenAccount::LEN
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Transfer<'info> {
    #[account(mut)]
    pub from: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
    
    pub authority: Signer<'info>,
}

#[account]
pub struct TokenAccount {
    pub owner: Pubkey,
    pub balance: u64,
    pub is_initialized: bool,
}

impl TokenAccount {
    pub const LEN: usize = 32 + 8 + 1;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds for transfer")]
    InsufficientFunds,
}
```

**Keuntungan Anchor:**
- `#[program]`: Mendefinisikan modul program
- `#[derive(Accounts)]`: Validasi akun otomatis
- `#[account]`: Serialisasi dan discriminator otomatis
- `#[error_code]`: Definisi error yang bersih
- `require!`: Macro validasi yang ringkas
- Akses akun yang type-safe

### Perbandingan Anchor vs Native

**Solana Native:**
```rust
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let account = next_account_info(accounts_iter)?;
    
    if account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    let mut data = account.try_borrow_mut_data()?;
    let account_data = TokenAccount::try_from_slice(&data)?;
    
    // Proses...
    
    account_data.serialize(&mut &mut data[..])?;
    Ok(())
}
```

**Anchor:**
```rust
pub fn initialize(ctx: Context<Initialize>, amount: u64) -> Result<()> {
    let account = &mut ctx.accounts.token_account;
    account.balance = amount;
    // Validasi dan serialisasi otomatis
    Ok(())
}
```

## Pola Umum Solana

### Pola 1: Validasi Akun

```rust
// Native
fn validate_accounts(
    account: &AccountInfo,
    expected_owner: &Pubkey,
    must_be_signer: bool,
    must_be_writable: bool,
) -> ProgramResult {
    if account.owner != expected_owner {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    if must_be_signer && !account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    if must_be_writable && !account.is_writable {
        return Err(ProgramError::InvalidAccountData);
    }
    
    Ok(())
}

// Anchor
#[derive(Accounts)]
pub struct MyContext<'info> {
    #[account(mut)]  // Secara otomatis memvalidasi writable
    pub my_account: Account<'info, MyAccount>,
    
    pub authority: Signer<'info>,  // Secara otomatis memvalidasi signer
}
```

### Pola 2: PDA (Program Derived Address)

```rust
// Native
use solana_program::pubkey::Pubkey;

fn find_pda(program_id: &Pubkey, user: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[b"token_account", user.as_ref()],
        program_id,
    )
}

// Anchor
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + TokenAccount::LEN,
        seeds = [b"token_account", user.key().as_ref()],
        bump
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}
```

### Pola 3: Cross-Program Invocation (CPI)

```rust
// Native
use solana_program::{
    account_info::AccountInfo,
    program::invoke,
    system_instruction,
};

fn transfer_lamports(
    from: &AccountInfo,
    to: &AccountInfo,
    amount: u64,
    system_program: &AccountInfo,
) -> ProgramResult {
    let instruction = system_instruction::transfer(
        from.key,
        to.key,
        amount,
    );
    
    invoke(
        &instruction,
        &[from.clone(), to.clone(), system_program.clone()],
    )?;
    
    Ok(())
}

// Anchor
use anchor_lang::system_program;

pub fn transfer_lamports(ctx: Context<Transfer>, amount: u64) -> Result<()> {
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.from.to_account_info(),
                to: ctx.accounts.to.to_account_info(),
            },
        ),
        amount,
    )?;
    Ok(())
}
```

## Membaca Program Solana

Saat membaca program Solana, cari elemen-elemen kunci berikut:

1. **Entry point**: Di mana eksekusi dimulai?
2. **Enum instruksi**: Operasi apa yang didukung?
3. **Struktur akun**: Data apa yang disimpan?
4. **Logika validasi**: Bagaimana akun dan input divalidasi?
5. **Transisi state**: Bagaimana data berubah?
6. **Error handling**: Apa yang bisa salah?

### Contoh: Membaca Transfer Token

```rust
pub fn process_transfer(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    // 1. Dapatkan akun
    let accounts_iter = &mut accounts.iter();
    let from_account = next_account_info(accounts_iter)?;
    let to_account = next_account_info(accounts_iter)?;
    let authority = next_account_info(accounts_iter)?;
    
    // 2. Validasi authority
    if !authority.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // 3. Muat data akun
    let mut from_data = TokenAccount::try_from_slice(&from_account.try_borrow_data()?)?;
    let mut to_data = TokenAccount::try_from_slice(&to_account.try_borrow_data()?)?;
    
    // 4. Validasi state
    if from_data.owner != *authority.key {
        return Err(ProgramError::InvalidAccountData);
    }
    
    if from_data.balance < amount {
        return Err(TokenError::InsufficientFunds.into());
    }
    
    // 5. Update state
    from_data.balance -= amount;
    to_data.balance += amount;
    
    // 6. Simpan state
    from_data.serialize(&mut &mut from_account.try_borrow_mut_data()?[..])?;
    to_data.serialize(&mut &mut to_account.try_borrow_mut_data()?[..])?;
    
    msg!("Transferred {} tokens", amount);
    Ok(())
}
```

## Best Practice

1. **Selalu validasi ownership akun**:
   ```rust
   if account.owner != program_id {
       return Err(ProgramError::IncorrectProgramId);
   }
   ```

2. **Periksa persyaratan signer**:
   ```rust
   if !authority.is_signer {
       return Err(ProgramError::MissingRequiredSignature);
   }
   ```

3. **Validasi data akun sebelum digunakan**:
   ```rust
   if !account_data.is_initialized {
       return Err(TokenError::NotInitialized.into());
   }
   ```

4. **Gunakan pesan error yang deskriptif**:
   ```rust
   #[error_code]
   pub enum ErrorCode {
       #[msg("Source account has insufficient funds for this transfer")]
       InsufficientFunds,
   }
   ```

5. **Log event penting**:
   ```rust
   msg!("Transferred {} tokens from {} to {}", amount, from.key, to.key);
   ```

6. **Tangani borrow dengan hati-hati**:
   ```rust
   {
       let data = account.try_borrow_data()?;
       // Gunakan data
   } // Borrow dilepaskan di sini
   ```

## Langkah Selanjutnya

Selamat! Anda telah menyelesaikan modul Rust Basics dan mempelajari bagaimana konsep Rust diterapkan pada pengembangan Solana. Anda sekarang siap untuk mendalami topik-topik spesifik Solana.

### Jalur Pembelajaran yang Direkomendasikan

1. **Framework Anchor**: Pelajari Anchor secara mendalam untuk pengembangan Solana yang produktif
   - Lanjutkan ke [Anchor Framework](../../basics/05-anchor-framework/README.md)

2. **Pengembangan Program Solana**: Bangun program Solana yang lengkap
   - Jelajahi [Solana Basics](../../basics/README.md)

3. **Testing**: Pelajari cara menguji program Solana
   - Pelajari pola dan framework testing

4. **Security**: Pahami kerentanan umum
   - Tinjau [Security Best Practices](../../security/README.md)

5. **Topik Lanjutan**: PDA, CPI, dan arsitektur program
   - Dalami pola Solana lanjutan

### Sumber Daya Tambahan

- [Solana Cookbook](https://solanacookbook.com/): Resep praktis untuk tugas umum
- [Anchor Book](https://book.anchor-lang.com/): Panduan Anchor yang komprehensif
- [Solana Program Examples](https://github.com/solana-labs/solana-program-library): Contoh program resmi
- [Solana Stack Exchange](https://solana.stackexchange.com/): Q&A komunitas

## Atribusi Sumber

Konten dalam pelajaran ini didasarkan pada:

- [Solana Documentation](https://docs.solana.com/)
- [Anchor Framework Documentation](https://www.anchor-lang.com/)
- [Solana Program Library](https://github.com/solana-labs/solana-program-library)
- [The Rust Programming Language Book](https://doc.rust-lang.org/book/)
- Materi referensi Rust dan Solana yang komprehensif dalam [rust-full-llms.txt](../../../solana-llms-resources/rust-full-llms.txt)

---

**Sebelumnya**: [Modul dan Cargo](../06-modules-cargo/README_ID.md)  
**Selanjutnya**: [Anchor Framework](../../basics/05-anchor-framework/README.md)  
**Beranda Modul**: [Rust Basics](../README_ID.md)

**Bahasa:** [English](README.md) | [Bahasa Indonesia](README_ID.md)

