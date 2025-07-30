import { getErrorHandler } from '../utils/ErrorHandler.js';
import { TranslationLoader } from './i18n/TranslationLoader.js';
import { OptimizedTranslationLoader } from './i18n/OptimizedTranslationLoader.js';
import { I18nPerformanceMonitor } from './i18n/I18nPerformanceMonitor.js';
import { I18nRenderOptimizer } from './i18n/I18nRenderOptimizer.js';
import { getFontManager } from './i18n/FontManager.js';

/**
 * ローカライゼーション管理クラス - 多言語対応
 */
export class LocalizationManager {
    constructor() {
        this.currentLanguage = 'ja';
        this.fallbackLanguage = 'en';
        this.translations = new Map();
        this.loadedLanguages = new Set();
        
        // 翻訳ローダーの初期化（最適化版を優先）
        this.translationLoader = new TranslationLoader();
        this.optimizedLoader = new OptimizedTranslationLoader();
        
        // フォントマネージャーの初期化
        this.fontManager = getFontManager();
        
        // パフォーマンス監視とレンダリング最適化
        this.performanceMonitor = new I18nPerformanceMonitor();
        this.renderOptimizer = new I18nRenderOptimizer();
        
        // 言語変更イベントリスナー
        this.languageChangeListeners = new Set();
        
        // 文化的適応設定
        this.culturalAdaptation = {
            enabled: true,
            rtlLanguages: ['ar', 'he', 'fa', 'ur'],
            numeralSystems: {
                'ar': 'arab',
                'fa': 'persian',
                'th': 'thai',
                'hi': 'devanagari'
            },
            dateFormats: {
                'ja': 'YYYY年MM月DD日',
                'en': 'MM/DD/YYYY',
                'en-GB': 'DD/MM/YYYY',
                'de': 'DD.MM.YYYY',
                'fr': 'DD/MM/YYYY'
            },
            colorMeanings: {
                'ja': { red: 'danger', green: 'safety', blue: 'trust' },
                'en': { red: 'danger', green: 'success', blue: 'information' },
                'zh': { red: 'luck', gold: 'prosperity', white: 'purity' }
            },
            gestureConventions: {
                'ja': { pointing: 'avoid', thumbUp: 'ok' },
                'en': { pointing: 'acceptable', thumbUp: 'approval' },
                'ar': { leftHand: 'avoid', thumbUp: 'acceptable' }
            }
        };
        
        // アクセシビリティ専用翻訳データ
        this.accessibilityTranslations = new Map();
        
        // 翻訳データを初期化
        this.initializeTranslations();
        
        // 非同期でファイルベース翻訳を初期化
        this.initializeAsync();
    }
    
    /**
     * 非同期初期化
     */
    async initializeAsync() {
        try {
            // 最適化されたローダーで基本言語をプリロード
            await this.optimizedLoader.preloadLanguages(['ja', 'en']);
            
            // ファイルベース翻訳をロード
            await this.loadLanguageData('ja');
            await this.loadLanguageData('en');
            
            console.log('LocalizationManager initialized with optimized file-based translations');
        } catch (error) {
            console.warn('Failed to initialize file-based translations, using fallback data:', error);
        }
    }
    
