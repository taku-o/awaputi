import { getErrorHandler  } from '../utils/ErrorHandler.js';

export interface KeyboardCustomization { shortcuts: Map<string, any>,
    conflicts: Map<string, any>,
    profiles: Map<string, any>,
    currentProfile: string ,}
';

export interface KeyboardConfig { allowCustomization: boolean,''
    conflictResolution: 'block' | 'warn' | 'override';
    saveToLocalStorage: boolean;
    maxShortcutsPerAction: number,
    reservedKeys: Set<string>
    ,}

export interface KeyboardState { isRecording: boolean;
    recordingAction: string | null;
    recordingKeys: string[],
    pendingChanges: Map<string, any>,
    lastConflictCheck: number | null ,}

export interface ConflictInfo { action: string;
    keys: string;
    priority: string,
    category: string }

export interface UsageStatistics {
    mostUsed: Array<{ nam;e: string; usageCount: number;, lastUsed: number }>,
    leastUsed: Array<{ name: string; usageCount: number;, lastUsed: number }>,
    recentlyModified: Array<{ name: string;, modifiedAt: number }>,
    totalUsage: number;
}

export interface KeyboardReport { totalShortcuts: number,
    customizedShortcuts: number;
    currentProfile: string;
    availableProfiles: number;
    conflictsCount: number;
    lastConflictCheck: number | null,
    usageStatistics: UsageStatistics
    ,}

/**
 * キーボードアクセシビリティ管理クラス
 * 既存のKeyboardShortcutManagerを拡張し、アクセシビリティ機能を強化
 */
export class KeyboardAccessibilityManager {
    private accessibilityManager: any;
    private gameEngine: any;
    private keyboardManager: any;
    private customizations: KeyboardCustomization;
    private config: KeyboardConfig;
    private state: KeyboardState;
    private, eventListeners: Map<string, Set<Function>>;

