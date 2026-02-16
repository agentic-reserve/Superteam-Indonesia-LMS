# Expo Template for Solana dApps

Expo provides a simplified React Native development experience with managed workflows, built-in tooling, and easy deployment. This section covers using Expo to build Solana mobile dApps with faster iteration and streamlined development.

## Overview

Expo is a framework and platform for React Native that simplifies mobile app development. It provides:

- **Managed Workflow**: Pre-configured build pipeline and dependencies
- **Development Client**: Custom development builds with native modules
- **EAS Build**: Cloud-based build service for iOS and Android
- **OTA Updates**: Push updates without app store review
- **Expo Go**: Quick testing on physical devices

## Prerequisites

- Node.js 18+ installed
- Expo CLI installed globally
- Mobile development environment (see [Mobile Environment Setup](../../setup/mobile-environment.md))
- Understanding of React and React Native basics

## Getting Started

### Install Expo CLI

```bash
npm install -g expo-cli
```

Verify installation:

```bash
expo --version
```

### Create an Expo Project

```bash
npx create-expo-app SolanaExpoApp
cd SolanaExpoApp
```

This creates a new Expo project with TypeScript support.

### Install Solana Dependencies

```bash
npx expo install @solana/web3.js
npm install @solana-mobile/mobile-wallet-adapter-protocol @solana-mobile/mobile-wallet-adapter-protocol-web3js
```

### Install Required Polyfills

```bash
npx expo install react-native-get-random-values @react-native-async-storage/async-storage react-native-url-polyfill
npm install buffer
```

### Install Development Client

For custom native modules (required for wallet adapter):

```bash
npx expo install expo-dev-client
```

## Project Structure

```
SolanaExpoApp/
├── app/                    # App screens (Expo Router)
│   ├── (tabs)/
│   │   ├── index.tsx      # Home screen
│   │   └── wallet.tsx     # Wallet screen
│   ├── _layout.tsx        # Root layout
│   └── +not-found.tsx     # 404 screen
├── components/            # Reusable components
│   ├── WalletButton.tsx
│   ├── BalanceCard.tsx
│   └── TransferForm.tsx
├── hooks/                 # Custom hooks
│   ├── useWallet.ts
│   ├── useConnection.ts
│   └── useBalance.ts
├── services/              # Business logic
│   ├── wallet.ts
│   └── storage.ts
├── constants/             # App constants
│   └── Config.ts
├── app.json              # Expo configuration
├── package.json
└── tsconfig.json
```

## Configuration

### Setup Polyfills

Create `polyfills.ts` in the root:

```typescript
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { Buffer } from 'buffer';

global.Buffer = Buffer;
```

Import at the top of `app/_layout.tsx`:

```typescript
import '../polyfills';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
```

### Configure app.json

Update `app.json` with Solana-specific configuration:

```json
{
  "expo": {
    "name": "Solana Expo App",
    "slug": "solana-expo-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.solanaexpoapp",
      "infoPlist": {
        "LSApplicationQueriesSchemes": [
          "solana",
          "phantom",
          "solflare",
          "ultimate",
          "glow"
        ]
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourcompany.solanaexpoapp",
      "permissions": [
        "android.permission.INTERNET"
      ],
      "intentFilters": [
        {
          "action": "VIEW",
          "data": {
            "scheme": "solana"
          },
          "category": [
            "BROWSABLE",
            "DEFAULT"
          ]
        }
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router"
    ]
  }
}
```

## Development Workflow

### Start Development Server

```bash
npx expo start
```

Options:
- Press `a` to open on Android emulator
- Press `i` to open on iOS simulator
- Scan QR code with Expo Go app (for testing without wallet adapter)

### Build Development Client

For wallet adapter functionality, build a development client:

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

This creates a custom development build with native modules.

### Testing with Expo Go

Expo Go doesn't support custom native modules like the wallet adapter. For quick UI testing without wallet functionality:

1. Install Expo Go on your device
2. Scan the QR code from `expo start`
3. Test UI and non-wallet features

For full wallet adapter testing, use a development build.

## Implementation Example

### Wallet Service

Create `services/wallet.ts`:

```typescript
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol';
import { PublicKey } from '@solana/web3.js';

export interface WalletAccount {
  publicKey: PublicKey;
  authToken: string;
}

export const connectWallet = async (): Promise<WalletAccount> => {
  const result = await transact(async (wallet) => {
    const authorization = await wallet.authorize({
      cluster: 'devnet',
      identity: {
        name: 'Solana Expo App',
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
```

### Home Screen

Create `app/(tabs)/index.tsx`:

```typescript
import { StyleSheet, View, Text } from 'react-native';
import { WalletButton } from '@/components/WalletButton';
import { BalanceCard } from '@/components/BalanceCard';
import { TransferForm } from '@/components/TransferForm';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Solana Expo dApp</Text>
        <WalletButton />
      </View>

      <BalanceCard />
      <TransferForm />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
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
```

### Wallet Button Component

Create `components/WalletButton.tsx`:

```typescript
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useWallet } from '@/hooks/useWallet';

export function WalletButton() {
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
      return `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`;
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
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#9945FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonConnected: {
    backgroundColor: '#14F195',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
```

