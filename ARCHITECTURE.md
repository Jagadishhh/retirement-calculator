# Security Architecture Diagrams

## 1. Overall Security Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Security Panel (Lock Icon)                              │  │
│  │  - View Security Status                                  │  │
│  │  - Download Audit Logs                                   │  │
│  │  - Clear All Data                                        │  │
│  │  - Session Information                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     INPUT LAYER (VALIDATION)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  InputValidator                                          │  │
│  │  ├─ validateNumber(min, max)                             │  │
│  │  ├─ validateCurrency(amount)                             │  │
│  │  ├─ validateAge(age)                                     │  │
│  │  ├─ validatePercentage(value)                            │  │
│  │  ├─ sanitizeString(str)                                  │  │
│  │  └─ validateEmail(email)                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              PROCESSING LAYER (RATE LIMITING)                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  RateLimiter                                             │  │
│  │  ├─ PDF Export: 5/60 seconds                             │  │
│  │  ├─ Data Export: 10/300 seconds                          │  │
│  │  ├─ Data Import: 10/300 seconds                          │  │
│  │  └─ Configurable for custom actions                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│           SECURITY LAYER (ENCRYPTION & TOKENS)                  │
│  ┌────────────────────┐  ┌────────────────────────────────────┐ │
│  │ DataEncryption     │  │ CSRFProtection                     │ │
│  │ ├─ AES-256-GCM     │  │ ├─ Generate Tokens                │ │
│  │ ├─ Device FP       │  │ ├─ Verify Tokens                  │ │
│  │ └─ Random IV       │  │ └─ Single-use                      │ │
│  └────────────────────┘  └────────────────────────────────────┘ │
│  ┌────────────────────┐  ┌────────────────────────────────────┐ │
│  │ SessionManager     │  │ SecureDataExport                   │ │
│  │ ├─ 30min Timeout   │  │ ├─ AES-256 Export                │ │
│  │ ├─ Device Check    │  │ ├─ JSON Export                    │ │
│  │ └─ Activity Track  │  │ └─ Import Encrypted               │ │
│  └────────────────────┘  └────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  LOGGING LAYER (AUDIT)                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SecurityAuditLogger                                     │  │
│  │  ├─ input_change (User actions)                          │  │
│  │  ├─ calculation (Financial calcs)                        │  │
│  │  ├─ export/import (Data transfers)                       │  │
│  │  ├─ security_alert (Threats/anomalies)                   │  │
│  │  ├─ pdf_generation (Reports)                             │  │
│  │  └─ Stored: LocalStorage (500 max)                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    STORAGE LAYER (LOCAL)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  LocalStorage                                            │  │
│  │  ├─ retire-plan-data (Encrypted optional)               │  │
│  │  └─ security-audit-logs (Encrypted optional)            │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  SessionStorage                                          │  │
│  │  ├─ csrf-tokens (Single-use)                            │  │
│  │  └─ session-metadata (Activity tracking)                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    TRANSPORT LAYER (HTTPS)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Server Security Headers                                 │  │
│  │  ├─ X-Content-Type-Options: nosniff                      │  │
│  │  ├─ X-Frame-Options: DENY                                │  │
│  │  ├─ X-XSS-Protection: 1; mode=block                      │  │
│  │  ├─ Referrer-Policy: strict-origin-when-cross-origin     │  │
│  │  ├─ Strict-Transport-Security: max-age=31536000          │  │
│  │  └─ CSP: default-src 'self'; script-src...               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow Security

```
┌──────────────────┐
│  USER INPUT      │
│  (Age, Income,   │
│   Expenses, etc) │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│ INPUT VALIDATION                 │
│ ├─ Range checking                │
│ ├─ Type validation               │
│ ├─ HTML sanitization             │
│ └─ Injection prevention           │
└────────┬──────────────────────────┘
         │
    ✓ Valid?
    ├─ Yes → Continue
    └─ No  → Reject + Log
         │
         ▼
┌──────────────────────────────────┐
│ RATE LIMIT CHECK                 │
│ (Check attempts count)           │
└────────┬──────────────────────────┘
         │
    Within limit?
    ├─ Yes → Continue
    └─ No  → Block (60s timeout)
         │
         ▼
┌──────────────────────────────────┐
│ CSRF TOKEN VALIDATION            │
│ (For sensitive operations)       │
└────────┬──────────────────────────┘
         │
    Valid token?
    ├─ Yes → Consume token
    └─ No  → Reject
         │
         ▼
┌──────────────────────────────────┐
│ PROCESS DATA                     │
│ ├─ Financial calculations        │
│ ├─ Scenario modeling             │
│ └─ Projection generation         │
└────────┬──────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ LOG AUDIT EVENT                  │
│ ├─ Event type                    │
│ ├─ Timestamp                     │
│ ├─ Severity level                │
│ └─ Event details                 │
└────────┬──────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ OPTIONAL ENCRYPTION              │
│ (For export or sensitive data)   │
└────────┬──────────────────────────┘
         │
    Encrypt?
    ├─ Yes → AES-256-GCM
    └─ No  → Plain JSON
         │
         ▼
┌──────────────────────────────────┐
│ STORE DATA                       │
│ ├─ LocalStorage (Long-term)      │
│ ├─ SessionStorage (Tokens)       │
│ └─ Memory (Current session)      │
└──────────────────────────────────┘
```

