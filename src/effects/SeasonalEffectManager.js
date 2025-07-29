import { getConfigurationManager } from '../core/ConfigurationManager.js';
import { getErrorHandler } from '../utils/ErrorHandler.js';
import { getEffectQualityController } from './EffectQualityController.js';

/**
 * 季節限定エフェクト管理クラス
 * 
 * 季節テーマシステム、特別イベント効果、
 * ホリデーテーマパーティクル効果を管理します。
 */
export class SeasonalEffectManager {
    constructor() {
        this.configManager = getConfigurationManager();
        this.errorHandler = getErrorHandler();
        this.qualityController = getEffectQualityController();
        
        // 季節テーマ定義
        this.seasonalThemes = {
            spring: {
                name: '春',
                colors: {
                    primary: ['#FFB6C1', '#98FB98', '#87CEEB'],
                    secondary: ['#F0E68C', '#DDA0DD', '#20B2AA'],
                    accent: ['#FF69B4', '#32CD32', '#4169E1']
                },
                particles: {
                    types: ['cherry_blossom', 'flower_petal', 'butterfly', 'pollen'],
                    density: 0.3,
                    movement: 'gentle_sway',
                    spawnRate: 0.8
                },
                effects: {
                    bubbleDestruction: 'flower_burst',
                    comboEffect: 'spring_shower',
                    backgroundPattern: 'sakura_drift'
                },
                audio: {
                    ambientSounds: ['birds_chirping', 'gentle_breeze'],
                    destructionSounds: ['flower_pop', 'wind_chime']
                }
            },
            summer: {
                name: '夏',
                colors: {
                    primary: ['#FFD700', '#FF6347', '#00CED1'],
                    secondary: ['#FFA500', '#FF4500', '#1E90FF'],
                    accent: ['#FFFF00', '#FF0000', '#00BFFF']
                },
                particles: {
                    types: ['sunshine_ray', 'beach_bubble', 'firefly', 'water_drop'],
                    density: 0.4,
                    movement: 'energetic_bounce',
                    spawnRate: 1.2
                },
                effects: {
                    bubbleDestruction: 'splash_burst',
                    comboEffect: 'summer_fireworks',
                    backgroundPattern: 'heat_wave'
                },
                audio: {
                    ambientSounds: ['ocean_waves', 'cicada_song'],
                    destructionSounds: ['splash', 'sizzle']
                }
            },
            autumn: {
                name: '秋',
                colors: {
                    primary: ['#FF4500', '#DAA520', '#8B4513'],
                    secondary: ['#DC143C', '#B8860B', '#A0522D'],
                    accent: ['#FF8C00', '#CD853F', '#D2691E']
                },
                particles: {
                    types: ['maple_leaf', 'acorn', 'autumn_wind', 'harvest_grain'],
                    density: 0.35,
                    movement: 'spiral_fall',
                    spawnRate: 1.0
                },
                effects: {
                    bubbleDestruction: 'leaf_scatter',
                    comboEffect: 'autumn_whirlwind',
                    backgroundPattern: 'falling_leaves'
                },
                audio: {
                    ambientSounds: ['rustling_leaves', 'autumn_breeze'],
                    destructionSounds: ['leaf_crackle', 'wind_gust']
                }
            },
            winter: {
                name: '冬',
                colors: {
                    primary: ['#E0E0E0', '#87CEEB', '#B0C4DE'],
                    secondary: ['#F0F8FF', '#ADD8E6', '#4682B4'],
                    accent: ['#FFFFFF', '#00BFFF', '#1E90FF']
                },
                particles: {
                    types: ['snowflake', 'ice_crystal', 'frost_sparkle', 'winter_breath'],
                    density: 0.25,
                    movement: 'gentle_drift',
                    spawnRate: 0.6
                },
                effects: {
                    bubbleDestruction: 'ice_shatter',
                    comboEffect: 'blizzard_burst',
                    backgroundPattern: 'snow_fall'
                },
                audio: {
                    ambientSounds: ['wind_howl', 'snow_crunch'],
                    destructionSounds: ['ice_crack', 'crystal_chime']
                }
            }
        };
        
        // 特別イベントテーマ
        this.eventThemes = {
            new_year: {
                name: '新年',
                duration: { start: '01-01', end: '01-07' },
                colors: {
                    primary: ['#FFD700', '#FF0000', '#FFFFFF'],
                    secondary: ['#FFA500', '#DC143C', '#F0F8FF'],
                    accent: ['#FFFF00', '#FF69B4', '#00BFFF']
                },
                particles: {
                    types: ['firework', 'confetti', 'gold_coin', 'blessing_light'],
                    density: 0.5,
                    movement: 'celebration_burst',
                    spawnRate: 1.5
                },
                effects: {
                    bubbleDestruction: 'firework_burst',
                    comboEffect: 'new_year_celebration',
                    backgroundPattern: 'firework_sky'
                }
            },
            valentine: {
                name: 'バレンタイン',
                duration: { start: '02-10', end: '02-20' },
                colors: {
                    primary: ['#FF69B4', '#FF1493', '#FFB6C1'],
                    secondary: ['#DC143C', '#C71585', '#DB7093'],
                    accent: ['#FF6347', '#FF0000', '#FF8C69']
                },
                particles: {
                    types: ['heart', 'rose_petal', 'chocolate_chip', 'love_sparkle'],
                    density: 0.4,
                    movement: 'romantic_float',
                    spawnRate: 1.1
                },
                effects: {
                    bubbleDestruction: 'heart_burst',
                    comboEffect: 'love_cascade',
                    backgroundPattern: 'heart_rain'
                }
            },
            halloween: {
                name: 'ハロウィン',
                duration: { start: '10-25', end: '11-01' },
                colors: {
                    primary: ['#FF8C00', '#800080', '#000000'],
                    secondary: ['#FF4500', '#9932CC', '#2F2F2F'],
                    accent: ['#FFD700', '#8A2BE2', '#FF6347']
                },
                particles: {
                    types: ['pumpkin', 'bat', 'ghost', 'witch_spark'],
                    density: 0.35,
                    movement: 'spooky_dance',
                    spawnRate: 0.9
                },
                effects: {
                    bubbleDestruction: 'spooky_burst',
                    comboEffect: 'halloween_magic',
                    backgroundPattern: 'haunted_mist'
                }
            },
            christmas: {
                name: 'クリスマス',
                duration: { start: '12-20', end: '12-26' },
                colors: {
                    primary: ['#FF0000', '#228B22', '#FFD700'],
                    secondary: ['#DC143C', '#006400', '#FFA500'],
                    accent: ['#FFFFFF', '#32CD32', '#FFFF00']
                },
                particles: {
                    types: ['snowflake', 'christmas_star', 'present_box', 'holly_leaf'],
                    density: 0.45,
                    movement: 'christmas_twinkle',
                    spawnRate: 1.3
                },
                effects: {
                    bubbleDestruction: 'christmas_burst',
                    comboEffect: 'christmas_miracle',
                    backgroundPattern: 'christmas_lights'
                }
            }
        };
        
        // 現在のテーマ状態
        this.currentSeason = 'spring';
        this.currentEvent = null;
        this.activeTheme = null;
        this.customTheme = null;
        this.lastSeasonCheck = 0;
        this.seasonCheckInterval = 60000; // 1分間隔
        
        // エフェクト状態
        this.activeSeasonalEffects = new Map();
        this.seasonalParticles = [];
        this.backgroundEffectEnabled = true;
        
        // 設定
        this.seasonalEffectsEnabled = true;
        this.autoSeasonDetection = true;
        this.eventEffectsEnabled = true;
        this.customThemesEnabled = true;
        
        // カスタムテーマ管理
        this.customThemes = new Map();
        this.userThemes = new Map();
        this.themeHistory = [];
        
        this._initializeSeasonalSettings();
        this._loadCustomThemes();
        this._updateCurrentTheme();
    }
    
