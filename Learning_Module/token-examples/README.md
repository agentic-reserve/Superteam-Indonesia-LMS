# Token Examples

> **✅ COMPLETE:** All 18 token example guides are now available! From beginner token creation to advanced Token-2022 extensions.

Welcome to the Token Examples module! This section provides complete, working examples of token programs on Solana, covering everything from basic token creation to advanced Token-2022 extensions.

## Overview

This module contains production-ready code examples demonstrating:

- **Token Creation**: Creating SPL tokens and NFTs
- **Token Operations**: Minting, transferring, and burning tokens
- **Advanced Patterns**: Escrow, swaps, fundraising, and delegation
- **Token-2022**: Next-generation token standard with extensions
- **Best Practices**: Security, testing, and deployment

## Prerequisites

Before starting, ensure you have:

- Completed [Basics - Tokens](../basics/03-tokens/README.md)
- Understanding of [Anchor Framework](../basics/05-anchor-framework/README.md)
- Rust and TypeScript knowledge
- Solana CLI and Anchor installed

## Module Structure

### Beginner Examples

#### 1. [Create Token](./01-create-token/README.md)
**Difficulty**: Beginner | **Time**: 1-2 hours

Learn how to create a new SPL token with metadata.

**What you'll build**:
- Token mint account
- Token metadata
- Initial supply

**Implementations**: Anchor, Native Rust

#### 2. [SPL Token Minter](./02-spl-token-minter/README.md)
**Difficulty**: Beginner | **Time**: 1-2 hours

Create and mint SPL tokens to associated token accounts.

**What you'll build**:
- Token creation
- Associated token accounts
- Minting functionality

**Implementations**: Anchor, Native Rust

#### 3. [Transfer Tokens](./03-transfer-tokens/README.md)
**Difficulty**: Beginner | **Time**: 1-2 hours

Transfer SPL tokens between accounts.

**What you'll build**:
- Token transfer logic
- Associated token account handling
- Balance verification

**Implementations**: Anchor, Native Rust

### Intermediate Examples

#### 4. [NFT Minter](./04-nft-minter/README.md)
**Difficulty**: Intermediate | **Time**: 2-3 hours

Create and mint NFTs with metadata.

**What you'll build**:
- NFT creation
- Metadata standards
- Collection management

**Implementations**: Anchor, Native Rust

#### 5. [NFT Operations](./05-nft-operations/README.md)
**Difficulty**: Intermediate | **Time**: 2-3 hours

Perform various operations on NFTs.

**What you'll build**:
- NFT transfers
- Metadata updates
- Burning NFTs

**Implementation**: Anchor

#### 6. [PDA Mint Authority](./06-pda-mint-authority/README.md)
**Difficulty**: Intermediate | **Time**: 2-3 hours

Use Program Derived Addresses as mint authorities.

**What you'll build**:
- PDA-controlled minting
- Secure token issuance
- Authority management

**Implementations**: Anchor, Native Rust

#### 7. [Token Escrow](./07-escrow/README.md)
**Difficulty**: Intermediate | **Time**: 3-4 hours

Implement a token escrow system.

**What you'll build**:
- Escrow account creation
- Token locking
- Conditional release

**Implementations**: Anchor, Native Rust

### Advanced Examples

#### 8. [Token Swap](./08-token-swap/README.md)
**Difficulty**: Advanced | **Time**: 3-4 hours

Build a simple token swap program.

**What you'll build**:
- Swap logic
- Liquidity pools
- Price calculations

**Implementation**: Anchor

#### 9. [Token Fundraiser](./09-token-fundraiser/README.md)
**Difficulty**: Advanced | **Time**: 3-4 hours

Create a token-based fundraising platform.

**What you'll build**:
- Fundraising campaigns
- Token distribution
- Goal tracking

**Implementation**: Anchor

#### 10. [External Delegate](./10-external-delegate/README.md)
**Difficulty**: Advanced | **Time**: 2-3 hours

Implement external token delegation.

