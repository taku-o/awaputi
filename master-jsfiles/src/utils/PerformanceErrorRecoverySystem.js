/**
 * Performance Error Handling and Recovery System (Refactored)
 * パフォーマンスエラー検出・回復とユーザー通信システム - メインコントローラー
 * 
 * サブコンポーネント化により責任を分離し、保守性を向上
 * - ErrorDetectionSystem: エラー検出と分類システム
 * - RecoveryExecutionSystem: 回復実行と劣化管理システム
 * 
 * Requirements: 10.1, 10.2, 3.4, 10.4
 */

import { PerformanceErrorDetector, PerformanceErrorClassifier } from './performance-error-recovery-system/ErrorDetectionSystem.js';
import { PerformanceRecoveryEngine, GracefulDegradationManager } from './performance-error-recovery-system/RecoveryExecutionSystem.js';

export class PerformanceErrorRecoverySystem {
    constructor() {
        // Initialize sub-components
        this._initializeSubComponents();
        
        // Additional helper components (simplified)
        this.userCommunicator = new PerformanceUserCommunicator();
        this.troubleshootingGuide = new TroubleshootingGuide();
        this.errorLogger = new PerformanceErrorLogger();
        this.monitoringIntegration = new ErrorMonitoringIntegration();
        
        this.initialized = false;
        this.initializeErrorRecovery();
    }

    /**
     * Initialize sub-component systems
     * @private
     */
    _initializeSubComponents() {
        try {
            // Initialize detection system
            this.errorDetector = new PerformanceErrorDetector();
            this.errorClassifier = new PerformanceErrorClassifier();
            
            // Initialize recovery system
            this.recoveryEngine = new PerformanceRecoveryEngine();
            this.degradationManager = new GracefulDegradationManager();
            
        } catch (error) {
            console.error('Failed to initialize error recovery sub-components:', error);
        }
    }

    async initializeErrorRecovery() {
        try {
            await this.errorDetector.initialize();
            await this.errorClassifier.initialize();
            await this.recoveryEngine.initialize();
            await this.degradationManager.initialize();
            await this.userCommunicator.initialize();
            await this.troubleshootingGuide.initialize();
            await this.errorLogger.initialize();
            await this.monitoringIntegration.initialize();
            
            // システム統合の設定
            await this.setupSystemIntegration();
            
            this.initialized = true;
            console.log('PerformanceErrorRecoverySystem initialized successfully');
        } catch (error) {
            console.error('Failed to initialize PerformanceErrorRecoverySystem:', error);
            throw error;
        }
    }

    async setupSystemIntegration() {
        // エラー検出と分類の連携
        this.errorDetector.onErrorDetected((error) => {
            this.handleDetectedError(error);
        });

        // 回復エンジンと劣化管理の連携
        this.recoveryEngine.onRecoveryFailed((error, attemptedRecovery) => {
            this.degradationManager.initiateDegradation(error, attemptedRecovery);
        });

        // ユーザー通信と監視システムの連携
        this.monitoringIntegration.onCriticalError((error) => {
            this.userCommunicator.notifyCriticalError(error);
        });
    }

    async handleDetectedError(detectedError) {
        try {
            // エラーのログ記録
            await this.errorLogger.logError(detectedError);
            
            // エラーの分類
            const classifiedError = await this.errorClassifier.classify(detectedError);
            
            // 回復戦略の決定と実行
            const recoveryStrategy = await this.recoveryEngine.determineStrategy(classifiedError);
            const recoveryResult = await this.recoveryEngine.executeRecovery(recoveryStrategy);
            
            // 回復結果の評価
            if (recoveryResult.success) {
                // 成功した回復の通知
                await this.userCommunicator.notifyRecoverySuccess(classifiedError, recoveryResult);
                await this.errorLogger.logRecoverySuccess(classifiedError, recoveryResult);
            } else {
                // 回復失敗時の劣化処理
                await this.handleRecoveryFailure(classifiedError, recoveryResult);
            }
            
        } catch (error) {
            console.error('Error handling failed:', error);
            await this.handleCriticalSystemError(error);
        }
    }

