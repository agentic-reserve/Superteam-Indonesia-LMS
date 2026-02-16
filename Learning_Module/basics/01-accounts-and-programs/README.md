# Accounts and Programs

## Overview

Understanding Solana's account model is fundamental to building on the platform. Unlike Ethereum's account-based model where smart contracts store state internally, Solana separates code (programs) from data (accounts). This design enables Solana's parallel transaction processing and high throughput.

**Estimated Time:** 2-3 hours

## Learning Objectives

After completing this lesson, you will be able to:

- Explain Solana's account model and how it differs from other blockchains
- Understand the relationship between programs and data accounts
- Describe account ownership and the implications for security
- Work with account rent and understand account lifecycle
- Identify the basic structure of a Solana program

## Prerequisites

- Completed [Setup Guide](../../setup/README.md)
- Basic understanding of blockchain concepts
- Familiarity with either Rust or TypeScript

## The Solana Account Model

### What is an Account?

In Solana, everything is an account. An account is a data structure that can store:
- **Lamports** (SOL's smallest unit: 1 SOL = 1,000,000,000 lamports)
- **Data** (arbitrary bytes)
- **Owner** (the program that controls this account)
- **Executable flag** (whether this account contains program code)

### Account Structure

Every Solana account has the following fields:

```rust
pub struct Account {
    /// Lamports in the account
    pub lamports: u64,
    /// Data held in this account
    pub data: Vec<u8>,
    /// The program that owns this account
    pub owner: Pubkey,
    /// This account's data contains a loaded program (and is now read-only)
    pub executable: bool,
    /// The epoch at which this account will next owe rent
    pub rent_epoch: Epoch,
}
```

### Key Concepts

#### 1. Account Ownership

Every account is owned by a program. Only the owning program can:
- Modify the account's data
- Deduct lamports from the account

This is a critical security feature. For example:
- Your wallet account is owned by the System Program
- Token accounts are owned by the Token Program
- Custom data accounts are owned by your program

#### 2. Programs vs Data Accounts

**Programs** (executable accounts):
- Contain compiled bytecode
- Are marked as `executable = true`
- Are immutable once deployed (unless upgradeable)
- Are owned by the BPF Loader program

**Data Accounts**:
- Store state and user data
- Are marked as `executable = false`
- Can be modified by their owning program
- Are owned by the program that created them

#### 3. Account Rent

Solana requires accounts to maintain a minimum balance (rent) to stay alive on the blockchain. There are two ways to handle rent:

**Rent-Exempt Accounts** (recommended):
- Maintain a balance >= 2 years of rent
- Never pay rent and exist indefinitely
- Most modern programs use this approach

**Rent-Paying Accounts** (deprecated):
- Pay rent periodically
- Can be garbage collected if balance drops to zero
- Not recommended for new programs

Calculate rent-exempt minimum:
```bash
solana rent <DATA_SIZE_IN_BYTES>
```

Example for a 100-byte account:
```bash
solana rent 100
# Output: Rent-exempt minimum: 0.00089088 SOL
```

## Program Architecture

### Program Structure

A typical Solana program has three main components:

#### 1. Entrypoint

The entrypoint is where the Solana runtime calls your program:

```rust
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
};

// Declare the program entrypoint
entrypoint!(process_instruction);

// Program entrypoint implementation
pub fn process_instruction(
    program_id: &Pubkey,      // Public key of the program account
    accounts: &[AccountInfo],  // Accounts required for the instruction
    instruction_data: &[u8],   // Instruction data
) -> ProgramResult {
    // Your program logic here
    Ok(())
}
```

#### 2. Instruction Processing

Programs receive instructions and route them to appropriate handlers:

```rust
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Deserialize instruction
    let instruction = MyInstruction::unpack(instruction_data)?;
    
    // Route to appropriate handler
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

#### 3. State Management

Programs define data structures for account state:

```rust
use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct MyAccountData {
    pub is_initialized: bool,
    pub owner: Pubkey,
    pub counter: u64,
}
```

### Account Validation

Security in Solana programs relies heavily on proper account validation:

```rust
pub fn process_initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    
    // Get accounts
    let data_account = next_account_info(account_iter)?;
    let owner_account = next_account_info(account_iter)?;
    
    // Validate: data account is owned by this program
    if data_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Validate: owner signed the transaction
    if !owner_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Validate: account is writable
    if !data_account.is_writable {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Process instruction...
    Ok(())
}
```

## Working with Accounts

### Generating Keypairs

#### Using Web3.js Kit (Recommended)

```typescript
import { generateKeyPairSigner } from "@solana/kit";

// Generate a new keypair signer
const keypairSigner = await generateKeyPairSigner();
console.log('Address:', keypairSigner.address);
```

#### Using Legacy Web3.js

```typescript
import { Keypair } from "@solana/web3.js";

// Generate a new keypair
const keypair = Keypair.generate();
console.log('Public Key:', keypair.publicKey.toBase58());
console.log('Secret Key:', keypair.secretKey);
```

### Creating Accounts

Accounts are created by the System Program. There are two main approaches: creating accounts via CPI (Cross-Program Invocation) from within a program, or creating them directly from a client.

**Source**: [solana-program-examples/basics/create-account](https://github.com/solana-developers/program-examples/tree/main/basics/create-account)

#### Anchor Implementation (Recommended)

```rust
use anchor_lang::prelude::*;
use anchor_lang::system_program::{create_account, CreateAccount};

declare_id!("8PSAL9tQY4gy5xsBGWJq3e7BPPYyBZq8VzRLW6LhHcMW");

#[program]
pub mod create_account {
    use super::*;

    // Create account using Anchor's init constraint (recommended)
    pub fn create_system_account(ctx: Context<CreateSystemAccount>) -> Result<()> {
        msg!("Account created with address: {}", ctx.accounts.pda_account.key());
        msg!("Account lamports: {}", ctx.accounts.pda_account.to_account_info().lamports());
        Ok(())
    }

    // Create account using CPI to System Program
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

        msg!("Account created via CPI: {}", ctx.accounts.new_account.key());
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

**Key Features**:
- `init` constraint automatically handles account creation
- PDA-based account creation with seeds
- CPI method for more control over account creation
- Automatic rent-exemption calculation

#### Native Rust Implementation

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

    // Derive PDA
    let (pda, bump_seed) = Pubkey::find_program_address(
        &[b"pda_account", payer.key.as_ref()],
        program_id,
    );

    // Verify the derived PDA matches the provided account
    if pda != *new_account.key {
        return Err(solana_program::program_error::ProgramError::InvalidSeeds);
    }

    // Calculate rent-exempt minimum
    let rent = Rent::get()?;
    let space = 8; // Account data size
    let lamports = rent.minimum_balance(space);

    msg!("Creating account with {} lamports and {} bytes", lamports, space);

    // Create account via CPI with PDA signing
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

    msg!("Account created successfully: {}", new_account.key);
    Ok(())
}
```

**Key Concepts Demonstrated**:
- PDA derivation and validation
- Rent-exempt balance calculation
- CPI to System Program with `invoke_signed`
- Account creation with program ownership

#### Client Code (TypeScript)

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
  // Generate new keypair for the account
  const newAccount = Keypair.generate();
  
  // Calculate rent-exempt minimum
  const lamports = await connection.getMinimumBalanceForRentExemption(space);
  
  // Create account instruction
  const createAccountIx = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: newAccount.publicKey,
    lamports,
    space,
    programId,
  });
  
  // Send transaction
  const transaction = new Transaction().add(createAccountIx);
  await sendAndConfirmTransaction(connection, transaction, [payer, newAccount]);
  
  return newAccount;
}
```

**Try It Yourself**:

```bash
# Clone the repository
git clone https://github.com/solana-developers/program-examples
cd program-examples/basics/create-account/anchor

# Install dependencies
npm install

# Run tests
anchor test
```

**Experiment**:
- Create accounts with different space allocations
- Try creating multiple accounts in one transaction
- Implement account creation with custom seeds
- Add validation for account initialization

### Reading Account Data

```typescript
async function readAccountData(
  connection: Connection,
  accountPubkey: PublicKey
): Promise<Buffer> {
  const accountInfo = await connection.getAccountInfo(accountPubkey);
  
  if (!accountInfo) {
    throw new Error('Account not found');
  }
  
  return accountInfo.data;
}
```

### Writing Account Data (from program)

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

The System Program is a native Solana program that handles:
- Creating new accounts
- Transferring lamports between accounts
- Allocating account space
- Assigning account ownership

**System Program ID:** `11111111111111111111111111111111`

Common System Program instructions:
- `CreateAccount` - Create a new account
- `Transfer` - Transfer lamports
- `Allocate` - Allocate space for an account
- `Assign` - Assign account ownership to a program

## Real-World Example: Counter Program

Let's look at a simple counter program that demonstrates these concepts. This example is from the official Solana program examples repository.

**Source**: [solana-program-examples/basics/counter](https://github.com/solana-developers/program-examples/tree/main/basics/counter)

### Anchor Implementation (Recommended)

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

**Key Features**:
- Uses `InitSpace` derive macro for automatic space calculation
- `checked_add` prevents overflow
- `init` constraint handles account creation automatically
- Clean separation of initialization and increment logic

### Native Rust Implementation

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

// Define the account data structure
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct CounterAccount {
    pub count: u64,
}

// Declare entrypoint
entrypoint!(process_instruction);

// Program entrypoint
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    msg!("Counter program entrypoint");
    
    // Get the account that stores the counter
    let accounts_iter = &mut accounts.iter();
    let account = next_account_info(accounts_iter)?;
    
    // The account must be owned by the program
    if account.owner != program_id {
        msg!("Counter account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Deserialize the account data
    let mut counter_data = CounterAccount::try_from_slice(&account.data.borrow())?;
    
    // Increment the counter (with overflow check)
    counter_data.count = counter_data.count.checked_add(1)
        .ok_or(ProgramError::InvalidAccountData)?;
    msg!("Counter incremented to: {}", counter_data.count);
    
    // Serialize the updated data back to the account
    counter_data.serialize(&mut &mut account.data.borrow_mut()[..])?;
    
    Ok(())
}
```

### Client Code (TypeScript)

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import { assert } from "chai";
import type { CounterAnchor } from "../target/types/counter_anchor";

describe("Counter Program", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace.CounterAnchor as Program<CounterAnchor>;

  // Generate a new keypair for the counter account
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
      "Expected initialized count to be 0"
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

    assert(currentCount.count.toNumber() === 1, "Expected count to be 1");
  });

  it("Increment Counter Again", async () => {
    await program.methods
      .increment()
      .accounts({ counter: counterKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.counter.fetch(
      counterKeypair.publicKey
    );

    assert(currentCount.count.toNumber() === 2, "Expected count to be 2");
  });
});
```

**Key Concepts Demonstrated**:
- Account initialization with proper space allocation
- Account ownership validation
- Safe arithmetic with overflow checking
- Data serialization/deserialization
- Multiple instruction handling

**Try It Yourself**:

```bash
# Clone the repository
git clone https://github.com/solana-developers/program-examples
cd program-examples/basics/counter/anchor

# Install dependencies
npm install

# Run tests
anchor test
```

**Experiment**:
- Modify the counter to decrement
- Add a reset function
- Store additional data (owner, timestamp)
- Implement access control

## Common Patterns

### 1. Account Initialization Pattern

```rust
pub fn initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    let account_iter = &mut accounts.iter();
    let data_account = next_account_info(account_iter)?;
    
    // Check if already initialized
    let mut data = MyData::try_from_slice(&data_account.data.borrow())?;
    if data.is_initialized {
        return Err(ProgramError::AccountAlreadyInitialized);
    }
    
    // Initialize
    data.is_initialized = true;
    data.serialize(&mut &mut data_account.data.borrow_mut()[..])?;
    
    Ok(())
}
```

### 2. Owner Validation Pattern

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

### 3. Signer Validation Pattern

```rust
pub fn validate_signer(account: &AccountInfo) -> ProgramResult {
    if !account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    Ok(())
}
```

## Best Practices

1. **Always validate account ownership** - Ensure accounts are owned by the expected program
2. **Check signer requirements** - Verify that required accounts have signed the transaction
3. **Validate account writability** - Ensure accounts that need to be modified are marked as writable
4. **Use rent-exempt accounts** - Always fund accounts with enough lamports to be rent-exempt
5. **Initialize accounts properly** - Check initialization status to prevent re-initialization attacks
6. **Handle errors gracefully** - Return appropriate error codes for different failure scenarios

## Common Pitfalls

1. **Forgetting to validate account ownership** - Can lead to security vulnerabilities
2. **Not checking if accounts are writable** - Will cause runtime errors
3. **Insufficient rent** - Accounts can be garbage collected
4. **Missing signer checks** - Allows unauthorized access
5. **Incorrect account ordering** - Programs expect accounts in a specific order

## Source Attribution

This content is based on educational materials and examples from:

- **Solana Documentation**: https://docs.solana.com/developing/programming-model/accounts
- **Solana Cookbook**: https://solanacookbook.com/core-concepts/accounts.html
- **Percolator Risk Engine**: [percolator/percolator/src/percolator.rs](../../../percolator/percolator/src/percolator.rs)
  - Demonstrates advanced account management in a production-grade program
  - Shows account slab patterns and bitmap-based account tracking
- **Solana Agent Kit**: [solana-agent-kit/solana-agent-kit](../../../solana-agent-kit/solana-agent-kit/)
  - Examples of interacting with Solana programs from TypeScript
  - Token and NFT account management patterns

## Next Steps

Now that you understand accounts and programs, you're ready to learn about:

- [Transactions](../02-transactions/README.md) - How to construct and send transactions
- [Tokens](../03-tokens/README.md) - Working with SPL tokens
- [PDAs](../04-pdas/README.md) - Program Derived Addresses for advanced patterns

## Additional Resources

- [Solana Program Library (SPL)](https://spl.solana.com/) - Collection of on-chain programs maintained by Solana Labs
- [Anchor Framework Documentation](https://www.anchor-lang.com/) - Complete guide to building Solana programs with Anchor
- [Solana Playground](https://beta.solpg.io/) - Browser-based IDE for writing and deploying Solana programs without local setup
- [Program Examples](https://github.com/solana-labs/solana-program-library) - Reference implementations of common program patterns

## Exercises

Ready to practice? Head to the [Exercises](../exercises/README.md) section to build your own programs!
