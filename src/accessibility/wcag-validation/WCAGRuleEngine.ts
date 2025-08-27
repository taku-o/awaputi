/**
 * WCAGRuleEngine - WCAG 2.1 AA compliance rule engine
 * Handles test execution and guideline validation
 */

import ErrorHandler from '../../utils/ErrorHandler.js';

// Interfaces for WCAG rule engine
interface RuleEngineConfig {
    enabled: boolean;
    level: 'A' | 'AA' | 'AAA';
    includeWarnings: boolean;
    autoFixEnabled: boolean;
}

interface GuidelineInfo {
    name: string;
    level: 'A' | 'AA' | 'AAA';
    category: 'perceivable' | 'operable' | 'understandable' | 'robust';
}

interface ExecutionState {
    running: boolean;
    currentTest: string | null;
    results: Map<string, TestResult>;
}

interface TestResult {
    passed: boolean;
    issues: TestIssue[];
    warnings?: TestWarning[];
}

interface TestIssue {
    element?: Element;
    issue: string;
    severity: 'error' | 'warning';
    guideline: string;
    suggestion: string;
    details?: any;
}

interface TestWarning {
    element?: Element;
    issue: string;
    severity: 'warning';
    guideline: string;
    suggestion: string;
}

interface RGB {
    r: number;
    g: number;
    b: number;
}

type TestMethod = (options?: any) => TestResult | Promise<TestResult>;

export class WCAGRuleEngine {
    private config: RuleEngineConfig;
    private guidelines: Record<string, GuidelineInfo>;
    private testRegistry: Map<string, TestMethod>;
    private executionState: ExecutionState;

    constructor(config: Partial<RuleEngineConfig> = {}) {
        this.config = {
            enabled: true,
            level: 'AA',
            includeWarnings: true,
            autoFixEnabled: false,
            ...config
        };

        // WCAG 2.1 guidelines registry
        this.guidelines = {
            '1.1.1': { name: 'Non-text Content', level: 'A', category: 'perceivable' },
            '1.1.2': { name: 'Audio-only and Video-only', level: 'A', category: 'perceivable' },
            '1.2.1': { name: 'Audio Control', level: 'A', category: 'perceivable' },
            '1.3.1': { name: 'Info and Relationships', level: 'A', category: 'perceivable' },
            '1.3.2': { name: 'Meaningful Sequence', level: 'A', category: 'perceivable' },
            '1.3.3': { name: 'Sensory Characteristics', level: 'A', category: 'perceivable' },
            '1.4.1': { name: 'Use of Color', level: 'A', category: 'perceivable' },
            '1.4.2': { name: 'Audio Control', level: 'A', category: 'perceivable' },
            '1.4.3': { name: 'Contrast (Minimum)', level: 'AA', category: 'perceivable' },
            '1.4.4': { name: 'Resize Text', level: 'AA', category: 'perceivable' },
            '1.4.5': { name: 'Images of Text', level: 'AA', category: 'perceivable' },
            '2.1.1': { name: 'Keyboard', level: 'A', category: 'operable' },
            '2.1.2': { name: 'No Keyboard Trap', level: 'A', category: 'operable' },
            '2.2.1': { name: 'Timing Adjustable', level: 'A', category: 'operable' },
            '2.2.2': { name: 'Pause, Stop, Hide', level: 'A', category: 'operable' },
            '2.4.1': { name: 'Bypass Blocks', level: 'A', category: 'operable' },
            '2.4.2': { name: 'Page Titled', level: 'A', category: 'operable' },
            '2.4.3': { name: 'Focus Order', level: 'A', category: 'operable' },
            '2.4.4': { name: 'Link Purpose (In Context)', level: 'A', category: 'operable' },
            '2.4.5': { name: 'Multiple Ways', level: 'AA', category: 'operable' },
            '2.4.6': { name: 'Headings and Labels', level: 'AA', category: 'operable' },
            '2.4.7': { name: 'Focus Visible', level: 'AA', category: 'operable' },
            '3.1.1': { name: 'Language of Page', level: 'A', category: 'understandable' },
            '3.1.2': { name: 'Language of Parts', level: 'AA', category: 'understandable' },
            '3.2.1': { name: 'On Focus', level: 'A', category: 'understandable' },
            '3.2.2': { name: 'On Input', level: 'A', category: 'understandable' },
            '3.2.3': { name: 'Consistent Navigation', level: 'AA', category: 'understandable' },
            '3.2.4': { name: 'Consistent Identification', level: 'AA', category: 'understandable' },
            '3.3.1': { name: 'Error Identification', level: 'A', category: 'understandable' },
            '3.3.2': { name: 'Labels or Instructions', level: 'A', category: 'understandable' },
            '3.3.3': { name: 'Error Suggestion', level: 'AA', category: 'understandable' },
            '3.3.4': { name: 'Error Prevention', level: 'AA', category: 'understandable' },
            '4.1.1': { name: 'Parsing', level: 'A', category: 'robust' },
            '4.1.2': { name: 'Name, Role, Value', level: 'A', category: 'robust' },
            '4.1.3': { name: 'Status Messages', level: 'AA', category: 'robust' }
        };

        // Test method registry
        this.testRegistry = new Map();
        this.setupTestRegistry();

        // Rule execution state
        this.executionState = {
            running: false,
            currentTest: null,
            results: new Map()
        };
    }

