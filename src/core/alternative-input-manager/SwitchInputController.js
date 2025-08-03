/**
 * Switch Input Controller
 * スイッチ入力・スキャニング制御 - スイッチ操作とスキャニング入力の専門管理
 */
export class SwitchInputController {
    constructor() {
        // スイッチ入力設定
        this.switchConfig = {
            enabled: false,
            scanSpeed: 2000,
            scanMode: 'auto',
            activationTime: 100,
            dwellTime: 1000,
            numberOfSwitches: 1,
            switchMapping: new Map([
                ['space', 'primary'],
                ['enter', 'secondary'],
                ['escape', 'cancel']
            ])
        };
        
        // スキャニング設定
        this.scanningConfig = {
            enabled: false,
            scanPattern: 'linear',
            highlightStyle: 'border',
            highlightColor: '#00ff00',
            audioFeedback: true,
            autoStart: true,
            groupScanLevels: 2
        };
        
        // 入力状態
        this.switchState = {
            isPressed: false,
            lastPressTime: 0,
            scanningActive: false,
            currentIndex: 0,
            scanDirection: 1
        };
        
        this.scanningState = {
            isScanning: false,
            currentElement: null,
            scanTimer: null,
            elementGroups: [],
            currentGroup: 0
        };
        
        // 要素管理
        this.interactiveElements = new Map();
        this.focusableElements = [];
        this.scanningGroups = [];
        this.currentFocusIndex = -1;
        
        // 視覚フィードバック
        this.scanHighlight = null;
        this.feedbackElements = new Map();
        
        // 統計
        this.stats = {
            switchActivations: 0,
            scanningCycles: 0,
            averageScanTime: 0,
            successfulSelections: 0
        };
        
        console.log('[SwitchInputController] Initialized');
    }
    
    /**
     * スイッチ入力を初期化
     * @param {Object} config - 設定オブジェクト
     */
    initializeSwitchInput(config = {}) {
        Object.assign(this.switchConfig, config.switchInput || {});
        Object.assign(this.scanningConfig, config.scanning || {});
        
        if (this.switchConfig.enabled) {
            this.setupSwitchListeners();
            this.initializeScanning();
        }
        
        console.log('[SwitchInputController] Switch input initialized');
    }
    
    /**
     * スイッチリスナーを設定
     */
    setupSwitchListeners() {
        document.addEventListener('keydown', (event) => {
            this.handleSwitchInput(event.code.toLowerCase(), 'down');
        });
        
        document.addEventListener('keyup', (event) => {
            this.handleSwitchInput(event.code.toLowerCase(), 'up');
        });
        
        // 外部スイッチデバイスサポート
        if ('navigator' in window && 'hid' in navigator) {
            this.setupHIDSwitchSupport();
        }
    }
    
    /**
     * HIDスイッチサポートを設定
     */
    async setupHIDSwitchSupport() {
        try {
            // HIDデバイスの検出とセットアップ
            const devices = await navigator.hid.getDevices();
            for (const device of devices) {
                if (this.isSwitchDevice(device)) {
                    await this.connectSwitchDevice(device);
                }
            }
        } catch (error) {
            console.warn('[SwitchInputController] HID setup failed:', error);
        }
    }
    
    /**
     * スイッチデバイス判定
     * @param {HIDDevice} device - HIDデバイス
     * @returns {boolean} スイッチデバイスかどうか
     */
    isSwitchDevice(device) {
        // 一般的なスイッチデバイスのベンダーID/プロダクトIDをチェック
        const switchVendorIds = [0x16c0, 0x1209, 0x04d8]; // 例：Teensy, generic, Microchip
        return switchVendorIds.includes(device.vendorId);
    }
    
    /**
     * スイッチデバイスに接続
     * @param {HIDDevice} device - HIDデバイス
     */
    async connectSwitchDevice(device) {
        try {
            await device.open();
            device.addEventListener('inputreport', (event) => {
                this.handleHIDSwitchInput(event.data);
            });
            console.log('[SwitchInputController] Connected to switch device:', device.productName);
        } catch (error) {
            console.error('[SwitchInputController] Failed to connect switch device:', error);
        }
    }
    
    /**
     * HIDスイッチ入力を処理
     * @param {DataView} data - 入力データ
     */
    handleHIDSwitchInput(data) {
        // HIDレポートからスイッチ状態を解析
        const switchStates = [];
        for (let i = 0; i < data.byteLength; i++) {
            const byte = data.getUint8(i);
            for (let bit = 0; bit < 8; bit++) {
                switchStates.push((byte >> bit) & 1);
            }
        }
        
        switchStates.forEach((state, index) => {
            if (state && !this.switchState.isPressed) {
                this.handleSwitchActivation(`hid_switch_${index}`);
            }
            this.switchState.isPressed = state > 0;
        });
    }
    
