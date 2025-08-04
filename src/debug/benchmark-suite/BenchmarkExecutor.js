/**
 * BenchmarkExecutor - Benchmark execution component
 * Handles benchmark timing, resource management and environment setup
 */

import { getErrorHandler } from '../../core/ErrorHandler.js';

export class BenchmarkExecutor {
    constructor(benchmarkSuite) {
        this.benchmarkSuite = benchmarkSuite;
        this.errorHandler = getErrorHandler();
        
        // Execution configuration
        this.executionConfig = {
            defaultTimeout: 60000, // 1分
            maxConcurrentBenchmarks: 1,
            retryAttempts: 2,
            warmupIterations: 3
        };
        
        // Execution state
        this.isExecuting = false;
        this.currentExecution = null;
        this.executionQueue = [];
        this.executionHistory = [];
        
        console.log('[BenchmarkExecutor] Benchmark execution component initialized');
    }
    
    /**
     * Execute single benchmark with resource management
     * @param {string} name - Benchmark name
     * @param {object} benchmark - Benchmark configuration
     * @param {object} options - Execution options
     * @returns {object} Execution result
     */
    async executeBenchmark(name, benchmark, options = {}) {
        if (!benchmark || !benchmark.test) {
            throw new Error(`Invalid benchmark configuration for ${name}`);
        }
        
        const executionSession = {
            name,
            benchmark,
            options,
            startTime: performance.now(),
            sessionId: Date.now(),
            attempts: 0,
            maxAttempts: options.retryAttempts || this.executionConfig.retryAttempts
        };
        
        this.currentExecution = executionSession;
        
        try {
            console.log(`[BenchmarkExecutor] Executing benchmark: ${benchmark.name}`);
            
            // Setup benchmark environment
            await this.setupBenchmarkEnvironment(executionSession);
            
            // Run warmup if configured
            if (options.warmup !== false) {
                await this.runWarmup(executionSession);
            }
            
            // Execute benchmark with retry logic
            const result = await this.executeWithRetry(executionSession);
            
            // Measure performance entries
            const performanceEntries = this.collectPerformanceEntries(name);
            
            const finalResult = {
                ...result,
                benchmark: benchmark,
                timestamp: Date.now(),
                executionTime: performance.now() - executionSession.startTime,
                sessionId: executionSession.sessionId,
                attempts: executionSession.attempts,
                performanceEntries: performanceEntries,
                success: result.success !== false
            };
            
            // Store execution history
            this.executionHistory.push({
                name,
                timestamp: Date.now(),
                success: finalResult.success,
                executionTime: finalResult.executionTime,
                attempts: executionSession.attempts
            });
            
            return finalResult;
            
        } catch (error) {
            this.errorHandler.handleError(error, {
                context: 'BenchmarkExecutor.executeBenchmark',
                benchmarkName: name
            });
            
            return {
                success: false,
                error: {
                    message: error.message,
                    stack: error.stack
                },
                benchmark: benchmark,
                timestamp: Date.now(),
                sessionId: executionSession.sessionId,
                attempts: executionSession.attempts
            };
        } finally {
            // Cleanup benchmark environment
            await this.cleanupBenchmarkEnvironment(executionSession);
            this.currentExecution = null;
        }
    }
    
    /**
     * Setup benchmark execution environment
     * @param {object} executionSession - Execution session
     */
    async setupBenchmarkEnvironment(executionSession) {
        const { name, benchmark, options } = executionSession;
        
        try {
            // Clear performance timeline
            if (performance.clearMarks) {
                performance.clearMarks();
            }
            if (performance.clearMeasures) {
                performance.clearMeasures();
            }
            
            // Setup performance markers
            performance.mark(`benchmark-${name}-setup-start`);
            
            // Configure execution environment based on benchmark category
            if (benchmark.category === 'memory') {
                // Force garbage collection if available
                if (window.gc) {
                    window.gc();
                }
            }
            
            if (benchmark.category === 'rendering') {
                // Ensure canvas context is available
                const canvas = this.benchmarkSuite.gameEngine?.canvas;
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }
                }
            }
            
            if (benchmark.category === 'audio') {
                // Ensure audio context is ready
                const audioManager = this.benchmarkSuite.gameEngine?.audioManager;
                if (audioManager && audioManager.initialize) {
                    await audioManager.initialize();
                }
            }
            
            // Setup environment-specific configurations
            if (options.environmentSetup) {
                await options.environmentSetup();
            }
            
