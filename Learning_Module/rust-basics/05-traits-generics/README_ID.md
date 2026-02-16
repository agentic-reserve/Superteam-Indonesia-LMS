# Trait dan Generic

## Gambaran Umum

Trait dan generic adalah mekanisme abstraksi Rust yang powerful yang memungkinkan penggunaan ulang kode, polimorfisme, dan type safety. Trait mendefinisikan perilaku bersama di berbagai tipe, mirip dengan interface dalam bahasa lain, sementara generic memungkinkan Anda menulis kode fleksibel yang bekerja dengan berbagai tipe. Bersama-sama, mereka membentuk fondasi abstraksi zero-cost Rust—Anda mendapatkan fleksibilitas pemrograman tingkat tinggi tanpa mengorbankan performa.

Dalam pengembangan Solana, trait dan generic ada di mana-mana. Anda akan menggunakan trait seperti `Borsh` untuk serialisasi, mengimplementasikan trait kustom untuk tipe account Anda, dan bekerja dengan fungsi generic di seluruh framework Anchor. Memahami konsep-konsep ini sangat penting untuk menulis program Solana yang idiomatis dan dapat digunakan kembali.

**Estimasi Waktu:** 3-4 jam

## Tujuan Pembelajaran

Setelah menyelesaikan pelajaran ini, Anda akan dapat:

- Mendefinisikan dan mengimplementasikan trait untuk tipe kustom
- Menggunakan trait bound untuk membatasi tipe generic
- Menulis fungsi, struct, dan enum generic
- Memahami trait object dan dynamic dispatch
- Menggunakan trait standard library umum (Clone, Copy, Debug, dll.)
- Menerapkan trait dan generic dalam program Solana
- Mengimplementasikan trait serialisasi seperti Borsh
- Bekerja dengan sistem account berbasis trait Anchor

## Prasyarat

- Penyelesaian [Pelajaran 04: Penanganan Error](../04-error-handling/README_ID.md)
- Pemahaman tentang struct dan enum
- Keakraban dengan ownership dan borrowing
- Pengetahuan tentang tipe Result dan Option

## Trait

**Trait** mendefinisikan fungsionalitas yang harus disediakan oleh suatu tipe. Mirip dengan interface dalam bahasa lain tetapi lebih powerful.

### Mendefinisikan Trait

```rust
// Definisikan trait
trait Summary {
    fn summarize(&self) -> String;
}

// Struct yang akan mengimplementasikan trait
struct Article {
    title: String,
    author: String,
    content: String,
}

// Implementasikan trait untuk struct
impl Summary for Article {
    fn summarize(&self) -> String {
        format!("{} by {}", self.title, self.author)
    }
}

fn main() {
    let article = Article {
        title: String::from("Rust Traits"),
        author: String::from("Alice"),
        content: String::from("Traits are awesome..."),
    };
    
    println!("{}", article.summarize());
    // Output: Rust Traits by Alice
}
```

### Implementasi Default

Trait dapat menyediakan implementasi method default:

```rust
trait Summary {
    fn summarize_author(&self) -> String;
    
    // Implementasi default
    fn summarize(&self) -> String {
        format!("(Read more from {}...)", self.summarize_author())
    }
}

struct Tweet {
    username: String,
    content: String,
}

impl Summary for Tweet {
    fn summarize_author(&self) -> String {
        format!("@{}", self.username)
    }
    
    // Menggunakan implementasi summarize default
}

fn main() {
    let tweet = Tweet {
        username: String::from("rustacean"),
        content: String::from("Rust is great!"),
    };
    
    println!("{}", tweet.summarize());
    // Output: (Read more from @rustacean...)
}
```

### Trait sebagai Parameter

Gunakan trait untuk menerima tipe apa pun yang mengimplementasikan trait tertentu:

```rust
// Terima tipe apa pun yang mengimplementasikan Summary
fn notify(item: &impl Summary) {
    println!("Breaking news! {}", item.summarize());
}

// Sintaks trait bound yang setara
fn notify<T: Summary>(item: &T) {
    println!("Breaking news! {}", item.summarize());
}

fn main() {
    let article = Article {
        title: String::from("Breaking News"),
        author: String::from("Bob"),
        content: String::from("Something happened..."),
    };
    
    notify(&article);
}
```

