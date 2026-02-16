// Task-related types: Task, Priority, Status

use crate::error::TaskError;
use std::fmt;
use std::str::FromStr;

// TODO: Define Priority enum with variants: Low, Medium, High, Critical
// Derive Debug, Clone, PartialEq, Eq, Hash (for HashMap usage)
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum Priority {
    // TODO: Add variants
}

// TODO: Implement Display trait for Priority
impl fmt::Display for Priority {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        // TODO: Display priority as string (e.g., "LOW", "MEDIUM", "HIGH", "CRITICAL")
        write!(f, "Priority")
    }
}

// TODO: Implement FromStr trait for Priority
// This allows parsing strings like "low", "medium", "high", "critical" into Priority
impl FromStr for Priority {
    type Err = TaskError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        // TODO: Match on lowercase string and return appropriate Priority
        // Return TaskError::InvalidPriority if string doesn't match
        Err(TaskError::InvalidPriority(s.to_string()))
    }
}

// TODO: Define Status enum with variants: Pending, InProgress, Completed
// Derive Debug, Clone, PartialEq
#[derive(Debug, Clone, PartialEq)]
pub enum Status {
    // TODO: Add variants
}

// TODO: Implement Display trait for Status
impl fmt::Display for Status {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        // TODO: Display status as string
        write!(f, "Status")
    }
}

// TODO: Implement FromStr trait for Status
impl FromStr for Status {
    type Err = TaskError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        // TODO: Parse string to Status
        Err(TaskError::InvalidStatus(s.to_string()))
    }
}

// TODO: Define Task struct with fields:
// - id: u32
// - title: String
// - description: Option<String>
// - priority: Priority
// - status: Status
// - category: Option<String>
// - created_at: String
#[derive(Debug, Clone)]
pub struct Task {
    // TODO: Add fields
}

impl Task {
    // TODO: Implement constructor
    // pub fn new(id: u32, title: String, priority: Priority) -> Result<Task, TaskError> {
    //     // Validate title is not empty
    //     // Create task with default values for optional fields
    //     // Set created_at to current timestamp (simplified as string)
    // }

    // TODO: Implement builder methods
    // pub fn with_description(mut self, desc: String) -> Self { ... }
    // pub fn with_category(mut self, category: String) -> Self { ... }

    // TODO: Implement setter methods
    // pub fn set_status(&mut self, status: Status) { ... }
    // pub fn set_priority(&mut self, priority: Priority) { ... }

    // TODO: Implement query methods
    // pub fn is_completed(&self) -> bool { ... }
}

// TODO: Implement Display trait for Task
impl fmt::Display for Task {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        // TODO: Format task for display
        // Example: "[1] [PENDING] [HIGH] Task title (category)"
        write!(f, "Task")
    }
}

// TODO: Implement Serializable trait for Task
pub trait Serializable {
    fn serialize(&self) -> String;
    fn deserialize(data: &str) -> Result<Self, TaskError>
    where
        Self: Sized;
}

impl Serializable for Task {
    fn serialize(&self) -> String {
        // TODO: Convert task to string format
        // Example format: "id|title|description|priority|status|category|created_at"
        // Use "|" as delimiter, use "None" for Option::None values
        String::new()
    }

    fn deserialize(data: &str) -> Result<Self, TaskError> {
        // TODO: Parse string back to Task
        // Split by "|" delimiter
        // Parse each field
        // Handle Option fields (convert "None" string to None)
        // Return TaskError::SerializationError if parsing fails
        Err(TaskError::SerializationError("Not implemented".to_string()))
    }
}
