use std::fmt;

// Custom error type for configuration errors
#[derive(Debug)]
enum ConfigError {
    ParseError { field: String, message: String },
    ValidationError { field: String, message: String },
    MissingField { field: String },
    InvalidRange { field: String, min: i32, max: i32, actual: i32 },
}

// Implement Display trait for user-friendly error messages
impl fmt::Display for ConfigError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            ConfigError::ParseError { field, message } => {
                write!(f, "Failed to parse field '{}': {}", field, message)
            }
            ConfigError::ValidationError { field, message } => {
                write!(f, "Validation failed for field '{}': {}", field, message)
            }
            ConfigError::MissingField { field } => {
                write!(f, "Missing required field: {}", field)
            }
            ConfigError::InvalidRange { field, min, max, actual } => {
                write!(
                    f,
                    "Field '{}' value {} is out of range (min: {}, max: {})",
                    field, actual, min, max
                )
            }
        }
    }
}

// Configuration struct with required and optional fields
#[derive(Debug)]
struct Config {
    server_name: String,
    port: u16,
    max_connections: u32,
    timeout_seconds: Option<u32>,
    admin_email: Option<String>,
}

// Parse port from string with validation
fn parse_port(value: &str) -> Result<u16, ConfigError> {
    // Parse string to u16
    let port = value.parse::<u16>().map_err(|e| ConfigError::ParseError {
        field: "port".to_string(),
        message: e.to_string(),
    })?;

    // Validate port is not zero
    if port == 0 {
        return Err(ConfigError::ValidationError {
            field: "port".to_string(),
            message: "Port cannot be zero".to_string(),
        });
    }

    Ok(port)
}

// Parse max_connections from string with range validation
fn parse_max_connections(value: &str) -> Result<u32, ConfigError> {
    // Parse string to u32
    let max_conn = value.parse::<u32>().map_err(|e| ConfigError::ParseError {
        field: "max_connections".to_string(),
        message: e.to_string(),
    })?;

    // Validate range (1 to 10000)
    if max_conn < 1 || max_conn > 10000 {
        return Err(ConfigError::InvalidRange {
            field: "max_connections".to_string(),
            min: 1,
            max: 10000,
            actual: max_conn as i32,
        });
    }

    Ok(max_conn)
}

// Parse optional timeout with validation
fn parse_timeout(value: Option<&str>) -> Result<Option<u32>, ConfigError> {
    // If None, return Ok(None)
    match value {
        None => Ok(None),
        Some(s) => {
            // Parse string to u32
            let timeout = s.parse::<u32>().map_err(|e| ConfigError::ParseError {
                field: "timeout_seconds".to_string(),
                message: e.to_string(),
            })?;

            // Validate range (1 to 3600)
            if timeout < 1 || timeout > 3600 {
                return Err(ConfigError::InvalidRange {
                    field: "timeout_seconds".to_string(),
                    min: 1,
                    max: 3600,
                    actual: timeout as i32,
                });
            }

            Ok(Some(timeout))
        }
    }
}

// Validate email format (simple check for @ and .)
fn validate_email(email: &str) -> Result<(), ConfigError> {
    if !email.contains('@') || !email.contains('.') {
        return Err(ConfigError::ValidationError {
            field: "admin_email".to_string(),
            message: "Email must contain '@' and '.'".to_string(),
        });
    }
    Ok(())
}

impl Config {
    // Create new Config with validation
    fn new(
        server_name: String,
        port: u16,
        max_connections: u32,
        timeout_seconds: Option<u32>,
        admin_email: Option<String>,
    ) -> Result<Config, ConfigError> {
        // Validate server_name is not empty
        if server_name.is_empty() {
            return Err(ConfigError::MissingField {
                field: "server_name".to_string(),
            });
        }

        // Validate port is not zero
        if port == 0 {
            return Err(ConfigError::ValidationError {
                field: "port".to_string(),
                message: "Port cannot be zero".to_string(),
            });
        }

        // Validate max_connections range
        if max_connections < 1 || max_connections > 10000 {
            return Err(ConfigError::InvalidRange {
                field: "max_connections".to_string(),
                min: 1,
                max: 10000,
                actual: max_connections as i32,
            });
        }

        // Validate timeout_seconds if present
        if let Some(timeout) = timeout_seconds {
            if timeout < 1 || timeout > 3600 {
                return Err(ConfigError::InvalidRange {
                    field: "timeout_seconds".to_string(),
                    min: 1,
                    max: 3600,
                    actual: timeout as i32,
                });
            }
        }

        // Validate admin_email if present
        if let Some(ref email) = admin_email {
            validate_email(email)?;
        }

        Ok(Config {
            server_name,
            port,
            max_connections,
            timeout_seconds,
            admin_email,
        })
    }

