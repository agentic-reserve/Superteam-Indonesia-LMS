# Latihan 05: Implementasi Trait

## Gambaran Umum

Latihan ini membantu Anda mempraktikkan pendefinisian dan implementasi trait, bekerja dengan generic, dan menggunakan trait bound yang dibahas dalam [Pelajaran 05: Trait dan Generic](../../05-traits-generics/README_ID.md). Anda akan membangun sistem manajemen inventori sederhana yang mendemonstrasikan definisi trait, tipe generic, trait bound, dan serialisasi—keterampilan yang penting untuk bekerja dengan sistem akun Solana dan framework Anchor.

**Estimasi Waktu:** 60-75 menit

## Tujuan Pembelajaran

Dengan menyelesaikan latihan ini, Anda akan:

- Mendefinisikan trait kustom dengan metode
- Mengimplementasikan trait untuk berbagai tipe
- Menggunakan tipe generic dengan trait bound
- Bekerja dengan multiple trait bound
- Mengimplementasikan trait standard library (Clone, Debug, Display)
- Menerapkan polimorfisme berbasis trait
- Menggunakan trait untuk serialisasi (mirip dengan Borsh di Solana)
- Membuat fungsi generic yang bekerja dengan berbagai tipe

## Deskripsi Masalah

Buat sistem manajemen inventori untuk game atau aplikasi. Sistem Anda harus:

1. Mendefinisikan trait untuk item yang dapat disimpan dalam inventori
2. Mengimplementasikan trait ini untuk berbagai tipe item
3. Menggunakan generic untuk membuat container inventori yang fleksibel
4. Mengimplementasikan trait serialisasi untuk persistensi data
5. Menggunakan trait bound untuk memastikan type safety
6. Membuat fungsi generic yang bekerja dengan tipe item apa pun

## Kode Starter

Template proyek Rust dasar disediakan di direktori `starter/`. Template ini mencakup:

- File `Cargo.toml` dengan konfigurasi proyek
- File `src/main.rs` dengan definisi trait dan struct dengan komentar TODO

Navigasi ke direktori starter dan jalankan:

```bash
cd starter
cargo run
```

## Persyaratan Implementasi

Implementasi Anda harus mencakup:

1. **Trait `Item`** dengan metode berikut:
   - `fn name(&self) -> &str` - Mengembalikan nama item
   - `fn value(&self) -> u32` - Mengembalikan nilai item dalam koin
   - `fn weight(&self) -> f32` - Mengembalikan berat item
   - `fn description(&self) -> String` - Mengembalikan deskripsi terformat

2. **Trait `Stackable`** dengan metode:
   - `fn max_stack_size(&self) -> u32` - Maksimum item dalam stack
   - `fn stack_value(&self, quantity: u32) -> u32` - Total nilai untuk kuantitas

3. **Tiga tipe item** yang mengimplementasikan trait `Item`:
   - Struct `Weapon` dengan field: `name: String`, `damage: u32`, `value: u32`, `weight: f32`
   - Struct `Potion` dengan field: `name: String`, `healing: u32`, `value: u32`, `quantity: u32`
   - Struct `Material` dengan field: `name: String`, `value: u32`, `weight: f32`, `quantity: u32`

4. **Implementasi trait `Stackable`**:
   - Implementasi untuk `Potion` (max stack: 99)
   - Implementasi untuk `Material` (max stack: 999)
   - Weapon TIDAK stackable

5. **Implementasi trait standard**:
   - Derive `Debug` dan `Clone` untuk semua tipe item
   - Implementasi trait `Display` untuk semua tipe item dengan format user-friendly

6. **Struct generic `Inventory<T>`**:
   - Generic atas tipe `T` dimana `T: Item + Clone`
   - Field: `items: Vec<T>`
   - Field: `max_weight: f32`

7. **Implementasi metode untuk `Inventory<T>`**:
   - `fn new(max_weight: f32) -> Self` - Membuat inventori baru
   - `fn add_item(&mut self, item: T) -> Result<(), String>` - Menambah item jika berat memungkinkan
   - `fn total_weight(&self) -> f32` - Menghitung total berat
   - `fn total_value(&self) -> u32` - Menghitung total nilai
   - `fn count(&self) -> usize` - Mengembalikan jumlah item
   - `fn find_by_name(&self, name: &str) -> Option<&T>` - Mencari item berdasarkan nama

8. **Fungsi generic `display_item_info<T: Item>`**:
   - Signature fungsi: `fn display_item_info<T: Item>(item: &T)`
   - Mencetak nama, nilai, berat, dan deskripsi item

9. **Fungsi generic `most_valuable<T: Item>`**:
   - Signature fungsi: `fn most_valuable<T: Item + Clone>(items: &[T]) -> Option<T>`
   - Mengembalikan item dengan nilai tertinggi, atau None jika kosong

