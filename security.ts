/**
 * Security Module for Retirement Calculator
 * Provides encryption, validation, and audit logging capabilities
 */

// ============== ENCRYPTION & DECRYPTION ==============

/**
 * Simple XOR-based encryption (client-side only - NOT production grade)
 * For sensitive data, consider: TweetNaCl.js, libsodium.js, or crypto-js
 */
export class DataEncryption {
  private static readonly ALGORITHM = 'AES-GCM';
  private static key: CryptoKey | null = null;

  /**
   * Initialize encryption key from user's password or device fingerprint
   */
  static async initializeKey(seed: string = ''): Promise<void> {
    try {
      const saltedSeed = seed + this.getDeviceFingerprint();
      const encoder = new TextEncoder();
      const data = encoder.encode(saltedSeed);
      
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      this.key = await crypto.subtle.importKey(
        'raw',
        hashBuffer,
        { name: this.ALGORITHM, length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (e) {
      console.error('Failed to initialize encryption key:', e);
      throw new Error('Encryption initialization failed');
    }
  }

  /**
   * Encrypt sensitive data
   */
  static async encrypt(data: string): Promise<string> {
    if (!this.key) await this.initializeKey();
    
    try {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoder = new TextEncoder();
      const encoded = encoder.encode(data);
      
      const encrypted = await crypto.subtle.encrypt(
        { name: this.ALGORITHM, iv },
        this.key!,
        encoded
      );
      
      // Combine IV + encrypted data and return as base64
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);
      
      return this.arrayBufferToBase64(combined);
    } catch (e) {
      console.error('Encryption failed:', e);
      throw new Error('Data encryption failed');
    }
  }

  /**
   * Decrypt sensitive data
   */
  static async decrypt(encryptedData: string): Promise<string> {
    if (!this.key) await this.initializeKey();
    
    try {
      const combined = this.base64ToArrayBuffer(encryptedData);
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);
      
      const decrypted = await crypto.subtle.decrypt(
        { name: this.ALGORITHM, iv },
        this.key!,
        encrypted
      );
      
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (e) {
      console.error('Decryption failed:', e);
      throw new Error('Data decryption failed');
    }
  }

  /**
   * Get a device fingerprint for additional security
   */
  static getDeviceFingerprint(): string {
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset(),
      screen.width + 'x' + screen.height,
    ].join('|');
    
    return fingerprint;
  }

  private static arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < buffer.byteLength; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
  }

  private static base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}

// ============== INPUT VALIDATION & SANITIZATION ==============

export class InputValidator {
  /**
   * Validate and sanitize numeric input
   */
  static validateNumber(value: any, min?: number, max?: number): number {
    const num = Number(value);
    
    if (isNaN(num)) {
      throw new Error('Invalid number');
    }
    
    if (min !== undefined && num < min) {
      throw new Error(`Value must be at least ${min}`);
    }
    
    if (max !== undefined && num > max) {
      throw new Error(`Value must be at most ${max}`);
    }
    
    return num;
  }

  /**
   * Validate and sanitize string input (remove HTML/script tags)
   */
  static sanitizeString(value: string, maxLength: number = 255): string {
    if (typeof value !== 'string') return '';
    
    // Remove any HTML/script tags
    const sanitized = value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
    
    // Truncate to max length
    return sanitized.substring(0, maxLength);
  }

  /**
   * Validate age input
   */
  static validateAge(age: number, min: number = 18, max: number = 120): number {
    return this.validateNumber(age, min, max);
  }

  /**
   * Validate currency amount
   */
  static validateCurrency(amount: number, min: number = 0, max: number = 100000000): number {
    return this.validateNumber(amount, min, max);
  }

