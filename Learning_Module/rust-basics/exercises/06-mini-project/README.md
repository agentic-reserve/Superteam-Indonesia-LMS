# Exercise 06: Mini Project - Task Manager CLI

## Overview

This comprehensive mini-project integrates all the Rust concepts you've learned throughout the module. You'll build a command-line task management application that demonstrates variables, ownership, structs, enums, error handling, traits, generics, and modules—all the skills needed for Solana program development.

**Estimated Time:** 2-3 hours

## Learning Objectives

By completing this project, you will:

- Apply fundamental Rust concepts (variables, functions, control flow)
- Manage ownership and borrowing in a real application
- Design and use custom structs and enums
- Implement comprehensive error handling with custom error types
- Define and implement traits for different types
- Use generics to create reusable components
- Organize code with modules
- Build a complete, working application
- Apply patterns used in Solana program development

## Project Description

Create a command-line task management application with the following features:

1. **Task Management**: Create, list, update, complete, and delete tasks
2. **Priority System**: Assign priorities (Low, Medium, High, Critical)
3. **Categories**: Organize tasks by category
4. **Persistence**: Save and load tasks from a file
5. **Filtering**: Filter tasks by status, priority, or category
6. **Statistics**: Display task statistics and summaries
7. **Error Handling**: Handle all errors gracefully without panicking
8. **Validation**: Validate all user inputs

## Starter Code

A basic Rust project structure is provided in the `starter/` directory with:

- `Cargo.toml` - Project configuration
- `src/main.rs` - Entry point with TODO comments
- `src/task.rs` - Task-related types (to be implemented)
- `src/storage.rs` - File persistence (to be implemented)
- `src/error.rs` - Error types (to be implemented)

Navigate to the starter directory and run:

```bash
cd starter
cargo build
cargo run
```

## Implementation Requirements

### 1. Error Handling Module (`src/error.rs`)

Define a comprehensive error type:

```rust
#[derive(Debug)]
pub enum TaskError {
    IoError(std::io::Error),
    ParseError(String),
    ValidationError(String),
    NotFound(u32),  // Task ID
    InvalidPriority(String),
    InvalidStatus(String),
    SerializationError(String),
}
```

- Implement `Display` trait for user-friendly error messages
- Implement `From<std::io::Error>` for automatic conversion
- Implement `std::error::Error` trait

### 2. Task Module (`src/task.rs`)

**Priority Enum**:
```rust
#[derive(Debug, Clone, PartialEq)]
pub enum Priority {
    Low,
    Medium,
    High,
    Critical,
}
```

- Implement `Display` trait
- Implement `FromStr` trait for parsing from strings
- Derive `Debug`, `Clone`, `PartialEq`

**Status Enum**:
```rust
#[derive(Debug, Clone, PartialEq)]
pub enum Status {
    Pending,
    InProgress,
    Completed,
}
```

- Implement `Display` trait
- Implement `FromStr` trait
- Derive `Debug`, `Clone`, `PartialEq`

**Task Struct**:
```rust
#[derive(Debug, Clone)]
pub struct Task {
    pub id: u32,
    pub title: String,
    pub description: Option<String>,
    pub priority: Priority,
    pub status: Status,
    pub category: Option<String>,
    pub created_at: String,  // Simplified timestamp
}
```

- Implement `Display` trait for formatted output
- Implement validation in constructor
- Derive `Debug`, `Clone`

**Task Methods**:
- `new(id: u32, title: String, priority: Priority) -> Result<Task, TaskError>`
- `with_description(mut self, desc: String) -> Self`
- `with_category(mut self, category: String) -> Self`
- `set_status(&mut self, status: Status)`
- `set_priority(&mut self, priority: Priority)`
- `is_completed(&self) -> bool`
- `matches_filter(&self, filter: &TaskFilter) -> bool`

### 3. Traits for Serialization

**Serializable Trait**:
```rust
pub trait Serializable {
    fn serialize(&self) -> String;
    fn deserialize(data: &str) -> Result<Self, TaskError>
    where
        Self: Sized;
}
```

- Implement for `Task` using a simple format (e.g., CSV or custom format)
- Handle parsing errors gracefully

