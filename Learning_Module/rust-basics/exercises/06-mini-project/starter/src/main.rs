// Task Manager CLI - Main Entry Point
// This is the main file that runs the command-line interface

mod error;
mod task;
mod storage;
mod manager;

use error::TaskError;
use task::{Task, Priority, Status};
use storage::{Storage, FileStorage};
use manager::TaskManager;

use std::io::{self, Write};

fn main() {
    println!("=== Task Manager CLI ===");
    println!("Type 'help' for available commands\n");

    // TODO: Initialize TaskManager
    // TODO: Initialize FileStorage with a file path (e.g., "tasks.txt")
    // TODO: Load existing tasks from storage (handle errors gracefully)

    // Main command loop
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

        // TODO: Parse the command and arguments
        // TODO: Use match to handle different commands:
        //   - "add <title> <priority> [category]"
        //   - "list [filter]"
        //   - "show <id>"
        //   - "update <id> <field> <value>"
        //   - "complete <id>"
        //   - "delete <id>"
        //   - "stats"
        //   - "help"
        //   - "quit"

        // TODO: Handle each command and display results
        // TODO: Save tasks after modifications
        // TODO: Handle errors and display user-friendly messages

        // Example command parsing structure:
        // let parts: Vec<&str> = input.split_whitespace().collect();
        // match parts.get(0) {
        //     Some(&"add") => { /* handle add */ },
        //     Some(&"list") => { /* handle list */ },
        //     Some(&"quit") => break,
        //     _ => println!("Unknown command. Type 'help' for available commands."),
        // }
    }

    println!("Goodbye!");
}

// TODO: Implement helper functions for each command:
// fn handle_add_command(manager: &mut TaskManager<Task>, args: &[&str]) -> Result<(), TaskError>
// fn handle_list_command(manager: &TaskManager<Task>, args: &[&str])
// fn handle_show_command(manager: &TaskManager<Task>, id: u32) -> Result<(), TaskError>
// fn handle_update_command(manager: &mut TaskManager<Task>, args: &[&str]) -> Result<(), TaskError>
// fn handle_complete_command(manager: &mut TaskManager<Task>, id: u32) -> Result<(), TaskError>
// fn handle_delete_command(manager: &mut TaskManager<Task>, id: u32) -> Result<(), TaskError>
// fn handle_stats_command(manager: &TaskManager<Task>)
// fn show_help()
