/**
 * ChallengeDataController
 * チャレンジデータ管理、進捗追跡、状態同期
 */
export class ChallengeDataController {
    constructor(challengeUI) {
        this.challengeUI = challengeUI;
        this.config = challengeUI.config;
        this.state = challengeUI.state;
        this.stats = challengeUI.stats;
        
        // タイマー
        this.refreshTimer = null;
        
        console.log('[ChallengeDataController] Component initialized');
    }
    
    /**
     * チャレンジデータの読み込み
     */
    async loadChallenges() {
        try {
            this.challengeUI.renderer.showLoading(true);
            this.state.loading = true;
            
            // チャレンジシステムからデータを取得
            let challenges = [];
            if (this.challengeUI.challengeSystem && typeof this.challengeUI.challengeSystem.getChallenges === 'function') {
                challenges = await this.challengeUI.challengeSystem.getChallenges();
            } else {
                // デモデータ
                challenges = this.generateDemoChallenges();
            }
            
            // フィルター・ソートの適用
            challenges = this.filterChallenges(challenges);
            challenges = this.sortChallenges(challenges);
            
            this.state.challenges = challenges;
            
            // UI の更新
            this.challengeUI.renderer.renderChallenges();
            this.challengeUI.renderer.updateProgressSection();
            this.challengeUI.renderer.updateFooter();
            
            this.state.loading = false;
            this.challengeUI.renderer.showLoading(false);
            
            // アナウンス
            this.challengeUI.announce(`${challenges.length}件のチャレンジを読み込みました`);
            
        } catch (error) {
            this.state.loading = false;
            this.challengeUI.renderer.showLoading(false);
            this.challengeUI.renderer.showError('チャレンジの読み込みに失敗しました');
            this.challengeUI.handleError('CHALLENGE_LOAD_FAILED', error);
        }
    }
    
    /**
     * デモチャレンジの生成
     */
    generateDemoChallenges() {
        return [
            {
                id: 'daily-1',
                title: '10個のバブルをポップ',
                description: '今日中に10個のバブルをポップしよう',
                type: 'daily',
                difficulty: 'easy',
                progress: 7,
                target: 10,
                reward: { ap: 50 },
                deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
                priority: 1
            },
            {
                id: 'weekly-1',
                title: '500ポイント獲得',
                description: '今週中に500ポイントを獲得しよう',
                type: 'weekly',
                difficulty: 'medium',
                progress: 250,
                target: 500,
                reward: { ap: 200 },
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                priority: 2
            },
            {
                id: 'special-1',
                title: 'コンボ10回達成',
                description: '1回のゲームで10回コンボを達成しよう',
                type: 'special',
                difficulty: 'hard',
                progress: 0,
                target: 1,
                reward: { ap: 300, title: 'コンボマスター' },
                deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                priority: 3
            }
        ];
    }
    
    /**
     * チャレンジのフィルタリング
     */
    filterChallenges(challenges) {
        const filter = this.state.filterBy;
        
        switch (filter) {
            case 'daily':
                return challenges.filter(c => c.type === 'daily');
            case 'weekly':
                return challenges.filter(c => c.type === 'weekly');
            case 'active':
                return challenges.filter(c => c.progress < c.target);
            case 'completed':
                return challenges.filter(c => c.progress >= c.target);
            default:
                return challenges;
        }
    }
    
    /**
     * チャレンジのソート
     */
    sortChallenges(challenges) {
        const sortBy = this.state.sortBy;
        
        return challenges.sort((a, b) => {
            switch (sortBy) {
                case 'priority':
                    return a.priority - b.priority;
                case 'difficulty':
                    const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
                    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
                case 'progress':
                    const aProgress = a.progress / a.target;
                    const bProgress = b.progress / b.target;
                    return bProgress - aProgress;
                case 'deadline':
                    return new Date(a.deadline) - new Date(b.deadline);
                default:
                    return 0;
            }
        });
    }
    
    /**
     * チャレンジの進捗更新
     */
    updateChallengeProgress(challengeId, newProgress) {
        const challenge = this.state.challenges.find(c => c.id === challengeId);
        if (challenge) {
            const oldProgress = challenge.progress;
            challenge.progress = Math.min(newProgress, challenge.target);
            
            // 完了チェック
            if (challenge.progress >= challenge.target && oldProgress < challenge.target) {
                this.onChallengeCompleted(challenge);
            }
            
            // UI更新
            this.refreshChallengeDisplay();
            
            // 進捗アナウンス
            if (this.config.accessibility.progressAnnouncements) {
                this.challengeUI.interactionHandler.announceProgressUpdate(challengeId, challenge.progress);
            }
            
            return true;
        }
        return false;
    }
    
