# Exercise 05: Trait Implementation

## Overview

This exercise helps you practice defining and implementing traits, working with generics, and using trait bounds covered in [Lesson 05: Traits and Generics](../../05-traits-generics/README.md). You'll build a simple inventory management system that demonstrates trait definitions, generic types, trait bounds, and serialization—skills that are essential for working with Solana's account system and Anchor framework.

**Estimated Time:** 60-75 minutes

## Learning Objectives

By completing this exercise, you will:

- Define custom traits with methods
- Implement traits for different types
- Use generic types with trait bounds
- Work with multiple trait bounds
- Implement standard library traits (Clone, Debug, Display)
- Apply trait-based polymorphism
- Use traits for serialization (similar to Borsh in Solana)
- Create generic functions that work with multiple types

## Problem Description

Create an inventory management system for a game or application. Your system should:

1. Define traits for items that can be stored in inventory
2. Implement these traits for different item types
3. Use generics to create a flexible inventory container
4. Implement serialization traits for data persistence
5. Use trait bounds to ensure type safety
6. Create generic functions that work with any item type

## Starter Code

A basic Rust project template is provided in the `starter/` directory. The template includes:

- A `Cargo.toml` file with project configuration
- A `src/main.rs` file with trait and struct definitions with TODO comments

Navigate to the starter directory and run:

```bash
cd starter
cargo run
```

## Implementation Requirements

Your implementation should include:

1. **An `Item` trait** with the following methods:
   - `fn name(&self) -> &str` - Returns the item name
   - `fn value(&self) -> u32` - Returns the item value in coins
   - `fn weight(&self) -> f32` - Returns the item weight
   - `fn description(&self) -> String` - Returns a formatted description

2. **A `Stackable` trait** with methods:
   - `fn max_stack_size(&self) -> u32` - Maximum items in a stack
   - `fn stack_value(&self, quantity: u32) -> u32` - Total value for quantity

3. **Three item types** that implement the `Item` trait:
   - `Weapon` struct with fields: `name: String`, `damage: u32`, `value: u32`, `weight: f32`
   - `Potion` struct with fields: `name: String`, `healing: u32`, `value: u32`, `quantity: u32`
   - `Material` struct with fields: `name: String`, `value: u32`, `weight: f32`, `quantity: u32`

4. **Implement `Stackable` trait**:
   - Implement for `Potion` (max stack: 99)
   - Implement for `Material` (max stack: 999)
   - Weapons are NOT stackable

5. **Implement standard traits**:
   - Derive `Debug` and `Clone` for all item types
   - Implement `Display` trait for all item types with user-friendly formatting

6. **A generic `Inventory<T>` struct**:
   - Generic over type `T` where `T: Item + Clone`
   - Field: `items: Vec<T>`
   - Field: `max_weight: f32`

7. **Implement methods for `Inventory<T>`**:
   - `fn new(max_weight: f32) -> Self` - Creates a new inventory
   - `fn add_item(&mut self, item: T) -> Result<(), String>` - Adds item if weight allows
   - `fn total_weight(&self) -> f32` - Calculates total weight
   - `fn total_value(&self) -> u32` - Calculates total value
   - `fn count(&self) -> usize` - Returns number of items
   - `fn find_by_name(&self, name: &str) -> Option<&T>` - Finds item by name

8. **A generic function `display_item_info<T: Item>`**:
   - Function signature: `fn display_item_info<T: Item>(item: &T)`
   - Prints item name, value, weight, and description

9. **A generic function `most_valuable<T: Item>`**:
   - Function signature: `fn most_valuable<T: Item + Clone>(items: &[T]) -> Option<T>`
   - Returns the item with highest value, or None if empty

10. **A `Serializable` trait** with methods:
    - `fn serialize(&self) -> String` - Converts to string representation
    - `fn type_name(&self) -> &str` - Returns the type name

11. **Implement `Serializable` for all item types**:
    - Format: `"TypeName{field1:value1,field2:value2,...}"`
    - Example: `"Weapon{name:Sword,damage:50,value:100,weight:5.0}"`

12. **A `main` function** that demonstrates:
    - Creating different item types
    - Creating inventories with different item types
    - Adding items to inventory with weight validation
    - Using generic functions with different types
    - Displaying item information
    - Finding most valuable items
    - Serializing items

## Validation Criteria

Your solution is correct when:

1. ✅ The program compiles without errors or warnings
2. ✅ `Item` trait is defined with all required methods
3. ✅ `Stackable` trait is defined with required methods
4. ✅ All three item types (Weapon, Potion, Material) are implemented correctly
5. ✅ `Item` trait is implemented for all item types
6. ✅ `Stackable` trait is implemented for Potion and Material
7. ✅ `Debug`, `Clone`, and `Display` traits are implemented for all item types
8. ✅ `Inventory<T>` is generic with appropriate trait bounds
9. ✅ All inventory methods work correctly with weight and value calculations
10. ✅ Generic functions `display_item_info` and `most_valuable` work with any item type
11. ✅ `Serializable` trait is implemented for all item types
12. ✅ The main function demonstrates all features with clear output

