interface Achievement {
    id: string;
    name: string;
    icon?: string;
    unlocked: boolean;
    unlockedDate?: string;
    category: string;
    progress?: {
        current?: number;
        target?: number;
    };
    reward?: {
        ap?: number;
    };
}

interface AchievementManager {
    getAchievements(): Achievement[];
    getAchievementsByCategory(): Record<string, AchievementCategory>;
    calculateTotalRewards(): { ap: number };
}

interface AchievementCategory {
    name: string;
    achievements?: Achievement[];
}

interface OverallStats {
    total: number;
    unlocked: number;
    locked: number;
    completionRate: number;
    totalRewards: number;
}

interface CategoryStats {
    name: string;
    total: number;
    unlocked: number;
    locked: number;
    completionRate: number;
    rewards: number;
}

interface RecentUnlock {
    id: string;
    name: string;
    icon?: string;
    reward?: {
        ap?: number;
    };
    unlockedDate: string;
    category: string;
}

interface ProgressStats {
    progressRanges: {
        high: number;
        medium: number;
        low: number;
    };
    averageProgress: number;
    nearCompletion: number;
}

interface RewardStats {
    earnedAP: number;
    potentialAP: number;
    totalAP: number;
    earnedPercentage: number;
}

interface StatisticsData {
    overall: OverallStats;
    categories: Record<string, CategoryStats>;
    recent: RecentUnlock[];
    progress: ProgressStats;
    rewards: RewardStats;
}

interface ColorScheme {
    background: string;
    text: string;
    subtext: string;
    accent: string;
    warning: string;
    error: string;
    border: string;
    gradient: {
        primary: string[];
        secondary: string[];
        tertiary: string[];
    };
}

interface StatItem {
    label: string;
    value: string | number;
    suffix?: string;
    color?: string;
}

/**
 * 実績統計表示UIクラス
 */
export class AchievementStatsUI {
    private achievementManager: AchievementManager;
    private statsCache: StatisticsData | null;
    private lastCacheUpdate: number;
    private cacheTimeout: number;
    private padding: number;
    private sectionSpacing: number;
    private itemHeight: number;
    private colors: ColorScheme;

    constructor(achievementManager: AchievementManager) {
        this.achievementManager = achievementManager;
        
        // 統計データキャッシュ
        this.statsCache = null;
        this.lastCacheUpdate = 0;
        this.cacheTimeout = 5000; // 5秒キャッシュ
        
        // UI設定
        this.padding = 20;
        this.sectionSpacing = 30;
        this.itemHeight = 25;
        
        // 色設定
        this.colors = {
            background: '#1a1a2e',
            text: '#ffffff',
            subtext: '#cccccc',
            accent: '#4CAF50',
            warning: '#FF9800',
            error: '#f44336',
            border: '#333',
            gradient: {
                primary: ['#4CAF50', '#2E7D32'],
                secondary: ['#2196F3', '#1976D2'],
                tertiary: ['#FF9800', '#F57C00']
            }
        };
        
        this.initialize();
    }
    
    /**
     * 統計UIを初期化
     */
    private initialize(): void {
        console.log('Achievement Stats UI initialized');
    }
    
    /**
     * 統計データを取得（キャッシュ付き）
     */
    public getStatistics(): StatisticsData {
        const now = Date.now();
        if (!this.statsCache || (now - this.lastCacheUpdate) > this.cacheTimeout) {
            this.updateStatisticsCache();
            this.lastCacheUpdate = now;
        }
        
        return this.statsCache!;
    }
    
    /**
     * 統計データキャッシュを更新
     */
    private updateStatisticsCache(): void {
        try {
            const achievements = this.achievementManager.getAchievements();
            const categorizedAchievements = this.achievementManager.getAchievementsByCategory();
            
            this.statsCache = {
                overall: this.calculateOverallStats(achievements),
                categories: this.calculateCategoryStats(categorizedAchievements),
                recent: this.calculateRecentUnlocks(achievements),
                progress: this.calculateProgressStats(achievements),
                rewards: this.calculateRewardStats(achievements)
            };
        } catch (error) {
            console.error('Failed to update statistics cache:', error);
            this.statsCache = this.getEmptyStats();
        }
    }
    
    /**
     * 全体統計を計算
     */
    private calculateOverallStats(achievements: Achievement[]): OverallStats {
        const total = achievements.length;
        const unlocked = achievements.filter(a => a.unlocked).length;
        const completion = total > 0 ? (unlocked / total * 100) : 0;
        
        return {
            total: total,
            unlocked: unlocked,
            locked: total - unlocked,
            completionRate: completion,
            totalRewards: this.achievementManager.calculateTotalRewards().ap
        };
    }
    
