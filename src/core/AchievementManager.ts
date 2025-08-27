import { EventEmitter } from '../events/EventEmitter';
import { StorageManager } from '../storage/StorageManager';
import { ErrorHandler } from '../errors/ErrorHandler';
import { ConfigurationManager } from '../config/ConfigurationManager';
import { AchievementProgressTracker } from './AchievementProgressTracker';
import { AchievementUnlockEffect } from '../effects/AchievementUnlockEffect';
import { AchievementNotification } from '../ui/AchievementNotification';
import { AchievementStatsUI } from './AchievementStatsUI';
import { AchievementEventIntegrator } from './AchievementEventIntegrator';

interface AchievementReward {
    ap?: number;
    items?: Array<{ id: string; quantity: number }>;
    badges?: string[];
}

interface AchievementProgress {
    current?: number;
    target?: number;
    percentage?: number;
}

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    tier?: number;
    reward?: AchievementReward;
    unlocked: boolean;
    hidden?: boolean;
    prerequisiteIds?: string[];
    unlockedDate?: string;
    progress?: AchievementProgress;
    condition?: {
        type: string;
        target?: number;
        value?: any;
    };
}

interface AchievementCategory {
    id: string;
    name: string;
    icon: string;
    description: string;
}

interface UserAchievementData {
    unlockedAchievements: Set<string>;
    achievementProgress: Map<string, AchievementProgress>;
    totalAP: number;
    lastUnlockTime: number;
}

/**
 * 実績管理システム
 */
export class AchievementManager {
    private static instance: AchievementManager | null = null;
    private eventEmitter: EventEmitter;
    private storageManager: StorageManager;
    private errorHandler: ErrorHandler;
    private configManager: ConfigurationManager;
    private progressTracker: AchievementProgressTracker;
    private unlockEffect: AchievementUnlockEffect;
    private notification: AchievementNotification;
    private statsUI: AchievementStatsUI;
    private eventIntegrator: AchievementEventIntegrator;
    
    private achievements: Map<string, Achievement>;
    private categories: Map<string, AchievementCategory>;
    private userData: UserAchievementData;
    private initialized: boolean;
    
    constructor() {
        this.eventEmitter = new EventEmitter();
        this.storageManager = new StorageManager();
        this.errorHandler = new ErrorHandler();
        this.configManager = ConfigurationManager.getInstance();
        
        this.achievements = new Map();
        this.categories = new Map();
        this.userData = {
            unlockedAchievements: new Set(),
            achievementProgress: new Map(),
            totalAP: 0,
            lastUnlockTime: 0
        };
        
        this.initialized = false;
        
        // 関連システムの初期化は後で行う
        this.progressTracker = null!;
        this.unlockEffect = null!;
        this.notification = null!;
        this.statsUI = null!;
        this.eventIntegrator = null!;
    }
    
    /**
     * シングルトンインスタンスを取得
     */
    public static getInstance(): AchievementManager {
        if (!AchievementManager.instance) {
            AchievementManager.instance = new AchievementManager();
        }
        return AchievementManager.instance;
    }
    
    /**
     * 実績システムを初期化
     */
    public async initialize(): Promise<void> {
        try {
            console.log('Initializing achievement system...');
            
            // 実績データを読み込み
            await this.loadAchievementData();
            
            // ユーザーデータを読み込み
            await this.loadUserData();
            
            // 関連システムを初期化
            this.initializeSubsystems();
            
            // イベントリスナーを設定
            this.setupEventListeners();
            
            this.initialized = true;
            console.log('Achievement system initialized');
        } catch (error) {
            this.errorHandler.logError('Failed to initialize achievement system', error);
            throw error;
        }
    }
    
    /**
     * 関連サブシステムを初期化
     */
    private initializeSubsystems(): void {
        this.progressTracker = new AchievementProgressTracker(this);
        this.unlockEffect = new AchievementUnlockEffect();
        this.notification = new AchievementNotification();
        this.statsUI = new AchievementStatsUI(this);
        this.eventIntegrator = new AchievementEventIntegrator(this);
        
        this.progressTracker.initialize();
        this.unlockEffect.initialize();
        this.notification.initialize();
        this.eventIntegrator.initialize();
    }
    
