/**
 * 翻訳データ圧縮ユーティリティ
 * 高度な圧縮アルゴリズムと最適化機能を提供
 */
export class CompressionUtils {
    constructor() {
        // 圧縮設定
        this.compressionLevel = 'balanced'; // 'fast', 'balanced', 'maximum'
        this.minCompressionSize = 512; // 512バイト以上で圧縮
        this.compressionThreshold = 0.1; // 10%以上圧縮できる場合のみ適用
        
        // 辞書ベース圧縮用の共通パターン
        this.commonPatterns = new Map([
            // よく使われる翻訳キーパターン
            ['accessibility.', 'a.'],
            ['settings.', 's.'],
            ['error.', 'e.'],
            ['menu.', 'm.'],
            ['game.', 'g.'],
            ['common.', 'c.'],
            ['achievements.', 'ac.'],
            ['help.', 'h.'],
            
            // よく使われる日本語パターン
            ['について', 'に'],
            ['ボタン', 'btn'],
            ['設定', 'cfg'],
            ['エラー', 'err'],
            ['メニュー', 'menu'],
            ['ゲーム', 'game'],
            
            // よく使われる英語パターン
            ['button', 'btn'],
            ['setting', 'cfg'],
            ['error', 'err'],
            ['message', 'msg'],
            ['information', 'info'],
            ['accessibility', 'a11y']
        ]);
        
        // 逆変換用マップ
        this.reversePatterns = new Map();
        for (const [key, value] of this.commonPatterns) {
            this.reversePatterns.set(value, key);
        }
        
        // 統計情報
        this.stats = {
            totalCompressions: 0,
            totalDecompressions: 0,
            bytesBeforeCompression: 0,
            bytesAfterCompression: 0,
            compressionRatio: 0,
            averageCompressionTime: 0,
            averageDecompressionTime: 0
        };
    }
    
    /**
     * 翻訳データを圧縮
     */
    compress(data, options = {}) {
        const startTime = performance.now();
        
        try {
            const {
                level = this.compressionLevel,
                preserveStructure = true,
                customPatterns = new Map()
            } = options;
            
            if (!data || typeof data !== 'object') {
                return { data, compressed: false, reason: 'Invalid data type' };
            }
            
            const originalSize = this._calculateDataSize(data);
            
            // サイズチェック
            if (originalSize < this.minCompressionSize) {
                return { data, compressed: false, reason: 'Below minimum size' };
            }
            
            // 圧縮処理
            let compressedData;
            switch (level) {
                case 'fast':
                    compressedData = this._fastCompress(data, customPatterns);
                    break;
                case 'balanced':
                    compressedData = this._balancedCompress(data, customPatterns);
                    break;
                case 'maximum':
                    compressedData = this._maximumCompress(data, customPatterns, preserveStructure);
                    break;
                default:
                    compressedData = this._balancedCompress(data, customPatterns);
            }
            
            const compressedSize = this._calculateDataSize(compressedData.data);
            const compressionRatio = (originalSize - compressedSize) / originalSize;
            
            // 圧縮効果チェック
            if (compressionRatio < this.compressionThreshold) {
                return { data, compressed: false, reason: 'Insufficient compression' };
            }
            
            // 統計更新
            this._updateCompressionStats(originalSize, compressedSize, performance.now() - startTime);
            
            return {
                ...compressedData,
                originalSize,
                compressedSize,
                compressionRatio: Math.round(compressionRatio * 10000) / 100, // パーセンテージ
                compressionTime: Math.round((performance.now() - startTime) * 100) / 100
            };
            
        } catch (error) {
            console.error('Compression failed:', error);
            return { data, compressed: false, error: error.message };
        }
    }
    
