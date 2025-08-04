# Accessibility System API Documentation

This document provides comprehensive API documentation for the refactored accessibility system components after the Phase E.3 file splitting project.

## Overview

The accessibility system has been restructured using the Main Controller Pattern to maintain MCP tool compatibility while preserving all functionality. Each main component now delegates to specialized sub-components while maintaining backward compatibility.

## Component Architecture

### Main Controllers
- **KeyboardNavigationTester** - Orchestrates keyboard navigation testing
- **WCAGValidator** - Manages WCAG compliance validation
- **ScreenReaderSimulator** - Controls screen reader simulation
- **AccessibilityOnboarding** - Manages accessibility onboarding flows
- **ColorContrastAnalyzer** - Analyzes color contrast for accessibility
- **AccessibilitySettingsUI** - Handles accessibility settings interface

## KeyboardNavigationTester API

### Main Class
```javascript
import { KeyboardNavigationTester } from './accessibility/KeyboardNavigationTester.js';
```

#### Constructor
```javascript
const tester = new KeyboardNavigationTester(config);
```

**Parameters:**
- `config` (Object): Configuration options
  - `enableLogging` (Boolean): Enable detailed logging
  - `testMode` (String): 'full' | 'quick' | 'focused'
  - `wcagLevel` (String): 'A' | 'AA' | 'AAA'

#### Public Methods

##### `testKeyboardNavigation(element)`
Tests keyboard navigation for a specific element or the entire page.

**Parameters:**
- `element` (HTMLElement, optional): Target element to test

**Returns:** Promise<NavigationTestResult>
```javascript
{
  passed: boolean,
  issues: Array<NavigationIssue>,
  score: number,
  focusMap: FocusMap
}
```

##### `validateTabOrder()`
Validates the tab order of focusable elements.

**Returns:** Promise<TabOrderResult>

##### `detectKeyboardTraps()`
Detects potential keyboard traps in the UI.

**Returns:** Promise<Array<KeyboardTrap>>

### Sub-Components

#### KeyboardEventHandler
Handles keyboard event processing and key combination detection.

**Internal API (not directly exposed):**
- `setupEventListeners(element)` - Sets up event listeners
- `simulateKeyPress(key, modifiers)` - Simulates key press
- `detectKeyboardEvents()` - Detects available keyboard events

#### NavigationStateManager
Manages focus state and tab order calculations.

**Internal API:**
- `trackFocusChanges()` - Tracks focus movement
- `validateTabOrder()` - Validates tab sequence
- `testFocusContainment()` - Tests focus boundaries

#### KeyboardAccessibilityReporter
Generates accessibility reports for keyboard navigation.

**Internal API:**
- `generateReport(results)` - Creates detailed report
- `categorizeIssues(issues)` - Categorizes accessibility issues
- `calculateAccessibilityScore()` - Computes accessibility score

## WCAGValidator API

### Main Class
```javascript
import { WCAGValidator } from './accessibility/WCAGValidator.js';
```

#### Constructor
```javascript
const validator = new WCAGValidator(options);
```

**Parameters:**
- `options` (Object): Validation options
  - `level` (String): 'A' | 'AA' | 'AAA'
  - `categories` (Array<String>): Specific categories to validate
  - `autoFix` (Boolean): Enable auto-fixing of issues

#### Public Methods

##### `validate(element)`
Performs WCAG validation on an element or page.

**Parameters:**
- `element` (HTMLElement, optional): Target element

**Returns:** Promise<ValidationResult>
```javascript
{
  conformanceLevel: string,
  passed: boolean,
  violations: Array<Violation>,
  warnings: Array<Warning>,
  notices: Array<Notice>
}
```

##### `runQuickValidation()`
Performs a quick validation check.

**Returns:** Promise<QuickValidationResult>

##### `getValidationReport()`
Generates a comprehensive validation report.

**Returns:** Promise<ValidationReport>

### Sub-Components

#### WCAGRuleEngine
Implements WCAG guideline validation logic.

**Internal API:**
- `runTest(guideline, element)` - Runs specific guideline test
- `testAltText(images)` - Tests alternative text
- `testColorContrast(elements)` - Tests color contrast
- `testKeyboardNavigation()` - Tests keyboard accessibility

