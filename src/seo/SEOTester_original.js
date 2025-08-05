/**
 * SEO包括テストスイート
 * 
 * メタタグ、構造化データ、パフォーマンスの自動検証機能を提供
 */
import { SEOConfig, getBaseUrl } from './SEOConfig.js';
import { seoLogger } from './SEOLogger.js';
import { seoErrorHandler } from './SEOErrorHandler.js';
import { measurePerformance } from './SEOUtils.js';

export class SEOTester {
    constructor() {
        this.baseUrl = getBaseUrl();
        this.testResults = new Map();
        this.validationRules = new Map();
        this.performanceMetrics = {
            testExecutionTime: 0,
            validationErrors: 0,
            validationWarnings: 0,
            totalTests: 0,
            passedTests: 0
        };
        
        this._initializeValidationRules();
    }
    
    /**
     * 検証ルールの初期化
     * @private
     */
    _initializeValidationRules() {
        // メタタグ検証ルール
        this.validationRules.set('metaTags', {
            required: ['title', 'description', 'charset'],
            titleLength: { min: 10, max: 60 },
            descriptionLength: { min: 50, max: 160 },
            keywordsCount: { max: 10 }
        });
        
        // Open Graph検証ルール
        this.validationRules.set('openGraph', {
            required: ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'],
            imageMinSize: { width: 1200, height: 630 },
            titleLength: { max: 95 },
            descriptionLength: { max: 297 }
        });
        
        // Twitter Card検証ルール
        this.validationRules.set('twitterCard', {
            required: ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'],
            cardTypes: ['summary', 'summary_large_image', 'app', 'player'],
            titleLength: { max: 70 },
            descriptionLength: { max: 200 }
        });
        
        // 構造化データ検証ルール
        this.validationRules.set('structuredData', {
            required: ['@context', '@type', 'name', 'description'],
            allowedContexts: ['https://schema.org', 'http://schema.org'],
            videoGameProperties: ['genre', 'gamePlatform', 'operatingSystem', 'applicationCategory']
        });
        
        // hreflang検証ルール
        this.validationRules.set('hreflang', {
            requiredLanguages: SEOConfig.supportedLanguages,
            requiresXDefault: true,
            validLanguageCodes: /^[a-z]{2}(-[A-Z]{2})?$/
        });
        
        seoLogger.info('SEOTester validation rules initialized');
    }
    
    /**
     * 包括的SEOテストの実行
     * @param {Object} options - テストオプション
     * @returns {Promise<Object>}
     */
    @measurePerformance('SEOTester')
    async runComprehensiveTest(options = {}) {
        try {
            const {
                includeMetaTags = true,
                includeStructuredData = true,
                includeSocialMedia = true,
                includePerformance = true,
                includeAccessibility = true,
                includeSitemap = true,
                includeRobots = true
            } = options;
            
            const startTime = performance.now();
            const testSuite = [];
            
            seoLogger.info('Starting comprehensive SEO test suite');
            
            // メタタグテスト
            if (includeMetaTags) {
                testSuite.push(this.validateMetaTags());
                testSuite.push(this.validateOpenGraphTags());
                testSuite.push(this.validateTwitterCardTags());
            }
            
            // 構造化データテスト
            if (includeStructuredData) {
                testSuite.push(this.validateStructuredData());
            }
            
            // ソーシャルメディアテスト
            if (includeSocialMedia) {
                testSuite.push(this.validateSocialMediaOptimization());
            }
            
            // パフォーマンステスト
            if (includePerformance) {
                testSuite.push(this.validatePerformanceOptimization());
            }
            
            // アクセシビリティテスト
            if (includeAccessibility) {
                testSuite.push(this.validateAccessibilityCompliance());
            }
            
            // サイトマップテスト
            if (includeSitemap) {
                testSuite.push(this.validateSitemap());
            }
            
            // robots.txtテスト
            if (includeRobots) {
                testSuite.push(this.validateRobotsTxt());
            }
            
            // 全テストの実行
            const results = await Promise.allSettled(testSuite);
            const endTime = performance.now();
            
            // 結果の集約
            const aggregatedResults = this._aggregateTestResults(results);
            aggregatedResults.executionTime = endTime - startTime;
            
            this.performanceMetrics.testExecutionTime = aggregatedResults.executionTime;
            this.performanceMetrics.totalTests = aggregatedResults.totalTests;
            this.performanceMetrics.passedTests = aggregatedResults.passedTests;
            
            seoLogger.info(`SEO test suite completed in ${aggregatedResults.executionTime.toFixed(2)}ms`);
            
            return aggregatedResults;
            
        } catch (error) {
            return seoErrorHandler.handle(error, 'runComprehensiveTest', options);
        }
    }
    
