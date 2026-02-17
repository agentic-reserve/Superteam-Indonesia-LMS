# dApp Publishing

Learn how to publish your Solana mobile dApp to the Solana Mobile dApp Store. This section covers the publishing process, requirements, tooling, and best practices for distributing your mobile dApp to users.

## Overview

The Solana Mobile dApp Store is a decentralized app store specifically for Solana mobile applications. Unlike traditional app stores, it's built on Solana blockchain technology and provides a censorship-resistant platform for distributing mobile dApps.

Publishing to the Solana dApp Store involves preparing your app, creating metadata, submitting through the dApp Publishing CLI, and managing updates. This section guides you through the entire process.

## What You'll Learn

In this section, you will learn:

- **dApp Store Overview**: Understand the Solana Mobile dApp Store architecture
- **Publishing Requirements**: Learn what's needed to publish your dApp
- **CLI Tooling**: Use the dApp Publishing CLI for submissions
- **Metadata Preparation**: Create proper app metadata and assets
- **Submission Process**: Submit your dApp for publication
- **Update Management**: Manage app updates and versions
- **Best Practices**: Follow guidelines for successful publication

## Prerequisites

Before starting this section, you should:

- Have a completed mobile dApp (from previous sections)
- Complete [Scaffolding & Templates](../05-scaffolding-templates/README.md)
- Have a production-ready APK or AAB file
- Understand Android app signing and release builds
- Have a Solana wallet with SOL for transaction fees

## Learning Objectives

By the end of this section, you will be able to:

1. Understand the Solana dApp Store architecture
2. Prepare your dApp for publication
3. Install and use the dApp Publishing CLI
4. Create required metadata and assets
5. Submit your dApp to the store
6. Manage app updates and versions
7. Follow dApp Store guidelines and best practices

## Solana Mobile dApp Store

### What Makes It Different?

**Decentralized**:
- Built on Solana blockchain
- No central authority controlling listings
- Censorship-resistant

**Developer-Friendly**:
- Lower fees than traditional app stores
- Direct relationship with users
- Faster approval process

**Solana-Native**:
- Optimized for Solana dApps
- Integrated with Mobile Wallet Adapter
- Supports Solana Pay and other SMS features

### Store Features

- **App Discovery**: Browse and search for Solana dApps
- **Direct Downloads**: Install apps directly from the store
- **Update Management**: Automatic update notifications
- **Ratings & Reviews**: Community feedback system
- **Categories**: Organized by dApp type (DeFi, NFT, Gaming, etc.)

## Publishing Requirements

### Technical Requirements

1. **Android APK/AAB**
   - Signed release build
   - Target Android API level 33+
   - Minimum API level 23+

2. **Mobile Wallet Adapter**
   - Must integrate MWA for wallet connections
   - Follow MWA best practices

3. **App Signing**
   - Properly signed with release keystore
   - Consistent signing for updates

4. **Permissions**
   - Minimal required permissions
   - Clear permission justifications

### Content Requirements

1. **App Metadata**
   - App name (max 30 characters)
   - Short description (max 80 characters)
   - Full description (max 4000 characters)
   - Category
   - Website URL
   - Support email

2. **Visual Assets**
   - App icon (512x512 PNG)
   - Feature graphic (1024x500 PNG)
   - Screenshots (at least 2, max 8)
   - Optional: Video preview

3. **Legal**
   - Privacy policy URL
   - Terms of service URL
   - Content rating

## dApp Publishing CLI

### Installation

The dApp Publishing CLI is a Node.js tool for managing submissions.

**Prerequisites**:
- Node.js 18 or greater
- pnpm package manager

**Setup pnpm**:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

**Install CLI**:

```bash
mkdir publishing
cd publishing

pnpm init
pnpm install --save-dev @solana-mobile/dapp-store-cli
npx dapp-store init
```

### CLI Commands

**Initialize configuration**:
```bash
npx dapp-store init
```

**Validate app package**:
```bash
npx dapp-store validate --app path/to/app.apk
```

