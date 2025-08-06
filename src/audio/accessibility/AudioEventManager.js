/**
 * Audio Event Manager Component
 * 
 * 音響アクセシビリティイベントの記録・履歴管理を担当
 * Main Controller Patternの一部として設計
 */

export class AudioEventManager {
    constructor(mainController) {
        this.mainController = mainController;
        this.eventHistory = [];
        this.maxHistorySize = 50;
        this.initializationTime = Date.now();
    }

    /**
     * イベントの記録
     * @param {string} eventType - イベントタイプ
     * @param {Object} eventData - イベントデータ
     */
    recordEvent(eventType, eventData) {
        const event = {
            id: this.generateEventId(),
            type: eventType,
            data: eventData,
            timestamp: Date.now()
        };
        
        this.eventHistory.push(event);
        
        // 履歴サイズの制限
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
    }

    /**
     * イベント履歴の取得
     * @param {number} limit - 取得件数制限
     * @returns {Array} イベント履歴
     */
    getEventHistory(limit = null) {
        const history = [...this.eventHistory];
        return limit ? history.slice(-limit) : history;
    }

    /**
     * イベント履歴のクリア
     */
    clearEventHistory() {
        this.eventHistory = [];
    }

    /**
     * 統計情報の取得
     * @returns {Object} 使用統計
     */
    getStatistics() {
        const eventsByType = {};
        this.eventHistory.forEach(event => {
            eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
        });
        
        return {
            totalEvents: this.eventHistory.length,
            eventsByType: eventsByType,
            uptime: Date.now() - this.initializationTime,
            firstEventTime: this.eventHistory.length > 0 ? this.eventHistory[0].timestamp : null,
            lastEventTime: this.eventHistory.length > 0 ? this.eventHistory[this.eventHistory.length - 1].timestamp : null
        };
    }

    /**
     * イベントタイプ別の集計
     * @param {string} eventType - イベントタイプ
     * @returns {Array} 指定タイプのイベント
     */
    getEventsByType(eventType) {
        return this.eventHistory.filter(event => event.type === eventType);
    }

    /**
     * 時間範囲でのイベント取得
     * @param {number} startTime - 開始時刻
     * @param {number} endTime - 終了時刻
     * @returns {Array} 指定期間のイベント
     */
    getEventsByTimeRange(startTime, endTime = Date.now()) {
        return this.eventHistory.filter(event => 
            event.timestamp >= startTime && event.timestamp <= endTime
        );
    }

    /**
     * イベントIDの生成
     * @returns {string} ユニークなイベントID
     */
    generateEventId() {
        return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 履歴サイズの設定
     * @param {number} maxSize - 最大履歴サイズ
     */
    setMaxHistorySize(maxSize) {
        this.maxHistorySize = maxSize;
        
        // 現在の履歴をトリミング
        if (this.eventHistory.length > maxSize) {
            this.eventHistory = this.eventHistory.slice(-maxSize);
        }
    }

    /**
     * ステータス取得
     * @returns {Object} コンポーネントステータス
     */
    getStatus() {
        return {
            historySize: this.eventHistory.length,
            maxHistorySize: this.maxHistorySize,
            uptime: Date.now() - this.initializationTime,
            eventTypes: Object.keys(this.getStatistics().eventsByType)
        };
    }

    /**
     * クリーンアップ
     */
    destroy() {
        this.clearEventHistory();
    }
}