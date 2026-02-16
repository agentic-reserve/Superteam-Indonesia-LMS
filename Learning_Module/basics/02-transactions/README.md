# Transactions

## Overview

Transactions are the fundamental unit of activity on Solana. They contain one or more instructions that tell the network what operations to perform. Understanding how transactions work is essential for building any Solana application.

**Estimated Time:** 1-2 hours

## Learning Objectives

After completing this lesson, you will be able to:

- Understand the structure of a Solana transaction
- Create and sign transactions
- Submit transactions to the network
- Handle transaction fees and compute units
- Implement proper error handling for transactions
- Optimize transactions for performance

## Prerequisites

- Completed [Accounts and Programs](../01-accounts-and-programs/README.md)
- Understanding of public key cryptography
- Basic knowledge of asynchronous programming

## Transaction Anatomy

### Transaction Structure

A Solana transaction consists of three main components:

```typescript
interface Transaction {
  signatures: Array<Signature>;      // Digital signatures
  message: Message;                  // The actual transaction content
}

interface Message {
  header: MessageHeader;             // Metadata about signers
  accountKeys: Array<PublicKey>;     // All accounts involved
  recentBlockhash: Blockhash;        // Recent blockhash for expiry
  instructions: Array<Instruction>;  // Instructions to execute
}
```

### Key Components

#### 1. Signatures

- Each transaction requires one or more signatures
- The first signature is always the fee payer
- Signatures prove authorization to modify accounts
- Generated using Ed25519 cryptography

#### 2. Message Header

```typescript
interface MessageHeader {
  numRequiredSignatures: number;        // Total signatures required
  numReadonlySignedAccounts: number;    // Read-only signed accounts
  numReadonlyUnsignedAccounts: number;  // Read-only unsigned accounts
}
```

#### 3. Account Keys

- Ordered list of all accounts referenced in the transaction
- Accounts are referenced by index in instructions
- Order matters: fee payer must be first

#### 4. Recent Blockhash

- Prevents transaction replay attacks
- Acts as a timestamp (expires after ~60 seconds)
- Must be recent (within last 150 blocks)

#### 5. Instructions

- Atomic operations to execute
- All instructions succeed or all fail (atomic)
- Executed sequentially in order

## Instructions

### Instruction Structure

```typescript
interface Instruction {
  programId: PublicKey;              // Program to invoke
  keys: Array<AccountMeta>;          // Accounts required
  data: Buffer;                      // Instruction data
}

interface AccountMeta {
  pubkey: PublicKey;                 // Account public key
  isSigner: boolean;                 // Must sign transaction?
  isWritable: boolean;               // Will be modified?
}
```

### Example: Transfer SOL