10. **Trait `Serializable`** dengan metode:
    - `fn serialize(&self) -> String` - Mengkonversi ke representasi string
    - `fn type_name(&self) -> &str` - Mengembalikan nama tipe

11. **Implementasi `Serializable` untuk semua tipe item**:
    - Format: `"TypeName{field1:value1,field2:value2,...}"`
    - Contoh: `"Weapon{name:Sword,damage:50,value:100,weight:5.0}"`

12. **Fungsi `main`** yang mendemonstrasikan:
    - Membuat berbagai tipe item
    - Membuat inventori dengan berbagai tipe item
    - Menambah item ke inventori dengan validasi berat
    - Menggunakan fungsi generic dengan berbagai tipe
    - Menampilkan informasi item
    - Mencari item paling berharga
    - Serialisasi item

## Kriteria Validasi

Solusi Anda benar ketika:

1. ✅ Program dikompilasi tanpa error atau warning
2. ✅ Trait `Item` didefinisikan dengan semua metode yang diperlukan
3. ✅ Trait `Stackable` didefinisikan dengan metode yang diperlukan
4. ✅ Semua tiga tipe item (Weapon, Potion, Material) diimplementasikan dengan benar
5. ✅ Trait `Item` diimplementasikan untuk semua tipe item
6. ✅ Trait `Stackable` diimplementasikan untuk Potion dan Material
7. ✅ Trait `Debug`, `Clone`, dan `Display` diimplementasikan untuk semua tipe item
8. ✅ `Inventory<T>` adalah generic dengan trait bound yang sesuai
9. ✅ Semua metode inventori bekerja dengan benar dengan kalkulasi berat dan nilai
10. ✅ Fungsi generic `display_item_info` dan `most_valuable` bekerja dengan tipe item apa pun
11. ✅ Trait `Serializable` diimplementasikan untuk semua tipe item
12. ✅ Fungsi main mendemonstrasikan semua fitur dengan output yang jelas

## Contoh Output

Program Anda harus menghasilkan output yang mirip dengan ini:

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

## Petunjuk

- Gunakan `#[derive(Debug, Clone)]` untuk mengimplementasikan trait ini secara otomatis
- Implementasikan `std::fmt::Display` untuk output yang user-friendly
- Gunakan trait bound seperti `T: Item + Clone` untuk membatasi tipe generic
- Klausa `where` dapat membuat trait bound yang kompleks lebih mudah dibaca
- Gunakan `Option<T>` untuk metode yang mungkin tidak menemukan hasil
- Ingat bahwa metode trait dapat memiliki implementasi default
- Gunakan `&self` untuk metode yang tidak memodifikasi item
- Gunakan `&mut self` untuk metode yang memodifikasi inventori
- Uji edge case: inventori kosong, melebihi batas berat, item yang hilang

## Contoh Pattern

Berikut adalah beberapa pola yang akan Anda gunakan:

```rust
// Mendefinisikan trait
trait Item {
    fn name(&self) -> &str;
    fn value(&self) -> u32;
}

// Mengimplementasikan trait
impl Item for Weapon {
    fn name(&self) -> &str {
        &self.name
    }
    
    fn value(&self) -> u32 {
        self.value
    }
}

// Struct generic dengan trait bound
struct Inventory<T: Item + Clone> {
    items: Vec<T>,
}

// Fungsi generic dengan trait bound
fn display_item_info<T: Item>(item: &T) {
    println!("Item: {}", item.name());
    println!("Value: {} coins", item.value());
}

// Multiple trait bound
fn process<T: Item + Clone + Display>(item: &T) {
    println!("{}", item);
}

// Menggunakan klausa where
fn complex_function<T>(item: T) -> String
where
    T: Item + Clone + Display,
{
    format!("{}", item)
}

// Mengimplementasikan Display
impl Display for Weapon {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{} (Damage: {}, Value: {} coins)", 
               self.name, self.damage, self.value)
    }
}
```

## Menguji Solusi Anda

Jalankan program Anda dengan:

```bash
cargo run
```

Uji berbagai skenario:

1. Buat berbagai tipe item dan verifikasi implementasi trait
2. Tambahkan item ke inventori dan periksa batas berat
3. Hitung total berat dan nilai dengan benar
4. Cari item berdasarkan nama (yang ada dan tidak ada)
5. Gunakan fungsi generic dengan berbagai tipe item
6. Serialisasi item ke string
7. Temukan item paling berharga dalam koleksi

## Tantangan Ekstensi (Opsional)

Jika Anda selesai lebih awal dan ingin lebih banyak latihan:

1. **Tambahkan lebih banyak trait**:
   - Trait `Equippable` untuk item yang dapat diequip
   - Trait `Consumable` untuk item yang dapat digunakan
   - Trait `Craftable` untuk item yang dapat dibuat dari material

