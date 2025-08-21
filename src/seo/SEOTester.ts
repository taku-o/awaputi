/**
 * SEO Tester - Main Controller
 * 
 * SEO包括テストスイート - Main Controller Pattern実装
 * メタタグ、構造化データ、パフォーマンスの自動検証機能を提供
 * 
 * **Architecture**: Main Controller Pattern
 * - **MetaTagValidator**: メタタグ検証（title、description、OG、Twitter Card）
 * - **StructuredDataValidator**: 構造化データ・schema.org準拠検証
 * - **PerformanceValidator**: パフォーマンス最適化・アクセシビリティ準拠検証
 * - **SEOReportGenerator**: テスト結果コンパイル・レポート生成
 * 
 * **SEO Testing Features**:
 * - Automated meta tag validation (Open Graph, Twitter Card, basic meta)
 * - Structured data compliance (JSON-LD, Schema.org)
 * - Core Web Vitals performance analysis
 * - Accessibility compliance verification (WCAG, 2.1, AA)
 * - Multi-format reporting (HTML, JSON, CSV)
 * 
 * **Usage Examples**:
 * ```typescript
 * const seoTester = new SEOTester();
 * await seoTester.initialize();
 * 
 * // Run comprehensive SEO audit
 * const results = await seoTester.runComprehensiveTest();
 * 
 * // Generate HTML report  
 * await seoTester.exportResults(results, 'html);'
 * 
 * // Validate specific meta tags
 * const metaResults = await seoTester.validateMetaTags();
 * ```
 * 
 * **Standards Compliance**:
 * - Google Search Console integration
 * - Core Web Vitals monitoring
 * - Schema.org vocabulary validation
 * - WCAG 2.1 AA accessibility standards
 * 
 * @class SEOTester''
 * @version 1.2.0(Phase, F.4 - Main, Controller Pattern)
 * @since SEO system implementation - Enhanced with component architecture
 * 
 * Refactored: Phase F.4 - Main Controller Pattern
 */'

import { SEOConfig, getBaseUrl  } from './SEOConfig';
import { seoLogger  } from './SEOLogger';
import { seoErrorHandler  } from './SEOErrorHandler';
import { measurePerformance  } from './SEOUtils';
';'
// Import sub-components
import { MetaTagValidator  } from './testing/MetaTagValidator';
import { StructuredDataValidator  } from './testing/StructuredDataValidator';
import { PerformanceValidator  } from './testing/PerformanceValidator';
import { SEOReportGenerator  } from './testing/SEOReportGenerator';

