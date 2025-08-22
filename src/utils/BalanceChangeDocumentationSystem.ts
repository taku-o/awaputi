/**
 * バランス変更ドキュメントシステム - BalanceChangeDocumentationSystem
 * 
 * ゲームバランス設定の変更履歴を管理し、レポート生成、
 * 変更追跡、ロールバック機能を提供するシステムクラス。
 */

import { BalanceChange } from '../models/BalanceChange.js';
import { getErrorHandler, ErrorHandler } from './ErrorHandler.js';

// Type definitions
interface DocumentationStatistics {
    totalChanges: number;
    appliedChanges: number;
    rolledBackChanges: number;
    lastUpdate: number | null;
}

interface QueryOptions {
    propertyType?: string;
    author?: string;
    reviewStatus?: string;
    applied?: boolean;
    fromDate?: number;
    toDate?: number;
    sortBy?: 'timestamp' | 'bubbleType' | 'propertyType' | 'author' | 'severity';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    bubbleType?: string;
    changeType?: string;
    severity?: string;
    tags?: string[];
}

interface BubbleTypeStats {
    total: number;
    applied: number;
    rolledBack: number;
    pending?: number;
}

interface PropertyTypeStats {
    total: number;
    applied: number;
    rolledBack: number;
}

interface AuthorStats {
    total: number;
    applied: number;
    rolledBack: number;
}

interface TimelineEntry {
    date: string;
    count: number;
}

interface StatisticsReport {
    overview: DocumentationStatistics;
    byBubbleType: Record<string, BubbleTypeStats>;
    byPropertyType: Record<string, PropertyTypeStats>;
    byAuthor: Record<string, AuthorStats>;
    byChangeType: Record<string, number>;
    bySeverity: Record<string, number>;
    byReviewStatus: Record<string, number>;
    timeline: TimelineEntry[];
    recentChanges: string[];
    generatedAt: number;
    error?: string;
}

interface RelatedChangeInfo {
    id: string;
    relationship: string;
    summary: string;
    impact: any;
}

interface RiskAssessment {
    level: string;
    factors: string[];
}

interface ImpactReport {
    change?: string;
    impact?: any;
    relatedChanges: RelatedChangeInfo[];
    affectedSystems?: string[];
    riskAssessment: RiskAssessment;
    recommendations: string[];
    generatedAt: number;
    error?: string;
    changeId?: string;
}

interface SystemIndexSizes {
    changes: number;
    bubbleTypes: number;
    propertyTypes: number;
    authors: number;
    timeline: number;
}

interface StorageInfo {
    available: boolean;
    autoSave: boolean;
    maxHistorySize: number;
}

interface SystemStatistics extends DocumentationStatistics {
    indexSizes: SystemIndexSizes;
    storageInfo: StorageInfo;
}

interface SystemSettings {
    maxHistorySize?: number;
    autoSaveEnabled?: boolean;
    storageKey?: string;
}

interface StorageData {
    changes: any[];
    statistics: DocumentationStatistics;
    version: string;
    savedAt: number;
}

export class BalanceChangeDocumentationSystem {
    private errorHandler: ErrorHandler;
    private changes: Map<string, BalanceChange>;
    private changesByBubble: Map<string, string[]>;
    private changesByProperty: Map<string, string[]>;
    private changesByAuthor: Map<string, string[]>;
    private changesByTimestamp: string[];
    private maxHistorySize: number;
    private autoSaveEnabled: boolean;
    private storageKey: string;
    private storageAvailable: boolean = false;
    private statistics: DocumentationStatistics;

    constructor() {
        this.errorHandler = getErrorHandler();
        this.changes = new Map();
        this.changesByBubble = new Map();
        this.changesByProperty = new Map();
        this.changesByAuthor = new Map();
        this.changesByTimestamp = [];
        this.maxHistorySize = 1000;
        this.autoSaveEnabled = true;
        this.storageKey = 'awaputi_balance_changes';
        
        // 統計情報
        this.statistics = {
            totalChanges: 0,
            appliedChanges: 0,
            rolledBackChanges: 0,
            lastUpdate: null
        };

        this._initializeStorage();
        this._loadFromStorage();
        console.log('[BalanceChangeDocumentationSystem] システムを初期化しました');
    }
    
