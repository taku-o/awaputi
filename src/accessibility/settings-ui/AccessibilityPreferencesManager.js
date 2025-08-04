/**
 * AccessibilityPreferencesManager - Settings persistence and preference management
 * Handles storage, synchronization, import/export, and profile management
 */
export class AccessibilityPreferencesManager {
    constructor(config = {}) {
        this.config = {
            storageKey: 'accessibilitySettings',
            autoSave: true,
            saveInterval: 30000, // 30 seconds
            enableProfiles: true,
            enableSync: false,
            enableExport: true,
            enableImport: true,
            maxProfiles: 10,
            compressionEnabled: false,
            encryptionEnabled: false,
            ...config
        };

        // Settings state management
        this.currentSettings = new Map();
        this.defaultSettings = new Map();
        this.modifiedSettings = new Set();
        this.settingsHistory = [];
        this.maxHistoryLength = 50;

        // Profile management
        this.profiles = new Map();
        this.currentProfile = 'default';
        this.profileMetadata = new Map();

        // Storage and synchronization
        this.storage = this.getStorageProvider();
        this.syncService = null;
        this.autoSaveTimer = null;
        this.lastSaveTime = null;

        // Import/Export functionality
        this.exportFormats = ['json', 'csv', 'xml'];
        this.importValidators = new Map();

        // Performance and statistics
        this.operationMetrics = {
            saveOperations: 0,
            loadOperations: 0,
            exportOperations: 0,
            importOperations: 0,
            averageSaveTime: 0,
            averageLoadTime: 0,
            operationTimes: []
        };

        this.initialized = false;
    }

    /**
     * Initialize preferences manager
     */
    async initialize() {
        if (this.initialized) return true;

        console.log('AccessibilityPreferencesManager: Initializing...');
        
        try {
            // Setup default settings
            this.setupDefaultSettings();

            // Setup storage provider
            await this.initializeStorage();

            // Load existing settings
            await this.loadSettings();

            // Setup profiles if enabled
            if (this.config.enableProfiles) {
                await this.loadProfiles();
            }

            // Setup auto-save
            if (this.config.autoSave) {
                this.startAutoSave();
            }

            // Setup import validators
            this.setupImportValidators();

            this.initialized = true;
            console.log('AccessibilityPreferencesManager: Initialized successfully');
            return true;

        } catch (error) {
            console.error('AccessibilityPreferencesManager: Initialization error:', error);
            return false;
        }
    }

    /**
     * Setup default settings values
     */
    setupDefaultSettings() {
        const defaults = {
            // Visual settings
            textScaling: 1.0,
            colorContrast: 'normal',
            colorBlindnessSupport: 'none',
            motionReduction: 'none',
            focusIndicators: true,
            visualFeedback: 'standard',

            // Audio settings
            'soundSettings.masterVolume': 70,
            'soundSettings.soundEffects': true,
            'soundSettings.backgroundMusic': true,
            'captionSettings.showCaptions': false,
            'captionSettings.captionSize': 1.0,
            'captionSettings.captionPosition': 'bottom',

            // Motor settings
            'keyboardSettings.keyboardNavigation': true,
            'keyboardSettings.stickyKeys': false,
            'keyboardSettings.keyRepeatDelay': 500,
            'alternativeInput.switchInput': false,
            'alternativeInput.eyeTracking': false,
            'alternativeInput.voiceControl': false,

            // Cognitive settings
            uiSimplification: 'none',
            contextualHelp: true,
            errorRecovery: 'standard',
            memoryAids: false,
            focusManagement: 'automatic'
        };

        // Set defaults
        Object.entries(defaults).forEach(([key, value]) => {
            this.defaultSettings.set(key, value);
            this.currentSettings.set(key, value);
        });
    }

