# Full-Stack dApp Implementation Guide

This guide walks you through building the Task Manager dApp step-by-step. Follow each phase sequentially to build a complete, working application.

## Phase 1: On-Chain Program Development

### Step 1.1: Initialize Anchor Project

```bash
# Create new Anchor project
anchor init task-manager
cd task-manager

# Verify installation
anchor --version  # Should be 0.29.0 or higher
```

**Expected Output**:
```
Created new Anchor project: task-manager
```

### Step 1.2: Define Account Structures

Open `programs/task-manager/src/lib.rs` and define the account structures:

```rust
use anchor_lang::prelude::*;

declare_id!("YourProgramIDWillGoHere");

#[program]
pub mod task_manager {
    use super::*;
    
    // Instructions will go here
}

// Account Structures
#[account]
pub struct UserAccount {
    pub authority: Pubkey,
    pub task_count: u32,
    pub bump: u8,
}

#[account]
pub struct TaskAccount {
    pub authority: Pubkey,
    pub task_id: u32,
    pub title: String,
    pub description: String,
    pub status: TaskStatus,
    pub created_at: i64,
    pub updated_at: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum TaskStatus {
    NotStarted,
    InProgress,
    Completed,
}

// Error codes
#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized: You don't own this account")]
    Unauthorized,
    #[msg("Title too long: Maximum 100 characters")]
    TitleTooLong,
    #[msg("Description too long: Maximum 500 characters")]
    DescriptionTooLong,
    #[msg("Task count overflow")]
    TaskCountOverflow,
}
```

**Key Points**:
- `#[account]` macro generates serialization code
- Enums must derive `AnchorSerialize` and `AnchorDeserialize`
- Error codes provide clear user feedback

### Step 1.3: Implement initialize_user Instruction

Add the instruction handler:

```rust
pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
    let user_account = &mut ctx.accounts.user_account;
    user_account.authority = ctx.accounts.user.key();
    user_account.task_count = 0;
    user_account.bump = ctx.bumps.user_account;
    
    msg!("User account initialized for {}", ctx.accounts.user.key());
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 4 + 1,
        seeds = [b"user", user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,
    
    pub system_program: Program<'info, System>,
}
```

**Security Features**:
- `Signer<'info>` ensures user signed the transaction
- `seeds` and `bump` validate PDA derivation
- `init` prevents re-initialization
- `space` calculation: 8 (discriminator) + 32 (Pubkey) + 4 (u32) + 1 (u8)

### Step 1.4: Implement create_task Instruction

```rust
pub fn create_task(
    ctx: Context<CreateTask>,
    title: String,
    description: String,
) -> Result<()> {
    // Validation
    require!(title.len() <= 100, ErrorCode::TitleTooLong);
    require!(description.len() <= 500, ErrorCode::DescriptionTooLong);
    
    let user_account = &mut ctx.accounts.user_account;
    let task_account = &mut ctx.accounts.task_account;
    
    // Increment task count with overflow check
    let new_task_count = user_account.task_count
        .checked_add(1)
        .ok_or(ErrorCode::TaskCountOverflow)?;
    
    let task_id = user_account.task_count;
    user_account.task_count = new_task_count;
    
    // Initialize task
    let clock = Clock::get()?;
    task_account.authority = ctx.accounts.user.key();
    task_account.task_id = task_id;
    task_account.title = title;
    task_account.description = description;
    task_account.status = TaskStatus::NotStarted;
    task_account.created_at = clock.unix_timestamp;
    task_account.updated_at = clock.unix_timestamp;
    task_account.bump = ctx.bumps.task_account;
    
    msg!("Task {} created: {}", task_id, task_account.title);
    Ok(())
}

#[derive(Accounts)]
#[instruction(title: String, description: String)]
pub struct CreateTask<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"user", user.key().as_ref()],
        bump = user_account.bump,
        has_one = authority @ ErrorCode::Unauthorized
    )]
    pub user_account: Account<'info, UserAccount>,
    
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 4 + (4 + 100) + (4 + 500) + 1 + 8 + 8 + 1,
        seeds = [b"task", user.key().as_ref(), user_account.task_count.to_le_bytes().as_ref()],
        bump
    )]
    pub task_account: Account<'info, TaskAccount>,
    
    pub system_program: Program<'info, System>,
}
```

**Security Features**:
- Input validation for string lengths
- `has_one = authority` ensures user owns user_account
- Overflow protection with `checked_add`
- PDA seeds include task_count for uniqueness

### Step 1.5: Implement update_task Instruction