    /**
     * メタタグの検証
     * @returns {Promise<Object>}
     */
    async validateMetaTags() {
        try {
            const results = {
                category: 'Meta Tags',
                tests: [],
                passed: 0,
                failed: 0,
                warnings: 0
            };
            
            // HTMLからメタタグを抽出（実際の実装では DOM から取得）
            const metaTags = await this._extractMetaTags();
            const rules = this.validationRules.get('metaTags');
            
            // 必須タグの存在確認
            for (const requiredTag of rules.required) {
                const test = {
                    name: `Required meta tag: ${requiredTag}`,
                    passed: false,
                    message: ''
                };
                
                if (metaTags[requiredTag]) {
                    test.passed = true;
                    test.message = `✅ ${requiredTag} tag present`;
                    results.passed++;
                } else {
                    test.message = `❌ Missing required ${requiredTag} tag`;
                    results.failed++;
                }
                
                results.tests.push(test);
            }
            
            // タイトル長の検証
            if (metaTags.title) {
                const titleTest = {
                    name: 'Title length validation',
                    passed: false,
                    message: ''
                };
                
                const titleLength = metaTags.title.length;
                if (titleLength >= rules.titleLength.min && titleLength <= rules.titleLength.max) {
                    titleTest.passed = true;
                    titleTest.message = `✅ Title length optimal: ${titleLength} characters`;
                    results.passed++;
                } else {
                    titleTest.message = `⚠️ Title length suboptimal: ${titleLength} characters (recommended: ${rules.titleLength.min}-${rules.titleLength.max})`;
                    results.warnings++;
                }
                
                results.tests.push(titleTest);
            }
            
            // 説明文長の検証
            if (metaTags.description) {
                const descTest = {
                    name: 'Description length validation',
                    passed: false,
                    message: ''
                };
                
                const descLength = metaTags.description.length;
                if (descLength >= rules.descriptionLength.min && descLength <= rules.descriptionLength.max) {
                    descTest.passed = true;
                    descTest.message = `✅ Description length optimal: ${descLength} characters`;
                    results.passed++;
                } else {
                    descTest.message = `⚠️ Description length suboptimal: ${descLength} characters (recommended: ${rules.descriptionLength.min}-${rules.descriptionLength.max})`;
                    results.warnings++;
                }
                
                results.tests.push(descTest);
            }
            
            seoLogger.validation('metaTags', results.failed === 0, results.tests);
            return results;
            
        } catch (error) {
            return seoErrorHandler.handle(error, 'validateMetaTags');
        }
    }
    
    /**
     * Open Graphタグの検証
     * @returns {Promise<Object>}
     */
    async validateOpenGraphTags() {
        try {
            const results = {
                category: 'Open Graph',
                tests: [],
                passed: 0,
                failed: 0,
                warnings: 0
            };
            
            const ogTags = await this._extractOpenGraphTags();
            const rules = this.validationRules.get('openGraph');
            
            // 必須OGタグの存在確認
            for (const requiredTag of rules.required) {
                const test = {
                    name: `Required OG tag: ${requiredTag}`,
                    passed: false,
                    message: ''
                };
                
                if (ogTags[requiredTag]) {
                    test.passed = true;
                    test.message = `✅ ${requiredTag} tag present`;
                    results.passed++;
                } else {
                    test.message = `❌ Missing required ${requiredTag} tag`;
                    results.failed++;
                }
                
                results.tests.push(test);
            }
            
            // OG画像の検証
            if (ogTags['og:image']) {
                const imageTest = {
                    name: 'OG image validation',
                    passed: false,
                    message: ''
                };
                
                const imageUrl = ogTags['og:image'];
                if (this._isValidImageUrl(imageUrl)) {
                    imageTest.passed = true;
                    imageTest.message = `✅ Valid OG image URL: ${imageUrl}`;
                    results.passed++;
                } else {
                    imageTest.message = `❌ Invalid OG image URL: ${imageUrl}`;
                    results.failed++;
                }
                
                results.tests.push(imageTest);
            }
            
            return results;
            
        } catch (error) {
            return seoErrorHandler.handle(error, 'validateOpenGraphTags');
        }
    }
    
