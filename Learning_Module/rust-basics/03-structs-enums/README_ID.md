# Structs dan Enums

## Gambaran Umum

Structs dan enums adalah alat utama Rust untuk membuat tipe data kustom. Mereka memungkinkan Anda mengelompokkan data terkait bersama-sama dan mendefinisikan varian yang mungkin dari suatu tipe, membuat kode Anda lebih terorganisir, ekspresif, dan type-safe. Dalam pengembangan Solana, Anda akan menggunakan structs secara ekstensif untuk mendefinisikan struktur data akun dan enums untuk merepresentasikan berbagai tipe instruksi dan state program.

Pelajaran ini mencakup cara mendefinisikan dan menggunakan structs, membuat enums dengan berbagai varian, menggunakan pattern matching untuk menangani nilai enum, dan mengimplementasikan methods dan associated functions. Konsep-konsep ini fundamental untuk mengorganisasi data dalam program Solana, di mana Anda akan mendefinisikan struktur akun, enum instruksi, dan tipe error kustom.

**Estimasi Waktu:** 3-4 jam

## Tujuan Pembelajaran

Setelah menyelesaikan pelajaran ini, Anda akan dapat:

- Mendefinisikan dan membuat instance structs dengan named fields
- Menggunakan tuple structs dan unit-like structs
- Mendefinisikan enums dengan berbagai tipe varian
- Menggunakan pattern matching dengan `match` dan `if let`
- Mengimplementasikan methods dan associated functions pada structs dan enums
- Memahami kapan menggunakan structs vs. enums
- Menerapkan konsep-konsep ini pada struktur data program Solana
- Memodelkan instruksi dan data akun Solana menggunakan structs dan enums

## Prasyarat

- Menyelesaikan [Pelajaran 02: Ownership dan Borrowing](../02-ownership-borrowing/README_ID.md)
- Memahami ownership, references, dan borrowing
- Familiar dengan sintaks dan fungsi dasar Rust

## Structs

Sebuah **struct** (singkatan dari structure) adalah tipe data kustom yang memungkinkan Anda mengemas bersama dan memberi nama beberapa nilai terkait.

### Mendefinisikan dan Membuat Instance Structs

```rust
// Definisikan struct
struct User {
    username: String,
    email: String,
    sign_in_count: u64,
    active: bool,
}

fn main() {
    // Buat instance
    let user1 = User {
        email: String::from("user@example.com"),
        username: String::from("someuser123"),
        active: true,
        sign_in_count: 1,
    };
    
    println!("Username: {}", user1.username);
}
```

**Poin kunci:**
- Fields didefinisikan dengan `name: type`
- Buat instance dengan `StructName { field: value, ... }`
- Akses fields dengan notasi titik: `user1.username`

### Mutable Structs

Untuk memodifikasi field struct, seluruh instance harus mutable:

```rust
fn main() {
    let mut user1 = User {
        email: String::from("user@example.com"),
        username: String::from("someuser123"),
        active: true,
        sign_in_count: 1,
    };
    
    user1.email = String::from("newemail@example.com");
    user1.sign_in_count += 1;
}
```

**Catatan:** Rust tidak mengizinkan menandai field individual sebagai mutable—semuanya atau tidak sama sekali.

### Field Init Shorthand

Ketika nama variabel cocok dengan nama field, Anda dapat menggunakan shorthand:

```rust
fn build_user(email: String, username: String) -> User {
    User {
        email,    // Shorthand untuk email: email
        username, // Shorthand untuk username: username
        active: true,
        sign_in_count: 1,
    }
}
```

### Struct Update Syntax

Buat instance baru menggunakan sebagian besar nilai dari instance lain:

```rust
fn main() {
    let user1 = User {
        email: String::from("user1@example.com"),
        username: String::from("user1"),
        active: true,
        sign_in_count: 1,
    };
    
    // Buat user2 menggunakan sebagian besar nilai user1
    let user2 = User {
        email: String::from("user2@example.com"),
        ..user1 // Gunakan field yang tersisa dari user1
    };
    
    // Catatan: user1.username dan user1.email dipindahkan ke user2
    // user1 tidak dapat lagi digunakan secara keseluruhan, tetapi user1.active dan 
    // user1.sign_in_count masih dapat digunakan (mereka mengimplementasikan Copy)
}
```

