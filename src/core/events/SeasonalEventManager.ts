/**
 * SeasonalEventManager.ts
 * 季節イベント管理システム
 * EventStageManagerから分離された季節イベント特化機能
 */

type Season = 'spring' | 'summer' | 'autumn' | 'winter';

interface SeasonalPeriod { months: number[],
    events: string[] ,}

interface SeasonalEventData { id: string;
    season: Season;
    startTime: number;
    endTime: number }

interface SeasonalEffects { [key: string]: any, }

interface SpecialRules { bloomEffect?: boolean;
    pastelColors?: boolean;
    cherryBlossomParticles?: boolean;
    gentleWind?: number;
    heatWave?: boolean;
    vibrantColors?: boolean;
    sunRays?: boolean;
    heatShimmer?: number;
    fallingLeaves?: boolean;
    warmColors?: boolean;
    goldenHour?: boolean;
    autumnWind?: number;
    snowfall?: boolean;
    coolColors?: boolean;
    iceEffect?: boolean;
    frostedGlass?: number;
    bubbleColorFilters?: {
        hueShift: number;
        saturation: number;
        brightness: number ,};
    backgroundMusic?: string;
}

interface Event { seasonalEffects?: SeasonalEffects;
    }

interface SeasonInfo { season: Season,
    seasonData: SeasonalPeriod;
    activeEvents: SeasonalEventData[];
    timeUntilNextSeason: number ,}

interface SavedSeasonalData { activeSeasonalEvents?: [string, SeasonalEventData][];
    currentSeason?: Season;
    lastUpdated?: number; }