### Multiple Trait Bound

Memerlukan tipe untuk mengimplementasikan beberapa trait:

```rust
use std::fmt::Display;

// Memerlukan Summary dan Display
fn notify(item: &(impl Summary + Display)) {
    println!("{}", item);
}

// Sintaks trait bound
fn notify<T: Summary + Display>(item: &T) {
    println!("{}", item);
}

// Klausa where untuk bound kompleks
fn some_function<T, U>(t: &T, u: &U) -> i32
where
    T: Display + Clone,
    U: Clone + Debug,
{
    // Function body
    0
}
```

### Mengembalikan Tipe yang Mengimplementasikan Trait

```rust
fn returns_summarizable() -> impl Summary {
    Tweet {
        username: String::from("rustacean"),
        content: String::from("Rust is awesome!"),
    }
}
```

**Keterbatasan:** Anda hanya dapat mengembalikan satu tipe konkret, bukan tipe yang berbeda:

```rust
// Ini tidak akan compile!
fn returns_summarizable(switch: bool) -> impl Summary {
    if switch {
        Article { /* ... */ }  // Error: tipe berbeda
    } else {
        Tweet { /* ... */ }
    }
}
```

### Trait Standard Library Umum

#### Clone dan Copy

```rust
#[derive(Clone)]
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p1 = Point { x: 5, y: 10 };
    let p2 = p1.clone(); // Clone eksplisit
    
    println!("p1: ({}, {})", p1.x, p1.y);
    println!("p2: ({}, {})", p2.x, p2.y);
}

// Copy untuk tipe sederhana (data stack-only)
#[derive(Copy, Clone)]
struct SimplePoint {
    x: i32,
    y: i32,
}

fn main() {
    let p1 = SimplePoint { x: 5, y: 10 };
    let p2 = p1; // Copy implisit
    
    println!("p1: ({}, {})", p1.x, p1.y); // p1 masih valid
    println!("p2: ({}, {})", p2.x, p2.y);
}
```

#### Debug dan Display

```rust
use std::fmt;

#[derive(Debug)]
struct Point {
    x: i32,
    y: i32,
}

impl fmt::Display for Point {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "({}, {})", self.x, self.y)
    }
}

fn main() {
    let p = Point { x: 5, y: 10 };
    
    println!("{:?}", p);  // Debug: Point { x: 5, y: 10 }
    println!("{}", p);    // Display: (5, 10)
}
```

#### PartialEq dan Eq

```rust
#[derive(PartialEq, Eq)]
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p1 = Point { x: 5, y: 10 };
    let p2 = Point { x: 5, y: 10 };
    let p3 = Point { x: 3, y: 7 };
    
    println!("p1 == p2: {}", p1 == p2); // true
    println!("p1 == p3: {}", p1 == p3); // false
}
```

## Generic

**Generic** memungkinkan Anda menulis kode yang bekerja dengan berbagai tipe sambil mempertahankan type safety.

### Fungsi Generic

```rust
// Fungsi generic yang bekerja dengan tipe apa pun
fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];
    
    for item in list {
        if item > largest {
            largest = item;
        }
    }
    
    largest
}

fn main() {
    let numbers = vec![34, 50, 25, 100, 65];
    let result = largest(&numbers);
    println!("Largest number: {}", result);
    
    let chars = vec!['y', 'm', 'a', 'q'];
    let result = largest(&chars);
    println!("Largest char: {}", result);
}
```

### Struct Generic

```rust
struct Point<T> {
    x: T,
    y: T,
}

fn main() {
    let integer_point = Point { x: 5, y: 10 };
    let float_point = Point { x: 1.0, y: 4.0 };
}

// Beberapa parameter tipe generic
struct Point<T, U> {
    x: T,
    y: U,
}

fn main() {
    let mixed_point = Point { x: 5, y: 4.0 };
}
```

### Enum Generic

```rust
// Option adalah enum generic
enum Option<T> {
    Some(T),
    None,
}

// Result adalah enum generic
enum Result<T, E> {
    Ok(T),
    Err(E),
}

// Enum generic kustom
enum Either<L, R> {
    Left(L),
    Right(R),
}

fn main() {
    let left: Either<i32, String> = Either::Left(42);
    let right: Either<i32, String> = Either::Right(String::from("hello"));
}
```

