/**
 * SeasonDetector - 季節・イベント検出システム
 * 
 * 現在の季節とアクティブイベントの自動検出を専門的に処理します
 */

export class SeasonDetector {
    constructor() {
        this.lastSeasonCheck = 0;
        this.seasonCheckInterval = 60000; // 1分間隔
        this.currentSeason = 'spring';
        this.currentEvent = null;
    }
    
    /**
     * 現在の季節を検出
     * @returns {string} 季節名
     */
    detectCurrentSeason() {
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
        
        return this.currentSeason;
    }
    
    /**
     * 現在のアクティブイベントを取得
     * @param {Object} eventThemes - イベントテーマ定義
     * @returns {string|null} イベント名
     */
    getActiveEvent(eventThemes) {
        const now = new Date();
        const currentDate = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        for (const [eventName, event] of Object.entries(eventThemes)) {
            if (this._isDateInRange(currentDate, event.duration.start, event.duration.end)) {
                this.currentEvent = eventName;
                return eventName;
            }
        }
        
        this.currentEvent = null;
        return null;
    }
    
    /**
     * 季節チェックが必要かどうかを判定
     * @returns {boolean} チェック必要性
     */
    shouldCheckSeason() {
        const now = Date.now();
        return (now - this.lastSeasonCheck) >= this.seasonCheckInterval;
    }
    
    /**
     * 季節チェック時刻を更新
     */
    updateLastSeasonCheck() {
        this.lastSeasonCheck = Date.now();
    }
    
    /**
     * 特定の日付が季節期間内かを判定
     * @param {string} season - 季節名
     * @param {Date} date - チェック対象日付
     * @returns {boolean} 期間内かどうか
     */
    isDateInSeason(season, date = new Date()) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        switch (season) {
            case 'spring':
                return (month === 3 && day >= 20) || (month === 4) || (month === 5) || (month === 6 && day < 21);
            case 'summer':
                return (month === 6 && day >= 21) || (month === 7) || (month === 8) || (month === 9 && day < 23);
            case 'autumn':
                return (month === 9 && day >= 23) || (month === 10) || (month === 11) || (month === 12 && day < 21);
            case 'winter':
                return (month === 12 && day >= 21) || (month === 1) || (month === 2) || (month === 3 && day < 20);
            default:
                return false;
        }
    }
    
    /**
     * 特定の日付がイベント期間内かを判定
     * @param {Object} eventDuration - イベント期間定義
     * @param {Date} date - チェック対象日付
     * @returns {boolean} 期間内かどうか
     */
    isDateInEventPeriod(eventDuration, date = new Date()) {
        const currentDate = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        return this._isDateInRange(currentDate, eventDuration.start, eventDuration.end);
    }
    
    /**
     * 次の季節までの日数を計算
     * @returns {number} 日数
     */
    getDaysUntilNextSeason() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentSeason = this.detectCurrentSeason();
        
        const seasonStartDates = {
            spring: new Date(currentYear, 2, 20), // 3月20日
            summer: new Date(currentYear, 5, 21), // 6月21日
            autumn: new Date(currentYear, 8, 23), // 9月23日
            winter: new Date(currentYear, 11, 21) // 12月21日
        };
        
        const seasons = ['spring', 'summer', 'autumn', 'winter'];
        const currentIndex = seasons.indexOf(currentSeason);
        const nextIndex = (currentIndex + 1) % seasons.length;
        const nextSeason = seasons[nextIndex];
        
        let nextSeasonDate = seasonStartDates[nextSeason];
        
        // 次の季節が来年の場合
        if (nextSeasonDate <= now) {
            nextSeasonDate.setFullYear(currentYear + 1);
        }
        
        const timeDiff = nextSeasonDate.getTime() - now.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
    
    /**
     * 現在進行中のイベント一覧を取得
     * @param {Object} eventThemes - イベントテーマ定義
     * @returns {Array} アクティブイベント配列
     */
    getAllActiveEvents(eventThemes) {
        const now = new Date();
        const currentDate = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        return Object.entries(eventThemes)
            .filter(([_, event]) => this._isDateInRange(currentDate, event.duration.start, event.duration.end))
            .map(([eventName, _]) => eventName);
    }
    
    /**
     * 季節情報のサマリーを取得
     * @param {Object} eventThemes - イベントテーマ定義
     * @returns {Object} 季節情報サマリー
     */
    getSeasonalSummary(eventThemes) {
        const activeEvents = this.getAllActiveEvents(eventThemes);
        const daysUntilNext = this.getDaysUntilNextSeason();
        
        return {
            currentSeason: this.currentSeason,
            currentEvent: this.currentEvent,
            activeEvents: activeEvents,
            daysUntilNextSeason: daysUntilNext,
            lastCheck: new Date(this.lastSeasonCheck),
            nextCheck: new Date(this.lastSeasonCheck + this.seasonCheckInterval)
        };
    }
    
    /**
     * 日付が指定範囲内かを判定
     * @param {string} date - チェック対象日付 (MM-DD形式)
     * @param {string} start - 開始日 (MM-DD形式)
     * @param {string} end - 終了日 (MM-DD形式)
     * @returns {boolean} 範囲内かどうか
     * @private
     */
    _isDateInRange(date, start, end) {
        // 年をまたぐ場合の処理
        if (start > end) {
            return date >= start || date <= end;
        }
        return date >= start && date <= end;
    }
    
    /**
     * 季節検出設定を更新
     * @param {Object} settings - 設定オブジェクト
     */
    updateSettings(settings) {
        if (settings.seasonCheckInterval) {
            this.seasonCheckInterval = settings.seasonCheckInterval;
        }
    }
    
    /**
     * 検出システムの状態を取得
     * @returns {Object} システム状態
     */
    getDetectorStatus() {
        return {
            currentSeason: this.currentSeason,
            currentEvent: this.currentEvent,
            lastCheck: this.lastSeasonCheck,
            checkInterval: this.seasonCheckInterval,
            isCheckRequired: this.shouldCheckSeason()
        };
    }
}