/**
 * CulturalAdaptationHandler - 文化的適応処理システム
 * 
 * RTL言語、地域設定、文化的コンテキスト、地域固有の表示設定を専門的に管理します
 */

// 型定義
export interface CulturalAdaptationConfig { enabled: boolean,
    rtlLanguages: string[],
    numeralSystems: Record<string, NumeralSystem>,
    dateFormats: Record<string, string>,
    colorMeanings: Record<string, ColorMeanings>,
    gestureConventions: Record<string, GestureConventions>, }
}

export interface ColorMeanings { [color: string]: string, }
}

export interface GestureConventions { [gesture: string]: GestureAppropriateness,
    }
}

export interface RegionalUISettings { textDirection: TextDirection,
    fontFamily: string,
    fontSize: string,
    lineHeight: number,
    spacing: SpacingMode,
    preferredInputMethod: InputMethod
    }
}

export interface TimeFormatSettings { time12: boolean,
    dateFormat: string,
    timeFormat: string,
    weekStart: number,
    era: CalendarEra
    }
}

export interface NumberFormatSettings { decimal: string,
    thousands: string,
    currency: string,
    currencyPosition: CurrencyPosition
    }
}

export interface CulturalAdaptationStats { supportedRTLLanguages: number,
    supportedNumeralSystems: number,
    supportedDateFormats: number,
    supportedColorMeanings: number,
    supportedGestureConventions: number,
    regionalUILanguages: number,
    timeFormatLanguages: number,
    numberFormatLanguages: number }
}

export interface CulturalDebugInfo { language: string,
    isRTL: boolean,
    textDirection: TextDirection,
    numeralSystem: NumeralSystem,
    dateFormat: string,
    uiSettings: RegionalUISettings,
    timeFormat: TimeFormatSettings,
    numberFormat: NumberFormatSettings,
    stats: CulturalAdaptationStats
    }
}

export interface NumberFormatOptions { style: NumberFormatType,
    currency?: string }
}

// 列挙型
export type NumeralSystem = 'latin' | 'arab' | 'persian' | 'thai' | 'devanagari';''
export type TextDirection = 'ltr' | 'rtl';''
export type SpacingMode = 'compact' | 'normal' | 'comfortable' | 'wide';''
export type InputMethod = 'mouse' | 'keyboard' | 'touch' | 'mixed';''
export type GestureAppropriateness = 'acceptable' | 'avoid' | 'ok' | 'approval';''
export type CalendarEra = 'ad' | 'hijri';''
export type CurrencyPosition = 'before' | 'after';''
export type NumberFormatType = 'decimal' | 'currency' | 'percent';