    /**
     * ストレージシステムを初期化
     */
    private _initializeStorage(): void {
        try {
            if (typeof localStorage !== 'undefined') {
                this.storageAvailable = true;
            } else {
                this.storageAvailable = false;
                console.warn('[BalanceChangeDocumentationSystem] LocalStorage利用不可');
            }
        } catch (error) {
            this.storageAvailable = false;
            this.errorHandler.handleError(error, 'DOCUMENTATION_STORAGE_INIT');
        }
    }
    
    /**
     * ストレージから変更履歴を読み込み
     */
    private _loadFromStorage(): void {
        try {
            if (!this.storageAvailable) return;
            
            const storedData = localStorage.getItem(this.storageKey);
            if (!storedData) return;
            
            const data: StorageData = JSON.parse(storedData);
            if (!data.changes || !Array.isArray(data.changes)) return;
            
            // 変更履歴を復元
            for (const changeData of data.changes) {
                const change = new BalanceChange(changeData);
                this._addChangeToIndexes(change);
            }
            
            // 統計情報を復元
            if (data.statistics) {
                this.statistics = { ...this.statistics, ...data.statistics };
            }
            
            console.log(`[BalanceChangeDocumentationSystem] ${data.changes.length}件の変更履歴を読み込みました`);
        } catch (error) {
            this.errorHandler.handleError(error, 'DOCUMENTATION_LOAD', {
                storageKey: this.storageKey
            });
        }
    }
    
    /**
     * ストレージに変更履歴を保存
     */
    private _saveToStorage(): void {
        try {
            if (!this.storageAvailable || !this.autoSaveEnabled) return;
            
            const data: StorageData = {
                changes: Array.from(this.changes.values()).map(change => change.toJSON()),
                statistics: this.statistics,
                version: '1.0',
                savedAt: Date.now()
            };
            
            localStorage.setItem(this.storageKey, JSON.stringify(data));

        } catch (error) {
            this.errorHandler.handleError(error, 'DOCUMENTATION_SAVE', {
                storageKey: this.storageKey,
                changesCount: this.changes.size
            });
        }
    }
    
    /**
     * 変更をインデックスに追加
     */
    private _addChangeToIndexes(change: BalanceChange): void {
        // メインインデックス
        this.changes.set(change.id, change);

        // バブルタイプ別インデックス
        if (change.bubbleType) {
            if (!this.changesByBubble.has(change.bubbleType)) {
                this.changesByBubble.set(change.bubbleType, []);
            }
            this.changesByBubble.get(change.bubbleType)!.push(change.id);
        }
        
        // プロパティタイプ別インデックス
        if (change.propertyType) {
            if (!this.changesByProperty.has(change.propertyType)) {
                this.changesByProperty.set(change.propertyType, []);
            }
            this.changesByProperty.get(change.propertyType)!.push(change.id);
        }
        
        // 作成者別インデックス
        if (change.author) {
            if (!this.changesByAuthor.has(change.author)) {
                this.changesByAuthor.set(change.author, []);
            }
            this.changesByAuthor.get(change.author)!.push(change.id);
        }
        
        // 時系列インデックス（挿入ソート）
        const insertIndex = this.changesByTimestamp.findIndex(changeId => {
            const existingChange = this.changes.get(changeId);
            return existingChange && existingChange.timestamp > change.timestamp;
        });
        
        if (insertIndex === -1) {
            this.changesByTimestamp.push(change.id);
        } else {
            this.changesByTimestamp.splice(insertIndex, 0, change.id);
        }
    }
    