  /**
   * Validate percentage input
   */
  static validatePercentage(value: number, min: number = 0, max: number = 100): number {
    return this.validateNumber(value, min, max);
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// ============== AUDIT LOGGING ==============

export interface AuditLog {
  timestamp: number;
  eventType: 'input_change' | 'calculation' | 'export' | 'import' | 'security_alert' | 'pdf_generation';
  severity: 'low' | 'medium' | 'high';
  userId?: string;
  details: string;
  ipHash?: string;
}

export class SecurityAuditLogger {
  private static readonly MAX_LOGS = 500;
  private static readonly STORAGE_KEY = 'security-audit-logs';

  /**
   * Log a security event
   */
  static logEvent(eventType: AuditLog['eventType'], details: string, severity: AuditLog['severity'] = 'low'): void {
    const log: AuditLog = {
      timestamp: Date.now(),
      eventType,
      severity,
      details,
    };

    try {
      const logs = this.getLogs();
      logs.push(log);

      // Keep only the most recent logs
      const trimmedLogs = logs.slice(-this.MAX_LOGS);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedLogs));

      // Log high-severity events to console
      if (severity === 'high') {
        console.warn(`[SECURITY] ${eventType}:`, details);
      }
    } catch (e) {
      console.error('Failed to log security event:', e);
    }
  }

  /**
   * Get all audit logs
   */
  static getLogs(): AuditLog[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Clear audit logs
   */
  static clearLogs(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear audit logs:', e);
    }
  }

  /**
   * Export logs as JSON (for security review)
   */
  static exportLogs(): string {
    const logs = this.getLogs();
    return JSON.stringify(logs, null, 2);
  }
}

// ============== RATE LIMITING ==============

export class RateLimiter {
  private static readonly limits = new Map<string, { count: number; resetTime: number }>();

  /**
   * Check if action is rate limited
   */
  static isAllowed(actionKey: string, maxAttempts: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const limit = this.limits.get(actionKey);

    if (!limit || now > limit.resetTime) {
      this.limits.set(actionKey, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (limit.count < maxAttempts) {
      limit.count++;
      return true;
    }

    return false;
  }

  /**
   * Reset rate limit
   */
  static reset(actionKey: string): void {
    this.limits.delete(actionKey);
  }

  /**
   * Get remaining attempts
   */
  static getRemaining(actionKey: string, maxAttempts: number = 10): number {
    const limit = this.limits.get(actionKey);
    if (!limit || Date.now() > limit.resetTime) {
      return maxAttempts;
    }
    return Math.max(0, maxAttempts - limit.count);
  }
}

// ============== SESSION MANAGEMENT ==============

export class SessionManager {
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private static readonly STORAGE_KEY = 'session-metadata';
  private static timeoutId: ReturnType<typeof setTimeout> | null = null;

  /**
   * Initialize session
   */
  static initializeSession(): void {
    this.updateSessionActivity();
    this.startSessionTimeout();
  }

  /**
   * Update session activity timestamp
   */
  static updateSessionActivity(): void {
    try {
      const sessionData = {
        lastActivity: Date.now(),
        sessionStart: this.getSessionStart(),
        deviceFingerprint: this.getDeviceFingerprint(),
      };
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData));
      this.resetSessionTimeout();
    } catch (e) {
      console.error('Failed to update session:', e);
    }
  }