    /**
     * チャレンジ完了処理
     */
    onChallengeCompleted(challenge) {
        this.stats.completions++;
        
        // 報酬付与の通知
        if (this.config.accessibility.rewardAnnouncements) {
            const rewardText = this.formatReward(challenge.reward);
            this.challengeUI.announce(`「${challenge.title}」が完了しました！報酬: ${rewardText}`, 'assertive');
        }
        
        // チャレンジシステムへの通知
        if (this.challengeUI.challengeSystem && typeof this.challengeUI.challengeSystem.onChallengeCompleted === 'function') {
            this.challengeUI.challengeSystem.onChallengeCompleted(challenge);
        }
        
        this.challengeUI.log('チャレンジ完了', { challengeId: challenge.id });
    }
    
    /**
     * チャレンジの検索
     */
    searchChallenges(query) {
        if (!query || query.trim() === '') {
            return this.state.challenges;
        }
        
        const searchTerm = query.toLowerCase().trim();
        return this.state.challenges.filter(challenge => 
            challenge.title.toLowerCase().includes(searchTerm) ||
            challenge.description.toLowerCase().includes(searchTerm) ||
            challenge.type.toLowerCase().includes(searchTerm) ||
            challenge.difficulty.toLowerCase().includes(searchTerm)
        );
    }
    
    /**
     * チャレンジデータの検証
     */
    validateChallengeData(challenge) {
        const errors = [];
        
        // 必須フィールドの検証
        if (!challenge.id) errors.push('ID is required');
        if (!challenge.title) errors.push('Title is required');
        if (!challenge.description) errors.push('Description is required');
        if (!challenge.type) errors.push('Type is required');
        if (!challenge.difficulty) errors.push('Difficulty is required');
        
        // 数値フィールドの検証
        if (typeof challenge.progress !== 'number' || challenge.progress < 0) {
            errors.push('Progress must be a non-negative number');
        }
        if (typeof challenge.target !== 'number' || challenge.target <= 0) {
            errors.push('Target must be a positive number');
        }
        if (challenge.progress > challenge.target) {
            errors.push('Progress cannot exceed target');
        }
        
        // 期限の検証
        if (!(challenge.deadline instanceof Date) || isNaN(challenge.deadline.getTime())) {
            errors.push('Deadline must be a valid date');
        }
        
        // タイプの検証
        const validTypes = ['daily', 'weekly', 'special', 'event'];
        if (!validTypes.includes(challenge.type)) {
            errors.push(`Type must be one of: ${validTypes.join(', ')}`);
        }
        
        // 難易度の検証
        const validDifficulties = ['easy', 'medium', 'hard'];
        if (!validDifficulties.includes(challenge.difficulty)) {
            errors.push(`Difficulty must be one of: ${validDifficulties.join(', ')}`);
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    /**
     * チャレンジデータの正規化
     */
    normalizeChallengeData(challenge) {
        return {
            id: String(challenge.id || ''),
            title: String(challenge.title || ''),
            description: String(challenge.description || ''),
            type: String(challenge.type || 'daily').toLowerCase(),
            difficulty: String(challenge.difficulty || 'easy').toLowerCase(),
            progress: Math.max(0, Number(challenge.progress || 0)),
            target: Math.max(1, Number(challenge.target || 1)),
            reward: challenge.reward || {},
            deadline: challenge.deadline instanceof Date ? challenge.deadline : new Date(),
            priority: Number(challenge.priority || 999),
            metadata: challenge.metadata || {}
        };
    }
    
    /**
     * チャレンジ表示の更新
     */
    refreshChallengeDisplay() {
        // レンダラーに委譲
        this.challengeUI.renderer.renderChallenges();
        this.challengeUI.renderer.updateProgressSection();
        this.challengeUI.renderer.updateFooter();
        
        // フォーカス可能要素の更新
        this.challengeUI.interactionHandler.updateFocusableElements();
    }
    
    /**
     * 自動更新の開始
     */
    startAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        this.refreshTimer = setInterval(() => {
            if (this.state.visible && !this.state.loading) {
                this.loadChallenges();
            }
        }, this.config.refreshInterval);
    }
    
    /**
     * 自動更新の停止
     */
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }
    
