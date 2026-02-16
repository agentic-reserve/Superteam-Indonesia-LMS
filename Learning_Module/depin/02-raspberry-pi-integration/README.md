# Raspberry Pi Integration with Solana

This lesson provides hands-on guidance for connecting Raspberry Pi devices to Solana programs. You'll learn how to control LEDs, read sensors, and create interactive hardware applications controlled by blockchain transactions.

## Overview

By the end of this lesson, you'll be able to:
- Set up a Raspberry Pi for Solana development
- Control GPIO pins from Node.js/TypeScript
- Create Solana programs that store hardware state
- Use Solana Pay to trigger hardware actions
- Listen to on-chain account changes in real-time
- Build complete DePIN applications

## Hardware Requirements

### Essential Components
- **Raspberry Pi 4B or 5** with WiFi
- **32GB microSD card** for Raspberry Pi OS
- **LEDs** (any color)
- **220 ohm resistors**
- **Breadboard**
- **Jumper wires** (male-to-female)
- **Power supply** for Raspberry Pi (USB-C, 5V 3A)

### Optional Components
- **5V water pump** (for bar example)
- **NPN transistor** (S8050 D331 or similar)
- **OLED display** (I2C SSD1306)
- **Sensors** (temperature, humidity, motion, etc.)
- **Power bank** (for portable applications)

### Where to Buy
- **Amazon**: Search for "Raspberry Pi 4 starter kit"
- **Adafruit**: https://www.adafruit.com/
- **SparkFun**: https://www.sparkfun.com/
- **Local electronics stores**

**Estimated cost**: $50-100 for complete starter kit

## Raspberry Pi Setup

### 1. Install Raspberry Pi OS