    /**
     * 季節エフェクト設定の初期化
     * @private
     */
    _initializeSeasonalSettings() {
        try {
            // 設定マネージャーから設定を読み込み
            this.seasonalEffectsEnabled = this.configManager.get('effects.seasonal.enabled', true);
            this.autoSeasonDetection = this.configManager.get('effects.seasonal.autoDetection', true);
            this.eventEffectsEnabled = this.configManager.get('effects.seasonal.events', true);
            this.backgroundEffectEnabled = this.configManager.get('effects.seasonal.background', true);
            
            // 設定の監視
            this.configManager.watch('effects.seasonal.enabled', (value) => {
                this.setSeasonalEffectsEnabled(value);
            });
            
            this.configManager.watch('effects.seasonal.autoDetection', (value) => {
                this.setAutoSeasonDetection(value);
            });
            
        } catch (error) {
            this.errorHandler.handleError(error, 'SeasonalEffectManager._initializeSeasonalSettings');
        }
    }
    
    /**
     * 現在のテーマを更新
     * @private
     */
    _updateCurrentTheme() {
        // カスタムテーマが設定されている場合は優先
        if (this.customTheme && this.customThemesEnabled) {
            this.activeTheme = this.customTheme;
            console.log(`[SeasonalEffectManager] カスタムテーマ: ${this.activeTheme.name}`);
            return;
        }
        
        if (this.autoSeasonDetection) {
            this._detectCurrentSeason();
        }
        
        // イベントテーマのチェック
        const activeEvent = this._getActiveEvent();
        if (activeEvent && this.eventEffectsEnabled) {
            this.currentEvent = activeEvent;
            this.activeTheme = this.eventThemes[activeEvent];
        } else {
            this.currentEvent = null;
            this.activeTheme = this.seasonalThemes[this.currentSeason];
        }
        
        console.log(`[SeasonalEffectManager] テーマ更新: ${this.activeTheme.name}`);
    }
    
    /**
     * 現在の季節を検出
     * @private
     */
    _detectCurrentSeason() {
        const now = new Date();
        const month = now.getMonth() + 1; // 0-based to 1-based
        const day = now.getDate();
        
        // 季節の判定（北半球基準）
        if ((month === 3 && day >= 20) || (month === 4) || (month === 5) || (month === 6 && day < 21)) {
            this.currentSeason = 'spring';
        } else if ((month === 6 && day >= 21) || (month === 7) || (month === 8) || (month === 9 && day < 23)) {
            this.currentSeason = 'summer';
        } else if ((month === 9 && day >= 23) || (month === 10) || (month === 11) || (month === 12 && day < 21)) {
            this.currentSeason = 'autumn';
        } else {
            this.currentSeason = 'winter';
        }
    }
    
