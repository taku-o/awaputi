#!/usr/bin/env node

/**
 * ドキュメント管理・検証ツール
 * 
 * 機能:
 * - ドキュメント整合性チェック
 * - リンク検証（内部・外部）
 * - コンテンツ検証ルール
 * - 更新通知システム
 * - 品質レポート生成
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DocumentationValidator {
    constructor() {
        this.projectRoot = path.join(__dirname, '..');
        this.docsDir = path.join(this.projectRoot, 'docs');
        this.srcDir = path.join(this.projectRoot, 'src');
        
        // 検証ルール設定
        this.validationRules = {
            // 必須セクション
            requiredSections: {
                'setup-guide.md': ['概要', '前提条件', '環境構築手順', 'トラブルシューティング'],
                'contribution-guide.md': ['概要', 'コントリビューション手順', 'コーディング規約', 'レビュープロセス'],
                'architecture-guide.md': ['概要', 'アーキテクチャ原則', 'システムアーキテクチャ', '設計パターン'],
                'troubleshooting-guide.md': ['概要', '開発環境の問題', 'ゲーム実行時の問題', 'テスト関連の問題']
            },
            
            // リンクパターン
            linkPatterns: {
                internal: /\[([^\]]+)\]\(([^)]+\.md[^)]*)\)/g,
                external: /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
                anchor: /\[([^\]]+)\]\(#([^)]+)\)/g,
                image: /!\[([^\]]*)\]\(([^)]+)\)/g
            },
            
            // 品質ルール
            qualityRules: {
                maxLineLength: 120,
                minSectionWords: 50,
                maxFileSize: 500000, // 500KB
                requiredCodeBlocks: ['```javascript', '```bash', '```json']
            }
        };
        
        // 検証結果
        this.results = {
            files: [],
            errors: [],
            warnings: [],
            info: [],
            stats: {
                totalFiles: 0,
                validFiles: 0,
                brokenLinks: 0,
                externalLinksChecked: 0,
                imagesMissing: 0
            }
        };
        
        // 外部リンクキャッシュ（レート制限対策）
        this.linkCache = new Map();
        this.linkCheckDelay = 500; // 500ms delay between external link checks
    }
    
    /**
     * メイン検証プロセス実行
     */
    async validate(options = {}) {
        console.log('🔍 ドキュメント検証を開始します...\n');
        
        const startTime = Date.now();
        
        try {
            // 設定ファイル読み込み
            await this.loadConfiguration();
            
            // ドキュメントファイル収集
            const docFiles = await this.collectDocumentationFiles();
            this.results.stats.totalFiles = docFiles.length;
            
            console.log(`📄 ${docFiles.length} 個のドキュメントファイルを発見`);
            
            // 各ファイルの検証
            for (const filePath of docFiles) {
                await this.validateFile(filePath);
            }
            
            // 相互参照チェック
            if (options.checkCrossReferences) {
                await this.validateCrossReferences();
            }
            
            // 外部リンクチェック
            if (options.checkExternalLinks) {
                await this.validateExternalLinks();
            }
            
            // API ドキュメントとの同期チェック
            if (options.checkApiSync) {
                await this.validateApiDocumentationSync();
            }
            
            // レポート生成
            const report = this.generateReport();
            
            const endTime = Date.now();
            const duration = Math.round((endTime - startTime) / 1000);
            
            console.log(`\\n✅ 検証完了 (${duration}秒)`);
            
            // レポート保存
            if (options.saveReport) {
                await this.saveReport(report);
            }
            
            // 結果出力
            this.printSummary();
            
            return {
                success: this.results.errors.length === 0,
                results: this.results,
                report: report
            };
            
        } catch (error) {
            console.error('❌ 検証プロセスでエラーが発生しました:', error);
            return {
                success: false,
                error: error.message,
                results: this.results
            };
        }
    }
    
    /**
     * 設定ファイル読み込み
     */
    async loadConfiguration() {
        const configPath = path.join(__dirname, 'doc-validation-config.json');
        
        if (fs.existsSync(configPath)) {
            try {
                const configContent = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configContent);
                
                // 設定をマージ
                this.validationRules = { ...this.validationRules, ...config.validationRules };
                
                console.log('📋 カスタム検証設定を読み込み');
            } catch (error) {
                console.warn('⚠️ 設定ファイルの読み込みに失敗:', error.message);
            }
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
                    // node_modules などを除外
                    if (!item.startsWith('.') && item !== 'node_modules') {
                        scanDirectory(itemPath);
                    }
                } else if (item.endsWith('.md')) {
                    files.push(itemPath);
                }
            }
        };
        
        // docs/ ディレクトリをスキャン
        scanDirectory(this.docsDir);
        
        // ルートの README.md と CLAUDE.md も含める
        const rootMdFiles = ['README.md', 'CLAUDE.md'];
        for (const file of rootMdFiles) {
            const filePath = path.join(this.projectRoot, file);
            if (fs.existsSync(filePath)) {
                files.push(filePath);
            }
        }
        
        return files.sort();
    }
    
    /**
     * 個別ファイル検証
     */
    async validateFile(filePath) {
        const relativePath = path.relative(this.projectRoot, filePath);
        console.log(`📝 検証中: ${relativePath}`);
        
        const fileResult = {
            path: relativePath,
            errors: [],
            warnings: [],
            info: [],
            stats: {
                lines: 0,
                words: 0,
                characters: 0,
                sections: 0,
                links: 0,
                images: 0
            }
        };
        
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\\n');
            
            // 基本統計
            fileResult.stats.lines = lines.length;
            fileResult.stats.words = content.split(/\\s+/).length;
            fileResult.stats.characters = content.length;
            
            // ファイルサイズチェック
            if (content.length > this.validationRules.qualityRules.maxFileSize) {
                fileResult.warnings.push({
                    type: 'file-size',
                    message: `ファイルサイズが大きすぎます (${Math.round(content.length/1024)}KB > ${Math.round(this.validationRules.qualityRules.maxFileSize/1024)}KB)`,
                    line: 0
                });
            }
            
            // セクション構造チェック
            await this.validateSections(content, fileResult, relativePath);
            
            // リンクチェック
            await this.validateLinks(content, fileResult, filePath);
            
            // 画像チェック
            await this.validateImages(content, fileResult, filePath);
            
            // コンテンツ品質チェック
            await this.validateContentQuality(content, lines, fileResult);
            
            // コードブロックチェック
            await this.validateCodeBlocks(content, fileResult, relativePath);
            
            // 日本語文字化けチェック
            await this.validateJapaneseContent(content, fileResult);
            
            this.results.files.push(fileResult);
            
            if (fileResult.errors.length === 0) {
                this.results.stats.validFiles++;
            }
            
            // エラー・警告をグローバル結果に追加
            this.results.errors.push(...fileResult.errors);
            this.results.warnings.push(...fileResult.warnings);
            this.results.info.push(...fileResult.info);
            
        } catch (error) {
            fileResult.errors.push({
                type: 'read-error',
                message: `ファイル読み込みエラー: ${error.message}`,
                line: 0
            });
            
            this.results.files.push(fileResult);
            this.results.errors.push(...fileResult.errors);
        }
    }
    
    /**
     * セクション構造検証
     */
    async validateSections(content, fileResult, relativePath) {
        const fileName = path.basename(relativePath);
        const requiredSections = this.validationRules.requiredSections[fileName] || [];
        
        // ヘッダー抽出
        const headers = [];
        const lines = content.split('\\n');
        
        lines.forEach((line, index) => {
            const headerMatch = line.match(/^(#{1,6})\\s+(.+)$/);
            if (headerMatch) {
                headers.push({
                    level: headerMatch[1].length,
                    text: headerMatch[2].trim(),
                    line: index + 1
                });
            }
        });
        
        fileResult.stats.sections = headers.length;
        
        // 必須セクションチェック
        for (const requiredSection of requiredSections) {
            const found = headers.some(header => 
                header.text.includes(requiredSection) || 
                requiredSection.includes(header.text)
            );
            
            if (!found) {
                fileResult.errors.push({
                    type: 'missing-section',
                    message: `必須セクション「${requiredSection}」が見つかりません`,
                    line: 0
                });
            }
        }
        
        // ヘッダー階層チェック
        let previousLevel = 0;
        for (const header of headers) {
            if (header.level > previousLevel + 1) {
                fileResult.warnings.push({
                    type: 'header-hierarchy',
                    message: `ヘッダー階層が飛んでいます (H${previousLevel} → H${header.level})`,
                    line: header.line,
                    section: header.text
                });
            }
            previousLevel = header.level;
        }
        
        // 最小単語数チェック（セクションごと）
        let currentSection = '';
        let sectionContent = '';
        
        lines.forEach(line => {
            const headerMatch = line.match(/^#{1,6}\\s+(.+)$/);
            if (headerMatch) {
                // 前のセクションをチェック
                if (currentSection && sectionContent.trim()) {
                    const words = sectionContent.trim().split(/\\s+/).length;
                    if (words < this.validationRules.qualityRules.minSectionWords) {
                        fileResult.warnings.push({
                            type: 'short-section',
                            message: `セクション「${currentSection}」の文字数が少なすぎます (${words}語 < ${this.validationRules.qualityRules.minSectionWords}語)`,
                            line: 0,
                            section: currentSection
                        });
                    }
                }
                
                currentSection = headerMatch[1];
                sectionContent = '';
            } else {
                sectionContent += line + '\\n';
            }
        });
    }
    
    /**
     * リンク検証
     */
    async validateLinks(content, fileResult, filePath) {
        const baseDir = path.dirname(filePath);
        
        // 内部リンクチェック
        const internalLinks = [...content.matchAll(this.validationRules.linkPatterns.internal)];
        
        for (const match of internalLinks) {
            const linkText = match[1];
            const linkPath = match[2];
            
            // 相対パスを絶対パスに変換
            const targetPath = path.resolve(baseDir, linkPath);
            
            if (!fs.existsSync(targetPath)) {
                fileResult.errors.push({
                    type: 'broken-link',
                    message: `内部リンク切れ: "${linkText}" → ${linkPath}`,
                    line: this.getLineNumber(content, match.index),
                    link: linkPath
                });
                this.results.stats.brokenLinks++;
            }
        }
        
        // アンカーリンクチェック
        const anchorLinks = [...content.matchAll(this.validationRules.linkPatterns.anchor)];
        
        for (const match of anchorLinks) {
            const linkText = match[1];
            const anchorId = match[2];
            
            // アンカーIDが存在するかチェック（簡易的）
            const anchorExists = content.includes(`id="${anchorId}"`) || 
                                content.includes(`# ${anchorId.replace(/-/g, ' ')}`) ||
                                content.includes(`## ${anchorId.replace(/-/g, ' ')}`);
            
            if (!anchorExists) {
                fileResult.warnings.push({
                    type: 'anchor-not-found',
                    message: `アンカーリンク「#${anchorId}」に対応するセクションが見つかりません`,
                    line: this.getLineNumber(content, match.index),
                    anchor: anchorId
                });
            }
        }
        
        // 外部リンク収集（後で一括チェック）
        const externalLinks = [...content.matchAll(this.validationRules.linkPatterns.external)];
        fileResult.stats.links = internalLinks.length + externalLinks.length + anchorLinks.length;
        
        // 外部リンクを後でチェックするためにキューに追加
        for (const match of externalLinks) {
            if (!this.externalLinksQueue) {
                this.externalLinksQueue = [];
            }
            
            this.externalLinksQueue.push({
                fileResult: fileResult,
                linkText: match[1],
                url: match[2],
                line: this.getLineNumber(content, match.index)
            });
        }
    }
    
    /**
     * 画像検証
     */
    async validateImages(content, fileResult, filePath) {
        const baseDir = path.dirname(filePath);
        const images = [...content.matchAll(this.validationRules.linkPatterns.image)];
        
        fileResult.stats.images = images.length;
        
        for (const match of images) {
            const altText = match[1];
            const imagePath = match[2];
            
            // 外部URLの場合はスキップ
            if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                continue;
            }
            
            const targetPath = path.resolve(baseDir, imagePath);
            
            if (!fs.existsSync(targetPath)) {
                fileResult.errors.push({
                    type: 'missing-image',
                    message: `画像ファイルが見つかりません: ${imagePath}`,
                    line: this.getLineNumber(content, match.index),
                    image: imagePath
                });
                this.results.stats.imagesMissing++;
            }
            
            // alt テキストのチェック
            if (!altText.trim()) {
                fileResult.warnings.push({
                    type: 'missing-alt-text',
                    message: `画像にalt属性がありません: ${imagePath}`,
                    line: this.getLineNumber(content, match.index),
                    image: imagePath
                });
            }
        }
    }
    
    /**
     * コンテンツ品質検証
     */
    async validateContentQuality(content, lines, fileResult) {
        // 行長チェック
        lines.forEach((line, index) => {
            if (line.length > this.validationRules.qualityRules.maxLineLength) {
                fileResult.warnings.push({
                    type: 'long-line',
                    message: `行が長すぎます (${line.length} > ${this.validationRules.qualityRules.maxLineLength})`,
                    line: index + 1
                });
            }
        });
        
        // 重複セクションチェック
        const sectionTitles = [];
        lines.forEach((line, index) => {
            const headerMatch = line.match(/^#{1,6}\\s+(.+)$/);
            if (headerMatch) {
                const title = headerMatch[1].trim();
                if (sectionTitles.includes(title)) {
                    fileResult.warnings.push({
                        type: 'duplicate-section',
                        message: `重複するセクションタイトル: "${title}"`,
                        line: index + 1
                    });
                }
                sectionTitles.push(title);
            }
        });
        
        // TODOやFIXMEの検出
        lines.forEach((line, index) => {
            if (line.includes('TODO') || line.includes('FIXME') || line.includes('XXX')) {
                fileResult.info.push({
                    type: 'todo-found',
                    message: `TODO/FIXME が見つかりました: ${line.trim()}`,
                    line: index + 1
                });
            }
        });
    }
    
    /**
     * コードブロック検証
     */
    async validateCodeBlocks(content, fileResult, relativePath) {
        const codeBlocks = content.match(/```[\\s\\S]*?```/g) || [];
        
        // 技術ドキュメントには最低限のコードブロックが必要
        const technicalDocs = ['setup-guide.md', 'contribution-guide.md', 'architecture-guide.md', 'troubleshooting-guide.md'];
        const fileName = path.basename(relativePath);
        
        if (technicalDocs.includes(fileName) && codeBlocks.length === 0) {
            fileResult.warnings.push({
                type: 'no-code-blocks',
                message: '技術ドキュメントにコードブロックがありません',
                line: 0
            });
        }
        
        // コードブロックの言語指定チェック
        codeBlocks.forEach((block, index) => {
            const firstLine = block.split('\\n')[0];
            if (firstLine === '```') {
                fileResult.warnings.push({
                    type: 'no-language-specified',
                    message: `コードブロック ${index + 1} に言語指定がありません`,
                    line: this.getLineNumber(content, content.indexOf(block))
                });
            }
        });
    }
    
    /**
     * 日本語コンテンツ検証
     */
    async validateJapaneseContent(content, fileResult) {
        // 文字化けパターンチェック
        const mojibakePatterns = [
            /\\?{2,}/g,  // ??? のような文字化け
            /[�]+/g,     // 置換文字
            /\\\\u[0-9a-fA-F]{4}/g  // エスケープされたUnicode
        ];
        
        mojibakePatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                fileResult.warnings.push({
                    type: 'possible-mojibake',
                    message: `文字化けの可能性があります: ${matches[0]}`,
                    line: this.getLineNumber(content, content.indexOf(matches[0]))
                });
            }
        });
        
        // 半角・全角の統一チェック
        const inconsistentPatterns = [
            { pattern: /[０-９]/g, message: '全角数字が使用されています（半角推奨）' },
            { pattern: /[Ａ-Ｚａ-ｚ]/g, message: '全角英字が使用されています（半角推奨）' }
        ];
        
        inconsistentPatterns.forEach(({ pattern, message }) => {
            const matches = content.match(pattern);
            if (matches && matches.length > 5) { // 少数は許容
                fileResult.info.push({
                    type: 'character-inconsistency',
                    message: `${message} (${matches.length}箇所)`,
                    line: 0
                });
            }
        });
    }
    
    /**
     * 外部リンク検証
     */
    async validateExternalLinks() {
        if (!this.externalLinksQueue || this.externalLinksQueue.length === 0) {
            return;
        }
        
        console.log(`\\n🌐 外部リンクチェック中 (${this.externalLinksQueue.length}個)...`);
        
        for (const { fileResult, linkText, url, line } of this.externalLinksQueue) {
            try {
                // キャッシュチェック
                if (this.linkCache.has(url)) {
                    const cached = this.linkCache.get(url);
                    if (!cached.valid) {
                        fileResult.errors.push({
                            type: 'broken-external-link',
                            message: `外部リンク切れ: "${linkText}" → ${url} (${cached.error})`,
                            line: line,
                            url: url
                        });
                    }
                    continue;
                }
                
                const isValid = await this.checkExternalLink(url);
                this.linkCache.set(url, { valid: isValid.valid, error: isValid.error });
                
                if (!isValid.valid) {
                    fileResult.errors.push({
                        type: 'broken-external-link',
                        message: `外部リンク切れ: "${linkText}" → ${url} (${isValid.error})`,
                        line: line,
                        url: url
                    });
                    this.results.stats.brokenLinks++;
                }
                
                this.results.stats.externalLinksChecked++;
                
                // レート制限対策
                await this.sleep(this.linkCheckDelay);
                
            } catch (error) {
                fileResult.warnings.push({
                    type: 'external-link-check-failed',
                    message: `外部リンクチェックに失敗: ${url} (${error.message})`,
                    line: line,
                    url: url
                });
            }
        }
    }
    
    /**
     * 外部リンクチェック実行
     */
    async checkExternalLink(url) {
        return new Promise((resolve) => {
            const isHttps = url.startsWith('https:');
            const client = isHttps ? https : http;
            
            const timeout = 10000; // 10秒タイムアウト
            
            const req = client.get(url, { timeout }, (res) => {
                if (res.statusCode >= 200 && res.statusCode < 400) {
                    resolve({ valid: true });
                } else if (res.statusCode >= 300 && res.statusCode < 400) {
                    // リダイレクト - 通常は有効とみなす
                    resolve({ valid: true });
                } else {
                    resolve({ valid: false, error: `HTTP ${res.statusCode}` });
                }
            });
            
            req.on('timeout', () => {
                req.destroy();
                resolve({ valid: false, error: 'タイムアウト' });
            });
            
            req.on('error', (error) => {
                resolve({ valid: false, error: error.message });
            });
        });
    }
    
    /**
     * 相互参照検証
     */
    async validateCrossReferences() {
        console.log('\\n🔗 相互参照チェック中...');
        
        // APIドキュメントと開発者ガイドの整合性
        const apiDocsPath = path.join(this.docsDir, 'api-reference');
        const devGuidesPath = path.join(this.docsDir, 'developer-guides');
        
        if (fs.existsSync(apiDocsPath) && fs.existsSync(devGuidesPath)) {
            // 開発者ガイドからAPIドキュメントへの参照チェック
            const devGuideFiles = fs.readdirSync(devGuidesPath).filter(f => f.endsWith('.md'));
            
            for (const guideFile of devGuideFiles) {
                const guidePath = path.join(devGuidesPath, guideFile);
                const content = fs.readFileSync(guidePath, 'utf8');
                
                // API参照パターンを検索
                const apiReferences = content.match(/\\[([^\\]]+)\\]\\(\\.\\.\/api-reference\/([^)]+)\\)/g) || [];
                
                for (const ref of apiReferences) {
                    const match = ref.match(/\\[([^\\]]+)\\]\\(\\.\\.\/api-reference\/([^)]+)\\)/);
                    if (match) {
                        const targetFile = match[2];
                        const targetPath = path.join(apiDocsPath, targetFile);
                        
                        if (!fs.existsSync(targetPath)) {
                            this.results.errors.push({
                                type: 'broken-api-reference',
                                message: `APIドキュメント参照切れ: ${guideFile} → ${targetFile}`,
                                file: guideFile,
                                target: targetFile
                            });
                        }
                    }
                }
            }
        }
    }
    
    /**
     * APIドキュメント同期チェック
     */
    async validateApiDocumentationSync() {
        console.log('\\n📋 APIドキュメント同期チェック中...');
        
        // ソースコードのクラス・関数とAPIドキュメントの同期チェック
        const srcFiles = this.getAllJsFiles(this.srcDir);
        const apiDocsPath = path.join(this.docsDir, 'api-reference');
        
        if (!fs.existsSync(apiDocsPath)) {
            this.results.warnings.push({
                type: 'no-api-docs',
                message: 'APIドキュメントディレクトリが見つかりません',
                file: 'api-reference/'
            });
            return;
        }
        
        for (const srcFile of srcFiles) {
            const content = fs.readFileSync(srcFile, 'utf8');
            const relativePath = path.relative(this.srcDir, srcFile);
            
            // クラス名抽出
            const classMatches = content.match(/class\\s+(\\w+)/g) || [];
            
            for (const match of classMatches) {
                const className = match.replace('class ', '');
                const expectedDocPath = path.join(apiDocsPath, `${className}.md`);
                
                if (!fs.existsSync(expectedDocPath)) {
                    this.results.warnings.push({
                        type: 'missing-api-doc',
                        message: `クラス「${className}」のAPIドキュメントが見つかりません`,
                        file: relativePath,
                        class: className
                    });
                }
            }
        }
    }
    
    /**
     * レポート生成
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                ...this.results.stats,
                errorCount: this.results.errors.length,
                warningCount: this.results.warnings.length,
                infoCount: this.results.info.length,
                successRate: Math.round((this.results.stats.validFiles / this.results.stats.totalFiles) * 100)
            },
            files: this.results.files,
            issues: {
                errors: this.results.errors,
                warnings: this.results.warnings,
                info: this.results.info
            },
            recommendations: this.generateRecommendations()
        };
        
        return report;
    }
    
    /**
     * 改善推奨事項生成
     */
    generateRecommendations() {
        const recommendations = [];
        
        // エラー数に基づく推奨
        if (this.results.errors.length > 10) {
            recommendations.push({
                priority: 'high',
                category: 'quality',
                message: '多数のエラーが検出されました。段階的に修正することを推奨します。',
                action: 'エラーを種類別に分類し、優先度の高いものから修正してください。'
            });
        }
        
        // リンク切れに関する推奨
        if (this.results.stats.brokenLinks > 5) {
            recommendations.push({
                priority: 'medium',
                category: 'links',
                message: 'リンク切れが多数検出されました。',
                action: 'リンクの定期的なチェックを自動化することを検討してください。'
            });
        }
        
        // ファイル数に基づく推奨
        if (this.results.stats.totalFiles > 50) {
            recommendations.push({
                priority: 'low',
                category: 'organization',
                message: 'ドキュメント数が多くなっています。',
                action: 'ドキュメントの分類・整理を検討してください。'
            });
        }
        
        return recommendations;
    }
    
    /**
     * レポート保存
     */
    async saveReport(report) {
        const reportsDir = path.join(this.projectRoot, 'reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir);
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportPath = path.join(reportsDir, `doc-validation-${timestamp}.json`);
        
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\\n📊 レポートを保存しました: ${reportPath}`);
        
        // 最新レポートのシンボリックリンク作成
        const latestPath = path.join(reportsDir, 'doc-validation-latest.json');
        if (fs.existsSync(latestPath)) {
            fs.unlinkSync(latestPath);
        }
        fs.symlinkSync(path.basename(reportPath), latestPath);
    }
    
    /**
     * 結果サマリー出力
     */
    printSummary() {
        console.log('\\n📊 検証結果サマリー');
        console.log('═'.repeat(50));
        console.log(`📄 総ファイル数: ${this.results.stats.totalFiles}`);
        console.log(`✅ 有効ファイル数: ${this.results.stats.validFiles}`);
        console.log(`❌ エラー数: ${this.results.errors.length}`);
        console.log(`⚠️  警告数: ${this.results.warnings.length}`);
        console.log(`ℹ️  情報数: ${this.results.info.length}`);
        console.log(`🔗 チェックしたリンク数: ${this.results.stats.externalLinksChecked}`);
        console.log(`💔 リンク切れ数: ${this.results.stats.brokenLinks}`);
        console.log(`🖼️  見つからない画像数: ${this.results.stats.imagesMissing}`);
        
        const successRate = Math.round((this.results.stats.validFiles / this.results.stats.totalFiles) * 100);
        console.log(`📈 成功率: ${successRate}%`);
        
        // エラーの詳細
        if (this.results.errors.length > 0) {
            console.log('\\n❌ エラー詳細:');
            this.results.errors.slice(0, 10).forEach(error => {
                console.log(`   • ${error.message} ${error.file ? `(${error.file})` : ''}`);
            });
            
            if (this.results.errors.length > 10) {
                console.log(`   ... および ${this.results.errors.length - 10} 件の追加エラー`);
            }
        }
        
        // 警告の概要
        if (this.results.warnings.length > 0) {
            console.log('\\n⚠️  警告概要:');
            const warningTypes = {};
            this.results.warnings.forEach(warning => {
                warningTypes[warning.type] = (warningTypes[warning.type] || 0) + 1;
            });
            
            Object.entries(warningTypes).forEach(([type, count]) => {
                console.log(`   • ${type}: ${count}件`);
            });
        }
    }
    
    /**
     * ユーティリティメソッド
     */
    getLineNumber(content, index) {
        return content.substring(0, index).split('\\n').length;
    }
    
    getAllJsFiles(dir) {
        const files = [];
        
        const scanDir = (currentDir) => {
            if (!fs.existsSync(currentDir)) return;
            
            const items = fs.readdirSync(currentDir);
            
            for (const item of items) {
                const itemPath = path.join(currentDir, item);
                const stat = fs.statSync(itemPath);
                
                if (stat.isDirectory()) {
                    if (!item.startsWith('.') && item !== 'node_modules') {
                        scanDir(itemPath);
                    }
                } else if (item.endsWith('.js')) {
                    files.push(itemPath);
                }
            }
        };
        
        scanDir(dir);
        return files;
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * CLI インターフェース
 */
class DocumentationValidatorCLI {
    constructor() {
        this.validator = new DocumentationValidator();
    }
    
    async run() {
        const args = process.argv.slice(2);
        
        const options = {
            checkExternalLinks: args.includes('--external-links'),
            checkCrossReferences: args.includes('--cross-references'),
            checkApiSync: args.includes('--api-sync'),
            saveReport: !args.includes('--no-report'),
            verbose: args.includes('--verbose')
        };
        
        if (args.includes('--help')) {
            this.printHelp();
            return;
        }
        
        console.log('🚀 BubblePop ドキュメント検証ツール\\n');
        
        const result = await this.validator.validate(options);
        
        if (result.success) {
            console.log('\\n🎉 検証が正常に完了しました！');
            process.exit(0);
        } else {
            console.log('\\n❌ 検証でエラーが発生しました。');
            process.exit(1);
        }
    }
    
    printHelp() {
        console.log(`
🚀 BubblePop ドキュメント検証ツール

使用方法:
  node tools/doc-validator.js [オプション]

オプション:
  --external-links     外部リンクもチェックする
  --cross-references   相互参照チェックを実行する
  --api-sync          APIドキュメント同期チェックを実行する
  --no-report         レポートファイルを生成しない
  --verbose           詳細な出力を表示する
  --help              このヘルプを表示する

例:
  node tools/doc-validator.js
  node tools/doc-validator.js --external-links --api-sync
  node tools/doc-validator.js --verbose --no-report
        `);
    }
}

// CLI として実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
    const cli = new DocumentationValidatorCLI();
    cli.run().catch(error => {
        console.error('予期しないエラーが発生しました:', error);
        process.exit(1);
    });
}

export { DocumentationValidator, DocumentationValidatorCLI };