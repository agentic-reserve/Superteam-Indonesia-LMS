# Solana RPC API Reference

## Overview

The Solana RPC (Remote Procedure Call) API provides a JSON-RPC interface for interacting with Solana nodes. This reference covers the most commonly used RPC methods for building Solana applications.

**Estimated Time:** 1-2 hours (reference material)

## Learning Objectives

After reviewing this reference, you will be able to:

- Understand the RPC API request/response format
- Query account and transaction data
- Submit and confirm transactions
- Handle RPC errors and rate limits
- Optimize RPC usage for production applications

## Prerequisites

- Completed [Accounts and Programs](../01-accounts-and-programs/README.md)
- Completed [Transactions](../02-transactions/README.md)
- Basic understanding of JSON-RPC

## RPC Endpoint Format

### Request Structure

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "methodName",
  "params": [/* method-specific parameters */]
}
```

### Response Structure

```json
{
  "jsonrpc": "2.0",
  "result": {/* method-specific result */},
  "id": 1
}
```

### Error Response

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32600,
    "message": "Invalid Request"
  },
  "id": 1
}
```

## Network Endpoints

| Cluster | RPC Endpoint | WebSocket |
|---------|-------------|-----------|
| Mainnet-beta | https://api.mainnet-beta.solana.com | wss://api.mainnet-beta.solana.com |
| Devnet | https://api.devnet.solana.com | wss://api.devnet.solana.com |
| Testnet | https://api.testnet.solana.com | wss://api.testnet.solana.com |
| Localhost | http://localhost:8899 | ws://localhost:8900 |

## Common RPC Methods

### getAccountInfo

Returns all information associated with the account of provided Pubkey.

**Parameters:**
- `pubkey` (string, required): Pubkey of account to query, as base-58 encoded string
- `config` (object, optional):
  - `encoding` (string): `base58`, `base64`, `base64+zstd`, `jsonParsed`
  - `commitment` (string): `processed`, `confirmed`, `finalized`
  - `dataSlice` (object): Limit returned account data

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getAccountInfo",
  "params": [
    "vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg",
    {
      "encoding": "base64"
    }
  ]
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "context": {
      "slot": 341197053
    },
    "value": {
      "data": ["", "base64"],
      "executable": false,
      "lamports": 88849814690250,
      "owner": "11111111111111111111111111111111",
      "rentEpoch": 18446744073709551615,
      "space": 0
    }
  },
  "id": 1
}
```

**TypeScript Example:**
```typescript
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com');
const pubkey = new PublicKey('vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg');

const accountInfo = await connection.getAccountInfo(pubkey);
console.log('Lamports:', accountInfo.lamports);
console.log('Owner:', accountInfo.owner.toBase58());
```

---

### getBalance

Returns the lamport balance of the account of provided Pubkey.

**Parameters:**
- `pubkey` (string, required): Pubkey of account to query
- `config` (object, optional):
  - `commitment` (string): `processed`, `confirmed`, `finalized`

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getBalance",
  "params": [
    "83astBRguLMdt2h5U1Tpdq5tjFoJ6noeGwaY3mDLVcri"
  ]
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "context": {
      "slot": 1
    },
    "value": 0
  },
  "id": 1
}
```

**TypeScript Example:**
```typescript
const balance = await connection.getBalance(pubkey);
console.log('Balance:', balance / LAMPORTS_PER_SOL, 'SOL');
```

---

### sendTransaction

Submits a signed transaction to the cluster for processing.

**Parameters:**
- `transaction` (string, required): Fully-signed Transaction, as encoded string
- `config` (object, optional):
  - `encoding` (string): `base58` (deprecated) or `base64`
  - `skipPreflight` (bool): Skip preflight transaction checks
  - `preflightCommitment` (string): Commitment level for preflight
  - `maxRetries` (number): Maximum retry attempts
  - `minContextSlot` (number): Minimum slot for transaction processing

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "sendTransaction",
  "params": [
    "<base64-encoded-transaction>",
    {
      "encoding": "base64",
      "skipPreflight": false,
      "preflightCommitment": "confirmed",
      "maxRetries": 5
    }
  ]
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": "2id3YC2jK9G5Wo2phDx4gJVAew8DcY5NAojnVuao8rkxwPYPe8cSwE5GzhEgJA2y8fVjDEo6iR6ykBvDxrTQrtpb",
  "id": 1
}
```

**TypeScript Example:**
```typescript
import { Transaction, sendAndConfirmTransaction } from '@solana/web3.js';

