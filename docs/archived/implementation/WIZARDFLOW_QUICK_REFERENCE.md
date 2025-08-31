# 🧙‍♂️ WizardFlow Quick Reference Card

**For Phase 4 Wizard Variant Screens**

---

## 🚀 **Quick Start Template**

```javascript
// 1. Import WizardFlow
import WizardFlow from '../../../components/WizardFlow';

// 2. Use in render
{userDevices.length > 0 && Object.keys(deviceActions).length > 0 ? (
  <WizardFlow
    userDevices={userDevices}
    deviceActions={deviceActions}
    onActionComplete={handleActionComplete}
    variant="wizard"
    checkId="1-x-x"
    navigation={navigation}
  />
) : (
  <FallbackUI />
)}
```

---

## ⚡ **Critical Fixes**

### **Progress Not Updating?**
```javascript
// ❌ Remove this
const [wizardProgress, setWizardProgress] = useState(0);

// ✅ Add this in render
const wizardProgress = calculateProgress();
```

### **Variable Name Conflict?**
```javascript
// ❌ Don't shadow variable names
const deviceActions = deviceActions[device.id];

// ✅ Use unique names
const deviceActionsList = deviceActions[device.id];
```

### **Navigation Error?**
```javascript
// ❌ Don't use non-existent screens
navigation.navigate(SCREEN_NAMES.CATEGORY);

// ✅ Use exact screen names
navigation.navigate('Welcome');
navigation.navigate('Check1_2_3_DeviceUpdatesScreen');
```

### **Invalid Icons?**
```javascript
// ❌ Don't use invalid names
return 'device-desktop';

// ✅ Use valid Ionicons
return 'desktop'; // or 'laptop', 'phone-portrait'
```

---

## 🎯 **Required Features**

- ✅ **Separate device step tracking**
- ✅ **"Complete Task!" button on final step**
- ✅ **Device status below navigation**
- ✅ **Real-time progress calculation**
- ✅ **Proper completion modal**
- ✅ **Valid Ionicons only**

---

## 📋 **Testing Checklist**

- [ ] Progress updates when completing steps
- [ ] "Complete Task!" appears on final step
- [ ] Device status shows below navigation
- [ ] Completion modal navigates correctly
- [ ] No console errors
- [ ] Each device tracks independently

---

## 🆘 **Need Help?**

1. Check `WIZARDFLOW_TROUBLESHOOTING.md`
2. See `Check1_2_2_RemoteLockScreen.js` example
3. Review `components/WizardFlow.js` implementation

---

**Last Updated:** August 2025