    /**
     * Get appropriate storage provider
     */
    getStorageProvider() {
        if (typeof localStorage !== 'undefined') {
            return {
                get: (key) => localStorage.getItem(key),
                set: (key, value) => localStorage.setItem(key, value),
                remove: (key) => localStorage.removeItem(key),
                clear: () => localStorage.clear()
            };
        }
        
        // Fallback to memory storage
        const memoryStorage = new Map();
        return {
            get: (key) => memoryStorage.get(key) || null,
            set: (key, value) => memoryStorage.set(key, value),
            remove: (key) => memoryStorage.delete(key),
            clear: () => memoryStorage.clear()
        };
    }

    /**
     * Initialize storage provider
     */
    async initializeStorage() {
        try {
            // Test storage availability
            const testKey = `${this.config.storageKey}_test`;
            await this.storage.set(testKey, 'test');
            const testValue = await this.storage.get(testKey);
            await this.storage.remove(testKey);
            
            if (testValue !== 'test') {
                throw new Error('Storage provider not functioning correctly');
            }
            
            console.log('AccessibilityPreferencesManager: Storage initialized');
        } catch (error) {
            console.warn('AccessibilityPreferencesManager: Storage initialization failed:', error);
            throw error;
        }
    }

    /**
     * Load settings from storage
     */
    async loadSettings(profileName = 'default') {
        const loadStartTime = performance.now();
        
        try {
            const storageKey = `${this.config.storageKey}_${profileName}`;
            const savedData = await this.storage.get(storageKey);
            
            if (savedData) {
                const settingsData = JSON.parse(savedData);
                
                // Validate and load settings
                if (settingsData.settings && typeof settingsData.settings === 'object') {
                    Object.entries(settingsData.settings).forEach(([key, value]) => {
                        this.currentSettings.set(key, value);
                    });
                    
                    console.log(`AccessibilityPreferencesManager: Loaded settings for profile: ${profileName}`);
                }
                
                // Load metadata
                if (settingsData.metadata) {
                    this.profileMetadata.set(profileName, settingsData.metadata);
                }
            }
            
            this.recordOperationMetrics('load', performance.now() - loadStartTime);
            this.operationMetrics.loadOperations++;
            
            return true;
            
        } catch (error) {
            console.error('AccessibilityPreferencesManager: Load settings error:', error);
            this.recordOperationMetrics('load', performance.now() - loadStartTime);
            return false;
        }
    }

    /**
     * Save current settings to storage
     */
    async saveSettings(profileName = null) {
        if (!this.initialized) return false;
        
        const saveStartTime = performance.now();
        const targetProfile = profileName || this.currentProfile;
        
        try {
            const settingsData = {
                version: '1.0',
                timestamp: Date.now(),
                profile: targetProfile,
                settings: Object.fromEntries(this.currentSettings),
                metadata: {
                    modifiedSettings: Array.from(this.modifiedSettings),
                    saveCount: (this.profileMetadata.get(targetProfile)?.saveCount || 0) + 1,
                    lastModified: Date.now(),
                    settingsCount: this.currentSettings.size
                }
            };
            
            const storageKey = `${this.config.storageKey}_${targetProfile}`;
            await this.storage.set(storageKey, JSON.stringify(settingsData));
            
            // Update metadata
            this.profileMetadata.set(targetProfile, settingsData.metadata);
            
            // Add to history
            this.addToHistory('save', targetProfile, settingsData);
            
            this.lastSaveTime = Date.now();
            this.modifiedSettings.clear();
            
            this.recordOperationMetrics('save', performance.now() - saveStartTime);
            this.operationMetrics.saveOperations++;
            
            console.log(`AccessibilityPreferencesManager: Settings saved for profile: ${targetProfile}`);
            return true;
            
        } catch (error) {
            console.error('AccessibilityPreferencesManager: Save settings error:', error);
            this.recordOperationMetrics('save', performance.now() - saveStartTime);
            return false;
        }
    }

