# Advanced Topics Exercises

Welcome to the Advanced Topics exercises! These hands-on exercises will help you practice building with Ephemeral Rollups, Session Keys, Verifiable Randomness, and Private Rollups.

## Exercise Structure

Each exercise includes:
- **Objective**: What you'll build
- **Difficulty**: Beginner, Intermediate, or Advanced
- **Estimated Time**: How long it should take
- **Prerequisites**: What you need to know
- **Requirements**: What your solution must include
- **Validation**: How to test your solution
- **Hints**: Tips to help you succeed

## Exercises

### 1. [ER Counter](./counter-er.md)
**Difficulty**: Beginner  
**Time**: 1-2 hours  
**Topics**: Ephemeral Rollups, Delegation

Build a counter that can be delegated to an ER for high-speed increments.

### 2. [Dice Game with VRF](./dice-game.md)
**Difficulty**: Intermediate  
**Time**: 2-3 hours  
**Topics**: Verifiable Randomness, Game Logic

Create a fair dice game using VRF for provably random outcomes.

### 3. [Session Keys Integration](./session-keys-integration.md)
**Difficulty**: Intermediate  
**Time**: 2-3 hours  
**Topics**: Session Keys, User Experience

Implement wallet-less interactions using Session Keys.

### 4. [Private Payment System](./private-payment.md)
**Difficulty**: Advanced  
**Time**: 3-4 hours  
**Topics**: Private Rollups, Access Control

Build a confidential payment system with PERs.

## Getting Started

### Setup

1. **Install Dependencies**:
```bash
npm install -g @coral-xyz/anchor
npm install -g @magicblock-labs/cli
```

2. **Start Local Environment**:
```bash
# Start local validator
solana-test-validator

# Start MagicBlock engine (in another terminal)
magicblock-engine start
```

3. **Create Project**:
```bash
anchor init my-advanced-project
cd my-advanced-project
```

### Testing Your Solutions

```bash
# Run tests
anchor test

# Run specific test
anchor test --skip-local-validator -- --test test_name
```

## Validation Criteria

Your solutions will be evaluated on:

1. **Functionality**: Does it work as specified?
2. **Security**: Are there vulnerabilities?
3. **Code Quality**: Is it well-organized and documented?
4. **Best Practices**: Does it follow Solana/MagicBlock patterns?
5. **Testing**: Are there comprehensive tests?

## Submission Guidelines

For each exercise:

1. Complete the implementation
2. Write comprehensive tests
3. Document your code
4. Test thoroughly
5. Review the solution (if provided)

## Additional Challenges

Once you complete the main exercises, try these challenges:

### Challenge 1: Real-Time Chat
Build a chat application using ERs and Session Keys for instant, wallet-less messaging.

### Challenge 2: NFT Lottery
Create an NFT lottery system using VRF for fair winner selection.

### Challenge 3: Private Auction
Implement a sealed-bid auction using Private Rollups.

### Challenge 4: Gaming Platform
Build a complete gaming platform combining all advanced topics.

## Resources

- [Ephemeral Rollups Guide](../01-ephemeral-rollups/README.md)
- [Session Keys Guide](../02-session-keys/README.md)
- [VRF Guide](../03-verifiable-randomness/README.md)
- [Private Rollups Guide](../04-private-rollups/README.md)
- [MagicBlock Documentation](https://docs.magicblock.gg/)
- [MagicBlock Discord](https://discord.gg/magicblock)

## Getting Help

If you're stuck:

1. Review the relevant guide
2. Check the hints in each exercise
3. Look at MagicBlock examples
4. Ask in the MagicBlock Discord
5. Review Solana documentation

## Tips for Success

1. **Start Simple**: Begin with the beginner exercise
2. **Test Often**: Write tests as you code
3. **Read Docs**: Reference the guides frequently
4. **Ask Questions**: Don't hesitate to seek help
5. **Experiment**: Try different approaches
6. **Review Solutions**: Learn from provided solutions

---

**Ready to start?** Choose an exercise and begin building!

**Last Updated**: February 17, 2026
