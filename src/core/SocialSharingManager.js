/**
 * ソーシャル機能の統合管理システム
 * スコア共有、実績共有、リーダーボード、チャレンジシステムの中央制御を行う
 */

import { ErrorHandler } from '../utils/ErrorHandler.js';
import { ShareContentGenerator } from './ShareContentGenerator.js';

export class SocialSharingManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.statisticsManager = null;
        this.achievementManager = null;
        this.localizationManager = null;
        
        // コンポーネント参照（後で初期化）
        this.shareContentGenerator = null;
        this.screenshotCapture = null;
        this.leaderboardManager = null;
        this.challengeSystem = null;
        
        // 設定
        this.settings = {
            enabled: true,
            autoPrompt: true,
            shareOnHighScore: true,
            shareOnAchievement: true,
            defaultPlatform: 'web-share'
        };
        
        // パフォーマンス監視
        this.performanceStats = {
            shareRequests: 0,
            successfulShares: 0,
            failedShares: 0,
            averageResponseTime: 0
        };
        
        // エラーハンドリング
        this.errorTypes = {
            WEB_SHARE_NOT_SUPPORTED: 'WEB_SHARE_NOT_SUPPORTED',
            SCREENSHOT_FAILED: 'SCREENSHOT_FAILED',
            STORAGE_FULL: 'STORAGE_FULL',
            NETWORK_ERROR: 'NETWORK_ERROR',
            PERMISSION_DENIED: 'PERMISSION_DENIED',
            INVALID_DATA: 'INVALID_DATA'
        };
        
        this.initialize();
    }
    
    /**
     * システムの初期化
     */
    async initialize() {
        try {
            this.log('SocialSharingManager: 初期化開始');
            
            // 既存システムとの連携設定
            await this.setupSystemIntegration();
            
            // 設定の読み込み
            await this.loadSettings();
            
            // イベントリスナーの設定
            this.setupEventListeners();
            
            this.log('SocialSharingManager: 初期化完了');
            
        } catch (error) {
            this.handleError('INITIALIZATION_FAILED', error, {
                context: 'SocialSharingManager.initialize'
            });
        }
    }
    
    /**
     * 既存システムとの連携設定
     */
    async setupSystemIntegration() {
        if (this.gameEngine) {
            // StatisticsManagerとの連携
            this.statisticsManager = this.gameEngine.statisticsManager;
            
            // AchievementManagerとの連携
            this.achievementManager = this.gameEngine.achievementManager;
            
            // LocalizationManagerとの連携
            this.localizationManager = this.gameEngine.localizationManager;
            
            // ShareContentGeneratorの初期化
            const { ShareContentGenerator } = await import('./ShareContentGenerator.js');
            this.shareContentGenerator = new ShareContentGenerator(this.localizationManager);
            
            // ScreenshotCaptureの初期化 (Task 5)
            const { ScreenshotCapture } = await import('./ScreenshotCapture.js');
            this.screenshotCapture = new ScreenshotCapture(this.gameEngine);
            
            // GameEngineイベントリスナー設定
            this.gameEngine.on('gameEnd', this.onGameEnd.bind(this));
            this.gameEngine.on('highScore', this.onHighScore.bind(this));
            this.gameEngine.on('achievementUnlocked', this.onAchievementUnlocked.bind(this));
        }
        
        this.log('システム連携設定完了', {
            statisticsManager: !!this.statisticsManager,
            achievementManager: !!this.achievementManager,
            localizationManager: !!this.localizationManager,
            shareContentGenerator: !!this.shareContentGenerator,
            screenshotCapture: !!this.screenshotCapture
        });
    }
    
    /**
     * 設定の読み込み
     */
    async loadSettings() {
        try {
            const savedSettings = localStorage.getItem('socialSharingSettings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                this.settings = { ...this.settings, ...parsed };
            }
            
            this.log('設定読み込み完了', this.settings);
        } catch (error) {
            this.handleError('SETTINGS_LOAD_FAILED', error, {
                context: 'loadSettings'
            });
        }
    }
    
    /**
     * 設定の保存
     */
    async saveSettings() {
        try {
            localStorage.setItem('socialSharingSettings', JSON.stringify(this.settings));
            this.log('設定保存完了');
        } catch (error) {
            this.handleError('SETTINGS_SAVE_FAILED', error, {
                context: 'saveSettings'
            });
        }
    }
    
    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // ウィンドウの閉じる前イベント（未保存データの確認）
        window.addEventListener('beforeunload', this.onBeforeUnload.bind(this));
        
        // オンライン/オフライン状態の監視
        window.addEventListener('online', this.onOnlineStatusChange.bind(this));
        window.addEventListener('offline', this.onOnlineStatusChange.bind(this));
    }
    
    /**
     * ゲーム終了時の処理
     */
    async onGameEnd(gameData) {
        if (!this.settings.enabled || !gameData) return;
        
        try {
            // ハイスコア達成時の自動共有プロンプト
            if (this.settings.shareOnHighScore && gameData.isHighScore) {
                await this.promptShareScore(gameData);
            }
            
            // 統計データの更新
            if (this.statisticsManager) {
                this.statisticsManager.recordSocialEvent('gameEnd', {
                    score: gameData.score,
                    wasShared: false // 実際の共有後に更新
                });
            }
            
        } catch (error) {
            this.handleError('GAME_END_PROCESSING_FAILED', error, {
                context: 'onGameEnd',
                gameData
            });
        }
    }
    
    /**
     * ハイスコア達成時の処理
     */
    async onHighScore(scoreData) {
        if (!this.settings.enabled || !this.settings.shareOnHighScore) return;
        
        try {
            await this.promptShareScore(scoreData);
        } catch (error) {
            this.handleError('HIGH_SCORE_SHARE_FAILED', error, {
                context: 'onHighScore',
                scoreData
            });
        }
    }
    
    /**
     * 実績解除時の処理
     */
    async onAchievementUnlocked(achievementData) {
        if (!this.settings.enabled || !this.settings.shareOnAchievement) return;
        
        try {
            await this.promptShareAchievement(achievementData);
        } catch (error) {
            this.handleError('ACHIEVEMENT_SHARE_FAILED', error, {
                context: 'onAchievementUnlocked',
                achievementData
            });
        }
    }
    
    /**
     * スコア共有プロンプトの表示
     */
    async promptShareScore(scoreData, options = {}) {
        try {
            this.log('スコア共有プロンプト表示', scoreData);
            
            // 共有データの構築
            const shareData = {
                type: 'score',
                title: `BubblePop - ${scoreData.score.toLocaleString()}点達成！`,
                text: '', // generateOptimizedMessageで最適化される
                url: options.url || this.getShareUrl(scoreData),
                score: scoreData.score,
                stage: scoreData.stage,
                combo: scoreData.combo,
                accuracy: scoreData.accuracy,
                isHighScore: scoreData.isHighScore || false,
                timestamp: Date.now()
            };
            
            // カスタムオプションの追加
            if (options.customHashtags) {
                shareData.customHashtags = options.customHashtags;
            }
            
            if (options.mentions) {
                shareData.mentions = options.mentions;
            }
            
            if (options.via) {
                shareData.via = options.via;
            }
            
            // プラットフォーム固有の共有実行
            const shareResult = await this.share(shareData, options);
            
            // 統計の更新
            if (this.gameEngine.statisticsManager) {
                this.gameEngine.statisticsManager.recordSocialEvent('scoreSharePrompted', {
                    score: scoreData.score,
                    platform: shareResult.platform || 'unknown',
                    shareResult: shareResult.success,
                    shareMethod: shareResult.method,
                    optimized: shareResult.optimized || false
                });
            }
            
            // 成功時の結果データ
            const resultData = {
                type: 'score',
                content: {
                    score: scoreData.score,
                    stage: scoreData.stage,
                    message: shareData.text || shareData.title,
                    timestamp: shareData.timestamp
                },
                metadata: {
                    gameVersion: '1.0.0',
                    platform: shareResult.platform || this.detectPlatform(),
                    language: shareResult.language || 'ja',
                    shareResult,
                    optimized: shareResult.optimized || false,
                    responseTime: shareResult.responseTime
                }
            };
            
            this.log('スコア共有完了', { 
                success: shareResult.success, 
                method: shareResult.method,
                optimized: shareResult.optimized
            });
            
            return resultData;
            
        } catch (error) {
            this.handleError('SCORE_SHARE_PROMPT_FAILED', error, { scoreData, options });
            
            // フォールバック: 基本的な共有データ
            return {
                type: 'score',
                content: {
                    score: scoreData.score,
                    stage: scoreData.stage,
                    message: `BubblePopで${scoreData.score.toLocaleString()}点を達成！`,
                    timestamp: Date.now()
                },
                metadata: {
                    gameVersion: '1.0.0',
                    platform: this.detectPlatform(),
                    isFallback: true,
                    error: error.message
                }
            };
        }
    }
    
    /**
     * 実績共有プロンプトの表示
     */
    async promptShareAchievement(achievementData, options = {}) {
        try {
            this.log('実績共有プロンプト表示', achievementData);
            
            // 共有データの構築
            const shareData = {
                type: 'achievement',
                title: `BubblePop - 実績「${achievementData.name}」解除！`,
                text: '', // generateOptimizedMessageで最適化される
                url: options.url || this.getShareUrl(achievementData),
                name: achievementData.name,
                description: achievementData.description,
                id: achievementData.id,
                rarity: achievementData.rarity,
                timestamp: Date.now()
            };
            
            // カスタムオプションの追加
            if (options.customHashtags) {
                shareData.customHashtags = options.customHashtags;
            }
            
            if (options.mentions) {
                shareData.mentions = options.mentions;
            }
            
            if (options.via) {
                shareData.via = options.via;
            }
            
            // レア実績の場合は特別なハッシュタグを追加
            if (achievementData.rarity === 'legendary') {
                shareData.customHashtags = shareData.customHashtags || [];
                shareData.customHashtags.push('Legendary', 'Rare');
            }
            
            // プラットフォーム固有の共有実行
            const shareResult = await this.share(shareData, options);
            
            // 統計の更新
            if (this.gameEngine.statisticsManager) {
                this.gameEngine.statisticsManager.recordSocialEvent('achievementSharePrompted', {
                    achievementId: achievementData.id,
                    platform: shareResult.platform || 'unknown',
                    isRare: achievementData.rarity === 'legendary',
                    shareResult: shareResult.success,
                    shareMethod: shareResult.method,
                    optimized: shareResult.optimized || false
                });
            }
            
            // 成功時の結果データ
            const resultData = {
                type: 'achievement',
                content: {
                    achievement: achievementData,
                    message: shareData.text || shareData.title,
                    timestamp: shareData.timestamp
                },
                metadata: {
                    gameVersion: '1.0.0',
                    platform: shareResult.platform || this.detectPlatform(),
                    language: shareResult.language || 'ja',
                    isRare: achievementData.rarity === 'legendary',
                    shareResult,
                    optimized: shareResult.optimized || false,
                    responseTime: shareResult.responseTime
                }
            };
            
            this.log('実績共有完了', { 
                success: shareResult.success, 
                method: shareResult.method,
                isRare: achievementData.rarity === 'legendary',
                optimized: shareResult.optimized
            });
            
            return resultData;
            
        } catch (error) {
            this.handleError('ACHIEVEMENT_SHARE_PROMPT_FAILED', error, { achievementData, options });
            
            // フォールバック: 基本的な共有データ
            return {
                type: 'achievement',
                content: {
                    achievement: achievementData,
                    message: `実績「${achievementData.name || '新しい実績'}」を解除しました！`,
                    timestamp: Date.now()
                },
                metadata: {
                    gameVersion: '1.0.0',
                    platform: this.detectPlatform(),
                    isFallback: true,
                    error: error.message
                }
            };
        }
    }
    
    /**
     * 共有用URLの生成
     */
    getShareUrl(data) {
        const baseUrl = window.location.origin + window.location.pathname;
        const params = new URLSearchParams();
        
        // データタイプに応じたパラメータ追加
        if (data.score) {
            params.append('score', data.score);
        }
        if (data.stage) {
            params.append('stage', data.stage);
        }
        if (data.id) {
            params.append('achievement', data.id);
        }
        
        // UTMパラメータの追加
        params.append('utm_source', 'social_share');
        params.append('utm_medium', 'social');
        params.append('utm_campaign', 'game_share');
        
        return `${baseUrl}?${params.toString()}`;
    }
    
    /**
     * プラットフォーム検出
     */
    detectPlatform() {
        // Web Share API の優先度が最も高い
        if (this.isWebShareSupported()) {
            return 'web-share';
        }
        
        // User Agentベースのプラットフォーム検出
        const userAgent = navigator.userAgent.toLowerCase();
        
        // Twitter/X アプリ内ブラウザの検出
        if (userAgent.includes('twitter') || userAgent.includes('twitterandroid')) {
            return 'twitter';
        }
        
        // Facebook アプリ内ブラウザの検出
        if (userAgent.includes('fban') || userAgent.includes('fbav') || userAgent.includes('facebook')) {
            return 'facebook';
        }
        
        // モバイルデバイスの検出
        const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        
        // URL パラメータベースの検出
        const urlParams = new URLSearchParams(window.location.search);
        const platformParam = urlParams.get('share_platform') || urlParams.get('utm_source');
        
        if (platformParam) {
            switch (platformParam.toLowerCase()) {
                case 'twitter':
                case 'x':
                    return 'twitter';
                case 'facebook':
                case 'fb':
                    return 'facebook';
            }
        }
        
        // Referrerベースの検出
        if (document.referrer) {
            const referrer = document.referrer.toLowerCase();
            if (referrer.includes('twitter.com') || referrer.includes('t.co')) {
                return 'twitter';
            }
            if (referrer.includes('facebook.com') || referrer.includes('fb.com')) {
                return 'facebook';
            }
        }
        
        // デフォルト（モバイルの場合はgeneric、デスクトップの場合もgeneric）
        return 'generic';
    }
    
    /**
     * Web Share API対応状況の検出
     */
    isWebShareSupported() {
        return (
            'share' in navigator &&
            'canShare' in navigator &&
            navigator.share &&
            typeof navigator.share === 'function'
        );
    }
    
    /**
     * 共有データの検証
     */
    validateShareData(shareData) {
        // 基本的な必須フィールドのチェック
        if (!shareData || typeof shareData !== 'object') {
            return { valid: false, errors: ['共有データが不正です'] };
        }
        
        const errors = [];
        
        // title, text, url のいずれかが必要
        if (!shareData.title && !shareData.text && !shareData.url) {
            errors.push('title、text、urlのいずれかが必要です');
        }
        
        // 各フィールドの型チェック
        if (shareData.title && typeof shareData.title !== 'string') {
            errors.push('タイトルは文字列である必要があります');
        }
        
        if (shareData.text && typeof shareData.text !== 'string') {
            errors.push('テキストは文字列である必要があります');
        }
        
        if (shareData.url && typeof shareData.url !== 'string') {
            errors.push('URLは文字列である必要があります');
        }
        
        // URL形式の検証
        if (shareData.url) {
            try {
                new URL(shareData.url);
            } catch (error) {
                errors.push('無効なURL形式です');
            }
        }
        
        // 文字数制限のチェック
        if (shareData.title && shareData.title.length > 200) {
            errors.push('タイトルが長すぎます（200文字以下）');
        }
        
        if (shareData.text && shareData.text.length > 2000) {
            errors.push('テキストが長すぎます（2000文字以下）');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    /**
     * 共有データのサニタイゼーション
     */
    sanitizeShareData(shareData) {
        const sanitized = {};
        
        if (shareData.title) {
            sanitized.title = this.sanitizeText(shareData.title);
        }
        
        if (shareData.text) {
            sanitized.text = this.sanitizeText(shareData.text);
        }
        
        if (shareData.url) {
            sanitized.url = this.sanitizeUrl(shareData.url);
        }
        
        return sanitized;
    }
    
    /**
     * テキストのサニタイゼーション
     */
    sanitizeText(text) {
        if (typeof text !== 'string') return '';
        
        // HTMLタグの除去
        let sanitized = text.replace(/<[^>]*>/g, '');
        
        // 危険なスクリプト文字列の除去
        sanitized = sanitized.replace(/javascript:/gi, '');
        sanitized = sanitized.replace(/on\w+\s*=/gi, '');
        
        // 制御文字の除去（改行とタブは保持）
        sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
        
        // 連続する空白の正規化
        sanitized = sanitized.replace(/\s+/g, ' ').trim();
        
        return sanitized;
    }
    
    /**
     * URLのサニタイゼーション
     */
    sanitizeUrl(url) {
        if (typeof url !== 'string') return '';
        
        try {
            const urlObj = new URL(url);
            
            // プロトコルの制限
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                throw new Error('無効なプロトコル');
            }
            
            return urlObj.toString();
        } catch (error) {
            this.log(`URL sanitization failed: ${error.message}`, { url }, 'warn');
            return '';
        }
    }
    
    /**
     * Web Share APIを使用した共有
     */
    async shareViaWebAPI(shareData) {
        try {
            if (!this.isWebShareSupported()) {
                throw new Error('Web Share APIがサポートされていません');
            }
            
            // データの検証
            const validation = this.validateShareData(shareData);
            if (!validation.valid) {
                throw new Error(`データ検証エラー: ${validation.errors.join(', ')}`);
            }
            
            // データのサニタイゼーション
            const sanitizedData = this.sanitizeShareData(shareData);
            
            // canShareでサポート確認（利用可能な場合）
            if (navigator.canShare && !navigator.canShare(sanitizedData)) {
                throw new Error('このデータは共有できません');
            }
            
            // パフォーマンス計測開始
            const startTime = performance.now();
            
            // Web Share API実行
            await navigator.share(sanitizedData);
            
            // 成功統計の更新
            this.performanceStats.shareRequests++;
            this.performanceStats.successfulShares++;
            this.performanceStats.averageResponseTime = 
                (this.performanceStats.averageResponseTime + (performance.now() - startTime)) / 2;
            
            // 統計イベントの記録
            if (this.statisticsManager) {
                this.statisticsManager.recordSocialEvent('webShareSuccess', {
                    dataType: shareData.type || 'unknown',
                    hasTitle: !!sanitizedData.title,
                    hasText: !!sanitizedData.text,
                    hasUrl: !!sanitizedData.url,
                    responseTime: performance.now() - startTime
                });
            }
            
            this.log('Web Share API共有成功', {
                title: sanitizedData.title?.substring(0, 50),
                hasUrl: !!sanitizedData.url,
                responseTime: performance.now() - startTime
            });
            
            return {
                success: true,
                method: 'web-share-api',
                data: sanitizedData
            };
            
        } catch (error) {
            this.performanceStats.shareRequests++;
            this.performanceStats.failedShares++;
            
            // ユーザーがキャンセルした場合（AbortError）は通常のエラーとして扱わない
            if (error.name === 'AbortError') {
                this.log('Web Share APIがユーザーによってキャンセルされました');
                
                if (this.statisticsManager) {
                    this.statisticsManager.recordSocialEvent('webShareCancelled', {
                        dataType: shareData.type || 'unknown'
                    });
                }
                
                return {
                    success: false,
                    method: 'web-share-api',
                    error: 'user_cancelled',
                    message: 'ユーザーによってキャンセルされました'
                };
            }
            
            // その他のエラー
            this.handleError('WEB_SHARE_FAILED', error, { shareData });
            
            if (this.statisticsManager) {
                this.statisticsManager.recordSocialEvent('webShareError', {
                    dataType: shareData.type || 'unknown',
                    errorType: error.name || 'unknown',
                    errorMessage: error.message
                });
            }
            
            return {
                success: false,
                method: 'web-share-api',
                error: error.name || 'unknown',
                message: error.message
            };
        }
    }
    
    /**
     * フォールバック共有ダイアログの表示
     */
    async showFallbackShareDialog(shareData) {
        try {
            this.log('フォールバック共有ダイアログ表示開始', { shareData });
            
            // データの検証とサニタイゼーション
            const validation = this.validateShareData(shareData);
            if (!validation.valid) {
                throw new Error(`データ検証エラー: ${validation.errors.join(', ')}`);
            }
            
            const sanitizedData = this.sanitizeShareData(shareData);
            
            // ダイアログHTMLの生成
            const dialogHTML = this.generateShareDialogHTML(sanitizedData);
            
            // ダイアログの作成と表示
            const dialogResult = await this.displayShareDialog(dialogHTML, sanitizedData);
            
            // 統計の記録
            if (this.statisticsManager) {
                this.statisticsManager.recordSocialEvent('fallbackDialogShown', {
                    dataType: shareData.type || 'unknown',
                    hasTitle: !!sanitizedData.title,
                    hasText: !!sanitizedData.text,
                    hasUrl: !!sanitizedData.url
                });
            }
            
            return dialogResult;
            
        } catch (error) {
            this.handleError('FALLBACK_DIALOG_FAILED', error, { shareData });
            return {
                success: false,
                method: 'fallback-dialog',
                error: error.message
            };
        }
    }
    
    /**
     * 共有ダイアログHTMLの生成
     */
    generateShareDialogHTML(shareData) {
        const escapedTitle = this.escapeHtml(shareData.title || '');
        const escapedText = this.escapeHtml(shareData.text || '');
        const escapedUrl = this.escapeHtml(shareData.url || '');
        
        // 現在の言語を取得
        const language = this.localizationManager?.getCurrentLanguage() || 'ja';
        
        // 多言語対応のラベル
        const labels = {
            ja: {
                title: 'シェア',
                shareVia: '共有方法を選択してください',
                copyLink: 'リンクをコピー',
                twitter: 'Twitterで共有',
                facebook: 'Facebookで共有',
                close: '閉じる',
                copied: 'コピーしました！'
            },
            en: {
                title: 'Share',
                shareVia: 'Choose how to share',
                copyLink: 'Copy Link',
                twitter: 'Share on Twitter',
                facebook: 'Share on Facebook',
                close: 'Close',
                copied: 'Copied!'
            },
            'zh-CN': {
                title: '分享',
                shareVia: '选择分享方式',
                copyLink: '复制链接',
                twitter: '在Twitter上分享',
                facebook: '在Facebook上分享',
                close: '关闭',
                copied: '已复制！'
            },
            'zh-TW': {
                title: '分享',
                shareVia: '選擇分享方式',
                copyLink: '複製連結',
                twitter: '在Twitter上分享',
                facebook: '在Facebook上分享',
                close: '關閉',
                copied: '已複製！'
            },
            ko: {
                title: '공유',
                shareVia: '공유 방법 선택',
                copyLink: '링크 복사',
                twitter: 'Twitter에서 공유',
                facebook: 'Facebook에서 공유',
                close: '닫기',
                copied: '복사됨!'
            }
        };
        
        const l = labels[language] || labels.ja;
        
        return `
            <div id="social-share-dialog" class="social-share-dialog" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Helvetica Neue', Arial, sans-serif;
            ">
                <div class="dialog-content" style="
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    max-width: 400px;
                    width: 90%;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    animation: slideIn 0.3s ease-out;
                ">
                    <h2 style="
                        margin: 0 0 16px 0;
                        font-size: 20px;
                        font-weight: 600;
                        color: #333;
                        text-align: center;
                    ">${l.title}</h2>
                    
                    ${shareData.title ? `
                        <div style="margin-bottom: 12px;">
                            <strong style="color: #555;">${escapedTitle}</strong>
                        </div>
                    ` : ''}
                    
                    ${shareData.text ? `
                        <div style="
                            margin-bottom: 16px;
                            color: #666;
                            font-size: 14px;
                            line-height: 1.4;
                        ">${escapedText}</div>
                    ` : ''}
                    
                    <p style="
                        margin: 0 0 16px 0;
                        color: #777;
                        font-size: 14px;
                        text-align: center;
                    ">${l.shareVia}</p>
                    
                    <div class="share-buttons" style="
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        margin-bottom: 16px;
                    ">
                        ${shareData.url ? `
                            <button id="copy-link-btn" class="share-btn" style="
                                background: #007AFF;
                                color: white;
                                border: none;
                                padding: 12px 16px;
                                border-radius: 8px;
                                font-size: 14px;
                                font-weight: 500;
                                cursor: pointer;
                                transition: background-color 0.2s;
                            ">${l.copyLink}</button>
                        ` : ''}
                        
                        <button id="twitter-share-btn" class="share-btn" style="
                            background: #1DA1F2;
                            color: white;
                            border: none;
                            padding: 12px 16px;
                            border-radius: 8px;
                            font-size: 14px;
                            font-weight: 500;
                            cursor: pointer;
                            transition: background-color 0.2s;
                        ">${l.twitter}</button>
                        
                        <button id="facebook-share-btn" class="share-btn" style="
                            background: #1877F2;
                            color: white;
                            border: none;
                            padding: 12px 16px;
                            border-radius: 8px;
                            font-size: 14px;
                            font-weight: 500;
                            cursor: pointer;
                            transition: background-color 0.2s;
                        ">${l.facebook}</button>
                    </div>
                    
                    <button id="close-dialog-btn" style="
                        background: #f0f0f0;
                        color: #666;
                        border: none;
                        padding: 10px 16px;
                        border-radius: 8px;
                        font-size: 14px;
                        cursor: pointer;
                        width: 100%;
                        transition: background-color 0.2s;
                    ">${l.close}</button>
                </div>
            </div>
            
            <style>
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                
                .share-btn:hover {
                    filter: brightness(1.1);
                }
                
                #close-dialog-btn:hover {
                    background: #e0e0e0;
                }
            </style>
        `;
    }
    
    /**
     * 共有ダイアログの表示と操作
     */
    async displayShareDialog(dialogHTML, shareData) {
        return new Promise((resolve) => {
            // ダイアログをDOMに追加
            const dialogContainer = document.createElement('div');
            dialogContainer.innerHTML = dialogHTML;
            document.body.appendChild(dialogContainer);
            
            const dialog = document.getElementById('social-share-dialog');
            
            // イベントリスナーの設定
            const cleanup = () => {
                document.body.removeChild(dialogContainer);
            };
            
            // リンクコピーボタン
            const copyLinkBtn = document.getElementById('copy-link-btn');
            if (copyLinkBtn && shareData.url) {
                copyLinkBtn.addEventListener('click', async () => {
                    try {
                        await navigator.clipboard.writeText(shareData.url);
                        copyLinkBtn.textContent = this.localizationManager?.translate('social.copied') || 'コピーしました！';
                        copyLinkBtn.style.background = '#4CAF50';
                        
                        setTimeout(() => {
                            cleanup();
                            resolve({
                                success: true,
                                method: 'copy-link',
                                action: 'copied'
                            });
                        }, 1000);
                        
                    } catch (error) {
                        // フォールバック: 旧式のコピー方法
                        const textArea = document.createElement('textarea');
                        textArea.value = shareData.url;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        
                        copyLinkBtn.textContent = this.localizationManager?.translate('social.copied') || 'コピーしました！';
                        copyLinkBtn.style.background = '#4CAF50';
                        
                        setTimeout(() => {
                            cleanup();
                            resolve({
                                success: true,
                                method: 'copy-link-fallback',
                                action: 'copied'
                            });
                        }, 1000);
                    }
                });
            }
            
            // Twitterシェアボタン
            const twitterBtn = document.getElementById('twitter-share-btn');
            if (twitterBtn) {
                twitterBtn.addEventListener('click', () => {
                    const twitterUrl = this.generateTwitterShareUrl(shareData);
                    window.open(twitterUrl, '_blank', 'width=600,height=400');
                    cleanup();
                    resolve({
                        success: true,
                        method: 'twitter-web',
                        action: 'opened'
                    });
                });
            }
            
            // Facebookシェアボタン
            const facebookBtn = document.getElementById('facebook-share-btn');
            if (facebookBtn) {
                facebookBtn.addEventListener('click', () => {
                    const facebookUrl = this.generateFacebookShareUrl(shareData);
                    window.open(facebookUrl, '_blank', 'width=600,height=400');
                    cleanup();
                    resolve({
                        success: true,
                        method: 'facebook-web',
                        action: 'opened'
                    });
                });
            }
            
            // 閉じるボタン
            const closeBtn = document.getElementById('close-dialog-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    cleanup();
                    resolve({
                        success: false,
                        method: 'fallback-dialog',
                        action: 'closed'
                    });
                });
            }
            
            // 背景クリックで閉じる
            dialog.addEventListener('click', (event) => {
                if (event.target === dialog) {
                    cleanup();
                    resolve({
                        success: false,
                        method: 'fallback-dialog',
                        action: 'dismissed'
                    });
                }
            });
            
            // ESCキーで閉じる
            const handleEscape = (event) => {
                if (event.key === 'Escape') {
                    document.removeEventListener('keydown', handleEscape);
                    cleanup();
                    resolve({
                        success: false,
                        method: 'fallback-dialog',
                        action: 'escaped'
                    });
                }
            };
            document.addEventListener('keydown', handleEscape);
        });
    }
    
    /**
     * TwitterシェアURL生成
     */
    generateTwitterShareUrl(shareData) {
        try {
            const params = new URLSearchParams();
            
            // テキストの構築（文字数制限対応）
            let text = shareData.text || shareData.title || '';
            
            // ハッシュタグの追加
            const hashtags = this.generateTwitterHashtags(shareData);
            if (hashtags.length > 0) {
                text += ' ' + hashtags.join(' ');
            }
            
            // メンションの追加（あれば）
            if (shareData.mentions && Array.isArray(shareData.mentions)) {
                const mentions = shareData.mentions
                    .filter(mention => mention && typeof mention === 'string')
                    .map(mention => mention.startsWith('@') ? mention : `@${mention}`)
                    .slice(0, 2); // 最大2つのメンション
                
                if (mentions.length > 0) {
                    text += ' ' + mentions.join(' ');
                }
            }
            
            // Twitter文字数制限の適用（URL短縮考慮）
            const urlLength = shareData.url ? 23 : 0; // Twitter URL短縮の固定長
            const maxTextLength = 280 - urlLength;
            
            if (text.length > maxTextLength) {
                text = this.truncateForTwitter(text, maxTextLength);
            }
            
            // パラメータの設定
            if (text.trim()) {
                params.append('text', text.trim());
            }
            
            if (shareData.url) {
                params.append('url', shareData.url);
            }
            
            // via パラメータ（オプション）
            if (shareData.via) {
                params.append('via', shareData.via.replace('@', ''));
            }
            
            const url = `https://twitter.com/intent/tweet?${params.toString()}`;
            
            // 統計の記録
            this.updatePerformanceStats('twitterUrlGenerated');
            
            this.log('Twitter共有URL生成完了', { 
                textLength: text.length, 
                hasUrl: !!shareData.url,
                hashtagCount: hashtags.length 
            });
            
            return url;
            
        } catch (error) {
            this.handleError('TWITTER_URL_GENERATION_FAILED', error, shareData);
            
            // フォールバック: 基本的なURL
            const params = new URLSearchParams();
            if (shareData.text || shareData.title) {
                params.append('text', shareData.text || shareData.title);
            }
            if (shareData.url) {
                params.append('url', shareData.url);
            }
            
            return `https://twitter.com/intent/tweet?${params.toString()}`;
        }
    }
    
    /**
     * FacebookシェアURL生成
     */
    generateFacebookShareUrl(shareData, options = {}) {
        try {
            const params = new URLSearchParams();
            
            // 基本パラメータの設定
            if (shareData.url) {
                params.append('u', shareData.url);
            }
            
            // タイトルの設定（Facebook側では主にOGタグを使用するが、フォールバック）
            if (shareData.title) {
                params.append('t', shareData.title);
            }
            
            // quote パラメータ（Facebookの引用機能）
            if (shareData.quote || shareData.text) {
                const quote = shareData.quote || shareData.text;
                // Facebook文字数制限の適用
                const maxQuoteLength = 500; // Facebook推奨制限
                const truncatedQuote = quote.length > maxQuoteLength ? 
                    quote.substring(0, maxQuoteLength - 3) + '...' : quote;
                params.append('quote', truncatedQuote);
            }
            
            // hashtag パラメータ（単一ハッシュタグ）
            if (shareData.hashtag) {
                const hashtag = shareData.hashtag.startsWith('#') ? 
                    shareData.hashtag.substring(1) : shareData.hashtag;
                params.append('hashtag', hashtag);
            } else if (shareData.type) {
                // データタイプに基づいたデフォルトハッシュタグ
                const defaultHashtags = {
                    score: 'BubblePopScore',
                    achievement: 'BubblePopAchievement',
                    challenge: 'BubblePopChallenge'
                };
                if (defaultHashtags[shareData.type]) {
                    params.append('hashtag', defaultHashtags[shareData.type]);
                }
            }
            
            // Facebook共有モードの選択
            const shareMode = options.mode || 'sharer'; // 'sharer' or 'dialog'
            const baseUrl = shareMode === 'dialog' ? 
                'https://www.facebook.com/dialog/share' : 
                'https://www.facebook.com/sharer/sharer.php';
            
            // app_id パラメータ（Facebookアプリ登録時）
            if (options.appId) {
                params.append('app_id', options.appId);
            }
            
            const url = `${baseUrl}?${params.toString()}`;
            
            // OGタグの動的更新（SEOシステムとの連携）
            if (this.gameEngine.seoMetaManager && shareData.url === window.location.href) {
                this.updateOGTagsForFacebook(shareData);
            }
            
            // 統計の記録
            this.updatePerformanceStats('facebookUrlGenerated');
            
            this.log('Facebook共有URL生成完了', { 
                hasUrl: !!shareData.url,
                hasQuote: !!(shareData.quote || shareData.text),
                hasHashtag: !!shareData.hashtag,
                mode: shareMode
            });
            
            return url;
            
        } catch (error) {
            this.handleError('FACEBOOK_URL_GENERATION_FAILED', error, shareData);
            
            // フォールバック: 基本的なURL
            const params = new URLSearchParams();
            if (shareData.url) {
                params.append('u', shareData.url);
            }
            if (shareData.title) {
                params.append('t', shareData.title);
            }
            
            return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
        }
    }

    /**
     * Twitter用ハッシュタグの生成
     */
    generateTwitterHashtags(shareData) {
        const hashtags = [];
        
        // 基本ハッシュタグ
        hashtags.push('#BubblePop');
        
        // データタイプ別ハッシュタグ
        switch (shareData.type) {
            case 'score':
                hashtags.push('#Gaming');
                if (shareData.isHighScore) {
                    hashtags.push('#HighScore');
                }
                break;
            case 'achievement':
                hashtags.push('#Achievement');
                if (shareData.rarity === 'legendary') {
                    hashtags.push('#Legendary');
                }
                break;
            case 'challenge':
                hashtags.push('#Challenge');
                if (shareData.challengeType === 'daily') {
                    hashtags.push('#Daily');
                }
                break;
        }
        
        // 言語固有ハッシュタグ
        const language = this.gameEngine.localizationManager?.getCurrentLanguage() || 'ja';
        const languageHashtags = {
            'ja': ['#ゲーム'],
            'en': ['#Game'],
            'zh-CN': ['#游戏'],
            'zh-TW': ['#遊戲'],
            'ko': ['#게임']
        };
        
        if (languageHashtags[language]) {
            hashtags.push(...languageHashtags[language]);
        }
        
        // カスタムハッシュタグの追加
        if (shareData.customHashtags && Array.isArray(shareData.customHashtags)) {
            shareData.customHashtags.forEach(tag => {
                const formattedTag = tag.startsWith('#') ? tag : `#${tag}`;
                if (!hashtags.includes(formattedTag)) {
                    hashtags.push(formattedTag);
                }
            });
        }
        
        // Twitter制限（最大2つのハッシュタグ）に調整
        return hashtags.slice(0, 2);
    }
    
    /**
     * Twitter向けテキスト短縮
     */
    truncateForTwitter(text, maxLength) {
        if (text.length <= maxLength) {
            return text;
        }
        
        // ハッシュタグとメンションを保護しながら短縮
        const hashtagsAndMentions = text.match(/(#\w+|@\w+)/g) || [];
        const protectedLength = hashtagsAndMentions.join(' ').length;
        const availableLength = maxLength - protectedLength - 3; // "..." 分
        
        if (availableLength <= 0) {
            // 保護すべき要素が長すぎる場合、基本的な短縮
            return text.substring(0, maxLength - 3) + '...';
        }
        
        // 単語境界で短縮を試行
        const words = text.split(' ');
        let result = '';
        
        for (const word of words) {
            if ((result + ' ' + word).length <= availableLength) {
                result += (result ? ' ' : '') + word;
            } else {
                break;
            }
        }
        
        // ハッシュタグとメンションを再追加
        result += '...' + (hashtagsAndMentions.length > 0 ? ' ' + hashtagsAndMentions.join(' ') : '');
        
        return result;
    }
    
    /**
     * Facebook用OGタグの動的更新
     */
    updateOGTagsForFacebook(shareData) {
        try {
            if (!this.gameEngine.seoMetaManager) {
                this.log('SEOMetaManagerが利用できません', null, 'warn');
                return;
            }
            
            const ogData = {
                title: shareData.title || 'BubblePop - バブルポップゲーム',
                description: shareData.text || shareData.description || 'HTML5で作られたバブルポップゲームで遊ぼう！',
                url: shareData.url || window.location.href,
                type: 'website'
            };
            
            // スコア共有の場合の特別処理
            if (shareData.type === 'score' && shareData.score) {
                ogData.title = `BubblePop - ${shareData.score.toLocaleString()}点達成！`;
                ogData.description = `BubblePopで${shareData.score.toLocaleString()}点を達成しました！あなたも挑戦してみませんか？`;
            }
            
            // 実績共有の場合の特別処理
            if (shareData.type === 'achievement' && shareData.name) {
                ogData.title = `BubblePop - 実績「${shareData.name}」解除！`;
                ogData.description = `BubblePopで実績「${shareData.name}」を解除しました！`;
            }
            
            // 画像の設定（ゲーム画面のスクリーンショットがあれば）
            if (shareData.image) {
                ogData.image = shareData.image;
                ogData.imageAlt = ogData.title;
            }
            
            // SEOMetaManagerを使用してOGタグを更新
            this.gameEngine.seoMetaManager.updateOpenGraphTags(ogData);
            
            this.log('OGタグ更新完了', ogData);
            
        } catch (error) {
            this.handleError('OG_TAGS_UPDATE_FAILED', error, shareData);
        }
    }
    
    /**
     * プラットフォーム固有の最適化されたメッセージ生成
     */
    generateOptimizedMessage(shareData, platform) {
        if (!this.shareContentGenerator) {
            this.log('ShareContentGeneratorが利用できません', null, 'warn');
            return shareData;
        }
        
        try {
            let result = null;
            
            switch (shareData.type) {
                case 'score':
                    result = this.shareContentGenerator.generateScoreMessage(shareData, platform);
                    break;
                case 'achievement':
                    result = this.shareContentGenerator.generateAchievementMessage(shareData, platform);
                    break;
                case 'challenge':
                    result = this.shareContentGenerator.generateChallengeMessage(shareData, platform);
                    break;
                default:
                    // カスタムメッセージまたはフォールバック
                    if (shareData.customTemplate) {
                        result = this.shareContentGenerator.generateCustomMessage(
                            shareData.type || 'custom',
                            shareData,
                            shareData.customTemplate,
                            platform
                        );
                    }
            }
            
            if (result && result.message) {
                return {
                    ...shareData,
                    text: result.message,
                    platform: result.platform,
                    language: result.language,
                    optimized: true,
                    metadata: result.metadata
                };
            }
            
            return shareData;
            
        } catch (error) {
            this.handleError('MESSAGE_OPTIMIZATION_FAILED', error, { shareData, platform });
            return shareData;
        }
    }
    
    /**
     * パフォーマンス統計の更新
     */
    updatePerformanceStats(action) {
        if (!this.performanceStats) {
            this.performanceStats = {};
        }
        
        this.performanceStats[action] = (this.performanceStats[action] || 0) + 1;
        this.performanceStats.lastUpdate = Date.now();
    }
    
    /**
     * HTMLエスケープ
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * 統合共有メソッド（Web API優先、フォールバック対応）
     */
    async share(shareData, options = {}) {
        try {
            const startTime = performance.now();
            
            // プラットフォームの検出
            const targetPlatform = options.platform || this.detectPlatform();
            
            // メッセージの最適化
            const optimizedData = this.generateOptimizedMessage(shareData, targetPlatform);
            
            // プラットフォーム固有の処理
            if (targetPlatform === 'twitter' && options.forceExternal) {
                return await this.shareViaTwitterUrl(optimizedData);
            }
            
            if (targetPlatform === 'facebook' && options.forceExternal) {
                return await this.shareViaFacebookUrl(optimizedData, options);
            }
            
            // Web Share APIが利用可能な場合は優先して使用
            if (this.isWebShareSupported() && !options.forceExternal) {
                const result = await this.shareViaWebAPI(optimizedData);
                if (result.success) {
                    // パフォーマンス統計の更新
                    const responseTime = performance.now() - startTime;
                    this.updatePerformanceStats('shareSuccess');
                    
                    return {
                        ...result,
                        responseTime,
                        optimized: optimizedData.optimized || false
                    };
                }
                
                // Web Share APIが失敗した場合、フォールバックを使用
                this.log('Web Share API失敗、フォールバックダイアログを表示');
            }
            
            // フォールバックダイアログを表示
            const fallbackResult = await this.showFallbackShareDialog(optimizedData);
            const responseTime = performance.now() - startTime;
            
            return {
                ...fallbackResult,
                responseTime,
                optimized: optimizedData.optimized || false
            };
            
        } catch (error) {
            this.handleError('SHARE_FAILED', error, { shareData, options });
            return {
                success: false,
                method: 'unknown',
                error: error.message
            };
        }
    }

    /**
     * Twitter URLを使用した共有
     */
    async shareViaTwitterUrl(shareData) {
        try {
            const twitterUrl = this.generateTwitterShareUrl(shareData);
            
            // 新しいウィンドウで開く
            const shareWindow = window.open(
                twitterUrl,
                'twitter-share',
                'width=550,height=420,scrollbars=yes,resizable=yes'
            );
            
            if (!shareWindow) {
                throw new Error('ポップアップがブロックされました');
            }
            
            // ウィンドウが閉じられたかを監視
            const checkClosed = setInterval(() => {
                if (shareWindow.closed) {
                    clearInterval(checkClosed);
                    this.updatePerformanceStats('twitterShareCompleted');
                }
            }, 1000);
            
            // 統計の記録
            this.gameEngine.statisticsManager?.recordSocialEvent('twitterShareAttempt', {
                hasText: !!shareData.text,
                hasUrl: !!shareData.url,
                dataType: shareData.type || 'unknown'
            });
            
            this.log('Twitter共有ウィンドウを開きました', { url: twitterUrl });
            
            return {
                success: true,
                method: 'twitter-url',
                url: twitterUrl,
                platform: 'twitter'
            };
            
        } catch (error) {
            this.handleError('TWITTER_SHARE_FAILED', error, shareData);
            return {
                success: false,
                method: 'twitter-url',
                error: error.message
            };
        }
    }
    
    /**
     * Facebook URLを使用した共有
     */
    async shareViaFacebookUrl(shareData, options = {}) {
        try {
            const facebookUrl = this.generateFacebookShareUrl(shareData, options);
            
            // 新しいウィンドウで開く
            const shareWindow = window.open(
                facebookUrl,
                'facebook-share',
                'width=626,height=436,scrollbars=yes,resizable=yes'
            );
            
            if (!shareWindow) {
                throw new Error('ポップアップがブロックされました');
            }
            
            // ウィンドウが閉じられたかを監視
            const checkClosed = setInterval(() => {
                if (shareWindow.closed) {
                    clearInterval(checkClosed);
                    this.updatePerformanceStats('facebookShareCompleted');
                }
            }, 1000);
            
            // 統計の記録
            this.gameEngine.statisticsManager?.recordSocialEvent('facebookShareAttempt', {
                hasUrl: !!shareData.url,
                hasTitle: !!shareData.title,
                hasQuote: !!(shareData.quote || shareData.text),
                dataType: shareData.type || 'unknown'
            });
            
            this.log('Facebook共有ウィンドウを開きました', { url: facebookUrl });
            
            return {
                success: true,
                method: 'facebook-url',
                url: facebookUrl,
                platform: 'facebook'
            };
            
        } catch (error) {
            this.handleError('FACEBOOK_SHARE_FAILED', error, shareData);
            return {
                success: false,
                method: 'facebook-url',
                error: error.message
            };
        }
    }

    /**
     * スクリーンショット付きでの共有 (Task 5)
     */
    async shareWithScreenshot(shareData, options = {}) {
        try {
            const startTime = performance.now();
            
            if (!this.screenshotCapture) {
                throw new Error('ScreenshotCaptureが初期化されていません');
            }
            
            // スクリーンショットの取得
            this.log('スクリーンショット付き共有開始', shareData);
            
            const screenshotOptions = {
                format: options.imageFormat || 'png',
                quality: options.imageQuality || 'high',
                maxWidth: options.maxWidth || 1200,
                maxHeight: options.maxHeight || 630,
                optimize: options.optimize !== false,
                filename: options.filename || this.screenshotCapture.generateFilename('share')
            };
            
            const screenshot = await this.screenshotCapture.captureGameCanvas(screenshotOptions);
            
            // スクリーンショット統計の記録
            if (this.statisticsManager) {
                this.statisticsManager.recordSocialEvent('screenshotCaptured', {
                    format: screenshot.format,
                    size: screenshot.size,
                    optimized: screenshot.optimized,
                    captureTime: performance.now() - startTime
                });
            }
            
            // 共有データにスクリーンショット情報を追加
            const enhancedShareData = {
                ...shareData,
                screenshot: {
                    url: screenshot.url,
                    blob: screenshot.blob,
                    size: screenshot.size,
                    format: screenshot.format,
                    filename: screenshot.filename
                }
            };
            
            // プラットフォーム別の共有処理
            const platform = options.platform || this.detectPlatform();
            let shareResult;
            
            switch (platform) {
                case 'twitter':
                    shareResult = await this.shareScreenshotViaTwitter(enhancedShareData, options);
                    break;
                case 'facebook':
                    shareResult = await this.shareScreenshotViaFacebook(enhancedShareData, options);
                    break;
                default:
                    shareResult = await this.shareScreenshotViaWebAPI(enhancedShareData, options);
                    break;
            }
            
            this.updatePerformanceStats('screenshotShare');
            
            this.log('スクリーンショット付き共有完了', {
                platform: shareResult.platform,
                screenshotSize: `${Math.round(screenshot.size / 1024)}KB`,
                totalTime: `${Math.round(performance.now() - startTime)}ms`
            });
            
            return {
                ...shareResult,
                screenshot: {
                    format: screenshot.format,
                    size: screenshot.size,
                    optimized: screenshot.optimized
                }
            };
            
        } catch (error) {
            this.handleError('SCREENSHOT_SHARE_FAILED', error, { shareData, options });
            
            // フォールバック: スクリーンショットなしでの共有
            this.log('スクリーンショットなしでの共有にフォールバック', null, 'warn');
            return await this.share(shareData, { ...options, fallback: true });
        }
    }
    
    /**
     * Twitterでのスクリーンショット共有
     */
    async shareScreenshotViaTwitter(shareData, options = {}) {
        try {
            // Twitterは画像アップロードAPIが必要なため、URLのみでの共有
            const twitterUrl = this.generateTwitterShareUrl(shareData, options);
            
            // 新しいウィンドウで共有
            const shareWindow = window.open(
                twitterUrl,
                'twitter-share',
                'width=550,height=420,scrollbars=yes,resizable=yes'
            );
            
            if (!shareWindow) {
                throw new Error('ポップアップがブロックされました');
            }
            
            // 統計記録
            if (this.statisticsManager) {
                this.statisticsManager.recordSocialEvent('twitterScreenshotShare', {
                    hasScreenshot: !!shareData.screenshot,
                    screenshotFormat: shareData.screenshot?.format,
                    screenshotSize: shareData.screenshot?.size
                });
            }
            
            return {
                success: true,
                method: 'twitter-url',
                platform: 'twitter',
                url: twitterUrl,
                hasScreenshot: true
            };
            
        } catch (error) {
            this.handleError('TWITTER_SCREENSHOT_SHARE_FAILED', error, shareData);
            throw error;
        }
    }
    
    /**
     * Facebookでのスクリーンショット共有
     */
    async shareScreenshotViaFacebook(shareData, options = {}) {
        try {
            // Open Graphタグを更新
            this.updateOGTagsForFacebook(shareData);
            
            const facebookUrl = this.generateFacebookShareUrl(shareData, options);
            
            // 新しいウィンドウで共有
            const shareWindow = window.open(
                facebookUrl,
                'facebook-share',
                'width=626,height=436,scrollbars=yes,resizable=yes'
            );
            
            if (!shareWindow) {
                throw new Error('ポップアップがブロックされました');
            }
            
            // 統計記録
            if (this.statisticsManager) {
                this.statisticsManager.recordSocialEvent('facebookScreenshotShare', {
                    hasScreenshot: !!shareData.screenshot,
                    screenshotFormat: shareData.screenshot?.format,
                    screenshotSize: shareData.screenshot?.size
                });
            }
            
            return {
                success: true,
                method: 'facebook-url',
                platform: 'facebook',
                url: facebookUrl,
                hasScreenshot: true
            };
            
        } catch (error) {
            this.handleError('FACEBOOK_SCREENSHOT_SHARE_FAILED', error, shareData);
            throw error;
        }
    }
    
    /**
     * Web Share APIでのスクリーンショット共有
     */
    async shareScreenshotViaWebAPI(shareData, options = {}) {
        try {
            if (!this.isWebShareSupported()) {
                throw new Error('Web Share APIがサポートされていません');
            }
            
            // Web Share APIにファイルが含まれている場合
            const sharePayload = {
                title: shareData.title || 'BubblePop - ゲーム画面',
                text: shareData.text || shareData.message || 'BubblePopをプレイ中！',
                url: shareData.url || window.location.href
            };
            
            // スクリーンショットファイルの追加
            if (shareData.screenshot && shareData.screenshot.blob) {
                const file = new File([shareData.screenshot.blob], shareData.screenshot.filename, {
                    type: shareData.screenshot.blob.type
                });
                sharePayload.files = [file];
            }
            
            await navigator.share(sharePayload);
            
            // 統計記録
            if (this.statisticsManager) {
                this.statisticsManager.recordSocialEvent('webApiScreenshotShare', {
                    hasScreenshot: !!shareData.screenshot,
                    screenshotFormat: shareData.screenshot?.format,
                    screenshotSize: shareData.screenshot?.size
                });
            }
            
            return {
                success: true,
                method: 'web-share-api',
                platform: 'web-share',
                hasScreenshot: true
            };
            
        } catch (error) {
            if (error.name === 'AbortError') {
                return {
                    success: false,
                    error: 'ユーザーによってキャンセルされました',
                    method: 'web-share-api',
                    platform: 'web-share'
                };
            }
            
            this.handleError('WEB_API_SCREENSHOT_SHARE_FAILED', error, shareData);
            throw error;
        }
    }
    
    /**
     * カスタム領域のスクリーンショット共有
     */
    async shareRegionScreenshot(x, y, width, height, shareData, options = {}) {
        try {
            if (!this.screenshotCapture) {
                throw new Error('ScreenshotCaptureが初期化されていません');
            }
            
            // 指定領域のスクリーンショットを取得
            const screenshotOptions = {
                format: options.imageFormat || 'png',
                quality: options.imageQuality || 'high',
                optimize: options.optimize !== false,
                filename: options.filename || this.screenshotCapture.generateFilename('region-share')
            };
            
            const screenshot = await this.screenshotCapture.captureRegion(x, y, width, height, screenshotOptions);
            
            // 共有データにスクリーンショット情報を追加
            const enhancedShareData = {
                ...shareData,
                screenshot: {
                    url: screenshot.url,
                    blob: screenshot.blob,
                    size: screenshot.size,
                    format: screenshot.format,
                    filename: screenshot.filename
                }
            };
            
            // 通常のスクリーンショット共有を実行
            return await this.shareWithScreenshot(enhancedShareData, { ...options, skipCapture: true });
            
        } catch (error) {
            this.handleError('REGION_SCREENSHOT_SHARE_FAILED', error, { x, y, width, height, shareData, options });
            throw error;
        }
    }

    
    /**
     * オーバーレイ付きスクリーンショット共有 (Task 6)
     */
    async shareWithOverlayScreenshot(shareData, overlayType, overlayData, options = {}) {
        try {
            const startTime = performance.now();
            
            if (!this.screenshotCapture) {
                throw new Error('ScreenshotCaptureが初期化されていません');
            }
            
            this.log('オーバーレイ付きスクリーンショット共有開始', { 
                overlayType, 
                shareData: shareData.type 
            });
            
            // オーバーレイ設定の準備
            const overlayOptions = {
                format: options.imageFormat || 'png',
                quality: options.imageQuality || 'high',
                optimize: options.optimize !== false,
                filename: options.filename || this.screenshotCapture.generateFilename(`${overlayType}-share`),
                overlay: options.overlayConfig || {}
            };
            
            // オーバーレイタイプ別のスクリーンショット取得
            let screenshot;
            
            switch (overlayType) {
                case 'score':
                    screenshot = await this.screenshotCapture.captureWithScore(overlayData, overlayOptions);
                    break;
                case 'achievement':
                    screenshot = await this.screenshotCapture.captureWithAchievement(overlayData, overlayOptions);
                    break;
                case 'custom':
                    screenshot = await this.screenshotCapture.captureWithCustomOverlay(overlayData, overlayOptions);
                    break;
                default:
                    throw new Error(`未対応のオーバーレイタイプ: ${overlayType}`);
            }
            
            // 統計記録
            if (this.statisticsManager) {
                this.statisticsManager.recordSocialEvent('overlayScreenshotCaptured', {
                    overlayType,
                    format: screenshot.format,
                    size: screenshot.size,
                    optimized: screenshot.optimized,
                    captureTime: performance.now() - startTime
                });
            }
            
            // 共有データにスクリーンショット情報を追加
            const enhancedShareData = {
                ...shareData,
                screenshot: {
                    url: screenshot.url,
                    blob: screenshot.blob,
                    size: screenshot.size,
                    format: screenshot.format,
                    filename: screenshot.filename,
                    overlayType: screenshot.overlayType,
                    hasOverlay: screenshot.hasOverlay
                }
            };
            
            // 標準のスクリーンショット共有を実行
            const shareResult = await this.shareWithScreenshot(enhancedShareData, {
                ...options,
                skipCapture: true // 既にキャプチャ済み
            });
            
            this.log('オーバーレイ付きスクリーンショット共有完了', {
                overlayType,
                platform: shareResult.platform,
                screenshotSize: `${Math.round(screenshot.size / 1024)}KB`,
                totalTime: `${Math.round(performance.now() - startTime)}ms`
            });
            
            return {
                ...shareResult,
                overlayType,
                screenshot: {
                    format: screenshot.format,
                    size: screenshot.size,
                    optimized: screenshot.optimized,
                    hasOverlay: true
                }
            };
            
        } catch (error) {
            this.handleError('OVERLAY_SCREENSHOT_SHARE_FAILED', error, { shareData, overlayType, overlayData, options });
            
            // フォールバック: 通常のスクリーンショット共有
            this.log('通常のスクリーンショット共有にフォールバック', null, 'warn');
            return await this.shareWithScreenshot(shareData, options);
        }
    }
    
    /**
     * スコア情報オーバーレイ付き共有
     */
    async shareScoreWithOverlay(scoreData, shareData, options = {}) {
        return await this.shareWithOverlayScreenshot(
            shareData || { type: 'score', score: scoreData.score },
            'score',
            scoreData,
            options
        );
    }
    
    /**
     * 実績オーバーレイ付き共有
     */
    async shareAchievementWithOverlay(achievementData, shareData, options = {}) {
        return await this.shareWithOverlayScreenshot(
            shareData || { type: 'achievement', name: achievementData.name },
            'achievement',
            achievementData,
            options
        );
    }
    
    /**
     * カスタムオーバーレイ付き共有
     */
    async shareCustomOverlay(customData, shareData, options = {}) {
        return await this.shareWithOverlayScreenshot(
            shareData || { type: 'custom' },
            'custom',
            customData,
            options
        );
    }
    
    /**
     * プリセットオーバーレイ付き共有
     */
    async shareWithPresetOverlay(presetName, shareData, overlayData, options = {}) {
        // プリセット設定の取得
        if (this.screenshotCapture && this.screenshotCapture.screenshotOverlay) {
            const presetConfig = this.screenshotCapture.screenshotOverlay.getPresetConfig(presetName);
            options.overlayConfig = { ...presetConfig, ...options.overlayConfig };
        }
        
        return await this.shareWithOverlayScreenshot(shareData, overlayData.type, overlayData.data, options);
    }
    
    /**
     * レスポンシブオーバーレイ付き共有
     */
    async shareWithResponsiveOverlay(shareData, overlayType, overlayData, options = {}) {
        // レスポンシブ設定の適用
        if (this.screenshotCapture && this.screenshotCapture.screenshotOverlay) {
            const canvas = this.screenshotCapture.getGameCanvas();
            if (canvas) {
                const responsiveConfig = this.screenshotCapture.screenshotOverlay.getResponsiveConfig(
                    canvas.width, 
                    canvas.height
                );
                options.overlayConfig = { ...responsiveConfig, ...options.overlayConfig };
            }
        }
        
        return await this.shareWithOverlayScreenshot(shareData, overlayType, overlayData, options);
    }
    
    /**
     * オーバーレイ機能の状態確認
     */
    getOverlayCapabilities() {
        const capabilities = {
            available: !!(this.screenshotCapture && this.screenshotCapture.overlayEnabled),
            types: ['score', 'achievement', 'custom'],
            presets: ['minimal', 'elegant', 'gaming', 'social'],
            responsive: true,
            customizable: true
        };
        
        if (this.screenshotCapture && this.screenshotCapture.screenshotOverlay) {
            capabilities.stats = this.screenshotCapture.screenshotOverlay.getStats();
        }
        
        return capabilities;
    }
    
    /**
     * スクリーンショット機能の状態確認
     */
    getScreenshotCapabilities() {
        const capabilities = {
            available: !!this.screenshotCapture,
            formats: ['png', 'jpeg'],
            optimization: true,
            maxDimensions: {
                width: this.screenshotCapture?.config.maxWidth || 1200,
                height: this.screenshotCapture?.config.maxHeight || 630
            }
        };
        
        // WebPサポートの確認
        if (this.screenshotCapture && this.screenshotCapture.isWebPSupported()) {
            capabilities.formats.push('webp');
        }
        
        // Web Share APIでのファイル共有サポート
        capabilities.webShareFiles = this.isWebShareSupported() && 
            navigator.canShare && 
            navigator.canShare({ files: [new File([''], 'test.png', { type: 'image/png' })] });
        
        return capabilities;
    }
    
    /**
     * スクリーンショットキャプチャの統計取得
     */
    getScreenshotStats() {
        if (!this.screenshotCapture) {
            return null;
        }
        
        return this.screenshotCapture.getStats();
    }
    
    /**
     * オンライン状態変更時の処理
     */
    onOnlineStatusChange() {
        const isOnline = navigator.onLine;
        this.log(`オンライン状態変更: ${isOnline ? 'オンライン' : 'オフライン'}`);
        
        if (isOnline) {
            // オンライン復帰時の処理（保留中の共有リクエストなど）
            this.processPendingShares();
        }
    }
    
    /**
     * 保留中の共有処理
     */
    async processPendingShares() {
        // TODO: オフライン時に蓄積された共有リクエストの処理
        this.log('保留中の共有処理を実行');
    }
    
    /**
     * ウィンドウ閉じる前の処理
     */
    onBeforeUnload(event) {
        // 重要なデータの保存
        this.saveSettings();
    }
    
    /**
     * エラーハンドリング
     */
    handleError(type, error, context = {}) {
        const errorInfo = {
            type,
            error: error.message || error,
            context,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        };
        
        // パフォーマンス統計の更新
        this.performanceStats.failedShares++;
        
        // ErrorHandlerユーティリティの使用
        if (ErrorHandler) {
            ErrorHandler.handleError(error, 'SocialSharingManager', context);
        }
        
        // ローカルログの記録
        this.log('エラー発生', errorInfo, 'error');
        
        // ユーザーフレンドリーなエラー表示（必要に応じて）
        this.showUserError(type, context);
    }
    
    /**
     * ユーザー向けエラー表示
     */
    showUserError(errorType, context) {
        // TODO: ユーザーフレンドリーなエラーメッセージの表示
        // 現在は基本的なアラートで代替
        switch (errorType) {
            case this.errorTypes.WEB_SHARE_NOT_SUPPORTED:
                console.warn('このブラウザでは共有機能がサポートされていません');
                break;
            case this.errorTypes.SCREENSHOT_FAILED:
                console.warn('スクリーンショットの生成に失敗しました');
                break;
            case this.errorTypes.STORAGE_FULL:
                console.warn('ストレージ容量が不足しています');
                break;
            default:
                console.warn('共有機能で問題が発生しました');
        }
    }
    
    /**
     * パフォーマンス統計の取得
     */
    getPerformanceStats() {
        return {
            ...this.performanceStats,
            successRate: this.performanceStats.shareRequests > 0 
                ? (this.performanceStats.successfulShares / this.performanceStats.shareRequests) * 100 
                : 0
        };
    }
    
    /**
     * 設定の更新
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        this.log('設定更新完了', this.settings);
    }
    
    /**
     * 機能の有効/無効切り替え
     */
    setEnabled(enabled) {
        this.settings.enabled = enabled;
        this.saveSettings();
        this.log(`ソーシャル機能: ${enabled ? '有効' : '無効'}`);
    }
    
    /**
     * ログ記録
     */
    log(message, data = null, level = 'info') {
        const logEntry = {
            timestamp: Date.now(),
            level,
            message,
            data
        };
        
        // コンソール出力
        const consoleMethod = level === 'error' ? 'error' : 
                            level === 'warn' ? 'warn' : 'log';
        console[consoleMethod](`[SocialSharingManager] ${message}`, data);
        
        // 永続ログの保存（デバッグモード時のみ）
        if (this.gameEngine && this.gameEngine.isDebugMode && this.gameEngine.isDebugMode()) {
            this.savePersistentLog(logEntry);
        }
    }
    
    /**
     * 永続ログの保存
     */
    savePersistentLog(logEntry) {
        try {
            const logs = JSON.parse(localStorage.getItem('socialSharingLogs') || '[]');
            logs.push(logEntry);
            
            // ログサイズの制限（最新の100件まで）
            if (logs.length > 100) {
                logs.splice(0, logs.length - 100);
            }
            
            localStorage.setItem('socialSharingLogs', JSON.stringify(logs));
        } catch (error) {
            console.warn('ログ保存に失敗:', error);
        }
    }
    
    /**
     * デバッグ情報の取得
     */
    getDebugInfo() {
        return {
            settings: this.settings,
            performanceStats: this.getPerformanceStats(),
            systemIntegration: {
                gameEngine: !!this.gameEngine,
                statisticsManager: !!this.statisticsManager,
                achievementManager: !!this.achievementManager,
                localizationManager: !!this.localizationManager
            },
            platform: this.detectPlatform(),
            onlineStatus: navigator.onLine,
            userAgent: navigator.userAgent
        };
    }
    
    /**
     * システムのクリーンアップ
     */
    cleanup() {
        // イベントリスナーの削除
        window.removeEventListener('beforeunload', this.onBeforeUnload.bind(this));
        window.removeEventListener('online', this.onOnlineStatusChange.bind(this));
        window.removeEventListener('offline', this.onOnlineStatusChange.bind(this));
        
        // GameEngineイベントリスナーの削除
        if (this.gameEngine) {
            this.gameEngine.off('gameEnd', this.onGameEnd.bind(this));
            this.gameEngine.off('highScore', this.onHighScore.bind(this));
            this.gameEngine.off('achievementUnlocked', this.onAchievementUnlocked.bind(this));
        }
        
        // 設定の最終保存
        this.saveSettings();
        
        this.log('SocialSharingManager: クリーンアップ完了');
    }
}