---

## 3. Session Management Flow

```
┌──────────────────────────┐
│  APP INITIALIZATION      │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ SessionManager.initializeSession()  │
│ ├─ Get device fingerprint            │
│ ├─ Create session metadata           │
│ ├─ Start timeout timer (30min)       │
│ └─ Attach activity listeners         │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ SESSION ACTIVE (30 minutes)          │
│ └─ User can interact normally        │
└────────┬─────────────────────────────┘
         │
┌────────────────────────────────────────┐
│ USER ACTIVITY DETECTED                 │
│ (Click, Type, Mouse Move)              │
│ └─ Reset timeout timer                 │
└────────┬──────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ VERIFY DEVICE FINGERPRINT            │
│ ├─ Match current device?              │
│ ├─ Same browser?                      │
│ └─ Same timezone/resolution?          │
└────────┬─────────────────────────────┘
         │
    Device consistent?
    ├─ Yes → Continue
    └─ No  → Log alert, block access
         │
         ▼
┌──────────────────────────────────────┐
│ TIMEOUT COUNTDOWN                    │
│ └─ 30 minutes no activity             │
└────────┬─────────────────────────────┘
         │
         ▼ (After 30 min)
┌──────────────────────────────────────┐
│ SESSION EXPIRED                      │
│ ├─ Clear all data                    │
│ ├─ Show warning banner               │
│ ├─ Log security alert                │
│ └─ Dispatch 'session-expired' event   │
└──────────────────────────────────────┘
```

---

## 4. Encryption/Decryption Process

```
┌─────────────────────────────┐
│ PLAINTEXT DATA              │
│ "My sensitive data here"    │
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ DERIVE ENCRYPTION KEY                    │
│ ├─ Get device fingerprint                │
│ ├─ Hash with SHA-256                     │
│ ├─ Import as AES-256 key                 │
│ └─ Store in memory (not persistent)      │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ GENERATE RANDOM IV (12 bytes)            │
│ └─ crypto.getRandomValues()              │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ ENCRYPT WITH AES-256-GCM                 │
│ ├─ Algorithm: AES-GCM                    │
│ ├─ Key: 256-bit derived key              │
│ ├─ IV: Random 12-byte nonce              │
│ └─ Output: Ciphertext                    │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ COMBINE IV + CIPHERTEXT                  │
│ ├─ Prepend IV to ciphertext              │
│ ├─ Total: IV (12) + Encrypted (n)        │
│ └─ Result: Combined binary data          │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ ENCODE TO BASE64                         │
│ └─ Safe for storage/transmission         │
└────────┬─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ ENCRYPTED DATA (Base64)     │
│ "aG9zdEhlbHBsYXVuY2g..."   │
└─────────────────────────────┘

═══════════════════════════════════════════════════════════════

DECRYPTION PROCESS (Reverse)

┌─────────────────────────────┐
│ ENCRYPTED DATA (Base64)     │
│ "aG9zdEhlbHBsYXVuY2g..."   │
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ DECODE FROM BASE64                       │
│ └─ Convert back to binary                │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ EXTRACT IV (first 12 bytes)              │
│ └─ Separate from ciphertext              │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ DERIVE SAME ENCRYPTION KEY               │
│ ├─ Use same device fingerprint           │
│ ├─ Hash with SHA-256                     │
│ └─ Import as AES-256 key                 │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ DECRYPT WITH AES-256-GCM                 │
│ ├─ Algorithm: AES-GCM                    │
│ ├─ Key: 256-bit derived key              │
│ ├─ IV: Extracted IV                      │
│ └─ Input: Ciphertext                     │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ VERIFY AUTHENTICATION TAG                │
│ ├─ GCM provides integrity check          │
│ ├─ Detects any tampering                 │
│ └─ Throw error if modified               │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ DECODE PLAINTEXT                         │
│ └─ TextDecoder to string                 │
└────────┬─────────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ PLAINTEXT DATA              │
│ "My sensitive data here"    │
└─────────────────────────────┘
```

