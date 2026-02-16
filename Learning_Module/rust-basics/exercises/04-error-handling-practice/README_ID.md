# Latihan 04: Praktik Penanganan Error

## Gambaran Umum

Latihan ini membantu Anda mempraktikkan penanganan error dengan tipe `Result` dan `Option` yang dibahas dalam [Pelajaran 04: Penanganan Error](../../04-error-handling/README_ID.md). Anda akan membangun parser dan validator file konfigurasi sederhana yang mendemonstrasikan penanganan error yang tepat, tipe error kustom, dan operator `?`—keterampilan yang penting untuk menulis program Solana yang robust.

**Estimasi Waktu:** 45-60 menit

## Tujuan Pembelajaran

Dengan menyelesaikan latihan ini, Anda akan:

- Menggunakan `Option<T>` untuk merepresentasikan nilai yang mungkin tidak ada
- Menggunakan `Result<T, E>` untuk operasi yang dapat gagal
- Membuat tipe error kustom dengan enum
- Menggunakan operator `?` untuk propagasi error
- Menangani error dengan baik tanpa panic
- Menerapkan pola penanganan error yang mirip dengan program Solana
- Memvalidasi data dan mengembalikan pesan error yang bermakna

## Deskripsi Masalah

Buat parser dan validator file konfigurasi untuk aplikasi sederhana. Sistem Anda harus:

1. Mendefinisikan tipe error kustom untuk berbagai skenario kegagalan
2. Mem-parse nilai konfigurasi dari string
3. Memvalidasi nilai konfigurasi terhadap aturan
4. Menggunakan `Result` dan `Option` dengan tepat
5. Mempropagasi error menggunakan operator `?`
6. Menangani error dengan baik dengan pesan yang bermakna

## Kode Starter

Template proyek Rust dasar disediakan di direktori `starter/`. Template ini mencakup:

- File `Cargo.toml` dengan konfigurasi proyek
- File `src/main.rs` dengan definisi struct dan komentar TODO

Navigasi ke direktori starter dan jalankan:

```bash
cd starter
cargo run
```

## Persyaratan Implementasi

Implementasi Anda harus mencakup:

1. **Enum `ConfigError`** dengan varian berikut:
   - `ParseError { field: String, message: String }`
   - `ValidationError { field: String, message: String }`
   - `MissingField { field: String }`
   - `InvalidRange { field: String, min: i32, max: i32, actual: i32 }`

2. **Struct `Config`** dengan field berikut:
   - `server_name: String`
   - `port: u16`
   - `max_connections: u32`
   - `timeout_seconds: Option<u32>` (field opsional)
   - `admin_email: Option<String>` (field opsional)

3. **Implementasi trait `Display` untuk `ConfigError`**:
   - Format pesan error dengan cara yang user-friendly
   - Sertakan detail yang relevan dari setiap varian error

4. **Fungsi `parse_port`**:
   - Signature fungsi: `fn parse_port(value: &str) -> Result<u16, ConfigError>`
   - Mem-parse string menjadi nomor port u16
   - Mengembalikan `ConfigError::ParseError` jika parsing gagal
   - Mengembalikan `ConfigError::ValidationError` jika port adalah 0

5. **Fungsi `parse_max_connections`**:
   - Signature fungsi: `fn parse_max_connections(value: &str) -> Result<u32, ConfigError>`
   - Mem-parse string menjadi u32
   - Mengembalikan `ConfigError::ParseError` jika parsing gagal
   - Mengembalikan `ConfigError::InvalidRange` jika nilai tidak antara 1 dan 10000

6. **Fungsi `parse_timeout`**:
   - Signature fungsi: `fn parse_timeout(value: Option<&str>) -> Result<Option<u32>, ConfigError>`
   - Mengembalikan `Ok(None)` jika input adalah `None`
   - Mem-parse string dan mengembalikan `Ok(Some(value))` jika valid
   - Mengembalikan `ConfigError::ParseError` jika parsing gagal
   - Mengembalikan `ConfigError::InvalidRange` jika nilai tidak antara 1 dan 3600

7. **Fungsi `validate_email`**:
   - Signature fungsi: `fn validate_email(email: &str) -> Result<(), ConfigError>`
   - Memeriksa apakah email mengandung '@' dan '.'
   - Mengembalikan `ConfigError::ValidationError` jika tidak valid

8. **Fungsi `Config::new`**:
   - Signature fungsi: `fn new(server_name: String, port: u16, max_connections: u32, timeout_seconds: Option<u32>, admin_email: Option<String>) -> Result<Config, ConfigError>`
   - Memvalidasi server_name tidak kosong
   - Memvalidasi port tidak 0
   - Memvalidasi max_connections antara 1 dan 10000
   - Jika timeout_seconds adalah Some, validasi nilainya antara 1 dan 3600
   - Jika admin_email adalah Some, validasi menggunakan `validate_email`
   - Mengembalikan `Ok(Config)` jika semua validasi berhasil