    /**
     * 変更をインデックスから削除
     */
    private _removeChangeFromIndexes(change: BalanceChange): void {
        // メインインデックス
        this.changes.delete(change.id);

        // バブルタイプ別インデックス
        if (change.bubbleType && this.changesByBubble.has(change.bubbleType)) {
            const bubbleChanges = this.changesByBubble.get(change.bubbleType)!;
            const index = bubbleChanges.indexOf(change.id);
            if (index !== -1) {
                bubbleChanges.splice(index, 1);
            }
            if (bubbleChanges.length === 0) {
                this.changesByBubble.delete(change.bubbleType);
            }
        }
        
        // プロパティタイプ別インデックス
        if (change.propertyType && this.changesByProperty.has(change.propertyType)) {
            const propertyChanges = this.changesByProperty.get(change.propertyType)!;
            const index = propertyChanges.indexOf(change.id);
            if (index !== -1) {
                propertyChanges.splice(index, 1);
            }
            if (propertyChanges.length === 0) {
                this.changesByProperty.delete(change.propertyType);
            }
        }
        
        // 作成者別インデックス
        if (change.author && this.changesByAuthor.has(change.author)) {
            const authorChanges = this.changesByAuthor.get(change.author)!;
            const index = authorChanges.indexOf(change.id);
            if (index !== -1) {
                authorChanges.splice(index, 1);
            }
            if (authorChanges.length === 0) {
                this.changesByAuthor.delete(change.author);
            }
        }
        
        // 時系列インデックス
        const timeIndex = this.changesByTimestamp.indexOf(change.id);
        if (timeIndex !== -1) {
            this.changesByTimestamp.splice(timeIndex, 1);
        }
    }
    
    /**
     * 統計情報を更新
     */
    private _updateStatistics(): void {
        this.statistics.totalChanges = this.changes.size;
        this.statistics.appliedChanges = Array.from(this.changes.values())
            .filter(change => change.applied).length;
        this.statistics.rolledBackChanges = Array.from(this.changes.values())
            .filter(change => change.rolledBack).length;
        this.statistics.lastUpdate = Date.now();
    }
    
    /**
     * 新しい変更を記録
     */
    public recordChange(changeData: any): BalanceChange | null {
        try {
            const change = new BalanceChange(changeData);

            // 検証
            const validation = change.validate();
            if (!validation.isValid) {
                console.warn('[BalanceChangeDocumentationSystem] 無効な変更データ:', validation.errors);
                return null;
            }
            
            // 履歴サイズ制限
            if (this.changes.size >= this.maxHistorySize) {
                this._cleanupOldChanges();
            }
            
            // インデックスに追加
            this._addChangeToIndexes(change);
            
            // 統計更新
            this._updateStatistics();
            
            // 自動保存
            if (this.autoSaveEnabled) {
                this._saveToStorage();
            }
            
            console.log(`[BalanceChangeDocumentationSystem] 変更を記録: ${change.id}`);
            return change;

        } catch (error) {
            this.errorHandler.handleError(error, 'DOCUMENTATION_RECORD', {
                changeData
            });
            return null;
        }
    }
    
    /**
     * 古い変更履歴をクリーンアップ
     */
    private _cleanupOldChanges(): void {
        try {
            // 最古の変更から削除（時系列順の最初の10%を削除）
            const cleanupCount = Math.floor(this.maxHistorySize * 0.1);
            const changesToRemove = this.changesByTimestamp.slice(0, cleanupCount);

            for (const changeId of changesToRemove) {
                const change = this.changes.get(changeId);
                if (change) {
                    this._removeChangeFromIndexes(change);
                }
            }
            
            console.log(`[BalanceChangeDocumentationSystem] ${cleanupCount}件の古い変更履歴を削除`);
        } catch (error) {
            this.errorHandler.handleError(error, 'DOCUMENTATION_CLEANUP');
        }
    }
    
    /**
     * 変更を取得
     */
    public getChange(changeId: string): BalanceChange | null {
        return this.changes.get(changeId) || null;
    }
    
