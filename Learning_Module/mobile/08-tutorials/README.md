# Mobile dApp Tutorials

Step-by-step tutorials for building real Solana mobile applications. These hands-on guides walk you through complete projects from setup to deployment.

## Overview

This section provides comprehensive tutorials that teach mobile dApp development through practical, real-world projects. Each tutorial builds progressively on concepts from previous sections and includes complete, working code examples.

## What You'll Learn

In this section, you will learn:

- **First dApp**: Build your first mobile dApp with wallet connection
- **Memo Program**: Write messages to the Solana blockchain
- **Anchor Integration**: Integrate Anchor programs into mobile apps
- **Counter dApp**: Build a complete counter app with Anchor
- **NFT Minter**: Create a mobile NFT minting application
- **Advanced Patterns**: Learn production-ready development patterns

## Prerequisites

Before starting these tutorials, you should:

- Complete [Mobile Wallet Adapter](../01-wallet-adapter/README.md)
- Complete [React Native Integration](../02-react-native/README.md)
- Complete [Scaffolding & Templates](../05-scaffolding-templates/README.md)
- Have your [mobile development environment](../../setup/mobile-environment.md) configured
- Have an MWA-compatible wallet installed on your device/emulator

## Tutorial Structure

### Tutorial 1: Your First Mobile dApp

**Level**: Beginner
**Time**: 1-2 hours
**Path**: [01-first-dapp.md](01-first-dapp.md)

Build your first React Native dApp that connects to a wallet and sends a message to the Solana network using the Memo program.

**What you'll build**:
- Wallet connection with MWA
- Balance checking and airdrops
- Memo program transaction
- Solana Explorer integration

**Key Concepts**:
- Mobile Wallet Adapter basics
- Transaction construction
- Transaction confirmation
- Explorer navigation

**Prerequisites**:
- React Native basics
- JavaScript/TypeScript knowledge
- Android emulator or device
- MWA-compatible wallet installed

### Tutorial 2: Anchor Counter dApp

**Level**: Intermediate
**Time**: 2-3 hours
**Path**: [02-anchor-counter.md](02-anchor-counter.md)

Build a counter application that integrates with an Anchor program, demonstrating how to work with custom Solana programs in mobile apps.

**What you'll build**:
- Anchor program integration
- Counter increment/decrement
- PDA account management
- Program state reading

**Key Concepts**:
- Anchor Wallet creation
- IDL import and usage
- Program instruction generation
- Account derivation

**Prerequisites**:
- Complete Tutorial 1
- Basic Anchor knowledge
- Understanding of PDAs

### Tutorial 3: Mobile NFT Minter

**Level**: Intermediate
**Time**: 3-4 hours
**Path**: [03-nft-minter.md](03-nft-minter.md)

Create a mobile application that mints NFTs using Metaplex, including image upload and metadata management.

**What you'll build**:
- NFT minting interface
- Image selection and upload
- Metadata creation
- Collection management

**Key Concepts**:
- Metaplex integration
- IPFS/Arweave upload
- NFT standards
- Mobile file handling

**Prerequisites**:
- Complete Tutorial 1
- Understanding of NFT standards
- Metaplex basics

### Tutorial 4: Hello World Deep Dive

**Level**: Beginner
**Time**: 2-3 hours
**Path**: [04-hello-world.md](04-hello-world.md)

A comprehensive tutorial that teaches how to build MWA UI components from scratch, providing deep understanding of wallet integration patterns.

**What you'll build**:
- Custom wallet connection UI
- Authorization flow
- Transaction signing components
- Session management

**Key Concepts**:
- MWA protocol details
- Authorization vs Reauthorization
- Session token management
- Error handling patterns

**Prerequisites**:
- React Native basics
- Understanding of MWA concepts

## Tutorial Quick Start

### Setup

All tutorials start from the React Native dApp Scaffold:

```bash
npx react-native init MyTutorialApp --template @solana-mobile/solana-mobile-dapp-scaffold --npm
cd MyTutorialApp
npm install
```

### Run on Device

```bash
npx react-native run-android
```

### Common Setup

Each tutorial assumes you have:

1. **Android Device/Emulator**
   - Running Android API 23+
   - Developer mode enabled

