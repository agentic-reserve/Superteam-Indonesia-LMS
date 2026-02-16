# Dasar-Dasar Rust untuk Pengembangan Solana

## Gambaran Umum

Selamat datang di Modul Pembelajaran Dasar-Dasar Rust! Modul ini menyediakan pengetahuan dasar pemrograman Rust yang dirancang khusus untuk pengembangan blockchain Solana. Baik Anda baru mengenal Rust atau memerlukan penyegaran sebelum terjun ke program Solana, modul ini akan memandu Anda melalui konsep-konsep penting dengan contoh praktis yang relevan dengan Solana.

Rust adalah bahasa utama untuk menulis program Solana, dan memahami konsep intinya—terutama ownership, borrowing, dan type safety—sangat penting untuk membangun aplikasi blockchain yang aman dan efisien. Modul ini menjembatani pengetahuan Rust umum dengan pola-pola khusus Solana, mempersiapkan Anda untuk framework Anchor dan pengembangan program Solana native.

**Total Estimasi Waktu:** 15-20 jam

## Tujuan Pembelajaran

Dengan menyelesaikan modul ini, Anda akan:

- Memahami sintaks dasar Rust, tipe data, dan control flow
- Menguasai sistem ownership Rust dan bagaimana mencegah kesalahan pemrograman umum
- Bekerja dengan percaya diri menggunakan struct, enum, dan pattern matching
- Menangani error secara efektif menggunakan tipe Result dan Option
- Mengimplementasikan trait dan menggunakan generic untuk kode yang fleksibel dan dapat digunakan kembali
- Mengorganisir kode menggunakan modul dan mengelola dependensi dengan Cargo
- Menerapkan konsep Rust langsung ke pola pengembangan program Solana
- Membaca dan memahami kode program Solana yang ditulis dalam Rust

## Prasyarat

Sebelum memulai modul ini, Anda harus memiliki:

- Pengetahuan pemrograman dasar dalam bahasa apa pun (variabel, fungsi, loop, kondisional)
- Keakraban dengan command-line interface
- Lingkungan pengembangan yang sudah diatur (lihat [Panduan Setup Rust dan Anchor](../setup/rust-anchor.md))
- Motivasi untuk belajar pengembangan blockchain Solana

**Tidak diperlukan pengalaman Rust sebelumnya!** Modul ini dimulai dari dasar.

## Pelajaran

### [01. Fundamentals](01-fundamentals/README_ID.md)
**Estimasi Waktu:** 2-3 jam  
**Tingkat Kesulitan:** Pemula

Pelajari sintaks dasar Rust termasuk variabel, mutability, tipe data, fungsi, dan control flow. Pahami bagaimana fundamental ini diterapkan pada struktur program Solana.

**Topik:**
- Variabel dan mutability
- Tipe data primitif
- Fungsi dan parameter
- Control flow (if, loop, while, for)
- Entry point program Solana

### [02. Ownership and Borrowing](02-ownership-borrowing/README_ID.md)
**Estimasi Waktu:** 3-4 jam  
**Tingkat Kesulitan:** Menengah

Kuasai sistem ownership unik Rust, referensi, dan aturan borrowing. Temukan bagaimana konsep-konsep ini mencegah data race dan memastikan keamanan memori dalam program Solana.

**Topik:**
- Aturan ownership dan move semantics
- Referensi dan borrowing
- Referensi mutable vs immutable
- Dasar-dasar lifetime
- Borrowing data akun di Solana

### [03. Structs and Enums](03-structs-enums/README_ID.md)
**Estimasi Waktu:** 2-3 jam  
**Tingkat Kesulitan:** Pemula hingga Menengah

Bekerja dengan tipe data kustom menggunakan struct dan enum. Pelajari pattern matching dan lihat bagaimana struktur ini memodelkan data akun dan instruksi Solana.

**Topik:**
- Mendefinisikan dan menggunakan struct
- Enum dan varian
- Pattern matching dengan match
- Method dan associated function
- Struktur akun Solana

### [04. Error Handling](04-error-handling/README_ID.md)
**Estimasi Waktu:** 2-3 jam  
**Tingkat Kesulitan:** Menengah

