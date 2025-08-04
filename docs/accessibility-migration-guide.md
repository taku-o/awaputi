# Accessibility System Migration Guide

## Overview

This guide helps developers migrate from the pre-split (monolithic) accessibility components to the new Main Controller Pattern architecture implemented in Phase E.3.

## Why the Migration?

### Problems with Original Architecture
- Files exceeded 2,500 words, causing MCP tool failures
- Monolithic components were difficult to maintain
- Testing large files was cumbersome
- Code reuse was limited

### Benefits of New Architecture
- All files under 2,500 words (MCP compatible)
- Modular, maintainable components
- Better separation of concerns
- Easier testing and debugging
- Improved performance through lazy loading
- Maintained 100% backward compatibility

## Architecture Changes

### Before (Monolithic)
```
src/accessibility/
├── KeyboardNavigationTester.js (3,116 words)
├── WCAGValidator.js (2,931 words)
├── ScreenReaderSimulator.js (2,872 words)
├── AccessibilityOnboarding.js (2,775 words)
├── ColorContrastAnalyzer.js (2,719 words)
└── AccessibilitySettingsUI.js (2,697 words)
```

### After (Main Controller Pattern)
```
src/accessibility/
├── KeyboardNavigationTester.js (781 words) ← Main Controller
├── keyboard-navigation/
│   ├── KeyboardEventHandler.js
│   ├── NavigationStateManager.js
│   └── KeyboardAccessibilityReporter.js
├── WCAGValidator.js (726 words) ← Main Controller
├── wcag-validation/
│   ├── WCAGRuleEngine.js
│   ├── AccessibilityAuditor.js
│   └── ComplianceReporter.js
└── ... (similar structure for other components)
```

## Migration Steps

### Step 1: Update Import Paths (No Changes Required!)

The beauty of the Main Controller Pattern is that **no import changes are needed**:

```javascript
// This still works exactly as before
import { KeyboardNavigationTester } from './accessibility/KeyboardNavigationTester.js';
import { WCAGValidator } from './accessibility/WCAGValidator.js';
import { ScreenReaderSimulator } from './accessibility/ScreenReaderSimulator.js';
```

### Step 2: Verify API Compatibility

All public APIs remain unchanged:

```javascript
// Before splitting (still works)
const tester = new KeyboardNavigationTester({ enableLogging: true });
const result = await tester.testKeyboardNavigation();

// After splitting (identical usage)
const tester = new KeyboardNavigationTester({ enableLogging: true });
const result = await tester.testKeyboardNavigation();
```

### Step 3: Update Test Configurations

If you have tests that mock internal methods, update them to work with the new structure:

```javascript
// Before: Mocking monolithic component
jest.mock('./accessibility/KeyboardNavigationTester.js');

// After: Can mock main controller or sub-components
jest.mock('./accessibility/KeyboardNavigationTester.js');
// Or mock specific sub-components for unit tests
jest.mock('./accessibility/keyboard-navigation/KeyboardEventHandler.js');
```

### Step 4: Performance Optimization (Optional)

Take advantage of the modular structure for lazy loading:

```javascript
// Dynamic import for better performance
const loadAccessibilityTester = async () => {
  const { KeyboardNavigationTester } = await import(
    './accessibility/KeyboardNavigationTester.js'
  );
  return new KeyboardNavigationTester();
};
```

## Component-Specific Migration

### KeyboardNavigationTester

**No changes required** for basic usage. Internal structure now includes:
- `KeyboardEventHandler` - Handles keyboard events
- `NavigationStateManager` - Manages focus state
- `KeyboardAccessibilityReporter` - Generates reports

### WCAGValidator

**No changes required** for basic usage. Internal structure now includes:
- `WCAGRuleEngine` - Implements WCAG rules
- `AccessibilityAuditor` - Performs audits
- `ComplianceReporter` - Generates compliance reports

### ScreenReaderSimulator

**No changes required** for basic usage. Internal structure now includes:
- `ScreenReaderEngine` - Core simulation engine
- `ARIAAttributeProcessor` - Processes ARIA attributes
- `TextToSpeechController` - Controls speech synthesis

### AccessibilityOnboarding

