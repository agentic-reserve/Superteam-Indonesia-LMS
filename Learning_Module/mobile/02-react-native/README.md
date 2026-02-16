# React Native Integration

React Native enables you to build cross-platform mobile dApps for iOS and Android using JavaScript and React. This section covers integrating Solana into React Native applications, including project setup, SDK integration, state management, and mobile-specific considerations.

## Overview

React Native provides a framework for building native mobile apps using React. When combined with Solana's JavaScript SDK and Mobile Wallet Adapter, you can create powerful mobile dApps that interact with the Solana blockchain.

## Prerequisites

- React Native development environment configured (see [Mobile Environment Setup](../../setup/mobile-environment.md))
- Understanding of React and React hooks
- Familiarity with JavaScript/TypeScript
- Basic knowledge of Solana concepts (accounts, transactions)

## Project Setup

### Create a New React Native Project

```bash
npx react-native@latest init SolanaMobileDApp
cd SolanaMobileDApp
```

### Install Solana Dependencies

```bash
npm install @solana/web3.js @solana-mobile/mobile-wallet-adapter-protocol @solana-mobile/mobile-wallet-adapter-protocol-web3js
```

### Install Required Polyfills

React Native requires polyfills for Node.js modules:

```bash
npm install react-native-get-random-values @react-native-async-storage/async-storage react-native-url-polyfill buffer
```

### Install Additional Dependencies

```bash
npm install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
```

## Configuration

### Setup Polyfills

Create `src/polyfills.ts`:

```typescript
// Import polyfills at the very top
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { Buffer } from 'buffer';

// Make Buffer available globally
global.Buffer = Buffer;
```

Import polyfills at the top of `index.js`:

```javascript
import './src/polyfills';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
```

### Metro Configuration

Update `metro.config.js` to handle Solana dependencies:

```javascript
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    extraNodeModules: {
      crypto: require.resolve('react-native-get-random-values'),
      stream: require.resolve('readable-stream'),
      buffer: require.resolve('buffer'),
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
```

### TypeScript Configuration

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "lib": ["es2017"],
    "allowJs": true,
    "jsx": "react-native",
    "noEmit": true,
    "isolatedModules": true,
    "strict": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

## Project Structure

Organize your React Native Solana dApp:

```
SolanaMobileDApp/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── WalletButton.tsx
│   │   ├── TransactionForm.tsx
│   │   └── BalanceDisplay.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useWallet.ts
│   │   ├── useConnection.ts
│   │   └── useBalance.ts
│   ├── screens/            # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── WalletScreen.tsx
│   │   └── TransferScreen.tsx
│   ├── services/           # Business logic
│   │   ├── wallet.ts
│   │   ├── transaction.ts
│   │   └── storage.ts
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   └── format.ts
│   └── polyfills.ts        # Polyfill imports
├── App.tsx                 # Root component
├── index.js                # Entry point
└── package.json
```

## Core Implementation

### Wallet Service

Create `src/services/wallet.ts`:

```typescript
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol';
import { PublicKey } from '@solana/web3.js';

export interface WalletAccount {
  publicKey: PublicKey;
  authToken: string;
}

export const authorizeWallet = async (): Promise<WalletAccount> => {
  const result = await transact(async (wallet) => {
    const authorization = await wallet.authorize({
      cluster: 'devnet',
      identity: {
        name: 'Solana Mobile dApp',
        uri: 'https://myapp.com',
        icon: 'favicon.ico',
      },
    });

    return {
      publicKey: new PublicKey(authorization.accounts[0].address),
      authToken: authorization.auth_token,
    };
  });

  return result;
};

export const reauthorizeWallet = async (
  authToken: string
): Promise<WalletAccount> => {
  const result = await transact(async (wallet) => {
    const authorization = await wallet.reauthorize({
      auth_token: authToken,
      identity: {
        name: 'Solana Mobile dApp',
      },
    });

    return {
      publicKey: new PublicKey(authorization.accounts[0].address),
      authToken: authorization.auth_token,
    };
  });

  return result;
};

export const deauthorizeWallet = async (authToken: string): Promise<void> => {
  await transact(async (wallet) => {
    await wallet.deauthorize({ auth_token: authToken });
  });
};
```

### Storage Service

Create `src/services/storage.ts`:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  AUTH_TOKEN: '@wallet_auth_token',
  PUBLIC_KEY: '@wallet_public_key',
};

