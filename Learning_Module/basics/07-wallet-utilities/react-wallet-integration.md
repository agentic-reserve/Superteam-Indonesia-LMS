# React Wallet Integration

Learn how to connect Solana wallets (Phantom, Solflare, etc.) to your React applications using the wallet-adapter library.

## Overview

Solana's [wallet-adapter](https://github.com/anza-xyz/wallet-adapter) makes it easy to manage wallet connections in frontend applications. It provides:

- Multi-wallet support (Phantom, Solflare, Ledger, etc.)
- Auto-connect functionality
- React hooks for wallet state
- Pre-built UI components

## Quick Start Template

Deploy a complete Next.js + Solana example:

- [Deploy on Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsolana-developers%2Fanchor-web3js-nextjs)
- [View Demo](https://anchor-web3js-nextjs-jade.vercel.app/)
- [Source Code](https://github.com/solana-developers/anchor-web3js-nextjs)

## Installation

```bash
npm install @solana/web3.js \
  @solana/wallet-adapter-base \
  @solana/wallet-adapter-react \
  @solana/wallet-adapter-react-ui \
  @solana/wallet-adapter-wallets
```

## Setup

### 1. Create Solana Provider

Create a provider component to wrap your application:

```tsx
// components/SolanaProvider.tsx
"use client";

import React, { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

// Import wallet adapter CSS
import "@solana/wallet-adapter-react-ui/styles.css";

interface SolanaProviderProps {
  children: ReactNode;
}

export const SolanaProvider: FC<SolanaProviderProps> = ({ children }) => {
  // Network can be 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;
  
  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
```

### 2. Wrap Your Application

Add the provider to your root layout:

```tsx
// app/layout.tsx
import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import { SolanaProvider } from "@/components/SolanaProvider";

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <SolanaProvider>
          {children}
        </SolanaProvider>
      </body>
    </html>
  );
}
```

### 3. Add Wallet Connect Button

Use the pre-built wallet button component:

```tsx
// components/WalletButton.tsx
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function WalletButton() {
  return <WalletMultiButton />;
}
```

## Using Wallet in Components

### Access Wallet State

```tsx
"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useState } from "react";

export function WalletInfo() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  
  useEffect(() => {
    if (publicKey) {
      // Fetch balance
      connection.getBalance(publicKey).then(bal => {
        setBalance(bal / LAMPORTS_PER_SOL);
      });
    }
  }, [publicKey, connection]);
  
  if (!connected) {
    return <div>Please connect your wallet</div>;
  }
  
  return (
    <div>
      <p>Address: {publicKey?.toBase58()}</p>
      <p>Balance: {balance} SOL</p>
    </div>
  );
}
```

### Send Transaction

```tsx
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  Transaction,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";

export function SendTransaction() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  
  async function handleSend() {
    if (!publicKey) return;
    
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey("RECIPIENT_ADDRESS"),
        lamports: 0.1 * LAMPORTS_PER_SOL
      })
    );
    
    try {
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");
      console.log("Transaction successful:", signature);
    } catch (error) {
      console.error("Transaction failed:", error);
    }
  }
  
  return (
    <button onClick={handleSend} disabled={!publicKey}>
      Send 0.1 SOL
    </button>
  );
}
```

## Available Hooks

### useWallet

```tsx
const {
  publicKey,        // User's public key
  connected,        // Connection status
  connecting,       // Connecting status
  disconnecting,    // Disconnecting status
  wallet,           // Current wallet adapter
  wallets,          // Available wallets
  select,           // Select wallet function
  connect,          // Connect function
  disconnect,       // Disconnect function
  sendTransaction,  // Send transaction function
  signTransaction,  // Sign transaction function
  signAllTransactions, // Sign multiple transactions
  signMessage       // Sign arbitrary message
} = useWallet();
```

### useConnection

```tsx
const { connection } = useConnection();

// Use connection for RPC calls
const balance = await connection.getBalance(publicKey);
const blockHeight = await connection.getBlockHeight();
```

## Custom Wallet Selection

### Specify Supported Wallets

```tsx
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

export const SolanaProvider: FC<SolanaProviderProps> = ({ children }) => {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter()
    ],
    []
  );
  
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
```

## Styling

### Custom Button Styles

```tsx
<WalletMultiButton 
  style={{
    backgroundColor: '#512da8',
    color: 'white',
    borderRadius: '8px'
  }}
/>
```

### CSS Customization

```css
/* Override default styles */
.wallet-adapter-button {
  background-color: #512da8;
  border-radius: 8px;
}

.wallet-adapter-button:hover {
  background-color: #6a1b9a;
}
```

## Error Handling

```tsx
import { WalletError } from "@solana/wallet-adapter-base";

function MyComponent() {
  const { sendTransaction } = useWallet();
  
  async function handleTransaction() {
    try {
      await sendTransaction(transaction, connection);
    } catch (error) {
      if (error instanceof WalletError) {
        console.error("Wallet error:", error.message);
        // Handle wallet-specific errors
      } else {
        console.error("Transaction error:", error);
      }
    }
  }
}
```

## Best Practices

✅ **Do**:
- Always check if wallet is connected
- Handle connection errors gracefully
- Provide clear user feedback
- Test with multiple wallets
- Use auto-connect for better UX

❌ **Don't**:
- Assume wallet is always connected
- Ignore error states
- Block UI during connection
- Force specific wallet
- Store private keys

## Common Patterns

### Protected Route

```tsx
function ProtectedPage() {
  const { connected } = useWallet();
  
  if (!connected) {
    return (
      <div>
        <h1>Please connect your wallet</h1>
        <WalletMultiButton />
      </div>
    );
  }
  
  return <div>Protected content</div>;
}
```

### Transaction Status

```tsx
function TransactionStatus() {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  
  async function sendTx() {
    setStatus('pending');
    try {
      await sendTransaction(tx, connection);
      setStatus('success');
    } catch (error) {
      setStatus('error');
    }
  }
  
  return (
    <div>
      {status === 'pending' && <Spinner />}
      {status === 'success' && <Success />}
      {status === 'error' && <Error />}
    </div>
  );
}
```

---

## Summary

- Use wallet-adapter for easy wallet integration
- Wrap app in SolanaProvider
- Use useWallet and useConnection hooks
- Handle connection states properly
- Test with multiple wallets
- Provide good user experience

---

## Next Steps

- Build a complete dApp with wallet integration
- Explore [Transactions](../02-transactions/README.md)
- Learn about [Tokens](../03-tokens/README.md)
- Try [Integration Projects](../../integration/README.md)

---

**Source**: [Solana Cookbook](https://solana.com/developers/cookbook/wallets/)
**Last Updated**: February 17, 2026