### 4. Task Manager with Generics

**TaskManager Struct**:
```rust
pub struct TaskManager<T: Serializable + Clone> {
    tasks: Vec<T>,
    next_id: u32,
}
```

- Generic over any type that implements `Serializable + Clone`
- Methods:
  - `new() -> Self`
  - `add_task(&mut self, task: T) -> u32`
  - `get_task(&self, id: u32) -> Option<&T>`
  - `get_task_mut(&mut self, id: u32) -> Option<&mut T>`
  - `remove_task(&mut self, id: u32) -> Result<T, TaskError>`
  - `list_tasks(&self) -> &[T]`
  - `count(&self) -> usize`

### 5. Filtering System

**TaskFilter Struct**:
```rust
pub struct TaskFilter {
    pub status: Option<Status>,
    pub priority: Option<Priority>,
    pub category: Option<String>,
}
```

- Implement builder pattern for easy filter construction
- Method: `matches(&self, task: &Task) -> bool`

### 6. Storage Module (`src/storage.rs`)

**Storage Trait**:
```rust
pub trait Storage<T> {
    fn save(&self, items: &[T]) -> Result<(), TaskError>;
    fn load(&self) -> Result<Vec<T>, TaskError>;
}
```

**FileStorage Struct**:
```rust
pub struct FileStorage {
    file_path: String,
}
```

- Implement `Storage<Task>` trait
- Handle file I/O errors
- Create file if it doesn't exist
- Use the `Serializable` trait for task conversion

### 7. Statistics Module

**TaskStats Struct**:
```rust
pub struct TaskStats {
    pub total: usize,
    pub pending: usize,
    pub in_progress: usize,
    pub completed: usize,
    pub by_priority: HashMap<Priority, usize>,
}
```

- Implement `From<&[Task]>` to calculate stats from task list
- Implement `Display` trait for formatted output

### 8. Main Application (`src/main.rs`)

Implement a command-line interface with the following commands:

- `add <title> <priority> [category]` - Add a new task
- `list [filter]` - List all tasks or filtered tasks
- `show <id>` - Show detailed task information
- `update <id> <field> <value>` - Update task field
- `complete <id>` - Mark task as completed
- `delete <id>` - Delete a task
- `stats` - Show task statistics
- `help` - Show available commands
- `quit` - Exit the application

**Requirements**:
- Use a loop to continuously accept commands
- Parse user input and handle invalid commands
- Use pattern matching for command dispatch
- Handle all errors gracefully with user-friendly messages
- Save tasks to file after each modification
- Load tasks from file on startup

## Validation Criteria

Your solution is correct when:

1. ✅ The program compiles without errors or warnings
2. ✅ All error types are defined with proper Display implementation
3. ✅ Priority and Status enums with FromStr implementation
4. ✅ Task struct with all required fields and methods
5. ✅ Serializable trait implemented for Task
6. ✅ TaskManager is generic and works with Task type
7. ✅ TaskFilter implements filtering logic correctly
8. ✅ Storage trait and FileStorage implementation work correctly
9. ✅ TaskStats calculates and displays statistics correctly
10. ✅ All CLI commands work as specified
11. ✅ Tasks persist across program restarts
12. ✅ No use of `unwrap()` or `panic!()` in production code
13. ✅ All user inputs are validated
14. ✅ Error messages are clear and actionable
15. ✅ Code is organized into modules

## Example Usage

```
=== Task Manager CLI ===
Type 'help' for available commands

> add "Implement user authentication" high backend
✓ Task #1 created: Implement user authentication [HIGH]

> add "Write documentation" medium docs
✓ Task #2 created: Write documentation [MEDIUM]

> add "Fix login bug" critical backend
✓ Task #3 created: Fix login bug [CRITICAL]

> list
Tasks (3):
  [1] [PENDING] [HIGH] Implement user authentication (backend)
  [2] [PENDING] [MEDIUM] Write documentation (docs)
  [3] [PENDING] [CRITICAL] Fix login bug (backend)

> update 1 status in_progress
✓ Task #1 updated: status = InProgress

> list status=in_progress
Tasks (1):
  [1] [IN_PROGRESS] [HIGH] Implement user authentication (backend)

> complete 3
✓ Task #3 marked as completed

> stats
=== Task Statistics ===
Total Tasks: 3
  Pending: 1
  In Progress: 1
  Completed: 1

By Priority:
  Critical: 1
  High: 1
  Medium: 1
  Low: 0

> show 1
Task #1:
  Title: Implement user authentication
  Status: InProgress
  Priority: High
  Category: backend
  Description: None
  Created: 2024-01-15 10:30:00

> delete 2
✓ Task #2 deleted

> list
Tasks (2):
  [1] [IN_PROGRESS] [HIGH] Implement user authentication (backend)
  [3] [COMPLETED] [CRITICAL] Fix login bug (backend)

> quit
Goodbye!
```