    /**
     * バブルタイプ別の変更履歴を取得
     */
    public getChangesByBubbleType(bubbleType: string, options: QueryOptions = {}): BalanceChange[] {
        try {
            const changeIds = this.changesByBubble.get(bubbleType) || [];
            let changes = changeIds.map(id => this.changes.get(id)).filter((change): change is BalanceChange => !!change);
            
            // フィルタリング
            if (options.propertyType) {
                changes = changes.filter(change => change.propertyType === options.propertyType);
            }
            
            if (options.author) {
                changes = changes.filter(change => change.author === options.author);
            }
            
            if (options.reviewStatus) {
                changes = changes.filter(change => change.reviewStatus === options.reviewStatus);
            }
            
            if (options.applied !== undefined) {
                changes = changes.filter(change => change.applied === options.applied);
            }
            
            // 期間フィルタ
            if (options.fromDate) {
                changes = changes.filter(change => change.timestamp >= options.fromDate!);
            }
            
            if (options.toDate) {
                changes = changes.filter(change => change.timestamp <= options.toDate!);
            }
            
            // ソート
            if (options.sortBy === 'timestamp') {
                changes.sort((a, b) => {
                    const order = options.sortOrder === 'desc' ? -1 : 1;
                    return (a.timestamp - b.timestamp) * order;
                });
            }
            
            // 制限
            if (options.limit && options.limit > 0) {
                changes = changes.slice(0, options.limit);
            }
            
            return changes;

        } catch (error) {
            this.errorHandler.handleError(error, 'DOCUMENTATION_GET_BY_BUBBLE', {
                bubbleType,
                options
            });
            return [];
        }
    }
    
    /**
     * プロパティタイプ別の変更履歴を取得
     */
    public getChangesByPropertyType(propertyType: string, options: QueryOptions = {}): BalanceChange[] {
        try {
            const changeIds = this.changesByProperty.get(propertyType) || [];
            let changes = changeIds.map(id => this.changes.get(id)).filter((change): change is BalanceChange => !!change);
            
            // 同様のフィルタリングとソート処理
            return this._applyFiltersAndSort(changes, options);

        } catch (error) {
            this.errorHandler.handleError(error, 'DOCUMENTATION_GET_BY_PROPERTY', {
                propertyType,
                options
            });
            return [];
        }
    }
    
    /**
     * 作成者別の変更履歴を取得
     */
    public getChangesByAuthor(author: string, options: QueryOptions = {}): BalanceChange[] {
        try {
            const changeIds = this.changesByAuthor.get(author) || [];
            let changes = changeIds.map(id => this.changes.get(id)).filter((change): change is BalanceChange => !!change);
            
            return this._applyFiltersAndSort(changes, options);

        } catch (error) {
            this.errorHandler.handleError(error, 'DOCUMENTATION_GET_BY_AUTHOR', {
                author,
                options
            });
            return [];
        }
    }
    
    /**
     * 期間別の変更履歴を取得
     */
    public getChangesByDateRange(fromDate: number, toDate: number, options: QueryOptions = {}): BalanceChange[] {
        try {
            const changes = this.changesByTimestamp
                .map(id => this.changes.get(id))
                .filter((change): change is BalanceChange => change !== undefined && 
                    change.timestamp >= fromDate && 
                    change.timestamp <= toDate);
            
            return this._applyFiltersAndSort(changes, options);

        } catch (error) {
            this.errorHandler.handleError(error, 'DOCUMENTATION_GET_BY_DATE', {
                fromDate,
                toDate,
                options
            });
            return [];
        }
    }
    
