# Solana CLI Setup Guide

The Solana Command Line Interface (CLI) is the primary tool for interacting with Solana networks. This guide covers installation, configuration, and basic usage.

## Version Requirements

- **Solana CLI**: v1.18.0 or later (v1.18.x recommended for stability)
- **Operating System**: Linux, macOS, or Windows with WSL2

## Installation

### Linux and macOS

Install the Solana CLI using the official installer:

```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

The installer will download and install the latest stable version to `~/.local/share/solana/install/active_release/bin`.

Add Solana to your PATH by adding this line to your shell configuration file (`~/.bashrc`, `~/.zshrc`, etc.):

```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

Reload your shell configuration:

```bash
source ~/.bashrc  # or ~/.zshrc
```

### Windows

For Windows users, we recommend using WSL2 (Windows Subsystem for Linux):

1. Install WSL2 following Microsoft's official guide
2. Open your WSL2 terminal
3. Follow the Linux installation instructions above

Alternatively, download Windows binaries from the official Solana releases page, though WSL2 is recommended for better compatibility.

## Verify Installation

Check that Solana CLI is installed correctly:

```bash
solana --version
```

Expected output:
```
solana-cli 1.18.x (src:xxxxxxxx; feat:xxxxxxxxx)
```

## Configuration

### Set Network Cluster

Configure the CLI to connect to devnet (development network):

```bash
solana config set --url https://api.devnet.solana.com
```

Verify your configuration:

```bash
solana config get
```

Expected output:
```
Config File: /home/username/.config/solana/cli/config.yml
RPC URL: https://api.devnet.solana.com
WebSocket URL: wss://api.devnet.solana.com/ (computed)
Keypair Path: /home/username/.config/solana/id.json
Commitment: confirmed
```

### Network Options

You can switch between different networks:

```bash
# Devnet (for development and testing)
solana config set --url https://api.devnet.solana.com

# Testnet (for pre-production testing)
solana config set --url https://api.testnet.solana.com

# Mainnet-beta (production network - use with caution)
solana config set --url https://api.mainnet-beta.solana.com

# Local validator (for local development)
solana config set --url http://localhost:8899
```

## Wallet Setup

### Create a New Wallet

Generate a new keypair (wallet):

```bash
solana-keygen new
```

You'll be prompted to enter a passphrase (optional but recommended for security). The CLI will display your public key and save your keypair to the default location.

Example output:
```
Generating a new keypair

For added security, enter a BIP39 passphrase

NOTE! This passphrase improves security of the recovery seed phrase NOT the
keypair file itself, which is stored as insecure plain text

BIP39 Passphrase (empty for none):

Wrote new keypair to /home/username/.config/solana/id.json
================================================================================
pubkey: 7xX8yT9...
================================================================================
Save this seed phrase and your BIP39 passphrase to recover your new keypair:
[12 or 24 word seed phrase]
================================================================================
```

**IMPORTANT**: Save your seed phrase securely. This is the only way to recover your wallet if you lose access to the keypair file.

### Check Your Wallet Address

Display your public key (wallet address):

```bash
solana address
```

### Check Wallet Balance

View your wallet balance:

```bash
solana balance
```

On a fresh wallet, this will show `0 SOL`.

## Getting Test SOL (Devnet Airdrop)

For development on devnet, you can request free test SOL:

```bash
solana airdrop 2
```

This requests 2 SOL from the devnet faucet. You can request up to 5 SOL per airdrop, with rate limits applied.

Verify your balance:

```bash
solana balance
```

Expected output:
```
2 SOL
```

### Airdrop Troubleshooting

If airdrops fail:

1. **Rate limiting**: Wait a few minutes and try again
2. **Network congestion**: Try requesting smaller amounts (1 SOL instead of 2)
3. **Alternative faucets**: Use web-based faucets like https://faucet.solana.com

## Common CLI Commands

### Account Information

```bash
# View account details
solana account <ADDRESS>

# View your own account
solana account $(solana address)
```

### Transaction History

```bash
# View recent transactions
solana transaction-history <ADDRESS>

# View specific transaction
solana confirm <SIGNATURE>
```

### Transfer SOL

```bash
# Transfer SOL to another address
solana transfer <RECIPIENT_ADDRESS> <AMOUNT>

# Example
solana transfer 7xX8yT9... 0.5
```

### Validator Information

```bash
# List validators
solana validators

# View cluster information
solana cluster-version

# View current epoch info
solana epoch-info
```

## Managing Multiple Wallets

### Create Additional Keypairs

```bash
# Create a keypair with a specific name
solana-keygen new --outfile ~/my-wallet.json
```

### Switch Between Keypairs

```bash
# Set a different keypair as default
solana config set --keypair ~/my-wallet.json

# Verify the change
solana config get
```

### Use Keypair for Single Command

```bash
# Use specific keypair without changing default
solana balance --keypair ~/my-wallet.json
```

## Security Best Practices

1. **Never share your private key or seed phrase**: Anyone with access can control your funds
2. **Use different wallets for different purposes**: Separate development, testing, and production wallets
3. **Backup your keypairs**: Store backups securely offline
4. **Use hardware wallets for mainnet**: For production applications with real funds
5. **Test on devnet first**: Always test transactions on devnet before using testnet or mainnet

## Updating Solana CLI

Keep your CLI updated to access the latest features and security patches:

```bash
solana-install update
```

Check for available updates:

```bash
solana-install info
```

Install a specific version:

```bash
solana-install init 1.18.0
```

## Verification Checklist

After completing this setup, verify everything works:

- [ ] `solana --version` shows version 1.18.x or later
- [ ] `solana config get` shows devnet URL
- [ ] `solana address` displays your public key
- [ ] `solana airdrop 1` successfully adds SOL to your wallet
- [ ] `solana balance` shows your test SOL balance

## Next Steps

With Solana CLI configured, you can:

1. **Learn Solana basics**: Proceed to [Basics](../basics/README.md) to understand accounts, programs, and transactions
2. **Set up development tools**: Install [Rust and Anchor](rust-anchor.md) for program development
3. **Build client applications**: Set up [TypeScript and Node.js](typescript-node.md) for frontend development

## Additional Resources

- Official Solana CLI Documentation: https://docs.solana.com/cli
- Solana Cookbook: https://solanacookbook.com
- Solana Stack Exchange: https://solana.stackexchange.com

---

**Source**: Adapted from official Solana documentation at https://docs.solana.com/cli/install-solana-cli-tools
