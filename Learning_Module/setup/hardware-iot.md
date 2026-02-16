# Hardware and IoT Setup Guide

This guide covers the installation and configuration of hardware and IoT components for building DePIN (Decentralized Physical Infrastructure Networks) applications on Solana. You'll learn to set up Raspberry Pi, LoRaWAN networks, sensors, and integrate physical devices with blockchain.

## Prerequisites

- Solana CLI installed and configured (see [Solana CLI Setup](solana-cli.md))
- Basic command-line familiarity
- Basic electronics knowledge (reading schematics, using breadboards)
- Soldering skills (optional, for permanent installations)

## Version Requirements

- **Raspberry Pi OS**: Bullseye (11) or later
- **Node.js**: 18.x or later (for Raspberry Pi)
- **Python**: 3.9 or later
- **Solana CLI**: 1.18.0 or later

## Overview

Building DePIN applications on Solana requires:
1. **Hardware platform**: Raspberry Pi or similar single-board computer
2. **Sensors and actuators**: LEDs, temperature sensors, motion detectors, etc.
3. **Communication protocols**: GPIO, I2C, SPI for local sensors
4. **Long-range connectivity**: LoRaWAN for distributed IoT networks
5. **Blockchain integration**: Solana programs for data anchoring and control

## Part 1: Raspberry Pi Setup

### Hardware Requirements

**Minimum Configuration**:
- Raspberry Pi 4 Model B (4GB RAM recommended)
- MicroSD card (32GB or larger, Class 10)
- USB-C power supply (5V, 3A)
- Ethernet cable or WiFi connection
- HDMI cable and monitor (for initial setup)
- USB keyboard and mouse (for initial setup)

**Optional Components**:
- Raspberry Pi case with cooling fan
- GPIO breakout board
- Breadboard and jumper wires
- Multimeter for debugging

### Install Raspberry Pi OS

#### Using Raspberry Pi Imager (Recommended)

1. Download Raspberry Pi Imager from: https://www.raspberrypi.com/software/

2. Insert microSD card into your computer

3. Open Raspberry Pi Imager and:
   - Choose OS: **Raspberry Pi OS (64-bit)** or **Raspberry Pi OS Lite** (headless)
   - Choose Storage: Select your microSD card
   - Click Settings (gear icon) to configure:
     - Set hostname: `solana-iot`
     - Enable SSH
     - Set username and password
     - Configure WiFi (optional)
   - Click **Write**

4. Insert microSD card into Raspberry Pi and power on

#### First Boot Configuration

If using desktop version, complete the setup wizard.

For headless setup, SSH into your Pi:

```bash
ssh pi@solana-iot.local
# or use IP address
ssh pi@192.168.1.xxx
```

Update system packages:

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### Install Node.js on Raspberry Pi

Install Node.js for running Solana client applications:

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verify installation:

```bash
node --version
npm --version
```

Expected output:
```
v18.x.x
9.x.x
```

### Install Python and Dependencies

Python is useful for sensor interfacing:

```bash
sudo apt-get install -y python3 python3-pip python3-venv
```

Verify installation:

```bash
python3 --version
```

### Install Solana CLI on Raspberry Pi

Install Solana CLI (this may take 10-15 minutes on Raspberry Pi):

```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

Add to PATH in `~/.bashrc`:

```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

Reload configuration:

```bash
source ~/.bashrc
```

Verify installation:

```bash
solana --version
```

Configure for devnet:

```bash
solana config set --url https://api.devnet.solana.com
```

### Enable GPIO and Hardware Interfaces

Enable GPIO, I2C, and SPI interfaces:

```bash
sudo raspi-config
```

Navigate to:
- **Interface Options** → **I2C** → Enable
- **Interface Options** → **SPI** → Enable
- **Interface Options** → **Serial Port** → Enable (if using serial devices)

Reboot to apply changes:

```bash
sudo reboot
```

### Install GPIO Libraries

#### For Node.js

```bash
npm install -g onoff rpi-gpio
```

#### For Python

```bash
pip3 install RPi.GPIO gpiozero
```

## Part 2: Basic LED Control

### Hardware Setup

**Components Needed**:
- 1x LED (any color)
- 1x 220Ω resistor
- 2x jumper wires
- Breadboard

