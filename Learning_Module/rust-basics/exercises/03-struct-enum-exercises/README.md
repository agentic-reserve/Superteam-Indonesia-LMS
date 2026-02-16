# Exercise 03: Struct and Enum Exercises

## Overview

This exercise helps you practice structs, enums, and pattern matching concepts covered in [Lesson 03: Structs and Enums](../../03-structs-enums/README.md). You'll build a simple inventory management system that demonstrates how to define custom data types, implement methods, and use pattern matching to handle different scenarios—skills that are essential for Solana program development.

**Estimated Time:** 45-60 minutes

## Learning Objectives

By completing this exercise, you will:

- Define structs with named fields to represent complex data
- Create enums with different variant types
- Implement methods and associated functions on structs
- Use pattern matching with `match` to handle enum variants
- Apply `if let` for concise pattern matching
- Model data structures similar to those used in Solana programs
- Practice organizing related data and behavior

## Problem Description

Create an inventory management system for a game or application. Your system should:

1. Define an `Item` struct to represent inventory items
2. Define an `ItemType` enum to categorize different item types
3. Define an `InventoryAction` enum to represent different actions
4. Implement methods on the `Item` struct
5. Create functions that use pattern matching to process actions
6. Handle different item types with appropriate logic

## Starter Code

A basic Rust project template is provided in the `starter/` directory. The template includes:

- A `Cargo.toml` file with project configuration
- A `src/main.rs` file with struct and enum definitions and TODO comments

Navigate to the starter directory and run:

```bash
cd starter
cargo run
```

## Implementation Requirements

Your implementation should include:

1. **An `ItemType` enum** with the following variants:
   - `Weapon { damage: u32 }`
   - `Armor { defense: u32 }`
   - `Consumable { healing: u32 }`
   - `Quest`

2. **An `Item` struct** with the following fields:
   - `name: String`
   - `item_type: ItemType`
   - `quantity: u32`
   - `value: u32` (gold value)

3. **An `InventoryAction` enum** with the following variants:
   - `Add { item: Item }`
   - `Remove { name: String, quantity: u32 }`
   - `Use { name: String }`
   - `List`

4. **Methods on `Item`**:
   - `new(name: String, item_type: ItemType, quantity: u32, value: u32) -> Self` - Associated function (constructor)
   - `total_value(&self) -> u32` - Returns the total value (value × quantity)
   - `description(&self) -> String` - Returns a formatted description of the item

5. **A `process_action` function** that takes an `InventoryAction` and a mutable reference to a `Vec<Item>`:
   - Function signature: `fn process_action(action: InventoryAction, inventory: &mut Vec<Item>)`
   - Uses pattern matching to handle each action type
   - For `Add`: adds the item to inventory (or increases quantity if it exists)
   - For `Remove`: removes the specified quantity (or removes the item if quantity reaches 0)
   - For `Use`: uses a consumable item (decreases quantity by 1)
   - For `List`: prints all items in the inventory

6. **A `get_item_type_name` function** that returns a string describing the item type:
   - Function signature: `fn get_item_type_name(item_type: &ItemType) -> &str`
   - Uses pattern matching to return "Weapon", "Armor", "Consumable", or "Quest Item"

7. **A `main` function** that demonstrates:
   - Creating items of different types
   - Adding items to inventory
   - Listing inventory
   - Using items
   - Removing items

## Validation Criteria

Your solution is correct when:

1. ✅ The program compiles without errors or warnings
2. ✅ `ItemType` enum has all four variants with correct data
3. ✅ `Item` struct has all required fields
4. ✅ `InventoryAction` enum has all four variants
5. ✅ `Item::new()` correctly creates new items
6. ✅ `Item::total_value()` correctly calculates value × quantity
7. ✅ `Item::description()` returns a formatted string with item details
8. ✅ `process_action` correctly handles all action types using pattern matching
9. ✅ `get_item_type_name` returns correct names for all item types
10. ✅ The main function demonstrates all functionality with clear output

## Example Output

Your program should produce output similar to this:

```
=== Inventory Management System ===

Adding items to inventory...

Current Inventory:
1. Iron Sword (Weapon) - Quantity: 1, Value: 50 gold, Total: 50 gold
2. Leather Armor (Armor) - Quantity: 1, Value: 75 gold, Total: 75 gold
3. Health Potion (Consumable) - Quantity: 5, Value: 20 gold, Total: 100 gold
4. Ancient Map (Quest Item) - Quantity: 1, Value: 0 gold, Total: 0 gold

Total Inventory Value: 225 gold

Using Health Potion...
Health Potion used! Remaining: 4

Removing 2 Health Potions...
Removed 2 Health Potion(s)

Final Inventory:
1. Iron Sword (Weapon) - Quantity: 1, Value: 50 gold, Total: 50 gold
2. Leather Armor (Armor) - Quantity: 1, Value: 75 gold, Total: 75 gold
3. Health Potion (Consumable) - Quantity: 2, Value: 20 gold, Total: 40 gold
4. Ancient Map (Quest Item) - Quantity: 1, Value: 0 gold, Total: 0 gold

Total Inventory Value: 165 gold
```

