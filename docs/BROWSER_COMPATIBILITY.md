# Browser Compatibility Testing

This document outlines the browser compatibility testing performed for the Test Prioritisation Tool and provides guidance for manual testing across different browsers.

## Automated Test Coverage

The automated browser compatibility tests (`src/test/browser-compatibility.test.ts`) verify the following browser-specific APIs and features:

### ✅ localStorage API
- **Availability detection** - Checks if localStorage is supported
- **Save and load operations** - Round-trip persistence of application state
- **Quota exceeded handling** - Graceful error handling when storage limit is reached
- **Security error handling** - Handles cases where localStorage access is denied
- **Version management** - Maintains last 3 versions of state diagrams
- **Data clearing** - Removes all application data from localStorage
- **Corrupted data handling** - Gracefully handles invalid JSON in storage
- **Missing fields handling** - Validates data structure on load

### ✅ Clipboard API
- **Copy to clipboard** - Uses modern Clipboard API (navigator.clipboard.writeText)
- **Fallback mechanism** - Falls back to execCommand for older browsers
- **Permission handling** - Handles clipboard permission denied errors
- **API unavailability** - Gracefully degrades when Clipboard API is not available

### ✅ File API
- **JSON export** - Creates and downloads JSON files using Blob and URL APIs
- **JSON import** - Reads and validates uploaded JSON files using FileReader
- **Invalid file handling** - Handles malformed JSON and missing required fields
- **File read errors** - Gracefully handles file reading failures

### ✅ JSON Serialization
- **Standard serialization** - Correctly serializes and parses application state
- **Special characters** - Handles quotes, backslashes, newlines, and tabs
- **Unicode support** - Preserves emoji and international characters
- **ISO date format** - Correctly handles date serialization

### ✅ Blob and URL APIs
- **Blob creation** - Creates Blobs from JSON strings
- **Object URL management** - Creates and revokes object URLs for downloads

### ✅ Feature Detection
- Tests verify the presence of all required browser APIs:
  - Storage API
  - FileReader API
  - Blob API
  - URL API
  - JSON API
  - Clipboard API (with fallback)

## Test Results

All 30 automated tests pass successfully:
- ✅ 10 localStorage compatibility tests
- ✅ 3 Clipboard API compatibility tests
- ✅ 5 File API compatibility tests
- ✅ 4 JSON serialization compatibility tests
- ✅ 2 Blob/URL API compatibility tests
- ✅ 6 Feature detection tests

## Supported Browsers

Based on the APIs used, the application should work on:

### ✅ Chrome/Edge (Chromium-based)
- **Version**: 76+ (for Clipboard API)
- **localStorage**: Full support
- **Clipboard API**: Full support
- **File API**: Full support
- **Status**: ✅ Fully supported

### ✅ Firefox
- **Version**: 63+ (for Clipboard API)
- **localStorage**: Full support
- **Clipboard API**: Full support (requires HTTPS or localhost)
- **File API**: Full support
- **Status**: ✅ Fully supported

### ✅ Safari
- **Version**: 13.1+ (for Clipboard API)
- **localStorage**: Full support
- **Clipboard API**: Full support (requires user gesture)
- **File API**: Full support
- **Status**: ✅ Fully supported

### ⚠️ Edge (Legacy)
- **Version**: 18 and below
- **localStorage**: Full support
- **Clipboard API**: Not supported (falls back to execCommand)
- **File API**: Full support
- **Status**: ⚠️ Supported with fallback

## Manual Testing Checklist

To manually verify browser compatibility, test the following workflows on each target browser:

### 1. localStorage Persistence
- [ ] Add test cases and verify they persist after page reload
- [ ] Close and reopen the browser, verify data is still present
- [ ] Clear browser data and verify application handles empty state
- [ ] Fill storage near quota and verify error handling

### 2. Clipboard Operations
- [ ] Click "Copy to Clipboard" and verify JSON is copied
- [ ] Click "Copy Decision" on a test case row and verify text is copied
- [ ] Test in both HTTP and HTTPS contexts (some browsers require HTTPS)
- [ ] Verify fallback works if Clipboard API is blocked

### 3. File Import/Export
- [ ] Export application state and verify file downloads
- [ ] Verify exported filename matches pattern: `test-prioritization-{project}-{date}.json`
- [ ] Import the exported file and verify data is restored correctly
- [ ] Try importing invalid JSON and verify error message displays
- [ ] Try importing file with missing fields and verify validation

### 4. State Diagram Import
- [ ] Upload a state diagram JSON file
- [ ] Verify diff modal displays correctly
- [ ] Confirm import and verify test cases are generated
- [ ] Upload multiple versions and verify version history (max 3)

### 5. Responsive Behavior
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Verify table scrolling works on smaller screens
- [ ] Verify sidebar collapses on mobile

### 6. Performance
- [ ] Add 100+ test cases and verify table remains responsive
- [ ] Verify score calculations update in real-time
- [ ] Verify export completes quickly with large datasets
- [ ] Verify no memory leaks during extended use

## Known Browser-Specific Issues

### Safari
- **Clipboard API**: Requires user gesture (click event). Programmatic clipboard access may be blocked.
- **Workaround**: The application uses fallback mechanism with execCommand.

### Firefox
- **Clipboard API**: Requires HTTPS or localhost for security reasons.
- **Workaround**: Use localhost for development or deploy with HTTPS.

### Private/Incognito Mode
- **localStorage**: May be disabled or cleared on session end in some browsers.
- **Workaround**: Application detects localStorage availability and shows warning if unavailable.

## Testing Commands

Run automated browser compatibility tests:
```bash
npm test -- src/test/browser-compatibility.test.ts
```

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Browser Testing Tools

For comprehensive cross-browser testing, consider using:

1. **BrowserStack** - Cloud-based browser testing
2. **Sauce Labs** - Automated cross-browser testing
3. **LambdaTest** - Real device testing
4. **Local VMs** - Virtual machines with different OS/browser combinations

## Accessibility Testing

In addition to functional compatibility, test accessibility features:
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader compatibility (NVDA, JAWS, VoiceOver)
- [ ] Color contrast (WCAG AA standards)
- [ ] Focus indicators
- [ ] ARIA labels

## Reporting Issues

If you encounter browser-specific issues:

1. Document the browser name and version
2. Describe the expected vs actual behavior
3. Include console errors (if any)
4. Note if the issue occurs in incognito/private mode
5. Test if the issue reproduces in other browsers

## Continuous Monitoring

Browser compatibility should be verified:
- ✅ Before each release
- ✅ When adding new browser APIs
- ✅ When updating dependencies
- ✅ Quarterly for new browser versions

## References

- [MDN Web Docs - Browser Compatibility](https://developer.mozilla.org/en-US/docs/Web/API)
- [Can I Use](https://caniuse.com/) - Browser support tables
- [Web.dev - Browser Compatibility](https://web.dev/browser-compatibility/)
