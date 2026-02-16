# Program Derived Addresses (PDAs)

## Overview

Program Derived Addresses (PDAs) are a powerful Solana primitive that enables programs to programmatically sign for accounts without needing a private key. PDAs are fundamental to building complex on-chain programs and are used extensively in DeFi protocols, NFT programs, and any application requiring deterministic account addresses.

**Estimated Time:** 2-3 hours

## Learning Objectives

After completing this lesson, you will be able to:

- Understand what PDAs are and why they're important
- Derive PDA addresses using seeds
- Use PDAs for program-controlled accounts
- Implement Cross-Program Invocations (CPI) with PDA signing
- Apply common PDA patterns in your programs

## Prerequisites

- Completed [Accounts and Programs](../01-accounts-and-programs/README.md)
- Completed [Transactions](../02-transactions/README.md)
- Understanding of public key cryptography

## What are PDAs?

### The Problem PDAs Solve

In traditional blockchain systems, only accounts with private keys can sign transactions. But what if you want a program to control an account? You can't give a program a private key (that would be insecure), so Solana uses PDAs.

### Key Characteristics

1. **Deterministic** - Same seeds always produce the same address
2. **No Private Key** - PDAs don't have corresponding private keys
3. **Program Authority** - Only the deriving program can sign for the PDA
4. **Off the Curve** - PDAs are intentionally not valid Ed25519 public keys

## PDA Derivation

### Basic Derivation

PDAs are derived using:
- Program ID
- Seeds (arbitrary bytes)
- Bump seed (to ensure address is off the curve)

