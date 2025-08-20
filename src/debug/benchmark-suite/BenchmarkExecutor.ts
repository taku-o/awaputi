/**
 * BenchmarkExecutor - Benchmark execution component
 * Handles benchmark timing, resource management and environment setup
 */

import { getErrorHandler } from '../../core/ErrorHandler.js';

interface ExecutionConfig { defaultTimeout: number,
    maxConcurrentBenchmarks: number,
    retryAttempts: number,
    warmupIterations: number }
}

interface Benchmark { name: string,
    test: () => Promise<any> | any,
    category?: string;
    iterations?: number;
    timeout?: number; }
}

interface ExecutionOptions { retryAttempts?: number;
    warmup?: boolean;
    timeout?: number;
    iterations?: number; }
}

interface ExecutionSession { name: string,
    benchmark: Benchmark,
    options: ExecutionOptions,
    startTime: number,
    sessionId: number,
    attempts: number,
    maxAttempts: number }
}

interface PerformanceEntry { name: string,
    entryType: string,
    startTime: number,
    duration: number }
}

interface BenchmarkResult { success?: boolean;
    error?: {
        message: string,
        stack?: string }
    };
    benchmark: Benchmark,
    timestamp: number,
    executionTime?: number;
    sessionId: number,
    attempts: number,
    performanceEntries?: PerformanceEntry[];
    iterations?: number;
    averageTime?: number;
    minTime?: number;
    maxTime?: number;
    opsPerSecond?: number;
    memoryUsage?: { before: number,
        after: number,
        delta: number }
    };
}

interface ExecutionHistoryEntry { name: string,
    timestamp: number,
    success: boolean,
    executionTime: number,
    attempts: number }
}

interface BenchmarkSuite { gameEngine?: {
        canvas?: HTMLCanvasElement;
    }
    };
}

interface ErrorHandler { handleError(error: Error, context: any): void }
}

