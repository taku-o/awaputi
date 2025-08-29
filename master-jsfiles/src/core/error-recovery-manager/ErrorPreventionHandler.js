/**
 * ErrorPreventionHandler - エラー防止処理システム
 * 
 * エラー発生前の予防措置、確認ダイアログ、クリック防止機能を専門的に管理します
 */
export class ErrorPreventionHandler {
    constructor(config, uiComponents) {
        this.config = config;
        this.ui = uiComponents;
        
        // 防止システム設定
        this.preventionConfig = config.prevention;
        
        // 状態管理
        this.state = {
            lastClickTimes: new Map(),
            pendingConfirmations: new Map(),
            warningThresholds: config.prevention.warningThresholds
        };
        
        // 重要アクションの定義
        this.criticalActions = {
            classes: ['reset-btn', 'delete-btn', 'clear-btn', 'new-game-btn'],
            attributes: ['data-confirm-action'],
            patterns: ['reset', 'delete', 'clear', 'newGame']
        };
    }
    
    /**
     * クリック防止処理
     * @param {Event} event - クリックイベント
     * @returns {boolean} - 処理を続行するかどうか
     */
    handleClickPrevention(event) {
        const element = event.target;
        const now = Date.now();
        
        // ダブルクリック防止
        if (this.preventionConfig.doubleClickPrevention > 0) {
            const elementId = this.getElementId(element);
            const lastClickTime = this.state.lastClickTimes.get(elementId);
            
            if (lastClickTime && now - lastClickTime < this.preventionConfig.doubleClickPrevention) {
                event.preventDefault();
                event.stopPropagation();
                
                this.reportPreventionAction({
                    type: 'input',
                    subtype: 'doubleClick',
                    severity: 'low',
                    element: element,
                    message: '同じ要素を短時間で複数回クリックしました',
                    preventionTime: now - lastClickTime
                });
                
                return false;
            }
            
            this.state.lastClickTimes.set(elementId, now);
        }
        
        // 重要なアクションの確認
        if (this.shouldConfirmAction(element)) {
            event.preventDefault();
            event.stopPropagation();
            this.requestActionConfirmation(element);
            return false;
        }
        
        // 連続クリック検出
        if (this.detectRapidClicks(element, now)) {
            event.preventDefault();
            event.stopPropagation();
            
            this.reportPreventionAction({
                type: 'input',
                subtype: 'rapidClicks',
                severity: 'medium',
                element: element,
                message: 'クリックが速すぎます'
            });
            
            return false;
        }
        
        return true;
    }
    
    /**
     * 要素のユニークIDを取得
     * @param {HTMLElement} element - 対象要素
     * @returns {string} - ユニークID
     */
    getElementId(element) {
        if (element.id) return element.id;
        if (element.className) return `${element.tagName}.${element.className}`;
        return `${element.tagName}@${element.offsetTop},${element.offsetLeft}`;
    }
    
    /**
     * アクションの確認が必要かチェック
     * @param {HTMLElement} element - 対象要素
     * @returns {boolean} - 確認が必要かどうか
     */
    shouldConfirmAction(element) {
        if (!this.preventionConfig.confirmCriticalActions) return false;
        
        // データ属性でチェック
        if (element.dataset.confirmAction === 'true') return true;
        
        // クラス名でチェック
        const hasCriticalClass = this.criticalActions.classes.some(cls => 
            element.classList.contains(cls)
        );
        
        if (hasCriticalClass) return true;
        
        // パターンマッチング
        const elementText = (element.textContent || '').toLowerCase();
        const hasPattern = this.criticalActions.patterns.some(pattern => 
            elementText.includes(pattern.toLowerCase())
        );
        
        return hasPattern;
    }
    
