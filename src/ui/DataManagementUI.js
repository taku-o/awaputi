import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * データ管理UI - 包括的なデータ管理機能のユーザーインターフェース
 * 
 * 責任:
 * - バックアップ状況表示機能の提供
 * - エクスポート・インポートダイアログの管理
 * - データクリア機能の提供
 * - ユーザーフレンドリーなデータ管理体験の実現
 */
export class DataManagementUI {
    constructor(dataManager) {
        this.dataManager = dataManager;
        
        // UI状態管理
        this.isVisible = false;
        this.currentView = 'overview'; // 'overview', 'backup', 'export', 'import', 'clear'
        this.selectedItem = 0;
        this.scrollPosition = 0;
        
        // ダイアログ状態
        this.showingDialog = null; // null, 'backup', 'export', 'import', 'clear', 'progress'
        this.dialogData = {};
        this.dialogInput = '';
        
        // 操作状態
        this.operationInProgress = false;
        this.operationProgress = 0;
        this.operationMessage = '';
        
        // バックアップ状況データ
        this.backupStatus = {
            lastBackup: null,
            backupCount: 0,
            totalSize: 0,
            autoBackupEnabled: true,
            nextBackup: null
        };
        
        // エラー状態
        this.errorMessage = null;
        this.errorTimeout = null;
        
        // レイアウト設定
        this.layoutConfig = {
            padding: 20,
            itemHeight: 60,
            headerHeight: 80,
            dialogPadding: 40,
            buttonHeight: 40,
            buttonWidth: 150,
            sectionSpacing: 30
        };
        
        // 色設定
        this.colors = {
            background: '#0f0f1a',
            cardBackground: '#1a1a2e',
            primary: '#4a90e2',
            secondary: '#6bb0ff',
            success: '#10B981',
            warning: '#F59E0B',
            danger: '#EF4444',
            text: '#ffffff',
            textSecondary: '#cccccc',
            border: '#333',
            overlay: 'rgba(0, 0, 0, 0.8)'
        };
        
        this.initialize();
    }
    
