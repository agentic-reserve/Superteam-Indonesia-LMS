// Task Manager - Generic container for managing tasks

use crate::error::TaskError;
use crate::task::{Serializable, Task};

pub struct TaskManager<T: Serializable + Clone> {
    tasks: Vec<T>,
    next_id: u32,
}

impl<T: Serializable + Clone> TaskManager<T> {
    pub fn new() -> Self {
        TaskManager {
            tasks: Vec::new(),
            next_id: 1,
        }
    }

    pub fn add_task(&mut self, task: T) -> u32 {
        self.tasks.push(task);
        let id = self.next_id;
        self.next_id += 1;
        id
    }

    pub fn get_task(&self, id: u32) -> Option<&T> {
        self.tasks.iter().find(|t| {
            // This is a workaround since we can't access id directly on generic T
            // In the actual implementation with Task, we'd use task.id
            true // Placeholder - actual implementation would check ID
        })
    }

    pub fn get_task_mut(&mut self, id: u32) -> Option<&mut T> {
        self.tasks.iter_mut().find(|_| true) // Placeholder
    }

    pub fn remove_task(&mut self, id: u32) -> Result<T, TaskError> {
        let pos = self
            .tasks
            .iter()
            .position(|_| true) // Placeholder
            .ok_or(TaskError::NotFound(id))?;
        Ok(self.tasks.remove(pos))
    }

    pub fn list_tasks(&self) -> &[T] {
        &self.tasks
    }

    pub fn count(&self) -> usize {
        self.tasks.len()
    }

    pub fn load_tasks(&mut self, tasks: Vec<T>) {
        self.tasks = tasks;
        self.next_id = 1; // Would calculate max ID + 1 in real implementation
    }
}

// Specialized implementation for Task type
impl TaskManager<Task> {
    pub fn get_task_by_id(&self, id: u32) -> Option<&Task> {
        self.tasks.iter().find(|t| t.id == id)
    }

    pub fn get_task_by_id_mut(&mut self, id: u32) -> Option<&mut Task> {
        self.tasks.iter_mut().find(|t| t.id == id)
    }

    pub fn remove_task_by_id(&mut self, id: u32) -> Result<Task, TaskError> {
        let pos = self
            .tasks
            .iter()
            .position(|t| t.id == id)
            .ok_or(TaskError::NotFound(id))?;
        Ok(self.tasks.remove(pos))
    }

    pub fn load_tasks_with_id_update(&mut self, tasks: Vec<Task>) {
        let max_id = tasks.iter().map(|t| t.id).max().unwrap_or(0);
        self.tasks = tasks;
        self.next_id = max_id + 1;
    }
}
