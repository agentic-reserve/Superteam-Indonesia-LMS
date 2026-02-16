# Dasar-Dasar Rust

## Gambaran Umum

Selamat datang di pelajaran pertama Anda tentang Rust! Pelajaran ini mencakup blok-blok dasar dari bahasa pemrograman Rust: variabel, tipe data, fungsi, dan alur kontrol. Konsep-konsep ini membentuk dasar untuk semua yang akan Anda bangun di Rust, termasuk program Solana.

Rust adalah bahasa pemrograman sistem yang menekankan keamanan, kecepatan, dan konkurensi. Tidak seperti bahasa dengan garbage collector, Rust memastikan keamanan memori pada waktu kompilasi melalui sistem kepemilikan uniknya (yang akan kita jelajahi di pelajaran berikutnya). Untuk saat ini, kita akan fokus pada dasar-dasar yang akan terasa familiar jika Anda pernah memprogram dalam bahasa lain, sambil menyoroti fitur-fitur khas Rust.

**Estimasi Waktu:** 2-3 jam

## Tujuan Pembelajaran

Setelah menyelesaikan pelajaran ini, Anda akan dapat:

- Mendeklarasikan dan menggunakan variabel dengan mutabilitas yang tepat
- Bekerja dengan tipe data primitif Rust (integer, float, boolean, karakter)
- Memahami tipe string dan perbedaannya
- Mendefinisikan dan memanggil fungsi dengan parameter dan nilai kembalian
- Menggunakan struktur alur kontrol (if, loop, while, for)
- Mengenali struktur program Solana dasar dan entry point

## Prasyarat

- Pengetahuan pemrograman dasar dalam bahasa apa pun
- Lingkungan pengembangan Rust sudah diatur (lihat [Panduan Setup Rust dan Anchor](../../setup/rust-anchor.md))
- Familiar dengan antarmuka command-line

## Variabel dan Mutabilitas

### Mendeklarasikan Variabel

Di Rust, variabel dideklarasikan menggunakan kata kunci `let`. Secara default, variabel bersifat **immutable**, artinya nilainya tidak dapat diubah setelah ditetapkan:

```rust
fn main() {
    let x = 5;
    println!("The value of x is: {}", x);
    
    // Ini akan menyebabkan error kompilasi:
    // x = 6; // Error: cannot assign twice to immutable variable
}
```

### Variabel Mutable

Untuk membuat variabel mutable, gunakan kata kunci `mut`:

```rust
fn main() {
    let mut x = 5;
    println!("The value of x is: {}", x);
    
    x = 6; // Ini diperbolehkan karena x adalah mutable
    println!("The value of x is now: {}", x);
}
```

**Mengapa immutability secara default?** Immutability default Rust membantu mencegah bug dengan membuat eksplisit kapan nilai dapat berubah. Ini sangat penting dalam pemrograman konkuren dan pengembangan blockchain di mana perubahan state yang tidak terduga dapat menyebabkan kerentanan keamanan.

### Konstanta

Konstanta selalu immutable dan harus memiliki anotasi tipe secara eksplisit:

```rust
const MAX_POINTS: u32 = 100_000;

fn main() {
    println!("The maximum points are: {}", MAX_POINTS);
}
```

**Perbedaan antara konstanta dan variabel immutable:**
- Konstanta menggunakan `const` bukan `let`
- Konstanta harus memiliki anotasi tipe
- Konstanta dapat dideklarasikan di scope mana pun, termasuk global
- Konstanta hanya dapat diatur ke ekspresi konstan, bukan dihitung saat runtime

### Shadowing

Rust memungkinkan Anda mendeklarasikan variabel baru dengan nama yang sama dengan variabel sebelumnya, secara efektif "membayangi" nilai sebelumnya:

```rust
fn main() {
    let x = 5;
    let x = x + 1; // Membayangi x sebelumnya
    
    {
        let x = x * 2; // Membayangi lagi dalam scope ini
        println!("The value of x in the inner scope is: {}", x); // 12
    }
    
    println!("The value of x is: {}", x); // 6
}
```

Shadowing berbeda dari menandai variabel sebagai `mut` karena kita membuat variabel baru, yang memungkinkan kita mengubah tipe:

```rust
fn main() {
    let spaces = "   ";           // Tipe String
    let spaces = spaces.len();    // Tipe Number - ini diperbolehkan!
    
    // Dengan mut, ini tidak akan diperbolehkan:
    // let mut spaces = "   ";
    // spaces = spaces.len(); // Error: mismatched types
}
```

