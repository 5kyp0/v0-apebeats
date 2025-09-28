# ApeStake Integration Guide

## 📋 Overview

This guide provides detailed instructions for integrating the V0-Ape-Stake Pro staking functionality into the existing ApeBeats project. Each section includes the source file path from V0-Ape-Stake and the target path in the ApeBeats project.

## 🗂️ File Mapping Structure

### **Source Project:** `/Users/ewan/Documents/ApeBeats/v0-ape-stake-pro-landing-page/`
### **Target Project:** `/Users/ewan/Documents/ApeBeats/v0-apebeats/`

---

## 📁 Core Components Integration

### 1. **Main Staking Dashboard**

**Source:** `v0-ape-stake-pro-landing-page/components/staking-dashboard.tsx`
**Target:** `components/staking/StakingDashboard.tsx`

**Instructions:**
```bash
# Create staking components directory
mkdir -p components/staking

# Copy and adapt the main dashboard component
cp v0-ape-stake-pro-landing-page/components/staking-dashboard.tsx components/staking/StakingDashboard.tsx
```

**Required Changes:**
- Update import paths to match ApeBeats structure
- Integrate with existing theme system
- Update navigation to use existing MenuDropdown
- Adapt to existing layout structure

### 2. **NFT Grid Component**

**Source:** `v0-ape-stake-pro-landing-page/components/nft-grid.tsx`
**Target:** `components/staking/NFTGrid.tsx`

**Instructions:**
```bash
cp v0-ape-stake-pro-landing-page/components/nft-grid.tsx components/staking/NFTGrid.tsx
```

**Required Changes:**
- Update import paths for UI components
- Integrate with existing ThirdWeb setup
- Adapt to ApeBeats theme colors
- Update NFT image handling

### 3. **Staked NFTs Component**

**Source:** `v0-ape-stake-pro-landing-page/components/staked-nfts.tsx`
**Target:** `components/staking/StakedNFTs.tsx`

**Instructions:**
```bash
cp v0-ape-stake-pro-landing-page/components/staked-nfts.tsx components/staking/StakedNFTs.tsx
```

**Required Changes:**
- Update import paths
- Integrate with existing reward token system
- Adapt penalty calculation display
- Update styling to match theme

### 4. **Pool Creator Component**

**Source:** `v0-ape-stake-pro-landing-page/components/pool-creator.tsx`
**Target:** `components/staking/PoolCreator.tsx`

**Instructions:**
```bash
cp v0-ape-stake-pro-landing-page/components/pool-creator.tsx components/staking/PoolCreator.tsx
```

**Required Changes:**
- Update form validation
- Integrate with existing error handling
- Adapt fee structure display
- Update styling

### 5. **Wallet Connect Component**

**Source:** `v0-ape-stake-pro-landing-page/components/wallet-connect.tsx`
**Target:** `components/staking/WalletConnect.tsx`

**Instructions:**
```bash
cp v0-ape-stake-pro-landing-page/components/wallet-connect.tsx components/staking/WalletConnect.tsx
```

**Required Changes:**
- Integrate with existing wallet system
- Update to use existing HeaderUser component
- Adapt styling to match theme

---

## 🎣 Hooks Integration

### 1. **Main Staking Hook**

**Source:** `v0-ape-stake-pro-landing-page/hooks/useStaking.ts`
**Target:** `hooks/useStaking.ts`

**Instructions:**
```bash
cp v0-ape-stake-pro-landing-page/hooks/useStaking.ts hooks/useStaking.ts
```

**Required Changes:**
- Update import paths for ThirdWeb
- Integrate with existing contract addresses
- Adapt to existing error handling system
- Update toast notifications to use existing system

### 2. **ThirdWeb Configuration Extension**

**Source:** `v0-ape-stake-pro-landing-page/lib/thirdweb.ts`
**Target:** `lib/thirdweb.ts` (merge with existing)

