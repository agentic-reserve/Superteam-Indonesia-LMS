// Task-related types: Task, Priority, Status

use crate::error::TaskError;
use std::fmt;
use std::str::FromStr;

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum Priority {
    Low,
    Medium,
    High,
    Critical,
}

impl fmt::Display for Priority {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Priority::Low => write!(f, "LOW"),
            Priority::Medium => write!(f, "MEDIUM"),
            Priority::High => write!(f, "HIGH"),
            Priority::Critical => write!(f, "CRITICAL"),
        }
    }
}

impl FromStr for Priority {
    type Err = TaskError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "low" => Ok(Priority::Low),
            "medium" => Ok(Priority::Medium),
            "high" => Ok(Priority::High),
            "critical" => Ok(Priority::Critical),
            _ => Err(TaskError::InvalidPriority(s.to_string())),
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
pub enum Status {
    Pending,
    InProgress,
    Completed,
}

impl fmt::Display for Status {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Status::Pending => write!(f, "PENDING"),
            Status::InProgress => write!(f, "IN_PROGRESS"),
            Status::Completed => write!(f, "COMPLETED"),
        }
    }
}

impl FromStr for Status {
    type Err = TaskError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "pending" => Ok(Status::Pending),
            "in_progress" | "inprogress" => Ok(Status::InProgress),
            "completed" | "complete" => Ok(Status::Completed),
            _ => Err(TaskError::InvalidStatus(s.to_string())),
        }
    }
}

#[derive(Debug, Clone)]
pub struct Task {
    pub id: u32,
    pub title: String,
    pub description: Option<String>,
    pub priority: Priority,
    pub status: Status,
    pub category: Option<String>,
    pub created_at: String,
}

impl Task {
    pub fn new(id: u32, title: String, priority: Priority) -> Result<Task, TaskError> {
        if title.trim().is_empty() {
            return Err(TaskError::ValidationError(
                "Title cannot be empty".to_string(),
            ));
        }

        Ok(Task {
            id,
            title,
            description: None,
            priority,
            status: Status::Pending,
            category: None,
            created_at: Self::current_timestamp(),
        })
    }

    pub fn with_description(mut self, desc: String) -> Self {
        self.description = Some(desc);
        self
    }

    pub fn with_category(mut self, category: String) -> Self {
        self.category = Some(category);
        self
    }

    pub fn set_status(&mut self, status: Status) {
        self.status = status;
    }

    pub fn set_priority(&mut self, priority: Priority) {
        self.priority = priority;
    }

    pub fn is_completed(&self) -> bool {
        self.status == Status::Completed
    }

    fn current_timestamp() -> String {
        // Simplified timestamp - in real app would use chrono crate
        "2024-01-15 10:00:00".to_string()
    }
}

impl fmt::Display for Task {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let category = self
            .category
            .as_ref()
            .map(|c| format!(" ({})", c))
            .unwrap_or_default();
        write!(
            f,
            "[{}] [{}] [{}] {}{}",
            self.id, self.status, self.priority, self.title, category
        )
    }
}

pub trait Serializable {
    fn serialize(&self) -> String;
    fn deserialize(data: &str) -> Result<Self, TaskError>
    where
        Self: Sized;
}

impl Serializable for Task {
    fn serialize(&self) -> String {
        let desc = self
            .description
            .as_ref()
            .map(|d| d.as_str())
            .unwrap_or("None");
        let cat = self
            .category
            .as_ref()
            .map(|c| c.as_str())
            .unwrap_or("None");

        format!(
            "{}|{}|{}|{}|{}|{}|{}",
            self.id, self.title, desc, self.priority, self.status, cat, self.created_at
        )
    }

    fn deserialize(data: &str) -> Result<Self, TaskError> {
        let parts: Vec<&str> = data.split('|').collect();
        if parts.len() != 7 {
            return Err(TaskError::SerializationError(format!(
                "Expected 7 fields, got {}",
                parts.len()
            )));
        }

        let id = parts[0]
            .parse()
            .map_err(|_| TaskError::ParseError("Invalid ID".to_string()))?;
        let title = parts[1].to_string();
        let description = if parts[2] == "None" {
            None
        } else {
            Some(parts[2].to_string())
        };
        let priority = parts[3].parse()?;
        let status = parts[4].parse()?;
        let category = if parts[5] == "None" {
            None
        } else {
            Some(parts[5].to_string())
        };
        let created_at = parts[6].to_string();

        Ok(Task {
            id,
            title,
            description,
            priority,
            status,
            category,
            created_at,
        })
    }
}
