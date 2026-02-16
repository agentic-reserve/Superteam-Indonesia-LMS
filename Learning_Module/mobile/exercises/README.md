# Mobile Development Exercises

This directory contains hands-on exercises for practicing Solana mobile dApp development. Each exercise focuses on specific mobile development skills, from wallet integration to payment flows.

## Exercise List

### Exercise 1: Basic Wallet Connection
**Difficulty**: Beginner  
**Estimated Time**: 30-45 minutes

**Objectives**:
- Set up a React Native project with Solana dependencies
- Implement wallet connection using Mobile Wallet Adapter
- Display connected wallet address
- Handle connection errors gracefully

**Validation Criteria**:
- App successfully connects to a mobile wallet
- Wallet address is displayed in the UI
- Disconnect functionality works correctly
- Error messages are shown for connection failures

**Hints**:
- Use the `transact` function from `@solana-mobile/mobile-wallet-adapter-protocol`
- Store auth token in AsyncStorage for session persistence
- Test with Phantom or Solflare mobile wallet

**Solution Reference**: See [Wallet Adapter](../01-wallet-adapter/README.md) for implementation patterns

---

### Exercise 2: Balance Display
**Difficulty**: Beginner  
**Estimated Time**: 30-45 minutes

**Objectives**:
- Fetch and display SOL balance for connected wallet
- Implement automatic balance refresh
- Show loading states during balance fetch
- Format balance display with proper decimals

**Validation Criteria**:
- Balance is fetched and displayed correctly
- Balance updates automatically (polling or manual refresh)
- Loading indicator shows during fetch
- Balance is formatted to 4 decimal places

**Hints**:
- Use `connection.getBalance()` to fetch balance
- Convert lamports to SOL by dividing by `LAMPORTS_PER_SOL`
- Use `useEffect` with interval for automatic refresh
- Consider using a custom `useBalance` hook

**Solution Reference**: See [React Native Integration](../02-react-native/README.md) for balance hook implementation

---

### Exercise 3: SOL Transfer
**Difficulty**: Intermediate  
**Estimated Time**: 1-1.5 hours

**Objectives**:
- Create a form for entering recipient address and amount
- Build and sign a SOL transfer transaction
- Send transaction and confirm on-chain
- Display transaction signature and status

**Validation Criteria**:
- Form validates recipient address format
- Transaction is successfully signed by wallet
- Transaction is confirmed on-chain
- Transaction signature is displayed to user
- Error handling for insufficient balance

**Hints**:
- Use `SystemProgram.transfer()` to create transfer instruction
- Serialize transaction before signing with wallet
- Use `sendRawTransaction()` to send signed transaction
- Confirm transaction with `confirmTransaction()`

**Solution Reference**: See [React Native Integration](../02-react-native/README.md) for transaction signing patterns

---

### Exercise 4: QR Code Payment Request
**Difficulty**: Intermediate  
**Estimated Time**: 1-1.5 hours

**Objectives**:
- Generate a Solana Pay payment request URL
- Display payment request as a QR code
- Include amount, label, and message in request
- Allow customization of payment parameters

**Validation Criteria**:
- QR code is generated correctly
- URL follows Solana Pay specification
- QR code is scannable by wallet apps
- Payment parameters are correctly encoded

**Hints**:
- Use `encodeURL()` from `@solana/pay`
- Use `react-native-qrcode-svg` for QR generation
- Test by scanning with a mobile wallet
- Include proper label and message for UX

**Solution Reference**: See [Solana Pay](../04-solana-pay/README.md) for QR code generation

---

### Exercise 5: QR Code Scanner
**Difficulty**: Intermediate  
**Estimated Time**: 1-1.5 hours

**Objectives**:
- Request camera permissions
- Implement QR code scanner using device camera
- Parse scanned Solana Pay URLs
- Display payment details before confirming

**Validation Criteria**:
- Camera permission is requested and handled
- QR codes are successfully scanned
- Solana Pay URLs are parsed correctly
- Invalid QR codes show appropriate error messages

**Hints**:
- Use `expo-camera` or `react-native-camera`
- Request permissions before opening camera
- Use `parseURL()` from `@solana/pay` to parse URLs
- Validate URL protocol is `solana:`

**Solution Reference**: See [Solana Pay](../04-solana-pay/README.md) for scanner implementation

---

### Exercise 6: Complete Payment Flow
**Difficulty**: Advanced  
**Estimated Time**: 2-3 hours

**Objectives**:
- Scan a Solana Pay QR code
- Parse payment request details
- Display confirmation dialog with payment info
- Execute payment transaction
- Show transaction confirmation

**Validation Criteria**:
- QR code scanning works correctly
- Payment details are displayed clearly
- User can confirm or cancel payment
- Transaction is executed successfully
- Transaction signature is shown

**Hints**:
- Combine QR scanner with transaction signing
- Show Alert dialog for payment confirmation
- Handle both payment requests and transaction requests
- Provide clear feedback at each step

