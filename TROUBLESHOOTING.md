# Troubleshooting: ERR_BLOCKED_BY_CLIENT Error

## Problem
You're seeing `ERR_BLOCKED_BY_CLIENT` error when trying to save trades. This means your browser or an extension is blocking Firestore requests.

## Solutions

### Solution 1: Disable Ad Blockers (Most Common Fix)

1. **uBlock Origin / AdBlock Plus:**
   - Click the extension icon in your browser
   - Click the power button to disable it for this site
   - Or add `firestore.googleapis.com` to the whitelist

2. **Privacy Badger:**
   - Click the Privacy Badger icon
   - Set the slider for `firestore.googleapis.com` to "Allow"

3. **Ghostery:**
   - Click the Ghostery icon
   - Turn off blocking for this site

### Solution 2: Check Browser Extensions

1. Open browser extensions (Chrome: `chrome://extensions/`, Firefox: `about:addons`)
2. Temporarily disable all extensions
3. Try saving a trade again
4. If it works, re-enable extensions one by one to find the culprit

### Solution 3: Use Incognito/Private Mode

1. Open an incognito/private window
2. Disable extensions in incognito mode
3. Log in and try saving a trade

### Solution 4: Check Browser Settings

**Chrome:**
- Go to `chrome://settings/content/all`
- Search for `firestore.googleapis.com`
- Make sure it's not blocked

**Firefox:**
- Go to `about:preferences#privacy`
- Check "Enhanced Tracking Protection" settings
- Add exception for `firestore.googleapis.com`

### Solution 5: Check Firewall/Antivirus

- Temporarily disable firewall/antivirus
- Check if it has web protection that blocks Firestore
- Add exception for `firestore.googleapis.com`

### Solution 6: Clear Browser Cache

1. Clear browser cache and cookies
2. Restart browser
3. Try again

## How to Verify Fix

1. Open browser console (F12)
2. Try saving a trade
3. You should see:
   - `Firestore write error:` - if still blocked
   - `Trade created successfully with ID:` - if working

## Still Not Working?

If none of the above work, check:
1. Internet connection
2. Firebase project status (check Firebase Console)
3. Browser console for other errors
4. Try a different browser

## Contact

If the issue persists, check:
- Firebase Console for service status
- Browser console for detailed error messages
- Network tab in DevTools to see the blocked request

