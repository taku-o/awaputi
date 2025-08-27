/**
 * VestibularSafetyManager
 * 前庭障害配慮、モーション安全性検証、自動軽減機能
 */
export class VestibularSafetyManager {
    constructor(motionManager) {
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
        
        // 安全性監視
        this.safetyMonitor = {
            enabled: true,
            checkInterval: 100, // ms
            lastCheck: 0,
            violationCount: 0,
            interventionCount: 0
        };
        
        // 安全性閾値
        this.safetyThresholds = {
            ...this.config.vestibularGuidelines,
            // 拡張閾値
            maxVelocity: 500,        // ピクセル/秒
            maxAcceleration: 1000,   // ピクセル/秒²
            maxJerk: 2000,           // ピクセル/秒³
            dangerZoneSize: 50,      // ピクセル
            emergencyStopTrigger: 10 // 連続違反回数
        };
        
        // イベントリスナー
        this.eventListeners = new Set();
        
        console.log('[VestibularSafetyManager] Component initialized');
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // キーボードショートカット
        const emergencyStopHandler = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'M') {
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
            if (document.visibilityState === 'visible') {
                this.resumeSafetyMonitoring();
            } else {
                this.pauseSafetyMonitoring();
            }
        };
        
        document.addEventListener('visibilitychange', visibilityHandler);
        this.eventListeners.add({ event: 'visibilitychange', handler: visibilityHandler });
    }
    
    /**
     * 安全性監視の開始
     */
    startSafetyMonitoring() {
        if (!this.safetyMonitor.enabled) return;
        
        const monitor = () => {
            const now = performance.now();
            
            if (now - this.safetyMonitor.lastCheck >= this.safetyMonitor.checkInterval) {
                this.checkVestibularSafety();
                this.safetyMonitor.lastCheck = now;
            }
            
            requestAnimationFrame(monitor);
        };
        
        requestAnimationFrame(monitor);
        console.log('Vestibular safety monitoring started');
    }
    
    /**
     * 安全性監視の一時停止
     */
    pauseSafetyMonitoring() {
        this.safetyMonitor.enabled = false;
        console.log('Vestibular safety monitoring paused');
    }
    
    /**
     * 安全性監視の再開
     */
    resumeSafetyMonitoring() {
        this.safetyMonitor.enabled = true;
        this.startSafetyMonitoring();
        console.log('Vestibular safety monitoring resumed');
    }
    
    /**
     * 前庭安全性のチェック
     */
    checkVestibularSafety() {
        if (!this.config.vestibularSafety) return;
        
        const violations = [];
        
        // アクティブアニメーションの検証
        this.motionManager.activeAnimations.forEach((animation, id) => {
            const violation = this.checkAnimationSafety(animation);
            if (violation) {
                violations.push({ animationId: id, ...violation });
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
        
        return violations;
    }
    
    /**
     * アニメーション安全性の検証
     */
    checkAnimationSafety(animation) {
        const element = animation.element;
        const computedStyle = getComputedStyle(element);
        const violation = { type: [], severity: 'low' };
        
        // Transform 検証
        const transform = computedStyle.transform;
        if (transform && transform !== 'none') {
            // 回転速度
            const rotationMatch = transform.match(/rotate\(([0-9.-]+)deg\)/);
            if (rotationMatch) {
                const rotation = Math.abs(parseFloat(rotationMatch[1]));
                const duration = parseFloat(computedStyle.animationDuration) || 1;
                const rotationSpeed = rotation / duration;
                
                if (rotationSpeed > this.safetyThresholds.maxRotationSpeed) {
                    violation.type.push('excessive_rotation');
                    violation.severity = 'high';
                }
            }
            
            // スケール変更
            const scaleMatch = transform.match(/scale\(([0-9.]+)\)/);
            if (scaleMatch) {
                const scale = parseFloat(scaleMatch[1]);
                if (scale > this.safetyThresholds.maxScaleChange || scale < 1/this.safetyThresholds.maxScaleChange) {
                    violation.type.push('excessive_scaling');
                    violation.severity = violation.severity === 'high' ? 'high' : 'medium';
                }
            }
            
            // 移動距離
            const translateMatch = transform.match(/translate[XY]?\(([0-9.-]+)px\)/);
            if (translateMatch) {
                const translate = Math.abs(parseFloat(translateMatch[1]));
                if (translate > this.safetyThresholds.maxParallaxDistance) {
                    violation.type.push('excessive_translation');
                    violation.severity = violation.severity === 'high' ? 'high' : 'medium';
                }
            }
        }
        
        // アニメーション反復
        const iterationCount = computedStyle.animationIterationCount;
        if (iterationCount === 'infinite') {
            violation.type.push('infinite_animation');
            violation.severity = violation.severity === 'high' ? 'high' : 'medium';
        }
        
        return violation.type.length > 0 ? violation : null;
    }
    
    /**
     * DOM要素の安全性検証
     */
    checkDOMElementsSafety(violations) {
        // 点滅要素の検出
        const blinkingElements = document.querySelectorAll('[style*="animation"], .blinking, .flash');
        
        blinkingElements.forEach(element => {
            const animationName = getComputedStyle(element).animationName;
            if (animationName && animationName.includes('blink')) {
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
        });
        
        // 大きな要素の移動
        const movingElements = document.querySelectorAll('[style*="transform"], .moving, .sliding');
        
        movingElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isLarge = rect.width > window.innerWidth * 0.5 || rect.height > window.innerHeight * 0.5;
            
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
        });
    }
    
    /**
     * 危険パターンの検出
     */
    detectHazardousPatterns(violations) {
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
        if (violentShaking > 1) { // 複数要素で発生
            this.hazardPatterns.violentShaking.detected = true;
        }
    }
    
    /**
     * 安全性違反の処理
     */
    handleSafetyViolations(violations) {
        this.safetyMonitor.violationCount += violations.length;
        
        violations.forEach(violation => {
            switch (violation.severity) {
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
        });
        
        // 連続違反の場合、緊急停止
        if (this.safetyMonitor.violationCount > this.safetyThresholds.emergencyStopTrigger) {
            this.emergencyStop();
        }
    }
    
    /**
     * 重大違反の処理
     */
    handleCriticalViolation(violation) {
        console.error('Critical vestibular safety violation detected:', violation);
        
        if (violation.element) {
            this.immediateStop(violation.element);
            this.addWarningOverlay(violation.element, 'critical');
        }
        
        if (violation.animationId) {
            this.motionManager.animationController.pauseAnimation(violation.animationId);
        }
        
        this.showSafetyAlert('重大なモーション違反が検出されました。該当するアニメーションを停止しました。');
        this.stats.vestibularWarnings++;
    }
    
    /**
     * 高違反の処理
     */
    handleHighViolation(violation) {
        console.warn('High vestibular safety violation detected:', violation);
        
        if (violation.element) {
            this.reduceIntensity(violation.element, 0.5);
            this.addWarningOverlay(violation.element, 'high');
        }
        
        if (violation.animationId) {
            this.motionManager.animationController.adjustAnimationIntensity(violation.animationId, 0.5);
        }
        
        this.stats.vestibularWarnings++;
    }
    
    /**
     * 中違反の処理
     */
    handleMediumViolation(violation) {
        console.warn('Medium vestibular safety violation detected:', violation);
        
        if (violation.element) {
            this.reduceIntensity(violation.element, 0.7);
        }
        
        if (violation.animationId) {
            this.motionManager.animationController.adjustAnimationIntensity(violation.animationId, 0.7);
        }
    }
    
    /**
     * 低違反の処理
     */
    handleLowViolation(violation) {
        console.info('Low vestibular safety violation detected:', violation);
        
        if (violation.element) {
            this.reduceIntensity(violation.element, 0.85);
        }
    }
    
    /**
     * 即座停止
     */
    immediateStop(element) {
        element.style.animationPlayState = 'paused';
        element.style.transition = 'none';
        element.style.transform = 'none';
        
        this.safetyMonitor.interventionCount++;
    }
    
    /**
     * 強度軽減
     */
    reduceIntensity(element, multiplier) {
        const currentDuration = parseFloat(getComputedStyle(element).animationDuration) || 1;
        const newDuration = currentDuration / multiplier; // 遅くする
        
        element.style.animationDuration = `${newDuration}s`;
        element.style.setProperty('--motion-intensity', multiplier.toString());
        
        this.safetyMonitor.interventionCount++;
    }
    
    /**
     * 警告オーバーレイの追加
     */
    addWarningOverlay(element, severity) {
        if (element.classList.contains('motion-warning')) return;
        
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
        
        overlay.style.cssText = `
            position: absolute;
            top: -30px;
            left: 0;
            background: ${severity === 'critical' ? '#ff4757' : '#ffa502'};
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
        }, 5000);
    }
    
    /**
     * 安全性アラートの表示
     */
    showSafetyAlert(message) {
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
        }, 10000);
    }
    
    /**
     * 緊急停止
     */
    emergencyStop() {
        console.warn('EMERGENCY STOP: Vestibular safety violation threshold exceeded');
        
        // すべてのアニメーションを停止
        this.motionManager.animationController.pauseAllAnimations();
        
        // モーションレベルを最小に
        this.motionManager.configManager.setMotionLevel('none');
        
        // 危険パターンをリセット
        Object.values(this.hazardPatterns).forEach(pattern => {
            pattern.detected = false;
        });
        
        // 緊急停止通知
        this.showSafetyAlert('緊急停止：安全性違反が閾値を超えました。すべてのモーションを停止しました。');
        
        this.safetyMonitor.interventionCount++;
        this.stats.vestibularWarnings++;
    }
    
    /**
     * 安全性統計の取得
     */
    getSafetyStats() {
        return {
            monitoring: this.safetyMonitor.enabled,
            violations: this.safetyMonitor.violationCount,
            interventions: this.safetyMonitor.interventionCount,
            hazardPatterns: Object.entries(this.hazardPatterns).reduce((acc, [key, value]) => {
                acc[key] = value.detected;
                return acc;
            }, {}),
            thresholds: this.safetyThresholds,
            totalWarnings: this.stats.vestibularWarnings
        };
    }
    
    /**
     * 安全性設定の更新
     */
    updateSafetyThresholds(newThresholds) {
        Object.assign(this.safetyThresholds, newThresholds);
        console.log('Safety thresholds updated:', this.safetyThresholds);
    }
    
    /**
     * コンポーネントクリーンアップ
     */
    destroy() {
        // イベントリスナーの削除
        this.eventListeners.forEach(({ event, handler }) => {
            if (event === 'keydown' || event === 'visibilitychange') {
                document.removeEventListener(event, handler);
            } else {
                window.removeEventListener(event, handler);
            }
        });
        this.eventListeners.clear();
        
        // 監視停止
        this.pauseSafetyMonitoring();
        
        // 警告オーバーレイの削除
        document.querySelectorAll('.motion-warning').forEach(element => {
            element.classList.remove('motion-warning');
            element.querySelectorAll('.motion-safety-overlay').forEach(overlay => {
                overlay.remove();
            });
        });
        
        console.log('[VestibularSafetyManager] Component destroyed');
    }
}