    /**
     * カテゴリ別統計を計算
     */
    private calculateCategoryStats(categorizedAchievements: Record<string, AchievementCategory>): Record<string, CategoryStats> {
        const stats: Record<string, CategoryStats> = {};
        
        Object.keys(categorizedAchievements).forEach(categoryKey => {
            const category = categorizedAchievements[categoryKey];
            const achievements = category.achievements || [];
            const total = achievements.length;
            const unlocked = achievements.filter(a => a.unlocked).length;
            const completion = total > 0 ? (unlocked / total * 100) : 0;
            
            stats[categoryKey] = {
                name: category.name,
                total: total,
                unlocked: unlocked,
                locked: total - unlocked,
                completionRate: completion,
                rewards: achievements
                    .filter(a => a.unlocked)
                    .reduce((sum, a) => sum + (a.reward?.ap || 0), 0)
            };
        });
        
        return stats;
    }
    
    /**
     * 最近の解除実績を計算
     */
    private calculateRecentUnlocks(achievements: Achievement[]): RecentUnlock[] {
        const unlockedAchievements = achievements
            .filter(a => a.unlocked && a.unlockedDate)
            .sort((a, b) => new Date(b.unlockedDate!).getTime() - new Date(a.unlockedDate!).getTime())
            .slice(0, 5); // 最新5件
        
        return unlockedAchievements.map(achievement => ({
            id: achievement.id,
            name: achievement.name,
            icon: achievement.icon,
            reward: achievement.reward,
            unlockedDate: achievement.unlockedDate!,
            category: achievement.category
        } as RecentUnlock));
    }
    
    /**
     * 進捗統計を計算
     */
    private calculateProgressStats(achievements: Achievement[]): ProgressStats {
        const lockedAchievements = achievements.filter(a => !a.unlocked);
        
        // 進捗度別の分類
        const progressRanges = {
            high: lockedAchievements.filter(a => this.getProgressPercentage(a) >= 75).length,
            medium: lockedAchievements.filter(a => {
                const p = this.getProgressPercentage(a);
                return p >= 25 && p < 75;
            }).length,
            low: lockedAchievements.filter(a => this.getProgressPercentage(a) < 25).length
        };
        
        // 平均進捗率
        const totalProgress = lockedAchievements.reduce((sum, a) => sum + this.getProgressPercentage(a), 0);
        const averageProgress = lockedAchievements.length > 0 ? totalProgress / lockedAchievements.length : 0;
        
        return {
            progressRanges: progressRanges,
            averageProgress: averageProgress,
            nearCompletion: progressRanges.high
        };
    }
    
    /**
     * 報酬統計を計算
     */
    private calculateRewardStats(achievements: Achievement[]): RewardStats {
        const unlockedAchievements = achievements.filter(a => a.unlocked);
        const lockedAchievements = achievements.filter(a => !a.unlocked);
        
        const earnedAP = unlockedAchievements.reduce((sum, a) => sum + (a.reward?.ap || 0), 0);
        const potentialAP = lockedAchievements.reduce((sum, a) => sum + (a.reward?.ap || 0), 0);
        const totalAP = earnedAP + potentialAP;
        
        return {
            earnedAP: earnedAP,
            potentialAP: potentialAP,
            totalAP: totalAP,
            earnedPercentage: totalAP > 0 ? (earnedAP / totalAP * 100) : 0
        };
    }
    
    /**
     * 実績の進捗パーセンテージを取得
     */
    private getProgressPercentage(achievement: Achievement): number {
        if (!achievement.progress) return 0;
        
        const current = achievement.progress.current || 0;
        const target = achievement.progress.target || 1;
        
        return Math.min(100, (current / target) * 100);
    }
    
    /**
     * 空の統計データを取得
     */
    private getEmptyStats(): StatisticsData {
        return {
            overall: { total: 0, unlocked: 0, locked: 0, completionRate: 0, totalRewards: 0 },
            categories: {},
            recent: [],
            progress: { progressRanges: { high: 0, medium: 0, low: 0 }, averageProgress: 0, nearCompletion: 0 },
            rewards: { earnedAP: 0, potentialAP: 0, totalAP: 0, earnedPercentage: 0 }
        };
    }
    
