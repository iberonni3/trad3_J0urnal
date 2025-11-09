# Fixing Firestore Issues in Brave Browser

## The Problem
Brave browser's built-in Shields feature can block Firestore requests, even without ad blocker extensions. This causes `ERR_BLOCKED_BY_CLIENT` errors.

## Solution: Disable Brave Shields for This Site

### Method 1: Disable Shields for the Site (Recommended)

1. **Look for the Brave Shields icon** in the address bar (looks like a lion/shield)
2. **Click on it** to open Shields panel
3. **Toggle "Shields" to "Down"** (this disables Shields for this site only)
4. **Refresh the page**
5. **Try saving a trade again**

### Method 2: Allow Specific Scripts

1. Click the **Brave Shields icon** in the address bar
2. Click **"Advanced controls"**
3. Under **"Scripts"**, click **"Allow scripts once"** or **"Allow all scripts"**
4. Refresh the page

### Method 3: Add Site to Allowlist

1. Click the **Brave Shields icon**
2. Click **"Site settings"** or the gear icon
3. Toggle **"Shields"** to **"Allow"** for this site
4. Refresh the page

## Alternative: Configure Brave Shields Settings

### Global Settings (if you want to allow Firebase globally):

1. Go to `brave://settings/shields`
2. Under **"Privacy and security"**, you can:
   - Turn off **"Block cross-site cookies"** (less secure)
   - Or add exceptions for `firestore.googleapis.com`

### Site-Specific Settings:

1. Go to `brave://settings/content/all`
2. Search for `firestore.googleapis.com`
3. Make sure it's not blocked
4. Set cookies and scripts to "Allow"

## Verify the Fix

After disabling Shields:

1. Open browser console (F12)
2. Try saving a trade
3. You should see:
   - ✅ `Trade created successfully with ID: ...` (if working)
   - ❌ Still see `ERR_BLOCKED_BY_CLIENT` (if still blocked)

## If Still Not Working

### Check Brave's Fingerprinting Protection:

1. Go to `brave://settings/shields`
2. Under **"Fingerprinting"**, try:
   - Setting to **"Allow all fingerprinting"** temporarily
   - Or adding exception for `firestore.googleapis.com`

### Check Network Tab:

1. Open DevTools (F12)
2. Go to **Network** tab
3. Try saving a trade
4. Look for requests to `firestore.googleapis.com`
5. Check if they're being blocked (red status)
6. Check the error message for more details

### Try Different Connection Method:

If the issue persists, you might need to:
1. Use a different browser (Chrome, Firefox) to verify it's Brave-specific
2. Check if your network/firewall is blocking Google services
3. Try using a VPN to see if it's a network issue

## Temporary Workaround

If you can't disable Shields, you can:
1. Use a different browser (Chrome, Firefox, Edge) for this app
2. Use Brave's Tor window (but this might have other limitations)
3. Contact support if this is a critical issue

## Why This Happens

Brave's Shields block:
- Cross-site tracking
- Fingerprinting
- Analytics
- Some third-party connections

Firestore uses Google's infrastructure which can trigger these protections, especially:
- Cross-site requests
- WebSocket connections
- Long-polling connections

## Long-term Solution

The app developer could:
1. Use a different backend (not Firebase)
2. Configure Firebase to use REST API instead of WebSockets
3. Add better error handling and fallbacks
4. Provide alternative connection methods