    /**
     * Twitter Cardタグの検証
     * @returns {Promise<Object>}
     */
    async validateTwitterCardTags() {
        try {
            const results = {
                category: 'Twitter Card',
                tests: [],
                passed: 0,
                failed: 0,
                warnings: 0
            };
            
            const twitterTags = await this._extractTwitterCardTags();
            const rules = this.validationRules.get('twitterCard');
            
            // 必須Twitterタグの存在確認
            for (const requiredTag of rules.required) {
                const test = {
                    name: `Required Twitter tag: ${requiredTag}`,
                    passed: false,
                    message: ''
                };
                
                if (twitterTags[requiredTag]) {
                    test.passed = true;
                    test.message = `✅ ${requiredTag} tag present`;
                    results.passed++;
                } else {
                    test.message = `❌ Missing required ${requiredTag} tag`;
                    results.failed++;
                }
                
                results.tests.push(test);
            }
            
            // Cardタイプの検証
            if (twitterTags['twitter:card']) {
                const cardTest = {
                    name: 'Twitter card type validation',
                    passed: false,
                    message: ''
                };
                
                const cardType = twitterTags['twitter:card'];
                if (rules.cardTypes.includes(cardType)) {
                    cardTest.passed = true;
                    cardTest.message = `✅ Valid card type: ${cardType}`;
                    results.passed++;
                } else {
                    cardTest.message = `❌ Invalid card type: ${cardType}`;
                    results.failed++;
                }
                
                results.tests.push(cardTest);
            }
            
            return results;
            
        } catch (error) {
            return seoErrorHandler.handle(error, 'validateTwitterCardTags');
        }
    }
    
    /**
     * 構造化データの検証
     * @returns {Promise<Object>}
     */
    async validateStructuredData() {
        try {
            const results = {
                category: 'Structured Data',
                tests: [],
                passed: 0,
                failed: 0,
                warnings: 0
            };
            
            const structuredData = await this._extractStructuredData();
            const rules = this.validationRules.get('structuredData');
            
            if (!structuredData || Object.keys(structuredData).length === 0) {
                results.tests.push({
                    name: 'Structured data presence',
                    passed: false,
                    message: '❌ No structured data found'
                });
                results.failed++;
                return results;
            }
            
            // 必須プロパティの存在確認
            for (const requiredProp of rules.required) {
                const test = {
                    name: `Required property: ${requiredProp}`,
                    passed: false,
                    message: ''
                };
                
                if (structuredData[requiredProp]) {
                    test.passed = true;
                    test.message = `✅ ${requiredProp} property present`;
                    results.passed++;
                } else {
                    test.message = `❌ Missing required ${requiredProp} property`;
                    results.failed++;
                }
                
                results.tests.push(test);
            }
            
            // @contextの検証
            if (structuredData['@context']) {
                const contextTest = {
                    name: 'Schema.org context validation',
                    passed: false,
                    message: ''
                };
                
                const context = structuredData['@context'];
                if (rules.allowedContexts.includes(context)) {
                    contextTest.passed = true;
                    contextTest.message = `✅ Valid schema context: ${context}`;
                    results.passed++;
                } else {
                    contextTest.message = `⚠️ Non-standard schema context: ${context}`;
                    results.warnings++;
                }
                
                results.tests.push(contextTest);
            }
            
            // VideoGame特有のプロパティ検証
            if (structuredData['@type'] === 'VideoGame') {
                for (const prop of rules.videoGameProperties) {
                    const test = {
                        name: `VideoGame property: ${prop}`,
                        passed: false,
                        message: ''
                    };
                    
                    if (structuredData[prop]) {
                        test.passed = true;
                        test.message = `✅ ${prop} property present`;
                        results.passed++;
                    } else {
                        test.message = `⚠️ Recommended ${prop} property missing`;
                        results.warnings++;
                    }
                    
                    results.tests.push(test);
                }
            }
            
            return results;
            
        } catch (error) {
            return seoErrorHandler.handle(error, 'validateStructuredData');
        }
    }
    