### Tuple Structs

Structs tanpa named fields, berguna ketika Anda ingin memberi nama tipe tuple:

```rust
struct Color(i32, i32, i32);
struct Point(i32, i32, i32);

fn main() {
    let black = Color(0, 0, 0);
    let origin = Point(0, 0, 0);
    
    // Akses fields berdasarkan indeks
    println!("Red: {}", black.0);
    
    // black dan origin adalah tipe yang berbeda meskipun memiliki struktur yang sama
}
```

### Unit-Like Structs

Structs tanpa field apa pun, berguna untuk mengimplementasikan traits:

```rust
struct AlwaysEqual;

fn main() {
    let subject = AlwaysEqual;
}
```

### Mencetak Structs dengan Debug

Untuk mencetak structs untuk debugging, derive trait `Debug`:

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect = Rectangle {
        width: 30,
        height: 50,
    };
    
    println!("rect is {:?}", rect);
    // Output: rect is Rectangle { width: 30, height: 50 }
    
    println!("rect is {:#?}", rect);
    // Output (pretty-printed):
    // rect is Rectangle {
    //     width: 30,
    //     height: 50,
    // }
}
```

## Methods

Methods adalah fungsi yang didefinisikan dalam konteks struct (atau enum atau trait object).

### Mendefinisikan Methods

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    // Method dengan &self (immutable borrow)
    fn area(&self) -> u32 {
        self.width * self.height
    }
    
    // Method dengan &mut self (mutable borrow)
    fn set_width(&mut self, width: u32) {
        self.width = width;
    }
    
    // Method yang mengambil ownership (jarang)
    fn into_square(self) -> Rectangle {
        let size = self.width.max(self.height);
        Rectangle {
            width: size,
            height: size,
        }
    }
}

fn main() {
    let rect = Rectangle {
        width: 30,
        height: 50,
    };
    
    println!("Area: {}", rect.area());
    
    let mut rect2 = Rectangle {
        width: 10,
        height: 20,
    };
    rect2.set_width(15);
    
    let square = rect.into_square();
    println!("Square: {:?}", square);
    // rect tidak lagi valid (ownership dipindahkan)
}
```

**Parameter method:**
- `&self` - Immutable borrow (paling umum)
- `&mut self` - Mutable borrow
- `self` - Mengambil ownership (jarang, digunakan untuk transformasi)

### Methods dengan Beberapa Parameter

```rust
impl Rectangle {
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };
    let rect2 = Rectangle {
        width: 10,
        height: 40,
    };
    
    println!("Can rect1 hold rect2? {}", rect1.can_hold(&rect2));
}
```

### Associated Functions

Fungsi dalam blok `impl` yang tidak mengambil `self` disebut **associated functions**. Mereka sering digunakan sebagai constructor:

```rust
impl Rectangle {
    // Associated function (constructor)
    fn square(size: u32) -> Rectangle {
        Rectangle {
            width: size,
            height: size,
        }
    }
    
    // Constructor lainnya
    fn new(width: u32, height: u32) -> Rectangle {
        Rectangle { width, height }
    }
}

fn main() {
    let sq = Rectangle::square(20);
    let rect = Rectangle::new(10, 20);
}
```

**Catatan:** Panggil associated functions dengan sintaks `::`: `Rectangle::square(20)`

### Beberapa Blok impl

Anda dapat memiliki beberapa blok `impl` untuk struct yang sama:

```rust
impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}

impl Rectangle {
    fn perimeter(&self) -> u32 {
        2 * (self.width + self.height)
    }
}
```

Ini valid tetapi biasanya tidak diperlukan. Lebih umum ketika menggunakan generics atau traits.

## Enums

Sebuah **enum** (enumeration) memungkinkan Anda mendefinisikan tipe dengan menghitung varian-varian yang mungkin.

