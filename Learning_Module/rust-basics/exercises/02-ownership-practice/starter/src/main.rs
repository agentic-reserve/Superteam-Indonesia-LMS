// Exercise 02: Ownership Practice
// Complete the functions below to demonstrate ownership, borrowing, and lifetimes

fn main() {
    println!("=== Ownership Practice ===\n");
    
    // 1. Taking Ownership
    println!("1. Taking Ownership:");
    let s1 = String::from("Hello, World!");
    // TODO: Call take_ownership with s1 and print the length
    // TODO: Try to use s1 after this - what happens?
    println!("   (String is now consumed and cannot be used)\n");
    
    // 2. Borrowing (Immutable Reference)
    println!("2. Borrowing (Immutable Reference):");
    let s2 = String::from("Hello, Rust World!");
    // TODO: Call borrow_string with a reference to s2
    // TODO: Print s2 after borrowing to show it's still usable
    println!();
    
    // 3. Mutable Borrowing
    println!("3. Mutable Borrowing:");
    let mut s3 = String::from("Hello");
    println!("   Before modification: {}", s3);
    // TODO: Call modify_string with a mutable reference to s3 and ", Rust!"
    // TODO: Print s3 after modification
    println!();
    
    // 4. String Slices
    println!("4. String Slices:");
    let s4 = "Rust programming language";
    println!("   Full text: {}", s4);
    // TODO: Call first_word with s4 and print the result
    println!();
    
    // 5. Creating New Strings
    println!("5. Creating New Strings:");
    // TODO: Call create_greeting with a name and print the result
}

// TODO: Implement this function
// Takes ownership of a String and returns its length
// After calling this function, the original string cannot be used
fn take_ownership(s: String) -> usize {
    // Hint: Use s.len() to get the length
    // The string is automatically dropped when this function ends
    0 // Replace this with your implementation
}

// TODO: Implement this function
// Borrows a String (immutable reference) and returns its length
// The original string can still be used after calling this function
fn borrow_string(s: &String) -> usize {
    // Hint: Use s.len() to get the length
    // We're only reading the string, not taking ownership
    0 // Replace this with your implementation
}

// TODO: Implement this function
// Takes a mutable reference to a String and appends the suffix
// Modifies the string in place
fn modify_string(s: &mut String, suffix: &str) {
    // Hint: Use s.push_str(suffix) to append text
    // The &mut allows us to modify the string
}

// TODO: Implement this function
// Returns a string slice containing the first word
// A word is defined as text before the first space
fn first_word(s: &str) -> &str {
    // Hint: Convert string to bytes and iterate to find the first space
    // Hint: Return a slice from the beginning to the space position
    // Hint: If no space is found, return the entire string
    
    // Simple approach: use split_whitespace()
    // Advanced approach: iterate through bytes to find the first space
    
    "" // Replace this with your implementation
}

// TODO: Implement this function
// Creates and returns a new String with a greeting message
// Returns ownership of the new String
fn create_greeting(name: &str) -> String {
    // Hint: Use format!() macro to create a formatted string
    // Hint: Or use String::from() and push_str()
    // Example: format!("Hello, {}! Welcome to Rust.", name)
    
    String::new() // Replace this with your implementation
}
