# ApeBeats — Sonic Swamp Hub

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/yancastet-9701s-projects/v0-ape-beat-landing-page)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/XGCNimLcz9k)

## Overview

A Next.js app that integrates Thirdweb for:

- Social login (email + OAuth via in-app wallet)
- Preferred wallets: Glyph, Rabby, MetaMask, Rainbow (+ WalletConnect)
- First-time smart wallet deployment (ERC-4337) on connect
- Live ApeChain onchain data under the music player (block and gas price)

## Tech

- Next.js 14 App Router
- TypeScript
- TailwindCSS
- thirdweb v5 SDK
- React Query

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

## Environment Variables
Create a `.env.local` at the repo root with:
```
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=...
NEXT_PUBLIC_ALCHEMY_API_KEY=...
NEXT_PUBLIC_APECHAIN_CHAIN_ID=33139
```

- NEXT_PUBLIC_THIRDWEB_CLIENT_ID
  - What: Public client id for Thirdweb client.
  - Where to get:
    1. Go to Thirdweb Dashboard → Settings → API Keys
    2. Create a "Client ID" (not secret key) and copy its value
  - Used in `lib/thirdweb.ts` to initialize `createThirdwebClient`.

- NEXT_PUBLIC_ALCHEMY_API_KEY
  - What: Alchemy API key for ApeChain RPC access.
  - Where to get:
    1. Go to [Alchemy Dashboard](https://dashboard.alchemy.com)
    2. Create a new app → Select "ApeChain" network
    3. Copy the API key from the app details
  - Used to construct ApeChain RPC URL: `https://apechain-mainnet.g.alchemy.com/v2/{API_KEY}`

- NEXT_PUBLIC_APECHAIN_CHAIN_ID
  - What: ApeChain mainnet chain ID (defaults to 33139).
  - Value: `33139` (ApeChain mainnet)
  - Used in `lib/thirdweb.ts` with `defineChain`.

> Tip: If you fork this repo, generate your own Thirdweb Client ID and Alchemy key.

## What's Implemented

- Thirdweb provider in `app/layout.tsx` using `thirdwebClient`
- Chain config in `lib/thirdweb.ts` via `defineChain`
- Preferred wallets list in `lib/thirdweb.ts` (Glyph, Rabby, MetaMask, Rainbow; WalletConnect and in-app wallet)
- Login UI at `app/login/page.tsx`:
  - Email code flow using `preAuthenticate` and `inAppWallet`
  - Connect buttons: Glyph, Rabby, MetaMask, Rainbow, WalletConnect
  - Smart wallet deployment on first connect via `deploySmartAccount`
- Header short connect/disconnect in `components/HeaderUser.tsx`
- Live ApeChain data in `app/page.tsx` powered by `fetchApeChainStats` from `lib/utils.ts`

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

## Deployment tips

- Vercel
  - Add env vars in Project Settings → Environment Variables
  - Redeploy

- Security
  - Never commit secret keys. Only the Thirdweb client id is public.
  - RPC URLs can be public if rate-limited; consider private RPCs for production.

## Troubleshooting

- Seeing "-" for all ApeChain stats
  - Check `NEXT_PUBLIC_APECHAIN_RPC` and `NEXT_PUBLIC_APECHAIN_CHAIN_ID`
  - Verify the RPC is reachable and supports the chain id

- Wallet buttons do nothing
  - Ensure the browser wallet is installed (MetaMask, Rabby, Rainbow, Glyph)
  - Try WalletConnect (mobile) as fallback

- Email code not received
  - Confirm the email address and check spam
  - Re-trigger "Send Code"

- Smart wallet not deploying
  - It's a no-op if already deployed; otherwise, ensure RPC and client id are valid
  - Check browser console for detailed errors

## Key Files

- `app/layout.tsx` — Thirdweb provider wrapper
- `lib/thirdweb.ts` — Thirdweb client, ApeChain config, preferred wallets
- `app/login/page.tsx` — Social + wallet login UI and smart wallet deployment
- `components/HeaderUser.tsx` — Quick connect/disconnect and email display
- `app/page.tsx` — Landing page with live ApeChain metrics
- `lib/utils.ts` — `fetchApeChainStats` via Thirdweb RPC

## Changelog

See `CHANGELOG.md` for detailed release notes.