**Source**: [solana-program-examples/basics/program-derived-addresses](https://github.com/solana-developers/program-examples/tree/main/basics/program-derived-addresses)

#### Anchor Implementation (Recommended)

```rust
use anchor_lang::prelude::*;

declare_id!("BZLiJ62bzRryYp9mRobz5FHhW8G5dFmqhbuJYTP6GcgE");

#[program]
pub mod program_derived_addresses {
    use super::*;

    // Create a PDA account
    pub fn create_page(
        ctx: Context<CreatePage>,
        _page_id: u32,
    ) -> Result<()> {
        let page = &mut ctx.accounts.page;
        page.data = 0;
        msg!("Created page with address: {}", page.key());
        Ok(())
    }

    // Update PDA account data
    pub fn update_page(
        ctx: Context<UpdatePage>,
        _page_id: u32,
        data: u64,
    ) -> Result<()> {
        let page = &mut ctx.accounts.page;
        page.data = data;
        msg!("Updated page {} with data: {}", page.key(), data);
        Ok(())
    }

    // Delete PDA account and recover rent
    pub fn delete_page(
        _ctx: Context<DeletePage>,
        _page_id: u32,
    ) -> Result<()> {
        msg!("Page deleted and rent recovered");
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(page_id: u32)]
pub struct CreatePage<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        space = 8 + Page::INIT_SPACE,
        seeds = [b"page", payer.key().as_ref(), &page_id.to_le_bytes()],
        bump
    )]
    pub page: Account<'info, Page>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(page_id: u32)]
pub struct UpdatePage<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"page", payer.key().as_ref(), &page_id.to_le_bytes()],
        bump
    )]
    pub page: Account<'info, Page>,
}

#[derive(Accounts)]
#[instruction(page_id: u32)]
pub struct DeletePage<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        close = payer,
        seeds = [b"page", payer.key().as_ref(), &page_id.to_le_bytes()],
        bump
    )]
    pub page: Account<'info, Page>,
}

#[account]
#[derive(InitSpace)]
pub struct Page {
    pub data: u64,
}
```

**Key Features**:
- Automatic PDA derivation with `seeds` and `bump` constraints
- `init` constraint handles account creation
- `close` constraint handles account deletion and rent recovery
- Type-safe account access with `Account<'info, T>`

#### Native Rust Implementation

```rust
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke_signed,
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct PageData {
    pub data: u64,
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = instruction_data[0];
    let page_id = u32::from_le_bytes(instruction_data[1..5].try_into().unwrap());

    match instruction {
        0 => create_page(program_id, accounts, page_id),
        1 => update_page(program_id, accounts, page_id, instruction_data),
        2 => delete_page(program_id, accounts, page_id),
        _ => Err(ProgramError::InvalidInstructionData),
    }
}

fn create_page(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    page_id: u32,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let payer = next_account_info(accounts_iter)?;
    let page_account = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    // Derive PDA
    let (pda, bump_seed) = Pubkey::find_program_address(
        &[b"page", payer.key.as_ref(), &page_id.to_le_bytes()],
        program_id,
    );

    // Verify derived PDA matches provided account
    if pda != *page_account.key {
        return Err(ProgramError::InvalidSeeds);
    }

    // Calculate space and rent
    let space = std::mem::size_of::<PageData>();
    let rent = Rent::get()?;
    let lamports = rent.minimum_balance(space);

    msg!("Creating PDA: {}", pda);

    // Create account via CPI
    invoke_signed(
        &system_instruction::create_account(
            payer.key,
            page_account.key,
            lamports,
            space as u64,
            program_id,
        ),
        &[payer.clone(), page_account.clone(), system_program.clone()],
        &[&[b"page", payer.key.as_ref(), &page_id.to_le_bytes(), &[bump_seed]]],
    )?;

    // Initialize data
    let page_data = PageData { data: 0 };
    page_data.serialize(&mut &mut page_account.data.borrow_mut()[..])?;

    msg!("Page created successfully");
    Ok(())
}

fn update_page(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    page_id: u32,
    instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let payer = next_account_info(accounts_iter)?;
    let page_account = next_account_info(accounts_iter)?;

    // Verify PDA
    let (pda, _bump) = Pubkey::find_program_address(
        &[b"page", payer.key.as_ref(), &page_id.to_le_bytes()],
        program_id,
    );

    if pda != *page_account.key {
        return Err(ProgramError::InvalidSeeds);
    }

    // Parse new data value
    let new_data = u64::from_le_bytes(instruction_data[5..13].try_into().unwrap());

    // Update account data
    let mut page_data = PageData::try_from_slice(&page_account.data.borrow())?;
    page_data.data = new_data;
    page_data.serialize(&mut &mut page_account.data.borrow_mut()[..])?;

    msg!("Page updated with data: {}", new_data);
    Ok(())
}

fn delete_page(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    page_id: u32,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let payer = next_account_info(accounts_iter)?;
    let page_account = next_account_info(accounts_iter)?;

    // Verify PDA
    let (pda, _bump) = Pubkey::find_program_address(
        &[b"page", payer.key.as_ref(), &page_id.to_le_bytes()],
        program_id,
    );

    if pda != *page_account.key {
        return Err(ProgramError::InvalidSeeds);
    }

    // Transfer lamports back to payer (closes account)
    let dest_starting_lamports = payer.lamports();
    **payer.lamports.borrow_mut() = dest_starting_lamports
        .checked_add(page_account.lamports())
        .unwrap();
    **page_account.lamports.borrow_mut() = 0;

    msg!("Page deleted and rent recovered");
    Ok(())
}
```

**Key Concepts Demonstrated**:
- PDA derivation with multiple seeds
- Account creation with `invoke_signed`
- PDA validation in every instruction
- Account closure and rent recovery
- CRUD operations on PDA accounts

#### Using Web3.js Kit (Recommended)

```typescript
import { Address, getProgramDerivedAddress } from "@solana/kit";

const programAddress = "11111111111111111111111111111111" as Address;
const seeds = ["helloWorld"];

// Derive PDA
const [pda, bump] = await getProgramDerivedAddress({
  programAddress,
  seeds
});

console.log('PDA:', pda);
console.log('Bump:', bump);
```

#### Using Legacy Web3.js

```typescript
import { PublicKey } from '@solana/web3.js';

async function findPDA(
  programId: PublicKey,
  seeds: Buffer[]
): Promise<[PublicKey, number]> {
  const [pda, bump] = await PublicKey.findProgramAddress(
    seeds,
    programId
  );
  
  return [pda, bump];
}
```

#### Client Code Example

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

async function testPDAOperations(
  program: Program,
  payer: anchor.web3.Keypair
) {
  const pageId = 1;

  // Derive PDA
  const [pagePDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("page"),
      payer.publicKey.toBuffer(),
      Buffer.from(new Uint8Array(new Uint32Array([pageId]).buffer)),
    ],
    program.programId
  );

  console.log("Page PDA:", pagePDA.toBase58());

  // Create page
  await program.methods
    .createPage(pageId)
    .accounts({
      payer: payer.publicKey,
      page: pagePDA,
    })
    .signers([payer])
    .rpc();

  console.log("Page created");

  // Update page
  await program.methods
    .updatePage(pageId, new anchor.BN(42))
    .accounts({
      payer: payer.publicKey,
      page: pagePDA,
    })
    .signers([payer])
    .rpc();

  console.log("Page updated");

  // Fetch page data
  const pageAccount = await program.account.page.fetch(pagePDA);
  console.log("Page data:", pageAccount.data.toString());

  // Delete page
  await program.methods
    .deletePage(pageId)
    .accounts({
      payer: payer.publicKey,
      page: pagePDA,
    })
    .signers([payer])
    .rpc();

  console.log("Page deleted");
}
```

**Try It Yourself**:

```bash
# Clone the repository
git clone https://github.com/solana-developers/program-examples
cd program-examples/basics/program-derived-addresses/anchor

