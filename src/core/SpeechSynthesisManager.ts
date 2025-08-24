import { getErrorHandler } from '../utils/ErrorHandler.js';

// 型定義
interface SpeechConfig {
    enabled: boolean;
    fallbackToScreenReader: boolean;
    autoLanguageDetection: boolean;
    queueManagement: QueueManagementConfig;
    voice: VoiceConfig;
    speech: SpeechParameters;
    interruption: InterruptionConfig;
    pronunciation: PronunciationConfig;
}

interface QueueManagementConfig {
    maxQueueSize: number;
    interruptOnUrgent: boolean;
    respectPause: boolean;
}

interface VoiceConfig {
    autoSelection: boolean;
    preferredLanguages: string[];
    genderPreference: 'male' | 'female' | 'none';
    qualityPreference: 'high' | 'medium' | 'low';
}

interface SpeechParameters {
    rate: number;
    pitch: number;
    volume: number;
    pauseLength: number;
}

interface InterruptionConfig {
    allowUserInterrupt: boolean;
    allowSystemInterrupt: boolean;
    gracefulStop: boolean;
}

interface PronunciationConfig {
    customDictionary: Map<string, string>;
    numberFormatting: boolean;
    abbreviationExpansion: boolean;
}

interface VoiceAnalysis {
    voice: SpeechSynthesisVoice;
    name: string;
    language: string;
    isLocal: boolean;
    gender: 'male' | 'female' | 'unknown';
    quality: 'high' | 'medium' | 'low';
}

interface SpeechStats {
    totalUtterances: number;
    completedUtterances: number;
    interruptedUtterances: number;
    errorCount: number;
    averageDuration: number;
    languageUsage: Map<string, number>;
    voiceUsage: Map<string, number>;
    sessionStart: number;
}

interface UserPreferences {
    enabled: boolean;
    rate: number;
    pitch: number;
    volume: number;
    preferredVoice: string | null;
    autoPlay: boolean;
    respectGamePause: boolean;
    skipRepeatedMessages: boolean;
}

interface SpeakOptions {
    language?: string;
    voice?: SpeechSynthesisVoice;
    rate?: number;
    pitch?: number;
    volume?: number;
    urgent?: boolean;
}

interface QueueItem {
    utterance: SpeechSynthesisUtterance;
    options: SpeakOptions;
}

interface ScreenReaderManager {
    accessibilityManager?: {
        gameEngine?: any;
    };
}

/**
 * 音声合成管理クラス
 * Web Speech API を使用した包括的な音声出力システム
 */
export class SpeechSynthesisManager {
    private screenReaderManager: ScreenReaderManager;
    private accessibilityManager: any;
    private gameEngine: any;
    private isSupported: boolean;
    private speechSynthesis: SpeechSynthesis;
    private config: SpeechConfig;
    private availableVoices: SpeechSynthesisVoice[] = [];
    private selectedVoices: Map<string, SpeechSynthesisVoice> = new Map();
    private voicesByLanguage: Map<string, VoiceAnalysis[]> = new Map();
    private languagePatterns: Map<string, RegExp> = new Map();
    private eventListeners: Map<string, Set<Function>> = new Map();
    private stats: SpeechStats;
    private userPreferences: UserPreferences;
    private speechQueue: QueueItem[] = [];
    private isPlaying: boolean = false;
    private isPaused: boolean = false;
    private isStopping: boolean = false;
    private currentUtterance: SpeechSynthesisUtterance | null = null;
    private lastSpokenText: string = '';

