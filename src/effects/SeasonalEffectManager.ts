/**
 * SeasonalEffectManager - 季節限定エフェクト管理メインコントローラー
 * 
 * Main Controller Patternにより、専門化されたコンポーネントを統制します。
 * 季節テーマシステム、特別イベント効果、ホリデーテーマパーティクル効果を統合管理します。
 */

import { getConfigurationManager  } from '../core/ConfigurationManager.js';
import { getErrorHandler  } from '../utils/ErrorHandler.js';
import { getEffectQualityController  } from './EffectQualityController.js';
import { ThemeManager  } from './seasonal-effect-manager/ThemeManager.js';
import { SeasonDetector  } from './seasonal-effect-manager/SeasonDetector.js';
import { CustomThemeManager  } from './seasonal-effect-manager/CustomThemeManager.js';
import { SeasonalParticleRenderer  } from './seasonal-effect-manager/SeasonalParticleRenderer.js';

/**
 * Configuration Manager interface
 */
interface ConfigurationManager { get<T>(key: string, defaultValue: T): T,
    watch(key: string, callback: (value: any) => void): void  }
}

/**
 * Error Handler interface
 */
interface ErrorHandler { handleError(error: any, context?: string): void }

/**
 * Effect Quality Controller interface
 */
interface EffectQualityController { [key: string]: any }

/**
 * Theme information interface
 */
interface ThemeInfo { season: string,
    event: string | null,
    theme: any,
    isCustom: boolean  }

/**
 * Effect statistics interface
 */
interface EffectStats { particlesCreated: number,
    effectsTriggered: number,
    themeChanges: number,
    customThemesLoaded: number }

/**
 * Settings data interface
 */
interface SettingsData { currentSeason?: string,
    customTheme?: any,
    settings?: {
        seasonalEffectsEnable,d?: boolean,
        autoSeasonDetection?: boolean,
        eventEffectsEnabled?: boolean,
        backgroundEffectEnabled?: boolean };
    customThemes?: any;
}

/**
 * Debug information interface
 */
interface DebugInfo { currentSeason: string,
    currentEvent: string | null,
    activeTheme: string | undefined,
    isCustomTheme: boolean,
    detectorStatus: any,
    effectStats: any,
    componentStatus: {
        themeManage,r: boolean,
        seasonDetector: boolean,
        customThemeManager: boolean,
    particleRenderer: boolean  }

export class SeasonalEffectManager {
    private configManager: ConfigurationManager,
    private errorHandler: ErrorHandler,
    private qualityController: EffectQualityController,
    private themeManager: ThemeManager,
    private seasonDetector: SeasonDetector,
    private customThemeManager: CustomThemeManager,
    private particleRenderer: SeasonalParticleRenderer,
    // 現在のテーマ状態
    private currentSeason: string,
    private currentEvent: string | null,
    private activeTheme: any,
    private customTheme: any,
    private lastLoggedTheme: string | null, // ログ出力制御用
    
