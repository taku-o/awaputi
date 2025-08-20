import { getErrorHandler } from '../utils/ErrorHandler.js';''
import type { ErrorHandler } from '../utils/ErrorHandler.js';
import { UIStateManager, 
    DialogStateManager, ;
    OperationStateManager, ';
    BackupStatusManager ' }'
} from './data-management-ui/DataManagementStateManager.js';
import { UILayoutManager, 
    UIRenderer, ';
    ViewRenderer ' }'
} from './data-management-ui/DataManagementRenderer.js';''
import { DialogManager } from './data-management-ui/DataManagementDialogs.js';

/**
 * Data manager interface
 */
interface DataManager { on?(event: string, callback: (data: any) => void): void;
    backup?: any;
    export?: any;
    import?: any; }
}

/**
 * Configuration interface
 */
interface Config { autoRefresh: boolean,
    refreshInterval: number,
    enableAnimations: boolean,
    showAdvancedOptions: boolean; }
}

/**
 * Status interface
 */
interface Status { visible: boolean,
    currentView: string,
    selectedItem: number,
    dialogVisible: boolean,
    operationInProgress: boolean,
    backupStatus: any; }
}

/**
 * Bounds interface
 */
interface Bounds { x: number,
    y: number,
    width: number,
    height: number; }
}

/**
 * データ管理UI (Refactored)
 * データ管理UIメインコントローラー - 包括的なデータ管理機能のユーザーインターフェース
 * 
 * サブコンポーネント化により責任を分離し、保守性を向上
 * - DataManagementStateManager: 状態管理システム
 * - DataManagementRenderer: レンダリングシステム
 * - DataManagementDialogs: ダイアログシステム
 * 
 * 責任:
 * - バックアップ状況表示機能の提供
 * - エクスポート・インポートダイアログの管理
 * - データクリア機能の提供
 * - ユーザーフレンドリーなデータ管理体験の実現
 */
export class DataManagementUI {
    private dataManager: DataManager;
    // Sub-components
    private uiState!: UIStateManager;
    private dialogState!: DialogStateManager;
    private operationState!: OperationStateManager;
    private backupStatus!: BackupStatusManager;
    private layoutManager!: UILayoutManager;
    private uiRenderer!: UIRenderer;
    private viewRenderer!: ViewRenderer;
    private dialogManager!: DialogManager;
    
