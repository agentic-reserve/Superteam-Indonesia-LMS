# Ownership and Borrowing

## Overview

Ownership is Rust's most unique and powerful feature. It enables Rust to guarantee memory safety without needing a garbage collector, making it ideal for systems programming and blockchain development. Understanding ownership, borrowing, and lifetimes is essential for writing efficient and safe Rust code, especially in Solana programs where you'll constantly work with account data that must be borrowed correctly.

This lesson covers Rust's ownership rules, how references and borrowing work, and the basics of lifetime annotations. These concepts might feel challenging at first, but they're what make Rust programs both safe and fast—critical qualities for blockchain applications where bugs can be costly.

**Estimated Time:** 3-4 hours

## Learning Objectives

By completing this lesson, you will be able to:

- Understand and apply Rust's three ownership rules
- Recognize when ownership is moved vs. copied
- Use references to borrow data without taking ownership
- Distinguish between mutable and immutable references
- Understand the basics of lifetime annotations
- Apply ownership concepts to Solana account data management
- Prevent common ownership-related errors at compile time

## Prerequisites

- Completion of [Lesson 01: Fundamentals](../01-fundamentals/README.md)
- Understanding of variables, functions, and basic data types
- Familiarity with the concept of stack vs. heap memory (helpful but not required)

## Ownership Rules

Rust's ownership system is built on three fundamental rules:

1. **Each value in Rust has an owner**
2. **There can only be one owner at a time**
3. **When the owner goes out of scope, the value will be dropped**

Let's explore what these rules mean in practice.

### The Stack and the Heap

Before diving deeper, it's helpful to understand where data lives:

- **Stack**: Fast, fixed-size data (integers, booleans, etc.). Data is pushed and popped in order.
- **Heap**: Flexible-size data (strings, vectors, etc.). Memory is allocated and must be freed.

```rust
fn main() {
    // Stack-allocated: size known at compile time
    let x = 5;
    let y = true;
    
    // Heap-allocated: size can grow
    let s = String::from("hello");
}
```

## Ownership in Action

### Variable Scope

A variable is valid from the point it's declared until the end of its scope:

```rust
fn main() {
    {                      // s is not valid here, not yet declared
        let s = "hello";   // s is valid from this point forward
        
        // Do stuff with s
        println!("{}", s);
    }                      // Scope ends, s is no longer valid
    
    // println!("{}", s); // Error: s is not in scope
}
```

### Ownership and Move Semantics

For heap-allocated data, assignment moves ownership:

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1; // Ownership moves from s1 to s2
    
    // println!("{}", s1); // Error: value borrowed after move
    println!("{}", s2);    // This works
}
```

**What happened?** When we assigned `s1` to `s2`, Rust moved the ownership. The string data on the heap wasn't copied—only the pointer, length, and capacity were copied. To prevent double-free errors, Rust invalidates `s1`.

### Deep Copy with Clone

If you want to deeply copy heap data, use `clone()`:

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1.clone(); // Explicitly copy the heap data
    
    println!("s1 = {}, s2 = {}", s1, s2); // Both are valid
}
```

**Note:** Cloning can be expensive for large data structures. Use it intentionally.

### Copy Trait for Stack Data

Simple types stored on the stack implement the `Copy` trait, so they're copied instead of moved:

```rust
fn main() {
    let x = 5;
    let y = x; // x is copied, not moved
    
    println!("x = {}, y = {}", x, y); // Both are valid
}
```

**Types that implement Copy:**
- All integer types (`u32`, `i64`, etc.)
- Boolean type (`bool`)
- Floating-point types (`f32`, `f64`)
- Character type (`char`)
- Tuples containing only `Copy` types: `(i32, i32)` is `Copy`, but `(i32, String)` is not

## Ownership and Functions

Passing a value to a function moves or copies it, just like assignment:

```rust
fn main() {
    let s = String::from("hello");
    takes_ownership(s);  // s's value moves into the function
    // println!("{}", s); // Error: s is no longer valid
    
    let x = 5;
    makes_copy(x);       // x is copied into the function
    println!("{}", x);   // x is still valid
}

fn takes_ownership(some_string: String) {
    println!("{}", some_string);
} // some_string goes out of scope and is dropped

fn makes_copy(some_integer: i32) {
    println!("{}", some_integer);
} // some_integer goes out of scope, but nothing special happens
```

### Returning Values and Ownership

Returning values can also transfer ownership:

```rust
fn main() {
    let s1 = gives_ownership();         // Return value moves into s1
    
    let s2 = String::from("hello");
    let s3 = takes_and_gives_back(s2);  // s2 moves in, return value moves to s3
    
    println!("s1 = {}, s3 = {}", s1, s3);
    // println!("{}", s2); // Error: s2 was moved
}

fn gives_ownership() -> String {
    let some_string = String::from("yours");
    some_string // Ownership moves to caller
}

fn takes_and_gives_back(a_string: String) -> String {
    a_string // Ownership moves to caller
}
```

**The problem:** Taking ownership and returning it every time is tedious. This is where references come in!

## References and Borrowing

A **reference** allows you to refer to a value without taking ownership. Creating a reference is called **borrowing**.

### Immutable References

```rust
fn main() {
    let s1 = String::from("hello");
    let len = calculate_length(&s1); // Pass a reference
    
    println!("The length of '{}' is {}.", s1, len); // s1 is still valid
}

fn calculate_length(s: &String) -> usize {
    s.len()
} // s goes out of scope, but it doesn't own the data, so nothing is dropped
```

**The `&` symbol** creates a reference. The function signature `&String` means "a reference to a String."

**Diagram:**
```
s1 (owner) -> String data on heap
s (reference) -> points to s1
```

### References Are Immutable by Default

You cannot modify data through an immutable reference:

```rust
fn main() {
    let s = String::from("hello");
    change(&s); // Error!
}

fn change(some_string: &String) {
    some_string.push_str(", world"); // Error: cannot borrow as mutable
}
```

### Mutable References

To modify borrowed data, use a mutable reference:

```rust
fn main() {
    let mut s = String::from("hello");
    change(&mut s); // Pass a mutable reference
    
    println!("{}", s); // Prints: hello, world
}

fn change(some_string: &mut String) {
    some_string.push_str(", world");
}
```

**Important:** The original variable must also be `mut`.

### The Rules of References

Rust enforces these rules at compile time to prevent data races:

1. **At any given time, you can have either:**
   - One mutable reference, OR
   - Any number of immutable references

2. **References must always be valid** (no dangling references)

#### Rule 1: Mutable Reference Restriction

You cannot have multiple mutable references to the same data in the same scope:

```rust
fn main() {
    let mut s = String::from("hello");
    
    let r1 = &mut s;
    let r2 = &mut s; // Error: cannot borrow `s` as mutable more than once
    
    println!("{}, {}", r1, r2);
}
```

**Why?** This prevents data races at compile time. A data race occurs when:
- Two or more pointers access the same data simultaneously
- At least one pointer is writing
- No synchronization mechanism is used

You can create multiple mutable references, just not simultaneously:

```rust
fn main() {
    let mut s = String::from("hello");
    
    {
        let r1 = &mut s;
        println!("{}", r1);
    } // r1 goes out of scope
    
    let r2 = &mut s; // This is fine
    println!("{}", r2);
}
```

#### Rule 1 Extended: Cannot Mix Mutable and Immutable

You cannot have a mutable reference while immutable references exist:

```rust
fn main() {
    let mut s = String::from("hello");
    
    let r1 = &s;     // Immutable reference
    let r2 = &s;     // Another immutable reference
    let r3 = &mut s; // Error: cannot borrow as mutable
    
    println!("{}, {}, and {}", r1, r2, r3);
}
```

**However**, a reference's scope ends at its last use (Non-Lexical Lifetimes):

```rust
fn main() {
    let mut s = String::from("hello");
    
    let r1 = &s;
    let r2 = &s;
    println!("{} and {}", r1, r2);
    // r1 and r2 are no longer used after this point
    
    let r3 = &mut s; // This is fine!
    println!("{}", r3);
}
```

