/**
 * ARIAAttributeProcessor - ARIA attribute validation and processing
 * Handles ARIA semantic structure analysis and live region monitoring
 */
export class ARIAAttributeProcessor {
    constructor(config = {}) {
        this.config = {
            enabled: true,
            validateStructure: true,
            monitorLiveRegions: true,
            trackChanges: true,
            strictValidation: false,
            ...config
        };

        // ARIA role definitions and requirements
        this.ariaRoles = {
            // Widget roles
            'button': { requiredProps: [], allowedProps: ['aria-expanded', 'aria-pressed'] },
            'checkbox': { requiredProps: ['aria-checked'], allowedProps: ['aria-describedby'] },
            'combobox': { requiredProps: ['aria-expanded'], allowedProps: ['aria-activedescendant', 'aria-autocomplete'] },
            'slider': { requiredProps: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'], allowedProps: ['aria-valuetext', 'aria-orientation'] },
            'spinbutton': { requiredProps: ['aria-valuenow'], allowedProps: ['aria-valuemin', 'aria-valuemax', 'aria-valuetext'] },
            'textbox': { requiredProps: [], allowedProps: ['aria-activedescendant', 'aria-autocomplete', 'aria-multiline', 'aria-placeholder', 'aria-readonly'] },
            
            // Composite roles
            'grid': { requiredProps: [], allowedProps: ['aria-level', 'aria-multiselectable', 'aria-readonly'] },
            'listbox': { requiredProps: [], allowedProps: ['aria-activedescendant', 'aria-multiselectable', 'aria-readonly', 'aria-required'] },
            'menu': { requiredProps: [], allowedProps: ['aria-activedescendant', 'aria-orientation'] },
            'menubar': { requiredProps: [], allowedProps: ['aria-activedescendant', 'aria-orientation'] },
            'radiogroup': { requiredProps: [], allowedProps: ['aria-activedescendant', 'aria-orientation', 'aria-readonly', 'aria-required'] },
            'tablist': { requiredProps: [], allowedProps: ['aria-activedescendant', 'aria-level', 'aria-multiselectable', 'aria-orientation'] },
            'tree': { requiredProps: [], allowedProps: ['aria-activedescendant', 'aria-multiselectable', 'aria-orientation', 'aria-required'] },
            'treegrid': { requiredProps: [], allowedProps: ['aria-activedescendant', 'aria-level', 'aria-multiselectable', 'aria-orientation', 'aria-readonly', 'aria-required'] },
            
            // Document structure roles
            'article': { requiredProps: [], allowedProps: ['aria-posinset', 'aria-setsize'] },
            'definition': { requiredProps: [], allowedProps: [] },
            'directory': { requiredProps: [], allowedProps: [] },
            'document': { requiredProps: [], allowedProps: ['aria-expanded'] },
            'group': { requiredProps: [], allowedProps: ['aria-activedescendant'] },
            'heading': { requiredProps: [], allowedProps: ['aria-level'] },
            'img': { requiredProps: [], allowedProps: [] },
            'list': { requiredProps: [], allowedProps: [] },
            'listitem': { requiredProps: [], allowedProps: ['aria-level', 'aria-posinset', 'aria-setsize'] },
            'math': { requiredProps: [], allowedProps: [] },
            'note': { requiredProps: [], allowedProps: [] },
            'presentation': { requiredProps: [], allowedProps: [] },
            'region': { requiredProps: [], allowedProps: [] },
            'separator': { requiredProps: [], allowedProps: ['aria-orientation', 'aria-valuemax', 'aria-valuemin', 'aria-valuenow'] },
            'toolbar': { requiredProps: [], allowedProps: ['aria-activedescendant', 'aria-orientation'] },
            
            // Landmark roles
            'application': { requiredProps: [], allowedProps: ['aria-activedescendant', 'aria-expanded'] },
            'banner': { requiredProps: [], allowedProps: [] },
            'complementary': { requiredProps: [], allowedProps: [] },
            'contentinfo': { requiredProps: [], allowedProps: [] },
            'form': { requiredProps: [], allowedProps: [] },
            'main': { requiredProps: [], allowedProps: [] },
            'navigation': { requiredProps: [], allowedProps: [] },
            'search': { requiredProps: [], allowedProps: [] },
            
            // Live region roles
            'alert': { requiredProps: [], allowedProps: [] },
            'log': { requiredProps: [], allowedProps: [] },
            'marquee': { requiredProps: [], allowedProps: [] },
            'status': { requiredProps: [], allowedProps: [] },
            'timer': { requiredProps: [], allowedProps: [] }
        };

        // Live region monitoring
        this.liveRegions = new Map();
        this.liveRegionObservers = new Map();

        // Validation results
        this.validationResults = {
            passed: [],
            failed: [],
            warnings: [],
            liveRegionUpdates: []
        };

        // Performance metrics
        this.performance = {
            validationTime: [],
            processedElements: 0,
            liveRegionUpdates: 0
        };
    }

    /**
     * Initialize ARIA attribute processing
     */
    initialize() {
        if (this.config.monitorLiveRegions) {
            this.setupLiveRegionMonitoring();
        }
    }

    /**
     * Validate all ARIA attributes on the page
     */
    async validateAriaAttributes() {
        const startTime = performance.now();
        console.log('ARIAAttributeProcessor: Validating ARIA attributes...');

        // Clear previous results
        this.validationResults = {
            passed: [],
            failed: [],
            warnings: [],
            liveRegionUpdates: []
        };

        const elementsWithAria = document.querySelectorAll(
            '[role], [aria-label], [aria-labelledby], [aria-describedby], [aria-expanded], [aria-checked], [aria-selected], [aria-live], [aria-atomic], [aria-relevant]'
        );

        for (const element of elementsWithAria) {
            await this.validateElementAria(element);
        }

        const endTime = performance.now();
        const validationTime = endTime - startTime;
        this.performance.validationTime.push(validationTime);
        this.performance.processedElements = elementsWithAria.length;

        console.log(`ARIA validation completed in ${validationTime.toFixed(2)}ms. Found ${this.validationResults.failed.length} issues`);

        return {
            results: this.validationResults,
            performance: {
                validationTime,
                processedElements: elementsWithAria.length
            }
        };
    }

    /**
     * Validate ARIA attributes for a specific element
     */
    async validateElementAria(element) {
        const role = element.getAttribute('role');
        const ariaAttributes = this.getAriaAttributes(element);

        // Validate role if present
        if (role) {
            this.validateRole(element, role, ariaAttributes);
        }

        // Validate individual ARIA attributes
        for (const [attribute, value] of Object.entries(ariaAttributes)) {
            this.validateAriaAttribute(element, attribute, value);
        }

        // Check for accessible name
        this.validateAccessibleName(element);

        // Check for proper labeling
        this.validateLabeling(element);
    }

    /**
     * Validate ARIA role
     */
    validateRole(element, role, ariaAttributes) {
        const roleDefinition = this.ariaRoles[role];
        
        if (!roleDefinition) {
            this.addValidationIssue(element, 'error', `Unknown ARIA role: ${role}`, 'invalid-role');
            return;
        }

        // Check required properties
        for (const requiredProp of roleDefinition.requiredProps) {
            if (!ariaAttributes[requiredProp]) {
                this.addValidationIssue(
                    element,
                    'error',
                    `Missing required ARIA property: ${requiredProp} for role="${role}"`,
                    'missing-required-property'
                );
            }
        }

        // Check for invalid properties (if strict validation enabled)
        if (this.config.strictValidation) {
            const allowedProps = [...roleDefinition.requiredProps, ...roleDefinition.allowedProps];
            for (const prop of Object.keys(ariaAttributes)) {
                if (!allowedProps.includes(prop) && !this.isGlobalAriaProperty(prop)) {
                    this.addValidationIssue(
                        element,
                        'warning',
                        `Property ${prop} not allowed for role="${role}"`,
                        'invalid-property'
                    );
                }
            }
        }

        this.addValidationPass(element, `Role "${role}" validation passed`);
    }

    /**
     * Validate individual ARIA attribute
     */
    validateAriaAttribute(element, attribute, value) {
        switch (attribute) {
            case 'aria-expanded':
                if (!['true', 'false'].includes(value)) {
                    this.addValidationIssue(element, 'error', `Invalid aria-expanded value: ${value}`, 'invalid-boolean');
                }
                break;

            case 'aria-checked':
                if (!['true', 'false', 'mixed'].includes(value)) {
                    this.addValidationIssue(element, 'error', `Invalid aria-checked value: ${value}`, 'invalid-tristate');
                }
                break;

            case 'aria-selected':
                if (!['true', 'false'].includes(value)) {
                    this.addValidationIssue(element, 'error', `Invalid aria-selected value: ${value}`, 'invalid-boolean');
                }
                break;

            case 'aria-level':
                const level = parseInt(value);
                if (isNaN(level) || level < 1) {
                    this.addValidationIssue(element, 'error', `Invalid aria-level value: ${value}`, 'invalid-integer');
                }
                break;

            case 'aria-valuenow':
            case 'aria-valuemin':
            case 'aria-valuemax':
                const numValue = parseFloat(value);
                if (isNaN(numValue)) {
                    this.addValidationIssue(element, 'error', `Invalid ${attribute} value: ${value}`, 'invalid-number');
                }
                break;

            case 'aria-labelledby':
            case 'aria-describedby':
                this.validateIdReferences(element, attribute, value);
                break;

            case 'aria-live':
                if (!['off', 'polite', 'assertive'].includes(value)) {
                    this.addValidationIssue(element, 'error', `Invalid aria-live value: ${value}`, 'invalid-live-value');
                }
                break;

            case 'aria-relevant':
                const validRelevant = ['additions', 'removals', 'text', 'all'];
                const relevantValues = value.split(' ');
                for (const val of relevantValues) {
                    if (!validRelevant.includes(val)) {
                        this.addValidationIssue(element, 'error', `Invalid aria-relevant value: ${val}`, 'invalid-relevant-value');
                    }
                }
                break;
        }
    }

    /**
     * Validate ID references in ARIA attributes
     */
    validateIdReferences(element, attribute, value) {
        const ids = value.split(' ').filter(id => id.trim());
        
        for (const id of ids) {
            const referencedElement = document.getElementById(id);
            if (!referencedElement) {
                this.addValidationIssue(
                    element,
                    'error',
                    `${attribute} references non-existent ID: ${id}`,
                    'invalid-id-reference'
                );
            }
        }
    }

    /**
     * Validate accessible name
     */
    validateAccessibleName(element) {
        const role = element.getAttribute('role') || this.getImplicitRole(element);
        
        // Check if element requires accessible name
        const requiresAccessibleName = this.elementRequiresAccessibleName(element, role);
        
        if (requiresAccessibleName) {
            const accessibleName = this.getAccessibleName(element);
            
            if (!accessibleName) {
                this.addValidationIssue(
                    element,
                    'error',
                    `Element with role="${role}" missing accessible name`,
                    'missing-accessible-name'
                );
            } else {
                this.addValidationPass(element, 'Accessible name validation passed');
            }
        }
    }

    /**
     * Validate element labeling
     */
    validateLabeling(element) {
        // Check form elements for proper labeling
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)) {
            const hasLabel = this.hasProperLabel(element);
            
            if (!hasLabel) {
                this.addValidationIssue(
                    element,
                    'warning',
                    'Form element missing proper label',
                    'missing-form-label'
                );
            }
        }
    }

    /**
     * Check if element has proper label
     */
    hasProperLabel(element) {
        // Check for aria-label
        if (element.hasAttribute('aria-label')) {
            return true;
        }

        // Check for aria-labelledby
        if (element.hasAttribute('aria-labelledby')) {
            return true;
        }

        // Check for associated label element
        if (element.id) {
            const label = document.querySelector(`label[for="${element.id}"]`);
            if (label) {
                return true;
            }
        }

        // Check if wrapped by label
        const parentLabel = element.closest('label');
        if (parentLabel) {
            return true;
        }

        return false;
    }

    /**
     * Setup live region monitoring
     */
    setupLiveRegionMonitoring() {
        const liveRegions = document.querySelectorAll('[aria-live], [role="alert"], [role="status"], [role="log"]');
        
        for (const region of liveRegions) {
            this.monitorLiveRegion(region);
        }

        // Monitor for new live regions
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.type === 'childList') {
                        for (const node of mutation.addedNodes) {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                const newLiveRegions = node.querySelectorAll('[aria-live], [role="alert"], [role="status"], [role="log"]');
                                for (const region of newLiveRegions) {
                                    this.monitorLiveRegion(region);
                                }
                            }
                        }
                    }
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    /**
     * Monitor specific live region
     */
    monitorLiveRegion(region) {
        const regionId = this.generateRegionId(region);
        
        if (this.liveRegionObservers.has(regionId)) {
            return; // Already monitoring
        }

        const liveValue = region.getAttribute('aria-live') || this.getImplicitLiveValue(region);
        const atomic = region.getAttribute('aria-atomic') === 'true';
        const relevant = region.getAttribute('aria-relevant') || 'additions text';

        this.liveRegions.set(regionId, {
            element: region,
            liveValue,
            atomic,
            relevant,
            lastContent: region.textContent
        });

        // Set up mutation observer for this region
        const observer = new MutationObserver((mutations) => {
            this.handleLiveRegionUpdate(regionId, mutations);
        });

        observer.observe(region, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: false
        });

        this.liveRegionObservers.set(regionId, observer);
    }

    /**
     * Handle live region update
     */
    handleLiveRegionUpdate(regionId, mutations) {
        const regionData = this.liveRegions.get(regionId);
        if (!regionData) return;

        const { element, liveValue, atomic, relevant } = regionData;
        const currentContent = element.textContent;
        const previousContent = regionData.lastContent;

        // Check if content actually changed
        if (currentContent === previousContent) {
            return;
        }

        // Update stored content
        regionData.lastContent = currentContent;

        // Generate announcement based on live region settings
        const announcement = this.generateLiveRegionAnnouncement(
            element,
            currentContent,
            previousContent,
            { liveValue, atomic, relevant }
        );

        // Store live region update
        this.validationResults.liveRegionUpdates.push({
            regionId,
            timestamp: Date.now(),
            announcement,
            liveValue,
            atomic,
            relevant,
            mutations: mutations.map(m => ({
                type: m.type,
                target: m.target.tagName
            }))
        });

        this.performance.liveRegionUpdates++;

        console.log(`Live region update: ${announcement}`);
    }

    /**
     * Generate live region announcement
     */
    generateLiveRegionAnnouncement(element, currentContent, previousContent, settings) {
        const { liveValue, atomic, relevant } = settings;

        if (atomic) {
            // Announce entire region content
            return currentContent;
        }

        // Announce only changes based on relevant setting
        const relevantTypes = relevant.split(' ');
        
        if (relevantTypes.includes('additions') || relevantTypes.includes('all')) {
            // For simplicity, announce new content
            return currentContent;
        }

        return currentContent;
    }

    /**
     * Utility methods
     */
    getAriaAttributes(element) {
        const ariaAttrs = {};
        for (const attr of element.attributes) {
            if (attr.name.startsWith('aria-')) {
                ariaAttrs[attr.name] = attr.value;
            }
        }
        return ariaAttrs;
    }

    getImplicitRole(element) {
        const tagRoleMap = {
            'button': 'button',
            'a': element.hasAttribute('href') ? 'link' : null,
            'input': this.getInputRole(element),
            'textarea': 'textbox',
            'select': 'combobox'
        };

        return tagRoleMap[element.tagName.toLowerCase()] || null;
    }

    getInputRole(input) {
        const type = input.type.toLowerCase();
        const roleMap = {
            'button': 'button',
            'checkbox': 'checkbox',
            'radio': 'radio',
            'range': 'slider'
        };

        return roleMap[type] || 'textbox';
    }

    getImplicitLiveValue(element) {
        const role = element.getAttribute('role');
        const liveRoles = {
            'alert': 'assertive',
            'status': 'polite',
            'log': 'polite'
        };

        return liveRoles[role] || 'off';
    }

    elementRequiresAccessibleName(element, role) {
        const requiresNameRoles = [
            'button', 'link', 'checkbox', 'radio', 'textbox', 'combobox',
            'slider', 'spinbutton', 'img', 'region'
        ];

        return requiresNameRoles.includes(role);
    }

    getAccessibleName(element) {
        // aria-label takes precedence
        if (element.hasAttribute('aria-label')) {
            return element.getAttribute('aria-label');
        }

        // aria-labelledby
        if (element.hasAttribute('aria-labelledby')) {
            const labelIds = element.getAttribute('aria-labelledby').split(' ');
            const labels = labelIds.map(id => {
                const labelElement = document.getElementById(id);
                return labelElement ? labelElement.textContent?.trim() : '';
            }).filter(Boolean);
            
            if (labels.length > 0) {
                return labels.join(' ');
            }
        }

        // For form elements, check associated label
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)) {
            const label = document.querySelector(`label[for="${element.id}"]`);
            if (label) {
                return label.textContent?.trim();
            }
        }

        // Use text content as fallback
        return element.textContent?.trim() || '';
    }

    isGlobalAriaProperty(property) {
        const globalProps = [
            'aria-atomic', 'aria-busy', 'aria-controls', 'aria-current',
            'aria-describedby', 'aria-details', 'aria-disabled', 'aria-dropeffect',
            'aria-errormessage', 'aria-flowto', 'aria-grabbed', 'aria-haspopup',
            'aria-hidden', 'aria-invalid', 'aria-keyshortcuts', 'aria-label',
            'aria-labelledby', 'aria-live', 'aria-owns', 'aria-relevant',
            'aria-roledescription'
        ];

        return globalProps.includes(property);
    }

    generateRegionId(element) {
        return element.id || `live-region-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    addValidationIssue(element, severity, message, code) {
        const issue = {
            element,
            severity,
            message,
            code,
            timestamp: Date.now()
        };

        if (severity === 'error') {
            this.validationResults.failed.push(issue);
        } else {
            this.validationResults.warnings.push(issue);
        }
    }

    addValidationPass(element, message) {
        this.validationResults.passed.push({
            element,
            message,
            timestamp: Date.now()
        });
    }

    /**
     * Get validation summary
     */
    getValidationSummary() {
        return {
            passed: this.validationResults.passed.length,
            failed: this.validationResults.failed.length,
            warnings: this.validationResults.warnings.length,
            liveRegionUpdates: this.validationResults.liveRegionUpdates.length
        };
    }

    /**
     * Get live region status
     */
    getLiveRegionStatus() {
        return {
            monitored: this.liveRegions.size,
            updates: this.performance.liveRegionUpdates,
            regions: Array.from(this.liveRegions.entries()).map(([id, data]) => ({
                id,
                liveValue: data.liveValue,
                atomic: data.atomic,
                relevant: data.relevant
            }))
        };
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig
        };
    }

    /**
     * Clear validation results
     */
    clearResults() {
        this.validationResults = {
            passed: [],
            failed: [],
            warnings: [],
            liveRegionUpdates: []
        };
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        // Stop all live region observers
        for (const observer of this.liveRegionObservers.values()) {
            observer.disconnect();
        }
        
        this.liveRegionObservers.clear();
        this.liveRegions.clear();
        this.clearResults();
    }
}