## Tipe Data

Rust adalah bahasa **statically typed**, artinya semua tipe variabel harus diketahui pada waktu kompilasi. Compiler biasanya dapat menyimpulkan tipe, tetapi terkadang Anda perlu menambahkan anotasi tipe.

### Tipe Skalar

Tipe skalar mewakili satu nilai. Rust memiliki empat tipe skalar utama:

#### 1. Integer

Integer adalah angka tanpa komponen pecahan. Rust menyediakan integer signed dan unsigned dengan berbagai ukuran:

| Panjang | Signed | Unsigned |
|---------|--------|----------|
| 8-bit   | i8     | u8       |
| 16-bit  | i16    | u16      |
| 32-bit  | i32    | u32      |
| 64-bit  | i64    | u64      |
| 128-bit | i128   | u128     |
| arch    | isize  | usize    |

```rust
fn main() {
    let a: i32 = 42;           // Integer signed 32-bit (default)
    let b: u64 = 100;          // Integer unsigned 64-bit
    let c = 255u8;             // Notasi suffix tipe
    
    // Literal angka dapat menggunakan underscore untuk keterbacaan
    let million = 1_000_000;
    
    // Format angka yang berbeda
    let decimal = 98_222;      // Desimal
    let hex = 0xff;            // Heksadesimal
    let octal = 0o77;          // Oktal
    let binary = 0b1111_0000;  // Biner
    let byte = b'A';           // Byte (hanya u8)
    
    println!("Decimal: {}, Hex: {}, Binary: {}", decimal, hex, binary);
}
```

**Integer overflow:** Dalam mode debug, Rust memeriksa integer overflow dan panic. Dalam mode release, Rust melakukan two's complement wrapping. Gunakan metode seperti `wrapping_add`, `checked_add`, `overflowing_add`, atau `saturating_add` untuk penanganan overflow eksplisit.

#### 2. Floating-Point Number

Rust memiliki dua tipe floating-point: `f32` (32-bit) dan `f64` (64-bit, default):

```rust
fn main() {
    let x = 2.0;      // f64 (default)
    let y: f32 = 3.0; // f32
    
    // Aritmatika dasar
    let sum = 5.5 + 10.2;
    let difference = 95.5 - 4.3;
    let product = 4.0 * 30.0;
    let quotient = 56.7 / 32.2;
    
    println!("Sum: {}, Product: {}", sum, product);
}
```

#### 3. Boolean

Tipe boolean memiliki dua nilai yang mungkin: `true` dan `false`:

```rust
fn main() {
    let t = true;
    let f: bool = false; // Dengan anotasi tipe eksplisit
    
    // Boolean sering digunakan dalam kondisional
    if t {
        println!("The condition is true!");
    }
}
```

#### 4. Karakter

Tipe `char` mewakili satu nilai skalar Unicode:

```rust
fn main() {
    let c = 'z';
    let z: char = 'ℤ';
    let heart_eyed_cat = '😻';
    
    println!("Character: {}, Unicode: {}, Emoji: {}", c, z, heart_eyed_cat);
}
```

**Catatan:** Literal `char` menggunakan tanda kutip tunggal, sedangkan literal string menggunakan tanda kutip ganda. Sebuah `char` berukuran 4 byte dan mewakili Unicode Scalar Value.

### Tipe Compound

Tipe compound dapat mengelompokkan beberapa nilai menjadi satu tipe.

#### 1. Tuple

Tuple mengelompokkan nilai-nilai dengan tipe yang berbeda:

```rust
fn main() {
    let tup: (i32, f64, u8) = (500, 6.4, 1);
    
    // Destructuring
    let (x, y, z) = tup;
    println!("The value of y is: {}", y);
    
    // Akses berdasarkan indeks
    let five_hundred = tup.0;
    let six_point_four = tup.1;
    let one = tup.2;
    
    println!("First element: {}", five_hundred);
}
```

Tuple tanpa nilai apa pun, `()`, disebut **unit type** dan mewakili nilai kosong atau tipe kembalian kosong.

#### 2. Array

Array memiliki panjang tetap dan semua elemen harus bertipe sama:

```rust
fn main() {
    let a = [1, 2, 3, 4, 5];
    let months = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"];
    
    // Array dengan anotasi tipe
    let b: [i32; 5] = [1, 2, 3, 4, 5];
    
    // Inisialisasi array dengan nilai yang sama
    let c = [3; 5]; // Sama dengan [3, 3, 3, 3, 3]
    
    // Mengakses elemen
    let first = a[0];
    let second = a[1];
    
    println!("First element: {}, Second element: {}", first, second);
}
```