    /**
     * Load available profiles
     */
    async loadProfiles() {
        try {
            const profilesKey = `${this.config.storageKey}_profiles`;
            const profilesData = await this.storage.get(profilesKey);
            
            if (profilesData) {
                const profiles = JSON.parse(profilesData);
                
                Object.entries(profiles).forEach(([profileName, profileInfo]) => {
                    this.profiles.set(profileName, profileInfo);
                });
                
                console.log('AccessibilityPreferencesManager: Profiles loaded');
            }
            
            return true;
            
        } catch (error) {
            console.error('AccessibilityPreferencesManager: Load profiles error:', error);
            return false;
        }
    }

    /**
     * Save profiles list
     */
    async saveProfiles() {
        try {
            const profilesKey = `${this.config.storageKey}_profiles`;
            const profilesData = Object.fromEntries(this.profiles);
            
            await this.storage.set(profilesKey, JSON.stringify(profilesData));
            
            console.log('AccessibilityPreferencesManager: Profiles saved');
            return true;
            
        } catch (error) {
            console.error('AccessibilityPreferencesManager: Save profiles error:', error);
            return false;
        }
    }

    /**
     * Create new profile
     */
    async createProfile(profileName, description = '', basedOn = null) {
        if (this.profiles.has(profileName)) {
            throw new Error(`Profile '${profileName}' already exists`);
        }
        
        if (this.profiles.size >= this.config.maxProfiles) {
            throw new Error(`Maximum number of profiles (${this.config.maxProfiles}) reached`);
        }
        
        try {
            // Create profile info
            const profileInfo = {
                name: profileName,
                description,
                createdAt: Date.now(),
                lastUsed: Date.now(),
                basedOn
            };
            
            this.profiles.set(profileName, profileInfo);
            
            // Copy settings from base profile or current settings
            if (basedOn && this.profiles.has(basedOn)) {
                await this.loadSettings(basedOn);
            }
            
            // Save profile with current settings
            await this.saveSettings(profileName);
            await this.saveProfiles();
            
            console.log(`AccessibilityPreferencesManager: Profile created: ${profileName}`);
            return true;
            
        } catch (error) {
            console.error('AccessibilityPreferencesManager: Create profile error:', error);
            return false;
        }
    }

    /**
     * Switch to different profile
     */
    async switchProfile(profileName) {
        if (!this.profiles.has(profileName)) {
            throw new Error(`Profile '${profileName}' does not exist`);
        }
        
        try {
            // Save current profile
            await this.saveSettings(this.currentProfile);
            
            // Load new profile
            await this.loadSettings(profileName);
            
            // Update current profile
            this.currentProfile = profileName;
            
            // Update profile metadata
            const profileInfo = this.profiles.get(profileName);
            profileInfo.lastUsed = Date.now();
            this.profiles.set(profileName, profileInfo);
            
            await this.saveProfiles();
            
            console.log(`AccessibilityPreferencesManager: Switched to profile: ${profileName}`);
            return true;
            
        } catch (error) {
            console.error('AccessibilityPreferencesManager: Switch profile error:', error);
            return false;
        }
    }

