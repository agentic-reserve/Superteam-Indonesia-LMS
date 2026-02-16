use std::fmt;

// Define the Item trait
trait Item {
    fn name(&self) -> &str;
    fn value(&self) -> u32;
    fn weight(&self) -> f32;
    fn description(&self) -> String;
}

// Define the Stackable trait
trait Stackable {
    fn max_stack_size(&self) -> u32;
    fn stack_value(&self, quantity: u32) -> u32;
}

// Define the Serializable trait
trait Serializable {
    fn serialize(&self) -> String;
    fn type_name(&self) -> &str;
}

// Weapon struct
#[derive(Debug, Clone)]
struct Weapon {
    name: String,
    damage: u32,
    value: u32,
    weight: f32,
}

// Potion struct
#[derive(Debug, Clone)]
struct Potion {
    name: String,
    healing: u32,
    value: u32,
    quantity: u32,
}

// Material struct
#[derive(Debug, Clone)]
struct Material {
    name: String,
    value: u32,
    weight: f32,
    quantity: u32,
}

// Implement Item trait for Weapon
impl Item for Weapon {
    fn name(&self) -> &str {
        &self.name
    }

    fn value(&self) -> u32 {
        self.value
    }

    fn weight(&self) -> f32 {
        self.weight
    }

    fn description(&self) -> String {
        format!("A sharp {} with {} damage", self.name.to_lowercase(), self.damage)
    }
}

// Implement Item trait for Potion
impl Item for Potion {
    fn name(&self) -> &str {
        &self.name
    }

    fn value(&self) -> u32 {
        self.value
    }

    fn weight(&self) -> f32 {
        0.02 * self.quantity as f32 // Each potion weighs 0.02 kg
    }

    fn description(&self) -> String {
        format!(
            "A healing potion that restores {} HP (Quantity: {})",
            self.healing, self.quantity
        )
    }
}

// Implement Item trait for Material
impl Item for Material {
    fn name(&self) -> &str {
        &self.name
    }

    fn value(&self) -> u32 {
        self.value
    }

    fn weight(&self) -> f32 {
        self.weight * self.quantity as f32
    }

    fn description(&self) -> String {
        format!(
            "Crafting material: {} (Quantity: {})",
            self.name, self.quantity
        )
    }
}

// Implement Stackable trait for Potion
impl Stackable for Potion {
    fn max_stack_size(&self) -> u32 {
        99
    }

    fn stack_value(&self, quantity: u32) -> u32 {
        self.value * quantity
    }
}

// Implement Stackable trait for Material
impl Stackable for Material {
    fn max_stack_size(&self) -> u32 {
        999
    }

    fn stack_value(&self, quantity: u32) -> u32 {
        self.value * quantity
    }
}

// Implement Display trait for Weapon
impl fmt::Display for Weapon {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "{} (Damage: {}, Value: {} coins, Weight: {} kg)",
            self.name, self.damage, self.value, self.weight
        )
    }
}

// Implement Display trait for Potion
impl fmt::Display for Potion {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "{} (Healing: {}, Value: {} coins, Quantity: {})",
            self.name, self.healing, self.value, self.quantity
        )
    }
}

// Implement Display trait for Material
impl fmt::Display for Material {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "{} (Value: {} coins, Weight: {} kg, Quantity: {})",
            self.name, self.value, self.weight, self.quantity
        )
    }
}

// Implement Serializable trait for Weapon
impl Serializable for Weapon {
    fn serialize(&self) -> String {
        format!(
            "Weapon{{name:{},damage:{},value:{},weight:{}}}",
            self.name, self.damage, self.value, self.weight
        )
    }

    fn type_name(&self) -> &str {
        "Weapon"
    }
}

// Implement Serializable trait for Potion
impl Serializable for Potion {
    fn serialize(&self) -> String {
        format!(
            "Potion{{name:{},healing:{},value:{},quantity:{}}}",
            self.name, self.healing, self.value, self.quantity
        )
    }

    fn type_name(&self) -> &str {
        "Potion"
    }
}

// Implement Serializable trait for Material
impl Serializable for Material {
    fn serialize(&self) -> String {
        format!(
            "Material{{name:{},value:{},weight:{},quantity:{}}}",
            self.name, self.value, self.weight, self.quantity
        )
    }

    fn type_name(&self) -> &str {
        "Material"
    }
}

// Generic Inventory struct
struct Inventory<T: Item + Clone> {
    items: Vec<T>,
    max_weight: f32,
}

// Implement methods for Inventory<T>
impl<T: Item + Clone> Inventory<T> {
    fn new(max_weight: f32) -> Self {
        Inventory {
            items: Vec::new(),
            max_weight,
        }
    }

    fn add_item(&mut self, item: T) -> Result<(), String> {
        let new_weight = self.total_weight() + item.weight();
        if new_weight > self.max_weight {
            return Err(format!(
                "Exceeds maximum weight ({:.1}/{:.1} kg)",
                new_weight, self.max_weight
            ));
        }
        self.items.push(item);
        Ok(())
    }

    fn total_weight(&self) -> f32 {
        self.items.iter().map(|item| item.weight()).sum()
    }

    fn total_value(&self) -> u32 {
        self.items.iter().map(|item| item.value()).sum()
    }

    fn count(&self) -> usize {
        self.items.len()
    }

    fn find_by_name(&self, name: &str) -> Option<&T> {
        self.items.iter().find(|item| item.name() == name)
    }
}

// Generic function to display item info
fn display_item_info<T: Item>(item: &T) {
    println!("Item: {}", item.name());
    println!("  Value: {} coins", item.value());
    println!("  Weight: {} kg", item.weight());
    println!("  Description: {}", item.description());
}

