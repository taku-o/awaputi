/**
 * データ圧縮管理クラス
 * 古い統計データの圧縮機能を提供する
 */

// 型定義
interface CompressionConfig { compression: {
        enabled: boolean,
        algorithms: string[],
        defaultLevel: number,
        batchSize: number,
        compressionThreshold: number }
    },
    retention: { rawDataDays: number,
        detailedDataDays: number,
        summaryDataDays: number,
        maxRetentionDays: number }
    },
    thresholds: { memoryUsage: number,
        recordCount: number,
        compressionRatio: number }
    };
}

interface CompressionState { isCompressing: boolean,
    queue: CompressionJob[],
    history: CompressionHistoryEntry[],
    statistics: CompressionStatistics
    }
}

interface CompressionJob { data: any,
    dataType: string,
    options: CompressionOptions,
    resolve: (result: CompressionResult) => void,
    reject: (error: Error) => void,
    timestamp: number }
}

interface CompressionOptions { sampleRate?: number;
    maxSamples?: number;
    aggregationPeriod?: string;
    aggregationFields?: string[];
    deltaFields?: string[]; }
}

interface CompressionResult { data: any,
    compressed: boolean,
    metadata?: CompressionMetadata;
    info?: CompressionInfo;
    reason?: string; }
}

interface CompressionInfo { originalSize: number,
    finalSize?: number;
    compressionRatio?: number;
    compressionTime?: number;
    stages: CompressionStageInfo[]
    }
}

interface CompressionStageInfo { algorithm: string,
    originalSize: number,
    compressedSize: number,
    ratio: number,
    processingTime: number,
    error?: string }
}

interface CompressionMetadata { id: string,
    dataType: string,
    strategies: string[],
    compressionInfo: CompressionInfo,
    timestamp: number,
    version: string }
}

interface CompressionStatistics { totalCompressed: number,
    totalSaved: number,
    averageRatio: number,
    lastCompression: number | null }
}

interface CompressionHistoryEntry extends CompressionInfo { timestamp: number }
}

interface NumericSummary { type: 'numeric_summary',
    count: number,
    sum: number,
    mean: number,
    median: number,
    min: number,
    max: number,
    standardDeviation: number,
    percentiles: {
        p25: number,
        p75: number,
        p90: number,
        p95: number }
    };
}
';'
interface ObjectArraySummary { ''
    type: 'object_array_summary',
    count: number,
    fields: Record<string, FieldInfo>;
    dateRange: DateRange | null,
    sample: any[] }
}

interface FieldInfo { type: string,
    count: number,
    values?: any[];
    statistics?: NumericSummary;
    uniqueValues?: any[]; }
}

interface DateRange { start: number,
    end: number,
    span: number }
}

