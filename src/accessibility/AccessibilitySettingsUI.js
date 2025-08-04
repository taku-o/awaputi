/**
 * AccessibilitySettingsUI - Main Controller for accessibility settings interface
 * Orchestrates settings panel, validation, and preferences management using sub-components
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';
import { AccessibilitySettingsPanel } from './settings-ui/AccessibilitySettingsPanel.js';
import { SettingsValidator } from './settings-ui/SettingsValidator.js';
import { AccessibilityPreferencesManager } from './settings-ui/AccessibilityPreferencesManager.js';

export class AccessibilitySettingsUI {
    constructor(accessibilityManager) {
        this.accessibilityManager = accessibilityManager;
        this.gameEngine = accessibilityManager?.gameEngine;
        
        // Main controller configuration
        this.config = {
            enabled: true,
            showAdvancedSettings: false,
            realTimePreview: true,
            saveOnChange: true,
            showTooltips: true,
            keyboardNavigation: true,
            animateChanges: true
        };

        // Initialize sub-components
        this.settingsPanel = new AccessibilitySettingsPanel({
            showAdvancedSettings: this.config.showAdvancedSettings,
            showTooltips: this.config.showTooltips,
            animateChanges: this.config.animateChanges
        });

        this.settingsValidator = new SettingsValidator({
            strictValidation: true,
            validateOnChange: this.config.saveOnChange,
            logValidationErrors: true
        });

        this.preferencesManager = new AccessibilityPreferencesManager({
            storageKey: 'accessibilitySettings',
            autoSave: this.config.saveOnChange,
            enableProfiles: true,
            enableExport: true,
            enableImport: true
        });

        // State management
        this.ui = {
            container: null,
            currentCategory: 'visual'
        };

        this.eventListeners = new Map();
        this.stats = {
            settingsChanged: 0,
            categoriesVisited: new Set(),
            profilesUsed: 0,
            sessionStart: Date.now()
        };

        console.log('AccessibilitySettingsUI initialized with sub-components');
        this.initialize();
    }
    
    /**
     * Initialize main controller and sub-components
     */
    async initialize() {
        try {
            // Initialize sub-components
            const initResults = await Promise.all([
                this.settingsPanel.initialize(),
                this.settingsValidator.initialize(),
                this.preferencesManager.initialize()
            ]);

            if (!initResults.every(result => result)) {
                throw new Error('Failed to initialize sub-components');
            }

            // Create UI using panel component
            this.createUI();
            this.bindEvents();
            this.setupKeyboardNavigation();
            
            console.log('AccessibilitySettingsUI initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'ACCESSIBILITY_SETTINGS_UI_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * Create UI using settings panel component
     */
    createUI() {
        try {
            // Create UI container using settings panel
            this.ui.container = this.settingsPanel.createUI();
            
            if (!this.ui.container) {
                throw new Error('Failed to create UI container');
            }
            
            console.log('AccessibilitySettingsUI: UI created successfully');
        } catch (error) {
            console.error('AccessibilitySettingsUI: UI creation failed:', error);
            throw error;
        }
    }
    
    /**
     * Bind events to UI elements
     */
    bindEvents() {
        if (!this.ui.container) return;
        
        const container = this.ui.container;
        
        // Settings change handler
        const settingChangeHandler = async (event) => {
            await this.handleSettingChange(event);
        };
        
        // Navigation handler
        const navigationHandler = (event) => {
            if (event.target.closest('.nav-item')) {
                const categoryId = event.target.closest('.nav-item').dataset.category;
                this.showCategory(categoryId);
            }
        };
        
        // Button handler
        const buttonHandler = async (event) => {
            const buttonId = event.target.id;
            
            switch (buttonId) {
                case 'reset-settings':
                    await this.resetSettings();
                    break;
                case 'export-settings':
                    await this.exportSettings();
                    break;
                case 'import-settings':
                    await this.importSettings();
                    break;
                case 'apply-settings':
                    await this.applySettings();
                    break;
            }
            
            if (event.target.closest('.settings-close')) {
                this.close();
            }
        };
        
        // Bind events
        container.addEventListener('input', settingChangeHandler);
        container.addEventListener('change', settingChangeHandler);
        container.addEventListener('click', navigationHandler);
        container.addEventListener('click', buttonHandler);
        
        // ESC key handler
        const escapeHandler = (event) => {
            if (event.key === 'Escape' && this.ui.container.style.display !== 'none') {
                this.close();
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        // Store event handlers for cleanup
        this.eventListeners.set('settingChange', settingChangeHandler);
        this.eventListeners.set('navigation', navigationHandler);
        this.eventListeners.set('button', buttonHandler);
        this.eventListeners.set('escape', escapeHandler);
    }
    
    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        if (!this.ui.container || !this.config.keyboardNavigation) return;
        
        const navItems = this.ui.container.querySelectorAll('.nav-item');
        navItems.forEach((item, index) => {
            item.addEventListener('keydown', (event) => {
                if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    const nextIndex = (index + 1) % navItems.length;
                    navItems[nextIndex].focus();
                } else if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    const prevIndex = (index - 1 + navItems.length) % navItems.length;
                    navItems[prevIndex].focus();
                } else if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    item.click();
                }
            });
        });
    }
    
    /**
     * Show specific category using settings panel
     */
    showCategory(categoryId) {
        try {
            this.settingsPanel.showCategory(categoryId);
            this.ui.currentCategory = categoryId;
            this.stats.categoriesVisited.add(categoryId);
            
            console.log(`AccessibilitySettingsUI: Switched to category: ${categoryId}`);
        } catch (error) {
            console.error('AccessibilitySettingsUI: Show category failed:', error);
        }
    }
    
    /**
     * Handle setting change with validation and persistence
     */
    async handleSettingChange(event) {
        try {
            const settingItem = event.target.closest('[data-setting]');
            if (!settingItem) return;
            
            const settingId = settingItem.dataset.setting;
            let value;
            
            // Get value based on input type
            if (event.target.type === 'range') {
                value = parseFloat(event.target.value);
            } else if (event.target.type === 'checkbox') {
                value = event.target.checked;
            } else {
                value = event.target.value;
            }
            
            // Validate setting value
            const validationResult = this.settingsValidator.validateSetting(settingId, value);
            if (!validationResult.valid) {
                console.warn(`Setting validation failed: ${validationResult.error}`);
                this.settingsPanel.showNotification(`設定エラー: ${validationResult.error}`, 'error');
                return;
            }
            
            // Save setting using preferences manager
            this.preferencesManager.setSetting(settingId, value);
            this.stats.settingsChanged++;
            
            // Update UI preview if enabled
            if (this.config.realTimePreview) {
                this.settingsPanel.updatePreview(settingId, value);
            }
            
            // Emit change event
            this.accessibilityManager?.eventSystem?.emit('settingChanged', {
                settingId,
                value,
                timestamp: Date.now()
            });
            
            console.log(`AccessibilitySettingsUI: Setting changed: ${settingId} = ${value}`);
            
        } catch (error) {
            console.error('AccessibilitySettingsUI: Handle setting change failed:', error);
        }
    }
    
    /**
     * Reset settings to defaults
     */
    async resetSettings() {
        try {
            if (!confirm('すべての設定をデフォルトに戻しますか？')) {
                return;
            }
            
            this.preferencesManager.resetToDefaults();
            await this.preferencesManager.saveSettings();
            
            // Update all UI inputs
            const allSettings = this.preferencesManager.getAllSettings();
            Object.entries(allSettings).forEach(([settingId, value]) => {
                this.settingsPanel.updateSettingInput(settingId, value);
                if (this.config.realTimePreview) {
                    this.settingsPanel.updatePreview(settingId, value);
                }
            });
            
            this.settingsPanel.showNotification('設定をリセットしました');
            console.log('AccessibilitySettingsUI: Settings reset to defaults');
            
        } catch (error) {
            console.error('AccessibilitySettingsUI: Reset settings failed:', error);
            this.settingsPanel.showNotification('設定のリセットに失敗しました', 'error');
        }
    }
    
    /**
     * Export settings using preferences manager
     */
    async exportSettings() {
        try {
            await this.preferencesManager.exportSettings('json', true);
            this.settingsPanel.showNotification('設定をエクスポートしました');
            console.log('AccessibilitySettingsUI: Settings exported');
            
        } catch (error) {
            console.error('AccessibilitySettingsUI: Export settings failed:', error);
            this.settingsPanel.showNotification('設定のエクスポートに失敗しました', 'error');
        }
    }
    
    /**
     * Import settings using preferences manager
     */
    async importSettings() {
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.addEventListener('change', async (event) => {
                const file = event.target.files[0];
                if (!file) return;
                
                try {
                    const success = await this.preferencesManager.importSettings(file, { includeProfiles: true });
                    if (success) {
                        // Update UI with imported settings
                        const allSettings = this.preferencesManager.getAllSettings();
                        Object.entries(allSettings).forEach(([settingId, value]) => {
                            this.settingsPanel.updateSettingInput(settingId, value);
                            if (this.config.realTimePreview) {
                                this.settingsPanel.updatePreview(settingId, value);
                            }
                        });
                        
                        this.settingsPanel.showNotification('設定をインポートしました');
                        console.log('AccessibilitySettingsUI: Settings imported');
                    }
                } catch (error) {
                    console.error('AccessibilitySettingsUI: Import failed:', error);
                    this.settingsPanel.showNotification('設定のインポートに失敗しました', 'error');
                }
            });
            
            input.click();
            
        } catch (error) {
            console.error('AccessibilitySettingsUI: Import settings failed:', error);
            this.settingsPanel.showNotification('設定のインポートに失敗しました', 'error');
        }
    }
    
    /**
     * Apply current settings to accessibility manager
     */
    async applySettings() {
        try {
            const allSettings = this.preferencesManager.getAllSettings();
            
            // Validate all settings before applying
            const validationResult = this.settingsValidator.validateSettings(allSettings);
            if (!validationResult.valid) {
                console.warn('Settings validation failed:', validationResult.errors);
                this.settingsPanel.showNotification('一部の設定に問題があります', 'error');
                return;
            }
            
            // Apply to accessibility manager
            if (this.accessibilityManager) {
                this.accessibilityManager.applySettings(allSettings);
            }
            
            // Save settings
            await this.preferencesManager.saveSettings();
            
            this.settingsPanel.showNotification('設定が適用されました');
            console.log('AccessibilitySettingsUI: Settings applied:', allSettings);
            
        } catch (error) {
            console.error('AccessibilitySettingsUI: Apply settings failed:', error);
            this.settingsPanel.showNotification('設定の適用に失敗しました', 'error');
        }
    }
    
    // Public API methods
    
    /**
     * Open settings panel
     */
    open() {
        try {
            if (!this.ui.container.parentElement) {
                document.body.appendChild(this.ui.container);
            }
            
            this.ui.container.style.display = 'flex';
            
            // Focus first navigation item
            const firstNavItem = this.ui.container.querySelector('.nav-item');
            if (firstNavItem) {
                firstNavItem.focus();
            }
            
            console.log('AccessibilitySettingsUI: Panel opened');
        } catch (error) {
            console.error('AccessibilitySettingsUI: Open failed:', error);
        }
    }
    
    /**
     * Close settings panel
     */
    close() {
        try {
            if (this.ui.container) {
                this.ui.container.style.display = 'none';
            }
            console.log('AccessibilitySettingsUI: Panel closed');
        } catch (error) {
            console.error('AccessibilitySettingsUI: Close failed:', error);
        }
    }
    
    /**
     * Open specific category
     */
    openCategory(categoryId) {
        this.open();
        this.showCategory(categoryId);
    }
    
    /**
     * Get setting value
     */
    getSetting(settingId) {
        return this.preferencesManager.getSetting(settingId);
    }
    
    /**
     * Set setting value
     */
    setSetting(settingId, value) {
        try {
            // Validate setting
            const validationResult = this.settingsValidator.validateSetting(settingId, value);
            if (!validationResult.valid) {
                console.warn(`Setting validation failed: ${validationResult.error}`);
                return false;
            }
            
            // Set value
            this.preferencesManager.setSetting(settingId, value);
            
            // Update UI
            this.settingsPanel.updateSettingInput(settingId, value);
            if (this.config.realTimePreview) {
                this.settingsPanel.updatePreview(settingId, value);
            }
            
            return true;
        } catch (error) {
            console.error('AccessibilitySettingsUI: Set setting failed:', error);
            return false;
        }
    }
    
    /**
     * Get all settings
     */
    getAllSettings() {
        return this.preferencesManager.getAllSettings();
    }
    
    /**
     * Get statistics
     */
    getStats() {
        return {
            ui: {
                ...this.stats,
                categoriesVisited: Array.from(this.stats.categoriesVisited)
            },
            validation: this.settingsValidator.getValidationStats(),
            preferences: this.preferencesManager.getOperationStats()
        };
    }
    
    /**
     * Apply configuration to sub-components
     */
    applyConfig(config) {
        if (config.settingsUI) {
            Object.assign(this.config, config.settingsUI);
            
            // Update sub-component configurations
            this.settingsPanel.updateConfig({
                showAdvancedSettings: this.config.showAdvancedSettings,
                showTooltips: this.config.showTooltips,
                animateChanges: this.config.animateChanges
            });
            
            this.settingsValidator.updateConfig({
                validateOnChange: this.config.saveOnChange
            });
            
            this.preferencesManager.updateConfig({
                autoSave: this.config.saveOnChange
            });
        }
        
        console.log('AccessibilitySettingsUI: Configuration applied');
    }
    
    /**
     * Set enabled state
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
        console.log(`AccessibilitySettingsUI: ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Destroy and cleanup
     */
    destroy() {
        console.log('AccessibilitySettingsUI: Destroying...');
        
        try {
            // Remove event listeners
            this.eventListeners.forEach((handler, eventType) => {
                if (eventType === 'escape') {
                    document.removeEventListener('keydown', handler);
                } else if (this.ui.container) {
                    this.ui.container.removeEventListener(eventType, handler);
                }
            });
            this.eventListeners.clear();
            
            // Destroy sub-components
            if (this.settingsPanel) {
                this.settingsPanel.destroy();
            }
            if (this.settingsValidator) {
                this.settingsValidator.destroy();
            }
            if (this.preferencesManager) {
                this.preferencesManager.destroy();
            }
            
            // Clear references
            this.ui.container = null;
            this.settingsPanel = null;
            this.settingsValidator = null;
            this.preferencesManager = null;
            
            console.log('AccessibilitySettingsUI: Destroyed successfully');
            
        } catch (error) {
            console.error('AccessibilitySettingsUI: Destroy failed:', error);
        }
    }
}