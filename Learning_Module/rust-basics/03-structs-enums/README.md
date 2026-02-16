# Structs and Enums

## Overview

Structs and enums are Rust's primary tools for creating custom data types. They allow you to group related data together and define the possible variants of a type, making your code more organized, expressive, and type-safe. In Solana development, you'll use structs extensively to define account data structures and enums to represent different instruction types and program states.

This lesson covers how to define and use structs, create enums with different variants, use pattern matching to handle enum values, and implement methods and associated functions. These concepts are fundamental to organizing data in Solana programs, where you'll define account structures, instruction enums, and custom error types.

**Estimated Time:** 3-4 hours

## Learning Objectives

By completing this lesson, you will be able to:

- Define and instantiate structs with named fields
- Use tuple structs and unit-like structs
- Define enums with different variant types
- Use pattern matching with `match` and `if let`
- Implement methods and associated functions on structs and enums
- Understand when to use structs vs. enums
- Apply these concepts to Solana program data structures
- Model Solana instructions and account data using structs and enums

## Prerequisites

- Completion of [Lesson 02: Ownership and Borrowing](../02-ownership-borrowing/README.md)
- Understanding of ownership, references, and borrowing
- Familiarity with basic Rust syntax and functions

## Structs

A **struct** (short for structure) is a custom data type that lets you package together and name multiple related values.

### Defining and Instantiating Structs

```rust
// Define a struct
struct User {
    username: String,
    email: String,
    sign_in_count: u64,
    active: bool,
}

fn main() {
    // Create an instance
    let user1 = User {
        email: String::from("user@example.com"),
        username: String::from("someuser123"),
        active: true,
        sign_in_count: 1,
    };
    
    println!("Username: {}", user1.username);
}
```

**Key points:**
- Fields are defined with `name: type`
- Create instances with `StructName { field: value, ... }`
- Access fields with dot notation: `user1.username`

### Mutable Structs

To modify struct fields, the entire instance must be mutable:

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

**Note:** Rust doesn't allow marking individual fields as mutable—it's all or nothing.

### Field Init Shorthand

When variable names match field names, you can use shorthand:

```rust
fn build_user(email: String, username: String) -> User {
    User {
        email,    // Shorthand for email: email
        username, // Shorthand for username: username
        active: true,
        sign_in_count: 1,
    }
}
```

### Struct Update Syntax

Create a new instance using most values from another instance:

```rust
fn main() {
    let user1 = User {
        email: String::from("user1@example.com"),
        username: String::from("user1"),
        active: true,
        sign_in_count: 1,
    };
    
    // Create user2 using most of user1's values
    let user2 = User {
        email: String::from("user2@example.com"),
        ..user1 // Use remaining fields from user1
    };
    
    // Note: user1.username and user1.email are moved to user2
    // user1 can no longer be used as a whole, but user1.active and 
    // user1.sign_in_count can still be used (they implement Copy)
}
```

### Tuple Structs

Structs without named fields, useful when you want to name a tuple type:

```rust
struct Color(i32, i32, i32);
struct Point(i32, i32, i32);

fn main() {
    let black = Color(0, 0, 0);
    let origin = Point(0, 0, 0);
    
    // Access fields by index
    println!("Red: {}", black.0);
    
    // black and origin are different types even though they have the same structure
}
```

### Unit-Like Structs

Structs without any fields, useful for implementing traits:

```rust
struct AlwaysEqual;

fn main() {
    let subject = AlwaysEqual;
}
```

### Printing Structs with Debug

To print structs for debugging, derive the `Debug` trait:

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

Methods are functions defined within the context of a struct (or enum or trait object).

### Defining Methods

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    // Method with &self (immutable borrow)
    fn area(&self) -> u32 {
        self.width * self.height
    }
    
    // Method with &mut self (mutable borrow)
    fn set_width(&mut self, width: u32) {
        self.width = width;
    }
    
    // Method that takes ownership (rare)
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
    // rect is no longer valid (ownership moved)
}
```

**Method parameters:**
- `&self` - Immutable borrow (most common)
- `&mut self` - Mutable borrow
- `self` - Takes ownership (rare, used for transformations)

### Methods with Multiple Parameters

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

Functions in `impl` blocks that don't take `self` are called **associated functions**. They're often used as constructors:

```rust
impl Rectangle {
    // Associated function (constructor)
    fn square(size: u32) -> Rectangle {
        Rectangle {
            width: size,
            height: size,
        }
    }
    
    // Another constructor
    fn new(width: u32, height: u32) -> Rectangle {
        Rectangle { width, height }
    }
}

