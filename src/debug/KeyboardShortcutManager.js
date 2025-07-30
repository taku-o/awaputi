/**
 * Keyboard Shortcut Manager
 * デバッグツール専用のキーボードショートカット管理システム
 */

export class KeyboardShortcutManager {
    constructor(debugInterface) {
        this.debugInterface = debugInterface;
        
        // ショートカット管理
        this.shortcuts = new Map();
        this.shortcutGroups = new Map();
        this.contexts = new Map();
        this.activeContext = 'global';
        
        // 競合管理
        this.conflicts = new Map();
        this.conflictResolutionStrategy = 'warn'; // 'warn', 'error', 'override', 'merge'
        
        // 状態管理
        this.enabled = true;
        this.suspended = false;
        this.debug = false;
        
        // 設定
        this.settings = {
            caseSensitive: false,
            preventDefaultOnMatch: true,
            enableSequences: true,
            sequenceTimeout: 2000,
            enableChords: true,
            maxChordLength: 3,
            enableContexts: true,
            saveCustomizations: true
        };
        
        // シーケンス管理
        this.currentSequence = [];
        this.sequenceTimer = null;
        this.isWaitingForSequence = false;
        
        // 統計とデバッグ
        this.statistics = {
            totalExecuted: 0,
            totalRegistered: 0,
            conflictsDetected: 0,
            sequencesCompleted: 0,
            chordsExecuted: 0,
            contextSwitches: 0,
            customizations: 0
        };
        
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.loadCustomizations();
        this.registerDefaultShortcuts();
        this.setupContexts();
    }

    /**
     * ショートカットの登録
     * @param {string} shortcut - ショートカット文字列
     * @param {Function} callback - 実行関数
     * @param {Object} options - オプション設定
     * @returns {boolean} 登録成功可否
     */
    register(shortcut, callback, options = {}) {
        if (!this.validateShortcut(shortcut)) {
            console.error(`Invalid shortcut format: ${shortcut}`);
            return false;
        }

        const normalizedShortcut = this.normalizeShortcut(shortcut);
        const shortcutData = {
            original: shortcut,
            normalized: normalizedShortcut,
            callback,
            options: {
                description: '',
                group: 'default',
                context: 'global',
                priority: 0,
                repeatable: false,
                preventDefault: this.settings.preventDefaultOnMatch,
                stopPropagation: true,
                enabled: true,
                sequence: this.isSequence(shortcut),
                chord: this.isChord(shortcut),
                ...options
            },
            statistics: {
                registered: Date.now(),
                lastExecuted: null,
                executionCount: 0,
                averageExecutionTime: 0
            }
        };

        // 競合チェック
        if (this.shortcuts.has(normalizedShortcut)) {
            return this.handleConflict(normalizedShortcut, shortcutData);
        }

        // グループへの追加
        this.addToGroup(shortcutData.options.group, normalizedShortcut);
        
        // コンテキストへの追加
        this.addToContext(shortcutData.options.context, normalizedShortcut);

        // 登録
        this.shortcuts.set(normalizedShortcut, shortcutData);
        this.statistics.totalRegistered++;

        if (this.debug) {
            console.log(`Shortcut registered: ${shortcut} -> ${normalizedShortcut}`);
        }

        return true;
    }

    /**
     * ショートカットの解除
     * @param {string} shortcut - ショートカット文字列
     * @returns {boolean} 解除成功可否
     */
    unregister(shortcut) {
        const normalized = this.normalizeShortcut(shortcut);
        const shortcutData = this.shortcuts.get(normalized);
        
        if (shortcutData) {
            // グループから削除
            this.removeFromGroup(shortcutData.options.group, normalized);
            
            // コンテキストから削除
            this.removeFromContext(shortcutData.options.context, normalized);
            
            // ショートカット削除
            this.shortcuts.delete(normalized);
            
            // 競合から削除
            this.conflicts.delete(normalized);
            
            if (this.debug) {
                console.log(`Shortcut unregistered: ${shortcut}`);
            }
            
            return true;
        }
        
        return false;
    }