export const saveWalletSession = async (
  authToken: string,
  publicKey: string
): Promise<void> => {
  await AsyncStorage.multiSet([
    [KEYS.AUTH_TOKEN, authToken],
    [KEYS.PUBLIC_KEY, publicKey],
  ]);
};

export const loadWalletSession = async (): Promise<{
  authToken: string | null;
  publicKey: string | null;
}> => {
  const values = await AsyncStorage.multiGet([KEYS.AUTH_TOKEN, KEYS.PUBLIC_KEY]);
  return {
    authToken: values[0][1],
    publicKey: values[1][1],
  };
};

export const clearWalletSession = async (): Promise<void> => {
  await AsyncStorage.multiRemove([KEYS.AUTH_TOKEN, KEYS.PUBLIC_KEY]);
};
```

### Connection Hook

Create `src/hooks/useConnection.ts`:

```typescript
import { useMemo } from 'react';
import { Connection, clusterApiUrl } from '@solana/web3.js';

export const useConnection = (cluster: 'devnet' | 'mainnet-beta' = 'devnet') => {
  const connection = useMemo(() => {
    return new Connection(clusterApiUrl(cluster), 'confirmed');
  }, [cluster]);

  return connection;
};
```

### Wallet Hook

Create `src/hooks/useWallet.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import {
  authorizeWallet,
  reauthorizeWallet,
  deauthorizeWallet,
} from '../services/wallet';
import {
  saveWalletSession,
  loadWalletSession,
  clearWalletSession,
} from '../services/storage';

interface WalletState {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
}

export const useWallet = () => {
  const [state, setState] = useState<WalletState>({
    publicKey: null,
    connected: false,
    connecting: false,
  });
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Load saved session on mount
  useEffect(() => {
    const loadSession = async () => {
      const session = await loadWalletSession();
      if (session.authToken && session.publicKey) {
        try {
          const result = await reauthorizeWallet(session.authToken);
          setState({
            publicKey: result.publicKey,
            connected: true,
            connecting: false,
          });
          setAuthToken(result.authToken);
        } catch (error) {
          console.error('Failed to restore session:', error);
          await clearWalletSession();
        }
      }
    };

    loadSession();
  }, []);

  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, connecting: true }));

    try {
      const result = await authorizeWallet();
      await saveWalletSession(
        result.authToken,
        result.publicKey.toBase58()
      );

      setState({
        publicKey: result.publicKey,
        connected: true,
        connecting: false,
      });
      setAuthToken(result.authToken);
    } catch (error) {
      console.error('Connection failed:', error);
      setState((prev) => ({ ...prev, connecting: false }));
      throw error;
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (authToken) {
      try {
        await deauthorizeWallet(authToken);
      } catch (error) {
        console.error('Deauthorization failed:', error);
      }
    }

    await clearWalletSession();
    setState({
      publicKey: null,
      connected: false,
      connecting: false,
    });
    setAuthToken(null);
  }, [authToken]);

  return {
    ...state,
    authToken,
    connect,
    disconnect,
  };
};
```

### Balance Hook

Create `src/hooks/useBalance.ts`:

```typescript
import { useState, useEffect } from 'react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useConnection } from './useConnection';

export const useBalance = (publicKey: PublicKey | null) => {
  const connection = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      setLoading(true);
      try {
        const lamports = await connection.getBalance(publicKey);
        setBalance(lamports / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
        setBalance(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();

    // Poll for balance updates every 10 seconds
    const interval = setInterval(fetchBalance, 10000);

    return () => clearInterval(interval);
  }, [publicKey, connection]);

  return { balance, loading };
};
```

## UI Components

### Wallet Button Component

Create `src/components/WalletButton.tsx`:

```typescript
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useWallet } from '../hooks/useWallet';

