/**
 * VestibularSafetyManager
 * 前庭障害配慮、モーション安全性検証、自動軽減機能
 */

// 型定義
export interface MotionManager {
    visualAccessibilityManager: VisualAccessibilityManager;
    accessibilityManager: AccessibilityManager;
    gameEngine: GameEngine;
    config: MotionConfig;
    userPreferences: UserPreferences;
    hazardPatterns: Record<string, HazardPattern>;
    stats: MotionStats;
    activeAnimations: Map<string, AnimationData>;
    animationController: AnimationController;
    configManager: ConfigManager;
}

export interface VisualAccessibilityManager {
    [key: string]: any;
}

export interface AccessibilityManager {
    [key: string]: any;
}

export interface GameEngine {
    [key: string]: any;
}

export interface MotionConfig {
    vestibularSafety: boolean;
    vestibularGuidelines: VestibularGuidelines;
}

export interface VestibularGuidelines {
    maxRotationSpeed: number;
    maxScaleChange: number;
    maxParallaxDistance: number;
    flashingThreshold: number;
}

export interface UserPreferences {
    [key: string]: any;
}

export interface HazardPattern {
    detected: boolean;
    threshold: number;
    description?: string;
    severity?: HazardSeverity;
}

export interface MotionStats {
    vestibularWarnings: number;
}

export interface AnimationData {
    id: string;
    element: HTMLElement;
    category: string;
    options: AnimationOptions;
    startTime: number;
    duration: number | null;
    isActive: boolean;
    isPaused: boolean;
}

export interface AnimationOptions {
    duration?: number;
    intensity?: number;
    speed?: number;
    category?: string;
    vestibularSafe?: boolean;
    [key: string]: any;
}

export interface AnimationController {
    pauseAnimation: (animationId: string) => boolean;
    adjustAnimationIntensity: (animationId: string, multiplier: number) => boolean;
    pauseAllAnimations: () => number;
}

export interface ConfigManager {
    setMotionLevel: (level: MotionLevel) => boolean;
}

export interface SafetyMonitor {
    enabled: boolean;
    checkInterval: number;
    lastCheck: number;
    violationCount: number;
    interventionCount: number;
}

export interface SafetyThresholds extends VestibularGuidelines {
    maxVelocity: number;
    maxAcceleration: number;
    maxJerk: number;
    dangerZoneSize: number;
    emergencyStopTrigger: number;
}

export interface SafetyViolation {
    type: ViolationType[];
    severity: ViolationSeverity;
    element?: HTMLElement;
    animationId?: string;
    frequency?: number;
    size?: ElementSize;
    rotationSpeed?: number;
    scaleValue?: number;
    translationDistance?: number;
}

export interface ElementSize {
    width: number;
    height: number;
}

export interface SafetyEventListener {
    event: string;
    handler: EventListener;
}

export interface SafetyStats {
    monitoring: boolean;
    violations: number;
    interventions: number;
    hazardPatterns: Record<string, boolean>;
    thresholds: SafetyThresholds;
    totalWarnings: number;
}

export interface SafetyAlert {
    message: string;
    severity: ViolationSeverity;
    timestamp: number;
    autoRemove?: boolean;
    duration?: number;
}

export interface WarningOverlay {
    element: HTMLElement;
    severity: ViolationSeverity;
    content: string;
    timestamp: number;
}

export interface EmergencyStopInfo {
    triggered: boolean;
    timestamp: number;
    reason: string;
    violationCount: number;
}

export interface SafetyInterventionLog {
    timestamp: number;
    type: InterventionType;
    target: string;
    severity: ViolationSeverity;
    action: string;
    success: boolean;
}

// 列挙型
export type MotionLevel = 'none' | 'essential' | 'reduced' | 'normal' | 'enhanced';

export type ViolationType = 
    | 'excessive_rotation' | 'excessive_scaling' | 'excessive_translation'
    | 'excessive_flashing' | 'infinite_animation' | 'large_element_motion'
    | 'rapid_sequence' | 'complex_path' | 'multiple_violations';

export type ViolationSeverity = 'low' | 'medium' | 'high' | 'critical';
export type HazardSeverity = 'low' | 'medium' | 'high' | 'critical';

export type InterventionType = 
    | 'immediate_stop' | 'reduce_intensity' | 'add_warning'
    | 'pause_animation' | 'emergency_stop' | 'threshold_adjustment';

