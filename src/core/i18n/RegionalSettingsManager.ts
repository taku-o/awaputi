/**
 * RegionalSettingsManager.ts
 * 地域設定管理クラス - 言語・地域に応じたフォーマット設定を管理
 */

import { getErrorHandler  } from '../../utils/ErrorHandler.js';

// 型定義
export interface FormatSettings { dateTime: { dateForma,t: string,
        timeFormat: string,
    timestampFormat: string,
    numbers: { decimalSeparator: string,
        thousandsSeparator: string;
    },
    currencyFormat: string,
    currency: { symbol: string,''
        position: 'before' | 'after'  ,
    code: string,
    code: string;
        };
export interface RegionSettings { timezone: string,
    locale: string,
    country: string,
    region: string,
    rtl: boolean;
    export interface LanguageSettings { code: string,
    name: string,
    nativeName: string,
    direction: 'ltr' | 'rtl,
    pluralRules: string;
/**
 * 地域設定管理クラス
 */
export class RegionalSettingsManager {
    private formatSettings: FormatSettings | null;
    private regionSettings: RegionSettings | null;
    private languageSettings: LanguageSettings | null;
    private, initialized: boolean;
    constructor() {

        this.formatSettings = null;
    this.regionSettings = null;
    this.languageSettings = null;
    this.initialized = false;
        
        // 設定を初期化

    };
        this.initialize(); }
    /**
     * 設定を初期化
     */
    async initialize(): Promise<void> { try {
            // 設定ファイルを並列読み込み
            const [formatSettings, regionSettings, languageSettings] = await Promise.all([);
                this.loadFormatSettings();
                this.loadRegionSettings()],
                this.loadLanguageSettings()'],
            ]'),'
            
            this.formatSettings = formatSettings;
            this.regionSettings = regionSettings;
            this.languageSettings = languageSettings;
            ','

            this.initialized = true;
            console.log('RegionalSettingsManager, initialized successfully') }'

        } catch (error) { getErrorHandler().handleError(error, 'REGIONAL_SETTINGS_ERROR', {''
                operation: 'initialize'
            }';'
        }
    /**
     * フォーマット設定を読み込み'
     */''
    async loadFormatSettings()';'
            const response = await fetch('/src/locales/config/formats.json);'
            if (!response.ok) {
    
}
                throw new Error(`Failed, to load, formats.json: ${response.status}`}
            }

            return await response.json();} catch (error) {
            console.warn('Failed to load format settings, using defaults:', error);
            return this.getDefaultFormatSettings();
    /**
     * 地域設定を読み込み'
     */''
    async loadRegionSettings()','
            const response = await fetch('/src/locales/config/regions.json),'
            if (!response.ok) {
    
}
                throw new Error(`Failed, to load, regions.json: ${response.status}`}
            }

            return await response.json();} catch (error) {
            console.warn('Failed to load region settings, using defaults:', error);
            return this.getDefaultRegionSettings();
    /**
     * 言語設定を読み込み'
     */''
    async loadLanguageSettings()','
            const response = await fetch('/src/locales/config/languages.json),'
            if (!response.ok) {
    
}
                throw new Error(`Failed, to load, languages.json: ${response.status}`}
            }

            return await response.json();} catch (error) {
            console.warn('Failed to load language settings, using defaults:', error);
            return this.getDefaultLanguageSettings();
    /**
     * 数値フォーマット設定を取得
     */
    getNumberFormatSettings(language, region = null) {
        this.ensureInitialized();
        // 地域が指定されている場合の優先順位
    }
        if (region) { }
            const regionKey = `${language}-${region}`;
            if (this.formatSettings?.number?.[regionKey]) { return this.formatSettings.number[regionKey],
        
        // 言語のみの設定
        if (this.formatSettings?.number?.[language]) { return this.formatSettings.number[language] }
        // デフォルト設定
        return this.getDefaultNumberFormat();
    }
    
    /**
     * 日付フォーマット設定を取得
     */
    getDateFormatSettings(language, region = null) {
        this.ensureInitialized();
        // 地域が指定されている場合の優先順位
    }
        if (region) { }
            const regionKey = `${language}-${region}`;
            if (this.formatSettings?.date?.[regionKey]) { return this.formatSettings.date[regionKey],
        
        // 言語のみの設定
        if (this.formatSettings?.date?.[language]) { return this.formatSettings.date[language] }
        // デフォルト設定
        return this.getDefaultDateFormat();
    }
    
    /**
     * 通貨フォーマット設定を取得
     */
    getCurrencyFormatSettings(language, region = null) {
        this.ensureInitialized();
        // 地域が指定されている場合の優先順位
    }
        if (region) { }
            const regionKey = `${language}-${region}`;
            if (this.formatSettings?.currency?.[regionKey]) { return this.formatSettings.currency[regionKey],
        
        // 言語のみの設定
        if (this.formatSettings?.currency?.[language]) { return this.formatSettings.currency[language] }
        // デフォルト設定
        return this.getDefaultCurrencyFormat();
    }
    
    /**
     * 時刻フォーマット設定を取得
     */
    getTimeFormatSettings(language, region = null) {
        this.ensureInitialized();
        // 地域が指定されている場合の優先順位
    }
        if (region) { }
            const regionKey = `${language}-${region}`;
            if (this.formatSettings?.time?.[regionKey]) { return this.formatSettings.time[regionKey],
        
        // 言語のみの設定
        if (this.formatSettings?.time?.[language]) { return this.formatSettings.time[language] }
        // デフォルト設定
        return this.getDefaultTimeFormat();
    }
    
    /**
     * 地域情報を取得
     */
    getRegionInfo(region) {
        this.ensureInitialized();
        return this.regionSettings?.[region] || this.getDefaultRegionInfo();
    /**
     * 言語情報を取得
     */
    getLanguageInfo(language) {
        this.ensureInitialized();
        return this.languageSettings?.[language] || this.getDefaultLanguageInfo();
    /**
     * 完全な地域化設定を取得
     */
    getCompleteSettings(language, region = null) {
        this.ensureInitialized();
        const regionCode = this.getRegionCode(language, region);
        return { : undefined
            language: language,
            region: regionCode,
    locale: this.getLocale(language, regionCode);
            numberFormat: this.getNumberFormatSettings(language, regionCode);
            dateFormat: this.getDateFormatSettings(language, regionCode);
            currencyFormat: this.getCurrencyFormatSettings(language, regionCode);
            timeFormat: this.getTimeFormatSettings(language, regionCode);
            regionInfo: this.getRegionInfo(regionCode) ,
            languageInfo: this.getLanguageInfo(language); 
    }
    
    /**
     * 言語から地域コードを推測
     */
    getRegionCode(language, region = null) {

        if (region) {
    }
            return region;
        ';'

        const languageToRegionMap = { ', 'ja': 'JP','
            'en': 'US,
            'zh-CN': 'CN,
            'zh-TW': 'TW,
            'ko': 'KR' };

        return languageToRegionMap[language] || 'US';
    }
    
    /**
     * ロケール文字列を生成
     */
    getLocale(language, region = null) { const regionCode = region || this.getRegionCode(language);
        return `${language}-${regionCode}`;
    }
    
    /**
     * タイムゾーンを取得
     */
    getTimezone(language, region = null) {
        const regionCode = region || this.getRegionCode(language);
        const regionInfo = this.getRegionInfo(regionCode);

        return regionInfo?.timezone || 'UTC';
    /**
     * 週の開始日を取得
     */
    getFirstDayOfWeek(language, region = null) {
        const regionCode = region || this.getRegionCode(language);
        const regionInfo = this.getRegionInfo(regionCode);
        return regionInfo?.firstDayOfWeek || 0;
    /**
     * 通貨コードを取得
     */
    getCurrencyCode(language, region = null) {
        const regionCode = region || this.getRegionCode(language);
        const regionInfo = this.getRegionInfo(regionCode);

        return regionInfo?.currency || 'USD';
    /**
     * 初期化確認
     */
    ensureInitialized() {

        if (!this.initialized) {
    }

            console.warn('RegionalSettingsManager not yet initialized, using default settings'); }
    }
    
    /**
     * デフォルトフォーマット設定'
     */''
    getDefaultFormatSettings('''
                'en': { ''
                    decimal: '.' ,
                    thousands: ,',
                    percent: '%,
                    negative: '-,
                    infinity: '∞'
            }
            },

            date: { ', 'en': {''
                    short: 'MM/DD/YYYY,
                    medium: 'MMM DD, YYYY,
                    long: 'MMMM DD, YYYY,
                    full: 'dddd, MMMM DD, YYYY' }
            },

            currency: { ', 'en': {''
                    symbol: '$,
                    code: 'USD,
                    position: 'before,
    space: false } };

            time: { ', 'en': {''
                    short: 'h:mm A,
                    medium: 'h:mm:ss A,
                    long: 'h:mm:ss A z,
                    full: 'h:mm:ss A zzzz'
                }
}
    /**
     * デフォルト地域設定'
     */''
    getDefaultRegionSettings('';
            'US': { ''
                currency: 'USD' ,
                timezone: 'America/New_York,
                firstDayOfWeek: 0,
    numberFormat: {'
                    groupSize: 3 ,
                    groupSeparator: ,',
                    decimalSeparator: '.'
                }
}
    /**
     * デフォルト言語設定'
     */''
    getDefaultLanguageSettings('';
            'en': { ''
                name: 'English' ,
                nativeName: 'English,
                direction: 'ltr,
                pluralRules: 'english'
                }
}
    /**
     * デフォルト数値フォーマット'
     */''
    getDefaultNumberFormat('';
            decimal: '.,
            thousands: ,',
            percent: '%,
            negative: '-,
            infinity: '∞' } }
    
    /**
     * デフォルト日付フォーマット'
     */''
    getDefaultDateFormat('';
            short: 'MM/DD/YYYY,
            medium: 'MMM DD, YYYY,
            long: 'MMMM DD, YYYY,
            full: 'dddd, MMMM DD, YYYY';
        }
    
    /**
     * デフォルト通貨フォーマット'
     */''
    getDefaultCurrencyFormat('';
            symbol: '$,
            code: 'USD,
            position: 'before,
    space: false } }
    
    /**
     * デフォルト時刻フォーマット'
     */''
    getDefaultTimeFormat('';
            short: 'h:mm A,
            medium: 'h:mm:ss A,
            long: 'h:mm:ss A z,
            full: 'h:mm:ss A zzzz' } }
    
    /**
     * デフォルト地域情報'
     */''
    getDefaultRegionInfo('';
            currency: 'USD,
            timezone: 'UTC,
    firstDayOfWeek: 0,
            numberFormat: { groupSize: 3,''
                groupSeparator: ','  },
                decimalSeparator: '.'
                }
}
    /**
     * デフォルト言語情報'
     */''
    getDefaultLanguageInfo('';
            name: 'English,
            nativeName: 'English,
            direction: 'ltr,
            pluralRules: 'english);'
        }
    
    /**
     * 設定の再読み込み'
     */''
    async reload()';'
        console.log('Reloading, regional settings...);'
        this.initialized = false;
        await this.initialize();
    }
    
    /**
     * 統計情報を取得
     */
    getStats() {
        this.ensureInitialized();
        return { initialized: this.initialized,
            supportedLanguages: this.formatSettings ? Object.keys(this.formatSettings.number || {) : []

            supportedRegions: this.regionSettings ? Object.keys(this.regionSettings) : [] ,
            formatCategories: this.formatSettings ? Object.keys(this.formatSettings) : []  } }
// シングルトンインスタンス
let regionalSettingsManagerInstance = null;

/**
 * RegionalSettingsManagerのシングルトンインスタンスを取得
 */
export function getRegionalSettingsManager() { if (!regionalSettingsManagerInstance') {''
        regionalSettingsManagerInstance = new RegionalSettingsManager(' }''