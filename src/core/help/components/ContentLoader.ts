/**
 * ヘルプコンテンツ読み込み・キャッシュシステム
 * パフォーマンス最適化機能付き
 */

// 型定義
export interface LocalizationManager {
    getCurrentLanguage(): string;
}

export interface HitRatio {
    hits: number;
    misses: number;
}

export interface LoadQueueItem {
    type: string;
    category: string;
    language: string;
    priority: number;
    callback?: () => void;
    resolve: (value: any) => void;
    reject: (error: any) => void;
    timestamp: number;
}

export interface HelpContentItem {
    id: string;
    category: string;
    title: string;
    content: string;
    language: string;
    searchKeywords: string[];
    lastUpdated: string;
}

export interface TutorialStep {
    id: string;
    title: string;
    instructions: string;
    targetElement: string;
    waitForAction: string;
}

export interface TutorialData {
    id: string;
    title: string;
    description: string;
    language: string;
    steps: TutorialStep[];
}

export interface FAQData {
    id: string;
    question: string;
    answer: string;
    category: string;
    language: string;
    lastUpdated: string;
}

export interface PerformanceStats {
    cacheHitRate: number;
    cacheSize: number;
    imageCacheSize: number;
    queueLength: number;
    averageLoadTimes: { [key: string]: number };
    isLoading: boolean;
}

export interface VersionData {
    version: string;
}

export class ContentLoader {
    private localizationManager: LocalizationManager;
    private contentCache: Map<string, any>;
    private imageCache: Map<string, HTMLImageElement>;
    private cacheExpiry: Map<string, number>;
    private maxCacheSize: number;
    private cacheTimeout: number;
    private lazyLoadingEnabled: boolean;
    private preloadPriority: string[];
    private loadingQueue: LoadQueueItem[];
    private isLoading: boolean;
    private loadTimes: Map<string, number[]>;
    private hitRatio: HitRatio;
    private contentVersion: string;
    private versionCheck: boolean;

    constructor(localizationManager: LocalizationManager) {
        this.localizationManager = localizationManager;
        
        // キャッシュシステム
        this.contentCache = new Map<string, any>();
        this.imageCache = new Map<string, HTMLImageElement>();
        this.cacheExpiry = new Map<string, number>();
        this.maxCacheSize = 50; // 最大キャッシュ項目数
        this.cacheTimeout = 30 * 60 * 1000; // 30分のキャッシュタイムアウト
        
        // 遅延読み込み設定
        this.lazyLoadingEnabled = true;
        this.preloadPriority = ['gameplay', 'basic']; // 優先読み込みカテゴリ
        this.loadingQueue = [];
        this.isLoading = false;

        // パフォーマンス監視
        this.loadTimes = new Map<string, number[]>();
        this.hitRatio = { hits: 0, misses: 0 };

        // バージョン管理
        this.contentVersion = '1.0.0';
        this.versionCheck = true;
        
        this.initialize();
    }
    
    /**
     * 初期化処理
     */
    async initialize(): Promise<void> {
        try {
            // 優先度の高いコンテンツをプリロード
            if (this.lazyLoadingEnabled) {
                await this.preloadEssentialContent();
            }
            
            // バージョンチェック
            if (this.versionCheck) {
                await this.checkContentVersion();
            }
        } catch (error) {
            console.warn('ContentLoader initialization warning:', error);
        }
    }
    
    /**
     * 必須コンテンツのプリロード
     */
    async preloadEssentialContent(): Promise<void> {
        const language = this.localizationManager.getCurrentLanguage();
        
        for (const category of this.preloadPriority) {
            try {
                await this.loadHelpContent(category, language);
            } catch (error) {
                console.warn(`Failed to preload ${category}:`, error);
                // プリロード失敗は致命的ではない
            }
        }
    }
    
