# Exercise 04: Error Handling Practice

## Overview

This exercise helps you practice error handling with `Result` and `Option` types covered in [Lesson 04: Error Handling](../../04-error-handling/README.md). You'll build a simple configuration file parser and validator that demonstrates proper error handling, custom error types, and the `?` operator—skills that are essential for writing robust Solana programs.

**Estimated Time:** 45-60 minutes

## Learning Objectives

By completing this exercise, you will:

- Use `Option<T>` to represent values that might not exist
- Use `Result<T, E>` for operations that can fail
- Create custom error types with enums
- Use the `?` operator for error propagation
- Handle errors gracefully without panicking
- Apply error handling patterns similar to Solana programs
- Validate data and return meaningful error messages

## Problem Description

Create a configuration file parser and validator for a simple application. Your system should:

1. Define custom error types for different failure scenarios
2. Parse configuration values from strings
3. Validate configuration values against rules
4. Use `Result` and `Option` appropriately
5. Propagate errors using the `?` operator
6. Handle errors gracefully with meaningful messages

## Starter Code

A basic Rust project template is provided in the `starter/` directory. The template includes:

- A `Cargo.toml` file with project configuration
- A `src/main.rs` file with struct definitions and TODO comments

Navigate to the starter directory and run:

```bash
cd starter
cargo run
```

## Implementation Requirements

Your implementation should include:

1. **A `ConfigError` enum** with the following variants:
   - `ParseError { field: String, message: String }`
   - `ValidationError { field: String, message: String }`
   - `MissingField { field: String }`
   - `InvalidRange { field: String, min: i32, max: i32, actual: i32 }`

2. **A `Config` struct** with the following fields:
   - `server_name: String`
   - `port: u16`
   - `max_connections: u32`
   - `timeout_seconds: Option<u32>` (optional field)
   - `admin_email: Option<String>` (optional field)

3. **Implement `Display` trait for `ConfigError`**:
   - Format error messages in a user-friendly way
   - Include relevant details from each error variant

4. **A `parse_port` function**:
   - Function signature: `fn parse_port(value: &str) -> Result<u16, ConfigError>`
   - Parses a string into a u16 port number
   - Returns `ConfigError::ParseError` if parsing fails
   - Returns `ConfigError::ValidationError` if port is 0

5. **A `parse_max_connections` function**:
   - Function signature: `fn parse_max_connections(value: &str) -> Result<u32, ConfigError>`
   - Parses a string into a u32
   - Returns `ConfigError::ParseError` if parsing fails
   - Returns `ConfigError::InvalidRange` if value is not between 1 and 10000

6. **A `parse_timeout` function**:
   - Function signature: `fn parse_timeout(value: Option<&str>) -> Result<Option<u32>, ConfigError>`
   - Returns `Ok(None)` if input is `None`
   - Parses the string and returns `Ok(Some(value))` if valid
   - Returns `ConfigError::ParseError` if parsing fails
   - Returns `ConfigError::InvalidRange` if value is not between 1 and 3600

7. **A `validate_email` function**:
   - Function signature: `fn validate_email(email: &str) -> Result<(), ConfigError>`
   - Checks if email contains '@' and '.'
   - Returns `ConfigError::ValidationError` if invalid

8. **A `Config::new` function**:
   - Function signature: `fn new(server_name: String, port: u16, max_connections: u32, timeout_seconds: Option<u32>, admin_email: Option<String>) -> Result<Config, ConfigError>`
   - Validates server_name is not empty
   - Validates port is not 0
   - Validates max_connections is between 1 and 10000
   - If timeout_seconds is Some, validates it's between 1 and 3600
   - If admin_email is Some, validates it using `validate_email`
   - Returns `Ok(Config)` if all validations pass

9. **A `Config::from_strings` function**:
   - Function signature: `fn from_strings(server_name: &str, port_str: &str, max_conn_str: &str, timeout_str: Option<&str>, email: Option<&str>) -> Result<Config, ConfigError>`
   - Uses the parsing functions with `?` operator
   - Calls `Config::new` to create and validate the config
   - Demonstrates error propagation

