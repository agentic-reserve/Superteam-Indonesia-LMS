# TypeScript and Node.js Setup Guide

This guide covers the installation and configuration of Node.js, TypeScript, and Solana client libraries for building frontend applications, scripts, and tests for Solana programs.

## Prerequisites

- Solana CLI installed and configured (see [Solana CLI Setup](solana-cli.md))
- Basic JavaScript/TypeScript knowledge

## Version Requirements

- **Node.js**: v18.0.0 or later (v20.x or v22.x recommended)
- **npm**: 9.0.0 or later (comes with Node.js)
- **TypeScript**: 5.0.0 or later
- **@solana/web3.js**: 1.95.0 or later
- **@coral-xyz/anchor**: 0.30.0 or later (for Anchor projects)

## Part 1: Node.js Installation

### Using Node Version Manager (NVM) - Recommended

NVM allows you to install and manage multiple Node.js versions on your system.

#### Install NVM

**Linux and macOS (including WSL):**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
```

After installation, restart your terminal or run:

```bash
source ~/.bashrc  # For Bash
source ~/.zshrc   # For Zsh
```

#### Verify NVM Installation

```bash
command -v nvm
```

Expected output:
```
nvm
```

#### Install Node.js with NVM

Install the latest LTS version:

```bash
nvm install node
```

Or install a specific version:

```bash
nvm install 20
nvm use 20
```

#### Verify Node.js Installation

```bash
node --version
```

Expected output:
```
v20.x.x (or later)
```

Check npm version:

```bash
npm --version
```

Expected output:
```
10.x.x (or later)
```

### Alternative: Direct Installation

**macOS:**
```bash
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows:**
Download the installer from https://nodejs.org and follow the installation wizard.

## Part 2: Package Manager Setup

### npm (Default)

npm comes bundled with Node.js and requires no additional setup.

Verify npm is working:

```bash
npm --version
```

### Yarn (Optional but Recommended for Anchor Projects)

Yarn is an alternative package manager that's commonly used in Anchor projects.

#### Install Yarn

```bash
npm install --global yarn
```

#### Verify Yarn Installation

```bash
yarn --version
```

Expected output:
```
1.22.x
```

### pnpm (Optional Alternative)

pnpm is a fast, disk space efficient package manager.

#### Install pnpm

```bash
npm install -g pnpm
```

#### Verify pnpm Installation

```bash
pnpm --version
```

## Part 3: TypeScript Setup

### Install TypeScript Globally

```bash
npm install -g typescript
```

### Verify TypeScript Installation

```bash
tsc --version
```

Expected output:
```
Version 5.x.x
```

### Project-Level TypeScript Setup

For most projects, install TypeScript as a dev dependency:

```bash
npm install --save-dev typescript @types/node
```

Create a `tsconfig.json` file:

```bash
npx tsc --init
```

### Recommended tsconfig.json for Solana Projects

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Part 4: Solana Web3.js Library

### Install @solana/web3.js

The Solana Web3.js library provides JavaScript/TypeScript bindings for interacting with Solana.

```bash
npm install @solana/web3.js
```

Or with yarn:

```bash
yarn add @solana/web3.js
```

### Basic Usage Example

Create a file `src/example.ts`:

```typescript
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

async function main() {
  // Connect to devnet
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  
  // Get cluster version
  const version = await connection.getVersion();
  console.log('Cluster version:', version);
  
  // Check balance of an account
  const publicKey = new PublicKey('YOUR_WALLET_ADDRESS');
  const balance = await connection.getBalance(publicKey);
  console.log('Balance:', balance / 1e9, 'SOL');
}

main().catch(console.error);
```

Run the example:

```bash
npx ts-node src/example.ts
```

## Part 5: Anchor Client Setup

For projects using the Anchor framework, install the Anchor TypeScript client.

### Install Anchor Dependencies

```bash
npm install @coral-xyz/anchor
```

Or with yarn:

```bash
yarn add @coral-xyz/anchor
```

### Additional Anchor Dependencies

For testing and development:

```bash
npm install --save-dev @types/mocha @types/chai mocha chai ts-mocha
```

### Anchor Project Structure

When you create an Anchor project with `anchor init`, it includes a `package.json`:

```json
{
  "name": "my-anchor-project",
  "version": "0.1.0",
  "scripts": {
    "test": "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
  },
  "dependencies": {
    "@coral-xyz/anchor": "^0.30.0",
    "@solana/web3.js": "^1.95.0"
  },
  "devDependencies": {
    "@types/chai": "^4.3.0",
    "@types/mocha": "^10.0.0",
    "chai": "^4.3.0",
    "mocha": "^10.0.0",
    "ts-mocha": "^10.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Anchor Client Example

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MyProgram } from "../target/types/my_program";

describe("my-program", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MyProgram as Program<MyProgram>;

  it("Initializes the program", async () => {
    const tx = await program.methods.initialize().rpc();
    console.log("Transaction signature:", tx);
  });
});
```