export class DataCompressionManager {
    private config: CompressionConfig;
    private compressionState: CompressionState;
    private compressionAlgorithms: Map<string, (data: any, options?: CompressionOptions) => Promise<any>>;
    private compressionStrategies: Map<string, string[]>;
    private compressionMetadata: Map<string, CompressionMetadata>;'
'';
    constructor(''';
                algorithms: ['summary', 'sampling', 'aggregation'],
                defaultLevel: 3, // 1-5段階;
                batchSize: 1000,
                compressionThreshold: 5000 // 5000レコード以上で圧縮開始 }
            },
            retention: { rawDataDays: 30, // 30日間は生データを保持
                detailedDataDays: 90, // 90日間は詳細データを保持;
                summaryDataDays: 365, // 1年間はサマリーデータを保持;
                maxRetentionDays: 1095 // 最大3年間保持 }
            },
            thresholds: { memoryUsage: 50 * 1024 * 1024, // 50MB
                recordCount: 10000,
                compressionRatio: 0.7 // 70%以下に圧縮 }
            }
        },
        
        // 圧縮状態管理
        this.compressionState = { isCompressing: false,
            queue: [],
            history: [],
            statistics: {
                totalCompressed: 0,
                totalSaved: 0,
                averageRatio: 0,
                lastCompression: null }
            })
        })
        // 圧縮アルゴリズム
        this.compressionAlgorithms = new Map(['])';
            ['summary', this.createSummaryCompression.bind(this')],'';
            ['sampling', this.createSamplingCompression.bind(this')],'';
            ['aggregation', this.createAggregationCompression.bind(this')],'';
            ['delta', this.createDeltaCompression.bind(this')],'';
            ['dictionary', this.createDictionaryCompression.bind(this)]'';
        ]');
        
        // データタイプ別圧縮戦略
        this.compressionStrategies = new Map([']';
            ['sessions', ['summary', 'sampling']],'';
            ['timeSeriesData', ['aggregation', 'delta']],'';
            ['achievements', ['summary']],'';
            ['statistics', ['dictionary', 'summary']]);
        ]);
        
        // 圧縮メタデータ
        this.compressionMetadata = new Map();
        
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize(): void { this.setupCompressionScheduler(); }
    }
    
    /**
     * 圧縮スケジューラーの設定
     */
    private setupCompressionScheduler(): void { // 定期的な圧縮チェック（1時間間隔）
        setInterval(() => {  }
            this.checkCompressionNeeds(); }
        }, 60 * 60 * 1000);
        
        // 定期的なクリーンアップ（6時間間隔）
        setInterval(() => { this.performMaintenance(); }
        }, 6 * 60 * 60 * 1000);
    }
    
    /**
     * データ圧縮の実行
     */
    async compressData(data: any, dataType: string, options: CompressionOptions = {}): Promise<CompressionResult> { if (this.compressionState.isCompressing) {
            return this.queueCompression(data, dataType, options); }
        }
        
        this.compressionState.isCompressing = true;
        const startTime = Date.now();
        
        try { // 圧縮戦略の決定
            const strategies = this.determineCompressionStrategy(dataType, data);
            
            let compressedData = data;
            let compressionInfo = {
                originalSize: this.calculateDataSize(data),
                stages: [] }
            },
            
            // 複数段階の圧縮を実行
            for(const strategy of strategies) {
                const stageResult = await this.applyCompressionStage(compressedData, strategy, options);
                compressedData = stageResult.data;
            }
                compressionInfo.stages.push(stageResult.info); }
            }
            
            // 圧縮結果の評価
            compressionInfo.finalSize = this.calculateDataSize(compressedData);
            compressionInfo.compressionRatio = compressionInfo.finalSize / compressionInfo.originalSize;
            compressionInfo.compressionTime = Date.now() - startTime;
            
            // 圧縮が効果的でない場合は元データを返す
            if (compressionInfo.compressionRatio > this.config.thresholds.compressionRatio) { ' }'
                console.warn(`Compression not effective: ${compressionInfo.compressionRatio.toFixed(2})}`');
                return { data: data,'
                    compressed: false,'';
                    reason: 'ineffective_compression', };
                    info: compressionInfo }
                },
            }
            
            // メタデータの記録
            const metadata = this.createCompressionMetadata(dataType, compressionInfo, strategies);
            this.compressionMetadata.set(metadata.id, metadata);
            
            // 統計の更新
            this.updateCompressionStatistics(compressionInfo);
            
            return { data: compressedData,
                compressed: true,
                metadata: metadata, };
                info: compressionInfo }
            },
            '';
        } catch (error) { ''
            console.error('Data compression failed:', error);
            throw error; }
        } finally { this.compressionState.isCompressing = false;
            this.processCompressionQueue(); }
        }
    }
    
    /**
     * 圧縮戦略の決定
     */'
    private determineCompressionStrategy(dataType: string, data: any): string[] { // 既定戦略から開始
        let strategies = this.compressionStrategies.get(dataType') || ['summary'];
        
        // データサイズに基づく調整
        const dataSize = this.calculateDataSize(data);''
        if(dataSize > 10 * 1024 * 1024') {'
            // 10MB以上
        }'
            strategies = ['aggregation', ...strategies]; }
        }
        
        // データ構造に基づく調整
        if(Array.isArray(data) {
            '';
            if (data.length > 10000') {'
        }'
                strategies.unshift('sampling''); }'
            }''
        } else if (typeof data === 'object') { ''
            if (this.hasTimeSeriesPattern(data)') {''
                strategies.unshift('delta'); }
            }
        }
        
        return strategies;
    }
    
    /**
     * 時系列パターンの検出'
     */''
    private hasTimeSeriesPattern(data: any'): boolean { ''
        if (!data || typeof data !== 'object') return false;
        ';
        // タイムスタンプフィールドの存在確認
        const hasTimestamp = Object.keys(data).some(key => ');''
            key.includes('timestamp'') || key.includes('date'') || key.includes('time');
        
        return hasTimestamp; }
    }
    
    /**
     * 圧縮段階の適用
     */
    private async applyCompressionStage(data: any, algorithm: string, options: CompressionOptions): Promise<{ data: any; info: CompressionStageInfo }> { const startTime = Date.now();
        const originalSize = this.calculateDataSize(data);
        
        try {
            const compressionFunction = this.compressionAlgorithms.get(algorithm);
            if (!compressionFunction) { }
                throw new Error(`Unknown compression algorithm: ${algorithm)`});
            }
            
            const compressedData = await compressionFunction(data, options);
            const compressedSize = this.calculateDataSize(compressedData);
            
            return { data: compressedData,
                info: {
                    algorithm,
                    originalSize,
                    compressedSize,
                    ratio: compressedSize / originalSize, };
                    processingTime: Date.now() - startTime }
                }
            },
            
        } catch (error) {
            console.error(`Compression stage ${algorithm} failed:`, error);
            return { data: data,
                info: {
                    algorithm,
                    originalSize,
                    compressedSize: originalSize,
                    ratio: 1.0,
                    processingTime: Date.now() - startTime, };
                    error: error.message }
                }
            },
        }
    }
    
    /**
     * サマリー圧縮の作成
     */'
    private async createSummaryCompression(data: any, options: CompressionOptions): Promise<any> { if(Array.isArray(data) {''
            return this.compressArrayToSummary(data, options');' }'
        } else if (typeof data === 'object') { return this.compressObjectToSummary(data, options); }
        }
        
        return data;
    }
    
    /**
     * 配列のサマリー圧縮
     */'
    private compressArrayToSummary(array: any[], options: CompressionOptions): any { ''
        if (array.length === 0') return array;
        ';
        // 数値配列の統計サマリー
        if(array.every(item => typeof item === 'number') {'
            ';'
        }'
            return this.createNumericSummary(array'); }
        }
        ';
        // オブジェクト配列のサマリー
        if(array.every(item => typeof item === 'object') {'
            ';'
        }'
            return this.createObjectArraySummary(array, options'); }
        }
        
        // その他の配列
        return { ''
            type: 'array_summary',
            length: array.length,
            sample: array.slice(0, Math.min(10, array.length), };
            uniqueValues: [...new Set(array)].slice(0, 100); }
        };
    }
    
    /**
     * 数値サマリーの作成
     */'
    private createNumericSummary(numbers: number[]): NumericSummary { ''
        const sorted = [...numbers].sort((a, b) => a - b');
        const length = numbers.length;
        ';'
        return { ''
            type: 'numeric_summary',
            count: length,
            sum: numbers.reduce((sum, n) => sum + n, 0),
            mean: numbers.reduce((sum, n) => sum + n, 0) / length,
            median: length % 2 === 0 ?   : undefined;
                (sorted[length / 2 - 1] + sorted[length / 2]) / 2 : ;
                sorted[Math.floor(length / 2)],
            min: sorted[0],
            max: sorted[length - 1],
            standardDeviation: this.calculateStandardDeviation(numbers),
            percentiles: {
                p25: sorted[Math.floor(length * 0.25)],
                p75: sorted[Math.floor(length * 0.75)],
                p90: sorted[Math.floor(length * 0.90)], };
                p95: sorted[Math.floor(length * 0.95)] }
            }
        },
    }
    
    /**
     * 標準偏差の計算
     */
    private calculateStandardDeviation(numbers: number[]): number { const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
        const variance = numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length;
        return Math.sqrt(variance); }
    }
    
    /**
     * オブジェクト配列のサマリー'
     */''
    private createObjectArraySummary(array: any[], options: CompressionOptions'): ObjectArraySummary { const summary = {''
            type: 'object_array_summary',
            count: array.length,
            fields: new Map(),
            dateRange: null,
            sample: array.slice(0, Math.min(100, array.length) }
        };
        
        // フィールド分析
        array.forEach(obj => {  );
            Object.entries(obj).forEach(([key, value]) => {
                if(!summary.fields.has(key) {
                    summary.fields.set(key, {)
                        type: typeof value)
                }
                        count: 0,) }
                        values: []); }
                    });
                }
                '';
                const fieldInfo = summary.fields.get(key');
                fieldInfo.count++;'
                '';
                if(typeof value === 'number') {'
                    ';'
                }'
                    fieldInfo.values.push(value');' }'
                } else if (typeof value === 'string' && value.length < 100) { fieldInfo.values.push(value); }
                }
            });
        });
        ';
        // フィールド統計の計算
        for(const [key, fieldInfo] of summary.fields') {'
            '';
            if (fieldInfo.type === 'number' && fieldInfo.values.length > 0) {'
        }'
                fieldInfo.statistics = this.createNumericSummary(fieldInfo.values');' }'
            } else if (fieldInfo.type === 'string') { fieldInfo.uniqueValues = [...new Set(fieldInfo.values)].slice(0, 50); }
            }
            
            // メモリ節約のため大きな値配列は削除
            if (fieldInfo.values.length > 1000) { delete fieldInfo.values; }
            }
        }
        
        // 日付範囲の特定
        const timestamps = this.extractTimestamps(array);
        if(timestamps.length > 0) {
            summary.dateRange = {
                start: Math.min(...timestamps),
                end: Math.max(...timestamps),
        }
                span: Math.max(...timestamps) - Math.min(...timestamps); }
            };
        }
        
        // Mapをオブジェクトに変換（シリアライズ対応）
        summary.fields = Object.fromEntries(summary.fields);
        
        return summary;
    }
    
    /**
     * タイムスタンプの抽出
     */
    private extractTimestamps(array: any[]): number[] { const timestamps = [];
        ';'
        array.forEach(obj => { );''
            Object.entries(obj).forEach(([key, value]') => {''
                if ((key.includes('timestamp'') || key.includes('date'') || key.includes('time')') &&'';
                    typeof value === 'number' && value > 1000000000000) { // Unix timestamp }
                    timestamps.push(value); }
                }
            });
        });
        
        return timestamps;
    }
    
    /**
     * サンプリング圧縮の作成
     */
    private async createSamplingCompression(data: any, options: CompressionOptions): Promise<any> { if(!Array.isArray(data) return data;
        
        const sampleRate = options.sampleRate || 0.1; // デフォルト10%
        const maxSamples = options.maxSamples || 1000;
        const sampleSize = Math.min(maxSamples, Math.floor(data.length * sampleRate);
        
        if (sampleSize >= data.length) return data;
        ;
        // 戦略的サンプリング
        const samples = this.strategicSampling(data, sampleSize');
        ';'
        return { ''
            type: 'sampled_data',
            originalCount: data.length,
            sampleCount: samples.length,';
            sampleRate: samples.length / data.length,'';
            samplingStrategy: 'strategic',
            samples: samples,
            metadata: {
                compressionRatio: samples.length / data.length, };
                timestamp: Date.now(); }
            }
        };
    }
    
    /**
     * 戦略的サンプリング
     */
    private strategicSampling(data: any[], sampleSize: number): any[] { const samples = [];
        const interval = Math.floor(data.length / sampleSize);
        
        // 等間隔サンプリング + ランダム要素
        for(let i = 0; i < sampleSize; i++) {
            const baseIndex = i * interval;
            const randomOffset = Math.floor(Math.random() * interval);
            const index = Math.min(baseIndex + randomOffset, data.length - 1);'
        }'
            samples.push(data[index]'); }
        }
        ';
        // 重要なポイント（極値など）を優先的に含める
        if(data.length > 0 && typeof data[0] === 'object') {
            const importantSamples = this.findImportantSamples(data, Math.floor(sampleSize * 0.2);
        }
            samples.splice(0, importantSamples.length, ...importantSamples); }
        }
        
        return samples.slice(0, sampleSize);
    }
    
    /**
     * 重要サンプルの発見
     */
    private findImportantSamples(data: any[], count: number): any[] { // スコア、タイムスタンプなどの重要フィールドに基づく
        const scored = data.map((item, index) => { 
            let score = 0;
            
            // 高スコア、極値、最新データに重みを付ける
            if (item.score) score += item.score / 10000;
            if (item.timestamp) score += (item.timestamp - Date.now() + 86400000) / 86400000; // 最新24時間
            if (item.maxCombo) score += item.maxCombo / 100; }
             }
            return { item, index, score };
        });
        
        return scored;
            .sort((a, b) => b.score - a.score);
            .slice(0, count);
            .map(entry => entry.item);
    }
    
    /**
     * 集約圧縮の作成
     */
    private async createAggregationCompression(data: any, options: CompressionOptions): Promise<any> { ''
        if (!Array.isArray(data)') return data;'
        '';
        const aggregationPeriod = options.aggregationPeriod || 'hour'; // hour, day, week
        const aggregationFields = options.aggregationFields || ['score', 'playTime', 'accuracy'];
        
        return this.aggregateTimeSeriesData(data, aggregationPeriod, aggregationFields); }
    }
    
    /**
     * 時系列データの集約
     */
    private aggregateTimeSeriesData(data: any[], period: string, fields: string[]): any { const aggregated = new Map();
        
        data.forEach(item => { );
            const timestamp = item.timestamp || Date.now();
            const periodKey = this.getPeriodKey(timestamp, period);
            
            if(!aggregated.has(periodKey) {
            
                aggregated.set(periodKey, {)
                    period: periodKey,)
            }
                    count: 0) }
                    ...fields.reduce((acc, field) => { }
                        acc[field] = { sum: 0, min: Infinity, max: -Infinity, values: [] }
                        return acc;
                    }, {});
                });
            }
            
            const periodData = aggregated.get(periodKey);
            periodData.count++;'
            '';
            fields.forEach(field => {  ');''
                if(item[field] !== undefined && typeof item[field] === 'number') {
                    const fieldData = periodData[field];
                    fieldData.sum += item[field];
                    fieldData.min = Math.min(fieldData.min, item[field]);
                }
                    fieldData.max = Math.max(fieldData.max, item[field]); }
                    fieldData.values.push(item[field]); }
                }
            });
        });
        
        // 統計値の計算
        const result = Array.from(aggregated.values().map(periodData => {  );
            const processed = { ...periodData );
            
            fields.forEach(field => {);
                if(processed[field] && processed[field].values.length > 0) {
                    const values = processed[field].values;
                    processed[field] = {
                        count: values.length,
                        sum: processed[field].sum,
                        average: processed[field].sum / values.length,
                        min: processed[field].min,
                }
                        max: processed[field].max, }
                        median: this.calculateMedian(values); }
                    };
                }
            });
            ';'
            return processed;''
        }');
        ';'
        return { ''
            type: 'aggregated_data',
            aggregationPeriod: period,
            aggregationFields: fields,
            originalCount: data.length,
            aggregatedCount: result.length, };
            data: result }
        },
    }
    
    /**
     * 期間キーの取得
     */
    private getPeriodKey(timestamp: number, period: string): string { const date = new Date(timestamp);'
        '';
        switch(period') {'
            ';'
        }'
            case 'hour':' }'
                return `${date.getFullYear(})}-${date.getMonth(})}-${date.getDate(})}-${ date.getHours()'
            case 'day':') }'
                return `${date.getFullYear(})}-${date.getMonth(})}-${ date.getDate()'
            case 'week':);
                const weekStart = new Date(date);'
                weekStart.setDate(date.getDate() - date.getDay();' }'
                return `${weekStart.getFullYear(})}-W${Math.floor(weekStart.getTime() / (7 * 24 * 60 * 60 * 1000)'})}`;''
            case 'month':;
                return `${date.getFullYear(})}-${date.getMonth(})}`;
            default: return period;
        }
    }
    
    /**
     * 中央値の計算
     */
    private calculateMedian(numbers: number[]): number { const sorted = [...numbers].sort((a, b) => a - b);
        const length = sorted.length;
        
        if(length % 2 === 0) {
        
            
        
        }
            return (sorted[length / 2 - 1] + sorted[length / 2]) / 2; }
        } else { return sorted[Math.floor(length / 2)]; }
        }
    }
    
    /**
     * デルタ圧縮の作成
     */'
    private async createDeltaCompression(data: any, options: CompressionOptions): Promise<any> { ''
        if (!Array.isArray(data) || data.length === 0') return data;'
        '';
        const deltaFields = options.deltaFields || ['score', 'timestamp'];
        const result = [data[0]]; // 最初の要素はそのまま保持
        
        for (let i = 1; i < data.length; i++) { }
            const delta = {};
            const current = data[i];
            const previous = data[i - 1];
            ';'
            Object.keys(current).forEach(key => {  );''
                if (deltaFields.includes(key') && typeof current[key] === 'number') { }
                    delta[key] = current[key] - (previous[key] || 0); }
                } else { delta[key] = current[key]; }
                }
            });'
            '';
            result.push(delta');
        }
        ';'
        return { ''
            type: 'delta_compressed',
            deltaFields: deltaFields,
            originalCount: data.length, };
            data: result }
        },
    }
    
    /**
     * 辞書圧縮の作成
     */
    private async createDictionaryCompression(data: any, options: CompressionOptions): Promise<any> { const dictionary = new Map(); }
        const compressed = {};
        let nextId = 0;'
        '';
        const compress = (obj') => {  ''
            if (typeof obj !== 'object' || obj === null) return obj;
            
            if(Array.isArray(obj) { }
                return obj.map(item => compress(item); }
            }
            ';'
            const result = {};''
            Object.entries(obj).forEach(([key, value]') => {  ''
                if (typeof value === 'string' && value.length > 10) { }
                    if(!dictionary.has(value) { }
                        dictionary.set(value, `#${nextId++}`);'
                    }''
                    result[key] = dictionary.get(value');''
                } else if (typeof value === 'object') { result[key] = compress(value); }
                } else { result[key] = value; }
                }
            });
            
            return result;
        };
        
        compressed.data = compress(data);
        compressed.dictionary = Object.fromEntries();'
            Array.from(dictionary.entries().map(([value, id]) => [id, value])'';
        ');''
        compressed.type = 'dictionary_compressed';
        
        return compressed;
    }
    
    /**
     * データサイズの計算
     */
    private calculateDataSize(data: any): number { try {
            return JSON.stringify(data).length * 2; // UTF-16概算 }
        } catch (error) { return 0; }
        }
    }
    
    /**
     * 圧縮メタデータの作成
     */
    private createCompressionMetadata(dataType: string, compressionInfo: CompressionInfo, strategies: string[]): CompressionMetadata { return { }
            id: `compression_${Date.now(})}_${Math.random().toString(36).substr(2, 9})}`,
            dataType,
            strategies,;
            compressionInfo,'';
            timestamp: Date.now(''';
            version: '1.0');
        })
    }
    
    /**
     * 圧縮統計の更新
     */)
    private updateCompressionStatistics(compressionInfo: CompressionInfo): void { const stats = this.compressionState.statistics;
        
        stats.totalCompressed++;
        stats.totalSaved += compressionInfo.originalSize - compressionInfo.finalSize;
        stats.averageRatio = (stats.averageRatio * (stats.totalCompressed - 1) + compressionInfo.compressionRatio) / stats.totalCompressed;
        stats.lastCompression = Date.now();
        
        // 履歴に追加
        this.compressionState.history.push({);
            timestamp: Date.now(),
            ...compressionInfo }
        });
        
        // 履歴を制限（最新100件）
        if (this.compressionState.history.length > 100) { this.compressionState.history = this.compressionState.history.slice(-100); }
        }
    }
    
    /**
     * 圧縮のキューイング
     */
    private queueCompression(data: any, dataType: string, options: CompressionOptions): Promise<CompressionResult> { return new Promise((resolve, reject) => { 
            this.compressionState.queue.push({); }
                data, dataType, options, resolve, reject, timestamp: Date.now(); }
            });
        });
    }
    
    /**
     * 圧縮キューの処理
     */
    private async processCompressionQueue(): Promise<void> { while (this.compressionState.queue.length > 0 && !this.compressionState.isCompressing) {
            const job = this.compressionState.queue.shift();
            
            try {
                const result = await this.compressData(job.data, job.dataType, job.options);
                job.resolve(result); }
            } catch (error) { job.reject(error); }
            }
        }
    }
    
    /**
     * 圧縮ニーズのチェック
     */''
    private checkCompressionNeeds()';
        console.debug('Checking compression needs...');
    }
    
    /**
     * メンテナンスの実行
     */
    private performMaintenance(): void { // 古いメタデータのクリーンアップ
        const cutoffTime = Date.now() - (this.config.retention.maxRetentionDays * 24 * 60 * 60 * 1000);
        
        for(const [id, metadata] of this.compressionMetadata) {
        ';'
            if (metadata.timestamp < cutoffTime) {'
        
        }'
                this.compressionMetadata.delete(id'); }
            }
        }'
        '';
        console.debug('Compression maintenance completed');
    }
    
    /**
     * 圧縮統計の取得
     */
    getCompressionStatistics(): CompressionStatistics & { queueLength: number,
        isCompressing: boolean,
        historyCount: number,
        metadataCount: number,
        algorithms: string[],
        strategies: Record<string, string[]>, }
    } { return { ...this.compressionState.statistics,
            queueLength: this.compressionState.queue.length,
            isCompressing: this.compressionState.isCompressing,
            historyCount: this.compressionState.history.length,
            metadataCount: this.compressionMetadata.size,
            algorithms: Array.from(this.compressionAlgorithms.keys(), };
            strategies: Object.fromEntries(this.compressionStrategies); }
        };
    }
    
    /**
     * 設定の更新
     */
    updateConfig(newConfig: Partial<CompressionConfig>): void { Object.assign(this.config, newConfig); }
    }
    
    /**
     * リソースのクリーンアップ
     */
    destroy(): void { this.compressionState.queue = [];'
        this.compressionState.history = [];''
        this.compressionMetadata.clear(') }