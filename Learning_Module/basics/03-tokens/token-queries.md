# Token Queries

Learn how to query token information including mint details, token accounts, balances, and accounts by owner. These operations are essential for building token-aware applications.

## Table of Contents

- [Getting Token Mint Information](#getting-token-mint-information)
- [Getting Token Account Details](#getting-token-account-details)
- [Getting Token Account Balance](#getting-token-account-balance)
- [Getting All Token Accounts by Owner](#getting-all-token-accounts-by-owner)
- [Best Practices](#best-practices)

---

## Getting Token Mint Information

To get information about a token mint (supply, authority, decimals), you need to fetch the mint account data.

### What is a Token Mint?

A token mint is the account that defines a token type. It contains:
- **Supply**: Total number of tokens in circulation
- **Decimals**: Number of decimal places
- **Mint Authority**: Who can mint new tokens
- **Freeze Authority**: Who can freeze token accounts

### Fetching Mint Information

**Solana Kit**:
```typescript
import { Address, createSolanaRpc } from "@solana/kit";
import { fetchMint } from "@solana-program/token-2022";

const rpc = createSolanaRpc("https://api.mainnet.solana.com");
const mintAddress = "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo" as Address;

const mint = await fetchMint(rpc, mintAddress);

console.log("Supply:", mint.supply);
console.log("Decimals:", mint.decimals);
console.log("Mint Authority:", mint.mintAuthority);
console.log("Freeze Authority:", mint.freezeAuthority);
```

**Legacy Web3.js**:
```typescript
import { Connection, PublicKey } from "@solana/web3.js";
import { getMint, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

const connection = new Connection("https://api.mainnet.solana.com", "confirmed");
const mintAddress = new PublicKey("2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo");

const mintAccount = await getMint(
  connection,
  mintAddress,
  undefined,
  TOKEN_2022_PROGRAM_ID
);

console.log({
  supply: mintAccount.supply.toString(),
  decimals: mintAccount.decimals,
  mintAuthority: mintAccount.mintAuthority?.toBase58(),
  freezeAuthority: mintAccount.freezeAuthority?.toBase58(),
  isInitialized: mintAccount.isInitialized
});
```

**Rust**:
```rust
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_commitment_config::CommitmentConfig;
use solana_sdk::pubkey;
use spl_token_2022_interface::{
    extension::{BaseStateWithExtensions, StateWithExtensions},
    state::Mint,
};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let client = RpcClient::new_with_commitment(
        String::from("https://api.mainnet.solana.com"),
        CommitmentConfig::confirmed(),
    );
    
    let mint_address = pubkey!("2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo");
    let mint_data = client.get_account_data(&mint_address).await?;
    let mint = StateWithExtensions::<Mint>::unpack(&mint_data)?;
    
    println!("Mint address: {:#?}", mint_address);
    println!("Supply: {}", mint.base.supply);
    println!("Decimals: {}", mint.base.decimals);
    println!("Mint Authority: {:?}", mint.base.mint_authority);
    println!("Freeze Authority: {:?}", mint.base.freeze_authority);
    
    Ok(())
}
```

**Python**:
```python
import asyncio
from solana.rpc.async_api import AsyncClient
from solders.pubkey import Pubkey
from spl.token._layouts import MINT_LAYOUT
from spl.token.core import MintInfo

async def main():
    rpc = AsyncClient("https://api.mainnet.solana.com")
    mint_address = Pubkey.from_string("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU")
    
    async with rpc:
        account_info = await rpc.get_account_info(mint_address)
        mint_data = MINT_LAYOUT.parse(account_info.value.data)
        
        mint_info = MintInfo(
            mint_authority=mint_data.mint_authority,
            supply=mint_data.supply,
            decimals=mint_data.decimals,
            is_initialized=mint_data.is_initialized,
            freeze_authority=mint_data.freeze_authority
        )
        
        print(f"Mint Address: {mint_address}")
        print(f"Decimals: {mint_info.decimals}")
        print(f"Supply: {mint_info.supply}")
        print(f"Mint Authority: {mint_info.mint_authority}")
        print(f"Freeze Authority: {mint_info.freeze_authority}")

if __name__ == "__main__":
    asyncio.run(main())
```

### Token Extensions (Token-2022)

Token-2022 supports extensions that add additional functionality:

```rust
// Get extension types
let extension_types = mint.get_extension_types()?;
println!("Extensions enabled: {:#?}", extension_types);

// Check for specific extensions
extension_types.iter().for_each(|extension_type| match extension_type {
    ExtensionType::TransferFeeConfig => {
        if let Ok(ext) = mint.get_extension::<TransferFeeConfig>() {
            println!("Transfer Fee Config: {:#?}", ext);
        }
    }
    ExtensionType::MetadataPointer => {
        if let Ok(ext) = mint.get_extension::<MetadataPointer>() {
            println!("Metadata Pointer: {:#?}", ext);
        }
    }
    _ => {}
});
```

---

## Getting Token Account Details

Token accounts hold tokens for a specific owner. Each token account contains information about the mint, owner, and balance.

### What is a Token Account?

A token account stores:
- **Mint**: Which token type it holds
- **Owner**: Who controls the account
- **Amount**: Token balance
- **Delegate**: Optional delegate authority
- **State**: Account state (initialized, frozen, etc.)

### Fetching Token Account

**Solana Kit**:
```typescript
import {
  fetchToken,
  findAssociatedTokenPda,
  TOKEN_2022_PROGRAM_ADDRESS
} from "@solana-program/token-2022";
import { address, createSolanaRpc } from "@solana/kit";

const rpc = createSolanaRpc("https://api.mainnet.solana.com");

const mintAddress = address("2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo");
const owner = address("AC5RDfQFmDS1deWZos921JfqscXdByf8BKHs5ACWjtW2");

// Find associated token address
const [associatedTokenAddress] = await findAssociatedTokenPda({
  mint: mintAddress,
  owner: owner,
  tokenProgram: TOKEN_2022_PROGRAM_ADDRESS
});

// Fetch token account details
const tokenAccount = await fetchToken(rpc, associatedTokenAddress);

console.log("Mint:", tokenAccount.mint);
console.log("Owner:", tokenAccount.owner);
console.log("Amount:", tokenAccount.amount);
console.log("Delegate:", tokenAccount.delegate);
console.log("State:", tokenAccount.state);
```

**Legacy Web3.js**:
```typescript
import { Connection, PublicKey } from "@solana/web3.js";
import { getAccount, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

const connection = new Connection("https://api.mainnet.solana.com", "confirmed");
const tokenAccountPubkey = new PublicKey("GfVPzUxMDvhFJ1Xs6C9i47XQRSapTd8LHw5grGuTquyQ");

const tokenAccount = await getAccount(
  connection,
  tokenAccountPubkey,
  "confirmed",
  TOKEN_2022_PROGRAM_ID
);

console.log({
  mint: tokenAccount.mint.toBase58(),
  owner: tokenAccount.owner.toBase58(),
  amount: tokenAccount.amount.toString(),
  delegate: tokenAccount.delegate?.toBase58(),
  delegatedAmount: tokenAccount.delegatedAmount.toString(),
  isInitialized: tokenAccount.isInitialized,
  isFrozen: tokenAccount.isFrozen,
  isNative: tokenAccount.isNative
});
```

**Rust**:
```rust
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_commitment_config::CommitmentConfig;
use solana_sdk::pubkey;
use spl_token_2022_interface::{
    extension::{BaseStateWithExtensions, StateWithExtensions},
    state::Account,
};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let client = RpcClient::new_with_commitment(
        String::from("https://api.mainnet.solana.com"),
        CommitmentConfig::confirmed(),
    );
    
    let token_account_address = pubkey!("GfVPzUxMDvhFJ1Xs6C9i47XQRSapTd8LHw5grGuTquyQ");
    
    // Fetch and deserialize
    let account = client.get_account(&token_account_address).await?;
    let token_account = StateWithExtensions::<Account>::unpack(&account.data)?;
    
    println!("Mint: {}", token_account.base.mint);
    println!("Owner: {}", token_account.base.owner);
    println!("Amount: {}", token_account.base.amount);
    println!("Delegate: {:?}", token_account.base.delegate);
    println!("State: {:?}", token_account.base.state);
    
    Ok(())
}
```

**Python**:
```python
import asyncio
from solana.rpc.async_api import AsyncClient
from solders.pubkey import Pubkey
from spl.token.instructions import get_associated_token_address
from spl.token.constants import TOKEN_PROGRAM_ID

async def main():
    rpc = AsyncClient("https://api.mainnet.solana.com")
    
    mint_address = Pubkey.from_string("Fzp15ELGCFYy8k7ns4k2b3Y5MhpmPeK6ppb3HLookBV7")
    owner = Pubkey.from_string("Hcq3S8URqJLQ2JUnNJ1BmNiYwtWen78jQkyirHufG2jf")
    
    # Find associated token address
    ata = get_associated_token_address(
        owner=owner,
        mint=mint_address,
        token_program_id=TOKEN_PROGRAM_ID
    )
    
    async with rpc:
        account_info = await rpc.get_account_info(ata)
        
        if account_info.value:
            print(f"Associated Token Address: {ata}")
            print(f"Owner: {account_info.value.owner}")
            print(f"Lamports: {account_info.value.lamports}")
            print(f"Data Length: {len(account_info.value.data)} bytes")
        else:
            print("Token account not found")

if __name__ == "__main__":
    asyncio.run(main())
```

---

## Getting Token Account Balance

The quickest way to get a token account's balance is with a single RPC call.

### Quick Balance Check

**Solana Kit**:
```typescript
import { address, createSolanaRpc } from "@solana/kit";

const rpc = createSolanaRpc("https://api.mainnet.solana.com");
const tokenAccountAddress = address("GfVPzUxMDvhFJ1Xs6C9i47XQRSapTd8LHw5grGuTquyQ");

const balance = await rpc
  .getTokenAccountBalance(tokenAccountAddress)
  .send();

console.log("Amount:", balance.value.amount);
console.log("Decimals:", balance.value.decimals);
console.log("UI Amount:", balance.value.uiAmount);
console.log("UI Amount String:", balance.value.uiAmountString);
```

**Legacy Web3.js**:
```typescript
import { Connection, PublicKey } from "@solana/web3.js";

const connection = new Connection("https://api.mainnet.solana.com", "confirmed");
const tokenAccount = new PublicKey("GfVPzUxMDvhFJ1Xs6C9i47XQRSapTd8LHw5grGuTquyQ");

const tokenAmount = await connection.getTokenAccountBalance(tokenAccount);

console.log(`Amount: ${tokenAmount.value.amount}`);
console.log(`Decimals: ${tokenAmount.value.decimals}`);
console.log(`UI Amount: ${tokenAmount.value.uiAmount}`);
console.log(`UI Amount String: ${tokenAmount.value.uiAmountString}`);
```

**Rust**:
```rust
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_commitment_config::CommitmentConfig;
use solana_sdk::pubkey;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let client = RpcClient::new_with_commitment(
        String::from("https://api.mainnet.solana.com"),
        CommitmentConfig::confirmed(),
    );
    
    let token_account_address = pubkey!("GfVPzUxMDvhFJ1Xs6C9i47XQRSapTd8LHw5grGuTquyQ");
    let balance = client
        .get_token_account_balance(&token_account_address)
        .await?;
    
    println!("Balance: {:#?}", balance);
    
    Ok(())
}
```

**Python**:
```python
import asyncio
from solana.rpc.async_api import AsyncClient
from solders.pubkey import Pubkey

async def main():
    rpc = AsyncClient("https://api.mainnet.solana.com")
    token_account = Pubkey.from_string("GfVPzUxMDvhFJ1Xs6C9i47XQRSapTd8LHw5grGuTquyQ")
    
    async with rpc:
        balance = await rpc.get_token_account_balance(token_account)
        print(f"Amount: {balance.value.amount}")
        print(f"Decimals: {balance.value.decimals}")
        print(f"UI Amount: {balance.value.ui_amount}")

if __name__ == "__main__":
    asyncio.run(main())
```

### Understanding Balance Values

- **amount**: Raw token amount (as integer)
- **decimals**: Number of decimal places
- **uiAmount**: Human-readable amount (as float)
- **uiAmountString**: Human-readable amount (as string, more precise)

**Example**:
```
amount: "1000000"
decimals: 6
uiAmount: 1.0
uiAmountString: "1.0"
```

> **Note**: A token account can only hold one type of token (one mint). When you specify a token account, you're also specifying which mint it holds.

---

## Getting All Token Accounts by Owner

Fetch all token accounts owned by a specific address, either all accounts or filtered by mint.

### Get All Token Accounts

**Solana Kit**:
```typescript
import { TOKEN_PROGRAM_ADDRESS } from "@solana-program/token";
import { address, createSolanaRpc } from "@solana/kit";

const rpc = createSolanaRpc("https://api.devnet.solana.com");
const owner = address("4kg8oh3jdNtn7j2wcS7TrUua31AgbLzDVkBZgTAe44aF");

const response = await rpc
  .getTokenAccountsByOwner(
    owner,
    { programId: TOKEN_PROGRAM_ADDRESS },
    { encoding: "jsonParsed" }
  )
  .send();

response.value.forEach((accountInfo) => {
  const data = accountInfo.account.data["parsed"]["info"];
  console.log(`Pubkey: ${accountInfo.pubkey}`);
  console.log(`Mint: ${data.mint}`);
  console.log(`Owner: ${data.owner}`);
  console.log(`Decimals: ${data.tokenAmount.decimals}`);
  console.log(`Amount: ${data.tokenAmount.amount}`);
  console.log("====================");
});
```

**Legacy Web3.js**:
```typescript
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const connection = new Connection("http://localhost:8899", "confirmed");
const owner = new PublicKey("G2FAbFQPFa5qKXCetoFZQEvF9BVvCKbvUZvodpVidnoY");

const response = await connection.getParsedTokenAccountsByOwner(owner, {
  programId: TOKEN_PROGRAM_ID
});

response.value.forEach((accountInfo) => {
  const data = accountInfo.account.data["parsed"]["info"];
  console.log(`Pubkey: ${accountInfo.pubkey.toBase58()}`);
  console.log(`Mint: ${data.mint}`);
  console.log(`Owner: ${data.owner}`);
  console.log(`Decimals: ${data.tokenAmount.decimals}`);
  console.log(`Amount: ${data.tokenAmount.amount}`);
  console.log("====================");
});
```

**Rust**:
```rust
use solana_account_decoder_client_types::UiAccountData;
use solana_client::{
    nonblocking::rpc_client::RpcClient,
    rpc_request::TokenAccountsFilter
};
use solana_commitment_config::CommitmentConfig;
use solana_sdk::pubkey;
use spl_token_interface::ID as TOKEN_PROGRAM_ID;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let client = RpcClient::new_with_commitment(
        String::from("https://api.mainnet.solana.com"),
        CommitmentConfig::confirmed(),
    );
    
    let owner = pubkey!("BJE5MMbqXjVwjAF7oxwPYXnTXDyspzZyt4vwenNw5ruG");
    
    let token_accounts = client
        .get_token_accounts_by_owner(
            &owner,
            TokenAccountsFilter::ProgramId(TOKEN_PROGRAM_ID),
        )
        .await?;
    
    for token_account in token_accounts {
        if let UiAccountData::Json(parsed_data) = token_account.account.data {
            println!("{:#?}\n", parsed_data);
        }
    }
    
    Ok(())
}
```

### Filter by Mint

Get only token accounts for a specific mint:

**Solana Kit**:
```typescript
import { address, createSolanaRpc } from "@solana/kit";

const rpc = createSolanaRpc("https://api.devnet.solana.com");
const owner = address("4kg8oh3jdNtn7j2wcS7TrUua31AgbLzDVkBZgTAe44aF");
const mint = address("6sgxNSdXgkEFVLA2YEQFnuFHU3WGafhu9WYzXAXY7yCq");

const response = await rpc
  .getTokenAccountsByOwner(
    owner,
    { mint },
    { encoding: "jsonParsed" }
  )
  .send();

response.value.forEach((accountInfo) => {
  const data = accountInfo.account.data["parsed"]["info"];
  console.log(`Pubkey: ${accountInfo.pubkey}`);
  console.log(`Mint: ${data.mint}`);
  console.log(`Amount: ${data.tokenAmount.amount}`);
  console.log("====================");
});
```

**Legacy Web3.js**:
```typescript
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";

const connection = new Connection("http://localhost:8899", "confirmed");
const owner = new PublicKey("G2FAbFQPFa5qKXCetoFZQEvF9BVvCKbvUZvodpVidnoY");
const mint = new PublicKey("54dQ8cfHsW1YfKYpmdVZhWpb9iSi6Pac82Nf7sg3bVb");

const response = await connection.getParsedTokenAccountsByOwner(owner, {
  mint: mint,
  programId: TOKEN_2022_PROGRAM_ID
});

response.value.forEach((accountInfo) => {
  const data = accountInfo.account.data["parsed"]["info"];
  console.log(`Pubkey: ${accountInfo.pubkey.toBase58()}`);
  console.log(`Mint: ${data.mint}`);
  console.log(`Amount: ${data.tokenAmount.amount}`);
  console.log("====================");
});
```

**Rust**:
```rust
use solana_client::rpc_request::TokenAccountsFilter;

let mint_address = pubkey!("54dQ8cfHsW1YfKYpmdVZhWpb9iSi6Pac82Nf7sg3bVb");

let token_accounts = client
    .get_token_accounts_by_owner(
        &owner,
        TokenAccountsFilter::Mint(mint_address)
    )
    .await?;
```

---

## Best Practices

### Performance

✅ **Do**:
- Use `getTokenAccountBalance` for quick balance checks
- Filter by mint when you only need specific tokens
- Use parsed encoding for easier data access
- Cache mint information (it rarely changes)

❌ **Don't**:
- Fetch all accounts when you only need one mint
- Parse account data manually unless necessary
- Make excessive RPC calls in loops

### Error Handling

```typescript
async function getTokenBalance(tokenAccount: PublicKey) {
  try {
    const balance = await connection.getTokenAccountBalance(tokenAccount);
    return balance.value;
  } catch (error) {
    if (error.message.includes("could not find account")) {
      console.log("Token account doesn't exist");
      return null;
    }
    throw error;
  }
}
```

### Displaying Balances

```typescript
function formatTokenAmount(amount: string, decimals: number): string {
  const value = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const integerPart = value / divisor;
  const fractionalPart = value % divisor;
  
  return `${integerPart}.${fractionalPart.toString().padStart(decimals, '0')}`;
}

// Usage
const balance = await connection.getTokenAccountBalance(tokenAccount);
const formatted = formatTokenAmount(balance.value.amount, balance.value.decimals);
console.log(`Balance: ${formatted} tokens`);
```

### Checking Account Existence

```typescript
async function tokenAccountExists(
  connection: Connection,
  tokenAccount: PublicKey
): Promise<boolean> {
  try {
    await connection.getTokenAccountBalance(tokenAccount);
    return true;
  } catch {
    return false;
  }
}
```

---

## Summary

Key takeaways:

✅ **Mint Information**: Get supply, decimals, and authorities
✅ **Token Accounts**: Fetch owner, mint, and balance details
✅ **Quick Balance**: Use `getTokenAccountBalance` for fast checks
✅ **Owner Queries**: Get all tokens or filter by mint
✅ **Error Handling**: Always handle account not found errors
✅ **Formatting**: Convert raw amounts using decimals

---

## Next Steps

- Learn about [Token Operations](./token-operations.md)
- Explore [Associated Token Accounts](./associated-token-accounts.md)
- Try [Token Exercises](../exercises/token-exercises.md)

---

**Source**: [Solana Cookbook](https://solana.com/developers/cookbook/wallets/)
**Last Updated**: February 17, 2026
