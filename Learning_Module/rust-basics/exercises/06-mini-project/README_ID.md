# Latihan 06: Mini Project - Task Manager CLI

## Gambaran Umum

Mini project komprehensif ini mengintegrasikan semua konsep Rust yang telah Anda pelajari sepanjang modul. Anda akan membangun aplikasi manajemen tugas berbasis command-line yang mendemonstrasikan variabel, ownership, struct, enum, error handling, trait, generic, dan modul—semua keterampilan yang dibutuhkan untuk pengembangan program Solana.

**Estimasi Waktu:** 2-3 jam

## Tujuan Pembelajaran

Dengan menyelesaikan project ini, Anda akan:

- Menerapkan konsep fundamental Rust (variabel, fungsi, control flow)
- Mengelola ownership dan borrowing dalam aplikasi nyata
- Merancang dan menggunakan struct dan enum kustom
- Mengimplementasikan error handling komprehensif dengan tipe error kustom
- Mendefinisikan dan mengimplementasikan trait untuk berbagai tipe
- Menggunakan generic untuk membuat komponen yang dapat digunakan kembali
- Mengorganisir kode dengan modul
- Membangun aplikasi lengkap yang berfungsi
- Menerapkan pola yang digunakan dalam pengembangan program Solana

## Deskripsi Project

Buat aplikasi manajemen tugas berbasis command-line dengan fitur berikut:

1. **Manajemen Tugas**: Membuat, menampilkan, memperbarui, menyelesaikan, dan menghapus tugas
2. **Sistem Prioritas**: Menetapkan prioritas (Low, Medium, High, Critical)
3. **Kategori**: Mengorganisir tugas berdasarkan kategori
4. **Persistensi**: Menyimpan dan memuat tugas dari file
5. **Filtering**: Memfilter tugas berdasarkan status, prioritas, atau kategori
6. **Statistik**: Menampilkan statistik dan ringkasan tugas
7. **Error Handling**: Menangani semua error dengan baik tanpa panic
8. **Validasi**: Memvalidasi semua input pengguna

## Starter Code

Struktur project Rust dasar disediakan di direktori `starter/` dengan:

- `Cargo.toml` - Konfigurasi project
- `src/main.rs` - Entry point dengan komentar TODO
- `src/task.rs` - Tipe terkait Task (akan diimplementasikan)
- `src/storage.rs` - Persistensi file (akan diimplementasikan)
- `src/error.rs` - Tipe error (akan diimplementasikan)

Navigasi ke direktori starter dan jalankan:

```bash
cd starter
cargo build
cargo run
```

## Persyaratan Implementasi

### 1. Modul Error Handling (`src/error.rs`)

Definisikan tipe error komprehensif:

```rust
#[derive(Debug)]
pub enum TaskError {
    IoError(std::io::Error),
    ParseError(String),
    ValidationError(String),
    NotFound(u32),  // Task ID
    InvalidPriority(String),
    InvalidStatus(String),
    SerializationError(String),
}
```

- Implementasikan trait `Display` untuk pesan error yang user-friendly
- Implementasikan `From<std::io::Error>` untuk konversi otomatis
- Implementasikan trait `std::error::Error`

### 2. Modul Task (`src/task.rs`)

**Enum Priority**:
```rust
#[derive(Debug, Clone, PartialEq)]
pub enum Priority {
    Low,
    Medium,
    High,
    Critical,
}
```

- Implementasikan trait `Display`
- Implementasikan trait `FromStr` untuk parsing dari string
- Derive `Debug`, `Clone`, `PartialEq`

**Enum Status**:
```rust
#[derive(Debug, Clone, PartialEq)]
pub enum Status {
    Pending,
    InProgress,
    Completed,
}
```

- Implementasikan trait `Display`
- Implementasikan trait `FromStr`
- Derive `Debug`, `Clone`, `PartialEq`

**Struct Task**:
```rust
#[derive(Debug, Clone)]
pub struct Task {
    pub id: u32,
    pub title: String,
    pub description: Option<String>,
    pub priority: Priority,
    pub status: Status,
    pub category: Option<String>,
    pub created_at: String,  // Timestamp yang disederhanakan
}
```

