# Exercise 02: Ownership Practice

## Overview

This exercise helps you practice Rust's ownership, borrowing, and lifetime concepts covered in [Lesson 02: Ownership and Borrowing](../../02-ownership-borrowing/README.md). You'll work through common ownership scenarios, understand when to use references versus owned values, and learn to write functions that properly manage memory.

**Estimated Time:** 45-60 minutes

## Learning Objectives

By completing this exercise, you will:

- Understand ownership transfer and when values are moved
- Practice using references (borrowing) to avoid unnecessary moves
- Work with mutable and immutable references
- Recognize and fix common borrowing errors
- Apply ownership concepts to build a simple string manipulation library

## Problem Description

Create a text processing library that demonstrates proper ownership and borrowing patterns. Your program should:

1. Take ownership of strings when necessary
2. Borrow strings when ownership transfer isn't needed
3. Use mutable references to modify strings in place
4. Return owned values from functions when appropriate
5. Handle multiple references correctly

## Starter Code

A basic Rust project template is provided in the `starter/` directory. The template includes:

- A `Cargo.toml` file with project configuration
- A `src/main.rs` file with function signatures and TODO comments

Navigate to the starter directory and run:

```bash
cd starter
cargo run
```

## Implementation Requirements

Your implementation should include:

1. **A `take_ownership` function** that takes ownership of a String and returns its length
   - Function signature: `fn take_ownership(s: String) -> usize`
   - This function consumes the string (takes ownership)

2. **A `borrow_string` function** that borrows a String and returns its length without taking ownership
   - Function signature: `fn borrow_string(s: &String) -> usize`
   - The original string remains usable after this function call

3. **A `modify_string` function** that takes a mutable reference and appends text
   - Function signature: `fn modify_string(s: &mut String, suffix: &str)`
   - Modifies the string in place

4. **A `first_word` function** that returns a reference to the first word in a string
   - Function signature: `fn first_word(s: &str) -> &str`
   - Returns a string slice pointing to the first word

5. **A `create_greeting` function** that creates and returns a new owned String
   - Function signature: `fn create_greeting(name: &str) -> String`
   - Builds a greeting message and returns ownership

6. **A `main` function** that demonstrates all ownership patterns:
   - Shows ownership transfer
   - Shows borrowing (immutable references)
   - Shows mutable borrowing
   - Shows string slices and lifetimes

## Validation Criteria

Your solution is correct when:

1. ✅ The program compiles without errors or warnings
2. ✅ `take_ownership` correctly consumes the string and returns its length
3. ✅ `borrow_string` allows the string to be used after the function call
4. ✅ `modify_string` correctly modifies the string in place
5. ✅ `first_word` returns a valid string slice to the first word
6. ✅ `create_greeting` returns a new owned String
7. ✅ The main function demonstrates all ownership patterns without borrowing errors
8. ✅ No unnecessary cloning is used (only clone when ownership transfer is required)

## Example Output

Your program should produce output similar to this:

```
=== Ownership Practice ===

1. Taking Ownership:
   Original string length: 13
   (String is now consumed and cannot be used)

2. Borrowing (Immutable Reference):
   Borrowed string length: 18
   Original string still usable: Hello, Rust World!

3. Mutable Borrowing:
   Before modification: Hello
   After modification: Hello, Rust!

4. String Slices:
   Full text: Rust programming language
   First word: Rust

5. Creating New Strings:
   Greeting: Hello, Alice! Welcome to Rust.
```

## Hints

- When a function takes ownership, the original variable can no longer be used
- Use `&` to create an immutable reference (borrow)
- Use `&mut` to create a mutable reference (mutable borrow)
- String slices (`&str`) are references to parts of strings
- Use `.split_whitespace()` or `.split(' ')` to find the first word
- The `push_str()` method appends to a String
- Use `format!()` or string concatenation to create new strings

## Common Ownership Patterns

This exercise demonstrates these important patterns:

1. **Consuming functions**: Take ownership when you need to transform or consume the value
2. **Borrowing functions**: Use references when you only need to read the value
3. **Mutable borrowing**: Use `&mut` when you need to modify a value in place
4. **Returning ownership**: Create and return new values when needed
5. **String slices**: Use `&str` for read-only views into string data

## Testing Your Solution

Run your program with:

```bash
cargo run
```

The program should compile and run without errors. Pay attention to:

- Compiler errors about "value borrowed after move"
- Errors about "cannot borrow as mutable"
- Errors about "cannot borrow as mutable more than once"

These errors are Rust's ownership system protecting you from memory bugs!

## Extension Challenges (Optional)

If you finish early and want more practice:

1. **Add a `longest` function** that takes two string slices and returns the longer one
   - This requires explicit lifetime annotations: `fn longest<'a>(s1: &'a str, s2: &'a str) -> &'a str`

2. **Create a `split_at_word` function** that splits a string at a word boundary
   - Returns two string slices: `fn split_at_word(s: &str, word: &str) -> (&str, &str)`

3. **Implement a `WordCounter` struct** that borrows a string and counts words
   - Practice struct lifetimes: `struct WordCounter<'a> { text: &'a str }`

4. **Add error handling** for edge cases like empty strings or missing words

5. **Create a `StringBuffer` type** that manages a growable string with ownership

## Related Lessons

This exercise reinforces concepts from:

- [Lesson 02: Ownership and Borrowing](../../02-ownership-borrowing/README.md) - Ownership rules, references, borrowing, lifetimes

## Solana Context

Understanding ownership is crucial for Solana development:

- **Account data borrowing**: Solana programs borrow account data using references
- **Preventing data races**: Rust's borrowing rules prevent concurrent modification bugs
- **Zero-copy deserialization**: Solana uses references to avoid copying large account data
- **Lifetime management**: Account references must live long enough for transaction processing

## Need Help?

If you're stuck:

1. Review the relevant sections in [Lesson 02: Ownership and Borrowing](../../02-ownership-borrowing/README.md)
2. Read the compiler error messages carefully - they explain what's wrong
3. Check the solution in the `solution/` directory (but try on your own first!)
4. Remember: if you get a "moved value" error, consider using a reference instead
5. Use `println!` to see when values are moved or borrowed

---

**Exercise Home**: [All Exercises](../README.md)  
**Related Lesson**: [Ownership and Borrowing](../../02-ownership-borrowing/README.md)

**Language:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
