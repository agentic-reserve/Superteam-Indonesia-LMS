# Data Anchoring: Scalable IoT Data Storage on Solana

This lesson explores data anchoring patterns for storing IoT device data on Solana in a cost-effective and scalable way. You'll learn how to batch upload sensor readings, verify data integrity, and build production-ready DePIN applications.

## The Data Storage Challenge

IoT devices generate massive amounts of data:
- A temperature sensor reporting every minute: 1,440 readings/day
- 1,000 sensors: 1.44 million readings/day
- Direct on-chain storage: ~$7,200/day in transaction fees

**The problem**: Storing every reading directly on-chain is prohibitively expensive.

**The solution**: Data anchoring - store data off-chain, anchor cryptographic proofs on-chain.

## What is Data Anchoring?

Data anchoring is a technique where:
1. **Large datasets** are stored off-chain (IPFS, Arweave, centralized storage)
2. **Cryptographic proofs** (hashes, Merkle roots) are stored on-chain
3. **Anyone can verify** data integrity by comparing off-chain data with on-chain proofs

### Benefits

- **Cost-effective**: One transaction can anchor thousands of data points
- **Scalable**: No blockchain bloat from large datasets
- **Verifiable**: Cryptographic proofs ensure data hasn't been tampered with
- **Flexible**: Store any data format off-chain

### Trade-offs

- **Availability**: Off-chain data must be accessible
- **Latency**: Slight delay between data generation and anchoring
- **Complexity**: Requires off-chain infrastructure

## Data Anchoring Patterns

### Pattern 1: Simple Hash Anchoring

Store a hash of the data on-chain:

```typescript
// Off-chain: Store full data
const sensorData = {
  deviceId: "sensor-001",
  timestamp: 1234567890,
  temperature: 22.5,
  humidity: 65,
};

// On-chain: Store only the hash
const dataHash = sha256(JSON.stringify(sensorData));

await program.methods
  .anchorData(dataHash)
  .accounts({ dataAccount: dataPDA })
  .rpc();
```

**Verification**:
```typescript
// Fetch data from off-chain storage
const fetchedData = await fetchFromIPFS(cid);

// Compute hash
const computedHash = sha256(JSON.stringify(fetchedData));

// Compare with on-chain hash
const onChainHash = await program.account.dataAccount.fetch(dataPDA);
assert(computedHash === onChainHash.hash);
```

**Use case**: Single device, infrequent updates

### Pattern 2: Merkle Tree Anchoring

Batch multiple data points into a Merkle tree:

```typescript
// Off-chain: Batch sensor readings
const readings = [
  { deviceId: "sensor-001", temp: 22.5, time: 1000 },
  { deviceId: "sensor-002", temp: 23.1, time: 1000 },
  { deviceId: "sensor-003", temp: 21.8, time: 1000 },
  // ... 1000 more readings
];

// Build Merkle tree
const leaves = readings.map(r => sha256(JSON.stringify(r)));
const merkleTree = new MerkleTree(leaves, sha256);
const merkleRoot = merkleTree.getRoot();

// On-chain: Store only the root
await program.methods
  .anchorBatch(merkleRoot, readings.length)
  .accounts({ batchAccount: batchPDA })
  .rpc();
```

**Verification**:
```typescript
// Verify specific reading is in batch
const reading = readings[42];
const leaf = sha256(JSON.stringify(reading));
const proof = merkleTree.getProof(leaf);

// Verify proof against on-chain root
const isValid = merkleTree.verify(proof, leaf, onChainRoot);
```

**Use case**: Multiple devices, batch uploads, reward distribution

### Pattern 3: Blob Storage with Metadata

Store large blobs with on-chain metadata:

```typescript
// Off-chain: Upload blob to storage
const blob = {
  epoch: 1042,
  location: "Zug, Switzerland",
  devices: [/* 1000 device records */],
  totalReward: "100.5",
  merkleRoot: "abc123...",
  proof: "zk_proof_data",
};

const cid = await uploadToIPFS(blob);

// On-chain: Store metadata + CID
await program.methods
  .anchorBlob({
    cid: cid,
    epoch: 1042,
    deviceCount: 1000,
    totalReward: new BN(100_500_000_000), // 100.5 tokens
    merkleRoot: Buffer.from("abc123..."),
  })
  .accounts({ blobAccount: blobPDA })
  .rpc();
```

