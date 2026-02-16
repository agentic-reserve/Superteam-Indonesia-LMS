# Mobile Wallet Adapter

The Solana Mobile Wallet Adapter (MWA) is a protocol that enables mobile applications to connect to Solana wallets, request transaction signing, and interact with the blockchain. This section covers wallet adapter setup, usage patterns, and best practices for mobile dApp development.

## Overview

The Mobile Wallet Adapter provides a standardized way for mobile dApps to:

- Connect to installed wallet applications
- Request user authorization
- Sign transactions and messages
- Handle wallet sessions
- Support multiple wallet providers

## Key Concepts

### Wallet Adapter Protocol

The Mobile Wallet Adapter protocol defines how dApps and wallets communicate:

1. **Discovery**: dApp discovers available wallet apps on the device
2. **Authorization**: User authorizes the dApp to connect to their wallet
3. **Session**: Maintains a session between dApp and wallet
4. **Signing**: Wallet signs transactions or messages on behalf of the user
5. **Disconnection**: Clean session termination

### Supported Platforms

- **Android**: Native support via intent-based communication
- **iOS**: Support via URL schemes and universal links
- **Web**: Browser-based wallet adapter for mobile web apps

## Installation

### React Native

Install the Mobile Wallet Adapter packages:

```bash
npm install @solana-mobile/mobile-wallet-adapter-protocol @solana-mobile/mobile-wallet-adapter-protocol-web3js
```

Install required dependencies:

```bash
npm install @solana/web3.js react-native-get-random-values @react-native-async-storage/async-storage react-native-url-polyfill
```

### Expo

For Expo projects:

```bash
npx expo install @solana-mobile/mobile-wallet-adapter-protocol @solana-mobile/mobile-wallet-adapter-protocol-web3js
npx expo install @solana/web3.js react-native-get-random-values @react-native-async-storage/async-storage react-native-url-polyfill
```

## Configuration

### Polyfills

Add polyfills at the top of your entry file (`index.js` or `App.tsx`):

```typescript
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
```

### Android Configuration

Update `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest>
  <queries>
    <!-- Solana Mobile Wallet Adapter -->
    <intent>
      <action android:name="solana.mobilewalletadapter.action.SIGN_TRANSACTION" />
    </intent>
  </queries>
  
  <application>
    <!-- Your existing configuration -->
  </application>
</manifest>
```

Ensure minimum SDK version in `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        minSdkVersion 23  // Minimum for wallet adapter
        targetSdkVersion 33
    }
}
```

### iOS Configuration

Update `ios/YourApp/Info.plist`:

```xml
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>solana</string>
  <string>phantom</string>
  <string>solflare</string>
  <string>ultimate</string>
  <string>glow</string>
</array>
```

## Basic Usage

### Wallet Connection

Connect to a wallet and request authorization:

```typescript
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';

const connectWallet = async () => {
  try {
    const result = await transact(async (wallet) => {
      // Request authorization
      const authorization = await wallet.authorize({
        cluster: 'devnet',
        identity: {
          name: 'My Solana dApp',
          uri: 'https://myapp.com',
          icon: 'favicon.ico',
        },
      });
      
      // Get the authorized account
      const address = authorization.accounts[0].address;
      const publicKey = new PublicKey(address);
      
      return { publicKey, authToken: authorization.auth_token };
    });
    
    console.log('Connected:', result.publicKey.toBase58());
    return result;
  } catch (error) {
    console.error('Wallet connection failed:', error);
    throw error;
  }
};
```

### Reauthorization

Reuse an existing session with an auth token:

```typescript
const reauthorizeWallet = async (authToken: string) => {
  try {
    const result = await transact(async (wallet) => {
      // Reauthorize with existing token
      const authorization = await wallet.reauthorize({
        auth_token: authToken,
        identity: {
          name: 'My Solana dApp',
          uri: 'https://myapp.com',
          icon: 'favicon.ico',
        },
      });
      
      const address = authorization.accounts[0].address;
      const publicKey = new PublicKey(address);
      
      return { publicKey, authToken: authorization.auth_token };
    });
    
    return result;
  } catch (error) {
    console.error('Reauthorization failed:', error);
    // Fall back to full authorization
    return connectWallet();
  }
};
```

### Transaction Signing

Sign and send a transaction:

```typescript
import { Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

const sendTransaction = async (
  recipientAddress: string,
  amount: number,
  authToken: string
) => {
  const connection = new Connection(clusterApiUrl('devnet'));
  
  try {
    const signature = await transact(async (wallet) => {
      // Reauthorize
      const authorization = await wallet.reauthorize({
        auth_token: authToken,
        identity: { name: 'My Solana dApp' },
      });
      
      const senderPubkey = new PublicKey(authorization.accounts[0].address);
      const recipientPubkey = new PublicKey(recipientAddress);
      
      // Create transaction
      const transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: senderPubkey,
          toPubkey: recipientPubkey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );
      
      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = 
        await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = senderPubkey;
      
      // Serialize unsigned transaction
      const serializedTransaction = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      
      // Sign with wallet
      const signedTransactions = await wallet.signTransactions({
        transactions: [serializedTransaction],
      });
      
      // Send signed transaction
      const signature = await connection.sendRawTransaction(
        signedTransactions[0],
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        }
      );
      
      // Confirm transaction
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });
      
      return signature;
    });
    
    console.log('Transaction successful:', signature);
    return signature;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
};
```

### Message Signing

Sign an arbitrary message:

```typescript
const signMessage = async (message: string, authToken: string) => {
  try {
    const result = await transact(async (wallet) => {
      // Reauthorize
      const authorization = await wallet.reauthorize({
        auth_token: authToken,
        identity: { name: 'My Solana dApp' },
      });
      
      // Convert message to bytes
      const messageBytes = new TextEncoder().encode(message);
      
      // Sign message
      const signedMessages = await wallet.signMessages({
        addresses: [authorization.accounts[0].address],
        payloads: [messageBytes],
      });
      
      return {
        signature: signedMessages[0],
        address: authorization.accounts[0].address,
      };
    });
    
    console.log('Message signed:', result);
    return result;
  } catch (error) {
    console.error('Message signing failed:', error);
    throw error;
  }
};
```

## Advanced Patterns

### Session Management

Manage wallet sessions with persistent storage:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'wallet_auth_token';

// Save auth token
const saveAuthToken = async (authToken: string) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, authToken);
  } catch (error) {
    console.error('Failed to save auth token:', error);
  }
};

// Load auth token
const loadAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to load auth token:', error);
    return null;
  }
};

// Clear auth token
const clearAuthToken = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear auth token:', error);
  }
};

// Disconnect wallet
const disconnectWallet = async () => {
  try {
    const authToken = await loadAuthToken();
    if (authToken) {
      await transact(async (wallet) => {
        await wallet.deauthorize({ auth_token: authToken });
      });
    }
  } catch (error) {
    console.error('Deauthorization failed:', error);
  } finally {
    await clearAuthToken();
  }
};
```

### Multiple Wallet Support

Handle multiple wallet providers:

```typescript
const getAvailableWallets = () => {
  // This is a simplified example
  // In practice, you'd query the system for installed wallet apps
  return [
    { name: 'Phantom', packageName: 'app.phantom' },
    { name: 'Solflare', packageName: 'com.solflare' },
    { name: 'Ultimate', packageName: 'com.ultimate' },
  ];
};

const connectToSpecificWallet = async (walletPackage: string) => {
  // Implementation depends on platform-specific wallet discovery
  // This is a conceptual example
  console.log(`Connecting to ${walletPackage}`);
  return connectWallet();
};
```

### Error Handling

Robust error handling for wallet operations:

```typescript
enum WalletError {
  USER_DECLINED = 'USER_DECLINED',
  NO_WALLET_FOUND = 'NO_WALLET_FOUND',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_TRANSACTION = 'INVALID_TRANSACTION',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
}