fn main() {
    let sq = Rectangle::square(20);
    let rect = Rectangle::new(10, 20);
}
```

**Note:** Call associated functions with `::` syntax: `Rectangle::square(20)`

### Multiple impl Blocks

You can have multiple `impl` blocks for the same struct:

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

This is valid but usually unnecessary. It's more common when using generics or traits.

## Enums

An **enum** (enumeration) allows you to define a type by enumerating its possible variants.

### Defining Enums

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
    // Process the IP address
}
```

### Enums with Data

Enum variants can hold data:

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

**Advantages:**
- Each variant can have different types and amounts of data
- More concise than using structs
- Type safety: can't mix up variants

### Enums with Different Variant Types

```rust
enum Message {
    Quit,                       // No data
    Move { x: i32, y: i32 },   // Named fields (like a struct)
    Write(String),              // Single value
    ChangeColor(i32, i32, i32), // Tuple
}

fn main() {
    let msg1 = Message::Quit;
    let msg2 = Message::Move { x: 10, y: 20 };
    let msg3 = Message::Write(String::from("hello"));
    let msg4 = Message::ChangeColor(255, 0, 0);
}
```

### Methods on Enums

Just like structs, enums can have methods:

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

Pattern matching is a powerful control flow construct that allows you to compare a value against a series of patterns.

### The match Expression

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

**Key points:**
- `match` must be exhaustive (cover all possible cases)
- Arms are checked in order
- The first matching pattern is executed

### Patterns That Bind to Values

```rust
#[derive(Debug)]
enum UsState {
    Alabama,
    Alaska,
    // ... etc
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

### Matching with Option<T>

The `Option<T>` enum is used extensively in Rust:

```rust
enum Option<T> {
    Some(T),
    None,
}
```

Example:

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

### The _ Placeholder

Use `_` to match any value you don't want to bind:

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
        other => move_player(other), // Bind the value
    }
    
    // Or if you don't need the value:
    match dice_roll {
        3 => add_fancy_hat(),
        7 => remove_fancy_hat(),
        _ => (), // Do nothing
    }
}

fn add_fancy_hat() {}
fn remove_fancy_hat() {}
fn move_player(num_spaces: u8) {}
```

## Concise Control Flow with if let

When you only care about one pattern, `if let` is more concise than `match`:

```rust
fn main() {
    let some_value = Some(3);
    
    // Using match
    match some_value {
        Some(3) => println!("three"),
        _ => (),
    }
    
    // Using if let (more concise)
    if let Some(3) = some_value {
        println!("three");
    }
}
```

### if let with else

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

**When to use:**
- Use `match` when you need to handle multiple patterns
- Use `if let` when you only care about one pattern

## Solana Context

Structs and enums are fundamental to Solana program development. You'll use them to define account data structures, instruction types, and program state.

### Account Data Structures

In Solana, account data is typically stored as serialized structs:

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

**Key points:**
- `BorshSerialize` and `BorshDeserialize` enable serialization
- `LEN` constant helps calculate required account space
- Methods provide safe operations on account data

### Instruction Enums

Solana programs use enums to represent different instruction types:

```rust
use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum TokenInstruction {
    /// Initialize a new token
    /// Accounts expected:
    /// 0. `[writable]` The token account to initialize
    /// 1. `[]` The mint account
    Initialize,
    
    /// Transfer tokens
    /// Accounts expected:
    /// 0. `[writable]` The source account
    /// 1. `[writable]` The destination account
    /// 2. `[signer]` The source account's owner
    Transfer {
        amount: u64,
    },
    
    /// Mint new tokens
    /// Accounts expected:
    /// 0. `[writable]` The mint account
    /// 1. `[writable]` The destination account
    /// 2. `[signer]` The mint authority
    Mint {
        amount: u64,
    },
    
    /// Burn tokens
    /// Accounts expected:
    /// 0. `[writable]` The account to burn from
    /// 1. `[writable]` The mint account
    /// 2. `[signer]` The account's owner
    Burn {
        amount: u64,
    },
}
```

### Processing Instructions with Pattern Matching

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
    // Implementation
    Ok(())
}

fn process_transfer(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    // Implementation
    Ok(())
}

fn process_mint(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    // Implementation
    Ok(())
}

fn process_burn(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    // Implementation
    Ok(())
}
```

### Anchor Framework Simplifications

Anchor provides macros that simplify struct and enum definitions:

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

**Benefits:**
- `#[account]` macro handles serialization automatically
- `#[derive(Accounts)]` validates account constraints
- Pattern matching on instruction handlers is implicit
- Type-safe account access

