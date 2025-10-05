# Glyph Integration Quick Reference

## 🚀 Essential Patterns

### Wallet Connection
```typescript
const { user: glyphUser, ready: glyphReady, authenticated: glyphAuthenticated, sendTransaction: glyphSendTransaction } = useSafeGlyph()

const isGlyphConnected = !!(glyphReady && glyphAuthenticated && glyphUser?.evmWallet)
```

### Wallet Info Creation
```typescript
// ✅ Correct Glyph wallet info
{
  type: 'glyph',
  address: glyphUser.evmWallet,
  signer: { 
    sendTransaction: glyphSendTransaction
  },
  sendTransaction: glyphSendTransaction
}
```

### Transaction Format
```typescript
// ✅ Correct Glyph transaction format
const result = await glyphSendTransaction({
  transaction: {
    to: contractAddress,
    data: encodedFunctionData,
    value: "0", // or amount as string
    chainId: 33111 // Curtis Testnet
  }
})
```

## ⚠️ Common Mistakes

### ❌ Wrong Transaction Format
```typescript
// Don't do this - missing transaction wrapper
await glyphSendTransaction({
  to: contractAddress,
  data: encodedData,
  value: "0",
  chainId: 33111
})

// Don't do this - wrong parameter structure
await glyphSendTransaction(contractAddress, encodedData, "0", 33111)
```

### ❌ Strict TypeScript Signatures
```typescript
// Don't force strict typing - causes signature mismatches
sendTransaction?: (transaction: { to: string; data: string; value: string; chainId: number }) => Promise<string>
```

## 🔧 Essential Functions

### Function Data Encoding
```typescript
import { encodeFunctionData } from "viem"

const data = encodeFunctionData({
  abi: contract.abi,
  functionName: "batchTransferEqual",
  args: [recipients, BigInt(amountPerRecipient)]
})
```

### Transaction Validation
```typescript
if (!transaction.to || transaction.to === "0x0000000000000000000000000000000000000000") {
  throw new Error("Invalid contract address")
}

if (!transaction.data || transaction.data === "0x" || transaction.data.length < 10) {
  throw new Error("Invalid transaction data")
}
```

## 🌐 Network Configuration

### Curtis Testnet
```typescript
const CURTIS_CHAIN_ID = 33111
const CURTIS_RPC = "https://curtis.rpc.caldera.xyz/http"
const CURTIS_EXPLORER = "https://curtis.apescan.io"
```

## 🐛 Debug Logging

```typescript
console.log("🔍 Glyph transaction object:", {
  to: transaction.to,
  data: transaction.data.substring(0, 20) + "...",
  value: transaction.value,
  chainId: transaction.chainId,
  dataLength: transaction.data.length
})
```

## 📋 Checklist

Before implementing Glyph integration:

- [ ] Use `useSafeGlyph()` hook for connection
- [ ] Check `glyphReady && glyphAuthenticated` before using
- [ ] Use `{ transaction: { to, data, value, chainId } }` format
- [ ] Include correct chainId (33111 for Curtis)
- [ ] Use flexible typing in WalletInfo interface
- [ ] Validate transaction data before sending
- [ ] Add comprehensive error handling
- [ ] Test both connection and transaction functionality

## 🔗 Key Files

- `hooks/useSafeGlyph.ts` - Glyph connection hook
- `lib/walletTransactionService.ts` - Transaction handling
- `components/transfers/BatchTransferForm.tsx` - Wallet integration example
- `lib/chains.ts` - Network configuration

---

**Remember**: Glyph expects `{ transaction: {...} }` format, not direct transaction parameters!
