# Penanganan Error

## Gambaran Umum

Penanganan error adalah aspek kritis dalam menulis software yang robust, dan pendekatan Rust terhadap penanganan error bersifat eksplisit dan type-safe. Tidak seperti bahasa yang menggunakan exception, Rust menggunakan tipe `Result` dan `Option` untuk menangani error, sehingga tidak mungkin mengabaikan potensi kegagalan. Filosofi desain ini sangat penting dalam pengembangan blockchain, di mana error yang tidak ditangani dapat menyebabkan kerentanan keamanan atau kehilangan dana.

Pelajaran ini mencakup mekanisme penanganan error Rust, termasuk tipe `Result` dan `Option`, propagasi error dengan operator `?`, dan pembuatan tipe error kustom. Anda akan mempelajari bagaimana konsep-konsep ini diterapkan dalam pengembangan program Solana, di mana penanganan error yang tepat sangat penting untuk keamanan dan keandalan program.

**Estimasi Waktu:** 2-3 jam

## Tujuan Pembelajaran

Setelah menyelesaikan pelajaran ini, Anda akan dapat:

- Memahami dan menggunakan tipe `Option<T>` untuk menangani nilai opsional
- Bekerja dengan tipe `Result<T, E>` untuk operasi yang dapat gagal
- Menggunakan operator `?` untuk propagasi error yang ringkas
- Membuat tipe error kustom untuk program Anda
- Menerapkan pola penanganan error dalam program Solana
- Menggunakan `ProgramResult` dan `ProgramError` dalam pengembangan Solana
- Menangani error dengan baik tanpa panic

## Prasyarat

- Penyelesaian [Pelajaran 03: Struct dan Enum](../03-structs-enums/README_ID.md)
- Pemahaman tentang enum dan pattern matching
- Keakraban dengan konsep ownership dan borrowing

## Tipe Option

Enum `Option<T>` merepresentasikan nilai yang mungkin ada atau tidak ada. Didefinisikan dalam standard library sebagai:

```rust
enum Option<T> {
    Some(T),
    None,
}
```

### Menggunakan Option

```rust
fn main() {
    let some_number = Some(5);
    let some_string = Some("a string");
    let absent_number: Option<i32> = None;
    
    // Pattern matching dengan Option
    match some_number {
        Some(value) => println!("Got a value: {}", value),
        None => println!("No value"),
    }
}
```

### Mengapa Option Daripada Null?

Rust tidak memiliki nilai null. Sebagai gantinya, `Option` membuat kemungkinan ketiadaan menjadi eksplisit:

```rust
fn find_user(id: u32) -> Option<String> {
    if id == 1 {
        Some(String::from("Alice"))
    } else {
        None
    }
}

fn main() {
    let user = find_user(1);
    
    match user {
        Some(name) => println!("Found user: {}", name),
        None => println!("User not found"),
    }
}
```

**Manfaat:**
- Compiler memaksa Anda menangani kasus None
- Tidak ada null pointer exception
- Kontrak API yang jelas

### Bekerja dengan Nilai Option

```rust
fn main() {
    let x: Option<i32> = Some(5);
    let y: Option<i32> = None;
    
    // unwrap: panic jika None
    let value = x.unwrap(); // 5
    // let value = y.unwrap(); // Panic!
    
    // unwrap_or: menyediakan nilai default
    let value = y.unwrap_or(0); // 0
    
    // unwrap_or_else: menghitung nilai default
    let value = y.unwrap_or_else(|| 42); // 42
    
    // expect: seperti unwrap tapi dengan pesan panic kustom
    let value = x.expect("x should have a value"); // 5
    
    // is_some dan is_none
    if x.is_some() {
        println!("x has a value");
    }
    
    if y.is_none() {
        println!("y has no value");
    }
}
```

### Method Option

```rust
fn main() {
    let x = Some(5);
    
    // map: transformasi nilai jika ada
    let y = x.map(|v| v * 2); // Some(10)
    
    // and_then: rantai operasi yang mengembalikan Option
    let z = x.and_then(|v| {
        if v > 0 {
            Some(v * 2)
        } else {
            None
        }
    }); // Some(10)
    
    // filter: simpan nilai hanya jika predicate true
    let w = x.filter(|&v| v > 3); // Some(5)
    
    // or: sediakan Option alternatif
    let none: Option<i32> = None;
    let result = none.or(Some(10)); // Some(10)
}
```

## Tipe Result

Enum `Result<T, E>` digunakan untuk operasi yang dapat berhasil atau gagal:

```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

### Menggunakan Result

```rust
use std::fs::File;
use std::io::ErrorKind;