    constructor(screenReaderManager: ScreenReaderManager) {
        this.screenReaderManager = screenReaderManager;
        this.accessibilityManager = screenReaderManager.accessibilityManager;
        this.gameEngine = this.accessibilityManager?.gameEngine;

        // Speech Synthesis API の可用性チェック
        this.isSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
        this.speechSynthesis = window.speechSynthesis;

        // 設定の初期化
        this.config = {
            enabled: this.isSupported,
            fallbackToScreenReader: true,
            autoLanguageDetection: true,
            queueManagement: {
                maxQueueSize: 10,
                interruptOnUrgent: true,
                respectPause: true
            },
            voice: {
                autoSelection: true,
                preferredLanguages: ['ja-JP', 'en-US'],
                genderPreference: 'female',
                qualityPreference: 'high'
            },
            speech: {
                rate: 1.0,
                pitch: 1.0,
                volume: 1.0,
                pauseLength: 300
            },
            interruption: {
                allowUserInterrupt: true,
                allowSystemInterrupt: true,
                gracefulStop: true
            },
            pronunciation: {
                customDictionary: new Map(),
                numberFormatting: true,
                abbreviationExpansion: true
            }
        };

        // 言語パターンの設定
        this.languagePatterns = new Map([
            ['ja', /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/],
            ['en', /^[A-Za-z\s\d\,!?;:'"()-]+$/],
            ['zh', /[\u4E00-\u9FFF]/],
            ['ko', /[\uAC00-\uD7AF]/]
        ]);

        // 統計情報の初期化
        this.stats = {
            totalUtterances: 0,
            completedUtterances: 0,
            interruptedUtterances: 0,
            errorCount: 0,
            averageDuration: 0,
            languageUsage: new Map(),
            voiceUsage: new Map(),
            sessionStart: Date.now()
        };

        // ユーザー設定の初期化
        this.userPreferences = {
            enabled: true,
            rate: 1.0,
            pitch: 1.0,
            volume: 0.8,
            preferredVoice: null,
            autoPlay: true,
            respectGamePause: true,
            skipRepeatedMessages: true
        };

        // カスタム発音辞書（日本語）の初期化
        this.initializeCustomDictionary();

        console.log('SpeechSynthesisManager initialized', { supported: this.isSupported });
        this.initialize();
    }


    /**
     * 初期化
     */
    async initialize(): Promise<void> {
        if (!this.isSupported) {
            console.warn('Speech Synthesis API not supported');
            return;
        }

        try {
            // 音声の読み込み
            await this.loadVoices();
            // ユーザー設定の読み込み
            this.loadUserPreferences();
            // イベントリスナーの設定
            this.setupEventListeners();
            // 音声の自動選択
            this.autoSelectVoices();

            console.log('SpeechSynthesisManager initialized successfully');

        } catch (error) {
            getErrorHandler().handleError(error as Error, 'SPEECH_SYNTHESIS_ERROR', {
                operation: 'initialize'
            });
        }
    }

    /**
     * カスタム発音辞書の初期化
     */
    private initializeCustomDictionary(): void {
        const gameDictionary = new Map([
            // ゲーム用語
            ['バブル', 'バブル'],
            ['bubble', 'バブル'],
            ['ポップ', 'ポップ'],
            ['pop', 'ポップ'],
            // スコア関連
            ['スコア', 'スコア'],
            ['score', 'スコア'],
            ['コンボ', 'コンボ'],
            ['combo', 'コンボ'],
            ['HP', 'エッチピー'],
            // ゲーム状態
            ['ゲームオーバー', 'ゲーム オーバー'],
            ['Game Over', 'ゲーム オーバー'],
            ['レベルアップ', 'レベル アップ'],
            ['Level Up', 'レベル アップ'],
            // 特殊バブル
            ['レインボー', 'レインボー'],
            ['rainbow', 'レインボー'],
            ['ボス', 'ボス'],
            ['boss', 'ボス'],
            ['ゴールデン', 'ゴールデン'],
            ['golden', 'ゴールデン'],
            // 数字の読み方改善
            ['1st', '1番目'],
            ['2nd', '2番目'],
            ['3rd', '3番目'],
            ['1位', 'いちい'],
            ['2位', 'にい'],
            ['3位', 'さんい']
        ]);

        this.config.pronunciation.customDictionary = gameDictionary;
    }

    /**
     * 音声の読み込み
     */
    private async loadVoices(): Promise<void> {
        return new Promise<void>((resolve) => {
            const loadVoicesOnce = () => {
                this.availableVoices = this.speechSynthesis.getVoices();
                if (this.availableVoices.length > 0) {
                    console.log(`Loaded ${this.availableVoices.length} voices`);
                    this.analyzeVoices();
                    resolve();
                } else {
                    // 音声が読み込まれていない場合は少し待機
                    setTimeout(loadVoicesOnce, 100);
                }
            };

            // voiceschangedイベントを監視
            this.speechSynthesis.addEventListener('voiceschanged', loadVoicesOnce);

            // 即座に試行
            loadVoicesOnce();
        });
    }

    /**
     * 音声の分析
     */
    private analyzeVoices(): void {
        const voicesByLanguage = new Map<string, VoiceAnalysis[]>();

        this.availableVoices.forEach(voice => {
            const lang = voice.lang.split('-')[0]; // 'ja-JP' -> 'ja'

            if (!voicesByLanguage.has(lang)) {
                voicesByLanguage.set(lang, []);
            }

            voicesByLanguage.get(lang)!.push({
                voice: voice,
                name: voice.name,
                language: voice.lang,
                isLocal: voice.localService,
                gender: this.detectGender(voice.name),
                quality: this.estimateQuality(voice)
            });
        });

        console.log('Voice analysis complete:', Object.fromEntries(voicesByLanguage));
        this.voicesByLanguage = voicesByLanguage;
    }

    /**
     * 音声の性別検出（ヒューリスティック）
     */
    private detectGender(voiceName: string): 'male' | 'female' | 'unknown' {
        const name = voiceName.toLowerCase();

        if (name.includes('kyoko') || name.includes('haruka') || name.includes('sayaka')) {
            return 'female';
        }
        if (name.includes('otoya') || name.includes('ichiro')) {
            return 'male';
        }

        // 英語音声
        if (name.includes('female') || name.includes('woman') ||
            name.includes('samantha') || (name.includes('alex') && name.includes('female'))) {
            return 'female';
        }
        if (name.includes('male') || name.includes('man') ||
            name.includes('daniel') || (name.includes('alex') && !name.includes('female'))) {
            return 'male';
        }

        return 'unknown';
    }

    /**
     * 音声品質の推定
     */
    private estimateQuality(voice: SpeechSynthesisVoice): 'high' | 'medium' | 'low' {
        // ローカル音声は一般的に高品質
        if (voice.localService) {
            return 'high';
        }

        // 名前による推定
        const name = voice.name.toLowerCase();
        if (name.includes('premium') || name.includes('neural') ||
            name.includes('enhanced') || name.includes('hd')) {
            return 'high';
        }

        if (name.includes('compact') || name.includes('lite')) {
            return 'low';
        }

        return 'medium';
    }

    /**
     * 自動音声選択
     */
    private autoSelectVoices(): void {
        for (const preferredLang of this.config.voice.preferredLanguages) {
            const lang = preferredLang.split('-')[0];
            const voices = this.voicesByLanguage.get(lang) || [];

            if (voices.length === 0) continue;

            // 品質、性別、ローカル優先で選択
            const selectedVoice = voices
                .filter(v => this.config.voice.genderPreference === 'none' ||
                           v.gender === this.config.voice.genderPreference ||
                           v.gender === 'unknown')
                .sort((a, b) => {
                    // 品質優先
                    const qualityScore = (voice: VoiceAnalysis) => {
                        switch (voice.quality) {
                            case 'high': return 3;
                            case 'medium': return 2;
                            case 'low': return 1;
                            default: return 0;
                        }
                    };

                    const scoreA = qualityScore(a) + (a.voice.localService ? 1 : 0);
                    const scoreB = qualityScore(b) + (b.voice.localService ? 1 : 0);

                    return scoreB - scoreA;
                })[0];

            if (selectedVoice) {
                this.selectedVoices.set(lang, selectedVoice.voice);
                console.log(`Selected voice for ${lang}:`, selectedVoice.voice.name);
            }
        }
    }

    /**
     * ユーザー設定の読み込み
     */
    private loadUserPreferences(): void {
        try {
            const saved = localStorage.getItem('speechSynthesis_preferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                Object.assign(this.userPreferences, preferences);
                // 設定を適用
                this.applyUserPreferences();
            }
        } catch (error) {
            console.warn('Failed to load speech synthesis preferences:', error);
        }
    }

    /**
     * ユーザー設定の保存
     */
    private saveUserPreferences(): void {
        try {
            localStorage.setItem('speechSynthesis_preferences', JSON.stringify(this.userPreferences));
        } catch (error) {
            console.warn('Failed to save speech synthesis preferences:', error);
        }
    }

    /**
     * ユーザー設定の適用
     */
    private applyUserPreferences(): void {
        this.config.speech.rate = this.userPreferences.rate;
        this.config.speech.pitch = this.userPreferences.pitch;
        this.config.speech.volume = this.userPreferences.volume;
        this.config.enabled = this.userPreferences.enabled;
    }

    /**
     * イベントリスナーの設定
     */
    private setupEventListeners(): void {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.userPreferences.respectGamePause) {
                this.pause();
            }
        });

