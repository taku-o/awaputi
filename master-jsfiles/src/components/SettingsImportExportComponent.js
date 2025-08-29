import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getLocalizationManager } from '../core/LocalizationManager.js';

/**
 * SettingsImportExportComponent
 * 
 * 設定のインポート・エクスポート機能を提供するUIコンポーネント
 * Requirements 5.5, 5.6, 5.8, 5.9を満たすファイル操作機能
 * 
 * Features:
 * - 設定エクスポートボタン（JSONファイルダウンロード）
 * - 設定インポートボタン（ファイル選択と検証）
 * - ファイル操作の適切なエラーハンドリング
 * - ユーザーフレンドリーな操作フィードバック
 * - 設定検証とマイグレーション機能
 * 
 * @version 1.0.0
 * @since Issue #170 - Task 1.3: Create SettingsImportExportComponent
 */
export class SettingsImportExportComponent {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.errorHandler = getErrorHandler();
        this.localizationManager = getLocalizationManager();
        
        // ファイル操作設定
        this.SUPPORTED_FORMATS = ['json'];
        this.MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
        this.EXPORT_FILENAME_PREFIX = 'awaputi-settings';
        
        // DOM要素
        this.container = null;
        this.exportButton = null;
        this.importButton = null;
        this.fileInput = null;
        this.statusIndicator = null;
        this.progressBar = null;
        this.infoPanel = null;
        
        // 状態管理
        this.isInitialized = false;
        this.isProcessing = false;
        this.lastOperation = null;
        this.operationHistory = [];
        
        // イベントハンドラーのバインド
        this.handleExportSettings = this.handleExportSettings.bind(this);
        this.handleImportSettings = this.handleImportSettings.bind(this);
        this.handleFileSelect = this.handleFileSelect.bind(this);
        this.handleKeydown = this.handleKeydown.bind(this);
        
        // AccessibilitySettingsManagerの参照を取得
        this.accessibilityManager = this.gameEngine.sceneManager?.currentScene?.accessibilitySettingsManager;
        
