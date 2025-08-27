/**
 * Data Management State Manager
 * データ管理UI状態管理システム - UI状態、ダイアログ、操作状態の管理
 */

/**
 * UI State Manager
 * UI状態管理器 - 基本的なUI状態とナビゲーション
 */
export class UIStateManager {
    constructor() {
        // UI状態管理
        this.isVisible = false;
        this.currentView = 'overview'; // 'overview', 'backup', 'export', 'import', 'clear'
        this.selectedItem = 0;
        this.scrollPosition = 0;
        
        // エラー状態
        this.errorMessage = null;
        this.errorTimeout = null;
        
        // 状態変更コールバック
        this.stateChangeCallbacks = [];
    }

    setVisible(visible) {
        if (this.isVisible !== visible) {
            this.isVisible = visible;
            this.notifyStateChange('visibility', { visible });
        }
    }

    isUIVisible() {
        return this.isVisible;
    }

    setCurrentView(view) {
        if (this.currentView !== view) {
            this.currentView = view;
            this.selectedItem = 0; // Reset selection when changing view
            this.notifyStateChange('view', { view });
        }
    }

    getCurrentView() {
        return this.currentView;
    }

    setSelectedItem(index) {
        if (this.selectedItem !== index) {
            this.selectedItem = index;
            this.notifyStateChange('selection', { index });
        }
    }

    getSelectedItem() {
        return this.selectedItem;
    }

    setScrollPosition(position) {
        this.scrollPosition = Math.max(0, position);
        this.notifyStateChange('scroll', { position: this.scrollPosition });
    }

    getScrollPosition() {
        return this.scrollPosition;
    }

    scrollUp() {
        this.setScrollPosition(this.scrollPosition - 1);
    }

    scrollDown() {
        this.setScrollPosition(this.scrollPosition + 1);
    }

    moveSelectionUp() {
        this.setSelectedItem(Math.max(0, this.selectedItem - 1));
    }

    moveSelectionDown(maxItems) {
        this.setSelectedItem(Math.min(maxItems - 1, this.selectedItem + 1));
    }

    showError(message, duration = 5000) {
        this.errorMessage = message;
        this.notifyStateChange('error', { message });

        if (this.errorTimeout) {
            clearTimeout(this.errorTimeout);
        }

        this.errorTimeout = setTimeout(() => {
            this.clearError();
        }, duration);
    }

    clearError() {
        if (this.errorMessage) {
            this.errorMessage = null;
            this.notifyStateChange('error', { message: null });
        }

        if (this.errorTimeout) {
            clearTimeout(this.errorTimeout);
            this.errorTimeout = null;
        }
    }

    getError() {
        return this.errorMessage;
    }

    onStateChange(callback) {
        this.stateChangeCallbacks.push(callback);
    }

    notifyStateChange(type, data) {
        this.stateChangeCallbacks.forEach(callback => {
            try {
                callback(type, data);
            } catch (error) {
                console.error('State change callback error:', error);
            }
        });
    }

    getState() {
        return {
            isVisible: this.isVisible,
            currentView: this.currentView,
            selectedItem: this.selectedItem,
            scrollPosition: this.scrollPosition,
            errorMessage: this.errorMessage
        };
    }

    reset() {
        this.isVisible = false;
        this.currentView = 'overview';
        this.selectedItem = 0;
        this.scrollPosition = 0;
        this.clearError();
        this.notifyStateChange('reset', {});
    }
}

/**
 * Dialog State Manager
 * ダイアログ状態管理器 - モーダルダイアログの状態管理
 */
export class DialogStateManager {
    constructor() {
        // ダイアログ状態
        this.showingDialog = null; // null, 'backup', 'export', 'import', 'clear', 'progress'
        this.dialogData = {};
        this.dialogInput = '';
        this.dialogCallbacks = [];
        
        // 履歴管理
        this.dialogHistory = [];
        this.maxHistorySize = 10;
    }

    showDialog(type, data = {}) {
        if (this.showingDialog) {
            this.hideDialog(); // Close current dialog first
        }

        this.showingDialog = type;
        this.dialogData = { ...data };
        this.dialogInput = data.defaultInput || '';
        
        // Add to history
        this.addToHistory({ type, data, timestamp: Date.now() });
        
        this.notifyDialogChange('show', { type, data });
    }

    hideDialog() {
        if (this.showingDialog) {
            const previousType = this.showingDialog;
            this.showingDialog = null;
            this.dialogData = {};
            this.dialogInput = '';
            
            this.notifyDialogChange('hide', { previousType });
        }
    }