  /**
   * Get session start time
   */
  private static getSessionStart(): number {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        return data.sessionStart || Date.now();
      }
    } catch (e) {
      // Ignore
    }
    return Date.now();
  }

  /**
   * Check if session is active
   */
  static isSessionActive(): boolean {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (!stored) return true;

      const data = JSON.parse(stored);
      const timeSinceActivity = Date.now() - data.lastActivity;
      
      return timeSinceActivity < this.SESSION_TIMEOUT;
    } catch (e) {
      return true;
    }
  }

  /**
   * Check for unusual device activity
   */
  static checkDeviceConsistency(): boolean {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (!stored) return true;

      const data = JSON.parse(stored);
      const currentFingerprint = this.getDeviceFingerprint();
      
      // If device fingerprint changed significantly, log warning
      if (data.deviceFingerprint && data.deviceFingerprint !== currentFingerprint) {
        SecurityAuditLogger.logEvent('security_alert', 'Device fingerprint changed', 'medium');
        return false;
      }

      return true;
    } catch (e) {
      return true;
    }
  }

  /**
   * Clear session
   */
  static clearSession(): void {
    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
      if (this.timeoutId) clearTimeout(this.timeoutId);
    } catch (e) {
      console.error('Failed to clear session:', e);
    }
  }

  private static startSessionTimeout(): void {
    this.resetSessionTimeout();
  }

  private static resetSessionTimeout(): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    
    this.timeoutId = setTimeout(() => {
      SecurityAuditLogger.logEvent('security_alert', 'Session timeout triggered', 'medium');
      this.clearSession();
      // Dispatch custom event so UI can react
      window.dispatchEvent(new CustomEvent('session-expired'));
    }, this.SESSION_TIMEOUT);
  }

  private static getDeviceFingerprint(): string {
    return [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset(),
      screen.width + 'x' + screen.height,
    ].join('|');
  }
}

// ============== DATA EXPORT WITH ENCRYPTION ==============

export class SecureDataExport {
  /**
   * Export data with optional encryption
   */
  static async exportData(
    data: any,
    filename: string,
    encrypted: boolean = true
  ): Promise<void> {
    try {
      SecurityAuditLogger.logEvent('export', `User exported data: ${filename}`, 'medium');

      let content = JSON.stringify(data, null, 2);

      if (encrypted) {
        content = await DataEncryption.encrypt(content);
      }

      // Create blob and download
      const blob = new Blob([content], { 
        type: encrypted ? 'application/octet-stream' : 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = encrypted ? `${filename}.encrypted` : `${filename}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      SecurityAuditLogger.logEvent('export', `Data export failed: ${e}`, 'high');
      throw e;
    }
  }

  /**
   * Import encrypted data
   */
  static async importData(file: File, isEncrypted: boolean = false): Promise<any> {
    try {
      const content = await file.text();
      let data = content;

      if (isEncrypted) {
        data = await DataEncryption.decrypt(content);
      }

      SecurityAuditLogger.logEvent('import', 'User imported data', 'medium');
      return JSON.parse(data);
    } catch (e) {
      SecurityAuditLogger.logEvent('import', `Data import failed: ${e}`, 'high');
      throw new Error('Failed to import data');
    }
  }
}

// ============== CSRF TOKEN GENERATION ==============

export class CSRFProtection {
  private static readonly TOKEN_KEY = 'csrf-token';
  private static readonly STORAGE_KEY = 'csrf-tokens';

  /**
   * Generate CSRF token
   */
  static generateToken(): string {
    const token = this.randomToken();
    this.storeToken(token);
    return token;
  }

  /**
   * Verify CSRF token
   */
  static verifyToken(token: string): boolean {
    const tokens = this.getStoredTokens();
    if (tokens.includes(token)) {
      // Remove used token
      this.removeToken(token);
      return true;
    }
    return false;
  }

  private static randomToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private static storeToken(token: string): void {
    try {
      const tokens = this.getStoredTokens();
      tokens.push(token);
      // Keep only last 10 tokens
      const trimmed = tokens.slice(-10);
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.error('Failed to store CSRF token:', e);
    }
  }

  private static removeToken(token: string): void {
    try {
      const tokens = this.getStoredTokens().filter(t => t !== token);
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokens));
    } catch (e) {
      console.error('Failed to remove CSRF token:', e);
    }
  }

  private static getStoredTokens(): string[] {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }
}

// Initialize security on module load
if (typeof window !== 'undefined') {
  // Initialize session tracking
  SessionManager.initializeSession();
  
  // Listen for user activity
  document.addEventListener('mousemove', () => SessionManager.updateSessionActivity());
  document.addEventListener('keypress', () => SessionManager.updateSessionActivity());
  document.addEventListener('click', () => SessionManager.updateSessionActivity());
}
