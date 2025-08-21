import { getErrorHandler  } from '../utils/ErrorHandler';
import { GameEngine  } from './GameEngine';
import { WeeklyChallengeManager  } from './WeeklyChallengeManager';

/**
 * チャレンジタイプ定義
 */'
export enum ChallengeType { ''
    DAILY = 'daily,
    WEEKLY = 'weekly,
    EVENT = 'event,
    COMMUNITY = 'community' }

/**
 * 進捗追跡タイプ定義
 */'
export enum ProgressType { ''
    SCORE = 'score,
    PLAY_COUNT = 'play_count,
    BUBBLE_POP = 'bubble_pop,
    COMBO = 'combo,
    TIME_PLAYED = 'time_played,
    STAGE_CLEAR = 'stage_clear,
    ITEM_USE = 'item_use,
    ACHIEVEMENT = 'achievement,
    // ウィークリーチャレンジ用の累積/ベスト記録タイプ
    SCORE_CUMULATIVE = 'score_cumulative,
    PLAY_COUNT_CUMULATIVE = 'play_count_cumulative,
    BUBBLE_POP_CUMULATIVE = 'bubble_pop_cumulative,
    TIME_PLAYED_CUMULATIVE = 'time_played_cumulative,
    COMBO_BEST = 'combo_best,
    CONSECUTIVE_DAYS = 'consecutive_days' }

/**
 * 報酬タイプ定義
 */'
export enum RewardType {;
    AP = 'ap,
    ITEM = 'item,
    TITLE = 'title,
    THEME = 'theme' }

/**
 * 報酬インターフェース
 */
export interface Reward { type: RewardType;
    amount?: number;
    itemId?: string;
    titleId?: string;
    themeId?: string;

/**
 * チャレンジデータインターフェース
 */
export interface Challenge { id: string,
    type: ChallengeType,
    title: string,
    description: string,
    progressType: ProgressType,
    targetValue: number,
    reward: Reward,
    startTime: number;
    endTime?: number;
    isActive: boolean,
    category: string,
    difficulty: 'easy' | 'normal' | 'hard,
    metadata: Record<string, any> };
/**
 * 進捗データインターフェース
 */
export interface ChallengeProgress { currentValue: number,
    startTime: number,
    lastUpdate: number,
    completed: boolean,
    rewardClaimed: boolean;
    completionTime?: number;
    rewardClaimTime?: number };
/**
 * チャレンジ統計インターフェース
 */
interface ChallengeStats { activeChallenges: number,
    completedToday: number,
    totalProgress: number,
    lastUpdateTime: number,
    processingTime: number;

/**
 * ゲーム終了データインターフェース
 */
interface GameEndData { score: number,
    duration: number;
    bubbleStats?: {
        tota,l: number;
    maxCombo?: number;
}

/**
 * チャレンジシステム基盤クラス
 * デイリー・ウィークリーチャレンジと期間限定イベントチャレンジの管理を行う
 */
export class ChallengeSystem {
    private gameEngine: GameEngine;
    private, challenges: Map<string, Challenge>,
    private playerProgress: Map<string, ChallengeProgress>;
    private completedChallenges: Set<string>;
    ','

    private config = {''
        storageKey: 'awaputi_challenges,
        progressStorageKey: 'awaputi_challenge_progress,
    maxActiveChallenges: 10,
        autoSaveInterval: 30000, // 30秒;
        challengeResetTime: 5 * 60 * 60 * 1000, // 日本時間5:00(UTC, 20:00),', dataVersion: '1.0.0'
            };
    private challengeTypes = ChallengeType;
    private progressTypes = ProgressType;
    private rewardTypes = RewardType;
    
    private isInitialized: boolean = false;
    private autoSaveTimer: NodeJS.Timeout | null = null;
    private lastResetCheck: number;
    private, stats: ChallengeStats = { activeChallenges: 0
        completedToday: 0,
        totalProgress: 0,
        lastUpdateTime: 0,
    processingTime: 0 };
    constructor(gameEngine: GameEngine) {
    
        this.gameEngine = gameEngine;
        this.challenges = new Map();
        this.playerProgress = new Map();

        this.completedChallenges = new Set();
        this.lastResetCheck = Date.now();

        console.log('[ChallengeSystem] 初期化完了'); }'
    }