    getDialogType() {
        return this.showingDialog;
    }

    getDialogData() {
        return { ...this.dialogData };
    }

    setDialogData(data) {
        this.dialogData = { ...this.dialogData, ...data };
        this.notifyDialogChange('dataUpdate', { data: this.dialogData });
    }

    getDialogInput() {
        return this.dialogInput;
    }

    setDialogInput(input) {
        this.dialogInput = input;
        this.notifyDialogChange('inputUpdate', { input });
    }

    isDialogVisible() {
        return this.showingDialog !== null;
    }

    isSpecificDialogVisible(type) {
        return this.showingDialog === type;
    }

    addToHistory(entry) {
        this.dialogHistory.push(entry);
        
        if (this.dialogHistory.length > this.maxHistorySize) {
            this.dialogHistory.shift();
        }
    }

    getDialogHistory() {
        return [...this.dialogHistory];
    }

    onDialogChange(callback) {
        this.dialogCallbacks.push(callback);
    }

    notifyDialogChange(action, data) {
        this.dialogCallbacks.forEach(callback => {
            try {
                callback(action, data);
            } catch (error) {
                console.error('Dialog change callback error:', error);
            }
        });
    }

    getState() {
        return {
            showingDialog: this.showingDialog,
            dialogData: this.dialogData,
            dialogInput: this.dialogInput,
            isVisible: this.isDialogVisible()
        };
    }

    reset() {
        this.hideDialog();
        this.dialogHistory.length = 0;
    }
}

/**
 * Operation State Manager
 * 操作状態管理器 - 非同期操作の進行状況管理
 */
export class OperationStateManager {
    constructor() {
        // 操作状態
        this.operationInProgress = false;
        this.operationType = null;
        this.operationProgress = 0;
        this.operationMessage = '';
        this.operationStartTime = null;
        this.operationTimeout = null;
        
        // 操作履歴
        this.operationHistory = [];
        this.maxHistorySize = 50;
        
        // コールバック
        this.operationCallbacks = [];
    }

    startOperation(type, message = '', timeout = 300000) { // 5 minutes default
        if (this.operationInProgress) {
            this.endOperation('cancelled', 'New operation started');
        }

        this.operationInProgress = true;
        this.operationType = type;
        this.operationProgress = 0;
        this.operationMessage = message;
        this.operationStartTime = Date.now();
        
        // Set timeout for operation
        if (timeout > 0) {
            this.operationTimeout = setTimeout(() => {
                this.endOperation('timeout', 'Operation timed out');
            }, timeout);
        }

        this.notifyOperationChange('start', {
            type,
            message,
            startTime: this.operationStartTime
        });
    }

    updateOperation(progress, message = '') {
        if (!this.operationInProgress) return;

        this.operationProgress = Math.max(0, Math.min(100, progress));
        if (message) {
            this.operationMessage = message;
        }

        this.notifyOperationChange('progress', {
            progress: this.operationProgress,
            message: this.operationMessage
        });
    }

    endOperation(result = 'success', message = '', data = {}) {
        if (!this.operationInProgress) return;

        const duration = Date.now() - this.operationStartTime;
        
        // Clear timeout
        if (this.operationTimeout) {
            clearTimeout(this.operationTimeout);
            this.operationTimeout = null;
        }

        // Add to history
        this.addOperationToHistory({
            type: this.operationType,
            result,
            message,
            duration,
            startTime: this.operationStartTime,
            endTime: Date.now(),
            data
        });

        // Reset state
        this.operationInProgress = false;
        this.operationType = null;
        this.operationProgress = 0;
        this.operationMessage = '';
        this.operationStartTime = null;

        this.notifyOperationChange('end', {
            result,
            message,
            duration,
            data
        });
    }

    isOperationInProgress() {
        return this.operationInProgress;
    }

    getOperationType() {
        return this.operationType;
    }

    getOperationProgress() {
        return this.operationProgress;
    }

    getOperationMessage() {
        return this.operationMessage;
    }

    getOperationDuration() {
        return this.operationStartTime ? Date.now() - this.operationStartTime : 0;
    }

    addOperationToHistory(operation) {
        this.operationHistory.push(operation);
        
        if (this.operationHistory.length > this.maxHistorySize) {
            this.operationHistory.shift();
        }
    }

    getOperationHistory() {
        return [...this.operationHistory];
    }

    getLastOperation() {
        return this.operationHistory[this.operationHistory.length - 1] || null;
    }

    getOperationsByType(type) {
        return this.operationHistory.filter(op => op.type === type);
    }

    onOperationChange(callback) {
        this.operationCallbacks.push(callback);
    }