    /**
     * Set up test method registry
     */
    setupTestRegistry(): void {
        // 1.1 Non-text content tests
        this.testRegistry.set('altText', this.testAltText.bind(this));
        this.testRegistry.set('imageLabels', this.testImageLabels.bind(this));
        this.testRegistry.set('decorativeImages', this.testDecorativeImages.bind(this));
        
        // 1.3 Adaptable tests
        this.testRegistry.set('headingStructure', this.testHeadingStructure.bind(this));
        this.testRegistry.set('meaningfulSequence', this.testMeaningfulSequence.bind(this));
        this.testRegistry.set('sensoryCues', this.testSensoryCues.bind(this));
        
        // 1.4 Distinguishable tests
        this.testRegistry.set('colorContrast', this.testColorContrast.bind(this));
        this.testRegistry.set('audioControl', this.testAudioControl.bind(this));
        this.testRegistry.set('textResize', this.testTextResize.bind(this));
        
        // 2.1 Keyboard accessible tests
        this.testRegistry.set('keyboardNavigation', this.testKeyboardNavigation.bind(this));
        this.testRegistry.set('noKeyboardTrap', this.testNoKeyboardTrap.bind(this));
        
        // 2.4 Navigable tests
        this.testRegistry.set('bypassBlocks', this.testBypassBlocks.bind(this));
        this.testRegistry.set('pageTitle', this.testPageTitle.bind(this));
        this.testRegistry.set('focusOrder', this.testFocusOrder.bind(this));
        this.testRegistry.set('linkPurpose', this.testLinkPurpose.bind(this));
        
        // 3.1 Readable tests
        this.testRegistry.set('languageOfPage', this.testLanguageOfPage.bind(this));
        
        // 3.2 Predictable tests
        this.testRegistry.set('onFocus', this.testOnFocus.bind(this));
        this.testRegistry.set('onInput', this.testOnInput.bind(this));
        this.testRegistry.set('consistentNavigation', this.testConsistentNavigation.bind(this));
        
        // 3.3 Input assistance tests
        this.testRegistry.set('errorIdentification', this.testErrorIdentification.bind(this));
        this.testRegistry.set('labelsInstructions', this.testLabelsInstructions.bind(this));
        
        // 4.1 Compatible tests
        this.testRegistry.set('parsing', this.testParsing.bind(this));
        this.testRegistry.set('nameRoleValue', this.testNameRoleValue.bind(this));
        this.testRegistry.set('statusMessages', this.testStatusMessages.bind(this));
    }