**What you'll build**:
- Delegation logic
- Authority management
- Secure transfers

**Implementation**: Anchor

### Token-2022 Extensions

#### 11. [Token-2022 Basics](./11-token-2022-basics/README.md)
**Difficulty**: Intermediate | **Time**: 2-3 hours

Introduction to Token-2022 program.

**Topics**:
- Token-2022 overview
- Basic operations
- Migration from SPL Token

#### 12. [Transfer Fees](./12-transfer-fees/README.md)
**Difficulty**: Intermediate | **Time**: 2-3 hours

Implement transfer fees on tokens.

**What you'll build**:
- Fee configuration
- Fee collection
- Withdrawal mechanism

#### 13. [Transfer Hooks](./13-transfer-hooks/README.md)
**Difficulty**: Advanced | **Time**: 3-4 hours

Add custom logic to token transfers.

**What you'll build**:
- Hook program
- Transfer validation
- Custom transfer logic

#### 14. [Token Metadata](./14-metadata/README.md)
**Difficulty**: Intermediate | **Time**: 2-3 hours

Add onchain metadata to tokens.

**What you'll build**:
- Metadata extension
- Metadata updates
- Metadata queries

#### 15. [Interest-Bearing Tokens](./15-interest-bearing/README.md)
**Difficulty**: Advanced | **Time**: 2-3 hours

Create tokens that accrue interest.

**What you'll build**:
- Interest rate configuration
- Interest calculation
- Balance updates

#### 16. [Non-Transferable Tokens](./16-non-transferable/README.md)
**Difficulty**: Intermediate | **Time**: 1-2 hours

Create soulbound tokens.

**What you'll build**:
- Transfer restrictions
- Minting logic
- Use cases

#### 17. [Permanent Delegate](./17-permanent-delegate/README.md)
**Difficulty**: Intermediate | **Time**: 2-3 hours

Set permanent delegates for tokens.

**What you'll build**:
- Permanent delegation
- Authority management
- Recovery mechanisms

#### 18. [Additional Extensions](./18-additional-extensions/README.md)
**Difficulty**: Intermediate-Advanced | **Time**: 4-6 hours

Explore more Token-2022 extensions.

**Topics**:
- Default Account State
- Immutable Owner
- Memo Transfer
- CPI Guard
- Mint Close Authority
- Token Groups
- Multiple Extensions

## Learning Paths

### Path 1: Token Fundamentals (8-12 hours)
```
Create Token → SPL Token Minter → Transfer Tokens → NFT Minter
```

### Path 2: Advanced Token Programs (12-16 hours)
```
PDA Mint Authority → Token Escrow → Token Swap → Token Fundraiser
```

### Path 3: Token-2022 Mastery (15-20 hours)
```
Token-2022 Basics → Transfer Fees → Metadata → Transfer Hooks → 
Interest-Bearing → Additional Extensions
```

### Path 4: Complete Token Developer (30-40 hours)
Complete all examples in order for comprehensive token development knowledge.

## Quick Start

### 1. Clone Examples

```bash
# Clone the repository
git clone https://github.com/solana-developers/program-examples
cd program-examples/tokens
```

### 2. Choose an Example

```bash
# Navigate to an example
cd create-token/anchor

# Install dependencies
npm install

# Build the program
anchor build

# Run tests
anchor test
```

### 3. Deploy

```bash
# Deploy to devnet
anchor deploy --provider.cluster devnet
```

## Project Structure

Each example follows this structure:

```
example-name/
├── anchor/              # Anchor implementation
│   ├── programs/       # Rust program code
│   ├── tests/          # TypeScript tests
│   └── Anchor.toml     # Anchor configuration
├── native/             # Native Rust implementation (if available)
│   ├── src/           # Rust program code
│   └── Cargo.toml     # Cargo configuration
└── README.md          # Example documentation
```

## Code Quality

All examples include:

✅ **Complete Programs**: Fully functional, tested code
✅ **Tests**: Comprehensive test suites
✅ **Documentation**: Inline comments and README
✅ **Best Practices**: Security and optimization
✅ **Multiple Implementations**: Anchor and Native Rust where applicable

