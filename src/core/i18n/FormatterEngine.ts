import { getErrorHandler } from '../../utils/ErrorHandler.js';
import { getRegionalSettingsManager } from './RegionalSettingsManager.js';

/**
 * フォーマッターエンジン - 地域化対応のテキストフォーマット
 */

// 型定義
export interface FormatParams {
    [key: string]: any;
}

export interface FormatterInterface {
    format(value: any, language: string, region?: string | null, options?: any): string;
}

export interface NumberFormatterInterface extends FormatterInterface {
    formatWithSettings(value: any, numberFormatSettings: NumberFormatSettings | null, format?: string): string;
    getLocale(language: string, region?: string | null): string;
}

export interface DateFormatterInterface extends FormatterInterface {
    formatWithSettings(value: any, dateFormatSettings: DateFormatSettings | null, format?: string, regionInfo?: RegionInfo): string;
    formatTimeWithSettings(value: any, timeFormatSettings: TimeFormatSettings | null, format?: string, regionInfo?: RegionInfo): string;
    getMonthNames(regionInfo: RegionInfo): string[];
    getLocale(language: string, region?: string | null): string;
}

export interface CurrencyFormatterInterface extends FormatterInterface {
    formatWithSettings(value: any, currencyFormatSettings: CurrencyFormatSettings | null, format?: string): string;
    getCurrencyCode(language: string, region?: string | null): string;
    getLocale(language: string, region?: string | null): string;
}

export interface RelativeTimeFormatterInterface extends FormatterInterface {
    getLocale(language: string, region?: string | null): string;
}

export interface ListFormatterInterface extends FormatterInterface {
    getLocale(language: string, region?: string | null): string;
}

export interface PluralFormatterInterface extends FormatterInterface {
    getPluralRules(language: string): Intl.PluralRules | PluralRuleFallback;
    makeEnglishPlural(text: string): string;
}

export interface NumberFormatSettings {
    decimal?: string;
    thousands?: string;
    precision?: number;
    prefix?: string;
    suffix?: string;
}

export interface DateFormatSettings {
    short?: string;
    medium?: string;
    long?: string;
    full?: string;
    [key: string]: string | undefined;
}

export interface TimeFormatSettings {
    short?: string;
    medium?: string;
    long?: string;
    full?: string;
    hour12?: boolean;
    [key: string]: string | boolean | undefined;
}

export interface CurrencyFormatSettings {
    symbol?: string;
    code?: string;
    position?: 'before' | 'after';
    space?: boolean;
    precision?: number;
}

export interface RegionInfo {
    timezone?: string;
    calendar?: string;
    firstDayOfWeek?: number;
    weekendDays?: number[];
    dateFormats?: DateFormatSettings;
    timeFormats?: TimeFormatSettings;
    numberFormats?: NumberFormatSettings;
    currencyFormats?: CurrencyFormatSettings;
    [key: string]: any;
}

export interface RegionalSettings {
    language: string;
    region: string | null;
    numberFormat: NumberFormatSettings;
    dateFormat: DateFormatSettings;
    timeFormat: TimeFormatSettings;
    currencyFormat: CurrencyFormatSettings;
    regionInfo: RegionInfo;
}

export interface FormatterStats {
    availableFormatters: string[];
    regionalSettings: any;
    supportedLanguages: string[];
    supportedRegions: string[];
}

export interface PluralObject {
    zero?: string;
    one?: string;
    two?: string;
    few?: string;
    many?: string;
    other: string;
    [key: string]: string | undefined;
}

export interface PluralRuleFallback {
    select(n: number): string;
}

export interface DateTimeFormatOptions {
    year?: 'numeric' | '2-digit';
    month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
    day?: 'numeric' | '2-digit';
    hour?: 'numeric' | '2-digit';
    minute?: 'numeric' | '2-digit';
    second?: 'numeric' | '2-digit';
    weekday?: 'long' | 'short' | 'narrow';
    era?: 'long' | 'short' | 'narrow';
    timeZoneName?: 'long' | 'short';
    [key: string]: any;
}

export interface ListFormatOptions {
    style?: 'long' | 'short' | 'narrow';
    type?: 'conjunction' | 'disjunction' | 'unit';
}

export interface FormatterConfiguration {
    enabled?: boolean;
    defaultLanguage?: string;
    defaultRegion?: string;
    fallbackFormats?: boolean;
    cacheResults?: boolean;
}