10. **A `main` function** that demonstrates:
    - Creating valid configurations
    - Handling various error scenarios
    - Using pattern matching to display errors
    - Working with Option values

## Validation Criteria

Your solution is correct when:

1. ✅ The program compiles without errors or warnings
2. ✅ `ConfigError` enum has all four variants with correct data
3. ✅ `Config` struct has all required fields with correct types
4. ✅ `Display` trait is implemented for `ConfigError` with meaningful messages
5. ✅ `parse_port` correctly parses and validates port numbers
6. ✅ `parse_max_connections` correctly parses and validates connection limits
7. ✅ `parse_timeout` correctly handles Option input and validates timeout values
8. ✅ `validate_email` correctly validates email format
9. ✅ `Config::new` validates all fields and returns appropriate errors
10. ✅ `Config::from_strings` uses `?` operator for error propagation
11. ✅ The main function demonstrates both success and error cases
12. ✅ No use of `unwrap()` or `panic!()` in production code

## Example Output

Your program should produce output similar to this:

```
=== Configuration Parser and Validator ===

Test 1: Valid configuration
✓ Config created successfully:
  Server: production-server
  Port: 8080
  Max Connections: 1000
  Timeout: 30 seconds
  Admin Email: admin@example.com

Test 2: Invalid port (not a number)
✗ Error: Failed to parse field 'port': invalid digit found in string

Test 3: Invalid port (zero)
✗ Error: Validation failed for field 'port': Port cannot be zero

Test 4: Invalid max_connections (out of range)
✗ Error: Field 'max_connections' value 50000 is out of range (min: 1, max: 10000)

Test 5: Invalid timeout (out of range)
✗ Error: Field 'timeout_seconds' value 7200 is out of range (min: 1, max: 3600)

Test 6: Invalid email format
✗ Error: Validation failed for field 'admin_email': Email must contain '@' and '.'

Test 7: Valid configuration with optional fields as None
✓ Config created successfully:
  Server: dev-server
  Port: 3000
  Max Connections: 100
  Timeout: Not set
  Admin Email: Not set

Test 8: Missing server name
✗ Error: Missing required field: server_name

=== All tests completed ===
```

## Hints

- Use `#[derive(Debug)]` on your error enum for easier debugging
- Implement `std::fmt::Display` for user-friendly error messages
- Use `str::parse::<T>()` to parse strings into numbers
- The `?` operator automatically converts errors if `From` trait is implemented
- Use `if let Some(value) = option` to work with Option values
- Remember that `Option<T>` can be `None`, so handle both cases
- Use `match` or `if let` to destructure error variants for specific handling
- Test edge cases: empty strings, zero values, out-of-range numbers

## Pattern Matching Examples

Here are some error handling patterns you'll use:

```rust
// Using ? operator for error propagation
fn parse_config(input: &str) -> Result<Config, ConfigError> {
    let port = parse_port(input)?; // Returns early if error
    let max_conn = parse_max_connections(input)?;
    Ok(Config::new(port, max_conn)?)
}

// Matching on Result
match Config::from_strings("server", "8080", "100", None, None) {
    Ok(config) => println!("Success: {:?}", config),
    Err(e) => println!("Error: {}", e),
}

// Handling Option with if let
if let Some(timeout) = config.timeout_seconds {
    println!("Timeout: {} seconds", timeout);
} else {
    println!("No timeout set");
}

// Matching specific error variants
match result {
    Err(ConfigError::ParseError { field, message }) => {
        println!("Parse error in {}: {}", field, message);
    }
    Err(ConfigError::ValidationError { field, message }) => {
        println!("Validation error in {}: {}", field, message);
    }
    Ok(config) => println!("Config: {:?}", config),
    _ => {}
}
```

## Testing Your Solution

Run your program with:

```bash
cargo run
```

Test different scenarios:

1. Valid configurations with all fields
2. Valid configurations with optional fields as None
3. Invalid port numbers (non-numeric, zero, out of range)
4. Invalid max_connections (out of range)
5. Invalid timeout values
6. Invalid email formats
7. Empty server names

## Extension Challenges (Optional)