```rust
pub fn update_task(
    ctx: Context<UpdateTask>,
    title: Option<String>,
    description: Option<String>,
    status: Option<TaskStatus>,
) -> Result<()> {
    let task_account = &mut ctx.accounts.task_account;
    
    // Update fields if provided
    if let Some(new_title) = title {
        require!(new_title.len() <= 100, ErrorCode::TitleTooLong);
        task_account.title = new_title;
    }
    
    if let Some(new_description) = description {
        require!(new_description.len() <= 500, ErrorCode::DescriptionTooLong);
        task_account.description = new_description;
    }
    
    if let Some(new_status) = status {
        task_account.status = new_status;
    }
    
    // Update timestamp
    let clock = Clock::get()?;
    task_account.updated_at = clock.unix_timestamp;
    
    msg!("Task {} updated", task_account.task_id);
    Ok(())
}

#[derive(Accounts)]
pub struct UpdateTask<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        has_one = authority @ ErrorCode::Unauthorized
    )]
    pub task_account: Account<'info, TaskAccount>,
}
```

### Step 1.6: Implement complete_task and delete_task Instructions

```rust
pub fn complete_task(ctx: Context<CompleteTask>) -> Result<()> {
    let task_account = &mut ctx.accounts.task_account;
    task_account.status = TaskStatus::Completed;
    
    let clock = Clock::get()?;
    task_account.updated_at = clock.unix_timestamp;
    
    msg!("Task {} completed", task_account.task_id);
    Ok(())
}

#[derive(Accounts)]
pub struct CompleteTask<'info> {
    pub user: Signer<'info>,
    
    #[account(
        mut,
        has_one = authority @ ErrorCode::Unauthorized
    )]
    pub task_account: Account<'info, TaskAccount>,
}

pub fn delete_task(ctx: Context<DeleteTask>) -> Result<()> {
    msg!("Task {} deleted", ctx.accounts.task_account.task_id);
    Ok(())
}

#[derive(Accounts)]
pub struct DeleteTask<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        has_one = authority @ ErrorCode::Unauthorized,
        close = user
    )]
    pub task_account: Account<'info, TaskAccount>,
}
```

**Key Points**:
- `close = user` returns rent to user when deleting
- Authorization checks prevent unauthorized deletions

### Step 1.7: Build and Deploy

```bash
# Build the program
anchor build

# Get the program ID
solana address -k target/deploy/task_manager-keypair.json

# Update declare_id! in lib.rs with the program ID

# Rebuild
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

**Verification**:
```bash
# Check program deployment
solana program show <PROGRAM_ID> --url devnet
```

### Step 1.8: Write Program Tests

Create tests in `tests/task-manager.ts`:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TaskManager } from "../target/types/task_manager";
import { expect } from "chai";

describe("task-manager", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TaskManager as Program<TaskManager>;
  const user = provider.wallet;

  let userAccountPDA: anchor.web3.PublicKey;
  let taskAccountPDA: anchor.web3.PublicKey;

  before(async () => {
    // Derive PDAs
    [userAccountPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user"), user.publicKey.toBuffer()],
      program.programId
    );
  });

  it("Initializes user account", async () => {
    await program.methods
      .initializeUser()
      .accounts({
        user: user.publicKey,
        userAccount: userAccountPDA,
      })
      .rpc();

    const userAccount = await program.account.userAccount.fetch(userAccountPDA);
    expect(userAccount.authority.toString()).to.equal(user.publicKey.toString());
    expect(userAccount.taskCount).to.equal(0);
  });

  it("Creates a task", async () => {
    [taskAccountPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("task"),
        user.publicKey.toBuffer(),
        Buffer.from(new Uint8Array(new Uint32Array([0]).buffer)),
      ],
      program.programId
    );

    await program.methods
      .createTask("My First Task", "This is a test task")
      .accounts({
        user: user.publicKey,
        userAccount: userAccountPDA,
        taskAccount: taskAccountPDA,
      })
      .rpc();

    const taskAccount = await program.account.taskAccount.fetch(taskAccountPDA);
    expect(taskAccount.title).to.equal("My First Task");
    expect(taskAccount.status).to.deep.equal({ notStarted: {} });
  });

  it("Updates a task", async () => {
    await program.methods
      .updateTask("Updated Title", null, { inProgress: {} })
      .accounts({
        user: user.publicKey,
        taskAccount: taskAccountPDA,
      })
      .rpc();

    const taskAccount = await program.account.taskAccount.fetch(taskAccountPDA);
    expect(taskAccount.title).to.equal("Updated Title");
    expect(taskAccount.status).to.deep.equal({ inProgress: {} });
  });

  it("Completes a task", async () => {
    await program.methods
      .completeTask()
      .accounts({
        user: user.publicKey,
        taskAccount: taskAccountPDA,
      })
      .rpc();

    const taskAccount = await program.account.taskAccount.fetch(taskAccountPDA);
    expect(taskAccount.status).to.deep.equal({ completed: {} });
  });
});
```