## Example Output

Your program should produce output similar to this:

```
=== Inventory Management System ===

--- Creating Items ---
Created weapon: Sword (Damage: 50, Value: 100 coins, Weight: 5.0 kg)
Created potion: Health Potion (Healing: 50, Value: 25 coins, Quantity: 10)
Created material: Iron Ore (Value: 10 coins, Weight: 2.0 kg, Quantity: 50)

--- Weapon Inventory ---
Adding Sword to inventory...
✓ Item added successfully
Adding Axe to inventory...
✓ Item added successfully
Adding Greatsword to inventory...
✗ Cannot add item: Exceeds maximum weight (15.0/15.0 kg)

Weapon Inventory Status:
  Items: 2
  Total Weight: 12.0 kg / 15.0 kg
  Total Value: 250 coins

Most valuable weapon: Axe (150 coins)

--- Potion Inventory ---
Adding 10x Health Potion...
✓ Item added successfully
Adding 5x Mana Potion...
✓ Item added successfully

Potion Inventory Status:
  Items: 2
  Total Weight: 0.3 kg / 5.0 kg
  Total Value: 325 coins
  Stack value for Health Potion (10x): 250 coins

--- Material Inventory ---
Adding 50x Iron Ore...
✓ Item added successfully
Adding 100x Wood...
✓ Item added successfully

Material Inventory Status:
  Items: 2
  Total Weight: 110.0 kg / 200.0 kg
  Total Value: 600 coins

--- Item Details ---
Item: Sword
  Value: 100 coins
  Weight: 5.0 kg
  Description: A sharp sword with 50 damage

Item: Health Potion
  Value: 25 coins
  Weight: 0.02 kg
  Description: A healing potion that restores 50 HP (Quantity: 10)

--- Serialization ---
Weapon: Weapon{name:Sword,damage:50,value:100,weight:5.0}
Potion: Potion{name:Health Potion,healing:50,value:25,quantity:10}
Material: Material{name:Iron Ore,value:10,weight:2.0,quantity:50}

--- Finding Items ---
Searching for 'Sword': Found - Sword (100 coins)
Searching for 'Shield': Not found

=== All tests completed ===
```

## Hints

- Use `#[derive(Debug, Clone)]` to automatically implement these traits
- Implement `std::fmt::Display` for user-friendly output
- Use trait bounds like `T: Item + Clone` to constrain generic types
- The `where` clause can make complex trait bounds more readable
- Use `Option<T>` for methods that might not find results
- Remember that trait methods can have default implementations
- Use `&self` for methods that don't modify the item
- Use `&mut self` for methods that modify the inventory
- Test edge cases: empty inventory, exceeding weight limits, missing items

## Pattern Examples

Here are some patterns you'll use:

```rust
// Defining a trait
trait Item {
    fn name(&self) -> &str;
    fn value(&self) -> u32;
}

// Implementing a trait
impl Item for Weapon {
    fn name(&self) -> &str {
        &self.name
    }
    
    fn value(&self) -> u32 {
        self.value
    }
}

// Generic struct with trait bounds
struct Inventory<T: Item + Clone> {
    items: Vec<T>,
}

// Generic function with trait bounds
fn display_item_info<T: Item>(item: &T) {
    println!("Item: {}", item.name());
    println!("Value: {} coins", item.value());
}

// Multiple trait bounds
fn process<T: Item + Clone + Display>(item: &T) {
    println!("{}", item);
}

// Using where clause
fn complex_function<T>(item: T) -> String
where
    T: Item + Clone + Display,
{
    format!("{}", item)
}

// Implementing Display
impl Display for Weapon {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{} (Damage: {}, Value: {} coins)", 
               self.name, self.damage, self.value)
    }
}
```

## Testing Your Solution

Run your program with:

```bash
cargo run
```

Test different scenarios:

1. Create different item types and verify trait implementations
2. Add items to inventory and check weight limits
3. Calculate total weight and value correctly
4. Find items by name (both existing and non-existing)
5. Use generic functions with different item types
6. Serialize items to strings
7. Find most valuable items in collections

## Extension Challenges (Optional)

If you finish early and want more practice:

1. **Add more traits**:
   - `Equippable` trait for items that can be equipped
   - `Consumable` trait for items that can be used
   - `Craftable` trait for items that can be crafted from materials

2. **Implement trait objects**:
   - Create a `MixedInventory` that can hold different item types
   - Use `Box<dyn Item>` for heterogeneous collections

3. **Add deserialization**:
   - Implement a `deserialize` function that parses the string format
   - Handle parsing errors gracefully

