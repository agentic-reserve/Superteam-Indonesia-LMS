# Rust Fundamentals

## Overview

Welcome to your first lesson in Rust! This lesson covers the foundational building blocks of the Rust programming language: variables, data types, functions, and control flow. These concepts form the basis for everything you'll build in Rust, including Solana programs.

Rust is a systems programming language that emphasizes safety, speed, and concurrency. Unlike languages with garbage collectors, Rust ensures memory safety at compile time through its unique ownership system (which we'll explore in the next lesson). For now, we'll focus on the basics that will feel familiar if you've programmed in other languages, while highlighting Rust's distinctive features.

**Estimated Time:** 2-3 hours

## Learning Objectives

By completing this lesson, you will be able to:

- Declare and use variables with proper mutability
- Work with Rust's primitive data types (integers, floats, booleans, characters)
- Understand string types and their differences
- Define and call functions with parameters and return values
- Use control flow structures (if, loop, while, for)
- Recognize basic Solana program structure and entry points

## Prerequisites

- Basic programming knowledge in any language
- Rust development environment set up (see [Rust and Anchor Setup Guide](../../setup/rust-anchor.md))
- Familiarity with command-line interfaces

## Variables and Mutability

### Declaring Variables

In Rust, variables are declared using the `let` keyword. By default, variables are **immutable**, meaning their values cannot be changed after assignment:

```rust
fn main() {
    let x = 5;
    println!("The value of x is: {}", x);
    
    // This would cause a compile error:
    // x = 6; // Error: cannot assign twice to immutable variable
}
```

### Mutable Variables

To make a variable mutable, use the `mut` keyword:

```rust
fn main() {
    let mut x = 5;
    println!("The value of x is: {}", x);
    
    x = 6; // This is allowed because x is mutable
    println!("The value of x is now: {}", x);
}
```

**Why immutability by default?** Rust's default immutability helps prevent bugs by making it explicit when values can change. This is especially important in concurrent programming and blockchain development where unexpected state changes can lead to security vulnerabilities.

### Constants

Constants are always immutable and must have their type explicitly annotated:

```rust
const MAX_POINTS: u32 = 100_000;

fn main() {
    println!("The maximum points are: {}", MAX_POINTS);
}
```

**Differences between constants and immutable variables:**
- Constants use `const` instead of `let`
- Constants must have type annotations
- Constants can be declared in any scope, including global
- Constants can only be set to constant expressions, not computed at runtime

### Shadowing

Rust allows you to declare a new variable with the same name as a previous variable, effectively "shadowing" the previous value:

```rust
fn main() {
    let x = 5;
    let x = x + 1; // Shadows the previous x
    
    {
        let x = x * 2; // Shadows again in this scope
        println!("The value of x in the inner scope is: {}", x); // 12
    }
    
    println!("The value of x is: {}", x); // 6
}
```

Shadowing is different from marking a variable as `mut` because we're creating a new variable, which allows us to change the type:

```rust
fn main() {
    let spaces = "   ";           // String type
    let spaces = spaces.len();    // Number type - this is allowed!
    
    // With mut, this would not be allowed:
    // let mut spaces = "   ";
    // spaces = spaces.len(); // Error: mismatched types
}
```

## Data Types

Rust is a **statically typed** language, meaning all variable types must be known at compile time. The compiler can usually infer types, but sometimes you need to add type annotations.

### Scalar Types

Scalar types represent a single value. Rust has four primary scalar types:

#### 1. Integers

Integers are numbers without fractional components. Rust provides signed and unsigned integers of various sizes:

| Length  | Signed | Unsigned |
|---------|--------|----------|
| 8-bit   | i8     | u8       |
| 16-bit  | i16    | u16      |
| 32-bit  | i32    | u32      |
| 64-bit  | i64    | u64      |
| 128-bit | i128   | u128     |
| arch    | isize  | usize    |

```rust
fn main() {
    let a: i32 = 42;           // Signed 32-bit integer (default)
    let b: u64 = 100;          // Unsigned 64-bit integer
    let c = 255u8;             // Type suffix notation
    
    // Number literals can use underscores for readability
    let million = 1_000_000;
    
    // Different number formats
    let decimal = 98_222;      // Decimal
    let hex = 0xff;            // Hexadecimal
    let octal = 0o77;          // Octal
    let binary = 0b1111_0000;  // Binary
    let byte = b'A';           // Byte (u8 only)
    
    println!("Decimal: {}, Hex: {}, Binary: {}", decimal, hex, binary);
}
```

**Integer overflow:** In debug mode, Rust checks for integer overflow and panics. In release mode, Rust performs two's complement wrapping. Use methods like `wrapping_add`, `checked_add`, `overflowing_add`, or `saturating_add` for explicit overflow handling.

#### 2. Floating-Point Numbers

Rust has two floating-point types: `f32` (32-bit) and `f64` (64-bit, default):

```rust
fn main() {
    let x = 2.0;      // f64 (default)
    let y: f32 = 3.0; // f32
    
    // Basic arithmetic
    let sum = 5.5 + 10.2;
    let difference = 95.5 - 4.3;
    let product = 4.0 * 30.0;
    let quotient = 56.7 / 32.2;
    
    println!("Sum: {}, Product: {}", sum, product);
}
```

#### 3. Booleans

The boolean type has two possible values: `true` and `false`:

```rust
fn main() {
    let t = true;
    let f: bool = false; // With explicit type annotation
    
    // Booleans are often used in conditionals
    if t {
        println!("The condition is true!");
    }
}
```

#### 4. Characters

The `char` type represents a single Unicode scalar value:

```rust
fn main() {
    let c = 'z';
    let z: char = 'ℤ';
    let heart_eyed_cat = '😻';
    
    println!("Character: {}, Unicode: {}, Emoji: {}", c, z, heart_eyed_cat);
}
```

**Note:** `char` literals use single quotes, while string literals use double quotes. A `char` is 4 bytes in size and represents a Unicode Scalar Value.

### Compound Types

Compound types can group multiple values into one type.

#### 1. Tuples

Tuples group together values of different types:

```rust
fn main() {
    let tup: (i32, f64, u8) = (500, 6.4, 1);
    
    // Destructuring
    let (x, y, z) = tup;
    println!("The value of y is: {}", y);
    
    // Access by index
    let five_hundred = tup.0;
    let six_point_four = tup.1;
    let one = tup.2;
    
    println!("First element: {}", five_hundred);
}
```

The tuple without any values, `()`, is called a **unit type** and represents an empty value or empty return type.

#### 2. Arrays

Arrays have a fixed length and all elements must be the same type:

```rust
fn main() {
    let a = [1, 2, 3, 4, 5];
    let months = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"];
    
    // Array with type annotation
    let b: [i32; 5] = [1, 2, 3, 4, 5];
    
    // Initialize array with same value
    let c = [3; 5]; // Same as [3, 3, 3, 3, 3]
    
    // Accessing elements
    let first = a[0];
    let second = a[1];
    
    println!("First element: {}, Second element: {}", first, second);
}
```

**Array bounds checking:** Rust checks array bounds at runtime. Accessing an invalid index will cause a panic:

```rust
fn main() {
    let a = [1, 2, 3, 4, 5];
    let index = 10;
    
    // This will panic at runtime
    // let element = a[index];
}
```

### String Types

Rust has two main string types:

#### 1. String Slices (`&str`)

String slices are immutable references to string data, often used for string literals:

```rust
fn main() {
    let s = "Hello, world!"; // Type: &str
    println!("{}", s);
}
```

#### 2. String (`String`)

`String` is a growable, heap-allocated string type:

```rust
fn main() {
    let mut s = String::from("Hello");
    s.push_str(", world!"); // Append to string
    println!("{}", s);
    
    // Convert &str to String
    let s1 = "initial contents".to_string();
    let s2 = String::from("initial contents");
}
```

**Key differences:**
- `&str` is a fixed-size reference to string data (often in program binary or stack)
- `String` is a growable, heap-allocated string that can be modified
- In Solana programs, you'll often use `&str` for efficiency

## Functions

Functions are declared using the `fn` keyword. Rust uses snake_case for function and variable names:

```rust
fn main() {
    println!("Hello, world!");
    
    another_function();
    function_with_parameters(5, 'h');
    
    let result = function_with_return_value();
    println!("The result is: {}", result);
}

fn another_function() {
    println!("Another function.");
}

fn function_with_parameters(value: i32, unit_label: char) {
    println!("The measurement is: {}{}", value, unit_label);
}

fn function_with_return_value() -> i32 {
    5 // No semicolon - this is an expression that returns a value
}
```

### Parameters

Function parameters must have type annotations:

```rust
fn print_sum(x: i32, y: i32) {
    println!("The sum is: {}", x + y);
}
```

### Return Values

Functions return the last expression implicitly, or use `return` for early returns:

```rust
fn add_one(x: i32) -> i32 {
    x + 1 // No semicolon - this is the return value
}

fn add_two(x: i32) -> i32 {
    return x + 2; // Explicit return
}

fn main() {
    let result1 = add_one(5);
    let result2 = add_two(5);
    println!("Results: {}, {}", result1, result2);
}
```

**Important:** Adding a semicolon turns an expression into a statement, which doesn't return a value:

```rust
fn wrong_add_one(x: i32) -> i32 {
    x + 1; // Error! This is a statement, not an expression
}
```

### Statements vs Expressions

- **Statements** perform actions but don't return values
- **Expressions** evaluate to a resulting value

```rust
fn main() {
    let y = {
        let x = 3;
        x + 1 // Expression - no semicolon
    };
    
    println!("The value of y is: {}", y); // 4
}
```

## Control Flow

### If Expressions

```rust
fn main() {
    let number = 6;
    
    if number % 4 == 0 {
        println!("number is divisible by 4");
    } else if number % 3 == 0 {
        println!("number is divisible by 3");
    } else if number % 2 == 0 {
        println!("number is divisible by 2");
    } else {
        println!("number is not divisible by 4, 3, or 2");
    }
}
```

**If as an expression:** Since `if` is an expression, you can use it on the right side of a `let` statement:

```rust
fn main() {
    let condition = true;
    let number = if condition { 5 } else { 6 };
    
    println!("The value of number is: {}", number);
}
```

**Note:** Both branches must return the same type!

### Loops

Rust has three kinds of loops: `loop`, `while`, and `for`.

#### 1. Loop

The `loop` keyword creates an infinite loop:

```rust
fn main() {
    let mut counter = 0;
    
    let result = loop {
        counter += 1;
        
        if counter == 10 {
            break counter * 2; // Return value from loop
        }
    };
    
    println!("The result is: {}", result); // 20
}
```

#### 2. While

Conditional loops:

```rust
fn main() {
    let mut number = 3;
    
    while number != 0 {
        println!("{}!", number);
        number -= 1;
    }
    
    println!("LIFTOFF!!!");
}
```

#### 3. For

Iterate over collections:

```rust
fn main() {
    let a = [10, 20, 30, 40, 50];
    
    for element in a {
        println!("The value is: {}", element);
    }
    
    // Using a range
    for number in 1..4 {
        println!("{}!", number);
    }
    
    // Reverse range
    for number in (1..4).rev() {
        println!("{}!", number);
    }
}
```

**Range syntax:**
- `1..4` - Exclusive range (1, 2, 3)
- `1..=4` - Inclusive range (1, 2, 3, 4)

### Loop Labels

You can label loops to break or continue specific loops in nested structures:

```rust
fn main() {
    let mut count = 0;
    'counting_up: loop {
        println!("count = {}", count);
        let mut remaining = 10;
        
        loop {
            println!("remaining = {}", remaining);
            if remaining == 9 {
                break; // Breaks inner loop
            }
            if count == 2 {
                break 'counting_up; // Breaks outer loop
            }
            remaining -= 1;
        }
        
        count += 1;
    }
    println!("End count = {}", count);
}
```

## Solana Context

Now that you understand Rust fundamentals, let's see how they apply to Solana program development.

### Basic Solana Program Structure

A minimal Solana program uses these fundamental concepts:

```rust
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
};

// Declare the program entrypoint
entrypoint!(process_instruction);

// Program entrypoint function
pub fn process_instruction(
    program_id: &Pubkey,        // Program's public key
    accounts: &[AccountInfo],   // Accounts involved in the instruction
    instruction_data: &[u8],    // Instruction data as bytes
) -> ProgramResult {
    // Log a message
    msg!("Hello, Solana!");
    
    // Return Ok to indicate success
    Ok(())
}
```

**Key observations:**
- **Function signature:** The entrypoint function has specific parameters required by Solana
- **References:** Parameters use `&` (references) - we'll cover this in the next lesson
- **Arrays:** `accounts` is an array slice `&[AccountInfo]`
- **Return type:** `ProgramResult` is a type alias for `Result<(), ProgramError>`
- **Macro:** `msg!` is a macro (indicated by `!`) for logging

### Variables in Solana Programs

```rust
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Immutable variable
    let account_count = accounts.len();
    msg!("Processing {} accounts", account_count);
    
    // Mutable variable for tracking state
    let mut total_lamports: u64 = 0;
    
    // Loop through accounts
    for account in accounts.iter() {
        total_lamports += account.lamports();
    }
    
    msg!("Total lamports: {}", total_lamports);
    
    Ok(())
}
```

### Data Types in Solana

Solana programs commonly use these types:

```rust
use solana_program::pubkey::Pubkey;

pub fn example_types() {
    // Public keys (32-byte addresses)
    let program_id = Pubkey::default();
    
    // Lamports (u64) - smallest unit of SOL
    let lamports: u64 = 1_000_000_000; // 1 SOL
    
    // Instruction data (byte arrays)
    let data: &[u8] = &[1, 2, 3, 4];
    
    // Boolean flags
    let is_initialized: bool = true;
    
    // Account data size
    let data_len: usize = 100;
}
```

### Control Flow in Solana Programs

```rust
use solana_program::{
    account_info::{next_account_info, AccountInfo},
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
    // Get the first byte as instruction type
    let instruction_type = instruction_data
        .get(0)
        .ok_or(ProgramError::InvalidInstructionData)?;
    
    // Route to different handlers based on instruction type
    match instruction_type {
        0 => {
            msg!("Instruction: Initialize");
            // Handle initialization
        }
        1 => {
            msg!("Instruction: Update");
            // Handle update
        }
        _ => {
            msg!("Unknown instruction");
            return Err(ProgramError::InvalidInstructionData);
        }
    }
    
    Ok(())
}
```

**Pattern matching** (the `match` expression) is extremely common in Solana programs for routing instructions and handling different cases. We'll explore this more in the Structs and Enums lesson.

## Best Practices

1. **Use immutability by default** - Only use `mut` when you need to change a value. This prevents accidental modifications and makes code easier to reason about.

2. **Choose appropriate integer types** - Use `u64` for lamports, `usize` for array indices, and sized types (`u8`, `u32`, etc.) for specific data structures.

3. **Prefer expressions over statements** - Rust's expression-oriented nature leads to more concise code:
   ```rust
   // Good
   let status = if is_valid { "valid" } else { "invalid" };
   
   // Less idiomatic
   let status;
   if is_valid {
       status = "valid";
   } else {
       status = "invalid";
   }
   ```

4. **Use descriptive variable names** - Follow Rust's snake_case convention and use clear names:
   ```rust
   let account_balance = 1000; // Good
   let ab = 1000;              // Avoid
   ```

5. **Handle errors explicitly** - Don't ignore potential errors. Use `Result` types and the `?` operator (covered in the Error Handling lesson).

6. **Use `for` loops for iteration** - They're safer than while loops with manual indexing:
   ```rust
   // Good
   for account in accounts.iter() {
       // Process account
   }
   
   // Avoid (error-prone)
   let mut i = 0;
   while i < accounts.len() {
       let account = &accounts[i];
       i += 1;
   }
   ```

7. **Leverage type inference** - Let the compiler infer types when obvious:
   ```rust
   let x = 5;           // Type inferred as i32
   let y: u64 = 5;      // Explicit when needed
   ```

## Common Mistakes

1. **Forgetting mutability** - Trying to modify an immutable variable:
   ```rust
   let x = 5;
   x = 6; // Error: cannot assign twice to immutable variable
   ```

2. **Adding semicolons to return expressions**:
   ```rust
   fn add_one(x: i32) -> i32 {
       x + 1; // Error: expected i32, found ()
   }
   ```

3. **Type mismatches in if expressions**:
   ```rust
   let number = if condition { 5 } else { "six" }; // Error: mismatched types
   ```

4. **Integer overflow in release mode** - Use checked arithmetic:
   ```rust
   let result = value.checked_add(1).ok_or(ProgramError::Overflow)?;
   ```

5. **Confusing `String` and `&str`** - Remember that `&str` is a reference to string data, while `String` owns its data.

## Next Steps

Now that you understand Rust fundamentals, you're ready to learn about Rust's most distinctive feature: the ownership system. This is crucial for understanding how Solana programs manage account data safely.

Continue to [Lesson 02: Ownership and Borrowing](../02-ownership-borrowing/README.md) to master memory management in Rust.

## Source Attribution

Content in this lesson is based on:

- [The Rust Programming Language Book](https://doc.rust-lang.org/book/) - Chapters 3 (Common Programming Concepts)
- [Rust By Example](https://doc.rust-lang.org/rust-by-example/) - Basic types and control flow sections
- [Solana Program Library Documentation](https://docs.solana.com/developing/on-chain-programs/overview)
- Comprehensive Rust reference materials in [rust-full-llms.txt](../../../solana-llms-resources/rust-full-llms.txt)

---

**Previous**: [Module Home](../README.md)  
**Next**: [Ownership and Borrowing](../02-ownership-borrowing/README.md)  
**Module Home**: [Rust Basics](../README.md)

**Language:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
