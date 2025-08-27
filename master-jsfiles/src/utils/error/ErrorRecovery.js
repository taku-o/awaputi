/**
 * ErrorRecovery - Handles recovery strategies and fallback mechanisms
 * Part of the ErrorHandler split implementation
 */

export class ErrorRecovery {
    constructor(mainController) {
        this.mainController = mainController;
        
        // Recovery configuration
        this.maxRecoveryAttempts = 3;
        this.recoveryAttempts = new Map();
        
        // Recovery strategies
        this.recoveryStrategies = new Map();
        
        // Fallback state
        this.fallbackState = {
            audioDisabled: false,
            canvasDisabled: false,
            storageDisabled: false,
            reducedEffects: false,
            safeMode: false
        };
        
        // Fallback modes
        this.fallbackModes = new Map();
        
        // ログ制御用
        this.lastLoggedAudioDisableState = null;
        
        this.setupRecoveryStrategies();
        
        console.log('[ErrorRecovery] Error recovery component initialized');
    }
    
    /**
     * Setup recovery strategies for different error contexts
     */
    setupRecoveryStrategies() {
        // Canvas-related error recovery
        this.recoveryStrategies.set('CANVAS_ERROR', {
            attempts: 0,
            maxAttempts: 2,
            strategy: (error, context) => {
                console.warn('Canvas error detected, attempting recovery:', error.message);
                
                // Recreate canvas element
                const canvas = document.getElementById('gameCanvas');
                if (canvas) {
                    const parent = canvas.parentNode;
                    const newCanvas = document.createElement('canvas');
                    newCanvas.id = 'gameCanvas';
                    newCanvas.width = canvas.width;
                    newCanvas.height = canvas.height;
                    newCanvas.className = canvas.className;
                    
                    parent.replaceChild(newCanvas, canvas);
                    
                    return { success: true, message: 'Canvas recreated successfully' };
                }
                
                return { success: false, message: 'Canvas element not found' };
            },
            fallback: () => {
                this.mainController.reporter?.showFallbackUI();
                this.fallbackState.canvasDisabled = true;
            }
        });
        
        // Audio-related error recovery
        this.recoveryStrategies.set('AUDIO_ERROR', {
            attempts: 0,
            maxAttempts: 1,
            strategy: (error, context) => {
                console.warn('Audio error detected, disabling audio:', error.message);
                this.fallbackState.audioDisabled = true;
                this.disableAudioFeatures();
                return { success: true, message: 'Audio disabled gracefully' };
            },
            fallback: () => {
                this.fallbackState.audioDisabled = true;
                this.disableAudioFeatures();
            }
        });
        
        // Storage-related error recovery
        this.recoveryStrategies.set('STORAGE_ERROR', {
            attempts: 0,
            maxAttempts: 1,
            strategy: (error, context) => {
                console.warn('Storage error detected, using memory storage:', error.message);
                this.useMemoryStorage();
                return { success: true, message: 'Switched to memory storage' };
            },
            fallback: () => {
                this.fallbackState.storageDisabled = true;
                this.useMemoryStorage();
            }
        });
        
        // Memory-related error recovery
        this.recoveryStrategies.set('MEMORY_WARNING', {
            attempts: 0,
            maxAttempts: 1,
            strategy: (error, context) => {
                console.warn('Memory warning detected, reducing effects:', error.message);
                this.reduceEffects();
                this.performGarbageCollection();
                return { success: true, message: 'Effects reduced, garbage collection performed' };
            },
            fallback: () => {
                this.fallbackState.reducedEffects = true;
                this.enableSafeMode();
            }
        });
        
        // Performance-related error recovery
        this.recoveryStrategies.set('PERFORMANCE_WARNING', {
            attempts: 0,
            maxAttempts: 2,
            strategy: (error, context) => {
                console.warn('Performance warning detected, optimizing:', error.message);
                this.optimizePerformance();
                return { success: true, message: 'Performance optimized' };
            },
            fallback: () => {
                this.fallbackState.reducedEffects = true;
                this.enableSafeMode();
            }
        });
        
        // Network-related error recovery
        this.recoveryStrategies.set('NETWORK_ERROR', {
            attempts: 0,
            maxAttempts: 2,
            strategy: (error, context) => {
                console.warn('Network error detected, attempting recovery:', error.message);
                return this.attemptNetworkRecovery();
            },
            fallback: () => {
                this.enableOfflineMode();
            }
        });
        
        // WebGL-related error recovery
        this.recoveryStrategies.set('WEBGL_ERROR', {
            attempts: 0,
            maxAttempts: 1,
            strategy: (error, context) => {
                console.warn('WebGL error detected, falling back to 2D:', error.message);
                return this.fallbackTo2DRendering();
            },
            fallback: () => {
                this.fallbackState.canvasDisabled = true;
                this.enableSafeMode();
            }
        });
    }
    
