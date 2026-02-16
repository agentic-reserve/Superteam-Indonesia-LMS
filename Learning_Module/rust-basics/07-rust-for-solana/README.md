# Rust for Solana

## Overview

You've learned the fundamentals of Rust—ownership, structs, enums, error handling, traits, generics, and modules. Now it's time to see how all these concepts come together in Solana program development. This lesson bridges general Rust knowledge with Solana-specific patterns, showing you how to read and write Solana programs with confidence.

Solana programs are written in Rust and compiled to BPF (Berkeley Packet Filter) bytecode for on-chain execution. Understanding how Rust concepts map to Solana's programming model is essential for building secure, efficient blockchain applications. Whether you're using native Solana or the Anchor framework, the Rust fundamentals you've learned form the foundation of everything you'll build.

**Estimated Time:** 3-4 hours

## Learning Objectives

By completing this lesson, you will be able to:

- Understand Solana's account model and how it relates to Rust ownership
- Read and write Solana program entry points
- Work with account data using Rust structs and serialization
- Apply error handling patterns in Solana programs
- Use traits for account validation and serialization
- Organize Solana programs using Rust modules
- Understand the Anchor framework's Rust patterns
- Transition from Rust basics to Solana development
- Identify next steps in your Solana learning journey

## Prerequisites

- Completion of all previous lessons (01-06)
- Understanding of Rust fundamentals, ownership, structs, enums, error handling, traits, generics, and modules
- Familiarity with basic blockchain concepts (recommended)

## Solana's Account Model

Solana's architecture is fundamentally different from Ethereum. Instead of smart contracts with internal state, Solana uses an account model where data and code are separated.

### Accounts in Solana

```rust
use solana_program::account_info::AccountInfo;

pub struct AccountInfo<'a> {
    pub key: &'a Pubkey,              // Account's public key
    pub is_signer: bool,              // Was this account a signer?
    pub is_writable: bool,            // Can this account be modified?
    pub lamports: Rc<RefCell<&'a mut u64>>, // Account balance
    pub data: Rc<RefCell<&'a mut [u8]>>,    // Account data
    pub owner: &'a Pubkey,            // Program that owns this account
    pub executable: bool,             // Is this account executable?
    pub rent_epoch: Epoch,            // Next rent collection epoch
}
```

**Key concepts:**
- **Accounts** store data and SOL (lamports)
- **Programs** (smart contracts) are accounts marked as executable
- **Data accounts** are owned by programs and store program state
- **Ownership** determines which program can modify an account

### Ownership and Borrowing in Solana

Remember Rust's ownership rules? They're crucial in Solana:

```rust
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    pubkey::Pubkey,
};

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    
    // Borrow account references
    let account = next_account_info(accounts_iter)?;
    
    // Borrow account data mutably
    let mut data = account.try_borrow_mut_data()?;
    
    // Modify data
    data[0] = 42;
    
    // data is automatically dropped here, releasing the borrow
    Ok(())
}
```

**Ownership in Solana:**
- Accounts are borrowed, not owned, by your program
- Use `try_borrow_data()` for immutable access
- Use `try_borrow_mut_data()` for mutable access
- Borrows must be released before function returns
- Multiple immutable borrows OK, but only one mutable borrow

## Program Entry Points

Every Solana program has an entry point that processes instructions.

### Native Solana Entry Point

```rust
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
};

// Declare the entry point
entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,        // Program ID (address)
    accounts: &[AccountInfo],   // Accounts involved
    instruction_data: &[u8],    // Instruction data
) -> ProgramResult {
    msg!("Hello from Solana!");
    Ok(())
}
```

**Entry point signature:**
- `program_id`: Your program's address
- `accounts`: Slice of account references
- `instruction_data`: Raw bytes containing instruction parameters
- Returns `ProgramResult` (alias for `Result<(), ProgramError>`)

### Processing Instructions

```rust
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program_error::ProgramError,
    pubkey::Pubkey,
    msg,
};

// Define instruction enum
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum MyInstruction {
    Initialize { amount: u64 },
    Transfer { amount: u64 },
    Close,
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Deserialize instruction
    let instruction = MyInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;
    
    // Route to handler
    match instruction {
        MyInstruction::Initialize { amount } => {
            msg!("Instruction: Initialize");
            process_initialize(program_id, accounts, amount)
        }
        MyInstruction::Transfer { amount } => {
            msg!("Instruction: Transfer");
            process_transfer(program_id, accounts, amount)
        }
        MyInstruction::Close => {
            msg!("Instruction: Close");
            process_close(program_id, accounts)
        }
    }
}

fn process_initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    // Implementation
    Ok(())
}

fn process_transfer(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    // Implementation
    Ok(())
}

fn process_close(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    // Implementation
    Ok(())
}
```