    /**
     * Run a specific test
     */
    async runTest(testName: string, options: any = {}): Promise<TestResult | null> {
        if (this.executionState.running) {
            console.warn('WCAGRuleEngine: Test already running');
            return null;
        }

        const testMethod = this.testRegistry.get(testName);
        if (!testMethod) {
            console.warn(`WCAGRuleEngine: Unknown test: ${testName}`);
            return {
                passed: false,
                issues: [{
                    issue: `Test ${testName} not implemented`,
                    severity: 'error',
                    guideline: 'unknown',
                    suggestion: 'Implement test method'
                }]
            };
        }

        this.executionState.running = true;
        this.executionState.currentTest = testName;

        try {
            const result = await testMethod(options);
            this.executionState.results.set(testName, result);
            return result;
        } catch (error: any) {
            console.error(`WCAGRuleEngine: Error in test ${testName}:`, error);
            return {
                passed: false,
                issues: [{
                    issue: `Test error: ${error.message}`,
                    severity: 'error',
                    guideline: 'unknown',
                    suggestion: 'Fix test implementation'
                }]
            };
        } finally {
            this.executionState.running = false;
            this.executionState.currentTest = null;
        }
    }

    /**
     * Test: Alt text for images
     */
    testAltText(): TestResult {
        const issues: TestIssue[] = [];
        const warnings: TestWarning[] = [];
        
        // Check all image elements
        const images = document.querySelectorAll('img');
        
        images.forEach((img, index) => {
            const alt = img.getAttribute('alt');
            const src = img.getAttribute('src');
            
            // Check for missing alt attribute
            if (alt === null) {
                issues.push({
                    element: img,
                    issue: 'Image missing alt attribute',
                    severity: 'error',
                    guideline: '1.1.1',
                    suggestion: 'Add meaningful alt text or empty alt="" for decorative images'
                });
            }
            // Check for non-descriptive alt text
            else if (alt && (alt.toLowerCase().includes('image') || alt.toLowerCase().includes('picture'))) {
                warnings.push({
                    element: img,
                    issue: 'Alt text may not be descriptive enough',
                    severity: 'warning',
                    guideline: '1.1.1',
                    suggestion: 'Use more descriptive alt text that conveys the image content'
                });
            }
            // Check for overly long alt text
            else if (alt && alt.length > 125) {
                warnings.push({
                    element: img,
                    issue: 'Alt text is very long',
                    severity: 'warning', 
                    guideline: '1.1.1',
                    suggestion: 'Consider using shorter alt text or longdesc attribute'
                });
            }
        });
        
        // Check canvas elements
        const canvases = document.querySelectorAll('canvas');
        canvases.forEach(canvas => {
            const hasLabel = canvas.getAttribute('aria-label') || 
                           canvas.getAttribute('aria-labelledby') ||
                           canvas.textContent?.trim();
            
            if (!hasLabel) {
                issues.push({
                    element: canvas,
                    issue: 'Canvas element missing accessible name',
                    severity: 'error',
                    guideline: '1.1.1',
                    suggestion: 'Add aria-label or provide alternative content'
                });
            }
        });
        
        return {
            passed: issues.length === 0,
            issues,
            warnings
        };
    }

    /**
     * Test: Color contrast ratios
     */
    testColorContrast(): TestResult {
        const issues: TestIssue[] = [];
        const warnings: TestWarning[] = [];
        
        // Check text elements for color contrast
        const textElements = document.querySelectorAll('*');
        
        textElements.forEach(element => {
            const styles = window.getComputedStyle(element);
            const textContent = element.textContent?.trim();
            
            if (!textContent || textContent.length === 0) return;
            
            const color = styles.color;
            const backgroundColor = styles.backgroundColor;
            const fontSize = parseFloat(styles.fontSize);
            const fontWeight = styles.fontWeight;
            
            if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
                const contrast = this.calculateContrastRatio(color, backgroundColor);
                const isLargeText = fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
                
                const requiredContrast = isLargeText ? 3.0 : 4.5; // AA level
                
                if (contrast < requiredContrast) {
                    issues.push({
                        element,
                        issue: `Insufficient color contrast: ${contrast.toFixed(2)}:1 (required: ${requiredContrast}:1)`,
                        severity: 'error',
                        guideline: '1.4.3',
                        suggestion: `Increase contrast between text and background colors`,
                        details: {
                            currentContrast: contrast,
                            requiredContrast,
                            textColor: color,
                            backgroundColor,
                            isLargeText
                        }
                    });
                } else if (contrast < requiredContrast * 1.2) {
                    warnings.push({
                        element,
                        issue: `Color contrast is close to minimum threshold: ${contrast.toFixed(2)}:1`,
                        severity: 'warning',
                        guideline: '1.4.3',
                        suggestion: 'Consider increasing contrast for better accessibility'
                    });
                }
            }
        });
        
