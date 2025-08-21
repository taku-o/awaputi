import { getErrorHandler  } from '../../utils/ErrorHandler.js';

/**
 * Particle configuration interface
 */
interface ParticleConfig { count: number,
    type: string ,}

/**
 * Theme colors interface
 */
interface ThemeColors { primary: string[];
    secondary: string[];
   , accent: string[] }

/**
 * Seasonal theme interface
 */
interface SeasonalTheme { name: string;
    colors: ThemeColors;
   , particles: {
        [ke;y: string]: ParticleConfig };
    weather: string;
   , priority: number;
}

/**
 * Event duration interface
 */
interface EventDuration { start: string,
    end: string ,}

/**
 * Event theme interface
 */
interface EventTheme { name: string;
    duration: EventDuration;
    colors: ThemeColors;
   , particles: {
        [ke;y: string]: ParticleConfig };
    priority: number;
}

/**
 * Active event interface
 */
interface ActiveEvent extends EventTheme { key: string }

/**
 * Particle interface
 */
interface Particle { x: number,
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    life: number;
    maxLife: number;
    alpha: number;
    gravity: number;
    friction: number;
    bounce?: number;
   , type: string;
    rotation?: number;
    rotationSpeed?: number;
    scale?: number;
    scaleSpeed?: number;
    maxTrailLength?: number; ,}
    trail?: Array<{ x: number;, y: number }>;
    pulseSpeed?: number;
    sway?: { amplitude: number;, frequency: number }
    flutter?: { amplitude: number;, frequency: number }
    drift?: { amplitude: number;, frequency: number }

/**
 * Particle manager interface
 */
interface ParticleManager { particles: Particle[],
    getParticleFromPool(): Particle;
    shouldRenderEffect(effectType: string, priority: number): boolean,
    adjustParticleCount(count: number): number, }

/**
 * 季節限定効果専用レンダラー
 * 季節やイベントに応じた特別な視覚効果を管理
 */
export class SeasonalEffectRenderer {
    private particleManager: ParticleManager;
    private, seasonalThemes: Record<string, SeasonalTheme>;
    private eventThemes: Record<string, EventTheme>;
    private currentSeason: string;
    private activeEvents: ActiveEvent[];
    private, customTheme: any | null';

