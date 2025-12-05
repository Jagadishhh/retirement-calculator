/**
 * Security Configuration Module
 * Central configuration for all security features
 */

export const SECURITY_CONFIG = {
  // ============== ENCRYPTION SETTINGS ==============
  encryption: {
    algorithm: 'AES-GCM',
    keyLength: 256,
    ivLength: 12,
    enabled: true,
    // In production, consider using TweetNaCl.js or libsodium.js
    provider: 'WebCrypto API',
  },

  // ============== INPUT VALIDATION SETTINGS ==============
  validation: {
    enabled: true,
    sanitizeHTML: true,
    maxStringLength: 255,
    maxInputLength: 1000,
    // Allowed domains for external resources
    trustedDomains: [
      'cdn.tailwindcss.com',
      'cdnjs.cloudflare.com',
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'aistudiocdn.com',
    ],
  },

  // ============== RATE LIMITING SETTINGS ==============
  rateLimiting: {
    enabled: true,
    limits: {
      pdfGeneration: {
        maxAttempts: 5,
        windowMs: 60000, // 1 minute
      },
      dataExport: {
        maxAttempts: 10,
        windowMs: 300000, // 5 minutes
      },
      dataImport: {
        maxAttempts: 10,
        windowMs: 300000, // 5 minutes
      },
      inputChange: {
        maxAttempts: 100,
        windowMs: 1000, // 1 second
      },
    },
  },

  // ============== SESSION MANAGEMENT SETTINGS ==============
  session: {
    enabled: true,
    timeout: 30 * 60 * 1000, // 30 minutes
    warningTime: 5 * 60 * 1000, // 5 minute warning before timeout
    trackDeviceFingerprint: true,
    enableFingerprinting: true,
    // If enabled, user activity must happen within this interval
    activityCheckInterval: 1000, // 1 second
  },

  // ============== AUDIT LOGGING SETTINGS ==============
  auditLogging: {
    enabled: true,
    maxLogs: 500,
    logEvents: {
      inputChange: true,
      calculation: true,
      export: true,
      import: true,
      securityAlert: true,
      pdfGeneration: true,
    },
    storageKey: 'security-audit-logs',
    // Events with these severity levels trigger console warnings
    warningSeverity: ['high', 'medium'],
  },

  // ============== CSRF PROTECTION SETTINGS ==============
  csrf: {
    enabled: true,
    tokenLength: 32,
    maxTokens: 10,
    regenerateOnUse: true,
  },

  // ============== CSP SETTINGS ==============
  csp: {
    enabled: true,
    // These match the meta tag in index.html
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://cdn.tailwindcss.com',
        'https://cdnjs.cloudflare.com',
        'https://aistudiocdn.com',
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://cdn.tailwindcss.com',
        'https://fonts.googleapis.com',
      ],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      connectSrc: ["'self'", 'https:'],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },

  // ============== DATA PROTECTION SETTINGS ==============
  dataProtection: {
    // Never store these fields
    neverStore: [
      'ssn',
      'password',
      'creditCard',
      'bankAccount',
      'secret',
      'token',
      'apiKey',
    ],
    // Mark these as sensitive (could be encrypted)
    sensitive: [
      'monthlyIncome',
      'currentSavings',
      'monthlyExpenses',
      'majorExpenses',
    ],
    encryptSensitiveData: true,
    clearOnTimeout: true,
    clearOnLogout: true,
  },

  // ============== BROWSER COMPATIBILITY ==============
  compatibility: {
    // Minimum browser versions supporting required security features
    minVersions: {
      chrome: 91,
      firefox: 89,
      safari: 14,
      edge: 91,
    },
    // Features requiring specific support
    requiredFeatures: [
      'SubtleCrypto', // For AES-GCM
      'localStorage',
      'sessionStorage',
      'crypto.getRandomValues',
    ],
  },

  // ============== DEVELOPMENT SETTINGS ==============
  development: {
    // Enable verbose logging in development
    verboseLogging: process.env.NODE_ENV === 'development',
    // Allow localhost for CSP in development
    allowLocalhost: process.env.NODE_ENV === 'development',
    // Enable console warnings in development
    consoleWarnings: process.env.NODE_ENV === 'development',
  },

  // ============== PRODUCTION SETTINGS ==============
  production: {
    // Enforce HTTPS
    enforceHttps: true,
    // Disable source maps
    sourceMaps: false,
    // Minify and obfuscate code
    minify: true,
    // Remove console statements
    removeConsole: true,
    // Enable all security features
    allSecurityFeatures: true,
  },

  // ============== COMPLIANCE ==============
  compliance: {
    gdpr: {
      enabled: true,
      // GDPR requires explicit consent for data processing
      requiresConsent: true,
      retentionDays: 90, // Delete logs after 90 days
    },
    pci: {
      // PCI DSS applicable if handling payment cards
      enabled: false,
      minTls: '1.2',
    },
    hipaa: {
      // HIPAA applicable if handling healthcare data
      enabled: false,
      encryptionRequired: true,
      auditRequired: true,
    },
  },

  // ============== FEATURE FLAGS ==============
  features: {
    // Toggle security features on/off
    dataEncryption: true,
    inputValidation: true,
    rateLimiting: true,
    sessionTimeout: true,
    auditLogging: true,
    csrfProtection: true,
    deviceFingerprinting: true,
    securityPanel: true,
    sessionWarning: true,
  },

  // ============== PERFORMANCE ==============
  performance: {
    // Balance security vs performance
    cacheValidationResults: true,
    cacheEncryptionKeys: false, // Keys should never be cached
    batchAuditLogs: true,
    auditLogBatchSize: 10,
  },
};