1. Download [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
2. Insert microSD card into your computer
3. Open Raspberry Pi Imager and select:
   - **OS**: Raspberry Pi OS (64-bit recommended)
   - **Storage**: Your microSD card
4. Click the gear icon (⚙️) to configure:
   - **Hostname**: `raspberrypi.local`
   - **Enable SSH**: Yes
   - **Set username and password**: e.g., `pi` / `yourpassword`
   - **Configure WiFi**: Enter your SSID and password
   - **WiFi country**: Select your country
5. Click **Write** and wait for completion
6. Insert microSD card into Raspberry Pi and power on

### 2. Connect via SSH

Wait 1-2 minutes for the Pi to boot, then connect:

```bash
# Find your Pi's IP address
ping raspberrypi.local

# SSH into the Pi
ssh pi@raspberrypi.local
# Enter your password when prompted
```

**Troubleshooting**: If `raspberrypi.local` doesn't work:
1. Check your router's admin panel for the Pi's IP address
2. Use the IP directly: `ssh pi@192.168.1.XXX`

### 3. Update System

```bash
sudo apt update
sudo apt upgrade -y
```

### 4. Install Node.js

```bash
# Install Node.js
sudo apt install nodejs npm -y

# Verify installation
nodejs -v
npm -v

# Install nvm for version management
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash

# Load nvm
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install and use Node 18
nvm install v18.19.0
nvm use v18.19.0
node --version
```

## GPIO Pin Reference

### Raspberry Pi 4/5 GPIO Layout

```
3.3V  (1) (2)  5V
GPIO2 (3) (4)  5V
GPIO3 (5) (6)  GND
GPIO4 (7) (8)  GPIO14
GND   (9) (10) GPIO15
GPIO17(11)(12) GPIO18
GPIO27(13)(14) GND
GPIO22(15)(16) GPIO23
3.3V  (17)(18) GPIO24
GPIO10(19)(20) GND
GPIO9 (21)(22) GPIO25
GPIO11(23)(24) GPIO8
GND   (25)(26) GPIO7
```

### Important Notes

**Raspberry Pi 5 GPIO Changes**: If using Raspberry Pi 5, GPIO pin numbers are different:
- GPIO 18 → 589
- GPIO 23 → 594
- GPIO 2 → 573
- GPIO 3 → 574

Check your GPIO addresses:
```bash
cat /sys/kernel/debug/gpio
```

### Pin Types
- **3.3V**: Power supply (max 50mA total)
- **5V**: Power supply (higher current available)
- **GND**: Ground (multiple pins available)
- **GPIO**: General Purpose Input/Output (programmable)

## Example 1: LED Blink Test (Python)

Let's start with a simple Python test to verify hardware setup.

### Wiring Diagram

```
Raspberry Pi          LED          Resistor
GPIO 18 (Pin 12) ----[LED]----[220Ω]---- GND (Pin 6)
```

**LED Polarity**: 
- Long leg (anode) → GPIO pin
- Short leg (cathode) → Resistor → GND

### Python Blink Script

```bash
cd Documents
nano LED.py
```

Paste this code:

```python
import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO.setup(18, GPIO.OUT)

print("LED on")
GPIO.output(18, GPIO.HIGH)
time.sleep(3)

print("LED off")
GPIO.output(18, GPIO.LOW)
```

Run it:
```bash
sudo python LED.py
```

The LED should turn on for 3 seconds, then turn off.

## Example 2: LED Blink with Node.js

Now let's control the LED using Node.js, which we'll use for Solana integration.

### Install onoff Library

```bash
mkdir led-test
cd led-test
npm install onoff
nano blink.js
```

### Node.js Blink Script

```javascript
var Gpio = require('onoff').Gpio;
var LED = new Gpio(18, 'out');
var blinkInterval = setInterval(blinkLED, 250);

function blinkLED() {
  if (LED.readSync() === 0) {
    LED.writeSync(1); // Turn on
  } else {
    LED.writeSync(0); // Turn off
  }
}

function endBlink() {
  clearInterval(blinkInterval);
  LED.writeSync(0);
  LED.unexport();
}

setTimeout(endBlink, 5000); // Stop after 5 seconds
```

Run it:
```bash
sudo node blink.js
```

## Example 3: LED Control via Solana Program

Now we'll create a complete system where an on-chain program controls the LED state.

### Architecture

```
Mobile Wallet → Solana Pay QR → API → Solana Program → Update Account
                                                              ↓
Raspberry Pi ← WebSocket ← Account Change ← Solana RPC
     ↓
   LED On/Off
```

### Step 1: The Anchor Program

This program stores LED state on-chain:

```rust
use anchor_lang::prelude::*;

declare_id!("F7F5ZTEMU6d5Ac8CQEJKBGWXLbte1jK2Kodyu3tNtvaj");

#[program]
pub mod led_switch {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.led_switch.is_on = false;
        Ok(())
    }

    pub fn switch(ctx: Context<Switch>, is_on: bool) -> Result<()> {
        ctx.accounts.led_switch.is_on = is_on;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 8,
        seeds = [b"led-switch"],
        bump
    )]
    pub led_switch: Account<'info, LedSwitch>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Switch<'info> {
    #[account(mut, seeds = [b"led-switch"], bump)]
    pub led_switch: Account<'info, LedSwitch>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[account]
pub struct LedSwitch {
    pub is_on: bool,
}
```

**Key Points**:
- Uses PDA (Program Derived Address) with seed `"led-switch"`
- Stores a single boolean: `is_on`
- Anyone can call `switch()` to change state
- Could add access control by checking signer

### Step 2: Raspberry Pi Listener Script

This script listens for account changes and controls the LED:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { IDL, LedSwitch } from "./led_switch";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

var Gpio = require('onoff').Gpio;
var LED = new Gpio(18, 'out');

let connection = new Connection(clusterApiUrl("devnet"));
let wallet = new NodeWallet(new Keypair());
const provider = new anchor.AnchorProvider(connection, wallet, {
  commitment: "processed",
});
anchor.setProvider(provider);

const program = new Program<LedSwitch>(
  IDL,
  "F7F5ZTEMU6d5Ac8CQEJKBGWXLbte1jK2Kodyu3tNtvaj",
  { connection }
);

console.log("Program ID", program.programId.toString());

startListeningToLedSwitchAccount();

async function startListeningToLedSwitchAccount() {
  const ledSwitchPDA = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("led-switch")],
    program.programId,
  )[0];

  // Get initial state
  const ledSwitchAccount = await program.account.ledSwitch.fetch(ledSwitchPDA);
  
  console.log("Initial LED state:", ledSwitchAccount.isOn);
  LED.writeSync(ledSwitchAccount.isOn ? 1 : 0);
  
  // Listen for changes
  connection.onAccountChange(ledSwitchPDA, (account) => {
    const decoded = program.coder.accounts.decode("ledSwitch", account.data);
    
    LED.writeSync(decoded.isOn ? 1 : 0);
    console.log("LED state changed:", decoded.isOn);
  }, "processed");
}
```

**Setup**:
```bash
mkdir led-switch
cd led-switch
npm install @coral-xyz/anchor @solana/web3.js onoff
npm install -D typescript ts-node