## Module Organization

Your project should be organized as follows:

```
src/
├── main.rs          # CLI interface and main loop
├── task.rs          # Task, Priority, Status types
├── error.rs         # Error types
├── storage.rs       # Storage trait and FileStorage
├── filter.rs        # TaskFilter implementation
├── stats.rs         # TaskStats implementation
└── manager.rs       # TaskManager generic type
```

Use `mod` declarations in `main.rs`:
```rust
mod task;
mod error;
mod storage;
mod filter;
mod stats;
mod manager;

use task::{Task, Priority, Status};
use error::TaskError;
// ... etc
```

## Hints

- Start with the error module - you'll use it everywhere
- Implement traits one at a time and test them
- Use `#[derive(Debug)]` liberally for debugging
- Test serialization/deserialization with simple examples first
- Use `match` for command parsing and error handling
- Keep functions small and focused
- Write helper functions for repetitive tasks
- Use `Result<T, TaskError>` for all fallible operations
- Test file operations with a temporary file first
- Use `trim()` to clean user input

## Testing Your Solution

Test all features systematically:

1. **Basic Operations**:
   - Add tasks with different priorities
   - List all tasks
   - Show individual task details
   - Update task fields
   - Complete tasks
   - Delete tasks

2. **Filtering**:
   - Filter by status
   - Filter by priority
   - Filter by category
   - Combine multiple filters

3. **Persistence**:
   - Add tasks and restart the program
   - Verify tasks are loaded correctly
   - Modify tasks and verify changes persist

4. **Error Handling**:
   - Try invalid commands
   - Try invalid task IDs
   - Try invalid priority/status values
   - Try empty titles
   - Verify error messages are helpful

5. **Edge Cases**:
   - Empty task list
   - Very long task titles
   - Special characters in input
   - Missing file on first run

## Extension Challenges (Optional)

If you finish early and want more practice:

1. **Add due dates**:
   - Use `chrono` crate for date handling
   - Add `due_date: Option<DateTime<Utc>>` to Task
   - Sort tasks by due date
   - Show overdue tasks

2. **Add tags**:
   - Add `tags: Vec<String>` to Task
   - Filter by tags
   - List all available tags

3. **Add subtasks**:
   - Add `subtasks: Vec<Task>` to Task
   - Track completion percentage
   - Nest task display

4. **Improve serialization**:
   - Use `serde` and `serde_json` for JSON format
   - Compare with your custom implementation

5. **Add search**:
   - Search tasks by title or description
   - Use regex for advanced search

6. **Add undo/redo**:
   - Track command history
   - Implement undo for last operation

7. **Add color output**:
   - Use `colored` crate
   - Color-code priorities
   - Highlight completed tasks

8. **Add task dependencies**:
   - Tasks can depend on other tasks
   - Prevent completing tasks with incomplete dependencies

9. **Add recurring tasks**:
   - Tasks that repeat daily/weekly/monthly
   - Automatically create new instances

10. **Add export/import**:
    - Export to CSV or JSON
    - Import from other formats

## Related Lessons

This project integrates concepts from all lessons:

- [Lesson 01: Fundamentals](../../01-fundamentals/README.md) - Variables, functions, control flow
- [Lesson 02: Ownership and Borrowing](../../02-ownership-borrowing/README.md) - Managing task data
- [Lesson 03: Structs and Enums](../../03-structs-enums/README.md) - Task, Priority, Status types
- [Lesson 04: Error Handling](../../04-error-handling/README.md) - TaskError and Result types
- [Lesson 05: Traits and Generics](../../05-traits-generics/README.md) - Serializable trait, generic TaskManager
- [Lesson 06: Modules and Cargo](../../06-modules-cargo/README.md) - Project organization

