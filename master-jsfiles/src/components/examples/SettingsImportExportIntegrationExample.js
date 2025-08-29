import { SettingsImportExportComponent } from '../SettingsImportExportComponent.js';

/**
 * SettingsImportExportComponent 統合例
 * 
 * SettingsSceneでの使用方法とベストプラクティスを示すサンプルコード
 * Requirements 5.5, 5.6, 5.8, 5.9を満たす実装例
 * 
 * @version 1.0.0
 * @since Issue #170 - Task 1.3: Create SettingsImportExportComponent
 */

/**
 * SettingsSceneでの統合例
 * 
 * SettingsSceneにSettingsImportExportComponentを統合する方法を示します。
 * アクセシビリティ設定カテゴリに設定管理コンポーネントを追加する例です。
 */
export class SettingsImportExportIntegrationExample {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.settingsImportExportComponent = null;
        this.isIntegrated = false;
    }
    
    /**
     * SettingsSceneの設定項目定義に統合
     * 
     * 実際のSettingsSceneでinitializeSettingItems()を拡張する方法
     */
    getExtendedSettingItems() {
        return {
            accessibility: [
                // 既存のアクセシビリティ設定...
                { key: 'accessibility.highContrast', label: 'ハイコントラスト', type: 'toggle' },
                { key: 'accessibility.largeText', label: '大きな文字', type: 'toggle' },
                { key: 'accessibility.reducedMotion', label: 'モーション削減', type: 'toggle' },
                
                // 設定管理コンポーネント
                { 
                    key: 'settings.importExport', 
                    label: '設定のインポート・エクスポート', 
                    type: 'custom',
                    component: 'SettingsImportExportComponent',
                    description: '設定をJSONファイルでエクスポート・インポートできます',
                    category: 'management'
                }
            ]
        };
    }
    
    /**
     * カスタムコンポーネントレンダリングハンドラー
     * 
     * SettingsSceneのhandleCustomComponent()メソッドに追加する処理
     * 
     * @param {Object} settingItem - 設定項目オブジェクト
     * @param {HTMLElement} parentElement - 親要素
     * @returns {HTMLElement|null} 作成されたコンポーネント要素
     */
    handleCustomComponent(settingItem, parentElement) {
        if (settingItem.component === 'SettingsImportExportComponent') {
            return this.createSettingsImportExportComponent(parentElement);
        }
        
        return null;
    }
    
    /**
     * SettingsImportExportComponentの作成と設定
     * 
     * @param {HTMLElement} parentElement - 親要素
     * @returns {HTMLElement} 作成されたコンポーネント要素
     */
    createSettingsImportExportComponent(parentElement) {
        try {
            // コンポーネントが未作成の場合は新規作成
            if (!this.settingsImportExportComponent) {
                this.settingsImportExportComponent = new SettingsImportExportComponent(this.gameEngine);
            }
            
            // コンポーネントの初期化
            const componentElement = this.settingsImportExportComponent.initialize(parentElement);
            
            if (componentElement) {
                this.setupEventListeners(componentElement);
                this.isIntegrated = true;
                
                console.log('[SettingsImportExportIntegration] Component integrated successfully');
                return componentElement;
            }
            
            return null;
            
        } catch (error) {
            console.error('[SettingsImportExportIntegration] Failed to create component:', error);
            return null;
        }
    }
    
    /**
     * イベントリスナーの設定
     * 
     * コンポーネントのカスタムイベントに対するハンドリングを設定
     * 
     * @param {HTMLElement} componentElement - コンポーネント要素
     */
    setupEventListeners(componentElement) {
        // エクスポート完了イベント
        componentElement.addEventListener('settingsExported', (event) => {
            this.handleSettingsExported(event.detail);
        });
        
        // インポート完了イベント
        componentElement.addEventListener('settingsImported', (event) => {
            this.handleSettingsImported(event.detail);
        });
    }
    
    /**
     * 設定エクスポート完了ハンドラー
     * 
     * @param {Object} detail - イベント詳細データ
     */
    handleSettingsExported(detail) {
        console.log('[SettingsImportExportIntegration] Settings exported:', detail);
        
        // ユーザー通知（例：トースト通知）
        this.showNotification('success', `設定をエクスポートしました: ${detail.filename}`);
        
        // 統計情報の更新
        this.updateExportStatistics(detail);
        
        // AnalyticsManager経由でのイベント記録（もし存在すれば）
        if (this.gameEngine.analyticsManager) {
            this.gameEngine.analyticsManager.trackEvent('settings_exported', {
                filename: detail.filename,
                dataSize: detail.dataSize,
                timestamp: detail.timestamp
            });
        }
    }
    
    /**
     * 設定インポート完了ハンドラー
     * 
     * @param {Object} detail - イベント詳細データ
     */
    handleSettingsImported(detail) {
        console.log('[SettingsImportExportIntegration] Settings imported:', detail);
        
        // ユーザー通知
        let message = `設定をインポートしました: ${detail.settingsCount}項目が適用されました`;
        if (detail.warnings && detail.warnings.length > 0) {
            message += ` (${detail.warnings.length}件の警告あり)`;
        }
        this.showNotification('success', message);
        
        // 警告の表示
        if (detail.warnings && detail.warnings.length > 0) {
            this.showWarnings(detail.warnings);
        }
        
        // 設定画面の更新
        this.refreshSettingsDisplay();
        
        // 統計情報の更新
        this.updateImportStatistics(detail);
        
        // AnalyticsManager経由でのイベント記録
        if (this.gameEngine.analyticsManager) {
            this.gameEngine.analyticsManager.trackEvent('settings_imported', {
                filename: detail.filename,
                settingsCount: detail.settingsCount,
                warningsCount: detail.warnings ? detail.warnings.length : 0,
                timestamp: detail.timestamp
            });
        }
    }
    
    /**
     * 通知の表示
     * 
     * @param {string} type - 通知タイプ（success, warning, error）
     * @param {string} message - 通知メッセージ
     */
    showNotification(type, message) {
        // NotificationManagerが存在する場合
        if (this.gameEngine.notificationManager) {
            this.gameEngine.notificationManager.show(type, message);
            return;
        }
        
        // フォールバック: コンソール出力
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // 簡易的なブラウザ通知（開発用）
        if (window.Notification && Notification.permission === 'granted') {
            new Notification('BubblePop - 設定管理', {
                body: message,
                icon: '/favicon.ico'
            });
        }
    }
    
    /**
     * 警告の表示
     * 
     * @param {Array<string>} warnings - 警告メッセージリスト
     */
    showWarnings(warnings) {
        warnings.forEach(warning => {
            this.showNotification('warning', warning);
        });
    }
    
    /**
     * 設定画面の表示更新
     * 
     * インポート後に設定画面の表示を最新の状態に更新
     */
    refreshSettingsDisplay() {
        // SettingsSceneの再レンダリング
        if (this.gameEngine.sceneManager && this.gameEngine.sceneManager.currentScene) {
            const currentScene = this.gameEngine.sceneManager.currentScene;
            
            // 設定項目の再初期化
            if (typeof currentScene.initializeSettingItems === 'function') {
                currentScene.settingItems = currentScene.initializeSettingItems();
            }
            
            // アクセシビリティ設定の再読み込み
            if (currentScene.accessibilitySettingsManager) {
                currentScene.settingItems.accessibility = 
                    currentScene.accessibilitySettingsManager.getExtendedAccessibilitySettings();
            }
            
            console.log('[SettingsImportExportIntegration] Settings display refreshed');
        }
    }
    
    /**
     * エクスポート統計の更新
     * 
     * @param {Object} detail - エクスポートイベント詳細
     */
    updateExportStatistics(detail) {
        const stats = {
            lastExportTime: detail.timestamp,
            lastExportFilename: detail.filename,
            lastExportSize: detail.dataSize,
            totalExports: (this.getStoredStats().totalExports || 0) + 1
        };
        
        this.saveStatistics('export', stats);
    }
    
    /**
     * インポート統計の更新
     * 
     * @param {Object} detail - インポートイベント詳細
     */
    updateImportStatistics(detail) {
        const stats = {
            lastImportTime: detail.timestamp,
            lastImportFilename: detail.filename,
            lastImportSettingsCount: detail.settingsCount,
            totalImports: (this.getStoredStats().totalImports || 0) + 1
        };
        
        this.saveStatistics('import', stats);
    }
    
    /**
     * 統計情報の保存
     * 
     * @param {string} type - 統計タイプ（export, import）
     * @param {Object} stats - 統計データ
     */
    saveStatistics(type, stats) {
        try {
            const key = `settingsManagement_${type}_stats`;
            localStorage.setItem(key, JSON.stringify(stats));
        } catch (error) {
            console.warn('[SettingsImportExportIntegration] Failed to save statistics:', error);
        }
    }
    
    /**
     * 保存済み統計情報の取得
     * 
     * @returns {Object} 統計情報
     */
    getStoredStats() {
        try {
            const exportStats = JSON.parse(localStorage.getItem('settingsManagement_export_stats') || '{}');
            const importStats = JSON.parse(localStorage.getItem('settingsManagement_import_stats') || '{}');
            
            return { ...exportStats, ...importStats };
        } catch (error) {
            console.warn('[SettingsImportExportIntegration] Failed to load statistics:', error);
            return {};
        }
    }
    
    /**
     * コンポーネントの統計情報取得
     * 
     * @returns {Object} 統計情報
     */
    getComponentStats() {
        if (this.settingsImportExportComponent) {
            return this.settingsImportExportComponent.getStats();
        }
        
        return null;
    }
    
    /**
     * コンポーネントの表示/非表示切り替え
     * 
     * @param {boolean} visible - 表示するかどうか
     */
    setComponentVisible(visible) {
        if (this.settingsImportExportComponent) {
            this.settingsImportExportComponent.setVisible(visible);
        }
    }
    
    /**
     * コンポーネントが有効かどうか
     * 
     * @returns {boolean} 有効性
     */
    isComponentEnabled() {
        return this.settingsImportExportComponent ? 
            this.settingsImportExportComponent.isEnabled() : false;
    }
    
    /**
     * 統合の状態を取得
     * 
     * @returns {Object} 統合状態情報
     */
    getIntegrationStatus() {
        return {
            isIntegrated: this.isIntegrated,
            componentInitialized: this.settingsImportExportComponent ? 
                this.settingsImportExportComponent.isInitialized : false,
            componentEnabled: this.isComponentEnabled(),
            stats: this.getComponentStats(),
            storedStats: this.getStoredStats()
        };
    }
    
    /**
     * コンポーネントのクリーンアップ
     * 
     * SettingsSceneのcleanup()メソッドで呼び出す
     */
    cleanup() {
        if (this.settingsImportExportComponent) {
            this.settingsImportExportComponent.destroy();
            this.settingsImportExportComponent = null;
        }
        
        this.isIntegrated = false;
        
        console.log('[SettingsImportExportIntegration] Cleaned up successfully');
    }
}

