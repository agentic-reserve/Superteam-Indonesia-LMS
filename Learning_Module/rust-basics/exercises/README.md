# Rust Basics Exercises

## Overview

Welcome to the Rust Basics exercises! These hands-on coding challenges are designed to reinforce the concepts you've learned in the lessons. Each exercise focuses on specific Rust fundamentals and includes Solana-relevant scenarios to prepare you for blockchain development.

Working through these exercises will help you:
- Apply Rust concepts in practical scenarios
- Build muscle memory for common Rust patterns
- Gain confidence writing Rust code
- Prepare for Solana program development

## How to Complete Exercises

### Setup

1. Ensure you have Rust and Cargo installed (see [Rust and Anchor Setup Guide](../../setup/rust-anchor.md))
2. Navigate to the exercise directory you want to work on
3. Read the exercise instructions in the README.md file
4. Work in the `starter/` directory if provided, or create your own project

### Workflow

1. **Read the Instructions:** Each exercise has clear objectives and validation criteria
2. **Write Your Code:** Implement the solution based on the requirements
3. **Test Your Solution:** Run `cargo test` to verify your implementation
4. **Compare with Solution:** Check the `solution/` directory if you get stuck (but try on your own first!)
5. **Experiment:** Modify the code to explore variations and edge cases

### Tips for Success

- **Start Simple:** Get basic functionality working before adding complexity
- **Read Compiler Messages:** Rust's compiler provides helpful error messages—read them carefully
- **Use `cargo check`:** Quickly check for errors without building the full project
- **Consult Lessons:** Refer back to lesson material when needed
- **Don't Peek Too Soon:** Try to solve exercises independently before looking at solutions
- **Experiment Freely:** The Rust compiler will catch most mistakes—don't be afraid to try things

## Exercises

### [01. Variables and Functions](01-variables-functions/README.md)
**Difficulty:** Beginner  
**Estimated Time:** 30-45 minutes  
**Related Lessons:** [01-fundamentals](../01-fundamentals/README.md)

Practice Rust's basic syntax including variables, mutability, data types, and functions. Build a simple calculator and work with different numeric types.

**Key Concepts:**
- Variable declarations and mutability
- Primitive data types
- Function definitions and parameters
- Return values

### [02. Ownership Practice](02-ownership-practice/README.md)
**Difficulty:** Intermediate  
**Estimated Time:** 1-1.5 hours  
**Related Lessons:** [02-ownership-borrowing](../02-ownership-borrowing/README.md)

Master Rust's ownership system through practical challenges. Work with ownership transfer, borrowing, and references in realistic scenarios.

**Key Concepts:**
- Ownership rules and move semantics
- Borrowing and references
- Mutable vs immutable references
- Common ownership patterns

### [03. Struct and Enum Exercises](03-struct-enum-exercises/README.md)
**Difficulty:** Beginner to Intermediate  
**Estimated Time:** 1-1.5 hours  
**Related Lessons:** [03-structs-enums](../03-structs-enums/README.md)

Create custom data types using structs and enums. Model Solana-like account structures and implement methods.

**Key Concepts:**
- Struct definitions and instantiation
- Enum variants and pattern matching
- Methods and associated functions
- Data modeling

### [04. Error Handling Practice](04-error-handling-practice/README.md)
**Difficulty:** Intermediate  
**Estimated Time:** 1-1.5 hours  
**Related Lessons:** [04-error-handling](../04-error-handling/README.md)

Handle errors gracefully using Result and Option types. Implement error propagation patterns used in Solana programs.

**Key Concepts:**
- Result and Option types
- Error propagation with `?` operator
- Custom error types
- Error handling patterns

### [05. Trait Implementation](05-trait-implementation/README.md)
**Difficulty:** Intermediate  
**Estimated Time:** 1-1.5 hours  
**Related Lessons:** [05-traits-generics](../05-traits-generics/README.md)

Implement traits for shared behavior and work with generic types. Practice patterns similar to Solana's serialization traits.

**Key Concepts:**
- Trait definitions and implementations
- Generic types and functions
- Trait bounds
- Code reusability

### [06. Mini Project](06-mini-project/README.md)
**Difficulty:** Intermediate to Advanced  
**Estimated Time:** 2-3 hours  
**Related Lessons:** All lessons

Build a complete mini-project that integrates all Rust concepts learned in this module. Create a simplified account management system similar to Solana's architecture.

**Key Concepts:**
- All previous concepts integrated
- Project organization
- Module structure
- Real-world application

## Validation Criteria

Each exercise includes specific validation criteria to help you verify your solution:

- **Compilation:** Your code must compile without errors
- **Tests:** All provided tests must pass
- **Functionality:** The program must meet the specified requirements
- **Best Practices:** Code should follow Rust idioms and conventions

Run tests with:
```bash
cargo test
```

Check your code compiles:
```bash
cargo check
```

Build and run:
```bash
cargo run
```

## Getting Unstuck

If you're having trouble with an exercise:

1. **Review the Related Lesson:** Go back to the lesson material for the concepts
2. **Read Compiler Errors:** Rust's error messages often suggest fixes
3. **Start Smaller:** Break the problem into smaller pieces
4. **Use Print Debugging:** Add `println!` statements to understand what's happening
5. **Check the Solution:** If truly stuck, peek at the solution directory for hints
6. **Ask for Help:** Consult the Rust community forums or Discord

## Additional Practice

Want more practice after completing these exercises?

- **[Rustlings](https://github.com/rust-lang/rustlings)** - Small exercises covering Rust concepts
- **[Exercism Rust Track](https://exercism.org/tracks/rust)** - Coding exercises with mentor feedback
- **[Rust By Example](https://doc.rust-lang.org/rust-by-example/)** - Learn through annotated examples
- **[Advent of Code](https://adventofcode.com/)** - Solve programming puzzles in Rust

## Next Steps

After completing these exercises:

1. Review any concepts that were challenging
2. Experiment with variations of the exercises
3. Move on to [Solana Basics](../../basics/README.md) to apply Rust in blockchain development
4. Start learning the [Anchor Framework](../../basics/05-anchor-framework/README.md)

## Source Attribution

Exercise designs and concepts are based on:
- [The Rust Programming Language Book](https://doc.rust-lang.org/book/) exercises
- [Rustlings](https://github.com/rust-lang/rustlings) exercise patterns
- Solana program development patterns and best practices

---

**Module Home:** [Rust Basics](../README.md)

**Language:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
