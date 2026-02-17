# Seed Vault SDK

Learn about the Seed Vault, a secure hardware-backed key storage system for Solana mobile wallets. This section covers the Seed Vault Wallet SDK, which enables wallet developers to leverage secure hardware for seed phrase protection.

## Overview

The Seed Vault is a critical component of the Solana Mobile Stack that provides hardware-backed security for wallet seed phrases. It leverages Android's secure hardware (Trusted Execution Environment or Secure Element) to protect cryptographic keys, making it significantly more secure than software-only key storage.

The Seed Vault SDK provides APIs for wallet developers to integrate with this secure storage, enabling features like biometric authentication, secure key derivation, and hardware-protected signing operations.

## What You'll Learn

In this section, you will learn:

- **Seed Vault Architecture**: Understand how the Seed Vault provides hardware-backed security
- **Wallet SDK APIs**: Use the Seed Vault Wallet SDK in your wallet app
- **Secure Key Management**: Implement secure seed phrase storage and derivation
- **Biometric Authentication**: Integrate biometric unlock for wallet operations
- **Hardware Security**: Leverage TEE/SE for maximum security
- **Best Practices**: Follow security best practices for wallet development

## Prerequisites

Before starting this section, you should:

- Complete [Mobile Wallet Adapter](../01-wallet-adapter/README.md)
- Have Android development experience
- Understand cryptographic concepts (seed phrases, key derivation, signing)
- Have your [mobile development environment](../../setup/mobile-environment.md) configured
- Understand [Security Best Practices](../../security/README.md)

## Learning Objectives

By the end of this section, you will be able to:

1. Understand the Seed Vault architecture and security model
2. Integrate the Seed Vault SDK into a wallet app
3. Implement secure seed phrase storage
4. Use hardware-backed key derivation
5. Implement biometric authentication for wallet operations
6. Handle Seed Vault errors and edge cases
7. Test Seed Vault integration with the simulator

## What is the Seed Vault?

The Seed Vault is a secure storage system designed specifically for Solana mobile wallets. It provides:

### Hardware-Backed Security

- **Trusted Execution Environment (TEE)**: Isolated secure area of the processor
- **Secure Element (SE)**: Dedicated security chip (on supported devices)
- **Hardware Key Storage**: Keys never leave secure hardware
- **Tamper Resistance**: Protection against physical attacks

### Key Features

1. **Secure Seed Storage**: Seed phrases stored in hardware-backed keystore
2. **Biometric Protection**: Unlock with fingerprint or face recognition
3. **Key Derivation**: Derive keys securely within hardware
4. **Signing Operations**: Sign transactions without exposing private keys
5. **Multi-Account Support**: Manage multiple accounts from one seed
6. **Purpose-Based Access**: Control which apps can access which keys

## Architecture

### Components

```
┌─────────────────────────────────────────┐
│         Wallet Application              │
│  (Uses Seed Vault Wallet SDK)           │
└─────────────┬───────────────────────────┘
              │
              │ Seed Vault Wallet API
              │
┌─────────────▼───────────────────────────┐
│      Seed Vault Service                 │
│  (System-level secure storage)          │
└─────────────┬───────────────────────────┘
              │
              │ Android Keystore API
              │
┌─────────────▼───────────────────────────┐
│   Hardware Security (TEE/SE)            │
│  (Secure key storage and operations)    │
└─────────────────────────────────────────┘
```

### Security Layers

1. **Application Layer**: Wallet app with Seed Vault SDK
2. **Service Layer**: Seed Vault system service
3. **OS Layer**: Android Keystore
4. **Hardware Layer**: TEE or Secure Element

## Seed Vault Wallet SDK

### Installation

Add the SDK to your Android wallet project:

```gradle
dependencies {
    implementation 'com.solanamobile:seedvault-wallet-sdk:0.4.0'
}
```

### Core APIs

The SDK provides several key interfaces:

1. **Seed Management**
   - Create new seeds
   - Import existing seeds
   - Derive accounts from seeds

2. **Authorization**
   - Request user authorization
   - Manage authorization tokens
   - Handle biometric authentication

3. **Signing**
   - Sign transactions
   - Sign messages
   - Verify signatures

4. **Account Management**
   - Derive accounts
   - List accounts
   - Get public keys

## Implementation Guide

### 1. Initialize Seed Vault

```kotlin
import com.solanamobile.seedvault.WalletContractV1

class MyWallet : Activity() {
    private lateinit var seedVault: WalletContractV1
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize Seed Vault connection
        seedVault = WalletContractV1.getInstance(this)
    }
}
```