    // 設定
    private seasonalEffectsEnabled: boolean,
    private autoSeasonDetection: boolean,
    private eventEffectsEnabled: boolean,
    private customThemesEnabled: boolean,
    private, backgroundEffectEnabled: boolean,
    constructor() {

        this.configManager = getConfigurationManager(),
        this.errorHandler = getErrorHandler(),
        this.qualityController = getEffectQualityController(),
        
        // 専門化されたコンポーネントを初期化
        this.themeManager = new ThemeManager(),
        this.seasonDetector = new SeasonDetector(),
        this.customThemeManager = new CustomThemeManager(),
        this.particleRenderer = new SeasonalParticleRenderer(this.qualityController, this.errorHandler),
        ',
        // 現在のテーマ状態
        this.currentSeason = 'spring',
        this.currentEvent = null,
        this.activeTheme = null,
        this.customTheme = null,
        this.lastLoggedTheme = null, // ログ出力制御用
        
        // 設定
        this.seasonalEffectsEnabled = true,
        this.autoSeasonDetection = true,
        this.eventEffectsEnabled = true,
        this.customThemesEnabled = true,
        this.backgroundEffectEnabled = true,
        
        this._initializeSeasonalSettings(),
        this._loadCustomThemes() }
        this._updateCurrentTheme(); }
    }
    
    /**
     * 季節エフェクト設定の初期化
     * @private
     */''
    private _initializeSeasonalSettings()';
            this.seasonalEffectsEnabled = this.configManager.get('effects.seasonal.enabled', true';
            this.autoSeasonDetection = this.configManager.get('effects.seasonal.autoDetection', true';
            this.eventEffectsEnabled = this.configManager.get('effects.seasonal.events', true';
            this.backgroundEffectEnabled = this.configManager.get('effects.seasonal.background', true';
            ';
            // 設定の監視
            this.configManager.watch('effects.seasonal.enabled', (value: boolean) => { this.setSeasonalEffectsEnabled(value),' 
    }');

            this.configManager.watch('effects.seasonal.autoDetection', (value: boolean) => { this.setAutoSeasonDetection(value) });

        } catch (error) {
            this.errorHandler.handleError(error, 'SeasonalEffectManager._initializeSeasonalSettings' }'
    }
    
    /**
     * カスタムテーマを読み込み
     * @private
     */
    private _loadCustomThemes(): void { try {
            this.customThemeManager.loadFromStorage(),' }'

        } catch (error) {
            this.errorHandler.handleError(error, 'SeasonalEffectManager._loadCustomThemes' }'
    }
    
    /**
     * 現在のテーマを更新
     * @private
     */
    private _updateCurrentTheme(): void { // カスタムテーマが設定されている場合は優先
        if(this.customTheme && this.customThemesEnabled) {
    
}
            this.activeTheme = this.customTheme; }
            console.log(`[SeasonalEffectManager] カスタムテーマ: ${this.activeTheme.name}`});
            return;
        }
        
        if(this.autoSeasonDetection && this.seasonDetector.shouldCheckSeason() {
        
            this.currentSeason = this.seasonDetector.detectCurrentSeason() }
            this.seasonDetector.updateLastSeasonCheck(); }
        }
        
        // イベントテーマのチェック
        const activeEvent = this.seasonDetector.getActiveEvent(this.themeManager.eventThemes);
        if(activeEvent && this.eventEffectsEnabled) {
            this.currentEvent = activeEvent }
            this.activeTheme = this.themeManager.getEventTheme(activeEvent); }
        } else {  this.currentEvent = null }
            this.activeTheme = this.themeManager.getSeasonalTheme(this.currentSeason); }
        }
        
        // ログ出力頻度を制御（前回と異なるテーマの場合のみ）
        if(!this.lastLoggedTheme || this.lastLoggedTheme !== this.activeTheme.name) {
    
}
            console.log(`[SeasonalEffectManager] テーマ更新: ${this.activeTheme.name}`});
            this.lastLoggedTheme = this.activeTheme.name;
        }
    }
    
    /**
     * 季節限定バブル破壊エフェクトを作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} bubbleType - バブルタイプ
     * @param {number} bubbleSize - バブルサイズ
     */
    createSeasonalBubbleEffect(x: number, y: number, bubbleType: string, bubbleSize: number): void { if (!this.seasonalEffectsEnabled || !this.activeTheme) return,
        
        try {
            this.particleRenderer.createSeasonalBubbleEffect(x, y, bubbleType, bubbleSize, this.activeTheme),' }'

        } catch (error) {
            this.errorHandler.handleError(error, 'SeasonalEffectManager.createSeasonalBubbleEffect' }'
    }
    
    /**
     * 季節限定コンボエフェクトを作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} comboCount - コンボ数
     */
    createSeasonalComboEffect(x: number, y: number, comboCount: number): void { if (!this.seasonalEffectsEnabled || !this.activeTheme) return,
        
        try {
            this.particleRenderer.createSeasonalComboEffect(x, y, comboCount, this.activeTheme),' }'

        } catch (error) {
            this.errorHandler.handleError(error, 'SeasonalEffectManager.createSeasonalComboEffect' }'
    }
    
    /**
     * 更新処理
     * @param {number} deltaTime - 経過時間
     */
    update(deltaTime: number): void { try {
            // 季節チェック（頻度制御を追加）
            if(this.seasonDetector.shouldCheckSeason() {
                const previousTheme = this.activeTheme?.name,
                this._updateCurrentTheme(),
                
                // テーマが実際に変更された場合のみ処理
                if (previousTheme !== this.activeTheme?.name) {
            }
                    this.seasonDetector.updateLastSeasonCheck(); }
}
            
            // パーティクルの更新
            this.particleRenderer.updateParticles(deltaTime);
            
            // 背景エフェクトの更新
            if (this.backgroundEffectEnabled) { this._updateBackgroundEffects(deltaTime),' }'

            } catch (error) {
            this.errorHandler.handleError(error, 'SeasonalEffectManager.update' }'
    }
    
    /**
     * 描画処理
     * @param {CanvasRenderingContext2D} context - 描画コンテキスト
     */ : undefined
    render(context: CanvasRenderingContext2D): void { if (!this.seasonalEffectsEnabled) return,
        
        try {
            // 背景エフェクトの描画
            if(this.backgroundEffectEnabled) {
    
}
                this._renderBackgroundEffects(context); }
            }
            
            // 季節パーティクルの描画
            this.particleRenderer.renderParticles(context);'} catch (error) {
            this.errorHandler.handleError(error, 'SeasonalEffectManager.render' }'
    }
    
    /**
     * 背景エフェクトの更新
     * @param {number} deltaTime - 経過時間
     * @private
     */
    private _updateBackgroundEffects(deltaTime: number): void { // 背景エフェクトの実装（簡略化）
        // 季節に応じた背景パーティクルの管理 }
    
    /**
     * 背景エフェクトの描画
     * @param {CanvasRenderingContext2D} context - 描画コンテキスト
     * @private
     */
    private _renderBackgroundEffects(context: CanvasRenderingContext2D): void { // 背景エフェクトの描画実装（簡略化）
        // 季節に応じた背景パターンの描画 }
    
    // ===== 公開API =====
    
    /**
     * 季節を手動設定
     * @param {string} season - 季節名
     */
    setSeason(season: string): void { if (this.themeManager.getAvailableSeasons().includes(season) {
            this.currentSeason = season,
            this.autoSeasonDetection = false,
            this._updateCurrentTheme() }
    }
    
    /**
     * カスタムテーマを設定
     * @param {Object} theme - カスタムテーマ
     */
    setCustomTheme(theme: any): void { if(this.themeManager.validateTheme(theme) {
            this.customTheme = theme,
            this._updateCurrentTheme() }
    }
    
    /**
     * 季節エフェクトの有効/無効を設定
     * @param {boolean} enabled - 有効フラグ
     */
    setSeasonalEffectsEnabled(enabled: boolean): void { this.seasonalEffectsEnabled = enabled,
        if(!enabled) {
    
}
            this.particleRenderer.clearAllEffects(); }
}
    
    /**
     * 自動季節検出の有効/無効を設定
     * @param {boolean} enabled - 有効フラグ
     */
    setAutoSeasonDetection(enabled: boolean): void { this.autoSeasonDetection = enabled,
        if(enabled) {
    
}
            this._updateCurrentTheme(); }
}
    
    /**
     * イベントエフェクトの有効/無効を設定
     * @param {boolean} enabled - 有効フラグ
     */
    setEventEffectsEnabled(enabled: boolean): void { this.eventEffectsEnabled = enabled,
        this._updateCurrentTheme() }
    
    /**
     * 背景エフェクトの有効/無効を設定
     * @param {boolean} enabled - 有効フラグ
     */
    setBackgroundEffectEnabled(enabled: boolean): void { this.backgroundEffectEnabled = enabled }
    
    /**
     * 現在のテーマ情報を取得
     * @returns {Object} テーマ情報
     */
    getCurrentTheme(): ThemeInfo { return { season: this.currentSeason,
            event: this.currentEvent,
    theme: this.activeTheme };
            isCustom: !!this.customTheme 
    }
    
    /**
     * 利用可能な季節一覧を取得
     * @returns {Array} 季節一覧
     */
    getAvailableSeasons(): string[] { return this.themeManager.getAvailableSeasons() }
    
    /**
     * 利用可能なイベント一覧を取得
     * @returns {Array} イベント一覧
     */
    getAvailableEvents(): string[] { return this.themeManager.getAvailableEvents() }
    
    /**
     * カスタムテーマを保存
     * @param {string} name - テーマ名
     * @param {Object} theme - テーマデータ
     * @returns {boolean} 保存成功かどうか
     */
    saveCustomTheme(name: string, theme: any): boolean { return this.customThemeManager.saveCustomTheme(name, theme) }
    
    /**
     * カスタムテーマを読み込み
     * @param {string} name - テーマ名
     * @returns {Object|null} テーマデータ
     */
    loadCustomTheme(name: string): any | null { return this.customThemeManager.loadCustomTheme(name) }
    
    /**
     * 利用可能なカスタムテーマ一覧を取得
     * @returns {Array} カスタムテーマ一覧
     */
    getAvailableCustomThemes(): string[] { return this.customThemeManager.getAvailableCustomThemes() }
    
    /**
     * エフェクト統計を取得
     * @returns {Object} 統計情報
     */
    getEffectStats(): any { const particleStats = this.particleRenderer.getEffectStats(),
        const seasonalSummary = this.seasonDetector.getSeasonalSummary(this.themeManager.eventThemes),
        const themeStats = this.themeManager.getThemeStats(),
        const customThemeStats = this.customThemeManager.getThemeStatistics(),
        
        return { ...particleStats,
            seasonal: seasonalSummary,
            themes: themeStats,
            customThemes: customThemeStats,
    settings: {
                seasonalEffectsEnabled: this.seasonalEffectsEnabled,
                autoSeasonDetection: this.autoSeasonDetection,
    eventEffectsEnabled: this.eventEffectsEnabled };
                backgroundEffectEnabled: this.backgroundEffectEnabled 
    }
    
    /**
     * 設定をエクスポート
     * @returns {Object} 設定データ
     */
    exportSettings(): any { return { currentSeason: this.currentSeason,
            customTheme: this.customTheme,
    settings: {
                seasonalEffectsEnabled: this.seasonalEffectsEnabled,
                autoSeasonDetection: this.autoSeasonDetection,
    eventEffectsEnabled: this.eventEffectsEnabled };
                backgroundEffectEnabled: this.backgroundEffectEnabled 
    };
            customThemes: this.customThemeManager.createBackup();
        }
    
    /**
     * 設定をインポート
     * @param {Object} settingsData - 設定データ
     * @returns {boolean} インポート成功かどうか
     */
    importSettings(settingsData: SettingsData): boolean { try {
            if(settingsData.settings) {
    
}
                Object.assign(this, settingsData.settings); }
            }
            
            if (settingsData.currentSeason) { this.currentSeason = settingsData.currentSeason }
            
            if (settingsData.customTheme) { this.customTheme = settingsData.customTheme }
            
            if (settingsData.customThemes) { this.customThemeManager.restoreFromBackup(settingsData.customThemes) }
            
            this._updateCurrentTheme();
            return true;} catch (error) {
            this.errorHandler.handleError(error, 'SeasonalEffectManager.importSettings),
            return false,
    
    /**
     * すべてのエフェクトをクリア
     */
    clearAllEffects(): void { this.particleRenderer.clearAllEffects() }

    /**
     * リソースのクリーンアップと破棄
     * Issue #106: テスト環境での適切なクリーンアップ対応
     */
    dispose(): void { try {
            // エフェクトのクリア
            this.clearAllEffects()',
            if(this.particleRenderer && typeof, this.particleRenderer.dispose === 'function' {'

                this.particleRenderer.dispose() }

            console.debug('[SeasonalEffectManager] Successfully, disposed'); }

        } catch (error) { console.error('[SeasonalEffectManager] Error during disposal:', error }
    }
    
    /**
     * デバッグ情報を取得
     * @returns {Object} デバッグ情報
     */
    getDebugInfo(): DebugInfo { return { currentSeason: this.currentSeason,
            currentEvent: this.currentEvent,
    activeTheme: this.activeTheme?.name, : undefined
            isCustomTheme: !!this.customTheme,
            detectorStatus: this.seasonDetector.getDetectorStatus(),
            effectStats: this.getEffectStats(
    componentStatus: {
                themeManager: !!this.themeManager,
                seasonDetector: !!this.seasonDetector,
    customThemeManager: !!this.customThemeManager };
                particleRenderer: !!this.particleRenderer 
    }
}

// Singleton instance
let seasonalEffectManagerInstance: SeasonalEffectManager | null = null,

/**
 * SeasonalEffectManagerのシングルトンインスタンスを取得
 * @returns {SeasonalEffectManager}
 */
export function getSeasonalEffectManager(): SeasonalEffectManager { if (!seasonalEffectManagerInstance) {''
        seasonalEffectManagerInstance = new SeasonalEffectManager(' }''