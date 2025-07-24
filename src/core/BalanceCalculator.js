/**
 * ゲームバランス計算の専門クラス
 * 
 * 難易度調整、アイテムコスト、開放条件計算を統一的に管理します。
 * 既存のBalanceHelperからバランス計算ロジックを移行しています。
 */
export class BalanceCalculator {
    constructor(gameConfig = null) {
        this.gameConfig = gameConfig;
        
        // デフォルトのバランス設定（GameConfigが利用できない場合のフォールバック）
        this.defaultBalanceConfig = {
            stages: {
                unlockRequirements: {
                    hard: 500,
                    veryHard: 2000,
                    special: 5000,
                    nightmare: 12000,
                    chaos: 25000,
                    ultimate: 50000,
                    allIn: 100000,
                    boss: 35000
                },
                difficulty: {
                    tutorial: { spawnRate: 1.0, maxBubbles: 10 },
                    normal: { spawnRate: 1.5, maxBubbles: 20 },
                    hard: { spawnRate: 1.6, maxBubbles: 22 },
                    veryHard: { spawnRate: 1.8, maxBubbles: 28 },
                    special: { spawnRate: 2.0, maxBubbles: 32 },
                    nightmare: { spawnRate: 2.3, maxBubbles: 38 },
                    chaos: { spawnRate: 2.7, maxBubbles: 42 },
                    ultimate: { spawnRate: 3.2, maxBubbles: 48 },
                    allIn: { spawnRate: 3.6, maxBubbles: 55 },
                    boss: { spawnRate: 1.8, maxBubbles: 28 }
                }
            },
            items: {
                baseCosts: {
                    scoreMultiplier: 75,
                    revival: 150,
                    rareRate: 100,
                    hpBoost: 60,
                    timeExtension: 90,
                    comboBoost: 80,
                    reset: 30
                },
                costMultiplier: 1.3,
                effects: {
                    scoreMultiplier: 1.3,
                    rareRate: 1.3,
                    hpBoost: 25,
                    timeExtension: 45000,
                    comboBoost: 1.5
                },
                maxLevels: {
                    scoreMultiplier: 5,
                    revival: 2,
                    rareRate: 4,
                    hpBoost: 6,
                    timeExtension: 4,
                    comboBoost: 3,
                    reset: 1
                }
            },
            bubbles: {
                maxAge: {
                    normal: 12000,
                    stone: 16000,
                    iron: 20000,
                    diamond: 22000,
                    pink: 10000,
                    poison: 14000,
                    spiky: 13000,
                    rainbow: 16000,
                    clock: 20000,
                    score: 9000,
                    electric: 13000,
                    escaping: 16000,
                    cracked: 6000,
                    boss: 35000
                },
                health: {
                    normal: 1,
                    stone: 2,
                    iron: 3,
                    diamond: 4,
                    boss: 8
                }
            }
        };
        
        console.log('BalanceCalculator initialized');
    }
    
    /**
     * バランス設定を取得
     * @returns {Object} バランス設定
     */
    getBalanceConfig() {
        if (this.gameConfig && typeof this.gameConfig.getBalanceConfig === 'function') {
            return this.gameConfig.getBalanceConfig();
        }
        return this.defaultBalanceConfig;
    }
    
    /**
     * 難易度調整を計算
     * @param {string} stageId - ステージID
     * @param {number} playerLevel - プレイヤーレベル（省略可）
     * @returns {Object} 難易度設定
     */
    calculateDifficulty(stageId, playerLevel = 1) {
        const config = this.getBalanceConfig();
        const baseDifficulty = config.stages.difficulty[stageId];
        
        if (!baseDifficulty) {
            console.warn(`Unknown stage: ${stageId}. Using normal difficulty.`);
            return config.stages.difficulty.normal;
        }
        
        // プレイヤーレベルに基づく調整
        const levelAdjustment = this.calculateLevelAdjustment(playerLevel);
        
        return {
            spawnRate: baseDifficulty.spawnRate * levelAdjustment.spawnRateMultiplier,
            maxBubbles: Math.floor(baseDifficulty.maxBubbles * levelAdjustment.maxBubblesMultiplier),
            originalSpawnRate: baseDifficulty.spawnRate,
            originalMaxBubbles: baseDifficulty.maxBubbles,
            levelAdjustment
        };
    }
    
    /**
     * プレイヤーレベルに基づく調整値を計算
     * @param {number} playerLevel - プレイヤーレベル
     * @returns {Object} レベル調整値
     */
    calculateLevelAdjustment(playerLevel) {
        // レベル1を基準とした調整
        const levelFactor = Math.max(1, playerLevel);
        
        // レベルが高いほど少し難易度を下げる（経験者向け調整）
        const spawnRateMultiplier = Math.max(0.8, 1 - (levelFactor - 1) * 0.02);
        const maxBubblesMultiplier = Math.max(0.9, 1 - (levelFactor - 1) * 0.01);
        
        return {
            spawnRateMultiplier,
            maxBubblesMultiplier,
            playerLevel: levelFactor
        };
    }
    