    /**
     * 実績データを読み込み
     */
    private async loadAchievementData(): Promise<void> {
        try {
            const response = await fetch('data/achievements.json');
            const data = await response.json();
            
            // カテゴリを読み込み
            if (data.categories) {
                Object.entries(data.categories).forEach(([id, category]: [string, any]) => {
                    this.categories.set(id, {
                        id,
                        name: category.name,
                        icon: category.icon,
                        description: category.description
                    });
                });
            }
            
            // 実績を読み込み
            if (data.achievements) {
                Object.entries(data.achievements).forEach(([id, achievement]: [string, any]) => {
                    this.achievements.set(id, {
                        ...achievement,
                        id,
                        unlocked: false
                    });
                });
            }
            
            console.log(`Loaded ${this.achievements.size} achievements in ${this.categories.size} categories`);
        } catch (error) {
            console.error('Failed to load achievement data', error);
            // フォールバックデータを使用
            this.loadFallbackData();
        }
    }
    
    /**
     * フォールバック実績データを読み込み
     */
    private loadFallbackData(): void {
        // 基本カテゴリ
        const defaultCategories = {
            gameplay: { name: 'ゲームプレイ', icon: '🎮', description: 'ゲームプレイに関する実績' },
            collection: { name: 'コレクション', icon: '📦', description: 'アイテム収集に関する実績' },
            skill: { name: 'スキル', icon: '⭐', description: 'プレイスキルに関する実績' },
            special: { name: '特別', icon: '🏆', description: '特別な条件を達成した実績' }
        };
        
        Object.entries(defaultCategories).forEach(([id, category]) => {
            this.categories.set(id, { id, ...category });
        });
        
        // 基本実績
        const defaultAchievements = [
            {
                id: 'first_game',
                name: '初めての一歩',
                description: '初めてゲームをプレイする',
                icon: '🎯',
                category: 'gameplay',
                reward: { ap: 10 }
            },
            {
                id: 'score_1000',
                name: 'スコア1000',
                description: 'スコア1000点を達成する',
                icon: '💯',
                category: 'skill',
                reward: { ap: 20 },
                condition: { type: 'score', target: 1000 }
            }
        ];
        
        defaultAchievements.forEach(achievement => {
            this.achievements.set(achievement.id, {
                ...achievement,
                unlocked: false
            });
        });
    }
    
    /**
     * ユーザーデータを読み込み
     */
    private async loadUserData(): Promise<void> {
        try {
            const savedData = await this.storageManager.getItem('achievementData');
            if (savedData) {
                // 保存されたデータを復元
                this.userData = {
                    unlockedAchievements: new Set(savedData.unlockedAchievements || []),
                    achievementProgress: new Map(savedData.achievementProgress || []),
                    totalAP: savedData.totalAP || 0,
                    lastUnlockTime: savedData.lastUnlockTime || 0
                };
                
                // 実績のロック状態を更新
                this.userData.unlockedAchievements.forEach(achievementId => {
                    const achievement = this.achievements.get(achievementId);
                    if (achievement) {
                        achievement.unlocked = true;
                    }
                });
            }
        } catch (error) {
            this.errorHandler.logError('Failed to load user achievement data', error);
        }
    }
    
    /**
     * ユーザーデータを保存
     */
    private async saveUserData(): Promise<void> {
        try {
            const dataToSave = {
                unlockedAchievements: Array.from(this.userData.unlockedAchievements),
                achievementProgress: Array.from(this.userData.achievementProgress),
                totalAP: this.userData.totalAP,
                lastUnlockTime: this.userData.lastUnlockTime
            };
            
            await this.storageManager.setItem('achievementData', dataToSave);
        } catch (error) {
            this.errorHandler.logError('Failed to save user achievement data', error);
        }
    }
    
    /**
     * イベントリスナーを設定
     */
    private setupEventListeners(): void {
        // ゲームイベントを監視
        this.eventEmitter.on('game:score_update', this.handleScoreUpdate.bind(this));
        this.eventEmitter.on('game:level_complete', this.handleLevelComplete.bind(this));
        this.eventEmitter.on('game:combo_achieved', this.handleComboAchieved.bind(this));
        this.eventEmitter.on('game:item_collected', this.handleItemCollected.bind(this));
        this.eventEmitter.on('game:special_condition', this.handleSpecialCondition.bind(this));
    }
    
    /**
     * スコア更新を処理
     */
    private handleScoreUpdate(data: { score: number }): void {
        this.checkScoreAchievements(data.score);
    }
    