**No changes required** for basic usage. Internal structure now includes:
- `OnboardingFlowManager` - Manages onboarding flow
- `AccessibilityTutorial` - Delivers tutorials
- `OnboardingProgressTracker` - Tracks progress

### ColorContrastAnalyzer

**No changes required** for basic usage. Internal structure now includes:
- `ContrastCalculator` - Calculates contrast ratios
- `ColorAnalysisEngine` - Analyzes color usage
- `ColorBlindnessSimulator` - Simulates color blindness

### AccessibilitySettingsUI

**No changes required** for basic usage. Internal structure now includes:
- `AccessibilitySettingsPanel` - Renders UI
- `SettingsValidator` - Validates settings
- `AccessibilityPreferencesManager` - Manages preferences

## Testing Considerations

### Unit Testing

Test individual sub-components for focused testing:

```javascript
// Test specific functionality
import { KeyboardEventHandler } from './accessibility/keyboard-navigation/KeyboardEventHandler.js';

describe('KeyboardEventHandler', () => {
  it('should detect key combinations', () => {
    const handler = new KeyboardEventHandler();
    // Test specific handler functionality
  });
});
```

### Integration Testing

Test main controllers for full functionality:

```javascript
// Test complete functionality
import { KeyboardNavigationTester } from './accessibility/KeyboardNavigationTester.js';

describe('KeyboardNavigationTester Integration', () => {
  it('should test navigation with all sub-components', async () => {
    const tester = new KeyboardNavigationTester();
    const result = await tester.testKeyboardNavigation();
    expect(result.passed).toBe(true);
  });
});
```

## Performance Improvements

The split architecture provides several performance benefits:

1. **Reduced Initial Load**: Smaller main controller files load faster
2. **Lazy Loading**: Sub-components can be loaded on demand
3. **Better Caching**: Smaller files cache more efficiently
4. **Parallel Loading**: Multiple sub-components can load simultaneously

## Troubleshooting

### Common Issues

1. **Missing Sub-component Error**
   ```
   Error: Cannot find module './keyboard-navigation/KeyboardEventHandler.js'
   ```
   **Solution**: Ensure all sub-component directories are properly deployed.

2. **Method Not Found**
   ```
   TypeError: tester.internalMethod is not a function
   ```
   **Solution**: Internal methods are now in sub-components. Use public API only.

3. **Test Failures**
   ```
   Test suite failed to run
   ```
   **Solution**: Update test imports and mocks for new structure.

### Debugging Tips

1. **Enable Logging**: All components support debug logging
   ```javascript
   const tester = new KeyboardNavigationTester({ enableLogging: true });
   ```

2. **Check File Sizes**: Verify all files are under 2,500 words
   ```bash
   # Count words in accessibility files
   find src/accessibility -name "*.js" -exec wc -w {} \;
   ```

3. **Validate Structure**: Ensure proper directory structure
   ```bash
   tree src/accessibility -I node_modules
   ```

## Best Practices

### DO:
- ✅ Use public APIs only
- ✅ Import from main controller files
- ✅ Take advantage of modular structure for testing
- ✅ Use lazy loading for performance
- ✅ Keep sub-components under 2,500 words

### DON'T:
- ❌ Import sub-components directly (unless for testing)
- ❌ Rely on internal implementation details
- ❌ Modify sub-component structure
- ❌ Create circular dependencies
- ❌ Exceed 2,500 words in any file

## Future Considerations

### Extending Components

When adding new functionality:

1. **Add to appropriate sub-component** if it fits existing categories
2. **Create new sub-component** if functionality is distinct
3. **Update main controller** to integrate new sub-component
4. **Maintain backward compatibility** for public APIs

### Version Management

- Current version: 2.0.0 (post-split)
- Previous version: 1.0.0 (monolithic)
- Breaking changes: None (100% backward compatible)

## Support

For issues or questions:
1. Check this migration guide
2. Review API documentation
3. Examine test examples
4. Contact the development team

## Conclusion

The migration to the Main Controller Pattern architecture requires **zero code changes** for most applications. The new structure provides better maintainability, performance, and MCP tool compatibility while preserving all existing functionality.

---

Last updated: [Current Date]
Version: 2.0.0