**Pemeriksaan batas array:** Rust memeriksa batas array saat runtime. Mengakses indeks yang tidak valid akan menyebabkan panic:

```rust
fn main() {
    let a = [1, 2, 3, 4, 5];
    let index = 10;
    
    // Ini akan panic saat runtime
    // let element = a[index];
}
```

### Tipe String

Rust memiliki dua tipe string utama:

#### 1. String Slice (`&str`)

String slice adalah referensi immutable ke data string, sering digunakan untuk literal string:

```rust
fn main() {
    let s = "Hello, world!"; // Tipe: &str
    println!("{}", s);
}
```

#### 2. String (`String`)

`String` adalah tipe string yang dapat tumbuh dan dialokasikan di heap:

```rust
fn main() {
    let mut s = String::from("Hello");
    s.push_str(", world!"); // Menambahkan ke string
    println!("{}", s);
    
    // Konversi &str ke String
    let s1 = "initial contents".to_string();
    let s2 = String::from("initial contents");
}
```

**Perbedaan utama:**
- `&str` adalah referensi berukuran tetap ke data string (sering di binary program atau stack)
- `String` adalah string yang dapat tumbuh dan dialokasikan di heap yang dapat dimodifikasi
- Dalam program Solana, Anda akan sering menggunakan `&str` untuk efisiensi

## Fungsi

Fungsi dideklarasikan menggunakan kata kunci `fn`. Rust menggunakan snake_case untuk nama fungsi dan variabel:

```rust
fn main() {
    println!("Hello, world!");
    
    another_function();
    function_with_parameters(5, 'h');
    
    let result = function_with_return_value();
    println!("The result is: {}", result);
}

fn another_function() {
    println!("Another function.");
}

fn function_with_parameters(value: i32, unit_label: char) {
    println!("The measurement is: {}{}", value, unit_label);
}

fn function_with_return_value() -> i32 {
    5 // Tanpa semicolon - ini adalah ekspresi yang mengembalikan nilai
}
```

### Parameter

Parameter fungsi harus memiliki anotasi tipe:

```rust
fn print_sum(x: i32, y: i32) {
    println!("The sum is: {}", x + y);
}
```

### Nilai Kembalian

Fungsi mengembalikan ekspresi terakhir secara implisit, atau menggunakan `return` untuk kembalian awal:

```rust
fn add_one(x: i32) -> i32 {
    x + 1 // Tanpa semicolon - ini adalah nilai kembalian
}

fn add_two(x: i32) -> i32 {
    return x + 2; // Return eksplisit
}

fn main() {
    let result1 = add_one(5);
    let result2 = add_two(5);
    println!("Results: {}, {}", result1, result2);
}
```

**Penting:** Menambahkan semicolon mengubah ekspresi menjadi statement, yang tidak mengembalikan nilai:

```rust
fn wrong_add_one(x: i32) -> i32 {
    x + 1; // Error! Ini adalah statement, bukan ekspresi
}
```

### Statement vs Ekspresi

- **Statement** melakukan aksi tetapi tidak mengembalikan nilai
- **Ekspresi** mengevaluasi ke nilai hasil

```rust
fn main() {
    let y = {
        let x = 3;
        x + 1 // Ekspresi - tanpa semicolon
    };
    
    println!("The value of y is: {}", y); // 4
}
```

## Alur Kontrol

### Ekspresi If

```rust
fn main() {
    let number = 6;
    
    if number % 4 == 0 {
        println!("number is divisible by 4");
    } else if number % 3 == 0 {
        println!("number is divisible by 3");
    } else if number % 2 == 0 {
        println!("number is divisible by 2");
    } else {
        println!("number is not divisible by 4, 3, or 2");
    }
}
```

**If sebagai ekspresi:** Karena `if` adalah ekspresi, Anda dapat menggunakannya di sisi kanan statement `let`:

```rust
fn main() {
    let condition = true;
    let number = if condition { 5 } else { 6 };
    
    println!("The value of number is: {}", number);
}
```

**Catatan:** Kedua cabang harus mengembalikan tipe yang sama!

### Loop

Rust memiliki tiga jenis loop: `loop`, `while`, dan `for`.

#### 1. Loop

Kata kunci `loop` membuat loop tak terbatas:

```rust
fn main() {
    let mut counter = 0;
    
    let result = loop {
        counter += 1;
        
        if counter == 10 {
            break counter * 2; // Mengembalikan nilai dari loop
        }
    };
    
    println!("The result is: {}", result); // 20
}
```

#### 2. While

Loop kondisional:

```rust
fn main() {
    let mut number = 3;
    
    while number != 0 {
        println!("{}!", number);
        number -= 1;
    }
    
    println!("LIFTOFF!!!");
}
```

#### 3. For

Iterasi melalui koleksi:

```rust
fn main() {
    let a = [10, 20, 30, 40, 50];
    
    for element in a {
        println!("The value is: {}", element);
    }
    
    // Menggunakan range
    for number in 1..4 {
        println!("{}!", number);
    }
    
    // Range terbalik
    for number in (1..4).rev() {
        println!("{}!", number);
    }
}
```

**Sintaks range:**
- `1..4` - Range eksklusif (1, 2, 3)
- `1..=4` - Range inklusif (1, 2, 3, 4)

### Label Loop

Anda dapat memberi label pada loop untuk break atau continue loop tertentu dalam struktur bersarang:

```rust
fn main() {
    let mut count = 0;
    'counting_up: loop {
        println!("count = {}", count);
        let mut remaining = 10;
        
        loop {
            println!("remaining = {}", remaining);
            if remaining == 9 {
                break; // Break loop dalam
            }
            if count == 2 {
                break 'counting_up; // Break loop luar
            }
            remaining -= 1;
        }
        
        count += 1;
    }
    println!("End count = {}", count);
}
```

## Konteks Solana

Sekarang setelah Anda memahami dasar-dasar Rust, mari kita lihat bagaimana mereka diterapkan pada pengembangan program Solana.

### Struktur Program Solana Dasar

Program Solana minimal menggunakan konsep-konsep fundamental ini:

```rust
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
};

// Deklarasikan entrypoint program
entrypoint!(process_instruction);

// Fungsi entrypoint program
pub fn process_instruction(
    program_id: &Pubkey,        // Public key program
    accounts: &[AccountInfo],   // Akun yang terlibat dalam instruksi
    instruction_data: &[u8],    // Data instruksi sebagai byte
) -> ProgramResult {
    // Log pesan
    msg!("Hello, Solana!");
    
    // Kembalikan Ok untuk menunjukkan sukses
    Ok(())
}
```

**Pengamatan kunci:**
- **Signature fungsi:** Fungsi entrypoint memiliki parameter spesifik yang diperlukan oleh Solana
- **Referensi:** Parameter menggunakan `&` (referensi) - kita akan membahas ini di pelajaran berikutnya
- **Array:** `accounts` adalah array slice `&[AccountInfo]`
- **Tipe kembalian:** `ProgramResult` adalah alias tipe untuk `Result<(), ProgramError>`
- **Macro:** `msg!` adalah macro (ditandai dengan `!`) untuk logging

### Variabel dalam Program Solana

```rust
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Variabel immutable
    let account_count = accounts.len();
    msg!("Processing {} accounts", account_count);
    
    // Variabel mutable untuk melacak state
    let mut total_lamports: u64 = 0;
    
    // Loop melalui akun
    for account in accounts.iter() {
        total_lamports += account.lamports();
    }
    
    msg!("Total lamports: {}", total_lamports);
    
    Ok(())
}
```

### Tipe Data dalam Solana

Program Solana umumnya menggunakan tipe-tipe ini:

```rust
use solana_program::pubkey::Pubkey;

pub fn example_types() {
    // Public key (alamat 32-byte)
    let program_id = Pubkey::default();
    
    // Lamport (u64) - unit terkecil SOL
    let lamports: u64 = 1_000_000_000; // 1 SOL
    
    // Data instruksi (array byte)
    let data: &[u8] = &[1, 2, 3, 4];
    
    // Flag boolean
    let is_initialized: bool = true;
    
    // Ukuran data akun
    let data_len: usize = 100;
}
```

### Alur Kontrol dalam Program Solana

```rust
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program_error::ProgramError,
    pubkey::Pubkey,
    msg,
};

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Dapatkan byte pertama sebagai tipe instruksi
    let instruction_type = instruction_data
        .get(0)
        .ok_or(ProgramError::InvalidInstructionData)?;
    
    // Route ke handler yang berbeda berdasarkan tipe instruksi
    match instruction_type {
        0 => {
            msg!("Instruction: Initialize");
            // Tangani inisialisasi
        }
        1 => {
            msg!("Instruction: Update");
            // Tangani update
        }
        _ => {
            msg!("Unknown instruction");
            return Err(ProgramError::InvalidInstructionData);
        }
    }
    
    Ok(())
}
```

