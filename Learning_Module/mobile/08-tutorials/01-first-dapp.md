# Tutorial: Your First Mobile dApp

Build your first React Native dApp that sends a message to the Solana network using the Memo program.

## What You'll Build

A mobile application that:
- Connects to a Solana wallet using Mobile Wallet Adapter
- Checks wallet balance on devnet
- Requests SOL airdrops
- Sends a message to the blockchain using the Memo program
- Views the message on Solana Explorer

## What You'll Learn

- How to use Mobile Wallet Adapter to connect to wallet apps
- How to connect to devnet and check wallet balance
- How to request an airdrop of SOL
- How to use the Memo program to write messages to the network
- How to view transactions on Solana Explorer

## Prerequisites

- Complete [React Native Setup](../02-react-native/README.md)
- Have an Android emulator or device running
- Have an MWA-compatible wallet installed (Phantom, Solflare, or Fakewallet)
- Basic understanding of React and TypeScript

## Step 1: Clone the React Native dApp Scaffold

We'll build off the official React Native Scaffold which provides a simple UI for wallet connection, airdrops, and transaction signing.

### Initialize the template

```bash
npx react-native init FirstDappTutorial --template @solana-mobile/solana-mobile-dapp-scaffold --npm
```

### Install dependencies

```bash
cd FirstDappTutorial
npm install
```

### Build and launch

Make sure your emulator/device is running, then:

```bash
npx react-native run-android
```

### First Run

Your app should build, install, and launch automatically. You'll also see the Metro Bundler console window for logs and debugging.

With React Native's fast refresh feature, you can edit components, save changes, and immediately see updates!

## Step 2: Explore the Scaffold

Before adding new features, let's understand what the scaffold provides.

### Connect Button

The "Connect Wallet" button connects to an MWA-compatible wallet using the Mobile Wallet Adapter SDK.

**Location**: `src/components/MainScreen.tsx`

```typescript
await transact(async wallet => {
    await authorizeSession(wallet);
});
```

The `AuthorizationProvider` manages wallet authorization, calling `wallet.authorize()` on first connect and `wallet.reauthorize()` for subsequent connections.

```typescript
const authorizeSession = useCallback(
    async (wallet: AuthorizeAPI & ReauthorizeAPI) => {
        const authorizationResult = await (authorization
        ? wallet.reauthorize({
            auth_token: authorization.authToken,
            identity: APP_IDENTITY,
            })
        : wallet.authorize({
            cluster: APP_CLUSTER,
            identity: APP_IDENTITY,
            }));
        return (await handleAuthorizationResult(authorizationResult))
            .selectedAccount;
    },
    [authorization, handleAuthorizationResult],
);
```

### Account Info

Displays wallet balance by converting lamports to SOL.

**Balance fetching**:

```typescript
const {connection} = useConnection();

const fetchAndUpdateBalance = useCallback(
    async (account: Account) => {
        const fetchedBalance = await connection.getBalance(account.publicKey);
        setBalance(fetchedBalance);
    },
    [connection],
);
```

### Airdrop Button

Requests an airdrop of SOL to the connected wallet on devnet.

```typescript
const requestAirdrop = useCallback(async () => {
    const signature = await connection.requestAirdrop(
        selectedAccount.publicKey,
        LAMPORTS_PER_AIRDROP,
    );
    return await connection.confirmTransaction(signature);
}, [connection, selectedAccount]);
```

### Sign Transaction Button

Creates a simple transfer transaction and requests the wallet to sign it.

```typescript
const signTransaction = useCallback(async () => {
    return await transact(async (wallet: Web3MobileWallet) => {
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

        const [authorizationResult, latestBlockhash] = await Promise.all([
            authorizeSession(wallet),
            connection.getLatestBlockhash(),
        ]);

        const randomTransferTransaction = new Transaction({
            ...latestBlockhash,
            feePayer: authorizationResult.publicKey,
        }).add(
            SystemProgram.transfer({
                fromPubkey: authorizationResult.publicKey,
                toPubkey: Keypair.generate().publicKey,
                lamports: 1_000,
            }),
        );

        const signedTransactions = await wallet.signTransactions({
            transactions: [randomTransferTransaction],
        });

        return signedTransactions[0];
    });
}, [authorizeSession]);
```

## Step 3: Create a Memo Transaction