    /**
     * Attempt recovery for an error
     * @param {object} errorInfo - Error information
     * @returns {boolean} Recovery success
     */
    attemptRecovery(errorInfo) {
        const strategy = this.recoveryStrategies.get(errorInfo.context);
        
        if (!strategy) {
            console.warn(`No recovery strategy for context: ${errorInfo.context}`);
            return false;
        }
        
        // Check maximum attempt limit
        if (strategy.attempts >= strategy.maxAttempts) {
            console.warn(`Max recovery attempts reached for ${errorInfo.context}, using fallback`);
            strategy.fallback();
            return false;
        }
        
        try {
            strategy.attempts++;
            const result = strategy.strategy(errorInfo, errorInfo.context);
            
            if (result.success) {
                console.log(`Recovery successful for ${errorInfo.context}: ${result.message}`);
                errorInfo.recovered = true;
                
                // Update recovery statistics
                if (this.mainController.logger) {
                    this.mainController.logger.errorStats.recovered++;
                }
                
                return true;
            } else {
                console.warn(`Recovery failed for ${errorInfo.context}: ${result.message}`);
                
                // Use fallback if max attempts reached
                if (strategy.attempts >= strategy.maxAttempts) {
                    strategy.fallback();
                }
                return false;
            }
        } catch (recoveryError) {
            console.error(`Recovery strategy failed for ${errorInfo.context}:`, recoveryError);
            strategy.fallback();
            return false;
        }
    }
    
    /**
     * Use memory storage as LocalStorage fallback
     */
    useMemoryStorage() {
        // Implement memory storage as LocalStorage replacement
        if (typeof window !== 'undefined') {
            window.memoryStorage = new Map();
            
            // Mock LocalStorage API
            const memoryStorageAPI = {
                getItem: (key) => window.memoryStorage.get(key) || null,
                setItem: (key, value) => window.memoryStorage.set(key, value),
                removeItem: (key) => window.memoryStorage.delete(key),
                clear: () => window.memoryStorage.clear(),
                get length() { return window.memoryStorage.size; },
                key: (index) => Array.from(window.memoryStorage.keys())[index] || null
            };
            
            // Make it globally available
            window.fallbackStorage = memoryStorageAPI;
            
            console.log('Memory storage enabled as LocalStorage fallback');
        }
    }
    
    /**
     * Reduce effects for performance optimization
     */
    reduceEffects() {
        // Reduce performance-intensive effects
        if (typeof window !== 'undefined' && window.gameEngine) {
            // Reduce particle count
            if (window.gameEngine.particleManager) {
                window.gameEngine.particleManager.setMaxParticles(50);
            }
            
            // Lower effect quality
            if (window.gameEngine.effectManager) {
                window.gameEngine.effectManager.setQualityLevel('low');
            }
            
            // Reduce audio effects
            if (window.gameEngine.audioManager) {
                window.gameEngine.audioManager.setMaxConcurrentSounds(5);
            }
        }
        
        this.fallbackState.reducedEffects = true;
        console.log('Effects reduced for performance optimization');
    }
    
