/**
 * AccessibilitySettingsPanel - UI rendering and presentation layer
 * Handles UI creation, styling, and visual presentation for accessibility settings
 */
export class AccessibilitySettingsPanel {
    constructor(config = {}) {
        this.config = {
            showAdvancedSettings: false,
            showTooltips: true,
            animateChanges: true,
            responsiveDesign: true,
            ...config
        };

        // UI 要素
        this.ui = {
            container: null,
            sidebar: null,
            mainPanel: null,
            previewPanel: null,
            currentCategory: 'visual',
            settingElements: new Map(),
            previewElements: new Map()
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

        this.initialized = false;
    }

    /**
     * Initialize panel
     */
    initialize() {
        if (this.initialized) return true;

        console.log('AccessibilitySettingsPanel: Initializing...');
        
        try {
            this.initialized = true;
            console.log('AccessibilitySettingsPanel: Initialized successfully');
            return true;
        } catch (error) {
            console.error('AccessibilitySettingsPanel: Initialization error:', error);
            return false;
        }
    }

    /**
     * Create complete UI structure
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
        
        return this.ui.container;
    }

    /**
     * Create sidebar navigation HTML
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
     * Create main content panels HTML
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
     * Create category-specific settings HTML
     */
    createCategorySettingsHTML(categoryId, category) {
        return category.settings.map(settingId => {
            // プレースホルダー設定定義（本来は外部から提供される）
            const placeholderSettings = this.getPlaceholderSettingDefinitions();
            const setting = placeholderSettings[settingId];
            if (!setting) return '';
            
            return this.createSettingHTML(settingId, setting);
        }).join('');
    }

    /**
     * Create individual setting HTML element
     */
    createSettingHTML(settingId, setting, currentValue = null) {
        const value = currentValue || setting.default;
        
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
     * Create preview panel HTML
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
     * Inject CSS styles into document
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
            
            /* Focus styles */
            .nav-item:focus,
            .setting-control input:focus,
            .setting-control select:focus,
            .btn-primary:focus,
            .btn-secondary:focus {
                outline: 2px solid #3498db;
                outline-offset: 2px;
            }
            
            /* Responsive design */
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
     * Show specific category panel
     */
    showCategory(categoryId) {
        if (!this.ui.container) return;

        // Update navigation
        this.ui.container.querySelectorAll('.nav-item').forEach(item => {
            const isActive = item.dataset.category === categoryId;
            item.classList.toggle('active', isActive);
            item.setAttribute('aria-selected', isActive);
        });
        
        // Update panels
        this.ui.container.querySelectorAll('.category-panel').forEach(panel => {
            const isActive = panel.id === `panel-${categoryId}`;
            panel.classList.toggle('active', isActive);
        });
        
        this.ui.currentCategory = categoryId;
        
        // Add animation if enabled
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
     * Update preview with setting value
     */
    updatePreview(settingId, value) {
        if (!this.ui.previewPanel) return;

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
                // Color blindness simulation
                const filters = {
                    'none': 'none',
                    'protanopia': 'hue-rotate(15deg) saturate(0.8)',
                    'deuteranopia': 'hue-rotate(-15deg) saturate(0.8)',
                    'tritanopia': 'hue-rotate(180deg) saturate(0.6)',
                    'patterns': 'none'
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
     * Update setting input display value
     */
    updateSettingInput(settingId, value) {
        if (!this.ui.container) return;

        const input = this.ui.container.querySelector(`#${settingId}`);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = value;
            } else {
                input.value = value;
            }
            
            // Update range display value
            if (input.type === 'range') {
                const valueDisplay = input.parentElement.querySelector('.range-value');
                if (valueDisplay) {
                    const placeholderSettings = this.getPlaceholderSettingDefinitions();
                    const setting = placeholderSettings[settingId];
                    valueDisplay.textContent = `${value}${setting?.unit || ''}`;
                }
            }
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `apply-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 4px;
            z-index: 10001;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        
        // Add animation CSS
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
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        }, 3000);
    }

    /**
     * Get placeholder setting definitions (for UI creation)
     */
    getPlaceholderSettingDefinitions() {
        return {
            textScaling: {
                name: 'テキストサイズ',
                type: 'range',
                min: 0.5,
                max: 3.0,
                step: 0.1,
                default: 1.0,
                unit: '倍',
                description: 'テキストサイズを調整します'
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
            }
        };
    }

    /**
     * Get UI container
     */
    getContainer() {
        return this.ui.container;
    }

    /**
     * Remove styles from document
     */
    removeStyles() {
        const style = document.getElementById('accessibility-settings-styles');
        if (style) {
            style.remove();
        }
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = {
            ...this.config,
            ...newConfig
        };
        console.log('AccessibilitySettingsPanel: Configuration updated');
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        console.log('AccessibilitySettingsPanel: Destroying...');
        
        // Remove UI elements
        if (this.ui.container && this.ui.container.parentElement) {
            this.ui.container.parentElement.removeChild(this.ui.container);
        }
        
        // Remove styles
        this.removeStyles();
        
        // Clear UI references
        this.ui.container = null;
        this.ui.sidebar = null;
        this.ui.mainPanel = null;
        this.ui.previewPanel = null;
        this.ui.settingElements.clear();
        this.ui.previewElements.clear();
        
        this.initialized = false;
        console.log('AccessibilitySettingsPanel: Destroyed');
    }
}