9. **Fungsi `Config::from_strings`**:
   - Signature fungsi: `fn from_strings(server_name: &str, port_str: &str, max_conn_str: &str, timeout_str: Option<&str>, email: Option<&str>) -> Result<Config, ConfigError>`
   - Menggunakan fungsi parsing dengan operator `?`
   - Memanggil `Config::new` untuk membuat dan memvalidasi config
   - Mendemonstrasikan propagasi error

10. **Fungsi `main`** yang mendemonstrasikan:
    - Membuat konfigurasi yang valid
    - Menangani berbagai skenario error
    - Menggunakan pattern matching untuk menampilkan error
    - Bekerja dengan nilai Option

## Kriteria Validasi

Solusi Anda benar ketika:

1. ✅ Program dikompilasi tanpa error atau warning
2. ✅ Enum `ConfigError` memiliki semua empat varian dengan data yang benar
3. ✅ Struct `Config` memiliki semua field yang diperlukan dengan tipe yang benar
4. ✅ Trait `Display` diimplementasikan untuk `ConfigError` dengan pesan yang bermakna
5. ✅ `parse_port` mem-parse dan memvalidasi nomor port dengan benar
6. ✅ `parse_max_connections` mem-parse dan memvalidasi batas koneksi dengan benar
7. ✅ `parse_timeout` menangani input Option dengan benar dan memvalidasi nilai timeout
8. ✅ `validate_email` memvalidasi format email dengan benar
9. ✅ `Config::new` memvalidasi semua field dan mengembalikan error yang sesuai
10. ✅ `Config::from_strings` menggunakan operator `?` untuk propagasi error
11. ✅ Fungsi main mendemonstrasikan kasus sukses dan error
12. ✅ Tidak ada penggunaan `unwrap()` atau `panic!()` dalam kode produksi

## Contoh Output

Program Anda harus menghasilkan output yang mirip dengan ini:

```
=== Configuration Parser and Validator ===

Test 1: Valid configuration
✓ Config created successfully:
  Server: production-server
  Port: 8080
  Max Connections: 1000
  Timeout: 30 seconds
  Admin Email: admin@example.com

Test 2: Invalid port (not a number)
✗ Error: Failed to parse field 'port': invalid digit found in string

Test 3: Invalid port (zero)
✗ Error: Validation failed for field 'port': Port cannot be zero

Test 4: Invalid max_connections (out of range)
✗ Error: Field 'max_connections' value 50000 is out of range (min: 1, max: 10000)

Test 5: Invalid timeout (out of range)
✗ Error: Field 'timeout_seconds' value 7200 is out of range (min: 1, max: 3600)

Test 6: Invalid email format
✗ Error: Validation failed for field 'admin_email': Email must contain '@' and '.'

Test 7: Valid configuration with optional fields as None
✓ Config created successfully:
  Server: dev-server
  Port: 3000
  Max Connections: 100
  Timeout: Not set
  Admin Email: Not set

Test 8: Missing server name
✗ Error: Missing required field: server_name

=== All tests completed ===
```

## Petunjuk

- Gunakan `#[derive(Debug)]` pada enum error Anda untuk debugging yang lebih mudah
- Implementasikan `std::fmt::Display` untuk pesan error yang user-friendly
- Gunakan `str::parse::<T>()` untuk mem-parse string menjadi angka
- Operator `?` secara otomatis mengkonversi error jika trait `From` diimplementasikan
- Gunakan `if let Some(value) = option` untuk bekerja dengan nilai Option
- Ingat bahwa `Option<T>` bisa `None`, jadi tangani kedua kasus
- Gunakan `match` atau `if let` untuk destructure varian error untuk penanganan spesifik
- Uji edge case: string kosong, nilai nol, angka di luar rentang

## Contoh Pattern Matching

Berikut adalah beberapa pola penanganan error yang akan Anda gunakan:

```rust
// Menggunakan operator ? untuk propagasi error
fn parse_config(input: &str) -> Result<Config, ConfigError> {
    let port = parse_port(input)?; // Kembali lebih awal jika error
    let max_conn = parse_max_connections(input)?;
    Ok(Config::new(port, max_conn)?)
}

// Matching pada Result
match Config::from_strings("server", "8080", "100", None, None) {
    Ok(config) => println!("Success: {:?}", config),
    Err(e) => println!("Error: {}", e),
}

// Menangani Option dengan if let
if let Some(timeout) = config.timeout_seconds {
    println!("Timeout: {} seconds", timeout);
} else {
    println!("No timeout set");
}

// Matching varian error spesifik
match result {
    Err(ConfigError::ParseError { field, message }) => {
        println!("Parse error in {}: {}", field, message);
    }
    Err(ConfigError::ValidationError { field, message }) => {
        println!("Validation error in {}: {}", field, message);
    }
    Ok(config) => println!("Config: {:?}", config),
    _ => {}
}
```

## Menguji Solusi Anda

Jalankan program Anda dengan:

```bash
cargo run
```

Uji berbagai skenario:

1. Konfigurasi valid dengan semua field
2. Konfigurasi valid dengan field opsional sebagai None
3. Nomor port tidak valid (non-numerik, nol, di luar rentang)
4. max_connections tidak valid (di luar rentang)
5. Nilai timeout tidak valid
6. Format email tidak valid
7. Nama server kosong

