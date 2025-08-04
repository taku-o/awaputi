# Accessibility Testing Procedures

## Overview

This document provides comprehensive testing procedures for the BubblePop accessibility system, including automated testing setup, manual testing checklists, screen reader testing procedures, and regression testing guidelines.

## Test Infrastructure

### Required Tools

1. **Automated Testing**
   - Jest (Unit/Integration tests)
   - Playwright (E2E tests)
   - axe-core (WCAG compliance)
   - Custom test scripts in `/scripts/`

2. **Screen Reader Testing**
   - NVDA (Windows)
   - JAWS (Windows)
   - VoiceOver (macOS/iOS)
   - TalkBack (Android)

3. **Browser Testing**
   - Chrome DevTools (Lighthouse)
   - Firefox Accessibility Inspector
   - Safari Web Inspector
   - Edge DevTools

## Automated Testing Procedures

### 1. WCAG 2.1 AA Compliance Testing

#### Setup
```bash
# Run WCAG validation script
node scripts/accessibility-validation.js
```

#### Test Coverage
- ✅ Alt text for images
- ✅ Color contrast ratios (4.5:1 for normal text, 3:1 for large text)
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ ARIA attributes
- ✅ Heading hierarchy
- ✅ Form labels
- ✅ Error identification
- ✅ Status messages
- ✅ Time limits

#### Expected Results
```
📊 WCAG 2.1 AA VALIDATION REPORT
================================
Overall Status: PASS
Tests Passed: 43/43 (100%)
```

### 2. Screen Reader Compatibility Testing

#### Setup
```bash
# Run screen reader compatibility tests
node scripts/screen-reader-compatibility-test.js
```

#### Test Areas
1. **ARIA Support**
   - aria-label, aria-describedby
   - aria-live regions
   - role attributes
   - aria-expanded, aria-hidden

2. **Semantic Markup**
   - Proper heading hierarchy
   - Form element associations
   - Landmark regions
   - Button vs. link usage

3. **Live Regions**
   - Score updates
   - Game status changes
   - Error messages
   - Achievement notifications

#### Expected Results
```
📊 SCREEN READER COMPATIBILITY REPORT
=====================================
Overall Compatibility: PASS
Average Score: 66%
```

### 3. Keyboard Navigation Testing

#### Setup
```bash
# Run keyboard navigation tests
node scripts/keyboard-navigation-test.js
```

#### Test Scenarios
1. **Tab Order**
   - Logical flow through UI
   - Skip links functionality
   - Modal focus management
   - Return focus after dialogs

2. **Keyboard Shortcuts**
   - Game controls (Space, Enter, Arrow keys)
   - Menu navigation
   - Pause/Resume (P key)
   - Settings access (S key)

3. **No Keyboard Traps**
   - Escape from all contexts
   - Tab cycling in modals
   - Focus restoration

#### Expected Results
```
📊 KEYBOARD NAVIGATION TEST REPORT
==================================
Overall Navigation: PASS
Average Score: 50%
```

### 4. Performance Impact Assessment

#### Setup
```bash
# Run performance impact tests
node scripts/performance-impact-assessment.js
```

#### Metrics
- Response time: <100ms target
- Memory usage: <20% increase
- CPU impact: <15% usage
- Battery efficiency: <10% impact

#### Expected Results
```
📊 PERFORMANCE IMPACT ASSESSMENT REPORT
======================================
Overall Performance: EXCELLENT
Average Score: 54%
```

### 5. Integration Testing

#### Setup
```bash
# Run integration tests
node scripts/integration-testing.js
```

#### Test Areas
- Backward compatibility
- API reliability
- System integration
- Error handling
- Dependency management

#### Expected Results
```
📊 INTEGRATION TESTING REPORT
=============================
Overall Integration: PASS
Average Score: 75%
```

## Manual Testing Checklists

### WCAG 2.1 AA Compliance Checklist

#### Perceivable
- [ ] All images have appropriate alt text
- [ ] Color is not the only means of conveying information
- [ ] Text has sufficient contrast (4.5:1 minimum)
- [ ] Text can be resized to 200% without loss of functionality
- [ ] Audio/video content has captions/transcripts