### 2. Create or Import Seed

```kotlin
import com.solanamobile.seedvault.Bip32DerivationPath

// Create new seed
suspend fun createNewSeed(): Long {
    return seedVault.createSeed(
        authToken = getAuthToken(),
        purpose = Bip32DerivationPath.Purpose.BIP44
    )
}

// Import existing seed
suspend fun importSeed(mnemonic: String): Long {
    return seedVault.importSeed(
        authToken = getAuthToken(),
        mnemonic = mnemonic,
        purpose = Bip32DerivationPath.Purpose.BIP44
    )
}
```

### 3. Request Authorization

```kotlin
import android.hardware.biometrics.BiometricPrompt

suspend fun requestAuthorization(): AuthToken {
    val biometricPrompt = BiometricPrompt.Builder(this)
        .setTitle("Authorize Wallet Access")
        .setSubtitle("Unlock to access your wallet")
        .setNegativeButton("Cancel", mainExecutor) { _, _ ->
            // Handle cancellation
        }
        .build()
    
    return seedVault.authorize(
        purpose = Bip32DerivationPath.Purpose.BIP44,
        biometricPrompt = biometricPrompt
    )
}
```

### 4. Derive Accounts

```kotlin
// Derive Solana account
suspend fun deriveAccount(
    seedId: Long,
    accountIndex: Int
): PublicKey {
    val derivationPath = Bip32DerivationPath(
        purpose = Bip32DerivationPath.Purpose.BIP44,
        coinType = 501, // Solana
        account = accountIndex,
        change = 0,
        addressIndex = 0
    )
    
    val publicKey = seedVault.getPublicKey(
        authToken = getAuthToken(),
        seedId = seedId,
        derivationPath = derivationPath
    )
    
    return PublicKey(publicKey)
}
```

### 5. Sign Transactions

```kotlin
import com.solana.core.Transaction

suspend fun signTransaction(
    seedId: Long,
    transaction: Transaction,
    accountIndex: Int
): ByteArray {
    val derivationPath = Bip32DerivationPath(
        purpose = Bip32DerivationPath.Purpose.BIP44,
        coinType = 501,
        account = accountIndex,
        change = 0,
        addressIndex = 0
    )
    
    val messageToSign = transaction.serializeMessage()
    
    return seedVault.signTransaction(
        authToken = getAuthToken(),
        seedId = seedId,
        derivationPath = derivationPath,
        message = messageToSign
    )
}
```

### 6. Sign Messages

```kotlin
suspend fun signMessage(
    seedId: Long,
    message: ByteArray,
    accountIndex: Int
): ByteArray {
    val derivationPath = Bip32DerivationPath(
        purpose = Bip32DerivationPath.Purpose.BIP44,
        coinType = 501,
        account = accountIndex,
        change = 0,
        addressIndex = 0
    )
    
    return seedVault.signMessage(
        authToken = getAuthToken(),
        seedId = seedId,
        derivationPath = derivationPath,
        message = message
    )
}
```

## Biometric Authentication

### Setup Biometric Prompt

```kotlin
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat

fun setupBiometricAuth(): BiometricPrompt {
    val executor = ContextCompat.getMainExecutor(this)
    
    val biometricPrompt = BiometricPrompt(
        this,
        executor,
        object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationSucceeded(
                result: BiometricPrompt.AuthenticationResult
            ) {
                // Proceed with wallet operation
                performSecureOperation()
            }
            
            override fun onAuthenticationError(
                errorCode: Int,
                errString: CharSequence
            ) {
                // Handle error
                showError("Authentication failed: $errString")
            }
            
            override fun onAuthenticationFailed() {
                // Handle failure
                showError("Authentication failed")
            }
        }
    )
    
    return biometricPrompt
}
```

### Prompt User

```kotlin
fun promptBiometric() {
    val promptInfo = BiometricPrompt.PromptInfo.Builder()
        .setTitle("Unlock Wallet")
        .setSubtitle("Authenticate to access your wallet")
        .setNegativeButtonText("Cancel")
        .build()
    
    biometricPrompt.authenticate(promptInfo)
}
```

## Security Best Practices

### 1. Never Export Private Keys

```kotlin
// ❌ NEVER DO THIS
fun exportPrivateKey(): ByteArray {
    // Private keys should NEVER leave the Seed Vault
    return seedVault.getPrivateKey() // This doesn't exist!
}

// ✅ DO THIS INSTEAD
suspend fun signWithSecureKey(message: ByteArray): ByteArray {
    // Sign within the Seed Vault
    return seedVault.signMessage(authToken, seedId, path, message)
}
```

