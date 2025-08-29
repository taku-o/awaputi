/**
 * CulturalAdaptationHandler - 文化的適応処理システム
 * 
 * RTL言語、地域設定、文化的コンテキスト、地域固有の表示設定を専門的に管理します
 */
export class CulturalAdaptationHandler {
    constructor() {
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
        
        // 地域固有の UI 設定
        this.regionalUISettings = {
            'ja': {
                textDirection: 'ltr',
                fontFamily: 'Noto Sans JP, "Hiragino Kaku Gothic ProN", Meiryo, sans-serif',
                fontSize: '14px',
                lineHeight: 1.6,
                spacing: 'comfortable',
                preferredInputMethod: 'keyboard'
            },
            'en': {
                textDirection: 'ltr',
                fontFamily: 'Roboto, "Segoe UI", sans-serif',
                fontSize: '14px',
                lineHeight: 1.4,
                spacing: 'normal',
                preferredInputMethod: 'mouse'
            },
            'ar': {
                textDirection: 'rtl',
                fontFamily: 'Noto Sans Arabic, "Traditional Arabic", sans-serif',
                fontSize: '16px',
                lineHeight: 1.8,
                spacing: 'wide',
                preferredInputMethod: 'keyboard'
            },
            'zh': {
                textDirection: 'ltr',
                fontFamily: 'Noto Sans SC, "Microsoft YaHei", sans-serif',
                fontSize: '14px',
                lineHeight: 1.5,
                spacing: 'compact',
                preferredInputMethod: 'mixed'
            }
        };
        
        // 時刻・日付フォーマット
        this.timeFormats = {
            'ja': {
                time12: false,
                dateFormat: 'YYYY/MM/DD',
                timeFormat: 'HH:mm',
                weekStart: 1, // Monday
                era: 'ad'
            },
            'en': {
                time12: true,
                dateFormat: 'MM/DD/YYYY',
                timeFormat: 'h:mm A',
                weekStart: 0, // Sunday
                era: 'ad'
            },
            'ar': {
                time12: true,
                dateFormat: 'DD/MM/YYYY',
                timeFormat: 'h:mm A',
                weekStart: 6, // Saturday
                era: 'hijri' // イスラム暦オプション
            }
        };
        
        // 数値・通貨フォーマット
        this.numberFormats = {
            'ja': {
                decimal: '.',
                thousands: ',',
                currency: '¥',
                currencyPosition: 'before'
            },
            'en': {
                decimal: '.',
                thousands: ',',
                currency: '$',
                currencyPosition: 'before'
            },
            'de': {
                decimal: ',',
                thousands: '.',
                currency: '€',
                currencyPosition: 'after'
            },
            'ar': {
                decimal: '.',
                thousands: ',',
                currency: 'ر.س',
                currencyPosition: 'after'
            }
        };
    }
    
    /**
     * 言語がRTL（右から左）かどうかをチェック
     * @param {string} language - 言語コード
     * @returns {boolean} RTLかどうか
     */
    isRTLLanguage(language) {
        return this.culturalAdaptation.rtlLanguages.includes(language);
    }
    
    /**
     * 言語に応じた文字方向を取得
     * @param {string} language - 言語コード
     * @returns {string} 文字方向（'ltr' または 'rtl'）
     */
    getTextDirection(language) {
        if (this.regionalUISettings[language]) {
            return this.regionalUISettings[language].textDirection;
        }
        return this.isRTLLanguage(language) ? 'rtl' : 'ltr';
    }
    
    /**
     * 言語に応じた数値システムを取得
     * @param {string} language - 言語コード
     * @returns {string} 数値システム
     */
    getNumeralSystem(language) {
        return this.culturalAdaptation.numeralSystems[language] || 'latin';
    }
    
    /**
     * 言語に応じた日付フォーマットを取得
     * @param {string} language - 言語コード
     * @returns {string} 日付フォーマット
     */
    getDateFormat(language) {
        return this.culturalAdaptation.dateFormats[language] || 'MM/DD/YYYY';
    }
    
    /**
     * 言語に応じた色の意味を取得
     * @param {string} language - 言語コード
     * @param {string} color - 色名
     * @returns {string} 色の意味
     */
    getColorMeaning(language, color) {
        const colorMeanings = this.culturalAdaptation.colorMeanings[language];
        return colorMeanings ? colorMeanings[color] : null;
    }
    
    /**
     * 言語に応じたジェスチャー慣習を取得
     * @param {string} language - 言語コード
     * @param {string} gesture - ジェスチャー名
     * @returns {string} ジェスチャーの適切性
     */
    getGestureConvention(language, gesture) {
        const gestureConventions = this.culturalAdaptation.gestureConventions[language];
        return gestureConventions ? gestureConventions[gesture] : 'acceptable';
    }
    
    /**
     * 地域固有のUI設定を取得
     * @param {string} language - 言語コード
     * @returns {Object} UI設定
     */
    getRegionalUISettings(language) {
        return this.regionalUISettings[language] || this.regionalUISettings['en'];
    }
    
    /**
     * 時刻フォーマット設定を取得
     * @param {string} language - 言語コード
     * @returns {Object} 時刻フォーマット設定
     */
    getTimeFormat(language) {
        return this.timeFormats[language] || this.timeFormats['en'];
    }
    
    /**
     * 数値フォーマット設定を取得
     * @param {string} language - 言語コード
     * @returns {Object} 数値フォーマット設定
     */
    getNumberFormat(language) {
        return this.numberFormats[language] || this.numberFormats['en'];
    }
    
