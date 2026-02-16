# Ownership dan Borrowing

## Gambaran Umum

Ownership adalah fitur paling unik dan powerful dari Rust. Fitur ini memungkinkan Rust menjamin keamanan memori tanpa memerlukan garbage collector, menjadikannya ideal untuk systems programming dan pengembangan blockchain. Memahami ownership, borrowing, dan lifetimes sangat penting untuk menulis kode Rust yang efisien dan aman, terutama dalam program Solana di mana Anda akan terus-menerus bekerja dengan data akun yang harus di-borrow dengan benar.

Pelajaran ini mencakup aturan ownership Rust, cara kerja references dan borrowing, serta dasar-dasar lifetime annotations. Konsep-konsep ini mungkin terasa menantang pada awalnya, tetapi inilah yang membuat program Rust aman sekaligus cepat—kualitas kritis untuk aplikasi blockchain di mana bug bisa sangat mahal.

**Estimasi Waktu:** 3-4 jam

## Tujuan Pembelajaran

Setelah menyelesaikan pelajaran ini, Anda akan dapat:

- Memahami dan menerapkan tiga aturan ownership Rust
- Mengenali kapan ownership dipindahkan vs. disalin
- Menggunakan references untuk meminjam data tanpa mengambil ownership
- Membedakan antara mutable dan immutable references
- Memahami dasar-dasar lifetime annotations
- Menerapkan konsep ownership pada manajemen data akun Solana
- Mencegah kesalahan terkait ownership pada waktu kompilasi

## Prasyarat

- Menyelesaikan [Pelajaran 01: Fundamentals](../01-fundamentals/README_ID.md)
- Memahami variabel, fungsi, dan tipe data dasar
- Familiar dengan konsep stack vs. heap memory (membantu tetapi tidak wajib)

## Aturan Ownership

Sistem ownership Rust dibangun di atas tiga aturan fundamental:

1. **Setiap nilai di Rust memiliki owner**
2. **Hanya boleh ada satu owner pada satu waktu**
3. **Ketika owner keluar dari scope, nilai akan di-drop**

Mari kita eksplorasi apa arti aturan-aturan ini dalam praktik.

### Stack dan Heap

Sebelum mendalami lebih jauh, akan membantu untuk memahami di mana data berada:

- **Stack**: Cepat, data berukuran tetap (integer, boolean, dll.). Data di-push dan di-pop secara berurutan.
- **Heap**: Data berukuran fleksibel (string, vector, dll.). Memori dialokasikan dan harus dibebaskan.

```rust
fn main() {
    // Dialokasikan di stack: ukuran diketahui saat kompilasi
    let x = 5;
    let y = true;
    
    // Dialokasikan di heap: ukuran bisa bertambah
    let s = String::from("hello");
}
```

## Ownership dalam Aksi

### Variable Scope

Sebuah variabel valid dari titik ia dideklarasikan hingga akhir scope-nya:

```rust
fn main() {
    {                      // s belum valid di sini, belum dideklarasikan
        let s = "hello";   // s valid dari titik ini dan seterusnya
        
        // Lakukan sesuatu dengan s
        println!("{}", s);
    }                      // Scope berakhir, s tidak lagi valid
    
    // println!("{}", s); // Error: s tidak dalam scope
}
```

### Ownership dan Move Semantics

Untuk data yang dialokasikan di heap, assignment memindahkan ownership:

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1; // Ownership berpindah dari s1 ke s2
    
    // println!("{}", s1); // Error: value borrowed after move
    println!("{}", s2);    // Ini berfungsi
}
```

**Apa yang terjadi?** Ketika kita meng-assign `s1` ke `s2`, Rust memindahkan ownership. Data string di heap tidak disalin—hanya pointer, length, dan capacity yang disalin. Untuk mencegah double-free errors, Rust meng-invalidate `s1`.

### Deep Copy dengan Clone

Jika Anda ingin menyalin data heap secara mendalam, gunakan `clone()`:

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1.clone(); // Secara eksplisit menyalin data heap
    
    println!("s1 = {}, s2 = {}", s1, s2); // Keduanya valid
}
```