### 2. Validate Authorization Tokens

```kotlin
suspend fun performSecureOperation() {
    val authToken = getAuthToken()
    
    if (!seedVault.isAuthTokenValid(authToken)) {
        // Re-authenticate
        val newToken = requestAuthorization()
        saveAuthToken(newToken)
    }
    
    // Proceed with operation
}
```

### 3. Handle Errors Gracefully

```kotlin
suspend fun safeSignTransaction(tx: Transaction): Result<ByteArray> {
    return try {
        val signature = signTransaction(seedId, tx, accountIndex)
        Result.success(signature)
    } catch (e: AuthorizationException) {
        // User denied authorization
        Result.failure(e)
    } catch (e: SeedVaultException) {
        // Seed Vault error
        Result.failure(e)
    } catch (e: Exception) {
        // Other errors
        Result.failure(e)
    }
}
```

### 4. Implement Timeout

```kotlin
class AuthTokenManager {
    private var authToken: AuthToken? = null
    private var tokenTimestamp: Long = 0
    private val TOKEN_VALIDITY_MS = 5 * 60 * 1000 // 5 minutes
    
    fun getAuthToken(): AuthToken? {
        val now = System.currentTimeMillis()
        if (now - tokenTimestamp > TOKEN_VALIDITY_MS) {
            authToken = null
        }
        return authToken
    }
    
    fun setAuthToken(token: AuthToken) {
        authToken = token
        tokenTimestamp = System.currentTimeMillis()
    }
}
```

## Testing with Simulator

The Seed Vault SDK includes a simulator for development and testing:

### Setup Simulator

```gradle
dependencies {
    debugImplementation 'com.solanamobile:seedvault-wallet-impl:0.4.0'
}
```

### Use in Development

```kotlin
import com.solanamobile.seedvault.impl.SimulatedSeedVault

class MyWalletDebug : MyWallet() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        if (BuildConfig.DEBUG) {
            // Use simulator in debug builds
            seedVault = SimulatedSeedVault.getInstance(this)
        }
    }
}
```

### Important: Simulator Limitations

⚠️ **WARNING**: The simulator makes ZERO guarantees about security. It should NEVER be used with real Solana accounts or mainnet. Use only for:

- Development and testing
- Devnet accounts only
- Understanding API behavior
- Integration testing

## Common Patterns

### Multi-Account Wallet

```kotlin
class MultiAccountWallet {
    private val seedId: Long = /* ... */
    
    suspend fun getAccounts(count: Int): List<Account> {
        return (0 until count).map { index ->
            val publicKey = deriveAccount(seedId, index)
            Account(index, publicKey)
        }
    }
    
    suspend fun signWithAccount(
        accountIndex: Int,
        transaction: Transaction
    ): ByteArray {
        return signTransaction(seedId, transaction, accountIndex)
    }
}

data class Account(
    val index: Int,
    val publicKey: PublicKey
)
```

### Purpose-Based Access

```kotlin
enum class WalletPurpose {
    SIGNING,
    VIEWING,
    MANAGEMENT
}

suspend fun requestPurposeAuth(purpose: WalletPurpose): AuthToken {
    return when (purpose) {
        WalletPurpose.SIGNING -> {
            // Require biometric for signing
            requestBiometricAuth()
        }
        WalletPurpose.VIEWING -> {
            // Allow viewing without biometric
            getViewOnlyToken()
        }
        WalletPurpose.MANAGEMENT -> {
            // Require strong authentication
            requestStrongAuth()
        }
    }
}
```

## Error Handling

### Common Errors

```kotlin
sealed class SeedVaultError {
    object AuthorizationDenied : SeedVaultError()
    object BiometricNotAvailable : SeedVaultError()
    object SeedNotFound : SeedVaultError()
    object InvalidDerivationPath : SeedVaultError()
    data class Unknown(val message: String) : SeedVaultError()
}

fun handleSeedVaultException(e: Exception): SeedVaultError {
    return when (e) {
        is AuthorizationException -> SeedVaultError.AuthorizationDenied
        is BiometricException -> SeedVaultError.BiometricNotAvailable
        is SeedNotFoundException -> SeedVaultError.SeedNotFound
        is DerivationException -> SeedVaultError.InvalidDerivationPath
        else -> SeedVaultError.Unknown(e.message ?: "Unknown error")
    }
}
```

## Device Compatibility

### Checking Hardware Support