---

## 5. Rate Limiting Algorithm

```
REQUEST COMES IN
    │
    ▼
┌────────────────────────────────────┐
│ Check RateLimiter.isAllowed()      │
│ (Action: 'pdf-download')           │
└────────┬─────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│ Look up action in RateLimiter map     │
│ └─ Key: 'pdf-download'                │
└────────┬─────────────────────────────────┘
         │
    Does entry exist?
    ├─ No  → Create new entry
    │       count=1, resetTime=now+60s
    │       → ALLOW (return true)
    │
    └─ Yes → Check if expired
             Is now > resetTime?
             ├─ Yes  → Reset counter
             │         count=1, resetTime=now+60s
             │         → ALLOW (return true)
             │
             └─ No   → Check attempt count
                       Is count < maxAttempts (5)?
                       ├─ Yes  → Increment count
                       │         count++
                       │         → ALLOW (return true)
                       │
                       └─ No   → At limit
                                 → BLOCK (return false)

TIMELINE EXAMPLE:
┌─────────────────────────────────────────────────────────┐
│  0s: Request 1 → Allow  (count=1)                       │
│  5s: Request 2 → Allow  (count=2)                       │
│ 10s: Request 3 → Allow  (count=3)                       │
│ 15s: Request 4 → Allow  (count=4)                       │
│ 20s: Request 5 → Allow  (count=5) ← LIMIT REACHED      │
│ 25s: Request 6 → BLOCK  (count=5, waiting 35s)         │
│ 30s: Request 7 → BLOCK  (count=5, waiting 30s)         │
│ 45s: Request 8 → BLOCK  (count=5, waiting 15s)         │
│ 60s: Request 9 → Allow  (reset, count=1) ✓             │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Authentication & Authorization Flow

```
┌──────────────────────────┐
│ USER INTERACTION         │
│ (Click, Input, Action)   │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ SESSION VALIDATION                       │
│ ├─ Is session active?                    │
│ ├─ Is device same?                       │
│ └─ Is timestamp valid?                   │
└────────┬──────────────────────────────────┘
         │
    Session valid?
    ├─ No  → Block, show warning
    └─ Yes → Continue
         │
         ▼
┌──────────────────────────────────────────┐
│ CSRF TOKEN CHECK                         │
│ (For sensitive operations)               │
│ ├─ Does token exist?                     │
│ ├─ Is it in valid tokens?                │
│ └─ Is it not expired?                    │
└────────┬──────────────────────────────────┘
         │
    Token valid?
    ├─ No  → Block action
    └─ Yes → Consume token
         │
         ▼
┌──────────────────────────────────────────┐
│ INPUT VALIDATION                         │
│ ├─ Type check                            │
│ ├─ Range check                           │
│ └─ Sanitization                          │
└────────┬──────────────────────────────────┘
         │
    Input valid?
    ├─ No  → Reject + Log
    └─ Yes → Continue
         │
         ▼
┌──────────────────────────────────────────┐
│ RATE LIMIT CHECK                         │
│ ├─ Check action limit                    │
│ ├─ Check window                          │
│ └─ Check attempt count                   │
└────────┬──────────────────────────────────┘
         │
    Allowed?
    ├─ No  → Block + Log
    └─ Yes → Proceed
         │
         ▼
