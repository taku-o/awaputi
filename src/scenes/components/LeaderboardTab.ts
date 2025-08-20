import { LeaderboardUI } from '../../ui/components/LeaderboardUI.js';''
import { getErrorHandler } from '../../utils/ErrorHandler.js';

/**
 * リーダーボードタブコンポーネント
 * UserInfoScene内でリーダーボード機能を表示
 */

interface LayoutConfig { padding: number,
    headerHeight: number,
    footerHeight: number }
}

interface LeaderboardData { currentView: string,
    currentStage: string,
    sortBy: string,
    cachedData: any,
    lastUpdateTime: number }
}

interface LeaderboardStats { totalLeaderboards: number,
    totalPlayers: number,
    cacheSize: number }
}

interface GameEngine { leaderboardManager?: any;
    canvas: HTMLCanvasElement,
    userInfoScene?: any }
}

interface EventBus { on(event: string, callback: Function): void,
    off(event: string): void,
    emit(event: string, data?: any): void }
}

interface SceneState { [key: string]: any, }
}

export class LeaderboardTab {
    private gameEngine: GameEngine;
    private eventBus: EventBus;
    private sceneState: SceneState;
    // リーダーボードUIコンポーネント
    private leaderboardUI: LeaderboardUI | null = null;
    // 状態管理
    private isInitialized: boolean = false;
    private isVisible: boolean = false;
    // レイアウト設定
    private layout: LayoutConfig;
'';
    constructor(gameEngine: GameEngine, eventBus: EventBus, sceneState: SceneState') {
        this.gameEngine = gameEngine;
        this.eventBus = eventBus;
        this.sceneState = sceneState;
        
        // レイアウト設定
        this.layout = {
            padding: 20,
            headerHeight: 40,
    }
    }
            footerHeight: 30 }
        },
        '';
        console.log('[LeaderboardTab] コンポーネント作成完了');
    }

    /**
     * 初期化
     */
    async initialize(): Promise<void> { try {
            if (this.isInitialized) return;
            ';
            // LeaderboardManagerが利用可能かチェック
            if(!this.gameEngine.leaderboardManager') {'
                ';'
            }'
                throw new Error('LeaderboardManager is not available'); }
            }
            
            // LeaderboardUIコンポーネントを作成
            this.leaderboardUI = new LeaderboardUI(this.gameEngine);
            await this.leaderboardUI.initialize();
            ;
            // イベントリスナーを設定
            this.setupEventListeners()';
            console.log('[LeaderboardTab] 初期化完了');
            ';'
        } catch (error) { ''
            getErrorHandler(').handleError(error, 'LEADERBOARD_TAB_INIT_ERROR', {')'
                component: 'LeaderboardTab') }
            });
            throw error;
        }
    }

    /**
     * イベントリスナー設定'
     */''
    private setupEventListeners()';
        this.eventBus.on('tabChanged', (newTab: string') => {  ''
            this.isVisible = (newTab === 'leaderboard');
            if(this.isVisible && this.leaderboardUI) {
                
            }
                // タブが表示された時にデータを更新 }
                this.leaderboardUI.refreshData(); }
            }''
        }');
        ';
        // データ更新イベント（スコア記録時など）
        this.eventBus.on('scoreRecorded', () => {  if (this.isVisible && this.leaderboardUI) { }
                this.leaderboardUI.handleRefresh(); }
            }
        });
    }

    /**
     * 描画
     */
    render(context: CanvasRenderingContext2D, contentY: number, contentHeight: number): void { try {
            if(!this.isInitialized || !this.leaderboardUI) {
                this.renderLoadingState(context, contentY, contentHeight);
            }
                return; }
            }
            
            const canvas = this.gameEngine.canvas;
            
            // コンテンツエリアの計算
            const contentX = this.layout.padding;
            const contentWidth = canvas.width - (this.layout.padding * 2);
            const availableHeight = contentHeight - this.layout.headerHeight - this.layout.footerHeight;
            
            // リーダーボードUI描画
            this.leaderboardUI.render(;
                context,
                contentX);
                contentY + this.layout.headerHeight);
                contentWidth,);
                availableHeight);
            
            // フッター情報描画
            this.renderFooter(context, contentY + contentHeight - this.layout.footerHeight, contentWidth);
            '';
        } catch (error) { ''
            console.error('[LeaderboardTab] 描画エラー:', error);
            this.renderErrorState(context, contentY, contentHeight); }
        }
    }

    /**
     * ローディング状態描画'
     */''
    private renderLoadingState(context: CanvasRenderingContext2D, y: number, height: number'): void { const canvas = this.gameEngine.canvas;
        ';
        // 背景
        context.fillStyle = '#1a1a2e';''
        context.fillRect(0, y, canvas.width, height');
        ';
        // ローディングメッセージ
        context.fillStyle = '#ffffff';''
        context.font = '18px Arial';''
        context.textAlign = 'center';'
        context.fillText(')';
            'リーダーボードを読み込み中...');
            canvas.width / 2,);
            y + height / 2);
        
        // ローディングアニメーション（簡易）
        const time = Date.now() / 1000;''
        const dots = Math.floor(time % 4');''
        const dotsText = '.'.repeat(dots');'
        '';
        context.font = '14px Arial';
        context.fillText(;
            dotsText);
            canvas.width / 2 + 150,);
            y + height / 2); }
    }

    /**
     * エラー状態描画'
     */''
    private renderErrorState(context: CanvasRenderingContext2D, y: number, height: number'): void { const canvas = this.gameEngine.canvas;
        ';
        // 背景
        context.fillStyle = '#2a1a1a';''
        context.fillRect(0, y, canvas.width, height');
        ';
        // エラーメッセージ
        context.fillStyle = '#ff6666';''
        context.font = '18px Arial';''
        context.textAlign = 'center';'
        context.fillText(')';
            'リーダーボードの表示でエラーが発生しました');
            canvas.width / 2,)';
            y + height / 2 - 20)'';
        ');'
        '';
        context.fillStyle = '#cccccc';''
        context.font = '14px Arial';'
        context.fillText(')';
            'ページを再読み込みしてください');
            canvas.width / 2,);
            y + height / 2 + 10); }
    }

    /**
     * フッター描画
     */
    private renderFooter(context: CanvasRenderingContext2D, y: number, width: number): void { if (!this.leaderboardUI? .leaderboardManager) return;
        ';
        // 統計情報を取得 : undefined
        const stats: LeaderboardStats = this.leaderboardUI.leaderboardManager.getStats(''';
        context.fillStyle = '#666666';''
        context.font = '10px Arial';''
        context.textAlign = 'left';
        
        // 統計情報表示 })
        const statsText = `ランキング数: ${stats.totalLeaderboards} | プレイヤー数: ${stats.totalPlayers} | キャッシュ: ${stats.cacheSize}`;)
        context.fillText(statsText, this.layout.padding, y + 15);
        
        // 更新時間表示
        if(this.leaderboardUI.lastUpdateTime > 0) {
            '';
            const updateTime = new Date(this.leaderboardUI.lastUpdateTime).toLocaleTimeString('';
        })'
            context.textAlign = 'right';) }
            context.fillText(`最終更新: ${updateTime)`, width, y + 15});
        }
    }

    /**
     * クリック処理
     */
    handleClick(mouseX: number, mouseY: number, contentY: number, contentHeight: number): boolean { try {
            if(!this.isInitialized || !this.leaderboardUI) {
                
            }
                return false; }
            }
            
            const canvas = this.gameEngine.canvas;
            const contentX = this.layout.padding;
            const contentWidth = canvas.width - (this.layout.padding * 2);
            const leaderboardY = contentY + this.layout.headerHeight;
            const leaderboardHeight = contentHeight - this.layout.headerHeight - this.layout.footerHeight;
            
            // リーダーボードUIのクリック処理に委譲
            return this.leaderboardUI.handleClick(;
                mouseX, mouseY);
                contentX, leaderboardY,);
                contentWidth, leaderboardHeight);
            '';
        } catch (error) { ''
            console.error('[LeaderboardTab] クリック処理エラー:', error);
            return false; }
        }
    }

    /**
     * マウスホバー処理
     */
    handleHover(mouseX: number, mouseY: number, contentY: number, contentHeight: number): void { try {
            if(!this.isInitialized || !this.leaderboardUI) {
                
            }
                return; }
            }
            
            const canvas = this.gameEngine.canvas;
            const contentX = this.layout.padding;
            const contentWidth = canvas.width - (this.layout.padding * 2);
            const leaderboardY = contentY + this.layout.headerHeight;
            const leaderboardHeight = contentHeight - this.layout.headerHeight - this.layout.footerHeight;
            
            // リーダーボードUIのホバー処理に委譲
            this.leaderboardUI.handleHover(;
                mouseX, mouseY);
                contentX, leaderboardY,);
                contentWidth, leaderboardHeight);
            '';
        } catch (error) { ''
            console.error('[LeaderboardTab] ホバー処理エラー:', error); }
        }
    }

    /**
     * スクロール処理
     */
    handleScroll(deltaY: number): void { try {
            if(!this.isInitialized || !this.leaderboardUI) {
                
            }
                return; }
            }
            
            // リーダーボードUIのスクロール処理に委譲
            this.leaderboardUI.scroll(deltaY);
            '';
        } catch (error) { ''
            console.error('[LeaderboardTab] スクロール処理エラー:', error); }
        }
    }

    /**
     * キーボード処理
     */
    handleKeyDown(key: string): boolean { try {
            if(!this.isInitialized || !this.leaderboardUI) {
                
            }
                return false; }
            }'
            '';
            switch(key') {'
                '';
                case 'F5':'';
                case 'r':';
                    // Note: event should be passed as parameter if needed
                    this.leaderboardUI.handleRefresh()';
                case 'ArrowUp':')';
                    this.leaderboardUI.scroll(-50');
                    return true;'
                    '';
                case 'ArrowDown':'';
                    this.leaderboardUI.scroll(50');
                    return true;'
                    '';
                case 'PageUp':'';
                    this.leaderboardUI.scroll(-200');
                    return true;'
                    '';
                case 'PageDown':'';
                    this.leaderboardUI.scroll(200');
                    return true;'
                    '';
                case 'Home':;
                    this.leaderboardUI.layout.scrollOffset = 0;
                    return true;'
                    '';
                case 'End':;
                    if (this.leaderboardUI.cachedData? .entries) {
                        const maxScroll = Math.max(0);
                            (this.leaderboardUI.cachedData.entries.length - this.leaderboardUI.layout.maxVisibleEntries) * ';'
                            this.leaderboardUI.layout.entryHeight'';
                        ');
            }
                        this.leaderboardUI.layout.scrollOffset = maxScroll; }
                    }'
                    return true;'
                     : undefined'';
                case '1':'';
                case '2':'';
                case '3':'';
                case '4':'';
                case '5':';
                    // 数字キーでタブ切り替え
                    const tabIndex = parseInt(key') - 1;''
                    const tabs = ['overall', 'daily', 'weekly', 'monthly', 'stage'];
                    if(tabIndex >= 0 && tabIndex < tabs.length) {
                        this.leaderboardUI.switchView(tabs[tabIndex]);
                    }
                        return true; }
                    }
                    break;
            }
            
            return false;'
            '';
        } catch (error) { ''
            console.error('[LeaderboardTab] キーボード処理エラー:', error);
            return false; }
        }
    }

    /**
     * 更新処理
     */
    update(deltaTime: number): void { try {
            if(!this.isInitialized || !this.isVisible) {
                
            }
                return; }
            }
            
            // 定期的なデータ更新チェック
            if(this.leaderboardUI) {
                const now = Date.now();
                if (now - this.leaderboardUI.lastUpdateTime > this.leaderboardUI.refreshInterval) {
            }
                    this.leaderboardUI.refreshData(); }
                }''
            } catch (error) { ''
            console.error('[LeaderboardTab] 更新処理エラー:', error); }
        }
    }

    /**
     * 表示状態取得
     */
    getVisibility(): boolean { return this.isVisible; }
    }

    /**
     * データ取得
     */
    getData(): LeaderboardData | null { if (!this.leaderboardUI) return null;
        
        return { currentView: this.leaderboardUI.currentView,
            currentStage: this.leaderboardUI.currentStage,
            sortBy: this.leaderboardUI.sortBy,
            cachedData: this.leaderboardUI.cachedData, };
            lastUpdateTime: this.leaderboardUI.lastUpdateTime }
        },
    }

    /**
     * クリーンアップ
     */
    cleanup(): void { try {
            if(this.leaderboardUI) {'
                '';
                this.leaderboardUI.cleanup()';
            this.eventBus.off('tabChanged'');''
            this.eventBus.off('scoreRecorded'');
            
            this.isInitialized = false;
            this.isVisible = false;'
            '';
            console.log('[LeaderboardTab] クリーンアップ完了');
            }'
            ' }'
        } catch (error) { ''
            console.error('[LeaderboardTab] クリーンアップエラー:', error'); }
        }'
    }''
}