    notifyOperationChange(action, data) {
        this.operationCallbacks.forEach(callback => {
            try {
                callback(action, data);
            } catch (error) {
                console.error('Operation change callback error:', error);
            }
        });
    }

    getState() {
        return {
            operationInProgress: this.operationInProgress,
            operationType: this.operationType,
            operationProgress: this.operationProgress,
            operationMessage: this.operationMessage,
            operationDuration: this.getOperationDuration()
        };
    }

    reset() {
        if (this.operationInProgress) {
            this.endOperation('cancelled', 'State reset');
        }
        this.operationHistory.length = 0;
    }
}

/**
 * Backup Status Manager
 * バックアップ状況管理器 - バックアップ関連データの管理
 */
export class BackupStatusManager {
    constructor() {
        // バックアップ状況データ
        this.backupStatus = {
            lastBackup: null,
            backupCount: 0,
            totalSize: 0,
            autoBackupEnabled: true,
            nextBackup: null,
            backupHistory: []
        };
        
        // 更新コールバック
        this.updateCallbacks = [];
        
        // 定期更新タイマー
        this.updateInterval = null;
    }

    async initialize(dataManager) {
        this.dataManager = dataManager;
        
        try {
            await this.loadBackupStatus();
            this.startPeriodicUpdates();
        } catch (error) {
            console.error('Failed to initialize backup status:', error);
        }
    }

    async loadBackupStatus() {
        try {
            if (!this.dataManager?.backup) {
                // Use default values if backup manager not available
                return;
            }

            // Get status from BackupManager
            const status = await this.dataManager.backup.getStatus();
            this.backupStatus = {
                lastBackup: status.lastBackup,
                backupCount: status.backupCount || 0,
                totalSize: status.totalSize || 0,
                autoBackupEnabled: status.autoBackupEnabled !== false,
                nextBackup: status.nextBackup,
                backupHistory: status.backupHistory || []
            };

            this.notifyUpdate('loaded', this.backupStatus);
            
        } catch (error) {
            console.error('Failed to load backup status:', error);
            this.notifyUpdate('error', { error: error.message });
        }
    }

    getBackupStatus() {
        return { ...this.backupStatus };
    }

    updateBackupStatus(updates) {
        const previous = { ...this.backupStatus };
        this.backupStatus = { ...this.backupStatus, ...updates };
        
        this.notifyUpdate('updated', {
            previous,
            current: this.backupStatus,
            changes: updates
        });
    }

    getLastBackupTime() {
        return this.backupStatus.lastBackup;
    }

    getBackupCount() {
        return this.backupStatus.backupCount;
    }

    getTotalBackupSize() {
        return this.backupStatus.totalSize;
    }

    isAutoBackupEnabled() {
        return this.backupStatus.autoBackupEnabled;
    }

    getNextBackupTime() {
        return this.backupStatus.nextBackup;
    }

    getBackupHistory() {
        return [...(this.backupStatus.backupHistory || [])];
    }

    addBackupToHistory(backupInfo) {
        if (!this.backupStatus.backupHistory) {
            this.backupStatus.backupHistory = [];
        }

        this.backupStatus.backupHistory.push({
            ...backupInfo,
            timestamp: Date.now()
        });

        // Keep only last 20 backups
        if (this.backupStatus.backupHistory.length > 20) {
            this.backupStatus.backupHistory.shift();
        }

        this.updateBackupStatus({
            lastBackup: backupInfo.timestamp || Date.now(),
            backupCount: this.backupStatus.backupCount + 1,
            totalSize: this.backupStatus.totalSize + (backupInfo.size || 0)
        });
    }

    formatBackupSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    formatBackupTime(timestamp) {
        if (!timestamp) return 'Never';
        
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else {
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            return diffMinutes > 0 ? `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago` : 'Just now';
        }
    }

    startPeriodicUpdates(interval = 30000) { // 30 seconds
        this.stopPeriodicUpdates();
        
        this.updateInterval = setInterval(() => {
            this.loadBackupStatus().catch(error => {
                console.error('Periodic backup status update failed:', error);
            });
        }, interval);
    }

    stopPeriodicUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    onUpdate(callback) {
        this.updateCallbacks.push(callback);
    }

    notifyUpdate(action, data) {
        this.updateCallbacks.forEach(callback => {
            try {
                callback(action, data);
            } catch (error) {
                console.error('Backup status update callback error:', error);
            }
        });
    }

    destroy() {
        this.stopPeriodicUpdates();
        this.updateCallbacks.length = 0;
    }
}