    /**
     * 全体統計を描画
     */
    public renderOverallStats(context: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number): number {
        const stats = this.getStatistics().overall;

        context.save();
        context.font = 'bold 18px Arial';
        context.textAlign = 'left';
        context.fillStyle = this.colors.text;
        context.fillText('全体統計', x, y + 20);
        
        let currentY = y + 40;
        
        // 統計項目を描画
        const items: StatItem[] = [
            { label: '総実績数', value: stats.total, suffix: '個' },
            { label: '解除済み', value: stats.unlocked, suffix: '個', color: this.colors.accent },
            { label: '未解除', value: stats.locked, suffix: '個', color: this.colors.warning },
            { label: '達成率', value: stats.completionRate.toFixed(1), suffix: '%', color: this.colors.accent },
            { label: '獲得AP', value: stats.totalRewards, suffix: 'AP', color: this.colors.accent }
        ];
        
        items.forEach(item => {
            this.renderStatItem(context, x, currentY, width, item);
            currentY += this.itemHeight;
        });
        
        // 円グラフで完了率を表示
        this.renderCompletionChart(context, x + width - 80, y + 50, 60, stats.completionRate);
        
        context.restore();
        return currentY + this.sectionSpacing;
    }
    
    /**
     * カテゴリ別統計を描画
     */
    public renderCategoryStats(context: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number): number {
        const categoryStats = this.getStatistics().categories;

        context.save();
        context.font = 'bold 18px Arial';
        context.textAlign = 'left';
        context.fillStyle = this.colors.text;
        context.fillText('カテゴリ別統計', x, y + 20);
        
        let currentY = y + 40;
        
        // カテゴリごとの統計を描画
        Object.entries(categoryStats).forEach(([_key, stats]) => {
            currentY = this.renderCategoryItem(context, x, currentY, width, stats);
        });
        
        context.restore();
        return currentY + this.sectionSpacing;
    }
    
    /**
     * 最近の解除実績を描画
     */
    public renderRecentUnlocks(context: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number): number {
        const recentUnlocks = this.getStatistics().recent;

        context.save();
        context.font = 'bold 18px Arial';
        context.textAlign = 'left';
        context.fillStyle = this.colors.text;
        context.fillText('最近の解除実績', x, y + 20);
        
        let currentY = y + 40;

        if (recentUnlocks.length === 0) {
            context.fillStyle = this.colors.subtext;
            context.font = '14px Arial';
            context.fillText('まだ解除された実績がありません', x, currentY + 20);
            currentY += 40;
        } else {
            recentUnlocks.forEach(achievement => {
                currentY = this.renderRecentUnlockItem(context, x, currentY, width, achievement);
            });
        }
        
        context.restore();
        return currentY + this.sectionSpacing;
    }
    
    /**
     * 進捗チャートを描画
     */
    public renderProgressChart(context: CanvasRenderingContext2D, x: number, y: number, width: number, _height: number): number {
        const progressStats = this.getStatistics().progress;

        context.save();
        context.font = 'bold 18px Arial';
        context.textAlign = 'left';
        context.fillStyle = this.colors.text;
        context.fillText('進捗分析', x, y + 20);
        
        let currentY = y + 40;
        
        // 進捗範囲の棒グラフ
        const chartHeight = 100;
        const barWidth = (width - 60) / 3;
        const maxValue = Math.max(
            progressStats.progressRanges.high,
            progressStats.progressRanges.medium,
            progressStats.progressRanges.low,
            1
        );

        const ranges = [
            { label: '高進捗\n(75%+)', value: progressStats.progressRanges.high, color: '#4CAF50' },
            { label: '中進捗\n(25-75%)', value: progressStats.progressRanges.medium, color: '#FF9800' },
            { label: '低進捗\n(<25%)', value: progressStats.progressRanges.low, color: '#f44336' }
        ];
        
        ranges.forEach((range, index) => {
            const barX = x + index * (barWidth + 20);
            const barHeight = (range.value / maxValue) * chartHeight;
            const barY = currentY + chartHeight - barHeight;
            
            // 棒グラフ
            context.fillStyle = range.color;
            context.fillRect(barX, barY, barWidth, barHeight);
            
            // 値表示
            context.fillStyle = this.colors.text;
            context.font = 'bold 14px Arial';
            context.textAlign = 'center';
            context.fillText(range.value.toString(), barX + barWidth / 2, barY - 5);
            
            // ラベル
            context.fillStyle = this.colors.subtext;
            context.font = '12px Arial';
            const lines = range.label.split('\n');
            lines.forEach((line, lineIndex) => {
                context.fillText(line, barX + barWidth / 2, currentY + chartHeight + 15 + lineIndex * 15);
            });
        });
        
        currentY += chartHeight + 50;
        
        // 平均進捗率
        context.fillStyle = this.colors.text;
        context.font = '14px Arial';
        context.textAlign = 'left';
        context.fillText(`平均進捗率: ${progressStats.averageProgress.toFixed(1)}%`, x, currentY);
        
        context.restore();
        return currentY + this.sectionSpacing;
    }
    
