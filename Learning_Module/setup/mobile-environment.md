# Mobile Development Environment Setup Guide

This guide covers the installation and configuration of tools needed for building mobile dApps on Solana, including Android Studio, Xcode, React Native, Expo, and the Solana Mobile Wallet Adapter.

## Prerequisites

- Solana CLI installed and configured (see [Solana CLI Setup](solana-cli.md))
- Node.js and TypeScript installed (see [TypeScript and Node.js Setup](typescript-node.md))
- Basic familiarity with mobile development concepts

## Version Requirements

- **Node.js**: 18.x or later (LTS recommended)
- **React Native**: 0.72.0 or later
- **Expo**: 49.0.0 or later
- **Android Studio**: 2023.1.1 (Hedgehog) or later
- **Xcode**: 15.0 or later (macOS only)
- **Java Development Kit (JDK)**: 17 or later

## Overview

Building mobile dApps on Solana requires:
1. **Mobile development environment**: Android Studio and/or Xcode
2. **React Native framework**: For cross-platform mobile development
3. **Expo (optional)**: Simplified React Native development workflow
4. **Solana Mobile Wallet Adapter**: For connecting to mobile wallets

## Part 1: Android Development Setup

### Install Java Development Kit (JDK)

#### Linux

```bash
sudo apt-get update
sudo apt-get install -y openjdk-17-jdk
```

Verify installation:

```bash
java -version
```

Expected output:
```
openjdk version "17.0.x"
```

#### macOS

```bash
brew install openjdk@17
```

Add to your PATH in `~/.zshrc` or `~/.bashrc`:

```bash
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
```

#### Windows

Download and install JDK 17 from:
https://adoptium.net/temurin/releases/

### Install Android Studio

#### Download and Install

1. Download Android Studio from: https://developer.android.com/studio
2. Run the installer and follow the setup wizard
3. Choose "Standard" installation type
4. Accept license agreements

#### Configure Android SDK

After installation, open Android Studio and:

1. Go to **Settings/Preferences** → **Appearance & Behavior** → **System Settings** → **Android SDK**
2. Select the **SDK Platforms** tab
3. Check **Android 13.0 (Tiramisu)** or later
4. Select the **SDK Tools** tab
5. Ensure these are installed:
   - Android SDK Build-Tools
   - Android SDK Command-line Tools
   - Android Emulator
   - Android SDK Platform-Tools

### Set Environment Variables

#### Linux and macOS

Add to your `~/.bashrc` or `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

For macOS, the SDK location might be:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
```

Reload your shell:

```bash
source ~/.bashrc  # or ~/.zshrc
```

#### Windows

1. Open **System Properties** → **Environment Variables**
2. Add new system variable:
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\YourUsername\AppData\Local\Android\Sdk`
3. Edit the `Path` variable and add:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\emulator`
   - `%ANDROID_HOME%\tools`
   - `%ANDROID_HOME%\tools\bin`

### Verify Android Setup

```bash
adb --version
```

Expected output:
```
Android Debug Bridge version 1.0.41
```

### Create Android Virtual Device (AVD)

1. Open Android Studio
2. Go to **Tools** → **Device Manager**
3. Click **Create Device**
4. Select a device (e.g., Pixel 6)
5. Select a system image (Android 13 or later)
6. Click **Finish**

Start the emulator:

```bash
emulator -avd <device-name>
```

Or use Android Studio's Device Manager to launch it.

## Part 2: iOS Development Setup (macOS Only)

### Install Xcode

1. Open the **App Store** on macOS
2. Search for **Xcode**
3. Click **Install** (this may take 30+ minutes)

Alternatively, download from Apple Developer:
https://developer.apple.com/xcode/

### Install Xcode Command Line Tools

```bash
xcode-select --install
```

Verify installation:

```bash
xcode-select -p
```

Expected output:
```
/Applications/Xcode.app/Contents/Developer
```

### Accept Xcode License

```bash
sudo xcodebuild -license accept
```

### Install CocoaPods

CocoaPods manages iOS dependencies:

```bash
sudo gem install cocoapods
```

Verify installation:

```bash
pod --version
```