    /**
     * スイッチ入力を処理
     * @param {string} keyCode - キーコード
     * @param {string} action - アクション ('down' | 'up')
     */
    handleSwitchInput(keyCode, action) {
        if (!this.switchConfig.enabled) return;
        
        const switchAction = this.switchConfig.switchMapping.get(keyCode);
        if (!switchAction) return;
        
        const now = Date.now();
        
        if (action === 'down') {
            this.switchState.isPressed = true;
            this.switchState.lastPressTime = now;
            
            // 長押し検出タイマー
            setTimeout(() => {
                if (this.switchState.isPressed) {
                    this.handleSwitchHold(switchAction);
                }
            }, this.switchConfig.dwellTime);
            
        } else if (action === 'up') {
            const pressDuration = now - this.switchState.lastPressTime;
            this.switchState.isPressed = false;
            
            if (pressDuration >= this.switchConfig.activationTime) {
                this.handleSwitchActivation(switchAction);
            }
        }
    }
    
    /**
     * スイッチ活性化を処理
     * @param {string} switchAction - スイッチアクション
     */
    handleSwitchActivation(switchAction) {
        this.stats.switchActivations++;
        
        switch (switchAction) {
            case 'primary':
                this.performPrimaryAction();
                break;
            case 'secondary':
                this.performSecondaryAction();
                break;
            case 'cancel':
                this.performCancelAction();
                break;
            default:
                console.log('[SwitchInputController] Unknown switch action:', switchAction);
        }
        
        this.provideFeedback('switch_activated', { action: switchAction });
    }
    
    /**
     * スイッチ長押しを処理
     * @param {string} switchAction - スイッチアクション
     */
    handleSwitchHold(switchAction) {
        if (switchAction === 'primary') {
            this.toggleScanning();
        } else if (switchAction === 'secondary') {
            this.showContextMenu();
        }
    }
    
    /**
     * プライマリアクションを実行
     */
    performPrimaryAction() {
        if (this.scanningState.isScanning) {
            this.selectCurrentElement();
        } else {
            this.startScanning();
        }
    }
    
    /**
     * セカンダリアクションを実行
     */
    performSecondaryAction() {
        if (this.scanningState.isScanning) {
            this.moveToNextGroup();
        } else {
            this.showAlternativeMenu();
        }
    }
    
    /**
     * キャンセルアクションを実行
     */
    performCancelAction() {
        if (this.scanningState.isScanning) {
            this.stopScanning();
        } else {
            this.returnToPreviousLevel();
        }
    }
    
    /**
     * スキャニングを初期化
     */
    initializeScanning() {
        if (!this.scanningConfig.enabled) return;
        
        this.updateInteractiveElements();
        this.createScanningGroups();
        this.createScanHighlight();
        
        if (this.scanningConfig.autoStart) {
            this.startScanning();
        }
    }
    