    // Main configuration
    private config: Config = {
        autoRefresh: true;
        refreshInterval: 30000, // 30 seconds;
        enableAnimations: true,
        showAdvancedOptions: false }
    },
    
    // Canvas and input
    private canvas: HTMLCanvasElement | null = null;
    private lastInputTime: number = 0;
    private inputCooldown: number = 150;
    private refreshInterval?: NodeJS.Timer;

    constructor(dataManager: DataManager) {

        this.dataManager = dataManager;
        
        // Initialize sub-components
        this._initializeSubComponents();
        

    }
    }
        this.initialize(); }
    }
    
    /**
     * Initialize sub-component systems
     * @private
     */
    private _initializeSubComponents(): void { try {
            // Initialize state managers
            this.uiState = new UIStateManager();
            this.dialogState = new DialogStateManager();
            this.operationState = new OperationStateManager();
            this.backupStatus = new BackupStatusManager();
            
            // Initialize rendering system
            this.layoutManager = new UILayoutManager();
            this.uiRenderer = new UIRenderer(this.layoutManager);
            this.viewRenderer = new ViewRenderer(this.uiRenderer, this.layoutManager);
            ';
            // Initialize dialog system''
            this.dialogManager = new DialogManager(this.uiRenderer, this.layoutManager');'
            '';
            console.log('DataManagementUI sub-components initialized');'
            ' }'
        } catch (error') { ''
            console.error('Failed to initialize DataManagementUI sub-components:', error); }
        }
    }
    
    /**
     * UIコンポーネントの初期化
     */
    async initialize(): Promise<void> { try {
            // Initialize backup status
            await this.backupStatus.initialize(this.dataManager);
            
            // Setup event listeners'
            this.setupEventListeners();''
            this.setupStateChangeListeners('')';
            console.log('DataManagementUI initialized');
             }'
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'DATA_MANAGEMENT_UI_INITIALIZATION_ERROR', {')'
                operation: 'initialize'); }
            });
        }
    }
    
    /**
     * イベントリスナーの設定
     */'
    setupEventListeners(): void { ''
        if(this.dataManager') {'
            // DataManagerのイベントを監視'
        }'
            this.dataManager.on?.('backupCreated', (data: any) => {  }'
                this.onBackupCreated(data);' }'
            }');'
            '';
            this.dataManager.on?.('dataExported', (data: any) => { this.onDataExported(data);' }'
            }');'
            '';
            this.dataManager.on?.('dataImported', (data: any) => { this.onDataImported(data);' }'
            }');'
            '';
            this.dataManager.on?.('operationProgress', (data: any) => { this.onOperationProgress(data);' }'
            }');'
            '';
            this.dataManager.on?.('error', (data: any) => { this.onError(data); }
            });
        }
    }
    
    /**
     * 状態変更リスナーの設定
     */'
    setupStateChangeListeners(): void { // UI state changes''
        this.uiState.onStateChange((type: string, data: any') => { ' }'
            if (type === 'view') { }
                console.log(`View changed to: ${data.view}`);
            }
        });
        ';
        // Dialog state changes''
        this.dialogState.onDialogChange((action: string, data: any') => {  ' }'
            if (action === 'show') { }
                console.log(`Dialog opened: ${data.type}`);
            }
        });
        ';
        // Operation state changes''
        this.operationState.onOperationChange((action: string, data: any') => {  ''
            if (action === 'start'') {' }'
                this.dialogState.showDialog('progress', { }
                    title: `${data.type} in progress`,
                    message: data.message,);
                    progress: 0);
                    startTime: data.startTime,)';
                    cancellable: true),'';
                }');''
            } else if (action === 'progress') { this.dialogState.setDialogData({)'
                    progress: data.progress,')';
                    message: data.message)');' }'
            } else if (action === 'end') { ''
                this.dialogState.hideDialog('')';
                if(data.result === 'success') {'
                    ';
                }'
                    this.uiState.showError(`Operation completed successfully`, 3000');' }'
                } else if (data.result === 'error') {
                    this.uiState.showError(`Operation failed: ${data.message)`, 5000});
                }
            }
        });
    }
    
    /**
     * UIの表示
     * @param {HTMLCanvasElement} canvas - 描画キャンバス
     */
    show(canvas: HTMLCanvasElement): void { this.canvas = canvas;
        this.uiRenderer.setCanvas(canvas);
        this.uiState.setVisible(true);
        
        if(this.config.autoRefresh) {
        
            
        
        }
            this.startAutoRefresh(); }
        }
    }
    
    /**
     * UIの非表示
     */
    hide(): void { this.uiState.setVisible(false);
        this.stopAutoRefresh(); }
    }
    
    /**
     * UIの可視性を切り替え
     * @param {HTMLCanvasElement} canvas - 描画キャンバス
     */
    toggle(canvas: HTMLCanvasElement): void { if(this.uiState.isUIVisible() {
            this.hide(); }
        } else { this.show(canvas); }
        }
    }
    
    /**
     * UIが表示されているかチェック
     * @returns {boolean} 表示状態
     */
    isVisible(): boolean { return this.uiState.isUIVisible(); }
    }
    
    /**
     * 自動リフレッシュの開始
     */
    startAutoRefresh(): void { this.stopAutoRefresh();
        ';
        this.refreshInterval = setInterval(() => { ''
            this.backupStatus.loadBackupStatus().catch(error => {');' }'
                console.error('Auto refresh failed:', error); }
            });
        }, this.config.refreshInterval);
    }
    
    /**
     * 自動リフレッシュの停止
     */
    stopAutoRefresh(): void { if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = undefined; }
        }
    }
    
    /**
     * UIの描画
     */
    render(): void { if (!this.uiState.isUIVisible() || !this.canvas) return;
        
        try {
            // Clear and draw background
            this.uiRenderer.clear();
            this.uiRenderer.drawBackground();
            ';
            // Calculate menu bounds''
            const bounds = this.layoutManager.calculateMenuBounds('')';
            this.uiRenderer.drawMenuHeader(bounds, 'Data Management');
            
            // Render current view
            this.renderCurrentView(bounds);
            
            // Render dialog if visible
            if(this.dialogState.isDialogVisible() {
                const dialogType = this.dialogState.getDialogType();
                const dialogData = this.dialogState.getDialogData();
                if (dialogType) {
            }
                    this.dialogManager.renderDialog(dialogType, dialogData); }
                }
            }
            
            // Render error message if present
            this.renderErrorMessage();'
            '';
        } catch (error') { ''
            console.error('Render error:', error); }
        }
    }
    
    /**
     * 現在のビューをレンダリング
     */
    renderCurrentView(bounds: Bounds): void { const currentView = this.uiState.getCurrentView();
        const selectedItem = this.uiState.getSelectedItem();'
        '';
        switch(currentView') {'
            '';
            case 'overview':;
                this.viewRenderer.renderOverviewView();
                    bounds);
                    this.backupStatus.getBackupStatus(), ';
                    selectedItem'';
                ');
                break;'
                '';
            case 'export':;
                this.viewRenderer.renderExportView(bounds, selectedItem);
                break;
                
            // Add other views as needed
            default:;
                this.viewRenderer.renderOverviewView();
                    bounds),
                    this.backupStatus.getBackupStatus(), ;
                    selectedItem;
        }
                ); }
        }
    }
    
    /**
     * エラーメッセージの描画
     */
    renderErrorMessage(): void { const errorMessage = this.uiState.getError();
        if (!errorMessage) return;
        
        const colors = this.layoutManager.getColors();
        const bounds = this.layoutManager.calculateMenuBounds();
        
        // Error banner
        this.uiRenderer.drawCard(;
            bounds.x, bounds.y + bounds.height + 10, )';
            bounds.width, 50, false)'';
        ');'
        '';
        this.uiRenderer.drawText('⚠️ ' + errorMessage, ;
            bounds.x + 20, bounds.y + bounds.height + 35, {)
                fontSize: 14)';
                color: colors.danger,'';
                align: 'left',')';
                baseline: 'middle'); }
    }
    
    /**
     * 入力処理
     * @param {string} key - 押されたキー
     */
    handleInput(key: string): boolean { if(!this.uiState.isUIVisible() return false;
        
        // Input cooldown
        const now = Date.now();
        if (now - this.lastInputTime < this.inputCooldown) return true;
        this.lastInputTime = now;
        
        // Handle dialog input first
        if(this.dialogState.isDialogVisible() {
            
        }
            return this.handleDialogInput(key); }
        }
        
        // Handle main UI input
        return this.handleMainUIInput(key);
    }
    
    /**
     * ダイアログ入力処理
     */
    handleDialogInput(key: string): boolean { const dialogType = this.dialogState.getDialogType();
        const dialog = dialogType ? this.dialogManager.getDialog(dialogType) : undefined;'
        '';
        switch(key') {'
            '';
            case 'Escape':'';
                this.dialogState.hideDialog('')';
            case 'ArrowLeft':);
                if (dialog) {'
                    const currentButton = dialog.getSelectedButton();'
        }'
                    dialog.setSelectedButton(Math.max(0, currentButton - 1)'); }
                }
                return true;'
                '';
            case 'ArrowRight':;
                if(dialog) {
                    const currentButton = dialog.getSelectedButton();'
                    // Assume max 2 buttons for simplicity'
                }'
                    dialog.setSelectedButton(Math.min(1, currentButton + 1)'); }
                }
                return true;'
                '';
            case 'Enter':;
                if (dialogType) { this.executeDialogAction(dialogType, dialog? .getSelectedButton() || 0); }
                }
                return true;
        }
        
        return true;
    }
    
    /**
     * メインUI入力処理
     */ : undefined'
    handleMainUIInput(key: string): boolean { ''
        switch(key') {'
            '';
            case 'Escape':'';
                this.hide(''';
            case 'ArrowUp':'';
                this.uiState.moveSelectionUp('')';
            case 'ArrowDown':')';
                this.uiState.moveSelectionDown(5'); // Assume 5 menu items
                return true;'
                '';
            case 'Enter':'';
                this.executeMainAction('')';
            case 'Tab':);
                this.cycleView();
        }
                return true; }
        }
        
        return false;
    }
    
    /**
     * メインアクション実行
     */'
    executeMainAction(): void { const selectedItem = this.uiState.getSelectedItem();''
        const currentView = this.uiState.getCurrentView('')';
        if(currentView === 'overview') {
            switch (selectedItem) {
                case 1: // Create Backup;
                    this.showBackupDialog();
                    break;
                case 2: // Export Data;
                    this.showExportDialog();
                    break;
                case 3: // Import Data;
                    this.showImportDialog();
                    break;
                case 4: // Clear Data;
                    this.showClearDataDialog();
        }
                    break; }
            }
        }
    }
    
    /**
     * ダイアログアクション実行
     */'
    async executeDialogAction(dialogType: string, buttonIndex: number): Promise<void> { try {''
            switch(dialogType') {'
                '';
                case 'backup':';
                    if (buttonIndex === 1) { // Confirm''
                        await this.createBackup('')';
                case 'export':)';
                    if (buttonIndex === 1) { // Export''
                        await this.exportData('')';
                case 'import':)';
                    if (buttonIndex === 1) { // Import''
                        await this.importData('')';
                case 'clear':);
                    if (buttonIndex === 1) { // Confirm;
            }
                        await this.clearData(); }
                    }
                    break;
            }
            
            this.dialogState.hideDialog();
            ';
        } catch (error) { ''
            this.uiState.showError((error as Error).message');''
            console.error('Dialog action failed:', error); }
        }
    }
    
    /**
     * ビューサイクル'
     */''
    cycleView(''';
        const views = ['overview', 'export', 'import'];)
        const currentIndex = views.indexOf(this.uiState.getCurrentView();
        const nextIndex = (currentIndex + 1) % views.length;
        this.uiState.setCurrentView(views[nextIndex]);
    }
    ';
    // Dialog show methods''
    showBackupDialog('')';
        this.dialogState.showDialog('backup', { );
            estimatedSize: this.formatFileSize(1024 * 1024), // 1MB estimate;
            autoBackupEnabled: this.backupStatus.isAutoBackupEnabled(); }
        });
    }'
    '';
    showExportDialog(''';
        this.dialogState.showDialog('export', { ''
            formats: ['JSON', 'CSV', 'XML'],);
            selectedFormat: 0)';
            includeOptions: [' }'
                { name: 'Game Progress', checked: true },''
                { name: 'Settings', checked: true },']'
                { name: 'Statistics', checked: false })]
            ]);
    }'
    '';
    showImportDialog(''';
        this.dialogState.showDialog('import', { importOptions: [' }'
                { name: 'Merge with existing data', checked: true },''
                { name: 'Replace all data', checked: false },'])'
                { name: 'Create backup before import', checked: true })]
            ]);
    }'
    '';
    showClearDataDialog('')';
        this.dialogState.showDialog('clear', { ')'
            confirmText: ''); }
    }
    ';
    // Operation methods (simplified implementations);''
    async createBackup('')';
        this.operationState.startOperation('backup', 'Creating backup...');
        
        try { // Simulate backup creation
            for(let i = 0; i <= 100; i += 10) {
                
            }
                await new Promise(resolve => setTimeout(resolve, 100); }
                this.operationState.updateOperation(i, `Creating backup... ${i)%`});
            }
            ';
            this.backupStatus.addBackupToHistory({ );''
                id: Date.now('')';
                type: 'manual'') }'
            }'),'
            '';
            this.operationState.endOperation('success', 'Backup created successfully');'
            '';
        } catch (error') { ''
            this.operationState.endOperation('error', (error as Error).message); }
        }
    }'
    '';
    async exportData('')';
        this.operationState.startOperation('export', 'Exporting data...');
        
        try { // Simulate export
            for(let i = 0; i <= 100; i += 20) {
                
            }'
                await new Promise(resolve => setTimeout(resolve, 200);' }'
                this.operationState.updateOperation(i, `Exporting... ${i)%`'});
            }'
            '';
            this.operationState.endOperation('success', 'Data exported successfully');'
            '';
        } catch (error') { ''
            this.operationState.endOperation('error', (error as Error).message); }
        }
    }'
    '';
    async importData('')';
        this.operationState.startOperation('import', 'Importing data...');
        
        try { // Simulate import
            for(let i = 0; i <= 100; i += 15) {
                
            }'
                await new Promise(resolve => setTimeout(resolve, 150);' }'
                this.operationState.updateOperation(i, `Importing... ${i)%`'});
            }'
            '';
            this.operationState.endOperation('success', 'Data imported successfully');'
            '';
        } catch (error') { ''
            this.operationState.endOperation('error', (error as Error).message); }
        }
    }'
    '';
    async clearData('')';
        this.operationState.startOperation('clear', 'Clearing data...');
        ';
        try { // Simulate data clearing''
            await new Promise(resolve => setTimeout(resolve, 1000)');''
            this.operationState.updateOperation(100, 'Data cleared'');''
            this.operationState.endOperation('success', 'All data cleared successfully');'
            ' }'
        } catch (error') { ''
            this.operationState.endOperation('error', (error as Error).message); }
        }
    }
    
    // Event handlers'
    onBackupCreated(data: any): void { ''
        this.backupStatus.addBackupToHistory(data');''
        this.uiState.showError('Backup created successfully', 3000); }
    }'
    '';
    onDataExported(data: any'): void { ''
        this.uiState.showError('Data exported successfully', 3000); }
    }'
    '';
    onDataImported(data: any'): void { ''
        this.uiState.showError('Data imported successfully', 3000); }
    }'
    '';
    onOperationProgress(data: { progress: number; message?: string )'): void {''
        this.operationState.updateOperation(data.progress, data.message || ''); }
    }'
    '';
    onError(data: { message?: string )'): void {''
        this.uiState.showError(data.message || 'An error occurred'); }
    }
    
    // Utility methods'
    formatFileSize(bytes: number): string { ''
        if (bytes === 0') return '0 B';
        ';
        const k = 1024;''
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k);'
        '';
        return parseFloat((bytes / Math.pow(k, i).toFixed(1)') + ' ' + sizes[i]; }
    }
    
    // Configuration
    configure(newConfig: Partial<Config>): void { Object.assign(this.config, newConfig); }
    }
    
    getConfiguration(): Config {
        return { ...this.config };
    }
    
    // Status and diagnostics
    getStatus(): Status { return { visible: this.uiState.isUIVisible(),
            currentView: this.uiState.getCurrentView(),
            selectedItem: this.uiState.getSelectedItem(),
            dialogVisible: this.dialogState.isDialogVisible(),
            operationInProgress: this.operationState.isOperationInProgress(), };
            backupStatus: this.backupStatus.getBackupStatus(); }
        };
    }
    
    // Cleanup
    destroy(): void { this.stopAutoRefresh();
        this.backupStatus.destroy();
        this.uiState.reset();'
        this.dialogState.reset();''
        this.operationState.reset('')';
        console.log('DataManagementUI destroyed''); }'
    }''
}