const handleWalletError = (error: any): WalletError => {
  if (error.message?.includes('User declined')) {
    return WalletError.USER_DECLINED;
  }
  if (error.message?.includes('No wallet')) {
    return WalletError.NO_WALLET_FOUND;
  }
  if (error.message?.includes('Network')) {
    return WalletError.NETWORK_ERROR;
  }
  if (error.message?.includes('auth_token')) {
    return WalletError.SESSION_EXPIRED;
  }
  return WalletError.INVALID_TRANSACTION;
};

const safeTransact = async (operation: () => Promise<any>) => {
  try {
    return await operation();
  } catch (error) {
    const errorType = handleWalletError(error);
    
    switch (errorType) {
      case WalletError.USER_DECLINED:
        console.log('User declined the request');
        break;
      case WalletError.NO_WALLET_FOUND:
        console.log('No compatible wallet found. Please install a Solana wallet.');
        break;
      case WalletError.SESSION_EXPIRED:
        console.log('Session expired. Please reconnect your wallet.');
        await clearAuthToken();
        break;
      default:
        console.error('Wallet operation failed:', error);
    }
    
    throw error;
  }
};
```

## React Hooks

Create reusable hooks for wallet operations:

```typescript
import { useState, useEffect, useCallback } from 'react';

interface WalletState {
  publicKey: PublicKey | null;
  authToken: string | null;
  connected: boolean;
  connecting: boolean;
}

