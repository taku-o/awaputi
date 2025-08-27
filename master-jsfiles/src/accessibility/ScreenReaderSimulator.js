/**
 * ScreenReaderSimulator - Main Controller for screen reader simulation
 * Orchestrates screen reader engine, ARIA processing, and text-to-speech
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';
import { ScreenReaderEngine } from './screen-reader/ScreenReaderEngine.js';
import { ARIAAttributeProcessor } from './screen-reader/ARIAAttributeProcessor.js';
import { TextToSpeechController } from './screen-reader/TextToSpeechController.js';

export class ScreenReaderSimulator {
    constructor(accessibilityManager) {
        this.accessibilityManager = accessibilityManager;
        this.gameEngine = accessibilityManager?.gameEngine;
        
        // Configuration
        this.config = {
            enabled: true,
            defaultReader: 'nvda',
            simulateDelay: true,
            verbosityLevel: 'standard',
            speechRate: 250,
            enableTTS: true,
            enableAriaValidation: true
        };
        
        // Initialize sub-components
        this.screenReaderEngine = new ScreenReaderEngine({
            enabled: this.config.enabled,
            defaultReader: this.config.defaultReader,
            simulateDelay: this.config.simulateDelay,
            verbosityLevel: this.config.verbosityLevel
        });
        
        this.ariaProcessor = new ARIAAttributeProcessor({
            enabled: this.config.enableAriaValidation,
            validateStructure: true,
            monitorLiveRegions: true,
            trackChanges: true
        });
        
        this.ttsController = new TextToSpeechController({
            enabled: this.config.enableTTS,
            defaultRate: this.config.speechRate / 250, // Convert to rate multiplier
            queueAnnouncements: true,
            interruptOnNew: false
        });
        
        // Combined results and statistics
        this.results = {
            screenReader: null,
            aria: null,
            compatibility: new Map(),
            issues: [],
            announcements: []
        };
        
        this.stats = {
            totalSimulations: 0,
            totalAriaValidations: 0,
            totalAnnouncements: 0,
            averageSimulationTime: 0
        };
        
        // Performance tracking
        this.performance = {
            simulationTime: [],
            ariaValidationTime: [],
            speechTime: []
        };
        
        this.initialized = false;
    }
    
    /**
     * Initialize the simulator
     */
    initialize() {
        if (this.initialized) return;
        
        console.log('ScreenReaderSimulator: Initializing...');
        
        // Initialize sub-components
        const ttsSupported = this.ttsController.initialize();
        this.ariaProcessor.initialize();
        
        // Set up TTS event handlers
        this.ttsController.setEventHandlers({
            onStart: (announcement) => {
                console.log('TTS Started:', announcement.text.substring(0, 50) + '...');
            },
            onEnd: (announcement, duration) => {
                console.log(`TTS Completed in ${duration.toFixed(2)}ms`);
                this.performance.speechTime.push(duration);
            },
            onError: (event, announcement) => {
                console.error('TTS Error:', event.error);
            }
        });
        
        this.initialized = true;
        console.log(`ScreenReaderSimulator: Initialized (TTS: ${ttsSupported ? 'enabled' : 'disabled'})`);
    }
    
    /**
     * Run full screen reader simulation
     */
    async runFullSimulation(readerType = 'all') {
        const startTime = performance.now();
        console.log(`ScreenReaderSimulator: Starting full simulation for: ${readerType}`);
        
        try {
            // Run screen reader simulation
            const screenReaderResults = await this.screenReaderEngine.runFullSimulation(readerType);
            this.results.screenReader = screenReaderResults;
            
            // Run ARIA validation
            if (this.config.enableAriaValidation) {
                const ariaResults = await this.ariaProcessor.validateAriaAttributes();
                this.results.aria = ariaResults;
                this.stats.totalAriaValidations++;
            }
            
            // Process announcements through TTS
            if (this.config.enableTTS && this.results.screenReader) {
                await this.processAnnouncementsThroughTTS();
            }
            
            // Generate compatibility matrix
            this.generateCompatibilityMatrix();
            
            // Update statistics
            const endTime = performance.now();
            const simulationTime = endTime - startTime;
            this.performance.simulationTime.push(simulationTime);
            this.stats.totalSimulations++;
            this.updateStatistics();
            
            // Save results
            this.saveSimulationResults();
            
            console.log(`ScreenReaderSimulator: Full simulation completed in ${simulationTime.toFixed(2)}ms`);
            
            // Emit completion event
            this.notifySimulationComplete(simulationTime, readerType);
            
            return {
                simulationTime,
                results: this.results,
                stats: this.stats,
                performance: this.performance
            };
            
        } catch (error) {
            console.error('ScreenReaderSimulator: Simulation error:', error);
            getErrorHandler().handleError(error, 'SCREEN_READER_SIMULATION_ERROR', {
                operation: 'runFullSimulation',
                readerType
            });
            return null;
        }
    }
    
    /**
     * Run simulation for specific reader
     */
    async runReaderSimulation(readerType) {
        return await this.screenReaderEngine.runReaderSimulation(readerType);
    }
    
    /**
     * Validate ARIA attributes
     */
    async validateAriaAttributes() {
        return await this.ariaProcessor.validateAriaAttributes();
    }
    
    /**
     * Process announcements through TTS
     */
    async processAnnouncementsThroughTTS() {
        if (!this.results.screenReader?.results?.announcements) {
            return;
        }
        
        const announcements = this.results.screenReader.results.announcements;
        
        for (const announcement of announcements) {
            try {
                await this.ttsController.announce(announcement.announcement, {
                    priority: announcement.type === 'focus' ? 'high' : 'normal'
                });
                
                this.stats.totalAnnouncements++;
            } catch (error) {
                console.warn('ScreenReaderSimulator: TTS announcement failed:', error);
            }
        }
    }
    
    /**
     * Generate compatibility matrix
     */
    generateCompatibilityMatrix() {
        const matrix = new Map();
        
        if (this.results.screenReader?.results?.compatibility) {
            for (const [readerType, compatibility] of this.results.screenReader.results.compatibility) {
                matrix.set(readerType, {
                    ...compatibility,
                    ariaSupport: this.results.aria ? this.calculateAriaCompatibility() : 'unknown',
                    ttsSupport: this.ttsController.isSupported()
                });
            }
        }
        
        this.results.compatibility = matrix;
    }
    
    /**
     * Calculate ARIA compatibility score
     */
    calculateAriaCompatibility() {
        if (!this.results.aria) return 'unknown';
        
        const { passed, failed, warnings } = this.results.aria.results;
        const total = passed.length + failed.length + warnings.length;
        
        if (total === 0) return 'excellent';
        
        const score = passed.length / total;
        if (score >= 0.9) return 'excellent';
        if (score >= 0.8) return 'good';
        if (score >= 0.7) return 'fair';
        return 'poor';
    }
    
    /**
     * Update performance statistics
     */
    updateStatistics() {
        // Calculate average simulation time
        if (this.performance.simulationTime.length > 0) {
            this.stats.averageSimulationTime = 
                this.performance.simulationTime.reduce((a, b) => a + b, 0) / 
                this.performance.simulationTime.length;
        }
    }
    
    /**
     * Switch screen reader type
     */
    switchScreenReader(readerType) {
        return this.screenReaderEngine.switchScreenReader(readerType);
    }
    
    /**
     * Set speech rate
     */
    setSpeechRate(rate) {
        this.config.speechRate = rate;
        this.ttsController.setSpeechRate(rate / 250); // Convert to multiplier
    }
    
    /**
     * Set verbosity level
     */
    setVerbosityLevel(level) {
        if (['off', 'some', 'most', 'all'].includes(level)) {
            this.config.verbosityLevel = level;
            this.screenReaderEngine.updateConfig({ verbosityLevel: level });
        }
    }
    
    /**
     * Get simulation results
     */
    getSimulationResults() {
        return {
            results: this.results,
            stats: this.stats,
            performance: this.performance
        };
    }
    
    /**
     * Get compatibility report
     */
    getCompatibilityReport() {
        const report = {
            screenReaders: {},
            ariaCompliance: this.calculateAriaCompatibility(),
            ttsSupport: this.ttsController.isSupported(),
            overallScore: 0
        };
        
        // Process screen reader compatibility
        for (const [readerType, compatibility] of this.results.compatibility) {
            report.screenReaders[readerType] = compatibility;
        }
        
        // Calculate overall compatibility score
        const readerCount = Object.keys(report.screenReaders).length;
        if (readerCount > 0) {
            const compatibleReaders = Object.values(report.screenReaders)
                .filter(r => r.compatible).length;
            report.overallScore = (compatibleReaders / readerCount) * 100;
        }
        
        return report;
    }
    
    /**
     * Save simulation results
     */
    saveSimulationResults() {
        try {
            const results = {
                timestamp: Date.now(),
                results: this.results,
                stats: this.stats,
                performance: {
                    averageSimulationTime: this.stats.averageSimulationTime,
                    totalSimulations: this.stats.totalSimulations
                }
            };
            
            // Save to localStorage
            const history = JSON.parse(localStorage.getItem('screenReaderSimulator_history') || '[]');
            history.unshift(results);
            
            // Keep only last 50 results
            if (history.length > 50) {
                history.splice(50);
            }
            
            localStorage.setItem('screenReaderSimulator_history', JSON.stringify(history));
            
        } catch (error) {
            console.warn('ScreenReaderSimulator: Failed to save results:', error);
        }
    }
    
    /**
     * Load simulation history
     */
    loadSimulationHistory() {
        try {
            const history = localStorage.getItem('screenReaderSimulator_history');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.warn('ScreenReaderSimulator: Failed to load history:', error);
            return [];
        }
    }
    
    /**
     * Notify simulation completion
     */
    notifySimulationComplete(simulationTime, readerType) {
        if (this.accessibilityManager?.eventSystem) {
            this.accessibilityManager.eventSystem.emit('screenReaderSimulationCompleted', {
                simulationTime,
                readerType,
                results: this.results,
                stats: this.stats
            });
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for accessibility manager events
        if (this.accessibilityManager?.eventSystem) {
            this.accessibilityManager.eventSystem.on('accessibility-settings-changed', () => {
                this.applyConfig(this.accessibilityManager.getSettings());
            });
            
            this.accessibilityManager.eventSystem.on('screen-reader-test-requested', (readerType) => {
                this.runReaderSimulation(readerType);
            });
        }
    }
    
    /**
     * Apply configuration
     */
    applyConfig(config) {
        this.config = {
            ...this.config,
            ...config
        };
        
        // Update sub-components
        this.screenReaderEngine.updateConfig({
            enabled: this.config.enabled,
            defaultReader: this.config.defaultReader,
            simulateDelay: this.config.simulateDelay,
            verbosityLevel: this.config.verbosityLevel
        });
        
        this.ariaProcessor.updateConfig({
            enabled: this.config.enableAriaValidation
        });
        
        this.ttsController.updateConfig({
            enabled: this.config.enableTTS,
            defaultRate: this.config.speechRate / 250
        });
    }
    
    /**
     * Set enabled state
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
        this.applyConfig({ enabled });
    }
    
    /**
     * Test screen reader functionality
     */
    async testScreenReader(readerType = 'nvda') {
        try {
            // Test screen reader engine
            const engineTest = await this.screenReaderEngine.runReaderSimulation(readerType);
            
            // Test TTS
            const ttsTest = await this.ttsController.testSpeech('Screen reader test successful');
            
            // Test ARIA validation
            const ariaTest = await this.ariaProcessor.validateAriaAttributes();
            
            console.log('ScreenReaderSimulator: Test completed successfully');
            
            return {
                success: true,
                engine: !!engineTest,
                tts: ttsTest,
                aria: !!ariaTest
            };
            
        } catch (error) {
            console.error('ScreenReaderSimulator: Test failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Get component status
     */
    getComponentStatus() {
        return {
            engine: this.screenReaderEngine.isEnabled(),
            aria: this.ariaProcessor.config.enabled,
            tts: this.ttsController.isSupported() && this.ttsController.config.enabled,
            initialized: this.initialized
        };
    }
    
    /**
     * Destroy and cleanup
     */
    destroy() {
        console.log('ScreenReaderSimulator: Destroying...');
        
        // Stop any ongoing operations
        this.ttsController.stopSpeech();
        
        // Save final results
        this.saveSimulationResults();
        
        // Cleanup sub-components
        this.screenReaderEngine.destroy();
        this.ariaProcessor.destroy();
        this.ttsController.destroy();
        
        // Clear data
        this.results = {
            screenReader: null,
            aria: null,
            compatibility: new Map(),
            issues: [],
            announcements: []
        };
        
        this.initialized = false;
        console.log('ScreenReaderSimulator: Destroyed');
    }
}