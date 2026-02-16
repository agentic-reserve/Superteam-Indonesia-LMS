# Latihan 03: Latihan Struct dan Enum

## Gambaran Umum

Latihan ini membantu Anda mempraktikkan konsep struct, enum, dan pattern matching yang dibahas dalam [Pelajaran 03: Struct dan Enum](../../03-structs-enums/README_ID.md). Anda akan membangun sistem manajemen inventori sederhana yang mendemonstrasikan cara mendefinisikan tipe data kustom, mengimplementasikan method, dan menggunakan pattern matching untuk menangani berbagai skenario—keterampilan yang penting untuk pengembangan program Solana.

**Estimasi Waktu:** 45-60 menit

## Tujuan Pembelajaran

Dengan menyelesaikan latihan ini, Anda akan:

- Mendefinisikan struct dengan field bernama untuk merepresentasikan data kompleks
- Membuat enum dengan berbagai tipe varian
- Mengimplementasikan method dan associated function pada struct
- Menggunakan pattern matching dengan `match` untuk menangani varian enum
- Menerapkan `if let` untuk pattern matching yang ringkas
- Memodelkan struktur data yang mirip dengan yang digunakan dalam program Solana
- Mempraktikkan pengorganisasian data dan perilaku yang terkait

## Deskripsi Masalah

Buat sistem manajemen inventori untuk game atau aplikasi. Sistem Anda harus:

1. Mendefinisikan struct `Item` untuk merepresentasikan item inventori
2. Mendefinisikan enum `ItemType` untuk mengkategorikan berbagai tipe item
3. Mendefinisikan enum `InventoryAction` untuk merepresentasikan berbagai aksi
4. Mengimplementasikan method pada struct `Item`
5. Membuat fungsi yang menggunakan pattern matching untuk memproses aksi
6. Menangani berbagai tipe item dengan logika yang sesuai

## Kode Awal

Template proyek Rust dasar disediakan di direktori `starter/`. Template ini mencakup:

- File `Cargo.toml` dengan konfigurasi proyek
- File `src/main.rs` dengan definisi struct dan enum serta komentar TODO

Navigasi ke direktori starter dan jalankan:

```bash
cd starter
cargo run
```

## Persyaratan Implementasi

Implementasi Anda harus mencakup:

1. **Enum `ItemType`** dengan varian berikut:
   - `Weapon { damage: u32 }`
   - `Armor { defense: u32 }`
   - `Consumable { healing: u32 }`
   - `Quest`

2. **Struct `Item`** dengan field berikut:
   - `name: String`
   - `item_type: ItemType`
   - `quantity: u32`
   - `value: u32` (nilai emas)

3. **Enum `InventoryAction`** dengan varian berikut:
   - `Add { item: Item }`
   - `Remove { name: String, quantity: u32 }`
   - `Use { name: String }`
   - `List`

4. **Method pada `Item`**:
   - `new(name: String, item_type: ItemType, quantity: u32, value: u32) -> Self` - Associated function (constructor)
   - `total_value(&self) -> u32` - Mengembalikan nilai total (value × quantity)
   - `description(&self) -> String` - Mengembalikan deskripsi terformat dari item

5. **Fungsi `process_action`** yang menerima `InventoryAction` dan referensi mutable ke `Vec<Item>`:
   - Signature fungsi: `fn process_action(action: InventoryAction, inventory: &mut Vec<Item>)`
   - Menggunakan pattern matching untuk menangani setiap tipe aksi
   - Untuk `Add`: menambahkan item ke inventori (atau meningkatkan quantity jika sudah ada)
   - Untuk `Remove`: menghapus quantity yang ditentukan (atau menghapus item jika quantity mencapai 0)
   - Untuk `Use`: menggunakan item consumable (mengurangi quantity sebanyak 1)
   - Untuk `List`: mencetak semua item dalam inventori

6. **Fungsi `get_item_type_name`** yang mengembalikan string yang mendeskripsikan tipe item:
   - Signature fungsi: `fn get_item_type_name(item_type: &ItemType) -> &str`
   - Menggunakan pattern matching untuk mengembalikan "Weapon", "Armor", "Consumable", atau "Quest Item"

7. **Fungsi `main`** yang mendemonstrasikan:
   - Membuat item dengan berbagai tipe
   - Menambahkan item ke inventori
   - Menampilkan inventori
   - Menggunakan item
   - Menghapus item

## Kriteria Validasi

Solusi Anda benar ketika:

1. ✅ Program dikompilasi tanpa error atau warning
2. ✅ Enum `ItemType` memiliki semua empat varian dengan data yang benar
3. ✅ Struct `Item` memiliki semua field yang diperlukan
4. ✅ Enum `InventoryAction` memiliki semua empat varian
5. ✅ `Item::new()` dengan benar membuat item baru
6. ✅ `Item::total_value()` dengan benar menghitung value × quantity
7. ✅ `Item::description()` mengembalikan string terformat dengan detail item
8. ✅ `process_action` dengan benar menangani semua tipe aksi menggunakan pattern matching
9. ✅ `get_item_type_name` mengembalikan nama yang benar untuk semua tipe item
10. ✅ Fungsi main mendemonstrasikan semua fungsionalitas dengan output yang jelas

## Contoh Output

Program Anda harus menghasilkan output yang mirip dengan ini:

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

## Petunjuk