If you finish early and want more practice:

1. **Add more validation rules**:
   - Server name must be alphanumeric with hyphens
   - Port must be in specific ranges (e.g., 1024-65535 for non-privileged)
   - Email must have valid domain extensions

2. **Implement `From` trait**:
   - Convert `std::num::ParseIntError` to `ConfigError`
   - This allows `?` to work automatically with parse errors

3. **Add a `Config::from_file` function**:
   - Read configuration from a file
   - Parse key-value pairs
   - Handle file I/O errors

4. **Create a builder pattern**:
   - `ConfigBuilder` with methods like `with_port()`, `with_timeout()`
   - Validate only when `build()` is called
   - Allow incremental configuration

5. **Add error recovery**:
   - Provide default values for invalid configurations
   - Log errors but continue with defaults
   - Return both the config and a list of warnings

6. **Implement custom error conversion**:
   ```rust
   impl From<std::num::ParseIntError> for ConfigError {
       fn from(err: std::num::ParseIntError) -> Self {
           ConfigError::ParseError {
               field: "unknown".to_string(),
               message: err.to_string(),
           }
       }
   }
   ```

## Related Lessons

This exercise reinforces concepts from:

- [Lesson 04: Error Handling](../../04-error-handling/README.md) - Result, Option, custom errors, ? operator

## Solana Context

The error handling patterns you're practicing are directly applicable to Solana development:

- **Custom error enums**: Just like `ConfigError`, Solana programs define custom error types
- **Result types**: Solana uses `ProgramResult` which is `Result<(), ProgramError>`
- **Validation**: Solana programs validate account data and instruction parameters
- **Error propagation**: The `?` operator is used extensively in Solana programs
- **No panicking**: Solana programs must handle errors gracefully without panicking

Example Solana parallel:

```rust
// Your exercise
enum ConfigError {
    ParseError { field: String, message: String },
    ValidationError { field: String, message: String },
}

fn parse_port(value: &str) -> Result<u16, ConfigError> {
    let port = value.parse().map_err(|e| ConfigError::ParseError {
        field: "port".to_string(),
        message: format!("{}", e),
    })?;
    
    if port == 0 {
        return Err(ConfigError::ValidationError {
            field: "port".to_string(),
            message: "Port cannot be zero".to_string(),
        });
    }
    
    Ok(port)
}

// Solana program
use solana_program::{
    entrypoint::ProgramResult,
    program_error::ProgramError,
};

#[derive(Debug)]
enum TokenError {
    InsufficientFunds,
    InvalidAmount,
}

impl From<TokenError> for ProgramError {
    fn from(e: TokenError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

fn transfer_tokens(amount: u64, balance: u64) -> Result<u64, TokenError> {
    if amount == 0 {
        return Err(TokenError::InvalidAmount);
    }
    
    if balance < amount {
        return Err(TokenError::InsufficientFunds);
    }
    
    Ok(balance - amount)
}

pub fn process_transfer(
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    // Validate accounts
    if accounts.len() < 2 {
        return Err(ProgramError::NotEnoughAccountKeys);
    }
    
    // Use ? operator for error propagation
    let from_account = next_account_info(&mut accounts.iter())?;
    let to_account = next_account_info(&mut accounts.iter())?;
    
    // Validate and process
    let new_balance = transfer_tokens(amount, from_balance)?;
    
    Ok(())
}
```

Both patterns emphasize:
- Custom error types for domain-specific errors
- Validation before processing
- Error propagation with `?`
- No panicking in production code
- Clear, actionable error messages

## Need Help?

If you're stuck:

1. Review the relevant sections in [Lesson 04: Error Handling](../../04-error-handling/README.md)
2. Check the compiler error messages - they often suggest fixes
3. Use `println!` with `{:?}` to debug Result and Option values
4. Make sure you're using `?` for error propagation, not `unwrap()`
5. Ensure your error messages are descriptive and include context
6. Check the solution in the `solution/` directory (but try on your own first!)

---

**Exercise Home**: [All Exercises](../README.md)  
**Related Lesson**: [Error Handling](../../04-error-handling/README.md)

**Language:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