**Run Tests**:
```bash
anchor test
```

## Phase 2: Client SDK Development

### Step 2.1: Set Up TypeScript Project

```bash
# Create client directory
mkdir -p client/src
cd client

# Initialize npm project
npm init -y

# Install dependencies
npm install @solana/web3.js @coral-xyz/anchor
npm install -D typescript @types/node

# Create tsconfig.json
npx tsc --init
```

### Step 2.2: Create TaskManagerClient Class

Create `client/src/task-manager-client.ts`:

```typescript
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
} from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { TaskManager } from "../../target/types/task_manager";

export interface UserAccount {
  authority: PublicKey;
  taskCount: number;
  bump: number;
}

export interface TaskAccount {
  authority: PublicKey;
  taskId: number;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  bump: number;
}

export enum TaskStatus {
  NotStarted = "NotStarted",
  InProgress = "InProgress",
  Completed = "Completed",
}

export class TaskManagerClient {
  constructor(
    private connection: Connection,
    private program: Program<TaskManager>
  ) {}

  // PDA derivation
  deriveUserAccountPDA(user: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("user"), user.toBuffer()],
      this.program.programId
    );
  }

  deriveTaskAccountPDA(user: PublicKey, taskId: number): [PublicKey, number] {
    const taskIdBuffer = Buffer.alloc(4);
    taskIdBuffer.writeUInt32LE(taskId);
    
    return PublicKey.findProgramAddressSync(
      [Buffer.from("task"), user.toBuffer(), taskIdBuffer],
      this.program.programId
    );
  }

  // Account fetching
  async getUserAccount(user: PublicKey): Promise<UserAccount | null> {
    const [userAccountPDA] = this.deriveUserAccountPDA(user);
    
    try {
      const account = await this.program.account.userAccount.fetch(userAccountPDA);
      return {
        authority: account.authority,
        taskCount: account.taskCount,
        bump: account.bump,
      };
    } catch {
      return null;
    }
  }

  async getTaskAccount(user: PublicKey, taskId: number): Promise<TaskAccount | null> {
    const [taskAccountPDA] = this.deriveTaskAccountPDA(user, taskId);
    
    try {
      const account = await this.program.account.taskAccount.fetch(taskAccountPDA);
      return this.parseTaskAccount(account);
    } catch {
      return null;
    }
  }

  async getAllUserTasks(user: PublicKey): Promise<TaskAccount[]> {
    const userAccount = await this.getUserAccount(user);
    if (!userAccount) return [];

    const tasks: TaskAccount[] = [];
    for (let i = 0; i < userAccount.taskCount; i++) {
      const task = await this.getTaskAccount(user, i);
      if (task) tasks.push(task);
    }

    return tasks;
  }

  // Instruction builders
  async initializeUser(user: PublicKey): Promise<Transaction> {
    const [userAccountPDA] = this.deriveUserAccountPDA(user);

    return await this.program.methods
      .initializeUser()
      .accounts({
        user,
        userAccount: userAccountPDA,
        systemProgram: SystemProgram.programId,
      })
      .transaction();
  }

  async createTask(
    user: PublicKey,
    title: string,
    description: string
  ): Promise<Transaction> {
    const [userAccountPDA] = this.deriveUserAccountPDA(user);
    const userAccount = await this.getUserAccount(user);
    
    if (!userAccount) {
      throw new Error("User account not initialized");
    }

    const [taskAccountPDA] = this.deriveTaskAccountPDA(user, userAccount.taskCount);

    return await this.program.methods
      .createTask(title, description)
      .accounts({
        user,
        userAccount: userAccountPDA,
        taskAccount: taskAccountPDA,
        systemProgram: SystemProgram.programId,
      })
      .transaction();
  }

  async updateTask(
    user: PublicKey,
    taskId: number,
    updates: {
      title?: string;
      description?: string;
      status?: TaskStatus;
    }
  ): Promise<Transaction> {
    const [taskAccountPDA] = this.deriveTaskAccountPDA(user, taskId);

    return await this.program.methods
      .updateTask(
        updates.title || null,
        updates.description || null,
        updates.status ? this.encodeStatus(updates.status) : null
      )
      .accounts({
        user,
        taskAccount: taskAccountPDA,
      })
      .transaction();
  }

  async completeTask(user: PublicKey, taskId: number): Promise<Transaction> {
    const [taskAccountPDA] = this.deriveTaskAccountPDA(user, taskId);

    return await this.program.methods
      .completeTask()
      .accounts({
        user,
        taskAccount: taskAccountPDA,
      })
      .transaction();
  }

  async deleteTask(user: PublicKey, taskId: number): Promise<Transaction> {
    const [taskAccountPDA] = this.deriveTaskAccountPDA(user, taskId);

    return await this.program.methods
      .deleteTask()
      .accounts({
        user,
        taskAccount: taskAccountPDA,
      })
      .transaction();
  }

  // Helper methods
  private parseTaskAccount(account: any): TaskAccount {
    return {
      authority: account.authority,
      taskId: account.taskId,
      title: account.title,
      description: account.description,
      status: this.parseStatus(account.status),
      createdAt: new Date(account.createdAt.toNumber() * 1000),
      updatedAt: new Date(account.updatedAt.toNumber() * 1000),
      bump: account.bump,
    };
  }

  private parseStatus(status: any): TaskStatus {
    if (status.notStarted) return TaskStatus.NotStarted;
    if (status.inProgress) return TaskStatus.InProgress;
    if (status.completed) return TaskStatus.Completed;
    throw new Error("Unknown status");
  }

  private encodeStatus(status: TaskStatus): any {
    switch (status) {
      case TaskStatus.NotStarted:
        return { notStarted: {} };
      case TaskStatus.InProgress:
        return { inProgress: {} };
      case TaskStatus.Completed:
        return { completed: {} };
    }
  }
}
```