# Copy your program's IDL file here as led_switch.ts
# Run the script
npx ts-node led.ts
```

**Important**: Don't run with `sudo`. If you get permission errors:
```bash
chmod -R 777 /path/to/led-switch
```

### Step 3: Solana Pay Transaction Request

Create a Next.js API that generates transactions:

```typescript
// pages/api/transaction.ts
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Program, AnchorProvider } from "@coral-xyz/anchor";

const PROGRAM_ID = new PublicKey("F7F5ZTEMU6d5Ac8CQEJKBGWXLbte1jK2Kodyu3tNtvaj");

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      label: "LED Control",
      icon: "https://your-icon-url.com/led.png",
    });
  }

  if (req.method === "POST") {
    const { account } = req.body;
    const sender = new PublicKey(account);
    
    const connection = new Connection(clusterApiUrl("devnet"));
    const transaction = new Transaction();
    
    // Find PDA
    const [ledSwitchPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("led-switch")],
      PROGRAM_ID
    );
    
    // Create switch instruction
    const instruction = await program.methods
      .switch(true) // Turn LED on
      .accounts({
        ledSwitch: ledSwitchPDA,
        authority: sender,
      })
      .instruction();
    
    transaction.add(instruction);
    transaction.feePayer = sender;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    
    const serialized = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });
    
    return res.status(200).json({
      transaction: serialized.toString("base64"),
      message: "Turn LED On",
    });
  }
}
```

### Step 4: Generate QR Code

```typescript
// app/page.tsx
import { createQR, encodeURL } from "@solana/pay";
import { useEffect, useRef } from "react";

export default function Home() {
  const qrRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const apiUrl = `${window.location.protocol}//${window.location.host}/api/transaction`;
    const qr = createQR(encodeURL({ link: new URL(apiUrl) }), 360, 'transparent');
    
    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qr.append(qrRef.current);
    }
  }, []);
  
  return (
    <div>
      <h1>Scan to Control LED</h1>
      <div ref={qrRef} />
    </div>
  );
}
```

### Step 5: Deploy and Test

```bash
# Run Next.js app locally
cd app
yarn install
yarn dev

# Use ngrok to make it publicly accessible
ngrok http 3000

# Scan QR code with Solana Pay-compatible wallet
# LED should turn on when transaction confirms!
```

## Example 4: OLED Display Integration

Display real-time Solana data on an OLED screen.

### Hardware Setup

**OLED Display (I2C SSD1306)**:
- VCC → 3.3V (Pin 1)
- GND → GND (Pin 6)
- SDA → GPIO 2 (Pin 3)
- SCL → GPIO 3 (Pin 5)

### Enable I2C

```bash
sudo raspi-config
# Select: 5 Interfacing Options → I2C → Yes
sudo reboot

# Verify I2C is working
sudo i2cdetect -y 1
# Should show address 0x3c
```

### Display Solana Slot

```javascript
const i2c = require('i2c-bus');
const oled = require('oled-i2c-bus');
const font = require('oled-font-5x7');
const { Connection, clusterApiUrl } = require('@solana/web3.js');

const opts = {
  width: 128,
  height: 64,
  address: 0x3C
};

const i2cBus = i2c.openSync(1);
const display = new oled(i2cBus, opts);

const connection = new Connection(clusterApiUrl('mainnet-beta'));

async function updateDisplay() {
  const slot = await connection.getSlot();
  
  display.clearDisplay();
  display.setCursor(1, 1);
  display.writeString(font, 2, 'Solana Slot:', 1, true);
  display.setCursor(1, 20);
  display.writeString(font, 2, slot.toString(), 1, true);
}