- Implementasikan trait `Display` untuk output terformat
- Implementasikan validasi di constructor
- Derive `Debug`, `Clone`

**Method Task**:
- `new(id: u32, title: String, priority: Priority) -> Result<Task, TaskError>`
- `with_description(mut self, desc: String) -> Self`
- `with_category(mut self, category: String) -> Self`
- `set_status(&mut self, status: Status)`
- `set_priority(&mut self, priority: Priority)`
- `is_completed(&self) -> bool`
- `matches_filter(&self, filter: &TaskFilter) -> bool`

### 3. Trait untuk Serialisasi

**Trait Serializable**:
```rust
pub trait Serializable {
    fn serialize(&self) -> String;
    fn deserialize(data: &str) -> Result<Self, TaskError>
    where
        Self: Sized;
}
```

- Implementasikan untuk `Task` menggunakan format sederhana (misalnya CSV atau format kustom)
- Tangani error parsing dengan baik

### 4. Task Manager dengan Generic

**Struct TaskManager**:
```rust
pub struct TaskManager<T: Serializable + Clone> {
    tasks: Vec<T>,
    next_id: u32,
}
```

- Generic untuk tipe apapun yang mengimplementasikan `Serializable + Clone`
- Method:
  - `new() -> Self`
  - `add_task(&mut self, task: T) -> u32`
  - `get_task(&self, id: u32) -> Option<&T>`
  - `get_task_mut(&mut self, id: u32) -> Option<&mut T>`
  - `remove_task(&mut self, id: u32) -> Result<T, TaskError>`
  - `list_tasks(&self) -> &[T]`
  - `count(&self) -> usize`

### 5. Sistem Filtering

**Struct TaskFilter**:
```rust
pub struct TaskFilter {
    pub status: Option<Status>,
    pub priority: Option<Priority>,
    pub category: Option<String>,
}
```

- Implementasikan builder pattern untuk konstruksi filter yang mudah
- Method: `matches(&self, task: &Task) -> bool`

### 6. Modul Storage (`src/storage.rs`)

**Trait Storage**:
```rust
pub trait Storage<T> {
    fn save(&self, items: &[T]) -> Result<(), TaskError>;
    fn load(&self) -> Result<Vec<T>, TaskError>;
}
```

**Struct FileStorage**:
```rust
pub struct FileStorage {
    file_path: String,
}
```

- Implementasikan trait `Storage<Task>`
- Tangani error file I/O
- Buat file jika tidak ada
- Gunakan trait `Serializable` untuk konversi task

### 7. Modul Statistik

**Struct TaskStats**:
```rust
pub struct TaskStats {
    pub total: usize,
    pub pending: usize,
    pub in_progress: usize,
    pub completed: usize,
    pub by_priority: HashMap<Priority, usize>,
}
```

- Implementasikan `From<&[Task]>` untuk menghitung statistik dari daftar task
- Implementasikan trait `Display` untuk output terformat

### 8. Aplikasi Utama (`src/main.rs`)

Implementasikan command-line interface dengan perintah berikut:

- `add <title> <priority> [category]` - Tambah tugas baru
- `list [filter]` - Tampilkan semua tugas atau tugas terfilter
- `show <id>` - Tampilkan informasi detail tugas
- `update <id> <field> <value>` - Perbarui field tugas
- `complete <id>` - Tandai tugas sebagai selesai
- `delete <id>` - Hapus tugas
- `stats` - Tampilkan statistik tugas
- `help` - Tampilkan perintah yang tersedia
- `quit` - Keluar dari aplikasi

**Persyaratan**:
- Gunakan loop untuk terus menerima perintah
- Parse input pengguna dan tangani perintah yang tidak valid
- Gunakan pattern matching untuk dispatch perintah
- Tangani semua error dengan baik dengan pesan yang user-friendly
- Simpan tugas ke file setelah setiap modifikasi
- Muat tugas dari file saat startup

## Kriteria Validasi

Solusi Anda benar ketika:

1. ✅ Program compile tanpa error atau warning
2. ✅ Semua tipe error didefinisikan dengan implementasi Display yang tepat
3. ✅ Enum Priority dan Status dengan implementasi FromStr
4. ✅ Struct Task dengan semua field dan method yang diperlukan
5. ✅ Trait Serializable diimplementasikan untuk Task
6. ✅ TaskManager bersifat generic dan bekerja dengan tipe Task
7. ✅ TaskFilter mengimplementasikan logika filtering dengan benar
8. ✅ Trait Storage dan implementasi FileStorage bekerja dengan benar
9. ✅ TaskStats menghitung dan menampilkan statistik dengan benar
10. ✅ Semua perintah CLI bekerja sesuai spesifikasi
11. ✅ Tugas persisten di seluruh restart program
12. ✅ Tidak ada penggunaan `unwrap()` atau `panic!()` dalam kode produksi
13. ✅ Semua input pengguna divalidasi
14. ✅ Pesan error jelas dan actionable
15. ✅ Kode diorganisir ke dalam modul

## Contoh Penggunaan

```
=== Task Manager CLI ===
Ketik 'help' untuk perintah yang tersedia

> add "Implement user authentication" high backend
✓ Task #1 dibuat: Implement user authentication [HIGH]

> add "Write documentation" medium docs
✓ Task #2 dibuat: Write documentation [MEDIUM]

> add "Fix login bug" critical backend
✓ Task #3 dibuat: Fix login bug [CRITICAL]

> list
Tasks (3):
  [1] [PENDING] [HIGH] Implement user authentication (backend)
  [2] [PENDING] [MEDIUM] Write documentation (docs)
  [3] [PENDING] [CRITICAL] Fix login bug (backend)

> update 1 status in_progress
✓ Task #1 diperbarui: status = InProgress

> list status=in_progress
Tasks (1):
  [1] [IN_PROGRESS] [HIGH] Implement user authentication (backend)

> complete 3
✓ Task #3 ditandai sebagai selesai

> stats
=== Statistik Task ===
Total Tasks: 3
  Pending: 1
  In Progress: 1
  Completed: 1

Berdasarkan Prioritas:
  Critical: 1
  High: 1
  Medium: 1
  Low: 0

> show 1
Task #1:
  Title: Implement user authentication
  Status: InProgress
  Priority: High
  Category: backend
  Description: None
  Created: 2024-01-15 10:30:00

> delete 2
✓ Task #2 dihapus

> list
Tasks (2):
  [1] [IN_PROGRESS] [HIGH] Implement user authentication (backend)
  [3] [COMPLETED] [CRITICAL] Fix login bug (backend)

> quit
Goodbye!
```

## Organisasi Modul

Project Anda harus diorganisir sebagai berikut:

```
src/
├── main.rs          # CLI interface dan main loop
├── task.rs          # Tipe Task, Priority, Status
├── error.rs         # Tipe error
├── storage.rs       # Trait Storage dan FileStorage
├── filter.rs        # Implementasi TaskFilter
├── stats.rs         # Implementasi TaskStats
└── manager.rs       # Tipe generic TaskManager
```

Gunakan deklarasi `mod` di `main.rs`:
```rust
mod task;
mod error;
mod storage;
mod filter;
mod stats;
mod manager;

use task::{Task, Priority, Status};
use error::TaskError;
// ... dll
```

## Petunjuk

- Mulai dengan modul error - Anda akan menggunakannya di mana-mana
- Implementasikan trait satu per satu dan test mereka
- Gunakan `#[derive(Debug)]` secara liberal untuk debugging
- Test serialisasi/deserialisasi dengan contoh sederhana terlebih dahulu
- Gunakan `match` untuk parsing perintah dan error handling
- Jaga fungsi tetap kecil dan fokus
- Tulis fungsi helper untuk tugas yang berulang
- Gunakan `Result<T, TaskError>` untuk semua operasi yang bisa gagal
- Test operasi file dengan file sementara terlebih dahulu
- Gunakan `trim()` untuk membersihkan input pengguna

## Testing Solusi Anda

Test semua fitur secara sistematis:

1. **Operasi Dasar**:
   - Tambah tugas dengan prioritas berbeda
   - Tampilkan semua tugas
   - Tampilkan detail tugas individual
   - Perbarui field tugas
   - Selesaikan tugas
   - Hapus tugas

2. **Filtering**:
   - Filter berdasarkan status
   - Filter berdasarkan prioritas
   - Filter berdasarkan kategori
   - Kombinasikan beberapa filter

3. **Persistensi**:
   - Tambah tugas dan restart program
   - Verifikasi tugas dimuat dengan benar
   - Modifikasi tugas dan verifikasi perubahan persisten

4. **Error Handling**:
   - Coba perintah yang tidak valid
   - Coba ID tugas yang tidak valid
   - Coba nilai prioritas/status yang tidak valid
   - Coba judul kosong
   - Verifikasi pesan error membantu

5. **Edge Case**:
   - Daftar tugas kosong
   - Judul tugas yang sangat panjang
   - Karakter khusus dalam input
   - File hilang saat pertama kali dijalankan

## Tantangan Ekstensi (Opsional)

Jika Anda selesai lebih awal dan ingin latihan lebih:

1. **Tambahkan due date**:
   - Gunakan crate `chrono` untuk penanganan tanggal
   - Tambahkan `due_date: Option<DateTime<Utc>>` ke Task
   - Urutkan tugas berdasarkan due date
   - Tampilkan tugas yang terlambat

2. **Tambahkan tag**:
   - Tambahkan `tags: Vec<String>` ke Task
   - Filter berdasarkan tag
   - Tampilkan semua tag yang tersedia

3. **Tambahkan subtask**:
   - Tambahkan `subtasks: Vec<Task>` ke Task
   - Lacak persentase penyelesaian
   - Tampilan tugas bersarang

4. **Tingkatkan serialisasi**:
   - Gunakan `serde` dan `serde_json` untuk format JSON
   - Bandingkan dengan implementasi kustom Anda

5. **Tambahkan pencarian**:
   - Cari tugas berdasarkan judul atau deskripsi
   - Gunakan regex untuk pencarian lanjutan

6. **Tambahkan undo/redo**:
   - Lacak riwayat perintah
   - Implementasikan undo untuk operasi terakhir

7. **Tambahkan output berwarna**:
   - Gunakan crate `colored`
   - Beri kode warna pada prioritas
   - Highlight tugas yang selesai

8. **Tambahkan dependensi tugas**:
   - Tugas dapat bergantung pada tugas lain
   - Cegah penyelesaian tugas dengan dependensi yang belum selesai

9. **Tambahkan tugas berulang**:
   - Tugas yang berulang harian/mingguan/bulanan
   - Buat instance baru secara otomatis

10. **Tambahkan export/import**:
    - Export ke CSV atau JSON
    - Import dari format lain

## Pelajaran Terkait

Project ini mengintegrasikan konsep dari semua pelajaran:

- [Pelajaran 01: Fundamentals](../../01-fundamentals/README_ID.md) - Variabel, fungsi, control flow
- [Pelajaran 02: Ownership and Borrowing](../../02-ownership-borrowing/README_ID.md) - Mengelola data task
- [Pelajaran 03: Structs and Enums](../../03-structs-enums/README_ID.md) - Tipe Task, Priority, Status
- [Pelajaran 04: Error Handling](../../04-error-handling/README_ID.md) - TaskError dan tipe Result
- [Pelajaran 05: Traits and Generics](../../05-traits-generics/README_ID.md) - Trait Serializable, TaskManager generic
- [Pelajaran 06: Modules and Cargo](../../06-modules-cargo/README_ID.md) - Organisasi project

## Konteks Solana

Pola yang Anda implementasikan secara langsung paralel dengan pengembangan program Solana:

### Tipe Kustom dan Enum
```rust
// Project Anda
enum Priority { Low, Medium, High, Critical }
enum Status { Pending, InProgress, Completed }

// Program Solana
#[derive(BorshSerialize, BorshDeserialize)]
pub enum InstructionType {
    Initialize,
    Transfer,
    Close,
}
```

