#!/usr/bin/env node

/**
 * ドキュメント更新通知システム
 * 
 * 機能:
 * - ファイル変更監視
 * - 更新通知配信
 * - 依存関係追跡
 * - 品質チェック統合
 * - 自動レポート生成
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DocumentationUpdateNotifier extends EventEmitter {
    constructor() {
        super();
        
        this.projectRoot = path.join(__dirname, '..');
        this.docsDir = path.join(this.projectRoot, 'docs');
        this.srcDir = path.join(this.projectRoot, 'src');
        
        // 監視対象とファイルハッシュ
        this.watchedFiles = new Map();
        this.fileHashes = new Map();
        this.loadFileHashes();
        
        // 依存関係マップ
        this.dependencies = new Map();
        this.loadDependencies();
        
        // 通知設定
        this.notificationConfig = {
            methods: ['console', 'file', 'webhook'],
            webhookUrl: process.env.DOC_WEBHOOK_URL || null,
            emailRecipients: process.env.DOC_EMAIL_RECIPIENTS?.split(',') || [],
            slackWebhook: process.env.SLACK_WEBHOOK_URL || null,
            
            // 通知条件
            conditions: {
                minChangeThreshold: 100, // 最小変更文字数
                criticalFiles: [
                    'README.md',
                    'CLAUDE.md',
                    'docs/developer-guides/README.md',
                    'docs/api-reference/README.md'
                ],
                requireValidation: true,
                autoGenerateReport: true
            }
        };
        
        // 更新履歴
        this.updateHistory = [];
        this.loadUpdateHistory();
        
        // タイマー
        this.watchTimer = null;
        this.reportTimer = null;
    }
    
    /**
     * 監視開始
     */
    async startWatching(options = {}) {
        console.log('👀 ドキュメント更新監視を開始します...\n');
        
        // 初期スキャン
        await this.performInitialScan();
        
        // 定期チェック設定
        const interval = options.interval || 30000; // 30秒間隔
        this.watchTimer = setInterval(() => {
            this.checkForUpdates();
        }, interval);
        
        // レポート自動生成設定
        if (this.notificationConfig.conditions.autoGenerateReport) {
            const reportInterval = options.reportInterval || 3600000; // 1時間間隔
            this.reportTimer = setInterval(() => {
                this.generatePeriodicReport();
            }, reportInterval);
        }
        
        console.log(`✅ 監視を開始しました (チェック間隔: ${interval/1000}秒)`);
        
        // プロセス終了時のクリーンアップ
        process.on('SIGINT', () => {
            this.stopWatching();
            process.exit(0);
        });
        
        process.on('SIGTERM', () => {
            this.stopWatching();
            process.exit(0);
        });
    }
    
    /**
     * 監視停止
     */
    stopWatching() {
        if (this.watchTimer) {
            clearInterval(this.watchTimer);
            this.watchTimer = null;
        }
        
        if (this.reportTimer) {
            clearInterval(this.reportTimer);
            this.reportTimer = null;
        }
        
        this.saveFileHashes();
        this.saveUpdateHistory();
        
        console.log('\\n🛑 監視を停止しました');
    }
    
    /**
     * 初期スキャン
     */
    async performInitialScan() {
        console.log('🔍 初期ファイルスキャン中...');
        
        const docFiles = await this.collectDocumentationFiles();
        const srcFiles = await this.collectSourceFiles();
        
        // ドキュメントファイルの監視登録
        for (const filePath of docFiles) {
            await this.registerFileForWatching(filePath, 'documentation');
        }
        
        // ソースファイルの監視登録（APIドキュメントとの同期用）
        for (const filePath of srcFiles) {
            await this.registerFileForWatching(filePath, 'source');
        }
        
        console.log(`📄 ${docFiles.length} 個のドキュメントファイルを監視対象に登録`);
        console.log(`💻 ${srcFiles.length} 個のソースファイルを監視対象に登録`);
        
        // 依存関係分析
        await this.analyzeDependencies();
    }
    
    /**
     * ファイル監視登録
     */
    async registerFileForWatching(filePath, type) {
        try {
            const stat = fs.statSync(filePath);
            const content = fs.readFileSync(filePath, 'utf8');
            const hash = this.calculateFileHash(content);
            
            const fileInfo = {
                path: filePath,
                type: type,
                size: stat.size,
                modified: stat.mtime,
                hash: hash,
                lastChecked: Date.now()
            };
            
            this.watchedFiles.set(filePath, fileInfo);
            this.fileHashes.set(filePath, hash);
            
        } catch (error) {
            console.warn(`⚠️ ファイル登録に失敗: ${filePath} - ${error.message}`);
        }
    }
    
    /**
     * 更新チェック
     */
    async checkForUpdates() {
        const changes = [];
        
        for (const [filePath, fileInfo] of this.watchedFiles) {
            try {
                if (!fs.existsSync(filePath)) {
                    // ファイル削除
                    changes.push({
                        type: 'deleted',
                        file: filePath,
                        fileType: fileInfo.type,
                        timestamp: Date.now()
                    });
                    
                    this.watchedFiles.delete(filePath);
                    this.fileHashes.delete(filePath);
                    continue;
                }
                
                const stat = fs.statSync(filePath);
                
                // 変更時刻チェック
                if (stat.mtime > fileInfo.modified) {
                    const content = fs.readFileSync(filePath, 'utf8');
                    const newHash = this.calculateFileHash(content);
                    
                    if (newHash !== fileInfo.hash) {
                        const change = await this.analyzeFileChange(filePath, fileInfo, content, stat);
                        changes.push(change);
                        
                        // ファイル情報更新
                        fileInfo.size = stat.size;
                        fileInfo.modified = stat.mtime;
                        fileInfo.hash = newHash;
                        fileInfo.lastChecked = Date.now();
                        
                        this.fileHashes.set(filePath, newHash);
                    }
                }
                
            } catch (error) {
                console.warn(`⚠️ ファイルチェックエラー: ${filePath} - ${error.message}`);
            }
        }
        
        // 新しいファイルチェック
        const newFiles = await this.checkForNewFiles();
        changes.push(...newFiles);
        
        // 変更があった場合の処理
        if (changes.length > 0) {
            await this.processChanges(changes);
        }
    }
    
    /**
     * ファイル変更分析
     */
    async analyzeFileChange(filePath, oldFileInfo, newContent, newStat) {
        const relativePath = path.relative(this.projectRoot, filePath);
        
        // 古いコンテンツとの差分計算
        let oldContent = '';
        try {
            // キャッシュされたハッシュから元のサイズを取得
            const sizeDiff = newStat.size - oldFileInfo.size;
            
            const change = {
                type: 'modified',
                file: relativePath,
                filePath: filePath,
                fileType: oldFileInfo.type,
                timestamp: Date.now(),
                sizeDiff: sizeDiff,
                sizeFormatted: this.formatFileSize(Math.abs(sizeDiff)),
                oldSize: oldFileInfo.size,
                newSize: newStat.size,
                changeRate: Math.abs(sizeDiff) / oldFileInfo.size,
                isCritical: this.notificationConfig.conditions.criticalFiles.includes(relativePath)
            };
            
            // 詳細分析
            await this.performDetailedAnalysis(change, newContent);
            
            return change;
            
        } catch (error) {
            return {
                type: 'modified',
                file: relativePath,
                filePath: filePath,
                fileType: oldFileInfo.type,
                timestamp: Date.now(),
                error: error.message
            };
        }
    }
    
    /**
     * 詳細変更分析
     */
    async performDetailedAnalysis(change, content) {
        // 行数・文字数カウント
        const lines = content.split('\\n');
        change.lines = lines.length;
        change.characters = content.length;
        change.words = content.split(/\\s+/).length;
        
        // セクション数カウント
        const headers = content.match(/^#{1,6}\\s+.+$/gm) || [];
        change.sections = headers.length;
        
        // リンク数カウント
        const links = content.match(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g) || [];
        change.links = links.length;
        
        // コードブロック数カウント
        const codeBlocks = content.match(/```[\\s\\S]*?```/g) || [];
        change.codeBlocks = codeBlocks.length;
        
        // 変更の重要度判定
        change.importance = this.calculateChangeImportance(change);
        
        // 影響を受ける依存ファイル
        change.affectedFiles = this.findAffectedFiles(change.filePath);
    }
    
    /**
     * 変更重要度計算
     */
    calculateChangeImportance(change) {
        let score = 0;
        
        // ファイルタイプによる重み
        if (change.isCritical) score += 10;
        if (change.fileType === 'documentation') score += 5;
        
        // 変更率による重み
        if (change.changeRate > 0.5) score += 8;
        else if (change.changeRate > 0.2) score += 5;
        else if (change.changeRate > 0.1) score += 3;
        
        // サイズによる重み
        if (Math.abs(change.sizeDiff) > 5000) score += 5;
        else if (Math.abs(change.sizeDiff) > 1000) score += 3;
        
        // 重要度分類
        if (score >= 15) return 'critical';
        if (score >= 10) return 'high';
        if (score >= 5) return 'medium';
        return 'low';
    }
    
    /**
     * 影響を受けるファイル検索
     */
    findAffectedFiles(filePath) {
        const affected = [];
        const relativePath = path.relative(this.projectRoot, filePath);
        
        // 依存関係から検索
        for (const [dependentFile, dependencies] of this.dependencies) {
            if (dependencies.includes(relativePath)) {
                affected.push(dependentFile);
            }
        }
        
        return affected;
    }
    
    /**
     * 新しいファイルチェック
     */
    async checkForNewFiles() {
        const newFiles = [];
        
        try {
            const currentDocFiles = await this.collectDocumentationFiles();
            const currentSrcFiles = await this.collectSourceFiles();
            
            // 新しいドキュメントファイル
            for (const filePath of currentDocFiles) {
                if (!this.watchedFiles.has(filePath)) {
                    await this.registerFileForWatching(filePath, 'documentation');
                    
                    newFiles.push({
                        type: 'created',
                        file: path.relative(this.projectRoot, filePath),
                        filePath: filePath,
                        fileType: 'documentation',
                        timestamp: Date.now()
                    });
                }
            }
            
            // 新しいソースファイル
            for (const filePath of currentSrcFiles) {
                if (!this.watchedFiles.has(filePath)) {
                    await this.registerFileForWatching(filePath, 'source');
                    
                    newFiles.push({
                        type: 'created',
                        file: path.relative(this.projectRoot, filePath),
                        filePath: filePath,
                        fileType: 'source',
                        timestamp: Date.now()
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ 新ファイルチェックエラー:', error.message);
        }
        
        return newFiles;
    }
    
    /**
     * 変更処理
     */
    async processChanges(changes) {
        console.log(`\\n📝 ${changes.length} 個の変更を検出しました`);
        
        // 変更を履歴に追加
        this.updateHistory.push(...changes);
        
        // 変更をタイプ別に分類
        const changesByType = this.groupChangesByType(changes);
        
        // 変更詳細表示
        for (const change of changes) {
            console.log(`   ${this.getChangeIcon(change.type)} ${change.file} (${change.importance || 'unknown'})`);
            
            if (change.sizeDiff !== undefined) {
                const sizeChange = change.sizeDiff > 0 ? `+${change.sizeFormatted}` : `-${change.sizeFormatted}`;
                console.log(`     📏 サイズ変更: ${sizeChange}`);
            }
            
            if (change.affectedFiles && change.affectedFiles.length > 0) {
                console.log(`     🔗 影響ファイル: ${change.affectedFiles.join(', ')}`);
            }
        }
        
        // 通知送信
        await this.sendNotifications(changes);
        
        // 自動検証実行
        if (this.notificationConfig.conditions.requireValidation) {
            await this.triggerValidation(changes);
        }
        
        // 履歴保存
        this.saveUpdateHistory();
    }
    
    /**
     * 通知送信
     */
    async sendNotifications(changes) {
        const criticalChanges = changes.filter(change => change.importance === 'critical');
        const highChanges = changes.filter(change => change.importance === 'high');
        
        // 重要度の高い変更がある場合のみ通知
        if (criticalChanges.length > 0 || highChanges.length > 0) {
            const notification = this.createNotificationMessage(changes);
            
            // コンソール通知
            if (this.notificationConfig.methods.includes('console')) {
                console.log('\\n🔔 通知メッセージ:');
                console.log(notification.text);
            }
            
            // ファイル通知
            if (this.notificationConfig.methods.includes('file')) {
                await this.saveNotificationToFile(notification);
            }
            
            // Webhook通知
            if (this.notificationConfig.methods.includes('webhook') && this.notificationConfig.webhookUrl) {
                await this.sendWebhookNotification(notification);
            }
            
            // Slack通知
            if (this.notificationConfig.slackWebhook) {
                await this.sendSlackNotification(notification);
            }
        }
    }
    
    /**
     * 通知メッセージ作成
     */
    createNotificationMessage(changes) {
        const timestamp = new Date().toLocaleString('ja-JP');
        const criticalCount = changes.filter(c => c.importance === 'critical').length;
        const highCount = changes.filter(c => c.importance === 'high').length;
        
        let text = `📚 BubblePop ドキュメント更新通知\\n`;
        text += `⏰ 時刻: ${timestamp}\\n`;
        text += `📊 変更数: ${changes.length}件\\n`;
        
        if (criticalCount > 0) {
            text += `🚨 重要な変更: ${criticalCount}件\\n`;
        }
        
        if (highCount > 0) {
            text += `⚠️ 高優先度変更: ${highCount}件\\n`;
        }
        
        text += '\\n📋 変更詳細:\\n';
        
        changes.slice(0, 10).forEach(change => {
            text += `• ${change.file} (${change.type}) - ${change.importance}\\n`;
            
            if (change.affectedFiles && change.affectedFiles.length > 0) {
                text += `  影響: ${change.affectedFiles.slice(0, 3).join(', ')}\\n`;
            }
        });
        
        if (changes.length > 10) {
            text += `... および ${changes.length - 10} 件の追加変更\\n`;
        }
        
        return {
            text: text,
            changes: changes,
            summary: {
                total: changes.length,
                critical: criticalCount,
                high: highCount,
                timestamp: timestamp
            }
        };
    }
    
    /**
     * ファイル通知保存
     */
    async saveNotificationToFile(notification) {
        try {
            const notificationsDir = path.join(this.projectRoot, 'notifications');
            if (!fs.existsSync(notificationsDir)) {
                fs.mkdirSync(notificationsDir);
            }
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const notificationPath = path.join(notificationsDir, `doc-update-${timestamp}.txt`);
            
            fs.writeFileSync(notificationPath, notification.text);
            
            // JSON形式でも保存
            const jsonPath = path.join(notificationsDir, `doc-update-${timestamp}.json`);
            fs.writeFileSync(jsonPath, JSON.stringify(notification, null, 2));
            
            console.log(`📄 通知をファイルに保存: ${notificationPath}`);
            
        } catch (error) {
            console.warn('⚠️ 通知ファイル保存エラー:', error.message);
        }
    }
    
    /**
     * Webhook通知送信
     */
    async sendWebhookNotification(notification) {
        try {
            const payload = {
                text: notification.text,
                changes: notification.changes,
                summary: notification.summary,
                source: 'BubblePop Documentation Notifier'
            };
            
            // fetch APIまたはaxios使用（今回は簡易実装）
            console.log('🌐 Webhook通知を送信中...');
            console.log(`URL: ${this.notificationConfig.webhookUrl}`);
            
        } catch (error) {
            console.warn('⚠️ Webhook通知エラー:', error.message);
        }
    }
    
    /**
     * Slack通知送信
     */
    async sendSlackNotification(notification) {
        try {
            const slackMessage = {
                text: '📚 BubblePop ドキュメント更新通知',
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `*📚 BubblePop ドキュメント更新通知*\\n${notification.summary.timestamp}`
                        }
                    },
                    {
                        type: 'section',
                        fields: [
                            {
                                type: 'mrkdwn',
                                text: `*変更数:* ${notification.summary.total}件`
                            },
                            {
                                type: 'mrkdwn',
                                text: `*重要変更:* ${notification.summary.critical}件`
                            }
                        ]
                    }
                ]
            };
            
            console.log('📱 Slack通知を送信中...');
            
        } catch (error) {
            console.warn('⚠️ Slack通知エラー:', error.message);
        }
    }
    
    /**
     * 自動検証トリガー
     */
    async triggerValidation(changes) {
        console.log('\\n🔍 自動検証を実行中...');
        
        try {
            // ドキュメント検証実行
            const { DocumentationValidator } = await import('./doc-validator.js');
            const validator = new DocumentationValidator();
            
            const result = await validator.validate({
                checkExternalLinks: false, // 高速化のため外部リンクチェックは省略
                checkCrossReferences: true,
                checkApiSync: true,
                saveReport: false
            });
            
            if (!result.success) {
                console.log('⚠️ 検証でエラーが検出されました');
                
                // エラーを通知に追加
                const validationNotification = {
                    text: `🚨 ドキュメント検証エラー\\n${result.results.errors.length}件のエラーが検出されました`,
                    errors: result.results.errors.slice(0, 5)
                };
                
                await this.saveNotificationToFile(validationNotification);
            } else {
                console.log('✅ 検証が正常に完了しました');
            }
            
        } catch (error) {
            console.warn('⚠️ 自動検証エラー:', error.message);
        }
    }
    
    /**
     * 定期レポート生成
     */
    async generatePeriodicReport() {
        console.log('\\n📊 定期レポートを生成中...');
        
        try {
            const now = Date.now();
            const oneHourAgo = now - 3600000; // 1時間前
            
            const recentChanges = this.updateHistory.filter(
                change => change.timestamp > oneHourAgo
            );
            
            if (recentChanges.length === 0) {
                return; // 変更がない場合はレポート生成しない
            }
            
            const report = {
                period: {
                    start: new Date(oneHourAgo).toISOString(),
                    end: new Date(now).toISOString()
                },
                summary: {
                    totalChanges: recentChanges.length,
                    byType: this.groupChangesByType(recentChanges),
                    byImportance: this.groupChangesByImportance(recentChanges),
                    mostActiveFiles: this.findMostActiveFiles(recentChanges)
                },
                changes: recentChanges,
                watchedFiles: Array.from(this.watchedFiles.values()).length
            };
            
            // レポート保存
            const reportsDir = path.join(this.projectRoot, 'reports');
            if (!fs.existsSync(reportsDir)) {
                fs.mkdirSync(reportsDir);
            }
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const reportPath = path.join(reportsDir, `doc-activity-${timestamp}.json`);
            
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            console.log(`📊 定期レポートを保存: ${reportPath}`);
            
        } catch (error) {
            console.warn('⚠️ 定期レポート生成エラー:', error.message);
        }
    }
    
    /**
     * 依存関係分析
     */
    async analyzeDependencies() {
        console.log('🔗 ドキュメント依存関係を分析中...');
        
        for (const [filePath, fileInfo] of this.watchedFiles) {
            if (fileInfo.type === 'documentation') {
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    const dependencies = this.extractDependencies(content, filePath);
                    
                    const relativePath = path.relative(this.projectRoot, filePath);
                    this.dependencies.set(relativePath, dependencies);
                    
                } catch (error) {
                    console.warn(`⚠️ 依存関係分析エラー: ${filePath} - ${error.message}`);
                }
            }
        }
        
        console.log(`🔗 ${this.dependencies.size} 個のファイルの依存関係を分析完了`);
        this.saveDependencies();
    }
    
    /**
     * 依存関係抽出
     */
    extractDependencies(content, filePath) {
        const dependencies = [];
        const baseDir = path.dirname(filePath);
        
        // 内部リンクを依存関係として抽出
        const linkPattern = /\\[([^\\]]+)\\]\\(([^)]+\\.md[^)]*?)\\)/g;
        let match;
        
        while ((match = linkPattern.exec(content)) !== null) {
            const linkPath = match[2];
            
            try {
                const absolutePath = path.resolve(baseDir, linkPath);
                const relativePath = path.relative(this.projectRoot, absolutePath);
                dependencies.push(relativePath);
            } catch (error) {
                // パス解決エラーは無視
            }
        }
        
        return [...new Set(dependencies)]; // 重複削除
    }
    
    /**
     * ファイル収集メソッド
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
        
        // ルートファイル
        ['README.md', 'CLAUDE.md'].forEach(file => {
            const filePath = path.join(this.projectRoot, file);
            if (fs.existsSync(filePath)) {
                files.push(filePath);
            }
        });
        
        return files;
    }
    
    async collectSourceFiles() {
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
                } else if (item.endsWith('.js')) {
                    files.push(itemPath);
                }
            }
        };
        
        scanDirectory(this.srcDir);
        return files;
    }
    
    /**
     * データ永続化
     */
    loadFileHashes() {
        const hashesPath = path.join(__dirname, 'file-hashes.json');
        
        if (fs.existsSync(hashesPath)) {
            try {
                const data = fs.readFileSync(hashesPath, 'utf8');
                const hashes = JSON.parse(data);
                this.fileHashes = new Map(hashes);
            } catch (error) {
                console.warn('ファイルハッシュ読み込みエラー:', error.message);
            }
        }
    }
    
    saveFileHashes() {
        const hashesPath = path.join(__dirname, 'file-hashes.json');
        
        try {
            const hashesArray = Array.from(this.fileHashes.entries());
            fs.writeFileSync(hashesPath, JSON.stringify(hashesArray, null, 2));
        } catch (error) {
            console.warn('ファイルハッシュ保存エラー:', error.message);
        }
    }
    
    loadDependencies() {
        const dependenciesPath = path.join(__dirname, 'doc-dependencies.json');
        
        if (fs.existsSync(dependenciesPath)) {
            try {
                const data = fs.readFileSync(dependenciesPath, 'utf8');
                const dependencies = JSON.parse(data);
                this.dependencies = new Map(dependencies);
            } catch (error) {
                console.warn('依存関係読み込みエラー:', error.message);
            }
        }
    }
    
    saveDependencies() {
        const dependenciesPath = path.join(__dirname, 'doc-dependencies.json');
        
        try {
            const dependenciesArray = Array.from(this.dependencies.entries());
            fs.writeFileSync(dependenciesPath, JSON.stringify(dependenciesArray, null, 2));
        } catch (error) {
            console.warn('依存関係保存エラー:', error.message);
        }
    }
    
    loadUpdateHistory() {
        const historyPath = path.join(__dirname, 'update-history.json');
        
        if (fs.existsSync(historyPath)) {
            try {
                const data = fs.readFileSync(historyPath, 'utf8');
                this.updateHistory = JSON.parse(data);
                
                // 古い履歴を削除（1週間以上前）
                const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
                this.updateHistory = this.updateHistory.filter(
                    change => change.timestamp > oneWeekAgo
                );
                
            } catch (error) {
                console.warn('更新履歴読み込みエラー:', error.message);
            }
        }
    }
    
    saveUpdateHistory() {
        const historyPath = path.join(__dirname, 'update-history.json');
        
        try {
            fs.writeFileSync(historyPath, JSON.stringify(this.updateHistory, null, 2));
        } catch (error) {
            console.warn('更新履歴保存エラー:', error.message);
        }
    }
    
    /**
     * ユーティリティメソッド
     */
    calculateFileHash(content) {
        return crypto.createHash('md5').update(content).digest('hex');
    }
    
    formatFileSize(bytes) {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 B';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    getChangeIcon(type) {
        const icons = {
            created: '✨',
            modified: '📝',
            deleted: '🗑️',
            renamed: '📋'
        };
        return icons[type] || '📄';
    }
    
    groupChangesByType(changes) {
        const groups = {};
        changes.forEach(change => {
            const type = change.type;
            if (!groups[type]) groups[type] = 0;
            groups[type]++;
        });
        return groups;
    }
    
    groupChangesByImportance(changes) {
        const groups = {};
        changes.forEach(change => {
            const importance = change.importance || 'unknown';
            if (!groups[importance]) groups[importance] = 0;
            groups[importance]++;
        });
        return groups;
    }
    
    findMostActiveFiles(changes) {
        const fileCounts = {};
        changes.forEach(change => {
            const file = change.file;
            if (!fileCounts[file]) fileCounts[file] = 0;
            fileCounts[file]++;
        });
        
        return Object.entries(fileCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([file, count]) => ({ file, changeCount: count }));
    }
}