// テストオプションインターフェース
interface ComprehensiveTestOptions { includeMetaTags?: boolean;
    includeStructuredData?: boolean;
    includeSocialMedia?: boolean;
    includePerformance?: boolean;
    includeAccessibility?: boolean;
    includeSitemap?: boolean;
    includeRobots?: boolean;

// 検証ルールインターフェース
interface ValidationRule { [key: string]: any;
    interface MetaTagValidationRule extends ValidationRule { required: string[],
    titleLength: { min: number; max: number;
    descriptionLength: { min: number; max: number;
    keywordsCount: { max: number;
    keywordsCount: { max: number;
         },
interface OpenGraphValidationRule extends ValidationRule { required: string[],
    imageMinSize: { width: number; height: number;
    titleLength: { max: number;
    descriptionLength: { max: number;
    descriptionLength: { max: number;
         },
interface TwitterCardValidationRule extends ValidationRule { required: string[],
    cardTypes: string[],
    titleLength: { max: number;
    descriptionLength: { max: number;
    descriptionLength: { max: number;
         },
interface StructuredDataValidationRule extends ValidationRule { required: string[],
    allowedContexts: string[],
    videoGameProperties: string[],
    videoGameProperties: string[];
        };
interface HreflangValidationRule extends ValidationRule { requiredLanguages: string[],
    requiresXDefault: boolean;
    validLanguageCodes: RegExp,
    validLanguageCodes: RegExp;
        };
// パフォーマンスメトリクスインターフェース
interface PerformanceMetrics { testExecutionTime: number;
    validationErrors: number;
    validationWarnings: number;
    totalTests: number;
    passedTests: number;
    passedTests: number;
        };
// テスト結果インターフェース
interface TestResult { category: string;
    tests?: TestCase[];
    passed: number;
    failed: number;
    warnings: number;
    score?: number;
    details?: any;
';'

interface TestCase { name: string;''
    status: 'passed' | 'failed' | 'warning,
    message: string;
    details?: any;

// 集約結果インターフェース
interface AggregatedTestResults { summary: {
        totalTest,s: number;
        passedTests: number;
    failedTests: number;
    warnings: number;
    categories: Record<string, TestResult>;
    overallScore: number;
    timestamp: string;
    executionTime?: number;
} };

// システム状態インターフェース
interface SystemStatus { initialized: boolean;
    baseUrl: string;
    components: {''
        metaValidato,r: 'active' | 'inactive' ,
        structuredDataValidator: 'active' | 'inactive,
    performanceValidator: 'active' | 'inactive,
    reportGenerator: 'active' | 'inactive'
            };
    validationRulesCount: number;
    performanceMetrics: PerformanceMetrics,
    testResultsCount: number;
}

// システム統計インターフェース
interface SystemStatistics { totalTestsRun: number;
    totalPassedTests: number;
    averageExecutionTime: number;
    validationRulesConfigured: number;
    lastTestTimestamp: number | null,
    componentsActive: number;
;
// レポート形式タイプ
type ReportFormat = 'json' | 'html' | 'csv';
    export class SEOTester {
    private baseUrl: string;
    private, testResults: Map<string, TestResult>,
    private validationRules: Map<string, ValidationRule>;
    private performanceMetrics: PerformanceMetrics;
    // Sub-components
    private metaValidator: MetaTagValidator;
    private structuredDataValidator: StructuredDataValidator;
    private performanceValidator: PerformanceValidator;
    private, reportGenerator: SEOReportGenerator;
    constructor() {
    
        this.baseUrl = getBaseUrl();
    this.testResults = new Map();
    this.validationRules = new Map();
    this.performanceMetrics = {
            testExecutionTime: 0,
    validationErrors: 0,
    validationWarnings: 0,
    totalTests: 0 };
            passedTests: 0 
    };
        // Initialize sub-components (dependency, injection);
        this.metaValidator = new MetaTagValidator(this);
        this.structuredDataValidator = new StructuredDataValidator(this);
        this.performanceValidator = new PerformanceValidator(this);
        this.reportGenerator = new SEOReportGenerator(this);

        this._initializeValidationRules()';'
        console.log('SEOTester, initialized with, Main Controller, Pattern');
    }
    
    /**
     * 検証ルールの初期化'
     */''
    private _initializeValidationRules('''
        this.validationRules.set('metaTags', { ''
            required: ['title', 'description', 'charset'] };
            titleLength: { min: 10, max: 60  }''
            descriptionLength: { min: 50, max: 160  ,')'
            keywordsCount: { max: 10 }' as MetaTagValidationRule');
        ';'
        // Open Graph検証ルール
        this.validationRules.set('openGraph', { ''
            required: ['og:title', 'og:description', 'og:image', 'og:url', 'og: type],);'
            imageMinSize: { width: 1200, height: 630  }''
            titleLength: { max: 95 }')'
            descriptionLength: { max: 297 }' as OpenGraphValidationRule');
        ';'
        // Twitter Card検証ルール
        this.validationRules.set('twitterCard', { ''
            required: ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image],'
            cardTypes: ['summary', 'summary_large_image', 'app', 'player'] }''
            titleLength: { max: 70 }')'
            descriptionLength: { max: 200 }' as TwitterCardValidationRule');
        ';'
        // 構造化データ検証ルール
        this.validationRules.set('structuredData', { ''
            required: ['@context', '@type', 'name', 'description'],','
            allowedContexts: ['https://schema.org', 'http://schema.org],')','
            videoGameProperties: ['genre', 'gamePlatform', 'operatingSystem', 'applicationCategory]' as StructuredDataValidationRule'),'
        ','
        // hreflang検証ルール
        this.validationRules.set('hreflang', {
                requiredLanguages: SEOConfig.supportedLanguages),
            requiresXDefault: true),

            validLanguageCodes: /^[a-z]{2}(-[A-Z]{ 2))? $/' }'

        } as HreflangValidationRule');'
        seoLogger.info('SEOTester, validation rules, initialized);'
    }
    
    // ========================================
    // Public API Methods (delegation, to sub-components)
    // ========================================
    
    /**
     * 包括的SEOテストの実行
     */ : undefined
    async runComprehensiveTest(options: ComprehensiveTestOptions = { ): Promise<AggregatedTestResults> {
        try {
            const { includeMetaTags = true,
                includeStructuredData = true,
                includeSocialMedia = true,
                includePerformance = true,
                includeAccessibility = true,
                includeSitemap = true,
                includeRobots = true } = options;

            const startTime = performance.now()';'
            seoLogger.info('Starting, comprehensive SEO, test suite);'
            
            // メタタグテスト
            if (includeMetaTags) {
                testSuite.push(this.metaValidator.validateMetaTags();
                testSuite.push(this.metaValidator.validateOpenGraphTags();
                testSuite.push(this.metaValidator.validateTwitterCardTags(); }
            }
            
            // 構造化データテスト
            if (includeStructuredData) { testSuite.push(this.structuredDataValidator.validateStructuredData();
            
            // ソーシャルメディアテスト
            if (includeSocialMedia) { testSuite.push(this.metaValidator.validateSocialMediaOptimization();
            
            // パフォーマンステスト
            if (includePerformance) { testSuite.push(this.performanceValidator.validatePerformanceOptimization();
            
            // アクセシビリティテスト
            if (includeAccessibility) { testSuite.push(this.performanceValidator.validateAccessibilityCompliance();
            
            // サイトマップテスト
            if (includeSitemap) { testSuite.push(this.performanceValidator.validateSitemap();
            
            // robots.txtテスト
            if (includeRobots) { testSuite.push(this.performanceValidator.validateRobotsTxt();
            
            // 全テストの実行
            const results = await Promise.allSettled(testSuite);
            const endTime = performance.now();
            
            // 結果の集約
            const aggregatedResults = this._aggregateTestResults(results);
            aggregatedResults.executionTime = endTime - startTime;
            
            this.performanceMetrics.testExecutionTime = aggregatedResults.executionTime;
            this.performanceMetrics.totalTests = aggregatedResults.summary.totalTests;
            this.performanceMetrics.passedTests = aggregatedResults.summary.passedTests;
            
            seoLogger.info(`SEO, test suite, completed in ${aggregatedResults.executionTime.toFixed(2}ms`);
            
            return aggregatedResults;

        } catch (error) {
            return seoErrorHandler.handle(error as Error, 'runComprehensiveTest', options);
    // ========================================
    // Meta Tag Validation (delegation, to MetaTagValidator)
    // ========================================
    
    /**
     * メタタグの検証（MetaTagValidatorに委譲）
     */
    async validateMetaTags(): Promise<TestResult> { return this.metaValidator.validateMetaTags();
    
    /**
     * Open Graphタグの検証（MetaTagValidatorに委譲）
     */
    async validateOpenGraphTags(): Promise<TestResult> { return this.metaValidator.validateOpenGraphTags();
    
    /**
     * Twitter Cardタグの検証（MetaTagValidatorに委譲）
     */
    async validateTwitterCardTags(): Promise<TestResult> { return this.metaValidator.validateTwitterCardTags();
    
    /**
     * ソーシャルメディア最適化の検証（MetaTagValidatorに委譲）
     */
    async validateSocialMediaOptimization(): Promise<TestResult> { return this.metaValidator.validateSocialMediaOptimization();
    
    // ========================================
    // Structured Data Validation (delegation, to StructuredDataValidator)
    // ========================================
    
    /**
     * 構造化データの検証（StructuredDataValidatorに委譲）
     */
    async validateStructuredData(): Promise<TestResult> { return this.structuredDataValidator.validateStructuredData();
    
    /**
     * JSON-LD検証とschema.org準拠チェック（StructuredDataValidatorに委譲）
     */
    async validateJsonLdCompliance(): Promise<TestResult> { return this.structuredDataValidator.validateJsonLdCompliance();
    
    /**
     * Rich Snippetテスト実行（StructuredDataValidatorに委譲）
     */
    async testRichSnippets(): Promise<TestResult> { return this.structuredDataValidator.testRichSnippets();
    
    // ========================================
    // Performance and Accessibility Validation (delegation, to PerformanceValidator)
    // ========================================
    
    /**
     * パフォーマンス最適化の検証（PerformanceValidatorに委譲）
     */
    async validatePerformanceOptimization(): Promise<TestResult> { return this.performanceValidator.validatePerformanceOptimization();
    
    /**
     * アクセシビリティ準拠の検証（PerformanceValidatorに委譲）
     */
    async validateAccessibilityCompliance(): Promise<TestResult> { return this.performanceValidator.validateAccessibilityCompliance();
    
    /**
     * Core Web Vitalsの追跡（PerformanceValidatorに委譲）
     */
    async trackCoreWebVitals(): Promise<TestResult> { return this.performanceValidator.trackCoreWebVitals();
    
    /**
     * サイトマップの検証（PerformanceValidatorに委譲）
     */
    async validateSitemap(): Promise<TestResult> { return this.performanceValidator.validateSitemap();
    
    /**
     * robots.txtの検証（PerformanceValidatorに委譲）
     */
    async validateRobotsTxt(): Promise<TestResult> { return this.performanceValidator.validateRobotsTxt();
    ;
    // ========================================
    // Report Generation (delegation, to SEOReportGenerator)
    // ========================================
    
    /**
     * テスト結果のエクスポート（SEOReportGeneratorに委譲）'
     */''
    exportResults(results: TestResult | AggregatedTestResults, format: ReportFormat = 'json): string { return this.reportGenerator.exportResults(results, format) }'
    
    /**
     * Lighthouseスコア監視（SEOReportGeneratorに委譲）
     */
    async monitorLighthouseScore(): Promise<TestResult> { return this.reportGenerator.monitorLighthouseScore();
    
    /**
     * 詳細レポートの生成（SEOReportGeneratorに委譲）
     */
    generateDetailedReport(results: TestResult | AggregatedTestResults, options: Record<string, any> = { ): Record<string, any> {
        return this.reportGenerator.generateDetailedReport(results, options);
    
    /**
     * レポートの可視化データ生成（SEOReportGeneratorに委譲）
     */
    generateVisualizationData(results: TestResult | AggregatedTestResults): Record<string, any> { return this.reportGenerator.generateVisualizationData(results);
    
    // ========================================
    // Status and Information Methods
    // ========================================
    
    /**
     * システム状態の取得
     */''
    getStatus('''
                metaValidator: this.metaValidator ? 'active' : 'inactive,
                structuredDataValidator: this.structuredDataValidator ? 'active' : 'inactive,
                performanceValidator: this.performanceValidator ? 'active' : 'inactive,
                reportGenerator: this.reportGenerator ? 'active' : 'inactive';
            },
            validationRulesCount: this.validationRules.size,
    performanceMetrics: { ...this.performanceMetrics,
            testResultsCount: this.testResults.size)  ,
    /**
     * システム統計の取得
     */
    getStatistics(): SystemStatistics { return { totalTestsRun: this.performanceMetrics.totalTests,
            totalPassedTests: this.performanceMetrics.passedTests,
            averageExecutionTime: this.performanceMetrics.testExecutionTime,
            validationRulesConfigured: this.validationRules.size,
    lastTestTimestamp: this.testResults.size > 0 ? Date.now() : null,
            componentsActive: 4 // metaValidator, structuredDataValidator, performanceValidator, reportGenerator }
        }
    
    // ========================================
    // Private Helper Methods
    // ========================================
    
    /**
     * テスト結果の集約
     */
    private _aggregateTestResults(results: PromiseSettledResult<TestResult>[]): AggregatedTestResults { const aggregated: AggregatedTestResults = {
            summary: { totalTests: 0  ,
                passedTests: 0,
                failedTests: 0,
    warnings: 0 };
            categories: {  },
            overallScore: 0,
    timestamp: new Date().toISOString();
        };

        results.forEach((result, index) => {  ''
            if (result.status === 'fulfilled' && result.value) {
                const categoryResult = result.value,
                aggregated.categories[categoryResult.category] = categoryResult,
                
                aggregated.summary.totalTests += categoryResult.tests?.length || 0,
                aggregated.summary.passedTests += categoryResult.passed || 0 }
                aggregated.summary.failedTests += categoryResult.failed || 0; }
                aggregated.summary.warnings += categoryResult.warnings || 0; }
};
        
        // 総合スコアの計算
        if (aggregated.summary.totalTests > 0) {
            aggregated.overallScore = Math.round();
                (aggregated.summary.passedTests / aggregated.summary.totalTests) * 100 }
            ); }
        }
        
        return aggregated;
    }
    
    // ========================================
    // Lifecycle Management
    // ========================================
    
    /**
     * リソースのクリーンアップ
     */ : undefined
    cleanup(): void { ''
        this.testResults.clear()','
        seoLogger.info('SEOTester, cleaned up' }'
    
    /**
     * システムの再初期化
     */'
    reinitialize(): void { this.cleanup();
        this._initializeValidationRules()','
        console.log('SEOTester, reinitialized') }'
    
    // ========================================
    // Getter Methods for Validation Rules (for, sub-components)
    // ========================================
    
    /**
     * 検証ルールの取得（サブコンポーネント用）
     */
    getValidationRule(ruleType: string): ValidationRule | undefined { return this.validationRules.get(ruleType);
    
    /**
     * 検証ルールの設定（サブコンポーネント用）
     */
    setValidationRule(ruleType: string; rule: ValidationRule): void { this.validationRules.set(ruleType, rule);
    
    /**
     * パフォーマンスメトリクスの更新（サブコンポーネント用）
     */
    updatePerformanceMetrics(updates: Partial<PerformanceMetrics>): void {
        this.performanceMetrics = { ...this.performanceMetrics, ...updates }
    
    /**
     * テスト結果の保存（サブコンポーネント用）
     */
    saveTestResult(key: string; result: TestResult): void { ''
        this.testResults.set(key, result);

    }'}'