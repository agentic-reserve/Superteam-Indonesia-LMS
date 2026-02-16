# Solana Pay

Solana Pay is a specification for encoding Solana transaction requests within URLs and QR codes, enabling seamless payment experiences in mobile and web applications. This section covers implementing Solana Pay for mobile payment flows, QR code generation, and transaction requests.

## Overview

Solana Pay provides a standardized protocol for:

- **Payment Requests**: Simple transfer requests with amount and recipient
- **Transaction Requests**: Complex transaction requests with custom instructions
- **QR Code Integration**: Encode payment data in scannable QR codes
- **Deep Linking**: Launch wallet apps with payment requests
- **Mobile Commerce**: Enable point-of-sale and e-commerce payments

## Key Concepts

### Payment Request

A simple transfer request containing:
- Recipient address
- Amount (optional)
- SPL token (optional, defaults to SOL)
- Label and message (optional)
- Memo (optional)

### Transaction Request

A more complex request that:
- Points to an API endpoint
- Fetches a transaction from the server
- Allows dynamic transaction generation
- Supports custom program instructions

### URL Scheme

Solana Pay uses the `solana:` URL scheme:

```
solana:<recipient>?amount=<amount>&label=<label>&message=<message>&memo=<memo>
```

## Installation

### Install Solana Pay SDK

```bash
npm install @solana/pay
```

### Install QR Code Library

```bash
npm install react-native-qrcode-svg
npm install react-native-svg
```

### Install Camera Library (for scanning)

```bash
npx expo install expo-camera
# or for bare React Native
npm install react-native-camera
```

## Payment Requests

### Creating a Payment Request

```typescript
import { encodeURL, createQR } from '@solana/pay';
import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';

// Create payment request URL
const recipient = new PublicKey('RECIPIENT_ADDRESS');
const amount = new BigNumber(0.1); // 0.1 SOL
const label = 'Coffee Shop';
const message = 'Thanks for your purchase!';
const memo = 'ORDER-12345';

const url = encodeURL({
  recipient,
  amount,
  label,
  message,
  memo,
});

console.log(url.toString());
// Output: solana:RECIPIENT_ADDRESS?amount=0.1&label=Coffee%20Shop&message=Thanks%20for%20your%20purchase!&memo=ORDER-12345
```

### SPL Token Payments

```typescript
import { encodeURL } from '@solana/pay';
import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';

const recipient = new PublicKey('RECIPIENT_ADDRESS');
const amount = new BigNumber(10); // 10 tokens
const splToken = new PublicKey('TOKEN_MINT_ADDRESS'); // USDC, for example

const url = encodeURL({
  recipient,
  amount,
  splToken,
  label: 'Token Payment',
  message: 'Pay with USDC',
});
```

### Generating QR Codes

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { encodeURL } from '@solana/pay';
import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';

export const PaymentQRCode: React.FC = () => {
  const recipient = new PublicKey('YOUR_RECIPIENT_ADDRESS');
  const amount = new BigNumber(0.1);

  const url = encodeURL({
    recipient,
    amount,
    label: 'My Store',
    message: 'Scan to pay',
  });

  return (
    <View style={styles.container}>
      <QRCode
        value={url.toString()}
        size={300}
        backgroundColor="white"
        color="black"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
```

## Transaction Requests

### Creating a Transaction Request

Transaction requests point to an API endpoint that generates transactions:

```typescript
import { encodeURL } from '@solana/pay';

const link = new URL('https://myapi.com/api/transaction');
link.searchParams.append('recipient', 'RECIPIENT_ADDRESS');
link.searchParams.append('amount', '0.1');

const url = encodeURL({ link });

console.log(url.toString());
// Output: solana:https://myapi.com/api/transaction?recipient=RECIPIENT_ADDRESS&amount=0.1
```

### Transaction Request API Endpoint

Create an API endpoint that returns a transaction:

```typescript
// Example Next.js API route: pages/api/transaction.ts
import { Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { account } = req.body;
    const recipient = new PublicKey('YOUR_RECIPIENT_ADDRESS');
    const sender = new PublicKey(account);

    // Create transaction
    const transaction = new Transaction();
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: sender,
        toPubkey: recipient,
        lamports: 100000000, // 0.1 SOL
      })
    );

    // Set recent blockhash (in production, fetch from RPC)
    transaction.recentBlockhash = 'RECENT_BLOCKHASH';
    transaction.feePayer = sender;

    // Serialize transaction
    const serialized = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    const base64 = serialized.toString('base64');

    return res.status(200).json({
      transaction: base64,
      message: 'Payment transaction created',
    });
  } catch (error) {
    console.error('Transaction creation failed:', error);
    return res.status(500).json({ error: 'Transaction creation failed' });
  }
}
```

## QR Code Scanning

### Camera Permission

Request camera permission:

```typescript
import { Camera } from 'expo-camera';