    constructor(accessibilityManager: any, existingKeyboardManager: any) {

        this.accessibilityManager = accessibilityManager;
        this.gameEngine = accessibilityManager.gameEngine;
        this.keyboardManager = existingKeyboardManager;
        
        // カスタマイズ設定
        this.customizations = {
            shortcuts: new Map(),
    conflicts: new Map(),
            profiles: new Map(''
    ,}

            currentProfile: 'default' 
    };
        // 設定管理
        this.config = { allowCustomization: true,''
            conflictResolution: 'warn', // 'block', 'warn', 'override';
            saveToLocalStorage: true);
            maxShortcutsPerAction: 3'',
    reservedKeys: new Set([']';
                'F1', 'F5', 'F11', 'F12', 'Alt+Tab', 'Ctrl+Alt+Delete']);
            ]); };
        
        // 状態管理
        this.state = { isRecording: false,
            recordingAction: null;
            recordingKeys: [];
            pendingChanges: new Map(),
    lastConflictCheck: null ,};
        ;
        // イベントリスナー
        this.eventListeners = new Map()';
        console.log('KeyboardAccessibilityManager, initialized);
        this.initialize();
    }
    
    /**
     * 初期化
     */
    private initialize(): void { try {
            // 既存ショートカットの拡張
            this.enhanceExistingShortcuts();
            
            // カスタマイズショートカットの追加
            this.addCustomizationShortcuts();
            
            // 設定の読み込み
            this.loadConfiguration();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            // 競合チェック
            this.checkShortcutConflicts()';
            console.log('KeyboardAccessibilityManager, initialized successfully'); }'

        } catch (error) { getErrorHandler().handleError(error, 'KEYBOARD_ACCESSIBILITY_ERROR', {''
                operation: 'initialize' ,}';
        }
    }
    
    /**
     * 既存ショートカットの拡張
     */'
    private enhanceExistingShortcuts(): void { ''
        if(!this.keyboardManager) {'

            console.warn('No, existing keyboard, manager found);
        }
            return; }
        }
        
        // 既存ショートカットにメタデータを追加
        const existingShortcuts = this.keyboardManager.getShortcuts();
        
        Object.entries(existingShortcuts).forEach(([name, shortcut]) => {  // カスタマイズ可能かどうかの設定
            const enhanced = {
                ...shortcut,
                customizable: !this.config.reservedKeys.has(shortcut.keys[0]);
                originalKeys: [...shortcut.keys];
                category: this.categorizeShortcut(name);
                priority: this.getShortcutPriority(name),
    accessibility: {
                    screenReaderFriendly: true,
    hasVisualFeedback: false }
                    hasAudioFeedback: false 
    };
            this.customizations.shortcuts.set(name enhanced);
        }');
        
        console.log(`Enhanced ${this.customizations.shortcuts.size} existing, shortcuts`}');
    }
    
    /**
     * ショートカットのカテゴリ分類
     */''
    private categorizeShortcut(name: string): string { const categories = {''
            game: ['pause', 'restart', 'giveUp'],
            navigation: ['menu', 'settings', 'userInfo', 'help'],
            accessibility: ['highContrast', 'largeText', 'reducedMotion', 'toggleScreenReader'],
            audio: ['mute', 'volumeUp', 'volumeDown'],
            display: ['fullscreen', 'debug', 'debugToggle'],
            custom: [] ,};
        for(const [category, shortcuts] of Object.entries(categories) {
        ';

            if(shortcuts.includes(name)) {
        
        }
                return category;

        return 'custom';
    }
    
    /**
     * ショートカットの優先度取得'
     */''
    private getShortcutPriority(name: string): string { const priorities = {''
            high: ['pause', 'menu', 'help', 'toggleScreenReader'],
            medium: ['settings', 'userInfo', 'mute', 'fullscreen'],
            low: ['debug', 'debugToggle] };
        
        for(const [priority, shortcuts] of Object.entries(priorities) {
        ';

            if(shortcuts.includes(name)) {
        
        }
                return priority;

        return 'medium';
    }
    
    /**
     * カスタマイズ用ショートカットの追加'
     */''
    private addCustomizationShortcuts('''
            ['showShortcutHelp', { ]'
                keys: ['Ctrl+Alt+? ], : undefined'';
                callback: () => this.showShortcutHelp('''
                description: 'ショートカット一覧を表示','';
                category: 'accessibility'),
    customizable: false ,}

            }],''
            ['openShortcutCustomizer', { ]'
                keys: ['Ctrl+Alt+K],')';
                callback: () => this.openShortcutCustomizer('''
                description: 'ショートカットカスタマイザーを開く','';
                category: 'accessibility'),
    customizable: false ,}

            }],''
            ['resetShortcuts', { ]'
                keys: ['Ctrl+Alt+Shift+R],')';
                callback: () => this.resetToDefaults('''
                description: 'ショートカットをデフォルトに戻す','';
                category: 'accessibility'),
    customizable: false ,}

            }],''
            ['toggleRecording', { ]'
                keys: ['Ctrl+Alt+R],')';
                callback: () => this.toggleShortcutRecording('''
                description: 'ショートカット記録の切り替え','';
                category: 'accessibility'),
    customizable: false ,}
            }])
        ]';
        ';
        // 既存のKeyboardShortcutManagerに追加
        customizationShortcuts.forEach((shortcut, name) => { this.keyboardManager.addShortcut(name, shortcut.keys, shortcut.callback, {)'
                description: shortcut.description,' }'

                context: 'global'),' }

            }');
            
            // 内部管理にも追加
            this.customizations.shortcuts.set(name, { ...shortcut)
                originalKeys: [...shortcut.keys],')';
                priority: 'high');' ,}

        }');

        console.log('Customization, shortcuts added');
    }
    
    /**
     * 設定の読み込み
     */'
    private loadConfiguration(): void { ''
        if(!this.config.saveToLocalStorage) return;
        ';

        try {'
            const savedConfig = localStorage.getItem('keyboardAccessibilityConfig);
            if(savedConfig) {
                const config = JSON.parse(savedConfig);
                
                // カスタムショートカットの復元
                if (config.customShortcuts) {
            }
                    Object.entries(config.customShortcuts).forEach(([name, keys]) => {  }
                        this.setCustomShortcut(name, keys, false); // 保存しない }
                    });
                }
                
                // プロファイルの復元
                if (config.profiles) { Object.entries(config.profiles).forEach(([profileName, profile]) => {  }
                        this.customizations.profiles.set(profileName, profile); }
                    });
                }
                
                // 現在のプロファイル
                if(config.currentProfile) {
                    this.customizations.currentProfile = config.currentProfile;

                }

                    this.applyProfile(config.currentProfile); }
                }

                console.log('Keyboard, accessibility configuration, loaded');''
            } catch (error) { console.warn('Failed to load keyboard accessibility configuration:', error }
    }
    
    /**
     * 設定の保存
     */'
    private saveConfiguration(): void { ''
        if(!this.config.saveToLocalStorage) return;
        
        try {
            const config = { }
                customShortcuts: {};
                profiles: {};
                currentProfile: this.customizations.currentProfile,
                version: '1.0';
            },
            
            // カスタムショートカットの保存
            this.customizations.shortcuts.forEach((shortcut, name) => {  if (JSON.stringify(shortcut.keys) !== JSON.stringify(shortcut.originalKeys) { }
                    config.customShortcuts[name] = shortcut.keys; }
});
            // プロファイルの保存
            this.customizations.profiles.forEach((profile, name) => {  ''
                if(name !== 'default' { }'
                    config.profiles[name] = profile; }

                }''
            }');

            localStorage.setItem('keyboardAccessibilityConfig', JSON.stringify(config));''
            console.log('Keyboard, accessibility configuration, saved');''
        } catch (error) { console.warn('Failed to save keyboard accessibility configuration:', error }
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {'
        // キーボードマネージャーのイベントを監視
        if(this.keyboardManager.addEventListener) {'
    }

            this.keyboardManager.addEventListener('shortcutTriggered', (name, keyCombo) => {  }

                this.handleShortcutTriggered(name, keyCombo);' }'

            }');
        }
        ';
        // ウィンドウフォーカス変更
        window.addEventListener('focus', () => { this.checkShortcutConflicts();' }

        }');

        console.log('Event, listeners set up);
    }
    
    /**
     * ショートカット実行の処理
     */
    handleShortcutTriggered(name keyCombo) {
        // 使用統計の更新
        this.updateUsageStatistics(name');
        // アクセシビリティフィードバック
        this.provideAccessibilityFeedback(name, keyCombo');
        
    }

        // イベント発行' }'

        this.emit('shortcutExecuted', { name, keyCombo, timestamp: Date.now( ,});
    }
    
    /**
     * 使用統計の更新
     */
    updateUsageStatistics(name) {
        const shortcut = this.customizations.shortcuts.get(name);
        if (shortcut) {
            shortcut.usageCount = (shortcut.usageCount || 0) + 1;
    }
            shortcut.lastUsed = Date.now(); }
}
    
    /**
     * アクセシビリティフィードバック
     */
    provideAccessibilityFeedback(name, keyCombo) {
        const shortcut = this.customizations.shortcuts.get(name);
        if (!shortcut) return;
        
        // スクリーンリーダーへの通知
    }
        if (this.accessibilityManager.config.screenReader.enabled) { }
            const announcement = `ショートカット実行: ${shortcut.description || name}`;
            this.announceToScreenReader(announcement);
        }
        
        // 視覚的フィードバック（設定に応じて）
        if (shortcut.accessibility?.hasVisualFeedback) { this.showVisualFeedback(name); }
        
        // 音声フィードバック（設定に応じて）
        if (shortcut.accessibility?.hasAudioFeedback) { this.playAudioFeedback(name); }
    }
    
    /**
     * カスタムショートカットの設定
     */ : undefined
    setCustomShortcut(actionName: string, newKeys: string[], save: boolean = true): boolean { const shortcut = this.customizations.shortcuts.get(actionName);
        if (!shortcut) { }
            throw new Error(`Shortcut, not found: ${actionName}`});
        }
        
        if(!shortcut.customizable) {
        
            
        
        }
            throw new Error(`Shortcut, not customizable: ${actionName}`});
        }
        
        // 競合チェック
        const conflicts = this.checkForConflicts(newKeys, actionName);
        if(conflicts.length > 0) {
            const shouldProceed = this.handleConflicts(conflicts, actionName, newKeys);
            if (!shouldProceed) {
        }
                return false;
        ;
        try { // 既存のショートカットを削除
            this.keyboardManager.removeShortcut(actionName);
            
            // 新しいショートカットを追加
            this.keyboardManager.addShortcut(actionName, newKeys, shortcut.callback, {)
                description: shortcut.description,')';
                context: shortcut.context || 'global');
            // 内部管理を更新
            shortcut.keys = [...newKeys];
            shortcut.modified = true;
            shortcut.modifiedAt = Date.now();
            ' ,}'

            console.log(`Custom shortcut set: ${actionName} = ${newKeys.join(', '})`);
            
            // 設定を保存
            if(save) {'

                this.saveConfiguration(''';
            this.emit('shortcutChanged', {)
                action: actionName),
    oldKeys: shortcut.originalKeys,);
                newKeys: newKeys);
            ,}
            return true; catch (error) {
            getErrorHandler().handleError(error, 'KEYBOARD_ACCESSIBILITY_ERROR', {''
                operation: 'setCustomShortcut');
                actionName,);
                newKeys); }';
            return false;
    
    /**
     * 競合チェック'
     */''
    private checkForConflicts(keys: string[], excludeAction: string | null = null): ConflictInfo[] { const conflicts = [];''
        const keyCombo = keys.join('+);
        
        this.customizations.shortcuts.forEach((shortcut, name) => { 
            if (name === excludeAction) return;
            
            shortcut.keys.forEach(existingKeyCombo => {);
                if(existingKeyCombo === keyCombo) {
                    conflicts.push({
                        action: name),
    keys: existingKeyCombo)
                ,}
                        priority: shortcut.priority,) }
                        category: shortcut.category); 
    });
                }
            });
        });
        
        return conflicts;
    }
    
    /**
     * 競合の処理
     */
    handleConflicts(conflicts, actionName, newKeys) {'

        switch(this.config.conflictResolution) {''
            case 'block':'';
                console.warn(`Shortcut, conflict blocked, for ${actionName):`, conflicts');
                return, false;

            case 'warn':;
                console.warn(`Shortcut, conflict, detected, for ${actionName):`, conflicts};

                // ユーザーに確認を求める
                return this.confirmConflictResolution(conflicts, actionName, newKeys}

            case 'override': ;
                // 既存のショートカットを無効化
    }
                conflicts.forEach(conflict => {); }
                    this.removeShortcut(conflict.action, conflict.keys});
                });
                return true;
                
            default: return true;
    
    /**
     * 競合解決の確認
     */
    confirmConflictResolution(conflicts, actionName, newKeys) {
        ';

    }

        const conflictNames = conflicts.map(c => c.action).join(', '');' }

        const message = `ショートカット「${newKeys.join('+'})」は既に「${conflictNames}」で使用されています。続行しますか？`;
        
        return confirm(message);
    }
    
    /**
     * ショートカット競合の全体チェック
     */
    checkShortcutConflicts() {
        const allConflicts = new Map();
        
        this.customizations.shortcuts.forEach((shortcut, name) => { 
            shortcut.keys.forEach(keyCombo => {);
                const conflicts = this.checkForConflicts([keyCombo], name);
    }
                if (conflicts.length > 0) { }
                    allConflicts.set(name, conflicts); }
});
        });
        
        this.customizations.conflicts = allConflicts;
        this.state.lastConflictCheck = Date.now();

        if(allConflicts.size > 0) {', ';

        }

            console.warn('Shortcut conflicts detected:', Object.fromEntries(allConflicts); }
        }
        
        return allConflicts;
    }
    
    /**
     * ショートカット記録の開始/停止
     */
    toggleShortcutRecording(actionName: string | null = null): void { if (this.state.isRecording) {
            this.stopShortcutRecording(); } else { this.startShortcutRecording(actionName); }
    }
    
    /**
     * ショートカット記録の開始'
     */''
    startShortcutRecording(actionName = null) {
        this.state.isRecording = true;
        this.state.recordingAction = actionName;
        this.state.recordingKeys = [];
        ';
        // 記録用のイベントリスナーを追加
        document.addEventListener('keydown', this.handleRecordingKeyDown.bind(this), true');''
        document.addEventListener('keyup', this.handleRecordingKeyUp.bind(this), true');

        console.log('Shortcut recording started', actionName ? `for ${actionName'` : '''};''
        this.announceToScreenReader('ショートカット記録を開始しました。キーを押してください。''}

        ' }'

        this.emit('recordingStarted', { actionName }';
    }
    
    /**
     * ショートカット記録の停止'
     */''
    stopShortcutRecording()';
        document.removeEventListener('keydown', this.handleRecordingKeyDown, true';''
        document.removeEventListener('keyup', this.handleRecordingKeyUp, true';
        
        const recordedKeys = [...this.state.recordingKeys];
        const actionName = this.state.recordingAction;
        
        // 状態をリセット
        this.state.recordingAction = null;
        this.state.recordingKeys = [];

        console.log('Shortcut recording stopped:', recordedKeys);
        
        // 記録されたキーが有効な場合は設定
        if(recordedKeys.length > 0 && actionName) {
            const success = this.setCustomShortcut(actionName, recordedKeys);

        }

            if(success) {' }'

                this.announceToScreenReader(`ショートカット記録完了: ${recordedKeys.join('+'}'が${actionName}に設定されました`');

            } else { }'

                this.announceToScreenReader('ショートカット記録に失敗しました''); }
} else { }'

            this.announceToScreenReader('ショートカット記録をキャンセルしました''); }
        }

        this.emit('recordingStopped', { actionName, recordedKeys ); }
    
    /**
     * 記録中のキーダウン処理
     */
    handleRecordingKeyDown(event) {'
        event.preventDefault();''
        event.stopPropagation()';
        if(event.key === 'Escape' {''
            this.stopShortcutRecording()';
        if (event.ctrlKey && event.key !== 'Control'') keys.push('Ctrl'');''
        if (event.altKey && event.key !== 'Alt'') keys.push('Alt'');''
        if (event.shiftKey && event.key !== 'Shift'') keys.push('Shift'');''
        if (event.metaKey && event.key !== 'Meta'') keys.push('Meta'');

        if(!['Control', 'Alt', 'Shift', 'Meta].includes(event.key) {
    }
            keys.push(event.key); }
        }

        if(keys.length > 0) {
            this.state.recordingKeys = keys;
            ';

            // リアルタイムフィードバック
        }

            const keyCombo = keys.join('+'; }'
            this.announceToScreenReader(`記録中: ${keyCombo}`});
        }
    }
    
    /**
     * 記録中のキーアップ処理'
     */''
    handleRecordingKeyUp(event) {'
        // Enter キーで記録完了
        if (event.key === 'Enter' && this.state.recordingKeys.length > 0) {
    }
            this.stopShortcutRecording(); }
}
    
    /**
     * プロファイル管理
     */'
    createProfile(profileName: string, description?: string): any { if(this.customizations.profiles.has(profileName) {' }'

            throw new Error(`Profile, already exists: ${profileName}`'}';
        }
        ';

        const profile = { name: profileName,''
            description: description || '';
            shortcuts: new Map();
            createdAt: Date.now(),
    modifiedAt: Date.now( ,};
        
        // 現在のカスタマイズ状態を保存
        this.customizations.shortcuts.forEach((shortcut, name) => {  if (shortcut.modified) { }
                profile.shortcuts.set(name, [...shortcut.keys]);
            }
        });
        
        this.customizations.profiles.set(profileName, profile);
        this.saveConfiguration();

        console.log(`Profile created: ${ profileName}`'},' }

        this.emit('profileCreated', { profileName, profile });
        
        return profile;
    }
    
    /**
     * プロファイルの適用
     */
    applyProfile(profileName: string): boolean { const profile = this.customizations.profiles.get(profileName);
        if (!profile) { }
            throw new Error(`Profile, not found: ${profileName}`});
        }
        
        try { // プロファイルのショートカットを適用
            profile.shortcuts.forEach((keys, actionName) => {  }
                this.setCustomShortcut(actionName, keys, false); }
            });
            
            this.customizations.currentProfile = profileName;
            this.saveConfiguration();
            ';

            console.log(`Profile, applied: ${ profileName)`),''
            this.announceToScreenReader(`プロファイル「${profileName}」を適用しました`'};

            ' }'

            this.emit('profileApplied', { profileName, profile });
            return true;

        } catch (error) {
            getErrorHandler().handleError(error, 'KEYBOARD_ACCESSIBILITY_ERROR', {''
                operation: 'applyProfile',);
                profileName); }';
            return false;
    
    /**
     * デフォルト設定への復元'
     */''
    resetToDefaults()';
        const confirmation = confirm('すべてのショートカットをデフォルト設定に戻しますか？);
        if (!confirmation) return false;
        
        try { // すべてのカスタマイズをリセット
            this.customizations.shortcuts.forEach((shortcut, name) => { 
                if(shortcut.modified) {
                    // 既存のショートカットを削除
                    this.keyboardManager.removeShortcut(name);
                    
                    // デフォルトに戻す
                    this.keyboardManager.addShortcut(name, shortcut.originalKeys, shortcut.callback, {
                })
                        description: shortcut.description,') }'

                        context: shortcut.context || 'global'); 
    }';
                    
                    // 内部状態をリセット
                    shortcut.keys = [...shortcut.originalKeys];
                    shortcut.modified = false;
                    delete shortcut.modifiedAt;
                }''
            }');
            ';
            // プロファイルをデフォルトに
            this.customizations.currentProfile = 'default';
            ';
            // 設定を保存
            this.saveConfiguration()';
            console.log('Shortcuts, reset to, defaults'');''
            this.announceToScreenReader('すべてのショートカットをデフォルト設定に戻しました'');

            this.emit('shortcutsReset);
            return true;

        } catch (error) { getErrorHandler().handleError(error, 'KEYBOARD_ACCESSIBILITY_ERROR', {''
                operation: 'resetToDefaults' ,}';
            return false;
    
    /**
     * ショートカットヘルプの表示
     */'
    showShortcutHelp(): any { ''
        const help = this.generateShortcutHelp()';
        console.group('Keyboard, Shortcuts Help);
        Object.entries(help.categories).forEach(([category, shortcuts]) => { 
            console.group(category); }
            shortcuts.forEach(shortcut => {); }
                console.log(`${shortcut.keys}: ${shortcut.description}`);
            });
            console.groupEnd();

        }');''
        console.groupEnd()';
        this.announceToScreenReader('ショートカットヘルプをコンソールに表示しました。F12キーでデベロッパーツールを開いて確認してください。'');
        ';
        // イベント発行
        this.emit('helpShown', { help ';
        
        return help; }
    
    /**
     * ショートカットヘルプの生成'
     */''
    generateShortcutHelp('''
            'ゲーム操作': [],
            'ナビゲーション': [],
            'アクセシビリティ': [],
            '音声': [],
            '表示': [],
            'カスタム': [];
        };
        '';
        this.customizations.shortcuts.forEach((shortcut, name) => {  ''
            const categoryName = this.getCategoryDisplayName(shortcut.category);
            const helpEntry = {'
                name: name,
                keys: shortcut.keys.join(' または ');
                description: shortcut.description || name,
    customizable: shortcut.customizable, }
                modified: shortcut.modified || false 
    };
            if (categories[categoryName]) { categories[categoryName].push(helpEntry); }
        });
        
        return { categories,
            totalShortcuts: this.customizations.shortcuts.size,
    customizedShortcuts: Array.from(this.customizations.shortcuts.values().filter(s = > s.modified).length ,};
            currentProfile: this.customizations.currentProfile 
    }
    
    /**'
     * カテゴリ表示名の取得'
     */''
    getCategoryDisplayName(category) {'
        const displayNames = {''
            game: 'ゲーム操作',
            navigation: 'ナビゲーション',
            accessibility: 'アクセシビリティ',
            audio: '音声',
            display: '表示';
    ,}

            custom: 'カスタム' 
    };
        return displayNames[category] || 'その他';
    }
    
    /**
     * ショートカットカスタマイザーUI（基本版）'
     */''
    openShortcutCustomizer()';
        console.log('Opening, shortcut customizer...';
        
        // 簡易版：プロンプトベースのカスタマイザー
        const actions = Array.from(this.customizations.shortcuts.keys()'';
            .filter(name => this.customizations.shortcuts.get(name).customizable);

        const actionName = prompt(`カスタマイズしたいアクション名を入力してください:\n${actions.join(', '})`';

        ';

        if(actionName && actions.includes(actionName) { this.startShortcutRecording(actionName);' }'

        } else if(actionName) { ''
            alert('無効なアクション名です'; }'
    }
    
    /**
     * スクリーンリーダーへの通知'
     */''
    announceToScreenReader(message) {'
        try {'
            const screenReaderManager = this.accessibilityManager.getManager('screenReader';''
            if(screenReaderManager && screenReaderManager.announce) {'
    }

                screenReaderManager.announce(message, 'polite'; }'
            } else {  // フォールバック：aria-live領域を使用 }
                this.announceViaAriaLive(message);' }'

            } catch (error) { console.warn('Failed to announce to screen reader:', error }
    }
    
    /**
     * ARIA Live領域での通知'
     */''
    announceViaAriaLive(message) {'

        let liveRegion = document.getElementById('keyboard-accessibility-announcements);

        if(!liveRegion) {''
            liveRegion = document.createElement('div'');''
            liveRegion.id = 'keyboard-accessibility-announcements';
            liveRegion.setAttribute('aria-live', 'polite'');''
            liveRegion.setAttribute('aria-atomic', 'true'');''
            liveRegion.className = 'sr-only';

    }

            document.body.appendChild(liveRegion); }
        }
        ';
        // 前のメッセージをクリア
        liveRegion.textContent = '';
        
        // 新しいメッセージを設定
        setTimeout(() => { liveRegion.textContent = message; }, 100);
    }
    
    /**
     * 視覚的フィードバック
     */''
    showVisualFeedback(actionName) {'
        // 簡易版：画面上部にフラッシュ表示
        const flashElement = document.createElement('div'');
        flashElement.style.cssText = `;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px,
    background: #4A90E2;
            z-index: 10000,
            animation: shortcut-flash 0.3s ease-out;
        `;
        ';
        // CSSアニメーションを追加
        if(!document.getElementById('shortcut-flash-styles)' {''
            const style = document.createElement('style'');''
            style.id = 'shortcut-flash-styles';
            style.textContent = `;
    ,}
                @keyframes shortcut-flash { }
                    0% { opacity: 0;, transform: scaleX(0), }
                    50% { opacity: 1;, transform: scaleX(1), }
                    100% { opacity: 0;, transform: scaleX(1 }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(flashElement);
        
        setTimeout(() => {  if (flashElement.parentNode) { }
                flashElement.parentNode.removeChild(flashElement); }
}, 300);
    }
    
    /**
     * 音声フィードバック
     */
    playAudioFeedback(actionName) {
        // Web Audio APIを使用した簡易音声フィードバック
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            ';

            oscillator.connect(gainNode);''
            gainNode.connect(audioContext.destination);
            ';

            oscillator.frequency.value = 800;''
            oscillator.type = 'sine';
            
            gainNode.gain.value = 0.1;
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start();
    }

            oscillator.stop(audioContext.currentTime + 0.1);' }'

        } catch (error) { console.warn('Audio feedback failed:', error }
    }
    
    /**
     * 設定の適用
     */
    applyConfig(config) {'
        if (config.keyboard) {'
    }

            Object.assign(this.config, config.keyboard); }
        }

        console.log('KeyboardAccessibilityManager, configuration applied);
    }
    
    /**
     * イベントエミッター機能
     */
    emit(event, data) {
        if(this.eventListeners.has(event) {
            this.eventListeners.get(event).forEach(callback => { )
    }
                try {); }
                    callback(data); }
                } catch (error) {
                    console.error(`Error in KeyboardAccessibilityManager event listener for ${event}:`, error);
                }
            });
        }
    }
    
    addEventListener(event: string, callback: Function): void { if(!this.eventListeners.has(event) {
            this.eventListeners.set(event, new Set(); }
        this.eventListeners.get(event).add(callback);
    }
    
    removeEventListener(event: string, callback: Function): void { if(this.eventListeners.has(event) {
            this.eventListeners.get(event).delete(callback); }
    }
    
    /**
     * レポート生成
     */
    generateReport(): KeyboardReport { const customizedShortcuts = Array.from(this.customizations.shortcuts.values().filter(s => s.modified);
        
        return { totalShortcuts: this.customizations.shortcuts.size,
            customizedShortcuts: customizedShortcuts.length;
            currentProfile: this.customizations.currentProfile;
            availableProfiles: this.customizations.profiles.size;
            conflictsCount: this.customizations.conflicts.size,
    lastConflictCheck: this.state.lastConflictCheck, };
            usageStatistics: this.getUsageStatistics(); 
    }
    
    /**
     * 使用統計の取得
     */
    private getUsageStatistics(): UsageStatistics { const stats = {
            mostUsed: [];
            leastUsed: [];
            recentlyModified: [],
    totalUsage: 0 };
        const shortcuts = Array.from(this.customizations.shortcuts.entries();
        
        // 使用回数でソート
        const byUsage = shortcuts;
            .filter(([name, shortcut]) => shortcut.usageCount > 0);
            .sort(([, a], [, b]) => (b.usageCount || 0) - (a.usageCount || 0));
        
        stats.mostUsed = byUsage.slice(0, 5).map(([name, shortcut]) => ({ name,
            usageCount: shortcut.usageCount),
    lastUsed: shortcut.lastUsed ,});
        stats.totalUsage = shortcuts.reduce((sum, [, shortcut]) => sum + (shortcut.usageCount || 0), 0);
        
        // 最近変更されたもの
        stats.recentlyModified = shortcuts;
            .filter(([, shortcut]) => shortcut.modified && shortcut.modifiedAt);
            .sort(([, a], [, b]) => (b.modifiedAt || 0) - (a.modifiedAt || 0));
            .slice(0 5);
            .map(([name shortcut]) => ({ name)
                modifiedAt: shortcut.modifiedAt }');
        return stats;
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled: boolean): void { if (this.keyboardManager && this.keyboardManager.setEnabled') {''
            this.keyboardManager.setEnabled(enabled); }

        }''
        console.log(`KeyboardAccessibilityManager ${enabled ? 'enabled' : 'disabled}`}';
    }
    
    /**
     * クリーンアップ'
     */''
    destroy()';
        console.log('Destroying, KeyboardAccessibilityManager...);
        
        // 記録中の場合は停止
        if (this.state.isRecording) { this.stopShortcutRecording(); }
        
        // 設定を保存
        this.saveConfiguration();
        
        // イベントリスナーのクリア
        this.eventListeners.clear();
        
        // データのクリア
        this.customizations.shortcuts.clear();
        this.customizations.conflicts.clear();''
        this.customizations.profiles.clear()';
        const liveRegion = document.getElementById('keyboard-accessibility-announcements);
        if(liveRegion) {'

            liveRegion.remove()';
        const flashStyles = document.getElementById('shortcut-flash-styles);

        if (flashStyles) {''
            flashStyles.remove();
        }

        console.log('KeyboardAccessibilityManager, destroyed''); }

    }''
}