Expected output:
```
1.14.x or later
```

### Configure iOS Simulator

Open Xcode and:
1. Go to **Xcode** → **Settings** → **Platforms**
2. Ensure iOS simulators are installed
3. Download additional simulators if needed

List available simulators:

```bash
xcrun simctl list devices
```

## Part 3: React Native Setup

### Install React Native CLI

```bash
npm install -g react-native-cli
```

Verify installation:

```bash
react-native --version
```

### Create a React Native Project

```bash
npx react-native@latest init SolanaMobileApp
cd SolanaMobileApp
```

This creates a new React Native project with the following structure:

```
SolanaMobileApp/
├── android/              # Android native code
├── ios/                  # iOS native code
├── src/                  # JavaScript/TypeScript source
├── App.tsx               # Main app component
├── package.json          # Dependencies
└── metro.config.js       # Metro bundler configuration
```

### Install Solana Dependencies

```bash
npm install @solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-base
```

### Run on Android

Start Metro bundler:

```bash
npm start
```

In a new terminal, run on Android:

```bash
npm run android
```

Or:

```bash
react-native run-android
```

### Run on iOS (macOS only)

Install iOS dependencies:

```bash
cd ios
pod install
cd ..
```

Run on iOS simulator:

```bash
npm run ios
```

Or:

```bash
react-native run-ios
```

## Part 4: Expo Setup (Alternative Approach)

Expo provides a simplified React Native development experience with managed workflow.

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

### Install Solana Dependencies

```bash
npx expo install @solana/web3.js
npm install @solana/wallet-adapter-react @solana/wallet-adapter-base
```

### Install Expo Development Client

For custom native modules (required for wallet adapter):

```bash
npx expo install expo-dev-client
```

### Run Expo Project

Start the development server:

```bash
npx expo start
```

Options:
- Press `a` to open on Android emulator
- Press `i` to open on iOS simulator (macOS only)
- Scan QR code with Expo Go app on physical device

### Build Development Client

For wallet adapter functionality:

```bash
npx expo run:android
# or
npx expo run:ios
```

## Part 5: Solana Mobile Wallet Adapter Configuration

The Solana Mobile Wallet Adapter enables your app to connect to mobile wallets like Phantom, Solflare, and others.

### Install Mobile Wallet Adapter

For React Native:

```bash
npm install @solana-mobile/mobile-wallet-adapter-protocol @solana-mobile/mobile-wallet-adapter-protocol-web3js
```

For Expo:

```bash
npx expo install @solana-mobile/mobile-wallet-adapter-protocol @solana-mobile/mobile-wallet-adapter-protocol-web3js
```

### Install Polyfills

Mobile environments require polyfills for Node.js modules:

```bash
npm install react-native-get-random-values @react-native-async-storage/async-storage react-native-url-polyfill
```

### Configure Polyfills

Add to the top of your `index.js` or `App.tsx`:

```typescript
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
```

### Android Configuration

#### Update AndroidManifest.xml

Add to `android/app/src/main/AndroidManifest.xml`:

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

#### Update build.gradle

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

#### Update Info.plist

Add to `ios/YourApp/Info.plist`:

```xml
<key>LSApplicationQueriesSchemes</key>
<array>
  <string>solana</string>
  <string>phantom</string>
  <string>solflare</string>
</array>
```

### Example: Basic Wallet Connection

Create a wallet connection component:

```typescript
import React, { useState } from 'react';
import { View, Button, Text } from 'react-native';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol';
import { Connection, clusterApiUrl } from '@solana/web3.js';

export default function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      await transact(async (wallet) => {
        const authorization = await wallet.authorize({
          cluster: 'devnet',
          identity: { name: 'My Solana App' },
        });
        
        setAddress(authorization.accounts[0].address);
      });
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  return (
    <View>
      <Button title="Connect Wallet" onPress={connectWallet} />
      {address && <Text>Connected: {address}</Text>}
    </View>
  );
}
```

### Testing Wallet Adapter

1. Install a compatible wallet app on your device or emulator:
   - Phantom Mobile
   - Solflare Mobile
   - Ultimate Mobile