```kotlin
import android.security.keystore.KeyProperties

fun checkHardwareSupport(): HardwareSupport {
    val keyStore = KeyStore.getInstance("AndroidKeyStore")
    keyStore.load(null)
    
    return HardwareSupport(
        hasStrongBox = hasStrongBoxSupport(),
        hasTEE = hasTEESupport(),
        hasBiometric = hasBiometricSupport()
    )
}

data class HardwareSupport(
    val hasStrongBox: Boolean,
    val hasTEE: Boolean,
    val hasBiometric: Boolean
)
```

### Fallback Strategies

```kotlin
suspend fun getSecureStorage(): SecureStorage {
    val support = checkHardwareSupport()
    
    return when {
        support.hasStrongBox -> StrongBoxStorage()
        support.hasTEE -> TEEStorage()
        else -> {
            // Warn user about reduced security
            showSecurityWarning()
            SoftwareStorage()
        }
    }
}
```

## Integration with Mobile Wallet Adapter

### Complete Wallet Flow

```kotlin
class SeedVaultWallet : MobileWalletAdapterActivity() {
    private lateinit var seedVault: WalletContractV1
    private var seedId: Long = -1
    
    override suspend fun authorize(request: AuthorizeRequest): AuthorizeResult {
        // Request Seed Vault authorization
        val authToken = requestAuthorization()
        
        // Derive account for this dApp
        val publicKey = deriveAccount(seedId, 0)
        
        return AuthorizeResult.Success(
            publicKey = publicKey.toByteArray(),
            accountLabel = "My Wallet",
            walletUriBase = "https://mywallet.com"
        )
    }
    
    override suspend fun signTransactions(
        request: SignTransactionsRequest
    ): SignTransactionsResult {
        val signatures = request.transactions.map { tx ->
            signTransaction(seedId, tx, 0)
        }
        
        return SignTransactionsResult.Success(signatures)
    }
}
```

## Best Practices Summary

1. **Never Export Keys**: Keep private keys in Seed Vault
2. **Use Biometrics**: Require biometric auth for sensitive operations
3. **Validate Tokens**: Check auth token validity before operations
4. **Handle Errors**: Gracefully handle all error cases
5. **Test Thoroughly**: Use simulator for development, test on real devices
6. **Timeout Sessions**: Implement auth token timeouts
7. **Warn Users**: Inform users about security implications
8. **Check Hardware**: Verify hardware security support
9. **Follow Standards**: Use BIP32/BIP44 derivation paths
10. **Audit Code**: Regular security audits for wallet code

## Troubleshooting

**Issue**: Biometric authentication not working

**Solution**: Check device biometric enrollment:
```kotlin
val biometricManager = BiometricManager.from(context)
when (biometricManager.canAuthenticate(BIOMETRIC_STRONG)) {
    BiometricManager.BIOMETRIC_SUCCESS -> {
        // Biometric available
    }
    BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE -> {
        // No biometric hardware
    }
    BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> {
        // User hasn't enrolled biometric
    }
}
```

**Issue**: Seed Vault not available

**Solution**: Check if Seed Vault service is installed and enabled.

**Issue**: Authorization fails repeatedly

**Solution**: Clear auth tokens and re-authenticate:
```kotlin
authTokenManager.clearToken()
val newToken = requestAuthorization()
```

## Next Steps

After mastering Seed Vault:

1. **Build Secure Wallet**: Create a production wallet with Seed Vault
2. **Learn Publishing**: Move to [dApp Publishing](../07-dapp-publishing/README.md)
3. **Study Security**: Deep dive into [Security Best Practices](../../security/README.md)
4. **Explore Advanced**: Check [Integration Projects](../../integration/README.md)

## Additional Resources

- **Seed Vault SDK**: https://github.com/solana-mobile/seed-vault-sdk
- **Integration Guide**: https://github.com/solana-mobile/seed-vault-sdk/blob/main/docs/integration_guide.md
- **JavaDoc**: https://solana-mobile.github.io/seed-vault-sdk/seedvault/javadoc/
- **Android Keystore**: https://developer.android.com/training/articles/keystore
- **Biometric Authentication**: https://developer.android.com/training/sign-in/biometric-auth

## Exercises

Practice Seed Vault integration in [exercises/06-seed-vault.md](../exercises/06-seed-vault.md)

---

**Source**: Adapted from Seed Vault SDK documentation at https://github.com/solana-mobile/seed-vault-sdk

Ready to publish your dApp? Continue to [dApp Publishing](../07-dapp-publishing/README.md)!