const transaction = new Transaction().add(/* instructions */);
const signature = await sendAndConfirmTransaction(
  connection,
  transaction,
  [payer],
  {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
    maxRetries: 3
  }
);
console.log('Transaction signature:', signature);
```

---

### getLatestBlockhash

Returns the latest blockhash.

**Parameters:**
- `config` (object, optional):
  - `commitment` (string): `processed`, `confirmed`, `finalized`

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getLatestBlockhash",
  "params": [
    {
      "commitment": "finalized"
    }
  ]
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "context": {
      "slot": 2792
    },
    "value": {
      "blockhash": "EkSnNWid2cvwEVnVx9aBqawnmiCNiDgp3gUdkDPTKN1N",
      "lastValidBlockHeight": 3090
    }
  },
  "id": 1
}
```

**TypeScript Example:**
```typescript
const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
console.log('Blockhash:', blockhash);
console.log('Last valid block height:', lastValidBlockHeight);
```

---

### simulateTransaction

Simulate sending a transaction.

**Parameters:**
- `transaction` (string, required): Transaction to simulate, as encoded string
- `config` (object, optional):
  - `encoding` (string): `base58` or `base64`
  - `commitment` (string): Commitment level
  - `sigVerify` (bool): Verify signatures (default: false)
  - `replaceRecentBlockhash` (bool): Replace blockhash with latest
  - `accounts` (object): Accounts to return in simulation

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "simulateTransaction",
  "params": [
    "<base64-encoded-transaction>",
    {
      "encoding": "base64",
      "commitment": "confirmed"
    }
  ]
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "context": {
      "slot": 218
    },
    "value": {
      "err": null,
      "logs": [
        "Program 11111111111111111111111111111111 invoke [1]",
        "Program 11111111111111111111111111111111 success"
      ],
      "accounts": null,
      "unitsConsumed": 150,
      "returnData": null
    }
  },
  "id": 1
}
```

**TypeScript Example:**
```typescript
const simulation = await connection.simulateTransaction(transaction);
if (simulation.value.err) {
  console.error('Simulation failed:', simulation.value.err);
  console.log('Logs:', simulation.value.logs);
} else {
  console.log('Simulation successful');
  console.log('Compute units consumed:', simulation.value.unitsConsumed);
}
```

---

### getSignatureStatuses

Returns the statuses of a list of signatures.

**Parameters:**
- `signatures` (array, required): Array of transaction signatures
- `config` (object, optional):
  - `searchTransactionHistory` (bool): Search full transaction history

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getSignatureStatuses",
  "params": [
    [
      "5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQUW"
    ],
    {
      "searchTransactionHistory": true
    }
  ]
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "context": {
      "slot": 82
    },
    "value": [
      {
        "slot": 72,
        "confirmations": 10,
        "err": null,
        "confirmationStatus": "confirmed"
      }
    ]
  },
  "id": 1
}
```

**TypeScript Example:**
```typescript
const statuses = await connection.getSignatureStatuses([signature]);
const status = statuses.value[0];
if (status) {
  console.log('Confirmation status:', status.confirmationStatus);
  console.log('Confirmations:', status.confirmations);
  console.log('Error:', status.err);
}
```

---

### getProgramAccounts

Returns all accounts owned by the provided program Pubkey.

**Parameters:**
- `programId` (string, required): Pubkey of program
- `config` (object, optional):
  - `encoding` (string): Encoding for account data
  - `commitment` (string): Commitment level
  - `filters` (array): Filter results by account data
  - `dataSlice` (object): Limit returned account data

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getProgramAccounts",
  "params": [
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    {
      "encoding": "base64",
      "filters": [
        {
          "dataSize": 165
        }
      ]
    }
  ]
}
```

**TypeScript Example:**
```typescript
const accounts = await connection.getProgramAccounts(programId, {
  filters: [
    {
      dataSize: 165 // Filter by account data size
    },
    {
      memcmp: {
        offset: 32, // Offset into account data
        bytes: ownerPubkey.toBase58() // Base58 encoded bytes to match
      }
    }
  ]
});