**Catatan:** Cloning bisa mahal untuk struktur data besar. Gunakan secara sengaja.

### Copy Trait untuk Data Stack

Tipe sederhana yang disimpan di stack mengimplementasikan trait `Copy`, sehingga mereka disalin alih-alih dipindahkan:

```rust
fn main() {
    let x = 5;
    let y = x; // x disalin, tidak dipindahkan
    
    println!("x = {}, y = {}", x, y); // Keduanya valid
}
```

**Tipe yang mengimplementasikan Copy:**
- Semua tipe integer (`u32`, `i64`, dll.)
- Tipe boolean (`bool`)
- Tipe floating-point (`f32`, `f64`)
- Tipe character (`char`)
- Tuple yang hanya berisi tipe `Copy`: `(i32, i32)` adalah `Copy`, tetapi `(i32, String)` bukan

## Ownership dan Fungsi

Melewatkan nilai ke fungsi memindahkan atau menyalinnya, sama seperti assignment:

```rust
fn main() {
    let s = String::from("hello");
    takes_ownership(s);  // nilai s berpindah ke dalam fungsi
    // println!("{}", s); // Error: s tidak lagi valid
    
    let x = 5;
    makes_copy(x);       // x disalin ke dalam fungsi
    println!("{}", x);   // x masih valid
}

fn takes_ownership(some_string: String) {
    println!("{}", some_string);
} // some_string keluar dari scope dan di-drop

fn makes_copy(some_integer: i32) {
    println!("{}", some_integer);
} // some_integer keluar dari scope, tetapi tidak ada yang spesial terjadi
```

### Mengembalikan Nilai dan Ownership

Mengembalikan nilai juga dapat mentransfer ownership:

```rust
fn main() {
    let s1 = gives_ownership();         // Return value berpindah ke s1
    
    let s2 = String::from("hello");
    let s3 = takes_and_gives_back(s2);  // s2 berpindah masuk, return value berpindah ke s3
    
    println!("s1 = {}, s3 = {}", s1, s3);
    // println!("{}", s2); // Error: s2 telah dipindahkan
}

fn gives_ownership() -> String {
    let some_string = String::from("yours");
    some_string // Ownership berpindah ke caller
}

fn takes_and_gives_back(a_string: String) -> String {
    a_string // Ownership berpindah ke caller
}
```

**Masalahnya:** Mengambil ownership dan mengembalikannya setiap kali sangat merepotkan. Di sinilah references berperan!

## References dan Borrowing

Sebuah **reference** memungkinkan Anda merujuk ke nilai tanpa mengambil ownership. Membuat reference disebut **borrowing**.

### Immutable References

```rust
fn main() {
    let s1 = String::from("hello");
    let len = calculate_length(&s1); // Lewatkan sebuah reference
    
    println!("The length of '{}' is {}.", s1, len); // s1 masih valid
}

fn calculate_length(s: &String) -> usize {
    s.len()
} // s keluar dari scope, tetapi tidak memiliki data, jadi tidak ada yang di-drop
```

**Simbol `&`** membuat reference. Signature fungsi `&String` berarti "sebuah reference ke String."

**Diagram:**
```
s1 (owner) -> Data String di heap
s (reference) -> menunjuk ke s1
```

### References Bersifat Immutable secara Default

Anda tidak dapat memodifikasi data melalui immutable reference:

```rust
fn main() {
    let s = String::from("hello");
    change(&s); // Error!
}

fn change(some_string: &String) {
    some_string.push_str(", world"); // Error: cannot borrow as mutable
}
```

### Mutable References

Untuk memodifikasi data yang dipinjam, gunakan mutable reference:

```rust
fn main() {
    let mut s = String::from("hello");
    change(&mut s); // Lewatkan mutable reference
    
    println!("{}", s); // Mencetak: hello, world
}

fn change(some_string: &mut String) {
    some_string.push_str(", world");
}
```

**Penting:** Variabel asli juga harus `mut`.

### Aturan References

Rust menerapkan aturan-aturan ini pada waktu kompilasi untuk mencegah data races:

1. **Pada waktu tertentu, Anda dapat memiliki:**
   - Satu mutable reference, ATAU
   - Sejumlah immutable references