Tangani error dengan baik menggunakan tipe Result dan Option Rust. Pelajari pola propagasi error yang digunakan di seluruh pengembangan program Solana.

**Topik:**
- Tipe Result dan Option
- Operator ? untuk propagasi error
- Tipe error kustom
- ProgramResult dan ProgramError di Solana

### [05. Traits and Generics](05-traits-generics/README_ID.md)
**Estimasi Waktu:** 2-3 jam  
**Tingkat Kesulitan:** Menengah

Implementasikan trait untuk perilaku bersama dan gunakan generic untuk kode yang fleksibel. Pahami trait serialisasi yang penting untuk penanganan data Solana.

**Topik:**
- Mendefinisikan dan mengimplementasikan trait
- Tipe dan fungsi generic
- Trait bound dan constraint
- Serialisasi Borsh di Solana

### [06. Modules and Cargo](06-modules-cargo/README_ID.md)
**Estimasi Waktu:** 2-3 jam  
**Tingkat Kesulitan:** Pemula hingga Menengah

Organisir kode dengan sistem modul Rust dan kelola proyek dengan Cargo. Pelajari bagaimana program Solana dan proyek Anchor terstruktur.

**Topik:**
- Sistem modul dan visibility
- Organisasi crate
- Konfigurasi Cargo.toml
- Dependensi dan fitur
- Struktur framework Anchor

### [07. Rust for Solana](07-rust-for-solana/README_ID.md)
**Estimasi Waktu:** 2-3 jam  
**Tingkat Kesulitan:** Menengah

Jembatani semua konsep Rust ke pengembangan program Solana. Pelajari pola umum, baca kode Solana nyata, dan bersiap untuk framework Anchor.

**Topik:**
- Pola Rust khusus Solana
- Membaca kode program Solana
- Pola validasi akun
- Serialisasi dan deserialisasi data
- Langkah selanjutnya dengan Anchor

## Jalur Pembelajaran

### Urutan yang Direkomendasikan

1. **Mulai Di Sini:** Selesaikan pelajaran 01-07 secara berurutan untuk pengalaman belajar terstruktur
2. **Praktik:** Kerjakan latihan setelah menyelesaikan pelajaran terkait
3. **Terapkan:** Bangun mini-project untuk mengintegrasikan semua konsep
4. **Lanjutkan:** Pindah ke [Framework Anchor](../basics/05-anchor-framework/README_ID.md) untuk pengembangan khusus Solana

### Jalur Alternatif

**Jalur Cepat (Jika Anda sudah tahu dasar Rust):**
- Tinjau pelajaran 02 (Ownership) dan 04 (Error Handling)
- Fokus pada pelajaran 07 (Rust for Solana)
- Selesaikan latihan yang berfokus pada Solana

**Pendalaman (Untuk pemahaman menyeluruh):**
- Selesaikan semua pelajaran secara berurutan
- Kerjakan semua latihan
- Jelajahi sumber daya tambahan
- Bangun proyek kustom yang menerapkan konsep

## Latihan

Tantangan coding praktis untuk memperkuat pembelajaran Anda:

- **[Latihan 01: Variables and Functions](exercises/01-variables-functions/README_ID.md)** - Praktikkan sintaks dasar Rust
- **[Latihan 02: Ownership Practice](exercises/02-ownership-practice/README_ID.md)** - Kuasai ownership dan borrowing
- **[Latihan 03: Struct and Enum Exercises](exercises/03-struct-enum-exercises/README_ID.md)** - Bekerja dengan tipe kustom
- **[Latihan 04: Error Handling Practice](exercises/04-error-handling-practice/README_ID.md)** - Tangani error secara efektif
- **[Latihan 05: Trait Implementation](exercises/05-trait-implementation/README_ID.md)** - Implementasikan trait dan generic
- **[Latihan 06: Mini Project](exercises/06-mini-project/README_ID.md)** - Integrasikan semua konsep

Lihat [Gambaran Umum Latihan](exercises/README_ID.md) untuk instruksi detail.

## Referensi Silang

### Modul Terkait

