# SPL Tokens

## Overview

The Solana Program Library (SPL) Token program is the standard for creating and managing tokens on Solana. It's similar to ERC-20 on Ethereum but with key differences that leverage Solana's account model. Understanding SPL tokens is essential for building DeFi applications, NFTs, and any application that involves digital assets.

**Estimated Time:** 2-3 hours

## Learning Objectives

After completing this lesson, you will be able to:

- Understand the SPL Token program architecture
- Create and mint new tokens
- Transfer tokens between accounts
- Work with token accounts and associated token accounts
- Implement token approvals and delegations
- Use Token-2022 (Token Extensions)

## Prerequisites

- Completed [Accounts and Programs](../01-accounts-and-programs/README.md)
- Completed [Transactions](../02-transactions/README.md)
- Understanding of token economics basics

## SPL Token Architecture

### Core Concepts

The SPL Token program uses three main account types:

1. **Mint Account** - Defines the token itself
2. **Token Account** - Holds tokens for a specific owner
3. **Associated Token Account (ATA)** - Deterministic token account address

### Mint Account

The mint account stores metadata about the token:

```rust
pub struct Mint {
    /// Optional authority to mint new tokens
    pub mint_authority: COption<Pubkey>,
    /// Total supply of tokens
    pub supply: u64,
    /// Number of decimal places
    pub decimals: u8,
    /// Is this mint initialized?
    pub is_initialized: bool,
    /// Optional authority to freeze token accounts
    pub freeze_authority: COption<Pubkey>,
}
```

### Token Account

Token accounts hold tokens for a specific owner:

```rust
pub struct Account {
    /// The mint associated with this account
    pub mint: Pubkey,
    /// The owner of this account
    pub owner: Pubkey,
    /// The amount of tokens this account holds
    pub amount: u64,
    /// Optional delegate
    pub delegate: COption<Pubkey>,
    /// The account's state
    pub state: AccountState,
    /// Is this a native token account?
    pub is_native: COption<u64>,
    /// The amount delegated
    pub delegated_amount: u64,
    /// Optional authority to close the account
    pub close_authority: COption<Pubkey>,
}
```

## Creating Tokens

### Method 1: Using @solana/spl-token (Recommended)

```typescript
import {
  Connection,
  Keypair,
  PublicKey,
} from '@solana/web3.js';
import {
  createMint,
  getMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

async function createToken(
  connection: Connection,
  payer: Keypair,
  decimals: number = 9
): Promise<PublicKey> {
  // Create new token mint
  const mint = await createMint(
    connection,
    payer,                    // Payer of the transaction
    payer.publicKey,          // Mint authority
    payer.publicKey,          // Freeze authority (optional)
    decimals                  // Decimals
  );
  
  console.log('Token mint created:', mint.toBase58());
  return mint;
}
```

### Method 2: Manual Token Creation

```typescript
import {
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  createInitializeMintInstruction,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

async function createTokenManual(
  connection: Connection,
  payer: Keypair,
  decimals: number = 9
): Promise<PublicKey> {
  // Generate new keypair for mint
  const mintKeypair = Keypair.generate();
  
  // Calculate rent
  const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
  
  // Create account instruction
  const createAccountIx = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: mintKeypair.publicKey,
    space: MINT_SIZE,
    lamports,
    programId: TOKEN_PROGRAM_ID,
  });
  
  // Initialize mint instruction
  const initializeMintIx = createInitializeMintInstruction(
    mintKeypair.publicKey,    // Mint account
    decimals,                 // Decimals
    payer.publicKey,          // Mint authority
    payer.publicKey,          // Freeze authority
    TOKEN_PROGRAM_ID
  );
  
  // Send transaction
  const transaction = new Transaction().add(
    createAccountIx,
    initializeMintIx
  );
  
  await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer, mintKeypair]
  );
  
  return mintKeypair.publicKey;
}
```

### Token-2022 (Token Extensions)

Token-2022 is an enhanced version with additional features:

```typescript
import {
  createMint,
  TOKEN_2022_PROGRAM_ID,
  ExtensionType,
  getMintLen,
} from '@solana/spl-token';

async function createToken2022(
  connection: Connection,
  payer: Keypair
): Promise<PublicKey> {
  // Create Token-2022 mint with extensions
  const mint = await createMint(
    connection,
    payer,
    payer.publicKey,
    payer.publicKey,
    9,                        // Decimals
    undefined,                // Keypair (optional)
    undefined,                // Confirm options
    TOKEN_2022_PROGRAM_ID     // Token-2022 program
  );
  
  return mint;
}
```

## Token Accounts

### Creating Token Accounts

#### Associated Token Account (Recommended)

