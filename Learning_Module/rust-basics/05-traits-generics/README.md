# Traits and Generics

## Overview

Traits and generics are Rust's powerful abstraction mechanisms that enable code reuse, polymorphism, and type safety. Traits define shared behavior across different types, similar to interfaces in other languages, while generics allow you to write flexible code that works with multiple types. Together, they form the foundation of Rust's zero-cost abstractions—you get the flexibility of high-level programming without sacrificing performance.

In Solana development, traits and generics are everywhere. You'll use traits like `Borsh` for serialization, implement custom traits for your account types, and work with generic functions throughout the Anchor framework. Understanding these concepts is essential for writing idiomatic, reusable Solana programs.

**Estimated Time:** 3-4 hours

## Learning Objectives

By completing this lesson, you will be able to:

- Define and implement traits for custom types
- Use trait bounds to constrain generic types
- Write generic functions, structs, and enums
- Understand trait objects and dynamic dispatch
- Use common standard library traits (Clone, Copy, Debug, etc.)
- Apply traits and generics in Solana programs
- Implement serialization traits like Borsh
- Work with Anchor's trait-based account system

## Prerequisites

- Completion of [Lesson 04: Error Handling](../04-error-handling/README.md)
- Understanding of structs and enums
- Familiarity with ownership and borrowing
- Knowledge of Result and Option types

## Traits

A **trait** defines functionality that a type must provide. It's similar to interfaces in other languages but more powerful.

### Defining a Trait

```rust
// Define a trait
trait Summary {
    fn summarize(&self) -> String;
}

// A struct that will implement the trait
struct Article {
    title: String,
    author: String,
    content: String,
}

// Implement the trait for the struct
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

### Default Implementations

Traits can provide default method implementations:

```rust
trait Summary {
    fn summarize_author(&self) -> String;
    
    // Default implementation
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
    
    // Uses default summarize implementation
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

### Traits as Parameters

Use traits to accept any type that implements a specific trait:

```rust
// Accept any type that implements Summary
fn notify(item: &impl Summary) {
    println!("Breaking news! {}", item.summarize());
}

// Equivalent trait bound syntax
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

### Multiple Trait Bounds

Require a type to implement multiple traits:

```rust
use std::fmt::Display;

// Require both Summary and Display
fn notify(item: &(impl Summary + Display)) {
    println!("{}", item);
}

// Trait bound syntax
fn notify<T: Summary + Display>(item: &T) {
    println!("{}", item);
}

// Where clause for complex bounds
fn some_function<T, U>(t: &T, u: &U) -> i32
where
    T: Display + Clone,
    U: Clone + Debug,
{
    // Function body
    0
}
```

### Returning Types that Implement Traits

```rust
fn returns_summarizable() -> impl Summary {
    Tweet {
        username: String::from("rustacean"),
        content: String::from("Rust is awesome!"),
    }
}
```

**Limitation:** You can only return a single concrete type, not different types:

```rust
// This won't compile!
fn returns_summarizable(switch: bool) -> impl Summary {
    if switch {
        Article { /* ... */ }  // Error: different types
    } else {
        Tweet { /* ... */ }
    }
}
```

### Common Standard Library Traits

#### Clone and Copy

```rust
#[derive(Clone)]
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p1 = Point { x: 5, y: 10 };
    let p2 = p1.clone(); // Explicit clone
    
    println!("p1: ({}, {})", p1.x, p1.y);
    println!("p2: ({}, {})", p2.x, p2.y);
}

// Copy for simple types (stack-only data)
#[derive(Copy, Clone)]
struct SimplePoint {
    x: i32,
    y: i32,
}

fn main() {
    let p1 = SimplePoint { x: 5, y: 10 };
    let p2 = p1; // Implicit copy
    
    println!("p1: ({}, {})", p1.x, p1.y); // p1 still valid
    println!("p2: ({}, {})", p2.x, p2.y);
}
```

#### Debug and Display

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

#### PartialEq and Eq

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

## Generics

**Generics** allow you to write code that works with multiple types while maintaining type safety.

### Generic Functions

```rust
// Generic function that works with any type
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