export interface AdvancedFormatPattern {
    pattern: RegExp;
    replacement: (match: string, ...groups: string[]) => string;
    priority: number;
}

export interface FormatterRegistry {
    [name: string]: FormatterInterface;
}

export class FormatterEngine {
    private formatters: Map<string, FormatterInterface>;
    private regionalSettingsManager: any;
    private configuration: FormatterConfiguration;

    constructor() {
        this.formatters = new Map<string, FormatterInterface>([
            ['number', new NumberFormatter()],
            ['date', new DateFormatter()],
            ['currency', new CurrencyFormatter()],
            ['relative', new RelativeTimeFormatter()],
            ['list', new ListFormatter()],
            ['plural', new PluralFormatter()]
        ]);
        
        // 地域設定マネージャーの参照
        this.regionalSettingsManager = getRegionalSettingsManager();
        
        // デフォルト設定
        this.configuration = {
            enabled: true,
            defaultLanguage: 'en',
            defaultRegion: null,
            fallbackFormats: true,
            cacheResults: false
        };
    }
    
    /**
     * テキストをフォーマット
     */
    format(text: any, params: FormatParams = {}, language: string, region: string | null = null): string {
        try {
            if (typeof text !== 'string') {
                return String(text);
            }
            
            let formatted = text;
            
            // パラメータ置換
            formatted = this.replaceParameters(formatted, params);
            
            // 地域固有フォーマット
            formatted = this.applyRegionalFormatting(formatted, params, language, region);
            
            // 特殊フォーマット処理
            formatted = this.processSpecialFormats(formatted, params, language);
            
            return formatted;
        } catch (error) {
            getErrorHandler().handleError(error as Error, 'FORMATTER_ERROR', {
                operation: 'format',
                text: text,
                language: language,
                region: region
            });
            return String(text);
        }
    }
    