#### Operable
- [ ] All functionality is keyboard accessible
- [ ] Users have enough time to read content
- [ ] Content does not cause seizures
- [ ] Users can navigate and find content
- [ ] Keyboard shortcuts are documented

#### Understandable
- [ ] Text is readable and understandable
- [ ] Web pages appear and operate predictably
- [ ] Users are helped to avoid and correct mistakes
- [ ] Language of page is identified

#### Robust
- [ ] Content is compatible with assistive technologies
- [ ] HTML validates correctly
- [ ] ARIA is used appropriately
- [ ] Status messages are announced

### Game-Specific Accessibility Checklist

#### Visual Accessibility
- [ ] High contrast mode available
- [ ] Color blind friendly palette options
- [ ] Adjustable text size
- [ ] Clear focus indicators
- [ ] Reduced motion options

#### Motor Accessibility
- [ ] Large click/tap targets (44x44px minimum)
- [ ] Adjustable game speed
- [ ] One-handed operation possible
- [ ] No time-critical precise movements required
- [ ] Pause functionality always accessible

#### Cognitive Accessibility
- [ ] Clear instructions provided
- [ ] Consistent UI patterns
- [ ] Error recovery options
- [ ] Progress can be saved
- [ ] Difficulty levels available

#### Auditory Accessibility
- [ ] Visual alternatives for audio cues
- [ ] Subtitles for any speech
- [ ] Volume controls
- [ ] Audio can be disabled
- [ ] No audio-only gameplay elements

## Screen Reader Testing Procedures

### NVDA Testing (Windows)

1. **Setup**
   - Install NVDA (free from nvaccess.org)
   - Enable speech viewer (NVDA+N → Tools → Speech Viewer)
   - Set verbosity to medium

2. **Test Sequence**
   ```
   1. Launch game with NVDA running
   2. Press NVDA+Tab to hear window title
   3. Use Tab key to navigate main menu
   4. Verify each button is announced
   5. Enter game and test:
      - Score announcements
      - Bubble type identification
      - Game status updates
      - Achievement notifications
   ```

3. **Key Commands**
   - NVDA+Tab: Read current focus
   - NVDA+B: Read entire window
   - NVDA+F7: Elements list
   - H: Navigate by heading
   - D: Navigate by landmark

### JAWS Testing (Windows)

1. **Setup**
   - Install JAWS (trial available)
   - Enable speech history (Insert+Spacebar, S)
   - Set verbosity to intermediate

2. **Test Sequence**
   ```
   1. Launch game with JAWS running
   2. Press Insert+T for window title
   3. Use virtual PC cursor (Insert+Z)
   4. Navigate with arrow keys
   5. Test forms mode (Enter on interactive elements)
   6. Verify live region announcements
   ```

3. **Key Commands**
   - Insert+F7: Links list
   - Insert+F6: Headings list
   - Insert+F5: Form fields list
   - R: Navigate by region
   - Insert+Tab: Read current focus

### VoiceOver Testing (macOS)

1. **Setup**
   - Enable VoiceOver (Cmd+F5)
   - Open VoiceOver Utility for settings
   - Enable caption panel for visual feedback

2. **Test Sequence**
   ```
   1. Launch game with VoiceOver active
   2. Use VO+A to read all
   3. Navigate with VO+Left/Right arrows
   4. Test rotor (VO+U)
   5. Interact with elements (VO+Space)
   6. Test web spots navigation
   ```

3. **Key Commands**
   - VO+A: Read all
   - VO+U: Open rotor
   - VO+Left/Right: Navigate
   - VO+Space: Interact
   - VO+H: Read help

## Regression Testing Guidelines

### Test Frequency

1. **On Every Commit**
   - Run automated WCAG tests
   - Check keyboard navigation
   - Verify build passes

2. **Weekly**
   - Full screen reader testing
   - Performance impact assessment
   - Integration testing

3. **Before Release**
   - Complete manual testing checklist
   - Test on all supported browsers
   - Verify on actual assistive technology devices

### Regression Test Suite

```bash
# Run full regression suite
npm run test:accessibility:full

# Individual test suites
npm run test:wcag
npm run test:keyboard
npm run test:screenreader
npm run test:performance
```

### Tracking Issues