### Mendefinisikan Enums

```rust
enum IpAddrKind {
    V4,
    V6,
}

fn main() {
    let four = IpAddrKind::V4;
    let six = IpAddrKind::V6;
    
    route(four);
    route(six);
}

fn route(ip_kind: IpAddrKind) {
    // Proses alamat IP
}
```

### Enums dengan Data

Varian enum dapat menyimpan data:

```rust
enum IpAddr {
    V4(u8, u8, u8, u8),
    V6(String),
}

fn main() {
    let home = IpAddr::V4(127, 0, 0, 1);
    let loopback = IpAddr::V6(String::from("::1"));
}
```

**Keuntungan:**
- Setiap varian dapat memiliki tipe dan jumlah data yang berbeda
- Lebih ringkas daripada menggunakan structs
- Type safety: tidak dapat mencampur varian

### Enums dengan Berbagai Tipe Varian

```rust
enum Message {
    Quit,                       // Tanpa data
    Move { x: i32, y: i32 },   // Named fields (seperti struct)
    Write(String),              // Nilai tunggal
    ChangeColor(i32, i32, i32), // Tuple
}

fn main() {
    let msg1 = Message::Quit;
    let msg2 = Message::Move { x: 10, y: 20 };
    let msg3 = Message::Write(String::from("hello"));
    let msg4 = Message::ChangeColor(255, 0, 0);
}
```

### Methods pada Enums

Sama seperti structs, enums dapat memiliki methods:

```rust
impl Message {
    fn call(&self) {
        match self {
            Message::Quit => println!("Quit"),
            Message::Move { x, y } => println!("Move to ({}, {})", x, y),
            Message::Write(text) => println!("Write: {}", text),
            Message::ChangeColor(r, g, b) => println!("Color: ({}, {}, {})", r, g, b),
        }
    }
}

fn main() {
    let msg = Message::Write(String::from("hello"));
    msg.call();
}
```

## Pattern Matching

Pattern matching adalah konstruksi control flow yang powerful yang memungkinkan Anda membandingkan nilai dengan serangkaian pattern.

### Ekspresi match

```rust
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter,
}

fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter => 25,
    }
}
```

**Poin kunci:**
- `match` harus exhaustive (mencakup semua kasus yang mungkin)
- Arms diperiksa secara berurutan
- Pattern yang cocok pertama kali dieksekusi

### Patterns yang Bind ke Nilai

```rust
#[derive(Debug)]
enum UsState {
    Alabama,
    Alaska,
    // ... dll
}

enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter(UsState),
}

fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter(state) => {
            println!("State quarter from {:?}!", state);
            25
        }
    }
}

fn main() {
    let coin = Coin::Quarter(UsState::Alaska);
    println!("Value: {}", value_in_cents(coin));
}
```

### Matching dengan Option<T>

Enum `Option<T>` digunakan secara ekstensif dalam Rust:

```rust
enum Option<T> {
    Some(T),
    None,
}
```

Contoh:

```rust
fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        None => None,
        Some(i) => Some(i + 1),
    }
}

fn main() {
    let five = Some(5);
    let six = plus_one(five);
    let none = plus_one(None);
    
    println!("six: {:?}", six);   // Some(6)
    println!("none: {:?}", none); // None
}
```

### Placeholder _

Gunakan `_` untuk mencocokkan nilai apa pun yang tidak ingin Anda bind:

```rust
fn main() {
    let some_value = 7;
    
    match some_value {
        1 => println!("one"),
        3 => println!("three"),
        5 => println!("five"),
        7 => println!("seven"),
        _ => println!("something else"),
    }
}
```

### Catch-all Patterns

```rust
fn main() {
    let dice_roll = 9;
    
    match dice_roll {
        3 => add_fancy_hat(),
        7 => remove_fancy_hat(),
        other => move_player(other), // Bind nilai
    }
    
    // Atau jika Anda tidak memerlukan nilai:
    match dice_roll {
        3 => add_fancy_hat(),
        7 => remove_fancy_hat(),
        _ => (), // Tidak melakukan apa-apa
    }
}

fn add_fancy_hat() {}
fn remove_fancy_hat() {}
fn move_player(num_spaces: u8) {}
```