**Create submission**:
```bash
npx dapp-store publish create
```

**Update submission**:
```bash
npx dapp-store publish update
```

**Check submission status**:
```bash
npx dapp-store publish status
```

**Get help**:
```bash
npx dapp-store --help
```

## Publishing Process

### Step 1: Prepare Your App

**Build release APK**:

For React Native:
```bash
cd android
./gradlew assembleRelease
```

For Expo:
```bash
eas build --platform android --profile production
```

**Sign your app**:

```bash
jarsigner -verbose -sigalg SHA256withRSA \
  -digestalg SHA-256 \
  -keystore my-release-key.keystore \
  app-release-unsigned.apk \
  my-key-alias
```

**Optimize APK**:

```bash
zipalign -v 4 app-release-unsigned.apk app-release.apk
```

### Step 2: Prepare Metadata

Create a `metadata` directory with required files:

```
publishing/
├── metadata/
│   ├── icon.png              # 512x512
│   ├── feature_graphic.png   # 1024x500
│   ├── screenshots/
│   │   ├── screenshot1.png
│   │   ├── screenshot2.png
│   │   └── ...
│   ├── description.txt       # Full description
│   ├── short_description.txt # 80 char max
│   └── metadata.json         # App metadata
└── app-release.apk
```

**metadata.json example**:

```json
{
  "name": "My Solana dApp",
  "package": "com.example.myapp",
  "version": "1.0.0",
  "versionCode": 1,
  "category": "defi",
  "website": "https://myapp.com",
  "support_email": "support@myapp.com",
  "privacy_policy": "https://myapp.com/privacy",
  "terms_of_service": "https://myapp.com/terms",
  "license": "MIT"
}
```

### Step 3: Initialize CLI

```bash
npx dapp-store init
```

This creates a configuration file `.dapp-store/config.json`:

```json
{
  "publisher": {
    "name": "Your Name",
    "email": "your@email.com",
    "wallet": "YourSolanaWalletAddress"
  },
  "network": "mainnet-beta",
  "rpc_url": "https://api.mainnet-beta.solana.com"
}
```

### Step 4: Validate Your App

```bash
npx dapp-store validate \
  --app app-release.apk \
  --metadata metadata/
```

The CLI will check:
- APK signature validity
- Required metadata presence
- Image dimensions and formats
- Description lengths
- Package name format

### Step 5: Create Submission

```bash
npx dapp-store publish create \
  --app app-release.apk \
  --metadata metadata/ \
  --wallet ~/.config/solana/id.json
```

This will:
1. Upload app and metadata to IPFS
2. Create on-chain submission transaction
3. Pay submission fee (small amount of SOL)
4. Return submission ID

**Example output**:
```
✓ Validating app package
✓ Uploading to IPFS
✓ Creating on-chain submission
✓ Submission created successfully

Submission ID: abc123def456
Transaction: https://explorer.solana.com/tx/...
Status: pending_review

Track your submission:
npx dapp-store publish status --id abc123def456
```

### Step 6: Track Submission

```bash
npx dapp-store publish status --id abc123def456
```

**Possible statuses**:
- `pending_review`: Awaiting review
- `approved`: Approved and live
- `rejected`: Rejected (with reason)
- `changes_requested`: Needs modifications

### Step 7: Publish Updates

When you have a new version:

```bash
# Build new version
./gradlew assembleRelease

# Update metadata.json with new version
# version: "1.1.0"
# versionCode: 2

# Submit update
npx dapp-store publish update \
  --id abc123def456 \
  --app app-release-v1.1.apk \
  --metadata metadata/ \
  --wallet ~/.config/solana/id.json
```

## Metadata Best Practices

### App Name

- Keep it short and memorable (max 30 chars)
- Use proper capitalization
- Avoid special characters
- Make it searchable

**Good**: "Solana Wallet", "DeFi Trader", "NFT Gallery"
**Bad**: "my_app", "BEST APP EVER!!!", "App123"

### Short Description

- 80 characters maximum
- Highlight key feature or value proposition
- No marketing fluff