**Use case**: Large datasets, periodic snapshots, reward epochs

## Termina Data Anchor

Termina provides a production-ready data anchoring solution for DePIN networks.

### What is Termina Data Anchor?

A Solana program and SDK that:
- Accepts structured data blobs (JSON, binary)
- Stores them on-chain efficiently
- Provides CLI and Rust SDK for uploads
- Supports verification and retrieval

### Key Features

- **No custom program needed**: Use Termina's deployed program
- **High throughput**: Optimized for batch uploads
- **Cost-effective**: Efficient data encoding
- **Verifiable**: Built-in integrity checks
- **Production-ready**: Used by real DePIN networks

### Installation

```bash
# Install Termina CLI
cargo install nitro-da-cli

# Verify installation
nitro-da-cli --version
```

### Example: Reward Distribution

Let's anchor a batch of device rewards:

#### 1. Prepare Data

```json
// rewards.json
{
  "epoch": 1042,
  "location": "Zug, Switzerland",
  "devices": [
    {
      "device_id": "sensor-001",
      "ip": "192.168.0.101",
      "data_points": 340,
      "co2_ppm": 417,
      "reward": "0.03"
    },
    {
      "device_id": "sensor-002",
      "ip": "192.168.0.102",
      "data_points": 327,
      "co2_ppm": 419,
      "reward": "0.02"
    }
  ],
  "total_reward": "0.05",
  "merkle_root": "abc123xyz456",
  "proof": "mock_zk_proof_here"
}
```

#### 2. Upload Blob

```bash
#!/bin/bash
# upload_blob.sh

nitro-da-cli \
  --program-id "2RWsr92iL39YCLiZu7dZ5hron4oexEMbgWDg35v5U5tH" \
  --namespace "nitro" \
  blob submit \
  --file rewards.json \
  --keypair ~/.config/solana/id.json

# Output: Blob signatures
# sig1: 5Xj7k...
# sig2: 9Qm3n...
```

#### 3. Fetch Blob

```bash
nitro-da-cli \
  --program-id "2RWsr92iL39YCLiZu7dZ5hron4oexEMbgWDg35v5U5tH" \
  --namespace "nitro" \
  -o json \
  blob fetch <sig1> <sig2> \
  | jq -r '.[].data' | xxd -r -p
```

#### 4. Verify Blob

```bash
#!/bin/bash
# verify_blob.sh

BLOB_DATA=$(nitro-da-cli \
  --program-id "2RWsr92iL39YCLiZu7dZ5hron4oexEMbgWDg35v5U5tH" \
  --namespace "nitro" \
  -o json \
  blob fetch $@ \
  | jq -r '.[].data' | xxd -r -p)

# Verify required fields exist
echo "$BLOB_DATA" | jq -e '.devices[].device_id' > /dev/null || exit 1
echo "$BLOB_DATA" | jq -e '.devices[].reward' > /dev/null || exit 1
echo "$BLOB_DATA" | jq -e '.merkle_root' > /dev/null || exit 1
echo "$BLOB_DATA" | jq -e '.proof' > /dev/null || exit 1

echo "✅ Blob verification passed"
```

### Rust SDK Usage

```rust
use nitro_da_client::NitroClient;
use solana_sdk::signature::Keypair;

#[tokio::main]
async fn main() {
    let keypair = Keypair::from_bytes(&keypair_bytes).unwrap();
    let client = NitroClient::new(
        "https://api.mainnet-beta.solana.com",
        &keypair,
    );
    
    // Upload blob
    let data = serde_json::to_vec(&rewards_data).unwrap();
    let signatures = client
        .submit_blob("nitro", &data)
        .await
        .unwrap();
    
    println!("Blob uploaded: {:?}", signatures);
    
    // Fetch blob
    let fetched = client
        .fetch_blob(&signatures)
        .await
        .unwrap();
    
    let rewards: RewardsData = serde_json::from_slice(&fetched).unwrap();
    println!("Fetched {} device rewards", rewards.devices.len());
}
```

