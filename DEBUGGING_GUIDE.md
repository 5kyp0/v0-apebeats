# ApeBeats Testing & Debugging Guide

## 🎯 Overview

This guide provides comprehensive testing and debugging procedures for ApeBeats on Curtis Testnet, covering all functionalities from smart contracts to the music engine.

## 🚀 Quick Start

### 1. Environment Setup

First, update your `.env.local` for Curtis Testnet:

```bash
# Copy the template and update with your values
cp .env.template .env.local
```

Required environment variables:
- `PRIVATE_KEY`: Your wallet private key (for deployment)
- `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`: Your Thirdweb client ID
- `NEXT_PUBLIC_TREASURY_ADDRESS`: Your wallet address
- `NEXT_PUBLIC_FOUNDER_ADDRESS`: Your wallet address

### 2. Run Comprehensive Tests

```bash
# Run all tests and start dev server
pnpm run test:all

# Or run individual test suites
pnpm test                    # Frontend tests
pnpm run test:contracts      # Smart contract tests
pnpm run deploy             # Deploy to Curtis Testnet
```

## 🧪 Testing Categories

### 1. Frontend Testing

**Components Tested:**
- Error boundaries and loading states
- Wallet connection components
- Music engine components
- UI components and interactions

**Coverage Target:** 70% minimum

```bash
# Run with coverage
pnpm run test:coverage

# Watch mode for development
pnpm run test:watch
```

### 2. Smart Contract Testing

**Contracts Tested:**
- `ApeBeatsGenesis.sol` - Main NFT contract
- `ApeBeatsMetadataLib.sol` - Metadata management
- `ApeBeatsRoyalties.sol` - Royalty distribution

**Test Coverage:**
- Deployment verification
- Minting phases (Founder, GTD, FCFS, Public)
- Royalty calculations
- Metadata generation
- Access controls

```bash
# Deploy and test contracts
pnpm run deploy
pnpm run test:contracts
```

### 3. Music Engine Testing

**Features Tested:**
- Generative music creation
- Blockchain data processing
- Audio generation and playback
- Video visualization
- NFT snapshot functionality

```bash
# Test music engine components
pnpm test -- --testPathPattern=music-engine
```

### 4. Integration Testing

**Flows Tested:**
- Wallet connection (Glyph, MetaMask, etc.)
- Blockchain data fetching
- Contract interactions
- User authentication
- NFT minting flow

```bash
# Test integration flows
pnpm test -- --testPathPattern=integration
```

## 🔧 Debugging Common Issues

### 1. Environment Issues

**Problem:** Missing environment variables
```bash
# Check environment
cat .env.local | grep -E "(PRIVATE_KEY|THIRDWEB_CLIENT_ID)"
```

**Solution:** Ensure all required variables are set in `.env.local`

### 2. Contract Deployment Issues

**Problem:** Deployment fails
```bash
# Check network connection
curl -X POST https://curtis.rpc.caldera.xyz/http \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

**Solution:** 
- Verify private key is correct
- Ensure you have testnet APE tokens
- Check network configuration in `hardhat.config.js`

### 3. Frontend Issues

**Problem:** Components not rendering
```bash
# Check for TypeScript errors
pnpm run build

# Check for linting issues
pnpm run lint
```

**Solution:**
- Fix TypeScript errors
- Update component imports
- Check for missing dependencies

### 4. Music Engine Issues

**Problem:** Audio not playing
- Check browser audio permissions
- Verify Web Audio API support
- Check console for audio context errors

**Problem:** Blockchain data not loading
- Verify Alchemy API key
- Check network connectivity
- Verify contract addresses

### 5. Wallet Connection Issues

**Problem:** Wallet not connecting
- Check Thirdweb client ID
- Verify wallet is installed
- Check network configuration

**Problem:** Transaction failures
- Ensure sufficient gas
- Check contract addresses
- Verify network is Curtis Testnet

## 🎵 Music Engine Debugging

### Audio Generation Issues

```javascript
// Check audio context
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
console.log('Audio context state:', audioContext.state);

