# Session Keys

## Overview

Session Keys enable seamless, wallet-less user experiences in Solana dApps by creating temporary signing keys with scoped permissions. Instead of requiring wallet approval for every action, users grant time-limited permissions to session keys, enabling smooth interactions without compromising security.

**Estimated Time:** 2-3 hours

## Learning Objectives

After completing this lesson, you will be able to:

- Explain how Session Keys work
- Understand the security model and permission scoping
- Integrate Session Keys into Solana programs
- Implement client-side Session Key management
- Use React hooks for Session Key operations
- Apply best practices for Session Key security

## Prerequisites

- Completed [Basics](../../basics/README.md) module
- Understanding of [Anchor Framework](../../basics/05-anchor-framework/README.md)
- Familiarity with React (for client integration)
- Knowledge of [PDAs](../../basics/04-pdas/README.md)

## The Problem

Traditional wallet interactions create friction:

```
User Action → Wallet Popup → User Approval → Transaction → Repeat
```

**Issues**:
- Constant wallet popups disrupt UX
- Users must approve every transaction
- Impossible for real-time applications
- Poor experience for gaming and social apps

**Example**: Gaming scenario
- Player makes 100 moves in a game
- Each move requires wallet approval
- 100 wallet popups = unplayable

## The Solution

Session Keys provide temporary, scoped permissions:

```
User → Grant Session (once) → Session Key Signs → Seamless Experience
```

**Benefits**:
- One-time permission grant
- No wallet popups during session
- Time-limited security
- Scoped permissions
- Revocable at any time

**Same gaming scenario**:
- Player grants session permission (once)
- 100 moves execute seamlessly
- No wallet popups
- Playable and smooth

## How Session Keys Work

### Architecture

```
┌─────────────┐
│   Wallet    │ (Main authority)
└──────┬──────┘
       │ Creates & Signs
       ↓
┌─────────────┐
│ Session Key │ (Temporary signer)
└──────┬──────┘
       │ Signs transactions
       ↓
┌─────────────┐
│   Program   │ (Validates session)
└─────────────┘
```

### Key Components

1. **Main Wallet**: User's primary wallet (permanent)
2. **Session Token**: Onchain account storing session data
3. **Session Key**: Temporary keypair (ephemeral)
4. **Validity Period**: Time-limited permissions
5. **Scope**: Specific programs/instructions allowed

### Session Token Structure

```rust
#[account]
pub struct SessionToken {
    /// The main wallet that created this session
    pub authority: Pubkey,
    
    /// The temporary session key
    pub session_key: Pubkey,
    
    /// When the session expires (Unix timestamp)
    pub valid_until: i64,
    
    /// Programs this session can interact with
    pub target_program: Pubkey,
    
    /// Whether the session is still active
    pub is_active: bool,
}
```

## Program-Side Integration

### Creating Session Tokens

```rust
use anchor_lang::prelude::*;

declare_id!("YourProgramID");

#[program]
pub mod session_example {
    use super::*;

    /// Create a new session token
    pub fn create_session(
        ctx: Context<CreateSession>,
        session_key: Pubkey,
        valid_until: i64,
    ) -> Result<()> {
        let session_token = &mut ctx.accounts.session_token;
        
        // Validate expiry time
        let clock = Clock::get()?;
        require!(
            valid_until > clock.unix_timestamp,
            ErrorCode::InvalidExpiryTime
        );
        
        // Maximum session duration: 7 days
        let max_duration = 7 * 24 * 60 * 60; // 7 days in seconds
        require!(
            valid_until - clock.unix_timestamp <= max_duration,
            ErrorCode::SessionTooLong
        );
        
        // Initialize session token
        session_token.authority = ctx.accounts.authority.key();
        session_token.session_key = session_key;
        session_token.valid_until = valid_until;
        session_token.target_program = ctx.program_id;
        session_token.is_active = true;
        
        msg!("Session created until: {}", valid_until);
        Ok(())
    }

    /// Revoke a session token
    pub fn revoke_session(ctx: Context<RevokeSession>) -> Result<()> {
        let session_token = &mut ctx.accounts.session_token;
        session_token.is_active = false;
        
        msg!("Session revoked");
        Ok(())
    }

    /// Execute action with session key
    pub fn execute_with_session(
        ctx: Context<ExecuteWithSession>,
        data: String,
    ) -> Result<()> {
        let session_token = &ctx.accounts.session_token;
        let clock = Clock::get()?;
        
        // Validate session
        require!(
            session_token.is_active,
            ErrorCode::SessionInactive
        );
        
        require!(
            clock.unix_timestamp <= session_token.valid_until,
            ErrorCode::SessionExpired
        );
        
        require!(
            session_token.session_key == ctx.accounts.session_signer.key(),
            ErrorCode::InvalidSessionKey
        );
        
        // Execute the action
        msg!("Action executed by session: {}", data);
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateSession<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + SessionToken::INIT_SPACE,
        seeds = [
            b"session",
            authority.key().as_ref(),
            &Clock::get()?.unix_timestamp.to_le_bytes()
        ],
        bump
    )]
    pub session_token: Account<'info, SessionToken>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeSession<'info> {
    #[account(
        mut,
        has_one = authority,
        seeds = [
            b"session",
            authority.key().as_ref(),
            &session_token.valid_until.to_le_bytes()
        ],
        bump
    )]
    pub session_token: Account<'info, SessionToken>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ExecuteWithSession<'info> {
    #[account(
        seeds = [
            b"session",
            session_token.authority.as_ref(),
            &session_token.valid_until.to_le_bytes()
        ],
        bump
    )]
    pub session_token: Account<'info, SessionToken>,
    
    /// The session key signing this transaction
    pub session_signer: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct SessionToken {
    pub authority: Pubkey,
    pub session_key: Pubkey,
    pub valid_until: i64,
    pub target_program: Pubkey,
    pub is_active: bool,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid expiry time")]
    InvalidExpiryTime,
    
    #[msg("Session duration too long")]
    SessionTooLong,
    
    #[msg("Session is inactive")]
    SessionInactive,
    
    #[msg("Session has expired")]
    SessionExpired,
    
    #[msg("Invalid session key")]
    InvalidSessionKey,
}
```