fn main() {
    let file_result = File::open("hello.txt");
    
    match file_result {
        Ok(file) => println!("File opened successfully"),
        Err(error) => println!("Failed to open file: {:?}", error),
    }
}
```

### Menangani Berbagai Tipe Error

```rust
use std::fs::File;
use std::io::ErrorKind;

fn main() {
    let file_result = File::open("hello.txt");
    
    let file = match file_result {
        Ok(file) => file,
        Err(error) => match error.kind() {
            ErrorKind::NotFound => {
                println!("File not found, creating it...");
                match File::create("hello.txt") {
                    Ok(fc) => fc,
                    Err(e) => panic!("Problem creating file: {:?}", e),
                }
            }
            other_error => {
                panic!("Problem opening file: {:?}", other_error);
            }
        },
    };
}
```

### Shortcut: unwrap dan expect

```rust
use std::fs::File;

fn main() {
    // unwrap: panic pada error
    let file = File::open("hello.txt").unwrap();
    
    // expect: panic dengan pesan kustom
    let file = File::open("hello.txt")
        .expect("Failed to open hello.txt");
}
```

**Peringatan:** Gunakan `unwrap` dan `expect` dengan hemat, terutama dalam prototype atau test. Dalam kode produksi, tangani error secara eksplisit.

## Propagasi Error

Daripada menangani error segera, Anda dapat mempropagasinya ke fungsi pemanggil.

### Propagasi Error Manual

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let file_result = File::open("username.txt");
    
    let mut file = match file_result {
        Ok(file) => file,
        Err(e) => return Err(e), // Propagasi error
    };
    
    let mut username = String::new();
    
    match file.read_to_string(&mut username) {
        Ok(_) => Ok(username),
        Err(e) => Err(e), // Propagasi error
    }
}
```

### Operator ?

Operator `?` menyediakan cara ringkas untuk mempropagasi error:

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let mut file = File::open("username.txt")?; // Propagasi error jika Err
    let mut username = String::new();
    file.read_to_string(&mut username)?; // Propagasi error jika Err
    Ok(username)
}
```

**Cara kerja ?:**
- Jika nilainya `Ok(value)`, `value` dikembalikan dari ekspresi
- Jika nilainya `Err(e)`, `Err(e)` dikembalikan dari seluruh fungsi

### Chaining dengan ?

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let mut username = String::new();
    File::open("username.txt")?.read_to_string(&mut username)?;
    Ok(username)
}

// Lebih ringkas lagi
fn read_username_from_file_v2() -> Result<String, io::Error> {
    std::fs::read_to_string("username.txt")
}
```

### Menggunakan ? dengan Option

Operator `?` juga bekerja dengan `Option`:

```rust
fn last_char_of_first_line(text: &str) -> Option<char> {
    text.lines().next()?.chars().last()
}

fn main() {
    let text = "Hello\nWorld";
    match last_char_of_first_line(text) {
        Some(c) => println!("Last char: {}", c),
        None => println!("No last char"),
    }
}
```

## Tipe Error Kustom

Untuk aplikasi kompleks, buat tipe error kustom:

### Error Kustom Sederhana

```rust
#[derive(Debug)]
struct CustomError {
    message: String,
}

impl CustomError {
    fn new(msg: &str) -> CustomError {
        CustomError {
            message: msg.to_string(),
        }
    }
}

fn do_something(value: i32) -> Result<i32, CustomError> {
    if value < 0 {
        Err(CustomError::new("Value cannot be negative"))
    } else {
        Ok(value * 2)
    }
}

fn main() {
    match do_something(-5) {
        Ok(result) => println!("Result: {}", result),
        Err(e) => println!("Error: {}", e.message),
    }
}
```

### Mengimplementasikan Trait Error

```rust
use std::fmt;
use std::error::Error;

#[derive(Debug)]
struct CustomError {
    message: String,
}

impl fmt::Display for CustomError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Custom error: {}", self.message)
    }
}

impl Error for CustomError {}

fn do_something(value: i32) -> Result<i32, CustomError> {
    if value < 0 {
        Err(CustomError {
            message: "Value cannot be negative".to_string(),
        })
    } else {
        Ok(value * 2)
    }
}
```

### Enum Error

Gunakan enum untuk merepresentasikan berbagai tipe error:

```rust
#[derive(Debug)]
enum MathError {
    DivisionByZero,
    NegativeSquareRoot,
    Overflow,
}

fn divide(a: f64, b: f64) -> Result<f64, MathError> {
    if b == 0.0 {
        Err(MathError::DivisionByZero)
    } else {
        Ok(a / b)
    }
}

fn sqrt(x: f64) -> Result<f64, MathError> {
    if x < 0.0 {
        Err(MathError::NegativeSquareRoot)
    } else {
        Ok(x.sqrt())
    }
}

fn main() {
    match divide(10.0, 0.0) {
        Ok(result) => println!("Result: {}", result),
        Err(MathError::DivisionByZero) => println!("Cannot divide by zero"),
        Err(e) => println!("Math error: {:?}", e),
    }
}
```