2. **Implementasikan trait object**:
   - Buat `MixedInventory` yang dapat menampung berbagai tipe item
   - Gunakan `Box<dyn Item>` untuk koleksi heterogen

3. **Tambahkan deserialisasi**:
   - Implementasikan fungsi `deserialize` yang mem-parse format string
   - Tangani parsing error dengan baik

4. **Implementasikan trait perbandingan**:
   - Implementasikan `PartialOrd` dan `Ord` untuk membandingkan item berdasarkan nilai
   - Urutkan inventori berdasarkan nilai, berat, atau nama

5. **Tambahkan operasi inventori**:
   - Metode `remove_item` untuk menghapus item
   - Metode `transfer` untuk memindahkan item antar inventori
   - Metode `merge` untuk menggabungkan item stackable

6. **Buat pola builder**:
   ```rust
   let weapon = WeaponBuilder::new("Sword")
       .damage(50)
       .value(100)
       .weight(5.0)
       .build();
   ```

7. **Implementasikan serialisasi Borsh yang sebenarnya**:
   - Tambahkan dependency `borsh` ke Cargo.toml
   - Derive `BorshSerialize` dan `BorshDeserialize`
   - Bandingkan dengan serialisasi kustom Anda

## Pelajaran Terkait

Latihan ini memperkuat konsep dari:

- [Pelajaran 05: Trait dan Generic](../../05-traits-generics/README_ID.md) - Trait, generic, trait bound

## Konteks Solana

Pola trait dan generic yang Anda praktikkan dapat langsung diterapkan pada pengembangan Solana:

- **Trait kustom**: Mendefinisikan perilaku untuk tipe akun, mirip dengan trait akun Anchor
- **Tipe generic**: Bekerja dengan berbagai tipe akun menggunakan kode yang sama
- **Trait bound**: Memastikan akun memiliki trait serialisasi dan validasi yang diperlukan
- **Serialisasi**: Trait Borsh bekerja persis seperti trait `Serializable` Anda
- **Type safety**: Generic memastikan pengecekan tipe pada compile-time untuk akun

Contoh paralel Solana:

```rust
// Latihan Anda
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

// Program Solana/Anchor
use anchor_lang::prelude::*;
use borsh::{BorshSerialize, BorshDeserialize};

// Trait kustom untuk item game
trait GameItem {
    fn item_type(&self) -> ItemType;
    fn value(&self) -> u64;
}

// Akun dengan serialisasi Borsh (seperti Serializable Anda)
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

// Implementasi trait kustom untuk tipe akun
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

// Akun inventori generic
#[account]
pub struct Inventory<T: GameItem> {
    pub owner: Pubkey,
    pub items: Vec<T>,
    pub max_weight: u32,
}

// Handler instruksi generic
pub fn add_item<'info, T>(
    ctx: Context<'info, AddItem<'info>>,
    item: T,
) -> Result<()>
where
    T: GameItem + BorshSerialize + BorshDeserialize,
{
    let inventory = &mut ctx.accounts.inventory;
    
    // Validasi
    require!(
        inventory.items.len() < MAX_ITEMS,
        ErrorCode::InventoryFull
    );
    
    // Tambah item
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

Kedua pola menekankan:
- Trait kustom untuk perilaku spesifik domain
- Tipe generic untuk reuse kode
- Trait bound untuk type safety
- Trait serialisasi untuk persistensi data
- Operasi type-safe pada compile time
- Pemisahan concern yang jelas

Di Solana:
- Macro `#[account]` secara otomatis mengimplementasikan serialisasi Borsh
- `Account<'info, T>` Anchor adalah generic atas tipe akun
- Trait bound memastikan akun dapat diserialisasi/deserialisasi
- Trait kustom mendefinisikan logika game terpisah dari serialisasi
- Handler instruksi generic bekerja dengan berbagai tipe akun

## Butuh Bantuan?

Jika Anda terjebak:

1. Tinjau bagian yang relevan dalam [Pelajaran 05: Trait dan Generic](../../05-traits-generics/README_ID.md)
2. Periksa pesan error compiler - mereka sering menyarankan trait bound yang diperlukan
3. Gunakan `println!` dengan `{:?}` untuk debug nilai (memerlukan trait Debug)
4. Pastikan trait bound Anda lengkap (Item + Clone, dll.)
5. Ingat bahwa metode trait menggunakan `&self` untuk akses immutable
6. Periksa solusi di direktori `solution/` (tetapi coba sendiri dulu!)

---

**Beranda Latihan**: [Semua Latihan](../README_ID.md)  
**Pelajaran Terkait**: [Trait dan Generic](../../05-traits-generics/README_ID.md)

**Bahasa:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
