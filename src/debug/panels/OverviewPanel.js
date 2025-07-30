/**
 * Overview Panel - 統合デバッグインターフェースの概要パネル
 */
export class OverviewPanel {
    constructor(gameEngine, debugInterface) {
        this.gameEngine = gameEngine;
        this.debugInterface = debugInterface;
        this.element = null;
        this.updateInterval = null;
    }

    /**
     * パネルを作成
     */
    create() {
        this.element = document.createElement('div');
        this.element.className = 'debug-overview-panel';
        this.element.innerHTML = `
            <div class="overview-section">
                <h4>システム概要</h4>
                <div id="system-status">
                    <div>FPS: <span id="overview-fps">--</span></div>
                    <div>メモリ: <span id="overview-memory">-- MB</span></div>
                    <div>描画時間: <span id="overview-render">-- ms</span></div>
                    <div>更新時間: <span id="overview-update">-- ms</span></div>
                </div>
            </div>
            
            <div class="overview-section">
                <h4>アクティブシステム</h4>
                <div id="active-systems">
                    <div>パーティクル: <span id="active-particles">--</span></div>
                    <div>エフェクト: <span id="active-effects">--</span></div>
                    <div>バブル: <span id="active-bubbles">--</span></div>
                    <div>実績: <span id="active-achievements">--</span></div>
                </div>
            </div>
            
            <div class="overview-section">
                <h4>デバッグパネル</h4>
                <div id="debug-panels">
                    <button id="switch-performance">パフォーマンス</button>
                    <button id="switch-console">コンソール</button>
                    <button id="switch-error">エラー</button>
                    <button id="switch-test">テスト</button>
                </div>
            </div>
        `;

        this.bindEvents();
        return this.element;
    }

    /**
     * イベントバインド
     */
    bindEvents() {
        // パネル切り替えボタン
        const buttons = {
            'switch-performance': 'performance',
            'switch-console': 'console', 
            'switch-error': 'error',
            'switch-test': 'test'
        };

        Object.entries(buttons).forEach(([buttonId, panelName]) => {
            const button = this.element.querySelector(`#${buttonId}`);
            if (button) {
                button.addEventListener('click', () => {
                    this.debugInterface.switchPanel(panelName);
                });
            }
        });
    }

    /**
     * パネルを表示
     */
    show() {
        if (this.element) {
            this.element.style.display = 'block';
            this.startUpdate();
        }
    }

    /**
     * パネルを非表示
     */
    hide() {
        if (this.element) {
            this.element.style.display = 'none';
            this.stopUpdate();
        }
    }

    /**
     * 更新開始
     */
    startUpdate() {
        this.updateInterval = setInterval(() => {
            this.update();
        }, 100);
    }

    /**
     * 更新停止
     */
    stopUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * データ更新
     */
    update() {
        if (!this.element) return;

        try {
            // システム概要の更新
            this.updateSystemStatus();
            
            // アクティブシステムの更新
            this.updateActiveSystems();
            
        } catch (error) {
            console.error('Overview panel update error:', error);
        }
    }

    /**
     * システム状況を更新
     */
    updateSystemStatus() {
        const stats = this.gameEngine.performanceStats || {};
        
        this.setElementText('overview-fps', (stats.fps || 0).toFixed(1));
        this.setElementText('overview-memory', ((stats.memoryUsage || 0) / 1024 / 1024).toFixed(1) + ' MB');
        this.setElementText('overview-render', (stats.renderTime || 0).toFixed(2) + ' ms');
        this.setElementText('overview-update', (stats.updateTime || 0).toFixed(2) + ' ms');
    }

    /**
     * アクティブシステムを更新
     */
    updateActiveSystems() {
        // パーティクル数
        const particleCount = this.gameEngine.enhancedParticleManager?.getActiveParticleCount() || 0;
        this.setElementText('active-particles', particleCount);

        // エフェクト数
        const effectCount = this.gameEngine.enhancedEffectManager?.getActiveEffectCount() || 0;
        this.setElementText('active-effects', effectCount);

        // バブル数
        const bubbleCount = this.gameEngine.bubbleManager?.getActiveBubbleCount() || 0;
        this.setElementText('active-bubbles', bubbleCount);

        // 実績数
        const achievements = this.gameEngine.achievementManager?.getAchievements() || [];
        const unlockedCount = achievements.filter(a => a.unlocked).length;
        this.setElementText('active-achievements', `${unlockedCount}/${achievements.length}`);
    }

    /**
     * 要素のテキストを設定
     */
    setElementText(id, text) {
        const element = this.element.querySelector(`#${id}`);
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * パネルを破棄
     */
    destroy() {
        this.stopUpdate();
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
    }
}