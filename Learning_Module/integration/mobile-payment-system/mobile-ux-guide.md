# Mobile UX Guide: Payment System

## Overview

This guide covers mobile-specific user experience patterns for building a payment application on Solana. Mobile payments require special attention to speed, clarity, and reliability.

## Core UX Principles

### 1. Speed is Everything
Mobile users expect instant responses. Every interaction should feel immediate.

**Implementation**:
- Show loading states within 100ms
- Use optimistic UI updates
- Cache data aggressively
- Prefetch likely next actions

### 2. Clarity Over Complexity
Payment amounts and actions must be crystal clear.

**Implementation**:
- Large, readable text for amounts
- Clear call-to-action buttons
- Minimal steps to complete payment
- Obvious success/failure states

### 3. Trust Through Transparency
Users need to trust the app with their money.

**Implementation**:
- Show transaction details before signing
- Display clear confirmation screens
- Provide transaction receipts
- Link to blockchain explorer

### 4. Graceful Degradation
Handle errors and edge cases smoothly.

**Implementation**:
- Offline mode with queued transactions
- Retry logic for failed transactions
- Clear error messages with solutions
- Fallback options for every action

## Payment Flow UX

### Sending Payment Flow

```
1. Home Screen
   ↓ Tap "Send"
2. Amount Entry
   - Large numeric keypad
   - Real-time USD conversion
   - Clear "Continue" button
   ↓
3. Recipient Selection
   - QR code scanner (primary)
   - Address book (secondary)
   - Manual entry (fallback)
   ↓
4. Review Transaction
   - Recipient name/address
   - Amount (SOL + USD)
   - Network fee estimate
   - "Confirm" button
   ↓
5. Wallet Authorization
   - Deep link to wallet app
   - Biometric confirmation
   - Return to payment app
   ↓
6. Processing
   - Animated loading state
   - "Transaction submitted" message
   - Estimated confirmation time
   ↓
7. Confirmation
   - Success animation
   - Transaction details
   - Share receipt option
   - "Done" button
```

### Receiving Payment Flow

```
1. Home Screen
   ↓ Tap "Receive"
2. Generate QR Code
   - Large QR code display
   - Optional amount entry
   - Optional memo/label
   - "Share" button
   ↓
3. Wait for Payment
   - QR code remains visible
   - Real-time balance updates
   - Notification on receipt
   ↓
4. Payment Received
   - Success notification
   - Amount received
   - Sender info (if available)
   - "View Details" option
```

## UI Components

### Amount Input

**Best Practices**:
```typescript
// Large, clear amount display
<View style={styles.amountContainer}>
  <Text style={styles.currencySymbol}>◎</Text>
  <TextInput
    style={styles.amountInput}
    value={amount}
    keyboardType="decimal-pad"
    placeholder="0.00"
    autoFocus
  />
</View>

// Real-time USD conversion
<Text style={styles.usdAmount}>
  ≈ ${(amount * solPrice).toFixed(2)} USD
</Text>

// Styles
const styles = StyleSheet.create({
  amountInput: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  usdAmount: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});
```

### Transaction Status

**States to Show**:
1. **Pending**: Animated spinner, "Submitting transaction..."
2. **Submitted**: Checkmark, "Transaction submitted", link to explorer
3. **Confirming**: Progress indicator, "Confirming on blockchain..."
4. **Confirmed**: Success animation, "Payment confirmed!"
5. **Failed**: Error icon, clear error message, "Retry" button

**Implementation**:
```typescript
const StatusIndicator = ({ status }: { status: PaymentStatus }) => {
  switch (status) {
    case 'Pending':
      return (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color="#512da8" />
          <Text style={styles.statusText}>Submitting transaction...</Text>
        </View>
      );
    
    case 'Confirmed':
      return (
        <View style={styles.statusContainer}>
          <Animated.View style={[styles.successIcon, animatedStyle]}>
            <Icon name="check-circle" size={64} color="#4caf50" />
          </Animated.View>
          <Text style={styles.statusText}>Payment confirmed!</Text>
          <Text style={styles.statusSubtext}>
            Transaction: {signature.slice(0, 8)}...
          </Text>
        </View>
      );
    
    case 'Failed':
      return (
        <View style={styles.statusContainer}>
          <Icon name="error" size={64} color="#f44336" />
          <Text style={styles.statusText}>Payment failed</Text>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
          <Button title="Retry" onPress={handleRetry} />
        </View>
      );
  }
};
```

