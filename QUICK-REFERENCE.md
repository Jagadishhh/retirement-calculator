# Quick Reference Guide - Security Features

## 🚀 Quick Start

### For Users
1. **Open the app** - All security features active automatically
2. **Use normally** - Validation happens silently
3. **View security status** - Click lock icon (bottom-right)
4. **Clear data** - Use "Clear All Data" button in Security Panel
5. **Export audit logs** - Click "Download Audit Log" button

### For Developers
1. **Import security modules:**
   ```typescript
   import { DataEncryption, InputValidator, SecurityAuditLogger } from './security';
   ```
2. **Initialize on app start:**
   ```typescript
   SessionManager.initializeSession();
   ```
3. **Use in components:**
   ```typescript
   SecurityAuditLogger.logEvent('action', 'description', 'severity');
   ```

---

## 🔐 Feature Quick Reference

### Encryption
```typescript
// Encrypt data
const encrypted = await DataEncryption.encrypt("sensitive data");

// Decrypt data
const decrypted = await DataEncryption.decrypt(encrypted);

// Get device fingerprint
const fingerprint = DataEncryption.getDeviceFingerprint();
```

### Input Validation
```typescript
// Validate number (with range)
InputValidator.validateNumber(value, min, max);

// Validate age
InputValidator.validateAge(25); // Throws if <18 or >120

// Validate currency
InputValidator.validateCurrency(100000); // Throws if negative or > 100M

// Validate percentage
InputValidator.validatePercentage(12.5); // Throws if <0 or >100

// Sanitize string (removes HTML)
InputValidator.sanitizeString("<script>alert('xss')</script>");
// Returns: ""

// Validate email
InputValidator.validateEmail("user@example.com");
```

### Audit Logging
```typescript
// Log event with severity
SecurityAuditLogger.logEvent('input_change', 'User updated income', 'low');
SecurityAuditLogger.logEvent('pdf_generation', 'Report exported', 'low');
SecurityAuditLogger.logEvent('security_alert', 'Session timeout', 'high');

// Get all logs
const logs = SecurityAuditLogger.getLogs();

// Export logs to JSON
const jsonLogs = SecurityAuditLogger.exportLogs();

// Clear all logs
SecurityAuditLogger.clearLogs();
```

### Rate Limiting
```typescript
// Check if allowed
if (RateLimiter.isAllowed('pdf-download', 5, 60000)) {
  // Generate PDF (5 per 60 seconds allowed)
}

// Get remaining attempts
const remaining = RateLimiter.getRemaining('pdf-download');
alert(`${remaining} PDF exports remaining`);

// Reset limit
RateLimiter.reset('pdf-download');
```

### Session Management
```typescript
// Initialize session (auto on app load)
SessionManager.initializeSession();

// Update activity on user interaction
SessionManager.updateSessionActivity();

// Check if session active
if (SessionManager.isSessionActive()) {
  // Continue with operation
}

// Verify device hasn't changed
if (SessionManager.checkDeviceConsistency()) {
  // Device is consistent
}

// Clear session
SessionManager.clearSession();
```

### Secure Data Export
```typescript
// Export data (with encryption)
await SecureDataExport.exportData(data, 'my-plan', true);

// Export data (without encryption)
await SecureDataExport.exportData(data, 'my-plan', false);

// Import encrypted file
const data = await SecureDataExport.importData(file, true);

// Import regular JSON
const data = await SecureDataExport.importData(file, false);
```

### CSRF Protection
```typescript
// Generate new token
const token = CSRFProtection.generateToken();

// Verify token before action
if (CSRFProtection.verifyToken(userProvidedToken)) {
  // Proceed with sensitive operation
}
```

---

## ⚙️ Configuration Quick Reference

### Session Timeout
```typescript
// In security-config.ts
session: {
  timeout: 30 * 60 * 1000, // 30 minutes
}

// Change to 1 hour:
session: {
  timeout: 60 * 60 * 1000, // 1 hour
}
```

### Rate Limits
```typescript
// Current limits in security-config.ts:
rateLimiting: {
  limits: {
    pdfGeneration: { maxAttempts: 5, windowMs: 60000 },
    dataExport: { maxAttempts: 10, windowMs: 300000 },
    dataImport: { maxAttempts: 10, windowMs: 300000 },
  }
}
```

