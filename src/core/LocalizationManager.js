import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * ローカライゼーション管理クラス - 多言語対応
 */
export class LocalizationManager {
    constructor() {
        this.currentLanguage = 'ja';
        this.fallbackLanguage = 'en';
        this.translations = new Map();
        this.loadedLanguages = new Set();
        
        // 翻訳データを初期化
        this.initializeTranslations();
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
            'confirm.cancel': 'Cancel'
        });
        
        this.loadedLanguages.add('ja');
        this.loadedLanguages.add('en');
    }
    
    /**
     * 言語を設定
     */
    setLanguage(language) {
        if (this.loadedLanguages.has(language)) {
            this.currentLanguage = language;
            console.log(`Language set to: ${language}`);
            return true;
        } else {
            console.warn(`Language not supported: ${language}`);
            return false;
        }
    }
    
    /**
     * 翻訳を取得
     */
    t(key, params = {}) {
        try {
            // 現在の言語で翻訳を取得
            let translation = this.getTranslation(key, this.currentLanguage);
            
            // 見つからない場合はフォールバック言語を試す
            if (translation === null && this.currentLanguage !== this.fallbackLanguage) {
                translation = this.getTranslation(key, this.fallbackLanguage);
            }
            
            // それでも見つからない場合はキーをそのまま返す
            if (translation === null) {
                console.warn(`Translation not found: ${key}`);
                return key;
            }
            
            // パラメータ置換
            return this.interpolate(translation, params);
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
     * クリーンアップ
     */
    cleanup() {
        // 特にクリーンアップする必要はない
    }
}