    /**
     * アイテムコストを計算
     * @param {string} itemId - アイテムID
     * @param {number} currentLevel - 現在のレベル
     * @returns {number} アイテムコスト
     */
    calculateItemCost(itemId, currentLevel = 0) {
        const config = this.getBalanceConfig();
        const baseCost = config.items.baseCosts[itemId];
        
        if (baseCost === undefined) {
            console.warn(`Unknown item: ${itemId}. Using default cost.`);
            return 100;
        }
        
        const multiplier = config.items.costMultiplier;
        return Math.floor(baseCost * Math.pow(multiplier, currentLevel));
    }
    
    /**
     * アイテムの最大レベルを取得
     * @param {string} itemId - アイテムID
     * @returns {number} 最大レベル
     */
    getItemMaxLevel(itemId) {
        const config = this.getBalanceConfig();
        return config.items.maxLevels[itemId] || 1;
    }
    
    /**
     * アイテム効果値を計算
     * @param {string} itemId - アイテムID
     * @param {number} level - アイテムレベル
     * @returns {number} 効果値
     */
    calculateItemEffect(itemId, level = 1) {
        const config = this.getBalanceConfig();
        const baseEffect = config.items.effects[itemId];
        
        if (baseEffect === undefined) {
            console.warn(`Unknown item effect: ${itemId}. Using default effect.`);
            return 1;
        }
        
        // アイテムタイプに応じた計算
        switch (itemId) {
            case 'scoreMultiplier':
            case 'rareRate':
            case 'comboBoost':
                // 倍率系：レベルごとに効果が累積
                return 1 + (baseEffect - 1) * level;
                
            case 'hpBoost':
                // HP系：レベルごとに加算
                return baseEffect * level;
                
            case 'timeExtension':
                // 時間系：固定値
                return baseEffect;
                
            default:
                return baseEffect;
        }
    }
    
    /**
     * ステージ開放条件をチェック
     * @param {string} stageId - ステージID
     * @param {number} playerTAP - プレイヤーのTAP値
     * @returns {boolean} 開放されている場合 true
     */
    isStageUnlocked(stageId, playerTAP) {
        const config = this.getBalanceConfig();
        const requirement = config.stages.unlockRequirements[stageId];
        
        // 要件が設定されていない場合は開放済み
        if (requirement === undefined) {
            return true;
        }
        
        return playerTAP >= requirement;
    }
    
    /**
     * ステージ開放に必要なTAP値を取得
     * @param {string} stageId - ステージID
     * @returns {number} 必要TAP値（開放済みの場合は0）
     */
    getStageUnlockRequirement(stageId) {
        const config = this.getBalanceConfig();
        return config.stages.unlockRequirements[stageId] || 0;
    }
    
    /**
     * 泡の生存時間を計算
     * @param {string} bubbleType - 泡タイプ
     * @param {Object} modifiers - 修正値（省略可）
     * @returns {number} 生存時間（ミリ秒）
     */
    calculateBubbleLifetime(bubbleType, modifiers = {}) {
        const config = this.getBalanceConfig();
        const baseLifetime = config.bubbles.maxAge[bubbleType];
        
        if (baseLifetime === undefined) {
            console.warn(`Unknown bubble type: ${bubbleType}. Using default lifetime.`);
            return config.bubbles.maxAge.normal;
        }
        
        let lifetime = baseLifetime;
        
        // 修正値を適用
        if (modifiers.timeMultiplier) {
            lifetime *= modifiers.timeMultiplier;
        }
        
        if (modifiers.timeBonus) {
            lifetime += modifiers.timeBonus;
        }
        
        return Math.floor(lifetime);
    }
    
    /**
     * 泡の耐久値を計算
     * @param {string} bubbleType - 泡タイプ
     * @param {Object} modifiers - 修正値（省略可）
     * @returns {number} 耐久値
     */
    calculateBubbleHealth(bubbleType, modifiers = {}) {
        const config = this.getBalanceConfig();
        const baseHealth = config.bubbles.health[bubbleType];
        
        if (baseHealth === undefined) {
            return config.bubbles.health.normal || 1;
        }
        
        let health = baseHealth;
        
        // 修正値を適用
        if (modifiers.healthMultiplier) {
            health *= modifiers.healthMultiplier;
        }
        
        if (modifiers.healthBonus) {
            health += modifiers.healthBonus;
        }
        
        return Math.max(1, Math.floor(health));
    }
    