2. **References harus selalu valid** (tidak ada dangling references)

#### Aturan 1: Pembatasan Mutable Reference

Anda tidak dapat memiliki beberapa mutable references ke data yang sama dalam scope yang sama:

```rust
fn main() {
    let mut s = String::from("hello");
    
    let r1 = &mut s;
    let r2 = &mut s; // Error: cannot borrow `s` as mutable more than once
    
    println!("{}, {}", r1, r2);
}
```

**Mengapa?** Ini mencegah data races pada waktu kompilasi. Data race terjadi ketika:
- Dua atau lebih pointer mengakses data yang sama secara bersamaan
- Setidaknya satu pointer sedang menulis
- Tidak ada mekanisme sinkronisasi yang digunakan

Anda dapat membuat beberapa mutable references, hanya saja tidak secara bersamaan:

```rust
fn main() {
    let mut s = String::from("hello");
    
    {
        let r1 = &mut s;
        println!("{}", r1);
    } // r1 keluar dari scope
    
    let r2 = &mut s; // Ini tidak masalah
    println!("{}", r2);
}
```

#### Aturan 1 Diperluas: Tidak Dapat Mencampur Mutable dan Immutable

Anda tidak dapat memiliki mutable reference sementara immutable references ada:

```rust
fn main() {
    let mut s = String::from("hello");
    
    let r1 = &s;     // Immutable reference
    let r2 = &s;     // Immutable reference lainnya
    let r3 = &mut s; // Error: cannot borrow as mutable
    
    println!("{}, {}, and {}", r1, r2, r3);
}
```

**Namun**, scope reference berakhir pada penggunaan terakhirnya (Non-Lexical Lifetimes):

```rust
fn main() {
    let mut s = String::from("hello");
    
    let r1 = &s;
    let r2 = &s;
    println!("{} and {}", r1, r2);
    // r1 dan r2 tidak lagi digunakan setelah titik ini
    
    let r3 = &mut s; // Ini tidak masalah!
    println!("{}", r3);
}
```

#### Aturan 2: Tidak Ada Dangling References

Rust mencegah dangling references (references ke memori yang telah dibebaskan):

```rust
fn main() {
    let reference_to_nothing = dangle(); // Error!
}

fn dangle() -> &String {
    let s = String::from("hello");
    &s // Error: mengembalikan reference ke data yang dimiliki fungsi ini
} // s keluar dari scope dan di-drop
```

**Solusi:** Kembalikan nilai yang dimiliki sebagai gantinya:

```rust
fn no_dangle() -> String {
    let s = String::from("hello");
    s // Ownership berpindah ke caller
}
```

## Tipe Slice

Slices memungkinkan Anda mereferensikan urutan elemen yang bersebelahan tanpa mengambil ownership.

### String Slices

String slice adalah reference ke bagian dari String:

```rust
fn main() {
    let s = String::from("hello world");
    
    let hello = &s[0..5];  // Reference ke 5 byte pertama
    let world = &s[6..11]; // Reference ke byte 6-10
    
    println!("{} {}", hello, world);
}
```

**Sintaks slice:**
- `&s[0..5]` - Dari indeks 0 hingga 5 (eksklusif)
- `&s[..5]` - Dari awal hingga 5
- `&s[6..]` - Dari 6 hingga akhir
- `&s[..]` - Seluruh string

**Tipe:** String slices memiliki tipe `&str`.

### Contoh Praktis: First Word

```rust
fn first_word(s: &String) -> &str {
    let bytes = s.as_bytes();
    
    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i]; // Kembalikan slice hingga spasi
        }
    }
    
    &s[..] // Kembalikan seluruh string jika tidak ada spasi
}

fn main() {
    let mut s = String::from("hello world");
    let word = first_word(&s);
    
    println!("First word: {}", word);
    
    // s.clear(); // Error: cannot borrow as mutable while immutable borrow exists
}
```

**Keamanan:** Slice menjaga immutable reference ke string, mencegah modifikasi saat slice sedang digunakan.

### String Literals Adalah Slices

