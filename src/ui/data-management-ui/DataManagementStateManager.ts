/**
 * Data Management State Manager
 * データ管理UI状態管理システム - UI状態、ダイアログ、操作状態の管理
 */

/**
 * State change callback type
 */
type StateChangeCallback = (type: string, data: any) => void;

/**
 * Dialog change callback type
 */
type DialogChangeCallback = (action: string, data: any) => void;

/**
 * Operation change callback type
 */
type OperationChangeCallback = (action: string, data: any) => void;

/**
 * Backup update callback type
 */
type BackupUpdateCallback = (action: string, data: any) => void;

/**
 * UI state interface
 */
interface UIState {
    isVisible: boolean;
    currentView: string;
    selectedItem: number;
    scrollPosition: number;
    errorMessage: string | null;
}

/**
 * Dialog history entry interface
 */
interface DialogHistoryEntry {
    type: string;
    data: any;
    timestamp: number;
}

/**
 * Dialog state interface
 */
interface DialogState {
    showingDialog: string | null;
    dialogData: any;
    dialogInput: string;
    isVisible: boolean;
}

/**
 * Operation history entry interface
 */
interface OperationHistoryEntry {
    type: string;
    result: string;
    message: string;
    duration: number;
    startTime: number;
    endTime: number;
    data: any;
}

/**
 * Operation state interface
 */
interface OperationState {
    operationInProgress: boolean;
    operationType: string | null;
    operationProgress: number;
    operationMessage: string;
    operationDuration: number;
}

/**
 * Backup status interface
 */
interface BackupStatus {
    lastBackup: string | number | Date | null;
    backupCount: number;
    totalSize: number;
    autoBackupEnabled: boolean;
    nextBackup: string | number | Date | null;
    backupHistory: BackupHistoryEntry[];
}

/**
 * Backup history entry interface
 */
interface BackupHistoryEntry {
    timestamp: number;
    size?: number;
    [key: string]: any;
}

/**
 * Data manager interface
 */
interface DataManager {
    backup?: {
        getStatus(): Promise<Partial<BackupStatus>>;
    };
}

/**
 * UI State Manager
 * UI状態管理器 - 基本的なUI状態とナビゲーション
 */
export class UIStateManager {
    private isVisible: boolean = false;
    private currentView: string = 'overview'; // 'overview', 'backup', 'export', 'import', 'clear'
    private selectedItem: number = 0;
    private scrollPosition: number = 0;
    // エラー状態
    private errorMessage: string | null = null;
    private errorTimeout: NodeJS.Timeout | null = null;
    // 状態変更コールバック
    private stateChangeCallbacks: StateChangeCallback[] = [];

    setVisible(visible: boolean): void {
        if (this.isVisible !== visible) {
            this.isVisible = visible;
            this.notifyStateChange('visibility', { visible });
        }
    }

    isUIVisible(): boolean {
        return this.isVisible;
    }

    setCurrentView(view: string): void {
        if (this.currentView !== view) {
            this.currentView = view;
            this.selectedItem = 0; // Reset selection when changing view
            this.notifyStateChange('view', { view });
        }
    }

    getCurrentView(): string {
        return this.currentView;
    }

    setSelectedItem(index: number): void {
        if (this.selectedItem !== index) {
            this.selectedItem = index;
            this.notifyStateChange('selection', { index });
        }
    }

    getSelectedItem(): number {
        return this.selectedItem;
    }

    setScrollPosition(position: number): void {
        this.scrollPosition = Math.max(0, position);
        this.notifyStateChange('scroll', { position: this.scrollPosition });
    }

    getScrollPosition(): number {
        return this.scrollPosition;
    }

    scrollUp(): void {
        this.setScrollPosition(this.scrollPosition - 1);
    }

    scrollDown(): void {
        this.setScrollPosition(this.scrollPosition + 1);
    }

    moveSelectionUp(): void {
        this.setSelectedItem(Math.max(0, this.selectedItem - 1));
    }

    moveSelectionDown(maxItems: number): void {
        this.setSelectedItem(Math.min(maxItems - 1, this.selectedItem + 1));
    }

    showError(message: string, duration: number = 5000): void {
        this.errorMessage = message;
        this.notifyStateChange('error', { message });

        if (this.errorTimeout) {
            clearTimeout(this.errorTimeout);
        }

        this.errorTimeout = setTimeout(() => {
            this.clearError();
        }, duration);
    }

    clearError(): void {
        if (this.errorMessage) {
            this.errorMessage = null;
            this.notifyStateChange('error', { message: null });
        }

        if (this.errorTimeout) {
            clearTimeout(this.errorTimeout);
            this.errorTimeout = null;
        }
    }

    getError(): string | null {
        return this.errorMessage;
    }