- **[Dasar-Dasar Solana](../basics/README_ID.md)** - Terapkan pengetahuan Rust Anda ke pengembangan Solana
- **[Framework Anchor](../basics/05-anchor-framework/README_ID.md)** - Bangun program Solana dengan Anchor (langkah selanjutnya yang direkomendasikan)
- **[Praktik Terbaik Keamanan](../security/README_ID.md)** - Pelajari pola Rust yang aman untuk Solana
- **[Panduan Setup](../setup/README.md)** - Konfigurasi lingkungan pengembangan Anda

### Titik Integrasi

Modul ini berfungsi sebagai prasyarat untuk:
- Semua modul pengembangan program Solana
- Analisis keamanan smart contract
- Pengembangan protokol DeFi
- Topik Solana tingkat lanjut

## Sumber Daya Tambahan

### Dokumentasi Resmi Rust

- **[The Rust Programming Language Book](https://doc.rust-lang.org/book/)** - Panduan Rust komprehensif (sangat direkomendasikan)
- **[Rust By Example](https://doc.rust-lang.org/rust-by-example/)** - Belajar Rust melalui contoh beranotasi
- **[Rust Standard Library Documentation](https://doc.rust-lang.org/std/)** - Referensi untuk tipe dan fungsi standard library
- **[Rust Playground](https://play.rust-lang.org/)** - Eksperimen dengan kode Rust di browser Anda

### Pembelajaran Interaktif

- **[Rustlings](https://github.com/rust-lang/rustlings)** - Latihan kecil untuk mempraktikkan konsep Rust
- **[Rust Exercism Track](https://exercism.org/tracks/rust)** - Latihan coding dengan feedback mentor

### Sumber Daya Khusus Solana

- **[Solana Cookbook](https://solanacookbook.com/)** - Resep pengembangan Solana praktis
- **[Anchor Book](https://book.anchor-lang.com/)** - Dokumentasi resmi framework Anchor
- **[Solana Program Library](https://spl.solana.com/)** - Implementasi referensi dalam Rust

### Komunitas dan Dukungan

- **[Rust Users Forum](https://users.rust-lang.org/)** - Ajukan pertanyaan dan dapatkan bantuan
- **[Solana Stack Exchange](https://solana.stackexchange.com/)** - Q&A khusus Solana
- **[Rust Discord](https://discord.gg/rust-lang)** - Dukungan komunitas real-time

## Pelacakan Progres

Lacak progres Anda melalui modul:

- [ ] Pelajaran 01: Fundamentals
- [ ] Pelajaran 02: Ownership and Borrowing
- [ ] Pelajaran 03: Structs and Enums
- [ ] Pelajaran 04: Error Handling
- [ ] Pelajaran 05: Traits and Generics
- [ ] Pelajaran 06: Modules and Cargo
- [ ] Pelajaran 07: Rust for Solana
- [ ] Latihan 01: Variables and Functions
- [ ] Latihan 02: Ownership Practice
- [ ] Latihan 03: Struct and Enum Exercises
- [ ] Latihan 04: Error Handling Practice
- [ ] Latihan 05: Trait Implementation
- [ ] Latihan 06: Mini Project

## Mendapatkan Bantuan

Jika Anda mengalami kesulitan:

1. Tinjau materi pelajaran dan contoh kode
2. Periksa [Panduan Troubleshooting](../setup/troubleshooting.md)
3. Konsultasikan sumber daya tambahan yang tercantum di atas
4. Ajukan pertanyaan di forum komunitas Rust atau Solana

## Atribusi Sumber

Konten modul ini didasarkan pada dan mereferensikan:

- [The Rust Programming Language Book](https://doc.rust-lang.org/book/) oleh Steve Klabnik dan Carol Nichols
- [Rust By Example](https://doc.rust-lang.org/rust-by-example/) oleh Komunitas Rust
- [Rust Documentation](https://doc.rust-lang.org/) oleh Rust Project
- Materi referensi Rust komprehensif yang dikompilasi dalam sumber daya proyek

Semua contoh kode dan penjelasan diadaptasi untuk konteks pengembangan Solana.

---

**Bahasa:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