### Step 2.3: Create Example Usage

Create `client/src/example.ts`:

```typescript
import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { TaskManager } from "../../target/types/task_manager";
import { TaskManagerClient } from "./task-manager-client";
import idl from "../../target/idl/task_manager.json";

async function main() {
  // Setup connection
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const wallet = new Wallet(Keypair.generate()); // Use your wallet
  const provider = new AnchorProvider(connection, wallet, {});
  
  // Load program
  const programId = new PublicKey("YourProgramIDHere");
  const program = new Program(idl as any, programId, provider);
  
  // Create client
  const client = new TaskManagerClient(connection, program);
  
  // Initialize user
  const initTx = await client.initializeUser(wallet.publicKey);
  const initSig = await wallet.sendTransaction(initTx, connection);
  await connection.confirmTransaction(initSig);
  console.log("User initialized:", initSig);
  
  // Create task
  const createTx = await client.createTask(
    wallet.publicKey,
    "Learn Solana",
    "Complete the full-stack dApp tutorial"
  );
  const createSig = await wallet.sendTransaction(createTx, connection);
  await connection.confirmTransaction(createSig);
  console.log("Task created:", createSig);
  
  // Get all tasks
  const tasks = await client.getAllUserTasks(wallet.publicKey);
  console.log("All tasks:", tasks);
}

main().catch(console.error);
```

## Phase 3: Web Interface

### Step 3.1: Set Up Next.js Project

```bash
# Create Next.js app
npx create-next-app@latest task-manager-ui --typescript --tailwind --app
cd task-manager-ui

# Install Solana dependencies
npm install @solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @coral-xyz/anchor
```

### Step 3.2: Configure Wallet Adapter

Create `app/providers.tsx`:

```typescript
"use client";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";

require("@solana/wallet-adapter-react-ui/styles.css");

export function Providers({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

### Step 3.3: Create Task Components

Create `app/components/TaskList.tsx`:

```typescript
"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { TaskManagerClient, TaskAccount } from "../../client/src/task-manager-client";

export function TaskList() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [tasks, setTasks] = useState<TaskAccount[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey) {
      loadTasks();
    }
  }, [publicKey]);

  async function loadTasks() {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      // Initialize client and fetch tasks
      // Implementation here
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Tasks</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <TaskCard key={task.taskId} task={task} onUpdate={loadTasks} />
          ))}
        </div>
      )}
    </div>
  );
}
```

## Next Steps

Continue with:
- [testing-guide.md](testing-guide.md) for comprehensive testing strategies
- [deployment.md](deployment.md) for production deployment
- [extensions.md](extensions.md) for feature enhancements

## Troubleshooting

See [../../setup/troubleshooting.md](../../setup/troubleshooting.md) for common issues and solutions.
