// Storage module for persisting tasks to file

use crate::error::TaskError;
use crate::task::{Task, Serializable};
use std::fs;
use std::path::Path;

// TODO: Define Storage trait
// Generic over type T
pub trait Storage<T> {
    // TODO: Add methods:
    // fn save(&self, items: &[T]) -> Result<(), TaskError>;
    // fn load(&self) -> Result<Vec<T>, TaskError>;
}

// TODO: Define FileStorage struct
pub struct FileStorage {
    // TODO: Add field: file_path: String
}

impl FileStorage {
    // TODO: Implement constructor
    // pub fn new(file_path: String) -> Self { ... }
}

// TODO: Implement Storage<Task> for FileStorage
impl Storage<Task> for FileStorage {
    fn save(&self, items: &[Task]) -> Result<(), TaskError> {
        // TODO: Serialize each task using Task::serialize()
        // TODO: Join serialized tasks with newlines
        // TODO: Write to file using fs::write()
        // TODO: Use ? operator for error propagation (From<io::Error> handles conversion)
        Ok(())
    }

    fn load(&self) -> Result<Vec<Task>, TaskError> {
        // TODO: Check if file exists using Path::new().exists()
        // TODO: If file doesn't exist, return Ok(Vec::new())
        // TODO: Read file contents using fs::read_to_string()
        // TODO: Split by newlines
        // TODO: Deserialize each line using Task::deserialize()
        // TODO: Filter out empty lines
        // TODO: Collect into Vec<Task>
        // TODO: Handle errors appropriately
        Ok(Vec::new())
    }
}
