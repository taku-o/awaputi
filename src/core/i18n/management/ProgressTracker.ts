import { getErrorHandler } from '../../../utils/ErrorHandler.js';

// インターフェース定義
interface TranslationSetData {
    name: string;
    totalKeys: number;
    translations: { [key: string]: TranslationEntry };
    metadata: TranslationMetadata;
    progress: ProgressData;
}

interface TranslationEntry {
    value?: string;
    status?: string;
    updatedAt?: string;
    updatedBy?: string;
    quality?: string;
    reviewNotes?: string;
    [key: string]: any;
}

interface TranslationMetadata {
    registeredAt: string;
    lastUpdated: string;
    version: string;
    category: string;
    priority: string;
    [key: string]: any;
}

interface ProgressData {
    translated: number;
    reviewed: number;
    approved: number;
    empty: number;
    total: number;
    completionRate?: number;
    qualityScore?: number;
    translationRate?: number;
    lastCalculated?: string;
}

interface LanguageProgress {
    totalSets: number;
    totalKeys: number;
    translated: number;
    reviewed: number;
    approved: number;
    empty: number;
    completionRate: number;
    qualityScore: number;
    translationRate: number;
    sets: Map<string, SetProgress>;
    lastUpdated?: string;
}

interface SetProgress {
    completionRate: number;
    qualityScore: number;
    translationRate: number;
    totalKeys: number;
}

interface CategoryProgress {
    category: string;
    totalKeys: number;
    translated: number;
    reviewed: number;
    approved: number;
    empty: number;
    sets: Array<{ name: string; progress: ProgressData }>;
    completionRate?: number;
}

interface ProgressReport {
    language: string;
    generatedAt: string;
    overview: {
        totalSets: number;
        totalKeys: number;
        completionRate: number;
        qualityScore: number;
        translationRate: number;
    };
    status: {
        translated: number;
        reviewed: number;
        approved: number;
        empty: number;
    };
    sets?: { [key: string]: any };
    categories?: { [key: string]: CategoryProgress };
    history?: HistoryEntry[];
    milestones?: Milestone[];
}

interface HistoryEntry {
    date: string;
    set: string;
    key: string;
    previousStatus: string;
    newStatus: string;
    completionRate: number;
}

interface Milestone {
    name: string;
    targetPercentage: number;
    description: string;
    achieved: boolean;
    achievedAt: string | null;
    createdAt: string;
}

interface ProgressGoal {
    targetDate: string;
    targetPercentage: number;
    description: string;
    setAt: string;
}

interface IncompleteItem {
    key: string;
    set: string;
    category: string;
    status: string;
    value: string;
    priority: string;
    lastUpdated?: string;
    metadata: TranslationEntry;
}

/**
 * 翻訳進捗トラッカー - 翻訳進捗の詳細な管理とレポート生成
 */
export class ProgressTracker {
    private translationSets: Map<string, TranslationSetData>;
    private languageProgress: Map<string, LanguageProgress>;
    private translationHistory: HistoryEntry[];
    private milestones: Map<string, Milestone[]>;
    private goals: Map<string, ProgressGoal>;
    private lastUpdateTime: Date;

    constructor() {
        this.translationSets = new Map<string, TranslationSetData>();
        this.languageProgress = new Map<string, LanguageProgress>();
        this.translationHistory = [];
        this.milestones = new Map<string, Milestone[]>();
        this.goals = new Map<string, ProgressGoal>();
        this.lastUpdateTime = new Date();
    }

    /**
     * 翻訳セットの登録
     */
    registerTranslationSet(language: string, setName: string, data: any): boolean {
        try {
            const setData: TranslationSetData = {
                name: setName,
                totalKeys: Object.keys(data).length,
                translations: this._convertToTranslationEntries(data),
                metadata: {
                    registeredAt: new Date().toISOString(),
                    lastUpdated: new Date().toISOString(),
                    version: '1.0.0',
                    category: 'general',
                    priority: 'normal'
                },
                progress: {
                    translated: 0,
                    reviewed: 0,
                    approved: 0,
                    empty: 0,
                    total: Object.keys(data).length
                }
            };

            const setKey = `${language}:${setName}`;
            this.translationSets.set(setKey, setData);

            // 進捗を計算
            this._calculateProgress(language, setName);
            this._updateLanguageProgress(language);

            console.log(`Translation set registered: ${setKey}`);
            return true;

        } catch (error) {
            getErrorHandler().handleError(error as Error, 'PROGRESS_TRACKER_ERROR', {
                operation: 'registerTranslationSet',
                language,
                setName
            });
            return false;
        }
    }

