# ApeBeats — Sonic Swamp Hub

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/yancastet-9701s-projects/v0-ape-beat-landing-page)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/XGCNimLcz9k)
[![Test Coverage](https://img.shields.io/badge/Test%20Coverage-70%25-brightgreen?style=for-the-badge)](https://github.com/your-username/apebeats)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)

## Overview

A Next.js app that integrates Thirdweb for:

- Social login (email + OAuth via in-app wallet)
- Preferred wallets: Glyph, Rabby, MetaMask, Rainbow (+ WalletConnect)
- First-time smart wallet deployment (ERC-4337) on connect
- Live ApeChain onchain data under the music player (block and gas price)
- **NEW**: Comprehensive testing suite with 70% coverage
- **NEW**: Enhanced error handling and loading states
- **NEW**: Video preview generation for Genesis NFTs
- **NEW**: Optimized performance and build configuration

## Tech

- Next.js 14.2.16 App Router
- TypeScript
- TailwindCSS
- thirdweb v5 SDK
- React Query
- **NEW**: Jest + React Testing Library
- **NEW**: Error Boundaries & Loading States
- **NEW**: Video Processing & Preview Generation
- **NEW**: Performance Optimizations

## Quickstart

- Prerequisites
  - Node 18+
  - pnpm
  - Thirdweb account (`https://thirdweb.com`) to create a client id
  - ApeChain RPC and chain id

- Install
```
pnpm install
```

- Configure env (see next section)

- Dev
```
pnpm dev
```

- Build
```
pnpm build && pnpm start
```

- Test
```
pnpm test                    # Run all tests
pnpm run test:coverage      # Run with coverage report
pnpm run test:watch         # Watch mode for development
```

## Environment Variables
Create a `.env.local` at the repo root with:
```bash
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_APECHAIN_CHAIN_ID=33139
```

### Required Environment Variables

#### NEXT_PUBLIC_THIRDWEB_CLIENT_ID
- **What**: Public client id for Thirdweb client
- **Where to get**:
  1. Go to [Thirdweb Dashboard](https://thirdweb.com/dashboard) → Settings → API Keys
  2. Create a "Client ID" (not secret key) and copy its value
- **Used in**: `lib/thirdweb.ts` to initialize `createThirdwebClient`
- **Example**: `NEXT_PUBLIC_THIRDWEB_CLIENT_ID=abc123def456...`

#### NEXT_PUBLIC_ALCHEMY_API_KEY
- **What**: Alchemy API key for ApeChain RPC access
- **Where to get**:
  1. Go to [Alchemy Dashboard](https://dashboard.alchemy.com)
  2. Create a new app → Select "ApeChain" network
  3. Copy the API key from the app details
- **Used in**: Construct ApeChain RPC URL: `https://apechain-mainnet.g.alchemy.com/v2/{API_KEY}`
- **Example**: `NEXT_PUBLIC_ALCHEMY_API_KEY=alcht_abc123...`

#### NEXT_PUBLIC_APECHAIN_CHAIN_ID
- **What**: ApeChain mainnet chain ID
- **Value**: `33139` (ApeChain mainnet)
- **Used in**: `lib/thirdweb.ts` with `defineChain`
- **Example**: `NEXT_PUBLIC_APECHAIN_CHAIN_ID=33139`

> **Tip**: If you fork this repo, generate your own Thirdweb Client ID and Alchemy key.

## Network Setup

This application is configured to use **ApeChain** as the default network. The app will automatically prompt users to switch to ApeChain if they're connected to a different network.

### Network Features
- 🔄 **Automatic Network Detection**: Detects when users are on the wrong network
- 🚀 **One-Click Network Switching**: Users can switch to ApeChain with a single click
- 📱 **Network Status Indicators**: Real-time network status updates
- ✅ **Supported Wallets**: MetaMask, Rabby, Rainbow, WalletConnect, Glyph, and in-app wallets

### ApeChain Configuration
```typescript
// Chain ID: 33139 (ApeChain Mainnet)
// RPC URL: https://apechain-mainnet.g.alchemy.com/v2/{API_KEY}
// Native Currency: APE (18 decimals)
// Block Explorer: https://explorer.apechain.com
```

See `NETWORK_SETUP.md` for detailed network configuration and troubleshooting.

## What's Implemented

### Core Features
- Thirdweb provider in `app/layout.tsx` using `thirdwebClient`
- Chain config in `lib/thirdweb.ts` via `defineChain`
- Preferred wallets list in `lib/thirdweb.ts` (Glyph, Rabby, MetaMask, Rainbow; WalletConnect and in-app wallet)
- Login UI at `app/login/page.tsx`:
  - Email code flow using `preAuthenticate` and `inAppWallet`
  - Connect buttons: Glyph, Rabby, MetaMask, Rainbow, WalletConnect
  - Smart wallet deployment on first connect via `deploySmartAccount`
- Header short connect/disconnect in `components/HeaderUser.tsx`
- Live ApeChain data in `app/page.tsx` powered by `fetchApeChainStats` from `lib/utils.ts`

### **NEW**: Enhanced Features
- **Error Handling**: Comprehensive error boundaries in `components/ErrorBoundary.tsx`
- **Loading States**: Optimized loading components in `components/LoadingStates.tsx`
- **Video Processing**: Genesis NFT video preview generation in `lib/videoUtils.ts` and `lib/useVideoPreviews.ts`
- **Performance**: Lazy loading, optimized animations, and reduced bundle size
- **Testing**: Complete test suite with unit, integration, and E2E tests
- **Network Switching**: Dynamic network detection and switching in `components/NetworkSwitcher.tsx`

## How wallet login works

- Social login (email)
  - Enter email → receive verification code → verify
  - On success, connects an in-app wallet scoped to this app
  - First-time connect triggers smart wallet deployment (no-op afterward)

- Wallet connect
  - Buttons use `thirdweb/wallets` to connect installed wallets by their rdns:
    - Glyph (`app.glyph`)
    - Rabby (`io.rabby`)
    - MetaMask (`io.metamask`)
    - Rainbow (`me.rainbow`)
  - WalletConnect button for mobile/other clients

- Notes
  - Injected wallets buttons work when the extension is installed. Otherwise, use WalletConnect.
  - Smart wallet deployment uses Thirdweb's managed account infra; this may perform a dummy transaction the first time.

## ApeChain data under the player

- We fetch via Alchemy ApeChain API through Thirdweb RPC client:
  - `eth_blockNumber` → displayed as BLOCK
  - `eth_gasPrice` → displayed as GAS in gwei
- **Rate Limiting**: Updates every 30 seconds to stay within Alchemy free tier limits
  - Free tier: 100M compute units/month, 25 RPS
  - Each request: ~10 CUs (eth_blockNumber) + ~10 CUs (eth_gasPrice) = 20 CUs
  - 30-second intervals = ~86,400 requests/month = ~1.7M CUs/month (well within limits)
- `TXN/MIN` is currently shown as "-" placeholder. To enable it:
  - Poll latest block number every N seconds
  - Fetch block details for the latest and previous block(s)
  - Derive tx/min from tx count and expected block time
  - Or integrate a subgraph/indexer that provides a rolling tx rate

## Testing

The project includes a comprehensive testing suite with 70% coverage:

### Test Structure
```
__tests__/
├── components/          # Component unit tests
│   ├── ErrorBoundary.test.tsx
│   └── LoadingStates.test.tsx
├── lib/                # Utility function tests
│   ├── utils.test.ts
│   ├── videoUtils.test.ts
│   └── useVideoPreviews.test.tsx
├── integration/        # Integration tests
│   └── walletConnection.test.tsx
└── e2e/               # End-to-end tests
    └── criticalUserFlows.test.tsx
```

### Test Types
- **Unit Tests**: Individual components and utilities
- **Integration Tests**: Wallet connections and API integrations
- **E2E Tests**: Complete user workflows and critical paths

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode for development
npm run test:watch

# Run specific test file
npm test -- ErrorBoundary.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="wallet"
```

### Test Configuration
- **Jest**: Next.js integrated testing setup with proper module transformation
- **React Testing Library**: Component testing with user-centric approach
- **Mocking**: Comprehensive mocking for thirdweb, navigation, and browser APIs
- **BigInt Support**: Proper handling of blockchain data types
- **ESM Support**: Modern module system compatibility
- **Coverage**: 70% minimum threshold maintained

### Test Examples
```bash
# Test wallet connection flow
npm test -- walletConnection.test.tsx

# Test error handling
npm test -- ErrorBoundary.test.tsx

# Test video processing
npm test -- videoUtils.test.ts

# Run integration tests only
npm test -- --testPathPattern="integration"
```

See `TESTING.md` for detailed testing documentation, best practices, and troubleshooting.

## Deployment tips

- Vercel
  - Add env vars in Project Settings → Environment Variables
  - Redeploy

- Security
  - Never commit secret keys. Only the Thirdweb client id is public.
  - RPC URLs can be public if rate-limited; consider private RPCs for production.

## Troubleshooting

### Network Issues
- **Seeing "-" for all ApeChain stats**
  - Check `NEXT_PUBLIC_ALCHEMY_API_KEY` and `NEXT_PUBLIC_APECHAIN_CHAIN_ID`
  - Verify the RPC is reachable: `https://apechain-mainnet.g.alchemy.com/v2/{API_KEY}`
  - Test RPC connection: `curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' https://apechain-mainnet.g.alchemy.com/v2/{API_KEY}`

- **Network switching not working**
  - Ensure wallet is connected and unlocked
  - Check if ApeChain is added to wallet (Chain ID: 33139)
  - Try refreshing the page and reconnecting wallet
  - See `NETWORK_SETUP.md` for detailed network troubleshooting

### Wallet Issues
- **Wallet buttons do nothing**
  - Ensure the browser wallet is installed (MetaMask, Rabby, Rainbow, Glyph)
  - Try WalletConnect (mobile) as fallback
  - Check browser console for wallet connection errors
  - Ensure wallet is unlocked and on the correct network

- **Email code not received**
  - Confirm the email address and check spam folder
  - Re-trigger "Send Code" button
  - Check browser console for email service errors
  - Verify Thirdweb client ID is correct

- **Smart wallet not deploying**
  - It's a no-op if already deployed; otherwise, ensure RPC and client id are valid
  - Check browser console for detailed errors
  - Verify you have sufficient APE tokens for gas fees
  - Ensure network is set to ApeChain (Chain ID: 33139)

### Testing Issues
- **Tests failing**
  - Run `npm test` to see specific error messages
  - Check `TESTING.md` for troubleshooting guide
  - Ensure all dependencies are installed: `pnpm install`
  - Clear Jest cache: `npm test -- --clearCache`
  - Check for BigInt serialization issues in blockchain data tests

- **Test coverage below 70%**
  - Run `npm run test:coverage` to see coverage report
  - Add tests for uncovered components and utilities
  - Check `TESTING.md` for testing best practices

### Build Issues
- **Build failures**
  - Clear `.next` folder and rebuild: `rm -rf .next && pnpm build`
  - Check TypeScript errors: `npx tsc --noEmit`
  - Verify environment variables are set correctly
  - Check for missing dependencies: `pnpm install`

- **Production build issues**
  - Ensure all environment variables are set
  - Check for client-side only code in server components
  - Verify all imports are correct and dependencies are installed

### Performance Issues
- **Slow loading**
  - Check network tab for failed requests
  - Verify video previews are loading correctly
  - Check for memory leaks in browser dev tools
  - Ensure lazy loading is working properly

- **Video preview issues**
  - Check if video URLs are accessible
  - Verify canvas-based frame extraction is working
  - Check browser console for video loading errors
  - Ensure fallback images are displaying correctly

## Project Structure

```
v0-apebeats/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Main landing page
│   └── login/             # Login page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── ErrorBoundary.tsx # Error handling
│   ├── LoadingStates.tsx # Loading components
│   └── NetworkSwitcher.tsx # Network detection
├── lib/                  # Utilities and services
│   ├── thirdweb.ts       # Thirdweb configuration
│   ├── utils.ts          # General utilities
│   ├── videoUtils.ts     # Video processing
│   └── useVideoPreviews.ts # Video preview hook
├── __tests__/            # Test suite
│   ├── components/       # Component tests
│   ├── lib/             # Utility tests
│   ├── integration/     # Integration tests
│   └── e2e/            # End-to-end tests
├── public/              # Static assets
├── styles/              # Global styles
└── docs/               # Documentation
    ├── README.md       # This file
    ├── TESTING.md      # Testing guide
    └── CHANGELOG.md    # Release notes
```

## Key Files

### Core Application
- `app/layout.tsx` — Thirdweb provider wrapper with error boundaries
- `lib/thirdweb.ts` — Thirdweb client, ApeChain config, preferred wallets
- `app/login/page.tsx` — Social + wallet login UI and smart wallet deployment
- `components/HeaderUser.tsx` — Quick connect/disconnect and email display
- `app/page.tsx` — Landing page with live ApeChain metrics and Genesis previews
- `lib/utils.ts` — `fetchApeChainStats` via Thirdweb RPC

### **NEW**: Enhanced Components
- `components/ErrorBoundary.tsx` — Comprehensive error handling
- `components/LoadingStates.tsx` — Optimized loading components
- `components/NetworkSwitcher.tsx` — Dynamic network detection
- `components/GlyphProvider.tsx` — Glyph wallet integration
- `components/WalletIcons.tsx` — Wallet icon components

### **NEW**: Video & Performance
- `lib/videoUtils.ts` — Video processing and preview generation
- `lib/useVideoPreviews.ts` — React hook for video preview management
- `lib/walletService.ts` — Wallet service utilities
- `lib/wagmi.ts` — Wagmi configuration

### **NEW**: Testing
- `__tests__/` — Complete test suite
- `jest.config.js` — Jest configuration with Next.js integration
- `jest.setup.js` — Test environment setup and mocks
- `TESTING.md` — Comprehensive testing documentation

## Recent Improvements

### v0.2.1 - Testing & Performance Update
- ✅ **Testing Suite**: Added comprehensive Jest + React Testing Library setup
- ✅ **Error Handling**: Implemented error boundaries and graceful error recovery
- ✅ **Loading States**: Optimized loading components with skeletons
- ✅ **Video Processing**: Genesis NFT video preview generation system
- ✅ **Performance**: Lazy loading, optimized animations, reduced bundle size
- ✅ **Build Optimization**: Enhanced Next.js configuration and build process
- ✅ **Network Detection**: Dynamic network switching and detection
- ✅ **Code Quality**: ESLint configuration and TypeScript improvements

### Build Status
- ✅ **Production Build**: Working perfectly with optimized output
- ✅ **Test Coverage**: 70% minimum threshold maintained
- ✅ **Performance**: Optimized for Core Web Vitals
- ✅ **Accessibility**: Enhanced ARIA labels and keyboard navigation

## Contributing

### Development Setup
1. **Fork the repository** on GitHub
2. **Clone your fork**: `git clone <your-fork-url>`
3. **Install dependencies**: `pnpm install`
4. **Set up environment variables** (see Environment Variables section above)
5. **Run development server**: `pnpm dev`
6. **Run tests**: `pnpm test`

### Development Workflow
```bash
# 1. Start development server
pnpm dev

# 2. Run tests in watch mode (in another terminal)
pnpm run test:watch

# 3. Check code quality
pnpm run lint

# 4. Build for production
pnpm build

# 5. Run full test suite
pnpm test
```

### Environment Setup Checklist
- [ ] Node.js 18+ installed
- [ ] pnpm package manager installed
- [ ] Thirdweb Client ID obtained and set
- [ ] Alchemy API key obtained and set
- [ ] ApeChain Chain ID set (33139)
- [ ] Environment variables in `.env.local`
- [ ] Wallet extension installed (MetaMask, Rabby, etc.)
- [ ] Tests passing: `pnpm test`
- [ ] Build successful: `pnpm build`

### Code Quality
- Follow TypeScript best practices
- Write tests for new features
- Maintain 70% test coverage
- Use ESLint and Prettier for code formatting
- Follow the existing component structure

### Testing
- Write unit tests for new components
- Add integration tests for wallet connections
- Update E2E tests for critical user flows
- Ensure all tests pass before submitting PR

### Pull Request Process
1. Create a feature branch from `main`
2. Make your changes with tests
3. Run `pnpm test` and `pnpm build` to ensure everything works
4. Submit a pull request with a clear description
5. Ensure CI passes (tests, build, linting)

## Changelog

### Current Version: v0.2.1
**Latest Release**: January 27, 2025

**Key Features in v0.2.1:**
- 🧪 **Complete Testing Suite**: Jest + React Testing Library with 70% coverage
- 🚀 **Performance Optimizations**: 15% smaller bundle size, lazy loading
- 🛡️ **Enhanced Error Handling**: Error boundaries and graceful recovery
- 📹 **Video Processing**: Genesis NFT video preview generation
- 🔧 **Developer Experience**: Improved tooling and documentation

### View Full Changelog
See [`CHANGELOG.md`](./CHANGELOG.md) for:
- **Detailed Release Notes**: Complete list of changes, fixes, and improvements
- **Migration Guides**: How to upgrade between versions
- **Breaking Changes**: Any breaking changes and how to handle them
- **Performance Metrics**: Bundle size, loading time, and coverage statistics
- **Contributors**: Who contributed to each release
- **Future Roadmap**: Planned features and improvements

### Quick Links
- **Latest Release**: [v0.2.1](./CHANGELOG.md#021---2025-01-27)
- **Previous Release**: [v0.2.0](./CHANGELOG.md#020---2025-09-26)
- **Unreleased Features**: [Planned](./CHANGELOG.md#unreleased)

## Documentation

### Core Documentation
- **README.md** (this file) - Project overview, setup, and quick start guide
- **CHANGELOG.md** - Detailed release notes and version history
- **TESTING.md** - Comprehensive testing guide and best practices
- **NETWORK_SETUP.md** - ApeChain network configuration and troubleshooting

### Documentation Structure
```
docs/
├── README.md           # Main project documentation
├── CHANGELOG.md        # Release notes and version history
├── TESTING.md          # Testing guide and best practices
└── NETWORK_SETUP.md    # Network configuration guide
```

### Getting Help
1. **Start Here**: Read this README for setup and quick start
2. **Testing Issues**: Check `TESTING.md` for testing problems
3. **Network Issues**: See `NETWORK_SETUP.md` for network problems
4. **Version History**: Review `CHANGELOG.md` for recent changes
5. **Still Stuck**: Check the troubleshooting section above

## Use Cases & Scenarios

### For Developers
- **Setting up development environment**: Follow the Development Setup section
- **Adding new features**: Check Contributing guidelines and write tests
- **Debugging issues**: Use the Troubleshooting section and check console logs
- **Testing changes**: Run `pnpm test` and check coverage with `pnpm run test:coverage`

### For Users
- **Connecting wallet**: Use the wallet connection buttons in the header
- **Switching networks**: The app will automatically prompt to switch to ApeChain
- **Viewing Genesis NFTs**: Scroll to the Genesis Collection Preview section
- **Joining waitlist**: Click the "Join the Waitlist" button

### For Contributors
- **Forking the project**: Follow the Contributing section
- **Running tests**: Use the Testing section for test commands
- **Building for production**: Run `pnpm build` to verify everything works
- **Submitting PRs**: Ensure all tests pass and follow the PR process

### For Deployers
- **Environment setup**: Set all required environment variables
- **Build verification**: Run `pnpm build` to ensure production build works
- **Testing**: Run `pnpm test` to verify functionality
- **Deployment**: Follow the Deployment tips section

## Project Status

### Current Status: ✅ Production Ready
- **Build**: ✅ Working perfectly with optimized output
- **Tests**: ✅ 70% coverage maintained with comprehensive test suite
- **Performance**: ✅ Optimized for Core Web Vitals
- **Accessibility**: ✅ Enhanced ARIA labels and keyboard navigation
- **Documentation**: ✅ Complete with setup guides and troubleshooting

### Version Information
- **Current Version**: v0.2.1
- **Release Date**: January 27, 2025
- **Next.js Version**: 14.2.16
- **TypeScript**: Latest with strict mode
- **Testing**: Jest + React Testing Library
- **Coverage**: 70% minimum threshold

### Support
- **Issues**: Check the troubleshooting section above
- **Documentation**: All guides are in the root directory
- **Testing**: See `TESTING.md` for testing issues
- **Network**: See `NETWORK_SETUP.md` for network problems
- **Changelog**: See `CHANGELOG.md` for version history