    /**
     * 現在のアクティブイベントを取得
     * @returns {string|null} イベント名
     * @private
     */
    _getActiveEvent() {
        const now = new Date();
        const currentDate = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        for (const [eventName, event] of Object.entries(this.eventThemes)) {
            if (currentDate >= event.duration.start && currentDate <= event.duration.end) {
                return eventName;
            }
        }
        
        return null;
    }
    
    /**
     * 季節限定バブル破壊エフェクトを作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} bubbleType - バブルタイプ
     * @param {number} bubbleSize - バブルサイズ
     */
    createSeasonalBubbleEffect(x, y, bubbleType, bubbleSize) {
        if (!this.seasonalEffectsEnabled || !this.activeTheme) return;
        
        // エフェクト実行可否のチェック
        if (!this.qualityController.canExecuteEffect('particle', 'normal')) {
            return;
        }
        
        try {
            const effect = this.activeTheme.effects.bubbleDestruction;
            const colors = this.activeTheme.colors.primary;
            const particleTypes = this.activeTheme.particles.types;
            
            this._createThemeSpecificEffect(x, y, effect, {
                colors,
                particleTypes,
                size: bubbleSize,
                intensity: this._getEffectIntensity()
            });
            
        } catch (error) {
            this.errorHandler.handleError(error, 'SeasonalEffectManager.createSeasonalBubbleEffect');
        }
    }
    
    /**
     * 季節限定コンボエフェクトを作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} comboCount - コンボ数
     */
    createSeasonalComboEffect(x, y, comboCount) {
        if (!this.seasonalEffectsEnabled || !this.activeTheme) return;
        
        // コンボエフェクトは重要度が高い
        const priority = comboCount >= 10 ? 'critical' : 'important';
        if (!this.qualityController.canExecuteEffect('particle', priority)) {
            return;
        }
        
        try {
            const effect = this.activeTheme.effects.comboEffect;
            const colors = this.activeTheme.colors.accent;
            const particleTypes = this.activeTheme.particles.types;
            
            this._createThemeSpecificEffect(x, y, effect, {
                colors,
                particleTypes,
                intensity: Math.min(comboCount * 0.2, 2.0),
                particleCount: Math.min(comboCount * 3, 30)
            });
            
        } catch (error) {
            this.errorHandler.handleError(error, 'SeasonalEffectManager.createSeasonalComboEffect');
        }
    }
    