export const WalletButton: React.FC = () => {
  const { connected, connecting, publicKey, connect, disconnect } = useWallet();

  const handlePress = async () => {
    try {
      if (connected) {
        await disconnect();
      } else {
        await connect();
      }
    } catch (error) {
      console.error('Wallet operation failed:', error);
    }
  };

  const getButtonText = () => {
    if (connecting) return 'Connecting...';
    if (connected && publicKey) {
      return `${publicKey.toBase58().slice(0, 4)}...${publicKey
        .toBase58()
        .slice(-4)}`;
    }
    return 'Connect Wallet';
  };

  return (
    <TouchableOpacity
      style={[styles.button, connected && styles.buttonConnected]}
      onPress={handlePress}
      disabled={connecting}
    >
      {connecting ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonText}>{getButtonText()}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#9945FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonConnected: {
    backgroundColor: '#14F195',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### Balance Display Component

Create `src/components/BalanceDisplay.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useWallet } from '../hooks/useWallet';
import { useBalance } from '../hooks/useBalance';

export const BalanceDisplay: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const { balance, loading } = useBalance(publicKey);

  if (!connected) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Balance</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text style={styles.balance}>
          {balance !== null ? `${balance.toFixed(4)} SOL` : 'Error loading balance'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  balance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
});
```

### Transaction Form Component

Create `src/components/TransactionForm.tsx`:

```typescript
import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol';
import { useWallet } from '../hooks/useWallet';
import { useConnection } from '../hooks/useConnection';

export const TransactionForm: React.FC = () => {
  const { publicKey, authToken, connected } = useWallet();
  const connection = useConnection();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!connected || !publicKey || !authToken) {
      Alert.alert('Error', 'Please connect your wallet first');
      return;
    }

    if (!recipient || !amount) {
      Alert.alert('Error', 'Please enter recipient and amount');
      return;
    }

    try {
      setSending(true);

      const recipientPubkey = new PublicKey(recipient);
      const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;

      const signature = await transact(async (wallet) => {
        // Reauthorize
        const authorization = await wallet.reauthorize({
          auth_token: authToken,
          identity: { name: 'Solana Mobile dApp' },
        });

        const senderPubkey = new PublicKey(authorization.accounts[0].address);

        // Create transaction
        const transaction = new Transaction();
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: senderPubkey,
            toPubkey: recipientPubkey,
            lamports,
          })
        );

        // Get recent blockhash
        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = senderPubkey;

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

      Alert.alert('Success', `Transaction sent: ${signature}`);
      setRecipient('');
      setAmount('');
    } catch (error) {
      console.error('Transaction failed:', error);
      Alert.alert('Error', 'Transaction failed. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!connected) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send SOL</Text>

      <TextInput
        style={styles.input}
        placeholder="Recipient Address"
        value={recipient}
        onChangeText={setRecipient}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Amount (SOL)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
      />

      <TouchableOpacity
        style={[styles.button, sending && styles.buttonDisabled]}
        onPress={handleSend}
        disabled={sending}
      >
        {sending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Send Transaction</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#9945FF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

## Main App Component

Update `App.tsx`:

```typescript
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Text } from 'react-native';
import { WalletButton } from './src/components/WalletButton';
import { BalanceDisplay } from './src/components/BalanceDisplay';
import { TransactionForm } from './src/components/TransactionForm';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Solana Mobile dApp</Text>
          <WalletButton />
        </View>

        <BalanceDisplay />
        <TransactionForm />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default App;
```

## Running the App

### Android

```bash
npm run android
```

### iOS

```bash
cd ios && pod install && cd ..
npm run ios
```

## Best Practices

1. **Error Handling**: Always wrap wallet operations in try-catch blocks
2. **Loading States**: Show loading indicators during async operations
3. **User Feedback**: Provide clear feedback for all user actions
4. **Session Management**: Persist wallet sessions securely
5. **Network Handling**: Handle network errors gracefully
6. **Performance**: Optimize re-renders with useMemo and useCallback
7. **Testing**: Test on both Android and iOS devices
8. **Security**: Never store private keys in the app

## Common Issues

### Polyfill Errors

**Problem**: "crypto.getRandomValues is not a function"

**Solution**: Ensure polyfills are imported at the very top of `index.js`

### Metro Bundler Issues

**Problem**: Module resolution errors

**Solution**: Clear cache and restart:
```bash
npm start -- --reset-cache
```

### Transaction Failures

**Problem**: Transactions fail to send

**Solution**: 
- Verify network connectivity
- Check account has sufficient SOL for fees
- Ensure recent blockhash is valid

## Next Steps

- Explore [Expo Template](../03-expo-template/README.md) for simplified development
- Learn about [Solana Pay](../04-solana-pay/README.md) integration
- Complete [Mobile Exercises](../exercises/)

## Additional Resources

- React Native Documentation: https://reactnative.dev
- Solana Web3.js: https://solana-labs.github.io/solana-web3.js
- Mobile Wallet Adapter: https://github.com/solana-mobile/mobile-wallet-adapter

---

**Source**: Adapted from React Native documentation at https://reactnative.dev and Solana Mobile examples at https://github.com/solana-mobile/mobile-wallet-adapter

**Repository**: solana-mobile/mobile-wallet-adapter
**File Path**: `mobile-wallet-adapter/examples/example-react-native-app/`
**URL**: https://github.com/solana-mobile/mobile-wallet-adapter