export class CulturalAdaptationHandler {
    private culturalAdaptation: CulturalAdaptationConfig;
    private regionalUISettings: Record<string, RegionalUISettings>;
    private timeFormats: Record<string, TimeFormatSettings>;
    private numberFormats: Record<string, NumberFormatSettings>;'
'';
    constructor(''';
            rtlLanguages: ['ar', 'he', 'fa', 'ur'],';
            numeralSystems: {''
                'ar': 'arab','';
                'fa': 'persian','';
                'th': 'thai','';
                'hi': 'devanagari' }
            },'
            dateFormats: { ''
                'ja': 'YYYY年MM月DD日','';
                'en': 'MM/DD/YYYY','';
                'en-GB': 'DD/MM/YYYY','';
                'de': 'DD.MM.YYYY','';
                'fr': 'DD/MM/YYYY' }
            },'
            colorMeanings: { ' }'
                'ja': { red: 'danger', green: 'safety', blue: 'trust' },''
                'en': { red: 'danger', green: 'success', blue: 'information' },''
                'zh': { red: 'luck', gold: 'prosperity', white: 'purity' }
            },'
            gestureConventions: { ' }'
                'ja': { pointing: 'avoid', thumbUp: 'ok' },''
                'en': { pointing: 'acceptable', thumbUp: 'approval' },''
                'ar': { leftHand: 'avoid', thumbUp: 'acceptable' }
            }
        };
        
        // 地域固有の UI 設定
        this.regionalUISettings = { ''
            'ja': {''
                textDirection: 'ltr','';
                fontFamily: 'Noto Sans JP, "Hiragino Kaku Gothic ProN", Meiryo, sans-serif','';
                fontSize: '14px',';
                lineHeight: 1.6,'';
                spacing: 'comfortable','';
                preferredInputMethod: 'keyboard' }'
            },''
            'en': { ''
                textDirection: 'ltr','';
                fontFamily: 'Roboto, "Segoe UI", sans-serif','';
                fontSize: '14px',';
                lineHeight: 1.4,'';
                spacing: 'normal','';
                preferredInputMethod: 'mouse' }'
            },''
            'ar': { ''
                textDirection: 'rtl','';
                fontFamily: 'Noto Sans Arabic, "Traditional Arabic", sans-serif','';
                fontSize: '16px',';
                lineHeight: 1.8,'';
                spacing: 'wide','';
                preferredInputMethod: 'keyboard' }'
            },''
            'zh': { ''
                textDirection: 'ltr','';
                fontFamily: 'Noto Sans SC, "Microsoft YaHei", sans-serif','';
                fontSize: '14px',';
                lineHeight: 1.5,'';
                spacing: 'compact','';
                preferredInputMethod: 'mixed' }
            }
        },
        
        // 時刻・日付フォーマット
        this.timeFormats = { ''
            'ja': {'
                time12: false,'';
                dateFormat: 'YYYY/MM/DD','';
                timeFormat: 'HH:mm',';
                weekStart: 1, // Monday;
                era: 'ad' }'
            },''
            'en': { time12: true,''
                dateFormat: 'MM/DD/YYYY','';
                timeFormat: 'h:mm A',';
                weekStart: 0, // Sunday;
                era: 'ad' }'
            },''
            'ar': { time12: true,''
                dateFormat: 'DD/MM/YYYY','';
                timeFormat: 'h:mm A',';
                weekStart: 6, // Saturday;
                era: 'hijri' // イスラム暦オプション }
            }
        },
        
        // 数値・通貨フォーマット
        this.numberFormats = { ''
            'ja': {''
                decimal: '.','';
                thousands: ',','';
                currency: '¥','';
                currencyPosition: 'before' }'
            },''
            'en': { ''
                decimal: '.','';
                thousands: ',','';
                currency: '$','';
                currencyPosition: 'before' }'
            },''
            'de': { ''
                decimal: ',','';
                thousands: '.','';
                currency: '€','';
                currencyPosition: 'after' }'
            },''
            'ar': { ''
                decimal: '.','';
                thousands: ',','';
                currency: 'ر.س','';
                currencyPosition: 'after' }
            })
        })
    }
    
    /**
     * 言語がRTL（右から左）かどうかをチェック
     * @param language 言語コード
     * @returns RTLかどうか
     */'
    isRTLLanguage(language: string): boolean { ''
        return this.culturalAdaptation.rtlLanguages.includes(language'); }
    }
    
    /**
     * 言語に応じた文字方向を取得'
     * @param language 言語コード''
     * @returns 文字方向（'ltr' または 'rtl'）
     */
    getTextDirection(language: string): TextDirection { if (this.regionalUISettings[language]) {
            return this.regionalUISettings[language].textDirection; }'
        }''
        return this.isRTLLanguage(language') ? 'rtl' : 'ltr';
    }
    
    /**
     * 言語に応じた数値システムを取得
     * @param language 言語コード
     * @returns 数値システム'
     */''
    getNumeralSystem(language: string'): NumeralSystem { ''
        return this.culturalAdaptation.numeralSystems[language] || 'latin'; }
    }
    
    /**
     * 言語に応じた日付フォーマットを取得
     * @param language 言語コード
     * @returns 日付フォーマット'
     */''
    getDateFormat(language: string'): string { ''
        return this.culturalAdaptation.dateFormats[language] || 'MM/DD/YYYY'; }
    }
    
    /**
     * 言語に応じた色の意味を取得
     * @param language 言語コード
     * @param color 色名
     * @returns 色の意味
     */
    getColorMeaning(language: string, color: string): string | null { const colorMeanings = this.culturalAdaptation.colorMeanings[language];
        return colorMeanings ? colorMeanings[color] : null; }
    }
    
    /**
     * 言語に応じたジェスチャー慣習を取得
     * @param language 言語コード
     * @param gesture ジェスチャー名
     * @returns ジェスチャーの適切性'
     */''
    getGestureConvention(language: string, gesture: string'): GestureAppropriateness { const gestureConventions = this.culturalAdaptation.gestureConventions[language];''
        return gestureConventions ? gestureConventions[gesture] as GestureAppropriateness: 'acceptable' }
    }
    
    /**
     * 地域固有のUI設定を取得
     * @param language 言語コード
     * @returns UI設定'
     */''
    getRegionalUISettings(language: string'): RegionalUISettings { ''
        return this.regionalUISettings[language] || this.regionalUISettings['en']; }
    }
    
    /**
     * 時刻フォーマット設定を取得
     * @param language 言語コード
     * @returns 時刻フォーマット設定'
     */''
    getTimeFormat(language: string'): TimeFormatSettings { ''
        return this.timeFormats[language] || this.timeFormats['en']; }
    }
    
    /**
     * 数値フォーマット設定を取得
     * @param language 言語コード
     * @returns 数値フォーマット設定'
     */''
    getNumberFormat(language: string'): NumberFormatSettings { ''
        return this.numberFormats[language] || this.numberFormats['en']; }
    }
    
    /**
     * 日付を言語に応じてフォーマット
     * @param date 日付オブジェクト
     * @param language 言語コード
     * @returns フォーマットされた日付文字列
     */'
    formatDate(date: Date, language: string): string { const format = this.getDateFormat(language);''
        const timeSettings = this.getTimeFormat(language');
        
        try {
            return new Intl.DateTimeFormat(language, {''
                year: 'numeric','';
                month: '2-digit',')';
                day: '2-digit',')';
                calendar: timeSettings.era === 'hijri' ? 'islamic' : 'gregory')).format(date) }
        } catch (error) { // フォールバック
            const year = date.getFullYear();''
            const month = String(date.getMonth() + 1').padStart(2, '0');''
            const day = String(date.getDate()').padStart(2, '0'');
            ';'
            return format'';
                .replace('YYYY', year.toString()')'';
                .replace('MM', month')'';
                .replace('DD', day); }
        }
    }
    
    /**
     * 時刻を言語に応じてフォーマット
     * @param date 日付オブジェクト
     * @param language 言語コード
     * @returns フォーマットされた時刻文字列
     */'
    formatTime(date: Date, language: string): string { ''
        const timeSettings = this.getTimeFormat(language');
        
        try {
            return new Intl.DateTimeFormat(language, {''
                hour: '2-digit',')';
                minute: '2-digit',);
                hour12: timeSettings.time12)).format(date) }
        } catch (error) { // フォールバック
            const hours = timeSettings.time12 ;
                ? date.getHours() % 12 || 12;
                : date.getHours();''
            const minutes = String(date.getMinutes()').padStart(2, '0');'
            const ampm = timeSettings.time12 '';
                ? (date.getHours(') >= 12 ? 'PM' : 'AM'')'';
                : '';'
            ' }'
            return `${hours}:${minutes} ${ampm}`.trim('''
     * @param type フォーマットタイプ（'decimal', 'currency', 'percent'）
     * @returns フォーマットされた数値文字列)'
     */')'
    formatNumber(number: number, language: string, type: NumberFormatType = 'decimal'): string { ''
        const numberSettings = this.getNumberFormat(language');
        
        try { }'
            const options: NumberFormatOptions = { style: type }''
            if (type === 'currency') { options.currency = this.getCurrencyCode(language); }
            }
            ';'
            return new Intl.NumberFormat(language, options).format(number);''
        } catch (error) { // フォールバック
            const formatted = number.toLocaleString('en', {')'
                style: type === 'currency' ? 'decimal' : type),' }'
            }');'
            '';
            if(type === 'currency'') {'
                const currency = numberSettings.currency;'
            }'
                return numberSettings.currencyPosition === 'before'  }
                    ? `${currency}${formatted}`
                    : `${formatted}${currency}`;
            }
            
            return formatted;
        }
    }
    
    /**
     * 言語に応じた通貨コードを取得
     * @param language 言語コード
     * @returns 通貨コード'
     */''
    getCurrencyCode(language: string'): string { const currencyMap: Record<string, string> = {''
            'ja': 'JPY','';
            'en': 'USD','';
            'en-GB': 'GBP','';
            'de': 'EUR','';
            'fr': 'EUR','';
            'ar': 'SAR','';
            'zh': 'CNY' }'
        };''
        return currencyMap[language] || 'USD';
    }
    
    /**
     * CSS文字方向プロパティを適用
     * @param element 対象要素
     * @param language 言語コード
     */
    applyCSSDirection(element: HTMLElement, language: string): void { if (element) {
            element.dir = this.getTextDirection(language);
            element.style.direction = this.getTextDirection(language); }
        }
    }
    
    /**
     * 地域固有のフォント設定を適用
     * @param element 対象要素
     * @param language 言語コード
     */
    applyRegionalFont(element: HTMLElement, language: string): void { if (element) {
            const settings = this.getRegionalUISettings(language);
            element.style.fontFamily = settings.fontFamily;
            element.style.fontSize = settings.fontSize;
            element.style.lineHeight = settings.lineHeight.toString(); }
        }
    }
    
    /**
     * 文化的適応設定を更新
     * @param newSettings 新しい設定
     */
    updateCulturalSettings(newSettings: Partial<CulturalAdaptationConfig>): void { Object.assign(this.culturalAdaptation, newSettings); }
    }
    
    /**
     * 地域UI設定を更新
     * @param language 言語コード
     * @param settings UI設定
     */
    updateRegionalUISettings(language: string, settings: Partial<RegionalUISettings>): void { this.regionalUISettings[language] = { 
            ...this.regionalUISettings[language], ;
            ...settings  }
        };
    }
    
    /**
     * 時刻フォーマット設定を更新
     * @param language 言語コード
     * @param settings 時刻フォーマット設定
     */
    updateTimeFormatSettings(language: string, settings: Partial<TimeFormatSettings>): void { this.timeFormats[language] = {
            ...this.timeFormats[language],
            ...settings }
        };
    }
    
    /**
     * 数値フォーマット設定を更新
     * @param language 言語コード
     * @param settings 数値フォーマット設定
     */
    updateNumberFormatSettings(language: string, settings: Partial<NumberFormatSettings>): void { this.numberFormats[language] = {
            ...this.numberFormats[language],
            ...settings }
        };
    }
    
    /**
     * サポートされている言語一覧を取得
     * @returns 言語コード配列
     */
    getSupportedLanguages(): string[] { const languageSet = new Set<string>();
        
        // 各設定から言語コードを収集
        Object.keys(this.culturalAdaptation.dateFormats).forEach(lang => languageSet.add(lang);
        Object.keys(this.regionalUISettings).forEach(lang => languageSet.add(lang);
        Object.keys(this.timeFormats).forEach(lang => languageSet.add(lang);
        Object.keys(this.numberFormats).forEach(lang => languageSet.add(lang);
        
        return Array.from(languageSet).sort(); }
    }
    
    /**
     * 言語がサポートされているかチェック
     * @param language 言語コード
     * @returns サポートされているかどうか
     */
    isLanguageSupported(language: string): boolean { return this.getSupportedLanguages().includes(language); }
    }
    
    /**
     * 文化的適応の統計情報を取得
     * @returns 統計情報
     */
    getCulturalAdaptationStats(): CulturalAdaptationStats { return { supportedRTLLanguages: this.culturalAdaptation.rtlLanguages.length,
            supportedNumeralSystems: Object.keys(this.culturalAdaptation.numeralSystems).length,
            supportedDateFormats: Object.keys(this.culturalAdaptation.dateFormats).length,
            supportedColorMeanings: Object.keys(this.culturalAdaptation.colorMeanings).length,
            supportedGestureConventions: Object.keys(this.culturalAdaptation.gestureConventions).length,
            regionalUILanguages: Object.keys(this.regionalUISettings).length,
            timeFormatLanguages: Object.keys(this.timeFormats).length, };
            numberFormatLanguages: Object.keys(this.numberFormats).length }
        },
    }
    
    /**
     * デバッグ情報の取得
     * @param language 言語コード
     * @returns デバッグ情報
     */
    getDebugInfo(language: string): CulturalDebugInfo { return { language,
            isRTL: this.isRTLLanguage(language),
            textDirection: this.getTextDirection(language),
            numeralSystem: this.getNumeralSystem(language),
            dateFormat: this.getDateFormat(language),
            uiSettings: this.getRegionalUISettings(language),
            timeFormat: this.getTimeFormat(language),
            numberFormat: this.getNumberFormat(language), };
            stats: this.getCulturalAdaptationStats(); }
        };
    }
    
    /**
     * 設定をJSONで取得
     * @returns 全設定のJSON表現
     */
    exportSettings(): string { return JSON.stringify({
            culturalAdaptation: this.culturalAdaptation);
            regionalUISettings: this.regionalUISettings);
            timeFormats: this.timeFormats,);
            numberFormats: this.numberFormats), null, 2) }
    }
    
    /**
     * 設定をJSONから読み込み
     * @param jsonSettings JSON形式の設定
     */
    importSettings(jsonSettings: string): void { try {
            const settings = JSON.parse(jsonSettings);
            
            if (settings.culturalAdaptation) { }
                this.culturalAdaptation = { ...this.culturalAdaptation, ...settings.culturalAdaptation };
            }
            if(settings.regionalUISettings) {
                
            }
                this.regionalUISettings = { ...this.regionalUISettings, ...settings.regionalUISettings };
            }
            if(settings.timeFormats) {
                
            }
                this.timeFormats = { ...this.timeFormats, ...settings.timeFormats };
            }
            if(settings.numberFormats) {
                
            }
                this.numberFormats = { ...this.numberFormats, ...settings.numberFormats };''
            } catch (error) { ''
            console.error('Failed to import cultural adaptation settings:', error');''
            throw new Error('Invalid JSON format for cultural adaptation settings'); }
        }
    }
    
    /**
     * リソースの解放'
     */''
    destroy()';
        console.log('Cultural Adaptation Handler destroyed'');'
    }''
}