    /**
     * 推奨アイテム購入順序を計算
     * @param {Object} playerState - プレイヤー状態
     * @returns {Array} 推奨アイテムリスト
     */
    calculateRecommendedItemOrder(playerState) {
        const {
            currentTAP = 0,
            currentItems = {},
            playStyle = 'balanced' // 'aggressive', 'defensive', 'balanced'
        } = playerState;
        
        const recommendations = [];
        const config = this.getBalanceConfig();
        
        // プレイスタイルに基づく優先度
        const priorities = {
            aggressive: ['scoreMultiplier', 'comboBoost', 'rareRate', 'timeExtension', 'hpBoost', 'revival'],
            defensive: ['hpBoost', 'revival', 'timeExtension', 'scoreMultiplier', 'rareRate', 'comboBoost'],
            balanced: ['scoreMultiplier', 'hpBoost', 'rareRate', 'comboBoost', 'timeExtension', 'revival']
        };
        
        const itemOrder = priorities[playStyle] || priorities.balanced;
        
        for (const itemId of itemOrder) {
            const currentLevel = currentItems[itemId] || 0;
            const maxLevel = this.getItemMaxLevel(itemId);
            const cost = this.calculateItemCost(itemId, currentLevel);
            
            if (currentLevel < maxLevel && currentTAP >= cost) {
                recommendations.push({
                    itemId,
                    currentLevel,
                    nextLevel: currentLevel + 1,
                    cost,
                    effect: this.calculateItemEffect(itemId, currentLevel + 1),
                    priority: itemOrder.indexOf(itemId) + 1
                });
            }
        }
        
        return recommendations;
    }
    
    /**
     * ゲーム進行度を計算
     * @param {Object} playerState - プレイヤー状態
     * @returns {Object} 進行度情報
     */
    calculateGameProgress(playerState) {
        const {
            currentTAP = 0,
            unlockedStages = [],
            completedAchievements = []
        } = playerState;
        
        const config = this.getBalanceConfig();
        const allStages = Object.keys(config.stages.unlockRequirements);
        const totalStages = allStages.length;
        const unlockedCount = unlockedStages.length;
        
        // TAP進行度
        const maxTAP = Math.max(...Object.values(config.stages.unlockRequirements));
        const tapProgress = Math.min(100, (currentTAP / maxTAP) * 100);
        
        // ステージ進行度
        const stageProgress = (unlockedCount / totalStages) * 100;
        
        // 次の目標ステージ（TAP要件順でソートして最初の未開放ステージ）
        const sortedStages = allStages
            .map(stageId => ({
                stageId,
                requirement: this.getStageUnlockRequirement(stageId)
            }))
            .sort((a, b) => a.requirement - b.requirement);
            
        const nextStageInfo = sortedStages.find(stage => 
            !unlockedStages.includes(stage.stageId) && 
            stage.requirement > currentTAP
        );
        
        const nextStage = nextStageInfo ? nextStageInfo.stageId : null;
        
        return {
            tapProgress: Math.floor(tapProgress),
            stageProgress: Math.floor(stageProgress),
            unlockedStages: unlockedCount,
            totalStages,
            nextStage,
            nextStageRequirement: nextStage ? this.getStageUnlockRequirement(nextStage) : null,
            tapToNextStage: nextStage ? this.getStageUnlockRequirement(nextStage) - currentTAP : 0
        };
    }
    
    /**
     * バランス調整の提案を生成
     * @param {Object} gameData - ゲームデータ
     * @returns {Object} バランス調整提案
     */
    suggestBalanceAdjustments(gameData) {
        const {
            averagePlayTime = 0,
            averageScore = 0,
            stageCompletionRates = {},
            itemUsageRates = {}
        } = gameData;
        
        const suggestions = {
            difficulty: [],
            items: [],
            stages: []
        };
        
        // 平均プレイ時間が短すぎる場合
        if (averagePlayTime < 60000) { // 1分未満
            suggestions.difficulty.push({
                type: 'reduce_spawn_rate',
                reason: '平均プレイ時間が短すぎます',
                adjustment: 0.9
            });
        }
        
        // 平均プレイ時間が長すぎる場合
        if (averagePlayTime > 300000) { // 5分以上
            suggestions.difficulty.push({
                type: 'increase_spawn_rate',
                reason: '平均プレイ時間が長すぎます',
                adjustment: 1.1
            });
        }
        
        // ステージクリア率が低すぎる場合
        Object.entries(stageCompletionRates).forEach(([stageId, rate]) => {
            if (rate < 0.3) { // 30%未満
                suggestions.stages.push({
                    stageId,
                    type: 'reduce_difficulty',
                    reason: `${stageId}のクリア率が低すぎます (${Math.floor(rate * 100)}%)`,
                    currentRate: rate
                });
            }
        });
        
        // アイテム使用率が低い場合
        Object.entries(itemUsageRates).forEach(([itemId, rate]) => {
            if (rate < 0.1) { // 10%未満
                suggestions.items.push({
                    itemId,
                    type: 'reduce_cost',
                    reason: `${itemId}の使用率が低すぎます (${Math.floor(rate * 100)}%)`,
                    currentRate: rate
                });
            }
        });
        
        return suggestions;
    }
    
    /**
     * デバッグ情報を取得
     * @returns {Object} デバッグ情報
     */
    getDebugInfo() {
        return {
            hasGameConfig: !!this.gameConfig,
            balanceConfig: this.getBalanceConfig(),
            version: '1.0.0'
        };
    }
}