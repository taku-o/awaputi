#!/usr/bin/env node

/**
 * 高度なリンクチェッカー
 * 
 * 機能:
 * - 内部・外部リンクの包括的チェック
 * - リンク状態の履歴管理
 * - レスポンス時間監視
 * - リンク品質分析
 * - 自動修復提案
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import { URL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AdvancedLinkChecker {
    constructor() {
        this.projectRoot = path.join(__dirname, '..');
        this.docsDir = path.join(this.projectRoot, 'docs');
        
        // リンクキャッシュと履歴
        this.linkCache = new Map();
        this.linkHistory = new Map();
        this.loadLinkHistory();
        
        // 設定
        this.config = {
            timeout: 10000,
            retries: 2,
            userAgent: 'BubblePop Documentation Link Checker 1.0',
            maxConcurrency: 5,
            retryDelay: 1000,
            
            // レスポンス時間閾値
            responseTimeThresholds: {
                excellent: 1000,   // 1秒以下
                good: 3000,        // 3秒以下
                acceptable: 5000,  // 5秒以下
                slow: 10000        // 10秒以下
            }
        };
        
        // 結果
        this.results = {
            links: [],
            summary: {
                total: 0,
                valid: 0,
                invalid: 0,
                slow: 0,
                redirects: 0,
                timeouts: 0,
                avgResponseTime: 0
            },
            suggestions: []
        };
        
        // 並行処理制御
        this.activeRequests = 0;
        this.requestQueue = [];
    }
    
    /**
     * メインチェック処理
     */
    async checkLinks(options = {}) {
        console.log('🔗 高度リンクチェックを開始します...\n');
        
        const startTime = Date.now();
        
        try {
            // ドキュメントファイル収集
            const docFiles = await this.collectDocumentationFiles();
            console.log(`📄 ${docFiles.length} 個のドキュメントファイルを発見`);
            
            // リンク抽出
            const allLinks = await this.extractAllLinks(docFiles);
            console.log(`🔗 ${allLinks.length} 個のリンクを発見`);
            
            this.results.summary.total = allLinks.length;
            
            // リンク分類
            const linksByType = this.classifyLinks(allLinks);
            
            console.log(`\\n📊 リンク分類:`);
            console.log(`   • 内部リンク: ${linksByType.internal.length}`);
            console.log(`   • 外部リンク: ${linksByType.external.length}`);
            console.log(`   • アンカーリンク: ${linksByType.anchor.length}`);
            console.log(`   • 画像リンク: ${linksByType.image.length}`);
            
            // 内部リンクチェック
            console.log('\\n🏠 内部リンクチェック中...');
            await this.checkInternalLinks(linksByType.internal);
            
            // 外部リンクチェック（並行処理）
            if (options.checkExternal !== false) {
                console.log('\\n🌐 外部リンクチェック中...');
                await this.checkExternalLinksParallel(linksByType.external);
            }
            
            // アンカーリンクチェック
            console.log('\\n⚓ アンカーリンクチェック中...');
            await this.checkAnchorLinks(linksByType.anchor);
            
            // 画像リンクチェック
            console.log('\\n🖼️ 画像リンクチェック中...');
            await this.checkImageLinks(linksByType.image);
            
            // 統計計算
            this.calculateStatistics();
            
            // 改善提案生成
            this.generateSuggestions();
            
            // 履歴保存
            this.saveLinkHistory();
            
            const endTime = Date.now();
            const duration = Math.round((endTime - startTime) / 1000);
            
            console.log(`\\n✅ リンクチェック完了 (${duration}秒)`);
            
            return {
                success: this.results.summary.invalid === 0,
                results: this.results,
                duration: duration
            };
            
        } catch (error) {
            console.error('❌ リンクチェックでエラーが発生しました:', error);
            return {
                success: false,
                error: error.message,
                results: this.results
            };
        }
    }
    
    /**
     * ドキュメントファイル収集
     */
    async collectDocumentationFiles() {
        const files = [];
        
        const scanDirectory = (dir) => {
            if (!fs.existsSync(dir)) return;
            
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const itemPath = path.join(dir, item);
                const stat = fs.statSync(itemPath);
                
                if (stat.isDirectory()) {
                    if (!item.startsWith('.') && item !== 'node_modules') {
                        scanDirectory(itemPath);
                    }
                } else if (item.endsWith('.md')) {
                    files.push(itemPath);
                }
            }
        };
        
        scanDirectory(this.docsDir);
        
        // ルートファイルも含める
        ['README.md', 'CLAUDE.md'].forEach(file => {
            const filePath = path.join(this.projectRoot, file);
            if (fs.existsSync(filePath)) {
                files.push(filePath);
            }
        });
        
        return files.sort();
    }
    
    /**
     * 全リンク抽出
     */
    async extractAllLinks(files) {
        const allLinks = [];
        
        for (const filePath of files) {
            const content = fs.readFileSync(filePath, 'utf8');
            const links = this.extractLinksFromContent(content, filePath);
            allLinks.push(...links);
        }
        
        return allLinks;
    }
    
    /**
     * コンテンツからリンク抽出
     */
    extractLinksFromContent(content, filePath) {
        const links = [];
        const relativePath = path.relative(this.projectRoot, filePath);
        
        // リンクパターン
        const patterns = {
            markdown: /\\[([^\\]]+)\\]\\(([^)]+)\\)/g,
            image: /!\\[([^\\]]*)\\]\\(([^)]+)\\)/g,
            html: /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\\/a>/gi,
            htmlImg: /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
        };
        
        // Markdownリンク
        let match;
        while ((match = patterns.markdown.exec(content)) !== null) {
            links.push({
                type: this.determineLinkType(match[2]),
                text: match[1],
                url: match[2],
                file: relativePath,
                line: this.getLineNumber(content, match.index),
                original: match[0]
            });
        }
        
        // 画像リンク
        patterns.image.lastIndex = 0;
        while ((match = patterns.image.exec(content)) !== null) {
            links.push({
                type: 'image',
                text: match[1] || 'No alt text',
                url: match[2],
                file: relativePath,
                line: this.getLineNumber(content, match.index),
                original: match[0]
            });
        }
        
        // HTMLリンク
        patterns.html.lastIndex = 0;
        while ((match = patterns.html.exec(content)) !== null) {
            links.push({
                type: this.determineLinkType(match[1]),
                text: match[2],
                url: match[1],
                file: relativePath,
                line: this.getLineNumber(content, match.index),
                original: match[0],
                format: 'html'
            });
        }
        
        return links;
    }
    
    /**
     * リンクタイプ判定
     */
    determineLinkType(url) {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return 'external';
        } else if (url.startsWith('#')) {
            return 'anchor';
        } else if (url.match(/\\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
            return 'image';
        } else {
            return 'internal';
        }
    }
    
    /**
     * リンク分類
     */
    classifyLinks(links) {
        const classified = {
            internal: [],
            external: [],
            anchor: [],
            image: []
        };
        
        links.forEach(link => {
            if (classified[link.type]) {
                classified[link.type].push(link);
            }
        });
        
        return classified;
    }
    
    /**
     * 内部リンクチェック
     */
    async checkInternalLinks(links) {
        for (const link of links) {
            const result = await this.checkInternalLink(link);
            this.results.links.push(result);
            
            if (result.valid) {
                this.results.summary.valid++;
            } else {
                this.results.summary.invalid++;
            }
        }
    }
    
    /**
     * 個別内部リンクチェック
     */
    async checkInternalLink(link) {
        const result = {
            ...link,
            valid: false,
            status: 'unknown',
            message: '',
            suggestions: []
        };
        
        try {
            // 相対パスを絶対パスに変換
            const baseDir = path.dirname(path.join(this.projectRoot, link.file));
            const targetPath = path.resolve(baseDir, link.url);
            
            if (fs.existsSync(targetPath)) {
                result.valid = true;
                result.status = 'ok';
                result.message = 'ファイルが存在します';
                
                // ファイルサイズチェック
                const stat = fs.statSync(targetPath);
                result.fileSize = stat.size;
                
                if (stat.size === 0) {
                    result.valid = false;
                    result.status = 'empty';
                    result.message = 'ファイルが空です';
                }
                
            } else {
                result.status = 'not-found';
                result.message = 'ファイルが見つかりません';
                
                // 修復提案
                const suggestions = this.generateInternalLinkSuggestions(targetPath, baseDir);
                result.suggestions = suggestions;
            }
            
        } catch (error) {
            result.status = 'error';
            result.message = error.message;
        }
        
        return result;
    }
    
    /**
     * 外部リンク並行チェック
     */
    async checkExternalLinksParallel(links) {
        const uniqueUrls = [...new Set(links.map(link => link.url))];
        const urlResults = new Map();
        
        // URLごとにチェック
        for (const url of uniqueUrls) {
            this.requestQueue.push(() => this.checkExternalUrl(url));
        }
        
        // 並行処理実行
        const results = await this.processRequestQueue();
        
        // 結果をマップに保存
        results.forEach((result, index) => {
            urlResults.set(uniqueUrls[index], result);
        });
        
        // 各リンクに結果を適用
        for (const link of links) {
            const urlResult = urlResults.get(link.url);
            const result = {
                ...link,
                ...urlResult,
                timestamp: Date.now()
            };
            
            this.results.links.push(result);
            
            if (result.valid) {
                this.results.summary.valid++;
            } else {
                this.results.summary.invalid++;
            }
            
            if (result.responseTime > this.config.responseTimeThresholds.acceptable) {
                this.results.summary.slow++;
            }
            
            if (result.redirected) {
                this.results.summary.redirects++;
            }
            
            if (result.status === 'timeout') {
                this.results.summary.timeouts++;
            }
            
            // 履歴保存
            this.updateLinkHistory(link.url, result);
        }
    }
    
    /**
     * 外部URL個別チェック
     */
    async checkExternalUrl(url) {
        const result = {
            valid: false,
            status: 'unknown',
            statusCode: null,
            responseTime: null,
            redirected: false,
            finalUrl: url,
            message: '',
            retries: 0
        };
        
        const startTime = Date.now();
        
        for (let attempt = 0; attempt <= this.config.retries; attempt++) {
            try {
                const checkResult = await this.performHttpCheck(url, attempt > 0);
                
                result.valid = checkResult.valid;
                result.status = checkResult.status;
                result.statusCode = checkResult.statusCode;
                result.responseTime = Date.now() - startTime;
                result.redirected = checkResult.redirected;
                result.finalUrl = checkResult.finalUrl || url;
                result.message = checkResult.message;
                result.retries = attempt;
                
                if (result.valid) {
                    break;
                }
                
            } catch (error) {
                result.status = 'error';
                result.message = error.message;
                result.responseTime = Date.now() - startTime;
                
                // リトライ待機
                if (attempt < this.config.retries) {
                    await this.sleep(this.config.retryDelay * (attempt + 1));
                }
            }
        }
        
        return result;
    }
    
    /**
     * HTTP チェック実行
     */
    async performHttpCheck(url, isRetry = false) {
        return new Promise((resolve, reject) => {
            try {
                const urlObj = new URL(url);
                const isHttps = urlObj.protocol === 'https:';
                const client = isHttps ? https : http;
                
                const options = {
                    hostname: urlObj.hostname,
                    port: urlObj.port || (isHttps ? 443 : 80),
                    path: urlObj.pathname + urlObj.search,
                    method: 'HEAD', // HEADリクエストで効率化
                    timeout: this.config.timeout,
                    headers: {
                        'User-Agent': this.config.userAgent
                    }
                };
                
                const req = client.request(options, (res) => {
                    const statusCode = res.statusCode;
                    
                    if (statusCode >= 200 && statusCode < 300) {
                        resolve({
                            valid: true,
                            status: 'ok',
                            statusCode: statusCode,
                            message: `HTTP ${statusCode}`
                        });
                    } else if (statusCode >= 300 && statusCode < 400) {
                        // リダイレクト
                        const location = res.headers.location;
                        resolve({
                            valid: true,
                            status: 'redirect',
                            statusCode: statusCode,
                            redirected: true,
                            finalUrl: location,
                            message: `リダイレクト: HTTP ${statusCode} → ${location}`
                        });
                    } else {
                        resolve({
                            valid: false,
                            status: 'http-error',
                            statusCode: statusCode,
                            message: `HTTP ${statusCode}`
                        });
                    }
                });
                
                req.on('timeout', () => {
                    req.destroy();
                    resolve({
                        valid: false,
                        status: 'timeout',
                        message: 'タイムアウト'
                    });
                });
                
                req.on('error', (error) => {
                    reject(error);
                });
                
                req.end();
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * リクエストキュー処理
     */
    async processRequestQueue() {
        const results = [];
        
        while (this.requestQueue.length > 0) {
            const batch = this.requestQueue.splice(0, this.config.maxConcurrency);
            const batchPromises = batch.map(requestFn => requestFn());
            
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
            
            // レート制限
            if (this.requestQueue.length > 0) {
                await this.sleep(1000);
            }
        }
        
        return results;
    }
    
    /**
     * アンカーリンクチェック
     */
    async checkAnchorLinks(links) {
        for (const link of links) {
            const result = await this.checkAnchorLink(link);
            this.results.links.push(result);
            
            if (result.valid) {
                this.results.summary.valid++;
            } else {
                this.results.summary.invalid++;
            }
        }
    }
    
    /**
     * 個別アンカーリンクチェック
     */
    async checkAnchorLink(link) {
        const result = {
            ...link,
            valid: false,
            status: 'unknown',
            message: ''
        };
        
        try {
            const filePath = path.join(this.projectRoot, link.file);
            const content = fs.readFileSync(filePath, 'utf8');
            const anchorId = link.url.substring(1);
            
            // アンカー検索パターン
            const patterns = [
                new RegExp(`id=["']${anchorId}["']`, 'i'),
                new RegExp(`^#{1,6}\\\\s+.*${anchorId.replace(/-/g, '\\\\s+')}`, 'im'),
                new RegExp(`<[^>]+id=["']${anchorId}["'][^>]*>`, 'i')
            ];
            
            const found = patterns.some(pattern => pattern.test(content));
            
            if (found) {
                result.valid = true;
                result.status = 'ok';
                result.message = 'アンカーが見つかりました';
            } else {
                result.status = 'not-found';
                result.message = 'アンカーが見つかりません';
                
                // 似たようなアンカー提案
                const suggestions = this.findSimilarAnchors(content, anchorId);
                result.suggestions = suggestions;
            }
            
        } catch (error) {
            result.status = 'error';
            result.message = error.message;
        }
        
        return result;
    }
    
    /**
     * 画像リンクチェック
     */
    async checkImageLinks(links) {
        for (const link of links) {
            const result = await this.checkImageLink(link);
            this.results.links.push(result);
            
            if (result.valid) {
                this.results.summary.valid++;
            } else {
                this.results.summary.invalid++;
            }
        }
    }
    
    /**
     * 個別画像リンクチェック
     */
    async checkImageLink(link) {
        const result = {
            ...link,
            valid: false,
            status: 'unknown',
            message: '',
            imageInfo: {}
        };
        
        try {
            // 外部画像URLの場合
            if (link.url.startsWith('http://') || link.url.startsWith('https://')) {
                // 外部画像チェック（簡易的）
                const urlResult = await this.checkExternalUrl(link.url);
                result.valid = urlResult.valid;
                result.status = urlResult.status;
                result.message = urlResult.message;
                return result;
            }
            
            // ローカル画像ファイルチェック
            const baseDir = path.dirname(path.join(this.projectRoot, link.file));
            const imagePath = path.resolve(baseDir, link.url);
            
            if (fs.existsSync(imagePath)) {
                const stat = fs.statSync(imagePath);
                
                result.valid = true;
                result.status = 'ok';
                result.message = '画像ファイルが存在します';
                result.imageInfo = {
                    size: stat.size,
                    sizeFormatted: this.formatFileSize(stat.size),
                    modified: stat.mtime
                };
                
                // 大きすぎる画像に警告
                if (stat.size > 1024 * 1024) { // 1MB
                    result.message += ' (大きなファイルサイズ)';
                }
                
            } else {
                result.status = 'not-found';
                result.message = '画像ファイルが見つかりません';
            }
            
        } catch (error) {
            result.status = 'error';
            result.message = error.message;
        }
        
        return result;
    }
    
    /**
     * 統計計算
     */
    calculateStatistics() {
        const responseTimes = this.results.links
            .filter(link => link.responseTime)
            .map(link => link.responseTime);
        
        if (responseTimes.length > 0) {
            this.results.summary.avgResponseTime = Math.round(
                responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
            );
        }
    }
    
    /**
     * 改善提案生成
     */
    generateSuggestions() {
        const suggestions = [];
        
        // 壊れたリンクの修復提案
        const brokenLinks = this.results.links.filter(link => !link.valid);
        if (brokenLinks.length > 0) {
            suggestions.push({
                type: 'broken-links',
                priority: 'high',
                count: brokenLinks.length,
                message: `${brokenLinks.length} 個の壊れたリンクがあります`,
                action: '各リンクの提案を確認して修正してください'
            });
        }
        
        // レスポンスが遅いリンク
        const slowLinks = this.results.links.filter(
            link => link.responseTime > this.config.responseTimeThresholds.acceptable
        );
        
        if (slowLinks.length > 0) {
            suggestions.push({
                type: 'slow-links',
                priority: 'medium',
                count: slowLinks.length,
                message: `${slowLinks.length} 個のリンクが遅いです`,
                action: 'レスポンスが遅いリンクの確認を検討してください'
            });
        }
        
        // リダイレクトリンク
        const redirectLinks = this.results.links.filter(link => link.redirected);
        if (redirectLinks.length > 0) {
            suggestions.push({
                type: 'redirects',
                priority: 'low',
                count: redirectLinks.length,
                message: `${redirectLinks.length} 個のリンクがリダイレクトされています`,
                action: '直接的なURLに更新することを検討してください'
            });
        }
        
        this.results.suggestions = suggestions;
    }
    
    /**
     * 内部リンク修復提案
     */
    generateInternalLinkSuggestions(targetPath, baseDir) {
        const suggestions = [];
        
        try {
            // 同じディレクトリ内の類似ファイル検索
            const dir = path.dirname(targetPath);
            const targetName = path.basename(targetPath);
            
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir);
                const similarFiles = files.filter(file => {
                    const similarity = this.calculateStringSimilarity(targetName, file);
                    return similarity > 0.7;
                });
                
                similarFiles.forEach(file => {
                    const relativePath = path.relative(baseDir, path.join(dir, file));
                    suggestions.push({
                        type: 'similar-file',
                        suggestion: relativePath,
                        confidence: this.calculateStringSimilarity(targetName, file)
                    });
                });
            }
            
        } catch (error) {
            // エラーは無視
        }
        
        return suggestions;
    }
    
    /**
     * 類似アンカー検索
     */
    findSimilarAnchors(content, targetAnchor) {
        const suggestions = [];
        
        // ヘッダーからアンカーを抽出
        const headers = content.match(/^#{1,6}\\s+(.+)$/gm) || [];
        
        headers.forEach(header => {
            const text = header.replace(/^#{1,6}\\s+/, '');
            const anchorId = text.toLowerCase().replace(/\\s+/g, '-').replace(/[^\\w-]/g, '');
            
            const similarity = this.calculateStringSimilarity(targetAnchor, anchorId);
            if (similarity > 0.6) {
                suggestions.push({
                    type: 'similar-anchor',
                    suggestion: `#${anchorId}`,
                    text: text,
                    confidence: similarity
                });
            }
        });
        
        return suggestions.sort((a, b) => b.confidence - a.confidence);
    }
    
    /**
     * リンク履歴管理
     */
    loadLinkHistory() {
        const historyPath = path.join(__dirname, 'link-history.json');
        
        if (fs.existsSync(historyPath)) {
            try {
                const data = fs.readFileSync(historyPath, 'utf8');
                const history = JSON.parse(data);
                this.linkHistory = new Map(history);
            } catch (error) {
                console.warn('リンク履歴の読み込みに失敗:', error.message);
            }
        }
    }
    
    saveLinkHistory() {
        const historyPath = path.join(__dirname, 'link-history.json');
        
        try {
            const historyArray = Array.from(this.linkHistory.entries());
            fs.writeFileSync(historyPath, JSON.stringify(historyArray, null, 2));
        } catch (error) {
            console.warn('リンク履歴の保存に失敗:', error.message);
        }
    }
    
    updateLinkHistory(url, result) {
        if (!this.linkHistory.has(url)) {
            this.linkHistory.set(url, []);
        }
        
        const history = this.linkHistory.get(url);
        history.push({
            timestamp: Date.now(),
            valid: result.valid,
            status: result.status,
            statusCode: result.statusCode,
            responseTime: result.responseTime
        });
        
        // 履歴サイズ制限
        if (history.length > 10) {
            history.shift();
        }
        
        this.linkHistory.set(url, history);
    }
    
    /**
     * レポート生成
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: this.results.summary,
            suggestions: this.results.suggestions,
            details: {
                byStatus: this.groupLinksByStatus(),
                byType: this.groupLinksByType(),
                slowest: this.getSlowentLinks(10),
                mostProblematic: this.getMostProblematicFiles()
            }
        };
        
        return report;
    }
    
    groupLinksByStatus() {
        const groups = {};
        
        this.results.links.forEach(link => {
            const status = link.status || 'unknown';
            if (!groups[status]) {
                groups[status] = [];
            }
            groups[status].push(link);
        });
        
        return groups;
    }
    
    groupLinksByType() {
        const groups = {};
        
        this.results.links.forEach(link => {
            const type = link.type || 'unknown';
            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(link);
        });
        
        return groups;
    }
    
    getSlowentLinks(limit = 10) {
        return this.results.links
            .filter(link => link.responseTime)
            .sort((a, b) => b.responseTime - a.responseTime)
            .slice(0, limit);
    }
    
    getMostProblematicFiles() {
        const fileProblems = {};
        
        this.results.links.forEach(link => {
            if (!link.valid) {
                const file = link.file;
                if (!fileProblems[file]) {
                    fileProblems[file] = 0;
                }
                fileProblems[file]++;
            }
        });
        
        return Object.entries(fileProblems)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([file, count]) => ({ file, problemCount: count }));
    }
    
    /**
     * 結果出力
     */
    printResults() {
        console.log('\\n📊 リンクチェック結果');
        console.log('═'.repeat(50));
        console.log(`🔗 総リンク数: ${this.results.summary.total}`);
        console.log(`✅ 有効: ${this.results.summary.valid}`);
        console.log(`❌ 無効: ${this.results.summary.invalid}`);
        console.log(`🐌 遅い: ${this.results.summary.slow}`);
        console.log(`🔄 リダイレクト: ${this.results.summary.redirects}`);
        console.log(`⏰ タイムアウト: ${this.results.summary.timeouts}`);
        
        if (this.results.summary.avgResponseTime > 0) {
            console.log(`⏱️  平均レスポンス時間: ${this.results.summary.avgResponseTime}ms`);
        }
        
        const successRate = Math.round((this.results.summary.valid / this.results.summary.total) * 100);
        console.log(`📈 成功率: ${successRate}%`);
        
        // エラー詳細
        const errors = this.results.links.filter(link => !link.valid);
        if (errors.length > 0) {
            console.log('\\n❌ エラー詳細:');
            errors.slice(0, 10).forEach(error => {
                console.log(`   • ${error.file}:${error.line} - ${error.message}`);
                if (error.suggestions && error.suggestions.length > 0) {
                    error.suggestions.slice(0, 2).forEach(suggestion => {
                        console.log(`     💡 提案: ${suggestion.suggestion}`);
                    });
                }
            });
            
            if (errors.length > 10) {
                console.log(`   ... および ${errors.length - 10} 件の追加エラー`);
            }
        }
        
        // 改善提案
        if (this.results.suggestions.length > 0) {
            console.log('\\n💡 改善提案:');
            this.results.suggestions.forEach(suggestion => {
                console.log(`   • ${suggestion.message}`);
                console.log(`     👉 ${suggestion.action}`);
            });
        }
    }
    
    /**
     * ユーティリティメソッド
     */
    getLineNumber(content, index) {
        return content.substring(0, index).split('\\n').length;
    }
    
    calculateStringSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) {
            return 1.0;
        }
        
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }
    
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
    
    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * CLI インターフェース
 */
class LinkCheckerCLI {
    constructor() {
        this.checker = new AdvancedLinkChecker();
    }
    
    async run() {
        const args = process.argv.slice(2);
        
        const options = {
            checkExternal: !args.includes('--no-external'),
            saveReport: !args.includes('--no-report'),
            verbose: args.includes('--verbose')
        };
        
        if (args.includes('--help')) {
            this.printHelp();
            return;
        }
        
        console.log('🔗 BubblePop リンクチェッカー\\n');
        
        const result = await this.checker.checkLinks(options);
        
        this.checker.printResults();
        
        if (options.saveReport) {
            const report = this.checker.generateReport();
            await this.saveReport(report);
        }
        
        process.exit(result.success ? 0 : 1);
    }
    
    async saveReport(report) {
        const reportsDir = path.join(this.checker.projectRoot, 'reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir);
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportPath = path.join(reportsDir, `link-check-${timestamp}.json`);
        
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\\n📊 レポートを保存しました: ${reportPath}`);
    }
    
    printHelp() {
        console.log(`
🔗 BubblePop リンクチェッカー

使用方法:
  node tools/link-checker.js [オプション]

オプション:
  --no-external    外部リンクをチェックしない
  --no-report      レポートファイルを生成しない
  --verbose        詳細な出力を表示する
  --help           このヘルプを表示する

例:
  node tools/link-checker.js
  node tools/link-checker.js --no-external
  node tools/link-checker.js --verbose --no-report
        `);
    }
}

// CLI として実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
    const cli = new LinkCheckerCLI();
    cli.run().catch(error => {
        console.error('予期しないエラーが発生しました:', error);
        process.exit(1);
    });
}

export { AdvancedLinkChecker, LinkCheckerCLI };