## Control Flow Ringkas dengan if let

Ketika Anda hanya peduli dengan satu pattern, `if let` lebih ringkas daripada `match`:

```rust
fn main() {
    let some_value = Some(3);
    
    // Menggunakan match
    match some_value {
        Some(3) => println!("three"),
        _ => (),
    }
    
    // Menggunakan if let (lebih ringkas)
    if let Some(3) = some_value {
        println!("three");
    }
}
```

### if let dengan else

```rust
fn main() {
    let coin = Coin::Quarter(UsState::Alaska);
    
    let mut count = 0;
    if let Coin::Quarter(state) = coin {
        println!("State quarter from {:?}!", state);
    } else {
        count += 1;
    }
}
```

**Kapan menggunakan:**
- Gunakan `match` ketika Anda perlu menangani beberapa pattern
- Gunakan `if let` ketika Anda hanya peduli dengan satu pattern


## Konteks Solana

Structs dan enums adalah fundamental untuk pengembangan program Solana. Anda akan menggunakannya untuk mendefinisikan struktur data akun, tipe instruksi, dan state program.

### Struktur Data Akun

Dalam Solana, data akun biasanya disimpan sebagai structs yang di-serialize:

```rust
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct UserAccount {
    pub owner: Pubkey,
    pub balance: u64,
    pub last_updated: i64,
    pub is_active: bool,
}

impl UserAccount {
    pub const LEN: usize = 32 + 8 + 8 + 1; // Pubkey + u64 + i64 + bool
    
    pub fn new(owner: Pubkey) -> Self {
        Self {
            owner,
            balance: 0,
            last_updated: 0,
            is_active: true,
        }
    }
    
    pub fn deposit(&mut self, amount: u64) {
        self.balance += amount;
    }
    
    pub fn withdraw(&mut self, amount: u64) -> Result<(), &'static str> {
        if self.balance >= amount {
            self.balance -= amount;
            Ok(())
        } else {
            Err("Insufficient balance")
        }
    }
}
```

**Poin kunci:**
- `BorshSerialize` dan `BorshDeserialize` memungkinkan serialisasi
- Konstanta `LEN` membantu menghitung space akun yang diperlukan
- Methods menyediakan operasi yang aman pada data akun

### Enum Instruksi

Program Solana menggunakan enums untuk merepresentasikan berbagai tipe instruksi:

```rust
use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum TokenInstruction {
    /// Inisialisasi token baru
    /// Akun yang diharapkan:
    /// 0. `[writable]` Akun token untuk diinisialisasi
    /// 1. `[]` Akun mint
    Initialize,
    
    /// Transfer token
    /// Akun yang diharapkan:
    /// 0. `[writable]` Akun sumber
    /// 1. `[writable]` Akun tujuan
    /// 2. `[signer]` Owner akun sumber
    Transfer {
        amount: u64,
    },
    
    /// Mint token baru
    /// Akun yang diharapkan:
    /// 0. `[writable]` Akun mint
    /// 1. `[writable]` Akun tujuan
    /// 2. `[signer]` Mint authority
    Mint {
        amount: u64,
    },
    
    /// Burn token
    /// Akun yang diharapkan:
    /// 0. `[writable]` Akun untuk burn
    /// 1. `[writable]` Akun mint
    /// 2. `[signer]` Owner akun
    Burn {
        amount: u64,
    },
}
```

### Memproses Instruksi dengan Pattern Matching

```rust
use solana_program::{
    account_info::AccountInfo,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
};

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = TokenInstruction::try_from_slice(instruction_data)?;
    
    match instruction {
        TokenInstruction::Initialize => {
            msg!("Instruction: Initialize");
            process_initialize(program_id, accounts)
        }
        TokenInstruction::Transfer { amount } => {
            msg!("Instruction: Transfer {} tokens", amount);
            process_transfer(program_id, accounts, amount)
        }
        TokenInstruction::Mint { amount } => {
            msg!("Instruction: Mint {} tokens", amount);
            process_mint(program_id, accounts, amount)
        }
        TokenInstruction::Burn { amount } => {
            msg!("Instruction: Burn {} tokens", amount);
            process_burn(program_id, accounts, amount)
        }
    }
}

fn process_initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
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

fn process_mint(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    // Implementasi
    Ok(())
}

fn process_burn(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    // Implementasi
    Ok(())
}
```

