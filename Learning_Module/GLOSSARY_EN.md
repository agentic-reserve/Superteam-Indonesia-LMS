# Glossary: Solana Terminology

A quick reference guide for technical terms used throughout this Solana learning module.

## A

**Account**
The basic unit of data storage in Solana. Each account has a unique address, SOL balance, and can store arbitrary data. Accounts are owned by programs, and only the owner program can modify their data.

**Account Model**
Solana's architecture where all state is stored in accounts. Unlike Ethereum's contract-based model, Solana programs are stateless and all data is stored in separate accounts.

**Address Tree**
A Merkle tree data structure that stores compressed addresses to ensure address uniqueness in the ZK Compression system.

**ADL (Auto-Deleveraging)**
A mechanism in perpetual futures exchanges where profitable positions are forcibly closed to cover losses from liquidated positions when the insurance fund is insufficient.

**AI Agent**
An autonomous software system that can understand input, make decisions, and execute blockchain operations on behalf of users using AI models like GPT-4 or Claude.

**AMM (Automated Market Maker)**
A DeFi protocol that uses mathematical formulas to determine asset prices and facilitate trading without traditional order books. Examples: Uniswap, Raydium.

**Anchor**
A development framework for Solana programs that provides high-level abstractions, built-in security, and better developer experience. Reduces boilerplate code and prevents common vulnerabilities.

**Associated Token Account (ATA)**
A token account with an address deterministically derived from a wallet address and mint address. Makes it easy to find the token account for a specific wallet-token combination.

**ATA**
See Associated Token Account.

## B

**Berkeley Packet Filter (BPF)**
The bytecode format used by Solana programs. Programs are compiled to BPF and executed by the Solana runtime.

**Blockhash**
A unique hash of a specific block, used in transactions to prevent duplication and ensure transactions are processed within a certain timeframe.

**Borsh**
Binary Object Representation Serializer for Hashing - a serialization format used to store and read account data in Solana programs.

## C

**Chainlink**
A decentralized oracle network that provides off-chain data to smart contracts. Used for price feeds in Solana DeFi applications.

**Commitment Level**
The level of confirmation for transactions: processed (most recent), confirmed (cluster majority), finalized (cannot be rolled back).

**Compressed Account**
An account that uses ZK Compression to store data as calldata in the ledger, eliminating the need for rent-exemption while maintaining L1 security.

**Compute Units**
A measure of computational resources used by a transaction. Each transaction has a compute unit limit to prevent abuse.

**CPI (Cross-Program Invocation)**
A mechanism where one Solana program can call instructions from another program. Enables composability and inter-program interaction.

## D

**Data Anchoring**
The process of storing IoT or sensor data hashes on the Solana blockchain to prove data integrity and timestamp without storing the entire data on-chain.

**Deep Link**
A special URL that opens a mobile app directly to a specific page or function, used in Solana Pay to trigger transactions from other apps.

**DePIN (Decentralized Physical Infrastructure Networks)**
Decentralized physical infrastructure networks that integrate hardware and IoT with blockchain to build decentralized real-world systems.

**Devnet**
Solana's development network for testing. Tokens have no real value and can be obtained free through faucets.

## E

**Epoch**
A time period in Solana (approximately 2-3 days) during which the validator schedule remains constant. Used for staking rewards and validator rotation.

**Expo**
A framework and platform for building React Native applications with simplified tooling. Provides templates for Solana mobile apps.

## F

**Faucet**
A service that provides free tokens on devnet or testnet for development and testing purposes.

**Funding Rate**
Periodic payments between long and short traders in perpetual futures to keep the contract price close to the spot price.

**Fuzzing**
A security testing technique that automatically generates random inputs to find bugs and vulnerabilities. Trident is a fuzzing framework for Solana programs.

## G

**Groth16**
A pairing-based zero-knowledge proof system used in ZK Compression to verify Merkle proofs with a constant size of 128 bytes.

## H

**Hash-Based Signature**
A cryptographic signature scheme that uses hash functions and is secure against quantum computer attacks. Example: Winternitz One-Time Signature.

## I

**Initial Margin (IM)**
The minimum amount of collateral required to open a leveraged position in perpetual futures or margin trading.

**Instruction**
The basic unit of operation in a Solana transaction. Each instruction calls a specific program with the required data and accounts.

**IoT (Internet of Things)**
A network of physical devices connected to the internet that can collect and exchange data. In the Solana context, IoT devices can interact with the blockchain.

## K

**Keypair**
A pair of public key and private key used to identify and sign transactions on Solana.

## L

**Lamport**
The smallest unit of SOL. 1 SOL = 1,000,000,000 lamports (1 billion lamports).

**LangGraph**
A framework for building multi-agent applications using graph-based workflows, often used with LangChain for AI agents on Solana.

**Leverage**
The ability to control a larger position than the collateral owned. Example: 10x leverage means $100 collateral can control a $1000 position.

**liboqs**
An open-source library for post-quantum cryptographic algorithms, used in quantum-resistant signature implementations on Solana.

**Light Protocol**
A protocol for privacy-preserving transactions on Solana using zero-knowledge proofs and compressed state.

**Liquidation**
The forced closure of a trading position when margin is insufficient to cover potential losses.

**Liquidity Pool**
A collection of tokens locked in a smart contract to facilitate trading in an AMM. Liquidity providers supply tokens and earn fees from trades.

**LLM (Large Language Model)**
Large AI models like GPT-4 or Claude that can understand and generate natural language text, used as the "brain" of AI agents.