        // ウィンドウフォーカス変更
        window.addEventListener('blur', () => {
            if (this.userPreferences.respectGamePause) {
                this.pause();
            }
        });

        window.addEventListener('focus', () => {
            this.resume();
        });

        // キーボードによる中断
        document.addEventListener('keydown', (event) => {
            if (this.config.interruption.allowUserInterrupt) {
                if (event.key === 'Escape') {
                    this.stop();
                } else if (event.key === ' ' && event.ctrlKey) {
                    event.preventDefault();
                    this.toggle();
                }
            }
        });
    }

    /**
     * 言語の自動検出
     */
    private detectLanguage(text: string): string {
        if (!this.config.autoLanguageDetection) {
            return this.config.voice.preferredLanguages[0].split('-')[0];
        }

        for (const [lang, pattern] of this.languagePatterns) {
            if (pattern.test(text)) {
                return lang;
            }
        }


        // デフォルト言語
        return 'ja';
    }

    /**
     * テキストの前処理
     */
    private preprocessText(text: string, language: string): string {
        let processed = text;

        // カスタム辞書による置換
        for (const [original, replacement] of this.config.pronunciation.customDictionary) {
            const regex = new RegExp(original, 'gi');
            processed = processed.replace(regex, replacement);
        }


        // 数字のフォーマット（日本語）
        if (language === 'ja' && this.config.pronunciation.numberFormatting) {
            processed = this.formatJapaneseNumbers(processed);
        }

        // 略語の展開
        if (this.config.pronunciation.abbreviationExpansion) {
            processed = this.expandAbbreviations(processed, language);
        }

        // 記号の読み方調整
        processed = this.formatSymbols(processed, language);

        return processed;
    }

    /**
     * 日本語数字のフォーマット
     */
    private formatJapaneseNumbers(text: string): string {
        // 点数の読み方改善
        text = text.replace(/(\d+)点/g, '$1 点');
        text = text.replace(/(\d+)秒/g, '$1 秒');
        text = text.replace(/(\d+)個/g, '$1 個');
        text = text.replace(/(\d+)回/g, '$1 回');
        text = text.replace(/(\d+)倍/g, '$1 倍');

        // 大きな数字の読み方
        text = text.replace(/(\d+)000(\d+)/g, '$1千$2');
        text = text.replace(/(\d+)0000/g, '$1万');
        return text;
    }

    /**
     * 略語の展開
     */
    private expandAbbreviations(text: string, language: string): string {
        const abbreviations = new Map([
            ['HP', language === 'ja' ? 'ヒットポイント' : 'Hit Points'],
            ['AP', language === 'ja' ? 'アワプチポイント' : 'Awaputi Points'],
            ['FPS', language === 'ja' ? 'フレームレート' : 'Frames Per Second'],
            ['AI', language === 'ja' ? 'エーアイ' : 'Artificial Intelligence']
        ]);

        for (const [abbr, expansion] of abbreviations) {
            const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
            text = text.replace(regex, expansion);
        }

        return text;
    }

    /**
     * 記号のフォーマット
     */
    private formatSymbols(text: string, language: string): string {
        if (language === 'ja') {
            text = text.replace(/!/g, '！');
            text = text.replace(/\?/g, '？');
            text = text.replace(/\.\.\./g, '…');
        }

        return text;
    }

    /**
     * 発話の作成
     */
    private createUtterance(text: string, options: SpeakOptions = {}): SpeechSynthesisUtterance {
        const processedText = this.preprocessText(text, options.language || 'ja');
        const utterance = new SpeechSynthesisUtterance(processedText);


        // 言語設定
        const language = options.language || this.detectLanguage(text);
        const voice = options.voice || this.selectedVoices.get(language);

        if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang;
        } else {
            utterance.lang = language === 'ja' ? 'ja-JP' : 'en-US';
        }

        // 音声パラメータ
        utterance.rate = options.rate !== undefined ? options.rate : this.config.speech.rate;
        utterance.pitch = options.pitch !== undefined ? options.pitch : this.config.speech.pitch;
        utterance.volume = options.volume !== undefined ? options.volume : this.config.speech.volume;

        // イベントハンドラー
        utterance.onstart = () => {
            this.isPlaying = true;
            this.currentUtterance = utterance;
            this.emit('speechStart', { text: processedText, utterance });
        };

        utterance.onend = () => {
            this.isPlaying = false;
            this.currentUtterance = null;
            this.stats.completedUtterances++;
            this.emit('speechEnd', { text: processedText, utterance });
            this.processNextInQueue();
        };

        utterance.onerror = (event) => {
            this.stats.errorCount++;
            console.error('Speech synthesis error:', event.error);
            this.emit('speechError', { error: event.error, utterance });
            this.processNextInQueue();
        };

        utterance.onpause = () => {
            this.isPaused = true;
            this.emit('speechPause', { utterance });
        };

        utterance.onresume = () => {
            this.isPaused = false;
            this.emit('speechResume', { utterance });
        };

        return utterance;
    }

    /**
     * 次のキューを処理
     */
    private processNextInQueue(): void {
        if (this.speechQueue.length > 0 && !this.isPlaying && !this.isStopping) {
            const nextItem = this.speechQueue.shift()!;
            this.speakImmediate(nextItem.utterance);
        }
    }

    /**
     * 即座に発話
     */
    private speakImmediate(utterance: SpeechSynthesisUtterance): void {
        try {
            this.speechSynthesis.speak(utterance);
            this.stats.totalUtterances++;


            // 統計更新
            const language = utterance.lang?.split('-')[0] || 'unknown';
            const langCount = this.stats.languageUsage.get(language) || 0;
            this.stats.languageUsage.set(language, langCount + 1);

            if (utterance.voice) {
                const voiceCount = this.stats.voiceUsage.get(utterance.voice.name) || 0;
                this.stats.voiceUsage.set(utterance.voice.name, voiceCount + 1);
            }
        } catch (error) {
            this.stats.errorCount++;
            getErrorHandler().handleError(error as Error, 'SPEECH_SYNTHESIS_ERROR', {
                operation: 'speakImmediate',
                utterance: utterance
            });
        }
    }

    // パブリックAPI

    /**
     * テキストの発話
     */
