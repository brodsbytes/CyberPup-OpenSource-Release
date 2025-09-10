# PostHog Analytics Troubleshooting Guide

## 🚨 Issue: Events Not Appearing in PostHog Dashboard

If you've granted consent but events aren't showing up in your PostHog dashboard, follow this systematic troubleshooting approach.

## 🔧 Quick Debugging Steps

### 1. Use the Built-in Debug Tools

**In Development Mode:**
```javascript
// Open your app's console and run:
global.debugAnalytics.runDiagnostic()

// Or test connection directly:
global.debugAnalytics.testConnection()

// Check current status:
global.debugAnalytics.checkStatus()
```

**In the App:**
- Go to ProfileScreen → Settings → "Test Analytics (Dev)" button (development only)
- This will trigger test events and provide console feedback

### 2. Check Console Logs

Look for these log messages in your development console:

**✅ Good signs:**
```
🚀 Starting PostHog analytics initialization...
Consent status: granted
✅ PostHog analytics initialized successfully
✅ Analytics event tracked: [event_name]
🚀 Analytics events flushed to PostHog
```

**❌ Warning signs:**
```
Analytics initialization skipped - consent not granted yet
Event tracking skipped: [event_name]
Cannot flush - analytics not enabled or initialized
Failed to initialize PostHog analytics
```

### 3. Verify PostHog Configuration

Check these key configuration items:

**API Key Format:**
- Should start with `phc_`
- Should be exactly 43 characters long
- Example: `phc_A4Tac3vWpiHdPPPq4qv0jDesz6Ng4BVmsqMd6stsZ2C`

**Host URL:**
- Should be exactly: `https://app.posthog.com`
- No trailing slashes or additional paths

### 4. Check Consent Status

Run this in console to check consent:
```javascript
// Check stored consent
AsyncStorage.getItem('analytics_consent').then(console.log)
AsyncStorage.getItem('analytics_opt_out').then(console.log)
AsyncStorage.getItem('analytics_user_id').then(console.log)
```

## 🔍 Common Issues & Solutions

### Issue 1: Consent Not Properly Stored

**Symptoms:**
- Consent modal shows every time
- Events not tracking despite clicking "Accept"

**Solution:**
```javascript
// Clear storage and retry consent flow
global.debugAnalytics.clearStorage()
// Then restart app and go through consent flow again
```

### Issue 2: PostHog Not Initializing

**Symptoms:**
- Console shows "Analytics initialization skipped"
- No PostHog.initAsync logs

**Possible causes:**
1. **Wrong API key**: Verify in PostHog dashboard
2. **Consent not granted**: Check storage values
3. **Network issues**: Test internet connection

**Solution:**
```javascript
// Force initialization test
global.debugAnalytics.testConnection()
```

### Issue 3: Events Sent But Not Visible

**Symptoms:**
- Console shows "✅ Analytics event tracked"
- Events still don't appear in dashboard

**Possible causes:**
1. **Dashboard delay**: Events can take 1-2 minutes to appear
2. **Wrong project**: Verify you're looking at correct PostHog project
3. **Event filtering**: Check PostHog dashboard filters

**Solution:**
1. Wait 2-3 minutes after sending events
2. Check PostHog Live Events tab for real-time data
3. Verify project API key matches your app

### Issue 4: Network/CORS Issues

**Symptoms:**
- Network errors in console
- PostHog.initAsync fails

**Solution:**
1. Check if ad blockers are interfering
2. Verify network connectivity
3. Test on different network/device

## 🧪 Manual Testing Procedure

### Step 1: Fresh Install Test
1. Delete app data/cache or reinstall app
2. Open app and complete onboarding
3. When consent modal appears, click "Help Improve CyberPup"
4. Check console for initialization logs

### Step 2: Event Generation Test
1. Navigate between screens (generates `screen_view` events)
2. Start a security check (generates `security_check_started`)
3. Complete a security check (generates `security_check_completed`)
4. Check console for "✅ Analytics event tracked" messages

### Step 3: Dashboard Verification
1. Open PostHog dashboard
2. Go to Live Events tab for real-time monitoring
3. Look for events from the last few minutes
4. Verify user ID matches what's in console logs

## 📊 PostHog Dashboard Troubleshooting

### Check These Dashboard Sections:

**1. Live Events (Real-time)**
- Go to Events → Live Events
- Should show events within seconds of generation
- Look for your test events by user ID

**2. Events Explorer**
- Go to Events → Explorer
- Filter by last hour/day
- Search for specific event names

**3. Person Profiles**
- Go to Persons
- Look for your anonymous user ID
- Check their event history

### Common Dashboard Issues:

**Issue: No events visible**
- Check time range filters
- Verify you're in the correct project
- Check if events are being filtered out

**Issue: Events delayed**
- PostHog can have 1-2 minute delays
- Use Live Events for real-time monitoring
- Batch processing can cause delays

## 🔧 Development Debug Commands

### Essential Debug Commands:
```javascript
// Full diagnostic check
global.debugAnalytics.runDiagnostic()

// Test PostHog connection
global.debugAnalytics.testConnection()

// Check current status
global.debugAnalytics.checkStatus()

// Clear storage for fresh test
global.debugAnalytics.clearStorage()

// Manual event test
analyticsService.testAnalytics()
```

### Console Debugging:
```javascript
// Check analytics service status
analyticsService.isEnabled
analyticsService.isInitialized
analyticsService.anonymousUserId

// Manual event tracking
analyticsService.trackEvent('debug_test', { test: true })

// Force flush events
analyticsService.flush()
```

## 🚀 Verification Checklist

- [ ] API key is correct and starts with `phc_`
- [ ] Consent has been granted (check storage)
- [ ] User hasn't opted out (check storage)
- [ ] PostHog.initAsync completed successfully
- [ ] Test events sent via debug tools
- [ ] Console shows "✅ Analytics event tracked" messages
- [ ] Events flushed to PostHog (console confirms)
- [ ] Waited 2-3 minutes for dashboard update
- [ ] Checked PostHog Live Events tab
- [ ] Verified correct PostHog project

## 📞 Final Steps

If events still don't appear after following this guide:

1. **Check PostHog Status**: Visit status.posthog.com
2. **Verify Project Settings**: Ensure project is active in PostHog
3. **Network Test**: Try from different network/device
4. **Console Export**: Save console logs for debugging
5. **Contact Support**: With API key (first 10 chars) and error logs

## 💡 Pro Tips

- **Development Mode**: Enable debug mode for verbose logging
- **Network Tab**: Check browser/debugger network tab for failed requests
- **Multiple Devices**: Test on both web and mobile platforms
- **Event Batching**: Some events are batched - flush manually for testing
- **Time Zones**: Check if time zone differences affect dashboard viewing

Remember: PostHog events can take 1-2 minutes to appear in the dashboard, so patience is key during testing!