    /**
     * ショートカットの実行
     * @param {KeyboardEvent} event - キーボードイベント
     * @returns {boolean} 実行したかどうか
     */
    execute(event) {
        if (!this.enabled || this.suspended) {
            return false;
        }

        const shortcutString = this.buildShortcutString(event);
        
        if (this.debug) {
            console.log(`Shortcut attempt: ${shortcutString}`);
        }

        // シーケンス処理
        if (this.settings.enableSequences && this.isWaitingForSequence) {
            return this.handleSequence(event, shortcutString);
        }

        // 直接マッチのチェック
        const directMatch = this.findShortcut(shortcutString);
        if (directMatch) {
            return this.executeShortcut(event, directMatch, shortcutString);
        }

        // シーケンス開始のチェック
        if (this.settings.enableSequences) {
            const sequenceMatch = this.findSequenceStart(shortcutString);
            if (sequenceMatch) {
                return this.startSequence(event, shortcutString);
            }
        }

        return false;
    }

    /**
     * ショートカット文字列の構築
     * @param {KeyboardEvent} event - キーボードイベント
     * @returns {string} ショートカット文字列
     */
    buildShortcutString(event) {
        const parts = [];
        
        // 修飾キーの処理
        if (event.ctrlKey) parts.push('ctrl');
        if (event.altKey) parts.push('alt');
        if (event.shiftKey) parts.push('shift');
        if (event.metaKey) parts.push('meta');
        
        // 主要キーの処理
        const key = this.normalizeKey(event.key, event.code);
        if (key && !['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) {
            parts.push(key);
        }
        
        return parts.join('+');
    }

    /**
     * キーの正規化
     * @param {string} key - キー名
     * @param {string} code - キーコード
     * @returns {string} 正規化されたキー名
     */
    normalizeKey(key, code) {
        // 特殊キーのマッピング
        const specialKeys = {
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
            'Insert': 'insert'
        };

        if (specialKeys[key]) {
            return specialKeys[key];
        }

        // 数字とアルファベットの処理
        if (key.length === 1) {
            return this.settings.caseSensitive ? key : key.toLowerCase();
        }

        // ファンクションキーの処理
        if (key.startsWith('F') && /^F\d+$/.test(key)) {
            return key.toLowerCase();
        }

        return key.toLowerCase();
    }

    /**
     * ショートカットの正規化
     * @param {string} shortcut - ショートカット文字列
     * @returns {string} 正規化されたショートカット
     */
    normalizeShortcut(shortcut) {
        return shortcut
            .toLowerCase()
            .replace(/\s+/g, '')
            .split('+')
            .map(part => part.trim())
            .filter(part => part.length > 0)
            .sort((a, b) => {
                // 修飾キーの順序: ctrl, alt, shift, meta, その他
                const order = { 'ctrl': 0, 'alt': 1, 'shift': 2, 'meta': 3 };
                const aOrder = order[a] !== undefined ? order[a] : 999;
                const bOrder = order[b] !== undefined ? order[b] : 999;
                return aOrder - bOrder;
            })
            .join('+');
    }

    /**
     * ショートカットの検証
     * @param {string} shortcut - ショートカット文字列
     * @returns {boolean} 有効かどうか
     */
    validateShortcut(shortcut) {
        if (typeof shortcut !== 'string' || shortcut.trim().length === 0) {
            return false;
        }

        // シーケンスの場合
        if (this.isSequence(shortcut)) {
            const sequences = shortcut.split('>').map(s => s.trim());
            return sequences.every(seq => this.validateSingleShortcut(seq));
        }

        return this.validateSingleShortcut(shortcut);
    }

    /**
     * 単一ショートカットの検証
     * @param {string} shortcut - ショートカット文字列
     * @returns {boolean} 有効かどうか
     */
    validateSingleShortcut(shortcut) {
        const parts = shortcut.toLowerCase().split('+').map(p => p.trim());
        
        // 空のパートがないかチェック
        if (parts.some(part => part.length === 0)) {
            return false;
        }

        // 修飾キーのみでないかチェック
        const modifiers = ['ctrl', 'alt', 'shift', 'meta'];
        const hasNonModifier = parts.some(part => !modifiers.includes(part));
        
        return hasNonModifier;
    }

    /**
     * シーケンスかどうかの判定
     * @param {string} shortcut - ショートカット文字列
     * @returns {boolean} シーケンスかどうか
     */
    isSequence(shortcut) {
        return shortcut.includes('>');
    }

    /**
     * コードかどうかの判定
     * @param {string} shortcut - ショートカット文字列
     * @returns {boolean} コードかどうか
     */
    isChord(shortcut) {
        return shortcut.includes(' ');
    }

    /**
     * ショートカットの検索
     * @param {string} shortcutString - ショートカット文字列
     * @returns {Object|null} マッチしたショートカット
     */
    findShortcut(shortcutString) {
        // アクティブコンテキストから検索
        const contextShortcuts = this.contexts.get(this.activeContext) || new Set();
        
        for (const normalized of contextShortcuts) {
            const shortcut = this.shortcuts.get(normalized);
            if (shortcut && shortcut.options.enabled && normalized === shortcutString) {
                return shortcut;
            }
        }

        // グローバルコンテキストから検索（アクティブコンテキストがグローバルでない場合）
        if (this.activeContext !== 'global') {
            const globalShortcuts = this.contexts.get('global') || new Set();
            
            for (const normalized of globalShortcuts) {
                const shortcut = this.shortcuts.get(normalized);
                if (shortcut && shortcut.options.enabled && normalized === shortcutString) {
                    return shortcut;
                }
            }
        }

        return null;
    }

    /**
     * ショートカットの実行
     * @param {KeyboardEvent} event - キーボードイベント
     * @param {Object} shortcut - ショートカットデータ
     * @param {string} shortcutString - ショートカット文字列
     * @returns {boolean} 実行したかどうか
     */
    executeShortcut(event, shortcut, shortcutString) {
        try {
            const startTime = performance.now();

            // イベントのデフォルト動作を防ぐ
            if (shortcut.options.preventDefault) {
                event.preventDefault();
            }

            if (shortcut.options.stopPropagation) {
                event.stopPropagation();
            }

            // コールバック実行
            const result = shortcut.callback(event, shortcutString, shortcut);

            // 統計更新
            const executionTime = performance.now() - startTime;
            shortcut.statistics.lastExecuted = Date.now();
            shortcut.statistics.executionCount++;
            shortcut.statistics.averageExecutionTime = 
                (shortcut.statistics.averageExecutionTime * (shortcut.statistics.executionCount - 1) + executionTime) / 
                shortcut.statistics.executionCount;

            this.statistics.totalExecuted++;

            if (shortcut.options.sequence) {
                this.statistics.sequencesCompleted++;
            }

            if (shortcut.options.chord) {
                this.statistics.chordsExecuted++;
            }

            if (this.debug) {
                console.log(`Shortcut executed: ${shortcutString} (${executionTime.toFixed(2)}ms)`);
            }

            return result !== false;

        } catch (error) {
            console.error(`Error executing shortcut '${shortcutString}':`, error);
            return false;
        }
    }

    /**
     * シーケンス開始
     * @param {KeyboardEvent} event - キーボードイベント
     * @param {string} shortcutString - ショートカット文字列
     * @returns {boolean} 処理したかどうか
     */
    startSequence(event, shortcutString) {
        this.currentSequence = [shortcutString];
        this.isWaitingForSequence = true;

        // タイムアウト設定
        if (this.sequenceTimer) {
            clearTimeout(this.sequenceTimer);
        }

        this.sequenceTimer = setTimeout(() => {
            this.resetSequence();
        }, this.settings.sequenceTimeout);

        if (this.debug) {
            console.log(`Sequence started: ${shortcutString}`);
        }

        return true;
    }

    /**
     * シーケンス処理
     * @param {KeyboardEvent} event - キーボードイベント
     * @param {string} shortcutString - ショートカット文字列
     * @returns {boolean} 処理したかどうか
     */
    handleSequence(event, shortcutString) {
        this.currentSequence.push(shortcutString);

        const sequenceString = this.currentSequence.join('>');
        const shortcut = this.findShortcut(sequenceString);

        if (shortcut) {
            // シーケンス完了
            this.resetSequence();
            return this.executeShortcut(event, shortcut, sequenceString);
        }

        // シーケンス継続の可能性をチェック
        const hasPartialMatch = this.findSequenceStart(sequenceString);
        if (!hasPartialMatch) {
            // マッチする可能性がない場合はリセット
            this.resetSequence();
            return false;
        }

        // シーケンス継続
        if (this.sequenceTimer) {
            clearTimeout(this.sequenceTimer);
        }

        this.sequenceTimer = setTimeout(() => {
            this.resetSequence();
        }, this.settings.sequenceTimeout);

        return true;
    }

    /**
     * シーケンス開始の検索
     * @param {string} partial - 部分的なシーケンス
     * @returns {boolean} 開始マッチがあるかどうか
     */
    findSequenceStart(partial) {
        for (const [normalized] of this.shortcuts) {
            if (normalized.startsWith(partial + '>')) {
                return true;
            }
        }
        return false;
    }

    /**
     * シーケンスのリセット
     */
    resetSequence() {
        this.currentSequence = [];
        this.isWaitingForSequence = false;
        
        if (this.sequenceTimer) {
            clearTimeout(this.sequenceTimer);
            this.sequenceTimer = null;
        }

        if (this.debug && this.currentSequence.length > 0) {
            console.log('Sequence reset');
        }
    }

    /**
     * 競合の処理
     * @param {string} normalized - 正規化されたショートカット
     * @param {Object} newShortcut - 新しいショートカット
     * @returns {boolean} 登録成功可否
     */
    handleConflict(normalized, newShortcut) {
        const existing = this.shortcuts.get(normalized);
        
        switch (this.conflictResolutionStrategy) {
            case 'error':
                throw new Error(`Shortcut conflict: ${normalized} is already registered`);
                
            case 'override':
                this.shortcuts.set(normalized, newShortcut);
                console.warn(`Shortcut overridden: ${normalized}`);
                return true;
                
            case 'merge':
                return this.mergeShortcuts(normalized, existing, newShortcut);
                
            case 'warn':
            default:
                this.conflicts.set(normalized, [existing, newShortcut]);
                console.warn(`Shortcut conflict detected: ${normalized}`);
                this.statistics.conflictsDetected++;
                return false;
        }
    }

    /**
     * ショートカットのマージ
     * @param {string} normalized - 正規化されたショートカット
     * @param {Object} existing - 既存のショートカット
     * @param {Object} newShortcut - 新しいショートカット
     * @returns {boolean} マージ成功可否
     */
    mergeShortcuts(normalized, existing, newShortcut) {
        // 優先度に基づいてマージ
        if (newShortcut.options.priority > existing.options.priority) {
            this.shortcuts.set(normalized, newShortcut);
            return true;
        } else if (newShortcut.options.priority === existing.options.priority) {
            // 同じ優先度の場合、両方を保持してコンテキストで分ける
            const combinedCallback = (event, shortcutString, shortcut) => {
                existing.callback(event, shortcutString, shortcut);
                newShortcut.callback(event, shortcutString, shortcut);
            };
            
            existing.callback = combinedCallback;
            return true;
        }
        
        return false;
    }

    /**
     * グループへの追加
     * @param {string} group - グループ名
     * @param {string} normalized - 正規化されたショートカット
     */
    addToGroup(group, normalized) {
        if (!this.shortcutGroups.has(group)) {
            this.shortcutGroups.set(group, new Set());
        }
        this.shortcutGroups.get(group).add(normalized);
    }

    /**
     * グループからの削除
     * @param {string} group - グループ名
     * @param {string} normalized - 正規化されたショートカット
     */
    removeFromGroup(group, normalized) {
        const groupSet = this.shortcutGroups.get(group);
        if (groupSet) {
            groupSet.delete(normalized);
            if (groupSet.size === 0) {
                this.shortcutGroups.delete(group);
            }
        }
    }

    /**
     * コンテキストへの追加
     * @param {string} context - コンテキスト名
     * @param {string} normalized - 正規化されたショートカット
     */
    addToContext(context, normalized) {
        if (!this.contexts.has(context)) {
            this.contexts.set(context, new Set());
        }
        this.contexts.get(context).add(normalized);
    }

    /**
     * コンテキストからの削除
     * @param {string} context - コンテキスト名
     * @param {string} normalized - 正規化されたショートカット
     */
    removeFromContext(context, normalized) {
        const contextSet = this.contexts.get(context);
        if (contextSet) {
            contextSet.delete(normalized);
            if (contextSet.size === 0 && context !== 'global') {
                this.contexts.delete(context);
            }
        }
    }

    /**
     * コンテキストの切り替え
     * @param {string} context - 新しいコンテキスト
     */
    switchContext(context) {
        if (this.activeContext !== context) {
            this.activeContext = context;
            this.statistics.contextSwitches++;
            
            if (this.debug) {
                console.log(`Context switched to: ${context}`);
            }
        }
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // メインのキーボードイベントリスナー
        this.keydownHandler = (event) => {
            this.execute(event);
        };

        // フォーカス管理
        this.focusHandler = (event) => {
            // デバッグインターフェースにフォーカスがある場合のみ有効
            if (this.debugInterface.isVisible) {
                document.addEventListener('keydown', this.keydownHandler, true);
            }
        };

        this.blurHandler = (event) => {
            document.removeEventListener('keydown', this.keydownHandler, true);
        };

        // ページ読み込み時の設定
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupDocumentListeners();
            });
        } else {
            this.setupDocumentListeners();
        }
    }

    /**
     * ドキュメントレベルのイベントリスナー設定
     */
    setupDocumentListeners() {
        document.addEventListener('keydown', this.keydownHandler, true);
    }

    /**
     * デフォルトショートカットの登録
     */
    registerDefaultShortcuts() {
        // デバッグインターフェース制御
        this.register('ctrl+shift+d', () => {
            this.debugInterface.toggle();
        }, {
            description: 'Toggle Debug Interface',
            group: 'interface',
            priority: 100
        });

        // パネル切り替え
        this.register('ctrl+shift+o', () => {
            this.debugInterface.switchPanel('overview');
        }, {
            description: 'Switch to Overview Panel',
            group: 'panels'
        });

        this.register('ctrl+shift+p', () => {
            this.debugInterface.switchPanel('performance');
        }, {
            description: 'Switch to Performance Panel',
            group: 'panels'
        });

        this.register('ctrl+shift+c', () => {
            this.debugInterface.switchPanel('console');
        }, {
            description: 'Switch to Console Panel',
            group: 'panels'
        });

        this.register('ctrl+shift+e', () => {
            this.debugInterface.switchPanel('errors');
        }, {
            description: 'Switch to Errors Panel',
            group: 'panels'
        });

        this.register('ctrl+shift+t', () => {
            this.debugInterface.switchPanel('tests');
        }, {
            description: 'Switch to Tests Panel',
            group: 'panels'
        });

        // 汎用制御
        this.register('escape', () => {
            if (this.debugInterface.isVisible) {
                this.debugInterface.hide();
            }
        }, {
            description: 'Hide Debug Interface',
            group: 'interface'
        });

        // シーケンス例
        this.register('ctrl+d>ctrl+s', () => {
            this.debugInterface.showSettings();
        }, {
            description: 'Show Debug Settings (Sequence)',
            group: 'advanced'
        });
    }

    /**
     * コンテキストの設定
     */
    setupContexts() {
        // デフォルトコンテキスト
        this.contexts.set('global', new Set());
        this.contexts.set('console', new Set());
        this.contexts.set('performance', new Set());
        this.contexts.set('errors', new Set());
    }

    /**
     * カスタマイゼーションの読み込み
     */
    loadCustomizations() {
        if (!this.settings.saveCustomizations) return;

        try {
            const saved = localStorage.getItem('debug-shortcuts-customizations');
            if (saved) {
                const customizations = JSON.parse(saved);
                
                for (const [shortcut, data] of Object.entries(customizations)) {
                    if (data.disabled) {
                        this.unregister(shortcut);
                    } else if (data.replacement) {
                        this.unregister(shortcut);
                        this.register(data.replacement, data.callback, data.options);
                    }
                }
                
                this.statistics.customizations = Object.keys(customizations).length;
            }
        } catch (error) {
            console.warn('Failed to load shortcut customizations:', error);
        }
    }

    /**
     * カスタマイゼーションの保存
     */
    saveCustomizations() {
        if (!this.settings.saveCustomizations) return;

        try {
            const customizations = {};
            // カスタマイゼーション情報を保存
            localStorage.setItem('debug-shortcuts-customizations', JSON.stringify(customizations));
        } catch (error) {
            console.warn('Failed to save shortcut customizations:', error);
        }
    }

    // パブリックAPI

    /**
     * 有効/無効の切り替え
     * @param {boolean} enabled - 有効かどうか
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        
        if (this.debug) {
            console.log(`Keyboard shortcuts ${enabled ? 'enabled' : 'disabled'}`);
        }
    }

    /**
     * 一時停止/再開
     * @param {boolean} suspended - 一時停止するかどうか
     */
    setSuspended(suspended) {
        this.suspended = suspended;
        
        if (suspended) {
            this.resetSequence();
        }

        if (this.debug) {
            console.log(`Keyboard shortcuts ${suspended ? 'suspended' : 'resumed'}`);
        }
    }

    /**
     * デバッグモードの切り替え
     * @param {boolean} debug - デバッグモードかどうか
     */
    setDebug(debug) {
        this.debug = debug;
    }

    /**
     * 競合解決戦略の設定
     * @param {string} strategy - 戦略名
     */
    setConflictResolutionStrategy(strategy) {
        const validStrategies = ['warn', 'error', 'override', 'merge'];
        if (validStrategies.includes(strategy)) {
            this.conflictResolutionStrategy = strategy;
        } else {
            console.warn(`Invalid conflict resolution strategy: ${strategy}`);
        }
    }

    /**
     * 全ショートカットの取得
     * @returns {Map} ショートカットマップ
     */
    getAllShortcuts() {
        return new Map(this.shortcuts);
    }

    /**
     * グループ別ショートカットの取得
     * @param {string} group - グループ名
     * @returns {Array} ショートカット配列
     */
    getShortcutsByGroup(group) {
        const groupSet = this.shortcutGroups.get(group);
        if (!groupSet) return [];

        return Array.from(groupSet).map(normalized => ({
            shortcut: normalized,
            data: this.shortcuts.get(normalized)
        }));
    }

    /**
     * コンテキスト別ショートカットの取得
     * @param {string} context - コンテキスト名
     * @returns {Array} ショートカット配列
     */
    getShortcutsByContext(context) {
        const contextSet = this.contexts.get(context);
        if (!contextSet) return [];

        return Array.from(contextSet).map(normalized => ({
            shortcut: normalized,
            data: this.shortcuts.get(normalized)
        }));
    }

    /**
     * 競合リストの取得
     * @returns {Map} 競合マップ
     */
    getConflicts() {
        return new Map(this.conflicts);
    }

    /**
     * 統計情報の取得
     * @returns {Object} 統計情報
     */
    getStatistics() {
        return { ...this.statistics };
    }

    /**
     * 設定の取得
     * @returns {Object} 設定オブジェクト
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * 設定の更新
     * @param {Object} newSettings - 新しい設定
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }

    /**
     * クリーンアップ
     */
    destroy() {
        // タイマーのクリア
        if (this.sequenceTimer) {
            clearTimeout(this.sequenceTimer);
        }

        // イベントリスナーの削除
        document.removeEventListener('keydown', this.keydownHandler, true);

        // カスタマイゼーションの保存
        this.saveCustomizations();

        // データのクリア
        this.shortcuts.clear();
        this.shortcutGroups.clear();
        this.contexts.clear();
        this.conflicts.clear();

        console.log('KeyboardShortcutManager destroyed');
    }
}

// デフォルトエクスポート
export default KeyboardShortcutManager;