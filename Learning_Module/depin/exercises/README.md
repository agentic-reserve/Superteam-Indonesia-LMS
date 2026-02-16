# DePIN Exercises

This section contains hands-on exercises to practice building DePIN (Decentralized Physical Infrastructure Networks) applications with Solana. Each exercise builds on concepts from the lessons and provides practical experience with hardware integration.

## Exercise Structure

Each exercise includes:
- **Objective**: What you'll build and learn
- **Prerequisites**: Required knowledge and hardware
- **Difficulty**: Beginner, Intermediate, or Advanced
- **Estimated Time**: How long the exercise typically takes
- **Instructions**: Step-by-step guidance
- **Validation Criteria**: How to verify your solution works
- **Hints**: Tips if you get stuck
- **Solution Reference**: Link to example implementation

## Hardware Requirements

### Minimal Setup (Exercises 1-3)
- Raspberry Pi 4 or 5
- LED and 220 ohm resistor
- Breadboard and jumper wires
- Internet connection

### Extended Setup (Exercises 4-6)
- All minimal setup components
- Additional sensors (temperature, motion, etc.)
- OLED display (optional)
- LoRaWAN sensor (for Exercise 5)

### Advanced Setup (Exercises 7-8)
- All extended setup components
- 5V water pump
- NPN transistor
- Power bank (optional)

## Exercises

### Exercise 1: LED Control via Blockchain (Beginner)

**Objective**: Create a Solana program that stores LED state and control an LED from a Raspberry Pi by listening to account changes.

**Prerequisites**:
- Completed [Raspberry Pi Integration](../02-raspberry-pi-integration/README.md) lesson
- Basic understanding of Anchor programs
- Raspberry Pi with LED connected to GPIO 18

**Estimated Time**: 2-3 hours

**Instructions**:

1. **Create Anchor Program**:
   - Initialize new Anchor project: `anchor init led-control`
   - Create a `LedState` account with a boolean `is_on` field
   - Implement `initialize` and `toggle` instructions
   - Use PDA with seed `"led-state"`

2. **Deploy Program**:
   - Build: `anchor build`
   - Deploy to devnet: `anchor deploy`
   - Note your program ID

3. **Create Raspberry Pi Listener**:
   - Set up Node.js project with Anchor and web3.js
   - Connect to Solana devnet
   - Fetch initial LED state from program
   - Listen for account changes using `connection.onAccountChange`
   - Control GPIO pin based on account state

4. **Test**:
   - Run listener script on Raspberry Pi
   - Call `toggle` instruction from another terminal
   - Verify LED turns on/off

**Validation Criteria**:
- ✅ Program deploys successfully
- ✅ LED reflects initial state from blockchain
- ✅ LED changes when program account is updated
- ✅ No errors in listener script logs

**Hints**:
- Use `anchor.web3.PublicKey.findProgramAddressSync()` to derive PDA
- Set commitment to `"processed"` for faster updates
- Remember to run listener with `npx ts-node` (not `sudo`)