### Error Handling
```rust
// Project Anda
enum TaskError {
    NotFound(u32),
    ValidationError(String),
}

// Program Solana
#[error_code]
pub enum ErrorCode {
    #[msg("Account not found")]
    AccountNotFound,
    #[msg("Invalid amount")]
    InvalidAmount,
}
```

### Trait Serialisasi
```rust
// Project Anda
trait Serializable {
    fn serialize(&self) -> String;
    fn deserialize(data: &str) -> Result<Self, TaskError>;
}

// Solana/Anchor
use borsh::{BorshSerialize, BorshDeserialize};

#[account]
pub struct Task {
    pub id: u32,
    pub title: String,
    pub status: Status,
}
// Secara otomatis mengimplementasikan serialisasi Borsh
```

### Storage Generic
```rust
// Project Anda
struct TaskManager<T: Serializable + Clone> {
    tasks: Vec<T>,
}

// Program Solana
#[account]
pub struct Vault<T: BorshSerialize + BorshDeserialize> {
    pub items: Vec<T>,
    pub owner: Pubkey,
}
```

### Pola Validasi
```rust
// Project Anda
impl Task {
    pub fn new(title: String) -> Result<Task, TaskError> {
        if title.is_empty() {
            return Err(TaskError::ValidationError(
                "Title cannot be empty".to_string()
            ));
        }
        Ok(Task { title, /* ... */ })
    }
}

// Program Solana
pub fn create_task(ctx: Context<CreateTask>, title: String) -> Result<()> {
    require!(!title.is_empty(), ErrorCode::EmptyTitle);
    
    let task = &mut ctx.accounts.task;
    task.title = title;
    task.owner = ctx.accounts.authority.key();
    
    Ok(())
}
```

### Manajemen State
```rust
// Project Anda
impl TaskManager<Task> {
    pub fn add_task(&mut self, task: Task) -> u32 {
        let id = self.next_id;
        self.tasks.push(task);
        self.next_id += 1;
        id
    }
}

// Program Solana
pub fn add_task(ctx: Context<AddTask>, title: String) -> Result<()> {
    let task_list = &mut ctx.accounts.task_list;
    
    let task = Task {
        id: task_list.next_id,
        title,
        status: Status::Pending,
    };
    
    task_list.tasks.push(task);
    task_list.next_id += 1;
    
    Ok(())
}
```

Keduanya menekankan:
- Tipe kustom untuk pemodelan domain
- Error handling komprehensif
- Serialisasi untuk persistensi data
- Tipe generic untuk reusabilitas
- Validasi sebelum perubahan state
- Tidak ada panic dalam kode produksi
- Pemisahan concern yang jelas dengan modul

## Butuh Bantuan?

Jika Anda terjebak:

1. Tinjau pelajaran yang relevan untuk setiap komponen yang Anda implementasikan
2. Mulai dengan fitur paling sederhana dan bangun secara bertahap
3. Test setiap modul secara independen sebelum integrasi
4. Gunakan `println!` dengan `{:?}` untuk debugging
5. Periksa pesan error compiler dengan hati-hati
6. Pastikan semua path error mengembalikan tipe `Result`
7. Verifikasi operasi file bekerja dengan file test terlebih dahulu
8. Periksa solusi di direktori `solution/` (tapi coba sendiri dulu!)

## Kriteria Sukses

Anda telah berhasil menyelesaikan project ini ketika:

- ✅ Semua perintah bekerja dengan benar
- ✅ Tugas persisten di seluruh restart
- ✅ Semua error ditangani dengan baik
- ✅ Kode terorganisir dengan baik ke dalam modul
- ✅ Tidak ada warning compiler
- ✅ User experience lancar dan intuitif
- ✅ Anda memahami bagaimana setiap konsep Rust berkontribusi pada solusi

Selamat telah menyelesaikan modul Rust Basics! Anda sekarang memiliki keterampilan Rust fundamental yang dibutuhkan untuk mulai belajar pengembangan program Solana.

---

**Beranda Latihan**: [Semua Latihan](../README_ID.md)  
**Langkah Selanjutnya**: [Rust untuk Solana](../../07-rust-for-solana/README_ID.md) | [Anchor Framework](../../../basics/05-anchor-framework/README_ID.md)

**Bahasa:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