┌──────────────────────────────────────────┐
│ EXECUTE ACTION                           │
│ ├─ Process data                          │
│ ├─ Optional encryption                   │
│ └─ Store/export/calculate                │
└────────┬──────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ AUDIT LOGGING                            │
│ ├─ Event type                            │
│ ├─ Timestamp                             │
│ ├─ Severity                              │
│ └─ Details                               │
└────────┬──────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ RETURN RESULT TO USER                    │
│ ├─ Success message                       │
│ ├─ Error details (if failed)             │
│ └─ UI update                             │
└──────────────────────────────────────────┘
```

---

## 7. Threat Response Matrix

```
┌─────────────────────────────────────────────────────────────┐
│ THREAT DETECTED                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ XSS Attack?                                                │
│ ├─ Prevention: CSP, Input Sanitization                     │
│ ├─ Detection: XSS patterns in input                        │
│ └─ Response: Block + Log as "security_alert"              │
│                                                             │
│ CSRF Attack?                                               │
│ ├─ Prevention: CSRF Tokens                                 │
│ ├─ Detection: Invalid token                                │
│ └─ Response: Block + Log as "security_alert"              │
│                                                             │
│ Brute Force?                                               │
│ ├─ Prevention: Rate Limiting                               │
│ ├─ Detection: Excessive attempts                           │
│ └─ Response: Block 60s + Log as "security_alert"          │
│                                                             │
│ Session Hijacking?                                         │
│ ├─ Prevention: Device Fingerprinting                       │
│ ├─ Detection: Device change                                │
│ └─ Response: Clear session + Log as "security_alert"      │
│                                                             │
│ Data Tampering?                                            │
│ ├─ Prevention: Encryption (GCM auth)                       │
│ ├─ Detection: Auth tag mismatch                            │
│ └─ Response: Reject + Log as "security_alert"             │
│                                                             │
│ Injection Attack?                                          │
│ ├─ Prevention: Input Validation                            │
│ ├─ Detection: Patterns in input                            │
│ └─ Response: Reject + Log as "security_alert"             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Security Panel Information Flow

```
┌─────────────────────────────────────────┐
│ SECURITY PANEL (Lock Icon)              │
│ Bottom-Right Corner of Screen           │
└────────┬────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│ DISPLAY SECURITY STATUS                      │
├──────────────────────────────────────────────┤
│                                              │
│ ✓ Data Protection                            │
│   - All data stored locally                  │
│   - No cloud servers                         │
│   - Fully encrypted (optional)               │
│                                              │
│ ✓ Security Features                          │
│   - CSP enabled (XSS prevention)             │
│   - Input validation active                  │
│   - Rate limiting enabled                    │
│   - Session timeout: 30 min                  │
│   - Audit logging active                     │
│   - Device fingerprinting on                 │
│                                              │
│ ✓ Session Status                             │
│   - Current session active                   │
│   - Time remaining: [15m 23s]                │
│   - Device verified                          │
│   - Audit logs: [127 events]                 │
│                                              │
│ ACTIONS:                                     │
│ [Clear All Data] [Download Audit Log]        │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 9. Data Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│ CREATION                                                    │
│ User creates retirement plan with financial details        │
└────────┬────────────────────────────────────────────────────┘
         │ Input Validation ↓
         ▼
┌─────────────────────────────────────────────────────────────┐
│ PROCESSING                                                  │
│ Calculations, projections, scenario modeling               │
└────────┬────────────────────────────────────────────────────┘
         │ Audit Log (low) ↓
         ▼
┌─────────────────────────────────────────────────────────────┐
│ STORAGE                                                     │
│ LocalStorage (retire-plan-data)                             │
│ - Plain JSON or encrypted optional                          │
│ - Device fingerprint verification                          │
└────────┬────────────────────────────────────────────────────┘
         │
    ┌────────┬──────────────┬──────────────┐
    │        │              │              │
    ▼        ▼              ▼              ▼
┌────────┐ ┌──────┐   ┌──────┐   ┌───────────┐
│ ACCESS │ │ EDIT │   │EXPORT│   │CALCULATE  │
│        │ │      │   │      │   │  AGAIN    │
│Used in │ │Next  │   │With  │   │With new   │
│report, │ │session│  │encrypt│  │assumptions│
│PDF     │ │      │   │option │   │           │
└────────┘ └──────┘   └──────┘   └───────────┘
    │        │          │           │
    │        │          │           │
    │        │          ▼           │
    │        │    ┌──────────────┐ │
    │        │    │ Export File  │ │
    │        │    │ (Encrypted/  │ │
    │        │    │  Plain JSON) │ │
    │        │    └──────────────┘ │
    │        │          │           │
    │        ▼          ▼           ▼
    │    ┌────────────────────────────────┐
    └──→│ DELETION                         │
        │ ├─ User clears (Security Panel) │
        │ ├─ Session timeout              │
        │ ├─ Manual localStorage.clear()  │
        │ └─ Secure data wipe             │
        └────────────────────────────────┘
```

---

*These diagrams represent the security architecture of the Retirement Calculator application.*
*Last Updated: December 5, 2025*
