# Latihan Rust Basics

## Gambaran Umum

Selamat datang di latihan Rust Basics! Tantangan coding praktis ini dirancang untuk memperkuat konsep yang telah Anda pelajari dalam pelajaran. Setiap latihan berfokus pada fundamental Rust tertentu dan mencakup skenario yang relevan dengan Solana untuk mempersiapkan Anda dalam pengembangan blockchain.

Mengerjakan latihan-latihan ini akan membantu Anda:
- Menerapkan konsep Rust dalam skenario praktis
- Membangun muscle memory untuk pola-pola Rust yang umum
- Meningkatkan kepercayaan diri dalam menulis kode Rust
- Mempersiapkan diri untuk pengembangan program Solana

## Cara Menyelesaikan Latihan

### Persiapan

1. Pastikan Anda telah menginstal Rust dan Cargo (lihat [Panduan Setup Rust dan Anchor](../../setup/rust-anchor.md))
2. Navigasi ke direktori latihan yang ingin Anda kerjakan
3. Baca instruksi latihan dalam file README.md
4. Bekerja di direktori `starter/` jika disediakan, atau buat project Anda sendiri

### Alur Kerja

1. **Baca Instruksi:** Setiap latihan memiliki tujuan dan kriteria validasi yang jelas
2. **Tulis Kode Anda:** Implementasikan solusi berdasarkan persyaratan
3. **Test Solusi Anda:** Jalankan `cargo test` untuk memverifikasi implementasi Anda
4. **Bandingkan dengan Solusi:** Periksa direktori `solution/` jika Anda mengalami kesulitan (tapi coba sendiri dulu!)
5. **Eksperimen:** Modifikasi kode untuk mengeksplorasi variasi dan edge case

### Tips untuk Sukses

- **Mulai Sederhana:** Buat fungsionalitas dasar bekerja sebelum menambah kompleksitas
- **Baca Pesan Compiler:** Compiler Rust memberikan pesan error yang membantu—baca dengan teliti
- **Gunakan `cargo check`:** Cepat memeriksa error tanpa membangun project lengkap
- **Konsultasi Pelajaran:** Rujuk kembali ke materi pelajaran saat diperlukan
- **Jangan Mengintip Terlalu Cepat:** Coba selesaikan latihan secara mandiri sebelum melihat solusi
- **Eksperimen Bebas:** Compiler Rust akan menangkap sebagian besar kesalahan—jangan takut mencoba

## Latihan

### [01. Variables dan Functions](01-variables-functions/README.md)
**Tingkat Kesulitan:** Pemula  
**Estimasi Waktu:** 30-45 menit  
**Pelajaran Terkait:** [01-fundamentals](../01-fundamentals/README_ID.md)

Praktikkan sintaks dasar Rust termasuk variabel, mutability, tipe data, dan fungsi. Bangun kalkulator sederhana dan bekerja dengan berbagai tipe numerik.

**Konsep Kunci:**
- Deklarasi variabel dan mutability
- Tipe data primitif
- Definisi fungsi dan parameter
- Return value

### [02. Praktik Ownership](02-ownership-practice/README.md)
**Tingkat Kesulitan:** Menengah  
**Estimasi Waktu:** 1-1.5 jam  
**Pelajaran Terkait:** [02-ownership-borrowing](../02-ownership-borrowing/README_ID.md)

Kuasai sistem ownership Rust melalui tantangan praktis. Bekerja dengan transfer ownership, borrowing, dan reference dalam skenario realistis.

**Konsep Kunci:**
- Aturan ownership dan move semantics
- Borrowing dan reference
- Mutable vs immutable reference
- Pola ownership yang umum

### [03. Latihan Struct dan Enum](03-struct-enum-exercises/README.md)
**Tingkat Kesulitan:** Pemula hingga Menengah  
**Estimasi Waktu:** 1-1.5 jam  
**Pelajaran Terkait:** [03-structs-enums](../03-structs-enums/README_ID.md)

Buat tipe data custom menggunakan struct dan enum. Modelkan struktur account mirip Solana dan implementasikan method.

**Konsep Kunci:**
- Definisi dan instansiasi struct
- Varian enum dan pattern matching
- Method dan associated function
- Pemodelan data