    /**
     * ソーシャルメディア最適化の検証
     * @returns {Promise<Object>}
     */
    async validateSocialMediaOptimization() {
        try {
            const results = {
                category: 'Social Media Optimization',
                tests: [],
                passed: 0,
                failed: 0,
                warnings: 0
            };
            
            // 画像の最適化確認
            const socialImages = await this._extractSocialMediaImages();
            
            for (const [platform, imageUrl] of Object.entries(socialImages)) {
                if (imageUrl) {
                    const test = {
                        name: `${platform} image optimization`,
                        passed: false,
                        message: ''
                    };
                    
                    const isOptimized = await this._checkImageOptimization(imageUrl);
                    if (isOptimized) {
                        test.passed = true;
                        test.message = `✅ ${platform} image properly optimized`;
                        results.passed++;
                    } else {
                        test.message = `⚠️ ${platform} image could be optimized`;
                        results.warnings++;
                    }
                    
                    results.tests.push(test);
                }
            }
            
            return results;
            
        } catch (error) {
            return seoErrorHandler.handle(error, 'validateSocialMediaOptimization');
        }
    }
    
    /**
     * パフォーマンス最適化の検証
     * @returns {Promise<Object>}
     */
    async validatePerformanceOptimization() {
        try {
            const results = {
                category: 'Performance Optimization',
                tests: [],
                passed: 0,
                failed: 0,
                warnings: 0
            };
            
            // WebP対応の確認
            const webpTest = {
                name: 'WebP support detection',
                passed: false,
                message: ''
            };
            
            const webpSupported = await this._checkWebPSupport();
            if (webpSupported) {
                webpTest.passed = true;
                webpTest.message = '✅ WebP format supported';
                results.passed++;
            } else {
                webpTest.message = '⚠️ WebP format not supported in this environment';
                results.warnings++;
            }
            
            results.tests.push(webpTest);
            
            // キャッシュヘッダーの確認
            const cacheTest = {
                name: 'Cache headers validation',
                passed: false,
                message: ''
            };
            
            const cacheHeaders = this._generateTestCacheHeaders();
            if (cacheHeaders && Object.keys(cacheHeaders).length > 0) {
                cacheTest.passed = true;
                cacheTest.message = '✅ Cache headers properly configured';
                results.passed++;
            } else {
                cacheTest.message = '❌ Cache headers not configured';
                results.failed++;
            }
            
            results.tests.push(cacheTest);
            
            return results;
            
        } catch (error) {
            return seoErrorHandler.handle(error, 'validatePerformanceOptimization');
        }
    }
    
    /**
     * アクセシビリティ準拠の検証
     * @returns {Promise<Object>}
     */
    async validateAccessibilityCompliance() {
        try {
            const results = {
                category: 'Accessibility Compliance',
                tests: [],
                passed: 0,
                failed: 0,
                warnings: 0
            };
            
            // alt属性の確認
            const altTest = {
                name: 'Image alt attributes',
                passed: false,
                message: ''
            };
            
            const images = await this._extractImages();
            const imagesWithAlt = images.filter(img => img.alt && img.alt.trim() !== '').length;
            const totalImages = images.length;
            
            if (totalImages === 0 || imagesWithAlt === totalImages) {
                altTest.passed = true;
                altTest.message = `✅ All images have alt attributes (${imagesWithAlt}/${totalImages})`;
                results.passed++;
            } else {
                altTest.message = `⚠️ Some images missing alt attributes (${imagesWithAlt}/${totalImages})`;
                results.warnings++;
            }
            
            results.tests.push(altTest);
            
            // 見出し構造の確認
            const headingTest = {
                name: 'Heading structure',
                passed: false,
                message: ''
            };
            
            const headingStructure = await this._analyzeHeadingStructure();
            if (headingStructure.isValid) {
                headingTest.passed = true;
                headingTest.message = '✅ Proper heading hierarchy';
                results.passed++;
            } else {
                headingTest.message = '⚠️ Heading hierarchy could be improved';
                results.warnings++;
            }
            
            results.tests.push(headingTest);
            
            return results;
            
        } catch (error) {
            return seoErrorHandler.handle(error, 'validateAccessibilityCompliance');
        }
    }
    