    constructor(particleManager: ParticleManager) {
        this.particleManager = particleManager;
        
        // 季節テーマの定義
        this.seasonalThemes = {
            spring: {''
                name: '春',
                colors: {''
                    primary: ['#FFB6C1', '#FFC0CB', '#FFE4E1', '#F0FFF0],
                    secondary: ['#98FB98', '#90EE90', '#7CFC00', '#ADFF2F],

    }

                    accent: ['#FFD700', '#FFFF99', '#FFFACD] }
                },

                particles: { ' }'

                    cherry_blossom: { count: 8, type: 'sakura_petal' ,},''
                    pollen: { count: 12, type: 'glow_circle' ,},''
                    green_sparkle: { count: 6, type: 'star' ,}

                },''
                weather: 'gentle_breeze';
               , priority: 5;
            },

            summer: { ''
                name: '夏',
                colors: {''
                    primary: ['#FFD700', '#FFA500', '#FF8C00', '#FF7F50],
                    secondary: ['#00CED1', '#40E0D0', '#48D1CC', '#AFEEEE],
                    accent: ['#FF69B4', '#FF1493', '#DC143C] },

                particles: { ' }'

                    sun_ray: { count: 10, type: 'energy_orb' ,},''
                    water_drop: { count: 15, type: 'advanced_circle' ,},''
                    fire_spark: { count: 8, type: 'lightning' ,}

                },''
                weather: 'heat_shimmer';
               , priority: 6;
            },

            autumn: { ''
                name: '秋',
                colors: {''
                    primary: ['#FF8C00', '#FF7F50', '#CD853F', '#D2B48C],
                    secondary: ['#8B4513', '#A0522D', '#BC8F8F', '#F4A460],
                    accent: ['#B22222', '#DC143C', '#8B0000] },

                particles: { ' }'

                    falling_leaf: { count: 12, type: 'leaf' ,},''
                    autumn_mist: { count: 8, type: 'cloud' ,},''
                    harvest_glow: { count: 6, type: 'magic_sparkle' ,}

                },''
                weather: 'falling_leaves';
               , priority: 7;
            },

            winter: { ''
                name: '冬',
                colors: {''
                    primary: ['#E0FFFF', '#F0F8FF', '#F5F5F5', '#FFFFFF],
                    secondary: ['#B0E0E6', '#87CEEB', '#87CEFA', '#6495ED],
                    accent: ['#4169E1', '#0000CD', '#191970] },

                particles: { ' }'

                    snowflake: { count: 15, type: 'snowflake' ,},''
                    ice_crystal: { count: 8, type: 'diamond' ,},''
                    frost_sparkle: { count: 10, type: 'star' ,}

                },''
                weather: 'snowfall';
               , priority: 8;
            }
        },
        
        // イベントテーマの定義
        this.eventThemes = { halloween: {''
                name: 'ハロウィン',' }

                duration: { start: '10-01', end: '11-01' ,},

                colors: {;
                    primary: ['#FF8C00', '#FF7F00', '#FF4500],
                    secondary: ['#8B008B', '#4B0082', '#2F4F4F],
                    accent: ['#00FF00', '#32CD32', '#7FFF00] },

                particles: { ' }'

                    pumpkin_glow: { count: 6, type: 'energy_orb' ,},''
                    ghost_trail: { count: 10, type: 'trail_particle' ,},''
                    magic_dust: { count: 12, type: 'magic_sparkle' ,},
                priority: 9;
            },

            christmas: { ''
                name: 'クリスマス',' }

                duration: { start: '12-01', end: '12-26' ,},

                colors: { ''
                    primary: ['#DC143C', '#B22222', '#8B0000],
                    secondary: ['#228B22', '#32CD32', '#006400],
                    accent: ['#FFD700', '#FFA500', '#FFFFFF] },

                particles: { ' }'

                    christmas_star: { count: 8, type: 'star' ,},''
                    holly_sparkle: { count: 10, type: 'magic_sparkle' ,},''
                    snow_crystal: { count: 12, type: 'snowflake' ,},
                priority: 10;
            },

            new_year: { ''
                name: '新年',' }

                duration: { start: '12-31', end: '01-03' ,},

                colors: { ''
                    primary: ['#FFD700', '#FFA500', '#FF8C00],
                    secondary: ['#DC143C', '#B22222', '#8B0000],
                    accent: ['#4169E1', '#0000CD', '#8A2BE2] },

                particles: { ' }'

                    firework: { count: 15, type: 'explosion' ,},''
                    golden_sparkle: { count: 20, type: 'magic_sparkle' ,},''
                    celebration_burst: { count: 12, type: 'energy_orb' ,},
                priority: 11;
            },

            valentine: { ''
                name: 'バレンタイン',' }

                duration: { start: '02-01', end: '02-15' ,},

                colors: { ''
                    primary: ['#FF69B4', '#FF1493', '#DC143C],
                    secondary: ['#FFB6C1', '#FFC0CB', '#FFE4E1],
                    accent: ['#FFD700', '#FFFFFF', '#F0F8FF] },

                particles: { ' }'

                    heart_sparkle: { count: 8, type: 'heart' ,},''
                    love_glow: { count: 10, type: 'glow_circle' ,},''
                    cupid_trail: { count: 6, type: 'trail_particle' ,},
                priority: 8;
            }
        },
        
        // 現在のテーマ状態
        this.currentSeason = this.detectCurrentSeason();''
        this.activeEvents = this.detectActiveEvents()';
        console.log('[SeasonalEffectRenderer] 初期化完了 - 現在の季節:', this.currentSeason);''
        if(this.activeEvents.length > 0) {', ';

        }

            console.log('[SeasonalEffectRenderer] アクティブイベント:', this.activeEvents.map(e => e.name); }
}
    
    /**
     * 季節限定効果を作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} seasonType - 季節タイプ
     * @param {string} eventType - イベントタイプ
     */
    createSeasonalEffect(x: number, y: number, seasonType: string | null = null, eventType: string | null = null): void { try {
            // 指定された季節/イベント、または現在のものを使用
            const season = seasonType || this.currentSeason;
            const event = eventType ? this.eventThemes[eventType] : this.getHighestPriorityEvent();
            
            // イベントが優先、次に季節
            if(event) {
                
            }
                this.createEventEffect(x, y, event); }
            } else if (season && this.seasonalThemes[season]) { this.createSeasonEffect(x, y, this.seasonalThemes[season]); } else {  // フォールバック: デフォルト効果 }
                this.createDefaultSeasonalEffect(x, y); }
            } catch (error) { getErrorHandler(').handleError(error, 'SEASONAL_EFFECT_ERROR', {)'
                context: 'SeasonalEffectRenderer.createSeasonalEffect' ,});
        }
    }
    
    /**
     * 季節効果を作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {Object} theme - 季節テーマ'
     */''
    createSeasonEffect(x: number, y: number, theme: SeasonalTheme): void { // 品質チェック
        if(!this.particleManager.shouldRenderEffect('seasonal', theme.priority) {
            this.createSimplifiedSeasonalEffect(x, y, theme);
        }
            return; }
        }
        
        // 季節別の特殊処理
        const seasonKey = Object.keys(this.seasonalThemes).find(key => );
            this.seasonalThemes[key] === theme);

        switch(seasonKey) {'

            case 'spring':'';
                this.createSpringEffect(x, y, theme);

                break;''
            case 'summer':'';
                this.createSummerEffect(x, y, theme);

                break;''
            case 'autumn':'';
                this.createAutumnEffect(x, y, theme);

                break;''
            case 'winter':;
                this.createWinterEffect(x, y, theme);
                break;
            default:;
                this.createGenericSeasonalEffect(x, y, theme);
        }
                break; }
}
    
    /**
     * 春の効果
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {Object} theme - テーマ
     */
    createSpringEffect(x: number, y: number, theme: SeasonalTheme): void { // 桜の花びら
        const petalCount = this.particleManager.adjustParticleCount(theme.particles.cherry_blossom.count);
        
        for(let, i = 0; i < petalCount; i++) {
        
            const particle = this.particleManager.getParticleFromPool();
            
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 60;
            
            particle.x = x + Math.cos(angle) * distance;
            particle.y = y + Math.sin(angle) * distance;
            particle.vx = (Math.random() - 0.5) * 40;
            particle.vy = Math.random() * 30 + 20; // 下向きに落ちる
            particle.size = 3 + Math.random() * 3;
            particle.color = theme.colors.primary[Math.floor(Math.random() * theme.colors.primary.length)];
            particle.life = 3000 + Math.random() * 2000;
            particle.maxLife = particle.life;''
            particle.alpha = 0.7 + Math.random()';
            particle.type = 'sakura_petal'; }
            particle.rotationSpeed = (Math.random() - 0.5) * 5; }
            particle.sway = { amplitude: 20, frequency: 0.01 ,}; // 風による揺れ
            
            this.particleManager.particles.push(particle);
        }
        
        // 花粉の輝き
        this.createPollenSparkles(x, y, theme);
    }
    
    /**
     * 夏の効果
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {Object} theme - テーマ
     */
    createSummerEffect(x: number, y: number, theme: SeasonalTheme): void { // 太陽の光線
        const rayCount = this.particleManager.adjustParticleCount(theme.particles.sun_ray.count);
        
        for(let, i = 0; i < rayCount; i++) {
        
            const particle = this.particleManager.getParticleFromPool();
            
            const angle = (Math.PI * 2 * i) / rayCount;
            const speed = 80 + Math.random() * 40;
            
            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.size = 2 + Math.random() * 3;
            particle.color = theme.colors.primary[Math.floor(Math.random() * theme.colors.primary.length)];''
            particle.life = 1500 + Math.random(''';
            particle.type = 'energy_orb';
            particle.pulseSpeed = 8;
            particle.maxTrailLength = 4;
            particle.trail = [];)
            );
        }
            this.particleManager.particles.push(particle); }
        }
        
        // 熱の揺らめき
        this.createHeatShimmer(x, y, theme);
    }
    
    /**
     * 秋の効果
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {Object} theme - テーマ
     */
    createAutumnEffect(x: number, y: number, theme: SeasonalTheme): void { // 落ち葉
        const leafCount = this.particleManager.adjustParticleCount(theme.particles.falling_leaf.count);
        
        for(let, i = 0; i < leafCount; i++) {
        
            const particle = this.particleManager.getParticleFromPool();
            
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 80;
            
            particle.x = x + Math.cos(angle) * distance;
            particle.y = y + Math.sin(angle) * distance;
            particle.vx = (Math.random() - 0.5) * 60;
            particle.vy = Math.random() * 40 + 30;
            particle.size = 4 + Math.random() * 4;
            particle.color = theme.colors.primary[Math.floor(Math.random() * theme.colors.primary.length)];''
            particle.life = 4000 + Math.random()';
            particle.type = 'leaf'; }
            particle.rotationSpeed = (Math.random() - 0.5) * 8; }
            particle.flutter = { amplitude: 15, frequency: 0.02 ,}; // ひらひら舞う
            
            this.particleManager.particles.push(particle);
        }
        
        // 秋の霧
        this.createAutumnMist(x, y, theme);
    }
    
    /**
     * 冬の効果
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {Object} theme - テーマ
     */
    createWinterEffect(x: number, y: number, theme: SeasonalTheme): void { // 雪の結晶
        const snowCount = this.particleManager.adjustParticleCount(theme.particles.snowflake.count);
        
        for(let, i = 0; i < snowCount; i++) {
        
            const particle = this.particleManager.getParticleFromPool();
            
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 70;
            
            particle.x = x + Math.cos(angle) * distance;
            particle.y = y + Math.sin(angle) * distance;
            particle.vx = (Math.random() - 0.5) * 30;
            particle.vy = Math.random() * 50 + 40;
            particle.size = 2 + Math.random() * 4;
            particle.color = theme.colors.primary[Math.floor(Math.random() * theme.colors.primary.length)];
            particle.life = 5000 + Math.random() * 3000;
            particle.maxLife = particle.life;''
            particle.alpha = 0.6 + Math.random()';
            particle.type = 'snowflake'; }
            particle.rotationSpeed = (Math.random() - 0.5) * 3; }
            particle.drift = { amplitude: 25, frequency: 0.008 ,}; // 風に流される
            
            this.particleManager.particles.push(particle);
        }
        
        // 氷の輝き
        this.createIceSparkles(x, y, theme);
    }
    
    /**
     * イベント効果を作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {Object} event - イベントテーマ
     */''
    createEventEffect(x: number, y: number, event: EventTheme | ActiveEvent): void { // 品質チェック
        if(!this.particleManager.shouldRenderEffect('event', event.priority) {
            this.createSimplifiedEventEffect(x, y, event);
        }
            return; }
        }
        
        // 各イベントの特殊効果
        Object.entries(event.particles).forEach(([effectName, config]) => { this.createEventParticleEffect(x, y, effectName, config, event); });
    }
    
    /**
     * イベントパーティクル効果を作成
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} effectName - 効果名
     * @param {Object} config - 設定
     * @param {Object} event - イベントテーマ
     */
    createEventParticleEffect(x: number, y: number, effectName: string, config: ParticleConfig, event: EventTheme | ActiveEvent): void { const adjustedCount = this.particleManager.adjustParticleCount(config.count);
        
        for(let, i = 0; i < adjustedCount; i++) {
        
            const particle = this.particleManager.getParticleFromPool();
            
            // 効果名に応じた特殊設定
            this.configureEventParticle(particle, effectName, event);
            
            // 基本配置
            const angle = (Math.PI * 2 * i) / adjustedCount + Math.random() * 0.5;
            const distance = Math.random() * 50;
            
            particle.x = x + Math.cos(angle) * distance;
            particle.y = y + Math.sin(angle) * distance;
            particle.type = config.type;
            
        
        }
            this.particleManager.particles.push(particle); }
}
    
    /**
     * イベントパーティクルを設定
     * @param {Object} particle - パーティクル
     * @param {string} effectName - 効果名
     * @param {Object} event - イベントテーマ
     */
    configureEventParticle(particle: Particle, effectName: string, event: EventTheme | ActiveEvent): void { const colors = [...event.colors.primary,
            ...event.colors.secondary];
            ...event.colors.accent];
        ];
        
        particle.color = colors[Math.floor(Math.random() * colors.length)];
        particle.life = 2000 + Math.random() * 2000;
        particle.maxLife = particle.life;
        particle.alpha = 0.8 + Math.random() * 0.2;

        switch(effectName) {'

            case 'firework':;
                particle.vx = (Math.random() - 0.5) * 200;

                particle.vy = (Math.random() - 0.5) * 200 - 50;''
                particle.size = 3 + Math.random()';
            case 'heart_sparkle':);
                particle.vx = (Math.random() - 0.5) * 40;
                particle.vy = (Math.random() - 0.5) * 40 - 20;
                particle.size = 2 + Math.random() * 3;
                particle.gravity = -5; // 浮上
                particle.friction = 0.98;
                particle.pulseSpeed = 6;
                break;
                
            default: particle.vx = (Math.random() - 0.5) * 80;
                particle.vy = (Math.random() - 0.5) * 80;
                particle.size = 2 + Math.random() * 3;
                particle.gravity = 15;
                particle.friction = 0.95;
        ,}
                break; }
}
    
    /**
     * 現在の季節を検出
     * @returns {string} 季節
     */
    detectCurrentSeason(): string { const month = new Date().getMonth() + 1; // 1-12

        if(month >= 3 && month <= 5) return 'spring';''
        if(month >= 6 && month <= 8) return 'summer';''
        if(month >= 9 && month <= 11) return 'autumn';''
        return 'winter'; }
    
    /**
     * アクティブなイベントを検出
     * @returns {Array} アクティブイベントリスト
     */'
    detectActiveEvents(): ActiveEvent[] { const now = new Date();' }'

        const currentDate = `${String(now.getMonth(} + 1'}.padStart(2, '0'})-${ String(now.getDate( }.padStart(2, '0'})`;
        
        return Object.entries(this.eventThemes);
            .filter(([key, event]) => {  if (!event.duration) return false; }
                return currentDate >= event.duration.start && currentDate <= event.duration.end;)
            .map(([key, event]) => ({ key, ...event);
    }
    
    /**
     * 最高優先度のイベントを取得
     * @returns {Object|null} イベント
     */
    getHighestPriorityEvent(): ActiveEvent | null { if (this.activeEvents.length === 0) return null;
        
        return this.activeEvents.reduce((highest, current) => ;
            current.priority > highest.priority ? current : highest;
        ); }
    }
    
    /**
     * 汎用季節効果
     */
    createGenericSeasonalEffect(x: number, y: number, theme: SeasonalTheme): void { this.createDefaultSeasonalEffect(x, y); }
    
    /**
     * デフォルト季節効果
     * @param {number} x - X座標
     * @param {number} y - Y座標
     */
    createDefaultSeasonalEffect(x: number, y: number): void { const defaultCount = this.particleManager.adjustParticleCount(8);
        
        for(let, i = 0; i < defaultCount; i++) {
        
            const particle = this.particleManager.getParticleFromPool();
            
            const angle = (Math.PI * 2 * i) / defaultCount;
            particle.x = x + Math.cos(angle) * 30;
            particle.y = y + Math.sin(angle) * 30;
            particle.vx = Math.cos(angle) * 60;

            particle.vy = Math.sin(angle) * 60;''
            particle.size = 2 + Math.random(''';
            particle.color = '#E6E6FA';
            particle.life = 1500;
            particle.maxLife = particle.life;
            particle.alpha = 0.7;
            particle.gravity = 10;

            particle.friction = 0.95;''
            particle.type = 'star';)
            );
        }
            this.particleManager.particles.push(particle); }
}
    
    /**
     * 簡略化された季節効果
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {Object} theme - テーマ
     */
    createSimplifiedSeasonalEffect(x: number, y: number, theme: SeasonalTheme): void { const simpleCount = Math.max(3, Math.floor(6 * 0.5);
        
        for(let, i = 0; i < simpleCount; i++) {
        
            const particle = this.particleManager.getParticleFromPool();
            
            const angle = (Math.PI * 2 * i) / simpleCount;
            particle.x = x + Math.cos(angle) * 25;
            particle.y = y + Math.sin(angle) * 25;

            particle.vx = Math.cos(angle) * 40;''
            particle.vy = Math.sin(angle) * 40;
            particle.size = 2;
            particle.color = theme.colors.primary[0];
            particle.life = 1000;
            particle.maxLife = particle.life;
            particle.alpha = 0.6;
            particle.gravity = 10;

            particle.friction = 0.95;''
            particle.type = 'circle';
            
        
        }
            this.particleManager.particles.push(particle); }
}
    
    /**
     * 簡略化されたイベント効果'
     */''
    createSimplifiedEventEffect(x: number, y: number, event: EventTheme | ActiveEvent): void { const theme: SeasonalTheme = {
            name: event.name;
           , colors: event.colors, }

            particles: {},''
            weather: '';
           , priority: event.priority;
        },
        this.createSimplifiedSeasonalEffect(x, y, theme);
    }
    
    /**
     * 花粉の輝き（未実装）
     */
    createPollenSparkles(x: number, y: number, theme: SeasonalTheme): void { // TODO: 将来実装予定 }
    
    /**
     * 熱の揺らめき（未実装）
     */
    createHeatShimmer(x: number, y: number, theme: SeasonalTheme): void { // TODO: 将来実装予定 }
    
    /**
     * 秋の霧（未実装）
     */
    createAutumnMist(x: number, y: number, theme: SeasonalTheme): void { // TODO: 将来実装予定 }
    
    /**
     * 氷の輝き（未実装）
     */
    createIceSparkles(x: number, y: number, theme: SeasonalTheme): void { // TODO: 将来実装予定 }
    
    /**
     * カスタムテーマを設定
     * @param {Object} customTheme - カスタムテーマ
     */''
    setCustomTheme(customTheme: any): void { this.customTheme = customTheme;''
        console.log('[SeasonalEffectRenderer] カスタムテーマ設定:', customTheme.name); }
    
    /**
     * 現在のテーマ情報を取得
     * @returns {Object} テーマ情報
     */
    getCurrentThemeInfo(): object { const activeEvent = this.getHighestPriorityEvent();
        
        return { season: this.currentSeason,
            seasonTheme: this.seasonalThemes[this.currentSeason];
            activeEvents: this.activeEvents;
            primaryEvent: activeEvent;
           , customTheme: this.customTheme, };
            effectsAvailable: this.getAvailableEffects().length }
        }
    
    /**
     * 利用可能な効果のリストを取得
     * @returns {Array} 効果リスト
     */
    getAvailableEffects(): string[] { const effects: string[] = [],
        
        // 季節効果
        Object.keys(this.seasonalThemes).forEach(season => {) }
            effects.push(`season_${season}`});
        });
        
        // イベント効果
        Object.keys(this.eventThemes).forEach(event => { ); }
            effects.push(`event_${event}`);''
        }');
        
        return effects;

    }''
}