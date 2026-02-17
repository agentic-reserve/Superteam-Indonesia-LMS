# Scaffolding & Templates

Learn how to quickly bootstrap Solana mobile dApps using official templates and scaffolds. This section covers the Solana Mobile dApp Scaffold and Expo Template, which provide production-ready starting points for your mobile applications.

## Overview

Starting a mobile dApp from scratch can be time-consuming and error-prone. The Solana Mobile team provides official templates that include all necessary dependencies, polyfills, and boilerplate code to get you building quickly. These templates follow best practices and include pre-configured wallet integration, UI components, and development workflows.

## What You'll Learn

In this section, you will learn:

- **Template Options**: Understand the different Solana mobile templates available
- **React Native Scaffold**: Use the Solana Mobile dApp Scaffold for React Native CLI projects
- **Expo Template**: Use the Solana Mobile Expo Template for Expo-managed projects
- **Template Features**: Explore pre-built components, hooks, and utilities
- **Customization**: Adapt templates to your specific project needs
- **Best Practices**: Follow established patterns from the official templates

## Prerequisites

Before starting this section, you should:

- Complete [Mobile Wallet Adapter](../01-wallet-adapter/README.md)
- Complete [React Native Integration](../02-react-native/README.md)
- Have your [mobile development environment](../../setup/mobile-environment.md) configured
- Understand React and TypeScript basics

## Learning Objectives

By the end of this section, you will be able to:

1. Choose the appropriate template for your project
2. Initialize projects using Solana mobile templates
3. Understand the template architecture and structure
4. Customize templates for your specific use case
5. Use pre-built hooks and components from templates
6. Follow mobile dApp development best practices
7. Troubleshoot common template issues

## Template Comparison

### Solana Mobile dApp Scaffold

**Best for**: React Native CLI projects, full control over native code

**Features**:
- React Native CLI-based
- Mobile Wallet Adapter integration
- Basic UI with connection, balance, and airdrop features
- Minimal dependencies for maximum flexibility
- Direct access to native Android code

**Tech Stack**:
- React Native (latest)
- Mobile Wallet Adapter Protocol
- @solana/web3.js
- TypeScript

**Use when**:
- You need full control over native modules
- Building complex apps with custom native code
- Prefer React Native CLI workflow
- Want minimal abstraction layers

### Solana Mobile Expo Template

**Best for**: Rapid development, managed workflow, easier deployment

**Features**:
- Expo SDK v52 with React Native 0.76
- Mobile Wallet Adapter integration
- Rich UI with React Native Paper components
- React Navigation pre-configured
- React Query for state management
- AsyncStorage for persistence
- Pre-built hooks like `useMobileWallet`

**Tech Stack**:
- React Native 0.76
- Expo SDK v52
- Mobile Wallet Adapter v2.1
- @solana/web3.js v1.78
- spl-token v0.4
- React Native Paper v5.12
- React Navigation v6
- React Query v5.24
- TypeScript v5

**Use when**:
- You want rapid prototyping
- Prefer managed workflow
- Need OTA updates
- Want rich component library out of the box
- Building standard mobile dApps without complex native requirements

## Quick Start

### Using React Native Scaffold

Initialize a new project with the scaffold:

```bash
npx react-native init MySolanaDapp --template @solana-mobile/solana-mobile-dapp-scaffold --npm
```

Install dependencies:

```bash
cd MySolanaDapp
npm install
```

Run on Android:

```bash
npx react-native run-android
```

### Using Expo Template

Initialize a new project with the Expo template:

```bash
yarn create expo-app --template @solana-mobile/solana-mobile-expo-template
```

Choose your project name, then navigate into the directory:

```bash
cd your-project-name
```

Build and run as a custom development build:

```bash
# Install dependencies
npm install

# Build development client
npx expo run:android

# Or use EAS Build for cloud builds
eas build --profile development --platform android
```

## Template Architecture

### React Native Scaffold Structure

```
MySolanaDapp/
├── android/              # Native Android code
├── ios/                  # iOS code (not functional)
├── src/
│   ├── components/       # React components
│   │   ├── MainScreen.tsx
│   │   └── ...
│   ├── utils/           # Utility functions
│   │   └── ...
│   └── App.tsx          # Main app component
├── package.json
└── tsconfig.json
```

