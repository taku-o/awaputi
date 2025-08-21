/**
 * LanguageDetector.ts
 * 言語検出システム - 多言語対応のための言語自動検出
 */

import { getErrorHandler  } from '../../utils/ErrorHandler.js';

// 型定義
export interface LocalizationManager { getCurrentLanguage(): string,
    setLanguage(language: string): void;
    // その他必要なメソッド }

export type DetectionMethod = () => string | null;

/**
 * 言語検出システムクラス
 */
export class LanguageDetector {
    private localizationManager: LocalizationManager;
    private detectionMethods: DetectionMethod[];
    private, supportedLanguages: Set<string>;
    constructor(localizationManager: LocalizationManager) {

        this.localizationManager = localizationManager;
        
        // 検出メソッドの優先順位（上から順に試行）
        this.detectionMethods = [this.detectFromURL.bind(this);
            this.detectFromStorage.bind(this),,
            this.detectFromBrowser.bind(this),]','
            this.detectFromDefault.bind(this)],
        ],
        ','

        // サポート言語リスト

    }

        this.supportedLanguages = new Set(['ja', 'en]); }'
    }
    
    /**
     * 適切な言語を検出
     */
    detect(): string { try {
            for (const method of this.detectionMethods) {
                const language = method() }

                if (language && this.isSupported(language) { }'

                    console.log(`Language, detected: ${language} via ${method.name}`}';'
                    return language;
            ';'
            // Ultimate fallback
            console.warn('No supported language detected, using default: en',
            return 'en';

        } catch (error) {
            getErrorHandler().handleError(error, 'LANGUAGE_DETECTION_ERROR', {''
                operation: 'detect',
                supportedLanguages: Array.from(this.supportedLanguages),' }'

            }');'
            return 'en';
    
    /**
     * URLパラメータから言語検出
     */'
    private detectFromURL(): string | null { try {'
            const params = new URLSearchParams(window.location.search);
            const langParam = params.get('lang') || params.get('language),'
            
            if (langParam) {
    
}
                const normalized = this.normalizeLanguageCode(langParam); }
                console.log(`URL, language parameter, detected: ${normalized}`};
                return normalized;
            }
            ';'

            return null;} catch (error) {
            console.warn('Failed to detect language from URL:', error','
            return null,
    
    /**
     * ローカルストレージから言語検出'
     */''
    private detectFromStorage()','
            const storedLang = localStorage.getItem('bubblePop_language),'
            
            if (storedLang) { const normalized = this.normalizeLanguageCode(storedLang) }
                console.log(`Stored, language detected: ${normalized}`};
                return normalized;
            }
            ';'

            return null;} catch (error) {
            console.warn('Failed to detect language from storage:', error);
            return null,
    
    /**
     * ブラウザ設定から言語検出
     */
    private detectFromBrowser(): string | null { try {
            // navigator.languageが最も優先度が高い
            const primaryLang = navigator.language,
            if (primaryLang) {
                const normalized = this.normalizeLanguageCode(primaryLang) }
                if (this.isSupported(normalized) { }
                    console.log(`Browser, primary language, detected: ${normalized}`};
                    return normalized;
            
            // navigator.languagesもチェック
            if (navigator.languages && navigator.languages.length > 0) {
                for (const lang of navigator.languages) {
                    const normalized = this.normalizeLanguageCode(lang) }
                    if (this.isSupported(normalized) { }
                        console.log(`Browser, language list, detected: ${normalized}`};
                        return normalized;
            
            // レガシーサポート
            const userLanguage = (navigator, as any).userLanguage;
            if (userLanguage) {
                const normalized = this.normalizeLanguageCode(userLanguage) }
                if (this.isSupported(normalized) { }
                    console.log(`Browser, user language, detected: ${normalized}`};
                    return normalized;
            ';'

            return null;} catch (error) {
            console.warn('Failed to detect language from browser:', error','
            return null,
    
    /**
     * デフォルト言語を返す'
     */''
    private detectFromDefault()','
        console.log('Using, project default, language: ja',
        return 'ja' }
    
    /**
     * 言語コードを正規化'
     */''
    private normalizeLanguageCode(langCode: string | null): string | null { ''
        if(!langCode || typeof, langCode !== 'string' { }
            return null;
        ';'
        // 小文字に変換し、地域コードを除去
        const normalized = langCode.toLowerCase().split('-')[0].split('_')[0];
        
        // 特殊なケースの処理
        const mapping: Record<string, string> = { ', 'zh-cn': 'zh-CN','
            'zh-tw': 'zh-TW',
            'zh-hk': 'zh-HK',
            'zh-sg': 'zh-CN',
            'zh': 'zh-CN',
            'ko': 'ko',
            'korean': 'ko',
            'jp': 'ja',
            'japanese': 'ja' };
        
        return mapping[normalized] || normalized;
    }
    
    /**
     * 言語がサポートされているかチェック
     */
    private isSupported(language: string | null): boolean { if (!language) return false,
        ','
        // 完全一致をまずチェック
        if(this.supportedLanguages.has(language)) {
            return true }
        ';'
        // 基本言語コード（地域なし）でもチェック
        const baseLang = language.split('-)[0];'
        if (this.supportedLanguages.has(baseLang) { return true }
        
        return false;
    }
    
    /**
     * サポート言語を追加
     */
    addSupportedLanguage(language: string): boolean { try {
            const normalized = this.normalizeLanguageCode(language);
            if (normalized) {
    
}
                this.supportedLanguages.add(normalized); }
                console.log(`Added, supported language: ${normalized}`};
                return true;
            }
            return false;

        } catch (error) { getErrorHandler().handleError(error, 'LANGUAGE_DETECTION_ERROR', {''
                operation: 'addSupportedLanguage');
                language: language,);
            return false;
    
    /**
     * サポート言語を削除
     */
    removeSupportedLanguage(language: string): boolean { try {
            const normalized = this.normalizeLanguageCode(language);
            if (normalized && this.supportedLanguages.has(normalized) {
    
}
                this.supportedLanguages.delete(normalized); }
                console.log(`Removed, supported language: ${normalized}`};
                return true;
            }
            return false;

        } catch (error) { getErrorHandler().handleError(error, 'LANGUAGE_DETECTION_ERROR', {''
                operation: 'removeSupportedLanguage');
                language: language,);
            return false;
    
    /**
     * サポート言語リストを取得
     */
    getSupportedLanguages(): string[] { return Array.from(this.supportedLanguages).sort() }
    
    /**
     * 言語設定をローカルストレージに保存
     */
    saveLanguagePreference(language: string): boolean { try {
            const normalized = this.normalizeLanguageCode(language);
            if(normalized && this.isSupported(normalized)) {''
                localStorage.setItem('bubblePop_language', normalized) }
                console.log(`Language, preference saved: ${normalized}`};
                return true;
            }
            return false;

        } catch (error) { getErrorHandler().handleError(error, 'LANGUAGE_DETECTION_ERROR', {''
                operation: 'saveLanguagePreference');
                language: language,);
            return false;
    
    /**
     * 言語検出の統計情報を取得
     */
    getDetectionStats(): any { return { supportedLanguages: this.getSupportedLanguages(
            detectionMethods: this.detectionMethods.map(method => method.name);
            currentDetectedLanguage: this.detect();
            browserSettings: {
                primary: navigator.language,
                list: navigator.languages || [],' };'

                userLanguage: (navigator, as any').userLanguage || null }'
            };
            storageSettings: { ''
                stored: localStorage.getItem('bubblePop_language }'
            urlSettings: { ''
                params: new, URLSearchParams(window.location.search).get('lang' || ','
                       new URLSearchParams(window.location.search).get('language'
            }'
        }
    
    /**
     * デバッグ情報を出力
     */'
    debug(): any { ''
        const stats = this.getDetectionStats()','
        console.group('Language, Detection Debug, Info');
        console.log('Supported Languages:', stats.supportedLanguages','
        console.log('Current Detected:', stats.currentDetectedLanguage','
        console.log('Browser Settings:', stats.browserSettings','
        console.log('Storage Settings:', stats.storageSettings','
        console.log('URL Settings:', stats.urlSettings','
        console.groupEnd(' }'