### QR Code Scanner

**Best Practices**:
```typescript
import { Camera } from 'expo-camera';

const QRScanner = ({ onScan }: { onScan: (data: string) => void }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionDenied}>
        <Text>Camera permission denied</Text>
        <Button title="Grant Permission" onPress={openSettings} />
        <Button title="Enter Address Manually" onPress={onManualEntry} />
      </View>
    );
  }

  return (
    <View style={styles.scannerContainer}>
      <Camera
        style={styles.camera}
        onBarCodeScanned={({ data }) => onScan(data)}
      >
        {/* Scanning overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
          <Text style={styles.scanText}>
            Scan Solana Pay QR code
          </Text>
        </View>
      </Camera>
      
      {/* Manual entry fallback */}
      <Button
        title="Enter Address Manually"
        onPress={onManualEntry}
        style={styles.manualButton}
      />
    </View>
  );
};
```

## Wallet Connection UX

### Connection Flow

```typescript
const WalletConnect = () => {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    
    try {
      await transact(async (wallet) => {
        const authResult = await wallet.authorize({
          cluster: 'devnet',
          identity: {
            name: 'Payment App',
            uri: 'https://yourapp.com',
            icon: 'icon.png',
          },
        });
        
        // Store auth token
        await storeAuthToken(authResult.auth_token);
        
        // Navigate to home
        navigation.navigate('Home');
      });
    } catch (error) {
      Alert.alert(
        'Connection Failed',
        'Could not connect to wallet. Please try again.',
        [
          { text: 'Retry', onPress: handleConnect },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } finally {
      setConnecting(false);
    }
  };

  return (
    <View style={styles.connectContainer}>
      <Image source={require('./logo.png')} style={styles.logo} />
      <Text style={styles.title}>Welcome to Payment App</Text>
      <Text style={styles.subtitle}>
        Connect your Solana wallet to get started
      </Text>
      
      <Button
        title={connecting ? 'Connecting...' : 'Connect Wallet'}
        onPress={handleConnect}
        disabled={connecting}
        style={styles.connectButton}
      />
      
      <Text style={styles.helpText}>
        Don't have a wallet?{' '}
        <Text style={styles.link} onPress={openWalletGuide}>
          Get one here
        </Text>
      </Text>
    </View>
  );
};
```

## Error Handling UX

### Error Message Patterns

**Good Error Messages**:
- ✅ "Insufficient balance. You need 0.5 SOL more."
- ✅ "Transaction failed. Network is congested. Retry?"
- ✅ "Invalid address. Please check and try again."

**Bad Error Messages**:
- ❌ "Error: 0x1234"
- ❌ "Transaction failed"
- ❌ "Something went wrong"

**Implementation**:
```typescript
const getErrorMessage = (error: Error): string => {
  const message = error.message.toLowerCase();
  
  if (message.includes('insufficient funds')) {
    return 'Insufficient balance. Please add more SOL to your wallet.';
  }
  
  if (message.includes('blockhash not found')) {
    return 'Transaction expired. Please try again.';
  }
  
  if (message.includes('invalid public key')) {
    return 'Invalid recipient address. Please check and try again.';
  }
  
  if (message.includes('user rejected')) {
    return 'Transaction cancelled. No funds were sent.';
  }
  
  // Default message with support link
  return `Transaction failed: ${error.message}\n\nNeed help? Contact support`;
};

const showError = (error: Error) => {
  Alert.alert(
    'Transaction Failed',
    getErrorMessage(error),
    [
      { text: 'Retry', onPress: handleRetry },
      { text: 'Cancel', style: 'cancel' },
    ]
  );
};
```

## Offline Mode

### Offline Indicator

```typescript
import NetInfo from '@react-native-community/netinfo';

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  if (!isOffline) return null;

  return (
    <View style={styles.offlineBanner}>
      <Icon name="wifi-off" size={16} color="#fff" />
      <Text style={styles.offlineText}>
        You're offline. Transactions will be queued.
      </Text>
    </View>
  );
};
```

### Transaction Queue

