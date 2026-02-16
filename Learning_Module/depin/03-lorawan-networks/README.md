# LoRaWAN Networks: Long-Range IoT Communication

This lesson explores LoRaWAN (Long Range Wide Area Network) technology and how to integrate it with Solana through the Helium network. You'll learn how to build DePIN applications that communicate over long distances with minimal power consumption.

## What is LoRaWAN?

LoRaWAN is a low-power, wide-area networking protocol designed for wireless battery-operated devices in regional, national, or global networks. It's ideal for IoT applications that need:

- **Long range**: 2-15 km in urban areas, up to 45 km in rural areas
- **Low power**: Devices can run for years on a single battery
- **Low cost**: Inexpensive sensors and gateways
- **Secure**: End-to-end AES-128 encryption
- **Scalable**: Thousands of devices per gateway

### LoRaWAN vs Other Protocols

| Feature | LoRaWAN | WiFi | Bluetooth | Cellular |
|---------|---------|------|-----------|----------|
| Range | 2-15 km | 50-100 m | 10-100 m | Wide area |
| Power | Very low | High | Low | High |
| Bandwidth | 0.3-50 kbps | 150+ Mbps | 1-3 Mbps | 1-100 Mbps |
| Cost | Low | Medium | Low | High |
| Battery Life | Years | Hours | Days | Days |

## LoRaWAN Architecture

### Network Components

```
Device (Sensor) → Gateway → Network Server → Application Server
                                                      ↓
                                              Solana Blockchain
```

1. **End Devices**: Sensors or actuators with LoRa radios
2. **Gateways**: Receive signals from devices and forward to network server
3. **Network Server**: Manages network, handles routing and security
4. **Application Server**: Processes device data and integrates with applications

### Helium Network

Helium is a decentralized wireless network powered by Solana that provides LoRaWAN coverage:

- **Decentralized**: Anyone can deploy a hotspot and earn tokens
- **Global coverage**: Thousands of hotspots worldwide
- **Solana-powered**: Uses Solana blockchain for proof-of-coverage and rewards
- **Low cost**: Pay-per-use pricing for data transmission

## LoRaWAN Device Classes

### Class A (All devices)
- **Bidirectional**: Can send and receive
- **Lowest power**: Only listens after transmitting
- **Use case**: Battery-powered sensors

### Class B (Beacon)
- **Scheduled receive**: Opens receive windows at scheduled times
- **Medium power**: More receive opportunities
- **Use case**: Actuators that need timely commands

### Class C (Continuous)
- **Always listening**: Except when transmitting
- **Highest power**: Continuous receive
- **Use case**: Mains-powered devices, actuators

## Setting Up a LoRaWAN Device

### Hardware: LDS02 Door Sensor

The LDS02 is a popular LoRaWAN magnetic door sensor:

**Features**:
- Detects door/window open/close
- Battery-powered (2x AAA, 2-3 years)
- IP65 waterproof
- Configurable reporting intervals
- Supports Helium network

**Where to buy**: Search for "LDS02 LoRaWAN door sensor" on Amazon, AliExpress, or electronics distributors.

### Device Registration

Every LoRaWAN device has three identifiers (printed on label):

1. **Device EUI**: Unique device identifier (64-bit)
2. **App EUI**: Application identifier (64-bit)
3. **App Key**: Encryption key (128-bit)

### Helium Console Setup

