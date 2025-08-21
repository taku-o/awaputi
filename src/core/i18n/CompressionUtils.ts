/**
 * 翻訳データ圧縮ユーティリティ
 * 高度な圧縮アルゴリズムと最適化機能を提供
 */

// 型定義
export interface CompressionOptions { level?: CompressionLevel;
    preserveStructure?: boolean;
    customPatterns?: Map<string, string>; }

export interface CompressionResult { data: any,
    compressed: boolean;
    reason?: string;
    error?: string;
    originalSize?: number;
    compressedSize?: number;
    compressionRatio?: number;
    compressionTime?: number;
    level?: CompressionLevel;
    patterns?: Map<string, string>;
    duplicateReplacements?: Map<string, string>;
    keyMappings?: Map<string, string>;
    advancedPatterns?: Map<string, string>;
    byteOptimization?: string[];
    structureFlattened?: boolean; }

export interface FastCompressionResult { data: string,
    compressed: boolean;
    level: CompressionLevel;
   , patterns: Map<string, string>, }

export interface BalancedCompressionResult { data: string,
    compressed: boolean;
    level: CompressionLevel;
   , patterns: Map<string, string>,
    duplicateReplacements: Map<string, string>,
    keyMappings: Map<string, string>, }

export interface MaximumCompressionResult { data: string,
    compressed: boolean;
    level: CompressionLevel;
   , patterns: Map<string, string>,
    duplicateReplacements: Map<string, string>,
    keyMappings: Map<string, string>,
    advancedPatterns: Map<string, string>,
    byteOptimization: string[];
   , structureFlattened: boolean ,}

export interface ByteOptimizationResult { data: string;
   , optimizations: string[] }

export interface CompressionStats { totalCompressions: number;
    totalDecompressions: number;
    bytesBeforeCompression: number;
    bytesAfterCompression: number;
    compressionRatio: number;
    averageCompressionTime: number;
   , averageDecompressionTime: number }

export interface DetailedCompressionStats extends CompressionStats { totalBytesSaved: number }

export interface CompressionSettings { compressionLevel?: CompressionLevel;
    minCompressionSize?: number;
    compressionThreshold?: number; }

export interface PatternFrequency { pattern: string,
    frequency: number;
   , estimatedSavings: number ,}

export interface DuplicateAnalysis { duplicates: Map<string, number>,
    totalOccurrences: number;
   , potentialSavings: number ,}

export interface KeyMappingResult { mappings: Map<string, string>,
    totalKeysReduced: number;
   , estimatedSavings: number ,}

export interface AdvancedPatternResult { patterns: Map<string, string>,
    matchCount: number;
   , estimatedSavings: number ,}

export interface StructureAnalysis { depth: number;
    totalKeys: number;
    duplicateKeys: number;
   , flatteningSavings: number }

export type CompressionLevel = 'fast' | 'balanced' | 'maximum';

export class CompressionUtils {
    private compressionLevel: CompressionLevel;
    private minCompressionSize: number;
    private compressionThreshold: number;
    // 辞書ベース圧縮用の共通パターン
    private, commonPatterns: Map<string, string>;
    
    // 逆変換用マップ
    private reversePatterns: Map<string, string>;
    
    // 統計情報
    private stats: CompressionStats;

