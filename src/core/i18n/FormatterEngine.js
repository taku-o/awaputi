import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * フォーマッターエンジン - 地域化対応のテキストフォーマット
 */
export class FormatterEngine {
    constructor() {
        this.formatters = new Map([
            ['number', new NumberFormatter()],
            ['date', new DateFormatter()],
            ['currency', new CurrencyFormatter()],
            ['relative', new RelativeTimeFormatter()],
            ['list', new ListFormatter()],
            ['plural', new PluralFormatter()]
        ]);
    }
    
    /**
     * テキストをフォーマット
     */
    format(text, params, language, region = null) {
        try {
            if (typeof text !== 'string') {
                return text;
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
            getErrorHandler().handleError(error, 'FORMATTER_ERROR', {
                operation: 'format',
                text: text,
                language: language,
                region: region
            });
            return text;
        }
    }
    
    /**
     * 基本的なパラメータ置換
     */
    replaceParameters(text, params) {
        if (!params || Object.keys(params).length === 0) {
            return text;
        }
        
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }
    
    /**
     * 地域固有フォーマットを適用
     */
    applyRegionalFormatting(text, params, language, region) {
        let formatted = text;
        
        // 数値フォーマット: {{number:key}}
        formatted = formatted.replace(/\{\{number:(\w+)\}\}/g, (match, key) => {
            const value = params[key];
            if (value !== undefined) {
                return this.formatters.get('number').format(value, language, region);
            }
            return match;
        });
        
        // 日付フォーマット: {{date:key}}
        formatted = formatted.replace(/\{\{date:(\w+)\}\}/g, (match, key) => {
            const value = params[key];
            if (value !== undefined) {
                return this.formatters.get('date').format(value, language, region);
            }
            return match;
        });
        
        // 通貨フォーマット: {{currency:key}}
        formatted = formatted.replace(/\{\{currency:(\w+)\}\}/g, (match, key) => {
            const value = params[key];
            if (value !== undefined) {
                return this.formatters.get('currency').format(value, language, region);
            }
            return match;
        });
        
        // 相対時間フォーマット: {{relative:key}}
        formatted = formatted.replace(/\{\{relative:(\w+)\}\}/g, (match, key) => {
            const value = params[key];
            if (value !== undefined) {
                return this.formatters.get('relative').format(value, language, region);
            }
            return match;
        });
        
        // リストフォーマット: {{list:key}}
        formatted = formatted.replace(/\{\{list:(\w+)\}\}/g, (match, key) => {
            const value = params[key];
            if (value !== undefined && Array.isArray(value)) {
                return this.formatters.get('list').format(value, language, region);
            }
            return match;
        });
        
        return formatted;
    }
    
    /**
     * 特殊フォーマット処理
     */
    processSpecialFormats(text, params, language) {
        let formatted = text;
        
        // 複数形フォーマット: {{plural:key:count}}
        formatted = formatted.replace(/\{\{plural:(\w+):(\w+)\}\}/g, (match, key, countKey) => {
            const count = params[countKey];
            const baseText = params[key];
            if (count !== undefined && baseText !== undefined) {
                return this.formatters.get('plural').format(baseText, count, language);
            }
            return match;
        });
        
        return formatted;
    }
    
    /**
     * フォーマッターを追加
     */
    addFormatter(name, formatter) {
        try {
            if (typeof formatter.format !== 'function') {
                throw new Error('Formatter must have a format method');
            }
            
            this.formatters.set(name, formatter);
            console.log(`Added formatter: ${name}`);
            return true;
        } catch (error) {
            getErrorHandler().handleError(error, 'FORMATTER_ERROR', {
                operation: 'addFormatter',
                name: name
            });
            return false;
        }
    }
    
    /**
     * フォーマッターを削除
     */
    removeFormatter(name) {
        return this.formatters.delete(name);
    }
    
    /**
     * 利用可能なフォーマッターを取得
     */
    getAvailableFormatters() {
        return Array.from(this.formatters.keys());
    }
}

/**
 * 数値フォーマッター
 */
export class NumberFormatter {
    format(value, language, region) {
        try {
            const number = Number(value);
            if (isNaN(number)) {
                return value.toString();
            }
            
            const locale = this.getLocale(language, region);
            return new Intl.NumberFormat(locale).format(number);
        } catch (error) {
            console.warn(`Number formatting failed for ${language}:`, error);
            return value.toString();
        }
    }
    
    getLocale(language, region) {
        if (region) {
            return `${language}-${region}`;
        }
        
        const localeMap = {
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
export class DateFormatter {
    format(value, language, region, options = {}) {
        try {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                return value.toString();
            }
            
            const locale = this.getLocale(language, region);
            const formatOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                ...options
            };
            
            return new Intl.DateTimeFormat(locale, formatOptions).format(date);
        } catch (error) {
            console.warn(`Date formatting failed for ${language}:`, error);
            return value.toString();
        }
    }
    
    getLocale(language, region) {
        if (region) {
            return `${language}-${region}`;
        }
        
        const localeMap = {
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
export class CurrencyFormatter {
    format(value, language, region, currency = null) {
        try {
            const number = Number(value);
            if (isNaN(number)) {
                return value.toString();
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
    
    getLocale(language, region) {
        if (region) {
            return `${language}-${region}`;
        }
        
        const localeMap = {
            'ja': 'ja-JP',
            'en': 'en-US',
            'zh-CN': 'zh-CN',
            'zh-TW': 'zh-TW',
            'ko': 'ko-KR'
        };
        
        return localeMap[language] || language;
    }
    
    getCurrencyCode(language, region) {
        const currencyMap = {
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
export class RelativeTimeFormatter {
    format(value, language, region) {
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
            return value.toString();
        }
    }
    
    getLocale(language, region) {
        if (region) {
            return `${language}-${region}`;
        }
        
        const localeMap = {
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
export class ListFormatter {
    format(value, language, region, options = {}) {
        try {
            if (!Array.isArray(value)) {
                return value.toString();
            }
            
            const locale = this.getLocale(language, region);
            const formatOptions = {
                style: 'long',
                type: 'conjunction',
                ...options
            };
            
            return new Intl.ListFormat(locale, formatOptions).format(value);
        } catch (error) {
            console.warn(`List formatting failed for ${language}:`, error);
            // フォールバック: カンマ区切り
            return value.join(', ');
        }
    }
    
    getLocale(language, region) {
        if (region) {
            return `${language}-${region}`;
        }
        
        const localeMap = {
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
export class PluralFormatter {
    format(text, count, language) {
        try {
            const number = Number(count);
            if (isNaN(number)) {
                return text;
            }
            
            const rules = this.getPluralRules(language);
            const rule = rules.select(number);
            
            // テキストが複数形ルールを含む場合
            if (typeof text === 'object' && text !== null) {
                return text[rule] || text.other || text.one || text;
            }
            
            // シンプル複数形ルール（英語）
            if (language === 'en') {
                return number === 1 ? text : this.makeEnglishPlural(text);
            }
            
            return text;
        } catch (error) {
            console.warn(`Plural formatting failed for ${language}:`, error);
            return text;
        }
    }
    
    getPluralRules(language) {
        try {
            return new Intl.PluralRules(language);
        } catch (error) {
            console.warn(`PluralRules not supported for ${language}, using fallback`);
            // フォールバック実装
            return {
                select: (n) => n === 1 ? 'one' : 'other'
            };
        }
    }
    
    makeEnglishPlural(text) {
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