        return {
            passed: issues.length === 0,
            issues,
            warnings
        };
    }

    /**
     * Test: Keyboard navigation support
     */
    testKeyboardNavigation(): TestResult {
        const issues: TestIssue[] = [];
        const warnings: TestWarning[] = [];
        
        // Check focusable elements
        const focusableElements = document.querySelectorAll(
            'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
        );
        
        focusableElements.forEach(element => {
            const tabindex = element.getAttribute('tabindex');
            
            // Check for positive tabindex
            if (tabindex && parseInt(tabindex) > 0) {
                warnings.push({
                    element,
                    issue: 'Positive tabindex value detected',
                    severity: 'warning',
                    guideline: '2.4.3',
                    suggestion: 'Avoid positive tabindex values. Use 0 or -1 instead'
                });
            }
        });
        
        // Check for click handlers on non-focusable elements
        const clickableElements = document.querySelectorAll('[onclick]');
        clickableElements.forEach(element => {
            const isFocusable = element.matches(
                'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
            );
            
            if (!isFocusable) {
                issues.push({
                    element,
                    issue: 'Click handler on non-focusable element',
                    severity: 'error',
                    guideline: '2.1.1',
                    suggestion: 'Make element focusable with tabindex="0" or use semantic HTML'
                });
            }
        });
        
        // Check interactive elements for keyboard handlers
        const interactiveElements = document.querySelectorAll('div[role="button"], span[role="button"]');
        interactiveElements.forEach(element => {
            const hasKeyHandler = element.hasAttribute('onkeydown') || 
                                element.hasAttribute('onkeyup') || 
                                element.hasAttribute('onkeypress');
            
            if (!hasKeyHandler) {
                issues.push({
                    element,
                    issue: 'Interactive element missing keyboard handler',
                    severity: 'error',
                    guideline: '2.1.1',
                    suggestion: 'Add keyboard event handlers for Enter and Space keys'
                });
            }
        });
        
        return {
            passed: issues.length === 0,
            issues,
            warnings
        };
    }

    /**
     * Test: Heading structure
     */
    testHeadingStructure(): TestResult {
        const issues: TestIssue[] = [];
        const warnings: TestWarning[] = [];
        
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        const headingLevels: number[] = [];
        
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.charAt(1));
            headingLevels.push(level);
            
            // Check for empty headings
            if (!heading.textContent?.trim()) {
                issues.push({
                    element: heading,
                    issue: 'Empty heading detected',
                    severity: 'error',
                    guideline: '1.3.1',
                    suggestion: 'Remove empty heading or add meaningful content'
                });
            }
            
            // Check for multiple h1s
            if (level === 1 && headingLevels.filter(l => l === 1).length > 1) {
                warnings.push({
                    element: heading,
                    issue: 'Multiple H1 headings detected',
                    severity: 'warning',
                    guideline: '1.3.1',
                    suggestion: 'Use only one H1 per page'
                });
            }
            
            // Check for skipped levels
            if (index > 0) {
                const prevLevel = headingLevels[index - 1];
                if (level > prevLevel + 1) {
                    warnings.push({
                        element: heading,
                        issue: `Heading level skipped from H${prevLevel} to H${level}`,
                        severity: 'warning',
                        guideline: '1.3.1',
                        suggestion: 'Use sequential heading levels'
                    });
                }
            }
        });
        
        // Check if no h1 exists
        if (headingLevels.filter(l => l === 1).length === 0 && headings.length > 0) {
            warnings.push({
                issue: 'No H1 heading found on page',
                severity: 'warning',
                guideline: '1.3.1',
                suggestion: 'Add an H1 heading as the main page title'
            });
        }
        
        return {
            passed: issues.length === 0,
            issues,
            warnings
        };
    }

    /**
     * Test: Page title
     */
    testPageTitle(): TestResult {
        const issues: TestIssue[] = [];
        const warnings: TestWarning[] = [];
        
        const title = document.querySelector('title');
        
        if (!title || !title.textContent?.trim()) {
            issues.push({
                issue: 'Page missing title element',
                severity: 'error',
                guideline: '2.4.2',
                suggestion: 'Add a descriptive title element to the page'
            });
        } else {
            const titleText = title.textContent.trim();
            
            // Check title length
            if (titleText.length < 10) {
                warnings.push({
                    issue: 'Page title is very short',
                    severity: 'warning',
                    guideline: '2.4.2',
                    suggestion: 'Use a more descriptive page title'
                });
            }
            
            // Check for generic titles
            const genericTitles = ['untitled', 'home', 'page', 'document', 'index'];
            if (genericTitles.includes(titleText.toLowerCase())) {
                warnings.push({
                    issue: 'Page title is too generic',
                    severity: 'warning',
                    guideline: '2.4.2',
                    suggestion: 'Use a unique, descriptive title for the page'
                });
            }
        }
        
        return {
            passed: issues.length === 0,
            issues,
            warnings
        };
    }

    /**
     * Test: Language of page
     */
    testLanguageOfPage(): TestResult {
        const issues: TestIssue[] = [];
        
        const html = document.documentElement;
        const lang = html.getAttribute('lang');
        
        if (!lang) {
            issues.push({
                element: html,
                issue: 'Page language not specified',
                severity: 'error',
                guideline: '3.1.1',
                suggestion: 'Add lang attribute to html element (e.g., lang="en")'
            });
        } else if (lang.length < 2) {
            issues.push({
                element: html,
                issue: 'Invalid language code',
                severity: 'error',
                guideline: '3.1.1',
                suggestion: 'Use valid ISO 639-1 language code'
            });
        }
        
        return {
            passed: issues.length === 0,
            issues
        };
    }

    /**
     * Test: Form labels and instructions
     */
    testLabelsInstructions(): TestResult {
        const issues: TestIssue[] = [];
        const warnings: TestWarning[] = [];
        
        // Check form inputs
        const formInputs = document.querySelectorAll('input:not([type="submit"]):not([type="button"]):not([type="hidden"]), textarea, select');
        
        formInputs.forEach(input => {
            const id = input.getAttribute('id');
            const hasLabel = id && document.querySelector(`label[for="${id}"]`);
            const hasAriaLabel = input.hasAttribute('aria-label');
            const hasAriaLabelledBy = input.hasAttribute('aria-labelledby');
            const hasTitle = input.hasAttribute('title');
            const isWrappedInLabel = input.closest('label');
            
            if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle && !isWrappedInLabel) {
                issues.push({
                    element: input,
                    issue: 'Form input missing label',
                    severity: 'error',
                    guideline: '3.3.2',
                    suggestion: 'Add label element, aria-label, or aria-labelledby'
                });
            }
            
            // Check for placeholder as sole label
            if (input instanceof HTMLInputElement && input.placeholder && !hasLabel && !hasAriaLabel) {
                warnings.push({
                    element: input,
                    issue: 'Placeholder used as sole label',
                    severity: 'warning',
                    guideline: '3.3.2',
                    suggestion: 'Add proper label in addition to placeholder'
                });
            }
        });
        
        return {
            passed: issues.length === 0,
            issues,
            warnings
        };
    }

    /**
     * Test: Name, Role, Value
     */
    testNameRoleValue(): TestResult {
        const issues: TestIssue[] = [];
        
        // Check custom controls
        const customControls = document.querySelectorAll('[role]');
        
        customControls.forEach(element => {
            const role = element.getAttribute('role');
            
            // Check if control has accessible name
            if (['button', 'link', 'checkbox', 'radio', 'tab', 'menuitem'].includes(role || '')) {
                const hasName = element.hasAttribute('aria-label') || 
                              element.hasAttribute('aria-labelledby') || 
                              element.textContent?.trim();
                
                if (!hasName) {
                    issues.push({
                        element,
                        issue: `Custom ${role} missing accessible name`,
                        severity: 'error',
                        guideline: '4.1.2',
                        suggestion: 'Add aria-label, aria-labelledby, or text content'
                    });
                }
            }
            
            // Check for required ARIA properties
            if (role === 'checkbox' || role === 'radio') {
                if (!element.hasAttribute('aria-checked')) {
                    issues.push({
                        element,
                        issue: `${role} missing aria-checked state`,
                        severity: 'error',
                        guideline: '4.1.2',
                        suggestion: 'Add aria-checked="true" or aria-checked="false"'
                    });
                }
            }
        });
        
        return {
            passed: issues.length === 0,
            issues
        };
    }

    /**
     * Helper: Calculate color contrast ratio
     */
    private calculateContrastRatio(color1: string, color2: string): number {
        const rgb1 = this.parseColor(color1);
        const rgb2 = this.parseColor(color2);
        
        if (!rgb1 || !rgb2) return 0;
        
        const l1 = this.getRelativeLuminance(rgb1);
        const l2 = this.getRelativeLuminance(rgb2);
        
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        
        return (lighter + 0.05) / (darker + 0.05);
    }

    /**
     * Helper: Parse color string to RGB
     */
    private parseColor(color: string): RGB | null {
        // Handle rgb/rgba format
        const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgbMatch) {
            return {
                r: parseInt(rgbMatch[1]),
                g: parseInt(rgbMatch[2]),
                b: parseInt(rgbMatch[3])
            };
        }
        
        // Handle hex format
        const hexMatch = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
        if (hexMatch) {
            const hex = hexMatch[1];
            if (hex.length === 3) {
                return {
                    r: parseInt(hex[0] + hex[0], 16),
                    g: parseInt(hex[1] + hex[1], 16),
                    b: parseInt(hex[2] + hex[2], 16)
                };
            } else {
                return {
                    r: parseInt(hex.substr(0, 2), 16),
                    g: parseInt(hex.substr(2, 2), 16),
                    b: parseInt(hex.substr(4, 2), 16)
                };
            }
        }
        
        return null;
    }

    /**
     * Helper: Calculate relative luminance
     */
    private getRelativeLuminance(rgb: RGB): number {
        const rsRGB = rgb.r / 255;
        const gsRGB = rgb.g / 255;
        const bsRGB = rgb.b / 255;
        
        const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
        const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
        const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
        
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    // Stub implementations for remaining tests
    testImageLabels(): TestResult {
        return { passed: true, issues: [] };
    }

    testDecorativeImages(): TestResult {
        return { passed: true, issues: [] };
    }

    testMeaningfulSequence(): TestResult {
        return { passed: true, issues: [] };
    }

    testSensoryCues(): TestResult {
        return { passed: true, issues: [] };
    }

    testAudioControl(): TestResult {
        return { passed: true, issues: [] };
    }

    testTextResize(): TestResult {
        return { passed: true, issues: [] };
    }

    testNoKeyboardTrap(): TestResult {
        return { passed: true, issues: [] };
    }

    testBypassBlocks(): TestResult {
        return { passed: true, issues: [] };
    }

    testFocusOrder(): TestResult {
        return { passed: true, issues: [] };
    }

    testLinkPurpose(): TestResult {
        return { passed: true, issues: [] };
    }

    testOnFocus(): TestResult {
        return { passed: true, issues: [] };
    }

    testOnInput(): TestResult {
        return { passed: true, issues: [] };
    }

    testConsistentNavigation(): TestResult {
        return { passed: true, issues: [] };
    }

    testErrorIdentification(): TestResult {
        return { passed: true, issues: [] };
    }

    testParsing(): TestResult {
        return { passed: true, issues: [] };
    }

    testStatusMessages(): TestResult {
        return { passed: true, issues: [] };
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<RuleEngineConfig>): void {
        this.config = {
            ...this.config,
            ...newConfig
        };
    }

    /**
     * Get test results
     */
    getTestResults(): Map<string, TestResult> {
        return new Map(this.executionState.results);
    }

    /**
     * Clear test results
     */
    clearResults(): void {
        this.executionState.results.clear();
    }

    /**
     * Check if engine is enabled
     */
    isEnabled(): boolean {
        return this.config.enabled;
    }

    /**
     * Destroy and cleanup
     */
    destroy(): void {
        this.clearResults();
        console.log('WCAGRuleEngine: Destroyed');
    }
}