    onStateChange(callback: StateChangeCallback): void {
        this.stateChangeCallbacks.push(callback);
    }

    private notifyStateChange(type: string, data: any): void {
        this.stateChangeCallbacks.forEach(callback => {
            try {
                callback(type, data);
            } catch (error) {
                console.error('State change callback error:', error);
            }
        });
    }

    getState(): UIState {
        return {
            isVisible: this.isVisible,
            currentView: this.currentView,
            selectedItem: this.selectedItem,
            scrollPosition: this.scrollPosition,
            errorMessage: this.errorMessage
        };
    }

    reset(): void {
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
    // ダイアログ状態
    private showingDialog: string | null = null; // null, 'backup', 'export', 'import', 'clear', 'progress'
    private dialogData: any = {};
    private dialogInput: string = '';
    private dialogCallbacks: DialogChangeCallback[] = [];
    // 履歴管理
    private dialogHistory: DialogHistoryEntry[] = [];
    private maxHistorySize: number = 10;

    showDialog(type: string, data: any = {}): void {
        if (this.showingDialog) {
            this.hideDialog();
        }

        this.showingDialog = type;
        this.dialogData = { ...data };
        this.dialogInput = data.defaultInput || '';

        // Add to history
        this.addToHistory({
            type,
            data,
            timestamp: Date.now()
        });

        this.notifyDialogChange('show', { type, data });
    }

    hideDialog(): void {
        if (this.showingDialog) {
            const previousType = this.showingDialog;
            this.showingDialog = null;
            this.dialogData = {};
            this.dialogInput = '';
            this.notifyDialogChange('hide', { previousType });
        }
    }

    getDialogType(): string | null {
        return this.showingDialog;
    }

    getDialogData(): any {
        return { ...this.dialogData };
    }

    setDialogData(data: any): void {
        this.dialogData = { ...this.dialogData, ...data };
        this.notifyDialogChange('dataUpdate', { data: this.dialogData });
    }

    getDialogInput(): string {
        return this.dialogInput;
    }

    setDialogInput(input: string): void {
        this.dialogInput = input;
        this.notifyDialogChange('inputUpdate', { input });
    }

    isDialogVisible(): boolean {
        return this.showingDialog !== null;
    }

    isSpecificDialogVisible(type: string): boolean {
        return this.showingDialog === type;
    }

    private addToHistory(entry: DialogHistoryEntry): void {
        this.dialogHistory.push(entry);
        if (this.dialogHistory.length > this.maxHistorySize) {
            this.dialogHistory.shift();
        }
    }

    getDialogHistory(): DialogHistoryEntry[] {
        return [...this.dialogHistory];
    }

    onDialogChange(callback: DialogChangeCallback): void {
        this.dialogCallbacks.push(callback);
    }

    private notifyDialogChange(action: string, data: any): void {
        this.dialogCallbacks.forEach(callback => {
            try {
                callback(action, data);
            } catch (error) {
                console.error('Dialog change callback error:', error);
            }
        });
    }

    getState(): DialogState {
        return {
            showingDialog: this.showingDialog,
            dialogData: this.dialogData,
            dialogInput: this.dialogInput,
            isVisible: this.isDialogVisible()
        };
    }

    reset(): void {
        this.hideDialog();
    }
}

/**
 * Operation State Manager
 * 操作状態管理器 - データ操作の状態とプログレス管理
 */
export class OperationStateManager {
    // 操作状態
    private operationInProgress: boolean = false;
    private operationType: string | null = null;
    private operationProgress: number = 0;
    private operationMessage: string = '';
    private operationStartTime: number | null = null;
    private operationTimeout: NodeJS.Timeout | null = null;
    // 操作履歴
    private operationHistory: OperationHistoryEntry[] = [];
    private maxHistorySize: number = 50;
    // コールバック
    private operationCallbacks: OperationChangeCallback[] = [];