    async handleRecoveryFailure(classifiedError, recoveryResult) {
        console.warn('Performance recovery failed:', { classifiedError, recoveryResult });
        
        try {
            // 劣化戦略の実行
            const degradationResult = await this.degradationManager.executeDegradation(
                classifiedError, 
                recoveryResult
            );
            
            // ユーザーへの通知
            await this.userCommunicator.notifyDegradation(classifiedError, degradationResult);
            
            // ログ記録
            await this.errorLogger.logDegradation(classifiedError, degradationResult);
            
        } catch (error) {
            console.error('Degradation handling failed:', error);
            await this.handleCriticalSystemError(error);
        }
    }

    async handleCriticalSystemError(error) {
        console.error('Critical system error in PerformanceErrorRecoverySystem:', error);
        
        try {
            // 緊急通知
            await this.userCommunicator.notifySystemEmergency(error);
            
            // 緊急ログ記録
            await this.errorLogger.logCriticalError(error);
            
            // 監視システムへの報告
            await this.monitoringIntegration.reportCriticalError(error);
            
        } catch (emergencyError) {
            console.error('Emergency handling failed:', emergencyError);
            // 最後の手段として、コンソールのみに出力
            console.error('EMERGENCY: System recovery has failed completely. Manual intervention required.');
        }
    }

    // Public API methods for external integration
    async reportPerformanceIssue(issueData) {
        if (!this.initialized) {
            console.warn('Error recovery system not initialized');
            return;
        }

        const syntheticError = {
            detector: 'external',
            type: issueData.type || 'performance',
            metrics: issueData.metrics || {},
            timestamp: Date.now(),
            external: true,
            ...issueData
        };

        await this.handleDetectedError(syntheticError);
    }

    getSystemStatus() {
        if (!this.initialized) {
            return { status: 'not_initialized' };
        }

        return {
            status: 'operational',
            detectionStatus: this.errorDetector.getDetectionStatus(),
            degradationLevel: this.degradationManager.getCurrentDegradationLevel(),
            recoveryStatistics: this.recoveryEngine.getRecoveryStatistics(),
            degradationStatistics: this.degradationManager.getDegradationStatistics(),
            activeNotifications: this.userCommunicator.getActiveNotifications(),
            uptime: Date.now() - this.initializationTime
        };
    }

    async restorePerformance(targetLevel = 0) {
        if (!this.initialized) {
            throw new Error('System not initialized');
        }

        try {
            const result = await this.degradationManager.restoreToLevel(targetLevel);
            await this.userCommunicator.notifyPerformanceRestoration(result);
            return result;
        } catch (error) {
            console.error('Performance restoration failed:', error);
            throw error;
        }
    }

    // Configuration and management methods
    updateDetectionThresholds(newThresholds) {
        this.errorDetector.updateThresholds(newThresholds);
    }

    enableMonitoring() {
        this.errorDetector.startMonitoring();
    }

    disableMonitoring() {
        this.errorDetector.stopMonitoring();
    }

    // Helper component cleanup
    destroy() {
        if (this.errorDetector) {
            this.errorDetector.stopMonitoring();
        }
        
        if (this.userCommunicator) {
            this.userCommunicator.cleanup();
        }
        
        console.log('PerformanceErrorRecoverySystem destroyed');
    }
}

// Simplified helper components for UI and logging
class PerformanceUserCommunicator {
    constructor() {
        this.notificationContainer = null;
        this.activeNotifications = new Map();
        this.messageTemplates = new Map();
    }

    async initialize() {
        this.createNotificationContainer();
        this.setupMessageTemplates();
        this.setupStyles();
        console.log('User communicator initialized');
    }

    createNotificationContainer() {
        if (typeof document === 'undefined') return;
        
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.id = 'performance-notifications';
        this.notificationContainer.className = 'performance-notifications-container';
        document.body.appendChild(this.notificationContainer);
    }

