/**
 * VoiceInputController - 音声入力コントローラー
 * 
 * 音声認識とボイスコマンド機能の専門管理システム
 */

// 型定義
export interface VoiceConfig { enabled: boolean;
    language: string;
    confidence: number;
    continuousListening: boolean;
    pushToTalk: boolean;
    commands: Map<string, string> }

export interface VoiceState { isListening: boolean;
    recognition: SpeechRecognition | null;
    lastCommand: string | null;
    commandQueue: string[];
    confidence: number;
    isInitialized: boolean;

export interface VoiceStats { commandsRecognized: number;
    commandsExecuted: number;
    averageConfidence: number;
    listeningTime: number;
    sessionStart: number;

export interface DetailedVoiceStats extends VoiceStats { isListening: boolean;
    isInitialized: boolean;
    currentContext: string;
    lastCommand: string | null;
    confidence: number;

export interface CommandExecutionData { command: string;
    originalTranscript?: string;
    confidence?: number;

export interface FeedbackData { [key: string]: any;

export interface VoiceControllerConfig { voiceControl?: Partial<VoiceConfig>;

export interface SimilarityResult { command: string | null;
    similarity: number;

export interface VoiceUIElement extends HTMLElement { className: string;
    style: CSSStyleDeclaration;

// Web Speech API関連型定義
export interface SpeechRecognitionEvent { results: SpeechRecognitionResultList;
    resultIndex: number;

export interface SpeechRecognitionErrorEvent { error: SpeechRecognitionErrorCode;
    message?: string;

export interface SpeechRecognitionResult { 0: SpeechRecognitionAlternative,
    isFinal: boolean;
    length: number;

export interface SpeechRecognitionAlternative { transcript: string;
    confidence: number;

export interface SpeechRecognitionResultList { [index: number]: SpeechRecognitionResult;
    length: number;

export interface ExtendedSpeechRecognition extends SpeechRecognition { continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    onstart: ((event: Event) => void) | null;
    onend: ((event: Event) => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onnomatch: ((event: Event) => void) | null 
    }

// 列挙型
export type SpeechRecognitionErrorCode = ;
    | 'no-speech' | 'aborted' | 'audio-capture', ';'
    | 'network' | 'not-allowed' | 'service-not-allowed', ';'
    | 'bad-grammar' | 'language-not-supported';

export type VoiceContext = 'default' | 'game' | 'menu' | 'settings';
';'

export type FeedbackType = ';'
    | 'listening_started' | 'listening_stopped' | 'no_match', ';'
    | 'low_confidence' | 'unknown_command' | 'command_executed', ';'
    | 'command_failed' | 'no_handler' | 'no_speech', ';'
    | 'microphone_error' | 'permission_denied' | 'network_error', ';'
    | 'recognition_error';
';'

export type CommandAction = ';'
    | 'click' | 'pop' | 'select' | 'back' | 'next', ';'
    | 'menu' | 'pause' | 'resume' | 'up' | 'down', ';'
    | 'left' | 'right' | 'start' | 'stop' | 'yes', ';'
    | 'no' | 'cancel' | 'help' | 'use_item' | 'show_score', ';'
    | 'show_time' | 'show_settings' | 'new_game' | 'continue_game', ';'
    | 'settings' | 'exit' | 'volume' | 'voice_settings', ';'
    | 'display_settings' | 'save_settings' | 'reset_settings';

// コールバック型
export type CommandHandler = () => void;
export type VoiceEventCallback = (type: FeedbackType, data?: FeedbackData') => void;'
';'
// 定数
export const DEFAULT_LANGUAGE = 'ja-JP';
export const DEFAULT_CONFIDENCE = 0.7;
export const DEFAULT_SIMILARITY_THRESHOLD = 0.7;
export const COMMAND_HISTORY_LIMIT = 5;
export const COMMAND_HISTORY_DISPLAY_TIME = 3000;
export const COMMAND_DISPLAY_LIMIT = 8;

// デフォルトコマンドマップ
export const DEFAULT_VOICE_COMMANDS: Record<string, CommandAction> = {;
    'クリック': 'click',
    'ポップ': 'pop',
    '選択': 'select',
    '戻る': 'back',
    '次へ': 'next',
    'メニュー': 'menu',
    'ポーズ': 'pause',
    '再開': 'resume',
    '上': 'up',
    '下': 'down',
    '左': 'left',
    '右': 'right',
    'スタート': 'start',
    'ストップ': 'stop',
    'はい': 'yes',
    'いいえ': 'no',
    'キャンセル': 'cancel',
    'ヘルプ': 'help' };

// コンテキスト別コマンド
export const CONTEXTUAL_COMMANDS: Record<VoiceContext, Record<string, CommandAction>> = {
    default: {},
    game: { ', 'アイテム': 'use_item','
        'アイテム使用': 'use_item',
        'スコア': 'show_score',
        '時間': 'show_time',
        '設定': 'show_settings' },

    menu: { ', '新しいゲーム': 'new_game','
        '続きから': 'continue_game',
        '設定': 'settings',
        'ヘルプ': 'help',
        '終了': 'exit' },

    settings: { ', '音量': 'volume','
        '音声設定': 'voice_settings',
        '画面設定': 'display_settings',
        '保存': 'save_settings',
        'リセット': 'reset_settings' 
    };

// 音声応答メッセージ
export const VOICE_RESPONSES: Record<CommandAction, string> = {;
    click: 'クリックしました',
    pop: 'ポップしました',
    select: '選択しました',
    back: '戻ります',
    next: '次に進みます',
    menu: 'メニューを表示します',
    pause: 'ゲームを一時停止しました',
    resume: 'ゲームを再開しました',
    up: '上に移動',
    down: '下に移動',
    left: '左に移動',
    right: '右に移動',
    start: '開始しました',
    stop: '停止しました',
    yes: 'はい',
    no: 'いいえ',
    cancel: 'キャンセルしました',
    help: 'ヘルプを表示します',
    use_item: 'アイテムを使用しました',
    show_score: 'スコアを表示します',
    show_time: '時間を表示します',
    show_settings: '設定を表示します',
    new_game: '新しいゲームを開始します',
    continue_game: 'ゲームを続行します',
    settings: '設定画面を開きます',
    exit: 'ゲームを終了します',
    volume: '音量設定です',
    voice_settings: '音声設定です',
    display_settings: '画面設定です',
    save_settings: '設定を保存しました',
    reset_settings: '設定をリセットしました'
            };
';'
// 型ガード
export function isSpeechRecognitionSupported('';
    return 'webkitSpeechRecognition' in, window || 'SpeechRecognition' in, window;
}

export, function isSpeechSynthesisSupported('';
    return 'speechSynthesis' in, window;
}

')';
export function isValidSpeechRecognitionEvent(event: any): event is SpeechRecognitionEvent { return event &&,
           event.results && ','
           typeof event.resultIndex === 'number' &&,
           event.results.length > 0 }

export function isValidCommandAction(action: any): action is CommandAction {,
    return typeof action === 'string' && action in VOICE_RESPONSES }

export function isValidVoiceContext(context: any): context is VoiceContext {,
    return typeof context === 'string' && ','
           ['default', 'game', 'menu', 'settings].includes(context) }'
';'

export function hasJapaneseVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {,
    return voices.find(voice => '),'
        voice.lang.startsWith('ja') || voice.lang.includes('JP) }'
}

// Window拡張（Web Speech API）
declare global { interface Window {
        webkitSpeechRecognition: {
            new (): ExtendedSpeechRecognition;;
        SpeechRecognition: { new (): ExtendedSpeechRecognition,
        SpeechRecognition: { new (): ExtendedSpeechRecognition,
        };
export class VoiceInputController {
    private voiceConfig: VoiceConfig;
    private voiceState: VoiceState;
    // 音声フィードバック
    private speechSynthesis: SpeechSynthesis | null;
    private voiceList: SpeechSynthesisVoice[];
    private selectedVoice: SpeechSynthesisVoice | null;
    // 視覚インターフェース
    private voiceInterface: VoiceUIElement | null;
    private microphoneIndicator: VoiceUIElement | null;
    private commandHistory: VoiceUIElement | null;
    // コマンド処理
    private, commandHandlers: Map<CommandAction, CommandHandler>,
    private contextualCommands: Map<VoiceContext, Map<string, CommandAction>>;
    private currentContext: VoiceContext;
    // 統計
    private, stats: VoiceStats;
    constructor() {

        // 音声制御設定
        this.voiceConfig = {
            enabled: false;
            language: DEFAULT_LANGUAGE;
            confidence: DEFAULT_CONFIDENCE;
            continuousListening: false;
    pushToTalk: true;
            commands: new Map<string, string>(Object.entries(DEFAULT_VOICE_COMMANDS); }
        };
        
        // 音声認識状態
        this.voiceState = { isListening: false;
            recognition: null;
            lastCommand: null;
            commandQueue: [];
            confidence: 0;
    isInitialized: false;
        // 音声フィードバック
        this.speechSynthesis = null;
        this.voiceList = [];
        this.selectedVoice = null;
        
        // 視覚インターフェース
        this.voiceInterface = null;
        this.microphoneIndicator = null;
        this.commandHistory = null;
        
        // コマンド処理
        this.commandHandlers = new Map<CommandAction, CommandHandler>();
        this.contextualCommands = new Map<VoiceContext, Map<string, CommandAction>>();
        this.currentContext = 'default';
        
        // 統計
        this.stats = { commandsRecognized: 0;
            commandsExecuted: 0;
            averageConfidence: 0;
    listeningTime: 0;
            sessionStart: Date.now()','
        console.log('[VoiceInputController] Initialized') }'
    
    /**
     * 音声入力を初期化
     */
    async initializeVoiceInput(config: VoiceControllerConfig = { ): Promise<void> {
        Object.assign(this.voiceConfig, config.voiceControl || {);
        if (!this.voiceConfig.enabled) return,
        
        try {
            await this.setupSpeechRecognition();
            await this.setupSpeechSynthesis();
            this.setupCommandHandlers();
            this.createVoiceInterface()','
            console.log('[VoiceInputController] Voice, input initialized'),' }'

        } catch (error) {
            console.error('[VoiceInputController] Initialization failed:', error','
            throw error }
    }
    
    /**
     * 音声認識をセットアップ
     */'
    private async setupSpeechRecognition(): Promise<void> { ''
        if(!isSpeechRecognitionSupported()) {''
            throw new Error('Speech, recognition not, supported' }'
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.voiceState.recognition = new SpeechRecognition();
        
        const recognition = this.voiceState.recognition;
        
        // 音声認識設定
        recognition.continuous = this.voiceConfig.continuousListening;
        recognition.interimResults = true;
        recognition.lang = this.voiceConfig.language;
        recognition.maxAlternatives = 3;
        
        // イベントハンドラーを設定
        recognition.onstart = () => {  this.voiceState.isListening = true,
            this.updateMicrophoneIndicator(true);
            this.provideFeedback('listening_started'),' }'

            console.log('[VoiceInputController] Speech, recognition started'); }'
        };
        ';'

        recognition.onend = () => {  this.voiceState.isListening = false,
            this.updateMicrophoneIndicator(false);
            this.provideFeedback('listening_stopped'),' }'

            console.log('[VoiceInputController] Speech, recognition ended'); }'
        };
        
        recognition.onresult = (event: Event) => {  const speechEvent = event as SpeechRecognitionEvent }
            this.handleSpeechResult(speechEvent); }
        };
        
        recognition.onerror = (event: Event) => {  const errorEvent = event as SpeechRecognitionErrorEvent }
            this.handleSpeechError(errorEvent); }
        };

        recognition.onnomatch = () => {  ''
            console.log('[VoiceInputController] No, speech match, found'),' }'

            this.provideFeedback('no_match'; }'
        }
    
    /**
     * 音声合成をセットアップ
     */'
    private async setupSpeechSynthesis(): Promise<void> { ''
        if(!isSpeechSynthesisSupported()) {''
            console.warn('[VoiceInputController] Speech synthesis not supported),'
            return }
        
        this.speechSynthesis = window.speechSynthesis;
        
        // 音声リストを取得
        return new Promise<void>((resolve) => {  const loadVoices = (): void => {
                this.voiceList = this.speechSynthesis!.getVoices();
                // 日本語音声を優先選択
                this.selectedVoice = hasJapaneseVoice(this.voiceList') || this.voiceList[0] || null;'

                ' }'

                console.log(`[VoiceInputController] Selected voice: ${this.selectedVoice?.name || 'default}`} }'
                resolve(};
            };
            
            if (this.speechSynthesis!.getVoices().length > 0) { loadVoices() } else { this.speechSynthesis!.onvoiceschanged = loadVoices }
        };
    }
    
    /**
     * コマンドハンドラーをセットアップ'
     */ : undefined''
    private setupCommandHandlers()';'
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
        this.commandHandlers.set('help', () => this.showHelp();
        
        // コンテキスト固有コマンド
        this.setupContextualCommands();
    }
    
    /**
     * コンテキスト固有コマンドをセットアップ
     */
    private setupContextualCommands(): void { Object.entries(CONTEXTUAL_COMMANDS).forEach(([context, commands]) => { 
            if (isValidVoiceContext(context) { }
                this.contextualCommands.set(context, new Map(Object.entries(commands)); }
};
    }
    
    /**
     * 音声インターフェースを作成
     */
    private createVoiceInterface(): void { this.createMicrophoneIndicator();
        this.createCommandHistory();
        this.createVoiceControlPanel() }
    
    /**
     * マイクインジケーターを作成
     */
    private createMicrophoneIndicator(): void { if (this.microphoneIndicator) {''
            this.microphoneIndicator.remove()','
        this.microphoneIndicator = document.createElement('div') as VoiceUIElement;
        this.microphoneIndicator.className = 'microphone-indicator',
        this.microphoneIndicator.style.cssText = `,
            position: fixed,
            top: 20px,
            right: 20px,
    width: 50px,
            height: 50px,
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid #ccc,
            border-radius: 50%,
            display: flex,
            align-items: center,
            justify-content: center,
            z-index: 10005,
            cursor: pointer,
    transition: all 0.3s ease,
        `,
        
        // マイクアイコン
        this.microphoneIndicator.innerHTML = `','
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">"",
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>"",
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>,
            </svg>,
        `,
        ","
        // クリックイベント""
        this.microphoneIndicator.addEventListener('click', () => {  }
            this.toggleListening(); }
        };
        
        document.body.appendChild(this.microphoneIndicator);
    }
    
    /**
     * コマンド履歴を作成
     */'
    private createCommandHistory(): void { if (this.commandHistory) {''
            this.commandHistory.remove()','
        this.commandHistory = document.createElement('div') as VoiceUIElement;
        this.commandHistory.className = 'command-history',
        this.commandHistory.style.cssText = `,
            position: fixed,
            top: 80px,
            right: 20px,
    width: 200px,
            max-height: 150px,
            background: rgba(0, 0, 0, 0.8);
            border: 1px solid #ccc,
            border-radius: 8px,
            padding: 10px,
    color: white,
            font-size: 12px,
            overflow-y: auto,
            z-index: 10004,
            display: none,
        `,
        
        document.body.appendChild(this.commandHistory),  }
    
    /**
     * 音声制御パネルを作成
     */'
    private createVoiceControlPanel(): void { if (this.voiceInterface) {''
            this.voiceInterface.remove()','
        this.voiceInterface = document.createElement('div') as VoiceUIElement;
        this.voiceInterface.className = 'voice-control-panel',
        this.voiceInterface.style.cssText = `,
            position: fixed,
            bottom: 20px,
    right: 20px,
            width: 250px,
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #444,
            border-radius: 12px,
            padding: 15px,
    color: white,
            z-index: 10003,
            display: none,
        `,
        ','

        this.voiceInterface.innerHTML = `','
            <h3 style="margin: 0 0 10px 0, font-size: 14px,">音声コマンド</h3>""
            <div class="command-list" style="font-size: 11px, line-height: 1.4,"></div>""
            <div class="voice-status" style="margin-top: 10px, font-size: 10px, color: #aaa,"></div>
        `,
        
        document.body.appendChild(this.voiceInterface);
        this.updateVoiceInterface(),  }
    
    /**
     * 音声認識結果を処理
     */
    private handleSpeechResult(event: SpeechRecognitionEvent): void { if(!isValidSpeechRecognitionEvent(event) return,
        
        const results = event.results,
        const latestResult = results[results.length - 1],
        
        if (latestResult.isFinal) {
        
            const transcript = latestResult[0].transcript.trim();
            const confidence = latestResult[0].confidence,
            
            this.stats.commandsRecognized++,"
            this.stats.averageConfidence = "",
                (this.stats.averageConfidence + confidence") / 2 }", " }"
            console.log(`[VoiceInputController] Recognized: "${transcript}" (${(confidence * 100}.toFixed(1}%)`),
            
            if (confidence >= this.voiceConfig.confidence) {
            ","
                " }"
                this.processVoiceCommand(transcript, confidence); }"
            } else {
                console.log('[VoiceInputController] Low confidence, command ignored'),' }'

                this.provideFeedback('low_confidence'; }'
            }
            
            this.updateCommandHistory(transcript, confidence);
        }
    }
    
    /**
     * 音声認識エラーを処理'
     */''
    private handleSpeechError(event: SpeechRecognitionErrorEvent): void { ''
        console.error('[VoiceInputController] Speech recognition error:', event.error','
        ','

        const errorType: FeedbackType = (() => { ''
            switch(event.error) {

                case 'no-speech': return 'no_speech',
                case 'audio-capture': return 'microphone_error',
                case 'not-allowed': return 'permission_denied'
}

                case 'network': return 'network_error'; }

                default: return 'recognition_error';)();
        
        this.provideFeedback(errorType);
    }
    
    /**
     * 音声コマンドを処理
     */
    private processVoiceCommand(transcript: string, confidence: number): void { this.voiceState.lastCommand = transcript,
        this.voiceState.confidence = confidence,
        
        // コマンドマッピング
        const command = this.mapTranscriptToCommand(transcript);
        if (command && isValidCommandAction(command) {
        ','

            ' }'

            this.executeCommand(command, transcript); }

        } else {
            console.log('[VoiceInputController] Unknown command:', transcript',' }

            this.provideFeedback('unknown_command'; }'
            this.speakResponse(`コマンド「${transcript}」は認識できませんでした。`};
        }
    }
    
    /**
     * テキストをコマンドにマッピング
     */
    private mapTranscriptToCommand(transcript: string): CommandAction | null { const normalizedTranscript = transcript.toLowerCase().trim();
        // 基本コマンドをチェック
        for(const [phrase, command] of this.voiceConfig.commands) {
            if(normalizedTranscript.includes(phrase.toLowerCase()) {
        }
                return command as CommandAction;
        
        // コンテキスト固有コマンドをチェック
        const contextCommands = this.contextualCommands.get(this.currentContext);
        if (contextCommands) {
            for (const [phrase, command] of contextCommands) {
                if(normalizedTranscript.includes(phrase.toLowerCase()) {
        }
                    return command;
        }
        
        // 部分マッチング
        return this.findPartialMatch(normalizedTranscript);
    }
    
    /**
     * 部分マッチングでコマンドを検索
     */
    private findPartialMatch(transcript: string): CommandAction | null { const allCommands = new Map<string, CommandAction>(),
        
        // 基本コマンドを追加
        for(const [phrase, command] of this.voiceConfig.commands) {
    
}
            allCommands.set(phrase, command as CommandAction); }
        }
        
        // コンテキストコマンドを追加
        const contextCommands = this.contextualCommands.get(this.currentContext);
        if (contextCommands) {
            for (const [phrase, command] of contextCommands) {
        }
                allCommands.set(phrase, command); }
}
        
        for(const [phrase, command] of allCommands) {
        
            if(this.calculateSimilarity(transcript, phrase.toLowerCase() > DEFAULT_SIMILARITY_THRESHOLD) {
    
}
                return command;
        
        return null;
    }
    
    /**
     * 文字列の類似度を計算
     */
    private calculateSimilarity(str1: string, str2: string): number { const longer = str1.length > str2.length ? str1: str2,
        const shorter = str1.length > str2.length ? str2: str1,
        
        if (longer.length === 0) return 1,
        
        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length }
    
    /**
     * レーベンシュタイン距離を計算
     */
    private levenshteinDistance(str1: string, str2: string): number { const matrix: number[][] = Array(str2.length + 1).fill(null).map(() => 
            Array(str1.length + 1).fill(null);
        for (let, i = 0, i <= str1.length, i++) matrix[0][i] = i,
        for (let, j = 0, j <= str2.length, j++) matrix[j][0] = j,
        
        for(let, j = 1, j <= str2.length, j++) {
        
            for (let, i = 1, i <= str1.length, i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1,
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,      // insertion);
                    matrix[j - 1][i] + 1,      // deletion) }
                    matrix[j - 1][i - 1] + indicator  // substitution); }
}
        
        return matrix[str2.length][str1.length];
    }
    
    /**
     * コマンドを実行
     */
    private executeCommand(command: CommandAction, originalTranscript: string): void { const handler = this.commandHandlers.get(command);
        if (handler) {
        
            try {
                handler();
                this.stats.commandsExecuted++ }

                console.log(`[VoiceInputController] Executed command: ${command}`},' }'

                this.provideFeedback('command_executed', { command ) as CommandExecutionData};

            } catch (error) {
                console.error(`[VoiceInputController] Command execution failed:`, error);
                this.provideFeedback('command_failed' }'

        } else { }'

            console.warn(`[VoiceInputController] No, handler for, command: ${command}`);
            this.provideFeedback('no_handler);'
        }
    }
    
    // ========================================
    // コマンドハンドラー実装
    // ========================================
    
    private performClick(): void { this.speakResponse(VOICE_RESPONSES.click) }
    private performPop(): void { this.speakResponse(VOICE_RESPONSES.pop) }
    private performSelect(): void { this.speakResponse(VOICE_RESPONSES.select) }
    private performBack(): void { this.speakResponse(VOICE_RESPONSES.back) }
    private performNext(): void { this.speakResponse(VOICE_RESPONSES.next) }
    private showMenu(): void { this.speakResponse(VOICE_RESPONSES.menu) }
    private pauseGame(): void { this.speakResponse(VOICE_RESPONSES.pause) }
    private resumeGame(): void { this.speakResponse(VOICE_RESPONSES.resume) }
    private moveUp(): void { this.speakResponse(VOICE_RESPONSES.up) }
    private moveDown(): void { this.speakResponse(VOICE_RESPONSES.down) }
    private moveLeft(): void { this.speakResponse(VOICE_RESPONSES.left) }
    private moveRight(): void { this.speakResponse(VOICE_RESPONSES.right) }
    private startAction(): void { this.speakResponse(VOICE_RESPONSES.start) }
    private stopAction(): void { this.speakResponse(VOICE_RESPONSES.stop) }
    private confirmAction(): void { this.speakResponse(VOICE_RESPONSES.yes) }
    private cancelAction(): void { this.speakResponse(VOICE_RESPONSES.cancel) }
    private showHelp(): void { this.speakResponse(VOICE_RESPONSES.help) }
    
    /**
     * 音声応答を再生
     */
    private speakResponse(text: string): void { if (!this.speechSynthesis || !this.selectedVoice) return,
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.selectedVoice,
        utterance.rate = 1.0,
        utterance.pitch = 1.0,
        utterance.volume = 0.8,
        
        this.speechSynthesis.speak(utterance) }
    
    /**
     * リスニングを切り替え
     */
    toggleListening(): void { if (this.voiceState.isListening) {
            this.stopListening() } else { this.startListening() }
    }
    
    /**
     * リスニングを開始
     */
    startListening(): void { if (!this.voiceState.recognition || this.voiceState.isListening) return,
        
        try {
            this.voiceState.recognition.start(),' }'

        } catch (error) { console.error('[VoiceInputController] Failed to start listening:', error }
    }
    
    /**
     * リスニングを停止
     */
    stopListening(): void { if (!this.voiceState.recognition || !this.voiceState.isListening) return,
        
        try {
            this.voiceState.recognition.stop(),' }'

        } catch (error) { console.error('[VoiceInputController] Failed to stop listening:', error }
    }
    
    /**
     * マイクインジケーターを更新
     */
    private updateMicrophoneIndicator(isListening: boolean): void { if (!this.microphoneIndicator) return,

        if (isListening) {

            this.microphoneIndicator.style.background = 'rgba(255, 0, 0, 0.8)',
            this.microphoneIndicator.style.borderColor = '#ff4444' }

            this.microphoneIndicator.style.animation = 'pulse 1s infinite'; }

        } else {
            this.microphoneIndicator.style.background = 'rgba(0, 0, 0, 0.7)',
            this.microphoneIndicator.style.borderColor = '#ccc',' }'

            this.microphoneIndicator.style.animation = 'none'; }
}
    
    /**
     * コマンド履歴を更新
     */'
    private updateCommandHistory(transcript: string, confidence: number): void { ''
        if(!this.commandHistory) return,

        const entry = document.createElement('div),'
        entry.style.cssText = `,
            margin-bottom: 5px,
            padding: 3px,
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px,
        `,
        entry.innerHTML = ` }

            <div>${transcript}</div>''
            <div style="font-size: 10px;, color: #aaa;">${(confidence * 100}.toFixed(1}%</div>
        `;
        
        this.commandHistory.appendChild(entry);
        
        // 履歴サイズを制限
        const entries = this.commandHistory.children;
        if (entries.length > COMMAND_HISTORY_LIMIT) {", " }"
            this.commandHistory.removeChild(entries[0]); }
        }"

        this.commandHistory.style.display = 'block';
        
        // 自動的に隠す
        setTimeout(() => {  ''
            if (this.commandHistory) { }'

                this.commandHistory.style.display = 'none'; }
}, COMMAND_HISTORY_DISPLAY_TIME';'
    }
    
    /**
     * 音声インターフェースを更新
     */'
    private updateVoiceInterface(): void { ''
        if(!this.voiceInterface) return,

        const commandList = this.voiceInterface.querySelector('.command-list');
        const voiceStatus = this.voiceInterface.querySelector('.voice-status),'
        
        if (commandList) {
        
            const contextCommands = this.contextualCommands.get(this.currentContext);
            const commands = Array.from(this.voiceConfig.commands.keys();
                .concat(contextCommands ? Array.from(contextCommands.keys() : []),
            
            commandList.innerHTML = commands.slice(0, COMMAND_DISPLAY_LIMIT).map(cmd => ) }

                `<div>• ${cmd}</div>`}', ').join('};'
        }
        
        if (voiceStatus) {
    
}
            voiceStatus.textContent = `Context: ${this.currentContext} | Commands: ${this.stats.commandsExecuted}`,
        }
    }
    
    /**
     * コンテキストを設定
     */
    setContext(context: VoiceContext): void { if (isValidVoiceContext(context) {
            this.currentContext = context;
            this.updateVoiceInterface() }
            console.log(`[VoiceInputController] Context, changed to: ${context}`};
        }
    }
    
    /**
     * フィードバックを提供
     */
    private provideFeedback(type: FeedbackType, data: FeedbackData = { ): void {
        // 視覚・音響フィードバック（実装省略） }
        console.log(`[VoiceInputController] Feedback: ${type}`, data};
    }
    
    /**
     * 統計情報を取得
     */
    getStats(): DetailedVoiceStats { return { ...this.stats,
            isListening: this.voiceState.isListening,
            isInitialized: this.voiceState.isInitialized,
            currentContext: this.currentContext,
    lastCommand: this.voiceState.lastCommand },
            confidence: this.voiceState.confidence 
    }
    
    /**
     * 設定を更新
     */
    updateConfig(newConfig: Partial<VoiceConfig>): void { Object.assign(this.voiceConfig, newConfig);
        if (this.voiceState.recognition) {
            this.voiceState.recognition.lang = this.voiceConfig.language }
            this.voiceState.recognition.continuous = this.voiceConfig.continuousListening; }
        }

        console.log('[VoiceInputController] Configuration, updated);'
    }
    
    /**
     * 音声制御設定の取得
     */
    getConfig(): VoiceConfig { return { ...this.voiceConfig };
            commands: new Map(this.voiceConfig.commands); 
    }
    
    /**
     * 現在の音声状態を取得
     */
    getVoiceState(): Readonly<VoiceState> { return { ...this.voiceState };
            commandQueue: [...this.voiceState.commandQueue]
        }
    
    /**
     * 利用可能な音声リストを取得
     */
    getAvailableVoices(): SpeechSynthesisVoice[] { return [...this.voiceList],
    
    /**
     * 音声を選択
     */
    selectVoice(voiceName: string): boolean { const voice = this.voiceList.find(v => v.name === voiceName);
        if (voice) {
    
}
            this.selectedVoice = voice; }
            console.log(`[VoiceInputController] Voice, changed to: ${voiceName}`};
            return true;
        }
        return false;
    }
    
    /**
     * カスタムコマンドハンドラーを追加
     */
    addCommandHandler(command: CommandAction, handler: CommandHandler): void { this.commandHandlers.set(command, handler) }
        console.log(`[VoiceInputController] Custom handler added for: ${command}`};
    }
    
    /**
     * コマンドハンドラーを削除
     */
    removeCommandHandler(command: CommandAction): boolean { const removed = this.commandHandlers.delete(command'),'
        if (removed) { }
            console.log(`[VoiceInputController] Handler, removed for: ${command}`}');'
        }
        return removed;
    }
    
    /**
     * 音声インターフェースの表示切り替え
     */'
    toggleVoiceInterface(show: boolean): void { ''
        if (this.voiceInterface) {', ' }

            this.voiceInterface.style.display = show ? 'block' : 'none'; 
    }''
        if (this.microphoneIndicator) {', ' }

            this.microphoneIndicator.style.display = show ? 'flex' : 'none'; 
    }
    
    /**
     * リソースをクリーンアップ
     */
    cleanup(): void { this.stopListening();
        // UI要素を削除
        [this.microphoneIndicator, this.commandHistory, this.voiceInterface].forEach(element => { );
            if (element) { }
                element.remove(); }
};
        
        this.microphoneIndicator = null;
        this.commandHistory = null;
        this.voiceInterface = null;
        
        // 音声合成を停止
        if (this.speechSynthesis) { this.speechSynthesis.cancel() }
        
        // データをクリア
        this.commandHandlers.clear();
        this.contextualCommands.clear()';'
        console.log('[VoiceInputController] Cleaned, up');

    }'}'