import { getErrorHandler } from '../utils/ErrorHandler.js';

/**
 * ゲームコンテンツ説明生成クラス
 * ゲーム状態の動的説明とコンテキスト依存ヘルプを提供
 */
export class GameContentDescriber {
    constructor(screenReaderManager) {
        this.screenReaderManager = screenReaderManager;
        this.accessibilityManager = screenReaderManager.accessibilityManager;
        this.gameEngine = this.accessibilityManager.gameEngine;
        
        // 説明設定
        this.config = {
            verbosity: 'normal', // 'minimal', 'normal', 'verbose'
            language: 'ja',
            contextSensitive: true,
            includeInstructions: true,
            includeShortcuts: true,
            updateFrequency: 2000, // 2秒間隔
            maxDescriptionLength: 300,
            priority: {
                critical: ['gameOver', 'levelComplete', 'error'],
                high: ['scoreChange', 'comboStart', 'specialBubble'],
                normal: ['bubbleSpawn', 'timeUpdate'],
                low: ['background', 'ambient']
            }
        };
        
        // 説明テンプレート
        this.templates = {
            gameState: {
                loading: 'ゲームを読み込み中です。',
                ready: 'ゲームの準備が完了しました。{instructions}',
                playing: 'ゲーム進行中。スコア{score}点、残り時間{timeLeft}秒。{bubbleCount}個のバブルが画面にあります。',
                paused: 'ゲームが一時停止されています。{resumeInstruction}',
                gameOver: 'ゲーム終了。最終スコア{finalScore}点。{restartInstruction}',
                levelComplete: 'ステージクリア！獲得スコア{score}点。{nextLevelInstruction}'
            },
            
            bubbleTypes: {
                normal: '通常のバブル',
                stone: '硬いストーンバブル（{clicks}回クリック必要）',
                iron: '鉄のバブル（{clicks}回クリック必要）',
                diamond: 'ダイヤモンドバブル（{clicks}回クリック必要）',
                rainbow: 'レインボーバブル（ボーナスタイム発動）',
                pink: 'ピンクバブル（HP回復効果）',
                clock: '時計バブル（時間停止効果）',
                electric: '電気バブル（画面震動注意）',
                poison: '毒バブル（ポップ時ダメージ）',
                spiky: 'トゲバブル（連鎖ダメージ）',
                escaping: '逃げるバブル（カーソルから逃避）',
                boss: 'ボスバブル（大型、高HP）',
                golden: 'ゴールデンバブル（高得点）',
                frozen: '氷のバブル（溶かすのに時間必要）',
                magnetic: '磁石バブル（他のバブルを引き寄せ）',
                explosive: '爆発バブル（周囲にダメージ）',
                phantom: 'ファントムバブル（透明化）',
                multiplier: '倍率バブル（スコア倍率アップ）'
            },
            
            actions: {
                bubblePopped: '{bubbleType}をポップしました。{points}点獲得。',
                comboContinue: '{comboCount}コンボ継続中！',
                comboEnd: '{comboCount}コンボ終了。ボーナス{bonus}点獲得。',
                specialEffect: '{effectName}が発動しました。{description}',
                damageReceived: 'ダメージを受けました。残りHP{hp}。',
                timeWarning: '残り時間{timeLeft}秒です。急いでください！',
                newHighScore: '新記録達成！{score}点！'
            },
            
            instructions: {
                basic: 'マウスクリックまたはスペースキーでバブルをポップしてください。',
                keyboard: 'Tab/矢印キーで移動、Enterで実行、Escapeでメニューです。',
                advanced: 'ドラッグでバブルを移動できます。特殊バブルには様々な効果があります。',
                shortcuts: '主なショートカット: P（一時停止）、R（リスタート）、H（ヘルプ）'
            },
            
            contextHelp: {
                firstTime: 'バブルポップゲームへようこそ！バブルをクリックして破裂させ、高得点を目指しましょう。',
                struggling: 'コツ: 同じ色のバブルを連続でポップするとコンボボーナスがもらえます。',
                advanced: '上級者向け: 特殊バブルを効果的に使って高得点を狙いましょう。',
                timeRunningOut: '時間に注意！効率よくバブルをポップしましょう。'
            }
        };
        
        // 状態管理
        this.state = {
            lastGameState: null,
            lastBubbleCount: 0,
            lastScore: 0,
            lastCombo: 0,
            sessionStats: {
                totalDescriptions: 0,
                actionDescriptions: 0,
                helpRequests: 0,
                startTime: Date.now()
            },
            recentActions: [],
            userPreferences: {
                verbosity: 'normal',
                includeScores: true,
                includeTime: true,
                includeBubbleCounts: false
            }
        };
        
        // バブル位置管理（空間的説明用）
        this.spatialInfo = {
            bubblePositions: new Map(),
            screenRegions: {
                topLeft: { x: 0, y: 0, width: 0.33, height: 0.33 },
                topCenter: { x: 0.33, y: 0, width: 0.34, height: 0.33 },
                topRight: { x: 0.67, y: 0, width: 0.33, height: 0.33 },
                middleLeft: { x: 0, y: 0.33, width: 0.33, height: 0.34 },
                center: { x: 0.33, y: 0.33, width: 0.34, height: 0.34 },
                middleRight: { x: 0.67, y: 0.33, width: 0.33, height: 0.34 },
                bottomLeft: { x: 0, y: 0.67, width: 0.33, height: 0.33 },
                bottomCenter: { x: 0.33, y: 0.67, width: 0.34, height: 0.33 },
                bottomRight: { x: 0.67, y: 0.67, width: 0.33, height: 0.33 }
            }
        };
        
        console.log('GameContentDescriber initialized');
        this.initialize();
    }
    