    /**
     * 高速圧縮
     */
    _fastCompress(data, customPatterns) {
        const jsonString = JSON.stringify(data);
        
        // 基本的な空白とパターン圧縮
        let compressed = jsonString
            .replace(/\s+/g, ' ')  // 複数空白を単一空白に
            .replace(/: "/g, ':"')  // ": " を ":\"に
            .replace(/", "/g, '","'); // ", " を ","に
        
        // 共通パターンの置換
        for (const [pattern, replacement] of this.commonPatterns) {
            compressed = compressed.replace(new RegExp(pattern, 'g'), replacement);
        }
        
        // カスタムパターンの適用
        for (const [pattern, replacement] of customPatterns) {
            compressed = compressed.replace(new RegExp(pattern, 'g'), replacement);
        }
        
        return {
            data: compressed,
            compressed: true,
            level: 'fast',
            patterns: new Map([...this.commonPatterns, ...customPatterns])
        };
    }
    
    /**
     * バランス圧縮
     */
    _balancedCompress(data, customPatterns) {
        // 高速圧縮を適用
        const fastResult = this._fastCompress(data, customPatterns);
        
        // 追加の最適化
        let compressed = fastResult.data;
        
        // 重複する長い文字列の検出と置換
        const duplicates = this._findDuplicateStrings(compressed);
        const replacementMap = new Map();
        
        let replacementIndex = 0;
        for (const [duplicate, count] of duplicates) {
            if (count > 2 && duplicate.length > 10) { // 3回以上出現し、10文字以上
                const placeholder = `__R${replacementIndex}__`;
                replacementMap.set(placeholder, duplicate);
                compressed = compressed.replace(new RegExp(duplicate, 'g'), placeholder);
                replacementIndex++;
            }
        }
        
        // JSONキーの短縮
        const keyMappings = this._createKeyMappings(data);
        for (const [longKey, shortKey] of keyMappings) {
            compressed = compressed.replace(new RegExp(`"${longKey}"`, 'g'), `"${shortKey}"`);
        }
        
        return {
            data: compressed,
            compressed: true,
            level: 'balanced',
            patterns: fastResult.patterns,
            duplicateReplacements: replacementMap,
            keyMappings: keyMappings
        };
    }
    
    /**
     * 最大圧縮
     */
    _maximumCompress(data, customPatterns, preserveStructure) {
        // バランス圧縮を適用
        const balancedResult = this._balancedCompress(data, customPatterns);
        
        let compressed = balancedResult.data;
        
        // より積極的な最適化
        if (!preserveStructure) {
            // オブジェクト構造のフラット化
            compressed = this._flattenStructure(compressed);
        }
        
        // 高度なパターン検出
        const advancedPatterns = this._detectAdvancedPatterns(compressed);
        for (const [pattern, replacement] of advancedPatterns) {
            compressed = compressed.replace(new RegExp(pattern, 'g'), replacement);
        }
        
        // バイト効率的エンコーディング
        const encodedResult = this._applyByteOptimization(compressed);
        
        return {
            data: encodedResult.data,
            compressed: true,
            level: 'maximum',
            patterns: balancedResult.patterns,
            duplicateReplacements: balancedResult.duplicateReplacements,
            keyMappings: balancedResult.keyMappings,
            advancedPatterns: advancedPatterns,
            byteOptimization: encodedResult.optimizations,
            structureFlattened: !preserveStructure
        };
    }
    
    /**
     * 重複文字列を検出
     */
    _findDuplicateStrings(text) {
        const strings = new Map();
        const minLength = 8;
        
        // 文字列を分析
        for (let i = 0; i <= text.length - minLength; i++) {
            for (let len = minLength; len <= Math.min(50, text.length - i); len++) {
                const substring = text.substring(i, i + len);
                
                // 英数字とよく使われる文字のみ
                if (/^[a-zA-Z0-9一-龯ひらがなカタカナ\s\.]+$/.test(substring)) {
                    strings.set(substring, (strings.get(substring) || 0) + 1);
                }
            }
        }
        
        // 出現回数でソート
        return new Map([...strings.entries()].sort((a, b) => b[1] - a[1]));
    }
    
    /**
     * キーマッピングを作成
     */
    _createKeyMappings(data) {
        const keys = this._extractAllKeys(data);
        const mappings = new Map();
        
        let shortKeyIndex = 0;
        for (const key of keys) {
            if (key.length > 3) { // 3文字より長いキーのみ短縮
                const shortKey = this._generateShortKey(shortKeyIndex++);
                mappings.set(key, shortKey);
            }
        }
        
        return mappings;
    }
    
    /**
     * 全キーを抽出
     */
    _extractAllKeys(obj, keys = new Set()) {
        if (typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
                keys.add(key);
                if (typeof obj[key] === 'object') {
                    this._extractAllKeys(obj[key], keys);
                }
            }
        }
        return keys;
    }
    