    /**
     * 基本的なパラメータ置換
     */
    private replaceParameters(text: string, params: FormatParams): string {
        if (!params || Object.keys(params).length === 0) {
            return text;
        }
        
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] !== undefined ? String(params[key]) : match;
        });
    }
    
    /**
     * 地域固有フォーマットを適用
     */
    private applyRegionalFormatting(text: string, params: FormatParams, language: string, region: string | null): string {
        let formatted = text;
        
        // 数値フォーマット: {{number:key}}
        formatted = formatted.replace(/\{\{number:(\w+)\}\}/g, (match, key) => {
            const value = params[key];
            if (value !== undefined) {
                const formatter = this.formatters.get('number') as NumberFormatterInterface;
                return formatter.format(value, language, region);
            }
            return match;
        });
        
        // 日付フォーマット: {{date:key}}
        formatted = formatted.replace(/\{\{date:(\w+)\}\}/g, (match, key) => {
            const value = params[key];
            if (value !== undefined) {
                const formatter = this.formatters.get('date') as DateFormatterInterface;
                return formatter.format(value, language, region);
            }
            return match;
        });
        
        // 通貨フォーマット: {{currency:key}}
        formatted = formatted.replace(/\{\{currency:(\w+)\}\}/g, (match, key) => {
            const value = params[key];
            if (value !== undefined) {
                const formatter = this.formatters.get('currency') as CurrencyFormatterInterface;
                return formatter.format(value, language, region);
            }
            return match;
        });
        
        // 相対時間フォーマット: {{relative:key}}
        formatted = formatted.replace(/\{\{relative:(\w+)\}\}/g, (match, key) => {
            const value = params[key];
            if (value !== undefined) {
                const formatter = this.formatters.get('relative') as RelativeTimeFormatterInterface;
                return formatter.format(value, language, region);
            }
            return match;
        });
        
        // リストフォーマット: {{list:key}}
        formatted = formatted.replace(/\{\{list:(\w+)\}\}/g, (match, key) => {
            const value = params[key];
            if (value !== undefined && Array.isArray(value)) {
                const formatter = this.formatters.get('list') as ListFormatterInterface;
                return formatter.format(value, language, region);
            }
            return match;
        });
        
        return formatted;
    }
    
    /**
     * 特殊フォーマット処理
     */
    private processSpecialFormats(text: string, params: FormatParams, language: string): string {
        let formatted = text;
        
        // 複数形フォーマット: {{plural:key:count}}
        formatted = formatted.replace(/\{\{plural:(\w+):(\w+)\}\}/g, (match, key, countKey) => {
            const count = params[countKey];
            const baseText = params[key];
            if (count !== undefined && baseText !== undefined) {
                const formatter = this.formatters.get('plural') as PluralFormatterInterface;
                return formatter.format(baseText, count, language);
            }
            return match;
        });
        
        return formatted;
    }
    
    /**
     * フォーマッターを追加
     */
    addFormatter(name: string, formatter: FormatterInterface): boolean {
        try {
            if (typeof formatter.format !== 'function') {
                throw new Error('Formatter must have a format method');
            }
            
            this.formatters.set(name, formatter);
            console.log(`Added formatter: ${name}`);
            return true;
        } catch (error) {
            getErrorHandler().handleError(error as Error, 'FORMATTER_ERROR', {
                operation: 'addFormatter',
                name: name
            });
            return false;
        }
    }
    
    /**
     * フォーマッターを削除
     */
    removeFormatter(name: string): boolean {
        return this.formatters.delete(name);
    }
    
    /**
     * 利用可能なフォーマッターを取得
     */
    getAvailableFormatters(): string[] {
        return Array.from(this.formatters.keys());
    }
    
    /**
     * 地域設定に基づく包括的フォーマット
     */
    formatWithRegionalSettings(text: any, params: FormatParams = {}, language: string, region: string | null = null): string {
        try {
            if (typeof text !== 'string') {
                return String(text);
            }
            
            // 地域設定を取得
            const settings: RegionalSettings = this.regionalSettingsManager.getCompleteSettings(language, region);
            
            let formatted = text;
            
            // パラメータ置換
            formatted = this.replaceParameters(formatted, params);
            
            // 地域固有フォーマット（拡張版）
            formatted = this.applyAdvancedRegionalFormatting(formatted, params, settings);
            
            // 特殊フォーマット処理
            formatted = this.processSpecialFormats(formatted, params, language);
            
            return formatted;
        } catch (error) {
            getErrorHandler().handleError(error as Error, 'FORMATTER_ERROR', {
                operation: 'formatWithRegionalSettings',
                text: text,
                language: language,
                region: region
            });
            return String(text);
        }
    }
    
    /**
     * 高度な地域固有フォーマットを適用
     */
    private applyAdvancedRegionalFormatting(text: string, params: FormatParams, settings: RegionalSettings): string {
        let formatted = text;
        
        // 数値フォーマット（地域設定適用）: {{number:key:format}}
        formatted = formatted.replace(/\{\{number:(\w+)(?::(\w+))?\}\}/g, (match, key, format) => {
            const value = params[key];
            if (value !== undefined) {
                const formatter = this.formatters.get('number') as NumberFormatterInterface;
                return formatter.formatWithSettings(value, settings.numberFormat, format);
            }
            return match;
        });
        
        // 日付フォーマット（地域設定適用）: {{date:key:format}}
        formatted = formatted.replace(/\{\{date:(\w+)(?::(\w+))?\}\}/g, (match, key, format) => {
            const value = params[key];
            if (value !== undefined) {
                const formatter = this.formatters.get('date') as DateFormatterInterface;
                return formatter.formatWithSettings(value, settings.dateFormat, format, settings.regionInfo);
            }
            return match;
        });
        
        // 通貨フォーマット（地域設定適用）: {{currency:key:format}}
        formatted = formatted.replace(/\{\{currency:(\w+)(?::(\w+))?\}\}/g, (match, key, format) => {
            const value = params[key];
            if (value !== undefined) {
                const formatter = this.formatters.get('currency') as CurrencyFormatterInterface;
                return formatter.formatWithSettings(value, settings.currencyFormat, format);
            }
            return match;
        });
        
        // 時刻フォーマット（地域設定適用）: {{time:key:format}}
        formatted = formatted.replace(/\{\{time:(\w+)(?::(\w+))?\}\}/g, (match, key, format) => {
            const value = params[key];
            if (value !== undefined) {
                const formatter = this.formatters.get('date') as DateFormatterInterface;
                return formatter.formatTimeWithSettings(value, settings.timeFormat, format, settings.regionInfo);
            }
            return match;
        });
        
        return formatted;
    }
    
    /**
     * 地域設定情報を取得
     */
    getRegionalSettings(language: string, region: string | null = null): RegionalSettings {
        return this.regionalSettingsManager.getCompleteSettings(language, region);
    }
    
    /**
     * フォーマット統計を取得
     */
    getFormatterStats(): FormatterStats {
        const regionalStats = this.regionalSettingsManager.getStats();
        
        return {
            availableFormatters: this.getAvailableFormatters(),
            regionalSettings: regionalStats,
            supportedLanguages: regionalStats.supportedLanguages,
            supportedRegions: regionalStats.supportedRegions
        };
    }
    
    /**
     * 設定を更新
     */
    updateConfiguration(config: Partial<FormatterConfiguration>): void {
        this.configuration = { ...this.configuration, ...config };
        console.log('FormatterEngine configuration updated:', config);
    }
    
    /**
     * 設定を取得
     */
    getConfiguration(): FormatterConfiguration {
        return { ...this.configuration };
    }
}

