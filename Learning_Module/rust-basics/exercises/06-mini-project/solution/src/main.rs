// Task Manager CLI - Main Entry Point

mod error;
mod manager;
mod storage;
mod task;

use error::TaskError;
use manager::TaskManager;
use storage::{FileStorage, Storage};
use task::{Priority, Status, Task};

use std::collections::HashMap;
use std::io::{self, Write};
use std::str::FromStr;

fn main() {
    println!("=== Task Manager CLI ===");
    println!("Type 'help' for available commands\n");

    let mut manager = TaskManager::new();
    let storage = FileStorage::new("tasks.txt".to_string());

    // Load existing tasks
    match storage.load() {
        Ok(tasks) => {
            manager.load_tasks_with_id_update(tasks);
            if manager.count() > 0 {
                println!("✓ Loaded {} tasks from storage\n", manager.count());
            }
        }
        Err(e) => {
            println!("⚠ Could not load tasks: {}\n", e);
        }
    }

    loop {
        print!("> ");
        io::stdout().flush().unwrap();

        let mut input = String::new();
        io::stdin()
            .read_line(&mut input)
            .expect("Failed to read line");

        let input = input.trim();
        if input.is_empty() {
            continue;
        }

        let parts: Vec<&str> = input.split_whitespace().collect();
        let result = match parts.get(0) {
            Some(&"add") => handle_add_command(&mut manager, &parts[1..]),
            Some(&"list") => {
                handle_list_command(&manager, &parts[1..]);
                Ok(())
            }
            Some(&"show") => handle_show_command(&manager, &parts[1..]),
            Some(&"update") => handle_update_command(&mut manager, &parts[1..]),
            Some(&"complete") => handle_complete_command(&mut manager, &parts[1..]),
            Some(&"delete") => handle_delete_command(&mut manager, &parts[1..]),
            Some(&"stats") => {
                handle_stats_command(&manager);
                Ok(())
            }
            Some(&"help") => {
                show_help();
                Ok(())
            }
            Some(&"quit") | Some(&"exit") => break,
            _ => {
                println!("✗ Unknown command. Type 'help' for available commands.");
                Ok(())
            }
        };

        if let Err(e) = result {
            println!("✗ Error: {}", e);
        } else if matches!(parts.get(0), Some(&"add") | Some(&"update") | Some(&"complete") | Some(&"delete")) {
            // Save after modifications
            if let Err(e) = storage.save(manager.list_tasks()) {
                println!("⚠ Warning: Could not save tasks: {}", e);
            }
        }
    }

    println!("Goodbye!");
}

fn handle_add_command(manager: &mut TaskManager<Task>, args: &[&str]) -> Result<(), TaskError> {
    if args.len() < 2 {
        return Err(TaskError::ValidationError(
            "Usage: add <title> <priority> [category]".to_string(),
        ));
    }

    let title = args[0].to_string();
    let priority = Priority::from_str(args[1])?;
    let category = args.get(2).map(|s| s.to_string());

    let id = manager.count() as u32 + 1;
    let mut task = Task::new(id, title, priority)?;
    if let Some(cat) = category {
        task = task.with_category(cat);
    }

    manager.add_task(task.clone());
    println!("✓ Task #{} created: {} [{}]", id, task.title, task.priority);

    Ok(())
}

fn handle_list_command(manager: &TaskManager<Task>, args: &[&str]) {
    let tasks = manager.list_tasks();

    // Parse filters
    let mut status_filter: Option<Status> = None;
    let mut priority_filter: Option<Priority> = None;
    let mut category_filter: Option<String> = None;

    for arg in args {
        if let Some(value) = arg.strip_prefix("status=") {
            status_filter = Status::from_str(value).ok();
        } else if let Some(value) = arg.strip_prefix("priority=") {
            priority_filter = Priority::from_str(value).ok();
        } else if let Some(value) = arg.strip_prefix("category=") {
            category_filter = Some(value.to_string());
        }
    }

    let filtered: Vec<&Task> = tasks
        .iter()
        .filter(|t| {
            if let Some(ref s) = status_filter {
                if &t.status != s {
                    return false;
                }
            }
            if let Some(ref p) = priority_filter {
                if &t.priority != p {
                    return false;
                }
            }
            if let Some(ref c) = category_filter {
                if t.category.as_ref() != Some(c) {
                    return false;
                }
            }
            true
        })
        .collect();

    if filtered.is_empty() {
        println!("No tasks found.");
    } else {
        println!("Tasks ({}):", filtered.len());
        for task in filtered {
            println!("  {}", task);
        }
    }
}

