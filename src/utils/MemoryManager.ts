import { LeakDetector } from './memory-manager/LeakDetector.js';
import { ProactiveCleanupManager } from './memory-manager/ProactiveCleanupManager.js';
import { MemoryUsageAnalyzer } from './memory-manager/MemoryUsageAnalyzer.js';

// Type definitions
interface MemoryManagerConfig {
    cleanupInterval?: number;
    maxObjectTracking?: number;
    memoryThreshold?: number;
    enableLeakDetection?: boolean;
    enableProactiveCleanup?: boolean;
}

interface MemoryStats {
    objectsCreated: number;
    objectsDestroyed: number;
    timersCreated: number;
    timersCleared: number;
    listenersAdded: number;
    listenersRemoved: number;
    
    // Component-aggregated stats
    memoryLeaksDetected: number;
    memoryLeaksSuspected: number;
    proactiveCleanups: number;
    memoryPressureEvents: number;
    cleanupEfficiency: number;
    
    // Current state
    currentMemoryPressure: number;
    leakRiskLevel: 'low' | 'medium' | 'high' | 'critical';
    memoryHealthScore: number;
}

interface TrackedObject {
    id: string;
    type: string;
    createdAt: number;
    lastAccessed?: number;
    size?: number;
}

/**
 * Intelligent Memory Management System (Refactored)
 * インテリジェントメモリ管理システム - メインコントローラー
 * 
 * サブコンポーネント化により責任を分離し、保守性を向上
 * - LeakDetector: メモリリーク検出
 * - ProactiveCleanupManager: プロアクティブクリーンアップ
 * - MemoryUsageAnalyzer: 使用パターン解析
 */
export class MemoryManager {
    private trackedObjects: WeakMap<object, TrackedObject>;
    private cleanupInterval: number;
    
    // Sub-components
    private leakDetector!: LeakDetector;
    private proactiveCleanup!: ProactiveCleanupManager;
    private usageAnalyzer!: MemoryUsageAnalyzer;
    
    // Statistics
    public stats: MemoryStats;
    
    constructor(config: MemoryManagerConfig = {}) {
        // Basic tracking
        this.trackedObjects = new WeakMap<object, TrackedObject>();
        
        // Initialize sub-components
        this._initializeSubComponents(config);
        
        // Main statistics
        this.stats = {
            objectsCreated: 0,
            objectsDestroyed: 0,
            timersCreated: 0,
            timersCleared: 0,
            listenersAdded: 0,
            listenersRemoved: 0,
            
            // Component-aggregated stats
            memoryLeaksDetected: 0,
            memoryLeaksSuspected: 0,
            proactiveCleanups: 0,
            memoryPressureEvents: 0,
            cleanupEfficiency: 1.0,
            
            // Current state
            currentMemoryPressure: 0,
            leakRiskLevel: 'low',
            memoryHealthScore: 1.0
        };
        
        // Main cleanup interval
        this.cleanupInterval = setInterval(() => {
            this.performIntelligentCleanup();
        }, config.cleanupInterval || 30000) as any;
        
        this.bindMethods();
        this.initializeMemoryMonitoring();
        
        console.log('[MemoryManager] Intelligent memory management system initialized');
    }
    
    /**
     * Initialize sub-components
     */
    private _initializeSubComponents(config: MemoryManagerConfig): void {
        try {
            // Leak detection component
            this.leakDetector = new LeakDetector({
                enabled: config.enableLeakDetection !== false,
                ...config
            });
            
            // Proactive cleanup component
            this.proactiveCleanup = new ProactiveCleanupManager({
                enabled: config.enableProactiveCleanup !== false,
                ...config
            });
            
            // Usage analysis component
            this.usageAnalyzer = new MemoryUsageAnalyzer({
                ...config
            });
            
            console.log('[MemoryManager] All sub-components initialized successfully');
            
        } catch (error) {
            console.error('[MemoryManager] Failed to initialize sub-components:', error);
            throw error;
        }
    }
    
    /**
     * Bind methods to preserve context
     */
    private bindMethods(): void {
        this.track = this.track.bind(this);
        this.untrack = this.untrack.bind(this);
        this.cleanup = this.cleanup.bind(this);
        this.performIntelligentCleanup = this.performIntelligentCleanup.bind(this);
    }
    
