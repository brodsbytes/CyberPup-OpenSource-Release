# 🧹 Codebase Cleanup - Quick Reference

**Purpose:** Quick access to cleanup tasks, commands, and status

---

## 📊 **Current Status**

```bash
# Check current progress
npm run cleanup:progress
```

**Overall Progress:** 0% (0/16 tasks completed)

---

## 🚀 **Quick Start Commands**

### **Progress Tracking**
```bash
npm run cleanup:progress    # View current progress
```

### **Testing**
```bash
npm run test:e2e           # Run all E2E tests
npm run test:e2e:level1    # Run Level 1 tests
npm run cleanup            # Clean up dev servers
```

### **Development**
```bash
npm start                  # Start development server
npm run ios               # Run on iOS simulator
npm run android           # Run on Android emulator
```

---

## 📋 **Phase 1: Safe Cleanup (LOW RISK)**

### **Current Tasks**
- [ ] **Remove Legacy Functions** - `data/courseData.js` lines 246-294 ✅ **CONFIRMED SAFE**
- [ ] **Remove TODO Comments** - `screens/WelcomeScreen.js` line 312
- [ ] **Clean WelcomeScreen Imports** - Remove unused `useRef` import ✅ **CONFIRMED UNUSED**
- [ ] **Audit Lesson Screen Imports** - Check all lesson screens
- [ ] **Remove Commented Code** - Various screens and components
- [ ] **Fix Starter Test** - `e2e/starter.test.js` ⚠️ **NON-EXISTENT ELEMENTS**
- [ ] **Fix Device Audit Test** - `e2e/tests/device-audit.test.js` ⚠️ **DEPRECATED API**

### **Quick Actions**
```bash
# Remove unused imports
grep -r "import.*useRef" screens/WelcomeScreen.js

# Find TODO comments
grep -r "TODO" . --include="*.js"

# Find commented code
grep -r "//.*[A-Z]" . --include="*.js" | grep -v "// TODO"
```

---

## 📁 **Key Files to Clean**

### **High Priority**
- `data/courseData.js` - Legacy functions (lines 246-294)
- `screens/WelcomeScreen.js` - Unused imports, TODO comments
- `e2e/starter.test.js` - Broken test elements
- `e2e/tests/device-audit.test.js` - Outdated API calls

### **Medium Priority**
- Lesson screens in `screens/lessons/level-1/`
- Component files in `components/`
- Utility files in `utils/`

---

## 🚨 **Risk Levels**

### **Low Risk (Safe to do anytime)**
- ✅ Remove TODO comments
- ✅ Remove unused imports
- ✅ Remove commented code
- ✅ Fix broken tests
- ✅ Documentation reorganization

### **Medium Risk (Requires testing)**
- ⚠️ Component reorganization
- ⚠️ Utility file moves
- ⚠️ Import path updates

### **High Risk (Requires careful planning)**
- 🔴 File structure changes
- 🔴 Navigation constant updates
- 🔴 Major refactoring

---

## 📝 **Update Progress**

To mark tasks as completed, edit:
```
docs/active/development/CODEBASE_CLEANUP_IMPLEMENTATION_PLAN.md
```

**Status Options:**
- `⏳ **PENDING**` - Not started
- `🔄 **IN_PROGRESS**` - Currently working on
- `✅ **COMPLETED**` - Finished

---

## 🔍 **Common Issues & Solutions**

### **Import Errors**
```bash
# Find all imports
find . -name "*.js" -exec grep -l "import.*from" {} \;

# Check for broken imports
npm start 2>&1 | grep "Module not found"
```

### **Test Failures**
```bash
# Run specific test
npm run test:e2e:device-audit

# Debug test
npm run test:e2e:interactive
```

### **Build Issues**
```bash
# Clean and rebuild
npm run cleanup
npm start -- --clear
```

---

## 📚 **Documentation**

### **Main Documents**
- **Implementation Plan**: `docs/active/development/CODEBASE_CLEANUP_IMPLEMENTATION_PLAN.md`
- **Legacy Code Audit**: `docs/active/development/LEGACY_CODE_AUDIT.md`
- **Progress Tracker**: `scripts/track-cleanup-progress.js`
- **This Reference**: `docs/active/development/CLEANUP_QUICK_REFERENCE.md`

### **Related Documents**
- **Development Workflow**: `docs/active/development/DEVELOPMENT_WORKFLOW.md`
- **Responsive Design**: `docs/active/development/RESPONSIVE_DESIGN_GUIDE.md`
- **E2E Testing**: `e2e/README.md`

---

## 🎯 **Success Criteria**

### **Phase 1 Complete When:**
- [ ] All TODO comments removed
- [ ] All unused imports cleaned
- [ ] All commented code removed
- [ ] All E2E tests passing
- [ ] No console errors

### **Overall Success When:**
- [ ] Bundle size reduced by 10-15%
- [ ] Build time improved by 20%
- [ ] 100% E2E test pass rate
- [ ] All imports resolve correctly
- [ ] No breaking changes

---

## 📞 **Need Help?**

1. **Check Progress**: `npm run cleanup:progress`
2. **Review Plan**: Read the implementation plan
3. **Run Tests**: `npm run test:e2e`
4. **Ask Team**: Discuss blockers in team chat

---

**Last Updated:** January 2025  
**Next Review:** After Phase 1 completion