export class SeasonalEventManager { private gameEngine: any }
    private SEASONAL_PERIODS: { [key in Season]: SeasonalPeriod }
    private seasonalCheckInterval: number | null = null;
    private currentSeason: Season;
    private activeSeasonalEvents: Map<string, SeasonalEventData> = new Map();

    constructor(gameEngine: any) {
        this.gameEngine = gameEngine;
        
        // 季節イベント用定数
        this.SEASONAL_PERIODS = {
            spring: { 
                months: [3, 4, 5],

    }

    }

                events: ['spring-cherry-blossom', 'spring-festival]  }
            },

            summer: { months: [6, 7, 8], ''
                events: ['summer-fireworks', 'summer-festival]  },

            autumn: { months: [9, 10, 11], ''
                events: ['autumn-leaves', 'harvest-festival]  },

            winter: { months: [12, 1, 2],;
                events: ['winter-snow', 'new-year]  }
        };
        
        // 季節チェック間隔
        this.seasonalCheckInterval = null;
        this.currentSeason = this.getCurrentSeason();
        this.activeSeasonalEvents = new Map();
        
        this.startSeasonalEventChecking();
    }
    
    /**
     * 現在の季節を取得
     */
    getCurrentSeason(): Season { const currentMonth = new Date().getMonth() + 1; // 0-based to 1-based
        
        for(const [season, data] of Object.entries(this.SEASONAL_PERIODS) {
        ';

            if(data.months.includes(currentMonth)) {
        
        }
                return season as Season;

        return 'spring'; // デフォルト
    }
    
    /**
     * 季節イベントのチェックを開始
     */
    private startSeasonalEventChecking(): void { // 既存のインターバルをクリア
        if(this.seasonalCheckInterval) {
            
        }
            clearInterval(this.seasonalCheckInterval); }
        }
        
        // 1時間ごとに季節イベントをチェック
        this.seasonalCheckInterval = setInterval(() => { this.checkSeasonalEvents(); }, 60 * 60 * 1000) as unknown as number;
        
        // 初回チェック
        this.checkSeasonalEvents();
    }
    
    /**
     * 季節イベントをチェック
     */
    private checkSeasonalEvents(): void { const newSeason = this.getCurrentSeason();
        
        if (newSeason !== this.currentSeason) { }
            console.log(`Season, changed from ${this.currentSeason} to ${ newSeason}`};
            this.currentSeason = newSeason; }
            this.activateSeasonalEvents(newSeason});
        }
        
        // 期限切れの季節イベントを無効化
        this.deactivateExpiredSeasonalEvents();
    }
    
    /**
     * 季節イベントを有効化
     */
    private activateSeasonalEvents(season: Season): void { const seasonData = this.SEASONAL_PERIODS[season];
        if (!seasonData) return;
        
        seasonData.events.forEach(eventId => { );
            if(!this.activeSeasonalEvents.has(eventId) {
                this.activeSeasonalEvents.set(eventId, {)
                    id: eventId,);
                    season: season);
            ,}
                    startTime: Date.now(), }
                    endTime: this.getSeasonEndTime(season); }
                });
                
                console.log(`Activated, seasonal event: ${eventId} for, season: ${ season)`},
                ;
                // GameEngineに季節イベント開始を通知
                if(this.gameEngine.eventBus} {'

                    this.gameEngine.eventBus.emit('seasonalEventActivated', {
                })
                        eventId,) }
                        season)});
                }
});
    }
    
    /**
     * 期限切れの季節イベントを無効化
     */
    private deactivateExpiredSeasonalEvents(): void { const currentTime = Date.now();
        const expiredEvents: string[] = [],
        
        this.activeSeasonalEvents.forEach((eventData, eventId) => { 
            if (currentTime > eventData.endTime) { }
                expiredEvents.push(eventId); }
});
        
        expiredEvents.forEach(eventId => {  ); }
            this.activeSeasonalEvents.delete(eventId); }
            console.log(`Deactivated, expired seasonal, event: ${eventId}`);
            ';
            // GameEngineに季節イベント終了を通知
            if(this.gameEngine.eventBus) { '

                this.gameEngine.eventBus.emit('seasonalEventDeactivated', { }
                    eventId); }
});
    }
    
    /**
     * 季節の終了時刻を取得
     */
    private getSeasonEndTime(season: Season): number { const now = new Date();
        const currentYear = now.getFullYear();
        const seasonData = this.SEASONAL_PERIODS[season];
        
        if (!seasonData) return now.getTime();
        
        // 季節の最後の月の末日を計算
        const lastMonth = Math.max(...seasonData.months);
        const endDate = new Date(currentYear, lastMonth, 0); // 月末日
        endDate.setHours(23, 59, 59, 999);
        
        // 現在時刻より前の場合は来年を使用
        if (endDate.getTime() < now.getTime() {
            endDate.setFullYear(currentYear + 1); }
        
        return endDate.getTime();
    }
    
    /**
     * 春のエフェクトを適用
     */''
    private applySpringEffects(specialRules: SpecialRules): void { specialRules.bloomEffect = true;
        specialRules.pastelColors = true;
        specialRules.cherryBlossomParticles = true;
        specialRules.gentleWind = 0.3;
        
        // 春特有の泡の色調整
        specialRules.bubbleColorFilters = {
            hueShift: 10;
            saturation: 1.2;
            brightness: 1.1 };
        ;
        // 春のBGM設定
        specialRules.backgroundMusic = 'spring-melody';
        ';
        // 花びらエフェクト
        if(this.gameEngine.particleManager) { '

            this.gameEngine.particleManager.addSeasonalEffect('cherry-blossoms', {''
                type: 'falling-petals',)';
                color: '#FFB6C1')';
                count: 15,' }'

                speed: 0.5)'); }'
        }

        console.log('Applied, spring seasonal, effects');
    }
    
    /**
     * 夏のエフェクトを適用'
     */''
    private applySummerEffects(specialRules: SpecialRules): void { specialRules.heatWave = true;
        specialRules.vibrantColors = true;
        specialRules.sunRays = true;
        specialRules.heatShimmer = 0.2;
        
        // 夏特有の色調整
        specialRules.bubbleColorFilters = {
            hueShift: -5;
            saturation: 1.3;
            brightness: 1.2 };
        ;
        // 夏のBGM設定
        specialRules.backgroundMusic = 'summer-festival';
        ';
        // 花火エフェクト
        if(this.gameEngine.particleManager) { '

            this.gameEngine.particleManager.addSeasonalEffect('fireworks', {''
                type: 'burst',)';
                colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00],' }

                interval: 5000)'); }'
        }

        console.log('Applied, summer seasonal, effects');
    }
    
    /**
     * 秋のエフェクトを適用'
     */''
    private applyAutumnEffects(specialRules: SpecialRules): void { specialRules.fallingLeaves = true;
        specialRules.warmColors = true;
        specialRules.goldenHour = true;
        specialRules.autumnWind = 0.4;
        
        // 秋特有の色調整
        specialRules.bubbleColorFilters = {
            hueShift: 20;
            saturation: 1.1;
            brightness: 0.9 };
        ;
        // 秋のBGM設定
        specialRules.backgroundMusic = 'autumn-leaves';
        ';
        // 落ち葉エフェクト
        if(this.gameEngine.particleManager) { '

            this.gameEngine.particleManager.addSeasonalEffect('falling-leaves', {''
                type: 'falling',)';
                colors: ['#FF8C00', '#DC143C', '#B8860B', '#CD853F])';
                count: 12,' }'

                speed: 0.8)'); }'
        }

        console.log('Applied, autumn seasonal, effects');
    }
    
    /**
     * 冬のエフェクトを適用'
     */''
    private applyWinterEffects(specialRules: SpecialRules): void { specialRules.snowfall = true;
        specialRules.coolColors = true;
        specialRules.iceEffect = true;
        specialRules.frostedGlass = 0.3;
        
        // 冬特有の色調整
        specialRules.bubbleColorFilters = {
            hueShift: -10;
            saturation: 0.8;
            brightness: 1.1 };
        ;
        // 冬のBGM設定
        specialRules.backgroundMusic = 'winter-wonderland';
        ';
        // 雪エフェクト
        if(this.gameEngine.particleManager) { '

            this.gameEngine.particleManager.addSeasonalEffect('snowfall', {''
                type: 'falling',
                color: '#FFFFFF);
                count: 20 ,}

                speed: 0.3,') }'

                size: { min: 2, max: 5 ,})');
        }

        console.log('Applied, winter seasonal, effects);
    }
    
    /**
     * 季節エフェクトを適用
     */
    applySeasonalEffects(event: Event | null, specialRules: SpecialRules): void { const season = this.currentSeason;

        switch(season') {'

            case 'spring':'';
                this.applySpringEffects(specialRules);

                break;''
            case 'summer':'';
                this.applySummerEffects(specialRules);

                break;''
            case 'autumn':'';
                this.applyAutumnEffects(specialRules);

                break;''
            case 'winter':;
                this.applyWinterEffects(specialRules);
        }
                break; }
        }
        
        // 季節イベント固有のエフェクト
        if (event && event.seasonalEffects) { Object.assign(specialRules, event.seasonalEffects); }
    }
    
    /**
     * アクティブな季節イベントを取得
     */
    getActiveSeasonalEvents(): SeasonalEventData[] { return Array.from(this.activeSeasonalEvents.values(); }
    
    /**
     * 季節イベントがアクティブかチェック
     */
    isSeasonalEventActive(eventId: string): boolean { return this.activeSeasonalEvents.has(eventId); }
    
    /**
     * 季節イベント情報を取得
     */
    getSeasonalEventInfo(eventId: string): SeasonalEventData | null { return this.activeSeasonalEvents.get(eventId) || null; }
    
    /**
     * 現在の季節情報を取得
     */
    getCurrentSeasonInfo(): SeasonInfo { return { season: this.currentSeason,
            seasonData: this.SEASONAL_PERIODS[this.currentSeason];
            activeEvents: this.getActiveSeasonalEvents(), };
            timeUntilNextSeason: this.getTimeUntilNextSeason(); }
        }
    
    /**
     * 次の季節までの時間を取得
     */
    private getTimeUntilNextSeason(): number { const currentTime = Date.now();
        const seasonEndTime = this.getSeasonEndTime(this.currentSeason);
        return Math.max(0, seasonEndTime - currentTime); }
    
    /**
     * 季節イベントデータを読み込み（EventStageManager対応）
     */''
    load()';
            const savedSeasonalData = localStorage.getItem('seasonalEventData);
            if(savedSeasonalData) {
                const data: SavedSeasonalData = JSON.parse(savedSeasonalData),
                
                // アクティブイベントを復元
                if (data.activeSeasonalEvents) {
            }
                    this.activeSeasonalEvents = new Map(data.activeSeasonalEvents); }
                }
                ;
                // 現在の季節を復元
                if(data.currentSeason) { this.currentSeason = data.currentSeason; }

                console.log('[SeasonalEventManager] 季節イベントデータを読み込みました'');

            } else { }'

                console.log('[SeasonalEventManager] 保存されたデータがありません、デフォルト設定を使用'); }'
            }
            
            // 現在の季節をチェック
            this.checkSeasonalEvents();

        } catch (error) {
            console.error('[SeasonalEventManager] データ読み込みエラー:', error);
            // エラーの場合は現在の季節を再設定
            this.currentSeason = this.getCurrentSeason(); }
    }

    /**
     * 季節イベントデータを保存
     */
    save(): void { try {
            const dataToSave: SavedSeasonalData = {
                activeSeasonalEvents: Array.from(this.activeSeasonalEvents.entries();
                currentSeason: this.currentSeason,
                lastUpdated: Date.now()';
            localStorage.setItem('seasonalEventData', JSON.stringify(dataToSave));''
            console.log('[SeasonalEventManager] 季節イベントデータを保存しました');' }

        } catch (error) {
            console.error('[SeasonalEventManager] データ保存エラー:', error); }
    }

    /**
     * リソースクリーンアップ
     */
    dispose(): void { if (this.seasonalCheckInterval) {
            clearInterval(this.seasonalCheckInterval);
            this.seasonalCheckInterval = null; }
        
        // データを保存してからクリーンアップ
        this.save();
        
        // パーティクルエフェクトをクリア
        if (this.gameEngine.particleManager) { this.gameEngine.particleManager.clearSeasonalEffects(); }

        this.activeSeasonalEvents.clear()';
        console.log('SeasonalEventManager, disposed'');

    }''
}