## Tantangan Ekstensi (Opsional)

Jika Anda selesai lebih awal dan ingin lebih banyak latihan:

1. **Tambahkan lebih banyak aturan validasi**:
   - Nama server harus alfanumerik dengan tanda hubung
   - Port harus dalam rentang tertentu (misalnya, 1024-65535 untuk non-privileged)
   - Email harus memiliki ekstensi domain yang valid

2. **Implementasikan trait `From`**:
   - Konversi `std::num::ParseIntError` ke `ConfigError`
   - Ini memungkinkan `?` bekerja secara otomatis dengan parse error

3. **Tambahkan fungsi `Config::from_file`**:
   - Baca konfigurasi dari file
   - Parse pasangan key-value
   - Tangani error I/O file

4. **Buat pola builder**:
   - `ConfigBuilder` dengan metode seperti `with_port()`, `with_timeout()`
   - Validasi hanya ketika `build()` dipanggil
   - Izinkan konfigurasi inkremental

5. **Tambahkan pemulihan error**:
   - Berikan nilai default untuk konfigurasi tidak valid
   - Log error tetapi lanjutkan dengan default
   - Kembalikan config dan daftar warning

6. **Implementasikan konversi error kustom**:
   ```rust
   impl From<std::num::ParseIntError> for ConfigError {
       fn from(err: std::num::ParseIntError) -> Self {
           ConfigError::ParseError {
               field: "unknown".to_string(),
               message: err.to_string(),
           }
       }
   }
   ```

## Pelajaran Terkait

Latihan ini memperkuat konsep dari:

- [Pelajaran 04: Penanganan Error](../../04-error-handling/README_ID.md) - Result, Option, error kustom, operator ?

## Konteks Solana

Pola penanganan error yang Anda praktikkan dapat langsung diterapkan pada pengembangan Solana:

- **Enum error kustom**: Seperti `ConfigError`, program Solana mendefinisikan tipe error kustom
- **Tipe Result**: Solana menggunakan `ProgramResult` yang merupakan `Result<(), ProgramError>`
- **Validasi**: Program Solana memvalidasi data akun dan parameter instruksi
- **Propagasi error**: Operator `?` digunakan secara ekstensif dalam program Solana
- **Tidak panic**: Program Solana harus menangani error dengan baik tanpa panic

Contoh paralel Solana:

```rust
// Latihan Anda
enum ConfigError {
    ParseError { field: String, message: String },
    ValidationError { field: String, message: String },
}

fn parse_port(value: &str) -> Result<u16, ConfigError> {
    let port = value.parse().map_err(|e| ConfigError::ParseError {
        field: "port".to_string(),
        message: format!("{}", e),
    })?;
    
    if port == 0 {
        return Err(ConfigError::ValidationError {
            field: "port".to_string(),
            message: "Port cannot be zero".to_string(),
        });
    }
    
    Ok(port)
}

// Program Solana
use solana_program::{
    entrypoint::ProgramResult,
    program_error::ProgramError,
};

#[derive(Debug)]
enum TokenError {
    InsufficientFunds,
    InvalidAmount,
}

impl From<TokenError> for ProgramError {
    fn from(e: TokenError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

fn transfer_tokens(amount: u64, balance: u64) -> Result<u64, TokenError> {
    if amount == 0 {
        return Err(TokenError::InvalidAmount);
    }
    
    if balance < amount {
        return Err(TokenError::InsufficientFunds);
    }
    
    Ok(balance - amount)
}

pub fn process_transfer(
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    // Validasi akun
    if accounts.len() < 2 {
        return Err(ProgramError::NotEnoughAccountKeys);
    }
    
    // Gunakan operator ? untuk propagasi error
    let from_account = next_account_info(&mut accounts.iter())?;
    let to_account = next_account_info(&mut accounts.iter())?;
    
    // Validasi dan proses
    let new_balance = transfer_tokens(amount, from_balance)?;
    
    Ok(())
}
```

Kedua pola menekankan:
- Tipe error kustom untuk error spesifik domain
- Validasi sebelum pemrosesan
- Propagasi error dengan `?`
- Tidak panic dalam kode produksi
- Pesan error yang jelas dan dapat ditindaklanjuti

## Butuh Bantuan?

Jika Anda terjebak:

1. Tinjau bagian yang relevan dalam [Pelajaran 04: Penanganan Error](../../04-error-handling/README_ID.md)
2. Periksa pesan error compiler - mereka sering menyarankan perbaikan
3. Gunakan `println!` dengan `{:?}` untuk debug nilai Result dan Option
4. Pastikan Anda menggunakan `?` untuk propagasi error, bukan `unwrap()`
5. Pastikan pesan error Anda deskriptif dan menyertakan konteks
6. Periksa solusi di direktori `solution/` (tetapi coba sendiri dulu!)

---

**Beranda Latihan**: [Semua Latihan](../README_ID.md)  
**Pelajaran Terkait**: [Penanganan Error](../../04-error-handling/README_ID.md)

**Bahasa:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