            performance.mark(`benchmark-${name}-setup-end`);
            performance.measure(`benchmark-${name}-setup`, 
                `benchmark-${name}-setup-start`, `benchmark-${name}-setup-end`);
                
            console.log(`[BenchmarkExecutor] Environment setup completed for ${name}`);
            
        } catch (error) {
            console.warn(`[BenchmarkExecutor] Environment setup failed for ${name}:`, error);
            throw error;
        }
    }
    
    /**
     * Run warmup iterations before actual benchmark
     * @param {object} executionSession - Execution session
     */
    async runWarmup(executionSession) {
        const { name, benchmark, options } = executionSession;
        const warmupIterations = options.warmupIterations || this.executionConfig.warmupIterations;
        
        if (warmupIterations <= 0) return;
        
        try {
            console.log(`[BenchmarkExecutor] Running ${warmupIterations} warmup iterations for ${name}`);
            
            for (let i = 0; i < warmupIterations; i++) {
                performance.mark(`benchmark-${name}-warmup-${i}-start`);
                
                // Run a simplified version of the benchmark for warmup
                try {
                    await benchmark.test({ ...options, warmup: true, iteration: i });
                } catch (error) {
                    // Warmup failures are not critical
                    console.warn(`[BenchmarkExecutor] Warmup iteration ${i} failed for ${name}:`, error);
                }
                
                performance.mark(`benchmark-${name}-warmup-${i}-end`);
                performance.measure(`benchmark-${name}-warmup-${i}`, 
                    `benchmark-${name}-warmup-${i}-start`, `benchmark-${name}-warmup-${i}-end`);
                
                // Short delay between warmup iterations
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            
            console.log(`[BenchmarkExecutor] Warmup completed for ${name}`);
            
        } catch (error) {
            console.warn(`[BenchmarkExecutor] Warmup failed for ${name}:`, error);
            // Warmup failure is not critical, continue with benchmark
        }
    }
    
    /**
     * Execute benchmark with retry logic
     * @param {object} executionSession - Execution session
     * @returns {object} Execution result
     */
    async executeWithRetry(executionSession) {
        const { name, benchmark, options } = executionSession;
        let lastError = null;
        
        for (let attempt = 1; attempt <= executionSession.maxAttempts; attempt++) {
            executionSession.attempts = attempt;
            
            try {
                console.log(`[BenchmarkExecutor] Attempt ${attempt}/${executionSession.maxAttempts} for ${name}`);
                
                // Set timeout for benchmark execution
                const timeout = options.timeout || this.executionConfig.defaultTimeout;
                const benchmarkPromise = this.executeBenchmarkWithTimeout(name, benchmark, options, timeout);
                
                const result = await benchmarkPromise;
                
                // Validate result
                if (this.validateBenchmarkResult(result)) {
                    console.log(`[BenchmarkExecutor] Benchmark ${name} completed successfully on attempt ${attempt}`);
                    return result;
                } else {
                    throw new Error('Invalid benchmark result format');
                }
                
            } catch (error) {
                lastError = error;
                console.warn(`[BenchmarkExecutor] Attempt ${attempt} failed for ${name}:`, error.message);
                
                // Wait before retry (exponential backoff)
                if (attempt < executionSession.maxAttempts) {
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                    console.log(`[BenchmarkExecutor] Retrying ${name} in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        // All attempts failed
        throw new Error(`Benchmark ${name} failed after ${executionSession.maxAttempts} attempts: ${lastError?.message}`);
    }
    
    /**
     * Execute benchmark with timeout protection
     * @param {string} name - Benchmark name
     * @param {object} benchmark - Benchmark configuration
     * @param {object} options - Execution options
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<object>} Execution result
     */
    async executeBenchmarkWithTimeout(name, benchmark, options, timeout) {
        return new Promise(async (resolve, reject) => {
            // Setup timeout
            const timeoutId = setTimeout(() => {
                reject(new Error(`Benchmark ${name} timed out after ${timeout}ms`));
            }, timeout);
            
            try {
                // Start performance measurement
                performance.mark(`benchmark-${name}-start`);
                
                // Execute benchmark
                const result = await benchmark.test(options);
                
                // End performance measurement
                performance.mark(`benchmark-${name}-end`);
                performance.measure(`benchmark-${name}`, 
                    `benchmark-${name}-start`, `benchmark-${name}-end`);
                
                clearTimeout(timeoutId);
                resolve(result);
                
            } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    }
    
    /**
     * Validate benchmark result format
     * @param {object} result - Benchmark result
     * @returns {boolean} True if valid
     */
    validateBenchmarkResult(result) {
        if (!result || typeof result !== 'object') {
            return false;
        }
        
        // Result should have success field or be implicitly successful
        if (result.success === false) {
            return result.error !== undefined;
        }
        
        // Successful results should have meaningful data
        const hasData = Object.keys(result).some(key => 
            key !== 'success' && result[key] !== undefined && result[key] !== null
        );
        
        return hasData;
    }
    
    /**
     * Collect performance entries for benchmark
     * @param {string} name - Benchmark name
     * @returns {Array} Performance entries
     */
    collectPerformanceEntries(name) {
        const entries = [];
        
        try {
            // Collect performance marks and measures
            const marks = performance.getEntriesByType('mark')
                .filter(entry => entry.name.includes(name));
            const measures = performance.getEntriesByType('measure')
                .filter(entry => entry.name.includes(name));
            
            [...marks, ...measures].forEach(entry => {
                entries.push({
                    name: entry.name,
                    entryType: entry.entryType,
                    startTime: entry.startTime,
                    duration: entry.duration,
                    timestamp: Date.now()
                });
            });
            
        } catch (error) {
            console.warn(`[BenchmarkExecutor] Failed to collect performance entries for ${name}:`, error);
        }
        
        return entries;
    }
    
    /**
     * Cleanup benchmark execution environment
     * @param {object} executionSession - Execution session
     */
    async cleanupBenchmarkEnvironment(executionSession) {
        const { name, benchmark, options } = executionSession;
        
        try {
            console.log(`[BenchmarkExecutor] Cleaning up environment for ${name}`);
            
            // Category-specific cleanup
            if (benchmark.category === 'memory') {
                // Force garbage collection if available
                if (window.gc) {
                    window.gc();
                }
            }
            
            if (benchmark.category === 'rendering') {
                // Clear canvas if used
                const canvas = this.benchmarkSuite.gameEngine?.canvas;
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }
                }
            }
            
            // Custom cleanup
            if (options.environmentCleanup) {
                await options.environmentCleanup();
            }
            
            // Clear performance timeline for this benchmark
            const entriesToClear = performance.getEntriesByType('mark')
                .concat(performance.getEntriesByType('measure'))
                .filter(entry => entry.name.includes(name));
                
            entriesToClear.forEach(entry => {
                if (entry.entryType === 'mark' && performance.clearMarks) {
                    performance.clearMarks(entry.name);
                } else if (entry.entryType === 'measure' && performance.clearMeasures) {
                    performance.clearMeasures(entry.name);
                }
            });
            
        } catch (error) {
            console.warn(`[BenchmarkExecutor] Cleanup failed for ${name}:`, error);
        }
    }
    
    /**
     * Get execution statistics
     * @returns {object} Execution statistics
     */
    getExecutionStats() {
        const totalExecutions = this.executionHistory.length;
        const successfulExecutions = this.executionHistory.filter(exec => exec.success).length;
        const failedExecutions = totalExecutions - successfulExecutions;
        
        const executionTimes = this.executionHistory.map(exec => exec.executionTime).filter(time => time > 0);
        const avgExecutionTime = executionTimes.length > 0 
            ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
            : 0;
        
        const totalAttempts = this.executionHistory.reduce((sum, exec) => sum + exec.attempts, 0);
        const avgAttemptsPerExecution = totalExecutions > 0 ? totalAttempts / totalExecutions : 0;
        
        return {
            totalExecutions,
            successfulExecutions,
            failedExecutions,
            successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions * 100).toFixed(1) + '%' : '0%',
            avgExecutionTime: avgExecutionTime.toFixed(2),
            avgAttemptsPerExecution: avgAttemptsPerExecution.toFixed(1),
            currentlyExecuting: this.isExecuting,
            currentExecution: this.currentExecution ? this.currentExecution.name : null
        };
    }
    
    /**
     * Configure execution parameters
     * @param {object} config - Configuration options
     */
    configure(config) {
        Object.assign(this.executionConfig, config);
        console.log('[BenchmarkExecutor] Configuration updated');
    }
    
    /**
     * Cleanup executor resources
     */
    destroy() {
        this.isExecuting = false;
        this.currentExecution = null;
        this.executionQueue = [];
        this.executionHistory = [];
        
        console.log('[BenchmarkExecutor] Benchmark executor destroyed');
    }
}