**Solution Reference**: [led-switch example](https://github.com/solana-developers/solana-depin-examples/tree/main/led-switch)

---

### Exercise 2: Solana Pay LED Control (Beginner)

**Objective**: Create QR codes that control your LED using Solana Pay transaction requests.

**Prerequisites**:
- Completed Exercise 1
- Basic Next.js knowledge
- Mobile wallet with Solana Pay support

**Estimated Time**: 2-3 hours

**Instructions**:

1. **Create Next.js API**:
   - Initialize Next.js project: `npx create-next-app@latest`
   - Create `/api/transaction` endpoint
   - Handle GET request: return label and icon
   - Handle POST request: create transaction to toggle LED

2. **Generate QR Codes**:
   - Install `@solana/pay` package
   - Create page with two QR codes: "Turn On" and "Turn Off"
   - Use `createQR` and `encodeURL` from Solana Pay

3. **Make API Publicly Accessible**:
   - Install ngrok: `npm install -g ngrok`
   - Run: `ngrok http 3000`
   - Update QR code URLs to use ngrok URL

4. **Test**:
   - Scan QR code with mobile wallet
   - Approve transaction
   - Verify LED changes state

**Validation Criteria**:
- ✅ QR codes display correctly
- ✅ Wallet recognizes transaction request
- ✅ Transaction executes successfully
- ✅ LED changes state after confirmation

**Hints**:
- Transaction must be serialized without signatures
- Set `requireAllSignatures: false` when serializing
- Use devnet for testing (cheaper)

**Solution Reference**: [led-switch Solana Pay](https://github.com/solana-developers/solana-depin-examples/tree/main/led-switch/app)

---

### Exercise 3: Temperature Sensor Data Logger (Intermediate)

**Objective**: Read temperature data from a sensor and log it to a Solana program.

**Prerequisites**:
- Completed Exercise 1
- Temperature sensor (DHT11, DHT22, or DS18B20)
- Understanding of data anchoring concepts

**Estimated Time**: 3-4 hours

**Instructions**:

1. **Connect Temperature Sensor**:
   - Wire sensor to Raspberry Pi (VCC, GND, Data)
   - Install sensor library: `npm install node-dht-sensor`
   - Test reading: verify you can read temperature

2. **Create Anchor Program**:
   - Create `TemperatureLog` account
   - Store: device ID, timestamp, temperature, humidity
   - Implement `log_reading` instruction
   - Use PDA with seed `["temp-log", device_id]`

3. **Create Logger Script**:
   - Read sensor every 5 minutes
   - Submit reading to Solana program
   - Handle errors gracefully
   - Log to console and blockchain

4. **Add Data Visualization** (Optional):
   - Create web page to display readings
   - Fetch account data from Solana
   - Display as table or chart

**Validation Criteria**:
- ✅ Sensor readings are accurate
- ✅ Data is successfully written to Solana
- ✅ Timestamps are correct
- ✅ Script runs continuously without errors

**Hints**:
- Use `setInterval` for periodic readings
- Implement exponential backoff for RPC errors
- Consider batching readings to reduce costs
- Store temperature as integer (multiply by 100)

**Troubleshooting**:
- **Sensor not found**: Check wiring and GPIO pin number
- **Transaction fails**: Ensure wallet has SOL for fees
- **RPC errors**: Use rate limiting or dedicated RPC provider

---

### Exercise 4: Multi-Device Dashboard (Intermediate)

**Objective**: Create a dashboard that displays data from multiple IoT devices in real-time.

**Prerequisites**:
- Completed Exercise 3
- Multiple devices or simulated devices
- React or Next.js knowledge

**Estimated Time**: 4-5 hours

**Instructions**:

1. **Extend Program**:
   - Modify program to support multiple devices
   - Create device registry account
   - Store device metadata (name, location, type)

2. **Create Dashboard**:
   - Build React/Next.js app
   - Fetch all device accounts
   - Display device list with latest readings
   - Use WebSocket for real-time updates

3. **Add Features**:
   - Device status indicators (online/offline)
   - Historical data charts
   - Alert thresholds
   - Device filtering and search

4. **Deploy**:
   - Deploy dashboard to Vercel or similar
   - Make it publicly accessible

**Validation Criteria**:
- ✅ Dashboard displays all registered devices
- ✅ Real-time updates work correctly
- ✅ Historical data is accurate
- ✅ UI is responsive and user-friendly

**Hints**:
- Use `getProgramAccounts` to fetch all devices
- Implement pagination for large device lists
- Cache data to reduce RPC calls
- Use Chart.js or Recharts for visualizations

---

### Exercise 5: LoRaWAN Treasure Hunt (Advanced)

**Objective**: Create a treasure hunt game using LoRaWAN sensors and Solana Pay.

**Prerequisites**:
- Completed [LoRaWAN Networks](../03-lorawan-networks/README.md) lesson
- LoRaWAN door sensor (LDS02 or similar)
- Helium Console account
- Understanding of Solana Pay

**Estimated Time**: 6-8 hours

**Instructions**:

1. **Set Up LoRaWAN Sensor**:
   - Register device on Helium Console
   - Configure decoder function
   - Test sensor reports correctly

2. **Create Treasure Program**:
   - Create `Treasure` account with: location, is_found, finder
   - Implement `hide_treasure` (admin only)
   - Implement `find_treasure` (requires sensor open)
   - Store treasure metadata (description, reward)

3. **Create API**:
   - Endpoint to receive sensor data from Helium
   - Update treasure state when sensor opens
   - Generate Solana Pay QR code for claiming

4. **Create Game Interface**:
   - Map showing treasure locations
   - QR codes for each treasure
   - Leaderboard of finders
   - Treasure claim history

5. **Deploy and Test**:
   - Hide physical treasure with sensor
   - Test opening sensor updates state
   - Scan QR code to claim treasure
   - Verify reward is distributed

**Validation Criteria**:
- ✅ Sensor correctly reports open/close state
- ✅ Treasure can only be claimed when sensor is open
- ✅ Rewards are distributed correctly
- ✅ Multiple treasures can be tracked

**Hints**:
- Use geolocation API for treasure map
- Implement cooldown period to prevent spam
- Add NFT minting for unique treasure proofs
- Consider using Merkle tree for reward distribution

**Solution Reference**: [helium-lorawan-chest](https://github.com/solana-developers/solana-depin-examples/tree/main/helium-lorawan-chest)

---

### Exercise 6: Data Anchoring with Merkle Trees (Advanced)

**Objective**: Implement a cost-effective data anchoring system using Merkle trees for batch sensor uploads.

**Prerequisites**:
- Completed [Data Anchoring](../04-data-anchoring/README.md) lesson
- Multiple sensors or simulated data
- Understanding of Merkle trees

**Estimated Time**: 5-6 hours

**Instructions**:

1. **Create Batch Program**:
   - Create `DataBatch` account
   - Store: epoch, merkle_root, device_count, timestamp
   - Implement `anchor_batch` instruction
   - Implement `verify_reading` with Merkle proof

2. **Implement Merkle Tree**:
   - Install `merkletreejs` package
   - Create function to build tree from readings
   - Generate proofs for individual readings
   - Verify proofs against root

3. **Create Batch Uploader**:
   - Collect readings from multiple devices
   - Batch every hour (or configurable interval)
   - Build Merkle tree
   - Submit root to Solana
   - Store full data off-chain (IPFS or local)

4. **Create Verification Tool**:
   - Fetch batch from Solana
   - Retrieve full data from off-chain storage
   - Verify specific reading with Merkle proof
   - Display verification result

**Validation Criteria**:
- ✅ Merkle tree is built correctly
- ✅ Root is anchored on-chain
- ✅ Individual readings can be verified
- ✅ Cost is significantly lower than individual uploads

**Hints**:
- Use SHA-256 for hashing
- Sort leaves before building tree
- Store proof alongside off-chain data
- Test with small batches first

**Cost Comparison**:
- Individual uploads: 1000 readings × 0.000005 SOL = 0.005 SOL
- Batch upload: 1 transaction × 0.000005 SOL = 0.000005 SOL
- Savings: 99.9%!

---

### Exercise 7: Automated Drink Dispenser (Advanced)

**Objective**: Build a complete drink dispensing system with payment, delivery, and receipt tracking.

**Prerequisites**:
- Completed [Raspberry Pi Integration](../02-raspberry-pi-integration/README.md) lesson
- 5V water pump, NPN transistor, resistor
- Understanding of Solana Pay
- Basic electronics knowledge

**Estimated Time**: 8-10 hours

**Instructions**:

1. **Wire Pump Circuit**:
   - Connect pump to 5V power through transistor
   - Connect GPIO 23 to transistor base via resistor
   - Test pump activation with simple script

2. **Create Bar Program**:
   - Create `Receipts` account storing array of receipts
   - Implement `buy_drink` with payment transfer
   - Implement `mark_delivered` to update receipt
   - Track total drinks sold

3. **Create Raspberry Pi Dispenser**:
   - Listen for new receipts
   - Activate pump for configured duration
   - Mark receipt as delivered after dispensing
   - Handle errors (pump failure, etc.)

4. **Create Solana Pay Interface**:
   - Generate QR code for drink purchase
   - Display price and drink options
   - Show recent purchases
   - Admin panel for configuration

5. **Add Features**:
   - Multiple drink types with different prices
   - Adjustable dispense duration
   - Refund mechanism for failures
   - Sales analytics

**Validation Criteria**:
- ✅ Payment is received before dispensing
- ✅ Pump activates for correct duration
- ✅ Receipt is marked as delivered
- ✅ System handles errors gracefully

**Hints**:
- Test pump duration with water first
- Implement timeout for delivery confirmation
- Add manual override for testing
- Use burner wallet for Raspberry Pi

**Safety Notes**:
- Don't exceed GPIO current limits
- Use appropriate power supply for pump
- Add flyback diode for pump protection
- Keep electronics away from liquids

**Solution Reference**: [solana-bar](https://github.com/solana-developers/solana-depin-examples/tree/main/solana-bar)

---

### Exercise 8: Reward Distribution System (Advanced)

**Objective**: Create a complete reward distribution system for IoT devices based on data contributions.

**Prerequisites**:
- Completed [Data Anchoring](../04-data-anchoring/README.md) lesson
- Multiple devices or simulated data
- Understanding of token programs

**Estimated Time**: 8-10 hours

**Instructions**:

1. **Create Reward Token**:
   - Create SPL token for rewards
   - Mint initial supply
   - Create token accounts for devices

2. **Create Reward Program**:
   - Create `RewardEpoch` account
   - Store: epoch number, merkle_root, total_rewards
   - Implement `anchor_rewards` (admin only)
   - Implement `claim_reward` with Merkle proof verification

3. **Implement Reward Calculator**:
   - Define reward formula (data points, quality, uptime)
   - Calculate rewards for each device
   - Build Merkle tree of rewards
   - Anchor root on-chain

4. **Create Claim Interface**:
   - Web app for devices to claim rewards
   - Display available rewards
   - Generate Merkle proof
   - Submit claim transaction

5. **Add Analytics**:
   - Total rewards distributed
   - Top contributing devices
   - Reward history
   - Device performance metrics

**Validation Criteria**:
- ✅ Rewards are calculated correctly
- ✅ Merkle proofs verify successfully
- ✅ Tokens are transferred on claim
- ✅ Double-claiming is prevented

**Hints**:
- Mark claims in program to prevent double-claiming
- Use bitmap for efficient claim tracking
- Implement reward vesting for long-term incentives
- Add slashing for malicious devices

**Extensions**:
- Add staking mechanism for devices
- Implement governance for reward parameters
- Create NFT badges for top contributors
- Add referral rewards for device onboarding

---

## Troubleshooting Guide

### Hardware Issues

**LED not working**:
- Check polarity (long leg to GPIO)
- Verify resistor value (220-330 ohm)
- Test GPIO with Python script
- Check wiring connections

**Sensor not reading**:
- Verify power supply (3.3V or 5V)
- Check data pin connection
- Install correct library
- Test with example code

**Pump not activating**:
- Check transistor orientation
- Verify power supply voltage
- Test GPIO signal with LED
- Check pump polarity

### Software Issues

**Transaction fails**:
- Check wallet has SOL for fees
- Verify program ID is correct
- Check account derivation
- Review program logs

**WebSocket disconnects**:
- Implement reconnection logic
- Use exponential backoff
- Check network stability
- Consider dedicated RPC provider

**Permission errors**:
- Don't use sudo with Node.js
- Fix directory permissions
- Add user to gpio group
- Check file ownership

### Program Issues

**Account not found**:
- Verify PDA derivation
- Check seeds match program
- Ensure account is initialized
- Verify program is deployed

**Instruction fails**:
- Check account constraints
- Verify signer permissions
- Review error logs
- Test with Anchor tests

## Additional Resources

### Documentation
- [Solana DePIN Examples](https://github.com/solana-developers/solana-depin-examples)
- [Raspberry Pi GPIO](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html)
- [Anchor Framework](https://www.anchor-lang.com/)
- [Solana Pay](https://docs.solanapay.com/)

### Hardware Suppliers
- [Adafruit](https://www.adafruit.com/)
- [SparkFun](https://www.sparkfun.com/)
- [Amazon](https://www.amazon.com/) - Search "Raspberry Pi starter kit"

### Community
- [Solana Discord](https://discord.gg/solana) - #depin channel
- [Solana Stack Exchange](https://solana.stackexchange.com/)
- [Helium Discord](https://discord.gg/helium)

## Next Steps

After completing these exercises:
1. Build your own unique DePIN application
2. Explore other sensor types (GPS, air quality, etc.)
3. Deploy to mainnet for production use
4. Share your project with the community
5. Contribute examples back to the repository

---

**Happy building!** Remember, the best way to learn is by doing. Start with the beginner exercises and work your way up. Don't hesitate to ask for help in the community channels.

## Source Attribution

Exercises designed based on examples from:
- [solana-depin-examples](https://github.com/solana-developers/solana-depin-examples) - Official Solana DePIN examples repository
