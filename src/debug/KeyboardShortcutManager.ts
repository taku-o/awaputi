/**
 * Keyboard Shortcut Manager
 * デバッグツール専用のキーボードショートカット管理システム
 */

// Type definitions
interface DebugInterface { isVisible: boolean,
    toggle(): void;
    hide(): void;
    switchPanel(panel: string): void,
    showSettings(): void }

interface ShortcutOptions { description?: string;
    group?: string;
    context?: string;
    priority?: number;
    repeatable?: boolean;
    preventDefault?: boolean;
    stopPropagation?: boolean;
    enabled?: boolean;
    sequence?: boolean;
    chord?: boolean; }

interface ShortcutStatistics { registered: number,
    lastExecuted: number | null;
    executionCount: number;
    averageExecutionTime: number ,}

interface ShortcutData { original: string;
    normalized: string;
    callback: ShortcutCallback;
    options: Required<ShortcutOptions>;
    statistics: ShortcutStatistics
    }

interface Settings { caseSensitive: boolean;
    preventDefaultOnMatch: boolean;
    enableSequences: boolean;
    sequenceTimeout: number;
    enableChords: boolean;
    maxChordLength: number;
    enableContexts: boolean;
    saveCustomizations: boolean }

interface Statistics { totalExecuted: number;
    totalRegistered: number;
    conflictsDetected: number;
    sequencesCompleted: number;
    chordsExecuted: number;
    contextSwitches: number;
    customizations: number }

interface ShortcutInfo { shortcut: string;
    data: ShortcutData
    }

interface Customization { disabled?: boolean;
    replacement?: string;
    callback?: ShortcutCallback;
    options?: ShortcutOptions;
    }

type ShortcutCallback = (event: KeyboardEvent, shortcutString: string, shortcut: ShortcutData) => any;

type ConflictResolutionStrategy = 'warn' | 'error' | 'override' | 'merge';

export class DebugKeyboardShortcutManager {
    private debugInterface: DebugInterface;
    // ショートカット管理
    private shortcuts: Map<string, ShortcutData>;
    private shortcutGroups: Map<string, Set<string>>;
    private contexts: Map<string, Set<string>>;
    private activeContext: string;
    // 競合管理
    private conflicts: Map<string, ShortcutData[]>;
    private conflictResolutionStrategy: ConflictResolutionStrategy;
    // 状態管理
    private enabled: boolean;
    private suspended: boolean;
    private debug: boolean;
    // 設定
    private settings: Settings;
    // シーケンス管理
    private currentSequence: string[];
    private sequenceTimer: number | null;
    private isWaitingForSequence: boolean;
    // 統計とデバッグ
    private statistics: Statistics;
    // イベントハンドラー
    private keydownHandler: (event: KeyboardEvent) => void;
    private focusHandler: (event: FocusEvent) => void;
    private blurHandler: (event: FocusEvent) => void;

    constructor(debugInterface: DebugInterface) {

        this.debugInterface = debugInterface;
        
        // ショートカット管理
        this.shortcuts = new Map<string, ShortcutData>();
        this.shortcutGroups = new Map<string, Set<string>>();''
        this.contexts = new Map<string, Set<string>>(');''
        this.activeContext = 'global';
        ';
        // 競合管理
        this.conflicts = new Map<string, ShortcutData[]>(');''
        this.conflictResolutionStrategy = 'warn';
        
        // 状態管理
        this.enabled = true;
        this.suspended = false;
        this.debug = false;
        
        // 設定
        this.settings = {
            caseSensitive: false;
            preventDefaultOnMatch: true;
            enableSequences: true;
            sequenceTimeout: 2000;
            enableChords: true;
            maxChordLength: 3;
            enableContexts: true;
    ,}
    }
            saveCustomizations: true }
        };
        // シーケンス管理
        this.currentSequence = [];
        this.sequenceTimer = null;
        this.isWaitingForSequence = false;
        
