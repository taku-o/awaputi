/**
 * SEO Tester - Main Controller
 * 
 * SEO包括テストスイート - Main Controller Pattern実装
 * メタタグ、構造化データ、パフォーマンスの自動検証機能を提供
 * 
 * Refactored: Phase F.4 - Main Controller Pattern
 */

import { SEOConfig, getBaseUrl } from '../SEOConfig.js';
import { seoLogger } from '../SEOLogger.js';
import { seoErrorHandler } from '../SEOErrorHandler.js';
import { measurePerformance } from '../SEOUtils.js';

// Import sub-components
import { MetaTagValidator } from './MetaTagValidator.js';
import { StructuredDataValidator } from './StructuredDataValidator.js';
import { PerformanceValidator } from './PerformanceValidator.js';
import { SEOReportGenerator } from './SEOReportGenerator.js';

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
        
        // Initialize sub-components (dependency injection)
        this.metaValidator = new MetaTagValidator(this);
        this.structuredDataValidator = new StructuredDataValidator(this);
        this.performanceValidator = new PerformanceValidator(this);
        this.reportGenerator = new SEOReportGenerator(this);
        
        this._initializeValidationRules();
        
        console.log('SEOTester initialized with Main Controller Pattern');
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
    
    // ========================================
    // Public API Methods (delegation to sub-components)
    // ========================================
    
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
                testSuite.push(this.metaValidator.validateMetaTags());
                testSuite.push(this.metaValidator.validateOpenGraphTags());
                testSuite.push(this.metaValidator.validateTwitterCardTags());
            }
            
            // 構造化データテスト
            if (includeStructuredData) {
                testSuite.push(this.structuredDataValidator.validateStructuredData());
            }
            
            // ソーシャルメディアテスト
            if (includeSocialMedia) {
                testSuite.push(this.metaValidator.validateSocialMediaOptimization());
            }
            
            // パフォーマンステスト
            if (includePerformance) {
                testSuite.push(this.performanceValidator.validatePerformanceOptimization());
            }
            
            // アクセシビリティテスト
            if (includeAccessibility) {
                testSuite.push(this.performanceValidator.validateAccessibilityCompliance());
            }
            
            // サイトマップテスト
            if (includeSitemap) {
                testSuite.push(this.performanceValidator.validateSitemap());
            }
            
            // robots.txtテスト
            if (includeRobots) {
                testSuite.push(this.performanceValidator.validateRobotsTxt());
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
    
    // ========================================
    // Meta Tag Validation (delegation to MetaTagValidator)
    // ========================================
    
    /**
     * メタタグの検証（MetaTagValidatorに委譲）
     * @returns {Promise<Object>}
     */
    async validateMetaTags() {
        return this.metaValidator.validateMetaTags();
    }
    
    /**
     * Open Graphタグの検証（MetaTagValidatorに委譲）
     * @returns {Promise<Object>}
     */
    async validateOpenGraphTags() {
        return this.metaValidator.validateOpenGraphTags();
    }
    
    /**
     * Twitter Cardタグの検証（MetaTagValidatorに委譲）
     * @returns {Promise<Object>}
     */
    async validateTwitterCardTags() {
        return this.metaValidator.validateTwitterCardTags();
    }
    
    /**
     * ソーシャルメディア最適化の検証（MetaTagValidatorに委譲）
     * @returns {Promise<Object>}
     */
    async validateSocialMediaOptimization() {
        return this.metaValidator.validateSocialMediaOptimization();
    }
    
    // ========================================
    // Structured Data Validation (delegation to StructuredDataValidator)
    // ========================================
    
    /**
     * 構造化データの検証（StructuredDataValidatorに委譲）
     * @returns {Promise<Object>}
     */
    async validateStructuredData() {
        return this.structuredDataValidator.validateStructuredData();
    }
    
    /**
     * JSON-LD検証とschema.org準拠チェック（StructuredDataValidatorに委譲）
     * @returns {Promise<Object>}
     */
    async validateJsonLdCompliance() {
        return this.structuredDataValidator.validateJsonLdCompliance();
    }
    
    /**
     * Rich Snippetテスト実行（StructuredDataValidatorに委譲）
     * @returns {Promise<Object>}
     */
    async testRichSnippets() {
        return this.structuredDataValidator.testRichSnippets();
    }
    
    // ========================================
    // Performance and Accessibility Validation (delegation to PerformanceValidator)
    // ========================================
    
    /**
     * パフォーマンス最適化の検証（PerformanceValidatorに委譲）
     * @returns {Promise<Object>}
     */
    async validatePerformanceOptimization() {
        return this.performanceValidator.validatePerformanceOptimization();
    }
    
    /**
     * アクセシビリティ準拠の検証（PerformanceValidatorに委譲）
     * @returns {Promise<Object>}
     */
    async validateAccessibilityCompliance() {
        return this.performanceValidator.validateAccessibilityCompliance();
    }
    
    /**
     * Core Web Vitalsの追跡（PerformanceValidatorに委譲）
     * @returns {Promise<Object>}
     */
    async trackCoreWebVitals() {
        return this.performanceValidator.trackCoreWebVitals();
    }
    
    /**
     * サイトマップの検証（PerformanceValidatorに委譲）
     * @returns {Promise<Object>}
     */
    async validateSitemap() {
        return this.performanceValidator.validateSitemap();
    }
    
    /**
     * robots.txtの検証（PerformanceValidatorに委譲）
     * @returns {Promise<Object>}
     */
    async validateRobotsTxt() {
        return this.performanceValidator.validateRobotsTxt();
    }
    
    // ========================================
    // Report Generation (delegation to SEOReportGenerator)
    // ========================================
    
    /**
     * テスト結果のエクスポート（SEOReportGeneratorに委譲）
     * @param {Object} results - テスト結果
     * @param {string} format - エクスポート形式 ('json', 'html', 'csv')
     * @returns {string}
     */
    exportResults(results, format = 'json') {
        return this.reportGenerator.exportResults(results, format);
    }
    
    /**
     * Lighthouseスコア監視（SEOReportGeneratorに委譲）
     * @returns {Promise<Object>}
     */
    async monitorLighthouseScore() {
        return this.reportGenerator.monitorLighthouseScore();
    }
    
    /**
     * 詳細レポートの生成（SEOReportGeneratorに委譲）
     * @param {Object} results - テスト結果
     * @param {Object} options - レポートオプション
     * @returns {Object}
     */
    generateDetailedReport(results, options = {}) {
        return this.reportGenerator.generateDetailedReport(results, options);
    }
    
    /**
     * レポートの可視化データ生成（SEOReportGeneratorに委譲）
     * @param {Object} results - テスト結果
     * @returns {Object}
     */
    generateVisualizationData(results) {
        return this.reportGenerator.generateVisualizationData(results);
    }
    
    // ========================================
    // Status and Information Methods
    // ========================================
    
    /**
     * システム状態の取得
     * @returns {Object}
     */
    getStatus() {
        return {
            initialized: true,
            baseUrl: this.baseUrl,
            components: {
                metaValidator: this.metaValidator ? 'active' : 'inactive',
                structuredDataValidator: this.structuredDataValidator ? 'active' : 'inactive',
                performanceValidator: this.performanceValidator ? 'active' : 'inactive',
                reportGenerator: this.reportGenerator ? 'active' : 'inactive'
            },
            validationRulesCount: this.validationRules.size,
            performanceMetrics: { ...this.performanceMetrics },
            testResultsCount: this.testResults.size
        };
    }
    
    /**
     * システム統計の取得
     * @returns {Object}
     */
    getStatistics() {
        return {
            totalTestsRun: this.performanceMetrics.totalTests,
            totalPassedTests: this.performanceMetrics.passedTests,
            averageExecutionTime: this.performanceMetrics.testExecutionTime,
            validationRulesConfigured: this.validationRules.size,
            lastTestTimestamp: this.testResults.size > 0 ? Date.now() : null,
            componentsActive: 4 // metaValidator, structuredDataValidator, performanceValidator, reportGenerator
        };
    }
    
    // ========================================
    // Private Helper Methods
    // ========================================
    
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
                
                aggregated.summary.totalTests += categoryResult.tests?.length || 0;
                aggregated.summary.passedTests += categoryResult.passed || 0;
                aggregated.summary.failedTests += categoryResult.failed || 0;
                aggregated.summary.warnings += categoryResult.warnings || 0;
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
    
    // ========================================
    // Lifecycle Management
    // ========================================
    
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
    
    /**
     * システムの再初期化
     */
    reinitialize() {
        this.cleanup();
        this._initializeValidationRules();
        
        // Sub-components are already initialized in constructor
        console.log('SEOTester reinitialized');
    }
}