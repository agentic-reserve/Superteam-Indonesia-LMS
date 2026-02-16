# Full-Stack dApp Architecture

## System Overview

The Task Manager dApp is designed as a three-tier architecture with clear separation of concerns:

1. **On-Chain Layer**: Solana program handling business logic and state management
2. **Client Layer**: TypeScript SDK for program interaction
3. **Presentation Layer**: Web and mobile interfaces for user interaction

## Design Principles

### 1. Security First
- All instructions validate signer authority
- Account ownership checks prevent unauthorized access
- Safe math operations prevent overflow/underflow
- Input validation on all user-provided data

### 2. Efficiency
- Use PDAs to minimize account creation costs
- Batch operations where possible
- Optimize account sizes to reduce rent
- Minimize compute units per instruction

### 3. User Experience
- Clear error messages and transaction states
- Optimistic UI updates with rollback on failure
- Mobile-first responsive design
- Wallet integration with multiple providers

### 4. Maintainability
- Modular code structure
- Comprehensive documentation
- Type safety throughout the stack
- Automated testing at all layers

## On-Chain Program Architecture

### Account Design

#### UserAccount (PDA)

**Purpose**: Track user-level metadata and task count

**PDA Seeds**: `["user", user_wallet_pubkey]`

**Structure**:
```rust
#[account]
pub struct UserAccount {
    pub authority: Pubkey,    // 32 bytes
    pub task_count: u32,      // 4 bytes
    pub bump: u8,             // 1 byte
}
// Total: 37 bytes + 8 byte discriminator = 45 bytes
```

**Design Rationale**:
- Single PDA per user simplifies account discovery
- Task count enables unique task ID generation
- Minimal size reduces rent costs

#### TaskAccount (PDA)

**Purpose**: Store individual task data

**PDA Seeds**: `["task", user_wallet_pubkey, task_id.to_le_bytes()]`

**Structure**:
```rust
#[account]
pub struct TaskAccount {
    pub authority: Pubkey,        // 32 bytes
    pub task_id: u32,             // 4 bytes
    pub title: String,            // 4 + 100 bytes (max)
    pub description: String,      // 4 + 500 bytes (max)
    pub status: TaskStatus,       // 1 byte
    pub created_at: i64,          // 8 bytes
    pub updated_at: i64,          // 8 bytes
    pub bump: u8,                 // 1 byte
}
// Total: ~662 bytes + 8 byte discriminator = 670 bytes
```

**Design Rationale**:
- PDA derivation includes task_id for uniqueness
- String length limits prevent excessive rent costs
- Timestamps enable sorting and filtering
- Status enum provides type-safe state management

### Instruction Set

#### 1. initialize_user

**Purpose**: Create UserAccount for first-time users

**Accounts**:
- `user` (signer, mut): User's wallet
- `user_account` (mut): UserAccount PDA to initialize
- `system_program`: For account creation

**Logic**:
1. Derive UserAccount PDA
2. Validate PDA derivation
3. Initialize account with default values
4. Set authority to user's wallet

**Security Checks**:
- User must be signer
- UserAccount must not already exist
- PDA derivation must be correct

#### 2. create_task

**Purpose**: Create a new task

**Accounts**:
- `user` (signer, mut): Task owner
- `user_account` (mut): UserAccount PDA
- `task_account` (mut): TaskAccount PDA to initialize
- `system_program`: For account creation

**Parameters**:
- `title`: String (max 100 chars)
- `description`: String (max 500 chars)

**Logic**:
1. Validate user owns user_account
2. Increment task_count
3. Derive TaskAccount PDA with new task_id
4. Initialize TaskAccount with provided data
5. Set status to NotStarted
6. Record creation timestamp

**Security Checks**:
- User must be signer
- User must own user_account
- Title and description length validation
- PDA derivation must be correct
- Task count overflow check

#### 3. update_task

**Purpose**: Update task title, description, or status

**Accounts**:
- `user` (signer): Task owner
- `task_account` (mut): TaskAccount to update

**Parameters**:
- `title`: Option<String>
- `description`: Option<String>
- `status`: Option<TaskStatus>

**Logic**:
1. Validate user owns task
2. Update provided fields
3. Update timestamp

**Security Checks**:
- User must be signer
- User must own task_account
- Field length validation

#### 4. complete_task

**Purpose**: Mark task as completed

**Accounts**:
- `user` (signer): Task owner
- `task_account` (mut): TaskAccount to complete

**Logic**:
1. Validate user owns task
2. Set status to Completed
3. Update timestamp

**Security Checks**:
- User must be signer
- User must own task_account

#### 5. delete_task

**Purpose**: Delete a task and reclaim rent

**Accounts**:
- `user` (signer, mut): Task owner (receives rent)
- `task_account` (mut): TaskAccount to close

**Logic**:
1. Validate user owns task
2. Close account
3. Transfer rent to user

**Security Checks**:
- User must be signer
- User must own task_account

### State Machine

```
┌─────────────┐
│ NotStarted  │
└──────┬──────┘
       │ update_task(status: InProgress)
       ▼
┌─────────────┐
│ InProgress  │
└──────┬──────┘
       │ complete_task() or update_task(status: Completed)
       ▼
┌─────────────┐
│  Completed  │
└─────────────┘

Note: Tasks can be deleted from any state
```

## Client SDK Architecture

### Core Components

#### TaskManagerClient

**Purpose**: Main interface for program interaction

**Responsibilities**:
- Connection management
- Transaction building
- Account fetching
- Error handling