#### Rule 2: No Dangling References

Rust prevents dangling references (references to freed memory):

```rust
fn main() {
    let reference_to_nothing = dangle(); // Error!
}

fn dangle() -> &String {
    let s = String::from("hello");
    &s // Error: returns a reference to data owned by this function
} // s goes out of scope and is dropped
```

**Solution:** Return the owned value instead:

```rust
fn no_dangle() -> String {
    let s = String::from("hello");
    s // Ownership moves to caller
}
```

## The Slice Type

Slices let you reference a contiguous sequence of elements without taking ownership.

### String Slices

A string slice is a reference to part of a String:

```rust
fn main() {
    let s = String::from("hello world");
    
    let hello = &s[0..5];  // Reference to first 5 bytes
    let world = &s[6..11]; // Reference to bytes 6-10
    
    println!("{} {}", hello, world);
}
```

**Slice syntax:**
- `&s[0..5]` - From index 0 to 5 (exclusive)
- `&s[..5]` - From start to 5
- `&s[6..]` - From 6 to end
- `&s[..]` - Entire string

**Type:** String slices have type `&str`.

### Practical Example: First Word

```rust
fn first_word(s: &String) -> &str {
    let bytes = s.as_bytes();
    
    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i]; // Return slice up to space
        }
    }
    
    &s[..] // Return entire string if no space found
}

fn main() {
    let mut s = String::from("hello world");
    let word = first_word(&s);
    
    println!("First word: {}", word);
    
    // s.clear(); // Error: cannot borrow as mutable while immutable borrow exists
}
```

**Safety:** The slice keeps an immutable reference to the string, preventing modification while the slice is in use.

### String Literals Are Slices

```rust
let s = "Hello, world!"; // Type: &str
```

String literals are slices pointing to a specific location in the program binary. This is why they're immutable.

### Other Slices

Slices work with any collection:

```rust
fn main() {
    let a = [1, 2, 3, 4, 5];
    let slice = &a[1..3]; // Type: &[i32]
    
    assert_eq!(slice, &[2, 3]);
}
```

## Lifetimes

Lifetimes are Rust's way of ensuring references are always valid. Most of the time, lifetimes are implicit and inferred, but sometimes you need to annotate them explicitly.

### The Lifetime Problem

```rust
fn main() {
    let r;
    
    {
        let x = 5;
        r = &x; // Error: `x` does not live long enough
    }
    
    println!("r: {}", r);
}
```

**Problem:** `r` references `x`, but `x` goes out of scope before `r` is used.

### Lifetime Annotation Syntax

Lifetime annotations don't change how long references live—they describe the relationships between lifetimes of multiple references.

```rust
&i32        // A reference
&'a i32     // A reference with an explicit lifetime
&'a mut i32 // A mutable reference with an explicit lifetime
```

**The `'a` syntax** (pronounced "tick a") is a lifetime parameter.

### Lifetime Annotations in Functions

When a function returns a reference, Rust needs to know which input it's related to:

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

fn main() {
    let string1 = String::from("long string is long");
    let string2 = String::from("xyz");
    
    let result = longest(string1.as_str(), string2.as_str());
    println!("The longest string is {}", result);
}
```

**What this means:** The returned reference will be valid as long as both `x` and `y` are valid. The lifetime `'a` is the smaller of the lifetimes of `x` and `y`.

### Lifetime Elision Rules

Rust can often infer lifetimes, so you don't always need to write them. These are the elision rules:

1. Each parameter that is a reference gets its own lifetime parameter
2. If there's exactly one input lifetime, it's assigned to all output lifetimes
3. If there are multiple input lifetimes, but one is `&self` or `&mut self`, the lifetime of `self` is assigned to all output lifetimes

**Example where elision works:**

```rust
fn first_word(s: &str) -> &str {
    // Compiler infers: fn first_word<'a>(s: &'a str) -> &'a str
    let bytes = s.as_bytes();
    
    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }
    
    &s[..]
}
```

### Lifetime Annotations in Structs

When a struct holds references, you need lifetime annotations:

```rust
struct ImportantExcerpt<'a> {
    part: &'a str,
}

fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().expect("Could not find a '.'");
    
    let i = ImportantExcerpt {
        part: first_sentence,
    };
    
    println!("Excerpt: {}", i.part);
}
```

**Meaning:** An instance of `ImportantExcerpt` can't outlive the reference it holds in its `part` field.

### The Static Lifetime

The `'static` lifetime means a reference can live for the entire duration of the program:

```rust
let s: &'static str = "I have a static lifetime.";
```

All string literals have the `'static` lifetime because they're stored in the program binary.

## Solana Context

Understanding ownership and borrowing is crucial for Solana development because you're constantly working with account data that must be borrowed correctly to prevent data races and ensure security.

### Account Data Borrowing in Solana

In Solana programs, accounts are passed as references, and you must borrow their data correctly:

```rust
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
};

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let account = next_account_info(accounts_iter)?;
    
    // Immutable borrow of account data
    let data = account.data.borrow();
    msg!("Account data length: {}", data.len());
    
    // data goes out of scope, releasing the borrow
    
    // Now we can mutably borrow
    let mut data = account.data.borrow_mut();
    data[0] = 1; // Modify the first byte
    
    Ok(())
}
```

**Key points:**
- `account.data` is a `RefCell<&mut [u8]>` that enforces borrowing rules at runtime
- `borrow()` creates an immutable reference
- `borrow_mut()` creates a mutable reference
- You cannot have both simultaneously (enforced at runtime)

### Preventing Data Races

Rust's borrowing rules prevent data races at compile time:

```rust
pub fn safe_account_access(account: &AccountInfo) -> ProgramResult {
    // This is safe: multiple immutable borrows
    let data1 = account.data.borrow();
    let data2 = account.data.borrow();
    msg!("Data length: {}, {}", data1.len(), data2.len());
    
    // This would panic at runtime:
    // let mut data3 = account.data.borrow_mut(); // Panic: already borrowed
    
    Ok(())
}
```

### Account References and Lifetimes

Account references have lifetimes tied to the instruction execution:

```rust
pub fn process_instruction<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    instruction_data: &[u8],
) -> ProgramResult {
    // All account references are valid for lifetime 'a
    let account = &accounts[0];
    
    // This reference is valid as long as 'a
    let owner = account.owner;
    
    msg!("Account owner: {}", owner);
    Ok(())
}
```

### Ownership in Cross-Program Invocations

When making cross-program invocations (CPI), you pass account references:

```rust
use solana_program::{
    account_info::AccountInfo,
    entrypoint::ProgramResult,
    program::invoke,
    instruction::{Instruction, AccountMeta},
    pubkey::Pubkey,
};

pub fn make_cpi<'a>(
    program_id: &Pubkey,
    accounts: &[AccountInfo<'a>],
) -> ProgramResult {
    let account_metas = vec![
        AccountMeta::new(*accounts[0].key, false),
        AccountMeta::new_readonly(*accounts[1].key, false),
    ];
    
    let instruction = Instruction {
        program_id: *program_id,
        accounts: account_metas,
        data: vec![1, 2, 3],
    };
    
    // invoke borrows the accounts
    invoke(&instruction, accounts)?;
    
    // After invoke returns, we can use accounts again
    Ok(())
}
```

### Anchor Framework Simplifications

The Anchor framework provides abstractions that handle much of the borrowing complexity:

```rust
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        init,
        payer = user,
        space = 8 + 32
    )]
    pub data_account: Account<'info, DataAccount>,
    
    pub system_program: Program<'info, System>,
}

#[account]
pub struct DataAccount {
    pub owner: Pubkey,
}
```

**Benefits:**
- Anchor handles borrowing and lifetime annotations
- Type-safe account access
- Automatic serialization/deserialization
- Clear ownership semantics

## Best Practices

1. **Prefer borrowing over ownership transfer** - Use references (`&T`) when you don't need to own the data:
   ```rust
   // Good
   fn process_data(data: &String) { }
   
   // Less efficient
   fn process_data(data: String) { }
   ```