## Production DePIN Applications

### 1. Solana Bar: Decentralized Drink Dispenser

A water pump controlled by Solana Pay that dispenses drinks when payment is received.

**Architecture**:
```
User scans QR → Solana Pay → Payment received → Receipt created
                                                       ↓
                                              Raspberry Pi listens
                                                       ↓
                                              Pump activates
                                                       ↓
                                              Mark as delivered
```

**Key Components**:

**Anchor Program**:
```rust
#[program]
pub mod solana_bar {
    use super::*;
    const SHOT_PRICE: u64 = LAMPORTS_PER_SOL / 10; // 0.1 SOL

    pub fn buy_shot(ctx: Context<BuyShot>) -> Result<()> {
        // Add receipt
        let receipt_id = ctx.accounts.receipts.total_shots_sold;
        ctx.accounts.receipts.receipts.push(Receipt {
            buyer: *ctx.accounts.signer.key,
            was_delivered: false,
            price: SHOT_PRICE,
            timestamp: Clock::get()?.unix_timestamp,
            receipt_id,
        });
        
        // Increment counter
        ctx.accounts.receipts.total_shots_sold += 1;
        
        // Transfer payment
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.signer.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                },
            ),
            SHOT_PRICE,
        )?;
        
        Ok(())
    }

    pub fn mark_shot_as_delivered(
        ctx: Context<MarkShotAsDelivered>,
        receipt_id: u64
    ) -> Result<()> {
        for receipt in &mut ctx.accounts.receipts.receipts {
            if receipt.receipt_id == receipt_id {
                receipt.was_delivered = true;
            }
        }
        Ok(())
    }
}
```

**Raspberry Pi Script**:
```typescript
// Listen for new receipts
connection.onAccountChange(receiptsPDA, async (account) => {
  const decoded = program.coder.accounts.decode("receipts", account.data);
  
  // Find undelivered receipts
  for (const receipt of decoded.receipts) {
    if (!receipt.wasDelivered) {
      await dispenseDrink(receipt);
      break;
    }
  }
});

async function dispenseDrink(receipt) {
  console.log("Dispensing drink for receipt:", receipt.receiptId);
  
  // Activate pump
  PUMP.writeSync(1);
  await sleep(3000); // 3 seconds
  PUMP.writeSync(0);
  
  // Mark as delivered
  await program.methods
    .markShotAsDelivered(receipt.receiptId)
    .accounts({ receipts: receiptsPDA, signer: keypair.publicKey })
    .rpc();
}
```

**Cost Analysis**:
- Account creation: 0.002 SOL (one-time)
- Per drink: 0.000005 SOL transaction fee
- 100 drinks/day: 0.0005 SOL/day (~$0.07/day)

### 2. Reward Distribution for Hardware Devices

Automatically reward IoT devices based on data contributions.

**Architecture**:
```
Devices → Submit data → Oracle validates → Compute rewards
                                                  ↓
                                          Anchor rewards on-chain
                                                  ↓
                                          Devices claim rewards
```

**Reward Calculation**:
```typescript
interface DeviceReward {
  deviceId: string;
  dataPoints: number;
  quality: number; // 0-100
  uptime: number; // percentage
  reward: number; // tokens
}

function calculateReward(device: DeviceMetrics): number {
  const baseReward = 0.01; // tokens per data point
  const qualityMultiplier = device.quality / 100;
  const uptimeMultiplier = device.uptime / 100;
  
  return device.dataPoints * baseReward * qualityMultiplier * uptimeMultiplier;
}

// Batch rewards for epoch
const rewards = devices.map(d => ({
  deviceId: d.id,
  dataPoints: d.dataPoints,
  quality: d.quality,
  uptime: d.uptime,
  reward: calculateReward(d),
}));

// Anchor rewards
const merkleTree = buildMerkleTree(rewards);
await anchorRewards(merkleTree.root, rewards.length);
```