    setupMessageTemplates() {
        this.messageTemplates.set('recovery_success', {
            title: 'パフォーマンス復旧完了',
            icon: '✅',
            type: 'success'
        });

        this.messageTemplates.set('degradation', {
            title: 'パフォーマンス調整中',
            icon: '⚠️',
            type: 'warning'
        });

        this.messageTemplates.set('critical_error', {
            title: '重要なエラーが発生',
            icon: '🚨',
            type: 'error'
        });
    }

    setupStyles() {
        if (typeof document === 'undefined') return;
        
        const styleId = 'performance-notification-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .performance-notifications-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10001;
                max-width: 400px;
            }
            .performance-notification {
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                margin-bottom: 10px;
                padding: 15px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
        `;
        document.head.appendChild(style);
    }

    async notifyRecoverySuccess(error, result) {
        this.showNotification('recovery_success', `${error.detector}の問題が解決されました`);
    }

    async notifyDegradation(error, result) {
        this.showNotification('degradation', `性能調整中（レベル: ${result.currentLevel}）`);
    }

    async notifyCriticalError(error) {
        this.showNotification('critical_error', `重要なエラー: ${error.type}`);
    }

    async notifySystemEmergency(error) {
        this.showNotification('critical_error', 'システム緊急事態が発生しました');
    }

    async notifyPerformanceRestoration(result) {
        this.showNotification('recovery_success', 'パフォーマンスが復旧されました');
    }

    showNotification(type, message) {
        if (!this.notificationContainer) return;

        const template = this.messageTemplates.get(type);
        if (!template) return;

        const notification = document.createElement('div');
        notification.className = `performance-notification ${template.type}`;
        notification.innerHTML = `
            <div style="font-weight: bold;">${template.icon} ${template.title}</div>
            <div style="margin-top: 5px;">${message}</div>
        `;

        this.notificationContainer.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    getActiveNotifications() {
        return this.activeNotifications.size;
    }

    cleanup() {
        if (this.notificationContainer && this.notificationContainer.parentNode) {
            this.notificationContainer.parentNode.removeChild(this.notificationContainer);
        }
    }
}

class TroubleshootingGuide {
    async initialize() {
        console.log('Troubleshooting guide initialized');
    }

    getGuideForError(error) {
        const guides = {
            frameRate: 'グラフィック設定を下げることを検討してください',
            memory: 'ブラウザタブを閉じてメモリを解放してください',
            network: 'インターネット接続を確認してください'
        };
        
        return guides[error.detector] || '一般的なトラブルシューティングを実行してください';
    }
}

class PerformanceErrorLogger {
    constructor() {
        this.logs = [];
        this.maxLogSize = 100;
    }

    async initialize() {
        console.log('Error logger initialized');
    }

    async logError(error) {
        this.addLog('error', error);
        console.error('Performance error logged:', error);
    }

    async logRecoverySuccess(error, result) {
        this.addLog('recovery_success', { error, result });
        console.log('Recovery success logged:', result);
    }

    async logDegradation(error, result) {
        this.addLog('degradation', { error, result });
        console.warn('Degradation logged:', result);
    }

    async logCriticalError(error) {
        this.addLog('critical', error);
        console.error('Critical error logged:', error);
    }

    addLog(type, data) {
        this.logs.push({
            type,
            data,
            timestamp: Date.now()
        });

        if (this.logs.length > this.maxLogSize) {
            this.logs.shift();
        }
    }

    getLogs() {
        return [...this.logs];
    }
}

class ErrorMonitoringIntegration {
    constructor() {
        this.criticalErrorCallbacks = [];
    }

    async initialize() {
        console.log('Monitoring integration initialized');
    }

    onCriticalError(callback) {
        this.criticalErrorCallbacks.push(callback);
    }

    async reportCriticalError(error) {
        console.error('Reporting critical error to monitoring system:', error);
        
        this.criticalErrorCallbacks.forEach(callback => {
            try {
                callback(error);
            } catch (err) {
                console.error('Critical error callback failed:', err);
            }
        });
    }
}

// Export for backward compatibility
export default PerformanceErrorRecoverySystem;