**Instructions:**
```bash
# Backup existing thirdweb.ts
cp lib/thirdweb.ts lib/thirdweb.ts.backup

# Merge staking configuration into existing file
```

**Required Changes:**
- Merge staking contract addresses
- Add staking tiers configuration
- Add fee structure
- Add unstaking penalties
- Maintain existing functionality

---

## 📄 Page Integration

### 1. **Staking Page Replacement**

**Source:** `v0-ape-stake-pro-landing-page/app/staking/page.tsx`
**Target:** `app/stake/page.tsx` (replace existing)

**Instructions:**
```bash
# Backup existing stake page
cp app/stake/page.tsx app/stake/page.tsx.backup

# Replace with new staking page
cp v0-ape-stake-pro-landing-page/app/staking/page.tsx app/stake/page.tsx
```

**Required Changes:**
- Update import paths
- Integrate with existing layout
- Update navigation structure
- Adapt to existing theme system

---

## 🎨 Styling & Theme Integration

### 1. **Global Styles Update**

**Source:** `v0-ape-stake-pro-landing-page/app/globals.css`
**Target:** `app/globals.css` (merge with existing)

**Instructions:**
```bash
# Backup existing globals.css
cp app/globals.css app/globals.css.backup

# Extract staking-specific styles and merge
```

**Required Changes:**
- Add staking-specific CSS classes
- Integrate with existing theme variables
- Add staking animations
- Maintain existing styles

### 2. **Component Styling**

**Source:** Various component files
**Target:** Individual component files

**Required Changes:**
- Update color classes to match ApeBeats theme
- Integrate with existing gradient system
- Update animation classes
- Maintain responsive design

---

## ⚙️ Configuration Files

### 1. **Package.json Dependencies**

**Source:** `v0-ape-stake-pro-landing-page/package.json`
**Target:** `package.json` (merge dependencies)

**Instructions:**
```bash
# Check for missing dependencies
# Add any missing packages from V0-Ape-Stake
```

**Dependencies to Add:**
```json
{
  "sonner": "^1.7.4"
}
```

### 2. **Environment Variables**

**Source:** V0-Ape-Stake documentation
**Target:** `.env.local` (add new variables)

**Variables to Add:**
```bash
# Staking Configuration
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_POOL_FACTORY_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_GOVERNANCE_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_NFT_SHADOW_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_APEBEATS_CONTRACT_ADDRESS=0x...
```

---

## 🔧 Navigation Integration

### 1. **Menu Dropdown Update**

**Source:** Existing `components/MenuDropdown.tsx`
**Target:** `components/MenuDropdown.tsx` (update existing)

**Required Changes:**
- Update staking menu item to point to new functionality
- Add staking-specific icons
- Update descriptions

### 2. **Simple Menu Dropdown Update**

**Source:** Existing `components/SimpleMenuDropdown.tsx`
**Target:** `components/SimpleMenuDropdown.tsx` (update existing)

**Required Changes:**
- Update staking navigation
- Maintain existing functionality
- Update styling

---

## 📊 Implementation Checklist

### **Phase 1: Core Setup**
- [ ] Create `components/staking/` directory
- [ ] Copy core components (StakingDashboard, NFTGrid, StakedNFTs, PoolCreator, WalletConnect)
- [ ] Copy `useStaking` hook
- [ ] Update `lib/thirdweb.ts` with staking configuration
- [ ] Add missing dependencies to `package.json`

### **Phase 2: Component Integration**
- [ ] Update import paths in all copied components
- [ ] Integrate with existing theme system
- [ ] Update styling to match ApeBeats aesthetic
- [ ] Test component rendering

### **Phase 3: Page Integration**
- [ ] Replace `app/stake/page.tsx`
- [ ] Update navigation components
- [ ] Test page routing
- [ ] Verify layout integration