    /**
     * Perform garbage collection
     */
    performGarbageCollection() {
        // Manual memory cleanup
        if (typeof window !== 'undefined' && window.gameEngine) {
            // Clear object pools
            if (window.gameEngine.poolManager) {
                window.gameEngine.poolManager.clearUnused();
            }
            
            // Remove unused listeners
            if (window.gameEngine.memoryManager) {
                window.gameEngine.memoryManager.performCleanup();
            }
        }
        
        // Force browser GC if available
        if (typeof window !== 'undefined' && window.gc && typeof window.gc === 'function') {
            window.gc();
        }
        
        console.log('Garbage collection performed');
    }
    
    /**
     * Optimize performance settings
     */
    optimizePerformance() {
        if (typeof window !== 'undefined' && window.gameEngine && window.gameEngine.performanceOptimizer) {
            // Lower performance level
            window.gameEngine.performanceOptimizer.setPerformanceLevel('low');
            
            // Limit frame rate
            window.gameEngine.performanceOptimizer.setTargetFPS(30);
            
            // Reduce rendering quality
            window.gameEngine.performanceOptimizer.setRenderQuality('low');
        }
        
        this.reduceEffects();
        this.performGarbageCollection();
        
        console.log('Performance optimized');
    }
    
    /**
     * Disable audio features
     */
    disableAudioFeatures() {
        if (typeof window !== 'undefined' && window.gameEngine && window.gameEngine.audioManager) {
            window.gameEngine.audioManager.disable();
            // ログ出力頻度を制御（前回と異なる状態の場合のみ）
            if (this.lastLoggedAudioDisableState !== true) {
                console.log('Audio features disabled');
                this.lastLoggedAudioDisableState = true;
            }
        }
    }
    
    /**
     * Attempt network recovery
     * @returns {object} Recovery result
     */
    attemptNetworkRecovery() {
        return new Promise((resolve) => {
            // Test network connectivity
            const testImage = new Image();
            testImage.onload = () => {
                resolve({ success: true, message: 'Network connectivity restored' });
            };
            testImage.onerror = () => {
                resolve({ success: false, message: 'Network still unavailable' });
            };
            testImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            
            // Timeout after 5 seconds
            setTimeout(() => {
                resolve({ success: false, message: 'Network test timeout' });
            }, 5000);
        });
    }
    
    /**
     * Enable offline mode
     */
    enableOfflineMode() {
        console.log('Offline mode enabled');
        
        // Disable network-dependent features
        if (typeof window !== 'undefined' && window.gameEngine) {
            if (window.gameEngine.networkManager) {
                window.gameEngine.networkManager.disable();
            }
            
            if (window.gameEngine.leaderboardManager) {
                window.gameEngine.leaderboardManager.enableOfflineMode();
            }
        }
    }
    
    /**
     * Fallback to 2D rendering
     * @returns {object} Recovery result
     */
    fallbackTo2DRendering() {
        try {
            if (typeof window !== 'undefined' && window.gameEngine) {
                if (window.gameEngine.renderer) {
                    window.gameEngine.renderer.fallbackTo2D();
                    return { success: true, message: 'Switched to 2D rendering' };
                }
            }
            return { success: false, message: 'No renderer available' };
        } catch (error) {
            return { success: false, message: `2D fallback failed: ${error.message}` };
        }
    }
    
    /**
     * Enable safe mode
     */
    enableSafeMode() {
        this.fallbackState.safeMode = true;
        this.fallbackState.reducedEffects = true;
        
        // Browser environment only
        if (this.mainController.isBrowser && typeof window !== 'undefined' && window.gameEngine) {
            // Disable all effects
            if (window.gameEngine.effectManager) {
                window.gameEngine.effectManager.disable();
            }
            
            // Disable particles
            if (window.gameEngine.particleManager) {
                window.gameEngine.particleManager.disable();
            }
            
            // Disable audio
            if (window.gameEngine.audioManager) {
                window.gameEngine.audioManager.disable();
            }
        }
        
        console.warn('Safe mode enabled - running with minimal features');
    }
    
