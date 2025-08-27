import { getErrorHandler } from '../../../utils/ErrorHandler.js';

/**
 * 翻訳進捗追跡クラス - 翻訳の完成度と進捗を追跡・管理
 */
export class ProgressTracker {
    constructor() {
        this.languageProgress = new Map();
        this.progressHistory = new Map();
        this.milestones = new Map();
        this.progressGoals = new Map();
        this.translationSets = new Map();
        this.categories = new Set(['common', 'menu', 'game', 'settings', 'errors', 'achievements', 'help']);
        
        // 進捗計算設定
        this.progressWeights = {
            translated: 0.6,    // 翻訳済み
            reviewed: 0.3,      // レビュー済み
            approved: 0.1       // 承認済み
        };
        
        // 品質レベル
        this.qualityLevels = {
            draft: { name: 'ドラフト', weight: 0.3 },
            review: { name: 'レビュー中', weight: 0.6 },
            approved: { name: '承認済み', weight: 1.0 },
            final: { name: '最終版', weight: 1.0 }
        };
        
        console.log('ProgressTracker initialized');
    }
    
    /**
     * 言語の翻訳セットを登録
     */
    registerTranslationSet(language, setName, translations, metadata = {}) {
        try {
            if (!this.translationSets.has(language)) {
                this.translationSets.set(language, new Map());
            }
            
            const languageSets = this.translationSets.get(language);
            const flattenedKeys = this.flattenTranslations(translations);
            
            const setData = {
                name: setName,
                totalKeys: Object.keys(flattenedKeys).length,
                translations: flattenedKeys,
                metadata: {
                    registeredAt: new Date().toISOString(),
                    lastUpdated: new Date().toISOString(),
                    version: metadata.version || '1.0.0',
                    category: metadata.category || 'general',
                    priority: metadata.priority || 'normal',
                    ...metadata
                },
                progress: {
                    translated: 0,
                    reviewed: 0,
                    approved: 0,
                    empty: 0,
                    total: Object.keys(flattenedKeys).length
                }
            };
            
            languageSets.set(setName, setData);
            this.calculateSetProgress(language, setName);
            this.updateLanguageProgress(language);
            
            console.log(`Translation set registered: ${language}/${setName} (${setData.totalKeys} keys)`);
            return true;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'PROGRESS_TRACKER_ERROR', {
                operation: 'registerTranslationSet',
                language: language,
                setName: setName
            });
            return false;
        }
    }
    
    /**
     * 翻訳の状態を更新
     */
    updateTranslationStatus(language, setName, key, status, value = '', metadata = {}) {
        try {
            const languageSets = this.translationSets.get(language);
            if (!languageSets || !languageSets.has(setName)) {
                throw new Error(`Translation set not found: ${language}/${setName}`);
            }
            
            const setData = languageSets.get(setName);
            
            // キーの状態を更新
            if (!setData.translations[key]) {
                setData.translations[key] = {};
            }
            
            const previousStatus = setData.translations[key].status || 'empty';
            
            setData.translations[key] = {
                ...setData.translations[key],
                value: value,
                status: status,
                updatedAt: new Date().toISOString(),
                updatedBy: metadata.updatedBy || 'system',
                quality: metadata.quality || 'draft',
                reviewNotes: metadata.reviewNotes || '',
                ...metadata
            };
            
            // 進捗統計を更新
            this.updateProgressStatistics(setData, previousStatus, status);
            
            // セット全体の進捗を再計算
            this.calculateSetProgress(language, setName);
            this.updateLanguageProgress(language);
            
            // 進捗履歴を記録
            this.recordProgressHistory(language, setName, key, previousStatus, status);
            
            return true;
            
        } catch (error) {
            getErrorHandler().handleError(error, 'PROGRESS_TRACKER_ERROR', {
                operation: 'updateTranslationStatus',
                language: language,
                setName: setName,
                key: key
            });
            return false;
        }
    }
    
    /**
     * 一括翻訳状態更新
     */
    batchUpdateTranslationStatus(language, setName, updates) {
        const results = {
            successful: [],
            failed: []
        };
        
        for (const update of updates) {
            const success = this.updateTranslationStatus(
                language,
                setName,
                update.key,
                update.status,
                update.value,
                update.metadata
            );
            
            if (success) {
                results.successful.push(update.key);
            } else {
                results.failed.push(update.key);
            }
        }
        
        return results;
    }
    
    /**
     * セットの進捗を計算
     */
    calculateSetProgress(language, setName) {
        const languageSets = this.translationSets.get(language);
        if (!languageSets || !languageSets.has(setName)) {
            return null;
        }
        
        const setData = languageSets.get(setName);
        const progress = {
            translated: 0,
            reviewed: 0,
            approved: 0,
            empty: 0,
            total: setData.totalKeys
        };
        
        let weightedProgress = 0;
        
        for (const [key, translation] of Object.entries(setData.translations)) {
            const status = translation.status || 'empty';
            const quality = translation.quality || 'draft';
            const hasValue = translation.value && translation.value.trim() !== '';
            
            // 状態別カウント
            switch (status) {
                case 'translated':
                    progress.translated++;
                    break;
                case 'reviewed':
                    progress.reviewed++;
                    break;
                case 'approved':
                    progress.approved++;
                    break;
                default:
                    progress.empty++;
                    break;
            }
            
            // 重み付き進捗計算
            if (hasValue) {
                const qualityWeight = this.qualityLevels[quality]?.weight || 0.3;
                let statusWeight = 0;
                
                switch (status) {
                    case 'translated':
                        statusWeight = this.progressWeights.translated;
                        break;
                    case 'reviewed':
                        statusWeight = this.progressWeights.reviewed;
                        break;
                    case 'approved':
                        statusWeight = this.progressWeights.approved;
                        break;
                }
                
                weightedProgress += statusWeight * qualityWeight;
            }
        }
        
        // 進捗パーセンテージを計算
        const completionRate = progress.total > 0 ? 
            Math.round(((progress.translated + progress.reviewed + progress.approved) / progress.total) * 100) : 0;
        const qualityScore = progress.total > 0 ? 
            Math.round((weightedProgress / progress.total) * 100) : 0;
        const translationRate = progress.total > 0 ? 
            Math.round(((progress.total - progress.empty) / progress.total) * 100) : 0;
        
        setData.progress = {
            ...progress,
            completionRate: completionRate,
            qualityScore: qualityScore,
            translationRate: translationRate,
            lastCalculated: new Date().toISOString()
        };
        
        return setData.progress;
    }
    
    /**
     * 言語全体の進捗を更新
     */
    updateLanguageProgress(language) {
        const languageSets = this.translationSets.get(language);
        if (!languageSets) {
            return null;
        }
        
        const overallProgress = {
            totalSets: languageSets.size,
            totalKeys: 0,
            translated: 0,
            reviewed: 0,
            approved: 0,
            empty: 0,
            completionRate: 0,
            qualityScore: 0,
            translationRate: 0,
            sets: new Map()
        };
        
        let totalWeightedProgress = 0;
        
        for (const [setName, setData] of languageSets) {
            const setProgress = setData.progress;
            
            overallProgress.totalKeys += setProgress.total;
            overallProgress.translated += setProgress.translated;
            overallProgress.reviewed += setProgress.reviewed;
            overallProgress.approved += setProgress.approved;
            overallProgress.empty += setProgress.empty;
            
            totalWeightedProgress += setProgress.qualityScore * setProgress.total;
            
            overallProgress.sets.set(setName, {
                completionRate: setProgress.completionRate,
                qualityScore: setProgress.qualityScore,
                translationRate: setProgress.translationRate,
                totalKeys: setProgress.total
            });
        }
        
        // 全体の進捗率を計算
        if (overallProgress.totalKeys > 0) {
            overallProgress.completionRate = Math.round(
                ((overallProgress.translated + overallProgress.reviewed + overallProgress.approved) 
                / overallProgress.totalKeys) * 100
            );
            overallProgress.qualityScore = Math.round(totalWeightedProgress / overallProgress.totalKeys);
            overallProgress.translationRate = Math.round(
                ((overallProgress.totalKeys - overallProgress.empty) / overallProgress.totalKeys) * 100
            );
        }
        
        overallProgress.lastUpdated = new Date().toISOString();
        
        this.languageProgress.set(language, overallProgress);
        
        // マイルストーンをチェック
        this.checkMilestones(language, overallProgress);
        
        return overallProgress;
    }
    
    /**
     * カテゴリ別進捗を取得
     */
    getCategoryProgress(language, category) {
        const languageSets = this.translationSets.get(language);
        if (!languageSets) {
            return null;
        }
        
        const categoryProgress = {
            category: category,
            totalKeys: 0,
            translated: 0,
            reviewed: 0,
            approved: 0,
            empty: 0,
            sets: []
        };
        
        for (const [setName, setData] of languageSets) {
            if (setData.metadata.category === category) {
                const setProgress = setData.progress;
                
                categoryProgress.totalKeys += setProgress.total;
                categoryProgress.translated += setProgress.translated;
                categoryProgress.reviewed += setProgress.reviewed;
                categoryProgress.approved += setProgress.approved;
                categoryProgress.empty += setProgress.empty;
                
                categoryProgress.sets.push({
                    name: setName,
                    progress: setProgress
                });
            }
        }
        
        // 完成率を計算
        if (categoryProgress.totalKeys > 0) {
            categoryProgress.completionRate = Math.round(
                ((categoryProgress.translated + categoryProgress.reviewed + categoryProgress.approved) 
                / categoryProgress.totalKeys) * 100
            );
        } else {
            categoryProgress.completionRate = 0;
        }
        
        return categoryProgress;
    }
    
    /**
     * 進捗レポートを生成
     */
    generateProgressReport(language, options = {}) {
        const {
            includeSets = true,
            includeCategories = true,
            includeHistory = false,
            includeDetails = true,
            format = 'detailed'
        } = options;
        
        const languageProgress = this.languageProgress.get(language);
        if (!languageProgress) {
            return null;
        }
        
        const report = {
            language: language,
            generatedAt: new Date().toISOString(),
            overview: {
                totalSets: languageProgress.totalSets,
                totalKeys: languageProgress.totalKeys,
                completionRate: languageProgress.completionRate,
                qualityScore: languageProgress.qualityScore,
                translationRate: languageProgress.translationRate
            },
            status: {
                translated: languageProgress.translated,
                reviewed: languageProgress.reviewed,
                approved: languageProgress.approved,
                empty: languageProgress.empty
            }
        };
        
        // セット別詳細
        if (includeSets) {
            report.sets = {};
            const languageSets = this.translationSets.get(language);
            
            for (const [setName, setData] of languageSets) {
                report.sets[setName] = {
                    totalKeys: setData.totalKeys,
                    progress: setData.progress,
                    metadata: setData.metadata
                };
                
                if (includeDetails) {
                    report.sets[setName].details = this.getSetDetails(language, setName);
                }
            }
        }
        
        // カテゴリ別進捗
        if (includeCategories) {
            report.categories = {};
            for (const category of this.categories) {
                const categoryProgress = this.getCategoryProgress(language, category);
                if (categoryProgress && categoryProgress.totalKeys > 0) {
                    report.categories[category] = categoryProgress;
                }
            }
        }
        
        // 進捗履歴
        if (includeHistory) {
            report.history = this.getProgressHistory(language);
        }
        
        // マイルストーン
        report.milestones = this.getMilestones(language);
        
        return this.formatProgressReport(report, format);
    }
    
    /**
     * 未完成項目を取得
     */
    getIncompleteItems(language, options = {}) {
        const {
            setName = null,
            category = null,
            status = ['empty'],
            limit = null,
            sortBy = 'priority'
        } = options;
        
        const incompleteItems = [];
        const languageSets = this.translationSets.get(language);
        
        if (!languageSets) {
            return incompleteItems;
        }
        
        for (const [currentSetName, setData] of languageSets) {
            // セットフィルター
            if (setName && currentSetName !== setName) {
                continue;
            }
            
            // カテゴリフィルター
            if (category && setData.metadata.category !== category) {
                continue;
            }
            
            for (const [key, translation] of Object.entries(setData.translations)) {
                const translationStatus = translation.status || 'empty';
                
                if (status.includes(translationStatus)) {
                    incompleteItems.push({
                        key: key,
                        set: currentSetName,
                        category: setData.metadata.category,
                        status: translationStatus,
                        value: translation.value || '',
                        priority: setData.metadata.priority || 'normal',
                        lastUpdated: translation.updatedAt,
                        metadata: translation
                    });
                }
            }
        }
        
        // ソート
        this.sortIncompleteItems(incompleteItems, sortBy);
        
        // 制限適用
        if (limit && limit > 0) {
            return incompleteItems.slice(0, limit);
        }
        
        return incompleteItems;
    }
    
    /**
     * マイルストーンを設定
     */
    setMilestone(language, name, targetPercentage, description = '') {
        if (!this.milestones.has(language)) {
            this.milestones.set(language, new Map());
        }
        
        const languageMilestones = this.milestones.get(language);
        languageMilestones.set(name, {
            name: name,
            targetPercentage: targetPercentage,
            description: description,
            achieved: false,
            achievedAt: null,
            createdAt: new Date().toISOString()
        });
        
        console.log(`Milestone set: ${language}/${name} (${targetPercentage}%)`);
    }
    
    /**
     * マイルストーンをチェック
     */
    checkMilestones(language, progress) {
        const languageMilestones = this.milestones.get(language);
        if (!languageMilestones) {
            return;
        }
        
        for (const [name, milestone] of languageMilestones) {
            if (!milestone.achieved && progress.completionRate >= milestone.targetPercentage) {
                milestone.achieved = true;
                milestone.achievedAt = new Date().toISOString();
                
                console.log(`🎉 Milestone achieved: ${language}/${name} (${milestone.targetPercentage}%)`);
                
                // マイルストーン達成イベントを発火（実装に応じて）
                this.onMilestoneAchieved?.(language, milestone);
            }
        }
    }
    
    /**
     * 進捗目標を設定
     */
    setProgressGoal(language, targetDate, targetPercentage, description = '') {
        this.progressGoals.set(language, {
            targetDate: new Date(targetDate).toISOString(),
            targetPercentage: targetPercentage,
            description: description,
            setAt: new Date().toISOString()
        });
        
        console.log(`Progress goal set: ${language} -> ${targetPercentage}% by ${targetDate}`);
    }
    
    /**
     * 目標達成予測を計算
     */
    predictGoalAchievement(language) {
        const goal = this.progressGoals.get(language);
        const progress = this.languageProgress.get(language);
        const history = this.getProgressHistory(language, 30); // 30日間の履歴
        
        if (!goal || !progress || history.length < 2) {
            return null;
        }
        
        // 進捗速度を計算
        const recentHistory = history.slice(-7); // 過去7日
        if (recentHistory.length < 2) {
            return null;
        }
        
        const oldestEntry = recentHistory[0];
        const newestEntry = recentHistory[recentHistory.length - 1];
        
        const daysElapsed = (new Date(newestEntry.date) - new Date(oldestEntry.date)) / (1000 * 60 * 60 * 24);
        const progressChange = newestEntry.completionRate - oldestEntry.completionRate;
        
        if (daysElapsed <= 0) {
            return null;
        }
        
        const dailyProgressRate = progressChange / daysElapsed;
        const remainingProgress = goal.targetPercentage - progress.completionRate;
        const estimatedDaysToGoal = remainingProgress / dailyProgressRate;
        
        const estimatedCompletionDate = new Date();
        estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + estimatedDaysToGoal);
        
        const targetDate = new Date(goal.targetDate);
        const isOnTrack = estimatedCompletionDate <= targetDate;
        
        return {
            currentProgress: progress.completionRate,
            targetProgress: goal.targetPercentage,
            targetDate: goal.targetDate,
            estimatedCompletionDate: estimatedCompletionDate.toISOString(),
            dailyProgressRate: Math.round(dailyProgressRate * 100) / 100,
            daysToGoal: Math.ceil(estimatedDaysToGoal),
            isOnTrack: isOnTrack,
            daysAheadBehind: Math.ceil((targetDate - estimatedCompletionDate) / (1000 * 60 * 60 * 24))
        };
    }
    
    /**
     * ヘルパー関数群
     */
    
    flattenTranslations(translations, prefix = '') {
        const flattened = {};
        
        for (const [key, value] of Object.entries(translations)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                Object.assign(flattened, this.flattenTranslations(value, fullKey));
            } else if (typeof value === 'string') {
                flattened[fullKey] = {
                    value: value,
                    status: value.trim() ? 'translated' : 'empty',
                    quality: 'draft'
                };
            }
        }
        
        return flattened;
    }
    
    updateProgressStatistics(setData, previousStatus, newStatus) {
        // 前の状態のカウントを減らす
        if (previousStatus && setData.progress[previousStatus] > 0) {
            setData.progress[previousStatus]--;
        }
        
        // 新しい状態のカウントを増やす
        if (newStatus && setData.progress.hasOwnProperty(newStatus)) {
            setData.progress[newStatus]++;
        }
    }
    
    recordProgressHistory(language, setName, key, previousStatus, newStatus) {
        if (!this.progressHistory.has(language)) {
            this.progressHistory.set(language, []);
        }
        
        const history = this.progressHistory.get(language);
        history.push({
            date: new Date().toISOString(),
            set: setName,
            key: key,
            previousStatus: previousStatus,
            newStatus: newStatus,
            completionRate: this.languageProgress.get(language)?.completionRate || 0
        });
        
        // 履歴を最新1000件に制限
        if (history.length > 1000) {
            history.splice(0, history.length - 1000);
        }
    }
    
    getProgressHistory(language, days = 30) {
        const history = this.progressHistory.get(language) || [];
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return history.filter(entry => new Date(entry.date) > cutoffDate);
    }
    
    getMilestones(language) {
        const languageMilestones = this.milestones.get(language);
        if (!languageMilestones) {
            return [];
        }
        
        return Array.from(languageMilestones.values());
    }
    
    getSetDetails(language, setName) {
        const languageSets = this.translationSets.get(language);
        if (!languageSets || !languageSets.has(setName)) {
            return null;
        }
        
        const setData = languageSets.get(setName);
        const details = {
            recentUpdates: [],
            topContributors: new Map(),
            qualityDistribution: { draft: 0, review: 0, approved: 0, final: 0 }
        };
        
        // 最近の更新と品質分布を分析
        for (const [key, translation] of Object.entries(setData.translations)) {
            if (translation.updatedAt) {
                details.recentUpdates.push({
                    key: key,
                    updatedAt: translation.updatedAt,
                    updatedBy: translation.updatedBy || 'unknown',
                    status: translation.status
                });
            }
            
            const quality = translation.quality || 'draft';
            if (details.qualityDistribution.hasOwnProperty(quality)) {
                details.qualityDistribution[quality]++;
            }
            
            const contributor = translation.updatedBy || 'unknown';
            details.topContributors.set(contributor, 
                (details.topContributors.get(contributor) || 0) + 1);
        }
        
        // 最近の更新を時間順でソート
        details.recentUpdates.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        details.recentUpdates = details.recentUpdates.slice(0, 10);
        
        // 貢献者を貢献度順でソート
        details.topContributors = Array.from(details.topContributors.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([contributor, count]) => ({ contributor, count }));
        
        return details;
    }
    
    sortIncompleteItems(items, sortBy) {
        switch (sortBy) {
            case 'priority':
                const priorityOrder = { high: 3, normal: 2, low: 1 };
                items.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
                break;
            case 'alphabetical':
                items.sort((a, b) => a.key.localeCompare(b.key));
                break;
            case 'category':
                items.sort((a, b) => a.category.localeCompare(b.category));
                break;
            case 'updated':
                items.sort((a, b) => {
                    const aDate = a.lastUpdated ? new Date(a.lastUpdated) : new Date(0);
                    const bDate = b.lastUpdated ? new Date(b.lastUpdated) : new Date(0);
                    return bDate - aDate;
                });
                break;
        }
    }
    
    formatProgressReport(report, format) {
        switch (format) {
            case 'summary':
                return {
                    language: report.language,
                    completionRate: report.overview.completionRate,
                    qualityScore: report.overview.qualityScore,
                    totalKeys: report.overview.totalKeys,
                    milestones: report.milestones.filter(m => m.achieved)
                };
            case 'csv':
                return this.generateCSVReport(report);
            case 'detailed':
            default:
                return report;
        }
    }
    
    generateCSVReport(report) {
        const rows = [
            ['Set Name', 'Total Keys', 'Completion Rate', 'Quality Score', 'Category', 'Last Updated'].join(',')
        ];
        
        if (report.sets) {
            for (const [setName, setData] of Object.entries(report.sets)) {
                rows.push([
                    `"${setName}"`,
                    setData.totalKeys,
                    `${setData.progress.completionRate}%`,
                    `${setData.progress.qualityScore}%`,
                    `"${setData.metadata.category}"`,
                    `"${setData.metadata.lastUpdated}"`
                ].join(','));
            }
        }
        
        return rows.join('\n');
    }
    
    /**
     * 統計情報を取得
     */
    getStats() {
        return {
            trackedLanguages: this.languageProgress.size,
            totalTranslationSets: Array.from(this.translationSets.values())
                .reduce((sum, sets) => sum + sets.size, 0),
            totalMilestones: Array.from(this.milestones.values())
                .reduce((sum, milestones) => sum + milestones.size, 0),
            progressGoals: this.progressGoals.size,
            categories: Array.from(this.categories)
        };
    }
    
    /**
     * 言語の進捗情報を取得
     */
    getLanguageProgress(language) {
        return this.languageProgress.get(language) || null;
    }
    
    /**
     * すべての言語の進捗情報を取得
     */
    getAllLanguageProgress() {
        return Object.fromEntries(this.languageProgress);
    }
}

// シングルトンインスタンス
let progressTrackerInstance = null;

/**
 * ProgressTrackerのシングルトンインスタンスを取得
 */
export function getProgressTracker() {
    if (!progressTrackerInstance) {
        progressTrackerInstance = new ProgressTracker();
    }
    return progressTrackerInstance;
}