/**
 * 数値フォーマッター
 */
export class NumberFormatter implements NumberFormatterInterface {
    format(value: any, language: string, region?: string | null): string {
        try {
            const number = Number(value);
            if (isNaN(number)) {
                return String(value);
            }
            
            const locale = this.getLocale(language, region);
            return new Intl.NumberFormat(locale).format(number);
        } catch (error) {
            console.warn(`Number formatting failed for ${language}:`, error);
            return String(value);
        }
    }
    
    /**
     * 地域設定を使用した数値フォーマット
     */
    formatWithSettings(value: any, numberFormatSettings: NumberFormatSettings | null, format: string = 'default'): string {
        try {
            const number = Number(value);
            if (isNaN(number)) {
                return String(value);
            }
            
            // カスタム数値フォーマット設定を適用
            const decimalSeparator = numberFormatSettings?.decimal || '.';
            const thousandsSeparator = numberFormatSettings?.thousands || ',';
            
            let formatted = number.toString();
            
            // 小数点以下の処理
            const parts = formatted.split('.');
            
            // 千の位区切りを適用
            if (Math.abs(number) >= 1000) {
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
            }
            
            // 小数点記号の置換
            if (parts.length > 1) {
                formatted = parts[0] + decimalSeparator + parts[1];
            } else {
                formatted = parts[0];
            }
            
            return formatted;
        } catch (error) {
            console.warn(`Number formatting with settings failed:`, error);
            return String(value);
        }
    }
    
    getLocale(language: string, region?: string | null): string {
        if (region) {
            return `${language}-${region}`;
        }
        
        const localeMap: Record<string, string> = {
            'ja': 'ja-JP',
            'en': 'en-US',
            'zh-CN': 'zh-CN',
            'zh-TW': 'zh-TW',
            'ko': 'ko-KR'
        };
        
        return localeMap[language] || language;
    }
}

/**
 * 日付フォーマッター
 */
export class DateFormatter implements DateFormatterInterface {
    format(value: any, language: string, region?: string | null, options: DateTimeFormatOptions = {}): string {
        try {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                return String(value);
            }
            
            const locale = this.getLocale(language, region);
            const formatOptions: DateTimeFormatOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                ...options
            };
            
