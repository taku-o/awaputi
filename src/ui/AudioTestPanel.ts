import { getErrorHandler } from '../utils/ErrorHandler.js';''
import { getLocalizationManager } from '../core/LocalizationManager.js';''
import type { AudioManager } from '../audio/AudioManager.js';''
import type { ErrorHandler } from '../utils/ErrorHandler.js';''
import type { LocalizationManager } from '../core/LocalizationManager.js';

/**
 * Test item interface
 */
interface TestItem { id: string,
    label: string;
    value?: number;
    progress?: number;
    countdown?: number; ,}

/**
 * Test category interface
 */
interface TestCategory { label: string,
    icon: string;
    items: TestItem[]
    ,}

/**
 * Test categories collection
 */
interface TestCategories { bubbles: TestCategory;
    combo: TestCategory;
    ui: TestCategory;
    achievement: TestCategory;
    gameState: TestCategory;
    bgm: TestCategory
    }

/**
 * Batch test configuration
 */
interface BatchTest { id: string;
    label: string;
    category: keyof TestCategories;
    icon: string }

/**
 * 音響テストパネルクラス - 各音響要素の個別テスト再生機能
 */
export class AudioTestPanel {
    private audioManager: AudioManager;
    private localizationManager: LocalizationManager;
    private errorHandler: ErrorHandler;
    // テストカテゴリ
    private testCategories: TestCategories = {
        bubbles: {''
            label: 'audio.test.bubbles''';
            icon: '🫧',
            items: [' ,}'

                { id: 'normal', label: '通常泡' ,},''
                { id: 'stone', label: '石泡' ,},''
                { id: 'iron', label: '鉄泡' ,},''
                { id: 'diamond', label: 'ダイヤモンド泡' ,},''
                { id: 'rainbow', label: 'レインボー泡' ,},''
                { id: 'pink', label: 'ピンク泡' ,},''
                { id: 'clock', label: '時計泡' ,},''
                { id: 'electric', label: '電気泡' ,},''
                { id: 'poison', label: '毒泡' ,},''
                { id: 'spiky', label: 'トゲ泡' ,},''
                { id: 'boss', label: 'ボス泡' ,},''
                { id: 'golden', label: 'ゴールデン泡' ,},''
                { id: 'frozen', label: 'フローズン泡' ,},''
                { id: 'magnetic', label: 'マグネット泡' ,},]'
                { id: 'explosive', label: '爆発泡' ,}]
            ];
        },

        combo: { ''
            label: 'audio.test.combo',
            icon: '🔥',
            items: [' ,}'

                { id: 'combo_1', label: 'コンボ レベル1', value: 1 ,},''
                { id: 'combo_2', label: 'コンボ レベル2', value: 2 ,},''
                { id: 'combo_3', label: 'コンボ レベル3', value: 3 ,},''
                { id: 'combo_4', label: 'コンボ レベル4', value: 4 ,},''
                { id: 'combo_5', label: 'コンボ レベル5', value: 5 ,},''
                { id: 'combo_10', label: 'コンボ 10連鎖', value: 10 ,},''
                { id: 'combo_25', label: 'コンボ 25連鎖', value: 25 ,},''
                { id: 'combo_50', label: 'コンボ 50連鎖', value: 50 ,},]'
                { id: 'combo_100', label: 'コンボ 100連鎖', value: 100 ,}]
            ];
        },

        ui: { ''
            label: 'audio.test.ui',
            icon: '🖱️',
            items: [' ,}'

                { id: 'click', label: 'クリック' ,},''
                { id: 'hover', label: 'ホバー' ,},''
                { id: 'select', label: '選択' ,},''
                { id: 'toggle', label: 'トグル' ,},''
                { id: 'open', label: '開く' ,},''
                { id: 'close', label: '閉じる' ,},''
                { id: 'error', label: 'エラー' ,},''
                { id: 'success', label: '成功' ,},]'
                { id: 'tab_switch', label: 'タブ切替' ,}]
            ];
        },

        achievement: { ''
            label: 'audio.test.achievement',
            icon: '🏆',
            items: [' ,}'

                { id: 'common', label: 'Common 実績' ,},''
                { id: 'rare', label: 'Rare 実績' ,},''
                { id: 'epic', label: 'Epic 実績' ,},''
                { id: 'legendary', label: 'Legendary 実績' ,},''
                { id: 'progress_25', label: '進捗 25%', progress: 0.25 ,},''
                { id: 'progress_50', label: '進捗 50%', progress: 0.5 ,},''
                { id: 'progress_75', label: '進捗 75%', progress: 0.75 ,},]'
                { id: 'progress_100', label: '進捗 100%', progress: 1.0 ,}]
            ];
        },

        gameState: { ''
            label: 'audio.test.gameState',
            icon: '🎮',
            items: [' ,}'

                { id: 'game_start', label: 'ゲーム開始' ,},''
                { id: 'game_over', label: 'ゲームオーバー' ,},''
                { id: 'levelup', label: 'レベルアップ' ,},''
                { id: 'warning', label: '警告' ,},''
                { id: 'timeup', label: 'タイムアップ' ,},''
                { id: 'stageclear', label: 'ステージクリア' ,},''
                { id: 'bonus_start', label: 'ボーナス開始' ,},''
                { id: 'bonus_end', label: 'ボーナス終了' ,},''
                { id: 'health_low', label: 'HP低下' ,},''
                { id: 'health_critical', label: 'HP危機' ,},''
                { id: 'powerup', label: 'パワーアップ' ,},''
                { id: 'countdown_3', label: 'カウントダウン 3', countdown: 3 ,},''
                { id: 'countdown_2', label: 'カウントダウン 2', countdown: 2 ,},''
                { id: 'countdown_1', label: 'カウントダウン 1', countdown: 1 ,},]'
                { id: 'countdown_0', label: 'カウントダウン GO!', countdown: 0 ,}]
            ];
        },

        bgm: { ''
            label: 'audio.test.bgm',
            icon: '🎵',
            items: [' ,}'

                { id: 'menu', label: 'メニューBGM' ,},''
                { id: 'gameplay', label: 'ゲームプレイBGM' ,},''
                { id: 'bonus', label: 'ボーナスBGM' ,},]'
                { id: 'gameover', label: 'ゲームオーバーBGM' ,}]
            ];
        }
    };
    
    // アクティブなBGMトラック
    private activeBGMTrack: string | null = null;
    // UI要素
    private panel: HTMLElement | null = null;
    private isOpen: boolean = false;
    constructor(audioManager: AudioManager) {

        this.audioManager = audioManager;
        this.localizationManager = getLocalizationManager();

    }
        this.errorHandler = getErrorHandler(); }
    }
    
    /**
     * テストパネルを作成
     * @returns {HTMLElement} パネル要素
     */''
    createPanel()';
        const panel = document.createElement('div'');''
        panel.className = 'audio-test-panel';

        panel.style.cssText = `'';
            background-color: rgba(0, 0, 0, 0.95);
            border: 2px solid #00ffff;
            border-radius: 15px,
            padding: 20px;
            max-height: 600px,
            overflow-y: auto,
        `;
        ';
        // タイトル
        const title = document.createElement('h3'');''
        title.textContent = this.localizationManager.getText('audio.test.title);
        title.style.cssText = `;
            color: #00ffff;
            font-size: 20px,
            margin-bottom: 20px,
            text-align: center,
            text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        `;
        panel.appendChild(title);
        
        // カテゴリ別テストセクション
        Object.entries(this.testCategories).forEach(([categoryKey, category]) => {  const section = this.createCategorySection(categoryKey as keyof TestCategories, category); }
            panel.appendChild(section); }
        };
        
        // 一括テストボタン
        const batchTestSection = this.createBatchTestSection();
        panel.appendChild(batchTestSection);
        
        this.panel = panel;
        return panel;
    }
    
    /**
     * カテゴリセクションを作成
     * @private
     * @param {string} categoryKey - カテゴリキー
     * @param {Object} category - カテゴリ情報
     * @returns {HTMLElement} セクション要素
     */''
    private createCategorySection(categoryKey: keyof TestCategories, category: TestCategory): HTMLElement { ''
        const section = document.createElement('div'');''
        section.className = 'test-category-section';
        section.style.cssText = `;
            margin-bottom: 25px,
            padding: 15px,
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 10px,
        `;
        ';
        // カテゴリヘッダー
        const header = document.createElement('h4); }'
        header.innerHTML = `${category.icon} ${this.localizationManager.getText(category.label})`;
        header.style.cssText = `;
            color: #ffffff;
            font-size: 16px,
            margin-bottom: 15px,
            display: flex;
            align-items: center,
            gap: 10px,
        `;''
        section.appendChild(header);
        ';
        // テストボタングリッド
        const grid = document.createElement('div);
        grid.style.cssText = `;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr);
            gap: 10px;
        `;
        
        category.items.forEach(item => {  );
            const button = this.createTestButton(categoryKey, item); }
            grid.appendChild(button); }
        };

        section.appendChild(grid);
        ';
        // BGMカテゴリには停止ボタンを追加
        if(categoryKey === 'bgm'') {'

            const stopButton = document.createElement('button'');''
            stopButton.className = 'bgm-stop-button';''
            stopButton.textContent = '⏹️ BGM停止';
            stopButton.style.cssText = `;
                width: 100%;
                margin-top: 10px,
                padding: 10px,
                background-color: rgba(255, 0, 0, 0.2);
                border: 2px solid #ff0000;
                color: #ff0000;
                border-radius: 8px,
                cursor: pointer;
                font-size: 14px,
                transition: all 0.3s ease;
            `;

            stopButton.addEventListener('click', () => { ''
                this.stopBGMTest()';
                stopButton.style.transform = 'scale(0.95)';

        }

                setTimeout(() => {' }'

                    stopButton.style.transform = 'scale(1)'; }

                }, 100);''
            }');

            stopButton.addEventListener('mouseenter', () => {  ' }

                stopButton.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';' }

            }');

            stopButton.addEventListener('mouseleave', () => {  ' }

                stopButton.style.backgroundColor = 'rgba(255, 0, 0, 0.2)'; }
            });
            
            section.appendChild(stopButton);
        }
        
        return section;
    }
    
    /**
     * テストボタンを作成
     * @private
     * @param {string} categoryKey - カテゴリキー
     * @param {Object} item - アイテム情報
     * @returns {HTMLElement} ボタン要素'
     */''
    private createTestButton(categoryKey: keyof TestCategories, item: TestItem): HTMLElement { ''
        const button = document.createElement('button'');''
        button.className = 'test-button';
        button.textContent = item.label;
        button.style.cssText = `';
            padding: 10px,
            background-color: rgba(0, 255, 255, 0.1);
            border: 2px solid #00ffff;
            color: #ffffff;
            border-radius: 8px,
            cursor: pointer;
            font-size: 12px,
            transition: all 0.3s ease;
            white-space: nowrap,
            overflow: hidden;
            text-overflow: ellipsis,
        `;

        button.addEventListener('click', () => { ''
            this.playTestSound(categoryKey, item);
            ';
            // ボタンアニメーション
            button.style.transform = 'scale(0.95)';''
            button.style.backgroundColor = 'rgba(0, 255, 255, 0.3)';''
            setTimeout(() => {''
                button.style.transform = 'scale(1)';' }

                button.style.backgroundColor = 'rgba(0, 255, 255, 0.1)';' }

            }, 200');
        };

        button.addEventListener('mouseenter', () => {  ''
            button.style.backgroundColor = 'rgba(0, 255, 255, 0.2)';' }

            button.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.5)'; }
        };

        button.addEventListener('mouseleave', () => {  ''
            button.style.backgroundColor = 'rgba(0, 255, 255, 0.1)';' }

            button.style.boxShadow = 'none'; }
        };
        
        return button;
    }
    
    /**
     * 一括テストセクションを作成
     * @private
     * @returns {HTMLElement} セクション要素'
     */''
    private createBatchTestSection()';
        const section = document.createElement('div'');''
        section.className = 'batch-test-section';
        section.style.cssText = `;
            margin-top: 30px,
            padding: 20px,
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 10px,
            border: 2px solid #333333;
        `;

        const title = document.createElement('h4'');''
        title.textContent = this.localizationManager.getText('audio.test.batchTest);
        title.style.cssText = `;
            color: #ffffff;
            font-size: 16px,
            margin-bottom: 15px,
        `;''
        section.appendChild(title);

        const buttonContainer = document.createElement('div'');
        buttonContainer.style.cssText = `;
            display: flex;
            gap: 10px;
            flex-wrap: wrap,
        `;
        
        // 各カテゴリの一括テストボタン
        const batchTests: BatchTest[] = ['';
            { id: 'all_bubbles', label: '全泡音テスト', category: 'bubbles', icon: '🫧' ,},''
            { id: 'all_combo', label: '全コンボ音テスト', category: 'combo', icon: '🔥' ,},''
            { id: 'all_ui', label: '全UI音テスト', category: 'ui', icon: '🖱️' ,},''
            { id: 'all_achievement', label: '全実績音テスト', category: 'achievement', icon: '🏆' ,},]'
            { id: 'all_gamestate', label: '全ゲーム状態音テスト', category: 'gameState', icon: '🎮' ,}]
        ];

        batchTests.forEach(test => {  ');''
            const button = document.createElement('button'');' }

            button.className = 'batch-test-button'; }
            button.innerHTML = `${test.icon} ${test.label}`;
            button.style.cssText = `';
                padding: 12px 20px,
                background-color: rgba(255, 165, 0, 0.2);
                border: 2px solid #ffa500;
                color: #ffa500;
                border-radius: 8px,
                cursor: pointer;
                font-size: 14px,
                transition: all 0.3s ease;
            `;

            button.addEventListener('click', () => { this.runBatchTest(test.category);' }

            }');

            button.addEventListener('mouseenter', () => {  ''
                button.style.backgroundColor = 'rgba(255, 165, 0, 0.3)';' }

                button.style.boxShadow = '0 0 10px rgba(255, 165, 0, 0.5)';' }

            }');

            button.addEventListener('mouseleave', () => {  ''
                button.style.backgroundColor = 'rgba(255, 165, 0, 0.2)';' }

                button.style.boxShadow = 'none'; }
            });
            
            buttonContainer.appendChild(button);
        };

        section.appendChild(buttonContainer);
        ';
        // 進捗表示
        const progressContainer = document.createElement('div'');''
        progressContainer.id = 'batch-test-progress';
        progressContainer.style.cssText = `;
            margin-top: 15px,
            display: none;
        `;

        const progressBar = document.createElement('div'');
        progressBar.style.cssText = `;
            width: 100%;
            height: 20px;
            background-color: #333333,
            border-radius: 10px,
            overflow: hidden;
        `;

        const progressFill = document.createElement('div'');''
        progressFill.id = 'batch-test-progress-fill';
        progressFill.style.cssText = `;
            height: 100%;
            width: 0%;
            background-color: #00ff00,
            transition: width 0.3s ease,
        `;''
        progressBar.appendChild(progressFill);

        const progressText = document.createElement('div'');''
        progressText.id = 'batch-test-progress-text';
        progressText.style.cssText = `;
            color: #ffffff;
            font-size: 14px,
            margin-top: 10px,
            text-align: center,
        `;
        
        progressContainer.appendChild(progressBar);
        progressContainer.appendChild(progressText);
        section.appendChild(progressContainer);
        
        return section;
    }
    
    /**
     * テスト音を再生
     * @private
     * @param {string} categoryKey - カテゴリキー
     * @param {Object} item - アイテム情報
     */'
    private playTestSound(categoryKey: keyof TestCategories, item: TestItem): void { try {'
            switch(categoryKey) {'
                ';

            }

                case 'bubbles':' }

                    (this.audioManager, as any').playBubbleSound?.(item.id, 0, { volume: 0.7 };
                    break;

                case 'combo':;
                    if(item.value !== undefined && item.value <= 5) {
                        
                    }
                        (this.audioManager, as any).playComboSound?.(item.value, { volume: 0.7 } else if (item.value !== undefined) { // マイルストーン音' }'

                        (this.audioManager, as any').playComboMilestoneSound?.(item.value, { volume: 0.7 }
                    break;

                case 'ui':'';
                    (this.audioManager as any').playUISound?.(item.id, { volume: 0.7 };
                    break;

                case 'achievement':';
                    if (item.progress !== undefined) { ' }'

                        (this.audioManager, as any').playAchievementProgressSound?.(item.progress, 'score', { volume: 0.7 } else { }'

                        (this.audioManager as any').playAchievementSound?.(item.id, { volume: 0.7 }
                    break;

                case 'gameState':;
                    if(item.countdown !== undefined) {
                        
                    }
                        (this.audioManager, as any).playCountdownSound?.(item.countdown, { volume: 0.7 } else { }'

                        (this.audioManager as any').playGameStateSound?.(item.id, { volume: 0.7 }
                    break;

                case 'bgm':;
                    this.playBGMTest(item.id);

                    break;''
            } catch (error) { this.errorHandler.handleError(error, 'AUDIO_TEST_ERROR', {)
                category: categoryKey,);
                item: item ,}
    }
    
    /**
     * BGMテストを再生
     * @private
     * @param {string} trackName - トラック名
     */
    private async playBGMTest(trackName: string): Promise<void> { try {
            // 既存のBGMを停止
            if (this.activeBGMTrack && this.activeBGMTrack !== trackName) { }
                await (this.audioManager, as any).stopBGM?.({ fadeOutDuration: 0.5 }
            
            // 新しいBGMを再生
            await (this.audioManager, as any).playBGM? .(trackName, { : undefined
                volume: 0.5);
                fadeInDuration: 1.0 ,});
            ;
            this.activeBGMTrack = trackName;
            
            // BGMボタンの状態を更新
            this.updateBGMButtonStates(trackName);

        } catch (error) { this.errorHandler.handleError(error, 'AUDIO_TEST_ERROR', {)'
                operation: 'playBGMTest',);
                trackName: trackName ,}
    }
    
    /**
     * BGMテストを停止
     * @private
     */
    private async stopBGMTest(): Promise<void> { try { }
            await (this.audioManager, as any).stopBGM?.({ fadeOutDuration: 0.5 };
            this.activeBGMTrack = null;

            this.updateBGMButtonStates(null);''
        } catch (error) { this.errorHandler.handleError(error, 'AUDIO_TEST_ERROR', {)'
                operation: 'stopBGMTest' ,}
    }
    
    /**
     * BGMボタンの状態を更新
     * @private
     * @param {string|null} activeTrack - アクティブなトラック名
     */'
    private updateBGMButtonStates(activeTrack: string | null): void { ''
        if(!this.panel) return;

        const bgmButtons = this.panel.querySelectorAll('.test-category-section: last-of-type .test-button),
        bgmButtons.forEach((button: Element, index: number) => { 
            const htmlButton = button as HTMLButtonElement;

            const item = this.testCategories.bgm.items[index];''
            if(item && item.id === activeTrack) {'
                ';

            ,}

                htmlButton.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';' }

                htmlButton.style.borderColor = '#00ff00'; }

            } else {
                htmlButton.style.backgroundColor = 'rgba(0, 255, 255, 0.1)';' }

                htmlButton.style.borderColor = '#00ffff'; }
}
    
    /**
     * 一括テストを実行
     * @private
     * @param {string} categoryKey - カテゴリキー
     */'
    private async runBatchTest(categoryKey: keyof, TestCategories): Promise<void> { const category = this.testCategories[categoryKey];''
        if(!category) return;
        ';
        // 進捗表示を表示
        const progressContainer = document.getElementById('batch-test-progress'');''
        const progressFill = document.getElementById('batch-test-progress-fill'');''
        const progressText = document.getElementById('batch-test-progress-text);

        if(progressContainer) {'
            ';

        }

            progressContainer.style.display = 'block'; }
        }
        ';

        const items = category.items;''
        const delay = categoryKey === 'bgm' ? 3000 : 500; // BGMは長めに
        
        for(let, i = 0; i < items.length; i++) {
        
            const item = items[i];
            const progress = ((i + 1) / items.length) * 100;
            
            // 進捗を更新
        
        }
            if (progressFill) { }
                progressFill.style.width = `${progress}%`;
            }
            if(progressText) {
                
            }
                progressText.textContent = `${item.label} (${i + 1}/${items.length})`;
            }
            
            // 音を再生
            this.playTestSound(categoryKey, item);
            
            // 次の音まで待機
            await new Promise(resolve => setTimeout(resolve, delay);
        }
        
        // 完了表示
        if(progressText) {
            
        }
            progressText.textContent = `✅ ${category.label}テスト完了！`;
        }
        
        // 3秒後に進捗表示を隠す
        setTimeout(() => {  ''
            if(progressContainer) {' }'

                progressContainer.style.display = 'none'; }

            }''
            if(progressFill) {'
                ';

            }

                progressFill.style.width = '0%'; }
}, 3000);
    }
    
    /**
     * パネルを開く
     * @param {HTMLElement} container - 表示先のコンテナ
     */'
    open(container: HTMLElement): void { if (!this.panel) {''
            this.panel = this.createPanel()';
        container.innerHTML = '';)
        container.appendChild(this.panel);
        this.isOpen = true; }
    
    /**
     * パネルを閉じる
     */
    close(): void { if (this.panel && this.panel.parentNode) {
            this.panel.parentNode.removeChild(this.panel); }
        this.isOpen = false;
        
        // BGMを停止
        if (this.activeBGMTrack) { this.stopBGMTest(); }
    }
    
    /**
     * リソースの解放
     */
    dispose(): void { ''
        this.close(' })'