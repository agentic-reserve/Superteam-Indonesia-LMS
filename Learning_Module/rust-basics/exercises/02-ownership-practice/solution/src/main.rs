// Exercise 02: Ownership Practice - Reference Solution
// This solution demonstrates proper ownership, borrowing, and lifetime management

fn main() {
    println!("=== Ownership Practice ===\n");
    
    // 1. Taking Ownership
    println!("1. Taking Ownership:");
    let s1 = String::from("Hello, World!");
    let len = take_ownership(s1);
    println!("   Original string length: {}", len);
    // Note: s1 cannot be used here because ownership was moved
    println!("   (String is now consumed and cannot be used)\n");
    
    // 2. Borrowing (Immutable Reference)
    println!("2. Borrowing (Immutable Reference):");
    let s2 = String::from("Hello, Rust World!");
    let len = borrow_string(&s2);
    println!("   Borrowed string length: {}", len);
    // s2 can still be used because we only borrowed it
    println!("   Original string still usable: {}\n", s2);
    
    // 3. Mutable Borrowing
    println!("3. Mutable Borrowing:");
    let mut s3 = String::from("Hello");
    println!("   Before modification: {}", s3);
    modify_string(&mut s3, ", Rust!");
    println!("   After modification: {}\n", s3);
    
    // 4. String Slices
    println!("4. String Slices:");
    let s4 = "Rust programming language";
    println!("   Full text: {}", s4);
    let word = first_word(s4);
    println!("   First word: {}\n", word);
    
    // 5. Creating New Strings
    println!("5. Creating New Strings:");
    let greeting = create_greeting("Alice");
    println!("   Greeting: {}", greeting);
}

// Takes ownership of a String and returns its length
// After calling this function, the original string cannot be used
fn take_ownership(s: String) -> usize {
    let length = s.len();
    // s is dropped here when the function ends
    length
}

// Borrows a String (immutable reference) and returns its length
// The original string can still be used after calling this function
fn borrow_string(s: &String) -> usize {
    // We're only reading the string, not taking ownership
    s.len()
}

// Takes a mutable reference to a String and appends the suffix
// Modifies the string in place
fn modify_string(s: &mut String, suffix: &str) {
    // The &mut allows us to modify the string
    s.push_str(suffix);
}

// Returns a string slice containing the first word
// A word is defined as text before the first space
fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();
    
    // Iterate through the string to find the first space
    for (i, &byte) in bytes.iter().enumerate() {
        if byte == b' ' {
            // Return a slice from the beginning to the space
            return &s[0..i];
        }
    }
    
    // If no space is found, return the entire string
    &s[..]
}

// Creates and returns a new String with a greeting message
// Returns ownership of the new String
fn create_greeting(name: &str) -> String {
    // Use format! macro to create a formatted string
    format!("Hello, {}! Welcome to Rust.", name)
}
