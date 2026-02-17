# Solana Mobile Quick Start Guide

A fast-track guide to get started with Solana mobile development using official templates and tools.

## Choose Your Path

### Path 1: Expo Template (Recommended for Beginners)

**Best for**: Rapid prototyping, managed workflow, easier deployment

**Time to first app**: ~15 minutes

```bash
# 1. Create project
yarn create expo-app --template @solana-mobile/solana-mobile-expo-template
cd your-project-name

# 2. Install dependencies
npm install

# 3. Run on Android
npx expo run:android
```

**What you get**:
- React Native 0.76 + Expo 52
- Mobile Wallet Adapter pre-configured
- React Native Paper UI components
- React Navigation
- React Query for state management
- Pre-built hooks like `useMobileWallet`

**Next steps**: [Expo Template Guide](05-scaffolding-templates/README.md#solana-mobile-expo-template)

### Path 2: React Native Scaffold

**Best for**: Full control, custom native code, complex apps

**Time to first app**: ~20 minutes

```bash
# 1. Create project
npx react-native init MySolanaDapp --template @solana-mobile/solana-mobile-dapp-scaffold --npm
cd MySolanaDapp

# 2. Install dependencies
npm install

# 3. Run on Android
npx react-native run-android
```

**What you get**:
- React Native CLI project
- Mobile Wallet Adapter integration
- Basic UI with wallet connection
- Minimal dependencies
- Direct access to native code

**Next steps**: [React Native Scaffold Guide](05-scaffolding-templates/README.md#solana-mobile-dapp-scaffold)

## Prerequisites

### Required

1. **Node.js 18+**
   ```bash
   node --version  # Should be 18 or higher
   ```

2. **Android Development Environment**
   - Android Studio
   - Android SDK
   - Android device or emulator

3. **MWA-Compatible Wallet**
   - Install on your device/emulator
   - Options: Phantom, Solflare, Ultimate, etc.

### Setup Guide

Follow the complete setup guide: [Mobile Environment Setup](../setup/mobile-environment.md)

## Your First dApp in 5 Minutes

### Step 1: Create Project (1 min)

```bash
yarn create expo-app MyFirstDapp --template @solana-mobile/solana-mobile-expo-template
cd MyFirstDapp
```

### Step 2: Install Dependencies (2 min)

```bash
npm install
```

### Step 3: Run on Device (2 min)

```bash
npx expo run:android
```

### Step 4: Test Wallet Connection

1. Open the app on your device
2. Tap "Connect Wallet"
3. Select your wallet app
4. Authorize the connection
5. See your wallet address and balance!

## Common Commands

### Expo Template

```bash
# Development
npx expo start --dev-client
npx expo run:android

# Build
eas build --platform android --profile production

# Publish update
eas update --branch production
```

### React Native Scaffold

```bash
# Development
npx react-native start
npx react-native run-android

# Build release
cd android
./gradlew assembleRelease

# Clean build
./gradlew clean
```

## Project Structure

### Expo Template

```
my-app/
├── src/
│   ├── components/      # UI components
│   ├── screens/         # Screen components
│   ├── hooks/           # Custom hooks (useMobileWallet)
│   ├── utils/           # Utilities
│   └── navigation/      # Navigation config
├── App.tsx              # Entry point with polyfills
├── app.json             # Expo config
└── eas.json             # EAS Build config
```

### React Native Scaffold

```
my-app/
├── src/
│   ├── components/      # React components
│   ├── utils/           # Utilities
│   └── App.tsx          # Main app
├── android/             # Native Android code
└── package.json
```

## Essential Code Snippets

### Connect Wallet (Expo Template)

```typescript
import {useMobileWallet} from './hooks/useMobileWallet';

function MyComponent() {
  const {connect, disconnect, publicKey, connected} = useMobileWallet();

  return (
    <Button onPress={connected ? disconnect : connect}>
      {connected ? 'Disconnect' : 'Connect Wallet'}
    </Button>
  );
}
```

### Send Transaction

```typescript
import {Transaction, SystemProgram, LAMPORTS_PER_SOL} from '@solana/web3.js';

async function sendSOL(
  connection: Connection,
  fromPubkey: PublicKey,
  toPubkey: PublicKey,
  amount: number,
  signTransaction: (tx: Transaction) => Promise<Transaction>
) {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports: amount * LAMPORTS_PER_SOL,
    })
  );

  transaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;
  transaction.feePayer = fromPubkey;

  const signedTx = await signTransaction(transaction);
  const signature = await connection.sendRawTransaction(
    signedTx.serialize()
  );
  
  await connection.confirmTransaction(signature);
  return signature;
}
```

### Get Balance

```typescript
import {Connection, PublicKey, LAMPORTS_PER_SOL} from '@solana/web3.js';

async function getBalance(
  connection: Connection,
  publicKey: PublicKey
): Promise<number> {
  const balance = await connection.getBalance(publicKey);
  return balance / LAMPORTS_PER_SOL;
}
```

## Troubleshooting

### Issue: Metro bundler error

**Solution**: Clear cache and restart
```bash
npx expo start --clear
# or
npx react-native start --reset-cache
```

### Issue: Wallet connection fails

**Solution**: 
1. Ensure wallet app is installed
2. Check wallet app is MWA-compatible
3. Try restarting both apps

### Issue: Build fails

**Solution**: Clean and rebuild
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### Issue: Polyfill errors

**Solution**: Ensure polyfills are imported in App.tsx
```typescript
import 'react-native-get-random-values';
import {Buffer} from 'buffer';
global.Buffer = Buffer;
```

## Learning Path

### Week 1: Basics
- [ ] Set up development environment
- [ ] Create first app from template
- [ ] Connect to wallet
- [ ] Display balance
- [ ] Request airdrop

### Week 2: Transactions
- [ ] Send SOL transfers
- [ ] Handle transaction confirmation
- [ ] Implement error handling
- [ ] Add loading states

### Week 3: Advanced Features
- [ ] Work with SPL tokens
- [ ] Implement token transfers
- [ ] Add transaction history
- [ ] Create custom UI

### Week 4: Real-World Apps
- [ ] Study sample apps (Settle, SKR, Cause Pots)
- [ ] Build your own dApp
- [ ] Add advanced features
- [ ] Prepare for publishing

## Sample Apps to Study

### 1. Settle (Beginner)
**Location**: `C:\Users\raden\Documents\superteam_modul\solana-mobile\react-native-samples\settle`

**Learn**: Basic wallet connection, transfers, transaction handling

```bash
cd C:\Users\raden\Documents\superteam_modul\solana-mobile\react-native-samples\settle
npm install
npx expo run:android
```

### 2. SKR Address Resolution (Beginner)
**Location**: `C:\Users\raden\Documents\superteam_modul\solana-mobile\react-native-samples\skr-address-resolution`

**Learn**: Name service integration, lookups, search UI

```bash
cd C:\Users\raden\Documents\superteam_modul\solana-mobile\react-native-samples\skr-address-resolution
npm install
npx expo run:android
```

### 3. Cause Pots (Intermediate)
**Location**: `C:\Users\raden\Documents\superteam_modul\solana-mobile\react-native-samples\cause-pots`

**Learn**: Anchor integration, PDAs, complex transactions

```bash
cd C:\Users\raden\Documents\superteam_modul\solana-mobile\react-native-samples\cause-pots
npm install
npx expo run:android
```

## Resources

### Documentation
- **Solana Mobile Docs**: https://docs.solanamobile.com
- **React Native**: https://reactnative.dev
- **Expo**: https://docs.expo.dev
- **Solana Web3.js**: https://solana-labs.github.io/solana-web3.js

### Templates
- **Expo Template**: https://github.com/solana-mobile/solana-mobile-expo-template
- **React Native Scaffold**: https://github.com/solana-mobile/solana-mobile-dapp-scaffold

### Samples
- **React Native Samples**: https://github.com/solana-mobile/react-native-samples

### Community
- **Discord**: https://discord.gg/solanamobile
- **Twitter**: @solanamobile
- **GitHub**: https://github.com/solana-mobile

## Next Steps

### After Your First App

1. **Explore Templates**: [Scaffolding & Templates Guide](05-scaffolding-templates/README.md)
2. **Study Samples**: [Real-World Samples](exercises/real-world-samples.md)
3. **Learn Security**: [Seed Vault SDK](06-seed-vault/README.md)
4. **Publish**: [dApp Publishing Guide](07-dapp-publishing/README.md)

### Build Something Real

Ideas for your first real project:
- **Wallet Tracker**: Track multiple wallet balances
- **Token Sender**: Bulk token distribution tool
- **NFT Gallery**: Display your NFT collection
- **Payment App**: Accept Solana payments
- **DeFi Dashboard**: Track DeFi positions

## Tips for Success

1. **Start Simple**: Begin with templates, don't build from scratch
2. **Test Often**: Test on real devices frequently
3. **Read Code**: Study sample apps to learn patterns
4. **Ask Questions**: Use Discord for help
5. **Build Projects**: Apply learning to real projects
6. **Stay Updated**: Follow Solana Mobile for updates
7. **Join Community**: Connect with other developers
8. **Share Work**: Show your projects and get feedback

## Quick Reference

### Important Packages

```json
{
  "@solana-mobile/mobile-wallet-adapter-protocol": "^2.1.0",
  "@solana/web3.js": "^1.78.0",
  "@solana/spl-token": "^0.4.0",
  "react-native": "0.76.x",
  "expo": "~52.0.0"
}
```

### Key Imports

```typescript
// Wallet Adapter
import {transact} from '@solana-mobile/mobile-wallet-adapter-protocol';

// Solana
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';

// SPL Token
import {
  getAssociatedTokenAddress,
  createTransferInstruction
} from '@solana/spl-token';

// React Native
import {View, Text, Button, StyleSheet} from 'react-native';
```

### RPC Endpoints

```typescript
// Devnet (for development)
const connection = new Connection(
  'https://api.devnet.solana.com',
  'confirmed'
);

// Mainnet (for production)
const connection = new Connection(
  'https://api.mainnet-beta.solana.com',
  'confirmed'
);
```

## Get Help

### Common Issues
- Check [Troubleshooting Guide](05-scaffolding-templates/README.md#troubleshooting)
- Review [Sample Apps](exercises/real-world-samples.md)
- Search [GitHub Issues](https://github.com/solana-mobile/solana-mobile-stack-sdk/issues)

### Ask for Help
- **Discord**: https://discord.gg/solanamobile
- **GitHub Discussions**: https://github.com/solana-mobile/solana-mobile-stack-sdk/discussions
- **Stack Overflow**: Tag with `solana-mobile`

---

**Ready to build?** Start with the [Expo Template](#path-1-expo-template-recommended-for-beginners) and create your first Solana mobile dApp in minutes!