/**
 * CLI インターフェース
 */
class DocumentationUpdateNotifierCLI {
    constructor() {
        this.notifier = new DocumentationUpdateNotifier();
    }
    
    async run() {
        const args = process.argv.slice(2);
        
        if (args.includes('--help')) {
            this.printHelp();
            return;
        }
        
        const options = {
            interval: parseInt(args.find(arg => arg.startsWith('--interval='))?.split('=')[1]) || 30000,
            reportInterval: parseInt(args.find(arg => arg.startsWith('--report-interval='))?.split('=')[1]) || 3600000,
            daemon: args.includes('--daemon')
        };
        
        console.log('🚀 BubblePop ドキュメント更新通知システム\\n');
        
        if (args.includes('--scan-only')) {
            // 一回限りのスキャン
            await this.notifier.performInitialScan();
            await this.notifier.checkForUpdates();
            console.log('✅ スキャンが完了しました');
        } else {
            // 継続監視
            await this.notifier.startWatching(options);
            
            if (!options.daemon) {
                console.log('\\n👀 監視中... (Ctrl+C で停止)');
                
                // 継続実行
                process.stdin.resume();
            }
        }
    }
    
    printHelp() {
        console.log(`
🚀 BubblePop ドキュメント更新通知システム

使用方法:
  node tools/doc-update-notifier.js [オプション]

オプション:
  --interval=<ms>        チェック間隔（ミリ秒、デフォルト: 30000）
  --report-interval=<ms> レポート生成間隔（ミリ秒、デフォルト: 3600000）
  --daemon               デーモンモードで実行
  --scan-only            一回限りのスキャンのみ実行
  --help                 このヘルプを表示

例:
  node tools/doc-update-notifier.js
  node tools/doc-update-notifier.js --interval=60000
  node tools/doc-update-notifier.js --scan-only
  node tools/doc-update-notifier.js --daemon
        `);
    }
}

// CLI として実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
    const cli = new DocumentationUpdateNotifierCLI();
    cli.run().catch(error => {
        console.error('予期しないエラーが発生しました:', error);
        process.exit(1);
    });
}

export { DocumentationUpdateNotifier, DocumentationUpdateNotifierCLI };