# Pendekatan Bilingual - Learning Module

## Gambaran Umum

Learning Module ini dirancang dengan pendekatan bilingual (English + Bahasa Indonesia) untuk memastikan aksesibilitas maksimal bagi developer Indonesia dan internasional.

## Struktur File

### Konvensi Penamaan

- **File English**: `README.md`, `GLOSSARY.md`, `SOURCES.md`
- **File Bahasa Indonesia**: `README_ID.md`, `GLOSSARY.md` (default ID), `SOURCES.md` (default ID)
- **File English Eksplisit**: `GLOSSARY_EN.md`, `SOURCES_EN.md`

### Organisasi Konten

```
Learning_Module/
├── README.md (English)
├── README_ID.md (Bahasa Indonesia)
├── GLOSSARY.md (Bahasa Indonesia - default)
├── GLOSSARY_EN.md (English)
├── basics/
│   ├── 01-accounts-and-programs/
│   │   ├── README.md (English)
│   │   └── README_ID.md (Bahasa Indonesia)
│   ├── 02-transactions/
│   │   ├── README.md (English)
│   │   └── README_ID.md (Bahasa Indonesia)
│   └── ...
```

## Prinsip Penulisan

### 1. User-Friendly untuk Pemula

**Bahasa Indonesia:**
- Gunakan istilah teknis dengan penjelasan dalam bahasa sehari-hari
- Contoh: "Akun adalah struktur data yang dapat menyimpan..." (bukan hanya "Account is a data structure...")
- Sertakan analogi dan contoh praktis

**English:**
- Clear, concise technical language
- Avoid jargon without explanation
- Practical examples and analogies

### 2. Profesional untuk Developer Berpengalaman

**Kedua Bahasa:**
- Terminologi teknis yang akurat
- Referensi ke dokumentasi resmi
- Contoh kode production-ready
- Best practices dan security considerations

### 3. Konsistensi Terminologi

#### Istilah yang Diterjemahkan
- Account → Akun
- Transaction → Transaksi
- Program → Program (tetap sama)
- Instruction → Instruksi
- Wallet → Wallet/Dompet (kontekstual)

#### Istilah yang Tidak Diterjemahkan (Technical Terms)
- Keypair
- Lamports
- PDA (Program Derived Address)
- CPI (Cross-Program Invocation)
- Rent-exempt
- Signer
- Blockhash

### 4. Struktur Paralel

Setiap file Bahasa Indonesia harus memiliki struktur yang sama dengan versi English:
- Heading yang sama
- Contoh kode yang sama
- Urutan topik yang sama
- Link dan referensi yang sama

## Gaya Penulisan

### Bahasa Indonesia

#### Untuk Pemula:
```markdown
## Apa itu Akun?

Di Solana, semuanya adalah akun. Bayangkan akun seperti "kotak penyimpanan" 
di blockchain yang bisa menyimpan data dan SOL (mata uang Solana).
```

#### Untuk Profesional:
```markdown
## Struktur Akun

Setiap akun Solana memiliki field berikut:
- `lamports`: Saldo dalam unit terkecil SOL
- `data`: Buffer byte untuk menyimpan state
- `owner`: Program ID yang memiliki akun ini
- `executable`: Flag untuk program executable
```

### English

#### For Beginners:
```markdown
## What is an Account?

In Solana, everything is an account. Think of an account as a "storage box" 
on the blockchain that can hold data and SOL (Solana's currency).
```

#### For Professionals:
```markdown
## Account Structure

Every Solana account has the following fields:
- `lamports`: Balance in smallest SOL unit
- `data`: Byte buffer for storing state
- `owner`: Program ID that owns this account
- `executable`: Flag for executable programs
```

## Contoh Kode

### Prinsip:
1. **Kode tetap dalam English** (standar industri)
2. **Komentar dalam bahasa dokumen**
3. **Penjelasan sebelum/sesudah kode dalam bahasa dokumen**

### Contoh Bahasa Indonesia:

```markdown
### Membuat Akun

Berikut cara membuat akun dari client:

\`\`\`typescript
// Generate keypair baru untuk akun
const newAccount = Keypair.generate();

// Hitung minimum rent-exempt
const lamports = await connection.getMinimumBalanceForRentExemption(space);
\`\`\`

Kode di atas akan membuat keypair baru dan menghitung jumlah lamports 
yang diperlukan agar akun tidak perlu membayar rent.
```

### Contoh English:

```markdown
### Creating Accounts

Here's how to create an account from a client:

\`\`\`typescript
// Generate new keypair for the account
const newAccount = Keypair.generate();

// Calculate rent-exempt minimum
const lamports = await connection.getMinimumBalanceForRentExemption(space);
\`\`\`

The code above creates a new keypair and calculates the lamports needed 
to make the account rent-exempt.
```

## Navigasi Antar Bahasa

### Di Setiap File

**Bahasa Indonesia** (di bagian bawah):
```markdown
---

**Catatan**: Untuk versi English dari dokumen ini, lihat [README.md](README.md)
```

**English** (di bagian bawah):
```markdown
---

**Note**: For the Indonesian version of this document, see [README_ID.md](README_ID.md)
```

## Checklist Kualitas

Setiap dokumen bilingual harus memenuhi:

### Konten
- [ ] Struktur heading identik
- [ ] Semua contoh kode ada di kedua versi
- [ ] Link dan referensi lengkap
- [ ] Terminologi konsisten

### Bahasa
- [ ] Tata bahasa benar
- [ ] Istilah teknis akurat
- [ ] Penjelasan jelas untuk pemula
- [ ] Detail cukup untuk profesional

### Format
- [ ] Markdown formatting konsisten
- [ ] Code blocks dengan syntax highlighting
- [ ] Navigasi antar bahasa tersedia
- [ ] Atribusi sumber lengkap

## Status Implementasi

### ✅ Selesai
- `GLOSSARY.md` (Bahasa Indonesia)
- `GLOSSARY_EN.md` (English)
- `SOURCES.md` (Bahasa Indonesia)
- `SOURCES_EN.md` (English)
- `basics/01-accounts-and-programs/README_ID.md`

### 🚧 Dalam Progress
- `basics/02-transactions/README_ID.md`
- `basics/03-tokens/README_ID.md`
- `basics/04-pdas/README_ID.md`
- `basics/05-anchor-framework/README_ID.md`

### 📋 Belum Dimulai
- Semua lesson lainnya (security, mobile, defi, dll.)
- Setup guides
- Curriculum paths
- Integration projects

## Prioritas

### Fase 1: Basics (High Priority)
Semua lesson di `basics/` harus bilingual karena ini fondasi untuk semua developer.

### Fase 2: Specialized Topics (Medium Priority)
- Security
- DeFi
- Mobile

### Fase 3: Advanced Topics (Lower Priority)
- AI Agents
- DePIN
- Privacy

## Kontribusi

Saat menambahkan konten baru:

1. **Tulis English version dulu** (standar industri)
2. **Buat Indonesian version** dengan struktur yang sama
3. **Review keduanya** untuk konsistensi
4. **Test semua link** di kedua versi
5. **Update checklist** di dokumen ini

## Tools dan Resources

### Terminologi
- Gunakan `GLOSSARY.md` / `GLOSSARY_EN.md` sebagai referensi
- Konsisten dengan istilah yang sudah ada
- Tambahkan istilah baru ke glossary

### Review
- Peer review untuk akurasi teknis
- Native speaker review untuk bahasa
- Developer pemula untuk clarity

---

**Tujuan**: Membuat Learning Module yang accessible untuk developer Indonesia sambil mempertahankan standar internasional untuk developer global.