## Account Data and Serialization

Solana uses Borsh for efficient serialization of account data.

### Defining Account State

```rust
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct TokenAccount {
    pub is_initialized: bool,
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub balance: u64,
}

impl TokenAccount {
    pub const LEN: usize = 1 + 32 + 32 + 8; // bool + Pubkey + Pubkey + u64
}
```

### Reading Account Data

```rust
use solana_program::{
    account_info::AccountInfo,
    program_error::ProgramError,
};

fn get_token_account(account: &AccountInfo) -> Result<TokenAccount, ProgramError> {
    let data = account.try_borrow_data()?;
    let account_data = TokenAccount::try_from_slice(&data)
        .map_err(|_| ProgramError::InvalidAccountData)?;
    Ok(account_data)
}
```

### Writing Account Data

```rust
use solana_program::{
    account_info::AccountInfo,
    program_error::ProgramError,
};

fn save_token_account(
    account: &AccountInfo,
    token_account: &TokenAccount,
) -> ProgramResult {
    let mut data = account.try_borrow_mut_data()?;
    token_account.serialize(&mut &mut data[..])?;
    Ok(())
}
```

### Complete Example: Initialize Account

```rust
fn process_initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    initial_balance: u64,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    
    let token_account = next_account_info(accounts_iter)?;
    let mint_account = next_account_info(accounts_iter)?;
    let owner_account = next_account_info(accounts_iter)?;
    
    // Validate owner is signer
    if !owner_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Validate account is owned by program
    if token_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Check account is not already initialized
    let mut data = token_account.try_borrow_mut_data()?;
    if data[0] != 0 {
        return Err(ProgramError::AccountAlreadyInitialized);
    }
    
    // Create and save account data
    let account_data = TokenAccount {
        is_initialized: true,
        owner: *owner_account.key,
        mint: *mint_account.key,
        balance: initial_balance,
    };
    
    account_data.serialize(&mut &mut data[..])?;
    
    msg!("Token account initialized");
    Ok(())
}
```

## Error Handling in Solana

Proper error handling is critical for security and debugging.

### Using ProgramError

```rust
use solana_program::program_error::ProgramError;

fn validate_account(account: &AccountInfo, expected_owner: &Pubkey) -> ProgramResult {
    if account.owner != expected_owner {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    if !account.is_writable {
        return Err(ProgramError::InvalidAccountData);
    }
    
    if !account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    Ok(())
}
```

### Custom Errors

```rust
use solana_program::program_error::ProgramError;
use thiserror::Error;

#[derive(Error, Debug, Copy, Clone)]
pub enum TokenError {
    #[error("Insufficient funds for transfer")]
    InsufficientFunds,
    
    #[error("Account is not initialized")]
    NotInitialized,
    
    #[error("Account is already initialized")]
    AlreadyInitialized,
    
    #[error("Invalid mint account")]
    InvalidMint,
}

impl From<TokenError> for ProgramError {
    fn from(e: TokenError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

// Usage
fn transfer_tokens(from: &mut TokenAccount, to: &mut TokenAccount, amount: u64) -> ProgramResult {
    if !from.is_initialized || !to.is_initialized {
        return Err(TokenError::NotInitialized.into());
    }
    
    if from.balance < amount {
        return Err(TokenError::InsufficientFunds.into());
    }
    
    from.balance -= amount;
    to.balance += amount;
    
    Ok(())
}
```

## Traits in Solana Programs

Traits enable code reuse and abstraction in Solana programs.

### Borsh Serialization Traits

```rust
use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct MyData {
    pub value: u64,
    pub owner: Pubkey,
}

// Automatically implements:
// - BorshSerialize::serialize()
// - BorshDeserialize::deserialize()
// - BorshDeserialize::try_from_slice()
```

### Custom Traits for Validation

```rust
trait Validate {
    fn validate(&self) -> ProgramResult;
}

impl Validate for TokenAccount {
    fn validate(&self) -> ProgramResult {
        if !self.is_initialized {
            return Err(TokenError::NotInitialized.into());
        }
        
        if self.balance > 1_000_000_000 {
            return Err(ProgramError::InvalidAccountData);
        }
        
        Ok(())
    }
}

// Usage
fn process_transfer(account: &TokenAccount) -> ProgramResult {
    account.validate()?;
    // Continue processing
    Ok(())
}
```