**Key Files**:
- `src/App.tsx`: Main application entry point with MWA setup
- `src/components/MainScreen.tsx`: Main UI with wallet connection
- `android/`: Native Android configuration

### Expo Template Structure

```
my-expo-app/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── AccountInfo.tsx
│   │   ├── FeatureCard.tsx
│   │   └── ...
│   ├── screens/         # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── TransferScreen.tsx
│   │   └── ...
│   ├── hooks/           # Custom React hooks
│   │   ├── useMobileWallet.ts
│   │   └── ...
│   ├── utils/           # Utility functions
│   │   └── ...
│   └── navigation/      # Navigation configuration
├── App.tsx              # App entry with polyfills
├── app.json             # Expo configuration
├── eas.json             # EAS Build configuration
└── package.json
```

**Key Files**:
- `App.tsx`: Entry point with polyfills and providers
- `src/hooks/useMobileWallet.ts`: Wallet connection hook
- `src/screens/`: Pre-built screen components
- `eas.json`: EAS Build configuration

## Pre-Built Features

### React Native Scaffold Features

1. **Wallet Connection**
   - Connect to MWA-compatible wallets
   - Display connected wallet address
   - Handle authorization

2. **Account Balance**
   - Fetch and display SOL balance
   - Auto-refresh on connection

3. **Airdrop Request**
   - Request devnet SOL airdrop
   - Transaction confirmation

4. **Basic UI**
   - Minimal, customizable interface
   - Connection status display

### Expo Template Features

1. **Wallet Management**
   - `useMobileWallet` hook for easy wallet integration
   - Automatic session management
   - Connection state handling

2. **Rich UI Components**
   - Material Design components via React Native Paper
   - Pre-styled buttons, cards, and inputs
   - Responsive layouts

3. **Navigation**
   - React Navigation pre-configured
   - Multiple screen examples
   - Deep linking support

4. **State Management**
   - React Query for async operations
   - AsyncStorage for persistence
   - Optimistic updates

5. **Token Operations**
   - SPL token integration
   - Token transfer examples
   - Balance queries

## Customization Guide

### Modifying the Scaffold

1. **Add New Screens**

```typescript
// src/components/MyNewScreen.tsx
import React from 'react';
import {View, Text} from 'react-native';

export function MyNewScreen() {
  return (
    <View>
      <Text>My New Feature</Text>
    </View>
  );
}
```

2. **Add Custom RPC Endpoint**

```typescript
// Update connection in App.tsx
const connection = new Connection(
  'https://your-custom-rpc.com',
  'confirmed'
);
```

3. **Add New Dependencies**

```bash
npm install your-package
# For native modules, rebuild
npx react-native run-android
```

### Modifying the Expo Template

1. **Add New Screens**

```typescript
// src/screens/MyScreen.tsx
import React from 'react';
import {View} from 'react-native';
import {Text, Button} from 'react-native-paper';

export function MyScreen() {
  return (
    <View>
      <Text variant="headlineMedium">My Screen</Text>
      <Button mode="contained">Action</Button>
    </View>
  );
}
```

2. **Customize Theme**

```typescript
// App.tsx
import {MD3LightTheme} from 'react-native-paper';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#14F195', // Solana green
    secondary: '#9945FF', // Solana purple
  },
};
```

3. **Add Navigation Routes**

```typescript
// src/navigation/AppNavigator.tsx
<Stack.Navigator>
  <Stack.Screen name="Home" component={HomeScreen} />
  <Stack.Screen name="MyScreen" component={MyScreen} />
</Stack.Navigator>
```

## Common Patterns

### Using the useMobileWallet Hook (Expo Template)

```typescript
import {useMobileWallet} from '../hooks/useMobileWallet';

function MyComponent() {
  const {
    connect,
    disconnect,
    signTransaction,
    publicKey,
    connected,
  } = useMobileWallet();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  return (
    <Button onPress={handleConnect} disabled={connected}>
      {connected ? 'Connected' : 'Connect Wallet'}
    </Button>
  );
}
```

