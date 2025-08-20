import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * ライブリージョン管理クラス
 * リアルタイムスクリーンリーダー通知の包括的な管理を提供
 */
export class LiveRegionManager {'
    '';
    constructor(screenReaderManager') {
        this.screenReaderManager = screenReaderManager;
        this.accessibilityManager = screenReaderManager.accessibilityManager;
        this.gameEngine = this.accessibilityManager? .gameEngine;
        
        // 通知設定'
        this.config = { : undefined''
            enabledRegions: ['polite', 'assertive', 'status', 'log'],';
            priorityLevels: {''
                critical: 'assertive','';
                high: 'assertive','';
                normal: 'polite','';
                low: 'polite',';
    }
    }'
                info: 'status' }
            },
            throttling: { enabled: true,
                interval: 1000, // 1秒間隔;
                maxQueue: 10,
                deduplicationWindow: 3000 // 3秒以内の重複を削除 }
            },
            deduplication: { enabled: true,
                similarity: 0.8, // 80%以上類似で重複判定;
                messageHistory: 20 // 履歴保持数 }
            },'
            languages: { ''
                primary: 'ja','';
                fallback: 'en' }
            },
            accessibility: { respectUserPausedSpeech: true,
                interruptOnUrgent: true,
                verbosityControl: true }
            }
        },
        ';
        // ライブリージョン要素管理''
        this.liveRegions = new Map(''';
            ['polite', { ''
                politeness: 'polite', ';
                atomic: false, '';
                relevant: 'all',']';
                live: 'polite' }]'
            }],''
            ['assertive', { ''
                politeness: 'assertive', ';
                atomic: true, '';
                relevant: 'all',']';
                live: 'assertive' }]'
            }],''
            ['status', { ''
                politeness: 'polite', ';
                atomic: false, '';
                relevant: 'text','';
                live: 'polite',']';
                role: 'status' }]'
            }],''
            ['log', { ''
                politeness: 'polite', ';
                atomic: false, '';
                relevant: 'additions','';
                live: 'polite',']';
                role: 'log' }]'
            }],''
            ['alert', { ')'
                politeness: 'assertive')';
                atomic: true, '';
                relevant: 'all','';
                live: 'assertive',']';
                role: 'alert'];
            )];
        ]),
        
        // 通知キュー管理
        this.messageQueue = [];
        this.processingQueue = false;
        this.messageHistory = [];
        this.activeAnnouncements = new Set();
        
        // スロットリング管理'
        this.throttleTimers = new Map();''
        this.lastAnnouncementTime = new Map(''';
            ['ja', new Map([' }]'
                ['gameStateChange', '{state}に変更されました'],''
                ['scoreUpdate', 'スコアが{score}点になりました'],''
                ['bubblePopped', '{type}バブルをポップしました'],''
                ['comboAchieved', '{combo}コンボ達成！'],''
                ['timeWarning', '残り時間{time}秒です'],''
                ['gameOver', 'ゲーム終了。最終スコア{score}点'],''
                ['levelComplete', 'ステージクリア！'],')';
                ['error', 'エラーが発生しました: { message')'],''
                ['success', '操作が成功しました'],'';
                ['loading', '読み込み中...'],'';
                ['paused', 'ゲームが一時停止されました'],'';
                ['resumed', 'ゲームを再開しました']'';
            ]')],'';
            ['en', new Map([' }]'
                ['gameStateChange', 'Changed to {state}'],''
                ['scoreUpdate', 'Score is now {score}'],''
                ['bubblePopped', 'Popped {type} bubble'],''
                ['comboAchieved', '{combo} combo achieved!'],''
                ['timeWarning', '{time} seconds remaining'],''
                ['gameOver', 'Game over. Final score: {score}'],''
                ['levelComplete', 'Level complete!'],')';
                ['error', 'Error occurred: { message')'],''
                ['success', 'Operation successful'],'';
                ['loading', 'Loading...'],'';
                ['paused', 'Game paused'],'';
                ['resumed', 'Game resumed'];
            ])];
        ]);
        
        // 統計情報
        this.stats = {
            totalAnnouncements: 0,
            announcementsByType: new Map(),
            announcementsByPriority: new Map(),
            duplicatesRemoved: 0,
            throttledMessages: 0,
            queueOverflows: 0,';
            averageProcessingTime: 0,'';
            sessionStart: Date.now(''';
            verbosity: 'normal', // 'minimal', 'normal', 'verbose';
            speed: 1.0,
            pitch: 1.0,
            volume: 1.0,
            pauseOnNavigation: false,
            groupSimilarMessages: true,
            respectGamePause: true })
        })'
        ')';
        console.log('LiveRegionManager initialized');
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            // ライブリージョンの作成
            this.createLiveRegions();
            
            // ユーザー設定の読み込み
            this.loadUserPreferences();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            ';
            // キューの処理開始''
            this.startQueueProcessing('');
    }'
            console.log('LiveRegionManager initialized successfully'); }'
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'LIVE_REGION_ERROR', {')'
                operation: 'initialize'); }
            });
        }
    }
    
    /**
     * ライブリージョンの作成
     */
    createLiveRegions() {'
        for (const [regionName, config] of this.regionConfigs) {''
            if (!this.config.enabledRegions.includes(regionName)') {
    }
                continue; }
            }'
            '';
            const element = document.createElement('div'');'
            element.id = `live-region-${regionName}`;''
            element.className = 'sr-only live-region';
            ';
            // ARIA属性の設定''
            element.setAttribute('aria-live', config.live || config.politeness');''
            element.setAttribute('aria-atomic', config.atomic.toString()');''
            element.setAttribute('aria-relevant', config.relevant);'
            '';
            if(config.role') {'
                ';
            }'
                element.setAttribute('role', config.role'); }
            }
            ';
            // 言語設定''
            element.setAttribute('lang', this.config.languages.primary');
            ';
            // アクセシビリティ強化''
            element.setAttribute('aria-label', `${ regionName)通知領域`);
            
            // DOMに追加
            document.body.appendChild(element);
            this.liveRegions.set(regionName, element);
             }
            console.log(`Created live region: ${regionName)`});
        }
        
        // 視覚的に隠すCSSの追加
        this.addScreenReaderOnlyStyles();
    }
    
    /**
     * スクリーンリーダー専用スタイルの追加'
     */''
    addScreenReaderOnlyStyles('')';
        if (document.querySelector('#live-region-styles')') { return; // 既に追加済み }
        }'
        '';
        const style = document.createElement('style'');''
        style.id = 'live-region-styles';
        style.textContent = `;
            .sr-only { position: absolute !important,
                width: 1px !important,
                height: 1px !important,
                padding: 0 !important,
                margin: -1px !important,
                overflow: hidden !important,
                clip: rect(0, 0, 0, 0) !important,
                white-space: nowrap !important,
                border: 0 !important; }
            }
            
            .live-region { z-index: -1,
                user-select: none,
                pointer-events: none, }
            }
            
            /* デバッグ用（開発時のみ） */
            .debug-live-regions .live-region { position: static !important,
                width: auto !important,
                height: auto !important,
                background: #f0f0f0,
                border: 1px dashed #999,
                padding: 4px,
                margin: 2px,
                font-size: 12px,
                color: #666; }
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * ユーザー設定の読み込み'
     */''
    loadUserPreferences('')';
            const saved = localStorage.getItem('liveRegionManager_preferences');
            if(saved) {
                const preferences = JSON.parse(saved);
            }'
                Object.assign(this.userPreferences, preferences);' }'
            } catch (error') { ''
            console.warn('Failed to load user preferences:', error); }
        }
    }
    
    /**
     * ユーザー設定の保存'
     */''
    saveUserPreferences('')';
            localStorage.setItem('liveRegionManager_preferences');'
                JSON.stringify(this.userPreferences);''
        } catch (error') { ''
            console.warn('Failed to save user preferences:', error); }
        }
    }
    
    /**
     * イベントリスナーの設定'
     */''
    setupEventListeners('')';
        document.addEventListener('visibilitychange', () => {  if (document.hidden) { }
                this.pauseAnnouncements(); }
            } else { this.resumeAnnouncements(); }'
            }''
        }');
        ';
        // ウィンドウフォーカス変更''
        window.addEventListener('blur', () => {  if (this.userPreferences.pauseOnNavigation) { }
                this.pauseAnnouncements(); }'
            }''
        }');'
        '';
        window.addEventListener('focus', () => { this.resumeAnnouncements(); }
        });
        ';
        // Speech Synthesis 状態変更''
        if(window.speechSynthesis') {'
            ';
        }'
            window.speechSynthesis.addEventListener('voiceschanged', (') => { ' }'
                console.log('Available voices changed'); }
            });
        }
    }
    
    /**
     * キューの処理開始
     */
    startQueueProcessing() {
        if (this.processingQueue) {
    }
            return; }
        }
        
        this.processingQueue = true;
        this.processMessageQueue();
    }
    
    /**
     * メッセージキューの処理
     */
    async processMessageQueue() { while (this.processingQueue) {
            if(this.messageQueue.length === 0) {
                await this.sleep(100); // 100ms待機
            }
                continue; }
            }
            
            const message = this.messageQueue.shift();
            if (message) { await this.processMessage(message); }
            }
        }
    }
    
    /**
     * 個別メッセージの処理
     */
    async processMessage(message) { const startTime = performance.now();
        
        try {
            // 重複チェック
            if(this.isDuplicate(message) {
                this.stats.duplicatesRemoved++;
            }
                return; }
            }
            
            // スロットリングチェック
            if(this.shouldThrottle(message) {
                this.stats.throttledMessages++;
            }
                return; }
            }
            
            // 実際の通知実行
            await this.announceMessage(message);
            
            // 履歴に追加
            this.addToHistory(message);
            
            // 統計更新
            this.updateStats(message, performance.now() - startTime);
            ';
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'LIVE_REGION_ERROR', {')'
                operation: 'processMessage',);
                message: message); }
            });
        }
    }
    
    /**
     * メッセージの重複チェック
     */
    isDuplicate(message) {
        if (!this.config.deduplication.enabled) {
    }
            return false; }
        }
        
        const cutoff = Date.now() - this.config.deduplication.deduplicationWindow;
        const recentMessages = this.messageHistory.filter(m => m.timestamp > cutoff);
        
        return recentMessages.some(recent => {  ); }
            return this.calculateSimilarity(message.text, recent.text) >= this.config.deduplication.similarity; }
        });
    }
    
    /**
     * テキストの類似度計算
     */
    calculateSimilarity(text1, text2) {
        if (text1 === text2) return 1.0;
        
        // シンプルなLevenshtein距離ベースの類似度
        const longer = text1.length > text2.length ? text1: text2,
        const shorter = text1.length > text2.length ? text2: text1,
        
        if (longer.length === 0) return 1.0;
        
        const distance = this.levenshteinDistance(longer, shorter);
    }
        return (longer.length - distance) / longer.length; }
    }
    
    /**
     * Levenshtein距離計算
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
    }
            matrix[i] = [i]; }
        }
        
        for (let j = 0; j <= str1.length; j++) { matrix[0][j] = j; }
        }
        
        for(let i = 1; i <= str2.length; i++) {
        
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1) {
        
        }
                    matrix[i][j] = matrix[i - 1][j - 1]; }
                } else {  matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1);
                        matrix[i][j - 1] + 1,) }
                        matrix[i - 1][j] + 1); }
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
    
    /**
     * スロットリングチェック
     */
    shouldThrottle(message) {
        if (!this.config.throttling.enabled) {
    }
            return false; }
        }
        
        const key = `${message.type}_${message.priority}`;
        const lastTime = this.lastAnnouncementTime.get(key) || 0;
        const now = Date.now();
        
        return (now - lastTime) < this.config.throttling.interval;
    }
    
    /**
     * メッセージの通知実行
     */
    async announceMessage(message) { // 適切なライブリージョンの決定
        const regionName = this.selectLiveRegion(message);
        const region = this.liveRegions.get(regionName);
        
        if (!region) { }
            console.warn(`Live region not found: ${regionName)`});
            return;
        }
        
        // メッセージの最終処理
        const finalText = this.processMessageText(message);
        
        // ライブリージョンへの出力
        await this.outputToLiveRegion(region, finalText, message);
        
        // タイムスタンプ更新
        const key = `${message.type}_${message.priority}`;
        this.lastAnnouncementTime.set(key, Date.now();
    }
    
    /**
     * ライブリージョンの選択'
     */''
    selectLiveRegion(message') {'
        // 優先度による選択''
        const priority = message.priority || 'normal';''
        const politeness = this.config.priorityLevels[priority] || 'polite';
        ';
        // 特殊ケースの処理''
        if (message.type === 'error' || priority === 'critical'') {'
    }'
            return 'alert'; }
        }'
        '';
        if(message.type === 'status'') {'
            ';
        }'
            return 'status'; }
        }'
        '';
        if(message.type === 'log'') {'
            ';
        }'
            return 'log'; }
        }
        
        return politeness;
    }
    
    /**
     * メッセージテキストの処理
     */
    processMessageText(message) {
        let text = message.text;
        
        // テンプレート適用
        if (message.template && message.variables) {
    }
            text = this.applyTemplate(message.template, message.variables); }
        }
        
        // 冗長性レベルによる調整
        text = this.adjustVerbosity(text, message);
        
        // 言語固有の処理
        text = this.processLanguageSpecific(text);
        
        return text;
    }
    
    /**
     * テンプレートの適用
     */
    applyTemplate(templateKey, variables) {
        const language = this.config.languages.primary;
        const templates = this.messageTemplates.get(language);
        
        if(!templates || !templates.has(templateKey) {
    }
            return templateKey; // フォールバック }
        }
        
        let template = templates.get(templateKey);
        ';
        // 変数の置換''
        Object.entries(variables).forEach(([key, value]') => {  }'
            const placeholder = `{${key}}`;''
            template = template.replace(new RegExp(placeholder, 'g'), String(value);
        });
        
        return template;
    }
    
    /**
     * 冗長性レベルの調整
     */
    adjustVerbosity(text, message) {
        const verbosity = this.userPreferences.verbosity;'
        '';
        switch (verbosity') {''
            case 'minimal':';
                // 最小限の情報のみ''
                return this.extractEssentialInfo(text');'
                '';
            case 'verbose':';
                // 詳細情報を追加''
                return this.addDetailedInfo(text, message');'
                '';
            case 'normal':;
    }
            default: return text; }
        }
    }
    
    /**
     * 必須情報の抽出
     */
    extractEssentialInfo(text) {'
        // 数値とキーワードのみを抽出''
        const essential = text.match(/\d+|[重要|エラー|完了|開始]/g');'
    }'
        return essential ? essential.join(' ') : text; }
    }
    
    /**
     * 詳細情報の追加
     */
    addDetailedInfo(text, message) {
        let detailed = text;
        ';
        // タイムスタンプ追加'
    }'
        const time = new Date(').toLocaleTimeString('ja-JP');' }'
        detailed += ` (${time}')`;
        ';
        // 優先度情報追加''
        if(message.priority && message.priority !== 'normal') {
            
        }
            detailed += ` [優先度: ${message.priority}]`;
        }
        
        return detailed;
    }
    
    /**
     * 言語固有の処理'
     */''
    processLanguageSpecific(text') {'
        // 日本語特有の処理''
        if (this.config.languages.primary === 'ja') {'
            // 数字の読み上げ改善''
            text = text.replace(/(\d+')点/g, '$1 点');''
            text = text.replace(/(\d+')秒/g, '$1 秒');'
    }'
            text = text.replace(/(\d+')個/g, '$1 個'); }
        }
        
        return text;
    }
    
    /**
     * ライブリージョンへの出力'
     */''
    async outputToLiveRegion(region, text, message') { // 既存のコンテンツをクリア（atomicの場合）''
        const isAtomic = region.getAttribute('aria-atomic'') === 'true';'
        '';
        if(isAtomic') {'
            '';
            region.textContent = '';
        }
            await this.sleep(50); // 短い遅延でスクリーンリーダーに認識させる }
        }
        
        // 新しいコンテンツを設定
        if (isAtomic) { region.textContent = text; }'
        } else {  // 追記モード''
            const timestamp = new Date(').toLocaleTimeString('ja-JP', { ''
                hour: '2-digit', ')';
                minute: '2-digit', ')';
                second: '2-digit' )'),';
            ' }'
            const entry = document.createElement('div'); }
            entry.textContent = `${timestamp}: ${text}`;
            region.appendChild(entry);
            
            // 古いエントリを削除（最大20件）
            while (region.children.length > 20) { region.removeChild(region.firstChild); }
            }
        }
        
        // アクティブな通知として追跡
        this.activeAnnouncements.add({ region: region,)
            text: text),
            timestamp: Date.now(); }
        });
    }
    
    /**
     * 履歴への追加
     */
    addToHistory(message) {
        this.messageHistory.push({)
            ...message);
    }
            timestamp: Date.now(); }
        });
        
        // 履歴サイズ制限
        if (this.messageHistory.length > this.config.deduplication.messageHistory) { this.messageHistory.shift(); }
        }
    }
    
    /**
     * 統計の更新
     */
    updateStats(message, processingTime) {
        this.stats.totalAnnouncements++;
        
        // タイプ別統計
        const typeCount = this.stats.announcementsByType.get(message.type) || 0;
        this.stats.announcementsByType.set(message.type, typeCount + 1);
        
        // 優先度別統計
        const priorityCount = this.stats.announcementsByPriority.get(message.priority) || 0;
        this.stats.announcementsByPriority.set(message.priority, priorityCount + 1);
        
        // 平均処理時間の更新
        const currentAvg = this.stats.averageProcessingTime;
        const totalCount = this.stats.totalAnnouncements;
    }
        this.stats.averageProcessingTime = (currentAvg * (totalCount - 1) + processingTime) / totalCount; }
    }
    
    /**
     * スリープユーティリティ
     */
    sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms); }
    }
    
    // パブリックAPI
    
    /**
     * メッセージの通知'
     */''
    announce(text, options = { )') {
        const message = {'
            text: text,'';
            type: options.type || 'general','';
            priority: options.priority || 'normal',
            template: options.template,
            variables: options.variables,
            region: options.region,
            timestamp: Date.now(),
            id: this.generateMessageId(); }
        };
        
        // キューサイズチェック
        if(this.messageQueue.length >= this.config.throttling.maxQueue) {
            this.stats.queueOverflows++;
            ';
            // 低優先度メッセージを削除''
            const lowPriorityIndex = this.messageQueue.findIndex(m => ');''
                m.priority === 'low' || m.priority === 'info');
            ';
            if (lowPriorityIndex !== -1) {'
        }'
                this.messageQueue.splice(lowPriorityIndex, 1'); }'
            } else {  ''
                console.warn('Message queue overflow, dropping message:', text); }
                return false; }
            }
        }
        
        this.messageQueue.push(message);
        return message.id;
    }
    
    /**
     * テンプレートメッセージの通知'
     */''
    announceTemplate(templateKey, variables, options = { )') {''
        return this.announce('', {)
            ...options);
            template: templateKey,);
            variables: variables); }
    }
    
    /**
     * 緊急メッセージの通知'
     */''
    announceUrgent(text, options = { )') {
        return this.announce(text, {'
            ...options,')';
            priority: 'critical',')';
            type: 'alert'); }
    }
    
    /**
     * ステータスメッセージの通知'
     */''
    announceStatus(text, options = { )') {
        return this.announce(text, {'
            ...options,')';
            type: 'status',')';
            priority: 'normal'); }
    }
    
    /**
     * エラーメッセージの通知
     */
    announceError(error, options = { ) {'
        '';
        const errorText = error instanceof Error ? error.message: String(error'),
        return this.announce(errorText, {'
            ...options,')';
            type: 'error',');
    }'
            priority: 'high'); }
    }
    
    /**
     * 通知の一時停止'
     */''
    pauseAnnouncements('')';
        console.log('Live region announcements paused');
    }
    
    /**
     * 通知の再開
     */
    resumeAnnouncements() {'
        if (!this.processingQueue) {''
            this.startQueueProcessing('');
    }'
            console.log('Live region announcements resumed'); }
        }
    }
    
    /**
     * すべての通知をクリア
     */
    clearAll() {
        this.messageQueue.length = 0;
        this.activeAnnouncements.clear();
        ';
        // すべてのライブリージョンをクリア''
        for (const region of this.liveRegions.values()') {'
    }'
            region.textContent = ''; }
        }
    }
    
    /**
     * 特定のメッセージを取り消し
     */
    cancelMessage(messageId) {
        const index = this.messageQueue.findIndex(m => m.id === messageId);
        if (index !== -1) {
            this.messageQueue.splice(index, 1);
    }
            return true; }
        }
        return false;
    }
    
    /**
     * 設定の適用
     */
    applyConfig(config) {'
        if (config.liveRegion) {'
    }'
            Object.assign(this.config, config.liveRegion'); }
        }'
        '';
        console.log('LiveRegionManager configuration applied');
    }
    
    /**
     * ユーザー設定の更新
     */
    updateUserPreferences(preferences) {'
        Object.assign(this.userPreferences, preferences);''
        this.saveUserPreferences('');
    }'
        console.log('User preferences updated:', preferences); }
    }
    
    /**
     * デバッグモードの切り替え'
     */''
    toggleDebugMode(enabled') {'
        ';
    }'
        document.body.classList.toggle('debug-live-regions', enabled');' }'
        console.log(`Live region debug mode ${enabled ? 'enabled' : 'disabled')`});
    }
    
    /**
     * レポートの生成
     */
    generateReport() {
        return { timestamp: new Date().toISOString(),
            config: {
                enabledRegions: this.config.enabledRegions,
    }
                throttlingEnabled: this.config.throttling.enabled, };
                deduplicationEnabled: this.config.deduplication.enabled }
            },
            stats: { ...this.stats,
                queueSize: this.messageQueue.length,
                activeRegions: this.liveRegions.size,
                memoryUsage: {
                    messageHistory: this.messageHistory.length,
                    activeAnnouncements: this.activeAnnouncements.size }
                }
            },
            userPreferences: this.userPreferences,
            performance: { averageProcessingTime: this.stats.averageProcessingTime,
                messagesPerMinute: this.stats.totalAnnouncements / ;
                    ((Date.now() - this.stats.sessionStart) / 60000), }
            }
        };
    }
    
    /**
     * メッセージIDの生成
     */
    generateMessageId() {
        
    }
        return `msg_${Date.now(})}_${Math.random().toString(36).substr(2, 9})}`;
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled) {
        if (enabled) {
    }
            this.startQueueProcessing(); }'
        } else {  ' }'
            this.pauseAnnouncements('') }'
        console.log(`LiveRegionManager ${enabled ? 'enabled' : 'disabled')`});
    }
    
    /**
     * クリーンアップ'
     */''
    destroy('')';
        console.log('Destroying LiveRegionManager...');
        
        // キューの処理停止
        this.processingQueue = false;
        
        // タイマーのクリア
        for(const timer of this.throttleTimers.values() { clearTimeout(timer); }
        }
        
        // ライブリージョンの削除
        for(const region of this.liveRegions.values() {'
            if (region.parentNode) {'
        }'
                region.parentNode.removeChild(region'); }
            }
        }
        ';
        // スタイルの削除''
        const styleElement = document.querySelector('#live-region-styles');
        if (styleElement) { styleElement.remove(); }
        }
        
        // ユーザー設定の保存
        this.saveUserPreferences();
        
        // データのクリア
        this.messageQueue.length = 0;
        this.messageHistory.length = 0;
        this.liveRegions.clear();
        this.throttleTimers.clear();'
        this.lastAnnouncementTime.clear();''
        this.activeAnnouncements.clear('')';
        console.log('LiveRegionManager destroyed'');'
    }''
}