## EAS Build

Expo Application Services (EAS) provides cloud-based builds for iOS and Android.

### Install EAS CLI

```bash
npm install -g eas-cli
```

### Configure EAS

```bash
eas build:configure
```

This creates `eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

### Build for Android

```bash
# Development build
eas build --platform android --profile development

# Production build
eas build --platform android --profile production
```

### Build for iOS

```bash
# Development build
eas build --platform ios --profile development

# Production build
eas build --platform ios --profile production
```

## Over-The-Air (OTA) Updates

EAS Update allows you to push updates without app store review.

### Configure EAS Update

```bash
eas update:configure
```

### Publish an Update

```bash
eas update --branch production --message "Bug fixes and improvements"
```

### Update Configuration

Add to `app.json`:

```json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/[your-project-id]"
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  }
}
```

## Environment Variables

### Create .env File

```bash
# .env
EXPO_PUBLIC_RPC_URL=https://api.devnet.solana.com
EXPO_PUBLIC_CLUSTER=devnet
```

### Access in Code

```typescript
const RPC_URL = process.env.EXPO_PUBLIC_RPC_URL;
const CLUSTER = process.env.EXPO_PUBLIC_CLUSTER;
```

### Configure for EAS Build

Create `eas.json` with environment variables:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_RPC_URL": "https://api.mainnet-beta.solana.com",
        "EXPO_PUBLIC_CLUSTER": "mainnet-beta"
      }
    }
  }
}
```

## Testing

### Unit Testing with Jest

Install Jest:

```bash
npm install --save-dev jest @testing-library/react-native
```

Configure `jest.config.js`:

```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
};
```

### Example Test

```typescript
import { render } from '@testing-library/react-native';
import { WalletButton } from '../components/WalletButton';

describe('WalletButton', () => {
  it('renders correctly', () => {
    const { getByText } = render(<WalletButton />);
    expect(getByText('Connect Wallet')).toBeTruthy();
  });
});
```

## Debugging

### React Native Debugger

1. Install React Native Debugger
2. Start your app with `expo start`
3. Press `j` to open debugger

### Expo Dev Tools

Access dev tools at `http://localhost:19002` when running `expo start`.

### Console Logs

View logs in terminal or Expo Dev Tools console.

## Deployment

### Android

1. Build production APK/AAB:
```bash
eas build --platform android --profile production
```

2. Download the build
3. Upload to Google Play Console

### iOS

1. Build production IPA:
```bash
eas build --platform ios --profile production
```

2. Download the build
3. Upload to App Store Connect via Transporter

## Best Practices

1. **Use Development Client**: Build custom dev client for native modules
2. **Environment Variables**: Use `EXPO_PUBLIC_` prefix for client-side variables
3. **OTA Updates**: Use for quick bug fixes and minor updates
4. **EAS Build**: Use cloud builds for consistent, reproducible builds
5. **Testing**: Test on both Expo Go (for UI) and dev client (for full features)
6. **Version Management**: Use semantic versioning for releases
7. **Error Tracking**: Integrate Sentry or similar for production error tracking

## Advantages of Expo

- **Faster Development**: Pre-configured tooling and dependencies
- **Easy Updates**: OTA updates without app store review
- **Cloud Builds**: No need for local Xcode or Android Studio
- **Managed Workflow**: Less configuration, more development
- **Great Documentation**: Comprehensive guides and examples
- **Active Community**: Large community and ecosystem

## Limitations

- **Custom Native Modules**: Requires development client or ejecting
- **App Size**: Slightly larger app size due to Expo SDK
- **Build Times**: Cloud builds can take time during peak hours
- **Platform Features**: Some platform-specific features require custom native code

## Expo vs Bare React Native

| Feature | Expo | Bare React Native |
|---------|------|------------------|
| **Setup** | Quick and easy | More configuration |
| **Native Modules** | Limited (dev client needed) | Full access |
| **Updates** | OTA updates | Manual app store updates |
| **Build** | Cloud-based (EAS) | Local builds |
| **App Size** | Larger | Smaller |
| **Flexibility** | Managed workflow | Full control |

## Common Issues

### Wallet Adapter Not Working

**Problem**: Wallet adapter doesn't work in Expo Go

**Solution**: Build a development client with `expo run:android` or `expo run:ios`

### Build Failures

**Problem**: EAS build fails

**Solution**:
- Check `eas.json` configuration
- Verify all dependencies are compatible
- Review build logs for specific errors

### OTA Update Not Applying

**Problem**: Updates don't appear in the app

**Solution**:
- Verify runtime version matches
- Check update branch configuration
- Force close and reopen the app

## Next Steps

- Learn about [Solana Pay](../04-solana-pay/README.md) integration
- Complete [Mobile Exercises](../exercises/)
- Explore [Integration Projects](../../integration/README.md)

## Additional Resources

- Expo Documentation: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction
- EAS Update: https://docs.expo.dev/eas-update/introduction
- Expo Router: https://docs.expo.dev/router/introduction

---

**Source**: Adapted from Expo documentation at https://docs.expo.dev and Solana Mobile examples

**Repository**: expo/expo
**URL**: https://github.com/expo/expo
