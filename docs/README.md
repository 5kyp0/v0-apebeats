# ApeBeats Documentation

Welcome to the ApeBeats documentation! This directory contains comprehensive guides, integration instructions, and architectural documentation for the ApeBeats ecosystem.

## 📁 Documentation Structure

### 🔗 [Integration Guides](./integration/)
Complete guides for integrating various services and technologies with ApeBeats.
- **Glyph Wallet Integration** - Complete wallet integration guide
- **Batch Transfer Setup** - Setup and configuration for batch transfer functionality
- **VRF Implementation Guide** - Chainlink VRF integration guide
- **Service Integrations** - Thirdweb, Alchemy, IPFS integrations

### 📖 [Development Guides](./guides/)
Quick reference guides and development patterns for efficient development.
- **Glyph Quick Reference** - Essential patterns and common mistakes
- **Deployment Guide** - Complete deployment instructions
- **Deployment Instructions** - Step-by-step deployment procedures
- **UI/UX Development** - Component patterns and styling guidelines
- **Testing Patterns** - Testing strategies and mock data

### 🚨 [Troubleshooting](./troubleshooting/)
Solutions for common issues encountered during development and deployment.
- **Glyph Troubleshooting** - Wallet integration issue solutions
- **Common Issues** - Build errors, runtime errors, performance issues

### 🏗️ [Architecture](./architecture/)
System design, change logs, and architectural documentation.
- **Frontend Integration Summary** - Component and service overview
- **Changelog** - Detailed history of changes and improvements
- **Audit Summary** - Security audit results and findings
- **Batch Transfer Improvements** - Improvements and enhancements
- **VRF Deployment Summary** - Chainlink VRF deployment documentation
- **System Design** - Database schema, API documentation

## 🎯 Quick Start

### For Wallet Integration
1. Start with the [Quick Reference](./guides/GLYPH_QUICK_REFERENCE.md) for essential patterns
2. Follow the [Integration Guide](./integration/GLYPH_INTEGRATION_GUIDE.md) for complete implementation
3. Use the [Troubleshooting Guide](./troubleshooting/GLYPH_TROUBLESHOOTING.md) if you encounter issues

## 🔧 Key Concepts

### Glyph Wallet Integration
- **Connection**: Use `useSafeGlyph()` hook for wallet connection
- **Transactions**: Use `{ transaction: { to, data, value, chainId } }` format
- **Chain ID**: Always use `33111` for Curtis Testnet
- **Error Handling**: Implement comprehensive error handling and validation

### Best Practices
- Never wrap Glyph's `sendTransaction` function
- Use flexible typing for wallet interfaces
- Always include chainId in transactions
- Test both connection and transaction functionality
- Add comprehensive debug logging

## 🚨 Common Issues

### TypeScript Signature Mismatch
**Solution**: Use flexible typing (`sendTransaction?: any`) instead of strict signatures

### Contract Interaction Broken
**Solution**: Use Glyph's `sendTransaction` directly without wrapper functions

### ChainId Errors
**Solution**: Include chainId in the transaction object: `{ transaction: { to, data, value, chainId } }`

## 📞 Support

If you encounter issues not covered in these guides:

1. Check the [Troubleshooting Guide](./GLYPH_TROUBLESHOOTING.md)
2. Review the [Integration Guide](./GLYPH_INTEGRATION_GUIDE.md) for complete patterns
3. Check the main project [README](../README.md) for general setup

## 🔄 Keeping Documentation Updated

When making changes to wallet integrations:

1. Update the relevant documentation files
2. Test all examples and code snippets
3. Update the troubleshooting guide with new issues
4. Keep the quick reference current with latest patterns

---

**Last Updated**: January 2025  
**Maintainer**: ApeBeats Development Team
