# Exercise 01: Variables and Functions

## Overview

This exercise helps you practice the fundamental Rust concepts covered in [Lesson 01: Fundamentals](../../01-fundamentals/README.md). You'll work with variables, data types, functions, and control flow to build a simple program that calculates statistics for a collection of numbers.

**Estimated Time:** 30-45 minutes

## Learning Objectives

By completing this exercise, you will:

- Practice declaring and using mutable and immutable variables
- Work with different data types (integers, floats, booleans)
- Define functions with parameters and return values
- Use control flow structures (loops and conditionals)
- Apply basic Rust concepts in a practical scenario

## Problem Description

Create a program that analyzes a collection of numbers and calculates various statistics. Your program should:

1. Store a collection of numbers in an array
2. Calculate the sum of all numbers
3. Calculate the average (mean) of the numbers
4. Find the minimum and maximum values
5. Count how many numbers are above the average
6. Display all results with appropriate formatting

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

1. **A `calculate_sum` function** that takes an array of integers and returns their sum
   - Function signature: `fn calculate_sum(numbers: &[i32]) -> i32`

2. **A `calculate_average` function** that takes an array of integers and returns the average as a float
   - Function signature: `fn calculate_average(numbers: &[i32]) -> f64`

3. **A `find_min_max` function** that takes an array and returns a tuple with (min, max)
   - Function signature: `fn find_min_max(numbers: &[i32]) -> (i32, i32)`

4. **A `count_above_average` function** that counts how many numbers are above the average
   - Function signature: `fn count_above_average(numbers: &[i32], average: f64) -> usize`

5. **A `main` function** that:
   - Creates an array of at least 5 numbers
   - Calls all the functions above
   - Prints the results in a readable format

## Validation Criteria

Your solution is correct when:

1. ✅ The program compiles without errors or warnings
2. ✅ All functions have correct signatures and return types
3. ✅ The `calculate_sum` function correctly adds all numbers
4. ✅ The `calculate_average` function returns the correct mean value
5. ✅ The `find_min_max` function returns the correct minimum and maximum
6. ✅ The `count_above_average` function correctly counts numbers above average
7. ✅ The output is formatted clearly and includes all required statistics
8. ✅ Variables use appropriate mutability (immutable by default, mutable only when needed)

## Example Output

Your program should produce output similar to this:

```
Statistics for numbers: [10, 25, 5, 30, 15, 20]

Sum: 105
Average: 17.5
Minimum: 5
Maximum: 30
Numbers above average: 3
```

## Hints

- Use a `for` loop to iterate through the array when calculating the sum
- Convert integers to floats using `as f64` when calculating the average
- Initialize min/max with the first element of the array
- Use comparison operators (`>`, `<`) to find min/max values
- The array length can be obtained with `.len()`
- Remember that integer division truncates - use float division for the average

## Testing Your Solution

Run your program with:

```bash
cargo run
```

Try modifying the input array with different numbers to verify your functions work correctly:

```rust
let numbers = [10, 25, 5, 30, 15, 20];  // Original
let numbers = [1, 2, 3, 4, 5];          // Simple sequence
let numbers = [100, -50, 0, 75, -25];   // With negative numbers
```

## Extension Challenges (Optional)

If you finish early and want more practice:

1. **Add a median calculation** - Find the middle value when numbers are sorted
2. **Handle empty arrays** - Return appropriate values or error messages for empty input
3. **Add user input** - Read numbers from the command line instead of hardcoding them
4. **Calculate standard deviation** - Measure how spread out the numbers are
5. **Format output with colors** - Use the `colored` crate to make output more readable

## Related Lessons

This exercise reinforces concepts from:

- [Lesson 01: Fundamentals](../../01-fundamentals/README.md) - Variables, data types, functions, control flow

## Need Help?

If you're stuck:

1. Review the relevant sections in [Lesson 01: Fundamentals](../../01-fundamentals/README.md)
2. Check the solution in the `solution/` directory (but try on your own first!)
3. Make sure you understand the function signatures and what each function should return
4. Use `println!` statements to debug and see intermediate values
5. Read the compiler error messages carefully - they're usually very helpful!

---

**Exercise Home**: [All Exercises](../README.md)  
**Related Lesson**: [Fundamentals](../../01-fundamentals/README.md)

**Language:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