    /**
     * レベル完了を処理
     */
    private handleLevelComplete(data: { level: number; score: number; time: number }): void {
        this.checkLevelAchievements(data);
    }
    
    /**
     * コンボ達成を処理
     */
    private handleComboAchieved(data: { combo: number }): void {
        this.checkComboAchievements(data.combo);
    }
    
    /**
     * アイテム収集を処理
     */
    private handleItemCollected(data: { itemId: string; total: number }): void {
        this.checkCollectionAchievements(data);
    }
    
    /**
     * 特別な条件を処理
     */
    private handleSpecialCondition(data: { condition: string; value: any }): void {
        this.checkSpecialAchievements(data);
    }
    
    /**
     * スコア関連の実績をチェック
     */
    private checkScoreAchievements(score: number): void {
        this.achievements.forEach(achievement => {
            if (achievement.unlocked) return;
            
            if (achievement.condition?.type === 'score' && 
                achievement.condition.target && 
                score >= achievement.condition.target) {
                this.unlockAchievement(achievement.id);
            }
        });
    }
    
    /**
     * レベル関連の実績をチェック
     */
    private checkLevelAchievements(data: { level: number; score: number; time: number }): void {
        this.achievements.forEach(achievement => {
            if (achievement.unlocked) return;
            
            if (achievement.condition?.type === 'level') {
                // レベルクリア条件をチェック
                const condition = achievement.condition;
                if (condition.value?.level && data.level >= condition.value.level) {
                    this.unlockAchievement(achievement.id);
                }
            }
        });
    }
    
    /**
     * コンボ関連の実績をチェック
     */
    private checkComboAchievements(combo: number): void {
        this.achievements.forEach(achievement => {
            if (achievement.unlocked) return;
            
            if (achievement.condition?.type === 'combo' && 
                achievement.condition.target && 
                combo >= achievement.condition.target) {
                this.unlockAchievement(achievement.id);
            }
        });
    }
    
    /**
     * コレクション関連の実績をチェック
     */
    private checkCollectionAchievements(data: { itemId: string; total: number }): void {
        this.achievements.forEach(achievement => {
            if (achievement.unlocked) return;
            
            if (achievement.condition?.type === 'collection') {
                const condition = achievement.condition;
                if (condition.value?.itemId === data.itemId && 
                    condition.target && 
                    data.total >= condition.target) {
                    this.unlockAchievement(achievement.id);
                }
            }
        });
    }
    
    /**
     * 特別な実績をチェック
     */
    private checkSpecialAchievements(data: { condition: string; value: any }): void {
        this.achievements.forEach(achievement => {
            if (achievement.unlocked) return;
            
            if (achievement.condition?.type === 'special' && 
                achievement.condition.value?.condition === data.condition) {
                this.unlockAchievement(achievement.id);
            }
        });
    }
    
    /**
     * 実績を解除
     */
    public unlockAchievement(achievementId: string): void {
        const achievement = this.achievements.get(achievementId);
        if (!achievement || achievement.unlocked) return;
        
        // 前提条件をチェック
        if (achievement.prerequisiteIds) {
            const allPrerequisitesMet = achievement.prerequisiteIds.every(id => 
                this.userData.unlockedAchievements.has(id)
            );
            if (!allPrerequisitesMet) return;
        }
        
        // 実績を解除
        achievement.unlocked = true;
        achievement.unlockedDate = new Date().toISOString();
        this.userData.unlockedAchievements.add(achievementId);
        this.userData.lastUnlockTime = Date.now();
        
        // 報酬を付与
        if (achievement.reward) {
            this.grantReward(achievement.reward);
        }
        
        // エフェクトを再生
        if (this.unlockEffect) {
            this.unlockEffect.play(achievement);
        }
        
        // 通知を表示
        if (this.notification) {
            this.notification.show(achievement);
        }
        
        // イベントを発行
        this.eventEmitter.emit('achievement:unlocked', { achievement });
        
        // データを保存
        this.saveUserData();
        
        console.log(`Achievement unlocked: ${achievement.name}`);
    }
    
    /**
     * 報酬を付与
     */
    private grantReward(reward: AchievementReward): void {
        if (reward.ap) {
            this.userData.totalAP += reward.ap;
            this.eventEmitter.emit('achievement:ap_earned', { amount: reward.ap });
        }
        
        if (reward.items) {
            reward.items.forEach(item => {
                this.eventEmitter.emit('achievement:item_earned', { 
                    itemId: item.id, 
                    quantity: item.quantity 
                });
            });
        }
        
        if (reward.badges) {
            reward.badges.forEach(badge => {
                this.eventEmitter.emit('achievement:badge_earned', { badge });
            });
        }
    }
    