### Enable/Disable Features
```typescript
// In security-config.ts
features: {
  dataEncryption: true,      // Toggle encryption
  inputValidation: true,      // Toggle validation
  rateLimiting: true,         // Toggle rate limits
  sessionTimeout: true,       // Toggle session timeout
  auditLogging: true,         // Toggle audit logs
  csrfProtection: true,       // Toggle CSRF
  deviceFingerprinting: true, // Toggle fingerprint
  securityPanel: true,        // Toggle security UI
}
```

---

## 🎯 Common Use Cases

### Scenario 1: User Changes Income
```typescript
const handleIncomeChange = (value: number) => {
  try {
    const validated = InputValidator.validateCurrency(value);
    SecurityAuditLogger.logEvent('input_change', 'Updated income', 'low');
    setIncome(validated);
  } catch (e) {
    alert('Invalid income amount');
    SecurityAuditLogger.logEvent('input_change', `Invalid income: ${e}`, 'medium');
  }
};
```

### Scenario 2: Generate PDF Report
```typescript
const handleGeneratePDF = () => {
  if (!RateLimiter.isAllowed('pdf-download', 5, 60000)) {
    alert('Too many exports. Wait 1 minute.');
    return;
  }
  
  try {
    generatePDF();
    SecurityAuditLogger.logEvent('pdf_generation', 'Report generated', 'low');
  } catch (e) {
    SecurityAuditLogger.logEvent('pdf_generation', `Failed: ${e}`, 'high');
  }
};
```

### Scenario 3: Export Data Securely
```typescript
const handleExportData = async () => {
  if (!RateLimiter.isAllowed('data-export', 10, 300000)) {
    alert('Too many exports. Wait 5 minutes.');
    return;
  }
  
  try {
    await SecureDataExport.exportData(userData, 'retirement-plan', true);
    SecurityAuditLogger.logEvent('export', 'Data exported (encrypted)', 'low');
  } catch (e) {
    SecurityAuditLogger.logEvent('export', `Export failed: ${e}`, 'high');
  }
};
```

### Scenario 4: Check Session Status
```typescript
useEffect(() => {
  const checkSession = () => {
    if (!SessionManager.isSessionActive()) {
      setWarning('Session expired');
      clearAllData();
    }
    if (!SessionManager.checkDeviceConsistency()) {
      SecurityAuditLogger.logEvent('security_alert', 'Device changed', 'medium');
    }
  };
  
  const interval = setInterval(checkSession, 5000);
  return () => clearInterval(interval);
}, []);
```

---

## 📊 Monitoring & Debugging

### Check Security Status in Console
```typescript
// Check if security modules loaded
console.log(typeof DataEncryption); // "object"
console.log(typeof InputValidator); // "object"

// Check device fingerprint
console.log(DataEncryption.getDeviceFingerprint());

// Check session status
console.log(SessionManager.isSessionActive()); // true/false

// View all audit logs
console.log(SecurityAuditLogger.getLogs());
```

### Monitor Rate Limiting
```typescript
// Check remaining attempts for PDF export
const remaining = RateLimiter.getRemaining('pdf-download');
console.log(`PDF exports remaining: ${remaining}`);
```

### Export Audit Logs for Analysis
```typescript
// In Security Panel or manually:
const logs = SecurityAuditLogger.exportLogs();
const blob = new Blob([logs], { type: 'application/json' });
// Download blob as JSON file
```

---

## ⚠️ Error Handling

### Input Validation Errors
```typescript
try {
  InputValidator.validateCurrency(-1000);
} catch (e) {
  console.error(e.message); // "Value must be at least 0"
}
```

### Encryption Errors
```typescript
try {
  await DataEncryption.encrypt(data);
} catch (e) {
  console.error('Encryption failed:', e);
  SecurityAuditLogger.logEvent('security_alert', `Encryption error: ${e}`, 'high');
}
```

### Session Errors
```typescript
try {
  SessionManager.initializeSession();
} catch (e) {
  console.error('Session init failed:', e);
}
```

---

## 🔍 Testing Checklist

### Manual Testing
- [ ] Create user account and add data
- [ ] Verify input validation (try invalid ages, negative income)
- [ ] Check audit log contains entries
- [ ] Generate 6 PDFs in 1 minute (6th should fail)
- [ ] Wait 30 minutes and verify session timeout
- [ ] Export and download data
- [ ] Check Security Panel shows correct status
- [ ] Clear all data and verify reset