    /**
     * フィルタとソートを適用
     */
    private _applyFiltersAndSort(changes: BalanceChange[], options: QueryOptions): BalanceChange[] {
        let filtered = [...changes];
        
        // フィルタリング
        if (options.bubbleType) {
            filtered = filtered.filter(change => change.bubbleType === options.bubbleType);
        }
        
        if (options.propertyType) {
            filtered = filtered.filter(change => change.propertyType === options.propertyType);
        }
        
        if (options.author) {
            filtered = filtered.filter(change => change.author === options.author);
        }
        
        if (options.reviewStatus) {
            filtered = filtered.filter(change => change.reviewStatus === options.reviewStatus);
        }
        
        if (options.applied !== undefined) {
            filtered = filtered.filter(change => change.applied === options.applied);
        }
        
        if (options.changeType) {
            filtered = filtered.filter(change => change.changeType === options.changeType);
        }
        
        if (options.severity) {
            filtered = filtered.filter(change => change.severity === options.severity);
        }
        
        if (options.tags && options.tags.length > 0) {
            filtered = filtered.filter(change => 
                options.tags!.some(tag => change.tags.includes(tag))
            );
        }
        
        // ソート
        if (options.sortBy) {
            filtered.sort((a, b) => {
                const order = options.sortOrder === 'desc' ? -1 : 1;
                let comparison = 0;

                switch (options.sortBy) {
                    case 'timestamp':
                        comparison = a.timestamp - b.timestamp;
                        break;
                    case 'bubbleType':
                        comparison = (a.bubbleType || '').localeCompare(b.bubbleType || '');
                        break;
                    case 'propertyType':
                        comparison = (a.propertyType || '').localeCompare(b.propertyType || '');
                        break;
                    case 'author':
                        comparison = (a.author || '').localeCompare(b.author || '');
                        break;
                    case 'severity':
                        const severityOrder: Record<string, number> = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
                        comparison = (severityOrder[a.severity] || 0) - (severityOrder[b.severity] || 0);
                        break;
                    default:
                        comparison = 0;
                }
                
                return comparison * order;
            });
        }
        
        // 制限
        if (options.limit && options.limit > 0) {
            filtered = filtered.slice(0, options.limit);
        }
        
        return filtered;
    }
    
    /**
     * 変更統計レポートを生成
     */
    public generateStatisticsReport(options: QueryOptions = {}): StatisticsReport {
        try {
            const report: StatisticsReport = {
                overview: { ...this.statistics },
                byBubbleType: {},
                byPropertyType: {},
                byAuthor: {},
                byChangeType: {},
                bySeverity: {},
                byReviewStatus: {},
                timeline: [],
                recentChanges: [],
                generatedAt: Date.now()
            };
            
            const changes = Array.from(this.changes.values());
            
            // バブルタイプ別統計
            for (const [bubbleType, changeIds] of this.changesByBubble) {
                const bubbleChanges = changeIds.map(id => this.changes.get(id)).filter((change): change is BalanceChange => !!change);
                report.byBubbleType[bubbleType] = {
                    total: bubbleChanges.length,
                    applied: bubbleChanges.filter(c => c.applied).length,
                    rolledBack: bubbleChanges.filter(c => c.rolledBack).length,
                    pending: bubbleChanges.filter(c => c.reviewStatus === 'pending').length
                };
            }
            
            // プロパティタイプ別統計
            for (const [propertyType, changeIds] of this.changesByProperty) {
                const propertyChanges = changeIds.map(id => this.changes.get(id)).filter((change): change is BalanceChange => !!change);
                report.byPropertyType[propertyType] = {
                    total: propertyChanges.length,
                    applied: propertyChanges.filter(c => c.applied).length,
                    rolledBack: propertyChanges.filter(c => c.rolledBack).length
                };
            }
            
            // 作成者別統計
            for (const [author, changeIds] of this.changesByAuthor) {
                const authorChanges = changeIds.map(id => this.changes.get(id)).filter((change): change is BalanceChange => !!change);
                report.byAuthor[author] = {
                    total: authorChanges.length,
                    applied: authorChanges.filter(c => c.applied).length,
                    rolledBack: authorChanges.filter(c => c.rolledBack).length
                };
            }
            
            // 変更タイプ別統計
            const changeTypeCounts: Record<string, number> = {};
            changes.forEach(change => {
                changeTypeCounts[change.changeType] = (changeTypeCounts[change.changeType] || 0) + 1;
            });
            report.byChangeType = changeTypeCounts;
            
            // 重要度別統計
            const severityCounts: Record<string, number> = {};
            changes.forEach(change => {
                severityCounts[change.severity] = (severityCounts[change.severity] || 0) + 1;
            });
            report.bySeverity = severityCounts;
            
            // レビューステータス別統計
            const reviewStatusCounts: Record<string, number> = {};
            changes.forEach(change => {
                reviewStatusCounts[change.reviewStatus] = (reviewStatusCounts[change.reviewStatus] || 0) + 1;
            });
            report.byReviewStatus = reviewStatusCounts;
            
            // タイムライン（日別変更数）
            const timelineData: Record<string, number> = {};
            changes.forEach(change => {
                const date = new Date(change.timestamp).toISOString().split('T')[0];
                timelineData[date] = (timelineData[date] || 0) + 1;
            });
            
            report.timeline = Object.entries(timelineData)
                .map(([date, count]) => ({ date, count }))
                .sort((a, b) => a.date.localeCompare(b.date));
            
            // 最近の変更（最新10件）
            report.recentChanges = this.changesByTimestamp
                .slice(-10)
                .reverse()
                .map(id => {
                    const change = this.changes.get(id);
                    return change ? change.getSummary() : null;
                })
                .filter((summary): summary is string => summary !== null);
            
            return report;

        } catch (error) {
            this.errorHandler.handleError(error, 'DOCUMENTATION_STATISTICS', { options });

            return {
                overview: this.statistics,
                byBubbleType: {},
                byPropertyType: {},
                byAuthor: {},
                byChangeType: {},
                bySeverity: {},
                byReviewStatus: {},
                timeline: [],
                recentChanges: [],
                generatedAt: Date.now(),
                error: 'Failed to generate statistics report'
            };
        }
    }
    
