/**
 * SwitchInputController - スイッチ入力コントローラー
 * 
 * スイッチ操作とスキャニング入力の専門管理システム
 */

// 型定義
export interface SwitchInputConfig { enabled: boolean,
    scanSpeed: number,
    scanMode: ScanMode,
    activationTime: number,
    dwellTime: number,
    numberOfSwitches: number,
    switchMapping: Map<string, SwitchAction>, }
}

export interface ScanningConfig { enabled: boolean,
    scanPattern: ScanPattern,
    highlightStyle: HighlightStyle,
    highlightColor: string,
    audioFeedback: boolean,
    autoStart: boolean,
    groupScanLevels: number }
}

export interface SwitchState { isPressed: boolean,
    lastPressTime: number,
    scanningActive: boolean,
    currentIndex: number,
    scanDirection: number }
}

export interface ScanningState { isScanning: boolean,
    currentElement: HTMLElement | null,
    scanTimer: number | null,
    elementGroups: HTMLElement[][],
    currentGroup: number }
}

export interface SwitchStats { switchActivations: number,
    scanningCycles: number,
    averageScanTime: number,
    successfulSelections: number }
}

export interface DetailedSwitchStats extends SwitchStats { scanningActive: boolean,
    totalElements: number,
    currentElement: number,
    successRate: number }
}

export interface SwitchInputControllerConfig { switchInput?: Partial<SwitchInputConfig>;
    scanning?: Partial<ScanningConfig>;
    }
}

export interface BubbleData { x: number,
    y: number,
    type: string }
}

export interface GameEngine { handleBubbleClick: (bubbleData: BubbleData) => void }
}

export interface HIDDevice { vendorId: number,
    productId: number,
    productName: string,
    open: () => Promise<void>,
    addEventListener: (type: string, listener: EventListener) => void }
}

export interface HIDInputReportEvent extends Event { data: DataView
    }
}

export interface FeedbackData { [key: string]: any, }
}

export interface ElementPosition { top: number,
    left: number,
    width: number,
    height: number }
}

export interface ScanHighlightElement extends HTMLElement { className: string,
    style: CSSStyleDeclaration
    }
}

// 列挙型
export type ScanMode = 'auto' | 'manual' | 'step';''
export type SwitchAction = 'primary' | 'secondary' | 'cancel';''
export type ScanPattern = 'linear' | 'group' | 'custom';''
export type HighlightStyle = 'border' | 'background' | 'shadow';'
export type FeedbackType = '';
    | 'switch_activated' | 'scanning_started' | 'scanning_stopped' '';
    | 'element_activated' | 'scan_highlight' | 'group_changed';

// 定数
export const DEFAULT_SCAN_SPEED = 2000;
export const DEFAULT_ACTIVATION_TIME = 100;
export const DEFAULT_DWELL_TIME = 1000;''
export const HIGHLIGHT_COLOR = '#00ff00';

// ハプティックフィードバックパターン
export const HAPTIC_PATTERNS: Record<FeedbackType, number[]> = { ''
    'switch_activated': [100],'';
    'scanning_started': [50, 50, 50],'';
    'scanning_stopped': [100, 50, 100],'';
    'element_activated': [200],'';
    'scan_highlight': [25],'';
    'group_changed': [50, 25, 50] }
};
';
// 型ガード
export function isHIDDevice(device: any'): device is HIDDevice { return device && ''
           typeof device.vendorId === 'number' &&'';
           typeof device.productId === 'number' &&'';
           typeof device.productName === 'string' &&'';
           typeof device.open === 'function'; }
}'
'';
export function isGameElement(element: HTMLElement'): boolean { ''
    return element.classList.contains('bubble'') || '';
           element.classList.contains('game-element'); }
}'
'';
export function isInteractiveElement(element: HTMLElement'): boolean { ''
    const interactiveTags = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];''
    return interactiveTags.includes(element.tagName') ||'';
           element.hasAttribute('tabindex'') ||'';
           element.classList.contains('bubble'') ||'';
           element.classList.contains('ui-element'); }
}'
'';
export function hasGameEngine(controller: SwitchInputController'): controller is SwitchInputController & { gameEngine: GameEngine } { return controller.gameEngine !== undefined && ''
           typeof controller.gameEngine.handleBubbleClick === 'function'; }
}