**Pattern matching** (ekspresi `match`) sangat umum dalam program Solana untuk routing instruksi dan menangani kasus yang berbeda. Kita akan menjelajahi ini lebih lanjut di pelajaran Struct dan Enum.

## Best Practice

1. **Gunakan immutability secara default** - Hanya gunakan `mut` ketika Anda perlu mengubah nilai. Ini mencegah modifikasi yang tidak disengaja dan membuat kode lebih mudah dipahami.

2. **Pilih tipe integer yang sesuai** - Gunakan `u64` untuk lamport, `usize` untuk indeks array, dan tipe berukuran (`u8`, `u32`, dll.) untuk struktur data spesifik.

3. **Lebih suka ekspresi daripada statement** - Sifat berorientasi ekspresi Rust menghasilkan kode yang lebih ringkas:
   ```rust
   // Baik
   let status = if is_valid { "valid" } else { "invalid" };
   
   // Kurang idiomatis
   let status;
   if is_valid {
       status = "valid";
   } else {
       status = "invalid";
   }
   ```

4. **Gunakan nama variabel yang deskriptif** - Ikuti konvensi snake_case Rust dan gunakan nama yang jelas:
   ```rust
   let account_balance = 1000; // Baik
   let ab = 1000;              // Hindari
   ```

5. **Tangani error secara eksplisit** - Jangan abaikan error potensial. Gunakan tipe `Result` dan operator `?` (dibahas di pelajaran Error Handling).

6. **Gunakan loop `for` untuk iterasi** - Mereka lebih aman daripada loop while dengan indexing manual:
   ```rust
   // Baik
   for account in accounts.iter() {
       // Proses akun
   }
   
   // Hindari (rawan error)
   let mut i = 0;
   while i < accounts.len() {
       let account = &accounts[i];
       i += 1;
   }
   ```

7. **Manfaatkan inferensi tipe** - Biarkan compiler menyimpulkan tipe ketika jelas:
   ```rust
   let x = 5;           // Tipe disimpulkan sebagai i32
   let y: u64 = 5;      // Eksplisit ketika diperlukan
   ```

## Kesalahan Umum

1. **Lupa mutabilitas** - Mencoba memodifikasi variabel immutable:
   ```rust
   let x = 5;
   x = 6; // Error: cannot assign twice to immutable variable
   ```

2. **Menambahkan semicolon ke ekspresi kembalian**:
   ```rust
   fn add_one(x: i32) -> i32 {
       x + 1; // Error: expected i32, found ()
   }
   ```

3. **Ketidakcocokan tipe dalam ekspresi if**:
   ```rust
   let number = if condition { 5 } else { "six" }; // Error: mismatched types
   ```

4. **Integer overflow dalam mode release** - Gunakan aritmatika checked:
   ```rust
   let result = value.checked_add(1).ok_or(ProgramError::Overflow)?;
   ```

5. **Membingungkan `String` dan `&str`** - Ingat bahwa `&str` adalah referensi ke data string, sedangkan `String` memiliki datanya sendiri.

## Langkah Selanjutnya

Sekarang setelah Anda memahami dasar-dasar Rust, Anda siap untuk mempelajari fitur paling khas Rust: sistem kepemilikan. Ini sangat penting untuk memahami bagaimana program Solana mengelola data akun dengan aman.

Lanjutkan ke [Pelajaran 02: Ownership dan Borrowing](../02-ownership-borrowing/README_ID.md) untuk menguasai manajemen memori di Rust.

## Atribusi Sumber

Konten dalam pelajaran ini didasarkan pada:

- [The Rust Programming Language Book](https://doc.rust-lang.org/book/) - Bab 3 (Common Programming Concepts)
- [Rust By Example](https://doc.rust-lang.org/rust-by-example/) - Bagian tipe dasar dan alur kontrol
- [Dokumentasi Solana Program Library](https://docs.solana.com/developing/on-chain-programs/overview)
- Materi referensi Rust komprehensif di [rust-full-llms.txt](../../../solana-llms-resources/rust-full-llms.txt)

---

**Sebelumnya**: [Beranda Modul](../README_ID.md)  
**Selanjutnya**: [Ownership dan Borrowing](../02-ownership-borrowing/README_ID.md)  
**Beranda Modul**: [Dasar-Dasar Rust](../README_ID.md)

**Bahasa:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