export type HazardPatternType = 
    | 'rapidFlashing' | 'rapidRotation' | 'extremeZoom' | 'violentShaking'
    | 'complexMotion' | 'multiLayerParallax' | 'strobeEffect';

// 定数
export const DEFAULT_SAFETY_CHECK_INTERVAL = 100; // ms
export const DEFAULT_EMERGENCY_STOP_TRIGGER = 10;
export const DEFAULT_WARNING_DURATION = 5000; // ms
export const DEFAULT_ALERT_DURATION = 10000; // ms

export const SAFETY_THRESHOLDS: SafetyThresholds = {
    maxRotationSpeed: 45, // degrees per second
    maxScaleChange: 1.5,
    maxParallaxDistance: 100, // pixels
    flashingThreshold: 3, // flashes per second
    maxVelocity: 500, // pixels per second
    maxAcceleration: 1000, // pixels per second²
    maxJerk: 2000, // pixels per second³
    dangerZoneSize: 50, // pixels
    emergencyStopTrigger: 10 // consecutive violations
};

export const VIOLATION_SEVERITY_LEVELS: ViolationSeverity[] = ['low', 'medium', 'high', 'critical'];

export const HAZARD_PATTERN_DEFAULTS: Record<string, HazardPattern> = {
    rapidFlashing: { detected: false, threshold: 3, severity: 'critical' },
    rapidRotation: { detected: false, threshold: 45, severity: 'high' },
    extremeZoom: { detected: false, threshold: 1.5, severity: 'medium' },
    violentShaking: { detected: false, threshold: 100, severity: 'high' }
};

// ユーティリティ関数
export function isValidViolationSeverity(severity: string): severity is ViolationSeverity {
    return VIOLATION_SEVERITY_LEVELS.includes(severity as ViolationSeverity);
}

export function isValidMotionLevel(level: string): level is MotionLevel {
    return ['none', 'essential', 'reduced', 'normal', 'enhanced'].includes(level);
}

export function isHTMLElement(element: any): element is HTMLElement {
    return element instanceof HTMLElement;
}

export function isSafetyViolation(violation: any): violation is SafetyViolation {
    return violation &&
           Array.isArray(violation.type) &&
           isValidViolationSeverity(violation.severity);
}

export function isValidThreshold(value: any): value is number {
    return typeof value === 'number' && value > 0 && value < Infinity;
}