## Konteks Solana

Penanganan error dalam program Solana sangat kritis untuk keamanan dan keandalan. Solana menyediakan tipe dan pola khusus untuk penanganan error.

### ProgramResult dan ProgramError

Program Solana menggunakan `ProgramResult`, yang merupakan type alias untuk `Result<(), ProgramError>`:

```rust
use solana_program::{
    account_info::AccountInfo,
    entrypoint::ProgramResult,
    program_error::ProgramError,
    pubkey::Pubkey,
    msg,
};

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    if accounts.is_empty() {
        return Err(ProgramError::NotEnoughAccountKeys);
    }
    
    msg!("Processing instruction");
    Ok(())
}
```

### Varian ProgramError Bawaan

```rust
use solana_program::program_error::ProgramError;

fn validate_account(account: &AccountInfo) -> ProgramResult {
    // Cek apakah account writable
    if !account.is_writable {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Cek apakah account signer
    if !account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Cek owner account
    if account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    Ok(())
}
```

### Error Program Kustom

Definisikan error kustom untuk program Solana Anda:

```rust
use solana_program::program_error::ProgramError;
use thiserror::Error;

#[derive(Error, Debug, Copy, Clone)]
pub enum TokenError {
    #[error("Insufficient funds")]
    InsufficientFunds,
    
    #[error("Invalid amount")]
    InvalidAmount,
    
    #[error("Account not initialized")]
    NotInitialized,
    
    #[error("Account already initialized")]
    AlreadyInitialized,
}

impl From<TokenError> for ProgramError {
    fn from(e: TokenError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

fn transfer_tokens(from_balance: u64, amount: u64) -> Result<u64, TokenError> {
    if amount == 0 {
        return Err(TokenError::InvalidAmount);
    }
    
    if from_balance < amount {
        return Err(TokenError::InsufficientFunds);
    }
    
    Ok(from_balance - amount)
}
```

### Menggunakan ? dalam Program Solana

```rust
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program_error::ProgramError,
    pubkey::Pubkey,
    msg,
};

pub fn process_transfer(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    
    // operator ? mempropagasi error
    let from_account = next_account_info(accounts_iter)?;
    let to_account = next_account_info(accounts_iter)?;
    let authority = next_account_info(accounts_iter)?;
    
    // Validasi authority adalah signer
    if !authority.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Borrow data account
    let mut from_data = from_account.try_borrow_mut_data()?;
    let mut to_data = to_account.try_borrow_mut_data()?;
    
    msg!("Transfer {} tokens", amount);
    Ok(())
}
```

### Penanganan Error Framework Anchor

Anchor menyediakan cara yang lebih ergonomis untuk mendefinisikan dan menggunakan error:

```rust
use anchor_lang::prelude::*;

declare_id!("YourProgramIDHere111111111111111111111111111");

#[program]
pub mod token_program {
    use super::*;
    
    pub fn transfer(ctx: Context<Transfer>, amount: u64) -> Result<()> {
        let from = &mut ctx.accounts.from;
        let to = &mut ctx.accounts.to;
        
        // Gunakan macro require! untuk validasi
        require!(amount > 0, TokenError::InvalidAmount);
        require!(from.balance >= amount, TokenError::InsufficientFunds);
        
        from.balance -= amount;
        to.balance += amount;
        
        Ok(())
    }
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
    pub balance: u64,
}

#[error_code]
pub enum TokenError {
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
    
    #[msg("Insufficient funds for transfer")]
    InsufficientFunds,
}
```

**Manfaat penanganan error Anchor:**
- Macro `#[error_code]` menghasilkan implementasi error
- Macro `require!` untuk validasi ringkas
- Assignment kode error otomatis
- Pesan error yang jelas

## Best Practice

1. **Gunakan Result untuk operasi yang dapat gagal**:
   ```rust
   // Baik
   fn parse_number(s: &str) -> Result<i32, ParseIntError> {
       s.parse()
   }
   
   // Hindari
   fn parse_number(s: &str) -> i32 {
       s.parse().unwrap() // Panic pada error!
   }
   ```

2. **Gunakan Option untuk nilai yang mungkin tidak ada**:
   ```rust
   // Baik
   fn find_item(items: &[String], target: &str) -> Option<usize> {
       items.iter().position(|item| item == target)
   }
   ```

3. **Lebih suka ? daripada unwrap dalam kode produksi**:
   ```rust
   // Baik
   fn read_config() -> Result<Config, io::Error> {
       let contents = fs::read_to_string("config.toml")?;
       Ok(parse_config(&contents))
   }
   
   // Hindari dalam produksi
   fn read_config() -> Config {
       let contents = fs::read_to_string("config.toml").unwrap();
       parse_config(&contents)
   }
   ```