console.log('Found', accounts.length, 'accounts');
```

---

### getTokenAccountsByOwner

Returns all SPL Token accounts by token owner.

**Parameters:**
- `owner` (string, required): Pubkey of account owner
- `filter` (object, required): Either `mint` or `programId`
  - `mint` (string): Pubkey of specific token mint
  - `programId` (string): Pubkey of Token program
- `config` (object, optional):
  - `encoding` (string): Encoding for account data
  - `commitment` (string): Commitment level

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getTokenAccountsByOwner",
  "params": [
    "4Qkev8aNZcqFNSRhQzwyLMFSsi94jHqE8WNVTJzTP99F",
    {
      "mint": "3wyAj7Rt1TWVPZVteFJPLa26JmLvdb1CAKEFZm3NY75E"
    },
    {
      "encoding": "jsonParsed"
    }
  ]
}
```

**TypeScript Example:**
```typescript
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Get all token accounts for owner
const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
  ownerPubkey,
  {
    programId: TOKEN_PROGRAM_ID
  }
);

for (const account of tokenAccounts.value) {
  const data = account.account.data.parsed.info;
  console.log('Mint:', data.mint);
  console.log('Balance:', data.tokenAmount.uiAmount);
}
```

---

### requestAirdrop

Requests an airdrop of lamports to a Pubkey (devnet/testnet only).

**Parameters:**
- `pubkey` (string, required): Pubkey to receive airdrop
- `lamports` (number, required): Amount of lamports to airdrop
- `config` (object, optional):
  - `commitment` (string): Commitment level

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "requestAirdrop",
  "params": [
    "83astBRguLMdt2h5U1Tpdq5tjFoJ6noeGwaY3mDLVcri",
    1000000000
  ]
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": "5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp8uirBgmQpjKhoR4tjF3ZpRzrFmBV6UjKdiSZkQUW",
  "id": 1
}
```

**TypeScript Example:**
```typescript
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

// Request 1 SOL airdrop
const signature = await connection.requestAirdrop(
  pubkey,
  LAMPORTS_PER_SOL
);

// Confirm airdrop
await connection.confirmTransaction(signature);
console.log('Airdrop confirmed');
```

---

### getMinimumBalanceForRentExemption

Returns minimum balance required to make account rent exempt.

**Parameters:**
- `dataLength` (number, required): Account data length in bytes
- `config` (object, optional):
  - `commitment` (string): Commitment level

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getMinimumBalanceForRentExemption",
  "params": [
    165
  ]
}
```

**TypeScript Example:**
```typescript
const space = 165; // bytes
const lamports = await connection.getMinimumBalanceForRentExemption(space);
console.log('Rent-exempt minimum:', lamports, 'lamports');
console.log('In SOL:', lamports / LAMPORTS_PER_SOL);
```

---

### getTransaction

Returns transaction details for a confirmed transaction.

**Parameters:**
- `signature` (string, required): Transaction signature
- `config` (object, optional):
  - `encoding` (string): Encoding for returned data
  - `commitment` (string): `confirmed` or `finalized`
  - `maxSupportedTransactionVersion` (number): Max transaction version

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getTransaction",
  "params": [
    "2nBhEBYYvfaAe16UMNqRHre4YNSskvuYgx3M6E4JP1oDYvZEJHvoPzyUidNgNX5r9sTyN1J9UxtbCXy2rqYcuyuv",
    {
      "encoding": "json",
      "maxSupportedTransactionVersion": 0
    }
  ]
}
```

**TypeScript Example:**
```typescript
const transaction = await connection.getTransaction(signature, {
  maxSupportedTransactionVersion: 0
});

if (transaction) {
  console.log('Slot:', transaction.slot);
  console.log('Block time:', transaction.blockTime);
  console.log('Fee:', transaction.meta?.fee);
  console.log('Logs:', transaction.meta?.logMessages);
}
```

---

## Commitment Levels

Solana uses commitment levels to indicate how finalized a transaction or account state is:

| Level | Description | Use Case |
|-------|-------------|----------|
| `processed` | Query the most recent block | Real-time updates, may be rolled back |
| `confirmed` | Query the most recent confirmed block | Recommended for most applications |
| `finalized` | Query finalized block (32+ confirmations) | Maximum security, slower |

**Example:**
```typescript
// Get account with different commitment levels
const processed = await connection.getAccountInfo(pubkey, 'processed');
const confirmed = await connection.getAccountInfo(pubkey, 'confirmed');
const finalized = await connection.getAccountInfo(pubkey, 'finalized');
```

---

## Error Handling

### Common RPC Errors

| Error Code | Message | Cause |
|------------|---------|-------|
| -32600 | Invalid Request | Malformed JSON-RPC request |
| -32601 | Method not found | Unknown RPC method |
| -32602 | Invalid params | Invalid method parameters |
| -32603 | Internal error | Server-side error |
| -32005 | Node is unhealthy | Node is behind or syncing |
| -32007 | Transaction simulation failed | Transaction would fail |

### Error Handling Pattern

```typescript
async function safeRpcCall<T>(
  rpcCall: () => Promise<T>,
  retries: number = 3
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await rpcCall();
    } catch (error: any) {
      console.error(`Attempt ${i + 1} failed:`, error.message);
      
      // Don't retry on certain errors
      if (error.message.includes('Invalid params')) {
        throw error;
      }
      
      // Wait before retry
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  throw new Error('RPC call failed after retries');
}