Now let's add new functionality to send a message to the blockchain using the Memo program.

### Create SendMemoButton Component

Copy the `SignTransactionButton` component and rename it to `SendMemoButton.tsx`.

**Location**: `src/components/SendMemoButton.tsx`

### Import Required Dependencies

```typescript
import React, {useState, useCallback} from 'react';
import {Button, Alert, Linking} from 'react-native';
import {
  Transaction,
  TransactionInstruction,
  PublicKey,
  RpcResponseAndContext,
  SignatureResult,
} from '@solana/web3.js';
import {transact, Web3MobileWallet} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import {TextEncoder} from 'text-encoding';
```

### Construct the Memo Transaction

Replace the random transfer with a memo program transaction:

```typescript
const sendMemo = useCallback(
    async (
        messageBuffer: Buffer,
    ): Promise<[string, RpcResponseAndContext<SignatureResult>]> => {
        const latestBlockhash = await connection.getLatestBlockhash();
        
        const signature = await transact(async (wallet: Web3MobileWallet) => {
            // Authorize the wallet session
            const authorizationResult = await authorizeSession(wallet);

            // Construct the memo transaction
            const memoProgramTransaction = new Transaction({
                ...latestBlockhash,
                feePayer: authorizationResult.publicKey,
            }).add(
                new TransactionInstruction({
                    data: messageBuffer,
                    keys: [],
                    programId: new PublicKey(
                        'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr', // Memo Program address
                    ),
                }),
            );

            // Request wallet to sign and send the transaction
            const transactionSignatures = await wallet.signAndSendTransactions({
                transactions: [memoProgramTransaction],
            });
            
            return transactionSignatures[0];
        });

        // Confirm the transaction was processed
        const confirmationResponse = await connection.confirmTransaction({
            signature: signature,
            ...latestBlockhash,
        });

        return [signature, confirmationResponse];
    },
    [authorizeSession, connection],
);
```

### Add Explorer Link Navigation

Create a function to show an alert with a link to Solana Explorer:

```typescript
function showExplorerAlert(memoTransactionSignature: string, cluster: string) {
  const explorerUrl =
    'https://explorer.solana.com/tx/' +
    memoTransactionSignature +
    '?cluster=' +
    cluster;
    
  Alert.alert(
    'Success!',
    'Your message was successfully recorded. View your message on Solana Explorer:',
    [
      {text: 'View', onPress: () => Linking.openURL(explorerUrl)},
      {text: 'Cancel', style: 'cancel'},
    ],
  );
}
```

### Create the Button Component

```typescript
export function SendMemoButton({
  authorizeSession,
  connection,
}: {
  authorizeSession: (wallet: any) => Promise<any>;
  connection: Connection;
}) {
  const [signingInProgress, setSigningInProgress] = useState(false);

  // Your message to send
  const message = "Hello Solana!";
  const messageBuffer = new TextEncoder().encode(message) as Buffer;

  return (
    <Button
      title="Send Memo!"
      disabled={signingInProgress}
      onPress={async () => {
        if (signingInProgress) {
          return;
        }
        setSigningInProgress(true);
        try {
          const [memoTransactionSignature, confirmationResponse] = await sendMemo(messageBuffer);
          
          const err = confirmationResponse.value.err;
          if (err) {
            console.log(
              'Failed to record message:' +
              (err instanceof Error ? err.message : err),
            );
          } else {
            // Show explorer link
            showExplorerAlert(memoTransactionSignature, 'devnet');
          }
        } catch (error) {
          console.error('Error sending memo:', error);
        } finally {
          setSigningInProgress(false);
        }
      }}
    />
  );
}
```

## Step 4: Add to Main Screen

Update `MainScreen.tsx` to include the new `SendMemoButton`:

```typescript
import {SendMemoButton} from './SendMemoButton';

// In your render method, replace SignTransactionButton with:
<SendMemoButton
  authorizeSession={authorizeSession}
  connection={connection}
/>
```

## Step 5: Test Your dApp

### 1. Request an Airdrop

Before sending a memo, you need SOL for transaction fees:

1. Connect your wallet
2. Tap "Request Airdrop"
3. Wait for confirmation
4. Check your balance updates

### 2. Send a Memo

1. Tap "Send Memo!"
2. Approve the transaction in your wallet
3. Wait for confirmation
4. Tap "View" to see your message on Solana Explorer