## Hints

- Use `#[derive(Debug, Clone)]` on your structs and enums for easier debugging
- In `process_action`, use `match` to destructure the action and access its data
- For the `Add` action, check if an item with the same name already exists
- Use `Vec::iter_mut()` to find and modify existing items
- Use `Vec::retain()` to remove items with zero quantity
- The `format!()` macro is useful for creating formatted strings
- Remember to use `&` when pattern matching on references

## Pattern Matching Examples

Here are some pattern matching patterns you'll use:

```rust
// Matching enum variants with data
match item_type {
    ItemType::Weapon { damage } => println!("Damage: {}", damage),
    ItemType::Armor { defense } => println!("Defense: {}", defense),
    ItemType::Consumable { healing } => println!("Healing: {}", healing),
    ItemType::Quest => println!("Quest item"),
}

// Matching with if let for single case
if let ItemType::Consumable { healing } = item.item_type {
    println!("This heals for {}", healing);
}

// Destructuring in match arms
match action {
    InventoryAction::Add { item } => {
        // item is now available
    }
    InventoryAction::Remove { name, quantity } => {
        // name and quantity are now available
    }
    _ => {}
}
```

## Testing Your Solution

Run your program with:

```bash
cargo run
```

Test different scenarios:

1. Add multiple items of the same type (should increase quantity)
2. Remove more items than exist (should handle gracefully)
3. Use a non-consumable item (should show appropriate message)
4. List an empty inventory

## Extension Challenges (Optional)

If you finish early and want more practice:

1. **Add an `Inventory` struct** that wraps the `Vec<Item>` and implements methods:
   - `add_item(&mut self, item: Item)`
   - `remove_item(&mut self, name: &str, quantity: u32) -> Result<(), String>`
   - `use_item(&mut self, name: &str) -> Result<(), String>`
   - `total_value(&self) -> u32`

2. **Add item rarity** with an enum:
   - `enum Rarity { Common, Uncommon, Rare, Epic, Legendary }`
   - Modify value calculations based on rarity

3. **Implement item stacking rules**:
   - Quest items don't stack (quantity always 1)
   - Consumables stack up to 99
   - Weapons and armor don't stack

4. **Add item comparison**:
   - Implement `PartialEq` to compare items by name
   - Implement `PartialOrd` to sort items by value

5. **Add serialization**:
   - Use `serde` to save/load inventory to JSON
   - Practice with serialization traits like in Solana

## Related Lessons

This exercise reinforces concepts from:

- [Lesson 03: Structs and Enums](../../03-structs-enums/README.md) - Structs, enums, pattern matching, methods

## Solana Context

The patterns you're practicing are directly applicable to Solana development:

- **Structs for account data**: Just like `Item`, Solana accounts store structured data
- **Enums for instructions**: `InventoryAction` is similar to instruction enums in Solana programs
- **Pattern matching for instruction processing**: Solana programs use `match` to route instructions
- **Methods for business logic**: Account structs have methods for safe data manipulation
- **Associated functions**: Constructors like `Item::new()` are common in Solana programs

Example Solana parallel:

```rust
// Your exercise
enum InventoryAction {
    Add { item: Item },
    Remove { name: String, quantity: u32 },
}

// Solana program
enum TokenInstruction {
    Transfer { amount: u64 },
    Mint { amount: u64 },
}

// Both use pattern matching to process
match action {
    InventoryAction::Add { item } => { /* ... */ }
    InventoryAction::Remove { name, quantity } => { /* ... */ }
}

match instruction {
    TokenInstruction::Transfer { amount } => { /* ... */ }
    TokenInstruction::Mint { amount } => { /* ... */ }
}
```

## Need Help?

If you're stuck:

1. Review the relevant sections in [Lesson 03: Structs and Enums](../../03-structs-enums/README.md)
2. Check the compiler error messages - they often suggest fixes
3. Use `println!` with `{:?}` to debug struct and enum values
4. Make sure you're using `match` exhaustively (covering all cases)
5. Check the solution in the `solution/` directory (but try on your own first!)

---

**Exercise Home**: [All Exercises](../README.md)  
**Related Lesson**: [Structs and Enums](../../03-structs-enums/README.md)

**Language:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
