/**
 * AccessibilitySettingsUI - 包括的アクセシビリティ設定インターフェース
 * 直感的な設定パネル・リアルタイムプレビュー・設定インポート/エクスポート
 * カテゴリ別整理とユーザーフレンドリーな設定管理システム
 */

import { getErrorHandler } from '../utils/ErrorHandler.js';

export class AccessibilitySettingsUI {
    constructor(accessibilityManager) {
        this.accessibilityManager = accessibilityManager;
        this.gameEngine = accessibilityManager?.gameEngine;
        
        // UI設定
        this.config = {
            enabled: true,
            showAdvancedSettings: false,
            realTimePreview: true,
            saveOnChange: true,
            showTooltips: true,
            keyboardNavigation: true,
            animateChanges: true
        };
        
        // 設定カテゴリ定義
        this.settingCategories = {
            visual: {
                name: '視覚アクセシビリティ',
                icon: '👁️',
                description: 'テキスト、色、コントラスト、アニメーション設定',
                settings: [
                    'textScaling',
                    'colorContrast', 
                    'colorBlindnessSupport',
                    'motionReduction',
                    'focusIndicators',
                    'visualFeedback'
                ]
            },
            audio: {
                name: '聴覚アクセシビリティ',
                icon: '🔊',
                description: 'サウンド、字幕、視覚的音響フィードバック設定',
                settings: [
                    'soundSettings',
                    'captionSettings',
                    'vibrationSettings',
                    'visualAudioCues',
                    'audioDescriptions'
                ]
            },
            motor: {
                name: '運動アクセシビリティ',
                icon: '🖱️',
                description: 'キーボード、マウス、タッチ、入力方法設定',
                settings: [
                    'keyboardSettings',
                    'mouseSettings',
                    'touchSettings',
                    'alternativeInput',
                    'gestureCustomization',
                    'timingAdjustments'
                ]
            },
            cognitive: {
                name: '認知アクセシビリティ',
                icon: '🧠',
                description: 'UI簡素化、ヘルプ、エラー処理設定',
                settings: [
                    'uiSimplification',
                    'contextualHelp',
                    'errorRecovery',
                    'memoryAids',
                    'focusManagement'
                ]
            },
            testing: {
                name: 'テスト・検証',
                icon: '🔍',
                description: 'アクセシビリティテスト、検証、レポート設定',
                settings: [
                    'wcagTesting',
                    'screenReaderTesting', 
                    'keyboardTesting',
                    'contrastTesting',
                    'reportGeneration'
                ]
            },
            profiles: {
                name: 'プロファイル管理',
                icon: '👤',
                description: '設定プロファイル、インポート/エクスポート',
                settings: [
                    'profileManagement',
                    'quickProfiles',
                    'settingsSync',
                    'dataManagement'
                ]
            }
        };
        
        // 設定項目定義
        this.settingDefinitions = {
            // 視覚アクセシビリティ
            textScaling: {
                name: 'テキストサイズ',
                type: 'range',
                min: 0.5,
                max: 3.0,
                step: 0.1,
                default: 1.0,
                unit: '倍',
                description: 'テキストサイズを調整します',
                previewElement: '.sample-text'
            },
            colorContrast: {
                name: 'コントラスト強化',
                type: 'select',
                options: {
                    'normal': '標準',
                    'enhanced': '強化',
                    'high': '高コントラスト',
                    'maximum': '最大コントラスト'
                },
                default: 'normal',
                description: '色のコントラストを強化します'
            },
            colorBlindnessSupport: {
                name: '色覚サポート',
                type: 'select',
                options: {
                    'none': 'なし',
                    'protanopia': '第一色覚異常',
                    'deuteranopia': '第二色覚異常',
                    'tritanopia': '第三色覚異常',
                    'patterns': 'パターン表示'
                },
                default: 'none',
                description: '色覚異常に対応した表示を行います'
            },
            motionReduction: {
                name: 'アニメーション軽減',
                type: 'select',
                options: {
                    'none': '通常',
                    'minimal': '最小限',
                    'reduced': '軽減',
                    'significant': '大幅軽減',
                    'disabled': '無効'
                },
                default: 'none',
                description: 'アニメーションを軽減します'
            },
            
            // 聴覚アクセシビリティ
            soundSettings: {
                name: 'サウンド設定',
                type: 'group',
                settings: {
                    masterVolume: {
                        name: 'マスター音量',
                        type: 'range',
                        min: 0,
                        max: 100,
                        default: 70,
                        unit: '%'
                    },
                    soundEffects: {
                        name: '効果音',
                        type: 'checkbox',
                        default: true
                    },
                    backgroundMusic: {
                        name: 'BGM',
                        type: 'checkbox',
                        default: true
                    }
                }
            },
            captionSettings: {
                name: '字幕設定',
                type: 'group',
                settings: {
                    showCaptions: {
                        name: '字幕表示',
                        type: 'checkbox',
                        default: false
                    },
                    captionSize: {
                        name: '字幕サイズ',
                        type: 'range',
                        min: 0.8,
                        max: 2.0,
                        default: 1.0,
                        unit: '倍'
                    },
                    captionPosition: {
                        name: '字幕位置',
                        type: 'select',
                        options: {
                            'bottom': '下部',
                            'top': '上部',
                            'center': '中央'
                        },
                        default: 'bottom'
                    }
                }
            },
            
            // 運動アクセシビリティ
            keyboardSettings: {
                name: 'キーボード設定',
                type: 'group',
                settings: {
                    keyboardNavigation: {
                        name: 'キーボードナビゲーション',
                        type: 'checkbox',
                        default: true
                    },
                    stickyKeys: {
                        name: '固定キー',
                        type: 'checkbox',
                        default: false
                    },
                    keyRepeatDelay: {
                        name: 'キーリピート遅延',
                        type: 'range',
                        min: 100,
                        max: 1000,
                        default: 500,
                        unit: 'ms'
                    }
                }
            },
            alternativeInput: {
                name: '代替入力',
                type: 'group',
                settings: {
                    switchInput: {
                        name: 'スイッチ入力',
                        type: 'checkbox',
                        default: false
                    },
                    eyeTracking: {
                        name: '視線追跡',
                        type: 'checkbox',
                        default: false
                    },
                    voiceControl: {
                        name: '音声制御',
                        type: 'checkbox',
                        default: false
                    }
                }
            },
            
            // 認知アクセシビリティ
            uiSimplification: {
                name: 'UI簡素化',
                type: 'select',
                options: {
                    'none': '標準',
                    'minimal': '最小限',
                    'essential': '必要最小限',
                    'beginner': '初心者向け'
                },
                default: 'none',
                description: 'インターフェースを簡素化します'
            },
            contextualHelp: {
                name: 'コンテキストヘルプ',
                type: 'checkbox',
                default: true,
                description: '状況に応じたヘルプを表示します'
            }
        };
        
        // UI要素
        this.ui = {
            container: null,
            sidebar: null,
            mainPanel: null,
            previewPanel: null,
            currentCategory: 'visual',
            settingElements: new Map(),
            previewElements: new Map()
        };
        
        // 設定状態
        this.settings = {
            current: new Map(),
            defaults: new Map(),
            modified: new Set(),
            previewMode: false
        };
        
        // イベントリスナー
        this.eventListeners = new Map();
        
        // 統計情報
        this.stats = {
            settingsChanged: 0,
            categoriesVisited: new Set(),
            profilesUsed: 0,
            sessionStart: Date.now()
        };
        
        console.log('AccessibilitySettingsUI initialized');
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            this.loadCurrentSettings();
            this.createUI();
            this.bindEvents();
            this.setupKeyboardNavigation();
            
            console.log('AccessibilitySettingsUI initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'ACCESSIBILITY_SETTINGS_UI_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * UI作成
     */
    createUI() {
        // メインコンテナの作成
        this.ui.container = document.createElement('div');
        this.ui.container.className = 'accessibility-settings-panel';
        this.ui.container.setAttribute('role', 'dialog');
        this.ui.container.setAttribute('aria-labelledby', 'settings-title');
        this.ui.container.setAttribute('aria-modal', 'true');
        
        // CSS スタイルの注入
        this.injectStyles();
        
        // レイアウト構造の作成
        this.ui.container.innerHTML = `
            <div class="settings-header">
                <h2 id="settings-title">アクセシビリティ設定</h2>
                <button class="settings-close" aria-label="設定を閉じる">×</button>
            </div>
            
            <div class="settings-body">
                <div class="settings-sidebar">
                    <nav class="settings-nav" role="navigation" aria-label="設定カテゴリ">
                        ${this.createSidebarHTML()}
                    </nav>
                </div>
                
                <div class="settings-main">
                    <div class="settings-content">
                        ${this.createMainContentHTML()}
                    </div>
                </div>
                
                <div class="settings-preview">
                    <h3>プレビュー</h3>
                    <div class="preview-content">
                        ${this.createPreviewHTML()}
                    </div>
                </div>
            </div>
            
            <div class="settings-footer">
                <button class="btn-secondary" id="reset-settings">リセット</button>
                <button class="btn-secondary" id="export-settings">エクスポート</button>
                <button class="btn-secondary" id="import-settings">インポート</button>
                <button class="btn-primary" id="apply-settings">適用</button>
            </div>
        `;
        
        // DOM参照の取得
        this.ui.sidebar = this.ui.container.querySelector('.settings-sidebar');
        this.ui.mainPanel = this.ui.container.querySelector('.settings-main');
        this.ui.previewPanel = this.ui.container.querySelector('.settings-preview');
        
        // 現在のカテゴリを表示
        this.showCategory(this.ui.currentCategory);
    }
    
    /**
     * サイドバーHTML作成
     */
    createSidebarHTML() {
        return Object.entries(this.settingCategories).map(([categoryId, category]) => `
            <button 
                class="nav-item ${categoryId === this.ui.currentCategory ? 'active' : ''}"
                data-category="${categoryId}"
                role="tab"
                aria-selected="${categoryId === this.ui.currentCategory}"
                aria-controls="panel-${categoryId}"
            >
                <span class="nav-icon">${category.icon}</span>
                <span class="nav-label">${category.name}</span>
                <span class="nav-description">${category.description}</span>
            </button>
        `).join('');
    }
    
    /**
     * メインコンテンツHTML作成
     */
    createMainContentHTML() {
        return Object.entries(this.settingCategories).map(([categoryId, category]) => `
            <div 
                class="category-panel ${categoryId === this.ui.currentCategory ? 'active' : ''}"
                id="panel-${categoryId}"
                role="tabpanel"
                aria-labelledby="nav-${categoryId}"
            >
                <div class="category-header">
                    <h3>${category.name}</h3>
                    <p>${category.description}</p>
                </div>
                
                <div class="category-settings">
                    ${this.createCategorySettingsHTML(categoryId, category)}
                </div>
            </div>
        `).join('');
    }
    
    /**
     * カテゴリ設定HTML作成
     */
    createCategorySettingsHTML(categoryId, category) {
        return category.settings.map(settingId => {
            const setting = this.settingDefinitions[settingId];
            if (!setting) return '';
            
            return this.createSettingHTML(settingId, setting);
        }).join('');
    }
    
    /**
     * 個別設定HTML作成
     */
    createSettingHTML(settingId, setting) {
        const value = this.settings.current.get(settingId) || setting.default;
        
        switch (setting.type) {
            case 'range':
                return `
                    <div class="setting-item" data-setting="${settingId}">
                        <label class="setting-label" for="${settingId}">
                            ${setting.name}
                            ${setting.description ? `<span class="setting-description">${setting.description}</span>` : ''}
                        </label>
                        <div class="setting-control">
                            <input 
                                type="range" 
                                id="${settingId}"
                                min="${setting.min}" 
                                max="${setting.max}" 
                                step="${setting.step || 1}"
                                value="${value}"
                                aria-describedby="${settingId}-value"
                            >
                            <span class="range-value" id="${settingId}-value">${value}${setting.unit || ''}</span>
                        </div>
                    </div>
                `;
                
            case 'select':
                const options = Object.entries(setting.options).map(([optValue, optLabel]) =>
                    `<option value="${optValue}" ${value === optValue ? 'selected' : ''}>${optLabel}</option>`
                ).join('');
                
                return `
                    <div class="setting-item" data-setting="${settingId}">
                        <label class="setting-label" for="${settingId}">
                            ${setting.name}
                            ${setting.description ? `<span class="setting-description">${setting.description}</span>` : ''}
                        </label>
                        <div class="setting-control">
                            <select id="${settingId}">
                                ${options}
                            </select>
                        </div>
                    </div>
                `;
                
            case 'checkbox':
                return `
                    <div class="setting-item" data-setting="${settingId}">
                        <div class="setting-control checkbox-control">
                            <input 
                                type="checkbox" 
                                id="${settingId}"
                                ${value ? 'checked' : ''}
                            >
                            <label for="${settingId}">
                                ${setting.name}
                                ${setting.description ? `<span class="setting-description">${setting.description}</span>` : ''}
                            </label>
                        </div>
                    </div>
                `;
                
            case 'group':
                const groupSettings = Object.entries(setting.settings).map(([subSettingId, subSetting]) => {
                    const fullSettingId = `${settingId}.${subSettingId}`;
                    return this.createSettingHTML(fullSettingId, subSetting);
                }).join('');
                
                return `
                    <div class="setting-group" data-setting="${settingId}">
                        <h4 class="group-title">${setting.name}</h4>
                        <div class="group-settings">
                            ${groupSettings}
                        </div>
                    </div>
                `;
                
            default:
                return '';
        }
    }
    
    /**
     * プレビューHTML作成
     */
    createPreviewHTML() {
        return `
            <div class="preview-samples">
                <div class="sample-text">
                    <h4>サンプルテキスト</h4>
                    <p>これはサンプルテキストです。設定の変更がリアルタイムで反映されます。</p>
                    <button class="sample-button">サンプルボタン</button>
                </div>
                
                <div class="sample-game-elements">
                    <div class="sample-bubble normal">通常バブル</div>
                    <div class="sample-bubble special">特殊バブル</div>
                    <div class="sample-score">スコア: 12,345</div>
                </div>
                
                <div class="sample-ui-elements">
                    <div class="sample-menu">
                        <a href="#" class="sample-link">メニュー項目</a>
                        <a href="#" class="sample-link">設定</a>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * CSSスタイル注入
     */
    injectStyles() {
        const styleId = 'accessibility-settings-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .accessibility-settings-panel {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                display: flex;
                flex-direction: column;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
            
            .settings-header {
                background: #2c3e50;
                color: white;
                padding: 1rem 2rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .settings-header h2 {
                margin: 0;
                font-size: 1.5rem;
            }
            
            .settings-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 4px;
            }
            
            .settings-close:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .settings-body {
                flex: 1;
                display: flex;
                background: white;
            }
            
            .settings-sidebar {
                width: 280px;
                background: #ecf0f1;
                border-right: 1px solid #bdc3c7;
                overflow-y: auto;
            }
            
            .settings-nav {
                padding: 1rem;
            }
            
            .nav-item {
                display: block;
                width: 100%;
                text-align: left;
                padding: 1rem;
                margin-bottom: 0.5rem;
                border: none;
                background: white;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .nav-item:hover {
                background: #3498db;
                color: white;
                transform: translateX(4px);
            }
            
            .nav-item.active {
                background: #2980b9;
                color: white;
            }
            
            .nav-icon {
                font-size: 1.2rem;
                margin-right: 0.5rem;
            }
            
            .nav-label {
                display: block;
                font-weight: 600;
                margin-bottom: 0.25rem;
            }
            
            .nav-description {
                display: block;
                font-size: 0.85rem;
                opacity: 0.8;
            }
            
            .settings-main {
                flex: 1;
                overflow-y: auto;
                padding: 2rem;
            }
            
            .category-panel {
                display: none;
            }
            
            .category-panel.active {
                display: block;
            }
            
            .category-header h3 {
                margin: 0 0 0.5rem 0;
                color: #2c3e50;
                font-size: 1.5rem;
            }
            
            .category-header p {
                margin: 0 0 2rem 0;
                color: #7f8c8d;
            }
            
            .setting-item {
                margin-bottom: 2rem;
                padding: 1.5rem;
                background: #f8f9fa;
                border-radius: 8px;
                border: 1px solid #e9ecef;
            }
            
            .setting-label {
                display: block;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 0.5rem;
            }
            
            .setting-description {
                display: block;
                font-size: 0.9rem;
                color: #7f8c8d;
                font-weight: normal;
                margin-top: 0.25rem;
            }
            
            .setting-control {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .setting-control input[type="range"] {
                flex: 1;
                height: 8px;
                background: #ddd;
                border-radius: 4px;
                outline: none;
            }
            
            .setting-control select {
                padding: 0.5rem;
                border: 1px solid #ddd;
                border-radius: 4px;
                background: white;
                min-width: 150px;
            }
            
            .checkbox-control {
                display: flex;
                align-items: flex-start;
                gap: 0.5rem;
            }
            
            .checkbox-control input[type="checkbox"] {
                margin: 0;
                transform: scale(1.2);
            }
            
            .range-value {
                min-width: 60px;
                text-align: center;
                font-weight: 600;
                color: #2980b9;
            }
            
            .setting-group {
                margin-bottom: 2rem;
                padding: 1.5rem;
                background: #f8f9fa;
                border-radius: 8px;
                border: 1px solid #e9ecef;
            }
            
            .group-title {
                margin: 0 0 1rem 0;
                color: #2c3e50;
                font-size: 1.1rem;
            }
            
            .group-settings .setting-item {
                background: white;
                margin-bottom: 1rem;
                padding: 1rem;
            }
            
            .settings-preview {
                width: 300px;
                background: #f8f9fa;
                border-left: 1px solid #bdc3c7;
                padding: 2rem;
                overflow-y: auto;
            }
            
            .settings-preview h3 {
                margin: 0 0 1rem 0;
                color: #2c3e50;
            }
            
            .preview-samples {
                space-y: 1rem;
            }
            
            .sample-text {
                padding: 1rem;
                background: white;
                border-radius: 8px;
                margin-bottom: 1rem;
            }
            
            .sample-button {
                padding: 0.5rem 1rem;
                background: #3498db;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            
            .sample-bubble {
                display: inline-block;
                padding: 0.5rem 1rem;
                margin: 0.25rem;
                border-radius: 20px;
                background: #e74c3c;
                color: white;
                font-size: 0.9rem;
            }
            
            .sample-bubble.special {
                background: #9b59b6;
            }
            
            .settings-footer {
                background: #ecf0f1;
                padding: 1rem 2rem;
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
                border-top: 1px solid #bdc3c7;
            }
            
            .btn-primary, .btn-secondary {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s;
            }
            
            .btn-primary {
                background: #2980b9;
                color: white;
            }
            
            .btn-primary:hover {
                background: #3498db;
            }
            
            .btn-secondary {
                background: #95a5a6;
                color: white;
            }
            
            .btn-secondary:hover {
                background: #7f8c8d;
            }
            
            /* フォーカススタイル */
            .nav-item:focus,
            .setting-control input:focus,
            .setting-control select:focus,
            .btn-primary:focus,
            .btn-secondary:focus {
                outline: 2px solid #3498db;
                outline-offset: 2px;
            }
            
            /* レスポンシブ対応 */
            @media (max-width: 768px) {
                .settings-body {
                    flex-direction: column;
                }
                
                .settings-sidebar {
                    width: 100%;
                    height: auto;
                    max-height: 200px;
                }
                
                .settings-preview {
                    width: 100%;
                    max-height: 300px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * イベントバインディング
     */
    bindEvents() {
        const container = this.ui.container;
        
        // サイドバーナビゲーション
        container.addEventListener('click', (event) => {
            if (event.target.closest('.nav-item')) {
                const categoryId = event.target.closest('.nav-item').dataset.category;
                this.showCategory(categoryId);
            }
        });
        
        // 設定変更
        container.addEventListener('input', (event) => {
            this.handleSettingChange(event);
        });
        
        container.addEventListener('change', (event) => {
            this.handleSettingChange(event);
        });
        
        // フッターボタン
        container.addEventListener('click', (event) => {
            if (event.target.id === 'reset-settings') {
                this.resetSettings();
            } else if (event.target.id === 'export-settings') {
                this.exportSettings();
            } else if (event.target.id === 'import-settings') {
                this.importSettings();
            } else if (event.target.id === 'apply-settings') {
                this.applySettings();
            } else if (event.target.closest('.settings-close')) {
                this.close();
            }
        });
        
        // ESCキーで閉じる
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.ui.container.style.display !== 'none') {
                this.close();
            }
        });
    }
    
    /**
     * キーボードナビゲーション設定
     */
    setupKeyboardNavigation() {
        // タブナビゲーション
        const navItems = this.ui.container.querySelectorAll('.nav-item');
        navItems.forEach((item, index) => {
            item.addEventListener('keydown', (event) => {
                if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    const nextIndex = (index + 1) % navItems.length;
                    navItems[nextIndex].focus();
                } else if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    const prevIndex = (index - 1 + navItems.length) % navItems.length;
                    navItems[prevIndex].focus();
                } else if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    item.click();
                }
            });
        });
    }
    
    /**
     * カテゴリ表示
     */
    showCategory(categoryId) {
        // ナビゲーション更新
        this.ui.container.querySelectorAll('.nav-item').forEach(item => {
            const isActive = item.dataset.category === categoryId;
            item.classList.toggle('active', isActive);
            item.setAttribute('aria-selected', isActive);
        });
        
        // パネル更新
        this.ui.container.querySelectorAll('.category-panel').forEach(panel => {
            const isActive = panel.id === `panel-${categoryId}`;
            panel.classList.toggle('active', isActive);
        });
        
        this.ui.currentCategory = categoryId;
        this.stats.categoriesVisited.add(categoryId);
        
        // アニメーション
        if (this.config.animateChanges) {
            const activePanel = this.ui.container.querySelector(`#panel-${categoryId}`);
            if (activePanel) {
                activePanel.style.opacity = '0';
                activePanel.style.transform = 'translateX(20px)';
                
                requestAnimationFrame(() => {
                    activePanel.style.transition = 'opacity 0.3s, transform 0.3s';
                    activePanel.style.opacity = '1';
                    activePanel.style.transform = 'translateX(0)';
                });
            }
        }
    }
    
    /**
     * 設定変更処理
     */
    handleSettingChange(event) {
        const settingItem = event.target.closest('[data-setting]');
        if (!settingItem) return;
        
        const settingId = settingItem.dataset.setting;
        const setting = this.settingDefinitions[settingId];
        if (!setting) return;
        
        let value;
        
        if (event.target.type === 'range') {
            value = parseFloat(event.target.value);
            // 値表示の更新
            const valueDisplay = settingItem.querySelector('.range-value');
            if (valueDisplay) {
                valueDisplay.textContent = `${value}${setting.unit || ''}`;
            }
        } else if (event.target.type === 'checkbox') {
            value = event.target.checked;
        } else if (event.target.tagName === 'SELECT') {
            value = event.target.value;
        } else {
            value = event.target.value;
        }
        
        // 設定値の更新
        this.settings.current.set(settingId, value);
        this.settings.modified.add(settingId);
        this.stats.settingsChanged++;
        
        // リアルタイムプレビュー
        if (this.config.realTimePreview) {
            this.updatePreview(settingId, value);
        }
        
        // 自動保存
        if (this.config.saveOnChange) {
            this.saveSettingsToStorage();
        }
        
        // 変更イベントの発火
        this.accessibilityManager?.eventSystem?.emit('settingChanged', {
            settingId,
            value,
            previousValue: this.settings.defaults.get(settingId),
            timestamp: Date.now()
        });
    }
    
    /**
     * プレビュー更新
     */
    updatePreview(settingId, value) {
        const previewElements = this.ui.previewPanel.querySelectorAll('.preview-samples *');
        
        switch (settingId) {
            case 'textScaling':
                previewElements.forEach(el => {
                    if (el.textContent) {
                        el.style.fontSize = `${value}em`;
                    }
                });
                break;
                
            case 'colorContrast':
                const contrastFilters = {
                    'normal': 'none',
                    'enhanced': 'contrast(1.2)',
                    'high': 'contrast(1.5)',
                    'maximum': 'contrast(2.0) brightness(1.1)'
                };
                
                this.ui.previewPanel.style.filter = contrastFilters[value];
                break;
                
            case 'colorBlindnessSupport':
                // 色覚異常シミュレーション（簡易版）
                const filters = {
                    'none': 'none',
                    'protanopia': 'hue-rotate(15deg) saturate(0.8)',
                    'deuteranopia': 'hue-rotate(-15deg) saturate(0.8)',
                    'tritanopia': 'hue-rotate(180deg) saturate(0.6)',
                    'patterns': 'none' // パターン表示は別途実装
                };
                
                this.ui.previewPanel.style.filter = filters[value];
                break;
                
            case 'motionReduction':
                const animations = this.ui.previewPanel.querySelectorAll('*');
                animations.forEach(el => {
                    if (value === 'disabled') {
                        el.style.animation = 'none';
                        el.style.transition = 'none';
                    } else if (value === 'reduced') {
                        el.style.animationDuration = '0.1s';
                        el.style.transitionDuration = '0.1s';
                    } else {
                        el.style.animation = '';
                        el.style.transition = '';
                    }
                });
                break;
        }
    }
    
    /**
     * 現在の設定読み込み
     */
    loadCurrentSettings() {
        // デフォルト値の設定
        Object.entries(this.settingDefinitions).forEach(([settingId, setting]) => {
            this.settings.defaults.set(settingId, setting.default);
            this.settings.current.set(settingId, setting.default);
        });
        
        // 保存された設定の読み込み
        try {
            const saved = localStorage.getItem('accessibilitySettings');
            if (saved) {
                const savedSettings = JSON.parse(saved);
                Object.entries(savedSettings).forEach(([settingId, value]) => {
                    this.settings.current.set(settingId, value);
                });
            }
        } catch (error) {
            console.warn('Failed to load accessibility settings:', error);
        }
    }
    
    /**
     * 設定をストレージに保存
     */
    saveSettingsToStorage() {
        try {
            const settingsObj = Object.fromEntries(this.settings.current);
            localStorage.setItem('accessibilitySettings', JSON.stringify(settingsObj));
        } catch (error) {
            console.warn('Failed to save accessibility settings:', error);
        }
    }
    
    /**
     * 設定のリセット
     */
    resetSettings() {
        if (confirm('すべての設定をデフォルトに戻しますか？')) {
            // デフォルト値に戻す
            this.settings.defaults.forEach((value, settingId) => {
                this.settings.current.set(settingId, value);
            });
            
            this.settings.modified.clear();
            
            // UI更新
            this.updateAllSettingInputs();
            
            // プレビュー更新
            if (this.config.realTimePreview) {
                this.updateAllPreviews();
            }
            
            // 保存
            this.saveSettingsToStorage();
            
            console.log('Settings reset to defaults');
        }
    }
    
    /**
     * 設定のエクスポート
     */
    exportSettings() {
        const settingsData = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            settings: Object.fromEntries(this.settings.current),
            metadata: {
                categoriesVisited: Array.from(this.stats.categoriesVisited),
                settingsChanged: this.stats.settingsChanged
            }
        };
        
        const dataStr = JSON.stringify(settingsData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `accessibility-settings-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        console.log('Settings exported');
    }
    
    /**
     * 設定のインポート
     */
    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const settingsData = JSON.parse(e.target.result);
                    
                    if (settingsData.settings) {
                        // 設定の適用
                        Object.entries(settingsData.settings).forEach(([settingId, value]) => {
                            if (this.settingDefinitions[settingId]) {
                                this.settings.current.set(settingId, value);
                            }
                        });
                        
                        // UI更新
                        this.updateAllSettingInputs();
                        
                        // プレビュー更新
                        if (this.config.realTimePreview) {
                            this.updateAllPreviews();
                        }
                        
                        // 保存
                        this.saveSettingsToStorage();
                        
                        alert('設定をインポートしました');
                        console.log('Settings imported successfully');
                    }
                } catch (error) {
                    alert('設定ファイルの読み込みに失敗しました');
                    console.error('Failed to import settings:', error);
                }
            };
            
            reader.readAsText(file);
        });
        
        input.click();
    }
    
    /**
     * すべての設定入力要素を更新
     */
    updateAllSettingInputs() {
        this.settings.current.forEach((value, settingId) => {
            const input = this.ui.container.querySelector(`#${settingId}`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = value;
                } else {
                    input.value = value;
                }
                
                // range要素の値表示更新
                if (input.type === 'range') {
                    const valueDisplay = input.parentElement.querySelector('.range-value');
                    if (valueDisplay) {
                        const setting = this.settingDefinitions[settingId];
                        valueDisplay.textContent = `${value}${setting.unit || ''}`;
                    }
                }
            }
        });
    }
    
    /**
     * すべてのプレビューを更新
     */
    updateAllPreviews() {
        this.settings.current.forEach((value, settingId) => {
            this.updatePreview(settingId, value);
        });
    }
    
    /**
     * 設定の適用
     */
    applySettings() {
        // アクセシビリティマネージャーに設定を適用
        const settingsObj = Object.fromEntries(this.settings.current);
        
        if (this.accessibilityManager) {
            this.accessibilityManager.applySettings(settingsObj);
        }
        
        // 保存
        this.saveSettingsToStorage();
        
        // 適用完了の通知
        this.showApplyNotification();
        
        console.log('Settings applied:', settingsObj);
    }
    
    /**
     * 適用完了通知
     */
    showApplyNotification() {
        const notification = document.createElement('div');
        notification.className = 'apply-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 4px;
            z-index: 10001;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = '設定が適用されました';
        
        // アニメーション用CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
            document.head.removeChild(style);
        }, 3000);
    }
    
    // パブリックAPI
    
    /**
     * 設定パネルを開く
     */
    open() {
        if (!this.ui.container.parentElement) {
            document.body.appendChild(this.ui.container);
        }
        
        this.ui.container.style.display = 'flex';
        
        // フォーカス設定
        const firstNavItem = this.ui.container.querySelector('.nav-item');
        if (firstNavItem) {
            firstNavItem.focus();
        }
        
        console.log('Accessibility settings panel opened');
    }
    
    /**
     * 設定パネルを閉じる
     */
    close() {
        this.ui.container.style.display = 'none';
        console.log('Accessibility settings panel closed');
    }
    
    /**
     * 特定のカテゴリを開く
     */
    openCategory(categoryId) {
        this.open();
        this.showCategory(categoryId);
    }
    
    /**
     * 設定値の取得
     */
    getSetting(settingId) {
        return this.settings.current.get(settingId);
    }
    
    /**
     * 設定値の設定
     */
    setSetting(settingId, value) {
        if (this.settingDefinitions[settingId]) {
            this.settings.current.set(settingId, value);
            this.settings.modified.add(settingId);
            
            // UI更新
            const input = this.ui.container.querySelector(`#${settingId}`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = value;
                } else {
                    input.value = value;
                }
            }
            
            // プレビュー更新
            if (this.config.realTimePreview) {
                this.updatePreview(settingId, value);
            }
            
            return true;
        }
        return false;
    }
    
    /**
     * 全設定の取得
     */
    getAllSettings() {
        return Object.fromEntries(this.settings.current);
    }
    
    /**
     * 統計情報の取得
     */
    getStats() {
        return {
            ...this.stats,
            categoriesVisited: Array.from(this.stats.categoriesVisited),
            modifiedSettings: Array.from(this.settings.modified),
            totalSettings: this.settings.current.size
        };
    }
    
    /**
     * 設定の適用
     */
    applyConfig(config) {
        if (config.settingsUI) {
            Object.assign(this.config, config.settingsUI);
        }
        
        console.log('AccessibilitySettingsUI configuration applied');
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
        console.log(`AccessibilitySettingsUI ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        console.log('Destroying AccessibilitySettingsUI...');
        
        // UI要素の削除
        if (this.ui.container && this.ui.container.parentElement) {
            this.ui.container.parentElement.removeChild(this.ui.container);
        }
        
        // スタイルの削除
        const style = document.getElementById('accessibility-settings-styles');
        if (style) {
            style.remove();
        }
        
        // イベントリスナーのクリア
        this.eventListeners.clear();
        
        // データのクリア
        this.settings.current.clear();
        this.settings.defaults.clear();
        this.settings.modified.clear();
        
        console.log('AccessibilitySettingsUI destroyed');
    }
}