/**
 * SettingsUIController
 * UI関連設定管理、言語検出・管理、品質設定・UIスケール管理、アニメーション・表示設定を担当
 */
export class SettingsUIController {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
        this.configManager = settingsManager.configManager;
        this.gameEngine = settingsManager.gameEngine;
        this.errorHandler = settingsManager.errorHandler;
        
        // UI更新統計
        this.updateStats = {
            qualityChanges: 0,
            languageChanges: 0,
            scaleChanges: 0,
            lastUpdateTime: 0
        };
        
        console.log('[SettingsUIController] Component initialized');
    }
    
    /**
     * 品質設定を適用
     * @param {string} quality 品質レベル ('low', 'medium', 'high', 'auto')
     */
    applyQualityChange(quality) {
        try {
            console.log(`[SettingsUIController] Applying quality change: ${quality}`);
            
            // ゲームエンジンに品質設定を適用
            if (this.gameEngine && this.gameEngine.performanceOptimizer) {
                this.gameEngine.performanceOptimizer.setQualityLevel(quality);
            }
            
            // パフォーマンス最適化システムに通知
            if (this.gameEngine && this.gameEngine.configurationManager) {
                this.gameEngine.configurationManager.notifyUpdate('performance.quality', quality);
            }
            
            // 統計更新
            this.updateStats.qualityChanges++;
            this.updateStats.lastUpdateTime = Date.now();
            
            console.log(`[SettingsUIController] Quality change applied successfully: ${quality}`);
        } catch (error) {
            this.errorHandler.handleError(error, 'SETTINGS_QUALITY_CHANGE_ERROR', {
                quality,
                component: 'SettingsUIController'
            });
            throw error;
        }
    }
    
    /**
     * 言語変更を処理
     * @param {string} language 言語コード ('ja', 'en')
     */
    async handleLanguageChange(language) {
        try {
            console.log(`[SettingsUIController] Handling language change: ${language}`);
            
            // 国際化マネージャーに言語変更を適用
            if (this.gameEngine && this.gameEngine.localizationManager) {
                await this.gameEngine.localizationManager.setLanguage(language);
            }
            
            // UIの再描画をトリガー
            if (this.gameEngine && this.gameEngine.sceneManager) {
                this.gameEngine.refreshAllScenes();
            }
            
            // 統計更新
            this.updateStats.languageChanges++;
            this.updateStats.lastUpdateTime = Date.now();
            
            console.log(`[SettingsUIController] Language change handled successfully: ${language}`);
        } catch (error) {
            this.errorHandler.handleError(error, 'SETTINGS_LANGUAGE_CHANGE_ERROR', {
                language,
                component: 'SettingsUIController'
            });
            throw error;
        }
    }
    
    /**
     * ハイコントラストモードを適用
     * @param {boolean} enabled ハイコントラストモード有効/無効
     */
    applyHighContrastMode(enabled) {
        try {
            console.log(`[SettingsUIController] Applying high contrast mode: ${enabled}`);
            
            // CSS クラスの追加/削除
            if (enabled) {
                document.body.classList.add('high-contrast');
            } else {
                document.body.classList.remove('high-contrast');
            }
            
            // ゲームエンジンに通知
            if (this.gameEngine && this.gameEngine.accessibilityManager) {
                this.gameEngine.accessibilityManager.setHighContrast(enabled);
            }
            
            console.log(`[SettingsUIController] High contrast mode applied: ${enabled}`);
        } catch (error) {
            this.errorHandler.handleError(error, 'SETTINGS_HIGH_CONTRAST_ERROR', {
                enabled,
                component: 'SettingsUIController'
            });
        }
    }
    
    /**
     * モーション軽減モードを適用
     * @param {boolean} enabled モーション軽減モード有効/無効
     */
    applyReducedMotionMode(enabled) {
        try {
            console.log(`[SettingsUIController] Applying reduced motion mode: ${enabled}`);
            
            // CSS プロパティの設定
            document.documentElement.style.setProperty(
                '--animation-duration',
                enabled ? '0ms' : 'var(--default-animation-duration)'
            );
            
            // アニメーションマネージャーに通知
            if (this.gameEngine && this.gameEngine.animationManager) {
                this.gameEngine.animationManager.updateSettings({
                    enabled: !enabled,  // When reduced motion is enabled, disable animations
                    globalSpeed: enabled ? 0.5 : 1.0  // Reduce animation speed when reduced motion is enabled
                });
            }
            
            // パーティクルシステムに通知
            if (this.gameEngine && this.gameEngine.particleManager) {
                this.gameEngine.particleManager.setReducedEffects(enabled);
            }
            
            console.log(`[SettingsUIController] Reduced motion mode applied: ${enabled}`);
        } catch (error) {
            this.errorHandler.handleError(error, 'SETTINGS_REDUCED_MOTION_ERROR', {
                enabled,
                component: 'SettingsUIController'
            });
        }
    }
    
    /**
     * 大文字モードを適用
     * @param {boolean} enabled 大文字モード有効/無効
     */
    applyLargeTextMode(enabled) {
        try {
            console.log(`[SettingsUIController] Applying large text mode: ${enabled}`);
            
            // CSS クラスの追加/削除
            if (enabled) {
                document.body.classList.add('large-text');
            } else {
                document.body.classList.remove('large-text');
            }
            
            console.log(`[SettingsUIController] Large text mode applied: ${enabled}`);
        } catch (error) {
            this.errorHandler.handleError(error, 'SETTINGS_LARGE_TEXT_ERROR', {
                enabled,
                component: 'SettingsUIController'
            });
        }
    }
    
    /**
     * UIスケールを適用
     * @param {number} scale UIスケール値 (0.5-2.0)
     */
    applyUIScale(scale) {
        try {
            console.log(`[SettingsUIController] Applying UI scale: ${scale}`);
            
            // CSS カスタムプロパティに設定
            document.documentElement.style.setProperty('--ui-scale', scale.toString());
            
            // 統計更新
            this.updateStats.scaleChanges++;
            this.updateStats.lastUpdateTime = Date.now();
            
            console.log(`[SettingsUIController] UI scale applied: ${scale}`);
        } catch (error) {
            this.errorHandler.handleError(error, 'SETTINGS_UI_SCALE_ERROR', {
                scale,
                component: 'SettingsUIController'
            });
        }
    }
    
    /**
     * 設定変更を適用（設定タイプに応じて適切なメソッドを呼び出し）
     * @param {string} key 設定キー
     * @param {*} newValue 新しい値
     * @param {*} oldValue 古い値
     */
    applySettingChange(key, newValue, oldValue) {
        try {
            console.log(`[SettingsUIController] Applying setting change: ${key} = ${newValue}`);
            
            switch (key) {
                case 'quality':
                case 'ui.quality':
                    this.applyQualityChange(newValue);
                    break;
                    
                case 'language':
                case 'ui.language':
                    this.handleLanguageChange(newValue);
                    break;
                    
                case 'accessibility.highContrast':
                    this.applyHighContrastMode(newValue);
                    break;
                    
                case 'accessibility.reducedMotion':
                    this.applyReducedMotionMode(newValue);
                    break;
                    
                case 'accessibility.largeText':
                    this.applyLargeTextMode(newValue);
                    break;
                    
                case 'ui.uiScale':
                case 'uiScale':
                    this.applyUIScale(newValue);
                    break;
                    
                default:
                    console.log(`[SettingsUIController] No specific handler for setting: ${key}`);
                    break;
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'SETTINGS_APPLY_CHANGE_ERROR', {
                key,
                newValue,
                oldValue,
                component: 'SettingsUIController'
            });
        }
    }
    
    /**
     * 全てのUI設定を適用
     */
    applyAllUISettings() {
        try {
            console.log('[SettingsUIController] Applying all UI settings');
            
            // 現在の設定値を取得して適用
            const quality = this.configManager.get('ui.quality');
            if (quality) {
                this.applyQualityChange(quality);
            }
            
            const language = this.configManager.get('ui.language');
            if (language) {
                this.handleLanguageChange(language);
            }
            
            const highContrast = this.configManager.get('accessibility.highContrast');
            if (highContrast !== undefined) {
                this.applyHighContrastMode(highContrast);
            }
            
            const reducedMotion = this.configManager.get('accessibility.reducedMotion');
            if (reducedMotion !== undefined) {
                this.applyReducedMotionMode(reducedMotion);
            }
            
            const largeText = this.configManager.get('accessibility.largeText');
            if (largeText !== undefined) {
                this.applyLargeTextMode(largeText);
            }
            
            const uiScale = this.configManager.get('ui.uiScale');
            if (uiScale !== undefined) {
                this.applyUIScale(uiScale);
            }
            
            console.log('[SettingsUIController] All UI settings applied successfully');
        } catch (error) {
            this.errorHandler.handleError(error, 'SETTINGS_APPLY_ALL_UI_ERROR', {
                component: 'SettingsUIController'
            });
        }
    }
    
    /**
     * UIコンポーネントウォッチャーを追加
     * @param {string} componentName コンポーネント名
     * @param {Object} component コンポーネントオブジェクト
     * @param {Array} watchedSettings 監視する設定のリスト
     * @returns {string} ウォッチャーID
     */
    addComponentWatcher(componentName, component, watchedSettings) {
        const watcherId = `ui_${componentName}_${Date.now()}`;
        
        // 設定変更リスナーを追加
        for (const setting of watchedSettings) {
            this.settingsManager.addListener(setting, (newValue, oldValue) => {
                if (component.onSettingChange) {
                    component.onSettingChange(setting, newValue, oldValue);
                }
            }, {
                id: `${watcherId}_${setting}`,
                priority: 'high'
            });
        }
        
        console.log(`[SettingsUIController] Component watcher added: ${componentName} (${watcherId})`);
        return watcherId;
    }
    
    /**
     * UIコンポーネントウォッチャーを削除
     * @param {string} watcherId ウォッチャーID
     */
    removeComponentWatcher(watcherId) {
        try {
            // ウォッチャーIDに関連するリスナーを削除
            this.settingsManager.removeListenerById(watcherId);
            console.log(`[SettingsUIController] Component watcher removed: ${watcherId}`);
        } catch (error) {
            console.warn(`[SettingsUIController] Failed to remove component watcher: ${watcherId}`, error);
        }
    }
    
    /**
     * UI統計情報を取得
     * @returns {Object} UI設定統計
     */
    getUIStats() {
        return {
            updateStats: { ...this.updateStats },
            currentSettings: {
                quality: this.configManager.get('ui.quality'),
                language: this.configManager.get('ui.language'),
                uiScale: this.configManager.get('ui.uiScale'),
                highContrast: this.configManager.get('accessibility.highContrast'),
                reducedMotion: this.configManager.get('accessibility.reducedMotion'),
                largeText: this.configManager.get('accessibility.largeText')
            }
        };
    }
    
    /**
     * リセット（統計情報をクリア）
     */
    reset() {
        this.updateStats = {
            qualityChanges: 0,
            languageChanges: 0,
            scaleChanges: 0,
            lastUpdateTime: 0
        };
        
        console.log('[SettingsUIController] Statistics reset');
    }
}