    /**
     * 初期化
     */
    initialize() {
        try {
            // ゲームエベントの監視
            this.setupGameEventListeners();
            
            // ユーザー設定の読み込み
            this.loadUserPreferences();
            
            // 定期更新の開始
            this.startPeriodicUpdates();
            
            console.log('GameContentDescriber initialized successfully');
        } catch (error) {
            getErrorHandler().handleError(error, 'GAME_DESCRIBER_ERROR', {
                operation: 'initialize'
            });
        }
    }
    
    /**
     * ゲームイベントリスナーの設定
     */
    setupGameEventListeners() {
        if (!this.gameEngine) {
            console.warn('GameEngine not available for event listening');
            return;
        }
        
        // GameEngineのイベントを監視
        if (this.gameEngine.addEventListener) {
            this.gameEngine.addEventListener('gameStateChanged', (event) => {
                this.handleGameStateChange(event.newState, event.oldState);
            });
            
            this.gameEngine.addEventListener('scoreChanged', (event) => {
                this.handleScoreChange(event.newScore, event.oldScore);
            });
            
            this.gameEngine.addEventListener('bubblePopped', (event) => {
                this.handleBubblePopped(event.bubble, event.points);
            });
            
            this.gameEngine.addEventListener('comboChanged', (event) => {
                this.handleComboChange(event.combo, event.isNewCombo);
            });
            
            this.gameEngine.addEventListener('specialEffectTriggered', (event) => {
                this.handleSpecialEffect(event.effect, event.description);
            });
        }
        
        // BubbleManagerのイベント監視
        if (this.gameEngine.bubbleManager) {
            this.gameEngine.bubbleManager.addEventListener?.('bubbleSpawned', (event) => {
                this.handleBubbleSpawned(event.bubble);
            });
            
            this.gameEngine.bubbleManager.addEventListener?.('bubbleBurst', (event) => {
                this.handleBubbleBurst(event.bubble);
            });
        }
        
        // SceneManagerのイベント監視
        if (this.gameEngine.sceneManager) {
            this.gameEngine.sceneManager.addEventListener?.('sceneChanged', (event) => {
                this.handleSceneChange(event.newScene, event.oldScene);
            });
        }
    }
    