            return new Intl.DateTimeFormat(locale, formatOptions).format(date);
        } catch (error) {
            console.warn(`Date formatting failed for ${language}:`, error);
            return String(value);
        }
    }
    
    /**
     * 地域設定を使用した日付フォーマット
     */
    formatWithSettings(value: any, dateFormatSettings: DateFormatSettings | null, format: string = 'medium', regionInfo: RegionInfo = {}): string {
        try {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                return String(value);
            }
            
            // フォーマット設定から適切なパターンを取得
            const formatPattern = dateFormatSettings?.[format] || dateFormatSettings?.medium || 'YYYY/MM/DD';
            
            // 基本的な日付フォーマット置換
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const weekday = date.toLocaleDateString('ja-JP', { weekday: 'short' });
            
            let formatted = formatPattern
                .replace(/YYYY/g, String(year))
                .replace(/MM/g, month)
                .replace(/DD/g, day)
                .replace(/ddd/g, weekday);
            
            // 言語固有の月名処理
            if (formatted.includes('MMM')) {
                const monthNames = this.getMonthNames(regionInfo);
                const monthName = monthNames[date.getMonth()];
                formatted = formatted.replace(/MMMM/g, monthName).replace(/MMM/g, monthName);
            }
            
            return formatted;
        } catch (error) {
            console.warn(`Date formatting with settings failed:`, error);
            return String(value);
        }
    }
    
    /**
     * 地域設定を使用した時刻フォーマット
     */
    formatTimeWithSettings(value: any, timeFormatSettings: TimeFormatSettings | null, format: string = 'medium', regionInfo: RegionInfo = {}): string {
        try {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                return String(value);
            }
            
            // フォーマット設定から適切なパターンを取得
            const formatPattern = timeFormatSettings?.[format] || timeFormatSettings?.medium || 'HH:mm:ss';
            
            // 基本的な時刻要素
            const hours24 = date.getHours();
            const hours12 = hours24 % 12 || 12;
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            const ampm = hours24 < 12 ? 'AM' : 'PM';
            
            let formatted = String(formatPattern)
                .replace(/HH/g, String(hours24).padStart(2, '0'))
                .replace(/h/g, String(hours12))
                .replace(/mm/g, minutes)
                .replace(/ss/g, seconds)
                .replace(/A/g, ampm);
            
            return formatted;
        } catch (error) {
            console.warn(`Time formatting with settings failed:`, error);
            return String(value);
        }
    }
    
    /**
     * 月名を取得
     */
    getMonthNames(regionInfo: RegionInfo): string[] {
        // 簡略化された月名マップ
        return [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
    }
    
    getLocale(language: string, region?: string | null): string {
        if (region) {
            return `${language}-${region}`;
        }
        
        const localeMap: Record<string, string> = {
            'ja': 'ja-JP',
            'en': 'en-US',
            'zh-CN': 'zh-CN',
            'zh-TW': 'zh-TW',
            'ko': 'ko-KR'
        };
        
        return localeMap[language] || language;
    }
}

/**
 * 通貨フォーマッター
 */
export class CurrencyFormatter implements CurrencyFormatterInterface {
    format(value: any, language: string, region?: string | null, currency: string | null = null): string {
        try {
            const number = Number(value);
            if (isNaN(number)) {
                return String(value);
            }
            
            const locale = this.getLocale(language, region);
            const currencyCode = currency || this.getCurrencyCode(language, region);
            
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currencyCode
            }).format(number);
        } catch (error) {
            console.warn(`Currency formatting failed for ${language}:`, error);
            const currencyCode = currency || this.getCurrencyCode(language, region);
            return `${currencyCode} ${value}`;
        }
    }
    
    getLocale(language: string, region?: string | null): string {
        if (region) {
            return `${language}-${region}`;
        }
        
        const localeMap: Record<string, string> = {
            'ja': 'ja-JP',
            'en': 'en-US',
            'zh-CN': 'zh-CN',
            'zh-TW': 'zh-TW',
            'ko': 'ko-KR'
        };
        
        return localeMap[language] || language;
    }
    
    /**
     * 地域設定を使用した通貨フォーマット
     */
    formatWithSettings(value: any, currencyFormatSettings: CurrencyFormatSettings | null, format: string = 'default'): string {
        try {
            const number = Number(value);
            if (isNaN(number)) {
                return String(value);
            }
            
            const symbol = currencyFormatSettings?.symbol || '$';
            const code = currencyFormatSettings?.code || 'USD';
            const position = currencyFormatSettings?.position || 'before';
            const space = currencyFormatSettings?.space || false;
            
            // 数値をフォーマット（千の位区切り）
            const formattedNumber = new Intl.NumberFormat('en-US').format(Math.abs(number));
            const sign = number < 0 ? '-' : '';
            
            // 通貨記号の位置に応じてフォーマット
            let formatted: string;
            if (position === 'before') {
                formatted = `${sign}${symbol}${space ? ' ' : ''}${formattedNumber}`;
            } else {
                formatted = `${sign}${formattedNumber}${space ? ' ' : ''}${symbol}`;
            }
            
            return formatted;
        } catch (error) {
            console.warn(`Currency formatting with settings failed:`, error);
            const code = currencyFormatSettings?.code || 'USD';
            return `${code} ${value}`;
        }
    }
    
    getCurrencyCode(language: string, region?: string | null): string {
        const currencyMap: Record<string, string> = {
            'ja': 'JPY',
            'ja-JP': 'JPY',
            'en': 'USD',
            'en-US': 'USD',
            'en-GB': 'GBP',
            'zh-CN': 'CNY',
            'zh-TW': 'TWD',
            'ko': 'KRW',
            'ko-KR': 'KRW'
        };
        
        const key = region ? `${language}-${region}` : language;
        return currencyMap[key] || 'USD';
    }
}

