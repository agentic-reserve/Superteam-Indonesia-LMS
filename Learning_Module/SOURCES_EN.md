# Source Repositories

This document catalogs all source repositories used to create this Solana Learning Module, including descriptions, clone instructions, and related topic areas.

## Overview

This learning module curates and organizes educational content from eight major repository categories covering various aspects of Solana development:

1. **Percolator** - Advanced DeFi protocols (perpetual futures, risk engines)
2. **Solana Agent Kit** - AI agent development framework
3. **Solana Audit Tools** - Security tools and frameworks
4. **Solana Example Program** - Basic example programs
5. **Solana Mobile** - Mobile dApp development
6. **Solana DePIN Examples** - IoT and physical infrastructure integration
7. **Solana Privacy** - Privacy features and zero-knowledge
8. **Solana Post-Quantum** - Post-quantum cryptography implementations

---

## 1. Percolator

**Description**: An advanced DeFi protocol suite implementing perpetual futures, risk engines, and sophisticated order matching mechanisms on Solana.

**Topic Area**: DeFi (defi/)

**Repositories**:
- **percolator**: Core protocol implementation
- **percolator-cli**: Command-line tools for protocol interaction
- **percolator-match**: Matching engine for order execution
- **percolator-prog**: On-chain program implementation
- **percolator-stress-test**: Performance and stress testing tools

**Workspace Location**: `percolator/`

**Clone Instructions**:
```bash
# Clone individual repositories
git clone https://github.com/[org]/percolator.git
git clone https://github.com/[org]/percolator-cli.git
git clone https://github.com/[org]/percolator-match.git
git clone https://github.com/[org]/percolator-prog.git
git clone https://github.com/[org]/percolator-stress-test.git
```

**Extracted Content**:
- Perpetual futures concepts and implementation
- Risk engine architecture for risk management
- Patterns for production-grade DeFi protocols
- CLI tools for DeFi operations
- Testing and validation patterns

**Maintenance Status**: Active

**License**: See LICENSE file in each repository

**Key Learning Resources**:
- `percolator/README.md` - Protocol overview and concepts
- `percolator/spec.md` - Technical specification
- `percolator/audit.md` - Security audit findings
- `percolator-cli/README.md` - CLI usage and examples

---

## 2. Solana Agent Kit

**Description**: A comprehensive framework for building AI agents that can interact with the Solana blockchain, including toolkit, templates, and integrations with popular AI frameworks.

**Topic Area**: AI Agents (ai-agents/)

**Repositories**:
- **create-solana-agent**: Template generator for agent projects
- **devrel-mcp**: Model Context Protocol integration
- **langgraph**: LangGraph integration for agent workflows
- **plugin-god-mode**: Plugin with extended capabilities
- **solana-agent-kit**: Core agent toolkit

**Workspace Location**: `solana-agent-kit/`

**Clone Instructions**:
```bash
# Clone agent kit repositories
git clone https://github.com/sendaifun/solana-agent-kit.git
git clone https://github.com/[org]/create-solana-agent.git
git clone https://github.com/[org]/devrel-mcp.git
git clone https://github.com/[org]/langgraph.git
git clone https://github.com/[org]/plugin-god-mode.git
```

**Extracted Content**:
- Basic patterns for autonomous agents
- Solana Agent Kit integration with blockchain
- Model Context Protocol (MCP) for AI agents
- LangGraph workflows for agent orchestration
- Templates and boilerplate for quick start

**Maintenance Status**: Active

**License**: See LICENSE file in each repository

**Key Learning Resources**:
- `solana-agent-kit/README.md` - Toolkit overview and setup
- `solana-agent-kit/docs/` - Comprehensive documentation
- `solana-agent-kit/examples/` - Example agent implementations

---

## 3. Solana Audit Tools

**Description**: A collection of tools, frameworks, and resources for security auditing of Solana programs, including vulnerability patterns, fuzzing tools, and POC frameworks.

**Topic Area**: Security (security/)

**Repositories**:
- Various security tools and frameworks
- Vulnerability databases and patterns
- Fuzzing and testing frameworks
- CTF challenges and POC examples

**Workspace Location**: `solana-audit-tools/`

**Clone Instructions**:
```bash
# Clone audit tools repositories
git clone https://github.com/[org]/solana-audit-tools.git
# Additional repositories as needed
```

**Extracted Content**:
- Common vulnerability patterns in Solana programs
- Security best practices and safe coding patterns
- Fuzzing techniques with Trident
- POC frameworks for exploit development
- CTF challenges for security training