### Wiring Diagram

```
Raspberry Pi GPIO Layout (Top View):
     3V3  (1) (2)  5V
   GPIO2  (3) (4)  5V
   GPIO3  (5) (6)  GND
   GPIO4  (7) (8)  GPIO14
     GND  (9) (10) GPIO15
  GPIO17 (11) (12) GPIO18
  GPIO27 (13) (14) GND
  GPIO22 (15) (16) GPIO23
     3V3 (17) (18) GPIO24
  GPIO10 (19) (20) GND
   GPIO9 (21) (22) GPIO25
  GPIO11 (23) (24) GPIO8
     GND (25) (26) GPIO7
   ...

LED Circuit:
GPIO17 (Pin 11) ──┬── 220Ω Resistor ──┬── LED Anode (+)
                  │                    │
                  │                    └── LED Cathode (-)
                  │                         │
GND (Pin 9) ──────┴─────────────────────────┘

Connection Steps:
1. Connect GPIO17 (Pin 11) to one end of 220Ω resistor
2. Connect other end of resistor to LED anode (longer leg, +)
3. Connect LED cathode (shorter leg, -) to GND (Pin 9)
```

**Safety Notes**:
- Always use current-limiting resistors with LEDs
- Never connect GPIO pins directly to 5V or GND
- GPIO pins output 3.3V, max current 16mA per pin
- Double-check connections before powering on

### Example: LED Control with Node.js

Create `led-control.js`:

```javascript
const Gpio = require('onoff').Gpio;

// Initialize GPIO17 as output
const led = new Gpio(17, 'out');

// Blink LED every second
let ledState = 0;
const interval = setInterval(() => {
  ledState = ledState === 0 ? 1 : 0;
  led.writeSync(ledState);
  console.log(`LED ${ledState === 1 ? 'ON' : 'OFF'}`);
}, 1000);

// Cleanup on exit
process.on('SIGINT', () => {
  clearInterval(interval);
  led.writeSync(0);
  led.unexport();
  console.log('LED control stopped');
  process.exit();
});
```

Run the script:

```bash
node led-control.js
```

Press `Ctrl+C` to stop.

### Example: LED Control with Python

Create `led_control.py`:

```python
import RPi.GPIO as GPIO
import time

# Set GPIO mode
GPIO.setmode(GPIO.BCM)

# Define LED pin
LED_PIN = 17

# Setup GPIO pin as output
GPIO.setup(LED_PIN, GPIO.OUT)

try:
    while True:
        GPIO.output(LED_PIN, GPIO.HIGH)
        print("LED ON")
        time.sleep(1)
        
        GPIO.output(LED_PIN, GPIO.LOW)
        print("LED OFF")
        time.sleep(1)
        
except KeyboardInterrupt:
    print("LED control stopped")
    
finally:
    GPIO.cleanup()
```

Run the script:

```bash
python3 led_control.py
```

Press `Ctrl+C` to stop.

## Part 3: Sensor Integration

### Temperature and Humidity Sensor (DHT22)

**Components Needed**:
- DHT22 sensor
- 10kΩ pull-up resistor
- Jumper wires

### Wiring Diagram

```
DHT22 Sensor Pinout (Front View):
┌─────────────┐
│  DHT22      │
│  ┌───┐      │
│  │ o │      │
│  └───┘      │
└─┬─┬─┬─┬─────┘
  1 2 3 4

Pin 1: VCC (3.3V)
Pin 2: DATA
Pin 3: Not connected
Pin 4: GND

Connection:
Raspberry Pi 3.3V (Pin 1) ──── DHT22 Pin 1 (VCC)
Raspberry Pi GPIO4 (Pin 7) ─┬─ DHT22 Pin 2 (DATA)
                            │
                    10kΩ Resistor (pull-up)
                            │
Raspberry Pi 3.3V (Pin 1) ──┘
Raspberry Pi GND (Pin 9) ───── DHT22 Pin 4 (GND)
```

### Install DHT22 Library

```bash
pip3 install adafruit-circuitpython-dht
sudo apt-get install -y libgpiod2
```

### Example: Read Temperature and Humidity

Create `read_sensor.py`:

