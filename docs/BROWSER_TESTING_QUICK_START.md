# Browser Testing Quick Start Guide

## 🚀 Quick Start

### Run Automated Tests
```bash
npm test -- src/test/browser-compatibility.test.ts
```

### Manual Testing
1. Open `scripts/test-browser-apis.html` in your browser
2. Click each "Test" button
3. Verify all results show ✅ green checkmarks

## 📋 What's Tested

### Automated (30 tests)
- ✅ localStorage (save, load, clear, version management)
- ✅ Clipboard API (copy with fallback)
- ✅ File API (import/export JSON)
- ✅ JSON serialization (Unicode, special chars)
- ✅ Blob & URL APIs

### Manual Checklist
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on Edge
- [ ] Test localStorage persistence after page reload
- [ ] Test clipboard copy/paste
- [ ] Test file upload/download
- [ ] Test on mobile devices (responsive)

## 🌐 Browser Support

| Feature | Chrome 76+ | Firefox 63+ | Safari 13.1+ | Edge 79+ |
|---------|------------|-------------|--------------|----------|
| localStorage | ✅ | ✅ | ✅ | ✅ |
| Clipboard API | ✅ | ✅ | ✅ | ✅ |
| File API | ✅ | ✅ | ✅ | ✅ |

## ⚠️ Known Issues

### Safari
- Clipboard API requires user gesture (click event)
- **Workaround**: Fallback to execCommand implemented

### Firefox
- Clipboard API requires HTTPS or localhost
- **Workaround**: Use localhost for development

### Private/Incognito Mode
- localStorage may be disabled
- **Workaround**: App detects and shows warning

## 📚 Full Documentation

See `BROWSER_COMPATIBILITY.md` for complete details.

## 🐛 Reporting Issues

If you find a browser-specific issue:
1. Note browser name and version
2. Describe expected vs actual behavior
3. Check browser console for errors
4. Test in incognito mode
5. Test in other browsers to confirm it's browser-specific

## 🔧 Troubleshooting

### Tests Failing?
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Run tests again
npm test
```

### Manual Tool Not Working?
- Ensure you're using a supported browser version
- Check browser console for errors
- Try in a different browser
- Disable browser extensions

## ✅ Success Indicators

All tests should show:
- ✅ Green checkmarks in automated tests
- ✅ Green success messages in manual tool
- ✅ No console errors
- ✅ Consistent behavior across browsers

## 📞 Need Help?

- Review `BROWSER_COMPATIBILITY.md` for detailed info
- Check test file: `src/test/browser-compatibility.test.ts`
- Review manual tool: `scripts/test-browser-apis.html`