### Penyederhanaan Anchor Framework

Anchor menyediakan macro yang menyederhanakan definisi struct dan enum:

```rust
use anchor_lang::prelude::*;

declare_id!("YourProgramIDHere111111111111111111111111111");

#[program]
pub mod token_program {
    use super::*;
    
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let token_account = &mut ctx.accounts.token_account;
        token_account.owner = ctx.accounts.owner.key();
        token_account.balance = 0;
        Ok(())
    }
    
    pub fn transfer(ctx: Context<Transfer>, amount: u64) -> Result<()> {
        let from = &mut ctx.accounts.from;
        let to = &mut ctx.accounts.to;
        
        require!(from.balance >= amount, ErrorCode::InsufficientFunds);
        
        from.balance -= amount;
        to.balance += amount;
        
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
}

impl TokenAccount {
    pub const LEN: usize = 32 + 8;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds for transfer")]
    InsufficientFunds,
}
```

**Manfaat:**
- Macro `#[account]` menangani serialisasi secara otomatis
- `#[derive(Accounts)]` memvalidasi constraint akun
- Pattern matching pada instruction handlers bersifat implisit
- Akses akun yang type-safe

### Manajemen State dengan Enums

Gunakan enums untuk merepresentasikan berbagai state dalam program Anda:

```rust
use anchor_lang::prelude::*;

#[account]
pub struct Escrow {
    pub state: EscrowState,
    pub amount: u64,
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub created_at: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum EscrowState {
    Pending,
    Completed,
    Cancelled,
    Disputed,
}

impl Escrow {
    pub fn can_complete(&self) -> bool {
        matches!(self.state, EscrowState::Pending)
    }
    
    pub fn can_cancel(&self) -> bool {
        matches!(self.state, EscrowState::Pending | EscrowState::Disputed)
    }
}
```

## Best Practices

1. **Gunakan structs untuk mengelompokkan data terkait**:
   ```rust
   // Baik: data terkait dikelompokkan bersama
   struct Point {
       x: f64,
       y: f64,
   }
   
   // Kurang jelas: variabel terpisah
   let x = 10.0;
   let y = 20.0;
   ```

2. **Gunakan enums untuk tipe dengan varian yang berbeda**:
   ```rust
   // Baik: varian yang jelas
   enum PaymentMethod {
       CreditCard { number: String, cvv: String },
       PayPal { email: String },
       Crypto { address: String },
   }
   
   // Kurang type-safe: menggunakan string
   let payment_type = "credit_card";
   ```

3. **Derive trait umum**:
   ```rust
   #[derive(Debug, Clone, PartialEq)]
   struct User {
       name: String,
       age: u32,
   }
   ```

4. **Gunakan associated functions untuk constructor**:
   ```rust
   impl User {
       pub fn new(name: String, age: u32) -> Self {
           Self { name, age }
       }
   }
   ```

5. **Jaga methods tetap fokus dan kecil**:
   ```rust
   impl Rectangle {
       pub fn area(&self) -> u32 {
           self.width * self.height
       }
       
       pub fn perimeter(&self) -> u32 {
           2 * (self.width + self.height)
       }
   }
   ```

6. **Gunakan pattern matching secara exhaustive**:
   ```rust
   // Baik: menangani semua kasus
   match result {
       Ok(value) => process(value),
       Err(e) => handle_error(e),
   }
   
   // Berisiko: mungkin melewatkan kasus
   if let Ok(value) = result {
       process(value);
   }
   // Bagaimana dengan Err?
   ```