    /**
     * 短縮キーを生成
     */
    _generateShortKey(index) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        let num = index;
        
        do {
            result = chars[num % chars.length] + result;
            num = Math.floor(num / chars.length);
        } while (num > 0);
        
        return result;
    }
    
    /**
     * 高度なパターンを検出
     */
    _detectAdvancedPatterns(text) {
        const patterns = new Map();
        
        // HTML-like tags
        patterns.set(/<([^>]+)>/g, '<$1>');
        
        // Repeated punctuation
        patterns.set(/\.{2,}/g, '..');
        patterns.set(/\s{2,}/g, ' ');
        
        // Common word endings (Japanese)
        patterns.set(/です。/g, 'だ。');
        patterns.set(/ます。/g, 'る。');
        
        // Common word endings (English)
        patterns.set(/tion/g, 'n');
        patterns.set(/sion/g, 'n');
        
        return patterns;
    }
    
    /**
     * 構造をフラット化
     */
    _flattenStructure(jsonString) {
        try {
            const obj = JSON.parse(jsonString);
            const flattened = this._flattenObject(obj);
            return JSON.stringify(flattened);
        } catch (error) {
            return jsonString;
        }
    }
    
    /**
     * オブジェクトをフラット化
     */
    _flattenObject(obj, prefix = '') {
        const flattened = {};
        
        for (const key in obj) {
            const newKey = prefix ? `${prefix}.${key}` : key;
            
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                Object.assign(flattened, this._flattenObject(obj[key], newKey));
            } else {
                flattened[newKey] = obj[key];
            }
        }
        
        return flattened;
    }
    
    /**
     * バイト最適化を適用
     */
    _applyByteOptimization(text) {
        const optimizations = [];
        let optimized = text;
        
        // Unicode正規化
        optimized = optimized.normalize('NFD');
        optimizations.push('unicode-normalization');
        
        // 制御文字の削除
        optimized = optimized.replace(/[\x00-\x1F\x7F]/g, '');
        optimizations.push('control-char-removal');
        
        return {
            data: optimized,
            optimizations
        };
    }
    
    /**
     * データを展開
     */
    decompress(compressedData) {
        const startTime = performance.now();
        
        try {
            if (!compressedData.compressed) {
                return compressedData.data;
            }
            
            let decompressed = compressedData.data;
            
            // バイト最適化の復元
            if (compressedData.byteOptimization) {
                decompressed = this._revertByteOptimization(decompressed, compressedData.byteOptimization);
            }
            
            // 高度なパターンの復元
            if (compressedData.advancedPatterns) {
                for (const [pattern, replacement] of compressedData.advancedPatterns) {
                    decompressed = decompressed.replace(new RegExp(replacement, 'g'), pattern);
                }
            }
            
            // キーマッピングの復元
            if (compressedData.keyMappings) {
                for (const [longKey, shortKey] of compressedData.keyMappings) {
                    decompressed = decompressed.replace(new RegExp(`"${shortKey}"`, 'g'), `"${longKey}"`);
                }
            }
            
            // 重複置換の復元
            if (compressedData.duplicateReplacements) {
                for (const [placeholder, original] of compressedData.duplicateReplacements) {
                    decompressed = decompressed.replace(new RegExp(placeholder, 'g'), original);
                }
            }
            
            // パターンの復元
            if (compressedData.patterns) {
                for (const [pattern, replacement] of compressedData.patterns) {
                    decompressed = decompressed.replace(new RegExp(replacement, 'g'), pattern);
                }
            }
            
            // 構造の復元
            if (compressedData.structureFlattened) {
                decompressed = this._restoreStructure(decompressed);
            }
            
            // JSON解析
            const result = JSON.parse(decompressed);
            
            // 統計更新
            this._updateDecompressionStats(performance.now() - startTime);
            
            return result;
            
        } catch (error) {
            console.error('Decompression failed:', error);
            throw new Error(`Decompression failed: ${error.message}`);
        }
    }
    
    /**
     * バイト最適化を復元
     */
    _revertByteOptimization(text, optimizations) {
        let reverted = text;
        
        for (const optimization of optimizations) {
            switch (optimization) {
                case 'unicode-normalization':
                    reverted = reverted.normalize('NFC');
                    break;
                // その他の最適化の復元処理
            }
        }
        
        return reverted;
    }
    
    /**
     * 構造を復元
     */
    _restoreStructure(jsonString) {
        try {
            const flattened = JSON.parse(jsonString);
            const restored = {};
            
            for (const key in flattened) {
                const keys = key.split('.');
                let current = restored;
                
                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]]) {
                        current[keys[i]] = {};
                    }
                    current = current[keys[i]];
                }
                
                current[keys[keys.length - 1]] = flattened[key];
            }
            
            return JSON.stringify(restored);
        } catch (error) {
            return jsonString;
        }
    }
    
    /**
     * データサイズを計算
     */
    _calculateDataSize(data) {
        if (typeof data === 'string') {
            return new Blob([data]).size;
        }
        return new Blob([JSON.stringify(data)]).size;
    }
    
    /**
     * 圧縮統計を更新
     */
    _updateCompressionStats(originalSize, compressedSize, time) {
        this.stats.totalCompressions++;
        this.stats.bytesBeforeCompression += originalSize;
        this.stats.bytesAfterCompression += compressedSize;
        
        const totalRatio = this.stats.bytesBeforeCompression > 0 
            ? (this.stats.bytesBeforeCompression - this.stats.bytesAfterCompression) / this.stats.bytesBeforeCompression 
            : 0;
        this.stats.compressionRatio = Math.round(totalRatio * 10000) / 100;
        
        this.stats.averageCompressionTime = (
            (this.stats.averageCompressionTime * (this.stats.totalCompressions - 1) + time) / 
            this.stats.totalCompressions
        );
    }
    
    /**
     * 展開統計を更新
     */
    _updateDecompressionStats(time) {
        this.stats.totalDecompressions++;
        this.stats.averageDecompressionTime = (
            (this.stats.averageDecompressionTime * (this.stats.totalDecompressions - 1) + time) / 
            this.stats.totalDecompressions
        );
    }
    
    /**
     * 統計情報を取得
     */
    getStats() {
        return {
            ...this.stats,
            compressionRatio: Math.round(this.stats.compressionRatio * 100) / 100,
            averageCompressionTime: Math.round(this.stats.averageCompressionTime * 100) / 100,
            averageDecompressionTime: Math.round(this.stats.averageDecompressionTime * 100) / 100,
            totalBytesSaved: this.stats.bytesBeforeCompression - this.stats.bytesAfterCompression
        };
    }
    
    /**
     * 設定を更新
     */
    updateSettings(settings) {
        if (settings.compressionLevel) {
            this.compressionLevel = settings.compressionLevel;
        }
        if (settings.minCompressionSize !== undefined) {
            this.minCompressionSize = settings.minCompressionSize;
        }
        if (settings.compressionThreshold !== undefined) {
            this.compressionThreshold = settings.compressionThreshold;
        }
        
        console.log('CompressionUtils settings updated:', settings);
    }
    
    /**
     * カスタムパターンを追加
     */
    addCustomPattern(pattern, replacement) {
        this.commonPatterns.set(pattern, replacement);
        this.reversePatterns.set(replacement, pattern);
    }
    
    /**
     * カスタムパターンを削除
     */
    removeCustomPattern(pattern) {
        const replacement = this.commonPatterns.get(pattern);
        if (replacement) {
            this.commonPatterns.delete(pattern);
            this.reversePatterns.delete(replacement);
            return true;
        }
        return false;
    }
    
    /**
     * 統計をリセット
     */
    resetStats() {
        this.stats = {
            totalCompressions: 0,
            totalDecompressions: 0,
            bytesBeforeCompression: 0,
            bytesAfterCompression: 0,
            compressionRatio: 0,
            averageCompressionTime: 0,
            averageDecompressionTime: 0
        };
    }
}