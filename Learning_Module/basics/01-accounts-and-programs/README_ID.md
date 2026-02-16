# Akun dan Program

## Gambaran Umum

Memahami model akun Solana adalah fundamental untuk membangun di platform ini. Berbeda dengan model berbasis akun Ethereum di mana smart contract menyimpan state secara internal, Solana memisahkan kode (program) dari data (akun). Desain ini memungkinkan pemrosesan transaksi paralel dan throughput tinggi di Solana.

**Estimasi Waktu:** 2-3 jam

## Tujuan Pembelajaran

Setelah menyelesaikan pelajaran ini, Anda akan dapat:

- Menjelaskan model akun Solana dan perbedaannya dengan blockchain lain
- Memahami hubungan antara program dan akun data
- Mendeskripsikan kepemilikan akun dan implikasinya terhadap keamanan
- Bekerja dengan rent akun dan memahami siklus hidup akun
- Mengidentifikasi struktur dasar program Solana

## Prasyarat

- Menyelesaikan [Panduan Setup](../../setup/README.md)
- Pemahaman dasar tentang konsep blockchain
- Familiar dengan Rust atau TypeScript

## Model Akun Solana

### Apa itu Akun?

Di Solana, semuanya adalah akun. Akun adalah struktur data yang dapat menyimpan:
- **Lamports** (unit terkecil SOL: 1 SOL = 1.000.000.000 lamports)
- **Data** (byte arbitrer)
- **Owner** (program yang mengontrol akun ini)
- **Flag Executable** (apakah akun ini berisi kode program)

### Struktur Akun

Setiap akun Solana memiliki field berikut:

```rust
pub struct Account {
    /// Lamports dalam akun
    pub lamports: u64,
    /// Data yang disimpan dalam akun ini
    pub data: Vec<u8>,
    /// Program yang memiliki akun ini
    pub owner: Pubkey,
    /// Data akun ini berisi program yang dimuat (dan sekarang read-only)
    pub executable: bool,
    /// Epoch di mana akun ini akan membayar rent berikutnya
    pub rent_epoch: Epoch,
}
```

### Konsep Kunci

#### 1. Kepemilikan Akun

Setiap akun dimiliki oleh sebuah program. Hanya program pemilik yang dapat:
- Memodifikasi data akun
- Mengurangi lamports dari akun

Ini adalah fitur keamanan kritis. Contohnya:
- Akun wallet Anda dimiliki oleh System Program
- Akun token dimiliki oleh Token Program
- Akun data kustom dimiliki oleh program Anda

#### 2. Program vs Akun Data

**Program** (akun executable):
- Berisi bytecode yang dikompilasi
- Ditandai sebagai `executable = true`
- Immutable setelah di-deploy (kecuali upgradeable)
- Dimiliki oleh program BPF Loader

**Akun Data**:
- Menyimpan state dan data pengguna
- Ditandai sebagai `executable = false`
- Dapat dimodifikasi oleh program pemiliknya
- Dimiliki oleh program yang membuatnya

#### 3. Rent Akun

Solana mengharuskan akun mempertahankan saldo minimum (rent) agar tetap hidup di blockchain. Ada dua cara menangani rent:

**Akun Rent-Exempt** (direkomendasikan):
- Mempertahankan saldo >= 2 tahun rent
- Tidak pernah membayar rent dan ada selamanya
- Sebagian besar program modern menggunakan pendekatan ini

**Akun Pembayar Rent** (deprecated):
- Membayar rent secara berkala
- Dapat di-garbage collect jika saldo turun ke nol
- Tidak direkomendasikan untuk program baru

Hitung minimum rent-exempt:
```bash
solana rent <UKURAN_DATA_DALAM_BYTES>
```

Contoh untuk akun 100-byte:
```bash
solana rent 100
# Output: Rent-exempt minimum: 0.00089088 SOL
```

## Arsitektur Program

### Struktur Program

Program Solana tipikal memiliki tiga komponen utama:

#### 1. Entrypoint

Entrypoint adalah tempat runtime Solana memanggil program Anda:

```rust
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
};

// Deklarasi entrypoint program
entrypoint!(process_instruction);

// Implementasi entrypoint program
pub fn process_instruction(
    program_id: &Pubkey,      // Public key dari akun program
    accounts: &[AccountInfo],  // Akun yang diperlukan untuk instruksi
    instruction_data: &[u8],   // Data instruksi
) -> ProgramResult {
    // Logika program Anda di sini
    Ok(())
}
```

#### 2. Pemrosesan Instruksi

Program menerima instruksi dan mengarahkannya ke handler yang sesuai:

```rust
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Deserialize instruksi
    let instruction = MyInstruction::unpack(instruction_data)?;
    
    // Route ke handler yang sesuai
    match instruction {
        MyInstruction::Initialize { .. } => {
            process_initialize(program_id, accounts)
        }
        MyInstruction::Update { .. } => {
            process_update(program_id, accounts)
        }
    }
}
```

#### 3. Manajemen State

Program mendefinisikan struktur data untuk state akun:

```rust
use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct MyAccountData {
    pub is_initialized: bool,
    pub owner: Pubkey,
    pub counter: u64,
}
```

### Validasi Akun

Keamanan dalam program Solana sangat bergantung pada validasi akun yang tepat:

```rust
pub fn process_initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    
    // Dapatkan akun
    let data_account = next_account_info(account_iter)?;
    let owner_account = next_account_info(account_iter)?;
    
    // Validasi: akun data dimiliki oleh program ini
    if data_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Validasi: owner menandatangani transaksi
    if !owner_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Validasi: akun dapat ditulis
    if !data_account.is_writable {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Proses instruksi...
    Ok(())
}
```

## Bekerja dengan Akun

### Menghasilkan Keypair

#### Menggunakan Web3.js Kit (Direkomendasikan)

```typescript
import { generateKeyPairSigner } from "@solana/kit";

// Generate keypair signer baru
const keypairSigner = await generateKeyPairSigner();
console.log('Address:', keypairSigner.address);
```

#### Menggunakan Legacy Web3.js

```typescript
import { Keypair } from "@solana/web3.js";

// Generate keypair baru
const keypair = Keypair.generate();
console.log('Public Key:', keypair.publicKey.toBase58());
console.log('Secret Key:', keypair.secretKey);
```

### Membuat Akun