4. **Implement comparison traits**:
   - Implement `PartialOrd` and `Ord` to compare items by value
   - Sort inventory by value, weight, or name

5. **Add inventory operations**:
   - `remove_item` method to remove items
   - `transfer` method to move items between inventories
   - `merge` method to combine stackable items

6. **Create a builder pattern**:
   ```rust
   let weapon = WeaponBuilder::new("Sword")
       .damage(50)
       .value(100)
       .weight(5.0)
       .build();
   ```

7. **Implement actual Borsh serialization**:
   - Add `borsh` dependency to Cargo.toml
   - Derive `BorshSerialize` and `BorshDeserialize`
   - Compare with your custom serialization

## Related Lessons

This exercise reinforces concepts from:

- [Lesson 05: Traits and Generics](../../05-traits-generics/README.md) - Traits, generics, trait bounds

## Solana Context

The trait and generic patterns you're practicing are directly applicable to Solana development:

- **Custom traits**: Define behavior for account types, similar to Anchor's account traits
- **Generic types**: Work with different account types using the same code
- **Trait bounds**: Ensure accounts have required serialization and validation traits
- **Serialization**: Borsh trait works exactly like your `Serializable` trait
- **Type safety**: Generics ensure compile-time type checking for accounts

Example Solana parallel:

```rust
// Your exercise
trait Item {
    fn name(&self) -> &str;
    fn value(&self) -> u32;
}

struct Inventory<T: Item + Clone> {
    items: Vec<T>,
}

impl<T: Item + Clone> Inventory<T> {
    fn add_item(&mut self, item: T) -> Result<(), String> {
        self.items.push(item);
        Ok(())
    }
}

trait Serializable {
    fn serialize(&self) -> String;
}

// Solana/Anchor program
use anchor_lang::prelude::*;
use borsh::{BorshSerialize, BorshDeserialize};

// Custom trait for game items
trait GameItem {
    fn item_type(&self) -> ItemType;
    fn value(&self) -> u64;
}

// Account with Borsh serialization (like your Serializable)
#[account]
#[derive(Debug, Clone)]
pub struct Weapon {
    pub name: String,
    pub damage: u32,
    pub value: u64,
    pub owner: Pubkey,
}

#[account]
#[derive(Debug, Clone)]
pub struct Potion {
    pub name: String,
    pub healing: u32,
    pub value: u64,
    pub quantity: u32,
}

// Implement custom trait for account types
impl GameItem for Weapon {
    fn item_type(&self) -> ItemType {
        ItemType::Weapon
    }
    
    fn value(&self) -> u64 {
        self.value
    }
}

impl GameItem for Potion {
    fn item_type(&self) -> ItemType {
        ItemType::Potion
    }
    
    fn value(&self) -> u64 {
        self.value * self.quantity as u64
    }
}

// Generic inventory account
#[account]
pub struct Inventory<T: GameItem> {
    pub owner: Pubkey,
    pub items: Vec<T>,
    pub max_weight: u32,
}

// Generic instruction handler
pub fn add_item<'info, T>(
    ctx: Context<'info, AddItem<'info>>,
    item: T,
) -> Result<()>
where
    T: GameItem + BorshSerialize + BorshDeserialize,
{
    let inventory = &mut ctx.accounts.inventory;
    
    // Validate
    require!(
        inventory.items.len() < MAX_ITEMS,
        ErrorCode::InventoryFull
    );
    
    // Add item
    inventory.items.push(item);
    
    msg!("Item added with value: {}", item.value());
    Ok(())
}

#[derive(Accounts)]
pub struct AddItem<'info> {
    #[account(mut)]
    pub inventory: Account<'info, Inventory>,
    
    pub authority: Signer<'info>,
}
```

Both patterns emphasize:
- Custom traits for domain-specific behavior
- Generic types for code reuse
- Trait bounds for type safety
- Serialization traits for data persistence
- Type-safe operations at compile time
- Clear separation of concerns

In Solana:
- `#[account]` macro automatically implements Borsh serialization
- Anchor's `Account<'info, T>` is generic over account types
- Trait bounds ensure accounts can be serialized/deserialized
- Custom traits define game logic separate from serialization
- Generic instruction handlers work with multiple account types

## Need Help?

If you're stuck:

1. Review the relevant sections in [Lesson 05: Traits and Generics](../../05-traits-generics/README.md)
2. Check the compiler error messages - they often suggest trait bounds needed
3. Use `println!` with `{:?}` to debug values (requires Debug trait)
4. Make sure your trait bounds are complete (Item + Clone, etc.)
5. Remember that trait methods use `&self` for immutable access
6. Check the solution in the `solution/` directory (but try on your own first!)

---

**Exercise Home**: [All Exercises](../README.md)  
**Related Lesson**: [Traits and Generics](../../05-traits-generics/README.md)

**Language:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