**Claim Process**:
```rust
pub fn claim_reward(
    ctx: Context<ClaimReward>,
    reward_amount: u64,
    proof: Vec<[u8; 32]>,
) -> Result<()> {
    // Verify Merkle proof
    let leaf = hash_reward_data(
        ctx.accounts.device.key(),
        reward_amount,
    );
    
    require!(
        verify_merkle_proof(
            &proof,
            ctx.accounts.epoch.merkle_root,
            leaf,
        ),
        ErrorCode::InvalidProof
    );
    
    // Transfer reward
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.reward_vault.to_account_info(),
                to: ctx.accounts.device_token_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        ),
        reward_amount,
    )?;
    
    Ok(())
}
```

## Best Practices

### Data Structure Design

**Good**:
```json
{
  "version": "1.0",
  "epoch": 1042,
  "timestamp": 1234567890,
  "devices": [
    { "id": "sensor-001", "value": 22.5 }
  ],
  "metadata": {
    "merkle_root": "abc123",
    "signature": "xyz789"
  }
}
```

**Bad**:
```json
{
  "sensor-001-temp": 22.5,
  "sensor-002-temp": 23.1,
  // Unstructured, hard to parse
}
```

### Batching Strategy

**Frequency vs Cost**:
- Every minute: 1,440 transactions/day = $0.007/day
- Every hour: 24 transactions/day = $0.00012/day
- Every day: 1 transaction/day = $0.000005/day

**Choose based on**:
- Data freshness requirements
- Number of devices
- Budget constraints

### Verification

**Always verify**:
- Merkle proofs before accepting claims
- Data signatures from trusted sources
- Timestamp ranges (prevent replay attacks)
- Data format and schema

### Storage Options

| Option | Cost | Availability | Decentralization |
|--------|------|--------------|------------------|
| IPFS | Low | Medium | High |
| Arweave | Medium | High | High |
| AWS S3 | Low | High | Low |
| Termina | Low | High | Medium |

## Cost Optimization

### Technique 1: Compression

```typescript
// Before: 1000 bytes
const data = {
  deviceId: "sensor-001",
  temperature: 22.5,
  humidity: 65,
  // ... more fields
};

// After: 100 bytes
const compressed = {
  d: "s001",
  t: 225, // 22.5 * 10
  h: 65,
};
```

### Technique 2: Delta Encoding

```typescript
// Store only changes
const baseline = { temp: 22.5, humidity: 65 };
const updates = [
  { time: 1000, temp: +0.2 }, // 22.7
  { time: 2000, humidity: -2 }, // 63
];
```

### Technique 3: Aggregation

```typescript
// Instead of 1440 readings/day
const hourlyAggregates = {
  hour: 0,
  min: 22.1,
  max: 22.9,
  avg: 22.5,
  count: 60,
};
```

## Troubleshooting

### Blob Upload Fails

**Check**:
- Wallet has sufficient SOL for transaction
- Blob size is within limits
- Network connection is stable
- Program ID is correct

### Verification Fails

**Check**:
- Merkle proof is correctly generated
- Leaf hash matches on-chain data
- Proof array is in correct order
- Root hash matches on-chain root

### High Costs

**Optimize**:
- Increase batch size
- Reduce update frequency
- Use compression
- Store less data on-chain

## Next Steps

- Complete the [Exercises](../exercises/README.md) to practice data anchoring
- Explore [Termina Documentation](https://docs.termina.technology/)
- Build a multi-device reward system
- Integrate with your own DePIN network

## Additional Resources

- [Termina Data Anchor Docs](https://docs.termina.technology/documentation/network-extension-stack/ne-modules/data-anchor/using-the-data-anchor)
- [Merkle Tree Explanation](https://en.wikipedia.org/wiki/Merkle_tree)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [Arweave Documentation](https://docs.arweave.org/)

## Source Attribution

Content extracted and adapted from:
- [Termina Data Anchor Example](https://github.com/solana-developers/solana-depin-examples/tree/main/termina-data-anchor) - solana-depin-examples repository
- [Solana Bar Example](https://github.com/solana-developers/solana-depin-examples/tree/main/solana-bar) - solana-depin-examples repository
- [Termina Documentation](https://docs.termina.technology/)

---

**Ready to scale?** Start with simple hash anchoring, then progress to Merkle trees and production tools like Termina Data Anchor!