const requestCameraPermission = async () => {
  const { status } = await Camera.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    alert('Camera permission is required to scan QR codes');
    return false;
  }
  return true;
};
```

### QR Code Scanner Component

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { parseURL } from '@solana/pay';

interface QRScannerProps {
  onScan: (url: URL) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);

    try {
      const url = new URL(data);
      
      // Validate it's a Solana Pay URL
      if (url.protocol === 'solana:') {
        onScan(url);
      } else {
        alert('Invalid Solana Pay QR code');
        setScanned(false);
      }
    } catch (error) {
      alert('Failed to parse QR code');
      setScanned(false);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
      
      <View style={styles.overlay}>
        <Text style={styles.instructions}>
          Scan a Solana Pay QR code
        </Text>
        
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  instructions: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
    marginTop: 50,
  },
  closeButton: {
    backgroundColor: '#9945FF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 50,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

## Processing Payments

### Parse and Execute Payment Request

```typescript
import { parseURL, validateTransfer } from '@solana/pay';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol';

const processPayment = async (
  url: URL,
  authToken: string,
  connection: Connection
) => {
  try {
    // Parse the Solana Pay URL
    const { recipient, amount, splToken, label, message, memo } = parseURL(url);

    // Execute payment via wallet adapter
    const signature = await transact(async (wallet) => {
      // Reauthorize
      const authorization = await wallet.reauthorize({
        auth_token: authToken,
        identity: { name: 'Solana Pay App' },
      });

      const sender = new PublicKey(authorization.accounts[0].address);

      // Create transaction
      const transaction = new Transaction();

      if (splToken) {
        // SPL token transfer (requires token program instructions)
        // Implementation depends on token program
        throw new Error('SPL token transfers not implemented in this example');
      } else {
        // SOL transfer
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: sender,
            toPubkey: recipient,
            lamports: amount ? amount.toNumber() * 1e9 : 0,
          })
        );
      }

      // Add memo if provided
      if (memo) {
        // Add memo instruction
        // Implementation depends on memo program
      }

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = sender;

      // Serialize and sign
      const serialized = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });

      const [signedTx] = await wallet.signTransactions({
        transactions: [serialized],
      });

      // Send transaction
      const sig = await connection.sendRawTransaction(signedTx, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      // Confirm
      await connection.confirmTransaction({
        signature: sig,
        blockhash,
        lastValidBlockHeight,
      });

      return sig;
    });

    return { signature, label, message };
  } catch (error) {
    console.error('Payment processing failed:', error);
    throw error;
  }
};
```

## Complete Payment Flow

### Payment Screen Component

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { QRScanner } from './QRScanner';
import { PaymentQRCode } from './PaymentQRCode';
import { useWallet } from '../hooks/useWallet';
import { useConnection } from '../hooks/useConnection';
import { parseURL } from '@solana/pay';

export const PaymentScreen: React.FC = () => {
  const [scannerVisible, setScannerVisible] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { authToken, connected } = useWallet();
  const connection = useConnection();

  const handleScan = async (url: URL) => {
    setScannerVisible(false);

    if (!connected || !authToken) {
      Alert.alert('Error', 'Please connect your wallet first');
      return;
    }

    try {
      const { recipient, amount, label, message } = parseURL(url);

      // Confirm payment with user
      Alert.alert(
        'Confirm Payment',
        `Pay ${amount?.toString() || 'unknown'} SOL to ${label || 'recipient'}?\n\n${message || ''}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Pay',
            onPress: async () => {
              try {
                const result = await processPayment(url, authToken, connection);
                Alert.alert(
                  'Payment Successful',
                  `Transaction: ${result.signature}`
                );
              } catch (error) {
                Alert.alert('Payment Failed', 'Please try again');
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Invalid payment request');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Solana Pay</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setScannerVisible(true)}
      >
        <Text style={styles.buttonText}>Scan QR Code</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonSecondary]}
        onPress={() => setShowQR(true)}
      >
        <Text style={styles.buttonText}>Show My QR Code</Text>
      </TouchableOpacity>

      <Modal visible={scannerVisible} animationType="slide">
        <QRScanner
          onScan={handleScan}
          onClose={() => setScannerVisible(false)}
        />
      </Modal>

      <Modal visible={showQR} animationType="slide">
        <View style={styles.qrModal}>
          <PaymentQRCode />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowQR(false)}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#9945FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonSecondary: {
    backgroundColor: '#14F195',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  qrModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  closeButton: {
    backgroundColor: '#9945FF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 30,
  },
});
```

## Point of Sale (POS) Example

### Merchant POS Component

```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { encodeURL } from '@solana/pay';
import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';

