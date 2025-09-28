# ApeChain Network Setup

This application is configured to use **ApeChain** as the default network. The app will automatically prompt users to switch to ApeChain if they're connected to a different network.

## Features

### 🔄 Automatic Network Detection
- Detects when users are connected to the wrong network
- Shows a prominent banner when on incorrect network
- Displays network status in the header and profile dropdown

### 🚀 One-Click Network Switching
- Users can switch to ApeChain with a single click
- Automatically adds ApeChain to wallet if not already present
- Works with MetaMask, Rabby, Rainbow, and other injected wallets

### 📱 Network Status Indicators
- **Green WiFi icon**: Connected to ApeChain ✅
- **Orange WiFi icon**: Connected to wrong network ⚠️
- Real-time network status updates

## ApeChain Configuration

```typescript
// Chain ID: 33139 (ApeChain Mainnet)
// RPC URL: https://apechain-mainnet.g.alchemy.com/v2/{API_KEY}
// Native Currency: APE (18 decimals)
// Block Explorer: https://explorer.apechain.com
```

## Environment Variables Required

```bash
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_APECHAIN_CHAIN_ID=33139
```

## How It Works

1. **On Page Load**: App checks if user is connected to ApeChain
2. **Wrong Network**: Shows banner with "Switch Network" button
3. **Network Switch**: Attempts to switch to ApeChain
4. **Add Network**: If ApeChain not in wallet, adds it automatically
5. **Success**: User is now on ApeChain and can use the app

## Components

- `NetworkSwitcher.tsx`: Main network detection and switching component
- `ProfileDropdown.tsx`: Network status in user profile
- `walletService.ts`: Network switching logic
- `thirdweb.ts`: ApeChain configuration

## User Experience

- **Seamless**: Users are guided to the correct network automatically
- **Non-intrusive**: Banner only shows when needed
- **Accessible**: Clear visual indicators and error messages
- **Mobile-friendly**: Works on all devices and wallets

## Supported Wallets

- ✅ MetaMask
- ✅ Rabby
- ✅ Rainbow
- ✅ WalletConnect
- ✅ Glyph Wallet
- ✅ In-app wallets (email, social login)

## Error Handling

- Graceful fallbacks if network switching fails
- Clear error messages for users
- Automatic retry mechanisms
- Fallback to Ethereum if ApeChain unavailable