### **Phase 4: Functionality Testing**
- [ ] Test wallet connection
- [ ] Test NFT display (with mock data)
- [ ] Test staking interface
- [ ] Test pool creation interface
- [ ] Verify error handling

### **Phase 5: Styling & Polish**
- [ ] Update all color schemes
- [ ] Integrate animations
- [ ] Test responsive design
- [ ] Verify theme consistency
- [ ] Test dark/light mode

### **Phase 6: Final Integration**
- [ ] Update environment variables
- [ ] Test with real contract addresses
- [ ] Verify all functionality
- [ ] Update documentation
- [ ] Deploy and test

---

## 🚨 Important Notes

### **File Paths to Provide:**
When implementing, please provide the exact paths to these V0-Ape-Stake files:

1. **Components:**
   - `v0-ape-stake-pro-landing-page/components/staking-dashboard.tsx`
   - `v0-ape-stake-pro-landing-page/components/nft-grid.tsx`
   - `v0-ape-stake-pro-landing-page/components/staked-nfts.tsx`
   - `v0-ape-stake-pro-landing-page/components/pool-creator.tsx`
   - `v0-ape-stake-pro-landing-page/components/wallet-connect.tsx`

2. **Hooks:**
   - `v0-ape-stake-pro-landing-page/hooks/useStaking.ts`

3. **Configuration:**
   - `v0-ape-stake-pro-landing-page/lib/thirdweb.ts`

4. **Pages:**
   - `v0-ape-stake-pro-landing-page/app/staking/page.tsx`

5. **Styling:**
   - `v0-ape-stake-pro-landing-page/app/globals.css`

### **Backup Strategy:**
Always backup existing files before replacing:
```bash
# Create backup directory
mkdir -p backups/$(date +%Y%m%d)

# Backup existing files
cp app/stake/page.tsx backups/$(date +%Y%m%d)/
cp lib/thirdweb.ts backups/$(date +%Y%m%d)/
cp components/MenuDropdown.tsx backups/$(date +%Y%m%d)/
```

### **Testing Strategy:**
1. Test each component individually
2. Test integration between components
3. Test with existing functionality
4. Test responsive design
5. Test theme switching
6. Test error handling

---

## 🎯 Quick Start Commands

```bash
# 1. Create staking components directory
mkdir -p components/staking

# 2. Copy core components
cp v0-ape-stake-pro-landing-page/components/staking-dashboard.tsx components/staking/StakingDashboard.tsx
cp v0-ape-stake-pro-landing-page/components/nft-grid.tsx components/staking/NFTGrid.tsx
cp v0-ape-stake-pro-landing-page/components/staked-nfts.tsx components/staking/StakedNFTs.tsx
cp v0-ape-stake-pro-landing-page/components/pool-creator.tsx components/staking/PoolCreator.tsx
cp v0-ape-stake-pro-landing-page/components/wallet-connect.tsx components/staking/WalletConnect.tsx

# 3. Copy hooks
cp v0-ape-stake-pro-landing-page/hooks/useStaking.ts hooks/useStaking.ts

# 4. Backup and update configuration
cp lib/thirdweb.ts lib/thirdweb.ts.backup
# Manually merge staking configuration

# 5. Backup and replace staking page
cp app/stake/page.tsx app/stake/page.tsx.backup
cp v0-ape-stake-pro-landing-page/app/staking/page.tsx app/stake/page.tsx

# 6. Install missing dependencies
pnpm add sonner

# 7. Update environment variables
# Add staking contract addresses to .env.local
```

---

## 📞 Support

If you encounter any issues during implementation:

1. **Check file paths** - Ensure all source files exist
2. **Verify dependencies** - Make sure all required packages are installed
3. **Check imports** - Update all import paths to match your project structure
4. **Test incrementally** - Implement one component at a time
5. **Use backups** - Restore from backups if needed

This guide provides a comprehensive roadmap for integrating the V0-Ape-Stake functionality into your existing ApeBeats project while maintaining all existing functionality and design consistency.