// Check Web Audio API support
if (!window.AudioContext && !window.webkitAudioContext) {
  console.error('Web Audio API not supported');
}
```

### Blockchain Data Issues

```javascript
// Test Alchemy API connection
const response = await fetch('https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'eth_blockNumber',
    params: [],
    id: 1
  })
});
```

## 🔗 Contract Interaction Debugging

### Reading Contract State

```javascript
// Check contract deployment
const contract = await ethers.getContractAt("ApeBeatsGenesis", contractAddress);
const totalSupply = await contract.totalSupply();
console.log('Total supply:', totalSupply.toString());
```

### Transaction Debugging

```javascript
// Check transaction status
const tx = await contract.mint(1, { value: ethers.parseEther("4.2") });
const receipt = await tx.wait();
console.log('Transaction hash:', tx.hash);
console.log('Gas used:', receipt.gasUsed.toString());
```

## 📊 Performance Monitoring

### Frontend Performance

```bash
# Check bundle size
pnpm run build
ls -la .next/static/chunks/

# Run Lighthouse audit
npx lighthouse http://localhost:3000 --output html
```

### Contract Gas Usage

```javascript
// Monitor gas usage
const gasEstimate = await contract.estimateGas.mint(1, { value: ethers.parseEther("4.2") });
console.log('Estimated gas:', gasEstimate.toString());
```

## 🐛 Error Tracking

### Common Error Patterns

1. **"Cannot read property of undefined"**
   - Check component props
   - Verify data loading states
   - Add null checks

2. **"Transaction failed"**
   - Check gas limits
   - Verify contract addresses
   - Check network configuration

3. **"Audio context suspended"**
   - User interaction required
   - Check browser permissions
   - Handle audio context state

### Debug Tools

```javascript
// Enable debug mode
localStorage.setItem('debug', 'apebeats:*');

// Check wallet connection
console.log('Connected wallet:', window.ethereum?.selectedAddress);

// Check contract state
console.log('Contract address:', process.env.NEXT_PUBLIC_APEBEATS_GENESIS_ADDRESS);
```

## 🚀 Deployment Checklist

### Pre-deployment

- [ ] Environment variables configured
- [ ] Contracts compiled successfully
- [ ] Tests passing (70%+ coverage)
- [ ] No TypeScript errors
- [ ] No linting issues

### Deployment

- [ ] Deploy to Curtis Testnet
- [ ] Verify contract deployment
- [ ] Test contract functions
- [ ] Update environment with contract addresses

### Post-deployment

- [ ] Test frontend with deployed contracts
- [ ] Test wallet connections
- [ ] Test minting flow
- [ ] Test music engine
- [ ] Monitor for errors

## 📈 Monitoring & Analytics

### Error Tracking

```javascript
// Add error boundary logging
const logError = (error, errorInfo) => {
  console.error('Error caught by boundary:', error);
  console.error('Error info:', errorInfo);
  // Send to error tracking service
};
```

### Performance Metrics

```javascript
// Track page load times
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log('Performance entry:', entry);
  });
});
observer.observe({ entryTypes: ['navigation', 'measure'] });
```

## 🔄 Continuous Testing

### Automated Testing

```bash
# Run tests on file changes
pnpm run test:watch

# Run tests before commit
git add . && pnpm test && git commit
```

### Manual Testing Checklist

- [ ] Wallet connection works
- [ ] Music engine generates audio
- [ ] NFT minting flow works
- [ ] Blockchain data displays correctly
- [ ] Error boundaries catch errors
- [ ] Loading states work properly
- [ ] Responsive design works
- [ ] Performance is acceptable

## 📞 Getting Help

### Debug Information to Collect

1. Browser console errors
2. Network request failures
3. Contract transaction hashes
4. Environment configuration (without private keys)
5. Test coverage reports
6. Performance metrics

### Useful Commands

```bash
# Full system check
pnpm run test:all

# Check environment
node -e "console.log(process.env.NEXT_PUBLIC_CHAIN_ID)"

# Verify contracts
pnpm run test:contracts

# Check coverage
pnpm run test:coverage
```

This guide should help you systematically test and debug all aspects of your ApeBeats application on Curtis Testnet.