    /**
     * テーマ固有エフェクトの作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} effectType - エフェクトタイプ
     * @param {Object} config - 設定
     * @private
     */
    _createThemeSpecificEffect(x, y, effectType, config) {
        const effectId = `seasonal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const effect = {
            id: effectId,
            type: effectType,
            x: x,
            y: y,
            config: config,
            createdTime: performance.now(),
            particles: []
        };
        
        // エフェクトタイプに応じたパーティクル生成
        switch (effectType) {
            case 'flower_burst':
                this._createFlowerBurstEffect(effect);
                break;
            case 'splash_burst':
                this._createSplashBurstEffect(effect);
                break;
            case 'leaf_scatter':
                this._createLeafScatterEffect(effect);
                break;
            case 'ice_shatter':
                this._createIceShatterEffect(effect);
                break;
            case 'firework_burst':
                this._createFireworkBurstEffect(effect);
                break;
            case 'heart_burst':
                this._createHeartBurstEffect(effect);
                break;
            case 'spooky_burst':
                this._createSpookyBurstEffect(effect);
                break;
            case 'christmas_burst':
                this._createChristmasBurstEffect(effect);
                break;
            default:
                this._createDefaultSeasonalEffect(effect);
        }
        
        this.activeSeasonalEffects.set(effectId, effect);
    }
    
    /**
     * 花の爆発エフェクト（春）
     * @param {Object} effect - エフェクト
     * @private
     */
    _createFlowerBurstEffect(effect) {
        const particleCount = Math.floor(15 * this._getEffectIntensity());
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 2 + Math.random() * 3;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({
                x: effect.x,
                y: effect.y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: 3 + Math.random() * 4,
                color: color,
                life: 1.0,
                decay: 0.015,
                type: 'cherry_blossom',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1
            });
        }
    }
    
    /**
     * 水しぶきエフェクト（夏）
     * @param {Object} effect - エフェクト
     * @private
     */
    _createSplashBurstEffect(effect) {
        const particleCount = Math.floor(20 * this._getEffectIntensity());
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
            const velocity = 3 + Math.random() * 4;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({
                x: effect.x,
                y: effect.y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - 1, // 上向きの初速
                size: 2 + Math.random() * 3,
                color: color,
                life: 1.0,
                decay: 0.02,
                type: 'water_drop',
                gravity: 0.15,
                bounce: 0.3
            });
        }
    }
    
    /**
     * 葉っぱ散乱エフェクト（秋）
     * @param {Object} effect - エフェクト
     * @private
     */
    _createLeafScatterEffect(effect) {
        const particleCount = Math.floor(12 * this._getEffectIntensity());
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 1.5 + Math.random() * 2.5;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({
                x: effect.x,
                y: effect.y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: 4 + Math.random() * 3,
                color: color,
                life: 1.0,
                decay: 0.012,
                type: 'maple_leaf',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.15,
                flutter: Math.random() * 0.1
            });
        }
    }
    
    /**
     * 氷の粉砕エフェクト（冬）
     * @param {Object} effect - エフェクト
     * @private
     */
    _createIceShatterEffect(effect) {
        const particleCount = Math.floor(18 * this._getEffectIntensity());
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.3;
            const velocity = 2.5 + Math.random() * 3.5;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({
                x: effect.x,
                y: effect.y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: 2 + Math.random() * 2,
                color: color,
                life: 1.0,
                decay: 0.018,
                type: 'ice_crystal',
                sparkle: true,
                sparklePhase: Math.random() * Math.PI * 2
            });
        }
    }
    
    /**
     * 花火爆発エフェクト（新年）
     * @param {Object} effect - エフェクト
     * @private
     */
    _createFireworkBurstEffect(effect) {
        const particleCount = Math.floor(25 * this._getEffectIntensity());
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 3 + Math.random() * 4;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({
                x: effect.x,
                y: effect.y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: 3 + Math.random() * 2,
                color: color,
                life: 1.0,
                decay: 0.01,
                type: 'firework',
                trail: true,
                trailLength: 5,
                sparkle: true
            });
        }
    }
    
    /**
     * ハート爆発エフェクト（バレンタイン）
     * @param {Object} effect - エフェクト
     * @private
     */
    _createHeartBurstEffect(effect) {
        const particleCount = Math.floor(10 * this._getEffectIntensity());
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 1.5 + Math.random() * 2;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({
                x: effect.x,
                y: effect.y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - 0.5,
                size: 5 + Math.random() * 3,
                color: color,
                life: 1.0,
                decay: 0.008,
                type: 'heart',
                pulse: true,
                pulsePhase: Math.random() * Math.PI * 2
            });
        }
    }
    
    /**
     * 不気味爆発エフェクト（ハロウィン）
     * @param {Object} effect - エフェクト
     * @private
     */
    _createSpookyBurstEffect(effect) {
        const particleCount = Math.floor(12 * this._getEffectIntensity());
        
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 2 + Math.random() * 3;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({
                x: effect.x,
                y: effect.y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: 4 + Math.random() * 4,
                color: color,
                life: 1.0,
                decay: 0.015,
                type: Math.random() > 0.5 ? 'bat' : 'ghost',
                flicker: true,
                flickerSpeed: 0.1 + Math.random() * 0.1
            });
        }
    }
    
    /**
     * クリスマス爆発エフェクト（クリスマス）
     * @param {Object} effect - エフェクト
     * @private
     */
    _createChristmasBurstEffect(effect) {
        const particleCount = Math.floor(16 * this._getEffectIntensity());
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 2.5 + Math.random() * 3;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({
                x: effect.x,
                y: effect.y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: 3 + Math.random() * 3,
                color: color,
                life: 1.0,
                decay: 0.013,
                type: ['snowflake', 'christmas_star', 'present_box'][Math.floor(Math.random() * 3)],
                twinkle: true,
                twinkleSpeed: 0.05 + Math.random() * 0.05
            });
        }
    }
    
    /**
     * デフォルト季節エフェクト
     * @param {Object} effect - エフェクト
     * @private
     */
    _createDefaultSeasonalEffect(effect) {
        const particleCount = Math.floor(10 * this._getEffectIntensity());
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const velocity = 2 + Math.random() * 2;
            const color = this._getRandomColor(effect.config.colors);
            
            effect.particles.push({
                x: effect.x,
                y: effect.y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: 3 + Math.random() * 2,
                color: color,
                life: 1.0,
                decay: 0.015,
                type: 'seasonal_default'
            });
        }
    }
    
    /**
     * エフェクト強度を取得
     * @returns {number} エフェクト強度
     * @private
     */
    _getEffectIntensity() {
        const qualitySettings = this.qualityController.getCurrentQualitySettings();
        return qualitySettings.particleCountMultiplier || 1.0;
    }
    
    /**
     * ランダムな色を取得
     * @param {Array} colors - 色配列
     * @returns {string} 色
     * @private
     */
    _getRandomColor(colors) {
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    /**
     * 更新処理
     * @param {number} deltaTime - 経過時間
     */
    update(deltaTime) {
        const currentTime = performance.now();
        
        // 季節チェック
        if (currentTime - this.lastSeasonCheck > this.seasonCheckInterval) {
            this._updateCurrentTheme();
            this.lastSeasonCheck = currentTime;
        }
        
        // アクティブエフェクトの更新
        this._updateActiveEffects(deltaTime);
        
        // 背景エフェクトの更新
        if (this.backgroundEffectEnabled) {
            this._updateBackgroundEffects(deltaTime);
        }
    }
    
    /**
     * アクティブエフェクトの更新
     * @param {number} deltaTime - 経過時間
     * @private
     */
    _updateActiveEffects(deltaTime) {
        const toRemove = [];
        
        for (const [id, effect] of this.activeSeasonalEffects) {
            // パーティクルの更新
            for (let i = effect.particles.length - 1; i >= 0; i--) {
                const particle = effect.particles[i];
                
                // 位置更新
                particle.x += particle.vx * deltaTime / 16.67; // 60FPS基準
                particle.y += particle.vy * deltaTime / 16.67;
                
                // 重力適用
                if (particle.gravity) {
                    particle.vy += particle.gravity * deltaTime / 16.67;
                }
                
                // 風の影響
                if (particle.flutter) {
                    particle.vx += (Math.random() - 0.5) * particle.flutter;
                }
                
                // 回転更新
                if (particle.rotationSpeed) {
                    particle.rotation += particle.rotationSpeed * deltaTime / 16.67;
                }
                
                // ライフ減少
                particle.life -= particle.decay * deltaTime / 16.67;
                
                // パーティクルの削除判定
                if (particle.life <= 0) {
                    effect.particles.splice(i, 1);
                }
            }
            
            // エフェクトの削除判定
            if (effect.particles.length === 0) {
                toRemove.push(id);
            }
        }
        
        // 使い終わったエフェクトを削除
        toRemove.forEach(id => {
            this.activeSeasonalEffects.delete(id);
        });
    }
    
    /**
     * 背景エフェクトの更新
     * @param {number} deltaTime - 経過時間
     * @private
     */
    _updateBackgroundEffects(deltaTime) {
        // 背景パーティクルの実装は今後の拡張
        // 現在は基底実装のみ
    }
    
    /**
     * レンダリング処理
     * @param {CanvasRenderingContext2D} ctx - コンテキスト
     */
    render(ctx) {
        if (!this.seasonalEffectsEnabled) return;
        
        // アクティブエフェクトのレンダリング
        for (const effect of this.activeSeasonalEffects.values()) {
            this._renderSeasonalEffect(ctx, effect);
        }
    }
    
    /**
     * 季節エフェクトのレンダリング
     * @param {CanvasRenderingContext2D} ctx - コンテキスト
     * @param {Object} effect - エフェクト
     * @private
     */
    _renderSeasonalEffect(ctx, effect) {
        ctx.save();
        
        for (const particle of effect.particles) {
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            
            ctx.save();
            ctx.translate(particle.x, particle.y);
            
            if (particle.rotation) {
                ctx.rotate(particle.rotation);
            }
            
            // パーティクルタイプに応じたレンダリング
            this._renderParticleByType(ctx, particle);
            
            ctx.restore();
        }
        
        ctx.restore();
    }
    
    /**
     * パーティクルタイプ別レンダリング
     * @param {CanvasRenderingContext2D} ctx - コンテキスト
     * @param {Object} particle - パーティクル
     * @private
     */
    _renderParticleByType(ctx, particle) {
        const size = particle.size;
        
        switch (particle.type) {
            case 'cherry_blossom':
                this._renderCherryBlossom(ctx, size);
                break;
            case 'water_drop':
                this._renderWaterDrop(ctx, size);
                break;
            case 'maple_leaf':
                this._renderMapleLeaf(ctx, size);
                break;
            case 'ice_crystal':
                this._renderIceCrystal(ctx, size, particle.sparklePhase);
                break;
            case 'firework':
                this._renderFirework(ctx, size);
                break;
            case 'heart':
                this._renderHeart(ctx, size, particle.pulsePhase);
                break;
            case 'bat':
            case 'ghost':
                this._renderSpookyShape(ctx, size, particle.type);
                break;
            case 'snowflake':
            case 'christmas_star':
            case 'present_box':
                this._renderChristmasShape(ctx, size, particle.type);
                break;
            default:
                this._renderDefaultParticle(ctx, size);
        }
    }
    
    /**
     * 桜の花びらレンダリング
     * @param {CanvasRenderingContext2D} ctx - コンテキスト
     * @param {number} size - サイズ
     * @private
     */
    _renderCherryBlossom(ctx, size) {
        ctx.beginPath();
        // 花びらの形状を描画
        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const x = Math.cos(angle) * size;
            const y = Math.sin(angle) * size;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.fill();
    }
    
    /**
     * 水滴レンダリング
     * @param {CanvasRenderingContext2D} ctx - コンテキスト
     * @param {number} size - サイズ
     * @private
     */
    _renderWaterDrop(ctx, size) {
        ctx.beginPath();
        ctx.arc(0, size * 0.3, size * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.quadraticCurveTo(-size * 0.5, 0, 0, size * 0.3);
        ctx.quadraticCurveTo(size * 0.5, 0, 0, -size);
        ctx.fill();
    }
    
    /**
     * もみじ葉レンダリング
     * @param {CanvasRenderingContext2D} ctx - コンテキスト
     * @param {number} size - サイズ
     * @private
     */
    _renderMapleLeaf(ctx, size) {
        ctx.beginPath();
        // もみじの形状を描画
        ctx.moveTo(0, -size);
        ctx.lineTo(-size * 0.5, -size * 0.3);
        ctx.lineTo(-size * 0.8, 0);
        ctx.lineTo(-size * 0.3, size * 0.5);
        ctx.lineTo(0, size * 0.8);
        ctx.lineTo(size * 0.3, size * 0.5);
        ctx.lineTo(size * 0.8, 0);
        ctx.lineTo(size * 0.5, -size * 0.3);
        ctx.closePath();
        ctx.fill();
    }
    
    /**
     * 氷の結晶レンダリング
     * @param {CanvasRenderingContext2D} ctx - コンテキスト
     * @param {number} size - サイズ
     * @param {number} sparklePhase - キラキラフェーズ
     * @private
     */
    _renderIceCrystal(ctx, size, sparklePhase) {
        // キラキラ効果
        ctx.globalAlpha *= 0.5 + 0.5 * Math.sin(sparklePhase + performance.now() * 0.01);
        
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
        }
        ctx.stroke();
    }
    
    /**
     * 花火レンダリング
     * @param {CanvasRenderingContext2D} ctx - コンテキスト
     * @param {number} size - サイズ
     * @private
     */
    _renderFirework(ctx, size) {
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        
        // 光の効果
        ctx.shadowBlur = size * 2;
        ctx.shadowColor = ctx.fillStyle;
        ctx.fill();
    }
    
    /**
     * ハートレンダリング
     * @param {CanvasRenderingContext2D} ctx - コンテキスト
     * @param {number} size - サイズ
     * @param {number} pulsePhase - パルスフェーズ
     * @private
     */
    _renderHeart(ctx, size, pulsePhase) {
        const pulseSize = size * (0.8 + 0.2 * Math.sin(pulsePhase + performance.now() * 0.01));
        
        ctx.beginPath();
        ctx.moveTo(0, pulseSize * 0.3);
        ctx.bezierCurveTo(-pulseSize, -pulseSize * 0.5, -pulseSize, pulseSize * 0.5, 0, pulseSize);
        ctx.bezierCurveTo(pulseSize, pulseSize * 0.5, pulseSize, -pulseSize * 0.5, 0, pulseSize * 0.3);
        ctx.fill();
    }
    
    /**
     * 不気味な形状レンダリング
     * @param {CanvasRenderingContext2D} ctx - コンテキスト
     * @param {number} size - サイズ
     * @param {string} type - タイプ
     * @private
     */
    _renderSpookyShape(ctx, size, type) {
        if (type === 'bat') {
            // コウモリの形状
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-size, -size * 0.5, -size * 1.5, 0);
            ctx.quadraticCurveTo(-size * 0.7, size * 0.3, 0, 0);
            ctx.quadraticCurveTo(size * 0.7, size * 0.3, size * 1.5, 0);
            ctx.quadraticCurveTo(size, -size * 0.5, 0, 0);
            ctx.fill();
        } else {
            // ゴーストの形状
            ctx.beginPath();
            ctx.arc(0, -size * 0.3, size * 0.7, 0, Math.PI * 2);
            ctx.rect(-size * 0.7, -size * 0.3, size * 1.4, size * 1.3);
            ctx.fill();
        }
    }
    
    /**
     * クリスマス形状レンダリング
     * @param {CanvasRenderingContext2D} ctx - コンテキスト
     * @param {number} size - サイズ
     * @param {string} type - タイプ
     * @private
     */
    _renderChristmasShape(ctx, size, type) {
        switch (type) {
            case 'snowflake':
                this._renderIceCrystal(ctx, size, 0);
                break;
            case 'christmas_star':
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * Math.PI * 4) / 5;
                    const radius = i % 2 === 0 ? size : size * 0.4;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.fill();
                break;
            case 'present_box':
                ctx.fillRect(-size * 0.5, -size * 0.5, size, size);
                break;
        }
    }
    
    /**
     * デフォルトパーティクルレンダリング
     * @param {CanvasRenderingContext2D} ctx - コンテキスト
     * @param {number} size - サイズ
     * @private
     */
    _renderDefaultParticle(ctx, size) {
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * 季節エフェクトの有効/無効設定
     * @param {boolean} enabled - 有効にするか
     */
    setSeasonalEffectsEnabled(enabled) {
        this.seasonalEffectsEnabled = enabled;
        this.configManager.set('effects.seasonal.enabled', enabled);
        
        if (!enabled) {
            this.activeSeasonalEffects.clear();
        }
    }
    
    /**
     * 自動季節検出の有効/無効設定
     * @param {boolean} enabled - 有効にするか
     */
    setAutoSeasonDetection(enabled) {
        this.autoSeasonDetection = enabled;
        this.configManager.set('effects.seasonal.autoDetection', enabled);
        
        if (enabled) {
            this._updateCurrentTheme();
        }
    }
    
    /**
     * 手動で季節を設定
     * @param {string} season - 季節 ('spring', 'summer', 'autumn', 'winter')
     */
    setSeason(season) {
        if (this.seasonalThemes[season]) {
            this.currentSeason = season;
            this.autoSeasonDetection = false;
            this._updateCurrentTheme();
        }
    }
    
    /**
     * 現在の季節テーマを取得
     * @returns {Object} 季節テーマ
     */
    getCurrentTheme() {
        return this.activeTheme;
    }
    
    /**
     * 現在の季節を取得
     * @returns {string} 現在の季節
     */
    getCurrentSeason() {
        return this.currentSeason;
    }
    
    /**
     * 現在のイベントを取得
     * @returns {string|null} 現在のイベント
     */
    getCurrentEvent() {
        return this.currentEvent;
    }
    
    /**
     * カスタムテーマを作成
     * @param {string} themeName - テーマ名
     * @param {Object} themeConfig - テーマ設定
     * @returns {boolean} 作成成功か
     */
    createCustomTheme(themeName, themeConfig) {
        try {
            // テーマ設定の検証
            if (!this._validateThemeConfig(themeConfig)) {
                throw new Error('Invalid theme configuration');
            }
            
            // テーマIDの生成
            const themeId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const customTheme = {
                id: themeId,
                name: themeName,
                type: 'custom',
                createdTime: Date.now(),
                ...themeConfig
            };
            
            this.customThemes.set(themeId, customTheme);
            
            // 設定への保存
            this._saveCustomThemes();
            
            console.log(`[SeasonalEffectManager] カスタムテーマ作成: ${themeName}`);
            return themeId;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'SeasonalEffectManager.createCustomTheme');
            return false;
        }
    }
    
    /**
     * カスタムテーマを読み込み
     * @param {Object} themeData - テーマデータ
     * @returns {string|boolean} テーマIDまたは失敗
     */
    loadCustomTheme(themeData) {
        try {
            // テーマデータの検証
            if (!themeData || typeof themeData !== 'object') {
                throw new Error('Invalid theme data');
            }
            
            // 必須プロパティのチェック
            if (!themeData.name || !themeData.colors || !themeData.particles || !themeData.effects) {
                throw new Error('Missing required theme properties');
            }
            
            return this.createCustomTheme(themeData.name, themeData);
            
        } catch (error) {
            this.errorHandler.handleError(error, 'SeasonalEffectManager.loadCustomTheme');
            return false;
        }
    }
    
    /**
     * カスタムテーマを適用
     * @param {string} themeId - テーマID
     * @returns {boolean} 適用成功か
     */
    applyCustomTheme(themeId) {
        try {
            const theme = this.customThemes.get(themeId);
            if (!theme) {
                console.warn(`[SeasonalEffectManager] カスタムテーマが見つかりません: ${themeId}`);
                return false;
            }
            
            this.customTheme = theme;
            this._updateCurrentTheme();
            
            // テーマ履歴に追加
            this.themeHistory.push({
                themeId: themeId,
                appliedTime: Date.now(),
                type: 'custom'
            });
            
            // 履歴の制限
            if (this.themeHistory.length > 10) {
                this.themeHistory.shift();
            }
            
            console.log(`[SeasonalEffectManager] カスタムテーマ適用: ${theme.name}`);
            return true;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'SeasonalEffectManager.applyCustomTheme');
            return false;
        }
    }
    
    /**
     * カスタムテーマを削除
     * @param {string} themeId - テーマID
     * @returns {boolean} 削除成功か
     */
    removeCustomTheme(themeId) {
        try {
            if (!this.customThemes.has(themeId)) {
                return false;
            }
            
            // 現在適用中のテーマの場合はクリア
            if (this.customTheme && this.customTheme.id === themeId) {
                this.customTheme = null;
                this._updateCurrentTheme();
            }
            
            this.customThemes.delete(themeId);
            this._saveCustomThemes();
            
            console.log(`[SeasonalEffectManager] カスタムテーマ削除: ${themeId}`);
            return true;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'SeasonalEffectManager.removeCustomTheme');
            return false;
        }
    }
    
    /**
     * カスタムテーマをクリア
     */
    clearCustomTheme() {
        this.customTheme = null;
        this._updateCurrentTheme();
        console.log('[SeasonalEffectManager] カスタムテーマクリア');
    }
    
    /**
     * 利用可能なカスタムテーマ一覧を取得
     * @returns {Array} カスタムテーマ配列
     */
    getCustomThemes() {
        return Array.from(this.customThemes.values()).map(theme => ({
            id: theme.id,
            name: theme.name,
            type: theme.type,
            createdTime: theme.createdTime
        }));
    }
    
    /**
     * テーマをエクスポート
     * @param {string} themeId - テーマID
     * @returns {Object|null} テーマデータ
     */
    exportTheme(themeId) {
        const theme = this.customThemes.get(themeId);
        if (!theme) {
            return null;
        }
        
        // エクスポート用のクリーンなデータを作成
        const exportData = {
            name: theme.name,
            colors: { ...theme.colors },
            particles: { ...theme.particles },
            effects: { ...theme.effects },
            audio: theme.audio ? { ...theme.audio } : undefined,
            metadata: {
                version: '1.0',
                exportTime: Date.now(),
                originalId: theme.id
            }
        };
        
        return exportData;
    }
    
    /**
     * テーマ色をカスタマイズ
     * @param {string} themeId - テーマID
     * @param {Object} colorModifications - 色の変更
     * @returns {boolean} 変更成功か
     */
    customizeThemeColors(themeId, colorModifications) {
        try {
            const theme = this.customThemes.get(themeId);
            if (!theme) {
                return false;
            }
            
            // 色の更新
            if (colorModifications.primary) {
                theme.colors.primary = [...colorModifications.primary];
            }
            if (colorModifications.secondary) {
                theme.colors.secondary = [...colorModifications.secondary];
            }
            if (colorModifications.accent) {
                theme.colors.accent = [...colorModifications.accent];
            }
            
            this._saveCustomThemes();
            
            // 現在適用中のテーマの場合は更新
            if (this.customTheme && this.customTheme.id === themeId) {
                this.customTheme = theme;
            }
            
            return true;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'SeasonalEffectManager.customizeThemeColors');
            return false;
        }
    }
    
    /**
     * テーマパーティクル設定をカスタマイズ
     * @param {string} themeId - テーマID
     * @param {Object} particleModifications - パーティクル変更
     * @returns {boolean} 変更成功か
     */
    customizeThemeParticles(themeId, particleModifications) {
        try {
            const theme = this.customThemes.get(themeId);
            if (!theme) {
                return false;
            }
            
            // パーティクル設定の更新
            if (particleModifications.types) {
                theme.particles.types = [...particleModifications.types];
            }
            if (particleModifications.density !== undefined) {
                theme.particles.density = Math.max(0, Math.min(1, particleModifications.density));
            }
            if (particleModifications.movement) {
                theme.particles.movement = particleModifications.movement;
            }
            if (particleModifications.spawnRate !== undefined) {
                theme.particles.spawnRate = Math.max(0.1, Math.min(3, particleModifications.spawnRate));
            }
            
            this._saveCustomThemes();
            
            // 現在適用中のテーマの場合は更新
            if (this.customTheme && this.customTheme.id === themeId) {
                this.customTheme = theme;
            }
            
            return true;
            
        } catch (error) {
            this.errorHandler.handleError(error, 'SeasonalEffectManager.customizeThemeParticles');
            return false;
        }
    }
    
    /**
     * テーマ設定の検証
     * @param {Object} config - テーマ設定
     * @returns {boolean} 有効か
     * @private
     */
    _validateThemeConfig(config) {
        if (!config || typeof config !== 'object') {
            return false;
        }
        
        // 必須プロパティのチェック
        const requiredProperties = ['colors', 'particles', 'effects'];
        for (const prop of requiredProperties) {
            if (!config[prop]) {
                return false;
            }
        }
        
        // 色設定の検証
        if (!config.colors.primary || !Array.isArray(config.colors.primary) || config.colors.primary.length === 0) {
            return false;
        }
        
        // パーティクル設定の検証
        if (!config.particles.types || !Array.isArray(config.particles.types) || config.particles.types.length === 0) {
            return false;
        }
        
        // エフェクト設定の検証
        if (!config.effects.bubbleDestruction || !config.effects.comboEffect) {
            return false;
        }
        
        return true;
    }
    
    /**
     * カスタムテーマの保存
     * @private
     */
    _saveCustomThemes() {
        try {
            const themesData = {};
            for (const [id, theme] of this.customThemes) {
                themesData[id] = theme;
            }
            
            this.configManager.set('effects.seasonal.customThemes', themesData);
        } catch (error) {
            this.errorHandler.handleError(error, 'SeasonalEffectManager._saveCustomThemes');
        }
    }
    
    /**
     * カスタムテーマの読み込み
     * @private
     */
    _loadCustomThemes() {
        try {
            const savedThemes = this.configManager.get('effects.seasonal.customThemes', {});
            
            for (const [id, themeData] of Object.entries(savedThemes)) {
                if (this._validateThemeConfig(themeData)) {
                    this.customThemes.set(id, themeData);
                }
            }
            
            console.log(`[SeasonalEffectManager] カスタムテーマ読み込み: ${this.customThemes.size}件`);
        } catch (error) {
            this.errorHandler.handleError(error, 'SeasonalEffectManager._loadCustomThemes');
        }
    }
    
    /**
     * カスタムテーマサポートの有効/無効設定
     * @param {boolean} enabled - 有効にするか
     */
    setCustomThemesEnabled(enabled) {
        this.customThemesEnabled = enabled;
        
        if (!enabled && this.customTheme) {
            this.customTheme = null;
            this._updateCurrentTheme();
        }
        
        this.configManager.set('effects.seasonal.customThemes.enabled', enabled);
    }
    
    /**
     * テーマ履歴を取得
     * @returns {Array} テーマ履歴
     */
    getThemeHistory() {
        return [...this.themeHistory];
    }
    
    /**
     * 現在のカスタムテーマを取得
     * @returns {Object|null} カスタムテーマ
     */
    getCurrentCustomTheme() {
        return this.customTheme;
    }
    
    /**
     * リソースのクリーンアップ
     */
    dispose() {
        this.activeSeasonalEffects.clear();
        this.seasonalParticles = [];
        this.customThemes.clear();
        this.userThemes.clear();
        this.themeHistory = [];
    }
}

// シングルトンインスタンスの作成と管理
let seasonalEffectManagerInstance = null;

/**
 * SeasonalEffectManagerのシングルトンインスタンスを取得
 * @returns {SeasonalEffectManager} シングルトンインスタンス
 */
export function getSeasonalEffectManager() {
    if (!seasonalEffectManagerInstance) {
        seasonalEffectManagerInstance = new SeasonalEffectManager();
    }
    return seasonalEffectManagerInstance;
}