**Solution Reference**: See [Solana Pay](../04-solana-pay/README.md) for complete payment flow

---

### Exercise 7: Token Balance Display
**Difficulty**: Advanced  
**Estimated Time**: 2-3 hours

**Objectives**:
- Fetch SPL token accounts for connected wallet
- Display list of token balances
- Show token metadata (name, symbol, logo)
- Handle tokens with different decimal places

**Validation Criteria**:
- All token accounts are fetched correctly
- Token balances are displayed with proper decimals
- Token metadata is shown (if available)
- Empty state is shown when no tokens exist

**Hints**:
- Use `getTokenAccountsByOwner()` to fetch token accounts
- Parse token account data to get balance
- Fetch token metadata from token mint
- Handle tokens with 0-9 decimal places

**Solution Reference**: See [Basics - Tokens](../../basics/03-tokens/README.md) for SPL token concepts

---

### Exercise 8: Merchant POS System
**Difficulty**: Advanced  
**Estimated Time**: 3-4 hours

**Objectives**:
- Create a point-of-sale interface for merchants
- Generate payment QR codes with custom amounts
- Track order numbers with memos
- Display payment status and history

**Validation Criteria**:
- Merchant can enter amount and order number
- QR code is generated with correct payment details
- Memo includes order number for tracking
- Payment confirmation is detected
- Transaction history is maintained

**Hints**:
- Use Solana Pay for payment requests
- Include order number in memo field
- Poll for transaction confirmation
- Store transaction history in AsyncStorage

**Solution Reference**: See [Solana Pay](../04-solana-pay/README.md) for POS implementation

---

### Exercise 9: Session Management
**Difficulty**: Intermediate  
**Estimated Time**: 1-1.5 hours

**Objectives**:
- Persist wallet session across app restarts
- Implement automatic reconnection
- Handle session expiration gracefully
- Provide manual disconnect option

**Validation Criteria**:
- Auth token is saved to AsyncStorage
- App reconnects automatically on launch
- Expired sessions trigger re-authorization
- User can manually disconnect

**Hints**:
- Save auth token after successful authorization
- Load token on app mount and attempt reauthorization
- Clear token on disconnect or error
- Use `reauthorize()` for existing sessions

**Solution Reference**: See [Wallet Adapter](../01-wallet-adapter/README.md) for session management

---

### Exercise 10: Multi-Wallet Support
**Difficulty**: Advanced  
**Estimated Time**: 2-3 hours

**Objectives**:
- Detect available wallet apps on device
- Allow user to choose wallet provider
- Handle different wallet capabilities
- Provide fallback for missing wallets

**Validation Criteria**:
- App detects installed wallet apps
- User can select preferred wallet
- Connection works with multiple wallet providers
- Helpful message shown if no wallets installed

**Hints**:
- Query system for installed wallet apps
- Provide wallet installation links
- Test with multiple wallet apps
- Handle wallet-specific quirks

**Solution Reference**: See [Wallet Adapter](../01-wallet-adapter/README.md) for multi-wallet patterns

---

## Exercise Guidelines

### Setup

1. Create a new React Native or Expo project
2. Install required dependencies (see [Setup Guide](../../setup/mobile-environment.md))
3. Configure polyfills and platform-specific settings
4. Install a compatible wallet app on your test device

### Testing

- Test on both Android and iOS (if possible)
- Test with multiple wallet providers
- Test error scenarios (network errors, insufficient balance, etc.)
- Test on both emulator and physical device

### Submission

For each exercise, ensure:
- Code is well-commented
- Error handling is implemented
- UI provides clear feedback
- App follows mobile best practices

## Additional Challenges

Once you've completed the exercises, try these challenges:

1. **Offline Support**: Implement offline transaction queuing
2. **Biometric Auth**: Add biometric authentication for transactions
3. **Transaction History**: Build a complete transaction history view
4. **NFT Display**: Show NFTs owned by connected wallet
5. **Multi-Signature**: Implement multi-signature transaction support
6. **Custom Tokens**: Add support for custom SPL token transfers
7. **Notification System**: Implement push notifications for transactions
8. **Dark Mode**: Add dark mode support to your dApp

## Resources

- [Mobile Wallet Adapter](../01-wallet-adapter/README.md)
- [React Native Integration](../02-react-native/README.md)
- [Expo Template](../03-expo-template/README.md)
- [Solana Pay](../04-solana-pay/README.md)
- [Setup Guide](../../setup/mobile-environment.md)

## Getting Help

If you get stuck:

1. Review the relevant topic documentation
2. Check the Solana Mobile documentation: https://docs.solanamobile.com
3. Look at example implementations on GitHub
4. Ask questions in the Solana Discord or Stack Exchange

---

**Note**: These exercises are designed for learning purposes. Always test on devnet before deploying to mainnet. Never share private keys or seed phrases.