export function clampThreshold(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

export function calculateRotationSpeed(rotation: number, duration: number): number {
    return duration > 0 ? Math.abs(rotation / duration) : 0;
}

export function calculateScaleChange(fromScale: number, toScale: number): number {
    return Math.abs(toScale - fromScale);
}

export function parseTransformRotation(transform: string): number | null {
    const match = transform.match(/rotate\(([0-9.-]+)deg\)/);
    return match ? parseFloat(match[1]) : null;
}

export function parseTransformScale(transform: string): number | null {
    const match = transform.match(/scale\(([0-9.]+)\)/);
    return match ? parseFloat(match[1]) : null;
}

export function parseTransformTranslate(transform: string): number | null {
    const match = transform.match(/translate[XY]?\(([0-9.-]+)px\)/);
    return match ? Math.abs(parseFloat(match[1])) : null;
}

export function createSafetyWarningCSS(severity: ViolationSeverity): string {
    const colors = {
        low: '#ffa502',
        medium: '#ff6348',
        high: '#ff4757',
        critical: '#c44569'
    };
    return `
        .motion-warning-${severity} {
            border: 3px solid ${colors[severity]} !important;
            background: ${colors[severity]}20 !important;
            position: relative !important;
        }
        
        .motion-warning-${severity}::before {
            content: '⚠️ 激しいアニメーション';
            position: absolute;
            top: -25px;
            left: 0;
            background: ${colors[severity]};
            color: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 11px;
            z-index: 1000;
        }
    `;
}

export function generateSafetyId(): string {
    return `safety_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export class VestibularSafetyManager {
    private motionManager: MotionManager;
    private visualAccessibilityManager: VisualAccessibilityManager;
    private accessibilityManager: AccessibilityManager;
    private gameEngine: GameEngine;
    
    // 設定参照
    private config: MotionConfig;
    private userPreferences: UserPreferences;
    private hazardPatterns: Record<string, HazardPattern>;
    
    // 統計情報
    private stats: MotionStats;
    
    // 安全性監視
    private safetyMonitor: SafetyMonitor;
    
    // 安全性閾値
    private safetyThresholds: SafetyThresholds;
    
    // イベントリスナー
    private eventListeners: Set<SafetyEventListener> = new Set();
    
    // 監視状態
    private monitoringActive = false;
    private animationFrameId: number | null = null;
    
    // ログとアラート
    private interventionLog: SafetyInterventionLog[] = [];
    private activeAlerts: Map<string, SafetyAlert> = new Map();

    constructor(motionManager: MotionManager) {
        this.motionManager = motionManager;
        this.visualAccessibilityManager = motionManager.visualAccessibilityManager;
        this.accessibilityManager = motionManager.accessibilityManager;
        this.gameEngine = motionManager.gameEngine;
        
        // 設定参照
        this.config = motionManager.config;
        this.userPreferences = motionManager.userPreferences;
        this.hazardPatterns = motionManager.hazardPatterns;
        
        // 統計情報
        this.stats = motionManager.stats;
        
        // 安全性監視の初期化
        this.safetyMonitor = {
            enabled: true,
            checkInterval: DEFAULT_SAFETY_CHECK_INTERVAL,
            lastCheck: 0,
            violationCount: 0,
            interventionCount: 0
        };
        
        // 安全性閾値の初期化
        this.safetyThresholds = { 
            ...this.config.vestibularGuidelines,
            ...SAFETY_THRESHOLDS
        };

        console.log('[VestibularSafetyManager] Component initialized');
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners(): void {
        // キーボードショートカット（緊急停止）
        const emergencyStopHandler = (e: KeyboardEvent) => {
            if(e.ctrlKey && e.shiftKey && e.key === 'M') {
                this.emergencyStop();
                e.preventDefault();
            }
        };
        
        document.addEventListener('keydown', emergencyStopHandler);
        this.eventListeners.add({ event: 'keydown', handler: emergencyStopHandler });
        
        // デバイス向きの変更
        const orientationHandler = () => {
            setTimeout(() => this.checkVestibularSafety(), 500);
        };

        window.addEventListener('orientationchange', orientationHandler);
        this.eventListeners.add({ event: 'orientationchange', handler: orientationHandler });
        
        // ページ可視性の変更
        const visibilityHandler = () => {
            if(document.visibilityState === 'visible') {
                this.resumeSafetyMonitoring();
            } else {
                this.pauseSafetyMonitoring();
            }
        };
        
        document.addEventListener('visibilitychange', visibilityHandler);
        this.eventListeners.add({ event: 'visibilitychange', handler: visibilityHandler });

        console.log('[VestibularSafetyManager] Event listeners setup complete');
    }
    
    /**
     * 安全性監視の開始
     */
    startSafetyMonitoring(): void {
        if (!this.safetyMonitor.enabled || this.monitoringActive) {
            return;
        }
        
        this.monitoringActive = true;
        
        const monitor = (currentTime: number) => {
            if (!this.monitoringActive) {
                return;
            }
            
            if (currentTime - this.safetyMonitor.lastCheck >= this.safetyMonitor.checkInterval) {
                this.checkVestibularSafety();
                this.safetyMonitor.lastCheck = currentTime;
            }
            
            this.animationFrameId = requestAnimationFrame(monitor);
        };

        this.animationFrameId = requestAnimationFrame(monitor);
        console.log('[VestibularSafetyManager] Safety monitoring started');
    }
    
    /**
     * 安全性監視の一時停止
     */
    pauseSafetyMonitoring(): void {
        this.safetyMonitor.enabled = false;
        this.monitoringActive = false;
        
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

        console.log('[VestibularSafetyManager] Safety monitoring paused');
    }
    
    /**
     * 安全性監視の再開
     */
    resumeSafetyMonitoring(): void {
        this.safetyMonitor.enabled = true;
        this.startSafetyMonitoring();
        console.log('[VestibularSafetyManager] Safety monitoring resumed');
    }
    
    /**
     * 前庭安全性のチェック
     */
    checkVestibularSafety(): SafetyViolation[] {
        if (!this.config.vestibularSafety) {
            return [];
        }
        
        const violations: SafetyViolation[] = [];
        
        try {
            // アクティブアニメーションの検証
            this.motionManager.activeAnimations.forEach((animation, id) => {
                const violation = this.checkAnimationSafety(animation);
                if (violation) {
                    violations.push({ animationId: id, ...violation } as SafetyViolation);
                }
            });
            
            // DOM要素の検証
            this.checkDOMElementsSafety(violations);
            
            // 危険パターンの検出
            this.detectHazardousPatterns(violations);
            
            // 違反への対処
            if (violations.length > 0) {
                this.handleSafetyViolations(violations);
            }
            
        } catch (error) {
            console.error('[VestibularSafetyManager] Error during safety check:', error);
        }
        
        return violations;
    }
    
    /**
     * アニメーション安全性の検証
     */
    private checkAnimationSafety(animation: AnimationData): Partial<SafetyViolation> | null {
        if (!isHTMLElement(animation.element)) {
            return null;
        }

        try {
            const element = animation.element;
            const computedStyle = getComputedStyle(element);
            const violation: Partial<SafetyViolation> = { 
                type: [], 
                severity: 'low'
            };
            
            // Transform 検証
            const transform = computedStyle.transform;
            if(transform && transform !== 'none') {
                this.checkTransformSafety(transform, computedStyle, violation);
            }
            
            // アニメーション反復の検証
            const iterationCount = computedStyle.animationIterationCount;
            if (iterationCount === 'infinite') {
                violation.type!.push('infinite_animation');
                violation.severity = violation.severity === 'high' ? 'high' : 'medium';
            }
            
            return violation.type!.length > 0 ? violation as SafetyViolation : null;
        } catch (error) {
            console.warn('[VestibularSafetyManager] Error checking animation safety:', error);
            return null;
        }
    }
    
    /**
     * Transform安全性の検証
     */
    private checkTransformSafety(
        transform: string,
        computedStyle: CSSStyleDeclaration,
        violation: Partial<SafetyViolation>
    ): void {
        // 回転速度の検証
        const rotation = parseTransformRotation(transform);
        if (rotation !== null) {
            const duration = parseFloat(computedStyle.animationDuration) || 1;
            const rotationSpeed = calculateRotationSpeed(rotation, duration);
            if (rotationSpeed > this.safetyThresholds.maxRotationSpeed) {
                violation.type!.push('excessive_rotation');
                violation.severity = 'high';
                violation.rotationSpeed = rotationSpeed;
            }
        }
        
        // スケール変更の検証
        const scale = parseTransformScale(transform);
        if (scale !== null) {
            if(scale > this.safetyThresholds.maxScaleChange || 
                scale < 1 / this.safetyThresholds.maxScaleChange) {
                violation.type!.push('excessive_scaling');
                violation.severity = violation.severity === 'high' ? 'high' : 'medium';
                violation.scaleValue = scale;
            }
        }
        
        // 移動距離の検証
        const translate = parseTransformTranslate(transform);
        if (translate !== null && translate > this.safetyThresholds.maxParallaxDistance) {
            violation.type!.push('excessive_translation');
            violation.severity = violation.severity === 'high' ? 'high' : 'medium';
            violation.translationDistance = translate;
        }
    }
    
    /**
     * DOM要素の安全性検証
     */
    private checkDOMElementsSafety(violations: SafetyViolation[]): void {
        try {
            // 点滅要素の検出
            this.checkBlinkingElements(violations);
            // 大きな要素の移動検証
            this.checkLargeElementMotion(violations);
        } catch (error) {
            console.warn('[VestibularSafetyManager] Error checking DOM elements:', error);
        }
    }
    
    /**
     * 点滅要素の検証
     */
    private checkBlinkingElements(violations: SafetyViolation[]): void {
        const blinkingElements = document.querySelectorAll('[style*="animation"], .blinking, .flash');
        
        blinkingElements.forEach(element => {
            if(!isHTMLElement(element)) return;
            
            try {
                const animationName = getComputedStyle(element).animationName;
                if(animationName && animationName.includes('blink')) {
                    const duration = parseFloat(getComputedStyle(element).animationDuration) || 1;
                    const frequency = 1 / duration;

                    if (frequency > this.safetyThresholds.flashingThreshold) {
                        violations.push({
                            element,
                            type: ['excessive_flashing'],
                            severity: 'critical',
                            frequency
                        });
                    }
                }
            } catch (error) {
                console.warn('[VestibularSafetyManager] Error checking blinking element:', error);
            }
        });
    }
    
    /**
     * 大きな要素の移動検証
     */
    private checkLargeElementMotion(violations: SafetyViolation[]): void {
        const movingElements = document.querySelectorAll('[style*="transform"], .moving, .sliding');
        
        movingElements.forEach(element => {
            if(!isHTMLElement(element)) return;
            
            try {
                const rect = element.getBoundingClientRect();
                const isLarge = rect.width > window.innerWidth * 0.5 || 
                               rect.height > window.innerHeight * 0.5;
                
                if (isLarge) {
                    const transform = getComputedStyle(element).transform;
                    if (transform && transform !== 'none') {
                        violations.push({
                            element,
                            type: ['large_element_motion'],
                            severity: 'medium',
                            size: { width: rect.width, height: rect.height }
                        });
                    }
                }
            } catch (error) {
                console.warn('[VestibularSafetyManager] Error checking large element:', error);
            }
        });
    }
    
    /**
     * 危険パターンの検出
     */
    private detectHazardousPatterns(violations: SafetyViolation[]): void {
        // 急激な点滅パターン
        const rapidFlashing = violations.filter(v => v.type.includes('excessive_flashing')).length;
        if (rapidFlashing > 0) {
            this.hazardPatterns.rapidFlashing.detected = true;
        }
        
        // 急激な回転パターン
        const rapidRotation = violations.filter(v => v.type.includes('excessive_rotation')).length;
        if (rapidRotation > 0) {
            this.hazardPatterns.rapidRotation.detected = true;
        }
        
        // 極端なズームパターン
        const extremeZoom = violations.filter(v => v.type.includes('excessive_scaling')).length;
        if (extremeZoom > 0) {
            this.hazardPatterns.extremeZoom.detected = true;
        }
        
        // 激しい揺れパターン
        const violentShaking = violations.filter(v => 
            v.type.includes('excessive_translation') && v.severity === 'high'
        ).length;
        if (violentShaking > 1) {
            // 複数要素で発生
            this.hazardPatterns.violentShaking.detected = true;
        }
    }
    
    /**
     * 安全性違反の処理
     */
    private handleSafetyViolations(violations: SafetyViolation[]): void {
        this.safetyMonitor.violationCount += violations.length;
        
        violations.forEach(violation => {
            try {
                switch(violation.severity) {
                    case 'critical':
                        this.handleCriticalViolation(violation);
                        break;
                    case 'high':
                        this.handleHighViolation(violation);
                        break;
                    case 'medium':
                        this.handleMediumViolation(violation);
                        break;
                    default:
                        this.handleLowViolation(violation);
                }
            } catch (error) {
                console.error('[VestibularSafetyManager] Error handling violation:', error);
            }
        });
        
        // 連続違反の場合、緊急停止
        if (this.safetyMonitor.violationCount > this.safetyThresholds.emergencyStopTrigger) {
            this.emergencyStop();
        }
    }
    
    /**
     * 重大違反の処理
     */
    private handleCriticalViolation(violation: SafetyViolation): void {
        console.error('[VestibularSafetyManager] Critical vestibular safety violation detected:', violation);
        
        if (violation.element) {
            this.immediateStop(violation.element);
            this.addWarningOverlay(violation.element, 'critical');
        }
        
        if (violation.animationId) {
            this.motionManager.animationController.pauseAnimation(violation.animationId);
        }

        this.showSafetyAlert('重大なモーション違反が検出されました。該当するアニメーションを停止しました。');
        this.stats.vestibularWarnings++;
        this.logIntervention('immediate_stop', violation);
    }
    
    /**
     * 高違反の処理
     */
    private handleHighViolation(violation: SafetyViolation): void {
        console.warn('[VestibularSafetyManager] High vestibular safety violation detected:', violation);
        
        if (violation.element) {
            this.reduceIntensity(violation.element, 0.5);
            this.addWarningOverlay(violation.element, 'high');
        }
        
        if (violation.animationId) {
            this.motionManager.animationController.adjustAnimationIntensity(violation.animationId, 0.5);
        }

        this.stats.vestibularWarnings++;
        this.logIntervention('reduce_intensity', violation);
    }
    
    /**
     * 中違反の処理
     */
    private handleMediumViolation(violation: SafetyViolation): void {
        console.warn('[VestibularSafetyManager] Medium vestibular safety violation detected:', violation);
        
        if (violation.element) {
            this.reduceIntensity(violation.element, 0.7);
        }
        
        if (violation.animationId) {
            this.motionManager.animationController.adjustAnimationIntensity(violation.animationId, 0.7);
        }

        this.logIntervention('reduce_intensity', violation);
    }
    
    /**
     * 低違反の処理
     */
    private handleLowViolation(violation: SafetyViolation): void {
        console.info('[VestibularSafetyManager] Low vestibular safety violation detected:', violation);
        
        if (violation.element) {
            this.reduceIntensity(violation.element, 0.85);
        }

        this.logIntervention('reduce_intensity', violation);
    }
    
    /**
     * 即座停止
     */
    private immediateStop(element: HTMLElement): void {
        try {
            element.style.animationPlayState = 'paused';
            element.style.transition = 'none';
            element.style.transform = 'none';
            this.safetyMonitor.interventionCount++;
        } catch (error) {
            console.error('[VestibularSafetyManager] Error in immediate stop:', error);
        }
    }
    
    /**
     * 強度軽減
     */
    private reduceIntensity(element: HTMLElement, multiplier: number): void {
        try {
            const currentDuration = parseFloat(getComputedStyle(element).animationDuration) || 1;
            const newDuration = currentDuration / multiplier; // 遅くする
            element.style.animationDuration = `${newDuration}s`;
            element.style.setProperty('--motion-intensity', multiplier.toString());
            this.safetyMonitor.interventionCount++;
        } catch (error) {
            console.error('[VestibularSafetyManager] Error reducing intensity:', error);
        }
    }
    
    /**
     * 警告オーバーレイの追加
     */
    private addWarningOverlay(element: HTMLElement, severity: ViolationSeverity): void {
        if(element.classList.contains('motion-warning')) {
            return;
        }

        try {
            element.classList.add('motion-warning');
            const overlay = document.createElement('div');
            overlay.className = `motion-safety-overlay ${severity}`;

            overlay.innerHTML = `
                <div class="warning-content">
                    <span class="warning-icon">⚠️</span>
                    <span class="warning-text">激しいモーション</span>
                    <button class="warning-dismiss" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
            `;
            
            const colors = {
                low: '#ffa502',
                medium: '#ff6348',
                high: '#ff4757',
                critical: '#c44569'
            };
            
            overlay.style.cssText = `
                position: absolute;
                top: -30px;
                left: 0;
                background: ${colors[severity]};
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 9999;
                pointer-events: auto;
            `;

            element.style.position = 'relative';
            element.appendChild(overlay);
            
            // 自動削除
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, DEFAULT_WARNING_DURATION);

        } catch (error) {
            console.error('[VestibularSafetyManager] Error adding warning overlay:', error);
        }
    }
    
    /**
     * 安全性アラートの表示
     */
    private showSafetyAlert(message: string): void {
        try {
            const alert = document.createElement('div');
            alert.className = 'vestibular-safety-alert';

            alert.innerHTML = `
                <div class="alert-content">
                    <h3>前庭安全性警告</h3>
                    <p>${message}</p>
                    <button onclick="this.parentElement.parentElement.remove()">閉じる</button>
                </div>
            `;
            
            alert.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff4757;
                color: white;
                padding: 15px;
                border-radius: 8px;
                max-width: 300px;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            
            document.body.appendChild(alert);
            
            // 自動削除
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.parentNode.removeChild(alert);
                }
            }, DEFAULT_ALERT_DURATION);

        } catch (error) {
            console.error('[VestibularSafetyManager] Error showing safety alert:', error);
        }
    }
    
    /**
     * 緊急停止
     */
    emergencyStop(): void {
        console.warn('[VestibularSafetyManager] EMERGENCY STOP: Vestibular safety violation threshold exceeded');
        
        try {
            // すべてのアニメーションを停止
            this.motionManager.animationController.pauseAllAnimations();
            this.motionManager.configManager.setMotionLevel('none');
            
            // 危険パターンをリセット
            Object.values(this.hazardPatterns).forEach(pattern => {
                pattern.detected = false;
            });
            
            // 緊急停止通知
            this.showSafetyAlert('緊急停止：安全性違反が閾値を超えました。すべてのモーションを停止しました。');
            this.safetyMonitor.interventionCount++;
            this.stats.vestibularWarnings++;
            
            // 緊急停止をログに記録
            this.logIntervention('emergency_stop', {
                type: ['multiple_violations'],
                severity: 'critical'
            });

        } catch (error) {
            console.error('[VestibularSafetyManager] Error during emergency stop:', error);
        }
    }
    
    /**
     * 介入ログの記録
     */
    private logIntervention(type: InterventionType, violation: Partial<SafetyViolation>): void {
        const log: SafetyInterventionLog = {
            timestamp: Date.now(),
            type,
            target: violation.element?.tagName || violation.animationId || 'unknown',
            severity: violation.severity || 'low',
            action: this.getInterventionDescription(type),
            success: true
        };
        
        this.interventionLog.push(log);
        
        // ログサイズの制限
        if (this.interventionLog.length > 100) {
            this.interventionLog.shift();
        }
    }
    
    /**
     * 介入説明の取得
     */
    private getInterventionDescription(type: InterventionType): string {
        const descriptions = {
            immediate_stop: 'アニメーション即時停止',
            reduce_intensity: 'アニメーション強度軽減',
            add_warning: '警告オーバーレイ追加',
            pause_animation: 'アニメーション一時停止',
            emergency_stop: '緊急停止実行',
            threshold_adjustment: '閾値調整'
        };
        return descriptions[type] || '不明な介入';
    }
    
    /**
     * 安全性統計の取得
     */
    getSafetyStats(): SafetyStats {
        return {
            monitoring: this.safetyMonitor.enabled,
            violations: this.safetyMonitor.violationCount,
            interventions: this.safetyMonitor.interventionCount,
            hazardPatterns: Object.entries(this.hazardPatterns).reduce((acc, [key, value]) => {
                acc[key] = value.detected;
                return acc;
            }, {} as Record<string, boolean>),
            thresholds: { ...this.safetyThresholds },
            totalWarnings: this.stats.vestibularWarnings
        };
    }
    
    /**
     * 安全性設定の更新
     */
    updateSafetyThresholds(newThresholds: Partial<SafetyThresholds>): boolean {
        try {
            Object.entries(newThresholds).forEach(([key, value]) => {
                if (isValidThreshold(value)) {
                    (this.safetyThresholds as any)[key] = value;
                }
            });

            console.log('[VestibularSafetyManager] Safety thresholds updated:', this.safetyThresholds);
            return true;
        } catch (error) {
            console.error('[VestibularSafetyManager] Error updating thresholds:', error);
            return false;
        }
    }
    
    /**
     * 介入ログの取得
     */
    getInterventionLog(): SafetyInterventionLog[] {
        return [...this.interventionLog];
    }
    
    /**
     * 介入ログのクリア
     */
    clearInterventionLog(): void {
        this.interventionLog = [];
        console.log('[VestibularSafetyManager] Intervention log cleared');
    }
    
    /**
     * アクティブアラートの取得
     */
    getActiveAlerts(): SafetyAlert[] {
        return Array.from(this.activeAlerts.values());
    }
    
    /**
     * コンポーネントクリーンアップ
     */
    destroy(): void {
        try {
            // 監視停止
            this.pauseSafetyMonitoring();
            
            // イベントリスナーの削除
            this.eventListeners.forEach(({ event, handler }) => {
                if (event === 'keydown' || event === 'visibilitychange') {
                    document.removeEventListener(event, handler);
                } else {
                    window.removeEventListener(event, handler);
                }
            });
            this.eventListeners.clear();
            
            // 警告オーバーレイの削除
            document.querySelectorAll('.motion-warning').forEach(element => {
                element.classList.remove('motion-warning');
                element.querySelectorAll('.motion-safety-overlay').forEach(overlay => {
                    overlay.remove();
                });
            });
            
            // アクティブアラートのクリア
            this.activeAlerts.clear();
            
            console.log('[VestibularSafetyManager] Component destroyed');

        } catch (error) {
            console.error('[VestibularSafetyManager] Error during cleanup:', error);
        }
    }
}