**Good**: "Fast and secure Solana wallet with built-in swap"
**Bad**: "The best most amazing wallet you'll ever use!!!"

### Full Description

- Clear and concise (max 4000 chars)
- Explain what your dApp does
- List key features
- Mention Solana integration
- Include usage instructions

**Structure**:
```
[Brief overview]

Key Features:
• Feature 1
• Feature 2
• Feature 3

How to Use:
1. Step 1
2. Step 2
3. Step 3

About:
[More details about your dApp]

Support:
[Contact information]
```

### Screenshots

- Minimum 2, maximum 8
- Show actual app functionality
- Use real data (not lorem ipsum)
- Highlight key features
- Portrait orientation preferred
- High quality (1080x1920 or higher)

**Tips**:
- First screenshot is most important
- Show the main screen first
- Demonstrate key workflows
- Use device frames for polish
- Add captions if helpful

### App Icon

- 512x512 PNG
- Transparent background or solid color
- Simple and recognizable
- Follows Material Design guidelines
- Scales well to small sizes

**Avoid**:
- Text in icon (hard to read when small)
- Too much detail
- Low contrast
- Copyrighted imagery

### Feature Graphic

- 1024x500 PNG
- Showcases your app
- Can include text/branding
- High quality and professional

## Categories

Choose the most appropriate category:

- **DeFi**: Decentralized finance apps (DEXs, lending, yield)
- **NFT**: NFT marketplaces, galleries, minting
- **Gaming**: Blockchain games
- **Social**: Social networks, messaging
- **Wallet**: Wallet applications
- **Tools**: Developer tools, utilities
- **Education**: Learning and educational apps
- **Entertainment**: Media, content apps
- **Productivity**: Task management, organization
- **Other**: Apps that don't fit other categories

## Review Process

### What Reviewers Check

1. **Functionality**
   - App installs and runs
   - No crashes on launch
   - Core features work

2. **MWA Integration**
   - Properly implements Mobile Wallet Adapter
   - Handles wallet connection correctly
   - Transaction signing works

3. **Content**
   - Metadata is accurate
   - Screenshots match app
   - No misleading information

4. **Security**
   - No obvious security issues
   - Proper permission usage
   - Secure communication

5. **Guidelines**
   - Follows dApp Store guidelines
   - Appropriate content
   - No policy violations

### Review Timeline

- **Initial review**: 3-7 days
- **Updates**: 1-3 days
- **Resubmissions**: 2-5 days

### Common Rejection Reasons

1. **Technical Issues**
   - App crashes on launch
   - MWA integration broken
   - Missing required features

2. **Metadata Issues**
   - Misleading descriptions
   - Low-quality screenshots
   - Missing required information

3. **Policy Violations**
   - Inappropriate content
   - Scam or fraudulent app
   - Copyright infringement

4. **Security Concerns**
   - Obvious vulnerabilities
   - Suspicious permissions
   - Malicious behavior

## Update Management

### Version Numbering

Follow semantic versioning:

```
MAJOR.MINOR.PATCH

1.0.0 → Initial release
1.0.1 → Bug fix
1.1.0 → New features
2.0.0 → Breaking changes
```

**versionCode**: Integer that increments with each release

```
1.0.0 → versionCode: 1
1.0.1 → versionCode: 2
1.1.0 → versionCode: 3
2.0.0 → versionCode: 4
```

### Update Types

**Patch Updates** (1.0.0 → 1.0.1):
- Bug fixes
- Performance improvements
- Minor UI tweaks
- Fast review

**Minor Updates** (1.0.0 → 1.1.0):
- New features
- Significant improvements
- UI changes
- Standard review

**Major Updates** (1.0.0 → 2.0.0):
- Breaking changes
- Complete redesigns
- New architecture
- Thorough review

### Update Best Practices

1. **Test Thoroughly**: Test updates before submission
2. **Clear Changelog**: Document what changed
3. **Backward Compatibility**: Maintain compatibility when possible
4. **Staged Rollout**: Consider gradual rollout for major updates
5. **Monitor Feedback**: Watch for issues after update