fn handle_show_command(manager: &TaskManager<Task>, args: &[&str]) -> Result<(), TaskError> {
    if args.is_empty() {
        return Err(TaskError::ValidationError(
            "Usage: show <id>".to_string(),
        ));
    }

    let id: u32 = args[0]
        .parse()
        .map_err(|_| TaskError::ParseError("Invalid task ID".to_string()))?;

    let task = manager
        .get_task_by_id(id)
        .ok_or(TaskError::NotFound(id))?;

    println!("Task #{}:", task.id);
    println!("  Title: {}", task.title);
    println!("  Status: {}", task.status);
    println!("  Priority: {}", task.priority);
    println!(
        "  Category: {}",
        task.category.as_deref().unwrap_or("None")
    );
    println!(
        "  Description: {}",
        task.description.as_deref().unwrap_or("None")
    );
    println!("  Created: {}", task.created_at);

    Ok(())
}

fn handle_update_command(
    manager: &mut TaskManager<Task>,
    args: &[&str],
) -> Result<(), TaskError> {
    if args.len() < 3 {
        return Err(TaskError::ValidationError(
            "Usage: update <id> <field> <value>".to_string(),
        ));
    }

    let id: u32 = args[0]
        .parse()
        .map_err(|_| TaskError::ParseError("Invalid task ID".to_string()))?;

    let task = manager
        .get_task_by_id_mut(id)
        .ok_or(TaskError::NotFound(id))?;

    match args[1] {
        "status" => {
            let status = Status::from_str(args[2])?;
            task.set_status(status);
            println!("✓ Task #{} updated: status = {}", id, args[2]);
        }
        "priority" => {
            let priority = Priority::from_str(args[2])?;
            task.set_priority(priority);
            println!("✓ Task #{} updated: priority = {}", id, args[2]);
        }
        "title" => {
            task.title = args[2..].join(" ");
            println!("✓ Task #{} updated: title = {}", id, task.title);
        }
        _ => {
            return Err(TaskError::ValidationError(format!(
                "Unknown field: {}. Valid fields: status, priority, title",
                args[1]
            )));
        }
    }

    Ok(())
}

fn handle_complete_command(
    manager: &mut TaskManager<Task>,
    args: &[&str],
) -> Result<(), TaskError> {
    if args.is_empty() {
        return Err(TaskError::ValidationError(
            "Usage: complete <id>".to_string(),
        ));
    }

    let id: u32 = args[0]
        .parse()
        .map_err(|_| TaskError::ParseError("Invalid task ID".to_string()))?;

    let task = manager
        .get_task_by_id_mut(id)
        .ok_or(TaskError::NotFound(id))?;

    task.set_status(Status::Completed);
    println!("✓ Task #{} marked as completed", id);

    Ok(())
}

fn handle_delete_command(
    manager: &mut TaskManager<Task>,
    args: &[&str],
) -> Result<(), TaskError> {
    if args.is_empty() {
        return Err(TaskError::ValidationError(
            "Usage: delete <id>".to_string(),
        ));
    }

    let id: u32 = args[0]
        .parse()
        .map_err(|_| TaskError::ParseError("Invalid task ID".to_string()))?;

    manager.remove_task_by_id(id)?;
    println!("✓ Task #{} deleted", id);

    Ok(())
}

fn handle_stats_command(manager: &TaskManager<Task>) {
    let tasks = manager.list_tasks();

    if tasks.is_empty() {
        println!("No tasks to show statistics for.");
        return;
    }

    let total = tasks.len();
    let pending = tasks.iter().filter(|t| t.status == Status::Pending).count();
    let in_progress = tasks
        .iter()
        .filter(|t| t.status == Status::InProgress)
        .count();
    let completed = tasks
        .iter()
        .filter(|t| t.status == Status::Completed)
        .count();

    let mut by_priority: HashMap<Priority, usize> = HashMap::new();
    for task in tasks {
        *by_priority.entry(task.priority.clone()).or_insert(0) += 1;
    }

    println!("=== Task Statistics ===");
    println!("Total Tasks: {}", total);
    println!("  Pending: {}", pending);
    println!("  In Progress: {}", in_progress);
    println!("  Completed: {}", completed);
    println!();
    println!("By Priority:");
    println!("  Critical: {}", by_priority.get(&Priority::Critical).unwrap_or(&0));
    println!("  High: {}", by_priority.get(&Priority::High).unwrap_or(&0));
    println!("  Medium: {}", by_priority.get(&Priority::Medium).unwrap_or(&0));
    println!("  Low: {}", by_priority.get(&Priority::Low).unwrap_or(&0));
}

fn show_help() {
    println!("Available commands:");
    println!("  add <title> <priority> [category]  - Add a new task");
    println!("                                       Priority: low, medium, high, critical");
    println!("  list [filter]                      - List all tasks");
    println!("                                       Filters: status=<status>, priority=<priority>, category=<category>");
    println!("  show <id>                          - Show detailed task information");
    println!("  update <id> <field> <value>        - Update task field (status, priority, title)");
    println!("  complete <id>                      - Mark task as completed");
    println!("  delete <id>                        - Delete a task");
    println!("  stats                              - Show task statistics");
    println!("  help                               - Show this help message");
    println!("  quit                               - Exit the application");
}