```python
import time
import board
import adafruit_dht

# Initialize DHT22 on GPIO4
dht_device = adafruit_dht.DHT22(board.D4)

try:
    while True:
        try:
            temperature = dht_device.temperature
            humidity = dht_device.humidity
            
            print(f"Temperature: {temperature:.1f}°C")
            print(f"Humidity: {humidity:.1f}%")
            print("---")
            
        except RuntimeError as error:
            # DHT sensors can occasionally fail to read
            print(f"Reading error: {error.args[0]}")
            
        time.sleep(2)
        
except KeyboardInterrupt:
    print("Sensor reading stopped")
    
finally:
    dht_device.exit()
```

Run the script:

```bash
python3 read_sensor.py
```

### Motion Sensor (PIR)

**Components Needed**:
- HC-SR501 PIR motion sensor
- Jumper wires

### Wiring Diagram

```
PIR Sensor Pinout:
┌─────────────┐
│   HC-SR501  │
│   ┌─────┐   │
│   │ PIR │   │
│   └─────┘   │
└─┬───┬───┬───┘
  VCC OUT GND

Connection:
Raspberry Pi 5V (Pin 2) ──── PIR VCC
Raspberry Pi GPIO23 (Pin 16) ─ PIR OUT
Raspberry Pi GND (Pin 14) ──── PIR GND
```

### Example: Motion Detection

Create `motion_detect.py`:

```python
import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
PIR_PIN = 23

GPIO.setup(PIR_PIN, GPIO.IN)

print("Waiting for sensor to settle...")
time.sleep(2)
print("Motion detection active")

try:
    while True:
        if GPIO.input(PIR_PIN):
            print("Motion detected!")
            time.sleep(1)
        time.sleep(0.1)
        
except KeyboardInterrupt:
    print("Motion detection stopped")
    
finally:
    GPIO.cleanup()
```

## Part 4: LoRaWAN Network Setup

LoRaWAN enables long-range, low-power communication for distributed IoT networks.

### Hardware Requirements

**For LoRaWAN Node (Sensor Device)**:
- Raspberry Pi with LoRa HAT (e.g., RAK2245, Dragino LoRa GPS HAT)
- Or dedicated LoRa module (e.g., RFM95W)
- Antenna (868MHz for EU, 915MHz for US)

**For LoRaWAN Gateway** (optional, for private network):
- Raspberry Pi 4
- LoRa concentrator HAT (e.g., RAK2245, RAK2287)
- Outdoor antenna
- Ethernet or 4G connectivity

### LoRa Module Wiring (RFM95W)

```
RFM95W to Raspberry Pi SPI Connection:
RFM95W Pin  →  Raspberry Pi Pin
─────────────────────────────────
VCC (3.3V)  →  Pin 1 (3.3V)
GND         →  Pin 6 (GND)
MISO        →  Pin 21 (GPIO9, MISO)
MOSI        →  Pin 19 (GPIO10, MOSI)
SCK         →  Pin 23 (GPIO11, SCLK)
NSS (CS)    →  Pin 24 (GPIO8, CE0)
RESET       →  Pin 22 (GPIO25)
DIO0        →  Pin 18 (GPIO24)
```

### Install LoRa Libraries

#### For Python (using CircuitPython)

```bash
pip3 install adafruit-circuitpython-rfm9x
```

#### For Node.js

```bash
npm install node-lora
```

### Example: LoRa Transmitter

Create `lora_transmit.py`:

```python
import time
import board
import busio
import digitalio
import adafruit_rfm9x

# Configure SPI
spi = busio.SPI(board.SCK, MOSI=board.MOSI, MISO=board.MISO)

# Configure chip select and reset pins
cs = digitalio.DigitalInOut(board.CE1)
reset = digitalio.DigitalInOut(board.D25)

# Initialize RFM95W (915MHz for US, 868MHz for EU)
rfm9x = adafruit_rfm9x.RFM9x(spi, cs, reset, 915.0)

# Set transmit power (5-23 dBm)
rfm9x.tx_power = 23

print("LoRa transmitter ready")

counter = 0
try:
    while True:
        message = f"Hello from Solana IoT #{counter}"
        rfm9x.send(bytes(message, "utf-8"))
        print(f"Sent: {message}")
        counter += 1
        time.sleep(5)
        
except KeyboardInterrupt:
    print("Transmission stopped")
```

