# Troubleshooting Guide

This directory contains solutions for common issues encountered during ApeBeats development and deployment.

## 📋 Available Troubleshooting Guides

### 🔗 Wallet Issues
- **[Glyph Troubleshooting](./GLYPH_TROUBLESHOOTING.md)** - Solutions for Glyph wallet integration issues
  - TypeScript signature mismatches
  - Contract interaction problems
  - ChainId omission errors
  - Debugging steps and validation
  - Recovery procedures

### 🚨 Common Issues
- **Build Errors** - *Coming Soon*
- **Runtime Errors** - *Coming Soon*
- **Performance Issues** - *Coming Soon*
- **Deployment Issues** - *Coming Soon*

## 🔍 Quick Diagnostic Steps

### 1. Check Console Logs
```typescript
// Enable debug logging
console.log("🔍 Debug info:", {
  environment: process.env.NODE_ENV,
  walletType: getWalletType(),
  networkId: getNetworkId(),
  timestamp: new Date().toISOString()
})
```

### 2. Validate Configuration
```typescript
const validateConfig = () => {
  const required = [
    'NEXT_PUBLIC_CHAIN_ID',
    'NEXT_PUBLIC_RPC_URL',
    'NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS'
  ]
  
  const missing = required.filter(key => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  }
}
```

### 3. Test Network Connection
```typescript
const testNetworkConnection = async () => {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_RPC_URL)
    return response.ok
  } catch (error) {
    console.error("Network connection failed:", error)
    return false
  }
}
```

## 🛠️ Common Fixes

### Environment Variables
```bash
# Check if all required variables are set
echo $NEXT_PUBLIC_CHAIN_ID
echo $NEXT_PUBLIC_RPC_URL
echo $NEXT_PUBLIC_BATCH_CONTRACT_ADDRESS
```

### Dependencies
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
# or
pnpm install
```

### Build Issues
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## 🚨 Emergency Recovery

### If Everything is Broken
1. **Check git status**: `git status`
2. **Revert to last working commit**: `git checkout <last-working-commit>`
3. **Compare changes**: `git diff <last-working-commit> HEAD`
4. **Apply fixes incrementally**

### If Wallet Integration is Broken
1. Check the specific wallet troubleshooting guide
2. Verify environment variables
3. Test with a simple transaction
4. Check network connectivity

### If Build is Failing
1. Check for TypeScript errors: `npm run type-check`
2. Check for linting errors: `npm run lint`
3. Clear all caches
4. Reinstall dependencies

## 📊 Debug Tools

### Network Debugging
```typescript
const debugNetwork = async () => {
  const networkInfo = {
    chainId: await getChainId(),
    blockNumber: await getBlockNumber(),
    gasPrice: await getGasPrice(),
    networkName: await getNetworkName()
  }
  console.log("🔍 Network Debug:", networkInfo)
}
```

### Wallet Debugging
```typescript
const debugWallet = () => {
  const walletInfo = {
    type: getWalletType(),
    address: getCurrentAddress(),
    isConnected: isWalletConnected(),
    balance: getCurrentBalance()
  }
  console.log("🔍 Wallet Debug:", walletInfo)
}
```

### Contract Debugging
```typescript
const debugContract = async () => {
  const contractInfo = {
    address: contract.address,
    chainId: contract.chain.id,
    abiLength: contract.abi?.length || 0,
    isDeployed: await isContractDeployed(contract.address)
  }
  console.log("🔍 Contract Debug:", contractInfo)
}
```

## 📞 Getting Help

### Before Asking for Help
1. Check this troubleshooting guide
2. Search existing issues
3. Check console logs
4. Try the suggested fixes

### When Reporting Issues
Include:
- Error messages (full stack trace)
- Steps to reproduce
- Environment details
- Console logs
- Screenshots if applicable

### Contact Information
- Create an issue in the repository
- Contact the development team
- Check the main project documentation

---

**Last Updated**: January 2025  
**Maintainer**: ApeBeats Development Team
