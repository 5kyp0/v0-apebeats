// Security test suite for ApeBeats
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { 
  securityMonitor, 
  securityHelpers, 
  SecurityEventType,
  withSecurityMonitoring 
} from '../../lib/securityMonitor';
import { 
  validators, 
  sanitizers, 
  sanitizeInput, 
  commonSchemas,
  RateLimiter 
} from '../../lib/validation';
import { sanitizeHtml, createSafeJsonLd, createSafeScript } from '../../lib/htmlSanitizer';
import { config, validateConfig, isValidApiKey } from '../../lib/config';

describe('Security Tests', () => {
  beforeEach(() => {
    // Clear security monitor events before each test
    (securityMonitor as any).events = [];
  });

  describe('Input Validation', () => {
    it('should validate Ethereum addresses correctly', () => {
      expect(validators.isValidAddress('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6')).toBe(true);
      expect(validators.isValidAddress('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b')).toBe(false);
      expect(validators.isValidAddress('invalid-address')).toBe(false);
      expect(validators.isValidAddress('')).toBe(false);
    });

    it('should validate chain IDs correctly', () => {
      expect(validators.isValidChainId(1)).toBe(true);
      expect(validators.isValidChainId(33139)).toBe(true);
      expect(validators.isValidChainId(0)).toBe(false);
      expect(validators.isValidChainId(-1)).toBe(false);
    });

    it('should detect XSS attempts', () => {
      expect(validators.hasXSSAttempt('<script>alert("xss")</script>')).toBe(true);
      expect(validators.hasXSSAttempt('javascript:alert("xss")')).toBe(true);
      expect(validators.hasXSSAttempt('<img src="x" onerror="alert(1)">')).toBe(true);
      expect(validators.hasXSSAttempt('normal text')).toBe(false);
      expect(validators.hasXSSAttempt('<p>safe html</p>')).toBe(false);
    });

    it('should detect SQL injection attempts', () => {
      expect(validators.hasSQLInjection("'; DROP TABLE users; --")).toBe(true);
      expect(validators.hasSQLInjection("' OR '1'='1")).toBe(true);
      expect(validators.hasSQLInjection("UNION SELECT * FROM users")).toBe(true);
      expect(validators.hasSQLInjection("normal query")).toBe(false);
    });

    it('should sanitize HTML correctly', () => {
      expect(sanitizers.stripHtml('<script>alert("xss")</script>')).toBe('alert("xss")');
      expect(sanitizers.escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(sanitizers.normalize('  HELLO WORLD  ')).toBe('hello world');
      expect(sanitizers.removeSpecialChars('hello@world!')).toBe('hello world');
    });
  });

  describe('HTML Sanitization', () => {
    it('should sanitize HTML content', () => {
      const maliciousHtml = '<script>alert("xss")</script><p>Safe content</p>';
      const sanitized = sanitizeHtml(maliciousHtml);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('<p>Safe content</p>');
    });

    it('should create safe JSON-LD', () => {
      const data = {
        '@type': 'WebSite',
        name: 'Test Site',
        description: 'A test website'
      };
      const jsonLd = createSafeJsonLd(data);
      expect(jsonLd).toContain('"@context":"https://schema.org"');
      expect(jsonLd).toContain('"name":"Test Site"');
    });

    it('should create safe script content', () => {
      const maliciousScript = 'eval("alert(1)"); document.write("test");';
      const safeScript = createSafeScript(maliciousScript);
      expect(safeScript).toContain('/* eval blocked */');
      expect(safeScript).toContain('/* document.write blocked */');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits correctly', () => {
      const limiter = new RateLimiter(3, 60000); // 3 requests per minute
      const identifier = 'test-user';

      expect(limiter.isAllowed(identifier)).toBe(true);
      expect(limiter.isAllowed(identifier)).toBe(true);
      expect(limiter.isAllowed(identifier)).toBe(true);
      expect(limiter.isAllowed(identifier)).toBe(false);
    });

    it('should track remaining requests', () => {
      const limiter = new RateLimiter(5, 60000);
      const identifier = 'test-user';

      expect(limiter.getRemainingRequests(identifier)).toBe(5);
      limiter.isAllowed(identifier);
      expect(limiter.getRemainingRequests(identifier)).toBe(4);
    });
  });

  describe('Security Monitoring', () => {
    it('should log security events', () => {
      securityHelpers.logXSSAttempt('<script>alert("xss")</script>', '192.168.1.1');
      
      const stats = securityMonitor.getSecurityStats();
      expect(stats.eventsByType[SecurityEventType.XSS_ATTEMPT]).toBe(1);
    });

    it('should track events by severity', () => {
      securityHelpers.logXSSAttempt('test', '192.168.1.1');
      securityHelpers.logRateLimitExceeded('192.168.1.1', '/api/test');
      
      const stats = securityMonitor.getSecurityStats();
      expect(stats.eventsBySeverity['HIGH']).toBe(1);
      expect(stats.eventsBySeverity['MEDIUM']).toBe(1);
    });

    it('should get recent events', () => {
      securityHelpers.logXSSAttempt('test1', '192.168.1.1');
      securityHelpers.logXSSAttempt('test2', '192.168.1.2');
      
      const recentEvents = securityMonitor.getRecentEvents(SecurityEventType.XSS_ATTEMPT);
      expect(recentEvents).toHaveLength(2);
    });
  });

  describe('Configuration Security', () => {
    it('should validate API keys', () => {
      expect(isValidApiKey('demo-client-id')).toBe(false);
      expect(isValidApiKey('')).toBe(false);
      expect(isValidApiKey('valid-api-key-123')).toBe(true);
    });

    it('should validate configuration', () => {
      // Mock environment variables
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_THIRDWEB_CLIENT_ID: 'test-client-id'
      };

      expect(validateConfig()).toBe(true);

      // Restore environment
      process.env = originalEnv;
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize user input', () => {
      const maliciousInput = {
        name: '<script>alert("xss")</script>',
        email: 'test@example.com',
        message: 'normal message'
      };

      const result = sanitizeInput(maliciousInput, commonSchemas.safeString);
      expect(result.success).toBe(false);
      expect(result.errors).toContain('String contains potentially unsafe HTML');
    });

    it('should validate safe input', () => {
      const safeInput = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const result = sanitizeInput(safeInput, commonSchemas.safeString);
      expect(result.success).toBe(true);
    });
  });

  describe('Security Monitoring Middleware', () => {
    it('should monitor function execution', async () => {
      const testFunction = jest.fn().mockResolvedValue('success');
      const monitoredFunction = withSecurityMonitoring(testFunction, {
        logInputs: true,
        logOutputs: true
      });

      await monitoredFunction('test-input');

      expect(testFunction).toHaveBeenCalledWith('test-input');
      
      const stats = securityMonitor.getSecurityStats();
      expect(stats.totalEvents).toBeGreaterThan(0);
    });

    it('should handle function errors', async () => {
      const testFunction = jest.fn().mockRejectedValue(new Error('Test error'));
      const monitoredFunction = withSecurityMonitoring(testFunction);

      await expect(monitoredFunction()).rejects.toThrow('Test error');
      
      const stats = securityMonitor.getSecurityStats();
      expect(stats.eventsBySeverity['MEDIUM']).toBeGreaterThan(0);
    });
  });

  describe('CSRF Protection', () => {
    it('should generate CSRF tokens', () => {
      const token1 = require('../../lib/validation').generateCSRFToken();
      const token2 = require('../../lib/validation').generateCSRFToken();
      
      expect(token1).toHaveLength(64);
      expect(token2).toHaveLength(64);
      expect(token1).not.toBe(token2);
    });

    it('should validate CSRF tokens', () => {
      const { generateCSRFToken, validateCSRFToken } = require('../../lib/validation');
      
      const token = generateCSRFToken();
      expect(validateCSRFToken(token, token)).toBe(true);
      expect(validateCSRFToken(token, 'different-token')).toBe(false);
    });
  });

  describe('Security Headers', () => {
    it('should have proper security configuration', () => {
      expect(config.security.enableCSP).toBeDefined();
      expect(config.security.enableHSTS).toBeDefined();
      expect(config.security.enableCORS).toBeDefined();
    });

    it('should have proper feature flags', () => {
      expect(config.features.enableAnalytics).toBeDefined();
      expect(config.features.enableDebugMode).toBeDefined();
      expect(config.features.enableGenesisProtection).toBeDefined();
    });
  });
});