/**
 * 相対時間フォーマッター
 */
export class RelativeTimeFormatter implements RelativeTimeFormatterInterface {
    format(value: any, language: string, region?: string | null): string {
        try {
            const date = new Date(value);
            const now = new Date();
            const diffMs = date.getTime() - now.getTime();
            
            const locale = this.getLocale(language, region);
            const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
            
            // 単位の決定
            const absDiff = Math.abs(diffMs);
            
            if (absDiff < 60000) { // 1分未満
                const seconds = Math.round(diffMs / 1000);
                return rtf.format(seconds, 'second');
            } else if (absDiff < 3600000) { // 1時間未満
                const minutes = Math.round(diffMs / 60000);
                return rtf.format(minutes, 'minute');
            } else if (absDiff < 86400000) { // 1日未満
                const hours = Math.round(diffMs / 3600000);
                return rtf.format(hours, 'hour');
            } else { // 1日以上
                const days = Math.round(diffMs / 86400000);
                return rtf.format(days, 'day');
            }
        } catch (error) {
            console.warn(`Relative time formatting failed for ${language}:`, error);
            return String(value);
        }
    }
    
    getLocale(language: string, region?: string | null): string {
        if (region) {
            return `${language}-${region}`;
        }
        
        const localeMap: Record<string, string> = {
            'ja': 'ja-JP',
            'en': 'en-US',
            'zh-CN': 'zh-CN',
            'zh-TW': 'zh-TW',
            'ko': 'ko-KR'
        };
        
        return localeMap[language] || language;
    }
}

/**
 * リストフォーマッター
 */
export class ListFormatter implements ListFormatterInterface {
    format(value: any, language: string, region?: string | null, options: ListFormatOptions = {}): string {
        try {
            if (!Array.isArray(value)) {
                return String(value);
            }
            
            const locale = this.getLocale(language, region);
            const formatOptions: ListFormatOptions = {
                style: 'long',
                type: 'conjunction',
                ...options
            };
            
            return new Intl.ListFormat(locale, formatOptions).format(value);
        } catch (error) {
            console.warn(`List formatting failed for ${language}:`, error);
            // フォールバック: カンマ区切り
            return Array.isArray(value) ? value.join(', ') : String(value);
        }
    }
    
    getLocale(language: string, region?: string | null): string {
        if (region) {
            return `${language}-${region}`;
        }
        
        const localeMap: Record<string, string> = {
            'ja': 'ja-JP',
            'en': 'en-US',
            'zh-CN': 'zh-CN',
            'zh-TW': 'zh-TW',
            'ko': 'ko-KR'
        };
        
        return localeMap[language] || language;
    }
}

/**
 * 複数形フォーマッター
 */
export class PluralFormatter implements PluralFormatterInterface {
    format(text: any, count: any, language: string): string {
        try {
            const number = Number(count);
            if (isNaN(number)) {
                return String(text);
            }
            
            const rules = this.getPluralRules(language);
            const rule = rules.select(number);
            
            // テキストが複数形ルールを含む場合
            if (typeof text === 'object' && text !== null) {
                const pluralObj = text as PluralObject;
                return pluralObj[rule] || pluralObj.other || pluralObj.one || String(text);
            }
            
            // シンプル複数形ルール（英語）
            if (language === 'en') {
                return number === 1 ? String(text) : this.makeEnglishPlural(String(text));
            }
            
            return String(text);
        } catch (error) {
            console.warn(`Plural formatting failed for ${language}:`, error);
            return String(text);
        }
    }
    
    getPluralRules(language: string): Intl.PluralRules | PluralRuleFallback {
        try {
            return new Intl.PluralRules(language);
        } catch (error) {
            console.warn(`PluralRules not supported for ${language}, using fallback`);
            // フォールバック実装
            return {
                select: (n: number) => n === 1 ? 'one' : 'other'
            };
        }
    }
    
    makeEnglishPlural(text: string): string {
        // 簡単な英語複数形ルール
        if (text.endsWith('y')) {
            return text.slice(0, -1) + 'ies';
        } else if (text.endsWith('s') || text.endsWith('x') || text.endsWith('z') || 
                   text.endsWith('ch') || text.endsWith('sh')) {
            return text + 'es';
        } else {
            return text + 's';
        }
    }
}