export const useWallet = () => {
  const [state, setState] = useState<WalletState>({
    publicKey: null,
    authToken: null,
    connected: false,
    connecting: false,
  });

  // Load saved session on mount
  useEffect(() => {
    const loadSession = async () => {
      const authToken = await loadAuthToken();
      if (authToken) {
        try {
          const result = await reauthorizeWallet(authToken);
          setState({
            publicKey: result.publicKey,
            authToken: result.authToken,
            connected: true,
            connecting: false,
          });
        } catch (error) {
          await clearAuthToken();
        }
      }
    };
    
    loadSession();
  }, []);

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, connecting: true }));
    
    try {
      const result = await connectWallet();
      await saveAuthToken(result.authToken);
      
      setState({
        publicKey: result.publicKey,
        authToken: result.authToken,
        connected: true,
        connecting: false,
      });
    } catch (error) {
      setState(prev => ({ ...prev, connecting: false }));
      throw error;
    }
  }, []);

  const disconnect = useCallback(async () => {
    await disconnectWallet();
    setState({
      publicKey: null,
      authToken: null,
      connected: false,
      connecting: false,
    });
  }, []);

  const signAndSendTransaction = useCallback(
    async (transaction: Transaction) => {
      if (!state.authToken) {
        throw new Error('Wallet not connected');
      }
      
      // Implementation similar to sendTransaction example above
      // ...
    },
    [state.authToken]
  );

  return {
    ...state,
    connect,
    disconnect,
    signAndSendTransaction,
  };
};
```

## Testing

### Testing with Fake Wallet

Create a fake wallet for testing:

```typescript
// For testing purposes only
const createFakeWallet = () => ({
  authorize: async () => ({
    accounts: [{ address: 'FakeAddress123...' }],
    auth_token: 'fake_token',
  }),
  reauthorize: async () => ({
    accounts: [{ address: 'FakeAddress123...' }],
    auth_token: 'fake_token',
  }),
  signTransactions: async ({ transactions }) => transactions,
  signMessages: async ({ payloads }) => payloads,
  deauthorize: async () => {},
});
```

### Testing on Emulator

1. Install a compatible wallet app on your emulator
2. Run your dApp
3. Test wallet connection flow
4. Verify transaction signing works correctly

### Testing on Physical Device

1. Install your dApp and a wallet app on a physical device
2. Test the complete user flow
3. Verify deep linking works correctly
4. Test network error scenarios

## Best Practices

1. **Session Management**: Persist auth tokens securely and handle session expiration
2. **Error Handling**: Provide clear error messages and recovery options
3. **User Feedback**: Show loading states during wallet operations
4. **Wallet Discovery**: Help users find and install compatible wallets
5. **Transaction Confirmation**: Provide clear feedback on transaction status
6. **Security**: Never store private keys; always use wallet for signing
7. **Testing**: Test on multiple devices and wallet providers
8. **Graceful Degradation**: Handle cases where no wallet is installed

## Common Issues

### No Wallet Found

**Problem**: "No compatible wallet found" error

**Solution**:
- Ensure wallet app is installed on the device
- Verify AndroidManifest.xml has correct intent filters
- Check iOS Info.plist has correct URL schemes
- Provide users with wallet installation links

### Authorization Failed

**Problem**: Authorization request fails or times out

**Solution**:
- Check network connectivity
- Verify wallet app is up to date
- Ensure correct cluster is specified (devnet/mainnet)
- Try clearing app data and reconnecting

### Transaction Signing Fails

**Problem**: Transaction signing returns an error

**Solution**:
- Verify transaction is properly constructed
- Check that feePayer has sufficient SOL for fees
- Ensure recent blockhash is valid
- Verify all required signatures are present

### Session Expired

**Problem**: Reauthorization fails with expired token

**Solution**:
- Clear stored auth token
- Request fresh authorization
- Implement automatic reconnection logic

## Wallet Adapter Comparison

### React Native vs Web

| Feature | React Native | Web |
|---------|-------------|-----|
| **Platform** | Native iOS/Android | Mobile browsers |
| **Serialization** | Serialize to bytes | Transaction object |
| **Sign Method** | `wallet.signTransactions()` | `signTransaction()` |
| **Send Method** | `sendRawTransaction()` | `sendRawTransaction()` |
| **Session** | Persistent with auth token | Browser-based |
| **Deep Linking** | Native intents/URL schemes | Universal links |

### Mobile vs Desktop

| Feature | Mobile Wallet Adapter | Desktop Wallet Adapter |
|---------|---------------------|---------------------|
| **Connection** | Intent/URL scheme | Browser extension |
| **Authorization** | Explicit auth flow | Auto-connect |
| **Session** | Token-based | Persistent |
| **Signing** | External wallet app | In-browser |
| **UX** | App switching | Seamless |

## Next Steps

After mastering the Mobile Wallet Adapter:

1. **Build a React Native dApp**: Apply wallet integration in a full app ([React Native Integration](../02-react-native/README.md))
2. **Explore Expo**: Use Expo for rapid development ([Expo Template](../03-expo-template/README.md))
3. **Implement Payments**: Add Solana Pay integration ([Solana Pay](../04-solana-pay/README.md))
4. **Practice**: Complete [Mobile Exercises](../exercises/)

## Additional Resources

- **Mobile Wallet Adapter Specification**: https://github.com/solana-mobile/mobile-wallet-adapter/blob/main/spec/spec.md
- **Solana Mobile Documentation**: https://docs.solanamobile.com
- **Example Apps**: https://github.com/solana-mobile/mobile-wallet-adapter/tree/main/examples
- **Wallet Adapter Protocol**: https://github.com/solana-mobile/mobile-wallet-adapter-protocol

---

**Source**: Adapted from Solana Mobile Wallet Adapter documentation at https://github.com/solana-mobile/mobile-wallet-adapter and examples from https://docs.solanamobile.com

**Repository**: solana-mobile/mobile-wallet-adapter
**File Path**: `mobile-wallet-adapter/examples/example-react-native-app/`
**URL**: https://github.com/solana-mobile/mobile-wallet-adapter
