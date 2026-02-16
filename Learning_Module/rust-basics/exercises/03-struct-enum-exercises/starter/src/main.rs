// Exercise 03: Struct and Enum Exercises
// Build an inventory management system using structs, enums, and pattern matching

// TODO: Define the ItemType enum with the following variants:
// - Weapon { damage: u32 }
// - Armor { defense: u32 }
// - Consumable { healing: u32 }
// - Quest
#[derive(Debug, Clone)]
enum ItemType {
    // Add variants here
}

// TODO: Define the Item struct with the following fields:
// - name: String
// - item_type: ItemType
// - quantity: u32
// - value: u32
#[derive(Debug, Clone)]
struct Item {
    // Add fields here
}

// TODO: Implement methods on Item
impl Item {
    // TODO: Create a new() associated function (constructor)
    // fn new(name: String, item_type: ItemType, quantity: u32, value: u32) -> Self
    
    // TODO: Create a total_value() method that returns value * quantity
    // fn total_value(&self) -> u32
    
    // TODO: Create a description() method that returns a formatted string
    // fn description(&self) -> String
}

// TODO: Define the InventoryAction enum with the following variants:
// - Add { item: Item }
// - Remove { name: String, quantity: u32 }
// - Use { name: String }
// - List
#[derive(Debug)]
enum InventoryAction {
    // Add variants here
}

// TODO: Implement the process_action function
// This function should use pattern matching to handle each action type
fn process_action(action: InventoryAction, inventory: &mut Vec<Item>) {
    // TODO: Use match to handle each action:
    // - Add: Add item to inventory (or increase quantity if it exists)
    // - Remove: Remove specified quantity (or remove item if quantity reaches 0)
    // - Use: Use a consumable item (decrease quantity by 1)
    // - List: Print all items in inventory
}

// TODO: Implement the get_item_type_name function
// This function should return a string describing the item type
fn get_item_type_name(item_type: &ItemType) -> &str {
    // TODO: Use match to return the appropriate name
    // "Weapon", "Armor", "Consumable", or "Quest Item"
    "Unknown"
}

fn main() {
    println!("=== Inventory Management System ===\n");
    
    // TODO: Create a Vec<Item> to store the inventory
    let mut inventory: Vec<Item> = Vec::new();
    
    // TODO: Create some items with different types
    // Example:
    // let sword = Item::new(
    //     String::from("Iron Sword"),
    //     ItemType::Weapon { damage: 25 },
    //     1,
    //     50
    // );
    
    // TODO: Add items to inventory using process_action
    // Example:
    // process_action(InventoryAction::Add { item: sword }, &mut inventory);
    
    // TODO: List the inventory
    // process_action(InventoryAction::List, &mut inventory);
    
    // TODO: Use an item
    // process_action(InventoryAction::Use { name: String::from("Health Potion") }, &mut inventory);
    
    // TODO: Remove items
    // process_action(InventoryAction::Remove { name: String::from("Health Potion"), quantity: 2 }, &mut inventory);
    
    // TODO: List final inventory
    // process_action(InventoryAction::List, &mut inventory);
    
    println!("\nExercise complete! Implement the TODOs to see the full functionality.");
}