setInterval(updateDisplay, 1000);
```

## Example 5: Water Pump Control (Solana Bar)

Control a 5V water pump to dispense drinks via Solana Pay.

### Hardware Setup

**Components**:
- 5V water pump
- NPN transistor (S8050 D331)
- 220 ohm resistor
- Tubing and container

**Wiring**:
```
5V (Pin 2) ----[Pump+]
                 |
              [Pump-]---- Collector (Transistor)
                              |
GPIO 23 ----[220Ω]---- Base (Transistor)
                              |
GND (Pin 6) ------------ Emitter (Transistor)
```

**How it works**:
- GPIO 23 sends signal through resistor to transistor base
- Transistor becomes conductive
- Current flows from 5V through pump to ground
- Pump activates

### Pump Control Script

```typescript
var Gpio = require('onoff').Gpio;
var PUMP = new Gpio(23, 'out');

async function dispenseDrink(durationMs: number) {
  console.log("Dispensing drink...");
  PUMP.writeSync(1); // Turn on pump
  await sleep(durationMs);
  PUMP.writeSync(0); // Turn off pump
  console.log("Done!");
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Dispense for 3 seconds
dispenseDrink(3000);
```

### Integration with Solana Program

See the complete Solana Bar example in the [source repository](https://github.com/solana-developers/solana-depin-examples/tree/main/solana-bar) for:
- Payment processing
- Receipt tracking
- Delivery confirmation
- Multi-drink support

## Wiring Diagrams

### Basic LED Circuit
```
     Raspberry Pi
    ┌─────────────┐
    │   GPIO 18   │────┐
    │             │    │
    │   GND       │──┐ │
    └─────────────┘  │ │
                     │ │
                   ┌─┴─┴─┐
                   │ LED │
                   │ ▼   │
                   └──┬──┘
                      │
                   [220Ω]
                      │
                     GND
```

### Pump with Transistor
```
     Raspberry Pi
    ┌─────────────┐
    │   5V        │────────┬─────[Pump]─────┐
    │             │        │                 │
    │   GPIO 23   │──[220Ω]──┤B         C├──┘
    │             │           │  NPN      │
    │   GND       │───────────┤E          │
    └─────────────┘           └───────────┘
```

## Troubleshooting

### LED Not Turning On
- Check LED polarity (long leg to GPIO, short to GND)
- Verify resistor is 220 ohm (red-red-brown)
- Test GPIO with Python script first
- Check wiring connections

### Permission Errors
```bash
# Don't use sudo with Node.js
# Instead, fix permissions:
sudo usermod -a -G gpio pi
sudo chmod -R 777 /sys/class/gpio
```

### WebSocket Connection Issues
- Verify Solana RPC endpoint is accessible
- Check network connectivity
- Use `"processed"` commitment for faster updates
- Consider using a dedicated RPC provider for production

### Raspberry Pi 5 GPIO Issues
- Use new GPIO numbers (see reference above)
- Update to latest Raspberry Pi OS
- Check `/sys/kernel/debug/gpio` for mappings

## Best Practices

### Hardware
- Always use resistors with LEDs (220-330 ohm)
- Don't exceed GPIO current limits (16mA per pin, 50mA total for 3.3V)
- Use transistors for high-current devices (motors, pumps)
- Add flyback diodes for inductive loads (motors)

### Software
- Handle WebSocket disconnections gracefully
- Implement exponential backoff for reconnections
- Log all state changes for debugging
- Use environment variables for sensitive data

### Security
- Don't expose private keys in code
- Use burner wallets for device operations
- Implement rate limiting on APIs
- Validate all inputs

## Next Steps

- Explore [LoRaWAN Networks](../03-lorawan-networks/README.md) for long-range communication
- Learn [Data Anchoring](../04-data-anchoring/README.md) patterns
- Try the [Exercises](../exercises/README.md) to build your own projects

## Source Attribution

Content extracted and adapted from:
- [LED Switch Example](https://github.com/solana-developers/solana-depin-examples/tree/main/led-switch) - solana-depin-examples repository
- [Solana Bar Example](https://github.com/solana-developers/solana-depin-examples/tree/main/solana-bar) - solana-depin-examples repository  
- [Raspberry LED Display](https://github.com/solana-developers/solana-depin-examples/tree/main/Raspberry-LED-display) - solana-depin-examples repository

---

**Ready to build?** Start with the LED blink test, then progress to Solana integration. The best way to learn is by doing!