**Key Methods**:
```typescript
class TaskManagerClient {
  constructor(connection: Connection, programId: PublicKey)
  
  // Account operations
  async getUserAccount(user: PublicKey): Promise<UserAccount | null>
  async getTaskAccount(user: PublicKey, taskId: number): Promise<TaskAccount | null>
  async getAllUserTasks(user: PublicKey): Promise<TaskAccount[]>
  
  // Instruction builders
  async initializeUser(user: PublicKey): Promise<Transaction>
  async createTask(user: PublicKey, title: string, description: string): Promise<Transaction>
  async updateTask(user: PublicKey, taskId: number, updates: TaskUpdates): Promise<Transaction>
  async completeTask(user: PublicKey, taskId: number): Promise<Transaction>
  async deleteTask(user: PublicKey, taskId: number): Promise<Transaction>
  
  // Helper methods
  deriveUserAccountPDA(user: PublicKey): [PublicKey, number]
  deriveTaskAccountPDA(user: PublicKey, taskId: number): [PublicKey, number]
}
```

#### Account Deserializers

**Purpose**: Parse on-chain account data into TypeScript types

**Implementation**:
```typescript
interface UserAccount {
  authority: PublicKey;
  taskCount: number;
  bump: number;
}

interface TaskAccount {
  authority: PublicKey;
  taskId: number;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  bump: number;
}

enum TaskStatus {
  NotStarted = 0,
  InProgress = 1,
  Completed = 2,
}
```

### Transaction Flow

```
User Action → Client Method → Build Transaction → Sign → Send → Confirm → Update UI
                                      ↓
                              Instruction Data
                              Account Metas
                              Recent Blockhash
```

## Presentation Layer Architecture

### Web Application

**Framework**: React with Next.js

**Key Components**:

1. **WalletProvider**: Manages wallet connection state
2. **TaskList**: Displays all user tasks with filtering
3. **TaskForm**: Create/edit task interface
4. **TaskCard**: Individual task display and actions
5. **StatusBadge**: Visual task status indicator

**State Management**:
- React Context for wallet state
- Local state for UI interactions
- SWR or React Query for data fetching and caching

**User Flow**:
```
1. Connect Wallet
   ↓
2. Initialize User Account (if first time)
   ↓
3. View Task List
   ↓
4. Create/Update/Complete/Delete Tasks
   ↓
5. Transaction Confirmation
   ↓
6. UI Update
```

### Mobile Application

**Framework**: React Native with Expo

**Key Differences from Web**:
- Mobile Wallet Adapter for transaction signing
- Native UI components for better performance
- Offline state handling
- Push notifications for transaction confirmations

## Security Architecture

### Authorization Model

**Principle**: Every instruction validates the signer's authority

**Implementation**:
```rust
// In every instruction handler
require!(
    ctx.accounts.user.key() == ctx.accounts.user_account.authority,
    ErrorCode::Unauthorized
);
```

### Input Validation

**String Length Checks**:
```rust
require!(title.len() <= 100, ErrorCode::TitleTooLong);
require!(description.len() <= 500, ErrorCode::DescriptionTooLong);
```

**Overflow Protection**:
```rust
let new_task_count = user_account.task_count
    .checked_add(1)
    .ok_or(ErrorCode::TaskCountOverflow)?;
```

### Account Validation

**PDA Verification**:
```rust
let (expected_pda, bump) = Pubkey::find_program_address(
    &[b"user", user.key().as_ref()],
    ctx.program_id
);
require!(expected_pda == user_account.key(), ErrorCode::InvalidPDA);
```

## Performance Considerations

### Compute Unit Optimization

**Estimated CU per Instruction**:
- `initialize_user`: ~5,000 CU
- `create_task`: ~10,000 CU
- `update_task`: ~5,000 CU
- `complete_task`: ~3,000 CU
- `delete_task`: ~3,000 CU

**Optimization Strategies**:
- Minimize account data size
- Use efficient data structures
- Avoid unnecessary computations
- Batch operations when possible

### Rent Optimization

**Account Sizes**:
- UserAccount: 45 bytes (~0.0003 SOL rent)
- TaskAccount: 670 bytes (~0.005 SOL rent)

**Rent Reclamation**:
- Closing accounts returns rent to user
- Encourage users to delete completed tasks

## Error Handling

### Program Errors

```rust
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
    
    #[msg("Invalid PDA derivation")]
    InvalidPDA,
}
```

### Client Error Handling

```typescript
try {
  const tx = await client.createTask(user, title, description);
  const signature = await wallet.sendTransaction(tx, connection);
  await connection.confirmTransaction(signature);
} catch (error) {
  if (error.message.includes("Unauthorized")) {
    // Handle authorization error
  } else if (error.message.includes("TitleTooLong")) {
    // Handle validation error
  } else {
    // Handle generic error
  }
}
```

## Testing Strategy

### Unit Tests
- Individual instruction handlers
- Account validation logic
- PDA derivation
- Error conditions

### Integration Tests
- Complete user workflows
- Multi-instruction sequences
- Account state transitions

### End-to-End Tests
- Full stack testing with UI
- Wallet integration
- Transaction confirmation

## Deployment Architecture

### Development
- Local validator for rapid iteration
- Devnet for integration testing
- Test wallets with airdropped SOL

### Production
- Mainnet deployment
- Program upgrade authority management
- Monitoring and alerting

## Scalability Considerations

### Current Limitations
- Single user account per wallet
- Linear task lookup (no indexing)
- No pagination for large task lists

### Future Enhancements
- Off-chain indexing with Geyser plugin
- Compressed accounts for lower costs
- Batch operations for multiple tasks

## References

- [Solana Account Model](../../basics/01-accounts-and-programs/README.md)
- [Program Derived Addresses](../../basics/04-pdas/README.md)
- [Security Best Practices](../../security/01-common-vulnerabilities/README.md)
- [Wallet Adapter Integration](../../mobile/01-wallet-adapter/README.md)