### Sending Transactions

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

## Troubleshooting

### React Native Scaffold Issues

**Issue**: `TypeError: cli.init is not a function`

**Solution**: Update React Native CLI:
```bash
npm uninstall -g react-native-cli
npm install -g @react-native-community/cli
```

**Issue**: `Looks like your iOS environment is not properly set`

**Solution**: Ignore this warning. The template is Android-only.

**Issue**: Template initialization fails with Yarn 3+

**Solution**: Use the `--npm` flag or downgrade to Yarn 1.22.x:
```bash
npx react-native init MySolanaDapp --template @solana-mobile/solana-mobile-dapp-scaffold --npm
```

### Expo Template Issues

**Issue**: `Metro has encountered an error: While trying to resolve module @solana-mobile/mobile-wallet-adapter-protocol...`

**Solution**: Clean and reinstall with yarn:
```bash
rm -rf node_modules package-lock.json
yarn install
```

**Issue**: `The package 'solana-mobile-wallet-adapter-protocol' doesn't seem to be linked`

**Solution**: Ensure you're using a custom development build, not Expo Go:
```bash
npx expo run:android
```

**Issue**: `failed to connect to...` (Expo dev server)

**Solution**: Use tunnel mode:
```bash
npx expo start --dev-client --tunnel
```

**Issue**: `Error: crypto.getRandomValues() not supported`

**Solution**: Ensure polyfills are properly imported in `App.tsx`:
```typescript
import 'react-native-get-random-values';
import {Buffer} from 'buffer';
global.Buffer = Buffer;
```

## Best Practices

1. **Start with Templates**: Always begin with official templates rather than building from scratch
2. **Keep Dependencies Updated**: Regularly update Solana and React Native dependencies
3. **Test on Real Devices**: Emulators don't always reflect real device behavior
4. **Use TypeScript**: Templates include TypeScript for better type safety
5. **Follow Template Patterns**: Study and follow the patterns established in templates
6. **Customize Gradually**: Make incremental changes to understand template architecture
7. **Version Control**: Commit the initial template before customization

## Development Workflow

1. **Initialize**: Create project from template
2. **Explore**: Run the template and explore its features
3. **Plan**: Identify what needs to be added/modified
4. **Customize**: Make incremental changes
5. **Test**: Test each change on device/emulator
6. **Iterate**: Refine based on testing
7. **Deploy**: Build production version

## Production Considerations

### For React Native Scaffold

- Configure signing keys for release builds
- Optimize bundle size
- Enable ProGuard for code obfuscation
- Test on multiple Android versions
- Follow Google Play Store guidelines

### For Expo Template

- Configure EAS Build for production
- Set up OTA updates
- Optimize assets and bundle
- Configure app.json for production
- Use EAS Submit for store deployment

## Next Steps

After mastering templates:

1. **Build Custom Features**: Extend templates with your dApp logic
2. **Explore Advanced Patterns**: Study [Integration Projects](../../integration/README.md)
3. **Learn Publishing**: Move to [dApp Publishing](../07-dapp-publishing/README.md)
4. **Study Security**: Review [Security Best Practices](../../security/README.md)
5. **Join Community**: Share your templates and customizations

## Additional Resources

- **Solana Mobile dApp Scaffold**: https://github.com/solana-mobile/solana-mobile-dapp-scaffold
- **Solana Mobile Expo Template**: https://github.com/solana-mobile/solana-mobile-expo-template
- **React Native Documentation**: https://reactnative.dev
- **Expo Documentation**: https://docs.expo.dev
- **Solana Mobile Docs**: https://docs.solanamobile.com

## Exercises

Practice with templates in [exercises/05-scaffolding-templates.md](../exercises/05-scaffolding-templates.md)

---

**Source**: Adapted from official Solana Mobile templates at https://github.com/solana-mobile/solana-mobile-dapp-scaffold and https://github.com/solana-mobile/solana-mobile-expo-template

Ready to explore secure key management? Continue to [Seed Vault SDK](../06-seed-vault/README.md)!
