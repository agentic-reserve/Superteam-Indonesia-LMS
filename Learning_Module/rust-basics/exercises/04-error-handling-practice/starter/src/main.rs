use std::fmt;

// TODO: Define the ConfigError enum with the following variants:
// - ParseError { field: String, message: String }
// - ValidationError { field: String, message: String }
// - MissingField { field: String }
// - InvalidRange { field: String, min: i32, max: i32, actual: i32 }
#[derive(Debug)]
enum ConfigError {
    ParseError { field: String, message: String },
    ValidationError { field: String, message: String },
    MissingField { field: String },
    InvalidRange { field: String, min: i32, max: i32, actual: i32 },
}

// TODO: Implement Display trait for ConfigError
// Format error messages in a user-friendly way
impl fmt::Display for ConfigError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        // Implement display formatting here
        write!(f, "ConfigError")
    }
}

// TODO: Define the Config struct with the following fields:
// - server_name: String
// - port: u16
// - max_connections: u32
// - timeout_seconds: Option<u32>
// - admin_email: Option<String>
#[derive(Debug)]
struct Config {
    server_name: String,
    port: u16,
    max_connections: u32,
    timeout_seconds: Option<u32>,
    admin_email: Option<String>,
}

// TODO: Implement parse_port function
// Parses a string into a u16 port number
// Returns ConfigError::ParseError if parsing fails
// Returns ConfigError::ValidationError if port is 0
fn parse_port(value: &str) -> Result<u16, ConfigError> {
    // Implement parsing and validation here
    todo!("Implement parse_port")
}

// TODO: Implement parse_max_connections function
// Parses a string into a u32
// Returns ConfigError::ParseError if parsing fails
// Returns ConfigError::InvalidRange if value is not between 1 and 10000
fn parse_max_connections(value: &str) -> Result<u32, ConfigError> {
    // Implement parsing and validation here
    todo!("Implement parse_max_connections")
}

// TODO: Implement parse_timeout function
// Returns Ok(None) if input is None
// Parses the string and returns Ok(Some(value)) if valid
// Returns ConfigError::ParseError if parsing fails
// Returns ConfigError::InvalidRange if value is not between 1 and 3600
fn parse_timeout(value: Option<&str>) -> Result<Option<u32>, ConfigError> {
    // Implement parsing and validation here
    todo!("Implement parse_timeout")
}

// TODO: Implement validate_email function
// Checks if email contains '@' and '.'
// Returns ConfigError::ValidationError if invalid
fn validate_email(email: &str) -> Result<(), ConfigError> {
    // Implement email validation here
    todo!("Implement validate_email")
}

impl Config {
    // TODO: Implement Config::new function
    // Validates all fields and returns Ok(Config) if valid
    // Returns appropriate ConfigError if validation fails
    fn new(
        server_name: String,
        port: u16,
        max_connections: u32,
        timeout_seconds: Option<u32>,
        admin_email: Option<String>,
    ) -> Result<Config, ConfigError> {
        // Implement validation and construction here
        todo!("Implement Config::new")
    }

    // TODO: Implement Config::from_strings function
    // Uses the parsing functions with ? operator
    // Calls Config::new to create and validate the config
    fn from_strings(
        server_name: &str,
        port_str: &str,
        max_conn_str: &str,
        timeout_str: Option<&str>,
        email: Option<&str>,
    ) -> Result<Config, ConfigError> {
        // Implement parsing and construction here using ? operator
        todo!("Implement Config::from_strings")
    }

    // Helper function to display config
    fn display(&self) {
        println!("  Server: {}", self.server_name);
        println!("  Port: {}", self.port);
        println!("  Max Connections: {}", self.max_connections);
        
        match self.timeout_seconds {
            Some(timeout) => println!("  Timeout: {} seconds", timeout),
            None => println!("  Timeout: Not set"),
        }
        
        match &self.admin_email {
            Some(email) => println!("  Admin Email: {}", email),
            None => println!("  Admin Email: Not set"),
        }
    }
}

fn main() {
    println!("=== Configuration Parser and Validator ===\n");

    // TODO: Test 1 - Valid configuration with all fields
    println!("Test 1: Valid configuration");
    // Implement test here

    // TODO: Test 2 - Invalid port (not a number)
    println!("\nTest 2: Invalid port (not a number)");
    // Implement test here

    // TODO: Test 3 - Invalid port (zero)
    println!("\nTest 3: Invalid port (zero)");
    // Implement test here

    // TODO: Test 4 - Invalid max_connections (out of range)
    println!("\nTest 4: Invalid max_connections (out of range)");
    // Implement test here

    // TODO: Test 5 - Invalid timeout (out of range)
    println!("\nTest 5: Invalid timeout (out of range)");
    // Implement test here

    // TODO: Test 6 - Invalid email format
    println!("\nTest 6: Invalid email format");
    // Implement test here

    // TODO: Test 7 - Valid configuration with optional fields as None
    println!("\nTest 7: Valid configuration with optional fields as None");
    // Implement test here

    // TODO: Test 8 - Missing server name (empty string)
    println!("\nTest 8: Missing server name");
    // Implement test here

    println!("\n=== All tests completed ===");
}