### Example: LoRa Receiver

Create `lora_receive.py`:

```python
import time
import board
import busio
import digitalio
import adafruit_rfm9x

# Configure SPI
spi = busio.SPI(board.SCK, MOSI=board.MOSI, MISO=board.MISO)

# Configure chip select and reset pins
cs = digitalio.DigitalInOut(board.CE1)
reset = digitalio.DigitalInOut(board.D25)

# Initialize RFM95W
rfm9x = adafruit_rfm9x.RFM9x(spi, cs, reset, 915.0)

print("LoRa receiver ready, waiting for packets...")

try:
    while True:
        packet = rfm9x.receive(timeout=5.0)
        if packet is not None:
            packet_text = str(packet, "utf-8")
            rssi = rfm9x.last_rssi
            print(f"Received: {packet_text}")
            print(f"RSSI: {rssi} dB")
            print("---")
            
except KeyboardInterrupt:
    print("Reception stopped")
```

### LoRaWAN Network Server Setup

For production DePIN applications, use a LoRaWAN Network Server:

**Option 1: The Things Network (TTN)** - Free community network
1. Create account at: https://www.thethingsnetwork.org
2. Register your gateway (if using private gateway)
3. Register your devices
4. Configure application and data forwarding

**Option 2: ChirpStack** - Self-hosted open-source
```bash
# Install ChirpStack on Raspberry Pi
curl -fsSL https://artifacts.chirpstack.io/install.sh | sudo bash
```

## Part 5: Blockchain Integration

### Data Anchoring Pattern

Store IoT sensor data on Solana blockchain for immutability and verification.

### Example: Send Sensor Data to Solana

Create `sensor_to_solana.js`:

```javascript
const { Connection, Keypair, Transaction, SystemProgram, PublicKey } = require('@solana/web3.js');
const fs = require('fs');

// Load wallet
const secretKey = JSON.parse(fs.readFileSync('/home/pi/.config/solana/id.json'));
const wallet = Keypair.fromSecretKey(Uint8Array.from(secretKey));

// Connect to devnet
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

async function anchorSensorData(temperature, humidity) {
  try {
    // Create memo instruction with sensor data
    const dataString = JSON.stringify({
      device: 'raspberry-pi-001',
      timestamp: Date.now(),
      temperature: temperature,
      humidity: humidity
    });
    
    // Create transaction with memo
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: wallet.publicKey,
        lamports: 0,
      })
    );
    
    // Add memo with sensor data
    transaction.add({
      keys: [],
      programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
      data: Buffer.from(dataString, 'utf-8'),
    });
    
    // Send transaction
    const signature = await connection.sendTransaction(transaction, [wallet]);
    await connection.confirmTransaction(signature);
    
    console.log(`Data anchored: ${signature}`);
    console.log(`View at: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    
    return signature;
  } catch (error) {
    console.error('Error anchoring data:', error);
  }
}

// Example usage
anchorSensorData(22.5, 65.3);
```

### Example: Complete IoT to Blockchain Pipeline

Create `iot_pipeline.py`:

```python
import time
import json
import subprocess
import board
import adafruit_dht

# Initialize sensor
dht_device = adafruit_dht.DHT22(board.D4)

def send_to_solana(temperature, humidity):
    """Send sensor data to Solana using Node.js script"""
    try:
        result = subprocess.run(
            ['node', 'sensor_to_solana.js', str(temperature), str(humidity)],
            capture_output=True,
            text=True
        )
        print(result.stdout)
    except Exception as e:
        print(f"Error sending to Solana: {e}")

try:
    print("IoT to Blockchain pipeline started")
    
    while True:
        try:
            temperature = dht_device.temperature
            humidity = dht_device.humidity
            
            print(f"Temperature: {temperature:.1f}°C, Humidity: {humidity:.1f}%")
            
            # Send to blockchain every 5 minutes
            send_to_solana(temperature, humidity)
            
            time.sleep(300)  # 5 minutes
            
        except RuntimeError as error:
            print(f"Sensor error: {error.args[0]}")
            time.sleep(2)
            