        // 統計情報
        this.stats = {
            exportCount: 0,
            importCount: 0,
            errorsCount: 0,
            lastExport: null,
            lastImport: null,
            sessionStart: Date.now()
        };
    }
    
    /**
     * コンポーネントを初期化してDOMに追加
     * @param {HTMLElement} parentElement - 親コンテナ要素
     * @returns {HTMLElement} 作成されたコンテナ要素
     */
    initialize(parentElement) {
        try {
            if (this.isInitialized) {
                console.warn('[SettingsImportExportComponent] Already initialized');
                return this.container;
            }
            
            if (!parentElement || !(parentElement instanceof HTMLElement)) {
                throw new Error('Valid parent element is required');
            }
            
            this.createImportExportUI(parentElement);
            this.updateStatusIndicator('ready', '設定のインポート・エクスポートが利用可能です');
            this.isInitialized = true;
            
            console.log('[SettingsImportExportComponent] Initialized successfully');
            return this.container;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'SETTINGS_IMPORT_EXPORT_ERROR', {
                operation: 'initialize'
            });
            return null;
        }
    }
    
    /**
     * インポート・エクスポートUIを作成
     * @param {HTMLElement} parentElement - 親コンテナ
     */
    createImportExportUI(parentElement) {
        // メインコンテナ
        this.container = document.createElement('div');
        this.container.className = 'settings-import-export-component';
        this.container.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 15px;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #f9f9f9;
            font-family: Arial, sans-serif;
        `;
        
        // ヘッダー
        const header = document.createElement('div');
        header.className = 'import-export-header';
        header.style.cssText = `
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
        `;
        header.textContent = '設定管理';
        this.container.appendChild(header);
        
        // 説明文
        const description = document.createElement('p');
        description.className = 'import-export-description';
        description.style.cssText = `
            font-size: 14px;
            color: #666;
            margin: 0 0 15px 0;
        `;
        description.textContent = '設定をJSONファイルでエクスポート・インポートできます。';
        this.container.appendChild(description);
        
        // ボタンコンテナ
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        buttonContainer.style.cssText = `
            display: flex;
            gap: 15px;
            align-items: center;
        `;
        
        // エクスポートボタン
        this.exportButton = document.createElement('button');
        this.exportButton.className = 'export-settings-button';
        this.exportButton.innerHTML = '📤 設定をエクスポート';
        this.exportButton.style.cssText = `
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        `;
        this.exportButton.setAttribute('role', 'button');
        this.exportButton.setAttribute('aria-label', '現在の設定をJSONファイルとしてダウンロード');
        this.exportButton.addEventListener('click', this.handleExportSettings);
        this.exportButton.addEventListener('keydown', this.handleKeydown);
        buttonContainer.appendChild(this.exportButton);
        
        // インポートボタン
        this.importButton = document.createElement('button');
        this.importButton.className = 'import-settings-button';
        this.importButton.innerHTML = '📥 設定をインポート';
        this.importButton.style.cssText = `
            background: linear-gradient(135deg, #2196F3, #1976D2);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        `;
        this.importButton.setAttribute('role', 'button');
        this.importButton.setAttribute('aria-label', 'JSONファイルから設定をインポート');
        this.importButton.addEventListener('click', this.handleImportSettings);
        this.importButton.addEventListener('keydown', this.handleKeydown);
        buttonContainer.appendChild(this.importButton);
        
        this.container.appendChild(buttonContainer);
        
        // 隠しファイル入力
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = '.json';
        this.fileInput.style.display = 'none';
        this.fileInput.addEventListener('change', this.handleFileSelect);
        this.container.appendChild(this.fileInput);
        
        // プログレスバー
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'progress-bar';
        this.progressBar.style.cssText = `
            width: 100%;
            height: 6px;
            background-color: #e0e0e0;
            border-radius: 3px;
            overflow: hidden;
            display: none;
        `;
        
        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';
        progressFill.style.cssText = `
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #45a049);
            width: 0%;
            transition: width 0.3s ease;
        `;
        this.progressBar.appendChild(progressFill);
        this.container.appendChild(this.progressBar);
        
        // ステータスインジケーター
        this.statusIndicator = document.createElement('div');
        this.statusIndicator.className = 'status-indicator';
        this.statusIndicator.style.cssText = `
            font-size: 13px;
            padding: 10px;
            border-radius: 4px;
            text-align: center;
            transition: all 0.3s ease;
        `;
        this.container.appendChild(this.statusIndicator);
        
        // 情報パネル
        this.infoPanel = document.createElement('div');
        this.infoPanel.className = 'info-panel';
        this.infoPanel.style.cssText = `
            font-size: 12px;
            color: #666;
            padding: 10px;
            background-color: #f0f0f0;
            border-radius: 4px;
            border-left: 4px solid #2196F3;
        `;
        this.infoPanel.innerHTML = `
            <strong>ヒント:</strong><br>
            • エクスポートしたファイルは他のデバイスでインポートできます<br>
            • 対応形式: JSON (.json)<br>
            • 最大ファイルサイズ: 5MB
        `;
        this.container.appendChild(this.infoPanel);
        
        // ホバー効果の追加
        this.addHoverEffects();
        
        parentElement.appendChild(this.container);
    }
    
    /**
     * ボタンのホバー効果を追加
     */
    addHoverEffects() {
        const addHoverEffect = (button, normalStyle, hoverStyle) => {
            button.addEventListener('mouseenter', () => {
                if (!this.isProcessing) {
                    Object.assign(button.style, hoverStyle);
                }
            });
            
            button.addEventListener('mouseleave', () => {
                Object.assign(button.style, normalStyle);
            });
        };
        
        addHoverEffect(this.exportButton, {
            background: 'linear-gradient(135deg, #4CAF50, #45a049)',
            transform: 'scale(1)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }, {
            background: 'linear-gradient(135deg, #45a049, #4CAF50)',
            transform: 'scale(1.05)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        });
        
        addHoverEffect(this.importButton, {
            background: 'linear-gradient(135deg, #2196F3, #1976D2)',
            transform: 'scale(1)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }, {
            background: 'linear-gradient(135deg, #1976D2, #2196F3)',
            transform: 'scale(1.05)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
        });
    }
    
    /**
     * 設定エクスポート処理
     */
    async handleExportSettings() {
        if (this.isProcessing) return;
        
        try {
            this.isProcessing = true;
            this.updateStatusIndicator('processing', '設定をエクスポート中...');
            this.showProgress(true);
            this.setButtonsEnabled(false);
            
            await this.delay(100); // UI更新のための短い遅延
            
            // エクスポートデータの準備
            const exportData = await this.prepareExportData();
            
            // ファイルとして保存
            const filename = this.generateExportFilename();
            this.downloadAsFile(exportData, filename);
            
            // 統計更新
            this.stats.exportCount++;
            this.stats.lastExport = new Date().toISOString();
            this.lastOperation = { type: 'export', timestamp: Date.now(), filename };
            this.operationHistory.push(this.lastOperation);
            
            // 成功フィードバック
            await this.delay(500);
            this.updateStatusIndicator('success', `設定をエクスポートしました: ${filename}`);
            
            // カスタムイベントの発火
            this.dispatchCustomEvent('settingsExported', {
                filename,
                timestamp: Date.now(),
                dataSize: JSON.stringify(exportData).length
            });
            
        } catch (error) {
            this.stats.errorsCount++;
            this.errorHandler.handleError(error, 'SETTINGS_EXPORT_ERROR', {
                operation: 'export'
            });
            this.updateStatusIndicator('error', 'エクスポートに失敗しました');
        } finally {
            this.isProcessing = false;
            this.showProgress(false);
            this.setButtonsEnabled(true);
            
            // 3秒後にステータスをリセット
            setTimeout(() => {
                if (!this.isProcessing) {
                    this.updateStatusIndicator('ready', '設定のインポート・エクスポートが利用可能です');
                }
            }, 3000);
        }
    }
    
    /**
     * 設定インポート処理
     */
    handleImportSettings() {
        if (this.isProcessing) return;
        
        try {
            this.updateStatusIndicator('processing', 'ファイルを選択してください...');
            this.fileInput.click();
            
        } catch (error) {
            this.stats.errorsCount++;
            this.errorHandler.handleError(error, 'SETTINGS_IMPORT_ERROR', {
                operation: 'import_trigger'
            });
            this.updateStatusIndicator('error', 'インポートの開始に失敗しました');
        }
    }
    
    /**
     * ファイル選択処理
     */
    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) {
            this.updateStatusIndicator('ready', '設定のインポート・エクスポートが利用可能です');
            return;
        }
        
        try {
            this.isProcessing = true;
            this.updateStatusIndicator('processing', 'ファイルを検証中...');
            this.showProgress(true);
            this.setButtonsEnabled(false);
            
            // ファイル検証
            const validationResult = await this.validateImportFile(file);
            if (!validationResult.valid) {
                throw new Error(validationResult.error);
            }
            
            // ファイル読み込み
            this.updateStatusIndicator('processing', 'ファイルを読み込み中...');
            const importData = await this.readImportFile(file);
            
            // データ検証
            this.updateStatusIndicator('processing', 'データを検証中...');
            const dataValidation = await this.validateImportData(importData);
            if (!dataValidation.valid) {
                throw new Error(dataValidation.error);
            }
            
            // 設定適用
            this.updateStatusIndicator('processing', '設定を適用中...');
            const applyResult = await this.applyImportedSettings(importData);
            
            // 統計更新
            this.stats.importCount++;
            this.stats.lastImport = new Date().toISOString();
            this.lastOperation = { 
                type: 'import', 
                timestamp: Date.now(), 
                filename: file.name,
                settingsCount: applyResult.appliedCount
            };
            this.operationHistory.push(this.lastOperation);
            
            // 成功フィードバック
            this.updateStatusIndicator('success', 
                `設定をインポートしました: ${applyResult.appliedCount}項目が適用されました`);
            
            // カスタムイベントの発火
            this.dispatchCustomEvent('settingsImported', {
                filename: file.name,
                timestamp: Date.now(),
                settingsCount: applyResult.appliedCount,
                warnings: applyResult.warnings
            });
            
        } catch (error) {
            this.stats.errorsCount++;
            this.errorHandler.handleError(error, 'SETTINGS_IMPORT_ERROR', {
                operation: 'import_process',
                filename: file.name
            });
            this.updateStatusIndicator('error', `インポートに失敗しました: ${error.message}`);
        } finally {
            this.isProcessing = false;
            this.showProgress(false);
            this.setButtonsEnabled(true);
            
            // ファイル入力をリセット
            this.fileInput.value = '';
            
            // 5秒後にステータスをリセット
            setTimeout(() => {
                if (!this.isProcessing) {
                    this.updateStatusIndicator('ready', '設定のインポート・エクスポートが利用可能です');
                }
            }, 5000);
        }
    }
    
    /**
     * エクスポートデータの準備
     * @returns {Object} エクスポートデータ
     */
    async prepareExportData() {
        const exportData = {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            gameVersion: this.gameEngine.version || '1.0.0',
            source: 'SettingsImportExportComponent',
            settings: {},
            accessibility: {},
            metadata: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                exportedBy: 'awaputi-bubble-pop-game'
            }
        };
        
        // 一般設定の収集
        if (this.gameEngine.settingsManager) {
            const generalSettings = [
                'ui.language', 'ui.quality', 
                'audio.masterVolume', 'audio.sfxVolume', 'audio.bgmVolume',
                'social.enableSharing', 'social.autoPromptHighScore', 'social.defaultPlatform',
                'privacy.dataCollection', 'privacy.analytics',
                'notifications.challenges.enabled'
            ];
            
            generalSettings.forEach(key => {
                const value = this.gameEngine.settingsManager.get(key);
                if (value !== undefined) {
                    exportData.settings[key] = value;
                }
            });
        }
        
        // アクセシビリティ設定の収集
        if (this.accessibilityManager) {
            try {
                const accessibilitySettings = this.accessibilityManager.getExtendedAccessibilitySettings();
                accessibilitySettings.forEach(setting => {
                    const value = this.gameEngine.settingsManager?.get(setting.key);
                    if (value !== undefined) {
                        exportData.accessibility[setting.key] = value;
                    }
                });
                
                // プロファイル情報も含める
                exportData.accessibility.currentProfile = this.accessibilityManager.currentProfile;
                
                // 統計情報
                exportData.accessibility.stats = this.accessibilityManager.getStats();
            } catch (error) {
                console.warn('[SettingsImportExportComponent] Failed to collect accessibility settings:', error);
            }
        }
        
        return exportData;
    }
    
    /**
     * エクスポートファイル名の生成
     * @returns {string} ファイル名
     */
    generateExportFilename() {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, ''); // HHMMSS
        return `${this.EXPORT_FILENAME_PREFIX}-${dateStr}-${timeStr}.json`;
    }
    
    /**
     * ファイルとしてダウンロード
     * @param {Object} data - ダウンロードするデータ
     * @param {string} filename - ファイル名
     */
    downloadAsFile(data, filename) {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
    
    /**
     * インポートファイルの検証
     * @param {File} file - 検証するファイル
     * @returns {Object} 検証結果
     */
    async validateImportFile(file) {
        // ファイルサイズチェック
        if (file.size > this.MAX_FILE_SIZE) {
            return {
                valid: false,
                error: `ファイルサイズが大きすぎます (最大: ${this.MAX_FILE_SIZE / 1024 / 1024}MB)`
            };
        }
        
        // ファイル形式チェック
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!this.SUPPORTED_FORMATS.includes(fileExtension)) {
            return {
                valid: false,
                error: `サポートされていないファイル形式です (対応形式: ${this.SUPPORTED_FORMATS.join(', ')})`
            };
        }
        
        // MIME Type チェック
        if (file.type && !file.type.includes('json')) {
            return {
                valid: false,
                error: 'JSONファイルを選択してください'
            };
        }
        
        return { valid: true };
    }
    
    /**
     * インポートファイルの読み込み
     * @param {File} file - 読み込むファイル
     * @returns {Promise<Object>} パースされたデータ
     */
    readImportFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    resolve(data);
                } catch (error) {
                    reject(new Error('JSONファイルの解析に失敗しました'));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('ファイルの読み込みに失敗しました'));
            };
            
            reader.readAsText(file);
        });
    }
    
    /**
     * インポートデータの検証
     * @param {Object} data - 検証するデータ
     * @returns {Object} 検証結果
     */
    async validateImportData(data) {
        // 基本構造チェック
        if (!data || typeof data !== 'object') {
            return { valid: false, error: '無効なデータ形式です' };
        }
        
        // 必須フィールドチェック
        if (!data.timestamp) {
            return { valid: false, error: 'タイムスタンプが見つかりません' };
        }
        
        if (!data.version) {
            return { valid: false, error: 'バージョン情報が見つかりません' };
        }
        
        // 設定データの存在チェック
        if (!data.settings && !data.accessibility) {
            return { valid: false, error: '設定データが見つかりません' };
        }
        
        // バージョン互換性チェック（将来の拡張用）
        if (data.version && data.version !== '1.0.0') {
            console.warn('[SettingsImportExportComponent] Version mismatch:', data.version);
            // 現時点では警告のみ
        }
        
        return { valid: true };
    }
    
    /**
     * インポートした設定の適用
     * @param {Object} data - インポートデータ
     * @returns {Object} 適用結果
     */
    async applyImportedSettings(data) {
        let appliedCount = 0;
        const warnings = [];
        
        // 一般設定の適用
        if (data.settings && this.gameEngine.settingsManager) {
            Object.entries(data.settings).forEach(([key, value]) => {
                try {
                    this.gameEngine.settingsManager.set(key, value);
                    appliedCount++;
                } catch (error) {
                    console.warn(`[SettingsImportExportComponent] Failed to apply setting ${key}:`, error);
                    warnings.push(`設定 ${key} の適用に失敗しました`);
                }
            });
        }
        
        // アクセシビリティ設定の適用
        if (data.accessibility && this.accessibilityManager) {
            try {
                // AccessibilitySettingsManagerのimportSettingsメソッドを利用
                // 一時的なファイルオブジェクトを作成してインポート処理を実行
                const settingsBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
                const settingsFile = new File([settingsBlob], 'temp-import.json', { type: 'application/json' });
                
                await this.accessibilityManager.importSettings(settingsFile);
                
                // アクセシビリティ設定の数をカウント
                Object.keys(data.accessibility).forEach(key => {
                    if (key !== 'currentProfile' && key !== 'stats') {
                        appliedCount++;
                    }
                });
                
            } catch (error) {
                console.warn('[SettingsImportExportComponent] Failed to apply accessibility settings:', error);
                warnings.push('アクセシビリティ設定の適用に一部失敗しました');
            }
        }
        
        return { appliedCount, warnings };
    }
    
    /**
     * キーボードイベントハンドラ
     * @param {KeyboardEvent} event - キーボードイベント
     */
    handleKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.target.click();
        }
    }
    
    /**
     * ステータスインジケーターの更新
     * @param {string} type - ステータスタイプ (ready/processing/success/error)
     * @param {string} message - 表示メッセージ
     */
    updateStatusIndicator(type, message) {
        if (!this.statusIndicator) return;
        
        this.statusIndicator.textContent = message;
        
        const styles = {
            ready: { backgroundColor: '#e3f2fd', color: '#1976d2', border: '1px solid #bbdefb' },
            processing: { backgroundColor: '#fff3e0', color: '#f57c00', border: '1px solid #ffcc02' },
            success: { backgroundColor: '#e8f5e8', color: '#2e7d32', border: '1px solid #a5d6a7' },
            error: { backgroundColor: '#ffebee', color: '#c62828', border: '1px solid #ef9a9a' }
        };
        
        Object.assign(this.statusIndicator.style, styles[type] || styles.ready);
    }
    
    /**
     * プログレスバーの表示/非表示
     * @param {boolean} show - 表示するかどうか
     */
    showProgress(show) {
        if (!this.progressBar) return;
        
        this.progressBar.style.display = show ? 'block' : 'none';
        
        if (show) {
            const fill = this.progressBar.querySelector('.progress-fill');
            if (fill) {
                // アニメーション効果
                fill.style.width = '0%';
                setTimeout(() => { fill.style.width = '100%'; }, 100);
            }
        }
    }
    
    /**
     * ボタンの有効/無効設定
     * @param {boolean} enabled - 有効にするかどうか
     */
    setButtonsEnabled(enabled) {
        [this.exportButton, this.importButton].forEach(button => {
            if (button) {
                button.disabled = !enabled;
                button.style.opacity = enabled ? '1' : '0.6';
                button.style.cursor = enabled ? 'pointer' : 'not-allowed';
            }
        });
    }
    
    /**
     * カスタムイベントの発火
     * @param {string} eventName - イベント名
     * @param {Object} detail - イベントの詳細データ
     */
    dispatchCustomEvent(eventName, detail) {
        if (this.container) {
            const event = new CustomEvent(eventName, { detail });
            this.container.dispatchEvent(event);
        }
    }
    
    /**
     * 遅延処理
     * @param {number} ms - 遅延時間（ミリ秒）
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * 統計情報の取得
     * @returns {Object} 統計情報
     */
    getStats() {
        return {
            ...this.stats,
            lastOperation: this.lastOperation,
            operationHistory: this.operationHistory.slice(-10), // 最新10件
            sessionDuration: Date.now() - this.stats.sessionStart
        };
    }
    
    /**
     * 操作履歴の取得
     * @returns {Array} 操作履歴
     */
    getOperationHistory() {
        return [...this.operationHistory];
    }
    
    /**
     * コンポーネントが有効かどうかチェック
     * @returns {boolean} 有効性
     */
    isEnabled() {
        return this.isInitialized && !this.isProcessing;
    }
    
    /**
     * 表示/非表示の切り替え
     * @param {boolean} visible - 表示するかどうか
     */
    setVisible(visible) {
        if (this.container) {
            this.container.style.display = visible ? 'flex' : 'none';
        }
    }
    
    /**
     * コンポーネントのクリーンアップ
     */
    destroy() {
        try {
            // イベントリスナーの削除
            if (this.exportButton) {
                this.exportButton.removeEventListener('click', this.handleExportSettings);
                this.exportButton.removeEventListener('keydown', this.handleKeydown);
            }
            
            if (this.importButton) {
                this.importButton.removeEventListener('click', this.handleImportSettings);
                this.importButton.removeEventListener('keydown', this.handleKeydown);
            }
            
            if (this.fileInput) {
                this.fileInput.removeEventListener('change', this.handleFileSelect);
            }
            
            // DOM要素の削除
            if (this.container && this.container.parentElement) {
                this.container.parentElement.removeChild(this.container);
            }
            
            // 参照のクリア
            this.container = null;
            this.exportButton = null;
            this.importButton = null;
            this.fileInput = null;
            this.statusIndicator = null;
            this.progressBar = null;
            this.infoPanel = null;
            
            this.isInitialized = false;
            
            console.log('[SettingsImportExportComponent] Destroyed successfully');
            
        } catch (error) {
            this.errorHandler.handleError(error, 'SETTINGS_IMPORT_EXPORT_ERROR', {
                operation: 'destroy'
            });
        }
    }
}