/**
 * Feature Detection
 */
export const checkSecurityFeatureSupport = (): {
  [key: string]: boolean;
} => {
  return {
    SubtleCrypto: typeof window !== 'undefined' && !!window.crypto?.subtle,
    localStorage:
      typeof window !== 'undefined' && !!window.localStorage,
    sessionStorage:
      typeof window !== 'undefined' && !!window.sessionStorage,
    RandomValues:
      typeof window !== 'undefined' &&
      !!window.crypto?.getRandomValues,
    ArrayBuffer: typeof ArrayBuffer !== 'undefined',
    TextEncoder: typeof TextEncoder !== 'undefined',
  };
};

/**
 * Validate Configuration
 */
export const validateSecurityConfig = (): {
  valid: boolean;
  warnings: string[];
  errors: string[];
} => {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check critical features
  if (
    typeof window !== 'undefined' &&
    !window.crypto?.subtle
  ) {
    errors.push(
      'WebCrypto API not available - encryption will not work'
    );
  }

  // Check for development security concerns
  if (
    process.env.NODE_ENV === 'development' &&
    SECURITY_CONFIG.csp.enabled
  ) {
    warnings.push(
      'CSP enabled in development - some tools may not work'
    );
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
};

/**
 * Get Current Environment
 */
export const getEnvironment = () => {
  return {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  };
};

/**
 * Security Checklist
 */
export const SECURITY_CHECKLIST = {
  preDeployment: [
    'Verify CSP headers are correctly set',
    'Enable HTTPS/SSL certificate',
    'Disable source maps in production',
    'Enable code minification',
    'Remove console statements',
    'Test session timeout functionality',
    'Verify rate limiting works',
    'Test encryption/decryption',
    'Review audit logs for errors',
    'Verify no sensitive data in localStorage',
    'Test CSRF token validation',
    'Run security audit tools (npm audit, OWASP ZAP)',
  ],
  postDeployment: [
    'Monitor audit logs for unusual activity',
    'Track rate limiting triggers',
    'Review security alerts daily',
    'Test session timeout with real users',
    'Verify HTTPS is enforced',
    'Check security headers with securityheaders.com',
    'Monitor performance impact of encryption',
    'Review user feedback for security issues',
    'Plan regular security updates',
    'Conduct monthly security reviews',
  ],
};

export default SECURITY_CONFIG;