## Fees and Costs

### Submission Fees

- **Initial submission**: Small SOL fee (varies)
- **Updates**: Minimal or no fee
- **Transaction fees**: Standard Solana network fees

### Storage Costs

- **IPFS hosting**: Included in submission fee
- **Metadata storage**: On-chain (minimal cost)

## Analytics and Monitoring

### Track Performance

- **Downloads**: Monitor install numbers
- **Ratings**: Track user ratings
- **Reviews**: Read and respond to reviews
- **Crashes**: Monitor crash reports
- **Updates**: Track update adoption

### User Feedback

- Respond to reviews professionally
- Address common issues
- Use feedback for improvements
- Build community

## Best Practices Summary

1. **Quality First**: Polish your app before submission
2. **Clear Metadata**: Write clear, accurate descriptions
3. **Great Screenshots**: Show your app at its best
4. **Test Thoroughly**: Test on multiple devices
5. **Follow Guidelines**: Adhere to all requirements
6. **Update Regularly**: Keep your app current
7. **Engage Users**: Respond to feedback
8. **Monitor Performance**: Track metrics and issues
9. **Security Focus**: Prioritize user security
10. **Community Building**: Build a user community

## Troubleshooting

**Issue**: Validation fails with "Invalid APK signature"

**Solution**: Ensure APK is properly signed with release keystore:
```bash
jarsigner -verify -verbose -certs app-release.apk
```

**Issue**: "Metadata validation failed"

**Solution**: Check all required files are present and properly formatted:
```bash
npx dapp-store validate --metadata metadata/
```

**Issue**: Upload fails

**Solution**: Check network connection and try again. Ensure IPFS gateway is accessible.

**Issue**: Transaction fails

**Solution**: Ensure wallet has sufficient SOL for transaction fees.

## Advanced Topics

### Custom IPFS Gateway

```json
{
  "ipfs": {
    "gateway": "https://your-ipfs-gateway.com",
    "api": "https://your-ipfs-api.com"
  }
}
```

### Automated Publishing

Create a CI/CD pipeline for automated publishing:

```yaml
# .github/workflows/publish.yml
name: Publish to dApp Store

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build release APK
        run: |
          cd android
          ./gradlew assembleRelease
      
      - name: Publish to dApp Store
        env:
          WALLET_PRIVATE_KEY: ${{ secrets.WALLET_PRIVATE_KEY }}
        run: |
          npx dapp-store publish create \
            --app android/app/build/outputs/apk/release/app-release.apk \
            --metadata metadata/ \
            --wallet-key $WALLET_PRIVATE_KEY
```

### Multi-Language Support

Provide metadata in multiple languages:

```
metadata/
├── en/
│   ├── description.txt
│   └── short_description.txt
├── es/
│   ├── description.txt
│   └── short_description.txt
└── ...
```

## Next Steps

After publishing your dApp:

1. **Monitor Performance**: Track downloads and user feedback
2. **Iterate**: Improve based on user feedback
3. **Market**: Promote your dApp to the community
4. **Support**: Provide excellent user support
5. **Update**: Regular updates with new features

## Additional Resources

- **dApp Publishing CLI**: https://github.com/solana-mobile/dapp-publishing
- **Documentation**: https://docs.solanamobile.com/dapp-publishing/intro
- **dApp Store**: https://solanamobile.com/dapp-store
- **Guidelines**: https://docs.solanamobile.com/dapp-publishing/guidelines
- **Support**: https://discord.gg/solanamobile

## Exercises

Practice publishing in [exercises/07-dapp-publishing.md](../exercises/07-dapp-publishing.md)

---

**Source**: Adapted from Solana Mobile dApp Publishing documentation at https://docs.solanamobile.com/dapp-publishing/intro and https://github.com/solana-mobile/dapp-publishing

Congratulations on completing the Mobile Development topic area! Explore [Integration Projects](../../integration/README.md) to see complete mobile dApp examples.