2. **Use `&str` instead of `&String` for function parameters** - More flexible:
   ```rust
   // Good: accepts both &String and &str
   fn print_message(msg: &str) {
       println!("{}", msg);
   }
   
   // Less flexible: only accepts &String
   fn print_message(msg: &String) {
       println!("{}", msg);
   }
   ```

3. **Keep mutable borrows short** - Release them as soon as possible:
   ```rust
   fn main() {
       let mut s = String::from("hello");
       
       {
           let r = &mut s;
           r.push_str(" world");
       } // r goes out of scope
       
       // Now we can borrow again
       println!("{}", s);
   }
   ```

4. **Use slices for flexible function parameters**:
   ```rust
   // Good: works with arrays, vectors, and slices
   fn sum(values: &[i32]) -> i32 {
       values.iter().sum()
   }
   ```

5. **Clone only when necessary** - Cloning is expensive, so use it intentionally:
   ```rust
   // If you need to store data in multiple places
   let s1 = String::from("hello");
   let s2 = s1.clone(); // Explicit and intentional
   ```

6. **In Solana programs, minimize borrow scope**:
   ```rust
   pub fn process(account: &AccountInfo) -> ProgramResult {
       // Borrow, use, and release quickly
       {
           let data = account.data.borrow();
           msg!("Length: {}", data.len());
       } // Borrow released
       
       // Now we can borrow mutably
       let mut data = account.data.borrow_mut();
       data[0] = 1;
       
       Ok(())
   }
   ```

## Common Mistakes

1. **Using a value after moving it**:
   ```rust
   let s1 = String::from("hello");
   let s2 = s1;
   println!("{}", s1); // Error: value borrowed after move
   ```

2. **Multiple mutable references**:
   ```rust
   let mut s = String::from("hello");
   let r1 = &mut s;
   let r2 = &mut s; // Error: cannot borrow as mutable more than once
   ```

3. **Mixing mutable and immutable references**:
   ```rust
   let mut s = String::from("hello");
   let r1 = &s;
   let r2 = &mut s; // Error: cannot borrow as mutable while immutable borrow exists
   ```

4. **Returning references to local variables**:
   ```rust
   fn dangle() -> &String {
       let s = String::from("hello");
       &s // Error: returns reference to local variable
   }
   ```

5. **Forgetting to drop borrows in Solana programs**:
   ```rust
   pub fn process(account: &AccountInfo) -> ProgramResult {
       let data = account.data.borrow();
       // ... long processing ...
       let mut data_mut = account.data.borrow_mut(); // Panic: already borrowed!
       Ok(())
   }
   ```

6. **Unnecessary cloning**:
   ```rust
   fn process_string(s: String) {
       println!("{}", s);
   }
   
   fn main() {
       let s = String::from("hello");
       process_string(s.clone()); // Unnecessary if we don't need s afterward
       // Just pass s directly if you don't need it later
   }
   ```

## Next Steps

You now understand Rust's ownership system, which is fundamental to writing safe and efficient code. Next, you'll learn about structs and enums, which allow you to create custom data types—essential for modeling Solana program state and instructions.

Continue to [Lesson 03: Structs and Enums](../03-structs-enums/README.md) to learn how to organize and structure your data.

## Source Attribution

Content in this lesson is based on:

- [The Rust Programming Language Book](https://doc.rust-lang.org/book/) - Chapters 4 (Understanding Ownership) and 10.3 (Validating References with Lifetimes)
- [Rust By Example](https://doc.rust-lang.org/rust-by-example/) - Ownership and borrowing sections
- [Solana Program Library Documentation](https://docs.solana.com/developing/on-chain-programs/overview)
- [Anchor Framework Documentation](https://www.anchor-lang.com/)
- Comprehensive Rust reference materials in [rust-full-llms.txt](../../../solana-llms-resources/rust-full-llms.txt)

---

**Previous**: [Fundamentals](../01-fundamentals/README.md)  
**Next**: [Structs and Enums](../03-structs-enums/README.md)  
**Module Home**: [Rust Basics](../README.md)

**Language:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
