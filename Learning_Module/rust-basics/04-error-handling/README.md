# Error Handling

## Overview

Error handling is a critical aspect of writing robust software, and Rust's approach to error handling is both explicit and type-safe. Unlike languages that use exceptions, Rust uses the `Result` and `Option` types to handle errors, making it impossible to ignore potential failures. This design philosophy is especially important in blockchain development, where unhandled errors can lead to security vulnerabilities or loss of funds.

This lesson covers Rust's error handling mechanisms, including the `Result` and `Option` types, error propagation with the `?` operator, and creating custom error types. You'll learn how these concepts apply to Solana program development, where proper error handling is essential for program security and reliability.

**Estimated Time:** 2-3 hours

## Learning Objectives

By completing this lesson, you will be able to:

- Understand and use the `Option<T>` type for handling optional values
- Work with the `Result<T, E>` type for operations that can fail
- Use the `?` operator for concise error propagation
- Create custom error types for your programs
- Apply error handling patterns in Solana programs
- Use `ProgramResult` and `ProgramError` in Solana development
- Handle errors gracefully without panicking

## Prerequisites

- Completion of [Lesson 03: Structs and Enums](../03-structs-enums/README.md)
- Understanding of enums and pattern matching
- Familiarity with ownership and borrowing concepts

## The Option Type

The `Option<T>` enum represents a value that might or might not exist. It's defined in the standard library as:

```rust
enum Option<T> {
    Some(T),
    None,
}
```

### Using Option

```rust
fn main() {
    let some_number = Some(5);
    let some_string = Some("a string");
    let absent_number: Option<i32> = None;
    
    // Pattern matching with Option
    match some_number {
        Some(value) => println!("Got a value: {}", value),
        None => println!("No value"),
    }
}
```

### Why Option Instead of Null?

Rust doesn't have null values. Instead, `Option` makes the possibility of absence explicit:

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

**Benefits:**
- Compiler forces you to handle the None case
- No null pointer exceptions
- Clear API contracts

### Working with Option Values

```rust
fn main() {
    let x: Option<i32> = Some(5);
    let y: Option<i32> = None;
    
    // unwrap: panics if None
    let value = x.unwrap(); // 5
    // let value = y.unwrap(); // Panics!
    
    // unwrap_or: provides default value
    let value = y.unwrap_or(0); // 0
    
    // unwrap_or_else: computes default value
    let value = y.unwrap_or_else(|| 42); // 42
    
    // expect: like unwrap but with custom panic message
    let value = x.expect("x should have a value"); // 5
    
    // is_some and is_none
    if x.is_some() {
        println!("x has a value");
    }
    
    if y.is_none() {
        println!("y has no value");
    }
}
```

### Option Methods

```rust
fn main() {
    let x = Some(5);
    
    // map: transform the value if present
    let y = x.map(|v| v * 2); // Some(10)
    
    // and_then: chain operations that return Option
    let z = x.and_then(|v| {
        if v > 0 {
            Some(v * 2)
        } else {
            None
        }
    }); // Some(10)
    
    // filter: keep value only if predicate is true
    let w = x.filter(|&v| v > 3); // Some(5)
    
    // or: provide alternative Option
    let none: Option<i32> = None;
    let result = none.or(Some(10)); // Some(10)
}
```

## The Result Type

The `Result<T, E>` enum is used for operations that can succeed or fail:

```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

### Using Result

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

### Handling Different Error Types

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

### Shortcuts: unwrap and expect

```rust
use std::fs::File;

fn main() {
    // unwrap: panics on error
    let file = File::open("hello.txt").unwrap();
    
    // expect: panics with custom message
    let file = File::open("hello.txt")
        .expect("Failed to open hello.txt");
}
```

**Warning:** Use `unwrap` and `expect` sparingly, mainly in prototypes or tests. In production code, handle errors explicitly.

## Error Propagation

Instead of handling errors immediately, you can propagate them to the calling function.

### Manual Error Propagation

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let file_result = File::open("username.txt");
    
    let mut file = match file_result {
        Ok(file) => file,
        Err(e) => return Err(e), // Propagate error
    };
    
    let mut username = String::new();
    
    match file.read_to_string(&mut username) {
        Ok(_) => Ok(username),
        Err(e) => Err(e), // Propagate error
    }
}
```

### The ? Operator

The `?` operator provides a concise way to propagate errors:

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let mut file = File::open("username.txt")?; // Propagates error if Err
    let mut username = String::new();
    file.read_to_string(&mut username)?; // Propagates error if Err
    Ok(username)
}
```

**How ? works:**
- If the value is `Ok(value)`, `value` is returned from the expression
- If the value is `Err(e)`, `Err(e)` is returned from the entire function

### Chaining with ?

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let mut username = String::new();
    File::open("username.txt")?.read_to_string(&mut username)?;
    Ok(username)
}

// Even more concise
fn read_username_from_file_v2() -> Result<String, io::Error> {
    std::fs::read_to_string("username.txt")
}
```

### Using ? with Option

The `?` operator also works with `Option`:

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

## Custom Error Types

For complex applications, create custom error types:

### Simple Custom Error

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

### Implementing Error Trait

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

### Error Enums

Use enums to represent different error types:

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

## Solana Context

Error handling in Solana programs is critical for security and reliability. Solana provides specific types and patterns for error handling.

### ProgramResult and ProgramError

Solana programs use `ProgramResult`, which is a type alias for `Result<(), ProgramError>`:

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

### Built-in ProgramError Variants

```rust
use solana_program::program_error::ProgramError;

fn validate_account(account: &AccountInfo) -> ProgramResult {
    // Check if account is writable
    if !account.is_writable {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Check if account is signer
    if !account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Check account owner
    if account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    Ok(())
}
```

