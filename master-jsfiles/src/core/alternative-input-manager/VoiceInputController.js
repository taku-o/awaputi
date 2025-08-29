/**
 * Voice Input Controller
 * 音声入力制御 - 音声認識とボイスコマンド機能の専門管理
 */
export class VoiceInputController {
    constructor() {
        // 音声制御設定
        this.voiceConfig = {
            enabled: false,
            language: 'ja-JP',
            confidence: 0.7,
            continuousListening: false,
            pushToTalk: true,
            commands: new Map([
                ['クリック', 'click'],
                ['ポップ', 'pop'],
                ['選択', 'select'],
                ['戻る', 'back'],
                ['次へ', 'next'],
                ['メニュー', 'menu'],
                ['ポーズ', 'pause'],
                ['再開', 'resume'],
                ['上', 'up'],
                ['下', 'down'],
                ['左', 'left'],
                ['右', 'right'],
                ['スタート', 'start'],
                ['ストップ', 'stop'],
                ['はい', 'yes'],
                ['いいえ', 'no'],
                ['キャンセル', 'cancel'],
                ['ヘルプ', 'help']
            ])
        };
        
        // 音声認識状態
        this.voiceState = {
            isListening: false,
            recognition: null,
            lastCommand: null,
            commandQueue: [],
            confidence: 0,
            isInitialized: false
        };
        
        // 音声フィードバック
        this.speechSynthesis = null;
        this.voiceList = [];
        this.selectedVoice = null;
        
        // 視覚インターフェース
        this.voiceInterface = null;
        this.microphoneIndicator = null;
        this.commandHistory = null;
        
        // コマンド処理
        this.commandHandlers = new Map();
        this.contextualCommands = new Map();
        this.currentContext = 'default';
        
        // 統計
        this.stats = {
            commandsRecognized: 0,
            commandsExecuted: 0,
            averageConfidence: 0,
            listeningTime: 0,
            sessionStart: Date.now()
        };
        
        console.log('[VoiceInputController] Initialized');
    }
    
    /**
     * 音声入力を初期化
     * @param {Object} config - 設定オブジェクト
     */
    async initializeVoiceInput(config = {}) {
        Object.assign(this.voiceConfig, config.voiceControl || {});
        
        if (!this.voiceConfig.enabled) return;
        
        try {
            await this.setupSpeechRecognition();
            await this.setupSpeechSynthesis();
            this.setupCommandHandlers();
            this.createVoiceInterface();
            
            this.voiceState.isInitialized = true;
            console.log('[VoiceInputController] Voice input initialized');
        } catch (error) {
            console.error('[VoiceInputController] Initialization failed:', error);
        }
    }
    
    /**
     * 音声認識をセットアップ
     */
    async setupSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            throw new Error('Speech recognition not supported');
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.voiceState.recognition = new SpeechRecognition();
        
        const recognition = this.voiceState.recognition;
        
        // 音声認識設定
        recognition.continuous = this.voiceConfig.continuousListening;
        recognition.interimResults = true;
        recognition.lang = this.voiceConfig.language;
        recognition.maxAlternatives = 3;
        
        // イベントハンドラーを設定
        recognition.onstart = () => {
            this.voiceState.isListening = true;
            this.updateMicrophoneIndicator(true);
            this.provideFeedback('listening_started');
            console.log('[VoiceInputController] Speech recognition started');
        };
        
        recognition.onend = () => {
            this.voiceState.isListening = false;
            this.updateMicrophoneIndicator(false);
            this.provideFeedback('listening_stopped');
            console.log('[VoiceInputController] Speech recognition ended');
        };
        
        recognition.onresult = (event) => {
            this.handleSpeechResult(event);
        };
        
        recognition.onerror = (event) => {
            this.handleSpeechError(event);
        };
        
