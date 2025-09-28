# ApeBeats Project Structure

## Overview

This document describes the optimized project structure for ApeBeats, a Next.js application that generates lo-fi hip-hop music from ApeChain blockchain data and creates NFT snapshots.

## Directory Structure

```
/Users/ewan/Documents/ApeBeats/v0-apebeats/
├── src/                          # Main source code
│   ├── app/                      # Next.js App Router pages
│   │   ├── (auth)/              # Auth-related pages
│   │   │   └── login/
│   │   ├── (music)/             # Music-related pages
│   │   │   └── music/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/              # React components
│   │   ├── ui/                  # Reusable UI components
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── progress.tsx
│   │   │   └── skeleton.tsx
│   │   ├── features/            # Feature-specific components
│   │   │   ├── auth/           # Authentication components
│   │   │   │   ├── HeaderUser.tsx
│   │   │   │   ├── LoginInline.tsx
│   │   │   │   └── ProfileDropdown.tsx
│   │   │   ├── music/          # Music engine components
│   │   │   │   ├── MusicEngine.tsx
│   │   │   │   └── MusicEngineDemo.tsx
│   │   │   └── wallet/         # Wallet-related components
│   │   │       ├── NetworkSwitcher.tsx
│   │   │       └── WalletIcons.tsx
│   │   ├── layout/             # Layout components
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── LoadingStates.tsx
│   │   ├── providers/          # Context providers
│   │   │   ├── QueryProvider.tsx
│   │   │   ├── GlyphProvider.tsx
│   │   │   └── theme-provider.tsx
│   │   └── index.ts            # Centralized component exports
│   ├── lib/                     # Core libraries and utilities
│   │   ├── music-engine/       # Music generation engine
│   │   │   ├── index.ts
│   │   │   ├── dataCollector.ts
│   │   │   ├── lofiGenerator.ts
│   │   │   ├── musicGenerator.ts
│   │   │   ├── nftSnapshot.ts
│   │   │   ├── streamingEngine.ts
│   │   │   ├── types.ts
│   │   │   ├── useMusicEngine.ts
│   │   │   └── videoVisualizer.ts
│   │   ├── blockchain/         # Blockchain utilities
│   │   │   ├── thirdweb.ts
│   │   │   ├── wagmi.ts
│   │   │   └── walletService.ts
│   │   ├── utils/              # General utilities
│   │   │   ├── utils.ts
│   │   │   └── videoUtils.ts
│   │   └── index.ts            # Centralized library exports
│   ├── hooks/                   # Custom React hooks
│   │   ├── useVideoPreviews.ts
│   │   └── index.ts
│   ├── stores/                  # State management (Zustand)
│   │   ├── userStore.ts
│   │   └── index.ts
│   └── styles/                  # Global styles
│       └── globals.css
├── tests/                       # Test files
│   ├── unit/                   # Unit tests
│   │   ├── components/         # Component tests
│   │   └── lib/               # Library tests
│   ├── integration/            # Integration tests
│   ├── e2e/                    # End-to-end tests
│   └── fixtures/               # Test fixtures and mocks
├── docs/                       # Documentation
│   ├── api/                    # API documentation
│   ├── guides/                 # User guides
│   │   ├── MUSIC_ENGINE_SETUP.md
│   │   ├── SETUP.md
│   │   ├── TESTING.md
│   │   └── NETWORK_SETUP.md
│   └── architecture/           # Architecture docs
│       ├── PROJECT_STRUCTURE.md
│       └── MUSIC_ENGINE_ROADMAP.md
├── config/                     # Configuration files
│   ├── jest.config.js
│   ├── jest.setup.js
│   ├── next.config.mjs
│   ├── tsconfig.json
│   ├── components.json
│   └── postcss.config.mjs
├── public/                     # Static assets
├── scripts/                    # Build and utility scripts
└── package.json
```

## Key Design Principles

### 1. Feature-Based Organization
Components are organized by feature rather than by type, making it easier to find related functionality:
- `features/auth/` - All authentication-related components
- `features/music/` - Music engine components
- `features/wallet/` - Wallet connection components

### 2. Separation of Concerns
- `components/` - UI components and React logic
- `lib/` - Business logic and utilities
- `hooks/` - Custom React hooks
- `stores/` - State management
- `app/` - Next.js pages and routing

### 3. Centralized Exports
Each major directory has an `index.ts` file that exports all public APIs, enabling clean imports:
```typescript
// Instead of: import { Button } from '@/components/ui/button'
import { Button } from '@/components'
```

### 4. Configuration Management
All configuration files are centralized in the `config/` directory for better organization and maintenance.

## Import Paths

The project uses TypeScript path mapping for clean imports:

```typescript
// Component imports
import { Button, Card } from '@/components'
import { HeaderUser } from '@/components/features/auth'

// Library imports
import { ApeBeatsMusicEngine } from '@/lib'
import { thirdwebClient } from '@/lib/blockchain'

// Hook imports
import { useVideoPreviews } from '@/hooks'

// Store imports
import { useUserStore } from '@/stores'
```

## Benefits of This Structure

1. **Scalability**: Easy to add new features without cluttering existing directories
2. **Maintainability**: Related code is grouped together, making it easier to maintain
3. **Developer Experience**: Clear separation of concerns and intuitive file locations
4. **Testing**: Organized test structure mirrors the source code organization
5. **Documentation**: Centralized documentation with clear categorization

## Migration Notes

This structure was created by reorganizing the original flat structure. Key changes:
- Moved all source code into `src/` directory
- Organized components by feature rather than type
- Centralized configuration files
- Created index files for better imports
- Updated all import paths to use the new structure

## Next Steps

1. Run tests to ensure all imports are working correctly
2. Update any remaining hardcoded paths
3. Consider adding more specific path mappings as the project grows
4. Document any new patterns or conventions as they emerge