## The Anchor Framework

Anchor is a framework that makes Solana development more ergonomic by leveraging Rust's type system and macros.

### Anchor Program Structure

```rust
use anchor_lang::prelude::*;

declare_id!("YourProgramIDHere111111111111111111111111111");

#[program]
pub mod my_program {
    use super::*;
    
    pub fn initialize(ctx: Context<Initialize>, amount: u64) -> Result<()> {
        let account = &mut ctx.accounts.token_account;
        account.owner = ctx.accounts.owner.key();
        account.balance = amount;
        account.is_initialized = true;
        msg!("Initialized with balance: {}", amount);
        Ok(())
    }
    
    pub fn transfer(ctx: Context<Transfer>, amount: u64) -> Result<()> {
        let from = &mut ctx.accounts.from;
        let to = &mut ctx.accounts.to;
        
        require!(from.balance >= amount, ErrorCode::InsufficientFunds);
        
        from.balance -= amount;
        to.balance += amount;
        
        msg!("Transferred {} tokens", amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + TokenAccount::LEN
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Transfer<'info> {
    #[account(mut)]
    pub from: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
    
    pub authority: Signer<'info>,
}

#[account]
pub struct TokenAccount {
    pub owner: Pubkey,
    pub balance: u64,
    pub is_initialized: bool,
}

impl TokenAccount {
    pub const LEN: usize = 32 + 8 + 1;
}

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds for transfer")]
    InsufficientFunds,
}
```

**Anchor benefits:**
- `#[program]`: Defines program module
- `#[derive(Accounts)]`: Automatic account validation
- `#[account]`: Automatic serialization and discriminator
- `#[error_code]`: Clean error definitions
- `require!`: Concise validation macro
- Type-safe account access

### Anchor vs Native Comparison

**Native Solana:**
```rust
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let account = next_account_info(accounts_iter)?;
    
    if account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    let mut data = account.try_borrow_mut_data()?;
    let account_data = TokenAccount::try_from_slice(&data)?;
    
    // Process...
    
    account_data.serialize(&mut &mut data[..])?;
    Ok(())
}
```

**Anchor:**
```rust
pub fn initialize(ctx: Context<Initialize>, amount: u64) -> Result<()> {
    let account = &mut ctx.accounts.token_account;
    account.balance = amount;
    // Validation and serialization automatic
    Ok(())
}
```

## Common Solana Patterns

### Pattern 1: Account Validation

```rust
// Native
fn validate_accounts(
    account: &AccountInfo,
    expected_owner: &Pubkey,
    must_be_signer: bool,
    must_be_writable: bool,
) -> ProgramResult {
    if account.owner != expected_owner {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    if must_be_signer && !account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    if must_be_writable && !account.is_writable {
        return Err(ProgramError::InvalidAccountData);
    }
    
    Ok(())
}

// Anchor
#[derive(Accounts)]
pub struct MyContext<'info> {
    #[account(mut)]  // Automatically validates writable
    pub my_account: Account<'info, MyAccount>,
    
    pub authority: Signer<'info>,  // Automatically validates signer
}
```

### Pattern 2: PDA (Program Derived Address)

```rust
// Native
use solana_program::pubkey::Pubkey;

fn find_pda(program_id: &Pubkey, user: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[b"token_account", user.as_ref()],
        program_id,
    )
}

// Anchor
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + TokenAccount::LEN,
        seeds = [b"token_account", user.key().as_ref()],
        bump
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}
```

### Pattern 3: Cross-Program Invocation (CPI)

```rust
// Native
use solana_program::{
    account_info::AccountInfo,
    program::invoke,
    system_instruction,
};

fn transfer_lamports(
    from: &AccountInfo,
    to: &AccountInfo,
    amount: u64,
    system_program: &AccountInfo,
) -> ProgramResult {
    let instruction = system_instruction::transfer(
        from.key,
        to.key,
        amount,
    );
    
    invoke(
        &instruction,
        &[from.clone(), to.clone(), system_program.clone()],
    )?;
    
    Ok(())
}

// Anchor
use anchor_lang::system_program;

pub fn transfer_lamports(ctx: Context<Transfer>, amount: u64) -> Result<()> {
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.from.to_account_info(),
                to: ctx.accounts.to.to_account_info(),
            },
        ),
        amount,
    )?;
    Ok(())
}
```