    // Create Config from string values with error propagation
    fn from_strings(
        server_name: &str,
        port_str: &str,
        max_conn_str: &str,
        timeout_str: Option<&str>,
        email: Option<&str>,
    ) -> Result<Config, ConfigError> {
        // Parse values using ? operator for error propagation
        let port = parse_port(port_str)?;
        let max_connections = parse_max_connections(max_conn_str)?;
        let timeout_seconds = parse_timeout(timeout_str)?;
        let admin_email = email.map(|e| e.to_string());

        // Create and validate config
        Config::new(
            server_name.to_string(),
            port,
            max_connections,
            timeout_seconds,
            admin_email,
        )
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

    // Test 1: Valid configuration with all fields
    println!("Test 1: Valid configuration");
    match Config::from_strings(
        "production-server",
        "8080",
        "1000",
        Some("30"),
        Some("admin@example.com"),
    ) {
        Ok(config) => {
            println!("✓ Config created successfully:");
            config.display();
        }
        Err(e) => println!("✗ Error: {}", e),
    }

    // Test 2: Invalid port (not a number)
    println!("\nTest 2: Invalid port (not a number)");
    match Config::from_strings("server", "abc", "100", None, None) {
        Ok(config) => {
            println!("✓ Config created successfully:");
            config.display();
        }
        Err(e) => println!("✗ Error: {}", e),
    }

    // Test 3: Invalid port (zero)
    println!("\nTest 3: Invalid port (zero)");
    match Config::from_strings("server", "0", "100", None, None) {
        Ok(config) => {
            println!("✓ Config created successfully:");
            config.display();
        }
        Err(e) => println!("✗ Error: {}", e),
    }

    // Test 4: Invalid max_connections (out of range)
    println!("\nTest 4: Invalid max_connections (out of range)");
    match Config::from_strings("server", "8080", "50000", None, None) {
        Ok(config) => {
            println!("✓ Config created successfully:");
            config.display();
        }
        Err(e) => println!("✗ Error: {}", e),
    }

    // Test 5: Invalid timeout (out of range)
    println!("\nTest 5: Invalid timeout (out of range)");
    match Config::from_strings("server", "8080", "100", Some("7200"), None) {
        Ok(config) => {
            println!("✓ Config created successfully:");
            config.display();
        }
        Err(e) => println!("✗ Error: {}", e),
    }

    // Test 6: Invalid email format
    println!("\nTest 6: Invalid email format");
    match Config::from_strings("server", "8080", "100", None, Some("invalid-email")) {
        Ok(config) => {
            println!("✓ Config created successfully:");
            config.display();
        }
        Err(e) => println!("✗ Error: {}", e),
    }

    // Test 7: Valid configuration with optional fields as None
    println!("\nTest 7: Valid configuration with optional fields as None");
    match Config::from_strings("dev-server", "3000", "100", None, None) {
        Ok(config) => {
            println!("✓ Config created successfully:");
            config.display();
        }
        Err(e) => println!("✗ Error: {}", e),
    }

    // Test 8: Missing server name (empty string)
    println!("\nTest 8: Missing server name");
    match Config::from_strings("", "8080", "100", None, None) {
        Ok(config) => {
            println!("✓ Config created successfully:");
            config.display();
        }
        Err(e) => println!("✗ Error: {}", e),
    }

    println!("\n=== All tests completed ===");
}