2. **MWA Wallet**
   - Phantom, Solflare, or Fakewallet
   - Installed on same device

3. **Development Tools**
   - Node.js 18+
   - Android Studio
   - React Native CLI

## Tutorial Progression

### Beginner Path

1. **First dApp** → Learn MWA basics and simple transactions
2. **Hello World** → Deep dive into MWA UI components
3. **Practice** → Build variations and experiment

### Intermediate Path

1. Complete Beginner Path
2. **Anchor Counter** → Learn program integration
3. **NFT Minter** → Work with Metaplex
4. **Build Projects** → Create your own apps

### Advanced Path

1. Complete Intermediate Path
2. Study [Real-World Samples](../exercises/real-world-samples.md)
3. Integrate [Seed Vault](../06-seed-vault/README.md)
4. Publish to [dApp Store](../07-dapp-publishing/README.md)

## Code Examples

### Connect to Wallet

```typescript
import {transact} from '@solana-mobile/mobile-wallet-adapter-protocol';

const connectWallet = async () => {
  return await transact(async (wallet) => {
    const authResult = await wallet.authorize({
      cluster: 'devnet',
      identity: {
        name: 'My dApp',
        uri: 'https://mydapp.com',
        icon: 'favicon.ico',
      },
    });
    return authResult;
  });
};
```

### Send Transaction

```typescript
import {Transaction, SystemProgram} from '@solana/web3.js';

const sendTransaction = async (wallet, connection, publicKey) => {
  const latestBlockhash = await connection.getLatestBlockhash();
  
  const transaction = new Transaction({
    ...latestBlockhash,
    feePayer: publicKey,
  }).add(
    SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: destinationPubkey,
      lamports: 1000000,
    })
  );

  const signedTx = await wallet.signTransactions({
    transactions: [transaction],
  });

  const signature = await connection.sendRawTransaction(
    signedTx[0].serialize()
  );
  
  await connection.confirmTransaction(signature);
  return signature;
};
```

### Create Anchor Wallet

```typescript
import * as anchor from '@coral-xyz/anchor';

const createAnchorWallet = (publicKey) => {
  return {
    signTransaction: async (transaction) => {
      return transact(async (wallet) => {
        await wallet.authorize({...});
        const signed = await wallet.signTransactions({
          transactions: [transaction],
        });
        return signed[0];
      });
    },
    signAllTransactions: async (transactions) => {
      return transact(async (wallet) => {
        await wallet.authorize({...});
        return await wallet.signTransactions({transactions});
      });
    },
    get publicKey() {
      return publicKey;
    },
  } as anchor.Wallet;
};
```

## Common Patterns

### Authorization Management

```typescript
const AuthorizationProvider = () => {
  const [authToken, setAuthToken] = useState(null);

  const authorizeSession = useCallback(async (wallet) => {
    const result = authToken
      ? await wallet.reauthorize({
          auth_token: authToken,
          identity: APP_IDENTITY,
        })
      : await wallet.authorize({
          cluster: 'devnet',
          identity: APP_IDENTITY,
        });
    
    setAuthToken(result.auth_token);
    return result;
  }, [authToken]);

  return {authorizeSession, authToken};
};
```

### Balance Fetching

```typescript
const useBalance = (publicKey) => {
  const {connection} = useConnection();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!publicKey) return;

    const fetchBalance = async () => {
      const bal = await connection.getBalance(publicKey);
      setBalance(bal);
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [publicKey, connection]);

  return balance;
};
```

### Transaction Confirmation

```typescript
const confirmTransaction = async (
  connection,
  signature,
  blockhash
) => {
  const confirmation = await connection.confirmTransaction({
    signature,
    ...blockhash,
  });

  if (confirmation.value.err) {
    throw new Error('Transaction failed');
  }

  return confirmation;
};
```

## Troubleshooting

### Common Issues

**Issue**: Wallet connection fails

**Solution**:
- Ensure wallet app is installed
- Check wallet is MWA-compatible
- Verify both apps are on same device
- Try restarting both apps

**Issue**: Transaction fails to confirm

**Solution**:
- Check you have sufficient SOL for fees
- Verify network connection
- Ensure correct cluster (devnet/mainnet)
- Check transaction logs

**Issue**: Anchor program not found