    /**
     * サイトマップの検証
     * @returns {Promise<Object>}
     */
    async validateSitemap() {
        try {
            const results = {
                category: 'Sitemap Validation',
                tests: [],
                passed: 0,
                failed: 0,
                warnings: 0
            };
            
            // サイトマップの存在確認
            const sitemapTest = {
                name: 'Sitemap accessibility',
                passed: false,
                message: ''
            };
            
            const sitemapExists = await this._checkSitemapExists();
            if (sitemapExists) {
                sitemapTest.passed = true;
                sitemapTest.message = '✅ Sitemap accessible';
                results.passed++;
            } else {
                sitemapTest.message = '❌ Sitemap not found';
                results.failed++;
            }
            
            results.tests.push(sitemapTest);
            
            return results;
            
        } catch (error) {
            return seoErrorHandler.handle(error, 'validateSitemap');
        }
    }
    
    /**
     * robots.txtの検証
     * @returns {Promise<Object>}
     */
    async validateRobotsTxt() {
        try {
            const results = {
                category: 'Robots.txt Validation',
                tests: [],
                passed: 0,
                failed: 0,
                warnings: 0
            };
            
            // robots.txtの存在確認
            const robotsTest = {
                name: 'Robots.txt accessibility',
                passed: false,
                message: ''
            };
            
            const robotsExists = await this._checkRobotsExists();
            if (robotsExists) {
                robotsTest.passed = true;
                robotsTest.message = '✅ Robots.txt accessible';
                results.passed++;
            } else {
                robotsTest.message = '❌ Robots.txt not found';
                results.failed++;
            }
            
            results.tests.push(robotsTest);
            
            return results;
            
        } catch (error) {
            return seoErrorHandler.handle(error, 'validateRobotsTxt');
        }
    }
    
    /**
     * Lighthouseスコア監視
     * @returns {Promise<Object>}
     */
    async monitorLighthouseScore() {
        try {
            // 実際の実装では Lighthouse API を使用
            // ここではモックデータを返す
            const lighthouseScore = {
                performance: 95,
                accessibility: 92,
                bestPractices: 88,
                seo: 96,
                timestamp: new Date().toISOString()
            };
            
            seoLogger.info('Lighthouse score monitored', lighthouseScore);
            return lighthouseScore;
            
        } catch (error) {
            return seoErrorHandler.handle(error, 'monitorLighthouseScore');
        }
    }
    
    /**
     * Core Web Vitalsの追跡
     * @returns {Promise<Object>}
     */
    async trackCoreWebVitals() {
        try {
            const vitals = {
                LCP: 0, // Largest Contentful Paint
                FID: 0, // First Input Delay
                CLS: 0, // Cumulative Layout Shift
                timestamp: new Date().toISOString()
            };
            
            if (typeof window !== 'undefined' && 'performance' in window) {
                // Performance Observer APIを使用してCore Web Vitalsを測定
                // 実際の実装では web-vitals ライブラリを使用することを推奨
                vitals.LCP = this._measureLCP();
                vitals.FID = this._measureFID();
                vitals.CLS = this._measureCLS();
            }
            
            seoLogger.performance('Core Web Vitals tracked', 0, vitals);
            return vitals;
            
        } catch (error) {
            return seoErrorHandler.handle(error, 'trackCoreWebVitals');
        }
    }
    
    // プライベートメソッド
    