```typescript
async function createTokenAccount(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey,
  owner: PublicKey
): Promise<PublicKey> {
  // Get or create associated token account
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,      // Payer
    mint,       // Mint
    owner       // Owner
  );
  
  return tokenAccount.address;
}
```

#### Manual Token Account Creation

```typescript
import {
  createAccount,
  getAccount,
} from '@solana/spl-token';

async function createTokenAccountManual(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey,
  owner: PublicKey
): Promise<PublicKey> {
  const tokenAccount = await createAccount(
    connection,
    payer,
    mint,
    owner
  );
  
  return tokenAccount;
}
```

### Associated Token Account Address

Calculate ATA address deterministically:

```typescript
import { getAssociatedTokenAddress } from '@solana/spl-token';

async function getATAAddress(
  mint: PublicKey,
  owner: PublicKey
): Promise<PublicKey> {
  const ata = await getAssociatedTokenAddress(
    mint,
    owner
  );
  
  return ata;
}
```

## Minting Tokens

### Mint to Account

```typescript
async function mintTokens(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey,
  destination: PublicKey,
  amount: number
): Promise<string> {
  // Mint tokens to destination account
  const signature = await mintTo(
    connection,
    payer,              // Payer
    mint,               // Mint
    destination,        // Destination token account
    payer,              // Mint authority
    amount              // Amount (in smallest units)
  );
  
  console.log('Minted', amount, 'tokens');
  return signature;
}
```

### Complete Example: Create and Mint

```typescript
async function createAndMintToken(
  connection: Connection,
  payer: Keypair,
  recipient: PublicKey,
  amount: number
): Promise<{ mint: PublicKey; tokenAccount: PublicKey }> {
  // 1. Create mint
  const mint = await createMint(
    connection,
    payer,
    payer.publicKey,
    null,               // No freeze authority
    9                   // 9 decimals (like SOL)
  );
  
  console.log('Mint created:', mint.toBase58());
  
  // 2. Create token account for recipient
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    recipient
  );
  
  console.log('Token account created:', tokenAccount.address.toBase58());
  
  // 3. Mint tokens
  await mintTo(
    connection,
    payer,
    mint,
    tokenAccount.address,
    payer,
    amount
  );
  
  console.log('Minted', amount, 'tokens to', recipient.toBase58());
  
  return {
    mint,
    tokenAccount: tokenAccount.address,
  };
}
```

## Transferring Tokens

### Basic Transfer

```typescript
async function transferTokens(
  connection: Connection,
  payer: Keypair,
  source: PublicKey,
  destination: PublicKey,
  owner: Keypair,
  amount: number
): Promise<string> {
  const signature = await transfer(
    connection,
    payer,              // Payer
    source,             // Source token account
    destination,        // Destination token account
    owner,              // Owner of source account
    amount              // Amount
  );
  
  return signature;
}
```

### Transfer with ATA Creation

```typescript
async function transferWithATACreation(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey,
  from: Keypair,
  to: PublicKey,
  amount: number
): Promise<string> {
  // Get source token account
  const sourceAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    from.publicKey
  );
  
  // Get or create destination token account
  const destinationAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    to
  );
  
  // Transfer
  const signature = await transfer(
    connection,
    payer,
    sourceAccount.address,
    destinationAccount.address,
    from,
    amount
  );
  
  return signature;
}
```

## Token Approvals and Delegations

### Approve Delegate

```typescript
import { approve } from '@solana/spl-token';

async function approveDelegate(
  connection: Connection,
  payer: Keypair,
  tokenAccount: PublicKey,
  delegate: PublicKey,
  owner: Keypair,
  amount: number
): Promise<string> {
  const signature = await approve(
    connection,
    payer,
    tokenAccount,
    delegate,
    owner,
    amount
  );
  
  console.log('Approved', amount, 'tokens for delegate');
  return signature;
}
```

### Revoke Delegate

```typescript
import { revoke } from '@solana/spl-token';

async function revokeDelegate(
  connection: Connection,
  payer: Keypair,
  tokenAccount: PublicKey,
  owner: Keypair
): Promise<string> {
  const signature = await revoke(
    connection,
    payer,
    tokenAccount,
    owner
  );
  
  console.log('Revoked delegate');
  return signature;
}
```

## Burning Tokens

### Burn from Account

```typescript
import { burn } from '@solana/spl-token';

async function burnTokens(
  connection: Connection,
  payer: Keypair,
  tokenAccount: PublicKey,
  mint: PublicKey,
  owner: Keypair,
  amount: number
): Promise<string> {
  const signature = await burn(
    connection,
    payer,
    tokenAccount,
    mint,
    owner,
    amount
  );
  
  console.log('Burned', amount, 'tokens');
  return signature;
}
```