    /**
     * 変更影響レポートを生成
     */
    public generateImpactReport(changeId: string): ImpactReport {
        try {
            const change = this.getChange(changeId);
            if (!change) {
                return {
                    relatedChanges: [],
                    riskAssessment: { level: 'unknown', factors: [] },
                    recommendations: [],
                    generatedAt: Date.now(),
                    error: 'Change not found'
                };
            }
            
            const report: ImpactReport = {
                change: change.getSummary(),
                impact: change.calculateImpact(),
                relatedChanges: [],
                affectedSystems: change.affectedSystems,
                riskAssessment: {
                    level: change.riskLevel,
                    factors: []
                },
                recommendations: [],
                generatedAt: Date.now()
            };
            
            // 関連する変更を詳細化
            for (const related of change.relatedChanges) {
                const relatedChange = this.getChange(related.changeId);
                if (relatedChange) {
                    report.relatedChanges.push({
                        id: related.changeId,
                        relationship: related.relationshipType,
                        summary: relatedChange.getSummary(),
                        impact: relatedChange.calculateImpact()
                    });
                }
            }

            // リスク要因分析
            const impact = change.calculateImpact();
            if (impact.magnitude === 'critical') {
                report.riskAssessment.factors.push('Critical magnitude change (>100%)');
            } else if (impact.magnitude === 'high') {
                report.riskAssessment.factors.push('High magnitude change (>50%)');
            }

            if (!change.applied && change.reviewStatus !== 'approved') {
                report.riskAssessment.factors.push('Change not reviewed or approved');
            }

            if (change.relatedChanges.length > 0) {
                report.riskAssessment.factors.push('Has related changes that may compound effects');
            }

            // 推奨事項
            if (impact.magnitude === 'critical' || impact.magnitude === 'high') {
                report.recommendations.push('Consider gradual rollout or A/B testing');
                report.recommendations.push('Monitor player feedback and metrics closely');
            }

            if (change.reviewStatus === 'pending') {
                report.recommendations.push('Complete review process before applying');
            }

            if (!change.rationale || change.rationale.trim() === '') {
                report.recommendations.push('Document rationale for the change');
            }
            
            return report;

        } catch (error) {
            this.errorHandler.handleError(error, 'DOCUMENTATION_IMPACT_REPORT', { changeId });

            return {
                relatedChanges: [],
                riskAssessment: { level: 'unknown', factors: [] },
                recommendations: [],
                generatedAt: Date.now(),
                error: 'Failed to generate impact report',
                changeId
            };
        }
    }