except KeyboardInterrupt:
    print("Pipeline stopped")
    
finally:
    dht_device.exit()
```

## Part 6: Power Management

### Power Consumption Optimization

For battery-powered IoT devices:

```python
import time
import RPi.GPIO as GPIO

# Disable HDMI to save power
import subprocess
subprocess.run(['sudo', '/usr/bin/tvservice', '-o'])

# Disable LEDs
with open('/sys/class/leds/led0/brightness', 'w') as f:
    f.write('0')
with open('/sys/class/leds/led1/brightness', 'w') as f:
    f.write('0')

# Use sleep modes between readings
# Your sensor code here
```

### Solar Power Setup

For outdoor DePIN installations:

**Components**:
- Solar panel (10W minimum for Raspberry Pi)
- Solar charge controller
- LiPo battery (10,000mAh or larger)
- DC-DC converter (5V output)

**Wiring**:
```
Solar Panel → Charge Controller → Battery → DC-DC Converter → Raspberry Pi
```

## Troubleshooting

### GPIO Permission Issues

**Error**: "Permission denied" when accessing GPIO

```bash
# Add user to gpio group
sudo usermod -a -G gpio $USER
sudo reboot
```

### I2C Device Not Detected

```bash
# Check if I2C is enabled
sudo raspi-config
# Interface Options → I2C → Enable

# List I2C devices
sudo i2cdetect -y 1
```

### LoRa Communication Issues

**Problem**: No packets received

- Check antenna connection
- Verify frequency matches (868MHz vs 915MHz)
- Check transmit power settings
- Ensure line-of-sight for best range
- Verify SPI connections

### Sensor Reading Errors

**DHT22 checksum errors**:
- Add 10kΩ pull-up resistor
- Use shorter wires (< 20cm)
- Add small delay between readings

## Best Practices

1. **Use proper resistors**: Always use current-limiting resistors with LEDs
2. **Isolate power supplies**: Use separate power for high-current devices
3. **Protect GPIO pins**: Never exceed 3.3V or 16mA per pin
4. **Handle sensor errors**: Sensors can fail; implement retry logic
5. **Optimize data transmission**: Don't spam blockchain; batch or aggregate data
6. **Secure your devices**: Change default passwords, use SSH keys
7. **Monitor temperature**: Add cooling for continuous operation
8. **Use watchdog timers**: Auto-restart on crashes
9. **Log everything**: Keep logs for debugging
10. **Test thoroughly**: Verify all connections before powering on

## Verification Checklist

After completing this setup:

- [ ] Raspberry Pi OS installed and updated
- [ ] Node.js and Python installed
- [ ] Solana CLI working on Raspberry Pi
- [ ] GPIO interfaces enabled (I2C, SPI)
- [ ] LED blink test successful
- [ ] Temperature sensor reading correctly
- [ ] Motion sensor detecting movement
- [ ] LoRa module transmitting/receiving (if applicable)
- [ ] Sensor data successfully sent to Solana blockchain
- [ ] All wiring double-checked for safety

## Next Steps

With your hardware and IoT environment configured:

1. **Explore DePIN examples**: Check [DePIN Topic Area](../depin/README.md) for advanced projects
2. **Build data anchoring system**: Create immutable sensor data logs
3. **Implement device control**: Control actuators from blockchain transactions
4. **Create distributed network**: Deploy multiple nodes with LoRaWAN
5. **Add security**: Implement device authentication and data encryption

## Additional Resources

- Raspberry Pi Documentation: https://www.raspberrypi.com/documentation/
- GPIO Pinout Reference: https://pinout.xyz
- LoRaWAN Specification: https://lora-alliance.org/resource_hub/lorawan-specification-v1-0-3/
- The Things Network: https://www.thethingsnetwork.org
- Solana DePIN Examples: https://github.com/solana-developers/solana-depin-examples
- Adafruit Learning System: https://learn.adafruit.com
- ChirpStack Documentation: https://www.chirpstack.io/docs/

---

**Source**: Adapted from Raspberry Pi documentation at https://www.raspberrypi.com/documentation/, LoRa Alliance specifications, and Solana DePIN examples at https://github.com/solana-developers/solana-depin-examples