        recognition.onnomatch = () => {
            console.log('[VoiceInputController] No speech match found');
            this.provideFeedback('no_match');
        };
    }
    
    /**
     * 音声合成をセットアップ
     */
    async setupSpeechSynthesis() {
        if (!('speechSynthesis' in window)) {
            console.warn('[VoiceInputController] Speech synthesis not supported');
            return;
        }
        
        this.speechSynthesis = window.speechSynthesis;
        
        // 音声リストを取得
        return new Promise((resolve) => {
            const loadVoices = () => {
                this.voiceList = this.speechSynthesis.getVoices();
                
                // 日本語音声を優先選択
                this.selectedVoice = this.voiceList.find(voice => 
                    voice.lang.startsWith('ja') || voice.lang.includes('JP')
                ) || this.voiceList[0];
                
                console.log(`[VoiceInputController] Selected voice: ${this.selectedVoice?.name || 'default'}`);
                resolve();
            };
            
            if (this.speechSynthesis.getVoices().length > 0) {
                loadVoices();
            } else {
                this.speechSynthesis.onvoiceschanged = loadVoices;
            }
        });
    }
    
    /**
     * コマンドハンドラーをセットアップ
     */
    setupCommandHandlers() {
        // 基本コマンドハンドラー
        this.commandHandlers.set('click', () => this.performClick());
        this.commandHandlers.set('pop', () => this.performPop());
        this.commandHandlers.set('select', () => this.performSelect());
        this.commandHandlers.set('back', () => this.performBack());
        this.commandHandlers.set('next', () => this.performNext());
        this.commandHandlers.set('menu', () => this.showMenu());
        this.commandHandlers.set('pause', () => this.pauseGame());
        this.commandHandlers.set('resume', () => this.resumeGame());
        this.commandHandlers.set('up', () => this.moveUp());
        this.commandHandlers.set('down', () => this.moveDown());
        this.commandHandlers.set('left', () => this.moveLeft());
        this.commandHandlers.set('right', () => this.moveRight());
        this.commandHandlers.set('start', () => this.startAction());
        this.commandHandlers.set('stop', () => this.stopAction());
        this.commandHandlers.set('yes', () => this.confirmAction());
        this.commandHandlers.set('no', () => this.cancelAction());
        this.commandHandlers.set('cancel', () => this.cancelAction());
        this.commandHandlers.set('help', () => this.showHelp());
        
        // コンテキスト固有コマンド
        this.setupContextualCommands();
    }
    
    /**
     * コンテキスト固有コマンドをセットアップ
     */
    setupContextualCommands() {
        // ゲーム中のコマンド
        this.contextualCommands.set('game', new Map([
            ['アイテム', 'use_item'],
            ['アイテム使用', 'use_item'],
            ['スコア', 'show_score'],
            ['時間', 'show_time'],
            ['設定', 'show_settings']
        ]));
        
        // メニューのコマンド
        this.contextualCommands.set('menu', new Map([
            ['新しいゲーム', 'new_game'],
            ['続きから', 'continue_game'],
            ['設定', 'settings'],
            ['ヘルプ', 'help'],
            ['終了', 'exit']
        ]));
        
        // 設定画面のコマンド
        this.contextualCommands.set('settings', new Map([
            ['音量', 'volume'],
            ['音声設定', 'voice_settings'],
            ['画面設定', 'display_settings'],
            ['保存', 'save_settings'],
            ['リセット', 'reset_settings']
        ]));
    }
    
    /**
     * 音声インターフェースを作成
     */
    createVoiceInterface() {
        this.createMicrophoneIndicator();
        this.createCommandHistory();
        this.createVoiceControlPanel();
    }
    
    /**
     * マイクインジケーターを作成
     */
    createMicrophoneIndicator() {
        if (this.microphoneIndicator) {
            this.microphoneIndicator.remove();
        }
        
        this.microphoneIndicator = document.createElement('div');
        this.microphoneIndicator.className = 'microphone-indicator';
        this.microphoneIndicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid #ccc;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10005;
            cursor: pointer;
            transition: all 0.3s ease;
        `;
        
        // マイクアイコン
        this.microphoneIndicator.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
        `;
        
        // クリックイベント
        this.microphoneIndicator.addEventListener('click', () => {
            this.toggleListening();
        });
        
        document.body.appendChild(this.microphoneIndicator);
    }
    
    /**
     * コマンド履歴を作成
     */
    createCommandHistory() {
        if (this.commandHistory) {
            this.commandHistory.remove();
        }
        
        this.commandHistory = document.createElement('div');
        this.commandHistory.className = 'command-history';
        this.commandHistory.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            width: 200px;
            max-height: 150px;
            background: rgba(0, 0, 0, 0.8);
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 10px;
            color: white;
            font-size: 12px;
            overflow-y: auto;
            z-index: 10004;
            display: none;
        `;
        
        document.body.appendChild(this.commandHistory);
    }
    
    /**
     * 音声制御パネルを作成
     */
    createVoiceControlPanel() {
        if (this.voiceInterface) {
            this.voiceInterface.remove();
        }
        
        this.voiceInterface = document.createElement('div');
        this.voiceInterface.className = 'voice-control-panel';
        this.voiceInterface.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 250px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #444;
            border-radius: 12px;
            padding: 15px;
            color: white;
            z-index: 10003;
            display: none;
        `;
        
        this.voiceInterface.innerHTML = `
            <h3 style="margin: 0 0 10px 0; font-size: 14px;">音声コマンド</h3>
            <div class="command-list" style="font-size: 11px; line-height: 1.4;"></div>
            <div class="voice-status" style="margin-top: 10px; font-size: 10px; color: #aaa;"></div>
        `;
        
        document.body.appendChild(this.voiceInterface);
        this.updateVoiceInterface();
    }
    
    /**
     * 音声認識結果を処理
     * @param {SpeechRecognitionEvent} event - 認識結果イベント
     */
    handleSpeechResult(event) {
        const results = event.results;
        const latestResult = results[results.length - 1];
        
        if (latestResult.isFinal) {
            const transcript = latestResult[0].transcript.trim();
            const confidence = latestResult[0].confidence;
            
            this.stats.commandsRecognized++;
            this.stats.averageConfidence = 
                (this.stats.averageConfidence + confidence) / 2;
            
            console.log(`[VoiceInputController] Recognized: "${transcript}" (${(confidence * 100).toFixed(1)}%)`);
            
            if (confidence >= this.voiceConfig.confidence) {
                this.processVoiceCommand(transcript, confidence);
            } else {
                console.log('[VoiceInputController] Low confidence, command ignored');
                this.provideFeedback('low_confidence');
            }
            
            this.updateCommandHistory(transcript, confidence);
        }
    }
    
    /**
     * 音声認識エラーを処理
     * @param {SpeechRecognitionError} event - エラーイベント
     */
    handleSpeechError(event) {
        console.error('[VoiceInputController] Speech recognition error:', event.error);
        
        switch (event.error) {
            case 'no-speech':
                this.provideFeedback('no_speech');
                break;
            case 'audio-capture':
                this.provideFeedback('microphone_error');
                break;
            case 'not-allowed':
                this.provideFeedback('permission_denied');
                break;
            case 'network':
                this.provideFeedback('network_error');
                break;
            default:
                this.provideFeedback('recognition_error');
        }
    }
    
    /**
     * 音声コマンドを処理
     * @param {string} transcript - 認識されたテキスト
     * @param {number} confidence - 信頼度
     */
    processVoiceCommand(transcript, confidence) {
        this.voiceState.lastCommand = transcript;
        this.voiceState.confidence = confidence;
        
        // コマンドマッピング
        const command = this.mapTranscriptToCommand(transcript);
        
        if (command) {
            this.executeCommand(command, transcript);
        } else {
            console.log('[VoiceInputController] Unknown command:', transcript);
            this.provideFeedback('unknown_command');
            this.speakResponse(`コマンド「${transcript}」は認識できませんでした。`);
        }
    }
    
    /**
     * テキストをコマンドにマッピング
     * @param {string} transcript - 認識されたテキスト
     * @returns {string|null} コマンド名
     */
    mapTranscriptToCommand(transcript) {
        const normalizedTranscript = transcript.toLowerCase().trim();
        
        // 基本コマンドをチェック
        for (const [phrase, command] of this.voiceConfig.commands) {
            if (normalizedTranscript.includes(phrase.toLowerCase())) {
                return command;
            }
        }
        
        // コンテキスト固有コマンドをチェック
        const contextCommands = this.contextualCommands.get(this.currentContext);
        if (contextCommands) {
            for (const [phrase, command] of contextCommands) {
                if (normalizedTranscript.includes(phrase.toLowerCase())) {
                    return command;
                }
            }
        }
        
        // 部分マッチング
        return this.findPartialMatch(normalizedTranscript);
    }
    
    /**
     * 部分マッチングでコマンドを検索
     * @param {string} transcript - 認識されたテキスト
     * @returns {string|null} コマンド名
     */
    findPartialMatch(transcript) {
        const allCommands = new Map([
            ...this.voiceConfig.commands,
            ...(this.contextualCommands.get(this.currentContext) || new Map())
        ]);
        
        for (const [phrase, command] of allCommands) {
            if (this.calculateSimilarity(transcript, phrase.toLowerCase()) > 0.7) {
                return command;
            }
        }
        
        return null;
    }
    
    /**
     * 文字列の類似度を計算
     * @param {string} str1 - 文字列1
     * @param {string} str2 - 文字列2
     * @returns {number} 類似度 (0-1)
     */
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1;
        
        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }
    
    /**
     * レーベンシュタイン距離を計算
     * @param {string} str1 - 文字列1
     * @param {string} str2 - 文字列2
     * @returns {number} 編集距離
     */
    levenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
        
        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
        
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + indicator
                );
            }
        }
        
        return matrix[str2.length][str1.length];
    }
    
    /**
     * コマンドを実行
     * @param {string} command - コマンド名
     * @param {string} originalTranscript - 元のテキスト
     */
    executeCommand(command, originalTranscript) {
        const handler = this.commandHandlers.get(command);
        
        if (handler) {
            try {
                handler();
                this.stats.commandsExecuted++;
                console.log(`[VoiceInputController] Executed command: ${command}`);
                this.provideFeedback('command_executed', { command });
            } catch (error) {
                console.error(`[VoiceInputController] Command execution failed:`, error);
                this.provideFeedback('command_failed');
            }
        } else {
            console.warn(`[VoiceInputController] No handler for command: ${command}`);
            this.provideFeedback('no_handler');
        }
    }
    
    // ========================================
    // コマンドハンドラー実装
    // ========================================
    
    performClick() { this.speakResponse('クリックしました'); }
    performPop() { this.speakResponse('ポップしました'); }
    performSelect() { this.speakResponse('選択しました'); }
    performBack() { this.speakResponse('戻ります'); }
    performNext() { this.speakResponse('次に進みます'); }
    showMenu() { this.speakResponse('メニューを表示します'); }
    pauseGame() { this.speakResponse('ゲームを一時停止しました'); }
    resumeGame() { this.speakResponse('ゲームを再開しました'); }
    moveUp() { this.speakResponse('上に移動'); }
    moveDown() { this.speakResponse('下に移動'); }
    moveLeft() { this.speakResponse('左に移動'); }
    moveRight() { this.speakResponse('右に移動'); }
    startAction() { this.speakResponse('開始しました'); }
    stopAction() { this.speakResponse('停止しました'); }
    confirmAction() { this.speakResponse('はい'); }
    cancelAction() { this.speakResponse('キャンセルしました'); }
    showHelp() { this.speakResponse('ヘルプを表示します'); }
    
    /**
     * 音声応答を再生
     * @param {string} text - 応答テキスト
     */
    speakResponse(text) {
        if (!this.speechSynthesis || !this.selectedVoice) return;
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.selectedVoice;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        this.speechSynthesis.speak(utterance);
    }
    
    /**
     * リスニングを切り替え
     */
    toggleListening() {
        if (this.voiceState.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }
    
    /**
     * リスニングを開始
     */
    startListening() {
        if (!this.voiceState.recognition || this.voiceState.isListening) return;
        
        try {
            this.voiceState.recognition.start();
        } catch (error) {
            console.error('[VoiceInputController] Failed to start listening:', error);
        }
    }
    
    /**
     * リスニングを停止
     */
    stopListening() {
        if (!this.voiceState.recognition || !this.voiceState.isListening) return;
        
        try {
            this.voiceState.recognition.stop();
        } catch (error) {
            console.error('[VoiceInputController] Failed to stop listening:', error);
        }
    }
    
    /**
     * マイクインジケーターを更新
     * @param {boolean} isListening - リスニング中かどうか
     */
    updateMicrophoneIndicator(isListening) {
        if (!this.microphoneIndicator) return;
        
        if (isListening) {
            this.microphoneIndicator.style.background = 'rgba(255, 0, 0, 0.8)';
            this.microphoneIndicator.style.borderColor = '#ff4444';
            this.microphoneIndicator.style.animation = 'pulse 1s infinite';
        } else {
            this.microphoneIndicator.style.background = 'rgba(0, 0, 0, 0.7)';
            this.microphoneIndicator.style.borderColor = '#ccc';
            this.microphoneIndicator.style.animation = 'none';
        }
    }
    
    /**
     * コマンド履歴を更新
     * @param {string} transcript - 認識されたテキスト
     * @param {number} confidence - 信頼度
     */
    updateCommandHistory(transcript, confidence) {
        if (!this.commandHistory) return;
        
        const entry = document.createElement('div');
        entry.style.cssText = `
            margin-bottom: 5px;
            padding: 3px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
        `;
        entry.innerHTML = `
            <div>${transcript}</div>
            <div style="font-size: 10px; color: #aaa;">${(confidence * 100).toFixed(1)}%</div>
        `;
        
        this.commandHistory.appendChild(entry);
        
        // 履歴サイズを制限
        const entries = this.commandHistory.children;
        if (entries.length > 5) {
            this.commandHistory.removeChild(entries[0]);
        }
        
        this.commandHistory.style.display = 'block';
        
        // 自動的に隠す
        setTimeout(() => {
            if (this.commandHistory) {
                this.commandHistory.style.display = 'none';
            }
        }, 3000);
    }
    
    /**
     * 音声インターフェースを更新
     */
    updateVoiceInterface() {
        if (!this.voiceInterface) return;
        
        const commandList = this.voiceInterface.querySelector('.command-list');
        const voiceStatus = this.voiceInterface.querySelector('.voice-status');
        
        if (commandList) {
            const contextCommands = this.contextualCommands.get(this.currentContext);
            const commands = Array.from(this.voiceConfig.commands.keys())
                .concat(contextCommands ? Array.from(contextCommands.keys()) : []);
            
            commandList.innerHTML = commands.slice(0, 8).map(cmd => 
                `<div>• ${cmd}</div>`
            ).join('');
        }
        
        if (voiceStatus) {
            voiceStatus.textContent = `Context: ${this.currentContext} | Commands: ${this.stats.commandsExecuted}`;
        }
    }
    
    /**
     * コンテキストを設定
     * @param {string} context - コンテキスト名
     */
    setContext(context) {
        this.currentContext = context;
        this.updateVoiceInterface();
        console.log(`[VoiceInputController] Context changed to: ${context}`);
    }
    
    /**
     * フィードバックを提供
     * @param {string} type - フィードバックタイプ
     * @param {Object} data - 追加データ
     */
    provideFeedback(type, data = {}) {
        // 視覚・音響フィードバック（実装省略）
        console.log(`[VoiceInputController] Feedback: ${type}`, data);
    }
    
    /**
     * 統計情報を取得
     * @returns {Object} 統計情報
     */
    getStats() {
        return {
            ...this.stats,
            isListening: this.voiceState.isListening,
            isInitialized: this.voiceState.isInitialized,
            currentContext: this.currentContext,
            lastCommand: this.voiceState.lastCommand,
            confidence: this.voiceState.confidence
        };
    }
    
    /**
     * 設定を更新
     * @param {Object} newConfig - 新しい設定
     */
    updateConfig(newConfig) {
        Object.assign(this.voiceConfig, newConfig);
        
        if (this.voiceState.recognition) {
            this.voiceState.recognition.lang = this.voiceConfig.language;
            this.voiceState.recognition.continuous = this.voiceConfig.continuousListening;
        }
        
        console.log('[VoiceInputController] Configuration updated');
    }
    
    /**
     * リソースをクリーンアップ
     */
    cleanup() {
        this.stopListening();
        
        [this.microphoneIndicator, this.commandHistory, this.voiceInterface].forEach(element => {
            if (element) {
                element.remove();
            }
        });
        
        this.microphoneIndicator = null;
        this.commandHistory = null;
        this.voiceInterface = null;
        
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();
        }
        
        console.log('[VoiceInputController] Cleaned up');
    }
}