## Closing Token Accounts

### Close Empty Account

```typescript
import { closeAccount } from '@solana/spl-token';

async function closeTokenAccount(
  connection: Connection,
  payer: Keypair,
  tokenAccount: PublicKey,
  destination: PublicKey,
  owner: Keypair
): Promise<string> {
  const signature = await closeAccount(
    connection,
    payer,
    tokenAccount,
    destination,      // Receives remaining SOL
    owner
  );
  
  console.log('Closed token account');
  return signature;
}
```

## Reading Token Data

### Get Mint Information

```typescript
async function getMintInfo(
  connection: Connection,
  mint: PublicKey
) {
  const mintInfo = await getMint(connection, mint);
  
  console.log('Supply:', mintInfo.supply.toString());
  console.log('Decimals:', mintInfo.decimals);
  console.log('Mint Authority:', mintInfo.mintAuthority?.toBase58());
  console.log('Freeze Authority:', mintInfo.freezeAuthority?.toBase58());
  
  return mintInfo;
}
```

### Get Token Account Balance

#### Using Web3.js Kit (Recommended)

```typescript
import { address, createSolanaRpc } from "@solana/kit";

const rpc = createSolanaRpc("https://api.mainnet.solana.com");
const tokenAccountAddress = address("GfVPzUxMDvhFJ1Xs6C9i47XQRSapTd8LHw5grGuTquyQ");

// Get token account balance
const balance = await rpc.getTokenAccountBalance(tokenAccountAddress).send();
console.log('Amount:', balance.value.amount);
console.log('Decimals:', balance.value.decimals);
console.log('UI Amount:', balance.value.uiAmount);
```

#### Using Legacy Web3.js

```typescript
import { getAccount } from '@solana/spl-token';

async function getTokenBalance(
  connection: Connection,
  tokenAccount: PublicKey
): Promise<bigint> {
  const accountInfo = await getAccount(connection, tokenAccount);
  
  console.log('Balance:', accountInfo.amount.toString());
  return accountInfo.amount;
}
```

### Get All Token Accounts for Owner

```typescript
import { getTokenAccountsByOwner } from '@solana/spl-token';

async function getAllTokenAccounts(
  connection: Connection,
  owner: PublicKey
) {
  const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
    owner,
    {
      programId: TOKEN_PROGRAM_ID,
    }
  );
  
  for (const account of tokenAccounts.value) {
    const data = account.account.data.parsed.info;
    console.log('Mint:', data.mint);
    console.log('Balance:', data.tokenAmount.uiAmount);
  }
  
  return tokenAccounts.value;
}
```

## Token Metadata

### Using Metaplex for Token Metadata

```typescript
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
} from '@metaplex-foundation/js';

async function createTokenWithMetadata(
  connection: Connection,
  payer: Keypair,
  name: string,
  symbol: string,
  uri: string
) {
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(payer))
    .use(bundlrStorage());
  
  const { nft } = await metaplex.nfts().create({
    name,
    symbol,
    uri,
    sellerFeeBasisPoints: 0,
    isMutable: true,
  });
  
  return nft;
}
```

## Token-2022 Extensions

### Transfer Fee Extension

```typescript
import {
  createMint,
  TOKEN_2022_PROGRAM_ID,
  ExtensionType,
  getMintLen,
  createInitializeTransferFeeConfigInstruction,
} from '@solana/spl-token';

async function createTokenWithTransferFee(
  connection: Connection,
  payer: Keypair,
  feeBasisPoints: number,
  maxFee: bigint
): Promise<PublicKey> {
  const extensions = [ExtensionType.TransferFeeConfig];
  const mintLen = getMintLen(extensions);
  const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);
  
  const mintKeypair = Keypair.generate();
  
  // Create account with space for extensions
  const createAccountIx = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: mintKeypair.publicKey,
    space: mintLen,
    lamports,
    programId: TOKEN_2022_PROGRAM_ID,
  });
  
  // Initialize transfer fee
  const initializeTransferFeeIx = createInitializeTransferFeeConfigInstruction(
    mintKeypair.publicKey,
    payer.publicKey,
    payer.publicKey,
    feeBasisPoints,
    maxFee,
    TOKEN_2022_PROGRAM_ID
  );
  
  // Initialize mint
  const initializeMintIx = createInitializeMintInstruction(
    mintKeypair.publicKey,
    9,
    payer.publicKey,
    null,
    TOKEN_2022_PROGRAM_ID
  );
  
  const transaction = new Transaction().add(
    createAccountIx,
    initializeTransferFeeIx,
    initializeMintIx
  );
  
  await sendAndConfirmTransaction(connection, transaction, [payer, mintKeypair]);
  
  return mintKeypair.publicKey;
}
```