```typescript
const TransactionQueue = () => {
  const [queuedTxs, setQueuedTxs] = useState<Transaction[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (isOnline && queuedTxs.length > 0) {
      processQueue();
    }
  }, [isOnline, queuedTxs]);

  const processQueue = async () => {
    for (const tx of queuedTxs) {
      try {
        await sendTransaction(tx);
        removeFromQueue(tx.id);
      } catch (error) {
        console.error('Failed to send queued transaction:', error);
      }
    }
  };

  return (
    <View style={styles.queueContainer}>
      <Text style={styles.queueTitle}>
        Pending Transactions ({queuedTxs.length})
      </Text>
      {queuedTxs.map(tx => (
        <View key={tx.id} style={styles.queueItem}>
          <Text>{tx.recipient}</Text>
          <Text>{tx.amount} SOL</Text>
          <Text style={styles.queueStatus}>Waiting for connection...</Text>
        </View>
      ))}
    </View>
  );
};
```

## Performance Optimization

### Image Optimization

```typescript
// Use optimized images
import { Image } from 'expo-image';

<Image
  source={{ uri: avatarUrl }}
  style={styles.avatar}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
/>
```

### List Optimization

```typescript
import { FlashList } from '@shopify/flash-list';

const TransactionList = ({ transactions }: Props) => {
  return (
    <FlashList
      data={transactions}
      renderItem={({ item }) => <TransactionItem transaction={item} />}
      estimatedItemSize={80}
      keyExtractor={item => item.signature}
      // Optimize rendering
      removeClippedSubviews
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  );
};
```

### Memoization

```typescript
import { memo, useMemo } from 'react';

const TransactionItem = memo(({ transaction }: Props) => {
  const formattedDate = useMemo(
    () => formatDate(transaction.timestamp),
    [transaction.timestamp]
  );

  const formattedAmount = useMemo(
    () => formatAmount(transaction.amount),
    [transaction.amount]
  );

  return (
    <View style={styles.item}>
      <Text>{formattedDate}</Text>
      <Text>{formattedAmount}</Text>
    </View>
  );
});
```

## Accessibility

### Screen Reader Support

```typescript
<TouchableOpacity
  accessible
  accessibilityLabel="Send payment"
  accessibilityHint="Opens the send payment screen"
  accessibilityRole="button"
  onPress={handleSend}
>
  <Text>Send</Text>
</TouchableOpacity>

<Text
  accessible
  accessibilityLabel={`Balance: ${balance} SOL`}
  accessibilityRole="text"
>
  {balance} SOL
</Text>
```

### Color Contrast

```typescript
// Ensure sufficient contrast ratios
const colors = {
  primary: '#512da8',      // Purple
  onPrimary: '#ffffff',    // White text on purple
  error: '#d32f2f',        // Red
  onError: '#ffffff',      // White text on red
  success: '#388e3c',      // Green
  onSuccess: '#ffffff',    // White text on green
};

// Test with accessibility tools
// WCAG AA: 4.5:1 for normal text, 3:1 for large text
```

### Touch Targets

```typescript
// Minimum 44x44 points for touch targets
const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

## Testing UX

### User Testing Checklist

- [ ] Can complete payment in under 30 seconds
- [ ] Clear feedback at every step
- [ ] Errors are understandable and actionable
- [ ] Works on slow networks (3G)
- [ ] Works offline with queued transactions
- [ ] Accessible with screen reader
- [ ] Touch targets are large enough
- [ ] Text is readable at default size
- [ ] Works on small screens (iPhone SE)
- [ ] Works on large screens (iPad)

### Performance Metrics

- **Time to Interactive**: < 2 seconds
- **Transaction Submission**: < 1 second
- **QR Code Scan**: < 500ms
- **List Scroll**: 60 FPS
- **App Size**: < 50 MB

## Platform-Specific Considerations

### iOS

- Use native navigation patterns (back button, swipe gestures)
- Follow iOS Human Interface Guidelines
- Test with Dynamic Type (text size changes)
- Support Face ID / Touch ID

### Android

- Use Material Design components
- Support back button navigation
- Test with different screen sizes
- Support fingerprint authentication

## Resources

- [React Native Performance](https://reactnative.dev/docs/performance)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design](https://material.io/design)
- [Mobile Accessibility](https://www.w3.org/WAI/standards-guidelines/mobile/)

## Conclusion

Great mobile UX for payments requires:
1. **Speed**: Instant feedback, optimistic updates
2. **Clarity**: Clear amounts, obvious actions
3. **Trust**: Transparent processes, confirmations
4. **Reliability**: Offline support, error recovery

Test on real devices, with real users, in real conditions. Mobile payments are mission-critical—the UX must be flawless.
