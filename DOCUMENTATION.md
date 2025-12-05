# Retirement Calculator - Complete Documentation

**Last Updated:** December 5, 2025  
**Status:** ✅ Production Ready  
**Version:** 1.0.0

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Project Overview](#project-overview)
3. [Features](#features)
4. [Security Architecture](#security-architecture)
5. [Installation & Setup](#installation--setup)
6. [Usage Guide](#usage-guide)
7. [Project Structure](#project-structure)
8. [Development](#development)
9. [Deployment](#deployment)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Set your Gemini API key
# Edit .env.local and add: GEMINI_API_KEY=your_key_here

# 3. Start development server
npm run dev

# 4. Open in browser
# http://localhost:3000/retirement-calculator/
```

---

## 📖 Project Overview

The Retirement Calculator is a comprehensive web-based financial planning tool that helps users:

- **Plan retirement finances** with detailed projections
- **Model multiple scenarios** (Median, Best, Worst case)
- **Track major life expenses** (education, wedding, home)
- **Analyze cash flow** year by year
- **Generate PDF reports** for documentation
- **Maintain data security** with enterprise-grade encryption

### Key Technologies

- **Frontend:** React + TypeScript
- **Build Tool:** Vite v6.4.1
- **Styling:** Tailwind CSS
- **Encryption:** AES-256-GCM (SubtleCrypto API)
- **Charting:** Chart libraries for visualizations
- **Export:** PDF generation and data export

---

## ✨ Features

### Core Calculator Features

| Feature | Status | Description |
|---------|--------|-------------|
| Retirement Age Planning | ✅ | Calculate retirement timeline |
| Scenario Modeling | ✅ | Median, Best, Worst case scenarios |
| Monte Carlo Simulations | ✅ | Statistical probability analysis |
| Major Expense Tracking | ✅ | Education, wedding, home expenses |
| Cash Flow Analysis | ✅ | Year-by-year breakdown |
| PDF Report Generation | ✅ | Export detailed financial reports |
| Responsive Design | ✅ | Works on desktop, tablet, mobile |

### Security Features (12 Total)

| # | Feature | Status | Details |
|---|---------|--------|---------|
| 1 | Content Security Policy | ✅ | Prevents XSS and script injection |
| 2 | HTTP Security Headers | ✅ | X-Frame-Options, X-Content-Type-Options, etc. |
| 3 | AES-256-GCM Encryption | ✅ | Client-side data encryption |
| 4 | Input Validation | ✅ | Sanitization and range checking |
| 5 | Security Audit Logging | ✅ | Full activity tracking |
| 6 | Rate Limiting | ✅ | API call throttling |
| 7 | Session Management | ✅ | 30-minute timeout + device verification |
| 8 | CSRF Protection | ✅ | Token-based anti-CSRF |
| 9 | Secure Data Export | ✅ | Encrypted backup/restore |
| 10 | Build Optimizations | ✅ | Code minification and optimization |
| 11 | Search Engine Prevention | ✅ | Meta robots: noindex, nofollow |
| 12 | Security Panel UI | ✅ | User-accessible security dashboard |

---

## 🔒 Security Architecture

### Data Flow Security

```
User Input → Validation → Encryption → Storage → Audit Log
    ↓            ↓           ↓           ↓          ↓
Range Check  Sanitize   AES-256-GCM  LocalStorage Tracked
Min/Max      HTML/Script Device FP     (Optional)   Timestamped
Format       Removal    Random IV      Encrypted    Events
```

### Security Layers

#### 1. Input Layer (Validation)
- **InputValidator** class validates all user inputs
- Range checking (min/max values)
- Type validation (number, string, email)
- HTML/Script sanitization
- Age validation (18-120)
- Currency amount validation (0-100M)
- Percentage validation (0-100)

#### 2. Processing Layer (Rate Limiting)
- **RateLimiter** class throttles operations
- PDF Export: 5 requests per 60 seconds
- Data Export: 10 requests per 300 seconds
- Data Import: 10 requests per 300 seconds
- Configurable for custom actions

#### 3. Security Layer (Encryption & Tokens)
- **DataEncryption**: AES-256-GCM client-side encryption
  - Device fingerprint-based key derivation
  - Random IV generation for each encryption
  - Authenticated encryption (prevents tampering)
  
- **SessionManager**: Session handling
  - 30-minute timeout
  - Device fingerprint verification
  - Activity tracking
  
- **CSRFProtection**: Token-based CSRF prevention
  - Single-use tokens
  - Generation and verification

#### 4. Logging Layer (Audit)
- **SecurityAuditLogger** tracks all operations
- Event types: `input_change`, `calculation`, `export`, `import`, `security_alert`, `pdf_generation`
- Max 500 log entries stored in LocalStorage
- Exportable for compliance

#### 5. Storage Layer
- **LocalStorage**: Persistent data storage
  - `retire-plan-data`: Encrypted user data (optional)
  - `security-audit-logs`: Encrypted audit logs (optional)
  
- **SessionStorage**: Temporary session data
  - `csrf-tokens`: Single-use tokens
  - `session-metadata`: Activity tracking

#### 6. Transport Layer
- **HTTPS/TLS**: All data in transit encrypted
- **Security Headers:**
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security: max-age=31536000`
  - `Content-Security-Policy: default-src 'self'`
  - `Permissions-Policy: geolocation=(), microphone=(), camera=()`

---

## 💾 Installation & Setup

### Step 1: Clone Repository
```bash
git clone https://github.com/Jagadishhh/retirement-calculator.git
cd retirement-calculator
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Configuration
Create `.env.local` file:
```env
GEMINI_API_KEY=your_api_key_here
```

### Step 4: Run Development Server
```bash
npm run dev
```

### Step 5: Build for Production
```bash
npm run build
```

### Step 6: Deploy
```bash
npm run deploy
```

---

## 📱 Usage Guide

### Main Interface

The application has three main sections:

1. **Sidebar (Left)** - Input Controls
   - Personal Details: Age, retirement age, life expectancy
   - Income & Expenses: Monthly income, expenses
   - Investments: Current savings, expected return
   - Assumptions: Inflation rate, step-up SIP

2. **Main Area (Center)** - Results & Charts
   - Financial summary cards
   - Chart visualizations
   - Scenario comparison

3. **Table Section (Bottom)** - Detailed Year-by-Year Breakdown
   - Age, Year, Cash Flow, Corpus
   - Phase (Accumulation/Transition/Decumulation)
   - Notable events and life milestones

### Security Panel

Click the **🔒 Lock Icon** (bottom-right) to access:
- Security Status Overview
- Download Audit Logs
- Clear All Data
- Session Information
- Device Fingerprint

### Data Management

**Export Data:**
- User data is optionally encrypted using AES-256-GCM
- Export includes all inputs and calculations
- Password-protected backup

**Import Data:**
- Restore from previously exported backup
- Automatic verification and decryption
- Validation of imported values

---

## 📁 Project Structure

```
retirement-calculator/
├── index.tsx                 # Main React component
├── index.html               # HTML entry point with CSP
├── security.ts              # Security module (encryption, validation, logging)
├── security-config.ts       # Security configuration
├── vite.config.ts           # Vite build config with security headers
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies and scripts
├── .env.local              # Environment variables (API keys)
├── .gitignore              # Git ignore rules
└── DOCUMENTATION.md         # This file
```

### Key Files

**index.tsx (1771+ lines)**
- Main React component
- Input controls (age, income, expenses, etc.)
- Financial calculations
- Chart rendering
- PDF generation
- Result tables
- Security panel UI

**security.ts (525 lines)**
- `DataEncryption`: AES-256-GCM encryption/decryption
- `InputValidator`: Input validation and sanitization
- `SecurityAuditLogger`: Audit logging
- `RateLimiter`: Rate limiting
- `SessionManager`: Session management
- `CSRFProtection`: CSRF token handling

**security-config.ts (340 lines)**
- Configuration constants
- Security thresholds
- Rate limiting rules
- Validation ranges
- Encryption settings

---

## 🛠 Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Deploy to production
npm run deploy

# Type check
npm run type-check

# Lint code
npm run lint
```

### Adding Features

When adding new features:

1. **Always validate inputs** using `InputValidator`
2. **Log sensitive operations** using `SecurityAuditLogger`
3. **Implement rate limiting** for API calls
4. **Update this documentation**
5. **Test security features** before deployment

### Modifying Security Settings

Edit `security-config.ts`:
- `ENCRYPTION_CONFIG`: AES-256-GCM settings
- `RATE_LIMITS`: API throttling rules
- `VALIDATION_RANGES`: Input validation bounds
- `SESSION_CONFIG`: Session timeout values
- `AUDIT_CONFIG`: Logging configuration

---

## 🚀 Deployment

### Production Build

```bash
# Create optimized build
npm run build

# Output goes to ./dist/
```

### Deployment Options

#### Option 1: GitHub Pages
```bash
npm run deploy  # Automated deployment
```

#### Option 2: Vercel
```bash
# Deploy using Vercel CLI
vercel
```

#### Option 3: Netlify
```bash
# Deploy using Netlify CLI
netlify deploy --prod --dir=dist
```

#### Option 4: Manual Deploy
1. Build the project: `npm run build`
2. Upload `dist/` directory to your web server
3. Configure HTTPS on server
4. Set security headers on server

### Security Checklist

Before deploying:

- ✅ Set `GEMINI_API_KEY` in environment variables
- ✅ Enable HTTPS on server
- ✅ Configure CSP headers
- ✅ Enable security headers
- ✅ Set up rate limiting on server
- ✅ Configure CORS if needed
- ✅ Enable analytics/monitoring
- ✅ Test on multiple browsers
- ✅ Verify encryption works
- ✅ Test audit logging

---

## 📊 Calculations & Formulas

### Retirement Planning Formula

```
Available Years = Life Expectancy - Retirement Age
Annual Savings = (Monthly Income - Monthly Expenses) × 12
Inflation-adjusted Expenses = Current Expenses × (1 + Inflation)^Years
Corpus Growth = Corpus × (1 + Expected Return)^Years
```

### Scenario Analysis

- **Median**: 50th percentile - Most likely outcome
- **Best Case**: 90th percentile - Optimistic projection
- **Worst Case**: 10th percentile - Conservative projection

### Monte Carlo Simulation

- 10,000+ iterations
- Random market returns based on volatility
- Probability of success calculation
- Distribution analysis

---

## 🐛 Troubleshooting

### Server Not Starting

```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install
npm run dev
```

### Port Already in Use

```bash
# Kill process on port 3000
# On macOS/Linux:
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Encryption Not Working

- Check browser compatibility (must support SubtleCrypto API)
- Verify device fingerprinting is working
- Check browser console for errors

### Data Not Persisting

- Check LocalStorage is enabled in browser
- Clear browser cache and try again
- Check browser privacy mode isn't enabled

---

## 📞 Support

For issues or questions:
1. Check this documentation first
2. Review security settings in `security-config.ts`
3. Check browser console for errors
4. Review audit logs via security panel
5. Open an issue on GitHub

---

## 📝 License

This project is provided as-is for retirement planning purposes.

---

## 🎯 Future Enhancements

Planned features:
- Multi-user support with authentication
- Cloud synchronization
- Advanced tax planning
- Integration with investment APIs
- Mobile app
- Real-time market data
- Portfolio optimization

---

## Version History

### v1.0.0 (December 5, 2025)
- ✅ Initial release
- ✅ 12 security features
- ✅ Complete retirement calculator
- ✅ PDF report generation
- ✅ Responsive design
- ✅ Comprehensive documentation

---

**End of Documentation**