    /**
     * 実績の進捗を更新
     */
    public updateProgress(achievementId: string, current: number, target?: number): void {
        const achievement = this.achievements.get(achievementId);
        if (!achievement || achievement.unlocked) return;
        
        const progress: AchievementProgress = {
            current,
            target: target || achievement.condition?.target || 1,
            percentage: 0
        };
        
        progress.percentage = Math.min(100, (progress.current / progress.target!) * 100);
        
        achievement.progress = progress;
        this.userData.achievementProgress.set(achievementId, progress);
        
        // 進捗が100%に達したら実績を解除
        if (progress.percentage >= 100) {
            this.unlockAchievement(achievementId);
        }
        
        // イベントを発行
        this.eventEmitter.emit('achievement:progress_update', { 
            achievementId, 
            progress 
        });
        
        // データを保存
        this.saveUserData();
    }
    
    /**
     * 実績一覧を取得
     */
    public getAchievements(): Achievement[] {
        return Array.from(this.achievements.values());
    }
    
    /**
     * カテゴリ別の実績を取得
     */
    public getAchievementsByCategory(): Record<string, { name: string; achievements: Achievement[] }> {
        const categorized: Record<string, { name: string; achievements: Achievement[] }> = {};
        
        this.categories.forEach((category, categoryId) => {
            categorized[categoryId] = {
                name: category.name,
                achievements: []
            };
        });
        
        this.achievements.forEach(achievement => {
            if (categorized[achievement.category]) {
                categorized[achievement.category].achievements.push(achievement);
            }
        });
        
        return categorized;
    }
    
    /**
     * 解除済み実績を取得
     */
    public getUnlockedAchievements(): Achievement[] {
        return Array.from(this.achievements.values()).filter(a => a.unlocked);
    }
    
    /**
     * 未解除実績を取得
     */
    public getLockedAchievements(): Achievement[] {
        return Array.from(this.achievements.values()).filter(a => !a.unlocked);
    }
    
    /**
     * 実績の進捗を取得
     */
    public getAchievementProgress(achievementId: string): AchievementProgress | null {
        const achievement = this.achievements.get(achievementId);
        return achievement?.progress || null;
    }
    
    /**
     * 総APを取得
     */
    public getTotalAP(): number {
        return this.userData.totalAP;
    }
    
    /**
     * 実績完了率を取得
     */
    public getCompletionRate(): number {
        const total = this.achievements.size;
        const unlocked = this.userData.unlockedAchievements.size;
        return total > 0 ? (unlocked / total) * 100 : 0;
    }
    
    /**
     * 総報酬を計算
     */
    public calculateTotalRewards(): { ap: number } {
        let totalAP = 0;
        
        this.userData.unlockedAchievements.forEach(achievementId => {
            const achievement = this.achievements.get(achievementId);
            if (achievement?.reward?.ap) {
                totalAP += achievement.reward.ap;
            }
        });
        
        return { ap: totalAP };
    }
    
    /**
     * 統計UIを取得
     */
    public getStatsUI(): AchievementStatsUI {
        return this.statsUI;
    }
    
    /**
     * デバッグ情報を出力
     */
    public debugInfo(): void {
        console.log('=== Achievement System Debug Info ===');
        console.log(`Total achievements: ${this.achievements.size}`);
        console.log(`Unlocked: ${this.userData.unlockedAchievements.size}`);
        console.log(`Total AP: ${this.userData.totalAP}`);
        console.log(`Completion rate: ${this.getCompletionRate().toFixed(1)}%`);
        console.log(`Categories: ${Array.from(this.categories.keys()).join(', ')}`);
    }
    
    /**
     * クリーンアップ
     */
    public cleanup(): void {
        // イベントリスナーを削除
        this.eventEmitter.removeAllListeners();
        
        // サブシステムをクリーンアップ
        if (this.progressTracker) this.progressTracker.cleanup();
        if (this.unlockEffect) this.unlockEffect.cleanup();
        if (this.notification) this.notification.cleanup();
        if (this.eventIntegrator) this.eventIntegrator.cleanup();
        
        // データを保存
        this.saveUserData();
        
        console.log('Achievement system cleaned up');
    }
}