    /**
     * Initialize memory monitoring
     */
    private initializeMemoryMonitoring(): void {
        if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
            // Start memory pressure monitoring
            setInterval(() => {
                this.checkMemoryPressure();
            }, 5000);
        }
    }
    
    /**
     * Track an object for memory management
     */
    track(obj: object, type: string = 'unknown', __metadata: any = {}): void {
        if (!obj || typeof obj !== 'object') return;
        
        try {
            const trackedInfo: TrackedObject = {
                id: this.generateObjectId(),
                type,
                createdAt: Date.now(),
                size: this.estimateObjectSize(obj)
            };
            
            this.trackedObjects.set(obj, trackedInfo);
            this.stats.objectsCreated++;
            
            // Delegate to sub-components
            this.leakDetector.trackObject(obj, trackedInfo);
            this.usageAnalyzer.recordObjectCreation(trackedInfo);
            
        } catch (error) {
            console.error('[MemoryManager] Error tracking object:', error);
        }
    }
    
    /**
     * Untrack an object
     */
    untrack(obj: object): void {
        if (!obj || typeof obj !== 'object') return;
        
        try {
            const trackedInfo = this.trackedObjects.get(obj);
            if (trackedInfo) {
                this.trackedObjects.delete(obj);
                this.stats.objectsDestroyed++;
                
                // Notify sub-components
                this.leakDetector.untrackObject(obj);
                this.usageAnalyzer.recordObjectDestruction(trackedInfo);
            }
        } catch (error) {
            console.error('[MemoryManager] Error untracking object:', error);
        }
    }
    
    /**
     * Perform manual cleanup
     */
    cleanup(): void {
        try {
            // Delegate to proactive cleanup manager
            const cleanupResult = this.proactiveCleanup.performCleanup();
            
            // Update statistics
            this.stats.proactiveCleanups++;
            
            // Run garbage collection if available
            if (typeof window !== 'undefined' && (window as any).gc) {
                (window as any).gc();
            }
            
            console.log('[MemoryManager] Manual cleanup completed', cleanupResult);
            
        } catch (error) {
            console.error('[MemoryManager] Error during cleanup:', error);
        }
    }
    
    /**
     * Perform intelligent cleanup based on usage analysis
     */
    performIntelligentCleanup(): void {
        try {
            // Get usage analysis
            const usageReport = this.usageAnalyzer.getUsageReport();
            
            // Perform leak detection
            const leakReport = this.leakDetector.detectLeaks();
            
            // Execute intelligent cleanup
            const cleanupResult = this.proactiveCleanup.performIntelligentCleanup(usageReport, leakReport);
            
            // Update aggregated statistics
            this.updateAggregatedStats(usageReport, leakReport, cleanupResult);
            
            // Check memory health
            this.assessMemoryHealth();
            
        } catch (error) {
            console.error('[MemoryManager] Error during intelligent cleanup:', error);
        }
    }
    
    /**
     * Check current memory pressure
     */
    private checkMemoryPressure(): void {
        if (typeof window === 'undefined' || !window.performance?.memory) return;
        
        try {
            const memory = window.performance.memory;
            const usedMB = memory.usedJSHeapSize / 1024 / 1024;
            const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
            const pressure = usedMB / limitMB;
            
            this.stats.currentMemoryPressure = pressure;
            
            if (pressure > 0.9) {
                this.stats.memoryPressureEvents++;
                this.performIntelligentCleanup();
            }
            
        } catch (error) {
            console.error('[MemoryManager] Error checking memory pressure:', error);
        }
    }
    
    /**
     * Update aggregated statistics from sub-components
     */
    private updateAggregatedStats(__usageReport: any, leakReport: any, cleanupResult: any): void {
        // Update leak statistics
        if (leakReport) {
            this.stats.memoryLeaksDetected += leakReport.definiteLeaks || 0;
            this.stats.memoryLeaksSuspected += leakReport.suspectedLeaks || 0;
        }
        
        // Update cleanup statistics
        if (cleanupResult) {
            this.stats.cleanupEfficiency = cleanupResult.efficiency || 1.0;
        }
    }
    
    /**
     * Assess overall memory health
     */
    private assessMemoryHealth(): void {
        let healthScore = 1.0;
        let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
        
        // Factor in memory pressure
        if (this.stats.currentMemoryPressure > 0.8) {
            healthScore -= 0.3;
            riskLevel = 'high';
        } else if (this.stats.currentMemoryPressure > 0.6) {
            healthScore -= 0.1;
            riskLevel = 'medium';
        }
        
        // Factor in leak detection
        if (this.stats.memoryLeaksDetected > 0) {
            healthScore -= 0.2;
            riskLevel = riskLevel === 'low' ? 'medium' : 'critical';
        }
        
        this.stats.memoryHealthScore = Math.max(0, healthScore);
        this.stats.leakRiskLevel = riskLevel;
    }
    
    /**
     * Generate unique object ID
     */
    private generateObjectId(): string {
        return `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Estimate object size (simplified)
     */
    private estimateObjectSize(obj: any): number {
        try {
            return JSON.stringify(obj).length;
        } catch {
            return 0; // Fallback for non-serializable objects
        }
    }
    
    /**
     * Get current memory statistics
     */
    getStats(): MemoryStats {
        return { ...this.stats };
    }
    
    /**
     * Get detailed memory report
     */
    getMemoryReport(): any {
        return {
            stats: this.getStats(),
            usageReport: this.usageAnalyzer.getUsageReport(),
            leakReport: this.leakDetector.getLeakReport(),
            cleanupReport: (this.proactiveCleanup as any).getCleanupReport ? (this.proactiveCleanup as any).getCleanupReport() : null
        };
    }
    
    /**
     * Destroy memory manager and cleanup resources
     */
    destroy(): void {
        try {
            // Clear intervals
            if (this.cleanupInterval) {
                clearInterval(this.cleanupInterval);
            }
            
            // Destroy sub-components if destroy method exists
            if ((this.leakDetector as any).destroy) {
                (this.leakDetector as any).destroy();
            }
            if ((this.proactiveCleanup as any).destroy) {
                (this.proactiveCleanup as any).destroy();
            }
            if ((this.usageAnalyzer as any).destroy) {
                (this.usageAnalyzer as any).destroy();
            }
            
            // Clear tracking
            this.trackedObjects = new WeakMap();
            
            console.log('[MemoryManager] Memory manager destroyed');
            
        } catch (error) {
            console.error('[MemoryManager] Error during destruction:', error);
        }
    }
}

// Singleton instance
let memoryManagerInstance: MemoryManager | null = null;

/**
 * Get singleton MemoryManager instance
 * @returns MemoryManager instance
 */
export function getMemoryManager(): MemoryManager {
    if (!memoryManagerInstance) {
        memoryManagerInstance = new MemoryManager();
    }
    return memoryManagerInstance;
}

// Already exported above

/**
 * Leak Detector - メモリリーク検出
 */
class LeakDetector {
    private trackedObjects: Map<object, any> = new Map();

    trackObject(obj: object, trackedInfo: any): void {
        this.trackedObjects.set(obj, {
            ...trackedInfo,
            trackedAt: Date.now()
        });
    }

    detectLeaks(): any[] {
        // 基本的なリーク検出ロジック
        const now = Date.now();
        const leaks: any[] = [];
        
        this.trackedObjects.forEach((info, obj) => {
            if (now - info.trackedAt > 300000) { // 5分以上古いオブジェクト
                leaks.push({ object: obj, info });
            }
        });
        
        return leaks;
    }

    getLeakReport(): any {
        const leaks = this.detectLeaks();
        return {
            leakCount: leaks.length,
            leaks: leaks,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Memory Usage Analyzer - メモリ使用パターン解析
 */
class MemoryUsageAnalyzer {
    private creationHistory: any[] = [];

    recordObjectCreation(trackedInfo: any): void {
        this.creationHistory.push({
            ...trackedInfo,
            timestamp: Date.now()
        });
        
        // 履歴の上限管理
        if (this.creationHistory.length > 1000) {
            this.creationHistory = this.creationHistory.slice(-500);
        }
    }

    getUsageAnalysis(): any {
        return {
            totalCreations: this.creationHistory.length,
            recentCreations: this.creationHistory.filter(
                item => Date.now() - item.timestamp < 60000
            ).length,
            typeBreakdown: this.getTypeBreakdown()
        };
    }

    private getTypeBreakdown(): any {
        const breakdown: { [key: string]: number } = {};
        this.creationHistory.forEach(item => {
            const type = item.type || 'unknown';
            breakdown[type] = (breakdown[type] || 0) + 1;
        });
        return breakdown;
    }

    getUsageReport(): any {
        return {
            totalObjects: this.creationHistory.length,
            typeBreakdown: this.getTypeBreakdown(),
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Proactive Cleanup Manager - プロアクティブクリーンアップ管理
 */
class ProactiveCleanupManager {
    private cleanupHandlers: Map<string, () => void> = new Map();

    registerCleanupHandler(key: string, handler: () => void): void {
        this.cleanupHandlers.set(key, handler);
    }

    performCleanup(): void {
        this.cleanupHandlers.forEach((handler, key) => {
            try {
                handler();
            } catch (error) {
                console.error(`[ProactiveCleanupManager] Error in cleanup handler ${key}:`, error);
            }
        });
    }

    performIntelligentCleanup(usageReport: any, leakReport: any): any {
        const result = {
            performedActions: [] as string[],
            freedMemory: 0,
            timestamp: new Date().toISOString()
        };

        // 基本クリーンアップ実行
        this.performCleanup();
        result.performedActions.push('basic_cleanup');

        // リークが検出された場合の追加処理
        if (leakReport.leakCount > 0) {
            result.performedActions.push('leak_detection_cleanup');
            result.freedMemory = leakReport.leakCount * 1024; // 仮想的なメモリ解放量
        }

        return result;
    }
}
