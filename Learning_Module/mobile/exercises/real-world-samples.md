# Real-World Sample Applications

This guide provides hands-on exercises using real Solana Mobile sample applications. These samples demonstrate best practices and common patterns for production-ready mobile dApps.

## Overview

The Solana Mobile team provides several sample applications that showcase different aspects of mobile dApp development. These samples are production-quality code that you can learn from, modify, and use as starting points for your own projects.

## Sample Applications

### 1. Settle - Expense Splitting App

**Location**: `C:\Users\raden\Documents\superteam_modul\solana-mobile\react-native-samples\settle`

**Level**: Beginner-friendly

**Description**: A mobile app for splitting expenses and settling debts using Solana transfers. Demonstrates wallet connection and transaction sending.

**Key Features**:
- Connect to Mobile Wallet Adapter
- Send SOL transfers
- View transaction history
- Split expenses among friends
- Track debts and settlements

**What You'll Learn**:
- Basic MWA integration
- Creating and sending transactions
- Transaction confirmation handling
- Simple UI/UX patterns
- Error handling

**Exercise Tasks**:

1. **Setup and Run**
   ```bash
   cd C:\Users\raden\Documents\superteam_modul\solana-mobile\react-native-samples\settle
   npm install
   npx expo run:android
   ```

2. **Explore the Code**
   - Study the wallet connection implementation
   - Examine how transactions are created
   - Review the expense splitting logic
   - Understand the UI components

3. **Modify the App**
   - Add support for SPL token transfers (not just SOL)
   - Implement a "split equally" feature
   - Add transaction history persistence
   - Create a "request payment" feature

4. **Challenge**
   - Add support for multiple currencies
   - Implement group expense tracking
   - Add receipt photo uploads
   - Create expense categories

### 2. SKR Address Resolution

**Location**: `C:\Users\raden\Documents\superteam_modul\solana-mobile\react-native-samples\skr-address-resolution`

**Level**: Beginner-friendly

**Description**: Application demonstrating bidirectional domain lookup using .skr domains (Solana Name Service equivalent).

**Key Features**:
- Connect wallet
- Domain to address lookup (example.skr → wallet address)
- Address to domain reverse lookup (wallet address → example.skr)
- Search functionality
- Domain registration info

**What You'll Learn**:
- Name service integration
- Bidirectional lookups
- Search UI patterns
- Data fetching and caching
- User-friendly address display

**Exercise Tasks**:

1. **Setup and Run**
   ```bash
   cd C:\Users\raden\Documents\superteam_modul\solana-mobile\react-native-samples\skr-address-resolution
   npm install
   npx expo run:android
   ```

2. **Explore the Code**
   - Study the name service integration
   - Examine lookup implementations
   - Review caching strategies
   - Understand error handling

3. **Modify the App**
   - Add favorite domains feature
   - Implement domain search history
   - Add domain availability checker
   - Create domain profile pages

4. **Challenge**
   - Integrate with other name services (SNS, ANS)
   - Add domain registration flow
   - Implement domain marketplace
   - Create domain analytics

### 3. Cause Pots - Decentralized Group Savings

**Location**: `C:\Users\raden\Documents\superteam_modul\solana-mobile\react-native-samples\cause-pots`

**Level**: Intermediate

**Description**: Decentralized group savings application built on Solana with custom Anchor smart contracts and PDAs.

**Key Features**:
- Create savings "pots" for causes
- Contribute to pots
- Track contributions
- Withdraw when goals are met
- Friend management with .skr domains
- Custom PDA-based smart contract

**What You'll Learn**:
- Anchor program integration
- Custom instruction creation
- PDA (Program Derived Address) usage
- Complex transaction building
- Smart contract interaction patterns
- Friend/social features

**Exercise Tasks**:

1. **Setup and Run**
   ```bash
   cd C:\Users\raden\Documents\superteam_modul\solana-mobile\react-native-samples\cause-pots
   npm install
   npx expo run:android
   ```

2. **Explore the Code**
   - Study the Anchor program integration
   - Examine PDA derivation
   - Review custom instruction building
   - Understand account management
   - Study the friend management system

3. **Modify the App**
   - Add pot categories
   - Implement contribution milestones
   - Add pot sharing features
   - Create contribution leaderboards

4. **Challenge**
   - Add recurring contributions
   - Implement pot templates
   - Create pot analytics dashboard
   - Add notification system for milestones

## Comparative Analysis

### Architecture Comparison

Study how each sample handles:

1. **Wallet Connection**
   - Compare MWA implementations
   - Note different connection patterns
   - Identify best practices

2. **State Management**
   - React Context vs Redux vs React Query
   - Local state patterns
   - Persistence strategies

3. **Transaction Handling**
   - Simple transfers (Settle)
   - Name service lookups (SKR)
   - Custom instructions (Cause Pots)

4. **Error Handling**
   - User-facing error messages
   - Retry logic
   - Fallback strategies

5. **UI/UX Patterns**
   - Loading states
   - Transaction confirmation
   - Success/error feedback

### Code Quality Analysis

For each sample, evaluate:

1. **Code Organization**
   - File structure
   - Component hierarchy
   - Separation of concerns

2. **TypeScript Usage**
   - Type definitions
   - Type safety
   - Interface design

3. **Testing**
   - Test coverage
   - Test patterns
   - Mock strategies

4. **Documentation**
   - Code comments
   - README quality
   - Setup instructions

## Integration Exercises

### Exercise 1: Combine Features

Create a new app that combines features from multiple samples:

**Goal**: Build an expense splitting app with name service integration

**Requirements**:
- Use Settle's transaction logic
- Integrate SKR's name resolution
- Allow splitting expenses using .skr names
- Track settlements by domain name