- Gunakan `#[derive(Debug, Clone)]` pada struct dan enum Anda untuk debugging yang lebih mudah
- Dalam `process_action`, gunakan `match` untuk destructure aksi dan mengakses datanya
- Untuk aksi `Add`, periksa apakah item dengan nama yang sama sudah ada
- Gunakan `Vec::iter_mut()` untuk menemukan dan memodifikasi item yang ada
- Gunakan `Vec::retain()` untuk menghapus item dengan quantity nol
- Macro `format!()` berguna untuk membuat string terformat
- Ingat untuk menggunakan `&` saat pattern matching pada referensi

## Contoh Pattern Matching

Berikut adalah beberapa pola pattern matching yang akan Anda gunakan:

```rust
// Matching varian enum dengan data
match item_type {
    ItemType::Weapon { damage } => println!("Damage: {}", damage),
    ItemType::Armor { defense } => println!("Defense: {}", defense),
    ItemType::Consumable { healing } => println!("Healing: {}", healing),
    ItemType::Quest => println!("Quest item"),
}

// Matching dengan if let untuk kasus tunggal
if let ItemType::Consumable { healing } = item.item_type {
    println!("This heals for {}", healing);
}

// Destructuring dalam match arm
match action {
    InventoryAction::Add { item } => {
        // item sekarang tersedia
    }
    InventoryAction::Remove { name, quantity } => {
        // name dan quantity sekarang tersedia
    }
    _ => {}
}
```

## Menguji Solusi Anda

Jalankan program Anda dengan:

```bash
cargo run
```

Uji berbagai skenario:

1. Tambahkan beberapa item dengan tipe yang sama (harus meningkatkan quantity)
2. Hapus lebih banyak item daripada yang ada (harus ditangani dengan baik)
3. Gunakan item non-consumable (harus menampilkan pesan yang sesuai)
4. Tampilkan inventori kosong

## Tantangan Ekstensi (Opsional)

Jika Anda selesai lebih awal dan ingin lebih banyak latihan:

1. **Tambahkan struct `Inventory`** yang membungkus `Vec<Item>` dan mengimplementasikan method:
   - `add_item(&mut self, item: Item)`
   - `remove_item(&mut self, name: &str, quantity: u32) -> Result<(), String>`
   - `use_item(&mut self, name: &str) -> Result<(), String>`
   - `total_value(&self) -> u32`

2. **Tambahkan kelangkaan item** dengan enum:
   - `enum Rarity { Common, Uncommon, Rare, Epic, Legendary }`
   - Modifikasi perhitungan nilai berdasarkan kelangkaan

3. **Implementasikan aturan stacking item**:
   - Item quest tidak stack (quantity selalu 1)
   - Consumable stack hingga 99
   - Weapon dan armor tidak stack

4. **Tambahkan perbandingan item**:
   - Implementasikan `PartialEq` untuk membandingkan item berdasarkan nama
   - Implementasikan `PartialOrd` untuk mengurutkan item berdasarkan nilai

5. **Tambahkan serialisasi**:
   - Gunakan `serde` untuk menyimpan/memuat inventori ke JSON
   - Praktikkan dengan trait serialisasi seperti di Solana

## Pelajaran Terkait

Latihan ini memperkuat konsep dari:

- [Pelajaran 03: Struct dan Enum](../../03-structs-enums/README_ID.md) - Struct, enum, pattern matching, method

## Konteks Solana

Pola yang Anda praktikkan dapat langsung diterapkan pada pengembangan Solana:

- **Struct untuk data akun**: Seperti `Item`, akun Solana menyimpan data terstruktur
- **Enum untuk instruksi**: `InventoryAction` mirip dengan enum instruksi dalam program Solana
- **Pattern matching untuk pemrosesan instruksi**: Program Solana menggunakan `match` untuk merutekan instruksi
- **Method untuk logika bisnis**: Struct akun memiliki method untuk manipulasi data yang aman
- **Associated function**: Constructor seperti `Item::new()` umum dalam program Solana

Contoh paralel Solana:

```rust
// Latihan Anda
enum InventoryAction {
    Add { item: Item },
    Remove { name: String, quantity: u32 },
}

// Program Solana
enum TokenInstruction {
    Transfer { amount: u64 },
    Mint { amount: u64 },
}

// Keduanya menggunakan pattern matching untuk memproses
match action {
    InventoryAction::Add { item } => { /* ... */ }
    InventoryAction::Remove { name, quantity } => { /* ... */ }
}

match instruction {
    TokenInstruction::Transfer { amount } => { /* ... */ }
    TokenInstruction::Mint { amount } => { /* ... */ }
}
```

## Butuh Bantuan?

Jika Anda terjebak:

1. Tinjau bagian yang relevan dalam [Pelajaran 03: Struct dan Enum](../../03-structs-enums/README_ID.md)
2. Periksa pesan error compiler - mereka sering menyarankan perbaikan
3. Gunakan `println!` dengan `{:?}` untuk debug nilai struct dan enum
4. Pastikan Anda menggunakan `match` secara exhaustive (mencakup semua kasus)
5. Periksa solusi di direktori `solution/` (tapi coba sendiri dulu!)

---

**Beranda Latihan**: [Semua Latihan](../README_ID.md)  
**Pelajaran Terkait**: [Struct dan Enum](../../03-structs-enums/README_ID.md)

**Bahasa:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