/**
 * SettingsSceneでの使用例
 * 
 * 実際のSettingsSceneに統合する際のコード例
 */
export class SettingsSceneIntegrationExample {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        // 統合ヘルパーの初期化
        this.importExportIntegration = new SettingsImportExportIntegrationExample(gameEngine);
    }
    
    /**
     * 設定項目の初期化（SettingsScene.initializeSettingItems()を拡張）
     */
    initializeSettingItems() {
        // 基本的な設定項目
        const baseItems = {
            general: [
                { key: 'ui.language', label: '言語', type: 'select', options: [
                    { value: 'ja', label: '日本語' },
                    { value: 'en', label: 'English' }
                ]},
                { key: 'audio.masterVolume', label: 'マスター音量', type: 'slider', min: 0, max: 1, step: 0.1 }
            ],
            accessibility: [
                { key: 'accessibility.highContrast', label: 'ハイコントラスト', type: 'toggle' },
                { key: 'accessibility.largeText', label: '大きな文字', type: 'toggle' },
                { key: 'accessibility.reducedMotion', label: 'モーション削減', type: 'toggle' },
                
                // プロファイル切り替えコンポーネント
                { 
                    key: 'accessibility.profile', 
                    label: 'アクセシビリティプロファイル', 
                    type: 'custom',
                    component: 'AccessibilityProfileComponent',
                    description: 'プリセットされたアクセシビリティ設定を選択できます'
                },
                
                // 設定管理コンポーネント
                { 
                    key: 'settings.importExport', 
                    label: '設定のインポート・エクスポート', 
                    type: 'custom',
                    component: 'SettingsImportExportComponent',
                    description: '設定をJSONファイルでエクスポート・インポートできます'
                }
            ]
        };
        
        return baseItems;
    }
    
    /**
     * カスタムコンポーネントの処理（SettingsScene.handleCustomComponent()を拡張）
     */
    handleCustomComponent(settingItem, parentElement) {
        // 設定インポート・エクスポートコンポーネント
        if (settingItem.component === 'SettingsImportExportComponent') {
            return this.importExportIntegration.handleCustomComponent(settingItem, parentElement);
        }
        
        // 他のカスタムコンポーネントの処理...
        
        return null;
    }
    
    /**
     * クリーンアップ（SettingsScene.cleanup()を拡張）
     */
    cleanup() {
        this.importExportIntegration.cleanup();
        
        // 他のクリーンアップ処理...
    }
}

/**
 * 使用例の要約
 * 
 * 1. SettingsImportExportIntegrationExampleクラスを使用して統合ロジックを管理
 * 2. SettingsScene.initializeSettingItems()にカスタム設定項目を追加
 * 3. SettingsScene.handleCustomComponent()でコンポーネントの作成を処理
 * 4. イベントリスナーでエクスポート/インポート完了時の処理を実装
 * 5. SettingsScene.cleanup()でリソースのクリーンアップを実行
 * 
 * この統合により、Requirements 5.5, 5.6, 5.8, 5.9が満たされ、
 * ユーザーは設定画面から直感的に設定をエクスポート・インポートできるようになります。
 */