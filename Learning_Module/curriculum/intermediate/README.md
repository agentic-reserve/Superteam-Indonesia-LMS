# Intermediate Curriculum

Build on your Solana foundation with security best practices, mobile development, and hardware integration. This curriculum prepares you for production-ready development.

## Overview

The intermediate curriculum focuses on practical skills needed for real-world Solana development. You'll learn security auditing, mobile dApp development, and how to integrate physical hardware with blockchain applications.

**Total Estimated Time**: 30-40 hours  
**Prerequisites**: Completion of beginner curriculum or equivalent Solana knowledge  
**Outcome**: Ability to build secure, production-ready Solana applications across multiple platforms

## Learning Sequence

### Phase 1: Security Fundamentals (12-16 hours)

Learn to identify vulnerabilities and write secure Solana programs.

#### [Security Topic Area](../../security/README.md)

Security is critical for any blockchain application. This phase teaches you to think like an auditor and write defensive code.

---

#### [01 - Common Vulnerabilities](../../security/01-common-vulnerabilities/README.md) (3-4 hours)

**Key Concepts**:
- Integer overflow and underflow
- Missing signer checks
- Account validation failures
- Reentrancy and cross-program invocation risks

**Learning Objectives**:
- Identify common vulnerability patterns
- Understand real-world exploit examples
- Learn defensive programming techniques
- Review actual audit findings

**Prerequisites**: Beginner curriculum (accounts, programs, transactions)

**Estimated Time**: 3-4 hours

---

#### [02 - Safe Math](../../security/02-safe-math/README.md) (2-3 hours)

**Key Concepts**:
- Checked arithmetic operations
- Overflow protection patterns
- Safe math libraries
- Numeric type considerations

**Learning Objectives**:
- Use checked math operations
- Prevent integer overflow vulnerabilities
- Choose appropriate numeric types
- Implement safe calculation patterns

**Prerequisites**: Common vulnerabilities knowledge

**Estimated Time**: 2-3 hours

---

#### [03 - Fuzzing with Trident](../../security/03-fuzzing-with-trident/README.md) (4-5 hours)

**Key Concepts**:
- Property-based testing concepts
- Trident fuzzing framework
- Invariant testing
- Automated vulnerability discovery

**Learning Objectives**:
- Set up Trident for your programs
- Write effective fuzz tests
- Define program invariants
- Interpret fuzzing results

**Prerequisites**: Safe math, testing fundamentals

**Estimated Time**: 4-5 hours

---

#### [04 - POC Frameworks](../../security/04-poc-frameworks/README.md) (2-3 hours)

**Key Concepts**:
- Proof-of-concept development
- CTF (Capture The Flag) frameworks
- Exploit development for testing
- Security testing methodologies

**Learning Objectives**:
- Build POCs for vulnerabilities
- Use CTF frameworks for practice
- Test security fixes effectively
- Document security findings

**Prerequisites**: Common vulnerabilities, fuzzing basics

**Estimated Time**: 2-3 hours

---

#### [05 - Post-Quantum Cryptography](../../security/05-post-quantum-crypto/README.md) (1-2 hours)

**Key Concepts**:
- Quantum computing threats
- Hash-based signatures
- Winternitz schemes
- Quantum-resistant algorithms

**Learning Objectives**:
- Understand quantum threats to blockchain
- Learn post-quantum signature schemes
- Evaluate security trade-offs
- Implement quantum-resistant patterns

**Prerequisites**: Basic cryptography understanding

**Estimated Time**: 1-2 hours

---

**Security Phase Checkpoint**: You should be able to audit Solana programs for common vulnerabilities, write fuzz tests, and implement secure coding patterns.

---

### Phase 2: Mobile Development (10-14 hours)

Build mobile dApps that connect to Solana blockchain.

#### [Mobile Topic Area](../../mobile/README.md)

Mobile development brings Solana to smartphones, enabling wallet integration and mobile-first dApps.

---

#### [01 - Wallet Adapter](../../mobile/01-wallet-adapter/README.md) (3-4 hours)