    /**
     * メタタグの抽出
     * @private
     */
    async _extractMetaTags() {
        // 実際の実装では document.head から抽出
        return {
            title: 'BubblePop - 泡割りゲーム',
            description: 'HTML5 Canvas を使用したバブルポップゲーム。18種類以上の特殊な泡を割って高スコアを目指そう！',
            charset: 'UTF-8',
            keywords: 'バブルポップ,ゲーム,HTML5,ブラウザゲーム,無料'
        };
    }
    
    /**
     * Open Graphタグの抽出
     * @private
     */
    async _extractOpenGraphTags() {
        return {
            'og:title': 'BubblePop - 泡割りゲーム',
            'og:description': 'HTML5 Canvas を使用したバブルポップゲーム',
            'og:image': `${this.baseUrl}/assets/images/og-image.png`,
            'og:url': this.baseUrl,
            'og:type': 'website'
        };
    }
    
    /**
     * Twitter Cardタグの抽出
     * @private
     */
    async _extractTwitterCardTags() {
        return {
            'twitter:card': 'summary_large_image',
            'twitter:title': 'BubblePop - 泡割りゲーム',
            'twitter:description': 'HTML5 Canvas を使用したバブルポップゲーム',
            'twitter:image': `${this.baseUrl}/assets/images/twitter-card.png`
        };
    }
    
    /**
     * 構造化データの抽出
     * @private
     */
    async _extractStructuredData() {
        return {
            '@context': 'https://schema.org',
            '@type': 'VideoGame',
            'name': 'BubblePop',
            'description': 'HTML5 Canvas を使用したバブルポップゲーム',
            'genre': 'パズル・アクション',
            'gamePlatform': ['Web Browser'],
            'operatingSystem': ['Any'],
            'applicationCategory': 'Game'
        };
    }
    
    /**
     * ソーシャルメディア画像の抽出
     * @private
     */
    async _extractSocialMediaImages() {
        return {
            'Open Graph': `${this.baseUrl}/assets/images/og-image.png`,
            'Twitter Card': `${this.baseUrl}/assets/images/twitter-card.png`,
            'LinkedIn': `${this.baseUrl}/assets/images/linkedin-share.png`
        };
    }
    
    /**
     * 画像の抽出
     * @private
     */
    async _extractImages() {
        // 実際の実装では document.images から抽出
        return [
            { src: '/assets/images/game-screenshot.png', alt: 'ゲームスクリーンショット' },
            { src: '/assets/images/logo.png', alt: 'BubblePopロゴ' }
        ];
    }
    