## Part 6: Additional Useful Libraries

### SPL Token Library

For working with SPL tokens:

```bash
npm install @solana/spl-token
```

Example usage:

```typescript
import { getOrCreateAssociatedTokenAccount, transfer } from '@solana/spl-token';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';

// Create token account and transfer tokens
// (See SPL Token documentation for complete examples)
```

### Metaplex SDK

For working with NFTs:

```bash
npm install @metaplex-foundation/js
```

### Solana Wallet Adapter

For frontend wallet integration:

```bash
npm install @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets
```

## Part 7: Development Tools

### ts-node

Run TypeScript files directly without compilation:

```bash
npm install -g ts-node
```

Usage:

```bash
ts-node src/script.ts
```

### nodemon

Auto-restart your application on file changes:

```bash
npm install --save-dev nodemon
```

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts"
  }
}
```

### ESLint and Prettier

Code quality and formatting tools:

```bash
npm install --save-dev eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

Create `.eslintrc.json`:

```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

## Example Project Setup

### Create a New Solana TypeScript Project

```bash
# Create project directory
mkdir my-solana-app
cd my-solana-app

# Initialize npm project
npm init -y

# Install dependencies
npm install @solana/web3.js
npm install --save-dev typescript @types/node ts-node

# Initialize TypeScript
npx tsc --init

# Create source directory
mkdir src
```

### Sample package.json

```json
{
  "name": "my-solana-app",
  "version": "1.0.0",
  "description": "Solana TypeScript application",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "test": "mocha -r ts-node/register tests/**/*.test.ts"
  },
  "dependencies": {
    "@solana/web3.js": "^1.95.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.9.0"
  }
}
```

## Common Commands

```bash
# Install dependencies
npm install

# Run TypeScript file
npx ts-node src/script.ts

# Build TypeScript to JavaScript
npm run build

# Run compiled JavaScript
npm start

# Run tests
npm test

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

## Troubleshooting

### Module Not Found Errors

**Error**: "Cannot find module '@solana/web3.js'"
- **Solution**: Run `npm install @solana/web3.js`

**Error**: "Cannot find module 'typescript'"
- **Solution**: Install TypeScript: `npm install --save-dev typescript`

### TypeScript Compilation Errors

**Error**: "Cannot find name 'Buffer'"
- **Solution**: Add `"lib": ["ES2020"]` to tsconfig.json and install `@types/node`

### Version Conflicts

If you encounter version conflicts between packages:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

### Permission Errors (Linux/macOS)

If you get permission errors when installing global packages:

```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

## Best Practices

1. **Use package-lock.json**: Commit this file to ensure consistent dependencies across environments
2. **Specify exact versions**: Use exact versions in package.json for production applications
3. **Use environment variables**: Store sensitive data (private keys, RPC URLs) in `.env` files
4. **Type safety**: Enable strict mode in TypeScript for better type checking
5. **Error handling**: Always wrap async calls in try-catch blocks
6. **Connection management**: Reuse Connection objects instead of creating new ones for each request

## Environment Variables

Create a `.env` file for configuration:

```bash
SOLANA_RPC_URL=https://api.devnet.solana.com
WALLET_PRIVATE_KEY=your_private_key_here
```

Install dotenv:

```bash
npm install dotenv
```

Load in your code:

```typescript
import dotenv from 'dotenv';
dotenv.config();

const rpcUrl = process.env.SOLANA_RPC_URL;
```

**Important**: Add `.env` to your `.gitignore` file!

## Verification Checklist

After completing this setup:

- [ ] `node --version` shows v18.0.0 or later
- [ ] `npm --version` works correctly
- [ ] `tsc --version` shows TypeScript 5.x or later
- [ ] `npm install @solana/web3.js` completes successfully
- [ ] Can run TypeScript files with `ts-node`
- [ ] Can import and use `@solana/web3.js` in TypeScript files

## Next Steps

With Node.js and TypeScript configured:

1. **Build client applications**: Create scripts to interact with Solana programs
2. **Write tests**: Use TypeScript to test your Anchor programs
3. **Explore examples**: Check out the [Basics](../basics/README.md) section for tutorials
4. **Frontend development**: Set up React or Next.js for building dApp UIs

## Additional Resources

- Node.js Documentation: https://nodejs.org/docs - Official Node.js API reference and guides for JavaScript runtime
- TypeScript Documentation: https://www.typescriptlang.org/docs - Complete TypeScript language reference and handbook
- Solana Web3.js Documentation: https://solana-labs.github.io/solana-web3.js - JavaScript library for interacting with Solana blockchain
- Anchor TypeScript Client: https://www.anchor-lang.com/docs/typescript - Guide for using Anchor programs from TypeScript clients
- Solana Cookbook: https://solanacookbook.com - Practical code examples for Solana development in TypeScript and Rust

---

**Source**: Adapted from official Solana documentation at https://solana.com/docs/intro/installation and Node.js documentation at https://nodejs.org