### Automated Testing
```typescript
// Example test
describe('Security Features', () => {
  test('validates currency input', () => {
    expect(() => InputValidator.validateCurrency(-100))
      .toThrow();
  });

  test('rate limiting works', () => {
    const allowed1 = RateLimiter.isAllowed('test', 1, 1000);
    const allowed2 = RateLimiter.isAllowed('test', 1, 1000);
    expect(allowed1).toBe(true);
    expect(allowed2).toBe(false);
  });

  test('encryption roundtrip works', async () => {
    const original = 'test data';
    const encrypted = await DataEncryption.encrypt(original);
    const decrypted = await DataEncryption.decrypt(encrypted);
    expect(decrypted).toBe(original);
  });
});
```

---

## 🆘 Troubleshooting

### CSP Violations
**Problem:** Console shows CSP errors
**Solution:** 
1. Check index.html CSP meta tag
2. Add domain to CSP allowlist
3. Verify script sources are whitelisted

### Encryption Not Working
**Problem:** `DataEncryption.encrypt()` fails
**Solution:**
1. Check WebCrypto API available: `typeof crypto.subtle !== 'undefined'`
2. Ensure HTTPS or localhost
3. Check browser compatibility (Chrome 91+)

### Session Timeout Not Working
**Problem:** Session doesn't timeout after 30 minutes
**Solution:**
1. Check SessionManager initialized: `SessionManager.initializeSession()`
2. Verify event listeners attached
3. Check browser console for errors
4. Increase timeout in security-config.ts for testing

### Rate Limiting Too Strict
**Problem:** PDF generation blocked too often
**Solution:**
1. Adjust limits in security-config.ts
2. Increase `maxAttempts` value
3. Increase `windowMs` value
4. Check audit logs for actual usage patterns

### Audit Logs Not Saving
**Problem:** Audit logs empty or missing
**Solution:**
1. Check localStorage not disabled
2. Verify SecurityAuditLogger.logEvent() being called
3. Check browser's localStorage quota
4. Clear localStorage and try again

---

## 📚 Additional Resources

### Internal Documentation
- **SECURITY.md** - 18-section comprehensive guide
- **SECURITY-README.md** - User-friendly overview
- **security-config.ts** - Configuration with comments
- **security.ts** - Source code with JSDoc comments

### External Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [WebCrypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Security Headers](https://securityheaders.com/)

---

## 🔗 Quick Links

| Feature | File | Function |
|---------|------|----------|
| Encryption | security.ts | `DataEncryption.encrypt()` |
| Validation | security.ts | `InputValidator.validate*()` |
| Logging | security.ts | `SecurityAuditLogger.logEvent()` |
| Rate Limit | security.ts | `RateLimiter.isAllowed()` |
| Session | security.ts | `SessionManager.*()` |
| Export | security.ts | `SecureDataExport.*()` |
| CSRF | security.ts | `CSRFProtection.*()` |
| Config | security-config.ts | `SECURITY_CONFIG` |
| Docs | SECURITY.md | Full guide |

---

## 💡 Pro Tips

1. **Monitor Audit Logs Weekly** - Download and review for patterns
2. **Keep Session Timeout Short** - 30 min recommended for financial data
3. **Use Encrypted Export** - For sensitive data backups
4. **Test Rate Limits** - Before production deployment
5. **Update Browser** - Keep WebCrypto API current
6. **Clear Cache** - Clear cookies/cache after financial planning sessions
7. **Use HTTPS** - Always, without exception
8. **Review Changes** - Review security-config.ts changes before deploy

---

## ✅ Security Checklist

### Daily
- [ ] App loads without CSP errors
- [ ] Validation prevents invalid inputs
- [ ] Rate limiting works as expected

### Weekly
- [ ] Download and review audit logs
- [ ] Check for security alerts in logs
- [ ] Verify session timeout working

### Monthly
- [ ] Run npm audit for vulnerabilities
- [ ] Review security-config.ts
- [ ] Test encryption/decryption
- [ ] Clear old audit logs

### Quarterly
- [ ] Full security audit
- [ ] Update dependencies
- [ ] Test all security features
- [ ] Review browser compatibility

---

**🔒 Your financial security starts here!**

*Last Updated: December 5, 2025*