    /**
     * ヘルプコンテンツを読み込み
     * @param category - カテゴリ
     * @param language - 言語
     * @returns ヘルプコンテンツ配列
     */
    async loadHelpContent(category: string, language: string = 'ja'): Promise<HelpContentItem[]> {
        const startTime = performance.now();
        const cacheKey = `help_${category}_${language}`;
        
        try {
            // キャッシュチェック
            const cachedContent = this.getCachedContent(cacheKey);
            if (cachedContent) {
                this.hitRatio.hits++;
                this.recordLoadTime(cacheKey, performance.now() - startTime);
                return cachedContent;
            }
            
            this.hitRatio.misses++;
            
            // 遅延読み込み対応
            if (this.lazyLoadingEnabled && this.isLoading) {
                return this.queueLoad('help', category, language);
            }
            
            this.isLoading = true;
            
            // コンテンツを読み込み
            const content = await this.fetchHelpContent(category, language);
            
            // キャッシュに保存
            this.setCachedContent(cacheKey, content);
            
            this.recordLoadTime(cacheKey, performance.now() - startTime);
            
            return content;
            
        } catch (error) {
            console.error(`Failed to load help content for ${category}:`, error);
            
            // フォールバック: キャッシュされた古いコンテンツまたはデフォルトコンテンツ
            const fallbackContent = this.getFallbackContent(category, language);
            return fallbackContent || [];
            
        } finally {
            this.isLoading = false;
            this.processLoadingQueue();
        }
    }

    /**
     * チュートリアルデータを読み込み
     * @param language - 言語
     * @returns チュートリアルデータ配列
     */
    async loadTutorialData(language: string = 'ja'): Promise<TutorialData[]> {
        const startTime = performance.now();
        const cacheKey = `tutorial_${language}`;
        
        try {
            const cachedData = this.getCachedContent(cacheKey);
            if (cachedData) {
                this.hitRatio.hits++;
                return cachedData;
            }
            
            this.hitRatio.misses++;
            
            const data = await this.fetchTutorialData(language);
            this.setCachedContent(cacheKey, data);
            
            this.recordLoadTime(cacheKey, performance.now() - startTime);
            
            return data;

        } catch (error) {
            console.error('Failed to load tutorial data:', error);
            return this.getDefaultTutorialData();
        }
    }

    /**
     * FAQデータを読み込み
     * @param language - 言語
     * @returns FAQデータ配列
     */
    async loadFAQData(language: string = 'ja'): Promise<FAQData[]> {
        const cacheKey = `faq_${language}`;
        
        try {
            const cachedData = this.getCachedContent(cacheKey);
            if (cachedData) {
                this.hitRatio.hits++;
                return cachedData;
            }
            
            this.hitRatio.misses++;
            
            const data = await this.fetchFAQData(language);
            this.setCachedContent(cacheKey, data);
            
            return data;

        } catch (error) {
            console.error('Failed to load FAQ data:', error);
            return [];
        }
    }
    
    /**
     * 画像を遅延読み込み
     * @param imagePath - 画像パス
     * @returns 読み込み済み画像
     */
    async loadImage(imagePath: string): Promise<HTMLImageElement> {
        const cacheKey = `image_${imagePath}`;
        
        // キャッシュチェック
        if (this.imageCache.has(cacheKey)) {
            return this.imageCache.get(cacheKey)!;
        }
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.imageCache.set(cacheKey, img);
                this.cleanupImageCache();
                resolve(img);
            };
            
            img.onerror = () => {
                reject(new Error(`Failed to load image: ${imagePath}`));
            };
            