## Reading Solana Programs

When reading Solana programs, look for these key elements:

1. **Entry point**: Where does execution start?
2. **Instruction enum**: What operations are supported?
3. **Account structures**: What data is stored?
4. **Validation logic**: How are accounts and inputs validated?
5. **State transitions**: How does data change?
6. **Error handling**: What can go wrong?

### Example: Reading a Token Transfer

```rust
pub fn process_transfer(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u64,
) -> ProgramResult {
    // 1. Get accounts
    let accounts_iter = &mut accounts.iter();
    let from_account = next_account_info(accounts_iter)?;
    let to_account = next_account_info(accounts_iter)?;
    let authority = next_account_info(accounts_iter)?;
    
    // 2. Validate authority
    if !authority.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // 3. Load account data
    let mut from_data = TokenAccount::try_from_slice(&from_account.try_borrow_data()?)?;
    let mut to_data = TokenAccount::try_from_slice(&to_account.try_borrow_data()?)?;
    
    // 4. Validate state
    if from_data.owner != *authority.key {
        return Err(ProgramError::InvalidAccountData);
    }
    
    if from_data.balance < amount {
        return Err(TokenError::InsufficientFunds.into());
    }
    
    // 5. Update state
    from_data.balance -= amount;
    to_data.balance += amount;
    
    // 6. Save state
    from_data.serialize(&mut &mut from_account.try_borrow_mut_data()?[..])?;
    to_data.serialize(&mut &mut to_account.try_borrow_mut_data()?[..])?;
    
    msg!("Transferred {} tokens", amount);
    Ok(())
}
```

## Best Practices

1. **Always validate account ownership**:
   ```rust
   if account.owner != program_id {
       return Err(ProgramError::IncorrectProgramId);
   }
   ```

2. **Check signer requirements**:
   ```rust
   if !authority.is_signer {
       return Err(ProgramError::MissingRequiredSignature);
   }
   ```

3. **Validate account data before use**:
   ```rust
   if !account_data.is_initialized {
       return Err(TokenError::NotInitialized.into());
   }
   ```

4. **Use descriptive error messages**:
   ```rust
   #[error_code]
   pub enum ErrorCode {
       #[msg("Source account has insufficient funds for this transfer")]
       InsufficientFunds,
   }
   ```

5. **Log important events**:
   ```rust
   msg!("Transferred {} tokens from {} to {}", amount, from.key, to.key);
   ```

6. **Handle borrows carefully**:
   ```rust
   {
       let data = account.try_borrow_data()?;
       // Use data
   } // Borrow released here
   ```

## Next Steps

Congratulations! You've completed the Rust Basics module and learned how Rust concepts apply to Solana development. You're now ready to dive deeper into Solana-specific topics.

### Recommended Learning Path

1. **Anchor Framework**: Learn Anchor in depth for productive Solana development
   - Continue to [Anchor Framework](../../basics/05-anchor-framework/README.md)

2. **Solana Program Development**: Build complete Solana programs
   - Explore [Solana Basics](../../basics/README.md)

3. **Testing**: Learn to test Solana programs
   - Study testing patterns and frameworks

4. **Security**: Understand common vulnerabilities
   - Review [Security Best Practices](../../security/README.md)

5. **Advanced Topics**: PDAs, CPIs, and program architecture
   - Dive into advanced Solana patterns

### Additional Resources

- [Solana Cookbook](https://solanacookbook.com/): Practical recipes for common tasks
- [Anchor Book](https://book.anchor-lang.com/): Comprehensive Anchor guide
- [Solana Program Examples](https://github.com/solana-labs/solana-program-library): Official program examples
- [Solana Stack Exchange](https://solana.stackexchange.com/): Community Q&A

## Source Attribution

Content in this lesson is based on:

- [Solana Documentation](https://docs.solana.com/)
- [Anchor Framework Documentation](https://www.anchor-lang.com/)
- [Solana Program Library](https://github.com/solana-labs/solana-program-library)
- [The Rust Programming Language Book](https://doc.rust-lang.org/book/)
- Comprehensive Rust and Solana reference materials in [rust-full-llms.txt](../../../solana-llms-resources/rust-full-llms.txt)

---

**Previous**: [Modules and Cargo](../06-modules-cargo/README.md)  
**Next**: [Anchor Framework](../../basics/05-anchor-framework/README.md)  
**Module Home**: [Rust Basics](../README.md)

**Language:** [English](README.md) | [Bahasa Indonesia](README_ID.md)