export class SwitchInputController {
    private switchConfig: SwitchInputConfig;
    private scanningConfig: ScanningConfig;
    private switchState: SwitchState;
    private scanningState: ScanningState;
    // 要素管理
    private interactiveElements: Map<string, HTMLElement>;
    private focusableElements: HTMLElement[];
    private scanningGroups: HTMLElement[][];
    private currentFocusIndex: number;
    // 視覚フィードバック
    private scanHighlight: ScanHighlightElement | null;
    private feedbackElements: Map<string, HTMLElement>;
    
    // 統計とゲームエンジン
    private stats: SwitchStats;
    public gameEngine?: GameEngine;
'';
    constructor(''';
            scanMode: 'auto',
            activationTime: DEFAULT_ACTIVATION_TIME,
            dwellTime: DEFAULT_DWELL_TIME
    );
            numberOfSwitches: 1)';
            switchMapping: new Map<string, SwitchAction>([']';
                ['space', 'primary'],'';
                ['enter', 'secondary'],'';
                ['escape', 'cancel']'';
            ]'); }
        };
        
        // スキャニング設定
        this.scanningConfig = { enabled: false,''
            scanPattern: 'linear','';
            highlightStyle: 'border',
            highlightColor: HIGHLIGHT_COLOR,
            audioFeedback: true,
            autoStart: true,
            groupScanLevels: 2 }
        },
        
        // 入力状態
        this.switchState = { isPressed: false,
            lastPressTime: 0,
            scanningActive: false,
            currentIndex: 0,
            scanDirection: 1 }
        },
        
        this.scanningState = { isScanning: false,
            currentElement: null,
            scanTimer: null,
            elementGroups: [],
            currentGroup: 0 }
        },
        
        // 要素管理
        this.interactiveElements = new Map<string, HTMLElement>();
        this.focusableElements = [];
        this.scanningGroups = [];
        this.currentFocusIndex = -1;
        
        // 視覚フィードバック
        this.scanHighlight = null;''
        this.feedbackElements = new Map<string, HTMLElement>(');
        
        // 統計
        this.stats = { switchActivations: 0,
            scanningCycles: 0,
            averageScanTime: 0,
            successfulSelections: 0 }
        },
        '';
        console.log('[SwitchInputController] Initialized');
    }
    
    /**
     * スイッチ入力を初期化
     */
    initializeSwitchInput(config: SwitchInputControllerConfig = { ): void {
        Object.assign(this.switchConfig, config.switchInput || {);
        Object.assign(this.scanningConfig, config.scanning || {);
        
        if(this.switchConfig.enabled) {
        ';'
            this.setupSwitchListeners();''
            this.initializeScanning();
        }'
        console.log('[SwitchInputController] Switch input initialized'); }
    }
    
    /**
     * スイッチリスナーを設定'
     */''
    private setupSwitchListeners()';
        document.addEventListener('keydown', (event: KeyboardEvent) => {  ' }'
            this.handleSwitchInput(event.code.toLowerCase('), 'down');' }'
        }');'
        '';
        document.addEventListener('keyup', (event: KeyboardEvent) => {  ' }'
            this.handleSwitchInput(event.code.toLowerCase('), 'up');' }'
        }');
        ';
        // 外部スイッチデバイスサポート
        if('navigator' in window && 'hid' in (navigator as any) { this.setupHIDSwitchSupport(); }
        }
    }
    
    /**
     * HIDスイッチサポートを設定
     */
    private async setupHIDSwitchSupport(): Promise<void> { try {
            const nav = navigator as any;
            // HIDデバイスの検出とセットアップ
            const devices = await nav.hid.getDevices() as HIDDevice[];
            for(const device of devices) {
                if(this.isSwitchDevice(device) {
            }
                    await this.connectSwitchDevice(device); }
                }''
            } catch (error) { ''
            console.warn('[SwitchInputController] HID setup failed:', error) }
        }
    }
    
    /**
     * スイッチデバイス判定
     */
    private isSwitchDevice(device: HIDDevice): boolean { // 一般的なスイッチデバイスのベンダーID/プロダクトIDをチェック
        const switchVendorIds = [0x16c0, 0x1209, 0x04d8]; // 例：Teensy, generic, Microchip
        return switchVendorIds.includes(device.vendorId); }
    }
    
    /**
     * スイッチデバイスに接続
     */
    private async connectSwitchDevice(device: HIDDevice): Promise<void> { try {'
            await device.open()';
            device.addEventListener('inputreport', (event: Event) => { ;
                const hidEvent = event as HIDInputReportEvent; }'
                this.handleHIDSwitchInput(hidEvent.data);' }'
            }');''
            console.log('[SwitchInputController] Connected to switch device:', device.productName);''
        } catch (error) { ''
            console.error('[SwitchInputController] Failed to connect switch device:', error) }
        }
    }
    
    /**
     * HIDスイッチ入力を処理
     */
    private handleHIDSwitchInput(data: DataView): void { // HIDレポートからスイッチ状態を解析
        const switchStates: number[] = [],
        for(let i = 0; i < data.byteLength; i++) {
            const byte = data.getUint8(i);
            for (let bit = 0; bit < 8; bit++) {
        }
                switchStates.push((byte >> bit) & 1); }
            }
        }
        
        switchStates.forEach((state, index) => { if (state && !this.switchState.isPressed) { }
                this.handleSwitchActivation(`hid_switch_${index}`);
            }
            this.switchState.isPressed = state > 0;''
        }');
    }
    
    /**
     * スイッチ入力を処理'
     */''
    private handleSwitchInput(keyCode: string, action: 'down' | 'up'): void { if (!this.switchConfig.enabled) return;
        
        const switchAction = this.switchConfig.switchMapping.get(keyCode);
        if (!switchAction) return;'
        '';
        const now = Date.now()';
        if(action === 'down') {
            this.switchState.isPressed = true;
            this.switchState.lastPressTime = now;
            
            // 長押し検出タイマー
            setTimeout(() => { 
        }
                if (this.switchState.isPressed) { }
                    this.handleSwitchHold(switchAction); }
                }''
            }, this.switchConfig.dwellTime');'
            '';
        } else if (action === 'up') { const pressDuration = now - this.switchState.lastPressTime;
            this.switchState.isPressed = false;
            
            if(pressDuration >= this.switchConfig.activationTime) {
            
                
            
            }
                this.handleSwitchActivation(switchAction); }
            }
        }
    }
    
    /**
     * スイッチ活性化を処理
     */
    private handleSwitchActivation(switchAction: string): void { this.stats.switchActivations++;'
        '';
        switch(switchAction') {'
            '';
            case 'primary':'';
                this.performPrimaryAction(''';
            case 'secondary':'';
                this.performSecondaryAction(''';
            case 'cancel':')';
                this.performCancelAction();
        }'
                console.log('[SwitchInputController] Unknown switch action:', switchAction'); }
        }'
        '';
        this.provideFeedback('switch_activated', { action: switchAction ) }
    }
    
    /**
     * スイッチ長押しを処理'
     */''
    private handleSwitchHold(switchAction: SwitchAction'): void { ''
        if(switchAction === 'primary') {'
            ';'
        }'
            this.toggleScanning() }'
        } else if (switchAction === 'secondary') { this.showContextMenu(); }
        }
    }
    
    /**
     * プライマリアクションを実行
     */
    private performPrimaryAction(): void { if (this.scanningState.isScanning) {
            this.selectCurrentElement(); }
        } else { this.startScanning(); }
        }
    }
    
    /**
     * セカンダリアクションを実行
     */
    private performSecondaryAction(): void { if (this.scanningState.isScanning) {
            this.moveToNextGroup(); }
        } else { this.showAlternativeMenu(); }
        }
    }
    
    /**
     * キャンセルアクションを実行
     */
    private performCancelAction(): void { if (this.scanningState.isScanning) {
            this.stopScanning(); }
        } else { this.returnToPreviousLevel(); }
        }
    }
    
    /**
     * スキャニングを初期化
     */
    private initializeScanning(): void { if (!this.scanningConfig.enabled) return;
        
        this.updateInteractiveElements();
        this.createScanningGroups();
        this.createScanHighlight();
        
        if(this.scanningConfig.autoStart) {
        
            
        
        }
            this.startScanning(); }
        }
    }
    
    /**
     * インタラクティブ要素を更新
     */'
    private updateInteractiveElements(): void { this.focusableElements = [];''
        this.interactiveElements.clear()';
            'button:not([disabled]')','';
            'a[href]','';
            'input:not([disabled]')','';
            'select:not([disabled]')','';
            'textarea:not([disabled]')','';
            '[tabindex]:not([tabindex="-1"]")','';
            '.bubble:not(.disabled')','';
            '.ui-element:not(.disabled')';
        ];
        
        focusableSelectors.forEach(selector => { );
            const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>; }'
            elements.forEach((element, index) => {' }'
                const id = `element_${index}_${ Date.now()'
                element.setAttribute('data-switch-id', id);
                this.interactiveElements.set(id, element);
                this.focusableElements.push(element); }
            });
        });
        
        console.log(`[SwitchInputController] Found ${this.focusableElements.length) interactive elements`});
    }
    
    /**
     * スキャニンググループを作成'
     */''
    private createScanningGroups()';
        if(this.scanningConfig.scanPattern === 'linear'') {
            // 線形スキャニング：すべて一つのグループ
            this.scanningGroups = [this.focusableElements];
        }
            ' }'
        } else if (this.scanningConfig.scanPattern === 'group') { // グループスキャニング：画面領域ごとにグループ化
            const groups = this.groupElementsByPosition() }'
        } else if (this.scanningConfig.scanPattern === 'custom') { // カスタムスキャニング：要素タイプごとにグループ化
            const groups = this.groupElementsByType();
            this.scanningGroups = groups; }
        }
        
        console.log(`[SwitchInputController] Created ${this.scanningGroups.length) scanning groups`});
    }
    
    /**
     * 位置によって要素をグループ化
     */
    private groupElementsByPosition(): HTMLElement[][] { const viewportHeight = window.innerHeight;
        
        const topGroup: HTMLElement[] = [],
        const middleGroup: HTMLElement[] = [],
        const bottomGroup: HTMLElement[] = [],
        
        this.focusableElements.forEach(element => { );
            const rect = element.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            
            if (centerY < viewportHeight / 3) { }
                topGroup.push(element); }
            } else if (centerY < viewportHeight * 2 / 3) { middleGroup.push(element); }
            } else { bottomGroup.push(element); }
            }
        });
        
        return [topGroup, middleGroup, bottomGroup].filter(group => group.length > 0);
    }
    
    /**
     * タイプによって要素をグループ化
     */
    private groupElementsByType(): HTMLElement[][] { const buttonGroup: HTMLElement[] = [],
        const inputGroup: HTMLElement[] = [],
        const gameGroup: HTMLElement[] = [],
        const navigationGroup: HTMLElement[] = [],
        '';
        this.focusableElements.forEach(element => { ');''
            if(element.tagName === 'BUTTON' || element.classList.contains('btn') {' }'
                buttonGroup.push(element');' }'
            } else if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') { ''
                inputGroup.push(element');' }'
            } else if (element.classList.contains('bubble'') || element.classList.contains('game-element') { gameGroup.push(element); }
            } else { navigationGroup.push(element); }
            }
        });
        
        return [gameGroup, buttonGroup, inputGroup, navigationGroup].filter(group => group.length > 0);
    }
    
    /**
     * スキャンハイライトを作成
     */'
    private createScanHighlight(): void { if (this.scanHighlight) {''
            this.scanHighlight.remove()';
        this.scanHighlight = document.createElement('div'') as ScanHighlightElement;''
        this.scanHighlight.className = 'scan-highlight';
        this.scanHighlight.style.cssText = `;
            position: fixed,
            pointer-events: none, }
            border: 3px solid ${this.scanningConfig.highlightColor}
            border-radius: 4px,
            background: rgba(0, 255, 0, 0.1),
            z-index: 10000,
            display: none,
            transition: all 0.2s ease,
        `;
        
        document.body.appendChild(this.scanHighlight);
    }
    
    /**
     * スキャニングを開始
     */
    private startScanning(): void { if (this.scanningState.isScanning) return;
        
        this.scanningState.isScanning = true;
        this.scanningState.currentGroup = 0;
        this.currentFocusIndex = 0;
        this.stats.scanningCycles++;
        ';'
        this.highlightCurrentElement();''
        this.scheduleScanAdvance()';
        this.provideFeedback('scanning_started'');''
        console.log('[SwitchInputController] Scanning started'); }
    }
    
    /**
     * スキャニングを停止
     */
    private stopScanning(): void { this.scanningState.isScanning = false;
        
        if(this.scanningState.scanTimer) {
        
            clearTimeout(this.scanningState.scanTimer);
        
        }
            this.scanningState.scanTimer = null; }
        }'
        '';
        this.hideScanHighlight()';
        this.provideFeedback('scanning_stopped'');''
        console.log('[SwitchInputController] Scanning stopped');
    }
    
    /**
     * スキャニングを切り替え
     */
    private toggleScanning(): void { if (this.scanningState.isScanning) {
            this.stopScanning(); }
        } else { this.startScanning(); }
        }
    }
    
    /**
     * スキャン進行をスケジュール
     */
    private scheduleScanAdvance(): void { if (!this.scanningState.isScanning) return;
        
        this.scanningState.scanTimer = setTimeout(() => { 
            this.advanceScan(); }
            this.scheduleScanAdvance(); }
        }, this.switchConfig.scanSpeed) as unknown as number;
    }
    
    /**
     * スキャンを進める
     */
    private advanceScan(): void { const currentGroup = this.scanningGroups[this.scanningState.currentGroup];
        if (!currentGroup || currentGroup.length === 0) return;
        
        this.currentFocusIndex = (this.currentFocusIndex + 1) % currentGroup.length;
        
        // グループの最後まで到達した場合
        if(this.currentFocusIndex === 0 && this.scanningGroups.length > 1) {
            
        }
            this.scanningState.currentGroup = (this.scanningState.currentGroup + 1) % this.scanningGroups.length; }
        }
        
        this.highlightCurrentElement();
    }
    
    /**
     * 現在の要素をハイライト
     */
    private highlightCurrentElement(): void { const currentGroup = this.scanningGroups[this.scanningState.currentGroup];
        if(!currentGroup || !currentGroup[this.currentFocusIndex]) {
            this.hideScanHighlight();
        }
            return; }
        }
        
        const element = currentGroup[this.currentFocusIndex];
        const rect = element.getBoundingClientRect();
        '';
        if (!this.scanHighlight') return;'
        '';
        this.scanHighlight.style.display = 'block';
        this.scanHighlight.style.left = `${rect.left - 5}px`;
        this.scanHighlight.style.top = `${rect.top - 5}px`;
        this.scanHighlight.style.width = `${rect.width + 10}px`;
        this.scanHighlight.style.height = `${rect.height + 10}px`;
        ';
        // オーディオフィードバック
        if(this.scanningConfig.audioFeedback') {'
            ';'
        }'
            this.playAudioFeedback('scan_highlight'); }
        }
    }
    
    /**
     * スキャンハイライトを隠す
     */'
    private hideScanHighlight(): void { ''
        if(this.scanHighlight') {'
            ';'
        }'
            this.scanHighlight.style.display = 'none'; }
        }
    }
    
    /**
     * 現在の要素を選択
     */
    private selectCurrentElement(): void { const currentGroup = this.scanningGroups[this.scanningState.currentGroup];
        if (!currentGroup || !currentGroup[this.currentFocusIndex]) return;
        
        const element = currentGroup[this.currentFocusIndex];
        this.activateElement(element);
        this.stats.successfulSelections++;
        this.stopScanning(); }
    }
    
    /**
     * 要素を活性化'
     */''
    private activateElement(element: HTMLElement'): void { // 要素タイプに応じた活性化処理
        if (element.tagName === 'BUTTON' || (element as HTMLInputElement').type === 'button') {''
            element.click() }'
        } else if (element.tagName === 'A') { ''
            element.click() }'
        } else if (element.tagName === 'INPUT') { ''
            element.focus() }'
        } else if(element.classList.contains('bubble') { // ゲーム内泡要素のクリック
            this.activateGameElement(element); }
        } else {  // 汎用的な活性化
            element.focus();''
            if (typeof (element as any').click === 'function') {' }'
                element.click() }'
        this.provideFeedback('element_activated', { element: element.tagName });
    }
    
    /**
     * ゲーム要素を活性化
     */
    private activateGameElement(element: HTMLElement): void { // ゲーム固有の活性化ロジック
        const bubbleData: BubbleData = {
            x: parseFloat(element.style.left) || 0,'';
            y: parseFloat(element.style.top') || 0,'';
            type: element.dataset.bubbleType || 'normal' }
        },
        
        // ゲームエンジンに泡クリックイベントを送信
        if(hasGameEngine(this) { this.gameEngine.handleBubbleClick(bubbleData); }
        }
    }
    
    /**
     * 次のグループに移動
     */
    private moveToNextGroup(): void { if (this.scanningGroups.length <= 1) return;
        
        this.scanningState.currentGroup = (this.scanningState.currentGroup + 1) % this.scanningGroups.length;
        this.currentFocusIndex = 0;''
        this.highlightCurrentElement()';
        this.provideFeedback('group_changed'); }
    }
    
    /**
     * コンテキストメニューを表示'
     */''
    private showContextMenu()';
        console.log('[SwitchInputController] Show context menu');
    }
    
    /**
     * 代替メニューを表示'
     */''
    private showAlternativeMenu()';
        console.log('[SwitchInputController] Show alternative menu');
    }
    
    /**
     * 前のレベルに戻る'
     */''
    private returnToPreviousLevel()';
        console.log('[SwitchInputController] Return to previous level');
    }
    
    /**
     * フィードバックを提供
     */
    private provideFeedback(type: FeedbackType, data: FeedbackData = { ): void {
        // 視覚フィードバック
        this.provideVisualFeedback(type, data);
        
        // オーディオフィードバック
        if(this.scanningConfig.audioFeedback) {
            ';'
        }'
            this.playAudioFeedback(type'); }
        }
        ';
        // ハプティックフィードバック（対応デバイス）
        if ('navigator' in window && 'vibrate' in navigator) { this.provideHapticFeedback(type); }
        }
    }
    
    /**
     * 視覚フィードバックを提供
     */
    private provideVisualFeedback(type: FeedbackType, data: FeedbackData): void { // 実装は省略（視覚エフェクト） }
        console.log(`[SwitchInputController] Visual feedback: ${type)`, data});
    }
    
    /**
     * オーディオフィードバックを再生
     */
    private playAudioFeedback(type: FeedbackType): void { // 実装は省略（オーディオ再生） }
        console.log(`[SwitchInputController] Audio feedback: ${type)`});
    }
    
    /**
     * ハプティックフィードバックを提供
     */''
    private provideHapticFeedback(type: FeedbackType'): void { const patterns = HAPTIC_PATTERNS[type];''
        if(patterns && 'vibrate' in navigator) {
            
        }
            navigator.vibrate(patterns); }
        }
    }
    
    /**
     * 統計情報を取得
     */
    getStats(): DetailedSwitchStats { return { ...this.stats,
            scanningActive: this.scanningState.isScanning,
            totalElements: this.focusableElements.length,
            currentElement: this.currentFocusIndex,
            successRate: this.stats.switchActivations > 0 ?   : undefined };
                (this.stats.successfulSelections / this.stats.switchActivations) * 100 : 0 }
        },
    }
    
    /**
     * 設定を更新
     */
    updateConfig(newConfig: SwitchInputControllerConfig): void { if (newConfig.switchInput) {
            Object.assign(this.switchConfig, newConfig.switchInput); }
        }
        if(newConfig.scanning) {'
            ';'
        }'
            Object.assign(this.scanningConfig, newConfig.scanning'); }
        }'
        '';
        console.log('[SwitchInputController] Configuration updated');
    }
    
    /**
     * スイッチ設定の取得
     */
    getSwitchConfig(): SwitchInputConfig {
        return { ...this.switchConfig };
    }
    
    /**
     * スキャニング設定の取得
     */
    getScanningConfig(): ScanningConfig {
        return { ...this.scanningConfig };
    }
    
    /**
     * 現在のスキャニング状態を取得
     */
    getScanningState(): Readonly<ScanningState> {
        return { ...this.scanningState };
    }
    
    /**
     * インタラクティブ要素の数を取得
     */
    getInteractiveElementsCount(): number { return this.focusableElements.length; }
    }
    
    /**
     * 現在フォーカスされている要素を取得
     */
    getCurrentElement(): HTMLElement | null { const currentGroup = this.scanningGroups[this.scanningState.currentGroup];
        return currentGroup? .[this.currentFocusIndex] || null; }
    }
    
    /**
     * スキャニンググループ情報を取得
     */ : undefined
    getScanningGroupsInfo(): { groupCount: number; elementsInGroups: number[] } { return { groupCount: this.scanningGroups.length, };
            elementsInGroups: this.scanningGroups.map(group => group.length); }
        };
    }
    
    /**
     * リソースをクリーンアップ
     */
    cleanup(): void { this.stopScanning();
        
        if(this.scanHighlight) {
        
            this.scanHighlight.remove();
        
        }
            this.scanHighlight = null; }
        }
        
        this.interactiveElements.clear();
        this.focusableElements = [];'
        this.scanningGroups = [];''
        this.feedbackElements.clear()';
        console.log('[SwitchInputController] Cleaned up'');'
    }''
}