    constructor(''';
        this.compressionLevel = 'balanced'; // 'fast', 'balanced', 'maximum'
        this.minCompressionSize = 512; // 512バイト以上で圧縮
        this.compressionThreshold = 0.1; // 10%以上圧縮できる場合のみ適用
        
        // よく使われる翻訳キーパターン
        this.commonPatterns = new Map<string, string>([;
            // よく使われる翻訳キーパターン]'
            ['accessibility.', 'a.],
            ['settings.', 's.],
            ['error.', 'e.],
            ['menu.', 'm.],
            ['game.', 'g.],
            ['common.', 'c.],
            ['achievements.', 'ac.],
            ['help.', 'h.],
            // よく使われる日本語パターン
            ['について', 'に],
            ['ボタン', 'btn'],
            ['設定', 'cfg'],
            ['エラー', 'err'],
            ['メニュー', 'menu'],)';
            ['ゲーム', 'game])';
            // よく使われる英語パターン
            ['button', 'btn'],
            ['setting', 'cfg'],
            ['error', 'err'],
            ['message', 'msg'],
            ['information', 'info'],
            ['accessibility', 'a11y'];
        ]);
        
        // 逆変換用マップ
        this.reversePatterns = new Map<string, string>();
        for(const [key, value] of this.commonPatterns) {
            
        }
            this.reversePatterns.set(value, key); }
        }
        
        // 統計情報
        this.stats = { totalCompressions: 0,
            totalDecompressions: 0;
            bytesBeforeCompression: 0;
            bytesAfterCompression: 0;
            compressionRatio: 0;
            averageCompressionTime: 0;
           , averageDecompressionTime: 0 ,}
    
    /**
     * 翻訳データを圧縮
     */
    compress(data: any, options: CompressionOptions = { ): CompressionResult {
        const startTime = performance.now();
        
        try {
            const { level = this.compressionLevel,;
                preserveStructure = true,
                customPatterns = new Map<string, string>('); } = options;

            if (!data || typeof, data !== 'object'') { ' }

                return { data, compressed: false, reason: 'Invalid data type' ,}
            
            const originalSize = this._calculateDataSize(data);
            ';
            // サイズチェック
            if(originalSize < this.minCompressionSize) { ' }'

                return { data, compressed: false, reason: 'Below minimum size' ,}
            
            // 圧縮処理
            let compressedData: FastCompressionResult | BalancedCompressionResult | MaximumCompressionResult,
            switch(level) {'

                case 'fast':'';
                    compressedData = this._fastCompress(data, customPatterns);

                    break;''
                case 'balanced':'';
                    compressedData = this._balancedCompress(data, customPatterns);

                    break;''
                case 'maximum':;
                    compressedData = this._maximumCompress(data, customPatterns, preserveStructure);
                    break;
                default:;
            ,}
                    compressedData = this._balancedCompress(data, customPatterns); }
            }
            
            const compressedSize = this._calculateDataSize(compressedData.data);
            const compressionRatio = (originalSize - compressedSize) / originalSize;
            ';
            // 圧縮効果チェック
            if(compressionRatio < this.compressionThreshold) { ' }'

                return { data, compressed: false, reason: 'Insufficient compression' ,}
            
            // 統計更新
            this._updateCompressionStats(originalSize, compressedSize, performance.now() - startTime);
            
            return { ...compressedData,
                originalSize,
                compressedSize,
                compressionRatio: Math.round(compressionRatio * 10000) / 100, // パーセンテージ };
                compressionTime: Math.round((performance.now() - startTime) * 100) / 100 }
            } catch (error) { console.error('Compression failed:', error }
            return { data, compressed: false, error: (error as Error).message ,}
    }
    
    /**
     * 高速圧縮
     */'
    private _fastCompress(data: any, customPatterns: Map<string, string>): FastCompressionResult { ''
        const jsonString = JSON.stringify(data);
        
        // 基本的な空白とパターン圧縮
        let compressed = jsonString'';
            .replace(/\s+/g, ', '')  // 複数空白を単一空白に;
            .replace(/: "/g, ':"'')  // ": " を ":\"に"";
            .replace(/", "/g, '","''); // ", " を ","に
        ";
        // 共通パターンの置換""
        for(const [pattern, replacement] of this.commonPatterns) {", ";
        }"
            compressed = compressed.replace(new RegExp(pattern, 'g), replacement); }'
        }
        ';
        // カスタムパターンの適用
        for(const [pattern, replacement] of customPatterns) {', ';

        }

            compressed = compressed.replace(new RegExp(pattern, 'g), replacement'); }
        }
        
        return { data: compressed,

            compressed: true,
            level: 'fast', };
            patterns: new Map<string, string>([...this.commonPatterns, ...customPatterns]);
        }
    
    /**
     * バランス圧縮
     */
    private _balancedCompress(data: any, customPatterns: Map<string, string>): BalancedCompressionResult { // 高速圧縮を適用
        const fastResult = this._fastCompress(data, customPatterns);
        
        // 追加の最適化
        let compressed = fastResult.data;
        
        // 重複する長い文字列の検出と置換
        const duplicates = this._findDuplicateStrings(compressed);
        const replacementMap = new Map<string, string>();
        
        let replacementIndex = 0;
        for(const [duplicate, count] of duplicates) {
            
        }
            if (count > 2 && duplicate.length > 10) { // 3回以上出現し、10文字以上 }
                const placeholder = `__R${replacementIndex}__`;''
                replacementMap.set(placeholder, duplicate);''
                compressed = compressed.replace(new RegExp(duplicate, 'g), placeholder);
                replacementIndex++;
            }
        }
        
        // JSONキーの短縮
        const keyMappings = this._createKeyMappings(data);''
        for(const [longKey, shortKey] of keyMappings) { ' }'

            compressed = compressed.replace(new RegExp(`"${longKey"}"`, 'g''}), `"${shortKey}"`");
        }
        
        return { data: compressed,"
            compressed: true,
            level: 'balanced';
            patterns: fastResult.patterns;
           , duplicateReplacements: replacementMap, };
            keyMappings: keyMappings }
        }
    
    /**
     * 最大圧縮
     */
    private _maximumCompress(data: any, customPatterns: Map<string, string>, preserveStructure: boolean): MaximumCompressionResult { // バランス圧縮を適用
        const balancedResult = this._balancedCompress(data, customPatterns);
        
        let compressed = balancedResult.data;
        
        // より積極的な最適化
        if(!preserveStructure) {
            // オブジェクト構造のフラット化
        }
            compressed = this._flattenStructure(compressed); }
        }
        
        // 高度なパターン検出
        const advancedPatterns = this._detectAdvancedPatterns(compressed);''
        for(const [pattern, replacement] of advancedPatterns) {', ';

        }

            compressed = compressed.replace(new RegExp(pattern, 'g), replacement); }'
        }
        ';
        // バイト効率的エンコーディング
        const encodedResult = this._applyByteOptimization(compressed);
        
        return { data: encodedResult.data,

            compressed: true,
            level: 'maximum';
            patterns: balancedResult.patterns;
            duplicateReplacements: balancedResult.duplicateReplacements;
            keyMappings: balancedResult.keyMappings;
            advancedPatterns: advancedPatterns;
           , byteOptimization: encodedResult.optimizations, };
            structureFlattened: !preserveStructure }
        }
    
    /**
     * 重複文字列を検出
     */
    private _findDuplicateStrings(text: string): Map<string, number> { const strings = new Map<string, number>();
        const minLength = 8;
        
        // 文字列を分析
        for(let, i = 0; i <= text.length - minLength; i++) {
            for (let len = minLength; len <= Math.min(50, text.length - i); len++) {
                const substring = text.substring(i, i + len);
                
                // 英数字とよく使われる文字のみ
                if(/^[a-zA-Z0-9一-龯ひらがなカタカナ\s\.]+$/.test(substring) {
        }
                    strings.set(substring, (strings.get(substring) || 0) + 1); }
}
        }
        
        // 出現回数でソート
        return new Map<string, number>([...strings.entries()].sort((a, b) => b[1] - a[1]));
    }
    
    /**
     * キーマッピングを作成
     */
    private _createKeyMappings(data: any): Map<string, string> { const keys = this._extractAllKeys(data);
        const mappings = new Map<string, string>();
        
        let shortKeyIndex = 0;
        for(const, key of, keys) {
            if (key.length > 3) { // 3文字より長いキーのみ短縮
                const shortKey = this._generateShortKey(shortKeyIndex++);
        }
                mappings.set(key, shortKey); }
}
        
        return mappings;
    }
    
    /**
     * 全キーを抽出
     */''
    private _extractAllKeys(obj: any, keys: Set<string> = new Set<string>()): Set<string> { ''
        if(typeof, obj === 'object' && obj !== null) {'
            for (const, key in, obj) {''
                keys.add(key);''
                if(typeof, obj[key] === 'object) {'
        }
                    this._extractAllKeys(obj[key], keys); }
}
        }
        return keys;
    }
    
    /**
     * 短縮キーを生成'
     */''
    private _generateShortKey(index: number): string { ''
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';''
        let result = '';
        let num = index;
        
        do {
            result = chars[num % chars.length] + result;
            num = Math.floor(num / chars.length); } while (num > 0);
        
        return result;
    }
    
    /**
     * 高度なパターンを検出
     */'
    private _detectAdvancedPatterns(text: string): Map<string, string> { ''
        const patterns = new Map<string, string>(');
        ';
        // HTML-like tags
        patterns.set('<([^>]+)>', '<$1>'');
        ';
        // Repeated punctuation
        patterns.set('\\.{2)', '..'');''
        patterns.set('\\s{2)', ', ');

        // Common word endings(Japanese);''
        patterns.set('です。', 'だ。'');''
        patterns.set('ます。', 'る。);

        // Common word endings(English);''
        patterns.set('tion', 'n'');''
        patterns.set('sion', 'n);
        
        return patterns; }
    
    /**
     * 構造をフラット化
     */
    private _flattenStructure(jsonString: string): string { try {
            const obj = JSON.parse(jsonString);
            const flattened = this._flattenObject(obj);

            return JSON.stringify(flattened);' }'

        } catch (error) { return jsonString;
    
    /**
     * オブジェクトをフラット化'
     */''
    private _flattenObject(obj: any, prefix: string = ''): Record<string, any> {
        const flattened: Record<string, any> = {};

        for(const, key in, obj) {
            
        }
            const newKey = prefix ? `${prefix}.${key}` : key;

            if(typeof, obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key]) { Object.assign(flattened, this._flattenObject(obj[key], newKey); } else { flattened[newKey] = obj[key]; }
        }
        
        return flattened;
    }
    
    /**
     * バイト最適化を適用'
     */''
    private _applyByteOptimization(text: string): ByteOptimizationResult { const optimizations: string[] = [],
        let optimized = text;
        ';
        // Unicode正規化
        optimized = optimized.normalize('NFD'');''
        optimizations.push('unicode-normalization'');
        ';
        // 制御文字の削除
        optimized = optimized.replace(/[\x00-\x1F\x7F]/g, ''');''
        optimizations.push('control-char-removal);
        
        return { data: optimized, };
            optimizations }
        }
    
    /**
     * データを展開
     */
    decompress(compressedData: CompressionResult): any { const startTime = performance.now();
        
        try {
            if(!compressedData.compressed) {
                
            }
                return compressedData.data;
            
            let decompressed = compressedData.data as string;
            
            // バイト最適化の復元
            if (compressedData.byteOptimization) { decompressed = this._revertByteOptimization(decompressed, compressedData.byteOptimization); }
            
            // 高度なパターンの復元
            if(compressedData.advancedPatterns) {

                for(const [pattern, replacement] of compressedData.advancedPatterns) {'
            }

                    decompressed = decompressed.replace(new RegExp(replacement, 'g), pattern); }'
}
            
            // キーマッピングの復元
            if(compressedData.keyMappings) {
                ';

            }

                for(const [longKey, shortKey] of compressedData.keyMappings) {' }'

                    decompressed = decompressed.replace(new RegExp(`"${shortKey"}"`, 'g''}), `"${longKey}"`);
                }
            }
            
            // 重複置換の復元
            if(compressedData.duplicateReplacements) {"

                for (const [placeholder, original] of compressedData.duplicateReplacements) {"
            }"
                    decompressed = decompressed.replace(new RegExp(placeholder, 'g), original); }'
}
            
            // パターンの復元
            if(compressedData.patterns) {

                for(const [pattern, replacement] of compressedData.patterns) {'
            }

                    decompressed = decompressed.replace(new RegExp(replacement, 'g), pattern); }'
}
            
            // 構造の復元
            if (compressedData.structureFlattened) { decompressed = this._restoreStructure(decompressed); }
            
            // JSON解析
            const result = JSON.parse(decompressed);
            
            // 統計更新
            this._updateDecompressionStats(performance.now() - startTime);
            
            return result;

        } catch (error) { console.error('Decompression failed:', error }
            throw new Error(`Decompression failed: ${(error, as Error}).message}`);
        }
    }
    
    /**
     * バイト最適化を復元
     */
    private _revertByteOptimization(text: string, optimizations: string[]): string { let reverted = text;
        
        for(const, optimization of, optimizations) {
        ';

            switch(optimization) {''
                case 'unicode-normalization':'';
                    reverted = reverted.normalize('NFC);
                    break;
        
        }
                // その他の最適化の復元処理 }
}
        
        return reverted;
    }
    
    /**
     * 構造を復元
     */
    private _restoreStructure(jsonString: string): string { try {
            const flattened = JSON.parse(jsonString); }
            const restored: Record<string, any> = {};

            for(const, key in, flattened) {'

                const keys = key.split('.);
                let current = restored;
                
                for (let, i = 0; i < keys.length - 1; i++) {
            }
                    if (!current[keys[i]]) { }
                        current[keys[i]] = {}
                    current = current[keys[i]] as Record<string, any>;
                }
                
                current[keys[keys.length - 1]] = flattened[key];
            }
            
            return JSON.stringify(restored);
        } catch (error) { return jsonString;
    
    /**
     * データサイズを計算'
     */''
    private _calculateDataSize(data: any): number { ''
        if(typeof, data === 'string) {'
            
        }
            return new Blob([data]).size;
        return new Blob([JSON.stringify(data)]).size;
    }
    
    /**
     * 圧縮統計を更新
     */
    private _updateCompressionStats(originalSize: number, compressedSize: number, time: number): void { this.stats.totalCompressions++;
        this.stats.bytesBeforeCompression += originalSize;
        this.stats.bytesAfterCompression += compressedSize;
        
        const totalRatio = this.stats.bytesBeforeCompression > 0 ;
            ? (this.stats.bytesBeforeCompression - this.stats.bytesAfterCompression) / this.stats.bytesBeforeCompression: 0,
        this.stats.compressionRatio = Math.round(totalRatio * 10000) / 100;
        
        this.stats.averageCompressionTime = (;
            (this.stats.averageCompressionTime * (this.stats.totalCompressions - 1) + time) / ;
            this.stats.totalCompressions;
        ); }
    
    /**
     * 展開統計を更新
     */
    private _updateDecompressionStats(time: number): void { this.stats.totalDecompressions++;
        this.stats.averageDecompressionTime = (;
            (this.stats.averageDecompressionTime * (this.stats.totalDecompressions - 1) + time) / ;
            this.stats.totalDecompressions;
        ); }
    
    /**
     * 統計情報を取得
     */
    getStats(): DetailedCompressionStats { return { ...this.stats,
            compressionRatio: Math.round(this.stats.compressionRatio * 100) / 100;
            averageCompressionTime: Math.round(this.stats.averageCompressionTime * 100) / 100;
           , averageDecompressionTime: Math.round(this.stats.averageDecompressionTime * 100) / 100, };
            totalBytesSaved: this.stats.bytesBeforeCompression - this.stats.bytesAfterCompression }
        }
    
    /**
     * 詳細分析結果を取得
     */
    getDetailedAnalysis(data: any): { duplicateAnalysis: DuplicateAnalysis,
        keyMappingResult: KeyMappingResult;
        patternFrequencies: PatternFrequency[];
       , structureAnalysis: StructureAnalysis
    ,} { const jsonString = JSON.stringify(data);
        
        // 重複分析
        const duplicates = this._findDuplicateStrings(jsonString);
        const duplicateAnalysis: DuplicateAnalysis = {
            duplicates,
            totalOccurrences: Array.from(duplicates.values().reduce((sum, count) => sum + count, 0),
            potentialSavings: this._estimateDuplicateSavings(duplicates) ,}
        };
        
        // キーマッピング分析
        const keyMappings = this._createKeyMappings(data);
        const keyMappingResult: KeyMappingResult = { mappings: keyMappings,
            totalKeysReduced: keyMappings.size;
           , estimatedSavings: this._estimateKeyMappingSavings(keyMappings ,};
        
        // パターン頻度分析
        const patternFrequencies: PatternFrequency[] = this._analyzePatternFrequencies(jsonString),
        
        // 構造分析
        const structureAnalysis: StructureAnalysis = this._analyzeStructure(data),
        
        return { duplicateAnalysis,
            keyMappingResult,
            patternFrequencies, };
            structureAnalysis }
        }
    
    /**
     * 重複による節約量を推定
     */
    private _estimateDuplicateSavings(duplicates: Map<string, number>): number { let savings = 0;
        for(const [duplicate, count] of duplicates) {
            
        }
            if (count > 2 && duplicate.length > 10) { }
                savings += (duplicate.length - `__R${count}__`.length) * count;
            }
        }
        return savings;
    }
    
    /**
     * キーマッピングによる節約量を推定
     */
    private _estimateKeyMappingSavings(keyMappings: Map<string, string>): number { let savings = 0;
        for(const [longKey, shortKey] of keyMappings) {
            
        }
            savings += (longKey.length - shortKey.length) * 2; // キーは2回出現（開始と終了） }
        }
        return savings;
    }
    
    /**
     * パターン頻度を分析
     */
    private _analyzePatternFrequencies(text: string): PatternFrequency[] { const frequencies: PatternFrequency[] = [],

        for(const [pattern, replacement] of this.commonPatterns) {'

            const matches = text.match(new RegExp(pattern, 'g) || [];
            const frequency = matches.length;
            const estimatedSavings = (pattern.length - replacement.length) * frequency;
            
            if (frequency > 0) {
        }
                frequencies.push({ pattern, frequency, estimatedSavings ); }
        }
        
        return frequencies.sort((a, b) => b.estimatedSavings - a.estimatedSavings);
    }
    
    /**
     * データ構造を分析
     */
    private _analyzeStructure(obj: any, depth: number = 0): StructureAnalysis { const analysis: StructureAnalysis = {
            depth: 0;
            totalKeys: 0;
            duplicateKeys: 0;
           , flatteningSavings: 0 };
        const keyFrequency = new Map<string, number>();
        ';

        const traverse = (current: any, currentDepth: number) => {  ''
            analysis.depth = Math.max(analysis.depth, currentDepth);

            if(typeof, current === 'object' && current !== null) {
                for (const, key in, current) {'
                    analysis.totalKeys++;''
                    keyFrequency.set(key, (keyFrequency.get(key) || 0) + 1');

                    ';

            }

                    if(typeof, current[key] === 'object) { }'
                        traverse(current[key], currentDepth + 1); }
}
            }
        };
        
        traverse(obj, 0);
        
        // 重複キーを計算
        for(const [key, frequency] of keyFrequency) {
            if (frequency > 1) {
        }
                analysis.duplicateKeys += frequency - 1; }
}
        
        // フラット化による節約量を推定
        analysis.flatteningSavings = this._estimateFlatteningSavings(analysis.depth, analysis.totalKeys);
        
        return analysis;
    }
    
    /**
     * フラット化による節約量を推定
     */
    private _estimateFlatteningSavings(depth: number, totalKeys: number): number { if (depth <= 2) return 0;
        
        // 深い構造ほど節約効果が高い
        const complexityFactor = Math.min(depth * 0.1, 0.3);
        return Math.round(totalKeys * complexityFactor); }
    
    /**
     * 設定を更新
     */
    updateSettings(settings: CompressionSettings): void { if (settings.compressionLevel) {
            this.compressionLevel = settings.compressionLevel; }
        if (settings.minCompressionSize !== undefined) { this.minCompressionSize = settings.minCompressionSize; }''
        if(settings.compressionThreshold !== undefined) { this.compressionThreshold = settings.compressionThreshold; }

        console.log('CompressionUtils settings updated:', settings);
    }
    
    /**
     * カスタムパターンを追加
     */
    addCustomPattern(pattern: string, replacement: string): void { this.commonPatterns.set(pattern, replacement);
        this.reversePatterns.set(replacement, pattern); }
    
    /**
     * カスタムパターンを削除
     */
    removeCustomPattern(pattern: string): boolean { const replacement = this.commonPatterns.get(pattern);
        if(replacement) {
            this.commonPatterns.delete(pattern);
            this.reversePatterns.delete(replacement);
        }
            return true;
        return false;
    }
    
    /**
     * 統計をリセット'
     */''
    resetStats(');