**Source**: [solana-program-examples/basics/transfer-sol](https://github.com/solana-developers/program-examples/tree/main/basics/transfer-sol)

This example demonstrates how to transfer SOL both from a client and from within a program using CPI.

#### Using Web3.js Kit (Recommended)

```typescript
import {
  createSolanaRpc,
  generateKeyPairSigner,
  lamports,
  createTransactionMessage,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstructions,
  pipe,
  signTransactionMessageWithSigners
} from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";

const rpc = createSolanaRpc("http://localhost:8899");
const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

const sender = await generateKeyPairSigner();
const recipient = await generateKeyPairSigner();

// Create transfer instruction
const transferInstruction = getTransferSolInstruction({
  source: sender,
  destination: recipient.address,
  amount: lamports(1_000_000_000n / 100n) // 0.01 SOL
});

// Build transaction message
const transactionMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayerSigner(sender, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  (tx) => appendTransactionMessageInstructions([transferInstruction], tx)
);

// Sign transaction
const signedTransaction = await signTransactionMessageWithSigners(transactionMessage);
```

#### Using Legacy Web3.js

```typescript
import {
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  Keypair,
  Connection,
  sendAndConfirmTransaction
} from "@solana/web3.js";

async function transferSOL(
  connection: Connection,
  from: Keypair,
  to: PublicKey,
  amount: number
): Promise<string> {
  // Create transfer instruction
  const transferIx = SystemProgram.transfer({
    fromPubkey: from.publicKey,
    toPubkey: to,
    lamports: amount * LAMPORTS_PER_SOL,
  });
  
  // Create transaction
  const transaction = new Transaction().add(transferIx);
  
  // Send and confirm
  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [from]
  );
  
  return signature;
}
```

#### Anchor Program Implementation

Programs can also transfer SOL using CPI to the System Program:

```rust
use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("7Uf4xYPvGJuGGXYRAXdvJWVthwMgLLqXYJJhVoNpqsJy");

#[program]
pub mod transfer_sol {
    use super::*;

    // Transfer SOL using Anchor's transfer helper
    pub fn transfer_sol_with_cpi(
        ctx: Context<TransferSol>,
        amount: u64,
    ) -> Result<()> {
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.sender.to_account_info(),
                to: ctx.accounts.recipient.to_account_info(),
            },
        );

        transfer(cpi_context, amount)?;

        msg!("Transferred {} lamports", amount);
        Ok(())
    }

    // Transfer SOL by modifying account lamports directly
    pub fn transfer_sol_direct(
        ctx: Context<TransferSol>,
        amount: u64,
    ) -> Result<()> {
        let sender = &ctx.accounts.sender;
        let recipient = &ctx.accounts.recipient;

        // Deduct from sender
        **sender.to_account_info().try_borrow_mut_lamports()? -= amount;
        
        // Add to recipient
        **recipient.to_account_info().try_borrow_mut_lamports()? += amount;

        msg!("Transferred {} lamports directly", amount);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct TransferSol<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,

    #[account(mut)]
    /// CHECK: This account is not read or written
    pub recipient: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}
```

**Key Features**:
- Two methods: CPI to System Program (safer) vs direct lamport manipulation
- CPI method automatically validates accounts
- Direct method is more efficient but requires careful validation
- Both methods are atomic

#### Native Rust Implementation

```rust
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke,
    pubkey::Pubkey,
    system_instruction,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let sender = next_account_info(accounts_iter)?;
    let recipient = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    // Parse amount from instruction data
    let amount = u64::from_le_bytes(
        instruction_data[0..8].try_into().unwrap()
    );

    msg!("Transferring {} lamports from {} to {}", 
        amount, sender.key, recipient.key);

    // Create transfer instruction
    let transfer_ix = system_instruction::transfer(
        sender.key,
        recipient.key,
        amount,
    );

    // Invoke System Program
    invoke(
        &transfer_ix,
        &[sender.clone(), recipient.clone(), system_program.clone()],
    )?;

    msg!("Transfer successful");
    Ok(())
}
```

**Key Concepts Demonstrated**:
- CPI to System Program for SOL transfers
- Direct lamport manipulation (advanced)
- Instruction data parsing
- Account validation and signing

**Try It Yourself**:

```bash
# Clone the repository
git clone https://github.com/solana-developers/program-examples
cd program-examples/basics/transfer-sol/anchor

# Install dependencies
npm install

# Run tests
anchor test
```

**Experiment**:
- Transfer different amounts
- Implement batch transfers to multiple recipients
- Add transfer limits or access control
- Create a payment splitter program

## Creating Transactions

### Basic Transaction Creation

```typescript
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

async function createTransaction(
  connection: Connection,
  payer: PublicKey,
  instructions: TransactionInstruction[]
): Promise<Transaction> {
  // Create transaction
  const transaction = new Transaction();
  
  // Add instructions
  instructions.forEach(ix => transaction.add(ix));
  
  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = payer;
  
  return transaction;
}
```

### Multiple Instructions

```typescript
async function multipleInstructions(
  connection: Connection,
  payer: Keypair
): Promise<string> {
  const recipient1 = Keypair.generate().publicKey;
  const recipient2 = Keypair.generate().publicKey;
  
  // Create multiple transfer instructions
  const ix1 = SystemProgram.transfer({
    fromPubkey: payer.publicKey,
    toPubkey: recipient1,
    lamports: 0.1 * LAMPORTS_PER_SOL,
  });
  
  const ix2 = SystemProgram.transfer({
    fromPubkey: payer.publicKey,
    toPubkey: recipient2,
    lamports: 0.2 * LAMPORTS_PER_SOL,
  });
  
  // Add both to transaction
  const transaction = new Transaction().add(ix1, ix2);
  
  // Send
  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer]
  );
  
  return signature;
}
```

## Signing Transactions

### Single Signer

```typescript
async function signTransaction(
  transaction: Transaction,
  signer: Keypair
): Promise<Transaction> {
  transaction.sign(signer);
  return transaction;
}
```

### Multiple Signers

```typescript
async function signWithMultipleSigners(
  transaction: Transaction,
  signers: Keypair[]
): Promise<Transaction> {
  // All signers sign at once
  transaction.sign(...signers);
  return transaction;
}
```

### Partial Signing

```typescript
async function partialSign(
  transaction: Transaction,
  signer: Keypair
): Promise<Transaction> {
  // Sign without replacing existing signatures
  transaction.partialSign(signer);
  return transaction;
}
```

## Sending Transactions

### Send and Confirm

```typescript
import { sendAndConfirmTransaction } from '@solana/web3.js';

async function sendTransaction(
  connection: Connection,
  transaction: Transaction,
  signers: Keypair[]
): Promise<string> {
  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    signers,
    {
      commitment: 'confirmed',
      preflightCommitment: 'confirmed',
    }
  );
  
  return signature;
}
```

### Send Without Confirmation

```typescript
async function sendWithoutConfirm(
  connection: Connection,
  transaction: Transaction,
  signers: Keypair[]
): Promise<string> {
  // Sign transaction
  transaction.sign(...signers);
  
  // Serialize and send
  const rawTransaction = transaction.serialize();
  const signature = await connection.sendRawTransaction(rawTransaction, {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
  });
  
  return signature;
}
```

### Manual Confirmation

```typescript
async function manualConfirmation(
  connection: Connection,
  signature: string
): Promise<void> {
  const latestBlockhash = await connection.getLatestBlockhash();
  
  await connection.confirmTransaction({
    signature,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  });
}
```

## Transaction Fees

### Understanding Fees

Solana transactions have two types of costs:

1. **Transaction Fee** (base fee)
   - 5,000 lamports per signature (0.000005 SOL)
   - Paid to validators
   - Required for all transactions

2. **Priority Fees** (optional)
   - Additional fee to prioritize your transaction
   - Helps during network congestion
   - Specified in micro-lamports per compute unit

### Setting Priority Fees

```typescript
import {
  ComputeBudgetProgram,
  Transaction,
} from '@solana/web3.js';

async function addPriorityFee(
  transaction: Transaction,
  microLamports: number
): Promise<Transaction> {
  // Add compute budget instruction
  const priorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports,
  });
  
  // Add as first instruction
  transaction.add(priorityFeeIx);
  
  return transaction;
}
```

### Setting Compute Unit Limit

```typescript
async function setComputeLimit(
  transaction: Transaction,
  units: number
): Promise<Transaction> {
  const computeLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
    units,
  });
  
  transaction.add(computeLimitIx);
  
  return transaction;
}
```

## Compute Units

### What are Compute Units?

- Measure of computational resources used
- Each transaction has a limit (default: 200,000 CU per instruction)
- Complex operations consume more CUs
- Exceeding the limit causes transaction failure

### Optimizing Compute Usage

```typescript
async function optimizedTransaction(
  connection: Connection,
  payer: Keypair,
  instruction: TransactionInstruction
): Promise<string> {
  const transaction = new Transaction();
  
  // Set compute unit limit (only what you need)
  transaction.add(
    ComputeBudgetProgram.setComputeUnitLimit({
      units: 50_000, // Adjust based on your needs
    })
  );
  
  // Set priority fee
  transaction.add(
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: 1, // 1 micro-lamport per CU
    })
  );
  
  // Add your instruction
  transaction.add(instruction);
  
  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer]
  );
  
  return signature;
}
```

## Error Handling

### Common Transaction Errors

```typescript
async function handleTransactionErrors(
  connection: Connection,
  transaction: Transaction,
  signers: Keypair[]
): Promise<string> {
  try {
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      signers
    );
    return signature;
  } catch (error: any) {
    // Blockhash expired
    if (error.message.includes('Blockhash not found')) {
      console.log('Blockhash expired, retrying...');
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      return handleTransactionErrors(connection, transaction, signers);
    }
    
    // Insufficient funds
    if (error.message.includes('insufficient funds')) {
      throw new Error('Insufficient SOL for transaction');
    }
    
    // Custom program error
    if (error.logs) {
      console.log('Transaction logs:', error.logs);
    }
    
    throw error;
  }
}
```

### Simulation Before Sending

```typescript
async function simulateTransaction(
  connection: Connection,
  transaction: Transaction,
  signers: Keypair[]
): Promise<void> {
  // Sign transaction
  transaction.sign(...signers);
  
  // Simulate
  const simulation = await connection.simulateTransaction(transaction);
  
  if (simulation.value.err) {
    console.error('Simulation failed:', simulation.value.err);
    console.log('Logs:', simulation.value.logs);
    throw new Error('Transaction simulation failed');
  }
  
  console.log('Simulation successful');
  console.log('Compute units used:', simulation.value.unitsConsumed);
}
```

## Transaction Lifecycle

### 1. Creation
```
Create Transaction → Add Instructions → Set Blockhash → Set Fee Payer
```

### 2. Signing
```
Collect Signatures → Verify Signatures → Serialize
```

### 3. Submission
```
Send to RPC → Preflight Checks → Submit to Leader
```

### 4. Processing
```
Leader Processes → Validators Confirm → Finalized
```

### 5. Confirmation Levels

- **Processed**: Transaction processed by a validator
- **Confirmed**: Supermajority of cluster confirmed (recommended)
- **Finalized**: Confirmed by 31+ blocks (maximum security)

## Advanced Patterns

### Durable Nonces

For transactions that need to be valid for longer than 60 seconds:

```typescript
import {
  SystemProgram,
  NONCE_ACCOUNT_LENGTH,
  NonceAccount,
} from '@solana/web3.js';

async function createNonceAccount(
  connection: Connection,
  payer: Keypair
): Promise<PublicKey> {
  const nonceAccount = Keypair.generate();
  const rent = await connection.getMinimumBalanceForRentExemption(
    NONCE_ACCOUNT_LENGTH
  );
  
  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: nonceAccount.publicKey,
      lamports: rent,
      space: NONCE_ACCOUNT_LENGTH,
      programId: SystemProgram.programId,
    }),
    SystemProgram.nonceInitialize({
      noncePubkey: nonceAccount.publicKey,
      authorizedPubkey: payer.publicKey,
    })
  );
  
  await sendAndConfirmTransaction(connection, transaction, [payer, nonceAccount]);
  
  return nonceAccount.publicKey;
}
```

### Versioned Transactions

Solana's newer transaction format with address lookup tables:

```typescript
import {
  VersionedTransaction,
  TransactionMessage,
} from '@solana/web3.js';

async function createVersionedTransaction(
  connection: Connection,
  payer: PublicKey,
  instructions: TransactionInstruction[]
): Promise<VersionedTransaction> {
  const { blockhash } = await connection.getLatestBlockhash();
  
  const messageV0 = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();
  
  return new VersionedTransaction(messageV0);
}
```

## Best Practices

1. **Always use recent blockhashes** - Fetch just before sending
2. **Set appropriate compute limits** - Don't use default if you can optimize
3. **Simulate before sending** - Catch errors early
4. **Handle errors gracefully** - Implement retry logic for transient failures
5. **Use confirmed commitment** - Balance between speed and security
6. **Batch instructions** - Combine multiple operations when possible
7. **Monitor transaction status** - Don't assume success without confirmation

## Common Pitfalls

1. **Expired blockhash** - Blockhash older than 150 blocks
2. **Insufficient compute units** - Transaction exceeds compute budget
3. **Missing signatures** - Not all required signers provided
4. **Incorrect account ordering** - Accounts not in expected order
5. **Account not writable** - Trying to modify read-only account
6. **Insufficient funds** - Not enough SOL for fees

## Real-World Example

Complete example of a robust transaction:

```typescript
async function robustTransaction(
  connection: Connection,
  payer: Keypair,
  recipient: PublicKey,
  amount: number
): Promise<string> {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      // Create transaction
      const transaction = new Transaction();
      
      // Add compute budget instructions
      transaction.add(
        ComputeBudgetProgram.setComputeUnitLimit({ units: 10_000 }),
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1 })
      );
      
      // Add transfer instruction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: recipient,
          lamports: amount,
        })
      );
      
      // Get fresh blockhash
      const { blockhash, lastValidBlockHeight } = 
        await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = payer.publicKey;
      
      // Simulate first
      transaction.sign(payer);
      const simulation = await connection.simulateTransaction(transaction);
      if (simulation.value.err) {
        throw new Error(`Simulation failed: ${simulation.value.err}`);
      }
      
      // Send transaction
      const signature = await connection.sendRawTransaction(
        transaction.serialize(),
        { skipPreflight: false }
      );
      
      // Confirm transaction
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });
      
      console.log(`Transaction successful: ${signature}`);
      return signature;
      
    } catch (error: any) {
      attempt++;
      console.log(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt >= maxRetries) {
        throw new Error(`Transaction failed after ${maxRetries} attempts`);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  throw new Error('Transaction failed');
}
```

## Source Attribution

This content is based on educational materials and examples from:

- **Solana Documentation**: https://docs.solana.com/developing/programming-model/transactions
- **Solana Cookbook**: https://solanacookbook.com/core-concepts/transactions.html
- **Solana Web3.js Documentation**: https://solana-labs.github.io/solana-web3.js/
- **Solana Agent Kit**: [solana-agent-kit/solana-agent-kit](../../../solana-agent-kit/solana-agent-kit/)
  - Real-world examples of transaction construction and submission
  - Token transfers, swaps, and DeFi interactions

## Next Steps

Now that you understand transactions, continue to:

- [Tokens](../03-tokens/README.md) - Working with SPL tokens
- [PDAs](../04-pdas/README.md) - Program Derived Addresses
- [Exercises](../exercises/README.md) - Practice building transactions

## Additional Resources

- [Transaction Structure Deep Dive](https://docs.solana.com/developing/programming-model/transactions) - Detailed explanation of Solana transaction structure and lifecycle
- [Compute Budget Documentation](https://docs.solana.com/developing/programming-model/runtime#compute-budget) - Guide to compute units and transaction resource limits
- [Priority Fees Guide](https://docs.solana.com/developing/intro/transaction_fees#prioritization-fees) - How to use priority fees to get transactions processed faster
- [Solana Explorer](https://explorer.solana.com/) - Block explorer for inspecting transactions, accounts, and programs on-chain
