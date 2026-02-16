# Solana Learning Module - Master Content Index

This comprehensive index provides an overview of all learning content in the Solana Learning Module. Use this index to discover topics, estimate time commitments, and find content by difficulty level or tags.

## Quick Navigation

- [By Topic Area](#by-topic-area)
- [By Difficulty Level](#by-difficulty-level)
- [By Estimated Time](#by-estimated-time)
- [By Tags](#by-tags)
- [Setup Guides](#setup-guides)
- [Learning Paths](#learning-paths)
- [Integration Projects](#integration-projects)

---

## By Topic Area

### Basics
**Path**: `basics/`  
**Description**: Fundamental Solana concepts including accounts, programs, transactions, tokens, PDAs, and Anchor framework  
**Difficulty**: Beginner  
**Total Time**: 14-21 hours  
**Tags**: `fundamentals`, `accounts`, `transactions`, `tokens`, `pdas`, `anchor`, `beginner`

#### Sections
1. **Accounts and Programs** (`01-accounts-and-programs/`)
   - Time: 2-3 hours | Difficulty: Beginner
   - Topics: Account model, program structure, rent, ownership
   - Tags: `accounts`, `programs`, `architecture`

2. **Transactions** (`02-transactions/`)
   - Time: 1-2 hours | Difficulty: Beginner
   - Topics: Transaction anatomy, signing, fees, compute units
   - Tags: `transactions`, `signing`, `fees`

3. **Tokens** (`03-tokens/`)
   - Time: 2-3 hours | Difficulty: Beginner
   - Topics: SPL tokens, minting, transfers, metadata
   - Tags: `tokens`, `spl`, `minting`

4. **Program Derived Addresses** (`04-pdas/`)
   - Time: 2-3 hours | Difficulty: Beginner
   - Topics: PDA derivation, CPI, signing authority
   - Tags: `pdas`, `cpi`, `seeds`

5. **Anchor Framework** (`05-anchor-framework/`)
   - Time: 3-4 hours | Difficulty: Beginner to Intermediate
   - Topics: Anchor architecture, constraints, testing, IDL, deployment
   - Tags: `anchor`, `framework`, `testing`, `idl`, `deployment`

6. **RPC API Reference** (`06-rpc-api-reference/`)
   - Time: 1-2 hours | Difficulty: Beginner (reference material)
   - Topics: RPC methods, commitment levels, error handling, WebSocket subscriptions
   - Tags: `rpc`, `api`, `reference`, `websocket`, `queries`

7. **Exercises** (`exercises/`)
   - Time: 4-6 hours | Difficulty: Beginner
   - Topics: Hands-on practice with basic concepts
   - Tags: `exercises`, `practice`, `beginner`

---

### Security
**Path**: `security/`  
**Description**: Security best practices, vulnerabilities, auditing tools, and post-quantum cryptography  
**Difficulty**: Beginner to Advanced  
**Total Time**: 17-22 hours  
**Tags**: `security`, `auditing`, `vulnerabilities`, `fuzzing`, `post-quantum`

#### Sections
1. **Common Vulnerabilities** (`01-common-vulnerabilities/`)
   - Time: 3-4 hours | Difficulty: Beginner
   - Topics: Account validation, signer checks, overflow, reentrancy
   - Tags: `vulnerabilities`, `exploits`, `security-patterns`

2. **Safe Math** (`02-safe-math/`)
   - Time: 2-3 hours | Difficulty: Beginner
   - Topics: Checked arithmetic, overflow protection, safe casting
   - Tags: `safe-math`, `overflow`, `arithmetic`

3. **Fuzzing with Trident** (`03-fuzzing-with-trident/`)
   - Time: 4-5 hours | Difficulty: Intermediate
   - Topics: Property-based testing, fuzz harnesses, invariants
   - Tags: `fuzzing`, `testing`, `trident`, `property-based`

4. **POC Frameworks** (`04-poc-frameworks/`)
   - Time: 3-4 hours | Difficulty: Intermediate
   - Topics: Exploit development, CTF challenges, security research
   - Tags: `poc`, `exploits`, `ctf`, `research`

5. **Post-Quantum Cryptography** (`05-post-quantum-crypto/`)
   - Time: 5-6 hours | Difficulty: Advanced
   - Topics: Hash-based signatures, WOTS+, liboqs, quantum threats
   - Tags: `post-quantum`, `cryptography`, `quantum-resistant`, `wots`

6. **Exercises** (`exercises/`)
   - Time: Variable | Difficulty: Beginner to Advanced
   - Topics: Vulnerability detection, safe math, fuzzing practice
   - Tags: `exercises`, `security`, `practice`

---

### Mobile
**Path**: `mobile/`  
**Description**: Building mobile dApps with wallet integration, React Native, and Solana Pay  
**Difficulty**: Intermediate  
**Total Time**: 9-13 hours  
**Tags**: `mobile`, `react-native`, `wallet-adapter`, `solana-pay`, `ios`, `android`

#### Sections
1. **Mobile Wallet Adapter** (`01-wallet-adapter/`)
   - Time: 2-3 hours | Difficulty: Intermediate
   - Topics: Wallet connection, authorization, transaction signing
   - Tags: `wallet-adapter`, `mobile-wallet`, `signing`

2. **React Native Integration** (`02-react-native/`)
   - Time: 3-4 hours | Difficulty: Intermediate
   - Topics: React Native setup, web3.js integration, polyfills
   - Tags: `react-native`, `web3js`, `mobile-development`

3. **Expo Template** (`03-expo-template/`)
   - Time: 2-3 hours | Difficulty: Intermediate
   - Topics: Expo CLI, managed workflow, EAS Build
   - Tags: `expo`, `mobile`, `templates`

4. **Solana Pay** (`04-solana-pay/`)
   - Time: 2-3 hours | Difficulty: Intermediate
   - Topics: Payment requests, QR codes, deep linking
   - Tags: `solana-pay`, `payments`, `qr-codes`

5. **Exercises** (`exercises/`)
   - Time: Variable | Difficulty: Intermediate
   - Topics: Wallet integration, token transfers, payment flows
   - Tags: `exercises`, `mobile`, `practice`

---

### DeFi
**Path**: `defi/`  
**Description**: Decentralized finance protocols, AMMs, perpetual futures, and risk engines  
**Difficulty**: Beginner to Advanced  
**Total Time**: 13-19 hours  
**Tags**: `defi`, `amm`, `perpetuals`, `risk-management`, `token-economics`

#### Sections
1. **Token Economics** (`01-token-economics/`)
   - Time: 2-3 hours | Difficulty: Beginner
   - Topics: Token supply models, distribution, vesting
   - Tags: `tokenomics`, `supply`, `distribution`

2. **AMM Basics** (`02-amm-basics/`)
   - Time: 3-4 hours | Difficulty: Intermediate
   - Topics: Constant product formula, liquidity pools, slippage
   - Tags: `amm`, `liquidity`, `swaps`, `dex`

3. **Perpetual Futures** (`03-perpetual-futures/`)
   - Time: 4-6 hours | Difficulty: Advanced
   - Topics: Perpetual contracts, funding rates, leverage, oracles
   - Tags: `perpetuals`, `futures`, `leverage`, `derivatives`

4. **Risk Engines** (`04-risk-engines/`)
   - Time: 4-6 hours | Difficulty: Advanced
   - Topics: Principal protection, liquidations, insurance funds
   - Tags: `risk-management`, `liquidations`, `solvency`

5. **Exercises** (`exercises/`)
   - Time: Variable | Difficulty: Beginner to Advanced
   - Topics: Token swaps, AMM implementation, margin trading
   - Tags: `exercises`, `defi`, `practice`

---

### AI Agents
**Path**: `ai-agents/`  
**Description**: Building autonomous AI agents that interact with Solana blockchain  
**Difficulty**: Intermediate to Advanced  
**Total Time**: 11-15 hours  
**Tags**: `ai`, `agents`, `llm`, `automation`, `langchain`, `mcp`

#### Sections
1. **Agent Basics** (`01-agent-basics/`)
   - Time: 2-3 hours | Difficulty: Intermediate
   - Topics: Agent architecture, prompt engineering, state management
   - Tags: `agents`, `architecture`, `design-patterns`

2. **Solana Agent Kit** (`02-solana-agent-kit/`)
   - Time: 4-5 hours | Difficulty: Intermediate
   - Topics: Agent Kit operations, token trading, NFT minting, DeFi
   - Tags: `agent-kit`, `toolkit`, `automation`

3. **MCP Integration** (`03-mcp-integration/`)
   - Time: 2-3 hours | Difficulty: Intermediate
   - Topics: Model Context Protocol, server architecture, tool definitions
   - Tags: `mcp`, `protocol`, `integration`

4. **LangGraph Multi-Agent Systems** (`04-langgraph/`)
   - Time: 3-4 hours | Difficulty: Advanced
   - Topics: StateGraph, agent coordination, multi-agent workflows
   - Tags: `langgraph`, `multi-agent`, `orchestration`

5. **Exercises** (`exercises/`)
   - Time: Variable | Difficulty: Intermediate to Advanced
   - Topics: Trading agents, NFT minting, portfolio management
   - Tags: `exercises`, `ai-agents`, `practice`

---

### DePIN
**Path**: `depin/`  
**Description**: Decentralized Physical Infrastructure Networks with IoT and hardware integration  
**Difficulty**: Intermediate  
**Total Time**: 12-18 hours  
**Tags**: `depin`, `iot`, `hardware`, `raspberry-pi`, `lorawan`, `sensors`

#### Sections
1. **IoT Basics** (`01-iot-basics/`)
   - Time: 2 hours | Difficulty: Beginner
   - Topics: IoT architecture, blockchain integration, device identity
   - Tags: `iot`, `fundamentals`, `architecture`

2. **Raspberry Pi Integration** (`02-raspberry-pi-integration/`)
   - Time: 4 hours | Difficulty: Intermediate
   - Topics: GPIO control, LED control, sensor reading, wiring
   - Tags: `raspberry-pi`, `gpio`, `hardware`, `sensors`

3. **LoRaWAN Networks** (`03-lorawan-networks/`)
   - Time: 3 hours | Difficulty: Intermediate
   - Topics: LoRaWAN protocol, Helium network, long-range communication
   - Tags: `lorawan`, `helium`, `wireless`, `long-range`

4. **Data Anchoring** (`04-data-anchoring/`)
   - Time: 3 hours | Difficulty: Intermediate
   - Topics: Data anchoring patterns, batch uploads, Merkle roots
   - Tags: `data-anchoring`, `merkle-trees`, `verification`

5. **Exercises** (`exercises/`)
   - Time: 4-6 hours | Difficulty: Intermediate
   - Topics: Hardware integration, data anchoring, IoT networks
   - Tags: `exercises`, `depin`, `hardware`, `practice`

---

### Privacy
**Path**: `privacy/`  
**Description**: Privacy-preserving technologies including ZK compression and zero-knowledge proofs  
**Difficulty**: Intermediate to Advanced  
**Total Time**: 13-17 hours  
**Tags**: `privacy`, `zero-knowledge`, `zk-compression`, `light-protocol`, `confidential`

#### Sections
1. **Compression Basics** (`01-compression-basics/`)
   - Time: 2-3 hours | Difficulty: Intermediate
   - Topics: ZK compression, rent-free accounts, compressed tokens
   - Tags: `compression`, `rent-free`, `state-compression`

2. **ZK Proofs** (`02-zk-proofs/`)
   - Time: 3-4 hours | Difficulty: Advanced
   - Topics: Groth16 proofs, Merkle trees, proof verification
   - Tags: `zero-knowledge`, `proofs`, `groth16`, `cryptography`

3. **Light Protocol** (`03-light-protocol/`)
   - Time: 4-5 hours | Difficulty: Advanced
   - Topics: Light Protocol architecture, nullifiers, compressed PDAs
   - Tags: `light-protocol`, `nullifiers`, `privacy-preserving`

4. **Confidential Transfers** (`04-confidential-transfers/`)
   - Time: 4-5 hours | Difficulty: Advanced
   - Topics: Confidential swaps, private airdrops, privacy trade-offs
   - Tags: `confidential`, `private-transfers`, `airdrops`

5. **Exercises** (`exercises/`)
   - Time: Variable | Difficulty: Intermediate to Advanced
   - Topics: Compressed tokens, nullifier programs, confidential payments
   - Tags: `exercises`, `privacy`, `practice`

---

## Setup Guides
**Path**: `setup/`  
**Total Time**: 4-8 hours  
**Tags**: `setup`, `installation`, `configuration`, `environment`

1. **Solana CLI** (`solana-cli.md`)
   - Time: 1 hour | Topics: CLI installation, wallet setup, devnet
   - Tags: `cli`, `wallet`, `devnet`

2. **Rust and Anchor** (`rust-anchor.md`)
   - Time: 1-2 hours | Topics: Rust installation, Anchor framework
   - Tags: `rust`, `anchor`, `framework`

3. **TypeScript and Node.js** (`typescript-node.md`)
   - Time: 1 hour | Topics: Node.js, TypeScript, web3.js
   - Tags: `typescript`, `nodejs`, `web3js`

4. **Mobile Environment** (`mobile-environment.md`)
   - Time: 2-3 hours | Topics: Android Studio, Xcode, React Native
   - Tags: `mobile`, `android`, `ios`, `react-native`

5. **Hardware and IoT** (`hardware-iot.md`)
   - Time: 1-2 hours | Topics: Raspberry Pi, LoRaWAN, sensors
   - Tags: `hardware`, `iot`, `raspberry-pi`

6. **Troubleshooting** (`troubleshooting.md`)
   - Time: Reference | Topics: Common issues and solutions
   - Tags: `troubleshooting`, `debugging`, `help`

---

## Learning Paths
**Path**: `curriculum/learning-paths/`  
**Tags**: `learning-paths`, `curriculum`, `guided`

1. **Web3 Beginner** (`web3-beginner.md`)
   - Duration: 25-35 hours | Prerequisites: Basic programming
   - Focus: Zero to basic Solana development
   - Tags: `beginner`, `fundamentals`, `getting-started`

2. **Security Auditor** (`security-auditor.md`)
   - Duration: 30-40 hours | Prerequisites: Solana basics, Rust
   - Focus: Security vulnerabilities and audit tools
   - Tags: `security`, `auditing`, `advanced`

3. **Mobile Developer** (`mobile-developer.md`)
   - Duration: 20-30 hours | Prerequisites: React Native experience
   - Focus: Mobile dApp development
   - Tags: `mobile`, `react-native`, `intermediate`

4. **DeFi Developer** (`defi-developer.md`)
   - Duration: 35-45 hours | Prerequisites: Solana basics, finance
   - Focus: Financial protocols and risk management
   - Tags: `defi`, `finance`, `advanced`

5. **AI Agent Developer** (`ai-agent-developer.md`)
   - Duration: 25-35 hours | Prerequisites: Solana basics, AI/ML
   - Focus: Autonomous blockchain agents
   - Tags: `ai`, `agents`, `automation`, `intermediate`

6. **DePIN Developer** (`depin-developer.md`)
   - Duration: 30-40 hours | Prerequisites: Solana basics, hardware
   - Focus: IoT and physical infrastructure
   - Tags: `depin`, `iot`, `hardware`, `intermediate`

7. **Privacy Developer** (`privacy-developer.md`)
   - Duration: 35-45 hours | Prerequisites: Solana basics, cryptography
   - Focus: Zero-knowledge proofs and privacy
   - Tags: `privacy`, `zero-knowledge`, `advanced`

---

## Integration Projects
**Path**: `integration/`  
**Difficulty**: Advanced  
**Tags**: `integration`, `projects`, `full-stack`, `advanced`

1. **Full-Stack dApp** (`full-stack-dapp/`)
   - Time: Variable | Combines: Basics, Mobile, Security
   - Description: End-to-end dApp with on-chain programs and client
   - Tags: `full-stack`, `dapp`, `end-to-end`

2. **Secure DeFi Protocol** (`secure-defi-protocol/`)
   - Time: Variable | Combines: DeFi, Security
   - Description: DeFi protocol with security best practices
   - Tags: `defi`, `security`, `protocol`

3. **Mobile Payment System** (`mobile-payment-system/`)
   - Time: Variable | Combines: Mobile, Basics
   - Description: Mobile payment integration with Solana Pay
   - Tags: `mobile`, `payments`, `solana-pay`

---

## By Difficulty Level

### Beginner
- Basics: All sections
- Security: Common Vulnerabilities, Safe Math
- DeFi: Token Economics
- DePIN: IoT Basics
- Setup: All guides

### Intermediate
- Security: Fuzzing with Trident, POC Frameworks
- Mobile: All sections
- DeFi: AMM Basics
- AI Agents: Agent Basics, Solana Agent Kit, MCP Integration
- DePIN: Raspberry Pi, LoRaWAN, Data Anchoring
- Privacy: Compression Basics

### Advanced
- Security: Post-Quantum Cryptography
- DeFi: Perpetual Futures, Risk Engines
- AI Agents: LangGraph Multi-Agent Systems
- Privacy: ZK Proofs, Light Protocol, Confidential Transfers
- Integration: All projects

---

## By Estimated Time

### Quick (< 3 hours)
- Basics: Transactions (1-2h)
- Security: Safe Math (2-3h)
- Mobile: Wallet Adapter (2-3h), Expo Template (2-3h), Solana Pay (2-3h)
- DeFi: Token Economics (2-3h)
- AI Agents: Agent Basics (2-3h), MCP Integration (2-3h)
- DePIN: IoT Basics (2h)
- Privacy: Compression Basics (2-3h)

### Medium (3-5 hours)
- Basics: Accounts and Programs (2-3h), Tokens (2-3h), PDAs (2-3h)
- Security: Common Vulnerabilities (3-4h), POC Frameworks (3-4h), Fuzzing (4-5h)
- Mobile: React Native (3-4h)
- DeFi: AMM Basics (3-4h)
- AI Agents: Solana Agent Kit (4-5h), LangGraph (3-4h)
- DePIN: Raspberry Pi (4h), LoRaWAN (3h), Data Anchoring (3h)
- Privacy: ZK Proofs (3-4h), Light Protocol (4-5h), Confidential Transfers (4-5h)

### Long (> 5 hours)
- Basics: Exercises (4-6h)
- Security: Post-Quantum Crypto (5-6h)
- DeFi: Perpetual Futures (4-6h), Risk Engines (4-6h)
- DePIN: Exercises (4-6h)

---

## By Tags

### Core Concepts
`fundamentals`, `accounts`, `transactions`, `tokens`, `pdas`, `programs`

### Security
`security`, `auditing`, `vulnerabilities`, `safe-math`, `fuzzing`, `post-quantum`

### Development
`rust`, `typescript`, `anchor`, `web3js`, `testing`, `debugging`

### Mobile
`mobile`, `react-native`, `expo`, `wallet-adapter`, `solana-pay`, `ios`, `android`

### DeFi
`defi`, `amm`, `perpetuals`, `tokenomics`, `liquidity`, `risk-management`

### AI & Automation
`ai`, `agents`, `llm`, `automation`, `langchain`, `mcp`, `multi-agent`

### Hardware & IoT
`depin`, `iot`, `hardware`, `raspberry-pi`, `lorawan`, `sensors`

### Privacy
`privacy`, `zero-knowledge`, `zk-compression`, `light-protocol`, `confidential`

### Learning
`beginner`, `intermediate`, `advanced`, `exercises`, `practice`, `learning-paths`

---

## Additional Resources

- **Main README**: [Learning_Module/README.md](README.md)
- **Glossary**: [GLOSSARY.md](GLOSSARY.md)
- **Source Repositories**: [SOURCES.md](SOURCES.md)
- **Curriculum Overview**: [curriculum/README.md](curriculum/README.md)

---

*Last Updated: 2025*  
*This index covers all content in the Solana Learning Module. For the most current information, refer to individual topic README files.*
