// Input validation utilities for security
import { z } from "zod";

// Common validation schemas
export const commonSchemas = {
  // Ethereum address validation
  ethereumAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
  
  // Chain ID validation
  chainId: z.number().int().positive(),
  
  // Token ID validation
  tokenId: z.string().regex(/^\d+$/, "Token ID must be a number"),
  
  // URL validation
  url: z.string().url("Invalid URL"),
  
  // Email validation
  email: z.string().email("Invalid email address"),
  
  // Phone validation
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number"),
  
  // Safe string (no HTML/script tags)
  safeString: z.string().refine(
    (val) => !/<[^>]*>/g.test(val),
    "String contains potentially unsafe HTML"
  ),
  
  // Numeric string
  numericString: z.string().regex(/^\d+$/, "Must be a numeric string"),
  
  // Hex string
  hexString: z.string().regex(/^0x[a-fA-F0-9]+$/, "Must be a valid hex string"),
};

// Sanitization functions
export const sanitizers = {
  // Remove HTML tags
  stripHtml: (input: string): string => {
    return input.replace(/<[^>]*>/g, '');
  },
  
  // Escape HTML entities
  escapeHtml: (input: string): string => {
    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
    };
    return input.replace(/[&<>"'/]/g, (char) => htmlEntities[char] || char);
  },
  
  // Normalize string (trim, lowercase)
  normalize: (input: string): string => {
    return input.trim().toLowerCase();
  },
  
  // Remove special characters
  removeSpecialChars: (input: string): string => {
    return input.replace(/[^a-zA-Z0-9\s]/g, '');
  },
};

// Validation functions
export const validators = {
  // Validate Ethereum address
  isValidAddress: (address: string): boolean => {
    return commonSchemas.ethereumAddress.safeParse(address).success;
  },
  
  // Validate chain ID
  isValidChainId: (chainId: number): boolean => {
    return commonSchemas.chainId.safeParse(chainId).success;
  },
  
  // Validate URL
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  // Check for XSS attempts
  hasXSSAttempt: (input: string): boolean => {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi,
    ];
    
    return xssPatterns.some(pattern => pattern.test(input));
  },
  
  // Check for SQL injection attempts
  hasSQLInjection: (input: string): boolean => {
    const sqlPatterns = [
      /('|(\\')|(;)|(\-\-)|(\s+or\s+)|(\s+and\s+))/gi,
      /(union\s+select)/gi,
      /(drop\s+table)/gi,
      /(delete\s+from)/gi,
      /(insert\s+into)/gi,
      /(update\s+set)/gi,
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  },
};

// Input sanitization middleware
export function sanitizeInput<T extends Record<string, any>>(
  input: T,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(input);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

// Rate limiting helper
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }
  
  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

// CSRF protection helper
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  if (!token || !sessionToken) {
    return false;
  }
  
  // Use crypto.subtle for secure comparison
  const tokenBuffer = new TextEncoder().encode(token);
  const sessionBuffer = new TextEncoder().encode(sessionToken);
  
  if (tokenBuffer.length !== sessionBuffer.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < tokenBuffer.length; i++) {
    result |= tokenBuffer[i] ^ sessionBuffer[i];
  }
  
  return result === 0;
}
