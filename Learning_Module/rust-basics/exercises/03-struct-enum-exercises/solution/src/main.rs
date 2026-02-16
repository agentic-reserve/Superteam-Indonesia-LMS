// Exercise 03: Struct and Enum Exercises - Solution
// Build an inventory management system using structs, enums, and pattern matching

// Define the ItemType enum with different variants
#[derive(Debug, Clone)]
enum ItemType {
    Weapon { damage: u32 },
    Armor { defense: u32 },
    Consumable { healing: u32 },
    Quest,
}

// Define the Item struct
#[derive(Debug, Clone)]
struct Item {
    name: String,
    item_type: ItemType,
    quantity: u32,
    value: u32,
}

// Implement methods on Item
impl Item {
    // Associated function (constructor)
    fn new(name: String, item_type: ItemType, quantity: u32, value: u32) -> Self {
        Self {
            name,
            item_type,
            quantity,
            value,
        }
    }
    
    // Calculate total value (value * quantity)
    fn total_value(&self) -> u32 {
        self.value * self.quantity
    }
    
    // Return a formatted description
    fn description(&self) -> String {
        let type_name = get_item_type_name(&self.item_type);
        format!(
            "{} ({}) - Quantity: {}, Value: {} gold, Total: {} gold",
            self.name,
            type_name,
            self.quantity,
            self.value,
            self.total_value()
        )
    }
}

// Define the InventoryAction enum
#[derive(Debug)]
enum InventoryAction {
    Add { item: Item },
    Remove { name: String, quantity: u32 },
    Use { name: String },
    List,
}

// Process inventory actions using pattern matching
fn process_action(action: InventoryAction, inventory: &mut Vec<Item>) {
    match action {
        InventoryAction::Add { item } => {
            // Check if item already exists
            if let Some(existing_item) = inventory.iter_mut().find(|i| i.name == item.name) {
                existing_item.quantity += item.quantity;
                println!("Added {} {}(s) to existing stack", item.quantity, item.name);
            } else {
                println!("Added new item: {}", item.name);
                inventory.push(item);
            }
        }
        
        InventoryAction::Remove { name, quantity } => {
            if let Some(item) = inventory.iter_mut().find(|i| i.name == name) {
                if item.quantity >= quantity {
                    item.quantity -= quantity;
                    println!("Removed {} {}(s)", quantity, name);
                    
                    // Remove item if quantity reaches 0
                    if item.quantity == 0 {
                        inventory.retain(|i| i.name != name);
                        println!("{} removed from inventory (quantity reached 0)", name);
                    }
                } else {
                    println!("Cannot remove {} {}(s) - only {} available", quantity, name, item.quantity);
                }
            } else {
                println!("Item '{}' not found in inventory", name);
            }
        }
        
        InventoryAction::Use { name } => {
            if let Some(item) = inventory.iter_mut().find(|i| i.name == name) {
                // Check if it's a consumable
                if let ItemType::Consumable { healing } = item.item_type {
                    if item.quantity > 0 {
                        item.quantity -= 1;
                        println!("{} used! Healed for {} HP. Remaining: {}", name, healing, item.quantity);
                        
                        // Remove if quantity reaches 0
                        if item.quantity == 0 {
                            inventory.retain(|i| i.name != name);
                            println!("{} removed from inventory (quantity reached 0)", name);
                        }
                    } else {
                        println!("No {} left to use", name);
                    }
                } else {
                    println!("{} is not a consumable item", name);
                }
            } else {
                println!("Item '{}' not found in inventory", name);
            }
        }
        
        InventoryAction::List => {
            if inventory.is_empty() {
                println!("Inventory is empty");
            } else {
                println!("\nCurrent Inventory:");
                for (index, item) in inventory.iter().enumerate() {
                    println!("{}. {}", index + 1, item.description());
                }
                
                let total_value: u32 = inventory.iter().map(|i| i.total_value()).sum();
                println!("\nTotal Inventory Value: {} gold", total_value);
            }
        }
    }
}

// Get the name of an item type using pattern matching
fn get_item_type_name(item_type: &ItemType) -> &str {
    match item_type {
        ItemType::Weapon { .. } => "Weapon",
        ItemType::Armor { .. } => "Armor",
        ItemType::Consumable { .. } => "Consumable",
        ItemType::Quest => "Quest Item",
    }
}

fn main() {
    println!("=== Inventory Management System ===\n");
    
    // Create inventory
    let mut inventory: Vec<Item> = Vec::new();
    
    // Create items with different types
    let sword = Item::new(
        String::from("Iron Sword"),
        ItemType::Weapon { damage: 25 },
        1,
        50
    );
    
    let armor = Item::new(
        String::from("Leather Armor"),
        ItemType::Armor { defense: 15 },
        1,
        75
    );
    
    let potion = Item::new(
        String::from("Health Potion"),
        ItemType::Consumable { healing: 50 },
        5,
        20
    );
    
    let quest_item = Item::new(
        String::from("Ancient Map"),
        ItemType::Quest,
        1,
        0
    );
    
    // Add items to inventory
    println!("Adding items to inventory...");
    process_action(InventoryAction::Add { item: sword }, &mut inventory);
    process_action(InventoryAction::Add { item: armor }, &mut inventory);
    process_action(InventoryAction::Add { item: potion }, &mut inventory);
    process_action(InventoryAction::Add { item: quest_item }, &mut inventory);
    
    // List inventory
    process_action(InventoryAction::List, &mut inventory);
    
    // Use a consumable item
    println!("\nUsing Health Potion...");
    process_action(InventoryAction::Use { name: String::from("Health Potion") }, &mut inventory);
    
    // Remove items
    println!("\nRemoving 2 Health Potions...");
    process_action(InventoryAction::Remove { 
        name: String::from("Health Potion"), 
        quantity: 2 
    }, &mut inventory);
    
    // List final inventory
    println!("\nFinal Inventory:");
    process_action(InventoryAction::List, &mut inventory);
    
    // Try to use a non-consumable item
    println!("\nTrying to use Iron Sword...");
    process_action(InventoryAction::Use { name: String::from("Iron Sword") }, &mut inventory);
    
    // Try to remove more items than available
    println!("\nTrying to remove 10 Health Potions...");
    process_action(InventoryAction::Remove { 
        name: String::from("Health Potion"), 
        quantity: 10 
    }, &mut inventory);
}