**Solution**:
- Verify program is deployed
- Check program ID is correct
- Ensure correct cluster
- Verify IDL matches deployed program

**Issue**: Metro bundler errors

**Solution**:
```bash
npx react-native start --reset-cache
```

## Best Practices

### 1. Error Handling

Always wrap wallet operations in try-catch:

```typescript
try {
  const result = await transact(async (wallet) => {
    // Wallet operations
  });
} catch (error) {
  if (error instanceof Error) {
    console.error('Wallet error:', error.message);
  }
}
```

### 2. Loading States

Show loading indicators during async operations:

```typescript
const [loading, setLoading] = useState(false);

const handleTransaction = async () => {
  setLoading(true);
  try {
    await sendTransaction();
  } finally {
    setLoading(false);
  }
};
```

### 3. User Feedback

Provide clear feedback for all operations:

```typescript
const showSuccess = (signature) => {
  Alert.alert(
    'Success!',
    `Transaction confirmed: ${signature.slice(0, 8)}...`,
    [{text: 'View on Explorer', onPress: () => openExplorer(signature)}]
  );
};
```

### 4. Session Management

Reuse authorization tokens when possible:

```typescript
const useWalletSession = () => {
  const [authToken, setAuthToken] = useState(null);

  const authorize = useCallback(async (wallet) => {
    if (authToken) {
      return await wallet.reauthorize({auth_token: authToken});
    }
    const result = await wallet.authorize({...});
    setAuthToken(result.auth_token);
    return result;
  }, [authToken]);

  return {authorize};
};
```

## Additional Resources

### Official Documentation
- [Solana Mobile Docs](https://docs.solanamobile.com)
- [React Native Tutorials](https://docs.solanamobile.com/react-native/first_app_tutorial)
- [Anchor Book](https://book.anchor-lang.com)
- [Metaplex Docs](https://docs.metaplex.com)

### Tutorial Repositories
- [Tutorial Apps](https://github.com/solana-mobile/tutorial-apps)
- [First Mobile dApp](https://github.com/solana-mobile/tutorial-apps/tree/main/first-mobile-dapp)
- [Anchor Counter](https://github.com/solana-mobile/tutorial-apps/tree/main/AnchorCounterDapp)

### Sample Apps
- [React Native Samples](https://github.com/solana-mobile/react-native-samples)
- [Example Apps](https://github.com/solana-mobile/mobile-wallet-adapter/tree/main/examples)

### Community
- [Discord](https://discord.gg/solanamobile)
- [GitHub Discussions](https://github.com/solana-mobile/solana-mobile-stack-sdk/discussions)
- [Twitter](https://twitter.com/solanamobile)

## Next Steps

After completing tutorials:

1. **Build Your Own**: Create your own mobile dApp
2. **Study Samples**: Explore [Real-World Samples](../exercises/real-world-samples.md)
3. **Add Security**: Integrate [Seed Vault](../06-seed-vault/README.md)
4. **Publish**: Follow [Publishing Guide](../07-dapp-publishing/README.md)
5. **Join Community**: Share your projects on Discord

## Tutorial Checklist

### Tutorial 1: First dApp
- [ ] Set up development environment
- [ ] Clone scaffold template
- [ ] Connect to wallet
- [ ] Request airdrop
- [ ] Send memo transaction
- [ ] View on Explorer

### Tutorial 2: Anchor Counter
- [ ] Install Anchor dependencies
- [ ] Import program IDL
- [ ] Create Anchor wallet
- [ ] Increment counter
- [ ] Read program state
- [ ] Handle errors

### Tutorial 3: NFT Minter
- [ ] Set up Metaplex
- [ ] Implement image picker
- [ ] Upload to IPFS/Arweave
- [ ] Create metadata
- [ ] Mint NFT
- [ ] View minted NFT

### Tutorial 4: Hello World
- [ ] Build custom wallet UI
- [ ] Implement authorization
- [ ] Handle reauthorization
- [ ] Manage sessions
- [ ] Add error handling
- [ ] Polish UX

---

**Source**: Adapted from official Solana Mobile tutorials at https://docs.solanamobile.com/react-native/first_app_tutorial

Ready to start building? Begin with [Your First Mobile dApp](01-first-dapp.md)!
