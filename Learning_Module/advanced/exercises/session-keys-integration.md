# Exercise: Session Keys Integration

## Objective

Implement a seamless, wallet-less user experience using Session Keys, allowing users to perform multiple actions without repeated wallet approvals.

## Difficulty

**Intermediate**

## Estimated Time

2-3 hours

## Prerequisites

- Completed [Session Keys](../02-session-keys/README.md) guide
- Understanding of React (for client integration)
- Knowledge of wallet adapters
- Anchor framework proficiency

## Requirements

Build a simple social application where users can:

1. **Create session** with time limit
2. **Post messages** without wallet popups
3. **Like posts** seamlessly
4. **Revoke session** when done
5. **Track session usage**

### Account Structures

```rust
#[account]
pub struct SessionToken {
    pub authority: Pubkey,
    pub session_key: Pubkey,
    pub valid_until: i64,
    pub is_active: bool,
    pub use_count: u64,
    pub max_uses: u64,
}

#[account]
pub struct Post {
    pub author: Pubkey,
    pub content: String,
    pub likes: u64,
    pub timestamp: i64,
}

#[account]
pub struct UserProfile {
    pub authority: Pubkey,
    pub posts_count: u64,
    pub likes_given: u64,
}
```

### Required Instructions

**Program Side**:
1. `create_session` - Initialize session token
2. `revoke_session` - Deactivate session
3. `create_post` - Post with session key
4. `like_post` - Like with session key
5. `get_profile` - View user stats

**Client Side**:
1. Session manager class
2. React hooks for session management
3. UI components with/without session

## Validation Criteria

Your solution must:

- ✅ Create sessions with proper validation
- ✅ Execute actions using session keys
- ✅ Track session usage and limits
- ✅ Enforce time limits
- ✅ Allow session revocation
- ✅ Provide seamless UX
- ✅ Handle session expiry gracefully
- ✅ Include comprehensive tests

## Test Scenarios

### Test 1: Session Creation
```typescript
it("Creates session with valid parameters", async () => {
  const sessionKey = anchor.web3.Keypair.generate();
  const validUntil = Math.floor(Date.now() / 1000) + 3600; // 1 hour
  const maxUses = 100;
  
  await program.methods
    .createSession(sessionKey.publicKey, new anchor.BN(validUntil), maxUses)
    .accounts({
      sessionToken: sessionTokenPDA,
      authority: authority.publicKey,
    })
    .signers([authority])
    .rpc();
  
  const session = await program.account.sessionToken.fetch(sessionTokenPDA);
  assert.equal(session.isActive, true);
  assert.equal(session.maxUses, maxUses);
});
```

### Test 2: Wallet-less Actions
```typescript
it("Creates posts without wallet popups", async () => {
  // Create session
  const { sessionKey } = await createSession(authority, 3600);
  
  // Create 10 posts using session key (no wallet popups!)
  for (let i = 0; i < 10; i++) {
    await program.methods
      .createPost(`Post ${i}`)
      .accounts({
        sessionToken: sessionTokenPDA,
        sessionSigner: sessionKey.publicKey,
        post: postPDA,
        profile: profilePDA,
      })
      .signers([sessionKey]) // Session key signs, not wallet!
      .rpc();
  }
  
  const profile = await program.account.userProfile.fetch(profilePDA);
  assert.equal(profile.postsCount, 10);
});
```

### Test 3: Session Limits
```typescript
it("Enforces usage limits", async () => {
  const maxUses = 5;
  const { sessionKey } = await createSession(authority, 3600, maxUses);
  
  // Use session 5 times (should work)
  for (let i = 0; i < maxUses; i++) {
    await program.methods
      .createPost(`Post ${i}`)
      .accounts({...})
      .signers([sessionKey])
      .rpc();
  }
  
  // 6th use should fail
  try {
    await program.methods
      .createPost("Post 6")
      .accounts({...})
      .signers([sessionKey])
      .rpc();
    assert.fail("Should have thrown error");
  } catch (error) {
    assert(error.message.includes("Session use limit reached"));
  }
});
```