            img.src = imagePath;
        });
    }
    
    /**
     * キャッシュからコンテンツを取得
     * @param key - キャッシュキー
     * @returns キャッシュされたコンテンツまたはnull
     */
    getCachedContent(key: string): any | null {
        // 有効期限チェック
        if (this.cacheExpiry.has(key)) {
            const expiry = this.cacheExpiry.get(key)!;
            if (Date.now() > expiry) {
                this.contentCache.delete(key);
                this.cacheExpiry.delete(key);
                return null;
            }
        }
        
        return this.contentCache.get(key) || null;
    }
    
    /**
     * コンテンツをキャッシュに保存
     * @param key - キャッシュキー
     * @param content - 保存するコンテンツ
     */
    setCachedContent(key: string, content: any): void {
        // キャッシュサイズ制限チェック
        if (this.contentCache.size >= this.maxCacheSize) {
            this.cleanupCache();
        }
        
        this.contentCache.set(key, content);
        this.cacheExpiry.set(key, Date.now() + this.cacheTimeout);
    }
    
    /**
     * キャッシュをクリア
     * @param pattern - クリアするキーのパターン（省略可）
     */
    clearCache(pattern: string | null = null): void {
        if (pattern) {
            const regex = new RegExp(pattern);
            for (const key of this.contentCache.keys()) {
                if (regex.test(key)) {
                    this.contentCache.delete(key);
                    this.cacheExpiry.delete(key);
                }
            }
        } else {
            this.contentCache.clear();
            this.cacheExpiry.clear();
        }
    }
    
    /**
     * コンテンツバージョンをチェック
     */
    async checkContentVersion(): Promise<void> {
        try {
            const response = await fetch('/data/help/version.json');
            const versionData: VersionData = await response.json();

            if (versionData.version !== this.contentVersion) {
                console.log('Content version updated, clearing cache');
                this.clearCache();
                this.contentVersion = versionData.version;
            }
        } catch (error) {
            console.warn('Version check failed:', error);
        }
    }
    
    /**
     * 読み込みをキューに追加
     * @param type - 読み込みタイプ
     * @param category - カテゴリ
     * @param language - 言語
     * @returns 読み込み完了Promise
     */
    queueLoad(type: string, category: string, language: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.loadingQueue.push({
                type,
                category,
                language,
                priority: 0,
                resolve,
                reject,
                timestamp: Date.now()
            });
        });
    }
    
    /**
     * 読み込みキューを処理
     */
    async processLoadingQueue(): Promise<void> {
        if (this.loadingQueue.length === 0 || this.isLoading) {
            return;
        }
        
        const batch = this.loadingQueue.splice(0, 3); // 3つずつバッチ処理
        
        for (const item of batch) {
            try {
                let result: any;
                
                switch (item.type) {
                    case 'help':
                        result = await this.loadHelpContent(item.category, item.language);
                        break;
                    case 'tutorial':
                        result = await this.loadTutorialData(item.language);
                        break;
                    case 'faq':
                        result = await this.loadFAQData(item.language);
                        break;
                    default:
                        throw new Error(`Unknown load type: ${item.type}`);
                }
                
                item.resolve(result);
            } catch (error) {
                item.reject(error);
            }
        }
        
        // 残りのキューがあれば再帰処理
        if (this.loadingQueue.length > 0) {
            setTimeout(() => this.processLoadingQueue(), 100);
        }
    }
    
    /**
     * パフォーマンス統計を取得
     * @returns パフォーマンス統計
     */
    getPerformanceStats(): PerformanceStats {
        const totalRequests = this.hitRatio.hits + this.hitRatio.misses;
        const hitRate = totalRequests > 0 ? (this.hitRatio.hits / totalRequests) * 100 : 0;
        
        const avgLoadTimes: { [key: string]: number } = {};
        for (const [key, times] of this.loadTimes) {
            const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
            avgLoadTimes[key] = Math.round(avg * 100) / 100;
        }
        
        return {
            cacheHitRate: Math.round(hitRate * 100) / 100,
            cacheSize: this.contentCache.size,
            imageCacheSize: this.imageCache.size,
            queueLength: this.loadingQueue.length,
            averageLoadTimes: avgLoadTimes,
            isLoading: this.isLoading
        };
    }
    
    /**
     * 実際のヘルプコンテンツを取得（実装固有）
     * @private
     */
    private async fetchHelpContent(category: string, language: string): Promise<HelpContentItem[]> {
        // 実際の実装では外部ファイルまたはAPIから読み込み
        const mockContent: HelpContentItem[] = [{
            id: `${category}-help-1`,
            category: category,
            title: `${category}ヘルプ`,
            content: `${category}に関するヘルプコンテンツです。`,
            language: language,
            searchKeywords: [category, 'help', 'ヘルプ'],
            lastUpdated: new Date().toISOString()
        }];
        
        // ネットワーク遅延をシミュレート
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
        
        return mockContent;
    }
    
    /**
     * チュートリアルデータを取得（実装固有）
     * @private
     */
    private async fetchTutorialData(language: string): Promise<TutorialData[]> {
        const mockData: TutorialData[] = [{
            id: 'basic-tutorial',
            title: '基本チュートリアル',
            description: 'ゲームの基本操作を学習します',
            language: language,
            steps: [{
                id: 'step1',
                title: 'ステップ1',
                instructions: '最初のステップです',
                targetElement: '.bubble',
                waitForAction: 'click'
            }]
        }];
        
        await new Promise(resolve => setTimeout(resolve, 150));
        return mockData;
    }
    
    /**
     * FAQデータを取得（実装固有）
     * @private
     */
    private async fetchFAQData(language: string): Promise<FAQData[]> {
        const mockData: FAQData[] = [{
            id: 'faq-1',
            question: 'よくある質問1',
            answer: '回答1',
            category: 'basic',
            language: language,
            lastUpdated: new Date().toISOString()
        }];
        
        await new Promise(resolve => setTimeout(resolve, 80));
        return mockData;
    }
    
    /**
     * フォールバックコンテンツを取得
     * @private
     */
    private getFallbackContent(category: string, language: string): HelpContentItem[] | null {
        // キャッシュから期限切れでも利用可能なコンテンツを探す
        const fallbackKey = `help_${category}_${language}`;
        
        // 期限切れでもキャッシュから取得
        const cached = this.contentCache.get(fallbackKey);
        if (cached) {
            return cached;
        }
        
        // デフォルト言語のコンテンツを試す
        if (language !== 'ja') {
            const jaKey = `help_${category}_ja`;
            const jaCached = this.contentCache.get(jaKey);
            if (jaCached) {
                return jaCached;
            }
        }
        
        return null;
    }
    
    /**
     * デフォルトチュートリアルデータを取得
     * @private
     */
    private getDefaultTutorialData(): TutorialData[] {
        return [{
            id: 'default-tutorial',
            title: 'デフォルトチュートリアル',
            description: 'オフライン用基本チュートリアル',
            language: 'ja',
            steps: []
        }];
    }
    
    /**
     * キャッシュクリーンアップ
     * @private
     */
    private cleanupCache(): void {
        // LRU方式でキャッシュをクリーンアップ
        const entries = Array.from(this.contentCache.entries());
        const expiries = Array.from(this.cacheExpiry.entries());
        
        // 有効期限順でソート
        expiries.sort((a, b) => a[1] - b[1]);
        
        // 古いエントリを削除
        const toDelete = expiries.slice(0, Math.floor(this.maxCacheSize * 0.3));
        for (const [key] of toDelete) {
            this.contentCache.delete(key);
            this.cacheExpiry.delete(key);
        }
    }
    
    /**
     * 画像キャッシュクリーンアップ
     * @private
     */
    private cleanupImageCache(): void {
        const maxImageCache = 20;
        if (this.imageCache.size > maxImageCache) {
            // 古い画像を削除（単純に最初の要素を削除）
            const firstKey = this.imageCache.keys().next().value;
            if (firstKey) {
                this.imageCache.delete(firstKey);
            }
        }
    }
    
    /**
     * 読み込み時間を記録
     * @private
     */
    private recordLoadTime(key: string, time: number): void {
        if (!this.loadTimes.has(key)) {
            this.loadTimes.set(key, []);
        }
        
        const times = this.loadTimes.get(key)!;
        times.push(time);
        
        // 最新10回の記録のみ保持
        if (times.length > 10) {
            times.shift();
        }
    }
    
    /**
     * クリーンアップ
     */
    cleanup(): void {
        this.clearCache();
        this.imageCache.clear();
        this.loadTimes.clear();
    }
}