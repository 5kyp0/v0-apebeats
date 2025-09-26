# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2025-09-26
### Added
- Smart wallet social/email login using Thirdweb in-app wallet with code verification
- Wallet login via preferred injected wallets (Glyph, Rabby, MetaMask, Rainbow) and WalletConnect
- First-time smart wallet deployment (ERC-4337) on connect
- Live ApeChain onchain data under the player (block number and gas price)
- Header connect/disconnect component with email display
- React Query provider and data fetching scaffold
- Comprehensive login UI at `/login` with multiple wallet options
- User profile dropdown with wallet management
- Real-time ApeChain metrics integration

### Technical
- Thirdweb v5 SDK integration with custom chain configuration
- ApeChain RPC integration via Alchemy API
- Smart wallet deployment automation
- Rate-limited data fetching to stay within API limits
- TypeScript support throughout the application

### Documentation
- Updated README with comprehensive setup instructions
- Added environment variable documentation
- Included troubleshooting guide
- Added changelog for version tracking

## [0.1.0] - 2025-09-25
### Added
- Initial project scaffolding with Next.js App Router
- TailwindCSS styling framework
- Basic Thirdweb setup and configuration
