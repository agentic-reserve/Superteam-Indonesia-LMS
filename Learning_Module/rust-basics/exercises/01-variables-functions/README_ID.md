# Latihan 01: Variabel dan Fungsi

## Gambaran Umum

Latihan ini membantu Anda mempraktikkan konsep dasar Rust yang dibahas dalam [Pelajaran 01: Fundamental](../../01-fundamentals/README_ID.md). Anda akan bekerja dengan variabel, tipe data, fungsi, dan alur kontrol untuk membangun program sederhana yang menghitung statistik untuk kumpulan angka.

**Estimasi Waktu:** 30-45 menit

## Tujuan Pembelajaran

Dengan menyelesaikan latihan ini, Anda akan:

- Berlatih mendeklarasikan dan menggunakan variabel mutable dan immutable
- Bekerja dengan berbagai tipe data (integer, float, boolean)
- Mendefinisikan fungsi dengan parameter dan nilai kembalian
- Menggunakan struktur alur kontrol (loop dan conditional)
- Menerapkan konsep dasar Rust dalam skenario praktis

## Deskripsi Masalah

Buat program yang menganalisis kumpulan angka dan menghitung berbagai statistik. Program Anda harus:

1. Menyimpan kumpulan angka dalam array
2. Menghitung jumlah semua angka
3. Menghitung rata-rata (mean) dari angka-angka tersebut
4. Menemukan nilai minimum dan maksimum
5. Menghitung berapa banyak angka yang berada di atas rata-rata
6. Menampilkan semua hasil dengan format yang sesuai

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

1. **Fungsi `calculate_sum`** yang menerima array integer dan mengembalikan jumlahnya
   - Signature fungsi: `fn calculate_sum(numbers: &[i32]) -> i32`

2. **Fungsi `calculate_average`** yang menerima array integer dan mengembalikan rata-rata sebagai float
   - Signature fungsi: `fn calculate_average(numbers: &[i32]) -> f64`

3. **Fungsi `find_min_max`** yang menerima array dan mengembalikan tuple dengan (min, max)
   - Signature fungsi: `fn find_min_max(numbers: &[i32]) -> (i32, i32)`

4. **Fungsi `count_above_average`** yang menghitung berapa banyak angka di atas rata-rata
   - Signature fungsi: `fn count_above_average(numbers: &[i32], average: f64) -> usize`

5. **Fungsi `main`** yang:
   - Membuat array dengan setidaknya 5 angka
   - Memanggil semua fungsi di atas
   - Mencetak hasil dalam format yang mudah dibaca

## Kriteria Validasi

Solusi Anda benar ketika:

1. ✅ Program dapat dikompilasi tanpa error atau warning
2. ✅ Semua fungsi memiliki signature dan tipe kembalian yang benar
3. ✅ Fungsi `calculate_sum` dengan benar menjumlahkan semua angka
4. ✅ Fungsi `calculate_average` mengembalikan nilai rata-rata yang benar
5. ✅ Fungsi `find_min_max` mengembalikan nilai minimum dan maksimum yang benar
6. ✅ Fungsi `count_above_average` dengan benar menghitung angka di atas rata-rata
7. ✅ Output diformat dengan jelas dan mencakup semua statistik yang diperlukan
8. ✅ Variabel menggunakan mutability yang sesuai (immutable secara default, mutable hanya jika diperlukan)

## Contoh Output

Program Anda harus menghasilkan output yang mirip dengan ini:

```
Statistics for numbers: [10, 25, 5, 30, 15, 20]

Sum: 105
Average: 17.5
Minimum: 5
Maximum: 30
Numbers above average: 3
```

## Petunjuk

- Gunakan loop `for` untuk iterasi melalui array saat menghitung jumlah
- Konversi integer ke float menggunakan `as f64` saat menghitung rata-rata
- Inisialisasi min/max dengan elemen pertama dari array
- Gunakan operator perbandingan (`>`, `<`) untuk menemukan nilai min/max
- Panjang array dapat diperoleh dengan `.len()`
- Ingat bahwa pembagian integer akan memotong desimal - gunakan pembagian float untuk rata-rata

## Menguji Solusi Anda

Jalankan program Anda dengan:

```bash
cargo run
```

Coba modifikasi array input dengan angka yang berbeda untuk memverifikasi fungsi Anda bekerja dengan benar:

```rust
let numbers = [10, 25, 5, 30, 15, 20];  // Original
let numbers = [1, 2, 3, 4, 5];          // Urutan sederhana
let numbers = [100, -50, 0, 75, -25];   // Dengan angka negatif
```

## Tantangan Tambahan (Opsional)

Jika Anda selesai lebih awal dan ingin lebih banyak latihan:

1. **Tambahkan perhitungan median** - Temukan nilai tengah ketika angka diurutkan
2. **Tangani array kosong** - Kembalikan nilai yang sesuai atau pesan error untuk input kosong
3. **Tambahkan input pengguna** - Baca angka dari command line alih-alih hardcode
4. **Hitung standar deviasi** - Ukur seberapa tersebar angka-angka tersebut
5. **Format output dengan warna** - Gunakan crate `colored` untuk membuat output lebih mudah dibaca

## Pelajaran Terkait

Latihan ini memperkuat konsep dari:

- [Pelajaran 01: Fundamental](../../01-fundamentals/README_ID.md) - Variabel, tipe data, fungsi, alur kontrol

## Butuh Bantuan?

Jika Anda mengalami kesulitan:

1. Tinjau bagian yang relevan di [Pelajaran 01: Fundamental](../../01-fundamentals/README_ID.md)
2. Periksa solusi di direktori `solution/` (tapi coba sendiri dulu!)
3. Pastikan Anda memahami signature fungsi dan apa yang harus dikembalikan setiap fungsi
4. Gunakan statement `println!` untuk debug dan melihat nilai intermediate
5. Baca pesan error compiler dengan cermat - biasanya sangat membantu!

---

**Beranda Latihan**: [Semua Latihan](../README_ID.md)  
**Pelajaran Terkait**: [Fundamental](../../01-fundamentals/README_ID.md)

**Bahasa:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