### 3. View on Explorer

On Solana Explorer, you'll see:
- Transaction signature
- Block information
- Program logs showing your message
- Fee information

## Understanding the Code

### Memo Program

The Memo program is a simple Solana program that stores arbitrary data on-chain:

```typescript
programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr')
```

Any data passed in the instruction is stored in the transaction logs.

### Transaction Construction

```typescript
const transaction = new Transaction({
    ...latestBlockhash,      // Recent blockhash for expiry
    feePayer: publicKey,     // Who pays the fee
}).add(instruction);         // Add your instruction
```

### Sign and Send

```typescript
const signatures = await wallet.signAndSendTransactions({
    transactions: [transaction],
});
```

This is a convenience method that:
1. Signs the transaction with the wallet's private key
2. Sends it to the RPC endpoint
3. Returns the transaction signature

### Transaction Confirmation

```typescript
const confirmation = await connection.confirmTransaction({
    signature: signature,
    ...latestBlockhash,
});
```

This waits for the transaction to be confirmed by the network.

## Customization Ideas

### 1. Custom Messages

Allow users to input their own messages:

```typescript
const [message, setMessage] = useState('');

<TextInput
  value={message}
  onChangeText={setMessage}
  placeholder="Enter your message"
/>
```

### 2. Message History

Store sent messages locally:

```typescript
const [messages, setMessages] = useState([]);

const addMessage = (message, signature) => {
  setMessages([...messages, {message, signature, timestamp: Date.now()}]);
};
```

### 3. Character Limit

Add validation for message length:

```typescript
const MAX_MEMO_LENGTH = 566; // Memo program limit

if (message.length > MAX_MEMO_LENGTH) {
  Alert.alert('Error', 'Message too long!');
  return;
}
```

### 4. Rich UI

Add styling and animations:

```typescript
import {StyleSheet, View, Text} from 'react-native';

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  button: {
    backgroundColor: '#14F195',
    padding: 15,
    borderRadius: 8,
  },
});
```

## Troubleshooting

### Issue: Wallet connection fails

**Solution**:
- Ensure wallet app is installed
- Check both apps are on same device
- Try restarting both apps

### Issue: Airdrop fails

**Solution**:
- Devnet can be rate-limited
- Wait a few minutes and try again
- Check devnet status

### Issue: Transaction fails

**Solution**:
- Ensure you have sufficient SOL
- Check network connection
- Verify you're on devnet

### Issue: Metro bundler errors

**Solution**:
```bash
npx react-native start --reset-cache
```

## Best Practices

### 1. Error Handling

Always handle errors gracefully:

```typescript
try {
  await sendMemo(message);
} catch (error) {
  Alert.alert('Error', error.message);
}
```

### 2. Loading States

Show loading indicators:

```typescript
const [loading, setLoading] = useState(false);

<Button
  title={loading ? 'Sending...' : 'Send Memo'}
  disabled={loading}
/>
```

### 3. User Feedback

Provide clear feedback:

```typescript
Alert.alert(
  'Success!',
  'Your message was recorded on Solana!',
  [{text: 'OK'}]
);
```

### 4. Input Validation

Validate user input:

```typescript
if (!message.trim()) {
  Alert.alert('Error', 'Please enter a message');
  return;
}
```

## Next Steps

Congratulations! You've built your first mobile dApp. Here's what to explore next:

1. **Add Features**: Implement message history, custom styling, or user profiles
2. **Study Samples**: Explore [Real-World Samples](../exercises/real-world-samples.md)
3. **Learn Anchor**: Move to [Anchor Counter Tutorial](02-anchor-counter.md)
4. **Build More**: Create your own unique mobile dApp

## Additional Resources

- [Mobile Wallet Adapter Guide](../01-wallet-adapter/README.md)
- [React Native Integration](../02-react-native/README.md)
- [Solana Cookbook](https://solanacookbook.com)
- [Memo Program Docs](https://spl.solana.com/memo)

## Complete Code

The complete tutorial code is available at:
- [Tutorial Apps Repository](https://github.com/solana-mobile/tutorial-apps/tree/main/first-mobile-dapp)

---

**Source**: Adapted from official Solana Mobile tutorial at https://docs.solanamobile.com/react-native/first_app_tutorial

Ready for more? Continue to [Anchor Counter Tutorial](02-anchor-counter.md)!