# Install dependencies
npm install

# Run tests
anchor test
```

**Experiment**:
- Create multiple pages with different IDs
- Implement pagination for listing pages
- Add access control (only owner can update/delete)
- Store more complex data structures

### Example: User Profile PDA

```typescript
async function getUserProfilePDA(
  programId: PublicKey,
  userPubkey: PublicKey
): Promise<[PublicKey, number]> {
  const [pda, bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from('user-profile'),
      userPubkey.toBuffer(),
    ],
    programId
  );
  
  return [pda, bump];
}
```

### Rust Implementation

```rust
use solana_program::{
    pubkey::Pubkey,
    program_error::ProgramError,
};

pub fn find_user_profile_pda(
    program_id: &Pubkey,
    user: &Pubkey,
) -> Result<(Pubkey, u8), ProgramError> {
    let (pda, bump) = Pubkey::find_program_address(
        &[
            b"user-profile",
            user.as_ref(),
        ],
        program_id,
    );
    
    Ok((pda, bump))
}
```

## Creating PDA Accounts

### From Client (TypeScript)

```typescript
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

async function createPDAAccount(
  connection: Connection,
  payer: Keypair,
  programId: PublicKey,
  space: number
): Promise<PublicKey> {
  // Derive PDA
  const [pda, bump] = await PublicKey.findProgramAddress(
    [Buffer.from('my-pda'), payer.publicKey.toBuffer()],
    programId
  );
  
  // Calculate rent
  const lamports = await connection.getMinimumBalanceForRentExemption(space);
  
  // Create instruction to initialize PDA
  // (Your program must handle the actual account creation)
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      { pubkey: pda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId,
    data: Buffer.from([bump]), // Pass bump to program
  });
  
  const transaction = new Transaction().add(instruction);
  await sendAndConfirmTransaction(connection, transaction, [payer]);
  
  return pda;
}
```

### From Program (Rust)

```rust
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program::invoke_signed,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};

