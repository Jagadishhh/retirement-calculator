# Troubleshooting Guide - Blank Page Issue

## Problem
The index.html shows a blank page when opened.

## Root Causes

1. **TypeScript/React Not Compiled**
   - The `index.tsx` file needs to be transpiled to JavaScript
   - Running directly from file system won't work

2. **Development Server Not Running**
   - The app needs to be served via HTTP/HTTPS with proper headers
   - File:// protocol bypasses security features

3. **CSP May Be Too Restrictive**
   - Some resources might be blocked by Content Security Policy
   - Fixed by updating CSP to allow https: and unsafe-eval

## Solutions

### Solution 1: Run Development Server (RECOMMENDED)

```bash
# Navigate to project directory
cd c:\Users\jagad\Downloads\retirement-calculator

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

This will:
- Start Vite dev server (usually on http://localhost:5173)
- Automatically compile TypeScript/JSX
- Hot reload on file changes
- Proper security headers

### Solution 2: Build for Production

```bash
# Build the application
npm run build

# Preview the build
npm run preview
```

This creates an optimized version in the `dist/` folder.

### Solution 3: Check Browser Console

1. **Open Developer Tools:** F12 or Right-click → Inspect
2. **Check Console tab** for errors
3. **Check Network tab** for failed requests
4. **Check Issues tab** for CSP violations

**Common errors to look for:**
- "module not found"
- "Failed to fetch"
- "CSP violation"
- "Failed to import"

### Solution 4: Verify CSP Settings

If you see CSP violation errors, the CSP in `index.html` has been updated to:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://...">
```

This allows:
- All HTTPS resources
- Inline scripts (needed for Tailwind)
- Dynamic code evaluation (needed for React)

### Solution 5: Check Dependencies

```bash
# Verify Node/npm installed
node --version
npm --version

# Check if dependencies installed
npm list

# Reinstall if issues
rm -r node_modules package-lock.json
npm install
```

## Step-by-Step Fix

1. **Open terminal in project directory:**
   ```powershell
   cd c:\Users\jagad\Downloads\retirement-calculator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open browser to the URL shown** (usually `http://localhost:5173`)

5. **Press F12** to check console for errors

## Expected Output

When working correctly, you should see:
- ✅ App UI renders with retirement calculator
- ✅ Lock icon in bottom-right corner (security panel)
- ✅ Sidebar with input fields
- ✅ Main content area with charts/tables
- ✅ Footer with disclaimer

## If Still Blank

### Check 1: Console Errors
```
F12 → Console → Look for red errors
```

### Check 2: Network Issues
```
F12 → Network → Check for failed requests
Look for 404 errors or connection timeouts
```

### Check 3: CSP Violations
```
F12 → Console → Look for CSP warnings
They look like: "Refused to load the script... CSP policy"
```

### Check 4: React/TypeScript Compilation
```
Terminal should show messages like:
✓ [plugin:vite:import-analysis] compiled successfully
✓ ready in XXXms
```

## CSP Adjustment (if needed)

If you see many CSP violation warnings, you can further relax it:

**File:** `index.html` (Line 8-9)

Change from:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self' https:; script-src ...">
```

To:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self' https: http://localhost:* http://127.0.0.1:*; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http: ...">
```

This allows localhost development while maintaining security in production.

## Production vs Development

### Development (npm run dev)
- TypeScript/JSX compiled automatically
- Hot module reloading
- Full error messages
- Less restrictive CSP for local development
- Slower initial load

### Production (npm run build)
- Minified code
- Optimized assets
- Source maps disabled
- Full CSP enforcement
- Faster load times
- Ready for deployment

## File Structure Verification

Your project should have:
```
retirement-calculator/
├── index.html          ✓
├── index.tsx           ✓
├── security.ts         ✓ (new)
├── security-config.ts  ✓ (new)
├── vite.config.ts      ✓
├── package.json        ✓
└── [other files]
```

If any files are missing, the app won't work properly.

## Security vs Functionality Trade-off

The CSP has been adjusted to allow:
- ✅ `'unsafe-inline'` - For inline scripts (Tailwind needs this)
- ✅ `'unsafe-eval'` - For React/dynamic code execution
- ✅ `https:` - All HTTPS resources
- ✅ `http://localhost` - For development

**For Production:** You should:
1. Use HTTPS only
2. Remove `'unsafe-eval'` if possible
3. Keep strict CSP for maximum security
4. Use proper build process with security headers from server

## Support

If you still see a blank page:

1. **Copy the exact error from Console (F12)**
2. **Check package.json for scripts**
3. **Verify Node/npm versions**
4. **Try: `npm cache clean --force && npm install`**
5. **Delete node_modules and reinstall**

## Quick Commands Reference

```powershell
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check Node/npm versions
node --version
npm --version

# Clear npm cache (if issues)
npm cache clean --force

# Reinstall everything
rm -r node_modules package-lock.json
npm install
```

---

**Remember:** The app MUST be served via HTTP (dev server or web server), not opened directly as a file. The `file://` protocol doesn't support all security features and modules.
