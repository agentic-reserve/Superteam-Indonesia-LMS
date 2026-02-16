// Storage module for persisting tasks to file

use crate::error::TaskError;
use crate::task::{Serializable, Task};
use std::fs;
use std::path::Path;

pub trait Storage<T> {
    fn save(&self, items: &[T]) -> Result<(), TaskError>;
    fn load(&self) -> Result<Vec<T>, TaskError>;
}

pub struct FileStorage {
    file_path: String,
}

impl FileStorage {
    pub fn new(file_path: String) -> Self {
        FileStorage { file_path }
    }
}

impl Storage<Task> for FileStorage {
    fn save(&self, items: &[Task]) -> Result<(), TaskError> {
        let serialized: Vec<String> = items.iter().map(|task| task.serialize()).collect();
        let content = serialized.join("\n");
        fs::write(&self.file_path, content)?;
        Ok(())
    }

    fn load(&self) -> Result<Vec<Task>, TaskError> {
        if !Path::new(&self.file_path).exists() {
            return Ok(Vec::new());
        }

        let content = fs::read_to_string(&self.file_path)?;
        let mut tasks = Vec::new();

        for line in content.lines() {
            if line.trim().is_empty() {
                continue;
            }
            let task = Task::deserialize(line)?;
            tasks.push(task);
        }

        Ok(tasks)
    }
}