export class BenchmarkExecutor {
    private benchmarkSuite: BenchmarkSuite;
    private errorHandler: ErrorHandler;
    private executionConfig: ExecutionConfig;
    private isExecuting: boolean = false;
    private currentExecution: ExecutionSession | null = null;
    private executionQueue: any[] = [];
    private executionHistory: ExecutionHistoryEntry[] = [];
    constructor(benchmarkSuite: BenchmarkSuite) {
';'
        this.benchmarkSuite = benchmarkSuite;''
        this.errorHandler = getErrorHandler('';
    }
    })'
        console.log('[BenchmarkExecutor] Benchmark execution component initialized'); }
    }
    
    /**
     * Execute single benchmark with resource management
     */
    async executeBenchmark(name: string, benchmark: Benchmark, options: ExecutionOptions = { ): Promise<BenchmarkResult> {
        if (!benchmark || !benchmark.test) { }
            throw new Error(`Invalid benchmark configuration for ${name)`});
        }
        
        const executionSession: ExecutionSession = { name,
            benchmark,
            options,
            startTime: performance.now(),
            sessionId: Date.now(),
            attempts: 0,
            maxAttempts: options.retryAttempts || this.executionConfig.retryAttempts }
        },
        
        this.currentExecution = executionSession;
        
        try { console.log(`[BenchmarkExecutor] Executing benchmark: ${benchmark.name)`),
            
            // Setup benchmark environment
            await this.setupBenchmarkEnvironment(executionSession);
            
            // Run warmup if configured
            if (options.warmup !== false) { }
                await this.runWarmup(executionSession});
            }
            
            // Execute benchmark with retry logic
            const result = await this.executeWithRetry(executionSession);
            
            // Measure performance entries
            const performanceEntries = this.collectPerformanceEntries(name);
            
            const finalResult: BenchmarkResult = { ...result,
                benchmark: benchmark,
                timestamp: Date.now(),
                executionTime: performance.now() - executionSession.startTime,
                sessionId: executionSession.sessionId,
                attempts: executionSession.attempts,
                performanceEntries: performanceEntries,
                success: result.success !== false }
            },
            
            // Store execution history
            this.executionHistory.push({ )
                name);
                timestamp: Date.now(),
                success: finalResult.success!,
                executionTime: finalResult.executionTime!,
                attempts: executionSession.attempts }
            }),
            
            return finalResult;
            '';
        } catch (error) { this.errorHandler.handleError(error as Error, {')'
                context: 'BenchmarkExecutor.executeBenchmark',);
                benchmarkName: name) }
            });
            
            return { success: false,
                error: {
                    message: (error as Error).message, };
                    stack: (error as Error).stack }
                },
                benchmark: benchmark,
                timestamp: Date.now(),
                sessionId: executionSession.sessionId,
                attempts: executionSession.attempts;
            },
        } finally { // Cleanup benchmark environment
            await this.cleanupBenchmarkEnvironment(executionSession);
            this.currentExecution = null; }
        }
    }
    
    /**
     * Setup benchmark execution environment
     */
    private async setupBenchmarkEnvironment(executionSession: ExecutionSession): Promise<void> {
        const { name, benchmark } = executionSession;
        
        try { // Clear performance timeline
            if(performance.clearMarks) {
                
            }
                performance.clearMarks(); }
            }
            if (performance.clearMeasures) { performance.clearMeasures(); }
            }
            ;
            // Setup performance markers
            performance.mark(`benchmark-${ name)-setup-start`');
            ';
            // Configure execution environment based on benchmark category
            if(benchmark.category === 'memory') {
                // Force garbage collection if available
                if ((window as any).gc) {''
                    (window as any).gc()';
            if (benchmark.category === 'rendering') {
                // Ensure canvas context is available
                const canvas = this.benchmarkSuite.gameEngine? .canvas;''
                if (canvas') {''
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
            }
                        ctx.clearRect(0, 0, canvas.width, canvas.height); }
                    }
                }
            }
            
            performance.mark(`benchmark-${name)-setup-end`});
            performance.measure(;
                `benchmark-${name}-setup`)
                `benchmark-${name}-setup-start`)
                `benchmark-${ name)-setup-end` }
            });
            
        } catch (error) { : undefined }
            console.warn(`[BenchmarkExecutor] Environment setup warning for ${name}:`, error);
        }
    }
    
    /**
     * Run warmup iterations
     */
    private async runWarmup(executionSession: ExecutionSession): Promise<void> {
        const { name, benchmark } = executionSession;
        const warmupIterations = this.executionConfig.warmupIterations;
        
        try { performance.mark(`benchmark-${name)-warmup-start`);
            
            for(let i = 0; i < warmupIterations; i++) {
            
                await this.executeSingleIteration(benchmark);
                
            
            }
                // Small delay between warmup iterations }
                await this.wait(10});
            }
            
            performance.mark(`benchmark-${name)-warmup-end`});
            performance.measure(;
                `benchmark-${name}-warmup`)
                `benchmark-${name}-warmup-start`)
                `benchmark-${ name)-warmup-end` }
            });
            
        } catch (error) {
            console.warn(`[BenchmarkExecutor] Warmup warning for ${name}:`, error);
        }
    }
    
    /**
     * Execute benchmark with retry logic
     */
    private async executeWithRetry(executionSession: ExecutionSession): Promise<BenchmarkResult> {
        const { name, benchmark, options } = executionSession;
        const maxAttempts = executionSession.maxAttempts;
        
        let lastError: Error | null = null,
        
        for(let attempt = 1; attempt <= maxAttempts; attempt++) {
        
            executionSession.attempts = attempt;
            
            try {
                const result = await this.executeWithTiming(executionSession);
                return result;
        
        }
                 }
            } catch (error) { lastError = error as Error; }
                console.warn(`[BenchmarkExecutor] Attempt ${attempt}/${maxAttempts} failed for ${name}:`, error);
                
                if(attempt < maxAttempts) {
                
                    // Wait before retry
                
                }
                    await this.wait(1000 * attempt); }
                }
            }
        }
        
        throw lastError || new Error(`Benchmark ${name} failed after ${maxAttempts) attempts`});
    }
    
    /**
     * Execute benchmark with detailed timing
     */
    private async executeWithTiming(executionSession: ExecutionSession): Promise<BenchmarkResult> {
        const { name, benchmark, options } = executionSession;
        const iterations = options.iterations || benchmark.iterations || 1;
        
        performance.mark(`benchmark-${ name)-execution-start`);
        
        const results: number[] = [],
        let memoryBefore: number = 0,
        let memoryAfter: number = 0,
        
        // Measure memory before if available }
        if (performance.memory}) { memoryBefore = performance.memory.usedJSHeapSize; }
        }
        
        for(let i = 0; i < iterations; i++) {
        
            const iterationStart = performance.now();
            
            await this.executeSingleIteration(benchmark);
            
            const iterationEnd = performance.now();
        
        }
            results.push(iterationEnd - iterationStart); }
        }
        
        // Measure memory after if available
        if (performance.memory) { memoryAfter = performance.memory.usedJSHeapSize; }
        }
        
        performance.mark(`benchmark-${name)-execution-end`});
        performance.measure(;
            `benchmark-${name}-execution`)
            `benchmark-${name}-execution-start`)
            `benchmark-${ name)-execution-end`
        );
        
        // Calculate statistics
        const totalTime = results.reduce((a, b) => a + b, 0);
        const averageTime = totalTime / iterations;
        const minTime = Math.min(...results);
        const maxTime = Math.max(...results);
        const opsPerSecond = 1000 / averageTime;
        
        return { success: true };
            benchmark: benchmark, }
            timestamp: Date.now(}),
            sessionId: executionSession.sessionId,
            attempts: executionSession.attempts,
            iterations,
            averageTime,
            minTime,
            maxTime,
            opsPerSecond,
            memoryUsage: performance.memory ? { : undefined
                before: memoryBefore,
                after: memoryAfter,
                delta: memoryAfter - memoryBefore }
            } : undefined
        },
    }
    
    /**
     * Execute single iteration of benchmark
     */
    private async executeSingleIteration(benchmark: Benchmark): Promise<any> { const timeout = benchmark.timeout || this.executionConfig.defaultTimeout;
        
        return new Promise(async (resolve, reject) => {  }
            const timeoutId = setTimeout(() => { }
                reject(new Error(`Benchmark timeout after ${timeout}ms`);
            }, timeout);
            
            try { const result = await benchmark.test();
                clearTimeout(timeoutId);
                resolve(result); }
            } catch (error) { clearTimeout(timeoutId);
                reject(error); }
            }
        });
    }
    
    /**
     * Collect performance entries
     */''
    private collectPerformanceEntries(benchmarkName: string'): PerformanceEntry[] { try {
            const entries: PerformanceEntry[] = [],
            ';
            // Get all performance entries related to this benchmark
            const measures = performance.getEntriesByType('measure')'';
                .filter(entry => entry.name.includes(benchmarkName)');'
            '';
            const marks = performance.getEntriesByType('mark');
                .filter(entry => entry.name.includes(benchmarkName);
            
            entries.push(...measures.map(entry => ({
                name: entry.name);
                entryType: entry.entryType);
                startTime: entry.startTime,);
                duration: entry.duration))),
            
            entries.push(...marks.map(entry => ({
                name: entry.name);
                entryType: entry.entryType);
                startTime: entry.startTime,);
                duration: 0))),
            
            return entries;'
            ' }'
        } catch (error) { ''
            console.warn('[BenchmarkExecutor] Failed to collect performance entries:', error);
            return []; }
        }
    }
    
    /**
     * Cleanup benchmark environment
     */
    private async cleanupBenchmarkEnvironment(executionSession: ExecutionSession): Promise<void> {
        const { name } = executionSession;
        
        try { performance.mark(`benchmark-${name)-cleanup-start`);
            
            // Force garbage collection if available
            if ((window as any).gc) { }
                (window as any).gc(});
            }
            
            // Small delay to ensure cleanup
            await this.wait(100);
            
            performance.mark(`benchmark-${name)-cleanup-end`});
            performance.measure(;
                `benchmark-${name}-cleanup`)
                `benchmark-${name}-cleanup-start`)
                `benchmark-${ name)-cleanup-end` }
            });
            
        } catch (error) {
            console.warn(`[BenchmarkExecutor] Cleanup warning for ${name}:`, error);
        }
    }
    
    /**
     * Wait for specified milliseconds
     */
    private async wait(ms: number): Promise<void> { return new Promise(resolve => setTimeout(resolve, ms); }
    }
    
    /**
     * Get execution history
     */
    getExecutionHistory(): ExecutionHistoryEntry[] { return [...this.executionHistory]; }
    }
    
    /**
     * Get current execution status
     */
    getCurrentExecution(): ExecutionSession | null { return this.currentExecution; }
    }
    
    /**
     * Check if executor is currently running
     */
    isCurrentlyExecuting(): boolean { return this.isExecuting; }
    }
    
    /**
     * Clear execution history
     */
    clearHistory(): void { this.executionHistory = []; }
    }
    
    /**
     * Get execution statistics
     */
    getExecutionStatistics(): { totalExecutions: number,
        successfulExecutions: number,
        failedExecutions: number,
        averageExecutionTime: number,
        successRate: number }
    } { const total = this.executionHistory.length;
        const successful = this.executionHistory.filter(entry => entry.success).length;
        const failed = total - successful;
        const totalTime = this.executionHistory.reduce((sum, entry) => sum + entry.executionTime, 0);
        const averageTime = total > 0 ? totalTime / total: 0,'';
        const successRate = total > 0 ? (successful / total') * 100 : 0;
        
        return { totalExecutions: total,
            successfulExecutions: successful,
            failedExecutions: failed,
            averageExecutionTime: averageTime, };
            successRate }
        };'
    }''
}