## Solana Context

The patterns you're implementing directly parallel Solana program development:

### Custom Types and Enums
```rust
// Your project
enum Priority { Low, Medium, High, Critical }
enum Status { Pending, InProgress, Completed }

// Solana program
#[derive(BorshSerialize, BorshDeserialize)]
pub enum InstructionType {
    Initialize,
    Transfer,
    Close,
}
```

### Error Handling
```rust
// Your project
enum TaskError {
    NotFound(u32),
    ValidationError(String),
}

// Solana program
#[error_code]
pub enum ErrorCode {
    #[msg("Account not found")]
    AccountNotFound,
    #[msg("Invalid amount")]
    InvalidAmount,
}
```

### Serialization Traits
```rust
// Your project
trait Serializable {
    fn serialize(&self) -> String;
    fn deserialize(data: &str) -> Result<Self, TaskError>;
}

// Solana/Anchor
use borsh::{BorshSerialize, BorshDeserialize};

#[account]
pub struct Task {
    pub id: u32,
    pub title: String,
    pub status: Status,
}
// Automatically implements Borsh serialization
```

### Generic Storage
```rust
// Your project
struct TaskManager<T: Serializable + Clone> {
    tasks: Vec<T>,
}

// Solana program
#[account]
pub struct Vault<T: BorshSerialize + BorshDeserialize> {
    pub items: Vec<T>,
    pub owner: Pubkey,
}
```

### Validation Patterns
```rust
// Your project
impl Task {
    pub fn new(title: String) -> Result<Task, TaskError> {
        if title.is_empty() {
            return Err(TaskError::ValidationError(
                "Title cannot be empty".to_string()
            ));
        }
        Ok(Task { title, /* ... */ })
    }
}

// Solana program
pub fn create_task(ctx: Context<CreateTask>, title: String) -> Result<()> {
    require!(!title.is_empty(), ErrorCode::EmptyTitle);
    
    let task = &mut ctx.accounts.task;
    task.title = title;
    task.owner = ctx.accounts.authority.key();
    
    Ok(())
}
```

### State Management
```rust
// Your project
impl TaskManager<Task> {
    pub fn add_task(&mut self, task: Task) -> u32 {
        let id = self.next_id;
        self.tasks.push(task);
        self.next_id += 1;
        id
    }
}

// Solana program
pub fn add_task(ctx: Context<AddTask>, title: String) -> Result<()> {
    let task_list = &mut ctx.accounts.task_list;
    
    let task = Task {
        id: task_list.next_id,
        title,
        status: Status::Pending,
    };
    
    task_list.tasks.push(task);
    task_list.next_id += 1;
    
    Ok(())
}
```

Both emphasize:
- Custom types for domain modeling
- Comprehensive error handling
- Serialization for data persistence
- Generic types for reusability
- Validation before state changes
- No panicking in production code
- Clear separation of concerns with modules

## Need Help?

If you're stuck:

1. Review the relevant lesson for each component you're implementing
2. Start with the simplest features and build up
3. Test each module independently before integrating
4. Use `println!` with `{:?}` for debugging
5. Check compiler error messages carefully
6. Make sure all error paths return `Result` types
7. Verify file operations work with a test file first
8. Check the solution in the `solution/` directory (but try on your own first!)

## Success Criteria

You've successfully completed this project when:

- ✅ All commands work correctly
- ✅ Tasks persist across restarts
- ✅ All errors are handled gracefully
- ✅ Code is well-organized into modules
- ✅ No compiler warnings
- ✅ User experience is smooth and intuitive
- ✅ You understand how each Rust concept contributes to the solution

Congratulations on completing the Rust Basics module! You now have the foundational Rust skills needed to begin learning Solana program development.

---

**Exercise Home**: [All Exercises](../README.md)  
**Next Steps**: [Rust for Solana](../../07-rust-for-solana/README.md) | [Anchor Framework](../../../basics/05-anchor-framework/README.md)

**Language:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