### Method Generic

```rust
struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn x(&self) -> &T {
        &self.x
    }
}

// Method hanya untuk tipe tertentu
impl Point<f32> {
    fn distance_from_origin(&self) -> f32 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}

fn main() {
    let p = Point { x: 5, y: 10 };
    println!("p.x = {}", p.x());
    
    let p = Point { x: 3.0, y: 4.0 };
    println!("Distance: {}", p.distance_from_origin());
}
```

### Method Generic dengan Parameter Tipe Berbeda

```rust
struct Point<T, U> {
    x: T,
    y: U,
}

impl<T, U> Point<T, U> {
    fn mixup<V, W>(self, other: Point<V, W>) -> Point<T, W> {
        Point {
            x: self.x,
            y: other.y,
        }
    }
}

fn main() {
    let p1 = Point { x: 5, y: 10.4 };
    let p2 = Point { x: "Hello", y: 'c' };
    
    let p3 = p1.mixup(p2);
    println!("p3.x = {}, p3.y = {}", p3.x, p3.y);
    // Output: p3.x = 5, p3.y = c
}
```

## Trait Bound

Trait bound menentukan bahwa tipe generic harus mengimplementasikan trait tertentu.

### Trait Bound Dasar

```rust
use std::fmt::Display;

fn print_it<T: Display>(item: T) {
    println!("{}", item);
}

fn main() {
    print_it(42);
    print_it("Hello");
    print_it(3.14);
}
```

### Multiple Trait Bound

```rust
use std::fmt::{Display, Debug};

fn compare_display<T: Display + PartialOrd>(t1: &T, t2: &T) {
    if t1 > t2 {
        println!("{} is greater", t1);
    } else {
        println!("{} is not greater", t1);
    }
}
```

### Klausa Where

Untuk trait bound kompleks, gunakan klausa `where` untuk keterbacaan yang lebih baik:

```rust
fn some_function<T, U>(t: &T, u: &U) -> i32
where
    T: Display + Clone,
    U: Clone + Debug,
{
    println!("{}", t);
    0
}
```

### Blanket Implementation

Implementasikan trait untuk tipe apa pun yang memenuhi trait bound:

```rust
trait MyTrait {
    fn do_something(&self);
}

// Implementasikan MyTrait untuk tipe apa pun yang mengimplementasikan Display
impl<T: Display> MyTrait for T {
    fn do_something(&self) {
        println!("Doing something with: {}", self);
    }
}

fn main() {
    42.do_something();
    "hello".do_something();
}
```

## Trait Object dan Dynamic Dispatch

Terkadang Anda perlu bekerja dengan tipe berbeda yang mengimplementasikan trait yang sama pada runtime.

### Trait Object

```rust
trait Draw {
    fn draw(&self);
}

struct Circle {
    radius: f64,
}

struct Rectangle {
    width: f64,
    height: f64,
}

impl Draw for Circle {
    fn draw(&self) {
        println!("Drawing circle with radius {}", self.radius);
    }
}

impl Draw for Rectangle {
    fn draw(&self) {
        println!("Drawing rectangle {}x{}", self.width, self.height);
    }
}

// Vector dari trait object
fn main() {
    let shapes: Vec<Box<dyn Draw>> = vec![
        Box::new(Circle { radius: 5.0 }),
        Box::new(Rectangle { width: 10.0, height: 20.0 }),
    ];
    
    for shape in shapes {
        shape.draw();
    }
}
```

**Poin penting:**
- `dyn Draw` adalah trait object
- Trait object menggunakan dynamic dispatch (polimorfisme runtime)
- Biaya performa sedikit dibandingkan static dispatch
- Memungkinkan koleksi heterogen

## Konteks Solana

Trait dan generic adalah fundamental untuk pengembangan program Solana, terutama saat menggunakan framework Anchor.

### Trait Serialisasi Borsh

Solana menggunakan Borsh untuk serialisasi yang efisien:

```rust
use borsh::{BorshSerialize, BorshDeserialize};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct TokenAccount {
    pub owner: Pubkey,
    pub balance: u64,
    pub mint: Pubkey,
}

fn main() {
    let account = TokenAccount {
        owner: Pubkey::new_unique(),
        balance: 1000,
        mint: Pubkey::new_unique(),
    };
    
    // Serialisasi ke bytes
    let bytes = account.try_to_vec().unwrap();
    
    // Deserialisasi dari bytes
    let deserialized = TokenAccount::try_from_slice(&bytes).unwrap();
    println!("{:?}", deserialized);
}
```

### Trait Account Anchor

Anchor menggunakan trait untuk mendefinisikan tipe account:

```rust
use anchor_lang::prelude::*;

declare_id!("YourProgramIDHere111111111111111111111111111");

#[program]
pub mod my_program {
    use super::*;
    
    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        let account = &mut ctx.accounts.my_account;
        account.data = data;
        account.authority = ctx.accounts.user.key();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 8 + 32
    )]
    pub my_account: Account<'info, MyAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

// Tipe account dengan serialisasi Borsh otomatis
#[account]
pub struct MyAccount {
    pub data: u64,
    pub authority: Pubkey,
}
```

**Trait Account Anchor menyediakan:**
- Serialisasi/deserialisasi otomatis
- Discriminator untuk identifikasi tipe account
- Validasi owner
- Kalkulasi size

### Handler Instruksi Generic

```rust
use anchor_lang::prelude::*;

// Fungsi generic untuk validasi
fn validate_authority<'info, T>(
    account: &Account<'info, T>,
    authority: &Signer<'info>,
) -> Result<()>
where
    T: AccountSerialize + AccountDeserialize + Owner + Clone,
{
    // Logika validasi
    Ok(())
}

#[program]
pub mod my_program {
    use super::*;
    
    pub fn update_data(ctx: Context<UpdateData>, new_data: u64) -> Result<()> {
        validate_authority(&ctx.accounts.my_account, &ctx.accounts.authority)?;
        
        let account = &mut ctx.accounts.my_account;
        account.data = new_data;
        Ok(())
    }
}
```

### Trait Kustom untuk Program Solana

```rust
use anchor_lang::prelude::*;

// Trait kustom untuk account yang dapat ditransfer
trait Transferable {
    fn transfer(&mut self, to: Pubkey, amount: u64) -> Result<()>;
    fn balance(&self) -> u64;
}

#[account]
pub struct TokenAccount {
    pub owner: Pubkey,
    pub balance: u64,
}

impl Transferable for TokenAccount {
    fn transfer(&mut self, to: Pubkey, amount: u64) -> Result<()> {
        require!(self.balance >= amount, ErrorCode::InsufficientFunds);
        self.balance -= amount;
        Ok(())
    }
    
    fn balance(&self) -> u64 {
        self.balance
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds for transfer")]
    InsufficientFunds,
}
```

### Bekerja dengan Tipe Account Generic

```rust
use anchor_lang::prelude::*;

// Fungsi generic yang bekerja dengan tipe account apa pun
fn log_account_info<'info, T>(account: &Account<'info, T>)
where
    T: AccountSerialize + AccountDeserialize + Owner,
{
    msg!("Account key: {}", account.key());
    msg!("Account owner: {}", account.owner);
}

#[program]
pub mod my_program {
    use super::*;
    
    pub fn process(ctx: Context<Process>) -> Result<()> {
        log_account_info(&ctx.accounts.my_account);
        Ok(())
    }
}
```

## Best Practice

1. **Gunakan trait bound untuk membuat kode generic lebih spesifik**:
   ```rust
   // Baik: persyaratan jelas
   fn process<T: BorshSerialize + BorshDeserialize>(data: T) -> Result<Vec<u8>> {
       data.try_to_vec()
   }
   ```

2. **Lebih suka static dispatch daripada dynamic dispatch untuk performa**:
   ```rust
   // Static dispatch (lebih cepat)
   fn process<T: Summary>(item: &T) {
       println!("{}", item.summarize());
   }
   
   // Dynamic dispatch (lebih fleksibel, overhead sedikit)
   fn process(item: &dyn Summary) {
       println!("{}", item.summarize());
   }
   ```

3. **Gunakan derive macro untuk trait umum**:
   ```rust
   #[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
   pub struct MyData {
       pub value: u64,
   }
   ```