## Common Patterns

### Token Creation Pattern

```rust
// Anchor
#[derive(Accounts)]
pub struct CreateToken<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    
    #[account(
        init,
        payer = payer,
        mint::decimals = 9,
        mint::authority = payer,
    )]
    pub mint_account: Account<'info, Mint>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}
```

### Transfer Pattern

```rust
// Anchor
pub fn transfer_tokens(ctx: Context<TransferTokens>, amount: u64) -> Result<()> {
    let cpi_accounts = Transfer {
        from: ctx.accounts.sender_token_account.to_account_info(),
        to: ctx.accounts.recipient_token_account.to_account_info(),
        authority: ctx.accounts.sender.to_account_info(),
    };
    
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    
    token::transfer(cpi_ctx, amount)
}
```

### PDA Authority Pattern

```rust
// Using PDA as mint authority
let seeds = &[b"mint_authority", &[bump]];
let signer = &[&seeds[..]];

let cpi_accounts = MintTo {
    mint: ctx.accounts.mint.to_account_info(),
    to: ctx.accounts.token_account.to_account_info(),
    authority: ctx.accounts.mint_authority.to_account_info(),
};

let cpi_program = ctx.accounts.token_program.to_account_info();
let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);

token::mint_to(cpi_ctx, amount)
```

## Testing

All examples include tests:

```typescript
// Example test structure
describe("Token Example", () => {
  it("Creates a token", async () => {
    const tx = await program.methods
      .createToken(name, symbol, uri)
      .accounts({ /* accounts */ })
      .rpc();
    
    // Verify token was created
    const mintInfo = await getMint(connection, mintAddress);
    assert.equal(mintInfo.decimals, 9);
  });
  
  it("Mints tokens", async () => {
    const amount = new BN(1000);
    await program.methods
      .mintToken(amount)
      .accounts({ /* accounts */ })
      .rpc();
    
    // Verify balance
    const balance = await getAccount(connection, tokenAccount);
    assert.equal(balance.amount.toString(), amount.toString());
  });
});
```

## Security Considerations

### Always Verify

✅ **Account Ownership**: Check account owners
✅ **Authority**: Verify signer authority
✅ **Account Types**: Validate account types
✅ **Amounts**: Check for overflows
✅ **State**: Verify account state

### Common Vulnerabilities

❌ **Missing Checks**: Always validate inputs
❌ **Integer Overflow**: Use checked math
❌ **Unauthorized Access**: Verify authorities
❌ **Reentrancy**: Be aware of CPI risks
❌ **Account Confusion**: Validate account types

## Deployment Checklist

Before deploying to mainnet:

- [ ] All tests passing
- [ ] Security audit completed
- [ ] Error handling implemented
- [ ] Access controls verified
- [ ] Upgrade authority set correctly
- [ ] Documentation complete
- [ ] Monitoring setup
- [ ] Emergency procedures defined

## Additional Resources

- [SPL Token Documentation](https://spl.solana.com/token)
- [Token-2022 Documentation](https://spl.solana.com/token-2022)
- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Program Examples Repository](https://github.com/solana-developers/program-examples)

## Getting Help

If you get stuck:

1. Check the example's README
2. Review the test files for usage examples
3. Consult the [Solana Stack Exchange](https://solana.stackexchange.com/)
4. Join the [Solana Discord](https://discord.gg/solana)

## Contributing

Found an issue or want to improve an example?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Next Steps

After completing these examples:

- Build your own token project
- Explore [DeFi Examples](../defi/README.md)
- Study [Security Best Practices](../security/README.md)
- Create [Integration Projects](../integration/README.md)

---

**Ready to start?** Choose your learning path above and dive into [Create Token](./01-create-token/README.md)!

---

**Source Attribution**: Examples from [Solana Program Examples](https://github.com/solana-developers/program-examples)

**Last Updated**: February 17, 2026