2. Run your app:
```bash
npm run android
# or
npm run ios
```

3. Test the wallet connection flow

## Part 6: Development Workflow

### Hot Reloading

React Native supports hot reloading for faster development:

- Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android) to open dev menu
- Enable "Fast Refresh" for automatic reloading

### Debugging

#### React Native Debugger

Install React Native Debugger:

```bash
# macOS
brew install --cask react-native-debugger

# Or download from GitHub releases
```

#### Chrome DevTools

1. Open dev menu in your app
2. Select "Debug"
3. Open Chrome DevTools at `http://localhost:8081/debugger-ui`

#### Flipper

Flipper provides advanced debugging:

1. Download from: https://fbflipper.com
2. Install and open Flipper
3. Run your app - it should auto-connect

### Testing on Physical Devices

#### Android

1. Enable Developer Options on your device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
2. Enable USB Debugging in Developer Options
3. Connect device via USB
4. Run: `adb devices` to verify connection
5. Run: `npm run android`

#### iOS

1. Connect iPhone/iPad via USB
2. Open `ios/YourApp.xcworkspace` in Xcode
3. Select your device from the device menu
4. Click Run or press `Cmd+R`

## Common Issues and Solutions

### Metro Bundler Issues

**Error**: "Metro bundler not starting"
```bash
# Clear cache and restart
npm start -- --reset-cache
```

### Android Build Failures

**Error**: "SDK location not found"
- **Solution**: Ensure `ANDROID_HOME` is set correctly

**Error**: "Gradle build failed"
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### iOS Build Failures

**Error**: "CocoaPods not installed"
```bash
cd ios
pod install
cd ..
```

**Error**: "No provisioning profile"
- **Solution**: Open Xcode, go to Signing & Capabilities, select your team

### Wallet Adapter Issues

**Error**: "No wallet apps found"
- **Solution**: Install a compatible wallet app (Phantom, Solflare)

**Error**: "Authorization failed"
- **Solution**: Ensure AndroidManifest.xml has correct intent filters

## Best Practices

1. **Use TypeScript**: Catch errors early with type safety
2. **Test on real devices**: Emulators don't always match real device behavior
3. **Handle permissions**: Request necessary permissions (camera, storage) properly
4. **Optimize bundle size**: Use Hermes engine for better performance
5. **Implement error handling**: Mobile networks can be unreliable
6. **Follow platform guidelines**: Adhere to iOS and Android design patterns
7. **Test wallet flows**: Ensure smooth wallet connection and transaction signing

## Verification Checklist

After completing this setup:

- [ ] `java -version` shows JDK 17 or later
- [ ] `adb --version` works correctly
- [ ] Android emulator launches successfully
- [ ] `xcode-select -p` shows Xcode path (macOS)
- [ ] `pod --version` shows CocoaPods installed (macOS)
- [ ] `react-native --version` works correctly
- [ ] `expo --version` works correctly (if using Expo)
- [ ] Sample React Native app runs on Android
- [ ] Sample React Native app runs on iOS (macOS)
- [ ] Wallet adapter dependencies installed
- [ ] Test wallet connection works with installed wallet app

## Next Steps

With your mobile development environment configured:

1. **Explore mobile examples**: Check [Mobile Development](../mobile/README.md) tutorials
2. **Learn wallet integration**: Study wallet adapter patterns
3. **Build a mobile dApp**: Start with a simple token transfer app
4. **Test on multiple devices**: Ensure compatibility across Android and iOS
5. **Join Solana Mobile community**: Connect with other mobile developers

## Additional Resources

- Solana Mobile Documentation: https://docs.solanamobile.com
- React Native Documentation: https://reactnative.dev/docs/getting-started
- Expo Documentation: https://docs.expo.dev
- Mobile Wallet Adapter: https://github.com/solana-mobile/mobile-wallet-adapter
- Solana Mobile Stack: https://solanamobile.com
- Android Developer Guide: https://developer.android.com
- iOS Developer Guide: https://developer.apple.com/ios

---

**Source**: Adapted from Solana Mobile documentation at https://docs.solanamobile.com and React Native documentation at https://reactnative.dev