    /**
     * マークダウンレポートを生成
     */
    public generateMarkdownReport(reportType: 'statistics' | 'impact', options: QueryOptions & { changeId?: string } = {}): string {
        try {
            let markdown = '';

            if (reportType === 'statistics') {
                const report = this.generateStatisticsReport(options);
                markdown = this._generateStatisticsMarkdown(report);
            } else if (reportType === 'impact' && options.changeId) {
                const report = this.generateImpactReport(options.changeId);
                markdown = this._generateImpactMarkdown(report);
            } else {
                throw new Error(`Unknown report type: ${reportType}`);
            }
            
            return markdown;

        } catch (error) {
            this.errorHandler.handleError(error, 'DOCUMENTATION_MARKDOWN', {
                reportType,
                options
            });
            return `# Error\n\nFailed to generate ${reportType} report: ${error instanceof Error ? error.message : String(error)}`;
        }
    }
    
    /**
     * 統計レポートのマークダウンを生成
     */
    private _generateStatisticsMarkdown(report: StatisticsReport): string {
        const date = new Date(report.generatedAt).toLocaleString('ja-JP');
        
        let markdown = `# ゲームバランス変更統計レポート\n\n`;
        markdown += `**生成日時**: ${date}\n\n`;
        
        // 概要
        markdown += `## 概要\n\n`;
        markdown += `- **総変更数**: ${report.overview.totalChanges}\n`;
        markdown += `- **適用済み**: ${report.overview.appliedChanges}\n`;
        markdown += `- **ロールバック済み**: ${report.overview.rolledBackChanges}\n`;
        markdown += `- **最終更新**: ${report.overview.lastUpdate ? new Date(report.overview.lastUpdate).toLocaleString('ja-JP') : 'N/A'}\n\n`;
        
        // バブルタイプ別
        if (Object.keys(report.byBubbleType).length > 0) {
            markdown += `## バブルタイプ別統計\n\n`;
            markdown += `| バブルタイプ | 総数 | 適用済み | ロールバック | 保留中 |\n`;
            markdown += `|------------|------|----------|------------|--------|\n`;
            
            for (const [bubbleType, stats] of Object.entries(report.byBubbleType)) {
                markdown += `| ${bubbleType} | ${stats.total} | ${stats.applied} | ${stats.rolledBack} | ${stats.pending || 0} |\n`;
            }
            markdown += `\n`;
        }
        
        // プロパティタイプ別
        if (Object.keys(report.byPropertyType).length > 0) {
            markdown += `## プロパティタイプ別統計\n\n`;
            markdown += `| プロパティ | 総数 | 適用済み | ロールバック |\n`;
            markdown += `|-----------|------|----------|------------|\n`;
            
            for (const [propertyType, stats] of Object.entries(report.byPropertyType)) {
                markdown += `| ${propertyType} | ${stats.total} | ${stats.applied} | ${stats.rolledBack} |\n`;
            }
            markdown += `\n`;
        }
        
        // 最近の変更
        if (report.recentChanges.length > 0) {
            markdown += `## 最近の変更\n\n`;
            for (const changeSummary of report.recentChanges) {
                markdown += `- ${changeSummary}\n`;
            }
            markdown += `\n`;
        }
        
        return markdown;
    }
    
