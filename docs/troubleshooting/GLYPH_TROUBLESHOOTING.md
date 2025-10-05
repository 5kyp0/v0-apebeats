# Glyph Integration Troubleshooting Guide

## 🚨 Issues We've Encountered and Fixed

### 1. TypeScript Signature Mismatch

**Error**: 
```
Type '(params: { transaction: Omit<UnsignedTransactionRequest, "chainId">; }) => Promise<string | { hash: `0x${string}`; }>' is not assignable to type '(transaction: { to: string; data: string; value: string; chainId: number; }) => Promise<string>'.
```

**Root Cause**: Trying to force a strict TypeScript signature on Glyph's `sendTransaction` function, which has a different signature than expected.

**Solution**:
```typescript
// ❌ Wrong - strict typing causes issues
export interface WalletInfo {
  sendTransaction?: (transaction: {
    to: string
    data: string
    value: string
    chainId: number
  }) => Promise<string>
}

// ✅ Correct - flexible typing
export interface WalletInfo {
  sendTransaction?: any // Made flexible to accommodate different wallet signatures
}
```

**Prevention**: Always use flexible typing for wallet interfaces to accommodate different wallet SDK signatures.

### 2. Contract Interaction Broken After Changes

**Error**: Glyph wallet could no longer interact with the batch transfer contract.

**Root Cause**: Created a wrapper function that changed the transaction format from Glyph's expected format.

**What We Did Wrong**:
```typescript
// ❌ Wrong - wrapper function that broke the format
const wrappedSendTransaction = async (transaction: {
  to: string
  data: string
  value: string
  chainId: number
}) => {
  const result = await glyphSendTransaction({
    transaction: {
      to: transaction.to,
      data: transaction.data,
      value: transaction.value
      // Missing chainId!
    }
  })
  return typeof result === 'string' ? result : result.hash
}
```

**Solution**: Revert to using Glyph's `sendTransaction` directly:
```typescript
// ✅ Correct - use Glyph's sendTransaction directly
return {
  type: 'glyph',
  address: glyphUser.evmWallet,
  signer: { 
    sendTransaction: glyphSendTransaction
  },
  sendTransaction: glyphSendTransaction
}
```

**Prevention**: Never wrap Glyph's `sendTransaction` function. Use it directly as provided by the SDK.

### 3. ChainId Omission Error

**Error**: 
```
Object literal may only specify known properties, and 'chainId' does not exist in type 'Omit<UnsignedTransactionRequest, "chainId">'.
```

**Root Cause**: Trying to include `chainId` in a transaction object where it was explicitly omitted by the type definition.

**Solution**: Follow the exact format expected by the wallet SDK:
```typescript
// ✅ Correct - proper Glyph format
const result = await glyphSendTransaction({
  transaction: {
    to: contractAddress,
    data: encodedData,
    value: "0",
    chainId: 33111 // Include chainId at the transaction level
  }
})
```

## 🔍 Debugging Steps

### 1. Check Wallet Connection Status

```typescript
const debugWalletStatus = () => {
  console.log("🔍 Wallet Debug Info:", {
    glyphReady,
    glyphAuthenticated,
    glyphUser: glyphUser ? {
      evmWallet: glyphUser.evmWallet,
      authenticated: glyphUser.authenticated
    } : null,
    walletType: getWalletType(),
    currentAddress: getCurrentAddress()
  })
}
```

### 2. Validate Transaction Object

```typescript
const validateTransaction = (transaction: any) => {
  const isValid = {
    hasTo: !!transaction.to && transaction.to !== "0x0000000000000000000000000000000000000000",
    hasData: !!transaction.data && transaction.data !== "0x" && transaction.data.length > 10,
    hasValue: transaction.value !== undefined,
    hasChainId: transaction.chainId === 33111,
    isValidFormat: transaction.to && transaction.data && transaction.data.length > 10
  }
  
  console.log("🔍 Transaction Validation:", isValid)
  return Object.values(isValid).every(Boolean)
}
```

### 3. Test Contract Interaction

```typescript
const testContractInteraction = async () => {
  try {
    const contract = getBatchTransferContract()
    const result = await readContract({
      contract,
      method: "function feeBps() view returns (uint256)",
      params: []
    })
    console.log("✅ Contract read successful:", result)
    return true
  } catch (error) {
    console.error("❌ Contract interaction failed:", error)
    return false
  }
}
```

## 🛠️ Common Fixes

### Fix 1: Restore Working Implementation

If Glyph integration breaks after changes:

1. **Revert to direct usage**:
   ```typescript
   sendTransaction: glyphSendTransaction // Use directly, no wrapper
   ```

2. **Check transaction format**:
   ```typescript
   // Ensure this exact format
   await glyphSendTransaction({
     transaction: {
       to: contractAddress,
       data: encodedData,
       value: "0",
       chainId: 33111
     }
   })
   ```

3. **Verify chainId**:
   ```typescript
   const curtisChainId = 33111 // Curtis Testnet
   ```

### Fix 2: TypeScript Errors

If you get TypeScript signature errors:

1. **Use flexible typing**:
   ```typescript
   sendTransaction?: any // Instead of strict signature
   ```

2. **Don't force type compatibility**:
   ```typescript
   // Don't try to make different wallet SDKs have the same signature
   // Each wallet has its own expected format
   ```

### Fix 3: Transaction Failures

If transactions fail:

1. **Check transaction data**:
   ```typescript
   console.log("Transaction data:", {
     to: transaction.to,
     dataLength: transaction.data.length,
     value: transaction.value,
     chainId: transaction.chainId
   })
   ```

2. **Validate function encoding**:
   ```typescript
   const data = encodeFunctionData({
     abi: contract.abi, // Use full ABI
     functionName: contractMethod,
     args: params
   })
   ```

3. **Check contract address**:
   ```typescript
   const contractAddress = contract.address
   console.log("Contract address:", contractAddress)
   ```

## 📋 Testing Checklist

Before deploying Glyph integration:

- [ ] Wallet connects successfully
- [ ] Can read contract data (view functions)
- [ ] Can execute transactions (write functions)
- [ ] Transaction hash is returned correctly
- [ ] No TypeScript errors
- [ ] Works with both Thirdweb and Glyph wallets
- [ ] Error handling works properly
- [ ] Debug logging provides useful information

## 🚀 Recovery Steps

If Glyph integration is completely broken:

1. **Revert to last working commit**
2. **Check the working implementation**:
   ```bash
   git log --oneline -10
   git checkout <last-working-commit>
   ```

3. **Compare with current implementation**:
   ```bash
   git diff <last-working-commit> HEAD
   ```

4. **Apply changes incrementally**:
   - Make one small change at a time
   - Test after each change
   - Don't combine multiple fixes

## 📚 Key Lessons Learned

1. **Never wrap Glyph's sendTransaction** - Use it directly
2. **Always include chainId** - Required for network identification
3. **Use flexible typing** - Don't force strict signatures
4. **Test incrementally** - Make small changes and test each one
5. **Preserve working patterns** - Don't change what's already working
6. **Add comprehensive logging** - Helps debug issues quickly

## 🔗 Related Files

- `lib/walletTransactionService.ts` - Main transaction handling
- `components/transfers/BatchTransferForm.tsx` - Wallet integration example
- `hooks/useSafeGlyph.ts` - Glyph connection hook
- `docs/GLYPH_INTEGRATION_GUIDE.md` - Complete integration guide

---

**Remember**: If it was working before, don't change the core transaction format!