4. **Jaga definisi trait tetap fokus dan kohesif**:
   ```rust
   // Baik: tanggung jawab tunggal
   trait Serializable {
       fn serialize(&self) -> Vec<u8>;
   }
   
   trait Validatable {
       fn validate(&self) -> Result<()>;
   }
   ```

5. **Gunakan klausa where untuk trait bound kompleks**:
   ```rust
   fn complex_function<T, U>(t: T, u: U) -> Result<()>
   where
       T: BorshSerialize + Clone + Debug,
       U: BorshDeserialize + PartialEq,
   {
       // Implementasi
       Ok(())
   }
   ```

6. **Dalam program Solana, manfaatkan sistem trait Anchor**:
   ```rust
   #[account]
   pub struct MyAccount {
       pub data: u64,
   }
   // Secara otomatis mengimplementasikan trait yang diperlukan
   ```

## Kesalahan Umum

1. **Lupa trait bound pada tipe generic**:
   ```rust
   // Error: tidak bisa membandingkan T tanpa PartialOrd
   fn largest<T>(list: &[T]) -> &T {
       let mut largest = &list[0];
       for item in list {
           if item > largest { // Error!
               largest = item;
           }
       }
       largest
   }
   
   // Diperbaiki: tambahkan trait bound
   fn largest<T: PartialOrd>(list: &[T]) -> &T {
       // Sekarang bekerja
   }
   ```

2. **Mencoba mengembalikan tipe berbeda dari impl Trait**:
   ```rust
   // Error: tidak bisa mengembalikan tipe berbeda
   fn get_summary(use_article: bool) -> impl Summary {
       if use_article {
           Article { /* ... */ } // Error!
       } else {
           Tweet { /* ... */ }
       }
   }
   
   // Gunakan trait object sebagai gantinya
   fn get_summary(use_article: bool) -> Box<dyn Summary> {
       if use_article {
           Box::new(Article { /* ... */ })
       } else {
           Box::new(Tweet { /* ... */ })
       }
   }
   ```

3. **Tidak mengimplementasikan trait yang diperlukan untuk account Solana**:
   ```rust
   // Buruk: trait serialisasi hilang
   pub struct MyAccount {
       pub data: u64,
   }
   
   // Baik: gunakan #[account] atau derive trait
   #[account]
   pub struct MyAccount {
       pub data: u64,
   }
   ```

4. **Terlalu banyak menggunakan trait object ketika generic bisa bekerja**:
   ```rust
   // Kurang efisien: dynamic dispatch
   fn process_items(items: Vec<Box<dyn Summary>>) {
       for item in items {
           println!("{}", item.summarize());
       }
   }
   
   // Lebih efisien: static dispatch
   fn process_items<T: Summary>(items: Vec<T>) {
       for item in items {
           println!("{}", item.summarize());
       }
   }
   ```

## Langkah Selanjutnya

Anda sekarang memahami trait dan generic, mekanisme abstraksi Rust yang powerful. Konsep-konsep ini sangat penting untuk menulis kode yang fleksibel dan dapat digunakan kembali dalam program Solana. Selanjutnya, Anda akan mempelajari tentang sistem modul Rust dan Cargo, yang membantu Anda mengorganisir proyek yang lebih besar dan mengelola dependensi.

Lanjutkan ke [Pelajaran 06: Modul dan Cargo](../06-modules-cargo/README_ID.md) untuk mempelajari organisasi proyek dan sistem build Rust.

## Atribusi Sumber

Konten dalam pelajaran ini didasarkan pada:

- [The Rust Programming Language Book](https://doc.rust-lang.org/book/) - Bab 10 (Generic Types, Traits, and Lifetimes)
- [Rust By Example](https://doc.rust-lang.org/rust-by-example/) - Bagian Generics dan Traits
- [Dokumentasi Anchor Framework](https://www.anchor-lang.com/) - Sistem Account dan trait
- [Spesifikasi Borsh](https://borsh.io/)
- Materi referensi Rust komprehensif dalam [rust-full-llms.txt](../../../solana-llms-resources/rust-full-llms.txt)

---

**Sebelumnya**: [Penanganan Error](../04-error-handling/README_ID.md)  
**Selanjutnya**: [Modul dan Cargo](../06-modules-cargo/README_ID.md)  
**Beranda Modul**: [Rust Basics](../README_ID.md)

**Bahasa:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