    /**
     * UIコンポーネントの初期化
     */
    async initialize() {
        try {
            // バックアップ状況を初期化
            await this.loadBackupStatus();
            
            // DataManagerのイベントリスナーを設定
            this.setupEventListeners();
            
            console.log('DataManagementUI initialized');
            
        } catch (error) {
            getErrorHandler().handleError(error, 'DATA_MANAGEMENT_UI_INITIALIZATION_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        if (this.dataManager) {
            // DataManagerのイベントを監視
            this.dataManager.on('backupCreated', (data) => {
                this.onBackupCreated(data);
            });
            
            this.dataManager.on('dataExported', (data) => {
                this.onDataExported(data);
            });
            
            this.dataManager.on('dataImported', (data) => {
                this.onDataImported(data);
            });
            
            this.dataManager.on('operationProgress', (data) => {
                this.onOperationProgress(data);
            });
            
            this.dataManager.on('error', (data) => {
                this.onError(data);
            });
        }
    }
    
    /**
     * バックアップ状況の読み込み
     */
    async loadBackupStatus() {
        try {
            if (!this.dataManager.backup) {
                // BackupManagerの遅延ロード
                await this.initializeBackupManager();
            }
            
            if (this.dataManager.backup) {
                // BackupManagerから状況を取得
                const status = await this.dataManager.backup.getStatus();
                this.backupStatus = {
                    lastBackup: status.lastBackup,
                    backupCount: status.backupCount || 0,
                    totalSize: status.totalSize || 0,
                    autoBackupEnabled: status.autoBackupEnabled || false,
                    nextBackup: status.nextBackup,
                    backupHistory: status.backupHistory || []
                };
            } else {
                // フォールバック: デフォルト値を使用
                this.backupStatus = {
                    lastBackup: null,
                    backupCount: 0,
                    totalSize: 0,
                    autoBackupEnabled: false,
                    nextBackup: null,
                    backupHistory: []
                };
            }
            
        } catch (error) {
            console.warn('Failed to load backup status:', error);
            // フォールバック: デフォルト値を使用
            this.backupStatus = {
                lastBackup: null,
                backupCount: 0,
                totalSize: 0,
                autoBackupEnabled: false,
                nextBackup: null,
                backupHistory: []
            };
        }
    }
    
    /**
     * BackupManagerの初期化
     */
    async initializeBackupManager() {
        try {
            const { BackupManager } = await import('../core/BackupManager.js');
            if (this.dataManager.storage) {
                this.dataManager.backup = new BackupManager(this.dataManager.storage);
                console.log('DataManagementUI: BackupManager initialized');
            }
        } catch (error) {
            console.warn('BackupManager not available:', error);
        }
    }
    
    /**
     * UIの表示
     */
    show() {
        this.isVisible = true;
        this.currentView = 'overview';
        this.selectedItem = 0;
        this.scrollPosition = 0;
        this.loadBackupStatus();
    }
    
    /**
     * UIの非表示
     */
    hide() {
        this.isVisible = false;
        this.showingDialog = null;
        this.clearError();
    }
    
    /**
     * UIの更新
     */
    update(deltaTime) {
        if (!this.isVisible) return;
        
        // エラーメッセージのタイムアウト処理
        if (this.errorTimeout && Date.now() > this.errorTimeout) {
            this.clearError();
        }
        
        // 進行中の操作の更新
        if (this.operationInProgress) {
            this.updateOperationProgress();
        }
    }
    
    /**
     * UIの描画
     */
    render(context, canvas) {
        if (!this.isVisible) return;
        
        // 背景オーバーレイ
        context.fillStyle = this.colors.overlay;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // メインコンテナ
        const containerWidth = Math.min(800, canvas.width - 40);
        const containerHeight = Math.min(600, canvas.height - 40);
        const containerX = (canvas.width - containerWidth) / 2;
        const containerY = (canvas.height - containerHeight) / 2;
        
        // メインコンテナ背景
        context.fillStyle = this.colors.background;
        context.fillRect(containerX, containerY, containerWidth, containerHeight);
        
        // メインコンテナ枠線
        context.strokeStyle = this.colors.border;
        context.lineWidth = 2;
        context.strokeRect(containerX, containerY, containerWidth, containerHeight);
        
        // ヘッダー
        this.renderHeader(context, containerX, containerY, containerWidth);
        
        // コンテンツエリア
        const contentY = containerY + this.layoutConfig.headerHeight;
        const contentHeight = containerHeight - this.layoutConfig.headerHeight;
        
        switch (this.currentView) {
            case 'overview':
                this.renderOverview(context, containerX, contentY, containerWidth, contentHeight);
                break;
            case 'backup':
                this.renderBackupView(context, containerX, contentY, containerWidth, contentHeight);
                break;
            case 'export':
                this.renderExportView(context, containerX, contentY, containerWidth, contentHeight);
                break;
            case 'import':
                this.renderImportView(context, containerX, contentY, containerWidth, contentHeight);
                break;
            case 'clear':
                this.renderClearView(context, containerX, contentY, containerWidth, contentHeight);
                break;
        }
        
        // ダイアログ
        if (this.showingDialog) {
            this.renderDialog(context, canvas);
        }
        
        // エラーメッセージ
        if (this.errorMessage) {
            this.renderErrorMessage(context, canvas);
        }
    }
    
    /**
     * ヘッダーの描画
     */
    renderHeader(context, x, y, width) {
        // ヘッダー背景
        context.fillStyle = this.colors.cardBackground;
        context.fillRect(x, y, width, this.layoutConfig.headerHeight);
        
        // ヘッダー下線
        context.strokeStyle = this.colors.border;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(x, y + this.layoutConfig.headerHeight);
        context.lineTo(x + width, y + this.layoutConfig.headerHeight);
        context.stroke();
        
        // タイトル
        context.fillStyle = this.colors.text;
        context.font = 'bold 24px Arial';
        context.textAlign = 'left';
        context.fillText('データ管理', x + this.layoutConfig.padding, y + 35);
        
        // 戻るボタン
        const backButtonX = x + width - 100;
        const backButtonY = y + 20;
        const backButtonWidth = 80;
        const backButtonHeight = 40;
        
        context.fillStyle = this.colors.secondary;
        context.fillRect(backButtonX, backButtonY, backButtonWidth, backButtonHeight);
        
        context.strokeStyle = this.colors.border;
        context.lineWidth = 1;
        context.strokeRect(backButtonX, backButtonY, backButtonWidth, backButtonHeight);
        
        context.fillStyle = this.colors.text;
        context.font = '16px Arial';
        context.textAlign = 'center';
        context.fillText('戻る', backButtonX + backButtonWidth / 2, backButtonY + 25);
        
        // 現在のビュー表示
        context.fillStyle = this.colors.textSecondary;
        context.font = '14px Arial';
        context.textAlign = 'left';
        const viewLabels = {
            overview: '概要',
            backup: 'バックアップ',
            export: 'エクスポート',
            import: 'インポート',
            clear: 'データクリア'
        };
        context.fillText(`現在: ${viewLabels[this.currentView]}`, x + this.layoutConfig.padding, y + 60);
    }
    
    /**
     * 概要画面の描画
     */
    renderOverview(context, x, y, width, height) {
        const padding = this.layoutConfig.padding;
        let currentY = y + padding;
        
        // バックアップ状況カード
        this.renderBackupStatusCard(context, x + padding, currentY, width - padding * 2);
        currentY += 120;
        
        // クイックアクションボタン
        this.renderQuickActionButtons(context, x + padding, currentY, width - padding * 2);
        currentY += 100;
        
        // システム情報
        this.renderSystemInfo(context, x + padding, currentY, width - padding * 2);
    }
    
    /**
     * バックアップ状況カードの描画
     */
    renderBackupStatusCard(context, x, y, width) {
        // カード背景
        context.fillStyle = this.colors.cardBackground;
        context.fillRect(x, y, width, 100);
        
        // カード枠線
        context.strokeStyle = this.colors.border;
        context.lineWidth = 1;
        context.strokeRect(x, y, width, 100);
        
        // カードタイトル
        context.fillStyle = this.colors.primary;
        context.font = 'bold 18px Arial';
        context.textAlign = 'left';
        context.fillText('バックアップ状況', x + 15, y + 25);
        
        // 最終バックアップ日時
        const lastBackupText = this.backupStatus.lastBackup 
            ? new Date(this.backupStatus.lastBackup).toLocaleString('ja-JP')
            : '未実行';
        
        context.fillStyle = this.colors.text;
        context.font = '14px Arial';
        context.fillText(`最終バックアップ: ${lastBackupText}`, x + 15, y + 50);
        
        // バックアップ数とサイズ
        const sizeText = this.formatFileSize(this.backupStatus.totalSize);
        context.fillText(`バックアップ数: ${this.backupStatus.backupCount} (${sizeText})`, x + 15, y + 70);
        
        // 自動バックアップ状態
        const autoStatus = this.backupStatus.autoBackupEnabled ? '有効' : '無効';
        const statusColor = this.backupStatus.autoBackupEnabled ? this.colors.success : this.colors.warning;
        
        context.fillStyle = statusColor;
        context.fillText(`自動バックアップ: ${autoStatus}`, x + width - 200, y + 50);
    }
    
    /**
     * クイックアクションボタンの描画
     */
    renderQuickActionButtons(context, x, y, width) {
        const buttonWidth = (width - 30) / 4;
        const buttonHeight = this.layoutConfig.buttonHeight;
        const spacing = 10;
        
        const buttons = [
            { text: 'バックアップ', action: 'backup', color: this.colors.primary },
            { text: 'エクスポート', action: 'export', color: this.colors.success },
            { text: 'インポート', action: 'import', color: this.colors.secondary },
            { text: 'データクリア', action: 'clear', color: this.colors.danger }
        ];
        
        buttons.forEach((button, index) => {
            const buttonX = x + (buttonWidth + spacing) * index;
            
            // ボタン背景
            context.fillStyle = button.color;
            context.fillRect(buttonX, y, buttonWidth, buttonHeight);
            
            // ボタン枠線
            context.strokeStyle = this.colors.border;
            context.lineWidth = 1;
            context.strokeRect(buttonX, y, buttonWidth, buttonHeight);
            
            // ボタンテキスト
            context.fillStyle = this.colors.text;
            context.font = '14px Arial';
            context.textAlign = 'center';
            context.fillText(button.text, buttonX + buttonWidth / 2, y + 25);
        });
    }
    
    /**
     * システム情報の描画
     */
    renderSystemInfo(context, x, y, width) {
        // セクション背景
        context.fillStyle = this.colors.cardBackground;
        context.fillRect(x, y, width, 120);
        
        // セクション枠線
        context.strokeStyle = this.colors.border;
        context.lineWidth = 1;
        context.strokeRect(x, y, width, 120);
        
        // セクションタイトル
        context.fillStyle = this.colors.primary;
        context.font = 'bold 18px Arial';
        context.textAlign = 'left';
        context.fillText('システム情報', x + 15, y + 25);
        
        // DataManager状態
        const dmStatus = this.dataManager ? this.dataManager.getStatus() : null;
        const initStatus = dmStatus?.isInitialized ? '初期化済み' : '未初期化';
        const initColor = dmStatus?.isInitialized ? this.colors.success : this.colors.warning;
        
        context.fillStyle = this.colors.text;
        context.font = '14px Arial';
        context.fillText('DataManager:', x + 15, y + 50);
        
        context.fillStyle = initColor;
        context.fillText(initStatus, x + 150, y + 50);
        
        // ストレージ使用量
        try {
            const storageUsed = this.getStorageUsage();
            context.fillStyle = this.colors.text;
            context.fillText(`ストレージ使用量: ${this.formatFileSize(storageUsed)}`, x + 15, y + 75);
        } catch (error) {
            context.fillStyle = this.colors.textSecondary;
            context.fillText('ストレージ使用量: 取得できません', x + 15, y + 75);
        }
        
        // バージョン情報
        const version = dmStatus?.version || '不明';
        context.fillStyle = this.colors.textSecondary;
        context.fillText(`バージョン: ${version}`, x + 15, y + 100);
    }
    
    /**
     * エラーメッセージの描画
     */
    renderErrorMessage(context, canvas) {
        const messageWidth = 400;
        const messageHeight = 80;
        const messageX = (canvas.width - messageWidth) / 2;
        const messageY = 50;
        
        // エラーメッセージ背景
        context.fillStyle = this.colors.danger;
        context.fillRect(messageX, messageY, messageWidth, messageHeight);
        
        // エラーメッセージ枠線
        context.strokeStyle = '#ffffff';
        context.lineWidth = 2;
        context.strokeRect(messageX, messageY, messageWidth, messageHeight);
        
        // エラーメッセージテキスト
        context.fillStyle = '#ffffff';
        context.font = 'bold 16px Arial';
        context.textAlign = 'center';
        context.fillText('エラー', messageX + messageWidth / 2, messageY + 25);
        
        context.font = '14px Arial';
        context.fillText(this.errorMessage, messageX + messageWidth / 2, messageY + 50);
    }
    
    /**
     * ファイルサイズのフォーマット
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    /**
     * ストレージ使用量の取得
     */
    getStorageUsage() {
        let totalSize = 0;
        
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key) && key.startsWith('bubblePop_')) {
                totalSize += new Blob([localStorage[key]]).size;
            }
        }
        
        return totalSize;
    }
    
    /**
     * エラーの表示
     */
    showError(message, duration = 5000) {
        this.errorMessage = message;
        this.errorTimeout = Date.now() + duration;
    }
    
    /**
     * エラーのクリア
     */
    clearError() {
        this.errorMessage = null;
        this.errorTimeout = null;
    }
    
    // イベントハンドラー
    onBackupCreated(data) {
        this.loadBackupStatus();
        this.showError('バックアップが作成されました', 3000);
    }
    
    onDataExported(data) {
        this.showError('データのエクスポートが完了しました', 3000);
    }
    
    onDataImported(data) {
        this.loadBackupStatus();
        this.showError('データのインポートが完了しました', 3000);
    }
    
    onOperationProgress(data) {
        this.operationProgress = data.progress || 0;
        this.operationMessage = data.message || '';
    }
    
    onError(data) {
        this.showError(data.message || 'エラーが発生しました');
    }
    
    /**
     * 操作進行状況の更新
     */
    updateOperationProgress() {
        // 実装は後で追加
    }
    
    /**
     * バックアップビューの描画
     */
    renderBackupView(context, x, y, width, height) {
        const padding = this.layoutConfig.padding;
        let currentY = y + padding;
        
        // バックアップ履歴セクション
        this.renderBackupHistory(context, x + padding, currentY, width - padding * 2);
        currentY += 250;
        
        // バックアップ設定セクション
        this.renderBackupSettings(context, x + padding, currentY, width - padding * 2);
        currentY += 150;
        
        // バックアップアクションボタン
        this.renderBackupActions(context, x + padding, currentY, width - padding * 2);
    }
    
    /**
     * バックアップ履歴の描画
     */
    renderBackupHistory(context, x, y, width) {
        // セクション背景
        context.fillStyle = this.colors.cardBackground;
        context.fillRect(x, y, width, 230);
        
        // セクション枠線
        context.strokeStyle = this.colors.border;
        context.lineWidth = 1;
        context.strokeRect(x, y, width, 230);
        
        // セクションタイトル
        context.fillStyle = this.colors.primary;
        context.font = 'bold 18px Arial';
        context.textAlign = 'left';
        context.fillText('バックアップ履歴', x + 15, y + 25);
        
        // バックアップが存在しない場合
        if (this.backupStatus.backupCount === 0) {
            context.fillStyle = this.colors.textSecondary;
            context.font = '16px Arial';
            context.textAlign = 'center';
            context.fillText('バックアップが存在しません', x + width / 2, y + 120);
            
            context.font = '14px Arial';
            context.fillText('新しいバックアップを作成してください', x + width / 2, y + 145);
            return;
        }
        
        // バックアップ履歴ヘッダー
        context.fillStyle = this.colors.textSecondary;
        context.font = 'bold 14px Arial';
        context.textAlign = 'left';
        context.fillText('日時', x + 15, y + 55);
        context.fillText('サイズ', x + 200, y + 55);
        context.fillText('タイプ', x + 300, y + 55);
        context.fillText('状態', x + 400, y + 55);
        
        // ヘッダー下線
        context.strokeStyle = this.colors.border;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(x + 15, y + 65);
        context.lineTo(x + width - 15, y + 65);
        context.stroke();
        
        // サンプルバックアップエントリ（実際のデータがない場合）
        const sampleBackups = this.generateSampleBackupEntries();
        
        sampleBackups.forEach((backup, index) => {
            const itemY = y + 80 + index * 30;
            const isSelected = this.selectedItem === index;
            
            // 選択されたアイテムのハイライト
            if (isSelected) {
                context.fillStyle = 'rgba(74, 144, 226, 0.3)';
                context.fillRect(x + 10, itemY - 15, width - 20, 25);
            }
            
            // バックアップエントリ情報
            context.fillStyle = this.colors.text;
            context.font = '14px Arial';
            context.textAlign = 'left';
            
            // 日時
            context.fillText(backup.date, x + 15, itemY);
            
            // サイズ
            context.fillText(backup.size, x + 200, itemY);
            
            // タイプ
            context.fillText(backup.type, x + 300, itemY);
            
            // 状態
            context.fillStyle = backup.statusColor;
            context.fillText(backup.status, x + 400, itemY);
            
            context.fillStyle = this.colors.text;
        });
        
        // スクロールインジケーター（必要に応じて）
        if (sampleBackups.length > 5) {
            this.renderScrollIndicator(context, x + width - 20, y + 80, 10, 120);
        }
    }
    
    /**
     * バックアップ設定の描画
     */
    renderBackupSettings(context, x, y, width) {
        // セクション背景
        context.fillStyle = this.colors.cardBackground;
        context.fillRect(x, y, width, 130);
        
        // セクション枠線
        context.strokeStyle = this.colors.border;
        context.lineWidth = 1;
        context.strokeRect(x, y, width, 130);
        
        // セクションタイトル
        context.fillStyle = this.colors.primary;
        context.font = 'bold 18px Arial';
        context.textAlign = 'left';
        context.fillText('バックアップ設定', x + 15, y + 25);
        
        // 自動バックアップ設定
        context.fillStyle = this.colors.text;
        context.font = '14px Arial';
        context.fillText('自動バックアップ:', x + 15, y + 55);
        
        // 自動バックアップ切り替えボタン
        const toggleX = x + 150;
        const toggleY = y + 40;
        const toggleWidth = 60;
        const toggleHeight = 25;
        
        context.fillStyle = this.backupStatus.autoBackupEnabled ? this.colors.success : this.colors.textSecondary;
        context.fillRect(toggleX, toggleY, toggleWidth, toggleHeight);
        
        context.strokeStyle = this.colors.border;
        context.lineWidth = 1;
        context.strokeRect(toggleX, toggleY, toggleWidth, toggleHeight);
        
        context.fillStyle = this.colors.text;
        context.font = '12px Arial';
        context.textAlign = 'center';
        context.fillText(this.backupStatus.autoBackupEnabled ? 'ON' : 'OFF', 
                        toggleX + toggleWidth / 2, toggleY + 16);
        
        // バックアップ間隔設定
        context.fillStyle = this.colors.text;
        context.font = '14px Arial';
        context.textAlign = 'left';
        context.fillText('バックアップ間隔:', x + 15, y + 85);
        context.fillText('5分毎', x + 150, y + 85);
        
        // 最大保持数設定
        context.fillText('最大保持数:', x + 300, y + 55);
        context.fillText('10個', x + 400, y + 55);
        
        // 次回バックアップ予定
        if (this.backupStatus.nextBackup) {
            const nextBackupTime = new Date(this.backupStatus.nextBackup).toLocaleTimeString('ja-JP');
            context.fillStyle = this.colors.textSecondary;
            context.fillText(`次回バックアップ: ${nextBackupTime}`, x + 300, y + 85);
        }
        
        // ストレージ使用状況
        const storageUsed = this.getStorageUsage();
        const storageText = this.formatFileSize(storageUsed);
        context.fillStyle = this.colors.textSecondary;
        context.fillText(`ストレージ使用量: ${storageText}`, x + 15, y + 110);
    }
    
    /**
     * バックアップアクションの描画
     */
    renderBackupActions(context, x, y, width) {
        const buttonWidth = this.layoutConfig.buttonWidth;
        const buttonHeight = this.layoutConfig.buttonHeight;
        const spacing = 20;
        
        const actions = [
            { text: '今すぐバックアップ', action: 'createBackup', color: this.colors.primary },
            { text: 'バックアップ復元', action: 'restoreBackup', color: this.colors.secondary },
            { text: 'バックアップ削除', action: 'deleteBackup', color: this.colors.danger }
        ];
        
        actions.forEach((action, index) => {
            const buttonX = x + (buttonWidth + spacing) * index;
            
            // ボタン背景
            context.fillStyle = action.color;
            context.fillRect(buttonX, y, buttonWidth, buttonHeight);
            
            // ボタン枠線
            context.strokeStyle = this.colors.border;
            context.lineWidth = 1;
            context.strokeRect(buttonX, y, buttonWidth, buttonHeight);
            
            // ボタンテキスト
            context.fillStyle = this.colors.text;
            context.font = '14px Arial';
            context.textAlign = 'center';
            context.fillText(action.text, buttonX + buttonWidth / 2, y + 25);
        });
        
        // 操作中のプログレスバー
        if (this.operationInProgress) {
            this.renderProgressBar(context, x, y + buttonHeight + 20, width);
        }
    }
    
    /**
     * スクロールインジケーターの描画
     */
    renderScrollIndicator(context, x, y, width, height) {
        // スクロールバー背景
        context.fillStyle = this.colors.border;
        context.fillRect(x, y, width, height);
        
        // スクロールハンドル
        const handleHeight = Math.max(20, height * 0.3);
        const handleY = y + (this.scrollPosition / 100) * (height - handleHeight);
        
        context.fillStyle = this.colors.primary;
        context.fillRect(x, handleY, width, handleHeight);
    }
    
    /**
     * プログレスバーの描画
     */
    renderProgressBar(context, x, y, width) {
        const barHeight = 20;
        
        // プログレスバー背景
        context.fillStyle = this.colors.border;
        context.fillRect(x, y, width, barHeight);
        
        // プログレスバー前景
        const progressWidth = (width * this.operationProgress) / 100;
        context.fillStyle = this.colors.success;
        context.fillRect(x, y, progressWidth, barHeight);
        
        // プログレスバー枠線
        context.strokeStyle = this.colors.text;
        context.lineWidth = 1;
        context.strokeRect(x, y, width, barHeight);
        
        // プログレステキスト
        context.fillStyle = this.colors.text;
        context.font = '12px Arial';
        context.textAlign = 'center';
        context.fillText(`${this.operationProgress}% - ${this.operationMessage}`, 
                        x + width / 2, y + 14);
    }
    
    /**
     * バックアップエントリの取得
     */
    generateSampleBackupEntries() {
        if (this.backupStatus.backupCount === 0) {
            return [];
        }
        
        // 実際のバックアップ履歴が利用可能な場合
        if (this.backupStatus.backupHistory && this.backupStatus.backupHistory.length > 0) {
            return this.backupStatus.backupHistory.slice(0, 5).map(backup => ({
                date: new Date(backup.timestamp).toLocaleString('ja-JP'),
                size: this.formatFileSize(backup.size || 0),
                type: backup.type || '自動',
                status: backup.status || '正常',
                statusColor: this.getStatusColor(backup.status || '正常')
            }));
        }
        
        // フォールバック: サンプルデータを生成
        const entries = [];
        const now = Date.now();
        
        for (let i = 0; i < Math.min(this.backupStatus.backupCount, 5); i++) {
            const date = new Date(now - (i * 5 * 60 * 1000)); // 5分間隔
            entries.push({
                date: date.toLocaleString('ja-JP'),
                size: this.formatFileSize(Math.random() * 1024 * 1024), // ランダムサイズ
                type: i === 0 ? '手動' : '自動',
                status: '正常',
                statusColor: this.colors.success
            });
        }
        
        return entries;
    }
    
    /**
     * ステータスに対応する色を取得
     */
    getStatusColor(status) {
        switch (status) {
            case '正常':
            case 'success':
                return this.colors.success;
            case 'エラー':
            case 'error':
                return this.colors.danger;
            case '進行中':
            case 'progress':
                return this.colors.warning;
            default:
                return this.colors.textSecondary;
        }
    }
    
    /**
     * エクスポートビューの描画
     */
    renderExportView(context, x, y, width, height) {
        // 後で実装
        context.fillStyle = this.colors.text;
        context.font = '18px Arial';
        context.textAlign = 'center';
        context.fillText('エクスポート機能（実装予定）', x + width / 2, y + height / 2);
    }
    
    /**
     * インポートビューの描画
     */
    renderImportView(context, x, y, width, height) {
        // 後で実装
        context.fillStyle = this.colors.text;
        context.font = '18px Arial';
        context.textAlign = 'center';
        context.fillText('インポート機能（実装予定）', x + width / 2, y + height / 2);
    }
    
    /**
     * データクリアビューの描画
     */
    renderClearView(context, x, y, width, height) {
        // 後で実装
        context.fillStyle = this.colors.text;
        context.font = '18px Arial';
        context.textAlign = 'center';
        context.fillText('データクリア機能（実装予定）', x + width / 2, y + height / 2);
    }
    
    /**
     * ダイアログの描画
     */
    renderDialog(context, canvas) {
        // 後で実装
    }
    
    /**
     * リソースの解放
     */
    destroy() {
        this.clearError();
        this.hide();
        console.log('DataManagementUI destroyed');
    }
}