4. **Berikan konteks dengan expect**:
   ```rust
   // Baik: menjelaskan mengapa unwrap seharusnya berhasil
   let config = load_config()
       .expect("Config file should exist after initialization");
   ```

5. **Buat tipe error kustom untuk logika domain**:
   ```rust
   #[derive(Debug)]
   enum ValidationError {
       TooShort,
       TooLong,
       InvalidCharacters,
   }
   
   fn validate_username(name: &str) -> Result<(), ValidationError> {
       if name.len() < 3 {
           Err(ValidationError::TooShort)
       } else if name.len() > 20 {
           Err(ValidationError::TooLong)
       } else {
           Ok(())
       }
   }
   ```

6. **Dalam program Solana, validasi lebih awal dan kembalikan error**:
   ```rust
   pub fn process_instruction(
       program_id: &Pubkey,
       accounts: &[AccountInfo],
       instruction_data: &[u8],
   ) -> ProgramResult {
       // Validasi input terlebih dahulu
       if accounts.len() < 2 {
           return Err(ProgramError::NotEnoughAccountKeys);
       }
       
       if instruction_data.is_empty() {
           return Err(ProgramError::InvalidInstructionData);
       }
       
       // Proses instruksi
       Ok(())
   }
   ```

7. **Gunakan pesan error yang deskriptif**:
   ```rust
   #[error_code]
   pub enum TokenError {
       #[msg("Transfer amount must be greater than zero")]
       InvalidAmount,
       
       #[msg("Source account has insufficient funds for this transfer")]
       InsufficientFunds,
   }
   ```

## Kesalahan Umum

1. **Terlalu banyak menggunakan unwrap**:
   ```rust
   // Buruk: panic jika file tidak ada
   let contents = fs::read_to_string("file.txt").unwrap();
   
   // Baik: tangani error
   let contents = fs::read_to_string("file.txt")?;
   ```

2. **Mengabaikan nilai Option/Result**:
   ```rust
   // Buruk: compiler warning, error diabaikan
   File::create("log.txt");
   
   // Baik: tangani result
   File::create("log.txt")?;
   ```

3. **Tidak mempropagasi error**:
   ```rust
   // Buruk: menelan error
   fn process() -> Result<(), Error> {
       match do_something() {
           Ok(v) => println!("Success: {}", v),
           Err(_) => println!("Failed"), // Error hilang!
       }
       Ok(())
   }
   
   // Baik: propagasi error
   fn process() -> Result<(), Error> {
       let value = do_something()?;
       println!("Success: {}", value);
       Ok(())
   }
   ```

4. **Menggunakan unwrap dalam program Solana**:
   ```rust
   // Buruk: dapat menyebabkan program panic
   let data = account.data.borrow().unwrap();
   
   // Baik: mengembalikan error ke runtime
   let data = account.try_borrow_data()?;
   ```

5. **Tidak memberikan konteks error**:
   ```rust
   // Buruk: error generik
   return Err(ProgramError::Custom(1));
   
   // Baik: error spesifik dengan konteks
   return Err(TokenError::InsufficientFunds.into());
   ```

## Langkah Selanjutnya

Anda sekarang memahami cara menangani error dalam Rust menggunakan tipe `Result` dan `Option`, dan bagaimana menerapkan konsep-konsep ini dalam program Solana. Selanjutnya, Anda akan mempelajari tentang trait dan generic, yang memungkinkan penggunaan ulang kode dan abstraksi—penting untuk menulis program Solana yang fleksibel dan mudah dipelihara.

Lanjutkan ke [Pelajaran 05: Trait dan Generic](../05-traits-generics/README_ID.md) untuk mempelajari mekanisme abstraksi Rust yang powerful.

## Atribusi Sumber

Konten dalam pelajaran ini didasarkan pada:

- [The Rust Programming Language Book](https://doc.rust-lang.org/book/) - Bab 9 (Error Handling)
- [Rust By Example](https://doc.rust-lang.org/rust-by-example/) - Bagian error handling
- [Dokumentasi Solana Program Library](https://docs.solana.com/developing/on-chain-programs/overview)
- [Dokumentasi Anchor Framework](https://www.anchor-lang.com/)
- Materi referensi Rust komprehensif dalam [rust-full-llms.txt](../../../solana-llms-resources/rust-full-llms.txt)

---

**Sebelumnya**: [Struct dan Enum](../03-structs-enums/README_ID.md)  
**Selanjutnya**: [Trait dan Generic](../05-traits-generics/README_ID.md)  
**Beranda Modul**: [Rust Basics](../README_ID.md)

**Bahasa:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