## Client-Side Integration

### Basic Session Management

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SessionExample } from "../target/types/session_example";

class SessionManager {
  private program: Program<SessionExample>;
  private sessionKeypair: anchor.web3.Keypair | null = null;
  private sessionTokenPDA: anchor.web3.PublicKey | null = null;

  constructor(program: Program<SessionExample>) {
    this.program = program;
  }

  /**
   * Create a new session
   */
  async createSession(
    authority: anchor.web3.Keypair,
    durationSeconds: number = 3600 // 1 hour default
  ): Promise<{
    sessionKey: anchor.web3.Keypair;
    sessionToken: anchor.web3.PublicKey;
  }> {
    // Generate new session keypair
    this.sessionKeypair = anchor.web3.Keypair.generate();
    
    // Calculate expiry time
    const validUntil = Math.floor(Date.now() / 1000) + durationSeconds;
    
    // Derive session token PDA
    const [sessionTokenPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("session"),
        authority.publicKey.toBuffer(),
        Buffer.from(validUntil.toString()),
      ],
      this.program.programId
    );
    
    this.sessionTokenPDA = sessionTokenPDA;
    
    // Create session on-chain
    await this.program.methods
      .createSession(
        this.sessionKeypair.publicKey,
        new anchor.BN(validUntil)
      )
      .accounts({
        sessionToken: sessionTokenPDA,
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();
    
    console.log("Session created:", {
      sessionKey: this.sessionKeypair.publicKey.toBase58(),
      sessionToken: sessionTokenPDA.toBase58(),
      validUntil: new Date(validUntil * 1000).toISOString(),
    });
    
    // Store session key securely (in-memory for this example)
    this.storeSessionKey(this.sessionKeypair);
    
    return {
      sessionKey: this.sessionKeypair,
      sessionToken: sessionTokenPDA,
    };
  }

  /**
   * Execute action using session key
   */
  async executeWithSession(data: string): Promise<string> {
    if (!this.sessionKeypair || !this.sessionTokenPDA) {
      throw new Error("No active session");
    }
    
    const signature = await this.program.methods
      .executeWithSession(data)
      .accounts({
        sessionToken: this.sessionTokenPDA,
        sessionSigner: this.sessionKeypair.publicKey,
      })
      .signers([this.sessionKeypair])
      .rpc();
    
    return signature;
  }

  /**
   * Revoke the session
   */
  async revokeSession(authority: anchor.web3.Keypair): Promise<void> {
    if (!this.sessionTokenPDA) {
      throw new Error("No active session");
    }
    
    await this.program.methods
      .revokeSession()
      .accounts({
        sessionToken: this.sessionTokenPDA,
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();
    
    // Clear session data
    this.sessionKeypair = null;
    this.sessionTokenPDA = null;
    this.clearSessionKey();
    
    console.log("Session revoked");
  }

  /**
   * Check if session is valid
   */
  async isSessionValid(): Promise<boolean> {
    if (!this.sessionTokenPDA) {
      return false;
    }
    
    try {
      const sessionToken = await this.program.account.sessionToken.fetch(
        this.sessionTokenPDA
      );
      
      const now = Math.floor(Date.now() / 1000);
      return (
        sessionToken.isActive &&
        sessionToken.validUntil.toNumber() > now
      );
    } catch {
      return false;
    }
  }

  /**
   * Store session key securely
   */
  private storeSessionKey(keypair: anchor.web3.Keypair): void {
    // In production, use secure storage (e.g., encrypted localStorage)
    sessionStorage.setItem(
      "session_key",
      JSON.stringify(Array.from(keypair.secretKey))
    );
  }

  /**
   * Load session key from storage
   */
  private loadSessionKey(): anchor.web3.Keypair | null {
    const stored = sessionStorage.getItem("session_key");
    if (!stored) return null;
    
    const secretKey = new Uint8Array(JSON.parse(stored));
    return anchor.web3.Keypair.fromSecretKey(secretKey);
  }

  /**
   * Clear session key from storage
   */
  private clearSessionKey(): void {
    sessionStorage.removeItem("session_key");
  }
}

// Usage example
async function main() {
  const provider = anchor.AnchorProvider.env();
  const program = anchor.workspace.SessionExample as Program<SessionExample>;
  
  const sessionManager = new SessionManager(program);
  const authority = provider.wallet as anchor.Wallet;
  
  // 1. Create session (1 hour)
  const { sessionKey } = await sessionManager.createSession(
    authority.payer,
    3600
  );
  
  // 2. Execute actions without wallet popups
  for (let i = 0; i < 10; i++) {
    await sessionManager.executeWithSession(`Action ${i}`);
    console.log(`Executed action ${i} with session key`);
  }
  
  // 3. Check session validity
  const isValid = await sessionManager.isSessionValid();
  console.log("Session valid:", isValid);
  
  // 4. Revoke session when done
  await sessionManager.revokeSession(authority.payer);
}
```

### React Integration

```typescript
import { createContext, useContext, useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';

interface SessionContextType {
  hasSession: boolean;
  createSession: (duration: number) => Promise<void>;
  revokeSession: () => Promise<void>;
  executeWithSession: (data: string) => Promise<string>;
  sessionExpiry: Date | null;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children, program }) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [sessionManager, setSessionManager] = useState(null);
  const [hasSession, setHasSession] = useState(false);
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);

  useEffect(() => {
    if (program) {
      const manager = new SessionManager(program);
      setSessionManager(manager);
      
      // Check for existing session
      checkSession(manager);
    }
  }, [program]);

  const checkSession = async (manager) => {
    const valid = await manager.isSessionValid();
    setHasSession(valid);
    
    if (valid && manager.sessionTokenPDA) {
      const token = await program.account.sessionToken.fetch(
        manager.sessionTokenPDA
      );
      setSessionExpiry(new Date(token.validUntil.toNumber() * 1000));
    }
  };

  const createSession = async (duration: number) => {
    if (!sessionManager || !wallet.publicKey) return;
    
    await sessionManager.createSession(wallet, duration);
    setHasSession(true);
    setSessionExpiry(new Date(Date.now() + duration * 1000));
  };

  const revokeSession = async () => {
    if (!sessionManager || !wallet.publicKey) return;
    
    await sessionManager.revokeSession(wallet);
    setHasSession(false);
    setSessionExpiry(null);
  };

  const executeWithSession = async (data: string) => {
    if (!sessionManager) throw new Error("No session manager");
    return await sessionManager.executeWithSession(data);
  };

  return (
    <SessionContext.Provider
      value={{
        hasSession,
        createSession,
        revokeSession,
        executeWithSession,
        sessionExpiry,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}

// Component example
function GameComponent() {
  const { hasSession, createSession, executeWithSession, sessionExpiry } = useSession();
  const [moves, setMoves] = useState(0);

  const handleCreateSession = async () => {
    await createSession(3600); // 1 hour
  };

  const handleMove = async () => {
    if (!hasSession) {
      alert("Please create a session first");
      return;
    }
    
    try {
      await executeWithSession(`Move ${moves + 1}`);
      setMoves(moves + 1);
    } catch (error) {
      console.error("Move failed:", error);
    }
  };

  return (
    <div>
      <h2>Game with Session Keys</h2>
      
      {!hasSession ? (
        <button onClick={handleCreateSession}>
          Start Session
        </button>
      ) : (
        <>
          <p>Session active until: {sessionExpiry?.toLocaleString()}</p>
          <button onClick={handleMove}>
            Make Move (No wallet popup!)
          </button>
          <p>Moves made: {moves}</p>
        </>
      )}
    </div>
  );
}
```

## Security Model

### Permission Scoping

```rust
#[account]
pub struct SessionToken {
    // ... other fields
    
    /// Specific instructions allowed
    pub allowed_instructions: Vec<String>,
    
    /// Maximum number of uses
    pub max_uses: u64,
    
    /// Current use count
    pub use_count: u64,
}

pub fn execute_with_session(
    ctx: Context<ExecuteWithSession>,
    instruction_name: String,
) -> Result<()> {
    let session = &mut ctx.accounts.session_token;
    
    // Check instruction is allowed
    require!(
        session.allowed_instructions.contains(&instruction_name),
        ErrorCode::InstructionNotAllowed
    );
    
    // Check usage limit
    require!(
        session.use_count < session.max_uses,
        ErrorCode::SessionUseLimitReached
    );
    
    session.use_count += 1;
    
    Ok(())
}
```

### Best Practices

1. **Time Limits**: Always set expiry times
```rust
// ✅ Good: Reasonable time limit
let valid_until = clock.unix_timestamp + 3600; // 1 hour

// ❌ Bad: No expiry or too long
let valid_until = i64::MAX; // Never expires
```

2. **Scope Restrictions**: Limit what sessions can do
```rust
// ✅ Good: Specific permissions
allowed_instructions: vec!["make_move", "chat"],

// ❌ Bad: Too broad
allowed_instructions: vec!["*"], // Everything
```

3. **Usage Limits**: Cap number of operations
```rust
// ✅ Good: Reasonable limit
max_uses: 100,

// ❌ Bad: Unlimited
max_uses: u64::MAX,
```

4. **Revocation**: Always allow session revocation
```rust
// ✅ Good: Can revoke anytime
pub fn revoke_session(ctx: Context<RevokeSession>) -> Result<()> {
    ctx.accounts.session_token.is_active = false;
    Ok(())
}
```

## Use Cases

### 1. Gaming

**Perfect for**:
- Turn-based games
- Real-time multiplayer
- In-game actions
- Chat systems

**Example**: Chess game
```typescript
// Create session at game start
await createSession(7200); // 2 hours

// Make moves without wallet popups
for (const move of playerMoves) {
  await executeWithSession(`move:${move}`);
}

// Revoke when game ends
await revokeSession();
```

### 2. Social Applications

**Perfect for**:
- Posting content
- Liking/reacting
- Commenting
- Following users

**Example**: Social feed
```typescript
// Session for browsing session
await createSession(3600); // 1 hour

// Seamless interactions
await executeWithSession("like:post123");
await executeWithSession("comment:Hello!");
await executeWithSession("follow:user456");
```

### 3. Trading Applications

**Perfect for**:
- Order placement
- Order cancellation
- Position management
- Quick trades

**Example**: Trading bot
```typescript
// Session for trading session
await createSession(1800); // 30 minutes

// Rapid order placement
for (const order of orders) {
  await executeWithSession(`place_order:${order}`);
}
```

## Common Pitfalls

1. **Not Validating Expiry**: Always check session validity
2. **Too Long Sessions**: Keep sessions short (hours, not days)
3. **Broad Permissions**: Scope sessions tightly
4. **Insecure Storage**: Protect session keys properly
5. **No Revocation**: Always implement revocation

## Troubleshooting

### Issue: Session Creation Fails

**Solutions**:
- Check wallet has SOL for fees
- Verify program permissions
- Ensure valid expiry time
- Check PDA derivation

### Issue: Session Expired

**Solutions**:
- Create new session
- Implement auto-renewal
- Show expiry warnings
- Handle gracefully in UI

### Issue: Invalid Session Key

**Solutions**:
- Verify session key storage
- Check session token PDA
- Ensure proper signing
- Validate session is active

## Next Steps

Now that you understand Session Keys, continue to:

- [Verifiable Randomness](../03-verifiable-randomness/README.md) - Onchain randomness
- [Private Rollups](../04-private-rollups/README.md) - Privacy with TEE
- [Exercises](../exercises/README.md) - Practice with Session Keys

## Additional Resources

- [MagicBlock Session Keys Docs](https://docs.magicblock.gg/pages/tools/session-keys/) - Official documentation
- [Session Keys Security](https://docs.magicblock.gg/pages/tools/session-keys/security) - Security best practices
- [MagicBlock GitHub](https://github.com/magicblock-labs) - Example implementations

## Source Attribution

This content is based on educational materials from:

- **MagicBlock Documentation**: https://docs.magicblock.gg/
- **MagicBlock Labs**: https://magicblock.gg/

---

**Last Updated**: February 17, 2026