    /**
     * ユーザー設定の読み込み
     */
    loadUserPreferences() {
        try {
            const savedPrefs = localStorage.getItem('gameContentDescriber_preferences');
            if (savedPrefs) {
                const prefs = JSON.parse(savedPrefs);
                Object.assign(this.state.userPreferences, prefs);
                
                // 設定に基づいて動作を調整
                this.config.verbosity = this.state.userPreferences.verbosity;
            }
        } catch (error) {
            console.warn('Failed to load user preferences:', error);
        }
    }
    
    /**
     * ユーザー設定の保存
     */
    saveUserPreferences() {
        try {
            localStorage.setItem('gameContentDescriber_preferences', 
                JSON.stringify(this.state.userPreferences));
        } catch (error) {
            console.warn('Failed to save user preferences:', error);
        }
    }
    
    /**
     * 定期更新の開始
     */
    startPeriodicUpdates() {
        this.updateInterval = setInterval(() => {
            this.performPeriodicUpdate();
        }, this.config.updateFrequency);
    }
    
    /**
     * 定期更新の実行
     */
    performPeriodicUpdate() {
        if (!this.shouldProvideUpdate()) {
            return;
        }
        
        const currentGameState = this.getCurrentGameState();
        if (currentGameState.phase === 'playing') {
            this.describeCurrentGameState(currentGameState);
        }
    }
    