```rust
let s = "Hello, world!"; // Tipe: &str
```

String literals adalah slices yang menunjuk ke lokasi spesifik dalam binary program. Inilah mengapa mereka immutable.

### Slices Lainnya

Slices bekerja dengan koleksi apa pun:

```rust
fn main() {
    let a = [1, 2, 3, 4, 5];
    let slice = &a[1..3]; // Tipe: &[i32]
    
    assert_eq!(slice, &[2, 3]);
}
```

## Lifetimes

Lifetimes adalah cara Rust memastikan references selalu valid. Sebagian besar waktu, lifetimes bersifat implisit dan di-infer, tetapi terkadang Anda perlu meng-annotate-nya secara eksplisit.

### Masalah Lifetime

```rust
fn main() {
    let r;
    
    {
        let x = 5;
        r = &x; // Error: `x` does not live long enough
    }
    
    println!("r: {}", r);
}
```

**Masalah:** `r` mereferensikan `x`, tetapi `x` keluar dari scope sebelum `r` digunakan.

### Sintaks Lifetime Annotation

Lifetime annotations tidak mengubah berapa lama references hidup—mereka mendeskripsikan hubungan antara lifetimes dari beberapa references.

```rust
&i32        // Sebuah reference
&'a i32     // Sebuah reference dengan lifetime eksplisit
&'a mut i32 // Mutable reference dengan lifetime eksplisit
```

**Sintaks `'a`** (dibaca "tick a") adalah parameter lifetime.

### Lifetime Annotations dalam Fungsi

Ketika fungsi mengembalikan reference, Rust perlu tahu input mana yang terkait dengannya:

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

fn main() {
    let string1 = String::from("long string is long");
    let string2 = String::from("xyz");
    
    let result = longest(string1.as_str(), string2.as_str());
    println!("The longest string is {}", result);
}
```

**Apa artinya ini:** Reference yang dikembalikan akan valid selama `x` dan `y` valid. Lifetime `'a` adalah yang lebih kecil dari lifetimes `x` dan `y`.

### Aturan Lifetime Elision

Rust sering dapat meng-infer lifetimes, jadi Anda tidak selalu perlu menulisnya. Ini adalah aturan elision:

1. Setiap parameter yang merupakan reference mendapat parameter lifetime-nya sendiri
2. Jika hanya ada satu input lifetime, itu diberikan ke semua output lifetimes
3. Jika ada beberapa input lifetimes, tetapi salah satunya adalah `&self` atau `&mut self`, lifetime dari `self` diberikan ke semua output lifetimes

**Contoh di mana elision bekerja:**

```rust
fn first_word(s: &str) -> &str {
    // Compiler meng-infer: fn first_word<'a>(s: &'a str) -> &'a str
    let bytes = s.as_bytes();
    
    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }
    
    &s[..]
}
```

### Lifetime Annotations dalam Structs

Ketika struct menyimpan references, Anda memerlukan lifetime annotations:

```rust
struct ImportantExcerpt<'a> {
    part: &'a str,
}

fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().expect("Could not find a '.'");
    
    let i = ImportantExcerpt {
        part: first_sentence,
    };
    
    println!("Excerpt: {}", i.part);
}
```

**Arti:** Instance dari `ImportantExcerpt` tidak dapat hidup lebih lama dari reference yang disimpannya di field `part`.

### Static Lifetime

Lifetime `'static` berarti reference dapat hidup selama durasi program:

```rust
let s: &'static str = "I have a static lifetime.";
```

Semua string literals memiliki lifetime `'static` karena mereka disimpan dalam binary program.

## Konteks Solana

Memahami ownership dan borrowing sangat penting untuk pengembangan Solana karena Anda terus-menerus bekerja dengan data akun yang harus di-borrow dengan benar untuk mencegah data races dan memastikan keamanan.

### Borrowing Data Akun di Solana

Dalam program Solana, akun dilewatkan sebagai references, dan Anda harus mem-borrow data mereka dengan benar:

```rust
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
};

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let account = next_account_info(accounts_iter)?;
    
    // Immutable borrow dari data akun
    let data = account.data.borrow();
    msg!("Account data length: {}", data.len());
    
    // data keluar dari scope, melepaskan borrow
    
    // Sekarang kita dapat mem-borrow secara mutable
    let mut data = account.data.borrow_mut();
    data[0] = 1; // Modifikasi byte pertama
    
    Ok(())
}
```

**Poin kunci:**
- `account.data` adalah `RefCell<&mut [u8]>` yang menerapkan aturan borrowing pada runtime
- `borrow()` membuat immutable reference
- `borrow_mut()` membuat mutable reference
- Anda tidak dapat memiliki keduanya secara bersamaan (diterapkan pada runtime)

### Mencegah Data Races

Aturan borrowing Rust mencegah data races pada waktu kompilasi:

```rust
pub fn safe_account_access(account: &AccountInfo) -> ProgramResult {
    // Ini aman: beberapa immutable borrows
    let data1 = account.data.borrow();
    let data2 = account.data.borrow();
    msg!("Data length: {}, {}", data1.len(), data2.len());
    
    // Ini akan panic pada runtime:
    // let mut data3 = account.data.borrow_mut(); // Panic: already borrowed
    
    Ok(())
}
```

### Account References dan Lifetimes

Account references memiliki lifetimes yang terikat pada eksekusi instruksi:

```rust
pub fn process_instruction<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    instruction_data: &[u8],
) -> ProgramResult {
    // Semua account references valid untuk lifetime 'a
    let account = &accounts[0];
    
    // Reference ini valid selama 'a
    let owner = account.owner;
    
    msg!("Account owner: {}", owner);
    Ok(())
}
```

### Ownership dalam Cross-Program Invocations

Ketika melakukan cross-program invocations (CPI), Anda melewatkan account references:

```rust
use solana_program::{
    account_info::AccountInfo,
    entrypoint::ProgramResult,
    program::invoke,
    instruction::{Instruction, AccountMeta},
    pubkey::Pubkey,
};

pub fn make_cpi<'a>(
    program_id: &Pubkey,
    accounts: &[AccountInfo<'a>],
) -> ProgramResult {
    let account_metas = vec![
        AccountMeta::new(*accounts[0].key, false),
        AccountMeta::new_readonly(*accounts[1].key, false),
    ];
    
    let instruction = Instruction {
        program_id: *program_id,
        accounts: account_metas,
        data: vec![1, 2, 3],
    };
    
    // invoke mem-borrow akun-akun
    invoke(&instruction, accounts)?;
    
    // Setelah invoke kembali, kita dapat menggunakan accounts lagi
    Ok(())
}
```

### Penyederhanaan Anchor Framework

Anchor framework menyediakan abstraksi yang menangani banyak kompleksitas borrowing:

```rust
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        init,
        payer = user,
        space = 8 + 32
    )]
    pub data_account: Account<'info, DataAccount>,
    
    pub system_program: Program<'info, System>,
}

#[account]
pub struct DataAccount {
    pub owner: Pubkey,
}
```

**Manfaat:**
- Anchor menangani borrowing dan lifetime annotations
- Akses akun yang type-safe
- Serialisasi/deserialisasi otomatis
- Semantik ownership yang jelas

## Best Practices

1. **Lebih suka borrowing daripada transfer ownership** - Gunakan references (`&T`) ketika Anda tidak perlu memiliki data:
   ```rust
   // Baik
   fn process_data(data: &String) { }
   
   // Kurang efisien
   fn process_data(data: String) { }
   ```

2. **Gunakan `&str` alih-alih `&String` untuk parameter fungsi** - Lebih fleksibel:
   ```rust
   // Baik: menerima &String dan &str
   fn print_message(msg: &str) {
       println!("{}", msg);
   }
   
   // Kurang fleksibel: hanya menerima &String
   fn print_message(msg: &String) {
       println!("{}", msg);
   }
   ```

3. **Jaga mutable borrows tetap singkat** - Lepaskan sesegera mungkin:
   ```rust
   fn main() {
       let mut s = String::from("hello");
       
       {
           let r = &mut s;
           r.push_str(" world");
       } // r keluar dari scope
       
       // Sekarang kita dapat mem-borrow lagi
       println!("{}", s);
   }
   ```