**Maintenance Status**: Active

**License**: See LICENSE file in each repository

**Key Learning Resources**:
- Vulnerability pattern documentation
- Security audit checklists
- Fuzzing guides and examples
- CTF challenge writeups

---

## 4. Solana Example Program

**Description**: Basic example programs demonstrating fundamental Solana concepts including accounts, transactions, tokens, and PDAs.

**Topic Area**: Basics (basics/)

**Repositories**:
- Example programs for core concepts
- Tutorial implementations
- Reference code for common patterns

**Workspace Location**: `solana-example-program/`

**Clone Instructions**:
```bash
# Clone example program repositories
git clone https://github.com/[org]/solana-example-program.git
```

**Extracted Content**:
- Account model examples
- Transaction construction patterns
- SPL token operations
- PDA derivation and usage
- Basic program structures

**Maintenance Status**: Active

**License**: See LICENSE file in repository

**Key Learning Resources**:
- Example program implementations
- Tutorial documentation
- Code comments and explanations

---

## 5. Solana Mobile

**Description**: Resources and tools for building mobile dApps on Solana, including wallet adapter, React Native integration, and Solana Pay.

**Topic Area**: Mobile (mobile/)

**Repositories**:
- **mobile-wallet-adapter**: Protocol for mobile wallet integration
- **solana-mobile-dapp-scaffold**: Template for mobile dApps
- **solana-pay**: Payment protocol implementation
- React Native examples and templates

**Workspace Location**: `solana-mobile/`

**Clone Instructions**:
```bash
# Clone mobile development repositories
git clone https://github.com/solana-mobile/mobile-wallet-adapter.git
git clone https://github.com/solana-mobile/solana-mobile-dapp-scaffold.git
# Additional repositories as needed
```

**Extracted Content**:
- Mobile wallet adapter integration
- React Native setup and configuration
- Expo template for Solana apps
- Solana Pay implementation
- Mobile UX patterns

**Maintenance Status**: Active

**License**: See LICENSE file in each repository

**Key Learning Resources**:
- `mobile-wallet-adapter/README.md` - Wallet adapter documentation
- Mobile dApp examples and templates
- Solana Pay integration guides

---

## 6. Solana DePIN Examples

**Description**: Examples of decentralized physical infrastructure networks integrating IoT devices and hardware with Solana blockchain.

**Topic Area**: DePIN (depin/)

**Repositories**:
- **led-switch**: LED control via blockchain
- **solana-bar**: Bar payment system with hardware
- **Raspberry-LED-display**: Raspberry Pi LED integration
- **treasure-chest**: IoT treasure chest example
- LoRaWAN integration examples

**Workspace Location**: `solana-depin-examples/`

**Clone Instructions**:
```bash
# Clone DePIN example repositories
git clone https://github.com/solana-developers/solana-depin-examples.git
```

**Extracted Content**:
- Raspberry Pi integration with Solana
- LED control and sensor reading
- LoRaWAN network integration
- Data anchoring patterns
- Real-world DePIN applications

**Maintenance Status**: Active

**License**: See LICENSE file in repository

**Key Learning Resources**:
- Hardware setup guides
- Wiring diagrams
- Integration examples
- Troubleshooting guides

---

## 7. Solana Privacy (Light Protocol)

**Description**: Privacy-preserving features on Solana using zero-knowledge proofs and state compression, including the Light Protocol implementation.

**Topic Area**: Privacy (privacy/)

**Repositories**:
- **light-protocol**: Core privacy protocol
- ZK compression implementations
- Compressed token examples
- Nullifier programs

**Workspace Location**: `solana-privacy/`

**Clone Instructions**:
```bash
# Clone privacy protocol repositories
git clone https://github.com/Lightprotocol/light-protocol.git
```

**Extracted Content**:
- ZK compression concepts and implementation
- Compressed account model
- Light Protocol usage
- Nullifier patterns
- Confidential transfer implementations
- Private token operations

**Maintenance Status**: Active

**License**: See LICENSE file in repository

**Key Learning Resources**:
- `docs-v2/learn/core-concepts.mdx` - Core concepts
- `docs-v2/compressed-tokens/overview.mdx` - Token compression
- `docs-v2/quickstart.mdx` - Getting started guide
- Example implementations

---

## 8. Solana Post-Quantum

**Description**: Post-quantum cryptography implementations for Solana, including hash-based signatures and quantum-resistant algorithms.