### Test 4: Session Expiry
```typescript
it("Enforces time limits", async () => {
  // Create session that expires in 2 seconds
  const validUntil = Math.floor(Date.now() / 1000) + 2;
  const { sessionKey } = await createSession(authority, validUntil);
  
  // Should work immediately
  await program.methods
    .createPost("Post 1")
    .accounts({...})
    .signers([sessionKey])
    .rpc();
  
  // Wait for expiry
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Should fail after expiry
  try {
    await program.methods
      .createPost("Post 2")
      .accounts({...})
      .signers([sessionKey])
      .rpc();
    assert.fail("Should have thrown error");
  } catch (error) {
    assert(error.message.includes("Session expired"));
  }
});
```

### Test 5: Session Revocation
```typescript
it("Allows session revocation", async () => {
  const { sessionKey } = await createSession(authority, 3600);
  
  // Use session
  await program.methods
    .createPost("Post 1")
    .accounts({...})
    .signers([sessionKey])
    .rpc();
  
  // Revoke session
  await program.methods
    .revokeSession()
    .accounts({
      sessionToken: sessionTokenPDA,
      authority: authority.publicKey,
    })
    .signers([authority])
    .rpc();
  
  // Should fail after revocation
  try {
    await program.methods
      .createPost("Post 2")
      .accounts({...})
      .signers([sessionKey])
      .rpc();
    assert.fail("Should have thrown error");
  } catch (error) {
    assert(error.message.includes("Session inactive"));
  }
});
```

## Hints

### Hint 1: Session Validation
Validate session in every instruction:
```rust
pub fn validate_session(
    session: &SessionToken,
    session_signer: &Pubkey,
) -> Result<()> {
    // Check active
    require!(session.is_active, ErrorCode::SessionInactive);
    
    // Check expiry
    let clock = Clock::get()?;
    require!(
        clock.unix_timestamp <= session.valid_until,
        ErrorCode::SessionExpired
    );
    
    // Check signer
    require!(
        session.session_key == *session_signer,
        ErrorCode::InvalidSessionKey
    );
    
    // Check usage limit
    require!(
        session.use_count < session.max_uses,
        ErrorCode::SessionUseLimitReached
    );
    
    Ok(())
}
```

### Hint 2: Session Manager Class
```typescript
class SessionManager {
  private sessionKey: Keypair | null = null;
  private sessionTokenPDA: PublicKey | null = null;
  
  async createSession(
    authority: Keypair,
    durationSeconds: number,
    maxUses: number = 100
  ): Promise<void> {
    this.sessionKey = Keypair.generate();
    const validUntil = Math.floor(Date.now() / 1000) + durationSeconds;
    
    // Derive PDA
    [this.sessionTokenPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("session"),
        authority.publicKey.toBuffer(),
        Buffer.from(validUntil.toString()),
      ],
      program.programId
    );
    
    // Create session on-chain
    await program.methods
      .createSession(
        this.sessionKey.publicKey,
        new BN(validUntil),
        maxUses
      )
      .accounts({
        sessionToken: this.sessionTokenPDA,
        authority: authority.publicKey,
      })
      .signers([authority])
      .rpc();
    
    // Store session key securely
    this.storeSessionKey(this.sessionKey);
  }
  
  async executeWithSession(
    instruction: string,
    ...args: any[]
  ): Promise<string> {
    if (!this.sessionKey || !this.sessionTokenPDA) {
      throw new Error("No active session");
    }
    
    // Execute instruction with session key
    return await program.methods[instruction](...args)
      .accounts({
        sessionToken: this.sessionTokenPDA,
        sessionSigner: this.sessionKey.publicKey,
        // ... other accounts
      })
      .signers([this.sessionKey])
      .rpc();
  }
}
```

### Hint 3: React Integration
```typescript
function SocialApp() {
  const { hasSession, createSession, executeWithSession } = useSession();
  const [posts, setPosts] = useState([]);
  
  const handleCreateSession = async () => {
    await createSession(3600); // 1 hour
  };
  
  const handlePost = async (content: string) => {
    if (!hasSession) {
      alert("Please create a session first");
      return;
    }
    
    // No wallet popup!
    await executeWithSession("createPost", content);
    
    // Refresh posts
    await loadPosts();
  };
  
  const handleLike = async (postId: PublicKey) => {
    if (!hasSession) {
      alert("Please create a session first");
      return;
    }
    
    // No wallet popup!
    await executeWithSession("likePost", postId);
  };
  
  return (
    <div>
      {!hasSession ? (
        <button onClick={handleCreateSession}>
          Start Session
        </button>
      ) : (
        <>
          <PostForm onSubmit={handlePost} />
          <PostList posts={posts} onLike={handleLike} />
        </>
      )}
    </div>
  );
}
```