    /**
     * 連続クリックを検出
     * @param {HTMLElement} element - 対象要素
     * @param {number} now - 現在時刻
     * @returns {boolean} - 連続クリックかどうか
     */
    detectRapidClicks(element, now) {
        const elementId = this.getElementId(element);
        const clickHistory = this.state.lastClickTimes.get(`${elementId}_history`) || [];
        
        // 履歴に追加
        clickHistory.push(now);
        
        // 直近1秒間のクリック数をチェック
        const recentClicks = clickHistory.filter(time => now - time < 1000);
        this.state.lastClickTimes.set(`${elementId}_history`, recentClicks);
        
        // 5回以上のクリックで連続クリック判定
        return recentClicks.length >= 5;
    }
    
    /**
     * アクション確認を要求
     * @param {HTMLElement} element - 対象要素
     */
    requestActionConfirmation(element) {
        const actionName = element.textContent || element.getAttribute('aria-label') || '操作';
        const warningText = this.getActionWarning(element);
        
        this.showConfirmDialog({
            title: `${actionName}の確認`,
            description: `「${actionName}」を実行してもよろしいですか？`,
            warning: warningText,
            element: element,
            onConfirm: () => this.executeConfirmedAction(element),
            onCancel: () => this.cancelAction(element)
        });
    }
    
    /**
     * アクション警告メッセージを取得
     * @param {HTMLElement} element - 対象要素
     * @returns {string|null} - 警告メッセージ
     */
    getActionWarning(element) {
        if (element.classList.contains('reset-btn')) {
            return 'この操作により、現在の進行状況が失われます。';
        }
        
        if (element.classList.contains('delete-btn')) {
            return 'このデータは削除すると復元できません。';
        }
        
        if (element.classList.contains('clear-btn')) {
            return 'すべてのデータがクリアされます。';
        }
        
        if (element.classList.contains('new-game-btn')) {
            return '現在のゲームが終了し、新しいゲームが開始されます。';
        }
        
        return null;
    }
    
    /**
     * 確認ダイアログを表示
     * @param {Object} options - ダイアログオプション
     */
    showConfirmDialog(options) {
        const dialog = this.ui.confirmDialog;
        
        // コンテンツを設定
        dialog.querySelector('.confirm-title').textContent = options.title;
        dialog.querySelector('.confirm-description').textContent = options.description;
        
        // 警告メッセージ
        const warningDiv = dialog.querySelector('.confirm-warning');
        if (options.warning) {
            warningDiv.style.display = 'block';
            warningDiv.querySelector('.confirm-warning-text').textContent = options.warning;
        } else {
            warningDiv.style.display = 'none';
        }
        
        // ボタンイベント
        this.setupConfirmDialogEvents(dialog, options);
        
        // ダイアログを表示
        dialog.classList.remove('hidden');
        dialog.querySelector('.confirm-btn.cancel').focus();
        
        // 確認待ちに追加
        const elementId = this.getElementId(options.element);
        this.state.pendingConfirmations.set(elementId, options);
    }
    