pub fn create_pda_account(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    space: usize,
) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    let payer = next_account_info(account_iter)?;
    let pda_account = next_account_info(account_iter)?;
    let system_program = next_account_info(account_iter)?;
    
    // Derive PDA
    let (pda, bump) = Pubkey::find_program_address(
        &[b"my-pda", payer.key.as_ref()],
        program_id,
    );
    
    // Verify derived PDA matches provided account
    if pda != *pda_account.key {
        return Err(ProgramError::InvalidSeeds);
    }
    
    // Calculate rent
    let rent = Rent::get()?;
    let lamports = rent.minimum_balance(space);
    
    // Create account via CPI
    invoke_signed(
        &system_instruction::create_account(
            payer.key,
            pda_account.key,
            lamports,
            space as u64,
            program_id,
        ),
        &[payer.clone(), pda_account.clone(), system_program.clone()],
        &[&[b"my-pda", payer.key.as_ref(), &[bump]]], // Signer seeds
    )?;
    
    Ok(())
}
```

## Cross-Program Invocations (CPI)

### What is CPI?

CPI allows one program to call another program. When a PDA needs to sign for a CPI, you use `invoke_signed`.

**Source**: [solana-program-examples/basics/cross-program-invocation](https://github.com/solana-developers/program-examples/tree/main/basics/cross-program-invocation)

### Anchor Implementation (Recommended)

```rust
use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("CPIexam11111111111111111111111111111111111");

#[program]
pub mod cross_program_invocation {
    use super::*;

    // Transfer SOL via CPI to System Program
    pub fn sol_transfer(ctx: Context<SolTransfer>, amount: u64) -> Result<()> {
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.sender_pda.to_account_info(),
                to: ctx.accounts.recipient.to_account_info(),
            },
        );

        // PDA signs the CPI
        let seeds = &[b"sender".as_ref(), &[ctx.bumps.sender_pda]];
        let signer_seeds = &[&seeds[..]];

        transfer(cpi_context.with_signer(signer_seeds), amount)?;

        msg!("Transferred {} lamports via CPI", amount);
        Ok(())
    }

    // Call another custom program via CPI
    pub fn call_custom_program(
        ctx: Context<CallCustomProgram>,
        data: u64,
    ) -> Result<()> {
        // Build CPI instruction
        let cpi_program = ctx.accounts.custom_program.to_account_info();
        let cpi_accounts = CustomInstruction {
            account: ctx.accounts.custom_account.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        // Call the other program
        custom_program::cpi::custom_instruction(cpi_ctx, data)?;

        msg!("Called custom program via CPI");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SolTransfer<'info> {
    #[account(
        mut,
        seeds = [b"sender"],
        bump
    )]
    pub sender_pda: SystemAccount<'info>,

    #[account(mut)]
    /// CHECK: Recipient can be any account
    pub recipient: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CallCustomProgram<'info> {
    #[account(mut)]
    pub custom_account: AccountInfo<'info>,

    /// CHECK: This is the program we're calling
    pub custom_program: AccountInfo<'info>,
}
```

**Key Features**:
- `CpiContext::new()` for building CPI calls
- `with_signer()` for PDA signing
- Type-safe CPI with generated `cpi` module
- Automatic account validation

### Native Rust Implementation

```rust
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke_signed,
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction_type = instruction_data[0];

    match instruction_type {
        0 => sol_transfer(program_id, accounts, instruction_data),
        1 => call_custom_program(program_id, accounts, instruction_data),
        _ => Err(ProgramError::InvalidInstructionData),
    }
}

fn sol_transfer(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let sender_pda = next_account_info(accounts_iter)?;
    let recipient = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    // Parse amount
    let amount = u64::from_le_bytes(instruction_data[1..9].try_into().unwrap());

    // Derive PDA
    let (pda, bump_seed) = Pubkey::find_program_address(&[b"sender"], program_id);

    // Verify PDA
    if pda != *sender_pda.key {
        return Err(ProgramError::InvalidSeeds);
    }

    msg!("Transferring {} lamports from PDA via CPI", amount);

    // Create transfer instruction
    let transfer_ix = system_instruction::transfer(sender_pda.key, recipient.key, amount);

    // Invoke with PDA signing
    invoke_signed(
        &transfer_ix,
        &[sender_pda.clone(), recipient.clone(), system_program.clone()],
        &[&[b"sender", &[bump_seed]]], // Signer seeds
    )?;

    msg!("Transfer successful");
    Ok(())
}