7. **Dalam program Solana, hitung ukuran struct**:
   ```rust
   #[account]
   pub struct MyAccount {
       pub data: u64,
       pub owner: Pubkey,
   }
   
   impl MyAccount {
       pub const LEN: usize = 8 + 32; // u64 + Pubkey
   }
   ```

## Kesalahan Umum

1. **Lupa membuat structs mutable**:
   ```rust
   let user = User { name: String::from("Alice"), age: 30 };
   user.age = 31; // Error: cannot assign to immutable field
   
   // Perbaikan: buat mutable
   let mut user = User { name: String::from("Alice"), age: 30 };
   user.age = 31; // OK
   ```

2. **Ekspresi match yang tidak exhaustive**:
   ```rust
   enum Status {
       Active,
       Inactive,
       Pending,
   }
   
   fn check_status(status: Status) {
       match status {
           Status::Active => println!("Active"),
           Status::Inactive => println!("Inactive"),
           // Error: missing Pending case
       }
   }
   ```

3. **Menggunakan if let ketika match lebih jelas**:
   ```rust
   // Tidak jelas: bagaimana dengan kasus lain?
   if let Some(value) = option {
       process(value);
   }
   
   // Lebih jelas: penanganan eksplisit
   match option {
       Some(value) => process(value),
       None => handle_none(),
   }
   ```

4. **Perhitungan ukuran struct yang salah di Solana**:
   ```rust
   // Salah: tidak memperhitungkan discriminator
   pub const LEN: usize = 32 + 8;
   
   // Benar: termasuk discriminator 8-byte
   pub const LEN: usize = 8 + 32 + 8;
   ```

5. **Tidak men-derive trait yang diperlukan**:
   ```rust
   struct Point {
       x: i32,
       y: i32,
   }
   
   let p1 = Point { x: 1, y: 2 };
   println!("{:?}", p1); // Error: Point doesn't implement Debug
   
   // Perbaikan: derive Debug
   #[derive(Debug)]
   struct Point {
       x: i32,
       y: i32,
   }
   ```

6. **Mencampur sintaks :: dan .**:
   ```rust
   impl Rectangle {
       pub fn new(width: u32, height: u32) -> Self {
           Self { width, height }
       }
       
       pub fn area(&self) -> u32 {
           self.width * self.height
       }
   }
   
   // Salah
   let rect = Rectangle.new(10, 20); // Error
   let area = Rectangle::area(&rect); // Canggung
   
   // Benar
   let rect = Rectangle::new(10, 20); // :: untuk associated functions
   let area = rect.area(); // . untuk methods
   ```

## Langkah Selanjutnya

Anda sekarang memahami cara membuat tipe data kustom dengan structs dan enums, dan cara menggunakan pattern matching untuk menangani berbagai kasus. Selanjutnya, Anda akan belajar tentang error handling di Rust, yang penting untuk menulis program Solana yang robust yang dapat menangani kegagalan dengan baik.

Lanjutkan ke [Pelajaran 04: Error Handling](../04-error-handling/README_ID.md) untuk belajar cara bekerja dengan tipe Result dan Option.

## Atribusi Sumber

Konten dalam pelajaran ini didasarkan pada:

- [The Rust Programming Language Book](https://doc.rust-lang.org/book/) - Bab 5 (Using Structs to Structure Related Data), 6 (Enums and Pattern Matching), dan 18 (Patterns and Matching)
- [Rust By Example](https://doc.rust-lang.org/rust-by-example/) - Bagian structs, enums, dan pattern matching
- [Solana Program Library Documentation](https://docs.solana.com/developing/on-chain-programs/overview)
- [Anchor Framework Documentation](https://www.anchor-lang.com/)
- [Borsh Serialization Documentation](https://borsh.io/)
- Materi referensi Rust komprehensif dalam [rust-full-llms.txt](../../../solana-llms-resources/rust-full-llms.txt)

---

**Sebelumnya**: [Ownership dan Borrowing](../02-ownership-borrowing/README_ID.md)  
**Selanjutnya**: [Error Handling](../04-error-handling/README_ID.md)  
**Beranda Modul**: [Rust Basics](../README_ID.md)

**Bahasa:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