1. **Create Account**: Visit [console.helium.com](https://console.helium.com)

2. **Add Device**:
   - Navigate to "Devices" → "Add Device"
   - Enter Device EUI, App EUI, and App Key from device label
   - Give device a name (e.g., "Treasure Chest Sensor")
   - Save device

3. **Add Decoder Function**:
   - Navigate to "Functions" → "Add Function"
   - Select "Decoder"
   - Name it (e.g., "LDS02 Decoder")
   - Paste decoder code (see below)

4. **Create Integration**:
   - Navigate to "Integrations" → "Add Integration"
   - Select "HTTP"
   - Enter your API endpoint URL
   - Save integration

5. **Connect Flow**:
   - Navigate to "Flows"
   - Drag device → decoder → integration
   - Connect them in sequence
   - Save flow

### LDS02 Decoder Function

```javascript
// Decoder for LDS02 door sensor
// Source: https://github.com/dragino/dragino-end-node-decoder/tree/main/LDS02

function Decoder(bytes, port) {
  var decoded = {};
  
  if (port === 10) {
    // Parse battery voltage
    decoded.BAT_V = ((bytes[0] << 8 | bytes[1]) & 0x3FFF) / 1000;
    
    // Parse door status
    decoded.DOOR_OPEN_STATUS = (bytes[0] & 0x80) ? 1 : 0;
    decoded.DOOR_OPEN_TIMES = (bytes[2] << 16 | bytes[3] << 8 | bytes[4]);
    decoded.LAST_DOOR_OPEN_DURATION = (bytes[5] << 16 | bytes[6] << 8 | bytes[7]);
    decoded.ALARM = bytes[8];
    decoded.MOD = bytes[9];
  }
  
  return decoded;
}
```

## Helium Treasure Chest Example

Let's build a treasure chest that only allows looting when physically opened, verified via LoRaWAN.

### Architecture

```
Door Sensor → Helium Gateway → Helium Console → Your API
                                                      ↓
                                              Update Solana Program
                                                      ↓
                                              Chest Account (is_open: bool)
                                                      ↓
                                              Solana Pay QR Code
                                                      ↓
                                              Loot Transaction (only if open)
```

### The Anchor Program

```rust
use anchor_lang::prelude::*;
use solana_program::pubkey;

declare_id!("2UYaB7aU7ZPA5LEQh3ZtWzC1MqgLkEJ3nBKebGUrFU3f");

const ADMIN_PUBKEY: Pubkey = pubkey!("LorBisZjmXHAdUnAWKfBiVh84yaxGVF2WY6kjr7AQu5");

#[error_code]
pub enum LorawanChestError {
    ChestIsClosed = 100,
}

#[program]
pub mod lorawan_chest {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.lorawan_chest.is_open = false;
        Ok(())
    }

    // Called by API when sensor reports door state
    pub fn switch(ctx: Context<Switch>, is_open: bool) -> Result<()> {
        ctx.accounts.lorawan_chest.is_open = is_open;
        Ok(())
    }

    // Called by user via Solana Pay
    pub fn loot(ctx: Context<Loot>) -> Result<()> {
        if !ctx.accounts.lorawan_chest.is_open {
            return Err(LorawanChestError::ChestIsClosed.into());
        }
        
        msg!("Chest looted!");
        // Could mint NFT, transfer tokens, etc.
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 8,
        seeds = [b"lorawan_chest"],
        bump
    )]
    pub lorawan_chest: Account<'info, LorawanChest>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Switch<'info> {
    #[account(mut, seeds = [b"lorawan_chest"], bump)]
    pub lorawan_chest: Account<'info, LorawanChest>,
    #[account(mut, address = ADMIN_PUBKEY)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct Loot<'info> {
    #[account(mut, seeds = [b"lorawan_chest"], bump)]
    pub lorawan_chest: Account<'info, LorawanChest>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[account]
pub struct LorawanChest {
    pub is_open: bool,
}
```

### API Endpoint (Sensor Downlink)

This API receives data from Helium Console and updates the Solana program:

```typescript
// pages/api/sensor-downlink.ts
import { Connection, Keypair, Transaction, clusterApiUrl } from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { IDL } from "./lorawan_chest";

const CONNECTION = new Connection(clusterApiUrl("devnet"));
const PROGRAM_ID = "2UYaB7aU7ZPA5LEQh3ZtWzC1MqgLkEJ3nBKebGUrFU3f";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  
  console.log("Sensor data received:", req.body);
  
  // Extract door status from decoded payload
  const doorStatus = req.body.decoded.payload.DOOR_OPEN_STATUS;
  const isOpen = doorStatus === "1" || doorStatus === 1;
  
  console.log("Door is open:", isOpen);
  
  // Load admin keypair (stored securely in environment)
  const burner = JSON.parse(process.env.BURNER_KEY ?? "");
  const burnerKeypair = Keypair.fromSecretKey(Uint8Array.from(burner));
  
  // Create transaction to update chest state
  const program = new Program(IDL, PROGRAM_ID, { connection: CONNECTION });
  
  const [chestPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("lorawan_chest")],
    program.programId
  );
  
  const tx = await program.methods
    .switch(isOpen)
    .accounts({
      lorawanChest: chestPDA,
      authority: burnerKeypair.publicKey,
    })
    .transaction();
  
  tx.feePayer = burnerKeypair.publicKey;
  tx.recentBlockhash = (await CONNECTION.getLatestBlockhash()).blockhash;
  
  const signature = await CONNECTION.sendTransaction(tx, [burnerKeypair]);
  
  console.log("Transaction signature:", signature);
  
  res.status(200).json({
    message: isOpen ? "Door opened" : "Door closed",
    signature,
  });
}
```

### Solana Pay Loot Transaction

```typescript
// pages/api/loot-transaction.ts
export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      label: "Loot Treasure Chest",
      icon: "https://your-domain.com/chest-icon.png",
    });
  }
  
  if (req.method === "POST") {
    const { account } = req.body;
    const sender = new PublicKey(account);
    
    const program = new Program(IDL, PROGRAM_ID, { connection: CONNECTION });
    
    const [chestPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("lorawan_chest")],
      program.programId
    );
    
    // Check if chest is open
    const chestAccount = await program.account.lorawanChest.fetch(chestPDA);
    
    if (!chestAccount.isOpen) {
      return res.status(400).json({
        error: "Chest is closed! Open it physically to loot.",
      });
    }
    
    // Create loot transaction
    const tx = new Transaction();
    
    const lootIx = await program.methods
      .loot()
      .accounts({
        lorawanChest: chestPDA,
        authority: sender,
      })
      .instruction();
    
    tx.add(lootIx);
    tx.feePayer = sender;
    tx.recentBlockhash = (await CONNECTION.getLatestBlockhash()).blockhash;
    
    const serialized = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });
    
    return res.status(200).json({
      transaction: serialized.toString("base64"),
      message: "Loot the treasure!",
    });
  }
}
```

## Data Flow Example

### Uplink (Device → Blockchain)

1. **Door opens** → Sensor detects magnetic field change
2. **Sensor transmits** → LoRaWAN packet sent to nearby gateway
3. **Gateway forwards** → Packet sent to Helium Network Server
4. **Helium Console** → Decodes packet, calls your API
5. **Your API** → Sends transaction to Solana program
6. **Program updates** → `is_open = true` in chest account
7. **QR code active** → Users can now scan to loot

### Downlink (Blockchain → Device)

LoRaWAN also supports downlink messages (commands to devices):

```typescript
// Send command to device
const downlinkUrl = req.body.downlink_url; // Provided by Helium

await fetch(downlinkUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    payload_raw: Buffer.from([0x01, 0x02]).toString("base64"),
    port: 10,
    confirmed: false,
  }),
});
```

**Use cases**:
- Unlock a door remotely
- Change sensor reporting interval
- Trigger an alarm
- Update device configuration

## LoRaWAN Best Practices

### Power Optimization

**Transmission Strategy**:
- Send data only when state changes (not on interval)
- Use adaptive data rate (ADR) to optimize power
- Batch multiple readings if possible
- Use confirmed uplinks sparingly (they consume more power)

**Example**: Door sensor
- ❌ Bad: Report every 5 minutes (288 transmissions/day)
- ✅ Good: Report only on open/close (2-20 transmissions/day)

### Network Coverage

**Check Coverage**:
- Visit [explorer.helium.com](https://explorer.helium.com) to see hotspot locations
- Test signal strength at your deployment location
- Consider deploying your own hotspot if coverage is poor

**Signal Strength**:
- RSSI > -120 dBm: Good
- RSSI -120 to -130 dBm: Acceptable
- RSSI < -130 dBm: Poor (may need closer gateway)

### Security

**Device Security**:
- Keep App Key secret (never expose in client code)
- Use unique keys per device
- Implement rate limiting on API endpoints
- Validate all sensor data ranges

**API Security**:
- Use HTTPS for all endpoints
- Implement authentication (API keys, signatures)
- Validate Helium Console requests
- Rate limit to prevent abuse

## Cost Analysis

### Helium Network Costs

**Data Credits (DC)**:
- 1 DC = $0.00001 USD
- 24-byte packet = 1 DC
- Typical sensor: 10-50 DC per day = $0.0001-0.0005/day
- Monthly cost: ~$0.003-0.015 per device

**Comparison**:
- Cellular IoT: $2-10/month per device
- WiFi: Electricity + internet costs
- LoRaWAN: $0.003-0.015/month per device

### Solana Transaction Costs

- Update chest state: ~0.000005 SOL per update
- If door opens 10 times/day: 0.00005 SOL/day (~$0.007/day)
- Monthly: ~$0.21 per device

**Total monthly cost**: ~$0.22 per device (LoRaWAN + Solana)

## Real-World Applications

### 1. Smart Parking
- Sensors detect parking spot occupancy
- Report to Solana when status changes
- Users pay with tokens to reserve spots
- Decentralized parking management

### 2. Environmental Monitoring
- Temperature, humidity, air quality sensors
- Long-range deployment in forests, cities
- Reward data contributors with tokens
- Public, verifiable environmental data

### 3. Asset Tracking
- Track shipping containers, vehicles, equipment
- GPS + LoRaWAN for location updates
- Immutable tracking history on Solana
- Automated insurance claims

### 4. Smart Agriculture
- Soil moisture, temperature sensors
- Automated irrigation control
- Reward farmers for sustainable practices
- Transparent supply chain data

## Troubleshooting

### Device Not Connecting

**Check**:
- Device has batteries and LED blinks
- Device is within range of Helium hotspot (check explorer)
- Device EUI, App EUI, App Key are correct in console
- Device is using correct frequency plan for region

**Debug**:
- Check Helium Console "Event Log" for device
- Verify decoder function is working
- Test with device close to known hotspot

### API Not Receiving Data

**Check**:
- API endpoint is publicly accessible (use ngrok for testing)
- Integration is connected in Flows
- Decoder function is returning correct format
- Check API logs for errors

**Debug**:
- Use Helium Console "Debug" mode to see raw packets
- Test API endpoint with curl/Postman
- Verify decoder output matches expected format

### Chest Always Shows Closed

**Check**:
- Sensor is reporting correct status (check console logs)
- API is successfully sending transactions
- Admin keypair has SOL for transaction fees
- Program address is correct

## Next Steps

- Learn about [Data Anchoring](../04-data-anchoring/README.md) for batch sensor data
- Explore other LoRaWAN sensors (temperature, GPS, etc.)
- Deploy your own Helium hotspot
- Build a multi-sensor DePIN network

## Additional Resources

- [Helium Documentation](https://docs.helium.com/)
- [LoRa Alliance](https://lora-alliance.org/)
- [Dragino Sensor Decoders](https://github.com/dragino/dragino-end-node-decoder)
- [Helium Coverage Map](https://explorer.helium.com/)

## Source Attribution

Content extracted and adapted from:
- [Helium LoRaWAN Chest Example](https://github.com/solana-developers/solana-depin-examples/tree/main/helium-lorawan-chest) - solana-depin-examples repository
- [LDS02 Sensor Documentation](http://wiki.dragino.com/xwiki/bin/view/Main/User%20Manual%20for%20LoRaWAN%20End%20Nodes/LDS02%20-%20LoRaWAN%20Door%20Sensor%20User%20Manual/)

---

**Ready to build?** Start by registering a LoRaWAN device on Helium Console, then integrate it with your Solana program!