    /**
     * 翻訳データを初期化
     */
    initializeTranslations() {
        // 日本語翻訳
        this.translations.set('ja', {
            // メニュー
            'menu.title': 'BubblePop',
            'menu.subtitle': '泡割りゲーム',
            'menu.start': 'ゲーム開始',
            'menu.settings': '設定',
            'menu.userInfo': 'ユーザー情報',
            'menu.controls': '↑↓: 選択  Enter: 決定  ESC: 終了',
            'menu.clickInfo': 'クリックでも操作できます',
            
            // 設定画面
            'settings.title': '設定',
            'settings.audio': '音響設定',
            'settings.masterVolume': 'マスター音量',
            'settings.sfxVolume': '効果音音量',
            'settings.bgmVolume': 'BGM音量',
            'settings.mute': 'ミュート',
            'settings.language': '言語',
            'settings.quality': '品質設定',
            'settings.accessibility': 'アクセシビリティ',
            'settings.controls': '操作設定',
            'settings.back': '戻る',
            'settings.reset': 'リセット',
            'settings.apply': '適用',
            
            // 品質設定
            'quality.auto': '自動',
            'quality.low': '低',
            'quality.medium': '中',
            'quality.high': '高',
            
            // アクセシビリティ
            'accessibility.highContrast': 'ハイコントラスト',
            'accessibility.reducedMotion': 'モーション軽減',
            'accessibility.largeText': '大きなテキスト',
            'accessibility.screenReader': 'スクリーンリーダー対応',
            'accessibility.colorBlindSupport': '色覚サポート',
            
            // ゲーム画面
            'game.score': 'スコア',
            'game.hp': 'HP',
            'game.time': '残り時間',
            'game.combo': 'コンボ',
            'game.pause': '一時停止',
            'game.resume': '再開',
            'game.giveUp': 'ギブアップ',
            'game.gameOver': 'ゲームオーバー',
            'game.finalScore': '最終スコア',
            'game.clickToRestart': 'クリックして再開',
            
            // 特殊効果
            'effect.bonusTime': 'ボーナスタイム',
            'effect.timeStop': '時間停止',
            'effect.electric': 'ビリビリ',
            'effect.operationDisabled': '操作不能!',
            'effect.scoreDouble': 'スコア2倍!',
            
            // ユーザー情報
            'userInfo.title': 'ユーザー情報',
            'userInfo.playerName': 'プレイヤー名',
            'userInfo.ap': '所持AP',
            'userInfo.tap': '総TAP',
            'userInfo.unlockedStages': '開放済みステージ',
            'userInfo.ownedItems': '所持アイテム',
            'userInfo.highScores': 'ハイスコア',
            'userInfo.noRecords': 'まだ記録がありません',
            
            // ユーザー名入力
            'username.register': 'ユーザー名登録',
            'username.change': 'ユーザー名変更',
            'username.prompt': 'ユーザー名を入力してください（最大10文字）',
            'username.inputHelp': '文字を入力してEnterで決定、ESCでキャンセル',
            'username.ok': 'OK',
            'username.cancel': 'キャンセル',
            
            // データクリア
            'dataClear.title': 'データクリア確認',
            'dataClear.warning': 'すべてのデータが削除されます。',
            'dataClear.irreversible': 'この操作は取り消せません。',
            'dataClear.items': [
                'ユーザー名',
                '所持AP・TAP',
                'ハイスコア記録',
                '開放済みステージ',
                '所持アイテム'
            ],
            'dataClear.execute': '削除実行',
            'dataClear.cancel': 'キャンセル',
            
            // 操作説明
            'help.title': '操作説明',
            'help.basicControls': '基本操作',
            'help.gameTips': 'ゲームのコツ',
            'help.bubbleTypes': '泡の種類',
            'help.controls': [
                'クリック/タップ: 泡を割る',
                'ドラッグ: 泡を吹き飛ばす',
                '↑↓キー: メニュー選択',
                'Enter: 決定',
                'ESC: 戻る/終了',
                'S: ショップ（ステージ選択時）'
            ],
            'help.tips': [
                '泡は時間が経つと危険になる',
                '連続で割るとコンボボーナス',
                'ピンクの泡でHP回復',
                '毒の泡は避けよう',
                '硬い泡は複数回クリック',
                '特殊泡は画面外に逃がせる'
            ],
            'help.bubbles': '普通(青) 石(灰) 鉄(茶) ダイヤ(白) ピンク(回復) 毒(緑) とげとげ(連鎖) 虹色(ボーナス) 時計(時停) S字(得点) ビリビリ(妨害) 逃げる(移動)',
            
            // キーボードショートカット
            'shortcuts.title': 'キーボードショートカット',
            'shortcuts.pause': '一時停止',
            'shortcuts.menu': 'メニュー',
            'shortcuts.fullscreen': 'フルスクリーン',
            'shortcuts.mute': 'ミュート',
            'shortcuts.settings': '設定',
            'shortcuts.help': 'ヘルプ',
            
            // エラーメッセージ
            'error.generic': 'エラーが発生しました',
            'error.reload': '再読み込み',
            'error.canvasNotSupported': 'お使いのブラウザはCanvas APIに対応していません。モダンブラウザでお試しください。',
            'error.audioNotSupported': '音声機能が利用できません。',
            'error.storageNotSupported': 'データの保存ができません。',
            
            // 確認メッセージ
            'confirm.yes': 'はい',
            'confirm.no': 'いいえ',
            'confirm.ok': 'OK',
            'confirm.cancel': 'キャンセル',
            
            // アクセシビリティ専用翻訳
            'accessibility.manager.title': 'アクセシビリティ設定',
            'accessibility.manager.description': 'すべてのユーザーに優しいゲーム体験を提供します',
            'accessibility.manager.enabled': 'アクセシビリティ機能有効',
            'accessibility.manager.disabled': 'アクセシビリティ機能無効',
            
            // キーボードアクセシビリティ
            'accessibility.keyboard.title': 'キーボード操作',
            'accessibility.keyboard.enabled': 'キーボードナビゲーション有効',
            'accessibility.keyboard.focusRing': 'フォーカスリング表示',
            'accessibility.keyboard.skipLinks': 'スキップリンク',
            'accessibility.keyboard.shortcuts': 'キーボードショートカット',
            'accessibility.keyboard.customization': 'ショートカットカスタマイズ',
            'accessibility.keyboard.navigation': 'ナビゲーション設定',
            'accessibility.keyboard.tabOrder': 'タブ順序',
            'accessibility.keyboard.announcement': 'キーボード操作アナウンス',
            
            // スクリーンリーダーサポート
            'accessibility.screenReader.title': 'スクリーンリーダー',
            'accessibility.screenReader.enabled': 'スクリーンリーダー対応有効',
            'accessibility.screenReader.ariaLabels': 'ARIAラベル',
            'accessibility.screenReader.liveRegions': 'ライブリージョン',
            'accessibility.screenReader.gameDescriptions': 'ゲーム状況説明',
            'accessibility.screenReader.bubbleDescriptions': '泡の説明',
            'accessibility.screenReader.announcements': 'アナウンス設定',
            'accessibility.screenReader.speechSynthesis': '音声合成',
            'accessibility.screenReader.voiceSettings': '音声設定',
            'accessibility.screenReader.rate': '読み上げ速度',
            'accessibility.screenReader.pitch': '音の高さ',
            'accessibility.screenReader.volume': '音量',
            
            // 視覚アクセシビリティ
            'accessibility.visual.title': '視覚的支援',
            'accessibility.visual.contrast': 'コントラスト調整',
            'accessibility.visual.textScaling': 'テキストサイズ調整',
            'accessibility.visual.colorBlindness': '色覚サポート',
            'accessibility.visual.motionReduction': 'モーション軽減',
            'accessibility.visual.focusIndicators': 'フォーカス表示',
            'accessibility.visual.colorScheme': '色彩スキーム',
            'accessibility.visual.fontFamily': 'フォント選択',
            'accessibility.visual.animationSettings': 'アニメーション設定',
            
            // 音声アクセシビリティ
            'accessibility.audio.title': '音声支援',
            'accessibility.audio.visualFeedback': '視覚的音声フィードバック',
            'accessibility.audio.captions': 'キャプション表示',
            'accessibility.audio.soundVisualization': '音の視覚化',
            'accessibility.audio.vibrationFeedback': '振動フィードバック',
            'accessibility.audio.flashAlerts': '点滅アラート',
            'accessibility.audio.captionStyle': 'キャプションスタイル',
            'accessibility.audio.captionSize': 'キャプションサイズ',
            'accessibility.audio.captionPosition': 'キャプション位置',
            
            // 運動機能アクセシビリティ
            'accessibility.motor.title': '運動機能支援',
            'accessibility.motor.alternativeInput': '代替入力方法',
            'accessibility.motor.switchInput': 'スイッチ入力',
            'accessibility.motor.eyeTracking': '視線追跡',
            'accessibility.motor.voiceControl': '音声制御',
            'accessibility.motor.gestureCustomization': 'ジェスチャーカスタマイズ',
            'accessibility.motor.timingAdjustments': 'タイミング調整',
            'accessibility.motor.sensitivity': '感度設定',
            'accessibility.motor.dwellTime': '滞留時間',
            'accessibility.motor.oneHandedMode': '片手操作モード',
            
            // 認知支援
            'accessibility.cognitive.title': '認知支援',
            'accessibility.cognitive.simplification': 'UI簡素化',
            'accessibility.cognitive.contextualHelp': '文脈的ヘルプ',
            'accessibility.cognitive.errorRecovery': 'エラー回復支援',
            'accessibility.cognitive.memoryAids': '記憶補助',
            'accessibility.cognitive.distractionReduction': '気散らし軽減',
            'accessibility.cognitive.clearLanguage': '明確な言語',
            'accessibility.cognitive.progressIndicators': '進捗表示',
            'accessibility.cognitive.confirmations': '確認ダイアログ',
            
            // プロファイル管理
            'accessibility.profiles.title': 'アクセシビリティプロファイル',
            'accessibility.profiles.current': '現在のプロファイル',
            'accessibility.profiles.switch': 'プロファイル切り替え',
            'accessibility.profiles.create': 'プロファイル作成',
            'accessibility.profiles.edit': 'プロファイル編集',
            'accessibility.profiles.delete': 'プロファイル削除',
            'accessibility.profiles.export': 'プロファイルエクスポート',
            'accessibility.profiles.import': 'プロファイルインポート',
            'accessibility.profiles.share': 'プロファイル共有',
            'accessibility.profiles.recommendation': 'プロファイル推奨',
            
            // プリセットプロファイル
            'accessibility.profiles.preset.visualImpairment': '視覚障害対応',
            'accessibility.profiles.preset.hearingImpairment': '聴覚障害対応',
            'accessibility.profiles.preset.motorImpairment': '運動障害対応',
            'accessibility.profiles.preset.cognitiveSupport': '認知サポート',
            'accessibility.profiles.preset.elderlyFriendly': '高齢者向け',
            'accessibility.profiles.preset.gamingOptimized': 'ゲーミング最適化',
            'accessibility.profiles.preset.minimumCompliance': '最小限準拠',
            
            // オンボーディング
            'accessibility.onboarding.title': 'アクセシビリティガイド',
            'accessibility.onboarding.welcome': 'アクセシビリティ機能へようこそ',
            'accessibility.onboarding.assessment': 'ニーズ評価',
            'accessibility.onboarding.profileSetup': 'プロファイル設定',
            'accessibility.onboarding.featureDiscovery': '機能探索',
            'accessibility.onboarding.practiceSession': '練習セッション',
            'accessibility.onboarding.completion': '設定完了',
            'accessibility.onboarding.next': '次へ',
            'accessibility.onboarding.previous': '前へ',
            'accessibility.onboarding.skip': 'スキップ',
            'accessibility.onboarding.finish': '完了',
            
            // テスト・デバッグ
            'accessibility.testing.title': 'アクセシビリティテスト',
            'accessibility.testing.wcagValidator': 'WCAG準拠チェック',
            'accessibility.testing.screenReaderTest': 'スクリーンリーダーテスト',
            'accessibility.testing.keyboardTest': 'キーボードテスト',
            'accessibility.testing.colorContrastTest': '色コントラストテスト',
            'accessibility.testing.runTests': 'テスト実行',
            'accessibility.testing.results': 'テスト結果',
            'accessibility.testing.passed': '合格',
            'accessibility.testing.failed': '不合格',
            'accessibility.testing.warnings': '警告',
            
            // アナウンス・通知
            'accessibility.announcements.profileActivated': 'プロファイル「{{profileName}}」が適用されました',
            'accessibility.announcements.settingChanged': '設定「{{settingName}}」が変更されました',
            'accessibility.announcements.featureEnabled': '機能「{{featureName}}」が有効になりました',
            'accessibility.announcements.featureDisabled': '機能「{{featureName}}」が無効になりました',
            'accessibility.announcements.testCompleted': 'テスト完了: {{results}}',
            'accessibility.announcements.errorOccurred': 'エラーが発生しました: {{errorMessage}}',
            
            // 文化的適応
            'accessibility.cultural.readingDirection': '読み方向',
            'accessibility.cultural.textDirection': 'テキスト方向',
            'accessibility.cultural.numberFormat': '数値形式',
            'accessibility.cultural.dateFormat': '日付形式',
            'accessibility.cultural.colorMeaning': '色の意味',
            'accessibility.cultural.gestureConventions': 'ジェスチャー規約',
            
            // ヘルプ・説明
            'accessibility.help.title': 'アクセシビリティヘルプ',
            'accessibility.help.gettingStarted': 'はじめに',
            'accessibility.help.keyboardNavigation': 'キーボード操作方法',
            'accessibility.help.screenReaderUsage': 'スクリーンリーダー使用方法',
            'accessibility.help.troubleshooting': 'トラブルシューティング',
            'accessibility.help.bestPractices': 'ベストプラクティス',
            'accessibility.help.feedback': 'フィードバック',
            'accessibility.help.contact': 'お問い合わせ'
        });
        
        // 英語翻訳
        this.translations.set('en', {
            // Menu
            'menu.title': 'BubblePop',
            'menu.subtitle': 'Bubble Popping Game',
            'menu.start': 'Start Game',
            'menu.settings': 'Settings',
            'menu.userInfo': 'User Info',
            'menu.controls': '↑↓: Select  Enter: Confirm  ESC: Exit',
            'menu.clickInfo': 'You can also use mouse clicks',
            
            // Settings
            'settings.title': 'Settings',
            'settings.audio': 'Audio Settings',
            'settings.masterVolume': 'Master Volume',
            'settings.sfxVolume': 'SFX Volume',
            'settings.bgmVolume': 'BGM Volume',
            'settings.mute': 'Mute',
            'settings.language': 'Language',
            'settings.quality': 'Quality',
            'settings.accessibility': 'Accessibility',
            'settings.controls': 'Controls',
            'settings.back': 'Back',
            'settings.reset': 'Reset',
            'settings.apply': 'Apply',
            
            // Quality settings
            'quality.auto': 'Auto',
            'quality.low': 'Low',
            'quality.medium': 'Medium',
            'quality.high': 'High',
            
            // Accessibility
            'accessibility.highContrast': 'High Contrast',
            'accessibility.reducedMotion': 'Reduced Motion',
            'accessibility.largeText': 'Large Text',
            'accessibility.screenReader': 'Screen Reader Support',
            'accessibility.colorBlindSupport': 'Color Blind Support',
            
            // Game screen
            'game.score': 'Score',
            'game.hp': 'HP',
            'game.time': 'Time Left',
            'game.combo': 'Combo',
            'game.pause': 'Pause',
            'game.resume': 'Resume',
            'game.giveUp': 'Give Up',
            'game.gameOver': 'Game Over',
            'game.finalScore': 'Final Score',
            'game.clickToRestart': 'Click to restart',
            
            // Special effects
            'effect.bonusTime': 'Bonus Time',
            'effect.timeStop': 'Time Stop',
            'effect.electric': 'Electric',
            'effect.operationDisabled': 'Controls Disabled!',
            'effect.scoreDouble': 'Score x2!',
            
            // User info
            'userInfo.title': 'User Information',
            'userInfo.playerName': 'Player Name',
            'userInfo.ap': 'AP',
            'userInfo.tap': 'Total AP',
            'userInfo.unlockedStages': 'Unlocked Stages',
            'userInfo.ownedItems': 'Owned Items',
            'userInfo.highScores': 'High Scores',
            'userInfo.noRecords': 'No records yet',
            
            // Username input
            'username.register': 'Register Username',
            'username.change': 'Change Username',
            'username.prompt': 'Enter username (max 10 characters)',
            'username.inputHelp': 'Type and press Enter to confirm, ESC to cancel',
            'username.ok': 'OK',
            'username.cancel': 'Cancel',
            
            // Data clear
            'dataClear.title': 'Confirm Data Clear',
            'dataClear.warning': 'All data will be deleted.',
            'dataClear.irreversible': 'This operation cannot be undone.',
            'dataClear.items': [
                'Username',
                'AP & TAP',
                'High Score Records',
                'Unlocked Stages',
                'Owned Items'
            ],
            'dataClear.execute': 'Delete',
            'dataClear.cancel': 'Cancel',
            
            // Help
            'help.title': 'Controls',
            'help.basicControls': 'Basic Controls',
            'help.gameTips': 'Game Tips',
            'help.bubbleTypes': 'Bubble Types',
            'help.controls': [
                'Click/Tap: Pop bubbles',
                'Drag: Blow bubbles away',
                '↑↓ Keys: Menu selection',
                'Enter: Confirm',
                'ESC: Back/Exit',
                'S: Shop (in stage select)'
            ],
            'help.tips': [
                'Bubbles become dangerous over time',
                'Pop consecutively for combo bonus',
                'Pink bubbles restore HP',
                'Avoid poison bubbles',
                'Hard bubbles need multiple clicks',
                'Special bubbles can be dragged off-screen'
            ],
            'help.bubbles': 'Normal(blue) Stone(gray) Iron(brown) Diamond(white) Pink(heal) Poison(green) Spike(chain) Rainbow(bonus) Clock(timestop) S(score) Electric(stun) Escape(moving)',
            
            // Keyboard shortcuts
            'shortcuts.title': 'Keyboard Shortcuts',
            'shortcuts.pause': 'Pause',
            'shortcuts.menu': 'Menu',
            'shortcuts.fullscreen': 'Fullscreen',
            'shortcuts.mute': 'Mute',
            'shortcuts.settings': 'Settings',
            'shortcuts.help': 'Help',
            
            // Error messages
            'error.generic': 'An error occurred',
            'error.reload': 'Reload',
            'error.canvasNotSupported': 'Your browser does not support Canvas API. Please try a modern browser.',
            'error.audioNotSupported': 'Audio features are not available.',
            'error.storageNotSupported': 'Data storage is not available.',
            
            // Confirmation messages
            'confirm.yes': 'Yes',
            'confirm.no': 'No',
            'confirm.ok': 'OK',
            'confirm.cancel': 'Cancel',
            
            // Accessibility-specific translations
            'accessibility.manager.title': 'Accessibility Settings',
            'accessibility.manager.description': 'Providing inclusive gaming experience for all users',
            'accessibility.manager.enabled': 'Accessibility Features Enabled',
            'accessibility.manager.disabled': 'Accessibility Features Disabled',
            
            // Keyboard accessibility
            'accessibility.keyboard.title': 'Keyboard Navigation',
            'accessibility.keyboard.enabled': 'Keyboard Navigation Enabled',
            'accessibility.keyboard.focusRing': 'Focus Ring Display',
            'accessibility.keyboard.skipLinks': 'Skip Links',
            'accessibility.keyboard.shortcuts': 'Keyboard Shortcuts',
            'accessibility.keyboard.customization': 'Shortcut Customization',
            'accessibility.keyboard.navigation': 'Navigation Settings',
            'accessibility.keyboard.tabOrder': 'Tab Order',
            'accessibility.keyboard.announcement': 'Keyboard Navigation Announcements',
            
            // Screen reader support
            'accessibility.screenReader.title': 'Screen Reader',
            'accessibility.screenReader.enabled': 'Screen Reader Support Enabled',
            'accessibility.screenReader.ariaLabels': 'ARIA Labels',
            'accessibility.screenReader.liveRegions': 'Live Regions',
            'accessibility.screenReader.gameDescriptions': 'Game State Descriptions',
            'accessibility.screenReader.bubbleDescriptions': 'Bubble Descriptions',
            'accessibility.screenReader.announcements': 'Announcement Settings',
            'accessibility.screenReader.speechSynthesis': 'Speech Synthesis',
            'accessibility.screenReader.voiceSettings': 'Voice Settings',
            'accessibility.screenReader.rate': 'Speech Rate',
            'accessibility.screenReader.pitch': 'Pitch',
            'accessibility.screenReader.volume': 'Volume',
            
            // Visual accessibility
            'accessibility.visual.title': 'Visual Assistance',
            'accessibility.visual.contrast': 'Contrast Adjustment',
            'accessibility.visual.textScaling': 'Text Size Adjustment',
            'accessibility.visual.colorBlindness': 'Color Vision Support',
            'accessibility.visual.motionReduction': 'Motion Reduction',
            'accessibility.visual.focusIndicators': 'Focus Indicators',
            'accessibility.visual.colorScheme': 'Color Scheme',
            'accessibility.visual.fontFamily': 'Font Selection',
            'accessibility.visual.animationSettings': 'Animation Settings',
            
            // Audio accessibility
            'accessibility.audio.title': 'Audio Assistance',
            'accessibility.audio.visualFeedback': 'Visual Audio Feedback',
            'accessibility.audio.captions': 'Caption Display',
            'accessibility.audio.soundVisualization': 'Sound Visualization',
            'accessibility.audio.vibrationFeedback': 'Vibration Feedback',
            'accessibility.audio.flashAlerts': 'Flash Alerts',
            'accessibility.audio.captionStyle': 'Caption Style',
            'accessibility.audio.captionSize': 'Caption Size',
            'accessibility.audio.captionPosition': 'Caption Position',
            
            // Motor accessibility
            'accessibility.motor.title': 'Motor Assistance',
            'accessibility.motor.alternativeInput': 'Alternative Input Methods',
            'accessibility.motor.switchInput': 'Switch Input',
            'accessibility.motor.eyeTracking': 'Eye Tracking',
            'accessibility.motor.voiceControl': 'Voice Control',
            'accessibility.motor.gestureCustomization': 'Gesture Customization',
            'accessibility.motor.timingAdjustments': 'Timing Adjustments',
            'accessibility.motor.sensitivity': 'Sensitivity Settings',
            'accessibility.motor.dwellTime': 'Dwell Time',
            'accessibility.motor.oneHandedMode': 'One-handed Mode',
            
            // Cognitive support
            'accessibility.cognitive.title': 'Cognitive Support',
            'accessibility.cognitive.simplification': 'UI Simplification',
            'accessibility.cognitive.contextualHelp': 'Contextual Help',
            'accessibility.cognitive.errorRecovery': 'Error Recovery Assistance',
            'accessibility.cognitive.memoryAids': 'Memory Aids',
            'accessibility.cognitive.distractionReduction': 'Distraction Reduction',
            'accessibility.cognitive.clearLanguage': 'Clear Language',
            'accessibility.cognitive.progressIndicators': 'Progress Indicators',
            'accessibility.cognitive.confirmations': 'Confirmation Dialogs',
            
            // Profile management
            'accessibility.profiles.title': 'Accessibility Profiles',
            'accessibility.profiles.current': 'Current Profile',
            'accessibility.profiles.switch': 'Switch Profile',
            'accessibility.profiles.create': 'Create Profile',
            'accessibility.profiles.edit': 'Edit Profile',
            'accessibility.profiles.delete': 'Delete Profile',
            'accessibility.profiles.export': 'Export Profile',
            'accessibility.profiles.import': 'Import Profile',
            'accessibility.profiles.share': 'Share Profile',
            'accessibility.profiles.recommendation': 'Profile Recommendation',
            
            // Preset profiles
            'accessibility.profiles.preset.visualImpairment': 'Visual Impairment Support',
            'accessibility.profiles.preset.hearingImpairment': 'Hearing Impairment Support',
            'accessibility.profiles.preset.motorImpairment': 'Motor Impairment Support',
            'accessibility.profiles.preset.cognitiveSupport': 'Cognitive Support',
            'accessibility.profiles.preset.elderlyFriendly': 'Elderly-Friendly',
            'accessibility.profiles.preset.gamingOptimized': 'Gaming Optimized',
            'accessibility.profiles.preset.minimumCompliance': 'Minimum Compliance',
            
            // Onboarding
            'accessibility.onboarding.title': 'Accessibility Guide',
            'accessibility.onboarding.welcome': 'Welcome to Accessibility Features',
            'accessibility.onboarding.assessment': 'Needs Assessment',
            'accessibility.onboarding.profileSetup': 'Profile Setup',
            'accessibility.onboarding.featureDiscovery': 'Feature Discovery',
            'accessibility.onboarding.practiceSession': 'Practice Session',
            'accessibility.onboarding.completion': 'Setup Complete',
            'accessibility.onboarding.next': 'Next',
            'accessibility.onboarding.previous': 'Previous',
            'accessibility.onboarding.skip': 'Skip',
            'accessibility.onboarding.finish': 'Finish',
            
            // Testing & debugging
            'accessibility.testing.title': 'Accessibility Testing',
            'accessibility.testing.wcagValidator': 'WCAG Compliance Check',
            'accessibility.testing.screenReaderTest': 'Screen Reader Test',
            'accessibility.testing.keyboardTest': 'Keyboard Test',
            'accessibility.testing.colorContrastTest': 'Color Contrast Test',
            'accessibility.testing.runTests': 'Run Tests',
            'accessibility.testing.results': 'Test Results',
            'accessibility.testing.passed': 'Passed',
            'accessibility.testing.failed': 'Failed',
            'accessibility.testing.warnings': 'Warnings',
            
            // Announcements & notifications
            'accessibility.announcements.profileActivated': 'Profile "{{profileName}}" has been activated',
            'accessibility.announcements.settingChanged': 'Setting "{{settingName}}" has been changed',
            'accessibility.announcements.featureEnabled': 'Feature "{{featureName}}" has been enabled',
            'accessibility.announcements.featureDisabled': 'Feature "{{featureName}}" has been disabled',
            'accessibility.announcements.testCompleted': 'Test completed: {{results}}',
            'accessibility.announcements.errorOccurred': 'Error occurred: {{errorMessage}}',
            
            // Cultural adaptation
            'accessibility.cultural.readingDirection': 'Reading Direction',
            'accessibility.cultural.textDirection': 'Text Direction',
            'accessibility.cultural.numberFormat': 'Number Format',
            'accessibility.cultural.dateFormat': 'Date Format',
            'accessibility.cultural.colorMeaning': 'Color Meaning',
            'accessibility.cultural.gestureConventions': 'Gesture Conventions',
            
            // Help & explanations
            'accessibility.help.title': 'Accessibility Help',
            'accessibility.help.gettingStarted': 'Getting Started',
            'accessibility.help.keyboardNavigation': 'Keyboard Navigation Guide',
            'accessibility.help.screenReaderUsage': 'Screen Reader Usage Guide',
            'accessibility.help.troubleshooting': 'Troubleshooting',
            'accessibility.help.bestPractices': 'Best Practices',
            'accessibility.help.feedback': 'Feedback',
            'accessibility.help.contact': 'Contact Us'
        });
        
        this.loadedLanguages.add('ja');
        this.loadedLanguages.add('en');
    }
    
