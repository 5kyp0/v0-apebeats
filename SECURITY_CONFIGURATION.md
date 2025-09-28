# ApeBeats Security Configuration Guide

## Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```bash
# =============================================================================
# CRITICAL SECURITY SETTINGS
# =============================================================================

# Thirdweb Configuration
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id_here

# Blockchain Configuration
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here
NEXT_PUBLIC_APECHAIN_CHAIN_ID=33139

# =============================================================================
# OPTIONAL SECURITY SETTINGS
# =============================================================================

# API Configuration
NEXT_PUBLIC_API_BASE_URL=/api

# Security Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG_MODE=false
NEXT_PUBLIC_ENABLE_GENESIS_PROTECTION=true

# =============================================================================
# DEVELOPMENT SETTINGS
# =============================================================================

# Node Environment
NODE_ENV=development
```

## Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env.local` to version control
- ✅ Use strong, unique API keys
- ✅ Rotate keys regularly
- ✅ Use different keys for development and production
- ✅ Monitor API key usage for suspicious activity
- ✅ Enable 2FA on all service accounts

### 2. API Key Management
- ✅ Store sensitive keys server-side when possible
- ✅ Use environment variables for configuration
- ✅ Validate API keys before use
- ✅ Implement rate limiting
- ✅ Monitor for unauthorized access

### 3. Smart Contract Security
- ✅ Use timelock for critical functions
- ✅ Implement proper access controls
- ✅ Use Chainlink VRF for randomness
- ✅ Add reentrancy protection
- ✅ Validate all inputs

### 4. Frontend Security
- ✅ Implement Content Security Policy
- ✅ Sanitize all user inputs
- ✅ Use secure HTML rendering
- ✅ Add security headers
- ✅ Implement rate limiting

### 5. Infrastructure Security
- ✅ Enable HTTPS enforcement
- ✅ Add security headers
- ✅ Implement proper CORS policies
- ✅ Use secure session management
- ✅ Monitor for security threats

## Security Headers Implemented

The following security headers are now implemented:

- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Permissions-Policy` - Restricts browser features
- `Strict-Transport-Security` - Enforces HTTPS
- `Content-Security-Policy` - Prevents XSS attacks

## Rate Limiting

Rate limiting is implemented with the following settings:
- 100 requests per 15 minutes per IP address
- Configurable limits for different endpoints
- Automatic blocking of suspicious activity

## Input Validation

All user inputs are now validated using:
- Zod schema validation
- XSS attack detection
- SQL injection prevention
- HTML sanitization
- CSRF protection

## Smart Contract Improvements

### Timelock Controller
- 24-hour minimum delay for critical operations
- 7-day maximum delay
- Proper role-based access control
- Event logging for all operations

### Improved Randomness
- Chainlink VRF integration for secure randomness
- Commit-reveal scheme as fallback
- Multiple entropy sources
- Protection against manipulation

## Monitoring and Alerting

Set up monitoring for:
- Failed authentication attempts
- Unusual API usage patterns
- Smart contract function calls
- Security header violations
- Rate limit violations

## Incident Response

In case of security incidents:
1. Immediately revoke compromised API keys
2. Update all passwords and access tokens
3. Review access logs for unauthorized activity
4. Notify affected users if necessary
5. Document the incident and lessons learned

## Regular Security Tasks

### Weekly
- Review access logs
- Check for dependency vulnerabilities
- Monitor API key usage
- Review security headers

### Monthly
- Rotate API keys
- Update dependencies
- Review smart contract permissions
- Conduct security testing

### Quarterly
- Full security audit
- Penetration testing
- Review and update security policies
- Train team on security best practices