### Hint 4: Usage Tracking
Track and increment usage:
```rust
pub fn create_post(ctx: Context<CreatePost>, content: String) -> Result<()> {
    let session = &mut ctx.accounts.session_token;
    
    // Validate session
    validate_session(session, &ctx.accounts.session_signer.key())?;
    
    // Increment usage
    session.use_count += 1;
    
    // Create post
    let post = &mut ctx.accounts.post;
    post.author = session.authority;
    post.content = content;
    post.likes = 0;
    post.timestamp = Clock::get()?.unix_timestamp;
    
    Ok(())
}
```

## Bonus Challenges

### Challenge 1: Scoped Permissions
Limit which instructions a session can call:
```rust
#[account]
pub struct SessionToken {
    // ... existing fields
    pub allowed_instructions: Vec<String>,
}

pub fn validate_instruction(
    session: &SessionToken,
    instruction: &str,
) -> Result<()> {
    require!(
        session.allowed_instructions.contains(&instruction.to_string()),
        ErrorCode::InstructionNotAllowed
    );
    Ok(())
}
```

### Challenge 2: Session Renewal
Allow extending session without creating new one:
```rust
pub fn renew_session(
    ctx: Context<RenewSession>,
    additional_seconds: i64,
) -> Result<()> {
    let session = &mut ctx.accounts.session_token;
    session.valid_until += additional_seconds;
    Ok(())
}
```

### Challenge 3: Multi-Action Batching
Execute multiple actions in one transaction:
```rust
pub fn batch_actions(
    ctx: Context<BatchActions>,
    actions: Vec<Action>,
) -> Result<()> {
    for action in actions {
        match action {
            Action::CreatePost(content) => create_post_internal(ctx, content)?,
            Action::LikePost(post_id) => like_post_internal(ctx, post_id)?,
        }
    }
    Ok(())
}
```

### Challenge 4: Session Analytics
Track detailed session usage:
```rust
#[account]
pub struct SessionAnalytics {
    pub session_token: Pubkey,
    pub actions_by_type: HashMap<String, u64>,
    pub last_used: i64,
    pub average_time_between_actions: i64,
}
```

## Solution Outline

```rust
use anchor_lang::prelude::*;

declare_id!("SessionAppProgramID");

#[program]
pub mod session_app {
    use super::*;

    pub fn create_session(
        ctx: Context<CreateSession>,
        session_key: Pubkey,
        valid_until: i64,
        max_uses: u64,
    ) -> Result<()> {
        // Create session
    }

    pub fn revoke_session(ctx: Context<RevokeSession>) -> Result<()> {
        // Revoke session
    }

    pub fn create_post(
        ctx: Context<CreatePost>,
        content: String,
    ) -> Result<()> {
        // Create post with session
    }

    pub fn like_post(ctx: Context<LikePost>) -> Result<()> {
        // Like post with session
    }
}

#[derive(Accounts)]
pub struct CreateSession<'info> {
    // Define accounts
}

#[account]
#[derive(InitSpace)]
pub struct SessionToken {
    // Define structure
}

#[error_code]
pub enum ErrorCode {
    // Define errors
}
```

## Submission Checklist

Before submitting, ensure:

- [ ] Session creation implemented
- [ ] Session validation working
- [ ] Usage limits enforced
- [ ] Time limits enforced
- [ ] Revocation working
- [ ] Client integration complete
- [ ] React hooks implemented
- [ ] All tests passing
- [ ] UX is seamless
- [ ] Bonus challenges attempted (optional)

## Next Steps

After completing this exercise:

1. Try the [Private Payment exercise](./private-payment.md)
2. Implement bonus challenges
3. Build other applications with Session Keys
4. Combine with ERs for real-time + wallet-less UX

---

**Good luck!** Create a seamless user experience!

**Last Updated**: February 17, 2026