#### AccessibilityAuditor
Performs systematic accessibility audits.

**Internal API:**
- `validateCategory(category)` - Validates specific category
- `runQuickValidation()` - Quick validation pass
- `auditAccessibility()` - Full accessibility audit

#### ComplianceReporter
Generates compliance reports and tracks trends.

**Internal API:**
- `calculateOverallScore()` - Calculates compliance score
- `updateTrends(results)` - Updates trend data
- `saveValidationResults()` - Persists validation results

## ScreenReaderSimulator API

### Main Class
```javascript
import { ScreenReaderSimulator } from './accessibility/ScreenReaderSimulator.js';
```

#### Constructor
```javascript
const simulator = new ScreenReaderSimulator(config);
```

**Parameters:**
- `config` (Object): Simulator configuration
  - `screenReader` (String): 'NVDA' | 'JAWS' | 'VoiceOver'
  - `verbosity` (String): 'low' | 'medium' | 'high'
  - `speechRate` (Number): Speech rate (0.5 - 2.0)

#### Public Methods

##### `simulateReading(element)`
Simulates screen reader reading of content.

**Parameters:**
- `element` (HTMLElement): Element to read

**Returns:** Promise<ReadingResult>
```javascript
{
  announcements: Array<string>,
  navigationPath: Array<NavigationStep>,
  issues: Array<ScreenReaderIssue>
}
```

##### `testARIASupport()`
Tests ARIA attribute support and implementation.

**Returns:** Promise<ARIATestResult>

##### `simulateBrowseMode()`
Simulates browse/virtual mode navigation.

**Returns:** Promise<BrowseModeResult>

### Sub-Components

#### ScreenReaderEngine
Core screen reader simulation engine.

**Internal API:**
- `parseContent(element)` - Parses content for reading
- `simulateBrowseMode()` - Simulates browse mode
- `simulateFocusMode()` - Simulates focus/forms mode

#### ARIAAttributeProcessor
Processes and validates ARIA attributes.

**Internal API:**
- `processARIAAttributes(element)` - Processes ARIA
- `monitorLiveRegions()` - Monitors live regions
- `validateARIAStructure()` - Validates ARIA usage

#### TextToSpeechController
Controls text-to-speech synthesis.

**Internal API:**
- `synthesizeSpeech(text)` - Synthesizes speech
- `manageAnnouncementQueue()` - Manages announcements
- `formatSpeechOutput()` - Formats speech output

## AccessibilityOnboarding API

### Main Class
```javascript
import { AccessibilityOnboarding } from './accessibility/AccessibilityOnboarding.js';
```

#### Constructor
```javascript
const onboarding = new AccessibilityOnboarding(settings);
```

**Parameters:**
- `settings` (Object): Onboarding settings
  - `userProfile` (Object): User accessibility profile
  - `startingStep` (String): Initial step ID
  - `adaptiveMode` (Boolean): Enable adaptive onboarding

#### Public Methods

##### `startOnboarding()`
Initiates the onboarding process.

**Returns:** Promise<OnboardingSession>

##### `skipToStep(stepId)`
Skips to a specific onboarding step.

**Parameters:**
- `stepId` (String): Target step identifier

**Returns:** Promise<Boolean>

##### `getProgress()`
Gets current onboarding progress.

**Returns:** OnboardingProgress
```javascript
{
  currentStep: string,
  completedSteps: Array<string>,
  remainingSteps: number,
  estimatedTime: number
}
```

### Sub-Components

#### OnboardingFlowManager
Manages onboarding flow and navigation.

**Internal API:**
- `manageOnboardingFlow()` - Controls flow
- `navigateToNextStep()` - Next step navigation
- `validateStepCompletion()` - Validates completion

#### AccessibilityTutorial
Delivers tutorial content and demonstrations.

**Internal API:**
- `deliverTutorialContent()` - Delivers content
- `demonstrateFeatures()` - Feature demonstrations
- `conductPracticeSession()` - Practice sessions

#### OnboardingProgressTracker
Tracks and reports onboarding progress.