// Generic function to find most valuable item
fn most_valuable<T: Item + Clone>(items: &[T]) -> Option<T> {
    items
        .iter()
        .max_by_key(|item| item.value())
        .cloned()
}

fn main() {
    println!("=== Inventory Management System ===\n");

    // Create sample items
    let sword = Weapon {
        name: String::from("Sword"),
        damage: 50,
        value: 100,
        weight: 5.0,
    };

    let axe = Weapon {
        name: String::from("Axe"),
        damage: 60,
        value: 150,
        weight: 7.0,
    };

    let greatsword = Weapon {
        name: String::from("Greatsword"),
        damage: 80,
        value: 200,
        weight: 10.0,
    };

    let health_potion = Potion {
        name: String::from("Health Potion"),
        healing: 50,
        value: 25,
        quantity: 10,
    };

    let mana_potion = Potion {
        name: String::from("Mana Potion"),
        healing: 30,
        value: 30,
        quantity: 5,
    };

    let iron_ore = Material {
        name: String::from("Iron Ore"),
        value: 10,
        weight: 2.0,
        quantity: 50,
    };

    let wood = Material {
        name: String::from("Wood"),
        value: 5,
        weight: 1.0,
        quantity: 100,
    };

    println!("--- Creating Items ---");
    println!("Created weapon: {}", sword);
    println!("Created potion: {}", health_potion);
    println!("Created material: {}", iron_ore);

    // Weapon inventory
    println!("\n--- Weapon Inventory ---");
    let mut weapon_inventory = Inventory::new(15.0);

    println!("Adding {} to inventory...", sword.name());
    match weapon_inventory.add_item(sword.clone()) {
        Ok(_) => println!("✓ Item added successfully"),
        Err(e) => println!("✗ Cannot add item: {}", e),
    }

    println!("Adding {} to inventory...", axe.name());
    match weapon_inventory.add_item(axe.clone()) {
        Ok(_) => println!("✓ Item added successfully"),
        Err(e) => println!("✗ Cannot add item: {}", e),
    }

    println!("Adding {} to inventory...", greatsword.name());
    match weapon_inventory.add_item(greatsword.clone()) {
        Ok(_) => println!("✓ Item added successfully"),
        Err(e) => println!("✗ Cannot add item: {}", e),
    }

    println!("\nWeapon Inventory Status:");
    println!("  Items: {}", weapon_inventory.count());
    println!(
        "  Total Weight: {:.1} kg / {:.1} kg",
        weapon_inventory.total_weight(),
        weapon_inventory.max_weight
    );
    println!("  Total Value: {} coins", weapon_inventory.total_value());

    if let Some(most_val) = most_valuable(&weapon_inventory.items) {
        println!("\nMost valuable weapon: {} ({} coins)", most_val.name(), most_val.value());
    }

    // Potion inventory
    println!("\n--- Potion Inventory ---");
    let mut potion_inventory = Inventory::new(5.0);

    println!("Adding {}x {}...", health_potion.quantity, health_potion.name());
    match potion_inventory.add_item(health_potion.clone()) {
        Ok(_) => println!("✓ Item added successfully"),
        Err(e) => println!("✗ Cannot add item: {}", e),
    }

    println!("Adding {}x {}...", mana_potion.quantity, mana_potion.name());
    match potion_inventory.add_item(mana_potion.clone()) {
        Ok(_) => println!("✓ Item added successfully"),
        Err(e) => println!("✗ Cannot add item: {}", e),
    }

    println!("\nPotion Inventory Status:");
    println!("  Items: {}", potion_inventory.count());
    println!(
        "  Total Weight: {:.1} kg / {:.1} kg",
        potion_inventory.total_weight(),
        potion_inventory.max_weight
    );
    println!("  Total Value: {} coins", potion_inventory.total_value());
    println!(
        "  Stack value for {} ({}x): {} coins",
        health_potion.name(),
        health_potion.quantity,
        health_potion.stack_value(health_potion.quantity)
    );

    // Material inventory
    println!("\n--- Material Inventory ---");
    let mut material_inventory = Inventory::new(200.0);

    println!("Adding {}x {}...", iron_ore.quantity, iron_ore.name());
    match material_inventory.add_item(iron_ore.clone()) {
        Ok(_) => println!("✓ Item added successfully"),
        Err(e) => println!("✗ Cannot add item: {}", e),
    }

    println!("Adding {}x {}...", wood.quantity, wood.name());
    match material_inventory.add_item(wood.clone()) {
        Ok(_) => println!("✓ Item added successfully"),
        Err(e) => println!("✗ Cannot add item: {}", e),
    }

    println!("\nMaterial Inventory Status:");
    println!("  Items: {}", material_inventory.count());
    println!(
        "  Total Weight: {:.1} kg / {:.1} kg",
        material_inventory.total_weight(),
        material_inventory.max_weight
    );
    println!("  Total Value: {} coins", material_inventory.total_value());

    // Display item details
    println!("\n--- Item Details ---");
    display_item_info(&sword);
    println!();
    display_item_info(&health_potion);

    // Serialization
    println!("\n--- Serialization ---");
    println!("Weapon: {}", sword.serialize());
    println!("Potion: {}", health_potion.serialize());
    println!("Material: {}", iron_ore.serialize());

    // Finding items
    println!("\n--- Finding Items ---");
    match weapon_inventory.find_by_name("Sword") {
        Some(item) => println!("Searching for 'Sword': Found - {} ({} coins)", item.name(), item.value()),
        None => println!("Searching for 'Sword': Not found"),
    }

    match weapon_inventory.find_by_name("Shield") {
        Some(item) => println!("Searching for 'Shield': Found - {} ({} coins)", item.name(), item.value()),
        None => println!("Searching for 'Shield': Not found"),
    }

    println!("\n=== All tests completed ===");
}