    /**
     * 影響レポートのマークダウンを生成
     */
    private _generateImpactMarkdown(report: ImpactReport): string {
        if (report.error) {
            return `# エラー\n\n${report.error}`;
        }

        const date = new Date(report.generatedAt).toLocaleString('ja-JP');
        
        let markdown = `# 変更影響レポート\n\n`;
        markdown += `**生成日時**: ${date}\n\n`;
        
        // 変更概要
        markdown += `## 変更概要\n\n`;
        markdown += `${report.change}\n\n`;
        
        // 影響分析
        if (report.impact) {
            markdown += `## 影響分析\n\n`;
            markdown += `- **影響の方向**: ${report.impact.direction}\n`;
            markdown += `- **影響の大きさ**: ${report.impact.magnitude}\n`;
            markdown += `- **説明**: ${report.impact.description}\n\n`;
        }
        
        // リスク評価
        markdown += `## リスク評価\n\n`;
        markdown += `**リスクレベル**: ${report.riskAssessment.level}\n\n`;
        
        if (report.riskAssessment.factors.length > 0) {
            markdown += `**リスク要因**:\n`;
            for (const factor of report.riskAssessment.factors) {
                markdown += `- ${factor}\n`;
            }
            markdown += `\n`;
        }
        
        // 推奨事項
        if (report.recommendations.length > 0) {
            markdown += `## 推奨事項\n\n`;
            for (const recommendation of report.recommendations) {
                markdown += `- ${recommendation}\n`;
            }
            markdown += `\n`;
        }
        
        // 関連する変更
        if (report.relatedChanges.length > 0) {
            markdown += `## 関連する変更\n\n`;
            for (const related of report.relatedChanges) {
                markdown += `- **${related.relationship}**: ${related.summary}\n`;
                markdown += `  - 影響: ${related.impact.description}\n`;
            }
            markdown += `\n`;
        }
        
        return markdown;
    }
    
    /**
     * システム統計を取得
     */
    public getSystemStatistics(): SystemStatistics {
        return {
            ...this.statistics,
            indexSizes: {
                changes: this.changes.size,
                bubbleTypes: this.changesByBubble.size,
                propertyTypes: this.changesByProperty.size,
                authors: this.changesByAuthor.size,
                timeline: this.changesByTimestamp.length
            },
            storageInfo: {
                available: this.storageAvailable,
                autoSave: this.autoSaveEnabled,
                maxHistorySize: this.maxHistorySize
            }
        };
    }
    
    /**
     * 設定を更新
     */
    public updateSettings(newSettings: SystemSettings): void {
        try {
            if (newSettings.maxHistorySize && newSettings.maxHistorySize > 0) {
                this.maxHistorySize = newSettings.maxHistorySize;
            }

            if (newSettings.autoSaveEnabled !== undefined) {
                this.autoSaveEnabled = newSettings.autoSaveEnabled;
            }

            if (newSettings.storageKey && typeof newSettings.storageKey === 'string') {
                this.storageKey = newSettings.storageKey;
            }

            console.log('[BalanceChangeDocumentationSystem] 設定を更新しました');

        } catch (error) {
            this.errorHandler.handleError(error, 'DOCUMENTATION_SETTINGS', { newSettings });
        }
    }
    
    /**
     * 手動保存
     */
    public save(): boolean {
        try {
            this._saveToStorage();
            console.log('[BalanceChangeDocumentationSystem] 手動保存完了');
            return true;

        } catch (error) {
            this.errorHandler.handleError(error, 'DOCUMENTATION_MANUAL_SAVE');
            return false;
        }
    }
    
    /**
     * データをクリア
     */
    public clear(): boolean {
        try {
            this.changes.clear();
            this.changesByBubble.clear();
            this.changesByProperty.clear();
            this.changesByAuthor.clear();
            this.changesByTimestamp.length = 0;
            
            this.statistics = {
                totalChanges: 0,
                appliedChanges: 0,
                rolledBackChanges: 0,
                lastUpdate: Date.now()
            };
            
            if (this.storageAvailable) {
                localStorage.removeItem(this.storageKey);
            }

            console.log('[BalanceChangeDocumentationSystem] データをクリアしました');
            return true;

        } catch (error) {
            this.errorHandler.handleError(error, 'DOCUMENTATION_CLEAR');
            return false;
        }
    }
}

// シングルトンインスタンス
let documentationSystemInstance: BalanceChangeDocumentationSystem | null = null;

/**
 * BalanceChangeDocumentationSystemのシングルトンインスタンスを取得
 */
export function getBalanceChangeDocumentationSystem(): BalanceChangeDocumentationSystem {
    if (!documentationSystemInstance) {
        documentationSystemInstance = new BalanceChangeDocumentationSystem();
    }
    return documentationSystemInstance;
}