    /**
     * 統計項目を描画
     */
    private renderStatItem(context: CanvasRenderingContext2D, x: number, y: number, width: number, item: StatItem): void {
        context.fillStyle = this.colors.subtext;
        context.font = '14px Arial';
        context.textAlign = 'left';
        context.fillText(item.label + ':', x, y);
        
        context.fillStyle = item.color || this.colors.text;
        context.font = 'bold 14px Arial';
        context.textAlign = 'right';
        context.fillText(item.value + (item.suffix || ''), x + width - 100, y);
    }
    
    /**
     * カテゴリ項目を描画
     */
    private renderCategoryItem(context: CanvasRenderingContext2D, x: number, y: number, width: number, stats: CategoryStats): number {
        const itemHeight = 50;
        
        // 背景
        context.fillStyle = this.colors.background;
        context.fillRect(x, y, width, itemHeight);
        
        // 枠線
        context.strokeStyle = this.colors.border;
        context.lineWidth = 1;
        context.strokeRect(x, y, width, itemHeight);
        
        // カテゴリ名
        context.fillStyle = this.colors.text;
        context.font = 'bold 14px Arial';
        context.textAlign = 'left';
        context.fillText(stats.name, x + 10, y + 20);
        
        // 統計値
        context.fillStyle = this.colors.subtext;
        context.font = '12px Arial';
        context.fillText(`${stats.unlocked}/${stats.total} (${stats.completionRate.toFixed(1)}%)`, x + 10, y + 35);
        
        // 進捗バー
        const barWidth = 150;
        const barHeight = 6;
        const barX = x + width - barWidth - 10;
        const barY = y + 25;
        
        // 背景
        context.fillStyle = '#333';
        context.fillRect(barX, barY, barWidth, barHeight);
        
        // 進捗
        const fillWidth = (stats.completionRate / 100) * barWidth;
        context.fillStyle = stats.completionRate >= 100 ? this.colors.accent : '#64B5F6';
        context.fillRect(barX, barY, fillWidth, barHeight);
        
        return y + itemHeight + 10;
    }
    
    /**
     * 最近解除実績項目を描画
     */
    private renderRecentUnlockItem(context: CanvasRenderingContext2D, x: number, y: number, width: number, achievement: RecentUnlock): number {
        const itemHeight = 35;
        
        // アイコン
        context.fillStyle = this.colors.text;
        context.font = '16px Arial';
        context.textAlign = 'left';
        context.fillText(achievement.icon || '🏆', x, y + 20);
        
        // 実績名
        context.fillStyle = this.colors.text;
        context.font = '14px Arial';
        context.fillText(achievement.name, x + 30, y + 20);
        
        // 解除日時
        context.fillStyle = this.colors.subtext;
        context.font = '12px Arial';
        context.textAlign = 'right';
        const date = new Date(achievement.unlockedDate);
        context.fillText(date.toLocaleDateString('ja-JP'), x + width, y + 20);
        
        // AP報酬
        if (achievement.reward?.ap) {
            context.fillStyle = '#FFD700';
            context.fillText(`+${achievement.reward.ap}AP`, x + width, y + 8);
        }
        
        return y + itemHeight;
    }
    
    /**
     * 完了率円グラフを描画
     */
    private renderCompletionChart(context: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number, percentage: number): void {
        const startAngle = -Math.PI / 2; // 12時方向から開始
        const endAngle = startAngle + (percentage / 100) * 2 * Math.PI;
        
        // 背景円
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        context.fillStyle = '#333';
        context.fill();
        
        // 進捗弧
        if (percentage > 0) {
            context.beginPath();
            context.arc(centerX, centerY, radius, startAngle, endAngle);
            context.lineTo(centerX, centerY);
            context.fillStyle = percentage >= 100 ? this.colors.accent : '#64B5F6';
            context.fill();
        }
        
        // パーセンテージテキスト
        context.fillStyle = this.colors.text;
        context.font = 'bold 14px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(`${percentage.toFixed(1)}%`, centerX, centerY);
    }
    
    /**
     * キャッシュをクリア
     */
    public clearCache(): void {
        this.statsCache = null;
        this.lastCacheUpdate = 0;
    }
    
    /**
     * 統計データをエクスポート
     */
    public exportStatistics(): { exportDate: string; statistics: StatisticsData } {
        const stats = this.getStatistics();
        return {
            exportDate: new Date().toISOString(),
            statistics: stats
        };
    }
}