    startOperation(type: string, message: string = '', timeout: number = 300000): void { // 5 minutes default
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

    updateOperation(progress: number, message: string = ''): void {
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

    endOperation(result: string = 'success', message: string = '', data: any = {}): void {
        if (!this.operationInProgress) return;

        const duration = this.operationStartTime ? Date.now() - this.operationStartTime : 0;
        
        // Clear timeout
        if (this.operationTimeout) {
            clearTimeout(this.operationTimeout);
            this.operationTimeout = null;
        }

        // Add to history
        if (this.operationType && this.operationStartTime) {
            this.addOperationToHistory({
                type: this.operationType,
                result,
                message,
                duration,
                startTime: this.operationStartTime,
                endTime: Date.now(),
                data
            });
        }

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

    isOperationInProgress(): boolean {
        return this.operationInProgress;
    }

    getOperationType(): string | null {
        return this.operationType;
    }

    getOperationProgress(): number {
        return this.operationProgress;
    }

    getOperationMessage(): string {
        return this.operationMessage;
    }

    getOperationDuration(): number {
        return this.operationStartTime ? Date.now() - this.operationStartTime : 0;
    }

    private addOperationToHistory(operation: OperationHistoryEntry): void {
        this.operationHistory.push(operation);
        if (this.operationHistory.length > this.maxHistorySize) {
            this.operationHistory.shift();
        }
    }

    getOperationHistory(): OperationHistoryEntry[] {
        return [...this.operationHistory];
    }

    getLastOperation(): OperationHistoryEntry | null {
        return this.operationHistory[this.operationHistory.length - 1] || null;
    }

    getOperationsByType(type: string): OperationHistoryEntry[] {
        return this.operationHistory.filter(op => op.type === type);
    }

    onOperationChange(callback: OperationChangeCallback): void {
        this.operationCallbacks.push(callback);
    }

    private notifyOperationChange(action: string, data: any): void {
        this.operationCallbacks.forEach(callback => {
            try {
                callback(action, data);
            } catch (error) {
                console.error('Operation change callback error:', error);
            }
        });
    }

    getState(): OperationState {
        return {
            operationInProgress: this.operationInProgress,
            operationType: this.operationType,
            operationProgress: this.operationProgress,
            operationMessage: this.operationMessage,
            operationDuration: this.getOperationDuration()
        };
    }

    reset(): void {
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
    // バックアップ状況データ
    private backupStatus: BackupStatus = {
        lastBackup: null,
        backupCount: 0,
        totalSize: 0,
        autoBackupEnabled: true,
        nextBackup: null,
        backupHistory: []
    };
    // 更新コールバック
    private updateCallbacks: BackupUpdateCallback[] = [];
    // 定期更新タイマー
    private updateInterval: NodeJS.Timer | null = null;
    // Data manager reference
    private dataManager: DataManager | undefined;

    async initialize(dataManager: DataManager): Promise<void> {
        this.dataManager = dataManager;
        
        try {
            await this.loadBackupStatus();
            this.startPeriodicUpdates();
        } catch (error) {
            console.error('Failed to initialize backup status:', error);
        }
    }

    async loadBackupStatus(): Promise<void> {
        try {
            if (!this.dataManager?.backup) {
                // Use default values if backup manager not available
                return;
            }

            // Get status from BackupManager
            const status = await this.dataManager.backup.getStatus();
            this.updateBackupStatus(status);

            this.notifyUpdate('loaded', this.backupStatus);

        } catch (error) {
            console.error('Failed to load backup status:', error);
            this.notifyUpdate('error', { error: (error as Error).message });
        }
    }

    getBackupStatus(): BackupStatus {
        return { ...this.backupStatus };
    }

    updateBackupStatus(updates: Partial<BackupStatus>): void {
        const previous = { ...this.backupStatus };
        this.backupStatus = { ...this.backupStatus, ...updates };

        this.notifyUpdate('updated', {
            previous,
            current: this.backupStatus,
            changes: updates
        });
    }

    getLastBackupTime(): string | number | Date | null {
        return this.backupStatus.lastBackup;
    }

    getBackupCount(): number {
        return this.backupStatus.backupCount;
    }

    getTotalBackupSize(): number {
        return this.backupStatus.totalSize;
    }

    isAutoBackupEnabled(): boolean {
        return this.backupStatus.autoBackupEnabled;
    }

    getNextBackupTime(): string | number | Date | null {
        return this.backupStatus.nextBackup;
    }

    getBackupHistory(): BackupHistoryEntry[] {
        return [...(this.backupStatus.backupHistory || [])];
    }

    addBackupToHistory(backupInfo: Partial<BackupHistoryEntry>): void {
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

    formatBackupSize(bytes: number): string {
        if (bytes === 0) return '0 B';

        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    formatBackupTime(timestamp: string | number | Date | null): string {
        if (!timestamp) return 'Never';
        
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
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

    startPeriodicUpdates(interval: number = 30000): void { // 30 seconds
        this.stopPeriodicUpdates();

        this.updateInterval = setInterval(() => {
            this.loadBackupStatus().catch(error => {
                console.error('Periodic backup status update failed:', error);
            });
        }, interval);
    }

    stopPeriodicUpdates(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    onUpdate(callback: BackupUpdateCallback): void {
        this.updateCallbacks.push(callback);
    }

    private notifyUpdate(action: string, data: any): void {
        this.updateCallbacks.forEach(callback => {
            try {
                callback(action, data);
            } catch (error) {
                console.error('Backup status update callback error:', error);
            }
        });
    }

    destroy(): void {
        this.stopPeriodicUpdates();
    }
}