### State Management with Enums

Use enums to represent different states in your program:

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

1. **Use structs for grouping related data**:
   ```rust
   // Good: related data grouped together
   struct Point {
       x: f64,
       y: f64,
   }
   
   // Less clear: separate variables
   let x = 10.0;
   let y = 20.0;
   ```

2. **Use enums for types with distinct variants**:
   ```rust
   // Good: clear variants
   enum PaymentMethod {
       CreditCard { number: String, cvv: String },
       PayPal { email: String },
       Crypto { address: String },
   }
   
   // Less type-safe: using strings
   let payment_type = "credit_card";
   ```

3. **Derive common traits**:
   ```rust
   #[derive(Debug, Clone, PartialEq)]
   struct User {
       name: String,
       age: u32,
   }
   ```

4. **Use associated functions for constructors**:
   ```rust
   impl User {
       pub fn new(name: String, age: u32) -> Self {
           Self { name, age }
       }
   }
   ```

5. **Keep methods focused and small**:
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

6. **Use pattern matching exhaustively**:
   ```rust
   // Good: handles all cases
   match result {
       Ok(value) => process(value),
       Err(e) => handle_error(e),
   }
   
   // Risky: might miss cases
   if let Ok(value) = result {
       process(value);
   }
   // What about Err?
   ```

7. **In Solana programs, calculate struct sizes**:
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

## Common Mistakes

1. **Forgetting to make structs mutable**:
   ```rust
   let user = User { name: String::from("Alice"), age: 30 };
   user.age = 31; // Error: cannot assign to immutable field
   
   // Fix: make it mutable
   let mut user = User { name: String::from("Alice"), age: 30 };
   user.age = 31; // OK
   ```

2. **Non-exhaustive match expressions**:
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

3. **Using if let when match is clearer**:
   ```rust
   // Unclear: what about other cases?
   if let Some(value) = option {
       process(value);
   }
   
   // Clearer: explicit handling
   match option {
       Some(value) => process(value),
       None => handle_none(),
   }
   ```

4. **Incorrect struct size calculations in Solana**:
   ```rust
   // Wrong: doesn't account for discriminator
   pub const LEN: usize = 32 + 8;
   
   // Correct: includes 8-byte discriminator
   pub const LEN: usize = 8 + 32 + 8;
   ```

5. **Not deriving necessary traits**:
   ```rust
   struct Point {
       x: i32,
       y: i32,
   }
   
   let p1 = Point { x: 1, y: 2 };
   println!("{:?}", p1); // Error: Point doesn't implement Debug
   
   // Fix: derive Debug
   #[derive(Debug)]
   struct Point {
       x: i32,
       y: i32,
   }
   ```

6. **Mixing up :: and . syntax**:
   ```rust
   impl Rectangle {
       pub fn new(width: u32, height: u32) -> Self {
           Self { width, height }
       }
       
       pub fn area(&self) -> u32 {
           self.width * self.height
       }
   }
   
   // Wrong
   let rect = Rectangle.new(10, 20); // Error
   let area = Rectangle::area(&rect); // Awkward
   
   // Correct
   let rect = Rectangle::new(10, 20); // :: for associated functions
   let area = rect.area(); // . for methods
   ```

## Next Steps

You now understand how to create custom data types with structs and enums, and how to use pattern matching to handle different cases. Next, you'll learn about error handling in Rust, which is essential for writing robust Solana programs that can gracefully handle failures.

Continue to [Lesson 04: Error Handling](../04-error-handling/README.md) to learn how to work with Result and Option types.

## Source Attribution

Content in this lesson is based on:

- [The Rust Programming Language Book](https://doc.rust-lang.org/book/) - Chapters 5 (Using Structs to Structure Related Data), 6 (Enums and Pattern Matching), and 18 (Patterns and Matching)
- [Rust By Example](https://doc.rust-lang.org/rust-by-example/) - Structs, enums, and pattern matching sections
- [Solana Program Library Documentation](https://docs.solana.com/developing/on-chain-programs/overview)
- [Anchor Framework Documentation](https://www.anchor-lang.com/)
- [Borsh Serialization Documentation](https://borsh.io/)
- Comprehensive Rust reference materials in [rust-full-llms.txt](../../../solana-llms-resources/rust-full-llms.txt)

---

**Previous**: [Ownership and Borrowing](../02-ownership-borrowing/README.md)  
**Next**: [Error Handling](../04-error-handling/README.md)  
**Module Home**: [Rust Basics](../README.md)

**Language:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