    /**
     * 言語を設定（非同期・最適化版）
     */
    async setLanguage(language) {
        try {
            const oldLanguage = this.currentLanguage;
            
            // パフォーマンス監視開始
            const switchMeasurement = await this.performanceMonitor.measureLanguageSwitch(
                oldLanguage, 
                language, 
                async () => {
                    // 言語がロードされていない場合は読み込み
                    if (!this.loadedLanguages.has(language)) {
                        await this.loadLanguageData(language);
                    }
                    
                    if (this.loadedLanguages.has(language)) {
                        // レンダリング最適化付き言語切り替え
                        const renderResult = await this.renderOptimizer.optimizeLanguageSwitch(
                            oldLanguage,
                            language,
                            async (element) => {
                                // UI要素の更新処理
                                return this.updateElementLanguage(element, language);
                            }
                        );
                        
                        this.currentLanguage = language;
                        
                        // フォントを読み込み
                        await this.loadFontsForLanguage(language);
                        
                        // 言語変更イベントを通知
                        this.notifyLanguageChange(language, oldLanguage);
                        
                        return { success: true, renderResult };
                    } else {
                        throw new Error(`Failed to load language: ${language}`);
                    }
                }
            );
            
            console.log(`Language switched to ${language} in ${switchMeasurement.duration.toFixed(2)}ms`);
            return true;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'LOCALIZATION_ERROR', {
                operation: 'setLanguage',
                language: language
            });
            return false;
        }
    }
    
    /**
     * 言語データを読み込み（最適化版）
     */
    async loadLanguageData(language) {
        try {
            // 最適化されたローダーを使用
            const translations = await this.optimizedLoader.loadLanguage(language, {
                priority: language === this.currentLanguage ? 'high' : 'medium'
            });
            
            if (translations && Object.keys(translations).length > 0) {
                this.translations.set(language, translations);
                this.loadedLanguages.add(language);
                console.log(`Loaded optimized language data for: ${language}`);
                return true;
            } else {
                console.warn(`No translations found for: ${language}`);
                return false;
            }
        } catch (error) {
            // フルバック: 通常のローダーを試す
            console.warn(`Optimized loader failed for ${language}, trying fallback...`);
            try {
                const translations = await this.translationLoader.loadLanguage(language);
                if (translations && Object.keys(translations).length > 0) {
                    this.translations.set(language, translations);
                    this.loadedLanguages.add(language);
                    console.log(`Loaded fallback language data for: ${language}`);
                    return true;
                }
            } catch (fallbackError) {
                getErrorHandler().handleError(fallbackError, 'LOCALIZATION_ERROR', {
                    operation: 'loadLanguageData',
                    language: language
                });
            }
            return false;
        }
    }
    
    /**
     * 翻訳を取得（パフォーマンス監視付き）
     */
    t(key, params = {}) {
        try {
            // パフォーマンス測定開始
            const measurement = this.performanceMonitor.startTranslationMeasurement(key, this.currentLanguage);
            
            // 現在の言語で翻訳を取得
            let translation = this.getTranslation(key, this.currentLanguage);
            
            // 見つからない場合はフォールバック言語を試す
            if (translation === null && this.currentLanguage !== this.fallbackLanguage) {
                translation = this.getTranslation(key, this.fallbackLanguage);
            }
            
            // それでも見つからない場合はキーをそのまま返す
            if (translation === null) {
                console.warn(`Translation not found: ${key}`);
                this.performanceMonitor.endTranslationMeasurement(measurement, false);
                return key;
            }
            
            // パラメータ置換
            const result = this.interpolate(translation, params);
            
            // パフォーマンス測定終了
            this.performanceMonitor.endTranslationMeasurement(measurement, true);
            
            return result;
        } catch (error) {
            getErrorHandler().handleError(error, 'LOCALIZATION_ERROR', {
                operation: 'translate',
                key: key,
                language: this.currentLanguage,
                params: params
            });
            return key;
        }
    }
    
    /**
     * 翻訳を取得（内部メソッド）
     */
    getTranslation(key, language) {
        const languageData = this.translations.get(language);
        if (!languageData) {
            return null;
        }
        
        // ネストしたキーに対応
        const keys = key.split('.');
        let value = languageData;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return null;
            }
        }
        
        return typeof value === 'string' ? value : null;
    }
    
    /**
     * パラメータ置換
     */
    interpolate(text, params) {
        if (typeof text !== 'string' || Object.keys(params).length === 0) {
            return text;
        }
        
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }
    
    /**
     * 複数形対応の翻訳
     */
    tn(key, count, params = {}) {
        const pluralKey = count === 1 ? `${key}.singular` : `${key}.plural`;
        const translation = this.t(pluralKey, { ...params, count });
        
        // 複数形キーが見つからない場合は通常のキーを試す
        if (translation === pluralKey) {
            return this.t(key, { ...params, count });
        }
        
        return translation;
    }
    
    /**
     * 配列翻訳を取得
     */
    ta(key) {
        try {
            const languageData = this.translations.get(this.currentLanguage);
            if (!languageData) {
                return [];
            }
            
            const keys = key.split('.');
            let value = languageData;
            
            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k];
                } else {
                    return [];
                }
            }
            
            return Array.isArray(value) ? value : [];
        } catch (error) {
            getErrorHandler().handleError(error, 'LOCALIZATION_ERROR', {
                operation: 'translateArray',
                key: key,
                language: this.currentLanguage
            });
            return [];
        }
    }
    
    /**
     * 現在の言語を取得
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    /**
     * 利用可能な言語一覧を取得
     */
    getAvailableLanguages() {
        return Array.from(this.loadedLanguages);
    }
    
    /**
     * 言語情報を取得
     */
    getLanguageInfo(language) {
        const languageNames = {
            'ja': { native: '日本語', english: 'Japanese' },
            'en': { native: 'English', english: 'English' }
        };
        
        return languageNames[language] || { native: language, english: language };
    }
    
    /**
     * 翻訳データを追加
     */
    addTranslations(language, translations) {
        try {
            if (!this.translations.has(language)) {
                this.translations.set(language, {});
            }
            
            const existingTranslations = this.translations.get(language);
            const mergedTranslations = { ...existingTranslations, ...translations };
            
            this.translations.set(language, mergedTranslations);
            this.loadedLanguages.add(language);
            
            console.log(`Added translations for language: ${language}`);
            return true;
        } catch (error) {
            getErrorHandler().handleError(error, 'LOCALIZATION_ERROR', {
                operation: 'addTranslations',
                language: language,
                translationsCount: Object.keys(translations).length
            });
            return false;
        }
    }
    
    /**
     * 翻訳の統計情報を取得
     */
    getStats() {
        const stats = {
            currentLanguage: this.currentLanguage,
            availableLanguages: this.getAvailableLanguages(),
            translationCounts: {}
        };
        
        for (const [language, translations] of this.translations) {
            stats.translationCounts[language] = this.countTranslations(translations);
        }
        
        return stats;
    }
    
    /**
     * 翻訳数をカウント（再帰的）
     */
    countTranslations(obj) {
        let count = 0;
        
        for (const value of Object.values(obj)) {
            if (typeof value === 'string') {
                count++;
            } else if (typeof value === 'object' && value !== null) {
                count += this.countTranslations(value);
            } else if (Array.isArray(value)) {
                count += value.length;
            }
        }
        
        return count;
    }
    
    /**
     * 翻訳の検証
     */
    validateTranslations() {
        const results = {};
        const baseLanguage = this.fallbackLanguage;
        const baseTranslations = this.translations.get(baseLanguage);
        
        if (!baseTranslations) {
            return { error: `Base language ${baseLanguage} not found` };
        }
        
        const baseKeys = this.extractKeys(baseTranslations);
        
        for (const language of this.loadedLanguages) {
            if (language === baseLanguage) continue;
            
            const translations = this.translations.get(language);
            const keys = this.extractKeys(translations);
            
            results[language] = {
                missing: baseKeys.filter(key => !keys.includes(key)),
                extra: keys.filter(key => !baseKeys.includes(key)),
                total: keys.length,
                coverage: Math.round((keys.length / baseKeys.length) * 100)
            };
        }
        
        return results;
    }
    
    /**
     * 翻訳キーを抽出（再帰的）
     */
    extractKeys(obj, prefix = '') {
        const keys = [];
        
        for (const [key, value] of Object.entries(obj)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            
            if (typeof value === 'string') {
                keys.push(fullKey);
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                keys.push(...this.extractKeys(value, fullKey));
            } else if (Array.isArray(value)) {
                keys.push(fullKey);
            }
        }
        
        return keys;
    }
    
    /**
     * 文化的適応情報の取得
     */
    getCulturalAdaptation(language = null) {
        const lang = language || this.currentLanguage;
        return {
            isRTL: this.isRTLLanguage(lang),
            textDirection: this.getTextDirection(lang),
            numeralSystem: this.getNumeralSystem(lang),
            dateFormat: this.getDateFormat(lang),
            colorMeanings: this.getColorMeanings(lang),
            gestureConventions: this.getGestureConventions(lang)
        };
    }
    
    /**
     * RTL言語の判定
     */
    isRTLLanguage(language) {
        return this.culturalAdaptation.rtlLanguages.includes(language);
    }
    
    /**
     * テキスト方向の取得
     */
    getTextDirection(language) {
        return this.isRTLLanguage(language) ? 'rtl' : 'ltr';
    }
    
    /**
     * 数字システムの取得
     */
    getNumeralSystem(language) {
        return this.culturalAdaptation.numeralSystems[language] || 'default';
    }
    
    /**
     * 日付形式の取得
     */
    getDateFormat(language) {
        return this.culturalAdaptation.dateFormats[language] || 'MM/DD/YYYY';
    }
    
    /**
     * 色の意味の取得
     */
    getColorMeanings(language) {
        return this.culturalAdaptation.colorMeanings[language] || 
               this.culturalAdaptation.colorMeanings['en'];
    }
    
    /**
     * ジェスチャー規約の取得
     */
    getGestureConventions(language) {
        return this.culturalAdaptation.gestureConventions[language] || 
               this.culturalAdaptation.gestureConventions['en'];
    }
    
    /**
     * アクセシビリティ専用翻訳の追加
     */
    addAccessibilityTranslations(language, translations) {
        try {
            if (!this.accessibilityTranslations.has(language)) {
                this.accessibilityTranslations.set(language, {});
            }
            
            const existing = this.accessibilityTranslations.get(language);
            const merged = { ...existing, ...translations };
            
            this.accessibilityTranslations.set(language, merged);
            
            console.log(`Added accessibility translations for ${language}: ${Object.keys(translations).length} keys`);
            return true;
        } catch (error) {
            getErrorHandler().handleError(error, 'LOCALIZATION_ERROR', {
                operation: 'addAccessibilityTranslations',
                language: language
            });
            return false;
        }
    }
    
    /**
     * アクセシビリティ翻訳の取得
     */
    getAccessibilityTranslation(key, language = null) {
        const lang = language || this.currentLanguage;
        const translations = this.accessibilityTranslations.get(lang);
        
        if (!translations) {
            return null;
        }
        
        const keys = key.split('.');
        let value = translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return null;
            }
        }
        
        return typeof value === 'string' ? value : null;
    }
    
    /**
     * 文化的に適応したテキストフォーマット
     */
    formatCulturalText(text, type, language = null) {
        const lang = language || this.currentLanguage;
        
        switch (type) {
            case 'number':
                return this.formatNumber(text, lang);
            case 'date':
                return this.formatDate(text, lang);
            case 'currency':
                return this.formatCurrency(text, lang);
            default:
                return text;
        }
    }
    
    /**
     * 数値のフォーマット
     */
    formatNumber(number, language) {
        try {
            return new Intl.NumberFormat(language).format(number);
        } catch (error) {
            console.warn(`Number formatting failed for ${language}:`, error);
            return number.toString();
        }
    }
    
    /**
     * 日付のフォーマット
     */
    formatDate(date, language) {
        try {
            return new Intl.DateTimeFormat(language).format(new Date(date));
        } catch (error) {
            console.warn(`Date formatting failed for ${language}:`, error);
            return date.toString();
        }
    }
    
    /**
     * 通貨のフォーマット
     */
    formatCurrency(amount, language, currency = 'USD') {
        try {
            return new Intl.NumberFormat(language, {
                style: 'currency',
                currency: currency
            }).format(amount);
        } catch (error) {
            console.warn(`Currency formatting failed for ${language}:`, error);
            return `${currency} ${amount}`;
        }
    }
    
    /**
     * アクセシビリティ文脈での翻訳
     */
    ta11y(key, params = {}) {
        // アクセシビリティ専用翻訳を最初に確認
        let translation = this.getAccessibilityTranslation(key);
        
        // 見つからない場合は通常の翻訳を使用
        if (!translation) {
            translation = this.getTranslation(key, this.currentLanguage);
        }
        
        // フォールバック処理
        if (!translation && this.currentLanguage !== this.fallbackLanguage) {
            translation = this.getTranslation(key, this.fallbackLanguage);
        }
        
        if (!translation) {
            console.warn(`Accessibility translation not found: ${key}`);
            return key;
        }
        
        return this.interpolate(translation, params);
    }
    
    /**
     * 地域固有の設定取得
     */
    getRegionalSettings(language = null) {
        const lang = language || this.currentLanguage;
        
        return {
            language: lang,
            locale: this.getLocale(lang),
            direction: this.getTextDirection(lang),
            calendar: this.getCalendarSystem(lang),
            timeZone: this.getTimeZone(lang),
            weekStart: this.getWeekStart(lang)
        };
    }
    
    /**
     * ロケールの取得
     */
    getLocale(language) {
        const localeMap = {
            'ja': 'ja-JP',
            'en': 'en-US',
            'en-gb': 'en-GB',
            'de': 'de-DE',
            'fr': 'fr-FR',
            'zh': 'zh-CN',
            'ko': 'ko-KR'
        };
        
        return localeMap[language] || language;
    }
    
    /**
     * カレンダーシステムの取得
     */
    getCalendarSystem(language) {
        const calendarMap = {
            'ja': 'japanese',
            'ar': 'islamic',
            'he': 'hebrew',
            'th': 'buddhist'
        };
        
        return calendarMap[language] || 'gregorian';
    }
    
    /**
     * タイムゾーンの取得
     */
    getTimeZone(language) {
        const timezoneMap = {
            'ja': 'Asia/Tokyo',
            'en': 'America/New_York',
            'en-gb': 'Europe/London',
            'de': 'Europe/Berlin',
            'fr': 'Europe/Paris'
        };
        
        return timezoneMap[language] || 'UTC';
    }
    
    /**
     * 週の開始日の取得
     */
    getWeekStart(language) {
        const weekStartMap = {
            'en': 0, // Sunday
            'en-gb': 1, // Monday
            'de': 1,
            'fr': 1,
            'ja': 0
        };
        
        return weekStartMap[language] || 1;
    }
    
    /**
     * 包括的翻訳統計
     */
    getAccessibilityStats() {
        const stats = this.getStats();
        
        // アクセシビリティ翻訳の統計を追加
        stats.accessibilityTranslations = {};
        for (const [language, translations] of this.accessibilityTranslations) {
            stats.accessibilityTranslations[language] = this.countTranslations(translations);
        }
        
        // 文化的適応サポート状況
        stats.culturalSupport = {
            rtlLanguages: this.culturalAdaptation.rtlLanguages.length,
            numeralSystems: Object.keys(this.culturalAdaptation.numeralSystems).length,
            dateFormats: Object.keys(this.culturalAdaptation.dateFormats).length,
            colorMeanings: Object.keys(this.culturalAdaptation.colorMeanings).length
        };
        
        return stats;
    }
    
    /**
     * 言語変更リスナーを追加
     */
    addLanguageChangeListener(listener) {
        if (typeof listener === 'function') {
            this.languageChangeListeners.add(listener);
            return true;
        }
        return false;
    }
    
    /**
     * 言語変更リスナーを削除
     */
    removeLanguageChangeListener(listener) {
        return this.languageChangeListeners.delete(listener);
    }
    
    /**
     * 言語変更イベントを通知
     */
    notifyLanguageChange(newLanguage, oldLanguage) {
        for (const listener of this.languageChangeListeners) {
            try {
                listener(newLanguage, oldLanguage);
            } catch (error) {
                console.warn('Language change listener error:', error);
            }
        }
    }
    
    /**
     * 言語用のフォントを読み込み
     */
    async loadFontsForLanguage(language) {
        try {
            console.log(`Loading fonts for language: ${language}`);
            const result = await this.fontManager.loadFontsForLanguage(language, 'primary');
            
            if (result) {
                // グローバルCSSを適用
                this.applyGlobalFontStyles(language);
            }
            
            return result;
        } catch (error) {
            console.warn(`Failed to load fonts for ${language}:`, error);
            return false;
        }
    }
    
    /**
     * グローバルフォントスタイルを適用
     */
    applyGlobalFontStyles(language) {
        try {
            // 既存のフォントスタイルを削除
            const existingStyle = document.getElementById('localization-font-styles');
            if (existingStyle) {
                existingStyle.remove();
            }
            
            // 新しいスタイルを作成
            const style = document.createElement('style');
            style.id = 'localization-font-styles';
            style.textContent = this.fontManager.generateGlobalFontCSS(language);
            
            document.head.appendChild(style);
            
            // HTML要素に言語属性を設定
            document.documentElement.lang = language;
            
            console.log(`Global font styles applied for ${language}`);
        } catch (error) {
            console.warn(`Failed to apply global font styles:`, error);
        }
    }
    
    /**
     * 現在の言語のフォントスタックを取得
     */
    getFontStack(priority = 'primary') {
        return this.fontManager.getFontStack(this.currentLanguage, priority);
    }
    
    /**
     * 要素にフォントを適用
     */
    applyFontToElement(element, priority = 'primary') {
        return this.fontManager.applyFontToElement(element, this.currentLanguage, priority);
    }
    
    /**
     * フォント読み込み状態を取得
     */
    getFontLoadingStatus() {
        return this.fontManager.getStats();
    }
    
    /**
     * 複数言語のフォントを事前読み込み
     */
    async preloadFonts(languages) {
        console.log(`Preloading fonts for languages: ${languages.join(', ')}`);
        return await this.fontManager.preloadFontsForLanguages(languages);
    }
    
    /**
     * UI要素の言語更新（レンダリング最適化用）
     */
    updateElementLanguage(element, language) {
        try {
            // data-i18n属性からキーを取得
            const translationKey = element.getAttribute('data-i18n');
            if (translationKey) {
                const translation = this.getTranslation(translationKey, language);
                if (translation) {
                    return translation;
                }
            }
            
            // data-i18n-attr属性からキーを取得（属性翻訳）
            const attrKey = element.getAttribute('data-i18n-attr');
            if (attrKey) {
                const translation = this.getTranslation(attrKey, language);
                if (translation) {
                    return translation;
                }
            }
            
            return element.textContent;
        } catch (error) {
            console.warn('Element language update failed:', error);
            return element.textContent;
        }
    }
    
    /**
     * パフォーマンス統計の取得
     */
    getPerformanceStats() {
        return {
            translation: this.performanceMonitor.generatePerformanceReport(),
            loading: this.optimizedLoader.getPerformanceStats(),
            rendering: this.renderOptimizer.getPerformanceStats()
        };
    }
    
    /**
     * 遅延翻訳読み込み
     */
    async loadNamespace(language, namespace) {
        try {
            const data = await this.optimizedLoader.lazyLoadNamespace(language, namespace);
            if (data) {
                // 既存の翻訳データにマージ
                const existing = this.translations.get(language) || {};
                this.translations.set(language, { ...existing, ...data });
                return true;
            }
            return false;
        } catch (error) {
            console.warn(`Failed to load namespace ${namespace} for ${language}:`, error);
            return false;
        }
    }
    
    /**
     * 翻訳キャッシュのクリア
     */
    clearTranslationCache() {
        this.optimizedLoader.clearCache();
        this.renderOptimizer.clearCaches();
        console.log('Translation caches cleared');
    }
    
    /**
     * パフォーマンス監視の停止
     */
    stopPerformanceMonitoring() {
        this.performanceMonitor.stopMonitoring();
    }
    
    /**
     * パフォーマンス監視の再開
     */
    startPerformanceMonitoring() {
        this.performanceMonitor.startMonitoring();
    }
    
    /**
     * クリーンアップ
     */
    cleanup() {
        // パフォーマンス監視の停止
        this.performanceMonitor.cleanup();
        
        // レンダリング最適化のクリーンアップ
        this.renderOptimizer.cleanup();
        
        // 最適化ローダーのクリーンアップ
        this.optimizedLoader.cleanup();
        
        // アクセシビリティ翻訳データのクリア
        this.accessibilityTranslations.clear();
        
        // 言語変更リスナーのクリア
        this.languageChangeListeners.clear();
        
        // フォントキャッシュのクリア
        this.fontManager.clearCache();
        
        console.log('LocalizationManager cleanup completed');
    }
}