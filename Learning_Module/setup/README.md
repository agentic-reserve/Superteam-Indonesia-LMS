# Setup and Environment Configuration

Welcome to the Solana development environment setup guide. This section provides comprehensive instructions for configuring your development environment for Solana blockchain development across different platforms and use cases.

## Overview

Setting up a Solana development environment requires installing and configuring various tools depending on your development focus. This guide covers everything from basic CLI tools to specialized environments for mobile, IoT, and advanced development.

## Setup Guides

### Core Development Tools

- **[Solana CLI Setup](solana-cli.md)** - Install and configure the Solana command-line interface, create wallets, and connect to different networks (devnet, testnet, mainnet)

- **[Rust and Anchor Framework](rust-anchor.md)** - Set up Rust programming language and the Anchor framework for building Solana programs with modern development patterns

- **[TypeScript and Node.js](typescript-node.md)** - Configure Node.js, TypeScript, and client libraries (web3.js, Anchor client) for building frontend applications and scripts

### Specialized Environments

- **[Mobile Development Environment](mobile-environment.md)** - Set up Android Studio, Xcode, React Native, and Expo for building mobile dApps with Solana wallet integration

- **[Hardware and IoT Setup](hardware-iot.md)** - Configure Raspberry Pi, LoRaWAN modules, and sensors for DePIN (Decentralized Physical Infrastructure Networks) applications

### Troubleshooting

- **[Troubleshooting Guide](troubleshooting.md)** - Common setup issues and their solutions across all platforms

## Quick Start Recommendations

### For Complete Beginners
Start with these guides in order:
1. Solana CLI Setup
2. TypeScript and Node.js
3. Troubleshooting Guide (keep handy)

### For Program Developers
1. Solana CLI Setup
2. Rust and Anchor Framework
3. TypeScript and Node.js (for testing)

### For Mobile Developers
1. Solana CLI Setup
2. TypeScript and Node.js
3. Mobile Development Environment

### For DePIN/IoT Developers
1. Solana CLI Setup
2. TypeScript and Node.js
3. Hardware and IoT Setup

## System Requirements

### Minimum Requirements
- **Operating System**: Linux, macOS, or Windows (with WSL2 recommended)
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 20GB free space
- **Internet**: Stable broadband connection

### Recommended Requirements
- **Operating System**: Linux (Ubuntu 20.04+) or macOS (12.0+)
- **RAM**: 16GB or more
- **Storage**: 50GB+ SSD
- **Processor**: Multi-core CPU (4+ cores recommended)

## Development Network Options

Solana provides multiple networks for different stages of development:

- **Devnet**: Development network with free test SOL via airdrops - ideal for learning and testing
- **Testnet**: More stable test network that mirrors mainnet behavior - for pre-production testing
- **Mainnet-beta**: Production network with real SOL - for deployed applications

Most guides in this section focus on devnet for learning purposes.

## Getting Help

If you encounter issues during setup:

1. Check the [Troubleshooting Guide](troubleshooting.md) for common problems
2. Review the specific setup guide for your tool
3. Consult the official Solana documentation at https://docs.solana.com
4. Join the Solana Discord community for support

## Next Steps

After completing your environment setup:

1. Verify your installation by running the test commands provided in each guide
2. Proceed to the [Basics](../basics/README.md) section to start learning Solana fundamentals
3. Explore [Learning Paths](../curriculum/learning-paths/) tailored to your development goals

---

**Note**: Keep your development tools updated regularly. Solana and its ecosystem tools receive frequent updates with new features and security improvements.

## Cross-References and Related Topics

### Next Steps After Setup
- **Basics**: Start learning with [Solana Basics](../basics/README.md)
- **Curriculum**: Choose a [Learning Path](../curriculum/learning-paths/) based on your goals
- **Exercises**: Test your setup with [Basics Exercises](../basics/exercises/README.md)

### Topic-Specific Setup
- **Mobile Development**: See [Mobile Environment Setup](mobile-environment.md) for React Native and Expo
- **DePIN/IoT**: See [Hardware and IoT Setup](hardware-iot.md) for Raspberry Pi and sensors
- **Security**: Ensure [Rust and Anchor](rust-anchor.md) for security testing with Trident
- **DeFi**: Configure [Rust and Anchor](rust-anchor.md) for program development

### Related Resources
- **Troubleshooting**: Refer to [Troubleshooting Guide](troubleshooting.md) for common issues
- **Glossary**: Check [Glossary](../GLOSSARY.md) for terminology
- **Sources**: Explore [Source Repositories](../SOURCES.md) for deeper dives