    /**
     * 日付を言語に応じてフォーマット
     * @param {Date} date - 日付オブジェクト
     * @param {string} language - 言語コード
     * @returns {string} フォーマットされた日付文字列
     */
    formatDate(date, language) {
        const format = this.getDateFormat(language);
        const timeSettings = this.getTimeFormat(language);
        
        try {
            return new Intl.DateTimeFormat(language, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                calendar: timeSettings.era === 'hijri' ? 'islamic' : 'gregory'
            }).format(date);
        } catch (error) {
            // フォールバック
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            
            return format
                .replace('YYYY', year)
                .replace('MM', month)
                .replace('DD', day);
        }
    }
    
    /**
     * 時刻を言語に応じてフォーマット
     * @param {Date} date - 日付オブジェクト
     * @param {string} language - 言語コード
     * @returns {string} フォーマットされた時刻文字列
     */
    formatTime(date, language) {
        const timeSettings = this.getTimeFormat(language);
        
        try {
            return new Intl.DateTimeFormat(language, {
                hour: '2-digit',
                minute: '2-digit',
                hour12: timeSettings.time12
            }).format(date);
        } catch (error) {
            // フォールバック
            const hours = timeSettings.time12 
                ? date.getHours() % 12 || 12
                : date.getHours();
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const ampm = timeSettings.time12 
                ? (date.getHours() >= 12 ? 'PM' : 'AM')
                : '';
            
            return `${hours}:${minutes} ${ampm}`.trim();
        }
    }
    
    /**
     * 数値を言語に応じてフォーマット
     * @param {number} number - 数値
     * @param {string} language - 言語コード
     * @param {string} type - フォーマットタイプ（'decimal', 'currency', 'percent'）
     * @returns {string} フォーマットされた数値文字列
     */
    formatNumber(number, language, type = 'decimal') {
        const numberSettings = this.getNumberFormat(language);
        
        try {
            const options = { style: type };
            if (type === 'currency') {
                options.currency = this.getCurrencyCode(language);
            }
            
            return new Intl.NumberFormat(language, options).format(number);
        } catch (error) {
            // フォールバック
            const formatted = number.toLocaleString('en', {
                style: type === 'currency' ? 'decimal' : type
            });
            
            if (type === 'currency') {
                const currency = numberSettings.currency;
                return numberSettings.currencyPosition === 'before' 
                    ? `${currency}${formatted}`
                    : `${formatted}${currency}`;
            }
            
            return formatted;
        }
    }
    
    /**
     * 言語に応じた通貨コードを取得
     * @param {string} language - 言語コード
     * @returns {string} 通貨コード
     */
    getCurrencyCode(language) {
        const currencyMap = {
            'ja': 'JPY',
            'en': 'USD',
            'en-GB': 'GBP',
            'de': 'EUR',
            'fr': 'EUR',
            'ar': 'SAR',
            'zh': 'CNY'
        };
        return currencyMap[language] || 'USD';
    }
    
    /**
     * CSS文字方向プロパティを適用
     * @param {HTMLElement} element - 対象要素
     * @param {string} language - 言語コード
     */
    applyCSSDirection(element, language) {
        if (element) {
            element.dir = this.getTextDirection(language);
            element.style.direction = this.getTextDirection(language);
        }
    }
    
    /**
     * 地域固有のフォント設定を適用
     * @param {HTMLElement} element - 対象要素
     * @param {string} language - 言語コード
     */
    applyRegionalFont(element, language) {
        if (element) {
            const settings = this.getRegionalUISettings(language);
            element.style.fontFamily = settings.fontFamily;
            element.style.fontSize = settings.fontSize;
            element.style.lineHeight = settings.lineHeight;
        }
    }
    
    /**
     * 文化的適応設定を更新
     * @param {Object} newSettings - 新しい設定
     */
    updateCulturalSettings(newSettings) {
        Object.assign(this.culturalAdaptation, newSettings);
    }
    
    /**
     * 地域UI設定を更新
     * @param {string} language - 言語コード
     * @param {Object} settings - UI設定
     */
    updateRegionalUISettings(language, settings) {
        this.regionalUISettings[language] = { 
            ...this.regionalUISettings[language], 
            ...settings 
        };
    }
    
    /**
     * 文化的適応の統計情報を取得
     * @returns {Object} 統計情報
     */
    getCulturalAdaptationStats() {
        return {
            supportedRTLLanguages: this.culturalAdaptation.rtlLanguages.length,
            supportedNumeralSystems: Object.keys(this.culturalAdaptation.numeralSystems).length,
            supportedDateFormats: Object.keys(this.culturalAdaptation.dateFormats).length,
            supportedColorMeanings: Object.keys(this.culturalAdaptation.colorMeanings).length,
            supportedGestureConventions: Object.keys(this.culturalAdaptation.gestureConventions).length,
            regionalUILanguages: Object.keys(this.regionalUISettings).length,
            timeFormatLanguages: Object.keys(this.timeFormats).length,
            numberFormatLanguages: Object.keys(this.numberFormats).length
        };
    }
    
    /**
     * デバッグ情報の取得
     * @param {string} language - 言語コード
     * @returns {Object} デバッグ情報
     */
    getDebugInfo(language) {
        return {
            language,
            isRTL: this.isRTLLanguage(language),
            textDirection: this.getTextDirection(language),
            numeralSystem: this.getNumeralSystem(language),
            dateFormat: this.getDateFormat(language),
            uiSettings: this.getRegionalUISettings(language),
            timeFormat: this.getTimeFormat(language),
            numberFormat: this.getNumberFormat(language),
            stats: this.getCulturalAdaptationStats()
        };
    }
    
    /**
     * リソースの解放
     */
    destroy() {
        this.culturalAdaptation = null;
        this.regionalUISettings = null;
        this.timeFormats = null;
        this.numberFormats = null;
        
        console.log('Cultural Adaptation Handler destroyed');
    }
}