**Sumber**: [solana-program-examples/basics/create-account](https://github.com/solana-developers/program-examples/tree/main/basics/create-account)

Akun dibuat oleh System Program. Ada dua pendekatan utama: membuat akun via CPI (Cross-Program Invocation) dari dalam program, atau membuatnya langsung dari client.

#### Implementasi Anchor (Direkomendasikan)

```rust
use anchor_lang::prelude::*;
use anchor_lang::system_program::{create_account, CreateAccount};

declare_id!("8PSAL9tQY4gy5xsBGWJq3e7BPPYyBZq8VzRLW6LhHcMW");

#[program]
pub mod create_account {
    use super::*;

    // Buat akun menggunakan constraint init Anchor (direkomendasikan)
    pub fn create_system_account(ctx: Context<CreateSystemAccount>) -> Result<()> {
        msg!("Akun dibuat dengan address: {}", ctx.accounts.pda_account.key());
        msg!("Lamports akun: {}", ctx.accounts.pda_account.to_account_info().lamports());
        Ok(())
    }

    // Buat akun menggunakan CPI ke System Program
    pub fn create_account_with_cpi(
        ctx: Context<CreateWithCPI>,
        amount: u64,
    ) -> Result<()> {
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            CreateAccount {
                from: ctx.accounts.payer.to_account_info(),
                to: ctx.accounts.new_account.to_account_info(),
            },
        );

        create_account(
            cpi_context,
            amount,
            8, // space
            &ctx.program_id,
        )?;

        msg!("Akun dibuat via CPI: {}", ctx.accounts.new_account.key());
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateSystemAccount<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        space = 8,
        seeds = [b"pda_account", payer.key().as_ref()],
        bump
    )]
    pub pda_account: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateWithCPI<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub new_account: Signer<'info>,

    pub system_program: Program<'info, System>,
}
```

**Fitur Utama**:
- Constraint `init` otomatis menangani pembuatan akun
- Pembuatan akun berbasis PDA dengan seeds
- Metode CPI untuk kontrol lebih atas pembuatan akun
- Kalkulasi rent-exemption otomatis

#### Implementasi Native Rust

```rust
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke_signed,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let payer = next_account_info(accounts_iter)?;
    let new_account = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    // Turunkan PDA
    let (pda, bump_seed) = Pubkey::find_program_address(
        &[b"pda_account", payer.key.as_ref()],
        program_id,
    );

    // Verifikasi PDA yang diturunkan cocok dengan akun yang diberikan
    if pda != *new_account.key {
        return Err(solana_program::program_error::ProgramError::InvalidSeeds);
    }

    // Hitung minimum rent-exempt
    let rent = Rent::get()?;
    let space = 8; // Ukuran data akun
    let lamports = rent.minimum_balance(space);

    msg!("Membuat akun dengan {} lamports dan {} bytes", lamports, space);

    // Buat akun via CPI dengan PDA signing
    invoke_signed(
        &system_instruction::create_account(
            payer.key,
            new_account.key,
            lamports,
            space as u64,
            program_id,
        ),
        &[payer.clone(), new_account.clone(), system_program.clone()],
        &[&[b"pda_account", payer.key.as_ref(), &[bump_seed]]],
    )?;

    msg!("Akun berhasil dibuat: {}", new_account.key);
    Ok(())
}
```

**Konsep Kunci yang Ditunjukkan**:
- Derivasi dan validasi PDA
- Kalkulasi saldo rent-exempt
- CPI ke System Program dengan `invoke_signed`
- Pembuatan akun dengan kepemilikan program

#### Kode Client (TypeScript)

```typescript
import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
} from '@solana/web3.js';

async function createAccount(
  connection: Connection,
  payer: Keypair,
  space: number,
  programId: PublicKey
): Promise<Keypair> {
  // Generate keypair baru untuk akun
  const newAccount = Keypair.generate();
  
  // Hitung minimum rent-exempt
  const lamports = await connection.getMinimumBalanceForRentExemption(space);
  
  // Buat instruksi create account
  const createAccountIx = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: newAccount.publicKey,
    lamports,
    space,
    programId,
  });
  
  // Kirim transaksi
  const transaction = new Transaction().add(createAccountIx);
  await sendAndConfirmTransaction(connection, transaction, [payer, newAccount]);
  
  return newAccount;
}
```

**Coba Sendiri**:

```bash
# Clone repository
git clone https://github.com/solana-developers/program-examples
cd program-examples/basics/create-account/anchor

# Install dependencies
npm install

# Jalankan tests
anchor test
```

**Eksperimen**:
- Buat akun dengan alokasi space berbeda
- Coba buat beberapa akun dalam satu transaksi
- Implementasikan pembuatan akun dengan seeds kustom
- Tambahkan validasi untuk inisialisasi akun

### Membaca Data Akun

```typescript
async function readAccountData(
  connection: Connection,
  accountPubkey: PublicKey
): Promise<Buffer> {
  const accountInfo = await connection.getAccountInfo(accountPubkey);
  
  if (!accountInfo) {
    throw new Error('Akun tidak ditemukan');
  }
  
  return accountInfo.data;
}
```

### Menulis Data Akun (dari program)

```rust
use borsh::BorshSerialize;

pub fn save_data(
    account: &AccountInfo,
    data: &MyAccountData,
) -> ProgramResult {
    // Serialize data
    let mut account_data = account.try_borrow_mut_data()?;
    data.serialize(&mut &mut account_data[..])?;
    
    Ok(())
}
```

## System Program

System Program adalah program native Solana yang menangani:
- Membuat akun baru
- Transfer lamports antar akun
- Mengalokasikan space akun
- Menetapkan kepemilikan akun

**ID System Program:** `11111111111111111111111111111111`

Instruksi System Program umum:
- `CreateAccount` - Buat akun baru
- `Transfer` - Transfer lamports
- `Allocate` - Alokasikan space untuk akun
- `Assign` - Tetapkan kepemilikan akun ke program

## Contoh Dunia Nyata: Program Counter

Mari lihat program counter sederhana yang mendemonstrasikan konsep-konsep ini. Contoh ini dari repository contoh program Solana resmi.

**Sumber**: [solana-program-examples/basics/counter](https://github.com/solana-developers/program-examples/tree/main/basics/counter)

### Implementasi Anchor (Direkomendasikan)

```rust
use anchor_lang::prelude::*;

declare_id!("BmDHboaj1kBUoinJKKSRqKfMeRKJqQqEbUj1VgzeQe4A");

#[program]
pub mod counter_anchor {
    use super::*;

    pub fn initialize_counter(_ctx: Context<InitializeCounter>) -> Result<()> {
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        ctx.accounts.counter.count = ctx.accounts.counter.count.checked_add(1).unwrap();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeCounter<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        space = 8 + Counter::INIT_SPACE,
        payer = payer
    )]
    pub counter: Account<'info, Counter>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,
}

#[account]
#[derive(InitSpace)]
pub struct Counter {
    count: u64,
}
```

**Fitur Utama**:
- Menggunakan derive macro `InitSpace` untuk kalkulasi space otomatis
- `checked_add` mencegah overflow
- Constraint `init` menangani pembuatan akun otomatis
- Pemisahan logika inisialisasi dan increment yang bersih

### Implementasi Native Rust

```rust
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

// Definisikan struktur data akun
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct CounterAccount {
    pub count: u64,
}

// Deklarasi entrypoint
entrypoint!(process_instruction);

// Entrypoint program
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    msg!("Entrypoint program counter");
    
    // Dapatkan akun yang menyimpan counter
    let accounts_iter = &mut accounts.iter();
    let account = next_account_info(accounts_iter)?;
    
    // Akun harus dimiliki oleh program
    if account.owner != program_id {
        msg!("Akun counter tidak memiliki program id yang benar");
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Deserialize data akun
    let mut counter_data = CounterAccount::try_from_slice(&account.data.borrow())?;
    
    // Increment counter (dengan pengecekan overflow)
    counter_data.count = counter_data.count.checked_add(1)
        .ok_or(ProgramError::InvalidAccountData)?;
    msg!("Counter di-increment menjadi: {}", counter_data.count);
    
    // Serialize data yang diupdate kembali ke akun
    counter_data.serialize(&mut &mut account.data.borrow_mut()[..])?;
    
    Ok(())
}
```

### Kode Client (TypeScript)

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import { assert } from "chai";
import type { CounterAnchor } from "../target/types/counter_anchor";

describe("Program Counter", () => {
  // Konfigurasi client untuk menggunakan cluster lokal
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.CounterAnchor as Program<CounterAnchor>;

  // Generate keypair baru untuk akun counter
  const counterKeypair = new Keypair();

  it("Initialize Counter", async () => {
    await program.methods
      .initializeCounter()
      .accounts({
        counter: counterKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([counterKeypair])
      .rpc();

    const currentCount = await program.account.counter.fetch(
      counterKeypair.publicKey
    );

    assert(
      currentCount.count.toNumber() === 0,
      "Diharapkan count yang diinisialisasi adalah 0"
    );
  });

  it("Increment Counter", async () => {
    await program.methods
      .increment()
      .accounts({ counter: counterKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.counter.fetch(
      counterKeypair.publicKey
    );

    assert(currentCount.count.toNumber() === 1, "Diharapkan count adalah 1");
  });

  it("Increment Counter Lagi", async () => {
    await program.methods
      .increment()
      .accounts({ counter: counterKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.counter.fetch(
      counterKeypair.publicKey
    );

    assert(currentCount.count.toNumber() === 2, "Diharapkan count adalah 2");
  });
});
```

**Konsep Kunci yang Ditunjukkan**:
- Inisialisasi akun dengan alokasi space yang tepat
- Validasi kepemilikan akun
- Aritmatika aman dengan pengecekan overflow
- Serialisasi/deserialisasi data
- Penanganan beberapa instruksi

**Coba Sendiri**:

```bash
# Clone repository
git clone https://github.com/solana-developers/program-examples
cd program-examples/basics/counter/anchor

# Install dependencies
npm install

# Jalankan tests
anchor test
```

**Eksperimen**:
- Modifikasi counter untuk decrement
- Tambahkan fungsi reset
- Simpan data tambahan (owner, timestamp)
- Implementasikan kontrol akses

## Pola Umum

### 1. Pola Inisialisasi Akun

```rust
pub fn initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    let data_account = next_account_info(account_iter)?;
    
    // Cek apakah sudah diinisialisasi
    let mut data = MyData::try_from_slice(&data_account.data.borrow())?;
    if data.is_initialized {
        return Err(ProgramError::AccountAlreadyInitialized);
    }
    
    // Inisialisasi
    data.is_initialized = true;
    data.serialize(&mut &mut data_account.data.borrow_mut()[..])?;
    
    Ok(())
}
```

### 2. Pola Validasi Owner

```rust
pub fn validate_owner(
    account: &AccountInfo,
    expected_owner: &Pubkey,
) -> ProgramResult {
    if account.owner != expected_owner {
        return Err(ProgramError::IncorrectProgramId);
    }
    Ok(())
}
```

### 3. Pola Validasi Signer

```rust
pub fn validate_signer(account: &AccountInfo) -> ProgramResult {
    if !account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    Ok(())
}
```

## Best Practices

1. **Selalu validasi kepemilikan akun** - Pastikan akun dimiliki oleh program yang diharapkan
2. **Cek persyaratan signer** - Verifikasi bahwa akun yang diperlukan telah menandatangani transaksi
3. **Validasi writability akun** - Pastikan akun yang perlu dimodifikasi ditandai sebagai writable
4. **Gunakan akun rent-exempt** - Selalu danai akun dengan lamports yang cukup untuk rent-exempt
5. **Inisialisasi akun dengan benar** - Cek status inisialisasi untuk mencegah serangan re-initialization
6. **Tangani error dengan baik** - Return kode error yang sesuai untuk skenario kegagalan berbeda

## Kesalahan Umum

1. **Lupa validasi kepemilikan akun** - Dapat menyebabkan kerentanan keamanan
2. **Tidak mengecek apakah akun writable** - Akan menyebabkan runtime error
3. **Rent tidak cukup** - Akun dapat di-garbage collect
4. **Pengecekan signer hilang** - Memungkinkan akses tidak sah
5. **Urutan akun salah** - Program mengharapkan akun dalam urutan tertentu

## Atribusi Sumber

Konten ini berdasarkan materi edukasi dan contoh dari:

- **Dokumentasi Solana**: https://docs.solana.com/developing/programming-model/accounts
- **Solana Cookbook**: https://solanacookbook.com/core-concepts/accounts.html
- **Percolator Risk Engine**: [percolator/percolator/src/percolator.rs](../../../percolator/percolator/src/percolator.rs)
  - Mendemonstrasikan manajemen akun tingkat lanjut dalam program production-grade
  - Menunjukkan pola account slab dan pelacakan akun berbasis bitmap
- **Solana Agent Kit**: [solana-agent-kit/solana-agent-kit](../../../solana-agent-kit/solana-agent-kit/)
  - Contoh interaksi dengan program Solana dari TypeScript
  - Pola manajemen akun token dan NFT

## Langkah Selanjutnya

Sekarang Anda memahami akun dan program, Anda siap mempelajari:

- [Transaksi](../02-transactions/README.md) - Cara membuat dan mengirim transaksi
- [Token](../03-tokens/README.md) - Bekerja dengan SPL token
- [PDA](../04-pdas/README.md) - Program Derived Addresses untuk pola tingkat lanjut

## Sumber Daya Tambahan

- [Solana Program Library (SPL)](https://spl.solana.com/) - Koleksi program on-chain yang dikelola oleh Solana Labs
- [Dokumentasi Anchor Framework](https://www.anchor-lang.com/) - Panduan lengkap membangun program Solana dengan Anchor
- [Solana Playground](https://beta.solpg.io/) - IDE berbasis browser untuk menulis dan deploy program Solana tanpa setup lokal
- [Contoh Program](https://github.com/solana-labs/solana-program-library) - Implementasi referensi pola program umum

## Latihan

Siap berlatih? Kunjungi bagian [Latihan](../exercises/README.md) untuk membangun program Anda sendiri!

---

**Catatan**: Untuk versi English dari dokumen ini, lihat [README.md](README.md)