    /**
     * 更新提供判定
     */
    shouldProvideUpdate() {
        // フォーカスがゲーム領域にない場合は更新しない
        const activeElement = document.activeElement;
        const gameCanvas = document.querySelector('#game-canvas, canvas.game-canvas');
        
        if (gameCanvas && activeElement !== gameCanvas) {
            return false;
        }
        
        // 最近アクションがあった場合は更新をスキップ
        const lastAction = this.state.recentActions[this.state.recentActions.length - 1];
        if (lastAction && Date.now() - lastAction.timestamp < 3000) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 現在のゲーム状態取得
     */
    getCurrentGameState() {
        const defaultState = {
            phase: 'unknown',
            score: 0,
            timeLeft: 0,
            hp: 0,
            combo: 0,
            bubbleCount: 0,
            level: 1
        };
        
        if (!this.gameEngine) {
            return defaultState;
        }
        
        try {
            // GameEngineから状態を取得
            const scene = this.gameEngine.sceneManager?.getCurrentScene();
            if (!scene || scene.constructor.name !== 'GameScene') {
                return { ...defaultState, phase: 'menu' };
            }
            
            return {
                phase: scene.isPaused ? 'paused' : 'playing',
                score: scene.scoreManager?.currentScore || 0,
                timeLeft: scene.timeLeft || 0,
                hp: scene.playerHP || 0,
                combo: scene.scoreManager?.currentCombo || 0,
                bubbleCount: scene.bubbleManager?.bubbles?.length || 0,
                level: scene.currentLevel || 1
            };
        } catch (error) {
            console.warn('Failed to get current game state:', error);
            return defaultState;
        }
    }
    
    /**
     * ゲーム状態変更の処理
     */
    handleGameStateChange(newState, oldState) {
        const description = this.generateGameStateDescription(newState, oldState);
        if (description) {
            this.announceDescription(description, 'assertive');
            this.addToRecentActions('gameStateChange', { newState, description });
        }
        
        this.state.lastGameState = newState;
    }
    
    /**
     * スコア変更の処理
     */
    handleScoreChange(newScore, oldScore) {
        if (!this.state.userPreferences.includeScores) {
            return;
        }
        
        const scoreIncrease = newScore - oldScore;
        if (scoreIncrease > 0) {
            let description = '';
            
            if (scoreIncrease >= 1000) {
                description = `大幅得点！${scoreIncrease}点獲得。総スコア${newScore}点。`;
            } else if (scoreIncrease >= 100) {
                description = `${scoreIncrease}点獲得。総スコア${newScore}点。`;
            } else if (this.config.verbosity === 'verbose') {
                description = `${scoreIncrease}点獲得。`;
            }
            
            if (description) {
                this.announceDescription(description, 'polite');
                this.addToRecentActions('scoreChange', { newScore, oldScore, increase: scoreIncrease });
            }
        }
        
        this.state.lastScore = newScore;
    }
    
    /**
     * バブルポップの処理
     */
    handleBubblePopped(bubble, points) {
        const bubbleType = this.getBubbleTypeDescription(bubble);
        const template = this.templates.actions.bubblePopped;
        
        const description = this.fillTemplate(template, {
            bubbleType: bubbleType,
            points: points
        });
        
        // 特殊バブルの場合は詳細説明
        if (this.isSpecialBubble(bubble)) {
            const specialDescription = this.getSpecialBubbleDescription(bubble);
            const fullDescription = `${description} ${specialDescription}`;
            this.announceDescription(fullDescription, 'polite');
        } else if (this.config.verbosity === 'verbose') {
            this.announceDescription(description, 'polite');
        }
        
        this.addToRecentActions('bubblePopped', { bubble, points, description });
    }
    
    /**
     * コンボ変更の処理
     */
    handleComboChange(combo, isNewCombo) {
        if (combo <= 1) {
            // コンボ終了
            if (this.state.lastCombo > 1) {
                const template = this.templates.actions.comboEnd;
                const description = this.fillTemplate(template, {
                    comboCount: this.state.lastCombo,
                    bonus: this.calculateComboBonus(this.state.lastCombo)
                });
                this.announceDescription(description, 'polite');
            }
        } else {
            // コンボ継続
            if (combo > this.state.lastCombo && combo >= 3) {
                const template = this.templates.actions.comboContinue;
                const description = this.fillTemplate(template, {
                    comboCount: combo
                });
                this.announceDescription(description, 'polite');
            }
        }
        
        this.state.lastCombo = combo;
        this.addToRecentActions('comboChange', { combo, isNewCombo });
    }
    
    /**
     * 特殊効果の処理
     */
    handleSpecialEffect(effect, description) {
        const template = this.templates.actions.specialEffect;
        const fullDescription = this.fillTemplate(template, {
            effectName: this.getEffectDisplayName(effect),
            description: description
        });
        
        this.announceDescription(fullDescription, 'assertive');
        this.addToRecentActions('specialEffect', { effect, description });
    }
    
    /**
     * バブル出現の処理
     */
    handleBubbleSpawned(bubble) {
        // 重要な特殊バブルの場合のみ通知
        if (this.isImportantBubble(bubble)) {
            const bubbleType = this.getBubbleTypeDescription(bubble);
            const position = this.getBubblePosition(bubble);
            const description = `${position}に${bubbleType}が出現しました。`;
            
            this.announceDescription(description, 'polite');
            this.addToRecentActions('bubbleSpawned', { bubble, position });
        }
        
        // 空間情報を更新
        this.updateSpatialInfo(bubble);
    }
    
    /**
     * バブル破裂の処理
     */
    handleBubbleBurst(bubble) {
        // 自動破裂（時間切れ）の場合
        if (bubble.burstReason === 'timeout') {
            const description = 'バブルが時間切れで破裂しました。ダメージを受けました。';
            this.announceDescription(description, 'assertive');
            this.addToRecentActions('bubbleBurst', { bubble, reason: 'timeout' });
        }
    }
    
    /**
     * シーン変更の処理
     */
    handleSceneChange(newScene, oldScene) {
        const sceneDescriptions = {
            'MainMenuScene': 'メインメニューに戻りました。',
            'GameScene': 'ゲーム画面に移動しました。',
            'StageSelectScene': 'ステージ選択画面です。',
            'ShopScene': 'ショップ画面です。',
            'UserInfoScene': 'ユーザー情報画面です。'
        };
        
        const sceneName = newScene.constructor.name;
        const description = sceneDescriptions[sceneName] || `${sceneName}に移動しました。`;
        
        this.announceDescription(description, 'polite');
        this.addToRecentActions('sceneChange', { newScene: sceneName, oldScene: oldScene?.constructor.name });
        
        // シーン固有の初期説明
        this.provideSceneIntroduction(newScene);
    }
    
    /**
     * ゲーム状態説明の生成
     */
    generateGameStateDescription(newState, oldState) {
        const phase = newState.phase || newState;
        const template = this.templates.gameState[phase];
        
        if (!template) {
            return null;
        }
        
        const variables = {
            score: newState.score || 0,
            finalScore: newState.finalScore || newState.score || 0,
            timeLeft: Math.ceil((newState.timeLeft || 0) / 1000),
            bubbleCount: newState.bubbleCount || 0,
            instructions: this.getContextualInstructions(phase),
            resumeInstruction: 'Spaceキーで再開できます。',
            restartInstruction: 'Enterキーで新しいゲームを開始できます。',
            nextLevelInstruction: 'Enterキーで次のステージに進めます。'
        };
        
        return this.fillTemplate(template, variables);
    }
    
    /**
     * 現在のゲーム状態説明
     */
    describeCurrentGameState(gameState) {
        const description = this.generateGameStateDescription(gameState);
        if (description) {
            this.announceDescription(description, 'polite');
        }
    }
    
    /**
     * バブルタイプ説明の取得
     */
    getBubbleTypeDescription(bubble) {
        if (!bubble || !bubble.type) {
            return '不明なバブル';
        }
        
        const template = this.templates.bubbleTypes[bubble.type];
        if (!template) {
            return `${bubble.type}バブル`;
        }
        
        const variables = {
            clicks: bubble.requiredClicks || 1
        };
        
        return this.fillTemplate(template, variables);
    }
    
    /**
     * 特殊バブル判定
     */
    isSpecialBubble(bubble) {
        const specialTypes = [
            'rainbow', 'pink', 'clock', 'electric', 'poison', 'spiky', 
            'escaping', 'boss', 'golden', 'frozen', 'magnetic', 'explosive', 
            'phantom', 'multiplier'
        ];
        
        return bubble && specialTypes.includes(bubble.type);
    }
    
    /**
     * 重要なバブル判定
     */
    isImportantBubble(bubble) {
        const importantTypes = ['boss', 'rainbow', 'golden', 'multiplier'];
        return bubble && importantTypes.includes(bubble.type);
    }
    
    /**
     * 特殊バブル説明の取得
     */
    getSpecialBubbleDescription(bubble) {
        const descriptions = {
            'rainbow': 'ボーナスタイムが発動します。',
            'pink': 'HPが回復しました。',
            'clock': '時間が停止しました。',
            'electric': '画面が震動します。',
            'poison': 'ダメージを受けました。',
            'boss': 'ボスバブルです。複数回クリックが必要です。',
            'golden': '高得点ボーナスです！',
            'multiplier': 'スコア倍率がアップしました！'
        };
        
        return descriptions[bubble.type] || '';
    }
    
    /**
     * バブル位置の取得
     */
    getBubblePosition(bubble) {
        if (!bubble.x || !bubble.y) {
            return '画面上';
        }
        
        // Canvas サイズを取得
        const canvas = document.querySelector('#game-canvas, canvas.game-canvas');
        if (!canvas) {
            return '画面上';
        }
        
        const canvasWidth = canvas.width || canvas.offsetWidth;
        const canvasHeight = canvas.height || canvas.offsetHeight;
        
        // 相対位置を計算
        const relativeX = bubble.x / canvasWidth;
        const relativeY = bubble.y / canvasHeight;
        
        // 領域を判定
        for (const [regionName, region] of Object.entries(this.spatialInfo.screenRegions)) {
            if (relativeX >= region.x && relativeX < region.x + region.width &&
                relativeY >= region.y && relativeY < region.y + region.height) {
                return this.getRegionDisplayName(regionName);
            }
        }
        
        return '画面上';
    }
    
    /**
     * 領域表示名の取得
     */
    getRegionDisplayName(regionName) {
        const displayNames = {
            'topLeft': '左上',
            'topCenter': '上中央',
            'topRight': '右上',
            'middleLeft': '左',
            'center': '中央',
            'middleRight': '右',
            'bottomLeft': '左下',
            'bottomCenter': '下中央',
            'bottomRight': '右下'
        };
        
        return displayNames[regionName] || '画面上';
    }
    
    /**
     * 空間情報の更新
     */
    updateSpatialInfo(bubble) {
        if (bubble.id) {
            this.spatialInfo.bubblePositions.set(bubble.id, {
                x: bubble.x,
                y: bubble.y,
                type: bubble.type,
                timestamp: Date.now()
            });
        }
        
        // 古い位置情報を削除（5秒以上古い）
        const cutoff = Date.now() - 5000;
        for (const [id, info] of this.spatialInfo.bubblePositions) {
            if (info.timestamp < cutoff) {
                this.spatialInfo.bubblePositions.delete(id);
            }
        }
    }
    
    /**
     * コンテキスト依存指示の取得
     */
    getContextualInstructions(phase) {
        const base = this.templates.instructions.basic;
        
        if (this.config.includeShortcuts) {
            return `${base} ${this.templates.instructions.shortcuts}`;
        }
        
        return base;
    }
    
    /**
     * シーン導入説明の提供
     */
    provideSceneIntroduction(scene) {
        const sceneName = scene.constructor.name;
        
        switch (sceneName) {
            case 'GameScene':
                const gameState = this.getCurrentGameState();
                const intro = this.generateGameStateDescription(gameState);
                if (intro) {
                    setTimeout(() => {
                        this.announceDescription(intro, 'polite');
                    }, 1000); // 1秒後に説明
                }
                break;
                
            case 'StageSelectScene':
                this.announceDescription('矢印キーでステージを選択し、Enterで決定してください。', 'polite');
                break;
                
            case 'ShopScene':
                this.announceDescription('アイテムを購入できます。矢印キーで選択し、Enterで購入してください。', 'polite');
                break;
        }
    }
    
    /**
     * 効果表示名の取得
     */
    getEffectDisplayName(effect) {
        const displayNames = {
            'bonusTime': 'ボーナスタイム',
            'timeStop': '時間停止',
            'doubleScore': 'ダブルスコア',
            'shockWave': '衝撃波',
            'magnetism': '磁力効果',
            'explosion': '爆発'
        };
        
        return displayNames[effect] || effect;
    }
    
    /**
     * コンボボーナス計算
     */
    calculateComboBonus(comboCount) {
        return Math.floor(comboCount * 50); // 仮の計算式
    }
    
    /**
     * テンプレート埋め込み
     */
    fillTemplate(template, variables) {
        let result = template;
        
        Object.entries(variables).forEach(([key, value]) => {
            const placeholder = `{${key}}`;
            result = result.replace(new RegExp(placeholder, 'g'), String(value));
        });
        
        return result;
    }
    
    /**
     * 説明のアナウンス
     */
    announceDescription(description, priority = 'polite') {
        if (!description || description.length === 0) {
            return;
        }
        
        // 長さ制限
        if (description.length > this.config.maxDescriptionLength) {
            description = description.substring(0, this.config.maxDescriptionLength - 3) + '...';
        }
        
        // スクリーンリーダーマネージャーに通知
        if (this.screenReaderManager && this.screenReaderManager.announce) {
            this.screenReaderManager.announce(description, priority);
        } else {
            // フォールバック: console.log
            console.log(`[Game Description] ${description}`);
        }
        
        this.state.sessionStats.totalDescriptions++;
    }
    
    /**
     * 最近のアクションに追加
     */
    addToRecentActions(type, data) {
        this.state.recentActions.push({
            type: type,
            data: data,
            timestamp: Date.now()
        });
        
        // 履歴サイズを制限
        if (this.state.recentActions.length > 20) {
            this.state.recentActions.shift();
        }
        
        this.state.sessionStats.actionDescriptions++;
    }
    
    /**
     * コンテキストヘルプの提供
     */
    provideContextualHelp(context) {
        let helpText = '';
        
        const gameState = this.getCurrentGameState();
        const sessionTime = Date.now() - this.state.sessionStats.startTime;
        
        // コンテキストに基づくヘルプ
        if (context === 'firstTime' || sessionTime < 30000) {
            helpText = this.templates.contextHelp.firstTime;
        } else if (gameState.score < 1000 && sessionTime > 60000) {
            helpText = this.templates.contextHelp.struggling;
        } else if (gameState.timeLeft < 30000 && gameState.timeLeft > 0) {
            helpText = this.templates.contextHelp.timeRunningOut;
        } else if (gameState.score > 5000) {
            helpText = this.templates.contextHelp.advanced;
        }
        
        if (helpText) {
            this.announceDescription(helpText, 'polite');
            this.state.sessionStats.helpRequests++;
            return helpText;
        }
        
        return null;
    }
    
    /**
     * 詳細ゲーム状況の説明
     */
    describeDetailedGameSituation() {
        const gameState = this.getCurrentGameState();
        
        if (gameState.phase !== 'playing') {
            return this.generateGameStateDescription(gameState);
        }
        
        let description = `詳細状況: スコア${gameState.score}点、`;
        description += `残り時間${Math.ceil(gameState.timeLeft / 1000)}秒、`;
        description += `HP${gameState.hp}、`;
        
        if (gameState.combo > 1) {
            description += `${gameState.combo}コンボ中、`;
        }
        
        description += `画面に${gameState.bubbleCount}個のバブル。`;
        
        // 特殊バブルの情報
        const specialBubbles = this.getSpecialBubblesOnScreen();
        if (specialBubbles.length > 0) {
            description += ` 特殊バブル: ${specialBubbles.join('、')}。`;
        }
        
        this.announceDescription(description, 'polite');
        return description;
    }
    
    /**
     * 画面上の特殊バブル取得
     */
    getSpecialBubblesOnScreen() {
        const specialBubbles = [];
        
        try {
            const bubbleManager = this.gameEngine?.bubbleManager;
            if (bubbleManager && bubbleManager.bubbles) {
                bubbleManager.bubbles.forEach(bubble => {
                    if (this.isSpecialBubble(bubble)) {
                        const position = this.getBubblePosition(bubble);
                        const type = this.getBubbleTypeDescription(bubble);
                        specialBubbles.push(`${position}の${type}`);
                    }
                });
            }
        } catch (error) {
            console.warn('Failed to get special bubbles:', error);
        }
        
        return specialBubbles;
    }
    
    /**
     * 設定の適用
     */
    applyConfig(config) {
        if (config.screenReader) {
            Object.assign(this.config, config.screenReader);
        }
        
        // ユーザー設定の更新
        if (config.verbosity) {
            this.state.userPreferences.verbosity = config.verbosity;
            this.config.verbosity = config.verbosity;
        }
        
        console.log('GameContentDescriber configuration applied');
    }
    
    /**
     * レポート生成
     */
    generateReport() {
        const sessionDuration = Date.now() - this.state.sessionStats.startTime;
        
        return {
            sessionStats: {
                ...this.state.sessionStats,
                sessionDuration: sessionDuration,
                descriptionsPerMinute: this.state.sessionStats.totalDescriptions / (sessionDuration / 60000)
            },
            recentActionsCount: this.state.recentActions.length,
            spatialBubblesTracked: this.spatialInfo.bubblePositions.size,
            userPreferences: this.state.userPreferences,
            lastGameState: this.state.lastGameState
        };
    }
    
    /**
     * 有効状態の設定
     */
    setEnabled(enabled) {
        if (enabled) {
            if (!this.updateInterval) {
                this.startPeriodicUpdates();
            }
        } else {
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
                this.updateInterval = null;
            }
        }
        
        console.log(`GameContentDescriber ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * クリーンアップ
     */
    destroy() {
        console.log('Destroying GameContentDescriber...');
        
        // 定期更新の停止
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // ユーザー設定の保存
        this.saveUserPreferences();
        
        // データのクリア
        this.state.recentActions = [];
        this.spatialInfo.bubblePositions.clear();
        
        console.log('GameContentDescriber destroyed');
    }
}