**Key Concepts**:
- Mobile wallet adapter protocol
- Wallet connection flow
- Transaction signing on mobile
- Deep linking and session management

**Learning Objectives**:
- Integrate mobile wallet adapter
- Handle wallet connections
- Request transaction signatures
- Manage user sessions

**Prerequisites**: Beginner curriculum, basic mobile development

**Estimated Time**: 3-4 hours

---

#### [02 - React Native Integration](../../mobile/02-react-native/README.md) (3-4 hours)

**Key Concepts**:
- React Native setup for Solana
- Solana libraries in React Native
- Native module integration
- Platform-specific considerations

**Learning Objectives**:
- Set up React Native for Solana
- Use Solana libraries in mobile apps
- Handle platform differences
- Build responsive mobile UIs

**Prerequisites**: React Native basics, wallet adapter

**Estimated Time**: 3-4 hours

---

#### [03 - Expo Template](../../mobile/03-expo-template/README.md) (2-3 hours)

**Key Concepts**:
- Expo framework for Solana
- Quick start templates
- Managed workflow benefits
- Expo limitations and workarounds

**Learning Objectives**:
- Use Expo for rapid development
- Leverage Solana Expo templates
- Understand managed vs bare workflow
- Deploy mobile dApps quickly

**Prerequisites**: React Native integration

**Estimated Time**: 2-3 hours

---

#### [04 - Solana Pay](../../mobile/04-solana-pay/README.md) (2-3 hours)

**Key Concepts**:
- Solana Pay protocol
- QR code payment flows
- Transaction requests
- Mobile payment UX patterns

**Learning Objectives**:
- Implement Solana Pay
- Generate payment QR codes
- Handle payment confirmations
- Build mobile payment experiences

**Prerequisites**: Wallet adapter, mobile integration

**Estimated Time**: 2-3 hours

---

**Mobile Phase Checkpoint**: You should be able to build a mobile dApp with wallet integration and payment functionality.

---

### Phase 3: DePIN and IoT Integration (8-10 hours)

Connect physical hardware to Solana blockchain.

#### [DePIN Topic Area](../../depin/README.md)

DePIN (Decentralized Physical Infrastructure Networks) bridges the physical and digital worlds through blockchain.

---

#### [01 - IoT Basics](../../depin/01-iot-basics/README.md) (2-3 hours)

**Key Concepts**:
- IoT and blockchain integration
- Data anchoring patterns
- Device authentication
- Real-world DePIN use cases

**Learning Objectives**:
- Understand IoT-blockchain architecture
- Design data anchoring strategies
- Implement device authentication
- Evaluate DePIN applications

**Prerequisites**: Beginner curriculum

**Estimated Time**: 2-3 hours

---

#### [02 - Raspberry Pi Integration](../../depin/02-raspberry-pi-integration/README.md) (3-4 hours)

**Key Concepts**:
- Raspberry Pi setup for Solana
- GPIO control from blockchain
- Sensor data reading
- Hardware-software integration

**Learning Objectives**:
- Set up Raspberry Pi with Solana
- Control LEDs and actuators
- Read sensor data
- Anchor IoT data on-chain

**Prerequisites**: IoT basics, hardware access

**Estimated Time**: 3-4 hours

---

#### [03 - LoRaWAN Networks](../../depin/03-lorawan-networks/README.md) (2-3 hours)

**Key Concepts**:
- LoRaWAN protocol basics
- Long-range IoT communication
- Network server integration
- Decentralized wireless networks

**Learning Objectives**:
- Understand LoRaWAN architecture
- Integrate LoRaWAN with Solana
- Build long-range IoT applications
- Design decentralized networks

**Prerequisites**: IoT basics, Raspberry Pi integration

**Estimated Time**: 2-3 hours

---

#### [04 - Data Anchoring](../../depin/04-data-anchoring/README.md) (1-2 hours)

**Key Concepts**:
- On-chain data storage strategies
- Data compression techniques
- Merkle proofs for IoT data
- Cost-effective anchoring patterns