export const MerchantPOS: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const merchantAddress = new PublicKey('YOUR_MERCHANT_ADDRESS');

  const generatePaymentQR = () => {
    if (!amount) {
      alert('Please enter an amount');
      return;
    }

    const url = encodeURL({
      recipient: merchantAddress,
      amount: new BigNumber(amount),
      label: 'Coffee Shop',
      message: `Order #${orderNumber || 'N/A'}`,
      memo: orderNumber || undefined,
    });

    setQrUrl(url.toString());
  };

  const resetPOS = () => {
    setAmount('');
    setOrderNumber('');
    setQrUrl(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Merchant POS</Text>

      {!qrUrl ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Amount (SOL)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Order Number (optional)"
            value={orderNumber}
            onChangeText={setOrderNumber}
          />

          <TouchableOpacity style={styles.button} onPress={generatePaymentQR}>
            <Text style={styles.buttonText}>Generate Payment QR</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.amountText}>{amount} SOL</Text>
          {orderNumber && (
            <Text style={styles.orderText}>Order #{orderNumber}</Text>
          )}

          <View style={styles.qrContainer}>
            <QRCode value={qrUrl} size={250} />
          </View>

          <Text style={styles.instructions}>
            Customer: Scan this QR code with your Solana wallet
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={resetPOS}
          >
            <Text style={styles.buttonText}>New Transaction</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#9945FF',
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  resetButton: {
    backgroundColor: '#14F195',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  amountText: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  orderText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
});
```

## Best Practices

1. **Validate URLs**: Always validate Solana Pay URLs before processing
2. **Confirm with User**: Show payment details and get confirmation
3. **Error Handling**: Handle QR scanning and payment errors gracefully
4. **Transaction Status**: Provide clear feedback on transaction status
5. **Amount Display**: Show amounts clearly with proper formatting
6. **Memo Usage**: Use memos for order tracking and reconciliation
7. **Security**: Validate recipient addresses and amounts
8. **Testing**: Test with small amounts on devnet first

## Common Use Cases

### E-Commerce Checkout

Generate payment QR at checkout:
```typescript
const checkoutUrl = encodeURL({
  recipient: merchantAddress,
  amount: new BigNumber(cartTotal),
  label: 'Online Store',
  message: `Order #${orderId}`,
  memo: orderId,
});
```

### Peer-to-Peer Payments

Request payment from friends:
```typescript
const p2pUrl = encodeURL({
  recipient: myAddress,
  amount: new BigNumber(splitAmount),
  label: 'Dinner Split',
  message: 'Your share of dinner',
});
```

### Donations

Accept donations with optional amounts:
```typescript
const donationUrl = encodeURL({
  recipient: charityAddress,
  label: 'Charity Donation',
  message: 'Support our cause',
  // No amount specified - user chooses
});
```

## Next Steps

- Complete [Mobile Exercises](../exercises/)
- Explore [Integration Projects](../../integration/README.md)
- Study [DeFi](../../defi/README.md) for advanced payment flows

## Additional Resources

- Solana Pay Specification: https://docs.solanapay.com
- Solana Pay GitHub: https://github.com/solana-labs/solana-pay
- Example Implementations: https://github.com/solana-labs/solana-pay/tree/master/examples

---

**Source**: Adapted from Solana Pay specification at https://docs.solanapay.com

**Repository**: solana-labs/solana-pay
**URL**: https://github.com/solana-labs/solana-pay