4. **Gunakan slices untuk parameter fungsi yang fleksibel**:
   ```rust
   // Baik: bekerja dengan array, vector, dan slices
   fn sum(values: &[i32]) -> i32 {
       values.iter().sum()
   }
   ```

5. **Clone hanya ketika diperlukan** - Cloning mahal, jadi gunakan secara sengaja:
   ```rust
   // Jika Anda perlu menyimpan data di beberapa tempat
   let s1 = String::from("hello");
   let s2 = s1.clone(); // Eksplisit dan disengaja
   ```

6. **Dalam program Solana, minimalkan scope borrow**:
   ```rust
   pub fn process(account: &AccountInfo) -> ProgramResult {
       // Borrow, gunakan, dan lepaskan dengan cepat
       {
           let data = account.data.borrow();
           msg!("Length: {}", data.len());
       } // Borrow dilepaskan
       
       // Sekarang kita dapat mem-borrow secara mutable
       let mut data = account.data.borrow_mut();
       data[0] = 1;
       
       Ok(())
   }
   ```

## Kesalahan Umum

1. **Menggunakan nilai setelah memindahkannya**:
   ```rust
   let s1 = String::from("hello");
   let s2 = s1;
   println!("{}", s1); // Error: value borrowed after move
   ```

2. **Beberapa mutable references**:
   ```rust
   let mut s = String::from("hello");
   let r1 = &mut s;
   let r2 = &mut s; // Error: cannot borrow as mutable more than once
   ```

3. **Mencampur mutable dan immutable references**:
   ```rust
   let mut s = String::from("hello");
   let r1 = &s;
   let r2 = &mut s; // Error: cannot borrow as mutable while immutable borrow exists
   ```

4. **Mengembalikan references ke variabel lokal**:
   ```rust
   fn dangle() -> &String {
       let s = String::from("hello");
       &s // Error: returns reference to local variable
   }
   ```

5. **Lupa melepaskan borrows dalam program Solana**:
   ```rust
   pub fn process(account: &AccountInfo) -> ProgramResult {
       let data = account.data.borrow();
       // ... pemrosesan panjang ...
       let mut data_mut = account.data.borrow_mut(); // Panic: already borrowed!
       Ok(())
   }
   ```

6. **Cloning yang tidak perlu**:
   ```rust
   fn process_string(s: String) {
       println!("{}", s);
   }
   
   fn main() {
       let s = String::from("hello");
       process_string(s.clone()); // Tidak perlu jika kita tidak memerlukan s setelahnya
       // Cukup lewatkan s langsung jika Anda tidak membutuhkannya nanti
   }
   ```

## Langkah Selanjutnya

Anda sekarang memahami sistem ownership Rust, yang fundamental untuk menulis kode yang aman dan efisien. Selanjutnya, Anda akan belajar tentang structs dan enums, yang memungkinkan Anda membuat tipe data kustom—penting untuk memodelkan state program Solana dan instruksi.

Lanjutkan ke [Pelajaran 03: Structs dan Enums](../03-structs-enums/README_ID.md) untuk belajar cara mengorganisasi dan menyusun data Anda.

## Atribusi Sumber

Konten dalam pelajaran ini didasarkan pada:

- [The Rust Programming Language Book](https://doc.rust-lang.org/book/) - Bab 4 (Understanding Ownership) dan 10.3 (Validating References with Lifetimes)
- [Rust By Example](https://doc.rust-lang.org/rust-by-example/) - Bagian ownership dan borrowing
- [Solana Program Library Documentation](https://docs.solana.com/developing/on-chain-programs/overview)
- [Anchor Framework Documentation](https://www.anchor-lang.com/)
- Materi referensi Rust komprehensif dalam [rust-full-llms.txt](../../../solana-llms-resources/rust-full-llms.txt)

---

**Sebelumnya**: [Fundamentals](../01-fundamentals/README_ID.md)  
**Selanjutnya**: [Structs dan Enums](../03-structs-enums/README_ID.md)  
**Beranda Modul**: [Rust Basics](../README_ID.md)

**Bahasa:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
