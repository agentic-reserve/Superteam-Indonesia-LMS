# Troubleshooting Guide

This guide provides solutions to common issues encountered during Solana development environment setup. Issues are organized by category for easy navigation.

## Table of Contents

- [Solana CLI Issues](#solana-cli-issues)
- [Rust and Cargo Issues](#rust-and-cargo-issues)
- [Anchor Framework Issues](#anchor-framework-issues)
- [Network and Connection Issues](#network-and-connection-issues)
- [Wallet and Keypair Issues](#wallet-and-keypair-issues)
- [Build and Compilation Issues](#build-and-compilation-issues)
- [Deployment Issues](#deployment-issues)
- [Mobile Development Issues](#mobile-development-issues)
- [Hardware and IoT Issues](#hardware-and-iot-issues)
- [General Environment Issues](#general-environment-issues)

---

## Solana CLI Issues

### Issue: `solana: command not found`

**Symptoms**: After installation, the `solana` command is not recognized.

**Solutions**:

1. **PATH not updated**: Add Solana to your PATH
   ```bash
   export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
   ```
   Add this line to your shell configuration file (`~/.bashrc`, `~/.zshrc`, etc.) and reload:
   ```bash
   source ~/.bashrc  # or ~/.zshrc
   ```

2. **Installation incomplete**: Reinstall Solana CLI
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   ```

3. **Verify installation location**:
   ```bash
   ls -la ~/.local/share/solana/install/active_release/bin/
   ```

### Issue: Solana CLI version mismatch

**Symptoms**: Error messages about incompatible versions or features not available.

**Solutions**:

1. **Update to latest stable version**:
   ```bash
   solana-install update
   ```

2. **Install specific version**:
   ```bash
   solana-install init 1.18.0
   ```

3. **Check current version**:
   ```bash
   solana --version
   solana-install info
   ```

### Issue: `solana config get` shows wrong network

**Symptoms**: Commands execute on wrong cluster (e.g., mainnet instead of devnet).

**Solutions**:

1. **Set correct cluster**:
   ```bash
   solana config set --url https://api.devnet.solana.com
   ```

2. **Verify configuration**:
   ```bash
   solana config get
   ```

3. **Check config file directly**:
   ```bash
   cat ~/.config/solana/cli/config.yml
   ```

---

## Rust and Cargo Issues

### Issue: `rustc: command not found`

**Symptoms**: Rust compiler not found after installation.

**Solutions**:

1. **Source cargo environment**:
   ```bash
   source $HOME/.cargo/env
   ```

2. **Add to shell configuration**:
   Add this line to `~/.bashrc` or `~/.zshrc`:
   ```bash
   source $HOME/.cargo/env
   ```

3. **Reinstall Rust**:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

### Issue: Rust version too old

**Symptoms**: Build errors mentioning unsupported Rust features or syntax.

**Solutions**:

1. **Update Rust**:
   ```bash
   rustup update stable
   ```

2. **Set stable as default**:
   ```bash
   rustup default stable
   ```

3. **Verify version**:
   ```bash
   rustc --version  # Should be 1.75.0 or later
   ```

### Issue: Missing BPF/SBF target

**Symptoms**: Error: "can't find crate for `std`" or "unknown target triple 'bpf-unknown-unknown'".

**Solutions**:

1. **Add BPF target**:
   ```bash
   rustup target add bpf-unknown-unknown
   ```

2. **Add SBF target** (for newer Solana versions):
   ```bash
   rustup target add sbf-solana-solana
   ```

3. **List installed targets**:
   ```bash
   rustup target list --installed
   ```

### Issue: Cargo build fails with linker errors

**Symptoms**: "linker `cc` not found" or "linker `rust-lld` not found".

**Solutions**:

1. **Linux**: Install build essentials
   ```bash
   sudo apt-get update
   sudo apt-get install -y build-essential pkg-config libssl-dev
   ```

2. **macOS**: Install Xcode command-line tools
   ```bash
   xcode-select --install
   ```

3. **Update Rust toolchain**:
   ```bash
   rustup self update
   rustup update
   ```

---

## Anchor Framework Issues

### Issue: `anchor: command not found`

**Symptoms**: Anchor CLI not recognized after installation.

**Solutions**:

1. **Verify cargo bin in PATH**:
   ```bash
   export PATH="$HOME/.cargo/bin:$PATH"
   ```

2. **Reinstall Anchor using AVM**:
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
   avm install latest
   avm use latest
   ```

3. **Check installation**:
   ```bash
   which anchor
   anchor --version
   ```

### Issue: Anchor version conflicts

**Symptoms**: "version mismatch" errors or incompatible dependencies.

**Solutions**:

1. **Use AVM to manage versions**:
   ```bash
   avm list
   avm use 0.30.0
   ```

2. **Update Anchor.toml and Cargo.toml** to use matching versions:
   ```toml
   [dependencies]
   anchor-lang = "0.30.0"
   ```

3. **Clean and rebuild**:
   ```bash
   anchor clean
   cargo clean
   anchor build
   ```

### Issue: `anchor build` fails with dependency errors

**Symptoms**: "failed to get `anchor-lang` as a dependency" or network timeout errors.

**Solutions**:

1. **Check internet connection** and retry

2. **Update cargo index**:
   ```bash
   cargo update
   ```

3. **Clean cargo cache**:
   ```bash
   rm -rf ~/.cargo/registry/index/*
   cargo clean
   ```

4. **Use alternative registry** (add to `~/.cargo/config.toml`):
   ```toml
   [source.crates-io]
   replace-with = "mirror"

   [source.mirror]
   registry = "https://github.com/rust-lang/crates.io-index"
   ```

### Issue: `anchor test` hangs or times out

**Symptoms**: Tests start but never complete, or timeout after long wait.

**Solutions**:

1. **Increase test timeout** in package.json:
   ```json
   "scripts": {
     "test": "mocha -t 1000000 tests/**/*.ts"
   }
   ```

2. **Check if local validator is running**:
   ```bash
   ps aux | grep solana-test-validator
   ```

3. **Kill existing validator and restart**:
   ```bash
   pkill solana-test-validator
   solana-test-validator --reset
   ```

4. **Use `--skip-local-validator` flag** if validator is already running:
   ```bash
   anchor test --skip-local-validator
   ```

---

## Network and Connection Issues

### Issue: Airdrop requests fail

**Symptoms**: "airdrop request failed" or "429 Too Many Requests".

**Solutions**:

1. **Rate limiting**: Wait 1-2 minutes between requests

2. **Request smaller amounts**:
   ```bash
   solana airdrop 1  # Instead of 2 or 5
   ```

3. **Use web-based faucet**:
   - Visit https://faucet.solana.com
   - Enter your wallet address
   - Complete CAPTCHA

4. **Check network status**:
   ```bash
   solana cluster-version
   solana gossip
   ```

5. **Switch to different RPC endpoint**:
   ```bash
   solana config set --url https://api.devnet.solana.com
   # Or try alternative endpoints
   solana config set --url https://devnet.helius-rpc.com
   ```

### Issue: RPC connection timeout

**Symptoms**: "unable to connect to RPC" or "connection timed out".

**Solutions**:

1. **Check internet connection**

2. **Verify RPC URL**:
   ```bash
   solana config get
   ```

3. **Test RPC endpoint**:
   ```bash
   curl -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' https://api.devnet.solana.com
   ```

4. **Use alternative RPC provider**:
   ```bash
   # Helius
   solana config set --url https://devnet.helius-rpc.com
   
   # QuickNode (requires account)
   solana config set --url https://your-endpoint.solana-devnet.quiknode.pro/
   ```

5. **Check firewall settings**: Ensure ports 8899-8900 are not blocked

### Issue: Transaction confirmation timeout

**Symptoms**: Transactions submitted but never confirmed.

**Solutions**:

1. **Check transaction status**:
   ```bash
   solana confirm <SIGNATURE>
   ```

2. **Increase confirmation timeout** in code:
   ```typescript
   const connection = new Connection(clusterApiUrl('devnet'), {
     commitment: 'confirmed',
     confirmTransactionInitialTimeout: 60000
   });
   ```

3. **Check network congestion**:
   ```bash
   solana block-production
   solana ping
   ```

4. **Retry with higher priority fees** (for mainnet):
   ```typescript
   transaction.add(
     ComputeBudgetProgram.setComputeUnitPrice({
       microLamports: 1000
     })
   );
   ```

---

## Wallet and Keypair Issues

### Issue: Lost or forgotten keypair passphrase

**Symptoms**: Cannot access wallet due to forgotten BIP39 passphrase.

**Solutions**:

1. **If you have seed phrase**: Recover wallet
   ```bash
   solana-keygen recover
   ```
   Enter your seed phrase when prompted

2. **If no seed phrase**: Wallet is unrecoverable
   - Create new wallet: `solana-keygen new`
   - Request new devnet airdrop

3. **Prevention**: Always save seed phrase securely offline

### Issue: Permission denied when accessing keypair

**Symptoms**: "Permission denied" error when running Solana commands.

**Solutions**:

1. **Fix file permissions**:
   ```bash
   chmod 600 ~/.config/solana/id.json
   ```

2. **Check file ownership**:
   ```bash
   ls -la ~/.config/solana/id.json
   chown $USER:$USER ~/.config/solana/id.json
   ```

3. **Verify keypair path**:
   ```bash
   solana config get
   ```

### Issue: Wrong keypair being used

**Symptoms**: Commands execute with unexpected wallet address.

**Solutions**:

1. **Check current keypair**:
   ```bash
   solana address
   solana config get
   ```

2. **Set correct keypair**:
   ```bash
   solana config set --keypair ~/.config/solana/id.json
   ```

3. **Use specific keypair for single command**:
   ```bash
   solana balance --keypair ~/my-other-wallet.json
   ```

---

## Build and Compilation Issues

### Issue: Out of memory during build

**Symptoms**: "signal: 9, SIGKILL: kill" or system freezes during compilation.

**Solutions**:

1. **Increase swap space** (Linux):
   ```bash
   sudo fallocate -l 4G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

2. **Build with fewer parallel jobs**:
   ```bash
   cargo build --release -j 2
   ```

3. **Close other applications** to free memory

4. **Use cloud build environment** if local resources insufficient

### Issue: Compilation takes extremely long

**Symptoms**: Build process runs for 30+ minutes.

**Solutions**:

1. **First build is always slow**: Subsequent builds use cache

2. **Enable incremental compilation** (add to Cargo.toml):
   ```toml
   [profile.dev]
   incremental = true
   ```

3. **Use faster linker** (Linux, add to `~/.cargo/config.toml`):
   ```toml
   [target.x86_64-unknown-linux-gnu]
   linker = "clang"
   rustflags = ["-C", "link-arg=-fuse-ld=lld"]
   ```

4. **Clean and rebuild** if cache is corrupted:
   ```bash
   cargo clean
   anchor clean
   ```

### Issue: "program too large" error

**Symptoms**: "Program too large: X bytes (max Y bytes)".

**Solutions**:

1. **Enable optimization** in Cargo.toml:
   ```toml
   [profile.release]
   opt-level = "z"
   lto = "fat"
   codegen-units = 1
   ```

2. **Remove unused dependencies**

3. **Split into multiple programs** if necessary

4. **Use `anchor build --verifiable`** for optimized builds

---

## Deployment Issues

### Issue: Insufficient funds for deployment

**Symptoms**: "insufficient funds" or "insufficient lamports" error.

**Solutions**:

1. **Check balance**:
   ```bash
   solana balance
   ```

2. **Request airdrop** (devnet):
   ```bash
   solana airdrop 2
   ```

3. **Estimate deployment cost**:
   ```bash
   solana program deploy --dry-run target/deploy/program.so
   ```

4. **For mainnet**: Ensure wallet has enough SOL (typically 2-5 SOL for deployment)

### Issue: Program deployment fails with "invalid program"

**Symptoms**: "Error: Program is not valid" or "invalid ELF header".

**Solutions**:

1. **Rebuild program**:
   ```bash
   anchor clean
   anchor build
   ```

2. **Verify build artifacts exist**:
   ```bash
   ls -la target/deploy/
   ```

3. **Check Solana CLI version compatibility**:
   ```bash
   solana --version
   anchor --version
   ```

4. **Deploy with verbose output**:
   ```bash
   anchor deploy --provider.cluster devnet --verbose
   ```

### Issue: Program already deployed at address

**Symptoms**: "Error: Program already exists at address".

**Solutions**:

1. **Use upgrade instead of deploy**:
   ```bash
   anchor upgrade <PROGRAM_ID> --program-keypair target/deploy/program-keypair.json
   ```

2. **Deploy to new address**:
   ```bash
   # Generate new program keypair
   solana-keygen new -o target/deploy/new-program-keypair.json
   # Update Anchor.toml and lib.rs with new ID
   anchor build
   anchor deploy
   ```

3. **Close existing program** (if you're the authority):
   ```bash
   solana program close <PROGRAM_ID>
   ```

---

## Mobile Development Issues

### Issue: React Native build fails

**Symptoms**: Build errors when running `npx react-native run-android` or `run-ios`.

**Solutions**:

1. **Clear caches**:
   ```bash
   cd android && ./gradlew clean && cd ..
   rm -rf node_modules
   npm install
   ```

2. **iOS**: Install pods
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Check Node version**: Use Node 18 LTS or later
   ```bash
   node --version
   nvm use 18  # If using nvm
   ```

4. **Verify environment setup**:
   ```bash
   npx react-native doctor
   ```

### Issue: Wallet adapter not connecting

**Symptoms**: Mobile wallet adapter fails to connect or authorize.

**Solutions**:

1. **Check wallet app is installed** on device

2. **Verify deep linking configuration** in AndroidManifest.xml or Info.plist

3. **Test on physical device**: Emulators may have limitations

4. **Check network configuration**: Ensure app connects to correct cluster

5. **Review logs**:
   ```bash
   # Android
   adb logcat | grep -i solana
   
   # iOS
   xcrun simctl spawn booted log stream --predicate 'processImagePath contains "YourApp"'
   ```

### Issue: Expo build fails

**Symptoms**: `expo build` or `eas build` fails with dependency errors.

**Solutions**:

1. **Update Expo SDK**:
   ```bash
   expo upgrade
   ```

2. **Clear Expo cache**:
   ```bash
   expo start -c
   ```

3. **Check compatibility**: Ensure all packages support current Expo SDK version

4. **Use EAS Build** instead of classic builds:
   ```bash
   npm install -g eas-cli
   eas build --platform android
   ```

---

## Hardware and IoT Issues

### Issue: Raspberry Pi cannot connect to Solana

**Symptoms**: Connection timeouts or network errors on Raspberry Pi.

**Solutions**:

1. **Check internet connection**:
   ```bash
   ping google.com
   ```

2. **Install required dependencies**:
   ```bash
   sudo apt-get update
   sudo apt-get install -y build-essential pkg-config libssl-dev
   ```

3. **Use lightweight RPC client**: Consider using lighter alternatives to full web3.js

4. **Increase timeout values** in code:
   ```typescript
   const connection = new Connection(url, {
     commitment: 'confirmed',
     confirmTransactionInitialTimeout: 120000
   });
   ```

### Issue: GPIO pins not responding

**Symptoms**: LED or sensor controls don't work on Raspberry Pi.

**Solutions**:

1. **Check wiring**: Verify connections match wiring diagram

2. **Enable GPIO permissions**:
   ```bash
   sudo usermod -a -G gpio $USER
   sudo chmod g+rw /dev/gpiomem
   ```

3. **Install GPIO library**:
   ```bash
   npm install onoff
   # or
   pip install RPi.GPIO
   ```

4. **Test GPIO directly**:
   ```bash
   # Install gpio utility
   sudo apt-get install -y wiringpi
   
   # Test pin
   gpio -g mode 17 out
   gpio -g write 17 1
   ```

5. **Check pin numbering**: Ensure using correct numbering scheme (BCM vs BOARD)

### Issue: LoRaWAN module not detected

**Symptoms**: LoRa module not found or communication fails.

**Solutions**:

1. **Check SPI is enabled**:
   ```bash
   sudo raspi-config
   # Navigate to Interface Options > SPI > Enable
   ```

2. **Verify wiring**: Check power, ground, and SPI connections

3. **Test SPI communication**:
   ```bash
   ls /dev/spi*
   ```

4. **Install LoRa library**:
   ```bash
   pip install pyLoRa
   ```

5. **Check module power requirements**: Ensure adequate power supply (3.3V or 5V as required)

---

## General Environment Issues

### Issue: WSL2 (Windows) performance issues

**Symptoms**: Slow builds or file operations on Windows with WSL2.

**Solutions**:

1. **Store files in WSL filesystem**: Don't work from `/mnt/c/`
   ```bash
   cd ~
   mkdir projects
   cd projects
   ```

2. **Increase WSL2 memory** (create/edit `%USERPROFILE%\.wslconfig`):
   ```ini
   [wsl2]
   memory=8GB
   processors=4
   ```

3. **Restart WSL2**:
   ```powershell
   wsl --shutdown
   ```

### Issue: Node.js version conflicts

**Symptoms**: "unsupported engine" or module compatibility errors.

**Solutions**:

1. **Use Node Version Manager (nvm)**:
   ```bash
   # Install nvm
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   
   # Install Node 18 LTS
   nvm install 18
   nvm use 18
   ```

2. **Check required version** in package.json:
   ```json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

3. **Clear npm cache**:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

### Issue: TypeScript compilation errors

**Symptoms**: Type errors or "cannot find module" errors.

**Solutions**:

1. **Install type definitions**:
   ```bash
   npm install --save-dev @types/node @types/bn.js
   ```

2. **Update tsconfig.json**:
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "commonjs",
       "esModuleInterop": true,
       "skipLibCheck": true
     }
   }
   ```

3. **Rebuild TypeScript**:
   ```bash
   npx tsc --build --clean
   npx tsc
   ```

### Issue: Git clone fails for source repositories

**Symptoms**: "fatal: unable to access" or authentication errors.

**Solutions**:

1. **Use HTTPS instead of SSH**:
   ```bash
   git clone https://github.com/user/repo.git
   ```

2. **Configure Git credentials**:
   ```bash
   git config --global credential.helper store
   ```

3. **Check network/firewall**: Ensure Git ports (443, 22) are not blocked

4. **Use shallow clone** for large repositories:
   ```bash
   git clone --depth 1 https://github.com/user/repo.git
   ```

---

## Getting Additional Help

If your issue isn't covered here:

1. **Check official documentation**:
   - Solana Docs: https://docs.solana.com
   - Anchor Docs: https://www.anchor-lang.com
   - Solana Cookbook: https://solanacookbook.com

2. **Search existing issues**:
   - Solana GitHub: https://github.com/solana-labs/solana/issues
   - Anchor GitHub: https://github.com/coral-xyz/anchor/issues

3. **Ask the community**:
   - Solana Stack Exchange: https://solana.stackexchange.com
   - Solana Discord: https://discord.gg/solana
   - Anchor Discord: https://discord.gg/anchor

4. **Enable verbose logging**:
   ```bash
   export RUST_LOG=debug
   export RUST_BACKTRACE=1
   ```

5. **Collect diagnostic information**:
   ```bash
   solana --version
   rustc --version
   anchor --version
   node --version
   npm --version
   ```

---

**Note**: This troubleshooting guide is continuously updated. If you encounter an issue not listed here, please consider contributing the solution to help other developers.

**Source**: Compiled from common issues reported in Solana, Anchor, and related project issue trackers and community forums.
