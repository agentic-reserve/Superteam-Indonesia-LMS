# Latihan 02: Praktik Ownership

## Gambaran Umum

Latihan ini membantu Anda mempraktikkan konsep ownership, borrowing, dan lifetime Rust yang dibahas dalam [Pelajaran 02: Ownership dan Borrowing](../../02-ownership-borrowing/README_ID.md). Anda akan bekerja melalui skenario ownership yang umum, memahami kapan menggunakan reference versus nilai yang dimiliki, dan belajar menulis fungsi yang mengelola memori dengan benar.

**Estimasi Waktu:** 45-60 menit

## Tujuan Pembelajaran

Dengan menyelesaikan latihan ini, Anda akan:

- Memahami transfer ownership dan kapan nilai dipindahkan
- Berlatih menggunakan reference (borrowing) untuk menghindari perpindahan yang tidak perlu
- Bekerja dengan mutable dan immutable reference
- Mengenali dan memperbaiki error borrowing yang umum
- Menerapkan konsep ownership untuk membangun library manipulasi string sederhana

## Deskripsi Masalah

Buat library pemrosesan teks yang mendemonstrasikan pola ownership dan borrowing yang tepat. Program Anda harus:

1. Mengambil ownership dari string ketika diperlukan
2. Meminjam string ketika transfer ownership tidak diperlukan
3. Menggunakan mutable reference untuk memodifikasi string di tempat
4. Mengembalikan nilai yang dimiliki dari fungsi ketika sesuai
5. Menangani beberapa reference dengan benar

## Kode Awal

Template proyek Rust dasar disediakan di direktori `starter/`. Template ini mencakup:

- File `Cargo.toml` dengan konfigurasi proyek
- File `src/main.rs` dengan signature fungsi dan komentar TODO

Navigasi ke direktori starter dan jalankan:

```bash
cd starter
cargo run
```

## Persyaratan Implementasi

Implementasi Anda harus mencakup:

1. **Fungsi `take_ownership`** yang mengambil ownership dari String dan mengembalikan panjangnya
   - Signature fungsi: `fn take_ownership(s: String) -> usize`
   - Fungsi ini mengkonsumsi string (mengambil ownership)

2. **Fungsi `borrow_string`** yang meminjam String dan mengembalikan panjangnya tanpa mengambil ownership
   - Signature fungsi: `fn borrow_string(s: &String) -> usize`
   - String asli tetap dapat digunakan setelah pemanggilan fungsi ini

3. **Fungsi `modify_string`** yang mengambil mutable reference dan menambahkan teks
   - Signature fungsi: `fn modify_string(s: &mut String, suffix: &str)`
   - Memodifikasi string di tempat

4. **Fungsi `first_word`** yang mengembalikan reference ke kata pertama dalam string
   - Signature fungsi: `fn first_word(s: &str) -> &str`
   - Mengembalikan string slice yang menunjuk ke kata pertama

5. **Fungsi `create_greeting`** yang membuat dan mengembalikan String baru yang dimiliki
   - Signature fungsi: `fn create_greeting(name: &str) -> String`
   - Membangun pesan greeting dan mengembalikan ownership

6. **Fungsi `main`** yang mendemonstrasikan semua pola ownership:
   - Menunjukkan transfer ownership
   - Menunjukkan borrowing (immutable reference)
   - Menunjukkan mutable borrowing
   - Menunjukkan string slice dan lifetime

## Kriteria Validasi

Solusi Anda benar ketika:

1. ✅ Program dapat dikompilasi tanpa error atau warning
2. ✅ `take_ownership` dengan benar mengkonsumsi string dan mengembalikan panjangnya
3. ✅ `borrow_string` memungkinkan string digunakan setelah pemanggilan fungsi
4. ✅ `modify_string` dengan benar memodifikasi string di tempat
5. ✅ `first_word` mengembalikan string slice yang valid ke kata pertama
6. ✅ `create_greeting` mengembalikan String baru yang dimiliki
7. ✅ Fungsi main mendemonstrasikan semua pola ownership tanpa error borrowing
8. ✅ Tidak ada cloning yang tidak perlu (hanya clone ketika transfer ownership diperlukan)

## Contoh Output

Program Anda harus menghasilkan output yang mirip dengan ini:

```
=== Ownership Practice ===

1. Taking Ownership:
   Original string length: 13
   (String is now consumed and cannot be used)

2. Borrowing (Immutable Reference):
   Borrowed string length: 18
   Original string still usable: Hello, Rust World!

3. Mutable Borrowing:
   Before modification: Hello
   After modification: Hello, Rust!

4. String Slices:
   Full text: Rust programming language
   First word: Rust

5. Creating New Strings:
   Greeting: Hello, Alice! Welcome to Rust.
```

## Petunjuk

- Ketika fungsi mengambil ownership, variabel asli tidak dapat lagi digunakan
- Gunakan `&` untuk membuat immutable reference (borrow)
- Gunakan `&mut` untuk membuat mutable reference (mutable borrow)
- String slice (`&str`) adalah reference ke bagian dari string
- Gunakan `.split_whitespace()` atau `.split(' ')` untuk menemukan kata pertama
- Method `push_str()` menambahkan ke String
- Gunakan `format!()` atau konkatenasi string untuk membuat string baru

## Pola Ownership yang Umum

Latihan ini mendemonstrasikan pola-pola penting berikut:

1. **Consuming functions**: Ambil ownership ketika Anda perlu mentransformasi atau mengkonsumsi nilai
2. **Borrowing functions**: Gunakan reference ketika Anda hanya perlu membaca nilai
3. **Mutable borrowing**: Gunakan `&mut` ketika Anda perlu memodifikasi nilai di tempat
4. **Returning ownership**: Buat dan kembalikan nilai baru ketika diperlukan
5. **String slices**: Gunakan `&str` untuk tampilan read-only ke data string

## Menguji Solusi Anda

Jalankan program Anda dengan:

```bash
cargo run
```

Program harus dikompilasi dan berjalan tanpa error. Perhatikan:

- Error compiler tentang "value borrowed after move"
- Error tentang "cannot borrow as mutable"
- Error tentang "cannot borrow as mutable more than once"

Error ini adalah sistem ownership Rust yang melindungi Anda dari bug memori!

## Tantangan Tambahan (Opsional)

Jika Anda selesai lebih awal dan ingin lebih banyak latihan:

1. **Tambahkan fungsi `longest`** yang mengambil dua string slice dan mengembalikan yang lebih panjang
   - Ini memerlukan anotasi lifetime eksplisit: `fn longest<'a>(s1: &'a str, s2: &'a str) -> &'a str`

2. **Buat fungsi `split_at_word`** yang memisahkan string pada batas kata
   - Mengembalikan dua string slice: `fn split_at_word(s: &str, word: &str) -> (&str, &str)`

3. **Implementasikan struct `WordCounter`** yang meminjam string dan menghitung kata
   - Praktik lifetime struct: `struct WordCounter<'a> { text: &'a str }`

4. **Tambahkan error handling** untuk kasus edge seperti string kosong atau kata yang hilang

5. **Buat tipe `StringBuffer`** yang mengelola string yang dapat tumbuh dengan ownership

## Pelajaran Terkait

Latihan ini memperkuat konsep dari:

- [Pelajaran 02: Ownership dan Borrowing](../../02-ownership-borrowing/README_ID.md) - Aturan ownership, reference, borrowing, lifetime

## Konteks Solana

Memahami ownership sangat penting untuk pengembangan Solana:

- **Account data borrowing**: Program Solana meminjam data akun menggunakan reference
- **Preventing data races**: Aturan borrowing Rust mencegah bug modifikasi konkuren
- **Zero-copy deserialization**: Solana menggunakan reference untuk menghindari penyalinan data akun yang besar
- **Lifetime management**: Reference akun harus hidup cukup lama untuk pemrosesan transaksi

## Butuh Bantuan?

Jika Anda mengalami kesulitan:

1. Tinjau bagian yang relevan di [Pelajaran 02: Ownership dan Borrowing](../../02-ownership-borrowing/README_ID.md)
2. Baca pesan error compiler dengan cermat - mereka menjelaskan apa yang salah
3. Periksa solusi di direktori `solution/` (tapi coba sendiri dulu!)
4. Ingat: jika Anda mendapat error "moved value", pertimbangkan menggunakan reference
5. Gunakan `println!` untuk melihat kapan nilai dipindahkan atau dipinjam

---

**Beranda Latihan**: [Semua Latihan](../README_ID.md)  
**Pelajaran Terkait**: [Ownership dan Borrowing](../../02-ownership-borrowing/README_ID.md)

**Bahasa:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