<<<<<<< HEAD
    speak(text: string, options: SpeakOptions = {}): boolean {
        if (!this.config.enabled || !this.isSupported || !text) {
            return false;
        }

        // 重複メッセージのスキップ
        if (this.userPreferences.skipRepeatedMessages && this.isRepeatedMessage(text)) {
            return false;
        }

=======
    speak(text: string, options: any = {}): boolean {
        if (!this.config.enabled || !this.isSupported || !text) {
            return false;
        }
        
        // 重複メッセージのスキップ
        if (this.userPreferences.skipRepeatedMessages &&
            this.isRepeatedMessage(text)) {
            return false;
        }
        
>>>>>>> feature/typescript-migration-st
        const utterance = this.createUtterance(text, options);

        // 緊急メッセージの場合は割り込み
        if (options.urgent && this.config.queueManagement.interruptOnUrgent) {
            this.stop();
            this.speakImmediate(utterance);
        } else if (this.isPlaying) {
            // キューに追加
            if (this.speechQueue.length < this.config.queueManagement.maxQueueSize) {
                this.speechQueue.push({ utterance, options });
            } else {
                console.warn('Speech queue full, dropping message:', text);
                return false;
            }
        } else {
            // 即座に発話
            this.speakImmediate(utterance);
        }

        return true;
    }

    /**
     * 重複メッセージの判定
     */
<<<<<<< HEAD
    isRepeatedMessage(text: string): boolean {
=======
    private isRepeatedMessage(text: string): boolean {
>>>>>>> feature/typescript-migration-st
        // 簡単な実装：最後のメッセージと同じかチェック
        if (this.lastSpokenText === text) {
            return true;
        }
<<<<<<< HEAD

=======
        
>>>>>>> feature/typescript-migration-st
        this.lastSpokenText = text;
        return false;
    }

    /**
     * 緊急メッセージの発話
     */
<<<<<<< HEAD
    speakUrgent(text: string, options: SpeakOptions = {}): boolean {
        return this.speak(text, { ...options, urgent: true });
    }

    /**
     * キューをクリアして発話
     */
    speakNow(text: string, options: SpeakOptions = {}): boolean {
=======
    speakUrgent(text: string, options: any = {}): boolean {
        return this.speak(text, { ...options, urgent: true });
    }
    
    /**
     * キューをクリアして発話
     */
    speakNow(text: string, options: any = {}): boolean {
>>>>>>> feature/typescript-migration-st
        this.clearQueue();
        this.stop();
        return this.speak(text, options);
    }
<<<<<<< HEAD

=======
    
>>>>>>> feature/typescript-migration-st
    /**
     * 一時停止
     */
    pause(): void {
        if (this.isSupported && this.isPlaying) {
            this.speechSynthesis.pause();
        }
    }

    /**
     * 再開
     */
    resume(): void {
        if (this.isSupported && this.isPaused) {
            this.speechSynthesis.resume();
        }
    }

    /**
     * 停止
     */
    stop(): void {
        if (this.isSupported) {
            this.isStopping = true;
            this.speechSynthesis.cancel();
            setTimeout(() => {
                this.isStopping = false;
                this.isPlaying = false;
                this.isPaused = false;
                this.currentUtterance = null;
            }, 100);
        }
    }

    /**
     * 再生/一時停止のトグル
     */
    toggle(): void {
        if (this.isPlaying && !this.isPaused) {
            this.pause();
        } else if (this.isPaused) {
            this.resume();
        }
    }

    /**
     * キューのクリア
     */
    clearQueue(): void {
        this.speechQueue.length = 0;
    }
<<<<<<< HEAD

    /**
     * 音声設定の変更
     */
    setVoiceSettings(settings: Partial<SpeechParameters & { preferredVoice?: string }>): void {
        if (settings.rate !== undefined) {
            this.config.speech.rate = Math.max(0.1, Math.min(10, settings.rate));
        }
        if (settings.pitch !== undefined) {
            this.config.speech.pitch = Math.max(0, Math.min(2, settings.pitch));
        }
        if (settings.volume !== undefined) {
            this.config.speech.volume = Math.max(0, Math.min(1, settings.volume));
        }

=======
    
    /**
     * 音声設定の変更
     */
    setVoiceSettings(settings: any): void {
        if (settings.rate !== undefined) {
            this.config.speech.rate = Math.max(0.1, Math.min(10, settings.rate));
        }
        if (settings.pitch !== undefined) {
            this.config.speech.pitch = Math.max(0, Math.min(2, settings.pitch));
        }
        if (settings.volume !== undefined) {
            this.config.speech.volume = Math.max(0, Math.min(1, settings.volume));
        }
        
>>>>>>> feature/typescript-migration-st
        // ユーザー設定も更新
        Object.assign(this.userPreferences, settings);
        this.saveUserPreferences();
        console.log('Voice settings updated:', settings);
    }

    /**
     * 音声の選択
     */
    setVoice(language: string, voiceName: string): boolean {
        const voice = this.availableVoices.find(v =>
<<<<<<< HEAD
            v.name === voiceName && v.lang.startsWith(language));

=======
            v.name === voiceName && v.lang.startsWith(language)
        );
>>>>>>> feature/typescript-migration-st
        if (voice) {
            this.selectedVoices.set(language, voice);
            console.log(`Voice set for ${language}:`, voiceName);
            return true;
        }
<<<<<<< HEAD

=======
        
>>>>>>> feature/typescript-migration-st
        console.warn(`Voice not found: ${voiceName} for ${language}`);
        return false;
    }

    /**
     * 利用可能な音声の取得
     */
<<<<<<< HEAD
    getAvailableVoices(language: string | null = null): SpeechSynthesisVoice[] {
        if (language) {
            return this.availableVoices.filter(voice =>
                voice.lang.startsWith(language));
=======
    getAvailableVoices(language?: string): SpeechSynthesisVoice[] {
        if (language) {
            return this.availableVoices.filter(voice =>
                voice.lang.startsWith(language)
            );
>>>>>>> feature/typescript-migration-st
        }
        return this.availableVoices;
    }

    /**
     * 現在の状態の取得
     */
    getStatus(): any {
        return {
            isSupported: this.isSupported,
            isEnabled: this.config.enabled,
            isPlaying: this.isPlaying,
            isPaused: this.isPaused,
            queueSize: this.speechQueue.length,
            currentVoice: this.currentUtterance?.voice?.name || null,
            settings: {
                rate: this.config.speech.rate,
                pitch: this.config.speech.pitch,
                volume: this.config.speech.volume
            }
        };
    }

    /**
     * 設定の適用
     */
    applyConfig(config: any): void {
        if (config.speechSynthesis) {
            Object.assign(this.config, config.speechSynthesis);
            this.applyUserPreferences();
<<<<<<< HEAD
            console.log('SpeechSynthesisManager configuration applied');
        }
    }

    /**
     * 音声テスト
     */
    testVoice(text: string | null = null, language: string = 'ja'): boolean {
        const testText = text || (language === 'ja' ?
            'こんにちは。音声合成のテストです。' :
            'Hello. This is a speech synthesis test.');
        return this.speak(testText, { language });
    }

=======
        }
        console.log('SpeechSynthesisManager configuration applied');
    }
    
    /**
     * 音声テスト
     */
    testVoice(text?: string, language: string = 'ja'): boolean {
        const testText = text || (language === 'ja' ?
            'こんにちは。音声合成のテストです。' :
            'Hello. This is a speech synthesis test.');
        return this.speak(testText, { language });
    }
    
>>>>>>> feature/typescript-migration-st
    /**
     * イベントリスナーの追加
     */
    addEventListener(event: string, callback: Function): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event)!.add(callback);
    }

    /**
     * イベントリスナーの削除
     */
    removeEventListener(event: string, callback: Function): void {
        if (this.eventListeners.has(event)) {
<<<<<<< HEAD
            this.eventListeners.get(event)!.delete(callback);
        }
    }

    /**
     * イベントの発行
     */
    emit(event: string, data: any): void {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event)!.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in speech synthesis event listener:`, error);
=======
            this.eventListeners.get(event).delete(callback);
        }
    }
    
    /**
     * イベントの発行
     */
    private emit(event: string, data: any): void {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in speech synthesis event listener:', error);
>>>>>>> feature/typescript-migration-st
                }
            });
        }
    }

    /**
     * レポートの生成
     */
    generateReport(): any {
        const sessionDuration = Date.now() - this.stats.sessionStart;
<<<<<<< HEAD

=======
        
>>>>>>> feature/typescript-migration-st
        return {
            timestamp: new Date().toISOString(),
            system: {
                isSupported: this.isSupported,
                availableVoicesCount: this.availableVoices.length,
                selectedVoices: Object.fromEntries(this.selectedVoices.entries())
            },
            configuration: {
                enabled: this.config.enabled,
                autoLanguageDetection: this.config.autoLanguageDetection,
                queueManagement: this.config.queueManagement,
                speech: this.config.speech
            },
            statistics: {
                ...this.stats,
                sessionDuration: sessionDuration,
                successRate: this.stats.totalUtterances > 0 ?
                    this.stats.completedUtterances / this.stats.totalUtterances : 0,
                utterancesPerMinute: this.stats.totalUtterances / (sessionDuration / 60000)
            },
            currentStatus: this.getStatus(),
            userPreferences: this.userPreferences
        };
    }
<<<<<<< HEAD

=======
    
>>>>>>> feature/typescript-migration-st
    /**
     * 有効状態の設定
     */
    setEnabled(enabled: boolean): void {
        this.config.enabled = enabled && this.isSupported;
        this.userPreferences.enabled = this.config.enabled;
<<<<<<< HEAD

=======
        
>>>>>>> feature/typescript-migration-st
        if (!enabled) {
            this.stop();
            this.clearQueue();
        }

        this.saveUserPreferences();
        console.log(`SpeechSynthesisManager ${this.config.enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * クリーンアップ
     */
    destroy(): void {
        console.log('Destroying SpeechSynthesisManager...');
<<<<<<< HEAD

=======
        
>>>>>>> feature/typescript-migration-st
        // 音声停止
        this.stop();
        this.clearQueue();

        // ユーザー設定の保存
        this.saveUserPreferences();

        // イベントリスナーのクリア
        this.eventListeners.clear();

        // データのクリア
        this.selectedVoices.clear();
<<<<<<< HEAD
        this.config.pronunciation.customDictionary.clear();

=======
        this.voicePreferences.clear();
        this.config.pronunciation.customDictionary.clear();
>>>>>>> feature/typescript-migration-st
        console.log('SpeechSynthesisManager destroyed');
    }
}