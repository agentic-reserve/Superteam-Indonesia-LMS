// Error types for the Task Manager application

use std::fmt;

// TODO: Define the TaskError enum with the following variants:
// - IoError(std::io::Error)
// - ParseError(String)
// - ValidationError(String)
// - NotFound(u32)  // Task ID
// - InvalidPriority(String)
// - InvalidStatus(String)
// - SerializationError(String)

#[derive(Debug)]
pub enum TaskError {
    // TODO: Add error variants here
}

// TODO: Implement Display trait for TaskError
// This provides user-friendly error messages
impl fmt::Display for TaskError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        // TODO: Match on self and write appropriate error messages
        // Example:
        // match self {
        //     TaskError::NotFound(id) => write!(f, "Task #{} not found", id),
        //     TaskError::ValidationError(msg) => write!(f, "Validation error: {}", msg),
        //     // ... other variants
        // }
        write!(f, "TaskError")
    }
}

// TODO: Implement From<std::io::Error> for TaskError
// This allows automatic conversion from IO errors
// impl From<std::io::Error> for TaskError {
//     fn from(err: std::io::Error) -> Self {
//         TaskError::IoError(err)
//     }
// }

// TODO: Implement std::error::Error trait for TaskError
// impl std::error::Error for TaskError {}