// Usage
const balance = await safeRpcCall(() => connection.getBalance(pubkey));
```

---

## Rate Limiting

### Public RPC Endpoints

Public Solana RPC endpoints have rate limits:

- **Mainnet**: ~100 requests/10 seconds
- **Devnet/Testnet**: ~100 requests/10 seconds

### Best Practices

1. **Use Private RPC Providers** for production:
   - Helius
   - QuickNode
   - Alchemy
   - Triton

2. **Implement Exponential Backoff**:
```typescript
async function exponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      
      const delay = Math.min(1000 * Math.pow(2, i), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}
```

3. **Batch Requests** when possible:
```typescript
// Instead of multiple getAccountInfo calls
const accounts = await connection.getMultipleAccountsInfo([
  pubkey1,
  pubkey2,
  pubkey3
]);
```

4. **Cache Results** when appropriate:
```typescript
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

async function getCachedAccountInfo(pubkey: PublicKey) {
  const key = pubkey.toBase58();
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await connection.getAccountInfo(pubkey);
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

---

## WebSocket Subscriptions

For real-time updates, use WebSocket subscriptions instead of polling:

### Account Change Subscription

```typescript
const subscriptionId = connection.onAccountChange(
  pubkey,
  (accountInfo, context) => {
    console.log('Account updated at slot:', context.slot);
    console.log('New balance:', accountInfo.lamports);
  },
  'confirmed'
);

// Unsubscribe when done
connection.removeAccountChangeListener(subscriptionId);
```

### Logs Subscription

```typescript
const subscriptionId = connection.onLogs(
  programId,
  (logs, context) => {
    console.log('Program logs:', logs.logs);
    console.log('Signature:', logs.signature);
  },
  'confirmed'
);
```

### Signature Subscription

```typescript
const subscriptionId = connection.onSignature(
  signature,
  (result, context) => {
    if (result.err) {
      console.error('Transaction failed:', result.err);
    } else {
      console.log('Transaction confirmed at slot:', context.slot);
    }
  },
  'confirmed'
);
```

---

## Best Practices

1. **Use Appropriate Commitment Levels**
   - `confirmed` for most applications
   - `finalized` for high-value transactions
   - `processed` only for real-time UI updates

2. **Handle Errors Gracefully**
   - Implement retry logic
   - Use exponential backoff
   - Log errors for debugging

3. **Optimize RPC Usage**
   - Batch requests when possible
   - Cache results appropriately
   - Use WebSocket subscriptions for real-time data

4. **Monitor Rate Limits**
   - Track request counts
   - Implement rate limiting on client side
   - Use private RPC providers for production

5. **Validate Responses**
   - Check for null values
   - Verify data structure
   - Handle edge cases

---

## Additional RPC Methods

For a complete list of RPC methods, see:
- [Official Solana RPC Documentation](https://docs.solana.com/api/http)
- [Web3.js Connection API](https://solana-labs.github.io/solana-web3.js/classes/Connection.html)

---

## Source Attribution

This content is based on:
- **Solana RPC API Documentation**: https://docs.solana.com/api/http
- **Solana Web3.js Documentation**: https://solana-labs.github.io/solana-web3.js/
- **Solana Developer Documentation**: https://solana.com/docs/rpc

---

## Next Steps

Now that you understand the RPC API:

- [Exercises](../exercises/README.md) - Practice using RPC methods
- [Security](../../security/README.md) - Learn security best practices
- [DeFi](../../defi/README.md) - Build applications using RPC

---

## Additional Resources

- [Solana RPC API Reference](https://docs.solana.com/api/http) - Complete RPC method documentation
- [Web3.js Connection Class](https://solana-labs.github.io/solana-web3.js/classes/Connection.html) - TypeScript API reference
- [RPC Providers Comparison](https://solana.com/rpc) - List of public and private RPC providers
- [Solana Explorer](https://explorer.solana.com/) - Inspect transactions and accounts using RPC data