**Internal API:**
- `trackProgress()` - Tracks user progress
- `monitorEngagement()` - Monitors engagement
- `updateCompletionStatus()` - Updates status

## ColorContrastAnalyzer API

### Main Class
```javascript
import { ColorContrastAnalyzer } from './accessibility/ColorContrastAnalyzer.js';
```

#### Constructor
```javascript
const analyzer = new ColorContrastAnalyzer(config);
```

**Parameters:**
- `config` (Object): Analyzer configuration
  - `wcagLevel` (String): 'AA' | 'AAA'
  - `includeColorBlindness` (Boolean): Include color blindness analysis
  - `suggestAlternatives` (Boolean): Suggest color alternatives

#### Public Methods

##### `analyzeContrast(foreground, background)`
Analyzes contrast between two colors.

**Parameters:**
- `foreground` (String): Foreground color (hex, rgb, or hsl)
- `background` (String): Background color

**Returns:** ContrastResult
```javascript
{
  ratio: number,
  wcagAA: boolean,
  wcagAAA: boolean,
  recommendations: Array<string>
}
```

##### `analyzeElement(element)`
Analyzes color contrast for an HTML element.

**Parameters:**
- `element` (HTMLElement): Element to analyze

**Returns:** Promise<ElementContrastResult>

##### `simulateColorBlindness(type)`
Simulates color blindness view.

**Parameters:**
- `type` (String): 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'

**Returns:** Promise<ColorBlindnessResult>

### Sub-Components

#### ContrastCalculator
Performs contrast ratio calculations.

**Internal API:**
- `calculateContrastRatio(color1, color2)` - Calculates ratio
- `computeLuminance(color)` - Computes relative luminance
- `validateWCAGStandards(ratio, size)` - Validates WCAG

#### ColorAnalysisEngine
Analyzes color usage and accessibility.

**Internal API:**
- `analyzeColorPalette(colors)` - Analyzes palette
- `evaluateColorAccessibility()` - Evaluates accessibility
- `assessColorUsage()` - Assesses color usage patterns

#### ColorBlindnessSimulator
Simulates color vision deficiencies.

**Internal API:**
- `simulateColorBlindness(colors, type)` - Simulates CVD
- `transformColors(colors, matrix)` - Transforms colors
- `assessAccessibilityImpact()` - Assesses impact

## AccessibilitySettingsUI API

### Main Class
```javascript
import { AccessibilitySettingsUI } from './accessibility/AccessibilitySettingsUI.js';
```

#### Constructor
```javascript
const settingsUI = new AccessibilitySettingsUI(container, options);
```

**Parameters:**
- `container` (HTMLElement): Container element
- `options` (Object): UI options
  - `theme` (String): UI theme
  - `categories` (Array<String>): Setting categories
  - `onChange` (Function): Change callback

#### Public Methods

##### `render()`
Renders the settings UI.

**Returns:** void

##### `updateSetting(key, value)`
Updates a specific setting.

**Parameters:**
- `key` (String): Setting key
- `value` (Any): New value

**Returns:** Boolean

##### `getSettings()`
Gets current accessibility settings.

**Returns:** AccessibilitySettings
```javascript
{
  highContrast: boolean,
  fontSize: number,
  keyboardShortcuts: Object,
  screenReaderMode: boolean,
  // ... other settings
}
```

### Sub-Components

#### AccessibilitySettingsPanel
Renders the settings UI panel.

**Internal API:**
- `renderSettingsPanel()` - Renders panel
- `createInteractiveControls()` - Creates controls
- `enableRealTimePreview()` - Enables preview

#### SettingsValidator
Validates setting values and combinations.

**Internal API:**
- `validateSettings(settings)` - Validates settings
- `sanitizeValues(values)` - Sanitizes input
- `checkCompatibility()` - Checks compatibility

#### AccessibilityPreferencesManager
Manages user preference storage.

**Internal API:**
- `storePreferences(prefs)` - Stores preferences
- `retrievePreferences()` - Retrieves preferences
- `synchronizeSettings()` - Syncs settings

## Migration Guide

### Upgrading from Pre-Split Components

The public APIs remain unchanged, so existing code should continue to work without modification. However, for optimal performance and maintainability, consider:

1. **Import paths remain the same:**
   ```javascript
   // Before and after splitting
   import { KeyboardNavigationTester } from './accessibility/KeyboardNavigationTester.js';
   ```

2. **Constructor signatures unchanged:**
   ```javascript
   // Works exactly as before
   const tester = new KeyboardNavigationTester({ enableLogging: true });
   ```

3. **Method calls identical:**
   ```javascript
   // No changes needed
   const result = await tester.testKeyboardNavigation();
   ```

### Performance Improvements

The split architecture provides:
- Faster initial load times (smaller file sizes)
- Better code splitting and lazy loading potential
- Improved memory usage through modular loading
- MCP tool compatibility (all files < 2,500 words)

### Testing Considerations

When testing split components:
1. Ensure all sub-component directories are included in test paths
2. Mock sub-components individually for unit tests
3. Use integration tests to verify component interactions
4. Validate MCP tool compatibility with file size checks

## Best Practices

### Using the Accessibility APIs

1. **Always check for API availability:**
   ```javascript
   if (typeof KeyboardNavigationTester !== 'undefined') {
     // Use the API
   }
   ```

2. **Handle async operations properly:**
   ```javascript
   try {
     const result = await validator.validate();
     // Process result
   } catch (error) {
     console.error('Validation failed:', error);
   }
   ```

3. **Use appropriate WCAG levels:**
   ```javascript
   // For most applications
   const validator = new WCAGValidator({ level: 'AA' });
   
   // For government/critical applications
   const validator = new WCAGValidator({ level: 'AAA' });
   ```

4. **Implement proper error handling:**
   ```javascript
   analyzer.analyzeContrast(fg, bg)
     .then(result => {
       if (!result.wcagAA) {
         // Handle non-compliant contrast
       }
     })
     .catch(error => {
       // Fallback handling
     });
   ```

### Accessibility Testing Workflow

1. **Initial Assessment:**
   ```javascript
   const validator = new WCAGValidator({ level: 'AA' });
   const result = await validator.validate();
   ```

2. **Keyboard Navigation Testing:**
   ```javascript
   const tester = new KeyboardNavigationTester();
   const navResult = await tester.testKeyboardNavigation();
   ```

3. **Screen Reader Simulation:**
   ```javascript
   const simulator = new ScreenReaderSimulator({ 
     screenReader: 'NVDA' 
   });
   const reading = await simulator.simulateReading();
   ```

4. **Color Contrast Analysis:**
   ```javascript
   const analyzer = new ColorContrastAnalyzer();
   const contrast = await analyzer.analyzeElement(element);
   ```

## Error Handling

All accessibility components implement consistent error handling:

```javascript
try {
  const result = await component.method();
} catch (error) {
  if (error.code === 'ELEMENT_NOT_FOUND') {
    // Handle missing element
  } else if (error.code === 'INVALID_CONFIG') {
    // Handle configuration error
  } else {
    // General error handling
  }
}
```

### Common Error Codes
- `ELEMENT_NOT_FOUND` - Target element not found
- `INVALID_CONFIG` - Invalid configuration provided
- `WCAG_TEST_FAILED` - WCAG test execution failed
- `SCREEN_READER_ERROR` - Screen reader simulation error
- `CONTRAST_CALC_ERROR` - Contrast calculation error
- `SETTINGS_VALIDATION_ERROR` - Settings validation failed

## Support and Resources

### Additional Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Screen Reader Testing Guide](./screen-reader-testing-guide.md)
- [Keyboard Navigation Best Practices](./keyboard-navigation-guide.md)

### Component Source Code
- Main components: `/src/accessibility/`
- Sub-components organized in subdirectories:
  - `/src/accessibility/keyboard-navigation/`
  - `/src/accessibility/wcag-validation/`
  - `/src/accessibility/screen-reader/`
  - `/src/accessibility/onboarding/`
  - `/src/accessibility/color-contrast/`
  - `/src/accessibility/settings-ui/`

### Version History
- v2.0.0 - Phase E.3 file splitting implementation
- v1.0.0 - Original monolithic components

---

Last updated: [Current Date]
Version: 2.0.0