**Steps**:
1. Create new Expo project
2. Copy relevant code from both samples
3. Integrate name resolution into expense flow
4. Test with real .skr domains

### Exercise 2: Add Smart Contract

Enhance Settle with a smart contract:

**Goal**: Create an on-chain escrow for expense settlements

**Requirements**:
- Use Cause Pots' Anchor integration patterns
- Create escrow accounts for pending settlements
- Implement automatic settlement when all parties agree
- Add dispute resolution

**Steps**:
1. Study Cause Pots' program integration
2. Design escrow program
3. Integrate with Settle's UI
4. Test escrow flow

### Exercise 3: Build a Marketplace

Create a marketplace using patterns from all samples:

**Goal**: NFT marketplace with social features

**Requirements**:
- Wallet connection (all samples)
- Name service for user profiles (SKR)
- Escrow for sales (Cause Pots pattern)
- Transaction handling (Settle)

**Steps**:
1. Design marketplace architecture
2. Implement user profiles with .skr
3. Create listing and purchase flows
4. Add social features

## Testing Exercises

### Exercise 4: Add Tests

Add comprehensive tests to one of the samples:

**Goal**: Achieve 80%+ test coverage

**Requirements**:
- Unit tests for utilities
- Component tests for UI
- Integration tests for flows
- E2E tests for critical paths

**Steps**:
1. Set up testing framework (Jest, React Native Testing Library)
2. Write unit tests
3. Add component tests
4. Create integration tests
5. Implement E2E tests

### Exercise 5: Performance Optimization

Optimize one of the samples for performance:

**Goal**: Improve app performance metrics

**Requirements**:
- Reduce initial load time
- Optimize re-renders
- Improve transaction speed
- Reduce memory usage

**Steps**:
1. Profile current performance
2. Identify bottlenecks
3. Implement optimizations
4. Measure improvements

## Deployment Exercises

### Exercise 6: Publish to dApp Store

Take one of the samples through the full publishing process:

**Goal**: Successfully publish to Solana Mobile dApp Store

**Requirements**:
- Prepare production build
- Create metadata and assets
- Submit via CLI
- Handle review feedback

**Steps**:
1. Build release APK
2. Prepare metadata
3. Create screenshots
4. Submit via dApp Publishing CLI
5. Track submission status

### Exercise 7: CI/CD Pipeline

Create automated deployment for a sample:

**Goal**: Automated build and publish pipeline

**Requirements**:
- Automated builds on commits
- Automated testing
- Automated publishing
- Version management

**Steps**:
1. Set up GitHub Actions
2. Configure build automation
3. Add test automation
4. Implement publish automation

## Advanced Exercises

### Exercise 8: Add Advanced Features

Enhance a sample with advanced features:

**Options**:
- Add offline support
- Implement push notifications
- Add biometric authentication
- Create widget support
- Add deep linking

### Exercise 9: Multi-Chain Support

Extend a sample to support multiple chains:

**Goal**: Support Solana and another blockchain

**Requirements**:
- Abstract blockchain logic
- Support multiple wallet types
- Handle different transaction formats
- Unified UI

### Exercise 10: Production Hardening

Prepare a sample for production use:

**Goal**: Production-ready application

**Requirements**:
- Comprehensive error handling
- Security audit
- Performance optimization
- Accessibility compliance
- Analytics integration
- Crash reporting

## Learning Path

### Beginner Path

1. Start with **Settle**
   - Understand basic MWA integration
   - Learn transaction creation
   - Practice UI patterns

2. Move to **SKR Address Resolution**
   - Learn name service integration
   - Understand data fetching
   - Practice search UI

3. Study **Cause Pots**
   - Learn Anchor integration
   - Understand PDAs
   - Practice complex transactions

### Intermediate Path

1. Complete all comparative analysis exercises
2. Build integration projects
3. Add tests to samples
4. Optimize performance

### Advanced Path

1. Add advanced features
2. Implement multi-chain support
3. Production hardening
4. Publish to dApp Store

## Resources

### Sample Repositories

- **Settle**: https://github.com/solana-mobile/react-native-samples/tree/main/settle
- **SKR Address Resolution**: https://github.com/solana-mobile/react-native-samples/tree/main/skr-address-resolution
- **Cause Pots**: https://github.com/solana-mobile/react-native-samples/tree/main/cause-pots

### Documentation

- **Solana Mobile Docs**: https://docs.solanamobile.com
- **React Native**: https://reactnative.dev
- **Expo**: https://docs.expo.dev
- **Anchor**: https://www.anchor-lang.com

### Community

- **Discord**: https://discord.gg/solanamobile
- **GitHub Discussions**: https://github.com/solana-mobile/solana-mobile-stack-sdk/discussions
- **Twitter**: @solanamobile

## Tips for Success

1. **Start Simple**: Begin with Settle, the most beginner-friendly sample
2. **Read the Code**: Don't just run it, understand how it works
3. **Make Changes**: Modify samples to learn by doing
4. **Break Things**: Don't be afraid to experiment
5. **Ask Questions**: Use Discord for help
6. **Share Learning**: Document your journey
7. **Build Projects**: Apply learnings to your own ideas
8. **Test on Devices**: Always test on real Android devices
9. **Follow Patterns**: Learn and apply the patterns you see
10. **Stay Updated**: Samples are updated regularly

## Next Steps

After completing these exercises:

1. **Build Your Own**: Create your own mobile dApp
2. **Contribute**: Contribute improvements to samples
3. **Share**: Share your projects with the community
4. **Teach**: Help others learn from your experience
5. **Innovate**: Push the boundaries of mobile dApps

---

**Source**: Sample applications from https://github.com/solana-mobile/react-native-samples

Ready to build your own mobile dApp? Use these samples as inspiration and starting points!