### [04. Praktik Error Handling](04-error-handling-practice/README.md)
**Tingkat Kesulitan:** Menengah  
**Estimasi Waktu:** 1-1.5 jam  
**Pelajaran Terkait:** [04-error-handling](../04-error-handling/README_ID.md)

Tangani error dengan baik menggunakan tipe Result dan Option. Implementasikan pola propagasi error yang digunakan dalam program Solana.

**Konsep Kunci:**
- Tipe Result dan Option
- Propagasi error dengan operator `?`
- Tipe error custom
- Pola error handling

### [05. Implementasi Trait](05-trait-implementation/README.md)
**Tingkat Kesulitan:** Menengah  
**Estimasi Waktu:** 1-1.5 jam  
**Pelajaran Terkait:** [05-traits-generics](../05-traits-generics/README_ID.md)

Implementasikan trait untuk perilaku bersama dan bekerja dengan tipe generic. Praktikkan pola yang mirip dengan trait serialisasi Solana.

**Konsep Kunci:**
- Definisi dan implementasi trait
- Tipe dan fungsi generic
- Trait bound
- Reusabilitas kode

### [06. Mini Project](06-mini-project/README.md)
**Tingkat Kesulitan:** Menengah hingga Lanjutan  
**Estimasi Waktu:** 2-3 jam  
**Pelajaran Terkait:** Semua pelajaran

Bangun mini-project lengkap yang mengintegrasikan semua konsep Rust yang dipelajari dalam modul ini. Buat sistem manajemen account yang disederhanakan mirip dengan arsitektur Solana.

**Konsep Kunci:**
- Semua konsep sebelumnya terintegrasi
- Organisasi project
- Struktur modul
- Aplikasi dunia nyata

## Kriteria Validasi

Setiap latihan mencakup kriteria validasi spesifik untuk membantu Anda memverifikasi solusi Anda:

- **Kompilasi:** Kode Anda harus dikompilasi tanpa error
- **Test:** Semua test yang disediakan harus lulus
- **Fungsionalitas:** Program harus memenuhi persyaratan yang ditentukan
- **Best Practice:** Kode harus mengikuti idiom dan konvensi Rust

Jalankan test dengan:
```bash
cargo test
```

Periksa kode Anda dikompilasi:
```bash
cargo check
```

Build dan jalankan:
```bash
cargo run
```

## Mengatasi Kesulitan

Jika Anda mengalami kesulitan dengan latihan:

1. **Review Pelajaran Terkait:** Kembali ke materi pelajaran untuk konsep tersebut
2. **Baca Error Compiler:** Pesan error Rust sering menyarankan perbaikan
3. **Mulai Lebih Kecil:** Pecah masalah menjadi bagian-bagian yang lebih kecil
4. **Gunakan Print Debugging:** Tambahkan statement `println!` untuk memahami apa yang terjadi
5. **Periksa Solusi:** Jika benar-benar stuck, intip direktori solution untuk petunjuk
6. **Minta Bantuan:** Konsultasi forum komunitas Rust atau Discord

## Latihan Tambahan

Ingin lebih banyak latihan setelah menyelesaikan latihan-latihan ini?

- **[Rustlings](https://github.com/rust-lang/rustlings)** - Latihan kecil yang mencakup konsep Rust
- **[Exercism Rust Track](https://exercism.org/tracks/rust)** - Latihan coding dengan feedback mentor
- **[Rust By Example](https://doc.rust-lang.org/rust-by-example/)** - Belajar melalui contoh beranotasi
- **[Advent of Code](https://adventofcode.com/)** - Selesaikan puzzle programming dalam Rust

## Langkah Selanjutnya

Setelah menyelesaikan latihan-latihan ini:

1. Review konsep apa pun yang menantang
2. Eksperimen dengan variasi latihan
3. Lanjutkan ke [Solana Basics](../../basics/README.md) untuk menerapkan Rust dalam pengembangan blockchain
4. Mulai belajar [Anchor Framework](../../basics/05-anchor-framework/README.md)

## Atribusi Sumber

Desain dan konsep latihan berdasarkan:
- Latihan [The Rust Programming Language Book](https://doc.rust-lang.org/book/)
- Pola latihan [Rustlings](https://github.com/rust-lang/rustlings)
- Pola dan best practice pengembangan program Solana

---

**Module Home:** [Rust Basics](../README_ID.md)

**Bahasa:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