    /**
     * 確認ダイアログのイベントを設定
     * @param {HTMLElement} dialog - ダイアログ要素
     * @param {Object} options - オプション
     */
    setupConfirmDialogEvents(dialog, options) {
        const cancelBtn = dialog.querySelector('.confirm-btn.cancel');
        const proceedBtn = dialog.querySelector('.confirm-btn.proceed');
        
        // 既存のイベントリスナーを削除
        const newCancelBtn = cancelBtn.cloneNode(true);
        const newProceedBtn = proceedBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        proceedBtn.parentNode.replaceChild(newProceedBtn, proceedBtn);
        
        newCancelBtn.addEventListener('click', () => {
            this.hideConfirmDialog();
            if (options.onCancel) options.onCancel();
        });
        
        newProceedBtn.addEventListener('click', () => {
            this.hideConfirmDialog();
            if (options.onConfirm) options.onConfirm();
        });
        
        // ESCキーで閉じる
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.hideConfirmDialog();
                if (options.onCancel) options.onCancel();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
    
    /**
     * 確認ダイアログを非表示
     */
    hideConfirmDialog() {
        this.ui.confirmDialog.classList.add('hidden');
    }
    
    /**
     * 確認されたアクションを実行
     * @param {HTMLElement} element - 対象要素
     */
    executeConfirmedAction(element) {
        // セーフティ遅延
        const delay = this.getSafetyDelay(element);
        
        setTimeout(() => {
            // 元のクリックイベントを発火
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            
            // 確認済みフラグを設定
            clickEvent._confirmed = true;
            element.dispatchEvent(clickEvent);
            
            // 確認完了を記録
            const elementId = this.getElementId(element);
            this.state.pendingConfirmations.delete(elementId);
            
        }, delay);
    }
    
    /**
     * アクションをキャンセル
     * @param {HTMLElement} element - 対象要素
     */
    cancelAction(element) {
        const elementId = this.getElementId(element);
        this.state.pendingConfirmations.delete(elementId);
        
        this.reportPreventionAction({
            type: 'interface',
            subtype: 'actionCancelled',
            severity: 'low',
            element: element,
            message: 'ユーザーがアクションをキャンセルしました'
        });
    }
    
    /**
     * セーフティ遅延時間を取得
     * @param {HTMLElement} element - 対象要素
     * @returns {number} - 遅延時間（ミリ秒）
     */
    getSafetyDelay(element) {
        if (element.classList.contains('reset-btn')) {
            return this.preventionConfig.safetyDelays.gameReset;
        }
        
        if (element.classList.contains('delete-btn')) {
            return this.preventionConfig.safetyDelays.destructiveAction;
        }
        
        return this.preventionConfig.safetyDelays.criticalAction;
    }
    
    /**
     * ゲーム状態の警告チェック
     * @param {Object} gameState - ゲーム状態
     * @returns {Array} - 警告リスト
     */
    checkGameStateWarnings(gameState) {
        const warnings = [];
        
        // HP警告
        if (gameState.hp <= this.state.warningThresholds.lowHP) {
            warnings.push({
                type: 'gameplay',
                severity: 'high',
                message: 'HPが危険レベルです',
                suggestion: 'ピンクバブルでHP回復を推奨'
            });
        }
        
        // スコア警告
        if (gameState.score <= this.state.warningThresholds.lowScore) {
            warnings.push({
                type: 'gameplay',
                severity: 'medium',
                message: 'スコアが低めです',
                suggestion: 'コンボを狙ってスコアアップ'
            });
        }
        
        // 時間警告
        if (gameState.timeRemaining <= this.state.warningThresholds.timeRunningOut) {
            warnings.push({
                type: 'gameplay',
                severity: 'high',
                message: '残り時間が少なくなっています',
                suggestion: '集中してプレイしてください'
            });
        }
        
        return warnings;
    }
    
    /**
     * 防止アクションを報告
     * @param {Object} actionInfo - アクション情報
     */
    reportPreventionAction(actionInfo) {
        // イベントを発火
        if (this.onPreventionAction) {
            this.onPreventionAction(actionInfo);
        }
        
        console.log('ErrorPreventionHandler: 防止アクション実行', actionInfo);
    }
    
    /**
     * 設定を更新
     * @param {Object} newConfig - 新しい設定
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.preventionConfig = this.config.prevention;
    }
    
    /**
     * 統計情報を取得
     * @returns {Object} - 統計情報
     */
    getStatistics() {
        return {
            preventedDoubleClicks: this.state.lastClickTimes.size,
            pendingConfirmations: this.state.pendingConfirmations.size,
            warningThresholds: this.state.warningThresholds,
            criticalActionsConfigured: this.criticalActions.classes.length
        };
    }
    
    /**
     * リソースの解放
     */
    destroy() {
        this.state.lastClickTimes.clear();
        this.state.pendingConfirmations.clear();
        
        console.log('ErrorPreventionHandler destroyed');
    }
}