### Generic Structs

```rust
struct Point<T> {
    x: T,
    y: T,
}

fn main() {
    let integer_point = Point { x: 5, y: 10 };
    let float_point = Point { x: 1.0, y: 4.0 };
}

// Multiple generic type parameters
struct Point<T, U> {
    x: T,
    y: U,
}

fn main() {
    let mixed_point = Point { x: 5, y: 4.0 };
}
```

### Generic Enums

```rust
// Option is a generic enum
enum Option<T> {
    Some(T),
    None,
}

// Result is a generic enum
enum Result<T, E> {
    Ok(T),
    Err(E),
}

// Custom generic enum
enum Either<L, R> {
    Left(L),
    Right(R),
}

fn main() {
    let left: Either<i32, String> = Either::Left(42);
    let right: Either<i32, String> = Either::Right(String::from("hello"));
}
```

### Generic Methods

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

// Method only for specific type
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

### Generic Methods with Different Type Parameters

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

## Trait Bounds

Trait bounds specify that a generic type must implement certain traits.

### Basic Trait Bounds

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

### Multiple Trait Bounds

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

### Where Clauses

For complex trait bounds, use `where` clauses for better readability:

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

### Blanket Implementations

Implement a trait for any type that satisfies trait bounds:

```rust
trait MyTrait {
    fn do_something(&self);
}

// Implement MyTrait for any type that implements Display
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

## Trait Objects and Dynamic Dispatch

Sometimes you need to work with different types that implement the same trait at runtime.

### Trait Objects

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

// Vector of trait objects
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

**Key points:**
- `dyn Draw` is a trait object
- Trait objects use dynamic dispatch (runtime polymorphism)
- Slight performance cost compared to static dispatch
- Allows heterogeneous collections

## Solana Context

Traits and generics are fundamental to Solana program development, especially when using the Anchor framework.

### Borsh Serialization Trait

Solana uses Borsh for efficient serialization:

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
    
    // Serialize to bytes
    let bytes = account.try_to_vec().unwrap();
    
    // Deserialize from bytes
    let deserialized = TokenAccount::try_from_slice(&bytes).unwrap();
    println!("{:?}", deserialized);
}
```

### Anchor Account Trait

Anchor uses traits to define account types:

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

// Account type with automatic Borsh serialization
#[account]
pub struct MyAccount {
    pub data: u64,
    pub authority: Pubkey,
}
```

**Anchor's Account trait provides:**
- Automatic serialization/deserialization
- Discriminator for account type identification
- Owner validation
- Size calculation

### Generic Instruction Handlers

```rust
use anchor_lang::prelude::*;

