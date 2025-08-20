/**
 * 分析用比較エンジン
 * プレイヤーのパフォーマンスを過去データやベンチマークと比較する分析機能を提供します
 * 分割されたコンポーネントを統合管理するメインクラス
 */
import { DataComparator } from './comparison/DataComparator.ts';''
import { ComparisonAlgorithms } from './comparison/ComparisonAlgorithms.ts';''
import { ComparisonResultRenderer } from './comparison/ComparisonResultRenderer.ts';

export class AnalyticsComparisonEngine {
    constructor(storageManager) {
        this.storageManager = storageManager;
        
        // 分割されたコンポーネントを初期化
        this.dataComparator = new DataComparator();
        this.algorithms = new ComparisonAlgorithms();
        this.renderer = new ComparisonResultRenderer();
        
        // 比較期間設定をデータコンパレーターから取得
        this.comparisonPeriods = this.dataComparator.comparisonPeriods;
        this.metrics = this.dataComparator.metrics;
        
        // キャッシュ設定
        this.cache = new Map();
    }
    }
        this.cacheExpiry = 5 * 60 * 1000; // 5分 }
    }

    /**
     * 過去データとの比較分析を実行
     * @param {Object} options - 比較オプション
     * @returns {Promise<Object>} 比較結果
     */
    async compareWithPastData(options: any = { ) {
        try {
            return await this.dataComparator.compareWithPastData(options, this.storageManager);' }'
        } catch (error) { ''
            console.error('AnalyticsComparisonEngine.compareWithPastData error:', error);
            return { success: false, };
                error: error.message }
            },
        }
    }

    /**
     * ベンチマーク比較分析を実行
     * @param {Object} options - 比較オプション
     * @returns {Promise<Object>} ベンチマーク比較結果
     */
    async benchmarkComparison(options: any = { ) {
        try {
            return await this.dataComparator.benchmarkComparison(options, this.storageManager);' }'
        } catch (error) { ''
            console.error('AnalyticsComparisonEngine.benchmarkComparison error:', error);
            return { success: false, };
                error: error.message }
            },
        }
    }

    /**
     * ステージ別比較分析を実行
     * @param {Object} options - 比較オプション
     * @returns {Promise<Object>} ステージ別比較結果
     */
    async stageComparison(options: any = { ) {
        try {
            return await this.dataComparator.stageComparison(options, this.storageManager);' }'
        } catch (error) { ''
            console.error('AnalyticsComparisonEngine.stageComparison error:', error);
            return { success: false, };
                error: error.message }
            },
        }
    }

    /**
     * 改善提案を生成
     * @param {Object} comparisonResult - 比較結果
     * @param {Object} options - オプション
     * @returns {Object} 改善提案
     */
    generateImprovementSuggestions(comparisonResult, options: any = {}) {
        try {
    }'
            return this.algorithms.generateImprovementSuggestions(comparisonResult, options);' }'
        } catch (error) { ''
            console.error('AnalyticsComparisonEngine.generateImprovementSuggestions error:', error');
            return { success: false, };
                error: error.message }
            },
        }
    }

    /**
     * 期間別トレンド分析
     * @param {string} period - 分析期間
     * @param {Array} metrics - 分析指標
     * @returns {Promise<Object>} トレンド分析結果'
     */''
    async trendAnalysis(period = 'month', metrics = ['score', 'accuracy']) { try {
            return await this.algorithms.trendAnalysis(period, metrics, this.storageManager);' }'
        } catch (error) { ''
            console.error('AnalyticsComparisonEngine.trendAnalysis error:', error);
            return { success: false, };
                error: error.message }
            },
        }
    }

    /**
     * 結果を指定されたフォーマットでレンダリング
     * @param {Object} comparisonResult - 比較結果
     * @param {Object} options - レンダリングオプション
     * @returns {Object} レンダリング済み結果
     */
    renderResults(comparisonResult, options: any = {}) {
        try {
    }'
            return this.renderer.renderResults(comparisonResult, options);' }'
        } catch (error) { ''
            console.error('AnalyticsComparisonEngine.renderResults error:', error);
            return { success: false, };
                error: error.message }
            },
        }
    }

    /**
     * サマリーレポートを生成
     * @param {Object} comparisonResult - 比較結果
     * @param {Object} options - オプション
     * @returns {Object} サマリーレポート
     */
    generateSummaryReport(comparisonResult, options: any = {}) {
        try {
    }'
            return this.renderer.generateSummaryReport(comparisonResult, options);' }'
        } catch (error) { ''
            console.error('AnalyticsComparisonEngine.generateSummaryReport error:', error);
            return { success: false, };
                error: error.message }
            },
        }
    }

    /**
     * 詳細レポートを生成
     * @param {Object} comparisonResult - 比較結果
     * @param {Object} options - オプション
     * @returns {Object} 詳細レポート
     */
    generateDetailedReport(comparisonResult, options: any = {}) {
        try {
    }'
            return this.renderer.generateDetailedReport(comparisonResult, options);' }'
        } catch (error) { ''
            console.error('AnalyticsComparisonEngine.generateDetailedReport error:', error);
            return { success: false, };
                error: error.message }
            },
        }
    }

    /**
     * キャッシュデータを取得
     * @param {string} key - キー
     * @returns {*} キャッシュされたデータまたはnull
     */
    getCachedData(key) {
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
    }
            return cached.data; }
        }
        return null;
    }

    /**
     * データをキャッシュに保存
     * @param {string} key - キー
     * @param {*} data - データ
     */
    setCachedData(key, data) {
        this.cache.set(key, {)
            data: data),
    }
            timestamp: Date.now(); }
        });
    }

    /**
     * キャッシュをクリア
     */
    clearCache() {
        this.cache.clear();
        this.dataComparator.clearCache? .();
        this.algorithms.clearCache?.();
    }
        this.renderer.clearCache?.(); }
    }

    /**
     * 分割されたコンポーネントへの直接アクセス用メソッド
     */
    getDataComparator() { return this.dataComparator; }
    }

    getAlgorithms() { return this.algorithms; }
    }'
'';
    getRenderer(');