### Custom Program Errors

Define custom errors for your Solana program:

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

### Using ? in Solana Programs

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
    
    // ? operator propagates errors
    let from_account = next_account_info(accounts_iter)?;
    let to_account = next_account_info(accounts_iter)?;
    let authority = next_account_info(accounts_iter)?;
    
    // Validate authority is signer
    if !authority.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Borrow account data
    let mut from_data = from_account.try_borrow_mut_data()?;
    let mut to_data = to_account.try_borrow_mut_data()?;
    
    msg!("Transfer {} tokens", amount);
    Ok(())
}
```

### Anchor Framework Error Handling

Anchor provides a more ergonomic way to define and use errors:

```rust
use anchor_lang::prelude::*;

declare_id!("YourProgramIDHere111111111111111111111111111");

#[program]
pub mod token_program {
    use super::*;
    
    pub fn transfer(ctx: Context<Transfer>, amount: u64) -> Result<()> {
        let from = &mut ctx.accounts.from;
        let to = &mut ctx.accounts.to;
        
        // Use require! macro for validation
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

**Benefits of Anchor error handling:**
- `#[error_code]` macro generates error implementations
- `require!` macro for concise validation
- Automatic error code assignment
- Clear error messages

## Best Practices

1. **Use Result for operations that can fail**:
   ```rust
   // Good
   fn parse_number(s: &str) -> Result<i32, ParseIntError> {
       s.parse()
   }
   
   // Avoid
   fn parse_number(s: &str) -> i32 {
       s.parse().unwrap() // Panics on error!
   }
   ```

2. **Use Option for values that might not exist**:
   ```rust
   // Good
   fn find_item(items: &[String], target: &str) -> Option<usize> {
       items.iter().position(|item| item == target)
   }
   ```

3. **Prefer ? over unwrap in production code**:
   ```rust
   // Good
   fn read_config() -> Result<Config, io::Error> {
       let contents = fs::read_to_string("config.toml")?;
       Ok(parse_config(&contents))
   }
   
   // Avoid in production
   fn read_config() -> Config {
       let contents = fs::read_to_string("config.toml").unwrap();
       parse_config(&contents)
   }
   ```

4. **Provide context with expect**:
   ```rust
   // Good: explains why unwrap should succeed
   let config = load_config()
       .expect("Config file should exist after initialization");
   ```

5. **Create custom error types for domain logic**:
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

6. **In Solana programs, validate early and return errors**:
   ```rust
   pub fn process_instruction(
       program_id: &Pubkey,
       accounts: &[AccountInfo],
       instruction_data: &[u8],
   ) -> ProgramResult {
       // Validate inputs first
       if accounts.len() < 2 {
           return Err(ProgramError::NotEnoughAccountKeys);
       }
       
       if instruction_data.is_empty() {
           return Err(ProgramError::InvalidInstructionData);
       }
       
       // Process instruction
       Ok(())
   }
   ```

7. **Use descriptive error messages**:
   ```rust
   #[error_code]
   pub enum TokenError {
       #[msg("Transfer amount must be greater than zero")]
       InvalidAmount,
       
       #[msg("Source account has insufficient funds for this transfer")]
       InsufficientFunds,
   }
   ```

## Common Mistakes

1. **Overusing unwrap**:
   ```rust
   // Bad: panics if file doesn't exist
   let contents = fs::read_to_string("file.txt").unwrap();
   
   // Good: handles error
   let contents = fs::read_to_string("file.txt")?;
   ```

2. **Ignoring Option/Result values**:
   ```rust
   // Bad: compiler warning, error ignored
   File::create("log.txt");
   
   // Good: handle the result
   File::create("log.txt")?;
   ```

3. **Not propagating errors**:
   ```rust
   // Bad: swallows error
   fn process() -> Result<(), Error> {
       match do_something() {
           Ok(v) => println!("Success: {}", v),
           Err(_) => println!("Failed"), // Error lost!
       }
       Ok(())
   }
   
   // Good: propagates error
   fn process() -> Result<(), Error> {
       let value = do_something()?;
       println!("Success: {}", value);
       Ok(())
   }
   ```

4. **Using unwrap in Solana programs**:
   ```rust
   // Bad: can cause program to panic
   let data = account.data.borrow().unwrap();
   
   // Good: returns error to runtime
   let data = account.try_borrow_data()?;
   ```

5. **Not providing error context**:
   ```rust
   // Bad: generic error
   return Err(ProgramError::Custom(1));
   
   // Good: specific error with context
   return Err(TokenError::InsufficientFunds.into());
   ```

## Next Steps

You now understand how to handle errors in Rust using `Result` and `Option` types, and how to apply these concepts in Solana programs. Next, you'll learn about traits and generics, which enable code reuse and abstraction—essential for writing flexible and maintainable Solana programs.

Continue to [Lesson 05: Traits and Generics](../05-traits-generics/README.md) to learn about Rust's powerful abstraction mechanisms.

## Source Attribution

Content in this lesson is based on:

- [The Rust Programming Language Book](https://doc.rust-lang.org/book/) - Chapter 9 (Error Handling)
- [Rust By Example](https://doc.rust-lang.org/rust-by-example/) - Error handling sections
- [Solana Program Library Documentation](https://docs.solana.com/developing/on-chain-programs/overview)
- [Anchor Framework Documentation](https://www.anchor-lang.com/)
- Comprehensive Rust reference materials in [rust-full-llms.txt](../../../solana-llms-resources/rust-full-llms.txt)

---

**Previous**: [Structs and Enums](../03-structs-enums/README.md)  
**Next**: [Traits and Generics](../05-traits-generics/README.md)  
**Module Home**: [Rust Basics](../README.md)

**Language:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