// Generic function for validation
fn validate_authority<'info, T>(
    account: &Account<'info, T>,
    authority: &Signer<'info>,
) -> Result<()>
where
    T: AccountSerialize + AccountDeserialize + Owner + Clone,
{
    // Validation logic
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

### Custom Traits for Solana Programs

```rust
use anchor_lang::prelude::*;

// Custom trait for accounts that can be transferred
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

### Working with Generic Account Types

```rust
use anchor_lang::prelude::*;

// Generic function that works with any account type
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

## Best Practices

1. **Use trait bounds to make generic code more specific**:
   ```rust
   // Good: clear requirements
   fn process<T: BorshSerialize + BorshDeserialize>(data: T) -> Result<Vec<u8>> {
       data.try_to_vec()
   }
   ```

2. **Prefer static dispatch over dynamic dispatch for performance**:
   ```rust
   // Static dispatch (faster)
   fn process<T: Summary>(item: &T) {
       println!("{}", item.summarize());
   }
   
   // Dynamic dispatch (more flexible, slight overhead)
   fn process(item: &dyn Summary) {
       println!("{}", item.summarize());
   }
   ```

3. **Use derive macros for common traits**:
   ```rust
   #[derive(Debug, Clone, PartialEq, BorshSerialize, BorshDeserialize)]
   pub struct MyData {
       pub value: u64,
   }
   ```

4. **Keep trait definitions focused and cohesive**:
   ```rust
   // Good: single responsibility
   trait Serializable {
       fn serialize(&self) -> Vec<u8>;
   }
   
   trait Validatable {
       fn validate(&self) -> Result<()>;
   }
   ```

5. **Use where clauses for complex trait bounds**:
   ```rust
   fn complex_function<T, U>(t: T, u: U) -> Result<()>
   where
       T: BorshSerialize + Clone + Debug,
       U: BorshDeserialize + PartialEq,
   {
       // Implementation
       Ok(())
   }
   ```

6. **In Solana programs, leverage Anchor's trait system**:
   ```rust
   #[account]
   pub struct MyAccount {
       pub data: u64,
   }
   // Automatically implements necessary traits
   ```

## Common Mistakes

1. **Forgetting trait bounds on generic types**:
   ```rust
   // Error: can't compare T without PartialOrd
   fn largest<T>(list: &[T]) -> &T {
       let mut largest = &list[0];
       for item in list {
           if item > largest { // Error!
               largest = item;
           }
       }
       largest
   }
   
   // Fixed: add trait bound
   fn largest<T: PartialOrd>(list: &[T]) -> &T {
       // Now works
   }
   ```

2. **Trying to return different types from impl Trait**:
   ```rust
   // Error: can't return different types
   fn get_summary(use_article: bool) -> impl Summary {
       if use_article {
           Article { /* ... */ } // Error!
       } else {
           Tweet { /* ... */ }
       }
   }
   
   // Use trait objects instead
   fn get_summary(use_article: bool) -> Box<dyn Summary> {
       if use_article {
           Box::new(Article { /* ... */ })
       } else {
           Box::new(Tweet { /* ... */ })
       }
   }
   ```

3. **Not implementing required traits for Solana accounts**:
   ```rust
   // Bad: missing serialization traits
   pub struct MyAccount {
       pub data: u64,
   }
   
   // Good: use #[account] or derive traits
   #[account]
   pub struct MyAccount {
       pub data: u64,
   }
   ```

4. **Overusing trait objects when generics would work**:
   ```rust
   // Less efficient: dynamic dispatch
   fn process_items(items: Vec<Box<dyn Summary>>) {
       for item in items {
           println!("{}", item.summarize());
       }
   }
   
   // More efficient: static dispatch
   fn process_items<T: Summary>(items: Vec<T>) {
       for item in items {
           println!("{}", item.summarize());
       }
   }
   ```

## Next Steps

You now understand traits and generics, Rust's powerful abstraction mechanisms. These concepts are essential for writing flexible, reusable code in Solana programs. Next, you'll learn about Rust's module system and Cargo, which help you organize larger projects and manage dependencies.

Continue to [Lesson 06: Modules and Cargo](../06-modules-cargo/README.md) to learn about project organization and the Rust build system.

## Source Attribution

Content in this lesson is based on:

- [The Rust Programming Language Book](https://doc.rust-lang.org/book/) - Chapter 10 (Generic Types, Traits, and Lifetimes)
- [Rust By Example](https://doc.rust-lang.org/rust-by-example/) - Generics and Traits sections
- [Anchor Framework Documentation](https://www.anchor-lang.com/) - Account and trait system
- [Borsh Specification](https://borsh.io/)
- Comprehensive Rust reference materials in [rust-full-llms.txt](../../../solana-llms-resources/rust-full-llms.txt)

---

**Previous**: [Error Handling](../04-error-handling/README.md)  
**Next**: [Modules and Cargo](../06-modules-cargo/README.md)  
**Module Home**: [Rust Basics](../README.md)

**Language:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