fn call_custom_program(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let custom_account = next_account_info(accounts_iter)?;
    let custom_program = next_account_info(accounts_iter)?;
    let caller_pda = next_account_info(accounts_iter)?;

    // Derive PDA
    let (pda, bump_seed) = Pubkey::find_program_address(&[b"caller"], program_id);

    // Verify PDA
    if pda != *caller_pda.key {
        return Err(ProgramError::InvalidSeeds);
    }

    // Parse data for custom program
    let data = u64::from_le_bytes(instruction_data[1..9].try_into().unwrap());

    msg!("Calling custom program via CPI");

    // Build instruction for custom program
    let mut instruction_data_buf = vec![0u8]; // Instruction discriminator
    instruction_data_buf.extend_from_slice(&data.to_le_bytes());

    let custom_ix = solana_program::instruction::Instruction {
        program_id: *custom_program.key,
        accounts: vec![solana_program::instruction::AccountMeta::new(
            *custom_account.key,
            false,
        )],
        data: instruction_data_buf,
    };

    // Invoke with PDA signing
    invoke_signed(
        &custom_ix,
        &[custom_account.clone(), custom_program.clone()],
        &[&[b"caller", &[bump_seed]]],
    )?;

    msg!("Custom program called successfully");
    Ok(())
}
```

**Key Concepts Demonstrated**:
- CPI to System Program for SOL transfers
- CPI to custom programs
- PDA signing with `invoke_signed`
- Signer seeds structure: `&[&[seed1, seed2, &[bump]]]`
- Building instructions for CPI

### CPI with PDA Signing

```rust
use solana_program::{
    account_info::AccountInfo,
    entrypoint::ProgramResult,
    program::invoke_signed,
    pubkey::Pubkey,
};
use spl_token::instruction as token_instruction;

pub fn transfer_tokens_from_pda(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    let pda_account = next_account_info(account_iter)?;
    let source_token_account = next_account_info(account_iter)?;
    let destination_token_account = next_account_info(account_iter)?;
    let token_program = next_account_info(account_iter)?;
    
    // Derive PDA and bump
    let (pda, bump) = Pubkey::find_program_address(
        &[b"vault"],
        program_id,
    );
    
    // Verify PDA
    if pda != *pda_account.key {
        return Err(ProgramError::InvalidSeeds);
    }
    
    // Create transfer instruction
    let transfer_ix = token_instruction::transfer(
        token_program.key,
        source_token_account.key,
        destination_token_account.key,
        pda_account.key,
        &[],
        amount,
    )?;
    
    // Invoke with PDA signing
    invoke_signed(
        &transfer_ix,
        &[
            source_token_account.clone(),
            destination_token_account.clone(),
            pda_account.clone(),
            token_program.clone(),
        ],
        &[&[b"vault", &[bump]]], // PDA signer seeds
    )?;
    
    Ok(())
}
```

### TypeScript CPI Example

```typescript
// Client doesn't need to do anything special for CPI
// The program handles it internally
async function callProgramWithCPI(
  connection: Connection,
  payer: Keypair,
  programId: PublicKey
): Promise<string> {
  const [pda] = await PublicKey.findProgramAddress(
    [Buffer.from('vault')],
    programId
  );
  
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: pda, isSigner: false, isWritable: true },
      { pubkey: sourceTokenAccount, isSigner: false, isWritable: true },
      { pubkey: destTokenAccount, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    programId,
    data: Buffer.from([/* instruction data */]),
  });
  
  const transaction = new Transaction().add(instruction);
  return await sendAndConfirmTransaction(connection, transaction, [payer]);
}
```

**Try It Yourself**:

```bash
# Clone the repository
git clone https://github.com/solana-developers/program-examples
cd program-examples/basics/cross-program-invocation/anchor

