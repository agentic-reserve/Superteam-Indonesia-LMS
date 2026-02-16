// Task Manager - Generic container for managing tasks

use crate::error::TaskError;
use crate::task::Serializable;

// TODO: Define TaskManager struct
// Generic over type T where T: Serializable + Clone
pub struct TaskManager<T: Serializable + Clone> {
    // TODO: Add fields:
    // tasks: Vec<T>
    // next_id: u32
    _phantom: std::marker::PhantomData<T>,
}

impl<T: Serializable + Clone> TaskManager<T> {
    // TODO: Implement constructor
    // pub fn new() -> Self { ... }

    // TODO: Implement add_task method
    // pub fn add_task(&mut self, task: T) -> u32 {
    //     // Add task to vector
    //     // Increment next_id
    //     // Return the ID that was used
    // }

    // TODO: Implement get_task method
    // pub fn get_task(&self, id: u32) -> Option<&T> {
    //     // Find task by ID
    //     // Return reference to task if found
    // }

    // TODO: Implement get_task_mut method
    // pub fn get_task_mut(&mut self, id: u32) -> Option<&mut T> {
    //     // Find task by ID
    //     // Return mutable reference to task if found
    // }

    // TODO: Implement remove_task method
    // pub fn remove_task(&mut self, id: u32) -> Result<T, TaskError> {
    //     // Find task index by ID
    //     // Remove and return task if found
    //     // Return TaskError::NotFound if not found
    // }

    // TODO: Implement list_tasks method
    // pub fn list_tasks(&self) -> &[T] {
    //     // Return slice of all tasks
    // }

    // TODO: Implement count method
    // pub fn count(&self) -> usize {
    //     // Return number of tasks
    // }

    // TODO: Implement load_tasks method
    // pub fn load_tasks(&mut self, tasks: Vec<T>) {
    //     // Replace current tasks with loaded tasks
    //     // Update next_id to be max(task IDs) + 1
    // }
}