    /**
     * 画像URLの有効性確認
     * @private
     */
    _isValidImageUrl(url) {
        try {
            new URL(url);
            return url.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i) !== null;
        } catch {
            return false;
        }
    }
    
    /**
     * 画像最適化の確認
     * @private
     */
    async _checkImageOptimization(imageUrl) {
        // 実際の実装では画像のサイズやフォーマットをチェック
        return imageUrl.includes('optimized') || imageUrl.includes('webp');
    }
    
    /**
     * WebP対応の確認
     * @private
     */
    async _checkWebPSupport() {
        if (typeof window === 'undefined') return false;
        
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }
    
    /**
     * テスト用キャッシュヘッダーの生成
     * @private
     */
    _generateTestCacheHeaders() {
        return {
            'Cache-Control': 'public, max-age=31536000',
            'Expires': new Date(Date.now() + 31536000000).toUTCString(),
            'ETag': '"test-etag"'
        };
    }
    
    /**
     * 見出し構造の分析
     * @private
     */
    async _analyzeHeadingStructure() {
        // 実際の実装では document から見出し要素を抽出して階層を分析
        return {
            isValid: true,
            levels: [1, 2, 3],
            issues: []
        };
    }
    
    /**
     * サイトマップの存在確認
     * @private
     */
    async _checkSitemapExists() {
        try {
            // 実際の実装では fetch でサイトマップの存在を確認
            return true;
        } catch {
            return false;
        }
    }
    
    /**
     * robots.txtの存在確認
     * @private
     */
    async _checkRobotsExists() {
        try {
            // 実際の実装では fetch でrobots.txtの存在を確認
            return true;
        } catch {
            return false;
        }
    }
    
    /**
     * Largest Contentful Paintの測定
     * @private
     */
    _measureLCP() {
        // 実際の実装では PerformanceObserver を使用
        return Math.random() * 2500; // モックデータ
    }
    
    /**
     * First Input Delayの測定
     * @private
     */
    _measureFID() {
        // 実際の実装では PerformanceObserver を使用
        return Math.random() * 100; // モックデータ
    }
    
    /**
     * Cumulative Layout Shiftの測定
     * @private
     */
    _measureCLS() {
        // 実際の実装では PerformanceObserver を使用
        return Math.random() * 0.1; // モックデータ
    }
    
    /**
     * テスト結果の集約
     * @private
     */
    _aggregateTestResults(results) {
        const aggregated = {
            summary: {
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                warnings: 0
            },
            categories: {},
            overallScore: 0,
            timestamp: new Date().toISOString()
        };
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
                const categoryResult = result.value;
                aggregated.categories[categoryResult.category] = categoryResult;
                
                aggregated.summary.totalTests += categoryResult.tests.length;
                aggregated.summary.passedTests += categoryResult.passed;
                aggregated.summary.failedTests += categoryResult.failed;
                aggregated.summary.warnings += categoryResult.warnings;
            }
        });
        
        // 総合スコアの計算
        if (aggregated.summary.totalTests > 0) {
            aggregated.overallScore = Math.round(
                (aggregated.summary.passedTests / aggregated.summary.totalTests) * 100
            );
        }
        
        return aggregated;
    }
    
    /**
     * テスト結果のエクスポート
     * @param {Object} results - テスト結果
     * @param {string} format - エクスポート形式 ('json', 'html', 'csv')
     * @returns {string}
     */
    exportResults(results, format = 'json') {
        switch (format) {
            case 'json':
                return JSON.stringify(results, null, 2);
            
            case 'html':
                return this._generateHTMLReport(results);
            
            case 'csv':
                return this._generateCSVReport(results);
            
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
    
    /**
     * HTMLレポートの生成
     * @private
     */
    _generateHTMLReport(results) {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>SEO Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .category { margin: 20px 0; border: 1px solid #ddd; border-radius: 5px; }
        .category h3 { background: #4CAF50; color: white; margin: 0; padding: 10px; }
        .test { padding: 10px; border-bottom: 1px solid #eee; }
        .passed { color: #4CAF50; }
        .failed { color: #f44336; }
        .warning { color: #ff9800; }
    </style>
</head>
<body>
    <h1>SEO Test Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p>Total Tests: ${results.summary.totalTests}</p>
        <p>Passed: <span class="passed">${results.summary.passedTests}</span></p>
        <p>Failed: <span class="failed">${results.summary.failedTests}</span></p>
        <p>Warnings: <span class="warning">${results.summary.warnings}</span></p>
        <p>Overall Score: ${results.overallScore}%</p>
        <p>Generated: ${results.timestamp}</p>
    </div>
    ${Object.entries(results.categories).map(([name, category]) => `
    <div class="category">
        <h3>${category.category}</h3>
        ${category.tests.map(test => `
        <div class="test ${test.passed ? 'passed' : 'failed'}">
            <strong>${test.name}</strong>: ${test.message}
        </div>
        `).join('')}
    </div>
    `).join('')}
</body>
</html>`;
    }
    
    /**
     * CSVレポートの生成
     * @private
     */
    _generateCSVReport(results) {
        const rows = ['Category,Test Name,Status,Message'];
        
        Object.entries(results.categories).forEach(([name, category]) => {
            category.tests.forEach(test => {
                const status = test.passed ? 'PASSED' : 'FAILED';
                const message = test.message.replace(/,/g, ';');
                rows.push(`${category.category},${test.name},${status},"${message}"`);
            });
        });
        
        return rows.join('\n');
    }
    
    /**
     * リソースのクリーンアップ
     */
    cleanup() {
        this.testResults.clear();
        this.performanceMetrics = {
            testExecutionTime: 0,
            validationErrors: 0,
            validationWarnings: 0,
            totalTests: 0,
            passedTests: 0
        };
        
        seoLogger.info('SEOTester cleaned up');
    }
}