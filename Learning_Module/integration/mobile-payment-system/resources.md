# Mobile Payment System Resources

## Official Documentation

### Solana Mobile
- [Solana Mobile Stack](https://solanamobile.com/developers) - Official mobile development platform
- [Mobile Wallet Adapter](https://github.com/solana-mobile/mobile-wallet-adapter) - Protocol specification and SDK
- [Solana Mobile dApp Scaffold](https://github.com/solana-mobile/solana-mobile-dapp-scaffold) - Starter template

### Solana Pay
- [Solana Pay Documentation](https://docs.solanapay.com/) - Official Solana Pay guide
- [Solana Pay Specification](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md) - Protocol specification
- [Solana Pay SDK](https://github.com/solana-labs/solana-pay) - JavaScript SDK

### React Native
- [React Native Documentation](https://reactnative.dev/) - Official React Native docs
- [Expo Documentation](https://docs.expo.dev/) - Expo framework guide
- [React Navigation](https://reactnavigation.org/) - Navigation library

## Related Learning Module Content

### Mobile Topics
- [Wallet Adapter](../../mobile/01-wallet-adapter/README.md) - Mobile wallet integration
- [React Native](../../mobile/02-react-native/README.md) - Mobile app development
- [Expo Template](../../mobile/03-expo-template/README.md) - Quick start template
- [Solana Pay](../../mobile/04-solana-pay/README.md) - Payment protocol

### Basics
- [Transactions](../../basics/02-transactions/README.md) - Transaction structure
- [Tokens](../../basics/03-tokens/README.md) - SPL token transfers

### Setup
- [Mobile Environment Setup](../../setup/mobile-environment.md) - Development environment

## Code Examples

### Source Repositories
- **solana-mobile**: Mobile wallet adapter and examples
  - Repository: Check workspace for mobile examples
  - Key files: Wallet adapter implementation, deep linking

### Community Examples
- [Solana Mobile Examples](https://github.com/solana-mobile/solana-mobile-dapp-scaffold) - Official examples
- [Solana Pay Examples](https://github.com/solana-labs/solana-pay/tree/master/examples) - Payment integration examples

## Mobile Development Tools

### Development Environment
- [Expo CLI](https://docs.expo.dev/get-started/installation/) - Expo command-line tools
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger) - Debugging tool
- [Flipper](https://fbflipper.com/) - Mobile debugging platform

### Testing Tools
- [Detox](https://wix.github.io/Detox/) - End-to-end testing for React Native
- [Jest](https://jestjs.io/) - JavaScript testing framework
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/) - Component testing

### UI Libraries
- [React Native Paper](https://reactnativepaper.com/) - Material Design components
- [NativeBase](https://nativebase.io/) - Cross-platform UI components
- [React Native Elements](https://reactnativeelements.com/) - UI toolkit

## Solana Mobile Wallets

### Available Wallets
- [Phantom Mobile](https://phantom.app/) - Popular mobile wallet
- [Solflare Mobile](https://solflare.com/) - Feature-rich wallet
- [Glow Mobile](https://glow.app/) - Mobile-first wallet
- [Ultimate Mobile](https://ultimate.app/) - Multi-chain wallet

### Wallet Integration
- [Wallet Adapter Protocol](https://github.com/solana-mobile/mobile-wallet-adapter/blob/main/SPEC.md) - Technical specification
- [Deep Linking Guide](https://docs.solanamobile.com/react-native/deeplinks) - App-to-wallet communication

## QR Code Libraries

### Generation
- [react-native-qrcode-svg](https://github.com/awesomejerry/react-native-qrcode-svg) - QR code generation
- [qrcode](https://www.npmjs.com/package/qrcode) - Node.js QR code library

### Scanning
- [expo-camera](https://docs.expo.dev/versions/latest/sdk/camera/) - Camera and barcode scanning
- [react-native-camera](https://github.com/react-native-camera/react-native-camera) - Alternative camera library

## Payment Processing

### Solana Pay Integration
```typescript
// Example: Create payment request
import { encodeURL, createQR } from '@solana/pay';
import BigNumber from 'bignumber.js';

const url = encodeURL({
  recipient: merchantPublicKey,
  amount: new BigNumber(10),
  label: 'Coffee Shop',
  message: 'Thanks for your purchase!',
  memo: 'Order #12345',
});

const qr = createQR(url);
```

### Transaction Monitoring
```typescript
// Example: Monitor transaction status
import { Connection } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com');

const subscription = connection.onSignature(
  signature,
  (result, context) => {
    if (result.err) {
      console.log('Transaction failed');
    } else {
      console.log('Transaction confirmed');
    }
  },
  'confirmed'
);
```

## Mobile UX Resources

### Design Guidelines
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) - Apple design standards
- [Material Design](https://material.io/design) - Google design system
- [Mobile Payment UX](https://www.nngroup.com/articles/mobile-payment-ux/) - Nielsen Norman Group research

### Performance
- [React Native Performance](https://reactnative.dev/docs/performance) - Optimization guide
- [Expo Performance](https://docs.expo.dev/guides/performance/) - Expo-specific tips
- [Hermes Engine](https://hermesengine.dev/) - JavaScript engine for React Native

## Security Resources

### Mobile Security
- [React Native Security](https://reactnative.dev/docs/security) - Security best practices
- [Expo Security](https://docs.expo.dev/guides/security/) - Expo security guide
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/) - Mobile security standards

### Key Management
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) - Secure key storage
- [React Native Keychain](https://github.com/oblador/react-native-keychain) - Keychain access

## Push Notifications

### Services
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) - Push notification API
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging) - FCM for notifications
- [OneSignal](https://onesignal.com/) - Notification service

### Implementation
```typescript
// Example: Send payment notification
import * as Notifications from 'expo-notifications';

await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Payment Received',
    body: `You received ${amount} SOL from ${sender}`,
    data: { signature, amount },
  },
  trigger: null, // Send immediately
});
```

## State Management

### Libraries
- [React Context](https://react.dev/reference/react/useContext) - Built-in state management
- [Redux Toolkit](https://redux-toolkit.js.org/) - Redux for React Native
- [Zustand](https://github.com/pmndrs/zustand) - Lightweight state management
- [Jotai](https://jotai.org/) - Atomic state management

### Data Fetching
- [React Query](https://tanstack.com/query/latest) - Data fetching and caching
- [SWR](https://swr.vercel.app/) - React hooks for data fetching
- [Apollo Client](https://www.apollographql.com/docs/react/) - GraphQL client

## Offline Support

### Storage
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) - Key-value storage
- [WatermelonDB](https://watermelondb.dev/) - Reactive database
- [Realm](https://realm.io/) - Mobile database

### Network Detection
- [@react-native-community/netinfo](https://github.com/react-native-netinfo/react-native-netinfo) - Network status

## App Deployment

### iOS
- [App Store Connect](https://appstoreconnect.apple.com/) - iOS app submission
- [TestFlight](https://developer.apple.com/testflight/) - Beta testing
- [Fastlane](https://fastlane.tools/) - Automation tools

### Android
- [Google Play Console](https://play.google.com/console) - Android app submission
- [Internal Testing](https://support.google.com/googleplay/android-developer/answer/9845334) - Beta testing
- [Gradle](https://gradle.org/) - Build system

### Expo
- [EAS Build](https://docs.expo.dev/build/introduction/) - Cloud build service
- [EAS Submit](https://docs.expo.dev/submit/introduction/) - App store submission
- [EAS Update](https://docs.expo.dev/eas-update/introduction/) - Over-the-air updates

## Analytics and Monitoring

### Analytics
- [Expo Analytics](https://docs.expo.dev/guides/using-analytics/) - Usage analytics
- [Firebase Analytics](https://firebase.google.com/docs/analytics) - User behavior tracking
- [Mixpanel](https://mixpanel.com/) - Product analytics

### Error Tracking
- [Sentry](https://sentry.io/) - Error monitoring
- [Bugsnag](https://www.bugsnag.com/) - Crash reporting
- [Firebase Crashlytics](https://firebase.google.com/docs/crashlytics) - Crash analytics

## Production Examples

### Payment Apps
- [Phantom Mobile](https://phantom.app/) - Leading Solana wallet with payments
- [Solflare Mobile](https://solflare.com/) - Multi-feature wallet
- [Tiplink](https://tiplink.io/) - Payment links

### Merchant Solutions
- [Solana Pay Merchants](https://solanapay.com/merchants) - Real merchant integrations
- [Sphere Pay](https://spherepay.co/) - Point-of-sale solution

## Video Tutorials

### Solana Mobile
- [Solana Mobile Stack Overview](https://www.youtube.com/watch?v=example) - Introduction to mobile development
- [Building Mobile dApps](https://www.youtube.com/watch?v=example) - Complete tutorial

### React Native
- [React Native Crash Course](https://www.youtube.com/watch?v=example) - Beginner tutorial
- [Expo Tutorial](https://www.youtube.com/watch?v=example) - Expo framework guide

## Community Resources

### Forums
- [Solana Stack Exchange](https://solana.stackexchange.com/questions/tagged/mobile) - Mobile development Q&A
- [Solana Discord](https://discord.gg/solana) - #mobile-development channel
- [React Native Community](https://www.reactnative.dev/community/overview) - React Native support

### Blogs
- [Solana Mobile Blog](https://solanamobile.com/blog) - Official updates
- [Expo Blog](https://blog.expo.dev/) - Expo news and tutorials

## Testing on Devices

### Physical Devices
- **iOS**: Requires Apple Developer account ($99/year)
- **Android**: Free, enable Developer Options

### Emulators
- [iOS Simulator](https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device) - Xcode simulator
- [Android Emulator](https://developer.android.com/studio/run/emulator) - Android Studio emulator

### Cloud Testing
- [BrowserStack](https://www.browserstack.com/) - Real device testing
- [Sauce Labs](https://saucelabs.com/) - Mobile testing platform

## Next Integration Projects

After completing this project:
- [Full-Stack dApp](../full-stack-dapp/README.md) - Web interface for payments
- [Secure DeFi Protocol](../secure-defi-protocol/README.md) - Advanced DeFi integration

## Contributing

Found a helpful resource? Mobile development moves fast—suggestions for updates are welcome!

---

**📱 Mobile Development**: The mobile ecosystem evolves rapidly. Check official documentation for the latest updates.

**Last Updated**: Based on React Native 0.73.x, Expo 50.x, and Solana Mobile Stack 2.x
