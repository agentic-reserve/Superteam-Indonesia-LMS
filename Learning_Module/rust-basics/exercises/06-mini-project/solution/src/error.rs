// Error types for the Task Manager application

use std::fmt;

#[derive(Debug)]
pub enum TaskError {
    IoError(std::io::Error),
    ParseError(String),
    ValidationError(String),
    NotFound(u32),
    InvalidPriority(String),
    InvalidStatus(String),
    SerializationError(String),
}

impl fmt::Display for TaskError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            TaskError::IoError(err) => write!(f, "IO error: {}", err),
            TaskError::ParseError(msg) => write!(f, "Parse error: {}", msg),
            TaskError::ValidationError(msg) => write!(f, "Validation error: {}", msg),
            TaskError::NotFound(id) => write!(f, "Task #{} not found", id),
            TaskError::InvalidPriority(p) => write!(f, "Invalid priority: {}", p),
            TaskError::InvalidStatus(s) => write!(f, "Invalid status: {}", s),
            TaskError::SerializationError(msg) => write!(f, "Serialization error: {}", msg),
        }
    }
}

impl From<std::io::Error> for TaskError {
    fn from(err: std::io::Error) -> Self {
        TaskError::IoError(err)
    }
}

impl std::error::Error for TaskError {}