# Install dependencies
npm install

# Run tests
anchor test
```

**Experiment**:
- Call Token Program to mint tokens
- Chain multiple CPIs together
- Implement a proxy pattern with CPI
- Create a program that calls multiple programs

## Common PDA Patterns

### 1. User Data Accounts

Store per-user data with deterministic addresses:

```typescript
// Derive user-specific PDA
const [userPDA] = await PublicKey.findProgramAddress(
  [
    Buffer.from('user'),
    userPublicKey.toBuffer(),
  ],
  programId
);
```

```rust
// In program
let (user_pda, bump) = Pubkey::find_program_address(
    &[b"user", user.key.as_ref()],
    program_id,
);
```

### 2. Vault/Escrow Accounts

Hold tokens or SOL controlled by the program:

```typescript
const [vaultPDA] = await PublicKey.findProgramAddress(
  [Buffer.from('vault')],
  programId
);
```

### 3. Associated Accounts

Link multiple accounts together:

```typescript
const [metadataPDA] = await PublicKey.findProgramAddress(
  [
    Buffer.from('metadata'),
    mintPublicKey.toBuffer(),
  ],
  programId
);
```

### 4. Counter/Sequence PDAs

Generate unique addresses with counters:

```typescript
const counter = 42;
const [itemPDA] = await PublicKey.findProgramAddress(
  [
    Buffer.from('item'),
    Buffer.from(counter.toString()),
  ],
  programId
);
```

## Real-World Example: Escrow Program

### Program Structure

```rust
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke_signed,
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct EscrowAccount {
    pub initializer: Pubkey,
    pub temp_token_account: Pubkey,
    pub expected_amount: u64,
    pub bump: u8,
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    match instruction_data[0] {
        0 => initialize_escrow(program_id, accounts, instruction_data),
        1 => exchange(program_id, accounts),
        _ => Err(ProgramError::InvalidInstructionData),
    }
}