## Best Practices

1. **Use Associated Token Accounts** - Simplifies account management
2. **Check token account existence** - Before transfers
3. **Handle decimals correctly** - Always account for token decimals
4. **Close unused accounts** - Recover rent
5. **Validate mint addresses** - Prevent sending to wrong token
6. **Use Token-2022 for new projects** - More features and flexibility
7. **Implement proper error handling** - Token operations can fail

## Common Pitfalls

1. **Forgetting decimals** - 1 token with 9 decimals = 1,000,000,000 base units
2. **Wrong token account** - Sending to account with different mint
3. **Insufficient balance** - Not checking balance before transfer
4. **Missing token account** - Recipient doesn't have token account
5. **Authority mismatch** - Using wrong authority for operations
6. **Not closing accounts** - Wasting rent on empty accounts

## Real-World Example: Token Faucet

```typescript
import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

class TokenFaucet {
  private connection: Connection;
  private mint: PublicKey;
  private authority: Keypair;
  private faucetAmount: number;
  
  constructor(
    connection: Connection,
    mint: PublicKey,
    authority: Keypair,
    faucetAmount: number
  ) {
    this.connection = connection;
    this.mint = mint;
    this.authority = authority;
    this.faucetAmount = faucetAmount;
  }
  
  async airdrop(recipient: PublicKey): Promise<string> {
    try {
      // Get or create recipient's token account
      const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.authority,
        this.mint,
        recipient
      );
      
      // Mint tokens to recipient
      const signature = await mintTo(
        this.connection,
        this.authority,
        this.mint,
        recipientTokenAccount.address,
        this.authority,
        this.faucetAmount
      );
      
      console.log(`Airdropped ${this.faucetAmount} tokens to ${recipient.toBase58()}`);
      return signature;
    } catch (error) {
      console.error('Airdrop failed:', error);
      throw error;
    }
  }
  
  static async create(
    connection: Connection,
    payer: Keypair,
    faucetAmount: number
  ): Promise<TokenFaucet> {
    // Create new token mint
    const mint = await createMint(
      connection,
      payer,
      payer.publicKey,
      null,
      9
    );
    
    console.log('Faucet token created:', mint.toBase58());
    
    return new TokenFaucet(connection, mint, payer, faucetAmount);
  }
}

// Usage
async function main() {
  const connection = new Connection('https://api.devnet.solana.com');
  const payer = Keypair.generate();
  
  // Airdrop SOL for fees
  const airdropSig = await connection.requestAirdrop(
    payer.publicKey,
    LAMPORTS_PER_SOL
  );
  await connection.confirmTransaction(airdropSig);
  
  // Create faucet
  const faucet = await TokenFaucet.create(
    connection,
    payer,
    1000 * 10 ** 9  // 1000 tokens
  );
  
  // Airdrop to recipient
  const recipient = Keypair.generate().publicKey;
  await faucet.airdrop(recipient);
}
```

## Source Attribution

This content is based on educational materials and examples from:

- **SPL Token Documentation**: https://spl.solana.com/token
- **Solana Cookbook**: https://solanacookbook.com/references/token.html
- **@solana/spl-token Library**: https://github.com/solana-labs/solana-program-library
- **Solana Agent Kit**: [solana-agent-kit/solana-agent-kit](../../../solana-agent-kit/solana-agent-kit/)
  - Token deployment examples (deployToken, deployToken2022)
  - Token transfer and swap implementations
  - Real-world token interaction patterns
- **Solana Privacy Examples**: [solana-privacy/examples-light-token](../../../solana-privacy/examples-light-token/)
  - SPL token and Token-2022 creation examples
  - Token wrapping and unwrapping patterns

## Next Steps

Now that you understand SPL tokens, continue to:

- [PDAs](../04-pdas/README.md) - Program Derived Addresses for advanced patterns
- [Exercises](../exercises/README.md) - Practice creating and managing tokens
- [DeFi](../../defi/README.md) - Build DeFi applications with tokens

## Additional Resources

- [Token-2022 Documentation](https://spl.solana.com/token-2022) - Documentation for the new Token Extensions program with advanced features
- [Metaplex Token Metadata](https://docs.metaplex.com/programs/token-metadata/) - Standard for adding metadata to tokens (names, images, attributes)
- [Token Extensions Guide](https://spl.solana.com/token-2022/extensions) - Guide to using token extensions like transfer fees and confidential transfers
- [SPL Token CLI](https://spl.solana.com/token#command-line-utility) - Command-line tool for creating and managing tokens