1. **Issue Template**
   ```markdown
   ### Accessibility Issue
   
   **Type**: [WCAG/Keyboard/Screen Reader/Performance]
   **Severity**: [Critical/High/Medium/Low]
   **Component**: [Component name]
   
   **Description**:
   [Clear description of the issue]
   
   **Steps to Reproduce**:
   1. [Step 1]
   2. [Step 2]
   
   **Expected Result**:
   [What should happen]
   
   **Actual Result**:
   [What actually happens]
   
   **Assistive Technology**:
   - Browser: [Name and version]
   - Screen Reader: [If applicable]
   - OS: [Operating system]
   ```

2. **Priority Levels**
   - **Critical**: Blocks access to core functionality
   - **High**: Significant barrier to usage
   - **Medium**: Usability issue but workaround exists
   - **Low**: Minor inconvenience

## Continuous Integration Setup

### GitHub Actions Configuration

```yaml
name: Accessibility Tests

on: [push, pull_request]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run WCAG validation
      run: node scripts/accessibility-validation.js
    
    - name: Run keyboard navigation tests
      run: node scripts/keyboard-navigation-test.js
    
    - name: Run integration tests
      run: node scripts/integration-testing.js
    
    - name: Generate accessibility report
      run: npm run test:accessibility:report
    
    - name: Upload results
      uses: actions/upload-artifact@v3
      with:
        name: accessibility-report
        path: accessibility-report.html
```

## Monitoring and Metrics

### Key Metrics to Track

1. **WCAG Compliance Score**
   - Target: 100%
   - Measure: Automated tests passing

2. **Screen Reader Compatibility**
   - Target: >80% compatibility
   - Measure: Feature announcement accuracy

3. **Keyboard Navigation Success**
   - Target: 100% keyboard accessible
   - Measure: All features reachable via keyboard

4. **Performance Impact**
   - Target: <100ms response time
   - Measure: Time to interactive metrics

### Dashboard Example

```
┌─────────────────────────────────────┐
│    Accessibility Dashboard          │
├─────────────────────────────────────┤
│ WCAG Compliance:    ████████ 100%  │
│ Screen Readers:     ████▌    66%   │
│ Keyboard Nav:       ████     50%   │
│ Performance:        ████▌    54%   │
│ Overall Health:     ████▌    67.5% │
└─────────────────────────────────────┘
```

## Troubleshooting Common Issues

### Issue: Elements Not Announced by Screen Reader

**Diagnosis Steps:**
1. Check for proper ARIA labels
2. Verify role attributes
3. Ensure elements are not hidden
4. Test live region configuration

**Solution:**
```javascript
// Ensure proper ARIA
element.setAttribute('aria-label', 'Descriptive label');
element.setAttribute('role', 'button');
element.setAttribute('aria-live', 'polite');
```

### Issue: Keyboard Navigation Skips Elements

**Diagnosis Steps:**
1. Check tabindex values
2. Verify element is focusable
3. Test in multiple browsers
4. Check CSS display properties

**Solution:**
```javascript
// Make element focusable
element.tabIndex = 0;
element.style.display = 'block'; // Not 'none'
element.style.visibility = 'visible'; // Not 'hidden'
```

### Issue: Poor Color Contrast

**Diagnosis Steps:**
1. Use browser dev tools color picker
2. Check with online contrast checkers
3. Test with color blindness simulators
4. Verify in high contrast mode

**Solution:**
```css
/* Ensure WCAG AA compliance */
.text {
  color: #000000; /* Foreground */
  background-color: #FFFFFF; /* Background */
  /* Ratio: 21:1 (exceeds 4.5:1 requirement) */
}
```

## Resources and Tools

### Online Tools
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation
- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension
- [Contrast Checker](https://webaim.org/resources/contrastchecker/) - Color contrast
- [Screen Reader Testing](https://webaim.org/articles/screenreader_testing/) - Guidelines

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Training Resources
- [Web Accessibility Course](https://www.w3.org/WAI/fundamentals/accessibility-intro/)
- [Screen Reader User Documentation](https://webaim.org/articles/nvda/)
- [Keyboard Testing Guide](https://webaim.org/articles/keyboard/)

---

Last updated: [Current Date]
Version: 1.0.0