pub fn initialize_escrow(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    let initializer = next_account_info(account_iter)?;
    let temp_token_account = next_account_info(account_iter)?;
    let escrow_account = next_account_info(account_iter)?;
    let system_program = next_account_info(account_iter)?;
    
    if !initializer.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Derive escrow PDA
    let (escrow_pda, bump) = Pubkey::find_program_address(
        &[b"escrow", initializer.key.as_ref()],
        program_id,
    );
    
    if escrow_pda != *escrow_account.key {
        return Err(ProgramError::InvalidSeeds);
    }
    
    // Parse expected amount from instruction data
    let expected_amount = u64::from_le_bytes(
        instruction_data[1..9].try_into().unwrap()
    );
    
    // Create escrow account
    let rent = Rent::get()?;
    let space = std::mem::size_of::<EscrowAccount>();
    let lamports = rent.minimum_balance(space);
    
    invoke_signed(
        &system_instruction::create_account(
            initializer.key,
            escrow_account.key,
            lamports,
            space as u64,
            program_id,
        ),
        &[initializer.clone(), escrow_account.clone(), system_program.clone()],
        &[&[b"escrow", initializer.key.as_ref(), &[bump]]],
    )?;
    
    // Initialize escrow data
    let escrow_data = EscrowAccount {
        initializer: *initializer.key,
        temp_token_account: *temp_token_account.key,
        expected_amount,
        bump,
    };
    
    escrow_data.serialize(&mut &mut escrow_account.data.borrow_mut()[..])?;
    
    msg!("Escrow initialized");
    Ok(())
}
```

### Client Code

```typescript
async function initializeEscrow(
  connection: Connection,
  payer: Keypair,
  programId: PublicKey,
  tempTokenAccount: PublicKey,
  expectedAmount: number
): Promise<PublicKey> {
  // Derive escrow PDA
  const [escrowPDA, bump] = await PublicKey.findProgramAddress(
    [Buffer.from('escrow'), payer.publicKey.toBuffer()],
    programId
  );
  
  // Create instruction data
  const data = Buffer.alloc(9);
  data.writeUInt8(0, 0); // Instruction index
  data.writeBigUInt64LE(BigInt(expectedAmount), 1);
  
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: payer.publicKey, isSigner: true, isWritable: true },
      { pubkey: tempTokenAccount, isSigner: false, isWritable: false },
      { pubkey: escrowPDA, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId,
    data,
  });
  
  const transaction = new Transaction().add(instruction);
  await sendAndConfirmTransaction(connection, transaction, [payer]);
  
  return escrowPDA;
}
```

## Best Practices

1. **Use descriptive seeds** - Makes PDAs easier to understand and debug
2. **Store bump seeds** - Save the bump in account data to avoid recomputation
3. **Validate PDAs** - Always verify derived PDA matches provided account
4. **Use canonical bump** - Use `find_program_address` which finds canonical bump
5. **Limit seed complexity** - Keep seeds simple and deterministic
6. **Document seed structure** - Clearly document what seeds are used

## Common Pitfalls

1. **Not validating PDAs** - Always check derived PDA matches provided account
2. **Wrong seed order** - Seed order matters for derivation
3. **Missing bump in CPI** - Must include bump in signer seeds
4. **Using wrong program ID** - PDA is specific to the deriving program
5. **Seed size limits** - Total seeds must be ≤ 32 bytes each
6. **Not handling bump properly** - Store and reuse bump seeds

## Advanced Patterns

### Multiple PDAs per User

```typescript
// Profile PDA
const [profilePDA] = await PublicKey.findProgramAddress(
  [Buffer.from('profile'), user.toBuffer()],
  programId
);

// Settings PDA
const [settingsPDA] = await PublicKey.findProgramAddress(
  [Buffer.from('settings'), user.toBuffer()],
  programId
);

// Stats PDA
const [statsPDA] = await PublicKey.findProgramAddress(
  [Buffer.from('stats'), user.toBuffer()],
  programId
);
```

### Hierarchical PDAs

```typescript
// Organization PDA
const [orgPDA] = await PublicKey.findProgramAddress(
  [Buffer.from('org'), orgId.toBuffer()],
  programId
);

// Member PDA (child of organization)
const [memberPDA] = await PublicKey.findProgramAddress(
  [Buffer.from('member'), orgPDA.toBuffer(), user.toBuffer()],
  programId
);
```

## Source Attribution

This content is based on educational materials and examples from:

- **Solana Documentation**: https://docs.solana.com/developing/programming-model/calling-between-programs#program-derived-addresses
- **Solana Cookbook**: https://solanacookbook.com/core-concepts/pdas.html
- **Anchor Framework**: https://www.anchor-lang.com/docs/pdas
- **Percolator Risk Engine**: [percolator/percolator/src/percolator.rs](../../../percolator/percolator/src/percolator.rs)
  - Advanced PDA usage in production DeFi protocol
  - Account management patterns with PDAs

## Next Steps

Now that you understand PDAs, you're ready to:

- [Exercises](../exercises/README.md) - Practice building with PDAs
- [Security](../../security/README.md) - Learn security best practices
- [DeFi](../../defi/README.md) - Build DeFi protocols using PDAs

## Additional Resources

- [PDA Deep Dive](https://www.anchor-lang.com/docs/pdas) - Comprehensive guide to Program Derived Addresses in Anchor
- [Escrow Program Tutorial](https://paulx.dev/blog/2021/01/14/programming-on-solana-an-introduction/) - Step-by-step tutorial building an escrow program using PDAs
- [Solana Program Examples](https://github.com/solana-labs/solana-program-library) - Reference implementations showing PDA usage patterns