    /**
     * インタラクティブ要素を更新
     */
    updateInteractiveElements() {
        this.focusableElements = [];
        this.interactiveElements.clear();
        
        // DOMからフォーカス可能要素を収集
        const focusableSelectors = [
            'button:not([disabled])',
            'a[href]',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '.bubble:not(.disabled)',
            '.ui-element:not(.disabled)'
        ];
        
        focusableSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element, index) => {
                const id = `element_${index}_${Date.now()}`;
                element.setAttribute('data-switch-id', id);
                this.interactiveElements.set(id, element);
                this.focusableElements.push(element);
            });
        });
        
        console.log(`[SwitchInputController] Found ${this.focusableElements.length} interactive elements`);
    }
    
    /**
     * スキャニンググループを作成
     */
    createScanningGroups() {
        this.scanningGroups = [];
        
        if (this.scanningConfig.scanPattern === 'linear') {
            // 線形スキャニング：すべて一つのグループ
            this.scanningGroups = [this.focusableElements];
            
        } else if (this.scanningConfig.scanPattern === 'group') {
            // グループスキャニング：画面領域ごとにグループ化
            const groups = this.groupElementsByPosition();
            this.scanningGroups = groups;
            
        } else if (this.scanningConfig.scanPattern === 'custom') {
            // カスタムスキャニング：要素タイプごとにグループ化
            const groups = this.groupElementsByType();
            this.scanningGroups = groups;
        }
        
        console.log(`[SwitchInputController] Created ${this.scanningGroups.length} scanning groups`);
    }
    
    /**
     * 位置によって要素をグループ化
     * @returns {Array} 要素グループ配列
     */
    groupElementsByPosition() {
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        const topGroup = [];
        const middleGroup = [];
        const bottomGroup = [];
        
        this.focusableElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            
            if (centerY < viewportHeight / 3) {
                topGroup.push(element);
            } else if (centerY < viewportHeight * 2 / 3) {
                middleGroup.push(element);
            } else {
                bottomGroup.push(element);
            }
        });
        
        return [topGroup, middleGroup, bottomGroup].filter(group => group.length > 0);
    }
    
    /**
     * タイプによって要素をグループ化
     * @returns {Array} 要素グループ配列
     */
    groupElementsByType() {
        const buttonGroup = [];
        const inputGroup = [];
        const gameGroup = [];
        const navigationGroup = [];
        
        this.focusableElements.forEach(element => {
            if (element.tagName === 'BUTTON' || element.classList.contains('btn')) {
                buttonGroup.push(element);
            } else if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
                inputGroup.push(element);
            } else if (element.classList.contains('bubble') || element.classList.contains('game-element')) {
                gameGroup.push(element);
            } else {
                navigationGroup.push(element);
            }
        });
        
        return [gameGroup, buttonGroup, inputGroup, navigationGroup].filter(group => group.length > 0);
    }
    
    /**
     * スキャンハイライトを作成
     */
    createScanHighlight() {
        if (this.scanHighlight) {
            this.scanHighlight.remove();
        }
        
        this.scanHighlight = document.createElement('div');
        this.scanHighlight.className = 'scan-highlight';
        this.scanHighlight.style.cssText = `
            position: fixed;
            pointer-events: none;
            border: 3px solid ${this.scanningConfig.highlightColor};
            border-radius: 4px;
            background: rgba(0, 255, 0, 0.1);
            z-index: 10000;
            display: none;
            transition: all 0.2s ease;
        `;
        
        document.body.appendChild(this.scanHighlight);
    }
    
    /**
     * スキャニングを開始
     */
    startScanning() {
        if (this.scanningState.isScanning) return;
        
        this.scanningState.isScanning = true;
        this.scanningState.currentGroup = 0;
        this.currentFocusIndex = 0;
        this.stats.scanningCycles++;
        
        this.highlightCurrentElement();
        this.scheduleScanAdvance();
        
        this.provideFeedback('scanning_started');
        console.log('[SwitchInputController] Scanning started');
    }
    
    /**
     * スキャニングを停止
     */
    stopScanning() {
        this.scanningState.isScanning = false;
        
        if (this.scanningState.scanTimer) {
            clearTimeout(this.scanningState.scanTimer);
            this.scanningState.scanTimer = null;
        }
        
        this.hideScanHighlight();
        this.provideFeedback('scanning_stopped');
        console.log('[SwitchInputController] Scanning stopped');
    }
    
    /**
     * スキャニングを切り替え
     */
    toggleScanning() {
        if (this.scanningState.isScanning) {
            this.stopScanning();
        } else {
            this.startScanning();
        }
    }
    
    /**
     * スキャン進行をスケジュール
     */
    scheduleScanAdvance() {
        if (!this.scanningState.isScanning) return;
        
        this.scanningState.scanTimer = setTimeout(() => {
            this.advanceScan();
            this.scheduleScanAdvance();
        }, this.switchConfig.scanSpeed);
    }
    
    /**
     * スキャンを進める
     */
    advanceScan() {
        const currentGroup = this.scanningGroups[this.scanningState.currentGroup];
        if (!currentGroup || currentGroup.length === 0) return;
        
        this.currentFocusIndex = (this.currentFocusIndex + 1) % currentGroup.length;
        
        // グループの最後まで到達した場合
        if (this.currentFocusIndex === 0 && this.scanningGroups.length > 1) {
            this.scanningState.currentGroup = (this.scanningState.currentGroup + 1) % this.scanningGroups.length;
        }
        
        this.highlightCurrentElement();
    }
    
    /**
     * 現在の要素をハイライト
     */
    highlightCurrentElement() {
        const currentGroup = this.scanningGroups[this.scanningState.currentGroup];
        if (!currentGroup || !currentGroup[this.currentFocusIndex]) {
            this.hideScanHighlight();
            return;
        }
        
        const element = currentGroup[this.currentFocusIndex];
        const rect = element.getBoundingClientRect();
        
        this.scanHighlight.style.display = 'block';
        this.scanHighlight.style.left = `${rect.left - 5}px`;
        this.scanHighlight.style.top = `${rect.top - 5}px`;
        this.scanHighlight.style.width = `${rect.width + 10}px`;
        this.scanHighlight.style.height = `${rect.height + 10}px`;
        
        // オーディオフィードバック
        if (this.scanningConfig.audioFeedback) {
            this.playAudioFeedback('scan_highlight');
        }
    }
    
    /**
     * スキャンハイライトを隠す
     */
    hideScanHighlight() {
        if (this.scanHighlight) {
            this.scanHighlight.style.display = 'none';
        }
    }
    
    /**
     * 現在の要素を選択
     */
    selectCurrentElement() {
        const currentGroup = this.scanningGroups[this.scanningState.currentGroup];
        if (!currentGroup || !currentGroup[this.currentFocusIndex]) return;
        
        const element = currentGroup[this.currentFocusIndex];
        this.activateElement(element);
        this.stats.successfulSelections++;
        this.stopScanning();
    }
    
    /**
     * 要素を活性化
     * @param {Element} element - 対象要素
     */
    activateElement(element) {
        // 要素タイプに応じた活性化処理
        if (element.tagName === 'BUTTON' || element.type === 'button') {
            element.click();
        } else if (element.tagName === 'A') {
            element.click();
        } else if (element.tagName === 'INPUT') {
            element.focus();
        } else if (element.classList.contains('bubble')) {
            // ゲーム内泡要素のクリック
            this.activateGameElement(element);
        } else {
            // 汎用的な活性化
            element.focus();
            if (typeof element.click === 'function') {
                element.click();
            }
        }
        
        this.provideFeedback('element_activated', { element: element.tagName });
    }
    
    /**
     * ゲーム要素を活性化
     * @param {Element} element - ゲーム要素
     */
    activateGameElement(element) {
        // ゲーム固有の活性化ロジック
        const bubbleData = {
            x: parseFloat(element.style.left) || 0,
            y: parseFloat(element.style.top) || 0,
            type: element.dataset.bubbleType || 'normal'
        };
        
        // ゲームエンジンに泡クリックイベントを送信
        if (this.gameEngine && typeof this.gameEngine.handleBubbleClick === 'function') {
            this.gameEngine.handleBubbleClick(bubbleData);
        }
    }
    
    /**
     * 次のグループに移動
     */
    moveToNextGroup() {
        if (this.scanningGroups.length <= 1) return;
        
        this.scanningState.currentGroup = (this.scanningState.currentGroup + 1) % this.scanningGroups.length;
        this.currentFocusIndex = 0;
        this.highlightCurrentElement();
        
        this.provideFeedback('group_changed');
    }
    
    /**
     * フィードバックを提供
     * @param {string} type - フィードバックタイプ
     * @param {Object} data - 追加データ
     */
    provideFeedback(type, data = {}) {
        // 視覚フィードバック
        this.provideVisualFeedback(type, data);
        
        // オーディオフィードバック
        if (this.scanningConfig.audioFeedback) {
            this.playAudioFeedback(type);
        }
        
        // ハプティックフィードバック（対応デバイス）
        if ('navigator' in window && 'vibrate' in navigator) {
            this.provideHapticFeedback(type);
        }
    }
    
    /**
     * 視覚フィードバックを提供
     * @param {string} type - フィードバックタイプ
     * @param {Object} data - 追加データ
     */
    provideVisualFeedback(type, data) {
        // 実装は省略（視覚エフェクト）
    }
    
    /**
     * オーディオフィードバックを再生
     * @param {string} type - サウンドタイプ
     */
    playAudioFeedback(type) {
        // 実装は省略（オーディオ再生）
    }
    
    /**
     * ハプティックフィードバックを提供
     * @param {string} type - フィードバックタイプ
     */
    provideHapticFeedback(type) {
        const patterns = {
            'switch_activated': [100],
            'scanning_started': [50, 50, 50],
            'element_activated': [200],
            'scan_highlight': [25]
        };
        
        if (patterns[type]) {
            navigator.vibrate(patterns[type]);
        }
    }
    
    /**
     * 統計情報を取得
     * @returns {Object} 統計情報
     */
    getStats() {
        return {
            ...this.stats,
            scanningActive: this.scanningState.isScanning,
            totalElements: this.focusableElements.length,
            currentElement: this.currentFocusIndex,
            successRate: this.stats.switchActivations > 0 ? 
                (this.stats.successfulSelections / this.stats.switchActivations) * 100 : 0
        };
    }
    
    /**
     * 設定を更新
     * @param {Object} newConfig - 新しい設定
     */
    updateConfig(newConfig) {
        if (newConfig.switchInput) {
            Object.assign(this.switchConfig, newConfig.switchInput);
        }
        if (newConfig.scanning) {
            Object.assign(this.scanningConfig, newConfig.scanning);
        }
        
        console.log('[SwitchInputController] Configuration updated');
    }
    
    /**
     * リソースをクリーンアップ
     */
    cleanup() {
        this.stopScanning();
        
        if (this.scanHighlight) {
            this.scanHighlight.remove();
            this.scanHighlight = null;
        }
        
        this.interactiveElements.clear();
        this.focusableElements = [];
        this.scanningGroups = [];
        
        console.log('[SwitchInputController] Cleaned up');
    }
}