    /**
     * チャレンジ統計の取得
     */
    getChallengeStatistics() {
        const challenges = this.state.challenges;
        const total = challenges.length;
        const completed = challenges.filter(c => c.progress >= c.target).length;
        const active = challenges.filter(c => c.progress < c.target).length;
        
        // タイプ別統計
        const byType = challenges.reduce((acc, challenge) => {
            acc[challenge.type] = (acc[challenge.type] || 0) + 1;
            return acc;
        }, {});
        
        // 難易度別統計
        const byDifficulty = challenges.reduce((acc, challenge) => {
            acc[challenge.difficulty] = (acc[challenge.difficulty] || 0) + 1;
            return acc;
        }, {});
        
        // 平均進捗率
        const averageProgress = total > 0 
            ? challenges.reduce((sum, c) => sum + (c.progress / c.target), 0) / total * 100
            : 0;
        
        return {
            total,
            completed,
            active,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            averageProgress: Math.round(averageProgress),
            byType,
            byDifficulty
        };
    }
    
    /**
     * チャレンジデータのエクスポート
     */
    exportChallengeData() {
        const data = {
            challenges: this.state.challenges,
            statistics: this.getChallengeStatistics(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        return JSON.stringify(data, null, 2);
    }
    
    /**
     * チャレンジデータのインポート
     */
    importChallengeData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (!data.challenges || !Array.isArray(data.challenges)) {
                throw new Error('Invalid challenge data format');
            }
            
            // データの検証と正規化
            const validatedChallenges = [];
            const errors = [];
            
            data.challenges.forEach((challenge, index) => {
                const normalized = this.normalizeChallengeData(challenge);
                const validation = this.validateChallengeData(normalized);
                
                if (validation.isValid) {
                    validatedChallenges.push(normalized);
                } else {
                    errors.push({ index, errors: validation.errors });
                }
            });
            
            if (validatedChallenges.length > 0) {
                this.state.challenges = validatedChallenges;
                this.refreshChallengeDisplay();
                this.challengeUI.announce(`${validatedChallenges.length}件のチャレンジをインポートしました`);
            }
            
            return {
                success: true,
                imported: validatedChallenges.length,
                errors: errors.length > 0 ? errors : null
            };
            
        } catch (error) {
            this.challengeUI.handleError('CHALLENGE_IMPORT_FAILED', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * 報酬のフォーマット
     */
    formatReward(reward) {
        const parts = [];
        if (reward.ap) {
            parts.push(`${reward.ap} AP`);
        }
        if (reward.title) {
            parts.push(`称号「${reward.title}」`);
        }
        return parts.join(', ');
    }
    
    /**
     * チャレンジの優先度更新
     */
    updateChallengePriority(challengeId, newPriority) {
        const challenge = this.state.challenges.find(c => c.id === challengeId);
        if (challenge) {
            challenge.priority = newPriority;
            
            // 並び順が優先度の場合は再ソート
            if (this.state.sortBy === 'priority') {
                this.state.challenges = this.sortChallenges(this.state.challenges);
                this.refreshChallengeDisplay();
            }
            
            return true;
        }
        return false;
    }
    
    /**
     * 期限切れチャレンジの確認
     */
    checkExpiredChallenges() {
        const now = new Date();
        const expiredChallenges = this.state.challenges.filter(c => c.deadline < now && c.progress < c.target);
        
        if (expiredChallenges.length > 0) {
            this.challengeUI.announce(`${expiredChallenges.length}件のチャレンジが期限切れです`, 'assertive');
            
            // 期限切れ処理
            expiredChallenges.forEach(challenge => {
                this.onChallengeExpired(challenge);
            });
        }
        
        return expiredChallenges;
    }
    
    /**
     * チャレンジ期限切れ処理
     */
    onChallengeExpired(challenge) {
        // チャレンジシステムへの通知
        if (this.challengeUI.challengeSystem && typeof this.challengeUI.challengeSystem.onChallengeExpired === 'function') {
            this.challengeUI.challengeSystem.onChallengeExpired(challenge);
        }
        
        this.challengeUI.log('チャレンジ期限切れ', { challengeId: challenge.id });
    }
    
    /**
     * データ整合性チェック
     */
    validateDataIntegrity() {
        const issues = [];
        
        // 重複IDのチェック
        const ids = this.state.challenges.map(c => c.id);
        const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
        if (duplicateIds.length > 0) {
            issues.push(`Duplicate challenge IDs found: ${duplicateIds.join(', ')}`);
        }
        
        // データ型の整合性
        this.state.challenges.forEach((challenge, index) => {
            const validation = this.validateChallengeData(challenge);
            if (!validation.isValid) {
                issues.push(`Challenge ${index} (${challenge.id}): ${validation.errors.join(', ')}`);
            }
        });
        
        return {
            isValid: issues.length === 0,
            issues
        };
    }
    
    /**
     * コンポーネントクリーンアップ
     */
    destroy() {
        this.stopAutoRefresh();
        
        console.log('[ChallengeDataController] Component destroyed');
    }
}