    /**
     * Export settings to file
     */
    async exportSettings(format = 'json', includeProfiles = false) {
        const exportStartTime = performance.now();
        
        try {
            const exportData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                settings: Object.fromEntries(this.currentSettings),
                metadata: {
                    currentProfile: this.currentProfile,
                    exportFormat: format,
                    settingsCount: this.currentSettings.size
                }
            };
            
            if (includeProfiles) {
                exportData.profiles = Object.fromEntries(this.profiles);
            }
            
            let exportContent;
            let mimeType;
            let fileExtension;
            
            switch (format) {
                case 'json':
                    exportContent = JSON.stringify(exportData, null, 2);
                    mimeType = 'application/json';
                    fileExtension = 'json';
                    break;
                    
                case 'csv':
                    exportContent = this.convertToCSV(exportData.settings);
                    mimeType = 'text/csv';
                    fileExtension = 'csv';
                    break;
                    
                case 'xml':
                    exportContent = this.convertToXML(exportData);
                    mimeType = 'application/xml';
                    fileExtension = 'xml';
                    break;
                    
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }
            
            // Create and trigger download
            const blob = new Blob([exportContent], { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `accessibility-settings-${new Date().toISOString().split('T')[0]}.${fileExtension}`;
            link.click();
            
            URL.revokeObjectURL(url);
            
            this.recordOperationMetrics('export', performance.now() - exportStartTime);
            this.operationMetrics.exportOperations++;
            
            console.log(`AccessibilityPreferencesManager: Settings exported as ${format}`);
            return true;
            
        } catch (error) {
            console.error('AccessibilityPreferencesManager: Export settings error:', error);
            this.recordOperationMetrics('export', performance.now() - exportStartTime);
            return false;
        }
    }

    /**
     * Import settings from file
     */
    async importSettings(file, options = {}) {
        const importStartTime = performance.now();
        
        try {
            const fileContent = await this.readFile(file);
            const format = this.detectFileFormat(file.name, fileContent);
            
            let importData;
            
            switch (format) {
                case 'json':
                    importData = JSON.parse(fileContent);
                    break;
                    
                case 'csv':
                    importData = this.convertFromCSV(fileContent);
                    break;
                    
                case 'xml':
                    importData = this.convertFromXML(fileContent);
                    break;
                    
                default:
                    throw new Error(`Unsupported import format: ${format}`);
            }
            
            // Validate import data
            const validationResult = await this.validateImportData(importData);
            if (!validationResult.valid) {
                throw new Error(`Import validation failed: ${validationResult.error}`);
            }
            
            // Apply imported settings
            if (importData.settings) {
                Object.entries(importData.settings).forEach(([key, value]) => {
                    if (this.defaultSettings.has(key)) {
                        this.currentSettings.set(key, value);
                        this.modifiedSettings.add(key);
                    }
                });
            }
            
            // Import profiles if included
            if (importData.profiles && options.includeProfiles) {
                Object.entries(importData.profiles).forEach(([profileName, profileInfo]) => {
                    if (!this.profiles.has(profileName)) {
                        this.profiles.set(profileName, profileInfo);
                    }
                });
                await this.saveProfiles();
            }
            
            // Save imported settings
            await this.saveSettings();
            
            this.addToHistory('import', format, importData);
            
            this.recordOperationMetrics('import', performance.now() - importStartTime);
            this.operationMetrics.importOperations++;
            
            console.log(`AccessibilityPreferencesManager: Settings imported from ${format}`);
            return true;
            
        } catch (error) {
            console.error('AccessibilityPreferencesManager: Import settings error:', error);
            this.recordOperationMetrics('import', performance.now() - importStartTime);
            return false;
        }
    }

    /**
     * Get current setting value
     */
    getSetting(key) {
        return this.currentSettings.get(key);
    }

    /**
     * Set setting value
     */
    setSetting(key, value) {
        if (!this.defaultSettings.has(key)) {
            console.warn(`AccessibilityPreferencesManager: Unknown setting key: ${key}`);
        }
        
        const oldValue = this.currentSettings.get(key);
        if (oldValue !== value) {
            this.currentSettings.set(key, value);
            this.modifiedSettings.add(key);
            
            // Auto-save if enabled
            if (this.config.autoSave) {
                this.scheduleAutoSave();
            }
        }
    }

    /**
     * Get all current settings
     */
    getAllSettings() {
        return Object.fromEntries(this.currentSettings);
    }

    /**
     * Reset settings to defaults
     */
    resetToDefaults() {
        this.currentSettings.clear();
        this.defaultSettings.forEach((value, key) => {
            this.currentSettings.set(key, value);
            this.modifiedSettings.add(key);
        });
        
        this.addToHistory('reset', 'defaults', null);
    }

    // Helper methods (simplified for MCP compatibility)

    convertToCSV(settings) {
        const header = 'Setting,Value\n';
        const rows = Object.entries(settings).map(([key, value]) => `${key},${value}`).join('\n');
        return header + rows;
    }

    convertFromCSV(csvContent) {
        const lines = csvContent.split('\n').slice(1); // Skip header
        const settings = {};
        lines.forEach(line => {
            const [key, value] = line.split(',');
            if (key && value !== undefined) {
                settings[key] = value;
            }
        });
        return { settings };
    }

    convertToXML(data) {
        return `<?xml version="1.0"?><settings>${JSON.stringify(data)}</settings>`;
    }

    convertFromXML(xmlContent) {
        // Simplified XML parsing
        const jsonMatch = xmlContent.match(/<settings>(.*?)<\/settings>/);
        return jsonMatch ? JSON.parse(jsonMatch[1]) : {};
    }

    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    detectFileFormat(filename, content) {
        if (filename.endsWith('.json')) return 'json';
        if (filename.endsWith('.csv')) return 'csv';
        if (filename.endsWith('.xml')) return 'xml';
        return 'json'; // Default
    }

    setupImportValidators() {
        // Basic validation setup
        console.log('AccessibilityPreferencesManager: Import validators setup');
    }

    async validateImportData(data) {
        return { valid: true }; // Simplified validation
    }

    startAutoSave() {
        if (this.autoSaveTimer) return;
        
        this.autoSaveTimer = setInterval(() => {
            if (this.modifiedSettings.size > 0) {
                this.saveSettings();
            }
        }, this.config.saveInterval);
    }

    scheduleAutoSave() {
        // Debounced auto-save scheduling
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setTimeout(() => {
            this.saveSettings();
        }, 1000);
    }

    addToHistory(operation, target, data) {
        this.settingsHistory.push({
            operation,
            target,
            timestamp: Date.now(),
            settingsSnapshot: this.modifiedSettings.size
        });
        
        if (this.settingsHistory.length > this.maxHistoryLength) {
            this.settingsHistory = this.settingsHistory.slice(-this.maxHistoryLength);
        }
    }

    recordOperationMetrics(operation, operationTime) {
        this.operationMetrics.operationTimes.push(operationTime);
        if (this.operationMetrics.operationTimes.length > 100) {
            this.operationMetrics.operationTimes = this.operationMetrics.operationTimes.slice(-50);
        }
        
        if (operation === 'save') {
            const times = this.operationMetrics.operationTimes.filter((_, i) => i % 2 === 0);
            this.operationMetrics.averageSaveTime = times.reduce((a, b) => a + b, 0) / times.length;
        } else if (operation === 'load') {
            const times = this.operationMetrics.operationTimes.filter((_, i) => i % 2 === 1);
            this.operationMetrics.averageLoadTime = times.reduce((a, b) => a + b, 0) / times.length;
        }
    }

    /**
     * Get operation statistics
     */
    getOperationStats() {
        return {
            ...this.operationMetrics,
            profilesCount: this.profiles.size,
            currentProfile: this.currentProfile,
            modifiedSettings: this.modifiedSettings.size,
            historyLength: this.settingsHistory.length,
            lastSaveTime: this.lastSaveTime
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
        
        // Restart auto-save if interval changed
        if (newConfig.saveInterval || newConfig.autoSave !== undefined) {
            if (this.autoSaveTimer) {
                clearInterval(this.autoSaveTimer);
                this.autoSaveTimer = null;
            }
            if (this.config.autoSave) {
                this.startAutoSave();
            }
        }
        
        console.log('AccessibilityPreferencesManager: Configuration updated');
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        console.log('AccessibilityPreferencesManager: Destroying...');
        
        // Save current state
        if (this.initialized && this.modifiedSettings.size > 0) {
            this.saveSettings();
        }
        
        // Clear auto-save timer
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
        
        // Clear data structures
        this.currentSettings.clear();
        this.defaultSettings.clear();
        this.modifiedSettings.clear();
        this.profiles.clear();
        this.profileMetadata.clear();
        this.settingsHistory = [];
        
        this.initialized = false;
        console.log('AccessibilityPreferencesManager: Destroyed');
    }
}