    /**
     * 翻訳の更新
     */
    updateTranslation(language: string, setName: string, key: string, value: string, status: string = 'translated'): boolean {
        try {
            const setKey = `${language}:${setName}`;
            const setData = this.translationSets.get(setKey);

            if (!setData) {
                console.warn(`Translation set not found: ${setKey}`);
                return false;
            }

            const previousStatus = setData.translations[key]?.status || 'empty';

            // 翻訳を更新
            setData.translations[key] = {
                ...setData.translations[key],
                value,
                status,
                updatedAt: new Date().toISOString(),
                updatedBy: 'system'
            };

            // 履歴に記録
            this._addHistoryEntry({
                date: new Date().toISOString(),
                set: setName,
                key,
                previousStatus,
                newStatus: status,
                completionRate: 0 // 後で計算
            });

            // 進捗を再計算
            this._calculateProgress(language, setName);
            this._updateLanguageProgress(language);

            this.lastUpdateTime = new Date();
            return true;

        } catch (error) {
            getErrorHandler().handleError(error as Error, 'PROGRESS_TRACKER_ERROR', {
                operation: 'updateTranslation',
                language,
                setName,
                key
            });
            return false;
        }
    }

    /**
     * 進捗レポートの生成
     */
    generateProgressReport(language: string, includeDetails: boolean = true): ProgressReport | null {
        try {
            const languageProgress = this.languageProgress.get(language);
            if (!languageProgress) {
                console.warn(`No progress data found for language: ${language}`);
                return null;
            }

            const report: ProgressReport = {
                language,
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

            if (includeDetails) {
                report.sets = this._getDetailedSetProgress(language);
                report.categories = this._getCategoryProgress(language);
                report.history = this._getRecentHistory(language);
                report.milestones = this.milestones.get(language) || [];
            }

            return report;

        } catch (error) {
            getErrorHandler().handleError(error as Error, 'PROGRESS_TRACKER_ERROR', {
                operation: 'generateProgressReport',
                language
            });
            return null;
        }
    }

    /**
     * マイルストーンの設定
     */
    setMilestone(language: string, name: string, targetPercentage: number, description: string): boolean {
        try {
            const milestone: Milestone = {
                name,
                targetPercentage,
                description,
                achieved: false,
                achievedAt: null,
                createdAt: new Date().toISOString()
            };

            if (!this.milestones.has(language)) {
                this.milestones.set(language, []);
            }

            this.milestones.get(language)!.push(milestone);

            // 現在の進捗と比較してマイルストーン達成をチェック
            this._checkMilestones(language);

            return true;

        } catch (error) {
            getErrorHandler().handleError(error as Error, 'PROGRESS_TRACKER_ERROR', {
                operation: 'setMilestone',
                language,
                name
            });
            return false;
        }
    }

    /**
     * 未完了項目の取得
     */
    getIncompleteItems(language: string, category?: string): IncompleteItem[] {
        const incompleteItems: IncompleteItem[] = [];

        try {
            for (const [setKey, setData] of this.translationSets.entries()) {
                if (!setKey.startsWith(`${language}:`)) continue;

                if (category && setData.metadata.category !== category) continue;

                for (const [key, entry] of Object.entries(setData.translations)) {
                    if (!entry.value || entry.status === 'empty' || entry.status === 'pending') {
                        incompleteItems.push({
                            key,
                            set: setData.name,
                            category: setData.metadata.category,
                            status: entry.status || 'empty',
                            value: entry.value || '',
                            priority: setData.metadata.priority,
                            lastUpdated: entry.updatedAt,
                            metadata: entry
                        });
                    }
                }
            }

            return incompleteItems.sort((a, b) => {
                // 優先度でソート
                const priorityOrder = { 'high': 0, 'normal': 1, 'low': 2 };
                return (priorityOrder[a.priority as keyof typeof priorityOrder] || 1) - 
                       (priorityOrder[b.priority as keyof typeof priorityOrder] || 1);
            });

        } catch (error) {
            getErrorHandler().handleError(error as Error, 'PROGRESS_TRACKER_ERROR', {
                operation: 'getIncompleteItems',
                language
            });
            return [];
        }
    }

    // プライベートメソッド
    private _convertToTranslationEntries(data: any): { [key: string]: TranslationEntry } {
        const entries: { [key: string]: TranslationEntry } = {};

        for (const [key, value] of Object.entries(data)) {
            entries[key] = {
                value: value as string,
                status: value ? 'translated' : 'empty',
                updatedAt: new Date().toISOString(),
                updatedBy: 'system',
                quality: 'unreviewed'
            };
        }

        return entries;
    }

    private _calculateProgress(language: string, setName: string): void {
        const setKey = `${language}:${setName}`;
        const setData = this.translationSets.get(setKey);
        if (!setData) return;

        let translated = 0;
        let reviewed = 0;
        let approved = 0;
        let empty = 0;

        for (const entry of Object.values(setData.translations)) {
            switch (entry.status) {
                case 'translated':
                    translated++;
                    break;
                case 'reviewed':
                    reviewed++;
                    break;
                case 'approved':
                    approved++;
                    break;
                case 'empty':
                default:
                    empty++;
                    break;
            }
        }

        setData.progress = {
            translated,
            reviewed,
            approved,
            empty,
            total: setData.totalKeys,
            completionRate: Math.round((translated + reviewed + approved) / setData.totalKeys * 100),
            qualityScore: Math.round(approved / setData.totalKeys * 100),
            translationRate: Math.round(translated / setData.totalKeys * 100),
            lastCalculated: new Date().toISOString()
        };
    }

    private _updateLanguageProgress(language: string): void {
        const languageSets = new Map<string, SetProgress>();
        let totalKeys = 0;
        let translated = 0;
        let reviewed = 0;
        let approved = 0;
        let empty = 0;

        for (const [setKey, setData] of this.translationSets.entries()) {
            if (!setKey.startsWith(`${language}:`)) continue;

            totalKeys += setData.totalKeys;
            translated += setData.progress.translated;
            reviewed += setData.progress.reviewed;
            approved += setData.progress.approved;
            empty += setData.progress.empty;

            languageSets.set(setData.name, {
                completionRate: setData.progress.completionRate || 0,
                qualityScore: setData.progress.qualityScore || 0,
                translationRate: setData.progress.translationRate || 0,
                totalKeys: setData.totalKeys
            });
        }

        const completionRate = totalKeys > 0 ? Math.round((translated + reviewed + approved) / totalKeys * 100) : 0;
        const qualityScore = totalKeys > 0 ? Math.round(approved / totalKeys * 100) : 0;
        const translationRate = totalKeys > 0 ? Math.round(translated / totalKeys * 100) : 0;

        this.languageProgress.set(language, {
            totalSets: languageSets.size,
            totalKeys,
            translated,
            reviewed,
            approved,
            empty,
            completionRate,
            qualityScore,
            translationRate,
            sets: languageSets,
            lastUpdated: new Date().toISOString()
        });

        // マイルストーンチェック
        this._checkMilestones(language);
    }

    private _addHistoryEntry(entry: HistoryEntry): void {
        // 完了率を計算
        const languageProgress = this.languageProgress.get(entry.set.split(':')[0]);
        entry.completionRate = languageProgress?.completionRate || 0;

        this.translationHistory.push(entry);

        // 履歴は最新の1000件まで保持
        if (this.translationHistory.length > 1000) {
            this.translationHistory = this.translationHistory.slice(-1000);
        }
    }

    private _checkMilestones(language: string): void {
        const milestones = this.milestones.get(language);
        if (!milestones) return;

        const progress = this.languageProgress.get(language);
        if (!progress) return;

        for (const milestone of milestones) {
            if (!milestone.achieved && progress.completionRate >= milestone.targetPercentage) {
                milestone.achieved = true;
                milestone.achievedAt = new Date().toISOString();
                console.log(`Milestone achieved: ${milestone.name} (${milestone.targetPercentage}%)`);
            }
        }
    }

    private _getDetailedSetProgress(language: string): { [key: string]: any } {
        const details: { [key: string]: any } = {};

        for (const [setKey, setData] of this.translationSets.entries()) {
            if (!setKey.startsWith(`${language}:`)) continue;

            details[setData.name] = {
                totalKeys: setData.totalKeys,
                progress: setData.progress,
                metadata: setData.metadata
            };
        }

        return details;
    }

    private _getCategoryProgress(language: string): { [key: string]: CategoryProgress } {
        const categories: { [key: string]: CategoryProgress } = {};

        for (const [setKey, setData] of this.translationSets.entries()) {
            if (!setKey.startsWith(`${language}:`)) continue;

            const category = setData.metadata.category;
            if (!categories[category]) {
                categories[category] = {
                    category,
                    totalKeys: 0,
                    translated: 0,
                    reviewed: 0,
                    approved: 0,
                    empty: 0,
                    sets: []
                };
            }

            const cat = categories[category];
            cat.totalKeys += setData.totalKeys;
            cat.translated += setData.progress.translated;
            cat.reviewed += setData.progress.reviewed;
            cat.approved += setData.progress.approved;
            cat.empty += setData.progress.empty;
            cat.sets.push({
                name: setData.name,
                progress: setData.progress
            });
        }

        // 完了率を計算
        for (const category of Object.values(categories)) {
            category.completionRate = category.totalKeys > 0 ? 
                Math.round((category.translated + category.reviewed + category.approved) / category.totalKeys * 100) : 0;
        }

        return categories;
    }

    private _getRecentHistory(language: string): HistoryEntry[] {
        return this.translationHistory
            .filter(entry => entry.set.startsWith(language))
            .slice(-50) // 最新の50件
            .reverse(); // 新しい順
    }

    /**
     * 統計情報の取得
     */
    getStats(): any {
        return {
            totalSets: this.translationSets.size,
            totalLanguages: this.languageProgress.size,
            totalHistoryEntries: this.translationHistory.length,
            lastUpdateTime: this.lastUpdateTime.toISOString(),
            milestones: Array.from(this.milestones.values()).flat().length
        };
    }
}