// Security monitoring and alerting utilities
import { config } from './config';

// Security event types
export enum SecurityEventType {
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_INPUT = 'INVALID_INPUT',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  API_KEY_ABUSE = 'API_KEY_ABUSE',
  SMART_CONTRACT_ALERT = 'SMART_CONTRACT_ALERT',
}

// Security event interface
export interface SecurityEvent {
  type: SecurityEventType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
  userId?: string;
  requestId?: string;
}

// Security monitor class
export class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private maxEvents = 1000; // Keep last 1000 events
  private alertThresholds = {
    [SecurityEventType.RATE_LIMIT_EXCEEDED]: 10, // 10 per hour
    [SecurityEventType.XSS_ATTEMPT]: 5, // 5 per hour
    [SecurityEventType.SQL_INJECTION_ATTEMPT]: 3, // 3 per hour
    [SecurityEventType.UNAUTHORIZED_ACCESS]: 5, // 5 per hour
  };

  // Log a security event
  logEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
    };

    // Add to events array
    this.events.push(securityEvent);
    
    // Keep only the last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (config.features.enableDebugMode) {
      console.warn(`[SECURITY] ${event.type}: ${event.message}`, event.details);
    }

    // Check for alert conditions
    this.checkAlertConditions(securityEvent);
  }

  // Check if we should send an alert
  private checkAlertConditions(event: SecurityEvent): void {
    const threshold = this.alertThresholds[event.type];
    if (!threshold) return;

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentEvents = this.events.filter(
      e => e.type === event.type && e.timestamp > oneHourAgo
    );

    if (recentEvents.length >= threshold) {
      this.sendAlert(event, recentEvents.length);
    }
  }

  // Send security alert
  private async sendAlert(event: SecurityEvent, count: number): Promise<void> {
    const alert = {
      type: 'SECURITY_ALERT',
      severity: event.severity,
      message: `Security threshold exceeded: ${event.type} (${count} occurrences in the last hour)`,
      details: {
        eventType: event.type,
        count,
        recentEvents: this.getRecentEvents(event.type, 10),
      },
      timestamp: new Date(),
    };

    // In production, you would send this to your monitoring service
    if (config.features.enableAnalytics) {
      // Example: Send to monitoring service
      // await fetch('/api/security-alert', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(alert),
      // });
    }

    console.error(`[SECURITY ALERT] ${alert.message}`, alert.details);
  }

  // Get recent events of a specific type
  getRecentEvents(type: SecurityEventType, limit: number = 50): SecurityEvent[] {
    return this.events
      .filter(event => event.type === type)
      .slice(-limit)
      .reverse();
  }

  // Get all events within a time range
  getEventsInRange(start: Date, end: Date): SecurityEvent[] {
    return this.events.filter(
      event => event.timestamp >= start && event.timestamp <= end
    );
  }

  // Get security statistics
  getSecurityStats(): {
    totalEvents: number;
    eventsByType: Record<SecurityEventType, number>;
    eventsBySeverity: Record<string, number>;
    recentActivity: SecurityEvent[];
  } {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentActivity = this.events.filter(e => e.timestamp > oneHourAgo);

    const eventsByType = Object.values(SecurityEventType).reduce(
      (acc, type) => {
        acc[type] = this.events.filter(e => e.type === type).length;
        return acc;
      },
      {} as Record<SecurityEventType, number>
    );

    const eventsBySeverity = this.events.reduce(
      (acc, event) => {
        acc[event.severity] = (acc[event.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalEvents: this.events.length,
      eventsByType,
      eventsBySeverity,
      recentActivity,
    };
  }

  // Clear old events
  clearOldEvents(olderThan: Date): void {
    this.events = this.events.filter(event => event.timestamp > olderThan);
  }
}

// Global security monitor instance
export const securityMonitor = new SecurityMonitor();

// Helper functions for common security events
export const securityHelpers = {
  // Log rate limit exceeded
  logRateLimitExceeded(ip: string, endpoint: string): void {
    securityMonitor.logEvent({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      severity: 'MEDIUM',
      message: `Rate limit exceeded for IP ${ip} on endpoint ${endpoint}`,
      details: { ip, endpoint },
      ip,
    });
  },

  // Log XSS attempt
  logXSSAttempt(input: string, ip?: string): void {
    securityMonitor.logEvent({
      type: SecurityEventType.XSS_ATTEMPT,
      severity: 'HIGH',
      message: 'XSS attempt detected in user input',
      details: { input: input.substring(0, 100) }, // Truncate for security
      ip,
    });
  },

  // Log SQL injection attempt
  logSQLInjectionAttempt(input: string, ip?: string): void {
    securityMonitor.logEvent({
      type: SecurityEventType.SQL_INJECTION_ATTEMPT,
      severity: 'HIGH',
      message: 'SQL injection attempt detected in user input',
      details: { input: input.substring(0, 100) }, // Truncate for security
      ip,
    });
  },

  // Log unauthorized access
  logUnauthorizedAccess(resource: string, ip?: string, userId?: string): void {
    securityMonitor.logEvent({
      type: SecurityEventType.UNAUTHORIZED_ACCESS,
      severity: 'HIGH',
      message: `Unauthorized access attempt to ${resource}`,
      details: { resource },
      ip,
      userId,
    });
  },

  // Log suspicious activity
  logSuspiciousActivity(activity: string, details: Record<string, any>, ip?: string): void {
    securityMonitor.logEvent({
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      severity: 'MEDIUM',
      message: `Suspicious activity detected: ${activity}`,
      details,
      ip,
    });
  },

  // Log API key abuse
  logAPIKeyAbuse(apiKey: string, endpoint: string, ip?: string): void {
    securityMonitor.logEvent({
      type: SecurityEventType.API_KEY_ABUSE,
      severity: 'CRITICAL',
      message: `API key abuse detected on endpoint ${endpoint}`,
      details: { 
        apiKey: apiKey.substring(0, 8) + '...', // Mask the key
        endpoint 
      },
      ip,
    });
  },

  // Log smart contract alert
  logSmartContractAlert(contract: string, functionName: string, details: Record<string, any>): void {
    securityMonitor.logEvent({
      type: SecurityEventType.SMART_CONTRACT_ALERT,
      severity: 'HIGH',
      message: `Smart contract alert: ${contract}.${functionName}`,
      details: { contract, function: functionName, ...details },
    });
  },
};

// Middleware for automatic security monitoring
export function withSecurityMonitoring<T extends any[]>(
  fn: (...args: T) => any,
  options: {
    logInputs?: boolean;
    logOutputs?: boolean;
    rateLimitCheck?: boolean;
  } = {}
) {
  return async (...args: T) => {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    
    try {
      const result = await fn(...args);
      
      if (options.logOutputs) {
        securityMonitor.logEvent({
          type: SecurityEventType.SUSPICIOUS_ACTIVITY,
          severity: 'LOW',
          message: `Function ${fn.name} executed successfully`,
          details: {
            executionTime: Date.now() - startTime,
            requestId,
          },
          requestId,
        });
      }
      
      return result;
    } catch (error) {
      securityMonitor.logEvent({
        type: SecurityEventType.SUSPICIOUS_ACTIVITY,
        severity: 'MEDIUM',
        message: `Function ${fn.name} failed with error`,
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTime: Date.now() - startTime,
          requestId,
        },
        requestId,
      });
      
      throw error;
    }
  };
}