**Learning Objectives**:
- Implement efficient data anchoring
- Use compression for cost savings
- Verify data integrity
- Design scalable IoT systems

**Prerequisites**: IoT basics, Raspberry Pi integration

**Estimated Time**: 1-2 hours

---

**DePIN Phase Checkpoint**: You should be able to connect physical hardware to Solana and anchor IoT data on-chain.

---

## Concept Progression

The intermediate curriculum builds expertise in three parallel tracks:

```
Beginner Foundation
    ↓
    ├─→ Security Track (12-16 hours)
    │   ├─ Common Vulnerabilities
    │   ├─ Safe Math
    │   ├─ Fuzzing with Trident
    │   ├─ POC Frameworks
    │   └─ Post-Quantum Crypto
    │
    ├─→ Mobile Track (10-14 hours)
    │   ├─ Wallet Adapter
    │   ├─ React Native
    │   ├─ Expo Template
    │   └─ Solana Pay
    │
    └─→ DePIN Track (8-10 hours)
        ├─ IoT Basics
        ├─ Raspberry Pi
        ├─ LoRaWAN
        └─ Data Anchoring
```

## Time Estimates by Track

| Track | Estimated Time | Key Focus |
|-------|---------------|-----------|
| Security | 12-16 hours | Auditing and secure coding |
| Mobile | 10-14 hours | Mobile dApp development |
| DePIN | 8-10 hours | Hardware-blockchain integration |
| **Total** | **30-40 hours** | **Production-ready skills** |

## Learning Paths

You can follow these tracks in any order based on your interests:

### Security-First Path
Recommended for developers focused on smart contract security or planning to work with financial applications.
1. Complete Security track
2. Add Mobile or DePIN based on project needs

### Mobile-First Path
Recommended for mobile developers or those building consumer-facing applications.
1. Complete Mobile track
2. Add Security track for production readiness
3. Optional: DePIN for hardware integration

### DePIN-First Path
Recommended for IoT developers or those building physical infrastructure applications.
1. Complete DePIN track
2. Add Security track for production readiness
3. Optional: Mobile for user interfaces

## Prerequisites Check

Before starting intermediate curriculum, ensure you have:

- [ ] Completed beginner curriculum or equivalent
- [ ] Understanding of accounts, programs, and transactions
- [ ] Ability to write basic Solana programs
- [ ] Familiarity with PDAs and tokens
- [ ] Development environment fully configured

## Additional Prerequisites by Track

**Security Track**:
- [ ] Rust programming comfort
- [ ] Basic testing knowledge

**Mobile Track**:
- [ ] React or React Native experience
- [ ] Mobile development basics
- [ ] iOS/Android development environment

**DePIN Track**:
- [ ] Hardware access (Raspberry Pi recommended)
- [ ] Basic electronics knowledge (helpful but not required)
- [ ] Willingness to work with physical devices

## What's Next?

After completing the intermediate curriculum, you can:

1. **Advance to Advanced Topics**: Explore [advanced curriculum](../advanced/README.md) for DeFi, AI agents, and privacy
2. **Specialize Further**: Choose specialized [learning paths](../learning-paths/) like Security Auditor or Mobile Developer
3. **Build Production Apps**: Apply your skills to real-world projects
4. **Contribute to Ecosystem**: Audit open-source projects or build tools

## Practice Exercises

Each topic area includes hands-on exercises:

- **[Security Exercises](../../security/exercises/README.md)**: Vulnerability detection and secure coding
- **[Mobile Exercises](../../mobile/exercises/README.md)**: Mobile dApp development
- **[DePIN Exercises](../../depin/exercises/README.md)**: Hardware integration projects

## Additional Resources

- **[Setup Guides](../../setup/README.md)**: Environment configuration for each track
- **[Troubleshooting](../../setup/troubleshooting.md)**: Solutions to common issues
- **[Glossary](../../GLOSSARY.md)**: Technical terminology reference
- **[Source Repositories](../../SOURCES.md)**: Original learning materials

---

*The intermediate curriculum prepares you for production development. Take time to complete exercises and build real projects in each area.*