**Topic Area**: Security (security/05-post-quantum-crypto/)

**Repositories**:
- **hashsigs-rs**: Hash-based signature implementation
- **solana-winternitz-vault**: Winternitz signature vault
- **liboqs-rust**: Rust bindings for liboqs

**Workspace Location**: `solana-post-quantum/`

**Clone Instructions**:
```bash
# Clone post-quantum cryptography repositories
git clone https://github.com/[org]/hashsigs-rs.git
git clone https://github.com/[org]/solana-winternitz-vault.git
git clone https://github.com/[org]/liboqs-rust.git
```

**Extracted Content**:
- Hash-based signature schemes
- Winternitz One-Time Signature (WOTS+)
- liboqs integration
- Quantum threat models
- Performance comparisons
- Quantum-resistant vault implementation

**Maintenance Status**: Active

**License**: See LICENSE file in each repository

**Key Learning Resources**:
- Implementation documentation
- Security analysis
- Performance benchmarks
- Usage examples

---

## Using Source Repositories

### For Learners

**Exploring Source Code**:
1. Clone repositories you're interested in
2. Read README files for overview
3. Explore example code and tests
4. Try running examples locally

**Staying Updated**:
- Source repositories may have newer content than this module
- Check repository commit history for updates
- Follow repository issues and discussions
- Star repositories to track changes

**Contributing**:
- Report issues you find
- Submit improvements and fixes
- Share your learning projects
- Help other learners

### For Instructors

**Using in Courses**:
- Reference source repositories for deeper dives
- Assign exploration of specific repositories
- Use examples as starting points for projects
- Encourage students to contribute

**Keeping Content Fresh**:
- Periodically check for repository updates
- Update learning module with new patterns
- Incorporate new examples and best practices
- Share feedback with repository maintainers

---

## Attribution and Licensing

### Content Attribution

All content in this learning module is derived from the source repositories listed above. When using this content:

1. **Maintain Attribution**: Keep references to original sources
2. **Respect Licenses**: Follow the license terms of each repository
3. **Link to Sources**: Provide links to original repositories
4. **Credit Authors**: Acknowledge original authors and contributors

### License Information

Each source repository has its own license. Common licenses include:

- **MIT License**: Permissive, allows commercial use
- **Apache 2.0**: Permissive with patent grant
- **GPL**: Copyleft, requires derivative works to be open source

**Always check the LICENSE file in each repository before using the code.**

### Contributing Back

If you create improvements or find issues:

1. **Report Issues**: Use repository issue trackers
2. **Submit PRs**: Contribute fixes and improvements
3. **Share Knowledge**: Write tutorials and guides
4. **Help Others**: Answer questions in discussions

---

## Repository Maintenance Status

### Active Repositories

Repositories marked as "Active" are:
- Regularly updated with new features
- Maintained by active development teams
- Accepting issues and pull requests
- Recommended for learning and production use

### Archived Repositories

Some repositories may be archived:
- No longer actively maintained
- Still valuable for learning concepts
- Code may be outdated
- Use with caution for production

**Check repository status before starting new projects.**

---

## Additional Resources

### Official Solana Resources

- **Solana Documentation**: https://docs.solana.com
- **Solana Cookbook**: https://solanacookbook.com
- **Solana GitHub**: https://github.com/solana-labs
- **Solana Program Library**: https://github.com/solana-labs/solana-program-library

### Community Resources

- **Solana Discord**: Community chat and support
- **Solana Stack Exchange**: Q&A platform
- **Solana Forum**: Long-form discussions
- **Solana Twitter**: News and updates

### Development Tools

- **Anchor Framework**: https://www.anchor-lang.com
- **Solana Playground**: https://beta.solpg.io
- **Solana Explorer**: https://explorer.solana.com
- **Solana CLI**: https://docs.solana.com/cli

---

## Feedback and Updates

### Reporting Issues

If you find issues with source attributions or links:

1. Check if the source repository has moved
2. Verify the content is correctly attributed
3. Report issues to the learning module maintainers
4. Suggest corrections or updates

### Suggesting New Sources

To suggest additional source repositories:

1. Ensure the repository is educational
2. Verify it's actively maintained
3. Check it adds unique value
4. Submit a suggestion with description

---

*This document is maintained alongside the learning module. Last updated: 2025*

**Note**: Repository URLs and locations may change. If you encounter broken links, please report them so we can update the documentation.
