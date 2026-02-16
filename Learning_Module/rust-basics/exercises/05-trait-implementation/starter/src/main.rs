use std::fmt;

// TODO: Define the Item trait with methods:
// - name(&self) -> &str
// - value(&self) -> u32
// - weight(&self) -> f32
// - description(&self) -> String

// TODO: Define the Stackable trait with methods:
// - max_stack_size(&self) -> u32
// - stack_value(&self, quantity: u32) -> u32

// TODO: Define the Serializable trait with methods:
// - serialize(&self) -> String
// - type_name(&self) -> &str

// TODO: Define Weapon struct with fields:
// - name: String
// - damage: u32
// - value: u32
// - weight: f32
// Derive Debug and Clone

// TODO: Define Potion struct with fields:
// - name: String
// - healing: u32
// - value: u32
// - quantity: u32
// Derive Debug and Clone

// TODO: Define Material struct with fields:
// - name: String
// - value: u32
// - weight: f32
// - quantity: u32
// Derive Debug and Clone

// TODO: Implement Item trait for Weapon

// TODO: Implement Item trait for Potion

// TODO: Implement Item trait for Material

// TODO: Implement Stackable trait for Potion (max_stack_size: 99)

// TODO: Implement Stackable trait for Material (max_stack_size: 999)

// TODO: Implement Display trait for Weapon
// Format: "Name (Damage: X, Value: Y coins, Weight: Z kg)"

// TODO: Implement Display trait for Potion
// Format: "Name (Healing: X, Value: Y coins, Quantity: Z)"

// TODO: Implement Display trait for Material
// Format: "Name (Value: X coins, Weight: Y kg, Quantity: Z)"

// TODO: Implement Serializable trait for Weapon
// Format: "Weapon{name:X,damage:Y,value:Z,weight:W}"

// TODO: Implement Serializable trait for Potion
// Format: "Potion{name:X,healing:Y,value:Z,quantity:W}"

// TODO: Implement Serializable trait for Material
// Format: "Material{name:X,value:Y,weight:Z,quantity:W}"

// TODO: Define generic Inventory<T> struct where T: Item + Clone
// Fields:
// - items: Vec<T>
// - max_weight: f32

// TODO: Implement methods for Inventory<T>:
// - new(max_weight: f32) -> Self
// - add_item(&mut self, item: T) -> Result<(), String>
//   (check if adding item would exceed max_weight)
// - total_weight(&self) -> f32
// - total_value(&self) -> u32
// - count(&self) -> usize
// - find_by_name(&self, name: &str) -> Option<&T>

// TODO: Implement generic function display_item_info<T: Item>(item: &T)
// Print: name, value, weight, and description

// TODO: Implement generic function most_valuable<T: Item + Clone>(items: &[T]) -> Option<T>
// Return the item with the highest value, or None if empty

fn main() {
    println!("=== Inventory Management System ===\n");

    // TODO: Create sample items
    // - Weapon: Sword (damage: 50, value: 100, weight: 5.0)
    // - Weapon: Axe (damage: 60, value: 150, weight: 7.0)
    // - Weapon: Greatsword (damage: 80, value: 200, weight: 10.0)
    // - Potion: Health Potion (healing: 50, value: 25, quantity: 10)
    // - Potion: Mana Potion (healing: 30, value: 30, quantity: 5)
    // - Material: Iron Ore (value: 10, weight: 2.0, quantity: 50)
    // - Material: Wood (value: 5, weight: 1.0, quantity: 100)

    println!("--- Creating Items ---");
    // TODO: Print created items using Display trait

    // TODO: Create weapon inventory with max_weight: 15.0
    println!("\n--- Weapon Inventory ---");
    // TODO: Add Sword (should succeed)
    // TODO: Add Axe (should succeed)
    // TODO: Add Greatsword (should fail - exceeds weight)
    // TODO: Print inventory status (count, total_weight, total_value)
    // TODO: Find and print most valuable weapon

    // TODO: Create potion inventory with max_weight: 5.0
    println!("\n--- Potion Inventory ---");
    // TODO: Add Health Potion (should succeed)
    // TODO: Add Mana Potion (should succeed)
    // TODO: Print inventory status
    // TODO: Demonstrate stack_value for Health Potion

    // TODO: Create material inventory with max_weight: 200.0
    println!("\n--- Material Inventory ---");
    // TODO: Add Iron Ore (should succeed)
    // TODO: Add Wood (should succeed)
    // TODO: Print inventory status

    // TODO: Demonstrate display_item_info with different item types
    println!("\n--- Item Details ---");

    // TODO: Demonstrate serialization for all item types
    println!("\n--- Serialization ---");

    // TODO: Demonstrate find_by_name (both found and not found)
    println!("\n--- Finding Items ---");

    println!("\n=== All tests completed ===");
}
