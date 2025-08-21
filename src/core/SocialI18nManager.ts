/**
 * ソーシャル機能専用国際化マネージャー (Task, 24)
 * 多言語メッセージテンプレート、地域別ソーシャルメディア対応を提供
 */

import { ErrorHandler  } from '../utils/ErrorHandler.js';

export class SocialI18nManager {'

    constructor(localizationManager, options = {)) {
        this.localizationManager = localizationManager;
        
        // 設定
        this.config = {
            // 対応言語（優先度順）
            supportedLanguages: ['';
                'ja', // 日本語（デフォルト）;
                'en', // 英語;
                'ko', // 韓国語;
                'zh-CN', // 中国語（簡体字）;
                'zh-TW', // 中国語（繁体字）;
                'es', // スペイン語;
                'fr', // フランス語;
                'de', // ドイツ語;
                'pt', // ポルトガル語]';
                'ru'  // ロシア語];
            ],
            
            // 地域別設定
            regionalSettings: {'', 'ja': {''
                    platforms: ['twitter', 'line', 'facebook', 'copy'],
                    dateFormat: 'YYYY年MM月DD日',
                    numberFormat: '99,999',
                    currency: 'JPY';
                   , rtl: false,
                    socialHosts: {''
                        twitter: 'twitter.com',
                        facebook: 'facebook.com' ,}

                },'', 'en': { ''
                    platforms: ['twitter', 'facebook', 'reddit', 'copy'],
                    dateFormat: 'MM/DD/YYYY',
                    numberFormat: '99,999',
                    currency: 'USD';
                   , rtl: false,
                    socialHosts: {''
                        twitter: 'twitter.com',
                        facebook: 'facebook.com' ,}

                },'', 'ko': { ''
                    platforms: ['twitter', 'facebook', 'kakaotalk', 'copy'],
                    dateFormat: 'YYYY년 MM월 DD일',
                    numberFormat: '99,999',
                    currency: 'KRW';
                   , rtl: false,
                    socialHosts: {''
                        twitter: 'twitter.com',
                        facebook: 'facebook.com' ,}

                },'', 'zh-CN': { ''
                    platforms: ['weibo', 'wechat', 'qq', 'copy'],
                    dateFormat: 'YYYY年MM月DD日',
                    numberFormat: '99,999',
                    currency: 'CNY';
                   , rtl: false,
                    socialHosts: {''
                        weibo: 'weibo.com',
                        wechat: 'weixin.qq.com' ,}

                },'', 'zh-TW': { ''
                    platforms: ['facebook', 'line', 'twitter', 'copy'],
                    dateFormat: 'YYYY年MM月DD日',
                    numberFormat: '99,999',
                    currency: 'TWD';
                   , rtl: false,
                    socialHosts: {''
                        twitter: 'twitter.com',
                        facebook: 'facebook.com' ,}

                },'', 'ar': { ''
                    platforms: ['twitter', 'facebook', 'telegram', 'copy'],
                    dateFormat: 'DD/MM/YYYY',
                    numberFormat: '99,999',
                    currency: 'USD';
                   , rtl: true,
                    socialHosts: {''
                        twitter: 'twitter.com',
                        facebook: 'facebook.com' ,}
};
            // キャッシュ設定
            cache: { enabled: options.cache !== false;
                maxSize: options.cacheSize || 1000;
               , ttl: options.cacheTtl || 3600000 // 1時間 };
            // フォールバック設定
            fallback: { ''
                language: options.fallbackLanguage || 'en';
               , enabled: options.fallback !== false }
        };
        // 状態管理
        this.state = {;
            currentLanguage: 'ja',
            loadedLanguages: new Set(['ja]);
            loading: false;
           , error: null ,};
        // メッセージテンプレート
        this.messageTemplates = { // 基本共有メッセージ
            shareScore: {' }'

                ja: 'BubblePopで{score}点を獲得しました！🎮 #{gameTitle} #{score}点',''
                en: 'I scored {score} points in BubblePop! 🎮 #{gameTitle} #{score}points',''
                ko: 'BubblePop에서 {score}점을 획득했습니다! 🎮 #{gameTitle} #{score}점';'', 'zh-CN': '我在BubblePop中获得了{score}分！🎮 #{gameTitle} #{score}分','', 'zh-TW': '我在BubblePop中獲得了{score}分！🎮 #{gameTitle} #{score}分',''
                es: '¡Conseguí {score} puntos en BubblePop! 🎮 #{gameTitle} #{score}puntos',''
                fr: "J'ai marqué {score} points dans BubblePop ! 🎮 #{gameTitle} #{score}points",""
                de: 'Ich habe {score} Punkte in BubblePop erreicht! 🎮 #{gameTitle} #{score}Punkte',''
                pt: 'Fiz {score} pontos no BubblePop! 🎮 #{gameTitle} #{score}pontos',''
                ru: 'Я набрал {score} очков в BubblePop! 🎮 #{gameTitle} #{score}очков'
            };
            // ハイスコア達成
            highScore: { ' }'

                ja: '🏆 新記録達成！BubblePopで{score}点の新ハイスコアを樹立しました！',''
                en: '🏆 New High Score! Achieved {score} points in BubblePop!',''
                ko: '🏆 신기록 달성! BubblePop에서 {score}점의 새로운 최고점수를 달성했습니다!';'', 'zh-CN': '🏆 创新纪录！在BubblePop中创造了{score}分的新高分！','', 'zh-TW': '🏆 創新紀錄！在BubblePop中創造了{score}分的新高分！',''
                es: '🏆 ¡Nuevo récord! ¡Logré {score} puntos en BubblePop!',''
                fr: "🏆 Nouveau record ! J'ai atteint {score} points dans BubblePop !",""
                de: '🏆 Neuer Rekord! {score} Punkte in BubblePop erreicht!',''
                pt: '🏆 Novo recorde! Alcancei {score} pontos no BubblePop!',''
                ru: '🏆 Новый рекорд! Достиг {score} очков в BubblePop!'
            };
            // 実績解除
            achievement: { ' }'

                ja: '🎖️ 実績「{achievementName}」を解除しました！BubblePopで新たな挑戦を達成！',''
                en: '🎖️ Achievement, unlocked: \"{achievementName}\"! Conquered a new challenge in BubblePop!',''
                ko: '🎖️ 업적 \"{achievementName}\" 해제! BubblePop에서 새로운 도전을 달성했습니다!';'', 'zh-CN': '🎖️ 解锁成就：\"{achievementName}\"！在BubblePop中完成了新挑战！','', 'zh-TW': '🎖️ 解鎖成就：\"{achievementName}\"！在BubblePop中完成了新挑戰！',''
                es: '🎖️ ¡Logro, desbloqueado: \"{achievementName}\"! ¡Conquisté un nuevo desafío en BubblePop!',''
                fr: '🎖️ Succès débloqué : \"{achievementName}\" ! Nouveau défi conquis dans BubblePop !',''
                de: '🎖️ Erfolg, freigeschaltet: \"{achievementName}\"! Neue Herausforderung in BubblePop gemeistert!',''
                pt: '🎖️ Conquista, desbloqueada: \"{achievementName}\"! Novo desafio conquistado no BubblePop!',''
                ru: '🎖️ Достижение разблокировано: \"{achievementName}\"! Покорил новый вызов в BubblePop!'
            };
            // チャレンジ完了
            challengeComplete: { ' }'

                ja: '✅ チャレンジ「{challengeName}」完了！{reward}を獲得しました！',''
                en: '✅ Challenge \"{challengeName}\" completed! Earned {reward}!',''
                ko: '✅ 챌린지 \"{challengeName}\" 완료! {reward}를 획득했습니다!';'', 'zh-CN': '✅ 挑战 \"{challengeName}\" 完成！获得了{reward}！','', 'zh-TW': '✅ 挑戰 \"{challengeName}\" 完成！獲得了{reward}！',''
                es: '✅ ¡Desafío \"{challengeName}\" completado! ¡Gané {reward}!',''
                fr: "✅ Défi \"{challengeName}\" terminé ! J'ai gagné {reward} !",""
                de: '✅ Herausforderung \"{challengeName}\" abgeschlossen! {reward} erhalten!',''
                pt: '✅ Desafio \"{challengeName}\" concluído! Ganhei {reward}!',''
                ru: '✅ Вызов \"{challengeName}\" завершен! Получил {reward}!'
            };
            // リーダーボード
            leaderboard: { ' }'

                ja: '🏅 BubblePopリーダーボードで{rank}位にランクイン！総スコア{totalScore}点',''
                en: '🏅 Ranked #{rank} on BubblePop leaderboard! Total score: {totalScore}',''
                ko: '🏅 BubblePop 리더보드에서 {rank}위에 랭크인! 총점 {totalScore}점';'', 'zh-CN': '🏅 在BubblePop排行榜中排名第{rank}！总分{totalScore}分','', 'zh-TW': '🏅 在BubblePop排行榜中排名第{rank}！總分{totalScore}分',''
                es: '🏅 ¡Clasificado #{rank} en la tabla de líderes de BubblePop! Puntuación total: {totalScore}',''
                fr: '🏅 Classé #{rank} au classement BubblePop ! Score total : {totalScore}',''
                de: '🏅 Platz #{rank} in der BubblePop-Bestenliste! Gesamtpunktzahl: {totalScore}',''
                pt: '🏅 Classificado em #{rank} no ranking do BubblePop! Pontuação total: {totalScore}',''
                ru: '🏅 Занял #{rank} место в таблице лидеров BubblePop! Общий счет: {totalScore}'
};
        // UIテキスト
        this.uiTexts = { // 共有ダイアログ
            shareDialog: {
                title: {''
                    ja: '共有',
                    en: 'Share',
                    ko: '공유',
                    'zh-CN': '分享',
                    'zh-TW': '分享',
                    es: 'Compartir',
                    fr: 'Partager',
                    de: 'Teilen',
                    pt: 'Compartilhar',
                    ru: 'Поделиться' ,};
                cancel: { ''
                    ja: 'キャンセル',
                    en: 'Cancel',
                    ko: '취소',
                    'zh-CN': '取消',
                    'zh-TW': '取消',
                    es: 'Cancelar',
                    fr: 'Annuler',
                    de: 'Abbrechen',
                    pt: 'Cancelar',
                    ru: 'Отмена' ,};
                platforms: { twitter: {''
                        ja: 'Twitter',
                        en: 'Twitter',
                        ko: 'Twitter',
                        'zh-CN': 'Twitter',
                        'zh-TW': 'Twitter',
                        es: 'Twitter',
                        fr: 'Twitter',
                        de: 'Twitter',
                        pt: 'Twitter',
                        ru: 'Twitter' ,};
                    facebook: { ''
                        ja: 'Facebook',
                        en: 'Facebook',
                        ko: 'Facebook',
                        'zh-CN': 'Facebook',
                        'zh-TW': 'Facebook',
                        es: 'Facebook',
                        fr: 'Facebook',
                        de: 'Facebook',
                        pt: 'Facebook',
                        ru: 'Facebook' ,};
                    line: { ''
                        ja: 'LINE',
                        en: 'LINE',
                        ko: 'LINE',
                        'zh-CN': 'LINE',
                        'zh-TW': 'LINE',
                        es: 'LINE',
                        fr: 'LINE',
                        de: 'LINE',
                        pt: 'LINE',
                        ru: 'LINE' ,};
                    copy: { ''
                        ja: 'コピー',
                        en: 'Copy',
                        ko: '복사',
                        'zh-CN': '复制',
                        'zh-TW': '複製',
                        es: 'Copiar',
                        fr: 'Copier',
                        de: 'Kopieren',
                        pt: 'Copiar',
                        ru: 'Копировать' ,}
};
            // チャレンジUI
            challengeUI: { title: {''
                    ja: 'チャレンジ',
                    en: 'Challenges',
                    ko: '챌린지',
                    'zh-CN': '挑战',
                    'zh-TW': '挑戰',
                    es: 'Desafíos',
                    fr: 'Défis',
                    de: 'Herausforderungen',
                    pt: 'Desafios',
                    ru: 'Вызовы' ,};
                difficulty: { easy: {''
                        ja: '簡単',
                        en: 'Easy',
                        ko: '쉬움',
                        'zh-CN': '简单',
                        'zh-TW': '簡單',
                        es: 'Fácil',
                        fr: 'Facile',
                        de: 'Einfach',
                        pt: 'Fácil',
                        ru: 'Легко' ,};
                    medium: { ''
                        ja: '普通',
                        en: 'Medium',
                        ko: '보통',
                        'zh-CN': '中等',
                        'zh-TW': '中等',
                        es: 'Medio',
                        fr: 'Moyen',
                        de: 'Mittel',
                        pt: 'Médio',
                        ru: 'Средне' ,};
                    hard: { ''
                        ja: '難しい',
                        en: 'Hard',
                        ko: '어려움',
                        'zh-CN': '困难',
                        'zh-TW': '困難',
                        es: 'Difícil',
                        fr: 'Difficile',
                        de: 'Schwer',
                        pt: 'Difícil',
                        ru: 'Сложно' ,}
};
            // リーダーボード
            leaderboard: { title: {''
                    ja: 'リーダーボード',
                    en: 'Leaderboard',
                    ko: '리더보드',
                    'zh-CN': '排行榜',
                    'zh-TW': '排行榜',
                    es: 'Tabla de líderes',
                    fr: 'Classement',
                    de: 'Bestenliste',
                    pt: 'Ranking',
                    ru: 'Таблица лидеров' ,};
                rank: { ''
                    ja: '順位',
                    en: 'Rank',
                    ko: '순위',
                    'zh-CN': '排名',
                    'zh-TW': '排名',
                    es: 'Rango',
                    fr: 'Rang',
                    de: 'Rang',
                    pt: 'Posição',
                    ru: 'Место' ,};
                score: { ''
                    ja: 'スコア',
                    en: 'Score',
                    ko: '점수',
                    'zh-CN': '分数',
                    'zh-TW': '分數',
                    es: 'Puntuación',
                    fr: 'Score',
                    de: 'Punktzahl',
                    pt: 'Pontuação',
                    ru: 'Очки' ,}
};
        // キャッシュ
        this.cache = new Map();
        
        // フォーマッター
        this.formatters = { number: this.createNumberFormatter.bind(this),
            date: this.createDateFormatter.bind(this);
           , currency: this.createCurrencyFormatter.bind(this ,};
        
        // 統計
        this.stats = { translationRequests: 0,
            cacheHits: 0;
            cacheMisses: 0;
            languageChanges: 0;
           , errors: 0 ,};
        this.initialize()';
        this.log('SocialI18nManager初期化完了);
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            // LocalizationManagerの現在の言語を取得
            if (this.localizationManager) {''
                this.state.currentLanguage = this.localizationManager.getCurrentLanguage(') || 'ja';
                ';
                // 言語変更イベントのリスナー登録
                if(typeof, this.localizationManager.addChangeListener === 'function) {'
    }
                    this.localizationManager.addChangeListener((newLanguage, oldLanguage) => {  }
                        this.handleLanguageChange(newLanguage, oldLanguage); }
                    }
            }
            
            // 現在の言語を読み込み済みとして設定
            this.state.loadedLanguages.add(this.state.currentLanguage);

        } catch (error) {
            this.handleError('SOCIAL_I18N_INIT_FAILED', error); }
    }
    
    /**
     * メッセージテンプレートの取得
     */
    getMessage(messageKey, language = null, params = {}) {
        try {
            this.stats.translationRequests++;
            
    }
            const lang = language || this.state.currentLanguage; }
            const cacheKey = `${messageKey}-${lang}-${JSON.stringify(params})`;
            
            // キャッシュチェック
            if(this.config.cache.enabled && this.cache.has(cacheKey) {
                this.stats.cacheHits++;
            }
                return this.cache.get(cacheKey);
            
            this.stats.cacheMisses++;
            
            // メッセージテンプレートの取得
            const template = this.getMessageTemplate(messageKey, lang);
            if (!template) { return this.getFallbackMessage(messageKey, params); }
            
            // パラメータの置換
            const message = this.interpolateMessage(template, params, lang);
            
            // キャッシュに保存
            if(this.config.cache.enabled) {
                this.cache.set(cacheKey, message);
            }
                this.cleanupCache(); }
            }
            
            return message;

        } catch (error) { this.stats.errors++;' }'

            this.handleError('GET_MESSAGE_FAILED', error, { messageKey, language, params };)
            return this.getFallbackMessage(messageKey, params);
    
    /**
     * UIテキストの取得
     */
    getUIText(category, key, language = null) {
        try {
    }
            const lang = language || this.state.currentLanguage; }
            const cacheKey = `ui-${category}-${key}-${lang}`;
            
            // キャッシュチェック
            if(this.config.cache.enabled && this.cache.has(cacheKey) {
                this.stats.cacheHits++;
            }
                return this.cache.get(cacheKey);
            
            this.stats.cacheMisses++;
            
            // UIテキストの取得
            const categoryTexts = this.uiTexts[category];
            if (!categoryTexts) { return this.getFallbackUIText(category, key); }
            
            const keyTexts = categoryTexts[key];
            if (!keyTexts) { return this.getFallbackUIText(category, key); }
            
            const text = keyTexts[lang] || keyTexts[this.config.fallback.language] || key;
            
            // キャッシュに保存
            if(this.config.cache.enabled) {
                this.cache.set(cacheKey, text);
            }
                this.cleanupCache(); }
            }
            
            return text;

        } catch (error) { this.stats.errors++;' }'

            this.handleError('GET_UI_TEXT_FAILED', error, { category, key, language };)
            return this.getFallbackUIText(category, key);
    
    /**
     * 地域別プラットフォーム設定の取得
     */
    getRegionalPlatforms(language = null) {
        const lang = language || this.state.currentLanguage;
        const regionalSetting = this.config.regionalSettings[lang];

        if(regionalSetting && regionalSetting.platforms) {
    }
            return regionalSetting.platforms;
        
        // フォールバック
        return this.config.regionalSettings[this.config.fallback.language]? .platforms || '';
               ['twitter', 'facebook', 'copy'];
    }
    
    /**
     * 地域別ソーシャルホストの取得
     */
    getSocialHost(platform, language = null) {
        const lang = language || this.state.currentLanguage;
        const regionalSetting = this.config.regionalSettings[lang];

        if(regionalSetting && regionalSetting.socialHosts && regionalSetting.socialHosts[platform]) {
    }
            return regionalSetting.socialHosts[platform];
        
        // デフォルトホスト
        const defaultHosts = { : undefined''
            twitter: 'twitter.com',
            facebook: 'facebook.com',
            line: 'line.me',
            weibo: 'weibo.com',
            wechat: 'weixin.qq.com' ,};
        return defaultHosts[platform] || platform;
    }
    
    /**
     * RTL言語判定
     */
    isRTL(language = null) {
        const lang = language || this.state.currentLanguage;
        const regionalSetting = this.config.regionalSettings[lang];
    }
        return regionalSetting ? regionalSetting.rtl: false, 
    }
    
    /**
     * 数値フォーマット
     */
    formatNumber(number, language = null) {
        const lang = language || this.state.currentLanguage;
        const formatter = this.formatters.number(lang);
    }
        return formatter.format(number);
    
    /**
     * 日付フォーマット
     */
    formatDate(date, language = null) {
        const lang = language || this.state.currentLanguage;
        const formatter = this.formatters.date(lang);
    }
        return formatter.format(date);
    
    /**
     * 通貨フォーマット
     */
    formatCurrency(amount, language = null) {
        const lang = language || this.state.currentLanguage;
        const formatter = this.formatters.currency(lang);
    }
        return formatter.format(amount);
    
    /**
     * メッセージテンプレートの取得
     */
    getMessageTemplate(messageKey, language) {
        const templates = this.messageTemplates[messageKey];
        if (!templates) return null;
        
    }
        return templates[language] || templates[this.config.fallback.language] || null;
    
    /**
     * メッセージの補間処理
     */
    interpolateMessage(template, params, language) {
        let message = template;
        
        // パラメータ置換
        Object.keys(params).forEach(key => { 
            const, value = params[key];
            let, formattedValue = value;)
            ')';
            // 型に応じてフォーマット');''
            if (typeof, value === 'number'') {'
    }

                if (key.includes('score'') || key.includes('point'') || key.includes('rank) { }
                    formattedValue = this.formatNumber(value, language); }
} else if (value, instanceof Date) { formattedValue = this.formatDate(value, language); }

            message = message.replace(new, RegExp(`\\{${key}\\)`, 'g'), formattedValue);
        };
        
        return message;
    }
    
    /**
     * フォールバックメッセージの取得'
     */''
    getFallbackMessage(messageKey, params) {'
        // LocalizationManagerにフォールバック
        if(this.localizationManager && typeof, this.localizationManager.get === 'function) {'
    }
            try { }
                return this.localizationManager.get(`social.${messageKey}`, params);
            } catch (error) { // 無視 }
        }
        
        // 最終フォールバック
        return `[${messageKey}]`;
    }
    
    /**
     * フォールバックUIテキストの取得
     */''
    getFallbackUIText(category, key) {'
        // LocalizationManagerにフォールバック
        if(this.localizationManager && typeof, this.localizationManager.get === 'function) {'
    }
            try { }
                return this.localizationManager.get(`social.ui.${category}.${key}`);
            } catch (error) { // 無視 }
        }
        
        // 最終フォールバック
        return key;
    }
    
    /**
     * 数値フォーマッターの作成
     */
    createNumberFormatter(language) {
        try {
    }
            return new Intl.NumberFormat(language); catch (error) { return new Intl.NumberFormat(this.config.fallback.language);
    
    /**
     * 日付フォーマッターの作成
     */''
    createDateFormatter(language) { try {
            return new Intl.DateTimeFormat(language, {''
                year: 'numeric',)';
                month: '2-digit',' }

                day: '2-digit'); }
            } catch (error) { return new Intl.DateTimeFormat(this.config.fallback.language);
    
    /**
     * 通貨フォーマッターの作成'
     */''
    createCurrencyFormatter(language) { '
        const regionalSetting = this.config.regionalSettings[language];''
        const currency = regionalSetting ? regionalSetting.currency: 'USD',
        
        try {
            return new Intl.NumberFormat(language, {)'
                style: 'currency', 
                currency: currency);' ,}'

        } catch (error) { return new Intl.NumberFormat(this.config.fallback.language, {)'
                style: 'currency',')';
                currency: 'USD' ,}
    }
    
    /**
     * 言語変更の処理
     */
    handleLanguageChange(newLanguage, oldLanguage) {
        this.state.currentLanguage = newLanguage;
        this.stats.languageChanges++;
        
        // キャッシュをクリア
        if (this.config.cache.enabled) {''
            this.cache.clear();
    }

        this.log('言語変更', { from: oldLanguage, to: newLanguage ,}
    
    /**
     * キャッシュのクリーンアップ
     */
    cleanupCache() {
        if (this.cache.size > this.config.cache.maxSize) {
            // 古いエントリから削除（簡易LRU）
            const entries = Array.from(this.cache.entries();
            const deleteCount = Math.floor(this.config.cache.maxSize * 0.2);
            
            for (let, i = 0; i < deleteCount; i++) {
    }
                this.cache.delete(entries[i][0]); }
}
    }
    
    /**
     * サポート言語の確認
     */
    isLanguageSupported(language) { return this.config.supportedLanguages.includes(language); }
    
    /**
     * サポート言語の一覧取得
     */
    getSupportedLanguages() { return [...this.config.supportedLanguages];
    
    /**
     * 地域設定の取得
     */
    getRegionalSettings(language = null) {
        const lang = language || this.state.currentLanguage;
    }
        return this.config.regionalSettings[lang] || this.config.regionalSettings[this.config.fallback.language];
    
    /**
     * 統計情報の取得
     */
    getStats() {
        return { ...this.stats,
            cacheSize: this.cache.size;
           , cacheHitRate: this.stats.translationRequests > 0 '';
                ? (this.stats.cacheHits / this.stats.translationRequests * 100).toFixed(2) + '%''';
                : '0%',
            supportedLanguages: this.config.supportedLanguages.length;
    ,}
            currentLanguage: this.state.currentLanguage, };
            loadedLanguages: Array.from(this.state.loadedLanguages); }
        }
    
    /**
     * 設定の更新
     */
    updateConfig(newConfig) {
        
    }
        this.config = { ...this.config, ...newConfig;
        
        // キャッシュクリア
        if(this.config.cache.enabled) {

            this.cache.clear();
        }

        this.log('設定更新', newConfig); }
    }
    
    /**
     * キャッシュのクリア
     */
    clearCache() {'

        this.cache.clear();
    }

        this.log('キャッシュクリア); }'
    }
    
    /**
     * エラーハンドリング
     */
    handleError(type, error, context = { ) {
        const errorInfo = {
            type,
            error: error.message || error;
            context,
    }
            timestamp: Date.now(); }
        };

        if(ErrorHandler) {', ';

        }

            ErrorHandler.handleError(error, 'SocialI18nManager', context); }
        }

        this.log('エラー発生', errorInfo, 'error'');
    }
    
    /**
     * ログ記録'
     */''
    log(message, data = null, level = 'info) {'
        const logEntry = {''
            timestamp: Date.now(''';
        const, consoleMethod = level === 'error' ? 'error' : ';

    })'
                            level === 'warn' ? 'warn' : 'log';') }

        console[consoleMethod](`[SocialI18nManager] ${message}`, data || ''');
    }

}''