**LoRaWAN (Long Range Wide Area Network)**
A long-range communication protocol for low-power IoT devices, can be integrated with Solana for DePIN applications.

## M

**Mainnet**
Solana's production network where real transactions occur with real value. Opposite of devnet/testnet.

**Mark Price**
The fair value price of a perpetual futures contract, calculated using the index price and funding rate. Used to prevent manipulation and determine liquidations.

**MCP (Model Context Protocol)**
A protocol for providing context to AI models, enabling agents to access external data and tools in a standardized way.

**Merkle Tree**
A tree data structure where each leaf node is a hash of data and each non-leaf node is a hash of its children. Used in ZK Compression for efficient state verification.

**Mint**
The token type or token program account that defines a specific SPL token. Each token type has one mint account.

**Mobile Wallet Adapter (MWA)**
A protocol that enables mobile dApps to connect with mobile wallets for transaction signing and authorization.

## N

**NFT (Non-Fungible Token)**
A unique digital asset on the blockchain. Each NFT has distinct properties and cannot be exchanged 1:1 with another NFT.

**Nullifier**
A unique value derived from a compressed account that prevents double-spending in ZK Compression systems. Once used, a nullifier cannot be reused.

## O

**Oracle**
A service that provides external data (like prices, weather, etc.) to blockchain programs. Examples: Pyth, Switchboard, Chainlink.

**Overflow**
A condition where an arithmetic operation produces a result larger than the maximum value that can be stored. Can cause security vulnerabilities if not handled properly.

## P

**PDA (Program Derived Address)**
An address deterministically derived from a program ID and seeds. PDAs allow programs to "sign" for accounts without needing a private key.

**Perpetual Futures**
A derivative contract similar to traditional futures but without an expiration date. Uses funding rates to keep the price anchored to the spot price.

**Post-Quantum Cryptography**
Cryptographic algorithms designed to be secure against attacks by quantum computers. Examples: hash-based signatures, lattice-based cryptography.

**Program**
Solana's term for smart contracts. Programs are executable code deployed on-chain that can process instructions and modify account data.

**Proof-of-Concept (POC)**
A demonstration that shows a vulnerability or exploit is possible. Used in security research and CTF challenges.

**Pyth**
A high-frequency oracle network that provides real-time price feeds for DeFi applications on Solana.

## R

**Raspberry Pi**
A small, affordable single-board computer often used for IoT projects. Can be integrated with Solana for DePIN applications.

**React Native**
A framework for building native mobile applications using React and JavaScript. Used for Solana mobile dApp development.

**Rent**
A fee charged for storing data on Solana. Accounts must maintain a minimum balance (rent-exempt minimum) to avoid being deleted.

**Risk Engine**
A system that monitors positions, calculates risk metrics, and triggers liquidations when necessary. Critical component of DeFi protocols.

## S

**Safe Math**
Arithmetic operations that check for overflow/underflow and handle errors gracefully. Essential for financial applications.

**Seed**
A value used to derive a PDA. Multiple seeds can be combined to create unique addresses.

**Signer**
An account that has signed a transaction with its private key. Programs check for signers to authorize operations.

**Slippage**
The difference between the expected price of a trade and the actual execution price. Common in AMMs with low liquidity.

**Solana Pay**
A protocol for payment requests and transactions on Solana, optimized for mobile and point-of-sale use cases.

**SPL Token**
Solana Program Library Token - the standard for fungible and non-fungible tokens on Solana.

**State Tree**
A Merkle tree that stores compressed account state in ZK Compression systems.

**Switchboard**
A decentralized oracle network on Solana that provides customizable data feeds.

## T

**Token Account**
An account that holds a balance of a specific SPL token for a wallet. Each wallet needs a separate token account for each token type.

**Token Metadata**
Additional information about a token (name, symbol, image, etc.) stored in a metadata account. Standard defined by Metaplex.

**Transaction**
A signed message containing one or more instructions to be executed atomically on Solana.

**Trident**
A fuzzing framework for Solana programs that helps discover vulnerabilities through automated testing.

**TWAP (Time-Weighted Average Price)**
An average price calculated over a specific time period, used to prevent price manipulation in oracles.

## V

**Validator**
A node in the Solana network that processes transactions and produces blocks. Validators stake SOL to participate in consensus.

**Vault**
A program-controlled account that holds assets securely. Often used in DeFi protocols for escrow and custody.

## W

**Wallet**
Software that manages keypairs and signs transactions. Can be browser-based (Phantom, Solflare) or mobile (Solana Mobile Wallet).

**Winternitz One-Time Signature (WOTS+)**
A hash-based signature scheme that is quantum-resistant. Each keypair can only sign one message securely.

**Withdrawal Window**
A time period in perpetual futures protocols during which users can withdraw funds. Used to manage liquidity and risk.

## Z

**Zero-Knowledge Proof (ZK Proof)**
A cryptographic method that allows one party to prove they know a value without revealing the value itself. Used in privacy protocols.

**ZK Compression**
A technique that uses zero-knowledge proofs to compress account state, reducing storage costs while maintaining security.

---

## Additional Resources

- **Solana Documentation**: https://docs.solana.com
- **Solana Cookbook**: https://solanacookbook.com
- **Anchor Documentation**: https://www.anchor-lang.com
- **SPL Token Documentation**: https://spl.solana.com/token

---

*This glossary is a living document. Terms are added as new concepts are introduced in the learning module.*