    /**
     * Create custom recovery strategy
     * @param {string} context - Error context
     * @param {object} strategy - Strategy configuration
     */
    addRecoveryStrategy(context, strategy) {
        if (!strategy.strategy || typeof strategy.strategy !== 'function') {
            throw new Error('Recovery strategy must have a strategy function');
        }
        
        if (!strategy.fallback || typeof strategy.fallback !== 'function') {
            throw new Error('Recovery strategy must have a fallback function');
        }
        
        this.recoveryStrategies.set(context, {
            attempts: 0,
            maxAttempts: strategy.maxAttempts || 2,
            strategy: strategy.strategy,
            fallback: strategy.fallback
        });
        
        console.log(`Custom recovery strategy added for context: ${context}`);
    }
    
    /**
     * Remove recovery strategy
     * @param {string} context - Error context
     */
    removeRecoveryStrategy(context) {
        if (this.recoveryStrategies.delete(context)) {
            console.log(`Recovery strategy removed for context: ${context}`);
        }
    }
    
    /**
     * Reset recovery attempts for a context
     * @param {string} context - Error context
     */
    resetRecoveryAttempts(context) {
        const strategy = this.recoveryStrategies.get(context);
        if (strategy) {
            strategy.attempts = 0;
            console.log(`Recovery attempts reset for context: ${context}`);
        }
    }
    
    /**
     * Reset all recovery attempts
     */
    resetAllRecoveryAttempts() {
        for (const strategy of this.recoveryStrategies.values()) {
            strategy.attempts = 0;
        }
        console.log('All recovery attempts reset');
    }
    
    /**
     * Get fallback state
     * @returns {object} Current fallback state
     */
    getFallbackState() {
        return { ...this.fallbackState };
    }
    
    /**
     * Check if in safe mode
     * @returns {boolean} Safe mode status
     */
    isInSafeMode() {
        return this.fallbackState.safeMode;
    }
    
    /**
     * Get recovery statistics
     * @returns {object} Recovery statistics
     */
    getRecoveryStats() {
        const stats = {
            strategies: this.recoveryStrategies.size,
            totalAttempts: 0,
            successfulRecoveries: this.mainController.logger?.errorStats.recovered || 0,
            fallbackState: this.getFallbackState(),
            strategiesByContext: {}
        };
        
        for (const [context, strategy] of this.recoveryStrategies) {
            stats.totalAttempts += strategy.attempts;
            stats.strategiesByContext[context] = {
                attempts: strategy.attempts,
                maxAttempts: strategy.maxAttempts,
                attemptsRemaining: strategy.maxAttempts - strategy.attempts
            };
        }
        
        return stats;
    }
    
    /**
     * Configure recovery settings
     * @param {object} config - Configuration options
     */
    configure(config) {
        if (config.maxRecoveryAttempts !== undefined) {
            this.maxRecoveryAttempts = Math.max(1, Math.min(10, config.maxRecoveryAttempts));
        }
        
        console.log('[ErrorRecovery] Configuration updated');
    }
    
    /**
     * Test recovery strategy
     * @param {string} context - Error context to test
     * @returns {object} Test result
     */
    testRecoveryStrategy(context) {
        const strategy = this.recoveryStrategies.get(context);
        if (!strategy) {
            return { success: false, message: `No strategy found for context: ${context}` };
        }
        
        try {
            const mockError = {
                context,
                message: `Test error for ${context}`,
                timestamp: new Date().toISOString()
            };
            
            const result = strategy.strategy(mockError, context);
            return { success: true, message: 'Strategy test completed', result };
        } catch (error) {
            return { success: false, message: `Strategy test failed: ${error.message}` };
        }
    }
    
    /**
     * Cleanup recovery resources
     */
    destroy() {
        this.recoveryStrategies.clear();
        this.recoveryAttempts.clear();
        this.fallbackModes.clear();
        console.log('[ErrorRecovery] Recovery system destroyed');
    }
}