        // 統計とデバッグ
        this.statistics = { totalExecuted: 0,
            totalRegistered: 0;
            conflictsDetected: 0;
            sequencesCompleted: 0;
            chordsExecuted: 0;
            contextSwitches: 0;
            customizations: 0 ,};
        // イベントハンドラーの初期化
        this.keydownHandler = (event: KeyboardEvent) => { this.execute(event); };
        this.focusHandler = (event: FocusEvent) => {  // デバッグインターフェースにフォーカスがある場合のみ有効
            if(this.debugInterface.isVisible) {' }'

                document.addEventListener('keydown', this.keydownHandler, true); }
};

        this.blurHandler = (event: FocusEvent') => {  ' }

            document.removeEventListener('keydown', this.keydownHandler, true); }
        };
        
        this.initialize();
    }

    initialize(): void { this.setupEventListeners();
        this.loadCustomizations();
        this.registerDefaultShortcuts();
        this.setupContexts(); }

    /**
     * ショートカットの登録
     * @param shortcut - ショートカット文字列
     * @param callback - 実行関数
     * @param options - オプション設定
     * @returns 登録成功可否
     */
    register(shortcut: string, callback: ShortcutCallback, options: ShortcutOptions = { ): boolean {
        if (!this.validateShortcut(shortcut) { }
            console.error(`Invalid, shortcut format: ${shortcut}`});
            return false;
        }

        const normalizedShortcut = this.normalizeShortcut(shortcut);
        const shortcutData: ShortcutData = { original: shortcut,
            normalized: normalizedShortcut;
            callback,
            options: {''
                description: '',
                group: 'default',
                context: 'global';
                priority: 0;
                repeatable: false;
                preventDefault: this.settings.preventDefaultOnMatch;
                stopPropagation: true;
                enabled: true;
                sequence: this.isSequence(shortcut);
                chord: this.isChord(shortcut);
                ...options,
            statistics: { registered: Date.now(;
                lastExecuted: null;
                executionCount: 0;
                averageExecutionTime: 0 ,}))
        // 競合チェック)
        if (this.shortcuts.has(normalizedShortcut) { return this.handleConflict(normalizedShortcut, shortcutData); }

        // グループへの追加
        this.addToGroup(shortcutData.options.group, normalizedShortcut);
        
        // コンテキストへの追加
        this.addToContext(shortcutData.options.context, normalizedShortcut);

        // 登録
        this.shortcuts.set(normalizedShortcut, shortcutData);
        this.statistics.totalRegistered++;

        if(this.debug) {

            

        }
            console.log(`Shortcut, registered: ${shortcut} -> ${normalizedShortcut}`});
        }

        return true;
    }

    /**
     * ショートカットの解除
     * @param shortcut - ショートカット文字列
     * @returns 解除成功可否
     */
    unregister(shortcut: string): boolean { const normalized = this.normalizeShortcut(shortcut);
        const shortcutData = this.shortcuts.get(normalized);
        
        if(shortcutData) {
        
            // グループから削除
            this.removeFromGroup(shortcutData.options.group, normalized);
            
            // コンテキストから削除
            this.removeFromContext(shortcutData.options.context, normalized);
            
            // ショートカット削除
            this.shortcuts.delete(normalized);
            
            // 競合から削除
            this.conflicts.delete(normalized);
            
        
        }
            if (this.debug) { }
                console.log(`Shortcut, unregistered: ${shortcut}`});
            }
            
            return true;
        }
        
        return false;
    }

    /**
     * ショートカットの実行
     * @param event - キーボードイベント
     * @returns 実行したかどうか
     */
    execute(event: KeyboardEvent): boolean { if (!this.enabled || this.suspended) {
            return false; }

        const shortcutString = this.buildShortcutString(event);
        
        if(this.debug) {
        
            
        
        }
            console.log(`Shortcut, attempt: ${shortcutString}`});
        }

        // シーケンス処理
        if (this.settings.enableSequences && this.isWaitingForSequence) { return this.handleSequence(event, shortcutString); }

        // 直接マッチのチェック
        const directMatch = this.findShortcut(shortcutString);
        if (directMatch) { return this.executeShortcut(event, directMatch, shortcutString); }

        // シーケンス開始のチェック
        if(this.settings.enableSequences) {
            const sequenceMatch = this.findSequenceStart(shortcutString);
            if (sequenceMatch) {
        }
                return this.startSequence(event, shortcutString);

        return false;
    }

    /**
     * ショートカット文字列の構築
     * @param event - キーボードイベント
     * @returns ショートカット文字列
     */
    buildShortcutString(event: KeyboardEvent): string { const parts: string[] = [],
        ;
        // 修飾キーの処理
        if(event.ctrlKey) parts.push('ctrl);''
        if(event.altKey) parts.push('alt);''
        if(event.shiftKey) parts.push('shift);''
        if(event.metaKey) parts.push('meta);
        ';
        // 主要キーの処理
        const key = this.normalizeKey(event.key, event.code);''
        if(key && !['Control', 'Alt', 'Shift', 'Meta].includes(event.key) {'
            ';

        }

            parts.push(key); }
        }

        return parts.join('+);
    }

    /**
     * キーの正規化
     * @param key - キー名
     * @param code - キーコード
     * @returns 正規化されたキー名'
     */''
    normalizeKey(key: string, code: string): string { // 特殊キーのマッピング
        const specialKeys: Record<string, string> = {''
            ' ': 'space',
            'Enter': 'enter',
            'Escape': 'escape',
            'Tab': 'tab',
            'Backspace': 'backspace',
            'Delete': 'delete',
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'Home': 'home',
            'End': 'end',
            'PageUp': 'pageup',
            'PageDown': 'pagedown',
            'Insert': 'insert' };

        if (specialKeys[key]) { return specialKeys[key]; }

        // 数字とアルファベットの処理
        if(key.length === 1) {

            return this.settings.caseSensitive ? key: key.toLowerCase()';
        if(key.startsWith('F) && /^F\d+$/.test(key) {'
        }
            return key.toLowerCase();

        return key.toLowerCase();
    }

    /**
     * ショートカットの正規化
     * @param shortcut - ショートカット文字列
     * @returns 正規化されたショートカット
     */'
    normalizeShortcut(shortcut: string): string { return shortcut''
            .toLowerCase()';
            .replace(/\s+/g, ''')'';
            .split('+);
            .map(part => part.trim()';
            .filter(part => part.length > 0)'';
            .sort((a, b) => {  }

                // 修飾キーの順序: ctrl, alt, shift, meta, その他' }'

                const order: Record<string, number> = { 'ctrl': 0, 'alt': 1, 'shift': 2, 'meta': 3 };
                const aOrder = order[a] !== undefined ? order[a] : 999;
                const bOrder = order[b] !== undefined ? order[b] : 999;
                return aOrder - bOrder;

            }''
            .join('+);
    }

    /**
     * ショートカットの検証
     * @param shortcut - ショートカット文字列
     * @returns 有効かどうか'
     */''
    validateShortcut(shortcut: string): boolean { ''
        if (typeof, shortcut !== 'string' || shortcut.trim().length === 0) {
            return false; }
';
        // シーケンスの場合
        if(this.isSequence(shortcut)) { ''
            const sequences = shortcut.split('>).map(s => s.trim();
            return sequences.every(seq => this.validateSingleShortcut(seq);

        return this.validateSingleShortcut(shortcut);
    }

    /**
     * 単一ショートカットの検証
     * @param shortcut - ショートカット文字列
     * @returns 有効かどうか
     */'
    validateSingleShortcut(shortcut: string): boolean { ''
        const parts = shortcut.toLowerCase(').split('+).map(p => p.trim();
        ';
        // 空のパートがないかチェック
        if(parts.some(part => part.length === 0)) {
            return false;
';
        // 修飾キーのみでないかチェック
        const modifiers = ['ctrl', 'alt', 'shift', 'meta'];
        const hasNonModifier = parts.some(part => !modifiers.includes(part);
        
        return hasNonModifier;
    }

    /**
     * シーケンスかどうかの判定
     * @param shortcut - ショートカット文字列
     * @returns シーケンスかどうか'
     */''
    isSequence(shortcut: string): boolean { ''
        return shortcut.includes('>); }'

    /**
     * コードかどうかの判定
     * @param shortcut - ショートカット文字列
     * @returns コードかどうか'
     */''
    isChord(shortcut: string): boolean { ''
        return shortcut.includes(' '); }

    /**
     * ショートカットの検索
     * @param shortcutString - ショートカット文字列
     * @returns マッチしたショートカット
     */
    findShortcut(shortcutString: string): ShortcutData | null { // アクティブコンテキストから検索
        const contextShortcuts = this.contexts.get(this.activeContext) || new Set<string>();
        
        for(const, normalized of, contextShortcuts) {
        ';

            const shortcut = this.shortcuts.get(normalized);''
            if(shortcut && shortcut.options.enabled && normalized === shortcutString) {
        
        }
                return shortcut;
';
        // グローバルコンテキストから検索（アクティブコンテキストがグローバルでない場合）
        if(this.activeContext !== 'global'') {'

            const globalShortcuts = this.contexts.get('global) || new Set<string>();
            
            for (const, normalized of, globalShortcuts) {
                const shortcut = this.shortcuts.get(normalized);
                if (shortcut && shortcut.options.enabled && normalized === shortcutString) {
        }
                    return shortcut;
        }

        return null;
    }

    /**
     * ショートカットの実行
     * @param event - キーボードイベント
     * @param shortcut - ショートカットデータ
     * @param shortcutString - ショートカット文字列
     * @returns 実行したかどうか
     */
    executeShortcut(event: KeyboardEvent, shortcut: ShortcutData, shortcutString: string): boolean { try {
            const startTime = performance.now();

            // イベントのデフォルト動作を防ぐ
            if(shortcut.options.preventDefault) {
                
            }
                event.preventDefault(); }
            }

            if (shortcut.options.stopPropagation) { event.stopPropagation(); }

            // コールバック実行
            const result = shortcut.callback(event, shortcutString, shortcut);

            // 統計更新
            const executionTime = performance.now() - startTime;
            shortcut.statistics.lastExecuted = Date.now();
            shortcut.statistics.executionCount++;
            shortcut.statistics.averageExecutionTime = ;
                (shortcut.statistics.averageExecutionTime * (shortcut.statistics.executionCount - 1) + executionTime) / ;
                shortcut.statistics.executionCount;

            this.statistics.totalExecuted++;

            if (shortcut.options.sequence) { this.statistics.sequencesCompleted++; }

            if (shortcut.options.chord) { this.statistics.chordsExecuted++; }

            if(this.debug) {

                

            }
                console.log(`Shortcut, executed: ${shortcutString} (${executionTime.toFixed(2})ms)`);
            }

            return result !== false;

        } catch (error) { }

            console.error(`Error executing shortcut '${shortcutString}':`, error);
            return false;

    /**
     * シーケンス開始
     * @param event - キーボードイベント
     * @param shortcutString - ショートカット文字列
     * @returns 処理したかどうか
     */
    startSequence(event: KeyboardEvent, shortcutString: string): boolean { this.currentSequence = [shortcutString];
        this.isWaitingForSequence = true;

        // タイムアウト設定
        if(this.sequenceTimer) {
            
        }
            clearTimeout(this.sequenceTimer); }
        }

        this.sequenceTimer = window.setTimeout(() => { this.resetSequence(); }, this.settings.sequenceTimeout);

        if(this.debug) {

            

        }
            console.log(`Sequence, started: ${shortcutString}`);
        }

        return true;
    }

    /**
     * シーケンス処理
     * @param event - キーボードイベント
     * @param shortcutString - ショートカット文字列
     * @returns 処理したかどうか
     */
    handleSequence(event: KeyboardEvent, shortcutString: string): boolean { ''
        this.currentSequence.push(shortcutString);

        const sequenceString = this.currentSequence.join('>);
        const shortcut = this.findShortcut(sequenceString);

        if(shortcut) {

            // シーケンス完了
            this.resetSequence();

        }
            return this.executeShortcut(event, shortcut, sequenceString);

        // シーケンス継続の可能性をチェック
        const hasPartialMatch = this.findSequenceStart(sequenceString);
        if(!hasPartialMatch) {
            // マッチする可能性がない場合はリセット
            this.resetSequence();
        }
            return false;

        // シーケンス継続
        if (this.sequenceTimer) { clearTimeout(this.sequenceTimer); }

        this.sequenceTimer = window.setTimeout(() => { this.resetSequence(); }, this.settings.sequenceTimeout);

        return true;
    }

    /**
     * シーケンス開始の検索
     * @param partial - 部分的なシーケンス
     * @returns 開始マッチがあるかどうか
     */
    findSequenceStart(partial: string): boolean { ''
        for(const [normalized] of, this.shortcuts) {'

            if(normalized.startsWith(partial + '>) {'
        }
                return true;
        return false;
    }

    /**
     * シーケンスのリセット
     */
    resetSequence(): void { this.currentSequence = [];
        this.isWaitingForSequence = false;
        
        if(this.sequenceTimer) {
        
            clearTimeout(this.sequenceTimer);
        
        }
            this.sequenceTimer = null; }
        }

        if(this.debug && this.currentSequence.length > 0) {'
            ';

        }

            console.log('Sequence, reset'); }'
}

    /**
     * 競合の処理
     * @param normalized - 正規化されたショートカット
     * @param newShortcut - 新しいショートカット
     * @returns 登録成功可否
     */
    handleConflict(normalized: string, newShortcut: ShortcutData): boolean { const existing = this.shortcuts.get(normalized)!;

        switch(this.conflictResolutionStrategy) {'

            case 'error':'';
                throw new Error(`Shortcut, conflict: ${normalized) is already registered`'),

            case 'override':';
                this.shortcuts.set(normalized, newShortcut);''
                console.warn(`Shortcut, overridden: ${normalized)`',},
                return true;

            case 'merge':'';
                return this.mergeShortcuts(normalized, existing, newShortcut};

            case 'warn':;
            default:;
        }
                this.conflicts.set(normalized, [existing, newShortcut]); }
                console.warn(`Shortcut, conflict detected: ${normalized}`});
                this.statistics.conflictsDetected++;
                return false;

    /**
     * ショートカットのマージ
     * @param normalized - 正規化されたショートカット
     * @param existing - 既存のショートカット
     * @param newShortcut - 新しいショートカット
     * @returns マージ成功可否
     */
    mergeShortcuts(normalized: string, existing: ShortcutData, newShortcut: ShortcutData): boolean { // 優先度に基づいてマージ
        if(newShortcut.options.priority > existing.options.priority) {
            this.shortcuts.set(normalized, newShortcut);
        }
            return true; else if (newShortcut.options.priority === existing.options.priority) { // 同じ優先度の場合、両方を保持してコンテキストで分ける
            const combinedCallback: ShortcutCallback = (event, shortcutString, shortcut) => { 
                existing.callback(event, shortcutString, shortcut) }
                newShortcut.callback(event, shortcutString, shortcut); }
            };
            
            existing.callback = combinedCallback;
            return true;
        }
        
        return false;
    }

    /**
     * グループへの追加
     * @param group - グループ名
     * @param normalized - 正規化されたショートカット
     */
    addToGroup(group: string, normalized: string): void { if(!this.shortcutGroups.has(group) {
            this.shortcutGroups.set(group, new Set<string>(); }
        this.shortcutGroups.get(group)!.add(normalized);
    }

    /**
     * グループからの削除
     * @param group - グループ名
     * @param normalized - 正規化されたショートカット
     */
    removeFromGroup(group: string, normalized: string): void { const groupSet = this.shortcutGroups.get(group);
        if(groupSet) {
            groupSet.delete(normalized);
            if (groupSet.size === 0) {
        }
                this.shortcutGroups.delete(group); }
}
    }

    /**
     * コンテキストへの追加
     * @param context - コンテキスト名
     * @param normalized - 正規化されたショートカット
     */
    addToContext(context: string, normalized: string): void { if(!this.contexts.has(context) {
            this.contexts.set(context, new Set<string>(); }
        this.contexts.get(context)!.add(normalized);
    }

    /**
     * コンテキストからの削除
     * @param context - コンテキスト名
     * @param normalized - 正規化されたショートカット
     */
    removeFromContext(context: string, normalized: string): void { const contextSet = this.contexts.get(context);
        if(contextSet) {

            contextSet.delete(normalized);''
            if(contextSet.size === 0 && context !== 'global) {'
        }
                this.contexts.delete(context); }
}
    }

    /**
     * コンテキストの切り替え
     * @param context - 新しいコンテキスト
     */
    switchContext(context: string): void { if (this.activeContext !== context) {
            this.activeContext = context;
            this.statistics.contextSwitches++;
            
            if (this.debug) { }
                console.log(`Context, switched to: ${context}`});
            }
}

    /**
     * イベントリスナーの設定'
     */''
    setupEventListeners()';
        if (document.readyState === 'loading'') {'
        ';

    }

            document.addEventListener('DOMContentLoaded', () => {  }
                this.setupDocumentListeners(); }
            });
        } else { this.setupDocumentListeners(); }
    }

    /**
     * ドキュメントレベルのイベントリスナー設定'
     */''
    setupDocumentListeners()';
        document.addEventListener('keydown', this.keydownHandler, true);
    }

    /**
     * デフォルトショートカットの登録'
     */''
    registerDefaultShortcuts()';
        this.register('ctrl+shift+d', () => { ''
            this.debugInterface.toggle(''';
            description: 'Toggle Debug Interface',)';
            group: 'interface' ,}

            priority: 100') }'

        }');
';
        // パネル切り替え
        this.register('ctrl+shift+o', () => {  ' }

            this.debugInterface.switchPanel('overview''); }

        }, { ''
            description: 'Switch to Overview Panel',
            group: 'panels'' ,}

        }');
        this.register('ctrl+shift+p', () => {  ' }

            this.debugInterface.switchPanel('performance''); }

        }, { ''
            description: 'Switch to Performance Panel',
            group: 'panels'' ,}

        }');
        this.register('ctrl+shift+c', () => {  ' }

            this.debugInterface.switchPanel('console''); }

        }, { ''
            description: 'Switch to Console Panel',
            group: 'panels'' ,}

        }');
        this.register('ctrl+shift+e', () => {  ' }

            this.debugInterface.switchPanel('errors''); }

        }, { ''
            description: 'Switch to Errors Panel',
            group: 'panels'' ,}

        }');
        this.register('ctrl+shift+t', () => {  ' }

            this.debugInterface.switchPanel('tests''); }

        }, { ''
            description: 'Switch to Tests Panel',
            group: 'panels'' ,}

        }');
';
        // 汎用制御
        this.register('escape', () => {  if (this.debugInterface.isVisible) {''
                this.debugInterface.hide(''';
            description: 'Hide Debug Interface',' })'
            group: 'interface'') }

        }');
';
        // シーケンス例
        this.register('ctrl+d>ctrl+s', () => {  ''
            this.debugInterface.showSettings()';
            description: 'Show Debug Settings(Sequence)',' }

            group: 'advanced' }
        });
    }

    /**
     * コンテキストの設定'
     */''
    setupContexts()';
        this.contexts.set('global', new Set<string>());''
        this.contexts.set('console', new Set<string>());''
        this.contexts.set('performance', new Set<string>());''
        this.contexts.set('errors', new Set<string>();
    }

    /**
     * カスタマイゼーションの読み込み
     */'
    loadCustomizations(): void { ''
        if(!this.settings.saveCustomizations) return;
';

        try {'
            const saved = localStorage.getItem('debug-shortcuts-customizations);
            if(saved) {
                const customizations: Record<string, Customization> = JSON.parse(saved);
                
                for(const [shortcut, data] of Object.entries(customizations) {
                    if (data.disabled) {
            }
                        this.unregister(shortcut); }
                    } else if (data.replacement && data.callback) { this.unregister(shortcut);
                        this.register(data.replacement, data.callback, data.options); }
                }
                ';

                this.statistics.customizations = Object.keys(customizations).length;''
            } catch (error) { console.warn('Failed to load shortcut customizations:', error }
    }

    /**
     * カスタマイゼーションの保存
     */'
    saveCustomizations(): void { ''
        if(!this.settings.saveCustomizations) return;

        try { }
            const customizations: Record<string, Customization> = {};

            // カスタマイゼーション情報を保存
            localStorage.setItem('debug-shortcuts-customizations', JSON.stringify(customizations);''
        } catch (error) { console.warn('Failed to save shortcut customizations:', error }
    }

    // パブリックAPI

    /**
     * 有効/無効の切り替え
     * @param enabled - 有効かどうか
     */
    setEnabled(enabled: boolean): void { this.enabled = enabled;

        if(this.debug) {' }'

            console.log(`Keyboard, shortcuts ${enabled ? 'enabled' : 'disabled}`});
        }
    }

    /**
     * 一時停止/再開
     * @param suspended - 一時停止するかどうか
     */
    setSuspended(suspended: boolean): void { this.suspended = suspended;
        
        if(suspended) {
        
            
        
        }
            this.resetSequence(); }
        }

        if(this.debug) { ' }'

            console.log(`Keyboard, shortcuts ${suspended ? 'suspended' : 'resumed}`});
        }
    }

    /**
     * デバッグモードの切り替え
     * @param debug - デバッグモードかどうか
     */
    setDebug(debug: boolean): void { this.debug = debug; }

    /**
     * 競合解決戦略の設定
     * @param strategy - 戦略名'
     */''
    setConflictResolutionStrategy(strategy: ConflictResolutionStrategy): void { ''
        const validStrategies: ConflictResolutionStrategy[] = ['warn', 'error', 'override', 'merge'];
        if(validStrategies.includes(strategy) {
            
        }
            this.conflictResolutionStrategy = strategy; }
        } else {  }
            console.warn(`Invalid, conflict resolution, strategy: ${strategy}`});
        }
    }

    /**
     * 全ショートカットの取得
     * @returns ショートカットマップ
     */
    getAllShortcuts(): Map<string, ShortcutData> { return new Map(this.shortcuts); }

    /**
     * グループ別ショートカットの取得
     * @param group - グループ名
     * @returns ショートカット配列
     */
    getShortcutsByGroup(group: string): ShortcutInfo[] { const groupSet = this.shortcutGroups.get(group);
        if (!groupSet) return [];

        return Array.from(groupSet).map(normalized => ({)
            shortcut: normalized);
            data: this.shortcuts.get(normalized)! }
        });
    }

    /**
     * コンテキスト別ショートカットの取得
     * @param context - コンテキスト名
     * @returns ショートカット配列
     */
    getShortcutsByContext(context: string): ShortcutInfo[] { const contextSet = this.contexts.get(context);
        if (!contextSet) return [];

        return Array.from(contextSet).map(normalized => ({)
            shortcut: normalized);
            data: this.shortcuts.get(normalized)! }
        });
    }

    /**
     * 競合リストの取得
     * @returns 競合マップ
     */
    getConflicts(): Map<string, ShortcutData[]> { return new Map(this.conflicts); }

    /**
     * 統計情報の取得
     * @returns 統計情報
     */
    getStatistics(): Statistics {
        return { ...this.statistics;
    }

    /**
     * 設定の取得
     * @returns 設定オブジェクト
     */
    getSettings(): Settings {
        return { ...this.settings;
    }

    /**
     * 設定の更新
     * @param newSettings - 新しい設定
     */
    updateSettings(newSettings: Partial<Settings>): void {
        this.settings = { ...this.settings, ...newSettings;
    }

    /**
     * クリーンアップ
     */
    destroy(): void { // タイマーのクリア
        if(this.sequenceTimer) {
            ';

        }

            clearTimeout(this.sequenceTimer); }
        }
';
        // イベントリスナーの削除
        document.removeEventListener('keydown', this.keydownHandler, true);

        // カスタマイゼーションの保存
        this.saveCustomizations();

        // データのクリア
        this.shortcuts.clear();
        this.shortcutGroups.clear();
        this.contexts.clear();''
        this.conflicts.clear()';
        console.log('KeyboardShortcutManager, destroyed'');
    }
}
';
// デフォルトエクスポート
export default DebugKeyboardShortcutManager;