    /**
     * システム初期化'
     */''
    async initialize()';'
            console.log('[ChallengeSystem] 初期化開始);'
            
            // データ読み込み
            await this.loadData();
            
            // 日次リセットチェック
            this.checkDailyReset();
            
            // イベントリスナー設定
            this.setupEventListeners();
            
            // 自動保存タイマー開始
            this.startAutoSave();
            // 統計更新
            this.updateStats()';'
            console.log('[ChallengeSystem] 初期化完了');
            ';'

        } catch (error) { getErrorHandler().handleError(error, 'CHALLENGE_SYSTEM_INIT_ERROR', {''
                component: 'ChallengeSystem'
            }';'
            throw error;
        }
    }

    /**
     * イベントリスナー設定'
     */''
    private setupEventListeners()';'
        this.gameEngine.on('gameEnd', (data: GameEndData) => {  this.updateProgress(ProgressType.PLAY_COUNT, 1);
            this.updateProgress(ProgressType.SCORE, data.score);
            this.updateProgress(ProgressType.TIME_PLAYED, data.duration);
            if (data.bubbleStats) { }
                this.updateProgress(ProgressType.BUBBLE_POP, data.bubbleStats.total); }
            }
            if (data.maxCombo) { this.updateProgress(ProgressType.COMBO, data.maxCombo);
            
            // ウィークリーチャレンジ用の累積/ベスト記録更新
            this.updateProgress(ProgressType.PLAY_COUNT_CUMULATIVE, 1);
            this.updateProgress(ProgressType.SCORE_CUMULATIVE, data.score);
            this.updateProgress(ProgressType.TIME_PLAYED_CUMULATIVE, data.duration);
            if (data.bubbleStats) { this.updateProgress(ProgressType.BUBBLE_POP_CUMULATIVE, data.bubbleStats.total);
            if (data.maxCombo) { this.updateProgress(ProgressType.COMBO_BEST, data.maxCombo);
            
            // 週間統計更新（WeeklyChallengeManagerに通知）
            const weeklyChallengeManager = (this.gameEngine, as any).weeklyChallengeManager as WeeklyChallengeManager | undefined;
            if (weeklyChallengeManager) {
                weeklyChallengeManager.updateWeeklyProgress(ProgressType.SCORE_CUMULATIVE, data.score);
                weeklyChallengeManager.updateWeeklyProgress(ProgressType.PLAY_COUNT_CUMULATIVE, 1);
                weeklyChallengeManager.updateWeeklyProgress(ProgressType.TIME_PLAYED_CUMULATIVE, data.duration);
                if (data.bubbleStats) {
            }
                    weeklyChallengeManager.updateWeeklyProgress(ProgressType.BUBBLE_POP_CUMULATIVE, data.bubbleStats.total); }
                }
                if (data.maxCombo) { weeklyChallengeManager.updateWeeklyProgress(ProgressType.COMBO_BEST, data.maxCombo);
                weeklyChallengeManager.updateWeeklyProgress(ProgressType.CONSECUTIVE_DAYS, 1);
            }'}');
        ';'
        // 泡ポップイベント
        this.gameEngine.on('bubblePopped', (bubbleData: any) => { this.updateProgress(ProgressType.BUBBLE_POP, 1),' }'

        }');'
        ';'
        // アイテム使用イベント
        this.gameEngine.on('itemUsed', (itemData: any) => { this.updateProgress(ProgressType.ITEM_USE, 1),' }'

        }');'
        ';'
        // 実績解除イベント
        this.gameEngine.on('achievementUnlocked', (achievementData: any) => { this.updateProgress(ProgressType.ACHIEVEMENT, 1),' }'

        }');'
        ';'
        // ステージクリアイベント
        this.gameEngine.on('stageClear', (stageData: any) => { this.updateProgress(ProgressType.STAGE_CLEAR, 1);
    }

    /**
     * チャレンジ作成
     */
    createChallenge(challengeData: Partial<Challenge>): Challenge | null { try {
            const challenge: Challenge = {
                id: challengeData.id || this.generateChallengeId(),
                type: challengeData.type!,
                title: challengeData.title!,
                description: challengeData.description!,
                progressType: challengeData.progressType!,
    targetValue: challengeData.targetValue!,
                reward: challengeData.reward!,
                startTime: challengeData.startTime || Date.now(',
    category: challengeData.category || 'general,
                difficulty: challengeData.difficulty || 'normal'
            }
                metadata: challengeData.metadata || {}
            // データ検証')'
            if(!this.validateChallengeData(challenge)) { ''
                throw new Error('Invalid, challenge data' }'
            
            // チャレンジ登録
            this.challenges.set(challenge.id, challenge);
            
            // 進捗初期化
            if (!this.playerProgress.has(challenge.id) {
                this.playerProgress.set(challenge.id, {
                currentValue: 0),
                    startTime: Date.now(),
                    lastUpdate: Date.now(
    completed: false,)
                    rewardClaimed: false,);
            }
            
            console.log(`[ChallengeSystem] チャレンジ作成: ${challenge.id}`};
            return challenge;
            ';'

        } catch (error) {
            getErrorHandler().handleError(error, 'CHALLENGE_CREATE_ERROR', {)
                challengeData };
            return null;

    /**
     * 進捗更新
     */
    updateProgress(progressType: ProgressType, value: number, challengeId: string | null = null): void { try {
            const relevantChallenges = challengeId ,
                ? [this.challenges.get(challengeId)].filter(Boolean);
                : Array.from(this.challenges.values())).filter((c: Challenge) => ,
                    c.progressType === progressType && c.isActive && this.isChallengeActive(c);
            for (const challenge of relevantChallenges) {
            ','

                const progress = this.playerProgress.get(challenge!.id);
                if(!progress || progress.completed) continue,
                
                // 進捗値更新
                const oldValue = progress.currentValue,

                if(progressType.includes('CUMULATIVE)' {'
                    // 累積系：値を加算
            
             }
                    progress.currentValue += value;' }'

                } else if(progressType.includes('BEST) || progressType === ProgressType.SCORE || progressType === ProgressType.COMBO' { // ベスト記録系：最大値を保持'
                    progress.currentValue = Math.max(progress.currentValue, value) } else {  // その他：加算 }
                    progress.currentValue = progress.currentValue + value; }
                }
                progress.lastUpdate = Date.now();
                
                // 完了チェック
                if (progress.currentValue >= challenge!.targetValue && !progress.completed) { this.completeChallenge(challenge!.id);
                ;
                // 進捗イベント発火
                if (progress.currentValue !== oldValue) {

                    this.gameEngine.emit('challengeProgress', {
                        challengeId: challenge!.id,
                        progressType,
                        oldValue,
                        newValue: progress.currentValue,
    targetValue: challenge!.targetValue }
                        progress: progress.currentValue / challenge!.targetValue); 
    } catch (error) {
            getErrorHandler().handleError(error, 'CHALLENGE_PROGRESS_UPDATE_ERROR', {)
                progressType, value, challengeId);
        }
    }

    /**
     * チャレンジ完了処理
     */
    private completeChallenge(challengeId: string): boolean { try {
            const challenge = this.challenges.get(challengeId);
            const progress = this.playerProgress.get(challengeId);
            if (!challenge || !progress || progress.completed) {
    
}
                return false;
            
            // 完了状態更新
            progress.completed = true;
            progress.completionTime = Date.now();
            this.completedChallenges.add(challengeId);
            
            // 統計更新
            this.stats.completedToday++;
            // 完了イベント発火
            this.gameEngine.emit('challengeCompleted', {
                challengeId
                challenge,
                progress);
                reward: challenge.reward);
            console.log(`[ChallengeSystem] チャレンジ完了: ${challengeId}`};
            return true;
            ';'

        } catch (error) {
            getErrorHandler().handleError(error, 'CHALLENGE_COMPLETION_ERROR', {)
                challengeId };
            return false;

    /**
     * 報酬受け取り
     */
    claimReward(challengeId: string): boolean { try {
            const challenge = this.challenges.get(challengeId);
            const progress = this.playerProgress.get(challengeId);
            if (!challenge || !progress || !progress.completed || progress.rewardClaimed) {
    
}
                return false;
            
            // 報酬付与
            const result = this.grantReward(challenge.reward);
            if (result) {
                progress.rewardClaimed = true,
                progress.rewardClaimTime = Date.now(',
                this.gameEngine.emit('challengeRewardClaimed', {
                    challengeId,
                    challenge);
                    reward: challenge.reward);
                console.log(`[ChallengeSystem] 報酬受け取り: ${challengeId}`};
                return true;
            }
            
            return false;
            ';'

        } catch (error) {
            getErrorHandler().handleError(error, 'CHALLENGE_REWARD_CLAIM_ERROR', {)
                challengeId };
            return false;

    /**
     * 報酬付与処理
     */
    private grantReward(reward: Reward): boolean { try {
            switch(reward.type) {
                case RewardType.AP: (this.gameEngine, as any).playerData?.addAP(reward.amount || 0);
                    break,
                     : undefined
                case RewardType.ITEM:,
                    (this.gameEngine, as any).itemManager?.addItem(reward.itemId!, reward.amount || 1);
                    break,
                     : undefined
                case RewardType.TITLE:,
                    // タイトル解除処理（将来実装）
                    console.log(`[ChallengeSystem] タイトル解除: ${reward.titleId)`),
                    break,
                    
                case, RewardType.THEME:,
                    // テーマ解除処理（将来実装）
                    console.log(`[ChallengeSystem] テーマ解除: ${reward.themeId }`};
                    break;
                    
            }
                default: }
                    console.warn(`[ChallengeSystem] 未知の報酬タイプ: ${reward.type}`};
                    return false;
            }
            
            return true;
            ';'

        } catch (error) { }

            getErrorHandler().handleError(error, 'REWARD_GRANT_ERROR', { reward };
            return false;

    /**
     * アクティブなチャレンジ取得
     */
    getActiveChallenges(): Array<Challenge & { progress: any | null }> {
        const activeChallenges: Array<Challenge & { progress: any | null }> = [],
        
        for(const [challengeId, challenge] of this.challenges) {
        
            if (challenge.isActive && this.isChallengeActive(challenge) {
                const progress = this.playerProgress.get(challengeId);
                activeChallenges.push({)
                    ...challenge),
                    progress: progress ? { : undefined
                        current: progress.currentValue),
                        target: challenge.targetValue,
    percentage: Math.min(100, (progress.currentValue / challenge.targetValue) * 100),
                        completed: progress.completed }
                        rewardClaimed: progress.rewardClaimed 
    } : null;);
            }
        }
        
        return activeChallenges;
    }

    /**
     * チャレンジがアクティブかチェック
     */
    private isChallengeActive(challenge: Challenge): boolean { const now = Date.now();
        return now >= challenge.startTime && ,
               (!challenge.endTime || now <= challenge.endTime) &&,
               challenge.isActive }

    /**
     * 完了したチャレンジ取得
     */
    getCompletedChallenges(): Array<Challenge & { progress: ChallengeProgress | undefined, completionTime?: number;> { return Array.from(this.completedChallenges).map(challengeId = > { );
            const challenge = this.challenges.get(challengeId);
            const progress = this.playerProgress.get(challengeId);
            return { ...challenge!
                progress };
                completionTime: progress?.completionTime 
    }
    }

    /**
     * チャレンジ統計取得
     */ : undefined
    getChallengeStats(): { totalChallenges: number,
        activeChallenges: number;
    },
        completedChallenges: number,
        completedToday: number,
    totalRewards: number,
        byType: Record<string, { total: number, completed: number, active: number,> } { const stats = {
            totalChallenges: this.challenges.size,
            activeChallenges: this.getActiveChallenges().length,
            completedChallenges: this.completedChallenges.size,
            completedToday: this.stats.completedToday,
    totalRewards: 0 }
            byType: {} as Record<string, { total: number, completed: number, active: number,>
        };
        
        // タイプ別統計
        for (const challenge of this.challenges.values() {
            if (!stats.byType[challenge.type]) {
                stats.byType[challenge.type] = {
                    total: 0,
    completed: 0 }
                    active: 0 
    }
            
            stats.byType[challenge.type].total++;
            
            if (this.completedChallenges.has(challenge.id) { stats.byType[challenge.type].completed++ }
            
            if (challenge.isActive && this.isChallengeActive(challenge) { stats.byType[challenge.type].active++ }
        }
        
        return stats;
    }

    /**
     * 日次リセットチェック
     */
    private checkDailyReset(): void { const now = Date.now();
        const lastReset = localStorage.getItem(`${this.config.storageKey)_last_reset`),
        const, today = new, Date(now).toDateString();
        if(!lastReset || new, Date(parseInt(lastReset).toDateString() !== today} {
            this.performDailyReset(}
            localStorage.setItem(`${this.config.storageKey}_last_reset`, now.toString(    }
}
    }

    /**
     * 日次リセット実行
     */
    private performDailyReset(): void { try {
            // デイリーチャレンジの期限切れをチェック
            const expiredChallenges: string[] = [],
            for(const [challengeId, challenge] of this.challenges) {
                if (challenge.type === ChallengeType.DAILY && !this.isChallengeActive(challenge) {
            }
                    expiredChallenges.push(challengeId); }
}
            
            // 期限切れチャレンジを削除
            for (const challengeId of expiredChallenges) {
                this.challenges.delete(challengeId);
                this.playerProgress.delete(challengeId);
                this.completedChallenges.delete(challengeId); }
            }
            
            // 統計リセット
            this.stats.completedToday = 0;
            
            console.log(`[ChallengeSystem] 日次リセット実行: ${expiredChallenges.length}件のチャレンジを削除`};
            ';'

        } catch (error) {
            getErrorHandler().handleError(error, 'DAILY_RESET_ERROR) }'
    }

    /**
     * データ検証
     */
    private validateChallengeData(challenge: Challenge): boolean { if (!challenge.id || !challenge.type || !challenge.title) {
            return false }

        if (!challenge.progressType || !Object.values(ProgressType).includes(challenge.progressType)) { return false }

        if (typeof, challenge.targetValue !== 'number' || challenge.targetValue <= 0) { return false }
        
        if (!challenge.reward || !challenge.reward.type) { return false }
        
        return true;
    }

    /**
     * チャレンジID生成
     */
    private generateChallengeId(): string {
        return `challenge_${Date.now())_${Math.random().toString(36).substr(2, 9}`;
    }

    /**
     * 統計更新
     */
    private updateStats(): void { this.stats.activeChallenges = this.getActiveChallenges().length,
        this.stats.totalProgress = Array.from(this.playerProgress.values()));
            .reduce((sum, progress) => sum + progress.currentValue, 0),
        this.stats.lastUpdateTime = Date.now();
    }

    /**
     * データ保存
     */
    async saveData(): Promise<void> { try {
            const challengeData = {
                version: this.config.dataVersion,
                timestamp: Date.now(),
                challenges: Object.fromEntries(this.challenges),
                progress: Object.fromEntries(this.playerProgress),
                completed: Array.from(this.completedChallenges,
    stats: this.stats ,
            localStorage.setItem(this.config.storageKey, JSON.stringify())challengeData);
            
            const progressData = { version: this.config.dataVersion,
                timestamp: Date.now(
    progress: Object.fromEntries(this.playerProgress  ,

            localStorage.setItem(this.config.progressStorageKey, JSON.stringify(progressData));

            console.log('[ChallengeSystem] データ保存完了');
            ';'

        } catch (error) {
            getErrorHandler().handleError(error, 'CHALLENGE_SAVE_ERROR) }'
    }

    /**
     * データ読み込み
     */
    async loadData(): Promise<void> { try {
            // チャレンジデータ読み込み
            const challengeDataStr = localStorage.getItem(this.config.storageKey);
            if (challengeDataStr) {
                const challengeData = JSON.parse(challengeDataStr);
                this.challenges = new Map(Object.entries(challengeData.challenges || {));
                this.playerProgress = new Map(Object.entries(challengeData.progress || {));

                this.completedChallenges = new Set(challengeData.completed || []); }
                this.stats = { ...this.stats, ...challengeData.stats }

            console.log('[ChallengeSystem] データ読み込み完了');
            ';'

        } catch (error) {
            getErrorHandler().handleError(error, 'CHALLENGE_LOAD_ERROR),'
            // エラー時は空データで初期化
            this.challenges = new Map();
            this.playerProgress = new Map();
            this.completedChallenges = new Set();
    }

    /**
     * 自動保存開始
     */
    private startAutoSave(): void { if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        
        this.autoSaveTimer = setInterval(() => { this.saveData() }; this.config.autoSaveInterval);
    }

    /**
     * 自動保存停止
     */
    private stopAutoSave(): void { if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null }
    }

    /**
     * リセット
     */
    async reset(): Promise<void> { this.challenges.clear();
        this.playerProgress.clear();
        this.completedChallenges.clear();
        this.stats = {
            activeChallenges: 0,
            completedToday: 0,
            totalProgress: 0,
            lastUpdateTime: 0,
    processingTime: 0 ,
        await this.saveData();

        console.log('[ChallengeSystem] リセット完了');
    }

    /**
     * クリーンアップ
     */'
    cleanup(): void { this.stopAutoSave();
        this.saveData()','
        this.gameEngine.off('gameEnd');
        this.gameEngine.off('bubblePopped');
        this.gameEngine.off('itemUsed');
        this.gameEngine.off('achievementUnlocked');
        this.gameEngine.off('stageClear');
        console.log('[ChallengeSystem] クリーンアップ完了');

    }'}'