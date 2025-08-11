/**
 * TranslationDataManager - 翻訳データ管理システム
 * 
 * 翻訳辞書、言語データ、フォールバック処理、アクセシビリティ翻訳を専門的に管理します
 */
export class TranslationDataManager {
    constructor() {
        this.translations = new Map();
        this.loadedLanguages = new Set();
        this.accessibilityTranslations = new Map();
        
        // 翻訳データを初期化
        this.initializeTranslations();
        this.initializeAccessibilityTranslations();
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
            'confirm.cancel': 'キャンセル'
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
            'menu.clickInfo': 'You can also use clicks',
            
            // Settings
            'settings.title': 'Settings',
            'settings.audio': 'Audio Settings',
            'settings.masterVolume': 'Master Volume',
            'settings.sfxVolume': 'SFX Volume',
            'settings.bgmVolume': 'BGM Volume',
            'settings.mute': 'Mute',
            'settings.language': 'Language',
            'settings.quality': 'Quality Settings',
            'settings.accessibility': 'Accessibility',
            'settings.controls': 'Controls',
            'settings.back': 'Back',
            'settings.reset': 'Reset',
            'settings.apply': 'Apply',
            
            // Quality
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
            
            // Game
            'game.score': 'Score',
            'game.hp': 'HP',
            'game.time': 'Time Left',
            'game.combo': 'Combo',
            'game.pause': 'Pause',
            'game.resume': 'Resume',
            'game.giveUp': 'Give Up',
            'game.gameOver': 'Game Over',
            'game.finalScore': 'Final Score',
            'game.clickToRestart': 'Click to Restart',
            
            // Effects
            'effect.bonusTime': 'Bonus Time',
            'effect.timeStop': 'Time Stop',
            'effect.electric': 'Electric',
            'effect.operationDisabled': 'Operation Disabled!',
            'effect.scoreDouble': 'Score Double!',
            
            // User Info
            'userInfo.title': 'User Information',
            'userInfo.playerName': 'Player Name',
            'userInfo.ap': 'AP',
            'userInfo.tap': 'Total TAP',
            'userInfo.unlockedStages': 'Unlocked Stages',
            'userInfo.ownedItems': 'Owned Items',
            'userInfo.highScores': 'High Scores',
            'userInfo.noRecords': 'No records yet',
            
            // Username
            'username.register': 'Register Username',
            'username.change': 'Change Username',
            'username.prompt': 'Enter username (max 10 characters)',
            'username.inputHelp': 'Type and press Enter to confirm, ESC to cancel',
            'username.ok': 'OK',
            'username.cancel': 'Cancel',
            
            // Data Clear
            'dataClear.title': 'Data Clear Confirmation',
            'dataClear.warning': 'All data will be deleted.',
            'dataClear.irreversible': 'This action cannot be undone.',
            'dataClear.items': [
                'Username',
                'AP & TAP',
                'High Score Records',
                'Unlocked Stages',
                'Owned Items'
            ],
            'dataClear.execute': 'Execute Delete',
            'dataClear.cancel': 'Cancel',
            
            // Help
            'help.title': 'Controls',
            'help.basicControls': 'Basic Controls',
            'help.gameTips': 'Game Tips',
            'help.bubbleTypes': 'Bubble Types',
            'help.controls': [
                'Click/Tap: Pop bubbles',
                'Drag: Blow away bubbles',
                '↑↓ Keys: Select menu',
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
                'Push special bubbles off screen'
            ],
            'help.bubbles': 'Normal(Blue) Stone(Gray) Iron(Brown) Diamond(White) Pink(Heal) Poison(Green) Spiky(Chain) Rainbow(Bonus) Clock(Time) S-shape(Score) Electric(Hinder) Escape(Move)',
            
            // Shortcuts
            'shortcuts.title': 'Keyboard Shortcuts',
            'shortcuts.pause': 'Pause',
            'shortcuts.menu': 'Menu',
            'shortcuts.fullscreen': 'Fullscreen',
            'shortcuts.mute': 'Mute',
            'shortcuts.settings': 'Settings',
            'shortcuts.help': 'Help',
            
            // Errors
            'error.generic': 'An error occurred',
            'error.reload': 'Reload',
            'error.canvasNotSupported': 'Your browser does not support Canvas API. Please try with a modern browser.',
            'error.audioNotSupported': 'Audio features are not available.',
            'error.storageNotSupported': 'Data storage is not available.',
            
            // Confirm
            'confirm.yes': 'Yes',
            'confirm.no': 'No',
            'confirm.ok': 'OK',
            'confirm.cancel': 'Cancel'
        });
        
        this.loadedLanguages.add('ja');
        this.loadedLanguages.add('en');
    }
    
    /**
     * アクセシビリティ専用翻訳データの初期化
     */
    initializeAccessibilityTranslations() {
        // 日本語アクセシビリティ翻訳
        this.accessibilityTranslations.set('ja', {
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
            'accessibility.motor.clickAssist': 'クリック補助',
            'accessibility.motor.dragAssist': 'ドラッグ補助',
            'accessibility.motor.timing': 'タイミング調整',
            'accessibility.motor.pauseOptions': '一時停止オプション',
            'accessibility.motor.inputSettings': '入力設定',
            'accessibility.motor.gestureCustomization': 'ジェスチャーカスタマイズ',
            'accessibility.motor.autoAdvance': '自動進行'
        });
        
        // 英語アクセシビリティ翻訳
        this.accessibilityTranslations.set('en', {
            // Accessibility Manager
            'accessibility.manager.title': 'Accessibility Settings',
            'accessibility.manager.description': 'Providing friendly game experience for all users',
            'accessibility.manager.enabled': 'Accessibility Features Enabled',
            'accessibility.manager.disabled': 'Accessibility Features Disabled',
            
            // Keyboard Accessibility
            'accessibility.keyboard.title': 'Keyboard Operation',
            'accessibility.keyboard.enabled': 'Keyboard Navigation Enabled',
            'accessibility.keyboard.focusRing': 'Focus Ring Display',
            'accessibility.keyboard.skipLinks': 'Skip Links',
            'accessibility.keyboard.shortcuts': 'Keyboard Shortcuts',
            'accessibility.keyboard.customization': 'Shortcut Customization',
            'accessibility.keyboard.navigation': 'Navigation Settings',
            'accessibility.keyboard.tabOrder': 'Tab Order',
            'accessibility.keyboard.announcement': 'Keyboard Operation Announcement',
            
            // Screen Reader Support
            'accessibility.screenReader.title': 'Screen Reader',
            'accessibility.screenReader.enabled': 'Screen Reader Support Enabled',
            'accessibility.screenReader.ariaLabels': 'ARIA Labels',
            'accessibility.screenReader.liveRegions': 'Live Regions',
            'accessibility.screenReader.gameDescriptions': 'Game State Descriptions',
            'accessibility.screenReader.bubbleDescriptions': 'Bubble Descriptions',
            'accessibility.screenReader.announcements': 'Announcement Settings',
            'accessibility.screenReader.speechSynthesis': 'Speech Synthesis',
            'accessibility.screenReader.voiceSettings': 'Voice Settings',
            'accessibility.screenReader.rate': 'Reading Speed',
            'accessibility.screenReader.pitch': 'Pitch',
            'accessibility.screenReader.volume': 'Volume',
            
            // Visual Accessibility
            'accessibility.visual.title': 'Visual Assistance',
            'accessibility.visual.contrast': 'Contrast Adjustment',
            'accessibility.visual.textScaling': 'Text Size Adjustment',
            'accessibility.visual.colorBlindness': 'Color Blind Support',
            'accessibility.visual.motionReduction': 'Motion Reduction',
            'accessibility.visual.focusIndicators': 'Focus Indicators',
            'accessibility.visual.colorScheme': 'Color Scheme',
            'accessibility.visual.fontFamily': 'Font Selection',
            'accessibility.visual.animationSettings': 'Animation Settings',
            
            // Audio Accessibility
            'accessibility.audio.title': 'Audio Assistance',
            'accessibility.audio.visualFeedback': 'Visual Audio Feedback',
            'accessibility.audio.captions': 'Caption Display',
            'accessibility.audio.soundVisualization': 'Sound Visualization',
            'accessibility.audio.vibrationFeedback': 'Vibration Feedback',
            'accessibility.audio.flashAlerts': 'Flash Alerts',
            'accessibility.audio.captionStyle': 'Caption Style',
            'accessibility.audio.captionSize': 'Caption Size',
            'accessibility.audio.captionPosition': 'Caption Position',
            
            // Motor Accessibility
            'accessibility.motor.title': 'Motor Function Assistance',
            'accessibility.motor.alternativeInput': 'Alternative Input Methods',
            'accessibility.motor.clickAssist': 'Click Assistance',
            'accessibility.motor.dragAssist': 'Drag Assistance',
            'accessibility.motor.timing': 'Timing Adjustment',
            'accessibility.motor.pauseOptions': 'Pause Options',
            'accessibility.motor.inputSettings': 'Input Settings',
            'accessibility.motor.gestureCustomization': 'Gesture Customization',
            'accessibility.motor.autoAdvance': 'Auto Advance'
        });
    }
    
    /**
     * 翻訳を取得
     * @param {string} language - 言語コード
     * @param {string} key - 翻訳キー
     * @param {string} fallbackLanguage - フォールバック言語
     * @returns {string|Array} 翻訳テキスト
     */
    getTranslation(language, key, fallbackLanguage = 'en') {
        // メイン翻訳から取得
        if (this.translations.has(language)) {
            const langTranslations = this.translations.get(language);
            
            // 特定のキーのデバッグ（menu.help と help.accessibility.categoryList のみ）
            if (key === 'menu.help' || key === 'help.accessibility.categoryList') {
                console.log(`TranslationDataManager: Searching for key "${key}" in ${language}`);
                console.log(`TranslationDataManager: Language data exists:`, !!langTranslations);
                console.log(`TranslationDataManager: Total keys in ${language}:`, Object.keys(langTranslations || {}).length);
                console.log(`TranslationDataManager: Key exists in data:`, key in langTranslations);
                console.log(`TranslationDataManager: Key value:`, langTranslations[key]);
                
                // Map直接確認
                const directMapData = this.translations.get(language);
                console.log(`TranslationDataManager: Direct map data exists:`, !!directMapData);
                console.log(`TranslationDataManager: Direct map total keys:`, Object.keys(directMapData || {}).length);
                console.log(`TranslationDataManager: Direct map has key:`, key in (directMapData || {}));
                console.log(`TranslationDataManager: Reference equality:`, langTranslations === directMapData);
                
                console.log(`TranslationDataManager: Keys starting with 'menu':`, 
                    Object.keys(langTranslations || {}).filter(k => k.startsWith('menu')).slice(0, 5));
                console.log(`TranslationDataManager: Keys starting with 'help.accessibility':`, 
                    Object.keys(langTranslations || {}).filter(k => k.startsWith('help.accessibility')).slice(0, 5));
            }
            
            if (langTranslations[key] !== undefined) {
                return langTranslations[key];
            }
        }
        
        // アクセシビリティ翻訳から取得
        if (this.accessibilityTranslations.has(language)) {
            const accessibilityLangTranslations = this.accessibilityTranslations.get(language);
            if (accessibilityLangTranslations[key] !== undefined) {
                return accessibilityLangTranslations[key];
            }
        }
        
        // フォールバック言語から取得
        if (fallbackLanguage !== language) {
            if (this.translations.has(fallbackLanguage)) {
                const fallbackTranslations = this.translations.get(fallbackLanguage);
                if (fallbackTranslations[key] !== undefined) {
                    return fallbackTranslations[key];
                }
            }
            
            if (this.accessibilityTranslations.has(fallbackLanguage)) {
                const fallbackAccessibilityTranslations = this.accessibilityTranslations.get(fallbackLanguage);
                if (fallbackAccessibilityTranslations[key] !== undefined) {
                    return fallbackAccessibilityTranslations[key];
                }
            }
        }
        
        // 翻訳が見つからない場合はキーをそのまま返す
        console.warn(`Translation not found for key: ${key} in language: ${language}`);
        return key;
    }
    
    /**
     * 言語の翻訳データを設定
     * @param {string} language - 言語コード
     * @param {Object} translationData - 翻訳データ
     */
    setLanguageData(language, translationData) {
        const existingTranslations = this.translations.get(language) || {};
        const mergedTranslations = { ...existingTranslations, ...translationData };
        
        console.log(`TranslationDataManager: Setting ${Object.keys(translationData || {}).length} new keys for ${language}`);
        console.log(`TranslationDataManager: Sample new keys:`, Object.keys(translationData || {}).slice(0, 10));
        console.log(`TranslationDataManager: Total merged keys:`, Object.keys(mergedTranslations).length);
        console.log(`TranslationDataManager: Has menu.help:`, 'menu.help' in mergedTranslations);
        console.log(`TranslationDataManager: Has help.accessibility.categoryList:`, 'help.accessibility.categoryList' in mergedTranslations);
        
        this.translations.set(language, mergedTranslations);
        this.loadedLanguages.add(language);
        
        // 設定直後の確認
        const storedData = this.translations.get(language);
        console.log(`TranslationDataManager: After setting - stored keys:`, Object.keys(storedData || {}).length);
        console.log(`TranslationDataManager: After setting - has menu.help:`, 'menu.help' in (storedData || {}));
        console.log(`TranslationDataManager: After setting - memory reference same:`, storedData === mergedTranslations);
    }
    
    /**
     * アクセシビリティ翻訳データを設定
     * @param {string} language - 言語コード
     * @param {Object} accessibilityData - アクセシビリティ翻訳データ
     */
    setAccessibilityData(language, accessibilityData) {
        this.accessibilityTranslations.set(language, accessibilityData);
    }
    
    /**
     * 言語が読み込まれているかチェック
     * @param {string} language - 言語コード
     * @returns {boolean} 読み込み状態
     */
    isLanguageLoaded(language) {
        return this.loadedLanguages.has(language);
    }
    
    /**
     * 利用可能な言語一覧を取得
     * @returns {Array<string>} 言語コード配列
     */
    getAvailableLanguages() {
        return Array.from(this.loadedLanguages);
    }
    
    /**
     * 翻訳データの統計を取得
     * @returns {Object} 統計情報
     */
    getTranslationStats() {
        const stats = {
            loadedLanguages: Array.from(this.loadedLanguages),
            languageCount: this.loadedLanguages.size,
            translations: {},
            accessibilityTranslations: {}
        };
        
        // メイン翻訳の統計
        for (const [lang, translations] of this.translations.entries()) {
            stats.translations[lang] = {
                keyCount: Object.keys(translations).length,
                arrayCount: Object.values(translations).filter(v => Array.isArray(v)).length
            };
        }
        
        // アクセシビリティ翻訳の統計
        for (const [lang, translations] of this.accessibilityTranslations.entries()) {
            stats.accessibilityTranslations[lang] = {
                keyCount: Object.keys(translations).length
            };
        }
        
        return stats;
    }
    
    /**
     * 翻訳データをクリア
     * @param {string} language - 言語コード（指定しない場合は全言語）
     */
    clearTranslations(language = null) {
        if (language) {
            this.translations.delete(language);
            this.accessibilityTranslations.delete(language);
            this.loadedLanguages.delete(language);
        } else {
            this.translations.clear();
            this.accessibilityTranslations.clear();
            this.loadedLanguages.clear();
        }
    }
    
    /**
     * リソースの解放
     */
    destroy() {
        this.clearTranslations();
        console.log('Translation Data Manager destroyed');
    }
}